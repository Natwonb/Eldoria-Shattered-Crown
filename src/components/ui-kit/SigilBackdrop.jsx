import React from 'react';
import Sigil from './Sigil';

// Heraldic stand-in for a place that has no illustration yet.
export default function SigilBackdrop({ sigil, color = '#c9a94f', size = 46, className = '' }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: `radial-gradient(circle at 50% 42%, ${color}33, rgba(10,8,6,1) 78%)` }}
    >
      <Sigil name={sigil} size={size} className="text-foreground/35" />
    </div>
  );
}