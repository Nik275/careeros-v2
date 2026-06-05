'use client';

import { memo, useMemo } from 'react';

// ============================================
// LAYER 1: ATMOSPHERIC GLOW BLOBS
// ============================================

const AtmosphericGlows = memo(function AtmosphericGlows() {
  return (
    <>
      {/* Top Left Green */}
      <div
        style={{
          position: 'absolute',
          top: '-12vh',
          left: '-10vw',
          width: '58vw',
          height: '58vw',
          backgroundColor: 'rgba(186, 211, 178, 0.42)',
          borderRadius: '9999px',
          filter: 'blur(140px)',
          mixBlendMode: 'multiply',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Top Right Blue */}
      <div
        style={{
          position: 'absolute',
          top: '-10vh',
          right: '-10vw',
          width: '50vw',
          height: '50vw',
          backgroundColor: 'rgba(207, 224, 236, 0.42)',
          borderRadius: '9999px',
          filter: 'blur(140px)',
          mixBlendMode: 'multiply',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom Center Gold */}
      <div
        style={{
          position: 'absolute',
          bottom: '-18vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '72vw',
          height: '34vw',
          backgroundColor: 'rgba(241, 208, 146, 0.34)',
          borderRadius: '9999px',
          filter: 'blur(120px)',
          mixBlendMode: 'multiply',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
});

// ============================================
// LAYER 2: CONSTELLATION CLUSTERS
// ============================================

interface NodeProps {
  left: string;
  top: string;
  size: number;
  color: string;
}

const Node = memo(function Node({ left, top, size, color }: NodeProps) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left,
        top,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        backgroundColor: color,
        boxShadow: '0 0 14px rgba(255,255,255,0.55)',
        zIndex: 2,
      }}
    />
  );
});

interface LineProps {
  left: string;
  top: string;
  width: string;
  rotate: number;
}

const Line = memo(function Line({ left, top, width, rotate }: LineProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        width,
        height: '1px',
        backgroundColor: 'rgba(255, 255, 240, 0.7)',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'left center',
        opacity: 0.16,
        zIndex: 2,
      }}
    />
  );
});

// Top Left Cluster - 22vw × 26vh
const TopLeftCluster = memo(function TopLeftCluster() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ top: '6%', left: '2%', width: '22vw', height: '26vh', zIndex: 2 }}
    >
      <Node left="8%" top="12%" size={12} color="#D8E8D0" />
      <Node left="32%" top="8%" size={8} color="#F4D9A5" />
      <Node left="52%" top="18%" size={7} color="#FFFFFF" />
      <Node left="18%" top="35%" size={9} color="#E9EEF4" />
      <Node left="42%" top="45%" size={7} color="#D8E8D0" />
      <Node left="12%" top="58%" size={11} color="#F4D9A5" />

      <Line left="8%" top="12%" width="26%" rotate={-10} />
      <Line left="32%" top="8%" width="22%" rotate={20} />
      <Line left="18%" top="35%" width="26%" rotate={5} />
      <Line left="12%" top="58%" width="32%" rotate={-8} />
    </div>
  );
});

// Top Right Cluster - 22vw × 26vh
const TopRightCluster = memo(function TopRightCluster() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ top: '8%', right: '3%', width: '22vw', height: '26vh', zIndex: 2 }}
    >
      <Node left="70%" top="10%" size={12} color="#E9EEF4" />
      <Node left="88%" top="20%" size={8} color="#D8E8D0" />
      <Node left="78%" top="42%" size={7} color="#FFFFFF" />
      <Node left="92%" top="55%" size={9} color="#E9EEF4" />
      <Node left="82%" top="72%" size={7} color="#D8E8D0" />

      <Line left="70%" top="10%" width="20%" rotate={25} />
      <Line left="88%" top="20%" width="12%" rotate={-18} />
      <Line left="78%" top="42%" width="16%" rotate={35} />
    </div>
  );
});

// Bottom Left Cluster - 24vw × 28vh
const BottomLeftCluster = memo(function BottomLeftCluster() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ bottom: '6%', left: '1%', width: '24vw', height: '28vh', zIndex: 2 }}
    >
      <Node left="6%" top="20%" size={8} color="#F4D9A5" />
      <Node left="22%" top="10%" size={12} color="#D8E8D0" />
      <Node left="45%" top="25%" size={7} color="#FFFFFF" />
      <Node left="12%" top="50%" size={7} color="#E9EEF4" />
      <Node left="32%" top="62%" size={9} color="#F4D9A5" />
      <Node left="48%" top="48%" size={11} color="#D8E8D0" />

      <Line left="6%" top="20%" width="18%" rotate={-15} />
      <Line left="22%" top="10%" width="25%" rotate={22} />
      <Line left="12%" top="50%" width="22%" rotate={8} />
      <Line left="32%" top="62%" width="18%" rotate={-25} />
    </div>
  );
});

// Bottom Right Cluster - 24vw × 28vh
const BottomRightCluster = memo(function BottomRightCluster() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ bottom: '5%', right: '1%', width: '24vw', height: '28vh', zIndex: 2 }}
    >
      <Node left="76%" top="15%" size={12} color="#FFFFFF" />
      <Node left="92%" top="28%" size={8} color="#F4D9A5" />
      <Node left="80%" top="50%" size={7} color="#E9EEF4" />
      <Node left="94%" top="68%" size={9} color="#D8E8D0" />
      <Node left="78%" top="82%" size={11} color="#FFFFFF" />

      <Line left="76%" top="15%" width="18%" rotate={32} />
      <Line left="92%" top="28%" width="12%" rotate={-22} />
      <Line left="80%" top="50%" width="16%" rotate={42} />
    </div>
  );
});

const ConstellationClusters = memo(function ConstellationClusters() {
  return (
    <>
      <TopLeftCluster />
      <TopRightCluster />
      <BottomLeftCluster />
      <BottomRightCluster />
    </>
  );
});

// ============================================
// LAYER 3: FLOATING SPARKLES (useMemo for hydration)
// ============================================

interface SparkleData {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

function generateSparkles(count: number): SparkleData[] {
  const sparkles: SparkleData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Keep center clean - no sparkles near hero
    let left = 0, top = 0;
    let attempts = 0;
    do {
      left = Math.random() * 100;
      top = Math.random() * 100;
      attempts++;
    } while (attempts < 100 && left > 30 && left < 70 && top > 25 && top < 75);

    sparkles.push({
      id: i,
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`,
      size: 1 + Math.random() * 2,
      opacity: 0.25 + Math.random() * 0.2,
      duration: 30 + Math.random() * 30,
      delay: Math.random() * 30,
    });
  }
  
  return sparkles;
}

const FloatingSparkles = memo(function FloatingSparkles() {
  // useMemo ensures consistent values between server and client
  const particles = useMemo(() => generateSparkles(55), []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(255, 255, 255, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 4}px ${p.size * 2}px rgba(255, 255, 255, ${p.opacity * 0.4})`,
            animation: `sparkleFloat ${p.duration.toFixed(2)}s ease-in-out ${p.delay.toFixed(2)}s infinite alternate`,
            zIndex: 3,
          }}
        />
      ))}
    </div>
  );
});

// ============================================
// MAIN BACKGROUND COMPONENT
// ============================================

export const CleanBackground = memo(function CleanBackground() {
  return (
    <div
      className="fixed inset-0"
      style={{
        backgroundColor: '#F8F5EE',
        zIndex: 0,
      }}
    >
      <AtmosphericGlows />
      <ConstellationClusters />
      <FloatingSparkles />
    </div>
  );
});

export default CleanBackground;
