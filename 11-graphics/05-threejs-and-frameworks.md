# Three.js, React Three Fiber, TresJS

> ⏱ ~4 ч · 🎯 Собрать 3D-сцену на Three.js, встроить её в React (R3F) или Vue (TresJS), не убив производительность: инстансинг, dispose, рендер по требованию, загрузка моделей.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Знаю основные сущности: Scene, Camera, Renderer, Mesh = Geometry + Material, Light
- [ ] Использую OrbitControls, Raycaster, GLTFLoader
- [ ] Знаю, как освобождать ресурсы (`dispose`)
- [ ] Понимаю, как R3F/TresJS встраивают сцену в компонентную модель и почему нельзя setState в каждом кадре
- [ ] Разобрал [демо 06](demos/06-threejs-scene.html)
- [ ] Ответил вслух на вопросы ниже

## Теория

### Минимальная сцена

```js
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
container.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
camera.position.set(0, 2, 6);

const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),          // форма: вершины, нормали, UV
  new THREE.MeshStandardMaterial({ color: 0x2563eb }), // как поверхность реагирует на свет (PBR)
);
scene.add(mesh, new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 2);
scene.add(light);

renderer.setAnimationLoop((time) => {
  mesh.rotation.y = time / 1000;
  renderer.render(scene, camera);
});
```

Граф сцены — retained mode: дерево `Object3D` с локальными трансформациями; движок сам вычисляет мировые матрицы и рисует.

### Ключевые инструменты

- **Контролы**: `OrbitControls` (вращение, зум), `MapControls`, `PointerLockControls`.
- **Raycaster** — какой объект под курсором: луч из камеры через точку экрана в нормализованных координатах (-1..1).
- **Загрузка моделей**: glTF/GLB — «JPEG для 3D» (`GLTFLoader`), сжатие геометрии Draco/Meshopt и текстур KTX2.
- **Материалы**: `MeshBasicMaterial` (без света), `MeshStandardMaterial`/`MeshPhysicalMaterial` (PBR), `ShaderMaterial` (свои шейдеры), TSL (Three Shading Language) для WebGPU-рендерера.
- **Постобработка**: `EffectComposer` (bloom, SSAO) — дорого по fill rate.

### Производительность

- `InstancedMesh` для множества одинаковых объектов — один draw call ([демо 06](demos/06-threejs-scene.html)).
- `renderer.info` — число draw calls, треугольников, текстур в памяти.
- Рендер по требованию (`frameloop="demand"` в R3F): статичная сцена не перерисовывается 60 раз в секунду — экономия батареи.
- Ограничение DPR, упрощённые тени, LOD, сжатые текстуры.
- **`dispose()`** геометрий, материалов и текстур при удалении объектов — иначе утечка видеопамяти (особенно в SPA при смене страниц).

### React Three Fiber

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh } from 'three';

function SpinningBox() {
  const ref = useRef<Mesh>(null);
  // useFrame вызывается каждый кадр ВНЕ React-рендера: мутируем объект напрямую
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2563eb" />
    </mesh>
  );
}

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 2, 6] }} dpr={[1, 2]} frameloop="demand">
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} />
      <SpinningBox />
      <OrbitControls />
    </Canvas>
  );
}
```

R3F — свой React-рендерер (reconciler), который создаёт объекты Three.js из JSX; `dispose` вызывается автоматически при размонтировании. Экосистема pmndrs: drei (готовые хелперы), rapier (физика), postprocessing.

🪤 **Ловушка:** `setState` в `useFrame` → React перерисовывает компонент 60 раз в секунду. Анимации — мутацией через `ref`, состояние — для дискретных событий.

### TresJS (Vue)

Аналог R3F для Vue: `<TresCanvas>`, компоненты `<TresMesh>`, `<TresBoxGeometry>`, композабл `useRenderLoop`/`useLoop` для анимаций, экосистема `@tresjs/cientos` (аналог drei). Те же правила: анимации — через refs в цикле рендера, а не через реактивное состояние.

### Другие библиотеки

- **PixiJS** — быстрый 2D на WebGL/WebGPU (игры, интерактивная графика).
- **Babylon.js** — полноценный 3D-движок с инспектором и физикой.
- **deck.gl, MapLibre** — визуализация геоданных.
- **Spline, Rive** — дизайн-инструменты с экспортом в веб-рантайм.

## Вопросы с собеседований

<details><summary>Из чего состоит сцена Three.js?</summary>

Renderer (рисует в canvas через WebGL/WebGPU), Scene (дерево объектов), Camera (перспективная/ортографическая), Mesh = Geometry (форма) + Material (как выглядит), Light (освещение для PBR-материалов), цикл рендера.
</details>

<details><summary>Как найти объект под курсором в 3D?</summary>

Raycaster: перевести координаты курсора в нормализованные (-1..1), пустить луч из камеры и найти пересечения с объектами (`intersectObjects`), для InstancedMesh — `instanceId`. Для тысяч объектов — BVH-ускорение (three-mesh-bvh) или GPU picking.
</details>

<details><summary>Почему 3D-страница в SPA со временем тормозит и ест память?</summary>

Не освобождаются ресурсы GPU: геометрии, материалы, текстуры, рендер-таргеты после размонтирования. Нужен `dispose()` (R3F делает автоматически для созданных в JSX объектов), остановка цикла рендера, удаление обработчиков.
</details>

<details><summary>Как анимировать в React Three Fiber без лишних рендеров?</summary>

`useFrame` + мутация объекта через ref — вне React-рендера. Состояние React — только для дискретных изменений (выбор объекта, переключение режима). Для статичных сцен — `frameloop="demand"` и `invalidate()`.
</details>

## Практика

1. Повторите [демо 06](demos/06-threejs-scene.html) на React Three Fiber или TresJS.
2. Загрузите glTF-модель с Draco-сжатием и покажите прогресс загрузки.
3. Добавьте выбор объекта кликом и панель свойств в DOM поверх canvas.

Тест темы: [Three.js и фреймворки](../quizzes/quiz.html?id=11-graphics/05-threejs-and-frameworks).

## Источники
- [three.js: Creating a scene](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)
- [Discover three.js](https://discoverthreejs.com/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [R3F: Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [TresJS](https://docs.tresjs.org/)
- [Khronos: glTF](https://www.khronos.org/gltf/)
