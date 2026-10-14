# Хранилища, воркеры, браузерные API

> ⏱ ~4 ч · 🎯 Senior/lead выбирает хранилище под задачу с учётом квот и вытеснения, выносит тяжёлую работу в воркеры, понимает жизненный цикл Service Worker (и как не «застрять» на старой версии), использует Observer-API вместо опроса и знает, когда Web Components и Shadow DOM — правильный выбор.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю ограничения и квоты localStorage / IndexedDB / Cache API и что такое persistent storage
- [ ] Рисую жизненный цикл Service Worker и объясняю `skipWaiting`/`clients.claim`
- [ ] Использовал Intersection/Resize/Mutation Observer
- [ ] Написал custom element с Shadow DOM и слотами

## Теория

### Хранилища: сравнение

| | Cookies | localStorage | sessionStorage | IndexedDB | Cache API | OPFS |
|---|---|---|---|---|---|---|
| Объём | ~4 КБ на куку | ~5 МБ на origin | ~5 МБ, на вкладку | Доля квоты (ГБ) | Доля квоты | Доля квоты |
| API | Строка | Синхронный, строки | Синхронный, строки | Асинхронный, транзакции, structured clone, индексы | Асинхронный, `Request → Response` | Асинхронный + синхронный в воркерах |
| Доступ из воркеров | Нет (кроме Cookie Store API в SW) | **Нет** | Нет | Да | Да | Да |
| Уходит на сервер | Да, в каждом запросе | Нет | Нет | Нет | Нет | Нет |
| Время жизни | Expires/Max-Age | Бессрочно | Пока жива вкладка (переживает reload; дублируется при «Duplicate tab») | Бессрочно (best-effort) | Бессрочно (best-effort) | Бессрочно |

- **localStorage** синхронный → блокирует main thread (чтение с диска при первом обращении), только строки (`JSON.stringify`), нет в воркерах. Событие `storage` срабатывает в **других** вкладках того же origin — примитивная межвкладочная связь. Подходит для мелких настроек (тема, язык).
- **IndexedDB**: объектные хранилища, индексы, транзакции, хранит Blob/File/ArrayBuffer, structured clone. API неудобен (события) — используют `idb` (обёртка на промисах), Dexie. Миграции через `onupgradeneeded` и версию БД; при открытой старой версии в другой вкладке — `blocked`/`versionchange`.
- **Cache API** — для HTTP-ответов (SW и main thread), не путать с HTTP-кэшем: управляется вручную, не истекает сам.
- **OPFS** (Origin Private File System, `navigator.storage.getDirectory()`) — быстрая файловая система, `createSyncAccessHandle()` в воркерах; на нём работает SQLite в WASM.

### Квоты и вытеснение

```ts
const { usage, quota } = await navigator.storage.estimate();   // байты, приблизительно
const persisted = await navigator.storage.persist();            // просьба не вытеснять
```

- Chrome: origin может использовать до ~60% диска; Firefox — до ~10% диска / группа eTLD+1 (best-effort), больше при persist; Safari — ~60% для браузерных приложений, но **ITP удаляет все script-writable хранилища через 7 дней без взаимодействия пользователя** с сайтом (кроме установленных на домашний экран PWA).
- Режим **best-effort**: при нехватке места браузер вытесняет данные целого origin по LRU. **Persistent** — только по решению пользователя.
- Превышение квоты → `QuotaExceededError` — обрабатывайте всегда (особенно в Safari private mode исторически).
- Инкогнито — квоты меньше, данные удаляются при закрытии.
- Storage partitioning: в iframe на чужом сайте хранилища разделены по top-level site (как CHIPS для кук).

💡 На собеседовании: «Офлайн-данные — IndexedDB (через Dexie/idb), ответы сети — Cache API в SW, настройки — localStorage. Всегда считаю, что браузер может стереть данные, поэтому источник правды — сервер, а клиентское хранилище — кэш с синхронизацией».

### Web Workers

Отдельный поток со своим event loop и глобальным объектом (`DedicatedWorkerGlobalScope`), без доступа к DOM. Связь — `postMessage` со **structured clone** (копирование, стоимость пропорциональна размеру) или **transferable** (передача владения без копирования: `ArrayBuffer`, `MessagePort`, `ImageBitmap`, `OffscreenCanvas`, `ReadableStream`).

