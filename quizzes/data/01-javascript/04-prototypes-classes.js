QUIZ.register({
  "id": "01-javascript/04-prototypes-classes",
  "section": "01-javascript",
  "title": "Прототипы и классы",
  "order": 4,
  "source": "../01-javascript/04-prototypes-classes.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "function Animal() {}\nAnimal.prototype.speak = function () { return \"...\"; };\nconst cat = new Animal();\nconsole.log(Object.getPrototypeOf(cat) === Animal.prototype, cat.hasOwnProperty(\"speak\"));",
      "options": [
        "`true true`",
        "`true false`",
        "`false false`",
        "`false true`"
      ],
      "answer": 1,
      "explain": "Метод найден по цепочке прототипов, а не на объекте."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "class A { static create() { return new this(); } }\nclass B extends A {}\nconsole.log(B.create() instanceof B);",
      "options": [
        "`true`",
        "`false`",
        "TypeError",
        "`undefined`"
      ],
      "answer": 0,
      "explain": "`this` в статическом методе — класс, через который вызван."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое `#field` в классе?",
      "options": [
        "Комментарий",
        "Настоящее приватное поле: недоступно снаружи, `#x in obj` проверяет наличие",
        "Соглашение об именовании",
        "Статическое поле"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "class Parent {\n  constructor() { this.init(); }\n  init() { this.v = \"parent\"; }\n}\nclass Child extends Parent {\n  v = \"field\";\n  init() { this.v = \"child\"; }\n}\nconsole.log(new Child().v);",
      "options": [
        "`'parent'`",
        "`'child'`",
        "`'field'`",
        "`undefined`"
      ],
      "answer": 2,
      "explain": "Поля класса-наследника инициализируются после `super()`: `init()` записал `child`, затем поле перезаписало на `field`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что вернёт `Object.create(null)`?",
      "options": [
        "Пустой объект с Object.prototype",
        "Объект без прототипа — нет `toString`, `hasOwnProperty`",
        "`null`",
        "Ошибку"
      ],
      "answer": 1,
      "explain": "Удобен как словарь без унаследованных ключей."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему методы класса лучше полей-стрелок в большом количестве экземпляров?",
      "options": [
        "Быстрее вызываются",
        "Методы лежат в прототипе (одна копия), стрелки создаются на каждый экземпляр",
        "Стрелки не работают в классах",
        "Нет разницы"
      ],
      "answer": 1,
      "explain": "Стрелки удобны для обработчиков, но стоят памяти."
    }
  ],
  "tasks": [
    {
      "title": "instanceOf своими руками",
      "level": "middle",
      "prompt": "Реализуйте `instanceOf(obj, Ctor)` без оператора `instanceof`: пройдите по цепочке прототипов `obj` и сравните с `Ctor.prototype`. Для примитивов — `false`.",
      "starter": "function instanceOf(obj, Ctor) {\n  // ваш код\n}",
      "solution": "function instanceOf(obj, Ctor) {\n  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;\n  let proto = Object.getPrototypeOf(obj);\n  while (proto) {\n    if (proto === Ctor.prototype) return true;\n    proto = Object.getPrototypeOf(proto);\n  }\n  return false;\n}",
      "tests": [
        {
          "name": "наследование",
          "code": "class A {} class B extends A {} const b = new B(); return instanceOf(b, A) && instanceOf(b, B) && instanceOf(b, Object);"
        },
        {
          "name": "примитивы",
          "code": "return !instanceOf(1, Number) && !instanceOf(\"s\", String) && !instanceOf(null, Object);"
        },
        {
          "name": "без прототипа",
          "code": "return !instanceOf(Object.create(null), Object);"
        },
        {
          "name": "без instanceof",
          "code": "return !/\\binstanceof\\b/.test(instanceOf.toString());"
        }
      ]
    }
  ]
});
