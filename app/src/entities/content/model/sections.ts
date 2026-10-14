export interface Section {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly audience: string;
}

export const SECTIONS: readonly Section[] = [
  { id: '01-javascript', title: 'JavaScript', icon: '🟨', audience: 'Все' },
  { id: '02-typescript', title: 'TypeScript', icon: '🔷', audience: 'Все' },
  { id: '03-react', title: 'React и Next.js', icon: '⚛️', audience: 'Все' },
  { id: '04-vue', title: 'Vue и Nuxt', icon: '🟩', audience: 'Все' },
  { id: '06-web-platform', title: 'Вёрстка, браузер, сеть', icon: '🌐', audience: 'Все' },
  { id: '10-tooling-testing', title: 'Сборка, тесты, DevOps', icon: '🛠', audience: 'Все' },
  { id: '05-architecture', title: 'Архитектура', icon: '🏛', audience: 'Senior, Lead' },
  { id: '13-algorithms', title: 'Алгоритмы и структуры данных', icon: '🧮', audience: 'Все' },
  { id: '14-design-systems', title: 'Дизайн-системы и UI-kit', icon: '🎨', audience: 'Senior, Lead' },
  { id: '15-production', title: 'Продакшн-фронтенд', icon: '📈', audience: 'Senior, Lead' },
  { id: '16-forms-i18n-auth', title: 'Формы, i18n, auth', icon: '🔐', audience: 'Все' },
  { id: '17-debugging-git-team', title: 'Отладка, git, командная работа', icon: '🧰', audience: 'Все' },
  { id: '07-lead', title: 'Lead-компетенции', icon: '🧭', audience: 'Lead' },
  { id: '08-ai', title: 'AI и агенты', icon: '🤖', audience: 'Все' },
  { id: '11-graphics', title: 'Canvas, 2D и 3D графика', icon: '🎮', audience: 'Все' },
  { id: '09-final', title: 'Финальная подготовка', icon: '🏁', audience: 'Все' },
];

export const ROOT_PAGES = {
  roadmap: 'ROADMAP',
  coverage: 'COVERAGE',
  readme: 'README',
} as const;
