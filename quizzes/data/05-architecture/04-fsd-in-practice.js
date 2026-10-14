QUIZ.register({
  "id": "05-architecture/04-fsd-in-practice",
  "section": "05-architecture",
  "title": "FSD на практике",
  "order": 4,
  "source": "../05-architecture/04-fsd-in-practice.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Как мигрировать существующий проект на FSD?",
      "options": [
        "Переписать за спринт",
        "Постепенно: сначала shared и app, затем выделять pages, entities, features по мере работы; линтер на новые нарушения",
        "Удалить старый код",
        "Не мигрировать никогда"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как совместить FSD с файловым роутингом Next.js/Nuxt?",
      "options": [
        "Невозможно",
        "Папка роутинга (`app/` или `pages/`) остаётся тонкой и реэкспортирует страницы из слоя pages FSD",
        "Положить всё в app/",
        "Отказаться от роутинга"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем проверять правила FSD автоматически?",
      "options": [
        "Prettier",
        "Steiger (официальный линтер FSD) или eslint-plugin-boundaries",
        "tsc",
        "Stylelint"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Сущность «пользователь» нужна внутри сущности «заказ» (тип автора). Как по FSD?",
      "options": [
        "Импорт напрямую",
        "Cross-import через публичный API `@x`: `entities/user/@x/order`",
        "Копировать тип",
        "Перенести в shared"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
