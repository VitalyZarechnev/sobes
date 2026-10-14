# Карта покрытия ключевых тем

> Чек-лист главных тем senior/lead-собеседований и где каждая разобрана в вики.
> Используй как финальную самопроверку: по каждой строке надо уметь ответить вслух за 2–3 минуты.
> ← [Главная](README.md) · [Роадмап](ROADMAP.md)

## 1. Архитектура и System Design

| Тема | Где разобрано |
|---|---|
| Фронтенд-архитектура масштабного приложения: микрофронтенды, Module Federation, монорепозиторий | [Паттерны и масштабирование](05-architecture/06-patterns-and-scaling.md) · [Микрофронтенды](05-architecture/08-microfrontends.md) · [System Design](05-architecture/07-frontend-system-design.md) |
| Clean Architecture, FSD, MVC/MVP/MVVM | [Чистая архитектура](05-architecture/02-clean-architecture.md) · [FSD](05-architecture/03-fsd.md) · [FSD на практике](05-architecture/04-fsd-in-practice.md) · [MV*](05-architecture/05-mvc-mvp-mvvm.md) |
| Управление состоянием: глобальный стейт, серверный стейт, локальное состояние | [State management в React](03-react/03-state-management.md) · [Сравнение стейт-менеджеров](03-react/10-state-managers-compared.md) · [Стейт во Vue](04-vue/08-state-managers.md) |
| Кэширование и инвалидация данных | [Сравнение стейт-менеджеров → кэш и инвалидация](03-react/10-state-managers-compared.md) · [Next.js: данные и кэш](03-react/09-nextjs-data-and-caching.md) · [HTTP-кэш](06-web-platform/04-network-http.md) |
| Микрофронтенды: Module Federation, iframe, Web Components; изоляция стилей, роутинг, общий бандл | [Микрофронтенды](05-architecture/08-microfrontends.md) |
| Выбор технологий с учётом долгосрочной поддержки | [Выбор технологий](05-architecture/09-tech-selection.md) · [Техническая стратегия](07-lead/05-technical-strategy.md) |
| Дизайн-системы: токены, темы, API компонентов, версионирование | [Раздел дизайн-систем](14-design-systems/README.md) · [Токены](14-design-systems/01-design-tokens-theming.md) · [API компонентов](14-design-systems/02-component-api.md) · [Storybook и версии](14-design-systems/04-storybook-docs-versioning.md) |

## 2. Производительность

| Тема | Где разобрано |
|---|---|
| Core Web Vitals: LCP, INP, CLS — измерение и улучшение | [Web Performance](06-web-platform/05-web-performance.md) · [Next.js и CWV](03-react/09-nextjs-data-and-caching.md) |
| От ввода URL до пикселей: CRP, layout thrashing, композитинг на GPU | [Рендеринг в браузере](06-web-platform/03-browser-rendering.md) · [Сеть](06-web-platform/04-network-http.md) |
| Оптимизация бандла: анализ, code splitting, tree shaking, lazy loading, srcset/picture | [Оптимизация бандла](10-tooling-testing/03-bundle-optimization.md) · [Сборщики](10-tooling-testing/01-bundlers.md) · [Web Performance](06-web-platform/05-web-performance.md) |
| Утечки памяти в SPA, работа GC | [Модули, память, GC](01-javascript/07-modules-memory-gc.md) · [Three.js: dispose](11-graphics/05-threejs-and-frameworks.md) |
| Наблюдаемость: RUM, LoAF, SLO, бюджеты производительности | [Наблюдаемость и RUM](15-production/02-observability-rum.md) · [Сторонние скрипты](15-production/05-third-party-analytics.md) |
| Лишние перерендеры в React / Vue | [React: производительность](03-react/04-performance.md) · [Vue: производительность](04-vue/05-performance-and-vue-vs-react.md) |

## 3. Глубокий JavaScript и TypeScript

