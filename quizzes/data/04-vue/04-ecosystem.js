QUIZ.register({
  "id": "04-vue/04-ecosystem",
  "section": "04-vue",
  "title": "Экосистема Vue",
  "order": 4,
  "source": "../04-vue/04-ecosystem.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой стор рекомендован для Vue 3?",
      "options": [
        "Vuex 4",
        "Pinia",
        "Redux",
        "MobX"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое VueUse?",
      "options": [
        "UI-библиотека",
        "Коллекция composables (браузерные API, сенсоры, утилиты состояния)",
        "Роутер",
        "Сборщик"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем тестировать Vue-компоненты?",
      "options": [
        "Только e2e",
        "Vitest + Vue Test Utils или Testing Library для Vue; Playwright для e2e",
        "Jest только",
        "Нельзя тестировать SFC"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой порядок навигационных хуков Vue Router?",
      "options": [
        "afterEach → beforeEach",
        "beforeEach → beforeEnter → beforeRouteEnter → beforeResolve → afterEach",
        "beforeRouteEnter → beforeEach",
        "Произвольный"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем проверять типы в шаблонах Vue?",
      "options": [
        "tsc",
        "vue-tsc (Volar)",
        "ESLint",
        "Babel"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
