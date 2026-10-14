# GoF-паттерны, монорепозитории, микрофронтенды, design system

> ⏱ ~4 ч · 🎯 Узнавать GoF-паттерны в повседневном фронтенд-коде; выбирать инструмент монорепо; аргументированно говорить «да/нет» микрофронтендам; видеть design system как архитектурный слой с собственным контрактом.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу привести пример каждого из 7 паттернов из реального фронтенда
- [ ] Знаю разницу Nx / Turborepo / pnpm workspaces
- [ ] Понимаю Module Federation (host/remote/shared) и альтернативы
- [ ] Могу описать слои design system (токены → примитивы → компоненты → паттерны)

## Теория

### GoF во фронтенде

Паттерны в JS часто «растворены» в языке (функции первого класса, замыкания, модули), поэтому классовые диаграммы GoF превращаются в 5 строк.

#### Observer

Субъект уведомляет подписчиков. Везде: DOM events, `EventTarget`, RxJS, `useSyncExternalStore`, реактивность Vue/сигналы, Zustand.

```ts
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (updater: (s: T) => T) => { state = updater(state); listeners.forEach(l => l()); },
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  };
}
// React: useSyncExternalStore(store.subscribe, store.get)
```

🪤 Ловушка: забытая отписка → утечки памяти и обновление размонтированных компонентов. Всегда возвращайте unsubscribe; для DOM — `AbortController` + `{ signal }`.

#### Strategy

Взаимозаменяемые алгоритмы за одним интерфейсом. Валидаторы, сортировки, способы оплаты, форматтеры, retry-политики.

```ts
type ShippingStrategy = (weightKg: number) => number;
const strategies = {
  courier: w => 300 + w * 50,
  pickup: () => 0,
  post: w => 150 + w * 30,
} satisfies Record<string, ShippingStrategy>;

export const shippingCost = (method: keyof typeof strategies, w: number) => strategies[method](w);
```

#### Adapter

Приводит чужой интерфейс к ожидаемому. Мапперы DTO → domain, обёртки над SDK аналитики/карт, адаптер `localStorage` под интерфейс репозитория (см. [02-clean-architecture](02-clean-architecture.md)).

```ts
interface Logger { error(msg: string, ctx?: Record<string, unknown>): void }
export const sentryLogger: Logger = {
  error: (msg, ctx) => Sentry.captureException(new Error(msg), { extra: ctx }),
};
```

#### Facade

Простой интерфейс к сложной подсистеме. Public API слайса FSD — фасад. `useCheckout()`, скрывающий корзину, оплату, аналитику и навигацию. API-клиент поверх `fetch` с ретраями, auth, парсингом ошибок.

Отличие от Adapter: Adapter меняет интерфейс одного объекта под ожидаемый; Facade упрощает работу со многими.

#### Factory

Создание объектов без указания конкретного класса. `createHttpClient(config)`, `createStore`, `defineStore` (Pinia), `createBrowserRouter`, фабрики компонентов по типу поля в конструкторе форм:

```tsx
const fieldComponents = { text: TextField, select: SelectField, date: DateField } as const;
type FieldSchema = { type: keyof typeof fieldComponents; name: string; label: string };

export function renderField(schema: FieldSchema) {
  const Component = fieldComponents[schema.type];
  return <Component key={schema.name} name={schema.name} label={schema.label} />;
}
```

#### Mediator

Объекты общаются через посредника, а не напрямую — уменьшает связность «каждый с каждым». Родительский компонент/страница, координирующая фичи через пропсы и колбэки; event bus; state machine (XState) как медиатор шагов формы; host в микрофронтендах.

```tsx
// Страница — медиатор: фильтры и список не знают друг о друге (соответствует правилу FSD)
function CatalogPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  return (<>
    <CatalogFilters value={filters} onChange={setFilters} />
    <ProductGrid filters={filters} />
  </>);
}
```

🪤 Ловушка: глобальный event bus — медиатор, ставший God-объектом: связи неявные, типизация слабая, трудно найти подписчиков. Предпочитайте явную композицию или типизированные события.

#### Command

