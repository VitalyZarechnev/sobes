import type { TaskTest } from '@/entities/quiz';

export interface TestResult {
  readonly name: string;
  readonly passed: boolean;
  readonly error?: string;
}

export type TestEnvironment = 'worker' | 'browser';

interface TestOutcome {
  readonly passed: boolean;
  readonly error?: string;
}

const TIMEOUT_MS = 3000;

const timeoutError = (): string => `Таймаут ${TIMEOUT_MS} мс: возможно, бесконечный цикл`;

const buildSource = (userCode: string, testCode: string): string =>
  `${userCode}\n;return await (async () => {\n${testCode}\n})();`;

const describeValue = (value: unknown): string => `Ожидалось true, получено: ${String(value)}`;

const describeError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const WORKER_SOURCE = `
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
self.onmessage = async (event) => {
  try {
    const value = await new AsyncFunction(event.data)();
    self.postMessage(value === true ? { passed: true } : { passed: false, error: 'Ожидалось true, получено: ' + String(value) });
  } catch (error) {
    self.postMessage({ passed: false, error: error instanceof Error ? error.message : String(error) });
  }
};
`;

let workerUrl: string | null = null;

const getWorkerUrl = (): string => {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
  return workerUrl;
};

const runInWorker = (source: string): Promise<TestOutcome> =>
  new Promise((resolve) => {
    const worker = new Worker(getWorkerUrl());
    const finish = (outcome: TestOutcome): void => {
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };
    const timer = setTimeout(() => finish({ passed: false, error: timeoutError() }), TIMEOUT_MS);
    worker.onmessage = (event: MessageEvent<TestOutcome>) => finish(event.data);
    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault();
      finish({ passed: false, error: event.message || 'Ошибка при выполнении кода' });
    };
    worker.postMessage(source);
  });

type AsyncFn = () => Promise<unknown>;
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (body: string) => AsyncFn;

const runInPage = async (source: string): Promise<TestOutcome> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutError())), TIMEOUT_MS);
    });
    const value = await Promise.race([new AsyncFunction(source)(), timeout]);
    return value === true ? { passed: true } : { passed: false, error: describeValue(value) };
  } catch (error) {
    return { passed: false, error: describeError(error) };
  } finally {
    clearTimeout(timer);
  }
};

const PROBE_TIMEOUT_MS = 1000;

let workerSupport: Promise<boolean> | null = null;

const probeWorker = (): Promise<boolean> =>
  new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch {
      resolve(false);
      return;
    }
    const finish = (supported: boolean): void => {
      clearTimeout(timer);
      worker.terminate();
      resolve(supported);
    };
    const timer = setTimeout(() => finish(false), PROBE_TIMEOUT_MS);
    worker.onmessage = (event: MessageEvent<TestOutcome>) => finish(event.data.passed);
    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault();
      finish(false);
    };
    worker.postMessage('return true;');
  });

const canUseWorker = (): Promise<boolean> => {
  if (typeof Worker === 'undefined') return Promise.resolve(false);
  workerSupport ??= probeWorker();
  return workerSupport;
};

export const runTests = async (
  userCode: string,
  tests: readonly TaskTest[],
  environment: TestEnvironment = 'worker',
): Promise<TestResult[]> => {
  const run = environment === 'worker' && (await canUseWorker()) ? runInWorker : runInPage;
  const results: TestResult[] = [];
  for (const test of tests) {
    const outcome = await run(buildSource(userCode, test.code));
    results.push({ name: test.name, ...outcome });
  }
  return results;
};
