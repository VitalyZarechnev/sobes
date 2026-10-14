# Анимация и интерактивность на canvas

> ⏱ ~5 ч · 🎯 Написать корректный игровой цикл (rAF + delta time + фиксированный шаг физики), обработать ввод через Pointer Events, сделать hit-testing и drag&drop фигур, zoom/pan вокруг курсора, простые столкновения и минимальный сцена-граф.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Объясняю, почему скорость нужно умножать на `dt`, и чем плох `setInterval`
- [ ] Реализовал фиксированный шаг с аккумулятором и интерполяцией
- [ ] Сделал drag фигур с `setPointerCapture` и zoom вокруг курсора (демо [04-drag-shapes](demos/04-drag-shapes.html))
- [ ] Пишу проверки AABB/окружность/точка-в-многоугольнике без подсказок

## Теория

### Игровой цикл на requestAnimationFrame

```js
let last = performance.now();
let rafId = 0;

function frame(now) {               // now — DOMHighResTimeStamp начала кадра
  const dt = Math.min((now - last) / 1000, 0.1); // секунды; clamp после вкладки в фоне
  last = now;
  update(dt);                       // логика: позиции, физика
  render();                         // только рисование
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);
// остановка: cancelAnimationFrame(rafId)
```

Почему `requestAnimationFrame`, а не `setInterval(16)`:
- колбэк вызывается **перед отрисовкой кадра**, синхронно с частотой экрана (60/120/144 Гц) — нет рваных кадров и лишней работы;
- в фоновой вкладке rAF **приостанавливается** (экономия батареи), таймеры же троттлятся до ≥1 с;
- все rAF-колбэки кадра получают **одинаковый** `now` — удобно синхронизировать несколько анимаций.

### Delta time: независимость от FPS

Если писать `x += 5` за кадр, на 120 Гц мониторе объект летит вдвое быстрее. Скорость задаётся в единицах/секунду:

```js
function update(dt) {
  ball.x += ball.vx * dt;          // vx — px/с
  ball.vy += GRAVITY * dt;         // ускорение — px/с²
  ball.y += ball.vy * dt;
}
```

🪤 Ловушка: после возврата во вкладку `dt` может быть 30 секунд — объекты «телепортируются» сквозь стены. Поэтому `dt` зажимают (clamp) сверху.

🪤 Ловушка: экспоненциальное затухание через `v *= 0.98` за кадр тоже зависит от FPS. Правильно: `v *= Math.pow(0.98, dt * 60)` или `v *= Math.exp(-k * dt)`. Аналогично «плавное следование» `x = lerp(x, target, 1 - Math.exp(-k * dt))`.

### Фиксированный шаг физики (fixed timestep)

Переменный `dt` делает физику **недетерминированной**: на разных устройствах разный результат, при больших `dt` — проваливание сквозь объекты и «взрывы» пружин. Решение из статьи Гленна Фидлера «Fix Your Timestep!» — копить реальное время в аккумуляторе и тратить его фиксированными порциями:

```js
const STEP = 1 / 60;               // физика всегда 60 Гц
const MAX_STEPS = 5;               // защита от «спирали смерти»
let acc = 0;

function frame(now) {
  acc += Math.min((now - last) / 1000, 0.25);
  last = now;
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    prevState = copy(state);       // для интерполяции
    simulate(state, STEP);
    acc -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) acc = 0; // не успеваем — сбрасываем долг
  const alpha = acc / STEP;        // 0..1 — насколько мы «между» шагами
  render(interpolate(prevState, state, alpha));
  requestAnimationFrame(frame);
}
```

- **Спираль смерти**: если один шаг симуляции дольше `STEP`, долг растёт бесконечно. Лимит шагов на кадр её обрывает.
- **Интерполяция** между предыдущим и текущим состоянием убирает дрожание, когда частота экрана (например, 144 Гц) не кратна частоте физики.

### Easing и lerp

```js
const lerp = (a, b, t) => a + (b - a) * t;           // линейная интерполяция
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInQuad = (t) => t * t;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// анимация по времени, а не по кадрам
const t = clamp((now - start) / duration, 0, 1);
x = lerp(from, to, easeOutCubic(t));
```

### Ввод: Pointer Events

Pointer Events объединяют мышь, перо и тач. Используйте их вместо пары mouse+touch.

