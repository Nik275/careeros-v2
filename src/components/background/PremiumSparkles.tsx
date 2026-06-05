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

export const PremiumSparkles = memo(function PremiumSparkles() {
  const sparkles = useMemo<Sparkle[]>(() => {
    const items: Sparkle[] = [];
    
    // 35 sparkles with real fade animation
    for (let i = 0; i < 35; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Keep away from center
      if (x > 20 && x < 80 && y > 10 && y < 90) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 18 : 82 + Math.random() * 18;
        } else {
          y = y < 50 ? Math.random() * 6 : 94 + Math.random() * 6;
        }
      }
      
      items.push({
        id: i,
        x,
        y,
        size: 1.2 + Math.random() * 2,
        duration: 4 + Math.random() * 5, // 4-9 seconds
        delay: Math.random() * 15,
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
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size * 2.5}px ${sparkle.size}px rgba(255,255,255,0.5)`,
            willChange: 'opacity, transform',
            animation: `sparkleFade ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
});

export default PremiumSparkles;
