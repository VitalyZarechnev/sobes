import { readString, writeString } from '@/shared/lib';

const KEY = 'fe-interview-wiki:last-page';

export const rememberLastPage = (pageId: string): void => writeString(KEY, pageId);
export const readLastPage = (): string | null => readString(KEY);
