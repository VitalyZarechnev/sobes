# Чистая архитектура и порты/адаптеры на фронтенде

> ⏱ ~4 ч · 🎯 Объяснить правило зависимостей и hexagonal без «кругов на доске»; показать, как это выглядит в реальном React/Vue-коде; честно сказать, где это оверинжиниринг.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу нарисовать 4 круга и объяснить правило зависимостей
- [ ] Понимаю порты (driving/driven) и адаптеры
- [ ] Могу показать структуру domain/application/infrastructure/ui и где composition root
- [ ] Знаю аргументы критики и когда не применять

## Теория

### Исходная модель (Мартин, 2012)

Clean Architecture — обобщение нескольких идей: Hexagonal (Cockburn, 2005), Onion (Palermo, 2008), DCI, BCE. Общее: **бизнес-правила независимы от фреймворков, UI, БД и внешних сервисов**.

```
┌──────────────────────────────────────────────────────┐
│ Frameworks & Drivers: React, Vue, fetch, IndexedDB,  │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Interface Adapters: presenters, controllers,     │ │
│ │ repositories impl, DTO mappers                   │ │
│ │ ┌──────────────────────────────────────────────┐ │ │
│ │ │ Use Cases (Application Business Rules)       │ │ │
│ │ │ ┌──────────────────────────────────────────┐ │ │ │
│ │ │ │ Entities (Enterprise Business Rules)     │ │ │ │
│ │ │ └──────────────────────────────────────────┘ │ │ │
│ │ └──────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
         зависимости в исходном коде → только ВНУТРЬ
```

| Слой | Что содержит | Пример во фронте |
|---|---|---|
| **Entities** | Критичные бизнес-правила, общие для всех приложений компании | `Money`, `Cart.total()`, правила валидации ИНН, статусы заказа |
| **Use Cases** | Правила конкретного приложения, сценарии | `addToCart`, `applyPromoCode`, `checkout` |
| **Interface Adapters** | Конвертация данных между use cases и внешним миром | DTO↔domain мапперы, реализация репозиториев, presenters/ViewModel-хуки |
| **Frameworks & Drivers** | Детали | React, роутер, `fetch`, Sentry SDK, localStorage |

### Правило зависимостей (The Dependency Rule)

> Зависимости в исходном коде могут указывать только внутрь. Ничто во внутреннем круге не знает ничего о внешнем.

Следствия:
- Имена из внешнего слоя (типы DTO, `AxiosResponse`, `React.FC`, `Ref<T>`) не встречаются во внутреннем.
- Если use case должен *вызвать* что-то внешнее (сохранить заказ), он объявляет **интерфейс** (порт), а внешний слой его реализует — это DIP из [01-principles](01-principles.md).
- Через границу передаются простые структуры данных (не сущности ORM, не Response).

Кругов не обязательно четыре — важно только направление.

### Порты и адаптеры (Hexagonal Architecture)

Cockburn формулирует цель: приложение должно одинаково управляться пользователем, тестами, скриптами и работать в изоляции от реальных устройств и БД. Шестиугольник — просто картинка «много граней-портов».

- **Порт** — интерфейс на границе приложения, сформулированный в терминах приложения.
- **Адаптер** — реализация порта для конкретной технологии.
- **Driving (primary) порты** — через них внешний мир управляет приложением: use cases. Адаптеры: React-компоненты, CLI, тесты.
- **Driven (secondary) порты** — через них приложение управляет внешним миром: `OrdersRepository`, `PaymentGateway`, `Analytics`. Адаптеры: HTTP, IndexedDB, моки.

```
 [React UI] ──▶ (driving port: useCases) ──▶ [ APPLICATION ] ──▶ (driven port: OrdersRepo) ◀── [HttpOrdersRepo]
 [Vitest]   ──▶                                    core          ──▶ (driven port: Payments) ◀── [StripeAdapter]
```

💡 На собеседовании: «Hexagonal — про симметрию "вход/выход" и тестируемость, Clean — про концентрические слои и направление зависимостей. На практике это одна идея: ядро без импортов наружу, всё внешнее — через интерфейсы».

### Как это выглядит во фронтенд-приложении

```
src/
├── domain/                     # Entities: чистый TS, 0 зависимостей
│   ├── cart.ts                 # type Cart, addItem(), total()
│   ├── money.ts
│   └── order.ts
├── application/                # Use cases + порты
│   ├── ports.ts                # CartRepo, OrdersApi, Notifier, Clock
│   ├── add-to-cart.ts
│   └── checkout.ts
├── infrastructure/             # Driven-адаптеры
│   ├── http/client.ts
│   ├── http/orders-api.ts      # implements OrdersApi, DTO→domain
│   ├── storage/cart-repo.ts    # implements CartRepo (localStorage)
│   └── notifier/toast.ts
├── ui/                         # Driving-адаптеры (React)
│   ├── cart/CartPage.tsx
│   └── cart/useCartViewModel.ts
└── main.tsx                    # Composition root
```

