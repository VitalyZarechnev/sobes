# Новинки React: 19.0–19.3 и React Compiler

> ⏱ ~2 ч · 🎯 Знать, что появилось в React 19 и последующих минорных версиях, чем Actions и новые хуки меняют работу с формами и асинхронностью, что такое React Compiler, `<Activity>`, `useEffectEvent`, `<ViewTransition>`, и какие уроки дали инциденты безопасности Server Components.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [React 19 и Server Components](05-react-19-and-server-components.md) · [Производительность](04-performance.md) · [Next.js](08-nextjs-fundamentals.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, что такое Actions и как с ними связаны `useActionState`, `useOptimistic`, `useFormStatus`
- [ ] Могу объяснить `use()` и чем он отличается от остальных хуков
- [ ] Знаю, что даёт React Compiler 1.0 и как его внедрять
- [ ] Знаю `<Activity>`, `useEffectEvent` (19.2) и `<ViewTransition>`, Fragment refs (19.3)
- [ ] Знаю про CVE-2025-55182 и выводы из него

## Теория

### 1. Хронология

| Версия / событие | Дата | Главное |
|---|---|---|
| React 19 | декабрь 2024 | Actions, `useActionState`, `useOptimistic`, `useFormStatus`, `use`, `ref` как проп, `<Context>` как провайдер, метаданные документа, стабильные Server Components |
| Закрытие Create React App | февраль 2025 | CRA объявлен устаревшим; рекомендуются фреймворки (Next.js, React Router) или Vite |
| React 19.1 | март 2025 | Owner Stack (`captureOwnerStack`), улучшения Suspense и гидратации |
| React 19.2 | октябрь 2025 | `<Activity>`, `useEffectEvent`, `cacheSignal`, Performance Tracks в DevTools, Partial Pre-rendering API |
| React Compiler 1.0 | октябрь 2025 | первый стабильный релиз компилятора |
| React Foundation | октябрь 2025 – февраль 2026 | React переходит под управление фонда при Linux Foundation |
| CVE-2025-55182 | декабрь 2025 | критическая уязвимость в Server Components (CVSS 10.0) |
| React 19.3 | сентябрь 2026 | стабильные `<ViewTransition>` и Fragment refs, `<Context>` в Server Components, `browser()`, поддержка Trusted Types |

### 2. React 19: Actions

**Action** — асинхронная функция, запущенная в переходе (transition). React сам отслеживает её состояние: ожидание, ошибку, результат, оптимистичные обновления. Формы получили нативную поддержку: в `<form action={fn}>` можно передать функцию.

```jsx
function ChangeName({ currentName, onSave }) {
  // state — результат последнего вызова, formAction — функция для формы, isPending — флаг ожидания
  const [error, formAction, isPending] = useActionState(async (prevState, formData) => {
    const name = formData.get('name');
    const result = await updateName(name);
    if (result.error) return result.error; // становится новым state
    onSave(name);
    return null;
  }, null);

  return (
    <form action={formAction}>
      <input name="name" defaultValue={currentName} />
      <SubmitButton />
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus(); // статус ближайшей родительской формы, без пропсов
  return <button disabled={pending}>{pending ? 'Сохраняем…' : 'Сохранить'}</button>;
}
```

| Хук / API | Для чего |
|---|---|
| `useActionState(action, initial)` | состояние результата action + `isPending`; работает и с Server Functions, и с прогрессивным улучшением (форма работает до гидратации) |
| `useFormStatus()` | `pending`, `data`, `method`, `action` ближайшей формы — для кнопок и индикаторов внутри формы |
| `useOptimistic(state, updateFn)` | показать ожидаемый результат сразу; React откатит его, если action завершится без подтверждения |
| `startTransition(async () => …)` | переходы теперь принимают async-функции |
| `<form action>`, `<button formAction>` | функции вместо URL; после успешного action неконтролируемые поля формы сбрасываются |

```jsx
function Likes({ count, like }) {
  const [optimisticCount, addOptimistic] = useOptimistic(count, (current, delta) => current + delta);
  return (
    <form action={async () => { addOptimistic(1); await like(); }}>
      <button>❤️ {optimisticCount}</button>
    </form>
  );
}
```

### 3. React 19: use и другие изменения

**`use(resource)`** читает промис или контекст. В отличие от остальных хуков, его **можно вызывать в условиях и циклах**. С промисом компонент приостанавливается (Suspense) до его выполнения. Промис нужно создавать вне рендера (в Server Component, загрузчике роутера или кэше), иначе на каждый рендер будет новый промис.

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // приостановка до загрузки, ошибка уходит в Error Boundary
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}

