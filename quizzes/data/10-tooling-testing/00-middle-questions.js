QUIZ.register({
  "id": "10-tooling-testing/00-middle-questions",
  "section": "10-tooling-testing",
  "title": "Middle-разминка: инструменты, git, тесты",
  "order": 0.5,
  "source": "../10-tooling-testing/00-middle-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какие версии допускает диапазон `^1.4.2`?",
      "options": [
        "только 1.4.2",
        "≥1.4.2 и <1.5.0",
        "≥1.4.2 и <2.0.0",
        "любые"
      ],
      "answer": 2,
      "explain": "Каретка разрешает minor и patch. Тильда `~` — только patch."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что из этого добавляется полифилом, а не транспиляцией?",
      "options": [
        "оператор `?.`",
        "стрелочные функции",
        "`Array.prototype.findLast`",
        "JSX"
      ],
      "answer": 2,
      "explain": "Синтаксис переписывается транспилятором, отсутствующие API добавляются полифилами."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Коммит с ошибкой уже в общей ветке `main`. Как его отменить?",
      "options": [
        "`git reset --hard HEAD~1` и `push --force`",
        "`git revert <hash>`",
        "`git stash`",
        "удалить ветку"
      ],
      "answer": 1,
      "explain": "Revert создаёт новый коммит и не переписывает общую историю."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что нужно коммитить в репозиторий?",
      "options": [
        "`node_modules`",
        "`dist`",
        "`package-lock.json` / `pnpm-lock.yaml`",
        "`.env` с ключами"
      ],
      "answer": 2,
      "explain": "Lock-файл обеспечивает воспроизводимую установку."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Что делает сборщик для продакшена?",
      "options": [
        "минификация",
        "tree shaking",
        "хэши в именах файлов",
        "проверка типов TypeScript",
        "разбиение на чанки"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Проверку типов делает `tsc`; трансформеры (esbuild, SWC, Oxc) только удаляют типы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `git rebase` опасен?",
      "options": [
        "удаляет файлы",
        "переписывает хэши коммитов — нельзя применять к ветке, с которой работают другие",
        "не работает с конфликтами",
        "ничем"
      ],
      "answer": 1,
      "explain": "После rebase общей ветки у коллег история разойдётся."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой тест проверит сценарий «войти → добавить товар → оплатить» в реальном браузере?",
      "options": [
        "unit",
        "интеграционный компонентный",
        "e2e",
        "snapshot"
      ],
      "answer": 2,
      "explain": "E2E проходит сценарий через всё приложение."
    }
  ],
  "tasks": []
});
