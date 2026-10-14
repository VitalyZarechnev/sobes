QUIZ.register({
  "id": "16-forms-i18n-auth/03-auth",
  "section": "16-forms-i18n-auth",
  "title": "Аутентификация и авторизация",
  "order": 3,
  "source": "../16-forms-i18n-auth/03-auth.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Где реально проверяется авторизация?",
      "options": [
        "В роутере фронтенда",
        "На сервере для каждого запроса",
        "В localStorage",
        "В CSS"
      ],
      "answer": 1,
      "explain": "Фронтенд только скрывает UI и обрабатывает 403."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие атрибуты cookie сессии обязательны?",
      "options": [
        "`HttpOnly`",
        "`Secure`",
        "`SameSite=Lax` или `Strict`",
        "`Domain=.example.com` всегда",
        "`Max-Age=31536000`"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Широкий `Domain` расширяет доступ поддоменам; `__Host-` префикс его запрещает."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "От чего защищает PKCE?",
      "options": [
        "От XSS",
        "От использования перехваченного authorization code без code_verifier",
        "От DDoS",
        "От CSRF на всех запросах"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое BFF в контексте auth?",
      "options": [
        "Библиотека форм",
        "Свой серверный слой, который хранит токены и выдаёт браузеру только HttpOnly cookie сессии",
        "Вид JWT",
        "Протокол SSO"
      ],
      "answer": 1,
      "explain": "Токены не попадают в JS."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "5 параллельных запросов получили 401. Как правильно обновить сессию?",
      "options": [
        "Каждый запрос вызывает refresh",
        "Одно общее обновление (общий промис), остальные ждут и повторяют запрос",
        "Выйти из системы",
        "Повторять запрос в цикле"
      ],
      "answer": 1,
      "explain": "При ротации refresh-токенов параллельные обновления ещё и отзовут сессию как подозрительную."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Next.js: достаточно ли проверить сессию в `proxy.ts` (middleware)?",
      "options": [
        "Да",
        "Нет: это оптимистичная проверка для редиректов, данные защищает проверка в DAL/Server Actions",
        "Да, если есть HTTPS",
        "Только для API"
      ],
      "answer": 1,
      "explain": "Server Actions и Route Handlers — публичные эндпоинты."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем passkeys лучше паролей?",
      "options": [
        "Короче",
        "Устойчивы к фишингу и утечкам: ключ привязан к домену и устройству",
        "Не требуют HTTPS",
        "Работают без браузера"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Одно обновление сессии на параллельные 401",
      "level": "senior",
      "prompt": "Реализуйте `createApiFetch(fetchFn, refreshSession)` → `apiFetch(url)`. `fetchFn(url)` возвращает `{ status }`. При `401` нужно обновить сессию и повторить запрос **один раз**. Параллельные запросы, получившие 401, должны дождаться **одного** вызова `refreshSession()`. Если обновление упало — `apiFetch` отклоняется этой ошибкой. После завершения обновления следующий 401 запускает новое обновление.",
      "starter": "function createApiFetch(fetchFn, refreshSession) {\n  // ваш код\n}",
      "solution": "function createApiFetch(fetchFn, refreshSession) {\n  let refreshing = null;\n  return async (url) => {\n    const response = await fetchFn(url);\n    if (response.status !== 401) return response;\n    refreshing ??= refreshSession().finally(() => {\n      refreshing = null;\n    });\n    await refreshing;\n    return fetchFn(url);\n  };\n}",
      "tests": [
        {
          "name": "одно обновление",
          "code": "let valid = false, refreshes = 0; const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fetchFn = async () => ({ status: valid ? 200 : 401 }); const refresh = async () => { refreshes++; await sleep(10); valid = true; }; const api = createApiFetch(fetchFn, refresh); const r = await Promise.all([api(\"/a\"), api(\"/b\"), api(\"/c\")]); return refreshes === 1 && r.every((x) => x.status === 200);"
        },
        {
          "name": "ошибка обновления",
          "code": "const api = createApiFetch(async () => ({ status: 401 }), async () => { throw new Error(\"expired\"); }); try { await api(\"/a\"); return false; } catch (e) { return e.message === \"expired\"; }"
        },
        {
          "name": "повторное обновление позже",
          "code": "let refreshes = 0; let valid = false; const api = createApiFetch(async () => ({ status: valid ? 200 : 401 }), async () => { refreshes++; valid = true; }); await api(\"/a\"); valid = false; await api(\"/b\"); return refreshes === 2;"
        },
        {
          "name": "без 401 нет обновления",
          "code": "let refreshes = 0; const api = createApiFetch(async () => ({ status: 200 }), async () => { refreshes++; }); await api(\"/a\"); return refreshes === 0;"
        }
      ]
    },
    {
      "title": "Разбор Set-Cookie и проверка безопасности",
      "level": "middle",
      "prompt": "Реализуйте `auditCookie(header)` для строки `Set-Cookie` сессии. Верните массив проблем (строки-коды, в этом порядке): `\"NO_HTTPONLY\"`, `\"NO_SECURE\"`, `\"SAMESITE_NONE_OR_MISSING\"` (атрибута нет или `None`), `\"HOST_PREFIX_WITH_DOMAIN\"` (имя начинается с `__Host-`, но есть `Domain`). Атрибуты регистронезависимы.",
      "starter": "function auditCookie(header) {\n  // ваш код\n}",
      "solution": "function auditCookie(header) {\n  const [nameValue, ...attrs] = header.split(';').map((s) => s.trim());\n  const name = nameValue.split('=')[0];\n  const map = new Map(attrs.map((a) => {\n    const [k, ...v] = a.split('=');\n    return [k.trim().toLowerCase(), v.join('=').trim()];\n  }));\n  const problems = [];\n  if (!map.has('httponly')) problems.push('NO_HTTPONLY');\n  if (!map.has('secure')) problems.push('NO_SECURE');\n  const sameSite = map.get('samesite')?.toLowerCase();\n  if (!sameSite || sameSite === 'none') problems.push('SAMESITE_NONE_OR_MISSING');\n  if (name.startsWith('__Host-') && map.has('domain')) problems.push('HOST_PREFIX_WITH_DOMAIN');\n  return problems;\n}",
      "tests": [
        {
          "name": "хорошая cookie",
          "code": "return auditCookie(\"__Host-sid=abc; Path=/; HttpOnly; Secure; SameSite=Lax\").length === 0;"
        },
        {
          "name": "всё плохо",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(auditCookie(\"sid=abc; SameSite=None\"), [\"NO_HTTPONLY\", \"NO_SECURE\", \"SAMESITE_NONE_OR_MISSING\"]);"
        },
        {
          "name": "регистр",
          "code": "return auditCookie(\"sid=1; httponly; SECURE; samesite=strict\").length === 0;"
        },
        {
          "name": "__Host- с Domain",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(auditCookie(\"__Host-sid=1; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Lax\"), [\"HOST_PREFIX_WITH_DOMAIN\"]);"
        }
      ]
    }
  ]
});
