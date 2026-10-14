QUIZ.register({
  "id": "05-architecture/02-clean-architecture",
  "section": "05-architecture",
  "title": "Чистая архитектура на фронтенде",
  "order": 2,
  "source": "../05-architecture/02-clean-architecture.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Правило зависимостей в чистой архитектуре?",
      "options": [
        "Внешние слои не зависят от внутренних",
        "Зависимости направлены внутрь: домен не знает про UI, фреймворк и инфраструктуру",
        "Все слои зависят друг от друга",
        "UI — центр"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое порт и адаптер?",
      "options": [
        "Сетевой порт",
        "Порт — интерфейс, который нужен домену (репозиторий); адаптер — реализация (HTTP, localStorage, мок)",
        "Webpack-плагин",
        "Роутер"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Когда чистая архитектура избыточна?",
      "options": [
        "Никогда",
        "Простой CRUD без бизнес-правил, прототип, короткий срок жизни — слои дадут только церемонии",
        "Всегда избыточна",
        "Для больших продуктов"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Где проверять бизнес-правило «нельзя оформить заказ меньше 500 ₽»?",
      "options": [
        "В компоненте кнопки",
        "В доменном слое / use case (и на сервере)",
        "В CSS",
        "В роутере"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Use case с портами",
      "level": "senior",
      "prompt": "Реализуйте `createPlaceOrder({ cartRepo, orderApi, clock })` → async `placeOrder(userId)`. Use case: берёт корзину `cartRepo.get(userId)` (`{ items: [{ price, qty }] }`), считает сумму; если сумма < 500 — бросает `Error(\"MIN_TOTAL\")`; иначе вызывает `orderApi.create({ userId, total, createdAt: clock.now() })`, очищает корзину `cartRepo.clear(userId)` и возвращает созданный заказ. Пустая корзина — `Error(\"EMPTY_CART\")`.",
      "starter": "function createPlaceOrder({ cartRepo, orderApi, clock }) {\n  // ваш код\n}",
      "solution": "function createPlaceOrder({ cartRepo, orderApi, clock }) {\n  return async function placeOrder(userId) {\n    const cart = await cartRepo.get(userId);\n    if (!cart || cart.items.length === 0) throw new Error('EMPTY_CART');\n    const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);\n    if (total < 500) throw new Error('MIN_TOTAL');\n    const order = await orderApi.create({ userId, total, createdAt: clock.now() });\n    await cartRepo.clear(userId);\n    return order;\n  };\n}",
      "tests": [
        {
          "name": "успех с моками",
          "code": "let cleared = null; const deps = { cartRepo: { get: async () => ({ items: [{ price: 300, qty: 2 }] }), clear: async (id) => { cleared = id; } }, orderApi: { create: async (o) => ({ id: \"o1\", ...o }) }, clock: { now: () => 42 } }; const r = await createPlaceOrder(deps)(\"u1\"); return r.total === 600 && r.createdAt === 42 && cleared === \"u1\";"
        },
        {
          "name": "минимальная сумма",
          "code": "const deps = { cartRepo: { get: async () => ({ items: [{ price: 100, qty: 1 }] }), clear: async () => {} }, orderApi: { create: async () => { throw new Error(\"не должен вызываться\"); } }, clock: { now: () => 0 } }; try { await createPlaceOrder(deps)(\"u\"); return false; } catch (e) { return e.message === \"MIN_TOTAL\"; }"
        },
        {
          "name": "пустая корзина",
          "code": "const deps = { cartRepo: { get: async () => ({ items: [] }), clear: async () => {} }, orderApi: { create: async () => ({}) }, clock: { now: () => 0 } }; try { await createPlaceOrder(deps)(\"u\"); return false; } catch (e) { return e.message === \"EMPTY_CART\"; }"
        }
      ],
      "notes": "Use case не знает про fetch, React и localStorage — зависимости передаются снаружи, поэтому тест обходится простыми объектами."
    }
  ]
});
