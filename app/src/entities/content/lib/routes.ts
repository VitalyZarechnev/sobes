import { resolveLink } from './resolveLink';
import { buildHref } from '@/shared/lib';

export const pageHref = (pageId: string, anchor?: string | null): string => {
  const match = /^([\w-]+)\/README$/.exec(pageId);
  const path = match ? `/s/${match[1]}` : `/p/${pageId}`;
  return buildHref(path, undefined, anchor ?? undefined);
};

export const sectionHref = (sectionId: string): string => buildHref(`/s/${sectionId}`);
export const quizHref = (quizId: string): string => buildHref(`/quiz/${quizId}`);

export const contentUrl = (fromPageId: string, href: string): string => {
  const link = resolveLink(fromPageId, href);
  switch (link.kind) {
    case 'page':
      return pageHref(link.pageId, link.anchor);
    case 'anchor':
      return pageHref(fromPageId, link.anchor);
    case 'quiz':
      return quizHref(link.quizId);
    case 'quizzes':
      return buildHref('/quizzes');
    case 'file':
      return link.path;
    case 'route':
    case 'external':
      return link.href;
  }
};

export const quizUrlTransform = (url: string): string => contentUrl('quizzes/quiz', url);
