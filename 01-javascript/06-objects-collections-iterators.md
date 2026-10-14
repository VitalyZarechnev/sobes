# Объекты, коллекции, итераторы, Proxy

> ⏱ ~4 ч · 🎯 Понимать объектную модель (дескрипторы, внутренние методы), осознанно выбирать между Object/Map/WeakMap, писать итераторы и генераторы (включая асинхронные), объяснять устройство реактивности на Proxy и знать современные иммутабельные методы массивов.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю атрибуты дескрипторов и разницу `preventExtensions` / `seal` / `freeze`
- [ ] Могу аргументировать Map vs Object, WeakMap vs Map, и почему WeakRef — крайний случай
- [ ] Могу написать итерируемый объект и генератор, знаю про `return()` и iterator helpers
- [ ] Могу написать мини-реактивность на Proxy и назвать ограничения Proxy
- [ ] Знаю, что умеет и чего не умеет `structuredClone`

## Теория

### Дескрипторы свойств

Каждое свойство — либо **data** (`value`, `writable`), либо **accessor** (`get`, `set`), плюс у обоих `enumerable` и `configurable`.

```js
const user = {};
Object.defineProperty(user, 'id', { value: 1 });   // через defineProperty все флаги по умолчанию false!
Object.getOwnPropertyDescriptor(user, 'id');
// { value: 1, writable: false, enumerable: false, configurable: false }

user.id = 2;          // молча проигнорировано (strict: TypeError)
Object.keys(user);    // [] — неперечисляемое
```

`configurable: false` запрещает удалять свойство и менять его флаги (исключение: `writable` можно поменять с `true` на `false`).

| Операция | Добавлять свойства | Удалять | Менять значения | Проверка |
|---|---|---|---|---|
| `Object.preventExtensions` | Нет | Да | Да | `Object.isExtensible` |
| `Object.seal` | Нет | Нет | Да | `Object.isSealed` |
| `Object.freeze` | Нет | Нет | Нет | `Object.isFrozen` |

Все три — **поверхностные**. `Object.freeze(state).nested.x = 1` сработает.

**Порядок ключей** (`Object.keys`, `JSON.stringify`, `for...in`): сначала целочисленные индексы по возрастанию, затем строки в порядке добавления, затем (в `Reflect.ownKeys`) символы. Поэтому `{ b: 1, 2: 1, a: 1, 1: 1 }` даёт `['1', '2', 'b', 'a']`.

### Map, Set и Object как словарь

| Критерий | `Object` | `Map` |
|---|---|---|
| Типы ключей | Строки и символы (числа приводятся к строке) | Любые, сравнение SameValueZero |
| Порядок | Особый (числа первыми) | Порядок вставки |
| Размер | `Object.keys(o).length` — O(n) | `map.size` — O(1) |
| Частые добавления/удаления | `delete` переводит объект в dictionary mode, деоптимизация | Оптимизировано |
| Прототип | Есть унаследованные ключи, риск prototype pollution | Нет |
| Сериализация | `JSON.stringify` из коробки | Нужно `Object.fromEntries(map)` / `[...map]` |
| Итерация | `Object.entries` | Итерируем напрямую |

Правило: **Object — для записей с известной формой** (структуры, DTO), **Map — для словарей с динамическими ключами**.

`Set` хранит уникальные значения (SameValueZero). ES2025 добавил операции над множествами: `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom`.

### WeakMap, WeakSet, WeakRef, FinalizationRegistry

`WeakMap` держит ключи **слабо**: если на объект-ключ больше нет сильных ссылок, запись исчезнет вместе с ним. Ключи — объекты или незарегистрированные символы (ES2023). Нет итерации и `size` — иначе результат зависел бы от момента GC.

Технически это эфемерон: значение достижимо, только пока достижим ключ. Значит, значение, ссылающееся на свой ключ, не удерживает его.

