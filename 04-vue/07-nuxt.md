# Nuxt: архитектура, рендеринг, данные, SSR-ловушки

> ⏱ ~4 ч · 🎯 Объяснить, как Nuxt устроен изнутри (Vue + Vite + Nitro), осознанно выбрать стратегию рендеринга для каждого маршрута, правильно загружать данные без двойных запросов и утечек состояния между запросами, аргументированно сравнить Nuxt с Next.js и сказать, когда Nuxt не нужен.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Краткий обзор — в [Экосистеме](04-ecosystem.md#nuxt), здесь — углубление

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю структуру Nuxt 4 (`app/`, `server/`, `shared/`) и почему её поменяли
- [ ] Объясняю жизненный цикл SSR-запроса: Nitro → рендер Vue → payload → гидратация
- [ ] Выбираю `prerender` / `swr` / `isr` / `ssr: false` через `routeRules` и понимаю, где живёт кэш
- [ ] Знаю семантику ключей `useAsyncData`/`useFetch`: общие refs, `dedupe`, `getCachedData`, очистка
- [ ] Нахожу и чиню ошибки гидратации, применяю ленивую гидратацию
- [ ] Не допускаю cross-request state pollution; правильно храню секреты в `runtimeConfig`

## Теория

### Версии: что актуально (октябрь 2026)

| Версия | Статус по nuxt.com/blog |
|---|---|
| **Nuxt 4.x** | текущая мажорная; 4.0 — июль 2025, последняя минорная — **4.6** (октябрь 2026) |
| Nuxt 3.x | **EOL 31.07.2026** (изначально объявляли 31.01.2026, продлили в посте 4.3) |
| Nuxt 5 | в разработке; поведение включается заранее через `future.compatibilityVersion: 5` (с 4.2+). Главное отличие — **Nitro v3 + h3 v2** |
| Nitro | v2 — в Nuxt 4; v3 — public beta, войдёт в Nuxt 5 |

Что важно знать про минорные 4.x (по блогу): 4.2 — `AbortSignal` в data fetching, `timeout`; 4.3 — `appLayout` в `routeRules`; 4.4 — фабрики `createUseFetch`/`createUseAsyncData`, vue-router v5; 4.5 — Vite 8, экспериментальный SSR streaming, опция `enabled` в `useAsyncData`; 4.6 — `nuxt/server` (серверный код, независимый от h3/Nitro), типизированный `$fetch` на `fetchdts`, сессии через `useSession` + `runtimeConfig.appSecret`, опт-ин Vue Vapor, опции `serialize`/`middleware` в `useAsyncData`.

💡 На собеседовании: называйте версию, к которой относится утверждение. «В Nuxt 4 `data` по умолчанию `undefined` и это `shallowRef`» — сильнее, чем «useFetch возвращает ref».

### Архитектура: Nuxt = Vue + Vite + Nitro

```
            nuxt build
               │
   ┌───────────┴────────────┐
   ▼                        ▼
Vite (client bundle)     Vite (server bundle Vue-приложения)
   │                        │
   │                        ▼
   │                  Nitro (сервер: server/api, server/middleware,
   │                         routeRules, кэш, storage, preset)
   ▼                        ▼
.output/public          .output/server/index.mjs  ← standalone, без node_modules
```

- **Vue 3** — UI и `renderToString`/стриминг на сервере.
- **Vite** (по умолчанию; есть альтернативы — Rspack, webpack) — два бандла: клиентский и серверный.
- **Nitro** — серверный движок на **h3**: API-роуты, server middleware, кэширующий слой (`swr`/`isr` реализованы через него), KV storage, задачи, prerender. Собирает **standalone** `.output/`, не требующий `node_modules`, и адаптирует его под платформу через **preset** (node-server, vercel, netlify, cloudflare, deno, bun и т.д. — на nitro.build перечислено 25+ провайдеров).
- **Direct API calls**: `$fetch('/api/x')` на сервере не делает HTTP-запрос, а напрямую вызывает обработчик Nitro — минус сетевой хоп при SSR.
- **unjs-экосистема**: `ofetch` (`$fetch`), `h3`, `unstorage`, `defu`, `destr` — Nuxt собран из независимых библиотек.

Жизненный цикл SSR-запроса (Nuxt 4):
1. Nitro принимает запрос → server middleware (`server/middleware/*`, на **каждый** запрос) → `routeRules` (редирект, кэш, заголовки).
2. Если это страница — создаётся **новый** экземпляр Vue-приложения и `nuxtApp` на запрос → плагины (`app/plugins`) → route middleware → `setup()` страниц, где `useAsyncData` ждёт данные.
3. HTML рендерится, данные и `useState` сериализуются в **payload** (`devalue`, поддерживает `Date`, `Map`, `Set`, refs, `NuxtError`) и встраиваются в страницу.
4. Клиент: загрузка JS → плагины → **гидратация**, `useAsyncData` берёт данные из `useNuxtApp().payload`, не перезапрашивая. В Nuxt 4 `window.__NUXT__` удаляется после гидратации — доступ только через `useNuxtApp().payload`.
5. Дальше — SPA-навигация; для prerender/`swr`/`isr`-маршрутов клиент может брать `_payload.json` вместо повторного запроса данных.

### Структура директорий Nuxt 4

```sh
app/                    # srcDir по умолчанию (Nuxt 4); алиас ~ указывает сюда
  assets/ components/ composables/ layouts/ middleware/ pages/ plugins/ utils/
  app.vue  app.config.ts  error.vue  router.options.ts
server/                 # Nitro: api/ routes/ middleware/ plugins/ utils/
shared/                 # код для app и server: автоимпорт shared/utils и shared/types
public/  layers/  modules/  content/
nuxt.config.ts          # один tsconfig.json в корне
```

Зачем переехали в `app/` (из upgrade guide): (1) **производительность** — file watchers не сканируют `node_modules/` и `.git/` (особенно заметно на Windows/Linux); (2) **типобезопасность** — `server/` и приложение работают в разных контекстах с разными глобальными автоимпортами, поэтому Nuxt 4 генерирует **отдельные TS-проекты** для app, server, shared и builder-кода. Миграция не обязательна: старая структура определяется автоматически; есть codemod `nuxt/4/file-structure`.

🪤 Ловушка: в `shared/` нельзя импортировать Vue- или Nitro-специфичный код — он должен работать в обоих окружениях (валидация, типы, форматтеры).

### Авто-импорты: плюсы и минусы

Автоимпортируются Vue API (`ref`, `computed`, `watch`...), composables Nuxt, файлы из `app/components`, `app/composables`, `app/utils`, на сервере — `server/utils` (и `shared/utils|types` в обоих).

| Плюсы | Минусы |
|---|---|
| Меньше бойлерплейта, типы генерируются в `.nuxt/` | «Магия»: неочевидно, откуда символ, сложнее ревью и онбординг |
| Tree-shaking: в бандл попадает только используемое | Коллизии имён (две `useUser` в разных слоях/модулях) |
| Ленивые компоненты префиксом `Lazy` | Код хуже переносится вне Nuxt (тесты, библиотеки) |
| Единый реестр `#imports` для явного импорта | Composables автоимпортируются только с верхнего уровня `composables/` (вложенные — через `index.ts` или настройку `imports.dirs`) |

Режим «строже»: `imports: { scan: false }` (не сканировать свои директории, оставить Vue/Nuxt API) или `imports: { autoImport: false }` + явный `import { ref } from '#imports'`. В крупных командах часто выбирают явные импорты для своего кода. В Nuxt 5 (и в 4.6 при `compatibilityVersion: 5`) серверные автоимпорты Nitro отключаются — хелперы импортируются из `nuxt/server`.

**Контекст Nuxt.** Composables вроде `useRuntimeConfig`, `useState`, `useNuxtApp` работают только синхронно внутри `setup`, плагина или route middleware: `nuxtApp` хранится в глобальной переменной ровно на время синхронного вызова — именно это защищает от смешивания запросов на сервере. После `await` контекст теряется везде, кроме `<script setup>`, `defineNuxtComponent`, `defineNuxtPlugin`, `defineNuxtRouteMiddleware` (там компилятор восстанавливает контекст). Ошибка `Nuxt instance is unavailable` — признак вызова вне контекста (например, на верхнем уровне модуля).

### Роутинг, layouts, middleware, плагины, модули

**Файловый роутинг** (`app/pages`, поверх vue-router; в 4.4 — vue-router v5):

```
pages/index.vue              → /
pages/users/[id].vue         → /users/:id
pages/users/[[tab]].vue      → /users/:tab?  (опциональный параметр)
pages/[...slug].vue          → catch-all
pages/(marketing)/about.vue  → /about        (группа маршрутов, не влияет на URL)
pages/parent.vue + parent/   → вложенные маршруты, <NuxtPage /> в родителе
```

`definePageMeta({ layout, middleware, key, keepalive, alias, validate })` — макрос, статически извлекается при сборке (поэтому значения должны быть сериализуемыми/статическими).

**Layouts** — `app/layouts/*.vue` со `<slot />`, в `app.vue` — `<NuxtLayout><NuxtPage /></NuxtLayout>`. Выбор: `definePageMeta({ layout: 'admin' })`, динамически `setPageLayout()`, с **4.3** — централизованно `routeRules: { '/admin/**': { appLayout: 'admin' } }`.

**Route middleware** (`app/middleware`, работают во Vue-части, это навигационные guards): inline в `definePageMeta`, именованные (`auth.ts`) и глобальные (`*.global.ts`). Порядок: глобальные (по алфавиту, можно управлять префиксами `01.`) → middleware страницы в порядке массива. Нет `next()` — возвращают `navigateTo()` (на сервере 302, можно `redirectCode: 301`) или `abortNavigation()`. Выполняются **и на сервере при первом рендере, и на клиенте** при навигации; для пропуска — `import.meta.server`/`import.meta.client` или `routeRules.appMiddleware`.

🪤 Ловушка: route middleware ≠ server middleware. Защита API делается в `server/` — клиентский guard обходится прямым запросом.

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession(); // ваш composable на useState/useCookie
  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
});
```

**Плагины** (`app/plugins`) выполняются **до** создания корневого компонента, последовательно, на сервере и клиенте (суффиксы `.client.ts`/`.server.ts`). Объектный синтаксис: `enforce: 'pre' | 'post'`, `parallel: true` (не ждать завершения перед следующим), `dependsOn: ['other']`, `hooks`. `provide` → `nuxtApp.$name`. Каждый плагин удлиняет TTI и гидратацию — «Overusing plugins» в разделе Performance официальной документации назван типичной проблемой.

**Модули** (`modules/` локально или npm, `defineNuxtModule` из `@nuxt/kit`) работают **на этапе сборки**: добавляют плагины, компоненты, серверные обработчики, автоимпорты, меняют конфиг Vite/Nitro через хуки. Плагин = рантайм приложения, модуль = build-time расширение. **Layers** (`extends`) — переиспользование целого куска приложения (дизайн-система, базовый layout, общие composables) между проектами.

### Рендеринг: универсальный, CSR, SSG, гибридный

| Режим | Как включить | Где HTML | Когда |
|---|---|---|---|
| Universal SSR (по умолчанию) | — | сервер на каждый запрос + гидратация | контент, e-commerce, SEO |
| CSR / SPA | `ssr: false` (глобально или в `routeRules`) | браузер | админки, SaaS за логином |
| SSG | `nuxt generate` / `prerender: true` | при сборке | лендинги, документация, блог |
| SWR | `routeRules: { swr: 3600 }` | сервер, кэш Nitro (или reverse proxy) | каталоги, редко меняющиеся страницы |
| ISR | `routeRules: { isr: 3600 \| true }` | как SWR, но кэш на CDN платформы (**Netlify, Vercel**) | то же на этих платформах |
| Edge (ESR) | Nitro preset: `vercel-edge`, `netlify-edge`, Cloudflare | на edge-узле CDN | низкая латентность для гео-распределённых пользователей |

```ts
// nuxt.config.ts (Nuxt 4)
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },              // фон. перегенерация после TTL
    '/blog/**': { isr: true },                  // на CDN до следующего деплоя
    '/admin/**': { ssr: false, appLayout: 'admin' },
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
    '/old': { redirect: { to: '/new', statusCode: 301 } },
    '/landing': { noScripts: true },            // без JS-бандла Nuxt
  },
});
```

Нюансы для senior/lead:
- `swr: true` — заголовок `stale-while-revalidate` без max-age; число — TTL в секундах. Кэш `node-server` пресета хранится в storage Nitro (по умолчанию — память процесса): **при горизонтальном масштабировании у каждого инстанса свой кэш** — нужен общий storage-драйвер (Redis и т.п.) или CDN.
- `isr: true` — до следующего деплоя. Для `isr`/`swr` генерируются `_payload.json` рядом с HTML — клиентская навигация берёт данные из них.
- Правила по возможности транслируются в нативные правила платформы (Netlify, Vercel).
- **Гибридный режим недоступен при `nuxt generate`** — нужен сервер (или платформа).
- `ssr: false` на маршруте исключает компонент страницы из серверного бандла (если это вычислимо на этапе сборки).
- 🪤 Ловушка: кэшировать **персонализированные** страницы через `swr`/`isr` нельзя — ответ одного пользователя уйдёт другому. Ключ кэша — URL, не cookie.

**Server Components / Islands**: `*.server.vue` и `<NuxtIsland>` рендерятся только на сервере, их JS не попадает в клиент (аналог RSC по эффекту, но точечный и opt-in). **Vue Vapor** (4.6, опт-ин, Vue `^3.6`): атрибут `vapor` у `<script setup>` для отдельных компонентов — без VDOM.

### Гидратация и её ошибки

Гидратация — «оживление» серверного HTML: Vue проходит по DOM, привязывает обработчики и реактивность, ожидая **ту же** разметку. При расхождении (hydration mismatch) Vue патчит DOM — в официальной документации это описано как риск перерендера дерева, мигания, «мёртвых» обработчиков и разного контента для поисковика и пользователя.

| Причина | Исправление |
|---|---|
| `localStorage`, `window` в `setup` | `useCookie` (доступен и на сервере), `onMounted`, `<ClientOnly>` |
| `Math.random()`, `Date.now()`, `new Date().getHours()` | `useState('k', () => Math.random())` — значение уходит в payload; `<NuxtTime>` |
| Разметка по `window.innerWidth` | CSS media queries вместо `v-if` |
| Сторонние скрипты, меняющие DOM (тег-менеджеры) | инициализация в `onMounted` / `@nuxt/scripts` |
| Невалидный HTML (`<div>` в `<p>`, `<a>` в `<a>`) | браузер «чинит» DOM, и он расходится с VDOM |
| Разная локаль/таймзона сервера и клиента | форматировать с явной `timeZone` или на клиенте |

**Ленивая гидратация** (встроенная в Nuxt, с 3.16; использует стратегии Vue 3.5 `hydrateOnVisible` и т.д.) — только для `Lazy`-компонентов, атрибут прямо в шаблоне:

```vue
<template>
  <LazyComments hydrate-on-visible />            <!-- IntersectionObserver -->
  <LazyChatWidget hydrate-on-interaction="mouseover" />
  <LazyMobileMenu hydrate-on-media-query="(max-width: 768px)" />
  <LazyRecommendations hydrate-on-idle />
  <LazyBanner :hydrate-after="2000" />
  <LazyFooterMap hydrate-never />                <!-- HTML есть, интерактивности нет -->
  <LazyEditor :hydrate-when="isReady" />
