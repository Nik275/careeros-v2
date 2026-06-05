'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const easePremium: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Ultra-smooth spring configuration for organic motion
const springPremium = {
  stiffness: 18,
  damping: 20,
  mass: 1.2,
};

// Premium bubble floating durations - staggered for organic feel
const bubbleDurations = {
  left: 9,
  center: 10.5,
  right: 9.5,
};

// Stagger delays - unsynced for natural movement
const bubbleDelays = {
  left: 0,
  center: 1.4,
  right: 0.8,
};

// Stage data - refined content with better hierarchy
const stages = [
  {
    id: 'understand',
    title: 'Understand You',
    items: ['Psychology', 'Strengths', 'Motivations', 'Lifestyle Fit'],
    accentColor: 'rgba(165, 185, 155, 0.38)',
    glowColor: 'rgba(165, 185, 155, 0.14)',
    deepColor: 'rgba(150, 170, 140, 0.08)',
    label: 'Understand',
    size: 'side' as const,
  },
  {
    id: 'intelligence',
    title: 'Intelligence Engine',
    items: ['Fulfillment', 'Money', 'Future relevance', 'Regret minimization'],
    accentColor: 'rgba(165, 185, 210, 0.85)',
    glowColor: 'rgba(165, 185, 210, 0.52)',
    deepColor: 'rgba(145, 165, 195, 0.35)',
    label: 'Analyze',
    size: 'center' as const,
  },
  {
    id: 'direction',
    title: 'Best Long-Term Direction',
    items: ['Career + life fit', 'Future aligned', 'Built for you'],
    accentColor: 'rgba(200, 180, 150, 0.38)',
    glowColor: 'rgba(200, 180, 150, 0.14)',
    deepColor: 'rgba(185, 165, 135, 0.08)',
    label: 'Optimize',
    size: 'side' as const,
  },
];

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// ============================================
// DESKTOP COMPONENTS (unchanged)
// ============================================

