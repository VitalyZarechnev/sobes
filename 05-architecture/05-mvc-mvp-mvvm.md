# MVC, MVP, MVVM и Flux

> ⏱ ~2.5 ч · 🎯 Чётко различать MVC/MVP/MVVM по направлению зависимостей и способу синхронизации View; показать, как они проявляются в React, Vue, Angular; объяснить, что Flux/Redux решали.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю разницу Passive View и Supervising Controller
- [ ] Могу объяснить, почему кастомный хук — это ViewModel
- [ ] Понимаю, какую проблему MVC решал Flux (однонаправленный поток)

## Теория

Все три паттерна решают одну задачу — **Separated Presentation** (Fowler): отделить доменную логику и данные от представления. Различаются тем, **кто обрабатывает ввод** и **как View узнаёт об изменениях**.

### MVC

Классический MVC (Smalltalk-80, Trygve Reenskaug):
- **Model** — данные и бизнес-логика; уведомляет подписчиков (Observer).
- **View** — отображает модель, подписана на неё напрямую.
- **Controller** — принимает ввод пользователя, вызывает модель.

```
 User ─input─▶ Controller ──▶ Model ──notify──▶ View
                                ▲                 │
                                └──── reads ──────┘
```

Fowler отмечает, что «MVC» — самый неправильно цитируемый паттерн: серверный «MVC» (Rails, Spring MVC) — это скорее Model 2 / front controller, где контроллер выбирает view и передаёт данные, а View не подписан на модель. Во фронте классический MVC — Backbone.js.

Проблема на клиенте: при многих моделях и view двусторонние связи создают каскады обновлений, трудно отследить, кто что изменил (это мотивация Flux).

### MVP

**Presenter** заменяет контроллер и забирает логику представления. View — максимально тупая, общается с Presenter через **интерфейс** (это делает Presenter тестируемым без UI).

Два варианта (Fowler):
- **Passive View** — View не знает о модели вообще, Presenter вручную кладёт каждое значение во View (`view.setTitle(...)`). Максимум тестируемости, много кода.
- **Supervising Controller** — простую синхронизацию View делает сама через data binding к модели, Presenter берёт сложную логику.

```
 User ─▶ View ⇄ (interface) ⇄ Presenter ──▶ Model
```

### MVVM

Предложен Джоном Госсманом (Microsoft, WPF, 2005), вырос из Presentation Model Фаулера.
- **ViewModel** — модель представления: состояние, нужное View (уже отформатированное), и команды. **Не знает о View.**
- **View** — декларативно привязана к ViewModel через **data binding** (часто двусторонний).
- **Binder** (фреймворк) синхронизирует их автоматически.

```
 View ⇄ (data binding) ⇄ ViewModel ──▶ Model
```

Ключевое отличие от MVP: Presenter **держит ссылку на View** и командует ею; ViewModel **не знает о View**, View сама подписывается через binding.

### Сравнение

| | MVC | MVP | MVVM |
|---|---|---|---|
| Кто обрабатывает ввод | Controller | View → Presenter | View → команды ViewModel |
| Знает ли посредник о View | Controller выбирает/знает View | Да, через интерфейс | Нет |
| Как View обновляется | Подписка на Model | Presenter вызывает методы View | Data binding |
| Связь View–Model | View читает Model | Нет (Passive) / binding (Supervising) | Нет, только через VM |
| Тестируемость логики UI | Средняя | Высокая (мок интерфейса View) | Высокая (VM — чистый объект) |
| Цена | Каскады обновлений | Boilerplate интерфейсов | «Магия» биндинга, отладка |
| Примеры | Backbone, Rails (серверный вариант) | Android (до Jetpack), GWT | WPF, Knockout, Vue, Angular |

### Как это проявляется во фреймворках

**React** — формально «V», но с хуками естественно получается MVVM-подобная схема:
- Компонент = View (декларативный, «биндинг» — рендер от состояния).
- Кастомный хук = ViewModel: держит состояние представления, вычисляет производные, отдаёт команды; не знает о JSX.
- Model = серверный стейт (TanStack Query), стор, доменные функции.
- Однонаправленный поток: «двусторонний биндинг» эмулируется `value` + `onChange` (controlled components).

**Vue** — MVVM по природе (Эван Ю прямо ссылался на MVVM в ранней документации): шаблон — View, реактивный объект/`setup` — ViewModel, `v-model` — двусторонний биндинг, система реактивности — binder. Composables — переиспользуемые ViewModel.

