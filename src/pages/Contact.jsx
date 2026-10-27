import React, { useEffect, useState } from 'react';
import { Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const labelClass = 'text-xs uppercase tracking-[0.16em] text-muted-foreground';

const details = [
  { icon: Phone, label: 'Call or text', value: '(936) 955-0394', href: 'tel:+19369550394' },
  { icon: Mail, label: 'Email', value: 'letitshine@gmail.com', href: 'mailto:letitshine@gmail.com' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat, 8am – 6pm' },
  { icon: MapPin, label: 'We clean', value: 'San Francisco & the Peninsula' },
];

const emptyForm = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.full_name || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'A valid email lets us reply.';
    if (!form.message.trim()) nextErrors.message = 'A sentence is plenty.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    await base44.entities.ContactMessage.create(form);
    setSending(false);
    setSent(true);
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Contact</p>
        <h1 className="mt-3 font-heading text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Say hello.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Questions about a quote, a recurring schedule, or a place that needs more than one visit —
          write to us and a real person answers, usually within a business day.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <dl className="space-y-6 border-t border-border/70 pt-8">
          {details.map((item) => (
            <div key={item.label} className="flex gap-4">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {item.href ? (
                    <a href={item.href} className="transition hover:text-primary">{item.value}</a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-light">Message received.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                We&rsquo;ll reply to {form.email} shortly. If it&rsquo;s urgent, call (936) 955-0394.
              </p>
              <Button
                variant="ghost"
                className="mt-6 rounded-full px-5"
                onClick={() => {
                  setSent(false);
                  setForm({ ...emptyForm, name: form.name, email: form.email });
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact_name" className={labelClass}>Name</Label>
                  <Input
                    id="contact_name"
                    value={form.name}
                    onChange={(event) => change('name', event.target.value)}
                    placeholder="Jamie Reyes"
                    className="mt-2 h-11 rounded-xl bg-background"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="contact_email" className={labelClass}>Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={form.email}
                    onChange={(event) => change('email', event.target.value)}
                    placeholder="jamie@email.com"
                    className="mt-2 h-11 rounded-xl bg-background"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="contact_phone" className={labelClass}>Phone (optional)</Label>
                <Input
                  id="contact_phone"
                  value={form.phone}
                  onChange={(event) => change('phone', event.target.value)}
                  placeholder="(936) 955-0394"
                  className="mt-2 h-11 rounded-xl bg-background"
                />
              </div>

              <div>
                <Label htmlFor="contact_message" className={labelClass}>Message</Label>
                <Textarea
                  id="contact_message"
                  value={form.message}
                  onChange={(event) => change('message', event.target.value)}
                  placeholder="We have a two-bedroom in the Mission and would like a fortnightly clean…"
                  rows={5}
                  className="mt-2 resize-none rounded-xl bg-background"
                />
                {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
              </div>

              <Button type="submit" size="lg" disabled={sending} className="w-full rounded-full">
                {sending ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}