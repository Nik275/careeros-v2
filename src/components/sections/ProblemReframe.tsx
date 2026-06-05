'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// Premium easing curves
const easeLuxury: [number, number, number, number] = [0.25, 1, 0.35, 1];
const easeCalm: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Traditional career advice items
const traditionalItems = [
  'Generic personality tests',
  'One-size-fits-all recommendations',
  'Salary-only decision making',
  'Surface-level career matching',
  'Ignores psychology & lifestyle',
  'No long-term outcome thinking',
];

// CareerOS items
const careerOSItems = [
  'Deep psychological understanding',
  'Long-term life outcome modeling',
  'Future relevance & AI resilience',
  'Personalized roadmap',
  'Tradeoff intelligence',
  'Career guidance aligned to your life',
];

// Traditional side item component
function TraditionalItem({ item, index, isInView }: { item: string; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
      transition={{
        duration: 0.55,
        delay: 0.3 + index * 0.06,
        ease: easeLuxury,
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: index < traditionalItems.length - 1 ? '0.5px solid rgba(140, 140, 140, 0.06)' : 'none',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'rgba(175, 160, 160, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: 'rgba(155, 140, 140, 0.6)',
            fontWeight: 500,
          }}
        >
          ✕
        </span>
      </div>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(105, 105, 105, 0.78)',
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
        }}
      >
        {item}
      </span>
    </motion.div>
  );
}

// CareerOS side item component
function CareerOSItem({ item, index, isInView }: { item: string; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
      transition={{
        duration: 0.55,
        delay: 0.4 + index * 0.06,
        ease: easeLuxury,
      }}
      whileHover={{
        x: 2,
        transition: { duration: 0.25, ease: easeLuxury },
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: index < careerOSItems.length - 1 ? '0.5px solid rgba(138, 168, 125, 0.08)' : 'none',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'rgba(138, 168, 125, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: 'rgba(115, 145, 105, 0.9)',
            fontWeight: 600,
          }}
        >
          ✓
        </span>
      </div>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 450,
          color: 'rgba(30, 30, 30, 0.98)',
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
        }}
      >
        {item}
      </span>
    </motion.div>
  );
}

// Ambient glow for CareerOS side - refined premium depth
function CareerOSGlow({ isInView }: { isInView: boolean }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.35, ease: easeLuxury }}
        style={{
          position: 'absolute',
          inset: '-5%',
          borderRadius: '28px',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(138, 168, 125, 0.06) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.4, delay: 0.45, ease: easeLuxury }}
        style={{
          position: 'absolute',
          inset: '-3%',
          borderRadius: '26px',
          background: 'radial-gradient(ellipse at 25% 75%, rgba(148, 178, 212, 0.05) 0%, transparent 60%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </>
  );
}

