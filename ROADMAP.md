# Роадмап подготовки

> Полный план — **40 учебных дней (~8 недель по 5 дней)** при 3–4 часах в день. Есть сжатый вариант на 14 дней и траектории «только senior» и «lead» (в конце).
> ← [Главная](README.md) · [Дневник](#/journal) · [🧪 Тесты и экзамен](#/quizzes) · [🧩 Задачи на алгоритмы](#/algo) · [Карта покрытия тем](COVERAGE.md)

## Как работать с планом

1. Открой вики через `index.html` (работает без сервера). Утром — день плана, вечером отметь пункты: галочки сохраняются в браузере, прогресс виден на главной.
2. Каждый раздел начинается с **Middle-разминки**: пробеги её за 20–30 минут. Если вопросы отскакивают от зубов — сразу к глубоким темам.
3. Внутри темы — чек-лист: теория → примеры руками → вопросы вслух → практика.
4. **Тест темы** (карточка внизу страницы) проходи в конце дня. Тема закрыта, когда в тесте ≥ 80% и задачи решены без подсказки.
5. **Алгоритмы — каждый день:** 1–2 задачи из [каталога](#/algo) (по 25 минут), начиная со второй недели. Нерешённые — в «Повторить» в дневнике.
6. **Дневник:** 3 строки в день — что понял, что непонятно, что повторить.
7. **Правило вслух:** тема не закрыта, пока ты не объяснил её вслух за 2 минуты без подглядывания.
8. **Интервальное повторение:** в начале дня 15 минут — [экзамен](#/quizzes) на 10 случайных вопросов из пройденных разделов.

---

## Неделя 1. JavaScript

### День 1. Типы, числа, строки
- [ ] [Middle-разминка по JS](01-javascript/00-middle-questions.md)
- [ ] [Типы и приведение](01-javascript/01-types-and-coercion.md)
- [ ] [Числа: number, BigInt, Math](01-javascript/09-numbers.md)
- [ ] [Строки и Symbol](01-javascript/10-strings-and-symbols.md)

### День 2. Объекты, массивы, коллекции, циклы
- [ ] [Работа с объектами](01-javascript/11-objects.md)
- [ ] [Работа с массивами](01-javascript/12-arrays.md)
- [ ] [Map, Set, WeakMap, WeakSet](01-javascript/13-map-set.md)
- [ ] [Циклы и перебор](01-javascript/14-loops.md)

### День 3. Области видимости, this, прототипы
- [ ] [Области видимости, замыкания, hoisting](01-javascript/02-scope-closures-hoisting.md)
- [ ] [this, call/apply/bind](01-javascript/03-this-call-apply-bind.md)
- [ ] [Прототипы и классы](01-javascript/04-prototypes-classes.md)
- [ ] Тесты дня ≥ 80%, все задачи «что выведет» без запуска кода

### День 4. Асинхронность, итераторы, модули, память
- [ ] [Event loop и асинхронность](01-javascript/05-event-loop-async.md)
- [ ] [Объекты, коллекции, итераторы, Proxy](01-javascript/06-objects-collections-iterators.md)
- [ ] [Модули, память, GC](01-javascript/07-modules-memory-gc.md)

### День 5. Live-coding и новинки
- [ ] [Практика: live-coding](01-javascript/08-practice-tasks.md) — все задачи с автотестами, по 15 минут на каждую
- [ ] [Новинки JavaScript ES2023–ES2027](01-javascript/15-whats-new.md)
- [ ] [Алгоритмы: сложность и подход к решению](13-algorithms/01-complexity.md)

## Неделя 2. TypeScript и React

### День 6. TypeScript: система типов
- [ ] [Middle-разминка по TS](02-typescript/00-middle-questions.md)
- [ ] [TS in 5 minutes, разобранный подробно](02-typescript/01-ts-in-5-minutes-deep.md)
- [ ] [Narrowing и union-типы](02-typescript/02-narrowing-and-unions.md)
- [ ] [Generics](02-typescript/03-generics.md)

### День 7. TypeScript: уровень типов, инструменты, новинки
- [ ] [Type-level programming](02-typescript/04-type-level-programming.md)
- [ ] [Продвинутые паттерны](02-typescript/05-advanced-patterns.md)
- [ ] [tsconfig и инструменты](02-typescript/06-config-and-tooling.md)
- [ ] [Практика: type challenges](02-typescript/07-practice-tasks.md)
- [ ] [Новинки TypeScript 5.x, 6.0, 7.0](02-typescript/08-whats-new.md)

### День 8. React: внутреннее устройство
- [ ] [Middle-разминка по React](03-react/00-middle-questions.md)
- [ ] [Рендеринг и reconciliation](03-react/01-rendering-reconciliation.md)
- [ ] [Хуки в деталях](03-react/02-hooks-deep-dive.md)
- [ ] [Управление состоянием](03-react/03-state-management.md)

### День 9. React: производительность и современный стек
- [ ] [Производительность](03-react/04-performance.md)
- [ ] [React 19 и Server Components](03-react/05-react-19-and-server-components.md)
- [ ] [Паттерны и тестирование](03-react/06-patterns-and-testing.md)
- [ ] [Новинки React 19.x и React Compiler](03-react/11-whats-new.md)

### День 10. React: live-coding и стейт-менеджеры
- [ ] [Вопросы и live-coding по React](03-react/07-interview-questions.md)
- [ ] [Стейт-менеджеры в React: сравнение, кэширование и инвалидация](03-react/10-state-managers-compared.md)
- [ ] Сравнил вслух Redux Toolkit / Zustand / TanStack Query / effector: когда что выбрать

## Неделя 3. Next.js, Vue, Nuxt

### День 11. Next.js
- [ ] [Next.js: основы, роутинг, рендеринг](03-react/08-nextjs-fundamentals.md)
- [ ] [Next.js: данные, кэширование, Server Actions, деплой](03-react/09-nextjs-data-and-caching.md)

### День 12. Vue: устройство
- [ ] [Middle-разминка по Vue](04-vue/00-middle-questions.md)
- [ ] [Реактивность](04-vue/01-reactivity.md)
- [ ] [Composition API](04-vue/02-composition-api.md)
- [ ] [Компоненты и рендеринг](04-vue/03-components-and-rendering.md)

### День 13. Vue: экосистема, производительность, новинки
- [ ] [Экосистема](04-vue/04-ecosystem.md)
- [ ] [Производительность, Vue и React](04-vue/05-performance-and-vue-vs-react.md)
- [ ] [Вопросы по Vue](04-vue/06-interview-questions.md)
- [ ] [Новинки Vue 3.4–3.6](04-vue/09-whats-new.md)

### День 14. Nuxt и стейт во Vue
- [ ] [Nuxt](04-vue/07-nuxt.md)
- [ ] [Стейт-менеджеры во Vue](04-vue/08-state-managers.md)

### День 15. Алгоритмы: базовые паттерны
- [ ] [Хэш-таблицы, два указателя, окно, префиксные суммы](13-algorithms/02-hashing-two-pointers-window.md)
- [ ] [Стек, очередь, куча](13-algorithms/03-stack-queue-heap.md)
- [ ] Решил 6 задач easy/medium из [каталога](#/algo) по этим тегам

## Неделя 4. Веб-платформа и инструменты

### День 16. Вёрстка, семантика, браузер
- [ ] [Middle-разминка по платформе](06-web-platform/00-middle-questions.md)
- [ ] [HTML, семантика, доступность](06-web-platform/01-html-semantics-a11y.md)
- [ ] [CSS и вёрстка](06-web-platform/02-css-layout.md)
- [ ] [Как браузер рендерит страницу](06-web-platform/03-browser-rendering.md)
- [ ] Рассказал вслух «что происходит после ввода URL» за 5 минут

### День 17. Сеть, производительность, безопасность
- [ ] [Сеть и HTTP](06-web-platform/04-network-http.md)
- [ ] [Web Performance](06-web-platform/05-web-performance.md)
- [ ] [Безопасность](06-web-platform/06-security.md)
- [ ] [Хранилища, воркеры, браузерные API](06-web-platform/07-storage-workers-apis.md)

### День 18. Новинки платформы и формы
- [ ] [Новинки CSS 2023–2026](06-web-platform/08-whats-new-css.md)
- [ ] [Новинки HTML и DOM](06-web-platform/09-whats-new-html.md)
- [ ] [Формы и валидация](16-forms-i18n-auth/01-forms.md)

### День 19. i18n, аутентификация
- [ ] [Интернационализация и форматирование](16-forms-i18n-auth/02-i18n.md)
- [ ] [Аутентификация и авторизация](16-forms-i18n-auth/03-auth.md)
- [ ] Нарисовал схему OIDC + PKCE + BFF по памяти

### День 20. Сборщики и оптимизация бандла
- [ ] [Middle-разминка по инструментам](10-tooling-testing/00-middle-questions.md)
- [ ] [Сборщики: Vite, Webpack, Rspack, Babel/SWC](10-tooling-testing/01-bundlers.md)
- [ ] [Пишем плагины и лоадеры](10-tooling-testing/02-plugins-and-loaders.md)
- [ ] [Оптимизация бандла](10-tooling-testing/03-bundle-optimization.md)

## Неделя 5. Тестирование, продакшен, архитектура

### День 21. Тестирование, CI/CD, пакеты
- [ ] [Стратегия тестирования](10-tooling-testing/04-testing-strategy.md)
- [ ] [CI/CD и DevOps для фронтенда](10-tooling-testing/05-ci-cd-devops.md)
- [ ] [Пакетные менеджеры, монорепо, линтеры](10-tooling-testing/06-packages-monorepo-linting.md)

### День 22. Продакшн-фронтенд
- [ ] [Обработка ошибок и мониторинг](15-production/01-errors-and-monitoring.md)
- [ ] [Наблюдаемость и RUM](15-production/02-observability-rum.md)
- [ ] [Feature flags и A/B-эксперименты](15-production/03-feature-flags-experiments.md)
- [ ] [Релизы, зависимости, устаревшие API](15-production/04-releases-and-dependencies.md)
- [ ] [Сторонние скрипты и аналитика](15-production/05-third-party-analytics.md)

### День 23. Архитектура: принципы, Clean, FSD
- [ ] [Middle-разминка по архитектуре](05-architecture/00-middle-questions.md)
- [ ] [Принципы (SOLID и другие)](05-architecture/01-principles.md)
- [ ] [Чистая архитектура](05-architecture/02-clean-architecture.md)
- [ ] [Feature-Sliced Design](05-architecture/03-fsd.md)

### День 24. Архитектура: практика и масштабирование
- [ ] [FSD на практике](05-architecture/04-fsd-in-practice.md)
- [ ] [MVC, MVP, MVVM](05-architecture/05-mvc-mvp-mvvm.md)
- [ ] [Паттерны и масштабирование](05-architecture/06-patterns-and-scaling.md)
- [ ] [Микрофронтенды](05-architecture/08-microfrontends.md)
- [ ] Нарисовал FSD-структуру своего текущего (или прошлого) проекта

### День 25. System design и выбор технологий
- [ ] [Frontend System Design](05-architecture/07-frontend-system-design.md)
- [ ] [Выбор технологий](05-architecture/09-tech-selection.md)
- [ ] Разобрал один кейс system design вслух за 45 минут

## Неделя 6. Дизайн-системы, алгоритмы, команда

### День 26. Дизайн-системы: токены, API, доступность
- [ ] [Дизайн-токены и темы](14-design-systems/01-design-tokens-theming.md)
- [ ] [API компонентов](14-design-systems/02-component-api.md)
- [ ] [Доступные компоненты](14-design-systems/03-accessible-components.md)

### День 27. Дизайн-системы: документация, CSS, процесс
- [ ] [Storybook, документация, версионирование](14-design-systems/04-storybook-docs-versioning.md)
- [ ] [CSS-архитектура в масштабе](14-design-systems/05-css-architecture.md)
- [ ] [Работа с дизайном: UI-kit, макеты, процесс](14-design-systems/06-working-with-design.md)

### День 28. Алгоритмы: поиск, деревья, графы
- [ ] [Бинарный поиск и сортировки](13-algorithms/04-binary-search-sorting.md)
- [ ] [Связные списки, деревья, trie](13-algorithms/05-lists-and-trees.md)
- [ ] [Графы](13-algorithms/06-graphs.md)

### День 29. Алгоритмы: DP и фронтенд-задачи
- [ ] [Рекурсия, бэктрекинг, DP](13-algorithms/07-recursion-dp.md)
- [ ] [Алгоритмы во фронтенде](13-algorithms/08-frontend-algorithms.md)
- [ ] Все задачи «Алгоритмы во фронтенде» решены без подсказок

### День 30. Отладка, git, командная работа
- [ ] [Отладка: DevTools и методика](17-debugging-git-team/01-debugging.md)
- [ ] [Git: ветки, история, конфликты](17-debugging-git-team/02-git.md)
- [ ] [Код-ревью](17-debugging-git-team/03-code-review.md)
- [ ] [Работа в команде](17-debugging-git-team/04-teamwork.md)

## Неделя 7. Lead и AI

### День 31. Lead: роль, найм, люди
- [ ] [Роль и ожидания](07-lead/01-role-and-expectations.md)
- [ ] [Найм и онбординг](07-lead/02-hiring-and-onboarding.md)
- [ ] [Управление людьми](07-lead/03-people-management.md)

### День 32. Lead: процессы, стратегия, качество
- [ ] [Процессы команды](07-lead/04-team-processes.md)
- [ ] [Техническая стратегия](07-lead/05-technical-strategy.md)
- [ ] [Качество и delivery](07-lead/06-quality-and-delivery.md)

### День 33. Lead: коммуникация, кейсы, поведенческое интервью
- [ ] [Стейкхолдеры и коммуникация](07-lead/07-stakeholders-and-communication.md)
- [ ] [Сложные кейсы](07-lead/08-hard-cases.md)
- [ ] [Поведенческое интервью](07-lead/09-behavioral-interview.md)
- [ ] [Софт-скиллы senior: челлендж, ревью, работа с продуктом](07-lead/10-senior-soft-skills.md)
- [ ] Собрал банк из 10 своих STAR-историй

### День 34. AI: основы и работа с агентами
- [ ] [Основы LLM](08-ai/01-llm-fundamentals.md)
- [ ] [Ландшафт AI-инструментов](08-ai/02-ai-tools-landscape.md)
- [ ] [Работа с агентами](08-ai/03-working-with-agents.md)

### День 35. AI: в продукте и в команде
- [ ] [AI-фичи во фронтенде](08-ai/04-building-ai-features.md)
- [ ] [AI с позиции лида](08-ai/05-ai-for-leads.md)
- [ ] [Вопросы и практика по AI](08-ai/06-interview-questions.md)
- [ ] Провёл одну фичу через агента от плана до PR и записал выводы

## Неделя 8. Графика и боевой режим

### День 36. Графика: Canvas 2D
- [ ] [Canvas 2D: основы](11-graphics/01-canvas-2d-basics.md)
- [ ] [Анимация и интерактив](11-graphics/02-animation-and-interaction.md)
- [ ] [Производительность и выбор SVG / Canvas / WebGL](11-graphics/03-canvas-performance.md)
- [ ] Покрутил демо 01–04 из [раздела графики](11-graphics/README.md)

### День 37. Графика: WebGL и Three.js
- [ ] [WebGL: основы](11-graphics/04-webgl-basics.md)
- [ ] [Three.js, R3F, TresJS](11-graphics/05-threejs-and-frameworks.md)
- [ ] Сделал один проект из [практики по графике](11-graphics/06-practice-projects.md)

### День 38. Мок: техническое интервью
- [ ] [Мок-интервью №1: JS/TS/React live-coding](09-final/README.md#мок-1-техническое-интервью)
- [ ] [Экзамен](#/quizzes): 40 вопросов по JS, TS, React и Vue, ≥ 80%
- [ ] 2 задачи medium из [каталога](#/algo) за 45 минут вслух

### День 39. Мок: архитектура и system design
- [ ] [Мок-интервью №2: system design](09-final/README.md#мок-2-system-design-и-архитектура)
- [ ] Экзамен: 30 вопросов по архитектуре, платформе, инструментам и продакшену, ≥ 80%

### День 40. Мок: lead-интервью и финал
- [ ] [Мок-интервью №3: lead и поведенческое](09-final/README.md#мок-3-lead-и-поведенческое-интервью)
- [ ] [Самопрезентация и вопросы работодателю](09-final/README.md#самопрезентация)
- [ ] [Чек-лист перед интервью](09-final/README.md#чек-лист-накануне)

---

## Сжатый вариант на 14 дней (senior + lead)

Каждый день — middle-разминка раздела, затем только темы, где разминка или тест показали пробелы. Банки вопросов с реальных собеседований (`interview-bank` в каждом разделе на [странице тестов](#/quizzes)) — обязательно.

| День | Что проходить | Можно отложить |
|---|---|---|
| 1 | JS: дни 1–3 (типы, объекты/массивы, замыкания, this, прототипы) | числа и строки глубоко |
| 2 | JS: дни 4–5 + алгоритмы 01–02 | новинки JS |
| 3 | TS: дни 6–7 | type challenges, кроме 5 базовых |
| 4 | React: дни 8–10 | паттерны |
| 5 | Next.js + Vue/Nuxt: дни 11–14 (по разминке) | Vue, если его нет в вакансии |
| 6 | Платформа: дни 16–17 + новинки CSS/HTML обзорно | хранилища и воркеры |
| 7 | Формы, auth, i18n + инструменты: дни 18–20 | плагины и лоадеры |
| 8 | Тестирование, CI/CD, продакшен: дни 21–22 | A/B-статистика |
| 9 | Архитектура: дни 23–24 | MVC/MVP/MVVM |
| 10 | System design + выбор технологий + дизайн-системы обзорно: дни 25–27 | Storybook |
| 11 | Алгоритмы: фронтенд-задачи + 5 medium | DP, графы |
| 12 | Lead: дни 31–33 | найм, если нет в вакансии |
| 13 | AI: дни 34–35 + моки №1–2 | графика целиком, если её нет в вакансии |
| 14 | Мок №3 + финал | — |

## Если готовишься только на senior

Пропусти дни 31–32, а из дня 33 оставь [софт-скиллы senior](07-lead/10-senior-soft-skills.md) и [поведенческое интервью](07-lead/09-behavioral-interview.md). Пропусти [AI с позиции лида](08-ai/05-ai-for-leads.md). Освободившееся время отдай live-coding, [алгоритмам](#/algo), system design и разделу [отладка, git, команда](17-debugging-git-team/README.md).

## Если готовишься на lead

Технические дни проходи в режиме «Middle-разминка → тест → теория только по пробелам». Полностью: lead-блок, [System Design](05-architecture/07-frontend-system-design.md), [выбор технологий](05-architecture/09-tech-selection.md), [микрофронтенды](05-architecture/08-microfrontends.md), [продакшн-фронтенд](15-production/README.md), [дизайн-системы](14-design-systems/README.md) и [AI с позиции лида](08-ai/05-ai-for-leads.md).
