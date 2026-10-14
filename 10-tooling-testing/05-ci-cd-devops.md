# CI/CD и DevOps для фронтенда

> ⏱ ~3 ч · 🎯 Спроектировать пайплайн от PR до продакшена: проверки, кэш, preview-окружения, артефакты, деплой SPA/SSR, раскатка и откат.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Знаю шаги CI для PR и как их распараллелить и закэшировать
- [ ] Понимаю принцип «собрать один раз — продвигать по окружениям»
- [ ] Знаю, как деплоить SPA (CDN, кэш-заголовки, fallback на `index.html`)
- [ ] Знаю варианты деплоя SSR (Node-сервер, serverless, edge, контейнер)
- [ ] Понимаю канареечную раскатку, feature flags и быстрый откат
- [ ] Ответил вслух на вопросы ниже

## Теория

### CI на pull request

```yaml
# .github/workflows/ci.yml (упрощённо)
name: CI
on: [pull_request]
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run typecheck lint test build --affected
      - run: pnpm size-limit
  e2e:
    needs: checks
    runs-on: ubuntu-latest
    strategy:
      matrix: { shard: [1, 2, 3] }
    steps:
      # ... установка, сборка или загрузка артефакта
      - run: pnpm playwright test --shard=${{ matrix.shard }}/3
```

Порядок: быстрые и дешёвые проверки первыми (типы, линтер, unit), затем сборка, затем дорогие (e2e, визуальная регрессия, Lighthouse CI). Параллельные джобы и шардинг e2e.

### Как ускорить CI

- Кэш зависимостей (store pnpm) и `--frozen-lockfile`.
- Кэш задач с удалённым хранилищем (Turborepo Remote Cache, Nx Cloud): неизменённые пакеты не пересобираются и не тестируются.
- `affected` — только пакеты, затронутые изменением, и их зависимые.
- Быстрые инструменты: Vitest, Oxlint/Biome вместо части правил ESLint, SWC/Oxc.
- Отмена устаревших запусков (`concurrency` в GitHub Actions).
- Метрика: время от пуша до зелёного статуса; цель — меньше 10 минут.

### Preview-окружения

Каждый PR разворачивается по уникальному URL (Vercel, Netlify, Cloudflare Pages или свой Kubernetes namespace). Ссылка в PR: дизайнеры, QA и продакт проверяют до мержа, e2e и Lighthouse запускаются против preview.

### CD: собрать один раз

Артефакт собирается **один раз** и продвигается dev → staging → prod. Конфигурация окружения (URL API, ключи аналитики, флаги) подставляется **в рантайме** (`/config.json`, переменные SSR-сервера, `window.__ENV__` в HTML), а не вшивается при сборке — иначе staging и prod — разные сборки, и протестировано не то, что выкатили.

🪤 **Ловушка:** переменные с префиксом `VITE_`/`NEXT_PUBLIC_` попадают в публичный бандл. Секреты там хранить нельзя.

### Деплой SPA

- Статика на CDN/объектное хранилище.
- Ассеты с хэшем: `Cache-Control: public, max-age=31536000, immutable`; `index.html`: `no-cache` (проверка свежести при каждой загрузке).
- Fallback: все неизвестные пути → `index.html` (client-side routing), но не для `/assets/*` (иначе отсутствующий чанк вернёт HTML и упадёт с непонятной ошибкой).
- Старые ассеты не удалять сразу после релиза: у открытых вкладок старый `index.html`.
- Заголовки безопасности: CSP, `Strict-Transport-Security`, `X-Content-Type-Options`.

### Деплой SSR

| Вариант | Плюсы | Минусы |
|---|---|---|
| Node-сервер / контейнер | полный контроль, долгоживущие соединения, кэш в памяти | масштабирование и эксплуатация на вас |
| Serverless-функции | автоскейлинг, оплата за вызовы | холодный старт, лимиты времени |
| Edge (CDN-рантайм) | низкая задержка у пользователя | ограниченный рантайм (нет части Node API), данные далеко |

Nuxt (Nitro) и Next.js умеют собирать под разные цели (presets/adapters). Кэширование HTML на CDN (`s-maxage`, `stale-while-revalidate`) часто важнее выбора рантайма.

### Безопасная раскатка

- **Feature flags** — отделить деплой кода от включения фичи; kill switch.
- **Канареечный релиз** — новая версия на 1–5% трафика, сравнение ошибок и метрик, затем расширение.
- **Blue-green** — две среды, переключение трафика, мгновенный откат.
- **Откат** — повторный деплой предыдущего артефакта за минуты; миграции данных — обратно совместимые.
- **Мониторинг релиза** — Sentry release health, RUM по версиям, алерты на рост ошибок. См. [продакшн-фронтенд](../15-production/README.md).

### Защита main и поставка зависимостей

Защищённая ветка: обязательные проверки, ревью, линейная история; CODEOWNERS. Supply chain: lock-файл, `pnpm install --frozen-lockfile`, запрет скриптов установки для непроверенных пакетов (pnpm по умолчанию не запускает `postinstall` зависимостей без разрешения), minimum release age, provenance при публикации своих пакетов, минимальные права токенов CI (`permissions:` в Actions), закреплённые версии actions.

## Вопросы с собеседований

<details><summary>Опишите CI/CD пайплайн фронтенд-приложения.</summary>

PR: установка с кэшем → типы, линтер, unit/интеграционные тесты параллельно → сборка → бюджет бандла → preview-деплой → e2e и Lighthouse против preview → визуальная регрессия. Merge в main: сборка артефакта один раз, загрузка sourcemaps в мониторинг, деплой на staging, смоук-тесты, канареечная раскатка в прод, мониторинг и автоматический откат по метрикам.
</details>

<details><summary>Почему конфигурацию окружения лучше подставлять в рантайме?</summary>

Тогда один и тот же артефакт проходит все окружения — в прод уходит именно то, что тестировали. Сборка на каждое окружение множит время CI и риск расхождений.
</details>

<details><summary>Как избежать ошибок загрузки чанков после деплоя?</summary>

Не удалять старые ассеты сразу (хранить несколько версий), `index.html` без кэша, ловить ошибку загрузки динамического импорта и перезагружать страницу (один раз, с защитой от цикла), уведомлять пользователя о новой версии (проверка `version.json`, Service Worker).
</details>

<details><summary>Как ускорить CI в монорепо?</summary>

Граф задач (Turborepo/Nx) с удалённым кэшем, запуск только затронутых пакетов, кэш зависимостей, шардинг e2e, отмена устаревших запусков, быстрые инструменты. Следить за временем CI как за метрикой команды.
</details>

## Практика

1. Напишите workflow GitHub Actions с кэшем pnpm, параллельными проверками и шардингом Playwright.
2. Настройте заголовки кэширования для SPA на своём хостинге и проверьте их в DevTools.
3. Реализуйте обработку `vite:preloadError` с одной перезагрузкой страницы.

Тест темы: [CI/CD и DevOps](../quizzes/quiz.html?id=10-tooling-testing/05-ci-cd-devops).

## Источники
- [GitHub Actions: Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Turborepo: Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Vite: Load error handling](https://vite.dev/guide/build.html#load-error-handling)
- [Playwright: Sharding](https://playwright.dev/docs/test-sharding)
- [web.dev: HTTP cache](https://web.dev/articles/http-cache)
