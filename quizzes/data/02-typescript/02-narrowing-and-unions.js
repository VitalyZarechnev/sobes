QUIZ.register({
  "id": "02-typescript/02-narrowing-and-unions",
  "section": "02-typescript",
  "title": "Narrowing и union-типы",
  "order": 2,
  "source": "../02-typescript/02-narrowing-and-unions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой оператор сужает `string | string[]`?",
      "options": [
        "`typeof x === \"object\"`",
        "`Array.isArray(x)`",
        "`x instanceof String`",
        "`x in Array`"
      ],
      "answer": 1,
      "explain": "`typeof []` — `\"object\"`, но и `null` тоже — для массивов надёжнее `Array.isArray`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `assertNever(x: never)` в `default` у switch по discriminated union?",
      "options": [
        "Для производительности",
        "Если добавят новый вариант union, код перестанет компилироваться — exhaustive check",
        "Для логирования",
        "Чтобы убрать предупреждения линтера"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое пользовательский type guard?",
      "options": [
        "Функция с возвращаемым типом `x is T`",
        "Декоратор",
        "Комментарий `@ts-ignore`",
        "Тип `Guard<T>`"
      ],
      "answer": 0,
      "explain": "TS доверяет предикату: ошибка в реализации даст неверное сужение."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему сужение не сохраняется в колбэке?",
      "code": "let value: string | null = get();\nif (value) {\n  setTimeout(() => value.length); // ?\n}",
      "options": [
        "TS не поддерживает колбэки",
        "Переменная `let` может измениться до вызова колбэка; с `const` (или TS 5.4+ после последнего присваивания) сужение сохраняется",
        "Это баг",
        "Из-за strict"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как сузить `Cat | Dog`, если у `Cat` есть метод `meow`?",
      "options": [
        "`typeof pet === \"Cat\"`",
        "`\"meow\" in pet`",
        "`pet instanceof Cat` для интерфейса",
        "`pet as Cat` всегда"
      ],
      "answer": 1,
      "explain": "`instanceof` работает только с классами (рантайм-значениями)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем discriminated union лучше набора булевых флагов `isLoading`, `isError`, `data?`?",
      "options": [
        "Ничем",
        "Невозможные состояния (loading и error одновременно) нельзя выразить; поля доступны только в своём варианте",
        "Меньше кода всегда",
        "Быстрее в рантайме"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Исчерпывающий обработчик состояний",
      "level": "middle",
      "prompt": "Состояние запроса: `{ status: \"idle\" } | { status: \"loading\" } | { status: \"success\", data } | { status: \"error\", error }`. Реализуйте `render(state)` → строку: `\"—\"`, `\"Загрузка…\"`, `\"Данные: \" + JSON.stringify(data)`, `\"Ошибка: \" + error.message`. Для неизвестного статуса бросьте `Error` с текстом `Unexpected state` (аналог `assertNever`).",
      "starter": "function render(state) {\n  // ваш код\n}",
      "solution": "function assertNever(value) {\n  throw new Error(`Unexpected state: ${JSON.stringify(value)}`);\n}\n\nfunction render(state) {\n  switch (state.status) {\n    case 'idle':\n      return '—';\n    case 'loading':\n      return 'Загрузка…';\n    case 'success':\n      return 'Данные: ' + JSON.stringify(state.data);\n    case 'error':\n      return 'Ошибка: ' + state.error.message;\n    default:\n      return assertNever(state);\n  }\n}",
      "tests": [
        {
          "name": "все варианты",
          "code": "return render({ status: \"idle\" }) === \"—\" && render({ status: \"loading\" }) === \"Загрузка…\" && render({ status: \"success\", data: [1] }) === \"Данные: [1]\" && render({ status: \"error\", error: new Error(\"x\") }) === \"Ошибка: x\";"
        },
        {
          "name": "неизвестный статус",
          "code": "try { render({ status: \"weird\" }); return false; } catch (e) { return e.message.includes(\"Unexpected state\"); }"
        }
      ]
    }
  ]
});
