QUIZ.register({
  "id": "15-production/05-third-party-analytics",
  "section": "15-production",
  "title": "Сторонние скрипты и аналитика",
  "order": 5,
  "source": "../15-production/05-third-party-analytics.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `defer` отличается от `async`?",
      "options": [
        "Ничем",
        "`defer` выполняется после парсинга в порядке подключения, `async` — сразу после загрузки в любом порядке",
        "`async` блокирует парсинг",
        "`defer` только для модулей"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое фасад для стороннего виджета?",
      "options": [
        "Обёртка с типами",
        "Лёгкая заглушка, которая загружает настоящий виджет по взаимодействию",
        "Прокси-сервер",
        "iframe"
      ],
      "answer": 1,
      "explain": "Типичный пример — превью YouTube вместо iframe."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему SRI нельзя применить к тег-менеджеру с «вечнозелёным» URL?",
      "options": [
        "Не поддерживается браузерами",
        "Содержимое по URL меняется, а хэш фиксирован — скрипт перестанет загружаться",
        "Нарушает CORS",
        "Можно применить"
      ],
      "answer": 1,
      "explain": "Это дополнительный риск, который компенсируют процессом и CSP."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что делает аналитику поддерживаемой?",
      "options": [
        "трекинг-план как источник истины",
        "типизированный клиент",
        "вызовы SDK провайдера прямо в компонентах",
        "обёртка над провайдерами",
        "удаление неиспользуемых событий"
      ],
      "answer": [
        0,
        1,
        3,
        4
      ],
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Очередь аналитики с батчингом",
      "level": "senior",
      "prompt": "Реализуйте `createTracker({ send, batchSize = 10, hasConsent })` → `{ track(event, props), flush() }`. `track` кладёт `{ event, props }` в очередь (только если `hasConsent()` истинно); при достижении `batchSize` — автоматически `flush`. `flush` вызывает `send(batch)` с копией очереди и очищает её; пустая очередь — `send` не вызывается.",
      "starter": "function createTracker({ send, batchSize = 10, hasConsent }) {\n  // ваш код\n}",
      "solution": "function createTracker({ send, batchSize = 10, hasConsent }) {\n  let queue = [];\n  const flush = () => {\n    if (queue.length === 0) return;\n    const batch = queue;\n    queue = [];\n    send(batch);\n  };\n  return {\n    track(event, props) {\n      if (!hasConsent()) return;\n      queue.push({ event, props });\n      if (queue.length >= batchSize) flush();\n    },\n    flush,\n  };\n}",
      "tests": [
        {
          "name": "батч по размеру",
          "code": "const sent = []; const tr = createTracker({ send: (b) => sent.push(b), batchSize: 2, hasConsent: () => true }); tr.track(\"a\", {}); tr.track(\"b\", {}); tr.track(\"c\", {}); return sent.length === 1 && sent[0].map((e) => e.event).join() === \"a,b\";"
        },
        {
          "name": "flush",
          "code": "const sent = []; const tr = createTracker({ send: (b) => sent.push(b), hasConsent: () => true }); tr.track(\"x\", { v: 1 }); tr.flush(); tr.flush(); return sent.length === 1 && sent[0][0].props.v === 1;"
        },
        {
          "name": "без согласия",
          "code": "const sent = []; const tr = createTracker({ send: (b) => sent.push(b), batchSize: 1, hasConsent: () => false }); tr.track(\"x\", {}); tr.flush(); return sent.length === 0;"
        },
        {
          "name": "батч — копия",
          "code": "let first; const tr = createTracker({ send: (b) => { first ??= b; }, batchSize: 1, hasConsent: () => true }); tr.track(\"a\", {}); tr.track(\"b\", {}); return first.length === 1;"
        }
      ],
      "notes": "В браузере `flush` вызывают также на `visibilitychange` → `hidden` и отправляют через `sendBeacon`."
    }
  ]
});
