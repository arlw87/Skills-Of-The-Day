import { useRef } from 'react';
import type { Lesson } from '../data/lessons';
import { fromKey, todayKey } from '../lib/dates';
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, ShuffleIcon } from './Icons';

interface Props {
  dateKey: string;
  lesson: Lesson;
  isOverride: boolean;
  isRead: boolean;
  onDate: (key: string) => void;
  onShift: (days: number) => void;
  onToday: () => void;
  onSurprise: () => void;
}

export function Hero({ dateKey, lesson, isOverride, isRead, onDate, onShift, onToday, onSurprise }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const date = fromKey(dateKey);
  const isToday = dateKey === todayKey() && !isOverride;
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  const month = date.toLocaleDateString(undefined, { month: 'long' });

  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click();
    }
  }

  return (
    <section className="hero">
      <div className="hero-date">
        <div className="day-circle">{date.getDate()}</div>
        <div className="day-meta">
          <span>{weekday},</span>
          <span>{month}</span>
        </div>
        <div className="day-nav">
          <button className="mini-btn" aria-label="Previous day" onClick={() => onShift(-1)}>
            <ChevronLeft width={16} height={16} />
          </button>
          <button className="mini-btn" aria-label="Next day" onClick={() => onShift(1)}>
            <ChevronRight width={16} height={16} />
          </button>
        </div>
        <span className="divider" />
        <button className="pill-btn accent" onClick={onToday}>
          {isToday ? "Today's lesson" : 'Back to today'}
          <ArrowRight width={18} height={18} />
        </button>
        <button className="icon-btn outline lg cal-btn" aria-label="Pick a date" onClick={openPicker}>
          <CalendarIcon />
          {!isRead && <span className="notify-dot" aria-hidden />}
        </button>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="date"
          tabIndex={-1}
          aria-hidden
          value={dateKey}
          onChange={e => e.target.value && onDate(e.target.value)}
        />
      </div>

      <div className="hero-ask">
        <div>
          <h1>
            {isToday ? 'Hey, ready to learn?' : isOverride ? 'Exploring the library' : 'Lesson for this day'}
            <span className="wave" aria-hidden>👋</span>
          </h1>
          <p className="typed" key={lesson.id}>
            <span className="caret" aria-hidden />
            {lesson.title}
          </p>
        </div>
        <button className="icon-btn white xl" aria-label="Surprise me with a random lesson" title="Surprise me" onClick={onSurprise}>
          <ShuffleIcon width={22} height={22} />
        </button>
      </div>
    </section>
  );
}
