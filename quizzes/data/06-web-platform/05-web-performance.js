QUIZ.register({
  "id": "06-web-platform/05-web-performance",
  "section": "06-web-platform",
  "title": "Web Performance и Core Web Vitals",
  "order": 5,
  "source": "../06-web-platform/05-web-performance.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какая метрика отвечает за отзывчивость на взаимодействия?",
      "options": [
        "LCP",
        "INP",
        "CLS",
        "TTFB"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Частая причина высокого CLS?",
      "options": [
        "Медленный сервер",
        "Картинки и реклама без размеров, вставка контента над существующим, шрифты без fallback-метрик",
        "Много JS",
        "HTTP/1.1"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как улучшить INP при тяжёлом обработчике клика?",
      "options": [
        "Добавить больше JS",
        "Разбить работу на части и уступать главный поток (`scheduler.yield()`, `setTimeout`), сначала обновить UI",
        "Использовать `alert`",
        "Переписать CSS"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что ускоряет LCP?",
      "options": [
        "`fetchpriority=\"high\"` для LCP-изображения",
        "preload ключевого ресурса",
        "SSR/статический HTML вместо клиентского рендера",
        "`loading=\"lazy\"` для LCP-картинки",
        "уменьшение TTFB и render-blocking ресурсов"
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
      "q": "Что такое Speculation Rules?",
      "options": [
        "Правила CSP",
        "Декларативный prefetch/prerender следующих страниц (`<script type=\"speculationrules\">`) для мгновенной навигации",
        "A/B-тесты",
        "Правила кэша"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
