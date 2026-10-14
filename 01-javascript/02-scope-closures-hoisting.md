# Области видимости, замыкания, hoisting

> ⏱ ~3 ч · 🎯 Объяснять замыкания через модель лексического окружения из спецификации (а не «функция помнит переменные»), понимать TDZ и per-iteration bindings, видеть утечки памяти через замыкания и stale closures.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу нарисовать цепочку Environment Record для вложенных функций
- [ ] Понимаю, что именно «поднимается» у `var`, `let`/`const`, `class`, function declaration
- [ ] Могу объяснить, почему `let` в `for` чинит классическую задачу с `setTimeout`
- [ ] Знаю, как V8 хранит захваченные переменные и почему замыкания текут «за компанию»

## Теория

### Лексическое окружение (Lexical Environment)

В спецификации это **Environment Record** + ссылка `[[OuterEnv]]` на внешнее окружение. Виды записей:

| Record | Когда создаётся | Что хранит |
|---|---|---|
| Global | Один на realm | Object Record (`var`, function declarations → свойства `globalThis`) + Declarative Record (`let`/`const`/`class` — **не** свойства `globalThis`) |
| Module | На каждый ES-модуль | Привязки модуля, включая immutable import bindings |
| Function | На каждый вызов | Параметры, `var`, `let`/`const` тела функции, `this`, `arguments` |
| Declarative | На блок `{}`, `catch`, итерацию цикла | `let`, `const`, `class`, функции блока |

Каждая функция при **создании** получает внутренний слот `[[Environment]]` — ссылку на окружение, где она объявлена. При вызове создаётся новый Function Environment, чей `[[OuterEnv]]` = `[[Environment]]` функции. Поиск идентификатора идёт вверх по цепочке `[[OuterEnv]]` до глобального окружения.

**Замыкание (closure)** — это функция + её `[[Environment]]`. В JS замыканиями являются все функции; интересно это становится, когда функция переживает вызов, в котором создана.

```js
function makeCounter() {
  let count = 0;                 // живёт в Function Environment вызова makeCounter
  return {
    inc: () => ++count,          // обе стрелки ссылаются на ОДНО окружение
    get: () => count,
  };
}
const a = makeCounter();
const b = makeCounter();         // новый вызов — новое окружение, независимый count
a.inc(); a.inc();
console.log(a.get(), b.get());   // 2 0
```

💡 На собеседовании: «Замыкание захватывает не значения, а привязки (bindings). Поэтому две функции из одного вызова видят изменения друг друга, а функция, созданная в цикле с `var`, видит финальное значение».

Область видимости в JS **лексическая (статическая)**: определяется местом в исходном коде, а не местом вызова. Исключения, ломающие статический анализ, — `with` и прямой `eval` (sloppy mode); движок из-за них деоптимизирует всю цепочку.

### Hoisting: что на самом деле происходит

Перед выполнением тела (функции, скрипта, модуля) движок выполняет **instantiation**: проходит по объявлениям и создаёт привязки.

| Объявление | Создаётся привязка | Инициализация | Обращение до строки объявления |
|---|---|---|---|
| `var x` | Да, в Function/Global Record | Сразу `undefined` | `undefined` |
| `function f(){}` | Да | Сразу функцией | Работает |
| `let` / `const` | Да, в ближайшем блоке | Только при выполнении объявления | `ReferenceError` (TDZ) |
| `class C {}` | Да, как `let` | При выполнении | `ReferenceError` |
| `import` | Да, в Module Record | До выполнения модуля (live binding) | Работает (кроме циклов, где экспорт ещё в TDZ) |

**TDZ (Temporal Dead Zone)** — интервал от входа в блок до выполнения объявления. Ключевое слово — *temporal*: важен порядок выполнения, а не положение в тексте.

```js
function read() { return value; }  // ссылка на value есть, но доступ — в момент вызова
// read();                         // ReferenceError: value в TDZ
let value = 1;
read();                            // 1 — TDZ уже закончилась

let x = x + 1;                     // ReferenceError: правая часть читает x в TDZ
function f(a = b, b = 1) {}        // f() → ReferenceError: параметры тоже имеют TDZ
```

Зачем TDZ: чтобы `const` никогда не наблюдался в двух состояниях (`undefined` и значение), и чтобы ошибки порядка инициализации были громкими.

🪤 Ловушка: function declaration внутри блока в sloppy mode (Annex B спецификации) ведёт себя гибридно: функция видна в блоке как `let`, а во внешней функции — как `var` со значением `undefined` до выполнения блока. В strict mode и модулях — чисто блочная. Не объявляйте функции в `if` — используйте function expression.

### var vs let vs const

| | `var` | `let` | `const` |
|---|---|---|---|
| Область | Функция | Блок | Блок |
| Повторное объявление | Можно | `SyntaxError` | `SyntaxError` |
| Свойство `globalThis` на верхнем уровне скрипта | Да | Нет | Нет |
| Переприсваивание | Да | Да | `TypeError` |
| TDZ | Нет | Да | Да |

