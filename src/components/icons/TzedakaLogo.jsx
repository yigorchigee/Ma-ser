import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Tzedaka Tracker logo</title>
      <defs>
        <linearGradient id="bg" x1="10" x2="54" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ebf8ff" />
          <stop offset="1" stopColor="#cce7ff" />
        </linearGradient>
        <linearGradient id="hand" x1="14" x2="46" y1="36" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#15559b" />
          <stop offset="1" stopColor="#0a3c77" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="10" fill="url(#bg)" />
      <circle cx="44" cy="18" r="11" fill="#0f86c8" stroke="#0a558c" strokeWidth="2" />
      <path
        fill="none"
        stroke="#e6f6ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M44 12v12m-7-6h14"
      />
      <path
        fill="url(#hand)"
        d="M12 36.5c0 2.8 2.2 5 5 5h16.4c1.2 0 2.2.9 2.3 2.1 0 1.1-.9 2-2 2H25c-1.8 0-3.2 1.3-3.2 3 0 1.6 1.4 3 3.2 3h14.5C45.9 51.6 50 47.3 50 42c0-2-1.7-3.7-3.7-3.7H38l-.5-1c-.9-1.8-2.7-3-4.7-3H17c-2.8 0-5-2.2-5-5 0-1.4-1.1-2.5-2.5-2.5S7 27.9 7 29.3c0 3.9 2.8 7.2 5 7.2Z"
      />
      <path
        fill="#0a3c77"
        d="M20.5 43.5c0 1.1.9 2 2 2H30c1.2 0 2.3.8 2.7 1.9l.3.8c.3 1 .9 1.8 1.9 2.2.5.2 1 .3 1.6.3H38c3 0 5.5-2.5 5.5-5.5 0-.7-.6-1.3-1.3-1.3H38c-.6 0-1.2-.3-1.5-.9l-.4-.8c-.6-1.1-1.7-1.7-2.9-1.7H22.5c-1.1 0-2 .9-2 2Z"
      />
    </svg>
  );
}
