QUIZ.register({
  "id": "01-javascript/00-middle-questions",
  "section": "01-javascript",
  "title": "Middle-разминка: JavaScript",
  "order": 0.5,
  "source": "../01-javascript/00-middle-questions.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "setTimeout(() => console.log(1));\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);",
      "options": [
        "`3 2 1`",
        "`1 2 3`",
        "`3 1 2`",
        "`2 3 1`"
      ],
      "answer": 0,
      "explain": "Синхронный код → микрозадачи (промисы) → макрозадачи (таймеры)."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));",
      "options": [
        "`0 1 2`",
        "`3 3 3`",
        "`undefined ×3`",
        "ошибка"
      ],
      "answer": 1,
      "explain": "`var` — одна переменная на функцию, к моменту таймеров цикл завершён. С `let` — `0 1 2`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `typeof null`?",
      "options": [
        "`'null'`",
        "`'object'`",
        "`'undefined'`",
        "ошибку"
      ],
      "answer": 1,
      "explain": "Историческая ошибка языка."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что выведет `0 || \"x\"` и `0 ?? \"x\"`?",
      "options": [
        "`x x`",
        "`x 0`",
        "`0 x`",
        "`0 0`"
      ],
      "answer": 1,
      "explain": "`||` срабатывает на любом falsy, `??` — только на null/undefined."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log(a);\nlet a = 1;",
      "options": [
        "`1`",
        "`undefined`",
        "ReferenceError",
        "`null`"
      ],
      "answer": 2,
      "explain": "TDZ: `let` до объявления недоступна."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой метод массива возвращает новый массив?",
      "options": [
        "`forEach`",
        "`map`",
        "`sort`",
        "`push`"
      ],
      "answer": 1,
      "explain": "`sort` и `push` мутируют, `forEach` возвращает undefined."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как глубоко скопировать объект с Date и Map?",
      "options": [
        "`{ ...obj }`",
        "`JSON.parse(JSON.stringify(obj))`",
        "`structuredClone(obj)`",
        "`Object.assign({}, obj)`"
      ],
      "answer": 2,
      "explain": "JSON теряет Date (станет строкой) и Map."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чему равен `this` в стрелочной функции?",
      "options": [
        "объекту, у которого вызвана",
        "`this` внешней области, где функция создана",
        "всегда `window`",
        "всегда `undefined`"
      ],
      "answer": 1,
      "explain": "У стрелочных функций нет своего `this`."
    }
  ],
  "tasks": []
});
