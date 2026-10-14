# Middle-разминка: TypeScript

> ⏱ ~1 ч · 🎯 Уверенно ответить на базовые вопросы по TypeScript за 30–60 секунд с примером. Глубина — в темах раздела.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Ответил вслух на все вопросы, не подглядывая
- [ ] Прошёл [тест по разминке](../quizzes/quiz.html?id=02-typescript/00-middle-questions) без ошибок

## Вопросы

<details><summary>Зачем нужен TypeScript?</summary>

Статическая проверка типов ловит ошибки до запуска, типы — документация и контракт между модулями, лучше автодополнение и рефакторинг в IDE. Типы стираются при компиляции — в рантайме это обычный JS, поэтому внешние данные нужно валидировать (zod).
</details>

<details><summary>Чем `interface` отличается от `type`?</summary>

`interface` описывает форму объекта, расширяется через `extends` и сливается при повторном объявлении (declaration merging). `type` — псевдоним любого типа: union, пересечения, кортежи, mapped и conditional types. Для объектов публичного API часто выбирают `interface`, для остального — `type`.
</details>

<details><summary>Чем `any` отличается от `unknown` и `never`?</summary>

`any` отключает проверку. `unknown` — «что угодно, но перед использованием проверь» (сужение через `typeof`, `instanceof`, схемы). `never` — значения нет: функция, которая всегда бросает, исчерпанный union. Подробно — [TS in 5 minutes](01-ts-in-5-minutes-deep.md).
</details>

<details><summary>Что такое union и intersection типы?</summary>

Union `A | B` — значение одного из типов (доступны только общие свойства до сужения). Intersection `A & B` — значение, удовлетворяющее обоим (объединение свойств объектов).
</details>

<details><summary>Что такое сужение типов (narrowing)?</summary>

Уточнение типа внутри ветки по проверке: `typeof`, `instanceof`, `in`, сравнение с литералом, проверка дискриминанта, пользовательские type guards (`x is T`). Подробно — [narrowing](02-narrowing-and-unions.md).
</details>

<details><summary>Что такое discriminated union?</summary>

Union объектов с общим полем-литералом (`status: 'loading' | 'success' | 'error'`): проверка этого поля сужает тип до конкретного варианта, а `switch` с `never` в `default` гарантирует обработку всех вариантов.
</details>

<details><summary>Что такое дженерики и зачем они?</summary>

Параметры типов: функция/тип работает с разными типами, сохраняя связь между входом и выходом (`function first<T>(arr: T[]): T | undefined`). Ограничения — `extends`. Подробно — [generics](03-generics.md).
</details>

<details><summary>Какие utility types вы используете?</summary>

`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`, `NoInfer`.
</details>

<details><summary>Что такое структурная типизация?</summary>

Совместимость определяется формой, а не именем: объект с нужными полями подходит к интерфейсу, даже если явно его не реализует. Для номинальности используют branded types.
</details>

<details><summary>Что делает `as` и почему его стоит избегать?</summary>

Утверждение типа: компилятор верит вам на слово без проверки. Ошибка проявится в рантайме. Лучше сужение, type guards, `satisfies` или валидация схемой. `as const` — отдельная полезная вещь: литеральные readonly-типы.
</details>

<details><summary>Что делает `satisfies`?</summary>

Проверяет, что значение соответствует типу, **не расширяя** выведенный тип: `const config = {...} satisfies Config` — ошибки ловятся, а конкретные литералы ключей и значений сохраняются.
</details>

<details><summary>Чем `enum` отличается от union литералов?</summary>

`enum` генерирует JS-код (объект), числовые enum'ы небезопасны (любое число подходит). Union литералов (`'a' | 'b'`) и `as const`-объекты не генерируют код и лучше сочетаются с режимом `erasableSyntaxOnly` и запуском TS в Node без сборки.
</details>

<details><summary>Что такое `strict` в tsconfig и почему он важен?</summary>

Набор проверок: `strictNullChecks` (null/undefined не подходят к другим типам), `noImplicitAny`, `strictFunctionTypes` и др. Без `strict` TS пропускает большой класс ошибок. Дополнительно полезны `noUncheckedIndexedAccess` и `exactOptionalPropertyTypes`. Подробно — [tsconfig](06-config-and-tooling.md).
</details>

<details><summary>Как типизировать React-компонент и события?</summary>

Пропсы — `interface Props`, события — `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, нативные атрибуты — `ComponentProps<'button'>`, дети — `ReactNode`. `React.FC` не обязателен.
</details>

<details><summary>Что такое `.d.ts` файлы?</summary>

Файлы деклараций: только типы без реализации — для JS-библиотек (`@types/*`), глобальных переменных, модулей без типов (`declare module 'x'`), расширения существующих типов.
</details>

<details><summary>Чем `keyof` и `typeof` в позиции типа полезны?</summary>

`typeof value` — тип из значения (например, из объекта-конфига), `keyof T` — union ключей. Вместе: `keyof typeof config` — допустимые ключи конфига без дублирования.
</details>

## Источники
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for JS Programmers (TS in 5 minutes)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
