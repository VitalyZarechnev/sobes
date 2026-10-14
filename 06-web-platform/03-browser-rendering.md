# Как браузер рендерит страницу

> ⏱ ~5 ч · 🎯 Senior/lead без запинки рассказывает путь от URL до пикселя, видит в Performance-профиле forced reflow и long tasks, знает, какой ресурс блокирует парсинг или рендер, и управляет приоритетами загрузки. Понимает модель событий DOM и устройство браузера на уровне процессов.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Рассказываю «что происходит при вводе URL» за 5 минут
- [ ] Нашёл в Performance panel forced reflow (фиолетовые блоки с красным треугольником)
- [ ] Понимаю разницу async/defer/module и `DOMContentLoaded`/`load`
- [ ] Объясняю фазы событий, делегирование и `passive`

## Теория

### Что происходит при вводе URL (полный путь)

1. **Обработка ввода** (browser process, UI thread): это URL или поисковый запрос? HSTS preload list → сразу `https`. Может сработать prerender/prefetch из Speculation Rules или омнибокса.
2. **beforeunload** у текущей страницы; затем навигация передаётся network service.
3. **Service Worker**: если зарегистрирован для scope — `fetch` перехватывается им (может отдать из кэша без сети). Также проверяется HTTP-кэш, bfcache (при «назад»).
4. **DNS**: кэш браузера → ОС → резолвер (может быть DoH). Для HTTP/3 — HTTPS DNS-запись (SVCB/HTTPS RR) или `Alt-Svc`.
5. **Соединение**: TCP handshake (1 RTT) + TLS 1.3 (1 RTT; 0-RTT при возобновлении) — или QUIC (1 RTT на всё). Подробно в [04-network-http](04-network-http.md).
6. **HTTP-запрос**, ответ. Редиректы — каждый ещё RTT. Проверки: `Content-Type`, CORB/ORB, `X-Frame-Options`/CSP `frame-ancestors`, `Content-Disposition` (скачивание?).
7. **Выбор renderer process** (Site Isolation: разные сайты — разные процессы), commit навигации, обновление адресной строки и истории.
8. **Парсинг HTML** потоково, по мере прихода байтов → DOM. Preload scanner параллельно ищет ресурсы.
9. **CSS → CSSOM**, **style** (computed styles), **layout**, **paint**, **composite** → первый кадр (FCP), далее LCP.
10. События `DOMContentLoaded`, `load`; гидрация/инициализация SPA.

💡 На собеседовании: идите по слоям (сеть → парсинг → рендер), на каждом называйте **что блокирует** и **как оптимизировать** (preconnect, 103 Early Hints, критический CSS, defer). Это и отличает senior-ответ.

### Парсинг HTML и блокирующие ресурсы

HTML-парсер инкрементальный и толерантный к ошибкам. Встретив **классический `<script>` без атрибутов**, он останавливается: скрипт может вызвать `document.write` или читать DOM. Более того, скрипт ждёт **загрузки всех CSS выше него**, т.к. может спросить `getComputedStyle` → **CSS косвенно блокирует парсинг**.

- **CSS — render-blocking**: браузер не рисует, пока не построен CSSOM (иначе FOUC). `media="print"` для неподходящих медиа — не блокирует.
- **Preload scanner** (спекулятивный парсер) сканирует ещё не разобранный HTML и заранее запускает загрузку `img`, `script`, `link` — поэтому ресурсы, спрятанные в JS (`import()`, CSS `background-image`, шрифты в CSS), стартуют поздно.

### async, defer, module

| | Загрузка | Исполнение | Порядок | Блокирует парсер |
|---|---|---|---|---|
| `<script>` | сразу, блокирует | сразу | по документу | да |
| `defer` | параллельно | после парсинга, до `DOMContentLoaded` | по документу | нет |
| `async` | параллельно | как только загрузится | не гарантирован | на время исполнения |
| `type="module"` | параллельно + граф зависимостей | как `defer` по умолчанию | по документу | нет |
| `type="module" async` | параллельно | как загрузится | нет | на время исполнения |
| динамический `createElement('script')` | параллельно | как `async` (можно `script.async = false`) | — | нет |

`defer` — для своего кода приложения, `async` — для независимых скриптов (аналитика). Модули — всегда strict mode, свой scope, выполняются один раз, CORS для кросс-доменных.

