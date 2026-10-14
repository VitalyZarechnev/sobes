# Компоненты и рендеринг

> ⏱ ~3 ч · 🎯 Объяснить путь от шаблона до DOM: компиляция, оптимизации (hoisting, patch flags, block tree), VDOM-патчинг и планировщик; уверенно владеть слотами, `v-model`, встроенными компонентами (KeepAlive, Teleport, Suspense, Transition), async-компонентами и жизненным циклом.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Посмотрел вывод компилятора в Vue SFC Playground (вкладка JS)
- [ ] Объясняю patch flags и block tree и почему это «compiler-informed VDOM»
- [ ] Знаю порядок хуков жизненного цикла родителя и детей
- [ ] Понимаю очередь планировщика и `nextTick`
- [ ] Использую scoped slots, `v-model` на компонентах, KeepAlive/Teleport/Suspense

## Теория

### Механизм рендеринга

1. **Компиляция**: шаблон → render-функция, возвращающая VNode (на этапе сборки через `@vitejs/plugin-vue`, либо в рантайме в полной сборке).
2. **Mount**: render-функция выполняется внутри реактивного эффекта — все прочитанные реактивные значения становятся зависимостями компонента. Создаются DOM-узлы.
3. **Patch**: при изменении зависимости эффект ставится в очередь; render-функция выполняется заново, новое VNode-дерево сравнивается со старым, применяются минимальные изменения.

Главное отличие от React: обновление **гранулярно на уровне компонента** — ререндерится только компонент, чьи зависимости изменились. Дети не ререндерятся «по умолчанию», если их пропсы не изменились (Vue сравнивает пропсы при патче и пропускает ребёнка — эквивалент автоматического `React.memo`).

### Компилятор шаблонов и «compiler-informed VDOM»

Чистый VDOM (как в React) не знает, какие части шаблона динамические, и должен обходить всё дерево. Шаблоны Vue статически анализируемы, поэтому компилятор передаёт рантайму подсказки.

```vue
<div class="card">
  <h1>Заголовок</h1>
  <p :class="{ active }">{{ message }}</p>
  <span :id="id">static text</span>
</div>
```

Упрощённый результат компиляции:

```js
import { createElementVNode as _el, toDisplayString as _s, normalizeClass as _nc,
         openBlock as _open, createElementBlock as _block } from 'vue';

const _hoisted_1 = { class: 'card' };
const _hoisted_2 = /*#__PURE__*/ _el('h1', null, 'Заголовок', -1 /* CACHED (HOISTED до 3.5) */);

export function render(_ctx) {
  return (_open(), _block('div', _hoisted_1, [
    _hoisted_2,
    _el('p', { class: _nc({ active: _ctx.active }) }, _s(_ctx.message), 3 /* TEXT, CLASS */),
    _el('span', { id: _ctx.id }, 'static text', 8 /* PROPS */, ['id']),
  ]));
}
```

**Static hoisting / caching.** Полностью статические узлы и объекты пропсов создаются **один раз** вне render-функции и переиспользуются; при патче их пропускают. Последовательности статических узлов (много подряд) сериализуются в строку и вставляются через `innerHTML` (static VNode). С 3.5 статика кэшируется в кэше компонента вместо модульного hoisting (`-1 /* CACHED */`), смысл тот же.

**Patch flags.** Битовая маска на динамическом узле говорит, **что именно** может измениться:

| Флаг | Значение |
|---|---|
| `TEXT` (1) | динамический текст |
| `CLASS` (2) | динамический class |
| `STYLE` (4) | динамический style |
| `PROPS` (8) | динамические пропсы (список имён рядом) |
| `FULL_PROPS` (16) | динамические ключи (`v-bind="obj"`) — полный diff |
| `NEED_HYDRATION`, `STABLE_FRAGMENT`, `KEYED_FRAGMENT`, `UNKEYED_FRAGMENT`, `NEED_PATCH`, `DYNAMIC_SLOTS` ... | |

