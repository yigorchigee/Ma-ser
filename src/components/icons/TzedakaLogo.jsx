import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="img" aria-label="Tzedaka Tracker logo">
      <img src="/tzedaka-tracker-logo.png" alt="Tzedaka Tracker" className="h-full w-full object-contain" />
    </div>
  );
}
