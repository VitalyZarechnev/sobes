QUIZ.register({
  "id": "15-production/03-feature-flags-experiments",
  "section": "15-production",
  "title": "Feature flags и эксперименты",
  "order": 3,
  "source": "../15-production/03-feature-flags-experiments.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Чем плох anti-flicker сниппет клиентских A/B-инструментов?",
      "options": [
        "Ничем",
        "Скрывает страницу до применения варианта — ухудшает LCP всем пользователям",
        "Ломает SEO-разметку",
        "Нарушает CSP всегда"
      ],
      "answer": 1,
      "explain": "Назначайте вариант на сервере или edge."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Флаг включён на 100% уже два месяца. Что делать?",
      "options": [
        "Ничего",
        "Удалить флаг и мёртвую ветку кода",
        "Выключить",
        "Создать ещё один флаг"
      ],
      "answer": 1,
      "explain": "Протухшие флаги — техдолг и источник багов."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Эксперимент 50/50, а в данных 47/53 при большой выборке. Что это значит?",
      "options": [
        "Вариант B лучше",
        "Sample ratio mismatch — баг в назначении или трекинге, результатам нельзя доверять",
        "Нормальный шум",
        "Нужно остановить эксперимент и объявить победителя"
      ],
      "answer": 1,
      "explain": "SRM — классический признак поломки эксперимента."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие флаги долгоживущие?",
      "options": [
        "релизные",
        "kill switch (операционные)",
        "права/тарифы",
        "экспериментальные"
      ],
      "answer": [
        1,
        2
      ],
      "explain": "Релизные и экспериментальные удаляются после завершения."
    }
  ],
  "tasks": [
    {
      "title": "Детерминированная раскатка на процент",
      "level": "senior",
      "prompt": "Реализуйте `isInRollout(flagKey, userId, percent)`: пользователь попадает в раскатку, если `bucket < percent`, где `bucket` — число 0–99 из хэша строки `flagKey + \":\" + userId` (FNV-1a 32-bit по кодам UTF-16, затем `% 100`). Один пользователь всегда получает один результат; при увеличении процента ранее включённые пользователи остаются включёнными.",
      "starter": "function isInRollout(flagKey, userId, percent) {\n  // ваш код\n}",
      "solution": "function isInRollout(flagKey, userId, percent) {\n  const key = `${flagKey}:${userId}`;\n  let hash = 0x811c9dc5;\n  for (let i = 0; i < key.length; i++) {\n    hash ^= key.charCodeAt(i);\n    hash = Math.imul(hash, 0x01000193) >>> 0;\n  }\n  return hash % 100 < percent;\n}",
      "tests": [
        {
          "name": "детерминированность",
          "code": "return isInRollout(\"f\", \"u1\", 50) === isInRollout(\"f\", \"u1\", 50);"
        },
        {
          "name": "0 и 100",
          "code": "return !isInRollout(\"f\", \"u1\", 0) && isInRollout(\"f\", \"u1\", 100);"
        },
        {
          "name": "монотонность",
          "code": "for (let i = 0; i < 200; i++) { if (isInRollout(\"x\", \"u\" + i, 20) && !isInRollout(\"x\", \"u\" + i, 50)) return false; } return true;"
        },
        {
          "name": "распределение ~30%",
          "code": "let n = 0; for (let i = 0; i < 10000; i++) if (isInRollout(\"checkout\", \"user-\" + i, 30)) n++; return n > 2700 && n < 3300;"
        },
        {
          "name": "разные флаги — разные выборки",
          "code": "let same = 0; for (let i = 0; i < 1000; i++) if (isInRollout(\"a\", \"u\" + i, 50) === isInRollout(\"b\", \"u\" + i, 50)) same++; return same < 600;"
        }
      ],
      "notes": "Ключ флага в хэше нужен, чтобы одни и те же пользователи не попадали первыми во все раскатки сразу."
    }
  ]
});
