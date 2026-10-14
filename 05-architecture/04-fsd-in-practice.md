# FSD на практике: дерево проекта, миграция, линтинг, Next/Nuxt

> ⏱ ~5 ч · 🎯 Разложить реальный e-commerce по FSD, принимать решения в спорных случаях, провести миграцию легаси, настроить Steiger/ESLint, интегрировать с Next.js App Router и Nuxt, совместить с Clean Architecture.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу по памяти набросать дерево e-commerce на FSD
- [ ] Знаю пошаговый план миграции легаси
- [ ] Настраивал Steiger и/или eslint-plugin-boundaries
- [ ] Знаю, как подружить FSD с `app/` Next.js и `pages/` Nuxt
- [ ] Могу показать, где в FSD лежат use cases и репозитории

## Теория

### Дерево реального проекта (e-commerce, React + Vite + TanStack Query)

```
src/
├── app/
│   ├── providers/           # QueryClientProvider, ThemeProvider, ServicesProvider
│   ├── routes/              # конфиг роутера, guards (requireAuth)
│   ├── styles/              # reset, глобальные токены
│   ├── di.ts                # composition root: сборка адаптеров
│   └── main.tsx
├── pages/
│   ├── home/                { ui/HomePage.tsx, index.ts }
│   ├── catalog/
│   │   ├── ui/CatalogPage.tsx
│   │   ├── model/filters.ts # фильтры нужны только здесь → остаются в page (pages first)
│   │   └── index.ts
│   ├── product/             { ui/, api/loader.ts, index.ts }
│   ├── cart/
│   ├── checkout/
│   │   ├── ui/ (CheckoutPage, DeliveryStep, PaymentStep)
│   │   ├── model/checkout-machine.ts
│   │   └── index.ts
│   └── profile/
├── widgets/
│   ├── header/              # лого + search + cart-badge + user-menu
│   ├── product-grid/        # entity product + add-to-cart + toggle-favorite
│   ├── cart-drawer/
│   └── reviews-section/
├── features/
│   ├── auth/                # login/logout/register: ui/, model/, api/
│   ├── search/              # строка поиска + подсказки
│   ├── add-to-cart/
│   ├── change-cart-quantity/
│   ├── toggle-favorite/
│   ├── apply-promo-code/
│   └── write-review/
├── entities/
│   ├── user/                { ui/UserAvatar, model/types, api/userQueries, index.ts }
│   ├── session/             # токен, текущий пользователь, isAuthorized
│   ├── product/             { ui/ProductCard, ui/Price, model/, api/, @x/cart.ts }
│   ├── cart/                { model/cart.ts (чистые функции), api/, ui/CartLine }
│   ├── order/
│   └── review/
└── shared/
    ├── api/                 # http-клиент, interceptors, сгенерированный OpenAPI-клиент
    ├── ui/                  # button/, input/, modal/ — у каждого свой index.ts
    ├── lib/                 # date/, money/, use-debounce/ — свой index у каждого
    ├── config/              # env, константы, фича-флаги
    ├── routes/              # пути: routes.product(id) — нужны всем слоям для ссылок
    └── i18n/
```

### Куда класть код: разбор спорных случаев

