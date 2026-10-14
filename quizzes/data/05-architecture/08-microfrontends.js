QUIZ.register({
  "id": "05-architecture/08-microfrontends",
  "section": "05-architecture",
  "title": "Микрофронтенды",
  "order": 8,
  "source": "../05-architecture/08-microfrontends.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Какую проблему в первую очередь решают микрофронтенды?",
      "options": [
        "Производительность",
        "Организационную: независимые команды и релизы",
        "SEO",
        "Типизацию"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что настраивают как singleton в Module Federation?",
      "options": [
        "Все зависимости",
        "Библиотеки с общим состоянием (React, React DOM, роутер, дизайн-система)",
        "Ничего",
        "Только CSS"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как микрофронтенды общаются между собой?",
      "options": [
        "Через общий глобальный стор с прямыми импортами",
        "Слабосвязанно: события (CustomEvent/шина), URL, явные контракты API",
        "Через cookies",
        "Не общаются"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие варианты композиции микрофронтендов бывают?",
      "options": [
        "Module Federation (рантайм)",
        "build-time через npm-пакеты",
        "iframe",
        "серверная/edge-композиция",
        "один большой бандл без границ"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Что сделать в первую очередь, если remote-приложение недоступно?",
      "options": [
        "Падать всем приложением",
        "Error boundary/fallback на месте remote, таймаут загрузки, мониторинг",
        "Перезагрузить страницу",
        "Ничего"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
