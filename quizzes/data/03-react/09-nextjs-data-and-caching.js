QUIZ.register({
  "id": "03-react/09-nextjs-data-and-caching",
  "section": "03-react",
  "title": "Next.js: данные, кэш, мутации",
  "order": 9,
  "source": "../03-react/09-nextjs-data-and-caching.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Два независимых `await` подряд в Server Component. Что это?",
      "code": "const artist = await getArtist(id);\nconst albums = await getAlbums(id);",
      "options": [
        "Параллельные запросы",
        "Водопад: второй запрос стартует после первого",
        "Ошибка компиляции",
        "Next.js распараллелит сам"
      ],
      "answer": 1,
      "explain": "Используйте `Promise.all` или стартуйте запросы до await."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какова область действия `React.cache` на сервере?",
      "options": [
        "Весь процесс Node.js",
        "Один серверный запрос (рендер)",
        "Все пользователи на час",
        "Браузер"
      ],
      "answer": 1,
      "explain": "Межзапросный кэш — `use cache`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "В модели Cache Components компонент читает `cookies()` без Suspense-границы. Что произойдёт?",
      "options": [
        "Весь маршрут молча станет динамическим",
        "Next покажет insight «blocking route» с вариантами: Suspense, кэш или сдвиг доступа",
        "cookies вернут пустое значение",
        "Ошибка в продакшене"
      ],
      "answer": 1,
      "explain": "Молчаливый переход всего маршрута в динамику — поведение предыдущей модели."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Пользователь создал пост и должен сразу увидеть его в списке. Что вызвать в Server Action?",
      "options": [
        "`revalidateTag(\"posts\", \"max\")`",
        "`updateTag(\"posts\")`",
        "`refresh()`",
        "ничего"
      ],
      "answer": 1,
      "explain": "`updateTag` немедленно истекает кэш (read-your-own-writes); `revalidateTag` отдаст старое и обновит в фоне."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Вебхук CMS сообщает об изменении статей. Где и что вызвать?",
      "options": [
        "`updateTag` в Route Handler",
        "`revalidateTag(\"posts\", \"max\")` в Route Handler",
        "`refresh()` в Client Component",
        "Пересобрать проект"
      ],
      "answer": 1,
      "explain": "`updateTag` доступен только в Server Actions."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что входит в ключ кэша `use cache`?",
      "options": [
        "Только имя функции",
        "Аргументы и значения, захваченные из замыкания (плюс идентификатор функции и сборки)",
        "URL страницы",
        "Cookies пользователя автоматически"
      ],
      "answer": 1,
      "explain": "Runtime-данные внутри `use cache` читать нельзя — передавайте их аргументами."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что верно про Server Actions?",
      "options": [
        "Это публичные POST-эндпоинты — нужна проверка сессии внутри",
        "Клиент выполняет их последовательно — не годятся для чтения данных",
        "Формы с ними работают до гидратации",
        "Проверки в proxy.ts достаточно для безопасности",
        "Ответ может содержать обновлённый RSC-payload"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Proxy — оптимистичная проверка для редиректов."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Next.js 15 без Cache Components: кэшируется ли `fetch` по умолчанию?",
      "options": [
        "Да, как в 14",
        "Нет, с 15 по умолчанию не кэшируется",
        "Только GET в Route Handlers",
        "Только в production"
      ],
      "answer": 1,
      "explain": "В 14 кэшировался — частая путаница."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Next.js развёрнут в 4 контейнерах за балансировщиком. После `revalidateTag` часть пользователей видит старые данные. Почему?",
      "options": [
        "Ошибка CDN",
        "Кэш локален для каждого инстанса — нужен общий cache handler (например, Redis)",
        "Нужен static export",
        "Так задумано"
      ],
      "answer": 1,
      "explain": "Для self-hosting нескольких инстансов также синхронизируют ключ шифрования Server Actions и build ID."
    }
  ],
  "tasks": [
    {
      "title": "Решение кэша по профилю cacheLife",
      "level": "senior",
      "prompt": "Смоделируйте серверную сторону профиля `cacheLife`: `cacheDecision(ageSeconds, { revalidate, expire })` → `\"hit\"` (возраст < revalidate — отдать из кэша), `\"stale-while-revalidate\"` (revalidate ≤ возраст < expire — отдать старое и обновить в фоне), `\"miss\"` (возраст ≥ expire — ждать свежее). `expire` может быть `Infinity`. И `isShortLived({ revalidate, expire })` — `true`, если `revalidate === 0` или `expire < 300` (такой кэш не попадает в prerender).",
      "starter": "function cacheDecision(ageSeconds, { revalidate, expire }) {\n  // ваш код\n}\n\nfunction isShortLived({ revalidate, expire }) {\n  // ваш код\n}",
      "solution": "function cacheDecision(ageSeconds, { revalidate, expire }) {\n  if (ageSeconds < revalidate) return 'hit';\n  if (ageSeconds < expire) return 'stale-while-revalidate';\n  return 'miss';\n}\n\nfunction isShortLived({ revalidate, expire }) {\n  return revalidate === 0 || expire < 300;\n}",
      "tests": [
        {
          "name": "hours: свежий",
          "code": "return cacheDecision(600, { revalidate: 3600, expire: 86400 }) === \"hit\";"
        },
        {
          "name": "hours: устарел",
          "code": "return cacheDecision(7200, { revalidate: 3600, expire: 86400 }) === \"stale-while-revalidate\";"
        },
        {
          "name": "hours: истёк",
          "code": "return cacheDecision(90000, { revalidate: 3600, expire: 86400 }) === \"miss\";"
        },
        {
          "name": "default: never expire",
          "code": "return cacheDecision(1e9, { revalidate: 900, expire: Infinity }) === \"stale-while-revalidate\";"
        },
        {
          "name": "короткий кэш",
          "code": "return isShortLived({ revalidate: 1, expire: 60 }) && isShortLived({ revalidate: 0, expire: 3600 }) && !isShortLived({ revalidate: 3600, expire: 86400 });"
        }
      ],
      "notes": "Профиль `seconds` (revalidate 1s, expire 60s) — «короткий»: такой кэш становится динамической дырой в static shell."
    }
  ]
});
