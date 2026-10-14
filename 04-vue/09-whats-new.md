# Новинки Vue: 3.4, 3.5 и 3.6 (Vapor Mode)

> ⏱ ~1.5 ч · 🎯 Знать, что изменилось во Vue за последние версии, уметь применять новые API 3.5 (деструктуризация пропсов, `useTemplateRef`, `useId`, ленивая гидратация) и объяснить, что такое Vapor Mode и новая реактивность 3.6.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Реактивность](01-reactivity.md) · [Composition API](02-composition-api.md) · [Производительность и Vapor](05-performance-and-vue-vs-react.md) · [Nuxt](07-nuxt.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, что дали 3.4 (`defineModel`, ускорение парсера) и 3.5 (реактивность, SSR-API)
- [ ] Умею деструктурировать пропсы с умолчаниями и понимаю, как сохраняется реактивность
- [ ] Знаю `useTemplateRef`, `useId`, `onWatcherCleanup`, `<Teleport defer>`
- [ ] Знаю, как включить ленивую гидратацию асинхронного компонента
- [ ] Могу объяснить, что такое Vapor Mode, его статус и ограничения

## Теория

### 1. Хронология

| Версия | Дата | Главное |
|---|---|---|
| 3.4 «Slam Dunk» | декабрь 2023 | парсер шаблонов в 2 раза быстрее, `defineModel` стабилен, сокращение `:id` для одноимённых привязок, `computed` не триггерит зависимых, если значение не изменилось |
| 3.5 «Tengen Toppa Gurren Lagann» | сентябрь 2024 | переработка реактивности (−56 % памяти), стабильная деструктуризация пропсов, `useTemplateRef`, `useId`, ленивая гидратация, `<Teleport defer>`, `onWatcherCleanup`, улучшения Custom Elements |
| 3.6 | **в стадии RC** на октябрь 2026 | **Vapor Mode** (компиляция без Virtual DOM), реактивность на основе alien-signals |

Стабильная ветка на октябрь 2026 — 3.5.x. Версия 3.6 проходит релиз-кандидаты, поэтому на собеседовании корректно говорить «Vapor Mode в 3.6, сейчас в RC, opt-in».

### 2. Vue 3.4

- **`defineModel()`** стал стабильным — двусторонняя привязка в компоненте одной строкой:

```vue
<script setup>
const model = defineModel({ required: true });            // v-model по умолчанию
const title = defineModel('title', { default: '' });      // именованный v-model:title
</script>
<template><input v-model="model" /></template>
```

- **Сокращение одноимённой привязки**: `<img :id :src :alt>` вместо `:id="id" :src="src" :alt="alt"`.
- **Парсер шаблонов** переписан и работает примерно в 2 раза быстрее, что ускоряет сборку.
- **`computed` стабильнее**: если пересчёт дал то же значение, зависимые эффекты не перезапускаются. В геттер передаётся предыдущее значение: `computed((prev) => …)`.
- Улучшены сообщения об ошибках гидратации, флаг `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` включает подробности в продакшене.
- Удалён экспериментальный Reactivity Transform (`$ref`).

### 3. Vue 3.5: реактивность и пропсы

**Переработка реактивности.** Внутреннее устройство стало экономнее: по данным команды Vue, потребление памяти снизилось на 56 %, операции над большими глубоко-реактивными массивами ускорились в разы. Также исправлены случаи «висящих» computed в SSR. Публичный API не изменился.

**Реактивная деструктуризация пропсов** стала стабильной и включена по умолчанию:

```vue
<script setup>
// Значения по умолчанию — обычный синтаксис JS, withDefaults больше не нужен
const { count = 0, msg = 'привет' } = defineProps(['count', 'msg']);

// Компилятор превращает обращения к count в props.count, поэтому реактивность сохраняется
watchEffect(() => console.log(count));

// 🪤 Но передавать деструктурированный проп в watch или composable нужно геттером:
watch(() => count, (v) => console.log(v));
useFeature(() => count);
</script>
```

### 4. Vue 3.5: новые API

**`useTemplateRef(key)`** — ref на элемент шаблона по строковому ключу. Работает и с динамическими ref, и в composables:

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue';
const input = useTemplateRef('search');
onMounted(() => input.value?.focus());
</script>
<template><input ref="search" /></template>
```

**`useId()`** — уникальный идентификатор, стабильный между сервером и клиентом (без ошибок гидратации):

```vue
<script setup>
const id = useId();
</script>
<template>
  <label :for="id">Email</label>
  <input :id="id" type="email" />
</template>
```

**`onWatcherCleanup(fn)`** — регистрация очистки внутри `watch`/`watchEffect` (например, отмена запроса при изменении источника):

```js
watch(userId, async (id) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort()); // вызовется при следующем срабатывании или остановке
  user.value = await fetchUser(id, { signal: controller.signal });
});
```

**`<Teleport defer>`** — телепортировать в цель, которая рендерится **позже** в том же шаблоне (раньше цель должна была существовать при монтировании):

```vue
<Teleport defer to="#modals"><Dialog /></Teleport>
<div id="modals"></div>
```

Также в 3.5:
- у `watch` опция `deep` принимает число — глубину отслеживания (`{ deep: 2 }`);
- наблюдатели можно приостанавливать: `const { pause, resume, stop } = watch(...)`;
- `defineCustomElement` получил `useHost()`, `useShadowRoot()`, опцию `shadowRoot: false`, поддержку `nonce` и общего `configureApp`.

### 5. Vue 3.5: SSR

**Ленивая гидратация** — асинхронный компонент гидратируется не сразу, а по стратегии:

```js
import { defineAsyncComponent, hydrateOnVisible, hydrateOnIdle, hydrateOnInteraction, hydrateOnMediaQuery } from 'vue';

