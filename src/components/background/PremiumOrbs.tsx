'use client';

import { memo } from 'react';

export const PremiumOrbs = memo(function PremiumOrbs() {
  const orbs = [
    {
      id: 1,
      color: 'rgba(166, 178, 158, 0.15)', // soft sage
      size: '45vw',
      x: '-5%',
      y: '10%',
      duration: 24,
      delay: 0,
    },
    {
      id: 2,
      color: 'rgba(218, 198, 158, 0.12)', // warm cream
      size: '38vw',
      x: '70%',
      y: '60%',
      duration: 28,
      delay: 3,
    },
    {
      id: 3,
      color: 'rgba(186, 198, 208, 0.14)', // pale blue
      size: '42vw',
      x: '75%',
      y: '-10%',
      duration: 22,
      delay: 1.5,
    },
    {
      id: 4,
      color: 'rgba(234, 210, 165, 0.13)', // subtle gold
      size: '50vw',
      x: '25%',
      y: '75%',
      duration: 26,
      delay: 5,
    },
  ];

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
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            willChange: 'transform, opacity',
            animation: `orbFloat ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes orbFloat {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.85;
          }
          100% { 
            transform: translate(-60px, 40px) scale(1.08);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default PremiumOrbs;
