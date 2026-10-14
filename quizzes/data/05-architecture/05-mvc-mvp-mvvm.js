QUIZ.register({
  "id": "05-architecture/05-mvc-mvp-mvvm",
  "section": "05-architecture",
  "title": "MVC, MVP, MVVM и Flux",
  "order": 5,
  "source": "../05-architecture/05-mvc-mvp-mvvm.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Какой паттерн ближе всего к Vue с реактивными данными и привязкой?",
      "options": [
        "MVC",
        "MVP",
        "MVVM",
        "Flux"
      ],
      "answer": 2,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем MVP отличается от MVC?",
      "options": [
        "Ничем",
        "В MVP View пассивна и общается только с Presenter через интерфейс — удобно тестировать",
        "MVP без модели",
        "MVC без View"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Главная идея Flux/Redux?",
      "options": [
        "Двусторонняя привязка",
        "Однонаправленный поток: действие → диспетчер/редьюсер → стор → представление",
        "Наследование",
        "Контроллеры"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему двусторонняя привязка в больших системах может усложнять отладку?",
      "options": [
        "Медленная",
        "Изменения могут приходить из многих мест — сложнее понять, кто и почему изменил данные",
        "Не работает с TS",
        "Не усложняет"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
