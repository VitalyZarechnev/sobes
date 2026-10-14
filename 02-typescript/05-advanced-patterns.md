# Продвинутые паттерны

> ⏱ ~3 ч · 🎯 Применять branded types, `satisfies`, `as const`, перегрузки, declaration merging и module augmentation; выбирать между enum и union; типизировать ошибки через Result и связывать типы с runtime-валидацией.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю разницу аннотации, `as`, `satisfies`, `as const`
- [ ] Умею расширять сторонние типы (module augmentation, global)
- [ ] Аргументирую enum vs union и знаю проблемы enum
- [ ] Понимаю TC39-декораторы vs `experimentalDecorators`
- [ ] Проектирую типизированные ошибки (Result) и runtime-валидацию на границах

## Теория

### Branded (nominal) types

Структурная типизация не различает `UserId` и `OrderId`. Бренд — фантомное свойство, которого нет в рантайме:

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email = Brand<string, 'Email'>;

// Единственный «конструктор» — smart constructor с валидацией
function toEmail(s: string): Email {
  if (!/^[^@\s]+@[^@\s]+$/.test(s)) throw new Error('Invalid email');
  return s as Email;
}

declare function getUser(id: UserId): void;
const oid = 'o1' as OrderId;
getUser(oid);        // ❌ OrderId не присваивается к UserId
getUser('u1');       // ❌ голая строка тоже
const len = oid.length; // ✅ это всё ещё string
```

Применения: идентификаторы, валидированные значения (`Email`, `NonEmptyString`, `PositiveInt`), единицы измерения, санитизированный HTML (`SafeHtml`). Brand — способ закодировать **«это значение прошло проверку»** в типе (parse, don't validate). В zod есть `.brand<'Email'>()`.

### Перегрузки функций (overloads)

```ts
function createElement(tag: 'a'): HTMLAnchorElement;
function createElement(tag: 'canvas'): HTMLCanvasElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {   // сигнатура реализации — не видна снаружи
  return document.createElement(tag);
}
```

Правила: перегрузки проверяются сверху вниз — специфичные выше общих; реализация должна быть совместима со всеми. Часто перегрузки можно заменить union-параметром или дженериком с conditional return type — предпочитайте их, если не меняется **количество/форма** параметров. Минусы перегрузок: тело реализации проверяется слабо (по общей сигнатуре), `ReturnType`/`Parameters` берут только последнюю.

### Аннотация vs `as` vs `satisfies` vs `as const`

| Конструкция | Проверяет | Тип переменной |
|---|---|---|
| `const x: T = v` | `v` присваиваем к T (+ excess check) | T (литералы теряются) |
| `const x = v as T` | только что типы «пересекаются» | T — **приведение**, можно соврать |
| `const x = v satisfies T` | `v` присваиваем к T (+ excess check) | выведенный тип `v` (узкий) |
| `const x = v as const` | ничего | readonly, литералы |
| `const x = v as const satisfies T` | присваиваемость | readonly-литералы, проверенные по T |

```ts
type Route = { path: string; auth?: boolean };

const routes = {
  home:  { path: '/' },
  admin: { path: '/admin', auth: true },
} satisfies Record<string, Route>;

routes.admin.auth;    // boolean (true) — тип сохранён, а не Route
routes.nope;          // ❌ ключи известны — с аннотацией Record<string, Route> это было бы ок (и undefined в рантайме)

const palette = { red: [255, 0, 0], green: '#0f0' } satisfies Record<string, string | number[]>;
palette.green.toUpperCase(); // ✅ string, а не string | number[]
```

💡 На собеседовании: «`satisfies` — проверка без расширения; аннотация — контракт, который расширяет тип; `as` — отказ от проверки, допустим только с обоснованием (например, после runtime-валидации или в тестах)». `as unknown as T` (double assertion) — красный флаг в ревью.

### Declaration merging

Слияние нескольких объявлений с одним именем:
- `interface` + `interface` — члены объединяются (при конфликте типов — ошибка; методы становятся перегрузками, поздние — выше);
- `namespace` + `class`/`function`/`enum` — добавление статических членов;
- `enum` + `enum`.

```ts
function Button() { /* ... */ }
namespace Button { export const displayName = 'Button'; } // добавили статическое свойство функции
```

Классы с классами и type alias не сливаются.

### Module augmentation и global augmentation

Расширение чужих типов без форка:

```ts
// src/types/express.d.ts — файл обязан быть модулем (import/export), иначе это объявление, а не augmentation
import 'express';
declare module 'express-serve-static-core' {
  interface Request { user?: { id: string; roles: string[] } }
}

