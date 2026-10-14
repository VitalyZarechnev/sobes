# Новинки TypeScript: 5.x, 6.0 и 7.0

> ⏱ ~2 ч · 🎯 Знать ключевые изменения TypeScript последних лет, особенно переход на 6.0 (новые умолчания и депрекейты) и 7.0 (нативный компилятор на Go), уметь спланировать миграцию проекта и объяснить, что даёт каждая фича.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Связано: [tsconfig и инструменты](06-config-and-tooling.md) · [Новинки JS](../01-javascript/15-whats-new.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, что такое TypeScript 7 и чем он отличается от 6
- [ ] Знаю новые умолчания TS 6.0 (`strict`, `types`, `rootDir`, `module`, `target`)
- [ ] Знаю, какие опции удалены или запрещены в 6.0/7.0, и могу спланировать миграцию
- [ ] Могу объяснить `NoInfer`, `const` type parameters, inferred type predicates, `satisfies`
- [ ] Знаю, что такое `erasableSyntaxOnly` и зачем он нужен для запуска TS в Node.js

## Теория

### 1. Хронология

| Версия | Дата | Главное |
|---|---|---|
| 5.0 | март 2023 | стандартные декораторы TC39, `const` type parameters, `moduleResolution: bundler`, `verbatimModuleSyntax` |
| 5.2 | август 2023 | `using` / `await using` (Explicit Resource Management) |
| 5.4 | март 2024 | `NoInfer<T>`, сохранение сужения в замыканиях после последнего присваивания |
| 5.5 | июнь 2024 | inferred type predicates, `isolatedDeclarations`, проверка синтаксиса регулярок, `@import` в JSDoc |
| 5.6 | сентябрь 2024 | запрет «всегда истинных» проверок, типы iterator helpers, `--noUncheckedSideEffectImports`, `--noCheck` |
| 5.7 | ноябрь 2024 | `--rewriteRelativeImportExtensions`, `target: es2024`, проверка никогда не инициализированных переменных |
| 5.8 | март 2025 | `--erasableSyntaxOnly`, `require()` ESM-модулей в `--module nodenext`, `--module node18` |
| 5.9 | август 2025 | `import defer`, `--module node20`, новый минимальный `tsc --init`, раскрываемые подсказки в редакторе |
| **6.0** | март 2026 | **последняя версия на JS**: новые умолчания, депрекейты всего устаревшего, `target: es2025` |
| **7.0** | июль 2026 | **нативный компилятор на Go**, сборка в 8–12 раз быстрее, депрекейты 6.0 стали ошибками |

### 2. TypeScript 7.0: нативный компилятор

TypeScript 7 — это порт компилятора и языкового сервера с TypeScript на **Go**. Логика проверки типов перенесена максимально близко к оригиналу, поэтому результаты совпадают с TS 6, а скорость выросла за счёт нативного кода и параллелизма.

- Установка та же: `npm install -D typescript`, команда — `tsc`. (Превью раньше распространялось пакетом `@typescript/native-preview`.)
- По данным команды TypeScript, полная сборка ускоряется обычно в **8–12 раз**: например, проект VS Code — со 125.7 с до 10.6 с. Потребление памяти снижается.
- Параллельная проверка типов: флаги `--checkers` (по умолчанию 4 воркера), `--builders` (параллельная сборка project references), `--singleThreaded`.
- Языковой сервер работает по LSP и многопоточно: время до первой ошибки в редакторе сократилось с секунд до долей секунды.

**Ограничения 7.0 (важно для миграции):**
- **Нет программного API** — новый API ожидается в 7.1. Инструменты, которые вызывают компилятор из кода (typescript-eslint с типовой информацией, некоторые лоадеры сборщиков, плагины), продолжают работать на 6.0. Для этого есть пакет `@typescript/typescript6` (команда `tsc6` и API 6.0), который ставится рядом через npm-алиас.
- Проверка шаблонов **Vue, Svelte, Astro, MDX** в редакторе пока требует TypeScript 6.0 (`vue-tsc` зависит от API).
- Всё, что в 6.0 было помечено устаревшим, в 7.0 — **ошибка**.
- Вывод шаблонных литеральных типов теперь работает по кодовым точкам Unicode (эмодзи — одна единица), что может сломать типы, моделировавшие UTF-16.

💡 На собеседовании: «TS 7 — это не новый язык, а тот же TypeScript, переписанный на Go ради скорости. Главный риск миграции — не код, а инструменты, которым нужен API компилятора, и конфиги с устаревшими опциями. Поэтому путь такой: сначала обновиться до 6.0 и убрать все депрекейты, затем перейти на 7 и оставить 6.0 для линтера и `vue-tsc`, пока не выйдет новый API».

### 3. TypeScript 6.0: новые умолчания

6.0 — переходная версия: она «подготавливает» проекты к 7.0. Многие опции получили современные значения по умолчанию.

| Опция | Было (5.x) | Стало (6.0) | Что это значит |
|---|---|---|---|
| `strict` | `false` | **`true`** | строгий режим по умолчанию в новых и неявных конфигах |
| `module` | зависело от `target` | `esnext` | ES-модули по умолчанию |
| `target` | `es5` | `es2025` | современный JS на выходе |
| `types` | все `@types/*` из `node_modules` | **`[]`** | глобальные типы подключаются только явно: `"types": ["node", "vitest/globals"]`; прежнее поведение — `"types": ["*"]` |
| `rootDir` | вычислялся по входным файлам | папка с `tsconfig.json` | предсказуемая структура `outDir` |
| `noUncheckedSideEffectImports` | `false` | `true` | ошибка, если `import './styles.css'` не резолвится |

🪤 Самая частая поломка при обновлении — `types: []`: внезапно «пропадают» `process`, `describe`, `expect`. Решение — явно перечислить нужные пакеты типов.

### 4. TypeScript 6.0: устаревшее и удалённое

В 6.0 эти опции дают ошибку депрекейта (её можно временно заглушить `"ignoreDeprecations": "6.0"`), а в 7.0 они удалены окончательно:

| Устарело | Чем заменить |
|---|---|
| `target: es5` | минимальный target — ES2015; для старых браузеров транспилировать сборщиком |
| `--downlevelIteration` | не нужен без ES5 |
| `moduleResolution: node` / `node10` | `bundler` (для приложений со сборщиком) или `nodenext` (для Node.js и библиотек) |
| `module: amd`, `umd`, `systemjs`, `none` | ESM; для UMD-бандлов — сборщик |
| `baseUrl` как корень поиска модулей | `paths` с относительными путями или subpath imports (`"imports": { "#/*": "./src/*" }` в `package.json`) |
| `esModuleInterop: false`, `allowSyntheticDefaultImports: false` | больше нельзя выключить — поведение всегда как при `true` |
| `alwaysStrict: false` | код всегда в strict mode |
| ключевое слово `module` для пространств имён | `namespace` |
| `import ... assert { type: 'json' }` | `import ... with { type: 'json' }` |

**Удалены уже в 6.0:** `moduleResolution: classic`, `--outFile`.

Другие изменения 6.0:
- `target`/`lib` `es2025` — типы для `RegExp.escape`, `Promise.try`, iterator helpers, Set-методов;
- в `lib: esnext` появились типы **Temporal** и `Map.getOrInsert`;
- `lib: ["dom"]` теперь включает `dom.iterable` — перебор `NodeList` работает без лишних записей;
- `--stableTypeOrdering` — порядок типов как в 7.0 (для диагностики миграции);
- `moduleResolution: bundler` можно сочетать с `module: commonjs`; поддержаны subpath imports вида `#/`;
- `--ignoreConfig` — компилировать отдельные файлы, игнорируя `tsconfig.json`.

### 5. Возможности языка 5.x, которые спрашивают на собеседованиях

**`const` type parameters (5.0)** — выводить литеральные типы без `as const` у вызывающего кода:

```ts
function routes<const T extends readonly string[]>(paths: T): T { return paths; }
const r = routes(['/home', '/about']); // readonly ['/home', '/about'], а не string[]
```

**`satisfies` (4.9)** — проверить, что значение подходит под тип, **не расширяя** его тип:

```ts
type Theme = Record<string, string | { light: string; dark: string }>;
const theme = {
  primary: '#3d5afe',
  bg: { light: '#fff', dark: '#111' },
} satisfies Theme;
theme.bg.dark; // OK — тип сохранился точным, а не string | {...}
```

**Стандартные декораторы (5.0)** — по спецификации TC39, без `experimentalDecorators`:

```ts
function logged<T extends (...args: any[]) => any>(target: T, context: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: Parameters<T>) {
    console.log(`→ ${String(context.name)}`);
    return target.apply(this, args);
  };
}
class Api { @logged fetchUser(id: string) { /* ... */ } }
```

**`NoInfer<T>` (5.4)** — запретить выводить параметр типа из конкретного аргумента:

```ts
function createMachine<S extends string>(states: S[], initial: NoInfer<S>) {}

createMachine(['idle', 'loading'], 'idle'); // OK
createMachine(['idle', 'loading'], 'idel'); // ошибка: '"idel"' не входит в '"idle" | "loading"'
// Без NoInfer S вывелся бы из обоих аргументов как 'idle' | 'loading' | 'idel',
// и опечатка прошла бы молча
```

**Inferred type predicates (5.5)** — TS сам выводит `x is T` для простых функций-фильтров:

```ts
const values = [1, null, 2, undefined];
const nums = values.filter((x) => x != null); // number[] — раньше было (number | null | undefined)[]
```

**Сужение в замыканиях (5.4)** — после последнего присваивания сужение сохраняется внутри колбэков:

```ts
function f(input: string | number) {
  if (typeof input === 'string') input = Number(input);
  return () => input.toFixed(2); // OK: TS знает, что после присваивания input — number
}
```

**`isolatedDeclarations` (5.5)** — требует явных типов у экспортов, чтобы `.d.ts` можно было генерировать без проверки типов, параллельно и быстрыми инструментами (oxc, swc). Полезно в монорепозиториях и библиотеках.

**Запрет «всегда истинных» проверок (5.6)** — ошибка на `if (/regex/)`, `if (x => 0)`, `if (obj ?? {})` и других условиях, которые не могут быть ложными.

**`--erasableSyntaxOnly` (5.8)** — запрещает конструкции, которые генерируют JS-код: `enum`, `namespace` с кодом, parameter properties (`constructor(private x)`), `import =`. Нужен, чтобы файл можно было запустить через **type stripping** — Node.js просто стирает типы без компиляции (по умолчанию с Node 23.6, бэкпортировано в 22.18).

**`import defer` (5.9)** — отложенное выполнение модуля до первого обращения к его экспорту:

```ts
import defer * as analytics from './analytics.js'; // модуль загружен, но не выполнен
button.onclick = () => analytics.track('click');   // выполнится при первом обращении
```

**`--rewriteRelativeImportExtensions` (5.7)** — переписывает `./x.ts` в `./x.js` при сборке, чтобы один и тот же код работал и через type stripping, и после компиляции.

### 6. План миграции на TS 6 → 7

1. Обновиться до 6.0, запустить `tsc` и исправить все предупреждения о депрекейтах (не глушить `ignoreDeprecations` надолго).
2. Явно задать `types`, проверить `rootDir`, `module`/`moduleResolution` (`bundler` или `nodenext`).
3. Заменить `baseUrl`-импорты на `paths` или subpath imports.
4. Включить `--stableTypeOrdering`, сравнить ошибки — так видно расхождения с 7.0 заранее.
5. Поставить TS 7 для `tsc` и редактора; инструменты, требующие API (typescript-eslint с type info, `vue-tsc`), оставить на `@typescript/typescript6` через алиас.
6. В CI измерить время проверки типов до и после — это аргумент для бизнеса.

## Вопросы с собеседований

<details><summary>Что такое TypeScript 7 и стоит ли на него переходить?</summary>

Нативный порт компилятора на Go с той же системой типов. Сборка обычно быстрее в 8–12 раз, языковой сервер отзывчивее, есть параллельная проверка. Переходить стоит, но через 6.0: сначала убрать депрекейты. Ограничения 7.0: нет программного API до 7.1, поэтому линтеры с типовой информацией и `vue-tsc` пока работают на 6.0 рядом.
</details>

<details><summary>Какие умолчания изменились в TypeScript 6.0?</summary>

`strict: true`, `module: esnext`, `target: es2025`, `types: []` (глобальные типы только явно), `rootDir` — папка конфига, `noUncheckedSideEffectImports: true`. Самая частая поломка — пустой `types`: пропадают `process` и глобальные функции тестов, их нужно перечислить.
</details>

<details><summary>Что удалено или запрещено в TS 6/7?</summary>

`target: es5`, `downlevelIteration`, `moduleResolution: node/node10/classic`, `module: amd/umd/systemjs/none`, `baseUrl` как корень модулей, `outFile`, выключение `esModuleInterop` и `alwaysStrict`, `module` вместо `namespace`, `assert` в импортах. В 6.0 это предупреждения, в 7.0 — ошибки.
</details>

<details><summary>Зачем нужен satisfies, если есть аннотация типа?</summary>

Аннотация `const x: T = ...` расширяет тип переменной до `T` и теряет конкретику. `satisfies T` проверяет совместимость, но оставляет выведенный точный тип: ключи, литералы и конкретные ветки union сохраняются. Удобно для конфигов, тем, маршрутов, словарей.
</details>

<details><summary>Что делает NoInfer?</summary>

Помечает позицию, из которой TypeScript **не должен** выводить параметр типа. Тип выводится из других аргументов, а в помеченной позиции значение только проверяется. Это защищает от ситуации, когда опечатка во втором аргументе молча расширяет тип вместо ошибки.
</details>

<details><summary>Что такое erasableSyntaxOnly и как запускать TS без сборки?</summary>

Node.js умеет «стирать» типы (type stripping) и выполнять `.ts` напрямую, но только если в файле нет синтаксиса, который требует генерации JS: `enum`, `namespace` с кодом, parameter properties, `import =`. Флаг `erasableSyntaxOnly` запрещает такой синтаксис на уровне компилятора. Вместе с `verbatimModuleSyntax` и `rewriteRelativeImportExtensions` он позволяет запускать TypeScript без шага сборки.
</details>

<details><summary>Что такое inferred type predicates?</summary>

С TS 5.5 компилятор сам выводит предикат типа (`x is T`) для функций, которые возвращают результат проверки. Главное следствие: `arr.filter((x) => x != null)` возвращает массив без `null` и `undefined` без ручного type guard.
</details>

<details><summary>Чем стандартные декораторы отличаются от experimentalDecorators?</summary>

Стандартные (TS 5.0+, TC39 Stage 3) получают значение и объект `context` (имя, вид члена, `addInitializer`), не поддерживают декораторы параметров и метаданные через `reflect-metadata`. Legacy-декораторы (`experimentalDecorators`) использовались в Angular, NestJS, TypeORM и работают по-другому. Смешивать их нельзя: фреймворк диктует, какой вариант включить.
</details>

## Практика

### Предскажите результат проверки типов

**1.**
```ts
const values = [1, null, 2];
const nums = values.filter((x) => x !== null);
// Какой тип у nums в TS 5.5+?
```
<details><summary>Ответ</summary>

`number[]`
</details>
<details><summary>Почему так</summary>

С 5.5 TypeScript выводит для стрелки предикат `x is number`, и перегрузка `filter` с предикатом сужает тип результата.
</details>

**2.**
```ts
const config = { port: 3000, mode: 'dev' } satisfies Record<string, string | number>;
config.mode.toUpperCase();
```
<details><summary>Ответ</summary>

Ошибки нет.
</details>
<details><summary>Почему так</summary>

`satisfies` проверяет совместимость, но сохраняет выведенный тип `{ port: number; mode: string }`. С аннотацией `: Record<string, string | number>` у `config.mode` был бы тип `string | number`, и вызов `toUpperCase` дал бы ошибку.
</details>

**3.**
```ts
// tsconfig без поля "types", TypeScript 6.0, установлен @types/node
console.log(process.env.NODE_ENV);
```
<details><summary>Ответ</summary>

Ошибка: `Cannot find name 'process'`.
</details>
<details><summary>Почему так</summary>

В 6.0 `types` по умолчанию равен `[]`, и глобальные типы из `@types/node` не подключаются автоматически. Нужно добавить `"types": ["node"]`.
</details>

### Задачи

**1. Мигрируйте tsconfig на TypeScript 6/7.**

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "moduleResolution": "node",
    "baseUrl": "./src",
    "downlevelIteration": true,
    "esModuleInterop": false,
    "outFile": "dist/bundle.js"
  }
}
```

Проект — React-приложение, собираемое Vite, тесты на Vitest с глобальными `describe`/`it`.

<details><summary>Решение</summary>

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client", "vitest/globals"],
    "paths": { "@/*": ["./src/*"] },
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Что изменено и почему:
- `target: es5` и `downlevelIteration` удалены в TS 7; транспиляцией под браузеры занимается Vite, TypeScript только проверяет типы (`noEmit`).
- `moduleResolution: node` → `bundler`, `module` → `esnext`: так резолвит сборщик.
- `baseUrl` как корень модулей больше не работает → `paths` (алиас `@/`, его же надо указать в Vite).
- `esModuleInterop: false` больше нельзя — опция удалена из конфига.
- `outFile` удалён, бандл собирает Vite.
- `types` перечислены явно, иначе в 6.0+ пропадут типы Vite и глобальные функции Vitest.
</details>

**2. Сделайте файл совместимым с `erasableSyntaxOnly`.**

```ts
enum Status { Active = 'active', Blocked = 'blocked' }

export class UserService {
  constructor(private readonly api: ApiClient) {}
  block(id: string) { return this.api.patch(id, { status: Status.Blocked }); }
}
```

<details><summary>Решение</summary>

```ts
export const Status = { Active: 'active', Blocked: 'blocked' } as const;
export type Status = (typeof Status)[keyof typeof Status];

export class UserService {
  readonly #api: ApiClient;
  constructor(api: ApiClient) {
    this.#api = api;
  }
  block(id: string) {
    return this.#api.patch(id, { status: Status.Blocked });
  }
}
```

`enum` генерирует JS-объект, а parameter properties — присваивание в конструкторе. Оба вида синтаксиса не «стираются», поэтому заменены на `as const`-объект с типом-объединением и явное поле.
</details>

## Источники
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Announcing TypeScript 5.9](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)
- [TypeScript Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Node.js — Running TypeScript natively](https://nodejs.org/en/learn/typescript/run-natively)