```js
canvas.style.touchAction = 'none';       // иначе браузер заберёт жест под скролл/зум
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId); // события придут, даже если курсор ушёл за canvas
  const { x, y } = toCanvas(e);
  // ...
});

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  // CSS-пиксели относительно canvas; если буфер масштабирован не через setTransform(dpr) — умножить
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
```

- `pointerId` и `isPrimary` — для мультитача (пинч = два активных указателя).
- `e.getCoalescedEvents()` — промежуточные точки между кадрами (гладкие линии в рисовалке); `getPredictedEvents()` — предсказание для меньшей задержки.
- Колесо — событие `wheel` с `{ passive: false }`, если делаем `preventDefault()` для собственного зума.
- Клавиатура — храните множество нажатых клавиш (`keydown`/`keyup` → `Set`) и читайте его в `update`, а не двигайте объекты прямо в обработчике (иначе скорость зависит от автоповтора).

### Hit-testing: куда попал курсор

**1. `isPointInPath` / `isPointInStroke`** — браузер проверяет точку против пути с учётом **текущей** трансформации:

```js
ctx.save();
applyShapeTransform(ctx, shape);
const hit = ctx.isPointInPath(shape.path, px * dpr, py * dpr); // координаты в пикселях буфера, без CTM!
ctx.restore();
```

Нюанс: точка передаётся в координатах буфера (без учёта трансформации), а путь трансформируется текущей матрицей.

**2. Математика** — быстрее и работает без контекста (в воркере, на сервере, в тестах):

```js
// круг
const inCircle = (px, py, c) => (px - c.x) ** 2 + (py - c.y) ** 2 <= c.r ** 2; // без sqrt

// прямоугольник с поворотом: переводим точку в локальные координаты фигуры
function inRotatedRect(px, py, r) {
  const cos = Math.cos(-r.angle), sin = Math.sin(-r.angle);
  const dx = px - r.cx, dy = py - r.cy;
  const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
  return Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2;
}

// многоугольник: ray casting (чётность пересечений луча вправо)
function pointInPolygon([px, py], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const crosses = (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}
```

**3. Color picking** — рисуем каждую фигуру во скрытый canvas уникальным цветом (id → RGB), читаем 1 пиксель под курсором. O(1) для любой геометрии, но требует второго прохода рендера и `getImageData` (выключайте сглаживание, иначе на краях «смешанные» id).

Проверять попадание нужно **с конца списка** (сверху по z-порядку), чтобы схватить верхнюю фигуру. Для тысяч объектов — пространственный индекс (сетка, quadtree, R-tree), см. [03-canvas-performance](03-canvas-performance.md).

### Drag & drop фигур

```js
let drag = null; // { shape, dx, dy }

canvas.addEventListener('pointerdown', (e) => {
  const p = screenToWorld(toCanvas(e));
  const shape = shapes.findLast((s) => hitTest(s, p)); // верхняя
  if (!shape) return;
  drag = { shape, dx: p.x - shape.x, dy: p.y - shape.y }; // смещение «за что схватили»
  canvas.setPointerCapture(e.pointerId);
  // поднять наверх — новый массив, без мутации порядка исходного
  shapes = [...shapes.filter((s) => s !== shape), shape];
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = screenToWorld(toCanvas(e));
  drag.shape.x = p.x - drag.dx;
  drag.shape.y = p.y - drag.dy;
  requestRender();               // перерисовка по требованию, не 60 FPS впустую
});
canvas.addEventListener('pointerup', () => (drag = null));
```

`requestRender` — паттерн «рисуем только при изменениях»: флаг + один rAF. Для редакторов это экономит батарею.

### Zoom и pan: камера 2D

Камера — это `scale` + смещение. Экран ↔ мир:

```js
const view = { scale: 1, x: 0, y: 0 };   // screen = world * scale + offset

const worldToScreen = (p) => ({ x: p.x * view.scale + view.x, y: p.y * view.scale + view.y });
const screenToWorld = (p) => ({ x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale });

// зум вокруг курсора: точка мира под курсором должна остаться под курсором
function zoomAt(screenPt, factor) {
  const before = screenToWorld(screenPt);
  view.scale = clamp(view.scale * factor, 0.1, 20);
  view.x = screenPt.x - before.x * view.scale;
  view.y = screenPt.y - before.y * view.scale;
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomAt(toCanvas(e), Math.exp(-e.deltaY * 0.001)); // экспонента — плавно и симметрично
}, { passive: false });

// рендер
ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.x, dpr * view.y);
```

