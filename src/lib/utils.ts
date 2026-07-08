import { MONTHS_ES } from './constants';

/** Formats a number as "US$ 18.420" using Argentine locale */
export function fmt(n: number): string {
  return 'US$ ' + Math.round(n).toLocaleString('es-AR');
}

/** Formats a number as a percentage string, e.g. "84%" */
export function fmtPct(n: number): string {
  return Math.round(n) + '%';
}

/** Returns signed trend percentage between two values */
export function calcTrend(current: number, prev: number): number {
  if (prev === 0) return 0;
  return ((current - prev) / prev) * 100;
}

/** Converts a billing_period date string ("2026-06-01") to short month label ("Jun") */
export function periodToMonth(period: string): string {
  const month = parseInt(period.slice(5, 7), 10);
  return MONTHS_ES[month - 1] ?? period;
}

/** Returns how many days have elapsed so far in the current month (1-based) */
export function daysElapsedThisMonth(): number {
  const now = new Date();
  return now.getDate();
}

/** Returns the total number of days in the current month */
export function daysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Projects end-of-month spend based on current spend and days elapsed */
export function projectEndOfMonth(currentSpend: number): number {
  const elapsed = daysElapsedThisMonth();
  const total = daysInCurrentMonth();
  if (elapsed === 0) return currentSpend;
  return (currentSpend / elapsed) * total;
}
