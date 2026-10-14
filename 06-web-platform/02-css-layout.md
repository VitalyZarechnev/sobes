# CSS: каскад, раскладка, архитектуры

> ⏱ ~5 ч · 🎯 Senior/lead объясняет каскад и специфичность с учётом `@layer`, диагностирует проблемы z-index через stacking context, выбирает flex/grid/container queries осознанно и аргументирует выбор CSS-архитектуры для команды (runtime CSS-in-JS vs zero-runtime vs Tailwind).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу посчитать специфичность любого селектора, включая `:is/:where/:not/:has`
- [ ] Знаю все триггеры stacking context и BFC
- [ ] Сверстал layout на grid с subgrid и компонент на container queries
- [ ] Могу аргументировать выбор CSS-архитектуры в дизайн-системе

## Теория

### Каскад: порядок разрешения конфликтов

Когда несколько деклараций претендуют на одно свойство элемента, побеждает та, что выше по критериям (по порядку):

1. **Origin и важность**: transitions > `!important` UA > `!important` user > `!important` author > animations > обычные author > user > UA. Важные декларации **инвертируют** порядок.
2. **Context** (Shadow DOM: стили light DOM vs shadow tree; у `!important` — инверсия).
3. **Inline-стили** (`style=""`) — отдельный шаг выше селекторов.
4. **Cascade layers** (`@layer`).
5. **Специфичность**.
6. **Порядок появления** (последний выигрывает).

### Специфичность

Тройка (A, B, C): A — id; B — классы, атрибуты, псевдоклассы; C — типы и псевдоэлементы. `*` и комбинаторы — 0.

- `:is()`, `:not()`, `:has()` — специфичность **самого специфичного** аргумента.
- `:where()` — всегда **0**. Идеально для reset/библиотек, которые легко переопределить.
- `!important` не «добавляет специфичность», это другой шаг каскада.

```css
#nav .item a          /* (1,1,1) */
:is(#nav, .menu) a    /* (1,0,1) — берётся максимум: #nav */
:where(#nav, .menu) a /* (0,0,1) */
a:not(.active)        /* (0,1,1) */
```

### @layer — каскадные слои

Слои проверяются **до** специфичности: любое правило в более позднем слое побеждает правило из раннего слоя, даже если у раннего `#id`. Стили **вне слоёв** побеждают все слоёные (для обычных деклараций). Для `!important` порядок инвертируется: важное из **раннего** слоя побеждает.

```css
/* Порядок объявляется один раз — дальше можно наполнять слои в любом порядке */
@layer reset, vendor, base, components, utilities;

@layer vendor { #app .btn { color: gray; } }  /* (1,1,0), но слой ранний */
@layer components { .btn { color: blue; } }   /* выигрывает: слой позже */

/* Подключить сторонний CSS в слой */
@import url("lib.css") layer(vendor);
```

💡 На собеседовании: «`@layer` решает войну специфичности в дизайн-системах: сторонние и базовые стили в нижних слоях, утилиты — в верхнем, и не нужен ни `!important`, ни наращивание селекторов».

### Наследование

Наследуются в основном текстовые свойства (`color`, `font-*`, `line-height`, `visibility`, `cursor`, custom properties). Ключевые слова: `inherit`, `initial` (начальное значение по спеке, не браузерное!), `unset` (inherit для наследуемых, initial для остальных), `revert` (откат к UA/user-стилям), `revert-layer` (откат к предыдущему слою).

🪤 Ловушка: `display: initial` даёт `inline`, а не `block` для `div` — initial значение свойства по спецификации.

### Box model, BFC, margin collapse

`box-sizing: content-box` (по умолчанию: width — только контент) vs `border-box` (width включает padding и border) — почти все проекты ставят `*, *::before, *::after { box-sizing: border-box }`.

**Margin collapse**: вертикальные margin соседних блоков (и родителя с первым/последним ребёнком, если нет border/padding/BFC между ними) схлопываются в максимальный. Не происходит во flex/grid-контейнерах.

