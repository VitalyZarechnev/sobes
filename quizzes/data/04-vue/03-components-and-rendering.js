QUIZ.register({
  "id": "04-vue/03-components-and-rendering",
  "section": "04-vue",
  "title": "Vue: компоненты и рендеринг",
  "order": 3,
  "source": "../04-vue/03-components-and-rendering.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как передать данные из дочернего компонента в шаблон родителя внутри слота?",
      "options": [
        "Через emit",
        "Scoped slot: `<slot :item=\"item\" />` и `<template #default=\"{ item }\">`",
        "Через provide",
        "Нельзя"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `defineExpose`?",
      "options": [
        "Экспортирует компонент",
        "Явно открывает методы/свойства `<script setup>`-компонента для родителя через ref",
        "Делает пропсы реактивными",
        "Регистрирует глобально"
      ],
      "answer": 1,
      "explain": "По умолчанию `<script setup>` закрыт."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое fallthrough-атрибуты?",
      "options": [
        "Ошибочные атрибуты",
        "Атрибуты и обработчики, не объявленные как props/emits, переходят на корневой элемент (`$attrs`)",
        "Атрибуты слотов",
        "CSS-переменные"
      ],
      "answer": 1,
      "explain": "`inheritAttrs: false` + `v-bind=\"$attrs\"` — чтобы направить их на нужный элемент."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Для чего `<KeepAlive>`?",
      "options": [
        "Кэширует экземпляры динамических компонентов при переключении (сохраняет состояние)",
        "Держит соединение WebSocket",
        "Предотвращает размонтирование всего приложения",
        "Для SSR"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `<Teleport to=\"body\">`?",
      "options": [
        "Перемещает компонент в другой маршрут",
        "Рендерит содержимое в другое место DOM, сохраняя логическую иерархию компонентов",
        "Копирует DOM",
        "Для анимаций"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `defineAsyncComponent` полезен?",
      "options": [
        "Асинхронные пропсы",
        "Ленивая загрузка компонента отдельным чанком с состояниями загрузки и ошибки",
        "Для SSR",
        "Для форм"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
