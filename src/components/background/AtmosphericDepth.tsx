'use client';

import { memo } from 'react';

export const AtmosphericDepth = memo(function AtmosphericDepth() {
  return (
    <div
      className="atmospheric-depth"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '65vw',
        height: '65vw',
        background: 'radial-gradient(circle, rgba(230,220,195,0.032) 0%, rgba(230,220,195,0.012) 45%, transparent 72%)',
        borderRadius: '9999px',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
});

export default AtmosphericDepth;
