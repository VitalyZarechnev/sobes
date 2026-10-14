# Хуки: глубокое погружение

> ⏱ ~4 ч · 🎯 Понимать, как хуки хранятся во Fiber и откуда берутся их правила; уверенно разбирать stale closures, тайминги эффектов, синхронизацию с внешними сторами; писать кастомные хуки и отличать «нужен эффект» от «эффект не нужен».
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу объяснить правила хуков через связный список во Fiber
- [ ] Различаю тайминги `useEffect` / `useLayoutEffect` / `useInsertionEffect`
- [ ] Умею находить и чинить stale closure (3+ способа), знаю `useEffectEvent`
- [ ] Использую `useSyncExternalStore` для внешних источников
- [ ] Проходился по статье «You Might Not Need an Effect» и могу привести 5 анти-паттернов

## Теория

### Как хранятся хуки и откуда правила

У функционального компонента нет экземпляра. Состояние хранится на Fiber в `memoizedState` — **односвязном списке** объектов-хуков в порядке вызова:

```ts
// Упрощённо
interface Hook {
  memoizedState: any;   // значение state / эффект / ref / [value, deps]
  queue: UpdateQueue | null;
  next: Hook | null;
}
```

При монтировании каждый вызов `useState`/`useEffect`/... создаёт новый узел и добавляет в конец. При обновлении React **идёт по списку по порядку**: первый вызов получает первый узел, второй — второй. Никаких имён и ключей нет — только **порядковый номер**.

Отсюда правила (Rules of Hooks):
1. Вызывать только на верхнем уровне — не в условиях, циклах, после раннего `return`, не во вложенных функциях. Иначе порядок сместится, и `useState` получит узел `useEffect`.
2. Вызывать только из React-функций: компонентов и кастомных хуков (имя `useXxx` — соглашение для линтера и компилятора).

Исключение в React 19: `use()` можно вызывать в условиях и циклах — он не хранит состояние в списке хуков (читает промис/контекст).

Диспетчер: React подменяет `ReactCurrentDispatcher` на `HooksDispatcherOnMount` / `OnUpdate`. Вызов хука вне рендера попадает в «ContextOnlyDispatcher» и кидает ошибку «Invalid hook call».

💡 На собеседовании: «Хуки — это индексированный по порядку связный список на Fiber. Правила нужны, чтобы порядок вызовов был одинаков между рендерами. Это осознанный дизайн: нет ключей — нет коллизий имён между кастомными хуками, и их можно свободно композировать».

### useState и useReducer

```ts
const [state, setState] = useState(() => expensiveInit()); // ленивый инициализатор — один раз
setState(prev => ({ ...prev, done: true }));               // функциональное обновление
```

- `useState` реализован через `useReducer` с базовым редьюсером `(s, a) => typeof a === 'function' ? a(s) : a`.
- Сравнение `Object.is`: тот же объект после мутации → React может пропустить рендер. Всегда новая ссылка.
- `setState` стабилен по идентичности — его не нужно класть в deps (линтер знает).
- `useReducer` уместен, когда следующий state зависит от предыдущего сложным образом, несколько полей меняются вместе, или логику переходов хочется тестировать отдельно. `dispatch` тоже стабилен — его удобно прокидывать через контекст вместо десятка колбэков.

```ts
type State = { status: 'idle' | 'loading' | 'error' | 'success'; data?: User; error?: string };
type Action =
  | { type: 'fetch' }
  | { type: 'resolve'; data: User }
  | { type: 'reject'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch':   return { status: 'loading' };
    case 'resolve': return { status: 'success', data: action.data };
    case 'reject':  return { status: 'error', error: action.error };
  }
}
```

Discriminated union исключает «невозможные состояния» вроде `loading && error`.

### Эффекты: useEffect vs useLayoutEffect vs useInsertionEffect

| Хук | Когда | Блокирует отрисовку | Для чего |
|---|---|---|---|
| `useInsertionEffect` | Перед мутациями DOM в commit | Да | Только CSS-in-JS: вставка `<style>` до чтения layout. Нет доступа к ref, нельзя setState |
| `useLayoutEffect` | После мутаций DOM, до paint | Да | Измерение layout (`getBoundingClientRect`), позиционирование тултипа, синхронный скролл |
| `useEffect` | После paint (обычно) | Нет | Подписки, запросы, логирование, синхронизация с внешними системами |

Порядок в commit: insertion-эффекты → мутации DOM → layout-эффекты (cleanup старых, затем новые, от детей к родителю) → paint → passive-эффекты.

