import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/features/theme-toggle';
import { Sidebar } from '@/widgets/sidebar';
import { buildHref, useRoute } from '@/shared/lib';
import { Router } from './Router';

export function App() {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (route.path === '/') document.title = 'Frontend Interview Wiki (WIP)';
  }, [route.path]);

  return (
    <div className="layout">
      <a className="skip-link" href="#main">К содержимому</a>
      <Sidebar route={route} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="layout__main">
        <header className="topbar">
          <button className="btn btn--ghost topbar__menu" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
          <a className="btn btn--ghost" href={buildHref('/search')}>🔎 Поиск</a>
          <ThemeToggle />
        </header>
        <main id="main" tabIndex={-1}>
          <Router route={route} />
        </main>
      </div>
    </div>
  );
}