`const` запрещает переприсваивание привязки, а не мутацию объекта. Глубокая иммутабельность — `Object.freeze` (поверхностная!) рекурсивно, `readonly`-типы в TS или иммутабельные структуры.

### Циклы и per-iteration bindings

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```

С `var` есть одна привязка `i` на всю функцию — три стрелки замыкают её одну. С `let` спецификация (`CreatePerIterationEnvironment`) на каждой итерации создаёт **новое** окружение и копирует в него текущее значение `i` до инкремента. Поэтому каждое замыкание видит своё `i`. Для `for...of` / `for...in` свежая привязка создаётся тоже (с `const` в том числе).

Исторические обходы: IIFE `(function (j) { setTimeout(() => console.log(j)); })(i)` или третий аргумент `setTimeout(console.log, 0, i)`.

### IIFE и модульный паттерн

IIFE (Immediately Invoked Function Expression) до ES2015 давала приватную область и инкапсуляцию:

```js
const counterModule = (() => {
  let count = 0;                          // приватно
  return { inc: () => ++count };
})();
```

Сейчас роль выполняют ES-модули (своя область на файл) и блоки `{ }` с `let`/`const`. IIFE остаётся полезной для top-level `async` в скриптах (`(async () => { ... })()`) и для изоляции в inline-скриптах/бандлах (UMD).

### Как движок хранит захваченные переменные (V8)

Переменные, которые не захвачены ни одной внутренней функцией, живут на стеке/в регистрах и умирают с вызовом. Захваченные переносятся в объект **Context** в куче. Важный нюанс: **один Context на область видимости, общий для всех замыканий в ней**.

```js
function attach() {
  const huge = new Array(1e6).fill('*');   // захвачена logSize
  const logSize = () => console.log(huge.length);
  logSize();
  return () => console.log('tick');          // huge не использует, но...
}
const tick = attach();
// ...Context общий: пока жива tick, жив и huge, если хоть одна функция из области его захватывала.
// В V8 это поведение исторически приводило к утечкам (известный случай Meteor, 2013).
```

Как лечить: выносить тяжёлые данные из области, где создаются долгоживущие колбэки; обнулять ссылки (`huge = null`, тогда понадобится `let`); не держать большие объекты в замыканиях подписок/таймеров.

### Типичные утечки и баги через замыкания

- **Обработчики и подписки**: `window.addEventListener('resize', handler)`, где `handler` замыкает компонент/DOM. Без `removeEventListener` (или `AbortSignal` в опциях) компонент не соберётся.
- **Таймеры**: `setInterval` с замыканием на большой стейт живёт вечно до `clearInterval`.
- **Кэши в модульной области**: `const cache = new Map()` на уровне модуля + ключи-объекты → утечка; используйте `WeakMap`.
- **Stale closure** (React): `useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, [])` — колбэк навсегда видит `count` из первого рендера. Лечится функциональным апдейтом `setCount(c => c + 1)`, правильными deps или ref. Подробно — в [03. React](../03-react/).

Поиск таких утечек — в [07-modules-memory-gc.md](07-modules-memory-gc.md).

## Вопросы с собеседований

<details><summary>Что такое замыкание? Ответьте точнее, чем «функция, которая помнит переменные».</summary>

Замыкание — это функция вместе со ссылкой на лексическое окружение, в котором она была создана (внутренний слот `[[Environment]]`). При вызове новое окружение функции получает внешней ссылкой именно его. Захватываются привязки, а не значения: изменения видны всем замыканиям одной области. Применения: инкапсуляция приватного состояния, фабрики, частичное применение и каррирование, мемоизация, debounce/throttle, хуки React. Для senior стоит добавить про стоимость: захваченные переменные живут в куче, Context разделяется между замыканиями, что может удерживать память.
</details>

<details><summary>Что такое hoisting? Поднимаются ли let и const?</summary>

Hoisting — это следствие того, что привязки создаются на этапе instantiation окружения, до выполнения кода. `let`/`const`/`class` тоже «поднимаются» в смысле создания привязки (поэтому внутренняя `let x` затеняет внешнюю `x` с самого начала блока), но остаются неинициализированными до строки объявления — TDZ. `var` инициализируется `undefined`, function declaration — сразу функцией.
</details>

<details><summary>Что выведет код и почему?</summary>

```js
let x = 1;
{
  console.log(x);
  let x = 2;
}
```

`ReferenceError`. Внутренняя `x` создана при входе в блок и затеняет внешнюю, но она в TDZ. Это доказывает, что `let` «поднимается».
</details>

<details><summary>Почему let в for-цикле даёт разные значения в колбэках?</summary>

Спецификация создаёт новое Declarative Environment на каждую итерацию (CreatePerIterationEnvironment) и копирует туда значение переменной. Инкремент выполняется уже в новом окружении. Каждый колбэк замыкает своё окружение. С `var` переменная одна на функцию.
</details>

<details><summary>Чем отличаются глобальные var и let?</summary>

На верхнем уровне классического скрипта `var` и function declaration становятся свойствами `globalThis` (Object Record), а `let`/`const`/`class` попадают в декларативную часть глобальной записи — они общие для всех скриптов страницы, но не свойства `window`. В модулях верхний уровень — Module Record, ни то ни другое не попадает в `globalThis`. Практическое следствие: `var name` в скрипте перезапишет `window.name` (который приводит всё к строке).
</details>

<details><summary>Как замыкания могут вызывать утечки памяти? Как это найти?</summary>

Замыкание удерживает всё своё окружение, а в V8 — общий Context области, включая переменные, захваченные соседними функциями. Если долгоживущий колбэк (подписка, таймер, обработчик на `window`, кэш) замыкает компонент, DOM-узел или большой массив, они не будут собраны. Поиск — heap snapshot в DevTools, сравнение снимков, поле Retainers покажет цепочку, в которой встречается `(closure)` / `context`. Лечение — отписки (`AbortController`), `WeakMap`, вынос данных из области.
</details>

<details><summary>Что такое stale closure и где она встречается?</summary>

Функция замкнула старую привязку или старое значение и продолжает его использовать после обновления. Классика — React хуки с неполными deps: эффект/колбэк видит state из рендера, в котором создан, ведь каждый рендер — новый вызов функции-компонента с новыми `const`. Решения: функциональные апдейты, корректные deps (правило `react-hooks/exhaustive-deps`), `useRef` для «последнего значения», `useEffectEvent` для логики событий внутри эффектов.
</details>

<details><summary>Зачем нужны IIFE сегодня?</summary>

Изначально — приватная область и избегание засорения глобала. Сейчас это делают модули и блоки. Остаются: top-level async в скриптах без поддержки модулей, однократная инициализация в выражении (`const config = (() => { ... })()`), UMD-обёртки, изоляция в инлайн-скриптах (например, скрипт выбора темы в `<head>` для избежания вспышки).
</details>

<details><summary>Почему with и eval считаются вредными для производительности?</summary>

Они делают область видимости динамической: компилятор не может статически разрешить идентификаторы (прямой `eval` может объявить `var` в текущей функции, `with` подмешивает свойства объекта в цепочку). Поэтому движок отключает оптимизации для всей функции и сохраняет все переменные в Context. В strict mode `with` запрещён, а `eval` получает собственную область для `var`. Косвенный eval (`(0, eval)(code)`) выполняется в глобальной области.
</details>

## Практика

**1. Предскажите вывод.**

```js
var a = 1;
function outer() {
  console.log(a);
  var a = 2;
  function inner() { console.log(a); }
  return inner;
}
outer()();

