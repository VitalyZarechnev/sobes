import { resolveLink, type ResolvedLink } from './resolveLink';
import { routes } from '@/shared/config';

export const pageHref = (pageId: string, anchor?: string | null): string => {
  const match = /^([\w-]+)\/README$/.exec(pageId);
  return match?.[1] ? routes.section(match[1], anchor) : routes.topic(pageId, anchor);
};

export const linkUrl = (fromPageId: string, link: ResolvedLink): string => {
  switch (link.kind) {
    case 'page':
      return pageHref(link.pageId, link.anchor);
    case 'anchor':
      return pageHref(fromPageId, link.anchor);
    case 'quiz':
      return routes.quiz(link.quizId);
    case 'quizzes':
      return routes.quizzes();
    case 'file':
      return link.path;
    case 'route':
    case 'external':
      return link.href;
  }
};

export const opensInNewTab = (link: ResolvedLink): boolean => link.kind === 'external' || link.kind === 'file';

export const contentUrl = (fromPageId: string, href: string): string => linkUrl(fromPageId, resolveLink(fromPageId, href));

export const quizUrlTransform = (url: string): string => contentUrl('quizzes/quiz', url);
