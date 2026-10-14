# Event loop и асинхронность

> ⏱ ~5 ч · 🎯 Описывать event loop по HTML-спецификации (задачи, microtask checkpoint, шаг рендеринга), безошибочно решать задачи на порядок вывода, включая тонкости `await` и возврата промиса из `then`, проектировать отмену и конкурентность через `AbortController` и комбинаторы Promise.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу описать одну итерацию event loop браузера, включая рендеринг и `requestAnimationFrame`
- [ ] Знаю, что ставит макрозадачи, а что — микрозадачи; чем отличается Node.js
- [ ] Знаю, сколько микротиков «стоит» `await` и возврат промиса из `then`
- [ ] Различаю `all` / `allSettled` / `race` / `any`, знаю `withResolvers`
- [ ] Умею отменять цепочку операций через `AbortSignal` (`timeout`, `any`)

## Теория

### Модель исполнения

JS выполняется в одном потоке на агент (окно, воркер): один **call stack**, **куча** и **event loop**. Асинхронность обеспечивает окружение (браузер, Node), которое по готовности ставит колбэки в очереди.

- **Задача (task, «макрозадача»)**: выполнение скрипта, колбэки `setTimeout`/`setInterval`, события ввода, `MessageChannel`/`postMessage`, сетевые колбэки, `setImmediate` (Node). В браузере очередей задач **несколько** (по task source), и браузер сам выбирает, из какой брать: ввод пользователя обычно приоритизируется.
- **Микрозадача (microtask)**: реакции промисов (`then`/`catch`/`finally`, продолжение после `await`), `queueMicrotask`, `MutationObserver`. Очередь одна.

### Одна итерация event loop в браузере

1. Взять **одну** задачу из выбранной очереди и выполнить её до конца.
2. **Microtask checkpoint**: выполнять микрозадачи, пока очередь не опустеет, включая добавленные по ходу.
3. Если есть возможность рендеринга (обычно раз в кадр, ~16.7 мс при 60 Гц, и вкладка видима) — **update the rendering**:
   - события `resize`/`scroll`, media queries, анимации;
   - колбэки `requestAnimationFrame`;
   - пересчёт стилей и layout;
   - `ResizeObserver`, затем `IntersectionObserver`;
   - paint (компоновка — в отдельном потоке compositor).
4. Если до следующего кадра есть время — `requestIdleCallback`.

Важно: microtask checkpoint выполняется не только после задачи, а **каждый раз, когда стек JS опустевает** после вызова колбэка — например, между обработчиками одного события, отправленного пользователем.

```js
btn.addEventListener('click', () => { Promise.resolve().then(() => console.log('m1')); console.log('l1'); });
btn.addEventListener('click', () => { Promise.resolve().then(() => console.log('m2')); console.log('l2'); });
// Клик мышью:     l1 m1 l2 m2  — после каждого обработчика стек пуст → checkpoint
// btn.click():    l1 l2 m1 m2  — на стеке остаётся вызвавший скрипт, checkpoint после него
```

🪤 Ловушка: бесконечно порождающиеся микрозадачи (`function loop() { queueMicrotask(loop) }`) **блокируют рендер и ввод навсегда** — в отличие от `setTimeout`-рекурсии, которая даёт браузеру отрисоваться между задачами.

### Таймеры и планирование

- `setTimeout(fn, 0)` — не «сразу», а «не раньше чем»: при вложенности ≥ 5 уровней задержка зажимается до 4 мс; в фоновых вкладках таймеры троттлятся до 1 раза в секунду и реже.
- Для анимаций — `requestAnimationFrame` (синхронизирован с кадрами, не вызывается в фоне). `setTimeout` для анимаций даёт рывки и лишнюю работу.
- **Long task** — задача > 50 мс. Она блокирует ввод и ухудшает INP. Дробление: `await scheduler.yield()` (Chromium), `setTimeout(0)`/`MessageChannel` как фолбэк, `scheduler.postTask(fn, { priority })`, вынос в Web Worker.

