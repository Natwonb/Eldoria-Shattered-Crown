import React from 'react';

export default function StatBar({
  label,
  value,
  max,
  color = 'hsl(var(--primary))',
  compact = false,
  showNumbers = true,
  className = '',
}) {
  const safeMax = Math.max(1, max || 1);
  const pct = Math.max(0, Math.min(100, (Math.max(0, value || 0) / safeMax) * 100));
  return (
    <div className={className}>
      {(label || showNumbers) && (
        <div className="mb-1 flex items-baseline justify-between gap-3">
          {label && (
            <span
              className={
                compact
                  ? 'whitespace-nowrap font-heading text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground'
                  : 'eyebrow text-muted-foreground'
              }
            >
              {label}
            </span>
          )}
          {showNumbers && (
            <span className={`font-mono ${compact ? 'text-[10px]' : 'text-xs'} text-foreground/80`}>
              {Math.max(0, Math.round(value || 0))} / {Math.round(safeMax)}
            </span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-inset ring-white/5 ${compact ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}