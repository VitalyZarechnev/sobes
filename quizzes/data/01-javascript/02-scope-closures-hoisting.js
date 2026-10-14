QUIZ.register({
  "id": "01-javascript/02-scope-closures-hoisting",
  "section": "01-javascript",
  "title": "Области видимости, замыкания, hoisting",
  "order": 2,
  "source": "../01-javascript/02-scope-closures-hoisting.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(typeof f, typeof g);\nfunction f() {}\nvar g = function () {};",
      "options": [
        "`'function' 'function'`",
        "`'function' 'undefined'`",
        "`'undefined' 'undefined'`",
        "ReferenceError"
      ],
      "answer": 1,
      "explain": "Function declaration всплывает целиком, `var g` — только как `undefined`."
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
        "ReferenceError"
      ],
      "answer": 3,
      "explain": "Внутренний `x` уже объявлен в блоке и находится в TDZ — внешний затенён."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const fns = [];\nfor (let i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns.map((f) => f()).join());",
      "options": [
        "`3,3,3`",
        "`0,1,2`",
        "`undefined`",
        "`2,2,2`"
      ],
      "answer": 1,
      "explain": "`let` в цикле создаёт новую привязку на каждую итерацию."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "function makeCounter() {\n  let count = 0;\n  return { inc: () => ++count, get: () => count };\n}\nconst a = makeCounter();\nconst b = makeCounter();\na.inc(); a.inc(); b.inc();\nconsole.log(a.get(), b.get());",
      "options": [
        "`3 3`",
        "`2 1`",
        "`1 1`",
        "`2 2`"
      ],
      "answer": 1,
      "explain": "Каждый вызов фабрики создаёт своё лексическое окружение."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему замыкание может вызвать утечку памяти?",
      "options": [
        "Замыкания всегда утекают",
        "Функция, живущая долго (обработчик, кэш), держит всё окружение, включая большие объекты",
        "Из-за hoisting",
        "Из-за TDZ"
      ],
      "answer": 1,
      "explain": "V8 сохраняет только используемые переменные, но общий контекст разделяется между замыканиями одной функции."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое TDZ?",
      "options": [
        "Зона, где `var` равен `undefined`",
        "Промежуток от начала области до объявления `let`/`const`/`class`, где обращение бросает ReferenceError",
        "Глобальная область",
        "Область модуля"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "\"use strict\";\nif (true) {\n  function hello() { return \"hi\"; }\n}\nconsole.log(typeof hello);",
      "options": [
        "`'function'`",
        "`'undefined'`",
        "ReferenceError",
        "`'object'`"
      ],
      "answer": 1,
      "explain": "В strict mode function declaration в блоке — блочная. В sloppy mode было бы `function` (Annex B)."
    }
  ],
  "tasks": [
    {
      "title": "once",
      "level": "middle",
      "prompt": "Реализуйте `once(fn)`: возвращает функцию, которая вызывает `fn` только при первом вызове (с переданными аргументами и `this`), а затем всегда возвращает первый результат.",
      "starter": "function once(fn) {\n  // ваш код\n}",
      "solution": "function once(fn) {\n  let called = false;\n  let result;\n  return function (...args) {\n    if (!called) {\n      called = true;\n      result = fn.apply(this, args);\n    }\n    return result;\n  };\n}",
      "tests": [
        {
          "name": "один вызов",
          "code": "let n = 0; const f = once((x) => { n++; return x * 2; }); return f(2) === 4 && f(10) === 4 && n === 1;"
        },
        {
          "name": "this",
          "code": "const obj = { v: 3, get: once(function () { return this.v; }) }; return obj.get() === 3;"
        },
        {
          "name": "undefined результат",
          "code": "let n = 0; const f = once(() => { n++; }); f(); f(); return n === 1;"
        }
      ]
    },
    {
      "title": "Счётчик с приватным состоянием",
      "level": "middle",
      "prompt": "Реализуйте `createCounter(start = 0, step = 1)` → объект с методами `next()` (увеличивает и возвращает значение), `reset()` (возвращает к start) и геттером `value`. Состояние недоступно снаружи (нет свойства с числом на объекте).",
      "starter": "function createCounter(start = 0, step = 1) {\n  // ваш код\n}",
      "solution": "function createCounter(start = 0, step = 1) {\n  let current = start;\n  return {\n    next: () => (current += step),\n    reset: () => {\n      current = start;\n    },\n    get value() {\n      return current;\n    },\n  };\n}",
      "tests": [
        {
          "name": "next",
          "code": "const c = createCounter(10, 5); c.next(); return c.next() === 20 && c.value === 20;"
        },
        {
          "name": "reset",
          "code": "const c = createCounter(); c.next(); c.reset(); return c.value === 0;"
        },
        {
          "name": "приватность",
          "code": "const c = createCounter(7); return Object.values(Object.getOwnPropertyDescriptors(c)).every((d) => typeof d.value === \"function\" || typeof d.get === \"function\");"
        }
      ]
    }
  ]
});
