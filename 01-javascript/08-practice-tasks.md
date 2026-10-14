# Практические задачи для live-coding

> ⏱ ~6 ч · 🎯 Написать любую задачу ниже с нуля за 10–15 минут, проговаривая API, edge-cases и сложность; уметь развить решение по запросу интервьюера (отмена, `this`, ошибки, память).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Тайминг: debounce, throttle
- [ ] Асинхронность: `Promise.all`, `allSettled`, retry, pool
- [ ] Структуры данных: deepClone, deepEqual, EventEmitter, LRU
- [ ] Функциональные: curry, compose/pipe, memoize, flat, bind

## Теория

### Как решать задачу на собеседовании

1. **Уточнить контракт** (1–2 мин): сигнатура, что возвращаем, нужен ли `this`, что с ошибками, синхронно или асинхронно. Интервьюер часто держит в запасе «а теперь добавьте отмену» — проектируйте с местом под расширение.
2. **Назвать edge-cases вслух** до кода: пустой ввод, циклы, `NaN`, `-0`, дыры в массивах, исключения в колбэках, повторные вызовы.
3. **Простое рабочее решение → улучшения.** Лучше рабочее за 7 минут, чем идеальное, не дописанное за 15.
4. **Прогнать пример руками** и назвать сложность по времени и памяти.
5. Для senior: упомянуть, как это сделано в продакшене (lodash, p-limit, p-retry) и почему вы бы взяли библиотеку или нет.

Общие правила для обёрток: возвращать обычную `function`, пробрасывать `this` и аргументы через `apply`, не терять возвращаемое значение и исключения.

## Вопросы с собеседований

<details><summary>Debounce или throttle — когда что?</summary>

Debounce — выполнить после паузы во входящих событиях: поиск по вводу, автосохранение, resize с тяжёлым пересчётом. Throttle — не чаще раза в N мс во время непрерывного потока: scroll, mousemove, отправка аналитики. Для визуальных обновлений лучше `requestAnimationFrame`-throttle. У lodash `debounce` есть `maxWait` — гарантирует вызов при бесконечном потоке, и `throttle` реализован через него.
</details>

<details><summary>Почему pool лучше, чем разбивать задачи на батчи по N?</summary>

Батчи (`Promise.all` по N штук) ждут самый медленный элемент батча, остальные слоты простаивают. Pool запускает следующую задачу, как только освобождается слот, — утилизация постоянная. Плюс pool легко дополнить приоритетами, отменой, rate limit.
</details>

<details><summary>Зачем jitter в exponential backoff?</summary>

Без него клиенты, упавшие одновременно (сбой сервиса), повторяют синхронно — волны нагрузки (thundering herd) мешают сервису подняться. Случайная задержка (full jitter: `random(0, cap)`) размазывает повторы. Также: потолок задержки, учёт `Retry-After`, повторять только идемпотентные запросы и только ретраябельные ошибки (сеть, 5xx, 429), а не 4xx.
</details>

<details><summary>Какие подводные камни у memoize?</summary>

Ключ: `JSON.stringify` медленный, не различает `undefined`/отсутствие, падает на циклах и BigInt, зависит от порядка ключей; для объектов-аргументов лучше `WeakMap` по ссылке. Память: без лимита — утечка, нужен LRU/TTL. Чистота: мемоизировать можно только чистые функции; `this` не входит в ключ. Промисы: кэшировать промис (дедупликация параллельных запросов), но удалять при отклонении.
</details>

<details><summary>Чем ваш deepClone отличается от structuredClone?</summary>

`structuredClone` — нативный, быстрый, поддерживает бинарные типы и `transfer`, но теряет прототипы и бросает на функциях. Самописный может сохранять прототипы и дескрипторы, копировать функции по ссылке, настраиваться. На собеседовании стоит сказать, что в продакшене сначала `structuredClone`, а самописный — когда нужны классы.
</details>

<details><summary>Почему LRU на Map работает за O(1)?</summary>

`Map` хранит порядок вставки. Доступ к элементу: `delete` + `set` переносит его в конец (самый свежий), вытеснение — первый ключ из `map.keys().next()`. Все операции амортизированно O(1). Классическая реализация на языках без упорядоченного словаря — хеш-таблица + двусвязный список.
</details>

<details><summary>Почему в EventEmitter.emit итерируются по копии слушателей?</summary>

Слушатель может отписаться (тот же `once`) или подписать новый во время эмиссии. Итерация по живой коллекции даст пропуски или бесконечный цикл. Копия фиксирует набор слушателей на момент события — как в DOM.
</details>

