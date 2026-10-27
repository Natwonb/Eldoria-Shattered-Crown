import React from 'react';
import { X, Scroll } from 'lucide-react';

export default function NoticeBanner({ notice, onDismiss }) {
  if (!notice) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-5 md:justify-end md:px-6">
      <div className="animate-rise pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-sm border border-primary/40 bg-[#14100b]/95 px-4 py-3 shadow-[0_24px_60px_-30px_#000] backdrop-blur">
        <Scroll size={18} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-primary">{notice.title}</p>
          {notice.text && <p className="mt-1 text-sm leading-snug text-foreground/85">{notice.text}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground transition hover:text-foreground"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}