# Работа с массивами

> ⏱ ~3.5 ч · 🎯 Знать все основные методы массивов, понимать, какие из них мутируют исходный массив, а какие нет, знать сложность операций, уверенно писать цепочки `map` / `filter` / `reduce`, правильно сортировать и избегать ловушек дыр, `sort` и `length`.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Объекты](11-objects.md) · [Map и Set](13-map-set.md) · [Циклы](14-loops.md) · [Алгоритмы](../13-algorithms/README.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю наизусть, какие методы мутируют массив
- [ ] Знаю иммутабельные аналоги ES2023: `toSorted`, `toReversed`, `toSpliced`, `with`
- [ ] Могу объяснить, почему `[10, 1, 2].sort()` даёт `[1, 10, 2]`
- [ ] Знаю сложность `push`, `shift`, `includes`, `splice`
- [ ] Уверенно пишу `reduce` и знаю, когда он не нужен
- [ ] Понимаю, что такое дыры (sparse arrays) и array-like объекты

## Теория

### 1. Что такое массив в JS

Массив — это **упорядоченная коллекция** значений с доступом по индексу от 0. Технически это объект со специальным свойством `length` и ключами-индексами. Поэтому:

- `typeof [] === 'object'`, проверять нужно через `Array.isArray`;
- в одном массиве можно хранить значения разных типов (но лучше не надо — движок оптимизирует однотипные массивы);
- массив динамический: растёт и уменьшается сам.

Под капотом V8 хранит плотные массивы из чисел или объектов как непрерывный блок памяти (быстро), а массивы с дырами и разнотипными значениями — в более медленном представлении.

### 2. Создание массивов

```js
const a = [1, 2, 3];                         // литерал — основной способ
const b = Array.from({ length: 3 }, (_, i) => i * 2); // [0, 2, 4] — генерация по индексу
const c = Array.from('abc');                 // ['a', 'b', 'c'] — из любого итерируемого
const d = Array.from(new Set([1, 1, 2]));    // [1, 2] — из Set
const e = Array.of(3);                       // [3]
const f = new Array(3);                      // [ <3 empty items> ] — 🪤 три дыры, а не [3]
const g = new Array(3).fill(0);              // [0, 0, 0]
const h = [...'abc', ...a];                  // spread итерируемых
```

🪤 `new Array(3).map((_, i) => i)` вернёт снова массив из дыр: `map` пропускает дыры. Используйте `Array.from({ length: 3 }, (_, i) => i)`.

### 3. length и дыры

`length` — это **наибольший индекс + 1**, а не количество элементов. Его можно менять вручную.

```js
const arr = [1, 2, 3];
arr.length = 1;      // [1] — массив обрезан, элементы удалены
arr[5] = 6;          // [1, <4 empty items>, 6], length = 6
arr.length = 0;      // самый быстрый способ очистить массив «на месте»
```

**Дыры** (sparse arrays) — отсутствующие индексы: `[1, , 3]`, `new Array(3)`, `delete arr[i]`. Методы обходят их по-разному: `forEach`, `map`, `filter`, `reduce` **пропускают** дыры, а `for...of`, spread, `Array.from`, `find`, `includes` видят их как `undefined`. Избегайте дыр: они ломают ожидания и замедляют массив.

### 4. Мутирующие и немутирующие методы

Главная таблица страницы. В React и Redux мутировать state нельзя, поэтому эту разницу нужно знать наизусть.

| Задача | Мутирует исходный массив | Возвращает новый массив |
|---|---|---|
| Добавить в конец | `push(x)` → новая длина | `[...arr, x]`, `arr.concat(x)` |
| Добавить в начало | `unshift(x)` → новая длина | `[x, ...arr]` |
| Удалить последний | `pop()` → удалённый элемент | `arr.slice(0, -1)` |
| Удалить первый | `shift()` → удалённый элемент | `arr.slice(1)` |
| Удалить/вставить в середине | `splice(start, count, ...items)` → удалённые элементы | `toSpliced(start, count, ...items)` (ES2023) |
| Заменить элемент по индексу | `arr[i] = x` | `with(i, x)` (ES2023) |
| Отсортировать | `sort(cmp)` → **тот же** массив | `toSorted(cmp)` (ES2023) |
| Развернуть | `reverse()` → тот же массив | `toReversed()` (ES2023) |
| Заполнить | `fill(value, start, end)` | `Array.from({ length }, fn)` |
| Скопировать часть внутрь себя | `copyWithin` | — |
| Удалить по условию | — (цикл со `splice` с конца) | `filter(fn)` |

```js
const sorted = arr.sort();        // 🪤 sorted === arr — исходный массив тоже отсортирован
const safe = arr.toSorted();      // arr не тронут
const next = state.with(2, 'new'); // иммутабельная замена по индексу
```

### 5. Методы обхода и преобразования

| Метод | Возвращает | Когда использовать |
|---|---|---|
| `forEach(fn)` | `undefined` | побочные эффекты. Нельзя прервать (кроме исключения) — для раннего выхода используйте `for...of` или `some`/`find` |
| `map(fn)` | новый массив той же длины | преобразовать каждый элемент |
| `filter(fn)` | новый массив подходящих элементов | отобрать |
| `reduce(fn, init)` | одно значение | свернуть в число, объект, Map |
| `reduceRight` | одно значение | то же, справа налево |
| `flatMap(fn)` | новый массив | `map` + `flat(1)`: «один элемент → 0..n элементов» |
| `flat(depth = 1)` | новый массив | развернуть вложенность, `flat(Infinity)` — полностью |
| `some(fn)` | boolean | есть ли хоть один подходящий, останавливается на первом |
| `every(fn)` | boolean | все ли подходят, останавливается на первом неподходящем |

Колбэк получает три аргумента: `(element, index, array)`.

```js
const users = [
  { name: 'Аня', age: 30, active: true },
  { name: 'Боря', age: 17, active: false },
  { name: 'Вика', age: 25, active: true },
];

const activeNames = users.filter((u) => u.active).map((u) => u.name); // ['Аня', 'Вика']
const totalAge = users.reduce((sum, u) => sum + u.age, 0);            // 72
const hasMinor = users.some((u) => u.age < 18);                        // true
const allNamed = users.every((u) => u.name.length > 0);                // true
const byName = users.reduce((acc, u) => ({ ...acc, [u.name]: u }), {}); // 🪤 O(n²) из-за копирования
const byNameFast = Object.fromEntries(users.map((u) => [u.name, u]));   // O(n)
const words = ['a b', 'c'].flatMap((s) => s.split(' '));                // ['a', 'b', 'c']
```

**`reduce` без начального значения** берёт первый элемент как аккумулятор, а на пустом массиве бросает `TypeError`. Всегда передавайте `init`.

**`some` и `every` на пустом массиве**: `[].some(...)` → `false`, `[].every(...)` → `true` (vacuous truth, «для всех элементов пустого множества утверждение истинно»).

### 6. Поиск

| Метод | Возвращает | Сравнение | Сложность |
|---|---|---|---|
| `includes(x)` | boolean | SameValueZero (находит `NaN`) | O(n) |
| `indexOf(x)` / `lastIndexOf(x)` | индекс или `-1` | `===` (не находит `NaN`) | O(n) |
| `find(fn)` / `findLast(fn)` | элемент или `undefined` | по условию | O(n) |
| `findIndex(fn)` / `findLastIndex(fn)` | индекс или `-1` | по условию | O(n) |
| `at(i)` | элемент, поддерживает `-1` | | O(1) |

🪤 Частая ошибка производительности: `bigArray.filter((x) => otherArray.includes(x))` — это O(n × m). Если `otherArray` большой, сначала сделайте из него `Set`: `const set = new Set(otherArray)` и затем `set.has(x)` за O(1). Подробнее — [Map и Set](13-map-set.md).

### 7. Сортировка

**Без компаратора `sort` сравнивает элементы как строки**:

```js
[10, 1, 2].sort();          // [1, 10, 2] — '10' < '2' как строки
[3, 20, 100].sort();        // [100, 20, 3]
[-1, 0, 2].sort();          // [-1, 0, 2] — повезло, '-' < '0' < '2'
['b', 'a', 'C'].sort();     // ['C', 'a', 'b'] — заглавные раньше
[undefined, 3, 1].sort();   // [1, 3, undefined] — undefined всегда в конец
```

**Компаратор** `(a, b) => число`: отрицательное — `a` раньше, положительное — `b` раньше, `0` — порядок сохраняется.

```js
nums.sort((a, b) => a - b);                    // числа по возрастанию
nums.sort((a, b) => b - a);                    // по убыванию
words.sort((a, b) => a.localeCompare(b, 'ru')); // строки по алфавиту
users.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name)); // по возрасту, затем по имени
dates.sort((a, b) => a.getTime() - b.getTime());
files.sort(new Intl.Collator('ru', { numeric: true }).compare); // 'файл2' < 'файл10'
```

🪤 Компаратор, возвращающий boolean (`(a, b) => a > b`), **некорректен**: `false` превращается в `0` («равны»), и результат зависит от движка.

Свойства `sort` в современных движках:
- **стабильная** (гарантировано с ES2019): элементы с равными ключами сохраняют исходный порядок — поэтому сортировка «сначала по имени, потом по возрасту» работает;
- сложность O(n log n) (V8 использует TimSort);
- **мутирует** массив и возвращает его же. Для иммутабельности — `toSorted` или `[...arr].sort()`.

### 8. Копирование и сравнение массивов

```js
const copy1 = [...arr];
const copy2 = arr.slice();
const copy3 = Array.from(arr);
// Все три — поверхностные: вложенные объекты общие
const matrix = [[1, 2], [3, 4]];
const shallow = [...matrix];
shallow[0][0] = 9;        // matrix[0][0] тоже 9
const deep = structuredClone(matrix);
```

`[1, 2] === [1, 2]` → `false`: массивы — объекты, сравниваются по ссылке. Поэлементное сравнение:

```js
const arraysEqual = (a, b) => a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
```

### 9. Деструктуризация и spread

```js
const [first, second = 'default', ...rest] = [1, undefined, 3, 4];
// first = 1, second = 'default', rest = [3, 4]
const [, , third] = ['a', 'b', 'c'];     // пропуск элементов: third = 'c'
let x = 1, y = 2;
[x, y] = [y, x];                         // обмен значений без временной переменной
const max = Math.max(...nums);           // 🪤 на массивах из ~100 тыс. элементов переполнит стек
```

### 10. Array-like и итерируемые

**Array-like** — объект с индексами и `length`, но без методов массива: `arguments`, `NodeList` (частично), `HTMLCollection`, строки. **Итерируемый** — объект с `Symbol.iterator`: массивы, строки, `Map`, `Set`, `NodeList`, генераторы.

```js
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
Array.from(arrayLike);                    // ['a', 'b'] — Array.from понимает и array-like, и итерируемые
[...arrayLike];                           // TypeError — spread требует итерируемый
Array.from(document.querySelectorAll('li'), (li) => li.textContent);
```

### 11. Сложность операций

| Операция | Сложность | Почему |
|---|---|---|
| `arr[i]`, `arr.at(i)`, `arr.length` | O(1) | прямой доступ |
| `push`, `pop` | O(1) амортизированно | работа с концом |
| `shift`, `unshift` | O(n) | сдвиг всех индексов |
| `splice` в середине | O(n) | сдвиг хвоста |
| `includes`, `indexOf`, `find` | O(n) | линейный поиск |
| `map`, `filter`, `forEach`, `reduce` | O(n) | проход по всем элементам |
| `slice`, spread, `concat` | O(n) | копирование |
| `sort` | O(n log n) | |

Отсюда два практических правила:
- очередь на массиве с `shift` для больших объёмов работает медленно — нужна очередь на двух указателях или связном списке ([Алгоритмы](../13-algorithms/README.md));
- многократный поиск по массиву заменяйте на `Set` или `Map`.

**Цепочки методов** (`filter().map().reduce()`) создают промежуточные массивы. Для типичных UI-размеров (сотни и тысячи элементов) это неважно, а читаемость важнее. Для сотен тысяч элементов в горячем пути — один цикл или итераторные хелперы (`arr.values().filter().map()` — ленивые, см. [Новинки JS](15-whats-new.md)).

### 12. Типизированные массивы (кратко)

`Uint8Array`, `Int32Array`, `Float64Array` и другие — массивы фиксированной длины с элементами одного числового типа поверх `ArrayBuffer`. Нужны для бинарных данных: файлы, WebSocket, WebGL, Canvas (`ImageData.data` — `Uint8ClampedArray`), WebAssembly, криптография. Обычные методы (`map`, `filter`, `sort`) у них есть, но `push` нет.

## Вопросы с собеседований

<details><summary>Какие методы массива мутируют исходный массив?</summary>

`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`, а также присваивание по индексу и изменение `length`. Немутирующие аналоги: `slice`, `concat`, spread, `filter`, `map`, а для сортировки, разворота, вставки и замены — `toSorted`, `toReversed`, `toSpliced`, `with` из ES2023. Для state в React и Redux используют только немутирующие.
</details>

<details><summary>Почему [10, 1, 2].sort() возвращает [1, 10, 2]?</summary>

Без компаратора `sort` приводит элементы к строкам и сравнивает их посимвольно по кодам UTF-16: `'10' < '2'`, потому что `'1' < '2'`. Для чисел нужен компаратор `(a, b) => a - b`. Ещё два момента: `sort` мутирует массив и стабилен с ES2019.
</details>

<details><summary>Чем map отличается от forEach?</summary>

`map` возвращает новый массив той же длины с преобразованными элементами, `forEach` возвращает `undefined` и нужен для побочных эффектов. Использовать `map` ради побочного эффекта без использования результата — антипаттерн. Ни тот ни другой нельзя прервать: для раннего выхода есть `for...of`, `some`, `every`, `find`.
</details>

<details><summary>Чем slice отличается от splice?</summary>

`slice(start, end)` возвращает копию части массива и не меняет исходный. `splice(start, deleteCount, ...items)` меняет массив на месте: удаляет и/или вставляет элементы и возвращает удалённые. Иммутабельный аналог `splice` — `toSpliced`.
</details>

<details><summary>Как удалить дубликаты из массива?</summary>

Примитивы: `[...new Set(arr)]` или `Array.from(new Set(arr))` — O(n). Объекты по ключу: пройти массив, запоминая ключи в `Set`, или `[...new Map(arr.map((x) => [x.id, x])).values()]` (оставит последнее вхождение). Вариант `arr.filter((x, i) => arr.indexOf(x) === i)` работает, но за O(n²).
</details>

<details><summary>Что вернёт reduce на пустом массиве?</summary>

С начальным значением — начальное значение. Без него — `TypeError: Reduce of empty array with no initial value`. Без `init` первым аккумулятором становится первый элемент, что часто приводит к ошибкам типов, поэтому `init` нужно передавать всегда.
</details>

<details><summary>Чем includes отличается от indexOf?</summary>

`includes` возвращает boolean и использует SameValueZero, поэтому находит `NaN`. `indexOf` возвращает индекс и сравнивает через `===`, `NaN` не находит. Оба работают за O(n). Для многократных проверок нужен `Set`.
</details>

<details><summary>Что такое дыры в массиве и почему их стоит избегать?</summary>

Отсутствующие индексы: `[1, , 3]`, `new Array(3)`, `delete arr[1]`. Методы обрабатывают их непоследовательно: `forEach`, `map`, `filter` пропускают, а `for...of`, spread, `find` видят `undefined`. Кроме того, V8 переводит массив с дырами в более медленное представление. Создавать массивы нужно через `Array.from({ length }, fn)` или `fill`.
</details>

<details><summary>Как стабильность сортировки помогает на практике?</summary>

Стабильная сортировка сохраняет относительный порядок элементов с равными ключами. Поэтому можно сортировать по нескольким полям последовательно (сначала по второстепенному, затем по главному) или кликать по заголовкам таблицы, и порядок внутри групп не будет «прыгать». В JS `sort` стабилен с ES2019.
</details>

<details><summary>Почему Math.max(...arr) может упасть?</summary>

Spread передаёт каждый элемент отдельным аргументом. У движков есть лимит на количество аргументов и размер стека — на массивах порядка сотен тысяч элементов будет `RangeError: Maximum call stack size exceeded`. Безопасно — `arr.reduce((m, x) => Math.max(m, x), -Infinity)` или цикл.
</details>

## Практика

### Предскажите вывод

**1.**
```js
console.log([10, 1, 2].sort(), [3, 20, 100].sort());
```
<details><summary>Ответ</summary>

`[1, 10, 2] [100, 20, 3]`
</details>
<details><summary>Почему так</summary>

Без компаратора элементы сравниваются как строки: `'1' < '10' < '2'` и `'100' < '20' < '3'` (сравнение посимвольное).
</details>

**2.**
```js
const arr = [3, 1, 2];
const sorted = arr.sort();
console.log(sorted === arr, arr);
```
<details><summary>Ответ</summary>

`true [1, 2, 3]`
</details>
<details><summary>Почему так</summary>

`sort` сортирует массив на месте и возвращает тот же массив. Для копии — `toSorted()`.
</details>

**3.**
```js
const a = [1, 2, 3];
const removed = a.splice(1, 1, 'x', 'y');
console.log(a, removed);
```
<details><summary>Ответ</summary>

`[1, 'x', 'y', 3] [2]`
</details>
<details><summary>Почему так</summary>

С позиции 1 удалён один элемент (`2`), на его место вставлены `'x'` и `'y'`. `splice` возвращает массив удалённых элементов.
</details>

**4.**
```js
const sparse = [1, , 3];
console.log(sparse.length, sparse.map((x) => x * 2), [...sparse]);
```
<details><summary>Ответ</summary>

`3 [2, <1 empty item>, 6] [1, undefined, 3]`
</details>
<details><summary>Почему так</summary>

Дыра учитывается в `length`. `map` пропускает дыру и оставляет её в результате. Spread использует итератор, а он отдаёт `undefined` на месте дыры.
</details>

**5.**
```js
console.log([1, 2, 3].map(parseInt), ['1', '2'].map(Number));
```
<details><summary>Ответ</summary>

`[1, NaN, NaN] [1, 2]`
</details>
<details><summary>Почему так</summary>

`map` передаёт `(element, index)`, и индекс становится основанием системы счисления в `parseInt`. `Number` принимает только один аргумент.
</details>

**6.**
```js
console.log([].every((x) => false), [].some((x) => true));
try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.constructor.name); }
```
<details><summary>Ответ</summary>

`true false`, `'TypeError'`
</details>
<details><summary>Почему так</summary>

На пустом массиве `every` истинен (нет контрпримера), `some` ложен (нет примера). `reduce` без начального значения на пустом массиве бросает `TypeError`.
</details>

**7.**
```js
const b = [1];
b[5] = 6;
const c = [1, 2, 3];
c.length = 1;
console.log(b.length, c);
```
<details><summary>Ответ</summary>

`6 [1]`
</details>
<details><summary>Почему так</summary>

Запись по индексу 5 делает `length = 6`, а индексы 1–4 становятся дырами. Уменьшение `length` удаляет элементы за новой длиной.
</details>

**8.**
```js
console.log([1, [2, [3, [4]]]].flat(), [1, [2, [3, [4]]]].flat(Infinity).length);
```
<details><summary>Ответ</summary>

`[1, 2, [3, [4]]] 4`
</details>
<details><summary>Почему так</summary>

По умолчанию `flat` разворачивает только один уровень вложенности, `flat(Infinity)` — все.
</details>

**9.**
```js
const m = [[1, 2], [3, 4]];
const copy = [...m];
copy[0][0] = 9;
copy[1] = 'x';
console.log(m[0][0], m[1]);
```
<details><summary>Ответ</summary>

`9 [3, 4]`
</details>
<details><summary>Почему так</summary>

Spread копирует только внешний массив. Вложенный `[1, 2]` общий, поэтому изменение `copy[0][0]` видно в `m`. А замена элемента `copy[1]` целиком на исходный массив не влияет.
</details>

**10.**
```js
console.log([1, 2, 3].with(1, 9), [1, 2, 3, 4, 5].toSpliced(1, 2), [1, 2, 3, 4].findLast((x) => x % 2));
```
<details><summary>Ответ</summary>

`[1, 9, 3] [1, 4, 5] 3`
</details>
<details><summary>Почему так</summary>

`with` возвращает копию с заменённым элементом, `toSpliced` — копию с удалёнными двумя элементами начиная с индекса 1. `findLast` ищет с конца: последний нечётный элемент — 3.
</details>

### Задачи

**1. `chunk(arr, size)`**

Разбейте массив на части по `size` элементов. Последняя часть может быть короче. При `size < 1` бросайте `RangeError`.

| Вызов | Результат |
|---|---|
| `chunk([1, 2, 3, 4, 5], 2)` | `[[1, 2], [3, 4], [5]]` |
| `chunk([], 3)` | `[]` |

<details><summary>Решение</summary>

```js
function chunk(arr, size) {
  if (size < 1) throw new RangeError('size должен быть >= 1');
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}
```
</details>

**2. `uniqBy(arr, keyFn)`**

Удалите дубликаты по ключу, который возвращает `keyFn`. Оставляйте **первое** вхождение, сохраняйте исходный порядок. Сложность O(n).

| Вызов | Результат |
|---|---|
| `uniqBy([{ id: 1, v: 'a' }, { id: 2 }, { id: 1, v: 'b' }], (x) => x.id)` | `[{ id: 1, v: 'a' }, { id: 2 }]` |
| `uniqBy([1.1, 1.9, 2.5], Math.floor)` | `[1.1, 2.5]` |

<details><summary>Решение</summary>

```js
function uniqBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

`Set` делает проверку за O(1), итого O(n). Вариант с `findIndex` внутри `filter` — O(n²).
</details>

**3. `partition(arr, predicate)`**

Разделите массив на два за один проход: подходящие и неподходящие элементы.

| Вызов | Результат |
|---|---|
| `partition([1, 2, 3, 4], (n) => n % 2 === 0)` | `[[2, 4], [1, 3]]` |

<details><summary>Решение</summary>

```js
function partition(arr, predicate) {
  const pass = [];
  const fail = [];
  for (const item of arr) (predicate(item) ? pass : fail).push(item);
  return [pass, fail];
}
```
</details>

**4. `moveItem(arr, from, to)` — иммутабельно**

Переместите элемент с индекса `from` на индекс `to` и верните новый массив. Пригодится для drag-and-drop списков.

| Вызов | Результат |
|---|---|
| `moveItem(['a', 'b', 'c', 'd'], 0, 2)` | `['b', 'c', 'a', 'd']` |
| `moveItem(['a', 'b', 'c'], 2, 0)` | `['c', 'a', 'b']` |

<details><summary>Решение</summary>

```js
function moveItem(arr, from, to) {
  const item = arr[from];
  return arr.toSpliced(from, 1).toSpliced(to, 0, item);
}
```

Сначала элемент удаляется, затем вставляется на новое место. Исходный массив не меняется.
</details>

**5. `sortBy(arr, ...keys)` — сортировка по нескольким полям**

Отсортируйте массив объектов по нескольким полям (иммутабельно). Каждый ключ — строка с именем поля; префикс `-` означает сортировку по убыванию. Строки сравниваются через `localeCompare`, числа — вычитанием.

| Вызов | Результат |
|---|---|
| `sortBy(users, 'city', '-age')` | сначала по городу по возрастанию, внутри города — по возрасту по убыванию |

<details><summary>Решение</summary>

```js
function sortBy(arr, ...keys) {
  const criteria = keys.map((k) => (k.startsWith('-') ? [k.slice(1), -1] : [k, 1]));
  const compareValues = (a, b) =>
    typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : (a > b) - (a < b);
  return arr.toSorted((x, y) => {
    for (const [field, dir] of criteria) {
      const result = compareValues(x[field], y[field]);
      if (result !== 0) return result * dir;
    }
    return 0;
  });
}
```

Выражение `(a > b) - (a < b)` даёт `1`, `-1` или `0` для любых сравнимых значений, в том числе дат.
</details>

**6. `intersection(...arrays)`**

Найдите элементы, которые есть во **всех** массивах. Порядок — как в первом массиве, без дубликатов. Сложность — линейная от суммарного размера.

| Вызов | Результат |
|---|---|
| `intersection([1, 2, 3, 2], [2, 3, 4], [3, 2])` | `[2, 3]` |

<details><summary>Решение</summary>

```js
function intersection(first = [], ...rest) {
  const sets = rest.map((arr) => new Set(arr));
  return [...new Set(first)].filter((x) => sets.every((s) => s.has(x)));
}
```
</details>

## Источники
- [learn.javascript.ru — Массивы](https://learn.javascript.ru/array)
- [learn.javascript.ru — Методы массивов](https://learn.javascript.ru/array-methods)
- [learn.javascript.ru — Перебираемые объекты](https://learn.javascript.ru/iterable)
- [learn.javascript.ru — Деструктурирующее присваивание](https://learn.javascript.ru/destructuring-assignment)
- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN — Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN — Typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- [V8 — Elements kinds](https://v8.dev/blog/elements-kinds)
