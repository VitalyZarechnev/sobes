QUIZ.register({
  "id": "13-algorithms/02-hashing-two-pointers-window",
  "section": "13-algorithms",
  "title": "Хэш, два указателя, окно, префиксы",
  "order": 2,
  "source": "../13-algorithms/02-hashing-two-pointers-window.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Массив отсортирован, нужна пара с суммой target. Оптимальная память?",
      "options": [
        "O(n) — хэш",
        "O(1) — два встречных указателя",
        "O(n²)",
        "O(log n)"
      ],
      "answer": 1,
      "explain": "Сортировка позволяет отбрасывать кандидатов сдвигом указателей."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Найти самую длинную подстроку, содержащую не более k различных символов. Паттерн?",
      "options": [
        "Префиксные суммы",
        "Переменное скользящее окно + Map счётчиков",
        "Бинарный поиск",
        "Два встречных указателя"
      ],
      "answer": 1,
      "explain": "«Подряд идущие» + «самая длинная с условием» — классика переменного окна."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Количество подмассивов с суммой k, числа бывают отрицательными. Паттерн?",
      "options": [
        "Скользящее окно",
        "Префиксные суммы + хэш частот префиксов",
        "Сортировка + два указателя",
        "Стек"
      ],
      "answer": 1,
      "explain": "При отрицательных числах окно не монотонно."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что вернёт `twoSum([3, 3], 6)` в реализации с Map, где элемент кладётся после проверки?",
      "options": [
        "`[]`",
        "`[0, 1]`",
        "`[0, 0]`",
        "`[1, 1]`"
      ],
      "answer": 1,
      "explain": "Первая тройка уже в Map, когда приходит вторая."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие ключи хэш-таблицы подходят для группировки анаграмм?",
      "options": [
        "отсортированная строка",
        "строка-счётчик букв вида `a1b0c2…`",
        "длина слова",
        "сумма кодов символов",
        "первая буква"
      ],
      "answer": [
        0,
        1
      ],
      "explain": "Длина, первая буква и сумма кодов дают коллизии у разных групп (`ad` и `bc` имеют одинаковую сумму)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему переменное окно — O(n), а не O(n²)?",
      "options": [
        "Потому что внутренний while выполняется не более одного раза",
        "Каждый указатель только растёт и проходит массив не более одного раза",
        "Из-за Map",
        "Это O(n log n)"
      ],
      "answer": 1,
      "explain": "Амортизированный анализ: суммарно ≤ 2n сдвигов."
    }
  ],
  "tasks": [
    {
      "title": "Two Sum",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "хэш-таблица",
        "массивы"
      ],
      "prompt": "Даны массив `nums` и число `target`. Верните индексы `[i, j]` (i < j) двух чисел с суммой `target`. Решение существует ровно одно. O(n).\n\n`twoSum([2, 7, 11, 15], 9)` → `[0, 1]`",
      "starter": "function twoSum(nums, target) {\n  // ваш код\n}",
      "solution": "function twoSum(nums, target) {\n  const indexByValue = new Map();\n  for (const [i, x] of nums.entries()) {\n    const j = indexByValue.get(target - x);\n    if (j !== undefined) return [j, i];\n    indexByValue.set(x, i);\n  }\n  return [];\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(twoSum([2, 7, 11, 15], 9), [0, 1]);"
        },
        {
          "name": "дубликаты",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(twoSum([3, 3], 6), [0, 1]);"
        },
        {
          "name": "не берёт элемент дважды",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(twoSum([3, 2, 4], 6), [1, 2]);"
        },
        {
          "name": "отрицательные",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(twoSum([-3, 4, 3, 90], 0), [0, 2]);"
        }
      ]
    },
    {
      "title": "Valid Anagram",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "хэш-таблица",
        "строки"
      ],
      "prompt": "Верните `true`, если строка `t` — анаграмма строки `s` (те же символы в том же количестве). O(n).\n\n`isAnagram(\"listen\", \"silent\")` → `true`",
      "starter": "function isAnagram(s, t) {\n  // ваш код\n}",
      "solution": "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = new Map();\n  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);\n  for (const ch of t) {\n    const c = count.get(ch);\n    if (!c) return false;\n    count.set(ch, c - 1);\n  }\n  return true;\n}",
      "tests": [
        {
          "name": "анаграмма",
          "code": "return isAnagram(\"listen\", \"silent\");"
        },
        {
          "name": "не анаграмма",
          "code": "return !isAnagram(\"rat\", \"car\");"
        },
        {
          "name": "разная длина",
          "code": "return !isAnagram(\"ab\", \"abb\");"
        },
        {
          "name": "частоты",
          "code": "return !isAnagram(\"aab\", \"abb\");"
        },
        {
          "name": "emoji",
          "code": "return isAnagram(\"😀a\", \"a😀\");"
        }
      ]
    },
    {
      "title": "Group Anagrams",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "хэш-таблица",
        "строки",
        "сортировка"
      ],
      "prompt": "Сгруппируйте слова-анаграммы. Порядок групп — по первому появлению, порядок слов в группе — исходный.\n\n`[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]` → `[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]`",
      "starter": "function groupAnagrams(words) {\n  // ваш код\n}",
      "solution": "function groupAnagrams(words) {\n  const groups = new Map();\n  for (const w of words) {\n    const key = [...w].sort().join('');\n    const group = groups.get(key);\n    if (group) group.push(w);\n    else groups.set(key, [w]);\n  }\n  return [...groups.values()];\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(groupAnagrams([\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]), [[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]);"
        },
        {
          "name": "пустая строка",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(groupAnagrams([\"\"]), [[\"\"]]);"
        },
        {
          "name": "коллизия суммы кодов",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(groupAnagrams([\"ad\", \"bc\"]), [[\"ad\"], [\"bc\"]]);"
        }
      ],
      "notes": "Ключ-счётчик (`a1e1t1`) даёт O(n·k) вместо O(n·k log k) для длинных слов."
    },
    {
      "title": "Top K Frequent Elements",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "хэш-таблица",
        "куча",
        "сортировка подсчётом"
      ],
      "prompt": "Верните `k` самых частых элементов массива, отсортированных по убыванию частоты (при равной частоте — по первому появлению). Лучше, чем O(n log n): подсчёт + «корзины» по частоте.\n\n`topKFrequent([1,1,1,2,2,3], 2)` → `[1, 2]`",
      "starter": "function topKFrequent(nums, k) {\n  // ваш код\n}",
      "solution": "function topKFrequent(nums, k) {\n  const freq = new Map();\n  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);\n  // buckets[c] — элементы, встретившиеся ровно c раз (в порядке первого появления)\n  const buckets = Array.from({ length: nums.length + 1 }, () => []);\n  for (const [x, c] of freq) buckets[c].push(x);\n  const result = [];\n  for (let c = buckets.length - 1; c > 0 && result.length < k; c--) {\n    for (const x of buckets[c]) {\n      if (result.length === k) break;\n      result.push(x);\n    }\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(topKFrequent([1,1,1,2,2,3], 2), [1, 2]);"
        },
        {
          "name": "k = 1",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(topKFrequent([4, 4, 5], 1), [4]);"
        },
        {
          "name": "равные частоты",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(topKFrequent([7, 8, 8, 7, 9], 2), [7, 8]);"
        }
      ],
      "notes": "Bucket sort по частоте — O(n). Альтернатива — min-куча размера k: O(n log k)."
    },
    {
      "title": "Valid Palindrome",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "два указателя",
        "строки"
      ],
      "prompt": "Проверьте, что строка — палиндром, учитывая только буквы и цифры (любого алфавита) и игнорируя регистр. O(n) времени, O(1) дополнительной памяти желательно.\n\n`\"A man, a plan, a canal: Panama\"` → `true`, `\"А роза упала на лапу Азора\"` → `true`",
      "starter": "function isPalindrome(s) {\n  // ваш код\n}",
      "solution": "function isPalindrome(s) {\n  const isAlnum = (ch) => /[\\p{L}\\p{N}]/u.test(ch);\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    if (!isAlnum(s[left])) { left++; continue; }\n    if (!isAlnum(s[right])) { right--; continue; }\n    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;\n    left++;\n    right--;\n  }\n  return true;\n}",
      "tests": [
        {
          "name": "латиница",
          "code": "return isPalindrome(\"A man, a plan, a canal: Panama\");"
        },
        {
          "name": "кириллица",
          "code": "return isPalindrome(\"А роза упала на лапу Азора\");"
        },
        {
          "name": "не палиндром",
          "code": "return !isPalindrome(\"race a car\");"
        },
        {
          "name": "пустая",
          "code": "return isPalindrome(\" \");"
        }
      ]
    },
    {
      "title": "3Sum",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "два указателя",
        "сортировка",
        "массивы"
      ],
      "prompt": "Найдите все **уникальные** тройки `[a, b, c]` с суммой 0. Каждая тройка отсортирована по возрастанию, тройки — в лексикографическом порядке. O(n²).\n\n`[-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`",
      "starter": "function threeSum(nums) {\n  // ваш код\n}",
      "solution": "function threeSum(nums) {\n  const a = nums.toSorted((x, y) => x - y);\n  const result = [];\n  for (let i = 0; i < a.length - 2; i++) {\n    if (a[i] > 0) break;\n    if (i > 0 && a[i] === a[i - 1]) continue; // пропуск дубликатов первого числа\n    let left = i + 1;\n    let right = a.length - 1;\n    while (left < right) {\n      const sum = a[i] + a[left] + a[right];\n      if (sum < 0) left++;\n      else if (sum > 0) right--;\n      else {\n        result.push([a[i], a[left], a[right]]);\n        while (left < right && a[left] === a[left + 1]) left++;\n        while (left < right && a[right] === a[right - 1]) right--;\n        left++;\n        right--;\n      }\n    }\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(threeSum([-1, 0, 1, 2, -1, -4]), [[-1, -1, 2], [-1, 0, 1]]);"
        },
        {
          "name": "нули",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(threeSum([0, 0, 0, 0]), [[0, 0, 0]]);"
        },
        {
          "name": "нет решений",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(threeSum([1, 2, -2, -1]), []);"
        },
        {
          "name": "не мутирует вход",
          "code": "const a = [3, -3, 0]; threeSum(a); return a.join() === \"3,-3,0\";"
        }
      ],
      "notes": "Сортировка + для каждого `i` задача Two Sum на отсортированном хвосте двумя указателями. Дубликаты пропускаем на всех трёх позициях."
    },
    {
      "title": "Container With Most Water",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "два указателя",
        "жадный"
      ],
      "prompt": "Дан массив высот `height`. Выберите две линии, которые вместе с осью X образуют контейнер с максимальной площадью `min(h[i], h[j]) * (j - i)`. O(n).\n\n`[1,8,6,2,5,4,8,3,7]` → `49`",
      "starter": "function maxArea(height) {\n  // ваш код\n}",
      "solution": "function maxArea(height) {\n  let left = 0;\n  let right = height.length - 1;\n  let best = 0;\n  while (left < right) {\n    const area = Math.min(height[left], height[right]) * (right - left);\n    best = Math.max(best, area);\n    // Двигаем меньшую стенку: большая при уменьшении ширины площадь не увеличит\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return best;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return maxArea([1,8,6,2,5,4,8,3,7]) === 49;"
        },
        {
          "name": "две линии",
          "code": "return maxArea([1, 1]) === 1;"
        },
        {
          "name": "O(n) на 10⁶",
          "code": "const h = Array.from({ length: 1e6 }, (_, i) => i % 1000); const s = performance.now(); maxArea(h); return performance.now() - s < 300;"
        }
      ]
    },
    {
      "title": "Longest Substring Without Repeating Characters",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "скользящее окно",
        "хэш-таблица",
        "строки"
      ],
      "prompt": "Верните длину самой длинной подстроки без повторяющихся символов. O(n).\n\n`\"abcabcbb\"` → `3` («abc»), `\"pwwkew\"` → `3` («wke»)",
      "starter": "function lengthOfLongestSubstring(s) {\n  // ваш код\n}",
      "solution": "function lengthOfLongestSubstring(s) {\n  const lastIndex = new Map();\n  let start = 0;\n  let best = 0;\n  for (let end = 0; end < s.length; end++) {\n    const ch = s[end];\n    if (lastIndex.has(ch) && lastIndex.get(ch) >= start) start = lastIndex.get(ch) + 1;\n    lastIndex.set(ch, end);\n    best = Math.max(best, end - start + 1);\n  }\n  return best;\n}",
      "tests": [
        {
          "name": "abcabcbb",
          "code": "return lengthOfLongestSubstring(\"abcabcbb\") === 3;"
        },
        {
          "name": "bbbbb",
          "code": "return lengthOfLongestSubstring(\"bbbbb\") === 1;"
        },
        {
          "name": "pwwkew",
          "code": "return lengthOfLongestSubstring(\"pwwkew\") === 3;"
        },
        {
          "name": "abba",
          "code": "return lengthOfLongestSubstring(\"abba\") === 2;"
        },
        {
          "name": "пустая",
          "code": "return lengthOfLongestSubstring(\"\") === 0;"
        }
      ],
      "notes": "Тест `abba` ловит частую ошибку: без проверки `lastIndex.get(ch) >= start` левая граница откатывается назад."
    },
    {
      "title": "Minimum Window Substring",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "скользящее окно",
        "хэш-таблица",
        "строки"
      ],
      "prompt": "Найдите в `s` самую короткую подстроку, содержащую все символы `t` (с учётом кратности). Нет такой — `\"\"`. O(|s| + |t|).\n\n`minWindow(\"ADOBECODEBANC\", \"ABC\")` → `\"BANC\"`",
      "starter": "function minWindow(s, t) {\n  // ваш код\n}",
      "solution": "function minWindow(s, t) {\n  if (t.length === 0) return '';\n  const need = new Map();\n  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);\n  let missing = t.length; // сколько символов t ещё не покрыто окном\n  let start = 0;\n  let bestStart = 0;\n  let bestLen = Infinity;\n  for (let end = 0; end < s.length; end++) {\n    const ch = s[end];\n    if (need.has(ch)) {\n      if (need.get(ch) > 0) missing--;\n      need.set(ch, need.get(ch) - 1);\n    }\n    while (missing === 0) {\n      if (end - start + 1 < bestLen) {\n        bestLen = end - start + 1;\n        bestStart = start;\n      }\n      const left = s[start++];\n      if (need.has(left)) {\n        need.set(left, need.get(left) + 1);\n        if (need.get(left) > 0) missing++;\n      }\n    }\n  }\n  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return minWindow(\"ADOBECODEBANC\", \"ABC\") === \"BANC\";"
        },
        {
          "name": "целиком",
          "code": "return minWindow(\"a\", \"a\") === \"a\";"
        },
        {
          "name": "кратность",
          "code": "return minWindow(\"a\", \"aa\") === \"\";"
        },
        {
          "name": "повторы в t",
          "code": "return minWindow(\"aaflslflsldkalskaaa\", \"aaa\") === \"aaa\";"
        }
      ],
      "notes": "Счётчик `missing` позволяет проверять валидность окна за O(1), а не сравнивать две Map на каждом шаге."
    },
    {
      "title": "Subarray Sum Equals K",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "префиксные суммы",
        "хэш-таблица"
      ],
      "prompt": "Верните количество непрерывных подмассивов с суммой `k`. Числа могут быть отрицательными. O(n).\n\n`subarraySum([1, 1, 1], 2)` → `2`",
      "starter": "function subarraySum(nums, k) {\n  // ваш код\n}",
      "solution": "function subarraySum(nums, k) {\n  const countByPrefix = new Map([[0, 1]]);\n  let prefix = 0;\n  let count = 0;\n  for (const x of nums) {\n    prefix += x;\n    count += countByPrefix.get(prefix - k) ?? 0;\n    countByPrefix.set(prefix, (countByPrefix.get(prefix) ?? 0) + 1);\n  }\n  return count;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return subarraySum([1, 1, 1], 2) === 2;"
        },
        {
          "name": "отрицательные",
          "code": "return subarraySum([1, -1, 0], 0) === 3;"
        },
        {
          "name": "k = 3",
          "code": "return subarraySum([1, 2, 3], 3) === 2;"
        }
      ]
    },
    {
      "title": "Product of Array Except Self",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "префиксные суммы",
        "массивы"
      ],
      "prompt": "Верните массив, где `out[i]` — произведение всех элементов, кроме `nums[i]`. Деление использовать нельзя. O(n) времени, O(1) дополнительной памяти (выходной массив не считается).\n\n`[1, 2, 3, 4]` → `[24, 12, 8, 6]`",
      "starter": "function productExceptSelf(nums) {\n  // ваш код\n}",
      "solution": "function productExceptSelf(nums) {\n  const out = new Array(nums.length).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < nums.length; i++) {\n    out[i] = prefix;\n    prefix *= nums[i];\n  }\n  let suffix = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    out[i] *= suffix;\n    suffix *= nums[i];\n  }\n  return out;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(productExceptSelf([1, 2, 3, 4]), [24, 12, 8, 6]);"
        },
        {
          "name": "с нулём",
          "code": "const r = productExceptSelf([-1, 1, 0, -3, 3]); return r.map((x) => x + 0).join() === \"0,0,9,0,0\";"
        },
        {
          "name": "без деления",
          "code": "return !productExceptSelf.toString().includes(' / ');"
        }
      ],
      "notes": "Произведение префикса слева × произведение суффикса справа. `x + 0` в тесте превращает `-0` в `0`."
    }
  ]
});
