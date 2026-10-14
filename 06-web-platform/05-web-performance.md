# Web Performance и Core Web Vitals

> ⏱ ~5 ч · 🎯 Senior/lead знает пороги и природу LCP/INP/CLS, отличает полевые данные от лабораторных, диагностирует проблему по Performance-профилю, выбирает стратегию рендеринга под продукт и выстраивает в команде процесс: бюджеты, мониторинг RUM, проверки в CI.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю пороги CWV и как разложить LCP и INP на подчасти
- [ ] Подключил `web-vitals` с attribution и отправку через `sendBeacon`
- [ ] Записал профиль в Performance panel и нашёл long task / layout shift
- [ ] Могу сравнить CSR/SSR/SSG/ISR/streaming/islands/resumability

## Теория

### Core Web Vitals

Оцениваются по **75-му перцентилю** реальных пользователей (отдельно mobile/desktop), источник — CrUX (Chrome UX Report).

| Метрика | Что измеряет | Good | Poor |
|---|---|---|---|
| **LCP** Largest Contentful Paint | Загрузка: когда отрисован самый большой элемент во viewport | ≤ 2.5 с | > 4 с |
| **INP** Interaction to Next Paint | Отзывчивость: задержка от ввода до следующего кадра, худшее взаимодействие за визит (≈98-й перцентиль при многих взаимодействиях) | ≤ 200 мс | > 500 мс |
| **CLS** Cumulative Layout Shift | Визуальная стабильность: максимальное «окно» сдвигов (session window ≤ 5 с, разрыв ≤ 1 с) | ≤ 0.1 | > 0.25 |

INP заменил FID в марте 2024. FID мерил только input delay **первого** взаимодействия; INP — все взаимодействия (клик, тап, клавиша; не скролл и не hover) и полную задержку до кадра.

Вспомогательные: **TTFB** (≤ 0.8 с), **FCP** (≤ 1.8 с), TBT (лабораторный прокси INP), Speed Index.

### LCP: разложение и улучшение

LCP-кандидаты: `img`, `image` в SVG, `video` (постер/первый кадр), элементы с `background-image: url()`, блоки текста. Измерение прекращается после первого ввода пользователя.

Четыре подчасти (из `web-vitals` attribution):
1. **TTFB** — сервер, сеть, редиректы. → CDN, кэш HTML на edge, 103 Early Hints, streaming SSR, без редиректов.
2. **Resource load delay** — от TTFB до начала загрузки LCP-ресурса. Обычно главный враг. → ресурс должен быть обнаружим в HTML (не в JS, не в CSS-фоне), `fetchpriority="high"`, `preload`, не `loading="lazy"`.
3. **Resource load duration** — сам файл. → AVIF/WebP, правильный размер (`srcset`/`sizes`), CDN-ресайз, тот же origin (без нового соединения).
4. **Element render delay** — ресурс есть, но не нарисован: render-blocking CSS/JS, клиентский рендер, A/B-скрипты, скрывающие страницу, шрифты для текстового LCP. → критический CSS, defer, SSR.

```html
<img src="/hero-1200.avif" srcset="/hero-600.avif 600w, /hero-1200.avif 1200w" sizes="100vw"
     width="1200" height="600" alt="..." fetchpriority="high" decoding="async">
```

🪤 Ловушка: SPA с CSR — LCP-картинка появляется в DOM только после загрузки и выполнения бандла и запроса к API; это сотни мс-секунды load delay. Лечится SSR/SSG или хотя бы preload.

### INP: разложение и улучшение

INP = **input delay** (main thread занят другой задачей) + **processing time** (ваши обработчики) + **presentation delay** (style/layout/paint и кадр).

- Long tasks (> 50 мс) — разбивать: `scheduler.yield()`, `setTimeout`, перенос в Web Worker.
- Обработчик: сначала визуальный отклик (кадр), тяжёлое — после: `requestAnimationFrame` + `setTimeout`, или `await scheduler.yield()`.
- React: `startTransition`/`useDeferredValue` для неурочных обновлений, виртуализация длинных списков, мемоизация дорогих поддеревьев (или React Compiler).
- Уменьшить DOM (> 1500 узлов уже заметно), `content-visibility: auto`.
- Сторонние скрипты (теги, чаты, A/B) — частая причина input delay: `async`, отложенная загрузка, Partytown/воркеры, фасады.
- Избегать layout thrashing, больших style recalc (см. [03-browser-rendering](03-browser-rendering.md)).

