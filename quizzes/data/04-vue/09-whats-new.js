QUIZ.register({
  "id": "04-vue/09-whats-new",
  "section": "04-vue",
  "title": "Новинки Vue 3.4–3.6",
  "order": 9,
  "source": "../04-vue/09-whats-new.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `defineModel()` (стабилен с 3.4)?",
      "options": [
        "Определяет модель Pinia",
        "Объявляет двустороннюю привязку `v-model` в компоненте одной строкой",
        "Создаёт форму",
        "Заменяет `defineProps`"
      ],
      "answer": 1,
      "explain": "Возвращает ref, синхронизированный с пропом `modelValue` и событием `update:modelValue`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как задать значения по умолчанию пропсам в Vue 3.5?",
      "options": [
        "Только через `withDefaults`",
        "Деструктуризацией с умолчаниями: `const { count = 0 } = defineProps(...)`",
        "Через `data()`",
        "Через `provide`"
      ],
      "answer": 1,
      "explain": "Реактивная деструктуризация стабильна в 3.5, компилятор переписывает обращения в `props.count`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что не так с этим кодом во Vue 3.5?",
      "code": "const { count = 0 } = defineProps(['count']);\nwatch(count, (v) => console.log(v));",
      "lang": "js",
      "options": [
        "Всё работает",
        "В `watch` передаётся значение, а не реактивный источник; нужно `watch(() => count, …)`",
        "Деструктуризация пропсов запрещена",
        "Нужно `toRef(count)`"
      ],
      "answer": 1,
      "explain": "Компилятор превращает `count` в `props.count` — это значение. Vue предупреждает о таком использовании."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие API появились в Vue 3.5?",
      "options": [
        "`useTemplateRef`",
        "`useId`",
        "`onWatcherCleanup`",
        "`<Teleport defer>`",
        "`defineModel`",
        "`createVaporApp`"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "`defineModel` стабилизирован в 3.4, `createVaporApp` — в 3.6."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем нужна ленивая гидратация (`hydrate: hydrateOnVisible()`)?",
      "options": [
        "Ускорить сервер",
        "Отложить гидратацию асинхронного компонента до видимости/простоя/взаимодействия, чтобы меньше JS выполнялось на старте",
        "Отключить SSR",
        "Кэшировать HTML"
      ],
      "answer": 1,
      "explain": "Это «острова» внутри Vue-приложения: лучше INP и TBT."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему `useId()` лучше `Math.random()` для `id` в SSR-приложении?",
      "options": [
        "Он короче",
        "Он одинаков на сервере и клиенте — нет ошибок гидратации",
        "Он криптостойкий",
        "Он глобально уникален между сайтами"
      ],
      "answer": 1,
      "explain": "`Math.random()` даст разные значения на сервере и клиенте."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Vapor Mode?",
      "options": [
        "Новый стейт-менеджер",
        "Режим компиляции SFC без Virtual DOM: прямые операции с DOM и точечные реактивные эффекты",
        "SSR-режим Nuxt",
        "Плагин для анимаций"
      ],
      "answer": 1,
      "explain": "Opt-in через `<script setup vapor>`, производительность на уровне Solid/Svelte 5."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой статус Vue 3.6 на октябрь 2026?",
      "options": [
        "Стабильный релиз",
        "Release candidate (стабильная ветка — 3.5.x)",
        "Отменён",
        "Только в Nuxt"
      ],
      "answer": 1,
      "explain": "Поэтому Vapor в проде — точечно и после проверки совместимости."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как использовать Vapor-компоненты в существующем VDOM-приложении?",
      "options": [
        "Никак",
        "Подключить `vaporInteropPlugin` к `createApp`",
        "Переписать всё приложение",
        "Через `defineAsyncComponent`"
      ],
      "answer": 1,
      "explain": "Команда Vue советует делить приложение на «зоны» одного режима и избегать глубокого смешивания."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "На какой библиотеке основана новая реактивность Vue 3.6?",
      "options": [
        "RxJS",
        "alien-signals",
        "MobX",
        "Preact Signals"
      ],
      "answer": 1,
      "explain": "Это внутренний рефакторинг `@vue/reactivity`, публичный API не меняется."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "Стоит ли переводить проект на Vapor Mode?",
      "answer": "Оценить по данным: есть ли реальные проблемы производительности рендера (профайлер), какие страницы тяжёлые. Vapor — opt-in на уровне компонента: начать с изолированной тяжёлой страницы (таблица, дашборд), проверить совместимость UI-кита (VDOM-библиотеки внутри Vapor могут работать с шероховатостями), измерить INP и размер бандла. Для продакшена — дождаться стабильного 3.6 (на октябрь 2026 — RC). Не мигрировать существующие компоненты массово."
    }
  ],
  "tasks": [
    {
      "title": "Обновить компонент до API Vue 3.5",
      "level": "senior",
      "lang": "vue",
      "prompt": "Перепишите компонент: `withDefaults` → деструктуризация, ref элемента → `useTemplateRef`, `onCleanup` в watch → `onWatcherCleanup`.",
      "solution": "<script setup lang=\"ts\">\nimport { ref, onMounted, watch, useTemplateRef, onWatcherCleanup } from 'vue';\nconst { query = '', autofocus = false } = defineProps<{ query?: string; autofocus?: boolean }>();\nconst input = useTemplateRef<HTMLInputElement>('input');\nconst results = ref([]);\nonMounted(() => { if (autofocus) input.value?.focus(); });\nwatch(() => query, async (q) => {\n  const controller = new AbortController();\n  onWatcherCleanup(() => controller.abort());\n  results.value = await search(q, controller.signal);\n});\n</script>\n<template><input ref=\"input\" :value=\"query\" /></template>"
    },
    {
      "title": "FormField с useId",
      "level": "middle",
      "lang": "vue",
      "prompt": "Компонент `FormField` с `label`, связанным с `input` через `for`/`id`, без ошибок гидратации при SSR и с `v-model` через `defineModel`.",
      "solution": "<script setup lang=\"ts\">\nimport { useId } from 'vue';\nconst { label } = defineProps<{ label: string }>();\nconst model = defineModel<string>({ default: '' });\nconst id = useId();\n</script>\n<template>\n  <label :for=\"id\">{{ label }}</label>\n  <input :id=\"id\" v-model=\"model\" />\n</template>"
    }
  ]
});
