# Работа с объектами

> ⏱ ~3 ч · 🎯 Свободно создавать, читать, перебирать, копировать, сливать и сравнивать объекты, знать порядок ключей, разницу поверхностного и глубокого копирования, иммутабельные обновления вложенных данных и подводные камни JSON.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Массивы](12-arrays.md) · [Map и Set](13-map-set.md) · [Прототипы](04-prototypes-classes.md) · [Дескрипторы и Proxy](06-objects-collections-iterators.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю 4 способа создать объект и чем они отличаются
- [ ] Знаю порядок ключей при переборе
- [ ] Отличаю `in`, `Object.hasOwn` и проверку на `undefined`
- [ ] Знаю все способы перебора и что каждый из них видит
- [ ] Могу объяснить разницу shallow/deep copy и выбрать способ копирования
- [ ] Умею иммутабельно обновить вложенное поле
- [ ] Знаю, что теряет `JSON.stringify`
- [ ] Знаю разницу `freeze` / `seal` / `preventExtensions`

## Теория

### 1. Объект — коллекция свойств

Объект хранит пары **ключ → значение**. Ключ — строка или Symbol (числа и всё остальное превращаются в строку). Значение — что угодно, в том числе функция (тогда это *метод*).

### 2. Способы создать объект

```js
// 1. Литерал — основной способ
const user = { name: 'Аня', age: 30 };

// 2. Object.create(proto) — с заданным прототипом
const base = { greet() { return `Привет, ${this.name}`; } };
const child = Object.create(base);
child.name = 'Боря';
child.greet();            // 'Привет, Боря' — метод найден в прототипе

const dict = Object.create(null); // объект БЕЗ прототипа: нет toString, hasOwnProperty и т.п.

// 3. Класс или функция-конструктор
class Point { constructor(x, y) { this.x = x; this.y = y; } }
const p = new Point(1, 2);

// 4. Object.fromEntries — из пар [ключ, значение]
const fromPairs = Object.fromEntries([['a', 1], ['b', 2]]); // { a: 1, b: 2 }
```

Прототипы и классы подробно разобраны на странице [Прототипы и классы](04-prototypes-classes.md).

### 3. Синтаксис литерала

```js
const key = 'dynamic';
const age = 30;

const obj = {
  name: 'Аня',              // обычное свойство
  'full name': 'Анна Иванова', // ключ с пробелом — в кавычках
  age,                      // shorthand: то же, что age: age
  [key]: 1,                 // вычисляемый ключ → dynamic: 1
  [`${key}_2`]: 2,          // dynamic_2: 2
  greet() { return 'hi'; }, // shorthand-метод
  get upper() { return this.name.toUpperCase(); }, // геттер
  set upper(v) { this.name = v.toLowerCase(); },   // сеттер
};
```

### 4. Чтение и запись свойств

```js
obj.name;          // точечная нотация — ключ известен заранее и является идентификатором
obj['full name'];  // скобочная — ключ с пробелами, дефисами или в переменной
obj[key];          // значение переменной key как имя свойства
obj.missing;       // undefined — чтение несуществующего свойства не ошибка
obj.missing.deep;  // TypeError: Cannot read properties of undefined
obj.missing?.deep; // undefined — optional chaining
```

**Ключи всегда строки или символы.** Числа и объекты в качестве ключа приводятся к строке:

```js
const dict = {};
dict[1] = 'a';         // ключ '1'
dict['1'];             // 'a'
const k1 = {}, k2 = {};
dict[k1] = 'x';
dict[k2] = 'y';        // 🪤 оба объекта стали ключом '[object Object]'
dict[k1];              // 'y'
```

Если нужны ключи-объекты, используйте [`Map`](13-map-set.md).

### 5. Проверка наличия свойства

| Способ | `{ x: undefined }`, ключ `'x'` | `{}`, ключ `'toString'` | Что проверяет |
|---|---|---|---|
| `obj.x !== undefined` | `false` 🪤 | `true` | значение не `undefined` — не отличает «нет свойства» от «свойство равно `undefined`» |
| `'x' in obj` | `true` | `true` | есть ли свойство **в объекте или его прототипах** |
| `Object.hasOwn(obj, 'x')` | `true` | `false` | есть ли **собственное** свойство (рекомендуемый способ) |
| `obj.hasOwnProperty('x')` | `true` | `false` | то же, но ломается у `Object.create(null)` и если метод переопределён |

### 6. Удаление свойств

```js
const o = { a: 1, b: 2 };
delete o.a;          // true, свойство удалено
o.b = undefined;     // свойство осталось со значением undefined — это не удаление!

// Иммутабельное «удаление» — rest при деструктуризации
const { b, ...withoutB } = { a: 1, b: 2, c: 3 }; // withoutB = { a: 1, c: 3 }
```

`delete` в горячем коде может ухудшить производительность (V8 переводит объект из «быстрого» режима скрытых классов в «словарный»). Для коллекций с частым удалением подходит `Map`.

### 7. Порядок ключей

Порядок перебора свойств определён спецификацией:
1. сначала **целочисленные** ключи (`'0'`, `'1'`, `'42'`) по возрастанию;
2. затем строковые ключи в порядке **добавления**;
3. символы — в порядке добавления, но их видят только `Reflect.ownKeys` и `getOwnPropertySymbols`.

```js
const o = { b: 1, 2: 'two', a: 2, 1: 'one', '-1': 'neg', '01': 'z' };
Object.keys(o); // ['1', '2', 'b', 'a', '-1', '01']
// '-1' и '01' не являются «каноническими» целыми, поэтому идут как обычные строки
```

🪤 Ловушка: объект с ключами-ID `{ 10: …, 2: … }` всегда отдаст их отсортированными по числу. Если порядок важен (например, порядок с сервера), используйте `Map` или массив.

### 8. Перебор объекта

| Способ | Собственные | Унаследованные | Неперечисляемые | Символы |
|---|---|---|---|---|
| `for...in` | ✅ | ✅ (перечисляемые) | ❌ | ❌ |
| `Object.keys` / `values` / `entries` | ✅ | ❌ | ❌ | ❌ |
| `Object.getOwnPropertyNames` | ✅ | ❌ | ✅ | ❌ |
| `Object.getOwnPropertySymbols` | только символы | ❌ | ✅ | ✅ |
| `Reflect.ownKeys` | ✅ | ❌ | ✅ | ✅ |

```js
const prices = { apple: 50, pear: 80 };

for (const [name, price] of Object.entries(prices)) {
  console.log(name, price);
}

// Преобразование объекта «как массива»: entries → map/filter → fromEntries
const withDiscount = Object.fromEntries(
  Object.entries(prices).map(([name, price]) => [name, price * 0.9]),
); // { apple: 45, pear: 72 }

const expensive = Object.fromEntries(
  Object.entries(prices).filter(([, price]) => price > 60),
); // { pear: 80 }
```

`for...in` используют редко: он проходит и по унаследованным перечисляемым свойствам. Для массивов он не подходит совсем (см. [Циклы](14-loops.md)).

### 9. Деструктуризация

```js
const response = { id: 7, user: { name: 'Аня', city: null }, tags: ['a'] };

const { id } = response;                         // id = 7
const { id: userId } = response;                 // переименование: userId = 7
const { status = 'new' } = response;             // значение по умолчанию: 'new'
const { user: { name } } = response;             // вложенная: name = 'Аня'
const { user: { city = 'не указан' } } = response; // city = null — 🪤 default работает только для undefined!
const { id: _, ...rest } = response;             // rest = { user, tags }

// В параметрах функции — именованные аргументы с умолчаниями
function createUser({ name, role = 'user', active = true } = {}) {
  return { name, role, active };
}
createUser({ name: 'Аня' }); // { name: 'Аня', role: 'user', active: true }
createUser();                // работает благодаря '= {}'
```

### 10. Копирование: поверхностное и глубокое

**Поверхностная копия** (shallow) копирует только верхний уровень. Вложенные объекты остаются общими по ссылке.

```js
const original = { name: 'Аня', address: { city: 'Москва' } };

const copy1 = { ...original };             // spread
const copy2 = Object.assign({}, original); // то же самое

copy1.name = 'Боря';            // original не изменился
copy1.address.city = 'Казань';  // 🪤 original.address.city тоже 'Казань' — объект общий
```

**Глубокая копия** (deep) рекурсивно копирует все уровни.

| Способ | Плюсы | Минусы |
|---|---|---|
| `structuredClone(obj)` | встроенный; поддерживает `Date`, `Map`, `Set`, `RegExp`, типизированные массивы, **циклические ссылки** | функции и DOM-узлы → `DataCloneError`; теряет прототип (экземпляр класса станет обычным объектом), геттеры, символьные ключи |
| `JSON.parse(JSON.stringify(obj))` | работает везде | теряет `undefined`, функции, символы; `Date` → строка; `Map`/`Set` → `{}`; `NaN`/`Infinity` → `null`; циклы → ошибка |
| Своя рекурсивная функция или библиотека (`lodash.cloneDeep`) | полный контроль | код, который надо поддерживать |

```js
const state = { date: new Date(0), tags: new Set(['a']), nested: { n: 1 } };
const deep = structuredClone(state);
deep.nested.n = 2;
state.nested.n;           // 1 — исходник не затронут
deep.date instanceof Date; // true
```

### 11. Слияние объектов

```js
const defaults = { theme: 'light', lang: 'ru', layout: { sidebar: true, width: 240 } };
const userPrefs = { theme: 'dark', layout: { width: 300 } };

const merged = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'ru', layout: { width: 300 } }
// 🪤 layout заменён целиком: sidebar потерялся. Spread — поверхностное слияние.
```

Правила spread и `Object.assign`:
- при совпадении ключей побеждает **последний** источник;
- копируются только **собственные перечисляемые** свойства (включая символы);
- `...null` и `...undefined` игнорируются, строка раскладывается по индексам: `{ ...'ab' }` → `{ 0: 'a', 1: 'b' }`;
- `Object.assign(target, ...)` **мутирует** `target` и вызывает его сеттеры, spread всегда создаёт новый объект.

Для вложенных настроек нужно глубокое слияние (задача 3 ниже).

### 12. Иммутабельное обновление вложенных данных

В React, Redux и Vue (для `shallowRef`) состояние обновляют **без мутации**: создают новый объект на каждом изменённом уровне и переиспользуют неизменённые ветки.

```js
const state = {
  user: { profile: { name: 'Аня', age: 30 }, settings: { theme: 'light' } },
  items: [],
};

const next = {
  ...state,
  user: {
    ...state.user,
    profile: { ...state.user.profile, age: 31 }, // меняем только age
  },
};

next.user.profile.age;                      // 31
state.user.profile.age;                     // 30 — исходник цел
next.user.settings === state.user.settings; // true — неизменённая ветка переиспользована
next.items === state.items;                 // true
```

Так React быстро понимает, что изменилось: достаточно сравнить ссылки (`Object.is`). Для глубоких обновлений используют Immer (`produce`) — он позволяет писать «мутирующий» код, а сам создаёт новые объекты.

### 13. Заморозка: freeze, seal, preventExtensions

| Метод | Добавить свойство | Удалить | Изменить значение | Проверка |
|---|---|---|---|---|
| `Object.preventExtensions` | ❌ | ✅ | ✅ | `Object.isExtensible` |
| `Object.seal` | ❌ | ❌ | ✅ | `Object.isSealed` |
| `Object.freeze` | ❌ | ❌ | ❌ | `Object.isFrozen` |

В нестрогом режиме запрещённые операции молча игнорируются, в strict mode (в модулях и классах он включён) бросают `TypeError`.

🪤 Все три метода **поверхностные**: вложенные объекты остаются изменяемыми.

```js
const config = Object.freeze({ api: '/v1', limits: { rps: 10 } });
config.api = '/v2';      // игнорируется (или TypeError в strict mode)
config.limits.rps = 999; // работает! limits не заморожен
```

Для глубокой заморозки — рекурсивная функция (задача 5). `const` не делает объект неизменяемым: он запрещает только переприсваивание переменной.

### 14. Геттеры и сеттеры

```js
const temperature = {
  celsius: 20,
  get fahrenheit() { return this.celsius * 1.8 + 32; },
  set fahrenheit(f) { this.celsius = (f - 32) / 1.8; },
};
temperature.fahrenheit;       // 68 — вызывается геттер
temperature.fahrenheit = 212; // вызывается сеттер
temperature.celsius;          // 100
```

Геттер выглядит как свойство, но вычисляется при каждом чтении. Тонкая настройка свойств (`writable`, `enumerable`, `configurable`) через `Object.defineProperty` разобрана на странице [Объекты, коллекции, итераторы](06-objects-collections-iterators.md).

### 15. Сравнение объектов

`===` сравнивает ссылки: два разных объекта с одинаковым содержимым не равны.

- **Поверхностное сравнение** (shallow equal) сравнивает ключи верхнего уровня через `Object.is`. Так работают `React.memo` и `PureComponent`.
- **Глубокое сравнение** (deep equal) рекурсивно обходит все уровни. Оно дорогое, и в UI-коде его избегают, полагаясь на иммутабельность и сравнение ссылок.

Реализации обеих функций — в задачах ниже и в [live-coding](08-practice-tasks.md).

### 16. Группировка: Object.groupBy

```js
const orders = [
  { id: 1, status: 'paid' },
  { id: 2, status: 'new' },
  { id: 3, status: 'paid' },
];
const byStatus = Object.groupBy(orders, (o) => o.status);
// { paid: [{id:1}, {id:3}], new: [{id:2}] } — объект БЕЗ прототипа

const byStatusMap = Map.groupBy(orders, (o) => o.status); // Map — если ключи не строки
```

`Object.groupBy` (ES2024) возвращает объект с прототипом `null`, поэтому у результата нет `hasOwnProperty`: проверяйте ключи через `Object.hasOwn` или `in`.

### 17. JSON: сериализация объектов

```js
JSON.stringify({ a: 1, b: [1, 2] });           // '{"a":1,"b":[1,2]}'
JSON.stringify(obj, null, 2);                  // с отступами
JSON.stringify({ a: 1, b: 2 }, ['a']);         // '{"a":1}' — только перечисленные ключи
JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value); // replacer
JSON.parse('{"a":1}', (key, value) => (key === 'date' ? new Date(value) : value)); // reviver
```

Что происходит со значениями при `JSON.stringify`:

| Значение | В объекте | В массиве |
|---|---|---|
| `undefined`, функция, Symbol | свойство **пропадает** | превращается в `null` |
| `NaN`, `Infinity` | `null` | `null` |
| `Date` | строка ISO (через `toJSON`) | строка ISO |
| `Map`, `Set`, `RegExp` | `{}` | `{}` |
| `BigInt` | `TypeError` | `TypeError` |
| циклическая ссылка | `TypeError` | `TypeError` |
| объект с методом `toJSON()` | результат `toJSON()` | результат `toJSON()` |

### 18. Объект или Map в роли словаря

| | Объект `{}` | `Map` |
|---|---|---|
| Типы ключей | строки и символы | любые, включая объекты |
| Порядок | целые ключи первыми, затем порядок добавления | всегда порядок добавления |
| Размер | `Object.keys(o).length` (O(n)) | `map.size` (O(1)) |
| Частые добавления и удаления | медленнее | оптимизирован |
| Прототип с «лишними» ключами | есть (если не `Object.create(null)`) | нет |
| JSON | сериализуется напрямую | нужно преобразовать |
| Когда выбирать | структура с известными полями, конфиг, JSON | динамический словарь, кэш, ключи-объекты |

Подробно — [Map и Set](13-map-set.md).

## Вопросы с собеседований

<details><summary>Как проверить, что у объекта есть свойство? Чем in отличается от Object.hasOwn?</summary>

`'key' in obj` ищет и в собственных свойствах, и в цепочке прототипов, поэтому `'toString' in {}` → `true`. `Object.hasOwn(obj, 'key')` проверяет только собственные свойства и работает для объектов без прототипа — это рекомендуемый способ. Сравнение `obj.key !== undefined` не отличает отсутствие свойства от свойства со значением `undefined`.
</details>

<details><summary>В каком порядке перебираются ключи объекта?</summary>

Сначала целочисленные ключи по возрастанию, затем строковые в порядке добавления, затем символы (их видят только `Reflect.ownKeys` и `getOwnPropertySymbols`). Из-за этого объект с числовыми ID теряет порядок с сервера — в таком случае лучше `Map` или массив.
</details>

<details><summary>Чем поверхностная копия отличается от глубокой? Какие способы глубокого копирования вы знаете?</summary>

Поверхностная (spread, `Object.assign`) копирует только верхний уровень, вложенные объекты остаются общими. Глубокая копирует рекурсивно. Способы: `structuredClone` (поддерживает `Date`, `Map`, `Set`, циклы, но не функции и не прототипы), `JSON.parse(JSON.stringify())` (теряет `undefined`, функции, `Date`, `Map` и падает на циклах), своя рекурсия или `lodash.cloneDeep`.
</details>

<details><summary>Что произойдёт при { ...a, ...b }, если в обоих есть вложенный объект с одинаковым ключом?</summary>

Побеждает значение из `b`, и вложенный объект **заменяется целиком**, а не сливается: spread поверхностный. Для настроек и конфигов нужен deep merge — рекурсивное слияние plain-объектов.
</details>

<details><summary>Как иммутабельно обновить поле на третьем уровне вложенности? Зачем это нужно?</summary>

Создать новый объект на каждом уровне пути через spread, остальные ветки переиспользовать: `{ ...s, a: { ...s.a, b: { ...s.a.b, c: 2 } } }`. Это нужно, чтобы React, Redux и memo-селекторы обнаруживали изменения сравнением ссылок, а не глубоким обходом. На практике для этого используют Immer.
</details>

<details><summary>Чем Object.freeze отличается от const?</summary>

`const` запрещает переприсвоить переменную, но содержимое объекта можно менять. `Object.freeze` запрещает добавлять, удалять и изменять свойства объекта, но только на верхнем уровне: вложенные объекты остаются изменяемыми. В strict mode попытка записи в замороженный объект бросает `TypeError`, иначе молча игнорируется.
</details>

<details><summary>Что потеряется при JSON.stringify?</summary>

Свойства со значениями `undefined`, функции и символы пропадут (в массиве станут `null`). `NaN` и `Infinity` станут `null`, `Date` — строкой, `Map`/`Set` — пустыми объектами. Символьные ключи и неперечисляемые свойства игнорируются. На `BigInt` и циклических ссылках будет `TypeError`. Управлять процессом можно через `toJSON`, replacer и reviver.
</details>

<details><summary>Почему нельзя использовать объект как ключ в обычном объекте?</summary>

Ключ обычного объекта всегда строка или символ, поэтому объект-ключ приводится к строке `'[object Object]'`. Все объекты-ключи совпадут и будут перезаписывать друг друга. Нужен `Map` (или `WeakMap`, если ключи не должны удерживаться в памяти).
</details>

<details><summary>Что такое Object.create(null) и зачем он нужен?</summary>

Объект без прототипа: у него нет `toString`, `hasOwnProperty` и других унаследованных свойств. Используется как «чистый» словарь, где ключ `'constructor'` или `'__proto__'` не столкнётся с унаследованными свойствами (защита от prototype pollution). Такие объекты возвращает `Object.groupBy`. Проверять ключи в них нужно через `Object.hasOwn` или `in`.
</details>

<details><summary>Что такое prototype pollution и как от неё защититься?</summary>

Атака, при которой через рекурсивное слияние или запись по пути (`set(obj, '__proto__.isAdmin', true)`) злоумышленник добавляет свойство в `Object.prototype`, и оно появляется у всех объектов. Защита: в merge и set-по-пути пропускать ключи `__proto__`, `constructor`, `prototype`; использовать `Object.create(null)` или `Map` для пользовательских словарей; проверять данные схемой.
</details>

## Практика

### Предскажите вывод

**1.**
```js
const o = { b: 1, 2: 'two', a: 2, 1: 'one' };
console.log(Object.keys(o).join(','));
```
<details><summary>Ответ</summary>

`'1,2,b,a'`
</details>
<details><summary>Почему так</summary>

Целочисленные ключи всегда идут первыми по возрастанию, затем строковые в порядке добавления.
</details>

**2.**
```js
const a = { n: { deep: 1 } };
const b = { ...a };
b.n.deep = 2;
console.log(a.n.deep, a === b, a.n === b.n);
```
<details><summary>Ответ</summary>

`2 false true`
</details>
<details><summary>Почему так</summary>

Spread создаёт новый объект верхнего уровня (`a !== b`), но свойство `n` копируется по ссылке, поэтому изменение через `b.n` видно в `a.n`.
</details>

**3.**
```js
const k1 = {}, k2 = {};
const dict = {};
dict[k1] = 1;
dict[k2] = 2;
console.log(Object.keys(dict).length, dict[k1]);
```
<details><summary>Ответ</summary>

`1 2`
</details>
<details><summary>Почему так</summary>

Оба объекта превратились в ключ `'[object Object]'`, второе присваивание перезаписало первое.
</details>

**4.**
```js
const { x = 5, y: { z } = { z: 9 }, ...rest } = { y: undefined, q: 1, w: 2 };
const { p = 1 } = { p: null };
console.log(x, z, rest, p);
```
<details><summary>Ответ</summary>

`5 9 { q: 1, w: 2 } null`
</details>
<details><summary>Почему так</summary>

`x` отсутствует → значение по умолчанию 5. `y` равен `undefined` → подставляется `{ z: 9 }`. `rest` собирает оставшиеся свойства. Значение по умолчанию срабатывает **только** для `undefined`, а `null` — это значение, поэтому `p = null`.
</details>

**5.**
```js
console.log(JSON.stringify({ u: undefined, f() {}, n: NaN, d: new Date(0), m: new Map([[1, 2]]), arr: [undefined] }));
```
<details><summary>Ответ</summary>

`{"n":null,"d":"1970-01-01T00:00:00.000Z","m":{},"arr":[null]}`
</details>
<details><summary>Почему так</summary>

`undefined` и функции в объекте пропадают, в массиве — становятся `null`. `NaN` → `null`. `Date` сериализуется через `toJSON` в ISO-строку. `Map` не имеет перечисляемых собственных свойств → `{}`.
</details>

**6.**
```js
const fz = Object.freeze({ x: 1, inner: { y: 1 } });
fz.x = 2;
fz.inner.y = 2;
console.log(fz.x, fz.inner.y);
```
<details><summary>Ответ</summary>

`1 2` (в нестрогом режиме; в strict mode `fz.x = 2` бросит `TypeError`)
</details>
<details><summary>Почему так</summary>

`freeze` поверхностный: верхний уровень заморожен, а вложенный объект `inner` нет.
</details>

**7.**
```js
console.log({ ...null, ...undefined, ...'ab', ...[9] });
```
<details><summary>Ответ</summary>

`{ 0: 9, 1: 'b' }`
</details>
<details><summary>Почему так</summary>

`null` и `undefined` при spread игнорируются. Строка раскладывается по индексам: `{ 0: 'a', 1: 'b' }`. Массив `[9]` даёт `{ 0: 9 }` и перезаписывает ключ `0`.
</details>

**8.**
```js
console.log('x' in { x: undefined }, Object.hasOwn({ x: undefined }, 'x'), 'toString' in {}, Object.hasOwn({}, 'toString'));
```
<details><summary>Ответ</summary>

`true true true false`
</details>
<details><summary>Почему так</summary>

Свойство со значением `undefined` существует, это видят оба способа. `toString` унаследован от `Object.prototype`: `in` его видит, `hasOwn` — нет.
</details>

### Задачи

**1. `get(obj, path, defaultValue)`**

Безопасно прочитайте значение по пути. Путь — строка с точками и индексами в скобках. Если на любом шаге значение `null` или `undefined`, верните `defaultValue`.

| Вызов | Результат |
|---|---|
| `get({ a: { b: [{ c: 1 }] } }, 'a.b[0].c')` | `1` |
| `get({ a: null }, 'a.b.c', 'нет')` | `'нет'` |
| `get({ a: { b: 0 } }, 'a.b', 5)` | `0` (ноль — валидное значение) |

<details><summary>Решение</summary>

```js
function get(obj, path, defaultValue) {
  const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
```

Индексы в скобках сначала превращаются в обычные сегменты пути. Проверка `current == null` ловит и `null`, и `undefined`. Возвращаем `defaultValue` только для `undefined`, чтобы `0`, `''` и `false` не подменялись.
</details>

**2. `setIn(obj, path, value)` — иммутабельная запись по пути**

Верните **новый** объект, в котором по пути `path` (массив ключей) записано `value`. Исходный объект не меняется, неизменённые ветки переиспользуются по ссылке. Недостающие уровни создаются как объекты.

| Вызов | Результат |
|---|---|
| `setIn({ a: { b: 1 }, c: {} }, ['a', 'b'], 2)` | `{ a: { b: 2 }, c: {} }`, причём `c` — тот же объект |
| `setIn({}, ['x', 'y'], 1)` | `{ x: { y: 1 } }` |

<details><summary>Решение</summary>

```js
function setIn(obj, [key, ...rest], value) {
  const source = obj ?? {};
  return {
    ...source,
    [key]: rest.length === 0 ? value : setIn(source[key], rest, value),
  };
}
```

Рекурсия создаёт новый объект только на уровнях вдоль пути, остальные свойства копируются по ссылке. Именно так работают иммутабельные апдейты в Redux и Immer.
</details>

**3. `deepMerge(target, source)`**

Глубоко слейте два объекта и верните новый объект, исходные не меняются.
- Если по ключу в обоих объектах лежат **plain-объекты**, слить их рекурсивно.
- Иначе (примитивы, массивы, `Date`) значение из `source` заменяет значение из `target`.
- Ключи `__proto__`, `constructor`, `prototype` пропускать (защита от prototype pollution).

| Вызов | Результат |
|---|---|
| `deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 3 } })` | `{ a: { x: 1, y: 3 } }` |
| `deepMerge({ list: [1, 2] }, { list: [3] })` | `{ list: [3] }` |

<details><summary>Решение</summary>

```js
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(v));

const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);

function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (FORBIDDEN.has(key)) continue;
    result[key] = isPlainObject(value) && isPlainObject(result[key])
      ? deepMerge(result[key], value)
      : value;
  }
  return result;
}
```

`Object.entries` берёт только собственные перечисляемые свойства. Проверка `isPlainObject` не даёт «слить» `Date` или экземпляр класса как обычный объект.
</details>

**4. `shallowEqual(a, b)`**

Сравните два объекта поверхностно, как это делает `React.memo`: одинаковый набор собственных ключей, значения сравниваются через `Object.is`.

| Вызов | Результат |
|---|---|
| `shallowEqual({ a: 1, b: 'x' }, { b: 'x', a: 1 })` | `true` |
| `shallowEqual({ a: {} }, { a: {} })` | `false` |
| `shallowEqual({ a: NaN }, { a: NaN })` | `true` |

<details><summary>Решение</summary>

```js
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && Object.is(a[key], b[key]));
}
```
</details>

**5. `deepFreeze(obj)`**

Заморозьте объект рекурсивно: все вложенные объекты и массивы тоже. Функция должна корректно работать с циклическими ссылками.

<details><summary>Решение</summary>

```js
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const key of Reflect.ownKeys(obj)) deepFreeze(obj[key], seen);
  return Object.freeze(obj);
}
```

`WeakSet` запоминает уже обработанные объекты, иначе цикл приведёт к бесконечной рекурсии. `Reflect.ownKeys` захватывает и символьные, и неперечисляемые ключи.
</details>

**6. `pick` и `omit`**

`pick(obj, keys)` возвращает новый объект только с указанными ключами (отсутствующие ключи не добавляются). `omit(obj, keys)` возвращает объект без указанных ключей.

| Вызов | Результат |
|---|---|
| `pick({ a: 1, b: 2, c: 3 }, ['a', 'c', 'z'])` | `{ a: 1, c: 3 }` |
| `omit({ a: 1, b: 2, c: 3 }, ['b'])` | `{ a: 1, c: 3 }` |

<details><summary>Решение</summary>

```js
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => Object.hasOwn(obj, k)).map((k) => [k, obj[k]]));

const omit = (obj, keys) => {
  const excluded = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !excluded.has(k)));
};
```

`Set` в `omit` даёт проверку за O(1) вместо `includes` за O(k).
</details>

## Источники
- [learn.javascript.ru — Объекты](https://learn.javascript.ru/object)
- [learn.javascript.ru — Копирование объектов](https://learn.javascript.ru/object-copy)
- [learn.javascript.ru — Object.keys, values, entries](https://learn.javascript.ru/keys-values-entries)
- [learn.javascript.ru — Деструктурирующее присваивание](https://learn.javascript.ru/destructuring-assignment)
- [learn.javascript.ru — Формат JSON](https://learn.javascript.ru/json)
- [learn.javascript.ru — Свойства — геттеры и сеттеры](https://learn.javascript.ru/property-accessors)
- [MDN — structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
- [MDN — Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN — Enumerability and ownership of properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)