| Ситуация | Решение | Почему |
|---|---|---|
| Код нужен только одной странице | `pages/<page>/ui|model|api` | FSD 2.1 pages first: не плодить слайсы |
| Тип `User` нужен в `entities/order` | `entities/user/@x/order.ts` | явный кросс-импорт на слое entities |
| Две фичи должны взаимодействовать (промокод меняет итог корзины) | Обе зависят от `entities/cart`; оркестрация — в widget/page | соседние фичи не импортируют друг друга |
| Токен авторизации нужен http-клиенту в shared | shared предоставляет `setTokenGetter()`/interceptor-хук, `app` связывает с `entities/session` | shared не знает о бизнесе — инверсия через app |
| Пути роутов нужны в `entities/product` для ссылки | `shared/routes` (строки/функции путей) | роутер — в app, а пути — данные без бизнеса |
| Общая форма адреса для checkout и профиля | `features/edit-address` или `entities/address/ui` (если только отображение) | ввод = действие пользователя |
| Модалка подтверждения удаления | Компонент `ConfirmDialog` в `shared/ui`; конкретное «удалить товар» — в feature | UI-kit без бизнеса |
| Глобальный store (Redux) | Slice-редьюсеры — в `model` соответствующих слайсов; `configureStore` — в `app` | store собирается в composition root |
| Тип API-ответа из OpenAPI | `shared/api` (сгенерированный) + маппинг в `entities/*/api` | генерация — инфраструктура, маппинг — домен |
| Фича-флаги | Клиент — `shared/config`, значения — провайдер в `app` | |
| WebSocket-соединение | Транспорт — `shared/api/ws`, подписки на доменные события — `entities/*/api` | |

🪤 Ловушка: при инверсии через `app` (токен в http-клиенте) легко незаметно импортировать `entities/session` в `shared/api` — нарушение. Линтер ловит.

### Миграция легаси на FSD пошагово

Официальный гайд FSD (migration/from-custom) предлагает инкрементальный путь. Расширенная практическая версия:

1. **Договориться и зафиксировать** (ADR): зачем, какие слои используем, глоссарий бизнес-сущностей (это самая ценная часть — спор «entity или feature» решается словарём домена).
2. **Алиасы и линтер в режиме warning**: `@/` alias, Steiger/ESLint с правилами для новых путей; legacy-папки игнорировать.
3. **Выделить `app` и `shared`**: провайдеры, роутер, глобальные стили → `app`; UI-kit, http-клиент, утилиты без бизнеса → `shared`. Самый дешёвый шаг, сразу видны границы.
4. **Разложить по `pages`**: каждая страница — слайс; сначала просто переместить, весь «личный» код страницы — туда же. На этом этапе это уже рабочая FSD-структура (pages first).
5. **Выносить вниз по мере дублирования**: если код нужен двум страницам — выделить entity/feature/widget. Не раньше.
6. **Устранять нарушения** импорта по отчёту линтера, приоритет — циклы и импорты «вверх».
7. **Перевести линтер в error** для мигрированных слоёв, запретить новые файлы в старых папках (CODEOWNERS / правило «новый код — только в FSD»).
8. **Удалить старые папки**, когда пусты.

Тактические приёмы: стратегия «душителя» (strangler fig) — новое пишем в FSD, старое переносим, когда трогаем; codemods (jscodeshift/ts-morph) для массового переписывания импортов; не смешивать миграцию с изменением логики в одном PR.

💡 На собеседовании: «Миграцию веду снизу-вверх по границам (`shared`, `app`) и сверху-вниз по коду (`pages` → выделение вниз). Метрика прогресса — число нарушений в отчёте Steiger и доля файлов вне legacy-папок».

### Линтинг: Steiger и ESLint

**Steiger** — официальный линтер структуры FSD (понимает слои, слайсы, public API на уровне файловой системы).

```bash
npm i -D steiger @feature-sliced/steiger-plugin
npx steiger ./src            # разовый прогон
npx steiger ./src --watch    # в режиме наблюдения
```

```ts
// steiger.config.ts
import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // правило можно отключить/ослабить для части файлов
    files: ['./src/shared/**'],
    rules: { 'fsd/public-api': 'off' },
  },
]);
```

Полезные правила плагина (имена с префиксом `fsd/`): `forbidden-imports` (импорт вверх/в соседей), `no-public-api-sidestep`, `public-api`, `insignificant-slice` (слайс используется в одном месте — опустить в страницу), `excessive-slicing` (слишком много слайсов на слое), `segments-by-purpose` (запрет `components`/`hooks`/`types`), `no-processes`, `ambiguous-slice-names`, `no-reserved-folder-names`.