Применения:
- метаданные к чужим объектам без их мутации (DOM-узел → состояние виджета);
- мемоизация по объекту-аргументу: `WeakMap<Request, Response>`;
- приватные данные (до `#private`; так транспилирует Babel);
- `WeakSet` — пометка «уже обработан» при обходе графа (но для одноразового обхода с циклами обычный `Set` проще и уйдёт в GC вместе с функцией).

`WeakRef` — слабая ссылка на объект (`ref.deref()` → объект или `undefined`). `FinalizationRegistry` — колбэк после сборки. Спецификация **не гарантирует**, когда и будет ли вызван колбэк; `deref()` в рамках одной синхронной задачи стабилен. Использовать только для кэшей больших ресурсов и как страховку освобождения внешних ресурсов (WASM-память), а не для бизнес-логики.

### Протокол итерации

Итерируемый объект — имеет `[Symbol.iterator]()`, возвращающий итератор с `next()` → `{ value, done }`. Необязательный `return()` вызывается при досрочном выходе (`break`, `throw`, деструктуризация не до конца) — место для очистки ресурсов.

Итерацию используют: `for...of`, spread, деструктуризация массива, `Array.from`, `new Map(iterable)`, `Promise.all`, `yield*`.

Итерируемый ≠ массивоподобный: `{ length: 2, 0: 'a', 1: 'b' }` — array-like (работает с `Array.from`), но не итерируемый (`for...of` бросит `TypeError`).

```js
class Range {
  constructor(from, to, step = 1) { Object.assign(this, { from, to, step }); }
  *[Symbol.iterator]() {               // генератор — самый короткий способ
    for (let v = this.from; v <= this.to; v += this.step) yield v;
  }
}
[...new Range(1, 5, 2)]; // [1, 3, 5]
```

**Iterator helpers (ES2025)** — ленивые методы на `Iterator.prototype`: `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, `find`, и `Iterator.from(obj)`. Работают с бесконечными последовательностями без промежуточных массивов:

```js
function* naturals() { let n = 1; while (true) yield n++; }
naturals().filter((n) => n % 2).map((n) => n * n).take(3).toArray(); // [1, 9, 25]
```

### Генераторы

`function*` возвращает объект-генератор (итератор + итерируемый). Выполнение приостанавливается на `yield` и продолжается по `next(value)` — `value` становится результатом выражения `yield`. Первый `next(x)` аргумент игнорирует.

- `gen.return(v)` — завершить (выполнятся блоки `finally`);
- `gen.throw(err)` — бросить исключение в точке `yield`;
- `yield* iterable` — делегирование.

Генераторы — основа корутин: redux-saga, ранние реализации async/await (co), ленивые пайплайны.

**Асинхронные генераторы** — естественная модель пагинации и стримов:

```js
async function* fetchAllPages(url, { signal } = {}) {
  let next = url;
  while (next) {
    const res = await fetch(next, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { items, nextPage } = await res.json();
    yield* items;                       // отдаём элементы по одному
    next = nextPage;
  }
}

for await (const item of fetchAllPages('/api/items')) {
  if (item.id === target) break;        // break вызовет return() — следующие страницы не грузятся
}
```

### Proxy и Reflect

`Proxy` перехватывает **внутренние методы** объекта (`[[Get]]`, `[[Set]]`, `[[HasProperty]]`, `[[DeleteProperty]]`, `[[OwnPropertyKeys]]`, `[[Call]]`, `[[Construct]]` и др. — всего 13 ловушек). `Reflect` предоставляет те же операции как функции с одинаковыми сигнатурами — дефолтное поведение внутри ловушки.

Мини-реактивность в стиле Vue 3:

```js
const targetMap = new WeakMap();      // target → Map<key, Set<effect>>
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  let deps = targetMap.get(target);
  if (!deps) targetMap.set(target, (deps = new Map()));
  let effects = deps.get(key);
  if (!effects) deps.set(key, (effects = new Set()));
  effects.add(activeEffect);
}