**`DOMContentLoaded`** — DOM построен, `defer`-скрипты выполнены (картинки ещё грузятся). **`load`** — всё, включая картинки и iframe. `beforeunload`/`unload` — `unload` устарел и ломает bfcache; используйте `pagehide`/`visibilitychange` (и `navigator.sendBeacon` для аналитики).

### Resource hints и приоритеты

```html
<!-- Ранние соединения со сторонними доменами: DNS + TCP + TLS заранее -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example.com">

<!-- Ресурс, нужный ТЕКУЩЕЙ странице, но поздно обнаруживаемый (шрифт из CSS, LCP-фон) -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="hero.avif" fetchpriority="high">

<!-- Модули с зависимостями -->
<link rel="modulepreload" href="/app.js">

<!-- СЛЕДУЮЩАЯ навигация, низкий приоритет -->
<link rel="prefetch" href="/checkout.js">

<!-- Speculation Rules: prefetch/prerender целых страниц (Chromium) -->
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/product/*" }, "eagerness": "moderate" }] }
</script>
```

`fetchpriority="high|low"` — подсказка планировщику (LCP-картинка — high, карусель вне экрана — low). **103 Early Hints** — сервер отдаёт `Link: preload/preconnect` до основного ответа, пока бэкенд думает.

🪤 Ловушка: preload без использования в течение ~3 с даёт warning в консоли и тратит полосу; `preload` шрифта без `crossorigin` грузит его дважды; preconnect на десятки доменов — расход сокетов и CPU.

### Пайплайн рендеринга

```
HTML → DOM ─┐
            ├→ Style (computed) → Layout → Paint (display lists) → [Layerize] → Raster → Composite → кадр
CSS → CSSOM ┘                     (геометрия)  (что и в каком порядке)        (тайлы, GPU)   (compositor thread)
```

- **Style recalc**: сопоставление селекторов с элементами, вычисление computed values. Дорого при большом DOM и «широкой» инвалидации (смена класса на `body`).
- **Render tree / layout tree**: только видимые узлы (без `display:none`, но с `visibility:hidden`); псевдоэлементы включены.
- **Layout (reflow)**: геометрия — позиции и размеры. Часто затрагивает поддерево или весь документ.
- **Paint**: запись команд рисования (display list) в порядке stacking.
- **Composite**: слои растеризуются (в Chrome — растеризация в отдельных потоках/GPU), compositor собирает кадр, применяет `transform`/`opacity`, скролл.

Что запускает что:
| Изменение | Layout | Paint | Composite |
|---|---|---|---|
| `width`, `top`, `font-size`, добавление DOM | да | да | да |
| `color`, `background`, `box-shadow`, `visibility` | нет | да | да |
| `transform`, `opacity` (на своём слое) | нет | нет | да |

**Слои**. Свой композитный слой получают: 3D/анимируемые `transform`, `will-change: transform/opacity`, `video`, `canvas` с WebGL, `position: fixed` (часто), элементы, перекрывающие слой (implicit compositing → «layer explosion»). Слой = память GPU. Смотрите DevTools → Layers и Rendering → Layer borders.

### Layout thrashing (forced synchronous layout)

Браузер откладывает layout до кадра. Но чтение геометрии (`offsetHeight`, `getBoundingClientRect`, `scrollTop`, `getComputedStyle`, `innerText`) после записи в DOM **принуждает** к синхронному layout. Чередование чтение/запись в цикле → layout на каждой итерации.

```ts
// Плохо: N синхронных layout — write → read → write → read ...
for (const el of items) {
  el.style.width = `${el.parentElement!.offsetWidth / 2}px`;
}

// Хорошо: сначала все чтения, потом все записи
const widths = items.map((el) => el.parentElement!.offsetWidth);
items.forEach((el, i) => { el.style.width = `${widths[i] / 2}px`; });
```

Инструменты: батчинг (fastdom-подход), `requestAnimationFrame` для записей, `ResizeObserver` вместо опроса размеров, CSS вместо JS-вычислений.

### requestAnimationFrame и кадр

Цикл одного кадра (упрощённо): задача (task) → микрозадачи → [если пора рисовать: события resize/scroll → **rAF-колбэки** → style → layout → ResizeObserver → paint → composite] → `requestIdleCallback`, если осталось время.

