# 05. Архитектура

> План: **2 дня**. Упор — **Feature-Sliced Design** и **Чистая архитектура** (на собеседованиях Senior/Lead спрашивают «как вы бы разложили проект» и «почему так»). MVC/MVP/MVVM — компактно, на уровне «как это проявляется в React/Vue». Завершает раздел фронтенд system design — финальный «экзамен» на архитектурное мышление.
> Связи: [03. React](../03-react/) (хуки как ViewModel, state-менеджмент), [04. Vue](../04-vue/) (composables, MVVM), [06. Web Platform](../06-web-platform/) (производительность, сеть — для system design), [07. Lead](../07-lead/) (ADR, техдолг, договорённости в команде).

## Прогресс раздела
- [ ] [Middle-разминка](00-middle-questions.md)
- [ ] [Принципы: SOLID, DRY/KISS/YAGNI, coupling/cohesion, DI](01-principles.md)
- [ ] [Чистая архитектура и порты/адаптеры на фронтенде](02-clean-architecture.md)
- [ ] [Feature-Sliced Design: теория](03-fsd.md)
- [ ] [FSD на практике: дерево, миграция, линтинг, Next/Nuxt](04-fsd-in-practice.md)
- [ ] [MVC, MVP, MVVM и Flux](05-mvc-mvp-mvvm.md)
- [ ] [GoF-паттерны, монорепо, микрофронтенды, design system](06-patterns-and-scaling.md)
- [ ] [Фронтенд system design (RADIO) + 3 кейса](07-frontend-system-design.md)
- [ ] [Микрофронтенды](08-microfrontends.md)
- [ ] [Выбор технологий](09-tech-selection.md)

## Как готовиться

**День 1 (теория + FSD):**
1. [01-principles](01-principles.md) — быстро, это фундамент для всего остального (особенно DIP и cohesion).
2. [03-fsd](03-fsd.md) + [04-fsd-in-practice](04-fsd-in-practice.md) — основной объём. Нарисуйте на бумаге дерево своего текущего проекта в терминах FSD и найдите 3 нарушения правила импортов.
3. Прогоните `npx steiger ./src` на любом своём проекте — ошибки линтера лучше любой теории показывают, где граница слоёв.

**День 2 (Clean Architecture + system design):**
1. [02-clean-architecture](02-clean-architecture.md) — уметь объяснить правило зависимостей и где оно оверинжиниринг.
2. [05-mvc-mvp-mvvm](05-mvc-mvp-mvvm.md) и [06-patterns-and-scaling](06-patterns-and-scaling.md) — по диагонали, вопросы — вслух.
3. [07-frontend-system-design](07-frontend-system-design.md) — прорешать 3 кейса с таймером 45 минут каждый, проговаривая вслух.

**Главные источники:**
- Документация FSD — https://feature-sliced.design/docs/get-started/overview
- Steiger — https://github.com/feature-sliced/steiger
- R. Martin, The Clean Architecture — https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Книга Р. Мартина «Чистая архитектура» (Clean Architecture, 2017) — главы про SOLID, компонентные принципы, границы
- M. Fowler, GUI Architectures — https://martinfowler.com/eaaDev/uiArchs.html
- A. Cockburn, Hexagonal Architecture — https://alistair.cockburn.us/hexagonal-architecture/

## Самопроверка раздела (топ-10 вопросов)
1. Сформулируйте правило зависимостей Чистой архитектуры. Как оно связано с Dependency Inversion Principle?
2. Чем порты и адаптеры (hexagonal) отличаются от «луковицы» Мартина, и что из этого реально нужно SPA?
3. Назовите слои FSD сверху вниз и правило импортов. Почему у `shared` и `app` нет слайсов?
4. Чем feature отличается от entity и от widget? Приведите пограничный пример и аргументируйте выбор.
5. Что такое public API слайса, зачем `@x`-нотация и почему кросс-импорты — это сигнал, а не всегда ошибка?
6. Как пошагово мигрировать легаси-проект на FSD, не останавливая разработку фичей?
7. Где в FSD-проекте живут use cases и репозитории, если команда хочет ещё и Clean Architecture?
8. Чем MVP отличается от MVVM? Почему кастомный хук — это ViewModel, а Vue — MVVM «из коробки»?
9. Когда микрофронтенды оправданы, а когда это организационная проблема, решаемая техническим молотком?
10. Спроектируйте автокомплит: требования, архитектура, модель данных, API, оптимизации (debounce, отмена, кэш, a11y).