#### Domain — чистые функции и иммутабельные данные

```ts
// domain/cart.ts
export type CartItem = Readonly<{ productId: string; price: number; qty: number }>;
export type Cart = Readonly<{ items: readonly CartItem[] }>;

export const emptyCart: Cart = { items: [] };

export function addItem(cart: Cart, item: CartItem): Cart {
  const existing = cart.items.find(i => i.productId === item.productId);
  const items = existing
    ? cart.items.map(i => (i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i))
    : [...cart.items, item];
  return { items };
}

export const total = (cart: Cart) => cart.items.reduce((s, i) => s + i.price * i.qty, 0);

export class CartLimitError extends Error {}
export const MAX_ITEMS = 50;
export function assertLimit(cart: Cart) {
  if (cart.items.reduce((s, i) => s + i.qty, 0) > MAX_ITEMS) throw new CartLimitError();
}
```

#### Application — порты и use case как функция

Use case в TS не обязан быть классом с методом `execute`. Функция-фабрика, замыкающая зависимости, — идиоматичнее и легче тестируется.

```ts
// application/ports.ts
import type { Cart } from '@/domain/cart';
import type { Order } from '@/domain/order';

export interface CartRepo { load(): Promise<Cart>; save(cart: Cart): Promise<void> }
export interface OrdersApi { create(cart: Cart): Promise<Order> }
export interface Notifier { error(msg: string): void; success(msg: string): void }

// application/checkout.ts
import { emptyCart, total, type Cart } from '@/domain/cart';
import type { CartRepo, OrdersApi, Notifier } from './ports';

export type CheckoutDeps = { cartRepo: CartRepo; ordersApi: OrdersApi; notifier: Notifier };

export const makeCheckout = ({ cartRepo, ordersApi, notifier }: CheckoutDeps) =>
  async (): Promise<{ ok: true; orderId: string } | { ok: false; reason: string }> => {
    const cart = await cartRepo.load();
    if (cart.items.length === 0) return { ok: false, reason: 'empty' };
    if (total(cart) < 100) return { ok: false, reason: 'min_total' };
    try {
      const order = await ordersApi.create(cart);
      await cartRepo.save(emptyCart);
      notifier.success('Заказ оформлен');
      return { ok: true, orderId: order.id };
    } catch (e) {
      notifier.error('Не удалось оформить заказ');
      return { ok: false, reason: 'network' };
    }
  };
```

#### Infrastructure — адаптеры с маппингом DTO

```ts
// infrastructure/http/orders-api.ts
import type { OrdersApi } from '@/application/ports';
import type { HttpClient } from './client';

type OrderDto = { order_id: string; total_cents: number; created_at: string };

export const createHttpOrdersApi = (http: HttpClient): OrdersApi => ({
  async create(cart) {
    const dto = await http.post<OrderDto>('/orders', {
      items: cart.items.map(i => ({ product_id: i.productId, quantity: i.qty })),
    });
    return { id: dto.order_id, total: dto.total_cents / 100, createdAt: new Date(dto.created_at) };
  },
});
```

🪤 Ловушка: «репозиторий» на фронте часто оказывается тонкой обёрткой над одним `fetch`. Ценность появляется, когда он **маппит DTO в доменную модель** (антикоррупционный слой) или **скрывает источник** (сеть / кэш / IndexedDB для offline-first).

#### UI — driving-адаптер и composition root

```tsx
// main.tsx — composition root: единственное место, знающее все реализации
const http = createHttpClient({ baseUrl: import.meta.env.VITE_API_URL });
const deps = {
  cartRepo: createLocalStorageCartRepo(window.localStorage),
  ordersApi: createHttpOrdersApi(http),
  notifier: toastNotifier,
};
const useCases = { checkout: makeCheckout(deps), addToCart: makeAddToCart(deps) };
export type UseCases = typeof useCases;

root.render(<UseCasesProvider value={useCases}><App /></UseCasesProvider>);

// ui/cart/useCartViewModel.ts — presenter/ViewModel: адаптирует use case к React
export function useCheckout() {
  const { checkout } = useUseCases();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: checkout,
    onSuccess: r => { if (r.ok) navigate(`/orders/${r.orderId}`); },
  });
}
```

