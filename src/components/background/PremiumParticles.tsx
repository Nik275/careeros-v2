'use client';

import { memo, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
}

export const PremiumParticles = memo(function PremiumParticles() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    
    // Premium muted color palette
    const colorConfigs = [
      { base: '166, 178, 158', glow: '166, 178, 158' }, // soft sage
      { base: '218, 198, 158', glow: '228, 208, 168' }, // warm cream gold
      { base: '186, 198, 208', glow: '196, 208, 218' }, // pale blue
      { base: '252, 248, 240', glow: '255, 252, 245' }, // off-white glow
    ];
    
    // 55 particles - noticeably larger and more visible
    for (let i = 0; i < 55; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Keep hero area completely clean - wider exclusion zone
      const inHeroX = x > 10 && x < 90;
      const inHeroY = y > 2 && y < 98;
      
      if (inHeroX && inHeroY) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 8 : 92 + Math.random() * 8;
        } else {
          y = y < 50 ? Math.random() * 2 : 98 + Math.random() * 2;
        }
      }
      
      // Much larger size distribution
      const sizeRoll = Math.random();
      let size: number;
      let opacityBase: number;
      
      if (sizeRoll < 0.45) {
        // Small: 10-16px
        size = 10 + Math.random() * 6;
        opacityBase = 0.35 + Math.random() * 0.15;
      } else if (sizeRoll < 0.82) {
        // Medium: 18-28px
        size = 18 + Math.random() * 10;
        opacityBase = 0.5 + Math.random() * 0.15;
      } else {
        // Large accent: 30-42px (few)
        size = 30 + Math.random() * 12;
        opacityBase = 0.6 + Math.random() * 0.1;
      }
      
      const colorConfig = colorConfigs[Math.floor(Math.random() * colorConfigs.length)];
      
      const delay = Math.random() * 18;
      
      // STRONG visible movement: translateY ±80px, translateX ±50px
      const moveX = (Math.random() - 0.5) * 100;
      const moveY = (Math.random() - 0.5) * 160;
      
      items.push({
        id: i,
        x,
        y,
        size,
        color: `rgba(${colorConfig.base}, ${opacityBase})`,
        glowColor: `rgba(${colorConfig.glow}, ${opacityBase * 0.8})`,
        duration: 8 + Math.random() * 8, // 8-16s
        delay,
        moveX,
        moveY,
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
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle at 35% 35%, ${p.color}, ${p.glowColor})`,
            borderRadius: '50%',
            // Reduced blur for more visibility
            filter: `blur(${p.size < 18 ? 5 : p.size < 30 ? 8 : 12}px)`,
            // Stronger glow
            boxShadow: `
              inset 0 0 ${p.size * 0.6}px rgba(255,255,255,0.5),
              0 0 ${p.size * 2}px ${p.size * 0.8}px ${p.glowColor},
              0 0 ${p.size * 4}px ${p.size * 1.5}px ${p.glowColor.replace(/[\d.]+\)$/, '0.25)')}
            `,
            willChange: 'transform, opacity',
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes particleFloat {
          0% { 
            transform: translate3d(0, 0, 0) scale(0.9); 
            opacity: 0.35; 
          }
          50% {
            opacity: 0.85;
          }
          100% { 
            transform: translate3d(var(--tx, 30px), var(--ty, -50px), 0) scale(1.15); 
            opacity: 0.35; 
          }
        }
      `}</style>
    </div>
  );
});

export default PremiumParticles;