Нюансы:
- Если `useEffect` вызван в результате дискретного события (клик), React может выполнить его синхронно до paint — чтобы результат был виден сразу. Не рассчитывайте на «всегда после paint».
- `setState` внутри `useLayoutEffect` вызывает синхронный повторный рендер до paint — пользователь не увидит промежуточный кадр (но это дорого).
- `useLayoutEffect` не выполняется на сервере (в старых версиях давал warning). Для изоморфного кода — `useIsomorphicLayoutEffect`.
- Cleanup вызывается перед каждым повторным запуском эффекта и при размонтировании.

```tsx
function Tooltip({ anchor }: { anchor: DOMRect }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    setHeight(ref.current!.getBoundingClientRect().height); // без мерцания
  }, []);
  const top = anchor.top - height < 0 ? anchor.bottom : anchor.top - height;
  return <div ref={ref} style={{ position: 'fixed', top }}>...</div>;
}
```

### Массив зависимостей

- Сравнение `Object.is` по каждому элементу. Объект/функция, созданные в рендере, — каждый раз новые → эффект срабатывает каждый рендер.
- Без массива — каждый рендер; `[]` — только при монтировании (и повторно в StrictMode).
- Нельзя «врать» линтеру `react-hooks/exhaustive-deps`. Если зависимость мешает — меняйте код: перенесите объект внутрь эффекта, используйте функциональный setState, `useEffectEvent`, или вынесите функцию за компонент.

### Stale closures

Каждый рендер — снимок: функции, созданные в нём, замыкают пропсы и state **этого рендера**.

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // 🪤 всегда 0 + 1 — замкнут count из первого рендера
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>;
}
```

Способы исправить:
1. **Функциональное обновление:** `setCount(c => c + 1)` — не нужно читать `count`.
2. **Честные зависимости:** `[count]` — интервал пересоздаётся (иногда приемлемо).
3. **Ref с актуальным значением** («latest ref»):
   ```ts
   const latest = useRef(callback);
   useLayoutEffect(() => { latest.current = callback; });
   ```
4. **`useEffectEvent`** — функция, которая всегда видит последние пропсы/state, но не является реактивной зависимостью. Стабилизирован в React 19.2:
   ```tsx
   function ChatRoom({ roomId, theme }: Props) {
     const onConnected = useEffectEvent(() => showToast('Connected', theme));
     useEffect(() => {
       const conn = createConnection(roomId);
       conn.on('connected', onConnected);
       conn.connect();
       return () => conn.disconnect();
     }, [roomId]); // theme не переподключает чат
   }
   ```
   Effect Event вызывают только изнутри эффектов, не передают в дочерние компоненты.

Stale closure встречается также в `useCallback` с неполными deps, в обработчиках, подписанных вручную через `addEventListener`, в `setTimeout` в обработчиках («показать значение через 3 сек» покажет старое значение — и это корректное поведение снимка).

### useRef

- Мутабельный контейнер `{ current }`, переживающий рендеры. Изменение **не вызывает рендер**.
- Использования: доступ к DOM, хранение id таймеров/AbortController, «предыдущее значение», latest-ref, флаги.
- Не читать и не писать `ref.current` во время рендера (кроме ленивой инициализации `if (ref.current === null) ref.current = new Heavy()`) — это нарушает чистоту и ломает concurrent-рендер и React Compiler.
- React 19: `ref` — обычный проп для функциональных компонентов, `forwardRef` больше не нужен; ref-колбэк может возвращать cleanup-функцию.

```tsx
function Input({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}

<div ref={node => {
  const ro = new ResizeObserver(() => {/* ... */});
  ro.observe(node);
  return () => ro.disconnect(); // React 19
}} />
```

`useImperativeHandle` — ограничить публичный API ref'а (`focus`, `scrollToItem`) вместо выдачи DOM-узла целиком.

### useSyncExternalStore

Правильный способ подписаться на внешний мутабельный источник (стор, `matchMedia`, `navigator.onLine`, история браузера). Решает проблему **tearing** — когда в concurrent-рендере разные компоненты прочитали разные версии стора.

```ts
function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(
    subscribe,                 // стабильная ссылка! иначе переподписка каждый рендер
    () => navigator.onLine,    // getSnapshot: должен возвращать одинаковое значение, если стор не менялся
    () => true,                // getServerSnapshot для SSR
  );
}
```

🪤 Ловушка: `getSnapshot`, возвращающий новый объект на каждый вызов (`() => ({ ...store })`), даёт бесконечный цикл. Возвращайте иммутабельный снимок или примитив. Обновления из внешнего стора всегда синхронные (не могут быть transition).

### useId

Генерирует стабильный уникальный id, **совпадающий на сервере и клиенте** (основан на позиции в дереве). Для `htmlFor`/`aria-describedby`. Не для ключей списков.

```tsx
const id = useId();
return <><label htmlFor={id}>Email</label><input id={id} aria-describedby={`${id}-hint`} /></>;
```

### Прочие хуки коротко

- `useContext` / `use(Context)` — читает ближайший провайдер; любой потребитель перерендерится при смене `value` (см. [03](03-state-management.md)).
- `useMemo` / `useCallback` — кэш значения/функции между рендерами по deps; подробно в [04](04-performance.md).
- `useDebugValue` — подпись кастомного хука в DevTools.
- `useActionState`, `useOptimistic`, `useFormStatus`, `use` — React 19, см. [05](05-react-19-and-server-components.md).

### Кастомные хуки

Кастомный хук переиспользует **логику с состоянием**, а не само состояние: каждый вызов — независимые узлы хуков.

```ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`useLocalStorage: failed to persist "${key}"`, e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

