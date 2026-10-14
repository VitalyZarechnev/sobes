# Модули, память, сборка мусора

> ⏱ ~3.5 ч · 🎯 Объяснять различия ESM и CommonJS на уровне загрузки и связывания, понимать, от чего зависит tree-shaking, знать устройство GC в V8 (поколения, mark-and-sweep, конкурентность) и уметь находить утечки памяти в DevTools по методике, а не наугад.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю 3 фазы загрузки ESM и что такое live binding
- [ ] Понимаю, как ведут себя циклические зависимости в ESM и CJS
- [ ] Могу перечислить условия, при которых tree-shaking не работает
- [ ] Могу объяснить generational GC в V8 и почему «stop-the-world» паузы стали короткими
- [ ] Умею методику «три снапшота» и чтение Retainers в DevTools

## Теория

### ESM vs CommonJS

| | ES Modules | CommonJS |
|---|---|---|
| Синтаксис | `import` / `export` | `require()` / `module.exports` |
| Структура | **Статическая**: импорты на верхнем уровне, известны до выполнения | Динамическая: `require` — обычная функция, вызывается где угодно |
| Загрузка | Асинхронная, граф загружается до выполнения | Синхронная, файл читается в момент `require` |
| Привязки | **Live bindings**: импорт — ссылка на переменную экспортирующего модуля, только для чтения | Копия значения `module.exports` в момент вызова |
| Top-level `await` | Да | Нет |
| `this` на верхнем уровне | `undefined` | `module.exports` |
| Strict mode | Всегда | Только с `'use strict'` |
| Путь к файлу | `import.meta.url`, `import.meta.dirname` (Node 20.11+) | `__filename`, `__dirname` |
| Tree-shaking | Надёжный | Практически невозможен (бандлеры делают эвристики) |

```js
// counter.js (ESM)
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from './counter.js';
inc();
console.log(count);   // 1 — live binding
// count = 5;         // TypeError: Assignment to constant variable — импорт read-only
```

В CJS аналогичный код выведет `0`: `const { count } = require('./counter')` копирует примитив.

**Совместимость в Node**: из ESM можно импортировать CJS (`module.exports` становится default-экспортом, именованные — по статическому анализу `cjs-module-lexer`). `require(esm)` поддерживается в современных версиях Node (без флага с 22.12 / 20.19) для модулей без top-level await. Тип файла определяет расширение (`.mjs`/`.cjs`) или поле `"type"` в `package.json`. Для библиотек — поле `"exports"` с условиями `import`/`require`/`types`; dual package hazard — два экземпляра модуля (и два синглтона), если его загрузили и как ESM, и как CJS.

### Как загружается ESM: три фазы

1. **Construction**: найти, загрузить и распарсить все модули графа, начиная с entry. Каждый модуль один раз на URL (module map) — поэтому модуль — естественный синглтон.
2. **Linking (instantiation)**: создать Module Environment Records и связать импорты с экспортами (ещё без значений). Ошибка «нет такого экспорта» — здесь, до выполнения кода.
3. **Evaluation**: выполнить тела модулей в порядке обхода в глубину (post-order): зависимости раньше зависимых.

Из этого следует поведение **циклических зависимостей**: если `a.js` импортирует `b.js`, а `b.js` — `a.js`, то `b` выполнится первым и, обратившись на верхнем уровне к `let`/`const`/`class` из `a`, получит `ReferenceError` (TDZ). Обращение внутри функции, вызванной позже, — работает. В CJS цикл даёт **частично заполненный** `module.exports` — тихий `undefined` вместо ошибки.

Top-level await делает модуль асинхронным: зависимые от него модули ждут, но независимые соседние ветки графа продолжают выполняться.

### Модули в браузере

- `<script type="module">` — по умолчанию `defer`, strict, своя область, загрузка с CORS, выполняется один раз даже при повторном подключении.
- `<link rel="modulepreload">` — предзагрузка с разбором, чтобы не ловить waterfall глубокого графа.
- Import maps (`<script type="importmap">`) — bare specifiers (`import 'react'`) без бандлера.
- Import attributes: `import data from './data.json' with { type: 'json' }` — защита от выполнения JSON как JS при подмене MIME.

### Dynamic import

`import(specifier)` — выражение, возвращает промис с namespace-объектом модуля. Работает и в CJS. Это точка разделения кода (code splitting) для бандлеров.

