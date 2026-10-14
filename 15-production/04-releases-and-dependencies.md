# Релизы, зависимости, устаревшие API

> ⏱ ~2 ч · 🎯 Поддерживать здоровье продукта годами: регулярные и безопасные обновления зависимостей, защита от атак на цепочку поставок, отслеживание устаревших браузерных API, согласованное поведение в браузерах.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Настроил автоматические обновления (Renovate/Dependabot) с группировкой
- [ ] Знаю основные меры защиты supply chain
- [ ] Умею планировать мажорные обновления фреймворка
- [ ] Знаю Reporting API и Baseline для отслеживания платформы
- [ ] Ответил вслух на вопросы ниже

## Теория

### Обновления зависимостей

Маленькие обновления каждую неделю безопаснее, чем большое раз в год: меньше изменений за раз, проще найти причину регрессии, нет «стены» мажоров.

```json
// renovate.json (фрагмент)
{
  "extends": ["config:recommended"],
  "schedule": ["before 9am on monday"],
  "minimumReleaseAge": "3 days",
  "packageRules": [
    { "matchUpdateTypes": ["patch", "minor"], "matchDepTypes": ["devDependencies"], "automerge": true },
    { "matchPackagePatterns": ["^@tanstack/"], "groupName": "tanstack" }
  ]
}
```

- Группировка связанных пакетов, расписание, автомерж только для безопасных обновлений при зелёном CI.
- `minimumReleaseAge` — не ставить версии, которым меньше N дней: большинство скомпрометированных релизов обнаруживают и снимают за часы или дни.
- Хорошая сеть безопасности: типы, тесты, визуальная регрессия, preview, канареечный релиз.
- Мажоры — отдельными PR по changelog и migration guide, с codemods (React, Next.js, Vue, Nuxt предоставляют их).
- «Дежурный по зависимостям» по ротации в команде.

### Атаки на цепочку поставок

Реальные инциденты: захват аккаунтов мейнтейнеров и публикация вредоносных версий популярных пакетов, self-replicating черви в npm, typosquatting и slopsquatting (пакеты с именами, которые «придумывают» AI-ассистенты).

Меры:
- Lock-файл и установка строго по нему в CI.
- Запрет install-скриптов для зависимостей (pnpm по умолчанию; разрешать точечно).
- Minimum release age, проверка новых зависимостей (Socket, `npm audit`, OSV), provenance.
- Минимум зависимостей: каждая — риск и стоимость поддержки.
- Секреты CI с минимальными правами, отдельные токены публикации, 2FA/trusted publishing.
- SRI (`integrity`) для скриптов с внешних CDN.

### Мажорные обновления фреймворков

План: инвентаризация (что сломается — по changelog и codemod dry-run), подготовительные шаги в текущей версии (исправить deprecation-предупреждения, strict mode), обновление под флагом или по частям, где возможно, полный прогон тестов и визуальной регрессии, канареечная раскатка, мониторинг. Для больших продуктов — инкрементально (React 18 → 19 сначала исправить предупреждения 18.3; Vue 2 → 3 через compat-сборку).

### Устаревшие и удаляемые браузерные API

- **Reporting API**: `ReportingObserver` в коде и заголовок `Reporting-Endpoints` — браузер присылает отчёты о deprecation, интервенциях, нарушениях CSP.
- Источники: Chrome Platform Status, release notes браузеров, [Baseline](https://web.dev/baseline) для понимания, что можно использовать без полифилов.
- Примеры удалений последних лет: сторонние cookies (ограничения и изменения в браузерах), событие `unload`, синхронный XHR в обработчиках выгрузки, `document.domain` для ослабления same-origin.
- Deprecation trials дают время, но это временная мера.

```js
const observer = new ReportingObserver(
  (reports) => reports.forEach((r) => sendToMonitoring({ type: r.type, body: r.body })),
  { types: ['deprecation', 'intervention'], buffered: true },
);
observer.observe();
```

### Согласованность в браузерах

Browserslist — единая цель для транспиляции, полифилов и автопрефиксов, синхронизированная с реальной аудиторией (аналитика). Feature detection (`CSS.supports`, `'popover' in HTMLElement.prototype`) вместо user agent. Тесты в Playwright на Chromium, Firefox и WebKit для критичных сценариев; реальные устройства для мобильного Safari. Interop — ежегодная инициатива браузеров по устранению расхождений.

## Вопросы с собеседований

<details><summary>Как держать зависимости актуальными без поломки продакшна?</summary>

Автоматические PR (Renovate) с группировкой, расписанием и minimum release age, автомерж только безопасных при зелёном CI, сеть безопасности из тестов и визуальной регрессии, мажоры отдельно по migration guide с codemods, канареечный релиз и мониторинг, регулярность и владелец процесса.
</details>

<details><summary>Как защититься от атак на цепочку поставок npm?</summary>

Lock-файл и `--frozen-lockfile`, запрет install-скриптов, задержка новых версий, проверка пакетов перед добавлением, минимальное число зависимостей, ограниченные секреты CI, trusted publishing и 2FA для своих пакетов, мониторинг уязвимостей.
</details>

<details><summary>Как узнать, что ваше приложение использует API, который браузеры скоро удалят?</summary>

Reporting API (`ReportingObserver` и `Reporting-Endpoints` с типом deprecation) в продакшене, предупреждения в консоли и DevTools Issues, отслеживание Chrome Platform Status и release notes, правила линтера на известные устаревшие API.
</details>

## Практика

1. Настройте Renovate в пет-проекте с группировкой и `minimumReleaseAge`.
2. Подключите `ReportingObserver` и проверьте, приходят ли отчёты о deprecation.

Тест темы: [Релизы и зависимости](../quizzes/quiz.html?id=15-production/04-releases-and-dependencies).

## Источники
- [Renovate Docs](https://docs.renovatebot.com/)
- [pnpm: Settings (onlyBuiltDependencies, minimumReleaseAge)](https://pnpm.io/settings)
- [MDN: Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API)
- [web.dev: Baseline](https://web.dev/baseline)
- [Browserslist](https://browsersl.ist/)
- [Interop](https://wpt.fyi/interop)
