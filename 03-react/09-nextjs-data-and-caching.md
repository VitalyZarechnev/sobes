# Next.js: данные, кэш, мутации, деплой

> ⏱ ~4 ч · 🎯 Получать данные без водопадов, осознанно кэшировать по модели Cache Components (`'use cache'`, `cacheLife`, `cacheTag`), выполнять мутации через Server Actions с правильной ревалидацией и знать варианты деплоя.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Предыдущая тема: [основы App Router](08-nextjs-fundamentals.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Получаю данные в Server Components без водопадов (`Promise.all`, preload, `React.cache`)
- [ ] Передаю промис в Client Component и читаю через `use()`
- [ ] Объясню модель Cache Components: всё динамично, кэш явный через `'use cache'`
- [ ] Знаю профили `cacheLife` и разницу `revalidateTag` / `updateTag` / `revalidatePath` / `refresh`
- [ ] Пишу Server Actions с проверкой сессии и валидацией
- [ ] Знаю варианты деплоя и что значит self-hosting для кэша
- [ ] Ответил вслух на вопросы ниже

## Теория

> Страница описывает актуальную модель **Cache Components** (Next.js 16+, `cacheComponents: true`; в новых проектах `create-next-app` включает её по умолчанию). Где важно — отмечены отличия от **предыдущей модели** (неявный кэш `fetch`, `export const revalidate`, `dynamic`), которую вы встретите в существующих проектах.

### Получение данных в Server Components

```tsx
// app/artist/[id]/page.tsx — компонент асинхронный, данные читаются прямо на сервере
export default async function ArtistPage({ params }: PageProps<'/artist/[id]'>) {
  const { id } = await params;
  // ❌ Водопад: альбомы начнут грузиться только после артиста
  // const artist = await getArtist(id);
  // const albums = await getAlbums(id);

  // ✅ Параллельно: оба запроса стартуют сразу
  const [artist, albums] = await Promise.all([getArtist(id), getAlbums(id)]);
  return <Artist artist={artist} albums={albums} />;
}
```

- `fetch`, ORM, БД — прямо в компоненте; секреты и SQL не попадают на клиент. Модуль, который нельзя импортировать в клиент, помечают `import 'server-only'`.
- Layout'ы и страницы одного маршрута рендерятся параллельно, но внутри компонента последовательные `await` — водопад.
- `Promise.allSettled`, если частичный результат лучше полного отказа.

### Дедупликация и preload

```ts
import { cache } from 'react';
import 'server-only';

// React.cache: в рамках ОДНОГО запроса одинаковые вызовы возвращают один результат
export const getUser = cache(async (id: string) => db.user.findUnique({ where: { id } }));

// Preload: стартуем запрос заранее, не дожидаясь, и переиспользуем в компоненте
export const preloadUser = (id: string) => {
  void getUser(id);
};
```

`React.cache` живёт только в пределах запроса — это не межзапросный кэш. Одинаковые `fetch` в одном рендере тоже дедуплицируются.

### Стриминг и Client Components

Медленные данные — за `<Suspense>` (или `loading.tsx` для всего сегмента): fallback уходит сразу, контент дотекает стримингом. Промис можно передать в Client Component **без await** и прочитать через `use()`:

```tsx
// page.tsx (сервер)
export default function Page() {
  const posts = getPosts(); // не ждём
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <Posts posts={posts} />
    </Suspense>
  );
}

// posts.tsx
'use client';
import { use } from 'react';
export function Posts({ posts }: { posts: Promise<Post[]> }) {
  const all = use(posts); // приостанавливает компонент до разрешения
  return <ul>{all.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

Для интерактивного клиентского кэша (бесконечные списки, оптимистичные обновления, polling) по-прежнему уместны TanStack Query или SWR.

### Модель Cache Components

Всё **динамично по умолчанию**, кэширование — **явное**. При сборке Next.js рендерит дерево и строит **static shell** (Partial Prerendering):

| Что делает компонент | Что попадает в shell |
|---|---|
| только синхронная работа, импорты модулей, чистые вычисления | результат целиком |
| `'use cache'` (+ `cacheLife`), если срок не «короткий» | закэшированный результат |
| некэшированные данные или runtime API (`cookies`, `headers`, `searchParams`, неизвестные `params`) **за `<Suspense>`** | fallback, контент стримится при запросе |
| `Math.random()`, `Date.now()`, `crypto.randomUUID()` | нужно явно: `await connection()` + Suspense (своё значение на запрос) или `'use cache'` (общее) |

Если runtime-данные или некэшированный запрос оказались **без** Suspense-границы, dev-оверлей показывает insight **blocking route** и предлагает исправления: обернуть в Suspense, закэшировать или сдвинуть доступ глубже по дереву. Это проверка, что каждый маршрут даёт static shell — значит, прямые заходы мгновенны и отдаются с CDN.

🪤 **Ловушка (предыдущая модель):** один вызов `cookies()` молча делал **весь маршрут** динамическим. В Cache Components он затрагивает только поддерево внутри ближайшего Suspense.

### `'use cache'`, `cacheLife`, `cacheTag`

```ts
import { cacheLife, cacheTag } from 'next/cache';

// Кэш на уровне данных
export async function getProducts(category: string) {
  'use cache';
  cacheLife('hours'); // профиль: stale 5m / revalidate 1h / expire 1d
  cacheTag('products', `category:${category}`);
  return db.product.findMany({ where: { category } });
}
```

- Директива ставится в начало async-функции, компонента, страницы или файла (тогда кэшируются все экспорты).
- **Ключ кэша** — аргументы и захваченные из замыкания значения: разные входы — разные записи. Аргументы и результат должны сериализоваться.
- Runtime API (`cookies()`, `headers()`) **внутри** `'use cache'` читать нельзя — их значения передают аргументами из некэшированного родителя (или используют `'use cache: private'`).
- Рекомендуется всегда указывать `cacheLife`; без него действует профиль `default` (stale 5m, revalidate 15m, expire never).

| Профиль | stale | revalidate | expire |
|---|---|---|---|
| `seconds` | 30s | 1s | 60s |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |
| `days` | 5m | 1d | 1w |
| `weeks` | 5m | 1w | 30d |
| `max` | 5m | 30d | 1y |

`stale` — сколько клиент может показывать данные без проверки; `revalidate` — после этого запрос отдаёт старое и обновляет в фоне; `expire` — после этого старое не отдаётся, запрос ждёт свежее. «Короткий» кэш (`seconds`, `revalidate: 0`, `expire` < 5 минут) не попадает в prerender и становится динамической «дырой».

### Ревалидация

| API | Где | Поведение | Когда |
|---|---|---|---|
| `revalidateTag(tag, 'max')` | Server Actions, Route Handlers | stale-while-revalidate: сразу отдаётся старое, свежее генерируется в фоне | контент, где допустима задержка; вебхук от CMS |
| `updateTag(tag)` | только Server Actions | немедленно истекает | read-your-own-writes: пользователь сразу видит своё изменение |
| `revalidatePath('/path')` | Server Actions, Route Handlers | весь кэш маршрута | когда теги неизвестны (лучше теги — точнее) |
| `refresh()` | Server Actions | обновляет клиентский роутер, **не** трогает тегированный кэш | показать свежие некэшированные данные текущей страницы |

Рецепт для CMS: `'use cache'` + `cacheLife('max')` + `cacheTag('posts')`, вебхук CMS → Route Handler → `revalidateTag('posts', 'max')`. Время не тратится на бессмысленные пересборки неизменённого контента.

### Мутации: Server Actions

```ts
// app/posts/actions.ts
'use server';
import { z } from 'zod';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';

const schema = z.object({ title: z.string().min(3), content: z.string().min(1) });

export async function createPost(prev: { error?: string }, formData: FormData) {
  const session = await verifySession(); // Server Action — публичный эндпоинт: проверяем права всегда
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Проверьте поля формы' };
  const post = await db.post.create({ data: { ...parsed.data, authorId: session.userId } });
  updateTag('posts'); // автор сразу увидит свой пост
  redirect(`/posts/${post.id}`);
}
```

- Вызов из `<form action>` (работает до гидратации, отправки ставятся в очередь), из обработчиков событий, через `useActionState` (состояние результата и pending) и `useOptimistic`.
- Ответ Server Action приносит обновлённый RSC-payload — UI и данные обновляются за один запрос.
- Клиент выполняет Server Actions **последовательно** — не используйте их для чтения данных.
- Безопасность: каждая Server Action — POST-эндпоинт, доступный кому угодно; проверка сессии и прав, валидация входа, не доверять скрытым полям. Next.js шифрует захваченные замыканием значения и проверяет `Origin`, но это не заменяет авторизацию. Возвращать минимум данных (DTO).

### Route Handlers vs Server Actions

Server Actions — мутации из своего UI. Route Handlers (`app/api/.../route.ts`) — HTTP API для внешних клиентов: вебхуки, мобильные приложения, OAuth callback, файлы и стримы, GET с CDN-кэшированием. В Cache Components `GET`-хэндлеры следуют той же модели пре-рендера, что и страницы.

### Предыдущая модель (для поддержки старых проектов)

| Предыдущая модель | Cache Components |
|---|---|
| `fetch(url, { next: { revalidate: 60, tags: ['posts'] } })` | `'use cache'` + `cacheLife` + `cacheTag` в функции |
| `export const revalidate = 60` (сегмент) | `cacheLife` в странице/layout |
| `export const dynamic = 'force-dynamic'` | не нужно: всё динамично по умолчанию, Suspense вокруг |
| `export const dynamic = 'force-static'` | `'use cache'` |
| `unstable_cache(fn, keys, opts)` | `'use cache'` |
| `cookies()` делает весь маршрут динамическим | влияет только на поддерево в Suspense |

В Next.js 15 `fetch` по умолчанию **не** кэшируется (в 14 кэшировался) — частый источник путаницы на интервью.

### Деплой

| Вариант | Возможности |
|---|---|
| Node.js-сервер (`next build && next start`) | все возможности |
| Docker (`output: 'standalone'` — минимальный образ) | все возможности |
| Static export (`output: 'export'`) | ограниченно: без серверных функций, Server Actions, ISR, proxy |
| Адаптеры платформ (Deployment Adapter API; верифицированные — Vercel, Bun) | зависит от платформы |

Self-hosting нескольких инстансов: кэш по умолчанию в памяти/на диске каждого инстанса — для согласованной ревалидации нужен общий cache handler (например, Redis), а также общий ключ шифрования Server Actions и одинаковый `deploymentId`/build ID; CDN перед сервером с уважением к заголовкам `Cache-Control`. В serverless-средах записи кэша в памяти могут не сохраняться между вызовами.

## Вопросы с собеседований

<details><summary>Как избежать водопадов при получении данных в App Router?</summary>

Запускать независимые запросы параллельно (`Promise.all`), стартовать запросы раньше (preload без await + `React.cache` для дедупликации), передавать промисы в Client Components и читать через `use()`, разносить медленные части по Suspense-границам, чтобы быстрые не ждали медленных.
</details>

<details><summary>Объясните модель Cache Components.</summary>

Всё динамично по умолчанию, кэш объявляется явно `'use cache'` с `cacheLife`/`cacheTag`. При сборке строится static shell: статичное и закэшированное попадает в него, некэшированное и runtime-данные за Suspense стримятся при запросе (PPR). Если runtime-доступ без Suspense — Next показывает blocking route и предлагает исправления. Ключ кэша — аргументы и замыкание.
</details>

<details><summary>Чем `updateTag` отличается от `revalidateTag`?</summary>

`updateTag` — только в Server Actions, немедленно истекает кэш: пользователь сразу видит свою мутацию. `revalidateTag(tag, profile)` — в Server Actions и Route Handlers, stale-while-revalidate: сразу отдаётся старое, свежее генерируется в фоне — для вебхуков и контента, где задержка допустима.
</details>

<details><summary>Почему Server Action нужно защищать так же, как API-эндпоинт?</summary>

Это публичный POST-эндпоинт, который можно вызвать напрямую, минуя UI. Нужны проверка сессии и прав в самой функции, валидация входа (zod), ограничение возвращаемых данных. Проверка в `proxy.ts` недостаточна.
</details>

<details><summary>Почему `React.cache` — не кэш между запросами?</summary>

Его область — один серверный запрос (рендер): дедупликация одинаковых вызовов в разных компонентах. Межзапросный кэш — `'use cache'` (или `unstable_cache`/`fetch`-кэш в предыдущей модели).
</details>

<details><summary>Что меняется при self-hosting нескольких инстансов Next.js?</summary>

Кэш и ревалидация локальны для каждого инстанса — нужен общий cache handler; согласованные ключ шифрования Server Actions и идентификатор сборки, иначе запросы между версиями ломаются; CDN и заголовки кэширования настраиваются самостоятельно.
</details>

## Практика

1. Страница товара: данные товара и отзывов параллельно, отзывы за Suspense, цены через `'use cache'` + `cacheTag('prices')`.
2. Server Action «добавить в избранное» с `useOptimistic`, проверкой сессии и `updateTag`.
3. Route Handler для вебхука CMS с проверкой подписи и `revalidateTag('posts', 'max')`.
4. Перепишите страницу из предыдущей модели (`export const revalidate`, `fetch` с `next.tags`) на Cache Components.

Тест темы: [Next.js: данные и кэш](../quizzes/quiz.html?id=03-react/09-nextjs-data-and-caching).

## Источники
- [Next.js: Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js: Caching](https://nextjs.org/docs/app/getting-started/caching)
- [Next.js: Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)
- [Next.js: Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Next.js: use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Next.js: Caching without Cache Components (previous model)](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- [Next.js: Deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [Next.js: Self-Hosting](https://nextjs.org/docs/app/guides/self-hosting)
