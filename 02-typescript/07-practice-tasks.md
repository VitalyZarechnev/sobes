# Практика: type challenges

> ⏱ ~4 ч · 🎯 Уверенно решать задачи уровня easy/medium из type-challenges у доски, объясняя каждый шаг, и применять те же приёмы в прикладных задачах: типизированный EventEmitter, доступ по пути, fetch-клиент.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Решил easy: MyPick, MyReadonly, TupleToUnion, MyReturnType, MyParameters
- [ ] Решил medium: DeepReadonly, DeepPartial, MyAwaited, UnionToIntersection
- [ ] Решил прикладные: PathKeys/Get, TypedEmitter, fetch-клиент
- [ ] Каждое решение могу объяснить вслух за 1–2 минуты

## Теория

### Как решать type-задачи на собеседовании

1. **Проговорите сигнатуру и ограничения**: какие параметры, что на входе (union? кортеж? объект?), какие граничные случаи (`never`, `any`, union, readonly, optional, функции, массивы).
2. **Выберите инструмент**: перебор ключей → mapped type; разбор формы → conditional + `infer`; итерация по кортежу/строке → рекурсия; объединение/пересечение → дистрибутивность или контравариантность.
3. **Проверьте на примерах** — пишите тест-кейсы типами.

Хелперы для тестов типов (как в type-challenges):

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type cases = [Expect<Equal<Pick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>];
```

`Equal` сравнивает типы через отложенные conditional types — так различаются `any` и `unknown`, `readonly` и мутабельные свойства; наивный `[A] extends [B] ? [B] extends [A] ...` этого не умеет. В продакшене — `expectTypeOf` из Vitest.

### Приёмы, которые встречаются постоянно

| Приём | Код |
|---|---|
| Элементы кортежа как union | `T[number]` |
| Длина кортежа | `T['length']` |
| Голова/хвост | `T extends [infer H, ...infer R]` |
| Отключить дистрибуцию | `[T] extends [U]` |
| Проверка на `never` | `[T] extends [never]` |
| Проверка на `any` | `0 extends 1 & T ? true : false` |
| Фильтрация ключей | `as` в mapped type → `never` |
| «Расплющить» пересечение для читаемости | `type Simplify<T> = { [K in keyof T]: T[K] } & {}` |
| Union → intersection | функция в контравариантной позиции + `infer` |

## Вопросы с собеседований

<details><summary>Почему `Equal` в type-challenges такой странный?</summary>

Он сравнивает два generic-функциональных типа с отложенными conditional типами. TS считает такие сигнатуры идентичными, только если `X` и `Y` идентичны внутренне — это строже присваиваемости: `any` не равен `unknown`, `{ readonly a: 1 }` не равен `{ a: 1 }`, пересечение `{a:1} & {b:2}` не равно `{a:1; b:2}`. Это полагается на детали реализации компилятора — нормально для тестов, не для прод-логики.
</details>

<details><summary>Как отличить `any` на уровне типов?</summary>

`0 extends 1 & T`: для любого обычного T пересечение `1 & T` — это `1` или `never`, и `0` не присваивается. Для `any` пересечение даёт `any`, и условие истинно. Это классический `IsAny<T>`.
</details>

<details><summary>Как объяснить `UnionToIntersection` на пальцах?</summary>

Сначала дистрибутивно превращаем каждый член union-а в функцию, принимающую его: `((x: A) => void) | ((x: B) => void)`. Потом выводим тип параметра через `infer` из этого union-а функций. Параметры контравариантны, и когда у `infer` несколько кандидатов в контравариантной позиции, TS берёт их пересечение — функция, которую можно подставить вместо любой из них, должна принимать `A & B`.
</details>

<details><summary>Зачем в `DeepReadonly` отдельная ветка для функций?</summary>

Функции — объекты; mapped type по функции вернул бы объект с её свойствами (`{}`), и вызов бы сломался. Поэтому функции оставляют как есть. Аналогично особые случаи нужны для `Date`, `Map`, `Set` — гомоморфный mapped type по ним даёт неюзабельные структуры.
</details>

<details><summary>Почему `IsNever<T> = T extends never ? true : false` не работает?</summary>

`T` — голый параметр, поэтому conditional дистрибутивен. `never` — пустой union: распределять не по чему, результат — `never`, а не `true`. Правильно: `[T] extends [never] ? true : false`.
</details>

<details><summary>Почему `ReturnType` у перегруженной функции «теряет» варианты?</summary>

При выводе через `infer` из типа с несколькими сигнатурами TS использует последнюю (самую общую) перегрузку. Получить все варианты можно только трюками с сопоставлением с пересечением функций фиксированного числа перегрузок. Практический вывод — для API, по которому будут считать типы, предпочитать дженерики и conditional return type вместо перегрузок.
</details>

<details><summary>Как тестировать сложные типы в реальном проекте?</summary>

`expectTypeOf` / `assertType` в Vitest (`vitest --typecheck`), `tsd` для библиотек, `// @ts-expect-error` для негативных кейсов (директива сама падает, если ошибки нет). Тесты типов запускаются в CI вместе с typecheck. Для публичных пакетов дополнительно — проверка `.d.ts` через arethetypeswrong.
</details>

