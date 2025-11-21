import React from 'react';

export const Button = React.forwardRef(function Button(
  { className = '', variant, size, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
