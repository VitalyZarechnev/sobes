QUIZ.register({
  "id": "06-web-platform/07-storage-workers-apis",
  "section": "06-web-platform",
  "title": "Хранилища, воркеры, браузерные API",
  "order": 7,
  "source": "../06-web-platform/07-storage-workers-apis.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Где хранить большие структурированные данные офлайн (тысячи записей)?",
      "options": [
        "localStorage",
        "IndexedDB",
        "cookies",
        "sessionStorage"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем Service Worker отличается от Web Worker?",
      "options": [
        "Ничем",
        "Service Worker — прокси между страницей и сетью (кэш, офлайн, push), живёт независимо от вкладок; Web Worker — фоновые вычисления для конкретной страницы",
        "Web Worker для сети",
        "Service Worker без кэша"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как передать большой ArrayBuffer в воркер без копирования?",
      "options": [
        "JSON.stringify",
        "Transferable: `postMessage(buf, [buf])` — владение передаётся",
        "Через localStorage",
        "Нельзя"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что нужно для SharedArrayBuffer?",
      "options": [
        "HTTPS только",
        "Cross-origin isolation (COOP + COEP заголовки)",
        "Service Worker",
        "Ничего"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какое событие сообщает об изменении localStorage в другой вкладке?",
      "options": [
        "`change`",
        "`storage`",
        "`message`",
        "`visibilitychange`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем BroadcastChannel полезен?",
      "options": [
        "Видеотрансляции",
        "Обмен сообщениями между вкладками одного origin (выход из аккаунта, синхронизация)",
        "Push-уведомления",
        "WebRTC"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
