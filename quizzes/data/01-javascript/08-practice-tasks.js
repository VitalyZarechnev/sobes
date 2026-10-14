QUIZ.register({
  "id": "01-javascript/08-practice-tasks",
  "section": "01-javascript",
  "title": "Практические задачи для live-coding",
  "order": 8,
  "source": "../01-javascript/08-practice-tasks.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "С чего начать решение задачи на live-coding?",
      "options": [
        "Сразу писать код",
        "Уточнить требования и граничные случаи, проговорить план",
        "Искать в интернете",
        "Писать тесты на фреймворк"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем отличается debounce от throttle?",
      "options": [
        "Ничем",
        "Debounce — после паузы в серии вызовов, throttle — не чаще раза в интервал",
        "Throttle — после паузы",
        "Debounce только для скролла"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что важно проговорить при реализации deepClone?",
      "options": [
        "Только примитивы",
        "Циклические ссылки, Date/Map/Set/RegExp, прототипы, функции, Symbol-ключи",
        "Только массивы",
        "Скорость печати"
      ],
      "answer": 1,
      "explain": "И что есть `structuredClone`."
    }
  ],
  "tasks": [
    {
      "title": "flatten с глубиной",
      "level": "middle",
      "prompt": "Реализуйте `flatten(arr, depth = 1)` без `Array.prototype.flat`: разворачивает вложенные массивы до указанной глубины; `Infinity` — полностью. Дыры пропускаются, вход не мутируется.",
      "starter": "function flatten(arr, depth = 1) {\n  // ваш код\n}",
      "solution": "function flatten(arr, depth = 1) {\n  const result = [];\n  const walk = (items, d) => {\n    items.forEach((item) => {\n      if (Array.isArray(item) && d > 0) walk(item, d - 1);\n      else result.push(item);\n    });\n  };\n  walk(arr, depth);\n  return result;\n}",
      "tests": [
        {
          "name": "глубина 1",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(flatten([1, [2, [3, [4]]]]), [1, 2, [3, [4]]]);"
        },
        {
          "name": "Infinity",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(flatten([1, [2, [3, [4]]]], Infinity), [1, 2, 3, 4]);"
        },
        {
          "name": "дыры",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(flatten([1, , [2, , 3]]), [1, 2, 3]);"
        },
        {
          "name": "без flat",
          "code": "return !/\\.flat\\(/.test(flatten.toString());"
        }
      ]
    },
    {
      "title": "EventEmitter",
      "level": "middle",
      "prompt": "Реализуйте класс `EventEmitter` с `on(event, fn)` (возвращает функцию отписки), `off(event, fn)`, `once(event, fn)` и `emit(event, ...args)` (возвращает `true`, если были слушатели). Отписка внутри обработчика не должна ломать текущую рассылку.",
      "starter": "class EventEmitter {\n  // ваш код\n}",
      "solution": "class EventEmitter {\n  #listeners = new Map();\n\n  on(event, fn) {\n    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());\n    this.#listeners.get(event).add(fn);\n    return () => this.off(event, fn);\n  }\n\n  off(event, fn) {\n    this.#listeners.get(event)?.delete(fn);\n  }\n\n  once(event, fn) {\n    const off = this.on(event, (...args) => {\n      off();\n      fn(...args);\n    });\n    return off;\n  }\n\n  emit(event, ...args) {\n    const set = this.#listeners.get(event);\n    if (!set || set.size === 0) return false;\n    [...set].forEach((fn) => fn(...args)); // копия: отписка во время рассылки безопасна\n    return true;\n  }\n}",
      "tests": [
        {
          "name": "on/emit",
          "code": "const e = new EventEmitter(); let got; e.on(\"x\", (a, b) => { got = a + b; }); return e.emit(\"x\", 1, 2) && got === 3;"
        },
        {
          "name": "отписка",
          "code": "const e = new EventEmitter(); let n = 0; const off = e.on(\"x\", () => n++); off(); return !e.emit(\"x\") && n === 0;"
        },
        {
          "name": "once",
          "code": "const e = new EventEmitter(); let n = 0; e.once(\"x\", () => n++); e.emit(\"x\"); e.emit(\"x\"); return n === 1;"
        },
        {
          "name": "отписка во время рассылки",
          "code": "const e = new EventEmitter(); const calls = []; const offA = e.on(\"x\", () => { calls.push(\"a\"); offB(); }); const offB = e.on(\"x\", () => calls.push(\"b\")); e.emit(\"x\"); e.emit(\"x\"); return calls.join() === \"a,b,a\";"
        }
      ]
    },
    {
      "title": "Глубокое клонирование с циклами",
      "level": "senior",
      "prompt": "Реализуйте `deepClone(value)` без `structuredClone`: примитивы как есть, массивы и обычные объекты — рекурсивно (с сохранением прототипа), `Date`, `Map`, `Set` — копии, циклические ссылки сохраняются (клон ссылается на клон).",
      "starter": "function deepClone(value) {\n  // ваш код\n}",
      "solution": "function deepClone(value, seen = new Map()) {\n  if (value === null || typeof value !== 'object') return value;\n  if (seen.has(value)) return seen.get(value);\n  if (value instanceof Date) return new Date(value.getTime());\n  if (value instanceof Map) {\n    const copy = new Map();\n    seen.set(value, copy);\n    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));\n    return copy;\n  }\n  if (value instanceof Set) {\n    const copy = new Set();\n    seen.set(value, copy);\n    value.forEach((v) => copy.add(deepClone(v, seen)));\n    return copy;\n  }\n  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));\n  seen.set(value, copy);\n  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);\n  return copy;\n}",
      "tests": [
        {
          "name": "вложенные",
          "code": "const a = { x: [1, { y: 2 }] }; const b = deepClone(a); return b !== a && b.x !== a.x && b.x[1].y === 2;"
        },
        {
          "name": "Date/Map/Set",
          "code": "const a = { d: new Date(5), m: new Map([[\"k\", { v: 1 }]]), s: new Set([1]) }; const b = deepClone(a); return b.d.getTime() === 5 && b.d !== a.d && b.m.get(\"k\").v === 1 && b.m.get(\"k\") !== a.m.get(\"k\") && b.s.has(1);"
        },
        {
          "name": "циклы",
          "code": "const a = { name: \"a\" }; a.self = a; const b = deepClone(a); return b.self === b && b !== a;"
        },
        {
          "name": "прототип",
          "code": "class P { hi() { return 1; } } const b = deepClone(new P()); return b instanceof P && b.hi() === 1;"
        },
        {
          "name": "без structuredClone",
          "code": "return !deepClone.toString().includes('structuredClone');"
        }
      ]
    }
  ]
});
