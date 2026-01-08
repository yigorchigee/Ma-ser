import logo from '../../../image.png';
import React from 'react';

export default function TzedakaLogo({ className = '' }) {
  return (
    <img
      src={logo}
      alt="Tzedaka Tracker Logo"
      className={className}
    />
  );
}