<details><summary>Почему в `get(obj, path)` используется `P extends PathKeys<T> & string`?</summary>

`P` выводится из литерала-аргумента, а constraint одновременно даёт автодополнение путей в IDE и ошибку на неверный путь. `& string` нужен, чтобы `P` гарантированно был строкой для `Get<T, P extends string>` и `path.split` — компилятор не всегда может доказать, что вычисленный `PathKeys<T>` для generic `T` — подтип `string`.
</details>

## Практика

### 1. MyPick (easy)

Реализуйте `Pick<T, K>` без встроенного.

```ts
interface Todo { title: string; description: string; completed: boolean }
type TodoPreview = MyPick<Todo, 'title' | 'completed'>; // { title: string; completed: boolean }
```

<details><summary>Решение</summary>

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

`K extends keyof T` — ошибка компиляции на несуществующий ключ. Mapped type перебирает выбранные ключи, indexed access берёт тип. Модификаторы (`readonly`, `?`) сохраняются, т.к. `K` — подмножество `keyof T` (TS трактует такой mapped type как гомоморфный).
</details>

### 2. MyReadonly (easy)

<details><summary>Решение</summary>

```ts
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
```

Только первый уровень: `MyReadonly<{ a: { b: 1 } }>['a']['b']` по-прежнему изменяем. И это только compile-time — в рантайме нужен `Object.freeze` (тип которого как раз `Readonly<T>`).
</details>

### 3. DeepReadonly (medium)

```ts
type X = { a: () => 22; b: string; c: { d: boolean; e: { f: string[] } } };
type R = DeepReadonly<X>;
// { readonly a: () => 22; readonly b: string; readonly c: { readonly d: boolean; readonly e: { readonly f: readonly string[] } } }
```

<details><summary>Решение</summary>

```ts
type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>>
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };
```

Почему работает для примитивов: гомоморфный mapped type, применённый к примитиву через параметр типа, возвращает сам примитив. Массивы и кортежи гомоморфный mapped type отображает в `readonly`-массивы/кортежи. Union распределяется (T — голый параметр в conditional).
</details>

### 4. DeepPartial (medium)

Нужен для `merge(defaults, overrides)`, моков в тестах, PATCH-запросов.

<details><summary>Решение</summary>

```ts
type DeepPartial<T> =
  T extends (...args: any[]) => any ? T
  : T extends readonly unknown[] ? { [K in keyof T]: DeepPartial<T[K]> } // массивы: элементы partial, индексы — нет
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type Cfg = { server: { port: number; tls: { cert: string } }; tags: { name: string }[] };
const patch: DeepPartial<Cfg> = { server: { tls: {} }, tags: [{}] }; // ✅
```

