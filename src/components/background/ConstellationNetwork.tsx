'use client';

import { memo, useMemo, useEffect, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  floatX: number;
  floatY: number;
  duration: number;
  delay: number;
}

interface Connection {
  from: string;
  to: string;
}

// Constellation clusters with continuous autonomous breathing movement
const createNodes = (): Node[] => [
  // Top Left
  { id: 'tl1', x: 4, y: 6, size: 3.2, color: 'rgba(255,255,255,0.50)', floatX: 12, floatY: 10, duration: 18, delay: 0 },
  { id: 'tl2', x: 10, y: 4, size: 2.2, color: 'rgba(194,214,186,0.45)', floatX: -10, floatY: 14, duration: 22, delay: 1.5 },
  { id: 'tl3', x: 14, y: 9, size: 2.8, color: 'rgba(255,255,255,0.42)', floatX: 14, floatY: -12, duration: 20, delay: 3 },
  { id: 'tl4', x: 6, y: 11, size: 2, color: 'rgba(255,255,255,0.38)', floatX: -12, floatY: -8, duration: 24, delay: 0.8 },
  { id: 'tl5', x: 12, y: 13, size: 2.1, color: 'rgba(194,214,186,0.36)', floatX: 10, floatY: 12, duration: 19, delay: 2.2 },
  // Top Right
  { id: 'tr1', x: 96, y: 5, size: 3.2, color: 'rgba(255,255,255,0.48)', floatX: -12, floatY: 12, duration: 21, delay: 0.5 },
  { id: 'tr2', x: 91, y: 8, size: 2.2, color: 'rgba(196,214,225,0.42)', floatX: 14, floatY: -10, duration: 23, delay: 2.5 },
  { id: 'tr3', x: 94, y: 13, size: 2.8, color: 'rgba(255,255,255,0.40)', floatX: -10, floatY: 14, duration: 18, delay: 1 },
  { id: 'tr4', x: 88, y: 15, size: 2, color: 'rgba(255,255,255,0.36)', floatX: 12, floatY: 9, duration: 25, delay: 3.2 },
  { id: 'tr5', x: 92, y: 19, size: 2.1, color: 'rgba(196,214,225,0.34)', floatX: -14, floatY: -10, duration: 20, delay: 0 },
  // Bottom Left
  { id: 'bl1', x: 5, y: 93, size: 3.2, color: 'rgba(255,255,255,0.44)', floatX: 10, floatY: -14, duration: 22, delay: 1.2 },
  { id: 'bl2', x: 11, y: 90, size: 2.2, color: 'rgba(255,255,255,0.40)', floatX: -12, floatY: 10, duration: 19, delay: 2.8 },
  { id: 'bl3', x: 7, y: 86, size: 2.4, color: 'rgba(246,205,122,0.42)', floatX: 14, floatY: 12, duration: 24, delay: 0.3 },
  { id: 'bl4', x: 13, y: 95, size: 2, color: 'rgba(194,214,186,0.35)', floatX: -8, floatY: -12, duration: 21, delay: 1.8 },
  // Bottom Right
  { id: 'br1', x: 95, y: 94, size: 3.2, color: 'rgba(255,255,255,0.42)', floatX: -10, floatY: -12, duration: 20, delay: 2 },
  { id: 'br2', x: 90, y: 96, size: 2.2, color: 'rgba(255,255,255,0.38)', floatX: 12, floatY: -9, duration: 23, delay: 0.6 },
  { id: 'br3', x: 93, y: 88, size: 2.4, color: 'rgba(194,214,186,0.40)', floatX: -14, floatY: 14, duration: 18, delay: 2.5 },
  { id: 'br4', x: 88, y: 92, size: 2, color: 'rgba(246,205,122,0.36)', floatX: 10, floatY: 10, duration: 25, delay: 1.2 },
];

