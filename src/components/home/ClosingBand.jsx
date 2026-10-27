import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClosingBand() {
  return (
    <section className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="rounded-[2rem] bg-primary px-7 py-12 text-primary-foreground sm:px-12 sm:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary-foreground/60">
                Booking takes two minutes
              </p>
              <h2 className="mt-3 max-w-lg font-heading text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                Pick the day. We&rsquo;ll take the rest from there.
              </h2>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-fit rounded-full bg-background px-7 text-foreground hover:bg-background/90"
            >
              <Link to="/book">
                Schedule a clean
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}