🪤 Ловушка: зумить «в начало координат» (`scale *= f` без коррекции смещения) — сцена уезжает из-под курсора. Ещё одна: толщина линий при зуме тоже масштабируется — для «волосяных» линий делите `lineWidth` на `view.scale`.

### Простые столкновения

```js
// AABB — axis-aligned bounding box
const aabb = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// окружности: сравниваем квадраты расстояний
const circles = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= (a.r + b.r) ** 2;

// окружность vs AABB: ближайшая точка прямоугольника к центру
function circleRect(c, r) {
  const nx = clamp(c.x, r.x, r.x + r.w);
  const ny = clamp(c.y, r.y, r.y + r.h);
  return (c.x - nx) ** 2 + (c.y - ny) ** 2 <= c.r ** 2;
}
```

Реакция: отражение скорости по нормали (`v = v - 2(v·n)n`), выталкивание из пересечения на глубину проникновения. Для быстрых объектов (пуля) дискретная проверка пропускает столкновения — **tunneling**; лечится меньшим шагом, sweep-тестами (луч/отрезок против фигуры) или CCD. Broad phase (сетка/quadtree) отсекает пары, narrow phase проверяет точно — иначе O(n²).

### Сцена-граф своими руками

Когда объектов много и они вложены (танк → башня → дуло), нужен **граф сцены**: узлы с локальной трансформацией и детьми. Мировая матрица узла = мировая матрица родителя × локальная.

```js
class Node {
  constructor({ x = 0, y = 0, rotation = 0, scale = 1, draw = null } = {}) {
    Object.assign(this, { x, y, rotation, scale, draw, children: [] });
  }
  add(child) { this.children.push(child); child.parent = this; return this; }
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    this.draw?.(ctx);                          // рисуем в локальных координатах
    for (const c of this.children) c.render(ctx);
    ctx.restore();
  }
}

const tank = new Node({ x: 200, y: 200, draw: (c) => c.fillRect(-40, -25, 80, 50) });
const turret = new Node({ draw: (c) => c.fillRect(0, -5, 60, 10) });
tank.add(turret);
// turret.rotation меняется независимо, но едет вместе с танком
```

Для hit-testing во вложенных узлах точку переводят в локальные координаты через **обратную** мировую матрицу (`DOMMatrix.inverse()` / `transformPoint`). Так устроены Konva, PixiJS, Fabric.js и `Object3D` в Three.js.

## Вопросы с собеседований

<details><summary>Почему requestAnimationFrame лучше setInterval для анимации?</summary>

rAF синхронизирован с циклом отрисовки браузера и частотой экрана: колбэк выполняется раз за кадр перед style/layout/paint, без лишних и пропущенных кадров. В фоновых вкладках он приостанавливается. setInterval не знает про кадры: может сработать дважды за кадр или пропустить, дрейфует, троттлится в фоне. Важно: rAF не гарантирует 60 FPS — поэтому нужен delta time.
</details>

<details><summary>Что такое delta time и зачем его зажимать?</summary>

Время между кадрами; все скорости умножаются на него, чтобы движение не зависело от FPS (60 vs 144 Гц). Зажимают (например, до 0.1 с), потому что после паузы вкладки или долгого GC dt огромный — объекты пролетают сквозь стены, физика «взрывается».
</details>

<details><summary>Зачем фиксированный шаг физики и что такое аккумулятор?</summary>

Переменный шаг делает симуляцию недетерминированной и нестабильной (интегратор Эйлера при большом dt расходится). Аккумулятор копит реальное прошедшее время, а симуляция «съедает» его порциями ровно по STEP. Остаток даёт alpha для интерполяции рендера между двумя состояниями. Лимит шагов за кадр защищает от спирали смерти. Senior: детерминизм нужен для реплеев, мультиплеера с lockstep, тестов.
</details>

<details><summary>Как определить, что кликнули по фигуре на canvas?</summary>

