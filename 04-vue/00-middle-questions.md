# Middle-разминка: Vue

> ⏱ ~1 ч · 🎯 Без запинки ответить на базовые вопросы по Vue 3 за 30–60 секунд с примером. Глубина — в темах раздела.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Ответил вслух на все вопросы, не подглядывая
- [ ] Прошёл [тест по разминке](../quizzes/quiz.html?id=04-vue/00-middle-questions) без ошибок

## Вопросы

<details><summary>Как устроена реактивность Vue 3?</summary>

`reactive` оборачивает объект в Proxy, `ref` — объект с геттером/сеттером `value`. При чтении в эффекте (рендер, `computed`, `watch`) регистрируется зависимость, при записи — запускаются зависимые эффекты. Обновления батчатся до следующего тика. Подробно — [реактивность](01-reactivity.md).
</details>

<details><summary>Чем `ref` отличается от `reactive`?</summary>

`ref` подходит для любых значений (включая примитивы), доступ через `.value` (в шаблоне разворачивается автоматически). `reactive` — только для объектов, теряет реактивность при деструктуризации и полной замене. Рекомендация документации — по умолчанию `ref`.
</details>

<details><summary>Чем `computed` отличается от метода и от `watch`?</summary>

`computed` — производное значение с кэшем: пересчитывается только при изменении зависимостей. Метод вызывается при каждом рендере. `watch` — побочные эффекты в ответ на изменения (запрос, запись в localStorage), а не вычисление значения.
</details>

<details><summary>Чем `watch` отличается от `watchEffect`?</summary>

`watch` следит за явно указанными источниками, даёт старое и новое значения, по умолчанию ленивый. `watchEffect` запускается сразу и отслеживает всё, что прочитал. Очистка — `onWatcherCleanup` (3.5+) или аргумент `onCleanup`.
</details>

<details><summary>Чем `v-if` отличается от `v-show`?</summary>

`v-if` создаёт и уничтожает элементы и компоненты (дороже переключение, дешевле начальный рендер, если условие ложно). `v-show` переключает `display: none` (элемент всегда в DOM). Частое переключение — `v-show`.
</details>

<details><summary>Почему не стоит использовать `v-if` и `v-for` на одном элементе?</summary>

Во Vue 3 `v-if` имеет приоритет и не видит переменную цикла. Фильтровать — через `computed` или `v-if` на вложенном `<template>`.
</details>

<details><summary>Зачем `key` в `v-for`?</summary>

Чтобы Vue сопоставлял элементы с данными при изменении списка: без стабильного ключа переиспользуются не те элементы и теряется состояние. Ключ — id из данных, не индекс.
</details>

<details><summary>Как компоненты общаются между собой?</summary>

Props вниз, события вверх (`defineEmits`), `v-model` (`defineModel`), слоты для передачи разметки, `provide/inject` для поддерева, стор (Pinia) для глобального состояния, `ref` на дочерний компонент + `defineExpose` — в крайнем случае.
</details>

<details><summary>Как работает `v-model` на компоненте?</summary>

Синтаксический сахар: проп `modelValue` + событие `update:modelValue`. В 3.4+ — `defineModel()` возвращает ref, синхронизированный с родителем. Можно несколько моделей с аргументами: `v-model:title`.
</details>

<details><summary>Что такое слоты и scoped slots?</summary>

Слоты — места для разметки родителя внутри компонента (default и именованные). Scoped slots передают данные из дочернего компонента в шаблон родителя: `<template #item="{ item }">`. Основа компонентов-контейнеров (списки, таблицы).
</details>

<details><summary>Какие хуки жизненного цикла есть в Composition API?</summary>

`onBeforeMount`, `onMounted` (DOM готов), `onBeforeUpdate`, `onUpdated`, `onBeforeUnmount`, `onUnmounted` (очистка), `onErrorCaptured`, `onActivated`/`onDeactivated` (KeepAlive). Код в `setup` выполняется вместо `beforeCreate`/`created`.
</details>

<details><summary>Чем Composition API лучше Options API?</summary>

Логика группируется по смыслу, а не по типу опций; переиспользование через composables без миксинов (нет конфликтов имён и неявных источников); лучшая типизация. Options API остаётся поддерживаемым. Подробно — [Composition API](02-composition-api.md).
</details>

<details><summary>Что такое composable?</summary>

Функция `use*`, использующая Composition API для переиспользуемой логики с состоянием (`useMouse`, `useFetch`). Каждый вызов создаёт своё состояние (если оно не вынесено на уровень модуля). Много готовых — в VueUse.
</details>

<details><summary>Что делает `nextTick`?</summary>

Ждёт применения запланированных обновлений DOM. Нужен, когда после изменения состояния требуется прочитать обновлённый DOM (размеры, фокус).
</details>

<details><summary>Что такое `<script setup>`?</summary>

Синтаксис SFC, в котором код выполняется как `setup()`: объявленные переменные и импорты сразу доступны в шаблоне, макросы `defineProps`, `defineEmits`, `defineModel`, `defineExpose`, `defineSlots`. Меньше шаблонного кода и лучше производительность компиляции.
</details>

<details><summary>Как Vue оптимизирует обновления шаблонов?</summary>

Компилятор помечает динамические части (patch flags), поднимает статичные узлы (static hoisting), отслеживает динамические дочерние узлы блоками — при обновлении сравнивается только динамическое. В Vapor Mode (3.6) — компиляция без виртуального DOM. Подробно — [производительность](05-performance-and-vue-vs-react.md).
</details>

<details><summary>Чем Pinia лучше модульного `ref`?</summary>

DevTools, плагины, SSR-изоляция на запрос, единые соглашения. См. [стейт-менеджеры](08-state-managers.md).
</details>

## Источники
- [vuejs.org: Guide](https://vuejs.org/guide/introduction.html)
- [Vue: Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
