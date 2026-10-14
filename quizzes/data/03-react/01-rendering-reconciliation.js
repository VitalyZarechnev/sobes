QUIZ.register({
  id: '03-react/01-rendering-reconciliation',
  section: '03-react',
  title: 'Рендеринг и reconciliation',
  order: 1,
  source: '../03-react/01-rendering-reconciliation.md',
  questions: [
    {
      type: 'single', level: 'middle',
      q: 'Компонент «перерендерился» (React вызвал его функцию). Что можно утверждать про DOM?',
      options: [
        'DOM обязательно изменился — рендер и есть обновление DOM',
        'DOM мог не измениться: рендер — это вычисление описания UI, а изменения применяются в фазе commit только там, где есть разница',
        'DOM пересоздаётся целиком для этого компонента и его детей',
        'DOM изменится, только если компонент обёрнут в `memo`',
      ],
      answer: 1,
      explain: 'Render phase — вызов функций компонентов и вычисление разницы. Commit — применение мутаций к DOM, и только для изменившихся узлов. Поэтому «лишний» ререндер стоит CPU, но не обязательно трогает DOM.',
    },
    {
      type: 'output', level: 'middle', lang: 'jsx',
      q: 'Что окажется в консоли после одного клика по кнопке (production-сборка)?',
      code: `function App() {
  const [n, setN] = useState(0);
  console.log('render', n);
  return (
    <button onClick={() => {
      setN(n + 1);
      setN(n + 1);
      setN(p => p + 1);
      console.log('click', n);
    }}>{n}</button>
  );
}`,
      options: [
        'click 0, затем render 2',
        'click 2, затем render 2',
        'render 1, render 2, render 3, затем click 0',
        'click 0, затем render 3',
      ],
      answer: 0,
      explain: 'Внутри обработчика `n` — снимок рендера (0). Очередь: `0+1 → 1`, `0+1 → 1`, `p => p + 1 → 2`. Все обновления батчатся в один рендер, который случится после обработчика. Вариант «3» — типичная ошибка: первые два вызова оба основаны на `n = 0`.',
    },
    {
      type: 'output', level: 'senior', lang: 'jsx',
      q: 'Сколько раз будет вызвана функция `App` после клика (React 18+, production)?',
      code: `function App() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  console.log('render');
  return (
    <button onClick={() => {
      setTimeout(() => {
        setA(1);
        setB(1);
      }, 0);
    }}>{a + b}</button>
  );
}`,
      options: ['0', '1', '2', '3'],
      answer: 1,
      explain: 'С React 18 (`createRoot`) действует automatic batching: обновления в одном синхронном тике объединяются независимо от контекста — в обработчике, `setTimeout`, промисе. До React 18 внутри `setTimeout` было бы 2 рендера.',
    },
    {
      type: 'output', level: 'senior', lang: 'jsx',
      q: 'Компоненты уже смонтированы. Что выведется в консоль после клика по `div`?',
      code: `function Heavy() { console.log('Heavy'); return null; }
function Child() { console.log('Child'); return null; }

function Layout({ children }) {
  const [n, setN] = useState(0);
  console.log('Layout');
  return <div onClick={() => setN(n + 1)}>{children}<Child /></div>;
}

function App() {
  console.log('App');
  return <Layout><Heavy /></Layout>;
}`,
      options: [
        'Layout, Child',
        'Layout, Heavy, Child',
        'App, Layout, Heavy, Child',
        'Layout',
      ],
      answer: 0,
      explain: 'Ререндерится компонент, чей state изменился, и его дети, созданные в его JSX (`<Child />` — новый элемент на каждый рендер). `children` создан в `App` и приходит тем же объектом-элементом — React делает bailout для `Heavy`. Это приём «поднять контент вверх».',
    },
    {
      type: 'output', level: 'senior', lang: 'jsx',
      q: 'Что будет на экране после клика?',
      code: `function Profile() {
  const [user, setUser] = useState({ name: 'Ann' });
  return (
    <button onClick={() => {
      user.name = 'Bob';
      setUser(user);
    }}>{user.name}</button>
  );
}`,
      options: [
        'Bob — React заметит изменение поля',
        'Ann — тот же объект по `Object.is`, React пропустит ререндер',
        'Ошибка: state нельзя мутировать',
        'Bob, но только в StrictMode',
      ],
      answer: 1,
      explain: 'React сравнивает новый state со старым через `Object.is`. Мутированный объект — та же ссылка, поэтому рендер пропускается и на экране остаётся `Ann` (хотя объект в памяти уже изменён). Фикс: `setUser({ ...user, name: \'Bob\' })`.',
    },
    {
      type: 'output', level: 'senior', lang: 'jsx',
      q: 'Пользователь трижды кликнул по счётчику, затем нажал toggle. Что покажет счётчик?',
      code: `function Counter() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>{c}</button>;
}

function App() {
  const [flag, setFlag] = useState(false);
  return (
    <>
      {flag ? <Counter /> : <Counter />}
      <button onClick={() => setFlag(!flag)}>toggle</button>
    </>
  );
}`,
      options: ['0', '3', '1', 'Зависит от того, обёрнут ли Counter в memo'],
      answer: 1,
      explain: 'Состояние привязано к позиции в дереве и типу. В обеих ветках в одной позиции стоит один и тот же тип `Counter`, поэтому React считает это тем же компонентом и сохраняет state. Чтобы сбросить — разные `key`: `flag ? <Counter key="a" /> : <Counter key="b" />`.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Почему компонент, объявленный внутри другого компонента (`const Input = () => <input />` в теле `Parent`), теряет фокус и состояние при каждом рендере `Parent`?',
      options: [
        'Потому что внутренние компоненты не могут иметь state',
        'Каждый рендер создаёт новую функцию — новый `type`, и React размонтирует старое поддерево и монтирует новое',
        'Потому что React не поддерживает замыкания в компонентах',
        'Из-за StrictMode, в production всё работает',
      ],
      answer: 1,
      explain: 'Первая эвристика reconciliation: другой `type` → пересоздать поддерево. Новая функция-компонент на каждом рендере — всегда другой тип. Выносите компоненты на уровень модуля.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Список задач рендерится с `key={index}`, в каждой строке неконтролируемый `<input defaultValue={todo.text} />`. Что произойдёт после удаления первой задачи?',
      options: [
        'Всё корректно — React сравнит тексты задач',
        'Тексты в инпутах «съедут»: Fiber с `key=0` переиспользуется для бывшей второй задачи, а DOM-инпут сохранит старое значение',
        'React выбросит предупреждение и перемонтирует весь список',
        'Удалится последний инпут, но тексты будут верными, т.к. `defaultValue` обновится',
      ],
      answer: 1,
      explain: 'Ключ — идентичность. Индексы сдвигаются, и React сопоставляет состояние (DOM-значение, фокус, локальный state) не тем элементам. `defaultValue` применяется только при монтировании. Фикс — стабильный `key={todo.id}`.',
    },
    {
      type: 'multi', level: 'senior',
      q: 'Какие источники «приостановки» поймает граница `<Suspense>`?',
      options: [
        '`React.lazy(() => import(\'./Page\'))`',
        '`use(promise)` с ещё не разрешённым промисом',
        'Загрузка данных в `useEffect` с `setLoading(true)`',
        '`useSuspenseQuery` из TanStack Query',
      ],
      answer: [0, 1, 3],
      explain: 'Suspense реагирует на приостановку **во время рендера** (lazy, `use`, Suspense-совместимые библиотеки и RSC). Эффект выполняется после commit — Suspense о нём ничего не знает, такой лоадер нужно рисовать вручную.',
    },
    {
      type: 'order', level: 'senior',
      q: 'Расположите этапы обновления после `setState` по порядку',
      items: [
        'Вызов функций компонентов и сравнение детей (render phase)',
        'Мутации DOM (commit)',
        'Привязка ref и вызов `useLayoutEffect`',
        'Отрисовка браузером (paint)',
        'Вызов `useEffect`',
      ],
      explain: 'Render — чистый и прерываемый. Commit — синхронный: мутации DOM, затем ref и layout-эффекты (до paint, блокируют отрисовку). После paint обычно выполняются пассивные эффекты. Нюанс: после дискретного события `useEffect` может выполниться синхронно до paint.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Что главным образом дало представление дерева Fiber связным списком `child / sibling / return` вместо рекурсии?',
      options: [
        'Возможность рендерить компоненты в нескольких потоках',
        'Возможность остановить обход в любой точке, отдать управление браузеру и продолжить позже (прерываемый рендер с приоритетами)',
        'Ускорение сравнения деревьев с O(n³) до O(n)',
        'Возможность частично применять изменения к DOM, не дожидаясь конца рендера',
      ],
      answer: 1,
      explain: 'Рекурсию по JS-стеку нельзя прервать, а цикл по связному списку — можно (`while (wip && !shouldYield())`). O(n) даёт эвристика reconciliation, а не Fiber. Commit остаётся синхронным — DOM никогда не бывает полуобновлённым. Многопоточности нет.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Навигация на новый маршрут обёрнута в `startTransition`, новая страница приостанавливается (Suspense). Что увидит пользователь?',
      options: [
        'Fallback ближайшей Suspense-границы вместо текущей страницы',
        'Текущую страницу (можно показать `isPending`), пока новая не будет готова — уже показанный контент не заменяется fallback',
        'Пустой экран до загрузки',
        'Ошибку: transition нельзя совмещать с Suspense',
      ],
      answer: 1,
      explain: 'Transition сообщает React, что обновление несрочное: вместо «мигания» спиннером React держит старый UI до готовности нового. Fallback показывается только для впервые появляющихся границ.',
    },
    {
      type: 'single', level: 'senior',
      q: 'В обработчике `onChange` вызвано `startTransition(() => setResults(filterHeavy(value)))`. Ввод всё равно лагает. Почему?',
      options: [
        '`startTransition` работает только с async-функциями',
        '`filterHeavy` выполняется синхронно в обработчике, до планирования — прерывается только рендер компонентов, а не произвольный код',
        'Нужно было обернуть в `flushSync`',
        'Transition отключён в production',
      ],
      answer: 1,
      explain: 'Concurrent rendering прерывает работу React по компонентам. Тяжёлое вычисление в обработчике блокирует поток целиком. Правильно — хранить в state сам запрос, а фильтровать в рендере (`useMemo` от `useDeferredValue(query)`), либо вынести в Web Worker.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Чем `useDeferredValue` отличается от debounce при фильтрации большого списка?',
      options: [
        'Ничем — это debounce с задержкой 300 мс внутри React',
        'У `useDeferredValue` нет фиксированной задержки: отстающий рендер прерываемый и на быстром устройстве почти не отстаёт; debounce уменьшает число операций фиксированной паузой',
        '`useDeferredValue` уменьшает количество сетевых запросов, а debounce — нет',
        'Debounce работает только с контролируемыми инпутами',
      ],
      answer: 1,
      explain: 'Deferred value — про прерываемость рендера, а не про таймер. Для сетевых запросов нужен именно debounce (+ отмена), для тяжёлого рендера — deferred value / transition.',
    },
    {
      type: 'open', level: 'lead',
      q: 'Пользователи жалуются, что поиск по каталогу «подтормаживает» при вводе. Как вы проведёте диагностику и какие решения рассмотрите, опираясь на модель рендеринга React?',
      answer: 'Воспроизвести в **production-сборке** с CPU throttling, записать взаимодействие в Chrome Performance (INP, long tasks) и React Profiler (какие компоненты рендерятся и сколько).\n\nТиповые причины: state ввода живёт высоко и ререндерит всю страницу; тяжёлая фильтрация в обработчике или рендере; огромный список DOM-узлов; контекст с часто меняющимся значением.\n\nРешения по возрастанию стоимости: опустить state вниз / поднять контент через `children`; `useDeferredValue` для результата + `memo` списка; виртуализация; Web Worker для фильтрации; для сети — debounce + `AbortController`. После — повторный замер и мониторинг INP в проде.',
    },
  ],
  tasks: [
    {
      title: 'Мини-реконсайлер списка по key',
      level: 'senior',
      prompt: 'Реализуйте `diffKeys(oldKeys, newKeys)` — упрощённый алгоритм React для детей-массива. Вернуть `{ inserts, moves, deletes }` (массивы ключей).\n\nПравила (как в React, с `lastPlacedIndex`):\n- идём по `newKeys` слева направо; если ключа не было в старом списке — это **insert**;\n- если был и его старый индекс **меньше** `lastPlacedIndex` — это **move**; иначе обновить `lastPlacedIndex = oldIndex`;\n- старые ключи, которых нет в новом списке, — **deletes** (в порядке старого списка).\n\nНапример, перенос последнего в начало `[a,b,c,d] → [d,a,b,c]` даёт `moves: [a,b,c]`, а первого в конец `[a,b,c,d] → [b,c,d,a]` — только `moves: [a]`.',
      starter: 'function diffKeys(oldKeys, newKeys) {\n  // ваш код\n}',
      solution: `function diffKeys(oldKeys, newKeys) {
  const oldIndex = new Map(oldKeys.map((k, i) => [k, i]));
  const newSet = new Set(newKeys);
  const inserts = [];
  const moves = [];
  let lastPlacedIndex = 0;
  for (const key of newKeys) {
    if (!oldIndex.has(key)) {
      inserts.push(key);
      continue;
    }
    const idx = oldIndex.get(key);
    if (idx < lastPlacedIndex) moves.push(key);
    else lastPlacedIndex = idx;
  }
  const deletes = oldKeys.filter((k) => !newSet.has(k));
  return { inserts, moves, deletes };
}`,
      notes: 'O(n) по времени и памяти: одна `Map` старых индексов. Асимметрия «последний в начало дороже, чем первый в конец» — прямое следствие однопроходной эвристики: React не ищет минимальное число перемещений (это была бы LIS, как во Vue 3).',
      tests: [
        { name: 'добавление в конец', code: "const r = diffKeys(['a','b'], ['a','b','c']);\nreturn JSON.stringify(r) === JSON.stringify({ inserts: ['c'], moves: [], deletes: [] });" },
        { name: 'последний в начало', code: "const r = diffKeys(['a','b','c','d'], ['d','a','b','c']);\nreturn JSON.stringify(r.moves) === JSON.stringify(['a','b','c']) && r.inserts.length === 0 && r.deletes.length === 0;" },
        { name: 'первый в конец', code: "const r = diffKeys(['a','b','c','d'], ['b','c','d','a']);\nreturn JSON.stringify(r.moves) === JSON.stringify(['a']);" },
        { name: 'удаление и вставка', code: "const r = diffKeys(['a','b','c'], ['x','c','a']);\nreturn JSON.stringify(r) === JSON.stringify({ inserts: ['x'], moves: ['a'], deletes: ['b'] });" },
        { name: 'пустые списки', code: "const r = diffKeys([], ['a']);\nconst r2 = diffKeys(['a'], []);\nreturn r.inserts[0] === 'a' && r2.deletes[0] === 'a';" },
      ],
    },
    {
      title: 'Очередь обновлений с батчингом',
      level: 'senior',
      prompt: 'Реализуйте `createStateQueue(initial, onRender)` — модель automatic batching.\n\n- `setState(valueOrUpdater)` ставит обновление в очередь (значение или функция `prev => next`);\n- в конце текущего синхронного тика (микрозадача) очередь применяется **по порядку**, и `onRender(state)` вызывается **один раз**;\n- если итоговое значение `Object.is`-равно предыдущему — `onRender` не вызывается;\n- `getState()` возвращает применённое (закоммиченное) значение — до флаша оно старое;\n- `flushSync(fn)` выполняет `fn` и применяет очередь синхронно (сразу вызывая `onRender`).',
      starter: 'function createStateQueue(initial, onRender) {\n  // ваш код\n  return { setState, getState, flushSync };\n}',
      solution: `function createStateQueue(initial, onRender) {
  let state = initial;
  let queue = [];
  let scheduled = false;

  const flush = () => {
    scheduled = false;
    if (!queue.length) return;
    const pending = queue;
    queue = [];
    const next = pending.reduce((s, u) => (typeof u === 'function' ? u(s) : u), state);
    if (Object.is(next, state)) return;
    state = next;
    onRender(state);
  };

  const setState = (update) => {
    queue.push(update);
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => { if (scheduled) flush(); });
    }
  };

  const flushSync = (fn) => {
    fn();
    flush();
  };

  return { setState, getState: () => state, flushSync };
}`,
      notes: 'Ключевые идеи: обновления — очередь функций, применяемых последовательно (поэтому `p => p + 1` трижды даёт +3, а `n + 1` трижды — +1); один рендер на батч; bailout по `Object.is`. В React роль микрозадачи для SyncLane выполняет планировщик, а `flushSync` форсирует синхронный рендер.',
      tests: [
        { name: 'один рендер на батч', code: "const renders = [];\nconst q = createStateQueue(0, (s) => renders.push(s));\nq.setState(1); q.setState(1); q.setState((p) => p + 1);\nif (q.getState() !== 0) return false;\nawait Promise.resolve();\nreturn JSON.stringify(renders) === '[2]' && q.getState() === 2;" },
        { name: 'функциональные апдейты суммируются', code: "const renders = [];\nconst q = createStateQueue(0, (s) => renders.push(s));\nfor (let i = 0; i < 3; i++) q.setState((p) => p + 1);\nawait Promise.resolve();\nreturn JSON.stringify(renders) === '[3]';" },
        { name: 'bailout при том же значении', code: "let calls = 0;\nconst q = createStateQueue(5, () => calls++);\nq.setState(6); q.setState(5);\nawait Promise.resolve();\nreturn calls === 0 && q.getState() === 5;" },
        { name: 'flushSync применяет сразу', code: "const renders = [];\nconst q = createStateQueue('a', (s) => renders.push(s));\nq.flushSync(() => q.setState('b'));\nif (renders.join() !== 'b' || q.getState() !== 'b') return false;\nawait Promise.resolve();\nreturn renders.join() === 'b';" },
      ],
    },
    {
      title: 'Отзывчивый поиск по 10 000 элементам',
      level: 'senior',
      lang: 'tsx',
      prompt: 'Компонент `Search` фильтрует 10 000 строк при каждом нажатии клавиши, ввод лагает. Перепишите его без сторонних библиотек так, чтобы инпут оставался отзывчивым, а список показывал признак устаревания (полупрозрачность).',
      starter: `function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const visible = items.filter(i => i.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{visible.map(i => <li key={i}>{i}</li>)}</ul>
    </>
  );
}`,
      solution: `import { memo, useDeferredValue, useMemo, useState } from 'react';

const Results = memo(function Results({ items, query }: { items: string[]; query: string }) {
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i => i.toLowerCase().includes(q));
  }, [items, query]);
  return <ul>{visible.map(i => <li key={i}>{i}</li>)}</ul>;
});

export function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <Results items={items} query={deferredQuery} />
      </div>
    </>
  );
}`,
      notes: 'Инпут обновляется срочно, список — по отстающему значению в прерываемом рендере. `memo` обязателен: без него `Results` рендерился бы и в срочном проходе. Если всё равно тяжело — виртуализация; для сетевого поиска — debounce + `AbortController`.',
    },
  ],
});
