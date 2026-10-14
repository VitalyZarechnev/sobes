QUIZ.register({
  "id": "03-react/04-performance",
  "section": "03-react",
  "title": "Производительность React",
  "order": 4,
  "source": "../03-react/04-performance.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает React Compiler?",
      "options": [
        "Компилирует в WebAssembly",
        "Автоматически мемоизирует компоненты и значения на этапе сборки",
        "Удаляет неиспользуемые компоненты",
        "Ускоряет SSR"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "`React.memo(Child)` не помогает — Child перерендеривается. Вероятная причина?",
      "options": [
        "memo не работает",
        "Родитель передаёт новый объект/функцию в пропсах каждый рендер",
        "Child использует useState",
        "Нужен key"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `useTransition` помогает при фильтрации большого списка?",
      "options": [
        "Ускоряет вычисления",
        "Помечает обновление как несрочное: ввод остаётся отзывчивым, тяжёлый рендер прерываем",
        "Кэширует список",
        "Переносит в воркер"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `useDeferredValue` отличается от `useTransition`?",
      "options": [
        "Ничем",
        "Откладывает значение (например, из пропсов), когда нет доступа к сеттеру; transition оборачивает само обновление",
        "useDeferredValue для сети",
        "useTransition устарел"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Список из 10 000 строк тормозит. Первое решение?",
      "options": [
        "memo для каждой строки",
        "Виртуализация (TanStack Virtual, react-window)",
        "useCallback",
        "Переписать на Vue"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что помогает найти причину лишних рендеров?",
      "options": [
        "React DevTools Profiler («why did this render»)",
        "Highlight updates в DevTools",
        "Performance-панель браузера",
        "console.log в каждом компоненте как основной метод",
        "React Scan"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
