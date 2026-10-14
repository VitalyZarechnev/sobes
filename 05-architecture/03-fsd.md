# Feature-Sliced Design: теория

> ⏱ ~5 ч · 🎯 Свободно объяснять слои, слайсы, сегменты и правило импортов; аргументированно разводить feature / entity / widget; знать public API, `@x`-нотацию и подход «pages first» из FSD 2.1.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Называю 6 актуальных слоёв по порядку и знаю, почему `processes` deprecated
- [ ] Понимаю, почему у `app` и `shared` нет слайсов
- [ ] Могу объяснить public API и правило «не импортировать мимо index»
- [ ] Знаю, что такое `@x` и когда кросс-импорт допустим
- [ ] Уверенно отличаю feature от entity и widget

## Теория

### Зачем FSD

Feature-Sliced Design — методология организации фронтенд-кода. Решает проблемы папок «по типам» (`components/`, `hooks/`, `services/`, `utils/`): низкая cohesion (фича размазана по 5 папкам), неявные связи, «всё импортирует всё», невозможно понять границы и удалить фичу.

Три уровня иерархии:

```
Layer (слой)  →  Slice (слайс)  →  Segment (сегмент)
features/        auth-by-email/     ui/ model/ api/ lib/ config/
```

- **Слои** — стандартизированы, горизонтальная нарезка по уровню ответственности и знания о бизнесе.
- **Слайсы** — вертикальная нарезка по бизнес-домену; названия не стандартизированы (определяет бизнес).
- **Сегменты** — нарезка по техническому назначению кода внутри слайса.

### Слои (сверху вниз)

| Слой | Ответственность | Слайсы? | Пример |
|---|---|---|---|
| **app** | Всё, что запускает приложение: провайдеры, роутер, глобальные стили, инициализация, composition root | нет, только сегменты | `app/providers`, `app/routes`, `app/styles` |
| ~~processes~~ | Сценарии через несколько страниц. **Deprecated** — переносить в `features`/`app` | — | — |
| **pages** | Полные страницы или крупные части страницы при вложенном роутинге | да | `pages/product`, `pages/checkout` |
| **widgets** | Крупные самодостаточные блоки UI, реализующие законченный юзкейс | да | `widgets/header`, `widgets/product-reviews` |
| **features** | Переиспользуемые реализации **действий пользователя**, приносящих бизнес-ценность | да | `features/add-to-cart`, `features/auth-by-phone` |
| **entities** | **Бизнес-сущности**, с которыми работает проект | да | `entities/user`, `entities/product`, `entities/order` |
| **shared** | Переиспользуемое, не привязанное к бизнесу: UI-kit, api-клиент, утилиты, конфиг | нет, только сегменты | `shared/ui`, `shared/api`, `shared/lib`, `shared/config` |

Слои необязательны все сразу: маленькому проекту хватит `app`, `pages`, `shared`, остальные добавляются по мере появления переиспользования.

**Почему `processes` deprecated.** Слой для межстраничных сценариев (онбординг, многошаговый checkout) на практике либо пустовал, либо становился свалкой. Его роль закрывают `app` (глобальная оркестрация, guards) и `features`/`widgets` (сценарий), а маршрутизация — роутер.

**Почему у `app` и `shared` нет слайсов.** `shared` по определению не содержит бизнес-доменов — делить его по бизнесу нечем, поэтому сразу сегменты (`shared/ui/button` — это уже внутренняя структура сегмента `ui`). `app` — единственный экземпляр приложения, его части тесно связаны. Как следствие, внутри `app` и внутри `shared` сегменты могут свободно импортировать друг друга.

### Правило импортов слоёв

> Модуль (файл) в слайсе может импортировать другие слайсы только если они расположены на слоях **строго ниже**.

```
app → pages → widgets → features → entities → shared
```

- `features/add-to-cart` → `entities/product` ✅
- `features/add-to-cart` → `features/auth` ❌ (тот же слой)
- `entities/product` → `features/add-to-cart` ❌ (выше)
- Внутри одного слайса — относительные импорты свободно.

Это даёт ацикличный граф (ADP), предсказуемость влияния изменений («поменял entity — смотри вверх») и изолированность слайсов одного слоя (можно удалить фичу целиком).

🪤 Ловушка: правило «нельзя импортировать соседний слайс» — главная боль. Решения: поднять композицию на слой выше (страница/виджет склеивает две фичи через пропсы/слоты), опустить общее вниз (в entity или shared), для entities — `@x`.

### Слайсы

