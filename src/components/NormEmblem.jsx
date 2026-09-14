export default function NormEmblem({ compact = false, title = 'Н.О.Р.М.' }) {
  return (
    <svg
      className={`norm-emblem ${compact ? 'norm-emblem--compact' : ''}`}
      viewBox="0 0 140 140"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="norm-metal" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e4dfd1" />
          <stop offset="0.5" stopColor="#a9aa9f" />
          <stop offset="1" stopColor="#6c746f" />
        </linearGradient>
        <filter id="norm-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle className="norm-emblem__ring norm-emblem__ring--outer" cx="70" cy="60" r="50" />
      <circle className="norm-emblem__ring norm-emblem__ring--inner" cx="70" cy="60" r="39" />
      <path className="norm-emblem__horizon" d="M25 76 C42 68, 52 72, 68 67 C84 62, 98 66, 116 72" />
      <path className="norm-emblem__mountain" d="M30 79 L48 60 L61 73 L78 52 L101 80 Z" />

      <g className="norm-emblem__tower" fill="none" stroke="url(#norm-metal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M70 33 L51 99 H89 Z" />
        <path d="M58 73 H82 M55 84 H85 M61 61 H79" />
        <path d="M70 33 V23" />
        <path d="M62 98 H78" />
        <path d="M58 106 H82" />
      </g>

      <g className="norm-emblem__signal" fill="none" stroke="#b6c0b9" strokeLinecap="round">
        <path d="M57 31 C60 23, 64 19, 70 17" />
        <path d="M83 31 C80 23, 76 19, 70 17" />
        <path d="M49 27 C54 14, 62 9, 70 7" />
        <path d="M91 27 C86 14, 78 9, 70 7" />
      </g>

      <g className="norm-emblem__star" filter="url(#norm-soft-glow)">
        <path d="M70 3.5 L72.5 10.5 L80 10.8 L74 15 L76 22 L70 18 L64 22 L66 15 L60 10.8 L67.5 10.5 Z" />
      </g>

      <path className="norm-emblem__base" d="M34 111 H106 L112 120 H28 Z" />
      <text className="norm-emblem__wordmark" x="70" y="118" textAnchor="middle">Н.О.Р.М.</text>
      <text className="norm-emblem__micro" x="70" y="133" textAnchor="middle">INTERNAL FIELD UNIT</text>
    </svg>
  )
}
