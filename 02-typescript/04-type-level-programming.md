# Программирование на уровне типов

> ⏱ ~4 ч · 🎯 Читать и писать conditional/mapped/template literal типы, понимать дистрибутивность и `infer`, реализовать встроенные utility types руками и знать, когда type-level магия вредит.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Свободно комбинирую `keyof`, `typeof`, indexed access `T[K]`
- [ ] Понимаю дистрибутивность conditional types и как её отключить `[T]`
- [ ] Использую `infer` (в т.ч. `infer X extends C`)
- [ ] Пишу mapped types с модификаторами `-readonly`/`-?` и key remapping через `as`
- [ ] Реализую Pick/Omit/Partial/Record/Exclude/Extract/ReturnType/Awaited руками

## Теория

Думайте о типах как о **множествах значений**, а о type-level как о функциональном языке: дженерик-алиас — функция, conditional — `if`, `infer` — pattern matching, рекурсия — циклы, union — «список», mapped type — `map` по ключам.

### Операторы-«кирпичи»: `keyof`, `typeof`, indexed access

```ts
const config = { api: 'https://x', retries: 3, features: ['a', 'b'] } as const;

type Config = typeof config;               // typeof в позиции типа — тип значения
type Keys = keyof Config;                  // "api" | "retries" | "features"
type Retries = Config['retries'];          // 3
type Values = Config[keyof Config];        // "https://x" | 3 | readonly ["a", "b"]
type Feature = Config['features'][number]; // "a" | "b" — [number] достаёт элемент массива/кортежа

type Arr = string[];
type K = keyof Arr;                        // number | "length" | "push" | ... — у массивов keyof «шумный»
type Dict = { [k: string]: boolean };
type DK = keyof Dict;                      // string | number — числовые ключи приводятся к строкам в JS
```

🪤 Ловушка: `typeof` в позиции типа работает только с идентификаторами и доступом к свойствам (`typeof obj.a`), не с вызовами (`typeof fn()` — нельзя; используйте `ReturnType<typeof fn>`).

Шаблон «значения как источник правды»:

```ts
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number];       // "admin" | "editor" | "viewer"
const isRole = (x: string): x is Role => (ROLES as readonly string[]).includes(x);
```

### Conditional types

`T extends U ? X : Y` — «если T присваиваем к U».

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<'a'>;      // true
type B = IsString<string | number>; // boolean (!) — см. дистрибутивность
```

**Дистрибутивность.** Если проверяемый тип — **голый параметр типа** (naked type parameter), conditional применяется к каждому члену union по отдельности, а результаты объединяются:

```ts
type ToArray<T> = T extends unknown ? T[] : never;
type X = ToArray<string | number>;  // string[] | number[]

type ToArrayND<T> = [T] extends [unknown] ? T[] : never; // обёртка в кортеж отключает дистрибуцию
type Y = ToArrayND<string | number>; // (string | number)[]
```

Следствия:
- `never` — пустой union, поэтому `ToArray<never>` = `never` (distribution по нулю членов). Проверка «это never?» пишется как `[T] extends [never]`.
- `boolean` = `true | false` — тоже распределяется.
- Встроенные `Exclude`/`Extract`/`NonNullable` построены на дистрибутивности.

```ts
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type IsNever<T> = [T] extends [never] ? true : false;
```

### `infer` — извлечение типа по образцу

```ts
type MyReturnType<T> = T extends (...args: any) => infer R ? R : never;
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type PromiseValue<T> = T extends PromiseLike<infer V> ? V : T;

// infer с ограничением (TS 4.7): извлечь, только если подходит
type FirstString<T> = T extends [infer H extends string, ...unknown[]] ? H : never;
type N = FirstString<['a', 1]>; // "a"

