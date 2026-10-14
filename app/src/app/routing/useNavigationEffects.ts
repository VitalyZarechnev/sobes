import { useEffect, useRef, type RefObject } from 'react';
import type { Route } from '@/shared/lib';

const APP_TITLE = 'Frontend Interview Wiki (WIP)';

export const useDocumentTitle = (title: string | null): void => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
  }, [title]);
};

export const useNavigationFocus = (route: Route, mainRef: RefObject<HTMLElement | null>): void => {
  const isFirstRender = useRef(true);
  const locationKey = `${route.path}?${route.query.toString()}`;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (route.replaced) return;
    if (!route.anchor) window.scrollTo({ top: 0 });
    const main = mainRef.current;
    if (main && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
  }, [locationKey]);
};
