QUIZ.register({
  "id": "01-javascript/10-strings-and-symbols",
  "section": "01-javascript",
  "title": "Строки и Symbol",
  "order": 10,
  "source": "../01-javascript/10-strings-and-symbols.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log('😀'.length, [...'😀'].length);",
      "options": [
        "`1 1`",
        "`2 1`",
        "`2 2`",
        "`4 1`"
      ],
      "answer": 1,
      "explain": "`length` считает 16-битные единицы UTF-16, эмодзи — суррогатная пара. Spread идёт по кодовым точкам."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как правильно посчитать количество видимых символов в пользовательском тексте с эмодзи?",
      "options": [
        "`str.length`",
        "`[...str].length`",
        "`Intl.Segmenter` с `granularity: 'grapheme'`",
        "`str.split('').length`"
      ],
      "answer": 2,
      "explain": "Видимый символ — графема, она может состоять из нескольких кодовых точек (эмодзи-семья, флаги, буква с акцентом). Только `Intl.Segmenter` считает графемы."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log('abc'.slice(-2), 'abc'.substring(-2));",
      "options": [
        "`'bc' 'bc'`",
        "`'bc' 'abc'`",
        "`'ab' 'abc'`",
        "`'' 'abc'`"
      ],
      "answer": 1,
      "explain": "`slice` считает отрицательный индекс с конца, `substring` превращает его в 0."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log('Hello'.replace('l', 'L'));",
      "options": [
        "`'HeLLo'`",
        "`'HeLlo'`",
        "`'Hello'`",
        "`'HELLO'`"
      ],
      "answer": 1,
      "explain": "`replace` со строковым шаблоном заменяет только первое вхождение. Для всех — `replaceAll` или регулярка с флагом `g`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(''.split(',').length);",
      "options": [
        "`0`",
        "`1`",
        "`undefined`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "Пустая строка без разделителя — одна пустая часть: `['']`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как отсортировать массив русских слов по алфавиту?",
      "options": [
        "`arr.sort()`",
        "`arr.sort((a, b) => a.localeCompare(b, 'ru'))`",
        "`arr.sort((a, b) => a > b)`",
        "`arr.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))`"
      ],
      "answer": 1,
      "explain": "Сравнение по кодам UTF-16 ставит `ё` после `я` и заглавные перед строчными. `localeCompare` или `Intl.Collator` учитывают правила языка. Компаратор, возвращающий boolean, некорректен."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log('e\\u0301' === 'é', 'e\\u0301'.normalize() === 'é');",
      "options": [
        "`true true`",
        "`false true`",
        "`false false`",
        "`true false`"
      ],
      "answer": 1,
      "explain": "Одна и та же буква записана разными кодовыми точками. `normalize()` (NFC) приводит к единой форме."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что получает функция-тег в `` tag`a${x}b${y}c` ``?",
      "options": [
        "Одну склеенную строку",
        "Массив `['a', 'b', 'c']` и значения `x`, `y` отдельными аргументами",
        "Только значения `x` и `y`",
        "Объект `{ strings, values }`"
      ],
      "answer": 1,
      "explain": "Первый аргумент — массив статических частей (у него есть ещё `raw`), остальные — значения выражений. Это позволяет экранировать значения, не трогая шаблон."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const a = Symbol('id');\nconst b = Symbol('id');\nconsole.log(a === b, a.description);",
      "options": [
        "`true 'id'`",
        "`false 'id'`",
        "`false undefined`",
        "`true 'Symbol(id)'`"
      ],
      "answer": 1,
      "explain": "Каждый `Symbol()` уникален, строка — лишь описание для отладки."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Где **не** видны символьные ключи объекта?",
      "options": [
        "`Object.keys`",
        "`JSON.stringify`",
        "`Reflect.ownKeys`",
        "`for...in`",
        "`Object.getOwnPropertySymbols`",
        "spread `{...obj}`"
      ],
      "answer": [
        0,
        1,
        3
      ],
      "explain": "Символы скрыты от `Object.keys`, `for...in` и `JSON.stringify`. `Reflect.ownKeys` и `getOwnPropertySymbols` их показывают, spread и `Object.assign` копируют. Значит, это не приватность."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `Symbol.for('k')` отличается от `Symbol('k')`?",
      "options": [
        "Ничем",
        "`Symbol.for` берёт символ из глобального реестра: для одного ключа — один и тот же символ",
        "`Symbol.for` создаёт строку",
        "`Symbol.for` работает только в Node.js"
      ],
      "answer": 1,
      "explain": "Глобальный реестр общий даже между iframe. `Symbol.keyFor` возвращает ключ."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой символ нужно реализовать, чтобы объект работал в `for...of`?",
      "options": [
        "`Symbol.toPrimitive`",
        "`Symbol.iterator`",
        "`Symbol.species`",
        "`Symbol.toStringTag`"
      ],
      "answer": 1,
      "explain": "`[Symbol.iterator]()` возвращает итератор с методом `next()`. Самый короткий способ — метод-генератор `*[Symbol.iterator]() { yield … }`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log('a' < 'B', 'a'.localeCompare('B') < 0);",
      "options": [
        "`true true`",
        "`false true`",
        "`false false`",
        "`true false`"
      ],
      "answer": 1,
      "explain": "По кодам UTF-16 заглавные идут раньше строчных (`B` = 66, `a` = 97). `localeCompare` учитывает алфавит: `a` идёт раньше `B`."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Почему опасно ограничивать длину поля через `input.value.slice(0, 50)`? Как сделать правильно?",
      "answer": "`slice` режет по 16-битным единицам UTF-16 и может разрезать суррогатную пару или составной эмодзи — появится `�` или «осиротевшие» части. Ещё и лимит в «символах» получится не таким, как видит пользователь. Правильно: считать и обрезать графемы через `Intl.Segmenter`, а на бэкенде согласовать, что считается длиной (графемы, кодовые точки или байты UTF-8 — для БД важны байты)."
    }
  ],
  "tasks": [
    {
      "title": "capitalizeWords",
      "level": "middle",
      "prompt": "Сделайте первую букву каждого слова заглавной, остальные строчными. Пробелы (в том числе повторяющиеся) сохраняются.\n\n`'  hELLO   wORLD '` → `'  Hello   World '`, `'привет мир'` → `'Привет Мир'`.",
      "starter": "function capitalizeWords(str) {\n  // ваш код\n}",
      "solution": "function capitalizeWords(str) {\n  return str.replace(/\\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());\n}",
      "tests": [
        {
          "name": "кириллица",
          "code": "return capitalizeWords('привет мир') === 'Привет Мир';"
        },
        {
          "name": "пробелы сохраняются",
          "code": "return capitalizeWords('  hELLO   wORLD ') === '  Hello   World ';"
        },
        {
          "name": "пустая строка",
          "code": "return capitalizeWords('') === '';"
        }
      ]
    },
    {
      "title": "isPalindrome для фраз",
      "level": "middle",
      "prompt": "Проверьте, является ли фраза палиндромом, игнорируя регистр, пробелы и знаки препинания (буквы любых алфавитов и цифры учитываются).",
      "starter": "function isPalindrome(str) {\n  // ваш код\n}",
      "solution": "function isPalindrome(str) {\n  const chars = [...str.toLowerCase()].filter((c) => /[\\p{L}\\p{N}]/u.test(c));\n  for (let i = 0, j = chars.length - 1; i < j; i++, j--) {\n    if (chars[i] !== chars[j]) return false;\n  }\n  return true;\n}",
      "tests": [
        {
          "name": "русская фраза",
          "code": "return isPalindrome('А роза упала на лапу Азора') === true;"
        },
        {
          "name": "английская фраза",
          "code": "return isPalindrome('Was it a car or a cat I saw?') === true;"
        },
        {
          "name": "не палиндром",
          "code": "return isPalindrome('Привет') === false;"
        },
        {
          "name": "пустая и один символ",
          "code": "return isPalindrome('') && isPalindrome('!a!');"
        }
      ]
    },
    {
      "title": "truncate по графемам",
      "level": "senior",
      "prompt": "Обрежьте текст до `max` видимых символов (графем) и добавьте `'…'`, если текст был длиннее. Эмодзи не должны разрезаться.\n\n`truncate('Привет, мир', 6)` → `'Привет…'`.",
      "starter": "function truncate(text, max) {\n  // ваш код\n}",
      "solution": "function truncate(text, max) {\n  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });\n  const parts = Array.from(seg.segment(text), (s) => s.segment);\n  return parts.length <= max ? text : parts.slice(0, max).join('') + '…';\n}",
      "tests": [
        {
          "name": "обычный текст",
          "code": "return truncate('Привет, мир', 6) === 'Привет…' && truncate('abc', 5) === 'abc';"
        },
        {
          "name": "эмодзи-семья — одна графема",
          "code": "return truncate('Hi 👨‍👩‍👧!', 4) === 'Hi 👨‍👩‍👧…';"
        }
      ]
    },
    {
      "title": "Итерируемый Range",
      "level": "senior",
      "prompt": "Создайте класс `Range(from, to, step = 1)`, экземпляры которого работают в `for...of` и spread. Поддержите отрицательный шаг, при `step === 0` бросайте `RangeError`.",
      "starter": "class Range {\n  // ваш код\n}",
      "solution": "class Range {\n  constructor(from, to, step = 1) {\n    if (step === 0) throw new RangeError('step не может быть 0');\n    Object.assign(this, { from, to, step });\n  }\n  *[Symbol.iterator]() {\n    const { from, to, step } = this;\n    for (let i = from; step > 0 ? i <= to : i >= to; i += step) yield i;\n  }\n}",
      "tests": [
        {
          "name": "по возрастанию",
          "code": "return JSON.stringify([...new Range(1, 5)]) === '[1,2,3,4,5]' && JSON.stringify([...new Range(0, 10, 5)]) === '[0,5,10]';"
        },
        {
          "name": "по убыванию",
          "code": "return JSON.stringify([...new Range(3, 1, -1)]) === '[3,2,1]';"
        },
        {
          "name": "шаг 0",
          "code": "try { new Range(1, 2, 0); return false; } catch (e) { return e instanceof RangeError; }"
        }
      ]
    }
  ]
});