// Premium connection line with intelligent flowing pulse - DESKTOP
function ConnectionLine({ isActive, delay, direction = 'forward' }: { 
  isActive: boolean; 
  delay: number;
  direction?: 'forward' | 'backward';
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100px',
        height: '40px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Base ambient line - soft premium gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '1.5px',
          background: 'linear-gradient(90deg, rgba(157, 178, 143, 0.18), rgba(165, 185, 210, 0.28), rgba(195, 170, 135, 0.18))',
          borderRadius: '1px',
        }}
      />
      
      {/* Premium glow line - reveals on scroll */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 1.2, delay: delay + 0.3, ease: easePremium }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '1.5px',
          background: 'linear-gradient(90deg, rgba(157, 178, 143, 0.32), rgba(165, 185, 210, 0.48), rgba(195, 170, 135, 0.32))',
          borderRadius: '1px',
          transformOrigin: direction === 'forward' ? 'left' : 'right',
        }}
      />

      {/* Ultra-soft ambient glow layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0.2, 0.35, 0.2] } : { opacity: 0 }}
        transition={{
          duration: 6,
          delay: delay + 0.8,
          ease: easePremium,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '16px',
          background: 'linear-gradient(90deg, transparent, rgba(165, 185, 210, 0.12), transparent)',
          filter: 'blur(6px)',
        }}
      />

      {/* Intelligence pulse - subtle light traveling through */}
      <motion.div
        initial={{ x: direction === 'forward' ? -50 : 50, opacity: 0 }}
        animate={isActive ? { 
          x: direction === 'forward' ? 50 : -50, 
          opacity: [0, 0.5, 0.5, 0],
        } : { x: direction === 'forward' ? -50 : 50, opacity: 0 }}
        transition={{
          duration: 6,
          delay: delay + 1.2,
          ease: [0.25, 0.1, 0.25, 1],
          repeat: Infinity,
          repeatDelay: 5,
        }}
        style={{
          position: 'absolute',
          width: '40px',
          height: '1.5px',
          borderRadius: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), rgba(165, 185, 210, 0.3), transparent)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Soft energy dot - barely visible */}
      <motion.div
        initial={{ x: direction === 'forward' ? -50 : 50, opacity: 0, scale: 0.5 }}
        animate={isActive ? { 
          x: direction === 'forward' ? 50 : -50, 
          opacity: [0, 0.6, 0.6, 0],
          scale: [0.5, 0.8, 0.8, 0.5]
        } : { x: direction === 'forward' ? -50 : 50, opacity: 0, scale: 0.5 }}
        transition={{
          duration: 6,
          delay: delay + 1.2,
          ease: [0.25, 0.1, 0.25, 1],
          repeat: Infinity,
          repeatDelay: 5,
        }}
        style={{
          position: 'absolute',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(165, 185, 210, 0.4) 100%)',
        }}
      />

      {/* Seamless blend into nodes - soft fade edges */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '20px',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(248,245,238,0.9), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          width: '20px',
          height: '100%',
          background: 'linear-gradient(270deg, rgba(248,245,238,0.9), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// Premium intelligence node with brain-like center bubble - DESKTOP
function IntelligenceNode({
  stage,
  index,
  isInView,
}: {
  stage: (typeof stages)[0];
  index: number;
  isInView: boolean;
}) {
  const isCenter = stage.size === 'center';
  // Center bubble 10% larger for brain-like dominance
  const nodeSize = isCenter ? 320 : 165;

  // Premium scroll reveal timing
  const revealDelay = index === 0 ? 0.6 : index === 1 ? 0.85 : 1.1;
  const revealDuration = index === 1 ? 1 : 0.85;

  // Ultra-smooth bubble floating configuration
  const breathDuration = isCenter ? bubbleDurations.center : index === 0 ? bubbleDurations.left : bubbleDurations.right;
  const breathDelay = isCenter ? bubbleDelays.center : index === 0 ? bubbleDelays.left : bubbleDelays.right;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96, filter: 'blur(8px)' }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
      } : { 
        opacity: 0, 
        y: 20, 
        scale: 0.96,
        filter: 'blur(8px)',
      }}
      transition={{ 
        duration: revealDuration, 
        delay: revealDelay, 
        ease: easePremium,
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}
    >
      {/* Node visual container - ultra-smooth premium floating */}
      <motion.div
        style={{ position: 'relative', width: nodeSize, height: nodeSize }}
        animate={isInView ? {
          y: [0, -5, 0],
          scale: [1, isCenter ? 1.02 : 1.015, 1],
          rotate: [0, 0.3, 0],
        } : {
          y: 0,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          y: { duration: breathDuration, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay },
          scale: { duration: breathDuration * 1.05, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.1 },
          rotate: { duration: breathDuration * 1.2, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.2 },
        }}
      >
        {/* Breathing visual layers */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
          }}
        >
          {/* Layer 1: Deep ambient glow - ultra-smooth subtle breathing */}
          <motion.div
            animate={isInView ? {
              opacity: isCenter ? [0.32, 0.45, 0.32] : [0.1, 0.14, 0.1],
              scale: isCenter ? [1, 1.03, 1] : [1, 1.006, 1],
            } : {
              opacity: isCenter ? 0.32 : 0.1,
              scale: 1,
            }}
            transition={{
              duration: isCenter ? breathDuration * 1.1 : breathDuration * 1.4,
              ease: easePremium,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: breathDelay + index * 0.3,
            }}
            style={{
              position: 'absolute',
              inset: isCenter ? '-18%' : '-6%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${stage.glowColor} 0%, transparent 65%)`,
              filter: isCenter ? 'blur(32px)' : 'blur(18px)',
            }}
          />

          {/* Layer 2: Rich color base - enhanced for center */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(circle at 50% 50%, rgba(240,245,252,0.75) 0%, ${stage.deepColor} 55%, rgba(235,240,250,0.5) 100%)`
                : stage.deepColor,
            }}
          />

          {/* Layer 3: Premium surface - refined glass feel */}
          <div
            style={{
              position: 'absolute',
              inset: '1.5px',
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(ellipse 88% 82% at 32% 22%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 18%, rgba(252,250,255,0.88) 40%, rgba(248,246,252,0.78) 65%, ${stage.accentColor} 100%)`
                : `radial-gradient(ellipse 82% 70% at 28% 18%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 22%, rgba(252,250,248,0.78) 50%, ${stage.accentColor} 100%)`,
              boxShadow: isCenter
                ? `inset 0 5px 14px rgba(255,255,255,0.98), inset 0 -4px 10px rgba(0,0,0,0.02), 0 12px 48px rgba(0,0,0,0.04), 0 28px 90px ${stage.glowColor}, 0 48px 120px rgba(165,185,210,0.12)`
                : `inset 0 3px 10px rgba(255,255,255,0.98), inset 0 -2px 5px rgba(0,0,0,0.015), 0 5px 20px rgba(0,0,0,0.025), 0 12px 40px ${stage.glowColor}`,
            }}
          />

          {/* Layer 4: Soft inner luminosity - enhanced for center */}
          <motion.div
            animate={isInView ? {
              opacity: isCenter ? [0.38, 0.52, 0.38] : [0.14, 0.2, 0.14],
            } : {
              opacity: isCenter ? 0.38 : 0.14,
            }}
            transition={{
              duration: isCenter ? breathDuration : breathDuration * 1.2,
              ease: easePremium,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: breathDelay + index * 0.25,
            }}
            style={{
              position: 'absolute',
              inset: isCenter ? '10%' : '12%',
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(circle at 38% 38%, rgba(210,225,245,0.55) 0%, ${stage.glowColor} 40%, transparent 75%)`
                : `radial-gradient(circle, ${stage.glowColor} 0%, transparent 65%)`,
              filter: isCenter ? 'blur(24px)' : 'blur(14px)',
            }}
          />

          {/* Layer 5: Elegant surface highlight - refined */}
          <div
            style={{
              position: 'absolute',
              inset: '2.5px',
              borderRadius: '50%',
              background: isCenter
                ? 'linear-gradient(142deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.52) 25%, transparent 45%, transparent 72%, rgba(245,248,252,0.32) 100%)'
                : 'linear-gradient(148deg, rgba(255,255,255,0.78) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Layer 6: Soft edge refinement - premium border */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: isCenter 
                ? '1px solid rgba(255,255,255,0.75)' 
                : '1px solid rgba(255,255,255,0.6)',
              pointerEvents: 'none',
            }}
          />

          {/* Center node premium depth pulse - brain-like presence */}
          {isCenter && (
            <motion.div
              animate={isInView ? {
                opacity: [0.3, 0.42, 0.3],
                scale: [1, 1.06, 1],
              } : {
                opacity: 0.3,
                scale: 1,
              }}
              transition={{
                duration: breathDuration * 0.9,
                ease: easePremium,
                repeat: Infinity,
                repeatType: "mirror",
                delay: breathDelay + 0.25,
              }}
              style={{
                position: 'absolute',
                inset: '-12%',
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 50% 50%, ${stage.glowColor} 0%, transparent 50%)`,
                filter: 'blur(36px)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          )}
        </div>

        {/* Content - refined typography with better spacing */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: isCenter ? '38px' : '22px',
            zIndex: 10,
          }}
          animate={isInView ? {
            y: [0, -1, 0],
            opacity: [0.98, 1, 0.98],
          } : {
            y: 0,
            opacity: 1,
          }}
          transition={{
            y: { duration: isCenter ? 8.5 : 7.5, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.1 },
            opacity: { duration: isCenter ? 9 : 8, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.15 },
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isCenter ? '20px' : '12.5px',
              fontWeight: isCenter ? 720 : 620,
              letterSpacing: isCenter ? '-0.022em' : '-0.018em',
              color: isCenter ? '#0f0e0d' : '#3a3836',
              margin: '0 0 18px 0',
              lineHeight: 1.15,
            }}
          >
            {stage.title}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isCenter ? '8px' : '5px',
            }}
          >
            {stage.items.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={isInView ? {
                  opacity: [0.98, 1, 0.98],
                  y: [0, -0.5, 0]
                } : {
                  opacity: 0,
                  y: 4
                }}
                transition={{
                  opacity: { duration: isCenter ? 8.5 : 7.5, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.3 + i * 0.06 },
                  y: { duration: isCenter ? 8 : 7, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.35 + i * 0.06 },
                }}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: isCenter ? '14px' : '10px',
                  fontWeight: 400,
                  color: isCenter ? 'rgba(26, 24, 22, 0.52)' : 'rgba(26, 24, 22, 0.42)',
                  letterSpacing: '-0.006em',
                  lineHeight: 1.4,
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Premium Label - refined reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.7, delay: revealDelay + revealDuration + 0.15, ease: easePremium }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: isCenter ? '5px' : '3px',
            height: isCenter ? '5px' : '3px',
            borderRadius: '50%',
            background: stage.accentColor,
            boxShadow: isCenter ? `0 0 12px ${stage.glowColor}` : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9px',
            fontWeight: isCenter ? 600 : 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: isCenter ? 'rgba(26, 24, 22, 0.55)' : 'rgba(26, 24, 22, 0.32)',
          }}
        >
          {stage.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MOBILE COMPONENTS (premium vertical journey)
// ============================================

// Elegant vertical connector with flowing pulse - MOBILE
function MobileConnector({ isActive, delay }: { 
  isActive: boolean; 
  delay: number;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '40px',
        height: '48px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Base vertical line - soft premium */}
      <div
        style={{
          position: 'absolute',
          width: '1.5px',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(157, 178, 143, 0.2), rgba(165, 185, 210, 0.32), rgba(195, 170, 135, 0.2))',
          borderRadius: '1px',
        }}
      />
      
      {/* Premium glow line - reveals on scroll */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={isActive ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 1, delay: delay + 0.2, ease: easePremium }}
        style={{
          position: 'absolute',
          width: '1.5px',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(157, 178, 143, 0.35), rgba(165, 185, 210, 0.52), rgba(195, 170, 135, 0.35))',
          borderRadius: '1px',
          transformOrigin: 'top',
        }}
      />

      {/* Soft ambient glow layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0.15, 0.28, 0.15] } : { opacity: 0 }}
        transition={{
          duration: 5,
          delay: delay + 0.5,
          ease: easePremium,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{
          position: 'absolute',
          width: '12px',
          height: '100%',
          background: 'linear-gradient(180deg, transparent, rgba(165, 185, 210, 0.1), transparent)',
          filter: 'blur(4px)',
        }}
      />

      {/* Intelligence pulse - subtle light traveling downward */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={isActive ? { 
          y: 20, 
          opacity: [0, 0.45, 0.45, 0],
        } : { y: -20, opacity: 0 }}
        transition={{
          duration: 5,
          delay: delay + 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          repeat: Infinity,
          repeatDelay: 4,
        }}
        style={{
          position: 'absolute',
          width: '1.5px',
          height: '22px',
          borderRadius: '1px',
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.45), rgba(165, 185, 210, 0.25), transparent)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Soft energy dot */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.5 }}
        animate={isActive ? { 
          y: 20, 
          opacity: [0, 0.55, 0.55, 0],
          scale: [0.5, 0.75, 0.75, 0.5]
        } : { y: -20, opacity: 0, scale: 0.5 }}
        transition={{
          duration: 5,
          delay: delay + 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          repeat: Infinity,
          repeatDelay: 4,
        }}
        style={{
          position: 'absolute',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(165, 185, 210, 0.35) 100%)',
        }}
      />
    </div>
  );
}

