'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  speed: 'slow' | 'medium' | 'drift';
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const speedRand = Math.random();
    let speed: 'slow' | 'medium' | 'drift';
    if (speedRand > 0.6) speed = 'slow';
    else if (speedRand > 0.3) speed = 'medium';
    else speed = 'drift';
    
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.06 + Math.random() * 0.08,
      duration: 40 + Math.random() * 60,
      delay: Math.random() * 25,
      speed,
    });
  }
  
  return particles;
}

export const DustParticles = memo(function DustParticles() {
  const particles = useMemo(() => generateParticles(45), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        let yMove: number[];
        let xMove: number[];
        
        switch (particle.speed) {
          case 'slow':
            yMove = [-15, 10];
            xMove = [-3, 3];
            break;
          case 'medium':
            yMove = [-20, 15];
            xMove = [-6, 6];
            break;
          case 'drift':
            yMove = [-10, 12];
            xMove = [-10, 10];
            break;
        }
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: `rgba(247, 244, 238, ${particle.opacity})`,
              boxShadow: `0 0 ${particle.size * 4}px ${particle.size * 2}px rgba(247, 244, 238, ${particle.opacity * 0.5})`,
              filter: 'blur(0.5px)',
              willChange: 'transform, opacity',
            }}
            animate={{
              y: yMove,
              x: xMove,
              opacity: [particle.opacity * 0.4, particle.opacity, particle.opacity * 0.4],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
});

export default DustParticles;
