# Оптимизация бандла

> ⏱ ~3 ч · 🎯 Найти, что раздувает бандл, и уменьшить JS на старте: code splitting, tree shaking, замена зависимостей, изображения, бюджеты в CI.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Умею построить отчёт о составе бандла и найти тяжёлые модули
- [ ] Разделяю код по маршрутам и тяжёлым виджетам
- [ ] Знаю, что ломает tree shaking и как это проверить
- [ ] Оптимизирую изображения и шрифты (`srcset`, `<picture>`, AVIF/WebP, `font-display`)
- [ ] Настроил бюджет размера в CI
- [ ] Ответил вслух на вопросы ниже

## Теория

### Почему размер JS важен

JS дороже картинок того же веса: его нужно скачать, распаковать, **распарсить, скомпилировать и выполнить** в главном потоке. На среднем Android-устройстве 1 MB JS — это секунды CPU. Это бьёт по LCP (если рендер ждёт JS) и INP (длинные задачи блокируют ввод). См. [Web Performance](../06-web-platform/05-web-performance.md).

### Шаг 1. Измерить

- Отчёт о составе: `rollup-plugin-visualizer` / `vite-bundle-analyzer` (Vite), `webpack-bundle-analyzer`, Rsdoctor (Rspack/webpack), `source-map-explorer` для любого бандла со sourcemap.
- Покрытие кода: DevTools → Coverage — сколько загруженного JS не выполнилось на старте.
- Стоимость пакета до установки: bundlephobia, pkg-size.dev.
- Метрики: Lighthouse (Total Blocking Time, «Reduce unused JavaScript»), RUM.

### Шаг 2. Не грузить лишнее на старте

```tsx
import { lazy, Suspense } from 'react';

// Каждая страница — отдельный чанк, грузится при переходе
const Reports = lazy(() => import('./pages/reports'));

// Тяжёлый виджет — по взаимодействию
async function openEditor() {
  const { RichEditor } = await import('./widgets/rich-editor');
  // ...
}
```

- **По маршрутам** — базовый уровень (в Next.js/Nuxt/React Router — автоматически).
- **По взаимодействию** — редакторы, графики, карты, модалки, emoji-пикеры.
- **По видимости** — ниже первого экрана (`IntersectionObserver`), отложенная гидратация (`hydrate-on-visible` в Nuxt, `defineLazyHydrationComponent`).
- **Prefetch** — подгрузить чанк вероятного следующего маршрута при наведении или в простое (`<link rel="modulepreload">`, Speculation Rules).

🪤 **Ловушка:** слишком мелкое дробление → водопад запросов и хуже кэширование. Группируйте модули, которые всегда нужны вместе.

### Шаг 3. Уменьшить то, что грузится

- **Tree shaking**: ESM-зависимости, `sideEffects: false`, импорт конкретных модулей вместо «бочек» (`import debounce from 'lodash-es/debounce'`), осторожно с `import *`.
- **Замена тяжёлых зависимостей**: `moment` → `date-fns`/`Intl`/Temporal, `lodash` → нативные методы, огромные иконочные пакеты → импорт по одной иконке или SVG-спрайт, полифилы — только для реально поддерживаемых браузеров (Browserslist, `core-js` с `usage`).
- **Дубликаты**: разные версии одной библиотеки в бандле (`pnpm why`, `npm ls`, дедупликация, overrides).
- **Современный синтаксис**: таргет `es2022`+ и без лишней транспиляции — меньше кода и быстрее выполнение.
- **CSS**: удаление неиспользуемого (Tailwind делает это сам), критический CSS инлайном, остальное — асинхронно.
- **Сжатие**: Brotli/Zstandard на CDN, предварительное сжатие ассетов при сборке.

### Изображения и шрифты

Часто они весят больше JS:
- Форматы AVIF/WebP, адаптивные размеры через `srcset` + `sizes`, арт-дирекшн через `<picture>`.
- `width`/`height` или `aspect-ratio` — против CLS.
- `loading="lazy"` для изображений ниже первого экрана, `fetchpriority="high"` для LCP-картинки (и не лениво!).
- Шрифты: WOFF2, сабсеттинг (`unicode-range`), `font-display: swap`/`optional`, preload основного начертания, метрические override (`size-adjust`) против сдвига.

### Шаг 4. Не дать регрессировать

Бюджет размера в CI: `size-limit` или `bundlesize` (лимит gzip/brotli на ключевые чанки), комментарий в PR с разницей, Lighthouse CI с порогами метрик. Владелец бюджета решает, можно ли его поднять.

```json
// .size-limit.json
[
  { "path": "dist/assets/index-*.js", "limit": "120 kB" },
  { "path": "dist/assets/vendor-*.js", "limit": "90 kB" }
]
```

### Долгое кэширование и разбиение vendor

Выделение стабильных библиотек в отдельный чанк (`manualChunks` или правила группировки чанков Rolldown в Vite, `splitChunks.cacheGroups` в webpack) позволяет не перекачивать их при каждом релизе. Но огромный vendor-чанк, нужный только на одной странице, ухудшает старт — разбивайте по реальному использованию.

## Вопросы с собеседований

<details><summary>Бандл 2 MB, первая загрузка медленная. Ваши действия?</summary>

Измерить: анализатор бандла, Coverage, Lighthouse, RUM по устройствам. Затем: разделение по маршрутам и тяжёлым виджетам, удаление и замена тяжёлых библиотек, дедупликация версий, проверка tree shaking, современный таргет, отложенная загрузка сторонних скриптов, оптимизация изображений и шрифтов, Brotli. Закрепить бюджетом в CI. Подтвердить эффект метриками до/после.
</details>

<details><summary>Что такое code splitting и как он реализуется?</summary>

Разбиение кода на чанки, загружаемые по требованию. Граница — динамический `import()`: сборщик выносит модуль и его зависимости в отдельный файл и подгружает при вызове. В React — `lazy` + `Suspense`, во Vue — `defineAsyncComponent` и ленивые маршруты.
</details>

<details><summary>Почему `import { debounce } from 'lodash'` может притащить всю библиотеку?</summary>

Пакет `lodash` — CommonJS, статический анализ невозможен, tree shaking не работает. Решения: `lodash-es` (ESM), точечный импорт `lodash/debounce`, нативная реализация.
</details>

<details><summary>Как проверить, что tree shaking работает?</summary>

Посмотреть анализатор бандла (есть ли неиспользуемые модули пакета), собрать тестовый вход, импортирующий одну функцию, и посмотреть размер; проверить `sideEffects` в `package.json` пакета и наличие ESM-сборки (`exports`/`module`).
</details>

<details><summary>Почему LCP-картинку нельзя загружать лениво?</summary>

`loading="lazy"` откладывает загрузку до вычисления раскладки и проверки видимости — главная картинка начнёт грузиться позже. Для неё — обычная загрузка, `fetchpriority="high"` и, при необходимости, `<link rel="preload" as="image">`.
</details>

## Практика

1. Подключите визуализатор к своему проекту и найдите три самых тяжёлых модуля.
2. Вынесите одну тяжёлую страницу в ленивый чанк и сравните размер стартового JS.
3. Настройте `size-limit` и проверьте, что PR с лишней зависимостью падает.

Тест темы: [Оптимизация бандла](../quizzes/quiz.html?id=10-tooling-testing/03-bundle-optimization).

## Источники
- [web.dev: Reduce JavaScript payloads with code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
- [web.dev: Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp)
- [MDN: Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [size-limit](https://github.com/ai/size-limit)
- [Vite: Building for Production](https://vite.dev/guide/build.html)