Принципы:
- Название описывает цель, а не механику: `useChatRoom`, `useOnlineStatus`, а не `useMount`/`useEffectOnce` (обёртки над жизненным циклом скрывают зависимости).
- Возвращать стабильные ссылки (`useCallback`) для функций, которые потребитель может положить в deps.
- Кортеж `as const` для 2 значений, объект — для большего количества.
- Хук без вызова других хуков — это просто функция, не называйте её `use*`.

### You Might Not Need an Effect

Эффект — «аварийный выход» для синхронизации с **внешней системой**. Если внешней системы нет, эффект, скорее всего, лишний.

| Анти-паттерн | Правильно |
|---|---|
| `useEffect(() => setFullName(first + ' ' + last), [first, last])` | Вычислить в рендере: `const fullName = ...` |
| Фильтрация списка в эффекте в отдельный state | `useMemo` (или просто вычисление) |
| Сброс state при смене пропа через эффект | `key={id}` или корректировка state во время рендера |
| Отправка запроса «POST при сабмите» в эффекте, триггерящемся флагом | Делать прямо в обработчике события |
| Цепочки эффектов, вызывающих setState друг друга | Вычислить всё в обработчике одним обновлением |
| Уведомление родителя `onChange` из эффекта после смены state | Вызвать `onChange` в том же обработчике, или поднять state |
| Загрузка данных в эффекте без cleanup | Фреймворк / TanStack Query / RSC; если эффект — с `ignore`-флагом или `AbortController` |
| Инициализация приложения в `useEffect(…, [])` (выполнится 2 раза в dev) | Код на уровне модуля или guard-флаг |

Правило: код, который должен выполниться **потому что пользователь что-то сделал**, — в обработчике. Код, который должен выполниться **потому что компонент показан** — в эффекте.

```tsx
// Загрузка в эффекте — корректная версия с отменой гонок
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => { if (err.name !== 'AbortError') setError(err); });
  return () => controller.abort();
}, [id]);
```

## Вопросы с собеседований

<details><summary>Почему хуки нельзя вызывать в условиях?</summary>

React хранит хуки во Fiber как связный список по порядку вызова, без имён. При условном вызове порядок меняется между рендерами, и хук получит чужое состояние. `use()` — исключение, т.к. не занимает слот состояния.
</details>

<details><summary>В чём разница useEffect и useLayoutEffect? Когда нужен useInsertionEffect?</summary>

Layout-эффект синхронно после мутаций DOM до paint — для измерений и предотвращения мерцания; блокирует отрисовку. Обычный — после paint, не блокирует. Insertion — до мутаций DOM, только для вставки стилей в CSS-in-JS библиотеках, чтобы layout-эффекты читали уже стилизованный DOM.
</details>

<details><summary>Что такое stale closure и как её исправить?</summary>

Функция замкнула значения конкретного рендера и использует их позже, когда они устарели. Фиксы: функциональный setState, честные deps, latest-ref, `useEffectEvent`. Для senior: объяснить, что это не баг React, а следствие модели «рендер — снимок», и что обход через ref ломает «реактивность» — использовать осознанно.
</details>

<details><summary>Почему useEffect с [] вызывается дважды?</summary>

StrictMode в dev делает mount → unmount → mount, проверяя симметричность cleanup. Чинить cleanup, а не отключать StrictMode. Одноразовую инициализацию приложения выносить на уровень модуля.
</details>

<details><summary>Зачем нужен useSyncExternalStore, если есть useEffect + useState?</summary>