</template>
```

Ограничения: работает в SFC, пропсы должны быть заданы в шаблоне (не через `v-bind="obj"`), не работает с прямым импортом из `#components`; **любое изменение пропса гидратирует компонент немедленно** (даже `hydrate-never`). Есть `defineLazyHydrationComponent` для явного импорта.

### Data fetching: `$fetch`, `useFetch`, `useAsyncData`

```vue
<script setup lang="ts">
// ❌ $fetch в setup: выполнится на сервере И снова на клиенте при гидратации
const posts = await $fetch('/api/posts');

// ✅ один раз на сервере, результат в payload
const { data, status, error, refresh, clear } = await useFetch('/api/posts', {
  query: { page },                   // реактивная опция — авто-перезапрос
  pick: ['id', 'title'],             // урезает PAYLOAD, но не сам запрос
});

// ✅ произвольная асинхронность (CMS SDK, несколько запросов)
const { data: dashboard } = await useAsyncData('dashboard', async (_nuxtApp, { signal }) => {
  const [user, stats] = await Promise.all([
    $fetch('/api/me', { signal }),
    $fetch('/api/stats', { signal }),
  ]);
  return { user, stats };
});

// ✅ $fetch — для событий (submit, клик), где SSR не участвует
async function save() { await $fetch('/api/posts', { method: 'POST', body: form.value }); }
</script>
```

