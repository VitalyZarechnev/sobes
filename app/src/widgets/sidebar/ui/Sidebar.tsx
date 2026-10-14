import { AVAILABLE_SECTIONS, pageHref, SECTION_TOPICS, sectionHref, sectionPages } from '@/entities/content';
import { pageCounter, pagesCounter, useProgressState } from '@/entities/progress';
import { buildHref, percent, type Route } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

interface SidebarProps {
  readonly route: Route;
  readonly open: boolean;
  readonly onNavigate: () => void;
}

const NAV = [
  { path: '/', label: '🏠 Главная' },
  { path: '/p/ROADMAP', label: '🗺 Роадмап' },
  { path: '/journal', label: '📓 Дневник' },
  { path: '/quizzes', label: '🧪 Тесты и экзамен' },
  { path: '/algo', label: '🧮 Задачи на алгоритмы' },
  { path: '/p/COVERAGE', label: '✅ Карта покрытия тем' },
  { path: '/search', label: '🔎 Поиск' },
] as const;

const currentSectionId = (route: Route): string | null => {
  const match = /^\/(?:s|p)\/(\d\d-[\w-]+)/.exec(route.path);
  return match?.[1] ?? null;
};

export function Sidebar({ route, open, onNavigate }: SidebarProps) {
  const state = useProgressState();
  const activeSection = currentSectionId(route);

  return (
    <nav className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Навигация по вики" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}>
      <a className="sidebar__brand" href="#/">
        <span className="wip-badge" title="Вики в процессе наполнения">WIP · work in progress</span>
        Frontend Interview Wiki
        <span className="muted">Senior · Lead</span>
      </a>
      <ul className="sidebar__nav">
        {NAV.map((item) => (
          <li key={item.path}>
            <a href={buildHref(item.path)} aria-current={route.path === item.path ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="sidebar__heading">Разделы</p>
      <ul className="sidebar__sections">
        {AVAILABLE_SECTIONS.map((section) => {
          const counter = pagesCounter(sectionPages(section.id), state);
          const isActive = activeSection === section.id;
          return (
            <li key={section.id} className={isActive ? 'is-active' : ''}>
              <a href={sectionHref(section.id)} aria-current={route.path === `/s/${section.id}` ? 'page' : undefined}>
                <span>
                  {section.icon} {section.title}
                </span>
                <span className="muted">{percent(counter.done, counter.total)}%</span>
              </a>
              <ProgressBar done={counter.done} total={counter.total} size="sm" label={`Прогресс раздела ${section.title}`} />
              {isActive && (
                <ul className="sidebar__topics">
                  {(SECTION_TOPICS.get(section.id) ?? []).map((topic) => {
                    const c = pageCounter(topic, state);
                    const done = c.total > 0 && c.done === c.total;
                    return (
                      <li key={topic.id}>
                        <a href={pageHref(topic.id)} aria-current={route.path === `/p/${topic.id}` ? 'page' : undefined}>
                          <span className={done ? 'topic-done' : ''}>{done ? '✓ ' : ''}{topic.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
