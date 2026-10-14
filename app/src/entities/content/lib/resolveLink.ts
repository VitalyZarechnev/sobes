export type ResolvedLink =
  | { readonly kind: 'page'; readonly pageId: string; readonly anchor: string | null }
  | { readonly kind: 'quiz'; readonly quizId: string }
  | { readonly kind: 'quizzes' }
  | { readonly kind: 'anchor'; readonly anchor: string }
  | { readonly kind: 'route'; readonly href: string }
  | { readonly kind: 'file'; readonly path: string }
  | { readonly kind: 'external'; readonly href: string };

const dirname = (path: string): string => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '');

const joinPath = (base: string, relative: string): string => {
  const parts = [...(base ? base.split('/') : []), ...relative.split('/')];
  const out: string[] = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
};

export const resolveLink = (fromPageId: string, href: string): ResolvedLink => {
  if (/^(https?:|mailto:)/.test(href)) return { kind: 'external', href };
  if (href.startsWith('#/')) return { kind: 'route', href };
  if (href.startsWith('#')) return { kind: 'anchor', anchor: decodeURIComponent(href.slice(1)) };

  const [pathPart = '', anchorPart] = href.split('#');
  const [filePart = '', query = ''] = pathPart.split('?');
  const target = joinPath(dirname(fromPageId), decodeURI(filePart));
  const anchor = anchorPart ? decodeURIComponent(anchorPart) : null;

  if (target === 'quizzes/quiz.html') {
    const id = new URLSearchParams(query).get('id');
    return id ? { kind: 'quiz', quizId: id } : { kind: 'quizzes' };
  }
  if (target === 'quizzes/index.html' || target === 'quizzes') return { kind: 'quizzes' };
  if (target.endsWith('.md')) return { kind: 'page', pageId: target.replace(/\.md$/, ''), anchor };
  if (/^\d\d-[\w-]+$/.test(target)) return { kind: 'page', pageId: `${target}/README`, anchor };
  return { kind: 'file', path: target };
};
