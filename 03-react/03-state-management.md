# Управление состоянием

> ⏱ ~3 ч · 🎯 Классифицировать состояние по природе (локальное, серверное, глобальное клиентское, URL, форма), обосновать выбор инструмента под каждый тип и объяснить trade-offs Context, Redux Toolkit, Zustand, Jotai, MobX и TanStack Query.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу разложить состояние приложения по категориям и выбрать инструмент для каждой
- [ ] Понимаю, почему Context — не state-менеджер, и знаю способы обойти лишние ререндеры
- [ ] Знаю модели: flux/immutable (RTK, Zustand), атомарную (Jotai), observable (MobX)
- [ ] Понимаю stale-while-revalidate, ключи запросов, инвалидацию в TanStack Query

## Теория

### Классификация состояния

Главная senior-мысль: **сначала определить тип состояния, потом выбирать инструмент.** Большинство «глобальных сторов» в старых проектах на 80% состояли из кэша серверных данных.

| Тип | Примеры | Инструмент |
|---|---|---|
| Локальное UI | открыт ли дропдаун, значение инпута | `useState` / `useReducer` |
| Общее UI поддерева | состояние визарда, тема, текущий пользователь | lifting state up, Context (редко меняется), composition |
| Серверное (кэш) | списки, сущности, профиль | TanStack Query, SWR, RTK Query, RSC/loader фреймворка |
| Глобальное клиентское | корзина офлайн, редактор, сложный UI-стейт, WebSocket-стрим | Zustand, Redux Toolkit, Jotai, MobX |
| URL | фильтры, пагинация, выбранная вкладка, поиск | `searchParams` роутера, nuqs |
| Форма | значения, валидация, dirty/touched | React Hook Form, TanStack Form, нативные формы + Actions |
| Персистентное | настройки, черновики | localStorage/IndexedDB + синхронизация |

Свойства серверного состояния: принадлежит не вам, асинхронное, может устареть, разделяется между пользователями, нужно кэшировать, дедуплицировать запросы, инвалидировать, ретраить, пагинировать. Писать это руками на `useEffect` + Redux — источник большинства багов.

URL-состояние недооценено: шаринг ссылки, back/forward, перезагрузка. Если состояние должно пережить F5 и быть в ссылке — оно в URL.

💡 На собеседовании: «Я начинаю с вопроса, где живёт источник истины. Серверное — в query-кэше, навигационное — в URL, локальное — в компоненте. Глобальный клиентский стор остаётся для действительно клиентских данных, и обычно он маленький».

### Context и его проблемы

Context — механизм **передачи значения** (dependency injection) вниз по дереву без prop drilling, а не state-менеджер. Сам по себе он ничего не хранит — хранит `useState` в провайдере.

Проблемы:
1. **Все потребители перерендериваются** при смене `value` (сравнение `Object.is`), даже если используют одно поле. Селекторов нет.
2. **Новый объект в value каждый рендер** провайдера → ререндер всех потребителей:
   ```tsx
   // 🪤 Ловушка
   <AuthContext value={{ user, login, logout }}>  {/* React 19: <Context> вместо <Context.Provider> */}
   ```
3. «Provider hell» и неявные зависимости — компонент нельзя переиспользовать без провайдера.

Способы смягчить:

```tsx
// 1. Мемоизация value
const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

// 2. Разделение state и dispatch на два контекста — потребители dispatch не ререндерятся
const StateCtx = createContext<State | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <DispatchCtx value={dispatch}>
      <StateCtx value={state}>{children}</StateCtx>
    </DispatchCtx>
  );
}

// 3. Хук-потребитель с проверкой провайдера
export function useAppState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useAppState must be used within <Provider>');
  return ctx;
}
```

4. Разбить один большой контекст на несколько по частоте изменений.
5. Передавать в контекст **стабильный стор** (объект с `subscribe/getState`), а подписку делать через `useSyncExternalStore` с селектором — так устроены Zustand/Redux. Контекст при этом никогда не меняется.
6. `children`-паттерн: провайдер принимает `children`, чтобы смена state провайдера не рендерила всё дерево, а только потребителей.

Context идеален для редко меняющихся значений: тема, локаль, текущий пользователь, DI зависимостей (API-клиент, фича-флаги), compound components.

### Redux Toolkit

