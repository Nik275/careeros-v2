'use client';

import { memo } from 'react';

export const WarmAmbient = memo(function WarmAmbient() {
  return (
    <div
      className="warm-ambient"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '52vw',
        height: '52vw',
        background: 'radial-gradient(circle, rgba(244,224,180,0.058) 0%, rgba(244,224,180,0.022) 42%, transparent 74%)',
        borderRadius: '9999px',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
});

export default WarmAmbient;
