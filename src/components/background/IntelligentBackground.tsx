'use client';

import { useEffect, useState, memo } from 'react';
import { AmbientGlow } from './AmbientGlow';
import { ConstellationNetwork } from './ConstellationNetwork';
import MicroSparkles from './MicroSparkles';

interface IntelligentBackgroundProps {
  children: React.ReactNode;
}

export const IntelligentBackground = memo(function IntelligentBackground({
  children,
}: IntelligentBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ backgroundColor: '#F8F5EE' }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ 
        width: '100%',
        height: '100%',
        backgroundColor: '#F8F5EE',
      }}
    >
      {/* Layer 1: Base */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundColor: '#F8F5EE',
          zIndex: 0,
        }} 
      />

      {/* Layer 2: Glow Blobs - WRAPPER with explicit z-index */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <AmbientGlow />
      </div>

      {/* Layer 3: Constellations - WRAPPER with explicit z-index */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <ConstellationNetwork />
      </div>

      {/* Layer 4: Sparkles - WRAPPER with explicit z-index */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <MicroSparkles />
      </div>

      {/* Layer 5: Hero Content */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {children}
      </div>
    </div>
  );
});

export default IntelligentBackground;