- `rAF` вызывается перед следующей отрисовкой (~16.7 мс при 60 Гц, 8.3 мс при 120 Гц), паузится в фоновых вкладках.
- Используйте для визуальных обновлений, синхронизированных с кадром; `setTimeout(16)` дрейфует и не синхронизирован.
- Тяжёлую работу — дробить: `scheduler.yield()` (Chromium 129+, есть в Firefox), `scheduler.postTask` с приоритетами, `setTimeout(0)` как фолбэк, или Web Worker.

```ts
// scheduler.yield ещё не во всех lib.dom.d.ts — описываем минимально
declare const scheduler: { yield?: () => Promise<void> } | undefined;

const yieldToMain = (): Promise<void> =>
  typeof scheduler !== 'undefined' && scheduler?.yield
    ? scheduler.yield()                                 // продолжение с приоритетом, не в конец очереди
    : new Promise((resolve) => setTimeout(resolve, 0));

async function processAll<T>(items: T[], fn: (x: T) => void, budgetMs = 50) {
  let deadline = performance.now() + budgetMs;
  for (const item of items) {
    fn(item);
    if (performance.now() > deadline) {
      await yieldToMain();      // браузер успеет обработать ввод и отрисовать кадр
      deadline = performance.now() + budgetMs;
    }
  }
}
```

`navigator.scheduling.isInputPending()` был экспериментом и фактически заменён подходом «уступать каждые ~50 мс через `scheduler.yield()`».

### События DOM: фазы, делегирование, passive

Три фазы: **capturing** (от `window` вниз к цели) → **target** → **bubbling** (вверх). `addEventListener(type, fn, { capture: true })` — слушать на погружении.

- `event.target` — исходный элемент, `event.currentTarget` — тот, на котором висит обработчик.
- `stopPropagation()` — дальше по дереву не пойдёт; `stopImmediatePropagation()` — и соседние обработчики на этом элементе не вызовутся. Злоупотребление ломает аналитику и закрытие поповеров «по клику снаружи».
- `preventDefault()` — отменить действие браузера (submit, переход по ссылке).
- Не всплывают: `focus`/`blur` (есть всплывающие `focusin`/`focusout`), `mouseenter`/`mouseleave`, `load`, `scroll` на элементах (на документе всплывает до window).
- Shadow DOM: события `composed: true` пересекают границу shadow root, при этом `target` **ретаргетится** на хост.

**Делегирование** — один обработчик на контейнере вместо N на элементах: меньше памяти, работает для динамически добавленных элементов.

```ts
list.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-action]');
  if (!btn || !list.contains(btn)) return;     // клик мимо или вне списка
  actions[btn.dataset.action!]?.(btn);
});
```

**passive**: `touchstart`/`touchmove`/`wheel` — браузер должен ждать обработчик, ведь тот может вызвать `preventDefault()` и отменить скролл. `{ passive: true }` обещает не отменять → скролл идёт сразу на compositor. Chrome делает такие слушатели на `window/document/body` пассивными по умолчанию. Для отмены скролла жестов — CSS `touch-action`/`overscroll-behavior`.

Другие опции: `{ once: true }`, `{ signal }` — снятие пачки обработчиков через `AbortController.abort()` (удобно в cleanup компонентов).

### Устройство браузера (Chromium)

- **Multi-process**: browser process (UI, сеть-координация, хранилища), **renderer processes** (на сайт — Site Isolation, в песочнице), GPU process, network service, utility/audio, extension processes. Падение вкладки не валит браузер; Spectre-класс атак ограничен границей процесса.
- Внутри renderer: **main thread** (JS, style, layout, paint-запись), **compositor thread** (скролл, анимации transform/opacity), raster threads, workers.
- **Blink** — движок рендеринга, **V8** — JS-движок. Firefox: Gecko + SpiderMonkey; Safari: WebKit + JavaScriptCore.
- **V8 pipeline**: парсинг (ленивый: функции предпарсятся, полностью — при первом вызове) → AST → байткод **Ignition** (интерпретатор) → сбор type feedback → **Sparkplug** (быстрый baseline-компилятор) → **Maglev** (средний оптимизирующий) → **TurboFan** (полная оптимизация). При нарушении предположений — **деоптимизация**.
- **Hidden classes (shapes/maps)** и **inline caches**: объекты одной «формы» (одинаковый порядок свойств) обрабатываются быстрыми мономорфными путями; полиморфизм/мегаморфизм и `delete obj.prop` замедляют.
- **GC**: поколенческий — young generation (Scavenger, быстрый), old generation (Mark-Compact, инкрементальный и конкурентный, Orinoco). Утечки — detached DOM, забытые слушатели, замыкания, глобальные кэши.

