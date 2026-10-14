# Canvas 2D: основы рисования

> ⏱ ~4 ч · 🎯 Уверенно рисовать на `<canvas>` без библиотек: пути, стили, текст, изображения, трансформации со стеком состояний, чёткая картинка на retina и попиксельная обработка через `ImageData`. Понимать, чем immediate mode отличается от DOM/SVG.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Покрутил ползунки в демо [01-shapes-playground](demos/01-shapes-playground.html)
- [ ] Сравнил размытый и чёткий canvas в демо [02-dpr-sharpness](demos/02-dpr-sharpness.html)
- [ ] Объясняю порядок применения `translate → rotate → scale` и зачем `save/restore`
- [ ] Написал фильтр «оттенки серого» через `getImageData`/`putImageData`

## Теория

### Что такое canvas и immediate mode

`<canvas>` — это **растровый буфер** (битмап) плюс API для рисования в него. Модель — **immediate mode**: вызов `fillRect` сразу закрашивает пиксели, и canvas **не помнит**, что там был «прямоугольник». Нет объектов, событий на фигурах, CSS-селекторов, доступности — всё это вы строите сами (см. [сцена-граф](02-animation-and-interaction.md#сцена-граф-своими-руками)).

Противоположность — **retained mode** (DOM, SVG, Three.js-сцена): вы описываете дерево объектов, движок сам перерисовывает при изменениях.

| | Canvas 2D | SVG/DOM |
|---|---|---|
| Модель | immediate, пиксели | retained, дерево узлов |
| Масштабирование | растр, нужно перерисовывать | вектор, бесплатно |
| События на фигурах | вручную (hit-testing) | из коробки |
| Тысячи объектов | дёшево | дорого (DOM-узлы, layout) |
| Доступность | нет (fallback-контент, ARIA вокруг) | частично есть |

### Контекст и размеры

```html
<canvas id="c" width="600" height="400">Ваш браузер не поддерживает canvas</canvas>
```

```js
const canvas = document.querySelector('#c');
const ctx = canvas.getContext('2d'); // 'webgl', 'webgl2', 'webgpu', 'bitmaprenderer'
if (!ctx) throw new Error('2D context не поддерживается');
```

Два разных размера:
- **атрибуты `width`/`height`** — размер буфера в пикселях (по умолчанию 300×150);
- **CSS `width`/`height`** — размер на странице. Если они не совпадают, браузер растягивает битмап → мыло или искажение пропорций.

🪤 Ловушка: изменение `canvas.width` (даже присваивание того же значения) **очищает буфер и сбрасывает всё состояние контекста** (трансформации, стили). Поэтому ресайз — только в обработчике `ResizeObserver`, а не каждый кадр.

Контекст получают **один раз**: повторный `getContext('2d')` вернёт тот же объект, а `getContext('webgl')` на canvas с 2D-контекстом вернёт `null` — тип контекста не меняется.

Полезные опции: `getContext('2d', { alpha: false })` (непрозрачный фон — браузеру проще композить), `{ willReadFrequently: true }` (буфер держится в CPU-памяти — быстрее частые `getImageData`, медленнее рисование).

### Система координат

Начало `(0, 0)` — **левый верхний угол**, X вправо, **Y вниз** (в отличие от математики и WebGL). Единица — пиксель буфера (с учётом текущей трансформации).

Полупиксели: линия толщиной 1 px по координате `x = 10` закрывает пиксели от 9.5 до 10.5 → два полупрозрачных пикселя, линия выглядит серой и размытой. Решение — `x = 10.5` или чётная толщина.

### Пути (paths)

Всё, кроме прямоугольников (`fillRect`, `strokeRect`, `clearRect`), рисуется через путь:

```js
ctx.beginPath();            // ОБЯЗАТЕЛЬНО: иначе новый путь добавится к старому
ctx.moveTo(50, 50);         // «поднять перо» и перенести
ctx.lineTo(150, 50);
ctx.lineTo(100, 130);
ctx.closePath();            // линия к началу подпути
ctx.fillStyle = '#4f7cff';
ctx.fill();                 // заливка (правило 'nonzero' по умолчанию, можно 'evenodd')
ctx.lineWidth = 4;
ctx.strokeStyle = '#1b2a4a';
ctx.stroke();               // обводка поверх заливки
```

Примитивы пути: `arc(x, y, r, startAngle, endAngle, ccw)` (углы в **радианах**, 0 — направление вправо, рост по часовой из-за Y вниз), `arcTo`, `ellipse`, `rect`, `roundRect(x, y, w, h, radii)`, `quadraticCurveTo`, `bezierCurveTo`.

🪤 Ловушка: забытый `beginPath()` в цикле — каждый следующий `stroke()` перерисовывает все предыдущие фигуры. Симптом: с каждым кадром линии «жирнеют», а FPS падает.

**`Path2D`** — переиспользуемый объект пути, можно создать из SVG-строки и передавать в `fill`, `stroke`, `isPointInPath`:

```js
const heart = new Path2D('M10 30 A20 20 0 0 1 50 30 A20 20 0 0 1 90 30 Q90 60 50 90 Q10 60 10 30 Z');
ctx.fill(heart);
ctx.isPointInPath(heart, x, y); // hit-testing без повторного построения
```

### Стили, прозрачность, композитинг

- `fillStyle` / `strokeStyle` — цвет (любой CSS-цвет), `CanvasGradient` или `CanvasPattern`.
- `lineWidth`, `lineCap` (`butt|round|square`), `lineJoin` (`miter|round|bevel`), `setLineDash([5, 3])`, `lineDashOffset` (анимация «бегущих муравьёв»).
- `globalAlpha` — прозрачность всего последующего рисования.
- `globalCompositeOperation` — как новые пиксели смешиваются со старыми: `source-over` (по умолчанию), `destination-out` (ластик), `lighter` (сложение — свечение частиц), `multiply`, `screen`…
- `shadowBlur`, `shadowColor`, `shadowOffsetX/Y` — красиво, но **дорого**; `filter = 'blur(4px)'` — CSS-фильтры (поддержка не везде одинакова).

### Градиенты и паттерны

```js
const lin = ctx.createLinearGradient(0, 0, 200, 0);   // вектор градиента в координатах canvas
lin.addColorStop(0, '#ff6b35');
lin.addColorStop(1, '#4f7cff');

const rad = ctx.createRadialGradient(100, 100, 10, 100, 100, 80); // две окружности
rad.addColorStop(0, 'white');
rad.addColorStop(1, 'transparent');

const conic = ctx.createConicGradient(0, 100, 100);   // угол старта, центр

ctx.fillStyle = lin;
ctx.fillRect(0, 0, 200, 100);

const pattern = ctx.createPattern(img, 'repeat');     // img/canvas/ImageBitmap
```

🪤 Ловушка: координаты градиента задаются в системе canvas, а не фигуры. Сдвинули прямоугольник на 300 px — градиент «остался» на месте. Решение: `translate` к фигуре и рисовать в локальных координатах.

### Текст

```js
ctx.font = '600 24px Inter, system-ui, sans-serif'; // синтаксис CSS font
ctx.textAlign = 'center';      // относительно x: start|end|left|right|center
ctx.textBaseline = 'middle';   // относительно y: top|middle|alphabetic|bottom
ctx.fillText('Привет', 150, 75, /* maxWidth */ 280);
const m = ctx.measureText('Привет');
const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
```

Нюансы: canvas не переносит строки — перенос считается вручную через `measureText`. Веб-шрифт должен быть загружен **до** рисования: `await document.fonts.load('600 24px Inter')`, иначе отрисуется fallback и не перерисуется сам.

### Изображения

```js
const img = new Image();
img.src = '/sprite.png';
await img.decode();                                // дождаться загрузки и декодирования
ctx.drawImage(img, dx, dy);                        // как есть
ctx.drawImage(img, dx, dy, dw, dh);                // с масштабом
ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); // вырезать кадр из спрайт-листа

const bitmap = await createImageBitmap(blob);      // декодирование вне main thread, работает в воркерах
ctx.imageSmoothingEnabled = false;                 // пиксель-арт без размытия при масштабе
```

🪤 Ловушка — **tainted canvas**: после `drawImage` картинки с чужого origin без CORS canvas «заражается», и `getImageData`/`toDataURL`/`toBlob` бросают `SecurityError`. Решение: `img.crossOrigin = 'anonymous'` + сервер отдаёт `Access-Control-Allow-Origin`.

### Трансформации и save/restore

Контекст хранит **матрицу текущей трансформации** (CTM) 2D-аффинного преобразования:

```
| a c e |     x' = a·x + c·y + e
| b d f |     y' = b·x + d·y + f
| 0 0 1 |
```

- `translate(tx, ty)`, `rotate(rad)`, `scale(sx, sy)` — **домножают** текущую матрицу справа: `M = M · T`.
- `setTransform(a, b, c, d, e, f)` — заменяет, `resetTransform()` — сбрасывает, `getTransform()` возвращает `DOMMatrix`.

Порядок важен. Вызовы применяются к **системе координат**, а к точке — в обратном порядке. Классика «повернуть фигуру вокруг её центра»:

```js
ctx.save();                        // положить состояние в стек
ctx.translate(cx, cy);             // 3) перенести начало в центр фигуры
ctx.rotate(angle);                 // 2) повернуть оси
ctx.scale(s, s);                   // 1) масштабировать
ctx.fillRect(-w / 2, -h / 2, w, h); // рисуем в ЛОКАЛЬНЫХ координатах вокруг (0,0)
ctx.restore();                     // вернуть всё как было
```

`save()` кладёт в стек **всё состояние**: матрицу, `fillStyle`, `strokeStyle`, `lineWidth`, `globalAlpha`, `font`, `clip`-область, тени, композитинг. Путь и пиксели в стек **не** входят. Каждому `save` — ровно один `restore`, иначе стек растёт, а трансформации «накапливаются». Современный `ctx.reset()` полностью сбрасывает контекст (поддержка свежая — проверяйте).

💡 На собеседовании: «Трансформации домножаются справа, поэтому в коде они идут в порядке "от мира к объекту": `translate`, потом `rotate`, потом `scale`, а точка проходит их в обратном порядке. Иерархия объектов (рука → кисть) — это вложенные `save/translate/rotate/…/restore`, по сути стек матриц сцена-графа».

Обрезка: `ctx.beginPath(); ctx.rect(...); ctx.clip();` — всё последующее рисуется только внутри. Сбросить клип можно только через `restore`.

Демо: [01-shapes-playground.html](demos/01-shapes-playground.html) — ползунки translate/rotate/scale, переключатель порядка операций.

### devicePixelRatio и чёткость на retina

`window.devicePixelRatio` (DPR) — сколько физических пикселей в одном CSS-пикселе (2–3 на телефонах и Retina). Если canvas 300×150 буфера растянут на 300×150 CSS-пикселей при DPR=2, браузер апскейлит в 2 раза → мыло.

```js
function setupHiDPI(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);   // буфер в физических пикселях
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);      // рисуем дальше в CSS-пикселях
  return ctx;
}
```

Детали senior-уровня:
- Используйте `ResizeObserver` с `devicePixelContentBoxSize` (где поддерживается) — точный размер в физических пикселях без ошибок округления.
- DPR меняется при zoom страницы и переносе окна на другой монитор: ``matchMedia(`(resolution: ${dpr}dppx)`)`` + `change`-слушатель (после срабатывания подписаться заново с новым DPR).
- Цена: буфер при DPR=3 в **9 раз** больше по пикселям. Для тяжёлых сцен ограничивают `Math.min(dpr, 2)` — так же делают в Three.js (`renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`).
- Координаты событий (`offsetX`) — в CSS-пикселях; если вы не сделали `setTransform(dpr…)`, их надо умножать на `dpr`.

Демо: [02-dpr-sharpness.html](demos/02-dpr-sharpness.html) — два canvas рядом, с учётом DPR и без, плюс зум-лупа.

### Пиксельные манипуляции: ImageData

```js
const image = ctx.getImageData(0, 0, w, h); // копия пикселей (CPU readback — дорого!)
const d = image.data;                        // Uint8ClampedArray, RGBA подряд, 4 байта на пиксель
for (let i = 0; i < d.length; i += 4) {
  // яркость по Rec. 601 (весами учитываем чувствительность глаза)
  const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  d[i] = d[i + 1] = d[i + 2] = y;            // Uint8Clamped сам округлит и зажмёт в 0..255
}
ctx.putImageData(image, 0, 0);               // игнорирует трансформации, globalAlpha и композитинг!
```

Индекс пикселя `(x, y)`: `i = (y * width + x) * 4`. Быстрее работать через `new Uint32Array(d.buffer)` — один пиксель = одно число (порядок байт little-endian → `0xAABBGGRR`).

- `getImageData` на GPU-ускоренном canvas заставляет выкачать буфер с видеокарты — частые вызовы убивают FPS. Отсюда `willReadFrequently`.
- Пиксели в буфере хранятся с **premultiplied alpha**, при чтении/записи полупрозрачных цветов возможна потеря точности.
- Для фильтров по всей картинке почти всегда быстрее `ctx.filter`, CSS-фильтр поверх canvas или шейдер в WebGL.

### Экспорт

`canvas.toBlob(cb, 'image/png')` (асинхронно, предпочтительнее), `toDataURL()` (синхронно, base64, +33% размера). Для `OffscreenCanvas` — `convertToBlob()`.

## Вопросы с собеседований

<details><summary>Чем Canvas отличается от SVG? Что такое immediate и retained mode?</summary>

Canvas — растровый буфер с immediate-mode API: команда сразу меняет пиксели, объектов нет. SVG — retained: дерево DOM-узлов, браузер сам перерисовывает, есть события, CSS, a11y, бесконечное масштабирование. Canvas выигрывает на тысячах объектов и частой перерисовке (нет стоимости DOM), SVG — на небольшом числе интерактивных элементов, иконках, диаграммах с доступностью. Для senior: упомянуть гибрид (canvas для данных + DOM/SVG для подписей и тултипов) и что для canvas нужно руками делать hit-testing, a11y и перерисовку при изменениях.
</details>

<details><summary>Почему картинка на canvas размыта и как это исправить?</summary>

Две типовые причины. 1) Размер буфера (атрибуты) не совпадает с CSS-размером — браузер растягивает битмап. 2) Не учтён `devicePixelRatio`: на retina один CSS-пиксель = 2–3 физических. Решение: буфер = CSS-размер × DPR, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`, CSS-размер прежний. Плюс линии в 1 px рисовать по полупиксельным координатам. Senior: следить за сменой DPR (zoom, другой монитор), ограничивать DPR для тяжёлых сцен из-за квадратичного роста числа пикселей.
</details>

<details><summary>Что сохраняют save() и restore()? Сохраняется ли путь?</summary>

В стек состояний попадают трансформационная матрица, клип-область, стили заливки/обводки, `lineWidth/lineCap/lineJoin/miterLimit`, `lineDash`, `globalAlpha`, `globalCompositeOperation`, тени, `font/textAlign/textBaseline`, `imageSmoothingEnabled`, `filter`. Текущий путь и пиксели — нет. Ловушка — несбалансированные save/restore: стек растёт, трансформации накапливаются от кадра к кадру.
</details>

<details><summary>В каком порядке применяются translate, rotate, scale?</summary>

Каждый вызов домножает текущую матрицу справа (`M = M·T`), поэтому к вершинам фигуры преобразования применяются в обратном порядке записи. Код `translate(cx,cy); rotate(a); fillRect(-w/2,-h/2,w,h)` поворачивает фигуру вокруг своего центра и переносит в `(cx, cy)`. Если поменять местами (`rotate` потом `translate`), объект будет вращаться по орбите вокруг начала координат.
</details>

<details><summary>Почему getImageData бросает SecurityError?</summary>

Canvas стал tainted (заражённым): на него нарисовали изображение/видео с другого origin без CORS-разрешения. Чтение пикселей защищено, чтобы нельзя было вытащить чужие данные (например, картинку, видимую только с куками пользователя). Решение — `crossOrigin = 'anonymous'` и `Access-Control-Allow-Origin` на сервере, либо проксирование через свой origin.
</details>

<details><summary>Почему getImageData в цикле анимации — плохая идея?</summary>

Canvas обычно ускорен на GPU, и чтение пикселей — синхронный readback из видеопамяти в CPU, со сбросом очереди команд (pipeline stall). Если чтение действительно нужно часто — `willReadFrequently: true` (canvas остаётся на CPU) или держать данные модели отдельно от пикселей. Для эффектов — `ctx.filter` или шейдеры.
</details>

<details><summary>Как нарисовать веб-шрифтом и не получить fallback?</summary>

Дождаться загрузки: `await document.fonts.load('16px MyFont')` или `document.fonts.ready`, затем рисовать. Canvas не перерисовывает текст сам, когда шрифт догрузится — это immediate mode.
</details>

<details><summary>Чем Path2D полезен?</summary>

Позволяет построить путь один раз и переиспользовать: рисовать многократно, проверять попадание `isPointInPath(path, x, y)`, создавать из SVG-строки `d`. Экономит повторное построение сложных путей каждый кадр и делает hit-testing простым.
</details>

<details><summary>Как сделать ластик или свечение частиц?</summary>

Через `globalCompositeOperation`: `destination-out` стирает там, где рисуем; `lighter` складывает цвета — перекрывающиеся частицы дают яркое ядро. `multiply`/`screen` — режимы наложения как в графредакторах.
</details>

<details><summary>Что такое premultiplied alpha и почему это важно?</summary>

Цвет хранится уже умноженным на альфу (`r·a, g·a, b·a, a`) — так проще и правильнее смешивать и фильтровать. Следствие: при записи полупрозрачных пикселей через `putImageData` и последующем чтении значения RGB могут немного отличаться (потеря точности при делении). В WebGL это же всплывает как «тёмные ореолы» у текстур с прозрачностью, если не согласовать `premultipliedAlpha` и блендинг.
</details>

## Практика

**1. Предскажите результат.**

```js
ctx.fillStyle = 'red';
ctx.save();
ctx.fillStyle = 'blue';
ctx.translate(100, 0);
ctx.restore();
ctx.fillRect(0, 0, 50, 50);
```

<details><summary>Ответ</summary>

Красный квадрат в `(0, 0)`: `restore` вернул и цвет, и матрицу.
</details>

**2. Нарисуйте «часы»**: циферблат с 12 рисками, часовая/минутная/секундная стрелки по текущему времени. Используйте только `translate(центр)` + `rotate` + `save/restore`, без тригонометрии вручную.

<details><summary>Подсказка</summary>

```js
function drawClock(ctx, r, now = new Date()) {
  ctx.save();
  ctx.translate(r, r);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.fillRect(r * 0.85, -2, r * 0.1, 4); // риска вдоль оси X
  }
  const hand = (angle, len, width) => {
    ctx.save();
    ctx.rotate(angle - Math.PI / 2); // 0 рад смотрит вправо, а 12 часов — вверх
    ctx.fillRect(0, -width / 2, len, width);
    ctx.restore();
  };
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  hand((h / 12) * 2 * Math.PI, r * 0.5, 6);
  hand((m / 60) * 2 * Math.PI, r * 0.75, 4);
  hand((s / 60) * 2 * Math.PI, r * 0.85, 1);
  ctx.restore();
}
```
</details>

**3. Фильтр «инверсия» и «порог»**: загрузите картинку (с одного origin), примените `255 - c` и бинаризацию по яркости. Замерьте время для изображения 4K и сравните с `ctx.filter = 'invert(1)'`.

**4. Перенос текста**: реализуйте `wrapText(ctx, text, maxWidth)` → массив строк по словам с помощью `measureText`.

<details><summary>Решение</summary>

```js
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}
```
</details>

## Источники
- https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
- https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
- https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
- https://developer.mozilla.org/en-US/docs/Web/API/Path2D
