import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <div className={`relative inline-block overflow-hidden rounded-2xl ${className}`}>
      <img
        src="/tzedaka-logo.svg"
        alt="Tzedaka Tracker logo"
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
