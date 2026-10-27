import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

const HERO_IMAGE = 'https://media.base44.com/images/public/6ad8a26c8ef4687f81fa83b8/cde3d8d39_generated_image.png';

const assurances = ['Insured & vetted', 'Everything supplied', 'Saturday openings'];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Home &amp; studio cleaning
          </p>
          <h1 className="mt-5 font-heading text-[2.6rem] font-light leading-[1.02] tracking-[-0.015em] text-foreground sm:text-6xl">
            A calmer home,
            <br />
            <span className="italic text-primary">booked</span> in minutes.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Choose the clean, pick a day and an arrival window, and tell us where to come.
            We bring everything — including the good cloths.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/book">
                Book a clean
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-5 text-foreground/70 hover:text-foreground">
              <Link to="/contact">Ask a question</Link>
            </Button>
          </div>

          <ul className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-xs text-muted-foreground">
            {assurances.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative h-[400px] w-full overflow-hidden rounded-[1.75rem] border border-border/60 bg-secondary sm:h-[520px]">
            <Image
              src={HERO_IMAGE}
              alt="A sunlit living room after a Let It Shine clean"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 rounded-2xl border border-border/70 bg-card/95 px-5 py-3.5 shadow-[0_20px_45px_-28px_rgba(12,44,37,0.55)] backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Next opening</p>
            <p className="mt-1 font-heading text-lg leading-tight">Tomorrow, 10:00 AM</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}