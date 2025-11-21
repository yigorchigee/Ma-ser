import React from 'react';

function collectItems(children, items = []) {
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === SelectItem) {
      items.push(child);
    } else if (child.props && child.props.children) {
      collectItems(child.props.children, items);
    }
  });
  return items;
}

export function Select({ value, onValueChange, children, className = '' }) {
  const items = collectItems(children);

  return (
    <select
      className={`border border-gray-300 rounded-md px-3 py-2 bg-white ${className}`}
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {items.map((item, index) => (
        <option
          key={index}
          value={item.props.value}
          disabled={item.props.disabled}
          className={item.props.className}
        >
          {item.props.children}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return children;
}

export function SelectValue({ placeholder }) {
  return <option value="" disabled hidden>{placeholder}</option>;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ children }) {
  return <>{children}</>;
}
