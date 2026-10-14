QUIZ.register({
  "id": "15-production/04-releases-and-dependencies",
  "section": "15-production",
  "title": "Релизы, зависимости, устаревшие API",
  "order": 4,
  "source": "../15-production/04-releases-and-dependencies.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `minimumReleaseAge` в Renovate/pnpm?",
      "options": [
        "Ускорить установку",
        "Не ставить версии моложе N дней: скомпрометированные релизы обычно обнаруживают и снимают быстро",
        "Обновлять только старые пакеты",
        "Для semver"
      ],
      "answer": 1,
      "explain": "Простая и эффективная защита от атак на цепочку поставок."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как узнать в продакшене, что код использует устаревшие API?",
      "options": [
        "Никак",
        "Reporting API: `ReportingObserver` и заголовок `Reporting-Endpoints`",
        "Только по жалобам",
        "Через `navigator.userAgent`"
      ],
      "answer": 1,
      "explain": "Браузер присылает отчёты о deprecation и интервенциях."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что снижает риск атак на цепочку поставок?",
      "options": [
        "lock-файл и `--frozen-lockfile`",
        "запрет install-скриптов зависимостей",
        "минимум зависимостей",
        "`npm install` последних версий в CI",
        "SRI для скриптов с CDN"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему маленькие регулярные обновления лучше редких больших?",
      "options": [
        "Меньше трафика",
        "Меньше изменений за раз — проще найти причину регрессии, нет «стены» мажоров",
        "Так требует npm",
        "Не лучше"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
