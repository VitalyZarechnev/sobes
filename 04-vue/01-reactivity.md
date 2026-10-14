# Реактивность

> ⏱ ~3 ч · 🎯 Объяснить устройство реактивности Vue 3 на уровне `track`/`trigger`/`effect`, уметь написать её упрощённую версию, осознанно выбирать `ref`/`reactive`/`shallowRef`/`computed`/`watch` и обходить ловушки потери реактивности.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу нарисовать структуру `targetMap: WeakMap<target, Map<key, Dep>>`
- [ ] Объясняю, почему `computed` ленивый и как работает кэш
- [ ] Различаю `watch`/`watchEffect`, знаю `flush`, `deep`, `once`, `onWatcherCleanup`
- [ ] Знаю ограничения Vue 2 (`defineProperty`) и как их снял Proxy
- [ ] Знаю все способы потерять реактивность и как их чинить (`toRefs`, `toRef`, геттеры)

## Теория

### Идея: зависимости отслеживаются в рантайме

Vue — **push-pull реактивность с автоматическим отслеживанием зависимостей**. Во время выполнения «эффекта» (рендер компонента, `computed`, `watchEffect`) каждое чтение реактивного свойства **записывает** (track) этот эффект как подписчика свойства. При записи свойства Vue **запускает** (trigger) всех подписчиков. В отличие от React, где компонент перерендерится целиком при `setState`, Vue точно знает, **какой компонент** зависит от **какого поля**.

### Proxy: как устроен reactive()

```ts
// Упрощённая модель (из официального гида «Reactivity in Depth»)
type Dep = Set<ReactiveEffect>;
const targetMap = new WeakMap<object, Map<PropertyKey, Dep>>();
let activeEffect: ReactiveEffect | null = null;

function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key);
      const value = Reflect.get(obj, key, receiver);
      // ленивая глубокая реактивность: вложенный объект оборачивается при доступе
      return value !== null && typeof value === 'object' ? reactive(value) : value;
    },
    set(obj, key, value, receiver) {
      const old = Reflect.get(obj, key, receiver);
      const result = Reflect.set(obj, key, value, receiver);
      if (!Object.is(old, value)) trigger(obj, key);
      return result;
    },
    // в реальности также: has (key in obj), deleteProperty, ownKeys (for...in, Object.keys)
  });
}

function track(target: object, key: PropertyKey) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
}

function trigger(target: object, key: PropertyKey) {
  targetMap.get(target)?.get(key)?.forEach(effect => effect.scheduler ? effect.scheduler() : effect.run());
}
```

Важные детали реализации:
- `WeakMap` по target — объекты собираются сборщиком мусора, когда на них нет ссылок.
- Прокси **кэшируются** (`reactiveMap: WeakMap<target, proxy>`): `reactive(obj) === reactive(obj)`. Но `reactive(obj) !== obj` — работать нужно с прокси, оригинал не отслеживается.
- Для массивов перехватываются методы (`push`, `includes`, `indexOf`...): мутирующие методы не трекают `length` (иначе бесконечный цикл), поисковые ищут и по сырым значениям.
- `Map`/`Set`/`WeakMap`/`WeakSet` обрабатываются отдельными «collection handlers» — у них внутренние слоты, Proxy-ловушки `get/set` не срабатывают для `map.set()`.
- Специальный ключ `ITERATE_KEY` отслеживает итерацию: добавление нового свойства триггерит `for...in`/`Object.keys`.
- В **Vue 3.5** система реактивности переписана: зависимости хранятся двусвязными списками и счётчиками версий (идея из preact-signals / alien-signals), что дало до ~56% экономии памяти и ускорение массивов; `computed` стали полноценными подписчиками. Модель `track/trigger` для объяснения остаётся корректной.

### effect: эффекты и планировщик

```ts
class ReactiveEffect {
  deps: Dep[] = [];
  constructor(public fn: () => void, public scheduler?: () => void) {}
  run() {
    cleanup(this);           // отписаться от старых зависимостей — набор может измениться (условия!)
    const prev = activeEffect;
    activeEffect = this;     // стек для вложенных эффектов
    try { return this.fn(); } finally { activeEffect = prev; }
  }
}
```

- Зависимости **пересобираются на каждом запуске**: если ветка `if` не выполнилась, свойство из неё больше не отслеживается. Это и есть «динамические зависимости» — без массивов deps, как в React.
- Рендер компонента — это `ReactiveEffect` с планировщиком, который ставит обновление в **очередь** (`queueJob`), а не выполняет сразу. Отсюда батчинг и `nextTick` (см. [03](03-components-and-rendering.md)).

