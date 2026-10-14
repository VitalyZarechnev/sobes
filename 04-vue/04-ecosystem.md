# Экосистема: Pinia, Vue Router, Nuxt, VueUse, тестирование

> ⏱ ~2.5 ч · 🎯 Аргументированно выбирать и настраивать инструменты экосистемы: проектировать сторы на Pinia, роутинг с guards и code splitting, выбирать режимы рендеринга в Nuxt, использовать VueUse и выстроить тестирование на Vitest + Vue Test Utils.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Объясняю отличия Pinia от Vuex и пишу setup-store
- [ ] Знаю порядок навигационных guards и lazy-loading маршрутов
- [ ] Различаю режимы рендеринга Nuxt и `routeRules`, понимаю `useFetch`/`useAsyncData`
- [ ] Пишу компонентные тесты с `mount`, `flushPromises`, стабами и Pinia testing

## Теория

### Pinia

Официальный стор Vue (Vuex 5 «де-факто» стал Pinia). Vuex находится в режиме поддержки — для новых проектов рекомендуется Pinia.

| | Vuex 4 | Pinia |
|---|---|---|
| Структура | один стор + вложенные модули с namespace | множество независимых сторов |
| Мутации | обязательны (`commit`) | нет — меняем state в actions или напрямую |
| Actions | `dispatch('module/action')`, строки | обычные методы, async |
| TS | слабая типизация, строки | полный вывод типов без обвязки |
| Composition API | неудобно | нативно (setup stores) |
| DevTools | да | да (timeline, редактирование, time travel ограничен) |
| Размер | ~10 KB | ~1.5 KB |
| Code splitting | модули регистрируются вручную | стор подгружается вместе с использующим его кодом |

```ts
// stores/cart.ts — setup store (рекомендуемый стиль для Composition API)
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);                         // state
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0)); // getter

  function add(item: CartItem) {                              // action
    const existing = items.value.find(i => i.id === item.id);
    items.value = existing
      ? items.value.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      : [...items.value, { ...item, qty: 1 }];
  }

  async function checkout() {
    const user = useUserStore();                              // композиция сторов
    if (!user.isAuthenticated) throw new Error('Not authenticated');
    await api.checkout(items.value);
    items.value = [];
  }

  return { items, total, add, checkout };                     // всё, что вернули, — публичное (и для SSR/devtools)
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
```

Использование и ловушки:

```ts
const cart = useCartStore();
cart.add(item);

// 🪤 Деструктуризация стора теряет реактивность (стор — reactive)
const { total } = cart;                    // нереактивно
const { total: t, items } = storeToRefs(cart); // правильно для state/getters
const { add } = cart;                      // actions можно деструктурировать напрямую
```

Детали:
- Option store: `defineStore('id', { state: () => ({}), getters: {}, actions: {} })` — проще для переходящих с Vuex.
- `$patch` (объект или функция) — групповое изменение одной записью в devtools; `$reset` (только option store, для setup — писать самому); `$subscribe` (изменения state), `$onAction` (before/after/onError — для логирования и аналитики).
- **Plugins**: `pinia.use(({ store }) => {...})` — персистентность (`pinia-plugin-persistedstate`), логирование.
- **SSR**: сторы создаются на инстанс `pinia` на запрос (не модульный синглтон), state сериализуется в `pinia.state.value` и гидратируется. Все state-поля setup-стора должны быть возвращены, иначе не сериализуются.
- Стор вне компонента (в guard роутера, в API-слое): вызывать `useStore()` **после** `app.use(pinia)` — внутри функции, а не на верхнем уровне модуля.
- Для серверного состояния тот же принцип, что в React: не превращать Pinia в кэш API вручную — **TanStack Query для Vue** (`@tanstack/vue-query`) или **Pinia Colada**.

### Vue Router

```ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },          // lazy — отдельный чанк
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        { path: 'users/:id(\\d+)', name: 'user', component: () => import('@/pages/User.vue'), props: true },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFound.vue') },
  ],
  scrollBehavior: (to, from, saved) => saved ?? (to.hash ? { el: to.hash } : { top: 0 }),
});
```

