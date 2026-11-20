import { useCallback, useEffect, useRef, useState } from 'react';
import { LESSONS, type Lesson, type Topic } from './data/lessons';
import { addDays, lessonForDate, todayKey } from './lib/dates';
import { currentStreak, progressActions, useProgress } from './lib/progress';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import {
  ActivityCard, DifficultyBadge, LessonCard, ProgressRing, SideRail, StatsCard, StreakCard, VersionCard,
} from './components/OverviewCards';
import { DeepDive, MasteryCard, RatingCard } from './components/DetailCards';
import { Library } from './components/Library';

/** Read ?d=YYYY-MM-DD or ?l=lesson-id from the URL so lessons are shareable. */
function readUrl(): { dateKey: string; lessonId: string | null } {
  const params = new URLSearchParams(location.search);
  const d = params.get('d');
  const l = params.get('l');
  return {
    dateKey: d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : todayKey(),
    lessonId: l && LESSONS.some(x => x.id === l) ? l : null,
  };
}

export default function App() {
  const initial = useRef(readUrl()).current;
  const [dateKey, setDateKey] = useState(initial.dateKey);
  const [overrideId, setOverrideId] = useState<string | null>(initial.lessonId);
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const progress = useProgress();

  const lesson: Lesson = (overrideId && LESSONS.find(l => l.id === overrideId)) || lessonForDate(dateKey);
  const isRead = !!progress.read[lesson.id];
  const streak = currentStreak(progress);

  // Keep the URL in sync (replaceState: no history spam).
  useEffect(() => {
    const params = new URLSearchParams();
    if (overrideId) params.set('l', overrideId);
    else if (dateKey !== todayKey()) params.set('d', dateKey);
    const qs = params.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }, [dateKey, overrideId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const goToDate = (key: string) => {
    setOverrideId(null);
    setDateKey(key);
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const surprise = useCallback(() => {
    const others = LESSONS.filter(l => l.id !== lesson.id);
    setOverrideId(others[Math.floor(Math.random() * others.length)].id);
  }, [lesson.id]);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(message);
      return true;
    } catch {
      setToast('Copy failed: clipboard unavailable');
      return false;
    }
  }

  const copyCode = async () => {
    if (await copy(lesson.code, 'Code copied to clipboard')) setCopied(true);
  };
  const share = () => {
    const url = new URL(location.href);
    url.search = `?l=${lesson.id}`;
    copy(url.toString(), 'Link to this lesson copied');
  };

  const openLesson = (l: Lesson) => {
    setOverrideId(l.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page">
      <div className="frame">
        <div className="frame-top">
          <TopBar
            query={query}
            onQuery={q => setQuery(q)}
            onSubmitSearch={() => scrollTo('library')}
            onOpenLibrary={() => scrollTo('library')}
            readCount={Object.keys(progress.read).length}
          />
          <Hero
            dateKey={dateKey}
            lesson={lesson}
            isOverride={!!overrideId}
            isRead={isRead}
            onDate={goToDate}
            onShift={n => goToDate(addDays(dateKey, n))}
            onToday={() => {
              if (overrideId || dateKey !== todayKey()) goToDate(todayKey());
              else scrollTo('deep-dive');
            }}
            onSurprise={surprise}
          />
        </div>

        <main className="frame-body">
          <div className="row-1">
            <SideRail onSurprise={surprise} onShare={share} />
            <LessonCard
              lesson={lesson}
              isRead={isRead}
              onToggleRead={() => progressActions.toggleRead(lesson.id)}
              onCopyCode={copyCode}
              onTopic={t => {
                setTopics([t]);
                scrollTo('library');
              }}
            />
            <StatsCard progress={progress} onOpenLibrary={() => scrollTo('library')} />
            <div className="circles">
              <DifficultyBadge lesson={lesson} />
              <ProgressRing progress={progress} />
            </div>
            <div className="right-stack">
              <StreakCard progress={progress} streak={streak} />
              <VersionCard lesson={lesson} />
              <ActivityCard progress={progress} />
            </div>
          </div>

          <div className="row-2">
            <MasteryCard progress={progress} />
            <DeepDive lesson={lesson} progress={progress} onCopyCode={copyCode} copied={copied} />
            <RatingCard lesson={lesson} progress={progress} />
          </div>

          <Library
            query={query}
            onQuery={setQuery}
            topics={topics}
            onTopics={setTopics}
            unreadOnly={unreadOnly}
            onUnreadOnly={setUnreadOnly}
            progress={progress}
            currentId={lesson.id}
            onOpen={openLesson}
          />
        </main>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
