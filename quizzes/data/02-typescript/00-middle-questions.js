QUIZ.register({
  "id": "02-typescript/00-middle-questions",
  "section": "02-typescript",
  "title": "Middle-разминка: TypeScript",
  "order": 0.5,
  "source": "../02-typescript/00-middle-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `unknown` отличается от `any`?",
      "options": [
        "Ничем",
        "`unknown` требует сужения перед использованием",
        "`unknown` только для чисел",
        "`any` безопаснее"
      ],
      "answer": 1,
      "explain": "С `any` проверки отключены."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что может быть типом `never`?",
      "options": [
        "Пустая строка",
        "Значение, которого не может быть: функция, которая всегда бросает, исчерпанный union",
        "`null`",
        "`undefined`"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что возвращает `keyof { a: 1; b: 2 }`?",
      "options": [
        "`'a' | 'b'`",
        "`1 | 2`",
        "`string`",
        "`object`"
      ],
      "answer": 0,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `satisfies` отличается от аннотации типа `const x: T = ...`?",
      "options": [
        "Ничем",
        "Проверяет соответствие типу, сохраняя более точный выведенный тип",
        "Отключает проверки",
        "Работает только с классами"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где тип существует во время выполнения?",
      "options": [
        "В рантайме доступен через `typeof T`",
        "Нигде: типы стираются при компиляции — внешние данные нужно валидировать",
        "В JSON",
        "В `.d.ts` на клиенте"
      ],
      "answer": 1,
      "explain": "Поэтому для API-ответов используют zod/valibot."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой utility type делает все поля необязательными?",
      "options": [
        "`Required<T>`",
        "`Partial<T>`",
        "`Readonly<T>`",
        "`Pick<T, K>`"
      ],
      "answer": 1,
      "explain": "См. ответ в теории темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `interface` отличается от `type` в первую очередь?",
      "options": [
        "`interface` поддерживает declaration merging и `extends`; `type` описывает любые типы (union, кортежи, mapped)",
        "`type` быстрее",
        "`interface` нельзя экспортировать",
        "Ничем"
      ],
      "answer": 0,
      "explain": "См. ответ в теории темы."
    }
  ],
  "tasks": []
});