```ts
button.addEventListener('click', async () => {
  showSpinner();                 // дешёвое визуальное обновление
  await scheduler.yield();       // даём браузеру отрисовать кадр → низкий INP
  const result = heavyCompute(); // тяжёлое — уже после кадра (или в воркер)
  render(result);
});
```

Диагностика: `web-vitals/attribution` даёт `interactionTarget`, `longAnimationFrameEntries` (**LoAF API** — Long Animation Frames, показывает скрипты-виновники с source URL), подчасти.

### CLS: причины и лечение

- Картинки/видео/iframe без размеров → `width`/`height` или `aspect-ratio`.
- Вставка контента сверху (баннеры, куки, реклама) → резервировать место (`min-height`), показывать поверх (overlay), вставлять ниже viewport.
- Веб-шрифты: смена fallback → web font меняет метрики → `font-display: optional` или `swap` + `size-adjust`/`ascent-override` для подгонки fallback (Next.js `next/font` делает это автоматически), preload шрифта.
- Анимации `top/left/height` → `transform`.
- Сдвиги в течение 500 мс после пользовательского ввода **не считаются** (`hadRecentInput`).
- bfcache сильно улучшает все метрики при навигации «назад/вперёд» — не блокируйте его (`unload`, `Cache-Control: no-store` на HTML мешают).

### RUM vs lab

| | Lab (синтетика) | Field / RUM |
|---|---|---|
| Инструменты | Lighthouse, WebPageTest, DevTools, Lighthouse CI | CrUX, PageSpeed Insights (верхняя часть), `web-vitals` → своя аналитика, Sentry/Datadog/SpeedCurve |
| Условия | Контролируемые, воспроизводимые, эмуляция (Slow 4G, CPU 4×) | Реальные устройства, сети, кэш, поведение |
| INP | Нет (только TBT как прокси) | Да |
| Для чего | Отладка, регрессии в CI, до релиза | Правда о пользователях, приоритизация, SEO |

Расхождения нормальны: lab — холодный кэш и один сценарий; поле — повторные визиты, медленные Android, взаимодействия. **Решения принимают по полю, отлаживают в лаборатории.**

```ts
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals/attribution';

function send(metric: { name: string; value: number; id: string; rating: string; attribution?: unknown }) {
  const body = JSON.stringify({ ...metric, page: location.pathname, nav: performance.getEntriesByType('navigation')[0]?.toJSON() });
  // sendBeacon переживает закрытие вкладки; fetch keepalive — фолбэк
  if (!navigator.sendBeacon('/rum', body)) fetch('/rum', { method: 'POST', body, keepalive: true });
}
[onLCP, onINP, onCLS, onTTFB].forEach((on) => on(send));
```

### Lighthouse и Performance panel

**Lighthouse** — лабораторный аудит: Performance score — взвешенная сумма метрик (TBT и LCP весят больше всего, CLS, FCP, Speed Index). Скор ≠ CWV; не оптимизируйте «под 100», оптимизируйте полевые метрики.

**Performance panel** (Chrome DevTools):
- Live metrics на старте — LCP/INP/CLS в реальном времени, с полевыми данными CrUX для сравнения.
- Throttling CPU и сети (тестируйте на 4–6× CPU slowdown — так ведут себя средние Android).
- Main track: жёлтое — скрипты, фиолетовое — style/layout (красный треугольник — forced reflow), зелёное — paint; long tasks с красной штриховкой.
- Insights-сайдбар: LCP breakdown, render-blocking requests, layout shift culprits, document request latency.
- Bottom-up / Call tree — найти функцию-виновника. Network track — waterfall и цепочки.
- Memory panel — heap snapshots для утечек (detached nodes).

### Бюджеты производительности

Типы: по **метрикам** (LCP < 2.5 с на p75), по **ресурсам** (JS < 170 КБ gzip на критический путь, общее < N КБ), по **количеству** (запросов, сторонних скриптов), по Lighthouse-скору.

Внедрение (lead): бюджет фиксируется с продуктом (связь со скоростью → конверсия), проверка в CI (`size-limit`, `bundlesize`, Lighthouse CI с assertions), дашборд RUM с алертами на регрессию p75, правило «новая зависимость — через ревью размера» (bundlephobia/pkg-size), ответственный за performance.