Альтернатива Context — фабрики на уровне модуля (`export const checkout = makeCheckout(prodDeps)`) и подмена в тестах через параметры. Проще, но composition root «размазан».

### Где живёт серверный стейт?

Конфликт: TanStack Query / RTK Query / Apollo — это одновременно кэш, транспорт и состояние, и они хотят жить в UI-слое (хуки). Прагматичный компромисс:
- `queryFn`/`mutationFn` вызывают use case или репозиторий (порт), а не `fetch` напрямую.
- Query-хуки — это адаптер (interface adapters), не домен.
- Ключи кэша и инвалидация — тоже адаптерный слой.

### Когда это оверинжиниринг

| Признак | Clean Architecture скорее нужна | Скорее не нужна |
|---|---|---|
| Бизнес-логика на клиенте | Калькуляторы, редакторы, офлайн, сложные формы, финтех-правила | CRUD «таблица → форма → сохранить» |
| Срок жизни | 3+ года, много команд | MVP, лендинг, админка |
| Источники данных | Несколько (REST + WS + IndexedDB + SDK) | Один REST/GraphQL |
| Платформы | Один домен для web + React Native + extension | Одно веб-приложение |
| Тестирование | Нужно много unit-тестов бизнес-правил | Достаточно e2e/интеграционных |

Типичные симптомы оверинжиниринга: интерфейс с единственной реализацией и без тестовых двойников; маппер `UserDto → User`, где поля совпадают 1:1; use case, который только вызывает репозиторий; 5 файлов на одно поле формы.

### Критика (что сказать честно)

- **Фронт — это в основном адаптер.** Большая часть бизнес-логики на бэкенде; клиент — это «interface adapters + frameworks». Выделять entities бывает почти нечего.
- **Фреймворк — не деталь.** React/Vue определяют модель реактивности, жизненный цикл, data-fetching (RSC, Suspense, loaders). Абстрагироваться от них дорого и обычно бессмысленно: «сменим React на Vue» не происходит без переписывания UI.
- **Церемониальность.** Слои по техническому признаку (domain/application/infrastructure) разбрасывают одну фичу по 4 папкам — нарушают CCP. Поэтому на фронте лучше сочетать: вертикальные слайсы (FSD) снаружи, Clean-идеи внутри сложного слайса (см. [04-fsd-in-practice](04-fsd-in-practice.md)).
- **Книжные примеры — enterprise Java.** Request/Response модели, Interactor-классы, Presenter с OutputPort — избыточны для TS со структурной типизацией и функциями первого класса.
- **Плюсы, которые остаются:** тестируемость доменной логики без DOM, изоляция от смены API-контракта, возможность переиспользовать ядро (web + mobile), явная граница для code review.

💡 На собеседовании: «Я беру из Clean Architecture правило зависимостей и порты для внешних сервисов, а слои ввожу только там, где есть настоящая клиентская бизнес-логика. Для CRUD-админки достаточно FSD + TanStack Query».

## Вопросы с собеседований

<details><summary>Сформулируйте правило зависимостей.</summary>

Зависимости исходного кода направлены только внутрь, к более высокоуровневым политикам. Внутренний слой не знает имён из внешнего. Если внутреннему нужно вызвать внешнее — он объявляет интерфейс, внешний реализует (инверсия). Поток управления при этом может идти наружу — это и есть суть DIP.
</details>

<details><summary>Чем entities отличаются от use cases?</summary>

Entities — правила предприятия, которые существовали бы и без приложения (расчёт процентов, валидность заказа). Use cases — правила конкретного приложения: сценарий «оформить заказ в веб-магазине» с шагами, проверками, оркестрацией портов. Entities не знают о use cases. На фронте entities часто — типы + чистые функции, use cases — асинхронные функции-оркестраторы.
</details>

<details><summary>Что такое порт и адаптер? Driving vs driven?</summary>

Порт — интерфейс на границе ядра в терминах ядра. Адаптер — технологическая реализация. Driving (primary) — вход: UI-компоненты, тесты, вызывающие use cases. Driven (secondary) — выход: репозитории, платёжки, аналитика, которые ядро вызывает через объявленный им интерфейс.
</details>

<details><summary>Где composition root во фронтенд-приложении?</summary>

Точка входа (`main.tsx`, `app`-слой FSD, Nuxt plugin, Angular `providers` в `bootstrapApplication`). Это единственное место, которое знает все конкретные реализации и связывает их. Дальше зависимости раздаются через Context/provide или параметры.
</details>

<details><summary>Use case — класс или функция?</summary>