**BFC (Block Formatting Context)** — изолированная область раскладки: содержит float-ы (родитель «видит» высоту плавающих детей), не схлопывает margin с детьми, не перекрывается float-ами. Создают: `display: flow-root` (специально для этого), `overflow` не `visible`/`clip`, `float`, `position: absolute/fixed`, `display: inline-block/table-cell`, flex/grid-элементы, `contain: layout/content/paint`, multicol.

### Stacking context и z-index

`z-index` сравнивается **только внутри одного stacking context**. Элемент с `z-index: 9999` внутри контекста с `z-index: 1` никогда не поднимется выше соседа-контекста с `z-index: 2`.

Создают stacking context:
- корень (`html`);
- `position: absolute/relative` + `z-index` не `auto`; `position: fixed/sticky` всегда;
- flex/grid-элемент с `z-index` не `auto`;
- `opacity < 1`, `transform`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask`, `mix-blend-mode` не `normal`;
- `isolation: isolate` (явный и безопасный способ);
- `will-change` с любым из этих свойств; `contain: layout/paint`; `container-type: size/inline-size`;
- элементы в top layer (`<dialog>` модальный, popover, fullscreen) — над всем, вне обычного стека.

Порядок отрисовки внутри контекста: фон/рамки контекста → отрицательные z-index → блочные потомки в потоке → float → inline → `z-index: auto/0` позиционированные → положительные z-index.

💡 На собеседовании: «Модалки и тултипы выношу через portal в конец body или в top layer (`dialog`, Popover API) — это убирает классы багов с z-index и `overflow: hidden` у предков. Для компонентов — `isolation: isolate`, чтобы их внутренние z-index не протекали наружу».

### Позиционирование

`static` / `relative` (смещение без выхода из потока) / `absolute` (относительно ближайшего containing block — позиционированного предка **или предка с transform/filter/contain**) / `fixed` (относительно viewport — **но** ломается, если у предка есть `transform`/`filter`) / `sticky` (липнет в пределах родителя и ближайшего скролл-контейнера; не работает, если у предка `overflow: hidden`).

**Anchor positioning** (`anchor-name`, `position-anchor`, `anchor()`, `position-try`) — нативное позиционирование тултипов/поповеров относительно якоря (Chromium с 125; в 2025–2026 приходит в остальные движки) — заменяет Popper/Floating UI в простых случаях.

### Flex vs Grid

| | Flexbox | Grid |
|---|---|---|
| Измерения | Одно (ось) | Два (строки и колонки) |
| Подход | Content-out: размеры от контента | Layout-in: сетка задаёт место контенту |
| Типично | Тулбары, навигация, выравнивание в строке, «обтекание» тегов | Каркасы страниц, карточные сетки, формы, выравнивание по двум осям |
| Выравнивание между рядами | Нет (каждая строка независима) | Да |

```css
/* Адаптивная сетка карточек без медиазапросов */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 1rem; }

