# Прототипы и классы

> ⏱ ~3 ч · 🎯 Объяснять прототипное наследование через `[[Prototype]]` и алгоритмы `[[Get]]`/`[[Set]]`, знать, чем `class` отличается от функции-конструктора семантически, уверенно работать с приватными полями, static blocks и `super`, аргументировать выбор между наследованием и композицией.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу нарисовать цепочку прототипов для `class B extends A` (экземпляры и статика)
- [ ] Могу написать `new`, `instanceof`, `Object.create` вручную
- [ ] Понимаю семантику полей класса (define vs set) и порядок инициализации
- [ ] Знаю ограничения `#private` (Proxy, наследники, brand check)

## Теория

### [[Prototype]], `__proto__` и `prototype` — три разные вещи

| Что | Где живёт | Назначение |
|---|---|---|
| `[[Prototype]]` | Внутренний слот **любого** объекта | Ссылка на объект-прототип (или `null`), по ней идёт поиск свойств |
| `obj.__proto__` | Геттер/сеттер на `Object.prototype` | Устаревший (Annex B) доступ к `[[Prototype]]`. Нет у `Object.create(null)` |
| `Fn.prototype` | Обычное свойство **функции** | Объект, который станет `[[Prototype]]` экземпляров при `new Fn()` |

Современный API: `Object.getPrototypeOf`, `Object.setPrototypeOf`, `Object.create`. Литерал `{ __proto__: proto }` — отдельная (нормальная, стандартная) синтаксическая форма, не геттер.

```js
function User(name) { this.name = name; }
User.prototype.hi = function () { return `Hi, ${this.name}`; };

const u = new User('Ann');
Object.getPrototypeOf(u) === User.prototype;          // true
User.prototype.constructor === User;                  // true (создаётся автоматически)
Object.getPrototypeOf(User) === Function.prototype;   // true — функция тоже объект
Object.getPrototypeOf(Object.prototype);              // null — конец цепочки
```

Свойства `prototype` нет у стрелочных функций, методов объекта/класса (`{ m() {} }`), async-функций, bound-функций — их нельзя вызывать через `new`.

### Алгоритмы чтения и записи

**Чтение `obj.x` (`[[Get]]`)**: ищем собственное свойство; если нет — повторяем на `[[Prototype]]`; дошли до `null` — `undefined`. Если найден геттер — вызывается с `this = obj` (receiver), а не объекта, где геттер лежит.

**Запись `obj.x = v` (`[[Set]]`)** — асимметрична:
1. Если в цепочке найден **сеттер** — вызывается он, собственное свойство не создаётся.
2. Если в цепочке свойство `x` **non-writable** — запись молча игнорируется (strict: `TypeError`). Так «замороженный» прототип запрещает затенение.
3. Иначе создаётся/обновляется **собственное** свойство `obj` (затенение, shadowing).

```js
const proto = Object.freeze({ role: 'user' });
const admin = Object.create(proto);
admin.role = 'admin';           // strict: TypeError — нельзя затенить non-writable из прототипа
Object.defineProperty(admin, 'role', { value: 'admin' }); // а так — можно
```

`for...in` обходит перечисляемые свойства **всей цепочки**; `Object.keys`, `Object.entries`, `Object.hasOwn` — только собственные.

### Что делает `new F(...args)`

1. Если `F` не конструктор — `TypeError`.
2. Создаётся объект с `[[Prototype]] = F.prototype` (если `F.prototype` не объект — `Object.prototype`).
3. `F` вызывается с `this` = новый объект и `new.target = F`.
4. Если `F` вернул объект — он и результат, иначе — созданный объект.

Для классов-наследников шаг 2 выполняет **базовый** конструктор (поэтому `this` недоступен до `super()`), а прототип выбирается по `new.target` — так экземпляр получает прототип наследника.

### Производительность: hidden classes и setPrototypeOf

