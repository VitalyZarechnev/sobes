QUIZ.register({
  id: '04-vue/01-reactivity',
  section: '04-vue',
  title: 'Реактивность',
  order: 1,
  source: '../04-vue/01-reactivity.md',
  questions: [
    {
      type: 'output', level: 'middle', lang: 'js',
      q: 'Что будет после деструктуризации `reactive`? Что выведет код?',
      code: "import { reactive } from 'vue';\n\nconst state = reactive({ count: 0 });\nlet { count } = state;\ncount++;\nstate.count += 10;\nconsole.log(state.count, count);",
      options: ['10 1', '11 11', '10 11', '11 1'],
      answer: 0,
      explain: 'Деструктуризация один раз читает свойство и кладёт **примитив** в локальную переменную — связь с Proxy пропадает в обе стороны. `count++` меняет только локальную переменную (1), а `state.count += 10` — только прокси (10). Чинится через `toRefs(state)` или `toRef(state, \'count\')`.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Что выведет код (computed: ленивость и кэш)?',
      code: "const a = ref(1);\nconst double = computed(() => {\n  console.log('calc');\n  return a.value * 2;\n});\na.value = 2;\na.value = 3;\nconsole.log('before');\nconsole.log(double.value);\nconsole.log(double.value);",
      options: ['calc calc before 6 6', 'before calc 6 6', 'before calc 6 calc 6', 'calc before 6 6'],
      answer: 1,
      explain: 'computed **ленивый**: геттер не вызывается, пока никто не прочитал `.value`, а изменения зависимостей только помечают его «грязным». Первое чтение пересчитывает (один раз, хотя `a` менялся дважды), второе берёт кэш.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Что выведет `watch` (flush по умолчанию)?',
      code: "const n = ref(0);\nwatch(n, (value, old) => console.log(`watch ${old}->${value}`));\n\nn.value = 1;\nn.value = 2;\nconsole.log('sync');\nawait nextTick();\nconsole.log('tick');",
      options: [
        'watch 0->1, watch 1->2, sync, tick',
        'sync, watch 0->1, watch 1->2, tick',
        'sync, watch 0->2, tick',
        'sync, watch 1->2, tick',
      ],
      answer: 2,
      explain: 'С `flush: \'pre\'` (по умолчанию) колбэк не вызывается синхронно — задание ставится в очередь планировщика с **дедупликацией** и выполняется в микрозадаче. К моменту запуска значение уже 2, а `oldValue` — значение на момент предыдущего запуска колбэка (0). Синхронный вызов на каждое изменение даёт только `flush: \'sync\'`.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Что выведет код с `watchEffect`?',
      code: "const n = ref(0);\nwatchEffect(() => console.log('effect', n.value));\nn.value = 1;\nn.value = 2;\nconsole.log('sync');\nawait nextTick();",
      options: [
        'sync, effect 2',
        'effect 0, sync, effect 2',
        'effect 0, effect 1, effect 2, sync',
        'effect 0, sync, effect 1, effect 2',
      ],
      answer: 1,
      explain: '`watchEffect` выполняет тело **сразу и синхронно** при создании, чтобы собрать зависимости. Последующие изменения батчатся планировщиком: два присваивания → один перезапуск в микрозадаче с актуальным значением 2.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Что выведет вотчер с `flush: \'sync\'`?',
      code: "const n = ref(0);\nwatch(n, v => console.log('w', v), { flush: 'sync' });\nn.value = 1;\nn.value = 1;\nn.value = 2;\nconsole.log('end');",
      options: ['end, w 2', 'w 1, w 1, w 2, end', 'w 1, w 2, end', 'w 2, end'],
      answer: 2,
      explain: '`flush: \'sync\'` вызывает колбэк синхронно при каждом **реальном** изменении, без батчинга. Повторное присваивание того же значения не триггерит (сеттер ref сравнивает через `Object.is`). Поэтому `sync` дорог и нужен редко.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Какие колбэки сработают после `push`?',
      code: "const state = reactive({ list: [1] });\nwatch(() => state.list, () => console.log('getter'));\nwatch(() => state.list.length, () => console.log('length'));\nwatch(state, () => console.log('reactive'));\nstate.list.push(2);\nawait nextTick();",
      options: ['getter, length, reactive', 'length, reactive', 'только length', 'getter, reactive'],
      answer: 1,
      explain: 'Геттер `() => state.list` возвращает **тот же массив** — без `deep: true` изменение содержимого не меняет результат, колбэк не вызывается. Геттер длины вернул новое число. `watch(reactiveObj)` — глубокий по умолчанию, поэтому видит мутацию вложенного массива.',
    },
    {
      type: 'output', level: 'senior', lang: 'js',
      q: 'Сколько раз сработает эффект (Vue 3.4+)?',
      code: "const n = ref(1);\nconst isPositive = computed(() => n.value > 0);\nwatchEffect(() => console.log('render', isPositive.value));\n\nn.value = 2;\nawait nextTick();\nn.value = 3;\nawait nextTick();\nn.value = -1;\nawait nextTick();",
      options: [
        'render true, render true, render true, render false',
        'render true, render false',
        'render true',
        'render false',
      ],
      answer: 1,
      explain: 'С 3.4 computed уведомляет подписчиков, **только если результат реально изменился** (`Object.is`). `n` = 2 и 3 не меняют `true`, поэтому эффект не перезапускается. Приём: computed с примитивным/булевым результатом гасит лишние ререндеры.',
    },
    {
      type: 'output', level: 'middle', lang: 'js',
      q: 'Что выведет код?',
      code: "const raw = { a: 1 };\nconst p = reactive(raw);\nconsole.log(p === reactive(raw), p === raw, toRaw(p) === raw);",
      options: ['true true true', 'false false true', 'true false true', 'true false false'],
      answer: 2,
      explain: 'Прокси кэшируются в `WeakMap<target, proxy>`, поэтому повторный `reactive(raw)` возвращает тот же прокси. Но прокси — отдельный объект, `p !== raw`; изменения через `raw` не отслеживаются. `toRaw` возвращает оригинал.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Что не так с `watch(state.count, cb)`, где `state = reactive({ count: 0 })`?',
      options: [
        'Ничего — Vue сам обернёт значение в геттер',
        'В watch передано число, а не источник; Vue предупредит, колбэк не вызовется. Нужно `watch(() => state.count, cb)`',
        'Нужно добавить `{ deep: true }`',
        'Колбэк вызовется один раз сразу, потом — никогда',
      ],
      answer: 1,
      explain: '`state.count` вычисляется до вызова `watch` — в функцию приходит `0`. Источником могут быть ref, reactive-объект, геттер или массив из них. Для поля reactive-объекта — геттер.',
    },
    {
      type: 'multi', level: 'senior',
      q: 'В каких случаях реактивность теряется?',
      options: [
        '`let { count } = reactive({ count: 0 })`',
        '`useSomething(state.count)` — передача поля-примитива в функцию',
        '`let s = reactive({ a: 1 }); s = reactive({ a: 2 })` — компоненты держат старый прокси',
        '`const { count } = toRefs(state)`',
        '`const { id } = defineProps<{ id: string }>()` в `<script setup>` Vue 3.5',
      ],
      answer: [0, 1, 2],
      explain: '`toRefs` даёт refs, связанные с полями. В 3.5 деструктуризация прямо из `defineProps` реактивна — компилятор переписывает `id` в `props.id` (но в composable всё равно передают геттер `() => id`). Остальные три варианта — классические ловушки.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Что вернёт `reactive([ref(1)])[0]`?',
      options: [
        '`1` — ref разворачивается везде',
        'ref-объект: в элементах реактивного массива и Map ref не разворачивается, нужен `.value`',
        '`undefined`',
        'Ошибку: ref нельзя класть в reactive',
      ],
      answer: 1,
      explain: 'Auto-unwrapping работает для свойств reactive-объекта (`reactive({ c: ref(1) }).c === 1`) и refs верхнего уровня в шаблоне, но **не** для элементов массивов и коллекций.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Что не умела отслеживать реактивность Vue 2 на `Object.defineProperty`?',
      options: [
        'Изменение существующего свойства объекта',
        'Добавление новых свойств и запись по индексу массива — требовались `Vue.set`/`this.$set`',
        'Изменения вложенных объектов',
        'Вызов `push` у массива',
      ],
      answer: 1,
      explain: 'Геттеры/сеттеры вешались на известные поля при инициализации (рекурсивно и сразу). Новые ключи, удаление и `arr[i] = x`/`length` не перехватывались; `push` работал за счёт патча методов прототипа. Proxy в Vue 3 снял эти ограничения и сделал инициализацию ленивой.',
    },
    {
      type: 'single', level: 'senior',
      q: 'У вас `shallowRef` с массивом на 10 000 строк. Вы сделали `rows.value[0].done = true`. Как обновить UI с минимальной стоимостью?',
      options: [
        'Ничего не нужно — shallowRef отследит изменение',
        'Переключиться на `ref` — так правильнее',
        'Иммутабельно заменить `.value` (`rows.value = rows.value.map(...)`) или вызвать `triggerRef(rows)` после мутации',
        'Вызвать `nextTick()`',
      ],
      answer: 2,
      explain: '`shallowRef` реактивен только к присваиванию `.value`. Вложенные мутации не трекаются — либо заменяйте значение целиком, либо уведомляйте вручную `triggerRef`. Переход на глубокий `ref` вернёт стоимость прокси на каждый объект.',
    },
    {
      type: 'order', level: 'senior',
      q: 'Расположите шаги работы `computed` от создания до повторного чтения после изменения зависимости',
      items: [
        'computed создан, флаг dirty = true, геттер не вызывался',
        'первое чтение `.value`: геттер выполняется, зависимости трекаются, dirty = false',
        'зависимость изменилась: scheduler помечает dirty = true и уведомляет подписчиков computed',
        'следующее чтение `.value`: пересчёт и сравнение с прошлым значением',
      ],
      explain: 'computed — одновременно подписчик (на свои зависимости) и источник (для читающих его эффектов). Пересчёт ленивый — только при чтении.',
    },
    {
      type: 'open', level: 'lead',
      q: 'Команда жалуется на тормоза: из API приходит 100 000 объектов, всё лежит в `ref`. Как вы спроектируете состояние и какие правила закрепите в команде?',
      answer: 'Данные, приходящие целиком с сервера, — в `shallowRef` с **иммутабельными** обновлениями (или `triggerRef` после точечной мутации): нет прокси на каждый объект, меньше памяти и трекинга. Внешние инстансы (карта, редактор, SDK) — `markRaw`/`shallowRef`. Статические справочники — обычные объекты или `Object.freeze`. Производные значения — `computed` с примитивным результатом. `deep`-вотчеры на больших объектах запретить, наблюдать конкретные геттеры. Серверное состояние — в TanStack Query/Pinia Colada, а не ручной кэш. Закрепить: правила в ADR/гайдлайне, lint-правила (`vue/no-ref-object-reactivity-loss` и т.п.), профилирование в Vue DevTools перед оптимизацией.',
    },
  ],
  tasks: [
    {
      title: 'Мини-реактивность на Proxy: reactive + effect',
      level: 'senior',
      prompt: 'Реализуйте `reactive(obj)` и `effect(fn)` на Proxy с `track`/`trigger` и структурой `WeakMap<target, Map<key, Set<effect>>>`.\n\nТребования:\n- `effect` сразу выполняет `fn` и перезапускает её при изменении прочитанных свойств;\n- **динамические зависимости**: при каждом запуске эффект отписывается от старых зависимостей;\n- ленивая глубокая реактивность (вложенные объекты оборачиваются при чтении);\n- `reactive(raw) === reactive(raw)` (кэш прокси);\n- запись того же значения (`Object.is`) не триггерит; добавление нового свойства — триггерит;\n- эффект не должен вызывать сам себя при записи внутри себя.',
      starter: 'function reactive(target) {\n  // ваш код\n}\n\nfunction effect(fn) {\n  // ваш код\n}',
      solution: `const targetMap = new WeakMap();
const proxyCache = new WeakMap();
const effectStack = [];
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
  activeEffect.deps.add(dep); // обратная ссылка — для очистки
}

function trigger(target, key) {
  const dep = targetMap.get(target)?.get(key);
  if (!dep) return;
  // копия: при запуске эффект удаляет себя из dep и добавляет снова
  [...dep].forEach((e) => { if (e !== activeEffect) e(); });
}

function effect(fn) {
  const runner = () => {
    runner.deps.forEach((dep) => dep.delete(runner));
    runner.deps.clear();
    effectStack.push(runner);
    activeEffect = runner;
    try {
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack.at(-1) ?? null;
    }
  };
  runner.deps = new Set();
  runner();
  return runner;
}

function reactive(target) {
  const cached = proxyCache.get(target);
  if (cached) return cached;
  const proxy = new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key);
      const value = Reflect.get(obj, key, receiver);
      return value !== null && typeof value === 'object' ? reactive(value) : value;
    },
    set(obj, key, value, receiver) {
      const had = Object.hasOwn(obj, key);
      const old = obj[key];
      const ok = Reflect.set(obj, key, value, receiver);
      if (!had || !Object.is(old, value)) trigger(obj, key);
      return ok;
    },
    deleteProperty(obj, key) {
      const had = Object.hasOwn(obj, key);
      const ok = Reflect.deleteProperty(obj, key);
      if (had && ok) trigger(obj, key);
      return ok;
    },
  });
  proxyCache.set(target, proxy);
  return proxy;
}`,
      notes: 'Ключевые моменты: обратные ссылки `effect.deps` для очистки (иначе после переключения ветки `if` эффект продолжит реагировать на старые поля), стек эффектов для вложенности, копия Set при обходе в `trigger`. В Vue также есть ловушки `has`/`ownKeys` (с `ITERATE_KEY` для `for...in`), обработка массивов и коллекций, а с 3.5 — версии и двусвязные списки вместо Set.',
      tests: [
        { name: 'эффект перезапускается при изменении', code: 'const s = reactive({ n: 1 });\nconst seen = [];\neffect(() => seen.push(s.n));\ns.n = 2;\nreturn seen.join() === "1,2";' },
        { name: 'то же значение не триггерит', code: 'const s = reactive({ n: 1 });\nlet runs = 0;\neffect(() => { runs++; s.n; });\ns.n = 1;\nreturn runs === 1;' },
        { name: 'глубокая реактивность', code: 'const s = reactive({ user: { name: "Ann" } });\nlet name;\neffect(() => { name = s.user.name; });\ns.user.name = "Bob";\nreturn name === "Bob";' },
        { name: 'кэш прокси', code: 'const raw = { a: 1 };\nreturn reactive(raw) === reactive(raw) && reactive(raw) !== raw;' },
        { name: 'динамические зависимости', code: 'const s = reactive({ ok: true, a: 1, b: 2 });\nlet runs = 0;\neffect(() => { runs++; s.ok ? s.a : s.b; });\ns.ok = false;\ns.a = 10;\nreturn runs === 2;' },
        { name: 'новое свойство триггерит', code: 'const s = reactive({});\nlet v;\neffect(() => { v = s.x; });\ns.x = 5;\nreturn v === 5;' },
        { name: 'нет самовызова', code: 'const s = reactive({ n: 0 });\nlet runs = 0;\neffect(() => { runs++; s.n = s.n + 1; });\nreturn runs === 1 && s.n === 1;' },
      ],
    },
    {
      title: 'computed: ленивость, кэш и dirty-флаг',
      level: 'senior',
      prompt: 'Реализуйте `ref(value)`, `effect(fn)` и `computed(getter)`.\n\n- `computed` **ленивый**: геттер не вызывается до первого чтения `.value`;\n- результат кэшируется до изменения зависимостей; несколько изменений подряд → один пересчёт при следующем чтении;\n- эффект, читающий computed, перезапускается при изменении его зависимостей;\n- запись в ref того же значения не триггерит.\n\nПодсказка: у эффекта computed есть `scheduler` — вместо перезапуска он ставит `dirty = true` и уведомляет подписчиков computed.',
      starter: 'function ref(value) {}\nfunction effect(fn) {}\nfunction computed(getter) {}',
      solution: `const effectStack = [];
let activeEffect = null;

class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = new Set();
  }
  run() {
    this.deps.forEach((dep) => dep.delete(this));
    this.deps.clear();
    effectStack.push(this);
    activeEffect = this;
    try {
      return this.fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack.at(-1) ?? null;
    }
  }
}

function trackDep(dep) {
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.add(dep);
}

function triggerDep(dep) {
  [...dep].forEach((e) => {
    if (e === activeEffect) return;
    if (e.scheduler) e.scheduler();
    else e.run();
  });
}

function effect(fn) {
  const e = new ReactiveEffect(fn);
  e.run();
  return e;
}

function ref(initial) {
  let value = initial;
  const dep = new Set();
  return {
    get value() { trackDep(dep); return value; },
    set value(next) {
      if (Object.is(next, value)) return;
      value = next;
      triggerDep(dep);
    },
  };
}

function computed(getter) {
  let value;
  let dirty = true;
  const dep = new Set(); // подписчики самого computed
  const runner = new ReactiveEffect(getter, () => {
    if (dirty) return;
    dirty = true;
    triggerDep(dep);
  });
  return {
    get value() {
      if (dirty) {
        value = runner.run();
        dirty = false;
      }
      trackDep(dep); // читающий эффект подписывается на computed
      return value;
    },
  };
}`,
      notes: 'Порядок в геттере важен: сначала `runner.run()` (он сам восстановит `activeEffect`), затем `trackDep` для внешнего эффекта. Эта упрощённая версия допускает «глитч»: эффект, читающий и `a`, и `computed(a)`, может кратко увидеть устаревший computed — Vue решает это планировщиком и версиями (см. задачу на странице «Вопросы и практика»). Также в Vue 3.4+ computed не уведомляет подписчиков, если новое значение равно старому.',
      tests: [
        { name: 'ленивость', code: 'let calls = 0;\nconst a = ref(1);\nconst c = computed(() => { calls++; return a.value * 2; });\nreturn calls === 0;' },
        { name: 'кэш', code: 'let calls = 0;\nconst a = ref(1);\nconst c = computed(() => { calls++; return a.value * 2; });\nreturn c.value === 2 && c.value === 2 && calls === 1;' },
        { name: 'пересчёт только при чтении', code: 'let calls = 0;\nconst a = ref(1);\nconst c = computed(() => { calls++; return a.value * 2; });\nc.value;\na.value = 2;\na.value = 5;\nconst before = calls;\nreturn before === 1 && c.value === 10 && calls === 2;' },
        { name: 'эффект на computed', code: 'const a = ref(1);\nconst c = computed(() => a.value * 2);\nconst seen = [];\neffect(() => seen.push(c.value));\na.value = 4;\nreturn seen.join() === "2,8";' },
        { name: 'ref: то же значение не триггерит', code: 'const a = ref(1);\nlet runs = 0;\neffect(() => { runs++; a.value; });\na.value = 1;\nreturn runs === 1;' },
      ],
    },
    {
      title: 'shallowRef и triggerRef',
      level: 'senior',
      prompt: 'Реализуйте `effect(fn)`, `shallowRef(value)` и `triggerRef(ref)`.\n\n- `shallowRef` реактивен **только** к присваиванию `.value` (сравнение через `Object.is`);\n- мутации внутри значения не отслеживаются;\n- `triggerRef(r)` вручную перезапускает всех подписчиков `r`.',
      starter: 'function effect(fn) {}\nfunction shallowRef(value) {}\nfunction triggerRef(r) {}',
      solution: `const deps = new WeakMap(); // ref -> Set<effect>
const effectStack = [];
let activeEffect = null;

function effect(fn) {
  const runner = () => {
    runner.deps.forEach((dep) => dep.delete(runner));
    runner.deps.clear();
    effectStack.push(runner);
    activeEffect = runner;
    try { fn(); } finally {
      effectStack.pop();
      activeEffect = effectStack.at(-1) ?? null;
    }
  };
  runner.deps = new Set();
  runner();
  return runner;
}

function triggerRef(r) {
  const dep = deps.get(r);
  if (!dep) return;
  [...dep].forEach((e) => { if (e !== activeEffect) e(); });
}

function shallowRef(initial) {
  let value = initial;
  const r = {
    get value() {
      if (activeEffect) {
        const dep = deps.get(r);
        dep.add(activeEffect);
        activeEffect.deps.add(dep);
      }
      return value; // без оборачивания в Proxy
    },
    set value(next) {
      if (Object.is(next, value)) return;
      value = next;
      triggerRef(r);
    },
  };
  deps.set(r, new Set());
  return r;
}`,
      notes: 'Отличие от `ref`: значение не превращается в `reactive`, поэтому нет стоимости прокси на вложенные объекты. Применение — большие иммутабельные структуры, ответы API, внешние инстансы. Настоящий `triggerRef` в Vue работает и для обычных ref.',
      tests: [
        { name: 'присваивание триггерит', code: 'const r = shallowRef(1);\nconst seen = [];\neffect(() => seen.push(r.value));\nr.value = 2;\nreturn seen.join() === "1,2";' },
        { name: 'вложенная мутация не триггерит', code: 'const r = shallowRef({ n: 1 });\nlet runs = 0;\neffect(() => { runs++; r.value.n; });\nr.value.n = 2;\nreturn runs === 1;' },
        { name: 'triggerRef после мутации', code: 'const r = shallowRef({ n: 1 });\nconst seen = [];\neffect(() => seen.push(r.value.n));\nr.value.n = 2;\ntriggerRef(r);\nreturn seen.join() === "1,2";' },
        { name: 'то же значение не триггерит', code: 'const obj = { n: 1 };\nconst r = shallowRef(obj);\nlet runs = 0;\neffect(() => { runs++; r.value; });\nr.value = obj;\nreturn runs === 1;' },
      ],
    },
  ],
});
