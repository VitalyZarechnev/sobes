# Вопросы и практика по Vue

> ⏱ ~2 ч · 🎯 Отвечать вслух на типовые и глубокие вопросы по Vue 3.5 за 1–2 минуты каждый и решать практические задачи: мини-реактивность на Proxy, composable `useFetch`, кастомный `v-model`.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Прогнал все 22 вопроса вслух
- [ ] Написал мини-реактивность на Proxy без подсказок за 25 минут
- [ ] Для каждой задачи проговорил крайние случаи и тесты

## Теория

### Как отвечать

Формула: **что это → как устроено → ловушка/trade-off → сравнение с React (если уместно)**. Интервьюеры по Vue любят спрашивать «как это работает внутри» — реактивность, компилятор, планировщик. Если вы пришли из React — будьте готовы объяснить разницу моделей без оценочности ([05](05-performance-and-vue-vs-react.md)).

Связанные страницы: [реактивность](01-reactivity.md), [Composition API](02-composition-api.md), [компоненты и рендеринг](03-components-and-rendering.md), [экосистема](04-ecosystem.md).

## Вопросы с собеседований

<details><summary>1. Как устроена реактивность Vue 3?</summary>

Proxy перехватывает get/set (а также has, deleteProperty, ownKeys). В get — `track`: активный эффект добавляется в Dep свойства (`WeakMap<target, Map<key, Dep>>`). В set — `trigger`: подписчики запускаются или ставятся в очередь планировщиком. Вложенные объекты оборачиваются лениво. `ref` — объект с get/set `value`. В 3.5 внутренняя реализация на версиях и связных списках.
</details>

<details><summary>2. Отличия реактивности Vue 2 и Vue 3.</summary>

Vue 2: `Object.defineProperty` на каждое поле, рекурсивно при инициализации; не видит добавление/удаление свойств и индексы массивов (`Vue.set`); нет Map/Set. Vue 3: Proxy — всё отслеживается, ленивая инициализация, поддержка коллекций, но прокси ≠ оригинал и нет IE11.
</details>

<details><summary>3. ref vs reactive.</summary>

`ref` — любые значения, `.value`, переприсваивание, безопасная передача и деструктуризация. `reactive` — только объекты, без `.value`, но теряет реактивность при деструктуризации и переприсваивании. Рекомендация — `ref` по умолчанию.
</details>

<details><summary>4. Как не потерять реактивность при деструктуризации?</summary>

`toRefs`/`toRef` для reactive, `storeToRefs` для Pinia, геттеры `() => obj.x` для передачи в composables; в 3.5 деструктуризация `defineProps` реактивна благодаря компилятору.
</details>

<details><summary>5. Как работает computed?</summary>

Ленивый эффект с dirty-флагом: при изменении зависимостей помечается грязным и уведомляет подписчиков; пересчёт — при чтении `.value`. Кэширует результат; с 3.4 не триггерит подписчиков, если значение не изменилось. Геттер должен быть чистым и синхронным.
</details>

<details><summary>6. watch vs watchEffect vs computed.</summary>

`computed` — производные значения. `watch` — побочные эффекты на явный источник, лениво, со старым значением. `watchEffect` — побочные эффекты с автосбором зависимостей, сразу, без старого значения, не отслеживает после `await`.
</details>

<details><summary>7. Что такое flush: 'pre' | 'post' | 'sync'?</summary>

Время вызова колбэка вотчера: до обновления DOM компонента (по умолчанию), после обновления (доступ к новому DOM), синхронно при каждом изменении (без батчинга).
</details>

<details><summary>8. Что такое nextTick?</summary>

Промис, резолвящийся после flush очереди планировщика. Обновления DOM батчатся и выполняются в микрозадаче; `nextTick` позволяет дождаться их.
</details>

<details><summary>9. Как компилятор оптимизирует шаблоны?</summary>

Кэширование/hoisting статических узлов, patch flags (битовая маска динамичных частей), block tree (плоский список динамических потомков), кэширование обработчиков, строковая сериализация статических фрагментов. Diff — только по динамическим привязкам.
</details>

<details><summary>10. Порядок хуков жизненного цикла родителя и детей.</summary>

Родитель setup → beforeMount → дети (setup → beforeMount → mounted) → родитель mounted. Обновление: родитель beforeUpdate → дети beforeUpdate/updated → родитель updated. Удаление: родитель beforeUnmount → дети → unmounted от детей к родителю.
</details>

