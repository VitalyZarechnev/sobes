QUIZ.register({
  "id": "17-debugging-git-team/01-debugging",
  "section": "17-debugging-git-team",
  "title": "Отладка",
  "order": 1,
  "source": "../17-debugging-git-team/01-debugging.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как узнать, какой код меняет атрибут элемента на странице?",
      "options": [
        "Поиском по исходникам",
        "DOM breakpoint «Break on attribute modifications»",
        "Через Network",
        "Никак"
      ],
      "answer": 1,
      "explain": "Отладчик остановится в момент изменения со стеком вызовов."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое logpoint?",
      "options": [
        "console.log в коде",
        "Breakpoint, который пишет сообщение в консоль без остановки и без изменения кода",
        "Лог сервера",
        "Ошибка в консоли"
      ],
      "answer": 1,
      "explain": "Удобно на продакшене со sourcemaps."
    },
    {
      "type": "order",
      "level": "senior",
      "q": "Расположите шаги поиска утечки памяти",
      "items": [
        "Снять heap snapshot в исходном состоянии",
        "Повторить подозрительный сценарий несколько раз",
        "Снять второй snapshot и сравнить (Comparison)",
        "Изучить retainers прибавившихся объектов",
        "Исправить и повторить измерение"
      ],
      "explain": "Сравнение снимков показывает, что не освободилось."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Частые причины утечек памяти в SPA?",
      "options": [
        "обработчики на `window` без отписки",
        "незачищенные `setInterval`",
        "detached DOM-узлы в переменных",
        "использование `const`",
        "растущий кэш в Map без ограничения"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как проверить поведение сайта при недоступном CDN, не трогая сервер?",
      "options": [
        "Удалить файлы с CDN",
        "Network → Block request URL/domain",
        "Выключить Wi-Fi",
        "Никак"
      ],
      "answer": 1,
      "explain": "А local overrides позволяют подменить ответ."
    }
  ],
  "tasks": [
    {
      "title": "Бинарный поиск плохой версии (bisect)",
      "level": "middle",
      "prompt": "Коммиты пронумерованы `0..n-1`, коммит `0` точно хороший, `n-1` — плохой. После первого плохого все коммиты плохие. Дана функция `isBad(i)` (дорогая — сборка и тесты). Найдите первый плохой коммит за O(log n) вызовов.",
      "starter": "function firstBadCommit(n, isBad) {\n  // ваш код\n}",
      "solution": "function firstBadCommit(n, isBad) {\n  let good = 0; // известный хороший\n  let bad = n - 1; // известный плохой\n  while (bad - good > 1) {\n    const mid = Math.floor((good + bad) / 2);\n    if (isBad(mid)) bad = mid;\n    else good = mid;\n  }\n  return bad;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return firstBadCommit(100, (i) => i >= 37) === 37;"
        },
        {
          "name": "последний",
          "code": "return firstBadCommit(10, (i) => i >= 9) === 9;"
        },
        {
          "name": "сразу после хорошего",
          "code": "return firstBadCommit(10, (i) => i >= 1) === 1;"
        },
        {
          "name": "логарифм вызовов",
          "code": "let calls = 0; const r = firstBadCommit(1000000, (i) => { calls++; return i >= 123457; }); return r === 123457 && calls <= 21;"
        }
      ]
    }
  ]
});
