# Generics и вариантность

> ⏱ ~3 ч · 🎯 Проектировать обобщённые API, которые хорошо выводят типы у потребителя; объяснять ко-/контравариантность и `strictFunctionTypes`; писать generic-компоненты React.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Понимаю, откуда TS выводит type arguments и что такое inference candidates
- [ ] Использую constraints, defaults, `const` type parameters, `NoInfer`
- [ ] Объясняю вариантность и аннотации `in`/`out`
- [ ] Пишу generic-компоненты React (List, Select, Table) с корректным выводом

## Теория

### Зачем дженерики

Дженерик связывает типы между входом и выходом. Правило из Handbook: **параметр типа должен встречаться минимум дважды** — иначе он не нужен.

```ts
function first<T>(xs: readonly T[]): T | undefined { return xs[0]; }  // ✅ T связывает вход и выход
function log<T>(x: T): void { console.log(x); }                        // ❌ T лишний → (x: unknown)
function parse<T>(json: string): T { return JSON.parse(json); }        // ❌ «скрытый as»: T берётся из воздуха
```

`parse<T>` — антипаттерн: он маскирует непроверенное приведение. Честно — вернуть `unknown` и валидировать.

### Вывод аргументов типа

TS собирает **inference candidates** из аргументов и выбирает лучший. Порядок важен: сначала неконтекстно-чувствительные аргументы, затем колбэки.

```ts
declare function map<T, U>(xs: T[], fn: (x: T) => U): U[];
map([1, 2], (n) => n.toString()); // T = number из массива, затем U = string из колбэка

declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
pick({ a: 1, b: 'x' }, 'a'); // K = 'a' — constraint keyof T сохраняет литерал
```

Правило widening при выводе: литерал **сохраняется**, если constraint включает примитив/литерал (`<T extends string>`) или `T` стоит на верхнем уровне возвращаемого типа; иначе расширяется.

```ts
declare function id<T>(x: T): T;
declare function wrap<T>(x: T): T[];
declare function wrapS<T extends string>(x: T): T[];
id('a');    // "a"      — T на верхнем уровне return type
wrap('a');  // string[] — T не на верхнем уровне → widening
wrapS('a'); // "a"[]    — constraint-примитив
```

### Ограничения (constraints) и defaults

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest([1, 2], [3]);      // number[]
longest('alice', 'bob');  // "alice" | "bob" — пример из Handbook: литералы не расширились, T в return type

// Default type parameters
interface ApiResponse<T = unknown, E extends Error = Error> { data?: T; error?: E }
type R = ApiResponse;      // ApiResponse<unknown, Error>
```

🪤 Ловушка: возвращать «то, что подходит под constraint», а не `T`:

```ts
function minLen<T extends { length: number }>(obj: T, min: number): T {
  if (obj.length >= min) return obj;
  return { length: min }; // ❌ { length: number } — не T (T может быть string[])
}
```

### `const` type parameters (TS 5.0)

Заставляют выводить тип как при `as const` без требований к вызывающему.

```ts
declare function routes<const T extends readonly string[]>(xs: T): T;
const r = routes(['/', '/about']);  // readonly ["/", "/about"]