**Angular** — компонент-класс + шаблон с биндингами (`[prop]`, `(event)`, `[(ngModel)]`) — MVVM; сервисы с DI — Model. Signals (`signal`, `computed`) делают VM явной реактивной моделью.

### Один компонент в трёх паттернах

Задача: счётчик лайков с отправкой на сервер и форматированием («1.2K»).

```ts
// Model — общая для всех трёх
export interface LikesModel {
  get(): number;
  like(): Promise<void>;
  subscribe(fn: () => void): () => void;
}
export const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));
```

**MVC (vanilla, View подписана на Model, Controller обрабатывает ввод):**

```ts
class LikesView {
  constructor(private root: HTMLElement, private model: LikesModel) {
    model.subscribe(() => this.render()); // View наблюдает Model
    this.render();
  }
  render() { this.root.querySelector('span')!.textContent = formatCount(this.model.get()); }
}
class LikesController {
  constructor(root: HTMLElement, private model: LikesModel) {
    root.querySelector('button')!.addEventListener('click', () => this.model.like());
  }
}
```

**MVP (Passive View: Presenter командует View через интерфейс):**

```ts
interface LikesViewContract {
  setCount(text: string): void;
  setBusy(busy: boolean): void;
  onLikeClick(handler: () => void): void;
}
class LikesPresenter {
  constructor(private view: LikesViewContract, private model: LikesModel) {
    view.onLikeClick(() => this.like());
    this.sync();
  }
  private sync() { this.view.setCount(formatCount(this.model.get())); }
  private async like() {
    this.view.setBusy(true);
    try { await this.model.like(); this.sync(); } finally { this.view.setBusy(false); }
  }
}
// Тест: new LikesPresenter(fakeView, fakeModel) — без DOM
```

**MVVM (React: хук — ViewModel, компонент — View):**

```tsx
function useLikesViewModel(model: LikesModel) {
  const count = useSyncExternalStore(model.subscribe, model.get);
  const [busy, setBusy] = useState(false);
  const like = async () => {
    setBusy(true);
    try { await model.like(); } finally { setBusy(false); }
  };
  return { label: formatCount(count), busy, like }; // ничего не знает о JSX
}

function LikesButton({ model }: { model: LikesModel }) {
  const vm = useLikesViewModel(model);
  return <button disabled={vm.busy} onClick={vm.like}>♥ {vm.label}</button>;
}
```

Vue-версия того же MVVM:

```vue
<script setup lang="ts">
const props = defineProps<{ model: LikesModel }>();
const count = ref(props.model.get());
onScopeDispose(props.model.subscribe(() => (count.value = props.model.get())));
const busy = ref(false);
const label = computed(() => formatCount(count.value));
async function like() { busy.value = true; try { await props.model.like(); } finally { busy.value = false; } }
</script>
<template><button :disabled="busy" @click="like">♥ {{ label }}</button></template>
```

### Flux / Redux как альтернатива

Flux (Facebook, 2014) появился как ответ на проблемы двусторонних связей MVC в больших клиентских приложениях (известный пример — счётчик непрочитанных сообщений, рассинхронизирующийся с данными).

```
 Action ──▶ Dispatcher ──▶ Store ──▶ View ──(user)──▶ Action
```

Принципы: **однонаправленный поток данных**, состояние меняется только через action, store — единственный источник истины для своего домена. Redux упростил: один store, чистые редьюсеры `(state, action) => newState`, иммутабельность, middleware для эффектов, time-travel debugging.

Trade-offs Redux: предсказуемость, devtools, сериализуемые события — против boilerplate (смягчён Redux Toolkit) и соблазна класть в глобальный стор всё, включая серверный кэш (лучше TanStack Query/RTK Query) и локальное состояние форм.

Современная картина: разделение **серверного состояния** (TanStack Query, SWR, Apollo), **глобального клиентского** (Zustand, Redux Toolkit, Pinia, signals) и **локального** (useState/ref). Сигналы (Solid, Preact Signals, Vue refs, Angular signals) — по сути возвращение реактивного биндинга MVVM с точечными обновлениями, но с однонаправленным потоком на уровне компонентов.

💡 На собеседовании: «В React я мыслю MVVM: компонент — View, хук — ViewModel, а Model — это query-кэш и доменные функции. Это даёт тестируемую логику без рендера (`renderHook`) и тонкие компоненты».

## Вопросы с собеседований

<details><summary>Чем MVP отличается от MVVM?</summary>