### ref vs reactive

```ts
const count = ref(0);            // { value } — RefImpl с get/set value
const state = reactive({ n: 0 }); // Proxy

count.value++;
state.n++;
```

`ref` — объект с геттером/сеттером `value` (не Proxy). Если в `ref` положить объект, его `value` станет `reactive(obj)`.

| | `ref` | `reactive` |
|---|---|---|
| Типы | любые, включая примитивы | только объекты, массивы, Map/Set |
| Доступ | `.value` (в шаблоне автоматически разворачивается) | напрямую |
| Переприсваивание целиком | `r.value = newObj` — работает | `state = newObj` — теряет связь |
| Деструктуризация | ref передаётся как есть | теряет реактивность |
| Передача в функции | сохраняет реактивность | сохраняет, но не для отдельных свойств |

Официальная рекомендация — **`ref` как основной примитив**: единообразно, явно видно реактивное значение (`.value`), можно переприсваивать, не ломается при передаче.

Auto-unwrapping: ref разворачивается в шаблоне (только верхнего уровня), как свойство `reactive`-объекта, но **не** в элементах реактивного массива и `Map`:

```ts
const list = reactive([ref(1)]);
list[0].value; // нужен .value
const obj = reactive({ c: ref(1) });
obj.c;         // 1 — развёрнут
```

### Ловушки потери реактивности

```ts
const state = reactive({ count: 0, user: { name: 'Ann' } });

// 🪤 1. Деструктуризация — получаем примитив-копию
let { count } = state;
count++; // state.count не изменится, и изменения state не отразятся на count

// 🪤 2. Передача примитива в функцию
useSomething(state.count); // передано число 0, а не реактивная связь

// 🪤 3. Переприсваивание reactive
let s = reactive({ a: 1 });
s = reactive({ a: 2 }); // компоненты, использующие старый прокси, не обновятся

// 🪤 4. Деструктуризация props (до 3.5 — ломала реактивность)
```

Лечение:

```ts
import { toRefs, toRef, toValue } from 'vue';

const { count, user } = toRefs(state);  // каждый — ref, связанный с полем
count.value++;                          // меняет state.count

const countRef = toRef(state, 'count'); // одно поле
const getter = toRef(() => props.id);   // readonly ref из геттера (3.3+)

// Передавать в composable геттер или ref, внутри нормализовать через toValue
function useUser(id: MaybeRefOrGetter<string>) {
  watchEffect(() => fetchUser(toValue(id)));
}
useUser(() => props.id);
```

**Vue 3.5: Reactive Props Destructure** стабилизирован — в `<script setup>` `const { id, size = 'md' } = defineProps<...>()` остаётся реактивным: компилятор переписывает обращения к `id` на `props.id`. Но передавать `id` в composable всё равно нужно как геттер: `useUser(() => id)` (компилятор предупредит при `watch(id, ...)`).

### computed

```ts
const firstName = ref('Ann');
const lastName = ref('Lee');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// writable computed
const full = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: v => { [firstName.value, lastName.value] = v.split(' '); },
});
```

Устройство:
- **Ленивый**: геттер не вызывается, пока никто не прочитал `.value`.
- **Кэш + dirty-флаг**: при изменении зависимости computed не пересчитывается сразу, а помечается «грязным» и уведомляет своих подписчиков. Пересчёт — при следующем чтении.
- С 3.4 computed уведомляет подписчиков **только если результат реально изменился** (сравнение `Object.is`). Отсюда приём: computed, возвращающий примитив/булево, гасит лишние ререндеры.
- 3.4+: в геттере доступно предыдущее значение `computed(prev => ...)` — можно вернуть старый объект, если содержимое не изменилось.

🪤 Ловушка: побочные эффекты и асинхронность в computed. Геттер должен быть чистым и синхронным. Для асинхронного — `watch` + `ref` или `computedAsync` из VueUse.

🪤 Ловушка: computed, возвращающий новый объект/массив каждый раз, всегда «изменён» → потребители обновляются.

💡 На собеседовании: «`computed` — это одновременно подписчик (на свои зависимости) и источник (для тех, кто его читает). Ленивость + кэш делают его дешевле метода: метод в шаблоне вызывается на каждый ререндер».

### watch vs watchEffect

```ts
// watch: явный источник, ленивый по умолчанию, даёт new/old
watch(() => route.params.id, async (id, oldId, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());   // или onWatcherCleanup() в 3.5
  user.value = await fetchUser(id, controller.signal);
}, { immediate: true });

// watchEffect: зависимости собираются автоматически, запускается сразу
watchEffect(async onCleanup => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  // 🪤 только синхронно прочитанные до первого await свойства отслеживаются!
  data.value = await fetch(`/api/items?q=${query.value}`, { signal: controller.signal }).then(r => r.json());
});
```

