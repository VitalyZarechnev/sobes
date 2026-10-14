# HTML-семантика и доступность (a11y)

> ⏱ ~4 ч · 🎯 Senior/lead выбирает нативную семантику вместо div-супа, умеет сделать доступный кастомный виджет (диалог, комбобокс, табы) по APG, знает WCAG 2.2 AA и встраивает a11y в процесс (линтеры, тесты, ревью).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Прошёл свою страницу только клавиатурой (Tab/Shift+Tab/Enter/Space/Esc/стрелки)
- [ ] Прослушал страницу скринридером (VoiceOver: Cmd+F5 / NVDA)
- [ ] Посмотрел Accessibility tree в DevTools (Elements → Accessibility)
- [ ] Разобрал паттерны Dialog, Tabs, Combobox в APG

## Теория

### Семантические теги и зачем они

Семантика — это контракт с тремя потребителями: **дерево доступности** (accessibility tree, его читают скринридеры), **поисковики** и **браузер** (Reader Mode, автозаполнение, поведение по умолчанию).

| Тег | Неявная роль (implicit ARIA role) | Замечание |
|---|---|---|
| `<header>` | `banner` — только если не вложен в `article/section/main/nav/aside` | Иначе — generic |
| `<nav>` | `navigation` | Несколько nav — различайте через `aria-label` |
| `<main>` | `main` | Один видимый на странице |
| `<aside>` | `complementary` | |
| `<footer>` | `contentinfo` — на верхнем уровне | |
| `<section>` | `region` — **только при наличии accessible name** | Без имени — generic |
| `<article>` | `article` | Самодостаточный контент (пост, карточка) |
| `<button>` | `button` | Фокус, Enter/Space, `disabled`, submit в форме — бесплатно |
| `<a href>` | `link` | Без `href` — не ссылка и не фокусируется |
| `<dialog>` | `dialog` | `showModal()` даёт inert-фон, Esc, top layer |

**Document outline.** Алгоритм outline из HTML5 (когда `<h1>` внутри `<section>` «понижается») **никогда не был реализован** браузерами и скринридерами и удалён из спецификации. Практическое правило: иерархия задаётся только уровнями `h1–h6`, не пропускайте уровни, один `h1` на страницу — разумная конвенция. Скринридеры навигируют по заголовкам (клавиша H в NVDA) и по ландмаркам — это главный способ «просканировать» страницу.

🪤 Ловушка: `<div onclick>` вместо `<button>` — нет фокуса, нет роли, нет активации с клавиатуры, нет `disabled`. Чтобы повторить кнопку руками, нужны `role="button"`, `tabindex="0"`, обработчики Enter (на keydown) и Space (на keyup). Дешевле взять `<button type="button">`.

### Формы и валидация

```html
<form novalidate>
  <!-- label связан с input через for/id: клик по label фокусирует поле, имя попадает в a11y tree -->
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required
         autocomplete="email" inputmode="email"
         aria-describedby="email-hint email-error" aria-invalid="false">
  <p id="email-hint">Рабочая почта</p>
  <p id="email-error" role="alert" hidden></p>

  <fieldset>
    <legend>Способ доставки</legend> <!-- группа радио получает общее имя -->
    <label><input type="radio" name="d" value="courier"> Курьер</label>
    <label><input type="radio" name="d" value="pickup"> Самовывоз</label>
  </fieldset>
  <button>Отправить</button> <!-- type="submit" по умолчанию внутри form -->
</form>
```

Constraint Validation API: `required`, `pattern`, `min/max`, `type=email` → `input.validity` (`valueMissing`, `typeMismatch`...), `checkValidity()`, `reportValidity()`, `setCustomValidity(msg)`. Псевдоклассы `:invalid` срабатывают сразу — используйте `:user-invalid` (после взаимодействия пользователя, поддерживается во всех современных браузерах).

Нативные пузыри валидации плохо стилизуются и не везде объявляются скринридером, поэтому в продакшене часто: `novalidate` + своя валидация, но **с теми же атрибутами** (`required`, `type`) для семантики, `aria-invalid="true"`, `aria-describedby` на текст ошибки, фокус на первое невалидное поле при сабмите.

