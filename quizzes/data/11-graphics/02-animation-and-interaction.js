QUIZ.register({
  "id": "11-graphics/02-animation-and-interaction",
  "section": "11-graphics",
  "title": "Анимация и интерактив",
  "order": 2,
  "source": "../11-graphics/02-animation-and-interaction.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему анимация на `setInterval(16)` хуже `requestAnimationFrame`?",
      "options": [
        "Медленнее JS",
        "rAF синхронизирован с обновлением экрана и паузится в фоновой вкладке; таймер дрейфует и даёт пропуски кадров",
        "setInterval не работает в Chrome",
        "Ничем"
      ],
      "answer": 1,
      "explain": "А на 120 Hz rAF вызывается 120 раз в секунду — нужен delta time."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Объект двигается на 2px за кадр. Что будет на мониторе 120 Hz?",
      "options": [
        "Скорость та же",
        "Объект будет двигаться вдвое быстрее, чем на 60 Hz",
        "Медленнее",
        "Анимация остановится"
      ],
      "answer": 1,
      "explain": "Скорость задают в px/с и умножают на delta time."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем фиксированный шаг физики (accumulator)?",
      "options": [
        "Для красоты",
        "Детерминированная и стабильная симуляция независимо от FPS: при длинном кадре делается несколько шагов",
        "Чтобы экономить батарею",
        "Для доступности"
      ],
      "answer": 1,
      "explain": "Переменный большой dt ведёт к «пролетанию» сквозь стены и нестабильности."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `setPointerCapture` при drag?",
      "options": [
        "Скрыть курсор",
        "События продолжат приходить элементу, даже если указатель ушёл за его пределы",
        "Включить мультитач",
        "Отменить скролл"
      ],
      "answer": 1,
      "explain": "Иначе drag обрывается при быстром движении мыши."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как сделать zoom «вокруг курсора»?",
      "options": [
        "Просто умножить масштаб",
        "Запомнить мировую точку под курсором, изменить масштаб и сдвинуть камеру так, чтобы эта точка осталась под курсором",
        "Масштабировать CSS",
        "Перезагрузить canvas"
      ],
      "answer": 1,
      "explain": "`camera.x = screen.x - world.x * zoom`."
    }
  ],
  "tasks": [
    {
      "title": "lerp, clamp и easing",
      "level": "middle",
      "prompt": "Реализуйте `lerp(a, b, t)`, `clamp(x, min, max)`, `inverseLerp(a, b, x)` (обратное к lerp: какое t даёт x) и `easeInOutCubic(t)` (`t < 0.5 ? 4t³ : 1 - (-2t + 2)³ / 2`). И `remap(x, inMin, inMax, outMin, outMax)` с ограничением результата в выходном диапазоне.",
      "starter": "function lerp(a, b, t) {}\nfunction clamp(x, min, max) {}\nfunction inverseLerp(a, b, x) {}\nfunction easeInOutCubic(t) {}\nfunction remap(x, inMin, inMax, outMin, outMax) {}",
      "solution": "const lerp = (a, b, t) => a + (b - a) * t;\nconst clamp = (x, min, max) => Math.min(max, Math.max(min, x));\nconst inverseLerp = (a, b, x) => (a === b ? 0 : (x - a) / (b - a));\nconst easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);\nconst remap = (x, inMin, inMax, outMin, outMax) =>\n  lerp(outMin, outMax, clamp(inverseLerp(inMin, inMax, x), 0, 1));",
      "tests": [
        {
          "name": "lerp",
          "code": "return lerp(10, 20, 0.25) === 12.5 && lerp(0, 1, 0) === 0 && lerp(0, 1, 1) === 1;"
        },
        {
          "name": "clamp",
          "code": "return clamp(5, 0, 3) === 3 && clamp(-1, 0, 3) === 0 && clamp(2, 0, 3) === 2;"
        },
        {
          "name": "inverseLerp",
          "code": "return inverseLerp(10, 20, 15) === 0.5 && inverseLerp(5, 5, 5) === 0;"
        },
        {
          "name": "easing",
          "code": "const close = (a, b, e = 1e-6) => Math.abs(a - b) < e; return easeInOutCubic(0) === 0 && easeInOutCubic(1) === 1 && close(easeInOutCubic(0.5), 0.5) && easeInOutCubic(0.25) < 0.25;"
        },
        {
          "name": "remap с ограничением",
          "code": "return remap(50, 0, 100, 0, 1) === 0.5 && remap(150, 0, 100, 0, 1) === 1 && remap(-5, 0, 100, 10, 20) === 10;"
        }
      ],
      "notes": "Плавное следование камеры: `pos = lerp(pos, target, 1 - Math.exp(-speed * dt))` — независимо от FPS."
    },
    {
      "title": "Столкновения: круг и прямоугольник",
      "level": "middle",
      "prompt": "Реализуйте `circleRect(cx, cy, r, rect)` — пересекается ли круг с прямоугольником `{ x, y, w, h }` (касание считается пересечением), и `aabb(a, b)` — пересекаются ли два прямоугольника (касание краями — **не** пересечение).",
      "starter": "function circleRect(cx, cy, r, rect) {}\nfunction aabb(a, b) {}",
      "solution": "function circleRect(cx, cy, r, { x, y, w, h }) {\n  // Ближайшая к центру точка прямоугольника\n  const nx = Math.max(x, Math.min(cx, x + w));\n  const ny = Math.max(y, Math.min(cy, y + h));\n  const dx = cx - nx;\n  const dy = cy - ny;\n  return dx * dx + dy * dy <= r * r; // без Math.sqrt\n}\n\nfunction aabb(a, b) {\n  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;\n}",
      "tests": [
        {
          "name": "круг внутри",
          "code": "return circleRect(5, 5, 1, { x: 0, y: 0, w: 10, h: 10 });"
        },
        {
          "name": "касание",
          "code": "return circleRect(12, 5, 2, { x: 0, y: 0, w: 10, h: 10 });"
        },
        {
          "name": "у угла мимо",
          "code": "return !circleRect(12, 12, 2, { x: 0, y: 0, w: 10, h: 10 });"
        },
        {
          "name": "aabb",
          "code": "return aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }) && !aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 5, h: 5 });"
        }
      ]
    },
    {
      "title": "Zoom вокруг курсора",
      "level": "senior",
      "prompt": "Камера `{ x, y, zoom }`: экранная точка = мировая × zoom + (x, y). Реализуйте `screenToWorld(camera, sx, sy)` и `zoomAt(camera, sx, sy, factor, min = 0.1, max = 10)` — возвращает **новую** камеру с масштабом `clamp(zoom × factor)`, при котором мировая точка под `(sx, sy)` остаётся на том же месте экрана.",
      "starter": "function screenToWorld(camera, sx, sy) {}\nfunction zoomAt(camera, sx, sy, factor, min = 0.1, max = 10) {}",
      "solution": "function screenToWorld({ x, y, zoom }, sx, sy) {\n  return { x: (sx - x) / zoom, y: (sy - y) / zoom };\n}\n\nfunction zoomAt(camera, sx, sy, factor, min = 0.1, max = 10) {\n  const world = screenToWorld(camera, sx, sy);\n  const zoom = Math.min(max, Math.max(min, camera.zoom * factor));\n  return { zoom, x: sx - world.x * zoom, y: sy - world.y * zoom };\n}",
      "tests": [
        {
          "name": "точка под курсором неподвижна",
          "code": "const close = (a, b, e = 1e-6) => Math.abs(a - b) < e; const c = { x: 30, y: -20, zoom: 1.5 }; const before = screenToWorld(c, 200, 120); const n = zoomAt(c, 200, 120, 2); const after = screenToWorld(n, 200, 120); return close(before.x, after.x) && close(before.y, after.y) && n.zoom === 3;"
        },
        {
          "name": "ограничение",
          "code": "return zoomAt({ x: 0, y: 0, zoom: 8 }, 0, 0, 4).zoom === 10;"
        },
        {
          "name": "не мутирует",
          "code": "const c = { x: 0, y: 0, zoom: 1 }; zoomAt(c, 50, 50, 2); return c.zoom === 1 && c.x === 0;"
        }
      ]
    },
    {
      "title": "Фиксированный шаг: accumulator",
      "level": "senior",
      "prompt": "Реализуйте `createFixedStep(step, maxSteps = 5)` → функция `advance(dt)`, которая накапливает время и возвращает `{ steps, alpha }`: сколько шагов симуляции длиной `step` выполнить в этом кадре (не больше `maxSteps`; при превышении лишнее накопленное время отбрасывается — защита от «спирали смерти») и `alpha = остаток / step` для интерполяции отрисовки.",
      "starter": "function createFixedStep(step, maxSteps = 5) {\n  // ваш код\n}",
      "solution": "function createFixedStep(step, maxSteps = 5) {\n  let accumulator = 0;\n  return (dt) => {\n    accumulator += dt;\n    let steps = Math.floor(accumulator / step + 1e-9);\n    if (steps > maxSteps) {\n      steps = maxSteps;\n      accumulator = 0; // отбрасываем долг, иначе догонять придётся вечно\n      return { steps, alpha: 0 };\n    }\n    accumulator -= steps * step;\n    return { steps, alpha: accumulator / step };\n  };\n}",
      "tests": [
        {
          "name": "ровно шаг",
          "code": "const adv = createFixedStep(0.01); const r = adv(0.01); return r.steps === 1 && Math.abs(r.alpha) < 1e-6;"
        },
        {
          "name": "накопление",
          "code": "const adv = createFixedStep(0.01); const a = adv(0.004); const b = adv(0.004); const c = adv(0.004); return a.steps === 0 && b.steps === 0 && c.steps === 1 && Math.abs(c.alpha - 0.2) < 1e-6;"
        },
        {
          "name": "несколько шагов",
          "code": "const adv = createFixedStep(0.01); return adv(0.035).steps === 3;"
        },
        {
          "name": "спираль смерти",
          "code": "const adv = createFixedStep(0.01, 5); const r = adv(1); const next = adv(0.01); return r.steps === 5 && next.steps === 1;"
        }
      ]
    }
  ]
});
