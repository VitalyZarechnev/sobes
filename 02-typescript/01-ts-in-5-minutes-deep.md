# TypeScript in 5 minutes — глубоко

> ⏱ ~3 ч · 🎯 Объяснять, как TS выводит и расширяет типы, почему система структурная, где проходят границы `any`/`unknown`/`never`/`void`, и аргументированно выбирать между `interface` и `type`.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Понимаю widening / literal types и роль `const`/`as const`
- [ ] Могу объяснить interface vs type без мифов
- [ ] Понимаю excess property checks и почему они «ломают» структурность
- [ ] Знаю иерархию типов: `unknown` сверху, `never` снизу, где `any`

## Теория

Страница идёт по структуре официального [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html): Types by Inference → Defining Types → Composing Types → Structural Type System — и углубляет каждый пункт.

### 1. Типы по выводу (Types by Inference)

TS выводит тип из инициализатора, возвращаемого значения, контекста. Аннотации нужны на **границах** (публичный API, параметры функций), внутри — доверяем выводу.

```ts
let a = 'hi';            // string — let можно переприсвоить → тип расширен (widening)
const b = 'hi';          // "hi" — literal type, const не переприсваивается
const obj = { kind: 'a' }; // { kind: string } — свойства объекта мутабельны → расширяются
const tuple = [1, 'x'];    // (string | number)[] — массив, не кортеж!
const frozen = { kind: 'a', xs: [1, 2] } as const;
// { readonly kind: "a"; readonly xs: readonly [1, 2] }
```

**Widening.** Литеральный тип «расширяется» до базового, когда позиция мутабельна: `let`, свойство объекта, элемент массива. `null`/`undefined` без `strictNullChecks` расширяются до `any`.

**Best common type.** Для `[1, 'x', null]` выводится union элементов: `(string | number | null)[]`.

**Contextual typing** — вывод «снаружи внутрь»: тип параметра колбэка берётся из ожидаемого типа.

```ts
window.addEventListener('keydown', (e) => e.key); // e: KeyboardEvent — из перегрузки по литералу 'keydown'
const handlers: Record<string, (n: number) => void> = { log: (n) => n.toFixed() }; // n: number
```

**Вывод возвращаемого типа.** Удобно, но в публичных функциях библиотек аннотируйте явно: это (а) фиксирует контракт, (б) ускоряет проверку и генерацию `.d.ts`, (в) обязательно при `isolatedDeclarations` (см. [06](06-config-and-tooling.md)).

**Inferred type predicates (TS 5.5).** `arr.filter(x => x !== undefined)` теперь даёт `T[]` без ручного `x is T` — TS выводит предикат из тела функции.

🪤 Ловушка: `const` фиксирует только ссылку. `const cfg = { mode: 'dark' }` → `mode: string`. Если нужен литерал — `as const` или `satisfies` (см. [05](05-advanced-patterns.md)).

### 2. Определение типов (Defining Types)

`interface` и `type` (type alias) в 90% случаев взаимозаменяемы. Реальные отличия:

| | `interface` | `type` |
|---|---|---|
| Что описывает | только объектные формы (вкл. функции, классы) | любой тип: union, tuple, mapped, conditional, примитив |
| Declaration merging | да — два объявления сливаются | нет — повторное объявление ошибка |
| Расширение | `extends` — проверяет совместимость, конфликт свойств = ошибка в месте объявления | `&` — конфликт молча даёт `never` в свойстве |
| Производительность | отношения `extends` кешируются по имени | пересечения пересчитываются; на больших графах медленнее |
| Сообщения об ошибках | показывается имя интерфейса | алиас может «раскрываться» в структуру |
| Implicit index signature | **нет** — не присваивается к `Record<string, unknown>` | **есть** для литералов объектных типов |

```ts
interface A { x: string }
interface B extends A { x: number } // ❌ ошибка сразу: Interface 'B' incorrectly extends 'A'
type C = { x: string } & { x: number }; // ✅ компилируется, но C['x'] = never

interface I { a: string }
type T = { a: string };
const rec1: Record<string, string> = {} as T; // ✅
const rec2: Record<string, string> = {} as I; // ❌ Index signature is missing in type 'I'
```

