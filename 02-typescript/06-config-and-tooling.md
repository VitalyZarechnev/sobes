# tsconfig, d.ts и tooling

> ⏱ ~3 ч · 🎯 Аргументированно собрать `tsconfig` для приложения, библиотеки и монорепо; понимать, кто транспилирует, а кто проверяет типы; диагностировать медленный tsc; знать, как TS запускается в Node без сборки.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Знаю, что входит в `strict`, и какие флаги включать сверх него
- [ ] Выбираю `module`/`moduleResolution` под среду (bundler / Node / библиотека)
- [ ] Понимаю `isolatedModules`, `verbatimModuleSyntax`, `isolatedDeclarations`, `erasableSyntaxOnly`
- [ ] Настраиваю project references и инкрементальную сборку
- [ ] Умею профилировать проверку типов

## Теория

### Две задачи компилятора

`tsc` делает две независимые вещи: **проверку типов** (type checking) и **эмит** (JS + `.d.ts`). В современном фронтенде они разделены:

| Задача | Инструмент | Скорость |
|---|---|---|
| Транспиляция TS → JS (стирание типов) | esbuild (Vite dev), Rolldown/Oxc (Vite 7+), swc (Next.js, Rspack), Babel, Node type stripping | очень быстро, файл за файлом |
| Проверка типов | `tsc --noEmit`, `vue-tsc`, IDE (tsserver), `tsgo` | медленно, нужна вся программа |
| Генерация `.d.ts` | `tsc --emitDeclarationOnly`, при `isolatedDeclarations` — oxc/swc и др. | раньше только tsc |

Следствие: **бандлер не ловит ошибки типов**. Typecheck — отдельный шаг в CI и pre-push/IDE. Это частый вопрос «почему `vite build` прошёл, а ошибки есть».

### Флаги `strict` и сверх него

`"strict": true` включает семейство: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables`, `strictBuiltinIteratorReturn` (5.6). Новые strict-флаги добавляются в семейство — апгрейд TS может «покраснить» проект.

Сверх `strict` рекомендую для нового кода:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,     // arr[i], dict[key] → T | undefined
    "exactOptionalPropertyTypes": true,   // a?: string ≠ a: string | undefined
    "noImplicitOverride": true,           // override обязателен
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true // dict.key запрещён, только dict['key'] — явность
  }
}
```

**`noUncheckedIndexedAccess`** — самый ценный: индексный доступ возвращает `T | undefined`.

```ts
const xs: string[] = [];
xs[0].toUpperCase();               // без флага — компилируется и падает
const first = xs[0];               // с флагом: string | undefined
for (const x of xs) x.toUpperCase(); // ✅ итерация не затронута
const [a] = xs;                    // a: string | undefined
```

Цена — шум с кортежами-неочевидными индексами; лечится `for...of`, `.at()` + проверка, деструктуризацией с дефолтом.

**`exactOptionalPropertyTypes`**: различает «свойства нет» и «свойство = undefined» — важно для `'key' in obj`, `Object.keys`, спреда, PATCH-запросов:

```ts
type Opts = { timeout?: number };
const o: Opts = { timeout: undefined }; // ❌ с флагом; нужно timeout?: number | undefined явно
```

Цена — несовместимость с частью библиотечных типов; включают в новых проектах.

### `module` и `moduleResolution`

| Среда | Рекомендация |
|---|---|
| Приложение под бандлер (Vite, Next, Rspack) | `"module": "preserve"` (5.4, подразумевает `moduleResolution: bundler`) или `"module": "esnext"` + `"moduleResolution": "bundler"` |
| Node.js (приложение/библиотека) | `"module": "nodenext"` (`moduleResolution` следует автоматически) |
| Библиотека для npm | `nodenext` — самый строгий: если корректно под Node, корректно и под бандлеры |

`bundler` разрешает импорты без расширений и поддерживает `package.json#exports`/`imports`, но не требует `.js` в относительных путях. `nodenext` эмулирует реальный Node: ESM vs CJS определяется по `package.json#type` и расширению (`.mts`/`.cts`), относительные импорты в ESM — с расширением. `node10` (бывший `node`) — устаревший: не понимает `exports`.

