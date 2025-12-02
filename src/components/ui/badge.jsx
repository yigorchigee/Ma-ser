import React from 'react';

export function Badge({ className = '', variant = 'solid', children, ...props }) {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold';
  const hasCustomBackground = /\bbg-[^\s]+/.test(className);
  const hasCustomTextColor = /\btext-[^\s]+/.test(className);

  const style = variant === 'outline'
    ? 'border border-current text-current'
    : [hasCustomBackground ? '' : 'bg-gray-200', hasCustomTextColor ? '' : 'text-gray-800']
        .filter(Boolean)
        .join(' ');

  return (
    <span className={`${baseClasses} ${style} ${className}`} {...props}>
      {children}
    </span>
  );
}