💡 На собеседовании: «По умолчанию `interface` для объектных контрактов, которые расширяют (особенно в публичном API и библиотеках: merging позволяет augmentation), `type` — для union, утилит, mapped/conditional. Важнее консистентность, закреплённая линтером (`@typescript-eslint/consistent-type-definitions`)». Официальный Handbook советует `interface`, пока не нужны возможности `type`.

### 3. Композиция типов (Composing Types)

**Union** — «одно из». Над union доступны только общие члены, пока не сузите (см. [02](02-narrowing-and-unions.md)).

```ts
type WindowState = 'open' | 'closed' | 'minimized';
function wrap(input: string | string[]): string[] {
  return Array.isArray(input) ? input : [input]; // narrowing через Array.isArray
}
```

**Intersection** — «всё сразу». Для объектов — объединение свойств; для несовместимых примитивов — `never` (`string & number`).

**Generics** — параметризация типом (см. [03](03-generics.md)):

```ts
interface Backpack<T> { add(item: T): void; get(): T }
declare const bp: Backpack<string>;
bp.add(23); // ❌ number не присваивается к string
```

Алгебра типов полезна интуитивно: `T | never = T`, `T & unknown = T`, `T & never = never`, `T | unknown = unknown`. `keyof (A | B) = keyof A & keyof B` (общие ключи), `keyof (A & B) = keyof A | keyof B`.

### 4. Структурная типизация (Structural Type System)

Совместимость определяется **формой**, а не именем/происхождением («duck typing» на этапе компиляции).

```ts
interface Point { x: number; y: number }
class VirtualPoint { constructor(public x: number, public y: number) {} }
function log(p: Point) {}
log(new VirtualPoint(1, 2));     // ✅ класс ничего не «implements», но форма совпадает
const p3 = { x: 1, y: 2, z: 3 };
log(p3);                          // ✅ лишние свойства допустимы — подтип
log({ x: 1, y: 2, z: 3 });        // ❌ excess property check!
```

**Excess property checks** — исключение из структурности: срабатывает только для **свежего объектного литерала** (freshness), присвоенного напрямую. Цель — ловить опечатки (`colour` вместо `color`). Обходится переменной-посредником, `as`, или index signature.

Классы тоже структурны, **кроме** `private`/`protected` и `#private` членов: два класса с одинаковым `private x` несовместимы — это один из способов номинальности.

```ts
class USD { private readonly _brand = 'usd'; constructor(public v: number) {} }
class EUR { private readonly _brand = 'eur'; constructor(public v: number) {} }
const e: EUR = new USD(1); // ❌ Types have separate declarations of a private property
```

Следствия структурности, о которых спрашивают:
- **Пустой интерфейс `{}`** принимает всё, кроме `null`/`undefined` (`const x: {} = 42` ✅). Для «любого объекта» — `object` или `Record<string, unknown>`.
- **Функции**: меньше параметров — совместима (`[1,2].forEach(() => {})`), параметры проверяются контравариантно при `strictFunctionTypes` (см. [03](03-generics.md)).
- **`Object.keys(obj)` возвращает `string[]`**, а не `(keyof T)[]` — потому что из-за структурности в объекте в рантайме может быть больше ключей, чем в типе. Это намеренное решение, не баг.

### 5. Иерархия: `any`, `unknown`, `never`, `void`

```
           unknown            ← top type: всё присваивается к нему
     /    |      |     \
 object string number ... null undefined
     \    |      |     /
            never             ← bottom type: присваивается ко всему, ничего — к нему
any — вне решётки: присваивается ко всему И всё к нему (отключает проверку)
```

| Тип | Что можно присвоить | Что можно делать со значением | Где использовать |
|---|---|---|---|
| `any` | всё | всё (без проверки) — «заражает» выражения | миграция JS, крайние escape hatches |
| `unknown` | всё | ничего, пока не сузите | внешние данные: `JSON.parse`, `catch (e)`, ответы API |
| `never` | ничего (кроме `never`) | — | недостижимый код, exhaustive check, фильтрация в conditional types |
| `void` | `undefined` (и результат любой функции в позиции колбэка) | не стоит использовать | возврат функций без значения |

