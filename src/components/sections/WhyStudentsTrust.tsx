'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const easeLuxury: [number, number, number, number] = [0.25, 1, 0.35, 1];
const easeCinematic: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Trust pillars data
const trustPillars = [
  {
    id: 'personal',
    title: 'Deeply Personal',
    description:
      'CareerOS goes beyond personality tests to understand motivations, strengths, fears, psychology, and long-term fit.',
    accentColor: 'rgba(125, 156, 116, 1)',
    softColor: 'rgba(125, 156, 116, 0.14)',
    glowColor: 'rgba(125, 156, 116, 0.08)',
    icon: PersonalIcon,
  },
  {
    id: 'longterm',
    title: 'Long-Term Thinking',
    description:
      'We optimize for fulfillment, money, sustainability, and future relevance — not short-term trends.',
    accentColor: 'rgba(130, 165, 200, 1)',
    softColor: 'rgba(130, 165, 200, 0.16)',
    glowColor: 'rgba(130, 165, 200, 0.10)',
    icon: LongTermIcon,
  },
  {
    id: 'reallife',
    title: 'Built for Real Life',
    description:
      'Advice should fit your actual life, values, and ambitions — not generic rankings.',
    accentColor: 'rgba(195, 170, 125, 1)',
    softColor: 'rgba(195, 170, 125, 0.16)',
    glowColor: 'rgba(195, 170, 125, 0.10)',
    icon: RealLifeIcon,
  },
];

// Premium minimalist icons
function PersonalIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8 28C8 22 11 19 16 19C21 19 24 22 24 28"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 2V4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M28 16H26"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M6 16H4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

function LongTermIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M16 8V16L22 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 8L28 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M24 4L24 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

function RealLifeIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 4L20 12H28L22 18L24 28L16 22L8 28L10 18L4 12H12L16 4Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

// Trust card component
function TrustCard({
  pillar,
  index,
  isInView,
}: {
  pillar: (typeof trustPillars)[0];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.8,
        delay: 0.25 + index * 0.15,
        ease: easeCinematic,
      }}
      whileHover={{
        y: -5,
        scale: 1.01,
        transition: { duration: 0.4, ease: easeLuxury },
      }}
      style={{
        position: 'relative',
        flex: '1 1 300px',
        maxWidth: '340px',
        padding: '36px 32px',
        borderRadius: '24px',
        background:
          'linear-gradient(165deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 252, 251, 0.97) 100%)',
        border: `1px solid ${pillar.softColor}`,
        boxShadow: `
          0 1px 2px rgba(0,0,0,0.02),
          0 4px 16px rgba(0,0,0,0.03),
          0 16px 40px ${pillar.glowColor},
          inset 0 1px 1px rgba(255,255,255,0.9)
        `,
      }}
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.4 + index * 0.15, ease: easeLuxury }}
        style={{
          position: 'absolute',
          inset: '-10%',
          borderRadius: '32px',
          background: `radial-gradient(ellipse at 50% 60%, ${pillar.glowColor} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1,
          opacity: 0.7,
        }}
      />

      {/* Surface sheen */}
      <div
        style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: '23px',
          background:
            'linear-gradient(170deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.5) 30%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.35 + index * 0.15,
            ease: easeCinematic,
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: pillar.softColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            border: `1px solid ${pillar.accentColor}`,
            opacity: 0.15,
          }}
        >
          <pillar.icon color={pillar.accentColor} />
        </motion.div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
            fontSize: 'clamp(19px, 4vw, 21px)',
            fontWeight: 660,
            letterSpacing: '-0.015em',
            color: '#0d0b09',
            margin: '0 0 14px 0',
          }}
        >
          {pillar.title}
        </h3>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5 + index * 0.15,
            ease: easeLuxury,
          }}
          style={{
            width: '32px',
            height: '2px',
            background: `linear-gradient(90deg, ${pillar.accentColor}, transparent)`,
            marginBottom: '16px',
            borderRadius: '1px',
            opacity: 0.5,
            transformOrigin: 'left',
          }}
        />

        {/* Description */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: 420,
            lineHeight: '1.75',
            color: 'rgba(26, 24, 22, 0.58)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {pillar.description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyStudentsTrust() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '120px 20px 140px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Soft background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(125, 156, 116, 0.04) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 4px',
          zIndex: 1,
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.7, delay: 0, ease: easeCinematic }}
          style={{ marginBottom: '24px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 580,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(125, 156, 116, 0.85)',
            }}
          >
            Why Students Trust CareerOS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 0.1, ease: easeCinematic }}
          style={{
            marginBottom: '20px',
            maxWidth: 'min(90vw, 640px)',
            padding: '0 16px',
          }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(28px, 7vw, 48px)',
              fontWeight: 680,
              lineHeight: '1.12',
              letterSpacing: '-0.028em',
              color: '#0d0b09',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Career decisions deserve more than generic advice.
          </h2>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeCinematic }}
          style={{
            maxWidth: 'min(90vw, 560px)',
            marginBottom: '72px',
            padding: '0 20px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: 400,
              lineHeight: '1.75',
              color: 'rgba(26, 24, 22, 0.52)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Career choices shape years of your life. CareerOS takes that responsibility seriously.
          </p>
        </motion.div>

        {/* Trust Cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px',
            width: '100%',
          }}
        >
          {trustPillars.map((pillar, index) => (
            <TrustCard key={pillar.id} pillar={pillar} index={index} isInView={isInView} />
          ))}
        </div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.9, delay: 0.8, ease: easeCinematic }}
          style={{
            marginTop: '72px',
            textAlign: 'center',
            maxWidth: 'min(85vw, 400px)',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(125, 156, 116, 0.4), transparent)',
              margin: '0 auto 20px',
            }}
          />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4vw, 16px)',
              fontWeight: 400,
              lineHeight: '1.7',
              color: 'rgba(26, 24, 22, 0.42)',
              margin: 0,
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
            }}
          >
            Intelligent guidance for thoughtful decisions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyStudentsTrust;
