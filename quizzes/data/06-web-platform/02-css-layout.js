QUIZ.register({
  "id": "06-web-platform/02-css-layout",
  "section": "06-web-platform",
  "title": "CSS: каскад, раскладка, архитектуры",
  "order": 2,
  "source": "../06-web-platform/02-css-layout.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что победит: `#nav a` или `.menu .link.active`?",
      "options": [
        "`.menu .link.active` (3 класса)",
        "`#nav a` (id весомее любого количества классов)",
        "Тот, что ниже в файле",
        "Одинаково"
      ],
      "answer": 1,
      "explain": "Специфичность 1-0-1 против 0-3-0."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как сделать адаптивную сетку карточек без медиазапросов?",
      "options": [
        "`float`",
        "`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`",
        "`display: table`",
        "`columns: 3`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что создаёт новый stacking context?",
      "options": [
        "Любой `position: relative`",
        "`opacity < 1`, `transform`, `isolation: isolate`, `z-index` у позиционированного элемента и др.",
        "Только `z-index: 9999`",
        "margin"
      ],
      "answer": 1,
      "explain": "Поэтому `z-index` «не работает» внутри родителя с transform."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `clamp(1rem, 2.5vw, 2rem)` полезен?",
      "options": [
        "Анимация",
        "Плавно масштабируемое значение с минимумом и максимумом (fluid typography)",
        "Обрезка текста",
        "Медиазапрос"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `100vh` проблемен на мобильных?",
      "options": [
        "Не поддерживается",
        "Не учитывает динамические панели браузера — используйте `100dvh`/`svh`/`lvh`",
        "Слишком маленький",
        "Работает только в Safari"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `rem` отличается от `em`?",
      "options": [
        "Ничем",
        "`rem` — от размера шрифта корня, `em` — от размера шрифта текущего элемента (накапливается при вложенности)",
        "`em` — от вьюпорта",
        "`rem` только для отступов"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
