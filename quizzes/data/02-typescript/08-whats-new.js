QUIZ.register({
  "id": "02-typescript/08-whats-new",
  "section": "02-typescript",
  "title": "Новинки TypeScript: 5.x, 6.0, 7.0",
  "order": 8,
  "source": "../02-typescript/08-whats-new.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое TypeScript 7.0?",
      "options": [
        "Новый язык, несовместимый с TS 6",
        "Порт компилятора и языкового сервера на Go с той же системой типов, в разы быстрее",
        "Версия с runtime-проверкой типов",
        "TypeScript для WebAssembly"
      ],
      "answer": 1,
      "explain": "Логика проверки типов перенесена близко к оригиналу, полная сборка обычно ускоряется в 8–12 раз."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какое главное ограничение TypeScript 7.0 для инструментов?",
      "options": [
        "Не поддерживает JSX",
        "Нет программного API (ожидается в 7.1), поэтому инструменты, вызывающие компилятор из кода, остаются на 6.0",
        "Не работает в Windows",
        "Не поддерживает strict"
      ],
      "answer": 1,
      "explain": "typescript-eslint с типовой информацией, `vue-tsc` и часть лоадеров используют `@typescript/typescript6` рядом с 7.0."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие умолчания изменились в TypeScript 6.0?",
      "options": [
        "`strict: true`",
        "`types: []`",
        "`target: es2025`",
        "`module: esnext`",
        "`jsx: react-jsx`",
        "`noEmit: true`"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Также `rootDir` — папка конфига и `noUncheckedSideEffectImports: true`. `jsx` и `noEmit` не менялись."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "После обновления до TS 6.0 пропали типы `process` и `describe`. Почему?",
      "options": [
        "Удалили `@types/node`",
        "`types` по умолчанию стал `[]` — глобальные типы надо перечислить явно",
        "Включился `strict`",
        "Сломался `moduleResolution`"
      ],
      "answer": 1,
      "explain": "Решение: `\"types\": [\"node\", \"vitest/globals\"]` или `\"types\": [\"*\"]` для старого поведения."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие опции устарели в 6.0 и станут ошибкой в 7.0?",
      "options": [
        "`target: es5`",
        "`moduleResolution: node10`",
        "`baseUrl` как корень модулей",
        "`module: amd`",
        "`moduleResolution: bundler`",
        "`verbatimModuleSyntax`"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "`bundler` и `verbatimModuleSyntax` — рекомендуемые современные опции."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `satisfies` отличается от аннотации типа?",
      "options": [
        "Ничем",
        "Проверяет совместимость с типом, но сохраняет точный выведенный тип значения",
        "Приводит значение к типу, как `as`",
        "Работает только с функциями"
      ],
      "answer": 1,
      "explain": "Аннотация расширяет тип до указанного и теряет конкретику ключей и литералов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `NoInfer<T>`?",
      "options": [
        "Отключает проверку типа в позиции",
        "Запрещает выводить параметр типа из этой позиции — значение там только проверяется",
        "Делает тип `never`",
        "Удаляет `undefined` из типа"
      ],
      "answer": 1,
      "explain": "Классический пример: `createMachine(states: S[], initial: NoInfer<S>)` — опечатка в `initial` даст ошибку, а не расширит `S`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Какой тип у `nums` в TS 5.5+?",
      "code": "const values = [1, null, 2];\nconst nums = values.filter((x) => x !== null);",
      "lang": "ts",
      "options": [
        "`(number | null)[]`",
        "`number[]`",
        "`any[]`",
        "`unknown[]`"
      ],
      "answer": 1,
      "explain": "Inferred type predicates: компилятор сам выводит `x is number` для стрелки."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем нужен флаг `erasableSyntaxOnly`?",
      "options": [
        "Удаляет комментарии",
        "Запрещает синтаксис, который генерирует JS (`enum`, parameter properties, `namespace` с кодом), чтобы файл можно было запускать через type stripping в Node.js",
        "Удаляет неиспользуемые импорты",
        "Ускоряет tsc"
      ],
      "answer": 1,
      "explain": "Node.js стирает типы без компиляции и не умеет генерировать код для `enum`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем заменить `baseUrl` для коротких импортов в TS 6/7?",
      "options": [
        "Ничем, импорты только относительные",
        "`paths` или subpath imports (`#/*` в package.json)",
        "`rootDirs`",
        "`typeRoots`"
      ],
      "answer": 1,
      "explain": "И не забыть продублировать алиас в сборщике."
    },
    {
      "type": "order",
      "level": "lead",
      "q": "Расположите шаги миграции проекта на TypeScript 7",
      "items": [
        "Обновиться до 6.0",
        "Исправить все предупреждения о депрекейтах",
        "Явно задать `types`, проверить `moduleResolution` и алиасы",
        "Проверить расхождения через `--stableTypeOrdering`",
        "Перейти на 7.0 для `tsc` и редактора, инструменты с API оставить на 6.0"
      ],
      "explain": "Сначала 6.0 как переходная версия, затем 7.0."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "Как обосновать бизнесу переход на TypeScript 7?",
      "answer": "Измерить текущее время проверки типов в CI и в редакторе (до первой ошибки), показать ожидаемое ускорение (по данным команды TS — в 8–12 раз на полной сборке) и перевести в деньги: минуты CI × число прогонов, время ожидания разработчиков, быстрее обратная связь — меньше переключения контекста. Риски: инструменты без API (линтер с типами, vue-tsc) остаются на 6.0, затраты на чистку конфигов. План поэтапный, с откатом."
    }
  ],
  "tasks": [
    {
      "title": "Мигрировать tsconfig на TS 6/7",
      "level": "senior",
      "lang": "json",
      "prompt": "Перепишите конфиг для Vite + React + Vitest (глобальные describe/it) под TypeScript 6/7:\n```json\n{\n  \"compilerOptions\": {\n    \"target\": \"es5\",\n    \"module\": \"commonjs\",\n    \"moduleResolution\": \"node\",\n    \"baseUrl\": \"./src\",\n    \"downlevelIteration\": true,\n    \"esModuleInterop\": false,\n    \"outFile\": \"dist/bundle.js\"\n  }\n}\n```",
      "solution": "{\n  \"compilerOptions\": {\n    \"target\": \"es2022\",\n    \"module\": \"esnext\",\n    \"moduleResolution\": \"bundler\",\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\",\n    \"strict\": true,\n    \"types\": [\"vite/client\", \"vitest/globals\"],\n    \"paths\": { \"@/*\": [\"./src/*\"] },\n    \"verbatimModuleSyntax\": true,\n    \"isolatedModules\": true,\n    \"skipLibCheck\": true\n  },\n  \"include\": [\"src\"]\n}",
      "notes": "es5/downlevelIteration/outFile удалены, транспилирует Vite; node → bundler; baseUrl → paths; esModuleInterop нельзя выключить; types — явно."
    },
    {
      "title": "Совместимость с erasableSyntaxOnly",
      "level": "senior",
      "lang": "ts",
      "prompt": "Перепишите код без enum и parameter properties:\n```ts\nenum Status { Active = 'active', Blocked = 'blocked' }\nexport class UserService {\n  constructor(private readonly api: ApiClient) {}\n  block(id: string) { return this.api.patch(id, { status: Status.Blocked }); }\n}\n```",
      "solution": "export const Status = { Active: 'active', Blocked: 'blocked' } as const;\nexport type Status = (typeof Status)[keyof typeof Status];\n\nexport class UserService {\n  readonly #api: ApiClient;\n  constructor(api: ApiClient) {\n    this.#api = api;\n  }\n  block(id: string) {\n    return this.#api.patch(id, { status: Status.Blocked });\n  }\n}"
    }
  ]
});
