# React 19 и Server Components

> ⏱ ~4 ч · 🎯 Объяснить модель React Server Components (что выполняется где, что сериализуется, где граница), Server Functions/Actions, новые хуки React 19 и стратегии рендеринга (SSR/SSG/ISR/streaming), а также уметь рассуждать об архитектуре на Next.js App Router.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Различаю RSC и SSR и могу объяснить, как они работают вместе
- [ ] Знаю правила границы `'use client'` и сериализуемые пропсы
- [ ] Понимаю `'use server'`, безопасность Server Functions
- [ ] Использую `use`, `useActionState`, `useOptimistic`, `useFormStatus`, `<form action>`
- [ ] Сравниваю CSR/SSR/SSG/ISR/streaming/PPR по trade-offs

## Теория

### Что нового в React 19 (обзор)

- **Actions**: async-функции в transitions, `<form action={fn}>`, автоматическое управление pending/ошибками/оптимистичными обновлениями.
- Хуки: `useActionState`, `useOptimistic`, `useFormStatus` (из `react-dom`), API `use`.
- **Server Components** и **Server Functions** стабильны (для фреймворков).
- `ref` как проп, cleanup у ref-колбэков, `<Context>` как провайдер.
- Метаданные документа (`<title>`, `<meta>`, `<link>`) в любом компоненте — поднимаются в `<head>`.
- Стили с `precedence`, async-скрипты с дедупликацией, preload API (`preload`, `preinit`, `prefetchDNS`).
- Лучшие сообщения о hydration mismatch, `onCaughtError`/`onUncaughtError` у корня.
- Custom Elements полноценно поддерживаются.
- 19.1/19.2: Owner Stack, `<Activity>`, `useEffectEvent`, `cacheSignal`, Performance Tracks, частичный пре-рендер (`prerender`/`resume` в `react-dom/static`).
- Удалено: `propTypes` и `defaultProps` у функций, string refs, legacy context, `ReactDOM.render`/`hydrate`, `react-test-renderer/shallow`. Create React App официально «закат» (февраль 2025) — рекомендуются фреймворки или Vite.

### Server Components: модель

**React Server Components (RSC)** — компоненты, которые выполняются **только на сервере** (или во время сборки) и никогда не отправляют свой код в браузер. Результат их рендера — не HTML, а сериализованное дерево React-элементов (**RSC payload**, формат «Flight»), в котором клиентские компоненты представлены ссылками на модули.

```tsx
// app/products/[id]/page.tsx — Server Component по умолчанию (Next.js App Router)
import { db } from '@/lib/db';
import { AddToCart } from './add-to-cart'; // клиентский компонент

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } }); // прямой доступ к БД
  if (!product) notFound();
  return (
    <article>
      <h1>{product.title}</h1>
      <Markdown source={product.description} /> {/* тяжёлая библиотека остаётся на сервере */}
      <AddToCart productId={product.id} price={product.price} />
    </article>
  );
}
```

```tsx
// add-to-cart.tsx
'use client';
import { useState } from 'react';
export function AddToCart({ productId, price }: { productId: string; price: number }) {
  const [qty, setQty] = useState(1);
  return <button onClick={() => setQty(q => q + 1)}>Добавить {qty}</button>;
}
```

Свойства Server Components:
- Могут быть `async`, обращаться к БД, файловой системе, секретам.
- Не могут использовать state, эффекты, обработчики событий, браузерные API, контекст (ни создавать, ни читать).
- Их зависимости не попадают в клиентский бандл (zero-bundle-size).
- Не гидратируются; при навигации сервер присылает новый payload, React **сливает** его с текущим деревом, сохраняя состояние клиентских компонентов.

### Граница `'use client'`

- `'use client'` в начале файла отмечает **точку входа** в клиентский граф модулей. Всё, что этот файл импортирует, тоже становится клиентским.
- Это не «этот компонент клиентский», а «этот модуль и его импорты — клиентский бандл». Не нужно ставить директиву в каждом файле.
- Клиентские компоненты **тоже рендерятся на сервере** при SSR (для HTML), а затем гидратируются.
- Серверный компонент можно передать в клиентский **через пропсы/children** (он уже отрендерен на сервере), но нельзя **импортировать** серверный модуль в клиентский.

