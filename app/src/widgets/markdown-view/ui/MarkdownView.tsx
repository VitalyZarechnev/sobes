import { useEffect, useMemo, type ComponentProps, type ReactNode } from 'react';
import type { Element } from 'hast';
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { checklistKey, getPage, linkUrl, opensInNewTab, resolveLink, type Page } from '@/entities/content';
import { pageCounter, progressActions, useProgressState } from '@/entities/progress';
import { highlightOptions, ProgressBar } from '@/shared/ui';
import { firstHref, ownText } from '../lib/hast';

interface MarkdownViewProps {
  readonly page: Page;
  readonly anchor: string | null;
}

export function MarkdownView({ page, anchor }: MarkdownViewProps) {
  useEffect(() => {
    if (!anchor) return;
    const target = document.getElementById(anchor) ?? document.getElementById(anchor.toLowerCase());
    target?.scrollIntoView({ block: 'start' });
  }, [page.id, anchor]);

  const components = useMemo<Components>(() => {
    const Link = ({ href = '', children, node: _node, ...rest }: ComponentProps<'a'> & ExtraProps) => {
      const link = resolveLink(page.id, href);
      const newTab = opensInNewTab(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      return <a {...rest} {...newTab} href={linkUrl(page.id, link)}>{children}</a>;
    };

    const ListItem = ({ children, node, className, ...rest }: ComponentProps<'li'> & ExtraProps) => {
      if (!node || !className?.includes('task-list-item')) {
        return <li className={className} {...rest}>{children}</li>;
      }
      return <TaskListItem pageId={page.id} node={node} liProps={rest}>{children}</TaskListItem>;
    };

    const Input = ({ node: _node, ...props }: ComponentProps<'input'> & ExtraProps) =>
      props.type === 'checkbox' ? null : <input {...props} />;

    const Table = ({ node: _node, ...props }: ComponentProps<'table'> & ExtraProps) => (
      <div className="table-wrap">
        <table {...props} />
      </div>
    );

    return { a: Link, li: ListItem, input: Input, table: Table };
  }, [page.id]);

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, [rehypeHighlight, highlightOptions]]}
        components={components}
      >
        {page.raw}
      </ReactMarkdown>
    </div>
  );
}

interface TaskListItemProps {
  readonly pageId: string;
  readonly node: Element;
  readonly liProps: ComponentProps<'li'>;
  readonly children: ReactNode;
}

function TaskListItem({ pageId, node, liProps, children }: TaskListItemProps) {
  const state = useProgressState();
  const text = ownText(node).trim();
  const key = checklistKey(pageId, text);
  const href = firstHref(node);
  const linked = href ? resolveLink(pageId, href) : null;
  const linkedPage = linked?.kind === 'page' ? getPage(linked.pageId) : undefined;
  const counter = linkedPage && linkedPage.id !== pageId ? pageCounter(linkedPage, state) : null;
  const checked = Boolean(state.checks[key]);

  return (
    <li {...liProps} className={`task-item ${checked ? 'task-item--done' : ''}`}>
      <input
        className="task-item__check"
        type="checkbox"
        checked={checked}
        onChange={() => progressActions.toggleCheck(key)}
        aria-label={text}
      />
      <div className="task-item__body">
        {children}
        {counter && counter.total > 0 && (
          <span className="task-item__progress" title="Прогресс по чек-листу темы">
            <ProgressBar done={counter.done} total={counter.total} size="sm" />
            <span className="muted">
              {counter.done}/{counter.total}
            </span>
          </span>
        )}
      </div>
    </li>
  );
}
