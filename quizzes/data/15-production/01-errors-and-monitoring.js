QUIZ.register({
  "id": "15-production/01-errors-and-monitoring",
  "section": "15-production",
  "title": "Ошибки и мониторинг",
  "order": 1,
  "source": "../15-production/01-errors-and-monitoring.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что не ловит error boundary в React?",
      "options": [
        "Ошибку в рендере дочернего компонента",
        "Ошибку в обработчике `onClick`",
        "Ошибку в конструкторе класса-потомка",
        "Ошибку в lifecycle потомка"
      ],
      "answer": 1,
      "explain": "Обработчики событий и асинхронный код — вне фазы рендера."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "В мониторинге «Script error.» без стектрейса. Причина?",
      "options": [
        "Ошибка Sentry",
        "Скрипт с другого origin загружен без CORS (`crossorigin` + `Access-Control-Allow-Origin`)",
        "Нет sourcemaps",
        "Строгий режим"
      ],
      "answer": 1,
      "explain": "Браузер скрывает детали ошибок кросс-доменных скриптов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какие ответы разумно повторять автоматически?",
      "options": [
        "400 и 422",
        "401 и 403",
        "сетевые ошибки, 429 и 503 (для идемпотентных запросов)",
        "все"
      ],
      "answer": 2,
      "explain": "Повторять имеет смысл временные ошибки; 4xx от клиента повтор не исправит."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что должно быть в событии мониторинга?",
      "options": [
        "релиз и окружение",
        "маршрут и breadcrumbs",
        "email и телефон пользователя",
        "id пользователя и активные флаги",
        "пароль из формы для воспроизведения"
      ],
      "answer": [
        0,
        1,
        3
      ],
      "explain": "PII и секреты в мониторинг не отправлять."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Главный принцип постмортема?",
      "options": [
        "Найти виноватого",
        "Без поиска виноватых: системные причины и действия с владельцами",
        "Писать только для крупных инцидентов в прессе",
        "Не публиковать внутри компании"
      ],
      "answer": 1,
      "explain": "Иначе люди начнут скрывать проблемы."
    }
  ],
  "tasks": [
    {
      "title": "Обёртка над fetch с ApiError",
      "level": "senior",
      "prompt": "Реализуйте класс `ApiError extends Error` (поля `status`, `code`, `details`, геттер `retryable`: `status === 0 || 429 || >= 500`) и функцию `request(fetchFn, url, init)`: вызывает `fetchFn`; сетевая ошибка (`fetchFn` бросил) → `ApiError(0, \"NETWORK\", ...)` с `cause`; ответ `!ok` → тело `{ code, message, details }` (если JSON) → `ApiError(status, code ?? \"HTTP_\" + status, message ?? statusText, details)`; `204` → `null`; иначе — JSON. `AbortError` пробрасывать как есть.",
      "starter": "class ApiError extends Error {\n  // ваш код\n}\n\nasync function request(fetchFn, url, init) {\n  // ваш код\n}",
      "solution": "class ApiError extends Error {\n  constructor(status, code, message, details, options) {\n    super(message, options);\n    this.name = 'ApiError';\n    this.status = status;\n    this.code = code;\n    this.details = details;\n  }\n  get retryable() {\n    return this.status === 0 || this.status === 429 || this.status >= 500;\n  }\n}\n\nasync function request(fetchFn, url, init) {\n  let response;\n  try {\n    response = await fetchFn(url, init);\n  } catch (error) {\n    if (error?.name === 'AbortError') throw error;\n    throw new ApiError(0, 'NETWORK', 'Нет соединения', undefined, { cause: error });\n  }\n  if (!response.ok) {\n    let body = {};\n    try {\n      body = await response.json();\n    } catch {\n      // тело не JSON — используем statusText\n    }\n    throw new ApiError(response.status, body.code ?? `HTTP_${response.status}`, body.message ?? response.statusText, body.details);\n  }\n  return response.status === 204 ? null : response.json();\n}",
      "tests": [
        {
          "name": "успех",
          "code": "const res = (status, body, statusText = \"\") => ({ ok: status >= 200 && status < 300, status, statusText, json: async () => { if (typeof body !== \"object\" || body === null) throw new SyntaxError(\"not json\"); return body; } }); const r = await request(async () => res(200, { id: 1 }), \"/x\"); return r.id === 1;"
        },
        {
          "name": "204",
          "code": "const res = (status, body, statusText = \"\") => ({ ok: status >= 200 && status < 300, status, statusText, json: async () => { if (typeof body !== \"object\" || body === null) throw new SyntaxError(\"not json\"); return body; } }); return (await request(async () => res(204, null), \"/x\")) === null;"
        },
        {
          "name": "422 с деталями",
          "code": "const res = (status, body, statusText = \"\") => ({ ok: status >= 200 && status < 300, status, statusText, json: async () => { if (typeof body !== \"object\" || body === null) throw new SyntaxError(\"not json\"); return body; } }); try { await request(async () => res(422, { code: \"VALIDATION\", message: \"Ошибка\", details: { email: [\"занят\"] } }), \"/x\"); return false; } catch (e) { return e instanceof ApiError && e.status === 422 && e.code === \"VALIDATION\" && e.details.email[0] === \"занят\" && !e.retryable; }"
        },
        {
          "name": "500 не JSON",
          "code": "const res = (status, body, statusText = \"\") => ({ ok: status >= 200 && status < 300, status, statusText, json: async () => { if (typeof body !== \"object\" || body === null) throw new SyntaxError(\"not json\"); return body; } }); try { await request(async () => res(500, \"oops\", \"Internal Server Error\"), \"/x\"); return false; } catch (e) { return e.code === \"HTTP_500\" && e.message === \"Internal Server Error\" && e.retryable; }"
        },
        {
          "name": "сеть",
          "code": "const cause = new TypeError(\"Failed to fetch\"); try { await request(async () => { throw cause; }, \"/x\"); return false; } catch (e) { return e.status === 0 && e.code === \"NETWORK\" && e.cause === cause && e.retryable; }"
        },
        {
          "name": "abort пробрасывается",
          "code": "const abort = Object.assign(new Error(\"aborted\"), { name: \"AbortError\" }); try { await request(async () => { throw abort; }, \"/x\"); return false; } catch (e) { return e === abort; }"
        }
      ]
    }
  ]
});
