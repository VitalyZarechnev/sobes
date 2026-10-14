QUIZ.register({
  "id": "03-react/06-patterns-and-testing",
  "section": "03-react",
  "title": "Паттерны и тестирование",
  "order": 6,
  "source": "../03-react/06-patterns-and-testing.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое compound components?",
      "options": [
        "Компоненты в одном файле",
        "Связанные компоненты с общим состоянием через контекст (`Tabs`, `Tabs.Tab`, `Tabs.Panel`)",
        "HOC",
        "Render props"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как найти кнопку в Testing Library правильнее всего?",
      "options": [
        "`container.querySelector(\".btn\")`",
        "`screen.getByRole(\"button\", { name: /отправить/i })`",
        "`getByTestId` всегда",
        "По тексту CSS-класса"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему кастомные хуки в основном заменили HOC и render props?",
      "options": [
        "HOC запрещены",
        "Переиспользуют логику без обёрток, конфликтов пропсов и «ада вложенности»",
        "Хуки быстрее",
        "Render props удалены"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем мокать API в компонентных тестах?",
      "options": [
        "vi.mock(fetch) всегда",
        "MSW на сетевом уровне",
        "Реальный бэкенд",
        "Не тестировать"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что проверять в тесте формы?",
      "options": [
        "Внутренний state",
        "Поведение: ввод, валидацию, отправку, ошибки сервера — то, что видит пользователь",
        "Количество рендеров",
        "Имена классов"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
