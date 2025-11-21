import React from 'react';

export function Switch({ id, checked, onCheckedChange, className = '', ...props }) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="sr-only"
        {...props}
      />
      <span
        className={`relative inline-block h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}
