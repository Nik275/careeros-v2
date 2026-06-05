'use client';

import { memo } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

// ============================================
// CORNER CLUSTERS - More visible
// ============================================

const topLeftNodes: Node[] = [
  { id: 'tl1', x: 3, y: 5, size: 3.5, color: 'rgba(255,255,255,0.45)' },
  { id: 'tl2', x: 11, y: 3, size: 2.5, color: 'rgba(200,220,200,0.40)' },
  { id: 'tl3', x: 16, y: 9, size: 3, color: 'rgba(255,255,255,0.38)' },
  { id: 'tl4', x: 7, y: 11, size: 2, color: 'rgba(255,255,255,0.32)' },
  { id: 'tl5', x: 13, y: 14, size: 2.2, color: 'rgba(200,220,200,0.30)' },
];

const topLeftConnections: Connection[] = [
  { from: 'tl1', to: 'tl2' },
  { from: 'tl2', to: 'tl3' },
  { from: 'tl1', to: 'tl4' },
  { from: 'tl3', to: 'tl5' },
];

const topRightNodes: Node[] = [
  { id: 'tr1', x: 97, y: 4, size: 3.5, color: 'rgba(255,255,255,0.42)' },
  { id: 'tr2', x: 90, y: 7, size: 2.5, color: 'rgba(200,220,230,0.38)' },
  { id: 'tr3', x: 94, y: 13, size: 3, color: 'rgba(255,255,255,0.36)' },
  { id: 'tr4', x: 87, y: 15, size: 2, color: 'rgba(255,255,255,0.30)' },
  { id: 'tr5', x: 91, y: 19, size: 2.2, color: 'rgba(200,220,230,0.28)' },
];

const topRightConnections: Connection[] = [
  { from: 'tr1', to: 'tr2' },
  { from: 'tr2', to: 'tr3' },
  { from: 'tr2', to: 'tr4' },
  { from: 'tr3', to: 'tr5' },
];

const bottomLeftNodes: Node[] = [
  { id: 'bl1', x: 4, y: 94, size: 3.5, color: 'rgba(255,255,255,0.38)' },
  { id: 'bl2', x: 10, y: 91, size: 2.5, color: 'rgba(255,255,255,0.32)' },
  { id: 'bl3', x: 6, y: 87, size: 2.8, color: 'rgba(230,200,150,0.35)' },
  { id: 'bl4', x: 12, y: 96, size: 2, color: 'rgba(200,220,200,0.28)' },
];

const bottomLeftConnections: Connection[] = [
  { from: 'bl1', to: 'bl2' },
  { from: 'bl2', to: 'bl3' },
  { from: 'bl1', to: 'bl4' },
];

const bottomRightNodes: Node[] = [
  { id: 'br1', x: 96, y: 95, size: 3.5, color: 'rgba(255,255,255,0.36)' },
  { id: 'br2', x: 90, y: 97, size: 2.5, color: 'rgba(255,255,255,0.30)' },
  { id: 'br3', x: 93, y: 89, size: 2.8, color: 'rgba(200,220,200,0.32)' },
  { id: 'br4', x: 88, y: 93, size: 2, color: 'rgba(230,200,150,0.28)' },
];

const bottomRightConnections: Connection[] = [
  { from: 'br1', to: 'br2' },
  { from: 'br1', to: 'br3' },
  { from: 'br3', to: 'br4' },
];

// ============================================
// DELICATE MICRO PARTICLES - Higher density
// ============================================

