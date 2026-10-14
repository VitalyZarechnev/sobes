import { useSyncExternalStore } from 'react';

export interface Route {
  readonly path: string;
  readonly query: URLSearchParams;
  readonly anchor: string | null;
  readonly replaced: boolean;
}

type ParamNames<P extends string> = P extends `${string}:${infer Name}/${infer Rest}`
  ? Name | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}`
    ? Name
    : P extends `${string}*${infer Name}`
      ? Name
      : never;

export type PathParams<P extends string> = { readonly [K in ParamNames<P>]: string };

export interface HrefOptions {
  readonly query?: Readonly<Record<string, string>>;
  readonly anchor?: string | null;
}

const safeDecode = (decode: (value: string) => string, value: string): string => {
  try {
    return decode(value);
  } catch {
    return value;
  }
};

const normalizePath = (path: string): string => {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') || '/' : withSlash;
};

const parseHash = (hash: string, replaced: boolean): Route => {
  const raw = hash.replace(/^#/, '');
  const anchorAt = raw.indexOf('#');
  const beforeAnchor = anchorAt === -1 ? raw : raw.slice(0, anchorAt);
  const anchor = anchorAt === -1 ? '' : raw.slice(anchorAt + 1);
  const queryAt = beforeAnchor.indexOf('?');
  const path = queryAt === -1 ? beforeAnchor : beforeAnchor.slice(0, queryAt);
  const search = queryAt === -1 ? '' : beforeAnchor.slice(queryAt + 1);
  return {
    path: normalizePath(safeDecode(decodeURI, path)),
    query: new URLSearchParams(search),
    anchor: anchor ? safeDecode(decodeURIComponent, anchor) : null,
    replaced,
  };
};

let current = parseHash(window.location.hash, false);
const listeners = new Set<() => void>();

const update = (replaced: boolean): void => {
  current = parseHash(window.location.hash, replaced);
  listeners.forEach((listener) => listener());
};

const onHashChange = (): void => update(false);

const subscribe = (listener: () => void): (() => void) => {
  if (listeners.size === 0) window.addEventListener('hashchange', onHashChange);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('hashchange', onHashChange);
  };
};

const getSnapshot = (): Route => current;

export const useRoute = (): Route => useSyncExternalStore(subscribe, getSnapshot);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface CompiledPattern {
  readonly regexp: RegExp;
  readonly names: readonly string[];
}

const compiled = new Map<string, CompiledPattern>();

const compile = (pattern: string): CompiledPattern => {
  const cached = compiled.get(pattern);
  if (cached) return cached;
  const names: string[] = [];
  const source = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        names.push(segment.slice(1));
        return '([^/]+)';
      }
      if (segment.startsWith('*')) {
        names.push(segment.slice(1));
        return '(.+)';
      }
      return escapeRegExp(segment);
    })
    .join('/');
  const result = { regexp: new RegExp(`^${source}$`), names };
  compiled.set(pattern, result);
  return result;
};

export const matchPath = <P extends string>(pattern: P, path: string): PathParams<P> | null => {
  const { regexp, names } = compile(pattern);
  const match = regexp.exec(path);
  if (!match) return null;
  return Object.fromEntries(names.map((name, i) => [name, match[i + 1] ?? ''])) as PathParams<P>;
};

export const buildPath = <P extends string>(pattern: P, params: PathParams<P>): string => {
  const values = params as Readonly<Record<string, string>>;
  return pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) return encodeURIComponent(values[segment.slice(1)] ?? '');
      if (segment.startsWith('*')) return encodeURI(values[segment.slice(1)] ?? '');
      return segment;
    })
    .join('/');
};

export const toHref = (path: string, { query, anchor }: HrefOptions = {}): string => {
  const search = query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query)}` : '';
  return `#${path}${search}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
};

export const navigate = (href: string, { replace = false }: { readonly replace?: boolean } = {}): void => {
  if (!replace) {
    window.location.hash = href.replace(/^#/, '');
    return;
  }
  window.history.replaceState(window.history.state, '', href.startsWith('#') ? href : `#${href}`);
  update(true);
};
