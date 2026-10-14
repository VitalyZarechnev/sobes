export const QUESTION_ID_PREFIX = 'q';
export const TASK_ID_PREFIX = 't';

export const EXPLICIT_ID_PATTERN = /^(?!\d+$)[\w-]+$/;

const cyrb53 = (text: string): string => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

interface QuestionIdentity {
  readonly id?: string;
  readonly type: string;
  readonly q: string;
  readonly code?: string;
}

interface TaskIdentity {
  readonly id?: string;
  readonly title: string;
}

export const questionContentKey = ({ type, q, code }: QuestionIdentity): string => [type, q, code ?? ''].join('\u0000');

export const questionId = (question: QuestionIdentity): string =>
  question.id ?? `${QUESTION_ID_PREFIX}${cyrb53(questionContentKey(question))}`;

export const taskId = (task: TaskIdentity): string => task.id ?? `${TASK_ID_PREFIX}${cyrb53(task.title)}`;

export const isLegacyIndexKey = (key: string): boolean => /^\d+$/.test(key);