/* subgrid: заголовки/цены карточек выравниваются по общим строкам родителя */
.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
```

🪤 Ловушка flex: `min-width: auto` у flex-элементов — длинный текст/`pre` распирает контейнер; лечится `min-width: 0`. Аналогично `minmax(0, 1fr)` в grid вместо `1fr` (у `1fr` минимум — `auto`).

`flex: 1` = `1 1 0%` (базис ноль — делим всё пространство), `flex: auto` = `1 1 auto` (сначала размер контента, потом делим остаток).

### Современный CSS

**Container queries** — компонент реагирует на размер своего контейнера, а не viewport. Это то, что делает компоненты по-настоящему переиспользуемыми.

```css
.card-wrap { container: card / inline-size; }  /* container-type + container-name */
@container card (min-width: 400px) {
  .card { grid-template-columns: 120px 1fr; }
}
.title { font-size: clamp(1rem, 4cqi, 1.5rem); } /* cqi — 1% inline-размера контейнера */
```

Style queries: `@container style(--variant: compact)` — для custom properties (Chromium/Safari).

**`:has()`** — «родительский» селектор и вообще селектор по отношениям:

```css
.field:has(input:user-invalid) label { color: var(--danger); }
.card:has(> img) { padding-top: 0; }
body:has(dialog[open]) { overflow: hidden; }   /* блокировка скролла без JS */
```

🪤 `:has()` дорог при инвалидации на больших DOM, если якорь широкий (`body:has(...)`) — браузеры оптимизируют, но не злоупотребляйте в горячих местах.

**Nesting** (нативный, Baseline 2023):
```css
.btn {
  color: white;
  &:hover { color: black; }
  .icon & { margin: 0; }          /* & — родитель в любом месте */
  @media (width > 600px) { padding: 1rem; }
}
```
Отличие от Sass: вложенный селектор оборачивается как `:is()` — со специфичностью `:is` (максимум из списка), и нельзя склеивать строки как `&__elem`.

**Custom properties** — живут в DOM, наследуются, меняются в рантайме и из JS (`el.style.setProperty('--x', '1')`), вычисляются на этапе computed value. `@property` регистрирует тип — тогда переменную можно анимировать и она не наследуется, если `inherits: false`.

```css
@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.spin { background: conic-gradient(from var(--angle), red, blue); transition: --angle 1s; }
```

**Логические свойства**: `margin-inline-start`, `padding-block`, `inset-inline-end`, `inline-size` — следуют `writing-mode`/`direction`; RTL-локализация без отдельных стилей.

Ещё: `@scope` (ограничение области стилей сверху и снизу — «donut scope»), `color-mix()`, `oklch()`, `light-dark()`, `text-wrap: balance/pretty`, `field-sizing: content`, view transitions (`view-transition-name`), scroll-driven animations (`animation-timeline: scroll()/view()`).

### Адаптив и responsive images

Mobile-first медиазапросы, range-синтаксис `@media (400px <= width < 800px)`, `prefers-reduced-motion`, `prefers-color-scheme`, `hover`/`pointer` для тач-устройств. Единицы `dvh/svh/lvh` вместо `100vh` на мобильных (адресная строка).

```html
<!-- Разрешение под ширину слота: браузер сам выбирает по DPR и sizes -->
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(min-width: 1024px) 50vw, 100vw"
     width="1600" height="900" alt="..." loading="lazy" decoding="async">

