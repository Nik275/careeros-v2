'use client';

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ease, duration, stagger } from '@/lib/motion';

// Ultra-smooth spring configuration for organic motion
const springPremium = {
  stiffness: 18,
  damping: 20,
  mass: 1.2,
};

// Premium bubble floating durations - staggered for organic feel
const bubbleDurations = {
  left: 10,
  center: 12,
  right: 11,
};

// Stagger delays - unsynced for natural movement
const bubbleDelays = {
  left: 0,
  center: 1.6,
  right: 0.9,
};

const cards = [
  {
    id: 'pressure',
    title: 'Pressure',
    subtitle: 'Parents. Society. Expectations.',
    icon: PressureIcon,
    accentColor: 'rgba(157, 178, 143, 0.55)',
    baseTint: 'rgba(157, 178, 143, 0.18)',
    deepTint: 'rgba(140, 165, 125, 0.12)',
    glowColor: 'rgba(157, 178, 143, 0.22)',
  },
  {
    id: 'confusion',
    title: 'Confusion',
    subtitle: 'Too many careers. Too little clarity.',
    icon: ConfusionIcon,
    accentColor: 'rgba(180, 200, 220, 0.55)',
    baseTint: 'rgba(180, 200, 220, 0.20)',
    deepTint: 'rgba(165, 188, 210, 0.14)',
    glowColor: 'rgba(180, 200, 220, 0.24)',
  },
  {
    id: 'regret',
    title: 'Regret',
    subtitle: 'Fear of choosing wrong.',
    icon: RegretIcon,
    accentColor: 'rgba(210, 190, 155, 0.55)',
    baseTint: 'rgba(210, 190, 155, 0.18)',
    deepTint: 'rgba(195, 175, 140, 0.12)',
    glowColor: 'rgba(210, 190, 155, 0.22)',
  },
];

