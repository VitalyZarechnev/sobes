# Composition API

> ⏱ ~2 ч · 🎯 Писать компоненты на `<script setup>` с корректной типизацией, проектировать composables как основную единицу переиспользования, понимать, во что компилируются макросы, и аргументированно сравнивать с Options API и mixins.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, во что компилируется `<script setup>` и почему `setup()` вызывается один раз
- [ ] Использую `defineProps`/`defineEmits`/`defineModel`/`defineExpose`/`defineSlots` с TS
- [ ] Пишу composables по соглашениям (`MaybeRefOrGetter`, `toValue`, cleanup)
- [ ] Использую `provide`/`inject` с `InjectionKey`

## Теория

### setup(): вызывается один раз

Ключевое отличие от React: `setup()` — **конструктор** компонента, выполняется **один раз** при создании инстанса. Повторные рендеры вызывают только render-функцию (скомпилированный шаблон). Поэтому:
- нет stale closures в привычном React-смысле — колбэки замыкают refs, а не значения;
- нет нужды в `useCallback`/`useMemo` для стабилизации ссылок;
- нет «правил хуков» по порядку — composables можно вызывать в условиях (но синхронно, до первого `await`, чтобы хуки жизненного цикла привязались к текущему инстансу).

```ts
// Options-подобная запись с setup()
export default defineComponent({
  props: { initial: { type: Number, default: 0 } },
  emits: ['change'],
  setup(props, { emit, slots, attrs, expose }) {
    const count = ref(props.initial);
    const inc = () => { count.value++; emit('change', count.value); };
    expose({ reset: () => (count.value = 0) });
    return { count, inc }; // доступно в шаблоне
  },
});
```

🪤 Ловушка: `await` в `setup()` до регистрации `onMounted`/`watch` — после `await` текущий инстанс потерян (`getCurrentInstance()` → null), хуки не зарегистрируются (Vue предупредит), а вотчеры не остановятся автоматически. Компилятор `<script setup>` восстанавливает контекст после `await` на верхнем уровне, но не во вложенных функциях. Компонент с top-level `await` становится async и требует `<Suspense>`.

### `<script setup>`

Синтаксический сахар, компилируется в `setup()`, возвращающую render-функцию (inline-шаблон в продакшене): все объявления верхнего уровня доступны в шаблоне, меньше кода, лучше TS-инференс, быстрее рантайм (нет прокси-контекста рендера).

```vue
<script setup lang="ts">
import { computed } from 'vue';
import UserCard from './UserCard.vue'; // импорт = регистрация компонента

const props = withDefaults(defineProps<{
  users: User[];
  pageSize?: number;
}>(), { pageSize: 20 });

// 3.5: можно деструктурировать с дефолтами — реактивность сохраняется
// const { users, pageSize = 20 } = defineProps<{ users: User[]; pageSize?: number }>();

const emit = defineEmits<{
  select: [user: User];         // синтаксис именованных кортежей (3.3+)
  'page-change': [page: number];
}>();

const visible = computed(() => props.users.slice(0, props.pageSize));
</script>

<template>
  <UserCard v-for="u in visible" :key="u.id" :user="u" @click="emit('select', u)" />
</template>
```

Макросы компилятора (не импортируются, существуют только в `<script setup>`):
- `defineProps` / `withDefaults` — типы из TS-интерфейса компилируются в runtime-декларацию props (с 3.3 поддерживаются импортированные типы и простые условные).
- `defineEmits` — типизированные события.
- `defineModel` (стабилен с 3.4) — двусторонняя привязка, см. ниже.
- `defineExpose` — компоненты с `<script setup>` **закрыты** по умолчанию; родитель через template ref видит только то, что выставлено явно.
- `defineSlots` — типизация слотов.
- `defineOptions` — `name`, `inheritAttrs` и т.п. без второго `<script>`.

### defineModel

```vue
<!-- MyInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true });
const [title, modifiers] = defineModel<string, 'trim' | 'capitalize'>('title', {
  set(value) {
    return modifiers.capitalize ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  },
});
</script>

<template>
  <input v-model="model" />
  <input v-model="title" />
</template>

<!-- Родитель -->
<MyInput v-model="name" v-model:title.capitalize="pageTitle" />
```

`defineModel` компилируется в prop `modelValue` + emit `update:modelValue` и локальный ref, синхронизированный с пропом. Если родитель не передал `v-model`, ref работает как локальное состояние (uncontrolled-режим). Подробнее о `v-model` — в [03](03-components-and-rendering.md).

🪤 Ловушка: мутировать объект, пришедший в `v-model` (`model.value.name = 'x'`) — это мутация пропа родителя в обход события. Эмитить новый объект: `model.value = { ...model.value, name: 'x' }`.

### Composables vs mixins