```js
async function processInChunks(items, handle, chunkMs = 8) {
  let deadline = performance.now() + chunkMs;
  for (const item of items) {
    handle(item);
    if (performance.now() >= deadline) {
      // уступаем поток: браузер обработает ввод и отрисует кадр
      await (globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r, 0)));
      deadline = performance.now() + chunkMs;
    }
  }
}
```

### Node.js: отличия

Event loop libuv состоит из фаз: **timers** → pending callbacks → **poll** (I/O) → **check** (`setImmediate`) → close callbacks. Между каждым колбэком выполняются сначала очередь `process.nextTick`, затем микрозадачи промисов.

- `process.nextTick` срабатывает **раньше** промисов и может «уморить голодом» I/O.
- `setTimeout(0)` vs `setImmediate` в главном модуле — порядок недетерминирован; внутри I/O-колбэка `setImmediate` всегда первым.
- В ESM-модуле Node код выполняется уже внутри асинхронной загрузки, поэтому порядок `nextTick` относительно промисов на верхнем уровне может отличаться от CommonJS — не стоит строить на этом логику.

### Promise: устройство

Состояния: `pending` → `fulfilled` | `rejected` (settled, необратимо). `then` всегда возвращает **новый** промис, колбэки вызываются асинхронно (микрозадачей), даже если промис уже выполнен.

**Thenable-ассимиляция**: если промис резолвится объектом с методом `then`, спецификация ставит отдельную микрозадачу `NewPromiseResolveThenableJob`, которая вызывает `thenable.then(resolve, reject)`. Это стоит **два лишних микротика**. Поэтому возврат промиса из `then` или `resolve(promise)` «опаздывает» относительно возврата значения.

`await v`: с ES2019 (await optimization) для нативного промиса — 1 микротик (`PerformPromiseThen` напрямую), для не-промиса — тоже 1 (оборачивается в `Promise.resolve`). Для произвольного thenable — дольше.

```js
// Знаменитая задача: почему 4 между 3 и 5?
Promise.resolve()
  .then(() => { console.log(0); return Promise.resolve(4); }) // +2 тика на ассимиляцию
  .then((x) => console.log(x));
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3))
  .then(() => console.log(5))
  .then(() => console.log(6));
// 0 1 2 3 4 5 6
```

**Необработанные отклонения**: событие `unhandledrejection` в браузере, в Node с v15 — падение процесса по умолчанию. Промис считается обработанным, если обработчик навешен до окончания текущего checkpoint; позже — `rejectionhandled`.

### Комбинаторы

| Метод | Резолвится | Реджектится | Пустой массив | Типичное применение |
|---|---|---|---|---|
| `Promise.all` | Когда все fulfilled → массив значений в исходном порядке | При **первом** reject (fail-fast), остальные продолжают выполняться | `[]` сразу | Зависимые данные, без которых экран не имеет смысла |
| `Promise.allSettled` | Когда все settled → `{status, value \| reason}[]` | Никогда | `[]` | Независимые виджеты, батч-операции с отчётом |
| `Promise.race` | Первым settled (любой исход) | Первым settled | Вечно pending | Таймауты (но лучше `AbortSignal.timeout`) |
| `Promise.any` | Первым fulfilled | Когда все rejected → `AggregateError` | `AggregateError` сразу | Зеркала/CDN, fallback-источники |

Новые API:
- `Promise.withResolvers()` (ES2024) — `{ promise, resolve, reject }` без замыкания конструктора. Удобно для «deferred»: очереди, ожидание события, адаптеры колбэчных API.
- `Promise.try(fn)` (ES2025) — запускает `fn` синхронно и превращает и синхронное исключение, и результат в промис.

```js
function waitForEvent(target, type, { signal } = {}) {
  const { promise, resolve, reject } = Promise.withResolvers();
  target.addEventListener(type, resolve, { once: true, signal });
  signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
  return promise;
}
```