// Vue 3: глобальные свойства
declare module 'vue' {
  interface ComponentCustomProperties { $t: (key: string) => string }
}

// Глобальные переменные из модуля
export {};
declare global {
  interface Window { __APP_CONFIG__: { apiUrl: string } }
  var __DEV__: boolean;   // var, не let/const — только var попадает в globalThis
}

// Типы env-переменных Vite
interface ImportMetaEnv { readonly VITE_API_URL: string }
```

Ограничения: augmentation не может добавлять новые top-level объявления в модуль — только расширять существующие (интерфейсы, namespace). Нельзя изменить тип существующего свойства.

### enum vs union literals

```ts
enum Status { Active = 'active', Blocked = 'blocked' }          // строковый enum — номинальный
enum Dir { Up, Down }                                              // числовой: reverse mapping, Dir[0] === 'Up'
const enum Flags { A = 1, B = 2 }                                  // инлайнится, не генерирует объект

type StatusU = 'active' | 'blocked';                               // union literals
const STATUS = { Active: 'active', Blocked: 'blocked' } as const;  // «enum-объект»
type StatusO = (typeof STATUS)[keyof typeof STATUS];
```

| | `enum` | union / `as const` объект |
|---|---|---|
| Рантайм | генерирует код (IIFE), не erasable | union — ноль кода; объект — обычный JS |
| Совместимость | строковые — номинальны: `'active'` не присваивается к `Status` | структурно: литерал подходит |
| Числовые | любое `number` присваивалось к числовому enum (исправлено частично в 5.0) | — |
| Изоляция | `const enum` ломается с `isolatedModules` / в `.d.ts` библиотек | без проблем |
| Node type stripping / `erasableSyntaxOnly` | **запрещены** | работают |

Современная рекомендация: union literals или `as const` объект. Enum допустим в легаси и где нужна именно номинальность (но для неё лучше brand).

### Классы: возможности, о которых спрашивают

```ts
abstract class Repository<T extends { id: string }> extends EventTarget {
  protected readonly items = new Map<string, T>();
  abstract validate(x: unknown): x is T;                // реализация обязательна в наследнике
  constructor(private readonly name: string) { super(); } // parameter property (не erasable!)
  #secret = 1;                                          // ES private — настоящая приватность в рантайме
  private soft = 2;                                     // TS private — только компиляция, obj['soft'] доступен
  override dispatchEvent(e: Event) { return super.dispatchEvent(e); } // override + noImplicitOverride
  accessor count = 0;                                   // auto-accessor (TS 4.9, для декораторов)
}
```

- `private` vs `#private`: первое стирается и обходится через `['x']`, второе — runtime-приватность, но несовместимо с Proxy и чуть медленнее в старых движках;
- `implements` проверяет форму класса, но **не** влияет на вывод типов параметров методов;
- `useDefineForClassFields` (true при target ≥ ES2022) меняет семантику полей: `[[Define]]` вместо присваивания — ломает поля, перекрывающие accessor-ы базового класса, и легаси-декораторы. Для объявления без инициализации — `declare field: T`.

### Декораторы (TC39, TS 5.0)

TS 5.0 поддерживает стандартные декораторы stage 3 без флага. Старые — за `experimentalDecorators` (Angular, NestJS, TypeORM, MobX до 6).

```ts
function logged<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  ctx: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  const name = String(ctx.name);
  return function (this: This, ...args: Args): R {
    console.log(`→ ${name}`, args);
    return target.call(this, ...args);
  };
}

class Api {
  @logged fetchUser(id: string) { return { id }; }
}
```

Отличия от legacy: другая сигнатура (`(value, context)`), нет декораторов параметров, нет `emitDecoratorMetadata` (вместо него — `Symbol.metadata` через `context.metadata`, TS 5.2), инициализаторы через `context.addInitializer`. Миграция фреймворков на стандарт идёт постепенно — на собеседовании важно назвать, что это две разные несовместимые системы.

