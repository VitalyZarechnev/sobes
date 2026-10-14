import type { TaskTest } from '@/entities/quiz';

export interface TestResult {
  readonly name: string;
  readonly passed: boolean;
  readonly error?: string;
}

const TIMEOUT_MS = 3000;

type AsyncFn = () => Promise<unknown>;
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (body: string) => AsyncFn;

const runOne = async (userCode: string, test: TaskTest): Promise<TestResult> => {
  try {
    const fn = new AsyncFunction(`${userCode}\n;return await (async () => {\n${test.code}\n})();`);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Таймаут ${TIMEOUT_MS} мс`)), TIMEOUT_MS);
    });
    const value = await Promise.race([fn(), timeout]).finally(() => clearTimeout(timer));
    return value === true
      ? { name: test.name, passed: true }
      : { name: test.name, passed: false, error: `Ожидалось true, получено: ${String(value)}` };
  } catch (error) {
    return { name: test.name, passed: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export const runTests = async (userCode: string, tests: readonly TaskTest[]): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  for (const test of tests) results.push(await runOne(userCode, test));
  return results;
};
