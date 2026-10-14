# Narrowing и union-типы

> ⏱ ~3 ч · 🎯 Проектировать состояния через discriminated unions, писать корректные type guards и assertion functions, понимать пределы control flow analysis.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю все встроенные способы сужения (typeof, truthiness, ===, in, instanceof)
- [ ] Пишу user-defined type guards (`x is T`) и понимаю их unsoundness
- [ ] Использую `asserts x is T` и знаю его ограничения
- [ ] Моделирую состояния discriminated union + exhaustive check
- [ ] Понимаю, когда CFA «сбрасывает» сужение

## Теория

### Что такое narrowing

Сужение (narrowing) — уточнение типа переменной в конкретной точке кода на основе проверок. Механизм — **control flow analysis (CFA)**: компилятор строит граф потока управления и для каждой ссылки вычисляет тип с учётом пройденных проверок, присваиваний, `return`/`throw`.

```ts
function pad(padding: number | string, input: string): string {
  if (typeof padding === 'number') return ' '.repeat(padding) + input; // number
  return padding + input; // string — ветка number уже «вышла» через return
}
```

### Встроенные type guards

| Проверка | Сужает | Нюансы |
|---|---|---|
| `typeof x === 'string'` | примитивы, `'function'`, `'object'` | `typeof null === 'object'` — TS это учитывает: остаётся `object \| null` |
| truthiness `if (x)` | убирает `null`/`undefined`/`false`/`0`/`''`/`0n` | 🪤 отсекает валидные `0` и `''` |
| `x === y`, `x != null` | до общего типа; `!= null` убирает оба nullish | `==` null — допустимая идиома |
| `'key' in x` | до членов union, где ключ есть (или опционален) | для отсутствующих — добавляет `key: unknown` (TS 4.9) |
| `x instanceof C` | до инстанса класса | работает по prototype chain; не через realm/iframe |
| `Array.isArray(x)` | до `any[]` 🪤 | внутри элементы `any` — лучше проверить дальше |
| присваивание | `let x: string \| number = 1` → далее `number` | declared type vs narrowed type |

```ts
type Fish = { swim(): void };
type Bird = { fly(): void };
function move(a: Fish | Bird) {
  if ('swim' in a) return a.swim(); // Fish
  return a.fly();                   // Bird
}
```

### User-defined type guards: `x is T`

```ts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}
// Для массивов: filter с предикатом сужает тип результата
const ids = ['a', null, 'b'].filter((x): x is string => x !== null); // string[]
// С TS 5.5 предикат выводится автоматически для простых тел:
const ids2 = ['a', null, 'b'].filter((x) => x !== null); // string[]
```

🪤 Ловушка: type guard — **обещание** разработчика, компилятор не проверяет тело. `(x): x is User => true` скомпилируется. Поэтому guards для внешних данных пишут поверх схем (zod), а не вручную на 20 полей.

Нюанс: если предикат вернул `false`, TS сужает в `else` до `Exclude`. Для «неточных» проверок это неверно: `isPositive(x): x is number` в else-ветке скажет, что `x` не `number`. В TS 5.5 inferred predicates учитывают это (предикат выводится только если `false` действительно означает «не T»).

`this is T` — guard в методах классов:

```ts
class Node_ { isLeaf(): this is Leaf { return this.children.length === 0 } children: Node_[] = [] }
class Leaf extends Node_ { value = 0 }
```

### Assertion functions: `asserts`

```ts
function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg ?? 'Assertion failed');
}
function assertIsDefined<T>(v: T, name = 'value'): asserts v is NonNullable<T> {
  if (v == null) throw new Error(`${name} is ${v}`);
}

const el = document.querySelector('#root');
assertIsDefined(el);
el.append('x'); // Element — сужено до конца области видимости
```

Ограничения:
- функция-ассерт должна быть вызвана через **идентификатор с явной аннотацией** типа: `const assert: (c: unknown) => asserts c = ...` — иначе ошибка «Assertions require every name in the call target to be declared with an explicit type annotation»;
- возвращаемый тип — только `void`;
- ассерты бросают — это runtime-проверки, а не только типы: хороши на границах (тесты, инварианты), плохи для ожидаемых ошибок (там Result, см. [05](05-advanced-patterns.md)).

### Discriminated (tagged) unions

Общее литеральное свойство-дискриминант позволяет сузить весь объект одной проверкой.

