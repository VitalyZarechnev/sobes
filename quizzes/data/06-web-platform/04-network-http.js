QUIZ.register({
  "id": "06-web-platform/04-network-http",
  "section": "06-web-platform",
  "title": "Сеть и HTTP",
  "order": 4,
  "source": "../06-web-platform/04-network-http.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем HTTP/2 лучше HTTP/1.1?",
      "options": [
        "Шифрование",
        "Мультиплексирование потоков в одном соединении, сжатие заголовков",
        "Новые методы",
        "Без TCP"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт HTTP/3?",
      "options": [
        "Новые заголовки",
        "QUIC поверх UDP: нет head-of-line blocking на уровне TCP, быстрое установление соединения, миграция при смене сети",
        "Только сжатие",
        "Отменяет TLS"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Когда браузер отправляет preflight `OPTIONS`?",
      "options": [
        "Всегда",
        "Для «непростых» CORS-запросов: методы кроме GET/HEAD/POST, нестандартные заголовки, `Content-Type: application/json`",
        "Только для GET",
        "Никогда"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что означает `Cache-Control: no-cache`?",
      "options": [
        "Не кэшировать",
        "Можно хранить, но перед использованием проверять свежесть на сервере",
        "Кэш на год",
        "Только в памяти"
      ],
      "answer": 1,
      "explain": "Не хранить вообще — `no-store`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как браузер валидирует закэшированный ресурс?",
      "options": [
        "Скачивает заново",
        "`If-None-Match` с ETag (или `If-Modified-Since`) → 304 Not Modified без тела",
        "Сравнивает размер",
        "Через cookies"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что дают `preconnect` и `dns-prefetch`?",
      "options": [
        "Загружают ресурс",
        "Заранее устанавливают соединение (DNS, TCP, TLS) с важным сторонним доменом",
        "Кэшируют страницу",
        "Ускоряют JS"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Парсер Cache-Control",
      "level": "middle",
      "prompt": "Реализуйте `parseCacheControl(header)` → объект директив: ключи в нижнем регистре, значения числовых директив (`max-age`, `s-maxage`, `stale-while-revalidate`) — числа, директивы без значения — `true`, значения в кавычках без кавычек. И `isFreshFor(header, ageSec)` — `true`, если нет `no-store`/`no-cache` и `ageSec < max-age`.",
      "starter": "function parseCacheControl(header) {}\nfunction isFreshFor(header, ageSec) {}",
      "solution": "function parseCacheControl(header) {\n  const result = {};\n  for (const part of header.split(',')) {\n    const [rawKey, ...rawValue] = part.trim().split('=');\n    if (!rawKey) continue;\n    const key = rawKey.trim().toLowerCase();\n    if (rawValue.length === 0) {\n      result[key] = true;\n      continue;\n    }\n    const value = rawValue.join('=').trim().replace(/^\"|\"$/g, '');\n    result[key] = /^\\d+$/.test(value) ? Number(value) : value;\n  }\n  return result;\n}\n\nfunction isFreshFor(header, ageSec) {\n  const cc = parseCacheControl(header);\n  if (cc['no-store'] || cc['no-cache']) return false;\n  return typeof cc['max-age'] === 'number' && ageSec < cc['max-age'];\n}",
      "tests": [
        {
          "name": "разбор",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(parseCacheControl(\"public, Max-Age=3600, immutable\"), { public: true, \"max-age\": 3600, immutable: true });"
        },
        {
          "name": "кавычки",
          "code": "return parseCacheControl('private=\"set-cookie\"').private === \"set-cookie\";"
        },
        {
          "name": "свежесть",
          "code": "return isFreshFor(\"max-age=60\", 30) && !isFreshFor(\"max-age=60\", 60) && !isFreshFor(\"no-cache, max-age=60\", 1) && !isFreshFor(\"public\", 1);"
        }
      ]
    }
  ]
});
