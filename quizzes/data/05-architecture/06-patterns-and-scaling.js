QUIZ.register({
  "id": "05-architecture/06-patterns-and-scaling",
  "section": "05-architecture",
  "title": "Паттерны и масштабирование",
  "order": 6,
  "source": "../05-architecture/06-patterns-and-scaling.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой паттерн у `addEventListener`?",
      "options": [
        "Фабрика",
        "Наблюдатель",
        "Адаптер",
        "Синглтон"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой паттерн у функции, превращающей ответ API (snake_case DTO) в доменную модель?",
      "options": [
        "Адаптер / маппер",
        "Декоратор",
        "Стратегия",
        "Команда"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой паттерн для undo/redo?",
      "options": [
        "Наблюдатель",
        "Команда (с обратной операцией)",
        "Фабрика",
        "Прокси"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Набор взаимозаменяемых алгоритмов валидации или расчёта доставки — это…",
      "options": [
        "Стратегия",
        "Синглтон",
        "Компоновщик",
        "Мост"
      ],
      "answer": 0,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Undo/redo на паттерне Команда",
      "level": "senior",
      "prompt": "Реализуйте `createHistory()` → `{ execute(command), undo(), redo(), canUndo, canRedo }`. Команда — объект `{ do(), undo() }`. `execute` выполняет `do()` и кладёт в стек отмены (стек повтора очищается). `undo/redo` возвращают `false`, если нечего отменять/повторять, иначе `true`.",
      "starter": "function createHistory() {\n  // ваш код\n}",
      "solution": "function createHistory() {\n  const undoStack = [];\n  const redoStack = [];\n  return {\n    execute(command) {\n      command.do();\n      undoStack.push(command);\n      redoStack.length = 0;\n    },\n    undo() {\n      const command = undoStack.pop();\n      if (!command) return false;\n      command.undo();\n      redoStack.push(command);\n      return true;\n    },\n    redo() {\n      const command = redoStack.pop();\n      if (!command) return false;\n      command.do();\n      undoStack.push(command);\n      return true;\n    },\n    get canUndo() {\n      return undoStack.length > 0;\n    },\n    get canRedo() {\n      return redoStack.length > 0;\n    },\n  };\n}",
      "tests": [
        {
          "name": "undo/redo",
          "code": "let v = 0; const add = (n) => ({ do: () => { v += n; }, undo: () => { v -= n; } }); const h = createHistory(); h.execute(add(5)); h.execute(add(3)); h.undo(); const a = v; h.redo(); return a === 5 && v === 8;"
        },
        {
          "name": "новое действие очищает redo",
          "code": "let v = 0; const add = (n) => ({ do: () => { v += n; }, undo: () => { v -= n; } }); const h = createHistory(); h.execute(add(1)); h.undo(); h.execute(add(2)); return !h.canRedo && v === 2;"
        },
        {
          "name": "пустые стеки",
          "code": "const h = createHistory(); return h.undo() === false && h.redo() === false && !h.canUndo;"
        }
      ]
    }
  ]
});
