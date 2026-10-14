QUIZ.register({
  "id": "06-web-platform/03-browser-rendering",
  "section": "06-web-platform",
  "title": "Как браузер рендерит страницу",
  "order": 3,
  "source": "../06-web-platform/03-browser-rendering.md",
  "questions": [
    {
      "type": "order",
      "level": "middle",
      "q": "Расположите этапы рендеринга",
      "items": [
        "Парсинг HTML → DOM, CSS → CSSOM",
        "Render tree (стили для видимых узлов)",
        "Layout (геометрия)",
        "Paint (заливка слоёв)",
        "Composite (сборка слоёв на GPU)"
      ],
      "explain": "Изменение `transform`/`opacity` затрагивает только последний этап."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему CSS в `<head>` блокирует отрисовку?",
      "options": [
        "Ошибка браузера",
        "Без CSSOM нельзя построить render tree — иначе был бы «мигающий» нестилизованный контент",
        "CSS выполняется как JS",
        "Не блокирует"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое forced synchronous layout (layout thrashing)?",
      "options": [
        "Анимация",
        "Чтение геометрии (`offsetHeight`) после записи стилей заставляет браузер синхронно пересчитать layout; в цикле — многократно",
        "Ошибка CSS",
        "Перерисовка GPU"
      ],
      "answer": 1,
      "explain": "Группируйте чтения и записи, используйте rAF."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `content-visibility: auto`?",
      "options": [
        "Скрывает элемент",
        "Пропускает рендеринг (layout/paint) содержимого вне экрана до приближения к вьюпорту",
        "Ленивая загрузка картинок",
        "Отключает анимации"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем парсер HTML отличается от preload scanner?",
      "options": [
        "Ничем",
        "Preload scanner заранее находит ресурсы в HTML и начинает их загрузку, пока основной парсер заблокирован скриптом",
        "Scanner исполняет JS",
        "Scanner строит CSSOM"
      ],
      "answer": 1,
      "explain": "Поэтому ресурсы, вставленные JS, находятся позже."
    }
  ],
  "tasks": []
});