```ts
type RemoteData<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

function render<T>(s: RemoteData<T>): string {
  switch (s.status) {
    case 'idle':    return 'Нажмите «Загрузить»';
    case 'loading': return 'Загрузка…';
    case 'success': return JSON.stringify(s.data); // data доступна
    case 'error':   return s.error.message;
    default:        return assertNever(s);         // exhaustive check
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(x)}`);
}
```

Почему это лучше набора флагов `{ isLoading: boolean; data?: T; error?: E }`: невозможные состояния (`isLoading && error`) **непредставимы** («make illegal states unrepresentable»). Это главный аргумент на собеседовании про моделирование стейта (React-редьюсеры, XState, ответы API).

**Exhaustiveness** — способы:
1. `default: assertNever(s)` — ошибка компиляции при добавлении нового варианта + runtime-защита;
2. `const _exhaustive: never = s;`
3. `satisfies never` в default (`s satisfies never`) — без runtime-функции;
4. явный возвращаемый тип функции + `noImplicitReturns`/strictNullChecks: TS сообщит «Function lacks ending return statement».

Дискриминантом может быть не только строка: `boolean` (`{ ok: true; value: T } | { ok: false; error: E }`), числа, `undefined`.

**Деструктуризация (TS 4.6).** Сужение работает для деструктурированных из discriminated union параметров, если поля есть во всех членах:

```ts
type Action = { type: 'inc'; payload: number } | { type: 'rename'; payload: string };
function reduce({ type, payload }: Action) {
  if (type === 'inc') payload.toFixed();     // payload: number
  else payload.toUpperCase();                // payload: string
}
```

### Control flow analysis: где сужение теряется

**1. Колбэки и замыкания.** Сужение `let`-переменной или свойства не переносится в функцию, которая может вызваться позже:

```ts
function f(x: string | null) {
  if (x !== null) {
    setTimeout(() => x.length); // ✅ x — параметр, не переприсваивается (TS 5.4+ учитывает это)
  }
}
function g(obj: { v: string | null }) {
  if (obj.v !== null) {
    [1].forEach(() => obj.v.length); // ❌ obj.v может измениться к моменту вызова
    const v = obj.v;                 // решение: скопировать в const
    [1].forEach(() => v.length);     // ✅
  }
}
```

TS 5.4 сохраняет сужение в замыканиях, созданных **после последнего присваивания** переменной `let` или для параметров.

**2. Вызовы функций не инвалидируют сужение свойств** — это сознательный unsoundness ради удобства:

```ts
function h(o: { v: string | null }) {
  if (o.v !== null) {
    reset(o);        // внутри o.v = null
    o.v.length;      // TS считает string → упадёт в рантайме
  }
}
declare function reset(o: { v: string | null }): void;
```

**3. Алиасы условий (TS 4.4).** `const isStr = typeof x === 'string'; if (isStr) x.toUpperCase()` — работает, если `x` — `const`/readonly/не переприсваиваемый параметр.

**4. Индексный доступ с переменным ключом (TS 5.5)**: `if (typeof obj[key] === 'string') obj[key].toUpperCase()` — сужается, если и `obj`, и `key` не меняются.

**5. `switch (true)` (TS 5.3)** — сужение работает в каждом `case`.

### Unions: дистрибуция операций и подводные камни

- Над union доступно только общее: `(A | B)['x']` есть, только если `x` есть в обоих.
- Вызов union функций: `((a: string) => void) | ((a: number) => void)` вызывается с аргументом `string & number` = `never`.
- Большие union (тысячи членов, например из template literals) замедляют проверку; есть лимит 100 000 членов («Expression produces a union type that is too complex to represent»).

## Вопросы с собеседований

<details><summary>Что такое discriminated union и зачем?</summary>

Union объектов с общим литеральным полем-тегом. Проверка тега сужает весь объект. Даёт: непредставимость невалидных состояний, exhaustive check через `never`, хорошее автодополнение. Типичные применения: состояние запроса, actions редьюсера, события, ответы API (`{ ok: true, data } | { ok: false, error }`). Для lead — это и инструмент коммуникации: тип становится документацией возможных состояний.
</details>

<details><summary>Как сделать exhaustive check и почему это важно?</summary>

В `default` присвоить значение переменной типа `never` или передать в `assertNever(x: never): never`. Если добавят новый вариант — компиляция упадёт во всех `switch`, где его забыли. `assertNever` дополнительно бросает в рантайме, если пришли неожиданные данные. Альтернатива — `x satisfies never`. В ESLint есть `@typescript-eslint/switch-exhaustiveness-check`.
</details>

<details><summary>Чем `x is T` отличается от `asserts x is T`?</summary>

`x is T` — функция возвращает boolean, сужение в ветке `if`. `asserts x is T` — функция ничего не возвращает, но бросает, если условие неверно; сужение действует после вызова до конца области видимости. Asserts требует явно аннотированного идентификатора и подходит для инвариантов; guard — для ветвления. Оба не проверяются компилятором на корректность.
</details>

<details><summary>Почему сужение пропадает внутри колбэка?</summary>

Колбэк может быть вызван позже, когда переменная/свойство уже изменились. TS консервативен для свойств и переприсваиваемых `let`. С 5.4 сужение сохраняется для параметров и `let`, если замыкание создано после последнего присваивания. Решение — скопировать в `const`.
</details>

<details><summary>В чём unsoundness сужения свойств после вызова функции?</summary>

TS не инвалидирует сужение `obj.prop` после вызова произвольной функции, хотя она могла мутировать объект. Это осознанный компромисс: иначе почти любой вызов ломал бы сужения и код был бы засыпан проверками. Отсюда практика: иммутабельные данные, `readonly`, копирование в локальные `const`.
</details>

<details><summary>Чем опасна проверка truthiness для сужения?</summary>

`if (count)` отбросит `0`, `if (name)` — пустую строку. Для nullish используйте `!= null` или `??`. Также truthiness на `object | undefined` сужает корректно, но на union с `number`/`string` меняет семантику.
</details>

<details><summary>Как работает `in` для сужения и что изменилось в 4.9?</summary>

`'k' in x` сужает union до членов, где `k` объявлен (обязательно или опционально). С 4.9 для типов, где ключ не объявлен (например `unknown` после `typeof x === 'object' && x !== null`), TS добавляет `Record<'k', unknown>` — это позволяет валидировать произвольные объекты без `as`.
</details>

<details><summary>instanceof vs discriminant: что выбрать?</summary>

`instanceof` — для классов (ошибки, DOM), зависит от прототипов и ломается между realm/iframe, при дублировании пакета в бандле. Discriminant — для данных (JSON, сериализуемые структуры), работает с plain objects и между границами. Для ошибок приложения часто комбинируют: класс + поле `kind`/`code`.
</details>

<details><summary>Почему `Array.isArray` — слабое место?</summary>

Он сужает до `any[]`, и элементы становятся `any`. При `unknown`-входе лучше дальше валидировать элементы или использовать схему. Для `readonly` массивов тоже есть нюансы: `Array.isArray(x)` где `x: readonly string[] | string` исторически плохо сужал readonly-массивы.
</details>

## Практика

**1. Спроектируйте тип формы оплаты**: карта (номер, cvv), СБП (телефон), счёт (ИНН, необязательный КПП). Напишите функцию `describe(p)` с exhaustive check.

<details><summary>Решение</summary>

```ts
type Payment =
  | { method: 'card'; pan: string; cvv: string }
  | { method: 'sbp'; phone: string }
  | { method: 'invoice'; inn: string; kpp?: string };