V8 присваивает объектам скрытые классы (shapes/maps) и кэширует поиск свойств в inline caches. Смена прототипа у живого объекта (`Object.setPrototypeOf`, `__proto__ =`) инвалидирует эти кэши, причём не только для этого объекта. Правило: прототип задаётся при создании (`Object.create`, `class`), а не меняется потом. Так же вредны `delete` свойств и добавление свойств в разном порядке — объекты получают разные shapes и код становится полиморфным.

### Классы: не только синтаксический сахар

Класс создаёт ту же модель (функция + `prototype`), но с отличиями в семантике:

| Отличие | Подробности |
|---|---|
| Нельзя вызвать без `new` | `[[IsClassConstructor]]` → `TypeError` |
| Strict mode | Весь код класса |
| Методы неперечисляемые | `for...in` их не видит, в отличие от `F.prototype.m = ...` |
| TDZ | Класс объявлен как `let` — до объявления `ReferenceError` |
| `[[HomeObject]]` | Методы запоминают объект, где определены, — на этом работает `super` |
| Наследование встроенных | `class MyArr extends Array` работает корректно (exotic `length`), в ES5 — нет |
| Статика наследуется | `Object.getPrototypeOf(Child) === Parent` |

```js
class Animal {
  static registry = new Set();
  #id = crypto.randomUUID();              // приватное поле экземпляра
  name;                                   // публичное поле (define-семантика)

  constructor(name) {
    this.name = name;
    Animal.registry.add(this);
  }
  get id() { return this.#id; }
  speak() { return `${this.name} makes a sound`; }
  static isAnimal(x) { return #id in x; } // brand check (ES2022)
}

class Dog extends Animal {
  speak() { return `${super.speak()} — woof`; }
}

// Цепочки:
// new Dog → Dog.prototype → Animal.prototype → Object.prototype → null
// Dog → Animal → Function.prototype → Object.prototype → null
```

### Поля классов: define-семантика и порядок инициализации

Поля создаются через `[[DefineOwnProperty]]`, а не присваиванием. Следствия:
- поле **затеняет** сеттер родителя, вместо того чтобы его вызвать;
- в TypeScript это управляется `useDefineForClassFields` (по умолчанию `true` при `target >= ES2022`) — при миграции старых проектов (MobX, Lit) поведение меняется.

Порядок в наследнике: вызов `super(...)` → базовый конструктор, включая инициализацию полей базы → возврат → инициализация полей наследника → остаток тела конструктора наследника.

```js
class Base {
  constructor() { this.init(); }          // вызывает переопределённый метод
  init() {}
}
class Child extends Base {
  value = 42;
  init() { console.log(this.value); }     // undefined: поля Child ещё не инициализированы
}
new Child();
```

🪤 Ловушка: вызов переопределяемых методов из конструктора базового класса — антипаттерн в любом ООП-языке, в JS он проявляется особенно явно.

### Приватные элементы `#`

- Настоящая приватность на уровне языка: снаружи класса `obj.#x` — `SyntaxError` ещё на парсинге; не видны через `Reflect.ownKeys`, `JSON.stringify`, Proxy.
- Не наследуются в смысле доступа: у наследника поле есть, но обращаться к `#x` можно только в теле класса, где оно объявлено.
- Доступ к `#x` на объекте без этого поля — `TypeError`. Отсюда brand check `#x in obj`.
- **Proxy ломает приватные поля**: `new Proxy(instance, {}).getId()` → внутри метода `this` — прокси, а у прокси нет `#id` → `TypeError`. Поэтому Vue не проксирует экземпляры классов с приватными полями корректно (используйте `markRaw` или plain objects).
- Есть приватные методы, геттеры и статические члены: `#validate()`, `static #cache`.
- TypeScript `private` — только проверка компилятора, в рантайме свойство обычное.

### Static initialization blocks

```js
class Config {
  static #secrets;
  static defaults;
  static {
    // выполняется один раз при определении класса; есть доступ к приватным членам
    try {
      Config.#secrets = JSON.parse(readEnv());
    } catch {
      Config.#secrets = {};
    }
    Config.defaults = Object.freeze({ retries: 3 });
  }
}
```

