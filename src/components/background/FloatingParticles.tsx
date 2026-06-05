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
  opacity: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
  layer: number;
  type: 'drift' | 'rise' | 'orbit' | 'pulse';
}

export const FloatingParticles = memo(function FloatingParticles() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    
    // Premium color palette
    const colors = [
      { main: 'rgba(166,194,158,0.95)', glow: 'rgba(166,194,158,0.5)' }, // Muted sage green
      { main: 'rgba(234,198,142,0.95)', glow: 'rgba(234,198,142,0.5)' }, // Pale warm gold
      { main: 'rgba(186,208,220,0.95)', glow: 'rgba(186,208,220,0.5)' }, // Soft sky blue
      { main: 'rgba(252,248,240,0.95)', glow: 'rgba(252,248,240,0.5)' }, // Warm ivory white
    ];
    
    // Create 90 particles with VISIBLE movement
    for (let i = 0; i < 90; i++) {
      // Avoid hero center area
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Keep away from center 40% zone
      if (x > 30 && x < 70 && y > 15 && y < 85) {
        if (Math.random() > 0.5) {
          x = x < 50 ? Math.random() * 25 : 75 + Math.random() * 25;
        } else {
          y = y < 50 ? Math.random() * 10 : 90 + Math.random() * 10;
        }
      }
      
      // Size distribution
      const sizeRoll = Math.random();
      let size: number;
      if (sizeRoll < 0.35) {
        size = 2 + Math.random() * 2; // 2-4px small
      } else if (sizeRoll < 0.8) {
        size = 5 + Math.random() * 3; // 5-8px medium
      } else {
        size = 10 + Math.random() * 6; // 10-16px large
      }
      
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      const hasGlow = Math.random() > 0.55;
      const opacity = 0.22 + Math.random() * 0.33; // 0.22-0.55
      
      // Varied durations 18-45s
      const durations = [18, 22, 26, 32, 38, 45];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      
      const layer = Math.floor(Math.random() * 3) + 1;
      
      // Movement types
      const types: Particle['type'][] = ['drift', 'rise', 'orbit', 'pulse'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // SUBSTANTIAL movement distances (noticeable within 2-3 seconds)
      let moveX = 0, moveY = 0;
      
      switch(type) {
        case 'drift':
          moveX = (Math.random() - 0.5) * 50; // -25 to +25px
          moveY = (Math.random() - 0.5) * 40; // -20 to +20px
          break;
        case 'rise':
          moveX = (Math.random() - 0.5) * 20;
          moveY = -35 - Math.random() * 25; // Rise 35-60px
          break;
        case 'orbit':
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 30;
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
        color: colorSet.main,
        glowColor: colorSet.glow,
        hasGlow,
        opacity,
        duration,
        delay: Math.random() * 12,
        moveX,
        moveY,
        layer,
        type,
      });
    }
    
    return items;
  }, []);

  const getAnimationName = (type: Particle['type'], layer: number) => {
    return `particle${type.charAt(0).toUpperCase() + type.slice(1)}${layer}`;
  };

  return (
    <div 
      className="floating-particles" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            boxShadow: particle.hasGlow 
              ? `0 0 ${particle.size * 3}px ${particle.size * 1.5}px ${particle.glowColor}`
              : 'none',
            animationName: getAnimationName(particle.type, particle.layer),
            animationDuration: `${particle.duration}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${particle.delay}s`,
            ['--move-x' as string]: `${particle.moveX}px`,
            ['--move-y' as string]: `${particle.moveY}px`,
            ['--base-opacity' as string]: particle.opacity,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <style jsx global>{`
        /* Drift particles - Layer 1 */
        @keyframes particleDrift1 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(var(--move-x), var(--move-y)) scale(1.1); opacity: calc(var(--base-opacity) + 0.1); }
        }
        @keyframes particleDrift2 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(calc(var(--move-x) * 0.8), calc(var(--move-y) * 1.2)) scale(1.08); opacity: calc(var(--base-opacity) + 0.08); }
        }
        @keyframes particleDrift3 {
          0% { transform: translate(0, 0) scale(1); opacity: calc(var(--base-opacity) - 0.05); }
          100% { transform: translate(calc(var(--move-x) * 1.2), calc(var(--move-y) * 0.9)) scale(1.12); opacity: calc(var(--base-opacity) + 0.12); }
        }

        /* Rise particles - Layer 1 */
        @keyframes particleRise1 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(var(--move-x), var(--move-y)) scale(0.95); opacity: calc(var(--base-opacity) - 0.08); }
        }
        @keyframes particleRise2 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(calc(var(--move-x) * 0.7), var(--move-y)) scale(0.92); opacity: calc(var(--base-opacity) - 0.05); }
        }
        @keyframes particleRise3 {
          0% { transform: translate(0, 0) scale(1); opacity: calc(var(--base-opacity) + 0.05); }
          100% { transform: translate(calc(var(--move-x) * 1.3), var(--move-y)) scale(0.9); opacity: var(--base-opacity); }
        }

        /* Orbit particles - Layer 1 */
        @keyframes particleOrbit1 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(var(--move-x), var(--move-y)) scale(1.05); opacity: calc(var(--base-opacity) + 0.1); }
        }
        @keyframes particleOrbit2 {
          0% { transform: translate(0, 0) scale(1); opacity: calc(var(--base-opacity) - 0.03); }
          100% { transform: translate(calc(var(--move-x) * 0.9), calc(var(--move-y) * 1.1)) scale(1.08); opacity: calc(var(--base-opacity) + 0.08); }
        }
        @keyframes particleOrbit3 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(calc(var(--move-x) * 1.1), calc(var(--move-y) * 0.9)) scale(1.12); opacity: calc(var(--base-opacity) + 0.15); }
        }

        /* Pulse particles - Layer 1 */
        @keyframes particlePulse1 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(var(--move-x), var(--move-y)) scale(1.25); opacity: calc(var(--base-opacity) + 0.2); }
        }
        @keyframes particlePulse2 {
          0% { transform: translate(0, 0) scale(1); opacity: calc(var(--base-opacity) - 0.08); }
          100% { transform: translate(calc(var(--move-x) * 0.6), calc(var(--move-y) * 0.6)) scale(1.3); opacity: calc(var(--base-opacity) + 0.15); }
        }
        @keyframes particlePulse3 {
          0% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
          100% { transform: translate(calc(var(--move-x) * 0.8), calc(var(--move-y) * 0.8)) scale(1.35); opacity: calc(var(--base-opacity) + 0.18); }
        }
      `}</style>
    </div>
  );
});

export default FloatingParticles;
