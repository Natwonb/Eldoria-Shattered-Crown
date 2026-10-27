import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { SERVICES } from '@/lib/cleaningServices';

export default function ServiceGrid() {
  return (
    <section id="services" className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">What we clean</p>
            <h2 className="mt-3 max-w-lg font-heading text-3xl font-light tracking-tight sm:text-4xl">
              Four ways to hand it over.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Every visit includes supplies, equipment and a checklist you get to keep.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SERVICES.map((service, index) => (
            <Link
              key={service.value}
              to={`/book?service=${service.value}`}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-background p-6 transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
            >
              <span className="font-heading text-xs tracking-[0.2em] text-muted-foreground">
                0{index + 1}
              </span>
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-heading text-xl text-foreground">{service.label}</h3>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.blurb}</p>
              </div>
              <div className="mt-6 flex items-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration}
                </span>
                <span>from ${service.from}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}