| | `watch` | `watchEffect` |
|---|---|---|
| Источник | явный (ref, reactive, геттер, массив) | автоматически из тела |
| Первый запуск | лениво (или `immediate: true`) | сразу |
| Старое значение | да | нет |
| Отслеживание после `await` | не важно (источник отдельно) | теряется |

Опции:
- `deep: true | number` — глубина обхода (число — с 3.5). `watch(reactiveObj)` глубокий по умолчанию.
- `flush`: `'pre'` (по умолчанию — до обновления DOM компонента), `'post'` (после — доступ к обновлённому DOM; `watchPostEffect`), `'sync'` (синхронно при каждом изменении — дорого, без батчинга).
- `once: true` (3.4+) — сработать один раз.
- Остановка: `const stop = watch(...)`; `stop()`. Вотчеры, созданные синхронно в `setup`, останавливаются автоматически при размонтировании; созданные асинхронно (после `await`) — нет, их надо останавливать вручную.
- 3.5: `onWatcherCleanup()` вызывается внутри колбэка (синхронно), а `stop` имеет `pause()`/`resume()`.

🪤 Ловушка: `watch(state.count, ...)` — передан примитив, а не источник. Нужно `watch(() => state.count, ...)`.

### Shallow-API и escape hatches

- `shallowRef(obj)` — реактивно только `.value` (переприсваивание), вложенные изменения не отслеживаются. Для больших иммутабельных структур, внешних инстансов (карта, редактор), данных, приходящих целиком с сервера. `triggerRef(r)` — вручную уведомить после мутации.
- `shallowReactive` — реактивен только первый уровень.
- `markRaw(obj)` — никогда не превращать в прокси (сторонние классы, большие библиотеки).
- `toRaw(proxy)` — получить оригинал (чтение без трекинга, передача в сторонние API).
- `readonly` / `shallowReadonly` — защита (props внутри компонента — shallowReadonly).
- `customRef(track, trigger)` — свой ref, например debounced.
- `effectScope()` — сгруппировать эффекты и остановить разом (основа Pinia и композаблов вне компонентов).

```ts
function useDebouncedRef<T>(value: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return customRef<T>((track, trigger) => ({
    get() { track(); return value; },
    set(v) {
      clearTimeout(timer);
      timer = setTimeout(() => { value = v; trigger(); }, delay);
    },
  }));
}
```

### Vue 2 (defineProperty) vs Vue 3 (Proxy)

| | Vue 2 | Vue 3 |
|---|---|---|
| Механизм | `Object.defineProperty` геттеры/сеттеры на каждое поле | `Proxy` на объект |
| Новые свойства | не отслеживаются → `Vue.set` / `this.$set` | отслеживаются |
| Удаление | `Vue.delete` | `delete obj.key` работает |
| Массивы | индекс и `length` не отслеживаются, патч методов прототипа | всё работает |
| Map/Set | не поддерживаются | поддерживаются |
| Инициализация | рекурсивный обход всего объекта сразу | лениво, при доступе |
| Идентичность | мутирует исходный объект | прокси ≠ оригинал |
| Поддержка браузеров | IE9+ | без IE11 (Proxy не полифиллится) |

Vue 2 EOL — 31 декабря 2023.

## Вопросы с собеседований

<details><summary>Как работает реактивность Vue 3?</summary>

`reactive` оборачивает объект в Proxy. В `get` вызывается `track` — текущий активный эффект добавляется в Dep этого свойства (`WeakMap<target, Map<key, Dep>>`). В `set` — `trigger` запускает подписчиков, у компонентного эффекта — через планировщик в очередь. Зависимости пересобираются на каждом запуске эффекта. `ref` — объект с get/set `value`, внутри тот же track/trigger. В 3.5 внутренности переписаны на версии и связные списки.
</details>

<details><summary>ref или reactive — что использовать?</summary>

Рекомендация — `ref` по умолчанию: работает с примитивами, можно переприсваивать, переживает деструктуризацию и передачу в функции, явно виден `.value`. `reactive` удобен для локального объекта формы, но легко потерять реактивность деструктуризацией/переприсваиванием.
</details>

<details><summary>Почему деструктуризация reactive теряет реактивность и как исправить?</summary>

Деструктуризация читает значение свойства один раз и кладёт примитив в переменную — связь с Proxy пропадает. Исправить: `toRefs`/`toRef`, использовать геттеры `() => state.x`, не деструктурировать. Для props в 3.5 компилятор делает деструктуризацию реактивной.
</details>

