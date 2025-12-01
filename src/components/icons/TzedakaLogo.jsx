import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Tzedaka Tracker logo</title>
      <rect x="32" y="32" width="448" height="448" rx="96" fill="#1e64f0" />
      <circle cx="336" cy="160" r="92" fill="#58f5d0" />
      <path
        d="M336 96v128m-44-64h88"
        fill="none"
        stroke="#1e64f0"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M120 292c26 48 86 86 150 86h72c19 0 34-15 34-34s-15-34-34-34h-96c-28 0-52-14-68-36"
        fill="none"
        stroke="#58f5d0"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M168 308c22 42 70 70 122 70h34c15 0 28-12 28-28s-13-28-28-28h-76"
        fill="none"
        stroke="#58f5d0"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