function trigger(target, key) {
  targetMap.get(target)?.get(key)?.forEach((fn) => fn());
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      const value = Reflect.get(target, key, receiver);   // receiver — чтобы геттеры видели прокси
      return value !== null && typeof value === 'object' ? reactive(value) : value; // ленивая глубина
    },
    set(target, key, value, receiver) {
      const old = target[key];
      const ok = Reflect.set(target, key, value, receiver);
      if (ok && !Object.is(old, value)) trigger(target, key);
      return ok;                                           // false в strict → TypeError
    },
  });
}

function effect(fn) {
  activeEffect = fn;
  try { fn(); } finally { activeEffect = null; }
}

const state = reactive({ count: 0 });
effect(() => console.log('count =', state.count)); // count = 0
state.count++;                                      // count = 1
```

(Настоящий Vue кэширует прокси в `WeakMap`, чтобы `reactive(obj) === reactive(obj)`, чистит устаревшие зависимости и батчит эффекты через планировщик на микрозадачах.)

Ограничения Proxy:
- **Инварианты**: ловушка не может, например, вернуть другое значение для non-configurable non-writable свойства или скрыть non-configurable свойство — `TypeError`.
- **Внутренние слоты**: `new Proxy(new Map(), {}).get('a')` → `TypeError`, т.к. `Map.prototype.get` вызван с `this` = прокси без `[[MapData]]`. То же для `Date`, `Set`, и **приватных полей `#`**. Vue решает это для коллекций отдельными обработчиками.
- Идентичность: `proxy !== target` — сравнения, ключи `Map`/`WeakMap` и `includes` работают с разными объектами.
- Производительность: каждый доступ — вызов функции; горячие пути лучше держать на «сыром» объекте (`toRaw`, `shallowRef`).
- `Proxy.revocable` — отзываемый доступ (capability-паттерн).

### structuredClone

Глубокое копирование по алгоритму structured clone (тот же, что в `postMessage`, IndexedDB).

| Поддерживает | Не поддерживает / теряет |
|---|---|
| Циклические ссылки, общие ссылки сохраняются | Функции → `DataCloneError` |
| `Map`, `Set`, `Date`, `RegExp`, `BigInt` | DOM-узлы → `DataCloneError` |
| `ArrayBuffer`, typed arrays, `Blob`, `File`, `ImageData` | Прототипы: экземпляр класса станет plain object |
| `Error` (основные типы) | Геттеры/сеттеры — копируется вычисленное значение |
| Опция `transfer` — передача владения буфером без копии | Свойства с ключами-символами, дескрипторы, `lastIndex` RegExp |

`JSON.parse(JSON.stringify(x))` дополнительно теряет `undefined`, `Date` (станет строкой), `Map`/`Set` (станут `{}`), `NaN`/`Infinity` (станут `null`), падает на циклах и `BigInt`.

### Современные методы массивов

| Метод | Версия | Суть |
|---|---|---|
| `at(i)` | ES2022 | Отрицательные индексы: `arr.at(-1)` |
| `Object.hasOwn` | ES2022 | Замена `hasOwnProperty.call` |
| `findLast`, `findLastIndex` | ES2023 | Поиск с конца |
| `toSorted`, `toReversed`, `toSpliced`, `with(i, v)` | ES2023 | **Копирующие** версии мутирующих методов — удобно для иммутабельного state в React/Redux |
| `Object.groupBy`, `Map.groupBy` | ES2024 | Группировка; `Object.groupBy` возвращает объект с `null`-прототипом |
| `Array.fromAsync` | ES2024 | `Array.from` для async-итерируемых |

```js
const orders = [{ id: 1, status: 'paid' }, { id: 2, status: 'new' }, { id: 3, status: 'paid' }];
const byStatus = Object.groupBy(orders, (o) => o.status); // { paid: [...], new: [...] }
const sorted = orders.toSorted((a, b) => b.id - a.id);   // orders не изменён
const updated = orders.with(1, { ...orders[1], status: 'paid' });
```

🪤 Ловушка: `sort()` без компаратора сортирует **строковые представления**: `[10, 9, 1].sort()` → `[1, 10, 9]`. С ES2019 сортировка стабильна.

## Вопросы с собеседований

