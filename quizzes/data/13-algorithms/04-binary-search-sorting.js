QUIZ.register({
  "id": "13-algorithms/04-binary-search-sorting",
  "section": "13-algorithms",
  "title": "Бинарный поиск и сортировки",
  "order": 4,
  "source": "../13-algorithms/04-binary-search-sorting.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Сколько шагов нужно бинарному поиску в массиве из 1 000 000 элементов (худший случай)?",
      "options": [
        "~10",
        "~20",
        "~1000",
        "~500 000"
      ],
      "answer": 1,
      "explain": "log₂(10⁶) ≈ 20."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какие сортировки стабильны?",
      "options": [
        "quick sort и heap sort",
        "merge sort, вставками, TimSort",
        "только подсчётом",
        "никакие"
      ],
      "answer": 1,
      "explain": "Quick sort и heap sort в классическом виде нестабильны."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(['b', 'a', 'C'].sort());",
      "options": [
        "`['a', 'b', 'C']`",
        "`['C', 'a', 'b']`",
        "`['a', 'C', 'b']`",
        "`['b', 'a', 'C']`"
      ],
      "answer": 1,
      "explain": "Сравнение по UTF-16 кодам: заглавные (65–90) раньше строчных (97–122). Для людей — `localeCompare`/`Intl.Collator`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `(lo + hi) >> 1` опасен в бинпоиске по ответу с диапазоном до 10¹²?",
      "options": [
        "Медленно",
        "Битовые операции приводят к int32 и ломают большие числа",
        "Даёт дробное число",
        "Ничем не опасен"
      ],
      "answer": 1,
      "explain": "Используйте `Math.floor((lo + hi) / 2)` — безопасно до 2⁵³."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Нижняя граница сложности сортировки сравнением?",
      "options": [
        "Ω(n)",
        "Ω(n log n)",
        "Ω(n²)",
        "Ω(log n)"
      ],
      "answer": 1,
      "explain": "Дерево решений для n! перестановок имеет высоту log(n!) ≈ n log n."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Минимальная ёмкость корабля, чтобы перевезти грузы по порядку за d дней. Подход?",
      "options": [
        "Жадно сортировать",
        "Бинпоиск по ёмкости + жадная проверка O(n)",
        "DP O(n²·d)",
        "Куча"
      ],
      "answer": 1,
      "explain": "Если ёмкости C хватает, хватит и любой большей — предикат монотонен."
    }
  ],
  "tasks": [
    {
      "title": "Binary Search",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "бинарный поиск"
      ],
      "prompt": "Дан отсортированный по возрастанию массив различных чисел. Верните индекс `target` или `-1`. O(log n).",
      "starter": "function search(nums, target) {\n  // ваш код\n}",
      "solution": "function search(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
      "tests": [
        {
          "name": "найден",
          "code": "return search([-1,0,3,5,9,12], 9) === 4;"
        },
        {
          "name": "не найден",
          "code": "return search([-1,0,3,5,9,12], 2) === -1;"
        },
        {
          "name": "один элемент",
          "code": "return search([5], 5) === 0 && search([5], 1) === -1;"
        },
        {
          "name": "логарифм",
          "code": "let reads = 0; const a = new Proxy(Array.from({ length: 1 << 20 }, (_, i) => i), { get(t, k, r) { if (/^\\d+$/.test(String(k))) reads++; return Reflect.get(t, k, r); } }); search(a, 777777); return reads <= 50;"
        }
      ]
    },
    {
      "title": "Search Range (первое и последнее вхождение)",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бинарный поиск"
      ],
      "prompt": "Отсортированный массив с повторами. Верните `[first, last]` — индексы первого и последнего вхождения `target`, или `[-1, -1]`. O(log n).\n\n`searchRange([5,7,7,8,8,10], 8)` → `[3, 4]`",
      "starter": "function searchRange(nums, target) {\n  // ваш код\n}",
      "solution": "function searchRange(nums, target) {\n  const lowerBound = (x) => {\n    let lo = 0;\n    let hi = nums.length;\n    while (lo < hi) {\n      const mid = lo + ((hi - lo) >> 1);\n      if (nums[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  const first = lowerBound(target);\n  if (first === nums.length || nums[first] !== target) return [-1, -1];\n  return [first, lowerBound(target + 1) - 1];\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(searchRange([5,7,7,8,8,10], 8), [3, 4]);"
        },
        {
          "name": "нет",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(searchRange([5,7,7,8,8,10], 6), [-1, -1]);"
        },
        {
          "name": "пустой",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(searchRange([], 0), [-1, -1]);"
        },
        {
          "name": "все одинаковые",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(searchRange([2,2,2,2], 2), [0, 3]);"
        }
      ],
      "notes": "Для целых чисел upper bound = lowerBound(target + 1). Для дробных — отдельная функция с условием `<=`."
    },
    {
      "title": "Search in Rotated Sorted Array",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бинарный поиск",
        "массивы"
      ],
      "prompt": "Отсортированный массив различных чисел повёрнут в неизвестной точке (`[4,5,6,7,0,1,2]`). Найдите индекс `target` или `-1` за O(log n).",
      "starter": "function searchRotated(nums, target) {\n  // ваш код\n}",
      "solution": "function searchRotated(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) {\n      // левая половина отсортирована\n      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      // правая половина отсортирована\n      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return searchRotated([4,5,6,7,0,1,2], 0) === 4;"
        },
        {
          "name": "нет",
          "code": "return searchRotated([4,5,6,7,0,1,2], 3) === -1;"
        },
        {
          "name": "без поворота",
          "code": "return searchRotated([1,2,3,4,5], 4) === 3;"
        },
        {
          "name": "два элемента",
          "code": "return searchRotated([3, 1], 1) === 1;"
        }
      ]
    },
    {
      "title": "Koko Eating Bananas",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бинарный поиск",
        "бинпоиск по ответу"
      ],
      "prompt": "Есть кучки бананов `piles` и `h` часов. За час Коко съедает до `k` бананов из одной кучки (остаток часа простаивает). Найдите минимальное целое `k`, чтобы успеть. O(n log max).\n\n`minEatingSpeed([3,6,7,11], 8)` → `4`",
      "starter": "function minEatingSpeed(piles, h) {\n  // ваш код\n}",
      "solution": "function minEatingSpeed(piles, h) {\n  const hoursAt = (k) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);\n  let lo = 1;\n  let hi = Math.max(...piles);\n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (hoursAt(mid) <= h) hi = mid; // успеваем — пробуем медленнее\n    else lo = mid + 1;\n  }\n  return lo;\n}",
      "tests": [
        {
          "name": "пример 1",
          "code": "return minEatingSpeed([3,6,7,11], 8) === 4;"
        },
        {
          "name": "пример 2",
          "code": "return minEatingSpeed([30,11,23,4,20], 5) === 30;"
        },
        {
          "name": "пример 3",
          "code": "return minEatingSpeed([30,11,23,4,20], 6) === 23;"
        },
        {
          "name": "большие кучки",
          "code": "return minEatingSpeed([1000000000], 2) === 500000000;"
        }
      ]
    },
    {
      "title": "Capacity To Ship Packages Within D Days",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бинарный поиск",
        "бинпоиск по ответу",
        "жадный"
      ],
      "prompt": "Грузы `weights` нужно отправить **по порядку** за `days` дней; каждый день корабль везёт подряд идущие грузы суммарным весом не больше ёмкости. Найдите минимальную ёмкость.\n\n`shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5)` → `15`",
      "starter": "function shipWithinDays(weights, days) {\n  // ваш код\n}",
      "solution": "function shipWithinDays(weights, days) {\n  const daysNeeded = (cap) => {\n    let d = 1;\n    let load = 0;\n    for (const w of weights) {\n      if (load + w > cap) {\n        d++;\n        load = 0;\n      }\n      load += w;\n    }\n    return d;\n  };\n  let lo = Math.max(...weights); // меньше нельзя — не влезет самый тяжёлый\n  let hi = weights.reduce((a, b) => a + b, 0);\n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (daysNeeded(mid) <= days) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}",
      "tests": [
        {
          "name": "пример 1",
          "code": "return shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5) === 15;"
        },
        {
          "name": "пример 2",
          "code": "return shipWithinDays([3,2,2,4,1,4], 3) === 6;"
        },
        {
          "name": "один день",
          "code": "return shipWithinDays([1,2,3], 1) === 6;"
        }
      ]
    },
    {
      "title": "Merge Sort",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "сортировка",
        "разделяй и властвуй"
      ],
      "prompt": "Реализуйте стабильную сортировку слиянием `mergeSort(arr, compare)` за O(n log n). Исходный массив не мутировать. `compare` — как у `Array.prototype.sort`. Встроенный `sort` использовать нельзя.",
      "starter": "function mergeSort(arr, compare = (a, b) => a - b) {\n  // ваш код\n}",
      "solution": "function mergeSort(arr, compare = (a, b) => a - b) {\n  if (arr.length <= 1) return arr.slice();\n  const mid = arr.length >> 1;\n  const left = mergeSort(arr.slice(0, mid), compare);\n  const right = mergeSort(arr.slice(mid), compare);\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < left.length && j < right.length) {\n    out.push(compare(left[i], right[j]) <= 0 ? left[i++] : right[j++]);\n  }\n  while (i < left.length) out.push(left[i++]);\n  while (j < right.length) out.push(right[j++]);\n  return out;\n}",
      "tests": [
        {
          "name": "числа",
          "code": "return mergeSort([5, 2, 9, 1, 5, 6]).join() === \"1,2,5,5,6,9\";"
        },
        {
          "name": "не мутирует",
          "code": "const a = [3, 1, 2]; const r = mergeSort(a); return a.join() === \"3,1,2\" && r !== a;"
        },
        {
          "name": "стабильность",
          "code": "const a = [{ k: 1, id: \"a\" }, { k: 0, id: \"b\" }, { k: 1, id: \"c\" }, { k: 0, id: \"d\" }]; return mergeSort(a, (x, y) => x.k - y.k).map((x) => x.id).join(\"\") === \"bdac\";"
        },
        {
          "name": "без встроенного sort",
          "code": "return !/\\.(sort|toSorted)\\(/.test(mergeSort.toString());"
        },
        {
          "name": "10⁵ элементов",
          "code": "const a = Array.from({ length: 100000 }, (_, i) => (i * 7919) % 100003); const r = mergeSort(a); for (let i = 1; i < r.length; i++) if (r[i - 1] > r[i]) return false; return true;"
        }
      ]
    },
    {
      "title": "Merge Intervals",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "сортировка",
        "массивы",
        "интервалы"
      ],
      "prompt": "Объедините пересекающиеся интервалы `[start, end]` (касание `[1,4]` и `[4,5]` — тоже пересечение). Результат — по возрастанию начала.\n\n`[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`",
      "starter": "function merge(intervals) {\n  // ваш код\n}",
      "solution": "function merge(intervals) {\n  const sorted = intervals.toSorted((a, b) => a[0] - b[0]);\n  const result = [];\n  for (const [start, end] of sorted) {\n    const last = result.at(-1);\n    if (last && start <= last[1]) last[1] = Math.max(last[1], end);\n    else result.push([start, end]);\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(merge([[1,3],[2,6],[8,10],[15,18]]), [[1,6],[8,10],[15,18]]);"
        },
        {
          "name": "касание",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(merge([[1,4],[4,5]]), [[1,5]]);"
        },
        {
          "name": "вложенный",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(merge([[1,10],[2,3]]), [[1,10]]);"
        },
        {
          "name": "не отсортирован",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(merge([[5,6],[1,2]]), [[1,2],[5,6]]);"
        },
        {
          "name": "не мутирует вход",
          "code": "const a = [[1,3],[2,4]]; merge(a); return a[0][1] === 3;"
        }
      ],
      "notes": "Пример из фронтенда: объединение выделенных диапазонов текста, слотов календаря, загруженных диапазонов видео (`TimeRanges`)."
    },
    {
      "title": "Sort Colors (флаг Нидерландов)",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "сортировка",
        "сортировка подсчётом"
      ],
      "prompt": "Отсортируйте **на месте** массив из 0, 1 и 2 за один проход и O(1) памяти. Встроенный `sort` не использовать. Функция ничего не возвращает.\n\n`[2,0,2,1,1,0]` → `[0,0,1,1,2,2]`",
      "starter": "function sortColors(nums) {\n  // ваш код\n}",
      "solution": "function sortColors(nums) {\n  let low = 0; // граница нулей\n  let mid = 0;\n  let high = nums.length - 1; // граница двоек\n  while (mid <= high) {\n    if (nums[mid] === 0) {\n      [nums[low], nums[mid]] = [nums[mid], nums[low]];\n      low++;\n      mid++;\n    } else if (nums[mid] === 2) {\n      [nums[mid], nums[high]] = [nums[high], nums[mid]];\n      high--; // mid не двигаем: пришедший элемент ещё не проверен\n    } else {\n      mid++;\n    }\n  }\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const a = [2,0,2,1,1,0]; sortColors(a); return a.join() === \"0,0,1,1,2,2\";"
        },
        {
          "name": "на месте",
          "code": "const a = [2, 1, 0]; const r = sortColors(a); return r === undefined && a.join() === \"0,1,2\";"
        },
        {
          "name": "без sort",
          "code": "return !/\\.(sort|toSorted)\\(/.test(sortColors.toString());"
        }
      ]
    }
  ]
});