**Навигационные guards** — полный порядок разрешения навигации:
1. Навигация инициирована.
2. `beforeRouteLeave` в покидаемых компонентах.
3. Глобальные `beforeEach`.
4. `beforeRouteUpdate` в переиспользуемых компонентах (тот же компонент, другие params).
5. `beforeEnter` в конфигурации маршрута.
6. Загрузка async-компонентов маршрута.
7. `beforeRouteEnter` в активируемых компонентах.
8. Глобальные `beforeResolve` (всё загружено — удобно для финальных проверок/прелоада данных).
9. Навигация подтверждена → глобальные `afterEach` → обновление DOM → колбэки `next` из `beforeRouteEnter`.

```ts
router.beforeEach(async to => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }; // return вместо next() (Router 4)
  }
  if (to.meta.roles && !to.meta.roles.some(r => auth.roles.includes(r))) return { name: 'forbidden' };
  // return undefined / true — продолжить; false — отменить
});
```

- В Router 4 guards возвращают значение (или промис) вместо вызова `next()` — меньше ошибок «next вызван дважды».
- Composition API: `onBeforeRouteLeave` (предупреждение о несохранённых изменениях), `onBeforeRouteUpdate`.
- `useRoute()` — реактивный объект маршрута; `useRouter()` — навигация. 🪤 Ловушка: при переходе `/user/1` → `/user/2` компонент **переиспользуется**, `setup` не вызывается заново — наблюдать `watch(() => route.params.id, ...)` или задать `:key="route.fullPath"` на `RouterView`.
- Типизация `meta` — через `declare module 'vue-router' { interface RouteMeta {...} }`; типизированные маршруты — `unplugin-vue-router` (file-based routing; функциональность переносится в ядро Vue Router 5).
- Lazy loading: `() => import()`; группировка чанков — через настройки бандлера (`manualChunks`). Guards — не место для тяжёлой загрузки данных без индикации; лучше loaders (Data Loaders RFC) или загрузка в компоненте с Suspense.
- Безопасность: клиентские guards — UX, а не защита. Авторизация данных — на сервере.

### Nuxt

Мета-фреймворк для Vue (аналог Next.js): SSR, file-based routing (`pages/`), автоимпорты, серверная часть на **Nitro** (`server/api/*`), модули, деплой на node/serverless/edge/статику.

Режимы рендеринга:
- **Universal (SSR)** — по умолчанию: HTML на сервере + гидратация, затем SPA-навигация.
- **Client-side (SPA)** — `ssr: false`.
- **SSG / prerender** — `nuxi generate` или `routeRules: { '/blog/**': { prerender: true } }`.
- **Hybrid rendering** через `routeRules` — режим для каждого маршрута:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },                 // SSG при сборке
    '/products/**': { swr: 3600 },            // SSR + кэш stale-while-revalidate на 1 ч
    '/blog/**': { isr: true },                // ISR (на платформах с поддержкой, напр. Vercel/Netlify)
    '/admin/**': { ssr: false },              // SPA
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
  },
});
```

- Также: **Nuxt Islands** (`<NuxtIsland>`, `.server.vue`-компоненты) — серверные компоненты без гидратации, аналог RSC; `<ClientOnly>`; ленивая гидратация (`hydrate-on-visible` и др., Nuxt 3.16+).

Загрузка данных:

```vue
<script setup lang="ts">
const route = useRoute();
const { data: product, status, error, refresh } = await useFetch(`/api/products/${route.params.id}`, {
  key: `product-${route.params.id}`,
  pick: ['id', 'title', 'price'],   // уменьшить payload
});
</script>
```

- `useFetch` / `useAsyncData` выполняются на сервере при SSR, результат передаётся в **payload** (`window.__NUXT__`) и **не перезапрашивается** при гидратации. Обычный `$fetch` в `setup` выполнится дважды (сервер + клиент).
- Ключ дедуплицирует и кэширует; `lazy: true` — не блокировать навигацию; `server: false` — только на клиенте.
- `useState` — SSR-безопасный разделяемый state (а не глобальный `ref` в модуле — он разделяется между запросами и утекает между пользователями).
- Middleware маршрутов (`middleware/auth.ts`), плагины, `runtimeConfig` (секреты только на сервере, `public` — на клиент).
- Nuxt 4 (2025): директория `app/`, улучшенный data fetching (общие ссылки на data по ключу, очистка), более строгие типы.

### VueUse

Коллекция 200+ composables: `useStorage`, `useDebounceFn`, `useIntersectionObserver`, `useEventListener`, `useMediaQuery`, `useDark`, `useClipboard`, `onClickOutside`, `useVirtualList`, `useWebSocket`, `computedAsync`, `refDebounced`, `useFetch` и др. SSR-безопасные, tree-shakable, принимают `MaybeRefOrGetter`. Хороший пример соглашений для собственных composables — стоит знать устройство пары из них.

### Тестирование

- **Vitest** — тест-раннер на Vite (тот же конфиг, ESM, TS из коробки, совместим с Jest API), jsdom/happy-dom или Browser Mode.
- **Vue Test Utils (VTU)** — `mount`/`shallowMount`, взаимодействие, проверка emits.
- **@testing-library/vue** — подход «как пользователь» поверх VTU (запросы по ролям).
- **@pinia/testing** — `createTestingPinia` со стабами actions.
- **MSW** — мок сети; **Playwright**/**Cypress** — e2e; **@nuxt/test-utils** — для Nuxt-окружения.

```ts
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, vi } from 'vitest';
import CartButton from './CartButton.vue';
import { useCartStore } from '@/stores/cart';

