QUIZ.register({
  "id": "01-javascript/06-objects-collections-iterators",
  "section": "01-javascript",
  "title": "Объекты, коллекции, итераторы, Proxy",
  "order": 6,
  "source": "../01-javascript/06-objects-collections-iterators.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const obj = { a: 1, [Symbol(\"s\")]: 2 };\nObject.defineProperty(obj, \"hidden\", { value: 3, enumerable: false });\nconsole.log(Object.keys(obj).length, Reflect.ownKeys(obj).length);",
      "options": [
        "`1 3`",
        "`3 3`",
        "`1 1`",
        "`2 3`"
      ],
      "answer": 0,
      "explain": "`Object.keys` — только собственные перечисляемые строковые ключи; `Reflect.ownKeys` — все."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что нужно, чтобы объект работал в `for...of`?",
      "options": [
        "Свойство `length`",
        "Метод `[Symbol.iterator]()`, возвращающий итератор с `next()`",
        "Наследоваться от Array",
        "Метод `forEach`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "function* gen() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst g = gen();\nconsole.log(g.next().value, g.next(5).value, g.next().done);",
      "options": [
        "`1 50 true`",
        "`1 10 true`",
        "`1 undefined false`",
        "`5 50 true`"
      ],
      "answer": 0,
      "explain": "Значение `next(5)` становится результатом `yield 1`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Для чего Proxy во Vue 3?",
      "options": [
        "Для сетевых запросов",
        "Перехват чтения/записи свойств для отслеживания зависимостей и запуска эффектов",
        "Для SSR",
        "Для шифрования"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const frozen = Object.freeze({ inner: { v: 1 } });\nfrozen.inner.v = 2;\nconsole.log(frozen.inner.v);",
      "options": [
        "`1`",
        "`2`",
        "TypeError",
        "`undefined`"
      ],
      "answer": 1,
      "explain": "`Object.freeze` поверхностный."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем WeakMap полезен для кэша по объектам?",
      "options": [
        "Быстрее Map",
        "Ключи не мешают сборке мусора: когда объект больше не нужен, запись исчезает",
        "Можно перебирать",
        "Хранит примитивы"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "range — итерируемый объект",
      "level": "middle",
      "prompt": "Реализуйте `range(start, end, step = 1)` — итерируемый объект (не массив!), который выдаёт числа от `start` до `end` не включительно с шагом `step` (поддержите отрицательный шаг). Повторный перебор должен работать заново.",
      "starter": "function range(start, end, step = 1) {\n  // ваш код\n}",
      "solution": "function range(start, end, step = 1) {\n  return {\n    *[Symbol.iterator]() {\n      for (let x = start; step > 0 ? x < end : x > end; x += step) yield x;\n    },\n  };\n}",
      "tests": [
        {
          "name": "вперёд",
          "code": "return [...range(0, 5)].join() === \"0,1,2,3,4\";"
        },
        {
          "name": "шаг",
          "code": "return [...range(0, 10, 3)].join() === \"0,3,6,9\";"
        },
        {
          "name": "назад",
          "code": "return [...range(5, 0, -2)].join() === \"5,3,1\";"
        },
        {
          "name": "не массив и повторно",
          "code": "const r = range(0, 2); return !Array.isArray(r) && [...r].length === 2 && [...r].length === 2;"
        }
      ]
    },
    {
      "title": "Proxy: объект с валидацией",
      "level": "senior",
      "prompt": "Реализуйте `withSchema(target, schema)`, где `schema` — `{ [key]: (value) => boolean }`. Возвращает Proxy: запись в поле со схемой и невалидным значением бросает `TypeError`; запись в поле, которого нет в схеме, бросает `TypeError`; чтение несуществующего поля возвращает `undefined`.",
      "starter": "function withSchema(target, schema) {\n  // ваш код\n}",
      "solution": "function withSchema(target, schema) {\n  return new Proxy(target, {\n    set(obj, key, value, receiver) {\n      if (!Object.hasOwn(schema, key)) throw new TypeError(`Неизвестное поле ${String(key)}`);\n      if (!schema[key](value)) throw new TypeError(`Неверное значение для ${String(key)}`);\n      return Reflect.set(obj, key, value, receiver);\n    },\n  });\n}",
      "tests": [
        {
          "name": "валидная запись",
          "code": "const u = withSchema({}, { age: (v) => Number.isInteger(v) && v >= 0 }); u.age = 30; return u.age === 30;"
        },
        {
          "name": "невалидная",
          "code": "const u = withSchema({}, { age: (v) => Number.isInteger(v) }); try { u.age = \"x\"; return false; } catch (e) { return e instanceof TypeError; }"
        },
        {
          "name": "неизвестное поле",
          "code": "const u = withSchema({}, { a: () => true }); try { u.b = 1; return false; } catch (e) { return e instanceof TypeError; }"
        }
      ]
    }
  ]
});
