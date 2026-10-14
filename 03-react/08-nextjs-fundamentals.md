# Next.js: основы App Router

> ⏱ ~4 ч · 🎯 Уверенно объяснять, как устроен App Router в актуальной версии (Next.js 16.x, на октябрь 2026 — 16.4): файловые конвенции, Server/Client Components в Next, навигация и prefetch, модель рендеринга (static shell, streaming, PPR через Cache Components), metadata, `next/image`/`next/font`/`next/script`, Route Handlers, `proxy.ts` и выбор runtime. Различать, что изменилось в 15 → 16 → 16.4.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю иерархию специальных файлов сегмента и что такое route groups, `_private`, `@slot`, `(.)`-перехват
- [ ] Могу объяснить, что приходит в браузер при первом заходе и при клиентской навигации (HTML, RSC Payload, JS)
- [ ] Понимаю, что такое static shell / App Shell и почему `cookies()` без `<Suspense>` — ошибка в модели Cache Components
- [ ] Знаю, чем `proxy.ts` (16+) отличается от `middleware.ts` и почему авторизацию нельзя держать только там
- [ ] Могу аргументировать Node.js vs Edge runtime и знаю их текущий статус в Next 16

## Теория

> База RSC (что такое граница `'use client'`, сериализуемые пропсы, `use()`, Server Functions, сравнение CSR/SSR/SSG/ISR) — в [React 19 и Server Components](05-react-19-and-server-components.md). Здесь — только то, что специфично для Next.js. Данные, кэш, Server Actions и деплой — в [следующей теме](09-nextjs-data-and-caching.md).

### Версии: что актуально (октябрь 2026)