const microParticles: Node[] = [
  // Top edge
  { id: 'mp1', x: 20, y: 2, size: 2.5, color: 'rgba(255,255,255,0.18)' },
  { id: 'mp2', x: 35, y: 1, size: 2, color: 'rgba(200,220,230,0.15)' },
  { id: 'mp3', x: 50, y: 1.5, size: 2.2, color: 'rgba(255,255,255,0.16)' },
  { id: 'mp4', x: 65, y: 1, size: 2, color: 'rgba(255,255,255,0.14)' },
  { id: 'mp5', x: 80, y: 2, size: 2.5, color: 'rgba(200,220,200,0.15)' },
  // Side edges
  { id: 'mp6', x: 0.5, y: 20, size: 2, color: 'rgba(255,255,255,0.15)' },
  { id: 'mp7', x: 99.5, y: 18, size: 2, color: 'rgba(200,220,230,0.13)' },
  { id: 'mp8', x: 1, y: 40, size: 2.2, color: 'rgba(255,255,255,0.14)' },
  { id: 'mp9', x: 99, y: 38, size: 1.8, color: 'rgba(255,255,255,0.12)' },
  { id: 'mp10', x: 0.5, y: 60, size: 2, color: 'rgba(200,220,200,0.13)' },
  { id: 'mp11', x: 99.5, y: 62, size: 2.2, color: 'rgba(230,200,150,0.14)' },
  { id: 'mp12', x: 1, y: 80, size: 1.8, color: 'rgba(255,255,255,0.12)' },
  // Bottom edge
  { id: 'mp13', x: 25, y: 98.5, size: 2.2, color: 'rgba(255,255,255,0.14)' },
  { id: 'mp14', x: 40, y: 99, size: 2, color: 'rgba(230,200,150,0.13)' },
  { id: 'mp15', x: 60, y: 98.5, size: 2.2, color: 'rgba(255,255,255,0.15)' },
  { id: 'mp16', x: 75, y: 99, size: 2, color: 'rgba(200,220,230,0.12)' },
];

// ============================================
// SVG COMPONENTS
// ============================================

interface ClusterProps {
  nodes: Node[];
  connections: Connection[];
  viewBox: string;
}

const ClusterSVG = memo(function ClusterSVG({ nodes, connections, viewBox }: ClusterProps) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const generatePath = (from: Node, to: Node): string => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offsetX = (to.y - from.y) * 0.2;
    const offsetY = (from.x - to.x) * 0.2;
    return `M ${from.x} ${from.y} Q ${midX + offsetX} ${midY + offsetY} ${to.x} ${to.y}`;
  };

  return (
    <svg
      viewBox={viewBox}
      className="absolute pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
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
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            opacity={0.22}
          />
        );
      })}

      {nodes.map((node, idx) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.size / 2}
          fill={node.color}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' }}
        />
      ))}
    </svg>
  );
});

const MicroParticles = memo(function MicroParticles() {
  return (
    <svg viewBox="0 0 100 100" className="absolute pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {microParticles.map((node, idx) => (
        <circle 
          key={node.id} 
          cx={node.x} 
          cy={node.y} 
          r={node.size / 2} 
          fill={node.color}
          style={{ 
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
            animationName: 'particlePulse',
            animationDuration: `${3 + idx * 0.3}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
          }}
        />
      ))}
    </svg>
  );
});

// ============================================
// CLUSTER WRAPPERS
// ============================================

const TopLeftCluster = memo(function TopLeftCluster() {
  return (
    <div className="absolute pointer-events-none" style={{ top: '1%', left: '0.5%', width: '22vw', height: '24vh', zIndex: 2 }}>
      <ClusterSVG nodes={topLeftNodes} connections={topLeftConnections} viewBox="0 0 22 22" />
    </div>
  );
});

const TopRightCluster = memo(function TopRightCluster() {
  return (
    <div className="absolute pointer-events-none" style={{ top: '1%', right: '0.5%', width: '22vw', height: '24vh', zIndex: 2 }}>
      <ClusterSVG nodes={topRightNodes} connections={topRightConnections} viewBox="82 0 22 24" />
    </div>
  );
});

const BottomLeftCluster = memo(function BottomLeftCluster() {
  return (
    <div className="absolute pointer-events-none" style={{ bottom: '1%', left: '0.5%', width: '20vw', height: '20vh', zIndex: 2 }}>
      <ClusterSVG nodes={bottomLeftNodes} connections={bottomLeftConnections} viewBox="0 82 18 20" />
    </div>
  );
});

const BottomRightCluster = memo(function BottomRightCluster() {
  return (
    <div className="absolute pointer-events-none" style={{ bottom: '1%', right: '0.5%', width: '20vw', height: '20vh', zIndex: 2 }}>
      <ClusterSVG nodes={bottomRightNodes} connections={bottomRightConnections} viewBox="84 84 20 20" />
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const ConstellationClusters = memo(function ConstellationClusters() {
  return (
    <div className="constellation-clusters" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <TopLeftCluster />
      <TopRightCluster />
      <BottomLeftCluster />
      <BottomRightCluster />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <MicroParticles />
      </div>
      <style jsx global>{`
        @keyframes particlePulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default ConstellationClusters;
