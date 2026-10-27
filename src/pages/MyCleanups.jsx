import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import BookingCard from '@/components/booking/BookingCard';

export default function MyCleanups() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);

  const load = async () => {
    const page = await base44.entities.Booking.filter(
      { created_by_id: user.id },
      { sort: '-appointment_date', limit: 50 }
    );
    setBookings(page.items);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const cancel = async (id) => {
    await base44.entities.Booking.update(id, { status: 'cancelled' });
    await load();
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Your schedule</p>
          <h1 className="mt-3 font-heading text-4xl font-light tracking-tight sm:text-5xl">My cleanups</h1>
        </div>
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link to="/book">Book another</Link>
        </Button>
      </div>

      {bookings === null && (
        <div className="mt-12 space-y-4">
          {[0, 1].map((key) => (
            <div key={key} className="h-40 animate-pulse rounded-3xl border border-border/70 bg-card/60" />
          ))}
        </div>
      )}

      {bookings !== null && bookings.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="font-heading text-2xl font-light text-foreground">Nothing on the calendar yet.</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Pick a day and an arrival window — it takes about two minutes.
          </p>
          <Button asChild className="mt-7 rounded-full px-6">
            <Link to="/book">Schedule a clean</Link>
          </Button>
        </div>
      )}

      {bookings !== null && bookings.length > 0 && (
        <div className="mt-10 space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={cancel} />
          ))}
        </div>
      )}
    </section>
  );
}