```js
async function openEditor() {
  const { createEditor } = await import('./editor.js');  // отдельный чанк
  return createEditor(document.querySelector('#editor'));
}

// Предзагрузка по намерению: начинаем грузить при наведении, а не по клику
button.addEventListener('pointerenter', () => import('./editor.js'), { once: true });
```

🪤 Ловушка: шаблонный путь `import(\`./locales/${lang}.js\`)` бандлер превращает в набор чанков для всех файлов, подходящих под маску. Полностью динамический путь из переменной бандлер разрешить не может.

### Tree-shaking

Удаление неиспользуемых экспортов на основе статического графа импортов. Ломается, когда:
- модуль в CommonJS (или транспилирован в CJS, например `"module": "commonjs"` в tsconfig для библиотеки);
- у модуля есть **побочные эффекты** на верхнем уровне (полифиллы, регистрация, `window.x = ...`), и пакет не объявил `"sideEffects": false` (или список файлов с эффектами) в `package.json`;
- вызов функции на верхнем уровне (`export const api = createApi()`) — бандлер не знает, чистая ли она; помогает аннотация `/*#__PURE__*/`;
- классы со статическими инициализаторами/декораторами — считаются эффектами;
- импорт через `import * as ns` и динамический доступ `ns[key]`;
- **barrel-файлы** (`index.ts` с `export * from ...`) — формально шейкаются, но заставляют бандлер и dev-сервер парсить весь граф; в dev (Vite, Jest) это ощутимо замедляет работу, а один модуль с эффектом в barrel тянет всё.

💡 На собеседовании: «Tree-shaking — это не магия бандлера, а контракт библиотеки: ESM-сборка, `sideEffects` в `package.json`, отсутствие эффектов на верхнем уровне. Я проверяю результат анализатором бандла, а не верю на слово».

### Модульные синглтоны и SSR

Модуль выполняется один раз на процесс. В SSR (Next.js, Nuxt) это значит: `export const store = createStore()` на уровне модуля **общий для всех запросов** — утечка данных между пользователями и памяти. Состояние запроса создаётся на запрос (фабрика, контекст, `AsyncLocalStorage`).

### Сборка мусора: основа

Память освобождается не по счётчику ссылок (он не справляется с циклами), а по **достижимости**: объект жив, если до него есть путь от корней — глобальный объект, текущий стек вызовов и их окружения, активные хендлы (таймеры, слушатели, незавершённые промисы, на которые есть ссылки извне).

**Mark-and-sweep**: пометить всё достижимое от корней → освободить непомеченное. Циклы, недостижимые от корней, собираются.

### GC в V8 (Orinoco)

**Гипотеза поколений**: большинство объектов умирают молодыми. Поэтому куча разделена:

| Поколение | Алгоритм | Свойства |
|---|---|---|
| Young (nursery + intermediate, единицы-десятки МБ) | **Scavenger**: копирующий сборщик (semi-space). Живые объекты копируются в другую половину; пережившие два цикла переезжают в old | Очень быстрый, стоимость ∝ числу **живых** объектов; работает параллельно в нескольких потоках |
| Old | **Mark-Sweep-Compact**: пометка, очистка, дефрагментация (compaction) по необходимости | Пометка **конкурентная** (в фоновых потоках, пока JS работает) и **инкрементальная**; финальная пауза короткая |

Чтобы минорная сборка не сканировала всю старую кучу, V8 хранит **remembered set** ссылок old → young, поддерживаемый **write barrier** при записи в поля объектов. V8 также запускает GC в простое (idle-time GC), в т.ч. между кадрами.

Практические выводы для фронтенда:
- миллионы короткоживущих объектов в горячем цикле (например, `{x, y}` на каждый `mousemove`) создают давление на young generation и частые сборки — видно как пилообразный график памяти и мелкие GC в Performance;
- рост «ступеньками», не падающий после GC, — признак утечки;
- `delete` и изменение формы объектов вредят не памяти, а скорости (hidden classes).

### Типичные утечки во фронтенде

| Источник | Пример | Лечение |
|---|---|---|
| Слушатели на долгоживущих объектах | `window.addEventListener('resize', ...)` в компоненте | Отписка в cleanup, `{ signal }` |
| Таймеры | `setInterval` без `clearInterval` | Cleanup в `useEffect`/`onUnmounted` |
| Detached DOM | Ссылка на удалённый узел в массиве/кэше/замыкании | Обнулять, `WeakMap`/`WeakRef` |
| Неограниченные кэши | Модульный `Map` с ключами-запросами | LRU, TTL, `WeakMap` по объекту |
| Подписки | Store, WebSocket, EventEmitter, `ResizeObserver`/`IntersectionObserver` без `disconnect` | Отписка/`disconnect` |
| Замыкания | Колбэк удерживает общий Context с большим объектом | См. [02-scope-closures-hoisting.md](02-scope-closures-hoisting.md) |
| `console.log(obj)` | DevTools удерживает залогированные объекты | Не логировать большие объекты в проде |
| Незавершённые промисы | Промис, ждущий вечно, удерживает свою цепочку колбэков | Таймауты, отмена |