`useFetch(url)` ≈ `useAsyncData(key, () => $fetch(url))` с автогенерацией ключа из URL и опций + типизация ответа по серверному роуту.

**Ключи и общий кэш (Nuxt 4 — «singleton data fetching layer»):**
- Вызовы с **одинаковым ключом разделяют одни и те же `data`, `error`, `status`, `pending`** — это и есть дедупликация между компонентами.
- Должны совпадать: `handler`, `deep`, `transform`, `pick`, `getCachedData`, `default`, `middleware` (иначе — dev-предупреждение). Могут отличаться: `server`, `lazy`, `immediate`, `dedupe`, `watch`, `enabled`, `serialize`.
- `useFetch` без явного `key` генерирует ключ из URL, опций и **места вызова** — два компонента с одинаковым URL получат **разные** ключи. Нужен общий кэш — задайте `key` явно.
- Ключ может быть `ref`/`computed`/геттером: смена ключа → новый запрос, данные старого ключа очищаются, если больше не используются.
- Когда размонтирован последний компонент, использующий ключ, данные удаляются (защита от роста памяти).

**Опции (useAsyncData, Nuxt 4.6):** `server` (`true`), `lazy` (`false`; блокирует навигацию через `<Suspense>`), `immediate` (`true`), `default`, `transform`, `pick`, `watch`, `deep` (**`false`** → `data` это `shallowRef`), `dedupe` (`'cancel'` по умолчанию | `'defer'`), `getCachedData(key, nuxtApp, ctx)` (`ctx.cause`: `'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'`), `timeout` (4.2), `enabled` (4.5), `serialize` (4.6), `middleware` (4.6).