// Без const пришлось бы писать routes(['/', '/about'] as const)
```

Нюанс: для массивов constraint должен быть `readonly ...[]`, иначе выведется мутабельный `string[]`.

### `NoInfer<T>` (TS 5.4)

Блокирует вывод из конкретной позиции — параметр выводится из других мест, а здесь только проверяется.

```ts
declare function createFSM<S extends string>(states: S[], initial: NoInfer<S>): void;
createFSM(['idle', 'loading'], 'idel'); // ❌ ошибка — без NoInfer S расширился бы до 'idle'|'loading'|'idel'
```

### Generic-интерфейсы, классы, фабрики

```ts
class TypedMap<K, V> {
  #m = new Map<K, V>();
  set(k: K, v: V): this { this.#m.set(k, v); return this; }
  get(k: K): V | undefined { return this.#m.get(k); }
}

// Фабрика с конструктором как аргументом
function create<T>(Ctor: new (...args: any[]) => T): T { return new Ctor(); }

// Статические члены не видят параметр типа класса — у класса один статический контекст
```

### Вариантность (variance)

Как подтипизация `A <: B` переносится на `F<A>` vs `F<B>`:

| Вариантность | Правило | Где |
|---|---|---|
| Ковариантность (covariant, `out`) | `F<Dog> <: F<Animal>` | возвращаемые значения, readonly-свойства, `Promise<T>`, `ReadonlyArray<T>` |
| Контравариантность (contravariant, `in`) | `F<Animal> <: F<Dog>` | параметры функций (при `strictFunctionTypes`) |
| Инвариантность (`in out`) | ни то ни другое | тип и читается, и пишется: `(x: T) => T`, мутабельная ячейка |
| Бивариантность | в обе стороны (unsound) | параметры **методов** (method shorthand), всё при `strictFunctionTypes: false` |

```ts
class Animal { name = '' }
class Dog extends Animal { bark() {} }

let handleAnimal = (a: Animal) => {};
let handleDog = (d: Dog) => d.bark();

handleDog = handleAnimal;  // ✅ контравариантность: кто умеет любое животное, справится с собакой
handleAnimal = handleDog;  // ❌ при strictFunctionTypes: передадут кошку → cat.bark()
```

**Бивариантность методов** сохранена намеренно, иначе `Array<Dog>` не был бы присваиваем к `Array<Animal>` (у массива метод `push(x: T)`). Поэтому массивы в TS **ковариантны, что unsound**:

```ts
const dogs: Dog[] = [];
const animals: Animal[] = dogs; // ✅ компилируется
animals.push(new Animal());     // и теперь в dogs лежит не-собака
```

Практический вывод: в своих интерфейсах объявляйте колбэки **свойствами-функциями** (`onChange: (v: T) => void`), а не методами (`onChange(v: T): void`) — тогда работает строгая проверка.

**Аннотации `in`/`out` (TS 4.7)**:

```ts
interface Producer<out T> { get(): T }
interface Consumer<in T> { accept(x: T): void }
interface Cell<in out T> { get(): T; set(x: T): void }
```

Зачем: (1) ускорение — TS не вычисляет вариантность структурно; (2) документация и проверка — если объявить `out`, а использовать T в параметре, будет ошибка; (3) исправление случаев, когда вычисленная вариантность неверна (циклические типы). Пишите их только когда понимаете, что делаете: неверная аннотация делает проверку unsound.

### Generic-компоненты React

```tsx
type ListProps<T> = {
  items: readonly T[];
  getKey: (item: T) => React.Key;
  renderItem: (item: T) => React.ReactNode;
};

export function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return <ul>{items.map((it) => <li key={getKey(it)}>{renderItem(it)}</li>)}</ul>;
}

// T выводится из items: renderItem получает User
<List items={users} getKey={(u) => u.id} renderItem={(u) => u.name} />;
```

Нюансы:
- в `.tsx` стрелочная функция `<T>() =>` парсится как JSX — пишите `<T,>(props) =>` или `<T extends unknown>`;
- `React.FC` с дженериками не работает (`const List: React.FC<Props<T>>` — некуда объявить `T`) — используйте function declaration;
- `forwardRef` теряет дженерики; в React 19 `ref` — обычный проп, `forwardRef` не нужен, и проблема уходит;
- `memo` тоже теряет дженерик — частое решение: `export const List = memo(ListInner) as typeof ListInner`.

Пример Select с зависимыми пропсами:

```tsx
type SelectProps<T, Multiple extends boolean = false> = {
  options: readonly T[];
  multiple?: Multiple;
  value: Multiple extends true ? T[] : T | null;
  onChange: (v: Multiple extends true ? T[] : T | null) => void;
  getLabel: (o: T) => string;
};
export function Select<T, Multiple extends boolean = false>(p: SelectProps<T, Multiple>) { /* ... */ return null; }
```

Хуки:

```ts
function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw === null ? initial : (JSON.parse(raw) as T); // 🪤 непроверенный as — для прод-кода валидируйте схемой
  });
  return [v, setV] as const; // кортеж, а не (T | Dispatch)[]
}
```

## Вопросы с собеседований

<details><summary>Когда дженерик лишний?</summary>

Если параметр типа встречается один раз — он ничего не связывает, его заменяют на `unknown` или конкретный тип. Если он встречается только в возвращаемом типе (`parse<T>(): T`) — это замаскированный `as`. Лишние дженерики ухудшают читаемость и сообщения об ошибках.
</details>

<details><summary>Объясните ко- и контравариантность на примере.</summary>

`Dog <: Animal`. Возвращаемые значения ковариантны: `() => Dog` можно использовать как `() => Animal`. Параметры контравариантны: `(a: Animal) => void` можно использовать как `(d: Dog) => void`, но не наоборот. Если T и читается, и пишется — инвариантность. В TS параметры методов бивариантны ради совместимости массивов — отсюда unsound ковариантность `T[]`. `strictFunctionTypes` включает контравариантность только для function-type свойств, не для методов.
</details>

<details><summary>Что дают аннотации `in`/`out`?</summary>

Явно задают вариантность параметра типа. Ускоряют проверку больших рекурсивных типов (не нужно вычислять вариантность структурным сравнением), документируют намерение, ловят ошибки использования T в неверной позиции. Нужны редко — в библиотеках со сложными типами.
</details>

<details><summary>Что такое `const` type parameters и чем они лучше `as const` у вызывающего?</summary>

Модификатор `const` у параметра типа (TS 5.0) заставляет выводить самый узкий литеральный тип из аргумента-литерала. Это переносит ответственность с потребителя API на автора: роутеры, конфиги, схемы, tRPC-подобные билдеры. Ограничение: работает только на литералах прямо в вызове; constraint для массивов должен быть readonly.
</details>

<details><summary>Зачем `NoInfer`?</summary>

Чтобы аргумент не участвовал в выводе параметра типа и только проверялся. Классика: `initial` состояние должно быть одним из перечисленных `states`, `defaultValue` — одним из `options`. До 5.4 использовали трюк `T & {}` или второй параметр типа.
</details>

<details><summary>Как типизировать generic-компонент React и какие с ним проблемы?</summary>

Function declaration с параметром типа, пропсы как generic type; T выводится из пропсов. Проблемы: синтаксис `<T,>` в tsx, `React.FC` не поддерживает дженерики, `forwardRef`/`memo`/HOC теряют дженерик — кастуют к `typeof Inner` или (React 19) передают `ref` как проп. Для senior: упомянуть полиморфный `as`-проп и его стоимость для производительности tsc.
</details>

<details><summary>Почему `wrap('a')` даёт `string[]`, а `wrapS<T extends string>('a')` — `"a"[]`?</summary>

Эвристика вывода: литеральный кандидат не расширяется, если constraint включает примитивы/литералы или если `T` стоит на верхнем уровне возвращаемого типа (`id('a')` → `"a"`). Иначе (`wrap<T>(x: T): T[]`) TS делает widening, считая, что нужен общий тип. `const T` форсирует литерал всегда.
</details>

<details><summary>Можно ли использовать параметр типа класса в статических членах?</summary>

Нет. Статическая часть класса одна для всех инстанциаций, `T` к ней не относится. Статические фабрики объявляют собственный параметр: `static of<U>(x: U): Box<U>`.
</details>

<details><summary>Почему массивы ковариантны, если это unsound?</summary>

Прагматичный выбор: почти весь реальный код передаёт `Dog[]` туда, где ждут `Animal[]`, только для чтения. Инвариантность массивов сделала бы TS непригодным для JS-кода. Безопасная альтернатива — принимать `readonly Animal[]` в API: readonly-массив честно ковариантен.
</details>

## Практика

**1. Напишите `groupBy`, который выводит ключи.**

<details><summary>Решение</summary>

```ts
function groupBy<T, K extends PropertyKey>(xs: readonly T[], key: (x: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const x of xs) (out[key(x)] ??= []).push(x);
  return out;
}
const g = groupBy([{ t: 'a' as const }, { t: 'b' as const }], (x) => x.t); // Partial<Record<'a'|'b', ...>>
```

`Partial` — честно: не каждый ключ обязательно встретится. Встроенный `Object.groupBy` (ES2024) типизирован так же.
</details>

**2. Компилируется ли? Почему?**

```ts
interface Handler { handle(e: MouseEvent): void }
const h: Handler = { handle: (e: Event) => {} };
interface Handler2 { handle: (e: Event) => void }
const h2: Handler2 = { handle: (e: MouseEvent) => {} };
```

<details><summary>Ответ</summary>

`h` — да: параметр шире (контравариантно корректно). `h2` — нет при `strictFunctionTypes`: свойство-функция проверяется контравариантно, `MouseEvent` уже `Event`. Если бы `handle` в `Handler2` был методом — компилировалось бы из-за бивариантности.
</details>

**3. Типизируйте `useAsync`**, возвращающий discriminated union состояния для любой async-функции.

<details><summary>Решение</summary>

```ts
type AsyncState<T> =
  | { status: 'idle' } | { status: 'pending' }
  | { status: 'success'; data: T } | { status: 'error'; error: unknown };

function useAsync<Args extends unknown[], T>(fn: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  const run = useCallback(async (...args: Args) => {
    setState({ status: 'pending' });
    try { setState({ status: 'success', data: await fn(...args) }); }
    catch (error) { setState({ status: 'error', error }); }
  }, [fn]);
  return [state, run] as const;
}
```

`Args extends unknown[]` выводит кортеж параметров вместе с именами — `run` будет иметь ту же сигнатуру, что `fn`.
</details>

## Источники
- [Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Handbook: More on Functions — Guidelines for good generic functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [Type Compatibility — function parameter bivariance](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [TS 4.7 — variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html)
- [TS 5.0 — const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
- [TS 5.4 — NoInfer](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
- [React TypeScript Cheatsheet — generic components](https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/)
