QUIZ.register({
  "id": "11-graphics/05-threejs-and-frameworks",
  "section": "11-graphics",
  "title": "Three.js, R3F, TresJS",
  "order": 5,
  "source": "../11-graphics/05-threejs-and-frameworks.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Mesh в Three.js — это…",
      "options": [
        "Камера",
        "Geometry (форма) + Material (вид поверхности)",
        "Источник света",
        "Рендерер"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему нельзя вызывать `setState` в `useFrame` (R3F)?",
      "options": [
        "Ошибка TypeScript",
        "React будет перерисовывать компонент каждый кадр — анимацию делают мутацией через ref",
        "useFrame не поддерживает состояние",
        "Можно"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "После переходов между страницами SPA с 3D растёт видеопамять. Причина?",
      "options": [
        "Кэш браузера",
        "Не вызывается `dispose()` для геометрий, материалов и текстур",
        "Слишком много света",
        "OrbitControls"
      ],
      "answer": 1,
      "explain": "R3F освобождает объекты из JSX автоматически, но созданные вручную — нет."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой формат 3D-моделей стандартен для веба?",
      "options": [
        "OBJ",
        "FBX",
        "glTF/GLB",
        "STL"
      ],
      "answer": 2,
      "explain": "Компактный, с материалами PBR, анимациями и сжатием (Draco/Meshopt, KTX2)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт `frameloop=\"demand\"` в R3F?",
      "options": [
        "Ускоряет загрузку",
        "Перерисовка только при изменениях (invalidate) — экономия CPU/GPU и батареи для статичных сцен",
        "Включает WebGPU",
        "Отключает тени"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": []
});
