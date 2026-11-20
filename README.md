# Skills of the Day: Modern React

A dashboard-style web app that serves one bite-sized lesson on modern React every day
(hooks, React 18 concurrency, React 19 Actions, Server Components, the React Compiler, 19.2's `<Activity>` and `useEffectEvent`, TypeScript patterns, and more).

## Features

- **Lesson of the day**: picked deterministically from the date, so everyone gets the same lesson on the same day. The cycle covers every lesson before it repeats.
- **Date navigation**: use the previous/next arrows or the calendar picker to browse other days. "Surprise me" picks a random lesson.
- **Lesson breakdown**: an explanation, a syntax-highlighted code example (with copy and expand), key points, and a quick quiz.
- **Progress tracking** (saved in localStorage): mark lessons as read, a streak counter with a 30-day dot grid, a completion ring, weekly activity, quiz accuracy, and topic mastery.
- **Self-assessment**: rate how well you understood each lesson.
- **Library**: search plus topic chips and an "unread only" filter.
- **Shareable links**: `?l=<lesson-id>` or `?d=YYYY-MM-DD`.
- Responsive from phone to wide desktop, and respects `prefers-reduced-motion`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview
```

## Adding lessons

Lessons live in `src/data/lessons.ts`. Add an object to `LESSONS` with a title, topic, version,
difficulty, summary, body paragraphs, key points, a code snippet and a quiz. The daily rotation
picks up new lessons automatically.

## Structure

```
src/
  data/lessons.ts           lesson content
  lib/dates.ts              date helpers + daily lesson selection
  lib/progress.ts           localStorage progress store (useSyncExternalStore)
  lib/highlight.tsx         tiny dependency-free code highlighter
  components/               TopBar, Hero, overview cards, detail cards, Library
  styles.css                design tokens + layout
```