**ESLint: eslint-plugin-boundaries** — универсальный плагин границ, работает и для FSD, и для Clean Architecture:

```js
// eslint.config.js (flat config)
import boundaries from 'eslint-plugin-boundaries';

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

export default [
  {
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: true },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'shared', pattern: 'src/shared' },
        ...['pages', 'widgets', 'features', 'entities'].map(type => ({
          type, pattern: `src/${type}/*`, capture: ['slice'],
        })),
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: layers.map((from, i) => ({
          from,
          // разрешены только слои строго ниже (+ сам себе для app/shared)
          allow: [...layers.slice(i + 1), ...(['app', 'shared'].includes(from) ? [from] : [])],
        })),
      }],
    },
  },
];
```

Для запрета sidestep — `no-restricted-imports` с паттерном `@/*/*/*/**` (глубже public API) или `boundaries/entry-point`. Пакет `@feature-sliced/eslint-config` — легаси; актуальный путь — Steiger + опционально boundaries. Для циклов — `import/no-cycle` или dependency-cruiser в CI.

Trade-off: ESLint работает в IDE на каждом файле (быстрая обратная связь), Steiger понимает FSD семантически (insignificant-slice, excessive-slicing). В CI — оба.

### FSD + Next.js App Router

Конфликт имён: Next ищет роуты в `app/` и `pages/` (в корне или в `src/`), а у FSD есть слои `app` и `pages`. Рекомендация документации FSD:

```
├── app/                     # Next.js App Router — только тонкие роут-файлы
│   ├── layout.tsx
│   ├── page.tsx
│   └── product/[id]/page.tsx
├── pages/                   # ПУСТАЯ папка (с README), чтобы Next не принял src/pages за Pages Router
└── src/
    ├── app/                 # FSD-слой app: провайдеры, стили
    ├── pages/               # FSD-слой pages
    ├── widgets/ features/ entities/ shared/
```

```tsx
// app/product/[id]/page.tsx — роут-файл только реэкспортирует FSD-страницу
export { ProductPage as default, generateMetadata } from '@/pages/product';

// src/pages/product/ui/ProductPage.tsx — Server Component
import { getProduct } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart'; // 'use client' внутри фичи

export async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;          // Next 15+: params — Promise
  const product = await getProduct(id);
  return (<>
    <h1>{product.title}</h1>
    <AddToCartButton productId={id} />
  </>);
}
```

Нюансы RSC: `'use client'` ставится как можно ниже (в `ui` фичи), серверные функции (`'use server'`) — в `api`-сегменте слайса; следить, чтобы public API клиентского слайса не тянул серверный код (`server-only` пакет как предохранитель; иногда разделяют `index.ts` и `index.server.ts`). Route handlers (`app/api/**/route.ts`) — тоже тонкие, логика — в `src/**/api`.

### FSD + Vue / Nuxt

Во Vue 3 FSD ложится естественно: `ui` — SFC, `model` — composables/Pinia-сторы, `api` — запросы. Pinia-стор — в `model` сущности/фичи, регистрация Pinia — в `app`.

Nuxt использует соглашения о папках (`pages/`, `layouts/`, `components/` с авто-импортом). Подход: перенастроить директории в `nuxt.config.ts` так, чтобы файловый роутинг жил внутри FSD-слоя `app`, а авто-импорт компонентов отключить (он ломает явные границы и public API).

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'src',
  dir: {
    pages: 'app/routes',     // файловые роуты — тонкие обёртки над FSD pages
    layouts: 'app/layouts',
  },
  components: { dirs: [] },  // без авто-импорта компонентов — только явные импорты через public API
  imports: { autoImport: true }, // авто-импорт Vue/Nuxt API можно оставить
});
```

```vue
<!-- src/app/routes/product/[id].vue -->
<script setup lang="ts">
import { ProductPage } from '@/pages/product';
</script>
<template><ProductPage /></template>
```

### FSD + Clean Architecture вместе

