QUIZ.register({
  "id": "10-tooling-testing/07-playwright",
  "section": "10-tooling-testing",
  "title": "Playwright: e2e-тесты на практике",
  "order": 7,
  "source": "../10-tooling-testing/07-playwright.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой локатор Playwright рекомендует в первую очередь?",
      "options": [
        "`page.locator('#submit-btn')`",
        "`page.getByRole('button', { name: 'Отправить' })`",
        "`page.locator('//div[3]/button')`",
        "`page.$('button')`"
      ],
      "answer": 1,
      "explain": "Роль и доступное имя — то, как страницу видит пользователь и скринридер. CSS и XPath завязаны на вёрстку."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему этот тест нестабилен?",
      "code": "await page.getByRole('button', { name: 'Сохранить' }).click();\nexpect(await page.getByText('Сохранено').isVisible()).toBe(true);",
      "lang": "ts",
      "options": [
        "`isVisible` устарел",
        "`isVisible()` проверяет один раз без ожидания; нужна `await expect(locator).toBeVisible()`",
        "Нельзя использовать `toBe` в Playwright",
        "Нужно добавить `waitForTimeout(1000)`"
      ],
      "answer": 1,
      "explain": "Веб-первые проверки повторяются до таймаута. Пауза — не лечение, а новая причина нестабильности."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что произойдёт при `page.getByRole('button').click()`, если на странице 3 кнопки?",
      "options": [
        "Клик по первой",
        "Клик по всем",
        "Ошибка strict mode: локатор неоднозначен",
        "Клик по случайной"
      ],
      "answer": 2,
      "explain": "Strict mode защищает от клика «не туда». Уточните локатор по имени или через `filter`."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Что Playwright проверяет перед `click()` в рамках автоожидания?",
      "options": [
        "Элемент видим",
        "Элемент стабилен (не анимируется)",
        "Элемент принимает события (не перекрыт)",
        "Элемент включён (не `disabled`)",
        "Элемент имеет `data-testid`"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Это actionability-проверки. `data-testid` ни на что не влияет."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как не проходить логин через UI в каждом тесте?",
      "options": [
        "Хранить пароль в localStorage",
        "Setup-проект логинится один раз и сохраняет `storageState`; остальные проекты стартуют с ним",
        "Отключить авторизацию на тестовом стенде",
        "`test.describe.serial` для всех тестов"
      ],
      "answer": 1,
      "explain": "`dependencies: ['setup']` и `use: { storageState }` в конфиге. Файл состояния — в `.gitignore`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Тест упал, при ретрае прошёл. Какой у него статус и что делать?",
      "options": [
        "passed — всё в порядке",
        "flaky — найти причину или пометить `test.fixme` с задачей, а не поднимать число ретраев",
        "failed — прогон красный всегда",
        "skipped"
      ],
      "answer": 1,
      "explain": "По умолчанию flaky не валит прогон, но это сигнал о проблеме. `failOnFlakyTests` делает такие тесты фатальными."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Тест падает только в CI. Что даст больше всего информации?",
      "options": [
        "Добавить `console.log` во все шаги",
        "Trace (`trace: 'on-first-retry'`): DOM-снимки, сеть, консоль и шаги в момент падения",
        "Увеличить таймауты в 10 раз",
        "Перезапустить CI"
      ],
      "answer": 1,
      "explain": "Trace viewer показывает, что было на экране и в сети. Дальше — воспроизведение с `--repeat-each` и воркерами как в CI."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает этот код?",
      "code": "await page.route('**/api/products*', (route) =>\n  route.fulfill({ json: [{ id: 1, title: 'Тестовый товар' }] }),\n);",
      "lang": "ts",
      "options": [
        "Ждёт 5 секунд",
        "Подменяет ответ API фиксированными данными — запрос до сервера не доходит",
        "Логирует все запросы",
        "Блокирует страницу"
      ],
      "answer": 1,
      "explain": "`route.fulfill` отвечает вместо сервера. `route.continue()` пропустил бы запрос, `route.abort()` — оборвал бы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `Promise.all` в этом фрагменте?",
      "code": "const [response] = await Promise.all([\n  page.waitForResponse((r) => r.url().includes('/api/orders')),\n  page.getByRole('button', { name: 'Оформить' }).click(),\n]);",
      "lang": "ts",
      "options": [
        "Для скорости",
        "Чтобы начать ждать ответ до клика — иначе ответ может прийти раньше, чем начнётся ожидание",
        "Это обязательный синтаксис Playwright",
        "Чтобы клик выполнился дважды"
      ],
      "answer": 1,
      "explain": "Ожидание события должно быть подписано до действия, которое его вызывает."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как распределить 600 e2e-тестов на 4 машины CI и получить один отчёт?",
      "options": [
        "4 копии конфига с разными `testDir`",
        "`--shard=i/4` на каждой машине, blob-репортер и `npx playwright merge-reports`",
        "`workers: 4` на одной машине",
        "Запустить последовательно 4 раза"
      ],
      "answer": 1,
      "explain": "Шардинг делит тесты между машинами, `merge-reports` собирает общий HTML-отчёт."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему скриншотные эталоны, снятые на macOS, не совпадают в CI на Linux?",
      "options": [
        "Playwright по-разному кодирует PNG",
        "Разные шрифты, сглаживание и рендеринг; эталоны нужно снимать и проверять в одном окружении, например в Docker-образе Playwright",
        "В CI другой размер PNG по умолчанию",
        "Linux не поддерживает скриншоты"
      ],
      "answer": 1,
      "explain": "Плюс маскирование динамики, отключение анимаций и фиксированное время."
    },
    {
      "type": "multi",
      "level": "lead",
      "q": "Что из этого — причины нестабильных e2e-тестов?",
      "options": [
        "`page.waitForTimeout(500)` вместо ожидания состояния",
        "Общий тестовый пользователь для параллельных тестов",
        "Локаторы по ролям",
        "Зависимость от текущего времени",
        "Тест рассчитывает на результат предыдущего теста"
      ],
      "answer": [
        0,
        1,
        3,
        4
      ],
      "explain": "Локаторы по ролям — наоборот, делают тесты устойчивее."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "CTO спрашивает: «Как вы выстроите e2e на Playwright, чтобы им доверяли и он не тормозил релизы?»",
      "answer": "Покрываю e2e только критичные пути (вход, оплата, ключевые формы), остальное — unit и интеграционные тесты. Локаторы по ролям, веб-первые проверки, никаких пауз. Данные — через API-фикстуры, свои на каждый тест; логин один раз через `storageState`. Внешние сервисы мокаю, критичный путь гоняю против настоящего тестового стенда. В CI: параллельность и шардинг с `merge-reports`, на PR — Chromium, полный набор браузеров — ночью или перед релизом; trace на ретрае как артефакт. Flaky считаю багом: метрика доли flaky, `test.fixme` с задачей, а не рост ретраев. Скриншоты — в Docker-образе Playwright с маскированием. Время прогона — метрика команды, цель — e2e на PR в пределах 10 минут."
    }
  ],
  "tasks": [
    {
      "title": "Повторять проверку до таймаута",
      "level": "middle",
      "prompt": "Реализуйте `retryUntil(fn, { timeout, interval })` — упрощённый аналог `expect(...).toPass()`. `fn` — синхронная или асинхронная функция. Вызывайте её; если она бросила исключение или вернула отклонённый промис, ждите `interval` мс и пробуйте снова. Верните промис с результатом первого успешного вызова. Если за `timeout` мс от начала успеха не было, отклоните промис **последней** ошибкой `fn`. Первый вызов делайте сразу.",
      "starter": "async function retryUntil(fn, { timeout, interval }) {\n  // ваш код\n}",
      "solution": "async function retryUntil(fn, { timeout, interval }) {\n  const deadline = Date.now() + timeout;\n  let lastError;\n  for (;;) {\n    try {\n      return await fn();\n    } catch (error) {\n      lastError = error;\n    }\n    if (Date.now() + interval > deadline) throw lastError;\n    await new Promise((r) => setTimeout(r, interval));\n  }\n}",
      "tests": [
        {
          "name": "успех с первого раза",
          "code": "let calls = 0;\nconst v = await retryUntil(() => { calls++; return 42; }, { timeout: 100, interval: 10 });\nreturn v === 42 && calls === 1;"
        },
        {
          "name": "успех после нескольких попыток",
          "code": "let calls = 0;\nconst v = await retryUntil(async () => { calls++; if (calls < 3) throw new Error('not yet'); return 'ok'; }, { timeout: 200, interval: 5 });\nreturn v === 'ok' && calls === 3;"
        },
        {
          "name": "отклоняет последней ошибкой",
          "code": "let calls = 0;\ntry {\n  await retryUntil(() => { calls++; throw new Error('fail ' + calls); }, { timeout: 40, interval: 10 });\n  return false;\n} catch (e) {\n  return e.message === 'fail ' + calls && calls >= 2;\n}"
        },
        {
          "name": "не ждёт дольше таймаута",
          "code": "const start = Date.now();\ntry { await retryUntil(() => { throw new Error('x'); }, { timeout: 50, interval: 10 }); } catch {}\nreturn Date.now() - start < 300;"
        }
      ]
    },
    {
      "title": "Glob-шаблон URL для `page.route`",
      "level": "senior",
      "prompt": "Реализуйте `matchUrl(pattern, url)` по упрощённым правилам glob: `**` — любая последовательность символов, включая `/`; `*` — любая последовательность символов, **кроме** `/`; все остальные символы, включая `.` и `?`, совпадают буквально. Шаблон должен совпасть с URL **целиком**. Верните `true`/`false`.",
      "starter": "function matchUrl(pattern, url) {\n  // ваш код\n}",
      "solution": "function matchUrl(pattern, url) {\n  let source = '';\n  for (let i = 0; i < pattern.length; i++) {\n    const ch = pattern[i];\n    if (ch === '*' && pattern[i + 1] === '*') {\n      source += '.*';\n      i++;\n    } else if (ch === '*') {\n      source += '[^/]*';\n    } else {\n      source += ch.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&');\n    }\n  }\n  return new RegExp('^' + source + '$').test(url);\n}",
      "tests": [
        {
          "name": "** захватывает слэши",
          "code": "return matchUrl('**/api/products', 'https://shop.dev/v2/api/products') === true;"
        },
        {
          "name": "* не переходит через /",
          "code": "return matchUrl('https://shop.dev/api/*', 'https://shop.dev/api/products') === true && matchUrl('https://shop.dev/api/*', 'https://shop.dev/api/products/1') === false;"
        },
        {
          "name": "query-строка через *",
          "code": "return matchUrl('**/api/products*', 'https://shop.dev/api/products?page=2') === true;"
        },
        {
          "name": "точка и ? буквально",
          "code": "return matchUrl('**/logo.png', 'https://cdn.dev/logoXpng') === false && matchUrl('**/a?b=1', 'https://x.dev/a?b=1') === true && matchUrl('**/a?b=1', 'https://x.dev/ab=1') === false;"
        },
        {
          "name": "совпадение целиком",
          "code": "return matchUrl('**/api/cart', 'https://shop.dev/api/cart/items') === false;"
        }
      ]
    },
    {
      "title": "Итоги прогона с ретраями",
      "level": "senior",
      "prompt": "Реализуйте `summarize(results, { failOnFlaky = false } = {})`. `results` — массив `{ title, attempts }`, где `attempts` — массив статусов попыток по порядку: `'passed'`, `'failed'` или `'skipped'` (пропущенный тест имеет одну попытку `'skipped'`). Итог теста:\n- `passed` — прошёл с первой попытки;\n- `flaky` — первая попытка упала, но какая-то из следующих прошла;\n- `failed` — ни одна попытка не прошла;\n- `skipped`.\nВерните `{ passed, flaky, failed, skipped, flakyTitles, exitCode }`: счётчики, отсортированные названия flaky-тестов и код выхода — `1`, если есть `failed`, или есть `flaky` при `failOnFlaky`; иначе `0`.",
      "starter": "function summarize(results, { failOnFlaky = false } = {}) {\n  // ваш код\n}",
      "solution": "function summarize(results, { failOnFlaky = false } = {}) {\n  const out = { passed: 0, flaky: 0, failed: 0, skipped: 0, flakyTitles: [] };\n  for (const { title, attempts } of results) {\n    if (attempts[0] === 'skipped') out.skipped++;\n    else if (attempts[0] === 'passed') out.passed++;\n    else if (attempts.includes('passed')) { out.flaky++; out.flakyTitles.push(title); }\n    else out.failed++;\n  }\n  out.flakyTitles.sort();\n  out.exitCode = out.failed > 0 || (failOnFlaky && out.flaky > 0) ? 1 : 0;\n  return out;\n}",
      "tests": [
        {
          "name": "все категории",
          "code": "const r = summarize([\n  { title: 'login', attempts: ['passed'] },\n  { title: 'cart', attempts: ['failed', 'passed'] },\n  { title: 'pay', attempts: ['failed', 'failed', 'failed'] },\n  { title: 'admin', attempts: ['skipped'] },\n]);\nreturn r.passed === 1 && r.flaky === 1 && r.failed === 1 && r.skipped === 1 && r.exitCode === 1;"
        },
        {
          "name": "flaky не валит по умолчанию",
          "code": "const r = summarize([{ title: 'b', attempts: ['failed', 'passed'] }, { title: 'a', attempts: ['failed', 'failed', 'passed'] }]);\nreturn r.exitCode === 0 && JSON.stringify(r.flakyTitles) === JSON.stringify(['a', 'b']);"
        },
        {
          "name": "failOnFlaky",
          "code": "const r = summarize([{ title: 'x', attempts: ['failed', 'passed'] }], { failOnFlaky: true });\nreturn r.exitCode === 1 && r.failed === 0;"
        },
        {
          "name": "пустой прогон",
          "code": "const r = summarize([]);\nreturn r.passed === 0 && r.exitCode === 0 && r.flakyTitles.length === 0;"
        }
      ]
    }
  ]
});
