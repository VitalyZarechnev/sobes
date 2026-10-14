QUIZ.register({
  "id": "14-design-systems/04-storybook-docs-versioning",
  "section": "14-design-systems",
  "title": "Storybook, документация, версионирование",
  "order": 4,
  "source": "../14-design-systems/04-storybook-docs-versioning.md",
  "questions": [
    {
      "type": "multi",
      "level": "senior",
      "q": "Чем может служить одна сторис?",
      "options": [
        "документацией",
        "interaction-тестом",
        "a11y-проверкой",
        "визуальным снимком",
        "миграцией базы данных"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Поэтому сторис в CI не дают документации отставать от кода."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Кнопка стала на 4px выше. Какая это версия по semver для UI-библиотеки?",
      "options": [
        "patch всегда",
        "скорее major: потребители могли опираться на размеры в вёрстке",
        "minor",
        "никакая"
      ],
      "answer": 1,
      "explain": "Заметное изменение визуала и размеров — breaking change для потребителей."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите шаги удаления устаревшего пропа",
      "items": [
        "Добавить новый API рядом со старым (minor)",
        "Пометить старый `@deprecated`, предупреждение в dev, правило линтера",
        "Выпустить codemod и гайд миграции",
        "Отследить использование по репозиториям",
        "Удалить в следующем major"
      ],
      "explain": "Аддитивное изменение → предупреждение → помощь в миграции → измерение → удаление."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает Changesets?",
      "options": [
        "Генерирует сторис",
        "Превращает описания изменений из PR в версии, changelog и публикацию",
        "Проверяет доступность",
        "Строит токены"
      ],
      "answer": 1,
      "explain": "Semver-решение принимает автор изменения прямо в PR, а релиз собирается автоматически из накопленных changeset-файлов."
    }
  ],
  "tasks": [
    {
      "title": "Классификация изменения пропсов",
      "level": "senior",
      "prompt": "Даны описания пропсов старой и новой версии компонента: `{ [name]: { type: string[], required: boolean } }` (type — список допустимых литералов/типов). Верните `\"major\" | \"minor\" | \"patch\"`: major — проп удалён, стал обязательным или из type удалено значение; minor — добавлен проп (необязательный) или в type добавлено значение; иначе patch. Новый обязательный проп — major.",
      "starter": "function bumpType(before, after) {\n  // ваш код\n}",
      "solution": "function bumpType(before, after) {\n  let minor = false;\n  for (const [name, prev] of Object.entries(before)) {\n    const next = after[name];\n    if (!next) return 'major';\n    if (next.required && !prev.required) return 'major';\n    if (prev.type.some((v) => !next.type.includes(v))) return 'major';\n    if (next.type.some((v) => !prev.type.includes(v))) minor = true;\n  }\n  for (const [name, next] of Object.entries(after)) {\n    if (Object.hasOwn(before, name)) continue;\n    if (next.required) return 'major';\n    minor = true;\n  }\n  return minor ? 'minor' : 'patch';\n}",
      "tests": [
        {
          "name": "удалён проп",
          "code": "return bumpType({ size: { type: [\"sm\"], required: false } }, {}) === \"major\";"
        },
        {
          "name": "новый вариант",
          "code": "return bumpType({ variant: { type: [\"primary\"], required: false } }, { variant: { type: [\"primary\", \"ghost\"], required: false } }) === \"minor\";"
        },
        {
          "name": "удалён вариант",
          "code": "return bumpType({ variant: { type: [\"primary\", \"ghost\"], required: false } }, { variant: { type: [\"primary\"], required: false } }) === \"major\";"
        },
        {
          "name": "новый обязательный",
          "code": "return bumpType({}, { label: { type: [\"string\"], required: true } }) === \"major\";"
        },
        {
          "name": "без изменений",
          "code": "const p = { a: { type: [\"x\"], required: false } }; return bumpType(p, p) === \"patch\";"
        },
        {
          "name": "стал необязательным",
          "code": "return bumpType({ a: { type: [\"x\"], required: true } }, { a: { type: [\"x\"], required: false } }) === \"patch\";"
        }
      ]
    }
  ]
});
