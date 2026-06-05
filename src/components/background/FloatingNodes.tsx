'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface NodeData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: 'ivory' | 'sage' | 'blue' | 'gold';
  duration: number;
  delay: number;
}

const colorMap = {
  ivory: { r: 247, g: 244, b: 238, opacity: 0.5 },
  sage: { r: 132, g: 168, b: 132, opacity: 0.4 },
  blue: { r: 168, g: 198, b: 218, opacity: 0.38 },
  gold: { r: 225, g: 195, b: 165, opacity: 0.42 },
};

function generateNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  const colors: Array<'ivory' | 'sage' | 'blue' | 'gold'> = ['ivory', 'sage', 'blue', 'gold'];
  
  // Keep center clear for hero content
  const centerZone = { xMin: 28, xMax: 72, yMin: 30, yMax: 75 };
  
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    
    do {
      x = 1 + Math.random() * 98;
      y = 1 + Math.random() * 98;
      attempts++;
    } while (
      attempts < 300 &&
      x > centerZone.xMin &&
      x < centerZone.xMax &&
      y > centerZone.yMin &&
      y < centerZone.yMax
    );
    
    nodes.push({
      id: i,
      x,
      y,
      size: 5 + Math.random() * 5, // 5-10px
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 35 + Math.random() * 40, // 35-75 seconds
      delay: Math.random() * 15,
    });
  }
  
  return nodes;
}

const SingleNode = memo(function SingleNode({ node }: { node: NodeData }) {
  const color = colorMap[node.color];
  const glowSize = node.size * 2;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: node.size,
        height: node.size,
        marginLeft: -node.size / 2,
        marginTop: -node.size / 2,
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity})`,
        boxShadow: `
          0 0 ${glowSize}px ${node.size * 0.6}px rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity * 0.5}),
          0 0 ${glowSize * 2}px ${glowSize}px rgba(${color.r}, ${color.g}, ${color.b}, ${color.opacity * 0.2})
        `,
        willChange: 'transform, opacity',
      }}
      animate={{
        y: [0, -8, 0],
        x: [0, 4, 0],
        opacity: [color.opacity * 0.7, color.opacity, color.opacity * 0.7],
      }}
      transition={{
        duration: node.duration,
        delay: node.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
});

export const FloatingNodes = memo(function FloatingNodes() {
  const nodes = useMemo(() => generateNodes(35), []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {nodes.map((node) => (
        <SingleNode key={node.id} node={node} />
      ))}
    </div>
  );
});

export default FloatingNodes;