// Breathing ambient effect - refined subtle glow
function BreathingGlow({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      animate={isInView ? {
        opacity: [0.025, 0.05, 0.025],
        scale: [1, 1.012, 1],
      } : { opacity: 0, scale: 1 }}
      transition={{
        duration: 12,
        ease: easeCalm,
        repeat: Infinity,
        repeatType: 'mirror',
      }}
      style={{
        position: 'absolute',
        inset: '-2%',
        borderRadius: '24px',
        background: 'radial-gradient(ellipse at 45% 45%, rgba(138, 168, 125, 0.04) 0%, transparent 55%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}

export function ProblemReframe() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-15%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '80px 20px 90px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Section header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '52px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.55, delay: 0, ease: easeLuxury }}
            style={{ marginBottom: '16px' }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '10px',
                fontWeight: 540,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(138, 168, 125, 0.75)',
              }}
            >
              The Problem
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.06, ease: easeLuxury }}
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(24px, 5.5vw, 40px)',
              fontWeight: 620,
              lineHeight: '1.2',
              letterSpacing: '-0.026em',
              color: '#0d0b09',
              margin: '0 0 12px 0',
              maxWidth: 'min(90vw, 560px)',
              textAlign: 'center',
              padding: '0 12px',
            }}
          >
            Career advice was never built for someone like you
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeLuxury }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'rgba(26, 24, 22, 0.62)',
              margin: 0,
              maxWidth: 'min(85vw, 460px)',
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            Most career guidance treats everyone the same. CareerOS starts with who you actually are.
          </motion.p>
        </div>

        {/* Comparison container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: 'min(100%, 900px)',
            margin: '0 auto',
          }}
        >
          {/* Traditional side - flatter, muted, colder */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.65, delay: 0.2, ease: easeLuxury }}
            whileHover={{
              y: -1.5,
              transition: { duration: 0.35, ease: easeLuxury },
            }}
            style={{
              position: 'relative',
              padding: '26px 30px',
              borderRadius: '20px',
              background: 'linear-gradient(170deg, rgba(250, 250, 250, 0.95) 0%, rgba(244, 244, 244, 0.92) 100%)',
              border: '0.5px solid rgba(195, 195, 195, 0.4)',
              boxShadow: `
                0 0.5px 0.5px rgba(0,0,0,0.001),
                0 1px 2px rgba(0,0,0,0.002),
                0 2px 3px rgba(0,0,0,0.003)
              `,
            }}
          >
            {/* Subtle greyed atmosphere */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                background: 'linear-gradient(180deg, rgba(215, 215, 215, 0.03) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'rgba(175, 175, 175, 0.55)',
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 560,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: 'rgba(155, 155, 155, 0.8)',
                }}
              >
                Traditional Career Advice
              </span>
            </div>

            {/* Items */}
            <div>
              {traditionalItems.map((item, index) => (
                <TraditionalItem
                  key={index}
                  item={item}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </div>
          </motion.div>

          {/* CareerOS side - elevated, premium, refined */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.65, delay: 0.3, ease: easeLuxury }}
            whileHover={{
              y: -4,
              transition: { duration: 0.45, ease: easeLuxury },
            }}
            style={{
              position: 'relative',
              padding: '26px 30px',
              borderRadius: '20px',
              background: 'linear-gradient(170deg, rgba(255, 255, 255, 0.998) 0%, rgba(254, 255, 253, 0.985) 100%)',
              border: '0.5px solid rgba(138, 168, 125, 0.18)',
              boxShadow: `
                0 0.5px 0.5px rgba(0,0,0,0.001),
                0 1.5px 3px rgba(0,0,0,0.002),
                0 3px 6px rgba(0,0,0,0.003),
                0 6px 12px rgba(138, 168, 125, 0.03),
                0 12px 24px rgba(0,0,0,0.004),
                inset 0 1px 1px rgba(255,255,255,0.99)
              `,
            }}
          >
            {/* Ambient glow */}
            <CareerOSGlow isInView={isInView} />
            <BreathingGlow isInView={isInView} />

            {/* Surface sheen */}
            <div
              style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '19px',
                background: 'linear-gradient(175deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.5) 20%, transparent 45%)',
                pointerEvents: 'none',
              }}
            />

            {/* Subtle border gradient on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.5 }}
              transition={{ duration: 0.4, ease: easeLuxury }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                padding: '0.5px',
                background: 'linear-gradient(165deg, rgba(255,255,255,0.99) 0%, rgba(138, 168, 125, 0.35) 50%, rgba(255,255,255,0.95) 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '18px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'rgba(138, 168, 125, 0.7)',
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 620,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: 'rgba(85, 85, 85, 0.92)',
                }}
              >
                CareerOS
              </span>
            </div>

            {/* Items */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {careerOSItems.map((item, index) => (
                <CareerOSItem
                  key={index}
                  item={item}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* What this leads to - micro heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.75, ease: easeLuxury }}
          style={{
            textAlign: 'center',
            marginTop: '40px',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '10px',
              fontWeight: 540,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(138, 168, 125, 0.65)',
            }}
          >
            What this leads to
          </span>
        </motion.div>

        {/* Outcome strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.7, delay: 0.85, ease: easeLuxury }}
          style={{
            padding: '24px 28px',
            borderRadius: '16px',
            background: 'linear-gradient(170deg, rgba(253, 253, 253, 0.98) 0%, rgba(250, 251, 249, 0.96) 100%)',
            border: '0.5px solid rgba(138, 168, 125, 0.1)',
            width: '100%',
            maxWidth: 'min(100%, 900px)',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Generic advice outcomes */}
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 560,
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  color: 'rgba(165, 145, 145, 0.75)',
                  marginBottom: '12px',
                }}
              >
                With generic advice
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                {['confusion', 'poor fit', 'uncertainty', 'regret'].map((outcome, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.45, delay: 0.95 + i * 0.05, ease: easeLuxury }}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'rgba(135, 125, 125, 0.72)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    → {outcome}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* CareerOS outcomes */}
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 580,
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  color: 'rgba(115, 145, 105, 0.85)',
                  marginBottom: '12px',
                }}
              >
                With CareerOS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                {['clarity', 'confidence', 'long-term alignment', 'better decisions'].map((outcome, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.45, delay: 1.05 + i * 0.05, ease: easeLuxury }}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 450,
                      color: 'rgba(55, 75, 50, 0.95)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    → {outcome}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom emotional bridge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.85, delay: 1.15, ease: easeLuxury }}
          style={{
            textAlign: 'center',
            marginTop: '44px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(138, 168, 125, 0.45), transparent)',
              marginBottom: '16px',
            }}
          />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4.5vw, 17px)',
              fontWeight: 420,
              lineHeight: 1.55,
              color: 'rgba(26, 24, 22, 0.78)',
              letterSpacing: '-0.012em',
              maxWidth: 'min(90vw, 340px)',
              textAlign: 'center',
              margin: 0,
              padding: '0 20px',
            }}
          >
            The right future starts with understanding you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ProblemReframe;
