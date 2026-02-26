import React, { useId } from 'react';

function MarkShape({ bgId, mintId }) {
  return (
    <>
      <rect x="6" y="6" width="208" height="208" rx="36" fill={`url(#${bgId})`} />

      <circle cx="112" cy="72" r="34" fill={`url(#${mintId})`} />
      <text
        x="112"
        y="73"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1e64f0"
        fontFamily="Inter, Manrope, Arial, sans-serif"
        fontSize="45"
        fontWeight="800"
      >
        $
      </text>

      <path
        d="M46 134 L84 116 Q92 112 102 112 L152 116 Q164 118 165 128 Q165 138 152 139 L104 140"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M72 155 Q82 148 97 149 L150 151 Q160 152 168 143 L193 116 Q200 108 196 103 Q192 98 184 105 L159 128"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function MarkDefs({ bgId, mintId }) {
  return (
    <defs>
      <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e64f0" />
        <stop offset="100%" stopColor="#1a4fd3" />
      </linearGradient>
      <linearGradient id={mintId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60f3d0" />
        <stop offset="100%" stopColor="#63e5c8" />
      </linearGradient>
    </defs>
  );
}

function IconMark({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const bgId = `tt-bg-${id}`;
  const mintId = `tt-mint-${id}`;

  return (
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Tzedaka Tracker logo icon">
      <MarkDefs bgId={bgId} mintId={mintId} />
      <MarkShape bgId={bgId} mintId={mintId} />
    </svg>
  );
}

function FullLogo({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const bgId = `tt-bg-${id}`;
  const mintId = `tt-mint-${id}`;

  return (
    <svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Tzedaka Tracker logo">
      <MarkDefs bgId={bgId} mintId={mintId} />
      <MarkShape bgId={bgId} mintId={mintId} />

      <text x="252" y="105" fontFamily="Inter, Manrope, Arial, sans-serif" fontSize="80" fontWeight="800" fill="#2462e8">
        Tzedaka
      </text>
      <text x="252" y="186" fontFamily="Inter, Manrope, Arial, sans-serif" fontSize="80" fontWeight="800" fill="#2462e8">
        Tracker
      </text>
    </svg>
  );
}

export default function TzedakaLogo({ className = '', variant = 'full' }) {
  return variant === 'icon' ? <IconMark className={className} /> : <FullLogo className={className} />;
}
