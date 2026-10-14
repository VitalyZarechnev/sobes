QUIZ.register({
  "id": "03-react/07-interview-questions",
  "section": "03-react",
  "title": "Вопросы и live-coding по React",
  "order": 7,
  "source": "../03-react/07-interview-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что произойдёт при setState в теле компонента (не в эффекте и не в обработчике)?",
      "options": [
        "Ничего",
        "Бесконечный цикл рендеров (React остановит с ошибкой)",
        "Обновится один раз",
        "Предупреждение"
      ],
      "answer": 1,
      "explain": "Исключение — обновление во время рендера с условием (паттерн «хранить предыдущий проп»)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как отменить устаревший запрос при быстрой смене id в useEffect?",
      "options": [
        "Не нужно",
        "Флаг ignore или AbortController в функции очистки эффекта",
        "setTimeout",
        "useMemo"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как сбросить состояние компонента при смене пользователя?",
      "options": [
        "useEffect с ручным сбросом всех полей",
        "Передать `key={userId}` — React пересоздаст компонент",
        "forceUpdate",
        "Перезагрузить страницу"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `{count && <Badge />}` при count = 0 рисует «0»?",
      "options": [
        "Баг React",
        "`&&` возвращает 0, а числа React рендерит",
        "Badge возвращает 0",
        "Так задумано JSX"
      ],
      "answer": 1,
      "explain": "Используйте `count > 0 &&` или тернарный оператор."
    }
  ],
  "tasks": [
    {
      "title": "Поиск без гонок (логика useSearch)",
      "level": "senior",
      "prompt": "Реализуйте без React `createSearch(fetcher, onResult)` → `search(query)`: каждый вызов запускает `fetcher(query, signal)`; предыдущий незавершённый запрос отменяется через `AbortController`; `onResult(query, data)` вызывается только для **последнего** запроса. Ошибки отменённых запросов (`AbortError`) игнорируются, остальные пробрасываются из промиса `search`.",
      "starter": "function createSearch(fetcher, onResult) {\n  // ваш код\n}",
      "solution": "function createSearch(fetcher, onResult) {\n  let controller = null;\n  return async (query) => {\n    controller?.abort();\n    const current = new AbortController();\n    controller = current;\n    try {\n      const data = await fetcher(query, current.signal);\n      if (controller === current) onResult(query, data);\n    } catch (error) {\n      if (error?.name === 'AbortError' || current.signal.aborted) return;\n      throw error;\n    }\n  };\n}",
      "tests": [
        {
          "name": "только последний",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const got = []; const fetcher = async (q) => { await sleep(q === \"re\" ? 40 : 5); return q.toUpperCase(); }; const search = createSearch(fetcher, (q, d) => got.push(d)); const a = search(\"re\"); const b = search(\"react\"); await Promise.all([a, b]); return got.join() === \"REACT\";"
        },
        {
          "name": "отмена через signal",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let aborted = false; const fetcher = (q, signal) => new Promise((res, rej) => { signal.addEventListener(\"abort\", () => { aborted = true; rej(Object.assign(new Error(\"a\"), { name: \"AbortError\" })); }); setTimeout(() => res(q), 30); }); const search = createSearch(fetcher, () => {}); const a = search(\"a\"); search(\"b\"); await a; return aborted;"
        },
        {
          "name": "ошибки пробрасываются",
          "code": "const search = createSearch(async () => { throw new Error(\"500\"); }, () => {}); try { await search(\"x\"); return false; } catch (e) { return e.message === \"500\"; }"
        }
      ]
    }
  ]
});
