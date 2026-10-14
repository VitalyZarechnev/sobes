QUIZ.register({
  "id": "04-vue/07-nuxt",
  "section": "04-vue",
  "title": "Nuxt",
  "order": 7,
  "source": "../04-vue/07-nuxt.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `useFetch` в Nuxt отличается от обычного `fetch` в `setup`?",
      "options": [
        "Ничем",
        "Данные, полученные на сервере, передаются в payload и не запрашиваются повторно при гидратации; есть ключ, дедупликация, статусы",
        "useFetch работает только на клиенте",
        "useFetch без SSR"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Где хранить общее состояние в Nuxt, чтобы не было утечек между запросами?",
      "options": [
        "Модульный ref",
        "`useState(key)` или Pinia",
        "globalThis",
        "localStorage"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как настроить разные режимы рендеринга для разных маршрутов?",
      "options": [
        "Нельзя",
        "`routeRules` в nuxt.config: prerender, swr/isr, ssr: false",
        "Отдельные проекты",
        "middleware"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое auto-imports в Nuxt?",
      "options": [
        "Импорт npm-пакетов",
        "Компоненты, composables и утилиты из соглашённых папок доступны без явного import",
        "Импорт CSS",
        "Ошибка"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Где писать серверные API-эндпоинты в Nuxt?",
      "options": [
        "`pages/api`",
        "`server/api` (Nitro, h3)",
        "`middleware/`",
        "`plugins/`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `<NuxtIsland>` / server components в Nuxt?",
      "options": [
        "Клиентский рендер",
        "Рендерит компонент только на сервере без клиентского JS — меньше бандл",
        "Lazy loading изображений",
        "Создаёт iframe"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