🪤 Ловушка: библиотека, проверенная только с `bundler`, может сломаться у Node-потребителей (импорты без расширений). Проверка публикации — [arethetypeswrong](https://arethetypeswrong.github.io/).

### `isolatedModules` и `verbatimModuleSyntax`

Однофайловые транспиляторы не видят другие файлы, поэтому не знают, является ли импортированное имя типом. `isolatedModules: true` запрещает конструкции, которые нельзя корректно транспилировать пофайлово:
- реэкспорт типа без `type` (`export { User } from './types'`);
- использование `const enum` из других файлов (ambient);
- (ранее) файлы-не-модули.

`verbatimModuleSyntax` (5.0) — более простое правило вместо `importsNotUsedAsValues`/`preserveValueImports`: **что написано, то и эмитится**. Импорт без `type` останется в JS (с сайд-эффектами), `import type`/`import { type X }` удаляется целиком.

```ts
import type { User } from './types';      // удалится
import { type Config, loadConfig } from './config'; // останется: import { loadConfig } from './config'
import { Config } from './config';         // ❌ при verbatimModuleSyntax, если Config — только тип
```

Включайте в любом проекте, где транспилирует не tsc. Нюанс: с `module: commonjs` нельзя писать ESM-импорты (нужно `import x = require()`), поэтому флаг для ESM-проектов.

### `isolatedDeclarations` (5.5)

Требует, чтобы экспортируемые сущности имели явные типы, достаточные для генерации `.d.ts` **без проверки типов** — пофайлово. Тогда `.d.ts` может генерировать любой быстрый инструмент параллельно, а в монорепо пакеты-потребители не ждут сборки зависимостей.

```ts
export const add = (a: number, b: number) => a + b;          // ❌ нужен явный возвращаемый тип
export const add2 = (a: number, b: number): number => a + b; // ✅
export const NAME = 'x';                                       // ✅ литерал выводится тривиально
```

Требует `declaration: true` или `composite`. Цена — больше аннотаций на границах (что для библиотек и так хорошая практика).

### `erasableSyntaxOnly` (5.8) и TS в Node

Node.js умеет запускать `.ts` через **type stripping**: типы заменяются пробелами, код не трансформируется (позиции в стектрейсах совпадают). Появилось как `--experimental-strip-types` в 22.6, включено по умолчанию в Node 23.6 и бэкпортировано в 22.18.

Ограничения stripping:
- поддерживается только **erasable** синтаксис. Не работают: `enum`, `namespace` с рантайм-кодом, parameter properties (`constructor(private x)`), `import x = require()`/`export =`; для части есть `--experimental-transform-types`;
- tsconfig не читается: нет `paths`, `target`, JSX;
- импорты должны указывать реальное расширение `.ts`; `import type` обязателен для типов (иначе Node попытается импортировать несуществующий экспорт).

Флаг `"erasableSyntaxOnly": true` заставляет tsc запрещать non-erasable синтаксис — код гарантированно запускается в Node и в будущем «types as comments» (TC39 Type Annotations proposal). Сопутствующие флаги: `allowImportingTsExtensions` (+ `noEmit`) или `rewriteRelativeImportExtensions` (5.7) — переписывает `./x.ts` → `./x.js` при эмите.

```jsonc
// tsconfig для Node-скриптов/сервиса без сборки
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "strict": true
  }
}
```

### Декларации: `.d.ts`

- `.d.ts` — только типы, без реализации. Источники: генерация tsc из ваших `.ts`, `@types/*` (DefinitelyTyped), типы, встроенные в пакет (`package.json#types` / `exports[...].types`).
- `declare module 'untyped-lib';` — shorthand ambient module: всё `any`. Лучше написать минимальные типы.
- `declare module '*.svg' { const src: string; export default src; }` — типы для ассетов (Vite даёт `vite/client`).
- `skipLibCheck: true` — не проверять `.d.ts` в `node_modules` (и свои). Почти всегда включён ради скорости и из-за конфликтов типов в зависимостях; цена — пропущенные ошибки в собственных `.d.ts`.
- `types: [...]` — ограничивает автоподключаемые `@types` (иначе подтягиваются все из `node_modules/@types`, например jest-глобалы в прод-код).
- `lib` — встроенные декларации окружения (`dom`, `es2024`, `webworker`). Не путать с `target` (во что транспилировать синтаксис).
- Публикация библиотеки: `exports` с условием `types` **первым**, раздельные `.d.mts`/`.d.cts` для dual-пакетов.

### Project references и монорепо

```jsonc
// packages/ui/tsconfig.json
{ "compilerOptions": { "composite": true, "declaration": true, "outDir": "dist", "rootDir": "src" } }

// apps/web/tsconfig.json
{ "references": [{ "path": "../../packages/ui" }] }

// корневой tsconfig.json — «solution»
{ "files": [], "references": [{ "path": "apps/web" }, { "path": "packages/ui" }] }
```

`tsc -b` (build mode) собирает граф в топологическом порядке, кэширует в `.tsbuildinfo` и пропускает неизменившиеся проекты. Потребитель видит зависимость через её `.d.ts`, а не исходники — проверка дешевле. Минусы: нужно собирать d.ts, сложнее настройка, «go to definition» ведёт в d.ts (лечится `declarationMap`).

Альтернатива в монорепо на бандлерах — «internal packages» без сборки (исходники через `exports` + `paths`/workspaces) и typecheck каждого пакета отдельно через Turborepo/Nx с кэшем. Lead-решение зависит от размера: до ~десятков пакетов проще без references, на больших — references или `isolatedDeclarations`.

### Производительность tsc

Диагностика:
- `tsc --extendedDiagnostics` — время parse/bind/check, число типов и инстанцирований, память;
- `tsc --generateTrace ./trace` + `npx @typescript/analyze-trace ./trace` — горячие файлы и типы; трейс открывается в Perfetto;
- `tsc --listFiles` / `--explainFiles` — почему файл попал в программу (часто: случайный `include` всего `node_modules` или `types`).

Что помогает:
- `incremental: true`, `skipLibCheck: true`, узкие `include`, явные `types`;
- interface + `extends` вместо больших пересечений; явные возвращаемые типы у экспортов;
- избегать гигантских union-ов (template literal-комбинаторика), глубокой рекурсии, полиморфных `as`-пропсов на каждом компоненте;
- дробить на project references;
- **TypeScript 7 / tsgo** — нативный порт компилятора на Go (анонсирован в 2025, превью `@typescript/native-preview`), обещает ~10x ускорение за счёт нативного кода и параллелизма. TS 6.0 — переходный релиз с депрекейтами старых опций (`moduleResolution: node10`, `target: es5` и др.), готовящий к 7.0.

## Вопросы с собеседований

<details><summary>Почему Vite собирает проект с ошибками типов?</summary>

Vite транспилирует TS через esbuild/Oxc пофайлово — это только стирание типов, без проверки. Проверка — отдельно: `tsc --noEmit` (или `vue-tsc`) в CI, `vite-plugin-checker` в dev, IDE. Поэтому нужны `isolatedModules`/`verbatimModuleSyntax`, чтобы пофайловая транспиляция была корректной.
</details>

<details><summary>Что даёт `noUncheckedIndexedAccess` и почему не входит в `strict`?</summary>

Индексный доступ к массивам и индексным сигнатурам возвращает `T | undefined` — ловит выход за границы и отсутствующие ключи. Не входит в strict из-за шума: много проверок там, где индекс заведомо валиден. В новом проекте — включать, `for...of`/деструктуризация/`.at()` снижают шум.
</details>

<details><summary>`moduleResolution: bundler` vs `nodenext`?</summary>

`bundler` — для кода, который соберёт бандлер: понимает `exports`, не требует расширений. `nodenext` — точная модель Node: ESM/CJS по `type` и расширениям, обязательные расширения в ESM. Для npm-библиотек — `nodenext`: совместимо и с Node, и с бандлерами.
</details>

<details><summary>Зачем `verbatimModuleSyntax`?</summary>

Делает эмит импортов предсказуемым: импорты без `type` сохраняются, с `type` — удаляются. Нужен при транспиляции не-tsc инструментами и для Node type stripping, исключает «потерю» сайд-эффектных импортов и импорт несуществующих в рантайме значений. Заменил `importsNotUsedAsValues` и `preserveValueImports`.
</details>

<details><summary>Что такое `isolatedDeclarations` и какую проблему решает?</summary>

Требует явных типов на экспортах, чтобы `.d.ts` можно было сгенерировать без type-checker’а, пофайлово и параллельно. В монорепо снимает последовательную зависимость «собери d.ts зависимости → проверяй потребителя», ускоряет CI. Цена — аннотации на публичных границах.
</details>

<details><summary>Как запустить TS в Node без сборки и какие ограничения?</summary>

Современный Node (23.6+, 22.18+) по умолчанию снимает типы с `.ts`-файлов. Ограничения: только erasable синтаксис (без enum, namespace, parameter properties), tsconfig не учитывается (нет `paths`), импорты с `.ts`, `import type` для типов. В проекте включают `erasableSyntaxOnly` + `verbatimModuleSyntax` + `allowImportingTsExtensions`/`rewriteRelativeImportExtensions`. Типы всё равно проверяются отдельно `tsc --noEmit`. Альтернативы — tsx, ts-node, Bun, Deno.
</details>

<details><summary>Что такое project references?</summary>

Разбиение кода на подпроекты с `composite: true`; зависимые проекты ссылаются через `references` и видят `.d.ts`. `tsc -b` строит граф, инкрементально пересобирает только изменённое. Плюсы: скорость, явные границы между пакетами (нельзя импортировать то, на что нет ссылки). Минусы: сложность конфигурации, нужна сборка деклараций.
</details>

<details><summary>Как ускорить медленный typecheck в большом проекте?</summary>

Измерить: `--extendedDiagnostics`, `--generateTrace` + analyze-trace, `--explainFiles`. Затем: `skipLibCheck`, `incremental`, сузить `include`/`types`, заменить большие пересечения интерфейсами, явные return types, упростить тяжёлые generic-типы (часто виноваты styled/полиморфные компоненты и сложные схемы валидации), project references или кэш в Turborepo/Nx, рассмотреть tsgo.
</details>

<details><summary>`target` vs `lib` vs `module`?</summary>

`target` — во что даункомпилировать синтаксис (и дефолт `lib`, `useDefineForClassFields`). `lib` — какие встроенные API считаются доступными (типы `dom`, `es2024`) — полифилов не добавляет. `module` — формат модулей на выходе и (в новых режимах) модель резолва. При бандлере `target` в tsconfig мало влияет — даункомпиляцию делает бандлер.
</details>

<details><summary>Зачем `skipLibCheck` и чем он опасен?</summary>

Пропускает проверку всех `.d.ts` — сильно ускоряет и избавляет от конфликтов несовместимых `@types` в зависимостях. Опасность — не будут проверены ваши собственные рукописные `.d.ts` и augmentation-ы; ошибки в них проявятся как `any` или странное поведение.
</details>

## Практика

**1. Соберите tsconfig для React-приложения на Vite.**

<details><summary>Решение</summary>

```jsonc
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2023", "dom", "dom.iterable"],
    "module": "preserve",               // => moduleResolution: bundler
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "noEmit": true,                     // эмитит Vite
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }     // baseUrl не нужен с TS 4.1; алиас продублировать в Vite
  },
  "include": ["src"]
}
```
</details>

**2. Почему этот код падает при запуске через `node index.ts`, хотя `tsc` доволен?**

```ts
import { User, createUser } from './user';
enum Role { Admin, User }
```

<details><summary>Ответ</summary>

Три проблемы: (1) путь без расширения — Node ESM требует `./user.ts`; (2) `User` — тип, импортированный без `type`: после стирания Node попытается импортировать несуществующий экспорт → SyntaxError; (3) `enum` — non-erasable синтаксис, type stripping его не поддерживает. Исправление: `import { type User, createUser } from './user.ts'`, enum → `as const` объект; включить `erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`.
</details>

**3. Спроектируйте typecheck в CI для монорепо из 40 пакетов.**

<details><summary>Ответ</summary>

Каждый пакет — свой `tsconfig` с `noEmit` (или `composite` для пакетов-библиотек), задача `typecheck` в Turborepo/Nx с зависимостями по графу и удалённым кэшем — проверяются только затронутые пакеты. Общий `tsconfig.base.json` со strict-флагами через `extends`. Для библиотечных пакетов — `isolatedDeclarations`, чтобы d.ts генерировались быстро и параллельно. Метрика — время typecheck в CI, `--extendedDiagnostics` на самых медленных пакетах; эксперимент с tsgo.
</details>

## Источники
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Handbook: Modules — Theory / Reference](https://www.typescriptlang.org/docs/handbook/modules/introduction.html)
- [Handbook: Modules (основы)](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TS 5.5 — isolatedDeclarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
- [TS 5.8 — erasableSyntaxOnly](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
- [Node.js: Modules — TypeScript](https://nodejs.org/api/typescript.html)
- [TypeScript Performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance)
- [A 10x Faster TypeScript (анонс нативного порта)](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [Are The Types Wrong?](https://arethetypeswrong.github.io/)
