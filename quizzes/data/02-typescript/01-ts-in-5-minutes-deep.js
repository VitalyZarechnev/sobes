QUIZ.register({
  "id": "02-typescript/01-ts-in-5-minutes-deep",
  "section": "02-typescript",
  "title": "TS in 5 minutes — глубоко",
  "order": 1,
  "source": "../02-typescript/01-ts-in-5-minutes-deep.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой тип выведет TS для `let x = \"a\"` и `const y = \"a\"`?",
      "options": [
        "`string` и `string`",
        "`string` и `\"a\"`",
        "`\"a\"` и `\"a\"`",
        "`any` и `string`"
      ],
      "answer": 1,
      "explain": "`const` с примитивом даёт литеральный тип, `let` расширяется до `string`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему объект `{ name: \"Аня\", age: 30 }` присваивается в переменную типа `{ name: string }`?",
      "code": "interface Named { name: string }\nconst user = { name: \"Аня\", age: 30 };\nconst n: Named = user; // ok",
      "options": [
        "TS не проверяет объекты",
        "Структурная типизация: лишние поля допустимы при присваивании переменной",
        "Это ошибка",
        "Из-за any"
      ],
      "answer": 1,
      "explain": "Но объектный литерал напрямую с лишним полем даст ошибку excess property check."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой тип у результата `JSON.parse(text)`?",
      "options": [
        "`unknown`",
        "`any`",
        "`object`",
        "`string`"
      ],
      "answer": 1,
      "explain": "Поэтому результат лучше сразу приводить к `unknown` и валидировать."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой тип — «нижний» (подтип всех типов)?",
      "options": [
        "`unknown`",
        "`any`",
        "`never`",
        "`void`"
      ],
      "answer": 2,
      "explain": "`unknown` — верхний тип, `never` — нижний."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему ошибка?",
      "code": "interface Named { name: string }\nconst n: Named = { name: \"Аня\", age: 30 };",
      "options": [
        "Нет ошибки",
        "Объектный литерал с лишним полем проверяется строго (excess property check)",
        "name должен быть number",
        "Нельзя указывать тип у const"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `as const`?",
      "options": [
        "Делает переменную константой",
        "Выводит самые узкие литеральные readonly-типы",
        "Отключает проверки",
        "Создаёт enum"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Безопасный разбор JSON",
      "level": "middle",
      "prompt": "Реализуйте `parseJson(text)` → `{ ok: true, value }` или `{ ok: false, error }` (сообщение ошибки), без выбрасывания исключений — аналог discriminated union `Result<unknown, string>`.",
      "starter": "function parseJson(text) {\n  // ваш код\n}",
      "solution": "function parseJson(text) {\n  try {\n    return { ok: true, value: JSON.parse(text) };\n  } catch (error) {\n    return { ok: false, error: error instanceof Error ? error.message : String(error) };\n  }\n}",
      "tests": [
        {
          "name": "успех",
          "code": "const r = parseJson(\"{\\\"a\\\":1}\"); return r.ok && r.value.a === 1;"
        },
        {
          "name": "ошибка",
          "code": "const r = parseJson(\"{oops\"); return !r.ok && typeof r.error === \"string\";"
        },
        {
          "name": "null — валидный JSON",
          "code": "const r = parseJson(\"null\"); return r.ok && r.value === null;"
        }
      ]
    }
  ]
});
