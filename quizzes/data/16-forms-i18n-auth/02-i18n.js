QUIZ.register({
  "id": "16-forms-i18n-auth/02-i18n",
  "section": "16-forms-i18n-auth",
  "title": "Интернационализация",
  "order": 2,
  "source": "../16-forms-i18n-auth/02-i18n.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что вернёт код?",
      "code": "const pr = new Intl.PluralRules('ru');\nconsole.log([1, 2, 5, 11, 21, 22].map((n) => pr.select(n)).join());",
      "options": [
        "`one,few,many,many,one,few`",
        "`one,other,other,other,one,other`",
        "`one,few,many,one,one,few`",
        "`one,two,many,many,one,two`"
      ],
      "answer": 0,
      "explain": "11 — many (исключение 11–14), 21 — one, 22 — few."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Пользователь в Москве вводит дату рождения 1990-05-01, она сохраняется как `new Date(\"1990-05-01\")` и показывается пользователю в Нью-Йорке. Что увидит пользователь?",
      "options": [
        "1 мая",
        "30 апреля",
        "2 мая",
        "Ошибку"
      ],
      "answer": 1,
      "explain": "`new Date(\"1990-05-01\")` — полночь UTC, в Нью-Йорке это вечер 30 апреля. Даты без времени храните как `YYYY-MM-DD` или `Temporal.PlainDate`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вместо `margin-left` для поддержки RTL?",
      "options": [
        "`margin-right`",
        "`margin-inline-start`",
        "`margin-block-start`",
        "`float: left`"
      ],
      "answer": 1,
      "explain": "Логическое свойство зависит от направления текста."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему в качестве ключа перевода не стоит использовать сам текст?",
      "options": [
        "Медленно",
        "Изменение исходного текста ломает все переводы и связь с контекстом",
        "Нельзя с кириллицей",
        "Так требует ICU"
      ],
      "answer": 1,
      "explain": "Ключи по неймспейсам стабильны."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем псевдолокализация?",
      "options": [
        "Для SEO",
        "Найти захардкоженные строки и вёрстку, ломающуюся на длинных текстах и акцентированных символах",
        "Для шифрования",
        "Чтобы сэкономить на переводчиках"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Время на сервере форматируется в UTC, на клиенте — в местном поясе. Что произойдёт при SSR?",
      "options": [
        "Ничего",
        "Hydration mismatch: разный текст на сервере и клиенте",
        "Ошибка сборки",
        "Время округлится"
      ],
      "answer": 1,
      "explain": "Передавайте часовой пояс пользователя на сервер или форматируйте только на клиенте."
    }
  ],
  "tasks": [
    {
      "title": "Плюрализация для русского",
      "level": "middle",
      "prompt": "Реализуйте `pluralize(count, forms, locale = \"ru\")`, где `forms` — объект `{ one, few, many, other }` со строками, содержащими `#` (подставляется число, отформатированное `Intl.NumberFormat(locale)`). Категорию выбирайте через `Intl.PluralRules`. Если формы для категории нет — используйте `other`.\n\n`pluralize(5, { one: \"# товар\", few: \"# товара\", many: \"# товаров\", other: \"# товара\" })` → `\"5 товаров\"`",
      "starter": "function pluralize(count, forms, locale = \"ru\") {\n  // ваш код\n}",
      "solution": "function pluralize(count, forms, locale = 'ru') {\n  const category = new Intl.PluralRules(locale).select(count);\n  const template = forms[category] ?? forms.other;\n  return template.replaceAll('#', new Intl.NumberFormat(locale).format(count));\n}",
      "tests": [
        {
          "name": "формы",
          "code": "const f = { one: \"# товар\", few: \"# товара\", many: \"# товаров\", other: \"# товара\" }; return [1, 2, 5, 11, 21, 22].map((n) => pluralize(n, f)).join(\"|\") === \"1 товар|2 товара|5 товаров|11 товаров|21 товар|22 товара\";"
        },
        {
          "name": "дробные → other",
          "code": "return pluralize(1.5, { one: \"# час\", few: \"# часа\", many: \"# часов\", other: \"# часа\" }) === \"1,5 часа\";"
        },
        {
          "name": "английский",
          "code": "return pluralize(1, { one: \"# item\", other: \"# items\" }, \"en\") === \"1 item\" && pluralize(3, { one: \"# item\", other: \"# items\" }, \"en\") === \"3 items\";"
        },
        {
          "name": "разделитель тысяч",
          "code": "return /^1\\s000 товаров$/u.test(pluralize(1000, { one: \"# товар\", few: \"# товара\", many: \"# товаров\", other: \"# товара\" }));"
        }
      ]
    },
    {
      "title": "Относительное время",
      "level": "senior",
      "prompt": "Реализуйте `timeAgo(date, now, locale = \"ru\")` через `Intl.RelativeTimeFormat` с `numeric: \"auto\"`: выберите наибольшую единицу из `year (365 дн), month (30 дн), week, day, hour, minute, second`, для которой `|diff| >= 1` единицы, округлите `Math.round`. Прошлое — отрицательные значения. `date` и `now` — `Date`.",
      "starter": "function timeAgo(date, now, locale = \"ru\") {\n  // ваш код\n}",
      "solution": "function timeAgo(date, now, locale = 'ru') {\n  const units = [\n    ['year', 365 * 86400],\n    ['month', 30 * 86400],\n    ['week', 7 * 86400],\n    ['day', 86400],\n    ['hour', 3600],\n    ['minute', 60],\n    ['second', 1],\n  ];\n  const diffSeconds = (date.getTime() - now.getTime()) / 1000;\n  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });\n  for (const [unit, seconds] of units) {\n    if (Math.abs(diffSeconds) >= seconds || unit === 'second') {\n      return rtf.format(Math.round(diffSeconds / seconds), unit);\n    }\n  }\n}",
      "tests": [
        {
          "name": "вчера",
          "code": "const now = new Date(\"2026-10-14T12:00:00Z\"); return timeAgo(new Date(\"2026-10-13T12:00:00Z\"), now) === \"вчера\";"
        },
        {
          "name": "3 часа назад",
          "code": "const now = new Date(\"2026-10-14T12:00:00Z\"); return timeAgo(new Date(\"2026-10-14T09:00:00Z\"), now) === \"3 часа назад\";"
        },
        {
          "name": "будущее",
          "code": "const now = new Date(\"2026-10-14T12:00:00Z\"); return timeAgo(new Date(\"2026-10-28T12:00:00Z\"), now) === \"через 2 недели\";"
        },
        {
          "name": "сейчас",
          "code": "const now = new Date(\"2026-10-14T12:00:00Z\"); return timeAgo(now, now) === \"сейчас\";"
        }
      ]
    }
  ]
});
