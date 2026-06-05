'use client';

import { memo, useMemo } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const AutonomousSparkles = memo(function AutonomousSparkles() {
  const sparkles = useMemo<Sparkle[]>(() => {
    const items: Sparkle[] = [];
    
    for (let i = 0; i < 60; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Avoid center
      if (x > 32 && x < 68 && y > 20 && y < 80) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 28 : 72 + Math.random() * 28;
        } else {
          y = y < 50 ? Math.random() * 16 : 84 + Math.random() * 16;
        }
      }
      
      items.push({
        id: i,
        x,
        y,
        size: 1.5 + Math.random() * 2.5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 12,
      });
    }
    
    return items;
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 4,
        overflow: 'hidden',
      }}
    >
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            boxShadow: `0 0 ${s.size * 3}px ${s.size * 1.5}px rgba(255,255,255,0.6)`,
            willChange: 'opacity, transform',
            animation: `sparkleFade ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      
      <style jsx global>{`
        @keyframes sparkleFade {
          0%, 100% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% { 
            opacity: 0.75;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
});

export default AutonomousSparkles;