| Тема | Где разобрано |
|---|---|
| Замыкания, прототипы, генераторы, Proxy/Reflect, память | [Замыкания](01-javascript/02-scope-closures-hoisting.md) · [Прототипы](01-javascript/04-prototypes-classes.md) · [Коллекции, итераторы, Proxy](01-javascript/06-objects-collections-iterators.md) · [Память](01-javascript/07-modules-memory-gc.md) |
| Event Loop: микро- и макрозадачи, render queue | [Event Loop](01-javascript/05-event-loop-async.md) · [Рендеринг в браузере](06-web-platform/03-browser-rendering.md) |
| Conditional, mapped, infer, template literal types; interface vs type; сложные generics | [TS in 5 minutes](02-typescript/01-ts-in-5-minutes-deep.md) · [Generics](02-typescript/03-generics.md) · [Type-level](02-typescript/04-type-level-programming.md) · [Type challenges](02-typescript/07-practice-tasks.md) |
| Свой Promise.all / Promise.race, пул задач, worker pool | [Live-coding](01-javascript/08-practice-tasks.md) |
| Типы, числа, строки, объекты, массивы, Map/Set, циклы — язык целиком | [Типы](01-javascript/01-types-and-coercion.md) · [Числа](01-javascript/09-numbers.md) · [Строки](01-javascript/10-strings-and-symbols.md) · [Объекты](01-javascript/11-objects.md) · [Массивы](01-javascript/12-arrays.md) · [Map/Set](01-javascript/13-map-set.md) · [Циклы](01-javascript/14-loops.md) |
| Новинки языков и платформы | [JS ES2023–2027](01-javascript/15-whats-new.md) · [TS 6/7](02-typescript/08-whats-new.md) · [React 19.x](03-react/11-whats-new.md) · [Vue 3.4–3.6](04-vue/09-whats-new.md) · [CSS](06-web-platform/08-whats-new-css.md) · [HTML](06-web-platform/09-whats-new-html.md) |
| Алгоритмы и структуры данных, задачи в стиле LeetCode | [Раздел алгоритмов](13-algorithms/README.md) · [Алгоритмы во фронтенде](13-algorithms/08-frontend-algorithms.md) · [каталог задач](#/algo) |
| Race conditions в сетевых запросах, AbortController | [Event Loop и async](01-javascript/05-event-loop-async.md) · [Live-coding](01-javascript/08-practice-tasks.md) · [Сеть](06-web-platform/04-network-http.md) |

## 4. Фреймворки (React / Vue)

| Тема | Где разобрано |
|---|---|
| Reconciliation, Virtual DOM, Fiber | [React: рендеринг](03-react/01-rendering-reconciliation.md) |
| Реактивность на Proxy во Vue | [Vue: реактивность](04-vue/01-reactivity.md) |
| SSR / SSG / RSC, гидратация, Edge, Next.js / Nuxt | [React 19 и RSC](03-react/05-react-19-and-server-components.md) · [Next.js: основы](03-react/08-nextjs-fundamentals.md) · [Next.js: данные](03-react/09-nextjs-data-and-caching.md) · [Nuxt](04-vue/07-nuxt.md) |
| Замыкания в хуках, useMemo / useCallback / React Compiler | [Хуки](03-react/02-hooks-deep-dive.md) · [Производительность React](03-react/04-performance.md) |
| Сравнение фреймворков | [Vue vs React](04-vue/05-performance-and-vue-vs-react.md) |

## 5. Инфраструктура, тестирование, безопасность

| Тема | Где разобрано |
|---|---|
| Vite, Webpack, Babel: тонкости настройки | [Сборщики](10-tooling-testing/01-bundlers.md) |
| Свои плагины и лоадеры | [Плагины и лоадеры](10-tooling-testing/02-plugins-and-loaders.md) |
| Стратегия тестирования, соотношение unit / integration / e2e, тесты async-кода, мок API | [Стратегия тестирования](10-tooling-testing/04-testing-strategy.md) · [React: тестирование](03-react/06-patterns-and-testing.md) · [Качество и delivery](07-lead/06-quality-and-delivery.md) |
| CI/CD, деплой, мониторинг | [CI/CD и DevOps](10-tooling-testing/05-ci-cd-devops.md) · [Ошибки и мониторинг](15-production/01-errors-and-monitoring.md) |
| Пакетные менеджеры, монорепо, линтеры, supply chain | [Пакеты и монорепо](10-tooling-testing/06-packages-monorepo-linting.md) · [Релизы и зависимости](15-production/04-releases-and-dependencies.md) |
| Feature flags, A/B-эксперименты, безопасная раскатка | [Feature flags](15-production/03-feature-flags-experiments.md) · [CI/CD](10-tooling-testing/05-ci-cd-devops.md) |
| XSS, CSRF, httpOnly cookies vs localStorage, CSP | [Безопасность](06-web-platform/06-security.md) · [Аутентификация](16-forms-i18n-auth/03-auth.md) |
| Формы, валидация, i18n, форматирование, RTL | [Формы](16-forms-i18n-auth/01-forms.md) · [i18n](16-forms-i18n-auth/02-i18n.md) |
| Отладка, DevTools, поиск утечек | [Отладка](17-debugging-git-team/01-debugging.md) |

## 6. Софт-скиллы и инженерный менеджмент

| Тема | Где разобрано |
|---|---|
| Самый сложный технический челлендж, метрики, личный вклад | [Софт-скиллы senior](07-lead/10-senior-soft-skills.md) · [Поведенческое интервью](07-lead/09-behavioral-interview.md) |
| Код-ревью и менторинг, несогласие с кодом джунов и мидлов | [Софт-скиллы senior](07-lead/10-senior-soft-skills.md) · [Процессы команды](07-lead/04-team-processes.md) · [Управление людьми](07-lead/03-people-management.md) |
| Git, конфликты, код-ревью, работа с дизайном и бэкендом | [Git](17-debugging-git-team/02-git.md) · [Код-ревью](17-debugging-git-team/03-code-review.md) · [Работа в команде](17-debugging-git-team/04-teamwork.md) · [Работа с дизайном](14-design-systems/06-working-with-design.md) |
| Оценка задач, требования меняются, сроки горят | [Софт-скиллы senior](07-lead/10-senior-soft-skills.md) · [Стейкхолдеры](07-lead/07-stakeholders-and-communication.md) · [Сложные кейсы](07-lead/08-hard-cases.md) |

## 7. Дополнительно

| Тема | Где разобрано |
|---|---|
| Вопросы уровня middle (разминка на любом интервью) | `00-middle-questions.md` в разделах [JS](01-javascript/00-middle-questions.md), [TS](02-typescript/00-middle-questions.md), [React](03-react/00-middle-questions.md), [Vue](04-vue/00-middle-questions.md), [Платформа](06-web-platform/00-middle-questions.md), [Архитектура](05-architecture/00-middle-questions.md), [Инструменты](10-tooling-testing/00-middle-questions.md) |
| Вопросы с реальных собеседований (roasted.cv, Практикум, itcodik, kalashnikof) | Тест «Вопросы с реальных собеседований» в каждом разделе — на [странице тестов](#/quizzes) |
| AI-компетенции и работа с агентами | [Раздел AI](08-ai/README.md) |
| Canvas, 2D и 3D графика | [Раздел графики](11-graphics/README.md) |
