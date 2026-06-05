'use client';

import { memo, useMemo } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'fade' | 'twinkle' | 'breathe';
}

export const MicroSparkles = memo(function MicroSparkles() {
  const sparkles = useMemo<Sparkle[]>(() => {
    const items: Sparkle[] = [];
    
    // Create 50 micro sparkles
    for (let i = 0; i < 50; i++) {
      // Avoid center hero area
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      if (x > 32 && x < 68 && y > 18 && y < 82) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 28 : 72 + Math.random() * 28;
        } else {
          y = y < 50 ? Math.random() * 14 : 86 + Math.random() * 14;
        }
      }
      
      const types: Sparkle['type'][] = ['fade', 'twinkle', 'breathe'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      items.push({
        id: i,
        x,
        y,
        size: 1.5 + Math.random() * 2.5, // 1.5-4px
        duration: 2.5 + Math.random() * 4, // 2.5-6.5s
        delay: Math.random() * 10,
        type,
      });
    }
    
    return items;
  }, []);

  const getAnimationName = (type: Sparkle['type']) => {
    return `sparkle${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  return (
    <div 
      className="micro-sparkles" 
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
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size * 3}px ${sparkle.size * 1.5}px rgba(255,255,255,0.5)`,
            animationName: getAnimationName(sparkle.type),
            animationDuration: `${sparkle.duration}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${sparkle.delay}s`,
            willChange: 'opacity, transform',
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
            opacity: 0.7;
            transform: scale(1);
          }
        }

        @keyframes sparkleTwinkle {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(0.6);
          }
          25% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.1);
          }
          75% {
            opacity: 0.4;
            transform: scale(0.9);
          }
        }

        @keyframes sparkleBreathe {
          0%, 100% { 
            opacity: 0.15;
            transform: scale(0.5);
          }
          50% { 
            opacity: 0.65;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
});

export default MicroSparkles;