💡 На собеседовании про JIT достаточно: «интерпретатор быстро стартует, горячий код компилируется по собранным типам, мономорфный код — быстрый; скачущие типы и изменение формы объектов приводят к деоптимизации».

## Вопросы с собеседований

<details><summary>Что происходит, когда вы вводите URL и нажимаете Enter?</summary>

Разбор ввода, HSTS → проверка SW/HTTP-кэша → DNS → TCP+TLS (или QUIC) → запрос/ответ, редиректы → выбор renderer process (Site Isolation), commit → потоковый парсинг HTML в DOM, preload scanner грузит ресурсы → CSS в CSSOM (render-blocking), классические скрипты блокируют парсер → style → layout → paint → composite → FCP/LCP → `DOMContentLoaded`, `load`. На каждом шаге — оптимизация: preconnect, 103 Early Hints, inline критический CSS, defer, fetchpriority, CDN.
</details>

<details><summary>Чем reflow отличается от repaint? Как избежать layout thrashing?</summary>

Reflow (layout) — пересчёт геометрии, может каскадом затронуть всё дерево; repaint — перерисовка пикселей без изменения геометрии; composite — сборка слоёв, самая дешёвая. Thrashing — чередование записи в DOM и чтения геометрии, каждый read форсирует синхронный layout. Лечение: батчить чтения перед записями, писать в rAF, `ResizeObserver`/`IntersectionObserver` вместо опроса, анимировать transform/opacity, `contain`.
</details>

<details><summary>async vs defer vs module?</summary>

Оба не блокируют парсер при загрузке. `defer` выполняется после парсинга по порядку, до `DOMContentLoaded`. `async` — сразу по готовности, без порядка, может прервать парсинг. Модули по умолчанию deferred, грузят граф зависимостей (для глубоких графов — `modulepreload`). Inline `<script>` атрибуты `defer` игнорирует, `async` для inline работает только у модулей.
</details>

<details><summary>Почему CSS блокирует рендеринг, а иногда и выполнение JS?</summary>

Без CSSOM браузер нарисовал бы нестилизованный контент (FOUC), поэтому рендер ждёт CSS из `<head>`. Классический скрипт может читать стили, поэтому его выполнение ждёт загрузки предшествующих стилей → большой CSS задерживает и парсинг. Решения: критический CSS inline, остальное — асинхронно, `media` для неактуальных стилей, разбиение CSS по роутам.
</details>

<details><summary>preload vs prefetch vs preconnect vs modulepreload?</summary>

`preconnect` — заранее DNS+TCP+TLS к origin. `preload` — высокоприоритетная загрузка ресурса текущей страницы, который поздно обнаруживается (шрифт, фоновая LCP-картинка); нужен корректный `as` и `crossorigin`. `prefetch` — низкий приоритет, для будущей навигации, кладётся в HTTP-кэш. `modulepreload` — загрузка и парсинг ES-модуля (с зависимостями в Chromium). Speculation Rules — prefetch/prerender целых документов.
</details>

<details><summary>Что такое композитный слой и почему will-change надо использовать аккуратно?</summary>

Слой растеризуется отдельно и двигается/прозрачится compositor-ом без перерисовки. `will-change` заранее создаёт слой → плавный старт анимации. Но каждый слой — память GPU (ширина × высота × 4 байта), плюс неявное повышение перекрывающих элементов. Много слоёв на мобильных → нехватка памяти, падения, тормоза растеризации. Ставить перед анимацией и снимать после, не на сотни элементов.
</details>

<details><summary>Как устроены фазы событий? Где полезен capture?</summary>

capture (window → target) → target → bubble (target → window). Capture полезен для перехвата раньше всех: закрытие поповера при клике снаружи, даже если внутри кто-то вызвал `stopPropagation` на всплытии; аналитика; focus-события (не всплывают, но ловятся capture). Делегирование опирается на bubbling.
</details>

<details><summary>Зачем passive event listeners?</summary>

Для `touchstart/touchmove/wheel` compositor не может начать скролл, пока не выполнит JS-обработчик (вдруг будет `preventDefault`). При занятом main thread скролл тормозит. `passive: true` снимает ожидание. Если нужно отменять — `touch-action` в CSS точечно.
</details>

<details><summary>Как устроен Chromium на уровне процессов, и что даёт Site Isolation?</summary>