Redux — один стор, иммутабельные обновления через чистые редьюсеры, action как событие. **RTK** — официальный способ писать Redux: `configureStore`, `createSlice` (Immer внутри — можно «мутировать» черновик), `createAsyncThunk`, `createEntityAdapter`, **RTK Query** для серверного кэша.

```ts
import { createSlice, configureStore, type PayloadAction } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[] },
  reducers: {
    added(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);   // Immer создаст новый объект
    },
    removed(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;

// Компонент: useSelector подписывается через useSyncExternalStore
const count = useSelector((s: RootState) => s.cart.items.length);
```

Плюсы: предсказуемость, DevTools с time-travel, middleware (логирование, аналитика, саги/listener), строгий однонаправленный поток — хорошо для больших команд и сложной доменной логики. Минусы: церемонии, всё в одном сторе, нужно мемоизировать селекторы (`createSelector`), иначе селектор, возвращающий новый массив, ререндерит компонент на каждый dispatch.

🪤 Ловушка: `useSelector(s => s.items.filter(...))` — новый массив каждый раз → ререндер на любой action. Решение — `createSelector` (reselect) или `shallowEqual`.

### Zustand

Минималистичный стор на хуке, без провайдера, селекторы из коробки.

```ts
import { create } from 'zustand';

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
}

export const useCart = create<CartState>()(set => ({
  items: [],
  add: item => set(s => ({ items: [...s.items, item] })),
  remove: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),
}));

// Подписка только на нужный срез
const count = useCart(s => s.items.length);
const add = useCart(s => s.add);
// Для нескольких полей — useShallow, иначе новый объект = ререндер
const { items, remove } = useCart(useShallow(s => ({ items: s.items, remove: s.remove })));
```

Плюсы: маленький API, нет boilerplate, работает вне React (`useCart.getState()`), middleware `persist`, `devtools`, `immer`. Минусы: меньше структуры — в большой команде нужны соглашения; для SSR с изоляцией данных между запросами — создавать стор на запрос через контекст (глобальный модуль-синглтон на сервере разделяется между пользователями).

### Jotai

**Атомарная** модель (вдохновлён Recoil): состояние — набор маленьких атомов, производные атомы вычисляются из других; граф зависимостей строится снизу вверх.

```ts
import { atom, useAtom, useAtomValue } from 'jotai';

const priceAtom = atom(100);
const qtyAtom = atom(2);
const totalAtom = atom(get => get(priceAtom) * get(qtyAtom)); // производный
const asyncUserAtom = atom(async () => (await fetch('/api/me')).json()); // работает с Suspense

function Total() {
  const total = useAtomValue(totalAtom); // ререндер только при изменении total
  return <span>{total}</span>;
}
```

Хорош для гранулярного состояния с множеством независимых кусков (редакторы, дашборды с виджетами), близок к модели сигналов. Минусы: при большом графе сложно отследить потоки данных.

### MobX

**Observable / реактивная** модель: мутабельные объекты-наблюдаемые, компоненты в `observer()` автоматически отслеживают, какие поля прочитаны во время рендера, и перерендериваются только при их изменении (fine-grained, как Vue).

```ts
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class CartStore {
  items: CartItem[] = [];
  constructor() { makeAutoObservable(this); }
  get total() { return this.items.reduce((s, i) => s + i.price, 0); } // computed, кэшируется
  add(item: CartItem) { this.items.push(item); }                        // action
}

const CartTotal = observer(({ store }: { store: CartStore }) => <b>{store.total}</b>);
```

Плюсы: минимум кода, точечные ререндеры, удобно для сложных доменных моделей (ООП). Минусы: «магия», мутабельность противоречит модели React (сложнее с concurrent-фичами и React Compiler), хуже предсказуемость при отладке.

### TanStack Query

Библиотека **серверного состояния**: кэш по ключу, stale-while-revalidate, дедупликация, ретраи, фоновое обновление, пагинация, мутации, оптимистичные апдейты, Suspense.

```tsx
const userQuery = (id: string) => queryOptions({
  queryKey: ['user', id],
  queryFn: ({ signal }) => fetch(`/api/users/${id}`, { signal }).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<User>;
  }),
  staleTime: 60_000,
});

function Profile({ id }: { id: string }) {
  const { data, isPending, error } = useQuery(userQuery(id));
  // ...
}

function useRenameUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; name: string }) => api.rename(p),
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: ['user', id] }),
  });
}
```

