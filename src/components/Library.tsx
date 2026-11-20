import { useDeferredValue, useMemo } from 'react';
import { LESSONS, TOPICS, type Lesson, type Topic } from '../data/lessons';
import type { Progress } from '../lib/progress';
import { CheckIcon, CloseIcon, FilterIcon, SearchIcon } from './Icons';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  topics: Topic[];
  onTopics: (t: Topic[]) => void;
  unreadOnly: boolean;
  onUnreadOnly: (v: boolean) => void;
  progress: Progress;
  currentId: string;
  onOpen: (lesson: Lesson) => void;
}

export function Library({ query, onQuery, topics, onTopics, unreadOnly, onUnreadOnly, progress, currentId, onOpen }: Props) {
  // Practising what we preach: keep typing snappy while the grid catches up.
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return LESSONS.filter(l =>
      (topics.length === 0 || topics.includes(l.topic)) &&
      (!unreadOnly || !progress.read[l.id]) &&
      (!q || [l.title, l.summary, l.topic, l.since, ...l.points].join(' ').toLowerCase().includes(q)),
    );
  }, [deferredQuery, topics, unreadOnly, progress.read]);

  const toggle = (t: Topic) => onTopics(topics.includes(t) ? topics.filter(x => x !== t) : [...topics, t]);
  const filtersActive = topics.length > 0 || unreadOnly || query;

  return (
    <section className="card library" id="library" aria-labelledby="library-title">
      <div className="row-between wrap">
        <h3 className="card-title" id="library-title">Lesson library <span className="tiny">· {results.length} of {LESSONS.length}</span></h3>
        <div className="toolbar">
          <button
            className={`chip white ${unreadOnly ? 'active' : ''}`}
            aria-pressed={unreadOnly}
            onClick={() => onUnreadOnly(!unreadOnly)}
          >
            <FilterIcon width={14} height={14} /> Unread only
          </button>
          {filtersActive && (
            <button className="chip white" onClick={() => { onTopics([]); onUnreadOnly(false); onQuery(''); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="library-filters">
        <label className="search-inline">
          <span className="icon-btn outline sm"><SearchIcon width={16} height={16} /></span>
          <span className="visually-hidden">Search in lessons</span>
          <input type="search" placeholder="Search in lessons…" value={query} onChange={e => onQuery(e.target.value)} />
        </label>
        <div className="chips" role="group" aria-label="Filter by topic">
          {TOPICS.map(t => {
            const on = topics.includes(t);
            return (
              <button key={t} className={`chip white ${on ? 'active' : ''}`} aria-pressed={on} onClick={() => toggle(t)}>
                {t}
                <span className={`chip-mark ${on ? 'x' : 'dot'}`} aria-hidden>
                  {on ? <CloseIcon width={10} height={10} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="empty">No lessons match. Try a different search or clear the filters.</p>
      ) : (
        <ul className="lesson-grid" style={{ opacity: query !== deferredQuery ? 0.6 : 1 }}>
          {results.map(l => {
            const read = !!progress.read[l.id];
            return (
              <li key={l.id}>
                <button className={`tile ${l.id === currentId ? 'current' : ''}`} onClick={() => onOpen(l)}>
                  <span className="row-between">
                    <span className="tiny">{l.topic} · React {l.since}</span>
                    {read && <span className="read-badge" title="Read"><CheckIcon width={12} height={12} /></span>}
                  </span>
                  <strong>{l.title}</strong>
                  <span className="tiny clamp">{l.summary}</span>
                  <span className="tile-meta">
                    <span className={`diff d-${l.difficulty.toLowerCase()}`}>{l.difficulty}</span>
                    <span className="tiny">{l.minutes} min</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