### Типизация ошибок: Result type

`throw` в TS не типизирован: в сигнатуре нет информации об ошибках, `catch (e)` — `unknown`. Для **ожидаемых** ошибок (валидация, 404, бизнес-отказы) — возвращать их значением:

```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

type ApiError =
  | { kind: 'network'; cause: unknown }
  | { kind: 'http'; status: number; body: unknown }
  | { kind: 'validation'; issues: string[] };

async function getJson<T>(url: string, parse: (x: unknown) => Result<T, string[]>): Promise<Result<T, ApiError>> {
  let res: Response;
  try { res = await fetch(url); } catch (cause) { return err({ kind: 'network', cause }); }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) return err({ kind: 'http', status: res.status, body });
  const parsed = parse(body);
  return parsed.ok ? parsed : err({ kind: 'validation', issues: parsed.error });
}

const r = await getJson('/api/user', parseUser);
if (!r.ok) {
  switch (r.error.kind) { /* exhaustive обработка каждого вида */ }
}
declare function parseUser(x: unknown): Result<{ id: string }, string[]>;
```

Trade-offs: явность и exhaustive обработка vs многословность и «заражение» сигнатур. Исключения оставляют для **неожиданного** (баги, инварианты). Библиотеки: `neverthrow`, `Effect`. Lead-аргумент: договориться в команде о границе — где Result, где throw.

### Runtime-валидация: zod-подход

Типы стираются — на границах (HTTP, localStorage, postMessage, env, формы) данные `unknown`. Подход «схема — источник истины, тип выводится из неё»:

```ts
import { z } from 'zod';

const User = z.object({
  id: z.uuid(),                            // zod 4: форматы — top-level
  email: z.email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.coerce.date(),
});
type User = z.infer<typeof User>;          // тип из схемы — одна правда

const parsed = User.safeParse(await res.json());
if (!parsed.success) console.error(parsed.error.issues);
else parsed.data.createdAt.getFullYear();  // Date, а не string
```

Альтернативы: valibot (tree-shakable, меньше бандл), ArkType, Standard Schema (общий интерфейс для библиотек валидации — его поддерживают tRPC, TanStack Form и др.), генерация из OpenAPI (`openapi-typescript`). Валидация env при старте — тот же подход.

## Вопросы с собеседований

<details><summary>Что такое branded types и зачем они в структурной системе?</summary>

Пересечение базового типа с фантомным свойством-маркером (`string & { [brand]: 'UserId' }`). Делают совместимость номинальной: нельзя перепутать `UserId` и `OrderId`. Создаются только через smart constructor с проверкой — тип кодирует факт валидации. Рантайм-стоимость нулевая.
</details>

<details><summary>`satisfies` vs аннотация vs `as`?</summary>

Аннотация проверяет и задаёт тип переменной (расширяет). `satisfies` проверяет, но оставляет выведенный узкий тип — идеально для конфигов и мап. `as` — приведение без полной проверки (только «пересекаемость» типов), источник багов. `as const satisfies T` — readonly-литералы с проверкой формы.
</details>

<details><summary>Почему многие команды отказываются от enum?</summary>

Enum — не erasable синтаксис (генерирует код), не работает с Node type stripping и `erasableSyntaxOnly`; `const enum` ломается с `isolatedModules` и в библиотеках; строковые enum номинальны (неудобно с JSON); числовые enum исторически принимали любое число, есть reverse mapping. Union literals + `as const` объект дают то же без минусов.
</details>

<details><summary>Как добавить поле в `Request` Express или `Window`?</summary>

Module augmentation: `declare module 'express-serve-static-core' { interface Request { user?: User } }` в `.d.ts`-файле, который является модулем. Для глобалов — `declare global { interface Window { ... } }` внутри модуля (`export {}`). Работает за счёт declaration merging интерфейсов. Файл должен попадать в `include`.
</details>

<details><summary>Когда перегрузки, а когда дженерик/union?</summary>

