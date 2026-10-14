QUIZ.register({
  "id": "13-algorithms/05-lists-and-trees",
  "section": "13-algorithms",
  "title": "Связные списки, деревья, trie",
  "order": 5,
  "source": "../13-algorithms/05-lists-and-trees.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой обход BST выдаёт значения по возрастанию?",
      "options": [
        "pre-order",
        "in-order",
        "post-order",
        "BFS"
      ],
      "answer": 1,
      "explain": "Лево → узел → право."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой обход нужен, чтобы посчитать размер каждого поддерева?",
      "options": [
        "pre-order",
        "in-order",
        "post-order",
        "любой"
      ],
      "answer": 2,
      "explain": "Ответ узла зависит от ответов детей — сначала дети."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как найти середину связного списка за один проход?",
      "options": [
        "Посчитать длину, потом пройти половину",
        "Быстрый указатель на 2 шага, медленный на 1",
        "Развернуть список",
        "Положить в массив"
      ],
      "answer": 1,
      "explain": "Когда быстрый дойдёт до конца, медленный будет в середине. Первый вариант — два прохода."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Сложность поиска в BST из n узлов в худшем случае?",
      "options": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)"
      ],
      "answer": 2,
      "explain": "Вырожденное дерево (вставка отсортированных данных) — это список."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем React Fiber хранит дерево как связные списки `child`/`sibling`/`return`?",
      "options": [
        "Экономия памяти",
        "Обход можно прервать и продолжить позже",
        "Так быстрее сравнивать строки",
        "Требование DOM API"
      ],
      "answer": 1,
      "explain": "Рекурсивный стек вызовов прервать нельзя, а обход по указателям — можно: основа concurrent rendering."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Где во фронтенде встречаются деревья?",
      "options": [
        "DOM",
        "AST в Babel/ESLint",
        "Дерево маршрутов",
        "JSON",
        "Очередь микрозадач"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Очередь микрозадач — FIFO."
    }
  ],
  "tasks": [
    {
      "title": "Reverse Linked List",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "связный список"
      ],
      "prompt": "Разверните односвязный список и верните новую голову. O(n) времени, O(1) памяти.\n\n`1 → 2 → 3` → `3 → 2 → 1`",
      "starter": "// Узел списка: { val, next }\nfunction reverseList(head) {\n  // ваш код\n}",
      "solution": "function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return toArray(reverseList(fromArray([1, 2, 3, 4, 5]))).join() === \"5,4,3,2,1\";"
        },
        {
          "name": "пустой",
          "code": "return reverseList(null) === null;"
        },
        {
          "name": "длинный (без рекурсии)",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; const h = fromArray(Array.from({ length: 100000 }, (_, i) => i)); return reverseList(h).val === 99999;"
        }
      ]
    },
    {
      "title": "Merge Two Sorted Lists",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "связный список",
        "два указателя"
      ],
      "prompt": "Слейте два отсортированных списка в один отсортированный, переиспользуя узлы.",
      "starter": "// Узел списка: { val, next }\nfunction mergeTwoLists(a, b) {\n  // ваш код\n}",
      "solution": "function mergeTwoLists(a, b) {\n  const dummy = { val: 0, next: null };\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a ?? b;\n  return dummy.next;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return toArray(mergeTwoLists(fromArray([1, 2, 4]), fromArray([1, 3, 4]))).join() === \"1,1,2,3,4,4\";"
        },
        {
          "name": "один пустой",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return toArray(mergeTwoLists(null, fromArray([0]))).join() === \"0\";"
        },
        {
          "name": "оба пустые",
          "code": "return mergeTwoLists(null, null) === null;"
        }
      ],
      "notes": "Фиктивная голова `dummy` избавляет от проверки «первый ли это узел»."
    },
    {
      "title": "Linked List Cycle",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "связный список",
        "два указателя"
      ],
      "prompt": "Верните `true`, если в списке есть цикл. O(1) памяти.",
      "starter": "// Узел списка: { val, next }\nfunction hasCycle(head) {\n  // ваш код\n}",
      "solution": "function hasCycle(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}",
      "tests": [
        {
          "name": "с циклом",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; const h = fromArray([3, 2, 0, -4]); h.next.next.next.next = h.next; return hasCycle(h) === true;"
        },
        {
          "name": "без цикла",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return hasCycle(fromArray([1, 2, 3])) === false;"
        },
        {
          "name": "пустой",
          "code": "return hasCycle(null) === false;"
        },
        {
          "name": "петля на себя",
          "code": "const h = { val: 1, next: null }; h.next = h; return hasCycle(h) === true;"
        }
      ]
    },
    {
      "title": "Remove Nth Node From End",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "связный список",
        "два указателя"
      ],
      "prompt": "Удалите n-й узел с конца списка за один проход и верните голову.\n\n`[1,2,3,4,5]`, n = 2 → `[1,2,3,5]`",
      "starter": "// Узел списка: { val, next }\nfunction removeNthFromEnd(head, n) {\n  // ваш код\n}",
      "solution": "function removeNthFromEnd(head, n) {\n  const dummy = { val: 0, next: head };\n  let fast = dummy;\n  let slow = dummy;\n  for (let i = 0; i <= n; i++) fast = fast.next; // отрыв n + 1\n  while (fast) {\n    fast = fast.next;\n    slow = slow.next;\n  }\n  slow.next = slow.next.next;\n  return dummy.next;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return toArray(removeNthFromEnd(fromArray([1,2,3,4,5]), 2)).join() === \"1,2,3,5\";"
        },
        {
          "name": "удалить голову",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return toArray(removeNthFromEnd(fromArray([1, 2]), 2)).join() === \"2\";"
        },
        {
          "name": "единственный",
          "code": "const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null); const toArray = (h) => { const o = []; for (let n = h; n; n = n.next) o.push(n.val); return o; }; return removeNthFromEnd(fromArray([1]), 1) === null;"
        }
      ]
    },
    {
      "title": "LRU Cache",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "связный список",
        "хэш-таблица",
        "проектирование"
      ],
      "prompt": "Реализуйте `LRUCache(capacity)` с `get(key)` (значение или `-1`) и `put(key, value)` за O(1). При переполнении удаляется давно неиспользованный ключ. `get` и `put` делают ключ «свежим».",
      "starter": "class LRUCache {\n  constructor(capacity) {\n    // ваш код\n  }\n  get(key) {}\n  put(key, value) {}\n}",
      "solution": "class LRUCache {\n  #capacity;\n  #map = new Map(); // Map хранит порядок вставки: первый ключ — самый старый\n\n  constructor(capacity) {\n    this.#capacity = capacity;\n  }\n\n  get(key) {\n    if (!this.#map.has(key)) return -1;\n    const value = this.#map.get(key);\n    this.#map.delete(key); // переставляем в конец — «свежий»\n    this.#map.set(key, value);\n    return value;\n  }\n\n  put(key, value) {\n    this.#map.delete(key);\n    this.#map.set(key, value);\n    if (this.#map.size > this.#capacity) {\n      this.#map.delete(this.#map.keys().next().value);\n    }\n  }\n}",
      "tests": [
        {
          "name": "пример LeetCode",
          "code": "const c = new LRUCache(2); c.put(1, 1); c.put(2, 2); const a = c.get(1); c.put(3, 3); const b = c.get(2); c.put(4, 4); return a === 1 && b === -1 && c.get(1) === -1 && c.get(3) === 3 && c.get(4) === 4;"
        },
        {
          "name": "обновление значения",
          "code": "const c = new LRUCache(2); c.put(1, 1); c.put(1, 10); c.put(2, 2); c.put(3, 3); return c.get(1) === -1 && c.get(2) === 2;"
        },
        {
          "name": "get освежает",
          "code": "const c = new LRUCache(2); c.put(\"a\", 1); c.put(\"b\", 2); c.get(\"a\"); c.put(\"c\", 3); return c.get(\"a\") === 1 && c.get(\"b\") === -1;"
        }
      ],
      "notes": "В JS `Map` хранит порядок вставки, поэтому LRU получается в 15 строк. Классическое решение на других языках — двусвязный список + хэш-таблица; его стоит уметь объяснить."
    },
    {
      "title": "Maximum Depth of Binary Tree",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "дерево",
        "DFS"
      ],
      "prompt": "Верните максимальную глубину бинарного дерева (число узлов на самом длинном пути от корня до листа).",
      "starter": "// Узел дерева: { val, left, right }\nfunction maxDepth(root) {\n  // ваш код\n}",
      "solution": "function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return maxDepth(tree([3, 9, 20, null, null, 15, 7])) === 3;"
        },
        {
          "name": "пустое",
          "code": "return maxDepth(null) === 0;"
        },
        {
          "name": "вытянутое",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return maxDepth(tree([1, null, 2])) === 2;"
        }
      ]
    },
    {
      "title": "Invert Binary Tree",
      "level": "middle",
      "difficulty": "easy",
      "tags": [
        "дерево",
        "DFS"
      ],
      "prompt": "Отразите дерево зеркально (поменяйте местами левые и правые поддеревья у всех узлов) и верните корень.",
      "starter": "// Узел дерева: { val, left, right }\nfunction invertTree(root) {\n  // ваш код\n}",
      "solution": "function invertTree(root) {\n  if (!root) return null;\n  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n  return root;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; const r = invertTree(tree([4, 2, 7, 1, 3, 6, 9])); return r.left.val === 7 && r.right.val === 2 && r.left.left.val === 9 && r.right.right.val === 1;"
        },
        {
          "name": "пустое",
          "code": "return invertTree(null) === null;"
        }
      ]
    },
    {
      "title": "Binary Tree Level Order Traversal",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "BFS"
      ],
      "prompt": "Верните значения узлов по уровням: массив массивов, слева направо.\n\n`[3,9,20,null,null,15,7]` → `[[3],[9,20],[15,7]]`",
      "starter": "// Узел дерева: { val, left, right }\nfunction levelOrder(root) {\n  // ваш код\n}",
      "solution": "function levelOrder(root) {\n  if (!root) return [];\n  const levels = [];\n  let level = [root];\n  while (level.length > 0) {\n    levels.push(level.map((n) => n.val));\n    level = level.flatMap((n) => [n.left, n.right].filter(Boolean));\n  }\n  return levels;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(levelOrder(tree([3, 9, 20, null, null, 15, 7])), [[3], [9, 20], [15, 7]]);"
        },
        {
          "name": "пустое",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(levelOrder(null), []);"
        }
      ]
    },
    {
      "title": "Validate Binary Search Tree",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "BST",
        "DFS"
      ],
      "prompt": "Проверьте, что дерево — корректное BST: для каждого узла все значения левого поддерева строго меньше, правого — строго больше.",
      "starter": "// Узел дерева: { val, left, right }\nfunction isValidBST(root) {\n  // ваш код\n}",
      "solution": "function isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);\n}",
      "tests": [
        {
          "name": "корректное",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return isValidBST(tree([2, 1, 3])) === true;"
        },
        {
          "name": "неверный ребёнок",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return isValidBST(tree([5, 1, 4, null, null, 3, 6])) === false;"
        },
        {
          "name": "ловушка: внук нарушает",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return isValidBST(tree([5, 4, 6, null, null, 3, 7])) === false;"
        },
        {
          "name": "дубликаты",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return isValidBST(tree([2, 2, 2])) === false;"
        }
      ],
      "notes": "Третий тест ловит решение, сравнивающее узел только с детьми: 3 меньше 6, но находится в правом поддереве 5."
    },
    {
      "title": "Lowest Common Ancestor of BST",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "BST"
      ],
      "prompt": "Найдите наименьшего общего предка узлов со значениями `p` и `q` в BST. Верните значение предка. O(h).",
      "starter": "// Узел дерева: { val, left, right }\nfunction lowestCommonAncestor(root, p, q) {\n  // ваш код\n}",
      "solution": "function lowestCommonAncestor(root, p, q) {\n  let node = root;\n  while (node) {\n    if (p < node.val && q < node.val) node = node.left;\n    else if (p > node.val && q > node.val) node = node.right;\n    else return node.val; // развилка: p и q по разные стороны (или один из них — node)\n  }\n  return null;\n}",
      "tests": [
        {
          "name": "разные поддеревья",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return lowestCommonAncestor(tree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]), 2, 8) === 6;"
        },
        {
          "name": "предок — один из узлов",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; return lowestCommonAncestor(tree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]), 2, 4) === 2;"
        }
      ]
    },
    {
      "title": "Serialize and Deserialize Binary Tree",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "дерево",
        "DFS",
        "строки"
      ],
      "prompt": "Реализуйте `serialize(root)` → строка и `deserialize(str)` → дерево так, чтобы `deserialize(serialize(t))` давал то же дерево. Формат — на ваше усмотрение. Должно работать для дерева глубиной 10⁴.",
      "starter": "// Узел дерева: { val, left, right }\nfunction serialize(root) {\n  // ваш код\n}\n\nfunction deserialize(data) {\n  // ваш код\n}",
      "solution": "function serialize(root) {\n  // pre-order на явном стеке, '#' — пустой узел\n  const out = [];\n  const stack = [root];\n  while (stack.length > 0) {\n    const node = stack.pop();\n    if (!node) {\n      out.push('#');\n      continue;\n    }\n    out.push(String(node.val));\n    stack.push(node.right, node.left);\n  }\n  return out.join(',');\n}\n\nfunction deserialize(data) {\n  const tokens = data.split(',');\n  let i = 0;\n  const make = () => {\n    const token = tokens[i++];\n    return token === '#' ? null : { val: Number(token), left: null, right: null };\n  };\n  const root = make();\n  // стек «родитель + какую сторону заполняем следующей»\n  const stack = root ? [[root, 'left']] : [];\n  while (stack.length > 0) {\n    const top = stack.at(-1);\n    const [node, side] = top;\n    const child = make();\n    node[side] = child;\n    if (side === 'left') top[1] = 'right';\n    else stack.pop();\n    if (child) stack.push([child, 'left']);\n  }\n  return root;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; const same = (a, b) => (!a && !b) || (a && b && a.val === b.val && same(a.left, b.left) && same(a.right, b.right)); const t1 = tree([1, 2, 3, null, null, 4, 5]); return same(deserialize(serialize(t1)), t1);"
        },
        {
          "name": "пустое",
          "code": "return deserialize(serialize(null)) === null;"
        },
        {
          "name": "отрицательные",
          "code": "const tree = (arr) => { if (!arr.length || arr[0] === null) return null; const root = { val: arr[0], left: null, right: null }; const q = [root]; let i = 1, h = 0; while (i < arr.length) { const n = q[h++]; for (const side of [\"left\", \"right\"]) { if (i < arr.length && arr[i] !== null) { n[side] = { val: arr[i], left: null, right: null }; q.push(n[side]); } i++; } } return root; }; const r = deserialize(serialize(tree([-1, -2]))); return r.val === -1 && r.left.val === -2;"
        },
        {
          "name": "глубина 10⁴",
          "code": "let root = { val: 0, left: null, right: null }; let cur = root; for (let i = 1; i < 10000; i++) { cur.left = { val: i, left: null, right: null }; cur = cur.left; } let r = deserialize(serialize(root)); let d = 0; while (r) { d++; r = r.left; } return d === 10000;"
        }
      ],
      "notes": "Рекурсивное решение короче, но падает на глубоких деревьях. В JSON-сериализации того же рода проблема: `JSON.stringify` для глубины ~10⁴ может бросить RangeError."
    },
    {
      "title": "Implement Trie",
      "level": "senior",
      "difficulty": "medium",
      "tags": [
        "trie",
        "строки",
        "проектирование"
      ],
      "prompt": "Реализуйте `Trie` с `insert(word)`, `search(word)` (есть ли слово целиком) и `startsWith(prefix)`. Добавьте `suggest(prefix, limit)` — до `limit` слов с этим префиксом в лексикографическом порядке.",
      "starter": "class Trie {\n  // ваш код\n}",
      "solution": "class Trie {\n  #root = { children: new Map(), end: false };\n\n  insert(word) {\n    let node = this.#root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });\n      node = node.children.get(ch);\n    }\n    node.end = true;\n  }\n\n  #find(prefix) {\n    let node = this.#root;\n    for (const ch of prefix) {\n      node = node.children.get(ch);\n      if (!node) return null;\n    }\n    return node;\n  }\n\n  search(word) {\n    return this.#find(word)?.end === true;\n  }\n\n  startsWith(prefix) {\n    return this.#find(prefix) !== null;\n  }\n\n  suggest(prefix, limit = 10) {\n    const start = this.#find(prefix);\n    const out = [];\n    const dfs = (node, path) => {\n      if (out.length >= limit) return;\n      if (node.end) out.push(path);\n      for (const ch of [...node.children.keys()].sort()) dfs(node.children.get(ch), path + ch);\n    };\n    if (start) dfs(start, prefix);\n    return out;\n  }\n}",
      "tests": [
        {
          "name": "search/startsWith",
          "code": "const t = new Trie(); t.insert(\"apple\"); return t.search(\"apple\") && !t.search(\"app\") && t.startsWith(\"app\");"
        },
        {
          "name": "после вставки префикса",
          "code": "const t = new Trie(); t.insert(\"apple\"); t.insert(\"app\"); return t.search(\"app\");"
        },
        {
          "name": "suggest",
          "code": "const t = new Trie(); [\"car\", \"cart\", \"carbon\", \"cat\", \"dog\"].forEach((w) => t.insert(w)); return t.suggest(\"car\", 2).join() === \"car,carbon\" && t.suggest(\"x\").length === 0;"
        },
        {
          "name": "кириллица",
          "code": "const t = new Trie(); t.insert(\"ёлка\"); return t.search(\"ёлка\") && t.startsWith(\"ё\");"
        }
      ]
    }
  ]
});