💡 На собеседовании: «Валидацию на клиенте делаю для UX, на сервере — для безопасности. Ошибки привязываю через `aria-describedby`, при сабмите переношу фокус на первое ошибочное поле или на сводку ошибок со ссылками».

`autocomplete` (`email`, `current-password`, `new-password`, `one-time-code`, `street-address`) — это и UX, и критерий WCAG 1.3.5 Identify Input Purpose.

### WCAG 2.2: принципы и уровни

POUR: **Perceivable**, **Operable**, **Understandable**, **Robust**. Уровни: **A** (минимум), **AA** (целевой — его требуют законы: European Accessibility Act с июня 2025, ADA-иски в США, Section 508), **AAA** (не требуется целиком).

Что важно знать из 2.2 (октябрь 2023) — новые критерии:
- **2.4.11 Focus Not Obscured (AA)** — фокусированный элемент не должен быть полностью перекрыт sticky-хедером/куки-баннером. Лечится `scroll-padding-top`.
- **2.5.7 Dragging Movements (AA)** — у любого drag-n-drop должна быть альтернатива без перетаскивания (кнопки «вверх/вниз»).
- **2.5.8 Target Size (Minimum) (AA)** — цель не меньше 24×24 CSS px (или достаточный отступ).
- **3.3.7 Redundant Entry (A)**, **3.3.8 Accessible Authentication (AA)** — не заставлять решать когнитивные тесты; разрешить вставку пароля и менеджеры паролей.
- 4.1.1 Parsing удалён как устаревший.

Классика AA: контраст текста 4.5:1 (крупного — 3:1), контраст UI-компонентов и фокус-индикатора 3:1 (1.4.11), reflow до 320px без горизонтального скролла (1.4.10), всё доступно с клавиатуры (2.1.1), нет ловушек фокуса (2.1.2), видимый фокус (2.4.7), осмысленный порядок фокуса (2.4.3), статусные сообщения объявляются (4.1.3).

### ARIA: правила, роли, состояния

**Первое правило ARIA**: если есть нативный HTML-элемент с нужной семантикой и поведением — используйте его, а не ARIA. «No ARIA is better than bad ARIA»: по данным WebAIM Million страницы с ARIA в среднем имеют больше ошибок, чем без.

Остальные правила: не меняйте нативную семантику без нужды (`<h2 role="tab">` — плохо); все интерактивные ARIA-элементы должны работать с клавиатуры; не ставьте `role="presentation"`/`aria-hidden="true"` на фокусируемые элементы; у интерактивного элемента должно быть accessible name.

ARIA меняет **только дерево доступности** — не поведение. `role="button"` не делает элемент фокусируемым и не добавляет обработку клавиш.

