import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const labelClass = 'text-xs uppercase tracking-[0.16em] text-muted-foreground';

export default function DetailsFields({ form, onChange, errors = {} }) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="address_line1" className={labelClass}>Street address</Label>
        <Input
          id="address_line1"
          value={form.address_line1}
          onChange={(event) => onChange('address_line1', event.target.value)}
          placeholder="412 Alder Street, Apt 3"
          className="mt-2 h-11 rounded-xl bg-card"
        />
        {errors.address_line1 && <p className="mt-1.5 text-xs text-destructive">{errors.address_line1}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="city" className={labelClass}>City</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="San Francisco"
            className="mt-2 h-11 rounded-xl bg-card"
          />
          {errors.city && <p className="mt-1.5 text-xs text-destructive">{errors.city}</p>}
        </div>
        <div>
          <Label htmlFor="postal_code" className={labelClass}>Postal code</Label>
          <Input
            id="postal_code"
            value={form.postal_code}
            onChange={(event) => onChange('postal_code', event.target.value)}
            placeholder="94110"
            className="mt-2 h-11 rounded-xl bg-card"
          />
        </div>
      </div>

      <div className="grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name" className={labelClass}>Your name</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(event) => onChange('full_name', event.target.value)}
            placeholder="Jamie Reyes"
            className="mt-2 h-11 rounded-xl bg-card"
          />
          {errors.full_name && <p className="mt-1.5 text-xs text-destructive">{errors.full_name}</p>}
        </div>
        <div>
          <Label htmlFor="email" className={labelClass}>Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="jamie@email.com"
            className="mt-2 h-11 rounded-xl bg-card"
          />
          {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className={labelClass}>Phone (optional)</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          placeholder="(936) 955-0394"
          className="mt-2 h-11 rounded-xl bg-card"
        />
      </div>

      <div>
        <Label htmlFor="notes" className={labelClass}>Anything we should know?</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Gate code, a nervous dog, the tap that squeaks…"
          rows={3}
          className="mt-2 resize-none rounded-xl bg-card"
        />
      </div>
    </div>
  );
}