Mixins (Options API) — слияние опций из нескольких объектов. Проблемы:
1. **Неясный источник свойств**: в шаблоне `this.loading` — из какого из пяти миксинов?
2. **Коллизии имён**: два миксина с `data.loading` молча перезаписывают друг друга.
3. **Неявная связь**: миксин рассчитывает на свойство, которое объявлено в компоненте или другом миксине.
4. Плохая типизация.

Composable — функция, использующая Composition API и возвращающая reactive-состояние. Решает всё перечисленное: явный импорт, деструктуризация с переименованием, явные аргументы, полная типизация.

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  const update = (e: MouseEvent) => { x.value = e.pageX; y.value = e.pageY; };
  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));
  return { x, y }; // объект refs — деструктурируется без потери реактивности
}

const { x: mouseX } = useMouse(); // переименование при коллизии
```

Соглашения для composables:
- Имя `useXxx`. Вызывать синхронно в `setup`.
- Входные параметры — `MaybeRefOrGetter<T>`, нормализовать через `toValue()` внутри `watchEffect`/`computed` — так composable принимает и значение, и ref, и геттер.
- Возвращать **plain-объект с refs** (не `reactive`), чтобы потребитель мог деструктурировать.
- Очищать побочные эффекты (`onUnmounted`, `onScopeDispose` — работает и вне компонентов в `effectScope`).
- SSR: DOM-доступ только в `onMounted`.

```ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue';

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);

  watchEffect(onCleanup => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    const u = toValue(url);               // зависимость отслеживается до await
    loading.value = true;
    error.value = null;
    fetch(u, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<T>; })
      .then(d => { data.value = d; })
      .catch(e => { if (!controller.signal.aborted) error.value = e instanceof Error ? e : new Error(String(e)); })
      .finally(() => { if (!controller.signal.aborted) loading.value = false; });
  });

  return { data, error, loading };
}
```

Composables vs React-хуки: похожи по назначению, но composable вызывается **один раз**, возвращает живые refs и не зависит от порядка вызова. Нет dependency arrays — зависимости отслеживаются автоматически.

Renderless-компоненты (scoped slots) — альтернатива для переиспользования логики **с разметкой**, но composables эффективнее (нет лишнего инстанса компонента).

### provide / inject

Dependency injection вниз по дереву (аналог React Context), но **без ререндера всех потребителей**: если провайдить ref/reactive, обновятся только те, кто реально читает изменившееся значение.

```ts
// keys.ts
import type { InjectionKey, Ref } from 'vue';
export interface ThemeCtx { theme: Readonly<Ref<'light' | 'dark'>>; toggle: () => void }
export const ThemeKey: InjectionKey<ThemeCtx> = Symbol('theme');

// Provider
const theme = ref<'light' | 'dark'>('light');
provide(ThemeKey, { theme: readonly(theme), toggle: () => (theme.value = theme.value === 'light' ? 'dark' : 'light') });

// Consumer
const ctx = inject(ThemeKey);
if (!ctx) throw new Error('ThemeKey provider is missing');
```

Рекомендации:
- `InjectionKey<T>` (Symbol) для типобезопасности и избежания коллизий.
- Провайдить `readonly` состояние + функции-мутаторы: изменения централизованы у провайдера.
- `app.provide()` — для глобальных значений (плагины так и делают: router, i18n, pinia).
- Значение по умолчанию — `inject(key, defaultValue)` или фабрика `inject(key, () => new X(), true)`.
- Для общего состояния за пределами поддерева — Pinia.

### Типизация с TypeScript

```ts
// Типизированные template refs (3.5: useTemplateRef)
const input = useTemplateRef<HTMLInputElement>('input'); // <input ref="input">
onMounted(() => input.value?.focus());

// Ref на компонент
const modal = useTemplateRef<InstanceType<typeof Modal>>('modal');

