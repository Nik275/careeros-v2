'use client';

import { memo } from 'react';

interface Line {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curve: number;
  duration: number;
  delay: number;
}

export const AutonomousConstellations = memo(function AutonomousConstellations() {
  const lines: Line[] = [
    // Top left
    { id: 1, x1: 2, y1: 3, x2: 15, y2: 1, curve: 20, duration: 26, delay: 0 },
    { id: 2, x1: 15, y1: 1, x2: 20, y2: 14, curve: -18, duration: 32, delay: 2 },
    { id: 3, x1: 2, y1: 3, x2: 3, y2: 18, curve: 12, duration: 28, delay: 1 },
    { id: 4, x1: 3, y1: 18, x2: 18, y2: 20, curve: -15, duration: 34, delay: 3 },
    { id: 5, x1: 15, y1: 1, x2: 12, y2: 16, curve: 10, duration: 30, delay: 1.5 },
    
    // Top right
    { id: 6, x1: 99, y1: 2, x2: 85, y2: 5, curve: -20, duration: 29, delay: 0.5 },
    { id: 7, x1: 85, y1: 5, x2: 89, y2: 19, curve: 18, duration: 35, delay: 2.5 },
    { id: 8, x1: 99, y1: 2, x2: 97, y2: 22, curve: -12, duration: 27, delay: 1.2 },
    { id: 9, x1: 85, y1: 5, x2: 82, y2: 20, curve: 15, duration: 33, delay: 0 },
    
    // Bottom left
    { id: 10, x1: 1, y1: 98, x2: 17, y2: 95, curve: 15, duration: 31, delay: 1 },
    { id: 11, x1: 17, y1: 95, x2: 4, y2: 82, curve: -12, duration: 28, delay: 3 },
    { id: 12, x1: 1, y1: 98, x2: 19, y2: 99, curve: 18, duration: 36, delay: 0.3 },
    { id: 13, x1: 4, y1: 82, x2: 14, y2: 89, curve: -10, duration: 29, delay: 2 },
    
    // Bottom right
    { id: 14, x1: 99, y1: 99, x2: 83, y2: 96, curve: -15, duration: 33, delay: 0.8 },
    { id: 15, x1: 83, y1: 96, x2: 87, y2: 83, curve: 12, duration: 30, delay: 2.2 },
    { id: 16, x1: 99, y1: 99, x2: 100, y2: 82, curve: -18, duration: 37, delay: 0 },
    { id: 17, x1: 87, y1: 83, x2: 93, y2: 88, curve: 10, duration: 28, delay: 1.8 },
  ];

  const generatePath = (line: Line): string => {
    const midX = (line.x1 + line.x2) / 2;
    const midY = (line.y1 + line.y2) / 2;
    const controlX = midX + line.curve;
    const controlY = midY - line.curve * 0.5;
    return `M ${line.x1} ${line.y1} Q ${controlX} ${controlY} ${line.x2} ${line.y2}`;
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 2,
        willChange: 'transform, opacity',
        animation: 'constellationBreathe 14s ease-in-out infinite alternate',
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'visible',
        }}
      >
        {lines.map((line) => (
          <path
            key={line.id}
            d={generatePath(line)}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.7"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.12))',
              willChange: 'stroke-opacity, stroke-width',
              animation: `lineShimmer ${line.duration}s ease-in-out ${line.delay}s infinite alternate`,
            }}
          />
        ))}
      </svg>
      
      <style jsx global>{`
        @keyframes constellationBreathe {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.03); opacity: 1; }
        }

        @keyframes lineShimmer {
          0% { 
            stroke-opacity: 0.08;
            stroke-width: 0.5;
          }
          100% { 
            stroke-opacity: 0.3;
            stroke-width: 0.9;
          }
        }
      `}</style>
    </div>
  );
});

export default AutonomousConstellations;
