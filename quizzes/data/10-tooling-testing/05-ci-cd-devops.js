QUIZ.register({
  "id": "10-tooling-testing/05-ci-cd-devops",
  "section": "10-tooling-testing",
  "title": "CI/CD и DevOps",
  "order": 5,
  "source": "../10-tooling-testing/05-ci-cd-devops.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Почему артефакт лучше собирать один раз и продвигать по окружениям?",
      "options": [
        "Экономия места",
        "В прод уходит ровно то, что протестировано на staging",
        "Так требует CDN",
        "Быстрее установка"
      ],
      "answer": 1,
      "explain": "Конфигурацию окружения тогда подставляют в рантайме."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Можно ли хранить секретный ключ API в `VITE_SECRET_KEY`?",
      "options": [
        "Да",
        "Нет: переменные с префиксом `VITE_` встраиваются в публичный бандл",
        "Только в prod",
        "Если обфусцировать"
      ],
      "answer": 1,
      "explain": "Всё, что попало в клиентский бандл, доступно пользователю."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "SPA: какие заголовки у `index.html`?",
      "options": [
        "`max-age=31536000, immutable`",
        "`no-cache` (проверять свежесть при каждой загрузке)",
        "`no-store` для всего сайта",
        "любые"
      ],
      "answer": 1,
      "explain": "Иначе пользователи долго не получат ссылки на новые чанки."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Fallback SPA «все пути → index.html» применили и к `/assets/*`. Что случится при отсутствующем чанке?",
      "options": [
        "404",
        "Вернётся HTML вместо JS — ошибка разбора модуля с непонятным сообщением",
        "Ничего",
        "Загрузится старая версия"
      ],
      "answer": 1,
      "explain": "Для ассетов нужен честный 404."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что ускоряет CI монорепо?",
      "options": [
        "Удалённый кэш задач (Turborepo/Nx)",
        "Запуск только affected-пакетов",
        "Шардинг e2e",
        "Отключение lock-файла",
        "Отмена устаревших запусков"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Без lock-файла установка становится невоспроизводимой."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Чем канареечный релиз отличается от blue-green?",
      "options": [
        "Ничем",
        "Канарейка — постепенно увеличиваемая доля трафика; blue-green — переключение всего трафика между двумя средами",
        "Blue-green только для бэкенда",
        "Канарейка — это A/B тест"
      ],
      "answer": 1,
      "explain": "Оба уменьшают риск релиза и упрощают откат."
    }
  ],
  "tasks": [
    {
      "title": "Cache-Control для статического хостинга",
      "level": "middle",
      "prompt": "Реализуйте `cacheControl(path)` для SPA: файлы с хэшем вида `name.<8+ hex>.ext` или `name-<8+ hex>.ext` → `\"public, max-age=31536000, immutable\"`; `index.html`, `/` и любые `.html` → `\"no-cache\"`; `service-worker.js` / `sw.js` → `\"no-cache\"`; всё остальное → `\"public, max-age=3600\"`.",
      "starter": "function cacheControl(path) {\n  // ваш код\n}",
      "solution": "function cacheControl(path) {\n  const file = path.split('/').pop() || 'index.html';\n  if (file.endsWith('.html') || file === 'service-worker.js' || file === 'sw.js') return 'no-cache';\n  if (/[.-][0-9a-f]{8,}\\.[a-z0-9]+$/i.test(file)) return 'public, max-age=31536000, immutable';\n  return 'public, max-age=3600';\n}",
      "tests": [
        {
          "name": "хэш через точку",
          "code": "return cacheControl(\"/assets/index.3f9a1c2b.js\") === \"public, max-age=31536000, immutable\";"
        },
        {
          "name": "хэш через дефис",
          "code": "return cacheControl(\"/assets/vendor-a1b2c3d4e5.css\") === \"public, max-age=31536000, immutable\";"
        },
        {
          "name": "html",
          "code": "return cacheControl(\"/index.html\") === \"no-cache\" && cacheControl(\"/\") === \"no-cache\" && cacheControl(\"/about.html\") === \"no-cache\";"
        },
        {
          "name": "service worker",
          "code": "return cacheControl(\"/sw.js\") === \"no-cache\";"
        },
        {
          "name": "без хэша",
          "code": "return cacheControl(\"/favicon.ico\") === \"public, max-age=3600\" && cacheControl(\"/assets/logo.svg\") === \"public, max-age=3600\";"
        }
      ]
    }
  ]
});
