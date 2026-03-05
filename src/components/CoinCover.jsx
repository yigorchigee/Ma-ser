import React from 'react';

/**
 * CoinCover - A decorative coin SVG used as the website cover/hero image.
 * Renders a gold coin styled with the Ma'ser (Tzedaka Tracker) branding,
 * featuring the Hebrew letter Mem (מ) and a decorative border.
 */
export default function CoinCover({ size = 320, className = '' }) {
  const r = size / 2;
  const innerR = r * 0.82;
  const ringR = r * 0.91;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ma'ser coin cover"
      role="img"
    >
      <defs>
        {/* Radial gradient for gold coin shine */}
        <radialGradient id="coinGold" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff7c0" />
          <stop offset="30%" stopColor="#f5c842" />
          <stop offset="70%" stopColor="#c8930a" />
          <stop offset="100%" stopColor="#7a5300" />
        </radialGradient>

        {/* Inner face gradient */}
        <radialGradient id="coinFace" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#fff3a0" />
          <stop offset="50%" stopColor="#e8b020" />
          <stop offset="100%" stopColor="#a06800" />
        </radialGradient>

        {/* Drop shadow filter */}
        <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="8" stdDeviation="10" floodColor="#7a5300" floodOpacity="0.45" />
        </filter>

        {/* Inner glow for the face */}
        <filter id="faceGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer coin body with shadow */}
      <circle
        cx={r}
        cy={r}
        r={r - 4}
        fill="url(#coinGold)"
        filter="url(#coinShadow)"
      />

      {/* Outer edge ring (reeded border) */}
      <circle
        cx={r}
        cy={r}
        r={ringR}
        fill="none"
        stroke="#d4a017"
        strokeWidth="3"
        strokeDasharray="6 4"
        opacity="0.7"
      />

      {/* Inner raised face */}
      <circle
        cx={r}
        cy={r}
        r={innerR}
        fill="url(#coinFace)"
        stroke="#c8930a"
        strokeWidth="2"
      />

      {/* Decorative inner ring */}
      <circle
        cx={r}
        cy={r}
        r={innerR * 0.9}
        fill="none"
        stroke="#f5c842"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Hebrew letter Mem (מ) - centerpiece */}
      <text
        x={r}
        y={r + size * 0.13}
        textAnchor="middle"
        fontSize={size * 0.38}
        fontFamily="serif"
        fontWeight="bold"
        fill="#7a4e00"
        opacity="0.85"
        filter="url(#faceGlow)"
      >
        מ
      </text>

      {/* Top arc text: MA'SER */}
      <path
        id="topArc"
        d={`M ${r - innerR * 0.7},${r} A ${innerR * 0.7},${innerR * 0.7} 0 0,1 ${r + innerR * 0.7},${r}`}
        fill="none"
      />
      <text fontSize={size * 0.075} fontFamily="serif" fontWeight="bold" fill="#7a4e00" opacity="0.9">
        <textPath href="#topArc" startOffset="10%" textAnchor="middle">
          ✦ MA&apos;SER ✦
        </textPath>
      </text>

      {/* Bottom arc text: TZEDAKA TRACKER */}
      <path
        id="bottomArc"
        d={`M ${r - innerR * 0.72},${r} A ${innerR * 0.72},${innerR * 0.72} 0 0,0 ${r + innerR * 0.72},${r}`}
        fill="none"
      />
      <text fontSize={size * 0.065} fontFamily="serif" fill="#7a4e00" opacity="0.85">
        <textPath href="#bottomArc" startOffset="8%" textAnchor="middle">
          TZEDAKA TRACKER
        </textPath>
      </text>

      {/* Highlight sheen on top-left */}
      <ellipse
        cx={r * 0.72}
        cy={r * 0.62}
        rx={r * 0.22}
        ry={r * 0.12}
        fill="white"
        opacity="0.28"
        transform={`rotate(-30, ${r * 0.72}, ${r * 0.62})`}
      />
    </svg>
  );
}