<details><summary>Когда использовать Map вместо объекта?</summary>

Когда ключи динамические (id, пользовательский ввод), не строки (объекты, DOM-узлы), когда часты добавления и удаления, нужен размер за O(1) и порядок вставки, и когда есть риск prototype pollution. Объект — для записей фиксированной формы, где важны JSON и деструктуризация. В V8 объекты с постоянной формой получают hidden class и быстрые inline caches, а «словарные» объекты с `delete` деоптимизируются.
</details>

<details><summary>Зачем нужен WeakMap и почему его нельзя итерировать?</summary>

Хранить данные, ассоциированные с объектом, не продлевая жизнь объекта: кэши по объекту-аргументу, метаданные DOM-узлов, приватное состояние. Итерация и `size` раскрыли бы недетерминированный момент работы GC — результат программы зависел бы от сборщика. Значения удерживаются, пока жив ключ (эфемерон-семантика).
</details>

<details><summary>Что такое WeakRef и FinalizationRegistry и почему их стоит избегать?</summary>

`WeakRef` — ссылка, не мешающая GC; `FinalizationRegistry` — уведомление после сборки. Время сборки не определено, колбэк может не вызваться вообще (например, при закрытии вкладки), разные движки ведут себя по-разному. Годятся для кэшей тяжёлых объектов и как подстраховка освобождения внешних ресурсов. Для детерминированного освобождения — явный `dispose()` / `using` (Explicit Resource Management, `Symbol.dispose`).
</details>

<details><summary>Чем отличается Object.freeze от const и от Object.seal?</summary>

`const` — про привязку переменной, объект можно мутировать. `seal` — нельзя добавлять/удалять свойства, но можно менять значения. `freeze` — ещё и значения неизменяемы (`writable: false`). Все поверхностные. В strict mode нарушение бросает `TypeError`, в sloppy — молча игнорируется. Полезно для конфигов, констант, защиты от случайных мутаций в dev (Immer замораживает результат в dev-режиме).
</details>

<details><summary>Как работает протокол итерации? Что делает return() у итератора?</summary>

`obj[Symbol.iterator]()` возвращает итератор, `next()` — `{ value, done }`. `for...of`, spread, деструктуризация вызывают его. При досрочном выходе (`break`, `return`, исключение) движок вызывает `iterator.return()`, если он есть — генераторы реализуют его, выполняя `finally`. Это способ гарантированно закрыть ресурс (файл, соединение, следующую страницу запроса).
</details>

<details><summary>Чем генераторы полезны в реальном коде?</summary>

Ленивые и бесконечные последовательности, обход деревьев (`yield*` рекурсивно), реализация итераторов коллекций, пагинация через async-генераторы и `for await`, кооперативные корутины (redux-saga: эффекты как описания, легко тестировать без моков), разбиение длинной работы на части. Iterator helpers ES2025 делают ленивые пайплайны встроенными.
</details>

<details><summary>Как Vue 3 использует Proxy? Почему не Object.defineProperty, как Vue 2?</summary>

`get` — `track` (запоминаем, какой эффект читал какой ключ), `set`/`deleteProperty` — `trigger`. `defineProperty` требовал заранее знать ключи: не отслеживал добавление/удаление свойств и индексы массивов (отсюда `Vue.set`), и обходил объект целиком при создании. Proxy перехватывает операции над любыми ключами, включая `has`, `ownKeys`, и позволяет ленивую глубокую реактивность. Цена — нет поддержки IE11, `proxy !== raw`, проблемы с приватными полями и встроенными объектами со слотами.
</details>

<details><summary>Зачем Reflect, если есть обычные операторы?</summary>

Единообразный функциональный API к внутренним методам с той же сигнатурой, что у ловушек Proxy. `Reflect.get/set` принимают `receiver` — без него геттеры в прототипе получат `target`, а не прокси. `Reflect.set`/`defineProperty` возвращают boolean вместо исключения. `Reflect.ownKeys` возвращает и строки, и символы. `Reflect.construct` позволяет задать `new.target`.
</details>

