import { useSyncExternalStore } from 'react';
import { addDays, todayKey } from './dates';

/**
 * Learner progress, persisted to localStorage and exposed through
 * useSyncExternalStore (one of the lessons in this very app!).
 */
export interface Progress {
  /** lessonId → date key it was marked read */
  read: Record<string, string>;
  /** lessonId → answered correctly on first try */
  quiz: Record<string, boolean>;
  /** lessonId → understanding rating 1..5 */
  ratings: Record<string, number>;
}

const STORAGE_KEY = 'skills-of-the-day:progress:v1';
const EMPTY: Progress = { read: {}, quiz: {}, ratings: {} };

let state: Progress = load();
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { read: parsed.read ?? {}, quiz: parsed.quiz ?? {}, ratings: parsed.ratings ?? {} };
  } catch {
    return EMPTY;
  }
}

function update(fn: (p: Progress) => Progress) {
  state = fn(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode) – keep in memory */
  }
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export const progressActions = {
  toggleRead(id: string) {
    update(p => {
      const read = { ...p.read };
      if (read[id]) delete read[id];
      else read[id] = todayKey();
      return { ...p, read };
    });
  },
  answerQuiz(id: string, correct: boolean) {
    update(p => (id in p.quiz ? p : { ...p, quiz: { ...p.quiz, [id]: correct } }));
  },
  rate(id: string, rating: number) {
    update(p => ({ ...p, ratings: { ...p.ratings, [id]: rating } }));
  },
  reset() {
    update(() => EMPTY);
  },
};

/** Number of lessons read per day, keyed by date. */
export function readsByDay(p: Progress): Map<string, number> {
  const map = new Map<string, number>();
  for (const day of Object.values(p.read)) map.set(day, (map.get(day) ?? 0) + 1);
  return map;
}

/** Consecutive days (ending today, or yesterday if today isn't done yet) with ≥1 lesson read. */
export function currentStreak(p: Progress): number {
  const days = readsByDay(p);
  let cursor = todayKey();
  if (!days.has(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
