QUIZ.register({
  "id": "15-production/02-observability-rum",
  "section": "15-production",
  "title": "Наблюдаемость и RUM",
  "order": 2,
  "source": "../15-production/02-observability-rum.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какую метрику можно измерить только в поле (RUM)?",
      "options": [
        "LCP",
        "CLS",
        "INP",
        "TBT"
      ],
      "answer": 2,
      "explain": "INP требует реальных взаимодействий пользователя. TBT — лабораторный аналог."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "По какому перцентилю оценивают Core Web Vitals?",
      "options": [
        "среднее",
        "медиана (p50)",
        "p75",
        "p99"
      ],
      "answer": 2,
      "explain": "75-й перцентиль — баланс между типичным и плохим опытом."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой API показывает, какие скрипты выполнялись в долгом кадре?",
      "options": [
        "Resource Timing",
        "Long Animation Frames (LoAF)",
        "Navigation Timing",
        "Paint Timing"
      ],
      "answer": 1,
      "explain": "Главный инструмент поиска причин плохого INP в поле."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему метрики отправляют через `sendBeacon`?",
      "options": [
        "Быстрее fetch",
        "Запрос надёжно уходит даже при закрытии вкладки",
        "Не нужен CORS",
        "Шифрует данные"
      ],
      "answer": 1,
      "explain": "Обычный fetch может быть отменён при выгрузке страницы (или используйте `fetch` с `keepalive`)."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Что такое SLO?",
      "options": [
        "Метрика производительности сервера",
        "Цель для измеримого показателя (SLI) за период, например «90% просмотров с LCP ≤ 2,5 с за 28 дней»",
        "Соглашение с клиентом о штрафах",
        "Название алерта"
      ],
      "answer": 1,
      "explain": "SLA — внешнее соглашение со штрафами, SLO — внутренняя цель."
    }
  ],
  "tasks": [
    {
      "title": "p75 по сегментам",
      "level": "senior",
      "prompt": "Даны записи RUM `{ metric, value, device }`. Реализуйте `p75BySegment(records, metric)` → объект `{ [device]: p75 }` для заданной метрики. Перцентиль — метод nearest-rank: отсортировать значения, взять элемент с индексом `Math.ceil(0.75 * n) - 1`.",
      "starter": "function p75BySegment(records, metric) {\n  // ваш код\n}",
      "solution": "function p75BySegment(records, metric) {\n  const groups = Map.groupBy(records.filter((r) => r.metric === metric), (r) => r.device);\n  const result = {};\n  for (const [device, items] of groups) {\n    const values = items.map((r) => r.value).toSorted((a, b) => a - b);\n    result[device] = values[Math.ceil(0.75 * values.length) - 1];\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "два сегмента",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const r = [1,2,3,4].map((v) => ({ metric: \"LCP\", value: v * 1000, device: \"mobile\" })).concat([{ metric: \"LCP\", value: 900, device: \"desktop\" }, { metric: \"INP\", value: 500, device: \"desktop\" }]); return eq(p75BySegment(r, \"LCP\"), { mobile: 3000, desktop: 900 });"
        },
        {
          "name": "числовая сортировка",
          "code": "const r = [100, 20, 3, 1000].map((value) => ({ metric: \"INP\", value, device: \"m\" })); return p75BySegment(r, \"INP\").m === 100;"
        },
        {
          "name": "нет данных",
          "code": "return Object.keys(p75BySegment([], \"CLS\")).length === 0;"
        }
      ]
    }
  ]
});
