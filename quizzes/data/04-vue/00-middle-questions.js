QUIZ.register({
  "id": "04-vue/00-middle-questions",
  "section": "04-vue",
  "title": "Middle-разминка: Vue",
  "order": 0.5,
  "source": "../04-vue/00-middle-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Когда `v-show` лучше `v-if`?",
      "options": [
        "Когда элемент редко показывается",
        "При частом переключении видимости",
        "Для списков",
        "Никогда"
      ],
      "answer": 1,
      "explain": "`v-show` не пересоздаёт элемент."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `computed` лучше метода в шаблоне?",
      "options": [
        "Ничем",
        "Кэширует результат и пересчитывает только при изменении зависимостей",
        "Работает асинхронно",
        "Можно передать аргументы"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что произойдёт при деструктуризации `const { count } = reactive({ count: 0 })`?",
      "options": [
        "Сохранится реактивность",
        "Потеряется реактивность — `count` станет обычным числом",
        "Ошибка",
        "count станет ref"
      ],
      "answer": 1,
      "explain": "Используйте `toRefs` или `ref`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как дочерний компонент меняет значение `v-model`?",
      "options": [
        "Меняет проп напрямую",
        "Генерирует `update:modelValue` (или использует `defineModel`)",
        "Через `$parent`",
        "Через глобальное событие"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем `nextTick`?",
      "options": [
        "Отложить сетевой запрос",
        "Дождаться применения обновлений DOM после изменения состояния",
        "Запустить анимацию",
        "Пропустить рендер"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой приоритет у `v-if` и `v-for` на одном элементе во Vue 3?",
      "options": [
        "`v-for` выше",
        "`v-if` выше и не видит переменную цикла",
        "одинаковый",
        "зависит от порядка атрибутов"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где выполнять код при монтировании, когда DOM уже доступен?",
      "options": [
        "в теле `setup`",
        "`onMounted`",
        "`onBeforeMount`",
        "`watch`"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    }
  ],
  "tasks": []
});
