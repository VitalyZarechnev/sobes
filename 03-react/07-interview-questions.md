# Вопросы и live-coding по React

> ⏱ ~3 ч · 🎯 Отвечать вслух уверенно и структурно на типовые и «хитрые» вопросы, решать live-coding задачи за 20–25 минут с проговариванием trade-offs.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Прогнал все 26 вопросов вслух, каждый за 1–2 минуты
- [ ] Решил минимум 3 live-coding задачи на таймер без подсказок
- [ ] Для каждой задачи проговорил крайние случаи и как бы её тестировал

## Теория

### Как отвечать на senior/lead-уровне

Структура ответа: **определение → механизм («почему») → trade-off/ловушка → пример из практики**. Интервьюер на senior-позиции проверяет не знание API, а понимание причин и опыт решений.

На live-coding:
1. Уточнить требования и крайние случаи (отмена, ошибки, пустые данные, доступность).
2. Озвучить план и API хука/компонента до кода.
3. Написать минимальную работающую версию, затем улучшать.
4. Сказать, как это тестировать и что бы сделали в проде (библиотека вместо велосипеда).

Связанные страницы: [рендеринг](01-rendering-reconciliation.md), [хуки](02-hooks-deep-dive.md), [состояние](03-state-management.md), [производительность](04-performance.md), [React 19/RSC](05-react-19-and-server-components.md), [паттерны](06-patterns-and-testing.md).

## Вопросы с собеседований

<details><summary>1. Что такое React и в чём его ключевая идея?</summary>

Библиотека для построения UI как функции от состояния: `UI = f(state)`. Декларативность, компонентная модель, однонаправленный поток данных. Реконсилер вычисляет изменения, рендерер применяет их к платформе (DOM, Native).
</details>

<details><summary>2. Что такое Virtual DOM и быстрее ли он реального DOM?</summary>

Дерево лёгких JS-объектов, описывающих UI. Не быстрее точечных ручных мутаций — он даёт декларативную модель с «достаточно хорошей» производительностью и независимость от платформы. Цена — работа на рендер и сравнение.
</details>

<details><summary>3. Расскажите про Fiber.</summary>

Внутренняя структура реконсилера: узел на компонент, связный список child/sibling/return, двойная буферизация current/WIP, lanes для приоритетов. Позволяет прерывать рендер, что лежит в основе concurrent-фич. Commit синхронный.
</details>

<details><summary>4. Как работает reconciliation и зачем key?</summary>

Эвристики: разный тип — пересоздать поддерево; дети в списке сопоставляются по key. Key — идентичность; индекс как key ломает состояние при перестановках. Смена key — способ сбросить состояние.
</details>

<details><summary>5. Что такое batching?</summary>

Объединение нескольких обновлений в один рендер. С React 18 — автоматически везде. `flushSync` для принудительного синхронного применения.
</details>

<details><summary>6. Почему setState «асинхронный»?</summary>

Он не асинхронный в смысле промиса — он ставит обновление в очередь, а рендер происходит позже, батчем. Переменная в текущем замыкании — снимок рендера и не меняется. Для зависимых обновлений — функциональная форма.
</details>

<details><summary>7. Правила хуков и почему они такие?</summary>

Только на верхнем уровне и только в компонентах/хуках. Хуки хранятся связным списком по порядку вызова, без ключей. Нарушение порядка — чужое состояние.
</details>

<details><summary>8. useEffect vs useLayoutEffect.</summary>

Layout — синхронно после мутаций DOM до paint (измерения, без мерцания), блокирует отрисовку. Effect — после paint, для подписок и синхронизации. Insertion — для CSS-in-JS до мутаций.
</details>

<details><summary>9. Что такое stale closure? Пример и решения.</summary>

`setInterval` в эффекте с `[]` читает `count` первого рендера. Решения: функциональный setState, честные deps, ref с актуальным значением, `useEffectEvent`.
</details>

<details><summary>10. Когда эффект не нужен?</summary>

Для вычисления производных данных, обработки пользовательских событий, сброса state при смене пропа (key), цепочек обновлений. Эффект — для синхронизации с внешней системой.
</details>

<details><summary>11. Чем useMemo отличается от useCallback и React.memo?</summary>

`useMemo` кэширует значение, `useCallback` — функцию (ссылку), `memo` — пропуск рендера компонента при shallow-равных пропсах. Первые два полезны, когда результат сравнивается (memo-пропсы, deps) или вычисление дорогое.
</details>

<details><summary>12. Что делает React Compiler?</summary>

Автоматическая мемоизация на этапе сборки для кода, соблюдающего Rules of React. Убирает большую часть ручных useMemo/useCallback/memo. Нарушающие правила компоненты пропускаются.
</details>

<details><summary>13. Что такое concurrent rendering?</summary>

Прерываемый рендер с приоритетами. Срочные обновления (ввод) прерывают несрочные (transition). Используется в transitions, Suspense, `useDeferredValue`, selective hydration. Не многопоточность.
</details>

