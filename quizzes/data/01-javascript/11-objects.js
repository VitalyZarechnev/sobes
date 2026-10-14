QUIZ.register({
  "id": "01-javascript/11-objects",
  "section": "01-javascript",
  "title": "Работа с объектами",
  "order": 11,
  "source": "../01-javascript/11-objects.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const o = { b: 1, 2: 'two', a: 2, 1: 'one' };\nconsole.log(Object.keys(o).join(','));",
      "options": [
        "`'b,2,a,1'`",
        "`'1,2,b,a'`",
        "`'a,b,1,2'`",
        "`'2,1,b,a'`"
      ],
      "answer": 1,
      "explain": "Целочисленные ключи идут первыми по возрастанию, затем строковые в порядке добавления."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const a = { n: { deep: 1 } };\nconst b = { ...a };\nb.n.deep = 2;\nconsole.log(a.n.deep);",
      "options": [
        "`1`",
        "`2`",
        "`undefined`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "Spread — поверхностная копия: вложенный объект `n` общий для `a` и `b`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как проверить наличие **собственного** свойства, в том числе у объекта без прототипа?",
      "options": [
        "`obj.key !== undefined`",
        "`'key' in obj`",
        "`Object.hasOwn(obj, 'key')`",
        "`obj.hasOwnProperty('key')`"
      ],
      "answer": 2,
      "explain": "`in` видит унаследованные свойства, сравнение с `undefined` не различает «нет свойства» и «свойство = undefined», а у `Object.create(null)` нет метода `hasOwnProperty`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const k1 = {}, k2 = {};\nconst dict = {};\ndict[k1] = 1;\ndict[k2] = 2;\nconsole.log(dict[k1]);",
      "options": [
        "`1`",
        "`2`",
        "`undefined`",
        "`TypeError`"
      ],
      "answer": 1,
      "explain": "Объекты-ключи приводятся к строке `'[object Object]'`, второе присваивание перезаписало первое. Для ключей-объектов нужен `Map`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const { p = 1 } = { p: null };\nconst { q = 1 } = { q: undefined };\nconsole.log(p, q);",
      "options": [
        "`1 1`",
        "`null 1`",
        "`null undefined`",
        "`1 undefined`"
      ],
      "answer": 1,
      "explain": "Значение по умолчанию при деструктуризации срабатывает только для `undefined`."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Что теряется или искажается при `JSON.parse(JSON.stringify(obj))`?",
      "options": [
        "свойства со значением `undefined`",
        "функции",
        "`Date` становится строкой",
        "`Map` становится `{}`",
        "числа",
        "вложенные plain-объекты"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "JSON поддерживает только строки, числа, boolean, null, массивы и plain-объекты. Числа и вложенные объекты сохраняются (кроме `NaN`/`Infinity`)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чего **не** умеет `structuredClone`?",
      "options": [
        "Копировать `Map` и `Set`",
        "Обрабатывать циклические ссылки",
        "Копировать функции и сохранять прототип экземпляра класса",
        "Копировать `Date`"
      ],
      "answer": 2,
      "explain": "Функции и DOM-узлы → `DataCloneError`, экземпляр класса превращается в plain-объект. `Map`, `Set`, `Date` и циклы поддерживаются."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "console.log({ ...null, ...undefined, ...'ab', ...[9] });",
      "options": [
        "`TypeError`",
        "`{ 0: 9, 1: 'b' }`",
        "`{ 0: 'a', 1: 'b', 2: 9 }`",
        "`{}`"
      ],
      "answer": 1,
      "explain": "`null`/`undefined` при spread игнорируются, строка раскладывается по индексам, массив `[9]` перезаписывает ключ `0`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `Object.freeze`?",
      "options": [
        "Глубоко замораживает объект",
        "Запрещает добавление, удаление и изменение свойств только на верхнем уровне",
        "Запрещает только добавление свойств",
        "То же, что `const`"
      ],
      "answer": 1,
      "explain": "Freeze поверхностный. `seal` разрешает изменение значений, `preventExtensions` — ещё и удаление."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему иммутабельные обновления важны для React?",
      "options": [
        "Так требует синтаксис JSX",
        "React и memo-селекторы обнаруживают изменения сравнением ссылок (`Object.is`), без глубокого обхода",
        "Мутации запрещены в JS",
        "Иммутабельные объекты быстрее читаются"
      ],
      "answer": 1,
      "explain": "Если мутировать объект, ссылка не меняется, и React посчитает, что state не изменился. Новые объекты на изменённом пути + переиспользование остальных веток дают дешёвое сравнение."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const defaults = { layout: { sidebar: true, width: 240 } };\nconst prefs = { layout: { width: 300 } };\nconsole.log({ ...defaults, ...prefs }.layout.sidebar);",
      "options": [
        "`true`",
        "`undefined`",
        "`300`",
        "`false`"
      ],
      "answer": 1,
      "explain": "Spread поверхностный: `layout` из `prefs` заменил вложенный объект целиком, и `sidebar` пропал. Нужен deep merge."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое prototype pollution?",
      "options": [
        "Утечка памяти через прототипы",
        "Запись свойства в `Object.prototype` через небезопасный merge/set по пути (`__proto__`), после чего оно появляется у всех объектов",
        "Слишком длинная цепочка прототипов",
        "Переопределение метода в классе-наследнике"
      ],
      "answer": 1,
      "explain": "Защита: пропускать ключи `__proto__`, `constructor`, `prototype`, использовать `Object.create(null)`/`Map` для пользовательских словарей, валидировать данные схемой."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `Object.groupBy([1, 2, 3], n => n % 2 ? 'odd' : 'even')`?",
      "options": [
        "`Map` с ключами 'odd' и 'even'",
        "`{ odd: [1, 3], even: [2] }` — объект без прототипа",
        "`[[1, 3], [2]]`",
        "`{ odd: 2, even: 1 }`"
      ],
      "answer": 1,
      "explain": "Результат — объект с прототипом `null`. Для ключей-не-строк есть `Map.groupBy`."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Когда для словаря выбрать `Map`, а когда обычный объект?",
      "answer": "Объект — для структур с известными полями, конфигов и данных, которые уходят в JSON. `Map` — для динамических словарей и кэшей: любые ключи (включая объекты), гарантированный порядок добавления, `size` за O(1), оптимизация частых добавлений и удалений, нет унаследованных ключей и риска prototype pollution. Объект с числовыми ключами ещё и переупорядочит их по возрастанию."
    }
  ],
  "tasks": [
    {
      "title": "get(obj, path, defaultValue)",
      "level": "middle",
      "prompt": "Безопасно прочитайте значение по пути `'a.b[0].c'`. Если на любом шаге `null`/`undefined` — вернуть `defaultValue`. Значения `0`, `''`, `false` — валидные.",
      "starter": "function get(obj, path, defaultValue) {\n  // ваш код\n}",
      "solution": "function get(obj, path, defaultValue) {\n  const keys = path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean);\n  let current = obj;\n  for (const key of keys) {\n    if (current == null) return defaultValue;\n    current = current[key];\n  }\n  return current === undefined ? defaultValue : current;\n}",
      "tests": [
        {
          "name": "путь с индексом",
          "code": "return get({ a: { b: [{ c: 1 }] } }, 'a.b[0].c') === 1;"
        },
        {
          "name": "обрыв пути",
          "code": "return get({ a: null }, 'a.b.c', 'нет') === 'нет';"
        },
        {
          "name": "falsy-значения не подменяются",
          "code": "return get({ a: { b: 0 } }, 'a.b', 5) === 0 && get({ s: '' }, 's', 'x') === '';"
        }
      ]
    },
    {
      "title": "setIn — иммутабельная запись по пути",
      "level": "senior",
      "prompt": "Верните новый объект с `value` по пути `path` (массив ключей). Исходный объект не меняется, неизменённые ветки переиспользуются по ссылке, недостающие уровни создаются.",
      "starter": "function setIn(obj, path, value) {\n  // ваш код\n}",
      "solution": "function setIn(obj, [key, ...rest], value) {\n  const source = obj ?? {};\n  return { ...source, [key]: rest.length === 0 ? value : setIn(source[key], rest, value) };\n}",
      "tests": [
        {
          "name": "обновление и переиспользование",
          "code": "const s = { a: { b: 1 }, c: {} }; const n = setIn(s, ['a', 'b'], 2); return n.a.b === 2 && s.a.b === 1 && n.c === s.c && n !== s;"
        },
        {
          "name": "создание уровней",
          "code": "return JSON.stringify(setIn({}, ['x', 'y'], 1)) === '{\"x\":{\"y\":1}}';"
        }
      ]
    },
    {
      "title": "deepMerge с защитой от prototype pollution",
      "level": "senior",
      "prompt": "Глубоко слейте два объекта в новый: plain-объекты сливаются рекурсивно, всё остальное (массивы, примитивы, Date) заменяется значением из `source`. Ключи `__proto__`, `constructor`, `prototype` пропускайте.",
      "starter": "function deepMerge(target, source) {\n  // ваш код\n}",
      "solution": "const isPlainObject = (v) => v !== null && typeof v === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(v));\nconst FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);\nfunction deepMerge(target, source) {\n  const result = { ...target };\n  for (const [key, value] of Object.entries(source)) {\n    if (FORBIDDEN.has(key)) continue;\n    result[key] = isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : value;\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "рекурсивное слияние",
          "code": "const r = deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 3 } }); return r.a.x === 1 && r.a.y === 3;"
        },
        {
          "name": "массивы заменяются",
          "code": "return JSON.stringify(deepMerge({ list: [1, 2] }, { list: [3] }).list) === '[3]';"
        },
        {
          "name": "исходники не меняются",
          "code": "const t = { a: { x: 1 } }; deepMerge(t, { a: { x: 2 } }); return t.a.x === 1;"
        },
        {
          "name": "prototype pollution",
          "code": "deepMerge({}, JSON.parse('{\"__proto__\": {\"polluted\": true}}')); return ({}).polluted === undefined;"
        }
      ]
    },
    {
      "title": "shallowEqual как в React.memo",
      "level": "middle",
      "prompt": "Сравните два объекта поверхностно: одинаковый набор собственных ключей, значения через `Object.is`.",
      "starter": "function shallowEqual(a, b) {\n  // ваш код\n}",
      "solution": "function shallowEqual(a, b) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\n  const keysA = Object.keys(a);\n  if (keysA.length !== Object.keys(b).length) return false;\n  return keysA.every((k) => Object.hasOwn(b, k) && Object.is(a[k], b[k]));\n}",
      "tests": [
        {
          "name": "равные",
          "code": "return shallowEqual({ a: 1, b: 'x' }, { b: 'x', a: 1 }) && shallowEqual({ a: NaN }, { a: NaN });"
        },
        {
          "name": "вложенные не равны по ссылке",
          "code": "return shallowEqual({ a: {} }, { a: {} }) === false;"
        },
        {
          "name": "разные ключи",
          "code": "return shallowEqual({ a: 1 }, { a: 1, b: undefined }) === false && shallowEqual({ a: undefined }, { b: undefined }) === false;"
        }
      ]
    },
    {
      "title": "deepFreeze с циклами",
      "level": "senior",
      "prompt": "Заморозьте объект рекурсивно (включая символьные ключи). Циклические ссылки не должны приводить к бесконечной рекурсии.",
      "starter": "function deepFreeze(obj) {\n  // ваш код\n}",
      "solution": "function deepFreeze(obj, seen = new WeakSet()) {\n  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;\n  seen.add(obj);\n  for (const key of Reflect.ownKeys(obj)) deepFreeze(obj[key], seen);\n  return Object.freeze(obj);\n}",
      "tests": [
        {
          "name": "вложенные заморожены",
          "code": "const o = deepFreeze({ a: { b: [1, { c: 2 }] } }); return Object.isFrozen(o.a) && Object.isFrozen(o.a.b) && Object.isFrozen(o.a.b[1]);"
        },
        {
          "name": "цикл",
          "code": "const o = { x: 1 }; o.self = o; deepFreeze(o); return Object.isFrozen(o);"
        }
      ]
    },
    {
      "title": "pick и omit",
      "level": "middle",
      "prompt": "`pick(obj, keys)` — новый объект только с указанными (и существующими) ключами. `omit(obj, keys)` — без указанных ключей.",
      "starter": "function pick(obj, keys) {\n  // ваш код\n}\n\nfunction omit(obj, keys) {\n  // ваш код\n}",
      "solution": "function pick(obj, keys) {\n  return Object.fromEntries(keys.filter((k) => Object.hasOwn(obj, k)).map((k) => [k, obj[k]]));\n}\nfunction omit(obj, keys) {\n  const excluded = new Set(keys);\n  return Object.fromEntries(Object.entries(obj).filter(([k]) => !excluded.has(k)));\n}",
      "tests": [
        {
          "name": "pick",
          "code": "return JSON.stringify(pick({ a: 1, b: 2, c: 3 }, ['a', 'c', 'z'])) === '{\"a\":1,\"c\":3}';"
        },
        {
          "name": "omit",
          "code": "return JSON.stringify(omit({ a: 1, b: 2, c: 3 }, ['b'])) === '{\"a\":1,\"c\":3}';"
        }
      ]
    }
  ]
});