### Бандл

- **Code splitting**: по роутам (`lazy(() => import('./Page'))`), по фичам (тяжёлые модалки, редакторы, графики), vendor-чанки с учётом частоты изменения (кэш).
- **Tree shaking**: требует ESM (статические `import/export`), `"sideEffects": false` в `package.json` библиотек, отсутствия побочных эффектов на верхнем уровне модулей; ловушки — barrel-файлы (`index.ts` с реэкспортом всего: ломают shaking в dev и замедляют сборку), CommonJS-зависимости, `import * as`.
- **Анализ**: `rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`, вкладка Coverage в DevTools (неиспользуемый JS/CSS).
- Замены тяжёлых библиотек (moment → date-fns/Temporal, lodash → нативное/`lodash-es`), полифиллы по browserslist, `modern`-таргет (ES2020+).
- Сжатие: Brotli (статически при сборке, уровень 11), zstd поддерживается Chrome/Firefox.
- Гидрация — тоже стоимость: JS надо не только скачать, но и распарсить и выполнить (на слабом мобильном 1 МБ JS ≈ секунды CPU).

### Изображения и шрифты

Изображения: AVIF (лучшее сжатие) → WebP → JPEG; `srcset`/`sizes`; `loading="lazy"` вне первого экрана; `decoding="async"`; размеры для CLS; CDN-ресайз; SVG для иконок (спрайт или inline); `fetchpriority` для LCP.

Шрифты: WOFF2, сабсеттинг (`unicode-range` — кириллица отдельно), variable fonts вместо 6 начертаний, self-hosting (тот же origin, нет лишнего соединения), `preload` критичного начертания, `font-display: swap` (FOUT, но текст сразу) / `optional` (без сдвигов, может не показаться при первом визите), подгонка fallback метрик (`size-adjust`).

### Критический CSS

Inline стилей первого экрана в `<head>` (≤ ~14 КБ вместе с HTML для первого окна TCP), остальное — асинхронно:
```html
<style>/* critical */</style>
<link rel="preload" href="/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/main.css"></noscript>
```
Инструменты: Critters/Beasties (встроен в Angular, плагины для Vite). Минусы — дублирование, кэш хуже (inline не кэшируется отдельно); с HTTP/2 и маленьким CSS часто достаточно разбиения CSS по роутам.

### Стратегии рендеринга

| Стратегия | Как | Плюсы | Минусы | Когда |
|---|---|---|---|---|
| **CSR** | Пустой HTML + JS рендерит | Простой хостинг, богатая интерактивность | Плохой LCP, SEO, зависимость от JS | Админки, за логином |
| **SSR** | HTML на каждый запрос + гидрация | Быстрый FCP/LCP, SEO, персонализация | TTFB зависит от сервера, стоимость, двойная работа (гидрация), uncanny valley (видно, но не кликается) | Персональный, часто меняющийся контент |
| **SSG** | HTML на билде | Лучший TTFB (CDN), дёшево | Билд растёт с числом страниц, устаревание | Документация, блоги, маркетинг |
| **ISR** | SSG + перегенерация по времени/по запросу (on-demand revalidation) | Масштаб SSG + свежесть | Сложность инвалидации, привязка к платформе | Каталоги, e-commerce |
| **Streaming SSR** | HTML кусками, `Suspense`-границы | Ранний TTFB/FCP, медленные части не блокируют | Нельзя менять статус/заголовки после начала стрима | Страницы с медленными источниками данных |
| **Islands** (Astro) | Статичный HTML + гидрация только интерактивных островов | Минимум JS | Сложнее разделять состояние между островами | Контентные сайты |
| **RSC** | Серверные компоненты не попадают в бандл, клиентские — острова | Меньше JS, данные на сервере | Новая ментальная модель, привязка к фреймворку | Next.js App Router |
| **Resumability** (Qwik) | Сервер сериализует состояние и обработчики; на клиенте нет гидрации — код грузится по взаимодействию | Почти нулевой JS на старте | Задержка на первом взаимодействии, экосистема | Контентные сайты с интерактивом |

Также **partial prerendering** (статическая оболочка + стримящиеся динамические дыры) и **selective/progressive hydration**. Подробнее о гидрации — в [03. React](../03-react/) и [04. Vue](../04-vue/).