<details><summary>14. useTransition vs useDeferredValue.</summary>

Transition оборачивает обновление state (у источника), deferred — значение (у потребителя). Оба несрочные и прерываемые, transition даёт `isPending` и поддерживает async-actions в React 19.
</details>

<details><summary>15. Как работает Suspense?</summary>

Компонент бросает промис (или `use` с незавершённым промисом), ближайшая граница показывает fallback и ретраит рендер после резолва. Работает с lazy, `use`, RSC, библиотеками данных; не работает с загрузкой в useEffect.
</details>

<details><summary>16. Context — проблемы производительности и решения.</summary>

Все потребители ререндерятся при смене value, нет селекторов. Мемоизация value, разделение контекстов, state/dispatch отдельно, стор + `useSyncExternalStore` с селекторами.
</details>

<details><summary>17. Как выбрать state-менеджер?</summary>

Сначала классифицировать состояние: серверное → TanStack Query/RSC, URL → роутер, локальное → useState, остаток глобального клиентского → Zustand/RTK/Jotai по размеру команды и характеру обновлений.
</details>

<details><summary>18. Зачем useSyncExternalStore?</summary>

Безопасная подписка на внешний стор в concurrent-режиме без tearing, с поддержкой SSR. Основа современных стор-библиотек.
</details>

<details><summary>19. Server Components vs SSR.</summary>

SSR — HTML для первого показа, весь код гидратируется. RSC — компоненты только на сервере, код не в бандле, payload может перезапрашиваться. Используются вместе.
</details>

<details><summary>20. Что такое Server Actions и как их защищать?</summary>

Серверные функции, вызываемые с клиента через RPC. Публичные эндпоинты: аутентификация, авторизация, валидация (zod), не раскрывать детали ошибок, rate limit, ревалидация кэша после мутации.
</details>

<details><summary>21. Новые хуки React 19.</summary>

`use` (промисы и контекст, условно), `useActionState` (state + pending для action), `useOptimistic` (временный UI на время action), `useFormStatus` (pending родительской формы), `useEffectEvent` (19.2). Плюс `<form action>`, ref как проп, метаданные документа.
</details>

<details><summary>22. Что такое гидратация и hydration mismatch?</summary>

Подключение React к серверному HTML. Mismatch — разный результат сервера и клиента (даты, random, window, невалидный HTML). Решения: детерминированный рендер, значения клиента — после маунта, `useId`.
</details>

<details><summary>23. Что такое Error Boundary и что он не ловит?</summary>

Классовый компонент с `getDerivedStateFromError`/`componentDidCatch`. Не ловит обработчики событий, асинхронный код вне React, SSR, ошибки в самой границе.
</details>

<details><summary>24. Controlled vs uncontrolled компоненты.</summary>

Controlled — значение в state родителя, полный контроль, больше ререндеров. Uncontrolled — значение в DOM, читаем по сабмиту (`FormData`, ref), меньше кода и ререндеров. Библиотечные компоненты поддерживают оба режима.
</details>

<details><summary>25. Как устроено всплытие событий в React?</summary>

С React 17 обработчики вешаются на корневой контейнер (не на `document`), синтетические события нормализуют браузерные различия. Event pooling удалён в 17. Через порталы события всплывают по React-дереву.
</details>

<details><summary>26. Как вы бы мигрировали большой проект на новую версию React / на React Compiler?</summary>

Инвентаризация (deprecated API, сторонние библиотеки), включение StrictMode и линтера, codemods (`react-codemod`, `types-react-codemod`), поэтапное обновление с фича-флагами и канарейкой, мониторинг ошибок и web-vitals до/после. Компилятор — по директориям через `'use memo'`/конфиг, с проверкой профилировщиком.
</details>

<details><summary>27. Как организовать архитектуру крупного React-приложения?</summary>

Feature-based структура (или Feature-Sliced Design) с явными публичными API модулей, слой данных (Query-клиент, API-слой с типами из OpenAPI), дизайн-система на headless-примитивах, правила импортов через линтер, code splitting по маршрутам, тестовая стратегия, мониторинг. Подробнее — [05. Архитектура](../05-architecture/README.md).
</details>

## Практика

Решать на таймер 20–25 минут, затем сравнить с решением.

**1. `useDebounce` / `useDebouncedCallback`.** Значение обновляется не чаще чем раз в `delay` мс; таймер очищается при размонтировании.

<details><summary>Решение</summary>

```ts
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // новый ввод отменяет предыдущий таймер
  }, [value, delay]);
  return debounced;
}

export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
  const fnRef = useRef(fn);
  useLayoutEffect(() => { fnRef.current = fn; });       // всегда свежая функция, без stale closure
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback((...args: A) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]);
}
```

Обсудить: leading/trailing, `cancel`/`flush`, отличие от `useDeferredValue`.
</details>