```ts
// main.ts — модульный воркер, бандлеры (Vite) понимают этот синтаксис
const worker = new Worker(new URL('./parse.worker.ts', import.meta.url), { type: 'module' });

export function parseInWorker(buffer: ArrayBuffer): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();          // отдельный канал на запрос
    port1.onmessage = (e) => (e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.rows));
    worker.postMessage({ buffer, port: port2 }, [buffer, port2]); // buffer передаётся без копии
  });
}

// parse.worker.ts
self.onmessage = (e: MessageEvent<{ buffer: ArrayBuffer; port: MessagePort }>) => {
  try {
    const rows = parseCsv(new TextDecoder().decode(e.data.buffer));
    e.data.port.postMessage({ rows });
  } catch (err) {
    e.data.port.postMessage({ error: String(err) });
  }
};
```

Применение: парсинг больших файлов, криптография, сжатие, обработка изображений (`OffscreenCanvas`), поиск/фильтрация больших массивов, WASM. Comlink — RPC-обёртка над `postMessage`. Цена: старт воркера (десятки мс), сериализация данных — для мелких задач воркер может быть медленнее.

**SharedArrayBuffer + Atomics** — общая память между потоками; доступны только при `crossOriginIsolated` (COOP + COEP).

### SharedWorker

Один экземпляр на origin, общий для всех вкладок/окон; связь через `port`. Применение: одно WebSocket-соединение на все вкладки, общий кэш, координация. Поддержка: Chrome desktop, Firefox, Safari (вернули в 16), **нет в Chrome Android** — нужен фолбэк (BroadcastChannel + leader election через Web Locks API).

### Service Worker: жизненный цикл

Программируемый сетевой прокси между страницей и сетью: работает в фоне, без DOM, только HTTPS (и localhost), управляет страницами в своём **scope**, событийный (браузер убивает его в простое и будит по событию — не храните состояние в глобальных переменных).

```
register() → [download] → install → (waiting) → activate → контролирует клиентов → fetch/push/sync/message
                           ↑ precache          ↑ ждёт, пока все вкладки со старой версией закроются
```

1. **Регистрация**: `navigator.serviceWorker.register('/sw.js', { type: 'module' })`. Браузер проверяет обновление при навигации (не реже раза в 24 ч), байт-в-байт сравнение `sw.js` (HTTP-кэш для `sw.js` обходится по умолчанию — `updateViaCache: 'imports'`).
2. **install**: precache ресурсов (`event.waitUntil(cache.addAll(...))`). Ошибка → установка провалена.
3. **waiting**: новая версия ждёт, пока **все** вкладки под старой версией закроются (reload не помогает — во время перезагрузки старая вкладка ещё существует). Это гарантирует, что одна страница не обслуживается двумя версиями.
4. **activate**: очистка старых кэшей, миграции. `clients.claim()` — взять под контроль уже открытые страницы без перезагрузки.
5. Первая загрузка страницы **не** контролируется SW (если не `claim`).

```ts
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
const VERSION = 'v42';
const PRECACHE = [`/`, `/offline.html`, `/assets/app.3f9a.js`];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.registration.navigationPreload?.enable();   // навигационный запрос стартует параллельно с SW
    await self.clients.claim();
  })());
});

// Обновление по согласию пользователя: страница шлёт SKIP_WAITING после клика «Обновить»
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
```

```ts
// Страница: показать баннер «Доступна новая версия»
const reg = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
reg.addEventListener('updatefound', () => {
  const sw = reg.installing;
  sw?.addEventListener('statechange', () => {
    if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(() => sw.postMessage({ type: 'SKIP_WAITING' }));
  });
});
let reloaded = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!reloaded) { reloaded = true; location.reload(); }   // новая версия активна — перезагрузить
});
```

🪤 Ловушки: `skipWaiting()` без согласия → старая страница получает новые чанки/ответы новой версии → поломки ленивой загрузки; закэшированный навсегда `sw.js` (CDN) → пользователи «застряли»; кэширование HTML cache-first → не видят деплои; аварийный выход — задеплоить SW-«самоубийцу» (`registration.unregister()` + очистка кэшей) по тому же URL.

Стратегии кэширования — в [05-web-performance](05-web-performance.md). Другие возможности SW: Push API + Notifications, Background Sync (повтор запросов при появлении сети, Chromium), Periodic Background Sync.

### PWA