### Service Worker: стратегии кэширования

| Стратегия | Поведение | Для чего |
|---|---|---|
| Cache first | Кэш, иначе сеть | Хэшированные ассеты, шрифты |
| Network first | Сеть, при ошибке/таймауте — кэш | HTML, API, где важна свежесть |
| Stale-while-revalidate | Кэш сразу, параллельно обновить кэш из сети | Аватары, не критичные данные |
| Network only / Cache only | — | Аналитика / precache оболочки |

Precache оболочки приложения на install (Workbox), runtime-кэширование по роутам, **navigation preload** (запрос навигации стартует параллельно с загрузкой SW), лимиты и экспирация кэша. Жизненный цикл SW — в [07-storage-workers-apis](07-storage-workers-apis.md).

## Вопросы с собеседований

<details><summary>Что такое Core Web Vitals, пороги, и как их считают?</summary>

LCP ≤ 2.5 с (загрузка), INP ≤ 200 мс (отзывчивость), CLS ≤ 0.1 (стабильность). Оценка по p75 реальных пользователей из CrUX за 28 дней, отдельно для mobile/desktop. Страница «проходит», если все три в зоне good. Это часть page experience в ранжировании Google, но важнее связь с бизнес-метриками.
</details>

<details><summary>LCP 4 секунды. Ваш план?</summary>

Сначала поле: какой элемент LCP, на каких устройствах/страницах (web-vitals attribution). Разложить на TTFB / load delay / load duration / render delay и бить по большей части. TTFB → CDN/кэш HTML/Early Hints. Load delay → ресурс в HTML, `fetchpriority=high`, preload, убрать lazy. Duration → формат и размер. Render delay → критический CSS, defer JS, SSR вместо CSR, убрать anti-flicker A/B-скрипты. Потом — проверка в лаборатории, бюджет в CI, мониторинг p75 после релиза.
</details>

<details><summary>Чем INP отличается от FID, и как улучшить INP?</summary>

FID — только input delay первого взаимодействия. INP — все взаимодействия за визит, полная длительность до следующего кадра (input delay + processing + presentation), берётся почти худшее. Улучшение: разбивать long tasks (`scheduler.yield`), минимизировать работу в обработчике до первого кадра, `startTransition`, виртуализация, меньший DOM, вынос в воркер, контроль third-party, LoAF для поиска виновников.
</details>

<details><summary>Почему Lighthouse 95, а в CrUX всё плохо?</summary>

Lab — один прогон, эмуляция устройства, нет реальных взаимодействий (нет INP), нет персонализации, рекламы, A/B, состояния логина, медленных Android, разных сетей. Поле — p75 по всем. Решения — по RUM; Lighthouse — для отладки и контроля регрессий.
</details>

<details><summary>Как устроен tree shaking и почему он может не работать?</summary>

Бандлер строит граф статических ESM-импортов, помечает неиспользуемые экспорты, минификатор удаляет мёртвый код. Не работает: CommonJS (динамический `require`), модули с побочными эффектами на верхнем уровне без `sideEffects: false`, `import *` с динамическим доступом, классы с сайд-эффектами в статических полях, barrel-файлы в некоторых конфигурациях. Проверка — анализатор бандла.
</details>

<details><summary>SSR vs SSG vs ISR vs streaming — как выбрать?</summary>

По частоте изменения и персонализации данных. Одинаково для всех, редко меняется → SSG. Одинаково для всех, меняется часто, страниц много → ISR / CDN с SWR. Персонально → SSR, с streaming для медленных частей. За логином и интерактивно → CSR допустим. Lead добавит: стоимость инфраструктуры, сложность кэширования, TTFB, гидрация как скрытая стоимость и командная экспертиза.
</details>

<details><summary>Что такое гидрация и почему она дорогая? Альтернативы?</summary>

Гидрация — клиент повторно выполняет компонентное дерево, чтобы прикрепить обработчики и состояние к серверному HTML. Цена: загрузка всего JS страницы, его исполнение, «uncanny valley», риск mismatch. Альтернативы: частичная/прогрессивная гидрация, islands (Astro), RSC (серверные компоненты не гидрируются), resumability (Qwik — без повторного выполнения).
</details>

<details><summary>Как бороться с CLS от шрифтов и рекламы?</summary>