```ts
// void в типе колбэка — «результат игнорируется», а не «возвращает undefined»
type Cb = () => void;
const f: Cb = () => 42;           // ✅ допустимо — поэтому arr.forEach(x => list.push(x)) ок
function g(): void { return 42; } // ❌ а в объявлении функции — ошибка

// never в union исчезает, в intersection поглощает
type U = string | never;  // string
type I = string & never;  // never

// catch-переменная
try { /* ... */ } catch (e) { // e: unknown при useUnknownInCatchVariables (входит в strict)
  if (e instanceof Error) console.error(e.message);
}
```

🪤 Ловушка: `any` распространяется молча: `const x: any = ...; const y = x.foo.bar;` — `y` тоже `any`. Включайте `noImplicitAny` и линт-правила `no-unsafe-*`.

### 6. Literal types и их применение

Литеральные типы — строки, числа, `true/false`, `bigint`, а также template literals (см. [04](04-type-level-programming.md)). Union литералов — идиоматичная замена enum.

```ts
declare function request(url: string, method: 'GET' | 'POST'): void;
const req = { url: '/api', method: 'GET' };
request(req.url, req.method);          // ❌ string не присваивается к 'GET' | 'POST'
const req2 = { url: '/api', method: 'GET' } as const;
request(req2.url, req2.method);        // ✅
```

Альтернативы: `method: 'GET' as const` точечно; `satisfies`; аннотация переменной типом запроса.

## Вопросы с собеседований

<details><summary>Что такое widening и когда TS сохраняет литеральный тип?</summary>

Widening — расширение литерального типа до базового в мутабельных позициях: `let`, свойства объектов, элементы массивов. `const x = 'a'` → `"a"`, `let x = 'a'` → `string`, `{ k: 'a' }` → `{ k: string }`. Литерал сохраняется: у `const`-примитивов, при `as const`, при contextual typing литеральным union-ом, в дженериках с `const T` (TS 5.0) и когда параметр ограничен примитивом (`T extends string` выведет `"a"`). Для senior: упомянуть, что `as const` делает readonly рекурсивно, и что это влияет на совместимость с мутабельными API (`readonly string[]` не присваивается в `string[]`).
</details>

<details><summary>interface vs type — когда что?</summary>

Отличия: merging есть только у interface; `type` описывает union/tuple/mapped/conditional; `extends` даёт ошибку при конфликте, `&` молча даёт `never`; interface не имеет implicit index signature; extends-отношения кешируются — на больших кодовых базах interface быстрее (это рекомендация из TS Performance wiki). Правило: interface для расширяемых объектных контрактов и публичного API, type — для всего остального; консистентность через линтер.
</details>

<details><summary>Что значит «структурная типизация»? Приведите проблему, которую она создаёт.</summary>

Совместимость по форме, а не по имени. Проблема — смешивание семантически разных значений одной формы: `UserId` и `OrderId` (обе `string`), `USD` и `EUR`. Решения: branded types (`string & { __brand: 'UserId' }`), классы с `private`/`#` полями, `unique symbol`. Ещё следствие — `Object.keys` возвращает `string[]`, а `for...in` — `string`.
</details>

<details><summary>Почему `Object.keys(obj)` возвращает `string[]`, а не `(keyof T)[]`?</summary>

Потому что объект типа `T` в рантайме может содержать дополнительные свойства (подтип при структурной типизации). Типизация `(keyof T)[]` была бы unsound. Если вы уверены — пишут хелпер `const keys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[]`, осознанно принимая риск.
</details>

<details><summary>Что такое excess property check и почему он не срабатывает через переменную?</summary>

Проверка лишних свойств у «свежих» объектных литералов, присваиваемых в типизированную позицию. Это эвристика против опечаток, а не часть отношения присваиваемости. Когда литерал сохранён в переменную, он теряет freshness, и работает обычная структурная совместимость, где лишние свойства допустимы. Для union-ов TS проверяет, существует ли свойство хотя бы в одном члене (и для discriminated unions — в выбранном).
</details>

