# 02. TypeScript

> 2 дня из плана. Упор — не на синтаксис, а на модель типов: структурная типизация, сужение (narrowing), дженерики и вариантность, программирование на уровне типов, конфигурация и tooling. На senior/lead собеседовании ждут, что вы объясните «почему компилятор так решил», спроектируете типобезопасный API и аргументированно настроите `tsconfig` для монорепо.
> Связи: [01. JavaScript](../01-javascript/README.md) (TS — надмножество JS, рантайм тот же), [03. React](../03-react/README.md) (типизация компонентов и хуков), [05. Архитектура](../05-architecture/README.md) (контракты, границы модулей, монорепо).

## Прогресс раздела
- [ ] [Middle-разминка](00-middle-questions.md)
- [ ] [TS in 5 minutes — глубоко: вывод, структурность, any/unknown/never](01-ts-in-5-minutes-deep.md)
- [ ] [Narrowing и union-типы](02-narrowing-and-unions.md)
- [ ] [Generics и вариантность](03-generics.md)
- [ ] [Программирование на уровне типов](04-type-level-programming.md)
- [ ] [Продвинутые паттерны: branded, satisfies, merging, Result, zod](05-advanced-patterns.md)
- [ ] [tsconfig, d.ts и tooling](06-config-and-tooling.md)
- [ ] [Практика: type challenges](07-practice-tasks.md)
- [ ] [Новинки TypeScript: 5.x, 6.0, 7.0](08-whats-new.md)

## Как готовиться
День 1 — темы 01–03: модель типов и повседневный код. Прочитайте «TypeScript in 5 minutes» и главы Everyday Types / Narrowing / Generics из Handbook, затем страницы вики, проговаривая ответы вслух.
День 2 — темы 04–07: type-level, паттерны, конфиг. Решайте задачи в [TS Playground](https://www.typescriptlang.org/play) — не читайте решение, пока не получилось хотя бы частично. Добейте 5–10 задач уровня easy/medium из type-challenges.

Главные источники:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) и [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [type-challenges](https://github.com/type-challenges/type-challenges)
- [Release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html) — что появилось в 5.x

## Самопроверка раздела (топ-10 вопросов)
1. Что такое структурная типизация, чем отличается от номинальной и как эмулировать номинальные типы?
2. `any` vs `unknown` vs `never` vs `void` — где каждый уместен и как они ведут себя в union/intersection?
3. `interface` vs `type`: реальные различия (declaration merging, производительность, ошибки) и ваше правило выбора.
4. Как работает control flow analysis и почему сужение «теряется» в колбэках?
5. Что такое дистрибутивные условные типы и как их отключить?
6. Объясните ковариантность/контравариантность параметров функций, `strictFunctionTypes` и бивариантность методов.
7. Чем `satisfies` отличается от аннотации типа и от `as`?
8. Реализуйте `DeepReadonly`, `UnionToIntersection`, `Awaited` и объясните каждый шаг.
9. Какие флаги `tsconfig` вы включаете в новом проекте сверх `strict` и почему (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `moduleResolution: bundler`)?
10. Почему сборка через esbuild/swc не проверяет типы, что такое `isolatedModules`/`isolatedDeclarations` и как организовать typecheck в CI монорепо?