Ключевые понятия:
- `staleTime` — сколько данные считаются свежими (по умолчанию 0 — сразу устаревшие, рефетч при маунте/фокусе окна).
- `gcTime` (бывший `cacheTime`) — сколько неиспользуемые данные живут в кэше (5 минут).
- `queryKey` — массив-зависимость; всё, от чего зависит `queryFn`, должно быть в ключе.
- `invalidateQueries` по префиксу ключа, `setQueryData` для ручного обновления, `prefetchQuery` для предзагрузки (например, на hover или в лоадере роутера).
- Состояния: `isPending` (нет данных) vs `isFetching` (идёт запрос, данные могут быть).

Альтернативы: SWR (проще), RTK Query (если уже Redux), Apollo/urql (GraphQL с нормализованным кэшем), и — в RSC-мире — загрузка данных на сервере вообще без клиентского кэша.

### Критерии выбора

| Критерий | Context | RTK | Zustand | Jotai | MobX |
|---|---|---|---|---|---|
| Boilerplate | низкий | средний | минимальный | минимальный | низкий |
| Гранулярность подписок | нет | селекторы | селекторы | атомы | автоматическая |
| DevTools / time travel | нет | лучшие | через middleware | есть | есть |
| Структура для большой команды | — | сильная | слабая | средняя | средняя |
| Вне React | нет | да | да | да (store) | да |
| Модель | DI | immutable flux | immutable | атомы/граф | mutable observable |

Вопросы для выбора:
1. Сколько реально глобального **клиентского** состояния после выноса серверного в Query и навигационного в URL?
2. Размер и опыт команды — нужна ли строгая архитектура (RTK) или достаточно лёгкости (Zustand)?
3. Характер обновлений: частые точечные (Jotai/MobX/сигналы) или редкие крупные?
4. SSR/RSC: стор на запрос, гидратация кэша (`HydrationBoundary` в TanStack Query).
5. Существующий код и стоимость миграции.

💡 На собеседовании: дефолт для нового SPA — TanStack Query + URL + локальный state + (при необходимости) Zustand. Redux Toolkit — для сложных доменов, где ценна явная событийная модель и инструментирование. В Next.js App Router — данные на сервере через RSC, клиентский стор минимальный.

## Вопросы с собеседований

<details><summary>Почему Context не является state-менеджером?</summary>

Context лишь передаёт значение по дереву; хранение — в `useState` провайдера. Нет селекторов: любое изменение `value` ререндерит всех потребителей. Нет middleware, devtools, работы вне React. Подходит для редко меняющихся данных и DI.
</details>

<details><summary>Как избежать лишних ререндеров при использовании Context?</summary>

Мемоизировать `value`; разделить state и dispatch; разбить по частоте изменений; передавать в контекст стабильный стор и подписываться с селектором через `useSyncExternalStore`; обернуть тяжёлые поддеревья в `memo`; использовать `children`, чтобы провайдер не рендерил всё дерево.
</details>

<details><summary>Что такое серверное состояние и почему его не стоит хранить в Redux вручную?</summary>

Это кэш данных, источник истины которых на сервере. Требуются дедупликация, кэш с временем жизни, фоновая ревалидация, ретраи, отмена, синхронизация между вкладками, пагинация, оптимистичные обновления. Писать это руками в Redux — много кода и багов (гонки, stale-данные). Специализированные библиотеки решают это декларативно.
</details>

<details><summary>Redux Toolkit vs Zustand — когда что?</summary>

RTK: большая команда, сложная бизнес-логика с событиями, нужны middleware/listeners, time-travel, строгие соглашения, уже есть Redux. Zustand: небольшое глобальное состояние, нужна простота, минимум boilerplate, доступ к стору вне React. Технически оба — immutable стор + `useSyncExternalStore` + селекторы.
</details>

<details><summary>Чем атомарный подход (Jotai) отличается от единого стора?</summary>

Единый стор — сверху вниз: одно дерево, селекторы вырезают куски. Атомы — снизу вверх: независимые единицы и производные атомы с графом зависимостей; подписка только на конкретный атом, нет нужды в мемоизации селекторов. Хорош для гранулярных, динамически создаваемых состояний (`atomFamily`).
</details>

<details><summary>В чём идея MobX и почему его критикуют в контексте React?</summary>