<details><summary>Чем computed отличается от метода и от watch?</summary>

Computed — производное значение: ленивое, кэшируется до изменения зависимостей, уведомляет только при реальном изменении результата. Метод вызывается на каждом рендере. Watch — для побочных эффектов в ответ на изменение (запросы, логирование, DOM), ничего не возвращает.
</details>

<details><summary>watch vs watchEffect?</summary>

`watch` — явный источник, ленивый, даёт новое/старое значение, точный контроль. `watchEffect` — автосбор зависимостей, сразу запускается, удобен когда зависимостей много; но после первого `await` зависимости не отслеживаются. Оба поддерживают cleanup и `flush`.
</details>

<details><summary>Что такое flush у вотчеров?</summary>

Момент запуска колбэка относительно обновления компонента: `pre` (по умолчанию, до патча DOM — видны старые элементы), `post` (после — доступ к обновлённому DOM), `sync` (сразу при изменении, без батчинга — может вызываться много раз).
</details>

<details><summary>Какие ограничения были у реактивности Vue 2?</summary>

Невозможность отследить добавление/удаление свойств и изменения по индексу/длине массива — нужны `Vue.set`/`Vue.delete`; нет Map/Set; рекурсивная инициализация всего объекта — дорого для больших данных. Proxy снял эти ограничения, сделал инициализацию ленивой.
</details>

<details><summary>Когда использовать shallowRef/markRaw?</summary>

Для больших структур, заменяемых целиком (ответ API, иммутабельные данные), и для внешних объектов (инстанс карты, редактора, класса из SDK), которые не должны превращаться в прокси — это экономит память и время, предотвращает поломки сторонних библиотек (приватные поля `#x` не работают через Proxy).
</details>

<details><summary>Почему reactive(obj) !== obj и чем это опасно?</summary>

Proxy — отдельный объект. Изменения через оригинал не отслеживаются; сравнение по ссылке (`includes`, `Set.has`) оригинала и прокси даёт `false`. Нужно работать только с прокси; `toRaw` — для сравнения/передачи наружу.
</details>

<details><summary>Как Vue избегает бесконечных циклов в эффектах?</summary>

Эффект не триггерит сам себя во время выполнения (проверка `effect !== activeEffect`, флаг `allowRecurse` для компонентов), планировщик дедуплицирует задания в очереди, есть лимит рекурсивных обновлений (`RECURSION_LIMIT` = 100) с предупреждением.
</details>

## Практика

**1. Предскажи вывод.**

```ts
const state = reactive({ a: 1, b: 2 });
const sum = computed(() => { console.log('compute'); return state.a + state.b; });
state.a = 10;
state.b = 20;
console.log(sum.value);
console.log(sum.value);
```

<details><summary>Решение</summary>

`compute`, `30`, `30`. До первого чтения геттер не вызывается (лениво), изменения лишь помечают его грязным; второе чтение берёт кэш.
</details>

**2. Найди баг.**

```ts
const props = defineProps<{ userId: string }>();
const { userId } = props;          // скрипт без деструктуризации компилятором
watch(userId, id => load(id));
```

<details><summary>Решение</summary>

`watch` получил строку, а не источник; к тому же при обычной деструктуризации объекта props (не в `defineProps` напрямую) значение «заморожено». Нужно `watch(() => props.userId, load, { immediate: true })`. При деструктуризации прямо из `defineProps` в 3.5 — тоже `watch(() => userId, ...)`.
</details>

**3. Реализуй** `computed` на базе `effect` с планировщиком.

<details><summary>Решение</summary>

```ts
function computed<T>(getter: () => T) {
  let value: T;
  let dirty = true;
  const runner = new ReactiveEffect(getter, () => {
    if (!dirty) { dirty = true; trigger(obj, 'value'); } // уведомить своих подписчиков
  });
  const obj = {
    get value() {
      track(obj, 'value');               // кто читает computed — подписывается
      if (dirty) { value = runner.run() as T; dirty = false; }
      return value;
    },
  };
  return obj;
}
```
</details>

## Источники
- https://vuejs.org/guide/extras/reactivity-in-depth.html
- https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- https://vuejs.org/guide/essentials/computed.html
- https://vuejs.org/guide/essentials/watchers.html
- https://vuejs.org/api/reactivity-core.html
- https://vuejs.org/api/reactivity-utilities.html
- https://vuejs.org/api/reactivity-advanced.html
- https://blog.vuejs.org/posts/vue-3-5
- https://v2.vuejs.org/v2/guide/reactivity.html