```tsx
// Server Component
<ClientTabs>
  <ServerHeavyList />   {/* рендерится на сервере, передаётся как готовый узел */}
</ClientTabs>
```

Пропсы через границу должны быть **сериализуемыми**: примитивы, plain-объекты, массивы, `Date`, `Map`, `Set`, `BigInt`, typed arrays, промисы (!), JSX-элементы, Server Functions. Нельзя: обычные функции, классы-инстансы, символы (кроме глобально зарегистрированных).

🪤 Ловушка: передать обработчик `onClick` из Server Component в Client Component — ошибка. Передавайте Server Function или переносите логику на клиент.

🪤 Ловушка: «отравление» клиентского бандла — случайный импорт серверного модуля с секретами в клиентский файл. Защита — пакет `server-only` (ошибка сборки при импорте в клиентский граф) и `taint`-API (`experimental_taintObjectReference`).

Стратегия: держать клиентские компоненты **листьями** дерева, максимально маленькими (кнопка, форма, интерактивный виджет), а данные загружать в серверных.

### RSC vs SSR

| | SSR | RSC |
|---|---|---|
| Что на выходе | HTML-строка/поток | сериализованное React-дерево (payload) |
| Когда | на запрос (или при сборке) | на запрос или при сборке |
| Код компонента в браузере | да, гидратируется | нет |
| Повторный рендер при навигации | нет, только первый запрос | да, сервер присылает новый payload |
| Состояние/эффекты | да (после гидратации) | нет |

Они **дополняют** друг друга: в Next.js запрос → RSC-рендер серверных компонентов в payload → SSR превращает payload + клиентские компоненты в HTML → браузер получает HTML + payload (inline) → гидратация клиентских компонентов.

💡 На собеседовании: «SSR решает проблему первого показа (HTML быстро), но всё равно гидратирует весь JS. RSC решает проблему объёма JS и доступа к данным: часть дерева вообще не уходит в браузер. В связке получаем быстрый первый показ и меньше гидратации».

### Server Functions и Server Actions

`'use server'` помечает async-функцию (или все экспорты файла) как вызываемую с клиента. Бандлер заменяет её на клиенте ссылкой; вызов — это POST-запрос на сервер с сериализованными аргументами. Когда Server Function используется в `action` формы или в transition, её называют **Server Action**.

```ts
// app/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const Schema = z.object({ title: z.string().min(1).max(200) });

export async function createTodo(prevState: { error?: string }, formData: FormData) {
  const session = await auth();                         // 1. аутентификация
  if (!session) return { error: 'Нужно войти' };
  const parsed = Schema.safeParse({ title: formData.get('title') }); // 2. валидация
  if (!parsed.success) return { error: 'Некорректное название' };
  try {
    await db.todo.create({ data: { ...parsed.data, userId: session.userId } }); // 3. авторизация по userId
  } catch (e) {
    console.error('createTodo failed', e);
    return { error: 'Не удалось сохранить' };           // не утекаем деталями
  }
  revalidatePath('/todos');
  return {};
}
```

Безопасность (обязательно на lead-уровне):
- Server Function — это **публичный HTTP-эндпоинт**. Любой может вызвать её с любыми аргументами. Аутентификация, авторизация и валидация — в каждой функции.
- Аргументы и замыкания сериализуются: функция, объявленная внутри Server Component, замыкает значения, которые шифруются фреймворком, но не стоит замыкать секреты.
- CSRF: Next.js проверяет Origin, формы — POST; всё равно учитывать.
- Server Functions предназначены для мутаций; для чтения данных лучше Server Components (Server Functions выполняются последовательно).

### Хуки форм и Actions

