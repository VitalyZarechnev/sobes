QUIZ.register({
  "id": "13-algorithms/01-complexity",
  "section": "13-algorithms",
  "title": "Сложность и подход к решению задач",
  "order": 1,
  "source": "../13-algorithms/01-complexity.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какая сложность у кода?",
      "code": "for (let i = 1; i < n; i *= 2) {\n  for (let j = 0; j < n; j++) {}\n}",
      "options": [
        "O(n)",
        "O(n log n)",
        "O(n²)",
        "O(log n)"
      ],
      "answer": 1,
      "explain": "Внешний цикл выполняется log₂n раз (i удваивается), внутренний — n раз."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какая сложность у удаления дубликатов так?",
      "code": "const out = [];\nfor (const x of arr) if (!out.includes(x)) out.push(x);",
      "options": [
        "O(n)",
        "O(n log n)",
        "O(n²)",
        "O(1)"
      ],
      "answer": 2,
      "explain": "`includes` — линейный поиск внутри цикла. `[...new Set(arr)]` даёт O(n)."
    },
    {
      "type": "order",
      "level": "middle",
      "q": "Расположите классы сложности от самого медленного роста к самому быстрому",
      "items": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
        "O(n²)",
        "O(2ⁿ)",
        "O(n!)"
      ],
      "explain": "Запомните ориентиры: при n = 10⁶ O(n log n) ≈ 2·10⁷ операций, O(n²) — 10¹²."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему `push` в массив считается O(1), хотя иногда буфер копируется целиком?",
      "options": [
        "V8 никогда не копирует массивы",
        "Амортизированно: редкие копирования O(n) распределяются на много дешёвых вставок",
        "Потому что массивы в JS — связные списки",
        "Это O(log n), а не O(1)"
      ],
      "answer": 1,
      "explain": "Ёмкость растёт геометрически, суммарная работа на n вставок — O(n)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Ограничение задачи: `1 ≤ n ≤ 20`. Какой подход, скорее всего, ожидается?",
      "options": [
        "O(n log n) сортировка",
        "Перебор подмножеств или бэктрекинг O(2ⁿ)",
        "Обязательно O(n)",
        "Бинарный поиск"
      ],
      "answer": 1,
      "explain": "2²⁰ ≈ 10⁶ — перебор укладывается. Маленькие ограничения — подсказка на экспоненциальное решение."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие операции работают за O(n)?",
      "options": [
        "`arr.shift()`",
        "`arr.pop()`",
        "`arr.includes(x)`",
        "`map.has(k)`",
        "`[...arr]`",
        "`arr.at(-1)`"
      ],
      "answer": [
        0,
        2,
        4
      ],
      "explain": "`shift` сдвигает индексы, `includes` ищет линейно, spread копирует. `pop`, `has`, `at` — O(1)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Сложность по памяти рекурсивного обхода вырожденного (вытянутого в список) бинарного дерева из n узлов?",
      "options": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n²)"
      ],
      "answer": 2,
      "explain": "Глубина стека вызовов равна высоте дерева, а у вырожденного дерева она n. В JS это ещё и риск `RangeError: Maximum call stack size exceeded`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log([10, 9, 1, 100].sort());",
      "options": [
        "`[1, 9, 10, 100]`",
        "`[1, 10, 100, 9]`",
        "`[100, 10, 9, 1]`",
        "`[10, 9, 1, 100]`"
      ],
      "answer": 1,
      "explain": "Без компаратора элементы сравниваются как строки. Нужно `sort((a, b) => a - b)`."
    }
  ],
  "tasks": [
    {
      "title": "Contains Duplicate",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "хэш-таблица",
        "массивы"
      ],
      "prompt": "Верните `true`, если в массиве есть хотя бы одно повторяющееся значение. Ожидается O(n) по времени.\n\n`[1, 2, 3, 1]` → `true`, `[1, 2, 3]` → `false`.",
      "starter": "function containsDuplicate(nums) {\n  // ваш код\n}",
      "solution": "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}",
      "tests": [
        {
          "name": "есть дубликат",
          "code": "return containsDuplicate([1, 2, 3, 1]) === true;"
        },
        {
          "name": "нет дубликатов",
          "code": "return containsDuplicate([1, 2, 3]) === false;"
        },
        {
          "name": "пустой",
          "code": "return containsDuplicate([]) === false;"
        },
        {
          "name": "большой вход",
          "code": "const a = Array.from({ length: 200000 }, (_, i) => i); const s = performance.now(); const r = containsDuplicate(a); return r === false && performance.now() - s < 2500;"
        }
      ],
      "notes": "Альтернатива в одну строку: `new Set(nums).size !== nums.length` — тоже O(n), но без раннего выхода."
    },
    {
      "title": "Очередь с O(1) на dequeue",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "очередь",
        "проектирование"
      ],
      "prompt": "Реализуйте класс `Queue` с методами `enqueue(x)`, `dequeue()` (возвращает `undefined` для пустой), `peek()` и геттером `size`. Обе операции — O(1) (амортизированно). `Array.prototype.shift` использовать нельзя.",
      "starter": "class Queue {\n  // ваш код\n}",
      "solution": "class Queue {\n  #items = [];\n  #head = 0;\n\n  enqueue(x) {\n    this.#items.push(x);\n  }\n\n  dequeue() {\n    if (this.size === 0) return undefined;\n    const x = this.#items[this.#head];\n    this.#items[this.#head++] = undefined;\n    // Периодически сжимаем буфер, чтобы не копить память\n    if (this.#head > 1024 && this.#head * 2 > this.#items.length) {\n      this.#items = this.#items.slice(this.#head);\n      this.#head = 0;\n    }\n    return x;\n  }\n\n  peek() {\n    return this.size === 0 ? undefined : this.#items[this.#head];\n  }\n\n  get size() {\n    return this.#items.length - this.#head;\n  }\n}",
      "tests": [
        {
          "name": "FIFO",
          "code": "const q = new Queue(); q.enqueue(1); q.enqueue(2); q.enqueue(3); return q.dequeue() === 1 && q.peek() === 2 && q.size === 2;"
        },
        {
          "name": "пустая",
          "code": "const q = new Queue(); return q.dequeue() === undefined && q.peek() === undefined && q.size === 0;"
        },
        {
          "name": "не использует shift",
          "code": "return !Queue.toString().includes('shift(');"
        },
        {
          "name": "быстро на 300k операций",
          "code": "const q = new Queue(); const s = performance.now(); for (let i = 0; i < 300000; i++) q.enqueue(i); let sum = 0; while (q.size) sum += q.dequeue(); return sum === 299999 * 300000 / 2 && performance.now() - s < 1000;"
        }
      ],
      "notes": "Индекс головы вместо `shift` — стандартный приём для BFS. Альтернативы: кольцевой буфер, очередь на двух стеках."
    },
    {
      "title": "Быстрое возведение в степень",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "математика",
        "разделяй и властвуй"
      ],
      "prompt": "Реализуйте `power(x, n)` для целого `n` (может быть отрицательным) за O(log n) умножений. `Math.pow` и `**` использовать нельзя.\n\n`power(2, 10)` → `1024`, `power(2, -2)` → `0.25`.",
      "starter": "function power(x, n) {\n  // ваш код\n}",
      "solution": "function power(x, n) {\n  if (n < 0) return 1 / power(x, -n);\n  let result = 1;\n  let base = x;\n  let exp = n;\n  while (exp > 0) {\n    if (exp % 2 === 1) result *= base;\n    base *= base;\n    exp = Math.floor(exp / 2);\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "положительная",
          "code": "return power(2, 10) === 1024 && power(3, 5) === 243;"
        },
        {
          "name": "ноль",
          "code": "return power(7, 0) === 1;"
        },
        {
          "name": "отрицательная",
          "code": "return power(2, -2) === 0.25;"
        },
        {
          "name": "без ** и Math.pow",
          "code": "const s = power.toString(); return !s.includes('**') && !s.includes('Math.pow');"
        },
        {
          "name": "большая степень быстро",
          "code": "return power(1.0000001, 1e9) > 1 && Number.isFinite(power(1.0000001, 1e9));"
        }
      ],
      "notes": "Идея: x¹³ = x⁸ · x⁴ · x¹ (13 = 1101₂). На каждом шаге возводим основание в квадрат и домножаем результат, если текущий бит степени — 1."
    },
    {
      "title": "Решето Эратосфена",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "математика",
        "массивы"
      ],
      "prompt": "Верните количество простых чисел, строго меньших `n`. Ожидается O(n log log n).\n\n`countPrimes(10)` → `4` (2, 3, 5, 7).",
      "starter": "function countPrimes(n) {\n  // ваш код\n}",
      "solution": "function countPrimes(n) {\n  if (n < 3) return 0;\n  const composite = new Uint8Array(n);\n  let count = 0;\n  for (let i = 2; i < n; i++) {\n    if (composite[i]) continue;\n    count++;\n    for (let j = i * i; j < n; j += i) composite[j] = 1;\n  }\n  return count;\n}",
      "tests": [
        {
          "name": "n = 10",
          "code": "return countPrimes(10) === 4;"
        },
        {
          "name": "маленькие n",
          "code": "return countPrimes(0) === 0 && countPrimes(2) === 0 && countPrimes(3) === 1;"
        },
        {
          "name": "n = 5·10⁶ быстро",
          "code": "const s = performance.now(); return countPrimes(5000000) === 348513 && performance.now() - s < 2000;"
        }
      ],
      "notes": "Вычёркивание начинаем с `i * i`: меньшие кратные уже вычеркнуты меньшими простыми. `Uint8Array` экономит память и быстрее обычного массива."
    }
  ]
});
