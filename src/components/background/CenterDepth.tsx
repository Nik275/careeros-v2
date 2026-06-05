'use client';

import { memo } from 'react';

export const CenterDepth = memo(function CenterDepth() {
  return (
    <div
      className="center-depth"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '48vw',
        height: '48vw',
        background: 'radial-gradient(circle, rgba(255,255,255,0.072) 0%, rgba(255,255,255,0.028) 38%, transparent 72%)',
        borderRadius: '9999px',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
});

export default CenterDepth;
