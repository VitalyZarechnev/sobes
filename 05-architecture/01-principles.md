# Принципы: SOLID, DRY/KISS/YAGNI, coupling/cohesion, DI

> ⏱ ~3 ч · 🎯 Применять SOLID к компонентам/хукам/модулям, а не к «классам из учебника»; аргументировать решения через coupling/cohesion; уметь внедрить зависимость в React-приложение без DI-фреймворка.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу привести пример каждого принципа SOLID на React-компоненте или хуке
- [ ] Понимаю разницу между DIP (принцип), DI (техника) и IoC-контейнером (инструмент)
- [ ] Могу объяснить, когда DRY вреден (wrong abstraction)
- [ ] Различаю coupling и cohesion, знаю виды связности

## Теория

### SOLID — это про управление изменениями

Мартин в «Чистой архитектуре» переформулирует SOLID не как «правила для классов», а как принципы организации **модулей** (module — исходный файл/набор функций и данных). Цель — чтобы изменение требования затрагивало минимум кода. На фронте «модуль» — это компонент, хук, файл со store, слайс FSD.

#### S — Single Responsibility Principle

Каноническая формулировка из книги: *модуль должен отвечать перед одним и только одним актором* (a module should be responsible to one, and only one, actor). Не «делает одну вещь», а «имеет одну причину для изменения» — причина = группа стейкхолдеров.

```tsx
// ❌ Компонент отвечает перед тремя акторами: дизайнер (вёрстка),
// бэкенд (формат API), продукт (правила скидок)
function ProductCard({ id }: { id: string }) {
  const [p, setP] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/v2/products/${id}`).then(r => r.json()).then(setP);
  }, [id]);
  if (!p) return null;
  const price = p.isVip ? p.price_cents * 0.9 / 100 : p.price_cents / 100;
  return <div className="card">{p.title} — {price} ₽</div>;
}

// ✅ Разделяем по акторам
// api: знает формат бэкенда и маппит в доменную модель
async function fetchProduct(id: string): Promise<Product> {
  const dto = await http.get<ProductDto>(`/api/v2/products/${id}`);
  return { id: dto.id, title: dto.title, price: dto.price_cents / 100, isVip: dto.isVip };
}
// model: бизнес-правило — отдельная чистая функция, тестируется без React
const finalPrice = (p: Product) => (p.isVip ? p.price * 0.9 : p.price);
// ui: только отображение
function ProductCard({ product }: { product: Product }) {
  return <div className="card">{product.title} — {finalPrice(product)} ₽</div>;
}
```

🪤 Ловушка: SRP не означает «по функции на файл». Дробление до атомов убивает cohesion — связанные вещи разлетаются по десятку файлов.

#### O — Open/Closed Principle

Модуль открыт для расширения, закрыт для модификации. На фронте — через композицию, слоты, render props, конфигурацию, реестры стратегий.

```tsx
// ❌ Каждый новый тип уведомления — правка switch
function Notice({ type, text }: { type: 'info' | 'error'; text: string }) {
  switch (type) { case 'info': return <Blue>{text}</Blue>; case 'error': return <Red>{text}</Red>; }
}

