import React from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { formatDate, getService, getSlot } from '@/lib/cleaningServices';

export default function BookingSummary({ form }) {
  const service = getService(form.service_type);
  const slot = getSlot(form.time_slot);
  const place = [form.address_line1, form.city, form.postal_code].filter(Boolean).join(', ');

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Your clean</p>
      <h3 className="mt-3 font-heading text-xl text-foreground">{service.label}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {service.duration} on site · from ${service.from}
      </p>

      <div className="mt-6 space-y-3 border-t border-border/70 pt-5 text-sm">
        <p className="flex items-start gap-3 text-foreground/80">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{form.appointment_date ? formatDate(form.appointment_date) : 'Choose a day'}</span>
        </p>
        <p className="flex items-start gap-3 text-foreground/80">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{slot ? slot.label : 'Choose a window'}</span>
        </p>
        <p className="flex items-start gap-3 text-foreground/80">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{place || 'Add the address'}</span>
        </p>
      </div>

      <p className="mt-6 border-t border-border/70 pt-5 text-xs leading-relaxed text-muted-foreground">
        You&rsquo;re not charged now. We confirm by email within an hour and settle up after the visit.
      </p>
    </div>
  );
}