<details><summary>any vs unknown: почему в коде должно быть unknown?</summary>

`unknown` — типобезопасный top type: принять можно всё, использовать — только после сужения. `any` отключает проверку и распространяется по выражениям. Для внешних данных — `unknown` + runtime-валидация (zod/valibot) или type guard. Для senior: `useUnknownInCatchVariables` входит в `strict`; `JSON.parse` и `Response.json()` всё ещё возвращают `any` — оборачивайте их; есть `ts-reset` для перетипизации стандартной библиотеки.
</details>

<details><summary>Что такое never и где он появляется?</summary>

Bottom type, пустое множество значений. Появляется: как тип функции, которая бросает или зацикливается; в недостижимой ветке после исчерпывающего сужения; при пересечении несовместимых типов; в conditional types как «удалить член union-а» (`T extends X ? never : T`). Используется для exhaustive check (`const _: never = x`). `never` в union исчезает — поэтому фильтрация работает.
</details>

<details><summary>Почему `() => number` присваивается к `() => void`?</summary>

`void` в позиции возвращаемого типа функционального типа означает «результат игнорируется». Это позволяет передавать в `forEach` колбэки, которые что-то возвращают (`arr.forEach(x => set.add(x))`). Но в объявлении функции с аннотацией `: void` вернуть значение нельзя. Если вам важно, чтобы колбэк ничего не возвращал, используйте `undefined` в качестве возвращаемого типа.
</details>

<details><summary>Чем `{}` отличается от `object` и `Object`?</summary>

`{}` — любое не-nullish значение (вкл. примитивы). `object` — любые непримитивы (объекты, массивы, функции). `Object` — интерфейс прототипа, ведёт себя почти как `{}`, использовать не стоит. Для «словаря» — `Record<string, unknown>`.
</details>

<details><summary>Когда стоит явно аннотировать возвращаемый тип?</summary>

На публичных границах модулей и библиотек (контракт, читаемые `.d.ts`, ошибки в месте реализации, а не у потребителей), для рекурсивных функций, при `isolatedDeclarations`, и в горячих местах для скорости проверки. Внутри модуля — доверять выводу.
</details>

## Практика

**1. Предскажи типы.**

```ts
const a = [1, 2] ;
const b = [1, 2] as const;
let c = null;
const d = { x: 1, y: 'a' as const };
const e = Math.random() > 0.5 ? 'a' : 1;
```

<details><summary>Ответ</summary>

`a: number[]`, `b: readonly [1, 2]`, `c` — «evolving any»: при `noImplicitAny` тип `let c = null` уточняется последующими присваиваниями (после `c = 1` это `number`), без `strictNullChecks` `null` просто расширяется до `any`, `d: { x: number; y: 'a' }`, `e: 'a' | 1` (const + условное выражение даёт union литералов).
</details>

**2. Почему ошибка и как исправить тремя способами?**

```ts
type Theme = { mode: 'dark' | 'light' };
const raw = { mode: 'dark' };
const t: Theme = raw; // ❌
```

<details><summary>Ответ</summary>

`raw.mode` расширился до `string`. Исправления: `const raw = { mode: 'dark' } as const`; `const raw: Theme = { mode: 'dark' }`; `const raw = { mode: 'dark' } satisfies Theme` (сохраняет литерал и проверяет форму).
</details>

**3. Компилируется ли?**

```ts
interface Named { name: string }
const fn = (n: Named) => n.name;
const user = { name: 'A', age: 3 };
fn(user);
fn({ name: 'A', age: 3 });
```

<details><summary>Ответ</summary>

Первый вызов — да (структурная совместимость). Второй — нет: excess property check у свежего литерала (`age` does not exist in type `Named`).
</details>

## Источники
- [TypeScript for JavaScript Programmers (TS in 5 minutes)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Performance wiki (interfaces vs intersections)](https://github.com/microsoft/TypeScript/wiki/Performance)
- [TS 5.5 release notes — inferred type predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
