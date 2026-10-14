# Новинки CSS 2023–2026

> ⏱ ~2.5 ч · 🎯 Знать современные возможности CSS, которые заменяют JavaScript и препроцессоры, понимать их статус поддержки (Baseline) и уметь решить типовые задачи вёрстки новыми средствами: стили по состоянию дочерних элементов, адаптив компонентов, всплывающие элементы, анимации появления, темы.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [CSS и вёрстка](02-css-layout.md) · [Новинки HTML](09-whats-new-html.md) · [Новинки JS](../01-javascript/15-whats-new.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, что такое Baseline и как проверять поддержку
- [ ] Использую `:has()`, nesting, `@layer`, container queries
- [ ] Знаю `@starting-style` и `transition-behavior` для анимации появления и `display: none`
- [ ] Могу сделать тёмную тему через `light-dark()` и цвета через `oklch()` / `color-mix()`
- [ ] Знаю, что такое anchor positioning, View Transitions и scroll-driven animations, и их статус
- [ ] Знаю экспериментальные новинки (`if()`, `@function`, customizable select) и не путаю их со стабильными

## Теория

### 1. Baseline: как говорить о поддержке

**Baseline** — статус фичи веб-платформы из проекта web-features (его показывают MDN, caniuse, webstatus.dev):

| Статус | Значение | Обозначение ниже |
|---|---|---|
| **Widely available** | поддерживается во всех основных браузерах (Chrome, Edge, Firefox, Safari на десктопе и мобильных) больше 30 месяцев | ✅ |
| **Newly available** | недавно появилась во всех основных браузерах | 🟢 + дата |
| **Limited availability** | есть не во всех основных браузерах | 🟡 (часть браузеров) / 🧪 (только Chromium) |

Статусы ниже — срез по данным webstatus.dev на **13 октября 2026 года**. Перед использованием фичи в проекте проверяйте актуальный статус: поддержка меняется каждый месяц.

💡 На собеседовании: «Я опираюсь на Baseline и `browserslist` проекта. Фичи со статусом Limited использую как прогрессивное улучшение — с `@supports` и запасным вариантом, который работает без них».

### 2. Сводная таблица

| Фича | Статус | Что заменяет |
|---|---|---|
| `@layer` (каскадные слои) | ✅ | войны специфичности, `!important` |
| Container queries (размер) | ✅ | JS-измерения ширины, медиазапросы для компонентов |
| `:has()` | ✅ (с июня 2026) | JS-классы «родитель с выбранным ребёнком» |
| Nesting (вложенность) | ✅ (с июня 2026) | вложенность Sass/Less |
| Subgrid | ✅ (с марта 2026) | ручное выравнивание вложенных сеток |
| `oklch()` / `oklab()`, `color-mix()` | ✅ | функции цвета препроцессоров |
| `:user-valid` / `:user-invalid` | ✅ | JS-флаг «поле трогали» для показа ошибок |
| `text-wrap: balance` | 🟢 2024 | ручные `<br>` в заголовках |
| `light-dark()` | 🟢 2024 | дублирование переменных для тёмной темы |
| `@property` | 🟢 2024 | анимация CSS-переменных через JS |
| `@starting-style`, `transition-behavior` | 🟢 2024 | JS для анимации появления и `display: none` |
| Relative colors | 🟢 2024 | `darken()`/`lighten()` препроцессоров |
| `scrollbar-gutter` | 🟢 2024 | «прыжок» вёрстки при появлении скроллбара |
| `content-visibility` | 🟢 2025 | ручная виртуализация простых списков |
| View Transitions (в пределах документа), `view-transition-class` | 🟢 2025 | JS-анимации смены состояний |
| `@scope` | 🟢 март 2026 | BEM, CSS Modules для изоляции |
| `contrast-color()` | 🟢 2026 | ручной выбор цвета текста на фоне |
| Container style queries | 🟢 май 2026 | классы-модификаторы по значениям переменных |
| `field-sizing: content` | 🟢 июнь 2026 | JS для авто-высоты textarea |
| `sibling-index()`, `sibling-count()` | 🟢 август 2026 | `--i` в инлайн-стилях для задержек анимации |
| Anchor positioning | 🟡 | Popper/Floating UI для тултипов |
| Scroll-driven animations | 🟡 Chromium + Safari | IntersectionObserver и scroll-события |
| Cross-document View Transitions | 🟡 Chromium + Safari | SPA ради анимации переходов между страницами |
| `text-wrap: pretty` | 🟡 Chromium + Safari | |
| `text-box` | 🟡 Chromium + Safari | ручные отступы для выравнивания текста |
| Customizable `<select>` | 🟡 Chromium + Safari | кастомные селекты на JS |
| Typed `attr()` | 🟡 Chromium + Firefox | |
| `if()`, `@function` | 🧪 Chromium | |
| `interpolate-size`, `calc-size()` | 🧪 Chromium | анимация `height: auto` через JS |
| `corner-shape` | 🧪 Chromium | SVG-маски для скошенных углов |
| Scroll-state queries, scroll markers и buttons (карусели) | 🧪 Chromium | JS-карусели, JS для «прилипшего» хедера |

### 3. Селекторы и каскад

**`:has()`** — «родительский селектор»: стилизовать элемент по его содержимому или по следующим соседям.

```css
/* карточка с картинкой — другая раскладка */
.card:has(img) { grid-template-columns: 120px 1fr; }

/* поле с ошибкой подсвечивает свою группу */
.field:has(input:user-invalid) { border-color: var(--danger); }

/* запрет прокрутки страницы, пока открыта модалка */
body:has(dialog[open]) { overflow: hidden; }

/* элемент, за которым идёт заголовок */
p:has(+ h2) { margin-bottom: 2rem; }
```

**Nesting** — вложенность без препроцессора:

```css
.card {
  padding: 1rem;
  & .title { font-weight: 600; }       /* потомок */
  &:hover { box-shadow: var(--shadow); } /* состояние самого элемента */
  @media (width < 600px) { padding: 0.5rem; }
}
```

Отличие от Sass: вложенный селектор не склеивается строкой. `&__title` (BEM-приём из Sass) в нативном CSS не работает.

**`@layer`** — порядок слоёв важнее специфичности: стиль из более позднего слоя побеждает, даже если селектор слабее. Стили вне слоёв побеждают любые слоистые.

```css
@layer reset, vendor, components, utilities;
@import url('ui-kit.css') layer(vendor); /* стили сторонней библиотеки — в низкоприоритетный слой */

@layer components { .btn { color: blue; } }
@layer utilities { .text-red { color: red; } } /* победит .btn, хотя специфичность одинакова */
```

**`@scope`** — ограничить действие стилей поддеревом, с «нижней границей»:

```css
@scope (.card) to (.card-content) {
  img { border-radius: 8px; } /* только картинки внутри .card, но не внутри вложенного .card-content */
}
```

### 4. Раскладка и адаптив компонентов

**Container queries** — компонент адаптируется к ширине **своего контейнера**, а не окна. Это то, что нужно для переиспользуемых компонентов в разных колонках.

```css
.sidebar, .main { container-type: inline-size; }

.product-card { display: grid; gap: 0.5rem; }
@container (width > 400px) {
  .product-card { grid-template-columns: 150px 1fr; }
}

/* Единицы относительно контейнера */
.product-card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }
```

**Container style queries** — условия по значению CSS-переменной контейнера:

```css
.theme-card { --variant: promo; }
@container style(--variant: promo) {
  .badge { display: block; }
}
```

**Subgrid** — вложенная сетка использует дорожки родительской: карточки в ряду выравнивают заголовки, тексты и кнопки по одним линиям.

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); }
.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
```

**`field-sizing: content`** — поле ввода растёт под содержимое:

```css
textarea { field-sizing: content; min-height: 3lh; max-height: 10lh; }
```

**Anchor positioning** — позиционировать элемент относительно другого (тултипы, выпадающие меню) без JS, с автоматическим переворотом при нехватке места:

```css
.trigger { anchor-name: --menu-anchor; }
.menu {
  position: absolute;
  position-anchor: --menu-anchor;
  position-area: bottom span-right;        /* под якорем */
  position-try-fallbacks: flip-block;       /* перевернуть вверх, если не помещается */
}
```

Статус 🟡: базовая функциональность есть в основных движках, но с разной полнотой, поэтому для продакшена нужна проверка и запасной вариант (например, Floating UI).

### 5. Цвета и темы

```css
:root {
  color-scheme: light dark; /* разрешить обе темы, браузер подстроит скроллбары и формы */
  --bg: light-dark(#ffffff, #141413);   /* первое — для светлой, второе — для тёмной */
  --text: light-dark(#1d1d1b, #ecebe6);
  --brand: oklch(62% 0.19 260);          /* перцептивно равномерное пространство: L, C, H */
  --brand-hover: oklch(from var(--brand) calc(l - 0.08) c h); /* relative color: темнее на 8% */
  --brand-soft: color-mix(in oklch, var(--brand) 15%, transparent);
}
.button { background: var(--brand); color: contrast-color(var(--brand)); } /* белый или чёрный текст */
```

Почему `oklch` лучше `hsl`: одинаковое значение светлоты (L) воспринимается одинаково светлым для разных оттенков, поэтому палитры и состояния hover/disabled получаются предсказуемыми. Плюс доступ к широкому цветовому охвату (Display P3).

### 6. Анимации

**`@starting-style` + `transition-behavior: allow-discrete`** — анимация появления элемента и анимация до `display: none` без JavaScript:

```css
.toast {
  transition: opacity 0.3s, translate 0.3s, display 0.3s allow-discrete;
  opacity: 1;
  translate: 0 0;
  @starting-style {         /* стиль «до» первого рендера — с него стартует переход */
    opacity: 0;
    translate: 0 20px;
  }
}
.toast.hidden { display: none; opacity: 0; } /* исчезновение тоже анимируется */

/* то же для popover и dialog */
[popover]:popover-open { opacity: 1; @starting-style { opacity: 0; } }
```

**`@property`** — зарегистрировать тип CSS-переменной, чтобы её можно было анимировать:

```css
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.spinner { background: conic-gradient(from var(--angle), red, blue); animation: spin 2s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

**View Transitions** — плавный переход между двумя состояниями DOM:

```js
document.startViewTransition(() => updateDOM()); // браузер снимает «до», выполняет обновление, анимирует к «после»
```

```css
.card { view-transition-name: card-42; }  /* элемент «перелетает» между состояниями */
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0.3s; }
```

Внутри документа — 🟢 Baseline 2025. Между документами (MPA, `@view-transition { navigation: auto; }`) — 🟡. React 19.3 предоставляет компонент `<ViewTransition>` поверх этого API ([Новинки React](../03-react/11-whats-new.md)).

**Scroll-driven animations** — анимация, привязанная к прокрутке, на композиторе, без JS:

```css
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll(root);     /* прогресс прокрутки страницы */
}
.reveal {
  animation: fade-in linear both;
  animation-timeline: view();            /* видимость элемента во viewport */
  animation-range: entry 0% cover 30%;
}
```

Статус 🟡 (Chromium и Safari) — используйте как прогрессивное улучшение через `@supports (animation-timeline: view())`.

**`interpolate-size: allow-keywords`** (🧪) — анимация к `height: auto`, давняя боль аккордеонов.

### 7. Типографика

```css
h1, h2 { text-wrap: balance; }   /* 🟢 строки заголовка примерно одинаковой длины */
p { text-wrap: pretty; }         /* 🟡 без одинокого слова на последней строке */
.button { text-box: trim-both cap alphabetic; } /* 🟡 убрать «воздух» шрифта сверху и снизу для точного центрирования */
```

### 8. Логика в CSS (экспериментально)

Эти возможности пока есть только в Chromium (🧪), но о них спрашивают как о направлении развития:

```css
/* if(): условие прямо в значении свойства */
.button { padding: if(media(width < 600px): 0.5rem; else: 1rem); }

/* @function: собственные функции */
@function --fluid(--min, --max) {
  result: clamp(var(--min), 2vw + 1rem, var(--max));
}
h1 { font-size: --fluid(1.5rem, 3rem); }
```

`sibling-index()` и `sibling-count()` уже стали Baseline (август 2026) — каскадные задержки без инлайн-переменных:

```css
.list-item { transition-delay: calc((sibling-index() - 1) * 50ms); }
```

### 9. Производительность

**`content-visibility: auto`** — браузер не рендерит (layout и paint) содержимое вне экрана, пока к нему не прокрутят. Для длинных страниц и лент это дешёвая альтернатива виртуализации:

```css
.feed-item { content-visibility: auto; contain-intrinsic-size: auto 300px; } /* оценка высоты, чтобы скроллбар не прыгал */
```

**`scrollbar-gutter: stable`** — резервирует место под скроллбар, чтобы вёрстка не сдвигалась при его появлении (помогает CLS).

## Вопросы с собеседований

<details><summary>Что такое Baseline и как вы решаете, можно ли использовать новую CSS-фичу?</summary>

Baseline — статус из проекта web-features: Widely available (во всех основных браузерах больше 30 месяцев), Newly available (недавно во всех), Limited (не во всех). Решение: сверить статус и целевые браузеры проекта (`browserslist`, аналитика). Limited-фичи — только как прогрессивное улучшение через `@supports` с работающим запасным вариантом. Для синтаксиса (nesting) может помочь PostCSS.
</details>

<details><summary>Что можно сделать с помощью :has()?</summary>

Стилизовать элемент по его содержимому или по следующим соседям: карточка с картинкой, группа поля с невалидным инпутом, блокировка прокрутки при открытом `dialog`, форма с отмеченным чекбоксом. Раньше это требовало JS-классов. С июня 2026 — Baseline Widely available. Сложные `:has()` на больших DOM могут быть дорогими для пересчёта стилей.
</details>

<details><summary>Чем container queries лучше медиазапросов?</summary>

Медиазапросы реагируют на размер окна, а компонент может стоять и в узкой боковой колонке, и в широкой основной. Container queries реагируют на размер контейнера, поэтому компонент адаптивен сам по себе и переиспользуем. Дополнительно есть единицы `cqi`/`cqw` и style queries по значениям переменных.
</details>

<details><summary>Как работают каскадные слои?</summary>

`@layer` задаёт порядок слоёв, и при конфликте побеждает правило из более позднего слоя независимо от специфичности. Стили вне слоёв побеждают все слоистые (для `!important` порядок обратный). Типичная схема: `reset, vendor, components, utilities`, сторонние стили — в низкий слой через `@import ... layer(vendor)`. Это убирает войны специфичности и `!important`.
</details>

<details><summary>Как анимировать появление элемента и скрытие с display: none без JS?</summary>

`@starting-style` задаёт стиль, с которого начинается переход при первом рендере или появлении элемента. `transition-behavior: allow-discrete` (или `allow-discrete` в `transition`) разрешает «переход» дискретных свойств вроде `display` и `overlay`: браузер переключит `display` в конце анимации исчезновения. Так анимируют тосты, `popover` и `dialog`. Обе фичи — Baseline с 2024 года.
</details>

<details><summary>Зачем нужен oklch, если есть hsl и hex?</summary>

`oklch` — перцептивно равномерное пространство: одинаковая светлота L воспринимается одинаково для разных оттенков, поэтому палитры и состояния предсказуемы, а контраст проще контролировать. Он поддерживает широкий цветовой охват (P3). Вместе с relative color syntax (`oklch(from var(--brand) calc(l - 0.1) c h)`) и `color-mix()` заменяет функции цвета препроцессоров.
</details>

<details><summary>Что такое View Transitions API?</summary>

API плавного перехода между состояниями DOM: `document.startViewTransition(update)` делает снимок «до», выполняет обновление и анимирует к «после»; элементы с одинаковым `view-transition-name` «перелетают». Внутри документа — Baseline 2025, между страницами (MPA) — пока не во всех браузерах. Нужно уважать `prefers-reduced-motion`.
</details>

<details><summary>Что такое anchor positioning и можно ли им уже пользоваться?</summary>

Позиционирование элемента относительно произвольного «якоря» средствами CSS: `anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks` для переворота при нехватке места. Заменяет Popper/Floating UI для тултипов и меню. Статус Limited: поддержка в движках разной полноты, поэтому в продакшене — с запасным вариантом или библиотекой.
</details>

<details><summary>Как ускорить рендеринг длинной страницы средствами CSS?</summary>

`content-visibility: auto` с `contain-intrinsic-size` — браузер пропускает layout и paint для блоков вне экрана. Также `contain` для изоляции пересчётов, анимации только `transform` и `opacity`, `will-change` точечно. `scrollbar-gutter: stable` и явные размеры медиа снижают CLS.
</details>

## Практика

### Предскажите результат

**1.**
```css
@layer base, theme;
@layer theme { a { color: green; } }
@layer base { #nav a.link { color: red; } }
a { color: blue; }
```
Какой цвет у `<a id="x" class="link">` внутри `#nav`?

<details><summary>Ответ</summary>

Синий.
</details>
<details><summary>Почему так</summary>

Стили вне слоёв побеждают любые стили в слоях, независимо от специфичности. Если бы последнего правила не было — победил бы зелёный: слой `theme` объявлен позже `base`, и специфичность между слоями не сравнивается.
</details>

**2.**
```css
.list { container-type: inline-size; width: 300px; }
@media (width > 1000px) { .item { color: red; } }
@container (width > 500px) { .item { color: blue; } }
```
Окно шириной 1200px. Какой цвет у `.item` внутри `.list`?

<details><summary>Ответ</summary>

Красный.
</details>
<details><summary>Почему так</summary>

Медиазапрос смотрит на окно (1200px > 1000px — срабатывает), container query — на контейнер (300px — не срабатывает).
</details>

### Задачи

**1. Тултип и анимация появления без JS.**

Сделайте всплывающую подсказку к кнопке через `popover`, которая плавно появляется (opacity и сдвиг) и плавно исчезает. Позиционирование — через anchor positioning с запасным вариантом.

<details><summary>Решение</summary>

```html
<button popovertarget="tip" class="trigger">?</button>
<div id="tip" popover>Подсказка</div>
```

```css
.trigger { anchor-name: --tip; }

#tip {
  margin: 0;
  /* запасной вариант: фиксированная позиция, если anchor positioning не поддержан */
  inset: auto auto 1rem 1rem;
  opacity: 0;
  translate: 0 6px;
  transition: opacity 0.2s, translate 0.2s, display 0.2s allow-discrete, overlay 0.2s allow-discrete;
}

#tip:popover-open {
  opacity: 1;
  translate: 0 0;
  @starting-style { opacity: 0; translate: 0 6px; }
}

@supports (position-anchor: --tip) {
  #tip {
    position-anchor: --tip;
    position-area: top;
    position-try-fallbacks: flip-block;
    inset: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  #tip { transition: none; }
}
```

`popover` даёт показ и скрытие, закрытие по Escape и клику снаружи, верхний слой (top layer) без `z-index`. `overlay` с `allow-discrete` удерживает элемент в верхнем слое до конца анимации исчезновения.
</details>

**2. Тема без дублирования переменных.**

Перепишите тему без двух наборов переменных (`:root` и `[data-theme='dark']`) и без медиазапроса, используя `light-dark()`. Сохраните возможность принудительно выбрать тему переключателем.

<details><summary>Решение</summary>

```css
:root {
  color-scheme: light dark;   /* по умолчанию — как в системе */
  --bg: light-dark(#fff, #141413);
  --text: light-dark(#1d1d1b, #ecebe6);
  --accent: light-dark(oklch(55% 0.2 260), oklch(75% 0.15 260));
}
:root[data-theme='light'] { color-scheme: light; } /* принудительно светлая */
:root[data-theme='dark'] { color-scheme: dark; }   /* принудительно тёмная */

body { background: var(--bg); color: var(--text); }
```

`light-dark()` выбирает значение по вычисленному `color-scheme` элемента, поэтому переключатель меняет одно свойство, а не весь набор переменных.
</details>

## Источники
- [webstatus.dev](https://webstatus.dev/) — статусы Baseline
- [web.dev — Baseline](https://web.dev/baseline)
- [MDN — CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Chrome — CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/)
- [MDN — :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN — @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [MDN — CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