🪤 Ловушка: `Promise.all` не отменяет оставшиеся операции при ошибке — они продолжают грузить сеть. Отмена — только через общий `AbortController`.

### async/await

`async`-функция всегда возвращает промис; `await` приостанавливает её, освобождая стек; продолжение — микрозадача. Концептуально это генератор + раннер промисов.

```js
// Последовательно — сумма времён
const user = await getUser();
const posts = await getPosts();

// Параллельно — максимум из времён
const [user2, posts2] = await Promise.all([getUser(), getPosts()]);

// forEach не ждёт async-колбэки
ids.forEach(async (id) => await save(id));     // ошибки потеряются, порядок не гарантирован
for (const id of ids) await save(id);          // последовательно
await Promise.all(ids.map((id) => save(id)));  // параллельно без лимита — см. pool в 08
```

`return await` внутри `try` нужен, чтобы `catch` поймал отклонение; вне `try` он ещё и дешевле на микротики, чем `return promise`, и сохраняет функцию в async stack trace. Правило ESLint `no-return-await` устарело и удалено из рекомендованных.

Асинхронная итерация: `for await (const chunk of stream)`, `Array.fromAsync(asyncIterable)` (ES2024).

### Отмена: AbortController и AbortSignal

Отмена в JS **кооперативная**: промис нельзя «убить», можно только договориться, что операция проверяет сигнал.

```js
async function search(query, { signal }) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    // общий сигнал от вызывающего + собственный таймаут
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
  });
  signal.throwIfAborted();          // проверка между шагами
  return res.json();
}

let current;
input.addEventListener('input', async (e) => {
  current?.abort(new DOMException('Superseded', 'AbortError')); // latest wins: отменяем прошлый запрос
  current = new AbortController();
  try {
    render(await search(e.target.value, { signal: current.signal }));
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') return; // не ошибка UX
    showError(err);
  }
});
```

- `AbortSignal.timeout(ms)` реджектит с `TimeoutError`, `abort()` — с `AbortError` (или переданным `reason`).
- `AbortSignal.any([...])` — композиция сигналов.
- Тот же сигнал отменяет `addEventListener` (`{ signal }`), стримы, многие Node API.
- В собственных функциях: проверять `signal.aborted`/`throwIfAborted()` и подписываться на `'abort'`, очищая таймеры и ресурсы.

💡 На собеседовании: race condition «старый ответ перезаписал новый» решается не debounce, а отменой предыдущего запроса (или сравнением id запроса). Debounce лишь уменьшает частоту.

## Вопросы с собеседований

<details><summary>Опишите event loop браузера.</summary>

Один поток, стек вызовов. Цикл: взять одну задачу из одной из очередей (браузер приоритизирует), выполнить; выполнить все микрозадачи до опустошения; при наличии возможности рендеринга — rAF, стили, layout, Resize/IntersectionObserver, paint; в свободное время — `requestIdleCallback`. Для senior: несколько очередей задач с приоритетами, checkpoint после каждого колбэка при пустом стеке, long tasks и их влияние на INP, `scheduler.yield`.
</details>

<details><summary>Чем микрозадачи отличаются от макрозадач? Почему так сделано?</summary>

Задачи берутся по одной, между ними возможен рендер и ввод. Микрозадачи выполняются пачкой сразу после текущего кода, до рендера. Это даёт гарантию: колбэки промиса выполнятся до того, как браузер что-то покажет или обработает другое событие, — согласованность состояния (батчинг DOM-мутаций в `MutationObserver`, батчинг обновлений во фреймворках: Vue `nextTick` основан на микрозадаче). Цена — возможность заблокировать поток бесконечной цепочкой микрозадач.
</details>

<details><summary>Когда выполняется requestAnimationFrame относительно setTimeout и промисов?</summary>

