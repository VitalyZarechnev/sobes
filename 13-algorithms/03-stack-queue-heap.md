# Стек, очередь, куча

> ⏱ ~4 ч · 🎯 Использовать стек для вложенных структур и «ближайшего большего», очередь для BFS и планирования, кучу для top-k и слияния потоков.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Стек: скобки, вычисление выражений, undo/redo, обход без рекурсии
- [ ] Монотонный стек: следующий больший элемент, температуры, гистограмма
- [ ] Очередь и дек: BFS, окно максимума
- [ ] Реализовал двоичную кучу (MinHeap) с нуля
- [ ] Решил задачи из каталога

## Теория

### Стек (LIFO)

В JS — обычный массив с `push`/`pop` (O(1)). Сигналы: **вложенность** (скобки, теги HTML, JSON), **отмена последнего действия**, **обратный порядок**, замена рекурсии.

```js
// Сбалансированность скобок: O(n)
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
```

Фронтенд-примеры: история навигации и undo/redo (два стека), парсинг шаблонов, проверка вложенности тегов, стек вызовов в event loop.

### Монотонный стек

Стек, в котором элементы (или их индексы) хранятся строго по возрастанию или убыванию. Каждый элемент кладётся и снимается один раз → O(n). Решает «для каждого элемента найти **ближайший** больший/меньший слева или справа».

```js
// Через сколько дней будет теплее: O(n)
function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // индексы дней с убывающими температурами
  for (let i = 0; i < temps.length; i++) {
    // Текущий день теплее дней на вершине — для них ответ найден
    while (stack.length > 0 && temps[i] > temps[stack.at(-1)]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}
```

### Очередь (FIFO) и дек

BFS, планировщики задач, rate limiting, буферы событий. В JS нет встроенной очереди: `shift()` — O(n), поэтому используют индекс головы или кольцевой буфер (см. задачу «Очередь с O(1) на dequeue» в [каталоге](#/algo)).

**Монотонный дек** — максимум в скользящем окне за O(n): храним индексы с убывающими значениями, удаляем вышедшие за окно с головы и меньшие текущего — с хвоста.

### Двоичная куча (priority queue)

Полное двоичное дерево в массиве: родитель `i` → дети `2i + 1`, `2i + 2`; у min-кучи родитель ≤ детей. `push` и `pop` — O(log n) («всплытие» и «погружение»), `peek` — O(1), построение из массива — O(n).

```js
class MinHeap {
  #a = [];
  #less;
  constructor(less = (x, y) => x < y) {
    this.#less = less;
  }
  get size() { return this.#a.length; }
  peek() { return this.#a[0]; }
  push(x) {
    const a = this.#a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.#less(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop() {
    const a = this.#a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.#less(a[l], a[m])) m = l;
        if (r < a.length && this.#less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
```

Применения: top-k (min-куча размера k — O(n log k)), слияние k отсортированных списков, Дейкстра, медиана потока (две кучи), планировщик задач по приоритету и времени (так устроен планировщик React — min-куча по времени истечения задачи).

💡 **На собеседовании:** в JS нет встроенной кучи — будьте готовы написать её за 5 минут или спросите, можно ли считать, что она есть.

## Вопросы с собеседований

<details><summary>Как реализовать undo/redo?</summary>

Два стека: `undo` и `redo`. Новое действие кладётся в `undo`, `redo` очищается. Отмена: снять из `undo`, применить обратную операцию, положить в `redo`. Хранить команды (паттерн Команда) или снимки состояния (дорого по памяти; помогает структурное разделение, как в Immer).
</details>

<details><summary>Почему монотонный стек — O(n), если внутри while?</summary>

Каждый индекс один раз кладётся и не более одного раза снимается: суммарно 2n операций.
</details>

<details><summary>Как найти k самых больших элементов в потоке из миллиона чисел?</summary>

Min-куча размера k: если новый элемент больше вершины — заменить вершину. O(n log k) времени и O(k) памяти. Сортировка всего — O(n log n) и O(n) памяти. Quickselect — O(n) в среднем, но требует весь массив.
</details>

<details><summary>Как найти медиану потока чисел?</summary>

Две кучи: max-куча для меньшей половины и min-куча для большей; размеры отличаются не более чем на 1. Вставка — O(log n), медиана — O(1) по вершинам.
</details>

<details><summary>Где в React используется куча?</summary>

Пакет `scheduler` хранит задачи в min-куче по времени истечения и берёт самую срочную. Это пример priority queue во фронтенд-инфраструктуре.
</details>

## Практика

Задачи с автотестами — в [тесте темы](../quizzes/quiz.html?id=13-algorithms/03-stack-queue-heap) и в [каталоге](#/algo).

## Источники
- [NeetCode: Stack, Heap / Priority Queue](https://neetcode.io/roadmap)
- [React scheduler: SchedulerMinHeap.js](https://github.com/facebook/react/blob/main/packages/scheduler/src/SchedulerMinHeap.js)
- [Wikipedia: Binary heap](https://en.wikipedia.org/wiki/Binary_heap)