Browser process управляет всем, renderer — на каждый сайт (site = схема + eTLD+1) в песочнице, GPU process, network service. Site Isolation — защита от Spectre: данные чужого сайта не попадают в адресное пространство процесса атакующего; вместе с CORB/ORB и COOP/COEP. Цена — память. Отсюда же: cross-origin iframe живёт в другом процессе (OOPIF).
</details>

<details><summary>Как V8 оптимизирует код и что может это сломать?</summary>

Ignition интерпретирует байткод и собирает type feedback; горячие функции компилируют Sparkplug → Maglev → TurboFan под наблюдаемые типы. Hidden classes + inline caches делают доступ к свойствам быстрым при стабильной форме объектов. Ломают: разные порядки инициализации полей, `delete`, смешение типов в массивах (SMI → double → elements), мегаморфные вызовы — ведут к деоптимизации.
</details>

<details><summary>Почему unload — плохая идея и чем заменить?</summary>

Ненадёжен на мобильных (вкладку убивают без события) и запрещает bfcache → медленная навигация назад. Используйте `visibilitychange` (hidden) для сохранения состояния и отправки аналитики через `sendBeacon`/`fetch(keepalive)`, `pagehide`/`pageshow` с `event.persisted` для bfcache.
</details>

## Практика

**Задача 1.** Порядок выполнения?
```html
<script async src="a.js"></script>   <!-- грузится 300 мс -->
<script defer src="b.js"></script>   <!-- 100 мс -->
<script defer src="c.js"></script>   <!-- 50 мс -->
<script>document.addEventListener('DOMContentLoaded', () => console.log('DCL'))</script>
<!-- HTML парсится 200 мс -->
```
<details><summary>Решение</summary>

`b`, `c`, `DCL`, `a` (примерно). Defer-скрипты выполняются после парсинга (200 мс) строго по порядку: `b` затем `c`, даже если `c` загрузился первым; затем `DOMContentLoaded`. `a` (async) догрузится к 300 мс и выполнится тогда — `DOMContentLoaded` async-скрипты не ждёт.
</details>

**Задача 2.** Найдите проблему производительности и исправьте:
```ts
function resizeAll(cards: HTMLElement[]) {
  cards.forEach((c) => {
    c.style.height = 'auto';
    c.style.height = `${c.scrollHeight}px`;
  });
}
```
<details><summary>Решение</summary>

Запись (`height=auto`) → чтение (`scrollHeight`) → запись в каждой итерации: N форсированных layout. Разделить фазы:
```ts
function resizeAll(cards: HTMLElement[]) {
  cards.forEach((c) => { c.style.height = 'auto'; });           // все записи
  const heights = cards.map((c) => c.scrollHeight);             // один layout, все чтения
  cards.forEach((c, i) => { c.style.height = `${heights[i]}px`; }); // записи
}
```
Лучше — вообще убрать JS: `interpolate-size: allow-keywords` / `height: auto` с `calc-size()` для анимаций или grid-трюк `grid-template-rows: 0fr → 1fr`.
</details>

**Задача 3.** Реализуйте `onClickOutside(el, cb)`, корректно работающий, даже если внутри страницы кто-то вызывает `stopPropagation`, и с возможностью отписки.
<details><summary>Решение</summary>

```ts
export function onClickOutside(el: HTMLElement, cb: (e: PointerEvent) => void): () => void {
  const ac = new AbortController();
  document.addEventListener('pointerdown', (e) => {
    // composedPath учитывает Shadow DOM и элементы, удалённые из DOM во время события
    if (!e.composedPath().includes(el)) cb(e);
  }, { capture: true, signal: ac.signal });   // capture: срабатываем до stopPropagation на bubble
  return () => ac.abort();
}
```
</details>

## Источники
- https://developer.chrome.com/blog/inside-browser-part1
- https://developer.chrome.com/blog/inside-browser-part3
- https://developer.chrome.com/blog/inside-browser-part4
- https://web.dev/articles/critical-rendering-path
- https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
- https://web.dev/articles/preload-critical-assets
- https://web.dev/articles/fetch-priority
- https://developer.chrome.com/docs/web-platform/prerender-pages
- https://v8.dev/blog/maglev
- https://learn.javascript.ru/script-async-defer
- https://learn.javascript.ru/onload-ondomcontentloaded
- https://learn.javascript.ru/bubbling-and-capturing
- https://learn.javascript.ru/event-delegation
- https://learn.javascript.ru/dom-nodes
- https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