- `dedupe: 'cancel'` — новый вызов `refresh` отменяет текущий (через `AbortSignal` хендлера); `'defer'` — пока есть pending-запрос, новый не стартует.
- `status`: `'idle' | 'pending' | 'success' | 'error'`. В Nuxt 4 `pending` — computed, `true` только при `status === 'pending'` (при `immediate: false` до первого запуска — `false`).
- `data` и `error` по умолчанию **`undefined`** (в Nuxt 3 был `null`).
- `clear()` — `data` → `default()` или `undefined`, `error` → `undefined`, `status` → `idle`, отменяет pending-запрос.
- Глобально: `refreshNuxtData(key?)`, `clearNuxtData(key?)`, `useNuxtData(key)` (доступ к кэшу — удобно для оптимистичных обновлений).
- `getCachedData` по умолчанию возвращает данные из payload при гидратации (и из `nuxtApp.static.data` при payload extraction). Переопределив его, можно сделать клиентский кэш между навигациями — но **это ваша ответственность за инвалидацию**.
- `handler` должен возвращать не `undefined`/`null` и быть **без побочных эффектов** (для эффектов — `callOnce`).
- `await` не обязателен: на сервере Nuxt ждёт в любом случае; без `await` на клиенте навигация не блокируется (как `lazy`).

**Cookie и заголовки при SSR.** `useFetch` с относительным URL на сервере использует `useRequestFetch` и пробрасывает заголовки входящего запроса (кроме `host`, `content-length` и т.п.). Голый `$fetch` на сервере cookie **не** пробрасывает — нужен `useRequestHeaders(['cookie'])` или `useRequestFetch()`. 🪤 Не проксируйте заголовки на **внешние** API — утечка cookie пользователя третьей стороне.

**Сериализация.** Payload — `devalue`. Но ответ API-роута проходит через `JSON.stringify`: `Date` из `server/api` придёт строкой (Nuxt подстраивает тип, `toJSON` учитывается).

### Состояние: `useState`, Pinia, утечки между запросами

На сервере модуль JS загружается **один раз на процесс** и живёт между запросами:

```ts
// ❌ composables/user.ts — общий для ВСЕХ пользователей на сервере
export const currentUser = ref<User | null>(null);

// ✅ SSR-безопасно: состояние в nuxtApp текущего запроса + сериализуется в payload
export const useCurrentUser = () => useState<User | null>('current-user', () => null);
```