### Поиск утечек в Chrome DevTools: методика

1. **Воспроизвести** сценарий, который предположительно течёт (открыть-закрыть модалку, перейти по роутам туда-обратно).
2. **Performance panel** с включённым Memory: записать несколько повторов сценария. Если после каждого цикла и принудительного GC (иконка корзины) JS heap и количество DOM-узлов/слушателей растут — утечка подтверждена.
3. **Memory → Heap snapshot**, методика трёх снапшотов: снимок 1 (базовый) → сценарий → снимок 2 → сценарий ещё раз → снимок 3. В снимке 3 выбрать «Objects allocated between Snapshot 1 and Snapshot 2» — объекты, пережившие повторный цикл, — кандидаты.
4. Режим **Comparison** показывает дельту по конструкторам (`# Delta`, `Size Delta`). Фильтр по строке `Detached` находит отсоединённые DOM-деревья.
5. Для подозрительного объекта открыть **Retainers** — цепочку ссылок до корня. Ищем «наш» код: `(closure)`, `context`, имя компонента, `listeners`, модульная `Map`.
6. **Shallow size** — память самого объекта; **Retained size** — сколько освободится, если его удалить. Сортировка по retained size показывает «корень проблемы».
7. **Allocation instrumentation on timeline** — где и когда выделялись объекты, оставшиеся живыми (синие столбики).
8. В проде: `performance.measureUserAgentSpecificMemory()` (требует cross-origin isolation), RUM-метрики, Node — `--inspect` + те же снапшоты, `process.memoryUsage()`.

## Вопросы с собеседований

<details><summary>Чем ESM отличается от CommonJS?</summary>

Статическая структура против динамической, асинхронная загрузка графа с тремя фазами против синхронного `require`, live bindings против копии значений, top-level await, strict mode по умолчанию. Статичность даёт раннее обнаружение ошибок импорта, tree-shaking, параллельную загрузку. Для lead: interop в Node (`require(esm)`, `exports`-условия), dual package hazard, переход библиотек на ESM-only.
</details>

<details><summary>Что такое live binding? Приведите практический пример.</summary>

Импорт — не копия, а ссылка на привязку в модуле-экспортёре; изменения видны импортёрам, но присвоить импорту нельзя. Пример: модуль экспортирует `let config` и функцию `setConfig`, все импортёры видят новое значение. Это же позволяет циклическим зависимостям работать для функций, вызываемых после инициализации.
</details>

<details><summary>Как ведут себя циклические зависимости?</summary>

ESM: граф связывается до выполнения, модули исполняются в post-order DFS; модуль, выполнившийся первым, видит экспорты второго в TDZ — `ReferenceError` при обращении на верхнем уровне, но нормальная работа при обращении из функций позже. CJS: возвращается незаконченный `module.exports` — тихие `undefined`. Лечение: выносить общий код в третий модуль, инверсия зависимостей, ленивый `import()`; обнаружение — `madge`, `eslint-plugin-import/no-cycle`.
</details>

<details><summary>Почему tree-shaking может не работать?</summary>

CJS-сборка библиотеки, побочные эффекты верхнего уровня без `sideEffects: false`, вызовы функций при инициализации без `/*#__PURE__*/`, классы со статикой/декораторами, динамический доступ к namespace, импорт из barrel с эффектным модулем. Проверка — bundle analyzer, `rollup-plugin-visualizer`, `source-map-explorer`.
</details>

<details><summary>Как работает сборщик мусора в V8?</summary>

Отслеживающий (tracing) GC по достижимости от корней. Куча поделена на поколения: молодое собирается быстрым копирующим scavenger-ом (стоимость пропорциональна живым объектам), старое — mark-sweep-compact. Пометка в старом поколении конкурентная и инкрементальная, работа распараллелена, поэтому паузы главного потока — единицы миллисекунд. Write barriers поддерживают remembered set для ссылок old→young.
</details>

<details><summary>Почему подсчёт ссылок не используется?</summary>

