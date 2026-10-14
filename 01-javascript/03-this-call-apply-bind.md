# this, call / apply / bind, декораторы

> ⏱ ~2.5 ч · 🎯 Безошибочно определять `this` в любом месте вызова, объяснять приоритет правил и особенности bound-функций, писать декораторы-обёртки, которые корректно пробрасывают контекст и аргументы.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю 4 правила `this` и их приоритет + правило для стрелочных
- [ ] Понимаю, почему `(0, obj.method)()` теряет контекст, а `(obj.method)()` — нет
- [ ] Знаю поведение `bind` при повторном `bind` и при `new`
- [ ] Умею писать декораторы (caching, spy, debounce) с `apply`/`Reflect.apply`
- [ ] Знаю синтаксис стандартных декораторов (`@decorator`) TC39 / TS 5

## Теория

### this определяется в момент вызова

`this` — это не свойство функции и не её окружение (кроме стрелочных), а **неявный параметр вызова**. Одна и та же функция получает разный `this` в зависимости от того, *как* её вызвали.

Правила в порядке приоритета:

| # | Форма вызова | `this` |
|---|---|---|
| 1 | `new Fn()` | Новый объект, `[[Prototype]]` = `Fn.prototype` |
| 2 | `fn.call(ctx)`, `fn.apply(ctx)`, `fn.bind(ctx)()` | `ctx` (в sloppy mode `null`/`undefined` → `globalThis`, примитивы оборачиваются) |
| 3 | `obj.fn()`, `obj[key]()` | `obj` — объект слева от точки в момент вызова |
| 4 | `fn()` | `undefined` в strict mode, `globalThis` в sloppy |

Стрелочные функции не имеют своего `this` (а также `arguments`, `super`, `new.target`) — берут их из внешнего лексического окружения. `call`/`apply`/`bind` на `this` стрелки не влияют; вызвать стрелку через `new` нельзя (`TypeError`, у неё нет `[[Construct]]`).

Код классов и ES-модулей всегда strict. В модуле `this` на верхнем уровне — `undefined`, в CommonJS — `module.exports`, в классическом скрипте — `globalThis`.

### Почему теряется контекст: Reference Record

Выражение `obj.method` вычисляется в **Reference Record** {base: `obj`, name: `"method"`}. Вызов `ref()` берёт `this` из base. Любая операция, которая «разыменовывает» ссылку в значение, теряет base:

```js
'use strict';
const user = {
  name: 'Ann',
  greet() { return this?.name; },
};
user.greet();              // 'Ann'
(user.greet)();            // 'Ann' — скобки-группировка не разыменовывают
(0, user.greet)();         // undefined — оператор запятая вернул значение
const { greet } = user;
greet();                   // undefined — деструктуризация
setTimeout(user.greet);    // undefined (в браузере — this = window, т.к. таймер вызывает fn без контекста)
[1].map(user.greet);       // undefined — передали значение функции
(user.flag ? user.greet : null)(); // undefined — тернарник тоже разыменовывает
```

💡 На собеседовании: «`this` теряется всякий раз, когда метод передаётся как значение: колбэк, деструктуризация, присваивание. Лечится `bind`, стрелкой-обёрткой или стрелочным полем класса — и у каждого способа своя цена».

### Способы зафиксировать контекст

| Способ | Пример | Плюсы | Минусы |
|---|---|---|---|
| Стрелка-обёртка | `setTimeout(() => user.greet())` | Берёт актуальный `user` в момент вызова | Новая функция на каждое создание |
| `bind` | `setTimeout(user.greet.bind(user))` | Явно | Новая функция; ссылка для `removeEventListener` должна сохраняться |
| Стрелочное поле класса | `handle = () => this.x` | Не теряется никогда | Своя копия функции на **каждый экземпляр**, нет на прототипе → нельзя вызвать через `super.handle()`, сложно мокать через прототип |
| `bind` в конструкторе | `this.handle = this.handle.bind(this)` | Метод остаётся и на прототипе | Многословно |
| `thisArg` | `arr.map(fn, ctx)` | Без новых функций | Только для API, которые его принимают |

### call, apply, bind

```js
fn.call(ctx, a, b);            // аргументы списком
fn.apply(ctx, [a, b]);         // аргументы массивом (array-like)
const bound = fn.bind(ctx, a); // новая функция с зафиксированными this и первыми аргументами
Reflect.apply(fn, ctx, [a, b]); // как apply, но не зависит от fn.apply (его могли переопределить)
```

С появлением spread `apply` нужен реже: `Math.max(...arr)`. Но и `apply`, и spread упираются в лимит количества аргументов (зависит от движка, порядка десятков-сотен тысяч) — для огромных массивов `reduce`.

**Заимствование методов (method borrowing)**: `Array.prototype.join.call(arguments, ',')`, `Object.prototype.hasOwnProperty.call(obj, key)` (сейчас — `Object.hasOwn`).

