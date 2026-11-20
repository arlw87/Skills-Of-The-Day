import { useState } from 'react';
import { LESSONS, type Lesson } from '../data/lessons';
import { addDays, fromKey, todayKey } from '../lib/dates';
import { readsByDay, type Progress } from '../lib/progress';
import {
  BarsIcon, BookIcon, CheckIcon, ClockIcon, CopyIcon, EditIcon, LayersIcon,
  PlusIcon, PulseIcon, ShareIcon, TargetIcon,
} from './Icons';

/* ---------------------------------------------------------------- Side rail */

export function SideRail({ onSurprise, onShare }: { onSurprise: () => void; onShare: () => void }) {
  return (
    <div className="side-rail">
      <div className="rail-pill">
        <button className="icon-btn ghost" aria-label="Random lesson" title="Random lesson" onClick={onSurprise}>
          <PlusIcon />
        </button>
      </div>
      <button className="icon-btn soft lg" aria-label="Copy link to this lesson" title="Copy link" onClick={onShare}>
        <ShareIcon width={18} height={18} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- Lesson card */

interface LessonCardProps {
  lesson: Lesson;
  isRead: boolean;
  onToggleRead: () => void;
  onCopyCode: () => void;
  onTopic: (topic: Lesson['topic']) => void;
}

export function LessonCard({ lesson, isRead, onToggleRead, onCopyCode, onTopic }: LessonCardProps) {
  const index = LESSONS.indexOf(lesson) + 1;
  return (
    <article className="card lesson-card">
      <div className="card-inner">
        <div className="row-between">
          <span className="brand-mark">
            REACT<em>/{lesson.since.startsWith('Compiler') ? 'compiler' : lesson.since}</em>
          </span>
          <button className="chip" onClick={() => onTopic(lesson.topic)} title="Show lessons in this topic">
            {lesson.topic} <span className="chip-caret">▾</span>
          </button>
        </div>
        <p className="muted small mt-l">Lesson {index} of {LESSONS.length}</p>
        <h2 className="lesson-title">{lesson.title}</h2>
        <div className="btn-row">
          <button className={`btn ${isRead ? 'btn-done' : 'btn-dark'}`} onClick={onToggleRead} aria-pressed={isRead}>
            {isRead ? (<><CheckIcon width={16} height={16} /> Read</>) : 'Mark as read'}
          </button>
          <button className="btn btn-light" onClick={onCopyCode}>
            <CopyIcon width={15} height={15} /> Copy code
          </button>
        </div>
      </div>
      <div className="card-foot">
        <div>
          <p className="muted small">Reading time</p>
          <p className="figure"><span className="accent">~</span>{lesson.minutes} min</p>
        </div>
        <a className="link-accent" href="#deep-dive">
          <span className="link-icon"><EditIcon width={12} height={12} /></span>
          <span>Read the<br />full lesson</span>
        </a>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- Stats card */

type Period = 'all' | 'week' | 'month';
const PERIOD_LABEL: Record<Period, string> = { all: 'All time', week: 'Weekly', month: 'Monthly' };

function inPeriod(day: string, period: Period) {
  if (period === 'all') return true;
  return day > addDays(todayKey(), period === 'week' ? -7 : -30);
}

function PeriodSelect({ value, onChange, label }: { value: Period; onChange: (p: Period) => void; label: string }) {
  return (
    <label className="chip select-chip">
      <span className="visually-hidden">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value as Period)}>
        {Object.entries(PERIOD_LABEL).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <span className="chip-caret">▾</span>
    </label>
  );
}

export function StatsCard({ progress, onOpenLibrary }: { progress: Progress; onOpenLibrary: () => void }) {
  const [readPeriod, setReadPeriod] = useState<Period>('week');
  const [quizPeriod, setQuizPeriod] = useState<Period>('all');

  const readCount = Object.values(progress.read).filter(d => inPeriod(d, readPeriod)).length;
  const minutes = LESSONS.filter(l => progress.read[l.id] && inPeriod(progress.read[l.id], readPeriod))
    .reduce((s, l) => s + l.minutes, 0);

  // Quiz answers aren't dated; for a period we count lessons read in that period.
  const quizIds = Object.keys(progress.quiz).filter(
    id => quizPeriod === 'all' || (progress.read[id] && inPeriod(progress.read[id], quizPeriod)),
  );
  const correct = quizIds.filter(id => progress.quiz[id]).length;
  const accuracy = quizIds.length ? Math.round((correct / quizIds.length) * 100) : 0;

  return (
    <article className="card stats-card">
      <div className="card-inner">
        <div className="row-between">
          <span className="icon-circle"><BookIcon width={18} height={18} /></span>
          <PeriodSelect value={readPeriod} onChange={setReadPeriod} label="Reading period" />
        </div>
        <p className="muted small mt-m">Lessons read</p>
        <p className="figure">
          <span className="accent">#</span>{readCount}
          <span className="unit">· {minutes} min</span>
        </p>
      </div>
      <div className="card-foot stacked">
        <div className="row-between">
          <span className="icon-circle white"><TargetIcon width={18} height={18} /></span>
          <PeriodSelect value={quizPeriod} onChange={setQuizPeriod} label="Quiz period" />
        </div>
        <div className="row-between end mt-m">
          <div>
            <p className="muted small">Quiz accuracy</p>
            <p className="figure">
              {accuracy}<span className="accent">%</span>
              <span className="unit">· {correct}/{quizIds.length}</span>
            </p>
          </div>
          <button className="link-accent as-button" onClick={onOpenLibrary}>
            <span className="link-icon"><PulseIcon width={12} height={12} /></span>
            <span>View<br />library</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* --------------------------------------------- Difficulty + progress ring */

export function DifficultyBadge({ lesson }: { lesson: Lesson }) {
  const level = { Beginner: 1, Intermediate: 2, Advanced: 3 }[lesson.difficulty];
  return (
    <div className="circle-card" title={`Difficulty: ${lesson.difficulty}`}>
      <span className="level-bars" aria-hidden>
        {[1, 2, 3].map(n => <i key={n} className={n <= level ? 'on' : ''} />)}
      </span>
      <span className="small strong">{lesson.difficulty}</span>
    </div>
  );
}

export function ProgressRing({ progress }: { progress: Progress }) {
  const done = LESSONS.filter(l => progress.read[l.id]).length;
  const pct = Math.round((done / LESSONS.length) * 100);
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-card" role="img" aria-label={`${pct}% of lessons completed`}>
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#3a3a3a" strokeWidth="6"
          strokeDasharray="2 4.2" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray .6s ease' }} />
        <path d="M 106.8 87 A 54 54 0 0 1 13.2 87" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="ring-label">
        <strong>{pct}%</strong>
        <span>Completed</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Streak card */

export function StreakCard({ progress, streak }: { progress: Progress; streak: number }) {
  const days = readsByDay(progress);
  const today = todayKey();
  const cells = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const total = Object.keys(progress.read).length;
  const minutes = LESSONS.filter(l => progress.read[l.id]).reduce((s, l) => s + l.minutes, 0);

  return (
    <article className="card small-card streak-card">
      <span className="icon-circle white"><ClockIcon width={18} height={18} /></span>
      <p className="big-figure">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
      <p className="tiny">{total} lessons, {minutes} minutes</p>
      <div className="dot-grid" role="img" aria-label="Lessons read over the last 30 days">
        {cells.map(d => (
          <i
            key={d}
            className={days.has(d) ? 'on' : d === today ? 'today' : ''}
            title={`${fromKey(d).toLocaleDateString()}: ${days.get(d) ?? 0} read`}
          />
        ))}
      </div>
    </article>
  );
}

/* ----------------------------------------------------------- Version card */

const VERSIONS = ['16.8', '18', '19', '19.2', 'Compiler 1.0'];

export function VersionCard({ lesson }: { lesson: Lesson }) {
  const idx = Math.max(0, VERSIONS.indexOf(lesson.since));
  const prev = idx > 0 ? idx - 1 : null;
  const xFor = (i: number) => 18 + (i / (VERSIONS.length - 1)) * 64; // %
  const short = (v: string) => (v.startsWith('Compiler') ? 'RC 1.0' : v);
  return (
    <article className="card small-card version-card" aria-label={`Introduced in React ${lesson.since}`}>
      <div className="grid-bg" aria-hidden />
      <span className="icon-circle white"><BarsIcon width={18} height={18} /></span>
      {prev !== null && (
        <div className="flag grey" style={{ left: `${xFor(prev)}%`, top: '50%' }}>
          <span>{short(VERSIONS[prev])}</span>
        </div>
      )}
      <div className="flag accent-flag" style={{ left: `${xFor(idx)}%`, top: '30%' }}>
        <span>{short(VERSIONS[idx])}</span>
      </div>
      <p className="version-caption tiny">Introduced in</p>
    </article>
  );
}

/* ---------------------------------------------------------- Activity card */

function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i, arr) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return `${d} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, '');
}

export function ActivityCard({ progress }: { progress: Progress }) {
  const days = readsByDay(progress);
  const today = todayKey();
  const series = Array.from({ length: 21 }, (_, i) => days.get(addDays(today, i - 20)) ?? 0);
  const thisWeek = series.slice(-7).reduce((a, b) => a + b, 0);
  const lastWeek = series.slice(-14, -7).reduce((a, b) => a + b, 0);
  const delta = thisWeek - lastWeek;
  const max = Math.max(2, ...series);

  // Gentle baseline wobble so an empty chart still looks alive.
  const pts: [number, number][] = series.map((v, i) => [
    (i / (series.length - 1)) * 300,
    44 - (v / max) * 32 + Math.sin(i * 1.7) * 2.5,
  ]);
  const split = 14 / 20; // where "this week" starts

  return (
    <article className="card activity-card">
      <div className="row-between">
        <span className="icon-circle white"><LayersIcon width={18} height={18} /></span>
        <p className="figure"><span className="accent">#</span>{thisWeek} <span className="unit">this week</span></p>
      </div>
      <svg className="spark" viewBox="0 0 300 52" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="spark-grad" x1="0" x2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".25" />
            <stop offset={split} stopColor="var(--accent)" stopOpacity=".45" />
            <stop offset={split} stopColor="var(--accent)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d={smoothPath(pts)} fill="none" stroke="url(#spark-grad)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="row-between end">
        <div>
          <h3 className="card-title">Weekly activity</h3>
          <p className="tiny">Lessons read, last 3 weeks</p>
        </div>
        <span className={`chip delta ${delta < 0 ? 'down' : ''}`}>{delta >= 0 ? '+' : '−'} {Math.abs(delta)} vs last wk</span>
      </div>
    </article>
  );
}