<details><summary>Чем structuredClone лучше JSON-копирования, и чего он не умеет?</summary>

Сохраняет циклы и общие ссылки, `Map`/`Set`/`Date`/`RegExp`/`BigInt`/бинарные данные, `undefined` и `NaN`. Не копирует функции и DOM (бросает), теряет прототипы, аксессоры, символьные ключи. Для экземпляров классов и объектов с методами нужен собственный clone. Под капотом — тот же алгоритм, что у `postMessage`, поэтому есть `transfer` для передачи буферов без копирования.
</details>

<details><summary>Зачем toSorted и with, если есть [...arr].sort()?</summary>

Семантика явная и однострочная, работает в цепочках, `with` — иммутабельная замена элемента без `map`. Это важно для React/Redux, где состояние нельзя мутировать. Плюс `toSorted` гарантированно возвращает плотный массив (дыры становятся `undefined`). Производительно — та же копия, что и spread.
</details>

## Практика

**1. Порядок ключей и дескрипторы — предскажите вывод.**

```js
const o = { b: 1, 10: 1, a: 1, 2: 1, [Symbol('s')]: 1 };
Object.defineProperty(o, 'hidden', { value: 1 });
console.log(Object.keys(o));
console.log(Reflect.ownKeys(o).length);
console.log(JSON.stringify(o));
```

<details><summary>Ответ</summary>

`['2', '10', 'b', 'a']`; `6` (`2`, `10`, `b`, `a`, `hidden`, символ); `{"2":1,"10":1,"b":1,"a":1}` — неперечисляемое и символ пропущены.
</details>

**2. Напишите `deepFreeze(obj)` с поддержкой циклов.**

<details><summary>Решение</summary>

```js
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && 'value' in desc) deepFreeze(desc.value, seen);  // не вызываем геттеры
  }
  return Object.freeze(obj);
}
```
Нюанс: `Map`/`Set` так не заморозить — `freeze` не трогает внутренние слоты, `map.set` продолжит работать.
</details>

**3. Реализуйте `chunk(iterable, size)` как генератор, работающий с бесконечными источниками.**

<details><summary>Решение</summary>

```js
function* chunk(iterable, size) {
  if (!Number.isInteger(size) || size < 1) throw new RangeError('size must be a positive integer');
  let buffer = [];
  for (const item of iterable) {
    buffer.push(item);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length) yield buffer;
}
Iterator.from(chunk(naturals(), 3)).take(2).toArray(); // [[1,2,3],[4,5,6]]
```
</details>

**4. Сделайте `createReadonlyView(obj)` на Proxy: чтение — глубоко, любая запись/удаление — `TypeError`.**

<details><summary>Решение</summary>

```js
function createReadonlyView(obj, cache = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (cache.has(obj)) return cache.get(obj);
  const deny = () => { throw new TypeError('Readonly view'); };
  const proxy = new Proxy(obj, {
    get: (t, k, r) => createReadonlyView(Reflect.get(t, k, r), cache),
    set: deny,
    deleteProperty: deny,
    defineProperty: deny,
    setPrototypeOf: deny,
  });
  cache.set(obj, proxy);
  return proxy;
}
```
Ограничения: исходный объект по-прежнему мутируем через другие ссылки — это view, а не заморозка; методы `Map`/`Set` через такую прокси упадут; для уже замороженного вложенного объекта `get` нарушит инвариант Proxy (вернёт прокси вместо non-writable значения) → `TypeError`, поэтому в реальном коде такие свойства надо возвращать как есть.
</details>

## Источники
- https://learn.javascript.ru/property-descriptors
- https://learn.javascript.ru/property-accessors
- https://learn.javascript.ru/map-set
- https://learn.javascript.ru/weakmap-weakset
- https://learn.javascript.ru/iterable
- https://learn.javascript.ru/generators
- https://learn.javascript.ru/async-iterators-generators
- https://learn.javascript.ru/proxy
- https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
- https://vuejs.org/guide/extras/reactivity-in-depth.html
- https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots
