'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ease, duration, stagger } from '@/lib/motion';

// Step data with refined premium color identities
const steps = [
  {
    id: 'understand',
    number: '01',
    title: 'Understand You',
    description: 'Deep psychological foundation',
    details: ['motivations', 'strengths', 'personality', 'fears', 'values', 'lifestyle fit'],
    tone: 'We understand who you are first.',
    accentColor: 'rgba(125, 156, 116, 1)',
    softColor: 'rgba(125, 156, 116, 0.15)',
    glowColor: 'rgba(125, 156, 116, 0.12)',
    timelineColor: 'rgba(125, 156, 116, 0.4)',
  },
  {
    id: 'intelligence',
    number: '02',
    title: 'Intelligence Engine',
    description: 'Long-term optimization model',
    details: ['fulfillment', 'money', 'sustainability', 'future relevance', 'regret minimization'],
    tone: 'We model what actually leads to a good future.',
    accentColor: 'rgba(130, 165, 200, 1)',
    softColor: 'rgba(130, 165, 200, 0.18)',
    glowColor: 'rgba(130, 165, 200, 0.14)',
    timelineColor: 'rgba(130, 165, 200, 0.4)',
  },
  {
    id: 'direction',
    number: '03',
    title: 'Personalized Direction',
    description: 'Career clarity built for you',
    details: ['best-fit careers', 'personalized roadmap', 'alternatives', 'tradeoff intelligence'],
    tone: 'Not generic advice — direction built for you.',
    accentColor: 'rgba(195, 170, 125, 1)',
    softColor: 'rgba(195, 170, 125, 0.18)',
    glowColor: 'rgba(195, 170, 125, 0.14)',
    timelineColor: 'rgba(195, 170, 125, 0.4)',
  },
  {
    id: 'mentor',
    number: '04',
    title: 'Wise Mentor',
    description: 'Ongoing intelligent guidance',
    details: ['intelligent mentor', 'decision confidence', 'evolving support', 'long-term thinking'],
    tone: 'Someone wise in your corner.',
    accentColor: 'rgba(175, 155, 185, 1)',
    softColor: 'rgba(175, 155, 185, 0.18)',
    glowColor: 'rgba(175, 155, 185, 0.14)',
    timelineColor: 'rgba(175, 155, 185, 0.4)',
  },
];

// Desktop Timeline node component
function TimelineNode({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        duration: duration.normal,
        delay: 0.3 + index * stagger.normal,
        ease: ease.luxury,
      }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: `2px solid ${step.timelineColor}`,
        boxShadow: `0 0 20px ${step.glowColor}, 0 0 40px ${step.glowColor}`,
        zIndex: 10,
      }}
    >
      {/* Inner dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          duration: duration.fast,
          delay: 0.5 + index * stagger.normal,
          ease: ease.luxury,
        }}
        style={{
          position: 'absolute',
          inset: '3px',
          borderRadius: '50%',
          background: step.accentColor,
          opacity: 0.8,
        }}
      />
    </motion.div>
  );
}

// Desktop Step card component
function DesktopStepCard({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
      transition={{
        duration: duration.slow,
        delay: 0.2 + index * stagger.relaxed,
        ease: ease.luxury,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: duration.fast, ease: ease.luxury },
      }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        padding: '32px 36px',
        borderRadius: '24px',
        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 252, 251, 0.97) 50%, rgba(250, 250, 249, 0.95) 100%)',
        border: `1px solid ${step.softColor}`,
        boxShadow: `
          0 1px 2px rgba(0,0,0,0.02),
          0 4px 12px rgba(0,0,0,0.03),
          0 12px 32px ${step.glowColor},
          0 24px 48px rgba(0,0,0,0.02),
          inset 0 1px 1px rgba(255,255,255,0.9)
        `,
        marginLeft: isLeft ? '0' : 'auto',
        marginRight: isLeft ? 'auto' : '0',
      }}
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: duration.slow, delay: 0.4 + index * stagger.relaxed, ease: ease.luxury }}
        style={{
          position: 'absolute',
          inset: '-12%',
          borderRadius: '32px',
          background: `radial-gradient(ellipse at 50% 60%, ${step.glowColor} 0%, transparent 70%)`,
          filter: 'blur(50px)',
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
          background: 'linear-gradient(170deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.5) 30%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Accent line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{
          duration: duration.normal,
          delay: 0.5 + index * stagger.relaxed,
          ease: ease.luxury,
        }}
        style={{
          position: 'absolute',
          left: '0',
          top: '24px',
          bottom: '24px',
          width: '3px',
          background: `linear-gradient(180deg, ${step.accentColor} 0%, ${step.timelineColor} 50%, transparent 100%)`,
          borderRadius: '0 2px 2px 0',
          transformOrigin: 'top',
          opacity: 0.6,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, paddingLeft: '8px' }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          {/* Step number badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{
              duration: duration.normal,
              delay: 0.35 + index * stagger.relaxed,
              ease: ease.luxury,
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: step.softColor,
              border: `1px solid ${step.timelineColor}`,
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 680,
                letterSpacing: '-0.02em',
                color: step.accentColor,
              }}
            >
              {step.number}
            </span>
          </motion.div>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(18px, 4.5vw, 21px)',
              fontWeight: 660,
              letterSpacing: '-0.018em',
              color: '#0d0b09',
              margin: 0,
            }}
          >
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: 450,
            color: 'rgba(26, 24, 22, 0.62)',
            margin: '0 0 16px 0',
            letterSpacing: '-0.01em',
            lineHeight: 1.5,
          }}
        >
          {step.description}
        </p>

        {/* Details pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {step.details.map((detail, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{
                duration: duration.fast,
                delay: 0.5 + index * stagger.relaxed + i * stagger.tight,
                ease: ease.luxury,
              }}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 450,
                color: step.accentColor,
                opacity: 0.85,
                padding: '6px 12px',
                borderRadius: '8px',
                background: step.softColor,
                border: `0.5px solid ${step.timelineColor}`,
                letterSpacing: '-0.01em',
              }}
            >
              {detail}
            </motion.span>
          ))}
        </div>

        {/* Tone line */}
        <div
          style={{
            width: '28px',
            height: '2px',
            background: `linear-gradient(90deg, ${step.accentColor}, transparent)`,
            marginBottom: '12px',
            opacity: 0.5,
            borderRadius: '1px',
          }}
        />

        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(14px, 3.5vw, 15px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'rgba(26, 24, 22, 0.48)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.55,
          }}
        >
          {step.tone}
        </p>
      </div>
    </motion.div>
  );
}