Если различается только тип одного параметра и возвращаемый тип зависит от него — union или дженерик с conditional return. Перегрузки — когда меняется арность/форма параметров (например `on(event, cb)` vs `on(map)`), или для DX автодополнения. Помнить: реализация проверяется по общей сигнатуре, `ReturnType` видит последнюю перегрузку.
</details>

<details><summary>Чем стандартные декораторы отличаются от experimentalDecorators?</summary>

Разные спецификации и API. Стандартные: `(value, context)`, контекст с `kind`, `name`, `addInitializer`, `metadata`; нет декораторов параметров и `emitDecoratorMetadata`. Legacy: `(target, key, descriptor)`, есть параметры и reflect-metadata (на этом построен DI в Angular/NestJS). Смешивать нельзя; флаг `experimentalDecorators` переключает систему целиком.
</details>

<details><summary>Как типизировать ошибки, если `throw` не типизирован?</summary>

Для ожидаемых ошибок — Result/Either: discriminated union `{ ok: true, value } | { ok: false, error }`, с union видов ошибок и exhaustive обработкой. Для неожиданных — исключения + `unknown` в catch + сужение через `instanceof`/guards. Классы ошибок с полем `code`/`kind`. `Error.cause` (ES2022) для цепочек.
</details>

<details><summary>Зачем zod, если есть TypeScript?</summary>

TS проверяет только код, который вы контролируете; данные извне — `unknown` в рантайме. Zod даёт runtime-проверку и выводит статический тип из схемы, устраняя рассинхрон «тип vs валидатор». Плюс трансформации (coerce, default), понятные ошибки для форм. Минусы: размер бандла (valibot легче), стоимость парсинга больших ответов, сложные схемы замедляют tsc.
</details>

<details><summary>`private` vs `#private`?</summary>

`private` — проверка только при компиляции, в рантайме обычное свойство (доступно через `obj['x']`, видно в `JSON.stringify`). `#x` — настоящая приватность движка, недоступна снаружи, не перечисляется; не работает через Proxy-обёртки (brand check). Оба делают класс номинальным для совместимости.
</details>

<details><summary>Что такое declaration merging и где оно реально нужно?</summary>

Слияние одноимённых объявлений: interface+interface, namespace+function/class/enum. Нужно для augmentation сторонних библиотек (Express, Vue, i18next, styled-components theme), для статических свойств функций-компонентов, для расширения глобалов. Обратная сторона — неожиданные слияния с глобальными интерфейсами (например, ваш `interface Comment` сливается с DOM `Comment` в глобальном скрипте) — ещё причина писать модули.
</details>

## Практика

**1. Перепишите enum на erasable-эквивалент, сохранив `Status.Active` в коде и тип `Status`.**

<details><summary>Решение</summary>

```ts
export const Status = { Active: 'active', Blocked: 'blocked' } as const;
export type Status = (typeof Status)[keyof typeof Status]; // одно имя для значения и типа — это нормально
const s: Status = Status.Active; // и 'active' тоже подходит
```
</details>

**2. Сделайте тип `NonEmptyArray<T>` и функцию, которая принимает только непустой массив.**

<details><summary>Решение</summary>

```ts
type NonEmptyArray<T> = readonly [T, ...T[]];
const isNonEmpty = <T>(xs: readonly T[]): xs is NonEmptyArray<T> => xs.length > 0;
function max(xs: NonEmptyArray<number>): number { return Math.max(...xs); }
max([]);        // ❌
const arr: number[] = [];
if (isNonEmpty(arr)) max(arr); // ✅
```
</details>

**3. Типизируйте конфиг фич-флагов**: значения проверяются по схеме, но ключи и литералы сохраняются.

<details><summary>Решение</summary>

```ts
type Flag = { enabled: boolean; rollout?: number };
const flags = {
  newCheckout: { enabled: true, rollout: 10 },
  darkMode: { enabled: false },
} as const satisfies Record<string, Flag>;
type FlagName = keyof typeof flags; // 'newCheckout' | 'darkMode'
```
</details>

## Источники
- [Handbook: Everyday Types — type assertions, literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Handbook: More on Functions — overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TS 4.9 — satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TS 5.0 — decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
- [Zod](https://zod.dev/)
- [Standard Schema](https://standardschema.dev/)
