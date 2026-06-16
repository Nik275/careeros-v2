'use client';

import { useEffect, useRef, useState } from 'react';

interface CareerGlobeBackgroundProps {
  variant?: 'landing' | 'assessment';
}

const generateStars = (count: number, color: string) => {
  let boxShadow = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    boxShadow += `${x}vw ${y}vh ${color}${i < count - 1 ? ', ' : ''}`;
  }
  return boxShadow;
};

import worldMapData from './worldMapData.json';

// Special glowing data nodes (lat, lon)
const DATA_NODES = [
  { lat: 40.71, lon: -74.00, color: '#00f0ff' }, // NYC
  { lat: 51.50, lon: -0.12, color: '#8052ff' }, // London
  { lat: 35.68, lon: 139.69, color: '#00f0ff' }, // Tokyo
  { lat: -23.55, lon: -46.63, color: '#8052ff' }, // Sao Paulo
  { lat: 28.61, lon: 77.20, color: '#00f0ff' }, // New Delhi
  { lat: -33.86, lon: 151.20, color: '#8052ff' }, // Sydney
  { lat: 37.77, lon: -122.41, color: '#00f0ff' }, // SF
];

interface Point3D {
  x: number;
  y: number;
  z: number;
  type: 'land' | 'node';
  color?: string;
  lat?: number;
  lon?: number;
}