const Comments = defineAsyncComponent({
  loader: () => import('./Comments.vue'),
  hydrate: hydrateOnVisible(), // гидратировать, когда блок появится во viewport
});
// hydrateOnIdle() — в свободное время браузера (requestIdleCallback)
// hydrateOnInteraction('click') — при первом взаимодействии
// hydrateOnMediaQuery('(max-width: 600px)') — по медиазапросу
```

Это «острова» внутри обычного Vue-приложения: меньше JavaScript выполняется при загрузке, лучше INP и TBT. В Nuxt доступно через префикс `Lazy` и `hydrate-*`-пропсы (см. [Nuxt](07-nuxt.md)).

**`data-allow-mismatch`** — разрешить ожидаемое расхождение сервера и клиента (например, дата в локальном формате) и не выводить предупреждение:

```vue
<span data-allow-mismatch="text">{{ new Date().toLocaleString() }}</span>
```

### 6. Vue 3.6: Vapor Mode и alien-signals

**Vapor Mode** — новый режим компиляции однофайловых компонентов **без Virtual DOM**. Шаблон компилируется в код, который создаёт DOM напрямую и привязывает каждое динамическое место к отдельному реактивному эффекту. Изменение значения обновляет конкретный узел без повторного вызова render-функции и без сравнения деревьев.

- По данным команды Vue, производительность на уровне Solid и Svelte 5 в независимом бенчмарке js-framework-benchmark, меньше базовый размер бандла.
- **Полностью opt-in**: атрибут `vapor` у `<script setup>`. Работает только с Composition API и `<script setup>`.
- Два способа использовать: приложение целиком через `createVaporApp` (минимальный бандл без VDOM-рантайма) или Vapor-компоненты внутри обычного приложения через `vaporInteropPlugin`.
- В бета-версии достигнут паритет с основными возможностями VDOM-режима. Исключение — `<Suspense>` в чистом Vapor-приложении (Vapor-компоненты можно рендерить внутри VDOM-`Suspense`).
- Рекомендация команды: разделять приложение на «зоны» одного режима и избегать глубокого смешивания; VDOM-библиотеки компонентов внутри Vapor могут работать с шероховатостями.

```vue
<script setup vapor>
import { ref } from 'vue';
const count = ref(0);
</script>
<template><button @click="count++">{{ count }}</button></template>
```

```js
import { createApp, vaporInteropPlugin } from 'vue';
createApp(App).use(vaporInteropPlugin).mount('#app'); // Vapor и VDOM компоненты вместе
```

**Новая реактивность.** Пакет `@vue/reactivity` в 3.6 переписан на основе библиотеки **alien-signals**: это уменьшает потребление памяти и ускоряет распространение изменений. API (`ref`, `computed`, `watch`) не меняется.

💡 На собеседовании: «Vue движется к fine-grained-реактивности, как Solid и Svelte 5, но без поломки экосистемы: Vapor — opt-in на уровне компонента, его можно включать точечно для тяжёлых страниц. На прод я бы брал его после стабильного релиза 3.6 и проверки совместимости UI-кита».

### 7. Экосистема (кратко)

- **Pinia 3** (2025) — только Vue 3, удалена поддержка Vue 2; API сторов не изменился. Подробно — [Стейт-менеджеры во Vue](08-state-managers.md).
- **Nuxt 4** (2025) — новая структура `app/`, изменения в data fetching. Подробно — [Nuxt](07-nuxt.md).
- **Vite** остаётся стандартной сборкой Vue-проектов; переход Vite на сборщик Rolldown разобран в [разделе инструментов](../10-tooling-testing/01-bundlers.md).

## Вопросы с собеседований

<details><summary>Что нового в Vue 3.5?</summary>

Переработка реактивности (−56 % памяти по данным команды Vue), стабильная реактивная деструктуризация пропсов с умолчаниями, `useTemplateRef`, `useId`, `onWatcherCleanup`, `<Teleport defer>`, числовой `deep` и `pause`/`resume` у `watch`, ленивая гидратация асинхронных компонентов (`hydrateOnVisible` и др.), `data-allow-mismatch`, улучшения Custom Elements. Ломающих изменений нет.
</details>

<details><summary>Как деструктуризация пропсов в 3.5 сохраняет реактивность?</summary>

Это работа компилятора `<script setup>`: обращения к деструктурированным переменным он переписывает в `props.x`. Поэтому в шаблоне, `computed` и `watchEffect` реактивность работает. Но при передаче значения наружу (в `watch` или composable) передаётся текущее значение, а не ссылка — нужно оборачивать в геттер: `watch(() => count, …)`.
</details>

<details><summary>Чем useTemplateRef лучше ref с тем же именем?</summary>

Раньше нужно было объявить `const input = ref(null)` с тем же именем, что и атрибут `ref` в шаблоне — связь была неявной. `useTemplateRef('key')` связывает явно по строке, работает с динамическими ключами и в composables, лучше типизируется (Volar выводит тип элемента).
</details>

<details><summary>Что такое ленивая гидратация и зачем она нужна?</summary>

SSR-страница приходит готовым HTML, но становится интерактивной только после гидратации, а гидратация всего дерева стоит дорого. Ленивая гидратация (Vue 3.5) откладывает гидратацию асинхронного компонента до события: видимости, простоя, взаимодействия или медиазапроса. Меньше JavaScript выполняется на старте — лучше INP и TBT.
</details>

<details><summary>Что такое Vapor Mode? Можно ли его использовать в проде?</summary>

Режим компиляции SFC без Virtual DOM: шаблон превращается в прямые операции с DOM, каждая динамическая часть — свой эффект. Производительность на уровне Solid/Svelte 5, меньше бандл. Включается атрибутом `vapor` у `<script setup>`, работает с Composition API, смешивается с VDOM через `vaporInteropPlugin`. На октябрь 2026 Vue 3.6 в стадии RC, поэтому в проде — точечно и после проверки, массово — после стабильного релиза.
</details>

<details><summary>Как отменить устаревший запрос в watch во Vue 3.5?</summary>

`onWatcherCleanup(() => controller.abort())` внутри колбэка `watch`: очистка вызовется при следующем срабатывании наблюдателя или его остановке. Раньше то же делали через третий аргумент колбэка `onCleanup`.
</details>

## Практика

### Предскажите поведение

**1.**
```vue
<script setup>
const { count = 0 } = defineProps(['count']);
watch(count, (v) => console.log('изменилось', v));
</script>
```
<details><summary>Ответ</summary>

Наблюдатель не сработает при изменении пропа, а компилятор выдаст предупреждение.
</details>
<details><summary>Почему так</summary>

Компилятор превращает `count` в `props.count`, то есть в `watch` уходит текущее **значение**, а не реактивный источник. Компилятор Vue ловит такие случаи и предупреждает. Правильно — `watch(() => count, …)`.
</details>

**2.**
```js
const Heavy = defineAsyncComponent({
  loader: () => import('./Heavy.vue'),
  hydrate: hydrateOnInteraction('click'),
});
// Что произойдёт с SSR-разметкой Heavy до первого клика?
```
<details><summary>Ответ</summary>

Разметка видна сразу (пришла с сервера), но обработчики не работают до первого клика.
</details>
<details><summary>Почему так</summary>

Компонент будет загружен и гидратирован при первом `click` внутри него. Само событие клика Vue воспроизведёт после гидратации.
</details>

### Задачи

**1. Обновите компонент до API Vue 3.5.**

```vue
<script setup>
import { ref, onMounted, watch } from 'vue';
const props = withDefaults(defineProps<{ query?: string; autofocus?: boolean }>(), {
  query: '',
  autofocus: false,
});
const inputEl = ref(null);
const results = ref([]);
onMounted(() => { if (props.autofocus) inputEl.value.focus(); });
watch(() => props.query, async (q, _old, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  results.value = await search(q, controller.signal);
});
</script>
<template>
  <input ref="inputEl" :value="query" />
