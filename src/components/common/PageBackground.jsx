import React from 'react';

/**
 * Subtle dot-grid overlay for customer-facing pages (kshatr.com).
 * Fixed layer, pointer-events none, very low opacity — readability first.
 */
export default function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] select-none"
      aria-hidden="true"
    >
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
