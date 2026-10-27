import React from 'react';
import { Image } from '@/components/ui/image';

const IMAGE = 'https://media.base44.com/images/public/6ad8a26c8ef4687f81fa83b8/75b4a585b_generated_image.png';

const steps = [
  {
    title: 'Choose the clean',
    copy: 'Standard, deep, move-out or office. Each one is a fixed list of what gets done.',
  },
  {
    title: 'Pick a day and window',
    copy: 'Two-hour arrival windows, seven days a week, including Saturday mornings.',
  },
  {
    title: 'Tell us where',
    copy: 'Street, city, and anything we should know — the code, the dog, the tricky tap.',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-border/60 bg-secondary">
            <Image src={IMAGE} alt="Folded cloths and supplies on a stone ledge" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">How it works</p>
          <h2 className="mt-3 font-heading text-3xl font-light tracking-tight sm:text-4xl">
            Three steps, then it&rsquo;s handled.
          </h2>

          <ol className="mt-10 space-y-8">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-5 border-b border-border/70 pb-8 last:border-0 last:pb-0">
                <span className="font-heading text-sm text-muted-foreground">0{index + 1}</span>
                <div>
                  <h3 className="font-heading text-lg text-foreground">{step.title}</h3>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}