QUIZ.register({
  "id": "01-javascript/01-types-and-coercion",
  "section": "01-javascript",
  "title": "Типы и приведение типов",
  "order": 1,
  "source": "../01-javascript/01-types-and-coercion.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log('5' - 2, '5' + 2, -'5' + 2);",
      "options": [
        "3 52 -3",
        "3 7 -3",
        "3 52 3",
        "NaN 52 -3"
      ],
      "answer": 0,
      "explain": "`-` всегда числовой: `\"5\" - 2 = 3`. Бинарный `+` со строкой — конкатенация: `\"52\"`. Унарный минус приводит строку к числу: `-5 + 2 = -3`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(typeof null, typeof NaN, typeof class {}, typeof undeclaredVariable);",
      "options": [
        "object number function undefined",
        "null number class undefined",
        "object NaN function ReferenceError",
        "object number object undefined"
      ],
      "answer": 0,
      "explain": "`typeof null === \"object\"` — исторический баг. `NaN` — значение типа number. Класс — функция (`[[Call]]`/`[[Construct]]`). Для необъявленной переменной `typeof` не бросает, а возвращает `\"undefined\"` (в отличие от переменной в TDZ)."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log([] == ![], [0] == false, null == false, null >= 0);",
      "options": [
        "true true false true",
        "false true false true",
        "true false false false",
        "true true true true"
      ],
      "answer": 0,
      "explain": "`![]` → `false`, затем `[] == false` → `[] == 0` → `\"\" == 0` → `true`. `[0] == false` → `\"0\" == 0` → `true`. `null` нестрого равен только `undefined`, поэтому `null == false` — `false`. А `>=` использует ToNumber: `0 >= 0` → `true`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log([NaN].indexOf(NaN), [NaN].includes(NaN), new Set([0, -0, NaN, NaN]).size, Object.is(0, -0));",
      "options": [
        "-1 true 2 false",
        "0 true 2 false",
        "-1 true 4 true",
        "-1 false 3 false"
      ],
      "answer": 0,
      "explain": "`indexOf` использует `===` (NaN не равен себе) → `-1`. `includes` и ключи `Set` — SameValueZero: NaN равен NaN, `0` и `-0` равны → в Set два элемента. `Object.is` (SameValue) различает `+0` и `-0`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код (hint в Symbol.toPrimitive)?",
      "code": "const obj = {\n  [Symbol.toPrimitive](hint) {\n    console.log(hint);\n    return 1;\n  },\n};\nobj + 1;\nString(obj);\nobj * 2;\nobj == 1;",
      "options": [
        "default string number default",
        "number string number number",
        "default string number number",
        "number string number default"
      ],
      "answer": 0,
      "explain": "Бинарный `+` и `==` передают hint `\"default\"` (они не знают, строка нужна или число). `String(x)` и шаблонные строки — `\"string\"`, арифметика кроме `+` — `\"number\"`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(0 || 10, 0 ?? 10, NaN ?? 'x', null ?? undefined ?? 'y');",
      "options": [
        "10 0 NaN y",
        "10 10 x y",
        "10 0 x y",
        "0 0 NaN undefined"
      ],
      "answer": 0,
      "explain": "`||` отбрасывает любые falsy-значения, `??` — только `null` и `undefined`. Поэтому `0 ?? 10` → `0`, `NaN ?? \"x\"` → `NaN`. Цепочка `??` идёт до первого не-nullish значения."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "const d = new Date(0);\nconsole.log(typeof (d + 1), typeof (d - 1), typeof +d);",
      "options": [
        "string number number",
        "number number number",
        "string string number",
        "object number number"
      ],
      "answer": 0,
      "explain": "У `Date` в `Symbol.toPrimitive` hint `\"default\"` трактуется как `\"string\"`, поэтому `d + 1` — конкатенация строки даты с `\"1\"`. Вычитание и унарный плюс передают hint `\"number\"` → `valueOf()` → миллисекунды."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(['1', '2', '3'].map(parseInt).join(), parseInt(0.0000005));",
      "options": [
        "1,NaN,NaN 5",
        "1,2,3 0",
        "1,NaN,3 5",
        "1,2,3 5"
      ],
      "answer": 0,
      "explain": "`map` передаёт `(value, index)`, а `parseInt` трактует второй аргумент как radix: `parseInt(\"2\", 1)` и `parseInt(\"3\", 2)` дают `NaN`. `String(0.0000005) === \"5e-7\"`, и `parseInt` читает цифры до `e` → `5`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "const data = JSON.parse('{\"id\": 9007199254740993}');\nconsole.log(data.id, Number.isSafeInteger(data.id));",
      "options": [
        "9007199254740992 false",
        "9007199254740993 true",
        "9007199254740993 false",
        "SyntaxError"
      ],
      "answer": 0,
      "explain": "Число больше `Number.MAX_SAFE_INTEGER` (2^53 − 1) не представимо точно в double: `JSON.parse` округляет его ещё до того, как код увидит значение. Решения: передавать int64 строкой или использовать reviver с доступом к исходному тексту (`context.source`)."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие значения falsy?",
      "options": [
        "`\"0\"`",
        "`0n`",
        "`-0`",
        "`[]`",
        "`NaN`",
        "`new Boolean(false)`",
        "`\"\"`"
      ],
      "answer": [
        1,
        2,
        4,
        6
      ],
      "explain": "Falsy ровно: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN` (+ `document.all`). Строка `\"0\"` непустая, а `[]` и `new Boolean(false)` — объекты, значит truthy."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какое выражение бросит `TypeError`?",
      "options": [
        "`1n + 1`",
        "`1n < 2`",
        "`1n == 1`",
        "`String(10n)`"
      ],
      "answer": 0,
      "explain": "Смешивать BigInt и Number в арифметике запрещено — нужно явное приведение. Сравнения (`<`, `==`) смешивать можно: они сравнивают математические значения. `String(10n)` → `\"10\"`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему для массивов используют `Array.isArray(x)`, а не `x instanceof Array`?",
      "options": [
        "У каждого realm (iframe, `node:vm`, окно) свой `Array.prototype`, и массив из другого realm не пройдёт `instanceof`",
        "`instanceof` медленнее, потому что проходит всю цепочку прототипов",
        "`instanceof Array` возвращает `true` и для array-like объектов вроде `arguments`",
        "`instanceof` не работает с массивами, созданными через литерал `[]`"
      ],
      "answer": 0,
      "explain": "`instanceof` ищет `Array.prototype` текущего realm в цепочке `[[Prototype]]`. Массив из iframe наследует от другого `Array.prototype`. `Array.isArray` проверяет внутреннюю природу exotic-объекта и работает кросс-realm. `arguments` не проходит `instanceof Array`."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите шаги `ToPrimitive(obj, \"number\")` для обычного объекта в порядке выполнения",
      "items": [
        "Если есть `obj[Symbol.toPrimitive]` — вызвать его с hint и вернуть результат (не примитив → TypeError)",
        "Иначе вызвать `valueOf()`; если вернул примитив — это результат",
        "Иначе вызвать `toString()`; если вернул примитив — это результат",
        "Иначе бросить `TypeError`"
      ],
      "explain": "Для hint `\"number\"` и `\"default\"` порядок `valueOf → toString`, для `\"string\"` — наоборот. `Symbol.toPrimitive` имеет приоритет над обоими."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему `0.1 + 0.2 !== 0.3` и как правильно хранить деньги?",
      "options": [
        "Числа — IEEE 754 double, 0.1 и 0.2 не представимы точно; деньги хранить в минимальных единицах (целые копейки) или BigInt",
        "Это баг V8, в других движках `0.1 + 0.2 === 0.3`",
        "Нужно использовать `toFixed(2)` при каждом вычислении — это решает проблему точности",
        "Нужно сравнивать через `==`, он учитывает погрешность"
      ],
      "answer": 0,
      "explain": "Ошибка — свойство двоичной плавающей точки, а не движка. `toFixed` возвращает строку и только маскирует ошибку при выводе. Для сравнения дробей — `Math.abs(a - b) < Number.EPSILON`, для денег — целые единицы и `Intl.NumberFormat` для форматирования."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "Как вы закрепите в команде правила работы с равенством и приведением типов, чтобы баги вида `count || 10` и `==` не попадали в прод?",
      "answer": "- **Линтер**: `eqeqeq` (с исключением `null: ignore` для идиомы `x == null`), `no-implicit-coercion`, `@typescript-eslint/prefer-nullish-coalescing`, `strict-boolean-expressions` для критичных модулей.\n- **TypeScript strict**: `strictNullChecks`, `noUncheckedIndexedAccess` — большая часть неявных приведений становится ошибкой типов.\n- **Границы системы**: валидация входящих данных схемой (Zod/Valibot), числа из query/форм парсятся явно; int64 и деньги — строкой/в минимальных единицах.\n- **Код-ревью и гайд**: короткий документ «как сравнивать» (`===`, `Object.is` для NaN/-0, `Number.isNaN`), примеры багов из истории проекта.\n- **Тесты** на граничные значения: `0`, `\"\"`, `NaN`, `null`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "{\n  console.log(typeof y);\n  console.log(typeof x);\n  let x = 1;\n}",
      "options": [
        "'undefined', затем 'undefined'",
        "'undefined', затем ReferenceError",
        "ReferenceError на первой строке",
        "'undefined', затем 'number'"
      ],
      "answer": 1,
      "explain": "`y` не объявлена нигде — `typeof` для необъявленной переменной возвращает `'undefined'` без ошибки. `x` объявлена через `let` ниже в том же блоке, поэтому до строки объявления она в **TDZ**: обращение даже через `typeof` бросает `ReferenceError`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что произойдёт при вызове `f()`?",
      "code": "function f(a = b, b = 1) {\n  return [a, b];\n}\nf();",
      "options": [
        "`[undefined, 1]`",
        "`[1, 1]`",
        "`ReferenceError`",
        "`[NaN, 1]`"
      ],
      "answer": 2,
      "explain": "Параметры по умолчанию вычисляются слева направо и ведут себя как `let`: в момент вычисления `a` параметр `b` ещё в TDZ → `ReferenceError`. А вот `function f(a = 1, b = a)` работает."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "let x = 1;\n{\n  console.log(x);\n  let x = 2;\n}",
      "options": [
        "`1`",
        "`2`",
        "`undefined`",
        "`ReferenceError`"
      ],
      "answer": 3,
      "explain": "Внутренний `let x` затеняет внешний на **весь** блок, начиная с его первой строки. До объявления внутренний `x` в TDZ — поэтому `ReferenceError`, а не `1` из внешней области."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие значения **truthy**?",
      "options": [
        "`'0'`",
        "`[]`",
        "`NaN`",
        "`new Boolean(false)`",
        "`0n`",
        "`' '` (строка из пробела)"
      ],
      "answer": [
        0,
        1,
        3,
        5
      ],
      "explain": "Falsy ровно восемь: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Непустые строки (`'0'`, `' '`) и любые объекты (`[]`, обёртка `new Boolean(false)`) — truthy."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чему равно `Number(' \\n ')` (строка из пробела, переноса строки и пробела)?",
      "options": [
        "`NaN`",
        "`0`",
        "`undefined`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "Строка обрезается по краям (включая `\\n`, `\\t`), остаётся пустая, а пустая строка приводится к `0`. При этом `Boolean(' \\n ')` — `true`: строка непустая."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие выражения дают `NaN`?",
      "options": [
        "`Number(undefined)`",
        "`Number(null)`",
        "`Number('12px')`",
        "`Number([1, 2])`",
        "`Number([])`",
        "`Number({})`"
      ],
      "answer": [
        0,
        2,
        3,
        5
      ],
      "explain": "`undefined → NaN`, `null → 0`. `'12px'` — не число целиком (а `parseInt` дал бы 12). `[1, 2] → '1,2' → NaN`. `[] → '' → 0`. `{} → '[object Object]' → NaN`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "function replace(obj) { obj = { n: 2 }; }\nfunction mutate(obj) { obj.n = 3; }\nconst data = { n: 1 };\nreplace(data);\nmutate(data);\nconsole.log(data.n);",
      "options": [
        "`1`",
        "`2`",
        "`3`",
        "`undefined`"
      ],
      "answer": 2,
      "explain": "Аргументы передаются по значению, но значение объекта — ссылка. `replace` переприсваивает только свою локальную переменную, на `data` это не влияет. `mutate` меняет содержимое общего объекта → `3`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const s = 'abc';\ns.custom = 1;\ns[0] = 'X';\nconsole.log(s, s.custom);",
      "options": [
        "`'Xbc' 1`",
        "`'abc' undefined`",
        "`'abc' 1`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "Без strict mode запись в примитив молча теряется: свойство пишется во временную обёртку `String`, которая сразу уничтожается, а строки иммутабельны. (В strict mode обе записи бросили бы `TypeError`.)"
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log(1 < 2 < 3, 3 > 2 > 1);",
      "options": [
        "`true true`",
        "`true false`",
        "`false true`",
        "`false false`"
      ],
      "answer": 1,
      "explain": "Сравнения выполняются слева направо и возвращают boolean: `true < 3` → `1 < 3` → `true`; `true > 1` → `1 > 1` → `false`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "let a = '5';\nconst b = a++;\nconsole.log(typeof a, typeof b);",
      "options": [
        "`'number' 'number'`",
        "`'number' 'string'`",
        "`'string' 'string'`",
        "`'string' 'number'`"
      ],
      "answer": 0,
      "explain": "`++` всегда числовой: значение сначала приводится к числу, и постфиксная форма возвращает старое значение **уже числом** (`5`). В `a` записывается `6`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `typeof null === 'object'`?",
      "options": [
        "`null` — это пустой объект по спецификации",
        "Исторический баг первой реализации, который нельзя исправить без поломки веба",
        "Так сделано для совместимости с Java",
        "`null` — это прототип всех объектов"
      ],
      "answer": 1,
      "explain": "В первой реализации у значений был тег типа в младших битах, у объектов — 0, а `null` был нулевым указателем, и его тег тоже читался как 0. Исправление предлагали в ES2015-эпоху, но отклонили. Проверять `null` надо через `x === null`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой результат `typeof` невозможен?",
      "options": [
        "`'bigint'`",
        "`'function'`",
        "`'null'`",
        "`'symbol'`"
      ],
      "answer": 2,
      "explain": "`typeof` возвращает одно из восьми: `'undefined'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'`, `'object'`, `'function'`. Для `null` он возвращает `'object'`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(0 || 'a', 0 ?? 'a', '' && 'b', null || undefined || 0);",
      "options": [
        "`'a' 0 '' 0`",
        "`'a' 'a' '' 0`",
        "`'a' 0 'b' undefined`",
        "`true false false false`"
      ],
      "answer": 0,
      "explain": "`||` возвращает первый truthy-операнд или последний; `??` срабатывает только на `null`/`undefined`; `&&` возвращает первый falsy. Логические операторы возвращают **операнды**, а не boolean."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "const o = { valueOf() { return 42; }, toString() { return 'obj'; } };\nconsole.log(o + '', `${o}`);",
      "options": [
        "`'42' 'obj'`",
        "`'obj' 'obj'`",
        "`'42' '42'`",
        "`'obj' '42'`"
      ],
      "answer": 0,
      "explain": "Бинарный `+` передаёт hint `'default'` — сначала `valueOf` → 42 → `'42'`. Шаблонная строка — hint `'string'` — сначала `toString` → `'obj'`."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите шаги вычисления `[] == ![]` по порядку",
      "items": [
        "`![]` → массив truthy → `false`",
        "`[] == false` → boolean к числу → `[] == 0`",
        "объект к примитиву: `[]` → `''`",
        "`'' == 0` → строка к числу → `0 == 0`",
        "результат `true`"
      ],
      "explain": "Сначала вычисляется унарный `!`. Затем правила `==`: boolean приводится к числу первым, объект — к примитиву, строка — к числу."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Объясните разницу между «передачей по значению» и «по ссылке» в JS и почему говорят «call by sharing».",
      "answer": "В JS всё передаётся **по значению**, но у объектов это значение — **ссылка**. Поэтому функция может изменить содержимое объекта (`obj.x = 1` видно снаружи), но не может подменить сам объект в переменной вызывающего кода (`obj = {}` внутри функции меняет только локальную переменную). Это и называют call by sharing. Следствия: иммутабельные обновления (`{...obj}`) в React/Redux, защитное копирование, `structuredClone` для глубоких копий."
    }
  ],
  "tasks": [
    {
      "title": "SameValueZero без includes/Map",
      "level": "middle",
      "prompt": "Реализуйте `isSameValueZero(a, b)` — сравнение по алгоритму SameValueZero (как в `includes` и ключах `Map`): `NaN` равен `NaN`, `+0` равен `-0`. Нельзя использовать `includes`, `Map`, `Set`.",
      "starter": "function isSameValueZero(a, b) {\n  // ваш код\n}",
      "solution": "function isSameValueZero(a, b) {\n  // x !== x истинно только для NaN\n  return a === b || (a !== a && b !== b);\n}",
      "notes": "O(1). `Number.isNaN(a) && Number.isNaN(b)` — тоже корректно. `isNaN` без `Number.` — нет: он приводит строки (`isNaN(\"abc\") === true`).",
      "tests": [
        {
          "name": "NaN равен NaN",
          "code": "return isSameValueZero(NaN, NaN) === true;"
        },
        {
          "name": "+0 и -0 равны",
          "code": "return isSameValueZero(0, -0) === true && isSameValueZero(-0, 0) === true;"
        },
        {
          "name": "строки и числа не равны",
          "code": "return isSameValueZero('1', 1) === false && isSameValueZero('abc', NaN) === false;"
        },
        {
          "name": "объекты по ссылке",
          "code": "const o = {}; return isSameValueZero(o, o) && !isSameValueZero({}, {});"
        }
      ]
    },
    {
      "title": "Точный тип значения: getType",
      "level": "middle",
      "prompt": "Напишите `getType(x)`, возвращающий тип в нижнем регистре: `'null'`, `'undefined'`, `'number'`, `'string'`, `'array'`, `'date'`, `'regexp'`, `'map'`, `'set'`, `'object'`, `'function'`, `'asyncfunction'` и т.д. Решение должно работать для объектов из другого realm (iframe), поэтому `instanceof` не подходит.",
      "starter": "function getType(x) {\n  // ваш код\n}",
      "solution": "function getType(x) {\n  if (x === null) return 'null';\n  const t = typeof x;\n  if (t !== 'object' && t !== 'function') return t;\n  return Object.prototype.toString.call(x).slice(8, -1).toLowerCase();\n}",
      "notes": "`Object.prototype.toString` читает `Symbol.toStringTag` или внутренний brand и одинаково работает в любом realm. Оговорка: пользовательский `Symbol.toStringTag` подделывает результат.",
      "tests": [
        {
          "name": "примитивы",
          "code": "return getType(1) === 'number' && getType('') === 'string' && getType(undefined) === 'undefined' && getType(null) === 'null' && getType(1n) === 'bigint';"
        },
        {
          "name": "встроенные объекты",
          "code": "return getType([]) === 'array' && getType(new Date()) === 'date' && getType(/x/) === 'regexp' && getType(new Map()) === 'map' && getType({}) === 'object';"
        },
        {
          "name": "функции",
          "code": "return getType(() => {}) === 'function' && getType(async () => {}) === 'asyncfunction';"
        }
      ]
    },
    {
      "title": "Реализуйте == без ==",
      "level": "senior",
      "prompt": "Реализуйте `looseEqual(x, y)` по алгоритму `IsLooselyEqual` из спецификации, **не используя `==` и `!=`**. Нужно поддержать: одинаковые типы, `null`/`undefined`, number↔string, bigint↔string, boolean↔что угодно, object↔примитив (через ToPrimitive с hint `default`), bigint↔number. Результат должен совпадать с `x == y` для любых пар.",
      "starter": "function looseEqual(x, y) {\n  // ваш код\n}",
      "solution": "const typeOf = (v) => (v === null ? 'null' : typeof v === 'function' ? 'object' : typeof v);\n\nfunction toPrimitive(obj) {\n  const exotic = obj[Symbol.toPrimitive];\n  if (exotic !== undefined && exotic !== null) {\n    const r = exotic.call(obj, 'default');\n    if (typeOf(r) === 'object') throw new TypeError('Cannot convert object to primitive value');\n    return r;\n  }\n  for (const method of ['valueOf', 'toString']) {\n    const fn = obj[method];\n    if (typeof fn === 'function') {\n      const r = fn.call(obj);\n      if (typeOf(r) !== 'object') return r;\n    }\n  }\n  throw new TypeError('Cannot convert object to primitive value');\n}\n\nfunction bigIntEqualsNumber(b, n) {\n  return Number.isInteger(n) && BigInt(n) === b; // NaN, Infinity и дроби — false\n}\n\nfunction looseEqual(x, y) {\n  const tx = typeOf(x);\n  const ty = typeOf(y);\n  if (tx === ty) return x === y;\n  const nullish = (t) => t === 'null' || t === 'undefined';\n  if (nullish(tx) || nullish(ty)) return nullish(tx) && nullish(ty);\n  if (tx === 'number' && ty === 'string') return x === Number(y);\n  if (tx === 'string' && ty === 'number') return Number(x) === y;\n  if (tx === 'bigint' && ty === 'string') {\n    try { return x === BigInt(y); } catch { return false; }\n  }\n  if (tx === 'string' && ty === 'bigint') return looseEqual(y, x);\n  if (tx === 'boolean') return looseEqual(Number(x), y);\n  if (ty === 'boolean') return looseEqual(x, Number(y));\n  if (tx === 'object') return looseEqual(toPrimitive(x), y);\n  if (ty === 'object') return looseEqual(x, toPrimitive(y));\n  if (tx === 'bigint' && ty === 'number') return bigIntEqualsNumber(x, y);\n  if (tx === 'number' && ty === 'bigint') return bigIntEqualsNumber(y, x);\n  return false; // symbol с не-symbol и т.п.\n}",
      "notes": "Ключевые моменты: boolean приводится к числу **первым** (поэтому `\"true\" == true` — `false`); `null`/`undefined` равны только друг другу; объект приводится через `Symbol.toPrimitive` → `valueOf` → `toString`; невалидная строка для BigInt даёт `false`, а не исключение. Порядок шагов важен: object↔boolean сначала превращает boolean в число.",
      "tests": [
        {
          "name": "совпадает с == на матрице значений",
          "code": "const vals = [0, -0, 1, 2, NaN, Infinity, '', '0', '1', ' 1 ', '1,2', 'abc', '[object Object]', true, false, null, undefined, 0n, 1n, [], [0], [1], [1, 2], {}, Symbol.iterator];\nfor (const a of vals) for (const b of vals) {\n  if (looseEqual(a, b) !== (a == b)) return false;\n}\nreturn true;"
        },
        {
          "name": "классика [] == ![]",
          "code": "return looseEqual([], ![]) === true && looseEqual(null, 0) === false && looseEqual(null, undefined) === true;"
        },
        {
          "name": "Symbol.toPrimitive и Date",
          "code": "const m = { [Symbol.toPrimitive]: (h) => (h === 'default' ? 42 : 0) };\nconst d = new Date(0);\nreturn looseEqual(m, 42) && looseEqual(d, d.toString()) && !looseEqual(d, 0);"
        },
        {
          "name": "bigint и строка с мусором",
          "code": "return looseEqual(1n, '1') && !looseEqual(1n, '1.5') && !looseEqual(1n, 'x') && looseEqual(2n, 2) && !looseEqual(2n, 2.5);"
        }
      ]
    },
    {
      "title": "toBoolean без Boolean",
      "level": "middle",
      "prompt": "Реализуйте `toBoolean(x)`, повторяющую `Boolean(x)` для любых значений, **не используя** `Boolean`, `!` и `if (x)` с самим значением (то есть без неявного приведения).\n\nПодсказка: перечислите 8 falsy-значений явно. Для `NaN` используйте свойство «не равен самому себе».",
      "starter": "function toBoolean(x) {\n  // ваш код\n}",
      "solution": "function toBoolean(x) {\n  if (x === false || x === 0 || x === 0n || x === '' || x === null || x === undefined) return false;\n  if (x !== x) return false; // NaN\n  return true;\n}",
      "notes": "`x === 0` покрывает и `-0` (для `===` нули равны). Объекты всегда truthy, даже `new Boolean(false)`.",
      "tests": [
        {
          "name": "falsy-значения",
          "code": "return [false, 0, -0, 0n, '', null, undefined, NaN].every(v => toBoolean(v) === false);"
        },
        {
          "name": "неочевидные truthy",
          "code": "return ['0', 'false', ' ', [], {}, -1, 1n, Infinity, new Boolean(false), Symbol()].every(v => toBoolean(v) === true);"
        }
      ]
    },
    {
      "title": "toNumber для строк как Number()",
      "level": "senior",
      "prompt": "Реализуйте `toNumber(str)` для **строк**, повторяющую `Number(str)` для десятичной записи:\n- пробельные символы по краям игнорируются;\n- пустая строка (или только пробелы) → `0`;\n- допускается знак `+`/`-`, дробная часть (`.5`, `5.`), экспонента (`1e3`, `2E-2`);\n- если строка не является числом **целиком** → `NaN` (в отличие от `parseFloat`).\n\nНельзя использовать `Number`, унарный `+` и арифметику со строкой (`str * 1`). `parseFloat` можно.",
      "starter": "function toNumber(str) {\n  // ваш код\n}",
      "solution": "function toNumber(str) {\n  const s = str.trim();\n  if (s === '') return 0;\n  const isNumeric = /^[-+]?(\\d+\\.?\\d*|\\.\\d+)(e[-+]?\\d+)?$/i.test(s);\n  return isNumeric ? parseFloat(s) : NaN;\n}",
      "notes": "Ключевое отличие от `parseFloat`: он читает префикс и отбрасывает хвост (`'12px'` → 12), а `Number` требует, чтобы строка была числом целиком.",
      "tests": [
        {
          "name": "числа",
          "code": "return toNumber('42') === 42 && toNumber(' -1.5 ') === -1.5 && toNumber('.5') === 0.5 && toNumber('1e3') === 1000 && toNumber('+3') === 3;"
        },
        {
          "name": "пустые строки → 0",
          "code": "return toNumber('') === 0 && toNumber('  \\n\\t ') === 0;"
        },
        {
          "name": "не число целиком → NaN",
          "code": "return [ '12px', '4 2', 'abc', '1.2.3', '--1' ].every(s => Number.isNaN(toNumber(s)));"
        }
      ]
    },
    {
      "title": "Тип значения для логов: describe(x)",
      "level": "middle",
      "prompt": "Напишите `describe(x)`, возвращающую строку для логов:\n- `null` → `'null'`, массив → `'array(N)'` где N — длина;\n- `NaN` → `'NaN'`, остальные числа → `'number'`;\n- функция → `'function'`, обычный объект → `'object'`;\n- остальные примитивы → результат `typeof`.",
      "starter": "function describe(x) {\n  // ваш код\n}",
      "solution": "function describe(x) {\n  if (x === null) return 'null';\n  if (Array.isArray(x)) return `array(${x.length})`;\n  if (typeof x === 'number' && Number.isNaN(x)) return 'NaN';\n  return typeof x;\n}",
      "tests": [
        {
          "name": "null и массивы",
          "code": "return describe(null) === 'null' && describe([1,2,3]) === 'array(3)' && describe([]) === 'array(0)';"
        },
        {
          "name": "числа",
          "code": "return describe(NaN) === 'NaN' && describe(1) === 'number' && describe(Infinity) === 'number';"
        },
        {
          "name": "прочее",
          "code": "return describe(() => 1) === 'function' && describe({}) === 'object' && describe('s') === 'string' && describe(1n) === 'bigint' && describe(undefined) === 'undefined';"
        }
      ]
    }
  ]
});