| Версия | Дата | Что важно для собеседования |
|---|---|---|
| 13.4 | май 2023 | App Router стабилен |
| 14 | окт 2023 | `fetch` и `GET` Route Handlers кэшируются по умолчанию (позже признано ошибкой дизайна) |
| 15 | окт 2024 | Async Request APIs (`await cookies()`, `await params`), **кэш по умолчанию выключен** для `fetch`, `GET`-хэндлеров и страниц в клиентском Router Cache; React 19; `next/form`; Turbopack dev стабилен |
| 15.5 | авг 2025 | Node.js runtime в middleware стабилен; `next typegen` (`PageProps`, `LayoutProps`, `RouteContext`) |
| **16** | 21 окт 2025 | **Turbopack по умолчанию** для dev и build; **`proxy.ts` вместо `middleware.ts`**; **Cache Components** (`cacheComponents: true`, `'use cache'` стабилен); `updateTag`/`refresh`, новый `revalidateTag(tag, profile)`; синхронный доступ к `params`/`cookies()` удалён; Node.js ≥ 20.9; React 19.2; переписанный prefetch (дедупликация layout'ов) |
| 16.1 | дек 2025 | файловый кэш Turbopack для `next dev` стабилен и включён; экспериментальный bundle analyzer; `next upgrade` |
| 16.2 | мар 2026 | Adapters API стабилен; `unstable_catchError`, `unstable_retry` |
| 16.3 | авг 2026 | **Instant Navigations**: Partial Prefetching (`partialPrefetching: true`), `catchError` с `retry()`, `next/root-params`, ISR с App Shell, `import.meta.glob` в Turbopack |
| **16.4** | 6 окт 2026 | Cache Components **рекомендованы для всех приложений** и включены в `create-next-app` по умолчанию; `ensureStatic`; `navigation()`/`prefetch()` для управления содержимым prefetch; React 19.3 |

Команда Next.js объявила, что модель Cache Components (вместе с Partial Prefetching) станет поведением по умолчанию в **Next.js 17**. До этого в существующих проектах её включают флагами.

💡 На собеседовании: «Я различаю две модели App Router: *предыдущую* (неявный кэш, `export const dynamic`, `revalidate`, `fetch(..., { next })`) и *Cache Components* (всё динамично по умолчанию, кэш — явный `'use cache'`). На 16.4 вторая рекомендована для всех новых проектов».

### App Router vs Pages Router

| | Pages Router (`pages/`) | App Router (`app/`) |
|---|---|---|
| Компоненты | все клиентские (SSR + гидратация всего) | Server Components по умолчанию |
| Данные | `getServerSideProps` / `getStaticProps` / `getStaticPaths` на уровне страницы | `async`-компоненты на любом уровне, `'use cache'`, Suspense |
| Layouts | `_app`, `_document`, ручные паттерны | вложенные `layout.tsx`, сохраняют состояние при навигации |
| Стриминг | нет (кроме ручного) | встроен: `loading.tsx`, `<Suspense>` |
| Мутации | API Routes | Server Actions + Route Handlers |
| React | версия из `package.json` | встроенный React canary (все стабильные фичи 19.x + валидируемые новые) |

Pages Router по-прежнему поддерживается, оба роутера могут жить в одном проекте (миграция постранично). Новые фичи (Cache Components, PPR, Server Actions) — только в App Router.

### Файловые конвенции

```
app/
├── layout.tsx            # root layout: обязателен, содержит <html> и <body>
├── page.tsx              # "/"
├── (marketing)/          # route group: не попадает в URL, свой layout
│   └── about/page.tsx    # "/about"
├── blog/
│   ├── layout.tsx
│   ├── loading.tsx       # Suspense-граница вокруг page
│   ├── error.tsx         # error boundary ('use client')
│   ├── not-found.tsx
│   ├── _components/      # private folder: исключён из роутинга
│   └── [slug]/page.tsx   # "/blog/hello"
├── shop/[...slug]/       # catch-all: /shop/a, /shop/a/b
├── docs/[[...slug]]/     # optional catch-all: ещё и /docs
├── dashboard/
│   ├── layout.tsx        # получает props { children, analytics, team }
│   ├── @analytics/page.tsx   # parallel route (slot)
│   ├── @team/page.tsx
│   └── @analytics/default.tsx # обязателен для каждого slot начиная с 16
├── photos/
│   ├── [id]/page.tsx              # полноценная страница фото
│   └── (.)[id]/page.tsx           # перехват: та же фотография модалкой поверх ленты
└── api/health/route.ts   # Route Handler
```

Иерархия специальных файлов внутри сегмента (снаружи внутрь): `layout` → `template` → `error` (error boundary) → `loading` (Suspense) → `not-found` → `page` (или вложенный layout). Из этого следуют вопросы с подвохом:

- `error.tsx` **не ловит ошибки своего `layout.tsx`** — layout находится выше границы. Для ошибок root layout есть `global-error.tsx` (рендерит собственные `<html>`/`<body>`).
- `loading.tsx` оборачивает только `page` и нижележащее, layout сегмента показывается сразу.
- `template.tsx` в отличие от `layout` пересоздаётся при каждой навигации (сброс state, повторный запуск эффектов).
- `route.ts` и `page.tsx` в одном сегменте — конфликт; Route Handler не участвует в layouts и клиентской навигации.
- Маршрут становится публичным только при наличии `page` или `route` — остальные файлы в `app/` можно безопасно колоцировать.

**Route groups** `(name)`: организация по командам/разделам, разные layouts на одном уровне URL, несколько root layouts (при переходе между ними — полная перезагрузка страницы).

**Parallel routes** `@slot`: несколько независимых страниц в одном layout (дашборд, условный рендер по роли, модалки). Каждый slot может иметь свои `loading`/`error`. При мягкой навигации несовпавший slot сохраняет текущее состояние, при жёсткой (reload) — рендерится `default.tsx`. С **Next 16** `default.tsx` обязателен для каждого slot, иначе сборка падает.

**Intercepting routes**: `(.)` — тот же уровень, `(..)` — уровень выше, `(..)(..)` — два уровня, `(...)` — от корня `app`. Уровни считаются по **сегментам маршрута, а не по папкам файловой системы** (route groups и slots не считаются). Классика — модалка фото в ленте: по клику показывается перехваченный маршрут поверх списка, а прямой заход/refresh по URL открывает полноценную страницу. Комбинация `@modal` + `(.)photo/[id]` даёт shareable URL у модалки и закрытие по «Назад».

Типизация (15.5+): `npx next typegen` генерирует глобальные `PageProps<'/blog/[slug]'>`, `LayoutProps<...>`, `RouteContext<...>`.

```tsx
// app/blog/[slug]/page.tsx — Next 16: params и searchParams только асинхронные
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const { tab } = await props.searchParams;
  return <Article slug={slug} tab={tab} />;
}
```

🪤 Ловушка: в 15 синхронный доступ к `params`/`cookies()` работал с предупреждением, в 16 — удалён. Codemod `next-async-request-api` не запускается автоматически в `upgrade`.

### Server и Client Components в Next

Что происходит при **первой загрузке**:
1. На сервере Server Components рендерятся в **RSC Payload** (результат серверных компонентов + плейсхолдеры и ссылки на JS клиентских компонентов + их пропсы); работа делится на чанки по сегментам (layouts, pages, slots).
2. RSC Payload + Client Components → HTML (клиентские компоненты тоже пре-рендерятся на сервере).
3. В браузере: HTML показывается сразу (неинтерактивно) → RSC Payload сверяет деревья → JS гидратирует клиентские компоненты.

При **последующих навигациях** HTML не нужен: клиент получает (или уже имеет из prefetch) RSC Payload, клиентские компоненты рендерятся только в браузере.

Практика Next поверх правил RSC:
- `'use client'` ставим в листья (кнопка поиска, а не весь layout) — меньше JS.
- Провайдеры контекста — клиентская обёртка, принимающая `children`, и ставится **как можно глубже** (обернуть `{children}`, а не `<html>`), чтобы Next мог оптимизировать статические части.
- Сторонний компонент с хуками без `'use client'` → реэкспорт из своего файла с `'use client'`.
- `import 'server-only'` в модулях с секретами/доступом к БД даёт **ошибку сборки** при импорте в клиентский граф. Аналог — `client-only`.
- В клиентский бандл попадают только переменные `NEXT_PUBLIC_*` (инлайнятся при `next build`); остальные заменяются пустой строкой.

### Навигация и prefetch

`<Link>` делает клиентский переход: общие layouts и их state сохраняются (partial rendering), заменяется только изменившийся сегмент; навигация прерываемая. Обычный `<a>` — полная перезагрузка.

Prefetch: `<Link>` префетчит маршрут, когда ссылка попадает во viewport (только в production; в dev prefetch выключен).

| | Предыдущая модель (без Partial Prefetching) | Cache Components + Partial Prefetching (16.3+) |
|---|---|---|
| Статический маршрут | префетчится целиком | App Shell префетчится по умолчанию |
| Динамический маршрут | пропускается или частично (до ближайшего `loading.tsx`) | префетчится App Shell (статика + fallback'и; данные сессии из `cookies()`/`headers()`) |
| `prefetch={true}` | полный prefetch страницы | дополнительно рендерит кэшированный контент, зависящий от URL (`params`, `searchParams`) — серверный вызов на каждую ссылку |
| `prefetch={false}` | без prefetch | без prefetch |

Next 16 переписал prefetch-кэш: **дедупликация layout'ов** (50 ссылок с общим layout скачают его один раз), инкрементальный prefetch (только недостающие сегменты), отмена при уходе ссылки из viewport, приоритет по hover. Компромисс — больше мелких запросов; в 16.3 мелкие ответы автоматически склеиваются (prefetch inlining).

16.4: `await navigation()` внутри компонента исключает его из prefetch (рендер только при реальном переходе), `await prefetch()` — исключает из shell, но разрешает явный prefetch. `export const ensureStatic = 'navigation' | 'prefetch' | 'shell'` в page/layout роняет сборку, если в маршрут «просочился» динамический контент.

Что делает переходы медленными: динамический маршрут без `loading.tsx`/Suspense (клиент ждёт сервер), сегмент без `generateStaticParams`, медленная сеть (prefetch не успел — помогает `useLinkStatus()` для индикатора), не завершённая гидратация (`<Link>` — клиентский компонент, большой бандл откладывает prefetch). Для больших списков ссылок — `prefetch={false}` или prefetch по hover.

`window.history.pushState/replaceState` интегрированы с роутером (синхронизация `usePathname`/`useSearchParams`) — удобно для сортировки/фильтров без перезапроса сервера.

### Рендеринг: static shell, streaming, PPR

**Предыдущая модель (≤15 и 16 без флага)**: маршрут целиком статический или динамический. Любой `cookies()`, `headers()`, `searchParams`, `fetch` с `no-store` делал **весь маршрут** динамическим. Управление — `export const dynamic = 'force-static' | 'force-dynamic' | 'error'`, `revalidate`, `fetchCache`.

**Cache Components (16+, флаг `cacheComponents: true`)**: деление статика/динамика идёт **на уровне компонентов**. При сборке Next рендерит дерево и для каждого компонента решает:

| Что делает компонент | Результат при prerender |
|---|---|
| Синхронная работа, импорт модулей, `fs.readFileSync`, чистые вычисления | попадает в static shell автоматически |
| `'use cache'` (+ `cacheLife`) | результат кэшируется и попадает в shell (если lifetime не «короткий») |
| Некэшированный `await` (fetch, БД) или runtime API внутри `<Suspense>` | в shell попадает fallback, контент стримится на запрос |
| То же **без** `<Suspense>` | ошибка/insight «blocking route» в dev overlay и при сборке |
| `Math.random()`, `Date.now()`, `crypto.randomUUID()` | нужно явно: `await connection()` + Suspense (per request) или `'use cache'` (общее значение) |

Это и есть **Partial Prerendering (PPR)** — поведение по умолчанию с Cache Components (старые флаги `experimental.ppr` и `experimental_ppr` удалены в 16). Static shell (HTML + RSC Payload) отдаётся с CDN мгновенно, динамические «дыры» дописываются в **том же HTTP-ответе** стримингом.

```tsx
// Cache Components: чтение cookies не делает динамической всю страницу
export default function Page() {
  return (
    <>
      <Header />                                   {/* статика → shell */}
      <BlogPosts />                                {/* 'use cache' → shell */}
      <Suspense fallback={<p>Загрузка…</p>}>       {/* fallback → shell */}
        <UserPreferences />                        {/* cookies() → стрим на запрос */}
      </Suspense>
    </>
  );
}
```

Чем глубже в дереве находится `await` runtime-данных, тем больше shell. Приём: не `await params` в layout, а передать промис вниз и развернуть внутри `<Suspense>` (`params.then(...)` или `await` в дочернем компоненте).

**App Shell** — переиспользуемый, не зависящий от URL вариант shell для маршрута с неизвестными `params`. С 16.3 страница, не перечисленная в `generateStaticParams`, первому посетителю отдаёт App Shell мгновенно, а в фоне доре́ндеривается и кэшируется для следующих (новый ISR).

**Стриминг** в Next: `loading.tsx` = автоматическая `<Suspense>`-граница вокруг page; префетченный fallback показывается сразу при навигации. Ограничения стриминга (статус/заголовки после начала ответа, буферизующие прокси) — см. [React 19 и RSC](05-react-19-and-server-components.md); для боты/краулеры без поддержки стриминга metadata Next определяет по User-Agent (`htmlLimitedBots`) и отдаёт блокирующий рендер.

### Обработка ошибок и not found

- `error.tsx` — клиентский компонент-граница сегмента; получает `error` и `reset()`. В 16.2 добавлен `unstable_retry()` (refresh + reset в transition — перезапрашивает серверные данные), в 16.3 — `catchError` из `next/error` для собственных границ уровня компонента с `retry()`, которые не перехватывают `notFound()`/`redirect()`.
- `notFound()` → ближайший `not-found.tsx`; `redirect()`/`permanentRedirect()` бросают служебную ошибку — не оборачивайте их в `try/catch` (или используйте `unstable_rethrow`).
- Ошибки в продакшене маскируются: клиент видит общее сообщение и `digest`, детали — в серверных логах.

### Metadata и SEO

- `export const metadata: Metadata` — статически; `export async function generateMetadata({ params }, parent)` — по данным. Только в Server Components (page/layout).
- Одни и те же данные для metadata и страницы — через `React.cache` (`getPost = cache(async slug => ...)`), иначе двойной запрос к БД (`fetch` мемоизируется автоматически).
- **Streaming metadata**: для динамических страниц `<head>`-теги дописываются после резолва `generateMetadata`, не блокируя UI; для ботов, ожидающих metadata в `<head>` (по User-Agent), рендер блокирующий. Пре-рендеренные страницы резолвят metadata при сборке.
- Файловые конвенции: `favicon.ico`, `icon`, `apple-icon`, `opengraph-image`/`twitter-image` (статические или генерируемые `ImageResponse` из `next/og` — flexbox и подмножество CSS, без grid), `sitemap.ts`, `robots.ts`. Специальные хэндлеры статичны, если не используют runtime API.
- `charset` и `viewport` добавляются всегда; `generateViewport` — для динамического viewport/themeColor.

### Изображения, шрифты, скрипты

**`next/image`**: ресайз под устройство и современные форматы (WebP/AVIF), предотвращение CLS (обязательны `width`/`height`, статический импорт даёт их сам, либо `fill` + размер родителя), нативный lazy loading, `placeholder="blur"`, `sizes` для корректного `srcset`. Удалённые источники — только через строгие `images.remotePatterns` (`domains` устарел). Изменения **16.0**: `priority` устарел в пользу `preload` (а для LCP-картинки документация советует чаще `loading="eager"` или `fetchPriority="high"`), `images.qualities` по умолчанию `[75]`, `minimumCacheTTL` 60 с → 4 ч, `16` убран из `imageSizes`, оптимизация локальных IP запрещена по умолчанию (SSRF), максимум 3 редиректа, локальные `src` с query требуют `localPatterns`.

**`next/font`**: self-hosting любых шрифтов (Google-шрифты скачиваются при сборке и отдаются с вашего домена — браузер не ходит в Google), отсутствие layout shift, рекомендуются variable fonts и `subsets`. Подключать в root layout через `className` или CSS-переменную.

**`next/script`**: `strategy="beforeInteractive"` (до гидратации, только для критичного — consent, bot-детект), `afterInteractive` (по умолчанию), `lazyOnload` (в idle), `worker` (экспериментально, Partytown, не работает с App Router). Скрипт в layout загружается один раз даже при навигации между его страницами. Inline-скрипту нужен `id`. Колбэки `onLoad`/`onReady`/`onError` — только в клиентском компоненте.

### Route Handlers

`app/**/route.ts` экспортирует `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` (остальные → 405), работают с Web `Request`/`Response` (+ `NextRequest`/`NextResponse`).

```ts
// app/api/users/[id]/route.ts
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/dal';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  const session = await verifySession();          // Route Handler = публичный эндпоинт
  if (!session) return new Response(null, { status: 401 });
  const { id } = await ctx.params;
  return Response.json(await getUserDTO(id, session));
}
```

Кэширование: с 15 **не кэшируются по умолчанию** (в 14 `GET` кэшировался). Без Cache Components — `export const dynamic = 'force-static'`. С Cache Components `GET` следует той же модели, что и страницы: пре-рендерится, если не трогает некэшированные/runtime данные (`request.headers`, `req.url`, БД без `'use cache'`); `'use cache'` нельзя писать прямо в теле хэндлера — только в вынесенной функции.

Когда Route Handler, а когда Server Action: хэндлер — для внешних потребителей (вебхуки, мобильное приложение, OAuth callback, файлы/стримы, публичный API, кэшируемые GET); Server Action — для мутаций из своего UI.

### Proxy (бывший Middleware)

`proxy.ts` в корне (или `src/`) выполняется **до** роутинга: rewrite, redirect, изменение заголовков запроса/ответа, cookies, прямой ответ.

```ts
// proxy.ts (Next 16+)
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('session');      // только оптимистичная проверка
  if (!hasSession && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const headers = new Headers(request.headers);
  headers.set('x-request-id', crypto.randomUUID());
  return NextResponse.next({ request: { headers } });     // заголовок уйдёт вверх, а не клиенту
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
```

Факты, которые любят спрашивать:
- **Next 16**: `middleware.ts` → `proxy.ts`, функция `middleware` → `proxy` (codemod `middleware-to-proxy`). Причина: «middleware» путали с Express-middleware и злоупотребляли им; «proxy» подчёркивает сетевую границу перед приложением и что это крайнее средство.
- `proxy.ts` работает **только на Node.js runtime**, `runtime` в нём задать нельзя (ошибка). `middleware.ts` ещё доступен как deprecated-вариант для Edge.
- Один файл на проект; `matcher` — статически анализируемые константы. Без matcher proxy выполняется на **каждый** запрос, включая `_next/static` и картинки.
- Порядок: `headers` из конфига → `redirects` из конфига → **proxy** → `beforeFiles` rewrites → файловые маршруты → `afterFiles` → динамические маршруты → `fallback`.
- Server Functions — это POST на маршрут страницы: matcher, исключающий путь, исключает и экшены. Поэтому **авторизация проверяется внутри каждого Server Action/Route Handler/DAL**, а proxy — только оптимистичные редиректы по cookie (без похода в БД: он срабатывает и на prefetch).
- `fetch` с `cache`/`next.revalidate`/`next.tags` в proxy не действует; для фоновой работы — `event.waitUntil()`.
- Простые редиректы — `redirects` в `next.config`, не proxy.

### Runtime: Node.js vs Edge

| | Node.js runtime | Edge runtime |
|---|---|---|
| API | все Node API, любые npm-пакеты, нативные модули | Web API (fetch, streams, crypto, `URLPattern`), без `fs`, без `require`, без `eval` |
| Статус в Next 16.x | по умолчанию везде (рендер, Route Handlers, proxy) | `export const runtime = 'edge'` **deprecated** (документация советует удалить экспорт); доступен через deprecated `middleware.ts` |
| ISR | да | не поддерживается |
| Холодный старт | дольше | быстрый, лёгкие изоляты |
| Где выполняется | регион(ы) сервера | потенциально близко к пользователю |

Плюсы edge-вычислений: низкий TTFB для **логики без данных** (редиректы, A/B, гео, заголовки), быстрые холодные старты, дешёвое масштабирование. Минусы: ограниченный API и несовместимые пакеты (ORM, драйверы БД, SDK с Node-зависимостями); **физика данных** — если БД в одном регионе, рендер «у пользователя» делает N запросов через океан, и TTFB становится хуже, чем у Node-функции рядом с БД; лимиты на размер бандла и время выполнения у платформ; сложнее отладка и observability. Поэтому индустрия (и сам Next.js в 15.5 → 16) сместилась к Node.js по умолчанию: рендер рядом с данными + статический shell с CDN (PPR) дают «быстрый первый байт» без ограничений edge.

💡 На собеседовании: «Edge хорош для stateless-логики на границе сети. Для рендера с данными важнее близость к БД, чем к пользователю; быстрый первый байт сегодня даёт static shell с CDN, а не edge-рендер».

### Сборка и инструменты (16.x)

- Turbopack — бандлер по умолчанию для `next dev` и `next build` (16.0); webpack — `--webpack`. Кастомный `webpack`-конфиг при Turbopack-сборке → сборка падает (защита от молчаливого игнорирования). Конфиг — top-level `turbopack`.
- `next lint` удалён (16) — ESLint/Biome напрямую; `next build` не линтит.
- React Compiler: `reactCompiler: true` стабилен с 16 (не включён по умолчанию, замедляет сборку — работает через Babel; в 16.3–16.4 — экспериментальная Rust-версия).
- `next build` в 16 больше не показывает `First Load JS` — его признали неточным для RSC; мерить реальными CWV и Lighthouse.

## Вопросы с собеседований

<details><summary>Чем App Router отличается от Pages Router и стоит ли мигрировать?</summary>

App Router построен на RSC: серверные компоненты по умолчанию, данные загружаются в компонентах, вложенные layouts с сохранением состояния, встроенный стриминг (`loading.tsx`, Suspense), Server Actions, Cache Components/PPR. Pages Router — всё клиентское с SSR, данные через `getServerSideProps`/`getStaticProps` на уровне страницы. Мигрировать можно постепенно — роутеры сосуществуют. Для lead: оценить выигрыш (меньше JS, нет waterfall'ов клиент-сервер, PPR) против затрат (переобучение команды, совместимость библиотек с RSC, CSS-in-JS с runtime, новая модель кэша), начинать с новых разделов.
</details>

<details><summary>Почему error.tsx не ловит ошибку в layout.tsx того же сегмента?</summary>

Иерархия: `layout` → `template` → `error` → `loading` → `not-found` → `page`. Error boundary находится внутри layout, а граница не ловит ошибки своих предков. Ошибку layout ловит `error.tsx` родительского сегмента, а ошибку root layout — `global-error.tsx`, который рендерит свои `<html>`/`<body>`.
</details>

<details><summary>Как сделать модалку с собственным URL (фото в ленте)?</summary>

Parallel route `@modal` в layout + intercepting route `@modal/(.)photo/[id]/page.tsx`. При клиентском переходе из ленты срабатывает перехват — фото рендерится в слоте модалки поверх списка, URL меняется (можно поделиться). При прямом заходе/refresh перехвата нет — рендерится полноценная `photo/[id]/page.tsx`. Закрытие — `router.back()`. Нужен `@modal/default.tsx`, возвращающий `null` (с 16 обязателен).
</details>

<details><summary>Что приходит в браузер при первой загрузке и при клиентской навигации?</summary>

Первая загрузка: HTML (быстрый неинтерактивный показ) + RSC Payload (инлайном, для сверки деревьев) + JS клиентских компонентов (гидратация). Навигация через `<Link>`: только RSC Payload изменившихся сегментов (часто уже из prefetch), общие layouts не перерендериваются и сохраняют state, клиентские компоненты рендерятся в браузере без HTML.
</details>

<details><summary>Что такое Partial Prerendering и как он включается в Next 16?</summary>

Рендеринг, при котором маршрут — не «статический или динамический», а статический shell (HTML + RSC Payload, отдаётся с CDN) плюс динамические «дыры» на Suspense-границах, которые стримятся в том же ответе. В 14–15 был экспериментальным (`experimental.ppr`, `experimental_ppr`); в 16 эти флаги удалены, PPR — поведение по умолчанию модели Cache Components (`cacheComponents: true`). С 16.4 модель рекомендована для всех и включена в `create-next-app`, в 17 станет дефолтом.
</details>

<details><summary>Почему с Cache Components чтение cookies() без Suspense — ошибка?</summary>

Модель требует, чтобы каждый маршрут производил static shell. Runtime-данные (cookies, headers, searchParams, некэшированный fetch) неизвестны при сборке, и без Suspense-границы им «некуда» отложиться — пришлось бы блокировать весь ответ. Next показывает insight «blocking route» и предлагает: обернуть в `<Suspense>`, закэшировать через `'use cache'` (передав значения аргументами) или сдвинуть доступ глубже. В предыдущей модели тот же `cookies()` молча делал весь маршрут динамическим.
</details>

<details><summary>Как работает prefetch у Link и как его оптимизировать?</summary>

Ссылка префетчится при появлении во viewport (только production). Без Partial Prefetching: статический маршрут — целиком, динамический — до `loading.tsx` или никак. С Partial Prefetching (16.3+) — App Shell любого маршрута; `prefetch={true}` дополнительно рендерит кэшированный URL-зависимый контент (стоит серверный вызов на ссылку). В 16 — дедупликация layouts и инкрементальный prefetch, в 16.4 — `navigation()`/`prefetch()` для исключения тяжёлого контента. Оптимизации: `prefetch={false}` или hover-prefetch для больших списков, `loading.tsx`/Suspense для динамики, `useLinkStatus` для обратной связи на медленной сети.
</details>

<details><summary>Чем proxy.ts отличается от middleware.ts и для чего его НЕ использовать?</summary>

В 16 это переименование с уточнением: `proxy.ts` выполняется на Node.js (runtime не настраивается), `middleware.ts` остался deprecated-вариантом для Edge. Не использовать для: медленных запросов данных и походов в БД (выполняется на каждый запрос, включая prefetch), полноценной авторизации (matcher легко «теряет» маршруты, а Server Actions — это POST на страницу), простых редиректов (есть `redirects` в конфиге). Использовать для: оптимистичных редиректов по cookie, A/B-rewrite, гео, заголовков, CORS.
</details>

<details><summary>Node.js или Edge runtime — что выбрать в 2026?</summary>

По умолчанию Node.js: все API и пакеты, ISR, рендер рядом с БД. `runtime = 'edge'` в Next 16.x помечен deprecated, `proxy.ts` — только Node. Edge оправдан для stateless-логики на границе (редиректы, гео, флаги) на платформах, где это даёт выгоду. Главный аргумент: TTFB определяется расстоянием до данных; рендер на edge при БД в одном регионе даёт waterfall через сеть. Быструю отдачу первого байта решает static shell на CDN.
</details>

<details><summary>Как избежать CLS и ускорить LCP с next/image и next/font?</summary>

`next/image`: всегда размеры (`width/height`, статический импорт или `fill` с размерами контейнера), `sizes` для адаптивного `srcset`, для LCP-изображения — не lazy: `loading="eager"`/`fetchPriority="high"` или `preload` (в 16 заменил `priority`). `next/font`: шрифты self-host, fallback с подогнанными метриками, без запросов к сторонним доменам — нет FOUT-скачков и лишних соединений. Плюс `remotePatterns` для безопасности оптимизатора.
</details>

<details><summary>Когда Route Handler, а когда Server Action?</summary>

Server Action — мутации из собственного UI (формы, кнопки): типобезопасный вызов, интеграция с `useActionState`, ревалидация и новый UI в одном ответе, progressive enhancement. Route Handler — HTTP API для внешних клиентов: вебхуки (CMS → `revalidateTag`), мобильные клиенты, OAuth callback, файлы и стримы, GET с кэшированием на CDN. Server Actions не подходят для чтения: клиент выполняет их последовательно.
</details>

<details><summary>Что изменилось в Next 16 и что сломается при апгрейде с 15?</summary>

Turbopack по умолчанию (кастомный webpack-конфиг роняет сборку без `--webpack`), удалён синхронный доступ к `params`/`searchParams`/`cookies()`/`headers()`, `middleware` → `proxy`, `revalidateTag` требует второй аргумент, обязательные `default.tsx` у parallel slots, изменённые дефолты `next/image`, удалены AMP, `next lint`, `serverRuntimeConfig`/`publicRuntimeConfig`, флаги `experimental.ppr`/`dynamicIO` (→ `cacheComponents`). Node ≥ 20.9, TS ≥ 5.1. Инструменты: `npx @next/codemod@canary upgrade latest`, с 16.4 — `next upgrade --agent`.
</details>

## Практика

**1. Найди ошибки** (Next 16, `cacheComponents: true`):

```tsx
// app/shop/[slug]/layout.tsx
import { cookies } from 'next/headers';
export default async function Layout({ children, params }: LayoutProps<'/shop/[slug]'>) {
  const { slug } = await params;
  const theme = (await cookies()).get('theme')?.value;
  if (!(await isLoggedIn())) return null; // "защита" раздела
  return <div data-theme={theme}><Sidebar /><h1>{slug}</h1>{children}</div>;
}
```

<details><summary>Решение</summary>

1. `await params` и `cookies()` на верхнем уровне layout без Suspense блокируют shell всего раздела (insight «blocking route»); если `slug` не в `generateStaticParams`, layout вообще не пре-рендерится. Передать промисы вниз и развернуть внутри `<Suspense>`.
2. `return null` в layout — не защита: page, slots и Server Actions — отдельные точки входа и попадают в RSC Payload; к тому же layout не перерендеривается при навигации внутри раздела. Проверять сессию в DAL рядом с данными и в каждом экшене.
3. Тему из cookie лучше применять до первой отрисовки без блокировки рендера (класс на `<html>` из небольшого клиентского компонента/inline-скрипта, см. guide «Preventing Flash»), а не делать весь layout динамическим.
</details>

**2. Спроектируй** структуру `app/` для SaaS: маркетинговые страницы (свой header), приложение `/app/*` с сайдбаром и проверкой сессии, админка с отдельным root layout, модалка просмотра счёта `/app/invoices/[id]` поверх списка.

<details><summary>Решение</summary>

```
app/
├── (marketing)/layout.tsx, page.tsx, pricing/page.tsx      # root layout №1
├── (product)/layout.tsx                                    # root layout №2 (<html>, providers)
│   └── app/
│       ├── layout.tsx                                      # сайдбар; сессия — в DAL, user-меню в Suspense
│       ├── @modal/default.tsx                              # null
│       ├── @modal/(.)invoices/[id]/page.tsx                # модалка
│       └── invoices/{page.tsx, [id]/page.tsx}
└── (admin)/layout.tsx, admin/...                           # root layout №3
proxy.ts — оптимистичный редирект /app/* и /admin/* без cookie на /login
```

Переход между разными root layouts — полная перезагрузка, это приемлемо для marketing ↔ app. Роль admin проверяется в DAL/экшенах, а не только в proxy.
</details>

**3. Реализуй** функцию `matchRoute(pattern, pathname)` для паттернов App Router (`[id]`, `[...slug]`, `[[...slug]]`, route groups) — задача с автотестами в тесте темы.

## Источники
- https://nextjs.org/docs
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/getting-started
- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://nextjs.org/docs/app/getting-started/linking-and-navigating
- https://nextjs.org/docs/app/getting-started/caching
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/getting-started/images
- https://nextjs.org/docs/app/getting-started/fonts
- https://nextjs.org/docs/app/guides/scripts
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://nextjs.org/docs/app/getting-started/proxy
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/api-reference/edge
- https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime
- https://nextjs.org/docs/app/api-reference/components/image
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/blog/next-15
- https://nextjs.org/blog/next-16
- https://nextjs.org/blog/next-16-1
- https://nextjs.org/blog/next-16-2
- https://nextjs.org/blog/next-16-3
- https://nextjs.org/blog/next-16-4