FSD задаёт **где** (вертикальные слайсы по домену, горизонтальные слои по уровню), Clean — **направление зависимостей внутри**. Соответствие:

| Clean Architecture | FSD |
|---|---|
| Entities (enterprise rules) | `entities/*/model` — типы и чистые функции |
| Use cases | `features/*/model` (сценарий действия) или `pages/*/model` |
| Ports (интерфейсы репозиториев) | `entities/*/model` или `features/*/model` — рядом с тем, кто их использует |
| Adapters (HTTP, storage) | `entities/*/api`, `features/*/api`, транспорт — `shared/api` |
| Presenters / ViewModel | хуки/composables в `model` + компоненты в `ui` |
| Composition root | `app` (`app/di.ts`, провайдеры) |

```ts
// features/apply-promo-code/model/apply-promo.ts — use case
import { applyDiscount, type Cart } from '@/entities/cart';
export interface PromoApi { validate(code: string): Promise<{ percent: number } | null> }

export const makeApplyPromo = (api: PromoApi) => async (cart: Cart, code: string) => {
  const promo = await api.validate(code.trim().toUpperCase());
  return promo ? { ok: true as const, cart: applyDiscount(cart, promo.percent) } : { ok: false as const };
};

// features/apply-promo-code/api/promo-api.ts — адаптер
import { http } from '@/shared/api';
import type { PromoApi } from '../model/apply-promo';
export const httpPromoApi: PromoApi = { validate: code => http.get(`/promo/${code}`).catch(() => null) };

// features/apply-promo-code/index.ts
export { PromoCodeForm } from './ui/PromoCodeForm';
```

Правило: не вводить отдельные слои `domain/application/infrastructure` поверх FSD — это даст двойную нарезку и путаницу. Clean-идеи применяются **внутри сложных слайсов** через сегменты.

### Типичные ошибки и антипаттерны

- **Всё — фича**: `features/product-card`, `features/header`. Фича — действие, не блок UI.
- **Excessive slicing**: 60 фич по одному компоненту. Лечится pages first и группировкой.
- **Толстый shared**: бизнес-логика в `shared/lib/cart-utils.ts`. Shared не знает слов из домена.
- **Sidestep public API** (`@/entities/user/model/store`).
- **`export *` в index** — утечка внутренностей, конфликты имён.
- **Кросс-импорты между фичами** «временно» — через полгода граф неотличим от легаси.
- **Сегменты по типу** (`hooks/`, `types/`, `components/`).
- **Импорт своего index внутри слайса** → циклы и `undefined` при инициализации.
- **Entity с мутациями всех видов** — превращается в god-object; действия — в features.
- **Отсутствие линтера** — FSD без автоматической проверки деградирует за 2–3 месяца.

## Вопросы с собеседований

<details><summary>Как бы вы мигрировали легаси на FSD?</summary>

ADR и глоссарий домена → алиасы и линтер в warning → выделить `app` и `shared` → разложить код по `pages` (pages first) → выносить вниз при переиспользовании → чинить нарушения по отчёту, начиная с циклов → линтер в error, запрет новых файлов в легаси-папках → удалить старое. Strangler fig, codemods, миграционные PR без изменения логики, метрика — число нарушений.
</details>

<details><summary>Чем Steiger отличается от eslint-plugin-boundaries?</summary>

Steiger — официальный FSD-линтер, анализирует файловую структуру целиком: запрещённые импорты, sidestep public API, бесполезные/лишние слайсы, неправильные сегменты. Boundaries — общий ESLint-плагин границ по паттернам путей, работает в IDE, подходит и для Clean Architecture, но FSD-семантику (insignificant-slice) не знает. Использовать вместе.
</details>

<details><summary>Как совместить FSD и Next.js App Router?</summary>

Next `app/` — в корне проекта с тонкими роут-файлами, реэкспортирующими FSD-страницы; FSD — в `src/`; пустая корневая `pages/`, чтобы Next не подхватил `src/pages`. `'use client'` — как можно ниже, серверный код — в `api`, защита `server-only`.
</details>

