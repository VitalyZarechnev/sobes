QUIZ.register({
  "id": "03-react/05-react-19-and-server-components",
  "section": "03-react",
  "title": "React 19 и Server Components",
  "order": 5,
  "source": "../03-react/05-react-19-and-server-components.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что нельзя делать в Server Component?",
      "options": [
        "Читать из БД",
        "Использовать useState и обработчики событий",
        "Быть async",
        "Рендерить Client Components"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что можно передать из Server Component в Client Component пропсом?",
      "options": [
        "Функцию-обработчик",
        "Сериализуемые значения, промисы, JSX и Server Functions",
        "Экземпляр класса с методами",
        "Ссылку на DOM"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `'use client'`?",
      "options": [
        "Делает компонент клиентским только для SSR",
        "Отмечает границу: модуль и всё, что он импортирует, попадает в клиентский бандл",
        "Отключает SSR",
        "Включает гидратацию на сервере"
      ],
      "answer": 1,
      "explain": "Client Components всё равно пре-рендерятся на сервере в HTML."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Server Function (`'use server'`)?",
      "options": [
        "Функция в Node.js",
        "Функция, которую клиент вызывает по сети как обычную async-функцию; используется для мутаций (Server Actions)",
        "Серверный компонент",
        "Middleware"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `use(promise)`?",
      "options": [
        "Создаёт промис",
        "Читает значение промиса в рендере, приостанавливая компонент до разрешения (Suspense)",
        "Отменяет промис",
        "Только для контекста"
      ],
      "answer": 1,
      "explain": "`use` также читает контекст и может вызываться в условиях."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как Server Component может вложить в себя Client Component, а Client — Server?",
      "options": [
        "Никак",
        "Server импортирует Client напрямую; Client получает Server Component только через `children`/пропсы-JSX",
        "Оба импортируют друг друга",
        "Через контекст"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