function Banner({ show }) {
  if (!show) return null;
  const theme = use(ThemeContext); // условный вызов разрешён только для use
  return <div className={theme} />;
}
```

Другие изменения React 19:
- **`ref` — обычный проп** у функциональных компонентов, `forwardRef` больше не нужен (будет объявлен устаревшим).
- **Функция очистки в ref-колбэке**: `ref={(node) => { …; return () => cleanup(); }}`.
- **`<Context value={…}>`** вместо `<Context.Provider>`.
- **Метаданные документа**: `<title>`, `<meta>`, `<link>` внутри компонентов поднимаются в `<head>`.
- **Таблицы стилей с приоритетом**: `<link rel="stylesheet" precedence="default">`, React управляет порядком и дедупликацией.
- **API предзагрузки**: `preload`, `preinit`, `prefetchDNS`, `preconnect` из `react-dom`.
- **`useDeferredValue(value, initialValue)`** — начальное значение для первого рендера.
- **Улучшенные ошибки гидратации** (один диф вместо множества сообщений) и обработка ошибок через `onCaughtError` / `onUncaughtError` у `createRoot`.
- **Удалено**: `propTypes` и `defaultProps` у функциональных компонентов, строковые refs, legacy context, `ReactDOM.render` и `hydrate` (используйте `createRoot` и `hydrateRoot`).

### 4. React Compiler 1.0

**React Compiler** — плагин сборки (Babel, а также интеграции с Vite, Next.js, Expo), который анализирует компоненты и хуки и **автоматически добавляет мемоизацию**: значений, колбэков и JSX-поддеревьев. Ручные `useMemo`, `useCallback` и `memo` в большинстве случаев становятся не нужны.

- Работает только с кодом, который соблюдает **правила React**: чистый рендер, иммутабельные пропсы и state, правила хуков. Компоненты, нарушающие правила, компилятор пропускает (bail out).
- Мемоизирует точнее, чем человек: даже после условных ветвлений и раннего `return`.
- Внедряется постепенно: можно ограничить отдельными папками и включить линтер `eslint-plugin-react-hooks` (с версии 6 в нём есть правила на базе компилятора), чтобы сначала найти нарушения.
- Совместим с React 17 и 18 через пакет `react-compiler-runtime`.

💡 На собеседовании: «С компилятором ручная мемоизация уходит в прошлое, но понимать её всё равно нужно: компилятор отключается на коде, нарушающем правила React, а значит, качество кода становится условием производительности. Внедрял бы так: сначала линтер с правилами компилятора, исправить нарушения, потом включить компилятор на части приложения и сравнить профили».

### 5. React 19.1: Owner Stack

`captureOwnerStack()` (только в development) возвращает **Owner Stack** — цепочку компонентов, которые *отрисовали* данный компонент (а не иерархию родителей, как Component Stack). Полезно для понятных сообщений об ошибках в собственных инструментах и логах. Также в 19.1 улучшены Suspense-границы на клиенте, сервере и при гидратации.

### 6. React 19.2: Activity, useEffectEvent и другое

**`<Activity mode="visible" | "hidden">`** — показать или скрыть часть интерфейса **с сохранением состояния**. В режиме `hidden` эффекты размонтируются, а обновления откладываются до свободного времени. Это лучше, чем условный рендер (`{show && <Tab />}` теряет состояние) и чем `display: none` (эффекты продолжают работать).

```jsx
<Activity mode={tab === 'comments' ? 'visible' : 'hidden'}>
  <Comments /> {/* черновик комментария и прокрутка сохранятся при переключении вкладок */}
</Activity>
```

Применения: вкладки, предзагрузка вероятной следующей страницы в фоне, сохранение состояния при навигации назад.

**`useEffectEvent(fn)`** — выносит из эффекта «событийную» логику, которой нужны свежие пропсы и state, но которая не должна перезапускать эффект:

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Подключено', theme); // всегда видит актуальную theme
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', () => onConnected());
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // theme не в зависимостях — смена темы не переподключает чат
}
```

Это официальное решение проблемы «stale closure против лишних перезапусков эффекта». Функцию из `useEffectEvent` не передают в зависимости и не вызывают во время рендера.

Также в 19.2:
- **`cacheSignal`** (только Server Components) — `AbortSignal`, который срабатывает по окончании жизни `cache()`, чтобы отменять ненужную работу;
- **Performance Tracks** в Chrome DevTools: дорожки Scheduler (работа по приоритетам) и Components (какие компоненты рендерились и сколько);
- **Partial Pre-rendering API** в `react-dom`: `prerender` (статическая часть + отложенное состояние) и `resume` / `resumeAndPrerender` (досчитать динамику);
- **SSR-батчинг Suspense**: серверные границы раскрываются пачками, как на клиенте;
- **`eslint-plugin-react-hooks` v6**: flat config по умолчанию и правила на базе компилятора;
- префикс `useId` сменился на `_r_` — идентификаторы валидны в `view-transition-name` и XML.

