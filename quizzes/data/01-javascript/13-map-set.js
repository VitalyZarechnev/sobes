QUIZ.register({
  "id": "01-javascript/13-map-set",
  "section": "01-javascript",
  "title": "Map, Set, WeakMap, WeakSet",
  "order": 13,
  "source": "../01-javascript/13-map-set.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const m = new Map();\nm.set(1, 'a').set('1', 'b');\nconsole.log(m.size, m.get(1));",
      "options": [
        "`1 'b'`",
        "`2 'a'`",
        "`2 'b'`",
        "`1 'a'`"
      ],
      "answer": 1,
      "explain": "В `Map` нет приведения типов: `1` и `'1'` — разные ключи."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(new Set([{}, {}]).size, new Set([NaN, NaN]).size);",
      "options": [
        "`1 1`",
        "`2 1`",
        "`2 2`",
        "`1 2`"
      ],
      "answer": 1,
      "explain": "Объекты сравниваются по ссылке, `NaN` для `Set` равен себе (SameValueZero)."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Самый короткий способ удалить дубликаты из массива примитивов с сохранением порядка?",
      "options": [
        "`arr.filter((x, i) => arr.indexOf(x) === i)`",
        "`[...new Set(arr)]`",
        "`arr.sort().filter(...)`",
        "`Object.keys(arr)`"
      ],
      "answer": 1,
      "explain": "`Set` сохраняет порядок первого появления и работает за O(n). Вариант с `indexOf` — O(n²)."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(JSON.stringify(new Map([[1, 2]])));",
      "options": [
        "`'[[1,2]]'`",
        "`'{}'`",
        "`'{\"1\":2}'`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "У `Map` нет собственных перечисляемых свойств. Сериализуйте `[...map]` или `Object.fromEntries(map)`."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Чем `Map` лучше обычного объекта в роли динамического словаря?",
      "options": [
        "ключи любого типа",
        "гарантированный порядок добавления",
        "`size` за O(1)",
        "нативная сериализация в JSON",
        "нет унаследованных ключей и риска prototype pollution",
        "поддержка деструктуризации"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "JSON и деструктуризация — как раз преимущества объекта."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "const m = new Map([['a', 1]]);\nm.set('b', 2).set('a', 3);\nconsole.log([...m.keys()].join(''));",
      "options": [
        "`'ba'`",
        "`'ab'`",
        "`'aba'`",
        "`'b'`"
      ],
      "answer": 1,
      "explain": "Обновление существующего ключа не меняет его позицию. Чтобы переместить в конец (LRU), нужны `delete` + `set`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему у `WeakMap` нет `size` и перебора?",
      "options": [
        "Это недоработка спецификации",
        "Записи исчезают при сборке мусора в недетерминированный момент — результат перебора был бы непредсказуем",
        "Ради производительности",
        "Перебор есть, но только в Node.js"
      ],
      "answer": 1,
      "explain": "Доступ только по известному ключу-объекту — так содержимое не зависит от момента работы GC."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `new Set(['js', 'css']).intersection(new Set(['js', 'go']))`?",
      "options": [
        "`Set {'js'}`",
        "`Set {'js', 'css', 'go'}`",
        "`Set {'css'}`",
        "`true`"
      ],
      "answer": 0,
      "explain": "Пересечение — элементы, которые есть в обоих множествах. Методы множеств добавлены в ES2025."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему мемоизацию по объекту-аргументу лучше делать на `WeakMap`?",
      "options": [
        "Он быстрее `Map`",
        "Он не удерживает ключи: когда объект станет недостижим, запись исчезнет, кэш не будет течь",
        "Он поддерживает примитивы",
        "Он автоматически ограничивает размер"
      ],
      "answer": 1,
      "explain": "С обычным `Map` кэш держал бы все когда-либо переданные объекты в памяти."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const prices = new Map([['яблоко', 50]]);\nprices.forEach((a, b) => console.log(a, b));",
      "options": [
        "`'яблоко' 50`",
        "`50 'яблоко'`",
        "`['яблоко', 50] 0`",
        "`undefined undefined`"
      ],
      "answer": 1,
      "explain": "Колбэк `forEach` у `Map` получает (значение, ключ, map) — как у массива (элемент, индекс, массив)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как корректно добавить элемент в `Set`, хранящийся в состоянии React?",
      "options": [
        "`selected.add(id); setSelected(selected)`",
        "`setSelected(prev => new Set(prev).add(id))`",
        "`setSelected(selected.add(id))`",
        "`selected.add(id); forceUpdate()`"
      ],
      "answer": 1,
      "explain": "Мутация не меняет ссылку, React сравнивает через `Object.is` и не увидит изменения. Нужна новая коллекция."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Приведите 3 задачи из фронтенда, где `Map` или `Set` дают выигрыш по сравнению с массивом или объектом.",
      "answer": "1) Фильтрация большого списка по набору ID — `Set` даёт O(1) на проверку вместо O(n) у `includes`. 2) Индекс сущностей по ID (нормализованный стор, быстрые обновления) — `Map` с любыми типами ключей и стабильным порядком. 3) LRU-кэш ответов API или мемоизация — `Map` с порядком вставки или `WeakMap` для ключей-объектов без утечек. Также: выбранные строки таблицы (`Set`), посещённые узлы при обходе дерева (`Set`), частотные словари (`Map`)."
    }
  ],
  "tasks": [
    {
      "title": "countBy в Map",
      "level": "middle",
      "prompt": "Посчитайте частоту ключей `keyFn(item)` и верните `Map` в порядке первого появления.",
      "starter": "function countBy(arr, keyFn) {\n  // ваш код\n}",
      "solution": "function countBy(arr, keyFn) {\n  const counts = new Map();\n  for (const item of arr) {\n    const key = keyFn(item);\n    counts.set(key, (counts.get(key) ?? 0) + 1);\n  }\n  return counts;\n}",
      "tests": [
        {
          "name": "строки",
          "code": "return JSON.stringify([...countBy(['a', 'b', 'a'], (x) => x)]) === '[[\"a\",2],[\"b\",1]]';"
        },
        {
          "name": "числовые ключи",
          "code": "const m = countBy([1.2, 1.7, 2.1], Math.floor); return m.get(1) === 2 && m.get(2) === 1 && m instanceof Map;"
        }
      ]
    },
    {
      "title": "LRUCache на Map",
      "level": "senior",
      "prompt": "Реализуйте класс `LRUCache(capacity)` с методами `get(key)`, `set(key, value)` и геттером `size`. `get` и `set` делают ключ самым свежим, при переполнении удаляется самый старый. Все операции O(1).",
      "starter": "class LRUCache {\n  constructor(capacity) {\n    // ваш код\n  }\n}",
      "solution": "class LRUCache {\n  #map = new Map();\n  constructor(capacity) { this.capacity = capacity; }\n  get size() { return this.#map.size; }\n  get(key) {\n    if (!this.#map.has(key)) return undefined;\n    const value = this.#map.get(key);\n    this.#map.delete(key);\n    this.#map.set(key, value);\n    return value;\n  }\n  set(key, value) {\n    this.#map.delete(key);\n    this.#map.set(key, value);\n    if (this.#map.size > this.capacity) this.#map.delete(this.#map.keys().next().value);\n  }\n}",
      "tests": [
        {
          "name": "вытеснение старого",
          "code": "const c = new LRUCache(2); c.set('a', 1); c.set('b', 2); c.set('c', 3); return c.get('a') === undefined && c.get('b') === 2 && c.size === 2;"
        },
        {
          "name": "get освежает ключ",
          "code": "const c = new LRUCache(2); c.set('a', 1); c.set('b', 2); c.get('a'); c.set('c', 3); return c.get('a') === 1 && c.get('b') === undefined;"
        },
        {
          "name": "обновление значения",
          "code": "const c = new LRUCache(1); c.set('a', 1); c.set('a', 2); return c.get('a') === 2 && c.size === 1;"
        }
      ]
    },
    {
      "title": "toggleInSet иммутабельно",
      "level": "middle",
      "prompt": "Верните новый `Set`: добавьте `value`, если его не было, или удалите, если был. Исходный не меняйте.",
      "starter": "function toggleInSet(set, value) {\n  // ваш код\n}",
      "solution": "function toggleInSet(set, value) {\n  const next = new Set(set);\n  if (next.has(value)) next.delete(value);\n  else next.add(value);\n  return next;\n}",
      "tests": [
        {
          "name": "добавление и удаление",
          "code": "const s = new Set([1]); const a = toggleInSet(s, 2); const b = toggleInSet(a, 1); return a.has(2) && !b.has(1) && b.has(2);"
        },
        {
          "name": "иммутабельность",
          "code": "const s = new Set([1]); const n = toggleInSet(s, 1); return s.has(1) && n !== s;"
        }
      ]
    },
    {
      "title": "memoizeByObject на WeakMap",
      "level": "senior",
      "prompt": "Мемоизируйте функцию одного аргумента-объекта: для того же объекта `fn` вызывается один раз. Кэш не должен удерживать объекты.",
      "starter": "function memoizeByObject(fn) {\n  // ваш код\n}",
      "solution": "function memoizeByObject(fn) {\n  const cache = new WeakMap();\n  return (obj) => {\n    if (!cache.has(obj)) cache.set(obj, fn(obj));\n    return cache.get(obj);\n  };\n}",
      "tests": [
        {
          "name": "один вызов на объект",
          "code": "let calls = 0; const f = memoizeByObject((o) => { calls++; return o.x * 2; }); const a = { x: 2 }; f(a); f(a); f({ x: 2 }); return calls === 2 && f(a) === 4;"
        }
      ]
    },
    {
      "title": "diffSets",
      "level": "middle",
      "prompt": "Верните `{ added, removed }` — массивы элементов, добавленных в `next` и удалённых из `prev`.",
      "starter": "function diffSets(prev, next) {\n  // ваш код\n}",
      "solution": "function diffSets(prev, next) {\n  return {\n    added: [...next].filter((id) => !prev.has(id)),\n    removed: [...prev].filter((id) => !next.has(id)),\n  };\n}",
      "tests": [
        {
          "name": "diff",
          "code": "const r = diffSets(new Set([1, 2, 3]), new Set([2, 3, 4])); return JSON.stringify(r) === '{\"added\":[4],\"removed\":[1]}';"
        }
      ]
    }
  ]
});