При патче рантайм проверяет флаг побитово (`flags & PatchFlags.CLASS`) и обновляет только class, не сравнивая остальное.

**Block tree.** Узел-«блок» (корень шаблона, `v-if`/`v-for`-фрагменты) собирает в плоский массив `dynamicChildren` **все динамические потомки** любого уровня вложенности. При обновлении Vue проходит только этот плоский массив, игнорируя статическую структуру. Структурные директивы (`v-if`, `v-for`) создают новые блоки, т.к. меняют форму дерева.

Итог: стоимость обновления пропорциональна **количеству динамических привязок**, а не размеру шаблона.

Плюс: **кэширование обработчиков** (`@click="onClick"` → `_cache[0] || (_cache[0] = (...args) => _ctx.onClick(...args))`) — ссылка стабильна, дочерний компонент не получает «новый» проп и не ререндерится. В React эту же проблему решают `useCallback` или React Compiler.

💡 На собеседовании: «Vue использует VDOM, но компилятор размечает динамику — patch flags и block tree превращают diff дерева в обход плоского списка динамических узлов. Это гибрид VDOM и компиляции, а Vapor Mode идёт дальше и убирает VDOM совсем».

Render-функции и JSX тоже поддерживаются (`h()`), но теряют эти оптимизации — компилятор их не анализирует.

### Алгоритм diff детей с ключами

Для keyed-списков Vue 3: сравнение с начала, с конца, затем для середины — map ключей и **longest increasing subsequence (LIS)**, чтобы найти максимальный набор узлов, которые не нужно перемещать, и минимизировать DOM-операции `insertBefore`. Ключи — как в React: стабильные id, не индекс для изменяемых списков.

### Жизненный цикл

| Composition API | Options API | Когда |
|---|---|---|
| `setup()` | `beforeCreate`/`created` | создание инстанса, один раз |
| `onBeforeMount` | `beforeMount` | перед первым рендером в DOM |
| `onMounted` | `mounted` | DOM создан и вставлен (дети смонтированы раньше родителя) |
| `onBeforeUpdate` | `beforeUpdate` | перед патчем из-за изменения состояния |
| `onUpdated` | `updated` | после патча DOM |
| `onBeforeUnmount` | `beforeUnmount` | перед удалением |
| `onUnmounted` | `unmounted` | удалён, эффекты остановлены |
| `onActivated`/`onDeactivated` | `activated`/`deactivated` | KeepAlive |
| `onErrorCaptured` | `errorCaptured` | ошибка в потомке |
| `onServerPrefetch` | `serverPrefetch` | SSR: дождаться данных |

Порядок: родитель `setup → onBeforeMount` → дети полностью → дети `onMounted` → родитель `onMounted`. При размонтировании — сначала родитель `onBeforeUnmount`, затем дети, затем `onUnmounted` от детей к родителю.

Хуки жизненного цикла не выполняются при SSR, кроме `setup` и `onServerPrefetch`.

🪤 Ловушка: изменение состояния в `onUpdated` → бесконечный цикл обновлений. Используйте `watch` с `flush: 'post'`.

### Планировщик и nextTick

Изменение реактивного состояния не обновляет DOM синхронно. Эффекты компонентов ставятся в **очередь** (`queueJob`), задания дедуплицируются, сортируются по id компонента (родитель раньше детей — дочерний компонент, который будет размонтирован родителем, не обновится зря), и очередь сбрасывается **в микрозадаче** (`Promise.resolve().then(flushJobs)`).

Порядок в одном flush: pre-вотчеры (`flush: 'pre'`) → обновления компонентов → post-колбэки (`flush: 'post'`, `onUpdated`, `onMounted`).

```ts
const count = ref(0);
async function inc() {
  count.value++;
  count.value++;            // один ререндер — задание в очереди одно
  console.log(el.value!.textContent); // старое значение
  await nextTick();         // дождаться flush
  console.log(el.value!.textContent); // новое
}
```