Presenter знает View (через интерфейс) и императивно её обновляет; ViewModel не знает View, View подписывается на VM через data binding. MVP требует больше кода, но не требует инфраструктуры биндинга; MVVM — меньше кода, но «магия» реактивности усложняет отладку.
</details>

<details><summary>Passive View vs Supervising Controller?</summary>

Оба — варианты MVP по Фаулеру. Passive View: View вообще не знает модель, Presenter проставляет каждое значение — максимальная тестируемость. Supervising Controller: простые поля View биндит к модели сама, Presenter обрабатывает сложную логику — меньше кода, часть поведения в View.
</details>

<details><summary>Какой паттерн у React?</summary>

React сам — библиотека View с однонаправленным потоком. Архитектура приложения поверх него обычно MVVM-подобная (хуки как ViewModel) или Flux (Redux). Важно не «натягивать» классический MVC: в React нет контроллеров, обработка ввода — в обработчиках компонентов, делегирующих в хуки.
</details>

<details><summary>Почему Vue называют MVVM?</summary>

Реактивный стейт компонента — ViewModel, шаблон — View, двусторонний `v-model` и реактивность — binder, View автоматически синхронизируется при изменении VM. Это прямо описывалось в документации Vue 1/2. Composables — переиспользуемые VM.
</details>

<details><summary>Какую проблему решал Flux?</summary>

Каскадные и циклические обновления при двусторонних связях многих моделей и view в MVC: сложно понять, почему изменилось состояние. Flux вводит однонаправленный поток: action → dispatcher → store → view, изменения только через actions, что делает их явными и отслеживаемыми.
</details>

<details><summary>Двусторонний биндинг — хорошо или плохо?</summary>

Удобен для форм (меньше кода), но при широком применении теряется понимание источника изменения. Vue решает это: `v-model` — сахар над `prop` + `emit` (однонаправленный поток между компонентами), `defineModel` делает контракт явным. React сознательно отказался от двустороннего биндинга.
</details>

<details><summary>Как тестировать ViewModel в React?</summary>

`renderHook` из Testing Library: вызвать хук с фейковыми зависимостями, вызвать команды в `act`, проверить возвращаемое состояние. Если хук разросся — вынести чистые функции (форматирование, вычисления) и тестировать их без React.
</details>

<details><summary>Чем серверный MVC (Rails) отличается от клиентского?</summary>

На сервере контроллер обрабатывает запрос, получает модель и рендерит шаблон один раз — View не подписана на модель, нет долгоживущего состояния. Клиентский MVC имеет долгоживущие View, подписанные на Model через Observer, — отсюда проблемы синхронизации.
</details>

## Практика

**Задача 1.** Перепишите «толстый» компонент поиска пользователей в MVVM: компонент — только разметка.
<details><summary>Решение</summary>

```tsx
function useUserSearchVM(searchUsers: (q: string, signal: AbortSignal) => Promise<User[]>) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);
  const result = useQuery({
    queryKey: ['users', debounced],
    queryFn: ({ signal }) => searchUsers(debounced, signal),
    enabled: debounced.length >= 2,
  });
  return {
    query, setQuery,
    items: result.data ?? [],
    status: debounced.length < 2 ? 'idle' : result.isPending ? 'loading' : result.isError ? 'error' : 'ready',
  } as const;
}
function UserSearch() {
  const vm = useUserSearchVM(useServices().users.search);
  return (<>
    <input value={vm.query} onChange={e => vm.setQuery(e.target.value)} aria-label="Поиск" />
    {vm.status === 'loading' && <Spinner />}
    <ul>{vm.items.map(u => <li key={u.id}>{u.name}</li>)}</ul>
  </>);
}
```
</details>

**Задача 2.** Когда вы выберете MVP вместо MVVM?
<details><summary>Решение</summary>

Когда нет фреймворка с биндингом (vanilla/Web Components, legacy jQuery), когда нужна полная тестируемость логики View без DOM и рендера, или в платформах без реактивности. В современном React/Vue/Angular MVVM естественнее.
</details>

## Источники
- https://martinfowler.com/eaaDev/uiArchs.html
- https://martinfowler.com/eaaDev/PassiveScreen.html
- https://martinfowler.com/eaaDev/SupervisingPresenter.html
- https://martinfowler.com/eaaDev/PresentationModel.html
- https://facebookarchive.github.io/flux/docs/in-depth-overview
- https://redux.js.org/understanding/thinking-in-redux/three-principles
- https://react.dev/reference/react/useSyncExternalStore