<!-- Art direction и форматы -->
<picture>
  <source media="(max-width: 600px)" srcset="hero-mobile.avif" type="image/avif">
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="..." width="1600" height="900">
</picture>
```

`width`/`height` атрибуты (или `aspect-ratio`) резервируют место → нет CLS. LCP-изображение — **не** `loading="lazy"`, а `fetchpriority="high"`.

### CSS-архитектуры: trade-offs

| Подход | Плюсы | Минусы |
|---|---|---|
| **BEM** | Без инструментов, плоская специфичность, читаемо | Ручная дисциплина, длинные имена, нет гарантий изоляции |
| **CSS Modules** | Изоляция классов на билде, обычный CSS, zero-runtime, кэшируемые файлы | Динамика через классы/переменные, нет типизации из коробки (есть плагины) |
| **Runtime CSS-in-JS** (styled-components, Emotion) | Колокация, пропсы в стилях, темизация | Стоимость в рантайме (сериализация, вставка правил на рендер), проблемы с RSC/streaming SSR, больше JS; styled-components в maintenance mode с 2025 |
| **Zero-runtime CSS-in-JS** (vanilla-extract, Linaria, Panda, StyleX, Pigment CSS) | Типобезопасность, извлечение в статический CSS, совместимы с RSC | Конфигурация билда, динамика только через переменные |
| **Utility-first (Tailwind v4)** | Нет мёртвого CSS (только используемые классы), консистентность токенов, скорость, маленький итоговый CSS | Шумная разметка, нужен абстрактный слой компонентов, порог входа; v4 — CSS-first конфиг, `@theme`, движок Oxide |

💡 На собеседовании: «Для новой дизайн-системы под React Server Components я бы не брал runtime CSS-in-JS: он требует клиентского контекста и добавляет работу на каждый рендер. Выбор — CSS Modules + custom properties для токенов или Tailwind/zero-runtime, с `@layer` для управления приоритетом между системой и продуктом».

### Анимации и производительность

- Анимируйте **`transform` и `opacity`** — они обрабатываются композитором (compositor thread) без layout и paint, не блокируются main thread.
- `width/height/top/left/margin` → layout на каждый кадр; `color/background/box-shadow` → paint.
- `will-change: transform` — заранее создаёт слой; ставить точечно и снимать, иначе память GPU растёт (layer explosion).
- `contain: layout paint` / `content-visibility: auto` + `contain-intrinsic-size` — пропуск рендера внеэкранных секций.
- Уважайте `@media (prefers-reduced-motion: reduce)`.
- Web Animations API (`el.animate()`) — анимации на композиторе, управляемые из JS.

Подробнее о пайплайне — в [03-browser-rendering](03-browser-rendering.md).

## Вопросы с собеседований

<details><summary>Как работает каскад? Что важнее: специфичность или @layer?</summary>

Порядок: origin+importance → context (shadow) → inline-стиль → layers → специфичность → порядок в коде. Слой важнее специфичности: `.a` в позднем слое побеждает `#id .a` в раннем. Неслоёные стили выше всех слоёв. С `!important` порядок слоёв инвертируется — важное из раннего слоя побеждает; это защищает reset/базу от случайных `!important` выше.
</details>

<details><summary>Почему z-index: 9999 не работает?</summary>

z-index сравнивается внутри stacking context. Если предок создаёт контекст (`transform`, `opacity<1`, `filter`, `position`+`z-index`, `will-change`, `isolation`, `contain`), элемент заперт внутри него. Также z-index не действует на `position: static` (кроме flex/grid-детей). Решение — найти предка-контекст (DevTools → Layers / 3D View), поднять его, или вынести элемент в portal/top layer.
</details>

<details><summary>Что такое BFC и где он нужен?</summary>

Изолированный контекст блочной раскладки: содержит float, не схлопывает margin с детьми, не налезает на float. Сегодня нужен реже (flex/grid), но знать надо: `display: flow-root` — чистый способ создать BFC без побочек `overflow: hidden` (обрезка теней и sticky).
</details>

<details><summary>Flex или Grid — как выбираете?</summary>

Flex — одномерный, content-out: размеры элементов от контента, распределение остатка. Grid — двумерный, layout-in: сначала сетка, потом контент. Каркас и выравнивание по двум осям (карточки с одинаковыми строками, формы label/input) — grid (+subgrid). Ряды элементов, тулбары, центрирование — flex. Не взаимоисключающие, вкладываются друг в друга.
</details>

<details><summary>Container queries vs media queries?</summary>

Media — про viewport/устройство (макет страницы, `prefers-*`, `pointer`). Container — про место, которое компоненту дали (карточка в сайдбаре vs в основной колонке). Для дизайн-системы container queries правильнее — компонент не знает, где его разместят. Нужен `container-type: inline-size` у предка (он создаёт containment и stacking context, и размер контейнера не может зависеть от детей по этой оси).
</details>

<details><summary>Runtime CSS-in-JS vs zero-runtime vs Tailwind — ваш выбор для большого продукта?</summary>

