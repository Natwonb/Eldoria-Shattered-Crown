import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate, getService, getSlot } from '@/lib/cleaningServices';
import { cn } from '@/lib/utils';

const statusStyles = {
  scheduled: 'bg-accent text-accent-foreground',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function BookingCard({ booking, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const service = getService(booking.service_type);
  const slot = getSlot(booking.time_slot);
  const scheduled = booking.status === 'scheduled';

  const cancel = async () => {
    setWorking(true);
    await onCancel(booking.id);
    setWorking(false);
    setConfirming(false);
  };

  return (
    <article className="rounded-3xl border border-border/80 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {formatShortDate(booking.appointment_date)}
          </p>
          <h3 className="mt-2 font-heading text-xl text-foreground">{service.label}</h3>
        </div>
        <Badge className={cn('rounded-full border-0 px-3 py-1 text-[10px] uppercase tracking-[0.14em]', statusStyles[booking.status] || statusStyles.scheduled)}>
          {booking.status}
        </Badge>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-sm text-foreground/80">
        <p className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {formatShortDate(booking.appointment_date)}
        </p>
        <p className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {slot ? slot.label : booking.time_slot}
        </p>
        <p className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {booking.address_line1}, {booking.city}
            {booking.postal_code ? ` ${booking.postal_code}` : ''}
          </span>
        </p>
      </div>

      {booking.notes && (
        <p className="mt-4 rounded-xl bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {booking.notes}
        </p>
      )}

      {scheduled && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
          {confirming ? (
            <>
              <Button size="sm" variant="destructive" className="rounded-full" onClick={cancel} disabled={working}>
                {working ? 'Cancelling…' : 'Yes, cancel it'}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" className="rounded-full px-3 text-muted-foreground hover:text-destructive" onClick={() => setConfirming(true)}>
              Cancel this clean
            </Button>
          )}
        </div>
      )}
    </article>
  );
}