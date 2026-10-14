QUIZ.register({
  "id": "02-typescript/04-type-level-programming",
  "section": "02-typescript",
  "title": "Программирование на уровне типов",
  "order": 4,
  "source": "../02-typescript/04-type-level-programming.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Что вернёт `type R = string extends unknown ? \"yes\" : \"no\"`?",
      "options": [
        "`\"no\"`",
        "`\"yes\"`",
        "`never`",
        "`boolean`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `type ToArray<T> = T extends any ? T[] : never` даёт `string[] | number[]` для `string | number`?",
      "options": [
        "Это ошибка",
        "Условные типы распределяются по union (distributive), если T — «голый» параметр",
        "any делает union",
        "Так работает keyof"
      ],
      "answer": 1,
      "explain": "Чтобы отключить: `[T] extends [any] ? T[] : never` → `(string | number)[]`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `infer`?",
      "options": [
        "Выводит значение в рантайме",
        "Объявляет переменную типа внутри условного типа для извлечения части",
        "Отключает вывод",
        "Создаёт дженерик"
      ],
      "answer": 1,
      "explain": "Пример: `type Ret<F> = F extends (...a: any[]) => infer R ? R : never`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает mapped type `{ [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }`?",
      "options": [
        "Удаляет ключи",
        "Переименовывает ключи в геттеры через key remapping и template literal types",
        "Делает поля readonly",
        "Ошибка синтаксиса"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как удалить из типа поля-функции?",
      "options": [
        "`Omit<T, Function>`",
        "Mapped type с `as`: `[K in keyof T as T[K] extends Function ? never : K]: T[K]`",
        "`Exclude<T, Function>`",
        "Нельзя"
      ],
      "answer": 1,
      "explain": "Ключ, переименованный в `never`, исчезает."
    }
  ],
  "tasks": [
    {
      "title": "Рантайм-аналог DeepPartial: merge с дефолтами",
      "level": "senior",
      "prompt": "Тип `DeepPartial<T>` описывает частичный конфиг. Реализуйте рантайм-функцию `withDefaults(defaults, partial)`: глубокое слияние обычных объектов (массивы и примитивы из `partial` заменяют значение целиком), `undefined` в `partial` не перезаписывает дефолт. Входы не мутировать.",
      "starter": "function withDefaults(defaults, partial) {\n  // ваш код\n}",
      "solution": "function withDefaults(defaults, partial) {\n  const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);\n  const result = { ...defaults };\n  for (const [key, value] of Object.entries(partial ?? {})) {\n    if (value === undefined) continue;\n    result[key] = isPlain(value) && isPlain(defaults[key]) ? withDefaults(defaults[key], value) : value;\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "глубокое слияние",
          "code": "const r = withDefaults({ ui: { theme: \"light\", size: \"md\" }, retries: 3 }, { ui: { theme: \"dark\" } }); return r.ui.theme === \"dark\" && r.ui.size === \"md\" && r.retries === 3;"
        },
        {
          "name": "undefined не перезаписывает",
          "code": "return withDefaults({ a: 1 }, { a: undefined }).a === 1;"
        },
        {
          "name": "массивы заменяются",
          "code": "return withDefaults({ tags: [\"a\", \"b\"] }, { tags: [\"c\"] }).tags.join() === \"c\";"
        },
        {
          "name": "без мутаций",
          "code": "const d = { ui: { t: 1 } }; withDefaults(d, { ui: { t: 2 } }); return d.ui.t === 1;"
        }
      ]
    }
  ]
});