Наблюдаемые мутабельные объекты, автоматическое отслеживание зависимостей при рендере `observer`-компонентов, computed с кэшем. Точечные обновления без селекторов. Критика: мутабельность против иммутабельной модели React, неявность, сложнее совместимость с concurrent-рендером и компилятором.
</details>

<details><summary>Что такое staleTime и gcTime в TanStack Query?</summary>

`staleTime` — время, в течение которого данные считаются свежими и не рефетчатся при маунте/фокусе. `gcTime` — время жизни неактивных (без подписчиков) данных в кэше до удаления. Дефолт `staleTime: 0` агрессивно рефетчит — обычно его поднимают.
</details>

<details><summary>Какое состояние должно жить в URL?</summary>

То, что пользователь ожидает сохранить при перезагрузке, шаринге ссылки и навигации назад: фильтры, сортировка, пагинация, поисковый запрос, выбранная вкладка, открытая модалка с сущностью. Плюс: SSR может прочитать его из запроса.
</details>

<details><summary>Как организовать глобальный стор при SSR?</summary>

Не использовать модульный синглтон с пользовательскими данными на сервере — он разделяется между запросами (утечка данных). Создавать стор на запрос и передавать через контекст; сериализовать начальное состояние в HTML и гидратировать на клиенте (`HydrationBoundary` / `dehydrate` в TanStack Query).
</details>

<details><summary>Lifting state up vs composition — что предпочесть перед глобальным стором?</summary>

Сначала поднять state к ближайшему общему предку. Если появляется prop drilling — попробовать композицию (передать готовые элементы через `children`/слоты), чтобы промежуточные компоненты не знали о данных. Только потом Context или стор.
</details>

## Практика

**1. Аудит.** В Redux лежат: `user`, `products` (из API), `isSidebarOpen`, `filters` (каталог), `cartItems`, `formDraft`. Разложите по правильным местам.

<details><summary>Решение</summary>

`user` — серверное (Query) + возможно Context для удобного доступа; `products` — Query; `isSidebarOpen` — локальный state или маленький UI-стор; `filters` — URL; `cartItems` — если корзина на сервере — Query с оптимистичными мутациями, если клиентская — Zustand + persist; `formDraft` — библиотека форм, черновик — localStorage.
</details>

**2. Реализуй мини-Zustand** (`createStore` + хук с селектором).

<details><summary>Решение</summary>

```ts
import { useSyncExternalStore } from 'react';

type SetState<T> = (partial: Partial<T> | ((s: T) => Partial<T>)) => void;

export function create<T extends object>(init: (set: SetState<T>, get: () => T) => T) {
  let state: T;
  const listeners = new Set<() => void>();
  const get = () => state;
  const set: SetState<T> = partial => {
    const patch = typeof partial === 'function' ? partial(state) : partial;
    const changed = Object.keys(patch).some(k => !Object.is(patch[k as keyof T], state[k as keyof T]));
    if (!changed) return;                 // ничего не изменилось — не будим подписчиков
    state = { ...state, ...patch };       // новая ссылка — иммутабельное обновление
    listeners.forEach(l => l());
  };
  const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
  state = init(set, get);

  return function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  };
}
```

Селектор должен возвращать примитив или стабильную ссылку, иначе бесконечный цикл — поэтому в Zustand есть `useShallow`.
</details>

**3. Исправь ререндеры.** `ThemeContext` хранит `{ theme, setTheme, user, notifications }`; уведомления приходят каждую секунду, и вся страница ререндерится.

<details><summary>Решение</summary>

Вынести `notifications` в отдельный стор с селекторами (или отдельный контекст), разделить тему и пользователя, мемоизировать value. Компоненты, которым нужна только тема, перестанут ререндериться.
</details>

## Источники
- https://react.dev/learn/managing-state
- https://react.dev/learn/scaling-up-with-reducer-and-context
- https://react.dev/learn/passing-data-deeply-with-context
- https://react.dev/reference/react/useContext
- https://redux-toolkit.js.org/
- https://redux.js.org/usage/deriving-data-selectors
- https://zustand.docs.pmnd.rs/
- https://jotai.org/docs
- https://mobx.js.org/README.html
- https://tanstack.com/query/latest/docs/framework/react/overview
- https://tkdodo.eu/blog/practical-react-query
