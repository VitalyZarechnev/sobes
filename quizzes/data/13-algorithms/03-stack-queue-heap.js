QUIZ.register({
  "id": "13-algorithms/03-stack-queue-heap",
  "section": "13-algorithms",
  "title": "Стек, очередь, куча",
  "order": 3,
  "source": "../13-algorithms/03-stack-queue-heap.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какая структура нужна для проверки вложенности HTML-тегов?",
      "options": [
        "Очередь",
        "Стек",
        "Куча",
        "Set"
      ],
      "answer": 1,
      "explain": "Закрывающий тег должен совпадать с последним открытым — LIFO."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Сложность операций `push` и `pop` у двоичной кучи?",
      "options": [
        "O(1) и O(1)",
        "O(log n) и O(log n)",
        "O(n) и O(1)",
        "O(1) и O(n)"
      ],
      "answer": 1,
      "explain": "Высота полного двоичного дерева — log n; всплытие и погружение проходят по ней."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как найти top-k элементов из n за O(n log k)?",
      "options": [
        "Отсортировать всё",
        "Min-куча размера k",
        "Max-куча на все n элементов",
        "Стек"
      ],
      "answer": 1,
      "explain": "В куче всегда k лучших; вершина — худший из них, его и вытесняем."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Индексы детей узла `i` в двоичной куче на массиве (с нуля)?",
      "options": [
        "`i + 1`, `i + 2`",
        "`2i`, `2i + 1`",
        "`2i + 1`, `2i + 2`",
        "`i * i`, `i * i + 1`"
      ],
      "answer": 2,
      "explain": "Родитель — `(i - 1) >> 1`. Вариант `2i, 2i + 1` — для нумерации с единицы."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие задачи решаются монотонным стеком за O(n)?",
      "options": [
        "Следующий больший элемент",
        "Наибольший прямоугольник в гистограмме",
        "Через сколько дней потеплеет",
        "Кратчайший путь в графе",
        "Сортировка массива"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Общее у них — поиск ближайшего большего/меньшего соседа."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какая сложность у BFS, если очередь реализована через `shift()` на массиве из n вершин (худший случай)?",
      "options": [
        "O(n)",
        "O(n log n)",
        "O(n²)",
        "O(1)"
      ],
      "answer": 2,
      "explain": "Каждый `shift` — O(n). Используйте индекс головы."
    }
  ],
  "tasks": [
    {
      "title": "Valid Parentheses",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "стек",
        "строки"
      ],
      "prompt": "Строка состоит из `()[]{}`. Верните `true`, если скобки сбалансированы и правильно вложены.\n\n`\"()[]{}\"` → `true`, `\"(]\"` → `false`, `\"([)]\"` → `false`",
      "starter": "function isValid(s) {\n  // ваш код\n}",
      "solution": "function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of s) {\n    if (ch in pairs) {\n      if (stack.pop() !== pairs[ch]) return false;\n    } else {\n      stack.push(ch);\n    }\n  }\n  return stack.length === 0;\n}",
      "tests": [
        {
          "name": "простые",
          "code": "return isValid(\"()[]{}\") && isValid(\"{[]}\");"
        },
        {
          "name": "неверный тип",
          "code": "return !isValid(\"(]\");"
        },
        {
          "name": "пересечение",
          "code": "return !isValid(\"([)]\");"
        },
        {
          "name": "лишняя открывающая",
          "code": "return !isValid(\"((\");"
        },
        {
          "name": "лишняя закрывающая",
          "code": "return !isValid(\"())\");"
        }
      ]
    },
    {
      "title": "Min Stack",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "стек",
        "проектирование"
      ],
      "prompt": "Реализуйте `MinStack` с методами `push(x)`, `pop()`, `top()` и `getMin()` — все за O(1).",
      "starter": "class MinStack {\n  // ваш код\n}",
      "solution": "class MinStack {\n  #items = [];\n  #mins = []; // mins[i] — минимум среди items[0..i]\n\n  push(x) {\n    this.#items.push(x);\n    this.#mins.push(this.#mins.length === 0 ? x : Math.min(x, this.#mins.at(-1)));\n  }\n\n  pop() {\n    this.#mins.pop();\n    return this.#items.pop();\n  }\n\n  top() {\n    return this.#items.at(-1);\n  }\n\n  getMin() {\n    return this.#mins.at(-1);\n  }\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); const a = s.getMin(); s.pop(); return a === -3 && s.top() === 0 && s.getMin() === -2;"
        },
        {
          "name": "дубликаты минимума",
          "code": "const s = new MinStack(); s.push(1); s.push(1); s.pop(); return s.getMin() === 1;"
        }
      ],
      "notes": "Параллельный стек минимумов. Можно хранить пары `[x, min]` в одном стеке."
    },
    {
      "title": "Evaluate Reverse Polish Notation",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "стек",
        "математика"
      ],
      "prompt": "Вычислите выражение в обратной польской записи. Операторы `+ - * /`, деление — целочисленное с отбрасыванием дробной части (к нулю).\n\n`[\"2\",\"1\",\"+\",\"3\",\"*\"]` → `9`, `[\"4\",\"13\",\"5\",\"/\",\"+\"]` → `6`",
      "starter": "function evalRPN(tokens) {\n  // ваш код\n}",
      "solution": "function evalRPN(tokens) {\n  const ops = {\n    '+': (a, b) => a + b,\n    '-': (a, b) => a - b,\n    '*': (a, b) => a * b,\n    '/': (a, b) => Math.trunc(a / b),\n  };\n  const stack = [];\n  for (const token of tokens) {\n    if (token in ops) {\n      const b = stack.pop();\n      const a = stack.pop();\n      stack.push(ops[token](a, b));\n    } else {\n      stack.push(Number(token));\n    }\n  }\n  return stack[0];\n}",
      "tests": [
        {
          "name": "пример 1",
          "code": "return evalRPN([\"2\",\"1\",\"+\",\"3\",\"*\"]) === 9;"
        },
        {
          "name": "пример 2",
          "code": "return evalRPN([\"4\",\"13\",\"5\",\"/\",\"+\"]) === 6;"
        },
        {
          "name": "деление к нулю",
          "code": "return evalRPN([\"-7\",\"2\",\"/\"]) === -3;"
        }
      ],
      "notes": "Порядок операндов: первым снимается правый (`b`). `Math.trunc`, а не `Math.floor`: для −3,5 нужно −3."
    },
    {
      "title": "Daily Temperatures",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "монотонный стек",
        "массивы"
      ],
      "prompt": "Для каждого дня верните, через сколько дней станет теплее (0, если не станет). O(n).\n\n`[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`",
      "starter": "function dailyTemperatures(temps) {\n  // ваш код\n}",
      "solution": "function dailyTemperatures(temps) {\n  const answer = new Array(temps.length).fill(0);\n  const stack = [];\n  for (let i = 0; i < temps.length; i++) {\n    while (stack.length > 0 && temps[i] > temps[stack.at(-1)]) {\n      const j = stack.pop();\n      answer[j] = i - j;\n    }\n    stack.push(i);\n  }\n  return answer;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);"
        },
        {
          "name": "возрастание",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(dailyTemperatures([30,40,50]), [1,1,0]);"
        },
        {
          "name": "O(n) на убывании 10⁵",
          "code": "const a = Array.from({ length: 100000 }, (_, i) => 100000 - i); const s = performance.now(); dailyTemperatures(a); return performance.now() - s < 300;"
        }
      ]
    },
    {
      "title": "Largest Rectangle in Histogram",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "монотонный стек",
        "массивы"
      ],
      "prompt": "Дан массив высот столбцов шириной 1. Найдите площадь наибольшего прямоугольника. O(n).\n\n`[2,1,5,6,2,3]` → `10`",
      "starter": "function largestRectangleArea(heights) {\n  // ваш код\n}",
      "solution": "function largestRectangleArea(heights) {\n  const stack = []; // индексы столбцов с возрастающими высотами\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i]; // фиктивный нулевой столбец в конце\n    while (stack.length > 0 && h < heights[stack.at(-1)]) {\n      const height = heights[stack.pop()];\n      const left = stack.length > 0 ? stack.at(-1) + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return largestRectangleArea([2,1,5,6,2,3]) === 10;"
        },
        {
          "name": "один столбец",
          "code": "return largestRectangleArea([4]) === 4;"
        },
        {
          "name": "одинаковые",
          "code": "return largestRectangleArea([2,2,2]) === 6;"
        },
        {
          "name": "возрастание",
          "code": "return largestRectangleArea([1,2,3,4,5]) === 9;"
        }
      ],
      "notes": "Когда снимаем столбец, его левая граница — следующий элемент стека, правая — текущий `i`. Нулевой столбец в конце выталкивает всё оставшееся."
    },
    {
      "title": "Sliding Window Maximum",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "дек",
        "скользящее окно"
      ],
      "prompt": "Верните максимум каждого окна размера `k`. O(n).\n\n`maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)` → `[3,3,5,5,6,7]`",
      "starter": "function maxSlidingWindow(nums, k) {\n  // ваш код\n}",
      "solution": "function maxSlidingWindow(nums, k) {\n  const deque = []; // индексы, значения по убыванию\n  let head = 0;\n  const result = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (head < deque.length && deque[head] <= i - k) head++; // вышел за окно\n    while (deque.length > head && nums[deque.at(-1)] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[head]]);\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3), [3,3,5,5,6,7]);"
        },
        {
          "name": "k = 1",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(maxSlidingWindow([4, 2], 1), [4, 2]);"
        },
        {
          "name": "O(n) на 10⁵",
          "code": "const a = Array.from({ length: 100000 }, (_, i) => i); const s = performance.now(); const r = maxSlidingWindow(a, 5000); return r.length === 95001 && performance.now() - s < 300;"
        }
      ],
      "notes": "Монотонный дек на массиве с индексом головы — без `shift`."
    },
    {
      "title": "MinHeap",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "куча",
        "проектирование"
      ],
      "prompt": "Реализуйте класс `MinHeap(less?)` с `push(x)`, `pop()` (наименьший элемент или `undefined`), `peek()` и `size`. Необязательный компаратор `less(a, b)` возвращает `true`, если `a` должен быть выше. O(log n) на операцию.",
      "starter": "class MinHeap {\n  // ваш код\n}",
      "solution": "class MinHeap {\n  #a = [];\n  #less;\n  constructor(less = (x, y) => x < y) {\n    this.#less = less;\n  }\n  get size() {\n    return this.#a.length;\n  }\n  peek() {\n    return this.#a[0];\n  }\n  push(x) {\n    const a = this.#a;\n    a.push(x);\n    let i = a.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (!this.#less(a[i], a[parent])) break;\n      [a[i], a[parent]] = [a[parent], a[i]];\n      i = parent;\n    }\n  }\n  pop() {\n    const a = this.#a;\n    if (a.length === 0) return undefined;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && this.#less(a[l], a[m])) m = l;\n        if (r < a.length && this.#less(a[r], a[m])) m = r;\n        if (m === i) break;\n        [a[i], a[m]] = [a[m], a[i]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}",
      "tests": [
        {
          "name": "сортирует",
          "code": "const h = new MinHeap(); [5, 3, 8, 1, 9, 2].forEach((x) => h.push(x)); const out = []; while (h.size) out.push(h.pop()); return out.join() === \"1,2,3,5,8,9\";"
        },
        {
          "name": "пустая",
          "code": "const h = new MinHeap(); return h.pop() === undefined && h.size === 0;"
        },
        {
          "name": "компаратор",
          "code": "const h = new MinHeap((a, b) => a.p > b.p); h.push({ p: 1 }); h.push({ p: 7 }); h.push({ p: 3 }); return h.peek().p === 7;"
        },
        {
          "name": "10⁵ элементов быстро",
          "code": "const h = new MinHeap(); const s = performance.now(); for (let i = 0; i < 100000; i++) h.push((i * 7919) % 100003); let prev = -1, ok = true; while (h.size) { const x = h.pop(); if (x < prev) ok = false; prev = x; } return ok && performance.now() - s < 500;"
        }
      ]
    },
    {
      "title": "Kth Largest Element",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "куча",
        "сортировка"
      ],
      "prompt": "Найдите k-й по величине элемент массива (не k-й различный). Ожидается O(n log k) через min-кучу размера k (кучу реализуйте сами) или quickselect.\n\n`findKthLargest([3,2,1,5,6,4], 2)` → `5`",
      "starter": "function findKthLargest(nums, k) {\n  // ваш код\n}",
      "solution": "function findKthLargest(nums, k) {\n  const heap = [];\n  const up = (i) => {\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (heap[p] <= heap[i]) break;\n      [heap[p], heap[i]] = [heap[i], heap[p]];\n      i = p;\n    }\n  };\n  const down = (i) => {\n    for (;;) {\n      const l = 2 * i + 1, r = l + 1;\n      let m = i;\n      if (l < heap.length && heap[l] < heap[m]) m = l;\n      if (r < heap.length && heap[r] < heap[m]) m = r;\n      if (m === i) return;\n      [heap[m], heap[i]] = [heap[i], heap[m]];\n      i = m;\n    }\n  };\n  for (const x of nums) {\n    if (heap.length < k) {\n      heap.push(x);\n      up(heap.length - 1);\n    } else if (x > heap[0]) {\n      heap[0] = x; // вытесняем худший из k лучших\n      down(0);\n    }\n  }\n  return heap[0];\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return findKthLargest([3,2,1,5,6,4], 2) === 5;"
        },
        {
          "name": "дубликаты",
          "code": "return findKthLargest([3,2,3,1,2,4,5,5,6], 4) === 4;"
        },
        {
          "name": "k = n",
          "code": "return findKthLargest([7, 1, 4], 3) === 1;"
        }
      ]
    },
    {
      "title": "Find Median from Data Stream",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "куча",
        "проектирование"
      ],
      "prompt": "Реализуйте `MedianFinder` с `addNum(x)` (O(log n)) и `findMedian()` (O(1)). Для чётного количества — среднее двух средних.",
      "starter": "class MedianFinder {\n  // ваш код\n}",
      "solution": "class Heap {\n  #a = [];\n  constructor(less) { this.less = less; }\n  get size() { return this.#a.length; }\n  peek() { return this.#a[0]; }\n  push(x) {\n    const a = this.#a;\n    a.push(x);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (!this.less(a[i], a[p])) break;\n      [a[i], a[p]] = [a[p], a[i]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.#a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.less(a[l], a[m])) m = l;\n        if (r < a.length && this.less(a[r], a[m])) m = r;\n        if (m === i) break;\n        [a[i], a[m]] = [a[m], a[i]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nclass MedianFinder {\n  #low = new Heap((a, b) => a > b); // max-куча меньшей половины\n  #high = new Heap((a, b) => a < b); // min-куча большей половины\n\n  addNum(x) {\n    this.#low.push(x);\n    this.#high.push(this.#low.pop()); // наибольший из меньших — наверх\n    if (this.#high.size > this.#low.size) this.#low.push(this.#high.pop());\n  }\n\n  findMedian() {\n    return this.#low.size > this.#high.size\n      ? this.#low.peek()\n      : (this.#low.peek() + this.#high.peek()) / 2;\n  }\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const m = new MedianFinder(); m.addNum(1); m.addNum(2); const a = m.findMedian(); m.addNum(3); return a === 1.5 && m.findMedian() === 2;"
        },
        {
          "name": "случайный поток",
          "code": "const m = new MedianFinder(); const xs = []; let ok = true; for (let i = 0; i < 500; i++) { const x = (i * 7919) % 1009; xs.push(x); m.addNum(x); const s = xs.toSorted((a, b) => a - b); const n = s.length; const exp = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; if (m.findMedian() !== exp) ok = false; } return ok;"
        }
      ],
      "notes": "Инвариант: `low.size === high.size` или на 1 больше, и все элементы `low` ≤ всех элементов `high`."
    }
  ]
});
