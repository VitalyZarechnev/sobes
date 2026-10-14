import { useMemo } from 'react';
import { pageHref, SECTIONS } from '@/entities/content';
import { searchPages } from '@/features/search';
import { routes } from '@/shared/config';
import { navigate } from '@/shared/lib';

export function SearchPage({ query }: { readonly query: string }) {
  const hits = useMemo(() => searchPages(query), [query]);
  return (
    <div className="page">
      <h1>🔎 Поиск</h1>
      <input
        className="search-input"
        type="search"
        autoFocus
        defaultValue={query}
        placeholder="Например: замыкание, useEffect, FSD, CORS"
        aria-label="Поисковый запрос"
        onChange={(e) => navigate(routes.search(e.target.value), { replace: true })}
      />
      {query.trim().length > 1 && <p className="muted">Найдено страниц: {hits.length}</p>}
      <ul className="search-results">
        {hits.map(({ page, snippet }) => {
          const section = SECTIONS.find((s) => s.id === page.sectionId);
          return (
            <li key={page.id}>
              <a href={pageHref(page.id)}>{page.title}</a>
              {section && <span className="muted"> · {section.title}</span>}
              <p className="muted">…{snippet}…</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
