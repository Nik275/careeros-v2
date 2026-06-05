'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

export interface NodeData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: 'sage' | 'gold' | 'blue' | 'ivory';
  opacity: number;
  duration: number;
  delay: number;
  depth: number;
}

interface FloatingNodeProps {
  node: NodeData;
  isLowEndDevice: boolean;
}

const colorMap = {
  sage: 'rgba(156, 191, 156, ',
  gold: 'rgba(237, 197, 163, ',
  blue: 'rgba(176, 208, 230, ',
  ivory: 'rgba(247, 244, 238, ',
};

export const FloatingNode = memo(function FloatingNode({ node, isLowEndDevice }: FloatingNodeProps) {
  const colorBase = colorMap[node.color];
  
  // Reduce animation complexity on low-end devices
  const animationConfig = useMemo(() => ({
    y: isLowEndDevice ? [0, -10, 0] : [0, -15 - node.depth * 5, 0],
    x: isLowEndDevice ? [0, 3, 0] : [0, 5 + node.depth * 2, 0],
    scale: isLowEndDevice ? [1, 1.05, 1] : [1, 1.1 + node.depth * 0.05, 1],
    opacity: [node.opacity * 0.7, node.opacity, node.opacity * 0.7],
  }), [node, isLowEndDevice]);

  const glowSize = node.size * (3 + node.depth);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none will-change-transform"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: node.size,
        height: node.size,
        backgroundColor: `${colorBase}${node.opacity})`,
        boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${colorBase}${node.opacity * 0.3})`,
        filter: `blur(${node.size > 4 ? 1 : 0.5}px)`,
      }}
      animate={animationConfig}
      transition={{
        duration: node.duration,
        delay: node.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
});

export default FloatingNode;
