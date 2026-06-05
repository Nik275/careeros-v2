'use client';

import { memo, useEffect, useState } from 'react';

export const HeroSpotlight = memo(function HeroSpotlight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '55vw',
        height: '55vh',
        marginLeft: '-27.5vw',
        marginTop: '-27.5vh',
        pointerEvents: 'none',
        zIndex: 4,
        animationName: 'spotlightAutonomousBreathe',
        animationDuration: '14s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse, rgba(252,248,240,0.45) 0%, rgba(252,248,240,0.20) 40%, rgba(252,248,240,0.06) 70%, transparent 90%)',
          borderRadius: '9999px',
          filter: 'blur(60px)',
          transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 20}px, 0)`,
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <style jsx>{`
        @keyframes spotlightAutonomousBreathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.14;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.24;
          }
        }
      `}</style>
    </div>
  );
});

export default HeroSpotlight;