Web App Manifest (`name`, `icons`, `start_url`, `display: standalone`, `theme_color`, `scope`, `shortcuts`, `share_target`) + HTTPS + Service Worker (офлайн). Установка: событие `beforeinstallprompt` (Chromium), в iOS — «На экран Домой»; Web Push на iOS работает с 16.4 только для установленных PWA. Возможности: File System Access, Badging, Web Share, File Handling (часть — только Chromium). Lead-аргумент: PWA vs нативное приложение — стоимость одной кодовой базы против ограничений iOS и доступа к платформе.

### BroadcastChannel и межвкладочная связь

```ts
const channel = new BroadcastChannel('auth');
channel.postMessage({ type: 'logout' });                 // всем вкладкам того же origin, кроме себя
channel.onmessage = (e) => { if (e.data.type === 'logout') location.assign('/login'); };
// channel.close() при размонтировании
```

Альтернативы: событие `storage` (localStorage), SharedWorker, Service Worker `clients.matchAll()` + `postMessage`. **Web Locks API** (`navigator.locks.request('leader', cb)`) — выбор «ведущей» вкладки (одна держит WebSocket или делает refresh токена — нет гонки refresh-ов).

### Observers

Асинхронные, батчат изменения, не форсируют layout — замена опроса `scroll`/`resize` и `getBoundingClientRect`.

**IntersectionObserver** — пересечение элемента с viewport или предком: lazy-загрузка, бесконечный скролл, аналитика показов, анимации при появлении.

```ts
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    loadMore();
    io.unobserve(entry.target);                            // одноразово
  }
}, { rootMargin: '200px 0px', threshold: 0 });             // начать заранее, за 200px
io.observe(sentinel);
```

**ResizeObserver** — изменение размеров элемента (не окна): адаптивные компоненты в JS, графики, виртуализация. Вызывается после layout перед paint; если в колбэке менять размеры наблюдаемых элементов — ошибка «ResizeObserver loop completed with undelivered notifications» (в консоли, обычно безвредна, но сигнал о цикле). Для чистого CSS-адаптива — container queries.

**MutationObserver** — изменения DOM (`childList`, `attributes`, `characterData`, `subtree`), доставляется **микрозадачей** пачкой. Применение: интеграция со сторонним DOM, редакторы, полифиллы. Осторожно с `subtree: true` на `body` в больших SPA — нагрузка.

Также: **PerformanceObserver** (метрики: `largest-contentful-paint`, `layout-shift`, `long-animation-frame`, `event`), **ReportingObserver** (deprecation/CSP-отчёты).

Всегда `disconnect()` при размонтировании — иначе утечки.

### Web Components и Shadow DOM

Набор стандартов: **Custom Elements** (`customElements.define`), **Shadow DOM** (инкапсуляция DOM и стилей), **`<template>`/`<slot>`**, ES-модули.

