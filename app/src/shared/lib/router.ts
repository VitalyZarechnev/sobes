import { useSyncExternalStore } from 'react';

export interface Route {
  readonly path: string;
  readonly query: URLSearchParams;
  readonly anchor: string | null;
}

const parse = (hash: string): Route => {
  const raw = hash.replace(/^#/, '') || '/';
  const [beforeAnchor = '/', anchor = null] = raw.split('#');
  const [path = '/', search = ''] = beforeAnchor.split('?');
  return { path: decodeURI(path), query: new URLSearchParams(search), anchor: anchor ? decodeURIComponent(anchor) : null };
};

let current = parse(window.location.hash);

const subscribe = (onChange: () => void): (() => void) => {
  const handler = () => {
    current = parse(window.location.hash);
    onChange();
  };
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
};

export const useRoute = (): Route => useSyncExternalStore(subscribe, () => current);

export const buildHref = (path: string, query?: Record<string, string>, anchor?: string): string => {
  const search = query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : '';
  return `#${path}${search}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
};

export const navigate = (path: string, query?: Record<string, string>): void => {
  window.location.hash = buildHref(path, query).slice(1);
};
