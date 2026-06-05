'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface ConstellationNode {
  id: string;
  x: number;
  y: number;
  size: number;
  color: 'sage' | 'gold' | 'blue' | 'ivory';
}

interface ConstellationConnection {
  from: string;
  to: string;
  delay: number;
}

const colorMap = {
  sage: 'rgba(156, 191, 156,',
  gold: 'rgba(237, 197, 163,',
  blue: 'rgba(176, 208, 230,',
  ivory: 'rgba(247, 244, 238,',
};

// Elegant constellation structures around edges
const leftConstellation: ConstellationNode[] = [
  { id: 'l1', x: 5, y: 25, size: 4, color: 'sage' },
  { id: 'l2', x: 12, y: 35, size: 3, color: 'blue' },
  { id: 'l3', x: 8, y: 45, size: 5, color: 'gold' },
  { id: 'l4', x: 15, y: 55, size: 3, color: 'sage' },
  { id: 'l5', x: 6, y: 65, size: 4, color: 'ivory' },
  { id: 'l6', x: 18, y: 70, size: 3, color: 'blue' },
  { id: 'l7', x: 10, y: 80, size: 3, color: 'sage' },
];

const rightConstellation: ConstellationNode[] = [
  { id: 'r1', x: 95, y: 20, size: 4, color: 'blue' },
  { id: 'r2', x: 88, y: 30, size: 3, color: 'gold' },
  { id: 'r3', x: 92, y: 40, size: 5, color: 'sage' },
  { id: 'r4', x: 85, y: 50, size: 3, color: 'blue' },
  { id: 'r5', x: 94, y: 60, size: 4, color: 'ivory' },
  { id: 'r6', x: 82, y: 72, size: 3, color: 'gold' },
  { id: 'r7', x: 90, y: 82, size: 3, color: 'sage' },
];

const topConstellation: ConstellationNode[] = [
  { id: 't1', x: 25, y: 8, size: 3, color: 'ivory' },
  { id: 't2', x: 40, y: 5, size: 4, color: 'gold' },
  { id: 't3', x: 60, y: 6, size: 3, color: 'sage' },
  { id: 't4', x: 75, y: 10, size: 3, color: 'blue' },
];

const bottomConstellation: ConstellationNode[] = [
  { id: 'b1', x: 22, y: 88, size: 3, color: 'sage' },
  { id: 'b2', x: 40, y: 92, size: 4, color: 'blue' },
  { id: 'b3', x: 60, y: 90, size: 3, color: 'gold' },
  { id: 'b4', x: 78, y: 86, size: 3, color: 'ivory' },
];

const allNodes = [...leftConstellation, ...rightConstellation, ...topConstellation, ...bottomConstellation];

const connections: ConstellationConnection[] = [
  // Left structure
  { from: 'l1', to: 'l2', delay: 0 },
  { from: 'l2', to: 'l3', delay: 2 },
  { from: 'l3', to: 'l4', delay: 4 },
  { from: 'l4', to: 'l5', delay: 6 },
  { from: 'l5', to: 'l6', delay: 8 },
  { from: 'l6', to: 'l7', delay: 10 },
  // Right structure
  { from: 'r1', to: 'r2', delay: 3 },
  { from: 'r2', to: 'r3', delay: 5 },
  { from: 'r3', to: 'r4', delay: 7 },
  { from: 'r4', to: 'r5', delay: 9 },
  { from: 'r5', to: 'r6', delay: 11 },
  { from: 'r6', to: 'r7', delay: 13 },
  // Top structure
  { from: 't1', to: 't2', delay: 1 },
  { from: 't2', to: 't3', delay: 5 },
  { from: 't3', to: 't4', delay: 9 },
  // Bottom structure
  { from: 'b1', to: 'b2', delay: 4 },
  { from: 'b2', to: 'b3', delay: 8 },
  { from: 'b3', to: 'b4', delay: 12 },
];

export const ConstellationSystem = memo(function ConstellationSystem() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(156, 191, 156, 0.12)" />
            <stop offset="100%" stopColor="rgba(176, 208, 230, 0.08)" />
          </linearGradient>
        </defs>
        
        {connections.map((conn, idx) => {
          const fromNode = allNodes.find(n => n.id === conn.from);
          const toNode = allNodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          // Create gentle curve
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const controlX = midX + (Math.random() - 0.5) * 3;
          const controlY = midY + (Math.random() - 0.5) * 3;
          
          return (
            <motion.path
              key={idx}
              d={`M ${fromNode.x}% ${fromNode.y}% Q ${controlX}% ${controlY}% ${toNode.x}% ${toNode.y}%`}
              fill="none"
              stroke="url(#lineGrad1)"
              strokeWidth="0.7"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.15, 0.15, 0]
              }}
              transition={{
                duration: 15,
                delay: conn.delay,
                repeat: Infinity,
                repeatDelay: 35,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {allNodes.map((node) => {
        const colorBase = colorMap[node.color];
        const glowSize = node.size * 3;
        
        return (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size,
              height: node.size,
              backgroundColor: `${colorBase} ${node.color === 'ivory' ? 0.5 : 0.4})`,
              boxShadow: `
                0 0 ${glowSize}px ${node.size}px ${colorBase} ${node.color === 'ivory' ? 0.25 : 0.2}),
                0 0 ${glowSize * 2}px ${glowSize}px ${colorBase} ${node.color === 'ivory' ? 0.1 : 0.08})
              `,
              willChange: 'transform, opacity',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
});

export default ConstellationSystem;
