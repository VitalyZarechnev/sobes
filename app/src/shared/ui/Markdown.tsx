import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { withHardBreaks } from '@/shared/lib';
import { highlightOptions } from './markdownPlugins';

interface InlineMarkdownProps {
  readonly text: string;
  readonly className?: string;
  readonly urlTransform?: (url: string) => string;
}

export function InlineMarkdown({ text, className, urlTransform }: InlineMarkdownProps) {
  return (
    <div className={`md-inline ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, highlightOptions]]} urlTransform={(url) => defaultUrlTransform(urlTransform ? urlTransform(url) : url)}>
        {withHardBreaks(text)}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  readonly code: string;
  readonly lang?: string;
}

export function CodeBlock({ code, lang = 'js' }: CodeBlockProps) {
  return <InlineMarkdown text={`\`\`\`${lang}\n${code}\n\`\`\``} />;
}
