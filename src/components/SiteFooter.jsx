import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg tracking-tight">Let It Shine</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">cleaning co.</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Homes and studios cleaned on a schedule you set, by people who bring their own good cloths.
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Book</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to="/book" className="text-foreground/80 transition hover:text-foreground">Schedule a clean</Link>
              <Link to="/cleanups" className="text-foreground/80 transition hover:text-foreground">My cleanups</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Reach us</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to="/contact" className="text-foreground/80 transition hover:text-foreground">Contact</Link>
              <a href="mailto:letitshine@gmail.com" className="text-foreground/80 transition hover:text-foreground">letitshine@gmail.com</a>
              <a href="tel:+19369550394" className="text-foreground/80 transition hover:text-foreground">(936) 955-0394</a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} Let It Shine Cleaning Service Co. · Insured & vetted
        </p>
      </div>
    </footer>
  );
}