rAF — часть шага рендеринга, перед стилями и layout следующего кадра. Промисы выполнятся раньше (после текущей задачи). `setTimeout(0)` может выполниться как до, так и после rAF в зависимости от того, наступила ли возможность рендеринга. В фоновой вкладке rAF не вызывается вовсе. Изменения DOM внутри rAF попадают в тот же кадр, поэтому для «прочитать layout после отрисовки» используют двойной rAF или `rAF + setTimeout`.
</details>

<details><summary>Что быстрее: return promise или return await promise в async-функции?</summary>

`return await p` — после оптимизации ES2019 это один тик на `await`, затем возврат значения. `return p` резолвит промис функции thenable-объектом — это `NewPromiseResolveThenableJob`, ещё два тика. Плюс `return await` сохраняет фрейм в async stack trace и обязателен внутри `try/catch`. Важно скорее для понимания, чем для производительности.
</details>

<details><summary>Чем отличаются Promise.all, allSettled, race и any?</summary>

`all` — все успешны или первая ошибка (fail-fast). `allSettled` — дождаться всех, никогда не реджектится. `race` — первый завершившийся, любым исходом. `any` — первый успешный, или `AggregateError`, если все упали. Для lead: ни один не отменяет оставшиеся операции — нужен общий AbortController; `race` с пустым массивом висит вечно; для ограничения параллелизма нужен pool.
</details>

<details><summary>Как отменить fetch? А цепочку из нескольких await?</summary>

`fetch(url, { signal })`, где сигнал от `AbortController` или `AbortSignal.timeout`. Для цепочки — прокидывать один сигнал во все операции, между шагами вызывать `signal.throwIfAborted()`, комбинировать с таймаутом через `AbortSignal.any`. Отмена кооперативная: код, не проверяющий сигнал, продолжит работать. Обрабатывать `AbortError` отдельно от реальных ошибок.
</details>

<details><summary>Что такое process.nextTick и чем он отличается от queueMicrotask?</summary>

Node-специфичная очередь, которая обрабатывается перед очередью микрозадач промисов после каждой операции. `queueMicrotask` — стандартная очередь промисов. `nextTick` полезен для эмиссии событий после того, как пользователь успел подписаться, но рекурсивный `nextTick` блокирует I/O. Рекомендация Node — предпочитать `queueMicrotask` в новом коде.
</details>

<details><summary>Почему UI «замерзает» при тяжёлых вычислениях и что с этим делать?</summary>

Задача занимает поток, рендер и обработка ввода ждут её окончания. Решения: разбить работу на чанки с уступанием (`scheduler.yield`, `setTimeout`), перенести в Web Worker (с `transfer` для больших буферов), виртуализация больших списков, `requestIdleCallback` для неприоритетной работы, а в React — concurrent rendering (`useTransition`, `useDeferredValue`). Измерять — Performance panel, Long Animation Frames API, INP в RUM.
</details>

<details><summary>Как обработать ошибку в Promise, созданном без await?</summary>

Навесить `.catch` в том же синхронном коде; иначе при отклонении будет `unhandledrejection`. Глобально — `window.addEventListener('unhandledrejection', ...)` для логирования в Sentry, в Node — `process.on('unhandledRejection')`. Для fire-and-forget — явно `void task().catch(report)`, линтер `@typescript-eslint/no-floating-promises`.
</details>

<details><summary>Зачем нужен Promise.withResolvers?</summary>

Выносит `resolve`/`reject` наружу без паттерна `let resolve; new Promise(r => resolve = r)`. Применения: deferred-объекты в очередях и пулах, адаптация событийных API к промисам, ожидание ответа по id в протоколе поверх WebSocket/postMessage, тесты. Риск — разрешить промис забыли: нужна стратегия таймаута/отмены.
</details>

## Практика