<details><summary>11. Composition API vs Options API.</summary>

Composition — организация по фичам, composables, лучший TS, меньше бандл. Options — проще для новичков, структура «из коробки». Options реализован поверх Composition и поддерживается.
</details>

<details><summary>12. Почему composables лучше mixins?</summary>

Явный источник данных, нет коллизий имён (переименование при деструктуризации), явные параметры вместо неявной связи, полная типизация.
</details>

<details><summary>13. Как работает v-model на компоненте?</summary>

Prop `modelValue` + событие `update:modelValue`; именованные `v-model:x`; модификаторы в `xModifiers`. `defineModel()` (3.4+) генерирует всё это и возвращает ref.
</details>

<details><summary>14. Что такое scoped slots?</summary>

Слоты, получающие данные от ребёнка; в рантайме — функции, вызываемые дочерним компонентом. Аналог render props. Используются для гибких списков, таблиц, renderless-компонентов.
</details>

<details><summary>15. provide/inject vs Pinia.</summary>

provide/inject — DI для поддерева (конфигурация компонентной библиотеки, compound components, контекст формы). Pinia — глобальное состояние приложения с devtools, SSR-поддержкой, плагинами и доступом вне компонентов.
</details>

<details><summary>16. Pinia vs Vuex.</summary>

Нет мутаций, модульные сторы, типизация, Composition API, меньше размер. Vuex в режиме поддержки.
</details>

<details><summary>17. Навигационные guards и их порядок.</summary>

beforeRouteLeave → beforeEach → beforeRouteUpdate → beforeEnter → загрузка async-компонентов → beforeRouteEnter → beforeResolve → afterEach. В Router 4 возвращают значение вместо `next()`.
</details>

<details><summary>18. KeepAlive, Teleport, Suspense — для чего?</summary>

KeepAlive — кэш инстансов при переключении (хуки activated/deactivated, `max`). Teleport — рендер в другой DOM-узел с сохранением логической связи. Suspense (experimental) — ожидание async setup/async-компонентов с fallback.
</details>

<details><summary>19. Режимы рендеринга Nuxt и гидратация.</summary>

SSR (universal), SPA, SSG, гибридный через `routeRules` (prerender, swr, isr, ssr:false). `useFetch`/`useAsyncData` передают данные в payload, чтобы не перезапрашивать на клиенте. Hydration mismatch — от недетерминированного рендера. Ленивая гидратация и islands уменьшают JS.
</details>

<details><summary>20. Как оптимизировать большой список во Vue?</summary>

Виртуализация, стабильные минимальные пропсы, `shallowRef` для данных, `v-memo`, меньше вложенных компонентов на строку, computed вместо методов, пагинация.
</details>

<details><summary>21. Что такое Vapor Mode?</summary>

Компиляция без VDOM: прямые DOM-операции и точечные эффекты на каждую привязку. Opt-in, только `<script setup>`, совместим с обычными компонентами. Цель — производительность уровня Solid.
</details>

<details><summary>22. Главное отличие Vue от React.</summary>

Push-модель с автоматическим трекингом зависимостей и `setup` один раз против перезапуска функции компонента и сравнения результата. Следствия: во Vue почти не нужна мемоизация и нет массивов зависимостей, но есть ловушки потери реактивности; в React — иммутабельность и явность, concurrent rendering, RSC, но лишние ререндеры и сложность эффектов.
</details>

## Практика

**1. Мини-реактивность на Proxy.** Реализуйте `reactive`, `effect`, `computed`, `ref` так, чтобы работал пример. Поддержите динамические зависимости (отписка от старых при перезапуске) и отсутствие «глитчей» (эффект не должен видеть устаревший computed).

```ts
const state = reactive({ ok: true, a: 1, b: 2 });
const double = computed(() => state.a * 2);
effect(() => console.log(state.ok ? state.a : state.b, double.value)); // лог: 1 2
state.a = 5;      // лог: ?
state.ok = false; // лог: ?
state.a = 7;      // лог: ?
```

<details><summary>Решение</summary>