<details><summary>Почему в полифилле bind нужна проверка new.target?</summary>

Bound-функцию можно вызвать через `new`, и тогда `[[BoundThis]]` игнорируется: создаётся новый экземпляр целевой функции с частично применёнными аргументами. Без проверки `new Bound()` вызовет цель с зафиксированным `this` и вернёт не то.
</details>

## Практика

### 1. debounce

С опциями `leading`/`trailing`, методами `cancel` и `flush`.

<details><summary>Решение</summary>

```js
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  const invoke = () => {
    result = fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;              // не держим ссылки дольше нужного
  };

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const isFirstInSeries = timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke();    // lastArgs === null, если был только leading-вызов
    }, wait);
    if (leading && isFirstInSeries) invoke();
    return result;
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs) invoke();
    }
    return result;
  };
  return debounced;
}
```
Сложность: O(1) на вызов. Edge-cases: `leading && trailing` при одном вызове — один вызов, не два; `this` пробрасывается; возвращается результат последнего реального вызова; `cancel` при unmount компонента обязателен.
</details>

### 2. throttle

Первый вызов сразу, последний за окно — в конце окна (leading + trailing).

<details><summary>Решение</summary>

```js
function throttle(fn, interval) {
  let lastRun = -Infinity;
  let timer = null;
  let pendingArgs = null;
  let pendingThis = null;

  const run = () => {
    lastRun = performance.now();             // монотонные часы, не зависят от смены системного времени
    timer = null;
    const args = pendingArgs;
    const ctx = pendingThis;
    pendingArgs = pendingThis = null;
    fn.apply(ctx, args);
  };

  function throttled(...args) {
    pendingArgs = args;
    pendingThis = this;
    const remaining = interval - (performance.now() - lastRun);
    if (remaining <= 0) {
      clearTimeout(timer);
      run();
    } else if (timer === null) {
      timer = setTimeout(run, remaining);    // trailing: выполнится с последними аргументами
    }
  }
  throttled.cancel = () => {
    clearTimeout(timer);
    timer = pendingArgs = pendingThis = null;
    lastRun = -Infinity;
  };
  return throttled;
}
```
O(1). Edge-cases: таймеры в фоновой вкладке троттлятся браузером; для анимаций — rAF-вариант (`if (!scheduled) { scheduled = true; requestAnimationFrame(...) }`).
</details>

### 3. Полифилл Promise.all

<details><summary>Решение</summary>

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const results = [];
    let pending = 0;
    let index = 0;
    for (const item of iterable) {            // любой iterable, не только массив
      const i = index++;
      pending++;
      Promise.resolve(item).then((value) => { // не-промисы и thenable тоже
        results[i] = value;                   // порядок по индексу, а не по времени
        if (--pending === 0) resolve(results);
      }, reject);                             // fail-fast; повторные reject игнорируются промисом
    }
    if (pending === 0) resolve(results);      // пустой вход
  });
}
```
O(n). Исключение при итерации поймает executor → reject.
</details>

### 4. Полифилл Promise.allSettled

<details><summary>Решение</summary>

```js
function promiseAllSettled(iterable) {
  return promiseAll(
    Array.from(iterable, (item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
    ),
  );
}
```
Каждый элемент превращается в никогда не отклоняемый промис, после чего подходит `all`.
</details>

### 5. retry с exponential backoff

<details><summary>Решение</summary>

```js
async function retry(fn, {
  retries = 3, baseMs = 300, maxMs = 10_000, factor = 2,
  shouldRetry = () => true, signal,
} = {}) {
  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted();
    try {
      return await fn({ attempt, signal });       // await внутри try — иначе catch не поймает
    } catch (err) {
      if (attempt >= retries || signal?.aborted || !shouldRetry(err, attempt)) throw err;
      const cap = Math.min(maxMs, baseMs * factor ** attempt);
      await sleep(Math.random() * cap, { signal }); // full jitter; sleep — из 05-event-loop-async.md
    }
  }
}

