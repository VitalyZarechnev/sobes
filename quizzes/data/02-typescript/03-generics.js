QUIZ.register({
  "id": "02-typescript/03-generics",
  "section": "02-typescript",
  "title": "Generics и вариантность",
  "order": 3,
  "source": "../02-typescript/03-generics.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что выведет TS для `first([1, 2, 3])`, если `function first<T>(arr: T[]): T | undefined`?",
      "options": [
        "`any`",
        "`number | undefined`",
        "`unknown`",
        "`1`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `<T extends { id: string }>`?",
      "options": [
        "Наследование класса",
        "Ограничение: T должен иметь поле `id: string`",
        "Значение по умолчанию",
        "Делает T необязательным"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `(x: Animal) => void` можно присвоить в `(x: Dog) => void`, а не наоборот (strictFunctionTypes)?",
      "options": [
        "Параметры функций контравариантны",
        "Параметры ковариантны",
        "Это баг TS",
        "Функции не сравниваются"
      ],
      "answer": 0,
      "explain": "Функция, умеющая обрабатывать любое животное, справится с собакой."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `NoInfer<T>`?",
      "options": [
        "Отключает дженерики",
        "Запрещает выводить T из этой позиции — тип выводится из других аргументов",
        "Делает T unknown",
        "Только для классов"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что выведется для `T` при `const` type parameter: `function f<const T>(x: T)` и `f([\"a\", \"b\"])`?",
      "options": [
        "`string[]`",
        "`readonly [\"a\", \"b\"]`",
        "`any[]`",
        "`unknown`"
      ],
      "answer": 1,
      "explain": "`const` модификатор выводит литеральные readonly-типы без `as const` у вызывающего."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Когда дженерик не нужен?",
      "options": [
        "Никогда",
        "Когда параметр типа используется один раз и не связывает вход с выходом — достаточно конкретного типа или unknown",
        "Всегда нужен",
        "Только в React"
      ],
      "answer": 1,
      "explain": "«Правило двух использований»."
    }
  ],
  "tasks": [
    {
      "title": "groupBy с сохранением типов",
      "level": "middle",
      "prompt": "Реализуйте `groupBy(items, keyFn)` → объект `{ [key]: item[] }` (без `Object.groupBy`). Порядок элементов в группах — исходный. В TS это была бы `groupBy<T, K extends PropertyKey>(items: T[], keyFn: (item: T) => K): Record<K, T[]>`.",
      "starter": "function groupBy(items, keyFn) {\n  // ваш код\n}",
      "solution": "function groupBy(items, keyFn) {\n  const result = {};\n  for (const item of items) {\n    const key = keyFn(item);\n    (result[key] ??= []).push(item);\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "группы",
          "code": "const r = groupBy([1, 2, 3, 4], (n) => (n % 2 ? \"odd\" : \"even\")); return r.odd.join() === \"1,3\" && r.even.join() === \"2,4\";"
        },
        {
          "name": "без Object.groupBy",
          "code": "return !groupBy.toString().includes('Object.groupBy');"
        },
        {
          "name": "пусто",
          "code": "return Object.keys(groupBy([], (x) => x)).length === 0;"
        }
      ]
    }
  ]
});
