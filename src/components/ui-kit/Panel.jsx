import React from 'react';

export default function Panel({ children, className = '', glow = false }) {
  return (
    <section className={`stone-panel rounded-sm ${glow ? 'stone-panel-raised' : ''} ${className}`}>
      {children}
    </section>
  );
}