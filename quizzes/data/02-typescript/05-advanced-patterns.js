QUIZ.register({
  "id": "02-typescript/05-advanced-patterns",
  "section": "02-typescript",
  "title": "Продвинутые паттерны TS",
  "order": 5,
  "source": "../02-typescript/05-advanced-patterns.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое branded type и зачем он?",
      "options": [
        "Тип с логотипом",
        "Примитив с фантомной меткой (`string & { __brand: \"UserId\" }`) — нельзя перепутать UserId и OrderId",
        "Тип для классов",
        "Enum"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему после `zod.parse` можно доверять типу, а после `as User` — нет?",
      "options": [
        "Одинаково",
        "Схема проверяет данные в рантайме, а `as` — только обещание компилятору",
        "`as` быстрее",
        "zod генерирует классы"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое declaration merging и где полезен?",
      "options": [
        "Слияние файлов",
        "Несколько объявлений интерфейса/namespace сливаются — расширение типов библиотек (например, `Window`, модулей роутера)",
        "Слияние git-веток",
        "Объединение union"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем паттерн Result лучше исключений для ожидаемых ошибок?",
      "options": [
        "Быстрее",
        "Ошибка — часть типа: вызывающий обязан обработать оба варианта, нет неявных throw",
        "Исключения запрещены в TS",
        "Ничем"
      ],
      "answer": 1,
      "explain": "Неожиданные ошибки (баги) по-прежнему лучше бросать."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт `satisfies` для объекта-конфига маршрутов?",
      "options": [
        "Ничего",
        "Проверка против типа при сохранении литеральных ключей: `keyof typeof routes` остаётся точным",
        "Делает объект readonly",
        "Генерирует enum"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Brand-конструкторы с проверкой",
      "level": "middle",
      "prompt": "Реализуйте «конструкторы» брендированных значений: `Email(value)` возвращает строку в нижнем регистре, если это корректный email (есть одна `@`, непустые части, точка в домене), иначе бросает `TypeError`; `PositiveInt(value)` — целое > 0, иначе `TypeError`. (В TS их тип был бы `string & { __brand: \"Email\" }`.)",
      "starter": "function Email(value) {\n  // ваш код\n}\n\nfunction PositiveInt(value) {\n  // ваш код\n}",
      "solution": "function Email(value) {\n  const v = String(value).trim().toLowerCase();\n  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v)) throw new TypeError(`Некорректный email: ${value}`);\n  return v;\n}\n\nfunction PositiveInt(value) {\n  if (!Number.isInteger(value) || value <= 0) throw new TypeError(`Ожидалось положительное целое: ${value}`);\n  return value;\n}",
      "tests": [
        {
          "name": "email",
          "code": "return Email(\" Anna@Example.com \") === \"anna@example.com\";"
        },
        {
          "name": "плохой email",
          "code": "try { Email(\"a@b\"); return false; } catch (e) { return e instanceof TypeError; }"
        },
        {
          "name": "positive int",
          "code": "return PositiveInt(5) === 5;"
        },
        {
          "name": "плохие числа",
          "code": "const bad = [0, -1, 1.5, NaN, \"3\"]; return bad.every((v) => { try { PositiveInt(v); return false; } catch (e) { return e instanceof TypeError; } });"
        }
      ]
    }
  ]
});
