'use client';

import { memo, useMemo } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  glowColor: string;
  duration: number;
  delay: number;
  layer: 1 | 2 | 3;
  blur: number;
  opacity: number;
}

// Linear Congruential Generator for deterministic, cross-platform randomness
function createLCG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Refined color palette - more subtle, premium tones
const COLOR_CONFIGS = [
  { base: '#A8B89C', glow: 'rgba(168, 184, 156, 0.4)' }, // soft sage
  { base: '#D4C9A8', glow: 'rgba(212, 201, 168, 0.35)' }, // muted gold
  { base: '#E8E2D4', glow: 'rgba(232, 226, 212, 0.4)' }, // pale cream
  { base: '#B8C8D4', glow: 'rgba(184, 200, 212, 0.35)' }, // soft blue
  { base: '#DCD4C0', glow: 'rgba(220, 212, 192, 0.35)' }, // warm neutral
];

// Generate particles with premium restraint
function generateParticles(count: number): Particle[] {
  const rand = createLCG(12345);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    // Position: keep center relatively clear
    let left = rand() * 100;
    let top = rand() * 100;

    // Push particles away from center hero area
    if (left > 35 && left < 65 && top > 30 && top < 70) {
      if (rand() > 0.5) {
        left = left < 50 ? rand() * 12 : 88 + rand() * 12;
      } else {
        top = top < 50 ? rand() * 15 : 85 + rand() * 15;
      }
    }

    // Layer assignment - more in background for subtlety
    const layerRoll = rand();
    let layer: 1 | 2 | 3;
    let blur: number;
    let opacityMod: number;

    if (layerRoll < 0.35) {
      layer = 1; // Background
      blur = 10;
      opacityMod = 0.6;
    } else if (layerRoll < 0.75) {
      layer = 2; // Midground
      blur = 6;
      opacityMod = 0.85;
    } else {
      layer = 3; // Foreground
      blur = 3;
      opacityMod = 1;
    }

    // Size - smaller, more subtle
    const sizeRoll = rand();
    let size: number;
    let baseOpacity: number;

    if (sizeRoll < 0.4) {
      size = 6 + rand() * 4;
      baseOpacity = 0.35 + rand() * 0.15;
    } else if (sizeRoll < 0.75) {
      size = 12 + rand() * 6;
      baseOpacity = 0.45 + rand() * 0.15;
    } else {
      size = 20 + rand() * 10;
      baseOpacity = 0.5 + rand() * 0.15;
    }

    // Apply layer modifiers
    if (layer === 1) size *= 1.4;
    if (layer === 3) size *= 0.7;

    const colorIdx = Math.floor(rand() * COLOR_CONFIGS.length);
    const colorConfig = COLOR_CONFIGS[colorIdx];

    // Slower, more ethereal movement
    const duration = 8 + rand() * 6;

    // Minimal delay for instant motion
    const delay = rand() * 0.2;

    // Calculate final opacity - more subtle
    let opacity = baseOpacity * opacityMod;
    if (layer === 3) opacity = Math.min(0.75, opacity);
    if (layer === 1) opacity *= 0.6;

    particles.push({
      id: i,
      left,
      top,
      size,
      color: colorConfig.base,
      glowColor: colorConfig.glow,
      duration,
      delay,
      layer,
      blur,
      opacity,
    });
  }

  return particles;
}

export const ActiveParticles = memo(function ActiveParticles() {
  // Fewer particles for premium subtlety
  const particles = useMemo(() => generateParticles(50), []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left.toFixed(4)}%`,
            top: `${p.top.toFixed(4)}%`,
            width: `${p.size.toFixed(2)}px`,
            height: `${p.size.toFixed(2)}px`,
            background: p.color,
            borderRadius: '50%',
            filter: `blur(${p.blur}px)`,
            boxShadow: `
              inset 0 0 ${(p.size * 0.3).toFixed(1)}px rgba(255,255,255,0.5),
              0 0 ${(p.size * 1.5).toFixed(1)}px ${(p.size * 0.4).toFixed(1)}px ${p.glowColor},
              0 0 ${(p.size * 3).toFixed(1)}px ${(p.size * 0.8).toFixed(1)}px ${p.glowColor}
            `,
            willChange: 'transform',
            transform: 'translateZ(0)', // GPU acceleration
            animation: `particleFloat${p.id % 4} ${p.duration.toFixed(2)}s ease-in-out ${p.delay.toFixed(2)}s infinite alternate`,
            opacity: p.opacity,
          }}
        />
      ))}

      <style>{`
        @keyframes particleFloat0 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-opacity, 0.5); }
          100% { transform: translate3d(8px, -12px, 0) scale(1.03); opacity: calc(var(--base-opacity, 0.5) * 1.1); }
        }
        @keyframes particleFloat1 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-opacity, 0.55); }
          100% { transform: translate3d(-10px, 8px, 0) scale(1.02); opacity: calc(var(--base-opacity, 0.55) * 1.08); }
        }
        @keyframes particleFloat2 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-opacity, 0.48); }
          100% { transform: translate3d(6px, 10px, 0) scale(1.04); opacity: calc(var(--base-opacity, 0.48) * 1.12); }
        }
        @keyframes particleFloat3 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: var(--base-opacity, 0.6); }
          100% { transform: translate3d(-8px, -8px, 0) scale(1.02); opacity: calc(var(--base-opacity, 0.6) * 1.06); }
      `}</style>
    </div>
  );
});

export default ActiveParticles;
