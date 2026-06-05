'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

export const AmbientGlow = memo(function AmbientGlow() {
  return (
    <>
      {/* Blob 1 - Top Left Green */}
      <div
        style={{
          position: 'absolute',
          top: '-12vh',
          left: '-8vw',
          width: '44vw',
          height: '44vw',
          backgroundColor: 'rgba(191,214,181,0.42)',
          borderRadius: '50%',
          filter: 'blur(180px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Blob 2 - Top Right Blue */}
      <div
        style={{
          position: 'absolute',
          top: '-10vh',
          right: '-8vw',
          width: '42vw',
          height: '42vw',
          backgroundColor: 'rgba(209,224,236,0.34)',
          borderRadius: '50%',
          filter: 'blur(180px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Blob 3 - Bottom Gold */}
      <div
        style={{
          position: 'absolute',
          bottom: '-16vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '58vw',
          height: '30vw',
          backgroundColor: 'rgba(243,213,160,0.28)',
          borderRadius: '50%',
          filter: 'blur(140px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
});

export default AmbientGlow;