// Mobile Step card - completely different design for mobile
function MobileStepCard({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: duration.slow,
        delay: 0.15 + index * stagger.tight,
        ease: ease.luxury,
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.2 },
      }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        padding: '28px 24px',
        borderRadius: '20px',
        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 252, 251, 0.98) 100%)',
        border: `1px solid ${step.softColor}`,
        boxShadow: `
          0 1px 3px rgba(0,0,0,0.02),
          0 4px 16px rgba(0,0,0,0.04),
          0 12px 32px ${step.glowColor},
          inset 0 1px 1px rgba(255,255,255,0.9)
        `,
      }}
    >
      {/* Soft ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          borderRadius: '28px',
          background: `radial-gradient(ellipse at 50% 70%, ${step.glowColor} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: -1,
          opacity: 0.6,
        }}
      />

      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '24px',
          right: '24px',
          height: '2px',
          background: `linear-gradient(90deg, ${step.accentColor} 0%, ${step.timelineColor} 50%, transparent 100%)`,
          borderRadius: '0 0 1px 1px',
          opacity: 0.5,
        }}
      />

      {/* Header with number and title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '18px',
        }}
      >
        {/* Step number - larger for mobile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            height: '44px',
            borderRadius: '12px',
            background: step.softColor,
            border: `1.5px solid ${step.timelineColor}`,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: step.accentColor,
            }}
          >
            {step.number}
          </span>
        </div>

        {/* Title and description */}
        <div style={{ flex: 1, paddingTop: '2px' }}>
          <h3
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: '20px',
              fontWeight: 680,
              letterSpacing: '-0.02em',
              color: '#0d0b09',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: 450,
              color: 'rgba(26, 24, 22, 0.55)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
            }}
          >
            {step.description}
          </p>
        </div>
      </div>

      {/* Details pills - better wrapping for mobile */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px',
          paddingLeft: '60px',
        }}
      >
        {step.details.map((detail, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{
              duration: duration.fast,
              delay: 0.35 + index * stagger.tight + i * stagger.tight,
              ease: ease.luxury,
            }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 450,
              color: step.accentColor,
              padding: '7px 14px',
              borderRadius: '10px',
              background: step.softColor,
              border: `0.5px solid ${step.timelineColor}`,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {detail}
          </motion.span>
        ))}
      </div>

      {/* Tone quote */}
      <div
        style={{
          paddingLeft: '60px',
          paddingTop: '4px',
          borderTop: `1px solid ${step.softColor}`,
          marginLeft: '0',
          marginRight: '0',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'rgba(26, 24, 22, 0.45)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.6,
          }}
        >
          {step.tone}
        </p>
      </div>
    </motion.div>
  );
}

// Desktop Timeline Layout
function DesktopTimeline({ isInView }: { isInView: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const timelineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: '48px',
      }}
    >
      {/* Central timeline line */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '60px',
          bottom: '60px',
          width: '2px',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.04)',
          zIndex: 0,
        }}
      >
        {/* Animated progress line */}
        <motion.div
          style={{
            width: '100%',
            height: timelineHeight,
            background: 'linear-gradient(180deg, rgba(125,156,116,0.5) 0%, rgba(130,165,200,0.4) 33%, rgba(195,170,125,0.4) 66%, rgba(175,155,185,0.5) 100%)',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Timeline glow effect */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '60px',
          bottom: '60px',
          width: '40px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, rgba(125,156,116,0.08) 0%, rgba(130,165,200,0.06) 33%, rgba(195,170,125,0.06) 66%, rgba(175,155,185,0.08) 100%)',
          filter: 'blur(15px)',
          zIndex: 0,
          opacity: 0.8,
        }}
      />

      {/* Steps */}
      {steps.map((step, index) => (
        <div
          key={step.id}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
            width: '100%',
            padding: '0 20px',
          }}
        >
          {/* Timeline node */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          >
            <TimelineNode step={step} index={index} isInView={isInView} />
          </div>

          {/* Step card */}
          <div style={{ width: '45%', maxWidth: '420px' }}>
            <DesktopStepCard step={step} index={index} isInView={isInView} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile Vertical Stack Layout
function MobileStack({ isInView }: { isInView: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '0 16px',
      }}
    >
      {steps.map((step, index) => (
        <MobileStepCard key={step.id} step={step} index={index} isInView={isInView} />
      ))}
    </div>
  );
}

export function HowCareerOSWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 0 120px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Background journey glow - desktop only */}
      <div
        className="desktop-only"
        style={{
          position: 'absolute',
          left: '50%',
          top: '15%',
          bottom: '15%',
          width: '2px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, rgba(125,156,116,0.15) 0%, rgba(130,165,200,0.12) 33%, rgba(195,170,125,0.12) 66%, rgba(175,155,185,0.15) 100%)',
          filter: 'blur(8px)',
          opacity: 0.6,
          zIndex: 0,
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {/* Premium Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: duration.slow, delay: 0, ease: ease.luxury }}
          style={{ marginBottom: '20px', padding: '0 20px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 580,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(125, 156, 116, 0.8)',
            }}
          >
            The Journey
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: duration.slow, delay: 0.1, ease: ease.luxury }}
          style={{ marginBottom: '16px', maxWidth: 'min(90vw, 640px)', padding: '0 20px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(26px, 7vw, 48px)',
              fontWeight: 680,
              lineHeight: '1.12',
              letterSpacing: '-0.028em',
              color: '#0d0b09',
              margin: 0,
              textAlign: 'center',
            }}
          >
            A guided path to clarity
          </h2>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: duration.slow, delay: 0.2, ease: ease.luxury }}
          style={{ maxWidth: 'min(90vw, 520px)', marginBottom: '56px', padding: '0 24px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4vw, 17px)',
              fontWeight: 400,
              lineHeight: '1.7',
              color: 'rgba(26, 24, 22, 0.55)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            CareerOS guides you through a thoughtful process — from deep self-understanding 
            to personalized direction, with intelligent support every step of the way.
          </p>
        </motion.div>

        {/* Desktop Timeline - hidden on mobile */}
        <div
          style={{
            display: 'none',
            width: '100%',
            justifyContent: 'center',
          }}
          className="desktop-timeline"
        >
          <DesktopTimeline isInView={isInView} />
        </div>

        {/* Mobile Stack - shown only on mobile */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
          }}
          className="mobile-stack"
        >
          <MobileStack isInView={isInView} />
        </div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: duration.slow, delay: 0.9, ease: ease.luxury }}
          style={{
            marginTop: '56px',
            textAlign: 'center',
            maxWidth: 'min(85vw, 400px)',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(125, 156, 116, 0.4), transparent)',
              margin: '0 auto 16px',
            }}
          />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(14px, 4vw, 15px)',
              fontWeight: 400,
              lineHeight: '1.7',
              color: 'rgba(26, 24, 22, 0.42)',
              margin: 0,
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
            }}
          >
            A wise system helping you figure out your life.
          </p>
        </motion.div>
      </div>

      {/* CSS for responsive display */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-timeline {
            display: flex !important;
          }
          .mobile-stack {
            display: none !important;
          }
          .desktop-only {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-timeline {
            display: none !important;
          }
          .mobile-stack {
            display: flex !important;
          }
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HowCareerOSWorks;
