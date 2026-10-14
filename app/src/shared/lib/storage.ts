
export const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown): boolean => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const readString = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeString = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
};
