# Map, Set, WeakMap, WeakSet

> ⏱ ~2 ч · 🎯 Знать, что такое `Map` и `Set`, чем они отличаются от объекта и массива, когда их выбирать, уметь выполнять операции над множествами (включая новые методы ES2025) и понимать, зачем нужны слабые коллекции.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Объекты](11-objects.md) · [Массивы](12-arrays.md) · [WeakRef и итераторы](06-objects-collections-iterators.md) · [Алгоритмы: хэш-таблицы](../13-algorithms/README.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу объяснить, чем `Map` лучше объекта как словарь
- [ ] Знаю, как `Map` и `Set` сравнивают ключи (SameValueZero)
- [ ] Умею конвертировать `Map` ↔ объект ↔ массив, `Set` ↔ массив
- [ ] Знаю методы множеств: `union`, `intersection`, `difference`, `isSubsetOf` и др.
- [ ] Понимаю, зачем нужны `WeakMap` и `WeakSet` и почему их нельзя перебрать

## Теория

### 1. Зачем нужны отдельные коллекции

До ES2015 в JS были только объект (как словарь) и массив (как список). У них есть ограничения: ключи объекта — только строки, у объекта есть унаследованные свойства, поиск значения в массиве — O(n). Для этого появились:

| Коллекция | Что хранит | Аналог в других языках | Главное применение |
|---|---|---|---|
| `Map` | пары **ключ → значение**, ключ любого типа | `HashMap`, `dict` | словари, кэши, индексы по ID |
| `Set` | **уникальные** значения | `HashSet`, `set` | дедупликация, быстрые проверки «есть ли» |
| `WeakMap` | пары, где ключ — объект, удерживаемый **слабо** | | метаданные к объектам без утечек памяти |
| `WeakSet` | объекты, удерживаемые слабо | | пометки «объект уже обработан» |

`Map` и `Set` устроены как хэш-таблицы: добавление, поиск и удаление в среднем работают за **O(1)**.

### 2. Map: словарь с ключами любого типа

```js
const scores = new Map();          // пустой
scores.set('Аня', 10);             // добавить или перезаписать, возвращает сам Map
scores.set('Боря', 7).set('Вика', 12); // поэтому можно цепочкой
scores.get('Аня');                 // 10
scores.get('Гена');                // undefined
scores.has('Боря');                // true
scores.delete('Боря');             // true — удалён; повторно вернёт false
scores.size;                       // 2 — свойство, а не метод
scores.clear();                    // удалить всё

const fromPairs = new Map([['a', 1], ['b', 2]]); // из массива пар
```

**Ключом может быть что угодно**: число, объект, функция, `NaN`. Ключи сравниваются по алгоритму **SameValueZero**: как `===`, но `NaN` равен `NaN`.

```js
const m = new Map();
m.set(1, 'число').set('1', 'строка'); // разные ключи: тип важен, приведения нет
m.set(NaN, 'nan');
m.get(NaN);                           // 'nan' — найдено, хотя NaN !== NaN

const user = { id: 1 };
m.set(user, 'данные пользователя');
m.get(user);                          // 'данные пользователя'
m.get({ id: 1 });                     // undefined — другой объект, другая ссылка
```

**Перебор** идёт строго в порядке добавления:

```js
const prices = new Map([['яблоко', 50], ['груша', 80]]);

for (const [fruit, price] of prices) {}     // пары [ключ, значение]
for (const fruit of prices.keys()) {}       // только ключи
for (const price of prices.values()) {}     // только значения
prices.forEach((price, fruit, map) => {});  // 🪤 порядок аргументов: значение, потом ключ
```

### 3. Map или объект

| Критерий | Объект | `Map` |
|---|---|---|
| Типы ключей | строки и символы (остальное приводится к строке) | любые |
| Порядок перебора | сначала целочисленные ключи по возрастанию | всегда порядок добавления |
| Размер | `Object.keys(o).length` — O(n) | `map.size` — O(1) |
| Унаследованные ключи | есть (`toString`, `constructor`) | нет |
| Риск prototype pollution | есть (`__proto__`) | нет |
| Частые добавления и удаления | медленнее (`delete` вредит оптимизациям) | оптимизирован |
| Перебор | через `Object.entries` | напрямую, это итерируемый объект |
| JSON | `JSON.stringify` работает | превращается в `{}` — нужно конвертировать |
| Деструктуризация, spread в объект | да | нет |

**Выбирайте `Map`**, когда ключи заранее неизвестны (динамический словарь), ключи не строки, коллекция часто меняется, важен порядок или нужен размер. **Выбирайте объект**, когда это «запись» с известными полями (`user.name`), конфигурация или данные для JSON.

### 4. Set: множество уникальных значений

```js
const tags = new Set(['js', 'css']);
tags.add('html');       // добавить, возвращает сам Set
tags.add('js');         // дубликат игнорируется
tags.has('css');        // true — за O(1)
tags.delete('css');
tags.size;              // 2

const unique = [...new Set([3, 1, 3, 2, 1])]; // [3, 1, 2] — дедупликация с сохранением порядка
new Set('hello').size;  // 4 — строка тоже итерируемая: h, e, l, o
```

Уникальность определяется через SameValueZero. Значит, два разных объекта с одинаковым содержимым — это **два разных элемента**:

```js
new Set([{}, {}]).size;     // 2
new Set([[1], [1]]).size;   // 2
new Set([NaN, NaN]).size;   // 1
new Set([0, -0]).size;      // 1
```

Чтобы дедуплицировать объекты по содержимому, нужен ключ (`id`) или сериализация — см. задачу `uniqBy` на странице [Массивы](12-arrays.md).

### 5. Операции над множествами (ES2025)

Раньше пересечение и разность писали через `filter`. Теперь у `Set` есть встроенные методы. Все они возвращают **новый** `Set` и принимают любой «set-like» объект (с `size`, `has` и `keys`, например `Map`).

```js
const frontend = new Set(['js', 'css', 'html']);
const backend = new Set(['js', 'sql', 'go']);
```

| Метод | Результат для примера | Смысл |
|---|---|---|
| `frontend.union(backend)` | `{js, css, html, sql, go}` | объединение A ∪ B |
| `frontend.intersection(backend)` | `{js}` | пересечение A ∩ B |
| `frontend.difference(backend)` | `{css, html}` | разность A \ B: есть в A, нет в B |
| `frontend.symmetricDifference(backend)` | `{css, html, sql, go}` | есть ровно в одном из двух |
| `new Set(['js']).isSubsetOf(frontend)` | `true` | все ли элементы A есть в B |
| `frontend.isSupersetOf(new Set(['css']))` | `true` | содержит ли A все элементы B |
| `frontend.isDisjointFrom(new Set(['go']))` | `true` | нет ли общих элементов |

Для старых окружений эквиваленты на массивах:

```js
const union = new Set([...a, ...b]);
const intersection = new Set([...a].filter((x) => b.has(x)));
const difference = new Set([...a].filter((x) => !b.has(x)));
```

### 6. Конвертация между коллекциями

```js
// Set ↔ массив
const arr = [...set];             // или Array.from(set)
const set = new Set(arr);

// Map ↔ объект
const obj = Object.fromEntries(map);      // ключи станут строками
const map = new Map(Object.entries(obj));

// Map ↔ массив пар
const pairs = [...map];                   // [[k, v], ...]

// Map → JSON и обратно
const json = JSON.stringify([...map]);    // JSON.stringify(map) дал бы '{}'
const restored = new Map(JSON.parse(json));

// Map/Set → преобразование через массив
const doubled = new Map([...map].map(([k, v]) => [k, v * 2]));
const evens = new Set([...set].filter((x) => x % 2 === 0));

// Группировка сразу в Map
const byParity = Map.groupBy([1, 2, 3], (x) => (x % 2 ? 'odd' : 'even')); // Map { 'odd' => [1, 3], 'even' => [2] }
```

### 7. Когда нужны Map и Set: типичные задачи

| Задача | Решение | Почему не массив/объект |
|---|---|---|
| Убрать дубликаты | `[...new Set(arr)]` | O(n) вместо O(n²) |
| Многократно проверять «есть ли значение» | `const allowed = new Set(ids)` → `allowed.has(id)` | O(1) вместо O(n) на каждую проверку |
| Индекс сущностей по ID | `new Map(users.map((u) => [u.id, u]))` | порядок, любые типы ID, `size` |
| Посчитать частоту | `counts.set(x, (counts.get(x) ?? 0) + 1)` | |
| Кэш (мемоизация) с ключами-объектами | `Map` или `WeakMap` | объект как ключ невозможен в `{}` |
| LRU-кэш | `Map` (сохраняет порядок вставки) | `delete` + `set` перемещают ключ в конец |
| Посещённые узлы при обходе графа | `Set` | |
| Выбранные элементы в UI (чекбоксы) | `Set` идентификаторов | toggle за O(1) |

```js
// Частотный словарь
const words = ['a', 'b', 'a', 'c', 'a'];
const freq = new Map();
for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
// Map { 'a' => 3, 'b' => 1, 'c' => 1 }
const mostFrequent = [...freq].reduce((best, cur) => (cur[1] > best[1] ? cur : best)); // ['a', 3]
```

🪤 Map и Set в состоянии React: мутирующий `set.add(x)` не меняет ссылку, и React не увидит изменения. Создавайте новую коллекцию: `setSelected((prev) => new Set(prev).add(id))`.

### 8. WeakMap и WeakSet

Обычный `Map` **удерживает** свои ключи: пока объект лежит в `Map`, сборщик мусора не может его удалить, даже если больше нигде ссылок нет. Это источник утечек памяти, например при кэшировании данных для DOM-узлов, которые потом удаляются.

`WeakMap` держит ключи **слабо**: если на объект-ключ не осталось других ссылок, он удаляется сборщиком мусора вместе со значением.

```js
const metadata = new WeakMap();

function track(element) {
  metadata.set(element, { clicks: 0, createdAt: Date.now() });
}
// Когда element удалят из DOM и забудут, запись в metadata исчезнет сама
```

Ограничения, которые следуют из «слабости»:
- ключи только **объекты** (и незарегистрированные символы), примитив → `TypeError`;
- **нельзя перебрать** и нет `size`: содержимое зависит от того, когда сработал сборщик мусора, поэтому результат был бы недетерминированным;
- есть только `get`, `set`, `has`, `delete`.

Применение:
- приватные данные экземпляров (до появления `#private` полей);
- кэш вычислений по объекту (`memoize` для функций от объекта);
- метаданные для DOM-узлов и чужих объектов без утечек;
- `WeakSet` — пометки «уже обработан», защита от циклов при обходе графа объектов (см. `deepFreeze` на странице [Объекты](11-objects.md)).

`WeakRef` и `FinalizationRegistry` — следующий уровень управления памятью — разобраны на странице [Объекты, коллекции, итераторы](06-objects-collections-iterators.md).

## Вопросы с собеседований

<details><summary>Чем Map отличается от обычного объекта?</summary>

Ключи любого типа без приведения к строке; гарантированный порядок добавления; `size` за O(1); нет унаследованных ключей и риска prototype pollution; оптимизирован для частых добавлений и удалений; итерируется напрямую. Минусы: не сериализуется в JSON без преобразования, нет деструктуризации. Объект — для записей с известными полями, `Map` — для динамических словарей.
</details>

<details><summary>Как Map и Set сравнивают ключи?</summary>

По алгоритму SameValueZero: как `===`, но `NaN` равен `NaN`, а `+0` и `-0` считаются одинаковыми. Приведения типов нет: `1` и `'1'` — разные ключи. Объекты сравниваются по ссылке, поэтому `map.get({ id: 1 })` не найдёт значение, записанное под другим объектом с таким же содержимым.
</details>

<details><summary>Как удалить дубликаты из массива объектов?</summary>

`Set` сам по себе не поможет: разные объекты — разные элементы. Нужен ключ: пройти массив, запоминая ключи в `Set`, или построить `new Map(arr.map((x) => [x.id, x]))` и взять `values()` (останется последнее вхождение). Оба способа O(n).
</details>

<details><summary>Почему WeakMap нельзя перебрать и у него нет size?</summary>

Записи исчезают, когда сборщик мусора удаляет ключ, а момент сборки недетерминирован. Если бы `WeakMap` можно было перебрать, результат зависел бы от того, успел ли сработать GC, — это сделало бы программу непредсказуемой и раскрыло бы детали работы GC. Поэтому доступ только по известному ключу.
</details>

<details><summary>Когда использовать WeakMap?</summary>

Когда нужно привязать данные к объекту, временем жизни которого вы не управляете, и не мешать сборщику мусора: кэш вычислений по объекту, метаданные для DOM-узлов, приватные данные экземпляров. Обычный `Map` в этих случаях удерживал бы объекты и вызывал утечку памяти.
</details>

<details><summary>Как сделать пересечение и разность двух множеств?</summary>

В современных средах — `a.intersection(b)` и `a.difference(b)` (ES2025). Раньше — `new Set([...a].filter((x) => b.has(x)))` и `new Set([...a].filter((x) => !b.has(x)))`. Оба способа работают за O(|A|), потому что `has` — O(1).
</details>

<details><summary>Почему Map удобен для LRU-кэша?</summary>

`Map` хранит порядок вставки. При обращении к ключу его удаляют и вставляют заново — он перемещается в конец как «самый свежий». При переполнении удаляют первый ключ: `map.keys().next().value` — это самый давно использованный. Все операции O(1).
</details>

<details><summary>Как хранить Set или Map в состоянии React?</summary>

Иммутабельно: на каждое изменение создавать новую коллекцию — `setSelected((prev) => { const next = new Set(prev); next.add(id); return next; })`. Мутация `prev.add(id)` не меняет ссылку, и React не перерисует компонент. Для сериализации (URL, localStorage) — конвертировать в массив.
</details>

## Практика

### Предскажите вывод

**1.**
```js
const m = new Map();
m.set(1, 'число').set('1', 'строка').set(NaN, 'nan');
console.log(m.size, m.get(NaN), m.get(Number('1')));
```
<details><summary>Ответ</summary>

`3 'nan' 'число'`
</details>
<details><summary>Почему так</summary>

`1` и `'1'` — разные ключи, приведения типов нет. `NaN` находится благодаря SameValueZero. `Number('1')` — это число `1`.
</details>

**2.**
```js
console.log(new Set([{}, {}]).size, new Set([NaN, NaN]).size, new Set('hello').size);
```
<details><summary>Ответ</summary>

`2 1 4`
</details>
<details><summary>Почему так</summary>

Два литерала `{}` — разные объекты. `NaN` для `Set` равен себе. Строка итерируется по символам, а `l` встречается дважды.
</details>

**3.**
```js
console.log(JSON.stringify(new Map([[1, 2]])), JSON.stringify([...new Map([[1, 2]])]));
```
<details><summary>Ответ</summary>

`'{}' '[[1,2]]'`
</details>
<details><summary>Почему так</summary>

У `Map` нет собственных перечисляемых свойств, поэтому JSON видит пустой объект. Массив пар сериализуется нормально.
</details>

**4.**
```js
const m = new Map([['a', 1]]);
m.set('b', 2).set('a', 3);
console.log([...m.keys()].join(''), m.get('a'));
```
<details><summary>Ответ</summary>

`'ab' 3`
</details>
<details><summary>Почему так</summary>

Повторный `set` существующего ключа обновляет значение, но **не меняет позицию** ключа. Чтобы переместить ключ в конец (как в LRU), его нужно удалить и вставить заново.
</details>

**5.**
```js
const s = new Set([1, 2, 3]);
for (const x of s) if (x === 1) s.add(4);
console.log([...s]);
```
<details><summary>Ответ</summary>

`[1, 2, 3, 4]`
</details>
<details><summary>Почему так</summary>

Элементы, добавленные во время перебора, будут перебраны, если итератор до них дойдёт. Цикл здесь конечный, потому что `4` добавляется только при `x === 1`.
</details>

**6.**
```js
try { new WeakMap().set('key', 1); } catch (e) { console.log(e.constructor.name); }
console.log(typeof new WeakMap().size);
```
<details><summary>Ответ</summary>

`'TypeError' 'undefined'`
</details>
<details><summary>Почему так</summary>

Ключ `WeakMap` должен быть объектом (или незарегистрированным символом). Свойства `size` у слабых коллекций нет.
</details>

### Задачи

**1. `countBy(arr, keyFn)` — частотный словарь**

Посчитайте, сколько раз встречается каждый ключ. Верните `Map` с ключами в порядке первого появления.

| Вызов | Результат |
|---|---|
| `countBy(['a', 'b', 'a'], (x) => x)` | `Map { 'a' => 2, 'b' => 1 }` |
| `countBy([1.2, 1.7, 2.1], Math.floor)` | `Map { 1 => 2, 2 => 1 }` |

<details><summary>Решение</summary>

```js
function countBy(arr, keyFn) {
  const counts = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
```
</details>

**2. `LRUCache(capacity)`**

Реализуйте кэш с вытеснением давно не использованных записей.
- `get(key)` возвращает значение или `undefined` и делает ключ «самым свежим».
- `set(key, value)` добавляет или обновляет значение и делает ключ самым свежим. Если размер превысил `capacity`, удаляется самый старый ключ.
- `size` — текущее количество записей.
- Все операции O(1).

<details><summary>Решение</summary>

```js
class LRUCache {
  #map = new Map();

  constructor(capacity) {
    this.capacity = capacity;
  }

  get size() {
    return this.#map.size;
  }

  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    this.#map.delete(key);   // перемещаем в конец — «самый свежий»
    this.#map.set(key, value);
    return value;
  }

  set(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size > this.capacity) {
      this.#map.delete(this.#map.keys().next().value); // первый ключ — самый старый
    }
  }
}
```
</details>

**3. `toggleInSet(set, value)` — иммутабельно**

Для состояния выбранных элементов в UI: верните **новый** `Set`, в котором `value` добавлен, если его не было, или удалён, если был. Исходный `Set` не меняется.

<details><summary>Решение</summary>

```js
function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
```
</details>

**4. `memoizeByObject(fn)` без утечек памяти**

Мемоизируйте функцию одного аргумента-объекта: при повторном вызове с **тем же объектом** вернуть закэшированный результат. Кэш не должен мешать сборщику мусора удалять объекты-аргументы.

<details><summary>Решение</summary>

```js
function memoizeByObject(fn) {
  const cache = new WeakMap();
  return (obj) => {
    if (!cache.has(obj)) cache.set(obj, fn(obj));
    return cache.get(obj);
  };
}
```

`WeakMap` не удерживает ключи: когда объект станет недостижим, запись в кэше исчезнет сама. С обычным `Map` кэш рос бы бесконечно.
</details>

**5. `diffSets(prev, next)`**

Сравните два множества ID (например, выбранные строки таблицы до и после) и верните, какие ID добавлены, а какие удалены.

| Вызов | Результат |
|---|---|
| `diffSets(new Set([1, 2, 3]), new Set([2, 3, 4]))` | `{ added: [4], removed: [1] }` |

<details><summary>Решение</summary>

```js
function diffSets(prev, next) {
  return {
    added: [...next].filter((id) => !prev.has(id)),
    removed: [...prev].filter((id) => !next.has(id)),
  };
}
// В средах с ES2025: [...next.difference(prev)], [...prev.difference(next)]
```
</details>

## Источники
- [learn.javascript.ru — Map и Set](https://learn.javascript.ru/map-set)
- [learn.javascript.ru — WeakMap и WeakSet](https://learn.javascript.ru/weakmap-weakset)
- [MDN — Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN — Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN — Set composition methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition)
- [MDN — WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
