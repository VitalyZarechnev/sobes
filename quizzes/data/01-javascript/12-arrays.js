QUIZ.register({
  "id": "01-javascript/12-arrays",
  "section": "01-javascript",
  "title": "Работа с массивами",
  "order": 12,
  "source": "../01-javascript/12-arrays.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log([10, 1, 2].sort());",
      "options": [
        "`[1, 2, 10]`",
        "`[1, 10, 2]`",
        "`[10, 2, 1]`",
        "`[2, 1, 10]`"
      ],
      "answer": 1,
      "explain": "Без компаратора элементы сравниваются как строки: `'10' < '2'`."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Какие методы **мутируют** исходный массив?",
      "options": [
        "`sort`",
        "`map`",
        "`splice`",
        "`slice`",
        "`reverse`",
        "`toSorted`",
        "`fill`"
      ],
      "answer": [
        0,
        2,
        4,
        6
      ],
      "explain": "`map`, `slice` и `toSorted` возвращают новый массив. `sort`, `splice`, `reverse`, `fill` работают на месте."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const a = [1, 2, 3];\nconst r = a.splice(1, 1, 'x', 'y');\nconsole.log(a.length, r);",
      "options": [
        "`3 [2]`",
        "`4 [2]`",
        "`4 ['x', 'y']`",
        "`3 [1, 2]`"
      ],
      "answer": 1,
      "explain": "Удалён один элемент (`2`), вставлено два — длина стала 4. `splice` возвращает массив удалённых."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как иммутабельно заменить элемент по индексу 2?",
      "options": [
        "`arr[2] = 'x'`",
        "`arr.with(2, 'x')`",
        "`arr.splice(2, 1, 'x')`",
        "`arr.fill('x', 2, 3)`"
      ],
      "answer": 1,
      "explain": "`with` (ES2023) возвращает копию с заменённым элементом. Остальные варианты мутируют массив."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log([NaN].includes(NaN), [NaN].indexOf(NaN));",
      "options": [
        "`true 0`",
        "`true -1`",
        "`false -1`",
        "`false 0`"
      ],
      "answer": 1,
      "explain": "`includes` использует SameValueZero, `indexOf` — строгое равенство, при котором `NaN !== NaN`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log(new Array(3).map((_, i) => i));",
      "options": [
        "`[0, 1, 2]`",
        "`[undefined, undefined, undefined]`",
        "`[ <3 empty items> ]`",
        "`TypeError`"
      ],
      "answer": 2,
      "explain": "`new Array(3)` создаёт три дыры, а `map` пропускает дыры. Нужно `Array.from({ length: 3 }, (_, i) => i)`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log([].every(() => false), [].some(() => true));",
      "options": [
        "`false false`",
        "`true false`",
        "`true true`",
        "`false true`"
      ],
      "answer": 1,
      "explain": "На пустом массиве `every` истинен (нет контрпримера), `some` ложен (нет примера)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `bigList.filter(x => ids.includes(x.id))` может тормозить и как исправить?",
      "options": [
        "`filter` медленный, нужен `for`",
        "Это O(n × m) из-за линейного `includes`; нужно `const set = new Set(ids)` и `set.has(x.id)`",
        "`includes` не работает с числами",
        "Нужно отсортировать массив"
      ],
      "answer": 1,
      "explain": "Поиск в `Set` — O(1), итого O(n + m)."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой компаратор корректно отсортирует числа по возрастанию?",
      "options": [
        "`(a, b) => a > b`",
        "`(a, b) => a - b`",
        "`(a, b) => b - a`",
        "`(a, b) => a < b ? 1 : 0`"
      ],
      "answer": 1,
      "explain": "Компаратор должен возвращать отрицательное, ноль или положительное число. Boolean-компараторы некорректны: `false` превращается в 0 («равны»)."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const arr = [3, 1, 2];\nconst s = arr.sort();\nconsole.log(s === arr);",
      "options": [
        "`true`",
        "`false`",
        "`undefined`",
        "`TypeError`"
      ],
      "answer": 0,
      "explain": "`sort` сортирует на месте и возвращает тот же массив."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `[1, [2, [3]]].flat()`?",
      "options": [
        "`[1, 2, 3]`",
        "`[1, 2, [3]]`",
        "`[[1], [2], [3]]`",
        "`[1, [2, [3]]]`"
      ],
      "answer": 1,
      "explain": "По умолчанию глубина 1. Для полного разворота — `flat(Infinity)`."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите операции по возрастанию сложности для массива из n элементов",
      "items": [
        "`arr.at(-1)` — O(1)",
        "`arr.push(x)` — O(1) амортизированно",
        "`arr.includes(x)` — O(n)",
        "`arr.sort((a, b) => a - b)` — O(n log n)",
        "`arr.forEach(x => arr.includes(x))` — O(n²)"
      ],
      "explain": "Доступ по индексу и работа с концом — константа, поиск — линейный, сортировка — n log n, вложенный поиск — квадрат."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что гарантирует стабильность `sort` (ES2019+)?",
      "options": [
        "Сортировка всегда O(n)",
        "Элементы с равными ключами сохраняют исходный относительный порядок",
        "Массив не мутируется",
        "Одинаковый результат в любом браузере для любого компаратора"
      ],
      "answer": 1,
      "explain": "Поэтому можно сортировать по нескольким полям последовательно или пересортировывать таблицу без «прыгания» строк."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Чем `reduce` хорош и когда его лучше не использовать?",
      "answer": "`reduce` сворачивает массив в одно значение: сумму, объект-индекс, Map. Плох, когда: (1) есть специализированный метод — `some`, `every`, `find`, `Object.fromEntries(arr.map(...))`, `Object.groupBy`; (2) аккумулятор копируется на каждом шаге (`{...acc, [k]: v}`) — получается O(n²); (3) логика сложная и цикл `for...of` читается проще. И всегда нужно передавать начальное значение — без него падение на пустом массиве и путаница с типами."
    }
  ],
  "tasks": [
    {
      "title": "chunk",
      "level": "middle",
      "prompt": "Разбейте массив на части по `size` элементов. При `size < 1` — `RangeError`.\n\n`chunk([1, 2, 3, 4, 5], 2)` → `[[1, 2], [3, 4], [5]]`",
      "starter": "function chunk(arr, size) {\n  // ваш код\n}",
      "solution": "function chunk(arr, size) {\n  if (size < 1) throw new RangeError('size должен быть >= 1');\n  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));\n}",
      "tests": [
        {
          "name": "обычный случай",
          "code": "return JSON.stringify(chunk([1, 2, 3, 4, 5], 2)) === '[[1,2],[3,4],[5]]';"
        },
        {
          "name": "пустой массив",
          "code": "return JSON.stringify(chunk([], 3)) === '[]';"
        },
        {
          "name": "size < 1",
          "code": "try { chunk([1], 0); return false; } catch (e) { return e instanceof RangeError; }"
        }
      ]
    },
    {
      "title": "uniqBy за O(n)",
      "level": "middle",
      "prompt": "Удалите дубликаты по ключу из `keyFn`, оставляя первое вхождение и порядок.",
      "starter": "function uniqBy(arr, keyFn) {\n  // ваш код\n}",
      "solution": "function uniqBy(arr, keyFn) {\n  const seen = new Set();\n  return arr.filter((item) => {\n    const key = keyFn(item);\n    if (seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n}",
      "tests": [
        {
          "name": "объекты по id",
          "code": "const r = uniqBy([{ id: 1, v: 'a' }, { id: 2 }, { id: 1, v: 'b' }], (x) => x.id); return r.length === 2 && r[0].v === 'a';"
        },
        {
          "name": "по функции",
          "code": "return JSON.stringify(uniqBy([1.1, 1.9, 2.5], Math.floor)) === '[1.1,2.5]';"
        },
        {
          "name": "большой массив быстро",
          "code": "const big = Array.from({ length: 200000 }, (_, i) => i % 1000); const t = Date.now(); const r = uniqBy(big, (x) => x); return r.length === 1000 && Date.now() - t < 500;"
        }
      ]
    },
    {
      "title": "partition",
      "level": "middle",
      "prompt": "Разделите массив за один проход на `[подходящие, неподходящие]`.",
      "starter": "function partition(arr, predicate) {\n  // ваш код\n}",
      "solution": "function partition(arr, predicate) {\n  const pass = [];\n  const fail = [];\n  for (const item of arr) (predicate(item) ? pass : fail).push(item);\n  return [pass, fail];\n}",
      "tests": [
        {
          "name": "чётные/нечётные",
          "code": "return JSON.stringify(partition([1, 2, 3, 4], (n) => n % 2 === 0)) === '[[2,4],[1,3]]';"
        }
      ]
    },
    {
      "title": "moveItem иммутабельно",
      "level": "middle",
      "prompt": "Переместите элемент с индекса `from` на `to` и верните новый массив, исходный не меняйте.",
      "starter": "function moveItem(arr, from, to) {\n  // ваш код\n}",
      "solution": "function moveItem(arr, from, to) {\n  const item = arr[from];\n  return arr.toSpliced(from, 1).toSpliced(to, 0, item);\n}",
      "tests": [
        {
          "name": "вперёд",
          "code": "return moveItem(['a', 'b', 'c', 'd'], 0, 2).join('') === 'bcad';"
        },
        {
          "name": "назад",
          "code": "return moveItem(['a', 'b', 'c'], 2, 0).join('') === 'cab';"
        },
        {
          "name": "иммутабельность",
          "code": "const a = ['a', 'b']; moveItem(a, 0, 1); return a.join('') === 'ab';"
        }
      ]
    },
    {
      "title": "sortBy по нескольким полям",
      "level": "senior",
      "prompt": "Иммутабельно отсортируйте массив объектов по нескольким полям. Префикс `-` — по убыванию. Строки — `localeCompare`, остальное — `(a > b) - (a < b)`.\n\n`sortBy(users, 'city', '-age')`",
      "starter": "function sortBy(arr, ...keys) {\n  // ваш код\n}",
      "solution": "function sortBy(arr, ...keys) {\n  const criteria = keys.map((k) => (k.startsWith('-') ? [k.slice(1), -1] : [k, 1]));\n  const cmp = (a, b) => (typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : (a > b) - (a < b));\n  return arr.toSorted((x, y) => {\n    for (const [field, dir] of criteria) {\n      const r = cmp(x[field], y[field]);\n      if (r !== 0) return r * dir;\n    }\n    return 0;\n  });\n}",
      "tests": [
        {
          "name": "два ключа",
          "code": "const u = [{ city: 'Москва', age: 20 }, { city: 'Казань', age: 30 }, { city: 'Москва', age: 40 }]; const r = sortBy(u, 'city', '-age'); return r.map((x) => x.city + x.age).join(',') === 'Казань30,Москва40,Москва20';"
        },
        {
          "name": "иммутабельность",
          "code": "const u = [{ a: 2 }, { a: 1 }]; sortBy(u, 'a'); return u[0].a === 2;"
        }
      ]
    },
    {
      "title": "intersection нескольких массивов",
      "level": "senior",
      "prompt": "Найдите элементы, присутствующие во всех массивах. Порядок как в первом, без дубликатов, сложность линейная.\n\n`intersection([1, 2, 3, 2], [2, 3, 4], [3, 2])` → `[2, 3]`",
      "starter": "function intersection(...arrays) {\n  // ваш код\n}",
      "solution": "function intersection(first = [], ...rest) {\n  const sets = rest.map((arr) => new Set(arr));\n  return [...new Set(first)].filter((x) => sets.every((s) => s.has(x)));\n}",
      "tests": [
        {
          "name": "три массива",
          "code": "return JSON.stringify(intersection([1, 2, 3, 2], [2, 3, 4], [3, 2])) === '[2,3]';"
        },
        {
          "name": "один массив",
          "code": "return JSON.stringify(intersection([1, 1, 2])) === '[1,2]';"
        }
      ]
    }
  ]
});
