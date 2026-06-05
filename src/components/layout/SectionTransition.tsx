'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface SectionTransitionProps {
  height?: string;
  opacityStart?: number;
  opacityEnd?: number;
}

export function SectionTransition({
  height = '120px',
  opacityStart = 0,
  opacityEnd = 0.03,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [opacityStart, opacityEnd, opacityStart]);

  return (
    <motion.div
      ref={ref}
      style={{
        height,
        width: '100%',
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(248, 245, 238, 0.5) 50%, transparent 100%)',
          opacity,
        }}
      />
    </motion.div>
  );
}

export default SectionTransition;