Запрос как объект: можно ставить в очередь, логировать, отменять. Redux actions, undo/redo в редакторах, офлайн-очередь мутаций, палитра команд (Cmd+K).

```ts
interface Command { execute(): void; undo(): void; label: string }

export function createHistory() {
  const done: Command[] = [];
  const undone: Command[] = [];
  return {
    run(cmd: Command) { cmd.execute(); done.push(cmd); undone.length = 0; },
    undo() { const c = done.pop(); if (c) { c.undo(); undone.push(c); } },
    redo() { const c = undone.pop(); if (c) { c.execute(); done.push(c); } },
  };
}
```

Также полезно знать: **Proxy** (реактивность Vue 3, MobX), **Decorator** (HOC, middleware, Angular-декораторы), **Composite** (дерево компонентов), **State** (конечные автоматы), **Singleton** (модуль ES — синглтон по природе; опасен для SSR — общий стейт между запросами).

### Монорепозитории

Монорепо — несколько проектов/пакетов в одном репозитории. Плюсы: атомарные изменения через границы пакетов, единые версии и инструменты, простой code sharing. Минусы: масштаб CI, права доступа, связанность релизов, нагрузка на инструменты (IDE, git).

| | pnpm workspaces | Turborepo | Nx |
|---|---|---|---|
| Что это | Менеджер пакетов: линковка, единый lockfile | Таск-раннер поверх workspaces | Платформа сборки: таск-раннер + граф проекта + генераторы + плагины |
| Граф задач и кэш | Нет (`pnpm -r`, `--filter`) | Да: `turbo.json`, локальный + remote cache | Да: локальный + remote (Nx Cloud), распределённое выполнение |
| Affected | `--filter "...[origin/main]"` | `--filter=...[origin/main]` / `--affected` | `nx affected` — по графу зависимостей |
| Границы модулей | Нет | Экспериментальная команда `turbo boundaries` (2.4+) | `@nx/enforce-module-boundaries` по тегам |
| Кодогенерация | Нет | `turbo gen` (базово) | Генераторы, миграции версий (`nx migrate`) |
| Порог входа | Минимальный | Низкий | Выше, «opinionated» |
| Когда | 2–5 пакетов, просто шарить код | Средние монорепо, хочется быстро кэш | Большие монорепо, много команд, нужны правила и генераторы |

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// turbo.json (Turborepo 2.x)
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "lint": {},
    "test": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

Типичная структура: `apps/web`, `apps/admin`, `packages/ui` (design system), `packages/api-client` (генерация из OpenAPI), `packages/config` (eslint/tsconfig), `packages/domain`. Нюансы: internal packages без сборки (TS-исходники через `exports` + транспиляция в приложении) vs собранные пакеты; TS project references; Changesets для версионирования публикуемых пакетов.

### Микрофронтенды

Архитектурный стиль, при котором независимо поставляемые фронтенд-приложения композируются в одно (Cam Jackson, martinfowler.com). Главная ценность — **организационная**: независимые команды с независимыми релизами.

Способы композиции:
- **Build-time** (npm-пакеты) — по сути не микрофронтенды: релиз всё равно общий.
- **Server-side** (SSI/ESI, фрагменты, Edge composition).
- **Runtime через iframe** — максимальная изоляция, плохие UX/SEO/a11y/производительность.
- **Runtime JS**: **Module Federation** (Webpack 5, Rspack, Vite-плагины, Module Federation 2.0 с manifest и type hints), import maps + single-spa, Web Components.

Module Federation:

```js
// rspack/webpack: host
new ModuleFederationPlugin({
  name: 'shell',
  remotes: { catalog: 'catalog@https://cdn.example.com/catalog/remoteEntry.js' },
  shared: { react: { singleton: true, requiredVersion: '^19.0.0' }, 'react-dom': { singleton: true } },
});
// remote
new ModuleFederationPlugin({
  name: 'catalog',
  filename: 'remoteEntry.js',
  exposes: { './CatalogPage': './src/pages/catalog' },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
// host: const CatalogPage = lazy(() => import('catalog/CatalogPage'));
```

