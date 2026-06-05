'use client';

import { memo } from 'react';

// Ultra-subtle ambient blobs - atmospheric depth without distraction
const blobs = [
  {
    id: 1,
    color: 'rgba(166, 178, 158, 0.12)', // soft sage
    size: '550px',
    x: '-8%',
    y: '8%',
    duration: 24,
    delay: 0,
    moveX: 80,
    moveY: -60,
  },
  {
    id: 2,
    color: 'rgba(218, 198, 158, 0.10)', // warm cream
    size: '650px',
    x: '65%',
    y: '75%',
    duration: 28,
    delay: 3,
    moveX: -70,
    moveY: 60,
  },
  {
    id: 3,
    color: 'rgba(186, 198, 208, 0.10)', // pale blue
    size: '500px',
    x: '78%',
    y: '-12%',
    duration: 22,
    delay: 5,
    moveX: -60,
    moveY: 80,
  },
  {
    id: 4,
    color: 'rgba(234, 210, 165, 0.09)', // soft gold
    size: '600px',
    x: '15%',
    y: '85%',
    duration: 26,
    delay: 1.5,
    moveX: 70,
    moveY: -70,
  },
  {
    id: 5,
    color: 'rgba(166, 178, 158, 0.08)', // sage lighter
    size: '480px',
    x: '88%',
    y: '45%',
    duration: 30,
    delay: 4,
    moveX: -80,
    moveY: -50,
  },
];

export const AmbientBlobs = memo(function AmbientBlobs() {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {blobs.map((blob) => (
        <div
          key={blob.id}
          style={{
            position: 'absolute',
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: 'blur(120px)',
            willChange: 'transform',
            transform: 'translateZ(0)', // GPU acceleration
            animation: `blobFloat${blob.id} ${blob.duration}s ease-in-out ${blob.delay}s infinite alternate`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes blobFloat1 {
          0% { transform: translate(0, 0) scale(0.98) rotate(-4deg); opacity: 0.10; }
          100% { transform: translate(80px, -60px) scale(1.06) rotate(4deg); opacity: 0.14; }
        }
        @keyframes blobFloat2 {
          0% { transform: translate(0, 0) scale(0.98) rotate(3deg); opacity: 0.09; }
          100% { transform: translate(-70px, 60px) scale(1.05) rotate(-3deg); opacity: 0.12; }
        }
        @keyframes blobFloat3 {
          0% { transform: translate(0, 0) scale(0.98) rotate(-3deg); opacity: 0.09; }
          100% { transform: translate(-60px, 80px) scale(1.08) rotate(4deg); opacity: 0.12; }
        }
        @keyframes blobFloat4 {
          0% { transform: translate(0, 0) scale(0.98) rotate(4deg); opacity: 0.08; }
          100% { transform: translate(70px, -70px) scale(1.04) rotate(-4deg); opacity: 0.11; }
        }
        @keyframes blobFloat5 {
          0% { transform: translate(0, 0) scale(0.98) rotate(-3deg); opacity: 0.07; }
          100% { transform: translate(-80px, -50px) scale(1.07) rotate(3deg); opacity: 0.10; }
      `}</style>
    </div>
  );
});

export default AmbientBlobs;
