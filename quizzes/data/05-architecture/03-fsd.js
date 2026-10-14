QUIZ.register({
  "id": "05-architecture/03-fsd",
  "section": "05-architecture",
  "title": "Feature-Sliced Design: теория",
  "order": 3,
  "source": "../05-architecture/03-fsd.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Куда положить кнопку «Добавить в корзину» с логикой?",
      "options": [
        "shared/ui",
        "features/add-to-cart",
        "entities/product",
        "pages/catalog"
      ],
      "answer": 1,
      "explain": "Действие пользователя с бизнес-ценностью — фича."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Куда положить карточку товара (отображение сущности)?",
      "options": [
        "features",
        "entities/product",
        "shared",
        "app"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Можно ли импортировать одну фичу из другой (`features/a` → `features/b`)?",
      "options": [
        "Да, свободно",
        "Нет: слайсы одного слоя изолированы; композиция — на уровне выше (widgets/pages)",
        "Только типы",
        "Только в app"
      ],
      "answer": 1,
      "explain": "Для entities есть явная cross-import нотация `@x`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое сегменты в FSD?",
      "options": [
        "Слои",
        "Группы внутри слайса по назначению: ui, model, api, lib, config",
        "Маршруты",
        "Микрофронтенды"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему в shared не должно быть бизнес-логики?",
      "options": [
        "Так красивее",
        "shared переиспользуется всеми слоями — доменное знание там создаёт скрытые зависимости",
        "Это требование TS",
        "Для скорости сборки"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Проверка правил импорта FSD",
      "level": "senior",
      "prompt": "Реализуйте `checkImport(from, to)` для путей вида `layer/slice/...`. Слои сверху вниз: `app`, `pages`, `widgets`, `features`, `entities`, `shared`; у `app` и `shared` нет слайсов. Верните `null`, если импорт разрешён, иначе код ошибки:\n\n- `\"LAYER_UP\"` — импорт из вышележащего слоя;\n- `\"CROSS_SLICE\"` — импорт из другого слайса того же слоя;\n- `\"DEEP_IMPORT\"` — импорт глубже публичного API слайса (у `to` есть части после `layer/slice`). Для `shared` и `app` глубину не проверяем.\n\nИмпорт внутри своего слайса разрешён.",
      "starter": "function checkImport(from, to) {\n  // ваш код\n}",
      "solution": "const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];\nconst NO_SLICES = new Set(['app', 'shared']);\n\nfunction checkImport(from, to) {\n  const [fromLayer, fromSlice] = from.split('/');\n  const [toLayer, toSlice, ...rest] = to.split('/');\n  const fromRank = LAYERS.indexOf(fromLayer);\n  const toRank = LAYERS.indexOf(toLayer);\n  if (fromLayer === toLayer) {\n    if (NO_SLICES.has(fromLayer) || fromSlice === toSlice) return null; // внутри своего слайса\n    return 'CROSS_SLICE';\n  }\n  if (toRank < fromRank) return 'LAYER_UP';\n  if (!NO_SLICES.has(toLayer) && rest.length > 0) return 'DEEP_IMPORT';\n  return null;\n}",
      "tests": [
        {
          "name": "вниз через публичный API",
          "code": "return checkImport(\"pages/catalog/ui/Page\", \"features/add-to-cart\") === null && checkImport(\"features/a/ui/X\", \"shared/ui/button\") === null;"
        },
        {
          "name": "вверх",
          "code": "return checkImport(\"entities/user/model\", \"features/auth\") === \"LAYER_UP\";"
        },
        {
          "name": "соседний слайс",
          "code": "return checkImport(\"features/a/ui\", \"features/b\") === \"CROSS_SLICE\";"
        },
        {
          "name": "глубокий импорт",
          "code": "return checkImport(\"widgets/header/ui\", \"entities/user/model/store\") === \"DEEP_IMPORT\";"
        },
        {
          "name": "свой слайс",
          "code": "return checkImport(\"features/a/ui/X\", \"features/a/model/store\") === null;"
        }
      ],
      "notes": "В реальных проектах эти правила проверяет линтер Steiger или eslint-plugin-boundaries."
    }
  ]
});
