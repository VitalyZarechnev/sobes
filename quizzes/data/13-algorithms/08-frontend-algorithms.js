QUIZ.register({
  "id": "13-algorithms/08-frontend-algorithms",
  "section": "13-algorithms",
  "title": "Алгоритмы во фронтенде",
  "order": 8,
  "source": "../13-algorithms/08-frontend-algorithms.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Пользователь печатает в поиске; запрос нужно отправить через 300 мс после последнего нажатия. Что использовать?",
      "options": [
        "throttle",
        "debounce",
        "requestAnimationFrame",
        "setInterval"
      ],
      "answer": 1,
      "explain": "Debounce срабатывает после паузы в серии событий."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Сложность построения дерева из n элементов `{ id, parentId }` с помощью Map?",
      "options": [
        "O(n²)",
        "O(n log n)",
        "O(n)",
        "O(log n)"
      ],
      "answer": 2,
      "explain": "Один проход для Map, один — для связывания."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как найти первую видимую строку виртуального списка с разными высотами строк за O(log n)?",
      "options": [
        "Перебором с начала",
        "Бинарный поиск по префиксным смещениям",
        "Хэш-таблица по scrollTop",
        "Невозможно"
      ],
      "answer": 1,
      "explain": "Смещения строк монотонно возрастают."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем в экспоненциальный backoff добавляют случайный джиттер?",
      "options": [
        "Чтобы запросы шли быстрее",
        "Чтобы много клиентов не повторяли запросы синхронно и не создавали пики нагрузки",
        "Чтобы обойти CORS",
        "Для безопасности токенов"
      ],
      "answer": 1,
      "explain": "Thundering herd: тысячи клиентов, упавших одновременно, иначе вернутся одновременно."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой алгоритм использует Vue 3 для минимизации перемещений DOM при диффе списка с ключами?",
      "options": [
        "Дейкстра",
        "Наибольшая возрастающая подпоследовательность (LIS)",
        "Топологическая сортировка",
        "Quick sort"
      ],
      "answer": 1,
      "explain": "Элементы, входящие в LIS старых индексов, остаются на месте; двигаются только остальные."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие граничные случаи важны для `deepEqual`?",
      "options": [
        "`NaN` равен `NaN`",
        "циклические ссылки",
        "`Date` и `RegExp`",
        "массив и объект с ключами \"0\", \"1\"",
        "порядок ключей объекта"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Порядок ключей для равенства объектов обычно не важен."
    }
  ],
  "tasks": [
    {
      "title": "listToTree",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "хэш-таблица"
      ],
      "prompt": "Преобразуйте плоский список `{ id, parentId, ... }` в дерево: каждый узел — копия элемента с полем `children: []`. Корни — элементы с `parentId === null` **или** с несуществующим родителем. Порядок детей и корней — как во входе. O(n). Вход не мутировать.",
      "starter": "function listToTree(items) {\n  // ваш код\n}",
      "solution": "function listToTree(items) {\n  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));\n  const roots = [];\n  for (const node of byId.values()) {\n    const parent = node.parentId == null ? undefined : byId.get(node.parentId);\n    (parent ? parent.children : roots).push(node);\n  }\n  return roots;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const r = listToTree([{ id: 1, parentId: null }, { id: 2, parentId: 1 }, { id: 3, parentId: 1 }, { id: 4, parentId: 2 }]); return r.length === 1 && r[0].children.map((c) => c.id).join() === \"2,3\" && r[0].children[0].children[0].id === 4;"
        },
        {
          "name": "ребёнок раньше родителя",
          "code": "const r = listToTree([{ id: 2, parentId: 1 }, { id: 1, parentId: null }]); return r.length === 1 && r[0].id === 1 && r[0].children[0].id === 2;"
        },
        {
          "name": "сирота — корень",
          "code": "const r = listToTree([{ id: 5, parentId: 99 }]); return r.length === 1 && r[0].id === 5;"
        },
        {
          "name": "не мутирует",
          "code": "const items = [{ id: 1, parentId: null }]; listToTree(items); return !(\"children\" in items[0]);"
        },
        {
          "name": "10⁵ элементов быстро",
          "code": "const items = Array.from({ length: 100000 }, (_, i) => ({ id: i, parentId: i === 0 ? null : Math.floor((i - 1) / 2) })); const s = performance.now(); const r = listToTree(items); return r.length === 1 && performance.now() - s < 2500;"
        }
      ]
    },
    {
      "title": "filterTree (поиск по меню)",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "DFS"
      ],
      "prompt": "Дано дерево `{ title, children? }[]`. Оставьте узлы, у которых `title` содержит `query` (без учёта регистра), и всех их предков. Дети совпавшего узла сохраняются, только если сами совпали или имеют совпавших потомков. Вход не мутировать.",
      "starter": "function filterTree(nodes, query) {\n  // ваш код\n}",
      "solution": "function filterTree(nodes, query) {\n  const q = query.toLowerCase();\n  const result = [];\n  for (const node of nodes) {\n    const children = filterTree(node.children ?? [], query);\n    if (node.title.toLowerCase().includes(q) || children.length > 0) {\n      result.push({ ...node, children });\n    }\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "предки сохраняются",
          "code": "const tree = [{ title: \"Настройки\", children: [{ title: \"Профиль\", children: [{ title: \"Аватар\" }] }, { title: \"Тема\" }] }]; const r = filterTree(tree, \"ава\"); return r.length === 1 && r[0].children.length === 1 && r[0].children[0].children[0].title === \"Аватар\";"
        },
        {
          "name": "нет совпадений",
          "code": "return filterTree([{ title: \"a\", children: [{ title: \"b\" }] }], \"z\").length === 0;"
        },
        {
          "name": "регистр",
          "code": "return filterTree([{ title: \"React\" }], \"react\").length === 1;"
        },
        {
          "name": "не мутирует",
          "code": "const tree = [{ title: \"a\", children: [{ title: \"b\" }, { title: \"c\" }] }]; filterTree(tree, \"b\"); return tree[0].children.length === 2;"
        }
      ]
    },
    {
      "title": "deepEqual",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "рекурсия",
        "хэш-таблица"
      ],
      "prompt": "Реализуйте глубокое сравнение: примитивы через `Object.is` (но `+0` равно `-0`), массивы и обычные объекты — по собственным перечисляемым ключам (порядок не важен), `Date` — по времени, `Map` и `Set` — по содержимому (ключи Map и элементы Set — по ссылке/SameValueZero), массив не равен объекту. Поддержите циклические ссылки.",
      "starter": "function deepEqual(a, b) {\n  // ваш код\n}",
      "solution": "function deepEqual(a, b, seen = new Map()) {\n  if (a === b || (Number.isNaN(a) && Number.isNaN(b))) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\n  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;\n  // Цикл: эту пару уже сравниваем выше по стеку — считаем равной\n  if (seen.get(a) === b) return true;\n  seen.set(a, b);\n  if (a instanceof Date) return a.getTime() === b.getTime();\n  if (a instanceof Map) {\n    if (a.size !== b.size) return false;\n    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;\n    return true;\n  }\n  if (a instanceof Set) {\n    if (a.size !== b.size) return false;\n    for (const v of a) if (!b.has(v)) return false;\n    return true;\n  }\n  const keysA = Object.keys(a);\n  const keysB = Object.keys(b);\n  if (keysA.length !== keysB.length) return false;\n  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k], seen));\n}",
      "tests": [
        {
          "name": "вложенные",
          "code": "return deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }) && !deepEqual({ a: [1, 2] }, { a: [1, 3] });"
        },
        {
          "name": "порядок ключей",
          "code": "return deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 });"
        },
        {
          "name": "NaN и нули",
          "code": "return deepEqual(NaN, NaN) && deepEqual(0, -0);"
        },
        {
          "name": "массив ≠ объект",
          "code": "return !deepEqual([1], { 0: 1 });"
        },
        {
          "name": "Date, Map, Set",
          "code": "return deepEqual(new Date(5), new Date(5)) && !deepEqual(new Date(5), new Date(6)) && deepEqual(new Map([[\"a\", { x: 1 }]]), new Map([[\"a\", { x: 1 }]])) && deepEqual(new Set([1, 2]), new Set([2, 1])) && !deepEqual(new Set([1]), new Set([2]));"
        },
        {
          "name": "лишний ключ undefined",
          "code": "return !deepEqual({ a: 1 }, { a: 1, b: undefined });"
        },
        {
          "name": "циклы",
          "code": "const a = { v: 1 }; a.self = a; const b = { v: 1 }; b.self = b; const c = { v: 2 }; c.self = c; return deepEqual(a, b) && !deepEqual(a, c);"
        }
      ]
    },
    {
      "title": "debounce с cancel и flush",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "таймеры",
        "замыкания"
      ],
      "prompt": "Реализуйте `debounce(fn, wait)`: вызывает `fn` через `wait` мс после последнего вызова с последними аргументами и `this`. У возвращаемой функции есть `cancel()` (отменить запланированный вызов) и `flush()` (выполнить запланированный вызов немедленно, если он есть).",
      "starter": "function debounce(fn, wait) {\n  // ваш код\n}",
      "solution": "function debounce(fn, wait) {\n  let timer = null;\n  let lastArgs = null;\n  let lastThis = null;\n  const invoke = () => {\n    timer = null;\n    const args = lastArgs;\n    const ctx = lastThis;\n    lastArgs = lastThis = null;\n    fn.apply(ctx, args);\n  };\n  function debounced(...args) {\n    lastArgs = args;\n    lastThis = this;\n    clearTimeout(timer);\n    timer = setTimeout(invoke, wait);\n  }\n  debounced.cancel = () => {\n    clearTimeout(timer);\n    timer = null;\n    lastArgs = lastThis = null;\n  };\n  debounced.flush = () => {\n    if (timer === null) return;\n    clearTimeout(timer);\n    invoke();\n  };\n  return debounced;\n}",
      "tests": [
        {
          "name": "один вызов с последними аргументами",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const calls = []; const d = debounce((x) => calls.push(x), 30); d(1); d(2); d(3); await sleep(60); return calls.join() === \"3\";"
        },
        {
          "name": "пауза сбрасывается",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let n = 0; const d = debounce(() => n++, 40); d(); await sleep(20); d(); await sleep(20); const mid = n; await sleep(40); return mid === 0 && n === 1;"
        },
        {
          "name": "cancel",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let n = 0; const d = debounce(() => n++, 20); d(); d.cancel(); await sleep(40); return n === 0;"
        },
        {
          "name": "flush",
          "code": "let got = null; const d = debounce((x) => { got = x; }, 1000); d(\"now\"); d.flush(); const ok = got === \"now\"; d.flush(); return ok;"
        },
        {
          "name": "this",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const obj = { v: 7, got: 0, run: null }; obj.run = debounce(function () { this.got = this.v; }, 10); obj.run(); await sleep(30); return obj.got === 7;"
        }
      ]
    },
    {
      "title": "throttle (leading + trailing)",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "таймеры",
        "замыкания"
      ],
      "prompt": "Реализуйте `throttle(fn, wait)`: первый вызов выполняется сразу, дальнейшие в течение `wait` мс не выполняются, но последний из них выполнится в конце интервала (trailing) с последними аргументами. Затем цикл повторяется.",
      "starter": "function throttle(fn, wait) {\n  // ваш код\n}",
      "solution": "function throttle(fn, wait) {\n  let timer = null;\n  let pendingArgs = null;\n  const startCooldown = () => {\n    timer = setTimeout(() => {\n      if (pendingArgs) {\n        const args = pendingArgs;\n        pendingArgs = null;\n        fn(...args);\n        startCooldown(); // trailing-вызов тоже открывает новый интервал\n      } else {\n        timer = null;\n      }\n    }, wait);\n  };\n  return (...args) => {\n    if (timer === null) {\n      fn(...args);\n      startCooldown();\n    } else {\n      pendingArgs = args;\n    }\n  };\n}",
      "tests": [
        {
          "name": "leading сразу",
          "code": "const calls = []; const f = throttle((x) => calls.push(x), 50); f(1); return calls.join() === \"1\";"
        },
        {
          "name": "trailing с последними аргументами",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const calls = []; const f = throttle((x) => calls.push(x), 40); f(1); f(2); f(3); await sleep(60); return calls.join() === \"1,3\";"
        },
        {
          "name": "без лишних вызовов",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let n = 0; const f = throttle(() => n++, 40); f(); await sleep(60); return n === 1;"
        },
        {
          "name": "частота ограничена",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let n = 0; const f = throttle(() => n++, 30); const end = Date.now() + 150; while (Date.now() < end) { f(); await sleep(5); } await sleep(50); return n >= 3 && n <= 9;"
        }
      ]
    },
    {
      "title": "mapWithConcurrency (пул промисов)",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "промисы",
        "конкурентность"
      ],
      "prompt": "Обработайте `items` асинхронной функцией `fn(item, index)` так, чтобы одновременно выполнялось не больше `limit` вызовов. Верните массив результатов в исходном порядке. При первой ошибке верните отклонённый промис с этой ошибкой.",
      "starter": "async function mapWithConcurrency(items, limit, fn) {\n  // ваш код\n}",
      "solution": "async function mapWithConcurrency(items, limit, fn) {\n  const results = new Array(items.length);\n  let next = 0;\n  const worker = async () => {\n    while (next < items.length) {\n      const i = next++;\n      results[i] = await fn(items[i], i);\n    }\n  };\n  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));\n  return results;\n}",
      "tests": [
        {
          "name": "порядок результатов",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const r = await mapWithConcurrency([30, 10, 20], 2, async (ms, i) => { await sleep(ms); return i; }); return r.join() === \"0,1,2\";"
        },
        {
          "name": "лимит соблюдается",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let active = 0, max = 0; await mapWithConcurrency(Array.from({ length: 10 }, (_, i) => i), 3, async () => { active++; max = Math.max(max, active); await sleep(10); active--; }); return max === 3;"
        },
        {
          "name": "ошибка",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); try { await mapWithConcurrency([1, 2, 3], 2, async (x) => { await sleep(5); if (x === 2) throw new Error(\"boom\"); return x; }); return false; } catch (e) { return e.message === \"boom\"; }"
        },
        {
          "name": "пустой вход",
          "code": "const r = await mapWithConcurrency([], 3, async (x) => x); return Array.isArray(r) && r.length === 0;"
        }
      ]
    },
    {
      "title": "retry с экспоненциальной задержкой",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "промисы",
        "таймеры"
      ],
      "prompt": "Реализуйте `retry(fn, { retries, baseDelay })`: вызывает асинхронную `fn(attempt)` (attempt с 0); при ошибке ждёт `baseDelay * 2 ** attempt` мс и повторяет, всего не более `retries` повторов (то есть `retries + 1` попыток). Если у ошибки есть поле `retryable === false` — не повторять. После исчерпания попыток — пробросить последнюю ошибку.",
      "starter": "async function retry(fn, { retries = 3, baseDelay = 100 } = {}) {\n  // ваш код\n}",
      "solution": "async function retry(fn, { retries = 3, baseDelay = 100 } = {}) {\n  for (let attempt = 0; ; attempt++) {\n    try {\n      return await fn(attempt);\n    } catch (error) {\n      if (attempt >= retries || error?.retryable === false) throw error;\n      await new Promise((resolve) => setTimeout(resolve, baseDelay * 2 ** attempt));\n    }\n  }\n}",
      "tests": [
        {
          "name": "успех со второй попытки",
          "code": "let n = 0; const r = await retry(async () => { n++; if (n < 2) throw new Error(\"fail\"); return \"ok\"; }, { retries: 3, baseDelay: 5 }); return r === \"ok\" && n === 2;"
        },
        {
          "name": "исчерпание попыток",
          "code": "let n = 0; try { await retry(async () => { n++; throw new Error(\"e\" + n); }, { retries: 2, baseDelay: 1 }); return false; } catch (e) { return n === 3 && e.message === \"e3\"; }"
        },
        {
          "name": "неповторяемая ошибка",
          "code": "let n = 0; try { await retry(async () => { n++; throw Object.assign(new Error(\"400\"), { retryable: false }); }, { retries: 5, baseDelay: 1 }); return false; } catch { return n === 1; }"
        },
        {
          "name": "задержки растут",
          "code": "const times = []; try { await retry(async () => { times.push(Date.now()); throw new Error(); }, { retries: 2, baseDelay: 20 }); } catch {} const d1 = times[1] - times[0], d2 = times[2] - times[1]; return d1 >= 15 && d2 >= 35;"
        }
      ],
      "notes": "В продакшене добавляют джиттер (`delay * (0.5 + Math.random())`), уважение `Retry-After` и `AbortSignal` для отмены."
    },
    {
      "title": "Видимый диапазон виртуального списка",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "бинарный поиск",
        "префиксные суммы",
        "виртуализация"
      ],
      "prompt": "Даны высоты строк `heights`, позиция прокрутки `scrollTop` и высота вьюпорта `viewport`. Верните `{ start, end }` — индексы первой и последней строки, хотя бы частично видимых (строка `i` занимает `[top_i, top_i + h_i)`). Предподсчёт смещений — O(n), сам поиск — O(log n). Пустой список — `{ start: 0, end: -1 }`.",
      "starter": "function getVisibleRange(heights, scrollTop, viewport) {\n  // ваш код\n}",
      "solution": "function getVisibleRange(heights, scrollTop, viewport) {\n  if (heights.length === 0) return { start: 0, end: -1 };\n  const offsets = [0];\n  for (const h of heights) offsets.push(offsets.at(-1) + h);\n  // последняя строка i, у которой top_i <= y\n  const rowAt = (y) => {\n    let lo = 0;\n    let hi = heights.length - 1;\n    while (lo < hi) {\n      const mid = (lo + hi + 1) >> 1;\n      if (offsets[mid] <= y) lo = mid;\n      else hi = mid - 1;\n    }\n    return lo;\n  };\n  const start = rowAt(scrollTop);\n  const end = rowAt(Math.max(scrollTop, scrollTop + viewport - 1));\n  return { start, end };\n}",
      "tests": [
        {
          "name": "одинаковые высоты",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(getVisibleRange(Array(100).fill(20), 100, 60), { start: 5, end: 7 });"
        },
        {
          "name": "частично видимые",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(getVisibleRange(Array(100).fill(20), 110, 60), { start: 5, end: 8 });"
        },
        {
          "name": "разные высоты",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(getVisibleRange([10, 50, 10, 10, 100], 55, 20), { start: 1, end: 3 });"
        },
        {
          "name": "у края",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(getVisibleRange([10, 10], 0, 1000), { start: 0, end: 1 });"
        },
        {
          "name": "пустой",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(getVisibleRange([], 0, 100), { start: 0, end: -1 });"
        }
      ],
      "notes": "В реальном виртуализаторе смещения хранятся между скроллами и пересчитываются при изменении высот; к диапазону добавляется overscan."
    },
    {
      "title": "fuzzyMatch для командной палитры",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "строки",
        "два указателя"
      ],
      "prompt": "Верните массив индексов символов `text`, совпавших с символами `query` по порядку (подпоследовательность, без учёта регистра), выбирая самые ранние совпадения. Если `query` не является подпоследовательностью — `null`. Пустой запрос — `[]`.\n\n`fuzzyMatch(\"Open Settings\", \"ose\")` → `[0, 5, 6]`",
      "starter": "function fuzzyMatch(text, query) {\n  // ваш код\n}",
      "solution": "function fuzzyMatch(text, query) {\n  const t = text.toLowerCase();\n  const q = query.toLowerCase();\n  const indices = [];\n  let qi = 0;\n  for (let ti = 0; ti < t.length && qi < q.length; ti++) {\n    if (t[ti] === q[qi]) {\n      indices.push(ti);\n      qi++;\n    }\n  }\n  return qi === q.length ? indices : null;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(fuzzyMatch(\"Open Settings\", \"ose\"), [0, 5, 6]);"
        },
        {
          "name": "нет совпадения",
          "code": "return fuzzyMatch(\"abc\", \"acb\") === null;"
        },
        {
          "name": "пустой запрос",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(fuzzyMatch(\"abc\", \"\"), []);"
        },
        {
          "name": "регистр",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(fuzzyMatch(\"GitHub\", \"gh\"), [0, 3]);"
        }
      ]
    },
    {
      "title": "Минимальные перемещения при диффе списка",
      "level": "senior",
      "difficulty": "hard",
      "tags": [
        "дифф",
        "хэш-таблица",
        "DP"
      ],
      "prompt": "Дан старый и новый порядок уникальных ключей (множества ключей совпадают). Верните **минимальное** число элементов, которые нужно переместить (каждое перемещение — взять элемент и вставить в другое место), чтобы получить новый порядок. O(n log n).\n\n`minMoves([\"a\",\"b\",\"c\",\"d\"], [\"d\",\"a\",\"b\",\"c\"])` → `1`",
      "starter": "function minMoves(oldKeys, newKeys) {\n  // ваш код\n}",
      "solution": "function minMoves(oldKeys, newKeys) {\n  const oldIndex = new Map(oldKeys.map((k, i) => [k, i]));\n  // Старые индексы в новом порядке: элементы из LIS остаются на местах\n  const seq = newKeys.map((k) => oldIndex.get(k));\n  const tails = [];\n  for (const x of seq) {\n    let lo = 0;\n    let hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    tails[lo] = x;\n  }\n  return newKeys.length - tails.length;\n}",
      "tests": [
        {
          "name": "один в начало",
          "code": "return minMoves([\"a\",\"b\",\"c\",\"d\"], [\"d\",\"a\",\"b\",\"c\"]) === 1;"
        },
        {
          "name": "без изменений",
          "code": "return minMoves([\"a\",\"b\"], [\"a\",\"b\"]) === 0;"
        },
        {
          "name": "разворот",
          "code": "return minMoves([\"a\",\"b\",\"c\",\"d\"], [\"d\",\"c\",\"b\",\"a\"]) === 3;"
        },
        {
          "name": "обмен соседей",
          "code": "return minMoves([\"a\",\"b\",\"c\"], [\"b\",\"a\",\"c\"]) === 1;"
        },
        {
          "name": "большой список",
          "code": "const a = Array.from({ length: 50000 }, (_, i) => \"k\" + i); const b = [a.at(-1), ...a.slice(0, -1)]; const s = performance.now(); return minMoves(a, b) === 1 && performance.now() - s < 2500;"
        }
      ],
      "notes": "Это идея из диффа Vue 3: длина LIS старых индексов — сколько элементов можно не трогать."
    },
    {
      "title": "Шаблонизатор {{ path }}",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "строки",
        "парсинг"
      ],
      "prompt": "Реализуйте `render(template, data)`: заменяет `{{ path }}` (пробелы внутри скобок допустимы, путь через точку: `user.name`) на значение из `data`. Отсутствующее значение (`undefined`/`null`) — пустая строка. Значения экранируются: `& < > \" '` → HTML-сущности.",
      "starter": "function render(template, data) {\n  // ваш код\n}",
      "solution": "function render(template, data) {\n  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' };\n  return template.replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (_, path) => {\n    const value = path.split('.').reduce((obj, key) => obj?.[key], data);\n    return value == null ? '' : String(value).replace(/[&<>\"']/g, (ch) => escapeMap[ch]);\n  });\n}",
      "tests": [
        {
          "name": "простая подстановка",
          "code": "return render(\"Привет, {{ name }}!\", { name: \"Аня\" }) === \"Привет, Аня!\";"
        },
        {
          "name": "путь",
          "code": "return render(\"{{user.city.name}}\", { user: { city: { name: \"Казань\" } } }) === \"Казань\";"
        },
        {
          "name": "нет значения",
          "code": "return render(\"[{{ a.b.c }}]\", {}) === \"[]\";"
        },
        {
          "name": "экранирование",
          "code": "return render(\"{{ x }}\", { x: \"<img onerror=alert(1)>\" }) === \"&lt;img onerror=alert(1)&gt;\";"
        },
        {
          "name": "ноль и false",
          "code": "return render(\"{{ a }}/{{ b }}\", { a: 0, b: false }) === \"0/false\";"
        }
      ],
      "notes": "Экранирование по умолчанию — защита от XSS; так ведут себя шаблоны Vue (`{{ }}`) и JSX."
    }
  ]
});
