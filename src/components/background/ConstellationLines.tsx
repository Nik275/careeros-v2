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

export const ConstellationLines = memo(function ConstellationLines() {
  const lines: Line[] = [
    // Top left cluster
    { id: 1, x1: 2, y1: 4, x2: 14, y2: 2, curve: 18, duration: 28, delay: 0 },
    { id: 2, x1: 14, y1: 2, x2: 18, y2: 12, curve: -15, duration: 32, delay: 1.5 },
    { id: 3, x1: 2, y1: 4, x2: 4, y2: 16, curve: 10, duration: 26, delay: 0.8 },
    { id: 4, x1: 4, y1: 16, x2: 16, y2: 18, curve: -12, duration: 30, delay: 2 },
    { id: 5, x1: 14, y1: 2, x2: 10, y2: 14, curve: 8, duration: 24, delay: 1 },
    
    // Top right cluster
    { id: 6, x1: 98, y1: 3, x2: 87, y2: 6, curve: -18, duration: 29, delay: 0.5 },
    { id: 7, x1: 87, y1: 6, x2: 91, y2: 17, curve: 15, duration: 33, delay: 2 },
    { id: 8, x1: 98, y1: 3, x2: 96, y2: 20, curve: -10, duration: 27, delay: 1.2 },
    { id: 9, x1: 87, y1: 6, x2: 84, y2: 18, curve: 12, duration: 31, delay: 0 },
    
    // Bottom left cluster
    { id: 10, x1: 2, y1: 97, x2: 15, y2: 94, curve: 12, duration: 30, delay: 1 },
    { id: 11, x1: 15, y1: 94, x2: 5, y2: 83, curve: -10, duration: 26, delay: 2.5 },
    { id: 12, x1: 2, y1: 97, x2: 17, y2: 98, curve: 15, duration: 34, delay: 0.3 },
    { id: 13, x1: 5, y1: 83, x2: 12, y2: 88, curve: -8, duration: 28, delay: 1.8 },
    
    // Bottom right cluster
    { id: 14, x1: 98, y1: 98, x2: 85, y2: 95, curve: -12, duration: 32, delay: 0.8 },
    { id: 15, x1: 85, y1: 95, x2: 89, y2: 85, curve: 10, duration: 29, delay: 2.2 },
    { id: 16, x1: 98, y1: 98, x2: 99, y2: 85, curve: -15, duration: 35, delay: 0 },
    { id: 17, x1: 89, y1: 85, x2: 94, y2: 90, curve: 8, duration: 27, delay: 1.5 },
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
      className="constellation-lines" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 2,
        animationName: 'constellationBreathing',
        animationDuration: '15s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
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
            stroke="url(#lineGradient)"
            strokeWidth="0.7"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))',
              animationName: 'lineAlive',
              animationDuration: `${line.duration}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: `${line.delay}s`,
            }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.20)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>
      </svg>
      <style jsx global>{`
        @keyframes constellationBreathing {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.02); opacity: 1; }
        }

        @keyframes lineAlive {
          0% { 
            stroke-opacity: 0.1;
            stroke-width: 0.5;
          }
          50% {
            stroke-opacity: 0.18;
            stroke-width: 0.7;
          }
          100% { 
            stroke-opacity: 0.28;
            stroke-width: 0.9;
          }
        }
      `}</style>
    </div>
  );
});

export default ConstellationLines;
