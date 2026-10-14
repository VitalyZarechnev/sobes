# Связные списки, деревья, trie

> ⏱ ~5 ч · 🎯 Уверенно работать с указателями в списках, обходить деревья рекурсивно и итеративно, понимать BST и trie — и видеть эти структуры в DOM, JSON и роутинге.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Списки: разворот, слияние, быстрый/медленный указатель, фиктивная голова
- [ ] Деревья: DFS (pre/in/post-order) рекурсивно и на стеке, BFS по уровням
- [ ] BST: поиск, вставка, проверка корректности, in-order даёт сортировку
- [ ] Trie: вставка, поиск по префиксу, автодополнение
- [ ] Решил задачи из каталога

## Теория

### Связный список

```js
// Узел: { val, next }. Хелпер для тестов и экспериментов
const fromArray = (arr) => arr.reduceRight((next, val) => ({ val, next }), null);
const toArray = (head) => {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
};
```

Где встречается во фронтенде: Fiber-дерево React (child/sibling/return — по сути связные списки), список хуков компонента (`memoizedState.next`), очередь обновлений, LRU-кэш (двусвязный список + Map), `NodeIterator`, история изменений.

Приёмы:
- **Фиктивная голова** (`dummy = { next: head }`) убирает особый случай удаления/вставки в начало.
- **Быстрый и медленный указатели**: середина списка (быстрый идёт через один), цикл (встретятся — алгоритм Флойда), k-й с конца (быстрый уходит вперёд на k).
- **Разворот** — три указателя `prev`, `curr`, `next`.

```js
// Разворот списка: O(n) времени, O(1) памяти
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

### Деревья: обходы

```js
// Узел бинарного дерева: { val, left, right }
// DFS рекурсивно: pre-order (узел → лево → право), in-order (лево → узел → право), post-order (лево → право → узел)
function maxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

// BFS по уровням: очередь + размер уровня
function levelOrder(root) {
  if (!root) return [];
  const levels = [];
  let level = [root];
  while (level.length > 0) {
    levels.push(level.map((n) => n.val));
    level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return levels;
}
```

Когда что: **post-order** — когда ответ узла зависит от детей (высота, размер, удаление, сериализация вычислений); **pre-order** — копирование, сериализация, передача контекста сверху вниз; **in-order** — BST по порядку; **BFS** — по уровням, кратчайший путь, «ближайший к корню».

🪤 **Ловушка:** рекурсия на дереве глубиной 10⁵ (вытянутом в список, или глубоко вложенный JSON) переполнит стек. Обход на явном стеке — см. задачу `walkTree` в [циклах](../01-javascript/14-loops.md).

### Деревья во фронтенде

DOM (`children`, `parentNode`, `TreeWalker`), виртуальный DOM и reconciliation, AST в Babel/ESLint/PostCSS (visitor = обход дерева), вложенные меню и комментарии, файловые деревья, JSON, дерево маршрутов. Типичные задачи: найти узел по условию, путь до узла, глубокое сравнение, плоский список с `parentId` → дерево, фильтрация дерева с сохранением предков найденных — см. [08-frontend-algorithms](08-frontend-algorithms.md).

### Бинарное дерево поиска (BST)

Для каждого узла: все значения слева меньше, справа больше. Поиск/вставка — O(h): O(log n) в сбалансированном дереве и O(n) в вырожденном. Сбалансированные варианты — AVL, красно-чёрное (так устроены `TreeMap` в Java и `std::map` в C++; в JS аналога нет). In-order обход BST выдаёт отсортированную последовательность.

🪤 **Ловушка проверки BST:** сравнивать узел только с детьми недостаточно — нужно передавать допустимый диапазон `(min, max)` вниз по дереву.

### Trie (префиксное дерево)

Каждый узел — символ, путь от корня — префикс. Вставка и поиск — O(длина слова) независимо от числа слов. Применения: автодополнение, подсветка совпадений, роутеры (radix tree в `find-my-way`, `rou3`), словари для проверки орфографии.

```js
class Trie {
  #root = { children: new Map(), end: false };
  insert(word) {
    let node = this.#root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true;
  }
  #find(prefix) {
    let node = this.#root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word) { return this.#find(word)?.end === true; }
  startsWith(prefix) { return this.#find(prefix) !== null; }
}
```

## Вопросы с собеседований

<details><summary>Чем связный список отличается от массива? Когда он лучше?</summary>

Массив — непрерывная память: доступ по индексу O(1), вставка в середину O(n), отличная локальность кэша. Список — узлы со ссылками: доступ O(n), вставка/удаление по известному узлу O(1). В JS списки нужны редко — для LRU, очередей, когда важно O(1) удаление из середины.
</details>

<details><summary>Как найти цикл в связном списке за O(1) памяти?</summary>

Алгоритм Флойда: медленный указатель — на 1 шаг, быстрый — на 2. Если есть цикл, они встретятся. Начало цикла: переставить один указатель в голову и двигать оба по одному шагу — встретятся в начале цикла.
</details>

<details><summary>Чем DFS отличается от BFS на дереве и что использует меньше памяти?</summary>

DFS — стек (рекурсия), память O(высота). BFS — очередь, память O(ширина). Для широких и неглубоких деревьев (DOM) DFS экономнее, для глубоких и узких — BFS. BFS находит ближайший к корню узел первым.
</details>

<details><summary>Как сделать автодополнение по списку из 100 000 слов?</summary>

Trie: спуск по префиксу O(|prefix|), затем DFS из узла с ограничением на k результатов; в узлах можно хранить частоту/топ-k для ранжирования. Альтернатива — отсортированный массив + бинпоиск lower bound по префиксу: проще и компактнее по памяти. На фронтенде ещё нужны debounce, отмена запросов, виртуализация списка и доступность (`role="combobox"`).
</details>

<details><summary>Почему в React Fiber используется связный список, а не рекурсия по дереву?</summary>

Обход по указателям `child`/`sibling`/`return` можно прервать в любой момент и продолжить позже (time slicing, concurrent rendering), а рекурсивный стек вызовов прервать нельзя.
</details>

## Практика

Задачи с автотестами — в [тесте темы](../quizzes/quiz.html?id=13-algorithms/05-lists-and-trees) и в [каталоге](#/algo). Тесты сами строят списки (`{ val, next }`) и деревья (`{ val, left, right }`) из массивов в формате LeetCode: `[3, 9, 20, null, null, 15, 7]` — по уровням, `null` — пустой узел.

## Источники
- [NeetCode: Linked List, Trees, Tries](https://neetcode.io/roadmap)
- [React Fiber Architecture (acdlite)](https://github.com/acdlite/react-fiber-architecture)
- [MDN: TreeWalker](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