</template>
```

<details><summary>Решение</summary>

```vue
<script setup lang="ts">
import { ref, onMounted, watch, useTemplateRef, onWatcherCleanup } from 'vue';

const { query = '', autofocus = false } = defineProps<{ query?: string; autofocus?: boolean }>();
const input = useTemplateRef<HTMLInputElement>('input');
const results = ref([]);

onMounted(() => {
  if (autofocus) input.value?.focus();
});

watch(() => query, async (q) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());
  results.value = await search(q, controller.signal);
});
</script>

<template>
  <input ref="input" :value="query" />
</template>
```

`withDefaults` заменён деструктуризацией с умолчаниями, ref элемента — `useTemplateRef`, очистка — `onWatcherCleanup`. `watch` получает геттер, потому что `query` после деструктуризации — значение.
</details>

**2. Доступное поле формы с SSR.**

Сделайте компонент `FormField` с `label` и `input`, связанными через `for`/`id`, корректно работающий при SSR без ошибок гидратации, даже если на странице несколько таких полей.

<details><summary>Решение</summary>

```vue
<script setup lang="ts">
import { useId } from 'vue';
const { label } = defineProps<{ label: string }>();
const model = defineModel<string>({ default: '' });
const id = useId();
</script>

<template>
  <label :for="id">{{ label }}</label>
  <input :id="id" v-model="model" />
</template>
```

`useId` генерирует одинаковый идентификатор на сервере и клиенте. `Math.random()` или счётчик в модуле дали бы ошибку гидратации или конфликт между запросами на сервере.
</details>

## Источники
- [Announcing Vue 3.5](https://blog.vuejs.org/posts/vue-3-5)
- [Announcing Vue 3.4](https://blog.vuejs.org/posts/vue-3-4)
- [Vue 3.6 — release notes (GitHub)](https://github.com/vuejs/core/releases)
- [Vue CHANGELOG](https://github.com/vuejs/core/blob/main/CHANGELOG.md)
- [vuejs.org — Lazy Hydration](https://vuejs.org/guide/components/async.html#lazy-hydration)
- [vuejs.org — Reactive Props Destructure](https://vuejs.org/guide/components/props.html#reactive-props-destructure)
- [alien-signals](https://github.com/stackblitz/alien-signals)