const connections: Connection[] = [
  { from: 'tl1', to: 'tl2' },
  { from: 'tl2', to: 'tl3' },
  { from: 'tl1', to: 'tl4' },
  { from: 'tl3', to: 'tl5' },
  { from: 'tr1', to: 'tr2' },
  { from: 'tr2', to: 'tr3' },
  { from: 'tr2', to: 'tr4' },
  { from: 'tr3', to: 'tr5' },
  { from: 'bl1', to: 'bl2' },
  { from: 'bl2', to: 'bl3' },
  { from: 'bl1', to: 'bl4' },
  { from: 'br1', to: 'br2' },
  { from: 'br1', to: 'br3' },
  { from: 'br3', to: 'br4' },
];

// Edge particles with continuous breathing
const edgeParticles: Node[] = [
  { id: 'ep1', x: 25, y: 2, size: 2.5, color: 'rgba(255,255,255,0.28)', floatX: 8, floatY: 6, duration: 20, delay: 0 },
  { id: 'ep2', x: 40, y: 1.5, size: 2, color: 'rgba(196,214,225,0.24)', floatX: -6, floatY: 8, duration: 24, delay: 1.5 },
  { id: 'ep3', x: 60, y: 1, size: 2.2, color: 'rgba(255,255,255,0.26)', floatX: 8, floatY: -6, duration: 22, delay: 3 },
  { id: 'ep4', x: 75, y: 2, size: 2.1, color: 'rgba(255,255,255,0.24)', floatX: -7, floatY: 7, duration: 26, delay: 0.8 },
  { id: 'ep5', x: 1, y: 30, size: 2, color: 'rgba(255,255,255,0.24)', floatX: 6, floatY: -7, duration: 19, delay: 2 },
  { id: 'ep6', x: 99, y: 25, size: 1.9, color: 'rgba(196,214,225,0.22)', floatX: -6, floatY: 6, duration: 23, delay: 1.2 },
  { id: 'ep7', x: 0.5, y: 60, size: 2.2, color: 'rgba(255,255,255,0.23)', floatX: 7, floatY: 6, duration: 21, delay: 0.5 },
  { id: 'ep8', x: 99.5, y: 65, size: 2, color: 'rgba(246,205,122,0.23)', floatX: -6, floatY: -6, duration: 25, delay: 2.5 },
  { id: 'ep9', x: 30, y: 99, size: 2.2, color: 'rgba(255,255,255,0.24)', floatX: 6, floatY: -6, duration: 20, delay: 1.8 },
  { id: 'ep10', x: 50, y: 98.5, size: 2, color: 'rgba(246,205,122,0.22)', floatX: -7, floatY: 6, duration: 26, delay: 0.3 },
  { id: 'ep11', x: 70, y: 99, size: 2.1, color: 'rgba(255,255,255,0.23)', floatX: 6, floatY: 7, duration: 19, delay: 2.8 },
];

