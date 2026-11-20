import { useId, useState } from 'react';
import { LESSONS, TOPICS, type Lesson, type Topic } from '../data/lessons';
import { highlight, inlineCode } from '../lib/highlight';
import { progressActions, type Progress } from '../lib/progress';
import { CheckIcon, CloseIcon, CopyIcon, ExpandIcon, Sunburst } from './Icons';

/* ------------------------------------------------- Topics (concentric) */

export function MasteryCard({ progress }: { progress: Progress }) {
  const [topic, setTopic] = useState<Topic | 'All'>('All');
  const pool = topic === 'All' ? LESSONS : LESSONS.filter(l => l.topic === topic);
  const read = pool.filter(l => progress.read[l.id]);
  const aced = pool.filter(l => progress.quiz[l.id]);
  const mastered = pool.filter(l => progress.read[l.id] && progress.quiz[l.id] && (progress.ratings[l.id] ?? 0) >= 4);

  const rings = [
    { label: 'lessons', value: pool.length },
    { label: 'read', value: read.length },
    { label: 'quizzes', value: aced.length },
    { label: 'mastered', value: mastered.length },
  ];

  return (
    <article className="card mastery-card">
      <div className="row-between">
        <h3 className="card-title">Topic mastery</h3>
        <label className="chip select-chip">
          <span className="visually-hidden">Topic</span>
          <select value={topic} onChange={e => setTopic(e.target.value as Topic | 'All')}>
            <option value="All">All topics</option>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
          <span className="chip-caret">▾</span>
        </label>
      </div>
      <div className="rings" role="img" aria-label={rings.map(r => `${r.value} ${r.label}`).join(', ')}>
        {rings.map((r, i) => (
          <div key={r.label} className={`ring ring-${i}`}>
            <span className="ring-value">
              <span className="accent">{i === 3 ? '' : '#'}</span>{r.value}
              <small>{r.label}</small>
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- Deep dive */

interface DeepDiveProps {
  lesson: Lesson;
  progress: Progress;
  onCopyCode: () => void;
  copied: boolean;
}

export function DeepDive({ lesson, progress, onCopyCode, copied }: DeepDiveProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className={`card deep-dive ${expanded ? 'expanded' : ''}`} id="deep-dive">
      <div className="row-between">
        <h3 className="card-title">Lesson breakdown</h3>
        <div className="toolbar">
          <button className="icon-btn white sm" aria-label={expanded ? 'Collapse code' : 'Expand code'}
            title={expanded ? 'Collapse' : 'Expand'} onClick={() => setExpanded(e => !e)}>
            <ExpandIcon width={16} height={16} />
          </button>
          <button className="chip white" onClick={onCopyCode}>
            {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>
      </div>

      <div className="explain">
        <p className="lede">{inlineCode(lesson.summary)}</p>
        {lesson.body.map((p, i) => <p key={i}>{inlineCode(p)}</p>)}
      </div>

      <div className="dive-grid">
        <div className="sub-card code-card">
          <div className="code-head">
            <span className="dots" aria-hidden><i /><i /><i /></span>
            <span className="tiny">example.tsx</span>
          </div>
          <pre><code>{highlight(lesson.code)}</code></pre>
        </div>

        <div className="sub-card points-card">
          <div className="row-between">
            <h4>Key points</h4>
            <span className="tiny">{lesson.points.length}</span>
          </div>
          <ol className="timeline">
            {lesson.points.map((p, i) => (
              <li key={p} className={i === 0 ? 'first' : ''}>
                <span className="node">{i + 1}</span>
                <span className={i === 0 ? 'pill' : ''}>{p}</span>
              </li>
            ))}
          </ol>
        </div>

        <QuizCard key={lesson.id} lesson={lesson} answered={progress.quiz[lesson.id]} />
      </div>
    </article>
  );
}

function QuizCard({ lesson, answered }: { lesson: Lesson; answered: boolean | undefined }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const name = useId();
  const { quiz } = lesson;
  const correct = choice === quiz.answer;

  return (
    <div className="sub-card quiz-card">
      <Sunburst />
      <h4>Quick check</h4>
      <p className="tiny quiz-q">{quiz.question}</p>
      <fieldset className="options" disabled={checked}>
        <legend className="visually-hidden">{quiz.question}</legend>
        {quiz.options.map((o, i) => (
          <label
            key={o}
            className={`option ${choice === i ? 'chosen' : ''} ${checked && i === quiz.answer ? 'right' : ''} ${checked && choice === i && !correct ? 'wrong' : ''}`}
          >
            <input type="radio" name={name} checked={choice === i} onChange={() => setChoice(i)} />
            {o}
          </label>
        ))}
      </fieldset>
      {checked ? (
        <p className={`feedback ${correct ? 'good' : 'bad'}`} role="status">
          <strong>{correct ? 'Correct! ' : 'Not quite. '}</strong>{quiz.explanation}
        </p>
      ) : (
        answered !== undefined && <p className="tiny">You've answered this before ({answered ? 'correct' : 'missed'}).</p>
      )}
      <button
        className="btn btn-accent"
        disabled={choice === null && !checked}
        onClick={() => {
          if (checked) {
            setChecked(false);
            setChoice(null);
            return;
          }
          setChecked(true);
          progressActions.answerQuiz(lesson.id, choice === quiz.answer);
        }}
      >
        {checked ? 'Try again' : 'Check answer'}
      </button>
    </div>
  );
}

/* --------------------------------------------------------- Rating card */

const FACES = [
  { label: 'Lost', d: 'M7 16 Q12 8 17 16' },
  { label: 'Shaky', d: 'M7 15 Q12 10 17 15' },
  { label: 'Okay', d: 'M7 13 L17 13' },
  { label: 'Good', d: 'M7 11 Q12 16 17 11' },
  { label: 'Nailed it', d: 'M8 9 Q12 18 16 9' },
];

export function RatingCard({ lesson, progress }: { lesson: Lesson; progress: Progress }) {
  const rating = progress.ratings[lesson.id] ?? 0;
  const step = progress.read[lesson.id] ? (progress.quiz[lesson.id] !== undefined ? 2 : 1) : 0;
  return (
    <article className="card rating-card">
      <div className="row-between">
        <span className="stepper" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map(i => <i key={i} className={i === step ? 'on' : ''} />)}
        </span>
        <button
          className="icon-btn soft sm"
          aria-label="Clear rating"
          title="Clear rating"
          disabled={!rating}
          onClick={() => progressActions.rate(lesson.id, 0)}
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
      <div>
        <p className="tiny">Self-assessment</p>
        <h3 className="rating-q">How well do you understand this lesson?</h3>
      </div>
      <div className="faces" role="radiogroup" aria-label="Understanding">
        {FACES.map((f, i) => (
          <button
            key={f.label}
            role="radio"
            aria-checked={rating === i + 1}
            aria-label={f.label}
            title={f.label}
            className={`face ${rating === i + 1 ? 'on' : ''}`}
            onClick={() => progressActions.rate(lesson.id, i + 1)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path d={f.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>
    </article>
  );
}