Применение: сложная инициализация статики, try/catch, «дружественный» доступ — выдать приватный аксессор наружу функции, объявленной рядом с классом.

### Наследование vs композиция

Глубокие иерархии хрупки (fragile base class), трудно тестируемы, и JS-экосистема (React-хуки, Vue Composition API) от них ушла. Классы в современном фронтенде уместны для: ошибок (`class HttpError extends Error`), низкоуровневых структур (LRU, EventEmitter), Web Components, сервисов в DI-контейнерах (Angular, NestJS). Миксины — `const Serializable = (Base) => class extends Base { ... }`, но лучше композиция: объект содержит зависимости, а не наследует их.

💡 На собеседовании: «Наследование я использую на один уровень и для расширения встроенных типов — `Error`, `HTMLElement`. Для переиспользования поведения — композиция и функции».

## Вопросы с собеседований

<details><summary>Чем __proto__ отличается от prototype?</summary>

`prototype` — обычное свойство функции-конструктора, объект-шаблон для будущих экземпляров. `__proto__` — устаревший аксессор к внутреннему `[[Prototype]]` конкретного объекта. Для экземпляра `u.__proto__ === User.prototype`. У самой функции `User.__proto__ === Function.prototype`. В коде используют `Object.getPrototypeOf`/`Object.create`, т.к. у объектов без `Object.prototype` в цепочке `__proto__` нет.
</details>

<details><summary>Классы в JS — это просто сахар?</summary>

Модель та же — прототипы, но семантика отличается: класс нельзя вызвать без `new`, тело в strict mode, методы неперечисляемые, есть TDZ, `[[HomeObject]]` для `super`, корректное наследование встроенных (`Array`, `Error`, `HTMLElement`) благодаря тому, что `this` создаёт базовый конструктор, приватные поля и static blocks, которые невозможно выразить через функции (только эмулировать через `WeakMap`). Так что «в основном сахар, но не только».
</details>

<details><summary>Почему в наследнике нельзя обратиться к this до super()?</summary>

В производном классе объект создаёт базовый конструктор (это нужно, чтобы `Array`/`HTMLElement` могли создать exotic-объект). До возврата из `super()` привязка `this` не инициализирована — `ReferenceError`. Если конструктор наследника не вызвал `super()` и не вернул объект — тоже `ReferenceError`.
</details>

<details><summary>Как работает super в методах? Что будет, если метод с super скопировать в другой объект?</summary>

`super.method()` ищет `method` в `Object.getPrototypeOf(HomeObject)`, где `[[HomeObject]]` — объект, в котором метод определён (фиксируется при создании, только у синтаксиса методов). Поэтому при копировании метода в другой объект `super` по-прежнему указывает на прототип исходного HomeObject — это неочевидно и может ломать миксины. `this` при этом берётся из вызова, как обычно.
</details>

<details><summary>Чем #private отличается от private в TypeScript и от замыканий/WeakMap?</summary>

TS `private` — только compile-time, в JS это обычное свойство, доступно через `obj['x']`. `#x` — рантайм-приватность, жёсткая. WeakMap/замыкания — способ эмулировать приватность до ES2022 (Babel так и транспилирует `#x`). Особенности `#x`: TypeError при доступе на чужом объекте, brand check `#x in obj`, несовместимость с Proxy, нельзя динамически перечислить.
</details>

<details><summary>Что такое static block и зачем он нужен?</summary>

`static { ... }` выполняется один раз при вычислении определения класса, с `this` = класс и доступом к приватным членам. Даёт инициализацию с try/catch, несколько связанных статических полей, выдачу приватного доступа соседнему коду. До ES2022 это делалось кодом после класса без доступа к `#`.
</details>

<details><summary>Почему поле класса может «перекрыть» сеттер родителя?</summary>

