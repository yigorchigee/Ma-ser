import React from 'react';

export default function CharityBoxIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.95" />
      <circle cx="12" cy="12" r="10" fill="white" opacity="0.12" />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="middle"
        alignmentBaseline="middle"
        fill="white"
        fontSize="13"
        fontWeight="900"
        opacity="0.9"
      >
        $
      </text>
    </svg>
  );
}
