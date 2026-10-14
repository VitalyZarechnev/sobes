# 06. Вёрстка, семантика, браузер, сеть

> 2 дня из плана. Это «фундамент под фреймворками»: на senior/lead-собеседовании здесь проверяют не знание API, а понимание механики — что делает браузер между байтами из сети и пикселями на экране, почему сайт медленный, где дыра в безопасности и как это измерить. Упор: рендеринг-пайплайн + Core Web Vitals + HTTP-кэширование/CORS + безопасность (XSS/CSRF/CSP/токены). Связано с [01. JavaScript](../01-javascript/) (event loop, микрозадачи), [03. React](../03-react/) и [04. Vue](../04-vue/) (SSR/гидрация, рендер-стратегии), [05. Архитектура](../05-architecture/) (BFF, кэш-слои, микрофронтенды).

## Прогресс раздела
- [ ] [Middle-разминка](00-middle-questions.md)
- [ ] [HTML-семантика и доступность (a11y)](01-html-semantics-a11y.md)
- [ ] [CSS: каскад, раскладка, архитектуры](02-css-layout.md)
- [ ] [Как браузер рендерит страницу](03-browser-rendering.md)
- [ ] [Сеть и HTTP](04-network-http.md)
- [ ] [Web Performance и Core Web Vitals](05-web-performance.md)
- [ ] [Безопасность фронтенда](06-security.md)
- [ ] [Хранилища, воркеры, браузерные API](07-storage-workers-apis.md)
- [ ] [Новинки CSS 2023–2026](08-whats-new-css.md)
- [ ] [Новинки HTML и DOM](09-whats-new-html.md)

## Как готовиться

**День 1** — «от URL до пикселя»: [03-browser-rendering](03-browser-rendering.md) → [04-network-http](04-network-http.md) → [05-web-performance](05-web-performance.md). Это одна история: сеть → парсинг → рендер → метрики. Научитесь рассказывать её за 5 минут без пауз, с цифрами (RTT, 14 КБ initial congestion window, пороги LCP/INP/CLS).

**День 2** — [06-security](06-security.md) → [01-html-semantics-a11y](01-html-semantics-a11y.md) → [02-css-layout](02-css-layout.md) → [07-storage-workers-apis](07-storage-workers-apis.md). Безопасность — обязательная тема для lead (ревью, архитектурные решения про токены). CSS и a11y часто дают «живой задачей» — сверстать/починить компонент.

Практика: откройте DevTools → Performance на любом тяжёлом сайте, найдите long task, layout shift, LCP-элемент; во вкладке Network разберите заголовки кэширования и preflight.

Главные источники:
- https://learn.javascript.ru/ — разделы «Документ», «Введение в события», «Загрузка документа», «Сетевые запросы», «Хранение данных в браузере»
- https://developer.mozilla.org/ — справочник по всему
- https://web.dev/articles/vitals — Core Web Vitals
- https://www.w3.org/WAI/ARIA/apg/ — паттерны доступных виджетов
- https://developer.chrome.com/docs/ — DevTools, устройство Chrome
- https://owasp.org/www-project-top-ten/ — OWASP Top 10

## Самопроверка раздела (топ-10 вопросов)
1. Что происходит от ввода URL до первого кадра? Где тут блокирующие ресурсы и как их убрать?
2. Чем отличаются reflow, repaint и composite? Какие свойства анимировать и почему `will-change` — не серебряная пуля?
3. Что такое LCP, INP, CLS, их пороги, как измеряются в поле и как улучшить каждую?
4. Как работает HTTP-кэш: `Cache-Control`, `ETag`, `no-cache` vs `no-store`, `stale-while-revalidate`, стратегия для хэшированных ассетов и HTML?
5. Когда браузер делает preflight, и почему CORS не защищает сервер?
6. Чем HTTP/2 лучше HTTP/1.1, а HTTP/3 — HTTP/2? Что такое head-of-line blocking на уровне TCP?
7. Виды XSS, как от них защищает CSP с nonce/strict-dynamic и Trusted Types?
8. Где хранить access/refresh токены в SPA? Что такое BFF и PKCE?
9. Первое правило ARIA, как вычисляется accessible name, как сделать доступный модальный диалог?
10. Что создаёт stacking context, почему `z-index: 9999` «не работает»? Как каскадные слои `@layer` меняют специфичность?