Категории атрибутов:
- **Роли**: виджеты (`tab`, `tabpanel`, `combobox`, `listbox`, `option`, `menu`, `switch`), структура, ландмарки, live regions (`status`, `alert`, `log`).
- **Состояния** (меняются часто): `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`, `aria-invalid`, `aria-current`, `aria-busy`.
- **Свойства**: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-haspopup`, `aria-live`, `aria-modal`, `aria-activedescendant`.

### Accessible name — как вычисляется

Упрощённый порядок (спецификация accname):
1. `aria-labelledby` (может ссылаться на скрытые элементы, на несколько id, конкатенируется) — побеждает всё.
2. `aria-label`.
3. Нативное: `<label>` для полей, `alt` для `img`, `<caption>` для таблицы, `<legend>` для fieldset.
4. Содержимое (name from content) — для ролей `button`, `link`, `heading`, `tab` и т.п.
5. `title` / `placeholder` — последний шанс, ненадёжно.

```html
<!-- Иконка-кнопка: без имени скринридер скажет просто "кнопка" -->
<button type="button" aria-label="Закрыть">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Визуально скрытый текст лучше aria-label: переводится автопереводчиками -->
<button type="button"><svg aria-hidden="true">...</svg><span class="visually-hidden">Закрыть</span></button>
```

```css
/* Скрыть визуально, но оставить в a11y tree. display:none и visibility:hidden убирают из дерева */
.visually-hidden {
  position: absolute !important; width: 1px; height: 1px;
  margin: -1px; padding: 0; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; border: 0;
}
```

🪤 Ловушка: `aria-label` на `<div>` без роли игнорируется многими скринридерами (у generic-роли имя запрещено). 🪤 `placeholder` вместо `label` — исчезает при вводе, низкий контраст, не всегда даёт имя.

### Фокус-менеджмент и клавиатура

- `tabindex="0"` — включить в естественный порядок; `tabindex="-1"` — фокусируемый программно, но не по Tab; положительный `tabindex` — антипаттерн (ломает порядок).
- `:focus-visible` — показывать кольцо фокуса только при клавиатурной навигации; **никогда** `outline: none` без замены.
- **Roving tabindex** для составных виджетов (табы, тулбар, меню, грид): в группе один элемент с `tabindex=0`, остальные `-1`; Tab входит/выходит из группы, стрелки двигают внутри. Альтернатива — `aria-activedescendant` (фокус остаётся на контейнере/инпуте, актуально для комбобокса).
- **SPA-навигация**: при смене роута фокус остаётся на нажатой ссылке, которая уже исчезла → переносите фокус на `h1` новой страницы (`tabindex="-1"`) и/или объявляйте смену через live region. Next.js/Angular делают route announcer.
- **Модальные окна**: фокус внутрь при открытии, ловушка фокуса (focus trap), Esc закрывает, фокус возвращается на триггер, фон инертен. Нативный `<dialog>.showModal()` даёт почти всё из коробки; для фона есть атрибут `inert`.
- **Skip link** — первая ссылка «Перейти к содержимому» → `#main`.

```ts
// Минимальный доступный модальный диалог на нативном <dialog>
function openDialog(dialog: HTMLDialogElement, trigger: HTMLElement) {
  dialog.showModal();                    // top layer, фон inert, Esc → событие cancel
  dialog.querySelector<HTMLElement>('[autofocus], button')?.focus();
  dialog.addEventListener('close', () => trigger.focus(), { once: true }); // вернуть фокус
}
```

### Live regions и скринридеры

`aria-live="polite"` (дождаться паузы) / `"assertive"` (перебить). `role="status"` = polite, `role="alert"` = assertive. Регион должен **существовать в DOM до изменения** — вставка элемента сразу с текстом часто не объявляется. Используйте для «Добавлено в корзину», результатов поиска, ошибок сабмита.

Основные связки: NVDA/JAWS + Chrome/Firefox (Windows), VoiceOver + Safari (macOS/iOS), TalkBack + Chrome (Android). Поведение отличается — тестировать на нескольких.

### Процесс (то, что ждут от lead)

- Линт: `eslint-plugin-jsx-a11y` / `eslint-plugin-vuejs-accessibility`.
- Автотесты: `axe-core` (`@axe-core/playwright`, `jest-axe`), Testing Library с запросами `getByRole(name)` — тесты заодно проверяют семантику.
- Автоматика ловит ~30–40% проблем; остальное — ручной аудит клавиатурой и скринридером.
- Дизайн-система: доступность закладывается в базовые компоненты (Radix, React Aria, Headless UI) — один раз правильно, везде правильно.
- Definition of Done включает a11y-чек.

### SEO-аспекты и микроразметка