Циклические структуры (родитель ↔ ребёнок, DOM ↔ JS-обработчик) никогда не получат счётчик 0 и утекут. Старые IE использовали подсчёт ссылок для COM/DOM-объектов, отсюда исторические утечки при циклах JS↔DOM. Tracing-GC собирает циклы, недостижимые от корней.
</details>

<details><summary>Как найти утечку памяти в SPA?</summary>

Воспроизвести сценарий циклически, в Performance с Memory убедиться, что heap и DOM-узлы растут после GC. Затем три heap snapshot-а и Comparison, фильтр `Detached`, сортировка по retained size, анализ Retainers до кода приложения. Allocation timeline — где выделялось. Типичные находки: неотписанные слушатели и подписки, таймеры, detached DOM в замыканиях и кэшах, неограниченные Map. Для lead: включить проверку утечек в e2e (замер heap после N повторов сценария, например через Puppeteer/Playwright и `memlab`).
</details>

<details><summary>Что такое detached DOM и как он возникает?</summary>

Узел удалён из документа, но на него есть ссылка из JS — он (и всё его поддерево, ведь узлы связаны parent/child) не собирается. Возникает при хранении узлов в массивах, кэшах, замыканиях обработчиков на `window`, в сторонних библиотеках, не уничтоживших инстанс. В heap snapshot ищется по фильтру `Detached`.
</details>

<details><summary>Почему модульное состояние опасно в SSR?</summary>

Модуль выполняется один раз на процесс Node, состояние на уровне модуля разделяется между всеми запросами: данные одного пользователя могут попасть в HTML другого, а память растёт. Состояние должно создаваться на запрос: фабрики сторов, контекст фреймворка, `AsyncLocalStorage`. Pinia и Redux-документация прямо предписывают создавать store на запрос в SSR.
</details>

## Практика

**1. Предскажите результат.**

```js
// a.js
import { b } from './b.js';
export const a = 'A';
console.log('a.js:', b);

// b.js
import { a } from './a.js';
export const b = 'B';
console.log('b.js:', typeof a === 'string' ? a : 'n/a');

// main.js
import './a.js';
```

<details><summary>Ответ</summary>

`b.js` выполняется первым (post-order). `typeof a` для привязки в TDZ бросает `ReferenceError` — модуль упадёт. Если бы `b.js` обращался к `a` внутри функции, вызванной позже, всё работало бы. Вывод: `ReferenceError: Cannot access 'a' before initialization`.
</details>

**2. Найдите утечку.**

```js
const cache = new Map();
export function useUserCard(el, user) {
  cache.set(el, { user, rendered: render(user) });
  const observer = new ResizeObserver(() => relayout(el));
  observer.observe(el);
}
```

<details><summary>Решение</summary>

Две утечки: модульный `Map` держит DOM-элементы (detached после удаления) и данные навсегда; `ResizeObserver` не отключается. Исправление: `WeakMap` для кэша по элементу и возврат функции очистки.

```js
const cache = new WeakMap();
export function useUserCard(el, user) {
  cache.set(el, { user, rendered: render(user) });
  const observer = new ResizeObserver(() => relayout(el));
  observer.observe(el);
  return () => observer.disconnect();
}
```
</details>

**3. Спроектируйте ленивую загрузку тяжёлой библиотеки графиков так, чтобы: (а) она не попала в основной бандл, (б) повторные вызовы не грузили её снова, (в) ошибка сети позволяла повторить попытку.**

<details><summary>Решение</summary>

```js
let chartsPromise = null;
export function loadCharts() {
  chartsPromise ??= import('./heavy-charts.js').catch((err) => {
    chartsPromise = null;          // сбрасываем, чтобы следующий вызов повторил загрузку
    throw err;
  });
  return chartsPromise;
}
```
Модульная система сама кэширует успешно загруженный модуль, но кэширование промиса избавляет от гонок и даёт контроль над ошибками. Добавить предзагрузку по `pointerenter`/`IntersectionObserver` и `<link rel="modulepreload">` для критичных путей.
</details>

## Источники
- https://learn.javascript.ru/modules-intro
- https://learn.javascript.ru/import-export
- https://learn.javascript.ru/modules-dynamic-imports
- https://learn.javascript.ru/garbage-collection
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management
- https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
- https://v8.dev/blog/trash-talk
- https://v8.dev/blog/orinoco-parallel-scavenger
- https://developer.chrome.com/docs/devtools/memory-problems
- https://nodejs.org/api/modules.html
- https://webpack.js.org/guides/tree-shaking/