В TS — чаще функция-фабрика `makeX(deps) => (input) => result`. Классы оправданы, если нужен DI-контейнер с декораторами (Angular, Inversify) или состояние. Функция легче композиционируется и мокается, типы зависимостей выводятся.
</details>

<details><summary>Зачем маппить DTO в доменную модель?</summary>

Антикоррупционный слой: изменения контракта бэкенда (snake_case, центы, вложенность) локализованы в адаптере. UI и логика работают со стабильной моделью (`Date`, `Money`). Минус — boilerplate; оправдан, если API нестабилен, чужой или их несколько. Генерация клиента из OpenAPI + тонкий маппинг — хороший компромисс.
</details>

<details><summary>Как совместить TanStack Query с Clean Architecture?</summary>

Query — адаптер. `queryFn` вызывает порт/use case, а не `fetch`. Хуки `useXxxQuery` живут в UI/adapters. Мутации вызывают use cases, инвалидация — в `onSuccess`. Домен ничего не знает о кэше.
</details>

<details><summary>Когда Clean Architecture на фронте — оверинжиниринг?</summary>

CRUD без клиентской логики, короткий срок жизни, одна команда, один источник данных. Симптомы: интерфейсы с одной реализацией без тестов, мапперы 1:1, use case = прокси к репозиторию. Решение — начинать с простого и выделять слой, когда появляется второй источник/платформа или сложные правила.
</details>

<details><summary>Как Clean Architecture соотносится с FSD?</summary>

Ортогональны: FSD — вертикальная нарезка по бизнес-доменам и горизонтальные слои по уровню ответственности; Clean — направление зависимостей внутри. Entities Мартина ≈ `entities/*/model`, use cases ≈ `features/*/model`, адаптеры ≈ `*/api` сегменты и `shared/api`, composition root ≈ `app`. Подробно — [04-fsd-in-practice](04-fsd-in-practice.md).
</details>

<details><summary>Чем Hexagonal отличается от Onion и Clean?</summary>

Hexagonal — две стороны (driving/driven), ядро без внутренней структуры. Onion — добавляет внутренние слои (Domain Model, Domain Services, Application Services). Clean — обобщение обоих с явным правилом зависимостей и терминологией entities/use cases. Суть одна, различия — в детализации ядра.
</details>

## Практика

**Задача 1.** В use case есть строка `import { toast } from 'sonner'`. Что не так и как исправить?
<details><summary>Решение</summary>

Нарушено правило зависимостей: application зависит от UI-библиотеки. Объявить порт `Notifier { success; error }` в `application/ports.ts`, адаптер `sonnerNotifier` в infrastructure, связать в composition root. В тестах — `{ success: vi.fn(), error: vi.fn() }`.
</details>

**Задача 2.** Напишите тест для `makeCheckout` без моков модулей.
<details><summary>Решение</summary>

```ts
import { describe, it, expect, vi } from 'vitest';
import { makeCheckout } from '@/application/checkout';

const cart = { items: [{ productId: 'p1', price: 200, qty: 1 }] };

describe('checkout', () => {
  it('создаёт заказ и очищает корзину', async () => {
    const save = vi.fn();
    const checkout = makeCheckout({
      cartRepo: { load: async () => cart, save },
      ordersApi: { create: async () => ({ id: 'o1', total: 200, createdAt: new Date() }) },
      notifier: { success: vi.fn(), error: vi.fn() },
    });
    await expect(checkout()).resolves.toEqual({ ok: true, orderId: 'o1' });
    expect(save).toHaveBeenCalledWith({ items: [] });
  });
});
```
</details>

**Задача 3.** Приложение должно работать офлайн: заказы складываются в IndexedDB и синхронизируются при появлении сети. Что меняется в архитектуре?
<details><summary>Решение</summary>

Ядро не меняется. Добавляется адаптер `QueuedOrdersApi implements OrdersApi`, который пишет в IndexedDB-очередь и возвращает временный id; отдельный sync-сервис (driving-адаптер по событию `online` или Background Sync в Service Worker) отправляет очередь через `HttpOrdersApi`. В composition root выбираем декоратор. Это и есть выигрыш порта: смена инфраструктуры без правок use case. Нужно продумать идемпотентность (client-generated id / idempotency key) и конфликты.
</details>

## Источники
- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- R. Martin, «Чистая архитектура» (2017) — части V «Архитектура» и VI «Детали»
- https://alistair.cockburn.us/hexagonal-architecture/
- https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
- https://martinfowler.com/bliki/PresentationDomainDataLayering.html
- https://tanstack.com/query/latest/docs/framework/react/overview
