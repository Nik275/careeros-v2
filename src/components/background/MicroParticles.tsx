'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    // Keep center relatively clear
    let left: number, top: number;
    let attempts = 0;
    do {
      left = Math.random() * 100;
      top = Math.random() * 100;
      attempts++;
    } while (
      attempts < 100 &&
      left > 28 && left < 72 &&
      top > 32 && top < 68
    );
    
    particles.push({
      id: i,
      left,
      top,
      size: 1 + Math.random(), // 1-2px
      opacity: 0.15 + Math.random() * 0.25, // 0.15-0.4
      duration: 40 + Math.random() * 60, // 40-100s
      delay: Math.random() * 30,
      moveX: 3 + Math.random() * 5, // 3-8px
      moveY: 3 + Math.random() * 5,
    });
  }
  
  return particles;
}

export const MicroParticles = memo(function MicroParticles() {
  const particles = useMemo(() => generateParticles(90), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(255, 255, 255, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 4}px ${p.size * 2}px rgba(255, 255, 255, ${p.opacity * 0.5})`,
          }}
          animate={{
            x: [-p.moveX, p.moveX, -p.moveX],
            y: [-p.moveY, p.moveY, -p.moveY],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

export default MicroParticles;
