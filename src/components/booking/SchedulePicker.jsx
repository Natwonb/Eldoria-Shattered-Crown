import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TIME_SLOTS, todayISO } from '@/lib/cleaningServices';
import { cn } from '@/lib/utils';

export default function SchedulePicker({ date, slot, onChange, errors = {} }) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="appointment_date" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Day
        </Label>
        <Input
          id="appointment_date"
          type="date"
          min={todayISO()}
          value={date}
          onChange={(event) => onChange('appointment_date', event.target.value)}
          className="mt-2 h-11 rounded-xl bg-card"
        />
        {errors.appointment_date && <p className="mt-1.5 text-xs text-destructive">{errors.appointment_date}</p>}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Arrival window</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TIME_SLOTS.map((option) => {
            const active = slot === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('time_slot', option.value)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-xs transition duration-200',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.time_slot && <p className="mt-1.5 text-xs text-destructive">{errors.time_slot}</p>}
      </div>
    </div>
  );
}