```tsx
'use client';
import { useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';
import { createTodo } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus(); // статус ближайшей родительской <form>
  return <button disabled={pending}>{pending ? 'Сохраняю…' : 'Добавить'}</button>;
}

export function TodoForm({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos, // реальные данные — обновятся после revalidatePath
    (current, title: string) => [...current, { id: `tmp-${crypto.randomUUID()}`, title, pending: true }],
  );
  // action выполняется внутри transition — здесь можно вызывать addOptimistic
  const [state, formAction] = useActionState(async (prev: { error?: string }, fd: FormData) => {
    addOptimistic(String(fd.get('title') ?? ''));
    return createTodo(prev, fd);
  }, {});

  return (
    <>
      <ul>{optimisticTodos.map(t => <li key={t.id} style={{ opacity: t.pending ? 0.5 : 1 }}>{t.title}</li>)}</ul>
      <form action={formAction}>
        <input name="title" />
        <SubmitButton />
        {state.error && <p role="alert">{state.error}</p>}
      </form>
    </>
  );
}
```

- **`<form action={fn}>`** — fn получает `FormData`, вызывается в transition; после успешного завершения неконтролируемые поля формы **сбрасываются** автоматически (`requestFormReset`). С Server Action форма работает **до гидратации** (progressive enhancement).
- **`useActionState(action, initialState, permalink?)`** → `[state, dispatch, isPending]`. Action получает `(prevState, payload)`. Вызовы ставятся в очередь последовательно. Ранее назывался `useFormState` в `react-dom`.
- **`useOptimistic(state, updateFn)`** — временное значение на время выполнения action/transition; когда transition завершается, оптимистичное значение отбрасывается и показывается реальный `state` (если сервер не подтвердил — «откатится» сам). Вызывать `addOptimistic` можно только внутри action/transition.
- **`useFormStatus()`** — `{ pending, data, method, action }` родительской формы; работает только в компоненте **внутри** `<form>`.

### use()

```tsx
import { use, Suspense } from 'react';

// Сервер: создаём промис, НЕ ждём его — отдаём клиенту
export default function Page() {
  const commentsPromise = getComments(); // начинаем загрузку сразу
  return (
    <Suspense fallback={<Spinner />}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}

// Клиент
'use client';
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise); // приостанавливается до резолва
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}
```

- `use(promise)` — приостанавливает рендер до резолва (Suspense), при reject — ближайший Error Boundary.
- `use(Context)` — как `useContext`, но можно вызывать **условно** и в циклах.
- 🪤 Ловушка: промис, созданный в рендере клиентского компонента (`use(fetch(...))`), пересоздаётся на каждом рендере → бесконечная приостановка. Промисы должны приходить из серверного компонента, кэша или библиотеки.
- `use` нельзя вызывать в try/catch — ошибки ловит Error Boundary.

### Стратегии рендеринга

| Стратегия | Когда генерируется HTML | Плюсы | Минусы | Подходит |
|---|---|---|---|---|
| CSR | в браузере | простой хостинг, богатая интерактивность | пустой HTML, медленный LCP, SEO | админки, внутренние инструменты |
| SSR | на каждый запрос | свежие данные, SEO, быстрый FCP | нагрузка на сервер, TTFB зависит от самого медленного запроса | персонализированные страницы |
| SSG | при сборке | CDN, мгновенно, дёшево | устаревание, долгие сборки при большом числе страниц | маркетинг, документация, блог |
| ISR | при сборке + фоновая регенерация по таймеру/по требованию | статика + свежесть | eventual consistency, сложность кэша | каталоги, контент из CMS |
| Streaming SSR | на запрос, по частям | быстрый TTFB, оболочка сразу, медленные части позже | нельзя менять статус/заголовки после начала стрима | страницы со смесью быстрых/медленных данных |
| PPR (Partial Prerendering) | статическая оболочка при сборке + динамические «дыры» стримятся на запрос | лучшее из SSG и SSR | новая модель, требует Suspense-границ | e-commerce, дашборды |

**Streaming**: `renderToPipeableStream` / `renderToReadableStream`. Сервер сразу отдаёт оболочку и fallback'и Suspense-границ, затем по мере резолва данных дописывает HTML-фрагменты с inline-скриптами, которые вставляют их на место. В сочетании с selective hydration пользователь может взаимодействовать с готовыми частями раньше.

### Next.js App Router в общих чертах