console.log(typeof foo, typeof bar);
var foo = function () {};
function bar() {}
```

<details><summary>Ответ</summary>

`undefined` (локальная `var a` поднялась и затеняет глобальную), затем `2` (inner замыкает окружение outer). Затем `undefined function`: `foo` — `var` со значением `undefined`, `bar` — function declaration.
</details>

**2. Реализуйте `once(fn)`: функция вызывается не более одного раза, последующие вызовы возвращают первый результат. Не держите `fn` в памяти после вызова.**

<details><summary>Решение</summary>

```js
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
      fn = null;            // отпускаем fn и всё, что она замыкает
    }
    return result;
  };
}
```
Edge-case: если `fn` бросила — повторный вызов вернёт `undefined`. Можно ставить `called = true` после успешного вызова, если нужна повторная попытка.
</details>

**3. Счётчик с приватным состоянием без классов: `inc`, `dec`, `reset`, `value`. Объясните, почему два счётчика независимы.**

<details><summary>Решение</summary>

```js
function createCounter(initial = 0) {
  let value = initial;
  return Object.freeze({
    inc: () => ++value,
    dec: () => --value,
    reset: () => (value = initial),
    get value() { return value; },
  });
}
```
Каждый вызов `createCounter` создаёт новое Function Environment — у каждого счётчика своя `value`.
</details>

**4. Почему этот код течёт и как исправить?**

```js
function setupWidget(el) {
  const bigData = loadHugeData();
  el.addEventListener('click', () => render(el, bigData));
  window.addEventListener('scroll', () => el.classList.toggle('sticky', scrollY > 100));
}
```

<details><summary>Решение</summary>

Обработчик на `window` живёт столько же, сколько страница, замыкает `el` и (через общий Context) `bigData`. После удаления виджета из DOM узел становится detached, но удерживается. Исправление — единый `AbortController`:

```js
function setupWidget(el) {
  const controller = new AbortController();
  const { signal } = controller;
  const bigData = loadHugeData();
  el.addEventListener('click', () => render(el, bigData), { signal });
  window.addEventListener('scroll', () => el.classList.toggle('sticky', scrollY > 100), { signal });
  return () => controller.abort();   // вызывать при уничтожении виджета
}
```
</details>

## Источники
- https://learn.javascript.ru/closure
- https://learn.javascript.ru/var
- https://learn.javascript.ru/global-object
- https://learn.javascript.ru/function-expressions
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
- https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
- https://tc39.es/ecma262/#sec-environment-records
- https://tc39.es/ecma262/#sec-createperiterationenvironment
