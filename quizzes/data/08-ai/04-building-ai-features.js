QUIZ.register({
  "id": "08-ai/04-building-ai-features",
  "section": "08-ai",
  "title": "AI-фичи во фронтенде",
  "order": 4,
  "source": "../08-ai/04-building-ai-features.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как показывать ответ LLM в интерфейсе без долгого ожидания?",
      "options": [
        "Ждать полный ответ",
        "Стримить токены (SSE/ReadableStream) и рендерить по мере поступления",
        "Показывать спиннер 30 секунд",
        "Кэшировать"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему нельзя вызывать API модели напрямую из браузера с ключом?",
      "options": [
        "Медленно",
        "Ключ окажется в клиентском коде — его украдут; нужен серверный прокси/BFF с лимитами",
        "CORS",
        "Можно"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как безопасно рендерить markdown из ответа модели?",
      "options": [
        "innerHTML",
        "Рендер с санитизацией (без сырого HTML или через DOMPurify), безопасные ссылки",
        "eval",
        "Не рендерить"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое structured output / tool calling?",
      "options": [
        "Свободный текст",
        "Модель возвращает данные по JSON-схеме или вызов функции с аргументами — их можно валидировать и выполнять",
        "Формат картинок",
        "Стриминг"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Сборка стрима SSE",
      "level": "senior",
      "prompt": "Реализуйте `createSseParser(onEvent)` → `push(chunk)`: принимает куски текста потока Server-Sent Events (куски режутся в произвольных местах), разбирает события, разделённые пустой строкой (`\\n\\n`), и для каждого вызывает `onEvent({ event, data })` (`event` по умолчанию `\"message\"`, несколько строк `data:` склеиваются через `\\n`). Строки, начинающиеся с `:`, — комментарии.",
      "starter": "function createSseParser(onEvent) {\n  // ваш код\n}",
      "solution": "function createSseParser(onEvent) {\n  let buffer = '';\n  return (chunk) => {\n    buffer += chunk;\n    let index;\n    while ((index = buffer.indexOf('\\n\\n')) !== -1) {\n      const raw = buffer.slice(0, index);\n      buffer = buffer.slice(index + 2);\n      let event = 'message';\n      const data = [];\n      for (const line of raw.split('\\n')) {\n        if (line.startsWith(':') || line === '') continue;\n        const colon = line.indexOf(':');\n        const field = colon === -1 ? line : line.slice(0, colon);\n        const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');\n        if (field === 'event') event = value;\n        else if (field === 'data') data.push(value);\n      }\n      if (data.length > 0) onEvent({ event, data: data.join('\\n') });\n    }\n  };\n}",
      "tests": [
        {
          "name": "куски в произвольных местах",
          "code": "const got = []; const push = createSseParser((e) => got.push(e.data)); push(\"data: При\"); push(\"вет\\n\\nda\"); push(\"ta: мир\\n\\n\"); return got.join(\"|\") === \"Привет|мир\";"
        },
        {
          "name": "event и многострочные data",
          "code": "const got = []; const push = createSseParser((e) => got.push(e)); push(\"event: done\\ndata: a\\ndata: b\\n\\n\"); return got[0].event === \"done\" && got[0].data === \"a\\nb\";"
        },
        {
          "name": "комментарии",
          "code": "const got = []; const push = createSseParser((e) => got.push(e.data)); push(\": ping\\n\\ndata: x\\n\\n\"); return got.join() === \"x\";"
        }
      ]
    }
  ]
});