// retry(({ signal }) => fetchJson('/api', { signal }), {
//   shouldRetry: (e) => e.status === undefined || e.status >= 500 || e.status === 429,
// });
```
Edge-cases: не ретраить 4xx и неидемпотентные POST; уважать `Retry-After`; общий дедлайн через `AbortSignal.timeout`; финальная ошибка — последняя (или `AggregateError` со всеми).
</details>

### 6. Пул с ограничением конкурентности

<details><summary>Решение</summary>

Вариант A — обработать массив, не более `limit` одновременно:

```js
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;                     // безопасно: JS однопоточный, гонки нет
      results[i] = await mapper(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
```

Вариант B — лимитер для задач, приходящих со временем (как `p-limit`):

```js
function createLimiter(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || queue.length === 0) return;
    active++;
    const { task, resolve, reject } = queue.shift();
    new Promise((r) => r(task()))           // ловит и синхронный throw
      .then(resolve, reject)
      .finally(() => { active--; next(); });
  };
  return (task) => {
    const { promise, resolve, reject } = Promise.withResolvers();
    queue.push({ task, resolve, reject });
    next();
    return promise;
  };
}
```
Сложность: O(n) суммарно (у `shift` O(n) на больших очередях — заменить на индекс-указатель или deque). Edge-cases: в A при ошибке `Promise.all` отклонится, но остальные воркеры продолжат — добавить флаг/`AbortSignal`; `limit < 1` валидировать.
</details>

### 7. deepClone

<details><summary>Решение</summary>

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value; // примитивы и функции — как есть
  if (seen.has(value)) return seen.get(value);                     // циклы и общие ссылки

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) return value.slice();
  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));
    return copy;
  }
  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy;
  }

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {           // + символы и неперечисляемые
    const desc = Object.getOwnPropertyDescriptor(value, key);
    if ('value' in desc) desc.value = deepClone(desc.value, seen);
    Object.defineProperty(copy, key, desc);              // безопасно для ключа "__proto__"
  }
  return copy;
}
```
O(n) по числу узлов, O(n) памяти на `seen`. Edge-cases: рекурсия упадёт на очень глубоких структурах (итеративный обход со стеком); `#private` поля и внутренние слоты (`WeakMap`, `Promise`) не копируются; DOM-узлы — `node.cloneNode(true)`.
</details>

### 8. deepEqual

<details><summary>Решение</summary>

```js
function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;                      // NaN === NaN; +0 и -0 различаются
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;                    // защита от циклов
  seen.set(a, b);

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;     // объекты в Set — по ссылке
    return true;
  }
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k], seen));
}
```
O(n). Обсудить с интервьюером: равны ли `+0`/`-0`, учитывать ли неперечисляемые и символы, сравнивать ли ключи-объекты `Map` и элементы `Set` глубоко (тогда O(n²)).
</details>

### 9. EventEmitter

<details><summary>Решение</summary>

```js
class EventEmitter {
  #events = new Map();                                   // event → Set<listener>

  on(event, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function');
    let set = this.#events.get(event);
    if (!set) this.#events.set(event, (set = new Set()));
    set.add(listener);
    return () => this.off(event, listener);              // удобная отписка
  }

  off(event, listener) {
    const set = this.#events.get(event);
    if (!set) return;
    for (const l of set) if (l === listener || l.original === listener) set.delete(l);
    if (set.size === 0) this.#events.delete(event);      // не копим пустые Set
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    wrapper.original = listener;                         // чтобы off(event, listener) работал
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const set = this.#events.get(event);
    if (!set) return false;
    for (const l of [...set]) l.apply(this, args);       // копия: слушатели могут отписываться
    return true;
  }
}
```
`emit` — O(k) по числу слушателей. Обсудить: ошибка в одном слушателе прерывает остальных (обернуть в try/catch и репортить через `queueMicrotask(() => { throw e })`); `Set` запрещает дубли (в Node дубли разрешены); лимит слушателей как детектор утечек; типизация событий в TS через map-тип.
</details>

### 10. curry

<details><summary>Решение</summary>

```js
function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) return fn.apply(this, args);
    return function (...more) { return curried.apply(this, [...args, ...more]); };
  };
}
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3) === add3(1, 2)(3) && add3(1)(2, 3) === 6; // true
```
Edge-cases: `fn.length` не учитывает параметры по умолчанию и rest — отсюда параметр `arity`; каждый частичный вызов создаёт новую функцию (иммутабельно, можно переиспользовать `add3(1)`).
</details>

### 11. compose / pipe

<details><summary>Решение</summary>

```js
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipeAsync = (...fns) => (x) => fns.reduce((acc, fn) => acc.then(fn), Promise.resolve(x));

const slugify = pipe((s) => s.trim(), (s) => s.toLowerCase(), (s) => s.replace(/\s+/g, '-'));
slugify('  Hello World '); // 'hello-world'
```
`pipe()` без функций — identity. Вариант, где первая функция принимает несколько аргументов: `(...args) => rest.reduce((acc, fn) => fn(acc), first(...args))`.
</details>

