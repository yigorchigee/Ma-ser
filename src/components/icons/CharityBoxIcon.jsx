import React from 'react';

export default function CharityBoxIcon({ className = "h-6 w-6" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      {/* Coin - bigger and positioned to be partially in slit */}
      <circle cx="12" cy="11" r="5.5" opacity="0.95" />
      <text x="12" y="14" fontSize="7" textAnchor="middle" fill="white" fontWeight="bold">$</text>
      
      {/* Slit/Slot opening - much bigger */}
      <rect x="5" y="15" width="14" height="3" rx="0.5" opacity="0.9" />
    </svg>
  );
}
