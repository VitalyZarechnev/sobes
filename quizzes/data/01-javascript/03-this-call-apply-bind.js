QUIZ.register({
  "id": "01-javascript/03-this-call-apply-bind",
  "section": "01-javascript",
  "title": "this, call/apply/bind",
  "order": 3,
  "source": "../01-javascript/03-this-call-apply-bind.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "'use strict';\nconst user = {\n  name: 'Аня',\n  hi() { return this.name; },\n};\nconst hi = user.hi;\nconsole.log(hi());",
      "options": [
        "`'Аня'`",
        "TypeError: this равен undefined",
        "`''`",
        "`null`"
      ],
      "answer": 1,
      "explain": "Метод потерял контекст: обычный вызов в strict mode даёт `this === undefined`, чтение `.name` бросает TypeError. Без strict в браузере `this` был бы `window` (и `window.name === ''`)."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "'use strict';\nconst obj = {\n  name: 'obj',\n  regular() { return [1].map(function () { return this?.name; })[0]; },\n  arrow() { return [1].map(() => this.name)[0]; },\n};\nconsole.log(obj.regular(), obj.arrow());",
      "options": [
        "`'obj' 'obj'`",
        "`undefined 'obj'`",
        "`'obj' undefined`",
        "`undefined undefined`"
      ],
      "answer": 1,
      "explain": "Обычная функция-колбэк вызывается без контекста, стрелка берёт `this` метода."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "function f() { return this.x; }\nconst g = f.bind({ x: 1 }).bind({ x: 2 });\nconsole.log(g());",
      "options": [
        "`1`",
        "`2`",
        "`undefined`",
        "TypeError"
      ],
      "answer": 0,
      "explain": "Повторный `bind` не меняет уже привязанный `this`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `call` отличается от `apply`?",
      "options": [
        "Ничем",
        "`call` принимает аргументы списком, `apply` — массивом",
        "`apply` возвращает новую функцию",
        "`call` только для методов"
      ],
      "answer": 1,
      "explain": "`bind` возвращает новую функцию с привязанным контекстом."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "class Btn {\n  label = 'OK';\n  handleArrow = () => this.label;\n  handleMethod() { return this?.label; }\n}\nconst b = new Btn();\nconst { handleArrow, handleMethod } = b;\nconsole.log(handleArrow(), handleMethod());",
      "options": [
        "`'OK' 'OK'`",
        "`'OK' undefined`",
        "`undefined 'OK'`",
        "TypeError"
      ],
      "answer": 1,
      "explain": "Поле-стрелка захватывает `this` экземпляра; метод теряет контекст (в классах — strict, `this === undefined`)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что вернёт `new` для конструктора, который явно возвращает объект?",
      "options": [
        "Новый экземпляр",
        "Возвращённый объект",
        "`undefined`",
        "Ошибку"
      ],
      "answer": 1,
      "explain": "Если возвращается примитив — игнорируется, и результатом будет экземпляр."
    }
  ],
  "tasks": [
    {
      "title": "Полифил bind",
      "level": "senior",
      "prompt": "Реализуйте `myBind(fn, ctx, ...preset)` без `Function.prototype.bind`: возвращает функцию, которая вызывает `fn` с `this = ctx` и аргументами `preset` + переданные. При вызове через `new` контекст должен быть новым объектом (как у нативного bind), а прототип экземпляра — `fn.prototype`.",
      "starter": "function myBind(fn, ctx, ...preset) {\n  // ваш код\n}",
      "solution": "function myBind(fn, ctx, ...preset) {\n  function bound(...args) {\n    const isNew = new.target !== undefined;\n    return fn.apply(isNew ? this : ctx, [...preset, ...args]);\n  }\n  if (fn.prototype) bound.prototype = Object.create(fn.prototype);\n  return bound;\n}",
      "tests": [
        {
          "name": "контекст и аргументы",
          "code": "function sum(a, b) { return this.base + a + b; } const f = myBind(sum, { base: 10 }, 1); return f(2) === 13;"
        },
        {
          "name": "без нативного bind",
          "code": "return !myBind.toString().includes('.bind(');"
        },
        {
          "name": "new",
          "code": "function Point(x, y) { this.x = x; this.y = y; } const P = myBind(Point, { ignored: true }, 1); const p = new P(2); return p.x === 1 && p.y === 2 && p instanceof Point;"
        }
      ]
    }
  ]
});