// Premium minimalist icons with subtle glow
function PressureIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})` }}>
      <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 28C8 22 11 20 16 20C21 20 24 22 24 28" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12C4 8 7 5 11 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
      <path d="M28 12C28 8 25 5 21 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function ConfusionIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})` }}>
      <circle cx="9" cy="9" r="3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="9" r="3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="24" r="3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 11.5L14 19" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      <path d="M20.5 11.5L18 19" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function RegretIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})` }}>
      <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11V16L19.5 19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2" fill={color} opacity="0.45" />
    </svg>
  );
}

// Ambient depth layer - subtle intelligence network with gentle motion
function AmbientDepthLayer() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.06,
        overflow: 'hidden',
      }}
    >
      {/* Subtle pathway lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id="pathGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9DB28F" stopOpacity="0" />
            <stop offset="50%" stopColor="#9DB28F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9DB28F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Elegant curved pathways */}
        <path
          d="M-100 400 Q300 200, 600 400 T1300 400"
          stroke="url(#pathGrad1)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M-100 500 Q400 300, 700 500 T1300 450"
          stroke="url(#pathGrad1)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M-100 300 Q500 500, 800 350 T1300 380"
          stroke="url(#pathGrad1)"
          strokeWidth="0.6"
          fill="none"
          opacity="0.4"
        />
        {/* Subtle connection nodes with ultra-smooth floating motion */}
        <motion.circle 
          cx="300" cy="320" r="3" fill="#9DB28F" opacity="0.3"
          animate={{ cy: [320, 315, 320], opacity: [0.28, 0.32, 0.28] }}
          transition={{ duration: 10, ease: ease.luxury, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.circle 
          cx="600" cy="400" r="4" fill="#9DB28F" opacity="0.4"
          animate={{ cy: [400, 394, 400], opacity: [0.35, 0.4, 0.35] }}
          transition={{ duration: 12, ease: ease.luxury, repeat: Infinity, repeatType: "mirror", delay: 1.6 }}
        />
        <motion.circle 
          cx="900" cy="380" r="3" fill="#9DB28F" opacity="0.3"
          animate={{ cy: [380, 375, 380], opacity: [0.28, 0.32, 0.28] }}
          transition={{ duration: 11, ease: ease.luxury, repeat: Infinity, repeatType: "mirror", delay: 0.9 }}
        />
        <motion.circle 
          cx="450" cy="450" r="2" fill="#9DB28F" opacity="0.25"
          animate={{ cy: [450, 446, 450], opacity: [0.22, 0.26, 0.22] }}
          transition={{ duration: 9, ease: ease.luxury, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
        />
        <motion.circle 
          cx="750" cy="420" r="2" fill="#9DB28F" opacity="0.25"
          animate={{ cy: [420, 416, 420], opacity: [0.22, 0.26, 0.22] }}
          transition={{ duration: 10.5, ease: ease.luxury, repeat: Infinity, repeatType: "mirror", delay: 1.1 }}
        />
      </svg>
    </div>
  );
}

// Card animation variants (defined at module level for reuse)
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.slow, ease: ease.luxury },
  },
};

// Premium card component with refined dimensional depth
function PremiumCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    mouseX.set(x * 16);
    mouseY.set(y * 16);
  };

  const isCenter = index === 1;
  const breathDuration = isCenter ? 14 : 12;
  const breathDelay = index * 0.5;

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      animate={{
        y: [0, -2, 0],
        scale: [1, isCenter ? 1.005 : 1.002, 1],
      }}
      transition={{
        y: { duration: breathDuration, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay },
        scale: { duration: breathDuration * 1.2, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay + 0.2 },
      }}
      whileHover={{
        y: -3,
        scale: 1.005,
        transition: { duration: duration.fast, ease: ease.luxury },
      }}
      style={{
        position: 'relative',
        padding: '48px 36px',
        borderRadius: '28px',
        background: `
          linear-gradient(168deg, 
            rgba(255, 255, 255, 0.92) 0%, 
            rgba(255, 255, 255, 0.82) 40%,
            rgba(252, 251, 250, 0.76) 100%
          )
        `,
        border: `0.5px solid rgba(255, 255, 255, 0.95)`,
        boxShadow: isCenter
          ? `
            0 0.5px 0.5px rgba(0,0,0,0.008),
            0 2px 4px rgba(0,0,0,0.012),
            0 6px 12px rgba(0,0,0,0.015),
            0 14px 32px rgba(0,0,0,0.018),
            0 28px 56px ${card.glowColor},
            0 48px 96px rgba(0,0,0,0.04),
            inset 0 1px 1px rgba(255,255,255,0.9)
          `
          : `
            0 0.5px 0.5px rgba(0,0,0,0.006),
            0 2px 4px rgba(0,0,0,0.01),
            0 6px 10px rgba(0,0,0,0.012),
            0 12px 24px rgba(0,0,0,0.015),
            0 24px 48px ${card.glowColor},
            inset 0 1px 1px rgba(255,255,255,0.85)
          `,
        cursor: 'default',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        willChange: 'transform',
      }}
    >
      {/* Soft ambient glow - cursor responsive */}
      <motion.div
        style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          background: `radial-gradient(circle at center, ${card.glowColor} 0%, transparent 55%)`,
          pointerEvents: 'none',
          filter: 'blur(60px)',
          opacity: isHovered ? 0.45 : 0.22,
          x: glowX,
          y: glowY,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Deep dimensional shadow layer */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.55 : [0.18, isCenter ? 0.32 : 0.26, 0.18],
          scale: isHovered ? 1.02 : [1, isCenter ? 1.03 : 1.015, 1],
        }}
        transition={{
          opacity: { duration: breathDuration * 0.9, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay },
          scale: { duration: breathDuration, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay + 0.15 },
        }}
        style={{
          position: 'absolute',
          inset: '-8%',
          borderRadius: '36px',
          background: `radial-gradient(ellipse at 50% 100%, ${card.glowColor} 0%, transparent 65%)`,
          pointerEvents: 'none',
          filter: 'blur(45px)',
          zIndex: -2,
        }}
      />

      {/* Subtle color wash - top lighting */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.65 : [0.35, isCenter ? 0.48 : 0.42, 0.35],
        }}
        transition={{
          duration: breathDuration * 0.8,
          ease: ease.luxury,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: breathDelay + 0.1,
        }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '28px',
          background: `
            radial-gradient(ellipse 140% 100% at 30% 15%, ${card.baseTint} 0%, transparent 50%),
            radial-gradient(ellipse 120% 90% at 70% 85%, ${card.deepTint} 0%, transparent 45%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Premium surface sheen */}
      <div
        style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: '27px',
          background: 'linear-gradient(172deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 45%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Elegant border glow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: duration.fast, ease: ease.luxury }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '28px',
          padding: '0.5px',
          background: `linear-gradient(160deg, rgba(255,255,255,0.98) 0%, ${card.accentColor} 50%, rgba(255,255,255,0.6) 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }}
      />

      {/* Soft lift shadow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.35 : 0 }}
        transition={{ duration: duration.fast, ease: ease.luxury }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '28px',
          boxShadow: `
            0 20px 50px rgba(0, 0, 0, 0.035),
            0 8px 20px rgba(0, 0, 0, 0.02)
          `,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* Center card ambient depth */}
      {isCenter && (
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: breathDuration * 0.85,
            ease: ease.luxury,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: breathDelay + 0.3,
          }}
          style={{
            position: 'absolute',
            inset: '-10%',
            borderRadius: '36px',
            background: `radial-gradient(ellipse at 50% 50%, ${card.glowColor} 0%, transparent 55%)`,
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: -2,
          }}
        />
      )}

      {/* Icon with refined motion */}
      <motion.div
        style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}
        animate={{
          scale: isHovered ? 1.02 : [1, isCenter ? 1.008 : 1.004, 1],
          y: isHovered ? 0 : [0, -1, 0],
        }}
        transition={{
          scale: { duration: breathDuration * 0.7, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay + 0.1 },
          y: { duration: breathDuration * 0.85, ease: ease.luxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay + 0.15 },
        }}
      >
        <card.icon color={card.accentColor} />
      </motion.div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.h3
          animate={{
            color: isHovered ? '#141210' : '#1a1816',
          }}
          transition={{ duration: duration.fast, ease: ease.luxury }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '19px',
            fontWeight: 640,
            letterSpacing: '-0.022em',
            margin: '0 0 10px 0',
          }}
        >
          {card.title}
        </motion.h3>
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13.5px',
            fontWeight: 420,
            lineHeight: '1.5',
            color: 'rgba(26, 24, 22, 0.55)',
            margin: 0,
            letterSpacing: '-0.004em',
          }}
        >
          {card.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyCareerOS() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger.tight, delayChildren: 0.05 },
    },
  };

  const microLabelVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  };

  const headlineVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  };

  const subtextVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, delay: 0.12, ease: ease.luxury },
    },
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger.normal, delayChildren: 0.4 },
    },
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '90px 20px 180px',
        background: 'transparent',
      }}
    >
      {/* Ambient depth layer */}
      <AmbientDepthLayer />

      {/* Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Micro Label */}
        <motion.div variants={microLabelVariants} style={{ marginBottom: '34px' }}>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#7D9C74',
              opacity: 0.75,
            }}
          >
            Why CareerOS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div variants={headlineVariants} style={{ marginBottom: '34px', maxWidth: 'min(90vw, 660px)', padding: '0 12px' }}>
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(26px, 6vw, 48px)',
              fontWeight: 720,
              lineHeight: '1.15',
              letterSpacing: '-0.026em',
              color: '#1a1816',
              margin: 0,
              textAlign: 'center',
            }}
          >
            You&apos;re making one of the biggest decisions of your life.
          </h2>
        </motion.div>

        {/* Sub-headline */}
        <motion.div variants={subtextVariants} style={{ marginBottom: '42px', padding: '0 16px' }}>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(17px, 4.5vw, 24px)',
              fontWeight: 450,
              lineHeight: '1.5',
              letterSpacing: '-0.01em',
              color: '#5a5856',
              margin: 0,
              textAlign: 'center',
            }}
          >
            But most students are forced to guess.
          </p>
        </motion.div>

        {/* Supporting Copy */}
        <motion.div variants={subtextVariants} style={{ maxWidth: 'min(90vw, 620px)', marginBottom: '68px', padding: '0 16px' }}>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4vw, 17px)',
              fontWeight: 400,
              lineHeight: '1.85',
              color: 'rgba(26, 24, 22, 0.72)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Most students choose careers based on pressure, confusion, trends, marks, random advice, 
            or fear of regret — not real self-understanding. CareerOS helps students think clearly 
            about their future using psychology, intelligence, and long-term life fit.
          </p>
        </motion.div>

        {/* Cards Strip */}
        <motion.div
          variants={cardContainerVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '18px',
            width: '100%',
            maxWidth: '880px',
          }}
        >
          {cards.map((card, index) => (
            <PremiumCard key={card.id} card={card} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default WhyCareerOS;