// Строковый pattern matching
type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
```

Нюансы `infer`:
- несколько `infer` одного имени в ковариантных позициях → union, в контравариантных → intersection (на этом построен `UnionToIntersection`, см. [07](07-practice-tasks.md));
- для перегруженных функций `infer` берёт **последнюю** сигнатуру — поэтому `ReturnType` перегрузок неполон.

### Mapped types

Итерация по ключам: `{ [K in Keys]: ... }`. Если `Keys` — `keyof T`, это **гомоморфный** mapped type: он сохраняет модификаторы `readonly`/`?` исходного T и корректно работает с массивами/кортежами (отображает их в массивы/кортежи).

```ts
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };       // -? снимает опциональность
type Mutable<T>    = { -readonly [K in keyof T]: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyRecord<K extends PropertyKey, V> = { [P in K]: V };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

**Key remapping через `as` (TS 4.1)**:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type G = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Фильтрация ключей: never в as — ключ удаляется
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type MyOmit<T, K extends PropertyKey> = { [P in keyof T as P extends K ? never : P]: T[P] };
```

🪤 Ловушка: встроенный `Omit<T, K extends keyof any>` — **не** гомоморфен по отношению к union: `Omit<A | B, 'x'>` схлопывает union в общие ключи. Для discriminated unions нужен дистрибутивный вариант:

```ts
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
```

Также `Omit` не проверяет, что `K` существует в `T` (`K extends keyof any`) — опечатки проходят молча; строгий вариант: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`.

### Template literal types

```ts
type Locale = 'en' | 'ru';
type Ns = 'common' | 'auth';
type Key = `${Locale}.${Ns}`;            // 4 комбинации — декартово произведение union
type EventName<T extends string> = `on${Capitalize<T>}`;
type CssVar = `--${string}`;            // паттерн: любая строка с префиксом

// Встроенные intrinsic-типы: Uppercase, Lowercase, Capitalize, Uncapitalize

// Парсинг строк на уровне типов
type RouteParams<S extends string> =
  S extends `${string}:${infer P}/${infer Rest}` ? P | RouteParams<`/${Rest}`>
  : S extends `${string}:${infer P}` ? P
  : never;
type P = RouteParams<'/users/:id/posts/:postId'>; // "id" | "postId"

declare function route<S extends string>(path: S, params: Record<RouteParams<S>, string>): string;
route('/users/:id', { id: '1' }); // ✅, { uid: '1' } — ❌
```

Комбинаторный взрыв: `${A}${B}${C}` с union по 50 членов — 125 000 → ошибка «too complex». Держите union-ы маленькими.

### Рекурсивные типы

```ts
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Хвостовая рекурсия в conditional types (TS 4.5) — лимит глубины ~1000 вместо ~50
type Repeat<S extends string, N extends number, Acc extends unknown[] = [], Out extends string = ''> =
  Acc['length'] extends N ? Out : Repeat<S, N, [...Acc, unknown], `${Out}${S}`>;
type R = Repeat<'ab', 3>; // "ababab"
```

Арифметика через длину кортежей (`Acc['length']`) — стандартный трюк type-challenges, но в продакшене это сигнал остановиться.

### Variadic tuple types

```ts
type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;

// Типизация partial application
declare function bind<A extends unknown[], B extends unknown[], R>(
  fn: (...args: [...A, ...B]) => R, ...head: A
): (...tail: B) => R;
```

### Встроенные utility types: что есть и как устроены

| Утилита | Реализация (упрощённо) |
|---|---|
| `Partial`, `Required`, `Readonly` | гомоморфные mapped с `?`, `-?`, `readonly` |
| `Record<K, V>` | `{ [P in K]: V }` |
| `Pick<T, K>` / `Omit<T, K>` | mapped по `K` / `Pick<T, Exclude<keyof T, K>>` |
| `Exclude`, `Extract`, `NonNullable` | дистрибутивные conditional (`NonNullable<T> = T & {}` с 4.8) |
| `ReturnType`, `Parameters`, `ConstructorParameters`, `InstanceType` | `infer` |
| `Awaited<T>` | рекурсивно разворачивает thenable |
| `ThisParameterType`, `OmitThisParameter`, `ThisType` | работа с `this` |
| `NoInfer<T>` | intrinsic (5.4) |
| `Uppercase` и др. | intrinsic — реализованы в компиляторе |

💡 На собеседовании: важно не только написать `DeepPartial`, но и сказать, где остановиться — сложные типы замедляют IDE, дают нечитаемые ошибки и становятся «кодом без тестов». Для type-level кода пишите тесты (`expectTypeOf` из Vitest, `tsd`, `@ts-expect-error`).

## Вопросы с собеседований

<details><summary>Что такое дистрибутивные conditional types?</summary>

Когда в `T extends U ? X : Y` слева голый параметр типа и в него подставлен union, условие применяется к каждому члену отдельно, результаты объединяются. Так работают `Exclude`/`Extract`. Отключается обёрткой `[T] extends [U]`. Следствие: `never` распределяется в `never`, поэтому `IsNever` пишут через кортеж.
</details>

<details><summary>Как работает `infer`?</summary>

Объявляет переменную типа внутри `extends`-ветки conditional type; TS выводит её, сопоставляя T с шаблоном. Доступна только в true-ветке. С 4.7 можно ограничить: `infer X extends string`. Несколько кандидатов в ковариантных позициях дают union, в контравариантных — intersection. Для перегрузок берётся последняя сигнатура.
</details>

<details><summary>Что такое гомоморфный mapped type и почему это важно?</summary>

Mapped type вида `{ [K in keyof T]: ... }`, где T — параметр типа. Он сохраняет модификаторы `readonly`/`?` исходника, дистрибутивен по union и сохраняет массивы и кортежи как массивы/кортежи (`Partial<[a, b]>` → `[a?, b?]`). Если перебирать `K in Keys` с отдельно вычисленными ключами — эти свойства теряются.
</details>

<details><summary>Почему `Omit` плохо работает с discriminated union?</summary>

`keyof (A | B)` — только общие ключи, и `Omit` строит один объект по ним — дискриминированные варианты теряются. Решение — дистрибутивный `DistributiveOmit<T, K> = T extends unknown ? Omit<T, K> : never`. Плюс `Omit` не проверяет наличие ключа.
</details>

<details><summary>Как реализован `Awaited`?</summary>

Рекурсивно: если `T` — `null | undefined`, вернуть как есть; если объект с методом `then(onfulfilled: infer F, ...)`, а `F` — функция с первым аргументом `infer V`, то `Awaited<V>`; иначе `T`. Он учитывает thenable, а не только `Promise`, и разворачивает вложенные промисы — поведение соответствует `await`. Решение — в [07](07-practice-tasks.md).
</details>

<details><summary>Что такое key remapping в mapped types?</summary>

Клауза `as` после `in`: `{ [K in keyof T as NewKey]: ... }`. Позволяет переименовывать ключи (через template literals) и фильтровать (вернуть `never`). Пример: геттеры, `PickByValue`, удаление приватных `_`-полей.
</details>

<details><summary>Как ограничена рекурсия типов?</summary>

Глубина инстанцирования ограничена (~50 для обычной рекурсии в conditional, ~1000 для хвостовой с TS 4.5), union — 100 000 членов. При превышении — «Type instantiation is excessively deep and possibly infinite». Для хвостовой рекурсии используют аккумулятор. Лимиты — сигнал упростить дизайн.
</details>

<details><summary>Чем `keyof typeof obj` отличается от `keyof obj`?</summary>

`keyof` работает с типами, а `obj` — значение. `typeof obj` переводит значение в его тип, затем `keyof` берёт ключи. `keyof obj` — синтаксическая ошибка.
</details>

<details><summary>Когда type-level программирование оправдано, а когда вредит?</summary>

Оправдано в библиотеках и платформенном коде, где сложность типов окупается безопасностью тысяч мест использования: роутер с параметрами из строки, i18n-ключи, типобезопасный API-клиент, формы. Вредит в прикладном коде: медленная IDE, нечитаемые ошибки, высокий порог входа для команды. Lead-позиция: ограничивать в code review, требовать тесты типов и комментарии, предпочитать генерацию кода (OpenAPI → типы) ручной магии.
</details>

## Практика

**1. Напишите `PickByValue<T, V>` и `OmitByValue<T, V>`.**

<details><summary>Решение</summary>

```ts
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type OmitByValue<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] };
type F = PickByValue<{ a: string; b: () => void; c: number }, Function>; // { b: () => void }
```
</details>

**2. Предскажи результат.**

```ts
type T1 = keyof { a: 1 } | { b: 2 };
type T2 = keyof ({ a: 1 } | { a: 2; b: 2 });
type T3 = Exclude<'a' | 'b' | 1, string>;
type T4 = (string | number)[] extends string[] ? 1 : 0;
type T5 = boolean extends true ? 1 : 0;
type T6<T> = T extends true ? 1 : 0; type R6 = T6<boolean>;
```

<details><summary>Ответ</summary>

`T1 = "a" | { b: 2 }` (приоритет: `keyof` применяется только к первому); `T2 = "a"` (общие ключи); `T3 = 1`; `T4 = 0`; `T5 = 0` (не параметр — нет дистрибуции); `R6 = 0 | 1` (дистрибуция по `true | false`).
</details>

**3. Типизируйте `camelize` ключей объекта на уровне типов.**

<details><summary>Решение</summary>

```ts
type CamelCase<S extends string> =
  S extends `${infer H}_${infer T}` ? `${H}${CamelCase<Capitalize<T>>}` : S;
type CamelizeKeys<T> = T extends readonly unknown[]
  ? { [K in keyof T]: CamelizeKeys<T[K]> }
  : T extends object
    ? { [K in keyof T as K extends string ? CamelCase<K> : K]: CamelizeKeys<T[K]> }
    : T;
type R = CamelizeKeys<{ user_id: 1; user_info: { first_name: 'a' } }>;
// { userId: 1; userInfo: { firstName: 'a' } }
```
</details>

## Источники
- [Handbook: Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Handbook: Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
- [Handbook: Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)
- [Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TS 4.5 — tail-recursion elimination on conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)
- [type-challenges](https://github.com/type-challenges/type-challenges)
