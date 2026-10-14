# Новинки JavaScript: ES2023–ES2027

> ⏱ ~2 ч · 🎯 Знать, что появилось в языке за последние годы, уметь показать практическую пользу каждой фичи на примере и понимать процесс TC39 (стадии предложений). На senior-собеседовании вопрос «что нового в JS и чем вы пользуетесь» встречается регулярно.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Новинки других технологий: [TypeScript](../02-typescript/08-whats-new.md) · [React](../03-react/11-whats-new.md) · [Vue](../04-vue/09-whats-new.md) · [CSS](../06-web-platform/08-whats-new-css.md) · [HTML](../06-web-platform/09-whats-new-html.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю стадии процесса TC39 и что значит «Stage 4»
- [ ] Могу назвать 5–7 фич ES2023–ES2025 и показать их пользу
- [ ] Знаю, что такое `using` и Temporal и почему их ждали
- [ ] Понимаю, как безопасно использовать новые API (полифиллы, `browserslist`, проверка поддержки)

## Теория

### 1. Как фичи попадают в язык

Язык развивает комитет **TC39**. Каждое предложение (proposal) проходит стадии:

| Стадия | Смысл |
|---|---|
| 0 | идея |
| 1 | проблема признана, исследуются решения |
| 2 | выбран дизайн, черновик спецификации |
| 2.7 | спецификация готова, нужны тесты и реализации |
| 3 | рекомендовано к реализации в движках |
| 4 | **готово**: есть тесты test262 и две совместимые реализации; войдёт в ближайшую редакцию стандарта |

Редакция стандарта выходит каждый год в июне: ES2024, ES2025 и т.д. Ниже — списки по официальной таблице TC39 «Finished proposals». Фичи с годом 2027 уже на стадии 4 и войдут в ES2027.

💡 На собеседовании: «Новую фичу я начинаю использовать, когда она есть в наших целевых браузерах по `browserslist` (или когда её закрывает полифилл/транспиляция), а не по году стандарта. Для этого смотрю MDN, caniuse и webstatus.dev».

### 2. ES2023

| Фича | Пример | Зачем |
|---|---|---|
| **Change Array by Copy** | `arr.toSorted()`, `toReversed()`, `toSpliced()`, `with(i, v)` | иммутабельные версии мутирующих методов — идеально для state в React/Redux |
| **Array find from last** | `arr.findLast(fn)`, `arr.findLastIndex(fn)` | поиск с конца без `reverse()` |
| **Symbols as WeakMap keys** | `new WeakMap().set(Symbol('k'), v)` | незарегистрированные символы как слабые ключи |
| **Hashbang Grammar** | `#!/usr/bin/env node` в начале файла | стандартизирован шебанг для CLI-скриптов |

```js
const state = [3, 1, 2];
const sorted = state.toSorted();      // [1, 2, 3], state не изменён
const updated = state.with(0, 10);    // [10, 1, 2]
const lastEven = [1, 2, 3, 4].findLast((n) => n % 2 === 0); // 4
```

### 3. ES2024

| Фича | Пример | Зачем |
|---|---|---|
| **Array Grouping** | `Object.groupBy(items, fn)`, `Map.groupBy(items, fn)` | группировка без `reduce` |
| **`Promise.withResolvers`** | `const { promise, resolve, reject } = Promise.withResolvers()` | создать промис и управлять им снаружи (очереди, события, тесты) |
| **Well-Formed Unicode Strings** | `str.isWellFormed()`, `str.toWellFormed()` | обнаружить и исправить «одинокие» суррогаты |
| **RegExp `v` flag** | `/[\p{L}--[a-z]]/v` | операции над множествами символов и свойства строк в регулярках |
| **Resizable ArrayBuffer** | `new ArrayBuffer(8, { maxByteLength: 64 })`, `.resize(16)` | буферы, которые растут без копирования |
| **ArrayBuffer transfer** | `buf.transfer()` | передать владение памятью, исходный буфер становится detached |
| **`Atomics.waitAsync`** | | асинхронное ожидание в SharedArrayBuffer без блокировки |

```js
const byStatus = Object.groupBy(orders, (o) => o.status); // { paid: [...], new: [...] }

// withResolvers: промис, который разрешается «снаружи»
function waitForClick(button) {
  const { promise, resolve } = Promise.withResolvers();
  button.addEventListener('click', resolve, { once: true });
  return promise;
}
```

### 4. ES2025

| Фича | Пример | Зачем |
|---|---|---|
| **Iterator helpers** | `iter.map()`, `filter()`, `take()`, `drop()`, `flatMap()`, `reduce()`, `toArray()`, `some()`, `every()`, `find()`, `forEach()`, `Iterator.from()` | **ленивые** цепочки над любыми итераторами без промежуточных массивов |
| **New Set methods** | `a.union(b)`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` | операции над множествами из коробки |
| **`Promise.try`** | `Promise.try(() => maybeSyncOrAsync())` | синхронное исключение тоже превращается в rejected-промис |
| **Import Attributes** и **JSON Modules** | `import config from './config.json' with { type: 'json' }` | безопасный импорт не-JS модулей |
| **`RegExp.escape`** | `new RegExp(RegExp.escape(userInput))` | экранирование пользовательской строки для регулярки (защита от инъекций и ошибок) |
| **RegExp Modifiers** | `/a(?i:b)c/` | включить флаг только для части выражения |
| **Duplicate named capture groups** | `/(?<y>\d{4})-\d\d\|\d\d-(?<y>\d{4})/` | одно имя группы в разных альтернативах |
| **Float16** | `Float16Array`, `Math.f16round` | половинная точность для графики и ML |
| Redeclarable global `eval` vars | | техническая правка |

```js
// Ленивые итераторы: обрабатываем только то, что нужно
function* naturals() { let n = 1; while (true) yield n++; }
const firstSquares = naturals()
  .map((n) => n * n)
  .filter((n) => n % 2 === 1)
  .take(3)
  .toArray(); // [1, 9, 25] — бесконечный генератор, но вычислено ровно 3 элемента

// Цепочка над массивом без промежуточных массивов
const result = bigArray.values().filter(isValid).map(transform).take(100).toArray();

RegExp.escape('a.b*c'); // '\\x61\\.b\\*c' — первый символ экранируется тоже (чтобы не склеиться с предыдущим токеном)
```

### 5. ES2026

| Фича | Пример | Зачем |
|---|---|---|
| **`Array.fromAsync`** | `await Array.fromAsync(asyncIterable)` | собрать асинхронный итератор (поток, пагинацию) в массив |
| **`Error.isError`** | `Error.isError(e)` | надёжная проверка ошибки, в том числе между realm (iframe), где `instanceof Error` ломается |
| **`Math.sumPrecise`** | `Math.sumPrecise([1e20, 0.1, -1e20])` → `0.1` | сумма без накопления ошибки округления (обычный `reduce` даст `0`) |
| **Uint8Array to/from Base64** | `Uint8Array.fromBase64(str)`, `bytes.toBase64()`, `fromHex`, `toHex` | работа с бинарными данными без `btoa`/`atob` и их проблем с Unicode |
| **Iterator Sequencing** | `Iterator.concat(it1, it2)` | склеить итераторы |
| **JSON.parse source text access** | `JSON.parse(text, (key, value, { source }) => …)`, `JSON.rawJSON('9007199254740993')` | получить исходный текст числа: точная работа с int64 ID и BigInt |
| **Upsert** | `map.getOrInsert(key, default)`, `map.getOrInsertComputed(key, fn)` | «взять или создать» в Map/WeakMap одной операцией |

```js
// Upsert: группировка в Map без проверки has/set
const groups = new Map();
for (const item of items) {
  groups.getOrInsert(item.category, []).push(item);
}

// Точные int64 ID из JSON
const data = JSON.parse('{"id": 9007199254740993}', (key, value, ctx) =>
  key === 'id' ? BigInt(ctx.source) : value,
);
data.id; // 9007199254740993n — без потери точности
```

### 6. ES2027 (уже Stage 4)

| Фича | Что это |
|---|---|
| **Temporal** | новый API дат и времени взамен `Date`: неизменяемые объекты, часовые пояса, календари, длительности, корректная арифметика дат |
| **Explicit Resource Management** | `using` / `await using`, `Symbol.dispose`, `DisposableStack` — автоматическое освобождение ресурсов при выходе из блока |
| **Joint Iteration** | `Iterator.zip([a, b])` — параллельный обход нескольких итераторов |
| **Iterator chunking** | разбиение итератора на части (chunks) и скользящие окна (windows) |
| **Iterator Includes** | `iterator.includes(x)` |
| **Iterator Join** | склейка элементов итератора в строку |
| **`Atomics.pause`** | подсказка процессору при активном ожидании в многопоточном коде |

**Temporal** решает проблемы `Date`: изменяемость, месяцы с нуля, только локальный пояс и UTC, неудобная арифметика.

```js
const today = Temporal.Now.plainDateISO();            // дата без времени и пояса
const deadline = today.add({ months: 1 });            // корректно с концом месяца
const meeting = Temporal.ZonedDateTime.from('2026-10-13T15:00[Europe/Moscow]');
const inTomsk = meeting.withTimeZone('Asia/Tomsk');   // тот же момент в другом поясе
const duration = Temporal.Duration.from({ hours: 1, minutes: 30 });
```

**`using`** вызывает `[Symbol.dispose]()` у ресурса при выходе из блока, даже при исключении. Это аналог `try...finally`, `with` в Python и `using` в C#.

```js
function openConnection() {
  const conn = connect();
  return { conn, [Symbol.dispose]: () => conn.close() };
}

{
  using db = openConnection();
  db.conn.query('...');
} // здесь автоматически вызван conn.close()

// Асинхронная очистка
await using file = await openFile(path); // вызовет [Symbol.asyncDispose]
```

Поддержка в браузерах и Node.js появляется постепенно (например, `using` и `RegExp.escape` уже есть в Node.js 24). Перед использованием проверяйте MDN и caniuse или подключайте полифиллы (core-js).

### 7. Важные фичи ES2022, которые стоит знать

Часто спрашивают как «современный JS», хотя им уже несколько лет:
- **Class fields** и **private** (`#x`, `#method()`), **static blocks** (`static { … }`), brand check `#x in obj`;
- **Top-level `await`** в модулях;
- **`.at()`** для массивов и строк (`arr.at(-1)`);
- **`Object.hasOwn`**;
- **Error cause**: `new Error('Не удалось сохранить', { cause: originalError })` — цепочка причин ошибок;
- **RegExp match indices** (флаг `d`).

```js
try {
  await saveOrder(order);
} catch (error) {
  throw new Error(`Не удалось сохранить заказ ${order.id}`, { cause: error });
}
```

### 8. Как внедрять новинки в проекте

1. **Целевые браузеры** задаются в `browserslist` (`"> 0.5%, last 2 versions, not dead"` или конкретный список).
2. **Синтаксис** (новые операторы, `using`, классы) — транспилирует сборщик: SWC, esbuild, Babel. Транспиляция не добавляет API.
3. **API** (`Object.groupBy`, Set-методы, Temporal) — нужен полифилл (core-js с `useBuiltIns: 'usage'` или ручной импорт). Иначе в старом браузере будет `TypeError: ... is not a function`.
4. **TypeScript**: подключить нужные `lib` (`es2025`, `esnext`) — иначе компилятор не знает о новых методах (см. [Новинки TS](../02-typescript/08-whats-new.md)).
5. **Мониторинг**: ошибки «is not a function» в Sentry из старых браузеров — сигнал, что полифилла не хватает.

## Вопросы с собеседований

<details><summary>Какие новые возможности JS вы используете в работе?</summary>

Хороший ответ — 4–6 фич с примерами пользы: `toSorted`/`with` для иммутабельного state, `Object.groupBy` вместо громоздкого `reduce`, `structuredClone` для глубоких копий, `Promise.withResolvers` для промисов «снаружи», Set-методы для операций над множествами, iterator helpers для ленивых цепочек, `Error` с `cause` для цепочек ошибок, `using` для очистки ресурсов. И обязательно про проверку поддержки через `browserslist` и полифиллы.
</details>

<details><summary>Как устроен процесс TC39? Что значит Stage 3 и Stage 4?</summary>

Стадии 0–4: идея → проблема признана → выбран дизайн → (2.7) спецификация готова → (3) рекомендовано к реализации в движках → (4) завершено: есть тесты test262 и две совместимые реализации, фича войдёт в ближайшую ежегодную редакцию. На Stage 3 фичи уже появляются в браузерах и TypeScript, но API ещё может немного измениться.
</details>

<details><summary>Чем toSorted отличается от sort и зачем он нужен?</summary>

`sort` сортирует массив на месте и возвращает тот же массив. `toSorted` возвращает отсортированную копию и не трогает исходный. Это важно для иммутабельного state в React и Redux: мутация не меняет ссылку, и UI не обновится. Раньше писали `[...arr].sort()`. Аналогично `toReversed`, `toSpliced`, `with`.
</details>

<details><summary>Что такое iterator helpers и чем они лучше методов массивов?</summary>

Методы `map`, `filter`, `take`, `drop` и другие прямо на итераторах. Они **ленивые**: элементы обрабатываются по одному по мере запроса, промежуточные массивы не создаются. Это позволяет работать с бесконечными генераторами, потоками и большими коллекциями (`map.values().filter(...)`) и останавливаться рано через `take`. Методы массивов жадные: каждый шаг цепочки создаёт новый массив.
</details>

<details><summary>Зачем нужен Promise.withResolvers?</summary>

Он возвращает промис вместе с функциями `resolve` и `reject`, которыми можно управлять снаружи конструктора. Раньше для этого выносили `resolve` в переменную из `new Promise`. Применение: превратить событие в промис, реализовать очередь или семафор, отложенные ответы, тесты.
</details>

<details><summary>Что такое Temporal и чем плох Date?</summary>

`Date` изменяемый, месяцы считаются с нуля, поддерживает только локальный часовой пояс и UTC, арифметика дат неудобна и полна ошибок (переход через конец месяца, DST), парсинг строк нестабилен. Temporal даёт неизменяемые типы для разных задач (`PlainDate`, `PlainTime`, `ZonedDateTime`, `Instant`, `Duration`), полноценные часовые пояса и календари, корректную арифметику. Он на Stage 4 и войдёт в ES2027, поддержка в браузерах появляется.
</details>

<details><summary>Что такое using и Symbol.dispose?</summary>

Explicit Resource Management: объявление `using x = resource` гарантирует вызов `x[Symbol.dispose]()` при выходе из блока, в том числе при исключении. `await using` вызывает `Symbol.asyncDispose`. `DisposableStack` позволяет собрать несколько ресурсов. Это замена ручного `try...finally` для соединений, файловых дескрипторов, подписок, блокировок.
</details>

<details><summary>Почему нельзя просто транспилировать новые API через Babel или SWC?</summary>

Транспилятор переписывает **синтаксис** (`?.`, классы, `using`) в старый эквивалент. Новые **API** (`Object.groupBy`, `Set.prototype.union`, Temporal) — это объекты и методы рантайма, их нужно добавить полифиллом (core-js) или проверять перед использованием. Иначе код скомпилируется, но в старом браузере упадёт с `TypeError`.
</details>

## Практика

### Предскажите вывод

**1.**
```js
const arr = [3, 1, 2];
const a = arr.toSorted();
const b = arr.with(0, 9);
console.log(arr, a, b);
```
<details><summary>Ответ</summary>

`[3, 1, 2] [1, 2, 3] [9, 1, 2]`
</details>
<details><summary>Почему так</summary>

Методы «change by copy» возвращают новые массивы и не меняют исходный.
</details>

**2.**
```js
function* nums() { let i = 0; while (true) { console.log('gen', i); yield i++; } }
const res = nums().map((x) => x * 10).take(2).toArray();
console.log(res);
```
<details><summary>Ответ</summary>

`gen 0`, `gen 1`, `[0, 10]`
</details>
<details><summary>Почему так</summary>

Iterator helpers ленивые: генератор вызывается ровно столько раз, сколько элементов запросил `take(2)`. Бесконечный генератор не зацикливается.
</details>

**3.**
```js
const frontend = new Set(['js', 'css']);
const backend = new Set(['js', 'go']);
console.log([...frontend.union(backend)], [...frontend.difference(backend)]);
```
<details><summary>Ответ</summary>

`['js', 'css', 'go'] ['css']`
</details>
<details><summary>Почему так</summary>

`union` объединяет множества в порядке: сначала элементы первого, затем новые из второго. `difference` оставляет элементы первого, которых нет во втором.
</details>

**4.**
```js
const p = Promise.try(() => { throw new Error('sync'); });
p.catch((e) => console.log('поймано:', e.message));
```
<details><summary>Ответ</summary>

`поймано: sync`
</details>
<details><summary>Почему так</summary>

`Promise.try` превращает синхронное исключение в rejected-промис. С `Promise.resolve().then(fn)` вызов был бы асинхронным, а прямой вызов `fn()` выбросил бы исключение синхронно.
</details>

### Задачи

**1. Полифилл `groupBy`**

Напишите `groupBy(items, keyFn)`, которая работает как `Object.groupBy`: возвращает объект **без прототипа**, где ключи — результат `keyFn(item, index)`, а значения — массивы элементов в исходном порядке. `items` может быть любым итерируемым.

<details><summary>Решение</summary>

```js
function groupBy(items, keyFn) {
  const result = Object.create(null);
  let index = 0;
  for (const item of items) {
    const key = keyFn(item, index++);
    (result[key] ??= []).push(item);
  }
  return result;
}
```

`Object.create(null)` защищает от коллизий с `__proto__` и унаследованными свойствами — так ведёт себя и стандартная реализация. Оператор `??=` создаёт массив только при первом обращении.
</details>

**2. `withResolvers` для очереди событий**

Используя `Promise.withResolvers` (или его аналог через `new Promise`), реализуйте `createDeferredQueue()` с методами `push(value)` и `next()`: `next()` возвращает промис, который разрешается следующим значением из очереди. Если значений пока нет, промис ждёт следующего `push`.

<details><summary>Решение</summary>

```js
function createDeferredQueue() {
  const values = [];
  const waiters = [];
  return {
    push(value) {
      const waiter = waiters.shift();
      if (waiter) waiter.resolve(value);
      else values.push(value);
    },
    next() {
      if (values.length > 0) return Promise.resolve(values.shift());
      const deferred = Promise.withResolvers();
      waiters.push(deferred);
      return deferred.promise;
    },
  };
}
```
</details>

**3. Ленивая пагинация с iterator helpers**

Есть генератор `pages()`, который отдаёт массивы элементов по страницам. Напишите `firstMatching(pages, predicate, n)`, которая возвращает первые `n` элементов, удовлетворяющих `predicate`, и **не запрашивает лишних страниц**. Используйте `flatMap`, `filter`, `take`.

<details><summary>Решение</summary>

```js
function firstMatching(pages, predicate, n) {
  return pages
    .flatMap((page) => page)   // генератор страниц → поток элементов
    .filter(predicate)
    .take(n)
    .toArray();
}
```

Благодаря ленивости следующая страница запрашивается только тогда, когда текущие элементы закончились, а `take(n)` закрывает итератор после n-го элемента.
</details>

## Источники
- [TC39 — Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [TC39 — Process Document](https://tc39.es/process-document/)
- [MDN — Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)
- [MDN — Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
- [MDN — using](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)
- [MDN — Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
- [web-features / webstatus.dev](https://webstatus.dev/)
