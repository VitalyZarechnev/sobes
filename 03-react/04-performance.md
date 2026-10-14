# Производительность

> ⏱ ~3 ч · 🎯 Находить реальные узкие места (а не мемоизировать «на всякий случай»), понимать, когда memo/useMemo/useCallback работают и когда бесполезны, что меняет React Compiler, и владеть инструментами: профилирование, виртуализация, code splitting, оптимизация контекста и гидратации.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Умею профилировать в React DevTools Profiler и Chrome Performance (включая React Performance Tracks)
- [ ] Знаю, почему `memo` ломается от inline-объектов/функций/children
- [ ] Понимаю, что делает React Compiler и его ограничения
- [ ] Могу объяснить виртуализацию, `lazy` + Suspense, selective hydration

## Теория

### Порядок работы: измерить → найти причину → оптимизировать

1. Воспроизвести в **production-сборке** (dev-режим React в разы медленнее, StrictMode удваивает рендеры).
2. Замедлить CPU (4x/6x) в DevTools — ваш MacBook не средний телефон.
3. Определить тип проблемы: долгий JS (рендер/вычисления), layout/paint, сеть/загрузка бандла, гидратация.
4. Метрики: **INP** (отзывчивость — главная для React-приложений), LCP, CLS, TBT.

Типовые причины тормозов в React:
- Ререндер большого поддерева при частом обновлении (ввод, скролл, таймер) наверху.
- Тяжёлые вычисления в рендере.
- Огромные списки (тысячи DOM-узлов).
- Большой бандл и долгая гидратация.
- Layout thrashing в эффектах.

### Инструменты профилирования

- **React DevTools Profiler**: flamegraph по коммитам, время рендера каждого компонента, «Why did this render?» (включить в настройках), подсветка ререндеров (Highlight updates).
- **Chrome Performance**: long tasks, INP-взаимодействия. В React 19.2 добавлены **Performance Tracks** — дорожки Scheduler и Components прямо в таймлайне Chrome.
- `<Profiler id onRender>` — программный замер в проде (нужна profiling-сборка `react-dom/profiling`).
- `why-did-you-render`, React Scan — сторонние инструменты для поиска лишних ререндеров.

```tsx
<Profiler id="Grid" onRender={(id, phase, actualDuration, baseDuration) => {
  if (actualDuration > 16) reportSlowRender({ id, phase, actualDuration, baseDuration });
}}>
  <Grid />
</Profiler>
```

`actualDuration` — время текущего рендера с учётом мемоизации, `baseDuration` — оценка без мемоизации (худший случай).

### memo, useMemo, useCallback

```tsx
const Row = memo(function Row({ item, onSelect }: RowProps) { /* ... */ });

function List({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const onSelect = useCallback((id: string) => setSelected(id), []); // стабильная ссылка для memo
  const sorted = useMemo(() => [...items].sort(byDate), [items]);     // дорогое вычисление
  return sorted.map(i => <Row key={i.id} item={i} onSelect={onSelect} />);
}
```

- `memo(Component, areEqual?)` — пропустить рендер, если пропсы shallow-равны (`Object.is` по каждому ключу). Не влияет на ререндеры от собственного state и контекста.
- `useMemo(fn, deps)` — кэш **одного последнего** значения. Две цели: дорогое вычисление и **стабильная ссылка** (для пропсов memo-компонента или deps эффекта).
- `useCallback(fn, deps)` = `useMemo(() => fn, deps)`. Сам по себе ничего не ускоряет — функция всё равно создаётся; полезен только когда ссылка куда-то сравнивается.

Когда мемоизация бесполезна или вредна:
- Компонент дешёвый — сравнение пропсов + хранение deps дороже рендера.
- Пропсы всё равно новые: inline-объект `style={{}}`, стрелка, **`children`** (JSX — новый объект каждый раз) — `memo` никогда не сработает.
- Мемоизация цепочкой: одна немемоизированная ссылка вверху ломает всю цепь.
- Код становится сложнее, а deps — источником stale closures.

🪤 Ловушка: `memo(Card)` + `<Card><Icon /></Card>` — `children` меняется каждый рендер, memo бесполезен.