| Плюсы | Минусы |
|---|---|
| Независимые деплои и команды | Сложность инфраструктуры, версионирование контрактов |
| Изоляция отказов (если продумана) | Дублирование зависимостей, рост бандла, сложный shared |
| Постепенная миграция легаси (strangler) | Несогласованный UX, нужна общая design system |
| Технологическая свобода (на практике — риск) | Сложность e2e, локальной разработки, отладки |
| | Общий стейт, роутинг, авторизация между приложениями |

**Когда нужны:** много команд (условно 5+), которые мешают друг другу в одном релизном цикле; разные доменные зоны с чёткими границами; миграция большого легаси по частям; интеграция продуктов разных компаний/подразделений.

**Когда не нужны:** одна-две команды; проблема в плохой модульности (решается FSD/монорепо + границами); хочется «другой фреймворк ради интереса».

💡 На собеседовании: «Микрофронтенды — решение организационной проблемы. Сначала пробую модульный монолит в монорепо с границами (Nx tags/Steiger) и независимыми CI-пайплайнами; MF — когда упираемся в независимость релизов». Контракты между MF: события (CustomEvent / типизированный bus), URL, минимальный shared state; общие зависимости — singleton с диапазонами версий; изоляция стилей (CSS Modules/префиксы, Shadow DOM).

### Design system как архитектурный слой

Design system — не «папка компонентов», а продукт с контрактом, от которого зависят все приложения (самый стабильный компонент по SDP/SAP).

Слои:
1. **Design tokens** — цвета, типографика, отступы, радиусы, тени, motion; уровни: primitive (`blue-500`) → semantic (`color-bg-danger`) → component (`button-bg-primary`). Формат DTCG (W3C Design Tokens Community Group), сборка Style Dictionary → CSS variables/TS/iOS/Android.
2. **Примитивы / headless** — поведение и доступность без стилей (Radix, React Aria, Ark UI, или свои).
3. **Компоненты** — Button, Input, Modal со стилями из токенов.
4. **Паттерны/композиции** — формы, таблицы, пустые состояния, layout-шаблоны.
5. **Документация и инструменты** — Storybook, визуальные регрессии (Chromatic/Playwright screenshots), a11y-тесты, codemods, Figma-синхронизация.

Архитектурные решения:
- **Где живёт**: `shared/ui` (в FSD) для одного приложения; отдельный пакет в монорепо для нескольких; опубликованный npm-пакет для разных репо.
- **Контракт**: semver, deprecation-политика, codemods при breaking changes, changelog.
- **Theming**: CSS variables + `data-theme`, без перекомпиляции; dark mode через семантические токены.
- **Без бизнес-логики**: никаких `ProductCard` в DS — это `entities/product/ui`.
- **API компонентов**: composition (compound/slots) > флаги; нативные атрибуты прокидываются (LSP); `asChild`/polymorphism осознанно.
- **Governance**: кто принимает вклад, как добавляется компонент (contribution model), метрики adoption.

## Вопросы с собеседований

<details><summary>Приведите примеры GoF-паттернов в React/Vue.</summary>

Observer — реактивность, подписки, `useSyncExternalStore`. Strategy — валидаторы, форматтеры. Adapter — мапперы DTO и обёртки SDK. Facade — кастомные хуки и public API слайса. Factory — `createStore`, `defineStore`, рендер полей по схеме. Mediator — родитель-координатор, state machine. Command — Redux actions, undo/redo. Proxy — реактивность Vue 3. Decorator — HOC, middleware. Composite — дерево компонентов.
</details>

<details><summary>Adapter vs Facade?</summary>

Adapter приводит интерфейс одного объекта к ожидаемому клиентом (совместимость). Facade даёт упрощённый интерфейс к подсистеме из многих объектов (удобство). Адаптер не упрощает, фасад не обязан менять форму.
</details>

<details><summary>Nx или Turborepo?</summary>

Turborepo — лёгкий таск-раннер с кэшем, быстро внедряется в существующий pnpm workspace. Nx — платформа: граф проекта, affected, enforce-module-boundaries по тегам, генераторы, миграции, распределённый CI. Для большого монорепо с многими командами и требованиями к границам — Nx; для небольшого — Turborepo/pnpm.
</details>

