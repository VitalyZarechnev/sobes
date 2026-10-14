QUIZ.register({
  "id": "06-web-platform/09-whats-new-html",
  "section": "06-web-platform",
  "title": "Новинки HTML и DOM",
  "order": 9,
  "source": "../06-web-platform/09-whats-new-html.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `<dialog>` с `showModal()` отличается от `popover`?",
      "options": [
        "Ничем",
        "dialog — модальный (фон inert, фокус внутри), popover — немодальный с light dismiss",
        "popover нельзя закрыть Escape",
        "dialog работает только в Chrome"
      ],
      "answer": 1,
      "explain": "Подтверждения и формы — `dialog`, меню/тултипы/тосты — `popover`. Оба в верхнем слое без z-index."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как открыть поповер по кнопке без JS?",
      "options": [
        "`onclick=\"...\"`",
        "`<button popovertarget=\"id\">`",
        "`<a href=\"#id\">`",
        "`<button target=\"id\">`"
      ],
      "answer": 1,
      "explain": "Также `commandfor=\"id\" command=\"toggle-popover\"`."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Пользователь открыл меню A, затем нажал кнопку меню B. Что видно?",
      "code": "<div id=\"a\" popover>Меню A</div>\n<div id=\"b\" popover>Меню B</div>",
      "lang": "html",
      "options": [
        "Оба меню",
        "Только меню B",
        "Только меню A",
        "Ничего"
      ],
      "answer": 1,
      "explain": "Режим `auto` по умолчанию: открытие нового `auto`-поповера закрывает другие. Для независимых — `popover=\"manual\"`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `<button commandfor=\"d\" command=\"show-modal\">`?",
      "options": [
        "Отправляет форму",
        "Открывает `<dialog id=\"d\">` модально без JS (invoker commands)",
        "Создаёт новый диалог",
        "Ничего, это нестандартный атрибут"
      ],
      "answer": 1,
      "explain": "Invoker commands — Baseline с декабря 2025. Собственные команды начинаются с `--` и обрабатываются событием `command`."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Что `showModal()` даёт из коробки?",
      "options": [
        "Верхний слой без z-index",
        "Фон недоступен для клавиатуры и скринридеров",
        "Закрытие по Escape",
        "Возврат фокуса при закрытии",
        "Автоматическую отправку формы на сервер"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Доступное имя (`aria-labelledby`) и начальный фокус нужно задать самому."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как сделать аккордеон «открыт только один» без JS?",
      "options": [
        "Невозможно",
        "Дать `<details>` одинаковый атрибут `name`",
        "`<details exclusive>`",
        "`<summary group>`"
      ],
      "answer": 1,
      "explain": "Baseline 2024."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает атрибут `inert`?",
      "options": [
        "Скрывает элемент",
        "Делает поддерево недоступным для фокуса, кликов и скринридеров",
        "Отключает анимации",
        "Запрещает выделение текста"
      ],
      "answer": 1,
      "explain": "Используется для фона собственных модальных слоёв, выдвижных панелей, блоков в загрузке."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Когда уместен `fetchpriority=\"high\"`?",
      "options": [
        "На всех картинках",
        "На LCP-изображении, чтобы оно грузилось раньше второстепенных ресурсов",
        "На скриптах аналитики",
        "Вместо preload для шрифтов"
      ],
      "answer": 1,
      "explain": "Это подсказка приоритета, она дополняет, а не заменяет `preload`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем нужен Declarative Shadow DOM?",
      "options": [
        "Для стилизации скроллбаров",
        "Чтобы описать shadow root в HTML и рендерить веб-компоненты на сервере (SSR) без JS",
        "Для изоляции iframe",
        "Для ленивой загрузки"
      ],
      "answer": 1,
      "explain": "Baseline Widely available с августа 2026."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Speculation Rules?",
      "options": [
        "Правила CSP",
        "JSON-правила prefetch/prerender вероятных следующих страниц для мгновенной навигации (пока Chromium)",
        "Правила кэширования Service Worker",
        "Метаданные SEO"
      ],
      "answer": 1,
      "explain": "Другие браузеры игнорируют блок, поэтому это безопасное прогрессивное улучшение; нельзя пререндерить страницы с побочными эффектами."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `moveBefore()` лучше `insertBefore()` при перестановке узлов?",
      "options": [
        "Быстрее парсит HTML",
        "Переносит узел без сброса состояния: iframe не перезагружается, видео и фокус сохраняются",
        "Работает с текстовыми узлами",
        "Ничем"
      ],
      "answer": 1,
      "explain": "Статус — пока не во всех браузерах (Chromium и Firefox)."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Какие JS-компоненты в вашем проекте можно заменить нативным HTML и что это даст?",
      "answer": "Модалки → `<dialog>` + `showModal()` (фокус, inert-фон, Escape, top layer); меню, тултипы, тосты → `popover` (light dismiss, top layer); открытие без обработчиков → `popovertarget` / `commandfor`; аккордеоны → `<details name>`; кастомные селекты → customizable select как прогрессивное улучшение; позиционирование → anchor positioning с fallback. Выигрыш: меньше JS (размер бандла, INP), доступность «из коробки», меньше багов с фокусом и z-index. Нужно проверить поддержку по browserslist и при необходимости полифиллы."
    }
  ],
  "tasks": [
    {
      "title": "Модалка подтверждения без JS-обработчиков",
      "level": "senior",
      "lang": "html",
      "prompt": "Кнопка «Удалить» открывает модальный диалог с заголовком, описанием и кнопками «Отмена» (закрывает) и «Удалить» (POST-форма). Диалог доступен для скринридеров, фокус по умолчанию на безопасном действии.",
      "solution": "<button commandfor=\"delete-dialog\" command=\"show-modal\">Удалить</button>\n<dialog id=\"delete-dialog\" aria-labelledby=\"delete-title\" aria-describedby=\"delete-desc\" closedby=\"any\">\n  <h2 id=\"delete-title\">Удалить заказ?</h2>\n  <p id=\"delete-desc\">Действие нельзя отменить.</p>\n  <form method=\"post\" action=\"/orders/42/delete\">\n    <button type=\"button\" commandfor=\"delete-dialog\" command=\"close\" autofocus>Отмена</button>\n    <button type=\"submit\">Удалить</button>\n  </form>\n</dialog>"
    },
    {
      "title": "FAQ-аккордеон",
      "level": "middle",
      "lang": "html",
      "prompt": "Три вопроса, открыт только один ответ, ответы находятся поиском по странице, у секции есть доступный заголовок.",
      "solution": "<section aria-labelledby=\"faq-title\">\n  <h2 id=\"faq-title\">Частые вопросы</h2>\n  <details name=\"faq\"><summary>Сколько стоит доставка?</summary><p>Бесплатно от 2000 ₽.</p></details>\n  <details name=\"faq\"><summary>Как вернуть товар?</summary><p>В течение 14 дней.</p></details>\n  <details name=\"faq\"><summary>Способы оплаты?</summary><p>Карты, СБП.</p></details>\n</section>"
    }
  ]
});
