'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
}

const colors = [
  'rgba(255, 255, 255,',      // white
  'rgba(230, 245, 255,',      // pale blue
  'rgba(255, 250, 230,',      // warm gold
];

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  
  for (let i = 0; i < count; i++) {
    const sizeRand = Math.random();
    let size: number;
    if (sizeRand > 0.6) size = 1;
    else if (sizeRand > 0.3) size = 2;
    else size = 3;
    
    const colorBase = colors[Math.floor(Math.random() * colors.length)];
    
    // Keep center relatively clear
    let x: number, y: number;
    let attempts = 0;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      attempts++;
    } while (
      attempts < 100 &&
      x > 25 && x < 75 &&
      y > 30 && y < 70
    );
    
    stars.push({
      id: i,
      x,
      y,
      size,
      color: colorBase,
      opacity: 0.2 + Math.random() * 0.45,
      blur: Math.random() * 1,
      duration: 40 + Math.random() * 50,
      delay: Math.random() * 30,
      moveX: 2 + Math.random() * 4,
      moveY: 2 + Math.random() * 4,
    });
  }
  
  return stars;
}

export const MicroStars = memo(function MicroStars() {
  const stars = useMemo(() => generateStars(110), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: `${star.color} ${star.opacity})`,
            boxShadow: `0 0 ${star.size * 6}px ${star.size * 3}px ${star.color} ${star.opacity * 0.4})`,
            filter: `blur(${star.blur}px)`,
          }}
          animate={{
            x: [-star.moveX, star.moveX, -star.moveX],
            y: [-star.moveY, star.moveY, -star.moveY],
            opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.6],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

export default MicroStars;