**1. Порядок вывода.**

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
queueMicrotask(() => console.log('3'));
Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
  queueMicrotask(() => console.log('6'));
});
requestAnimationFrame(() => console.log('7'));
(async () => {
  console.log('8');
  await null;
  console.log('9');
})();
console.log('10');
```

<details><summary>Ответ</summary>

`1 8 10 3 4 9 6`, затем `2`, `5` и `7`. Синхронно: 1, 8 (тело async до первого await), 10. Микрозадачи в порядке постановки: 3, 4 (ставит 6 и таймер 5), 9, 6. Далее задачи `2` и `5` в порядке постановки таймеров; `7` — в шаге рендеринга, его позиция относительно `2`/`5` зависит от момента кадра (обычно таймеры раньше, но не гарантировано).
</details>

**2. Порядок вывода с async-функциями.**

```js
async function a1() {
  console.log('a1 start');
  await a2();
  console.log('a1 end');
}
async function a2() { console.log('a2'); }

console.log('script start');
setTimeout(() => console.log('timeout'), 0);
a1();
new Promise((resolve) => {
  console.log('p1');
  resolve();
}).then(() => console.log('p2'));
console.log('script end');
```

<details><summary>Ответ</summary>

`script start, a1 start, a2, p1, script end, a1 end, p2, timeout`. Executor промиса выполняется синхронно. `await` на уже выполненном нативном промисе — один тик, и он поставлен раньше `then` p2. В старых движках (до await optimization) `a1 end` выводился после `p2`.
</details>

**3. `then` с промисом и `finally`.**

```js
Promise.reject(new Error('x'))
  .finally(() => console.log('f1'))
  .catch((e) => { console.log('c', e.message); return 'ok'; })
  .finally(() => 'ignored')
  .then((v) => console.log('t', v));
```

<details><summary>Ответ</summary>

`f1`, `c x`, `t ok`. `finally` не получает аргументов и прозрачно передаёт исход дальше; его возвращаемое значение игнорируется (кроме случая, когда он бросает или возвращает отклонённый промис — тогда исход заменяется ошибкой).
</details>

**4. Реализуйте `sleep(ms, { signal })` с поддержкой отмены и очисткой таймера.**

<details><summary>Решение</summary>

```js
function sleep(ms, { signal } = {}) {
  if (signal?.aborted) return Promise.reject(signal.reason);
  const { promise, resolve, reject } = Promise.withResolvers();
  const onAbort = () => {
    clearTimeout(id);
    reject(signal.reason);
  };
  const id = setTimeout(() => {
    signal?.removeEventListener('abort', onAbort);
    resolve();
  }, ms);
  signal?.addEventListener('abort', onAbort, { once: true });
  return promise;
}
```
Edge-cases: уже отменённый сигнал, утечка слушателя на долгоживущем сигнале (поэтому `removeEventListener` при успехе).
</details>

**5. Реализуйте `withTimeout(promiseFactory, ms)`, который отменяет операцию по таймауту, а не просто перестаёт её ждать.**

<details><summary>Решение</summary>

```js
async function withTimeout(factory, ms, outerSignal) {
  const signals = [AbortSignal.timeout(ms)];
  if (outerSignal) signals.push(outerSignal);
  const signal = AbortSignal.any(signals);
  return factory(signal);          // factory обязана передать signal в fetch / sleep и т.п.
}
// await withTimeout((signal) => fetch('/api', { signal }), 3000);
```
Ключевой момент: `Promise.race([p, timeout])` лишь перестаёт ждать — запрос продолжает работать и тратить ресурсы.
</details>

Другие задачи на асинхронность (полифиллы `Promise.all`/`allSettled`, retry, pool) — в [08-practice-tasks.md](08-practice-tasks.md).

## Источники
- https://learn.javascript.ru/event-loop
- https://learn.javascript.ru/microtask-queue
- https://learn.javascript.ru/promise-basics
- https://learn.javascript.ru/promise-chaining
- https://learn.javascript.ru/promise-api
- https://learn.javascript.ru/async-await
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
- https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
- https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
- https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model
- https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
- https://v8.dev/blog/fast-async
- https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
