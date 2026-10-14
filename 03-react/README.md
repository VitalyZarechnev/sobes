# 03. React

> **1.5 дня из плана.** Упор на то, что отличает senior от middle: как React рендерит (Fiber, фазы, concurrent-режим), почему хуки устроены именно так, где на самом деле теряется производительность и как устроены React 19 + Server Components. Раздел опирается на [01. JavaScript](../01-javascript/README.md) (замыкания, event loop, микрозадачи) и [02. TypeScript](../02-typescript/README.md) (типизация пропсов и хуков), а идеи о состоянии и рендеринге продолжаются в [04. Vue](../04-vue/README.md) (сравнение моделей реактивности) и [05. Архитектура](../05-architecture/README.md).

## Прогресс раздела
- [ ] [Middle-разминка](00-middle-questions.md)
- [ ] [Рендеринг и reconciliation](01-rendering-reconciliation.md)
- [ ] [Хуки: глубокое погружение](02-hooks-deep-dive.md)
- [ ] [Управление состоянием](03-state-management.md)
- [ ] [Производительность](04-performance.md)
- [ ] [React 19 и Server Components](05-react-19-and-server-components.md)
- [ ] [Паттерны и тестирование](06-patterns-and-testing.md)
- [ ] [Вопросы и live-coding](07-interview-questions.md)
- [ ] [Next.js: основы, роутинг, рендеринг](08-nextjs-fundamentals.md)
- [ ] [Next.js: данные, кэширование, Server Actions, деплой](09-nextjs-data-and-caching.md)
- [ ] [Стейт-менеджеры: сравнение, кэш и инвалидация](10-state-managers-compared.md)
- [ ] [Новинки React 19.x и React Compiler](11-whats-new.md)

## Как готовиться

**День 1 (утро):** темы 01 и 02 — это фундамент, на нём построены почти все «хитрые» вопросы. Обязательно руками воспроизведите stale closure, двойной вызов эффектов в StrictMode и разницу `useEffect`/`useLayoutEffect`.

**День 1 (вечер):** темы 03 и 04. Сформулируйте собственную позицию: какой state-менеджер вы выберете для нового проекта и почему; когда мемоизация вредна; что меняет React Compiler.

**День 2 (утро):** темы 05 и 06. Server Components — главный «модный» вопрос 2025–2026 годов, нужно уметь объяснить границу `'use client'`, сериализацию пропсов и чем Server Action отличается от API-роута.

**День 2 (до обеда):** тема 07 — прогон вопросов вслух и 2–3 live-coding задачи на таймер (20–25 минут каждая).

Главные источники:
- [react.dev/learn](https://react.dev/learn) — особенно разделы «Escaping Hatches» и «Managing State».
- [react.dev/reference/react](https://react.dev/reference/react) — точная семантика каждого хука.
- [react.dev/blog](https://react.dev/blog) — анонсы React 19, React Compiler, RSC.

## Самопроверка раздела (топ-10 вопросов)
1. Что такое Fiber и зачем React разделяет работу на фазы render и commit?
2. Как работает reconciliation и почему `key={index}` может сломать состояние?
3. Почему хуки нельзя вызывать в условиях — что физически хранит React?
4. Что такое stale closure и три способа её исправить?
5. Чем отличаются `useEffect`, `useLayoutEffect` и `useInsertionEffect` по времени вызова?
6. Как выбрать между Context, Zustand, Redux Toolkit и TanStack Query? Что такое серверное состояние?
7. Когда `React.memo`/`useMemo` не помогают или вредят? Что делает React Compiler?
8. Что такое `startTransition` и как он связан с Suspense и concurrent rendering?
9. Чем Server Components отличаются от SSR? Что можно и нельзя передавать через границу `'use client'`?
10. Как устроены `useActionState`, `useOptimistic` и `use()` в React 19?
