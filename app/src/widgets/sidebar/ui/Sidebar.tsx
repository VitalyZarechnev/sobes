import { AVAILABLE_SECTIONS, pageHref, SECTION_TOPICS, sectionPages } from '@/entities/content';
import { pageCounter, pagesCounter, useProgressState } from '@/entities/progress';
import { PATHS, routes } from '@/shared/config';
import { matchPath, percent, toHref, type Route } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

interface SidebarProps {
  readonly route: Route;
  readonly open: boolean;
  readonly onNavigate: () => void;
}

const NAV = [
  { href: routes.home(), label: '🏠 Главная' },
  { href: pageHref('ROADMAP'), label: '🗺 Роадмап' },
  { href: routes.journal(), label: '📓 Дневник' },
  { href: routes.quizzes(), label: '🧪 Тесты и экзамен' },
  { href: routes.algo(), label: '🧮 Задачи на алгоритмы' },
  { href: pageHref('COVERAGE'), label: '✅ Карта покрытия тем' },
  { href: routes.search(), label: '🔎 Поиск' },
] as const;

const currentSectionId = (route: Route): string | null =>
  matchPath(PATHS.section, route.path)?.sectionId ?? matchPath(PATHS.topic, route.path)?.pageId.split('/')[0] ?? null;

export function Sidebar({ route, open, onNavigate }: SidebarProps) {
  const state = useProgressState();
  const activeSection = currentSectionId(route);
  const currentHref = toHref(route.path);
  const ariaCurrent = (href: string) => (href === currentHref ? 'page' : undefined);

  return (
    <nav className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Навигация по вики" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}>
      <a className="sidebar__brand" href={routes.home()}>
        <span className="wip-badge" title="Вики в процессе наполнения">WIP · work in progress</span>
        Frontend Interview Wiki
        <span className="muted">Senior · Lead</span>
      </a>
      <ul className="sidebar__nav">
        {NAV.map((item) => (
          <li key={item.href}>
            <a href={item.href} aria-current={ariaCurrent(item.href)}>
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
              <a href={routes.section(section.id)} aria-current={ariaCurrent(routes.section(section.id))}>
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
                        <a href={pageHref(topic.id)} aria-current={ariaCurrent(pageHref(topic.id))}>
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
