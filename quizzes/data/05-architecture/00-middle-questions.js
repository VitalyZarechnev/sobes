QUIZ.register({
  "id": "05-architecture/00-middle-questions",
  "section": "05-architecture",
  "title": "Middle-разминка: архитектура",
  "order": 0.5,
  "source": "../05-architecture/00-middle-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой принцип SOLID нарушает компонент, который и загружает данные, и форматирует их, и отображает?",
      "options": [
        "Open/Closed",
        "Single Responsibility",
        "Liskov",
        "Interface Segregation"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Порядок слоёв FSD сверху вниз?",
      "options": [
        "shared → entities → features → widgets → pages → app",
        "app → pages → widgets → features → entities → shared",
        "pages → app → shared",
        "features → shared → app"
      ],
      "answer": 1,
      "explain": "Импортировать можно только из нижележащих слоёв."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем опасен DRY при случайном сходстве кода?",
      "options": [
        "Ничем",
        "Общая абстракция связывает независимые части и обрастает флагами",
        "Код станет медленнее",
        "Сломает типы"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое низкая связанность (low coupling)?",
      "options": [
        "Модули почти не зависят друг от друга",
        "Много кода в одном файле",
        "Нет тестов",
        "Мало функций"
      ],
      "answer": 0,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "В MVVM как View получает данные?",
      "options": [
        "Контроллер вызывает методы View",
        "Через привязку к наблюдаемому состоянию ViewModel",
        "Презентер вызывает setText",
        "Глобальные переменные"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем публичный API модуля (`index.ts`)?",
      "options": [
        "Для SEO",
        "Скрыть внутреннюю структуру и запретить глубокие импорты — модуль можно менять изнутри",
        "Для скорости сборки",
        "Так требует TS"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    }
  ],
  "tasks": []
});
