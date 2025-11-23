import React from 'react';

export function Label({ className = '', children, ...props }) {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`} {...props}>
      {children}
    </label>
  );
}