`nextTick()` возвращает промис, который резолвится после текущего flush. Используется для работы с DOM после изменения состояния (фокус, скролл, измерения). Альтернатива — `watch(..., { flush: 'post' })`.

### Slots

```vue
<!-- DataList.vue -->
<script setup lang="ts" generic="T">
defineProps<{ items: T[]; loading?: boolean }>();
defineSlots<{
  default(props: { item: T; index: number }): any;
  empty(): any;
  header?(): any;
}>();
</script>

<template>
  <header v-if="$slots.header"><slot name="header" /></header>
  <slot v-if="!items.length" name="empty">Нет данных</slot>  <!-- fallback-контент -->
  <ul v-else>
    <li v-for="(item, index) in items" :key="index">
      <slot :item="item" :index="index" />                    <!-- scoped slot -->
    </li>
  </ul>
</template>

<!-- Использование -->
<DataList :items="users">
  <template #header>Пользователи</template>
  <template #default="{ item }">{{ item.name }}</template>
  <template #empty>Никого нет</template>
</DataList>
```

- Слот компилируется в **функцию**, которую вызывает дочерний компонент — содержимое рендерится в контексте ребёнка, но с областью видимости переменных родителя. Scoped slot = функция с аргументами (аналог render props в React).
- Поскольку слоты — функции, изменения в содержимом слота ререндерят **только ребёнка**, а не родителя; а зависимости, прочитанные внутри слота, трекаются эффектом дочернего компонента.
- Динамические имена `#[name]`, условные слоты помечаются `DYNAMIC_SLOTS` и деоптимизируют ребёнка.
- Renderless-компонент: только `<slot v-bind="state" />` без разметки — переиспользование логики с доступом к шаблону.

### v-model

На нативных элементах: `value` + `@input` (или `checked` + `@change`, `lazy`, `number`, `trim`).

На компонентах (Vue 3): prop `modelValue` + событие `update:modelValue`; несколько привязок `v-model:title`, `v-model:content`; кастомные модификаторы через `modelModifiers`.

```vue
<!-- Без defineModel (до 3.4 / для понимания) -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string; modelModifiers?: { trim?: boolean } }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
function onInput(e: Event) {
  let v = (e.target as HTMLInputElement).value;
  if (props.modelModifiers?.trim) v = v.trim();
  emit('update:modelValue', v);
}
</script>
<template><input :value="modelValue" @input="onInput" /></template>
```

Отличие от Vue 2: там был `value` + `input` и `.sync`-модификатор; в Vue 3 `.sync` удалён и заменён `v-model:arg`. С 3.4 — `defineModel` ([02](02-composition-api.md)).

### KeepAlive

Кэширует инстансы динамически переключаемых компонентов вместо размонтирования — состояние и DOM сохраняются.

```vue
<KeepAlive :include="['Search', 'Feed']" :max="10">
  <component :is="activeTab" />
</KeepAlive>

<!-- С роутером -->
<RouterView v-slot="{ Component }">
  <KeepAlive><component :is="Component" /></KeepAlive>
</RouterView>
```

- `include`/`exclude` — по `name` компонента (в `<script setup>` имя выводится из имени файла или `defineOptions({ name })`).
- `max` — LRU-вытеснение.
- Хуки `onActivated`/`onDeactivated` — переподписаться на события, обновить данные, остановить таймеры.
- 🪤 Ловушка: утечки памяти при кэшировании множества тяжёлых экранов без `max`; таймеры продолжают работать в деактивированном компоненте.

Аналог в React — `<Activity mode="hidden">` (19.2).

### Teleport

Рендерит содержимое в другой DOM-узел, оставаясь в логическом дереве компонента (props, provide/inject, события компонента).

