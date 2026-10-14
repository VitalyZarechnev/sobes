# Строки и Symbol

> ⏱ ~2.5 ч · 🎯 Понимать устройство строк (UTF-16, суррогатные пары, графемы), уверенно пользоваться методами строк и шаблонными строками, корректно сравнивать и сортировать текст, знать, что такое Symbol и well-known symbols.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Типы и приведение](01-types-and-coercion.md) · [Итераторы и Proxy](06-objects-collections-iterators.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу объяснить, почему `'😀'.length === 2`, и как правильно посчитать символы
- [ ] Знаю разницу `slice` / `substring`, `replace` / `replaceAll`, `indexOf` / `includes`
- [ ] Умею сортировать строки по-русски (`localeCompare`, `Intl.Collator`)
- [ ] Знаю, что такое tagged template и где они применяются
- [ ] Могу объяснить, зачем нужен Symbol и чем `Symbol()` отличается от `Symbol.for()`
- [ ] Знаю основные well-known symbols и могу сделать объект итерируемым

## Теория

### 1. Строка: что это внутри

Строка в JS — **иммутабельная последовательность 16-битных кодовых единиц UTF-16**. Это важно для трёх вещей:

- **Иммутабельность**: все методы возвращают *новую* строку, исходная не меняется. `str[0] = 'X'` ничего не делает.
- **`length` считает кодовые единицы, а не символы.** Символы из основной плоскости Unicode (кириллица, латиница, большинство иероглифов) занимают одну единицу. Эмодзи и редкие символы занимают **две** (суррогатная пара).
- **То, что человек видит как один символ** (графема), может состоять из нескольких кодовых точек: буква и комбинирующий акцент, эмодзи-семья из нескольких эмодзи, флаг.

```js
'abc'.length;          // 3
'😀'.length;           // 2 — суррогатная пара
[...'😀'].length;      // 1 — spread итерирует по кодовым точкам
'👨‍👩‍👧'.length;          // 8 — три эмодзи + два «соединителя» (ZWJ)
[...'👨‍👩‍👧'].length;      // 5 — кодовых точек всё ещё 5
// Правильный подсчёт видимых символов — Intl.Segmenter:
const seg = new Intl.Segmenter('ru', { granularity: 'grapheme' });
[...seg.segment('👨‍👩‍👧')].length; // 1
```

| Уровень | Что это | Как получить |
|---|---|---|
| Кодовая единица (code unit) | 16-битное число UTF-16 | `str.length`, `str[i]`, `charCodeAt(i)` |
| Кодовая точка (code point) | номер символа в Unicode, 1–2 единицы | `for...of`, `[...str]`, `codePointAt(i)` |
| Графема (grapheme cluster) | то, что пользователь видит как один символ | `Intl.Segmenter` |

🪤 Ловушка: `str.slice(0, 10)` может разрезать эмодзи пополам, и на экране появится `�`. Для обрезки пользовательского текста нужно резать по графемам.

### 2. Создание строк и шаблонные строки

```js
'одинарные';  "двойные";  // равноправны
`шаблонная: ${1 + 1}`;    // интерполяция любого выражения
`многострочная
строка`;                   // переносы сохраняются
String.raw`C:\new\table`;  // 'C:\\new\\table' — без обработки escape-последовательностей
```

**Tagged template** (тегированный шаблон) — вызов функции с шаблонной строкой без скобок. Функция получает массив статических кусков и значения выражений отдельно. Так работают `styled-components`, `graphql-tag`, `lit-html` и безопасное экранирование.

```js
function html(strings, ...values) {
  // strings: ['<p>', '</p>'], values: ['<script>…']
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return strings.reduce((out, str, i) => out + str + (i < values.length ? escape(values[i]) : ''), '');
}
const userInput = '<script>alert(1)</script>';
html`<p>${userInput}</p>`; // '<p>&#60;script&#62;alert(1)&#60;/script&#62;</p>'
```

### 3. Методы строк: шпаргалка

**Доступ к символам**

| Метод | Пример | Результат | Заметки |
|---|---|---|---|
| `str[i]` | `'abc'[1]` | `'b'` | за границей — `undefined` |
| `str.at(i)` | `'abc'.at(-1)` | `'c'` | поддерживает отрицательные индексы |
| `str.charAt(i)` | `'abc'.charAt(10)` | `''` | за границей — пустая строка |
| `str.codePointAt(i)` | `'😀'.codePointAt(0)` | `128512` | номер символа Unicode |

**Поиск**

| Метод | Пример | Результат | Заметки |
|---|---|---|---|
| `includes(sub)` | `'abc'.includes('b')` | `true` | нужен ответ «есть или нет» |
| `startsWith` / `endsWith` | `'abc'.startsWith('ab')` | `true` | |
| `indexOf(sub)` | `'abc'.indexOf('z')` | `-1` | позиция первого вхождения |
| `lastIndexOf(sub)` | `'abcabc'.lastIndexOf('b')` | `4` | позиция последнего |
| `search(regexp)` | `'aXbX'.search(/X/)` | `1` | как `indexOf`, но с регуляркой |
| `match(regexp)` | `'a1b22'.match(/\d+/g)` | `['1', '22']` | с флагом `g` — все совпадения |
| `matchAll(regexp)` | `[...s.matchAll(/(\w+)=(\w+)/g)]` | итератор совпадений с группами | требует флаг `g` |

**Извлечение подстроки**

| Метод | Пример | Результат | Заметки |
|---|---|---|---|
| `slice(start, end)` | `'abcdef'.slice(2, -1)` | `'cde'` | **основной**: отрицательные индексы считаются с конца |
| `substring(start, end)` | `'abc'.substring(-2)` | `'abc'` | отрицательные превращаются в 0, аргументы меняются местами, если `start > end` |
| `substr(start, len)` | | | устаревший, не использовать |

**Преобразование** (всё возвращает новую строку)

| Метод | Пример | Результат |
|---|---|---|
| `toUpperCase` / `toLowerCase` | `'Привет'.toUpperCase()` | `'ПРИВЕТ'` |
| `toLocaleUpperCase('tr')` | | учитывает языковые правила (турецкая i) |
| `trim` / `trimStart` / `trimEnd` | `'  x '.trim()` | `'x'` |
| `padStart(len, fill)` | `'5'.padStart(3, '0')` | `'005'` |
| `padEnd(len, fill)` | `'abc'.padEnd(6, '12')` | `'abc121'` |
| `repeat(n)` | `'ab'.repeat(3)` | `'ababab'` |
| `replace(a, b)` | `'Hello'.replace('l', 'L')` | `'HeLlo'` — **только первое** вхождение (если не регулярка с `g`) |
| `replaceAll(a, b)` | `'Hello'.replaceAll('l', 'L')` | `'HeLLo'` |
| `replace(re, fn)` | `'Hello'.replace(/l/g, (m, i) => i)` | `'He23o'` — функция получает совпадение и позицию |
| `split(sep, limit)` | `'a,b,,c'.split(',')` | `['a', 'b', '', 'c']` |
| `split('')` | `'abc'.split('')` | `['a', 'b', 'c']` — 🪤 ломает эмодзи, используйте `[...str]` |
| `normalize('NFC')` | | приводит разные записи одного символа к одной |
| `concat` | | лучше `+` или шаблон |

```js
''.split(',');       // [''] — 🪤 не пустой массив!
'a-b-c'.split('-', 2); // ['a', 'b'] — limit
```

### 4. Сравнение и сортировка строк

Операторы `<`, `>` сравнивают строки **посимвольно по кодам UTF-16**. Для человеческого языка это часто неверно:

```js
'a' < 'B';        // false — у заглавных коды меньше
'ё' > 'я';        // true — у 'ё' код 1105, у 'я' 1103
['ё', 'а', 'я', 'е'].sort();                                // ['а', 'е', 'я', 'ё'] — неверно
['ё', 'а', 'я', 'е'].sort((a, b) => a.localeCompare(b, 'ru')); // ['а', 'е', 'ё', 'я'] — верно
```

`localeCompare` возвращает отрицательное число, `0` или положительное — ровно то, что ждёт `sort`. Для сортировки больших массивов создайте один **`Intl.Collator`** и переиспользуйте его: это быстрее, чем `localeCompare` на каждой паре.

```js
const collator = new Intl.Collator('ru', { sensitivity: 'base', numeric: true });
['файл10', 'файл2', 'Файл1'].sort(collator.compare); // ['Файл1', 'файл2', 'файл10']
// numeric: true — «естественная» сортировка чисел внутри строк
// sensitivity: 'base' — игнорировать регистр и диакритику при сравнении
```

**Нормализация.** Одна и та же буква может быть записана разными кодовыми точками: `'é'` как один символ или как `'e'` + комбинирующий акцент. Визуально одинаковые строки окажутся неравны:

```js
'e\u0301' === 'é';                // false
'e\u0301'.normalize() === 'é';    // true — NFC по умолчанию
```

Нормализуйте строки перед сравнением, поиском и сохранением в индекс.

### 5. Конкатенация и производительность

Склейка через `+` и шаблонные строки в современных движках быстрая (внутри используются «верёвки», ropes). Собирать строку в массиве и вызывать `join` имеет смысл только при очень большом количестве частей. Главная проблема производительности строк — не склейка, а лишние **регулярные выражения** в горячих циклах и катастрофический backtracking в регулярках (ReDoS).

### 6. Новые методы: isWellFormed и toWellFormed

Строка может содержать «одинокий» суррогат — половину пары без второй половины (например, после неаккуратного `slice`). Такую строку нельзя корректно закодировать: `encodeURIComponent` бросит `URIError`, `TextEncoder` подставит `�`.

```js
'ab\uD800'.isWellFormed();        // false
'ab\uD800'.toWellFormed();        // 'ab�' — одинокий суррогат заменён на U+FFFD
```

### 7. Symbol: уникальные ключи

**Symbol** — примитивный тип для **уникальных идентификаторов**. Каждый вызов `Symbol()` создаёт новое значение, которое не равно никакому другому.

```js
const a = Symbol('id');
const b = Symbol('id');
a === b;           // false — описание 'id' только для отладки
a.description;     // 'id'
a.toString();      // 'Symbol(id)'
'' + a;            // TypeError — неявно в строку нельзя
`${a}`;            // TypeError — и так тоже
String(a);         // 'Symbol(id)' — явно можно
```

**Зачем нужны.** Чтобы добавить свойство в объект без риска конфликта имён: например, библиотека помечает чужие объекты своим ключом, не задевая их обычные свойства.

```js
const meta = Symbol('meta');
const user = { name: 'Аня', [meta]: { cachedAt: Date.now() } };

Object.keys(user);                   // ['name'] — символ не виден
JSON.stringify(user);                // '{"name":"Аня"}' — не сериализуется
for (const k in user) {}             // символ не перебирается
Object.getOwnPropertySymbols(user);  // [Symbol(meta)]
Reflect.ownKeys(user);               // ['name', Symbol(meta)]
({ ...user })[meta];                 // копируется spread и Object.assign
```

Это **не приватность**: символы доступны через `Reflect.ownKeys`. Для настоящей приватности — поля `#private` в классах или `WeakMap`.

**Глобальный реестр.** `Symbol.for(key)` возвращает один и тот же символ для одной строки ключа во всём приложении и даже между iframe:

```js
Symbol.for('app.token') === Symbol.for('app.token'); // true
Symbol.keyFor(Symbol.for('app.token'));               // 'app.token'
```

React, например, помечает свои элементы `Symbol.for('react.element')`-подобными ключами, чтобы разные копии React распознавали элементы друг друга.

### 8. Well-known symbols: протоколы языка

Встроенные символы, через которые язык позволяет настраивать поведение ваших объектов.

| Символ | Что настраивает | Где используется |
|---|---|---|
| `Symbol.iterator` | как объект перебирается | `for...of`, spread `[...x]`, деструктуризация, `Array.from`, `Promise.all` |
| `Symbol.asyncIterator` | асинхронный перебор | `for await...of` |
| `Symbol.toPrimitive` | приведение к примитиву | `+obj`, `` `${obj}` ``, `obj + 1` (см. [Типы](01-types-and-coercion.md)) |
| `Symbol.toStringTag` | тег в `Object.prototype.toString` | `'[object MyType]'` |
| `Symbol.hasInstance` | поведение `instanceof` | |
| `Symbol.species` | какой конструктор создаёт производные объекты (`map`, `filter`) | наследование от `Array`, `Promise` |
| `Symbol.dispose` / `Symbol.asyncDispose` | очистка ресурса при выходе из блока | `using`, `await using` (Explicit Resource Management) |

Самый практичный пример — итерируемый объект:

```js
const range = {
  from: 1,
  to: 3,
  *[Symbol.iterator]() {          // генератор возвращает итератор
    for (let i = this.from; i <= this.to; i++) yield i;
  },
};
[...range];                  // [1, 2, 3]
for (const n of range) {}    // работает
const [first] = range;       // 1 — деструктуризация тоже
```

Подробнее про итераторы и генераторы — [Объекты, коллекции, итераторы](06-objects-collections-iterators.md).

## Вопросы с собеседований

<details><summary>Почему '😀'.length равно 2? Как посчитать количество символов?</summary>

Строка хранится в UTF-16, `length` считает 16-битные кодовые единицы. Эмодзи вне основной плоскости кодируется суррогатной парой из двух единиц. `[...str].length` посчитает кодовые точки, но и это не то, что видит человек: эмодзи-семья — 5 кодовых точек. Правильно считать графемы через `Intl.Segmenter` с `granularity: 'grapheme'`. Это важно для лимитов длины полей и обрезки текста.
</details>

<details><summary>Чем slice отличается от substring?</summary>

`slice` поддерживает отрицательные индексы (отсчёт с конца) и возвращает пустую строку, если `start > end`. `substring` превращает отрицательные индексы в 0 и меняет аргументы местами, если `start > end`. На практике используют `slice` — его поведение такое же, как у `Array.prototype.slice`. `substr` устарел.
</details>

<details><summary>Как заменить все вхождения подстроки?</summary>

`str.replaceAll('a', 'b')` или `str.replace(/a/g, 'b')`. Обычный `replace` со строкой заменяет только первое вхождение. При использовании регулярки из пользовательского ввода спецсимволы нужно экранировать, иначе `.` или `*` сломают поиск. Для строкового аргумента `replaceAll` экранирование не нужно.
</details>

<details><summary>Как правильно отсортировать список русских слов?</summary>

`arr.sort((a, b) => a.localeCompare(b, 'ru'))` или, для больших списков, `arr.sort(new Intl.Collator('ru').compare)`. Обычный `sort()` сравнивает коды UTF-16: `'ё'` окажется после `'я'`, заглавные — раньше строчных. Опция `numeric: true` даёт естественную сортировку `файл2 < файл10`.
</details>

<details><summary>Что такое tagged template? Где применяется?</summary>

Вызов функции с шаблонной строкой: `` tag`text ${x}` ``. Функция получает массив статических частей (`strings`, плюс `strings.raw`) и значения выражений отдельно, поэтому может их обработать: экранировать HTML, параметризовать SQL, разобрать GraphQL, сгенерировать CSS. Примеры: `styled-components`, `lit-html`, `graphql-tag`, `String.raw`.
</details>

<details><summary>Почему строки иммутабельны и как это влияет на код?</summary>

Строка — примитив, её нельзя изменить, только создать новую. Все методы (`toUpperCase`, `replace`, `trim`) возвращают новую строку, и результат нужно присвоить. Плюсы: строки безопасно передавать куда угодно и использовать как ключи, движок может их интернировать и разделять память.
</details>

<details><summary>Зачем нужен Symbol? Это приватные свойства?</summary>

Symbol — уникальный идентификатор для ключей без коллизий: метаданные на чужих объектах, протоколы языка (`Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.dispose`). Это не приватность: символьные ключи видны через `Object.getOwnPropertySymbols` и `Reflect.ownKeys`, копируются spread. Для приватности — `#private` поля или `WeakMap`.
</details>

<details><summary>Чем Symbol('x') отличается от Symbol.for('x')?</summary>

`Symbol('x')` каждый раз создаёт новый уникальный символ, строка — только описание. `Symbol.for('x')` ищет в глобальном реестре символ с ключом `'x'` и создаёт его, только если такого нет. Поэтому `Symbol.for('x') === Symbol.for('x')`, причём даже между разными iframe. Получить ключ обратно — `Symbol.keyFor`.
</details>

<details><summary>Как сделать объект итерируемым?</summary>

Определить метод `[Symbol.iterator]`, который возвращает итератор — объект с методом `next()`, отдающим `{ value, done }`. Проще всего сделать метод генератором: `*[Symbol.iterator]() { yield ... }`. После этого объект работает с `for...of`, spread, деструктуризацией, `Array.from`, `new Set(obj)`.
</details>

<details><summary>Что такое нормализация строк и когда она нужна?</summary>

Одна и та же буква может быть записана разными последовательностями кодовых точек: `é` одним символом или `e` + комбинирующий акцент. Визуально строки одинаковые, а `===` их различает. `str.normalize('NFC')` приводит к единой форме. Нужна при сравнении пользовательского ввода, поиске, дедупликации, сохранении в индекс.
</details>

## Практика

### Предскажите вывод

**1.**
```js
console.log('abc'.at(-1), 'abc'.slice(-2), 'abc'.substring(-2), 'abc'[10], 'abc'.charAt(10));
```
<details><summary>Ответ</summary>

`'c' 'bc' 'abc' undefined ''`
</details>
<details><summary>Почему так</summary>

`at` и `slice` считают отрицательные индексы с конца. `substring` превращает отрицательный индекс в 0 и возвращает строку целиком. Индекс за границей: скобки дают `undefined`, а `charAt` — пустую строку.
</details>

**2.**
```js
console.log(''.split(','), 'a,b,,c'.split(','), 'a-b-c'.split('-', 2));
```
<details><summary>Ответ</summary>

`['']`, `['a', 'b', '', 'c']`, `['a', 'b']`
</details>
<details><summary>Почему так</summary>

Пустая строка без разделителя — это одна пустая часть, а не ноль частей. Два разделителя подряд дают пустой элемент. Второй аргумент ограничивает количество частей.
</details>

**3.**
```js
console.log('Hello'.replace('l', 'L'), 'Hello'.replaceAll('l', 'L'), 'Hello'.replace(/l/g, (m, i) => i));
```
<details><summary>Ответ</summary>

`'HeLlo' 'HeLLo' 'He23o'`
</details>
<details><summary>Почему так</summary>

`replace` со строкой меняет только первое вхождение. `replaceAll` — все. Функция замены получает совпадение и его позицию: буквы `l` стоят на позициях 2 и 3.
</details>

**4.**
```js
console.log('😀'.length, [...'😀'].length, '😀'.split('').length);
```
<details><summary>Ответ</summary>

`2 1 2`
</details>
<details><summary>Почему так</summary>

`length` и `split('')` работают с 16-битными единицами: эмодзи — суррогатная пара, то есть 2 единицы. Spread использует итератор строки, а он идёт по кодовым точкам.
</details>

**5.**
```js
console.log('ё' > 'я', ['ё', 'а', 'я'].sort().join(''));
```
<details><summary>Ответ</summary>

`true 'аяё'`
</details>
<details><summary>Почему так</summary>

Сравнение идёт по кодам UTF-16: у `'ё'` код 1105, у `'я'` — 1103. Поэтому `ё` больше `я` и сортируется в конец. Для правильного алфавитного порядка нужен `localeCompare`.
</details>

**6.**
```js
const a = Symbol('id');
const o = { [a]: 1, x: 2 };
console.log(Object.keys(o), JSON.stringify(o), Reflect.ownKeys(o).length);
```
<details><summary>Ответ</summary>

`['x'] '{"x":2}' 2`
</details>
<details><summary>Почему так</summary>

Символьные ключи не видны в `Object.keys`, `for...in` и `JSON.stringify`, но видны в `Reflect.ownKeys`, который возвращает и строковые, и символьные ключи.
</details>

**7.**
```js
console.log(Symbol('k') === Symbol('k'), Symbol.for('k') === Symbol.for('k'));
```
<details><summary>Ответ</summary>

`false true`
</details>
<details><summary>Почему так</summary>

`Symbol()` всегда создаёт новый символ. `Symbol.for()` берёт символ из глобального реестра по ключу и возвращает тот же самый.
</details>

**8.**
```js
const name = 'x';
try { console.log('' + Symbol(name)); } catch (e) { console.log(e.constructor.name); }
console.log(String(Symbol(name)));
```
<details><summary>Ответ</summary>

`'TypeError'`, `'Symbol(x)'`
</details>
<details><summary>Почему так</summary>

Неявное приведение символа к строке запрещено, чтобы символ случайно не превратился в строковый ключ. Явное `String(sym)` разрешено.
</details>

### Задачи

**1. `truncate(text, maxGraphemes)`**

Обрежьте текст до заданного количества **видимых символов** (графем) и добавьте `'…'`, если текст был обрезан. Эмодзи и составные символы не должны разрезаться пополам.

| Вызов | Результат |
|---|---|
| `truncate('Привет, мир', 6)` | `'Привет…'` |
| `truncate('Hi 👨‍👩‍👧!', 4)` | `'Hi 👨‍👩‍👧…'` |
| `truncate('abc', 5)` | `'abc'` (обрезка не нужна) |

<details><summary>Решение</summary>

```js
function truncate(text, maxGraphemes) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const graphemes = Array.from(segmenter.segment(text), (s) => s.segment);
  return graphemes.length <= maxGraphemes ? text : graphemes.slice(0, maxGraphemes).join('') + '…';
}
```

`slice` по кодовым единицам разрезал бы эмодзи-семью, а `[...text]` — оставил бы «осиротевшие» части составного эмодзи. Только сегментация по графемам даёт то, что видит пользователь.
</details>

**2. `capitalizeWords(str)`**

Сделайте первую букву каждого слова заглавной, остальные — строчными. Слова разделены одним или несколькими пробелами, пробелы сохраняются как есть.

| Вызов | Результат |
|---|---|
| `capitalizeWords('привет мир')` | `'Привет Мир'` |
| `capitalizeWords('  hELLO   wORLD ')` | `'  Hello   World '` |

<details><summary>Решение</summary>

```js
const capitalizeWords = (str) =>
  str.replace(/\S+/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
```

Замена через регулярку с функцией не трогает пробелы, поэтому они сохраняются. Разбиение через `split(' ')` и склейка через `join(' ')` тоже работает, но требует аккуратности с повторяющимися пробелами.
</details>

**3. `isPalindrome(str)`**

Проверьте, является ли фраза палиндромом, игнорируя регистр, пробелы и знаки препинания. Учтите `ё` и `е` как разные буквы.

| Вызов | Результат |
|---|---|
| `isPalindrome('А роза упала на лапу Азора')` | `true` |
| `isPalindrome('Was it a car or a cat I saw?')` | `true` |
| `isPalindrome('Привет')` | `false` |

<details><summary>Решение</summary>

```js
function isPalindrome(str) {
  const chars = [...str.toLowerCase()].filter((c) => /[\p{L}\p{N}]/u.test(c));
  for (let i = 0, j = chars.length - 1; i < j; i++, j--) {
    if (chars[i] !== chars[j]) return false;
  }
  return true;
}
```

`\p{L}` (любая буква Unicode) с флагом `u` работает и для кириллицы, в отличие от `\w`. Сравнение двумя указателями — O(n) по времени и без создания перевёрнутой копии.
</details>

**4. Итерируемый `Range` с шагом**

Создайте класс `Range(from, to, step = 1)`, экземпляры которого можно перебирать в `for...of` и разворачивать через spread. Поддержите отрицательный шаг.

| Вызов | Результат |
|---|---|
| `[...new Range(1, 5)]` | `[1, 2, 3, 4, 5]` |
| `[...new Range(0, 10, 5)]` | `[0, 5, 10]` |
| `[...new Range(3, 1, -1)]` | `[3, 2, 1]` |

<details><summary>Решение</summary>

```js
class Range {
  constructor(from, to, step = 1) {
    if (step === 0) throw new RangeError('step не может быть 0');
    Object.assign(this, { from, to, step });
  }

  *[Symbol.iterator]() {
    const { from, to, step } = this;
    for (let i = from; step > 0 ? i <= to : i >= to; i += step) yield i;
  }
}
```

Генератор-метод под ключом `Symbol.iterator` делает объект итерируемым. Отдельная проверка `step === 0` защищает от бесконечного цикла.
</details>

## Источники
- [learn.javascript.ru — Строки](https://learn.javascript.ru/string)
- [learn.javascript.ru — Тип данных Symbol](https://learn.javascript.ru/symbol)
- [learn.javascript.ru — Перебираемые объекты](https://learn.javascript.ru/iterable)
- [MDN — String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN — Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- [MDN — Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator)
- [MDN — Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [MDN — Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
