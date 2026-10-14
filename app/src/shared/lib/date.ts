const pad = (value: number): string => String(value).padStart(2, '0');

export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseLocalDateKey = (key: string): Date => {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const shiftDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
