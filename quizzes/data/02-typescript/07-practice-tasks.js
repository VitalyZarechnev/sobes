QUIZ.register({
  "id": "02-typescript/07-practice-tasks",
  "section": "02-typescript",
  "title": "Практика: type challenges",
  "order": 7,
  "source": "../02-typescript/07-practice-tasks.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Как получить тип элемента массива `T`?",
      "options": [
        "`T[]`",
        "`T[number]`",
        "`keyof T`",
        "`T[\"length\"]`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как получить тип разрешённого промиса?",
      "options": [
        "`ReturnType<T>`",
        "`Awaited<T>`",
        "`Promise<T>`",
        "`T[\"then\"]`"
      ],
      "answer": 1,
      "explain": "`Awaited` рекурсивно разворачивает вложенные промисы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как реализовать `MyPick<T, K>`?",
      "options": [
        "`{ [P in K]: T[P] }` с `K extends keyof T`",
        "`T & K`",
        "`Exclude<T, K>`",
        "`T[K][]`"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что вернёт `type L = [\"a\", \"b\", \"c\"][\"length\"]`?",
      "options": [
        "`number`",
        "`3`",
        "`\"3\"`",
        "`never`"
      ],
      "answer": 1,
      "explain": "У кортежей длина — литерал."
    }
  ],
  "tasks": [
    {
      "title": "Рантайм-pick и omit",
      "level": "middle",
      "prompt": "Реализуйте рантайм-аналоги utility types: `pick(obj, keys)` и `omit(obj, keys)` — возвращают новые объекты. `pick` не добавляет отсутствующие ключи.",
      "starter": "function pick(obj, keys) {}\nfunction omit(obj, keys) {}",
      "solution": "function pick(obj, keys) {\n  return Object.fromEntries(keys.filter((k) => Object.hasOwn(obj, k)).map((k) => [k, obj[k]]));\n}\n\nfunction omit(obj, keys) {\n  const skip = new Set(keys);\n  return Object.fromEntries(Object.entries(obj).filter(([k]) => !skip.has(k)));\n}",
      "tests": [
        {
          "name": "pick",
          "code": "const r = pick({ a: 1, b: 2, c: 3 }, [\"a\", \"c\", \"z\"]); return JSON.stringify(r) === '{\"a\":1,\"c\":3}';"
        },
        {
          "name": "omit",
          "code": "return JSON.stringify(omit({ a: 1, b: 2, c: 3 }, [\"b\"])) === '{\"a\":1,\"c\":3}';"
        },
        {
          "name": "без мутации",
          "code": "const o = { a: 1 }; omit(o, [\"a\"]); return o.a === 1;"
        }
      ]
    }
  ]
});