Runtime: удобна динамика, но стоимость на рендер (сериализация, инъекция стилей → пересчёт стилей), несовместим с RSC без клиентских обёрток, сложности со streaming SSR. Zero-runtime (vanilla-extract, StyleX, Panda): типы, статический CSS, но строгость билда. Tailwind: маленький итоговый CSS, консистентность токенов, быстрая разработка, но нужна дисциплина и слой компонентов. CSS Modules — надёжный «скучный» выбор. Lead-ответ: решение по критериям — SSR/RSC, перфоманс, команда, миграция, темизация через CSS-переменные — и фиксация в ADR.
</details>

<details><summary>Почему анимировать transform лучше, чем left?</summary>

`left` меняет геометрию → layout → paint → composite каждый кадр на main thread; любой long task даст jank. `transform`/`opacity` применяются на этапе composite в compositor thread над уже растеризованным слоем, могут идти плавно даже при занятом main thread. Цена — память на слой; `will-change` ставить точечно.
</details>

<details><summary>Как :has() и nesting влияют на специфичность?</summary>

`:has(x)` — специфичность аргумента (максимального). Вложенный селектор в нативном nesting эквивалентен `:is(родитель) потомок` — значит, специфичность родительского списка берётся по максимуму: `#a, .b { & span {} }` даёт (1,0,1) для обоих вариантов. Это отличие от Sass, который раскрывает в два отдельных селектора.
</details>

<details><summary>Что дают custom properties по сравнению с переменными Sass?</summary>

Sass-переменные исчезают на компиляции. Custom properties живут в рантайме: каскадируются и наследуются (тема на поддереве), меняются из JS и медиазапросами, читаются через `getComputedStyle`. Через `@property` — типизация, анимируемость, контроль наследования. Основа токенов дизайн-системы и темизации (light/dark) без пересборки.
</details>

<details><summary>Как сделать адаптивные изображения без CLS и с хорошим LCP?</summary>

`srcset` с `w`-дескрипторами + точный `sizes`, современные форматы через `<picture>` (AVIF/WebP), `width`/`height` для резервирования места. Для LCP-картинки — не ленить, `fetchpriority="high"`, при необходимости `<link rel="preload" imagesrcset>`; ниже первого экрана — `loading="lazy"`. CDN с ресайзом на лету.
</details>

## Практика

**Задача 1.** Какой цвет у ссылки?
```css
@layer base, theme;
@layer theme { a { color: green; } }
@layer base { #main a.link { color: red; } }
a { color: blue; }
```
<details><summary>Решение</summary>

`blue`. Неслоёные стили побеждают любые слоёные. Если убрать последнее правило — `green`: слой `theme` объявлен позже `base`, и это важнее специфичности `(1,1,1)`.
</details>

**Задача 2.** Тултип внутри `.card { transform: translateZ(0); overflow: hidden }` обрезается и уходит под соседнюю карточку с `z-index: 1`, хотя у тултипа `position: fixed; z-index: 1000`. Почему и как починить?
<details><summary>Решение</summary>

`transform` у предка: (1) создаёт stacking context — z-index тултипа работает только внутри карточки; (2) становится containing block для `fixed`, поэтому `fixed` ведёт себя как `absolute` и обрезается `overflow: hidden`. Решение: портал в `body`, Popover API (`popover` атрибут → top layer) или anchor positioning; убрать лишний `transform` (часто ставят «для GPU» без нужды).
</details>

**Задача 3.** Сверстайте карточку, у которой при ширине контейнера ≥ 480px картинка слева, иначе сверху, а если картинки нет — без отступа под неё. Без JS и медиазапросов.
<details><summary>Решение</summary>

```css
.card-host { container-type: inline-size; }
.card { display: grid; gap: 1rem; }
@container (min-width: 480px) {
  .card:has(> img) { grid-template-columns: 160px 1fr; }
}
.card > img { inline-size: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
```
</details>

## Источники
- https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade
- https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- https://developer.mozilla.org/en-US/docs/Web/CSS/:has
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
- https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images
- https://web.dev/learn/css
- https://css-tricks.com/snippets/css/complete-guide-grid/
- https://learn.javascript.ru/styles-and-classes
