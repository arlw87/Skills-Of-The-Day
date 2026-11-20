import { LESSONS, type Lesson } from '../data/lessons';

const DAY_MS = 86_400_000;

/** Local calendar date as YYYY-MM-DD. */
export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function todayKey(): string {
  return toKey(new Date());
}

/** Whole days since 1970-01-01 for a local date key (DST-safe via UTC). */
function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

/**
 * Deterministic lesson for a date: everyone sees the same lesson on the same
 * day, and the cycle walks through every lesson before repeating. A fixed
 * multiplier coprime with the lesson count shuffles topics so consecutive
 * days don't feel samey.
 */
export function lessonIndexForDate(key: string): number {
  const n = LESSONS.length;
  let step = 7;
  while (gcd(step, n) !== 1) step++;
  return (((dayNumber(key) * step) % n) + n) % n;
}

export function lessonForDate(key: string): Lesson {
  return LESSONS[lessonIndexForDate(key)];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