- Группируют код по смыслу для бизнеса (`user`, `cart`, `post-feed`).
- Должны иметь **высокую cohesion** и **низкий coupling**: слайс самодостаточен, знает о соседях минимум.
- Могут группироваться в папки на `features`/`widgets`/`entities` — например, `features/post/{like,comment,share}` — но между слайсами в группе нет общего кода (общий код — опускать ниже).
- FSD 2.1 рекомендует **не создавать слайс заранее**: код, используемый одной страницей, остаётся в этой странице.

### Сегменты

| Сегмент | Назначение |
|---|---|
| `ui` | Компоненты, форматтеры отображения, стили |
| `api` | Запросы к бэкенду, типы запросов/ответов, мапперы |
| `model` | Модель данных: схемы, типы, стор, бизнес-логика |
| `lib` | Библиотечный код, нужный другим модулям этого слайса |
| `config` | Конфигурация, фича-флаги |

Сегменты именуются **по назначению (what for), а не по сущности (what is)**: `components/`, `hooks/`, `types/`, `utils/` — антипаттерн, потому что они не говорят, *зачем* код. Свои сегменты разрешены (`shared/i18n`, `shared/routes`, `app/providers`).

### Public API

Каждый слайс (и каждый сегмент в `shared`/`app`) экспортирует наружу только через **public API** — обычно `index.ts`. Импорты извне — только через него.

```ts
// entities/user/index.ts
export { UserAvatar } from './ui/UserAvatar';
export { UserCard } from './ui/UserCard';
export { useCurrentUser, userQueries } from './model/queries';
export type { User, UserRole } from './model/types';
// Внутренности (мапперы, сторы, вспомогательные компоненты) — НЕ экспортируются
```

```ts
// ✅
import { UserAvatar, type User } from '@/entities/user';
// ❌ public API sidestep — завязка на внутреннюю структуру
import { UserAvatar } from '@/entities/user/ui/UserAvatar';
```

Хороший public API: защищает от рефакторинга внутренностей, явно показывает контракт, позволяет менять реализацию. Рекомендация FSD — **явные именованные re-export'ы**, а не `export * from`, чтобы контракт был виден и случайно не утекало лишнее.

Нюансы:
- **Циклы внутри слайса**: если внутренний файл импортирует свой же `index.ts`, легко получить цикл. Внутри слайса — только относительные импорты к конкретным файлам.
- **Tree-shaking и большие barrel-файлы**: `shared/ui/index.ts` на 100 компонентов замедляет dev-сервер/тесты и может мешать tree-shaking при side effects. FSD рекомендует для `shared/ui` и `shared/lib` отдельный index **на каждый компонент/библиотеку**: `@/shared/ui/button`, `@/shared/ui/modal`.
- **Code splitting**: public API не мешает `lazy()` на уровне страниц.

### Cross-imports и `@x`-нотация

Сущности реально связаны: у `Order` есть `User`, у `Song` — `Artist`. Если `entities/order` нужен тип из `entities/user`, это импорт в пределах одного слоя — нарушение. Вариантов три:

1. **Объединить сущности**, если они неразделимы.
2. **Поднять связь выше**: entity принимает данные/слот, а сшивает их widget/page.
3. **`@x`-нотация** — явный «публичный API для конкретного соседа»:

```
entities/
├── artist/
│   ├── @x/
│   │   └── song.ts      # API артиста СПЕЦИАЛЬНО для слайса song
│   ├── model/
│   └── index.ts
└── song/
    └── model/song.ts
```

```ts
// entities/artist/@x/song.ts
export type { Artist } from '../model/artist';

// entities/song/model/song.ts
import type { Artist } from '@/entities/artist/@x/song';

export interface Song { id: string; title: string; artists: Artist[] }
```

Читается как «artist crossed with song». Плюсы: связь явная, видна в дереве файлов, легко найти все кросс-связи (`grep @x`), её минимизируют. Рекомендации: использовать `@x` **только на слое entities** и держать кросс-импорты минимальными (в идеале — только типы).

💡 На собеседовании: «Кросс-импорт — не ошибка, а сигнал о связности. `@x` делает его явным и контролируемым. Если `@x` расползается — значит, неправильно проведены границы сущностей».

### Feature vs Entity vs Widget — главная путаница

**Entity** — *существительное* бизнеса: что это и как выглядит. Данные, их типы, запросы на чтение, отображение (карточка, аватар, строка таблицы). Не знает о действиях пользователя, кроме тривиальных.

