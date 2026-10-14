QUIZ.register({
  "id": "02-typescript/06-config-and-tooling",
  "section": "02-typescript",
  "title": "tsconfig, d.ts и tooling",
  "order": 6,
  "source": "../02-typescript/06-config-and-tooling.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Что добавляет `noUncheckedIndexedAccess`?",
      "options": [
        "Запрет массивов",
        "`arr[i]` и `record[key]` получают тип `T | undefined`",
        "Проверку импорта",
        "Ускорение компиляции"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `verbatimModuleSyntax`?",
      "options": [
        "Для скорости",
        "Импорты только типов должны быть `import type` — транспиляторы по файлу (esbuild, SWC) безопасно их удаляют",
        "Запрещает CommonJS всегда",
        "Для JSX"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `isolatedDeclarations`?",
      "options": [
        "Отключает .d.ts",
        "Требует явных типов у экспортов, чтобы .d.ts могли генерировать быстрые инструменты без проверки типов",
        "Изолирует модули",
        "Для монорепо только"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где описать тип глобальной переменной `window.__APP_CONFIG__`?",
      "options": [
        "В любом .ts без экспорта",
        "В .d.ts: `declare global { interface Window { __APP_CONFIG__: Config } }`",
        "В package.json",
        "Нельзя"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `moduleResolution: \"bundler\"` отличается от `\"nodenext\"`?",
      "options": [
        "Ничем",
        "`bundler` разрешает импорты без расширений, как сборщики; `nodenext` следует правилам Node (расширения в ESM, `exports`)",
        "`bundler` только для webpack",
        "`nodenext` устарел"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт `erasableSyntaxOnly`?",
      "options": [
        "Запрет синтаксиса TS, который генерирует JS (enum, namespace, parameter properties) — код можно запускать в Node через strip types",
        "Удаляет комментарии",
        "Ускоряет tsc",
        "Стирает типы в .d.ts"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
