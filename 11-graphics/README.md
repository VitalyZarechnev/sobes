# 11. Canvas, 2D и 3D графика

> 2 дня из плана, упор на практику. Цель — уверенно рисовать и анимировать на Canvas 2D, понимать, когда SVG, Canvas или WebGL, знать основы WebGL-конвейера и уметь собрать сцену на Three.js (и React Three Fiber / TresJS). Для большинства фронтенд-интервью достаточно 01–03; 04–05 — для продуктов с визуализацией, картами, редакторами, играми.

## Прогресс раздела
- [ ] [Canvas 2D: основы рисования](01-canvas-2d-basics.md)
- [ ] [Анимация и интерактив](02-animation-and-interaction.md)
- [ ] [Производительность и выбор SVG / Canvas / WebGL](03-canvas-performance.md)
- [ ] [WebGL: основы](04-webgl-basics.md)
- [ ] [Three.js, React Three Fiber, TresJS](05-threejs-and-frameworks.md)
- [ ] [Практические проекты](06-practice-projects.md)

## Демо

Откройте файлы в браузере и покрутите параметры — каждое демо связано с темой.

| Демо | Что показывает |
|---|---|
| [01-shapes-playground](demos/01-shapes-playground.html) | `translate`/`rotate`/`scale`, порядок трансформаций, `save`/`restore` |
| [02-dpr-sharpness](demos/02-dpr-sharpness.html) | размытие на retina и исправление через `devicePixelRatio` |
| [03-particles-loop](demos/03-particles-loop.html) | игровой цикл, delta time, фиксированный шаг, пул частиц на типизированных массивах |
| [04-drag-shapes](demos/04-drag-shapes.html) | hit-testing через `isPointInPath`, drag с `setPointerCapture`, zoom вокруг курсора, клавиатура |
| [05-webgl-triangle](demos/05-webgl-triangle.html) | WebGL2 с нуля: буфер, VAO, шейдеры, uniform, живое редактирование шейдера |
| [06-threejs-scene](demos/06-threejs-scene.html) | Three.js: камера, свет, OrbitControls, InstancedMesh (1 draw call), raycasting (нужен интернет) |

## Как готовиться
1. Пройдите 01–02 и сделайте мини-проект «рисовалка» или «частицы» без библиотек.
2. Прочитайте 03 и сформулируйте своими словами, когда SVG, когда Canvas и когда WebGL — это самый частый вопрос.
3. Для 3D: пройдите [Discover three.js](https://discoverthreejs.com/) и демо 05–06.
4. Решите задачи в тестах тем — они на математику графики (lerp, столкновения, матрицы, hit-testing).

**Источники:** [MDN: Canvas API tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial), [WebGL2 Fundamentals](https://webgl2fundamentals.org/), [three.js docs](https://threejs.org/docs/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [TresJS](https://docs.tresjs.org/).

## Самопроверка раздела (топ-10 вопросов)
1. Чем immediate mode (Canvas) отличается от retained mode (DOM, SVG)?
2. Почему canvas размыт на retina и как исправить?
3. Как устроить игровой цикл, независимый от частоты кадров?
4. Как определить, по какой фигуре кликнули на canvas?
5. Как сделать zoom вокруг курсора?
6. SVG, Canvas или WebGL для графика на 100 000 точек? Для иконок? Для редактора диаграмм?
7. Как вынести рендер с главного потока (OffscreenCanvas)?
8. Что делают вершинный и фрагментный шейдеры?
9. Что такое draw call и как их сократить (инстансинг, батчинг)?
10. Как сделать canvas-визуализацию доступной?