**Feature** — *глагол* пользователя, приносящий ценность: добавить в корзину, лайкнуть, авторизоваться, отфильтровать, сменить тему. Обычно содержит интерактив (кнопка/форма) + логику мутации.

**Widget** — *композиция*: крупный самодостаточный блок, собирающий entities и features в законченный юзкейс, переиспользуемый на нескольких страницах (или просто большой блок страницы).

```tsx
// entities/product/ui/ProductCard.tsx — не знает о корзине и избранном,
// но оставляет «слот» для действий
export function ProductCard({ product, actions }: { product: Product; actions?: ReactNode }) {
  return (
    <article>
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
      <Price value={product.price} />
      {actions}
    </article>
  );
}

// features/add-to-cart/ui/AddToCartButton.tsx — действие
export function AddToCartButton({ productId }: { productId: string }) {
  const { mutate, isPending } = useAddToCart();
  return <Button disabled={isPending} onClick={() => mutate(productId)}>В корзину</Button>;
}

// widgets/product-grid/ui/ProductGrid.tsx — композиция entity + features
import { ProductCard, useProducts } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';
import { ToggleFavorite } from '@/features/toggle-favorite';

export function ProductGrid({ categoryId }: { categoryId: string }) {
  const { data = [] } = useProducts(categoryId);
  return data.map(p => (
    <ProductCard key={p.id} product={p}
      actions={<><AddToCartButton productId={p.id} /><ToggleFavorite productId={p.id} /></>} />
  ));
}
```

Паттерн «**слот для действий**» (`actions`, `renderActions`, `children`) — ключевой приём, позволяющий entity не импортировать features.

| Вопрос | Entity | Feature | Widget |
|---|---|---|---|
| Часть речи | существительное | глагол | составной блок |
| Знает о других слайсах | только shared (и `@x` других entities) | entities, shared | features, entities, shared |
| Мутации | редко (чтение, отображение) | да, это основное | делегирует features |
| Пример | `user`, `product`, `comment` | `login`, `add-comment`, `change-locale` | `header`, `comments-section`, `checkout-summary` |

Пограничные случаи:
- **Поиск**: `features/search` (действие пользователя), результаты рендерятся entity-карточками внутри widget/page.
- **«Текущий пользователь» / сессия**: обычно `entities/session` или `entities/user` (данные), а login/logout — `features/auth`.
- **Фильтры каталога**: состояние фильтров + UI — `features/catalog-filters`; если используются на одной странице — оставить в `pages/catalog` (pages first).
- **Корзина**: `entities/cart` (модель, позиции, итог) + `features/add-to-cart`, `features/change-quantity` + `widgets/cart-drawer`.

### FSD 2.1: «pages first»

Ключевое изменение 2.1 — не спешить выносить код в `widgets`/`features`/`entities`. Код, нужный одной странице, живёт в её слайсе (`pages/product/ui`, `pages/product/model`, `pages/product/api`). Выносим вниз, когда появляется реальное переиспользование. Это снижает «паралич выбора слоя» и excessive slicing — самую частую жалобу команд на FSD. Steiger поддерживает это правилом `insignificant-slice` (слайс, используемый в одном месте).

## Вопросы с собеседований

<details><summary>Назовите слои FSD и правило импортов.</summary>

app, (processes — deprecated), pages, widgets, features, entities, shared. Модуль в слайсе может импортировать только слайсы со слоёв строго ниже; соседние слайсы одного слоя — нельзя. `app` и `shared` состоят только из сегментов, внутри них сегменты импортируют друг друга свободно. Результат — DAG и изолированные слайсы.
</details>

<details><summary>Чем feature отличается от entity?</summary>

Entity — бизнес-сущность (существительное): данные, типы, запросы, отображение. Feature — действие пользователя с бизнес-ценностью (глагол): интерактив + мутация. Карточка товара — entity, «добавить в корзину» — feature. Entity не знает о features; связь через слоты, композиция — на уровне выше.
</details>

<details><summary>А widget? Почему не сделать всё фичами?</summary>

Widget — композиционный блок, собирающий несколько features и entities в законченный юзкейс (шапка с поиском, меню пользователя, корзиной). Если бы шапка была feature, она не могла бы импортировать другие features — нарушение. Виджеты нужны именно как слой композиции, когда страница сама не справляется или блок переиспользуется.
</details>

<details><summary>Что такое public API и зачем он?</summary>

Контракт слайса — `index.ts` с явными экспортами. Извне можно импортировать только через него. Даёт свободу рефакторинга внутренностей, явные границы, проверяемость линтером. Нюансы: barrel-файлы и производительность/tree-shaking — для shared отдельный index на компонент; внутри слайса не импортировать свой index (циклы).
</details>