```ts
type Dep = Set<Effect>;
interface Effect {
  (): void;
  deps: Set<Dep>;
  onDirty?: (queue: Set<Effect>) => void; // есть только у computed
}

const targetMap = new WeakMap<object, Map<PropertyKey, Dep>>();
const proxyCache = new WeakMap<object, object>();
const effectStack: Effect[] = [];
let activeEffect: Effect | undefined;

function track(target: object, key: PropertyKey) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
  activeEffect.deps.add(dep);                 // обратная ссылка — для очистки
}

// Сначала собираем всех, кого нужно запустить (computed лишь помечаются dirty
// и транзитивно добавляют своих подписчиков), затем запускаем каждый эффект один раз.
function collect(dep: Dep | undefined, queue: Set<Effect>) {
  dep?.forEach(e => {
    if (e === activeEffect) return;           // защита от самовызова
    if (e.onDirty) e.onDirty(queue);
    else queue.add(e);
  });
}

function trigger(target: object, key: PropertyKey) {
  const queue = new Set<Effect>();
  collect(targetMap.get(target)?.get(key), queue);
  queue.forEach(e => e());
}

export function effect(fn: () => void, opts: { lazy?: boolean; onDirty?: Effect['onDirty'] } = {}): Effect {
  const runner: Effect = Object.assign(() => {
    runner.deps.forEach(dep => dep.delete(runner)); // зависимости пересобираются при каждом запуске
    runner.deps.clear();
    effectStack.push(runner);
    activeEffect = runner;
    try { fn(); }
    finally { effectStack.pop(); activeEffect = effectStack.at(-1); }
  }, { deps: new Set<Dep>(), onDirty: opts.onDirty });
  if (!opts.lazy) runner();
  return runner;
}

export function reactive<T extends object>(target: T): T {
  const cached = proxyCache.get(target);
  if (cached) return cached as T;
  const proxy = new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key);
      const v = Reflect.get(obj, key, receiver);
      return v !== null && typeof v === 'object' ? reactive(v) : v; // ленивая глубина
    },
    set(obj, key, value, receiver) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const old = Reflect.get(obj, key, receiver);
      const ok = Reflect.set(obj, key, value, receiver);
      if (!had || !Object.is(old, value)) trigger(obj, key);
      return ok;
    },
    deleteProperty(obj, key) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const ok = Reflect.deleteProperty(obj, key);
      if (had && ok) trigger(obj, key);
      return ok;
    },
  });
  proxyCache.set(target, proxy);
  return proxy;
}

export function ref<T>(initial: T) {
  let value = initial;
  const r = {
    get value() { track(r, 'value'); return value; },
    set value(v: T) { if (!Object.is(v, value)) { value = v; trigger(r, 'value'); } },
  };
  return r;
}

export function computed<T>(getter: () => T): { readonly value: T } {
  let cached!: T;
  let dirty = true;
  const obj = {
    get value() {
      if (dirty) { runner(); dirty = false; } // пересчёт лениво, при чтении
      track(obj, 'value');                    // читающий эффект подписывается на computed
      return cached;
    },
  };
  const runner = effect(() => { cached = getter(); }, {
    lazy: true,
    onDirty: queue => {
      if (dirty) return;
      dirty = true;
      collect(targetMap.get(obj)?.get('value'), queue); // уведомить подписчиков computed
    },
  });
  return obj;
}
```

Вывод: `1 2` → `5 10` → `2 10` → `2 14`. На `state.a = 7` эффект уже не зависит от `state.a` напрямую (ветка `ok` переключилась, зависимости пересобраны), но зависит от `double`, который стал dirty и добавил эффект в очередь. Благодаря двухфазному trigger (collect → run) эффект на `state.a = 5` запускается один раз и сразу видит свежий `double` — без промежуточного `5 2`.

Обсудить: планировщик с очередью в микрозадаче и `nextTick` (батчинг нескольких присваиваний), массивы (`length`, мутирующие методы), `ITERATE_KEY` для `for...in`/`Object.keys`, Map/Set, `readonly`/`shallowReactive`, `stop()` эффекта, `effectScope`, версионирование зависимостей в Vue 3.5.
</details>

**2. Composable `useFetch`** с реактивным URL, отменой, повтором и типизацией.

<details><summary>Решение</summary>