Шрифты: preload, `font-display: optional` или подгонка fallback через `size-adjust`/`ascent-override`/`descent-override`, чтобы метрики совпадали. Реклама/баннеры: резервировать слот фиксированного размера (`min-height`), не вставлять над контентом, рисовать поверх. Медиа — размеры/`aspect-ratio`.
</details>

<details><summary>Как внедрить performance-культуру в команду?</summary>

Согласовать бюджеты с бизнесом (данные о конверсии), RUM-дашборд с p75 по ключевым страницам и алертами, Lighthouse CI и size-limit как gate в PR, ревью новых зависимостей, ответственный (perf champion), регулярный разбор регрессий, документированные гайды (картинки, шрифты, lazy-загрузка, third-party политика).
</details>

<details><summary>Какую стратегию Service Worker кэша выбрать для HTML, ассетов и API?</summary>

Хэшированные ассеты — cache first (precache). HTML — network first с таймаутом и фолбэком на кэш/офлайн-страницу (или SWR, если допустима устаревшая оболочка). API — network first или SWR в зависимости от критичности свежести; чувствительное — не кэшировать. Важно: версионирование кэшей, очистка в `activate`, navigation preload.
</details>

## Практика

**Задача 1.** Найдите все проблемы производительности:
```html
<head>
  <script src="https://cdn.ab-test.com/flicker.js"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
  <link rel="stylesheet" href="/all.css"> <!-- 400 КБ -->
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script> <!-- 2 МБ, рендерит hero <img loading="lazy"> -->
</body>
```
<details><summary>Решение</summary>

1. Синхронный сторонний A/B-скрипт в head блокирует парсинг (и обычно скрывает страницу) → серверный A/B или async + ограниченный anti-flicker.
2. Google Fonts — два доп. origin в критическом пути → self-host, preload, `font-display`.
3. 400 КБ render-blocking CSS → критический CSS + разбиение по роутам, удалить неиспользуемое (Coverage).
4. CSR: 2 МБ бандл до первого контента → SSR/SSG, code splitting, `defer`/module.
5. LCP-картинка в JS и с `loading="lazy"` → в HTML, `fetchpriority="high"`, без lazy, размеры.
</details>

**Задача 2.** Обработчик фильтра таблицы на 10 000 строк даёт INP 600 мс. Предложите решение на React 19.
<details><summary>Решение</summary>

Разделить срочное (значение инпута) и несрочное (фильтрация) — `useDeferredValue` или `startTransition`; виртуализировать список (рендерить ~50 видимых строк — TanStack Virtual); мемоизировать строки; при необходимости фильтрацию — в Web Worker.
```tsx
function Table({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);               // фильтр пересчитается в фоне, ввод не блокируется
  const visible = useMemo(() => rows.filter((r) => r.name.includes(deferred)), [rows, deferred]);
  return (<>
    <input value={query} onChange={(e) => setQuery(e.target.value)} />
    <VirtualList items={visible} stale={query !== deferred} />
  </>);
}
```
</details>

**Задача 3.** Реализуйте stale-while-revalidate в Service Worker для `/api/feed`.
<details><summary>Решение</summary>

```ts
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
const CACHE = 'api-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname !== '/api/feed') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    const network = fetch(event.request).then(async (res) => {
      if (res.ok) await cache.put(event.request, res.clone());
      return res;
    });
    event.waitUntil(network.catch(() => undefined));   // фоновое обновление не прервётся
    return cached ?? network;                          // мгновенно из кэша, иначе ждём сеть
  })());
});
```
</details>

## Источники
- https://web.dev/articles/vitals
- https://web.dev/articles/lcp
- https://web.dev/articles/optimize-lcp
- https://web.dev/articles/inp
- https://web.dev/articles/optimize-inp
- https://web.dev/articles/cls
- https://web.dev/articles/optimize-cls
- https://web.dev/articles/lab-and-field-data-differences
- https://web.dev/articles/rendering-on-the-web
- https://web.dev/articles/bfcache
- https://github.com/GoogleChrome/web-vitals
- https://developer.chrome.com/docs/devtools/performance
- https://developer.chrome.com/docs/lighthouse/overview
- https://developer.chrome.com/docs/web-platform/long-animation-frames
- https://developer.chrome.com/docs/workbox/caching-strategies-overview
- https://developer.chrome.com/docs/crux
