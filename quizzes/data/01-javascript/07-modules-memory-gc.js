QUIZ.register({
  "id": "01-javascript/07-modules-memory-gc",
  "section": "01-javascript",
  "title": "Модули, память, сборка мусора",
  "order": 7,
  "source": "../01-javascript/07-modules-memory-gc.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем ESM отличается от CommonJS?",
      "options": [
        "Ничем",
        "Статические импорты (tree shaking), live bindings, асинхронная загрузка, strict mode",
        "ESM работает только в Node",
        "CommonJS быстрее в браузере"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "// counter.js\nexport let count = 0;\nexport const inc = () => { count++; };\n// main.js\nimport { count, inc } from \"./counter.js\";\ninc();\nconsole.log(count);",
      "options": [
        "`0`",
        "`1`",
        "TypeError",
        "`undefined`"
      ],
      "answer": 1,
      "explain": "ESM-импорты — живые привязки к переменным модуля. В CommonJS скопировалось бы значение 0."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Модуль импортирован в 10 местах. Сколько раз выполнится его код верхнего уровня?",
      "options": [
        "10",
        "1 — модули кэшируются",
        "0",
        "Зависит от сборщика всегда"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как сборщик мусора решает, что объект можно удалить?",
      "options": [
        "По времени жизни",
        "Объект недостижим от корней (глобальные объекты, стек, активные замыкания)",
        "По счётчику ссылок только",
        "Никогда не удаляет объекты"
      ],
      "answer": 1,
      "explain": "Циклические ссылки между недостижимыми объектами не мешают сборке (mark-and-sweep)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое detached DOM node?",
      "options": [
        "Элемент в shadow DOM",
        "Элемент, удалённый из документа, но удерживаемый ссылкой из JS — частая утечка",
        "Скрытый элемент",
        "Элемент в iframe"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `import()`?",
      "options": [
        "Синхронно загружает модуль",
        "Динамически загружает модуль и возвращает промис — основа code splitting",
        "Импортирует JSON",
        "Только в Node"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "LRU-кэш с ограничением по размеру",
      "level": "middle",
      "prompt": "Реализуйте `memoizeLimited(fn, limit)`: мемоизация по первому аргументу-примитиву с ограничением на `limit` записей — при переполнении удаляется давно не использованная запись (обращение к закэшированному значению делает его «свежим»).",
      "starter": "function memoizeLimited(fn, limit) {\n  // ваш код\n}",
      "solution": "function memoizeLimited(fn, limit) {\n  const cache = new Map();\n  return (key) => {\n    if (cache.has(key)) {\n      const value = cache.get(key);\n      cache.delete(key);\n      cache.set(key, value);\n      return value;\n    }\n    const value = fn(key);\n    cache.set(key, value);\n    if (cache.size > limit) cache.delete(cache.keys().next().value);\n    return value;\n  };\n}",
      "tests": [
        {
          "name": "кэширует",
          "code": "let n = 0; const f = memoizeLimited((x) => { n++; return x * 2; }, 2); f(1); f(1); return n === 1;"
        },
        {
          "name": "вытеснение",
          "code": "let n = 0; const f = memoizeLimited((x) => { n++; return x; }, 2); f(1); f(2); f(3); f(1); return n === 4;"
        },
        {
          "name": "свежесть",
          "code": "let n = 0; const f = memoizeLimited((x) => { n++; return x; }, 2); f(1); f(2); f(1); f(3); f(1); return n === 3;"
        }
      ],
      "notes": "Неограниченный кэш в долгоживущем SPA — классическая утечка памяти."
    }
  ]
});
