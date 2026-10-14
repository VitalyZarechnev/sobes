QUIZ.register({
  "id": "06-web-platform/06-security",
  "section": "06-web-platform",
  "title": "Безопасность фронтенда",
  "order": 6,
  "source": "../06-web-platform/06-security.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что опаснее с точки зрения XSS?",
      "options": [
        "`textContent = userInput`",
        "`innerHTML = userInput`",
        "`setAttribute(\"title\", userInput)`",
        "`createTextNode(userInput)`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает CSP со `strict-dynamic` и nonce?",
      "options": [
        "Запрещает все скрипты",
        "Разрешает только скрипты с правильным nonce и загруженные ими — инъекции без nonce не выполнятся",
        "Шифрует трафик",
        "Отключает cookies"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Trusted Types?",
      "options": [
        "Типы TS",
        "Браузерный механизм: опасные DOM-синки (`innerHTML`) принимают только объекты, созданные политиками санитизации",
        "Подпись скриптов",
        "CORS-режим"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как защититься от clickjacking?",
      "options": [
        "CORS",
        "`Content-Security-Policy: frame-ancestors 'none'` (или X-Frame-Options)",
        "HttpOnly",
        "SRI"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое prototype pollution?",
      "options": [
        "Утечка памяти",
        "Запись в `Object.prototype` через ключи `__proto__`/`constructor` при небезопасном merge — меняет поведение всех объектов",
        "Ошибка наследования",
        "Атака на CSS"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем `rel=\"noopener\"` у ссылок с `target=\"_blank\"`?",
      "options": [
        "Для SEO",
        "Новая вкладка не получает доступ к `window.opener` (tabnabbing); современные браузеры ставят его по умолчанию",
        "Ускоряет загрузку",
        "Для доступности"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Экранирование HTML",
      "level": "middle",
      "prompt": "Реализуйте `escapeHtml(str)`: заменяет `& < > \" '` на `&amp; &lt; &gt; &quot; &#39;`. И `safeHref(url)` — возвращает URL, если протокол `http:`, `https:` или `mailto:` (или URL относительный, начинается с `/` но не `//`), иначе `\"#\"` (защита от `javascript:`).",
      "starter": "function escapeHtml(str) {}\nfunction safeHref(url) {}",
      "solution": "function escapeHtml(str) {\n  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' };\n  return String(str).replace(/[&<>\"']/g, (ch) => map[ch]);\n}\n\nfunction safeHref(url) {\n  const value = String(url).trim();\n  if (value.startsWith('/') && !value.startsWith('//')) return value;\n  try {\n    const { protocol } = new URL(value);\n    return ['http:', 'https:', 'mailto:'].includes(protocol) ? value : '#';\n  } catch {\n    return '#';\n  }\n}",
      "tests": [
        {
          "name": "escape",
          "code": "return escapeHtml(`<img src=x onerror=\"alert(1)\">&'`) === \"&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;\";"
        },
        {
          "name": "безопасные ссылки",
          "code": "return safeHref(\"https://a.ru/x\") === \"https://a.ru/x\" && safeHref(\"/profile\") === \"/profile\" && safeHref(\"mailto:a@b.ru\") === \"mailto:a@b.ru\";"
        },
        {
          "name": "javascript:",
          "code": "return safeHref(\"javascript:alert(1)\") === \"#\" && safeHref(\"  JaVaScRiPt:alert(1)\") === \"#\" && safeHref(\"//evil.com\") === \"#\";"
        }
      ]
    }
  ]
});