### 7. React 19.3: ViewTransition, Fragment refs и другое

**`<ViewTransition>`** (стабильный) — анимации появления, исчезновения, перемещения и изменения размера элементов поверх браузерного View Transitions API. Анимируются только обновления внутри transition.

```jsx
<ViewTransition enter="slide-in" exit="slide-out">
  <Slide key={current} />
</ViewTransition>

startTransition(() => {
  addTransitionType('next');   // тип перехода: анимация может зависеть от направления
  setCurrent((c) => c + 1);
});
```

**Fragment refs** (стабильные) — `ref` у `<Fragment>` возвращает `FragmentInstance` для работы с группой соседних DOM-узлов без лишней обёртки: `addEventListener`, `focus` / `focusLast`, `observeUsing` (Intersection/ResizeObserver), `getClientRects`, `scrollIntoView`.

Также в 19.3:
- **`<Context>` в Server Components** можно отрендерить напрямую, без отдельного клиентского компонента-провайдера;
- **`browser()`** из `react-dom`: `use(browser())` приостанавливает компонент на сервере, но не на клиенте — fallback попадает в серверный HTML (для компонентов, которые имеют смысл только в браузере);
- **Trusted Types**: React передаёт `TrustedHTML` и другие доверенные типы в DOM без приведения к строке — совместимость со строгой CSP;
- медленные переходы больше не блокируют несвязанные переходы;
- в Strict Mode эффекты вызываются дважды и при гидратации, как при клиентском рендере.

### 8. Безопасность Server Components: CVE-2025-55182

В декабре 2025 года в пакетах `react-server-dom-webpack`, `-parcel` и `-turbopack` версий 19.0, 19.1.0–19.1.1 и 19.2.0 нашли уязвимость с оценкой **CVSS 10.0**: **неаутентифицированное удалённое выполнение кода** через специально сформированный запрос к эндпоинту Server Functions (ошибка в десериализации полезной нагрузки). Уязвимы были приложения на фреймворках с поддержкой RSC (Next.js, React Router, Waku и других), даже если в них не было своих Server Functions. Исправлено в 19.0.1, 19.1.2, 19.2.1. Позже нашли ещё несколько уязвимостей (отказ в обслуживании, утечка исходного кода).

Выводы для лида:
- Server Components и Server Actions — это **серверный код и публичный API**: к ним применимы все правила безопасности бэкенда (валидация входа, авторизация в каждом action, rate limiting).
- Нужен процесс быстрого обновления зависимостей: Dependabot/Renovate, мониторинг advisory, возможность выкатить патч в тот же день.
- Ведите инвентаризацию: какие приложения используют RSC, на каких версиях фреймворка.

## Вопросы с собеседований

<details><summary>Что нового в React 19?</summary>

Actions: асинхронные функции в переходах с автоматическим `isPending`, ошибками и оптимистичными обновлениями; хуки `useActionState`, `useOptimistic`, `useFormStatus`; `<form action={fn}>`. Хук `use` для промисов и контекста. `ref` как обычный проп, `<Context>` как провайдер, метаданные документа и стили с `precedence`, API предзагрузки, стабильные Server Components и Server Actions, улучшенные ошибки гидратации. Удалены legacy API: `propTypes` у функций, строковые refs, `ReactDOM.render`.
</details>

<details><summary>Чем use() отличается от других хуков?</summary>

Его можно вызывать условно и в циклах. Он читает промис (приостанавливая компонент через Suspense, ошибка уходит в Error Boundary) или контекст. Промис должен быть стабильным: создан вне рендера или закэширован, иначе каждый рендер создаёт новый промис и бесконечно приостанавливается.
</details>

<details><summary>Что такое React Compiler и нужен ли теперь useMemo?</summary>

Плагин сборки, который автоматически мемоизирует значения, колбэки и JSX на основе анализа кода. С ним `useMemo`, `useCallback` и `memo` нужны редко: в основном для явного контроля (например, стабильная ссылка для внешней библиотеки). Компилятор пропускает компоненты, нарушающие правила React, поэтому чистота рендера становится важнее. Стабильная версия 1.0 вышла в октябре 2025.
</details>

<details><summary>Зачем нужен Activity, если есть условный рендер?</summary>

Условный рендер размонтирует компонент и теряет его состояние. `display: none` сохраняет состояние, но эффекты продолжают работать и потреблять ресурсы. `<Activity mode="hidden">` сохраняет состояние и DOM, но размонтирует эффекты и откладывает обновления. Подходит для вкладок, фоновой предзагрузки страниц и возврата назад без потери состояния.
</details>

<details><summary>Какую проблему решает useEffectEvent?</summary>

Эффект должен перезапускаться при изменении одних значений (например, `roomId`), но при этом читать свежие значения других (`theme`), не перезапускаясь от них. Раньше приходилось либо добавлять лишние зависимости, либо хранить значения в `ref`. `useEffectEvent` создаёт функцию, которая всегда видит актуальные пропсы и state, но не является зависимостью эффекта.
</details>

