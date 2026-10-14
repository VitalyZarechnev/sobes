import type { Element, ElementContent } from 'hast';

export const ownText = (node: Element | ElementContent): string => {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element') return '';
  if (node.tagName === 'ul' || node.tagName === 'ol' || node.tagName === 'input') return '';
  return node.children.map(ownText).join('');
};

export const firstHref = (node: Element | ElementContent): string | null => {
  if (node.type !== 'element' || node.tagName === 'ul' || node.tagName === 'ol') return null;
  if (node.tagName === 'a' && typeof node.properties.href === 'string') return node.properties.href;
  for (const child of node.children) {
    const href = firstHref(child);
    if (href) return href;
  }
  return null;
};
