'use client';

import { memo } from 'react';

export const PremiumGlows = memo(function PremiumGlows() {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Top-left: Soft sage breathing glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(166,194,158,0.14) 0%, rgba(166,194,158,0.06) 40%, transparent 70%)',
          filter: 'blur(55px)',
          willChange: 'transform, opacity',
          animation: 'glowSageBreathing 16s ease-in-out infinite alternate',
        }}
      />

      {/* Top-right: Soft blue breathing glow */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-8%',
          width: '48vw',
          height: '48vw',
          background: 'radial-gradient(circle, rgba(186,208,220,0.12) 0%, rgba(186,208,220,0.04) 42%, transparent 72%)',
          filter: 'blur(50px)',
          willChange: 'transform, opacity',
          animation: 'glowBlueBreathing 19s ease-in-out infinite alternate',
        }}
      />

      {/* Bottom-center: Warm gold breathing glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-18%',
          left: '50%',
          width: '65vw',
          height: '50vw',
          background: 'radial-gradient(ellipse at center, rgba(234,198,142,0.12) 0%, rgba(234,198,142,0.04) 45%, transparent 75%)',
          filter: 'blur(45px)',
          willChange: 'transform, opacity',
          animation: 'glowGoldBreathing 14s ease-in-out infinite alternate',
        }}
      />

      {/* Center: Cool white depth breathing */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          width: '45vw',
          height: '45vh',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(252,250,245,0.04) 50%, transparent 80%)',
          filter: 'blur(35px)',
          willChange: 'opacity, transform',
          animation: 'glowWhiteBreathing 17s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
});

export default PremiumGlows;
