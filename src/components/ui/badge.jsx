import React from 'react';

export function Badge({ className = '', variant = 'solid', children, ...props }) {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold';
  const style = variant === 'outline'
    ? 'border border-current text-current'
    : 'bg-gray-200 text-gray-800';

  return (
    <span className={`${baseClasses} ${style} ${className}`} {...props}>
      {children}
    </span>
  );
}