<details><summary>Как в React 19 сделать форму с индикатором отправки и обработкой ошибок?</summary>

`useActionState` даёт `[state, formAction, isPending]`: action получает предыдущий state и `FormData`, возвращает новый state (например, текст ошибки). Форма — `<form action={formAction}>`. Кнопка внутри формы читает `useFormStatus().pending`. Для мгновенного отклика — `useOptimistic`. С Server Functions форма работает даже до гидратации (прогрессивное улучшение).
</details>

<details><summary>Что вы знаете об уязвимости CVE-2025-55182?</summary>

Критическая (CVSS 10.0) уязвимость в пакетах Server Components React 19.0–19.2.0: неаутентифицированное удалённое выполнение кода через запрос к эндпоинту Server Functions из-за ошибки десериализации. Затронуты приложения на фреймворках с RSC (Next.js и другие). Исправлено в 19.0.1, 19.1.2, 19.2.1. Вывод: RSC — это серверная поверхность атаки, нужны валидация, авторизация в каждом action и процесс быстрого обновления зависимостей.
</details>

<details><summary>Что такое ViewTransition в React 19.3?</summary>

Компонент, который анимирует появление, исчезновение, перемещение и изменение размера своих детей с помощью браузерного View Transitions API. Анимация срабатывает для обновлений внутри transition (`startTransition`, Suspense, `useDeferredValue`). `addTransitionType` позволяет выбирать анимацию в зависимости от причины перехода, например направления навигации.
</details>

## Практика

### Предскажите поведение

**1.**
```jsx
function Tabs({ tab }) {
  return tab === 'a' ? <FormA /> : <FormB />;
}
// Пользователь ввёл текст в FormA, переключился на 'b' и вернулся на 'a'. Сохранился ли текст?
```
<details><summary>Ответ</summary>

Нет.
</details>
<details><summary>Почему так</summary>

`FormA` размонтируется при переключении, и её состояние теряется. Чтобы сохранить, оберните каждую вкладку в `<Activity mode={tab === 'a' ? 'visible' : 'hidden'}>`.
</details>

**2.**
```jsx
const [count, addOptimistic] = useOptimistic(5, (c, d) => c + d);
// внутри action: addOptimistic(1); await saveLike(); — сервер вернул ошибку, action бросил исключение
```
<details><summary>Ответ</summary>

Сначала на экране 6, после ошибки снова 5.
</details>
<details><summary>Почему так</summary>

Оптимистичное значение живёт только пока выполняется action. Когда переход завершается (успешно или с ошибкой), React возвращается к реальному state. Ошибку нужно показать отдельно, через state или Error Boundary.
</details>

### Задачи

**1. Перепишите форму на React 19 Actions.**

```jsx
function Subscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await subscribe(email);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={loading}>Подписаться</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

<details><summary>Решение</summary>

```jsx
function Subscribe() {
  const [error, formAction, isPending] = useActionState(async (_prev, formData) => {
    try {
      await subscribe(formData.get('email'));
      return null; // успех: неконтролируемое поле сбросится автоматически
    } catch (err) {
      return err.message;
    }
  }, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button disabled={isPending}>Подписаться</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

Ушли три `useState`, `preventDefault` и ручной `finally`. Поле стало неконтролируемым и сбрасывается после успешного action. Если `subscribe` — Server Function, форма будет работать и до загрузки JS.
</details>

**2. Вынесите событийную логику из эффекта.**

Эффект подписывается на WebSocket по `channelId` и при сообщении вызывает `onMessage` из пропсов. Сейчас `onMessage` в зависимостях, и каждый рендер родителя (новая функция) переподключает сокет. Исправьте.

<details><summary>Решение</summary>

```jsx
function useChannel(channelId, onMessage) {
  const handleMessage = useEffectEvent((msg) => onMessage(msg)); // всегда актуальный onMessage

  useEffect(() => {
    const socket = connect(channelId);
    socket.addEventListener('message', (e) => handleMessage(JSON.parse(e.data)));
    return () => socket.close();
  }, [channelId]); // переподключение только при смене канала
}
```

До 19.2 то же решали через `useRef` с последней версией колбэка. `useEffectEvent` делает это официально и понятно читателю.
</details>

## Источники
- [React v19](https://react.dev/blog/2024/12/05/react-19)
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)
- [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [React CHANGELOG](https://github.com/facebook/react/blob/main/CHANGELOG.md)
- [react.dev — useActionState](https://react.dev/reference/react/useActionState)
- [react.dev — Activity](https://react.dev/reference/react/Activity)
- [react.dev — useEffectEvent](https://react.dev/reference/react/useEffectEvent)