Canvas не знает о фигурах, hit-testing вручную: `isPointInPath`/`isPointInStroke` с Path2D (с учётом трансформации), математические проверки (круг, AABB, повёрнутый прямоугольник через перевод точки в локальные координаты, ray casting для многоугольника), или color picking через скрытый буфер. Проверять сверху вниз по z. Для тысяч объектов — пространственный индекс.
</details>

<details><summary>Как сделать zoom колесом вокруг курсора?</summary>

Камера: `screen = world·scale + offset`. Перед изменением масштаба вычислить мировую точку под курсором, поменять scale, затем пересчитать offset так, чтобы эта точка снова попала под курсор: `offset = screenPt - worldPt·scale`. Масштаб удобно менять экспоненциально (`exp(-deltaY·k)`), зажимать пределы, слушать wheel с `passive: false`.
</details>

<details><summary>Зачем setPointerCapture и touch-action: none?</summary>

`setPointerCapture` направляет все события указателя в элемент, даже когда курсор вышел за его границы — drag не «отваливается». `touch-action: none` запрещает браузеру обрабатывать жесты по умолчанию (скролл, pinch-zoom) на canvas, иначе придёт `pointercancel` и вы потеряете жест.
</details>

<details><summary>Что такое tunneling и как с ним бороться?</summary>

Быстрый объект за один шаг перескакивает тонкое препятствие — дискретная проверка не видит пересечения. Решения: уменьшить шаг (substeps), ограничить скорость, sweep-тест (пересечение отрезка движения с фигурой), continuous collision detection в физдвижках.
</details>

<details><summary>Что такое сцена-граф и зачем он на canvas?</summary>

Дерево узлов с локальными трансформациями; мировая матрица = родительская × локальная. Даёт иерархию (дочерние объекты двигаются с родителем), единый рендер-обход с save/restore, hit-testing через обратную матрицу, удобную точку для culling и dirty-флагов. Это retained-слой поверх immediate-mode canvas — так устроены Konva, PixiJS, Three.js.
</details>

<details><summary>Как не тратить батарею в редакторе, где большую часть времени ничего не меняется?</summary>

Рендер по требованию: при изменении состояния ставить флаг и планировать один rAF (`if (!scheduled) { scheduled = true; requestAnimationFrame(draw) }`). Непрерывный цикл держать только во время анимаций/drag. Плюс dirty rectangles и слои ([03-canvas-performance](03-canvas-performance.md)).
</details>

<details><summary>Почему v *= 0.98 за кадр — ошибка?</summary>

Затухание получается зависимым от FPS: за секунду на 60 Гц множитель 0.98^60, на 144 Гц — 0.98^144, объект тормозит быстрее. Корректно: `v *= Math.exp(-k·dt)` или `Math.pow(0.98, dt·60)`.
</details>

## Практика

**1. Предскажите поведение.** Мяч на 60 Гц движется с `x += 4` за кадр. Пользователь открыл страницу на мониторе 144 Гц. Насколько быстрее мяч? Как исправить?

<details><summary>Ответ</summary>

В 2.4 раза (144/60). Перейти на скорость в px/с: `x += 240 * dt`.
</details>

**2. Реализуйте `createFixedLoop(step, simulate)`**, который принимает реальное время кадра и вызывает `simulate` нужное число раз (с лимитом), возвращая `alpha`. Эту задачу можно решить с автотестами в тесте страницы.

**3. Pinch-zoom двумя пальцами.** Храните `Map<pointerId, point>`. Когда указателей два — масштаб = отношение текущего расстояния к начальному, центр зума — середина отрезка, смещение середины = pan.

<details><summary>Подсказка</summary>

```js
const pointers = new Map();
let pinch = null;
canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, toCanvas(e));
  if (pointers.size !== 2) return;
  const [a, b] = [...pointers.values()];
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (pinch) {
    zoomAt(mid, dist / pinch.dist);
    view.x += mid.x - pinch.mid.x;
    view.y += mid.y - pinch.mid.y;
  }
  pinch = { dist, mid };
});
```
</details>

**4. Арканоид-минимум**: платформа, мяч, сетка кирпичей; столкновение «окружность vs AABB» с отражением по оси наименьшего проникновения. См. проект в [06-practice-projects](06-practice-projects.md).

## Источники
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- https://developer.mozilla.org/en-US/docs/Games/Anatomy
- https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath
- https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
- https://gafferongames.com/post/fix_your_timestep/
- https://learn.javascript.ru/pointer-events
