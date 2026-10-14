# Frontend Interview Wiki · Senior & Lead

> 🚧 **WIP · work in progress** — вики наполняется и дорабатывается.

Вики для подготовки к собеседованию Senior Frontend и Frontend Lead: теория, вопросы с ответами, тесты, задачи с автотестами и отслеживание прогресса.

**Открыть:** [`index.html`](index.html) — двойной клик, сервер не нужен. Это единая точка входа: все разделы, тесты, экзамен, каталог задач на алгоритмы, дневник и прогресс. Прогресс хранится в браузере (localStorage), его можно экспортировать и импортировать на главной.

**Старт:** [Роадмап по дням](ROADMAP.md) → разделы ниже. **Самопроверка:** [карта покрытия ключевых тем](COVERAGE.md).

## 📊 Прогресс

> Главный прогресс — в приложении (`index.html`): отметки чек-листов, тесты, задачи. Таблица ниже считает отметки `[x]`, если вы ведёте прогресс прямо в Markdown (Obsidian, VS Code): `node scripts/progress.mjs`.

<!-- PROGRESS:START -->
| | Раздел | Прогресс | % | Пункты |
|---|---|---|---|---|
| ⬜ | [JavaScript](01-javascript/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/158 |
| ⬜ | [TypeScript](02-typescript/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/80 |
| ⬜ | [React и Next.js](03-react/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/109 |
| ⬜ | [Vue и Nuxt](04-vue/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/86 |
| ⬜ | [Архитектура](05-architecture/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/87 |
| ⬜ | [Вёрстка, браузер, сеть](06-web-platform/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/86 |
| ⬜ | [Lead-компетенции](07-lead/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/87 |
| ⬜ | [AI и агенты](08-ai/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/58 |
| ⬜ | [Сборка, тесты, DevOps](10-tooling-testing/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/50 |
| ⬜ | [Canvas, 2D/3D графика](11-graphics/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/48 |
| ⬜ | [Алгоритмы и структуры данных](13-algorithms/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/58 |
| ⬜ | [Дизайн-системы и UI-kit](14-design-systems/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/44 |
| ⬜ | [Продакшн-фронтенд](15-production/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/37 |
| ⬜ | [Формы, i18n, auth](16-forms-i18n-auth/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/26 |
| ⬜ | [Отладка, git, команда](17-debugging-git-team/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/30 |
| ⬜ | [Финальная подготовка](09-final/README.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/14 |
| ⬜ | [Роадмап (дни)](ROADMAP.md) | `░░░░░░░░░░░░░░░░░░░░` | 0% | 0/141 |

**Всего по темам: 0%** (0/1058) · обновлено 2026-10-13
<!-- PROGRESS:END -->

## 🗺 Разделы

| # | Раздел | Дни | Для кого | О чём |
|---|---|---|---|---|
| 01 | [JavaScript](01-javascript/README.md) | 1–5 | Все | Типы, числа, строки, объекты, массивы, Map/Set, циклы, замыкания, this, прототипы, event loop, память, live-coding, новинки ES2023–2027 |
| 02 | [TypeScript](02-typescript/README.md) | 6–7 | Все | TS in 5 minutes с углублением, narrowing, generics, type-level programming, tsconfig, новинки TS 6/7 |
| 03 | [React и Next.js](03-react/README.md) | 8–11 | Все | Fiber, хуки, производительность, React 19, RSC, **Next.js** (Cache Components), **сравнение стейт-менеджеров**, новинки |
| 04 | [Vue и Nuxt](04-vue/README.md) | 12–14 | Все | Реактивность, Composition API, компилятор, **Nuxt**, **Pinia и серверный кэш**, новинки 3.4–3.6 |
| 13 | [Алгоритмы и структуры данных](13-algorithms/README.md) | 15, 28–29 + ежедневно | Все | Сложность, хэш, два указателя, окно, стек, куча, бинпоиск, деревья, графы, DP, фронтенд-задачи. **72 задачи в стиле LeetCode** |
| 06 | [Вёрстка, браузер, сеть](06-web-platform/README.md) | 16–18 | Все | Семантика, a11y, CSS, рендеринг, HTTP, производительность, безопасность, новинки CSS и HTML |
| 16 | [Формы, i18n, аутентификация](16-forms-i18n-auth/README.md) | 18–19 | Все | Сложные формы и валидация, Intl и RTL, OAuth/OIDC, PKCE, BFF, сессии и токены |
| 10 | [Сборка, тестирование, DevOps](10-tooling-testing/README.md) | 20–21 | Все | Vite, Rolldown, Webpack/Rspack, свои плагины, оптимизация бандла, стратегия тестирования, CI/CD, монорепо |
| 15 | [Продакшн-фронтенд](15-production/README.md) | 22 | Senior, **Lead** | Ошибки и мониторинг, RUM и SLO, feature flags и A/B, зависимости и supply chain, сторонние скрипты |
| 05 | [Архитектура](05-architecture/README.md) | 23–25 | Senior, **Lead** | **Чистая архитектура, FSD**, MVC/MVP/MVVM, микрофронтенды, system design, выбор технологий |
| 14 | [Дизайн-системы и UI-kit](14-design-systems/README.md) | 26–27 | Senior, **Lead** | Токены и темы, API компонентов, доступность, Storybook и версионирование, CSS-архитектура, работа с дизайном |
| 17 | [Отладка, git, командная работа](17-debugging-git-team/README.md) | 30 | Все | DevTools, поиск багов, git и конфликты, код-ревью, оценки, коммуникация |
| 07 | [Lead-компетенции](07-lead/README.md) | 31–33 | **Lead** (+ софт-скиллы senior) | Люди, найм, процессы, стратегия, техдолг, стейкхолдеры, поведенческое интервью |
| 08 | [AI и агенты](08-ai/README.md) | 34–35 | Все | LLM, AI-инструменты, работа с агентами, AI-фичи, внедрение в команду |
| 11 | [Canvas, 2D и 3D графика](11-graphics/README.md) | 36–37 | Все | Canvas 2D, анимация, WebGL, Three.js/R3F/TresJS, 6 интерактивных демо, практические проекты |
| 09 | [Финал](09-final/README.md) | 38–40 | Все | Мок-интервью, самопрезентация, вопросы работодателю |

## 🧭 Как устроена каждая тема

1. **Шапка** — сколько времени нужно и что должен уметь senior/lead.
2. **Чек-лист** — отмечай пункты по ходу работы, из них считается прогресс.
3. **Теория** — с примерами кода, разделами «🪤 Ловушка» и «💡 На собеседовании».
4. **Вопросы с собеседований** — ответы под спойлером: сначала ответь вслух, потом сверься.
5. **Практика** и **источники** — первоисточники для углубления.
6. **🧪 Тест темы** — карточка внизу страницы: вопросы уровней Middle / Senior / Lead и задачи с автотестами.

## 🧪 Тесты, экзамен, задачи

- **Тесты по каждой теме:** вопросы «один/несколько ответов», «что выведет», «порядок», «ответь вслух» с самооценкой; задачи — редактор кода с автотестами прямо в браузере и эталонные решения.
- **Банки вопросов с реальных собеседований** — тест `Вопросы с реальных собеседований` в каждом разделе (по материалам roasted.cv, Яндекс Практикума, itcodik, kalashnikof) с ответами.
- **Экзамен** — случайные вопросы из выбранных разделов и уровней.
- **Каталог алгоритмов** — задачи с тегами, сложностью Easy/Medium/Hard и статусом решения.
- Сейчас: **134 теста, 1069 вопросов, 204 задачи с автотестами**.

## 🛠 Для авторов

```bash
npm --prefix app install           # один раз
npm --prefix app run dev           # приложение с hot reload на http://localhost:5180
npm --prefix app run build         # проверка тестов, типов и сборка index.html в корне
node scripts/build-quizzes.mjs     # проверить схему тестов и прогнать эталонные решения задач
node scripts/check-links.mjs       # найти битые ссылки на страницы и тесты
node scripts/quiz-append.mjs patch.js   # дописать вопросы и задачи в тесты из файла-патча
```

- Шаблон страниц — [scripts/STYLE.md](scripts/STYLE.md), формат тестов — [quizzes/FORMAT.md](quizzes/FORMAT.md).
- Приложение: React 19 + Vite + TypeScript, архитектура Feature-Sliced Design (`app/src`: app → pages → widgets → features → entities → shared). Markdown и тесты встраиваются при сборке, поэтому `index.html` работает без сервера.

## 📚 Главные источники

- [learn.javascript.ru](https://learn.javascript.ru/) — современный учебник JavaScript, основа разделов 01 и 06
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) и [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) — основа раздела 02
- [react.dev](https://react.dev/), [nextjs.org/docs](https://nextjs.org/docs), [vuejs.org](https://vuejs.org/guide/), [nuxt.com/docs](https://nuxt.com/docs)
- [feature-sliced.design](https://feature-sliced.design/), [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [MDN](https://developer.mozilla.org/), [web.dev](https://web.dev/)

## ⚙️ Где ещё удобно читать

Markdown-файлы остаются первоисточником: их можно открыть в **Obsidian** (папка как vault, кликабельные чекбоксы и граф связей), **VS Code** (Markdown Preview) или залить в приватный репозиторий.
