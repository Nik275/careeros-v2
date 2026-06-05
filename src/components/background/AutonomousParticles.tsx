'use client';

import { memo, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  hasGlow: boolean;
  baseOpacity: number;
  animDuration: number;
  animDelay: number;
  moveX: number;
  moveY: number;
  animType: 'drift' | 'rise' | 'orbit' | 'pulse';
  layer: number;
}

export const AutonomousParticles = memo(function AutonomousParticles() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    
    const colors = [
      { main: 'rgba(166,194,158,', glow: 'rgba(166,194,158,0.4)' },
      { main: 'rgba(234,198,142,', glow: 'rgba(234,198,142,0.4)' },
      { main: 'rgba(186,208,220,', glow: 'rgba(186,208,220,0.4)' },
      { main: 'rgba(252,248,240,', glow: 'rgba(252,248,240,0.4)' },
    ];
    
    // 100 particles with real autonomous animation
    for (let i = 0; i < 100; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Keep away from center hero area
      if (x > 30 && x < 70 && y > 18 && y < 82) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 26 : 74 + Math.random() * 26;
        } else {
          y = y < 50 ? Math.random() * 14 : 86 + Math.random() * 14;
        }
      }
      
      // Size distribution
      const sizeRoll = Math.random();
      let size: number;
      if (sizeRoll < 0.35) {
        size = 2 + Math.random() * 2;
      } else if (sizeRoll < 0.8) {
        size = 5 + Math.random() * 3;
      } else {
        size = 10 + Math.random() * 6;
      }
      
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      const hasGlow = Math.random() > 0.5;
      const baseOpacity = 0.22 + Math.random() * 0.33;
      
      // Random duration 18-45s
      const animDuration = 18 + Math.floor(Math.random() * 28);
      const animDelay = Math.random() * 15;
      
      // Movement type
      const types: Particle['animType'][] = ['drift', 'rise', 'orbit', 'pulse'];
      const animType = types[Math.floor(Math.random() * types.length)];
      
      // Movement distance 10-50px
      let moveX = 0, moveY = 0;
      
      switch(animType) {
        case 'drift':
          moveX = (Math.random() - 0.5) * 50;
          moveY = (Math.random() - 0.5) * 40;
          break;
        case 'rise':
          moveX = (Math.random() - 0.5) * 20;
          moveY = -25 - Math.random() * 25;
          break;
        case 'orbit':
          const angle = Math.random() * Math.PI * 2;
          const radius = 15 + Math.random() * 35;
          moveX = Math.cos(angle) * radius;
          moveY = Math.sin(angle) * radius;
          break;
        case 'pulse':
          moveX = (Math.random() - 0.5) * 15;
          moveY = (Math.random() - 0.5) * 15;
          break;
      }
      
      items.push({
        id: i,
        x,
        y,
        size,
        color: colorSet.main + (baseOpacity + 0.1) + ')',
        glowColor: colorSet.glow,
        hasGlow,
        baseOpacity,
        animDuration,
        animDelay,
        moveX,
        moveY,
        animType,
        layer: Math.floor(Math.random() * 3) + 1,
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
            backgroundColor: p.color,
            borderRadius: '50%',
            boxShadow: p.hasGlow 
              ? `0 0 ${p.size * 2.5}px ${p.size}px ${p.glowColor}`
              : 'none',
            willChange: 'transform, opacity',
            ['--tx' as string]: `${p.moveX}px`,
            ['--ty' as string]: `${p.moveY}px`,
            ['--base-op' as string]: p.baseOpacity,
            animation: `${p.animType} ${p.animDuration}s ease-in-out ${p.animDelay}s infinite alternate`,
          }}
        />
      ))}
      
      <style jsx global>{`
        @keyframes drift {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-op); }
          100% { transform: translate3d(var(--tx), var(--ty), 0) scale(1.12); opacity: calc(var(--base-op) + 0.15); }
        }
        
        @keyframes rise {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-op); }
          100% { transform: translate3d(var(--tx), var(--ty), 0) scale(0.9); opacity: calc(var(--base-op) - 0.05); }
        }
        
        @keyframes orbit {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-op); }
          100% { transform: translate3d(var(--tx), var(--ty), 0) scale(1.15); opacity: calc(var(--base-op) + 0.18); }
        }
        
        @keyframes pulse {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-op); }
          100% { transform: translate3d(var(--tx), var(--ty), 0) scale(1.4); opacity: calc(var(--base-op) + 0.25); }
        }
      `}</style>
    </div>
  );
});

export default AutonomousParticles;
