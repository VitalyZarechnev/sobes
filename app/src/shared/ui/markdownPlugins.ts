import type { Options as HighlightOptions } from 'rehype-highlight';

export const highlightOptions: HighlightOptions = {
  detect: false,
  aliases: { xml: ['vue', 'svelte'], typescript: ['tsx', 'mts'], plaintext: ['text', 'txt', 'mermaid'] },
};