Сначала — структурные приёмы, они бесплатные:
1. **Опустить state вниз** (move state down): инпут с частыми изменениями — в отдельный компонент.
2. **Поднять контент вверх** (lift content up): передать тяжёлое поддерево как `children`, тогда оно не рендерится при смене state обёртки.
3. Разбить большой компонент так, чтобы часто меняющееся состояние касалось маленькой части.

```tsx
// До: каждое движение мыши ререндерит HeavyTree
function Page() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onPointerMove={e => setPos({ x: e.clientX, y: e.clientY })}><Cursor pos={pos} /><HeavyTree /></div>;
}
// После: state в обёртке, HeavyTree передан как children
function PointerTracker({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onPointerMove={e => setPos({ x: e.clientX, y: e.clientY })}><Cursor pos={pos} />{children}</div>;
}
const Page = () => <PointerTracker><HeavyTree /></PointerTracker>;
```

### React Compiler

React Compiler (v1.0 — октябрь 2025) — babel-плагин (есть интеграции для Vite, Next.js, Expo), который на этапе сборки **автоматически мемоизирует** компоненты и хуки: значения, JSX, колбэки — с более мелкой гранулярностью, чем ручной `useMemo` (в том числе условно и после ранних return).

```tsx
// Исходник
function Todos({ todos, filter }: Props) {
  const visible = todos.filter(t => matches(t, filter));
  return <List items={visible} onToggle={id => toggle(id)} />;
}
// Компилятор генерирует примерно такое: кэш-слоты через хук useMemoCache (c)
function Todos(props) {
  const $ = _c(4);
  let visible;
  if ($[0] !== props.todos || $[1] !== props.filter) {
    visible = props.todos.filter(t => matches(t, props.filter));
    $[0] = props.todos; $[1] = props.filter; $[2] = visible;
  } else visible = $[2];
  // ... аналогично для JSX и колбэка
}
```

Что важно:
- Работает только для кода, следующего **Rules of React**: чистые компоненты, иммутабельность пропсов/state, хуки по правилам, нет чтения `ref.current` в рендере. Нарушающие компоненты компилятор **пропускает** (bail out) — не ломает, но и не оптимизирует.
- `eslint-plugin-react-hooks` (v6+) содержит правила компилятора — включать даже без компилятора.
- Ручные `useMemo`/`useCallback` становятся в основном не нужны; оставляют как escape hatch для контроля deps эффектов.
- Директивы `'use memo'` / `'use no memo'` для инкрементального включения/исключения.
- Не заменяет виртуализацию, code splitting и архитектурные решения — уменьшает число лишних рендеров, а не стоимость необходимых.

💡 На собеседовании: «С компилятором вопрос "где ставить useMemo" уходит; остаётся вопрос "соблюдает ли код правила React". Внедряя в существующий проект — сначала линтер, затем постепенно по директориям, проверяя поведение».

### Виртуализация (windowing)

Рендерить только видимые строки + небольшой overscan; остальные — пустое пространство нужной высоты. Сложность DOM — O(видимых), а не O(всех).

- Библиотеки: **TanStack Virtual** (headless, динамическая высота), react-window, react-virtuoso (удобно для чатов, reverse scroll).
- Проблемы: динамическая высота (измерение через `ResizeObserver`), поиск по странице Ctrl+F не находит невидимое, доступность (`aria-rowcount`, `aria-setsize`), сохранение позиции скролла, sticky-элементы.
- Альтернатива для умеренных размеров — CSS `content-visibility: auto` + `contain-intrinsic-size`: браузер пропускает layout/paint для внеэкранных блоков, DOM остаётся.
- Пагинация / «Загрузить ещё» — иногда лучший UX, чем бесконечный виртуальный список.

### Code splitting и lazy