- `useState(key, init)` — SSR-friendly `ref`: хранится в `nuxtApp.payload.state`, передаётся на клиент, общий по ключу. Значение должно быть сериализуемо (без классов, функций, символов).
- Инициализация асинхронными данными — `callOnce` в `app.vue` (аналог `nuxtServerInit` из Nuxt 2).
- **Pinia** (`@pinia/nuxt`): модуль создаёт `pinia` **на запрос**, state сериализуется и восстанавливается. Правила те же: не создавать стор вне контекста, в setup-сторе возвращать весь state, не держать в state несериализуемое.
- 🪤 Другие источники утечек: модульные кэши (`const cache = new Map()` в `server/utils` без TTL и ключа по пользователю), синглтоны SDK с токеном пользователя, `swr`-кэш персональных страниц.

### `server/`: API routes, server middleware

```ts
// server/api/products/[id].get.ts  (Nuxt 4.6, nuxt/server)
import { defineEventHandler, getRouterParam, createError } from 'nuxt/server';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const product = await findProduct(id);       // из server/utils
  if (!product) throw createError({ status: 404, statusText: 'Not found' });
  return product;                              // объект → JSON автоматически
});
```

- `server/api/*` → `/api/*`, `server/routes/*` → без префикса, суффиксы метода `.get.ts`/`.post.ts`, `server/middleware/*` — на **каждый** запрос (логирование, заголовки, `event.context.user`), должны ничего не возвращать.
- `server/plugins` — плагины Nitro (хуки жизненного цикла сервера); `server/utils` — автоимпорт.
- Валидация: `readValidatedBody` / `getValidatedQuery` (в `nuxt/server` принимают Standard Schema — Zod, Valibot и т.д.).
- 4.6: `nuxt/server` — переносимый API на web-стандартах (`event.req`, `event.res`, `event.url`); код работает на Nitro v2/v3. 🪤 Автоимпортированный `defineEventHandler` в 4.6 — всё ещё h3 v1; смешение с хелперами `nuxt/server` даёт ошибку `NUXT_E8012`. Отличия: `createError({ status, statusText })` вместо `statusCode/statusMessage`, `sendRedirect` нужно `return`, `useRuntimeConfig()` без `event`.
- Хелперы, которых нет в `nuxt/server` (`defineCachedEventHandler`, `useStorage`, `readMultipartFormData`) — импортируются из `h3`/`nitropack/runtime` и потребуют ревизии при переходе на Nuxt 5.