export function CareerGlobeBackground({ variant = 'landing' }: CareerGlobeBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stars, setStars] = useState({ far: '', mid: '', near: '' });

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const isMob = window.innerWidth < 768;
    setStars({
      far: generateStars(isMob ? 40 : 80, 'rgba(255, 255, 255, 0.3)'),
      mid: generateStars(isMob ? 20 : 40, 'rgba(180, 150, 255, 0.4)'),
      near: generateStars(isMob ? 10 : 20, 'rgba(200, 180, 255, 0.6)'),
    });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    const resizeHandler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', resizeHandler);

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // Canvas Globe Rendering Engine
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;
    // Reduce globe radius so satellites don't clip off the canvas
    const globeRadius = Math.min(width, height) * 0.38;

    // Generate Points
    const points: Point3D[] = [];
    
    // 1. Generate Landmass Points from worldMapData
    worldMapData.forEach((coord: number[]) => {
      if (isMobile && Math.random() > 0.4) return;
      
      const lat = coord[0];
      const lon = coord[1];
      
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      
      points.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
        type: 'land'
      });
    });

    // 2. Generate Data Nodes
    DATA_NODES.forEach(node => {
      const phi = (90 - node.lat) * (Math.PI / 180);
      const theta = (node.lon + 180) * (Math.PI / 180);
      points.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
        type: 'node',
        color: node.color,
        lat: node.lat,
        lon: node.lon
      });
    });

    // Set initial rotation
    let animationFrameId: number;
    let rotationAngleY = 4.5;
    let time = 0;
    
    const rotSpeed = isMobile ? 0.002 : 0.001;

    // Orbital Data Probes
    // Offset ensures they are prominently visible on initial frame
    const ORBIT_PROBES = [
      { radius: 1.15, speed: 0.005, tiltX: 0.2, tiltZ: 0.1, color: '#00f0ff', size: 5, offset: Math.PI * 0.2 }, // Upper left orbit
      { radius: 1.25, speed: -0.003, tiltX: -0.4, tiltZ: 0.3, color: '#8052ff', size: 4, offset: Math.PI * 1.5 }, // Lower right orbit
      { radius: 1.08, speed: 0.008, tiltX: 0.8, tiltZ: -0.2, color: '#ffffff', size: 3.5, offset: Math.PI * 0.8 } // Front passing orbit
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(rotationAngleY);
      const sinY = Math.sin(rotationAngleY);

      // We render latitudes and longitudes by drawing ellipses based on current rotation
      ctx.strokeStyle = 'rgba(128, 82, 255, 0.05)';
      ctx.lineWidth = 1;
      
      const numLatitudes = 6;
      for (let i = 1; i < numLatitudes; i++) {
        const phi = (i / numLatitudes) * Math.PI;
        const r = globeRadius * Math.sin(phi);
        const y = globeRadius * Math.cos(phi);
        ctx.beginPath();
        ctx.ellipse(cx, cy + y, r, r * 0.2, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      const numLongitudes = 8;
      for (let i = 0; i < numLongitudes; i++) {
        const theta = (i / numLongitudes) * Math.PI * 2 + rotationAngleY;
        const rotatedX = globeRadius * Math.cos(theta);
        
        ctx.beginPath();
        const ew = Math.abs(rotatedX);
        ctx.ellipse(cx, cy, ew, globeRadius, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw subtle orbital paths for satellites
      const currentProbes = isAssessment ? [] : (isMobile ? ORBIT_PROBES.slice(0, 1) : ORBIT_PROBES);
      currentProbes.forEach(probe => {
        ctx.strokeStyle = `rgba(128, 82, 255, 0.15)`;
        ctx.lineWidth = 1;
        
        // Orbital paths are tricky in pure 3D. We can just draw a rough ellipse representing their path.
        // A simpler way to show a trail is to just draw a faint ellipse at their radius/tilt.
        ctx.beginPath();
        ctx.ellipse(cx, cy, probe.radius * globeRadius, probe.radius * globeRadius * 0.3, -probe.tiltZ, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // 3. Generate dynamic Satellite points
      const dynamicPoints = currentProbes.map((probe) => {
        const angle = time * probe.speed + probe.offset;
        
        const bx = Math.cos(angle) * probe.radius;
        const by = 0;
        const bz = Math.sin(angle) * probe.radius;
        
        const cosTX = Math.cos(probe.tiltX);
        const sinTX = Math.sin(probe.tiltX);
        const cosTZ = Math.cos(probe.tiltZ);
        const sinTZ = Math.sin(probe.tiltZ);
        
        const tx = bx;
        const ty = by * cosTX - bz * sinTX;
        const tz = by * sinTX + bz * cosTX;
        
        const f_x = tx * cosTZ - ty * sinTZ;
        const f_y = tx * sinTZ + ty * cosTZ;
        const f_z = tz;

        return {
          x: f_x,
          y: f_y,
          z: f_z,
          type: 'satellite' as const,
          color: probe.color,
          size: isMobile ? probe.size * 0.7 : probe.size
        };
      });

      const allPoints = [...points, ...dynamicPoints];

      const projectedPoints = allPoints.map(p => {
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        const ry = -p.y;
        
        const tilt = 0.2;
        const cosX = Math.cos(tilt);
        const sinX = Math.sin(tilt);
        
        const tx = rx;
        const ty = ry * cosX - rz * sinX;
        const tz = ry * sinX + rz * cosX;

        return {
          ...p,
          px: cx + tx * globeRadius,
          py: cy + ty * globeRadius,
          pz: tz
        };
      }).sort((a, b) => a.pz - b.pz);

      projectedPoints.forEach(p => {
        const isFront = p.pz > 0;
        
        if (p.type === 'satellite') {
          if (!isFront && p.pz < -0.8) return; // heavily hidden behind globe
          const r = p.size! * (isFront ? 1.5 : 0.8);
          const alpha = isFront ? 1 : 0.4;
          
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fillStyle = p.color!;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          
          if (isFront) {
            // Bright core
            ctx.shadowColor = p.color!;
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.px, p.py, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Premium side panels/wings
            ctx.strokeStyle = `rgba(255,255,255,0.8)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.px - r*2.5, p.py - r*0.5);
            ctx.lineTo(p.px + r*2.5, p.py + r*0.5);
            ctx.stroke();
          }
        } else {
          // Landmass and Nodes
          const alpha = isFront ? (p.type === 'node' ? 1 : 0.6) : (p.type === 'node' ? 0.3 : 0.1);
          const baseRadius = p.type === 'node' ? (isFront ? 3.5 : 2) : (isFront ? 1.2 : 0.8);
          
          // Add subtle shimmer to landmass points
          const r = baseRadius * (1 + (p.type === 'land' && isFront ? Math.random() * 0.3 : 0));

          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          
          if (p.type === 'node') {
            ctx.fillStyle = p.color || '#fff';
            ctx.fill();
            
            if (isFront) {
              // Node Glow
              ctx.shadowColor = p.color || '#fff';
              ctx.shadowBlur = 10;
              ctx.fillStyle = 'rgba(255,255,255,0.8)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          } else {
            ctx.fillStyle = `rgba(80, 200, 255, ${alpha})`;
            ctx.fill();
          }
        }
      });
      
      // Draw a subtle atmospheric rim glow
      const gradient = ctx.createRadialGradient(cx, cy, globeRadius * 0.8, cx, cy, globeRadius * 1.05);
      gradient.addColorStop(0, 'rgba(80, 200, 255, 0)');
      gradient.addColorStop(0.8, 'rgba(80, 200, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(128, 82, 255, 0.3)');
      
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Update rotation
      if (!reducedMotion) {
        rotationAngleY -= rotSpeed;
        time += 1;
      }
      
      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, isMobile, reducedMotion]);

  if (!mounted) return null;

  const isAssessment = variant === 'assessment';

  // Desktop: Fixed width/height using clamp, guaranteed on screen
  // Mobile: Centered absolute positioning behind text
  const globeSize = isMobile ? 'clamp(260px, 88vw, 380px)' : 'clamp(360px, 32vw, 560px)';
  const globeTop = isMobile ? (isAssessment ? '5%' : '90px') : '15%';
  const globeRight = isMobile ? 'auto' : '5%';
  const globeLeft = isMobile ? '50%' : 'auto';
  const globeTransform = isMobile ? 'translateX(-50%)' : 'none';
  const globeMargin = '0';
  
  // Opacity is significantly lower on mobile to keep text clear since it sits behind it
  const globeOpacity = isAssessment ? (isMobile ? 0.2 : 0.5) : (isMobile ? 0.35 : 1);

  return (
    <div
      className="cosmic-bg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #020008 0%, #0a0018 35%, #060012 65%, #030008 100%)',
      }}
    >
      {/* --- LAYER 1: Deep Starfield Parallax --- */}
      <div
        className={reducedMotion ? '' : 'cosmic-parallax-far cosmic-shimmer-1'}
        style={{ position: 'absolute', inset: 0 }}
      >
        <div style={{ width: 1, height: 1, borderRadius: '50%', boxShadow: stars.far }} />
      </div>
      <div
        className={reducedMotion ? '' : 'cosmic-parallax-mid cosmic-shimmer-2'}
        style={{ position: 'absolute', inset: 0 }}
      >
        <div style={{ width: 2, height: 2, borderRadius: '50%', boxShadow: stars.mid }} />
      </div>
      <div
        className={reducedMotion ? '' : 'cosmic-parallax-near cosmic-shimmer-3'}
        style={{ position: 'absolute', inset: 0 }}
      >
        <div style={{ width: 3, height: 3, borderRadius: '50%', boxShadow: stars.near }} />
      </div>

      {/* --- LAYER 2: Canvas Holographic Earth --- */}
      <div
        style={{
          position: 'absolute',
          top: globeTop,
          right: globeRight,
          left: globeLeft,
          margin: globeMargin,
          width: globeSize,
          height: globeSize,
          opacity: globeOpacity,
          transform: globeTransform,
          transition: 'opacity 1s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* --- LAYER 3: Orbital Rings --- */}
        <svg
          style={{
            position: 'absolute',
            inset: '-10%',
            width: '120%',
            height: '120%',
            overflow: 'visible',
            opacity: 0.6,
          }}
          viewBox="0 0 400 400"
          fill="none"
        >
          {/* Outer Orbit */}
          <ellipse
            className={reducedMotion ? '' : 'cosmic-flow-1'}
            cx="200" cy="200" rx="190" ry="80"
            stroke="rgba(80, 200, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 20 8 16"
            fill="none"
            transform="rotate(-20 200 200)"
          />
          {/* Outer Tracking Point */}
          <g className={reducedMotion ? '' : 'cosmic-orbit-rotate'} style={{ transformOrigin: '200px 200px' }}>
            <circle cx="390" cy="200" r="4" fill="#fff" filter="blur(2px)" />
            <circle cx="390" cy="200" r="2" fill="#fff" />
          </g>

          {/* Inner Orbit */}
          <ellipse
            className={reducedMotion ? '' : 'cosmic-flow-2'}
            cx="200" cy="200" rx="140" ry="50"
            stroke="rgba(128, 82, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 15 4 10"
            fill="none"
            transform="rotate(15 200 200)"
          />
          {/* Inner Tracking Point */}
          <g className={reducedMotion ? '' : 'cosmic-orbit-rotate-reverse'} style={{ transformOrigin: '200px 200px' }}>
            <circle cx="60" cy="200" r="3" fill="#b496ff" filter="blur(1px)" />
            <circle cx="60" cy="200" r="1.5" fill="#fff" />
          </g>
        </svg>
      </div>
      
      {/* --- LAYER 4: Ambient Background Haze (Global) --- */}
      <div
        className={reducedMotion ? '' : 'cosmic-glow-drift-1'}
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(90, 50, 220, 0.15) 0%, rgba(90, 50, 220, 0.05) 40%, transparent 70%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