```tsx
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

- `lazy` принимает функцию, возвращающую промис модуля с `default`-экспортом. Объявлять **на уровне модуля**, а не внутри компонента (иначе ремоунт и повторная загрузка).
- Делить по маршрутам — основная стратегия; дальше — по тяжёлым виджетам (редактор, графики, карты), модалкам.
- Предзагрузка: вызвать `import()` на hover/focus или в лоадере роутера, чтобы убрать водопад «клик → загрузка чанка → загрузка данных».
- Навигация в `startTransition` — старая страница остаётся видна, пока грузится новая, вместо мигания fallback.
- Ошибки загрузки чанка (после деплоя старые хэши удалены) — ловить Error Boundary и предлагать перезагрузку.
- Анализ бандла: `rollup-plugin-visualizer`, `source-map-explorer`, `@next/bundle-analyzer`. Следить за barrel-файлами и tree-shaking.

### Оптимизация контекста

См. [03-state-management.md](03-state-management.md): мемоизировать value, разделять контексты по частоте изменения, state/dispatch отдельно, стабильный стор + селекторы через `useSyncExternalStore`. Контекст с часто меняющимся значением наверху дерева — один из главных источников проблем INP.

### Прочие техники

- **Списки:** стабильные ключи, `memo` строк + стабильные колбэки (или делегирование через `data-id` на родителе).
- **Ввод:** `useDeferredValue` / `useTransition` для тяжёлых зависимых обновлений; debounce для сети.
- **Анимации:** CSS/Web Animations API или библиотеки, которые обходят рендер React (motion values) — 60 setState в секунду на большом дереве убивают кадры.
- **Тяжёлые вычисления:** Web Worker (Comlink), чанкинг через `scheduler.yield()`.
- **Изображения:** `loading="lazy"`, `fetchpriority="high"` для LCP, размеры.
- **Activity** (React 19.2): `<Activity mode="hidden">` скрывает поддерево с сохранением состояния и откладывает его обновления на низкий приоритет — быстрые переключения вкладок и предрендер.

### Гидратация

**Гидратация** — подключение React к HTML, отрендеренному на сервере: React рендерит дерево на клиенте, сопоставляет с существующим DOM и навешивает обработчики. До её завершения страница видна, но не интерактивна (проблема «uncanny valley»).

Проблемы и решения:
- **Hydration mismatch** — разный результат на сервере и клиенте (`Date.now()`, `Math.random()`, `window`, локаль, расширения браузера). React 19 выводит понятный diff. Решения: вычислять в эффекте после монтирования, `useId` для id, `suppressHydrationWarning` для единичных узлов (время).
- **Долгая гидратация** — весь JS бандла должен загрузиться и выполниться. Решения:
  - **Selective hydration** (React 18+): с `<Suspense>`-границами и стриминг-SSR части гидратируются независимо; React приоритезирует ту, с которой взаимодействует пользователь (клик перехватывается и проигрывается после гидратации).
  - **Server Components** — их код вообще не попадает в бандл и не гидратируется.
  - Меньше клиентского JS, lazy для невидимых частей.
- Сравнение с **резюмируемостью** (Qwik) и **островами** (Astro) — уместно упомянуть на lead-уровне как альтернативные подходы.

## Вопросы с собеседований

<details><summary>Когда использовать React.memo, а когда это вредно?</summary>

Когда компонент дорогой, часто рендерится с теми же пропсами и пропсы стабильны по ссылке. Вредно/бесполезно для дешёвых компонентов, при передаче inline-объектов, функций и `children`, когда пропсы и так меняются каждый раз. Сначала структурные приёмы (state вниз, контент вверх), потом memo, а с React Compiler — в основном не нужно.
</details>

<details><summary>Ускоряет ли useCallback код?</summary>

Сам по себе нет: функция всё равно создаётся каждый рендер, плюс сравнение deps. Он даёт стабильную ссылку — это ускоряет только если ссылку сравнивают: пропс `memo`-компонента или зависимость эффекта/другого хука.
</details>

<details><summary>Что такое React Compiler и какие у него ограничения?</summary>

Сборочный плагин, автоматически мемоизирующий значения, JSX и колбэки в компонентах и хуках с гранулярностью выше ручной. Требует соблюдения Rules of React; при нарушениях пропускает компонент. Не решает проблемы огромных списков, бандла, сетевых водопадов, контекста с частыми изменениями (уменьшает, но потребители всё равно рендерятся).
</details>

<details><summary>Как найти причину медленного ввода в форме?</summary>

Production-сборка + CPU throttling, записать взаимодействие в Chrome Performance (INP) и React Profiler. Обычно: state формы на верхнем уровне ререндерит всю страницу; тяжёлые вычисления в рендере; контекст. Решения: опустить state, неконтролируемые инпуты (React Hook Form), `useDeferredValue` для зависимых тяжёлых частей, memo для тяжёлых соседей.
</details>

<details><summary>Как работает виртуализация и какие у неё минусы?</summary>

Рендерятся только видимые элементы + overscan, контейнер получает полную высоту, элементы абсолютно/трансформом позиционируются. Минусы: динамическая высота, Ctrl+F, доступность, SEO, сохранение скролла, сложность. Альтернативы: `content-visibility`, пагинация.
</details>

<details><summary>Как организовать code splitting в React-приложении?</summary>

По маршрутам через `lazy` + Suspense (или средствами фреймворка), затем тяжёлые виджеты и модалки. Предзагрузка на hover/в лоадере, навигация в transition, Error Boundary для ошибок загрузки чанков. Контролировать размер через анализатор бандла.
</details>

<details><summary>Что такое hydration mismatch и как его избежать?</summary>

Разметка сервера не совпадает с первым клиентским рендером. Причины: недетерминированные значения, доступ к `window`, локаль/таймзона, неверная вложенность HTML (`<div>` в `<p>`), браузерные расширения. Решения: детерминированный рендер, клиентские значения — после монтирования, `useId`, `suppressHydrationWarning` точечно.
</details>

<details><summary>Что такое selective hydration?</summary>

При стриминг-SSR с Suspense-границами каждая граница гидратируется независимо, как только загружен её код. Если пользователь кликает на ещё не гидратированную часть, React повышает её приоритет и гидратирует первой, затем воспроизводит событие.
</details>

<details><summary>Почему dev-сборка не подходит для замеров?</summary>

В dev React выполняет дополнительные проверки, предупреждения, двойные рендеры в StrictMode, нет минификации. Разница может быть в разы. Мерить production или profiling-сборку.
</details>

<details><summary>Как оптимизировать часто меняющиеся данные (котировки, WebSocket) в большом дереве?</summary>

Не класть их в Context наверху. Внешний стор с подпиской на конкретные ключи через селекторы (`useSyncExternalStore`), батчинг входящих сообщений (раз в кадр через `requestAnimationFrame`), виртуализация, memo строк, в крайних случаях — прямое обновление DOM через ref для «горячих» ячеек.
</details>

## Практика

**1. Почему memo не работает?**

```tsx
const Chart = memo(function Chart({ data, options }: ChartProps) { /* тяжёлый */ });