<details><summary>Как быть, если entity order нужен тип из entity user?</summary>

Варианты: вынести связь на уровень выше (виджет склеивает), объединить сущности, или `@x`-нотация: `entities/user/@x/order.ts` экспортирует то, что нужно именно `order`, импорт `@/entities/user/@x/order`. Использовать только в entities, минимизировать, лучше только типы.
</details>

<details><summary>Почему processes deprecated?</summary>

Слой межстраничных сценариев на практике был либо пуст, либо превращался в свалку с неочевидными границами. Логику сценариев лучше держать в features/widgets, а глобальную оркестрацию (guards, инициализация) — в app.
</details>

<details><summary>Почему сегменты нельзя называть components/hooks/types?</summary>

Это группировка по сущности (что это), а не по назначению (зачем). Она не помогает понять, что делает код, и снова размазывает связанный код. Стандартные `ui/model/api/lib/config` описывают роль. Свои сегменты можно, если они названы по цели (`i18n`, `routes`).
</details>

<details><summary>Как FSD соотносится с SOLID/компонентными принципами?</summary>

Слайсы — CCP (что меняется вместе — лежит вместе) и высокая cohesion. Правило слоёв — ADP и SDP (зависимость в сторону стабильности: shared самый стабильный). Public API — ISP и инкапсуляция. Слоты в entities — DIP/OCP.
</details>

<details><summary>Что изменилось в FSD 2.1?</summary>

Подход «pages first»: держать код в страницах, пока нет переиспользования; меньше преждевременной декомпозиции. Плюс обновлённые рекомендации по `@x` и кросс-импортам и официальный линтер Steiger. Мотивация — частая жалоба на excessive slicing и «куда положить».
</details>

<details><summary>Минусы FSD.</summary>

Порог входа и споры «это фича или энтити»; бойлерплейт index-файлов; ограничение на импорты соседей вынуждает поднимать композицию или прокидывать слоты; плохо ложится на file-based routing без адаптации; для маленьких проектов избыточен; нужна дисциплина и линтер. Не решает бизнес-логику внутри слайса — там нужны свои принципы.
</details>

## Практика

**Задача 1.** Найдите нарушения.
```ts
// features/like-post/model/useLike.ts
import { useAuth } from '@/features/auth';
import { PostCard } from '@/widgets/post-feed/ui/PostCard';
import { formatDate } from '@/shared/lib/date/format';
```
<details><summary>Решение</summary>

1. `features → features` (соседний слайс). Решение: текущий пользователь/сессия — в `entities/session` или `entities/user`; авторизация как действие остаётся в `features/auth`.
2. `features → widgets` (вверх) и sidestep public API. PostCard — это entity (`entities/post/ui`).
3. `shared/lib/date/format` — допустимо, если у `shared/lib/date` нет своего index; лучше импортировать `@/shared/lib/date`.
</details>

**Задача 2.** Разложите по слоям: «форма логина», «аватар пользователя», «меню профиля в шапке с кнопкой выхода», «страница настроек», «HTTP-клиент», «провайдер темы».
<details><summary>Решение</summary>

Форма логина — `features/auth` (или `pages/login`, если используется только там). Аватар — `entities/user/ui`. Меню профиля — `widgets/header` (композиция `entities/user` + `features/logout`). Страница настроек — `pages/settings`. HTTP-клиент — `shared/api`. Провайдер темы — `app/providers`; переключатель темы — `features/theme-switcher`; токены темы — `shared/ui` или `shared/config`.
</details>

**Задача 3.** `entities/comment` должна показывать автора (`entities/user`). Предложите 2 решения.
<details><summary>Решение</summary>

(а) Слот: `CommentItem({ comment, author: ReactNode })`, виджет `comments-section` рендерит `<CommentItem author={<UserAvatar user={...} />} />`. (б) `@x`: `entities/user/@x/comment.ts` экспортирует `UserAvatar` и тип `User`. Предпочтительнее (а): entity не связаны, а `@x` оставить для типов в модели (`Comment.author: User`).
</details>

## Источники
- https://feature-sliced.design/docs/get-started/overview
- https://feature-sliced.design/docs/reference/layers
- https://feature-sliced.design/docs/reference/slices-segments
- https://feature-sliced.design/docs/reference/public-api
- https://feature-sliced.design/docs/guides/issues/cross-imports
- https://github.com/feature-sliced/documentation
- https://github.com/feature-sliced/steiger
