QUIZ.register({
  "id": "11-graphics/03-canvas-performance",
  "section": "11-graphics",
  "title": "Производительность графики",
  "order": 3,
  "source": "../11-graphics/03-canvas-performance.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Интерактивная диаграмма из 300 узлов с тултипами и клавиатурой. Что выбрать?",
      "options": [
        "WebGL",
        "SVG/DOM",
        "Canvas без DOM",
        "WebGPU"
      ],
      "answer": 1,
      "explain": "Объектов немного, нужны события, доступность и чёткий текст."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Скаттер-плот на 500 000 точек?",
      "options": [
        "SVG",
        "DOM-элементы",
        "WebGL (или Canvas с прореживанием)",
        "CSS-анимации"
      ],
      "answer": 2,
      "explain": "Сотни тысяч объектов — территория GPU."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что ускоряет Canvas 2D?",
      "options": [
        "группировка рисования по стилю",
        "статичный фон на отдельном слое",
        "пулы объектов и типизированные массивы",
        "чтение `getBoundingClientRect` каждый кадр после изменения стилей",
        "отсечение невидимого"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Чтение раскладки после записи вызывает принудительный reflow."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `transferControlToOffscreen()`?",
      "options": [
        "Сохранить картинку",
        "Передать рендер canvas в воркер, чтобы он не блокировался главным потоком и не блокировал его",
        "Ускорить загрузку",
        "Включить WebGPU"
      ],
      "answer": 1,
      "explain": "Pointer events всё равно приходят в главный поток — передавайте их сообщениями."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Как сделать график на canvas доступным?",
      "options": [
        "`role=\"img\"` и `aria-label`",
        "таблица данных или текстовое резюме",
        "интерактив через DOM-элементы с фокусом",
        "только цветовое кодирование",
        "остановка анимации при `prefers-reduced-motion`"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Цвет не должен быть единственным носителем смысла."
    }
  ],
  "tasks": [
    {
      "title": "Пространственная сетка для hit-testing",
      "level": "senior",
      "prompt": "Реализуйте `createGrid(cellSize)` → `{ insert(item), query(x, y, radius) }`. `item` — `{ id, x, y }` (точка). `query` возвращает id элементов в радиусе `radius` от точки (включительно), проверяя только ячейки, пересекающие квадрат поиска. Порядок результата не важен.",
      "starter": "function createGrid(cellSize) {\n  // ваш код\n}",
      "solution": "function createGrid(cellSize) {\n  const cells = new Map();\n  const key = (cx, cy) => `${cx},${cy}`;\n  return {\n    insert(item) {\n      const k = key(Math.floor(item.x / cellSize), Math.floor(item.y / cellSize));\n      if (!cells.has(k)) cells.set(k, []);\n      cells.get(k).push(item);\n    },\n    query(x, y, radius) {\n      const result = [];\n      const minX = Math.floor((x - radius) / cellSize), maxX = Math.floor((x + radius) / cellSize);\n      const minY = Math.floor((y - radius) / cellSize), maxY = Math.floor((y + radius) / cellSize);\n      for (let cx = minX; cx <= maxX; cx++) {\n        for (let cy = minY; cy <= maxY; cy++) {\n          for (const item of cells.get(key(cx, cy)) ?? []) {\n            const dx = item.x - x, dy = item.y - y;\n            if (dx * dx + dy * dy <= radius * radius) result.push(item.id);\n          }\n        }\n      }\n      return result;\n    },\n  };\n}",
      "tests": [
        {
          "name": "находит соседей",
          "code": "const g = createGrid(10); g.insert({ id: \"a\", x: 5, y: 5 }); g.insert({ id: \"b\", x: 14, y: 5 }); g.insert({ id: \"c\", x: 50, y: 50 }); return g.query(9, 5, 5).sort().join() === \"a,b\";"
        },
        {
          "name": "граница радиуса",
          "code": "const g = createGrid(10); g.insert({ id: \"a\", x: 3, y: 4 }); return g.query(0, 0, 5).join() === \"a\";"
        },
        {
          "name": "отрицательные координаты",
          "code": "const g = createGrid(10); g.insert({ id: \"n\", x: -15, y: -3 }); return g.query(-14, -2, 2).join() === \"n\";"
        },
        {
          "name": "быстро на 10⁵",
          "code": "const g = createGrid(20); for (let i = 0; i < 100000; i++) g.insert({ id: i, x: (i * 7919) % 2000, y: (i * 104729) % 2000 }); const s = performance.now(); let n = 0; for (let q = 0; q < 2000; q++) n += g.query((q * 31) % 2000, (q * 17) % 2000, 10).length; return performance.now() - s < 1500;"
        }
      ]
    }
  ]
});