Эффект подписывается после commit — между рендером и подпиской можно пропустить изменение. В concurrent-рендере разные компоненты могут прочитать разные значения стора (tearing). `useSyncExternalStore` проверяет снимок перед commit, делает такие обновления синхронными и поддерживает SSR через `getServerSnapshot`. На нём построены Zustand, Redux (`react-redux` v8+), Jotai.
</details>

<details><summary>Как сделать, чтобы эффект читал актуальный проп, но не перезапускался от него?</summary>

`useEffectEvent` (React 19.2): обернуть нереактивную логику в Effect Event и вызывать его из эффекта. Раньше — latest-ref. Нельзя просто убрать зависимость из массива — это stale closure.
</details>

<details><summary>useState vs useReducer — критерии выбора?</summary>

`useReducer`: несколько связанных полей, переходы зависят от предыдущего состояния, нужна тестируемость логики отдельно от UI, хочется прокинуть один стабильный `dispatch` вглубь. `useState`: независимые простые значения. Производительность одинакова.
</details>

<details><summary>Можно ли читать ref.current в рендере?</summary>

Нет (кроме ленивой инициализации). Ref не отслеживается React, рендер становится нечистым: при прерванном или повторном рендере значение может быть несогласованным, а React Compiler пропускает компоненты с такими нарушениями. Для значений, влияющих на UI, — state.
</details>

<details><summary>Как избежать гонки при загрузке данных в эффекте?</summary>

В cleanup отменять предыдущий запрос (`AbortController`) или выставлять флаг `ignore = true` и проверять его перед `setState`. В проде — библиотека с кэшем (TanStack Query, SWR) или загрузка в роутере / RSC, т.к. эффекты дают водопады и не работают с SSR.
</details>

<details><summary>Что изменилось с ref в React 19?</summary>

`ref` — обычный проп функционального компонента, `forwardRef` не нужен (будет депрекейтнут). Ref-колбэки могут возвращать cleanup. `useRef` в TS требует аргумент. `element.ref` у элементов deprecated.
</details>

<details><summary>Как правильно писать кастомные хуки? Что такое плохой кастомный хук?</summary>

Хук инкапсулирует конкретную задачу (`useOnlineStatus`), возвращает стабильные ссылки, честно объявляет зависимости. Плохие: `useMount`/`useUpdateEffect` (прячут зависимости), хук без хуков внутри, хук, возвращающий нестабильный объект, который потребители кладут в deps.
</details>

## Практика

**1. Предскажи вывод (StrictMode, dev).**

```tsx
function A() {
  useEffect(() => {
    console.log('effect');
    return () => console.log('cleanup');
  }, []);
  useLayoutEffect(() => console.log('layout'), []);
  console.log('render');
  return null;
}
```

<details><summary>Решение</summary>

`render`, `render` (двойной вызов функции, второй лог в DevTools приглушён), `layout`, `effect`, затем симуляция размонтирования и повторного монтирования эффектов: `cleanup`, `layout`, `effect` (cleanup layout-эффекта тоже вызывается, но у него нет функции очистки). В проде: `render`, `layout`, `effect`.
</details>

**2. Реализуй `usePrevious`.**

<details><summary>Решение</summary>

```ts
// Вариант без чтения ref в рендере — хранение в state
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);
  if (!Object.is(value, current)) {   // корректировка state во время рендера — разрешённый паттерн
    setPrevious(current);
    setCurrent(value);
  }
  return previous;
}
```

Классический вариант с `useRef` + `useEffect` работает, но читает ref в рендере.
</details>

**3. Реализуй `useMediaQuery(query)` на `useSyncExternalStore`.**

<details><summary>Решение</summary>

```ts
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
```
</details>

**4. Рефакторинг.** Компонент держит `items`, `filter` и `visibleItems` в трёх `useState`, а `visibleItems` обновляет в `useEffect`. Что не так?

<details><summary>Решение</summary>

Производное состояние: лишний рендер с несогласованными данными, риск рассинхрона. Удалить `visibleItems` и эффект, считать в рендере (`useMemo`, если фильтрация дорогая).
</details>

## Источники
- https://react.dev/reference/rules/rules-of-hooks
- https://react.dev/learn/you-might-not-need-an-effect
- https://react.dev/learn/synchronizing-with-effects
- https://react.dev/learn/separating-events-from-effects
- https://react.dev/learn/removing-effect-dependencies
- https://react.dev/learn/reusing-logic-with-custom-hooks
- https://react.dev/reference/react/useLayoutEffect
- https://react.dev/reference/react/useInsertionEffect
- https://react.dev/reference/react/useSyncExternalStore
- https://react.dev/reference/react/useEffectEvent
- https://react.dev/reference/react/useId
- https://react.dev/blog/2025/10/01/react-19-2