Обсудить: делать ли элементы массивов опциональными — зависит от семантики merge (заменяем массив целиком или мёржим поэлементно). Для `Date` стоит добавить ветку `T extends Date ? T`.
</details>

### 5. TupleToUnion (easy)

<details><summary>Решение</summary>

```ts
type TupleToUnion<T extends readonly unknown[]> = T[number];
// через infer — показывает понимание паттерн-матчинга:
type TupleToUnion2<T> = T extends readonly (infer E)[] ? E : never;

type U = TupleToUnion<['a', 1, true]>; // 'a' | 1 | true
```

Прикладной вариант — `(typeof ROLES)[number]` для `as const` массива.
</details>

### 6. MyAwaited (medium)

```ts
type A = MyAwaited<Promise<Promise<string>>>;                 // string
type B = MyAwaited<{ then: (onfulfilled: (v: number) => any) => any }>; // number — thenable
```

<details><summary>Решение</summary>

```ts
type MyAwaited<T> =
  T extends null | undefined ? T
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
    ? F extends (value: infer V, ...args: infer _) => any
      ? MyAwaited<V>          // рекурсия: await разворачивает вложенные промисы
      : never                 // then с неправильной сигнатурой — не thenable
    : T;
```

Это практически реализация встроенного `Awaited` из `lib.es5.d.ts`. Упрощённая версия для собеседования: `T extends PromiseLike<infer U> ? MyAwaited<U> : T`. Ключевые моменты: рекурсия (вложенные промисы), thenable вместо `Promise` (так работает `await`), дистрибутивность по union (`MyAwaited<Promise<1> | 2>` = `1 | 2`).
</details>

### 7. MyReturnType и MyParameters (easy)

<details><summary>Решение</summary>

```ts
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

declare function f(a: string, b?: number): boolean;
type R = MyReturnType<typeof f>;   // boolean
type P = MyParameters<typeof f>;   // [a: string, b?: number | undefined] — именованный кортеж
```

Почему `any`, а не `unknown` в constraint: `(...args: unknown[]) => unknown` не примет функцию с параметром `string` (контравариантность: `string` не шире `unknown`). Можно `(...args: never) => unknown` — `never[]` принимает любой список параметров. Для перегрузок берётся последняя сигнатура.
</details>

### 8. UnionToIntersection (hard по меркам собеседования)

<details><summary>Решение</summary>

```ts
type UnionToIntersection<U> =
  (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type I = UnionToIntersection<{ a: 1 } | { b: 2 }>; // { a: 1 } & { b: 2 }
type N = UnionToIntersection<'a' | 'b'>;           // never ('a' & 'b')
```

Шаг 1 — дистрибуция: `((x: {a:1}) => void) | ((x: {b:2}) => void)`. Шаг 2 — `infer I` в позиции параметра (контравариантной) с несколькими кандидатами даёт их пересечение. Применение: собрать тип из union плагинов/миксинов, `LastOfUnion` (через пересечение перегрузок) → `UnionToTuple`.
</details>

### 9. PathKeys и Get по пути (medium/hard, прикладная)

Типизируйте `get(obj, 'user.address.city')`: путь автодополняется, результат выводится. Аналог — `react-hook-form` (`Path<T>`, `PathValue<T, P>`), i18n-ключи.

<details><summary>Решение</summary>