**Особенности `bind`** — он создаёт **bound function exotic object** со слотами `[[BoundTargetFunction]]`, `[[BoundThis]]`, `[[BoundArguments]]`:

```js
function show() { return this.name; }
const a = show.bind({ name: 'A' });
const b = a.bind({ name: 'B' });
b();                         // 'A' — повторный bind не меняет this, только добавляет аргументы

function Point(x, y) { this.x = x; this.y = y; }
const P = Point.bind({ ignored: true }, 1);
const p = new P(2);          // { x: 1, y: 2 } — new игнорирует bound this, но оставляет частичные аргументы
p instanceof Point;          // true — у bound-функции нет prototype, instanceof смотрит на целевую
a.name;                      // 'bound show'
a.length;                    // 0 = max(0, show.length - число связанных аргументов)
```

### this в обработчиках и колбэках

- `el.addEventListener('click', function () { this })` — `this === event.currentTarget`. Со стрелкой — внешний `this`.
- `setTimeout(fn)` в браузере вызывает `fn` с `this = window` даже в strict-коде (так определено в HTML-спецификации), в Node — объект `Timeout`.
- `Array.prototype.forEach/map/filter` — второй аргумент `thisArg`.
- Getter/setter получают `this` = объект, через который к ним обратились (receiver), — это важно для Proxy и наследования (см. [06](06-objects-collections-iterators.md)).

### Декораторы-обёртки

Декоратор — функция, которая принимает функцию и возвращает новую с дополнительным поведением. Главное правило: **пробрасывать `this` и все аргументы**, иначе декоратор сломает методы.

```js
function cachingDecorator(fn, hash = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {          // обычная function, чтобы получить this вызова
    const key = hash(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args); // пробрасываем контекст
    cache.set(key, result);
    return result;
  };
}

const worker = {
  factor: 2,
  slow(x) { return x * this.factor; },
};
worker.slow = cachingDecorator(worker.slow);
worker.slow(3); // 6 — this корректен, потому что wrapper вызван как worker.slow(...)
```

🪤 Ловушка: если обёртку написать стрелкой, `this` будет из места создания декоратора, а не из вызова. Ещё одна ловушка — обёртка теряет `name`, `length` и собственные свойства исходной функции; при необходимости копируйте их через `Object.defineProperty`.

### Стандартные декораторы (TC39, TypeScript 5.0+)

Синтаксис `@decorator` для классов и их членов. Декоратор метода получает `(value, context)` и может вернуть замену:

```ts
function logged<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): R {
    console.log(`→ ${name}`, args);
    return target.apply(this, args);
  };
}

function bound(_: unknown, context: ClassMethodDecoratorContext) {
  context.addInitializer(function (this: any) {   // выполняется для каждого экземпляра
    this[context.name] = this[context.name].bind(this);
  });
}

class Api {
  @logged @bound
  fetchUser(id: string) { /* ... */ }
}
```

Отличия от legacy `experimentalDecorators` (Angular, старый MobX, NestJS): другая сигнатура (`target, key, descriptor` против `value, context`), нет декораторов параметров, иной порядок вычисления. Смешивать нельзя.

## Вопросы с собеседований

<details><summary>Перечислите правила определения this и их приоритет.</summary>

`new` → явная привязка (`call`/`apply`/`bind`) → неявная (метод объекта) → по умолчанию (`undefined` в strict, `globalThis` в sloppy). Стрелочные функции вне этой системы: `this` лексический. Важно, что `new` сильнее `bind`: bound-функция при вызове через `new` создаёт новый объект, игнорируя `[[BoundThis]]`. И что `bind` сильнее неявной привязки: `obj.m = f.bind(other); obj.m()` → `other`.
</details>

<details><summary>Что выведет и почему?</summary>

```js
const obj = {
  name: 'obj',
  regular() { return [this.name, (() => this.name)()]; },
  arrow: () => this?.name,
};
console.log(obj.regular(), obj.arrow());
```

`['obj', 'obj'] undefined` (в модуле). Стрелка внутри `regular` берёт `this` из вызова `regular`. Стрелка `arrow` создана на верхнем уровне модуля, где `this === undefined`; литерал объекта не создаёт области для `this`.
</details>

<details><summary>Можно ли изменить this у bound-функции?</summary>

Через `call`/`apply`/повторный `bind` — нет: bound-функция вызывает целевую с `[[BoundThis]]`. Повторный `bind` только добавит аргументы. Единственный способ — `new`: тогда `this` — новый объект. Ещё один нюанс — у bound-функций нет свойства `prototype`.
</details>

<details><summary>Почему стрелочные поля класса — не всегда хорошая идея?</summary>

`handleClick = () => {...}` создаёт отдельную функцию на каждом экземпляре в конструкторе: больше памяти, метод отсутствует на прототипе — его нельзя переопределить в наследнике с вызовом `super.handleClick()`, нельзя замокать через `Class.prototype` в тестах, и поля инициализируются после `super()`, поэтому родительский конструктор их не видит. Альтернативы — `bind` в конструкторе или декоратор `@bound`.
</details>