function Dashboard({ raw }: { raw: Point[] }) {
  const [tab, setTab] = useState(0);
  return <Chart data={raw.filter(p => p.visible)} options={{ animate: true }} />;
}
```

<details><summary>Решение</summary>

`data` — новый массив, `options` — новый объект на каждый рендер. Фикс: `useMemo` для `data` с deps `[raw]`, `options` вынести в константу модуля. Или включить React Compiler, который сделает это сам.
</details>

**2. Спроектируй** таблицу на 50 000 строк с сортировкой, фильтром и редактированием ячеек.

<details><summary>Решение</summary>

Виртуализация строк (и колонок, если их много) через TanStack Virtual / TanStack Table; сортировка/фильтрация — в `useMemo` от отложенного значения фильтра (`useDeferredValue`) или в Web Worker; строка — `memo` со стабильными колбэками (или делегирование событий); состояние редактирования — локально в ячейке, коммит в стор по blur; данные — в нормализованной структуре `Map<id, Row>`, чтобы обновление ячейки меняло ссылку только одной строки. При серверных данных — серверная пагинация/сортировка.
</details>

**3. Оптимизируй** страницу с LCP 4 с и INP 500 мс на SPA с одним бандлом 2 МБ.

<details><summary>Решение</summary>

Анализ бандла → route-based splitting, удалить тяжёлые зависимости (moment → date-fns/Intl), tree-shaking; SSR/SSG для LCP или хотя бы preload ключевых ресурсов, `fetchpriority` для hero-изображения; INP — профилирование взаимодействий, разделение long tasks, transitions, опустить state, виртуализация; мониторинг web-vitals в проде.
</details>

## Источники
- https://react.dev/reference/react/memo
- https://react.dev/reference/react/useMemo
- https://react.dev/reference/react/useCallback
- https://react.dev/reference/react/lazy
- https://react.dev/reference/react/Profiler
- https://react.dev/reference/react/Activity
- https://react.dev/learn/react-compiler
- https://react.dev/blog/2025/10/07/react-compiler-1
- https://react.dev/reference/dev-tools/react-performance-tracks
- https://react.dev/reference/react-dom/client/hydrateRoot
- https://overreacted.io/before-you-memo/
- https://tanstack.com/virtual/latest
- https://web.dev/articles/inp