```ts
class UserBadge extends HTMLElement {
  static observedAttributes = ['name'];
  #root = this.attachShadow({ mode: 'open' });

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }

  #render() {
    this.#root.innerHTML = '';
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:host { display: inline-flex; gap: .5rem; } ::slotted(img) { border-radius: 50%; }
                       .name { color: var(--badge-color, inherit); }`);
    this.#root.adoptedStyleSheets = [sheet];               // constructable stylesheets — можно шарить между экземплярами
    const name = document.createElement('span');
    name.className = 'name';
    name.part.add('name');                                 // ::part(name) — стилизация снаружи
    name.textContent = this.getAttribute('name') ?? '';    // textContent, а не innerHTML — без XSS
    this.#root.append(document.createElement('slot'), name);
  }
}
customElements.define('user-badge', UserBadge);
// <user-badge name="Ада"><img src="ada.png" alt=""></user-badge>
```

Жизненный цикл: `constructor` → `connectedCallback` → `attributeChangedCallback` → `disconnectedCallback` → `adoptedCallback`.

Инкапсуляция стилей: внешние селекторы не проникают внутрь; внутрь проходят **наследуемые свойства** и **custom properties** (основа темизации), плюс `::part()` и `::slotted()`. `:host`, `:host(.active)`, `:host-context()` (не везде).

Плюсы: фреймворк-агностичность (дизайн-система для React/Vue/Angular/legacy одновременно), нативность, инкапсуляция, долговечность (Lit, Stencil, Shoelace/Web Awesome, Material Web). Минусы:
- **SSR** — Declarative Shadow DOM (`<template shadowrootmode="open">`) решает, но экосистема сложнее;
- **формы** — custom element не участвует в форме без `static formAssociated = true` + `ElementInternals` (`setFormValue`, `setValidity`);
- **a11y через shadow-границу** — `aria-labelledby`/`for` не ссылаются на id в другом shadow root (решается reference target — в работе; пока — `ElementInternals` с ARIA, или не прятать label);
- интеграция с React: React 19 корректно передаёт свойства и кастомные события custom elements (до 19 — только атрибуты-строки);
- события через границу: нужен `composed: true`, `target` ретаргетится.

💡 На собеседовании: «Web Components — хороший выбор для дизайн-системы, которую потребляют несколько фреймворков или микрофронтенды; для одного React-приложения — лишний слой. Shadow DOM даёт изоляцию стилей, но усложняет a11y, формы и глобальную темизацию».

## Вопросы с собеседований

<details><summary>localStorage vs sessionStorage vs IndexedDB vs cookies — что для чего?</summary>

Cookies — для сервера (сессия), маленькие, едут в каждом запросе. localStorage — мелкие настройки, синхронный, строки, ~5 МБ, нет в воркерах, `storage`-событие между вкладками. sessionStorage — состояние вкладки (черновик формы, PKCE verifier). IndexedDB — структурированные и большие данные, офлайн, асинхронный, доступен в воркерах. Cache API — HTTP-ответы для SW. Чувствительное (токены) — не в JS-доступных хранилищах.
</details>

<details><summary>Расскажите жизненный цикл Service Worker. Почему обновление «не применяется»?</summary>

register → install (precache) → waiting → activate (чистка кэшей, `claim`) → fetch/push. Новая версия ждёт в waiting, пока все контролируемые вкладки не закроются — reload не помогает. Решение: UI «Доступна новая версия» → `postMessage` → `skipWaiting()` → `controllerchange` → reload. Также проверьте, что `sw.js` не кэшируется CDN надолго, и что HTML не отдаётся cache-first.
</details>

<details><summary>Когда стоит выносить работу в Web Worker и какие издержки?</summary>

Когда задача CPU-bound и > ~50 мс (парсинг, сортировка больших данных, криптография, изображения), и вызывает long tasks/плохой INP. Издержки: старт воркера, structured clone (копирование больших объектов может стоить столько же, сколько вычисление) — используйте transferable; нет DOM; сложнее отладка; бандлинг. Для мелкой работы лучше уступать main thread (`scheduler.yield`).
</details>

<details><summary>Как синхронизировать состояние между вкладками?</summary>

BroadcastChannel — простые события (logout, смена темы). `storage`-событие — если данные и так в localStorage. Web Locks — выбор лидера (одна вкладка держит WebSocket/обновляет токен, остальные получают через BroadcastChannel). SharedWorker — общее соединение и состояние (но нет в Chrome Android). Service Worker — через `clients`.
</details>

<details><summary>Чем IntersectionObserver лучше обработчика scroll?</summary>

Scroll-обработчик выполняется часто на main thread и обычно вызывает `getBoundingClientRect` → форсированный layout. IntersectionObserver асинхронный, вычисления пересечений делает браузер вне вашего кода, колбэк вызывается только при пересечении порогов, работает для iframe и вложенных скролл-контейнеров. Для нативных случаев есть `loading="lazy"` и `content-visibility`.
</details>

<details><summary>Что будет с данными в IndexedDB, если места мало? Как гарантировать сохранность?</summary>

В best-effort режиме браузер может вытеснить данные целого origin (LRU по последнему использованию); Safari дополнительно стирает через 7 дней неактивности. `navigator.storage.persist()` просит persistent-режим (Chrome даёт по эвристикам вовлечённости, Firefox спрашивает пользователя). Гарантии нет — сервер должен оставаться источником правды, клиент — синхронизирующимся кэшем; обрабатывайте `QuotaExceededError`.
</details>

<details><summary>Shadow DOM: что инкапсулируется, а что нет?</summary>

Инкапсулируются: селекторы (внешние не матчат внутренние элементы, и наоборот), id, DOM-запросы (`querySelector` снаружи не видит внутрь). Не инкапсулируются: наследуемые CSS-свойства, custom properties, события с `composed: true` (с ретаргетингом), глобальные `@font-face` (определяются в документе). Точки стилизации: custom properties, `::part`, `::slotted`, `:host`.
</details>

<details><summary>Зачем ElementInternals и formAssociated?</summary>

Чтобы custom element вёл себя как нативный контрол: участвовал в `FormData` и сабмите (`setFormValue`), в Constraint Validation (`setValidity`, `:invalid`), реагировал на `form.reset()` (`formResetCallback`), `disabled` у fieldset; а также задавал роль и ARIA-состояния по умолчанию без атрибутов (`internals.role`, `internals.ariaChecked`).
</details>

<details><summary>Что такое crossOriginIsolated и зачем он нужен?</summary>

Состояние документа при `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (или `credentialless`). Открывает `SharedArrayBuffer`, точные `performance.now()`, `measureUserAgentSpecificMemory`. Цена — все cross-origin ресурсы должны явно разрешать встраивание (CORP/CORS), ломаются попапы OAuth без `same-origin-allow-popups`. Нужно для WASM-многопоточности (ffmpeg.wasm, SQLite).
</details>