- `<title>`, `<meta name="description">`, `<link rel="canonical">`, `hreflang`, `robots`.
- Семантика и заголовки помогают понять структуру; ссылки — настоящие `<a href>` (краулер не нажимает на `div onclick`).
- CSR-контент Google индексирует (рендерит отложенно), но другие боты и превью соцсетей (Open Graph) — нет → SSR/SSG для публичных страниц.
- Core Web Vitals — фактор ранжирования (page experience).
- **Микроразметка** schema.org в JSON-LD — предпочтительный Google формат; даёт rich results (рейтинги, цены, FAQ, хлебные крошки):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Кофемашина X",
  "offers": { "@type": "Offer", "price": "49990", "priceCurrency": "RUB" }
}
</script>
```

## Вопросы с собеседований

<details><summary>Что такое первое правило ARIA и почему «no ARIA лучше плохой ARIA»?</summary>

Если есть нативный элемент с нужной семантикой и поведением — используйте его. ARIA меняет только то, что видит a11y tree, но не даёт фокус, клавиатуру, состояния формы. Неверная роль хуже её отсутствия: скринридер пообещает «вкладку» или «меню» с определённой клавиатурной моделью, а она не работает. Для senior: упомяните, что ARIA нужна там, где нативных элементов нет (табы, комбобокс, tree, live regions), и что паттерны берутся из APG.
</details>

<details><summary>Как вычисляется accessible name? Чем aria-labelledby отличается от aria-label?</summary>

Приоритет: `aria-labelledby` → `aria-label` → нативный механизм (`label`, `alt`, `legend`, `caption`) → содержимое (для кнопок, ссылок, заголовков) → `title`/`placeholder`. `labelledby` ссылается на видимый текст по id (может несколько, может на скрытые элементы), что предпочтительнее — текст один для зрячих и незрячих и переводится. `aria-label` — невидимая строка, не переводится автопереводчиком браузера. Проверка — вкладка Accessibility в DevTools, поле Name.
</details>

<details><summary>Как сделать доступное модальное окно?</summary>

`role="dialog"` + `aria-modal="true"` + имя через `aria-labelledby` на заголовок; при открытии фокус внутрь (на первый интерактив или заголовок), focus trap, Esc закрывает, фон недоступен (`inert` или `aria-hidden` на siblings), после закрытия фокус на триггер, скролл фона заблокирован. Сегодня — нативный `<dialog>` с `showModal()`: top layer (без войны z-index), inert-фон и Esc из коробки; вручную — возврат фокуса и закрытие по клику на backdrop.
</details>

<details><summary>Что нового в WCAG 2.2 и какой уровень целевой?</summary>

Целевой — AA (его требуют EAA в ЕС, суды по ADA, Section 508). В 2.2 добавлены: Focus Not Obscured (sticky-элементы не перекрывают фокус), Focus Appearance (AAA), Dragging Movements (альтернатива drag), Target Size Minimum 24×24, Consistent Help, Redundant Entry, Accessible Authentication (без когнитивных тестов, разрешить вставку/менеджеры паролей). Удалён 4.1.1 Parsing.
</details>

<details><summary>Roving tabindex vs aria-activedescendant — когда что?</summary>

Оба решают задачу «один Tab-стоп на составной виджет, стрелки внутри». Roving tabindex реально двигает DOM-фокус (элемент получает `tabindex=0`, `.focus()`), просто и надёжно, браузер сам скроллит к элементу — для табов, тулбаров, меню, радиогрупп. `aria-activedescendant` оставляет фокус на контейнере/инпуте и указывает id «активного» потомка — нужен для комбобокса, где фокус должен оставаться в поле ввода; скролл к активному элементу — вручную.
</details>

<details><summary>Как сделать SPA доступным при навигации по роутам?</summary>

Браузер не объявляет смену «страницы» без перезагрузки. Нужно: обновить `document.title`, перенести фокус на `h1` новой страницы (`tabindex="-1"`) или на контейнер `main`, либо объявить через live region («Страница: Корзина»). Восстанавливать скролл/фокус при «назад». Сохранять skip link.
</details>

<details><summary>Зачем нужны live regions и почему иногда «не говорят»?</summary>

Чтобы объявлять динамические изменения без переноса фокуса: статусы, ошибки, счётчики. Частые ошибки: регион добавлен в DOM одновременно с текстом (нужно, чтобы контейнер существовал заранее, а меняли его содержимое); `assertive` на всё подряд (раздражает); регион внутри `display:none`. `role="status"` — вежливое, `role="alert"` — срочное.
</details>

<details><summary>display:none, visibility:hidden, aria-hidden, inert, .visually-hidden — в чём разница?</summary>

`display:none`/`visibility:hidden`/атрибут `hidden` — скрыто для всех и убрано из a11y tree. `aria-hidden="true"` — видно глазами, но скрыто от AT; фокусируемые потомки остаются достижимыми по Tab → баг. `inert` — поддерево не фокусируется, не кликается и скрыто от AT (фон модалки). `.visually-hidden` — не видно глазами, но читается скринридером (подписи иконок, skip link до фокуса).
</details>

<details><summary>Как встроить доступность в процесс команды?</summary>

Доступные примитивы в дизайн-системе (React Aria/Radix/собственные по APG), линт `jsx-a11y`, axe в unit/e2e и в CI, тесты через `getByRole` с `name`, контраст и фокус-стейты — в дизайн-токенах, ручной аудит клавиатурой/скринридером на критичных флоу, a11y в Definition of Done и чек-листе ревью. Автоматика ловит лишь треть проблем — ручная проверка обязательна.
</details>

<details><summary>Как семантика влияет на SEO, и что такое JSON-LD?</summary>

Краулер понимает структуру по заголовкам, ландмаркам, ссылкам `<a href>`; `title`/`description`/`canonical` управляют сниппетом и дублями. JSON-LD — микроразметка schema.org в отдельном `<script type="application/ld+json">`, не смешивается с вёрсткой, Google рекомендует именно её; даёт rich results. Для SEO-критичных страниц — SSR/SSG, т.к. не все боты исполняют JS и рендер у Google отложен.
</details>

<details><summary>Почему нативная валидация форм часто отключается, и как сделать доступные ошибки?</summary>

Пузыри не стилизуются, текст на языке браузера, срабатывают только на сабмите, не везде озвучиваются. Делают `novalidate`, но сохраняют `required`/`type` для семантики и мобильных клавиатур; ошибку выводят текстом рядом, связывают `aria-describedby`, ставят `aria-invalid`, при сабмите фокус на первое ошибочное поле или на сводку. Цвет — не единственный индикатор (WCAG 1.4.1). Используют `:user-invalid` вместо `:invalid`.
</details>

## Практика

**Задача 1.** Найдите проблемы:
```html
<div class="btn" onclick="save()"><img src="save.svg"></div>
<input placeholder="Имя">
<h1>Каталог</h1><h4>Фильтры</h4>
<a onclick="go('/cart')">Корзина</a>
```
<details><summary>Решение</summary>

1. `div` вместо `button`: нет фокуса, роли, клавиатуры; у `img` нет `alt` → у кнопки нет имени. Исправление: `<button type="button"><img src="save.svg" alt="Сохранить"></button>`.
2. `placeholder` вместо `label` → `<label for="name">Имя</label><input id="name" autocomplete="name">`.
3. Пропуск уровней заголовков h1 → h4 → используйте h2 и стилизуйте классом.
4. `<a>` без `href` — не ссылка, не фокусируется, краулер не пройдёт → `<a href="/cart">` + перехват в роутере.
</details>

**Задача 2.** Реализуйте клавиатурную навигацию для табов по паттерну APG (roving tabindex).
<details><summary>Решение</summary>

```ts
function initTabs(tablist: HTMLElement) {
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

  const select = (next: HTMLButtonElement) => {
    for (const tab of tabs) {
      const active = tab === next;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;                     // roving tabindex
      document.getElementById(tab.getAttribute('aria-controls')!)!.hidden = !active;
    }
    next.focus();
  };

  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    const map: Record<string, number> = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (e.key in map) { e.preventDefault(); select(tabs[map[e.key]]); }
  });
  tablist.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
    if (tab) select(tab);
  });
}
// Разметка: <div role="tablist" aria-label="Настройки">
//   <button role="tab" aria-selected="true" aria-controls="p1" id="t1">Общие</button>...
// <div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">...</div>
```
</details>

**Задача 3.** Спроектируйте: sticky-хедер 64px перекрывает фокусируемые элементы при Tab — какой критерий нарушен и как починить?
<details><summary>Решение</summary>

WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), AA. Лечение: `html { scroll-padding-top: 72px; }` — браузер учитывает отступ при прокрутке к фокусу и якорям; для cookie-баннеров — не перекрывать контент (резервировать место) или давать закрыть.
</details>

## Источники
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- https://www.w3.org/TR/using-aria/
- https://www.w3.org/WAI/ARIA/apg/
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/TR/accname-1.2/
- https://webaim.org/projects/million/
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://learn.javascript.ru/forms-controls
