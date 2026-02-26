import React, { useId } from 'react';

function LogoDefs({ bgId, mintId }) {
  return (
    <defs>
      <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1d67ef" />
        <stop offset="100%" stopColor="#255ee3" />
      </linearGradient>
      <linearGradient id={mintId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5df1ce" />
        <stop offset="100%" stopColor="#66e7c6" />
      </linearGradient>
    </defs>
  );
}

function LogoMarkShape({ bgId, mintId }) {
  return (
    <>
      <rect x="6" y="6" width="228" height="228" rx="40" fill={`url(#${bgId})`} />
      <circle cx="120" cy="72" r="34" fill={`url(#${mintId})`} />
      <text
        x="120"
        y="72"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1f57d7"
        fontSize="44"
        fontWeight="700"
        fontFamily="Inter, Manrope, Arial, sans-serif"
      >
        $
      </text>
      <path
        d="M48 141 L84 122 Q92 118 101 118 L155 122 Q167 123 168 132 Q167 141 155 142 L104 143"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 154 L160 156 Q168 156 173 150 L204 117 Q209 111 205 106 Q202 101 195 107 L165 132"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function LogoMark({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const bgId = `tt-mark-bg-${id}`;
  const mintId = `tt-mint-${id}`;

  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tzedaka Tracker logo mark"
    >
      <LogoDefs bgId={bgId} mintId={mintId} />
      <LogoMarkShape bgId={bgId} mintId={mintId} />
    </svg>
  );
}

function FullLogo({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const bgId = `tt-mark-bg-${id}`;
  const mintId = `tt-mint-${id}`;

  return (
    <svg
      viewBox="0 0 900 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tzedaka Tracker logo"
    >
      <LogoDefs bgId={bgId} mintId={mintId} />
      <g transform="translate(0,10)">
        <LogoMarkShape bgId={bgId} mintId={mintId} />
      </g>
      <text
        x="280"
        y="122"
        fill="#2462e8"
        fontSize="92"
        fontWeight="800"
        fontFamily="Inter, Manrope, Arial, sans-serif"
      >
        Tzedaka
      </text>
      <text
        x="280"
        y="214"
        fill="#2462e8"
        fontSize="92"
        fontWeight="800"
        fontFamily="Inter, Manrope, Arial, sans-serif"
      >
        Tracker
      </text>
    </svg>
  );
}

export default function TzedakaLogo({ className = '', variant = 'full' }) {
  return variant === 'icon' ? <LogoMark className={className} /> : <FullLogo className={className} />;
}