```ts
import { ref, shallowRef, watch, toValue, onScopeDispose, type MaybeRefOrGetter, type Ref } from 'vue';

interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
  refetch: () => Promise<void>;
  abort: () => void;
}

export function useFetch<T>(
  url: MaybeRefOrGetter<string | null>,
  options: { immediate?: boolean; parse?: (raw: unknown) => T } = {},
): UseFetchReturn<T> {
  const { immediate = true, parse = raw => raw as T } = options;
  const data = shallowRef<T | null>(null);   // ответ заменяется целиком — глубокая реактивность не нужна
  const error = shallowRef<Error | null>(null);
  const isLoading = ref(false);
  let controller: AbortController | null = null;

  const abort = () => controller?.abort();

  async function refetch() {
    const u = toValue(url);
    if (!u) return;
    abort();                                  // отменить предыдущий запрос — нет гонок
    const current = (controller = new AbortController());
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch(u, { signal: current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      data.value = parse(await res.json());   // parse — место для валидации (zod)
    } catch (e) {
      if (current.signal.aborted) return;
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      if (controller === current) isLoading.value = false;
    }
  }

  watch(() => toValue(url), () => { void refetch(); }, { immediate });
  onScopeDispose(abort);                       // отмена при размонтировании / остановке scope

  return { data, error, isLoading, refetch, abort };
}

// Использование
const props = defineProps<{ id: string }>();
const { data: user, error, isLoading } = useFetch<User>(() => `/api/users/${props.id}`);
```

Обсудить: SSR (в Nuxt — `useFetch`/`useAsyncData`), кэш и дедупликация (`@tanstack/vue-query`), retry с backoff, тесты с MSW + `flushPromises`.
</details>

**3. Кастомный `v-model`**: компонент `RatingInput` (1–5 звёзд) с `v-model`, модификатором `.half` (шаг 0.5) и вторым `v-model:hover`.

<details><summary>Решение</summary>

```vue
<script setup lang="ts">
import { computed } from 'vue';

const [rating, modifiers] = defineModel<number, 'half'>({
  default: 0,
  set: v => {
    const step = modifiers.half ? 0.5 : 1;
    return Math.min(5, Math.max(0, Math.round(v / step) * step)); // нормализация значения
  },
});
const hover = defineModel<number | null>('hover', { default: null });

const display = computed(() => hover.value ?? rating.value);

function onPointer(e: PointerEvent, star: number) {
  const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const half = modifiers.half && e.clientX - left < width / 2;
  return half ? star - 0.5 : star;
}
function onKeydown(e: KeyboardEvent) {
  const step = modifiers.half ? 0.5 : 1;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { rating.value = rating.value + step; e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { rating.value = rating.value - step; e.preventDefault(); }
}
</script>

<template>
  <div role="slider" tabindex="0" aria-label="Рейтинг" aria-valuemin="0" aria-valuemax="5"
       :aria-valuenow="rating" @keydown="onKeydown" @pointerleave="hover = null">
    <span v-for="star in 5" :key="star"
          :class="{ full: display >= star, half: display === star - 0.5 }"
          @pointermove="hover = onPointer($event, star)"
          @click="rating = onPointer($event, star)">★</span>
  </div>
</template>

<!-- Родитель -->
<!-- <RatingInput v-model.half="score" v-model:hover="preview" /> -->
```

Обсудить: что компилируется из `defineModel` (props `modelValue`, `modelModifiers`, `hover` + emits), uncontrolled-режим без `v-model`, доступность (`role="slider"`, клавиатура), тест: `mount` с `props: { modelValue: 3, 'onUpdate:modelValue': v => wrapper.setProps({ modelValue: v }) }`.
</details>

**4. Предскажи вывод.**

```ts
const state = reactive({ list: [1, 2, 3] });
watch(() => state.list, () => console.log('shallow'));
watch(() => state.list, () => console.log('deep'), { deep: true });
watch(state, () => console.log('reactive'));
state.list.push(4);
```

<details><summary>Решение</summary>

После flush: `deep`, `reactive`. Геттер `() => state.list` возвращает тот же массив — без `deep` изменение содержимого не триггерит колбэк. `watch(reactiveObj)` глубокий по умолчанию.
</details>

## Источники
- https://vuejs.org/guide/introduction.html
- https://vuejs.org/guide/extras/reactivity-in-depth.html
- https://vuejs.org/guide/essentials/watchers.html
- https://vuejs.org/guide/reusability/composables.html
- https://vuejs.org/guide/components/v-model.html
- https://vuejs.org/api/sfc-script-setup.html#definemodel
- https://pinia.vuejs.org/
- https://router.vuejs.org/
- https://nuxt.com/docs
