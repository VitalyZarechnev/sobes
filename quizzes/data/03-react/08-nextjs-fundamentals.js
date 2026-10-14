QUIZ.register({
  "id": "03-react/08-nextjs-fundamentals",
  "section": "03-react",
  "title": "Next.js: основы App Router",
  "order": 8,
  "source": "../03-react/08-nextjs-fundamentals.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Как создать маршрут `/blog/[slug]` в App Router?",
      "options": [
        "`pages/blog/[slug].tsx`",
        "`app/blog/[slug]/page.tsx`",
        "`routes.ts`",
        "`app/blog/slug.tsx`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `layout.tsx` отличается от `template.tsx`?",
      "options": [
        "Ничем",
        "Layout сохраняет состояние между переходами внутри сегмента, template пересоздаётся при каждой навигации",
        "Template для SSR",
        "Layout только для корня"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что заменило `middleware.ts` в Next.js 16?",
      "options": [
        "`server.ts`",
        "`proxy.ts`",
        "`edge.ts`",
        "`route.ts`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как в Next.js 15+ получить `params` в странице?",
      "options": [
        "Синхронно `params.slug`",
        "`const { slug } = await params` — params стал промисом",
        "Через `useRouter`",
        "Через `getServerSideProps`"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Partial Prerendering (PPR)?",
      "options": [
        "Частичная гидратация",
        "Статический shell отдаётся сразу (с CDN), динамические части за Suspense дотекают стримингом",
        "Пре-рендер половины страниц",
        "Клиентский рендер"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где обрабатывать ошибки рендера сегмента?",
      "options": [
        "`error.tsx` (Client Component) в сегменте",
        "try/catch в layout",
        "Только глобально",
        "`404.tsx`"
      ],
      "answer": 0,
      "explain": "`not-found.tsx` — для 404, `global-error.tsx` — для корня."
    }
  ],
  "tasks": []
});
