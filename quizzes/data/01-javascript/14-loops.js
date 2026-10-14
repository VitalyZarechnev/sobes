QUIZ.register({
  "id": "01-javascript/14-loops",
  "section": "01-javascript",
  "title": "Циклы и перебор",
  "order": 14,
  "source": "../01-javascript/14-loops.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));",
      "options": [
        "`0 1 2`",
        "`3 3 3`",
        "`2 2 2`",
        "`undefined ×3`"
      ],
      "answer": 1,
      "explain": "У `var` одна переменная на весь цикл; таймеры срабатывают после цикла, когда `i = 3`. С `let` была бы новая привязка на каждую итерацию."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `for...of` отличается от `for...in`?",
      "options": [
        "Ничем",
        "`for...of` перебирает значения итерируемого, `for...in` — строковые ключи объекта, включая унаследованные",
        "`for...in` быстрее для массивов",
        "`for...of` работает только с массивами"
      ],
      "answer": 1,
      "explain": "`for...of` работает через `Symbol.iterator` (массивы, строки, Map, Set, генераторы). `for...in` — ключи объекта."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const arr = [1, 2];\narr.extra = 'x';\nconst keys = [];\nfor (const k in arr) keys.push(k);\nconsole.log(keys);",
      "options": [
        "`[0, 1]`",
        "`['0', '1']`",
        "`['0', '1', 'extra']`",
        "`[1, 2, 'x']`"
      ],
      "answer": 2,
      "explain": "`for...in` перебирает все перечисляемые строковые ключи, в том числе добавленные к массиву свойства."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как прервать `forEach` на середине?",
      "options": [
        "`break`",
        "`return false`",
        "Никак штатно — используйте `for...of`, `some`, `find`",
        "`continue`"
      ],
      "answer": 2,
      "explain": "`break` — синтаксическая ошибка, `return` пропускает только текущую итерацию."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что произойдёт: `ids.forEach(async id => await save(id)); console.log('done')`?",
      "options": [
        "Сохранения по очереди, затем `done`",
        "`done` выведется сразу, сохранения стартуют параллельно, ошибки не перехватываются",
        "SyntaxError",
        "`forEach` дождётся всех промисов"
      ],
      "answer": 1,
      "explain": "`forEach` не ждёт промисы. Последовательно — `for...of` с `await`, параллельно — `Promise.all(ids.map(save))`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "let c = 0;\ndo { c++; } while (false);\nconsole.log(c);",
      "options": [
        "`0`",
        "`1`",
        "`undefined`",
        "бесконечный цикл"
      ],
      "answer": 1,
      "explain": "`do...while` выполняет тело минимум один раз и проверяет условие после."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "for (const x of { a: 1 }) console.log(x);",
      "options": [
        "`'a'`",
        "`1`",
        "`TypeError: not iterable`",
        "ничего"
      ],
      "answer": 2,
      "explain": "Обычный объект не итерируемый. Используйте `Object.entries(obj)`."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите способы суммирования массива из 1 млн чисел от самого быстрого к самому медленному (Node 22)",
      "items": [
        "классический `for`",
        "`for...of`",
        "`forEach`",
        "`for...in`"
      ],
      "explain": "`for` ≈ 1 мс, `for...of` ≈ 6 мс, `forEach` ≈ 8 мс, `for...in` ≈ 67 мс. Но на реальных объёмах UI разница несущественна."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что ответить на вопрос «какой цикл быстрее и стоит ли переписывать `map` на `for`»?",
      "options": [
        "Всегда переписывать на `for`",
        "`for` быстрее в несколько раз, но разница видна только на сотнях тысяч итераций; выбираю по читаемости, оптимизирую участки, найденные профайлером, и прежде всего алгоритмическую сложность",
        "Методы массивов быстрее благодаря оптимизациям V8",
        "Разницы нет"
      ],
      "answer": 1,
      "explain": "Корректный ответ сочетает знание фактов и инженерный подход: измерять, а не гадать."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой способ последовательно (по одному) выполнит асинхронную обработку массива?",
      "options": [
        "`arr.forEach(async x => await f(x))`",
        "`await Promise.all(arr.map(f))`",
        "`for (const x of arr) await f(x)`",
        "`arr.map(async x => await f(x))`"
      ],
      "answer": 2,
      "explain": "`Promise.all` и `map` запускают всё параллельно, `forEach` не ждёт."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "outer: for (let a = 0; a < 3; a++) {\n  for (let b = 0; b < 3; b++) {\n    if (b === 1) continue outer;\n    if (a === 2) break outer;\n    console.log(`${a}${b}`);\n  }\n}",
      "options": [
        "`'00' '10'`",
        "`'00' '01' '10'`",
        "`'00' '10' '20'`",
        "`'00'`"
      ],
      "answer": 0,
      "explain": "`continue outer` переходит к следующей итерации внешнего цикла, `break outer` выходит из обоих."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Как безопасно удалять элементы из массива во время перебора?",
      "answer": "Лучше не мутировать: `arr = arr.filter(keep)`. Если нужно на месте — идти с конца (`for (let i = arr.length - 1; i >= 0; i--)` + `splice`), чтобы удаление не сдвигало ещё не просмотренные индексы. Для больших массивов многократный `splice` — O(n²); эффективнее два указателя (read/write) и обрезка `length` — O(n)."
    }
  ],
  "tasks": [
    {
      "title": "findFirstDuplicate с ранним выходом",
      "level": "middle",
      "prompt": "Верните первый элемент, встретившийся повторно (по порядку второго появления), прекращая перебор сразу. Нет дубликатов — `undefined`. O(n).\n\n`[3, 1, 4, 1, 3]` → `1`",
      "starter": "function findFirstDuplicate(arr) {\n  // ваш код\n}",
      "solution": "function findFirstDuplicate(arr) {\n  const seen = new Set();\n  for (const x of arr) {\n    if (seen.has(x)) return x;\n    seen.add(x);\n  }\n  return undefined;\n}",
      "tests": [
        {
          "name": "есть дубликат",
          "code": "return findFirstDuplicate([3, 1, 4, 1, 3]) === 1;"
        },
        {
          "name": "нет дубликатов",
          "code": "return findFirstDuplicate([1, 2, 3]) === undefined;"
        },
        {
          "name": "ранний выход",
          "code": "let reads = 0; const arr = new Proxy([1, 1, 2, 3, 4, 5], { get(t, k, r) { if (/^\\d+$/.test(String(k))) reads++; return Reflect.get(t, k, r); } }); findFirstDuplicate(arr); return reads <= 2;"
        }
      ]
    },
    {
      "title": "mapSequential",
      "level": "middle",
      "prompt": "Обработайте элементы асинхронной функцией строго по очереди и верните результаты в исходном порядке.",
      "starter": "async function mapSequential(items, asyncFn) {\n  // ваш код\n}",
      "solution": "async function mapSequential(items, asyncFn) {\n  const results = [];\n  for (const [index, item] of items.entries()) {\n    results.push(await asyncFn(item, index));\n  }\n  return results;\n}",
      "tests": [
        {
          "name": "последовательность",
          "code": "let active = 0, maxActive = 0; const fn = async (x) => { active++; maxActive = Math.max(maxActive, active); await new Promise((r) => setTimeout(r, 5)); active--; return x * 2; }; const r = await mapSequential([1, 2, 3], fn); return maxActive === 1 && r.join() === '2,4,6';"
        }
      ]
    },
    {
      "title": "removeInPlace за O(n)",
      "level": "senior",
      "prompt": "Удалите на месте все элементы, для которых `predicate` истинен, за O(n), и верните тот же массив.",
      "starter": "function removeInPlace(arr, predicate) {\n  // ваш код\n}",
      "solution": "function removeInPlace(arr, predicate) {\n  let write = 0;\n  for (let read = 0; read < arr.length; read++) {\n    if (!predicate(arr[read])) arr[write++] = arr[read];\n  }\n  arr.length = write;\n  return arr;\n}",
      "tests": [
        {
          "name": "тот же массив",
          "code": "const a = [1, 2, 3, 4, 5, 6]; const r = removeInPlace(a, (x) => x % 2 === 0); return r === a && a.join() === '1,3,5';"
        },
        {
          "name": "подряд идущие",
          "code": "return removeInPlace([2, 2, 2, 1], (x) => x === 2).join() === '1';"
        }
      ]
    },
    {
      "title": "walkTree без рекурсии",
      "level": "senior",
      "prompt": "Обойдите дерево `{ value, children }` в глубину (pre-order) без рекурсии, вызывая `visit(value)`.",
      "starter": "function walkTree(root, visit) {\n  // ваш код\n}",
      "solution": "function walkTree(root, visit) {\n  const stack = [root];\n  while (stack.length > 0) {\n    const node = stack.pop();\n    visit(node.value);\n    for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);\n  }\n}",
      "tests": [
        {
          "name": "порядок pre-order",
          "code": "const t = { value: 'a', children: [ { value: 'b', children: [ { value: 'c', children: [] } ] }, { value: 'd', children: [] } ] }; const out = []; walkTree(t, (v) => out.push(v)); return out.join('') === 'abcd';"
        },
        {
          "name": "глубокое дерево",
          "code": "let root = { value: 0, children: [] }; let cur = root; for (let i = 1; i < 50000; i++) { const n = { value: i, children: [] }; cur.children.push(n); cur = n; } let count = 0; walkTree(root, () => count++); return count === 50000;"
        }
      ]
    }
  ]
});
