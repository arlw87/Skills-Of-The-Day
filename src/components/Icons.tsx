import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
});

export const MenuIcon = (p: P) => (<svg {...base(p)}><path d="M5 9h14M5 15h9" /></svg>);
export const PlusIcon = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const SearchIcon = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const ArrowRight = (p: P) => (<svg {...base(p)}><path d="M4 12h16M14 6l6 6-6 6" /></svg>);
export const ChevronLeft = (p: P) => (<svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>);
export const ChevronRight = (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const ChevronDown = (p: P) => (<svg {...base(p)} strokeWidth={2.2}><path d="m7 10 5 5 5-5" /></svg>);
export const CalendarIcon = (p: P) => (<svg {...base(p)}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>);
export const ShuffleIcon = (p: P) => (<svg {...base(p)}><path d="M3 7h3.5a5 5 0 0 1 4 2l3 4a5 5 0 0 0 4 2H21M3 17h3.5a5 5 0 0 0 4-2M14.5 9a5 5 0 0 1 3-2H21M18 4l3 3-3 3M18 12l3 3-3 3" /></svg>);
export const ShareIcon = (p: P) => (<svg {...base(p)}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></svg>);
export const ClockIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></svg>);
export const BarsIcon = (p: P) => (<svg {...base(p)}><path d="M6 19V13M10 19V8M14 19v-9M18 19V5M4 19h16" /></svg>);
export const PulseIcon = (p: P) => (<svg {...base(p)}><path d="M3 15c2 0 2.5-6 5-6s2.5 8 5 8 2.5-10 5-10c1.5 0 2 2 3 3" /></svg>);
export const BookIcon = (p: P) => (<svg {...base(p)}><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5zM5 20.5A2.5 2.5 0 0 0 7.5 23H19" transform="translate(0 -1.5)" /></svg>);
export const TargetIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></svg>);
export const CopyIcon = (p: P) => (<svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>);
export const CheckIcon = (p: P) => (<svg {...base(p)} strokeWidth={2.2}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const CloseIcon = (p: P) => (<svg {...base(p)} strokeWidth={2}><path d="m7 7 10 10M17 7 7 17" /></svg>);
export const ExpandIcon = (p: P) => (<svg {...base(p)}><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" /></svg>);
export const FilterIcon = (p: P) => (<svg {...base(p)}><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></svg>);
export const LayersIcon = (p: P) => (<svg {...base(p)}><path d="m12 4 8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" /></svg>);
export const EditIcon = (p: P) => (<svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>);

/** The React-ish atom used for the logo. */
export const AtomIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={1.4} viewBox="-12 -12 24 24">
    <circle r="2" fill="currentColor" stroke="none" />
    <ellipse rx="10" ry="4" />
    <ellipse rx="10" ry="4" transform="rotate(60)" />
    <ellipse rx="10" ry="4" transform="rotate(120)" />
  </svg>
);

/** Sunburst used on the quiz card (mirrors the "wallet verification" illustration). */
export const Sunburst = (p: P) => (
  <svg width="58" height="58" viewBox="-30 -30 60 60" aria-hidden {...p}>
    <circle r="9" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
    {Array.from({ length: 16 }, (_, i) => (
      <line
        key={i}
        x1="0" y1="-13" x2="0" y2={i % 2 ? -22 : -28}
        stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"
        transform={`rotate(${i * 22.5})`}
      />
    ))}
  </svg>
);
