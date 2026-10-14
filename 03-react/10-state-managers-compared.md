# Стейт-менеджеры: сравнение и проектирование кэша

> ⏱ ~4 ч · 🎯 Разложить состояние по природе и времени жизни, объяснить пять моделей стейт-менеджмента на уровне механики подписок, сравнить RTK/RTK Query, Zustand, Jotai, MobX, Valtio, XState, effector, TanStack Query и SWR, спроектировать кэширование и инвалидацию серверного состояния и обосновать выбор стека для нового проекта.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · база: [Управление состоянием](03-state-management.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Классифицирую состояние по владельцу и времени жизни, а не «по библиотеке»
- [ ] Объясняю пять моделей: single store, atomic, proxy/observable, state machine, event-based
- [ ] Пишу одну фичу на RTK Query, Zustand + Query, Jotai, MobX и effector
- [ ] Проектирую ключи запросов, staleTime/gcTime, инвалидацию по ключам и тегам
- [ ] Делаю оптимистичное обновление с откатом и понимаю гонки при параллельных мутациях
- [ ] Могу защитить выбор стека перед командой (критерии, миграция, ADR)

## Теория

Эта страница углубляет [03-state-management.md](03-state-management.md): там — базовые API Context/RTK/Zustand/Jotai/MobX/Query. Здесь — механика, сравнение «один-в-один» и проектирование кэша.

### Классификация: владелец и время жизни

Вопрос «какой стейт-менеджер?» некорректен, пока не ответили на два других: **кто владеет источником истины** и **сколько живёт значение**.

| Тип | Владелец истины | Время жизни | Типичная ошибка | Инструмент |
|---|---|---|---|---|
| Server state | сервер | пока не устарел | копировать в Redux и синхронизировать руками | TanStack Query, SWR, RTK Query, Apollo/Relay |
| Client (domain) | клиент | сессия / persist | хранить там же серверные сущности | Zustand, RTK, Jotai, MobX, effector |
| UI (ephemeral) | компонент | пока смонтирован | выносить в глобальный стор «на всякий случай» | `useState`, `useReducer` |
| URL | адресная строка | навигация | дублировать фильтры в сторе → рассинхрон | router `searchParams`, nuqs |
| Form | форма | до submit | контролировать каждое поле через глобальный стор | React Hook Form, TanStack Form, Actions |
| Process (flow) | клиент | до завершения сценария | «булев суп» `isLoading && !isError && step===2` | XState, `useReducer` с union-состояниями |

**Derived state** — не тип, а правило: если значение вычисляется из другого состояния, его **не хранят**, а вычисляют (селектор, `computed`, производный атом). Хранение производных — главный источник рассинхрона.

💡 На собеседовании: «Сначала инвентаризация: серверное уходит в query-кэш, навигационное — в URL, формы — в библиотеку форм, сценарии с запрещёнными переходами — в машину состояний. Глобальный клиентский стор — то, что осталось, и обычно он маленький».

### Пять моделей

| Модель | Идея | Как узнаёт, кого перерендерить | Представители |
|---|---|---|---|
| Flux / single store | одно иммутабельное дерево, изменения — через действия | подписчик сравнивает результат **селектора** (`Object.is`/shallow) после каждого изменения | Redux Toolkit, Zustand |
| Atomic | граф маленьких атомов, производные атомы вычисляются из зависимостей | точные зависимости графа: обновляется только атом и его потребители | Jotai, Recoil (архивирован) |
| Proxy / observable | мутабельные объекты, чтение отслеживается автоматически | **трекинг чтений** во время рендера (как Vue / сигналы) | MobX, Valtio |
| State machine | явные состояния и разрешённые переходы, события | подписка на снапшот актора + селектор | XState, `@xstate/store` |
| Event-based (реактивный граф) | события → сторы → эффекты, связи декларируются `sample` | сторы — узлы графа, компонент подписан на конкретные сторы | effector |

Все React-обёртки внешних сторов сводятся к `useSyncExternalStore(subscribe, getSnapshot)`: он гарантирует отсутствие **tearing** (разные компоненты видят разные версии стора в одном concurrent-рендере). Цена: обновление внешнего стора всегда синхронное, его нельзя «отложить» через `startTransition` так же, как `useState`.

🪤 Ловушка: `getSnapshot`/селектор обязан возвращать стабильную ссылку при неизменных данных. `useStore(s => ({ a: s.a, b: s.b }))` создаёт новый объект на каждый вызов → лишние ререндеры, а в Zustand v5 — бесконечный цикл. Лечится `useShallow` (`zustand/react/shallow`) или мемоизированными селекторами (`createSelector`).

### Redux Toolkit + RTK Query

Сильная сторона Redux — **события как данные**: action сериализуем, его можно логировать, воспроизводить, обрабатывать в middleware. RTK убирает церемонии:
- `createSlice` (Immer), `createEntityAdapter` (нормализованные `ids/entities` + готовые селекторы), `createSelector`;
- `createListenerMiddleware` — реакция на действия (замена саг для большинства задач: debounce, отмена, «по событию A сделать B»);
- **RTK Query** — серверный кэш внутри того же стора: эндпоинты, хуки, `providesTags`/`invalidatesTags`, `keepUnusedDataFor` (по умолчанию 60 с), `onQueryStarted` + `updateQueryData` для оптимистичных патчей с `patchResult.undo()`.

Когда RTK оправдан: большая команда, сложный клиентский домен (редакторы, офлайн, торговые терминалы), нужен аудит действий, уже есть Redux. Минус — объём кода и «всё в одном сторе» (code splitting редьюсеров через `combineSlices().inject`).

### Zustand

Иммутабельный стор на замыкании + `useSyncExternalStore`. Ключевые приёмы уровня senior:
- **Vanilla-стор** `createStore` из `zustand/vanilla` + `useStore(store, selector)` — стор вне React (WebSocket-слой, тесты) и **стор на запрос** при SSR (через контекст), потому что модульный синглтон на сервере общий для всех пользователей.
- Паттерн slices: стор собирается из функций `createXSlice(set, get)`; middleware `persist`, `devtools`, `immer`, `subscribeWithSelector`.
- Transient updates: `store.subscribe` в `useEffect` + запись в ref/DOM без ререндера (курсоры, анимации).

### Jotai

Атом — **конфиг**, значение живёт в `store` (`Provider` или `getDefaultStore()`). Производные атомы (`atom(get => ...)`) формируют граф; async-атомы интегрируются с Suspense; `atomWithQuery` из `jotai-tanstack-query` делает query-ключ зависимым от других атомов. `atomFamily` в `jotai/utils` объявлен устаревшим (перенос в пакет `jotai-family`); это Map по параметру — без `remove`/`setShouldRemove` растёт бесконечно.

Сильная сторона — гранулярность без селекторов и динамически создаваемое состояние (виджеты дашборда, ячейки таблицы). Слабая — поток данных размазан по графу; в большой кодовой базе нужны соглашения «где живут атомы».

### MobX и Valtio

Обе — proxy/observable: пишем мутациями, чтение во время рендера отслеживается.

- **MobX**: `makeAutoObservable` (поля → observable, геттеры → computed с кэшем, методы → action, генераторы → flow). После `await` изменения оборачивают в `runInAction` (или используют `flow`), потому что продолжение async-функции — уже не внутри action. `reaction`/`autorun` — побочные эффекты. Подходит для богатых доменных моделей (ООП, классы, связи между сущностями).
- **Valtio**: `proxy(obj)` — мутируем; `useSnapshot(state)` — неизменяемый снапшот для рендера с трекингом прочитанных полей; `subscribe`/`subscribeKey` — вне React. 🪤 Ловушка: читать из снапшота, писать в proxy; для controlled input нужен `useSnapshot(state, { sync: true })`, иначе батчинг сбивает каретку.

Общая критика: мутабельность против модели React (Compiler и concurrent-фичи рассчитаны на иммутабельные значения), «магия» трекинга, сложнее ревью.

### XState

Машина состояний делает **невозможные состояния непредставимыми**: вместо пяти булевых флагов — `idle | loading | success | failure` с явными переходами. В v5 всё — акторы: машина, промис (`fromPromise`), callback. `setup({ types, actions, guards, actors }).createMachine(...)`, в React — `useMachine`/`useActor`, `useActorRef` + `useSelector` (без ререндера на каждое изменение), `createActorContext` для шаринга.

```ts
const todosMachine = setup({
  types: { context: {} as { todos: Todo[]; error?: string }, events: {} as { type: 'RETRY' } },
  actors: { load: fromPromise(() => api.getTodos()) },
}).createMachine({
  context: { todos: [] },
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: 'load',
        onDone: { target: 'ready', actions: assign({ todos: ({ event }) => event.output }) },
        onError: { target: 'failure', actions: assign({ error: ({ event }) => String(event.error) }) },
      },
    },
    ready: {},
    failure: { on: { RETRY: 'loading' } }, // из ready RETRY невозможен — переход не описан
  },
});
```

Место XState — сценарии (checkout, визарды, загрузка файлов, видеоплеер, авторизация с MFA), а не кэш данных. Для простого стора с событиями есть `@xstate/store`.

### effector

Событийная модель: **события** (`createEvent`) — входы, **сторы** (`createStore` + `.on`) — состояние, **эффекты** (`createEffect`) — побочные действия с `done/fail/pending`, связи — `sample({ clock, source, filter, fn, target })`. Бизнес-логика живёт в модели и не зависит от UI-фреймворка (есть `effector-react`, `effector-vue`). Сильная сторона — **scope**: `fork()` создаёт изолированную копию всех сторов (стор на запрос при SSR, изоляция тестов), `allSettled(event, { scope })` ждёт завершения всех эффектов, `serialize(scope)` отдаёт состояние на клиент. Для сериализации сторам нужны стабильные `sid` (добавляет babel/SWC-плагин).

### TanStack Query, SWR, Apollo/Relay

- **TanStack Query** — кэш по ключу: `staleTime` (по умолчанию 0), `gcTime` (5 мин для неактивных), рефетч stale-запросов на mount/focus/reconnect, 3 ретрая с экспоненциальной задержкой, **structural sharing** (сохраняет ссылки неизменившихся частей — меньше ререндеров), `select`, мутации с `onMutate/onError/onSettled`, `useMutationState`, persist и (экспериментально) синхронизация вкладок.
- **SWR** — проще и меньше: ключ = строка/массив, `dedupingInterval` (2 с), `mutate(key, promise, { optimisticData, rollbackOnError, populateCache, revalidate })`, `useSWRMutation`. Нет встроенной инвалидации по префиксу: используют `mutate(filterFn)`.
- **Apollo Client / Relay** — GraphQL с **нормализованным** кэшем (`__typename:id`): обновил сущность в ответе мутации — обновились все запросы, где она встречается. Relay идёт дальше: компилятор, колокация фрагментов, строгие соглашения схемы. Цена — сложность политик кэша (`typePolicies`, merge пагинации) и требование стабильных id.

### Одна фича на пяти библиотеках

Список todo с фильтром и переключением `done` на сервере, оптимистично. Общие типы:

```ts
type Filter = 'all' | 'active' | 'done';
const byFilter: Record<Filter, (t: Todo) => boolean> = {
  all: () => true, active: t => !t.done, done: t => t.done,
};
```

**RTK + RTK Query**

```ts
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Todo'],
  endpoints: b => ({
    getTodos: b.query<Todo[], void>({ query: () => 'todos', providesTags: [{ type: 'Todo', id: 'LIST' }] }),
    setDone: b.mutation<Todo, { id: string; done: boolean }>({
      query: ({ id, done }) => ({ url: `todos/${id}`, method: 'PATCH', body: { done } }),
      onQueryStarted({ id, done }, { dispatch, queryFulfilled }) {
        const patch = dispatch(api.util.updateQueryData('getTodos', undefined, draft => {
          const t = draft.find(x => x.id === id);
          if (t) t.done = done;                      // Immer-черновик
        }));
        queryFulfilled.catch(patch.undo);            // откат патча
      },
    }),
  }),
});
// filter — в slice или в URL; список — производный
const { data = [] } = api.useGetTodosQuery();
const visible = useMemo(() => data.filter(byFilter[filter]), [data, filter]);
```

**Zustand + TanStack Query** — клиентский стор только для фильтра, данные в query-кэше:

```ts
const useFilter = create<{ filter: Filter; set: (f: Filter) => void }>()(set => ({
  filter: 'all', set: filter => set({ filter }),
}));
const todosQuery = queryOptions({ queryKey: ['todos'], queryFn: api.getTodos });

const filter = useFilter(s => s.filter);
const { data: visible = [] } = useQuery({ ...todosQuery, select: todos => todos.filter(byFilter[filter]) });
const setDone = useMutation({
  mutationFn: api.setDone,
  onMutate: async ({ id, done }, ctx) => {
    await ctx.client.cancelQueries({ queryKey: ['todos'] });      // гонка с фоновым рефетчем
    const prev = ctx.client.getQueryData<Todo[]>(['todos']);
    ctx.client.setQueryData<Todo[]>(['todos'], old => old?.map(t => (t.id === id ? { ...t, done } : t)));
    return { prev };
  },
  onError: (_e, _v, res, ctx) => ctx.client.setQueryData(['todos'], res?.prev),
  onSettled: (_d, _e, _v, _r, ctx) => ctx.client.invalidateQueries({ queryKey: ['todos'] }),
});
```

**Jotai** — всё атомами, запись через write-only атом:

```ts
const filterAtom = atom<Filter>('all');
const todosAtom = atom<Todo[]>([]);
const visibleAtom = atom(get => get(todosAtom).filter(byFilter[get(filterAtom)]));
const setDoneAtom = atom(null, async (get, set, { id, done }: { id: string; done: boolean }) => {
  const prev = get(todosAtom);
  set(todosAtom, prev.map(t => (t.id === id ? { ...t, done } : t)));
  try { await api.setDone({ id, done }); }
  catch { set(todosAtom, cur => cur.map(t => (t.id === id ? { ...t, done: !done } : t))); } // точечный откат
});
```

**MobX** — класс-модель, мутации, computed:

```ts
class TodoStore {
  todos: Todo[] = [];
  filter: Filter = 'all';
  constructor(private api: Api) { makeAutoObservable(this, {}, { autoBind: true }); }
  get visible() { return this.todos.filter(byFilter[this.filter]); }  // computed, кэш
  async setDone(id: string, done: boolean) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    todo.done = done;                                   // синхронная часть — внутри action
    try { await this.api.setDone({ id, done }); }
    catch { runInAction(() => { todo.done = !done; }); } // после await — снова action
  }
}
const TodoList = observer(({ store }: { store: TodoStore }) => /* store.visible.map(...) */ null);
```

**effector** — события, сторы, эффекты, связи:

```ts
const filterChanged = createEvent<Filter>();
const $filter = createStore<Filter>('all').on(filterChanged, (_, f) => f);
const setDoneFx = createEffect(api.setDone);           // ({ id, done }) => Promise<Todo>
const $todos = createStore<Todo[]>([])
  .on(setDoneFx, (list, { id, done }) => list.map(t => (t.id === id ? { ...t, done } : t)))       // оптимистично
  .on(setDoneFx.fail, (list, { params }) =>
    list.map(t => (t.id === params.id ? { ...t, done: !params.done } : t)));                      // откат
const $visible = combine($todos, $filter, (todos, f) => todos.filter(byFilter[f]));
// компонент: const [visible, onDone] = useUnit([$visible, setDoneFx]);
```

Что видно из сравнения: в RTK Query и TanStack Query откат и синхронизация с сервером — **политика кэша** (snapshot/патч + инвалидация); в Jotai/MobX/effector это ваш код, и ревалидацию, дедупликацию, ретраи тоже придётся писать — поэтому на практике их комбинируют с query-библиотекой.

### Большая сравнительная таблица

Размеры — ориентировочные (min+gzip, порядок величины; зависят от версии и tree-shaking).

| | RTK (+Query) | Zustand | Jotai | MobX | Valtio | XState | effector | TanStack Query | SWR |
|---|---|---|---|---|---|---|---|---|---|
| Модель | flux, immutable | immutable store | атомы | observable | proxy | машины/акторы | события + граф | серверный кэш | серверный кэш |
| Бойлерплейт | средний | минимальный | минимальный | низкий | минимальный | высокий | средний | низкий | минимальный |
| Ререндеры | селекторы, нужна мемоизация | селекторы, `useShallow` | по атомам | авто-трекинг | авто-трекинг снапшота | `useSelector` по актору | по сторам | по полям результата (tracked) + `select` | по использованным полям |
| DevTools | Redux DevTools, time travel | через `devtools` middleware | есть (jotai-devtools) | mobx devtools | Redux DevTools (`devtools`) | Stately Inspector | есть (инспектор) | Query Devtools | ограниченно |
| SSR | стор на запрос, гидратация | стор на запрос через контекст | `Provider` на запрос, hydrate-утилиты | ручная сериализация | ручная | акторы на запрос | `fork`/`serialize` — лучший | `dehydrate`/`HydrationBoundary` | `fallback` |
| Размер | ~13 KB (+~10 KB Query) | ~1 KB | ~3–4 KB | ~16 KB | ~3 KB | ~15 KB | ~10 KB | ~13 KB | ~5 KB |
| Кривая обучения | средняя | низкая | низкая→средняя | средняя | низкая | высокая | средняя→высокая | средняя | низкая |
| Масштаб команды | сильная структура | нужны соглашения | нужны соглашения | ООП-модели, нужна дисциплина | малые команды | явные сценарии, документирует себя | модель отделена от UI | стандарт для серверного | малые/средние |

### Проектирование кэширования и инвалидации

**1. Ключи запросов — это схема кэша.** Иерархия от общего к частному позволяет инвалидировать префиксом:

```ts
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (f: { status: Filter; page: number }) => [...todoKeys.lists(), f] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
};
// после переименования: setQueryData(detail) + invalidateQueries({ queryKey: todoKeys.lists() })
```

Правила: всё, от чего зависит `queryFn`, — в ключе (иначе разные данные под одним ключом); ключ сериализуем; фабрика ключей — единая точка правды для команды.

**2. staleTime vs gcTime.** `staleTime` — свежесть (пока данные свежие, mount/focus не вызывают запрос); `gcTime` — сколько **неактивная** запись живёт в памяти. Подбор: справочники — `Infinity` + ручная инвалидация; ленты — 30–60 с; критичные балансы — 0 + рефетч на фокус. При SSR `staleTime > 0`, иначе клиент перезапросит только что гидратированные данные.

**3. Инвалидация: ключи vs теги.** TanStack Query и Pinia Colada инвалидируют по **префиксу ключа** (`exact` — только точный). RTK Query — по **тегам**: query объявляет `providesTags: [{ type: 'Todo', id }]` и `{ type: 'Todo', id: 'LIST' }`, мутация — `invalidatesTags`. Теги развязывают мутацию и запросы (мутации не нужно знать ключи списков), ключи проще и прозрачнее. Альтернатива инвалидации — **записать ответ мутации в кэш** (`setQueryData`), экономя запрос, но рискуя рассинхроном сортировок/агрегатов.

**4. Оптимистичное обновление и откат.** Алгоритм: отменить текущие запросы по ключу (иначе старый ответ затрёт оптимистичное значение) → снапшот → применить → при ошибке откатить → в любом случае ревалидировать. Нюансы lead-уровня:
- **Параллельные мутации**: откат полного снапшота вернёт и чужие изменения. Решения — точечный откат (инверсный патч), проверка «в кэше всё ещё моё значение» (так делает пример Pinia Colada), ревалидация только когда завершилась последняя мутация (`queryClient.isMutating({ mutationKey }) === 1` в `onSettled`), очередь мутаций по сущности.
- **Идемпотентность**: ретраи мутаций без idempotency-key создают дубли.
- **Когда не надо**: платежи, необратимые операции, сложная серверная валидация — показывать pending, а не врать.
- Альтернатива без трогания кэша — отрисовать `variables` pending-мутации (`useMutationState`) или `useOptimistic` в React 19.

**5. Нормализация.** Документный кэш (TanStack/SWR/RTK Query) хранит ответы как есть: одна сущность в двух списках — две копии, синхронизирует инвалидация. Нормализованный (Apollo/Relay, `createEntityAdapter`) хранит сущность один раз — дешёвые точечные обновления, но сложные merge-политики и пагинация. Выбор: GraphQL с богатым графом — нормализация; REST с ресурсами — документный кэш + инвалидация.

**6. Дедупликация.** Пока запрос по ключу в полёте, второй потребитель получает тот же промис; после — свежие данные из кэша до истечения `staleTime` (SWR — окно `dedupingInterval`). Важно отменять (`signal` в `queryFn`) и не пускать устаревший ответ поверх нового (сравнение версии/времени запроса).

**7. Синхронизация между вкладками.** Дешёвый вариант — `refetchOnWindowFocus`. Полный — `BroadcastChannel`: рассылать события инвалидации (`{ type: 'invalidate', key }`), а не данные; в TanStack Query есть экспериментальный `broadcastQueryClient` (`@tanstack/query-broadcast-client-experimental`). Для persist-сторов (Zustand `persist`, localStorage) — событие `storage` + `rehydrate`. Конфликты двух вкладок с мутациями — серверные версии (ETag/`If-Match`) или last-write-wins осознанно.

**8. Персистентность и офлайн.** `persistQueryClient` + `networkMode: 'offlineFirst'`, паузы мутаций до восстановления сети, `buster`-версия кэша при смене схемы, не хранить персональные данные в localStorage без нужды.

### Критерии выбора для нового проекта (lead)

1. **Инвентаризация состояния** (таблица выше): сколько реально клиентского глобального стейта? Часто ответ — «тема, корзина и черновики».
2. **Рендеринг**: Next.js App Router/RSC — данные на сервере, клиентский стор минимальный и создаётся на запрос; SPA — query-библиотека обязательна.
3. **Протокол**: GraphQL с графом сущностей → Apollo/Relay/urql; REST → TanStack Query (или RTK Query, если уже Redux).
4. **Домен**: сложные сценарии с запрещёнными переходами → XState; богатая объектная модель → MobX; много событий и интеграций, нужна изоляция логики от UI → effector или RTK + listeners; много гранулярных независимых значений → Jotai.
5. **Команда**: найм и онбординг (Redux/Zustand/Query знают все), сила соглашений, ревью-культура, наличие тех, кто поддержит экзотику.
6. **Нефункциональные требования**: SSR-изоляция, размер бандла, DevTools, тестируемость логики без рендера.
7. **Миграция**: стратегия strangler — сначала вынести серверное состояние из Redux в Query (самый большой выигрыш), новые фичи — на новом стеке, старые слайсы удалять по мере касания. Решение фиксировать в ADR с критериями пересмотра.

💡 На собеседовании: дефолт «TanStack Query + URL + локальный state + Zustand для остатка» — и обязательно назвать, при каких условиях вы от него отступите (RTK для большого событийного домена, XState для сложных процессов, Apollo для GraphQL).

## Вопросы с собеседований

<details><summary>Почему вопрос «Redux или Zustand?» часто неправильный?</summary>

Потому что большая часть «глобального стейта» — кэш серверных данных, URL и формы. После их выноса в специализированные инструменты остаётся мало клиентского состояния, и выбор стора перестаёт быть архитектурным решением. Правильный порядок: классифицировать состояние по владельцу и времени жизни, затем выбирать инструмент под каждый тип.
</details>

<details><summary>Чем отличаются модели single store, atomic и proxy с точки зрения ререндеров?</summary>

Single store: после любого изменения каждый подписчик пересчитывает селектор и сравнивает результат — O(подписчиков) на изменение, нужна стабильность ссылок. Atomic: граф зависимостей, обновляются только затронутые атомы и их потребители. Proxy/observable: зависимости собираются автоматически при чтении в рендере — точечно, но неявно. Все три в React подключаются через `useSyncExternalStore`.
</details>

<details><summary>Что такое tearing и как его избегают внешние сторы?</summary>

При concurrent-рендере React может прерывать рендер; если внешний стор изменится между рендерами двух компонентов, они покажут разные версии данных. `useSyncExternalStore` проверяет снапшот и при расхождении перерисовывает синхронно. Цена — обновления внешних сторов нельзя «смягчить» transitions так же, как локальный state.
</details>

<details><summary>Когда XState оправдан, а когда избыточен?</summary>

Оправдан для процессов с явными состояниями и запретами переходов (checkout, визард, загрузка с паузой/ретраем, авторизация с MFA), когда «булев суп» уже порождает баги, а диаграмма служит документацией. Избыточен для CRUD и кэша данных — там query-библиотека. Минусы: кривая обучения, объём конфигурации.
</details>

<details><summary>В чём сильная сторона effector по сравнению с Zustand?</summary>

Явная событийная модель: логика описывается связями `sample` вне компонентов и не зависит от UI-фреймворка. Scopes: `fork` даёт изолированную копию всех сторов — естественный SSR «стор на запрос» и изолированные тесты, `allSettled` ждёт эффекты, `serialize` переносит состояние на клиент. Цена — новая ментальная модель, нужен плагин для `sid`, меньше разработчиков на рынке.
</details>

<details><summary>staleTime vs gcTime — как подбирать?</summary>

`staleTime` определяет, когда данные считаются устаревшими и могут быть фоново перезапрошены; `gcTime` — когда неиспользуемая запись удаляется из памяти. Подбирают по природе данных: справочники — бесконечная свежесть и ручная инвалидация, ленты — десятки секунд, финансовые — 0. `gcTime` меньше `staleTime` смысла почти не имеет: запись удалится раньше, чем устареет.
</details>

<details><summary>Инвалидация по ключам vs по тегам?</summary>

Ключи (TanStack, Pinia Colada): мутация явно указывает префикс — прозрачно, но мутация знает о структуре ключей. Теги (RTK Query): запросы объявляют, что они предоставляют, мутации — что инвалидируют; связь через словарь тегов, удобно при многих запросах одной сущности; паттерн `LIST` для списков. Оба — грубая гранулярность: инвалидировать чуть больше нормально, ошибиться в меньшую сторону — баг.
</details>

<details><summary>Как сделать оптимистичное обновление корректно при параллельных мутациях?</summary>

Отменять текущие запросы по ключу, делать точечный откат (инверсный патч), а не восстановление полного снапшота; перед откатом проверять, что в кэше ещё наше значение; ревалидировать после последней мутации; при сложных случаях — очередь мутаций по сущности или серверные версии. И честно отказаться от оптимизма для необратимых операций.
</details>

<details><summary>Нормализованный кэш vs документный — trade-offs?</summary>

Нормализованный (Apollo/Relay): сущность хранится один раз, обновления распространяются автоматически, но нужны стабильные id, политики merge и пагинации, отладка сложнее. Документный (TanStack Query/SWR/RTK Query): проще, предсказуемее, но синхронизация копий через инвалидацию или ручной `setQueryData` в нескольких местах.
</details>

<details><summary>Как синхронизировать кэш между вкладками?</summary>

Минимум — рефетч на фокус окна. Лучше — `BroadcastChannel` с событиями инвалидации (не данными: меньше трафика и проблем сериализации), экспериментальный `broadcastQueryClient` в TanStack Query. Для persist-сторов — событие `storage`. Конфликты записей — версии на сервере.
</details>

<details><summary>Почему MobX/Valtio критикуют в контексте React Compiler и concurrent-фич?</summary>

Compiler мемоизирует по ссылочной идентичности и предполагает, что значения не мутируют; мутабельный объект с той же ссылкой может пропустить обновление в мемоизированной части. Обёртки (`observer`, `useSnapshot`) решают это своими механизмами подписки, но модель остаётся двойственной. Плюс трекинг неявен — сложнее понять, почему компонент перерисовался.
</details>

<details><summary>Как бы вы мигрировали legacy Redux с ручными thunk-запросами?</summary>

Инвентаризация слайсов по типам состояния; серверные данные — на RTK Query (если остаёмся в Redux) или TanStack Query, по одному эндпоинту, удаляя слайс, thunk и селекторы; URL-состояние — в роутер; оставшийся клиентский стейт — остаётся в RTK или переезжает в Zustand при касании. Метрики: объём кода, число багов синхронизации, время онбординга. Фиксировать в ADR.
</details>

## Практика

**1. Аудит дашборда.** Есть: список заказов с пагинацией и фильтрами, live-курс валют по WebSocket, черновик комментария, шаг онбординг-тура, выбранная тема, права пользователя. Распределите по инструментам.

<details><summary>Решение</summary>

Заказы — TanStack Query, ключ `['orders', 'list', { status, page }]`, фильтры и страница — в URL, `placeholderData: keepPreviousData` при пагинации. Курс по WebSocket — либо `setQueryData` в query-кэш из обработчика сокета (если есть начальный REST), либо Zustand vanilla-стор с transient-подпиской. Черновик — форма + localStorage с debounce. Онбординг-тур — XState или `useReducer` с union-состояниями (+ флаг «пройден» на сервере). Тема — Context/CSS-переменные + localStorage. Права — query с большим `staleTime`, инвалидация при логине/смене роли.
</details>

**2. Спроектируйте кэш** для каталога: список товаров, карточка товара, корзина на сервере, отзывы. Какие ключи, staleTime, что инвалидирует «добавить в корзину» и «оставить отзыв»?

<details><summary>Решение</summary>

Ключи: `['products','list',filters]`, `['products','detail',id]`, `['cart']`, `['reviews', productId, { page }]`. staleTime: список — 60 с, карточка — 5 мин (цены/остатки — отдельный короткоживущий запрос `['stock', id]`), корзина — 0 + оптимистичные мутации, отзывы — 60 с. «В корзину»: оптимистично `setQueryData(['cart'])`, `onSettled` → инвалидировать `['cart']` и `['stock', id]`. «Отзыв»: инвалидировать `['reviews', productId]` и деталь товара (рейтинг). Префетч карточки на hover из списка (`initialData` из списочного кэша + `initialDataUpdatedAt`).
</details>

**3. Найдите баг.** Пользователь быстро кликает «лайк» на трёх постах; при падении второго запроса лайки первого и третьего пропадают до рефетча.

<details><summary>Решение</summary>

`onMutate` сохраняет снапшот всего списка, а `onError` восстанавливает его целиком — затирая успешные оптимистичные изменения других мутаций. Исправление: точечный откат (инвертировать `liked` только у поста из `variables`), не вызывать `invalidateQueries` пока есть другие активные мутации (`isMutating({ mutationKey: ['like'] }) === 1`), отменять запросы списка в `onMutate`.
</details>

**4. Защитите выбор.** Новый B2B-продукт: Next.js App Router, REST, 12 фронтендеров в 3 командах, сложный мастер оформления заявки с ветвлениями. Предложите стек и критерии пересмотра.

<details><summary>Решение</summary>

Данные — RSC/Server Actions для первичной загрузки, TanStack Query на клиенте для интерактивных списков (гидратация через `HydrationBoundary`). Мастер — XState (диаграмма как спецификация с аналитиками, тесты переходов без UI). Остаток клиентского стейта — Zustand vanilla-стор, создаваемый на запрос через контекст. Соглашения: фабрики ключей по доменам, запрет серверных данных в Zustand (lint-правило/ревью). Пересмотр: если клиентский стор разрастается и появляется сквозная событийная логика — RTK + listeners или effector; если GraphQL — Apollo/Relay.
</details>

## Источники
- https://react.dev/reference/react/useSyncExternalStore
- https://redux.js.org/toolkit/rtk-query/usage/manual-cache-updates
- https://redux.js.org/toolkit/rtk-query/usage/automated-refetching
- https://redux-toolkit.js.org/api/createEntityAdapter
- https://zustand.docs.pmnd.rs/
- https://github.com/pmndrs/zustand
- https://jotai.org/docs/utilities/family
- https://jotai.org/docs/extensions/query
- https://mobx.js.org/actions.html
- https://github.com/pmndrs/valtio
- https://stately.ai/docs/xstate
- https://stately.ai/docs/xstate-react
- https://effector.dev/en/introduction/core-concepts/
- https://effector.dev/en/guides/server-side-rendering/
- https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
- https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- https://tanstack.com/query/latest/docs/framework/react/plugins/broadcastQueryClient
- https://swr.vercel.app/docs/mutation
- https://www.apollographql.com/docs/react/caching/overview
- https://tkdodo.eu/blog/effective-react-query-keys
- https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query
