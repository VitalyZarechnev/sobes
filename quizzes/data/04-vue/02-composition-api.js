QUIZ.register({
  id: '04-vue/02-composition-api',
  section: '04-vue',
  title: 'Composition API',
  order: 2,
  source: '../04-vue/02-composition-api.md',
  questions: [
    {
      type: 'single', level: 'middle',
      q: 'Сколько раз вызывается `setup()` (тело `<script setup>`) у компонента?',
      options: [
        'На каждый ререндер, как тело функции-компонента в React',
        'Один раз при создании инстанса; при обновлениях вызывается только render-функция',
        'Дважды: на сервере и на клиенте при любом рендеринге',
        'При каждом изменении props',
      ],
      answer: 1,
      explain: '`setup` — это «конструктор» компонента. Повторно выполняется только скомпилированная render-функция. Отсюда отсутствие stale closures, `useCallback` и правил порядка хуков. (Вызов на сервере и клиенте — это про SSR + гидратацию, а не про каждый рендер.)',
    },
    {
      type: 'output', level: 'middle', lang: 'vue',
      q: 'Родитель передаёт реактивный `user` и затем делает `user.name = \'Bob\'`. Обновится ли шаблон дочернего компонента?',
      code: "<script setup>\nconst props = defineProps({ user: Object });\nconst name = props.user.name; // 'Ann'\n</script>\n\n<template>\n  <p>{{ name }}</p>\n  <p>{{ props.user.name }}</p>\n</template>",
      options: [
        'Обе строки покажут Bob',
        'Первая останется Ann, вторая станет Bob',
        'Обе останутся Ann — дочерний компонент не перерендерится',
        'Ошибка: props нельзя читать в setup',
      ],
      answer: 1,
      explain: '`setup` выполняется один раз: `name` — строка, вычисленная при создании, связи с реактивностью нет. Чтение `props.user.name` в шаблоне трекается эффектом рендера, поэтому вторая строка обновится. Исправление: `const name = computed(() => props.user.name)`.',
    },
    {
      type: 'output', level: 'senior', lang: 'vue',
      q: 'Что произойдёт при монтировании компонента?',
      code: "<script setup>\nimport { onMounted } from 'vue';\n\nasync function init() {\n  await loadConfig();\n  onMounted(() => console.log('mounted'));\n}\ninit();\n</script>",
      options: [
        'Выведется mounted после загрузки конфига',
        'Выведется mounted сразу при монтировании',
        'mounted не выведется: после await во вложенной функции нет текущего инстанса, хук не зарегистрируется (Vue предупредит)',
        'Компонент станет async и потребует Suspense',
      ],
      answer: 2,
      explain: 'Хуки жизненного цикла привязываются к текущему инстансу, который существует только синхронно во время `setup`. Компилятор восстанавливает контекст после **top-level** `await`, но не во вложенных функциях. Регистрируйте хуки синхронно, а асинхронную работу запускайте внутри них. Async-компонентом его делает только top-level `await`.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Родитель получил template ref на дочерний компонент с `<script setup>` без `defineExpose`. Что доступно родителю из переменных и функций `setup` ребёнка?',
      options: [
        'Всё, что объявлено на верхнем уровне `<script setup>`',
        'Только refs',
        'Ничего: компоненты с `<script setup>` закрыты по умолчанию, наружу видно только явно выставленное через `defineExpose`',
        'Только функции',
      ],
      answer: 2,
      explain: 'В отличие от Options API (`this` открыт целиком), `<script setup>` закрыт: родитель видит только то, что передано в `defineExpose({ ... })`. Это защищает инкапсуляцию и упрощает рефакторинг.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Во что компилируется `const model = defineModel<string>()`?',
      options: [
        'В `provide`/`inject` между родителем и ребёнком',
        'В prop `modelValue`, событие `update:modelValue` и локальный ref, синхронизированный с пропом',
        'В глобальный стор Pinia',
        'В prop `value` и событие `input`, как в Vue 2',
      ],
      answer: 1,
      explain: 'Запись в `model.value` эмитит `update:modelValue`, чтение возвращает значение пропа. Если родитель не передал `v-model`, ref работает как локальное состояние. `value` + `input` — это Vue 2.',
    },
    {
      type: 'single', level: 'senior',
      q: 'В компоненте с `const model = defineModel<User>()` написано `model.value.name = \'x\'`. Что не так?',
      options: [
        'Ничего, так и задумано',
        'Это мутация объекта-пропа родителя в обход события `update:modelValue`; правильно — `model.value = { ...model.value, name: \'x\' }`',
        'Это вызовет бесконечный цикл обновлений',
        'Vue выбросит ошибку readonly',
      ],
      answer: 1,
      explain: 'Props защищены `shallowReadonly` только на первом уровне — вложенная мутация пройдёт молча и нарушит однонаправленный поток данных: родитель не получит событие, а devtools не покажут источник изменения. Эмитьте новый объект.',
    },
    {
      type: 'multi', level: 'middle',
      q: 'Какие проблемы mixins решают composables?',
      options: [
        'Неясно, из какого миксина пришло свойство в шаблоне',
        'Молчаливые коллизии имён между миксинами',
        'Неявная связь: миксин рассчитывает на свойство компонента или другого миксина',
        'Плохой вывод типов',
        'Миксины не работают с Options API',
      ],
      answer: [0, 1, 2, 3],
      explain: 'Composable — явный вызов функции с явными аргументами, возвращаемые refs можно переименовать при деструктуризации, типы выводятся полностью. Миксины как раз механизм Options API.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Как правильно объявить параметр composable, который может быть значением, ref или геттером (`useUser(() => props.id)`)?',
      options: [
        '`id: string` и читать его напрямую в `watchEffect`',
        '`id: Ref<string>` — геттеры не поддерживать',
        '`id: MaybeRefOrGetter<string>` и нормализовать через `toValue(id)` внутри `watch`/`watchEffect`/`computed`',
        '`id: () => string` и вызывать один раз при создании',
      ],
      answer: 2,
      explain: '`toValue` разворачивает ref, вызывает геттер или возвращает значение как есть. Вызов внутри эффекта делает чтение отслеживаемым — composable реагирует на смену `props.id`. Передача `props.id` значением «замораживает» его.',
    },
    {
      type: 'output', level: 'senior', lang: 'vue',
      q: 'Родитель через секунду делает `count.value = 5`. Что покажет ребёнок?',
      code: "<!-- Parent.vue -->\n<script setup>\nconst count = ref(0);\nprovide('count', count.value);\nsetTimeout(() => (count.value = 5), 1000);\n</script>\n\n<!-- Child.vue -->\n<script setup>\nconst count = inject('count');\n</script>\n<template>{{ count }}</template>",
      options: ['5', '0', 'undefined', 'Сначала 0, потом 5'],
      answer: 1,
      explain: 'Провайдится **число** `0`, а не ref: `provide/inject` сам по себе не реактивен. Нужно `provide(\'count\', readonly(count))` — тогда ребёнок увидит обновление, а мутации останутся у провайдера.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Чем `provide`/`inject` с реактивным значением отличается от React Context?',
      options: [
        'Ничем — при изменении перерендериваются все потребители',
        'Обновляются только компоненты, которые реально читают изменившееся свойство; провайдер не нужен в разметке',
        'inject работает только в Options API',
        'provide/inject всегда копирует значение при передаче',
      ],
      answer: 1,
      explain: 'Через inject приходит ссылка на тот же ref/reactive, а зависимости трекаются при чтении. Поэтому нет массового ререндера потребителей, как при смене value у Context.Provider.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Нужно ли импортировать `defineProps`, `defineEmits`, `defineModel`?',
      options: [
        'Да, из `vue`',
        'Да, из `@vue/compiler-sfc`',
        'Нет: это макросы компилятора, доступные только в `<script setup>`, в рантайме их нет',
        'Нет, они глобальные функции рантайма',
      ],
      answer: 2,
      explain: 'Макросы обрабатываются при компиляции SFC и заменяются на опции компонента (`props`, `emits`). Импорт не нужен (ESLint-плагин знает о них как о глобалах), вне `<script setup>` они не работают.',
    },
    {
      type: 'single', level: 'senior',
      q: 'Почему composable обычно возвращает plain-объект с refs, а не `reactive({...})`?',
      options: [
        'reactive нельзя возвращать из функций',
        'Потребитель сможет деструктурировать результат и переименовать поля без потери реактивности',
        'Plain-объект быстрее сериализуется при SSR',
        'Так требует TypeScript',
      ],
      answer: 1,
      explain: '`const { x: mouseX } = useMouse()` — refs переживают деструктуризацию. Если нужен объект, потребитель может сам обернуть: `reactive(useMouse())` развернёт refs.',
    },
    {
      type: 'single', level: 'middle',
      q: 'Можно ли вызывать composable внутри `if` в `<script setup>`?',
      options: [
        'Нельзя — правила порядка хуков как в React',
        'Можно, если вызов синхронный (до `await`), чтобы хуки жизненного цикла привязались к текущему инстансу',
        'Можно только в Options API',
        'Можно только внутри `onMounted`',
      ],
      answer: 1,
      explain: 'Во Vue нет «правил хуков» по порядку: `setup` выполняется один раз, состояние не хранится в списке по индексу вызова. Ограничение одно — синхронность относительно текущего инстанса.',
    },
    {
      type: 'open', level: 'lead',
      q: 'Как вы организуете composables в большом приложении (структура, соглашения, ревью), чтобы они не превратились в «миксины 2.0»?',
      answer: 'Структура: общие composables в `shared/composables` (без знания о домене), доменные — рядом с фичей. Соглашения: имя `useXxx`; параметры `MaybeRefOrGetter` + `toValue`; возврат plain-объекта refs; явный cleanup (`onScopeDispose`); никаких скрытых глобальных синглтонов (для SSR — только через `provide`/Pinia); DOM — только в `onMounted`. Один composable — одна ответственность, композиция через вызов других composables, а не через неявные общие поля. Предпочитать VueUse готовым велосипедам. Ревью: тесты как функций (или через host-компонент), типы без `any`, документированный контракт. Это фиксируется в гайдлайне/ADR и lint-правилах.',
    },
  ],
  tasks: [
    {
      title: 'provide/inject по дереву инстансов',
      level: 'senior',
      prompt: 'Смоделируйте механизм `provide`/`inject` Vue без DOM.\n\n`createInstance(parent?)` возвращает объект `{ provide(key, value), inject(key, defaultValue?, treatDefaultAsFactory?) }`:\n- `inject` ищет значение у **предков** (ближайший выигрывает); то, что компонент провайдит сам, ему через `inject` не видно;\n- если ключ не найден: вернуть `defaultValue`; если `treatDefaultAsFactory === true` и default — функция, вызвать её;\n- ключи могут быть строками или Symbol;\n- провайд ребёнка не влияет на родителя и «соседей».\n\nПодсказка: Vue создаёт `provides` ребёнка лениво через `Object.create(parentProvides)` — поиск идёт по цепочке прототипов.',
      starter: 'function createInstance(parent) {\n  // ваш код\n}',
      solution: `function createInstance(parent) {
  const parentProvides = parent ? parent._provides : Object.create(null);
  const instance = {
    _parent: parent ?? null,
    _provides: parentProvides, // пока ничего не провайдили — делим объект с родителем
    provide(key, value) {
      if (instance._provides === parentProvides) {
        instance._provides = Object.create(parentProvides); // лениво: своя «ветка» цепочки
      }
      instance._provides[key] = value;
    },
    inject(key, defaultValue, treatDefaultAsFactory = false) {
      const source = instance._parent ? instance._parent._provides : null;
      if (source && key in source) return source[key];
      if (arguments.length > 1) {
        return treatDefaultAsFactory && typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
      return undefined;
    },
  };
  return instance;
}`,
      notes: 'Цепочка прототипов даёт поиск ближайшего предка за O(глубина) без явного обхода, а ленивое создание объекта экономит память: большинство компонентов ничего не провайдят. Реальный Vue ещё предупреждает, если `inject` вызван вне `setup` или ключ не найден без default. Для типобезопасности ключей — `InjectionKey<T>` (Symbol).',
      tests: [
        { name: 'ребёнок видит значение родителя', code: 'const root = createInstance();\nroot.provide("theme", "dark");\nconst child = createInstance(root);\nreturn child.inject("theme") === "dark";' },
        { name: 'внук и переопределение в середине', code: 'const root = createInstance();\nroot.provide("theme", "dark");\nconst mid = createInstance(root);\nmid.provide("theme", "light");\nconst leaf = createInstance(mid);\nconst sibling = createInstance(root);\nreturn leaf.inject("theme") === "light" && sibling.inject("theme") === "dark" && mid.inject("theme") === "dark";' },
        { name: 'свой provide не виден себе', code: 'const root = createInstance();\nconst a = createInstance(root);\na.provide("k", 1);\nreturn a.inject("k", "none") === "none";' },
        { name: 'default и фабрика', code: 'const root = createInstance();\nconst c = createInstance(root);\nlet calls = 0;\nconst v = c.inject("missing", () => { calls++; return { n: 1 }; }, true);\nreturn c.inject("missing", 42) === 42 && v.n === 1 && calls === 1 && c.inject("missing") === undefined;' },
        { name: 'Symbol-ключ', code: 'const Key = Symbol("ctx");\nconst root = createInstance();\nroot.provide(Key, { ok: true });\nconst c = createInstance(createInstance(root));\nreturn c.inject(Key).ok === true;' },
      ],
    },
    {
      title: 'Mini-emitter для compound-компонентов',
      level: 'middle',
      prompt: 'Провайдер compound-компонента (`<Tabs>`, `<Form>`) часто отдаёт через `provide` маленькую шину событий. Реализуйте `createEmitter()` в духе `mitt`:\n- `on(type, handler)` — подписка, **возвращает функцию отписки**;\n- `off(type, handler)`;\n- `emit(type, payload)` — вызывает обработчики в порядке подписки; обработчики `\'*\'` получают `(type, payload)`;\n- `once(type, handler)` — сработать один раз;\n- отписка внутри обработчика во время `emit` не должна ломать обход.',
      starter: 'function createEmitter() {\n  return {\n    on(type, handler) {},\n    off(type, handler) {},\n    once(type, handler) {},\n    emit(type, payload) {},\n  };\n}',
      solution: `function createEmitter() {
  const handlers = new Map(); // type -> массив обработчиков

  const off = (type, handler) => {
    const list = handlers.get(type);
    if (!list) return;
    handlers.set(type, list.filter((h) => h !== handler && h.original !== handler));
  };

  const on = (type, handler) => {
    handlers.set(type, [...(handlers.get(type) ?? []), handler]);
    return () => off(type, handler);
  };

  const once = (type, handler) => {
    const wrapper = (...args) => {
      off(type, wrapper);
      handler(...args);
    };
    wrapper.original = handler; // чтобы off(type, handler) снимал и once-подписку
    return on(type, wrapper);
  };

  const emit = (type, payload) => {
    [...(handlers.get(type) ?? [])].forEach((h) => h(payload));
    if (type !== '*') [...(handlers.get('*') ?? [])].forEach((h) => h(type, payload));
  };

  return { on, off, once, emit };
}`,
      notes: 'Иммутабельные массивы обработчиков и копия при `emit` делают безопасной отписку во время обхода. В компоненте подписку снимают в `onUnmounted`/`onScopeDispose`. Для глобальной шины в Vue 3 больше нет `$on` — используют `mitt`/свой emitter, но чаще лучше явные props/emits или стор.',
      tests: [
        { name: 'on/emit по порядку', code: 'const e = createEmitter();\nconst log = [];\ne.on("a", (p) => log.push("1:" + p));\ne.on("a", (p) => log.push("2:" + p));\ne.emit("a", "x");\nreturn log.join() === "1:x,2:x";' },
        { name: 'отписка через возвращаемую функцию и off', code: 'const e = createEmitter();\nlet n = 0;\nconst h = () => n++;\nconst un = e.on("a", h);\ne.emit("a");\nun();\ne.emit("a");\ne.on("b", h);\ne.off("b", h);\ne.emit("b");\nreturn n === 1;' },
        { name: 'once', code: 'const e = createEmitter();\nlet n = 0;\ne.once("a", () => n++);\ne.emit("a");\ne.emit("a");\nreturn n === 1;' },
        { name: 'wildcard', code: 'const e = createEmitter();\nconst log = [];\ne.on("*", (type, p) => log.push(type + "=" + p));\ne.emit("save", 1);\ne.emit("close", 2);\nreturn log.join() === "save=1,close=2";' },
        { name: 'отписка во время emit', code: 'const e = createEmitter();\nconst log = [];\nconst un = e.on("a", () => { log.push(1); un(); });\ne.on("a", () => log.push(2));\ne.emit("a");\ne.emit("a");\nreturn log.join() === "1,2,2";' },
      ],
    },
    {
      title: 'Компонент Counter: defineModel, defineEmits, defineExpose',
      level: 'middle',
      lang: 'vue',
      prompt: 'Напишите `<script setup lang="ts">`-компонент `Counter`:\n- `v-model` (число, по умолчанию 0) через `defineModel`, ограничение `min`/`max` из props;\n- типизированное событие `limit` с аргументом `\'min\' | \'max\'`, когда значение упирается в границу;\n- метод `reset()`, доступный родителю через template ref;\n- кнопки `−`/`+` с `aria-label`, disabled на границах.',
      starter: '<script setup lang="ts">\n// ваш код\n</script>\n\n<template>\n</template>',
      solution: `<script setup lang="ts">
const { min = 0, max = 10 } = defineProps<{ min?: number; max?: number }>();
const emit = defineEmits<{ limit: [edge: 'min' | 'max'] }>();
const count = defineModel<number>({ default: 0 });

function change(delta: number) {
  const next = Math.min(max, Math.max(min, count.value + delta));
  count.value = next;                       // эмитит update:modelValue
  if (next === min) emit('limit', 'min');
  if (next === max) emit('limit', 'max');
}

function reset() {
  count.value = min;
}

defineExpose({ reset });
</script>

<template>
  <div class="counter">
    <button type="button" aria-label="Уменьшить" :disabled="count <= min" @click="change(-1)">−</button>
    <output aria-live="polite">{{ count }}</output>
    <button type="button" aria-label="Увеличить" :disabled="count >= max" @click="change(1)">+</button>
  </div>
</template>

<!-- Родитель:
<script setup lang="ts">
const value = ref(3);
const counter = useTemplateRef<InstanceType<typeof Counter>>('counter');
</script>
<Counter ref="counter" v-model="value" :max="5" @limit="edge => console.info(edge)" />
<button @click="counter?.reset()">Сбросить</button>
-->`,
      notes: 'Деструктуризация `defineProps` с дефолтами реактивна в 3.5. Без `defineExpose` родитель не увидит `reset`. Если родитель не передал `v-model`, `count` работает как локальное состояние. Обсудить: почему ограничение значения лучше держать в ребёнке (инвариант компонента) и как это тестировать (`mount` + `onUpdate:modelValue`).',
    },
  ],
});