<details><summary>Чем Cache API отличается от HTTP-кэша?</summary>

HTTP-кэш управляется браузером по заголовкам (`Cache-Control`, ETag), вы не контролируете вытеснение и не читаете его напрямую. Cache API — программное хранилище пар Request/Response: вы решаете, что класть, когда отдавать и удалять; заголовки свежести игнорируются; живёт в квоте origin. Запрос из SW через `fetch` всё ещё проходит через HTTP-кэш.
</details>

## Практика

**Задача 1.** Пользователи жалуются: после деплоя приложение «ломается» при переходе на новые разделы (ошибка загрузки чанка), лечится только закрытием всех вкладок. Причины и решение?
<details><summary>Решение</summary>

Вкладка работает со старым HTML/SW, который ссылается на старые хэш-чанки; на CDN их уже удалили, а SW в waiting не активируется, пока вкладки открыты (или наоборот — `skipWaiting` без перезагрузки подсунул новую версию старой странице). Решение: хранить старые ассеты на CDN N дней; в precache держать чанки версии; ловить `ChunkLoadError`/`vite:preloadError` → предложить обновление; UX «Доступна новая версия» → `SKIP_WAITING` → reload по `controllerchange`; `sw.js` с `Cache-Control: no-cache`.
</details>

**Задача 2.** Реализуйте хук `useInView(ref)` на IntersectionObserver.
<details><summary>Решение</summary>

```tsx
import { useEffect, useState, type RefObject } from 'react';

export function useInView<T extends Element>(ref: RefObject<T | null>, options: IntersectionObserverInit = {}) {
  const [inView, setInView] = useState(false);
  const { root = null, rootMargin = '0px', threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { root, rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();                          // отписка — без утечек
  }, [ref, root, rootMargin, threshold]);                  // threshold-массив передавайте стабильным (useMemo/константа)

  return inView;
}
```
</details>

**Задача 3.** Сделайте так, чтобы при нескольких открытых вкладках только одна обновляла access-токен, а остальные получали результат.
<details><summary>Решение</summary>

```ts
const channel = new BroadcastChannel('auth');
let current: string | null = null;
channel.onmessage = (e) => { if (e.data.type === 'token') current = e.data.token; };

export async function refreshToken(): Promise<string> {
  // Web Locks: эксклюзивная блокировка на origin — refresh выполнит одна вкладка за раз
  return navigator.locks.request('token-refresh', async () => {
    if (current && !isExpired(current)) return current;    // другая вкладка уже обновила, пока ждали лок
    const res = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
    const { accessToken } = (await res.json()) as { accessToken: string };
    current = accessToken;
    channel.postMessage({ type: 'token', token: accessToken });
    return accessToken;
  });
}
```
Важно для ротации refresh-токенов: параллельные refresh из разных вкладок иначе вызовут срабатывание reuse detection и разлогин.
</details>

## Источники
- https://learn.javascript.ru/localstorage
- https://learn.javascript.ru/indexeddb
- https://learn.javascript.ru/cookie
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- https://web.dev/articles/storage-for-the-web
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
- https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
- https://web.dev/articles/service-worker-lifecycle
- https://developer.chrome.com/docs/workbox
- https://web.dev/learn/pwa
- https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
- https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
- https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
- https://web.dev/articles/coop-coep