### `runtimeConfig` и секреты

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',                       // только сервер; переопределяется NUXT_API_SECRET
    public: { apiBase: '/api' },         // уходит в payload КАЖДОЙ страницы → NUXT_PUBLIC_API_BASE
  },
});
```

- Переопределение в рантайме — **только** переменными `NUXT_*`, повторяющими структуру (`NUXT_PUBLIC_API_BASE`). `apiSecret: process.env.OTHER_VAR` сработает лишь **на этапе сборки** — значение «запечётся» в бандл.
- `.env` читается CLI в dev/build/generate, но **не** при запуске собранного сервера.
- Значения env парсятся (`destr`): `NUXT_X=4848e0` станет числом — строку оборачивают в литеральные кавычки.
- `appConfig` (`app.config.ts`) — публичная конфигурация **времени сборки** (тема, флаги UI), не для секретов и не для env.
- 4.6: `runtimeConfig.appSecret` (`NUXT_APP_SECRET`) — корневой секрет для `deriveSecret` и `useSession`; ключи с префиксом `app` зарезервированы.

### SEO

- `useHead({ title, meta, link, script, htmlAttrs })` — реактивно, на сервере и клиенте (Unhead v2 в Nuxt 4). `useHeadSafe` — для пользовательских данных (санитизация).
- `useSeoMeta({ title, description, ogTitle, ogImage, twitterCard })` — типизированный плоский API, защищает от опечаток (`og:` vs `name=`).
- `titleTemplate` в `app.vue`, `app.head` в конфиге для глобальных значений.
- Для SEO важен именно серверный HTML: при `ssr: false` метаданные появятся только после JS.

### Производительность

- `<NuxtLink>` префетчит чанки и payload маршрутов в зоне видимости (4.6: на сервере рендерится как обычный `<a>`).
- `Lazy`-префикс → отдельный чанк; ленивая гидратация → меньше работы на главном потоке (INP, TBT).
- `pick`/`transform` уменьшают payload (HTML), `serialize: false` (4.6) убирает данные из payload целиком — в паре с ленивой гидратацией.
- `routeRules` (prerender/swr/isr) — главный рычаг TTFB.
- Модули `@nuxt/image`, `@nuxt/fonts`, `@nuxt/scripts` (сторонние скрипты с триггерами загрузки).
- Анализ: `nuxi analyze`, Nuxt DevTools, Lighthouse/PageSpeed.
- Антипаттерны из официального гайда: «слишком много плагинов», загрузка всего сразу, неиспользуемые зависимости.

### Nuxt vs Next.js

| | Nuxt 4 | Next.js (App Router) |
|---|---|---|
| UI-слой | Vue 3 (SFC, реактивность на сигналах) | React 19 (RSC по умолчанию) |
| Серверные компоненты | opt-in: Islands, `.server.vue` | по умолчанию — Server Components, `'use client'` для клиентских |
| Данные | `useFetch`/`useAsyncData` + payload | `async` Server Components, `fetch` с кэшем, Server Actions |
| Рендер на маршрут | `routeRules` в одном конфиге | сегментные настройки (`dynamic`, `revalidate`) в файлах маршрутов |
| Сервер | Nitro: API, middleware, storage, tasks, 25+ пресетов | Route Handlers; деплой лучше всего на Vercel, adapters для прочих |
| Автоимпорты | да | нет (явные импорты) |
| Бандлер | Vite (по умолчанию), Rspack | Turbopack / webpack |
| Расширение | модули + layers | плагины конфигурации, нет аналога layers |
| Экосистема/найм | меньше, Vue-ориентированная | крупнее |

💡 На собеседовании: выбор Nuxt vs Next почти всегда — следствие выбора Vue vs React (команда, существующий код, библиотеки), а не возможностей мета-фреймворка: SSR, SSG, ISR, edge есть у обоих.

### Когда Nuxt не нужен

- Внутренняя админка/SaaS за логином без SEO — достаточно Vite + Vue SPA (или Nuxt с `ssr: false`, если нужны конвенции и модули).
- Виджет/микрофронтенд, встраиваемый в чужую страницу — нужен библиотечный бандл, а не приложение.
- Чисто статический контент без интерактивности — Astro/VitePress проще и отдают меньше JS.
- Бэкенд уже рендерит HTML (Laravel, Rails) и нужен «остров» интерактивности — Vue на клиенте.
- Команда не готова к ограничениям SSR (браузерные API, утечки состояния, мониторинг Node-процесса) и выгода от SSR неочевидна.

## Вопросы с собеседований

<details><summary>Из чего состоит Nuxt и какую роль играет Nitro?</summary>

Vue 3 — UI и серверный рендер; Vite — клиентский и серверный бандлы; Nitro (на h3) — серверный движок: API-роуты, server middleware, кэш для `swr`/`isr`, storage, prerender, сборка standalone `.output/` и адаптация под платформу через presets (node, Vercel, Netlify, Cloudflare, Deno...). Плюс прямые вызовы: `$fetch('/api/x')` при SSR вызывает обработчик без HTTP. Для lead: в 4.6 появился `nuxt/server` — серверный код отвязывается от конкретной реализации (Nitro v2/v3, экспериментальный `@nuxt/vite-server`), это подготовка к Nuxt 5 с Nitro v3 + h3 v2.
</details>

<details><summary>Что изменилось в Nuxt 4 по сравнению с Nuxt 3?</summary>

Структура `app/` (srcDir), `server/`/`shared/`/`public/` в корне; отдельные TS-проекты для app/server/shared/builder при одном `tsconfig.json`; singleton data fetching layer — общие refs по ключу, реактивные ключи, авточистка при размонтировании, `getCachedData` вызывается всегда и получает `cause`; `data`/`error` по умолчанию `undefined`, `data` — `shallowRef`, `pending` выровнен со `status`; `dedupe` только `'cancel' | 'defer'`; удаление `window.__NUXT__` после гидратации; Unhead v2. Миграция — `npx nuxt upgrade --dedupe` + codemods; старая структура директорий распознаётся автоматически. Nuxt 3 — EOL 31.07.2026.
</details>

<details><summary>Почему `$fetch` в `setup` — ошибка, и когда он уместен?</summary>

При SSR запрос выполнится на сервере, а при гидратации `setup` выполнится снова на клиенте — второй запрос, задержка интерактивности, возможный mismatch. `useFetch`/`useAsyncData` кладут результат в payload и на клиенте берут его оттуда. `$fetch` уместен в обработчиках событий, в `server/`, внутри хендлера `useAsyncData` и в коде, который выполняется только на клиенте.
</details>

<details><summary>Как работают ключи `useAsyncData`/`useFetch` и что такое дедупликация?</summary>

Ключ идентифицирует запись в кэше `nuxtApp`: с ним связаны данные payload при гидратации, и в Nuxt 4 все вызовы с одним ключом разделяют `data`/`error`/`status`. Одновременные вызовы не дублируют запрос; `refresh` при pending-запросе по умолчанию отменяет предыдущий (`dedupe: 'cancel'`) или пропускает новый (`'defer'`). Ключ `useFetch` генерируется с учётом места вызова — для разделения между компонентами задают явный `key`. Несовместимые `transform`/`pick`/`default`/`deep` при одном ключе — dev-предупреждение. Реактивный ключ перезапрашивает данные и чистит старые.
</details>

<details><summary>Что такое payload и как его уменьшить?</summary>

Сериализованное (`devalue`) состояние SSR — результаты `useAsyncData`, `useState`, public runtime config, ошибки — встроенное в HTML; клиент гидратирует из него без повторных запросов. Большой payload раздувает HTML и время парсинга. Уменьшение: `pick`/`transform` (запрос остаётся полным — урезается только payload), фильтрация на сервере (свой API-эндпоинт под нужды страницы), `serialize: false` (4.6) для данных, которые не нужны при гидратации, payload extraction в `_payload.json` для prerender/`swr`/`isr`.
</details>

<details><summary>Как выбрать стратегию рендеринга для маршрутов?</summary>

По трём осям: персонализация, частота изменения, требования SEO. Статичный и общий — `prerender`. Общий, меняется периодически, страниц много — `swr`/`isr` с TTL (и инвалидация вебхуком). Персональный с SEO — SSR без кэша. Персональный без SEO — `ssr: false`. Важно: `swr`-кэш на `node-server` хранится per-instance (нужен общий storage), `isr` работает на CDN только у Netlify/Vercel, гибридный режим недоступен при `nuxt generate`, кэш ключуется по URL — персональное кэшировать нельзя.
</details>

<details><summary>Чем грозит hydration mismatch и как его диагностировать?</summary>

Vue переписывает расходящийся DOM: мигание, сдвиги, дольше TTI, возможно не привязанные обработчики, разный контент для бота и пользователя. Диагностика: предупреждения Vue в консоли в dev (`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` для прода), Nuxt DevTools. Причины: браузерные API в setup, недетерминированные значения (время, random), разметка по ширине окна, сторонние скрипты, невалидный HTML, таймзоны. Лечение: `useState`/`useCookie`, `onMounted`, `<ClientOnly>`, CSS вместо условного рендера.
</details>

<details><summary>Что такое ленивая гидратация и чем она отличается от Lazy-компонентов?</summary>

`Lazy`-префикс — код-сплиттинг: чанк грузится, когда компонент рендерится. Ленивая гидратация (`hydrate-on-visible`, `-on-idle`, `-on-interaction`, `-on-media-query`, `hydrate-after`, `hydrate-when`, `hydrate-never`) — HTML уже есть с сервера, но JS и привязка обработчиков откладываются до условия. Снижает TBT/INP. Ограничения: только SFC, пропсы явно в шаблоне, изменение пропса гидратирует сразу.
</details>

<details><summary>Почему глобальный `ref` в модуле — уязвимость в SSR?</summary>

Модуль загружается один раз на процесс Node и разделяется всеми запросами: данные пользователя A увидит пользователь B (cross-request state pollution), плюс утечка памяти. Решение — состояние в контексте запроса: `useState`, Pinia через `@pinia/nuxt` (новый `pinia` на запрос), `event.context` на сервере. То же касается модульных кэшей и синглтонов SDK с пользовательским токеном.
</details>

<details><summary>Чем route middleware отличается от server middleware?</summary>

Route middleware (`app/middleware`) — навигационные guards Vue-приложения: работают при SSR страницы и при клиентской навигации, возвращают `navigateTo`/`abortNavigation`. Server middleware (`server/middleware`) — обработчики Nitro на **каждый** HTTP-запрос (включая API и ассеты, если они идут через сервер), ничего не возвращают, обогащают `event.context`. Авторизация данных — на сервере; route middleware — UX.
</details>

<details><summary>Как правильно работать с секретами и конфигурацией?</summary>

`runtimeConfig` — приватные ключи только на сервере, `public` — уходит в payload каждой страницы. Переопределение — переменными `NUXT_*` в рантайме (одна сборка → много окружений). Ошибка — `process.env.X` в конфиге: значение фиксируется при сборке. `.env` не читается собранным сервером. `app.config.ts` — для публичных настроек времени сборки. Значения env парсятся (`destr`) — строки из цифр оборачивать в кавычки. В 4.6 — `appSecret` для сессий и `deriveSecret`.
</details>

<details><summary>Плагин или модуль — что и когда писать?</summary>

Плагин — рантайм: выполняется при старте приложения на сервере/клиенте, `provide`-хелперы, подключение Vue-плагинов, директив; каждый плагин удлиняет старт (есть `parallel`, `dependsOn`). Модуль — build-time: через `@nuxt/kit` добавляет плагины, компоненты, серверные роуты, автоимпорты, правит конфиг Vite/Nitro. Если логика нужна нескольким проектам — модуль или layer. Если тяжёлая и нужна не везде — composable, вызываемый по месту, а не плагин.
</details>

<details><summary>Nuxt или Next.js для нового проекта?</summary>

Решающее — стек команды и экосистема (Vue vs React), найм, наличие компонентных библиотек. Возможности по рендерингу сопоставимы (SSR/SSG/ISR/edge). Nuxt: единый `routeRules`, Nitro с деплоем куда угодно, модули и layers, автоимпорты, Islands opt-in. Next: Server Components по умолчанию, Server Actions, крупнее экосистема, лучшая интеграция с Vercel. Для lead: оценить стоимость миграций мажорных версий (Nuxt 3→4 — мягкая, через флаг совместимости; Nuxt 5 готовится так же через `compatibilityVersion: 5`).
</details>

<details><summary>Как в Nuxt организовать клиентский кэш между навигациями?</summary>

По умолчанию при клиентской навигации `useFetch` делает новый запрос (если данные по ключу не в памяти). Варианты: общий ключ + `useNuxtData` для мгновенного показа; кастомный `getCachedData`, который возвращает данные из `nuxtApp.payload.data`/`static.data` с проверкой TTL и `ctx.cause` (для `refresh:manual` — всегда сеть); `lazy: true` + показ старых данных; payload extraction для prerender/`isr`. Для сложного серверного состояния — Pinia Colada или TanStack Query с SSR-гидратацией.
</details>

<details><summary>Когда Nuxt не нужен?</summary>

Нет требований SEO/первого рендера (админка за логином) — Vite SPA проще и дешевле в эксплуатации. Встраиваемые виджеты и микрофронтенды. Статический контент без интерактивности — Astro/VitePress. Бэкенд уже рендерит HTML. SSR добавляет стоимость: сервер, мониторинг, ограничения браузерных API, риск утечек — нужно, чтобы выгода (SEO, LCP) это окупала.
</details>

## Практика

**1. Найди ошибки** в странице товара.

```vue
<script setup lang="ts">
const route = useRoute();
const user = ref(JSON.parse(localStorage.getItem('user') ?? 'null'));
const product = await $fetch(`/api/products/${route.params.id}`);
const { data: reviews } = await useFetch(`/api/reviews?product=${route.params.id}`);
const seenAt = new Date().toLocaleTimeString();
</script>
```

<details><summary>Решение</summary>

1. `localStorage` на сервере не существует — падение SSR; использовать `useCookie` или читать в `onMounted`.
2. `$fetch` в `setup` — двойной запрос; заменить на `useFetch`/`useAsyncData`.
3. URL отзывов собран строкой с `route.params.id` в момент вызова — при переходе `/products/1` → `/products/2` (тот же компонент) запрос не обновится. Использовать геттер: `useFetch(() => \`/api/reviews?product=${route.params.id}\`)` или `query: { product: computed(() => route.params.id) }`.
4. `toLocaleTimeString()` — разное время/локаль на сервере и клиенте → hydration mismatch; `useState` или `<NuxtTime>`/`<ClientOnly>`.

```vue
<script setup lang="ts">
const route = useRoute();
const user = useCookie<User | null>('user', { default: () => null });
const id = computed(() => String(route.params.id));
const { data: product } = await useFetch(() => `/api/products/${id.value}`);
const { data: reviews } = await useFetch('/api/reviews', { query: { product: id }, lazy: true });
</script>
```
</details>

**2. Спроектируй** `routeRules` для маркетплейса: главная, каталог (500k товаров), карточка товара, корзина, личный кабинет, блог, публичное API, редирект со старых URL `/item/:id`.

<details><summary>Решение</summary>

```ts
routeRules: {
  '/': { swr: 600 },                       // меняется (баннеры), но общий для всех
  '/catalog/**': { swr: 300 },
  '/product/**': { isr: 3600 },            // на Vercel/Netlify; иначе swr + общий storage (Redis)
  '/cart': { ssr: false },                 // персонально, SEO не нужно
  '/account/**': { ssr: false, appLayout: 'account' },
  '/blog/**': { prerender: true },         // + пересборка/инвалидация по вебхуку CMS
  '/api/public/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
  '/item/**': { redirect: { to: '/product/**', statusCode: 301 } },
}
```

Обсудить: цены и остатки в карточке не кэшировать вместе с HTML — догружать на клиенте (`server: false` или ленивый блок); персональные рекомендации — `ClientOnly`/ленивая гидратация; при нескольких инстансах `swr` — общий storage; инвалидация после изменения товара.
</details>

**3. Напиши** SSR-безопасный composable авторизации.

<details><summary>Решение</summary>

```ts
// app/composables/useAuth.ts
export function useAuth() {
  const user = useState<User | null>('auth:user', () => null);

  async function fetchUser() {
    // на сервере пробрасываем cookie входящего запроса
    const requestFetch = useRequestFetch();
    try {
      user.value = await requestFetch<User>('/api/me');
    } catch (error) {
      user.value = null;
      console.error('[auth] fetchUser failed', error);
    }
  }

  async function logout() {
    await $fetch('/api/logout', { method: 'POST' });
    user.value = null;
    await navigateTo('/login');
  }

  return { user: readonly(user), loggedIn: computed(() => user.value !== null), fetchUser, logout };
}

// app/app.vue: await callOnce('auth', () => useAuth().fetchUser())
```

`useRequestFetch` вызывается синхронно в начале функции (контекст Nuxt). Состояние — `useState`, а не модульный `ref`. Проверка прав — дополнительно в `server/middleware` / API.
</details>

## Источники
- https://nuxt.com/blog/v4
- https://nuxt.com/blog/v4-3
- https://nuxt.com/blog/v4-6
- https://nuxt.com/docs/4.x/getting-started/upgrade
- https://nuxt.com/docs/4.x/guide/concepts/rendering
- https://nuxt.com/docs/4.x/guide/concepts/auto-imports
- https://nuxt.com/docs/4.x/guide/concepts/server-engine
- https://nuxt.com/docs/4.x/getting-started/data-fetching
- https://nuxt.com/docs/4.x/api/composables/use-async-data
- https://nuxt.com/docs/4.x/getting-started/state-management
- https://nuxt.com/docs/4.x/guide/best-practices/hydration
- https://nuxt.com/docs/4.x/guide/best-practices/performance
- https://nuxt.com/docs/4.x/directory-structure/app/components
- https://nuxt.com/docs/4.x/directory-structure/app/middleware
- https://nuxt.com/docs/4.x/directory-structure/app/plugins
- https://nuxt.com/docs/4.x/guide/going-further/runtime-config
- https://nitro.build/
