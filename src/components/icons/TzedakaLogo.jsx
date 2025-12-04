import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <div className={`relative inline-block overflow-hidden rounded-2xl ${className}`} role="img" aria-label="Tzedaka Tracker logo">
      <svg
        viewBox="0 0 640 200"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="tt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e64f0" />
            <stop offset="100%" stopColor="#1344a3" />
          </linearGradient>
        </defs>

        <rect x="16" y="16" width="168" height="168" rx="40" fill="url(#tt-bg)" />
        <circle cx="140" cy="70" r="48" fill="#58f5d0" stroke="#1e64f0" strokeWidth="6" />
        <path
          d="M140 46c-13 0-24 6-24 17 0 26 48 12 48 36 0 11-10 19-24 19s-24-8-24-19"
          fill="none"
          stroke="#1e64f0"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="9"
        />
        <path
          d="M140 36v15m0 74v-15"
          fill="none"
          stroke="#1e64f0"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="9"
        />
        <path
          d="M60 118c14 26 47 48 82 48h40c10 0 19-9 19-19s-9-19-19-19h-52c-15 0-29-8-38-20"
          fill="none"
          stroke="#58f5d0"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M88 127c12 22 38 37 65 37h18c8 0 15-7 15-15s-7-15-15-15h-41"
          fill="none"
          stroke="#58f5d0"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="220"
          y="110"
          fontFamily="'Inter', 'Manrope', 'Helvetica', 'Arial', sans-serif"
          fontSize="52"
          fontWeight="700"
          fill="#0f172a"
        >
          Tzedaka Tracker
        </text>
        <text
          x="220"
          y="146"
          fontFamily="'Inter', 'Manrope', 'Helvetica', 'Arial', sans-serif"
          fontSize="22"
          fontWeight="500"
          fill="#334155"
        >
          Giving, organized.
        </text>
      </svg>
    </div>
  );
}
