QUIZ.register({
  "id": "17-debugging-git-team/02-git",
  "section": "17-debugging-git-team",
  "title": "Git",
  "order": 2,
  "source": "../17-debugging-git-team/02-git.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как вернуть коммит, «потерянный» после `git reset --hard`?",
      "options": [
        "Никак",
        "`git reflog`, найти хэш и создать ветку на нём",
        "`git stash pop`",
        "`git revert`"
      ],
      "answer": 1,
      "explain": "Reflog хранит перемещения HEAD."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `push --force-with-lease` лучше `push --force`?",
      "options": [
        "Быстрее",
        "Не перезапишет удалённую ветку, если в ней есть коммиты, которых вы не видели",
        "Работает без сети",
        "Ничем"
      ],
      "answer": 1,
      "explain": "Защита от случайного удаления чужой работы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Во время `git rebase main` что означает «ours»?",
      "options": [
        "ваши коммиты",
        "ветка, на которую переносите (main)",
        "общий предок",
        "удалённая ветка"
      ],
      "answer": 1,
      "explain": "При rebase стороны меняются местами относительно merge."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Ошибочный коммит уже в общей ветке. Как отменить?",
      "options": [
        "`git reset --hard` + force push",
        "`git revert <hash>`",
        "Удалить репозиторий",
        "`git checkout`"
      ],
      "answer": 1,
      "explain": "Не переписывает опубликованную историю."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Закоммитили API-ключ и запушили. Что обязательно сделать?",
      "options": [
        "Удалить файл новым коммитом",
        "Ротировать (отозвать) ключ; очистка истории — дополнительно",
        "Сделать репозиторий приватным",
        "Ничего, если удалить быстро"
      ],
      "answer": 1,
      "explain": "Ключ мог быть скопирован ботами за секунды."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какая стратегия ветвления лучше всего сочетается с CI/CD и feature flags?",
      "options": [
        "GitFlow",
        "Trunk-based development",
        "Долгие feature-ветки",
        "Без веток"
      ],
      "answer": 1,
      "explain": "Короткие ветки и частые слияния, незавершённое — за флагами."
    }
  ],
  "tasks": [
    {
      "title": "Парсер Conventional Commits",
      "level": "middle",
      "prompt": "Реализуйте `parseCommit(message)` для первой строки вида `type(scope)!: description` (scope и `!` необязательны). Верните `{ type, scope, breaking, description }` (`scope` — `null`, если нет). `breaking` — `true`, если есть `!` или в теле сообщения есть строка, начинающаяся с `BREAKING CHANGE:`. Неверный формат — `null`. И `bumpFor(commits)` — `\"major\" | \"minor\" | \"patch\" | null` для массива сообщений: breaking → major, `feat` → minor, `fix`/`perf` → patch.",
      "starter": "function parseCommit(message) {\n  // ваш код\n}\n\nfunction bumpFor(commits) {\n  // ваш код\n}",
      "solution": "function parseCommit(message) {\n  const [header, ...body] = message.split('\\n');\n  const match = /^(\\w+)(?:\\(([^)]+)\\))?(!)?: (.+)$/.exec(header);\n  if (!match) return null;\n  const [, type, scope = null, bang, description] = match;\n  const breaking = Boolean(bang) || body.some((line) => line.startsWith('BREAKING CHANGE:'));\n  return { type, scope, breaking, description };\n}\n\nfunction bumpFor(commits) {\n  const parsed = commits.map(parseCommit).filter(Boolean);\n  if (parsed.some((c) => c.breaking)) return 'major';\n  if (parsed.some((c) => c.type === 'feat')) return 'minor';\n  if (parsed.some((c) => c.type === 'fix' || c.type === 'perf')) return 'patch';\n  return null;\n}",
      "tests": [
        {
          "name": "полный",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(parseCommit(\"feat(auth)!: passkeys\"), { type: \"feat\", scope: \"auth\", breaking: true, description: \"passkeys\" });"
        },
        {
          "name": "без scope",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(parseCommit(\"fix: off-by-one\"), { type: \"fix\", scope: null, breaking: false, description: \"off-by-one\" });"
        },
        {
          "name": "BREAKING CHANGE в теле",
          "code": "return parseCommit(\"refactor: api\\n\\nBREAKING CHANGE: удалён проп size\").breaking === true;"
        },
        {
          "name": "неверный формат",
          "code": "return parseCommit(\"поправил баг\") === null;"
        },
        {
          "name": "bump",
          "code": "return bumpFor([\"fix: a\", \"feat: b\"]) === \"minor\" && bumpFor([\"fix: a\"]) === \"patch\" && bumpFor([\"chore: a\", \"docs: b\"]) === null && bumpFor([\"feat!: x\"]) === \"major\";"
        }
      ]
    }
  ]
});
