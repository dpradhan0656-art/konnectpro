import React from 'react';

/**
 * Subtle dot-grid + edge glows for customer-facing pages (kshatr.com).
 * Fixed layer, pointer-events none — readability first; no text watermarks.
 */
export default function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] select-none overflow-hidden"
      aria-hidden="true"
    >
      {/*
        Oversized edge glows (lg+ only): soften empty side margins on large desktops.
        Hidden below lg (1024px) so phones / narrow layouts stay uncluttered.
        Navy left, gold/amber right — pointer-events-none via parent.
      */}
      {/* Faint navy / deep blue — far left */}
      <div
        className="absolute -left-[25%] top-[8%] hidden h-[min(70vh,520px)] w-[min(90vw,560px)] rounded-full bg-blue-950/70 opacity-[0.08] blur-3xl lg:block lg:opacity-[0.09] xl:opacity-[0.1]"
        aria-hidden="true"
      />
      {/* Faint gold / amber — far right */}
      <div
        className="absolute -right-[20%] bottom-[12%] hidden h-[min(65vh,480px)] w-[min(85vw,520px)] rounded-full bg-amber-400/50 opacity-[0.06] blur-3xl lg:block lg:opacity-[0.07] xl:opacity-[0.1]"
        aria-hidden="true"
      />

      {/* Radial dot grid — ~opacity-5 equivalent so text stays crisp */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgb(100 116 139 / 0.5) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
    </div>
  );
}