describe('CartButton', () => {
  it('добавляет товар и эмитит событие', async () => {
    const wrapper = mount(CartButton, {
      props: { product: { id: '1', title: 'Book', price: 10 } },
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
    });
    const cart = useCartStore();

    await wrapper.get('button').trigger('click');   // await — дождаться ререндера (nextTick)

    expect(cart.add).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    expect(wrapper.emitted('added')).toHaveLength(1);
  });

  it('показывает данные после загрузки', async () => {
    const wrapper = mount(ProductCard, { props: { id: '1' } });
    await flushPromises();                           // дождаться резолва промисов
    expect(wrapper.text()).toContain('Book');
  });
});
```

Нюансы:
- `trigger`, `setValue`, `setProps` возвращают промис `nextTick` — их нужно `await`.
- `flushPromises()` — для асинхронных операций (запросы).
- `shallowMount` стабит всех детей — быстрее, но тест «знает» о реализации; предпочтительнее `mount` + точечные `global.stubs` (например, для тяжёлых или `Teleport`).
- Компоненты с async `setup` тестировать внутри `<Suspense>` (обёртка `defineComponent` с Suspense) или через `mountSuspended` в Nuxt.
- Composables без жизненного цикла тестируются как функции; с `onMounted`/`inject` — через тестовый компонент-хост или `withSetup`-хелпер.
- Router в тестах: реальный `createRouter` с `createMemoryHistory` + `await router.isReady()`.

## Вопросы с собеседований

<details><summary>Почему Pinia, а не Vuex?</summary>

Нет мутаций (меньше boilerplate), полная типизация без обвязки, модульные независимые сторы (лучше code splitting), нативная поддержка Composition API, меньший размер, официальная рекомендация. Vuex — в режиме поддержки.
</details>

<details><summary>Как сохранить реактивность при деструктуризации стора Pinia?</summary>

`storeToRefs(store)` для state и getters; actions деструктурируются напрямую (они привязаны к стору).
</details>

<details><summary>Option store vs setup store?</summary>

Option — привычная структура state/getters/actions, есть `$reset`. Setup — полная гибкость Composition API (вотчеры, composables, `inject` внутри стора), нужно возвращать всё состояние для SSR/devtools, `$reset` пишется вручную.
</details>

<details><summary>Опишите порядок навигационных guards в Vue Router.</summary>

`beforeRouteLeave` → глобальные `beforeEach` → `beforeRouteUpdate` → `beforeEnter` маршрута → загрузка async-компонентов → `beforeRouteEnter` → глобальные `beforeResolve` → подтверждение → `afterEach` → обновление DOM.
</details>

<details><summary>Почему при смене параметра маршрута данные не перезагружаются?</summary>

Тот же компонент переиспользуется, `setup` не выполняется заново. Нужно наблюдать `route.params` (`watch` с `immediate`), использовать `onBeforeRouteUpdate`, или ключ на `RouterView` для принудительного ремоунта.
</details>

<details><summary>Какие режимы рендеринга есть в Nuxt?</summary>

Universal SSR, SPA, SSG/prerender и гибридный рендеринг через `routeRules` (prerender, swr, isr, ssr: false на уровне маршрутов). Плюс islands-компоненты и ленивая гидратация.
</details>

<details><summary>Почему в Nuxt нельзя использовать $fetch прямо в setup и глобальный ref для состояния?</summary>

`$fetch` в setup выполнится на сервере и повторно на клиенте при гидратации — двойной запрос и возможный mismatch; `useFetch`/`useAsyncData` передают результат в payload. Глобальный `ref` в модуле на сервере разделяется между всеми запросами — утечка данных между пользователями; нужно `useState` или Pinia.
</details>

<details><summary>mount vs shallowMount?</summary>

`mount` рендерит всё дерево — тест ближе к реальности. `shallowMount` стабит детей — изоляция и скорость, но хрупкость к рефакторингу и меньше уверенности. Предпочитать `mount` с точечными стабами.
</details>

<details><summary>Как тестировать компонент, использующий Pinia?</summary>

`createTestingPinia` в `global.plugins`: actions застаблены (`vi.fn`), начальное состояние задаётся `initialState`, getters можно переопределять. Для интеграционных тестов — реальная Pinia с `stubActions: false`.
</details>

<details><summary>Как организовать загрузку данных для страниц в Vue SPA?</summary>

Серверное состояние — `@tanstack/vue-query` или Pinia Colada (кэш, ревалидация, дедупликация). Загрузка — в компоненте или в guard `beforeResolve` с индикатором навигации; префетч на hover. Pinia — для клиентского состояния.
</details>

## Практика

**1. Спроектируй** auth-guard с проверкой ролей, редиректом на логин с возвратом и обработкой истёкшего токена.

<details><summary>Решение</summary>

`beforeEach`: если `requiresAuth` и нет сессии — `{ name: 'login', query: { redirect: to.fullPath } }`; если токен истёк — попытаться `await auth.refresh()` один раз, при неудаче — на логин; проверка ролей по `meta.roles`, иначе `forbidden`. После логина — `router.replace(validateRedirect(route.query.redirect))` (только внутренние пути, защита от open redirect). Типизировать `RouteMeta`.
</details>

**2. Напиши** setup-store `useTodosStore` с оптимистичным удалением и откатом.

<details><summary>Решение</summary>

```ts
export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([]);
  const error = ref<string | null>(null);

  async function remove(id: string) {
    const snapshot = todos.value;                       // иммутабельный снимок
    todos.value = todos.value.filter(t => t.id !== id); // оптимистично
    try {
      await api.deleteTodo(id);
    } catch (e) {
      todos.value = snapshot;                           // откат
      error.value = 'Не удалось удалить задачу';
      console.error('remove todo failed', e);
    }
  }
  return { todos, error, remove };
});
```

Обсудить гонки при нескольких параллельных удалениях (откат снимка вернёт и другие удалённые элементы — лучше откатывать точечно: вставить элемент обратно по индексу).
</details>

**3. Выбери** режим рендеринга в Nuxt для: лендинга, каталога из 100 000 товаров, личного кабинета, блога.

<details><summary>Решение</summary>

Лендинг — prerender. Каталог — SSR + `swr`/ISR (пререндер 100k страниц слишком долгий), on-demand инвалидация. Личный кабинет — `ssr: false` или SSR без кэша (персональные данные, нельзя кэшировать на CDN). Блог — prerender + перегенерация по вебхуку CMS.
</details>

## Источники
- https://pinia.vuejs.org/introduction.html
- https://pinia.vuejs.org/core-concepts/
- https://pinia.vuejs.org/cookbook/testing.html
- https://pinia.vuejs.org/ssr/
- https://router.vuejs.org/guide/advanced/navigation-guards.html
- https://router.vuejs.org/guide/advanced/lazy-loading.html
- https://router.vuejs.org/guide/advanced/composition-api.html
- https://nuxt.com/docs/guide/concepts/rendering
- https://nuxt.com/docs/getting-started/data-fetching
- https://nuxt.com/docs/getting-started/state-management
- https://vueuse.org/
- https://test-utils.vuejs.org/
- https://vitest.dev/guide/
- https://vuejs.org/guide/scaling-up/testing.html
