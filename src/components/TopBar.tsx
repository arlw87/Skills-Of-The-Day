import { AtomIcon, MenuIcon, PlusIcon, SearchIcon } from './Icons';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  onSubmitSearch: () => void;
  onOpenLibrary: () => void;
  readCount: number;
}

function rank(read: number) {
  if (read >= 30) return 'Staff Engineer';
  if (read >= 20) return 'Senior Dev';
  if (read >= 10) return 'Mid-level Dev';
  if (read >= 3) return 'Junior Dev';
  return 'Curious Learner';
}

export function TopBar({ query, onQuery, onSubmitSearch, onOpenLibrary, readCount }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <button className="icon-btn white" aria-label="Open lesson library" onClick={onOpenLibrary}>
          <MenuIcon />
        </button>
        <div className="logo" aria-hidden>
          <AtomIcon width={30} height={30} />
        </div>
        <div className="brand-text">
          <strong>Skills of the Day</strong>
          <span>Modern React</span>
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn outline" aria-label="Browse all lessons" onClick={onOpenLibrary}>
          <PlusIcon />
        </button>
        <div className="user">
          <div className="avatar" aria-hidden>
            <AtomIcon width={26} height={26} />
          </div>
          <div>
            <strong>React Learner</strong>
            <span>{rank(readCount)}</span>
          </div>
        </div>
        <form
          className="search"
          role="search"
          onSubmit={e => {
            e.preventDefault();
            onSubmitSearch();
          }}
        >
          <label className="icon-btn outline" htmlFor="top-search" aria-label="Search lessons">
            <SearchIcon />
          </label>
          <input
            id="top-search"
            type="search"
            placeholder="Search lessons…"
            value={query}
            onChange={e => onQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
