'use client';

import { memo } from 'react';

export const PremiumVeil = memo(function PremiumVeil() {
  return (
    <div
      className="premium-veil"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.024) 0%, rgba(255,255,255,0.008) 100%)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    />
  );
});

export default PremiumVeil;