// Генерик-компоненты (3.3+)
```

```vue
<script setup lang="ts" generic="T extends { id: string | number }">
defineProps<{ items: T[]; selected?: T }>();
defineEmits<{ select: [item: T] }>();
defineSlots<{ item(props: { item: T; index: number }): any }>();
</script>
```

- Проверка типов в SFC — `vue-tsc` (в CI), IDE — Vue (Official) extension (Volar).
- Глобальные свойства и компоненты — augment `ComponentCustomProperties` / `GlobalComponents` в `declare module 'vue'`.
- `PropType<T>` — для runtime-деклараций в Options API.
- 3.5 также добавил `useId()` (SSR-стабильные id) и `onWatcherCleanup()`.

### Options API: актуален ли?

Options API поддерживается и не будет удалён; это слой поверх Composition API. Для новых проектов и библиотек — Composition API: лучше организация кода по фичам (а не по опциям `data/methods/computed`), переиспользование, TS, tree-shaking (можно собрать без Options API флагом `__VUE_OPTIONS_API__: false`).

## Вопросы с собеседований

<details><summary>Чем Composition API лучше Options API?</summary>

Группировка кода по логическим фичам, а не по типам опций; переиспользование через composables вместо mixins; полноценный вывод типов; меньше бандл и лучше минификация (переменные вместо `this.x`). Options API проще для новичков и небольших компонентов; это не «устаревший» API.
</details>

<details><summary>Какие проблемы mixins решают composables?</summary>

Неясный источник свойств, коллизии имён, неявные зависимости между миксинами и компонентом, плохая типизация. Composable — явный вызов функции, явные аргументы, переименование при деструктуризации, полная типизация.
</details>

<details><summary>Что такое <script setup> и во что компилируется?</summary>

Сахар над `setup()`: объявления верхнего уровня доступны в шаблоне, макросы (`defineProps` и т.д.) обрабатываются компилятором, шаблон в продакшене инлайнится как render-функция в замыкании setup — доступ к переменным напрямую, без прокси. Компонент закрыт по умолчанию (`defineExpose`).
</details>

<details><summary>Как работает defineModel?</summary>

Макрос объявляет prop `modelValue` (или именованный) и emit `update:*`, возвращает ref: чтение — значение пропа, запись — эмит события. Если родитель не передал v-model — работает как локальный state. Поддерживает модификаторы и трансформации get/set.
</details>

<details><summary>Почему setup вызывается один раз и что это даёт по сравнению с React-хуками?</summary>

Реактивность отслеживает зависимости сама, поэтому повторно выполнять логику компонента на каждый рендер не нужно — повторяется только render-функция. Итог: нет stale closures, нет массивов зависимостей, нет `useCallback`, нет правил порядка хуков.
</details>

<details><summary>Чем provide/inject отличается от React Context?</summary>

Значение — обычно реактивный ref/объект; при изменении обновляются только компоненты, читающие изменённое свойство, а не все потребители. Нет провайдера-компонента в разметке. Не реактивен сам по себе, если провайдить примитив (нужен ref).
</details>

<details><summary>Как правильно писать composable, принимающий аргумент, который может меняться?</summary>

Тип `MaybeRefOrGetter<T>`, внутри `toValue(arg)` в `watchEffect`/`computed` или `watch(() => toValue(arg))`. Вызывающий передаёт ref или геттер `() => props.id`, а не значение.
</details>

<details><summary>Что произойдёт при await в setup?</summary>

Компонент становится async — требуется `<Suspense>` у предка. Хуки жизненного цикла и вотчеры, зарегистрированные после `await` во вложенных функциях, не привяжутся к инстансу. `<script setup>` восстанавливает контекст для top-level await.
</details>

<details><summary>Как типизировать emits, slots и generic-компоненты?</summary>

`defineEmits<{ name: [arg: T] }>()`, `defineSlots<{ default(props: {...}): any }>()`, `<script setup generic="T">`. Проверка в CI — `vue-tsc --noEmit`.
</details>

## Практика

**1. Перепиши mixin на composable.** Mixin `paginationMixin` с `data: { page, pageSize }`, `computed: { offset }`, `methods: { next, prev }`.

<details><summary>Решение</summary>

```ts
export function usePagination(total: MaybeRefOrGetter<number>, pageSize = 20) {
  const page = ref(1);
  const pages = computed(() => Math.max(1, Math.ceil(toValue(total) / pageSize)));
  const offset = computed(() => (page.value - 1) * pageSize);
  const next = () => { if (page.value < pages.value) page.value++; };
  const prev = () => { if (page.value > 1) page.value--; };
  watch(pages, p => { if (page.value > p) page.value = p; }); // total уменьшился
  return { page, pages, offset, next, prev };
}
```
</details>

**2. Реализуй** `useEventListener(target, event, handler)` с автоматической отпиской и поддержкой ref-цели.

<details><summary>Решение</summary>

```ts
export function useEventListener<K extends keyof WindowEventMap>(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  const stop = watch(() => toValue(target), (el, _old, onCleanup) => {
    if (!el) return;
    el.addEventListener(event, handler as EventListener, options);
    onCleanup(() => el.removeEventListener(event, handler as EventListener, options));
  }, { immediate: true, flush: 'post' });
  onScopeDispose(stop); // остановить и отписаться при уничтожении scope
  return stop;
}
```
</details>

**3. Типизированный inject.** Сделайте `useTheme()`, бросающий понятную ошибку без провайдера.

<details><summary>Решение</summary>

```ts
export function useTheme(): ThemeCtx {
  const ctx = inject(ThemeKey, null);
  if (!ctx) throw new Error('useTheme() requires <ThemeProvider> above in the tree');
  return ctx;
}
```
</details>

## Источники
- https://vuejs.org/guide/extras/composition-api-faq.html
- https://vuejs.org/api/sfc-script-setup.html
- https://vuejs.org/api/composition-api-setup.html
- https://vuejs.org/guide/reusability/composables.html
- https://vuejs.org/guide/components/provide-inject.html
- https://vuejs.org/guide/components/v-model.html
- https://vuejs.org/guide/typescript/composition-api.html
- https://vuejs.org/api/composition-api-helpers.html
- https://blog.vuejs.org/posts/vue-3-5