```ts
type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date;

type PathKeys<T> =
  T extends Primitive | ((...args: any[]) => any) ? never
  : T extends readonly (infer E)[] ? `${number}` | `${number}.${PathKeys<E>}`
  : { [K in keyof T & (string | number)]-?: `${K}` | `${K}.${PathKeys<T[K]>}` }[keyof T & (string | number)];

type Step<T, K extends string> =
  K extends keyof T ? T[K]
  : T extends readonly (infer E)[] ? (K extends `${number}` ? E : never)
  : never;

type Get<T, P extends string> =
  P extends `${infer H}.${infer R}` ? Get<Step<NonNullable<T>, H>, R> : Step<NonNullable<T>, P>;

function get<T, P extends PathKeys<T> & string>(obj: T, path: P): Get<T, P> | undefined {
  let acc: unknown = obj;
  for (const key of path.split('.')) {
    if (acc === null || typeof acc !== 'object') return undefined;
    acc = (acc as Record<string, unknown>)[key];
  }
  return acc as Get<T, P>; // единственная точка доверия: рантайм-обход соответствует типу Get
}

type User = { name: string; address?: { city: string; geo: { lat: number } }; tags: { id: number }[] };
type Keys = PathKeys<User>;
// "name" | "address" | "address.city" | "address.geo" | "address.geo.lat" | "tags" | `tags.${number}` | `tags.${number}.id`
declare const u: User;
const city = get(u, 'address.city');  // string | undefined
const id = get(u, 'tags.0.id');       // number | undefined
get(u, 'address.zip');                // ❌ не входит в PathKeys<User>
```

Разбор: `-?` убирает `undefined` из значений mapped type у опциональных ключей; `${K}.${never}` = `never`, поэтому листья не порождают «хвостов»; `NonNullable` в `Get` проходит сквозь опциональные уровни; `Date` в `Primitive`, чтобы не раскрывать его методы. Для senior: упомянуть ограничение глубины рекурсии и стоимость для tsc на больших типах (в react-hook-form специально ограничивают глубину и обрабатывают циклические ссылки).
</details>

### 10. Типизированный EventEmitter

Требования: `on`/`off`/`once`/`emit`, имена событий и аргументы проверяются, `on` возвращает функцию отписки.

<details><summary>Решение</summary>

```ts
type Listener<Args extends unknown[]> = (...args: Args) => void;

export class TypedEmitter<Events extends Record<keyof Events, unknown[]>> {
  #listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    (this.#listeners[event] ??= new Set()).add(fn);
    return () => this.off(event, fn);
  }

  once<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    const off = this.on(event, (...args) => { off(); fn(...args); });
    return off;
  }

  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    this.#listeners[event]?.delete(fn);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    // копия: слушатели могут отписываться во время emit
    for (const fn of [...(this.#listeners[event] ?? [])]) {
      try { fn(...args); } catch (err) { queueMicrotask(() => { throw err; }); } // один упавший не ломает остальных
    }
  }
}

interface ChatEvents {
  message: [text: string, from: string];
  typing: [userId: string];
  disconnect: [];
}
const chat = new TypedEmitter<ChatEvents>();
const off = chat.on('message', (text, from) => console.log(from, text)); // типы выведены
chat.emit('message', 'hi', 'ann');   // ✅
chat.emit('typing');                 // ❌ ожидается 1 аргумент
chat.emit('unknown');                // ❌ нет такого события
off();
```

Детали для обсуждения: constraint `Record<keyof Events, unknown[]>` (а не `Record<string, unknown[]>`) позволяет передавать `interface` — у интерфейсов нет неявной индексной сигнатуры. Кортежи с метками дают имена параметров в подсказках. Поведение ошибок в слушателях — осознанное решение (у Node `EventEmitter` исключение прерывает `emit`). Альтернатива: `EventTarget` + `CustomEvent<T>` с типизированной картой событий.
</details>

### 11. Типобезопасный fetch-клиент

Требования: эндпоинты описаны одной картой типов; метод+путь, параметры пути, query, body и тип ответа проверяются; необязательные опции можно не передавать.

<details><summary>Решение</summary>

