QUIZ.register({
  "id": "13-algorithms/06-graphs",
  "section": "13-algorithms",
  "title": "Графы",
  "order": 6,
  "source": "../13-algorithms/06-graphs.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Минимальное число ходов коня от клетки A до B на шахматной доске. Алгоритм?",
      "options": [
        "DFS",
        "BFS",
        "Дейкстра с кучей",
        "Топологическая сортировка"
      ],
      "answer": 1,
      "explain": "Невзвешенный граф, «минимальное число шагов» — BFS."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Сложность BFS по графу со списком смежности?",
      "options": [
        "O(V)",
        "O(E log V)",
        "O(V + E)",
        "O(V²)"
      ],
      "answer": 2,
      "explain": "Каждая вершина и ребро обрабатываются константное число раз."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Алгоритм Кана обработал 7 вершин из 9. Что это значит?",
      "options": [
        "Граф несвязный",
        "В графе есть цикл",
        "Ошибка в коде",
        "Две вершины изолированы"
      ],
      "answer": 1,
      "explain": "Вершины в цикле никогда не получат входящую степень 0. Изолированные вершины имеют степень 0 и обрабатываются."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему Дейкстра не работает с отрицательными весами?",
      "options": [
        "Куча не хранит отрицательные числа",
        "Жадно зафиксированное расстояние может позже улучшиться через отрицательное ребро",
        "Будет бесконечный цикл всегда",
        "Работает, просто медленнее"
      ],
      "answer": 1,
      "explain": "Для отрицательных весов — Беллман–Форд."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Где во фронтенд-инструментах применяется топологическая сортировка?",
      "options": [
        "Порядок сборки пакетов в монорепо",
        "Порядок пересчёта computed в реактивных системах",
        "Порядок задач в Turborepo/Nx",
        "Сортировка строк в таблице",
        "Бинарный поиск по массиву"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Везде, где есть граф зависимостей и нужно выполнять зависимости раньше зависимых."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Когда в BFS помечать вершину посещённой?",
      "options": [
        "При извлечении из очереди",
        "При добавлении в очередь",
        "После обработки всех соседей",
        "Не важно"
      ],
      "answer": 1,
      "explain": "Иначе вершина может попасть в очередь несколько раз — лишняя работа и память."
    }
  ],
  "tasks": [
    {
      "title": "Number of Islands",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "граф",
        "DFS",
        "BFS",
        "матрица"
      ],
      "prompt": "Дана сетка из `\"1\"` (земля) и `\"0\"` (вода). Посчитайте острова (связные по 4 направлениям области земли). Вход не мутировать. Сетка может быть 300 × 300 — без рекурсии.",
      "starter": "function numIslands(grid) {\n  // ваш код\n}",
      "solution": "function numIslands(grid) {\n  const rows = grid.length;\n  const cols = rows ? grid[0].length : 0;\n  const seen = new Uint8Array(rows * cols);\n  let count = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] !== '1' || seen[r * cols + c]) continue;\n      count++;\n      const stack = [[r, c]];\n      seen[r * cols + c] = 1;\n      while (stack.length > 0) {\n        const [y, x] = stack.pop();\n        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n          const ny = y + dy;\n          const nx = x + dx;\n          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols) continue;\n          if (grid[ny][nx] !== '1' || seen[ny * cols + nx]) continue;\n          seen[ny * cols + nx] = 1;\n          stack.push([ny, nx]);\n        }\n      }\n    }\n  }\n  return count;\n}",
      "tests": [
        {
          "name": "один остров",
          "code": "return numIslands([[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"0\"]]) === 1;"
        },
        {
          "name": "три острова",
          "code": "return numIslands([[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]) === 3;"
        },
        {
          "name": "диагональ не связывает",
          "code": "return numIslands([[\"1\",\"0\"],[\"0\",\"1\"]]) === 2;"
        },
        {
          "name": "не мутирует",
          "code": "const g = [[\"1\"]]; numIslands(g); return g[0][0] === \"1\";"
        },
        {
          "name": "большая сплошная сетка",
          "code": "const g = Array.from({ length: 300 }, () => Array(300).fill(\"1\")); return numIslands(g) === 1;"
        }
      ]
    },
    {
      "title": "Shortest Path in Binary Matrix",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "граф",
        "BFS",
        "матрица"
      ],
      "prompt": "Сетка из 0 (свободно) и 1 (стена). Найдите длину кратчайшего пути из левого верхнего угла в правый нижний, двигаясь в 8 направлениях. Длина — число клеток пути. Пути нет — `-1`.",
      "starter": "function shortestPathBinaryMatrix(grid) {\n  // ваш код\n}",
      "solution": "function shortestPathBinaryMatrix(grid) {\n  const n = grid.length;\n  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;\n  const dist = Array.from({ length: n }, () => new Array(n).fill(0));\n  dist[0][0] = 1;\n  const queue = [[0, 0]];\n  for (let head = 0; head < queue.length; head++) {\n    const [r, c] = queue[head];\n    if (r === n - 1 && c === n - 1) return dist[r][c];\n    for (let dr = -1; dr <= 1; dr++) {\n      for (let dc = -1; dc <= 1; dc++) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;\n        if (grid[nr][nc] === 1 || dist[nr][nc] > 0) continue;\n        dist[nr][nc] = dist[r][c] + 1;\n        queue.push([nr, nc]);\n      }\n    }\n  }\n  return -1;\n}",
      "tests": [
        {
          "name": "2×2",
          "code": "return shortestPathBinaryMatrix([[0,1],[1,0]]) === 2;"
        },
        {
          "name": "3×3",
          "code": "return shortestPathBinaryMatrix([[0,0,0],[1,1,0],[1,1,0]]) === 4;"
        },
        {
          "name": "старт закрыт",
          "code": "return shortestPathBinaryMatrix([[1,0],[0,0]]) === -1;"
        },
        {
          "name": "одна клетка",
          "code": "return shortestPathBinaryMatrix([[0]]) === 1;"
        }
      ]
    },
    {
      "title": "Course Schedule (порядок сборки)",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "граф",
        "топологическая сортировка"
      ],
      "prompt": "Есть `n` пакетов `0..n-1` и пары `[a, b]` — «a зависит от b». Верните порядок сборки (каждая зависимость раньше зависимого) или `null`, если есть цикл. При нескольких вариантах — любой корректный.",
      "starter": "function buildOrder(n, deps) {\n  // ваш код\n}",
      "solution": "function buildOrder(n, deps) {\n  const indegree = new Array(n).fill(0);\n  const dependents = Array.from({ length: n }, () => []);\n  for (const [a, b] of deps) {\n    dependents[b].push(a);\n    indegree[a]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);\n  for (let head = 0; head < queue.length; head++) {\n    for (const next of dependents[queue[head]]) {\n      if (--indegree[next] === 0) queue.push(next);\n    }\n  }\n  return queue.length === n ? queue : null;\n}",
      "tests": [
        {
          "name": "корректный порядок",
          "code": "const deps = [[1, 0], [2, 0], [3, 1], [3, 2]]; const order = buildOrder(4, deps); if (!order || order.length !== 4) return false; const pos = new Map(order.map((x, i) => [x, i])); return deps.every(([a, b]) => pos.get(b) < pos.get(a));"
        },
        {
          "name": "цикл",
          "code": "return buildOrder(2, [[0, 1], [1, 0]]) === null;"
        },
        {
          "name": "без зависимостей",
          "code": "const o = buildOrder(3, []); return o && o.toSorted().join() === \"0,1,2\";"
        },
        {
          "name": "самозависимость",
          "code": "return buildOrder(1, [[0, 0]]) === null;"
        }
      ]
    },
    {
      "title": "Clone Graph",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "граф",
        "DFS",
        "хэш-таблица"
      ],
      "prompt": "Склонируйте связный неориентированный граф. Узел: `{ val, neighbors: [] }`. Верните клон узла, переданного на вход. Граф может содержать циклы.",
      "starter": "function cloneGraph(node) {\n  // ваш код\n}",
      "solution": "function cloneGraph(node) {\n  if (!node) return null;\n  const clones = new Map([[node, { val: node.val, neighbors: [] }]]);\n  const stack = [node];\n  while (stack.length > 0) {\n    const current = stack.pop();\n    for (const nb of current.neighbors) {\n      if (!clones.has(nb)) {\n        clones.set(nb, { val: nb.val, neighbors: [] });\n        stack.push(nb);\n      }\n      clones.get(current).neighbors.push(clones.get(nb));\n    }\n  }\n  return clones.get(node);\n}",
      "tests": [
        {
          "name": "квадрат",
          "code": "const n = [1, 2, 3, 4].map((val) => ({ val, neighbors: [] })); const link = (a, b) => { n[a].neighbors.push(n[b]); n[b].neighbors.push(n[a]); }; link(0, 1); link(1, 2); link(2, 3); link(3, 0); const c = cloneGraph(n[0]); return c !== n[0] && c.val === 1 && c.neighbors.map((x) => x.val).join() === \"2,4\" && c.neighbors[0].neighbors[0] === c;"
        },
        {
          "name": "пустой",
          "code": "return cloneGraph(null) === null;"
        }
      ],
      "notes": "Это та же задача, что `structuredClone` с циклическими ссылками: Map «оригинал → копия» и для учёта посещённых, и для переиспользования копий."
    },
    {
      "title": "Number of Connected Components",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "union-find",
        "граф"
      ],
      "prompt": "Дано `n` вершин и рёбра неориентированного графа. Верните количество компонент связности. Используйте union-find.",
      "starter": "function countComponents(n, edges) {\n  // ваш код\n}",
      "solution": "function countComponents(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]];\n      x = parent[x];\n    }\n    return x;\n  };\n  let components = n;\n  for (const [a, b] of edges) {\n    const ra = find(a);\n    const rb = find(b);\n    if (ra !== rb) {\n      parent[ra] = rb;\n      components--;\n    }\n  }\n  return components;\n}",
      "tests": [
        {
          "name": "две компоненты",
          "code": "return countComponents(5, [[0, 1], [1, 2], [3, 4]]) === 2;"
        },
        {
          "name": "одна",
          "code": "return countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]]) === 1;"
        },
        {
          "name": "без рёбер",
          "code": "return countComponents(3, []) === 3;"
        },
        {
          "name": "цикл",
          "code": "return countComponents(3, [[0, 1], [1, 2], [2, 0]]) === 1;"
        }
      ]
    },
    {
      "title": "Detect Circular Imports",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "граф",
        "DFS",
        "циклы"
      ],
      "prompt": "Дан объект `modules`: имя модуля → массив импортируемых модулей. Верните первый найденный цикл как массив имён `[a, b, ..., a]` или `null`. Модули обходите в порядке ключей объекта, импорты — в порядке массива.\n\n`{ a: [\"b\"], b: [\"c\"], c: [\"a\"] }` → `[\"a\", \"b\", \"c\", \"a\"]`",
      "starter": "function findCycle(modules) {\n  // ваш код\n}",
      "solution": "function findCycle(modules) {\n  const WHITE = 0, GRAY = 1, BLACK = 2;\n  const color = new Map();\n  const path = [];\n  const dfs = (name) => {\n    color.set(name, GRAY);\n    path.push(name);\n    for (const dep of modules[name] ?? []) {\n      const c = color.get(dep) ?? WHITE;\n      if (c === GRAY) return [...path.slice(path.indexOf(dep)), dep];\n      if (c === WHITE) {\n        const cycle = dfs(dep);\n        if (cycle) return cycle;\n      }\n    }\n    path.pop();\n    color.set(name, BLACK);\n    return null;\n  };\n  for (const name of Object.keys(modules)) {\n    if ((color.get(name) ?? WHITE) === WHITE) {\n      const cycle = dfs(name);\n      if (cycle) return cycle;\n    }\n  }\n  return null;\n}",
      "tests": [
        {
          "name": "простой цикл",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(findCycle({ a: [\"b\"], b: [\"c\"], c: [\"a\"] }), [\"a\", \"b\", \"c\", \"a\"]);"
        },
        {
          "name": "нет цикла (ромб)",
          "code": "return findCycle({ app: [\"ui\", \"api\"], ui: [\"utils\"], api: [\"utils\"], utils: [] }) === null;"
        },
        {
          "name": "цикл не с корня",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(findCycle({ main: [\"x\"], x: [\"y\"], y: [\"x\"] }), [\"x\", \"y\", \"x\"]);"
        },
        {
          "name": "самоимпорт",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(findCycle({ a: [\"a\"] }), [\"a\", \"a\"]);"
        }
      ],
      "notes": "Три цвета различают «уже полностью обработан» (чёрный — не цикл, просто общая зависимость, как `utils` в ромбе) и «в текущем пути» (серый — цикл)."
    },
    {
      "title": "Network Delay Time (Дейкстра)",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "граф",
        "куча",
        "кратчайший путь"
      ],
      "prompt": "Дан ориентированный взвешенный граф: `times[i] = [u, v, w]`, вершины `1..n`. Сигнал отправлен из `k`. За какое время он дойдёт до всех вершин? Если до какой-то не дойдёт — `-1`. Веса неотрицательные.",
      "starter": "function networkDelayTime(times, n, k) {\n  // ваш код\n}",
      "solution": "function networkDelayTime(times, n, k) {\n  const graph = Array.from({ length: n + 1 }, () => []);\n  for (const [u, v, w] of times) graph[u].push([v, w]);\n  const dist = new Array(n + 1).fill(Infinity);\n  dist[k] = 0;\n  // min-куча пар [расстояние, вершина]\n  const heap = [[0, k]];\n  const push = (item) => {\n    heap.push(item);\n    let i = heap.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (heap[p][0] <= heap[i][0]) break;\n      [heap[p], heap[i]] = [heap[i], heap[p]];\n      i = p;\n    }\n  };\n  const pop = () => {\n    const top = heap[0];\n    const last = heap.pop();\n    if (heap.length > 0) {\n      heap[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;\n        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;\n        if (m === i) break;\n        [heap[m], heap[i]] = [heap[i], heap[m]];\n        i = m;\n      }\n    }\n    return top;\n  };\n  while (heap.length > 0) {\n    const [d, u] = pop();\n    if (d > dist[u]) continue; // устаревшая запись\n    for (const [v, w] of graph[u]) {\n      if (d + w < dist[v]) {\n        dist[v] = d + w;\n        push([dist[v], v]);\n      }\n    }\n  }\n  const worst = Math.max(...dist.slice(1));\n  return worst === Infinity ? -1 : worst;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2) === 2;"
        },
        {
          "name": "недостижимо",
          "code": "return networkDelayTime([[1,2,1]], 2, 2) === -1;"
        },
        {
          "name": "короче через промежуточную",
          "code": "return networkDelayTime([[1,2,10],[1,3,1],[3,2,1]], 3, 1) === 2;"
        }
      ],
      "notes": "Ленивое удаление: в куче могут лежать устаревшие записи, их пропускаем по условию `d > dist[u]`."
    }
  ]
});
