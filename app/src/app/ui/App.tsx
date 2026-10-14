import { useEffect, useRef, useState } from 'react';
import { SaveErrorBanner } from '@/entities/progress';
import { ThemeToggle } from '@/features/theme-toggle';
import { Sidebar } from '@/widgets/sidebar';
import { routes } from '@/shared/config';
import { useRoute } from '@/shared/lib';
import { resolveRoute } from '../routing/routeTable';
import { useDocumentTitle, useNavigationFocus } from '../routing/useNavigationEffects';

export function App() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { element, title } = resolveRoute(route);

  useDocumentTitle(title);
  useNavigationFocus(route, mainRef);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <div className="layout">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        К содержимому
      </a>
      <Sidebar route={route} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="layout__main">
        <header className="topbar">
          <button ref={menuButtonRef} className="btn btn--ghost topbar__menu" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
          <a className="btn btn--ghost" href={routes.search()}>🔎 Поиск</a>
          <ThemeToggle />
        </header>
        <main id="main" ref={mainRef} tabIndex={-1}>
          <SaveErrorBanner />
          {element}
        </main>
      </div>
    </div>
  );
}