```ts
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteKey = `${Method} /${string}`;

type RouteParams<S extends string> =
  S extends `${string}:${infer P}/${infer Rest}` ? P | RouteParams<`/${Rest}`>
  : S extends `${string}:${infer P}` ? P
  : never;

type EndpointDef = { query?: Record<string, string | number | boolean | undefined>; body?: unknown; response: unknown };

// params выводятся из строки маршрута; если их нет — поле не нужно
type Options<K extends string, D extends EndpointDef> =
  Omit<D, 'response'> & ([RouteParams<K>] extends [never] ? {} : { params: Record<RouteParams<K>, string | number> });

// если все опции необязательны — второй аргумент можно опустить
type Args<K extends string, D extends EndpointDef> =
  {} extends Options<K, D> ? [options?: Options<K, D>] : [options: Options<K, D>];

export class HttpError extends Error {
  constructor(readonly status: number, readonly body: string) { super(`HTTP ${status}`); }
}

export function createClient<API extends { [K in keyof API]: EndpointDef }>(baseUrl: string) {
  return async function request<K extends keyof API & RouteKey>(
    route: K,
    ...[options]: Args<K, API[K]>
  ): Promise<API[K]['response']> {
    const [method, template] = route.split(' ') as [Method, string];
    const opts = (options ?? {}) as { params?: Record<string, string | number>; query?: EndpointDef['query']; body?: unknown };

    const path = template.replace(/:(\w+)/g, (_, name: string) => {
      const value = opts.params?.[name];
      if (value === undefined) throw new Error(`Missing path param "${name}"`);
      return encodeURIComponent(String(value));
    });
    const url = new URL(path, baseUrl);
    for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));

    const res = await fetch(url, {
      method,
      headers: opts.body === undefined ? {} : { 'content-type': 'application/json' },
      body: opts.body === undefined ? null : JSON.stringify(opts.body), // null, а не undefined — ок и при exactOptionalPropertyTypes
    });
    if (!res.ok) throw new HttpError(res.status, await res.text());
    return (await res.json()) as API[K]['response']; // 🪤 доверие серверу: в проде — валидация схемой
  };
}

// --- использование ---
type User = { id: string; name: string };
type Api = {
  'GET /users': { query?: { page?: number }; response: User[] };
  'GET /users/:id': { response: User };
  'POST /users': { body: { name: string }; response: User };
  'DELETE /users/:id/sessions/:sid': { response: void };
};

const api = createClient<Api>('https://example.com');
const users = await api('GET /users');                                 // User[], опции необязательны
const user = await api('GET /users/:id', { params: { id: '42' } });    // User
await api('POST /users', { body: { name: 'Ann' } });                   // ✅
await api('POST /users', { body: { nam: 'Ann' } });                    // ❌ excess property
await api('GET /users/:id');                                           // ❌ params обязательны
await api('DELETE /users/:id/sessions/:sid', { params: { id: '1' } }); // ❌ нет sid
```

Что обсудить на senior/lead уровне:
- **источник типов**: вручную описанная карта рассинхронизируется с бэкендом — генерировать из OpenAPI (`openapi-typescript` + `openapi-fetch`) или использовать end-to-end типизацию (tRPC, Hono RPC);
- **валидация ответа**: `as` — точка доверия; добавить в `EndpointDef` схему (zod/Standard Schema) и выводить `response` из неё;
- **ошибки**: вместо throw вернуть `Result<T, ApiError>` (см. [05](05-advanced-patterns.md)); отмена через `AbortSignal`; ретраи и таймауты;
- **интеграция**: обёртка для TanStack Query с ключами, выводимыми из `route` + `options`.
</details>

### 12. Бонус: предскажи результат

```ts
type A = UnionToIntersection<(() => 'a') | (() => 'b')>;
type B = MyAwaited<Promise<string> | number>;
type C = DeepReadonly<string[]>;
type D = TupleToUnion<[]>;
```

<details><summary>Ответ</summary>

`A = (() => 'a') & (() => 'b')` — пересечение функций, ведёт себя как перегрузки (на этом построен `LastOfUnion`). `B = string | number` — дистрибуция. `C = readonly string[]`. `D = never` — пустой кортеж, `[][number]` = `never`.
</details>

## Источники
- [type-challenges](https://github.com/type-challenges/type-challenges)
- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Vitest: Testing Types](https://vitest.dev/guide/testing-types)
- [openapi-typescript](https://openapi-ts.dev/)
