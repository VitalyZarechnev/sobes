QUIZ.register({
  "id": "05-architecture/07-frontend-system-design",
  "section": "05-architecture",
  "title": "Фронтенд system design",
  "order": 7,
  "source": "../05-architecture/07-frontend-system-design.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Что означает RADIO во фронтенд system design?",
      "options": [
        "Requirements, Architecture, Data model, Interface (API), Optimizations",
        "React, Angular, Docker, Infra, Ops",
        "Routing, API, Design, Integration, Observability",
        "Только архитектура"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Первый шаг на интервью по system design?",
      "options": [
        "Рисовать компоненты",
        "Уточнить функциональные и нефункциональные требования, масштаб и ограничения",
        "Выбрать фреймворк",
        "Писать код"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Лента новостей: курсорная или offset-пагинация?",
      "options": [
        "Offset — проще всегда",
        "Курсорная: стабильна при вставке новых элементов, без дубликатов и пропусков",
        "Без пагинации",
        "Одинаково"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что обсуждают в Optimizations для ленты?",
      "options": [
        "виртуализация",
        "prefetch следующей страницы",
        "оптимистичные обновления лайков",
        "отказ от доступности",
        "кэш и нормализация сущностей"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чат в реальном времени: транспорт?",
      "options": [
        "Polling раз в минуту",
        "WebSocket (или SSE для однонаправленных событий) с переподключением и догрузкой пропущенного",
        "Только REST",
        "localStorage"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
