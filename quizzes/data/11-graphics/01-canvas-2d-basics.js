QUIZ.register({
  "id": "11-graphics/01-canvas-2d-basics",
  "section": "11-graphics",
  "title": "Canvas 2D: основы",
  "order": 1,
  "source": "../11-graphics/01-canvas-2d-basics.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему canvas выглядит размытым на retina-экране?",
      "options": [
        "Плохой браузер",
        "Буфер canvas меньше физических пикселей: его растягивают в devicePixelRatio раз",
        "Неправильный шрифт",
        "Нет antialias"
      ],
      "answer": 1,
      "explain": "Буфер = CSS-размер × DPR и `ctx.scale(dpr, dpr)`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делают `ctx.save()` и `ctx.restore()`?",
      "options": [
        "Сохраняют картинку в файл",
        "Сохраняют и восстанавливают состояние контекста: матрицу трансформации, стили, клип",
        "Отменяют последнюю операцию",
        "Кэшируют путь"
      ],
      "answer": 1,
      "explain": "Стек состояний — основа рисования вложенных объектов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем Canvas (immediate mode) отличается от SVG (retained mode)?",
      "options": [
        "Canvas векторный",
        "Canvas не хранит объекты — только пиксели; события и перерисовку по изменениям делаете вы",
        "SVG рисуется на GPU",
        "Ничем"
      ],
      "answer": 1,
      "explain": "SVG хранит дерево узлов с событиями и CSS."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему линия толщиной 1px на целой координате выглядит размытой (2px серой)?",
      "options": [
        "Ошибка браузера",
        "Линия центрируется на границе пикселей и делится между двумя рядами; нужен сдвиг на 0.5",
        "Нужен `lineCap`",
        "Из-за DPR всегда"
      ],
      "answer": 1,
      "explain": "При DPR = 1 рисуйте на `x + 0.5`."
    }
  ],
  "tasks": [
    {
      "title": "Аффинная матрица трансформации",
      "level": "senior",
      "prompt": "Матрица Canvas — `[a, b, c, d, e, f]`, точка преобразуется как `x' = a·x + c·y + e`, `y' = b·x + d·y + f`. Реализуйте `multiply(m1, m2)` (сначала применяется `m2`, потом `m1` — как последовательные вызовы `ctx.transform`: `m = multiply(m, next)`), `translate(tx, ty)`, `rotate(rad)`, `scale(sx, sy)` (возвращают матрицы) и `apply(m, [x, y])`.",
      "starter": "const IDENTITY = [1, 0, 0, 1, 0, 0];\n\nfunction multiply(m1, m2) {}\nfunction translate(tx, ty) {}\nfunction rotate(rad) {}\nfunction scale(sx, sy) {}\nfunction apply(m, [x, y]) {}",
      "solution": "const IDENTITY = [1, 0, 0, 1, 0, 0];\n\nfunction multiply([a1, b1, c1, d1, e1, f1], [a2, b2, c2, d2, e2, f2]) {\n  return [\n    a1 * a2 + c1 * b2,\n    b1 * a2 + d1 * b2,\n    a1 * c2 + c1 * d2,\n    b1 * c2 + d1 * d2,\n    a1 * e2 + c1 * f2 + e1,\n    b1 * e2 + d1 * f2 + f1,\n  ];\n}\nconst translate = (tx, ty) => [1, 0, 0, 1, tx, ty];\nconst rotate = (rad) => [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0];\nconst scale = (sx, sy) => [sx, 0, 0, sy, 0, 0];\nfunction apply([a, b, c, d, e, f], [x, y]) {\n  return [a * x + c * y + e, b * x + d * y + f];\n}",
      "tests": [
        {
          "name": "translate",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(apply(translate(10, 5), [1, 1]), [11, 6]);"
        },
        {
          "name": "порядок: translate → scale",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const m = multiply(translate(100, 0), scale(2, 2)); return eq(apply(m, [1, 1]), [102, 2]);"
        },
        {
          "name": "порядок: scale → translate",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const m = multiply(scale(2, 2), translate(100, 0)); return eq(apply(m, [1, 1]), [202, 2]);"
        },
        {
          "name": "поворот на 90°",
          "code": "const close = (a, b, e = 1e-6) => Math.abs(a - b) < e; const [x, y] = apply(rotate(Math.PI / 2), [1, 0]); return close(x, 0) && close(y, 1);"
        },
        {
          "name": "identity",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(multiply(IDENTITY, [2, 0, 0, 3, 4, 5]), [2, 0, 0, 3, 4, 5]);"
        }
      ],
      "notes": "Порядок вызовов `ctx.translate(); ctx.scale();` соответствует `multiply(translate, scale)`: последняя операция применяется к точке первой. Поэтому в демо 01 результат зависит от порядка."
    }
  ]
});