### 12. LRU cache

<details><summary>Решение</summary>

```js
class LRUCache {
  #capacity;
  #map = new Map();

  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity must be >= 1');
    this.#capacity = capacity;
  }
  get size() { return this.#map.size; }
  has(key) { return this.#map.has(key); }               // не меняет «свежесть»
  delete(key) { return this.#map.delete(key); }

  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    this.#map.delete(key);                               // переносим в конец — самый свежий
    this.#map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.#map.has(key)) this.#map.delete(key);
    else if (this.#map.size >= this.#capacity) {
      this.#map.delete(this.#map.keys().next().value);  // первый — самый старый
    }
    this.#map.set(key, value);
    return this;
  }
}
```
Все операции O(1). Развитие: TTL, `onEvict` для освобождения ресурсов, лимит по весу (байтам), а не количеству.
</details>

### 13. memoize с LRU

<details><summary>Решение</summary>

```js
function memoize(fn, {
  maxSize = 100,
  key = (...args) => (args.length === 1 ? args[0] : JSON.stringify(args)),
} = {}) {
  const cache = new LRUCache(maxSize);
  return function (...args) {
    const k = key(...args);
    if (cache.has(k)) return cache.get(k);               // get обновит свежесть
    const result = fn.apply(this, args);
    cache.set(k, result);
    if (result instanceof Promise) {
      result.catch(() => cache.delete(k));               // ошибки не кэшируем, но вызывающий её получит
    }
    return result;
  };
}
```
O(1) + стоимость ключа. Edge-cases: одиночный аргумент-объект — ключ по ссылке (SameValueZero), мутация объекта не инвалидирует кэш; `JSON.stringify` — см. вопрос выше; `this` не входит в ключ.
</details>

### 14. flat

<details><summary>Решение</summary>

```js
function flat(arr, depth = 1) {
  const result = [];
  const walk = (items, d) => {
    for (let i = 0; i < items.length; i++) {
      if (!(i in items)) continue;                       // дыры пропускаются, как в нативном flat
      const item = items[i];
      if (Array.isArray(item) && d > 0) walk(item, d - 1);
      else result.push(item);
    }
  };
  walk(arr, depth);
  return result;
}

function flatDeepIterative(arr) {                        // без рекурсии, для Infinity
  const stack = [arr];
  const indices = [0];
  const result = [];
  while (stack.length) {
    const top = stack.at(-1);
    const i = indices.at(-1);
    if (i >= top.length) { stack.pop(); indices.pop(); continue; }
    indices[indices.length - 1] = i + 1;
    if (!(i in top)) continue;
    if (Array.isArray(top[i])) { stack.push(top[i]); indices.push(0); }
    else result.push(top[i]);
  }
  return result;
}
```
O(n) по общему числу элементов. Наивный `reduce` + `concat` даёт O(n²) из-за копирования аккумулятора. Рекурсия ограничена глубиной стека — итеративная версия от этого свободна.
</details>

### 15. Полифилл bind

<details><summary>Решение</summary>

```js
function myBind(target, thisArg, ...boundArgs) {
  if (typeof target !== 'function') throw new TypeError('Bind must be called on a function');
  function bound(...args) {
    const allArgs = [...boundArgs, ...args];
    if (new.target) {
      // вызов через new: bound this игнорируется, создаём экземпляр target
      return Reflect.construct(target, allArgs, new.target);
    }
    return Reflect.apply(target, thisArg, allArgs);
  }
  if (target.prototype) bound.prototype = Object.create(target.prototype); // instanceof продолжит работать
  Object.defineProperty(bound, 'name', { value: `bound ${target.name}` });
  Object.defineProperty(bound, 'length', { value: Math.max(0, target.length - boundArgs.length) });
  return bound;
}
// Как метод: Function.prototype.myBind = function (ctx, ...a) { return myBind(this, ctx, ...a); };
```
Отличия от нативного: у настоящей bound-функции нет `prototype`, и она — exotic object; повторный `myBind` корректно игнорирует новый `this`, так как внутри вызывается уже связанная функция. На интервью отдельно упомянуть, что расширять `Function.prototype` в продакшен-коде нельзя.
</details>

## Источники
- https://learn.javascript.ru/call-apply-decorators
- https://learn.javascript.ru/bind
- https://learn.javascript.ru/currying-partials
- https://learn.javascript.ru/promise-api
- https://learn.javascript.ru/map-set
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
- https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- https://github.com/sindresorhus/p-limit
- https://lodash.com/docs/#debounce
