import React from 'react';
import { SERVICES } from '@/lib/cleaningServices';
import { cn } from '@/lib/utils';

export default function ServiceOptions({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SERVICES.map((service) => {
        const active = value === service.value;
        return (
          <button
            key={service.value}
            type="button"
            onClick={() => onChange(service.value)}
            className={cn(
              'rounded-2xl border p-4 text-left transition duration-200',
              active
                ? 'border-primary bg-accent/70 shadow-[0_14px_30px_-24px_rgba(12,44,37,0.6)]'
                : 'border-border bg-card hover:border-primary/40 hover:bg-card/70'
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{service.label}</span>
              <span className="text-[11px] text-muted-foreground">from ${service.from}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{service.blurb}</p>
          </button>
        );
      })}
    </div>
  );
}