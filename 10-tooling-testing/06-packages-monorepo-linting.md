# Пакетные менеджеры, монорепо, линтеры

> ⏱ ~2 ч · 🎯 Понимать, как устанавливаются зависимости и что такое semver и lock-файл, настроить монорепо и качество кода (линтер, форматтер, хуки).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Объясню разницу npm, Yarn и pnpm и что такое фантомные зависимости
- [ ] Понимаю semver, диапазоны и роль lock-файла
- [ ] Знаю `dependencies`, `devDependencies`, `peerDependencies`, поле `exports`
- [ ] Настрою монорепо на pnpm workspaces + Turborepo/Nx
- [ ] Различаю линтер и форматтер и знаю современные инструменты
- [ ] Ответил вслух на вопросы ниже

## Теория

### npm, Yarn, pnpm

| | npm | Yarn Berry | pnpm |
|---|---|---|---|
| `node_modules` | плоский (hoisting) | Plug'n'Play (без `node_modules`) или `node-modules` linker | строгий: симлинки на глобальное хранилище |
| Фантомные зависимости | возможны | нет в PnP | нет |
| Диск | копии в каждом проекте | zip-кэш | одно хранилище, жёсткие ссылки |
| Монорепо | workspaces | workspaces, constraints | workspaces, `catalog:` для единых версий |

**Фантомная зависимость** — пакет, который вы импортируете, но не объявили (он попал в корень `node_modules` как зависимость зависимости). Работает до первого обновления, которое его уберёт. pnpm такого не допускает.

### Semver и lock-файл

`MAJOR.MINOR.PATCH`: major — несовместимые изменения, minor — новые возможности, patch — исправления. Диапазоны: `^1.4.2` (≥1.4.2 <2.0.0), `~1.4.2` (≥1.4.2 <1.5.0), для `0.x` — `^0.4.2` значит <0.5.0. Lock-файл фиксирует точное дерево версий и хэши целостности: у всех и в CI одинаковая установка. Коммитить всегда; в CI — `npm ci` / `pnpm install --frozen-lockfile`.

### Поля package.json

- `dependencies` — нужны в рантайме; `devDependencies` — только для разработки и сборки.
- `peerDependencies` — «принесите сами»: библиотека компонентов требует React той же копии, что у приложения (две копии React ломают хуки).
- `exports` — публичная карта входов пакета и условия (`import`, `require`, `types`, `browser`, `development`); закрывает глубокие импорты.
- `type: "module"` — `.js` трактуются как ESM.
- `sideEffects` — подсказка для tree shaking.
- `engines`, `packageManager` (Corepack) — версии инструментов.

### Монорепо

```text
apps/
  web/            # приложение
  admin/
packages/
  ui/             # дизайн-система
  api-client/     # сгенерированный клиент
  config-eslint/  # общие пресеты
  config-ts/
pnpm-workspace.yaml
turbo.json
```

- **Workspaces** (pnpm) — локальные пакеты связываются симлинками (`"@acme/ui": "workspace:*"`).
- **Оркестратор** (Turborepo, Nx) — граф задач по зависимостям пакетов, параллельный запуск, локальный и удалённый кэш, `affected`.
- **Границы** — теги и правила импортов (Nx `enforce-module-boundaries`, eslint-plugin-boundaries), CODEOWNERS.
- **Публикация** — Changesets: описание изменений в PR → версии и changelog → публикация из CI.
- **Внутренние пакеты** можно не собирать: приложение компилирует их исходники напрямую («just-in-time packages») — проще, но медленнее сборка приложения.

Плюсы и минусы монорепо по сравнению с полирепо — в [банке вопросов по архитектуре](../quizzes/quiz.html?id=05-architecture/interview-bank).

### Линтеры и форматтеры

- **Форматтер** — внешний вид кода: Prettier; Biome и oxfmt — быстрые альтернативы на Rust. Решает споры о стиле один раз.
- **Линтер** — ошибки и плохие практики: ESLint 9+ c flat config (`eslint.config.js`) и typescript-eslint (правила с информацией о типах); Oxlint и Biome — в десятки раз быстрее, покрывают популярные правила; часто используют Oxlint для быстрых правил и ESLint — для специфичных плагинов.
- Важные плагины: `react-hooks` (правила хуков, в том числе правила React Compiler), `jsx-a11y`, `vuejs-accessibility`, `import`/границы модулей (Steiger для FSD), `testing-library`, `vitest`.
- **Stylelint** — для CSS.
- **Запуск**: в IDE при сохранении, на pre-commit для изменённых файлов (lefthook или husky + lint-staged), в CI как обязательная проверка.

🪤 **Ловушка:** правила форматирования в ESLint (отступы, кавычки) конфликтуют с Prettier — отключите их (`eslint-config-prettier`) и не смешивайте ответственность.

### TypeScript в монорепо

Общий `tsconfig.base.json`, `strict: true`, project references для инкрементальной проверки больших репозиториев. С TypeScript 7 (компилятор на Go) проверка типов в разы быстрее — это меняет баланс «проверять типы в CI или только в IDE» в пользу CI на каждый PR. См. [новинки TS](../02-typescript/08-whats-new.md).

## Вопросы с собеседований

<details><summary>Чем pnpm лучше npm?</summary>

Быстрее установка и меньше диска (одно глобальное хранилище, жёсткие ссылки), строгий `node_modules` без фантомных зависимостей, удобные workspaces и каталоги версий для монорепо, по умолчанию не запускает install-скрипты зависимостей без разрешения (меньше поверхность атак supply chain).
</details>

<details><summary>Зачем lock-файл, если в package.json уже есть версии?</summary>

В `package.json` — диапазоны (`^1.2.0`), разные установки могут получить разные версии. Lock-файл фиксирует точные версии всего дерева и хэши, обеспечивая воспроизводимость и защиту от подмены пакетов.
</details>

<details><summary>Когда нужны peerDependencies?</summary>

Когда библиотека должна использовать ту же копию пакета, что и приложение: React, Vue, библиотека состояния. Иначе в бандле окажутся две копии с разными контекстами и состоянием (классическая ошибка «Invalid hook call»).
</details>

<details><summary>Зачем нужны линтер и форматтер, если есть код-ревью?</summary>

Автоматизация механических проверок освобождает ревью для архитектуры и логики, делает стиль единым без споров и ловит ошибки до ревью (правила хуков, доступность, неиспользуемый код).
</details>

## Практика

1. Создайте монорепо: `apps/web` и `packages/ui` на pnpm workspaces + Turborepo; проверьте кэш задач.
2. Найдите фантомную зависимость в своём проекте: переключитесь на pnpm и посмотрите, что сломается.
3. Настройте lefthook/lint-staged: форматирование и линтер только для изменённых файлов.

Тест темы: [Пакеты, монорепо, линтеры](../quizzes/quiz.html?id=10-tooling-testing/06-packages-monorepo-linting).

## Источники
- [pnpm: Motivation](https://pnpm.io/motivation)
- [pnpm: Workspaces](https://pnpm.io/workspaces)
- [Node.js: Package entry points (exports)](https://nodejs.org/api/packages.html#package-entry-points)
- [semver](https://semver.org/lang/ru/)
- [Turborepo docs](https://turborepo.com/docs)
- [ESLint: Configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)