<details><summary>Где в FSD живут use cases и репозитории?</summary>

Use case — в `model` фичи (или страницы, если не переиспользуется). Интерфейс репозитория — рядом с потребителем (model), реализация — в `api` того же слайса, общий транспорт — `shared/api`. Composition root — `app`. Отдельные слои domain/infrastructure поверх FSD не вводим.
</details>

<details><summary>http-клиенту в shared нужен токен из entities/session. Как?</summary>

Инверсия: shared экспортирует точку расширения (`configureHttp({ getToken })` или interceptor-регистрацию), `app` при старте связывает с `entities/session`. Shared не импортирует бизнес-слои.
</details>

<details><summary>Как FSD работает с Nuxt авто-импортами?</summary>

Авто-импорт компонентов ломает границы (любой компонент доступен везде, public API обходится). Отключаем `components.dirs`, файловые роуты переносим в `src/app/routes` через `dir.pages`, роут-файлы — обёртки над FSD-страницами. Авто-импорт Vue API можно оставить.
</details>

<details><summary>Как понять, что FSD деградирует в проекте?</summary>

Рост числа нарушений линтера/игноров, `@x` вне entities, жирный shared с доменными словами, десятки фич из одного компонента, споры в каждом PR «куда класть», циклы. Лечение: глоссарий, ревизия границ, pages first, линтер в CI как блокирующий.
</details>

<details><summary>Как организовать Redux/Pinia store в FSD?</summary>

Слайсы стора — в `model` соответствующих entities/features, экспорт селекторов/actions через public API. Сборка `configureStore`/`createPinia` — в `app`. Типы `RootState` — в `app`, а в слайсах — локальные селекторы от своего фрагмента, чтобы не тянуть зависимость вверх. Серверный стейт — лучше TanStack Query/Pinia Colada в `api`.
</details>

## Практика

**Задача 1.** Спроектируйте FSD-дерево для мессенджера (список чатов, окно чата, отправка сообщений с вложениями, статусы онлайн, поиск по сообщениям).
<details><summary>Решение</summary>

`entities`: `user` (аватар, онлайн-статус), `chat` (превью, тип), `message` (баббл, статусы доставки; `@x/chat` для `lastMessage`). `features`: `send-message`, `attach-file`, `search-messages`, `mark-as-read`, `edit-message`. `widgets`: `chat-list` (entity chat + search), `chat-window` (лента message + send-message + attach-file). `pages`: `chats` (layout из двух виджетов), `settings`. `shared/api/ws` — транспорт; подписки на `message:new` — в `entities/message/api`. `app` — провайдеры, WS-подключение при старте, роутинг.
</details>

**Задача 2.** Steiger ругается `insignificant-slice` на `features/catalog-filters`. Что делать?
<details><summary>Решение</summary>

Фича используется только `pages/catalog` → перенести в `pages/catalog/ui|model`. Если планируется переиспользование (фильтры в поиске) — подавить правило осознанно или дождаться второго использования (YAGNI).
</details>

**Задача 3.** Напишите правило `no-restricted-imports`, запрещающее sidestep public API.
<details><summary>Решение</summary>

```js
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['@/{pages,widgets,features,entities}/*/**'],
      message: 'Импортируйте через public API слайса (@/layer/slice)',
    }],
  }],
}
```
`@x` нужно разрешить отдельным исключением (`!@/entities/*/@x/*`).
</details>

## Источники
- https://feature-sliced.design/docs/guides/migration/from-custom
- https://feature-sliced.design/docs/guides/tech/with-nextjs
- https://feature-sliced.design/docs/guides/tech/with-nuxtjs
- https://feature-sliced.design/docs/reference/public-api
- https://github.com/feature-sliced/steiger
- https://github.com/javierbrea/eslint-plugin-boundaries
- https://nuxt.com/docs/api/nuxt-config
- https://nextjs.org/docs/app/getting-started/project-structure
