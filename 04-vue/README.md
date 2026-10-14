# 04. Vue

> **1 день из плана.** Упор — на устройство реактивности (Proxy, track/trigger, effect), компилятор шаблонов и его оптимизации, Composition API как основной стиль, экосистема (Pinia, Router, Nuxt) и умение **честно сравнить Vue с React**. Опирается на [01. JavaScript](../01-javascript/README.md) (Proxy, Reflect, WeakMap, микрозадачи) и [03. React](../03-react/README.md) (для сравнения моделей рендеринга); архитектурные вопросы продолжаются в [05. Архитектура](../05-architecture/README.md).

## Прогресс раздела
- [ ] [Middle-разминка](00-middle-questions.md)
- [ ] [Реактивность](01-reactivity.md)
- [ ] [Composition API](02-composition-api.md)
- [ ] [Компоненты и рендеринг](03-components-and-rendering.md)
- [ ] [Экосистема](04-ecosystem.md)
- [ ] [Производительность и Vue vs React](05-performance-and-vue-vs-react.md)
- [ ] [Вопросы и практика](06-interview-questions.md)
- [ ] [Nuxt](07-nuxt.md)
- [ ] [Стейт-менеджеры во Vue](08-state-managers.md)
- [ ] [Новинки Vue 3.4–3.6](09-whats-new.md)

## Как готовиться

**Утро:** темы 01 и 02. Реактивность — главный «глубокий» вопрос по Vue: нужно уметь на доске написать `reactive`/`effect`/`track`/`trigger` и объяснить, почему деструктуризация теряет реактивность.

**День:** темы 03 и 04. Компилятор (patch flags, block tree, hoisting) — то, чем Vue отличается от React на уровне архитектуры. Pinia/Router/Nuxt — практические вопросы.

**Вечер:** тема 05 (сформулировать позицию «Vue vs React» без фанатизма) и тема 06 — прогон вопросов вслух, задача «мини-реактивность на Proxy» на таймер.

Главные источники:
- [vuejs.org/guide](https://vuejs.org/guide/introduction.html) — особенно разделы «Reactivity in Depth» и «Rendering Mechanism».
- [pinia.vuejs.org](https://pinia.vuejs.org/), [router.vuejs.org](https://router.vuejs.org/), [nuxt.com/docs](https://nuxt.com/docs).

## Самопроверка раздела (топ-10 вопросов)
1. Как устроена реактивность Vue 3 (Proxy, `track`/`trigger`, `targetMap`) и чем она лучше `Object.defineProperty` из Vue 2?
2. `ref` vs `reactive`: когда что, и почему деструктуризация `reactive` теряет реактивность?
3. Как работает `computed` (ленивость, кэш, dirty-флаг) и чем отличается от `watch`?
4. `watch` vs `watchEffect`, `flush: 'pre' | 'post' | 'sync'`, cleanup.
5. Что делает компилятор шаблонов: static hoisting, patch flags, block tree?
6. Как работает планировщик и `nextTick`? Почему изменения DOM не видны сразу?
7. Composables vs mixins: какие проблемы mixins решают composables?
8. Pinia vs Vuex: в чём разница и почему Pinia стала стандартом?
9. Режимы рендеринга Nuxt (SSR, SSG, SPA, hybrid/route rules) и гидратация.
10. Чем модель обновлений Vue отличается от React, и когда вы выберете одно или другое?
