import React from 'react';

export default function CharityBoxIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.95" />
      <circle cx="12" cy="12" r="6" fill="white" opacity="0.12" />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="11"
        fontWeight="800"
        opacity="0.9"
      >
        $
      </text>
    </svg>
  );
}