// ✅ Расширение через реестр — новый тип добавляется без правки Notice
type NoticeRenderer = (text: string) => React.ReactNode;
const registry = new Map<string, NoticeRenderer>([
  ['info', t => <Blue>{t}</Blue>],
  ['error', t => <Red>{t}</Red>],
]);
export const registerNotice = (type: string, r: NoticeRenderer) => registry.set(type, r);
function Notice({ type, text }: { type: string; text: string }) {
  return registry.get(type)?.(text) ?? text;
}
```

Самая частая форма OCP во фронте — **composition через children/slots**: `<Card header={...} footer={...}>` вместо пропсов `showHeader`, `headerVariant`, `footerButtons`.

#### L — Liskov Substitution Principle

Подтип должен быть заменяем на базовый тип без нарушения ожиданий. На фронте:
- Компонент-обёртка над `<button>` должен принимать и прокидывать `ButtonHTMLAttributes` (`onClick`, `disabled`, `type`, `aria-*`, `ref`). Если `MyButton` молча игнорирует `disabled` — нарушение LSP: клиентский код, ожидающий «кнопку», ломается.
- Реализации интерфейса репозитория (`HttpCartRepo`, `LocalStorageCartRepo`) должны одинаково вести себя на граничных случаях (пустая корзина → `[]`, а не `null` в одной и `[]` в другой).

```tsx
type ButtonProps = React.ComponentPropsWithRef<'button'> & { variant?: 'primary' | 'ghost' };
// React 19: ref — обычный проп, forwardRef не нужен
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={cx('btn', `btn--${variant}`, className)} {...rest} />;
}
```

#### I — Interface Segregation Principle

Не заставляйте клиента зависеть от того, что он не использует. Во фронте это «не передавайте в компонент весь объект, если нужны два поля» и «не делайте god-store».

```tsx
// ❌ Аватару передали всего User (30 полей) — он перерендерится и сломается
// при любом изменении User, его сложно переиспользовать для Author/Company
function Avatar({ user }: { user: User }) { /* user.avatarUrl, user.name */ }

// ✅ Узкий интерфейс
function Avatar({ src, alt }: { src: string; alt: string }) { /* ... */ }
```

То же для хуков: `useCart()` возвращающий 25 полей → разбить на `useCartItems()`, `useCartTotal()`, `useCartActions()` (заодно меньше лишних ререндеров при селекторах).

#### D — Dependency Inversion Principle

1. Модули верхнего уровня (политики, бизнес-правила) не должны зависеть от модулей нижнего уровня (детали: HTTP, localStorage, конкретный SDK). Оба зависят от абстракций.
2. Абстракции не зависят от деталей; детали зависят от абстракций.

Ключевое — **направление зависимости в исходном коде противоположно направлению потока управления**: use case вызывает репозиторий, но импорт идёт от реализации репозитория к интерфейсу, объявленному рядом с use case.

```ts
// domain/application слой объявляет, что ему нужно (порт)
export interface AnalyticsPort {
  track(event: string, props?: Record<string, unknown>): void;
}

// Бизнес-логика зависит только от порта
export function createCheckout(deps: { analytics: AnalyticsPort; orders: OrdersRepo }) {
  return async (cart: Cart) => {
    const order = await deps.orders.create(cart);
    deps.analytics.track('checkout_completed', { total: order.total });
    return order;
  };
}

// infrastructure: деталь реализует порт и импортирует его
import type { AnalyticsPort } from '@/application/ports';
export const amplitudeAdapter: AnalyticsPort = {
  track: (e, p) => amplitude.track(e, p),
};
```

### DIP vs DI vs IoC-контейнер

| Понятие | Что это | Пример на фронте |
|---|---|---|
| **DIP** | Принцип проектирования: зависеть от абстракций | Use case принимает `OrdersRepo`, а не `axios` |
| **DI** (Dependency Injection) | Техника: зависимости передаются извне, а не создаются внутри | Аргументы функции-фабрики, пропсы, React Context, `provide/inject` |
| **IoC** (Inversion of Control) | Общий принцип «фреймворк вызывает ваш код» | React вызывает компоненты, роутер — loaders |
| **IoC-контейнер** | Инструмент автоматического связывания | InversifyJS, tsyringe, Angular DI |

💡 На собеседовании: «Во фронте DI-контейнер почти никогда не нужен. Composition root — это `main.tsx`/`app`-слой, где я собираю адаптеры и кладу их в Context. Тесты подменяют провайдер. Angular — исключение: там DI встроен и идиоматичен».

### DI во фронте без фреймворков

```tsx
// shared/lib/di.tsx — минимальный типобезопасный контейнер на Context
import { createContext, use, type ReactNode } from 'react';

export interface Services {
  orders: OrdersRepo;
  analytics: AnalyticsPort;
}
const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ value, children }: { value: Services; children: ReactNode }) {
  return <ServicesContext value={value}>{children}</ServicesContext>; // React 19 синтаксис
}
export function useServices(): Services {
  const s = use(ServicesContext);
  if (!s) throw new Error('ServicesProvider is missing');
  return s;
}

