QUIZ.register({
  "id": "13-algorithms/07-recursion-dp",
  "section": "13-algorithms",
  "title": "Рекурсия, бэктрекинг, DP",
  "order": 7,
  "source": "../13-algorithms/07-recursion-dp.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Сколько подмножеств у множества из n элементов?",
      "options": [
        "n",
        "n²",
        "2ⁿ",
        "n!"
      ],
      "answer": 2,
      "explain": "Каждый элемент либо берём, либо нет."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что не так в коде бэктрекинга?",
      "code": "const backtrack = (i) => {\n  if (i === nums.length) { result.push(current); return; }\n  ...\n};",
      "options": [
        "Нет базы рекурсии",
        "В результат кладётся ссылка на изменяемый массив, а не копия",
        "Нужно использовать while",
        "Всё верно"
      ],
      "answer": 1,
      "explain": "Нужно `result.push([...current])`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Номиналы `[1, 3, 4]`, сумма 6. Сколько монет даст жадный алгоритм и сколько — оптимум?",
      "options": [
        "2 и 2",
        "3 и 2",
        "3 и 3",
        "4 и 2"
      ],
      "answer": 1,
      "explain": "Жадно 4 + 1 + 1, оптимум 3 + 3. Нужен DP."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какие два свойства задачи делают DP применимым?",
      "options": [
        "Сортированный вход и уникальные элементы",
        "Перекрывающиеся подзадачи и оптимальная подструктура",
        "Граф без циклов и неотрицательные веса",
        "Маленький n и целые числа"
      ],
      "answer": 1,
      "explain": "Без перекрытия достаточно «разделяй и властвуй», без оптимальной подструктуры нельзя собрать ответ из подответов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой алгоритм лежит в основе построчного diff (git diff)?",
      "options": [
        "Дейкстра",
        "Поиск LCS / кратчайшего редакционного скрипта (Майерс)",
        "Быстрая сортировка",
        "Бинарный поиск"
      ],
      "answer": 1,
      "explain": "Минимальный набор вставок и удалений — двойственная задача к наибольшей общей подпоследовательности."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "`dp[i]` зависит только от `dp[i-1]` и `dp[i-2]`. Какая минимальная память нужна?",
      "options": [
        "O(n²)",
        "O(n)",
        "O(1)",
        "O(log n)"
      ],
      "answer": 2,
      "explain": "Достаточно двух переменных."
    }
  ],
  "tasks": [
    {
      "title": "Climbing Stairs",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "DP",
        "рекурсия"
      ],
      "prompt": "Можно подняться на 1 или 2 ступени за шаг. Сколько различных способов подняться на `n` ступеней (1 ≤ n ≤ 90)? Ответ для больших n превышает `Number.MAX_SAFE_INTEGER`, поэтому верните `BigInt`. O(n) времени, O(1) памяти.\n\n`climbStairs(3)` → `3n`",
      "starter": "function climbStairs(n) {\n  // ваш код\n}",
      "solution": "function climbStairs(n) {\n  let a = 1n; // способов дойти до ступени i - 2\n  let b = 1n; // до ступени i - 1\n  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}",
      "tests": [
        {
          "name": "малые",
          "code": "return climbStairs(1) === 1n && climbStairs(2) === 2n && climbStairs(3) === 3n && climbStairs(5) === 8n;"
        },
        {
          "name": "большие точно",
          "code": "return climbStairs(90) === 4660046610375530309n;"
        }
      ],
      "notes": "Это числа Фибоначчи. Для n = 90 ответ больше `Number.MAX_SAFE_INTEGER`."
    },
    {
      "title": "House Robber",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "DP"
      ],
      "prompt": "Дома с суммами `nums` стоят в ряд; нельзя грабить два соседних. Верните максимальную сумму. O(n) времени, O(1) памяти.\n\n`[2,7,9,3,1]` → `12`",
      "starter": "function rob(nums) {\n  // ваш код\n}",
      "solution": "function rob(nums) {\n  let prev2 = 0;\n  let prev1 = 0;\n  for (const x of nums) {\n    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];\n  }\n  return prev1;\n}",
      "tests": [
        {
          "name": "пример 1",
          "code": "return rob([1, 2, 3, 1]) === 4;"
        },
        {
          "name": "пример 2",
          "code": "return rob([2, 7, 9, 3, 1]) === 12;"
        },
        {
          "name": "пустой",
          "code": "return rob([]) === 0;"
        },
        {
          "name": "выгодно пропустить два",
          "code": "return rob([2, 1, 1, 2]) === 4;"
        }
      ]
    },
    {
      "title": "Coin Change",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "DP"
      ],
      "prompt": "Минимальное число монет номиналов `coins`, чтобы набрать `amount` (каждого номинала — сколько угодно). Невозможно — `-1`.\n\n`coinChange([1, 3, 4], 6)` → `2`",
      "starter": "function coinChange(coins, amount) {\n  // ваш код\n}",
      "solution": "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let s = 1; s <= amount; s++) {\n    for (const c of coins) {\n      if (c <= s && dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
      "tests": [
        {
          "name": "жадность ошибается",
          "code": "return coinChange([1, 3, 4], 6) === 2;"
        },
        {
          "name": "классика",
          "code": "return coinChange([1, 2, 5], 11) === 3;"
        },
        {
          "name": "невозможно",
          "code": "return coinChange([2], 3) === -1;"
        },
        {
          "name": "ноль",
          "code": "return coinChange([1], 0) === 0;"
        },
        {
          "name": "большая сумма",
          "code": "return coinChange([186, 419, 83, 408], 6249) === 20;"
        }
      ]
    },
    {
      "title": "Longest Increasing Subsequence",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "DP",
        "бинарный поиск"
      ],
      "prompt": "Верните длину наибольшей строго возрастающей подпоследовательности. O(n log n).\n\n`[10,9,2,5,3,7,101,18]` → `4` (2, 3, 7, 18)",
      "starter": "function lengthOfLIS(nums) {\n  // ваш код\n}",
      "solution": "function lengthOfLIS(nums) {\n  // tails[k] — наименьший возможный последний элемент возрастающей подпоследовательности длины k + 1\n  const tails = [];\n  for (const x of nums) {\n    let lo = 0;\n    let hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    tails[lo] = x;\n  }\n  return tails.length;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return lengthOfLIS([10,9,2,5,3,7,101,18]) === 4;"
        },
        {
          "name": "одинаковые",
          "code": "return lengthOfLIS([7,7,7,7]) === 1;"
        },
        {
          "name": "возрастание",
          "code": "return lengthOfLIS([0,1,0,3,2,3]) === 4;"
        },
        {
          "name": "O(n log n) на 10⁵",
          "code": "const a = Array.from({ length: 100000 }, (_, i) => i); const s = performance.now(); return lengthOfLIS(a) === 100000 && performance.now() - s < 300;"
        }
      ],
      "notes": "Простой DP — O(n²): `dp[i] = 1 + max(dp[j])` для `j < i, a[j] < a[i]`. Patience sorting с бинпоиском — O(n log n). LIS используется во Vue 3 при диффе дочерних узлов, чтобы минимизировать перемещения DOM-элементов."
    },
    {
      "title": "Longest Common Subsequence",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "DP",
        "строки"
      ],
      "prompt": "Верните длину наибольшей общей подпоследовательности строк `a` и `b`. O(n·m) времени, O(min(n, m)) памяти желательно.\n\n`(\"abcde\", \"ace\")` → `3`",
      "starter": "function longestCommonSubsequence(a, b) {\n  // ваш код\n}",
      "solution": "function longestCommonSubsequence(a, b) {\n  if (a.length < b.length) [a, b] = [b, a]; // строка dp по более короткой\n  let prev = new Array(b.length + 1).fill(0);\n  for (let i = 1; i <= a.length; i++) {\n    const curr = new Array(b.length + 1).fill(0);\n    for (let j = 1; j <= b.length; j++) {\n      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);\n    }\n    prev = curr;\n  }\n  return prev[b.length];\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return longestCommonSubsequence(\"abcde\", \"ace\") === 3;"
        },
        {
          "name": "одинаковые",
          "code": "return longestCommonSubsequence(\"abc\", \"abc\") === 3;"
        },
        {
          "name": "нет общих",
          "code": "return longestCommonSubsequence(\"abc\", \"def\") === 0;"
        },
        {
          "name": "пустая",
          "code": "return longestCommonSubsequence(\"\", \"abc\") === 0;"
        }
      ]
    },
    {
      "title": "Edit Distance (Левенштейн)",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "DP",
        "строки"
      ],
      "prompt": "Минимальное число операций (вставка, удаление, замена символа), чтобы превратить `a` в `b`.\n\n`(\"horse\", \"ros\")` → `3`",
      "starter": "function minDistance(a, b) {\n  // ваш код\n}",
      "solution": "function minDistance(a, b) {\n  let prev = Array.from({ length: b.length + 1 }, (_, j) => j); // из пустой строки — j вставок\n  for (let i = 1; i <= a.length; i++) {\n    const curr = [i]; // в пустую строку — i удалений\n    for (let j = 1; j <= b.length; j++) {\n      curr[j] = a[i - 1] === b[j - 1]\n        ? prev[j - 1]\n        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]); // удаление, вставка, замена\n    }\n    prev = curr;\n  }\n  return prev[b.length];\n}",
      "tests": [
        {
          "name": "horse → ros",
          "code": "return minDistance(\"horse\", \"ros\") === 3;"
        },
        {
          "name": "intention → execution",
          "code": "return minDistance(\"intention\", \"execution\") === 5;"
        },
        {
          "name": "пустые",
          "code": "return minDistance(\"\", \"abc\") === 3 && minDistance(\"abc\", \"\") === 3 && minDistance(\"\", \"\") === 0;"
        },
        {
          "name": "опечатка",
          "code": "return minDistance(\"javascirpt\", \"javascript\") === 2;"
        }
      ]
    },
    {
      "title": "Subsets",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бэктрекинг"
      ],
      "prompt": "Верните все подмножества массива различных чисел (порядок подмножеств и элементов не важен).",
      "starter": "function subsets(nums) {\n  // ваш код\n}",
      "solution": "function subsets(nums) {\n  const result = [];\n  const current = [];\n  const backtrack = (i) => {\n    if (i === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    current.push(nums[i]);\n    backtrack(i + 1);\n    current.pop();\n    backtrack(i + 1);\n  };\n  backtrack(0);\n  return result;\n}",
      "tests": [
        {
          "name": "три элемента",
          "code": "const norm = (xs) => xs.map((x) => [...x].sort((a, b) => a - b)).map((x) => x.join(\",\")).sort(); const r = subsets([1, 2, 3]); return r.length === 8 && norm(r).join(\"|\") === norm([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]).join(\"|\");"
        },
        {
          "name": "пустой",
          "code": "const r = subsets([]); return r.length === 1 && r[0].length === 0;"
        }
      ]
    },
    {
      "title": "Permutations",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бэктрекинг"
      ],
      "prompt": "Верните все перестановки массива различных чисел в лексикографическом порядке индексов (как получается естественным бэктрекингом).\n\n`[1,2,3]` → `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`",
      "starter": "function permute(nums) {\n  // ваш код\n}",
      "solution": "function permute(nums) {\n  const result = [];\n  const current = [];\n  const used = new Array(nums.length).fill(false);\n  const backtrack = () => {\n    if (current.length === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      backtrack();\n      current.pop();\n      used[i] = false;\n    }\n  };\n  backtrack();\n  return result;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(permute([1, 2, 3]), [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);"
        },
        {
          "name": "один",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(permute([0]), [[0]]);"
        },
        {
          "name": "n = 7 → 5040",
          "code": "return permute([1,2,3,4,5,6,7]).length === 5040;"
        }
      ]
    },
    {
      "title": "Combination Sum",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бэктрекинг"
      ],
      "prompt": "Найдите все уникальные комбинации чисел из `candidates` (различные положительные, каждое можно брать сколько угодно раз) с суммой `target`. Комбинации — неубывающие, порядок комбинаций не важен.\n\n`([2,3,6,7], 7)` → `[[2,2,3],[7]]`",
      "starter": "function combinationSum(candidates, target) {\n  // ваш код\n}",
      "solution": "function combinationSum(candidates, target) {\n  const sorted = candidates.toSorted((a, b) => a - b);\n  const result = [];\n  const current = [];\n  const backtrack = (start, remaining) => {\n    if (remaining === 0) {\n      result.push([...current]);\n      return;\n    }\n    for (let i = start; i < sorted.length; i++) {\n      if (sorted[i] > remaining) break; // отсечение: дальше только больше\n      current.push(sorted[i]);\n      backtrack(i, remaining - sorted[i]); // i, а не i + 1: число можно повторять\n      current.pop();\n    }\n  };\n  backtrack(0, target);\n  return result;\n}",
      "tests": [
        {
          "name": "пример 1",
          "code": "const norm = (xs) => xs.map((x) => [...x].sort((a, b) => a - b)).map((x) => x.join(\",\")).sort(); return norm(combinationSum([2, 3, 6, 7], 7)).join(\"|\") === norm([[2, 2, 3], [7]]).join(\"|\");"
        },
        {
          "name": "пример 2",
          "code": "const norm = (xs) => xs.map((x) => [...x].sort((a, b) => a - b)).map((x) => x.join(\",\")).sort(); return norm(combinationSum([2, 3, 5], 8)).join(\"|\") === norm([[2,2,2,2],[2,3,3],[3,5]]).join(\"|\");"
        },
        {
          "name": "нет решений",
          "code": "return combinationSum([2], 1).length === 0;"
        }
      ]
    },
    {
      "title": "Generate Parentheses",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бэктрекинг",
        "строки"
      ],
      "prompt": "Сгенерируйте все правильные скобочные последовательности из `n` пар скобок в лексикографическом порядке (`(` < `)`).\n\n`n = 3` → `[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]`",
      "starter": "function generateParenthesis(n) {\n  // ваш код\n}",
      "solution": "function generateParenthesis(n) {\n  const result = [];\n  const backtrack = (s, open, close) => {\n    if (s.length === 2 * n) {\n      result.push(s);\n      return;\n    }\n    if (open < n) backtrack(s + '(', open + 1, close);\n    if (close < open) backtrack(s + ')', open, close + 1); // закрывать можно, только если есть открытая\n  };\n  backtrack('', 0, 0);\n  return result;\n}",
      "tests": [
        {
          "name": "n = 3",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(generateParenthesis(3), [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]);"
        },
        {
          "name": "n = 1",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(generateParenthesis(1), [\"()\"]);"
        },
        {
          "name": "n = 8 → 1430 (число Каталана)",
          "code": "return generateParenthesis(8).length === 1430;"
        }
      ]
    }
  ]
});
