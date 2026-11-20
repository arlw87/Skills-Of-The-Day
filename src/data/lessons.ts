export type Topic =
  | 'Hooks'
  | 'Rendering'
  | 'Actions & Forms'
  | 'Server'
  | 'Performance'
  | 'Patterns'
  | 'TypeScript';

export const TOPICS: Topic[] = [
  'Hooks',
  'Rendering',
  'Actions & Forms',
  'Server',
  'Performance',
  'Patterns',
  'TypeScript',
];

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Quiz {
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  topic: Topic;
  /** React version the feature landed in (or became the recommended approach). */
  since: string;
  difficulty: Difficulty;
  minutes: number;
  summary: string;
  body: string[];
  points: string[];
  code: string;
  quiz: Quiz;
}

export const LESSONS: Lesson[] = [
  {
    id: 'state-updater-fn',
    title: 'Use updater functions for state based on state',
    topic: 'Hooks',
    since: '16.8',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'When the next state depends on the previous one, pass a function to the setter instead of a value.',
    body: [
      'Inside an event handler, `count` is a snapshot of the value for that render. Calling `setCount(count + 1)` three times queues the same value three times.',
      'Passing an updater, `setCount(c => c + 1)`, tells React to compute each update from the latest queued state, so every call counts.',
    ],
    points: [
      'State is a snapshot per render',
      'Updaters run in order against the queue',
      'Name the arg after the state: c, prev, items',
    ],
    code: `function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    // ❌ all three read the same snapshot → +1
    // setCount(count + 1);

    // ✅ each updater sees the latest value → +3
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  }

  return <button onClick={addThree}>{count}</button>;
}`,
    quiz: {
      question: 'count is 0. What does it become after setCount(count + 1) runs twice in one handler?',
      options: ['1', '2', '0'],
      answer: 0,
      explanation: 'Both calls read the snapshot value 0, so both set the state to 1.',
    },
  },
  {
    id: 'you-might-not-need-effect',
    title: 'You might not need an Effect',
    topic: 'Patterns',
    since: '18',
    difficulty: 'Beginner',
    minutes: 3,
    summary:
      'If a value can be calculated from props or state, calculate it during render instead of syncing it with useEffect.',
    body: [
      'A common anti-pattern is storing derived data in state and keeping it updated in an Effect. That causes an extra render with stale values and adds bugs.',
      'Effects are for synchronising with things outside React: the network, the DOM, timers, subscriptions. Everything else usually belongs in render or in an event handler.',
    ],
    points: [
      'Derive values during render',
      'Respond to user actions in event handlers',
      'Effects sync with external systems only',
    ],
    code: `function TodoList({ todos, filter }) {
  // ❌ redundant state + effect
  // const [visible, setVisible] = useState([]);
  // useEffect(() => {
  //   setVisible(todos.filter(t => matches(t, filter)));
  // }, [todos, filter]);

  // ✅ just compute it
  const visible = todos.filter(t => matches(t, filter));

  return <List items={visible} />;
}`,
    quiz: {
      question: 'Which of these is a good reason to use useEffect?',
      options: [
        'Computing a full name from first + last name',
        'Subscribing to a WebSocket while a component is mounted',
        'Resetting a form after the user clicks Submit',
      ],
      answer: 1,
      explanation:
        'A WebSocket is an external system. Derived values belong in render, and click responses belong in the handler.',
    },
  },
  {
    id: 'effect-cleanup-strict-mode',
    title: 'Effect cleanup and Strict Mode double-runs',
    topic: 'Hooks',
    since: '18',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'In development, Strict Mode mounts, unmounts and re-mounts components to check that your Effects clean up after themselves.',
    body: [
      'If an Effect subscribes, connects or starts a timer, return a cleanup function that undoes it. React calls cleanup before re-running the Effect and on unmount.',
      'The extra setup → cleanup → setup cycle in development is intentional. If it breaks your app, the bug is a missing cleanup, not Strict Mode.',
    ],
    points: [
      'Return a function to clean up',
      'Dev-only double-invoke surfaces leaks',
      'Ignore stale fetches with a flag or AbortController',
    ],
    code: `useEffect(() => {
  const controller = new AbortController();

  fetch(\`/api/users/\${id}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(() => {});

  return () => controller.abort(); // cleanup
}, [id]);`,
    quiz: {
      question: 'Your Effect runs twice in development only. What is the right fix?',
      options: [
        'Remove <StrictMode>',
        'Add a cleanup function that undoes the setup',
        'Use an empty dependency array',
      ],
      answer: 1,
      explanation: 'Strict Mode is exposing a missing cleanup. Production behaviour will be correct once cleanup exists.',
    },
  },
  {
    id: 'useref-mutable',
    title: 'useRef holds values that should not re-render',
    topic: 'Hooks',
    since: '16.8',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'A ref is a mutable box that survives renders. Changing ref.current does not trigger a re-render.',
    body: [
      'Use refs for interval IDs, previous values, DOM nodes or anything you need to remember but never display.',
      'Do not read or write ref.current during render (except lazy initialisation). Render must stay pure; touch refs in effects and event handlers.',
    ],
    points: [
      'Mutable, persistent, no re-render',
      'Great for timers and DOM nodes',
      'Avoid reading refs during render',
    ],
    code: `function Stopwatch() {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<number | null>(null);

  function start() {
    intervalRef.current = setInterval(() => setNow(Date.now()), 10);
  }
  function stop() {
    clearInterval(intervalRef.current!);
  }
  // ...
}`,
    quiz: {
      question: 'What happens when you assign ref.current = 5?',
      options: ['The component re-renders', 'Nothing visible; the value is stored', 'React throws a warning'],
      answer: 1,
      explanation: 'Refs are an escape hatch: mutation is silent and does not schedule a render.',
    },
  },
  {
    id: 'react-compiler',
    title: 'Let the React Compiler memoize for you',
    topic: 'Performance',
    since: 'Compiler 1.0',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'React Compiler automatically memoizes components and values at build time, so most manual useMemo, useCallback and memo calls can go.',
    body: [
      'The compiler analyses your components and inserts fine-grained caching, often more precisely than hand-written memoization.',
      'It relies on you following the Rules of React: pure render, no mutation of props or state, hooks at the top level. The ESLint plugin flags code it cannot optimise.',
    ],
    points: [
      'Install babel-plugin-react-compiler',
      'Write plain code; skip manual memo',
      'Rules of React violations opt a component out',
    ],
    code: `// With the compiler enabled, this is already optimised:
function ProductList({ products, query }) {
  const visible = products.filter(p => p.name.includes(query));
  const onSelect = id => track('select', id);

  return visible.map(p => (
    <Product key={p.id} product={p} onSelect={onSelect} />
  ));
}

// vite.config.ts
react({ babel: { plugins: ['babel-plugin-react-compiler'] } })`,
    quiz: {
      question: 'What does React Compiler need from your code to optimise it safely?',
      options: ['Class components', 'Following the Rules of React', 'Every value wrapped in useMemo'],
      answer: 1,
      explanation: 'Pure, idiomatic React is all the compiler needs; it bails out on components that break the rules.',
    },
  },
  {
    id: 'usememo-when',
    title: 'When useMemo and useCallback still matter',
    topic: 'Performance',
    since: '16.8',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'Without the compiler, memoize only expensive calculations or values passed to memoized children and effect dependencies.',
    body: [
      'useMemo caches a computed value; useCallback caches a function. Both compare dependencies with Object.is between renders.',
      'They are performance hints, not semantic guarantees. Measure first: most components are fast enough without them.',
    ],
    points: [
      'Memoize expensive work (> ~1ms)',
      'Stabilise props for memo() children',
      'Stabilise objects used as Effect deps',
    ],
    code: `const sorted = useMemo(
  () => bigList.toSorted(compareByScore), // expensive
  [bigList]
);

const handleSave = useCallback(
  (draft) => save(userId, draft),
  [userId]
);

return <MemoizedEditor onSave={handleSave} rows={sorted} />;`,
    quiz: {
      question: 'useCallback(fn, deps) returns…',
      options: ['The result of calling fn', 'The same fn reference until deps change', 'A promise'],
      answer: 1,
      explanation: 'useCallback memoizes the function itself; useMemo memoizes a returned value.',
    },
  },
  {
    id: 'use-transition',
    title: 'Keep the UI responsive with useTransition',
    topic: 'Rendering',
    since: '18',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'Mark a state update as non-urgent so React can interrupt it to handle typing, clicks and other urgent work.',
    body: [
      'startTransition wraps updates that may render a lot of UI, like switching tabs. React keeps showing the old UI until the new one is ready, and isPending tells you it is working.',
      'Since React 19, the function passed to startTransition can be async. Those are called Actions.',
    ],
    points: [
      'Urgent: typing, clicking. Transition: everything else',
      'isPending drives loading hints',
      'Transitions can be interrupted',
    ],
    code: `function Tabs() {
  const [tab, setTab] = useState('about');
  const [isPending, startTransition] = useTransition();

  function select(next) {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <TabBar onSelect={select} dimmed={isPending} />
      {tab === 'posts' ? <SlowPosts /> : <About />}
    </>
  );
}`,
    quiz: {
      question: 'Which update should NOT be wrapped in a transition?',
      options: ['Switching to a heavy tab', 'The value of a controlled text input', 'Filtering a large chart'],
      answer: 1,
      explanation: 'Controlled inputs must update synchronously or the typed characters will lag.',
    },
  },
  {
    id: 'use-deferred-value',
    title: 'Defer slow renders with useDeferredValue',
    topic: 'Rendering',
    since: '18',
    difficulty: 'Intermediate',
    minutes: 2,
    summary:
      'Get a "lagging" copy of a value so the expensive part of the UI re-renders in the background.',
    body: [
      'useDeferredValue is useful when you do not own the state update (it comes from props) but want a slow child to fall behind gracefully.',
      'React 19 added an initialValue argument, so the first render can show something cheap before the real value is ready.',
    ],
    points: [
      'Input stays snappy, results catch up',
      'Combine with memo() on the slow child',
      'Compare value !== deferred to show staleness',
    ],
    code: `function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SlowResults query={deferredQuery} />
      </div>
    </>
  );
}`,
    quiz: {
      question: 'For useDeferredValue to help, the slow child should usually be…',
      options: ['Wrapped in memo()', 'A class component', 'Rendered inside useEffect'],
      answer: 0,
      explanation: 'memo lets the child skip re-rendering with the old deferred value while the urgent render happens.',
    },
  },
  {
    id: 'automatic-batching',
    title: 'Automatic batching everywhere',
    topic: 'Rendering',
    since: '18',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Multiple state updates are batched into one render, even inside promises, timeouts and native event handlers.',
    body: [
      'Before React 18 only updates inside React event handlers were batched. Now everything is, which means fewer renders by default.',
      'In the rare case you need to read the DOM right after an update, flushSync forces a synchronous render.',
    ],
    points: [
      'One render for many setState calls',
      'Works in async code too',
      'flushSync is the escape hatch',
    ],
    code: `async function handleClick() {
  const data = await fetchData();
  // React 18+: one render, not two
  setData(data);
  setLoading(false);
}

// Escape hatch:
import { flushSync } from 'react-dom';
flushSync(() => setOpen(true));
dialogRef.current.focus();`,
    quiz: {
      question: 'Two setState calls after an await in React 19 cause how many renders?',
      options: ['Two', 'One', 'Zero until the next event'],
      answer: 1,
      explanation: 'Automatic batching applies to all updates regardless of where they are scheduled.',
    },
  },
  {
    id: 'use-id',
    title: 'Generate stable IDs with useId',
    topic: 'Hooks',
    since: '18',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'useId creates a unique ID that matches between server and client rendering, perfect for accessibility attributes.',
    body: [
      'Hard-coded IDs break when a component is used twice; Math.random() breaks hydration. useId solves both.',
      'Do not use it for list keys: keys should come from your data.',
    ],
    points: [
      'For htmlFor, aria-describedby, etc.',
      'Hydration-safe',
      'Not for list keys',
    ],
    code: `function PasswordField() {
  const hintId = useId();
  return (
    <>
      <input type="password" aria-describedby={hintId} />
      <p id={hintId}>At least 12 characters.</p>
    </>
  );
}`,
    quiz: {
      question: 'What should you NOT use useId for?',
      options: ['Linking a label to an input', 'Keys in a rendered list', 'aria-describedby'],
      answer: 1,
      explanation: 'Keys must be derived from data so React can track items across renders.',
    },
  },
  {
    id: 'use-sync-external-store',
    title: 'Subscribe to external stores safely',
    topic: 'Hooks',
    since: '18',
    difficulty: 'Advanced',
    minutes: 3,
    summary:
      'useSyncExternalStore reads from a non-React store without tearing during concurrent rendering.',
    body: [
      'If a value lives outside React (browser APIs, a global store), subscribing in an Effect can show inconsistent values across components. This hook guarantees consistency.',
      'getSnapshot must return the same value when nothing changed, otherwise React re-renders forever.',
    ],
    points: [
      'subscribe(callback) → unsubscribe',
      'getSnapshot must be cached/immutable',
      'getServerSnapshot for SSR',
    ],
    code: `function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // server
  );
}`,
    quiz: {
      question: 'What problem does useSyncExternalStore prevent?',
      options: ['Tearing: different parts of the UI showing different store values', 'Memory leaks in timers', 'Slow network requests'],
      answer: 0,
      explanation: 'It makes external store reads consistent within a concurrent render.',
    },
  },
  {
    id: 'suspense-boundaries',
    title: 'Design loading states with Suspense',
    topic: 'Rendering',
    since: '18',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'Suspense shows a fallback while anything inside it is waiting for code or data, and lets you choose where loading states appear.',
    body: [
      'Place boundaries where a loading state makes sense to the user. Siblings in one boundary reveal together; nested boundaries reveal progressively.',
      'Suspense works with lazy(), use(promise), and Suspense-enabled frameworks. It does not detect data fetched inside useEffect.',
    ],
    points: [
      'Boundaries = designed loading UX',
      'Nest for progressive reveal',
      'Effects-based fetching does not suspend',
    ],
    code: `<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</Suspense>`,
    quiz: {
      question: 'Which of these makes a component suspend?',
      options: ['fetch() inside useEffect', 'Reading a promise with use()', 'Calling setState'],
      answer: 1,
      explanation: 'use(promise) suspends until the promise resolves; effect-based fetching runs after render.',
    },
  },
  {
    id: 'use-promise',
    title: 'Read promises with use()',
    topic: 'Hooks',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'use(promise) suspends the component until the promise resolves, then returns its value.',
    body: [
      'Pass the promise in from a parent, a Server Component or a cache. Creating a new promise during every render would suspend forever.',
      'Rejected promises are caught by the nearest Error Boundary. Pair use() with Suspense for loading and an Error Boundary for failures.',
    ],
    points: [
      'Promise must be stable/cached',
      'Suspense handles pending',
      'Error Boundary handles rejection',
    ],
    code: `// Server Component starts the request…
export default function Page() {
  const commentsPromise = fetchComments();
  return (
    <Suspense fallback={<Spinner />}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}

// …Client Component reads it
'use client';
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}`,
    quiz: {
      question: 'Why not write use(fetch(url)) directly in a Client Component?',
      options: [
        'use() only accepts Context',
        'A new promise is created every render, so it never settles from React\'s view',
        'fetch is not allowed in React',
      ],
      answer: 1,
      explanation: 'Uncached promises are recreated on each render attempt; pass a stable one in instead.',
    },
  },
  {
    id: 'use-context-conditional',
    title: 'use() can read Context conditionally',
    topic: 'Hooks',
    since: '19',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Unlike other hooks, use() can be called inside if statements and loops, which makes conditional Context reads possible.',
    body: [
      'useContext must be called at the top level. use(Context) behaves the same but can live after an early return.',
      'It still has to be called during render, inside a component or hook, not inside an event handler.',
    ],
    points: [
      'Allowed in conditions and loops',
      'Still only during render',
      'Same lookup as useContext',
    ],
    code: `function Heading({ children }) {
  if (children == null) {
    return null;
  }

  // ✅ fine after an early return
  const theme = use(ThemeContext);
  return <h1 style={{ color: theme.color }}>{children}</h1>;
}`,
    quiz: {
      question: 'Where can you NOT call use()?',
      options: ['Inside an if block in a component', 'Inside an onClick handler', 'Inside a for loop during render'],
      answer: 1,
      explanation: 'use() is still a render-time API; event handlers run outside rendering.',
    },
  },
  {
    id: 'actions',
    title: 'Actions: async transitions with pending state',
    topic: 'Actions & Forms',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'An Action is an async function run inside a transition. React tracks its pending state, errors and optimistic updates for you.',
    body: [
      'Previously you had to juggle isPending, error and data state by hand. With async transitions, isPending is true for the whole async function.',
      'Note: state updates after an await currently need their own startTransition to be part of the transition.',
    ],
    points: [
      'startTransition(async () => …)',
      'isPending spans the whole request',
      'Wrap post-await setState in startTransition',
    ],
    code: `function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      startTransition(() => {
        if (error) setError(error);
        else redirect('/profile');
      });
    });
  };

  return <button onClick={handleSubmit} disabled={isPending}>Save</button>;
}`,
    quiz: {
      question: 'In React 19, what is an "Action"?',
      options: ['A Redux action object', 'A function that triggers a transition, possibly async', 'A server-only API route'],
      answer: 1,
      explanation: 'By convention, functions that use async transitions are called Actions.',
    },
  },
  {
    id: 'use-action-state',
    title: 'useActionState for form results',
    topic: 'Actions & Forms',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'useActionState wraps an Action and gives you its latest result plus a pending flag, ideal for forms.',
    body: [
      'Your action receives the previous state and the submitted FormData, and returns the next state (often an error message or the saved value).',
      'Hand the returned formAction to <form action>, and React handles pending state and resetting uncontrolled fields.',
    ],
    points: [
      '[state, formAction, isPending]',
      'Action receives (prevState, formData)',
      'Works with Server Functions too',
    ],
    code: `function ChangeName({ name }) {
  const [error, submitAction, isPending] = useActionState(
    async (prev, formData) => {
      const error = await updateName(formData.get('name'));
      return error ?? null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <input name="name" defaultValue={name} />
      <button disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}`,
    quiz: {
      question: 'What arguments does a useActionState action receive when used as a form action?',
      options: ['(event)', '(previousState, formData)', '(formData, setState)'],
      answer: 1,
      explanation: 'The previous state comes first, followed by the payload (FormData for forms).',
    },
  },
  {
    id: 'use-form-status',
    title: 'useFormStatus reads the parent form',
    topic: 'Actions & Forms',
    since: '19',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Design-system buttons can know whether their <form> is submitting without prop drilling.',
    body: [
      'useFormStatus (from react-dom) works like a Context provided by the nearest parent <form>. It returns pending, data, method and action.',
      'It must be called from a component rendered inside the form, not in the component that renders the form.',
    ],
    points: [
      'Import from react-dom',
      'Call it in a child of <form>',
      'pending, data, method, action',
    ],
    code: `import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

export function Profile() {
  return (
    <form action={saveProfile}>
      <input name="bio" />
      <SubmitButton />
    </form>
  );
}`,
    quiz: {
      question: 'Profile renders <form> and calls useFormStatus itself. What happens?',
      options: ['pending works normally', 'It never reports pending, since there is no parent form', 'React throws'],
      answer: 1,
      explanation: 'useFormStatus only sees a <form> above the calling component in the tree.',
    },
  },
  {
    id: 'use-optimistic',
    title: 'Instant UI with useOptimistic',
    topic: 'Actions & Forms',
    since: '19',
    difficulty: 'Advanced',
    minutes: 3,
    summary:
      'Show the expected result immediately while an Action is in flight; React reverts automatically when it settles.',
    body: [
      'useOptimistic takes the real state and returns an optimistic copy plus a setter. The optimistic value only lives while a transition is pending.',
      'When the Action finishes, React switches back to the real state, which by then should contain the server result (or the original on error).',
    ],
    points: [
      'Call the setter inside an Action',
      'Auto-reverts when the transition ends',
      'Great for likes, messages, toggles',
    ],
    code: `function Thread({ messages, sendMessage }) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (state, text) => [...state, { text, sending: true }]
  );

  async function formAction(formData) {
    addOptimistic(formData.get('message'));
    await sendMessage(formData);
  }

  return (
    <>
      {optimistic.map((m, i) => (
        <p key={i} style={{ opacity: m.sending ? 0.5 : 1 }}>{m.text}</p>
      ))}
      <form action={formAction}><input name="message" /></form>
    </>
  );
}`,
    quiz: {
      question: 'When does the optimistic value disappear?',
      options: ['After 5 seconds', 'When the surrounding transition/Action completes', 'On the next keystroke'],
      answer: 1,
      explanation: 'Optimistic state is tied to the pending transition and resets to the real state afterwards.',
    },
  },
  {
    id: 'form-action-prop',
    title: 'Pass functions to <form action>',
    topic: 'Actions & Forms',
    since: '19',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'React DOM lets <form action>, formAction on buttons, and inputs accept functions, which are run as Actions.',
    body: [
      'The function receives FormData. Submission runs in a transition, and uncontrolled fields reset automatically on success.',
      'Need to reset manually? Call requestFormReset(form) from react-dom.',
    ],
    points: [
      'action={fn} receives FormData',
      'Uncontrolled inputs auto-reset',
      'formAction on a button overrides per button',
    ],
    code: `function Newsletter() {
  async function subscribe(formData) {
    await api.subscribe(formData.get('email'));
  }
  async function unsubscribe(formData) {
    await api.unsubscribe(formData.get('email'));
  }

  return (
    <form action={subscribe}>
      <input name="email" type="email" />
      <button>Subscribe</button>
      <button formAction={unsubscribe}>Unsubscribe</button>
    </form>
  );
}`,
    quiz: {
      question: 'What does a function passed to <form action> receive?',
      options: ['A SubmitEvent', 'FormData', 'A ref to the form'],
      answer: 1,
      explanation: 'React calls the action with the form\'s FormData; no preventDefault needed.',
    },
  },
  {
    id: 'server-components',
    title: 'Server Components render ahead of time',
    topic: 'Server',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'Server Components run on the server (or at build time), can be async, and ship zero JavaScript for themselves to the browser.',
    body: [
      'They can read databases and files directly. Their output is serialised and streamed to the client, where Client Components add interactivity.',
      'Server Components cannot use state, effects or browser APIs. Those belong in Client Components marked with "use client".',
    ],
    points: [
      'async components are allowed',
      'No hooks like useState/useEffect',
      'Supported via frameworks such as Next.js',
    ],
    code: `// app/notes/[id]/page.tsx (Server Component by default)
export default async function Note({ params }) {
  const note = await db.notes.get(params.id);

  return (
    <article>
      <h1>{note.title}</h1>
      <Markdown source={note.body} />   {/* no JS shipped */}
      <LikeButton id={note.id} />        {/* 'use client' */}
    </article>
  );
}`,
    quiz: {
      question: 'Which can a Server Component do?',
      options: ['useState', 'await a database query', 'Attach an onClick handler'],
      answer: 1,
      explanation: 'Server Components can be async and access server resources, but cannot hold state or handle events.',
    },
  },
  {
    id: 'use-client-boundary',
    title: '"use client" marks a boundary, not a file type',
    topic: 'Server',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      '"use client" declares an entry point into client code. Everything it imports becomes part of the client bundle.',
    body: [
      'You do not need the directive in every interactive file, only where a Server Component imports a Client one.',
      'Server Components can still be passed as children to a Client Component. Keep client boundaries as small and as low in the tree as practical.',
    ],
    points: [
      'Directive goes at the top of the module',
      'Props across the boundary must be serialisable',
      'Pass server content via children',
    ],
    code: `'use client';
import { useState } from 'react';

export function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button onClick={() => setOpen(o => !o)}>{title}</button>
      {open && children /* can be Server Components! */}
    </section>
  );
}`,
    quiz: {
      question: 'Which prop cannot be passed from a Server to a Client Component?',
      options: ['A string', 'A plain function like () => alert(1)', 'A JSX element'],
      answer: 1,
      explanation: 'Props must be serialisable. Plain functions are not, though Server Functions are allowed.',
    },
  },
  {
    id: 'server-functions',
    title: 'Server Functions with "use server"',
    topic: 'Server',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      'Mark an async function with "use server" and Client Components can call it like a normal function; it runs on the server.',
    body: [
      'The framework creates a reference the client can call over the network. Arguments and return values must be serialisable.',
      'Treat Server Functions like public API endpoints: always validate input and check authorisation inside them.',
    ],
    points: [
      'Works as <form action> directly',
      'Always validate and authorise',
      '"use server" is not for Server Components',
    ],
    code: `// actions.ts
'use server';

export async function addToCart(formData: FormData) {
  const user = await requireUser();         // authorise!
  const id = String(formData.get('productId'));
  await db.cart.add(user.id, id);
}

// ProductCard.tsx (client or server)
<form action={addToCart}>
  <input type="hidden" name="productId" value={product.id} />
  <button>Add to cart</button>
</form>`,
    quiz: {
      question: 'What is the directive for Server Components?',
      options: ['"use server"', 'There is none; they are the default in RSC frameworks', '"use rsc"'],
      answer: 1,
      explanation: '"use server" marks Server Functions. Server Components need no directive.',
    },
  },
  {
    id: 'ref-as-prop',
    title: 'ref is just a prop now',
    topic: 'Patterns',
    since: '19',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Function components can accept ref as a regular prop. forwardRef is no longer needed and will be deprecated.',
    body: [
      'Destructure ref from props and pass it where you want it to point. A codemod can migrate existing forwardRef usage.',
      'Class components still receive ref as the instance, not as a prop.',
    ],
    points: [
      'No more forwardRef wrapper',
      'Destructure { ref } from props',
      'Codemod available',
    ],
    code: `// Before
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

<Input ref={inputRef} placeholder="Email" />`,
    quiz: {
      question: 'In React 19, how does a function component receive a ref?',
      options: ['Only via forwardRef', 'As a normal prop named ref', 'Through useImperativeHandle only'],
      answer: 1,
      explanation: 'ref is available on props for function components.',
    },
  },
  {
    id: 'context-as-provider',
    title: 'Render <Context> as the provider',
    topic: 'Patterns',
    since: '19',
    difficulty: 'Beginner',
    minutes: 1,
    summary: 'You can render <ThemeContext value={…}> directly instead of <ThemeContext.Provider>.',
    body: [
      'It is a small change that removes noise. Context.Provider still works for now but is planned for deprecation.',
      'Remember to keep the value stable (or let the compiler do it) to avoid re-rendering every consumer.',
    ],
    points: [
      '<Ctx value={v}> is the provider',
      '.Provider will be deprecated',
      'Stable values avoid wasted renders',
    ],
    code: `const ThemeContext = createContext('light');

function App({ children }) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );
}`,
    quiz: {
      question: 'Which is the new React 19 way to provide context?',
      options: ['<ThemeContext value="dark">', '<Provider context={ThemeContext}>', 'useProvide(ThemeContext)'],
      answer: 0,
      explanation: 'Rendering the context object itself provides its value.',
    },
  },
  {
    id: 'ref-cleanup',
    title: 'Ref callbacks can return a cleanup',
    topic: 'Hooks',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 2,
    summary:
      'Callback refs may return a function that React calls when the element is removed, much like Effect cleanup.',
    body: [
      'Previously React called ref callbacks with null on unmount. With a returned cleanup, you can attach and detach observers in one place.',
      'Because of this, TypeScript rejects implicit returns from ref callbacks; use a block body.',
    ],
    points: [
      'Return () => {} from the ref callback',
      'Perfect for observers & listeners',
      'Use braces, not implicit returns',
    ],
    code: `<div
  ref={node => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(node);
    return () => observer.disconnect();
  }}
/>`,
    quiz: {
      question: 'Why does `ref={n => (instance = n)}` fail TypeScript checks in React 19?',
      options: [
        'Refs can no longer be functions',
        'The implicit return value could be mistaken for a cleanup function',
        'Assignment is not allowed in JSX',
      ],
      answer: 1,
      explanation: 'Returning a value from a ref callback now has meaning, so implicit returns are flagged.',
    },
  },
  {
    id: 'document-metadata',
    title: 'Render <title> and <meta> anywhere',
    topic: 'Rendering',
    since: '19',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'React hoists <title>, <meta> and <link> tags rendered in components into the document <head>.',
    body: [
      'Libraries like react-helmet are no longer required for basic cases. It works with client rendering, streaming SSR and Server Components.',
      'For complex overrides (e.g. route-based precedence), a framework or library may still be useful.',
    ],
    points: [
      'Hoisted into <head> automatically',
      'Works in SSR and RSC',
      'Keep one <title> per page',
    ],
    code: `function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="author" content={post.author} />
      <link rel="canonical" href={post.url} />
      <h1>{post.title}</h1>
    </article>
  );
}`,
    quiz: {
      question: 'Where does a <title> rendered inside a component end up?',
      options: ['Inside the component\'s div', 'In document.head', 'It is ignored'],
      answer: 1,
      explanation: 'React 19 hoists document metadata tags into the head.',
    },
  },
  {
    id: 'preload-apis',
    title: 'Load resources early with preload & preinit',
    topic: 'Performance',
    since: '19',
    difficulty: 'Advanced',
    minutes: 2,
    summary:
      'react-dom exports prefetchDNS, preconnect, preload and preinit to tell the browser about resources as early as possible.',
    body: [
      'Calling these during render or in event handlers emits the right <link> tags (on the server) or browser hints (on the client), deduplicated.',
      'Use them for fonts, critical scripts and stylesheets discovered late in your component tree.',
    ],
    points: [
      'preinit = load and execute',
      'preload = fetch only',
      'Deduplicated automatically',
    ],
    code: `import { preconnect, preload, preinit } from 'react-dom';

function Checkout() {
  preinit('https://js.stripe.com/v3', { as: 'script' });
  preload('/fonts/Inter.woff2', { as: 'font', crossOrigin: '' });
  preconnect('https://api.example.com');
  return <CheckoutForm />;
}`,
    quiz: {
      question: 'Which API both downloads AND executes a script?',
      options: ['preload', 'preinit', 'prefetchDNS'],
      answer: 1,
      explanation: 'preinit loads and evaluates the resource; preload only fetches it.',
    },
  },
  {
    id: 'activity',
    title: 'Hide UI without losing state using <Activity>',
    topic: 'Rendering',
    since: '19.2',
    difficulty: 'Intermediate',
    minutes: 3,
    summary:
      '<Activity mode="hidden"> hides children, unmounts their Effects, and preserves their state for when they come back.',
    body: [
      'Compared with conditional rendering, Activity keeps form input, scroll and state intact. Hidden content re-renders at low priority.',
      'You can also pre-render likely next screens in hidden mode so they load data and code in the background.',
    ],
    points: [
      'mode: "visible" | "hidden"',
      'Effects are cleaned up while hidden',
      'State and DOM are preserved',
    ],
    code: `import { Activity, useState } from 'react';

function App() {
  const [tab, setTab] = useState('home');
  return (
    <>
      <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
        <Home />
      </Activity>
      <Activity mode={tab === 'inbox' ? 'visible' : 'hidden'}>
        <Inbox />   {/* draft text survives tab switches */}
      </Activity>
    </>
  );
}`,
    quiz: {
      question: 'What happens to a component\'s Effects when its <Activity> becomes hidden?',
      options: ['They keep running', 'They are cleaned up, then re-created when visible', 'The component is destroyed'],
      answer: 1,
      explanation: 'Hidden Activity unmounts Effects to free resources, but keeps the state.',
    },
  },
  {
    id: 'use-effect-event',
    title: 'Separate events from Effects with useEffectEvent',
    topic: 'Hooks',
    since: '19.2',
    difficulty: 'Advanced',
    minutes: 3,
    summary:
      'useEffectEvent lets an Effect read the latest props and state without re-running when they change.',
    body: [
      'Some logic in an Effect is reactive (roomId: reconnect when it changes) and some is not (theme: just read the current value when an event fires).',
      'Wrap the non-reactive part in an Effect Event. Call it only from inside Effects, and leave it out of the dependency array.',
    ],
    points: [
      'Reads fresh values, not reactive',
      'Only call from Effects',
      'Do not list it as a dependency',
    ],
    code: `function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme); // latest theme
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]); // ✅ theme changes don't reconnect
}`,
    quiz: {
      question: 'Where may you call a function returned by useEffectEvent?',
      options: ['In render', 'In onClick handlers', 'Inside Effects'],
      answer: 2,
      explanation: 'Effect Events are designed to be fired from Effects only.',
    },
  },
  {
    id: 'keys-reset-state',
    title: 'Reset component state with a key',
    topic: 'Patterns',
    since: '16.8',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Changing a component\'s key makes React treat it as a brand-new instance, discarding all its state.',
    body: [
      'Instead of resetting state in an Effect when a prop changes, give the component a key derived from that prop.',
      'This also resets all children, so it is a clean way to say "this is a different thing now".',
    ],
    points: [
      'New key → fresh state',
      'Replaces reset-in-Effect patterns',
      'Resets the entire subtree',
    ],
    code: `function ProfilePage({ userId }) {
  // Each user gets a fresh <Profile> with empty comment draft
  return <Profile key={userId} userId={userId} />;
}

function Profile({ userId }) {
  const [comment, setComment] = useState('');
  // ...
}`,
    quiz: {
      question: 'What happens when a component\'s key changes?',
      options: ['Only props update', 'React unmounts it and mounts a new instance', 'Nothing'],
      answer: 1,
      explanation: 'Keys define identity; a new key means a new component with fresh state.',
    },
  },
  {
    id: 'composition-over-drilling',
    title: 'Avoid prop drilling with composition',
    topic: 'Patterns',
    since: '16.8',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Before reaching for Context, try passing JSX as children so intermediate components do not need to forward props.',
    body: [
      'If a layout component only passes data through, let the parent render the leaf and pass it in as children (or a named slot prop).',
      'Context is still great for truly global data like theme, locale or the current user.',
    ],
    points: [
      'children and slot props',
      'Fewer intermediate props',
      'Context for genuinely global data',
    ],
    code: `// ❌ Layout forwards user just to reach Avatar
<Layout user={user} />

// ✅ Parent composes the leaf directly
<Layout
  header={<Avatar user={user} />}
>
  <Feed user={user} />
</Layout>`,
    quiz: {
      question: 'What is usually the first thing to try before Context to fix prop drilling?',
      options: ['Redux', 'Passing JSX as children/slots', 'Global variables'],
      answer: 1,
      explanation: 'Composition removes the need for middle components to know about the data.',
    },
  },
  {
    id: 'custom-hooks',
    title: 'Custom hooks share logic, not state',
    topic: 'Patterns',
    since: '16.8',
    difficulty: 'Intermediate',
    minutes: 2,
    summary:
      'Each call to a custom hook gets its own independent state. Extract hooks to name and reuse behaviour.',
    body: [
      'A custom hook is just a function whose name starts with "use" and that calls other hooks.',
      'If two components need the same piece of state, lift it up or use Context; a hook alone will not share it.',
    ],
    points: [
      'Name must start with use',
      'State is per-call',
      'Great for effects with clear purpose',
    ],
    code: `function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => {
      removeEventListener('online', on);
      removeEventListener('offline', off);
    };
  }, []);
  return online;
}`,
    quiz: {
      question: 'Two components call useCounter(). Do they share the count?',
      options: ['Yes, always', 'No, each call has independent state', 'Only in Strict Mode'],
      answer: 1,
      explanation: 'Hooks reuse stateful logic; each call gets separate state.',
    },
  },
  {
    id: 'layout-effect',
    title: 'useLayoutEffect for measuring before paint',
    topic: 'Hooks',
    since: '16.8',
    difficulty: 'Advanced',
    minutes: 2,
    summary:
      'useLayoutEffect runs synchronously after DOM mutations but before the browser paints, useful for measuring layout.',
    body: [
      'Use it when you must measure an element and immediately re-render (e.g. positioning a tooltip) without a visible flicker.',
      'It blocks painting, so prefer useEffect for everything else.',
    ],
    points: [
      'Runs before paint',
      'Blocks the browser',
      'Default to useEffect',
    ],
    code: `function Tooltip({ target, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  const top = target.top - height; // positioned before paint
  return <div ref={ref} style={{ top }}>{children}</div>;
}`,
    quiz: {
      question: 'Why prefer useEffect over useLayoutEffect by default?',
      options: ['useLayoutEffect blocks painting and can hurt performance', 'useLayoutEffect is deprecated', 'useEffect runs earlier'],
      answer: 0,
      explanation: 'Layout effects run synchronously before paint; use them only when needed to avoid flicker.',
    },
  },
  {
    id: 'ts-component-props',
    title: 'Extend native props with ComponentProps',
    topic: 'TypeScript',
    since: '19',
    difficulty: 'Intermediate',
    minutes: 2,
    summary:
      'Type wrapper components by extending ComponentProps<"button"> so every native attribute (including ref) is supported.',
    body: [
      'ComponentProps<"button"> includes ref in React 19 since ref is a prop. Use ComponentPropsWithoutRef if you need to exclude it.',
      'Use Omit to replace attributes whose type you want to change.',
    ],
    points: [
      'ComponentProps<"tag"> for native elements',
      'ComponentProps<typeof Comp> for components',
      'Omit to override attributes',
    ],
    code: `import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
};

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={\`btn btn-\${variant} \${className ?? ''}\`} {...rest} />;
}`,
    quiz: {
      question: 'How do you get the props type of an existing component Card?',
      options: ['Props<Card>', 'ComponentProps<typeof Card>', 'typeof Card.props'],
      answer: 1,
      explanation: 'ComponentProps works with both intrinsic tag names and component types.',
    },
  },
  {
    id: 'ts-children-types',
    title: 'Typing children and event handlers',
    topic: 'TypeScript',
    since: '18',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'Use ReactNode for anything renderable, and let inline handlers infer their event types.',
    body: [
      'Since React 18 types, FC no longer adds children implicitly, so declare children: ReactNode explicitly.',
      'For handlers defined outside JSX, use types like ChangeEvent<HTMLInputElement> or the shorthand ChangeEventHandler<HTMLInputElement>.',
    ],
    points: [
      'children: ReactNode',
      'Inline handlers infer types',
      'ChangeEventHandler<HTMLInputElement>',
    ],
    code: `import type { ReactNode, ChangeEventHandler } from 'react';

interface FieldProps {
  label: string;
  children?: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

function Field({ label, children, onChange }: FieldProps) {
  return (
    <label>
      {label}
      <input onChange={onChange} />
      {children}
    </label>
  );
}`,
    quiz: {
      question: 'Which type accepts strings, numbers, elements, arrays and null?',
      options: ['JSX.Element', 'ReactNode', 'ReactElement'],
      answer: 1,
      explanation: 'ReactNode is the widest "renderable" type; JSX.Element is only a single element.',
    },
  },
  {
    id: 'error-boundary-callbacks',
    title: 'Root-level error reporting',
    topic: 'Rendering',
    since: '19',
    difficulty: 'Advanced',
    minutes: 2,
    summary:
      'createRoot accepts onCaughtError, onUncaughtError and onRecoverableError to centralise error logging.',
    body: [
      'React 19 no longer re-throws caught errors to window, and logs a single concise error instead of duplicates.',
      'Hook these callbacks up to your monitoring service to see every error React handles.',
    ],
    points: [
      'onCaughtError: inside an Error Boundary',
      'onUncaughtError: not caught',
      'onRecoverableError: auto-recovered',
    ],
    code: `import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root'), {
  onCaughtError(error, info) {
    report(error, { stack: info.componentStack, caught: true });
  },
  onUncaughtError(error, info) {
    report(error, { stack: info.componentStack, caught: false });
  },
}).render(<App />);`,
    quiz: {
      question: 'Which option fires for errors handled by an Error Boundary?',
      options: ['onUncaughtError', 'onCaughtError', 'onRecoverableError'],
      answer: 1,
      explanation: 'Errors caught by a boundary are reported through onCaughtError.',
    },
  },
  {
    id: 'lazy-code-splitting',
    title: 'Split code with lazy()',
    topic: 'Performance',
    since: '16.8',
    difficulty: 'Beginner',
    minutes: 2,
    summary:
      'lazy() loads a component\'s code only when it is first rendered, shrinking the initial bundle.',
    body: [
      'Declare lazy components at module top level, never inside another component, or their state resets on every render.',
      'Wrap them in Suspense to show a fallback while the chunk downloads.',
    ],
    points: [
      'lazy(() => import(...))',
      'Declare at the top level',
      'Needs a Suspense boundary',
    ],
    code: `import { lazy, Suspense } from 'react';

const MarkdownPreview = lazy(() => import('./MarkdownPreview'));

function Editor({ showPreview, text }) {
  return showPreview && (
    <Suspense fallback={<p>Loading preview…</p>}>
      <MarkdownPreview text={text} />
    </Suspense>
  );
}`,
    quiz: {
      question: 'Where should you call lazy()?',
      options: ['Inside the component body', 'At module top level', 'Inside useEffect'],
      answer: 1,
      explanation: 'Calling lazy during render creates a new component type each time, losing state.',
    },
  },
  {
    id: 'state-structure',
    title: 'Structure state to avoid contradictions',
    topic: 'Patterns',
    since: '16.8',
    difficulty: 'Intermediate',
    minutes: 2,
    summary:
      'Replace multiple booleans that can conflict with a single status value, and store IDs instead of duplicate objects.',
    body: [
      'isSending and isSent can both be true by mistake. A single status: "typing" | "sending" | "sent" makes impossible states unrepresentable.',
      'Store selectedId rather than a copy of the selected item, so edits to the list are always reflected.',
    ],
    points: [
      'One status instead of many booleans',
      'Store IDs, not copies',
      'Avoid deeply nested state',
    ],
    code: `// ❌
const [isSending, setIsSending] = useState(false);
const [isSent, setIsSent] = useState(false);

// ✅
type Status = 'typing' | 'sending' | 'sent';
const [status, setStatus] = useState<Status>('typing');

// ✅ derive the selected item
const [selectedId, setSelectedId] = useState(items[0].id);
const selected = items.find(i => i.id === selectedId);`,
    quiz: {
      question: 'Why store selectedId instead of selectedItem?',
      options: ['IDs are smaller', 'The copy can go stale when the list item changes', 'React forbids objects in state'],
      answer: 1,
      explanation: 'Duplicated data must be kept in sync; deriving from the ID avoids that.',
    },
  },
];
