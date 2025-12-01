import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <img
      src="/favicon.png"
      alt="Tzedaka Tracker logo"
      className={className}
      loading="lazy"
    />
  );
}