<details><summary>Чем call отличается от apply, а оба — от bind? Когда нужен Reflect.apply?</summary>

`call` и `apply` вызывают сразу (разница — аргументы списком или массивом), `bind` возвращает новую функцию с частичным применением. `Reflect.apply(fn, this, args)` нужен в библиотечном коде и Proxy-ловушках: не зависит от того, что у `fn` могли переопределить `apply`, и бросает `TypeError`, если `fn` невызываема.
</details>

<details><summary>Какой this у функции-обработчика DOM-события? А у колбэка setTimeout?</summary>

У обычной функции в `addEventListener` — `event.currentTarget` (элемент, на котором висит обработчик, не `event.target`). У инлайн-атрибута `onclick="..."` — тоже элемент. У колбэка `setTimeout` в браузере — `window` (так прописано в HTML-спецификации, даже в strict-коде), поэтому методы теряют контекст.
</details>

<details><summary>Как написать декоратор, который корректно работает с методами?</summary>

Возвращать обычную `function` (не стрелку), внутри вызывать оригинал через `fn.apply(this, args)` или `Reflect.apply`. Сохранять возвращаемое значение и исключения. Для асинхронных функций — не терять промис. Для кэширования — продумать ключ (у `JSON.stringify` проблемы с объектами, порядком ключей, `undefined`) и ограничение размера (LRU). Для метаданных — копировать `name`/`length`. Упомянуть стандартные декораторы и `addInitializer`.
</details>

<details><summary>Что такое this в конструкторе, если конструктор вернул объект?</summary>

`new` создаёт объект и передаёт его как `this`. Если конструктор явно вернул **объект**, результатом `new` будет он, а созданный `this` выбрасывается. Возврат примитива игнорируется. В классах-наследниках `this` не существует до вызова `super()` (ReferenceError) — его создаёт базовый конструктор.
</details>

<details><summary>Как работает this в геттере, вызванном через наследника или Proxy?</summary>

Геттер получает receiver — объект, через который шло обращение, а не тот, где геттер определён. `Object.create(base).prop` вызовет геттер `base` с `this` = наследник. В Proxy ловушка `get(target, key, receiver)` должна передавать `receiver` в `Reflect.get`, иначе геттеры получат `target` вместо прокси, и реактивность (Vue) перестанет отслеживать обращения внутри геттеров.
</details>

## Практика

**1. Предскажите вывод (код в модуле).**

```js
const counter = {
  count: 0,
  inc() { this.count++; return this; },
  later() { setTimeout(function () { console.log(this === globalThis); }); },
  laterArrow() { setTimeout(() => console.log(this.count)); },
};
counter.inc().inc();
counter.later();
counter.laterArrow();
const inc = counter.inc;
try { inc(); } catch (e) { console.log(e.constructor.name); }
```

<details><summary>Ответ</summary>

Синхронно: `TypeError` (в модуле strict, `this === undefined`, чтение `undefined.count`). Затем макрозадачи: `true` (в браузере колбэк таймера получает `window`), затем `2`.
</details>

**2. Почему не удаляется обработчик? Исправьте.**

```js
class Modal {
  open() { document.addEventListener('keydown', this.onKey.bind(this)); }
  close() { document.removeEventListener('keydown', this.onKey.bind(this)); }
  onKey(e) { if (e.key === 'Escape') this.close(); }
}
```

<details><summary>Решение</summary>

Каждый `bind` создаёт новую функцию — `remove` получает не ту ссылку. Варианты: сохранить ссылку (`#onKey = (e) => ...`) или использовать `AbortController`:

```js
class Modal {
  #controller = null;
  open() {
    this.#controller = new AbortController();
    document.addEventListener('keydown', (e) => this.onKey(e), { signal: this.#controller.signal });
  }
  close() { this.#controller?.abort(); this.#controller = null; }
  onKey(e) { if (e.key === 'Escape') this.close(); }
}
```
</details>

**3. Напишите `spy(fn)`: обёртка записывает в `wrapper.calls` массив `{ this, args }` и сохраняет поведение.**

<details><summary>Решение</summary>

```js
function spy(fn) {
  function wrapper(...args) {
    wrapper.calls.push({ this: this, args });
    return Reflect.apply(fn, this, args);
  }
  wrapper.calls = [];
  Object.defineProperty(wrapper, 'name', { value: fn.name });
  return wrapper;
}
```
</details>

**4. Полифилл `bind`** — в [08-practice-tasks.md](08-practice-tasks.md#15-полифилл-bind).

## Источники
- https://learn.javascript.ru/object-methods
- https://learn.javascript.ru/bind
- https://learn.javascript.ru/call-apply-decorators
- https://learn.javascript.ru/arrow-functions
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators
- https://github.com/tc39/proposal-decorators
- https://tc39.es/ecma262/#sec-bound-function-exotic-objects
