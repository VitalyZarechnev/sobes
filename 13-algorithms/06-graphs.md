# Графы: BFS, DFS, топологическая сортировка, union-find

> ⏱ ~4 ч · 🎯 Представлять данные как граф, выбирать обход, находить циклы и порядок зависимостей — от сетки на экране до графа модулей сборщика.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Строю список смежности из рёбер, обхожу сетку как граф
- [ ] BFS для кратчайшего пути без весов, DFS для компонент связности
- [ ] Топологическая сортировка (Кан) и поиск цикла в зависимостях
- [ ] Union-find с сжатием путей
- [ ] Понимаю идею Дейкстры
- [ ] Решил задачи из каталога

## Теория

### Представление

```js
// Рёбра → список смежности (Map: вершина → соседи). O(V + E) памяти
function buildGraph(edges, directed = false) {
  const graph = new Map();
  const add = (u, v) => {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push(v);
  };
  for (const [u, v] of edges) {
    add(u, v);
    if (!directed) add(v, u);
    else if (!graph.has(v)) graph.set(v, []);
  }
  return graph;
}
```

**Сетка** (матрица) — неявный граф: соседи клетки `(r, c)` — 4 (или 8) направления. Матрица смежности `V × V` — только для плотных графов.

Графы во фронтенде: граф модулей бандлера (импорты, циклические зависимости, tree shaking, порядок выполнения), граф зависимостей пакетов (`pnpm`), граф вычислений сигналов и `computed` (Vue, Preact Signals, Solid — топологический порядок обновлений), граф задач монорепо (Turborepo/Nx), связи сущностей в нормализованном сторе, навигация между экранами, диаграммы (React Flow).

### BFS и DFS

```js
// BFS: кратчайший путь (по числу рёбер) от start. O(V + E)
function shortestDistances(graph, start) {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    for (const v of graph.get(u) ?? []) {
      if (dist.has(v)) continue; // помечаем при добавлении, а не при извлечении
      dist.set(v, dist.get(u) + 1);
      queue.push(v);
    }
  }
  return dist;
}
```

DFS — стек или рекурсия: компоненты связности, поиск пути, обнаружение цикла, «залить область» (flood fill — заливка в графическом редакторе).

🪤 **Ловушка:** помечать вершину посещённой при **добавлении** в очередь, а не при извлечении — иначе одна вершина попадёт в очередь много раз.

### Топологическая сортировка

Порядок вершин ориентированного ациклического графа (DAG), где каждая зависимость идёт раньше зависимого. Алгоритм Кана: считаем входящие степени, кладём в очередь вершины со степенью 0, «удаляем» их рёбра. Если обработали не все вершины — есть цикл.

```js
function topoSort(nodes, deps) {
  // deps: [a, b] — a зависит от b, значит b должен идти раньше
  const indegree = new Map(nodes.map((n) => [n, 0]));
  const dependents = new Map(nodes.map((n) => [n, []]));
  for (const [a, b] of deps) {
    dependents.get(b).push(a);
    indegree.set(a, indegree.get(a) + 1);
  }
  const queue = nodes.filter((n) => indegree.get(n) === 0);
  for (let head = 0; head < queue.length; head++) {
    for (const next of dependents.get(queue[head])) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  return queue.length === nodes.length ? queue : null; // null — цикл
}
```

Применения: порядок сборки пакетов монорепо, порядок выполнения задач, порядок инициализации плагинов, обнаружение циклических импортов (madge, dependency-cruiser), планирование курса изучения тем.

### Union-find (система непересекающихся множеств)

Быстро отвечает «в одной ли группе a и b» и объединяет группы. Со сжатием путей и объединением по рангу — почти O(1) на операцию.

```js
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // сжатие путей (halving)
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}
```

### Взвешенные графы: Дейкстра

Кратчайшие пути при неотрицательных весах: min-куча по расстоянию, O((V + E) log V). Для отрицательных весов — Беллман–Форд. Для сетки с эвристикой — A* (поиск пути в играх и на картах).

## Вопросы с собеседований

<details><summary>Когда BFS, а когда DFS?</summary>

BFS — кратчайший путь в невзвешенном графе, обход по уровням, «минимальное число шагов». DFS — проверка достижимости, компоненты, циклы, топологическая сортировка, перебор путей; проще в коде (рекурсия), меньше памяти на широких графах.
</details>

<details><summary>Как обнаружить циклическую зависимость между модулями?</summary>

Топологическая сортировка Кана (не все вершины обработаны → цикл) или DFS с тремя цветами: белая (не посещена), серая (в текущем пути), чёрная (готова). Ребро в серую вершину — цикл. Так работают madge и dependency-cruiser; в ESM циклы допустимы, но приводят к TDZ-ошибкам при обращении к ещё не инициализированным экспортам.
</details>

<details><summary>Как реактивные системы (Vue, сигналы) используют графы?</summary>

Зависимости `computed`/`effect` от сигналов образуют DAG. При изменении сигнала производные помечаются «грязными» (push), а пересчитываются лениво при чтении (pull) в топологическом порядке — это предотвращает «глитчи» (вычисление с частично обновлёнными данными) и лишние пересчёты.
</details>

<details><summary>Сложность BFS/DFS?</summary>

O(V + E) времени: каждая вершина и каждое ребро обрабатываются константное число раз. Память O(V) на visited и очередь/стек. Для сетки R × C — O(R·C).
</details>

## Практика

Задачи с автотестами — в [тесте темы](../quizzes/quiz.html?id=13-algorithms/06-graphs) и в [каталоге](#/algo).

## Источники
- [NeetCode: Graphs, Advanced Graphs](https://neetcode.io/roadmap)
- [Wikipedia: Topological sorting](https://en.wikipedia.org/wiki/Topological_sorting)
- [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Red Blob Games: Introduction to A*](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
