# Middle-разминка: HTML, CSS, браузер, сеть

> ⏱ ~1,5 ч · 🎯 Уверенно ответить на базовые вопросы по веб-платформе за 30–60 секунд с примером. Глубина — в темах раздела.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Ответил вслух на все вопросы, не подглядывая
- [ ] Прошёл [тест по разминке](../quizzes/quiz.html?id=06-web-platform/00-middle-questions) без ошибок

## Вопросы

<details><summary>Что такое семантическая вёрстка и зачем она?</summary>

Использование элементов по смыслу: `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `button`, заголовки по иерархии. Даёт доступность (скринридеры, навигация по ориентирам), SEO, поведение браузера бесплатно (фокус, клавиатура), читаемость кода. Подробно — [семантика](01-html-semantics-a11y.md).
</details>

<details><summary>Что вы сделаете минимум для доступности?</summary>

Семантические элементы, `alt` у изображений, `<label>` у полей, работа с клавиатуры и видимый фокус, достаточный контраст, `lang` у документа, понятные тексты ссылок и кнопок, не только цвет для смысла.
</details>

<details><summary>Чем `<button>` отличается от `<a>`?</summary>

Ссылка — навигация (есть `href`, открывается в новой вкладке, попадает в историю). Кнопка — действие на странице (отправить, открыть, удалить). Не делайте кнопку из `<a href="#">` и ссылку из `<div onclick>`.
</details>

<details><summary>Что такое блочная модель (box model) и `box-sizing`?</summary>

Элемент = content + padding + border + margin. По умолчанию (`content-box`) `width` — ширина контента; с `border-box` — включает padding и border, что удобнее. Отступы по вертикали у соседних блоков схлопываются (margin collapse).
</details>

<details><summary>Как работает специфичность и каскад?</summary>

Порядок решения конфликтов: происхождение и `!important`, cascade layers, специфичность (id > классы/атрибуты/псевдоклассы > теги), порядок в коде. Inline-стили выше селекторов. Подробно — [CSS](02-css-layout.md).
</details>

<details><summary>Flexbox или Grid?</summary>

Flexbox — одномерная раскладка (строка или колонка), контент определяет размеры. Grid — двумерная (строки и колонки одновременно), раскладка определяет размеры. Часто вместе: Grid для каркаса страницы, Flex внутри компонентов.
</details>

<details><summary>Как отцентрировать элемент?</summary>

`display: grid; place-items: center` или `display: flex; justify-content: center; align-items: center` на родителе. Для абсолютного позиционирования — `inset: 0; margin: auto` с заданными размерами.
</details>

<details><summary>Какие значения `position` есть?</summary>

`static` (по умолчанию), `relative` (сдвиг относительно своего места, контекст для absolute-потомков), `absolute` (относительно ближайшего позиционированного предка), `fixed` (относительно вьюпорта), `sticky` (прилипает при прокрутке в пределах родителя).
</details>

<details><summary>Как сделать адаптивную вёрстку?</summary>

Mobile-first, `<meta name="viewport">`, гибкие раскладки (Flex, Grid, `minmax`, `auto-fit`), относительные единицы (`rem`, `%`, `vw`, `clamp()`), медиазапросы и container queries, адаптивные изображения (`srcset`, `sizes`, `<picture>`).
</details>

<details><summary>Что происходит, когда вводишь адрес в браузере?</summary>

Разбор URL → DNS-запрос (с кэшами) → TCP + TLS (или QUIC для HTTP/3) → HTTP-запрос → ответ (кэш, редиректы) → парсинг HTML в DOM, CSS в CSSOM, загрузка ресурсов, выполнение JS → render tree → layout → paint → composite. Подробно — [рендеринг](03-browser-rendering.md) и [сеть](04-network-http.md).
</details>

<details><summary>Чем отличаются `async` и `defer` у `<script>`?</summary>

Оба грузят скрипт без блокировки парсинга. `async` выполняется сразу после загрузки (порядок не гарантирован), `defer` — после парсинга HTML в порядке подключения. Модули (`type="module"`) по умолчанию ведут себя как `defer`.
</details>

<details><summary>Что такое reflow и repaint?</summary>

Reflow (layout) — пересчёт геометрии элементов после изменения размеров, контента, шрифтов; дорогой. Repaint — перерисовка без изменения геометрии (цвет). Анимировать лучше `transform` и `opacity` — они обрабатываются на этапе композиции.
</details>

<details><summary>Какие методы HTTP знаете? Что такое идемпотентность?</summary>

GET (чтение), POST (создание/действие), PUT (замена), PATCH (частичное изменение), DELETE, HEAD, OPTIONS. Идемпотентный — повтор даёт тот же результат на сервере: GET, PUT, DELETE, HEAD — да; POST — нет (поэтому его опасно повторять автоматически).
</details>

<details><summary>Основные коды ответа HTTP?</summary>

2xx успех (200, 201 Created, 204 No Content), 3xx редиректы (301, 302, 304 Not Modified), 4xx ошибка клиента (400, 401 не аутентифицирован, 403 нет прав, 404, 409 конфликт, 422 валидация, 429 лимит), 5xx ошибка сервера (500, 502, 503, 504).
</details>

<details><summary>Что такое CORS?</summary>

Механизм, позволяющий серверу разрешить запросы с другого origin через заголовки `Access-Control-Allow-*`. Браузер блокирует чтение ответа без разрешения; для «непростых» запросов сначала отправляется preflight `OPTIONS`. Это защита пользователя, а не сервера.
</details>

<details><summary>Чем отличаются cookies, localStorage и sessionStorage?</summary>

Cookies отправляются с каждым запросом на домен, имеют срок и флаги (`HttpOnly`, `Secure`, `SameSite`), ~4 KB. localStorage — постоянное хранилище ~5–10 MB, только JS, синхронное. sessionStorage — живёт в пределах вкладки. Секреты и токены — не в Storage. Подробно — [хранилища](07-storage-workers-apis.md).
</details>

<details><summary>Как работает HTTP-кэширование?</summary>

`Cache-Control` (`max-age`, `no-cache` — с проверкой, `no-store` — не хранить, `immutable`), валидация через `ETag`/`If-None-Match` и `Last-Modified` → `304`. Ассеты с хэшем в имени — кэш на год, HTML — `no-cache`.
</details>

<details><summary>Что такое XSS и как защититься?</summary>

Внедрение чужого скрипта на страницу через непроверенные данные. Защита: экранирование вывода (фреймворки делают по умолчанию), избегать `innerHTML`/`dangerouslySetInnerHTML`/`v-html` с пользовательскими данными или санитизировать (DOMPurify), CSP, `HttpOnly` cookies. Подробно — [безопасность](06-security.md).
</details>

<details><summary>Что такое Core Web Vitals?</summary>

LCP (загрузка основного контента, ≤ 2,5 с), INP (отзывчивость на взаимодействия, ≤ 200 мс), CLS (стабильность раскладки, ≤ 0,1) на 75-м перцентиле реальных пользователей. Подробно — [Web Performance](05-web-performance.md).
</details>

## Источники
- [MDN: Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [web.dev: Learn](https://web.dev/learn)
