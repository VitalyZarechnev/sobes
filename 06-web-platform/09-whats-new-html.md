# Новинки HTML и DOM 2023–2026

> ⏱ ~1.5 ч · 🎯 Знать новые нативные возможности HTML, которые заменяют JavaScript-компоненты (модалки, всплывающие окна, аккордеоны, селекты), понимать их доступность «из коробки» и статус поддержки.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [Семантика и доступность](01-html-semantics-a11y.md) · [Новинки CSS](08-whats-new-css.md) · [Производительность](05-web-performance.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю разницу между `<dialog>` и `popover` и когда что использовать
- [ ] Умею открывать диалоги и поповеры без JS (`popovertarget`, `commandfor`)
- [ ] Знаю `<details name>`, `inert`, `<search>`, `fetchpriority`
- [ ] Знаю, что такое Declarative Shadow DOM, Speculation Rules и customizable select, и их статус

## Теория

Статусы — по данным webstatus.dev на 13 октября 2026 года: ✅ Baseline Widely available, 🟢 Baseline Newly available, 🟡 есть не во всех основных браузерах, 🧪 только Chromium. Подробнее о Baseline — на странице [Новинки CSS](08-whats-new-css.md).

### 1. Сводная таблица

| Фича | Статус | Что заменяет |
|---|---|---|
| `<dialog>` | ✅ | самописные модалки с фокус-трапом |
| `inert` | ✅ | ручное отключение фокуса и кликов в фоне |
| `<search>` | ✅ | `<div role="search">` |
| Import maps | ✅ | сборщик для простых страниц с ES-модулями |
| Form-associated custom elements | ✅ | скрытые `<input>` внутри веб-компонентов |
| Declarative Shadow DOM | ✅ (август 2026) | Shadow DOM только через JS, без SSR |
| `<details name>` (взаимоисключающий аккордеон) | 🟢 2024 | JS для аккордеона «открыт только один» |
| `fetchpriority` | 🟢 2024 | — (новая возможность приоритизации загрузки) |
| Popover API (`popover`, `popovertarget`) | 🟢 январь 2025 | JS-библиотеки поповеров, меню, тостов |
| Invoker commands (`commandfor`, `command`) | 🟢 декабрь 2025 | JS-обработчики «открыть/закрыть диалог» |
| `<dialog closedby>` | 🟡 Chromium + Firefox | JS для закрытия модалки по клику снаружи |
| `popover="hint"` | 🟡 Chromium + Firefox | |
| `hidden="until-found"` | 🟡 Chromium + Firefox | скрытый контент, недоступный для поиска по странице |
| `moveBefore()` | 🟡 Chromium + Firefox | перенос узла с потерей состояния (iframe, видео, фокус) |
| Customizable `<select>` | 🟡 Chromium + Safari | кастомные селекты на JS |
| Interest invokers (`interestfor`) | 🧪 Chromium | JS для тултипов по hover/focus |
| Speculation Rules | 🧪 Chromium | `<link rel="prefetch">` для мгновенной навигации |

### 2. dialog: модальные окна

```html
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Удалить заказ?</h2>
  <form method="dialog">              <!-- кнопки формы закрывают диалог, value → dialog.returnValue -->
    <button value="cancel">Отмена</button>
    <button value="ok">Удалить</button>
  </form>
</dialog>
```

```js
const dialog = document.getElementById('confirm');
dialog.showModal(); // модально: верхний слой, фон inert, Escape закрывает, фокус внутри
dialog.addEventListener('close', () => console.log(dialog.returnValue)); // 'ok' или 'cancel'
```

Что даёт `showModal()` из коробки: верхний слой (top layer, без `z-index`), затемнение через `::backdrop`, недоступность фона для клавиатуры и скринридеров, закрытие по Escape, возврат фокуса. `show()` открывает немодально.

**`closedby`** (🟡) управляет «лёгким закрытием»: `closedby="any"` — по клику снаружи и Escape, `"closerequest"` — только Escape, `"none"` — только явно.

### 3. Popover API

`popover` — для **немодальных** всплывающих элементов: меню, подсказки, тосты, выпадающие списки.

```html
<button popovertarget="menu">Меню</button>
<div id="menu" popover>          <!-- popover="auto" по умолчанию -->
  <a href="/profile">Профиль</a>
  <a href="/logout">Выйти</a>
</div>
```

Без строчки JS: показ и скрытие по кнопке, верхний слой, закрытие по Escape и клику снаружи («light dismiss»), закрытие других `auto`-поповеров, правильная связь кнопки и поповера для доступности.

| Значение | Поведение |
|---|---|
| `popover` / `popover="auto"` | light dismiss, открытие закрывает другие `auto`-поповеры |
| `popover="manual"` | закрывается только явно (тосты, уведомления) |
| `popover="hint"` (🟡) | для подсказок: не закрывает открытые `auto`-поповеры |

JS API: `el.showPopover()`, `hidePopover()`, `togglePopover()`, события `beforetoggle` и `toggle`.

**`dialog` или `popover`?** Модальное взаимодействие, которое блокирует страницу (подтверждение, форма) — `<dialog>` + `showModal()`. Всё, что не блокирует (меню, тултип, тост) — `popover`. Их можно совмещать: `<dialog popover>`.

### 4. Invoker commands: кнопки без JS

`commandfor` указывает на элемент, `command` — действие. Работает с диалогами и поповерами (🟢 декабрь 2025):

```html
<button commandfor="confirm" command="show-modal">Удалить</button>
<dialog id="confirm">
  <p>Точно удалить?</p>
  <button commandfor="confirm" command="close">Отмена</button>
</dialog>

<button commandfor="menu" command="toggle-popover">Меню</button>
```

Встроенные команды: `show-modal`, `close`, `request-close` (для `dialog`), `show-popover`, `hide-popover`, `toggle-popover`. Собственные команды начинаются с `--` и обрабатываются через событие `command` на целевом элементе:

```js
player.addEventListener('command', (e) => {
  if (e.command === '--play') player.play();
});
```

### 5. Аккордеоны и скрытый контент

```html
<!-- Открыт может быть только один details из группы с одинаковым name -->
<details name="faq"><summary>Доставка</summary>…</details>
<details name="faq"><summary>Оплата</summary>…</details>
```

`hidden="until-found"` (🟡) — контент скрыт, но находится поиском по странице (Ctrl+F) и по ссылкам на фрагмент: браузер сам раскроет его и вызовет событие `beforematch`. Полезно для свёрнутых секций документации.

### 6. inert и search

```html
<main inert>…</main> <!-- вся область недоступна для фокуса, кликов и скринридеров -->
<search>
  <form action="/search"><input type="search" name="q" aria-label="Поиск"></form>
</search>
```

`inert` нужен для собственных модальных слоёв, «выдвижных» панелей и при загрузке. `<search>` — семантический landmark для области поиска.

### 7. Производительность загрузки

**`fetchpriority`** — подсказка браузеру о приоритете ресурса:

```html
<img src="hero.avif" fetchpriority="high" alt="…">           <!-- LCP-картинка — грузить первой -->
<img src="footer-logo.png" loading="lazy" fetchpriority="low" alt="…">
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

**Speculation Rules** (🧪 Chromium) — заранее загрузить или полностью отрендерить вероятную следующую страницу, чтобы переход был мгновенным:

```html
<script type="speculationrules">
{
  "prerender": [{ "where": { "href_matches": "/product/*" }, "eagerness": "moderate" }]
}
</script>
```

`eagerness: moderate` — начать при наведении курсора. В других браузерах блок просто игнорируется, поэтому это безопасное прогрессивное улучшение.

### 8. Веб-компоненты

**Declarative Shadow DOM** (✅ с августа 2026) — Shadow DOM прямо в HTML, без JS. Это позволяет рендерить веб-компоненты на сервере (SSR) и показывать их до загрузки скриптов:

```html
<user-card>
  <template shadowrootmode="open">
    <style>:host { display: block; border: 1px solid #ccc; }</style>
    <slot name="name"></slot>
  </template>
  <span slot="name">Аня</span>
</user-card>
```

**Form-associated custom elements** (✅) — собственный элемент участвует в формах как обычное поле: значение, валидация, `reset`:

```js
class RatingInput extends HTMLElement {
  static formAssociated = true;
  #internals = this.attachInternals();
  set value(v) { this.#internals.setFormValue(String(v)); }
}
customElements.define('rating-input', RatingInput);
```

**`moveBefore()`** (🟡) — перенести узел в DOM **без** сброса состояния: iframe не перезагружается, видео не останавливается, фокус и анимации сохраняются. Полезно для фреймворков при перестановке списков.

### 9. Customizable select

Долгожданная стилизация нативного `<select>` (🟡 Chromium и Safari):

```css
select, ::picker(select) { appearance: base-select; } /* включить новый режим */
::picker(select) { border-radius: 12px; box-shadow: var(--shadow); }
select option:checked { font-weight: 600; }
```

```html
<select>
  <button><selectedcontent></selectedcontent></button> <!-- копия выбранной опции в кнопке -->
  <option value="ru"><img src="ru.svg" alt=""> Русский</option>
  <option value="en"><img src="en.svg" alt=""> English</option>
</select>
```

Внутри `<option>` разрешён произвольный HTML (иконки, описания). В браузерах без поддержки — обычный селект, поэтому это безопасное прогрессивное улучшение.

## Вопросы с собеседований

<details><summary>Чем dialog отличается от popover?</summary>

`<dialog>` с `showModal()` — модальное окно: блокирует остальную страницу (делает её inert), удерживает фокус, затемняет фон через `::backdrop`. `popover` — немодальный слой: страница остаётся интерактивной, есть light dismiss (клик снаружи, Escape), открытие закрывает другие `auto`-поповеры. Оба рендерятся в верхнем слое без `z-index`. Подтверждения и формы — `dialog`; меню, тултипы, тосты — `popover`.
</details>

<details><summary>Как открыть модалку без JavaScript?</summary>

Через invoker commands: `<button commandfor="id" command="show-modal">`, закрыть — `command="close"`. Для поповеров — `popovertarget="id"` или `command="toggle-popover"`. Внутри диалога форма с `method="dialog"` закрывает его и передаёт значение кнопки в `returnValue`.
</details>

<details><summary>Что даёт showModal() для доступности?</summary>

Фокус переходит внутрь диалога, фон становится inert (недоступен для клавиатуры и скринридеров), Escape закрывает, при закрытии фокус возвращается на элемент, который открыл диалог. Нужно добавить доступное имя (`aria-labelledby`) и продуманный начальный фокус (`autofocus` на нужном элементе).
</details>

<details><summary>Что такое inert и когда его применять?</summary>

Атрибут, который делает поддерево недоступным: нельзя сфокусироваться и кликнуть, скринридеры его не видят. Применяется для фона собственных модальных слоёв, выдвижных панелей, блоков во время загрузки. Для нативного `dialog` с `showModal()` браузер делает фон инертным сам.
</details>

<details><summary>Как сделать аккордеон, где открыт только один пункт, без JS?</summary>

Дать всем `<details>` одинаковый атрибут `name`: открытие одного закрывает остальные из группы (Baseline 2024). Плюс нативно: клавиатура, семантика, поиск по странице находит содержимое закрытых `details`.
</details>

<details><summary>Что такое fetchpriority и когда его использовать?</summary>

Подсказка о приоритете загрузки ресурса (`high`, `low`, `auto`) для `img`, `link`, `script`, `fetch()`. Главный случай — `fetchpriority="high"` для LCP-изображения, чтобы оно грузилось раньше прочих картинок; `low` — для второстепенных ресурсов. Не заменяет `preload`, а дополняет его.
</details>

<details><summary>Что такое Declarative Shadow DOM и зачем он нужен?</summary>

Возможность описать shadow root прямо в HTML через `<template shadowrootmode="open">`. Без него Shadow DOM создавался только через JS, поэтому веб-компоненты нельзя было отрендерить на сервере — до загрузки скриптов пользователь видел пустоту или скачок вёрстки. С DSD веб-компоненты работают с SSR. Baseline Widely available с августа 2026.
</details>

<details><summary>Что такое Speculation Rules?</summary>

JSON-правила в `<script type="speculationrules">`, по которым браузер заранее загружает (prefetch) или полностью рендерит (prerender) вероятные следующие страницы — переход становится мгновенным. Настраивается охват (`href_matches`) и агрессивность (`eagerness`). Пока только Chromium, остальные браузеры игнорируют блок. Важно не делать prerender страниц с побочными эффектами (например, logout) и учитывать аналитику.
</details>

## Практика

### Предскажите поведение

**1.**
```html
<button popovertarget="a">A</button>
<button popovertarget="b">B</button>
<div id="a" popover>Меню A</div>
<div id="b" popover>Меню B</div>
```
Пользователь открыл A, затем нажал B. Что видно?

<details><summary>Ответ</summary>

Только меню B.
</details>
<details><summary>Почему так</summary>

`popover` по умолчанию в режиме `auto`: открытие нового `auto`-поповера закрывает остальные (если они не вложены друг в друга). Чтобы оба оставались открытыми, нужен `popover="manual"`.
</details>

**2.**
```html
<dialog id="d"><form method="dialog"><button value="yes">Да</button></form></dialog>
<script>
  d.showModal();
  d.addEventListener('close', () => console.log(d.returnValue));
</script>
```
Что выведется после нажатия «Да»?

<details><summary>Ответ</summary>

`'yes'`
</details>
<details><summary>Почему так</summary>

Отправка формы с `method="dialog"` закрывает диалог и записывает значение нажатой кнопки в `returnValue`, затем срабатывает событие `close`.
</details>

### Задачи

**1. Модалка подтверждения без JavaScript-обработчиков.**

Сделайте кнопку «Удалить», которая открывает модальный диалог с заголовком, текстом и двумя кнопками. «Отмена» закрывает диалог, «Удалить» отправляет форму `DELETE` на сервер. Диалог доступен для скринридеров.

<details><summary>Решение</summary>

```html
<button commandfor="delete-dialog" command="show-modal">Удалить</button>

<dialog id="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-desc" closedby="any">
  <h2 id="delete-title">Удалить заказ?</h2>
  <p id="delete-desc">Действие нельзя отменить.</p>
  <form method="post" action="/orders/42/delete">
    <button type="button" commandfor="delete-dialog" command="close" autofocus>Отмена</button>
    <button type="submit">Удалить</button>
  </form>
</dialog>
```

Фокус по умолчанию ставится на безопасное действие («Отмена»). В браузерах без `commandfor` нужен маленький полифилл или обработчик `click` с `showModal()`. `closedby` — прогрессивное улучшение.
</details>

**2. FAQ-аккордеон, доступный для поиска.**

Сделайте блок FAQ из трёх вопросов: открыт только один ответ одновременно, ответы находятся поиском по странице.

<details><summary>Решение</summary>

```html
<section aria-labelledby="faq-title">
  <h2 id="faq-title">Частые вопросы</h2>
  <details name="faq">
    <summary>Сколько стоит доставка?</summary>
    <p>Бесплатно от 2000 ₽.</p>
  </details>
  <details name="faq">
    <summary>Как вернуть товар?</summary>
    <p>В течение 14 дней через личный кабинет.</p>
  </details>
  <details name="faq">
    <summary>Какие способы оплаты?</summary>
    <p>Карты, СБП, при получении.</p>
  </details>
</section>
```

`<details>` с одинаковым `name` даёт взаимоисключающее раскрытие, а браузеры находят текст в закрытых `details` поиском по странице и раскрывают нужный.
</details>

## Источники
- [webstatus.dev](https://webstatus.dev/)
- [MDN — dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN — Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN — Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
- [MDN — details](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
- [MDN — fetchpriority](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority)
- [MDN — Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)
- [MDN — Customizable select elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)
- [Chrome — CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/)
