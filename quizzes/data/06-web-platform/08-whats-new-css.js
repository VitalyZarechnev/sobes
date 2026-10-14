QUIZ.register({
  "id": "06-web-platform/08-whats-new-css",
  "section": "06-web-platform",
  "title": "Новинки CSS 2023–2026",
  "order": 8,
  "source": "../06-web-platform/08-whats-new-css.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что означает статус Baseline «Widely available»?",
      "options": [
        "Фича есть в Chrome",
        "Фича поддерживается во всех основных браузерах больше 30 месяцев",
        "Фича в черновике спецификации",
        "Фича работает с полифиллом"
      ],
      "answer": 1,
      "explain": "«Newly available» — недавно во всех основных браузерах, «Limited» — не во всех."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой селектор подсветит `.field`, если внутри него невалидный инпут, который пользователь уже трогал?",
      "options": [
        "`.field input:invalid`",
        "`.field:has(input:user-invalid)`",
        "`.field > :invalid`",
        "`.field:focus-within`"
      ],
      "answer": 1,
      "explain": "`:has()` стилизует родителя по содержимому, `:user-invalid` срабатывает только после взаимодействия пользователя."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Какой цвет у ссылки?",
      "code": "@layer base, theme;\n@layer theme { a { color: green; } }\n@layer base { #nav a.link { color: red; } }\na { color: blue; }",
      "lang": "css",
      "options": [
        "red",
        "green",
        "blue",
        "зависит от порядка в DOM"
      ],
      "answer": 2,
      "explain": "Стили вне слоёв побеждают любые слоистые. Без последнего правила победил бы green: слой theme объявлен позже, специфичность между слоями не сравнивается."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем container queries отличаются от медиазапросов?",
      "options": [
        "Ничем",
        "Реагируют на размер контейнера компонента, а не окна",
        "Работают только в Grid",
        "Заменяют flexbox"
      ],
      "answer": 1,
      "explain": "Компонент адаптируется к месту, где стоит (узкая колонка или широкая область), — это делает его переиспользуемым."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что нужно, чтобы плавно анимировать появление элемента и скрытие через `display: none` без JS?",
      "options": [
        "`@starting-style`",
        "`transition-behavior: allow-discrete` (или `allow-discrete` в transition)",
        "`@keyframes` обязательно",
        "`will-change: display`",
        "transition по `display`"
      ],
      "answer": [
        0,
        1,
        4
      ],
      "explain": "`@starting-style` задаёт начальное состояние, `allow-discrete` разрешает переход дискретного `display`, который переключается в конце анимации."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `light-dark(#fff, #111)`?",
      "options": [
        "Смешивает цвета",
        "Выбирает первое значение для светлой схемы и второе для тёмной по `color-scheme`",
        "Делает цвет полупрозрачным",
        "Инвертирует цвет"
      ],
      "answer": 1,
      "explain": "Нужно объявить `color-scheme: light dark`, переключатель темы меняет только `color-scheme`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему для палитр предпочитают `oklch()`, а не `hsl()`?",
      "options": [
        "Короче запись",
        "Перцептивно равномерное пространство: одинаковая светлота L воспринимается одинаково для разных оттенков, плюс широкий охват P3",
        "Только он поддерживает прозрачность",
        "Он быстрее рендерится"
      ],
      "answer": 1,
      "explain": "С relative color syntax и `color-mix()` заменяет функции цвета препроцессоров."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой статус у anchor positioning на октябрь 2026?",
      "options": [
        "Baseline Widely available",
        "Limited: поддержка в движках разной полноты, нужен запасной вариант",
        "Удалён из спецификации",
        "Только Firefox"
      ],
      "answer": 1,
      "explain": "Используйте с `@supports` и запасным вариантом (например, Floating UI)."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `content-visibility: auto`?",
      "options": [
        "Скрывает элемент",
        "Пропускает layout и paint для блоков вне экрана, пока к ним не прокрутят",
        "Включает ленивую загрузку картинок",
        "Делает элемент невидимым для скринридеров"
      ],
      "answer": 1,
      "explain": "Нужно задать `contain-intrinsic-size`, чтобы скроллбар не прыгал. Baseline 2025."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие фичи на октябрь 2026 есть только в Chromium (🧪)?",
      "options": [
        "`if()`",
        "`@function`",
        "`:has()`",
        "`interpolate-size` / `calc-size()`",
        "`@layer`",
        "`corner-shape`"
      ],
      "answer": [
        0,
        1,
        3,
        5
      ],
      "explain": "`:has()` и `@layer` — Baseline Widely available."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем нативная вложенность (nesting) отличается от Sass?",
      "options": [
        "Ничем",
        "Селектор не склеивается строкой: `&__title` в нативном CSS не работает",
        "Не поддерживает медиазапросы",
        "Работает только с классами"
      ],
      "answer": 1,
      "explain": "Нативный `&` — ссылка на родительский селектор, а не текстовая подстановка."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Как вы внедряете CSS-фичи со статусом Limited availability?",
      "answer": "Как прогрессивное улучшение: базовый вариант работает везде, улучшение включается через `@supports` (например, `@supports (animation-timeline: view())`). Сверяю статус на webstatus.dev/caniuse с `browserslist` и аналитикой аудитории. Для синтаксиса (nesting) при необходимости — PostCSS. Учитываю `prefers-reduced-motion` для анимаций. Если фича критична для UX (anchor positioning для меню) — запасной вариант на JS-библиотеке."
    }
  ],
  "tasks": [
    {
      "title": "Тултип на popover с анимацией",
      "level": "senior",
      "lang": "css",
      "prompt": "Сделайте подсказку `<div id=\"tip\" popover>` к кнопке `popovertarget=\"tip\"`: плавное появление и исчезновение (opacity + сдвиг), позиционирование anchor positioning с запасным вариантом, уважение `prefers-reduced-motion`.",
      "solution": ".trigger { anchor-name: --tip; }\n#tip {\n  margin: 0;\n  inset: auto auto 1rem 1rem;\n  opacity: 0;\n  translate: 0 6px;\n  transition: opacity .2s, translate .2s, display .2s allow-discrete, overlay .2s allow-discrete;\n}\n#tip:popover-open {\n  opacity: 1;\n  translate: 0 0;\n  @starting-style { opacity: 0; translate: 0 6px; }\n}\n@supports (position-anchor: --tip) {\n  #tip { position-anchor: --tip; position-area: top; position-try-fallbacks: flip-block; inset: auto; }\n}\n@media (prefers-reduced-motion: reduce) { #tip { transition: none; } }"
    },
    {
      "title": "Тема на light-dark()",
      "level": "middle",
      "lang": "css",
      "prompt": "Сделайте тему без двух наборов переменных: системная по умолчанию, принудительный выбор через `data-theme`.",
      "solution": ":root {\n  color-scheme: light dark;\n  --bg: light-dark(#fff, #141413);\n  --text: light-dark(#1d1d1b, #ecebe6);\n}\n:root[data-theme='light'] { color-scheme: light; }\n:root[data-theme='dark'] { color-scheme: dark; }\nbody { background: var(--bg); color: var(--text); }"
    }
  ]
});