<details><summary>Когда микрофронтенды оправданы?</summary>

Когда проблема организационная: много команд, мешающих друг другу в общем релизном цикле, чёткие доменные границы, поэтапная миграция легаси. Не оправданы для 1–2 команд — модульный монолит с границами дешевле. Цена: инфраструктура, дублирование зависимостей, UX-консистентность, отладка, контракты.
</details>

<details><summary>Как шарить React между микрофронтендами в Module Federation?</summary>

`shared` с `singleton: true` и `requiredVersion` — иначе два экземпляра React ломают хуки и Context. Eager для host или async boundary (`import('./bootstrap')`). Согласованный диапазон версий, иначе fallback на свою копию/ошибка. Минимизировать shared — каждая общая зависимость — связь релизов.
</details>

<details><summary>Как организовать общение между микрофронтендами?</summary>

Минимально: URL/роутинг как основной контракт, CustomEvent/типизированный event bus для событий, общий auth через cookie/SDK host. Избегать общего глобального стора — это распределённый монолит. Контракты версионировать, как API.
</details>

<details><summary>Чем design system отличается от UI-kit?</summary>

UI-kit — набор компонентов. Design system — компоненты + токены + принципы + документация + процессы (governance, contribution, версионирование) + синхронизация с дизайном. Архитектурно — стабильный слой с контрактом, от которого зависят продукты.
</details>

<details><summary>Как делать breaking changes в design system?</summary>

Semver major; deprecation-период с runtime-warning в dev и `@deprecated` в типах; codemods (jscodeshift/ts-morph); changelog с гайдом миграции; метрики использования старого API (поиск по монорепо, телеметрия). Не ломать без миграционного пути.
</details>

<details><summary>Почему Singleton опасен в SSR?</summary>

Модуль на сервере живёт между запросами — модульный стор/кэш становится общим для всех пользователей: утечка данных между сессиями. Решение — создавать стор/QueryClient на запрос (фабрика + провайдер), Pinia/Nuxt делают это по умолчанию.
</details>

## Практика

**Задача 1.** Реализуйте типизированный event bus (Mediator/Observer) для микрофронтендов с автоматической отпиской.
<details><summary>Решение</summary>

```ts
type Events = { 'cart:updated': { count: number }; 'auth:logout': void };

export function createBus<E extends Record<string, unknown>>(target = new EventTarget()) {
  return {
    emit<K extends keyof E & string>(type: K, detail: E[K]) {
      target.dispatchEvent(new CustomEvent(type, { detail }));
    },
    on<K extends keyof E & string>(type: K, fn: (d: E[K]) => void, signal?: AbortSignal) {
      const h = (e: Event) => fn((e as CustomEvent<E[K]>).detail);
      target.addEventListener(type, h, { signal });
      return () => target.removeEventListener(type, h);
    },
  };
}
export const bus = createBus<Events>(window); // общий target — window
```
</details>

**Задача 2.** Компания: 3 продукта, 12 фронтенд-команд, общий логин и шапка, раз в неделю общий релиз блокирует всех. Предложите архитектуру.
<details><summary>Решение</summary>

Монорепо (Nx) с design system и общими пакетами (auth SDK, api-client, шапка как пакет или remote). Сначала — независимые пайплайны и деплой каждого продукта как отдельного приложения на своём пути (`/shop`, `/account`) с общим доменом — уже убирает общий релиз без MF. MF (Module Federation) — только для встраиваемых в чужие страницы виджетов (шапка, корзина), с версионированными контрактами. Нефункциональные: общий performance budget, общий RUM, единая DS и визуальные тесты.
</details>

## Источники
- https://refactoring.guru/design-patterns
- https://www.patterns.dev/
- https://martinfowler.com/articles/micro-frontends.html
- https://module-federation.io/
- https://nx.dev/
- https://turborepo.com/docs
- https://pnpm.io/workspaces
- https://www.designtokens.org/
- https://styledictionary.com/