// app/main.tsx — composition root
const services: Services = {
  orders: new HttpOrdersRepo(httpClient),
  analytics: import.meta.env.PROD ? amplitudeAdapter : consoleAnalytics,
};
root.render(<ServicesProvider value={services}><App /></ServicesProvider>);

// test
render(<ServicesProvider value={{ orders: fakeOrders, analytics: noopAnalytics }}><Checkout /></ServicesProvider>);
```

Другие способы DI: параметры функций/фабрик (самый простой и тестируемый), модульные синглтоны + `vi.mock` (просто, но это «DI через сборщик» — неявно), Vue `provide/inject` с `InjectionKey<T>`, Angular `inject()`.

🪤 Ловушка: Context с часто меняющимся значением вызывает ререндер всех потребителей. Сервисы — стабильные объекты, создавайте их один раз вне компонента (или в `useState(() => ...)`), не в теле рендера.

### DRY, KISS, YAGNI — и когда они конфликтуют

- **DRY** (Don't Repeat Yourself, Hunt & Thomas): каждое *знание* должно иметь единственное представление. Речь о знании, а не о символах. Два одинаковых `if (age >= 18)` в разных доменах (возраст для алкоголя и для голосования) — **не** дублирование знания: правила изменятся независимо.
- **WET / Rule of three**: обобщайте на третьем повторе. Sandi Metz: *«duplication is far cheaper than the wrong abstraction»*.
- **KISS**: простейшее решение, которое работает. На фронте нарушается «универсальными» компонентами с 40 пропсами.
- **YAGNI**: не делайте то, что «может понадобиться». Нарушается слоями абстракции «на случай смены фреймворка/бэкенда».

Конфликт: DRY толкает к абстракциям, YAGNI/KISS — от них. Арбитр — **частота и согласованность изменений**: если два куска кода меняются вместе — объединяйте; если по разным причинам — оставьте копии.

```tsx
// Пример «wrong abstraction»: общий компонент разросся флагами
<DataTable
  isAdminMode showExport={!isMobile} legacyPagination
  rowRenderer={isOrders ? OrderRow : undefined} hideHeaderOnEmpty
