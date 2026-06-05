'use client';

import { memo } from 'react';

interface NetworkNode {
  id: number;
  x: number;
  y: number;
}

export const PremiumConstellations = memo(function PremiumConstellations() {
  const nodes: NetworkNode[] = [
    // Top left
    { id: 1, x: 4, y: 6 },
    { id: 2, x: 14, y: 4 },
    // Top right  
    { id: 3, x: 96, y: 7 },
    { id: 4, x: 86, y: 5 },
    // Bottom left
    { id: 5, x: 5, y: 94 },
    { id: 6, x: 16, y: 96 },
    // Bottom right
    { id: 7, x: 95, y: 93 },
    { id: 8, x: 84, y: 95 },
  ];

  const paths = [
    { id: 1, d: 'M 4 6 Q 9 3 14 4', duration: 26, delay: 0 },
    { id: 2, d: 'M 96 7 Q 91 4 86 5', duration: 30, delay: 1.5 },
    { id: 3, d: 'M 5 94 Q 10.5 97 16 96', duration: 28, delay: 0.8 },
    { id: 4, d: 'M 95 93 Q 89.5 96 84 95', duration: 32, delay: 2 },
  ];

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 2,
        willChange: 'opacity',
        animation: 'constellationDrift 24s ease-in-out infinite alternate',
      }}
    >
      {/* Minimal network nodes with pulse */}
      {nodes.map((node) => (
        <div
          key={`node-${node.id}`}
          style={{
            position: 'absolute',
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.35)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 5px 1.5px rgba(255,255,255,0.15)',
            willChange: 'opacity, transform',
            animation: `nodePulse ${11 + Math.random() * 4}s ease-in-out ${Math.random() * 5}s infinite alternate`,
          }}
        />
      ))}

      {/* Minimal elegant paths with shimmer */}
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ 
          position: 'absolute',
          inset: 0,
          width: '100%', 
          height: '100%',
          overflow: 'visible',
        }}
      >
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.35"
            strokeLinecap="round"
            style={{
              willChange: 'stroke-opacity',
              animation: `pathShimmer ${path.duration}s ease-in-out ${path.delay}s infinite alternate`,
            }}
          />
        ))}
      </svg>
    </div>
  );
});

export default PremiumConstellations;