function describe(p: Payment): string {
  switch (p.method) {
    case 'card':    return `Карта *${p.pan.slice(-4)}`;
    case 'sbp':     return `СБП ${p.phone}`;
    case 'invoice': return `Счёт ИНН ${p.inn}${p.kpp ? `, КПП ${p.kpp}` : ''}`;
    default:        return p satisfies never;
  }
}
```
</details>

**2. Напишите type guard `isApiError(e: unknown): e is { code: string; message: string }` без `as`.**

<details><summary>Решение</summary>

```ts
function isApiError(e: unknown): e is { code: string; message: string } {
  return (
    typeof e === 'object' && e !== null &&
    'code' in e && typeof e.code === 'string' &&       // TS 4.9: e.code: unknown → сужается
    'message' in e && typeof e.message === 'string'
  );
}
```
</details>

**3. Найдите баг типов.**

```ts
type State = { user: { name: string } | null };
function greet(s: State, logout: () => void) {
  if (s.user) {
    logout();
    return s.user.name.toUpperCase();
  }
}
```

<details><summary>Ответ</summary>

Если `logout` обнуляет `s.user`, код упадёт, но TS не ругается: вызовы не инвалидируют сужение свойств. Решение — `const { user } = s;` до вызова, либо иммутабельный стейт. Также функция неявно возвращает `undefined` — при явной аннотации `: string` и `noImplicitReturns` компилятор подсветит.
</details>

## Источники
- [Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Handbook: Everyday Types — Union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [TS 4.4 — Control flow analysis of aliased conditions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html)
- [TS 4.9 — in narrowing for unlisted properties](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TS 5.4 — preserved narrowing in closures](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
- [TS 5.5 — inferred type predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