// Premium mobile node - optimized for vertical journey
function MobileIntelligenceNode({
  stage,
  index,
  isInView,
}: {
  stage: (typeof stages)[0];
  index: number;
  isInView: boolean;
}) {
  const isCenter = stage.size === 'center';
  // Mobile sizing: side = 1x (175px), center = 1.25x (220px)
  const nodeSize = isCenter ? 220 : 175;

  // Mobile reveal timing - staggered vertical flow
  const revealDelay = index === 0 ? 0.5 : index === 1 ? 0.75 : 1.0;
  const revealDuration = 0.8;

  // Mobile breathing - optimized for performance
  const breathDuration = isCenter ? 9 : 8;
  const breathDelay = index * 0.4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(6px)' }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
      } : { 
        opacity: 0, 
        y: 30, 
        scale: 0.95,
        filter: 'blur(6px)',
      }}
      transition={{ 
        duration: revealDuration, 
        delay: revealDelay, 
        ease: easePremium,
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Node visual container - mobile optimized floating */}
      <motion.div
        style={{ position: 'relative', width: nodeSize, height: nodeSize }}
        animate={isInView ? {
          y: [0, -4, 0],
          scale: [1, isCenter ? 1.015 : 1.01, 1],
        } : {
          y: 0,
          scale: 1,
        }}
        transition={{
          y: { duration: breathDuration, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay },
          scale: { duration: breathDuration * 1.05, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.1 },
        }}
      >
        {/* Visual layers - mobile optimized */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
          }}
        >
          {/* Layer 1: Deep ambient glow - mobile optimized */}
          <motion.div
            animate={isInView ? {
              opacity: isCenter ? [0.28, 0.38, 0.28] : [0.12, 0.16, 0.12],
              scale: isCenter ? [1, 1.02, 1] : [1, 1.005, 1],
            } : {
              opacity: isCenter ? 0.28 : 0.12,
              scale: 1,
            }}
            transition={{
              duration: isCenter ? breathDuration * 1.1 : breathDuration * 1.3,
              ease: easePremium,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: breathDelay + index * 0.2,
            }}
            style={{
              position: 'absolute',
              inset: isCenter ? '-12%' : '-6%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${stage.glowColor} 0%, transparent 65%)`,
              filter: isCenter ? 'blur(24px)' : 'blur(16px)',
            }}
          />

          {/* Layer 2: Rich color base */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(circle at 50% 50%, rgba(240,245,252,0.7) 0%, ${stage.deepColor} 55%, rgba(235,240,250,0.45) 100%)`
                : stage.deepColor,
            }}
          />

          {/* Layer 3: Premium surface - mobile refined */}
          <div
            style={{
              position: 'absolute',
              inset: '1.5px',
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(ellipse 88% 82% at 32% 22%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 18%, rgba(252,250,255,0.85) 40%, rgba(248,246,252,0.75) 65%, ${stage.accentColor} 100%)`
                : `radial-gradient(ellipse 82% 70% at 28% 18%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.86) 22%, rgba(252,250,248,0.75) 50%, ${stage.accentColor} 100%)`,
              boxShadow: isCenter
                ? `inset 0 4px 12px rgba(255,255,255,0.98), inset 0 -3px 8px rgba(0,0,0,0.02), 0 10px 40px rgba(0,0,0,0.04), 0 22px 70px ${stage.glowColor}, 0 38px 100px rgba(165,185,210,0.1)`
                : `inset 0 3px 10px rgba(255,255,255,0.98), inset 0 -2px 4px rgba(0,0,0,0.012), 0 4px 16px rgba(0,0,0,0.02), 0 10px 32px ${stage.glowColor}`,
            }}
          />

          {/* Layer 4: Soft inner luminosity */}
          <motion.div
            animate={isInView ? {
              opacity: isCenter ? [0.32, 0.45, 0.32] : [0.14, 0.2, 0.14],
            } : {
              opacity: isCenter ? 0.32 : 0.14,
            }}
            transition={{
              duration: isCenter ? breathDuration : breathDuration * 1.15,
              ease: easePremium,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: breathDelay + index * 0.15,
            }}
            style={{
              position: 'absolute',
              inset: isCenter ? '10%' : '12%',
              borderRadius: '50%',
              background: isCenter
                ? `radial-gradient(circle at 38% 38%, rgba(210,225,245,0.5) 0%, ${stage.glowColor} 40%, transparent 75%)`
                : `radial-gradient(circle, ${stage.glowColor} 0%, transparent 65%)`,
              filter: isCenter ? 'blur(20px)' : 'blur(12px)',
            }}
          />

          {/* Layer 5: Elegant surface highlight */}
          <div
            style={{
              position: 'absolute',
              inset: '2.5px',
              borderRadius: '50%',
              background: isCenter
                ? 'linear-gradient(142deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.48) 25%, transparent 45%, transparent 72%, rgba(245,248,252,0.28) 100%)'
                : 'linear-gradient(148deg, rgba(255,255,255,0.75) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.08) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Layer 6: Soft edge refinement */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: isCenter 
                ? '1px solid rgba(255,255,255,0.72)' 
                : '1px solid rgba(255,255,255,0.58)',
              pointerEvents: 'none',
            }}
          />

          {/* Center node depth pulse */}
          {isCenter && (
            <motion.div
              animate={isInView ? {
                opacity: [0.26, 0.36, 0.26],
                scale: [1, 1.04, 1],
              } : {
                opacity: 0.26,
                scale: 1,
              }}
              transition={{
                duration: breathDuration * 0.9,
                ease: easePremium,
                repeat: Infinity,
                repeatType: "mirror",
                delay: breathDelay + 0.2,
              }}
              style={{
                position: 'absolute',
                inset: '-10%',
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 50% 50%, ${stage.glowColor} 0%, transparent 50%)`,
                filter: 'blur(28px)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          )}
        </div>

        {/* Content - mobile optimized typography */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: isCenter ? '32px' : '26px',
            zIndex: 10,
          }}
          animate={isInView ? {
            y: [0, -0.8, 0],
            opacity: [0.98, 1, 0.98],
          } : {
            y: 0,
            opacity: 1,
          }}
          transition={{
            y: { duration: isCenter ? 8 : 7, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.08 },
            opacity: { duration: isCenter ? 8.5 : 7.5, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.12 },
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isCenter ? '17px' : '14px',
              fontWeight: isCenter ? 680 : 600,
              letterSpacing: isCenter ? '-0.02em' : '-0.015em',
              color: isCenter ? '#0f0e0d' : '#2a2826',
              margin: '0 0 14px 0',
              lineHeight: 1.2,
            }}
          >
            {stage.title}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isCenter ? '6px' : '5px',
            }}
          >
            {stage.items.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 3 }}
                animate={isInView ? {
                  opacity: [0.98, 1, 0.98],
                  y: [0, -0.4, 0]
                } : {
                  opacity: 0,
                  y: 3
                }}
                transition={{
                  opacity: { duration: isCenter ? 8 : 7, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.25 + i * 0.05 },
                  y: { duration: isCenter ? 7.5 : 6.5, ease: easePremium, repeat: Infinity, repeatType: "mirror", delay: breathDelay + 0.3 + i * 0.05 },
                }}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: isCenter ? '13px' : '11px',
                  fontWeight: 400,
                  color: isCenter ? 'rgba(26, 24, 22, 0.55)' : 'rgba(26, 24, 22, 0.48)',
                  letterSpacing: '-0.005em',
                  lineHeight: 1.35,
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.6, delay: revealDelay + revealDuration + 0.1, ease: easePremium }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: isCenter ? '4px' : '3px',
            height: isCenter ? '4px' : '3px',
            borderRadius: '50%',
            background: stage.accentColor,
            boxShadow: isCenter ? `0 0 10px ${stage.glowColor}` : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '10px',
            fontWeight: isCenter ? 580 : 520,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: isCenter ? 'rgba(26, 24, 22, 0.52)' : 'rgba(26, 24, 22, 0.35)',
          }}
        >
          {stage.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WhyCareerOSDifferent() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-15%' });
  const isMobile = useIsMobile();

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: isMobile ? '80px 20px 100px' : '120px 24px 180px',
        background: 'transparent',
        overflow: 'visible',
      }}
    >
      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Micro Label - Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0, ease: easePremium }}
          style={{ marginBottom: isMobile ? '32px' : '38px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#7D9C74',
              opacity: 0.8,
            }}
          >
            How CareerOS Works
          </span>
        </motion.div>

        {/* Headline - Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 0.15, ease: easePremium }}
          style={{ marginBottom: isMobile ? '28px' : '38px', maxWidth: isMobile ? '340px' : '640px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: isMobile ? 'clamp(26px, 7vw, 36px)' : 'clamp(32px, 5.4vw, 50px)',
              fontWeight: 720,
              lineHeight: isMobile ? '1.12' : '1.08',
              letterSpacing: '-0.03em',
              color: '#1a1816',
              margin: 0,
            }}
          >
            Career advice isn&apos;t enough.
            <br />
            You need career intelligence.
          </h2>
        </motion.div>

        {/* Subheadline - Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.85, delay: 0.35, ease: easePremium }}
          style={{ maxWidth: isMobile ? '320px' : '580px', marginBottom: isMobile ? '52px' : '64px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isMobile ? 'clamp(14px, 4vw, 16px)' : 'clamp(15px, 1.9vw, 17px)',
              fontWeight: 400,
              lineHeight: isMobile ? '1.75' : '1.85',
              color: 'rgba(26, 24, 22, 0.68)',
              margin: 0,
            }}
          >
            Most platforms suggest careers.
            CareerOS understands you — then identifies the path most likely to maximize fulfillment, success, and long-term life fit.
          </p>
        </motion.div>

        {/* Intelligence System - Desktop Horizontal / Mobile Vertical */}
        {isMobile ? (
          // MOBILE: Premium vertical journey
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {stages.map((stage, index) => (
              <div 
                key={stage.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  marginBottom: index < stages.length - 1 ? '8px' : '0',
                }}
              >
                <MobileIntelligenceNode stage={stage} index={index} isInView={isInView} />
                {index < stages.length - 1 && (
                  <MobileConnector isActive={isInView} delay={0.35 + index * 0.1} />
                )}
              </div>
            ))}
          </div>
        ) : (
          // DESKTOP: Horizontal system (unchanged)
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              columnGap: '0',
              rowGap: '60px',
            }}
          >
            {stages.map((stage, index) => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                <IntelligenceNode stage={stage} index={index} isInView={isInView} />
                {index < stages.length - 1 && (
                  <ConnectionLine isActive={isInView} delay={0.4 + index * 0.12} direction={index === 0 ? 'forward' : 'backward'} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default WhyCareerOSDifferent;