- Файловая маршрутизация в `app/`: `page.tsx`, `layout.tsx` (сохраняет state при навигации), `loading.tsx` (автоматическая Suspense-граница), `error.tsx` (Error Boundary, клиентский), `not-found.tsx`, `route.ts` (API-хэндлеры), группы `(group)`, динамические `[id]`, параллельные `@slot` и перехватывающие `(..)` маршруты.
- Компоненты по умолчанию серверные. Загрузка данных — `async`-компоненты с `fetch`/ORM.
- Кэширование: исторически самая запутанная часть (Request Memoization, Data Cache, Full Route Cache, Router Cache). В Next.js 15 `fetch` по умолчанию не кэшируется; в Next.js 16 представлены **Cache Components** с директивой `'use cache'` и явными `cacheLife`/`cacheTag` — кэширование становится opt-in.
- Ревалидация: `revalidatePath`, `revalidateTag`, ISR через `revalidate`.
- Middleware (в 16 переименован в `proxy`) для редиректов/авторизации на edge.
- Альтернативы с RSC: React Router v7 (framework mode, RSC в превью), Waku, TanStack Start (RSC в разработке). Без RSC: Remix-подход с loader/action, Astro с островами.

💡 На собеседовании про архитектуру: «Данные загружаю как можно выше и параллельно в серверных компонентах, интерактивность — маленькими клиентскими островами, Suspense-границы ставлю по смысловым блокам, мутации — через Server Actions с валидацией и ревалидацией кэша по тегам».

## Вопросы с собеседований

<details><summary>Чем Server Components отличаются от SSR?</summary>

SSR превращает дерево в HTML для первого показа, но весь код затем гидратируется. RSC выполняются только на сервере, их код не попадает в бандл, результат — сериализованное дерево, которое может перезапрашиваться при навигации без потери клиентского состояния. Они работают вместе: RSC-payload + клиентские компоненты → SSR → HTML.
</details>

<details><summary>Что означает 'use client' и где его ставить?</summary>

Граница модульного графа: файл и всё, что он импортирует, попадает в клиентский бандл. Ставить в точках входа интерактивных частей, держать их листьями. Клиентские компоненты тоже пре-рендерятся на сервере.
</details>

<details><summary>Как передать Server Component внутрь Client Component?</summary>

Через `children` или другой проп с JSX из серверного родителя. Импортировать серверный компонент в клиентский модуль нельзя — он станет клиентским (и упадёт, если использует серверные API).
</details>

<details><summary>Какие пропсы можно передать из серверного компонента в клиентский?</summary>

Сериализуемые: примитивы, plain-объекты, массивы, Date, Map, Set, BigInt, промисы, JSX, Server Functions. Нельзя обычные функции и инстансы классов.
</details>

<details><summary>Что такое Server Action и какие у него риски?</summary>

Async-функция с `'use server'`, вызываемая с клиента через RPC (POST). Используется в `<form action>` и transitions. Риски: это публичный эндпоинт — нужна аутентификация, авторизация, валидация входных данных, защита от утечки деталей ошибок, rate limiting. Не использовать для чтения данных — выполняются последовательно.
</details>

<details><summary>Как работает useOptimistic?</summary>

Принимает базовое состояние и редьюсер. Во время действующей transition/action возвращает оптимистичное значение; по завершении автоматически возвращается к базовому, которое к этому моменту обновлено (ревалидацией или setState). При ошибке «откат» происходит сам собой, ошибку нужно показать отдельно.
</details>

<details><summary>Чем useActionState удобнее ручного useState + try/catch?</summary>

Даёт state результата, pending, последовательную очередь вызовов, интеграцию с `<form action>` и progressive enhancement (работает до гидратации с Server Action, `permalink` для навигации без JS). Меньше шаблонного кода и гонок.
</details>

<details><summary>Чем use() отличается от остальных хуков?</summary>

Можно вызывать условно и в циклах, т.к. не хранит состояние в списке хуков. Читает промис (с Suspense) или контекст. Промис должен быть стабильным — создан вне рендера клиентского компонента.
</details>

<details><summary>Что такое стриминг SSR и какие у него ограничения?</summary>

