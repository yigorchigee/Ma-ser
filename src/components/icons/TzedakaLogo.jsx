import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <div className={`relative inline-block overflow-hidden rounded-2xl ${className}`}>
      <img
        src="/Tzedaka%20Tracker%20with%20text%20to%20the%20right.png"
        alt="Tzedaka Tracker logo"
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