/>
// Лечение: «инлайнить обратно» в места использования, потом выделить
// заново по-настоящему общее (headless useTable + отдельные таблицы).
```

### Coupling и cohesion

- **Coupling** (зацепление, сопряжённость) — насколько модули зависят друг от друга. Хотим **низкий**.
- **Cohesion** (связность) — насколько элементы внутри модуля относятся к одной задаче. Хотим **высокую**.

Виды cohesion от худшей к лучшей (классификация Constantine/Yourdon): coincidental → logical → temporal → procedural → communicational → sequential → **functional**. Папка `utils/` с `formatDate`, `debounce`, `calcDiscount` — coincidental cohesion; FSD-слайс `entities/cart` — functional.

Виды coupling от худшего к лучшему: content (лезем во внутренности модуля) → common (общее глобальное состояние) → control (передаём флаг, управляющий поведением) → stamp (передаём всю структуру, нужна часть) → **data** (передаём только нужные данные) → message.

| Симптом на фронте | Вид | Лечение |
|---|---|---|
| `import { _internalState } from '../cart/store/slice'` | content | public API (`index.ts`) |
| Всё в одном глобальном store, все читают всё | common | разбить по доменам, селекторы |
| `<List mode="compact" />` переключает 5 веток логики | control | разные компоненты / композиция |
| `<Avatar user={user} />` | stamp | узкие пропсы (ISP) |

### Компонентные принципы Мартина (кратко)

Из той же книги — принципы для «компонентов» (пакетов/модулей сборки), актуальны для монорепо и слайсов FSD:
- **REP** (Reuse/Release Equivalence) — единица переиспользования = единица релиза.
- **CCP** (Common Closure) — собирайте вместе то, что меняется по одной причине (SRP для пакетов). Это аргумент за FSD-слайсы против папок по типам (`components/`, `hooks/`, `services/`).
- **CRP** (Common Reuse) — не заставляйте зависеть от того, что не нужно (ISP для пакетов).
- **ADP** — граф зависимостей без циклов.
- **SDP** (Stable Dependencies) — зависьте в сторону стабильности. `shared` стабилен (много входящих зависимостей), `pages` нестабилен.
- **SAP** (Stable Abstractions) — стабильный компонент должен быть абстрактным.

💡 На собеседовании: FSD — это практическое воплощение CCP + ADP + SDP: слои дают ацикличность и направление к стабильности, слайсы — общую замкнутость.

## Вопросы с собеседований

<details><summary>Как вы понимаете SRP? Приведите пример на фронте.</summary>

Не «делает одно», а «отвечает перед одним актором» — одна причина для изменения. Пример: компонент, который фетчит, маппит DTO, считает скидку и рисует, меняется по просьбе бэкенда, продукта и дизайнера. Разносим: api-маппер, чистая доменная функция, презентационный компонент. Для senior: SRP — это про то, чтобы изменения от разных стейкхолдеров не конфликтовали в одном файле (merge-конфликты, регрессии).
</details>

<details><summary>Как применить OCP к React-компонентам?</summary>

Композиция вместо флагов: children, слоты (`header`, `footer`), render props, compound components (`<Tabs><Tabs.List/>...`), реестры стратегий. Headless-компоненты (Radix, React Aria, TanStack Table) — OCP в чистом виде: логика закрыта, представление открыто. Trade-off: излишняя гибкость усложняет API и типизацию.
</details>

<details><summary>Пример нарушения LSP во фронте.</summary>

Обёртка `Input`, которая не прокидывает `ref`, `onBlur` или `aria-*` — ломает form-библиотеки (react-hook-form регистрирует через ref). Или две реализации стораджа с разной семантикой ошибок: одна бросает, другая возвращает `null`. Решение — типизировать от нативных пропсов (`ComponentPropsWithRef<'input'>`) и контрактные тесты для всех реализаций интерфейса.
</details>

<details><summary>Чем DIP отличается от DI?</summary>

DIP — принцип про направление зависимостей в исходном коде: политика не импортирует детали, обе зависят от абстракции, принадлежащей политике. DI — техника передачи зависимостей снаружи. Можно делать DI без DIP (инжектить конкретный `AxiosInstance`) и соблюдать DIP без контейнера (параметры функции). IoC-контейнер — опциональный инструмент автоматизации DI.
</details>

<details><summary>Как сделать DI в React-приложении? А во Vue?</summary>

React: composition root в точке входа + Context с сервисами + хук-аксессор, бросающий ошибку без провайдера; либо фабрики/параметры для не-React кода. Vue: `provide(key, value)` в `app` или корневом компоненте, `inject<T>(key)` с `InjectionKey<T>` для типов. В тестах — подмена провайдера. Контейнеры (Inversify) оправданы редко: большие приложения с плагинами, сложными lifecycle-скоупами.
</details>

<details><summary>Когда DRY вреден?</summary>

Когда объединяют «случайно похожий» код с разными причинами изменения — появляется wrong abstraction, обрастающая флагами. Правило трёх, «duplication is cheaper than the wrong abstraction». DRY — про знание (бизнес-правило, формат API, константа), не про текст.
</details>

<details><summary>Что такое coupling и cohesion, как их измерить в проекте?</summary>

Coupling — зависимость между модулями, cohesion — тематическая цельность внутри. Измерение: граф импортов (dependency-cruiser, madge), fan-in/fan-out, циклы, «сколько файлов затрагивает типичный PR», change coupling по git (файлы, которые часто меняются вместе, но лежат далеко). Высокий change coupling между далёкими папками — сигнал неправильных границ.
</details>

<details><summary>Как SOLID соотносится с функциональным стилем и хуками?</summary>

Принципы не про классы. SRP — функции/хуки с одной причиной изменения; OCP — функции высшего порядка и композиция; LSP — совместимость сигнатур; ISP — узкие параметры; DIP — передача функций как зависимостей (функция и есть минимальный интерфейс). Хук `useX(deps)` или замыкание-фабрика — функциональный аналог конструктора с DI.
</details>

<details><summary>Что такое ADP и как ловить циклы?</summary>

Acyclic Dependencies Principle: граф зависимостей модулей — DAG. Циклы ломают tree-shaking, порядок инициализации (TDZ-ошибки `Cannot access X before initialization`), делают невозможной независимую сборку. Ловим: `eslint-plugin-import` (`import/no-cycle`), dependency-cruiser, madge `--circular`. Разрыв цикла — через DIP (вынести интерфейс) или вынос общего кода вниз.
</details>

<details><summary>Почему SDP/SAP важны для дизайн-системы?</summary>

Дизайн-система — самый стабильный компонент: от неё зависят все. Значит, её API должен быть абстрактным и меняться редко (semver, codemods, deprecation-период). Если в UI-kit протекает бизнес-логика конкретного продукта — нарушается SAP: стабильный пакет становится конкретным и любой продуктовый запрос ломает всех.
</details>

## Практика

**Задача 1.** Найдите нарушения SOLID и перепишите.
```tsx
function UserList({ admin }: { admin: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { axios.get('/api/users').then(r => setUsers(r.data)); }, []);
  return users.map(u => (
    <div key={u.id}>
      <img src={u.avatar} /> {u.name}
      {admin && <button onClick={() => axios.delete(`/api/users/${u.id}`)}>Удалить</button>}
    </div>
  ));
}
```
<details><summary>Решение</summary>

SRP — фетч + удаление + отображение; DIP — прямой `axios`; OCP/control coupling — флаг `admin` переключает поведение; ISP — `img` берёт поля из `User`, а сам `<img>` без `alt`.

```tsx
// api
export const usersApi = (http: HttpClient) => ({
  list: () => http.get<User[]>('/api/users'),
  remove: (id: string) => http.delete(`/api/users/${id}`),
});
// model (TanStack Query)
export const useUsers = () => {
  const { users } = useServices();
  return useQuery({ queryKey: ['users'], queryFn: users.list });
};
// ui
function UserRow({ user, actions }: { user: User; actions?: React.ReactNode }) {
  return <div><Avatar src={user.avatar} alt={user.name} /> {user.name} {actions}</div>;
}
function UserList({ renderActions }: { renderActions?: (u: User) => React.ReactNode }) {
  const { data = [] } = useUsers();
  return data.map(u => <UserRow key={u.id} user={u} actions={renderActions?.(u)} />);
}
// на странице админки: <UserList renderActions={u => <DeleteUserButton id={u.id} />} />
```
</details>

**Задача 2.** Сделайте модуль `checkout` тестируемым без `vi.mock`: сейчас он импортирует `fetch`, `localStorage` и `Date.now()`.
<details><summary>Решение</summary>

Выделить порты `OrdersApi`, `Storage`, `Clock` и принимать их параметром фабрики `createCheckout({ api, storage, clock })`. В проде — composition root собирает реальные адаптеры, в тесте — fakes (`{ now: () => 1700000000000 }`). Плюс: тест детерминирован и не зависит от сборщика.
</details>

**Задача 3.** Спроектируйте API компонента `Modal`, соблюдая OCP и ISP.
<details><summary>Решение</summary>

Compound components: `<Modal open onOpenChange>` + `<Modal.Title>`, `<Modal.Body>`, `<Modal.Footer>`; поведение (focus trap, Esc, scroll lock, `aria-modal`) внутри, представление — через children. Нет пропсов `showFooter`, `footerButtons`, `titleSize`. Нативные атрибуты прокидываются на корневой `<dialog>`/div.
</details>

## Источники
- R. Martin, «Чистая архитектура» (Clean Architecture: A Craftsman's Guide to Software Structure and Design, 2017) — части III (SOLID) и IV (компонентные принципы)
- https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html
- https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction
- https://martinfowler.com/articles/injection.html
- https://react.dev/learn/passing-data-deeply-with-context
- https://vuejs.org/guide/components/provide-inject.html
- https://github.com/sverweij/dependency-cruiser