Сервер отдаёт HTML по частям: оболочка и fallback сразу, затем фрагменты Suspense-границ. Улучшает TTFB/FCP и позволяет selective hydration. Ограничения: после старта стрима нельзя изменить HTTP-статус и заголовки (редиректы/404 — до первой границы или через meta/JS), SEO-боты должны дожидаться полного стрима, CDN/прокси не должны буферизовать.
</details>

<details><summary>SSG vs ISR vs SSR — как выбрать?</summary>

По частоте изменения данных и персонализации. Одинаково для всех и редко меняется — SSG. Меняется периодически, страниц много — ISR/on-demand revalidation. Персонализировано или нужны мгновенно свежие данные — SSR (стриминг). Смесь — PPR: статическая оболочка + динамические части.
</details>

<details><summary>Как избежать водопадов запросов в RSC?</summary>

Запускать независимые запросы параллельно (`Promise.all` или создать промисы и передать вниз), не делать последовательных `await` в родителе и потомке без необходимости, использовать `preload`-паттерн, кэшировать дедупликацией (`React.cache`), ставить Suspense-границы так, чтобы медленное не блокировало быстрое.
</details>

<details><summary>Почему в RSC нет контекста и как тогда передавать данные?</summary>

Контекст — механизм клиентского рендера дерева со state. На сервере данные передаются пропсами или через `React.cache` — мемоизированные на время запроса функции (`getCurrentUser = cache(async () => ...)`), которые можно вызывать в любом серверном компоненте без повторного запроса.
</details>

## Практика

**1. Найди ошибку.**

```tsx
// page.tsx (server)
export default async function Page() {
  const user = await getUser();
  return <Profile user={user} onLogout={() => signOut()} />; // Profile — 'use client'
}
```

<details><summary>Решение</summary>

Обычную функцию нельзя передать через границу — не сериализуется. Решение: сделать `signOut` Server Function (`'use server'`) и передать её, или вызвать её внутри клиентского компонента импортом из файла с `'use server'`. Также проверить, что `user` не содержит лишних полей (хэш пароля, токены) — всё, что передано в клиентский компонент, попадает в HTML/payload.
</details>

**2. Спроектируй** страницу товара: описание (CMS, меняется раз в день), цена и остатки (меняются постоянно), отзывы (медленный сервис), кнопка «в корзину».

<details><summary>Решение</summary>

Описание — статическая часть (кэш с `cacheTag` и ревалидацией по вебхуку CMS). Цена/остатки — динамический Server Component в отдельной Suspense-границе (PPR-«дыра»). Отзывы — отдельная Suspense-граница со скелетоном, промис стартует сразу на уровне страницы. Кнопка — маленький клиентский компонент со Server Action и `useOptimistic` для счётчика корзины; `revalidateTag('cart')` после мутации.
</details>

**3. Реализуй** форму комментария с `useActionState`, показом ошибки и блокировкой кнопки без единого `useState`.

<details><summary>Решение</summary>

```tsx
'use client';
import { useActionState } from 'react';
import { addComment } from './actions'; // (prev, formData) => Promise<{ error?: string; ok?: boolean }>

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(addComment, {});
  return (
    <form action={action}>
      <input type="hidden" name="postId" value={postId} />
      <textarea name="text" required maxLength={2000} />
      <button disabled={pending}>Отправить</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```
</details>

## Источники
- https://react.dev/blog/2024/12/05/react-19
- https://react.dev/blog/2025/10/01/react-19-2
- https://react.dev/reference/rsc/server-components
- https://react.dev/reference/rsc/server-functions
- https://react.dev/reference/rsc/use-client
- https://react.dev/reference/rsc/use-server
- https://react.dev/reference/react/use
- https://react.dev/reference/react/useActionState
- https://react.dev/reference/react/useOptimistic
- https://react.dev/reference/react-dom/hooks/useFormStatus
- https://react.dev/reference/react/cache
- https://react.dev/reference/react-dom/server/renderToReadableStream
- https://react.dev/blog/2025/02/14/sunsetting-create-react-app
- https://nextjs.org/docs/app
