import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { SERVICES, formatDate, getService, getSlot } from '@/lib/cleaningServices';
import ServiceOptions from '@/components/booking/ServiceOptions';
import SchedulePicker from '@/components/booking/SchedulePicker';
import DetailsFields from '@/components/booking/DetailsFields';
import BookingSummary from '@/components/booking/BookingSummary';

const buildForm = (service) => ({
  service_type: service,
  appointment_date: '',
  time_slot: '',
  full_name: '',
  email: '',
  phone: '',
  address_line1: '',
  city: '',
  postal_code: '',
  notes: '',
});

const validate = (form) => {
  const errors = {};
  if (!form.appointment_date) errors.appointment_date = 'Pick a day for the visit.';
  if (!form.time_slot) errors.time_slot = 'Choose an arrival window.';
  if (!form.address_line1.trim()) errors.address_line1 = 'Where should we come?';
  if (!form.city.trim()) errors.city = 'Add a city.';
  if (!form.full_name.trim()) errors.full_name = 'Who should we ask for?';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'A valid email keeps you posted.';
  return errors;
};

const SectionLabel = ({ index, children }) => (
  <div className="flex items-center gap-3">
    <span className="font-heading text-xs tracking-[0.2em] text-muted-foreground">{index}</span>
    <h2 className="font-heading text-lg text-foreground">{children}</h2>
    <span className="h-px flex-1 bg-border/70" />
  </div>
);

export default function Book() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const preset = SERVICES.some((service) => service.value === params.get('service'))
    ? params.get('service')
    : 'standard';

  const [form, setForm] = useState(() => buildForm(preset));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      full_name: current.full_name || user.full_name || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaveError('');
    try {
      const response = await base44.functions.invoke('createBooking', form);
      if (response.data?.error) throw new Error(response.data.error);
      setSaved(response.data.booking);
    } catch (error) {
      setSaveError('We could not save that booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <section className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <div className="rounded-3xl border border-border/80 bg-card p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-light tracking-tight">You&rsquo;re booked.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {getService(saved.service_type).label} · {formatDate(saved.appointment_date)}
            <br />
            {getSlot(saved.time_slot)?.label}
            <br />
            {saved.address_line1}, {saved.city}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/cleanups">See my cleanups</Link>
            </Button>
            <Button
              variant="ghost"
              className="rounded-full px-5"
              onClick={() => {
                setSaved(null);
                setErrors({});
                setForm({ ...buildForm(saved.service_type), full_name: saved.full_name, email: saved.email });
              }}
            >
              Book another
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Schedule a clean</p>
        <h1 className="mt-3 font-heading text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          When and where?
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Four details and it&rsquo;s on the calendar. You&rsquo;ll get a confirmation email, then a
          text when the team is on the way.
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
        <div className="space-y-10">
          <div className="space-y-4">
            <SectionLabel index="01">The clean</SectionLabel>
            <ServiceOptions value={form.service_type} onChange={(value) => change('service_type', value)} />
          </div>

          <div className="space-y-4">
            <SectionLabel index="02">Day and window</SectionLabel>
            <SchedulePicker
              date={form.appointment_date}
              slot={form.time_slot}
              onChange={change}
              errors={errors}
            />
          </div>

          <div className="space-y-4">
            <SectionLabel index="03">Where and who</SectionLabel>
            <DetailsFields form={form} onChange={change} errors={errors} />
          </div>

          {saveError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {saveError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={saving} className="w-full rounded-full sm:w-auto sm:px-10">
            {saving ? 'Saving your clean…' : 'Confirm booking'}
          </Button>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingSummary form={form} />
        </div>
      </form>
    </section>
  );
}