```vue
<Teleport to="body" :disabled="isMobile" defer>
  <div v-if="open" class="modal" role="dialog" aria-modal="true">...</div>
</Teleport>
```

- `disabled` — рендерить на месте (например, на мобильных).
- `defer` (3.5) — монтировать после остального приложения, позволяет телепортировать в элемент, отрендеренный этим же приложением позже.
- В отличие от React-порталов, **DOM-события** всплывают по DOM (Teleport ничего не делает с нативными событиями), а `emit` компонента — по логическому дереву.
- SSR: телепортированный контент отдельно собирается в `ctx.teleports`, фреймворк вставляет его в нужное место HTML.

### Suspense (экспериментальный)

`<Suspense>` ждёт async-зависимости в дереве: компоненты с async `setup()` (top-level `await` в `<script setup>`) и async-компоненты. Показывает `#fallback`, пока все не разрешатся.

```vue
<Suspense @resolve="onReady" timeout="200">
  <template #default><Dashboard /></template>  <!-- внутри: const data = await fetchData() -->
  <template #fallback><Spinner /></template>
</Suspense>
```

Статус API: всё ещё помечен как experimental (API может измениться), но широко используется через Nuxt. Ошибки — через `onErrorCaptured` у предка. При повторном переходе в pending (смена корня `#default`) показывается старый контент, пока не истечёт `timeout`.

### Async components

```ts
const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: ChartSkeleton,
  delay: 200,                    // не мигать спиннером на быстрых сетях
  errorComponent: ChartError,
  timeout: 10_000,
  hydrate: hydrateOnVisible(),   // 3.5: ленивая гидратация при SSR
});
```

- Стратегии ленивой гидратации (3.5): `hydrateOnIdle`, `hydrateOnVisible`, `hydrateOnMediaQuery`, `hydrateOnInteraction('click')` — аналог «островов» внутри SSR-приложения.
- Внутри `<Suspense>` async-компонент управляется Suspense (его loading-опции игнорируются, если не задано `suspensible: false`).
- Роутер использует просто `() => import('./Page.vue')` — `defineAsyncComponent` для маршрутов не нужен.

### Transition (кратко)

`<Transition>` / `<TransitionGroup>` — классы `v-enter-from/active/to`, `v-leave-*`, JS-хуки, `mode="out-in"`. `TransitionGroup` анимирует перемещения через FLIP (`v-move`).

## Вопросы с собеседований

<details><summary>Как Vue оптимизирует VDOM с помощью компилятора?</summary>

Static hoisting/caching (статические узлы создаются один раз и пропускаются при diff), patch flags (битовая маска того, что динамично в узле), block tree (плоский список динамических потомков, без обхода статической структуры), кэширование обработчиков событий. Diff пропорционален числу динамических привязок.
</details>

<details><summary>Почему в Vue не нужно вручную мемоизировать дочерние компоненты, как в React?</summary>

Ререндер привязан к компоненту, чьи зависимости изменились; ребёнок обновляется, только если изменились его пропсы (сравниваются при патче) или его собственные зависимости. Обработчики кэшируются компилятором, слоты — функции, поэтому ссылки стабильны.
</details>

<details><summary>Что такое nextTick и когда он нужен?</summary>

Промис, разрешающийся после ближайшего flush очереди планировщика (DOM обновлён). Нужен для работы с DOM сразу после изменения состояния: фокус в только что показанный инпут, скролл к новому элементу, измерения.
</details>

<details><summary>Как работает планировщик Vue?</summary>

Задания компонентов и pre-вотчеров добавляются в очередь с дедупликацией, сортируются по id (родители раньше), очередь сбрасывается в микрозадаче. Сначала pre-колбэки, затем обновления компонентов, затем post-колбэки. Есть защита от рекурсии.
</details>

<details><summary>Чем scoped slots отличаются от обычных и что это в рантайме?</summary>

