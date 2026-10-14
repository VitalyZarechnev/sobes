QUIZ.register({
  "id": "01-javascript/09-numbers",
  "section": "01-javascript",
  "title": "Числа: number, BigInt, Math",
  "order": 9,
  "source": "../01-javascript/09-numbers.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как хранится тип `number` в JS?",
      "options": [
        "32-битное целое",
        "64-битное число с плавающей точкой IEEE-754",
        "Десятичная дробь произвольной точности",
        "Зависит от значения: int или float"
      ],
      "answer": 1,
      "explain": "Один тип на все числа — double по IEEE-754: 1 бит знака, 11 бит порядка, 52 бита мантиссы. Целые точны до 2^53."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(Math.floor((0.1 + 0.7) * 10));",
      "options": [
        "`8`",
        "`7`",
        "`7.999999999999999`",
        "`NaN`"
      ],
      "answer": 1,
      "explain": "`(0.1 + 0.7) * 10` = `7.999999999999999` из-за двоичной неточности, `floor` даёт 7."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(Math.round(-2.5), Math.round(2.5));",
      "options": [
        "`-3 3`",
        "`-2 3`",
        "`-2 2`",
        "`-3 2`"
      ],
      "answer": 1,
      "explain": "`Math.round` округляет ровно `.5` в сторону +∞: `-2.5 → -2`, `2.5 → 3`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(isNaN('abc'), Number.isNaN('abc'));",
      "options": [
        "`true true`",
        "`true false`",
        "`false false`",
        "`false true`"
      ],
      "answer": 1,
      "explain": "Глобальный `isNaN` приводит аргумент к числу (`'abc' → NaN`), `Number.isNaN` проверяет без приведения."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Бэкенд отдаёт `{\"id\": 9007199254740993}`. Что получит фронтенд после `JSON.parse`?",
      "options": [
        "Точное значение",
        "`9007199254740992` — точность потеряна",
        "`TypeError`",
        "BigInt автоматически"
      ],
      "answer": 1,
      "explain": "Число больше `MAX_SAFE_INTEGER` округляется до ближайшего представимого ещё при парсинге. Решение — передавать такие ID строкой."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие выражения дают `NaN`?",
      "options": [
        "`0 / 0`",
        "`1 / 0`",
        "`parseInt('')`",
        "`Number('')`",
        "`Math.sqrt(-1)`",
        "`undefined + 1`"
      ],
      "answer": [
        0,
        2,
        4,
        5
      ],
      "explain": "`1 / 0` — `Infinity`, `Number('')` — `0`. Остальные — некорректные операции → `NaN`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log((1.005).toFixed(2));",
      "options": [
        "`'1.01'`",
        "`'1.00'`",
        "`1.01`",
        "`'1.005'`"
      ],
      "answer": 1,
      "explain": "`1.005` хранится как `1.00499999…`, и `toFixed` честно округляет вниз. К тому же результат — строка."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(-5 % 3, ((-5 % 3) + 3) % 3);",
      "options": [
        "`1 1`",
        "`-2 1`",
        "`-2 -2`",
        "`2 1`"
      ],
      "answer": 1,
      "explain": "Знак `%` совпадает со знаком делимого. Формула `((n % m) + m) % m` даёт неотрицательный остаток."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем отличаются `Number('42px')` и `parseInt('42px', 10)`?",
      "options": [
        "Оба дают 42",
        "`NaN` и `42`",
        "`42` и `NaN`",
        "Оба дают `NaN`"
      ],
      "answer": 1,
      "explain": "`Number` требует, чтобы строка была числом целиком. `parseInt` читает числовой префикс и отбрасывает хвост."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие операции с BigInt бросают `TypeError`?",
      "options": [
        "`1n + 1`",
        "`1n < 2`",
        "`+1n`",
        "`Math.max(1n, 2n)`",
        "`1n == 1`",
        "`JSON.stringify({ a: 1n })`"
      ],
      "answer": [
        0,
        2,
        3,
        5
      ],
      "explain": "Арифметику с number, унарный плюс, `Math` и сериализацию в JSON BigInt не поддерживает. Сравнения (`<`, `==`) — можно."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log(2 ** 31 | 0);",
      "options": [
        "`2147483648`",
        "`-2147483648`",
        "`0`",
        "`Infinity`"
      ],
      "answer": 1,
      "explain": "Побитовые операторы приводят число к 32-битному целому со знаком — 2^31 «переворачивается». Используйте `Math.trunc`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как правильно хранить и суммировать денежные суммы в рублях с копейками?",
      "options": [
        "В `number` с двумя знаками и `toFixed(2)` после каждой операции",
        "В целых копейках (или BigInt/decimal-библиотеке), форматировать через `Intl.NumberFormat`",
        "В строках",
        "В `Float32Array`"
      ],
      "answer": 1,
      "explain": "Целые числа до 2^53 точны, поэтому суммы в минимальных единицах не накапливают погрешность. В рубли переводят только при выводе."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `Math.max()` без аргументов?",
      "options": [
        "`0`",
        "`undefined`",
        "`-Infinity`",
        "`NaN`"
      ],
      "answer": 2,
      "explain": "`-Infinity` — нейтральный элемент для максимума. На пустом массиве `Math.max(...[])` тоже даст `-Infinity`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем подходит `Math.random()` для генерации токена сессии?",
      "options": [
        "Подходит",
        "Не подходит: не криптостойкий, нужен `crypto.getRandomValues`/`crypto.randomUUID`",
        "Подходит, если умножить на `Date.now()`",
        "Подходит только в Node.js"
      ],
      "answer": 1,
      "explain": "Генератор `Math.random` предсказуем. Для всего, что связано с безопасностью, — Web Crypto API."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Объясните, почему `0.1 + 0.2 !== 0.3`, и как сравнивать дробные числа.",
      "answer": "`number` — двоичный float IEEE-754. `0.1` в двоичной системе — бесконечная дробь, она округляется до 52 бит мантиссы; сумма двух неточных значений даёт `0.30000000000000004`. Это свойство формата, а не баг JS. Сравнивать — с допуском: `Math.abs(a - b) < Number.EPSILON` для чисел около 1, относительный допуск для больших чисел. Деньги — в целых минимальных единицах или decimal-библиотеке."
    }
  ],
  "tasks": [
    {
      "title": "almostEqual с относительным допуском",
      "level": "senior",
      "prompt": "Реализуйте `almostEqual(a, b, digits?)`:\n- без `digits` — равны, если `|a − b| ≤ Number.EPSILON × max(|a|, |b|, 1)`;\n- с `digits` — равны, если совпадают после округления до `digits` знаков;\n- `NaN` ни с чем не равен.",
      "starter": "function almostEqual(a, b, digits) {\n  // ваш код\n}",
      "solution": "function almostEqual(a, b, digits) {\n  if (Number.isNaN(a) || Number.isNaN(b)) return false;\n  if (digits !== undefined) {\n    const k = 10 ** digits;\n    return Math.round(a * k) === Math.round(b * k);\n  }\n  const scale = Math.max(Math.abs(a), Math.abs(b), 1);\n  return Math.abs(a - b) <= Number.EPSILON * scale;\n}",
      "tests": [
        {
          "name": "0.1 + 0.2 ≈ 0.3",
          "code": "return almostEqual(0.1 + 0.2, 0.3) === true;"
        },
        {
          "name": "большие числа",
          "code": "return almostEqual(1e20 + 1e4, 1e20) === true && almostEqual(1, 1.0001) === false;"
        },
        {
          "name": "digits",
          "code": "return almostEqual(1.001, 1.002, 2) && !almostEqual(1.001, 1.02, 2);"
        },
        {
          "name": "NaN",
          "code": "return almostEqual(NaN, NaN) === false;"
        }
      ]
    },
    {
      "title": "parseUserNumber для поля формы",
      "level": "middle",
      "prompt": "Разберите строку из поля ввода: обрезать пробелы, запятая или точка — десятичный разделитель, пробелы внутри (разделители тысяч, в т.ч. неразрывные `\\u00A0`) игнорируются. Пустая строка → `null`, невалидный ввод → `NaN`.\n\n`'3,14'` → `3.14`, `'1 234 567'` → `1234567`, `''` → `null`, `'12abc'` → `NaN`.",
      "starter": "function parseUserNumber(input) {\n  // ваш код\n}",
      "solution": "function parseUserNumber(input) {\n  const s = input.trim().replace(/[\\s\\u00A0\\u202F]/g, '').replace(',', '.');\n  if (s === '') return null;\n  return Number(s);\n}",
      "tests": [
        {
          "name": "разделители",
          "code": "return parseUserNumber(' 3,14 ') === 3.14 && parseUserNumber('1 234 567') === 1234567 && parseUserNumber('1\\u00A0000') === 1000;"
        },
        {
          "name": "пустой ввод",
          "code": "return parseUserNumber('') === null && parseUserNumber('   ') === null;"
        },
        {
          "name": "мусор",
          "code": "return Number.isNaN(parseUserNumber('12abc')) && Number.isNaN(parseUserNumber('1.2.3'));"
        }
      ]
    },
    {
      "title": "mod для кольцевого индекса",
      "level": "middle",
      "prompt": "Реализуйте `mod(n, m)`, результат всегда в `[0, m)`. `mod(-1, 5)` → `4`, `mod(5, 3)` → `2`.",
      "starter": "function mod(n, m) {\n  // ваш код\n}",
      "solution": "function mod(n, m) {\n  return ((n % m) + m) % m;\n}",
      "tests": [
        {
          "name": "положительные",
          "code": "return mod(5, 3) === 2 && mod(3, 3) === 0;"
        },
        {
          "name": "отрицательные",
          "code": "return mod(-1, 5) === 4 && mod(-6, 5) === 4 && mod(-5, 5) === 0;"
        }
      ]
    },
    {
      "title": "randomInt в диапазоне",
      "level": "middle",
      "prompt": "Реализуйте `randomInt(min, max)` — случайное **целое** в диапазоне `[min, max]` включительно, равномерное.",
      "starter": "function randomInt(min, max) {\n  // ваш код\n}",
      "solution": "function randomInt(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}",
      "tests": [
        {
          "name": "границы и целые",
          "code": "const seen = new Set(); for (let i = 0; i < 2000; i++) { const x = randomInt(1, 3); if (!Number.isInteger(x) || x < 1 || x > 3) return false; seen.add(x); } return seen.size === 3;"
        }
      ]
    }
  ]
});