const ClusterSVG = memo(function ClusterSVG({ 
  nodes, 
  connections, 
  viewBox,
  mousePos
}: { 
  nodes: Node[]; 
  connections: Connection[]; 
  viewBox: string;
  mousePos: { x: number; y: number };
}) {
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const generatePath = (from: Node, to: Node): string => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offsetX = (to.y - from.y) * 0.15;
    const offsetY = (from.x - to.x) * 0.15;
    return `M ${from.x} ${from.y} Q ${midX + offsetX} ${midY + offsetY} ${to.x} ${to.y}`;
  };

  return (
    <svg
      viewBox={viewBox}
      className="absolute pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'visible',
        transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {connections.map((conn, idx) => {
        const fromNode = nodeMap.get(conn.from);
        const toNode = nodeMap.get(conn.to);
        if (!fromNode || !toNode) return null;

        return (
          <path
            key={`line-${idx}`}
            d={generatePath(fromNode, toNode)}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.9"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))',
              animationName: 'lineAutonomousShimmer',
              animationDuration: `${8 + idx * 1.2}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: `${idx * 0.6}s`,
            }}
          />
        );
      })}

      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.size / 2}
          fill={node.color}
          style={{ 
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
            animationName: 'nodeAutonomousFloat',
            animationDuration: `${node.duration}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${node.delay}s`,
            ['--float-x' as string]: `${node.floatX}px`,
            ['--float-y' as string]: `${node.floatY}px`,
          }}
        />
      ))}
    </svg>
  );
});

const EdgeParticles = memo(function EdgeParticles({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className="absolute pointer-events-none" 
      style={{ 
        width: '100%', 
        height: '100%',
        transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {edgeParticles.map((node) => (
        <circle 
          key={node.id} 
          cx={node.x} 
          cy={node.y} 
          r={node.size / 2} 
          fill={node.color}
          style={{ 
            filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
            animationName: 'nodeAutonomousFloat',
            animationDuration: `${node.duration}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${node.delay}s`,
            ['--float-x' as string]: `${node.floatX}px`,
            ['--float-y' as string]: `${node.floatY}px`,
          }}
        />
      ))}
    </svg>
  );
});

const TopLeftCluster = memo(function TopLeftCluster({ mousePos }: { mousePos: { x: number; y: number } }) {
  const nodes = useMemo(() => createNodes().filter(n => n.id.startsWith('tl')), []);
  return (
    <div className="absolute pointer-events-none" style={{ top: '1%', left: '0.5%', width: '24vw', height: '24vh', zIndex: 2 }}>
      <ClusterSVG nodes={nodes} connections={connections.filter(c => c.from.startsWith('tl'))} viewBox="0 0 18 18" mousePos={mousePos} />
    </div>
  );
});

const TopRightCluster = memo(function TopRightCluster({ mousePos }: { mousePos: { x: number; y: number } }) {
  const nodes = useMemo(() => createNodes().filter(n => n.id.startsWith('tr')), []);
  return (
    <div className="absolute pointer-events-none" style={{ top: '1%', right: '0.5%', width: '24vw', height: '24vh', zIndex: 2 }}>
      <ClusterSVG nodes={nodes} connections={connections.filter(c => c.from.startsWith('tr'))} viewBox="84 0 18 22" mousePos={mousePos} />
    </div>
  );
});

const BottomLeftCluster = memo(function BottomLeftCluster({ mousePos }: { mousePos: { x: number; y: number } }) {
  const nodes = useMemo(() => createNodes().filter(n => n.id.startsWith('bl')), []);
  return (
    <div className="absolute pointer-events-none" style={{ bottom: '1%', left: '0.5%', width: '22vw', height: '22vh', zIndex: 2 }}>
      <ClusterSVG nodes={nodes} connections={connections.filter(c => c.from.startsWith('bl'))} viewBox="0 82 18 18" mousePos={mousePos} />
    </div>
  );
});

const BottomRightCluster = memo(function BottomRightCluster({ mousePos }: { mousePos: { x: number; y: number } }) {
  const nodes = useMemo(() => createNodes().filter(n => n.id.startsWith('br')), []);
  return (
    <div className="absolute pointer-events-none" style={{ bottom: '1%', right: '0.5%', width: '22vw', height: '22vh', zIndex: 2 }}>
      <ClusterSVG nodes={nodes} connections={connections.filter(c => c.from.startsWith('br'))} viewBox="84 84 18 18" mousePos={mousePos} />
    </div>
  );
});

export const ConstellationNetwork = memo(function ConstellationNetwork() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="constellation-network" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 2,
      }}
    >
      <TopLeftCluster mousePos={mousePos} />
      <TopRightCluster mousePos={mousePos} />
      <BottomLeftCluster mousePos={mousePos} />
      <BottomRightCluster mousePos={mousePos} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <EdgeParticles mousePos={mousePos} />
      </div>
      <style jsx global>{`
        @keyframes nodeAutonomousFloat {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.82;
          }
          100% { 
            transform: translate(var(--float-x), var(--float-y)) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes lineAutonomousShimmer {
          0% { opacity: 0.18; stroke-width: 0.8; }
          100% { opacity: 0.32; stroke-width: 1.1; }
        }
      `}</style>
    </div>
  );
});

export default ConstellationNetwork;