Scoped slot получает данные от дочернего компонента (`<slot :item="item">`). В рантайме любой слот — функция, вызываемая ребёнком; scoped — с аргументами. Аналог render props.
</details>

<details><summary>Как реализовать v-model на компоненте?</summary>

Prop `modelValue` + emit `update:modelValue`; для именованного — `title` + `update:title`. С 3.4 — `defineModel()`. Модификаторы приходят в `modelModifiers`.
</details>

<details><summary>Для чего KeepAlive и какие у него риски?</summary>

Сохранение инстанса и DOM при переключении (вкладки, возврат к списку с сохранением скролла/фильтров). Риски: память (использовать `max`), фоновые таймеры/подписки (управлять в `onActivated`/`onDeactivated`), устаревшие данные.
</details>

<details><summary>Порядок mounted у родителя и детей?</summary>

Дети монтируются первыми: `onMounted` вызывается у детей, затем у родителя. Когда родительский `onMounted` срабатывает, весь DOM поддерева уже на месте (кроме async-компонентов и содержимого Suspense).
</details>

<details><summary>Teleport vs React createPortal — разница в событиях?</summary>

В React синтетические события из портала всплывают по React-дереву. В Vue нативные DOM-события всплывают по DOM (из места телепорта), а логическая связь сохраняется для props, provide/inject и эмитов компонента.
</details>

<details><summary>Что такое ленивая гидратация в Vue 3.5?</summary>

Для async-компонентов можно указать стратегию `hydrate`: гидратировать при простое, при появлении в viewport, по media query или по взаимодействию. Уменьшает TTI на SSR-страницах — по сути острова без смены фреймворка.
</details>

## Практика

**1. Предскажи вывод.**

```vue
<script setup>
import { ref, onUpdated, nextTick } from 'vue';
const n = ref(0);
onUpdated(() => console.log('updated', n.value));
async function run() {
  n.value = 1; n.value = 2; n.value = 3;
  console.log('sync', n.value);
  await nextTick();
  console.log('after tick');
}
</script>
<template><button @click="run">{{ n }}</button></template>
```

<details><summary>Решение</summary>

`sync 3`, `updated 3`, `after tick`. Три изменения → одно задание в очереди → один ререндер. `onUpdated` — post-колбэк того же flush, после которого резолвится `nextTick`.
</details>

**2. Реализуй** компонент `Tabs` с именованными слотами `#tab-<id>` и KeepAlive для панелей.

<details><summary>Решение (идея)</summary>

Принимает `tabs: { id: string; title: string }[]` и `v-model` активной вкладки; рендерит кнопки с `role="tab"`, а панель — `<KeepAlive><component :is="..."/></KeepAlive>` или, со слотами, `<template v-for="t in tabs"><div v-show="t.id === active"><slot :name="`tab-${t.id}`" /></div></template>` (`v-show` сохраняет состояние без KeepAlive, но держит всё в DOM). Обсудить trade-off v-show vs KeepAlive vs v-if.
</details>

**3. Объясни** по выводу компилятора, почему `<Comp v-bind="attrs" />` деоптимизирует обновление.

<details><summary>Решение</summary>

Ключи пропсов неизвестны на этапе компиляции → флаг `FULL_PROPS` → полный diff всех пропсов при каждом обновлении вместо точечного по списку `dynamicProps`.
</details>

## Источники
- https://vuejs.org/guide/extras/rendering-mechanism.html
- https://vuejs.org/guide/essentials/lifecycle.html
- https://vuejs.org/api/general.html#nexttick
- https://vuejs.org/guide/components/slots.html
- https://vuejs.org/guide/components/v-model.html
- https://vuejs.org/guide/built-ins/keep-alive.html
- https://vuejs.org/guide/built-ins/teleport.html
- https://vuejs.org/guide/built-ins/suspense.html
- https://vuejs.org/guide/components/async.html
- https://play.vuejs.org/
- https://blog.vuejs.org/posts/vue-3-5
