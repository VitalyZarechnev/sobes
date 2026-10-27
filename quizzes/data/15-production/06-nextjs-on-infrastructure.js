QUIZ.register({
  "id": "15-production/06-nextjs-on-infrastructure",
  "section": "15-production",
  "title": "Next.js и фронтенд на инфраструктуре",
  "order": 6,
  "source": "../15-production/06-nextjs-on-infrastructure.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что нужно сделать после сборки с `output: 'standalone'`, чтобы стили и чанки не отдавали 404?",
      "options": [
        "Ничего, всё уже внутри `.next/standalone`",
        "Скопировать `public/` и `.next/static/` рядом с `server.js` или отдавать их с CDN",
        "Запустить `next export`",
        "Установить `node_modules` целиком"
      ],
      "answer": 1,
      "explain": "Трассировка зависимостей собирает только серверный код и нужные пакеты. Статика и `public` копируются отдельно — частая причина «сломанных стилей» после первого деплоя."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему в Dockerfile рекомендуют `CMD [\"node\", \"server.js\"]`, а не `CMD npm start`?",
      "options": [
        "`npm start` медленнее стартует на 10 секунд",
        "npm и shell — лишние прослойки: `SIGTERM` может не дойти до приложения, и контейнер убьют по таймауту",
        "`npm` нет в образе node",
        "Так требует Next.js"
      ],
      "answer": 1,
      "explain": "Корректная остановка требует, чтобы сигнал получил сам процесс приложения. Exec-форма запускает его без shell, PID 1 — это Node."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Вы поменяли `NEXT_PUBLIC_API_URL` в манифесте Kubernetes и перезапустили поды. Что увидит клиент?",
      "options": [
        "Новое значение сразу",
        "Старое значение: `NEXT_PUBLIC_*` вшито в JS-бандл при сборке, нужна пересборка образа",
        "Пустую строку",
        "Ошибку гидратации"
      ],
      "answer": 1,
      "explain": "Публичные переменные подставляются строкой при сборке. Для конфигурации без пересборки её отдают с сервера в рантайме."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что начинает расходиться, когда у self-hosted Next.js две реплики и больше?",
      "options": [
        "Кэш данных и ISR: у каждой реплики свой",
        "Ключ шифрования Server Actions, если он не задан явно и одинаково",
        "Порядок CSS-правил",
        "Рассинхрон версий при раскатке: HTML от новой версии, чанк от старой",
        "Хэши в именах статических файлов одной сборки"
      ],
      "answer": [
        0,
        1,
        3
      ],
      "explain": "Хэши одной сборки одинаковы. А вот кэш, ключи и разные версии во время rolling update — классические проблемы горизонтального масштабирования."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "В dev стриминг с Suspense работает, в проде страница появляется целиком только в конце. Самая вероятная причина?",
      "options": [
        "React 19 не поддерживает стриминг в проде",
        "Прокси (например, nginx) буферизует ответ — нужно `proxy_buffering off` или `X-Accel-Buffering: no`",
        "Не хватает памяти",
        "Включён `compress: true`"
      ],
      "answer": 1,
      "explain": "nginx по умолчанию копит ответ. Проверка: `curl -N` напрямую в под и через прокси."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что правильно проверять в liveness-пробе фронтенд-сервера?",
      "options": [
        "Доступность БД и всех внешних API",
        "Только то, что сам процесс жив и отвечает",
        "Наличие свободного места на диске CDN",
        "Что прошли e2e-тесты"
      ],
      "answer": 1,
      "explain": "Если liveness зависит от внешних систем, их сбой вызовет перезапуск всех подов — каскадный отказ. Зависимости — дело readiness и метрик."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расставьте шаги корректной остановки пода при раскатке:",
      "items": [
        "Под получает `SIGTERM`",
        "Readiness начинает отвечать «не готов», под убирают из балансировки",
        "Приложение дожидается текущих запросов и закрывает соединения",
        "Процесс завершается с кодом 0",
        "Если не успели за grace period — приходит `SIGKILL`"
      ],
      "explain": "Пауза перед `server.close()` нужна, потому что балансировщик узнаёт об удалении пода не мгновенно."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой `Cache-Control` подходит для файлов из `/_next/static/`?",
      "options": [
        "`no-store`",
        "`public, max-age=31536000, immutable`",
        "`private, max-age=60`",
        "`no-cache`"
      ],
      "answer": 1,
      "explain": "Имена содержат хэш содержимого: новый контент — новое имя. Значит, кэшировать можно навсегда."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Ответ страницы зависит от cookie сессии, а CDN кэширует её по URL с `s-maxage=60`. Чем это грозит?",
      "options": [
        "Ничем, CDN сам учтёт cookie",
        "Один пользователь может увидеть персональную страницу другого",
        "Только лишним трафиком",
        "Ошибкой CORS"
      ],
      "answer": 1,
      "explain": "Утечка персональных данных через общий кэш — реальный класс инцидентов. Персональные ответы — `private, no-store`, или кэш с явным учётом ключа."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Под перезапускается со статусом `OOMKilled`. Что из этого — первая разумная проверка?",
      "options": [
        "Переписать всё на Go",
        "Посмотреть график памяти: растёт постоянно (утечка) или скачками под нагрузкой (мало лимита)",
        "Отключить GC",
        "Удалить liveness-пробу"
      ],
      "answer": 1,
      "explain": "Характер роста памяти разделяет утечку и недостаточный лимит. Дальше — снимки кучи и `--max-old-space-size` ниже лимита контейнера."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что выведет этот серверный модуль после трёх запросов разных пользователей и почему это опасно?",
      "code": "let currentUser = null;\n\nexport async function render(req) {\n  currentUser = req.user.name;\n  await fetchData();          // в это время приходит запрос другого пользователя\n  return `Привет, ${currentUser}`;\n}",
      "options": [
        "Каждому — своё имя; безопасно",
        "Последнее имя для всех: модульная переменная общая для всех запросов процесса — утечка данных между пользователями",
        "Ошибку: модули не могут хранить состояние",
        "`undefined`"
      ],
      "answer": 1,
      "explain": "Модуль загружается один раз на процесс. Данные запроса нельзя хранить в модульной области — только в аргументах, контексте запроса или `AsyncLocalStorage`."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "CTO спрашивает: «Как бы вы задеплоили наш Next.js без Vercel и что будет с кэшем и раскаткой?» Ответьте за 2 минуты.",
      "answer": "Сборка один раз в CI: `output: 'standalone'`, многоэтапный образ без root, `node server.js`. Статика `/_next/static` — на CDN с долгим кэшем и хранением нескольких версий; `assetPrefix` и `deploymentId` против рассинхрона версий. Перед подами — Ingress/nginx: TLS, сжатие, без буферизации для стриминга. Минимум 2 реплики, HPA по CPU и задержке. Общий кэш ISR и `revalidateTag` через `cacheHandler` + Redis, единый ключ Server Actions. Startup/readiness/liveness-пробы, корректная остановка по `SIGTERM`. Конфигурация — в рантайме, секреты — не в `NEXT_PUBLIC_`. Логи в stdout в JSON, OpenTelemetry через `instrumentation.ts`, Sentry с релизами, алерты на ошибки и p95 TTFB."
    }
  ],
  "tasks": [
    {
      "title": "Какие публичные переменные утекут в бандл",
      "level": "middle",
      "prompt": "Реализуйте `findLeakedSecrets(env)`. На вход — объект переменных окружения. Верните **отсортированный** массив имён, которые одновременно: начинаются с `NEXT_PUBLIC_` (значит, попадут в клиентский бандл) и содержат в имени (без учёта регистра) одно из слов `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE` или `KEY`, кроме имён, где `KEY` входит в `PUBLIC_KEY` или `PUBLISHABLE_KEY` (их публикуют намеренно). Пустые значения не учитывайте.",
      "starter": "function findLeakedSecrets(env) {\n  // ваш код\n}",
      "solution": "function findLeakedSecrets(env) {\n  const risky = /SECRET|TOKEN|PASSWORD|PRIVATE|KEY/i;\n  const allowed = /PUBLIC_KEY|PUBLISHABLE_KEY/i;\n  return Object.entries(env)\n    .filter(([name, value]) => name.startsWith('NEXT_PUBLIC_') && value !== '' && value != null)\n    .map(([name]) => name)\n    .filter((name) => {\n      const rest = name.slice('NEXT_PUBLIC_'.length);\n      if (!risky.test(rest)) return false;\n      const withoutAllowed = rest.replace(new RegExp(allowed.source, 'gi'), '');\n      return risky.test(withoutAllowed);\n    })\n    .sort();\n}",
      "tests": [
        {
          "name": "находит токен и секрет",
          "code": "const r = findLeakedSecrets({ NEXT_PUBLIC_API_TOKEN: 'x', NEXT_PUBLIC_CLIENT_SECRET: 'y', NEXT_PUBLIC_API_URL: 'u' });\nreturn JSON.stringify(r) === JSON.stringify(['NEXT_PUBLIC_API_TOKEN', 'NEXT_PUBLIC_CLIENT_SECRET']);"
        },
        {
          "name": "серверные переменные не трогает",
          "code": "return findLeakedSecrets({ DATABASE_PASSWORD: 'p', STRIPE_SECRET_KEY: 's' }).length === 0;"
        },
        {
          "name": "публикуемые ключи разрешены",
          "code": "return findLeakedSecrets({ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk', NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'v' }).length === 0;"
        },
        {
          "name": "регистр и пустые значения",
          "code": "const r = findLeakedSecrets({ NEXT_PUBLIC_maps_key: 'k', NEXT_PUBLIC_EMPTY_TOKEN: '' });\nreturn JSON.stringify(r) === JSON.stringify(['NEXT_PUBLIC_maps_key']);"
        }
      ]
    },
    {
      "title": "Корректная остановка сервера",
      "level": "senior",
      "prompt": "Реализуйте `createLifecycle({ drainDelayMs, timeoutMs })` — модель корректной остановки. Объект возвращает:\n- `isReady()` — `true`, пока не началась остановка;\n- `handle(work)` — принимает функцию, возвращающую промис, и выполняет её как «запрос». Если остановка уже началась, возвращает отклонённый промис с ошибкой `'shutting down'` и `work` не вызывает;\n- `shutdown()` — сразу делает `isReady() === false`, ждёт `drainDelayMs` (балансировщик убирает под), затем ждёт завершения всех текущих запросов. Возвращает промис со строкой `'clean'`, если все запросы завершились, или `'forced'`, если от начала остановки прошло `timeoutMs`. Новые запросы в период `drainDelayMs` уже отклоняются.",
      "starter": "function createLifecycle({ drainDelayMs, timeoutMs }) {\n  // ваш код\n}",
      "solution": "function createLifecycle({ drainDelayMs, timeoutMs }) {\n  let ready = true;\n  const inflight = new Set();\n  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\n  return {\n    isReady: () => ready,\n    handle(work) {\n      if (!ready) return Promise.reject(new Error('shutting down'));\n      const p = Promise.resolve().then(work);\n      const tracked = p.then(() => {}, () => {}).finally(() => inflight.delete(tracked));\n      inflight.add(tracked);\n      return p;\n    },\n    shutdown() {\n      ready = false;\n      const drained = sleep(drainDelayMs)\n        .then(() => Promise.all([...inflight]))\n        .then(() => 'clean');\n      const forced = sleep(timeoutMs).then(() => 'forced');\n      return Promise.race([drained, forced]);\n    },\n  };\n}",
      "tests": [
        {
          "name": "готов до остановки",
          "code": "const l = createLifecycle({ drainDelayMs: 5, timeoutMs: 100 });\nreturn l.isReady() === true;"
        },
        {
          "name": "ждёт текущий запрос",
          "code": "const l = createLifecycle({ drainDelayMs: 5, timeoutMs: 200 });\nlet done = false;\nl.handle(() => new Promise((r) => setTimeout(() => { done = true; r(); }, 30)));\nconst result = await l.shutdown();\nreturn result === 'clean' && done === true;"
        },
        {
          "name": "новые запросы отклоняются сразу",
          "code": "const l = createLifecycle({ drainDelayMs: 20, timeoutMs: 200 });\nconst s = l.shutdown();\nlet called = false;\nlet message = '';\ntry { await l.handle(async () => { called = true; }); } catch (e) { message = e.message; }\nawait s;\nreturn l.isReady() === false && !called && message === 'shutting down';"
        },
        {
          "name": "принудительно по таймауту",
          "code": "const l = createLifecycle({ drainDelayMs: 5, timeoutMs: 40 });\nl.handle(() => new Promise((r) => setTimeout(r, 300)));\nreturn (await l.shutdown()) === 'forced';"
        },
        {
          "name": "упавший запрос не мешает остановке",
          "code": "const l = createLifecycle({ drainDelayMs: 5, timeoutMs: 200 });\nl.handle(() => Promise.reject(new Error('boom'))).catch(() => {});\nreturn (await l.shutdown()) === 'clean';"
        }
      ]
    },
    {
      "title": "Какие старые ассеты можно удалить",
      "level": "senior",
      "prompt": "Ассеты релизов лежат на CDN. Чтобы открытые вкладки со старым HTML не получали 404 на чанки, удалять файлы сразу после релиза нельзя.\n\nРеализуйте `assetsToDelete(releases, { keepLast, minAgeMs, now })`. `releases` — массив `{ id, deployedAt, assets: string[] }` в любом порядке. Сохраняются ассеты `keepLast` самых свежих релизов и всех релизов, выкаченных позже, чем `now - minAgeMs`. Верните отсортированный массив файлов, которые **не используются ни одним** сохраняемым релизом (файл может входить в несколько релизов). Без дубликатов.",
      "starter": "function assetsToDelete(releases, { keepLast, minAgeMs, now }) {\n  // ваш код\n}",
      "solution": "function assetsToDelete(releases, { keepLast, minAgeMs, now }) {\n  const sorted = [...releases].sort((a, b) => b.deployedAt - a.deployedAt);\n  const kept = sorted.filter((r, i) => i < keepLast || r.deployedAt > now - minAgeMs);\n  const keep = new Set(kept.flatMap((r) => r.assets));\n  const all = new Set(releases.flatMap((r) => r.assets));\n  return [...all].filter((a) => !keep.has(a)).sort();\n}",
      "tests": [
        {
          "name": "держит последние N",
          "code": "const rs = [\n  { id: 'a', deployedAt: 1, assets: ['a.js'] },\n  { id: 'b', deployedAt: 2, assets: ['b.js'] },\n  { id: 'c', deployedAt: 3, assets: ['c.js'] },\n];\nreturn JSON.stringify(assetsToDelete(rs, { keepLast: 2, minAgeMs: 0, now: 100 })) === JSON.stringify(['a.js']);"
        },
        {
          "name": "порядок входа не важен",
          "code": "const rs = [\n  { id: 'c', deployedAt: 3, assets: ['c.js'] },\n  { id: 'a', deployedAt: 1, assets: ['a.js'] },\n  { id: 'b', deployedAt: 2, assets: ['b.js'] },\n];\nreturn JSON.stringify(assetsToDelete(rs, { keepLast: 1, minAgeMs: 0, now: 100 })) === JSON.stringify(['a.js', 'b.js']);"
        },
        {
          "name": "общие файлы не удаляются",
          "code": "const rs = [\n  { id: 'a', deployedAt: 1, assets: ['vendor.js', 'a.js'] },\n  { id: 'b', deployedAt: 2, assets: ['vendor.js', 'b.js'] },\n];\nreturn JSON.stringify(assetsToDelete(rs, { keepLast: 1, minAgeMs: 0, now: 100 })) === JSON.stringify(['a.js']);"
        },
        {
          "name": "свежие релизы сохраняются по возрасту",
          "code": "const rs = [\n  { id: 'a', deployedAt: 50, assets: ['a.js'] },\n  { id: 'b', deployedAt: 90, assets: ['b.js'] },\n  { id: 'c', deployedAt: 95, assets: ['c.js'] },\n];\nreturn JSON.stringify(assetsToDelete(rs, { keepLast: 1, minAgeMs: 20, now: 100 })) === JSON.stringify(['a.js']);"
        }
      ]
    }
  ]
});