**2. `useFetch` с отменой.** Возвращает `{ data, error, status }`, отменяет запрос при смене URL и размонтировании, не допускает гонок.

<details><summary>Решение</summary>

```ts
type FetchState<T> =
  | { status: 'idle' | 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

export function useFetch<T>(url: string | null, init?: RequestInit): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });
  const initRef = useRef(init);
  useLayoutEffect(() => { initRef.current = init; });

  useEffect(() => {
    if (!url) { setState({ status: 'idle' }); return; }
    const controller = new AbortController();
    setState({ status: 'loading' });
    (async () => {
      try {
        const res = await fetch(url, { ...initRef.current, signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as T;
        setState({ status: 'success', data });
      } catch (e) {
        if (controller.signal.aborted) return;  // отменённый запрос — не ошибка
        setState({ status: 'error', error: e instanceof Error ? e : new Error(String(e)) });
      }
    })();
    return () => controller.abort();
  }, [url]);

  return state;
}
```

Обсудить: кэш и дедупликация (почему в проде TanStack Query), валидация ответа (zod), retry, Suspense-версия.
</details>

**3. Виртуализированный список** фиксированной высоты строки.

<details><summary>Решение</summary>

```tsx
type Props<T> = { items: T[]; rowHeight: number; height: number; overscan?: number;
  renderRow: (item: T, index: number) => React.ReactNode };

export function VirtualList<T>({ items, rowHeight, height, overscan = 5, renderRow }: Props<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const total = items.length * rowHeight;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);

  return (
    <div style={{ height, overflowY: 'auto' }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      role="list" aria-rowcount={items.length}>
      <div style={{ height: total, position: 'relative' }}>
        {items.slice(start, end).map((item, i) => {
          const index = start + i;
          return (
            <div key={index} role="listitem" aria-posinset={index + 1} aria-setsize={items.length}
              style={{ position: 'absolute', top: 0, transform: `translateY(${index * rowHeight}px)`, height: rowHeight, width: '100%' }}>
              {renderRow(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Здесь key=index допустим: ключ — позиция-слот, а не сущность (но если строки со своим state — брать id). Обсудить: динамическая высота (`ResizeObserver` + префиксные суммы + бинарный поиск), throttling через rAF, `scrollToIndex`, горизонтальная виртуализация, доступность.
</details>

**4. Todo с оптимистичным обновлением** и откатом при ошибке (без React 19 хуков и с ними).

<details><summary>Решение</summary>

```tsx
// Вариант на useOptimistic (React 19)
function Todos({ initial }: { initial: Todo[] }) {
  const [todos, setTodos] = useState(initial);
  const [optimistic, applyOptimistic] = useOptimistic(todos,
    (list, patch: { id: string; done: boolean }) => list.map(t => t.id === patch.id ? { ...t, done: patch.done } : t));
  const [error, setError] = useState<string | null>(null);

  function toggle(todo: Todo) {
    startTransition(async () => {
      applyOptimistic({ id: todo.id, done: !todo.done });
      try {
        const saved = await api.update(todo.id, { done: !todo.done });
        startTransition(() => setTodos(list => list.map(t => t.id === saved.id ? saved : t)));
      } catch {
        setError('Не удалось сохранить'); // оптимистичное значение откатится само
      }
    });
  }
  return (<>
    {error && <p role="alert">{error}</p>}
    <ul>{optimistic.map(t => (
      <li key={t.id}><label><input type="checkbox" checked={t.done} onChange={() => toggle(t)} />{t.title}</label></li>
    ))}</ul>
  </>);
}
```

Без React 19: сохранить предыдущее значение, применить изменение сразу, при ошибке — вернуть снимок; учитывать гонки (несколько кликов подряд — версия/счётчик запросов). В TanStack Query — `onMutate` (snapshot + `setQueryData`), `onError` (rollback), `onSettled` (invalidate).
</details>

**5. Модалка с фокус-трапом.** Портал, Esc закрывает, фокус остаётся внутри, возвращается на триггер, фон не скроллится, a11y-атрибуты.

<details><summary>Решение</summary>

```tsx
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseEvent = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current!;
    (dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog).focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseEvent(); return; }
      if (e.key !== 'Tab') return;
      const nodes = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (nodes.length === 0) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();  // вернуть фокус на триггер
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <h2 id={titleId}>{title}</h2>
        {children}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>,
    document.body,
  );
}
```

Обсудить: `inert` на остальном контенте (лучше, чем ловить Tab), нативный `<dialog>.showModal()` даёт top layer, inert и Esc из коробки; вложенные модалки (стек), анимация закрытия, тесты с RTL (`user.tab()`, `user.keyboard('{Escape}')`).
</details>

## Источники
- https://react.dev/learn
- https://react.dev/reference/react
- https://react.dev/blog
- https://react.dev/reference/react/useOptimistic
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
