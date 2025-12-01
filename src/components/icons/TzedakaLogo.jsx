import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <div className={`relative inline-block overflow-hidden rounded-2xl bg-white ${className}`}>
      <img
        src="/Tzedaka Tracker with text to the right.png"
        alt="Tzedaka Tracker logo"
        className="h-full w-full object-cover object-top"
        loading="lazy"
      />
    </div>
  );
}