Поля используют define-семантику: `Object.defineProperty(this, 'x', { value, writable: true, enumerable: true, configurable: true })`. Это создаёт собственное свойство, не вызывая аксессор из прототипа. С `useDefineForClassFields: false` в TS поля компилируются в присваивание, и сеттер вызывается. При обновлении TS target это ломает библиотеки, построенные на декораторах полей.
</details>

<details><summary>Как сделать объект без прототипа и зачем?</summary>

`Object.create(null)` или `{ __proto__: null }`. Такой объект — чистый словарь: нет `toString`, `hasOwnProperty`, `__proto__` — ключ `"__proto__"` становится обычным, что защищает от prototype pollution при парсинге пользовательских ключей. Сейчас для словарей чаще уместен `Map`.
</details>

<details><summary>Что такое prototype pollution?</summary>

Уязвимость, когда пользовательский ввод (например, JSON при deep merge) записывает в `obj['__proto__'][key]` и тем самым модифицирует `Object.prototype` для всего приложения. Защита: пропускать ключи `__proto__`, `constructor`, `prototype` при merge, использовать `Object.create(null)`/`Map`, `Object.freeze(Object.prototype)` в критичных средах, валидация схемой.
</details>

## Практика

**1. Реализуйте `myNew(Ctor, ...args)`.**

<details><summary>Решение</summary>

```js
function myNew(Ctor, ...args) {
  if (typeof Ctor !== 'function' || !Ctor.prototype) {
    throw new TypeError(`${String(Ctor)} is not a constructor`);
  }
  const proto = Object(Ctor.prototype) === Ctor.prototype ? Ctor.prototype : Object.prototype;
  const obj = Object.create(proto);
  const result = Ctor.apply(obj, args);
  return result !== null && (typeof result === 'object' || typeof result === 'function')
    ? result
    : obj;
}
```
Ограничения: не работает с классами (их нельзя вызвать через `apply`) — для них есть `Reflect.construct(Ctor, args, newTarget)`; не устанавливает `new.target`.
</details>

**2. Реализуйте `myInstanceOf(obj, Ctor)`.**

<details><summary>Решение</summary>

```js
function myInstanceOf(obj, Ctor) {
  if (typeof Ctor !== 'function') throw new TypeError('Right-hand side is not callable');
  if (typeof Ctor[Symbol.hasInstance] === 'function' && Ctor[Symbol.hasInstance] !== Function.prototype[Symbol.hasInstance]) {
    return Boolean(Ctor[Symbol.hasInstance](obj));
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```
</details>

**3. Предскажите вывод.**

```js
class A {
  static create() { return new this(); }
  who() { return 'A'; }
}
class B extends A { who() { return 'B'; } }
const b = B.create();
console.log(b.who(), b instanceof A, Object.getPrototypeOf(B) === A);
console.log(Object.keys(b), 'who' in b, Object.hasOwn(b, 'who'));
```

<details><summary>Ответ</summary>

`B true true` — статический метод унаследован, `this` в нём = `B`. Затем `[] true false` — метод на прототипе, не собственный.
</details>

**4. Сделайте класс ошибки `HttpError` с полями `status` и `cause`, корректным `name` и `instanceof`.**

<details><summary>Решение</summary>

```js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);             // options.cause — стандарт ES2022
    this.name = 'HttpError';
    this.status = status;
  }
  get isRetryable() { return this.status >= 500 || this.status === 429; }
}
const err = new HttpError(503, 'Unavailable', { cause: new Error('upstream') });
err instanceof HttpError && err instanceof Error; // true
```
При таргете ES5 в TS `instanceof` ломался — требовался `Object.setPrototypeOf(this, new.target.prototype)`. С нативными классами это не нужно.
</details>

## Источники
- https://learn.javascript.ru/prototype-inheritance
- https://learn.javascript.ru/function-prototype
- https://learn.javascript.ru/native-prototypes
- https://learn.javascript.ru/prototype-methods
- https://learn.javascript.ru/class
- https://learn.javascript.ru/class-inheritance
- https://learn.javascript.ru/private-protected-properties-methods
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks
- https://tc39.es/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
