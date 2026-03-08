'use client';

export function ClozeLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Revenue growth curve — smooth rise through the sales pipeline */}
      <path
        d="M4 32 C10 26, 14 16, 19 13"
        stroke="url(#cloze-rise)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Deal-closed checkmark — the ✓ moment */}
      <path
        d="M19 13 L23 21 L36 5"
        stroke="url(#cloze-check)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Peak glow — success, revenue sealed */}
      <circle cx="36" cy="5" r="3" fill="url(#cloze-peak)" />
      {/* Origin dot — where the journey starts */}
      <circle cx="4" cy="32" r="2" fill="url(#cloze-start)" />
      <defs>
        <linearGradient id="cloze-rise" x1="4" y1="32" x2="19" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="cloze-check" x1="19" y1="13" x2="36" y2="5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.4" stopColor="#a855f7" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
        <radialGradient id="cloze-peak" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d8b4fe" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloze-start" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ClozeWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      Cloze
    </span>
  );
}
