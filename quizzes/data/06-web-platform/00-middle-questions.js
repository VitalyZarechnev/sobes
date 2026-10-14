QUIZ.register({
  "id": "06-web-platform/00-middle-questions",
  "section": "06-web-platform",
  "title": "Middle-разминка: HTML, CSS, браузер, сеть",
  "order": 0.5,
  "source": "../06-web-platform/00-middle-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `defer` отличается от `async`?",
      "options": [
        "Ничем",
        "`defer` выполняется после парсинга в порядке подключения, `async` — сразу после загрузки",
        "`async` блокирует парсинг",
        "`defer` только для CSS"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой код ответа при неверных данных формы?",
      "options": [
        "200",
        "401",
        "422 (или 400)",
        "500"
      ],
      "answer": 2,
      "explain": "401 — не аутентифицирован, 403 — нет прав."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какое свойство CSS анимировать дешевле всего?",
      "options": [
        "`width`",
        "`top`",
        "`transform`",
        "`margin`"
      ],
      "answer": 2,
      "explain": "`transform` и `opacity` обрабатываются на этапе композиции без layout."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `box-sizing: border-box`?",
      "options": [
        "Убирает рамку",
        "`width` включает padding и border",
        "Схлопывает margin",
        "Включает flex"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой метод HTTP не идемпотентен?",
      "options": [
        "GET",
        "PUT",
        "DELETE",
        "POST"
      ],
      "answer": 3,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Для чего CORS?",
      "options": [
        "Защищает сервер от DDoS",
        "Позволяет серверу разрешить браузеру читать ответы на запросы с другого origin",
        "Шифрует трафик",
        "Кэширует запросы"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где безопаснее хранить токен сессии?",
      "options": [
        "localStorage",
        "sessionStorage",
        "cookie с `HttpOnly; Secure; SameSite`",
        "глобальная переменная"
      ],
      "answer": 2,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой элемент для действия «Удалить» на странице?",
      "options": [
        "`<a href=\"#\">`",
        "`<div onclick>`",
        "`<button type=\"button\">`",
        "`<span role=\"link\">`"
      ],
      "answer": 2,
      "explain": "См. ответ в теории темы."
    }
  ],
  "tasks": []
});
