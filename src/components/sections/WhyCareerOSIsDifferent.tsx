'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const easePremium: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Card data - final premium hierarchy tuning
const intelligenceCards = [
  {
    id: 'psychology',
    title: 'Deep Psychological Understanding',
    description: 'We understand motivations, personality, strengths, fears, values, and lifestyle fit — not just interests.',
    accentColor: 'rgba(125, 156, 116, 0.34)',
    glowColor: 'rgba(125, 156, 116, 0.16)',
    deepColor: 'rgba(110, 140, 102, 0.09)',
    floatDuration: 15,
    floatDelay: 0,
    scale: 1,
  },
  {
    id: 'longterm',
    title: 'Long-Term Thinking',
    description: 'We optimize for fulfillment, money, future relevance, sustainability, and long-term regret minimization.',
    accentColor: 'rgba(128, 168, 218, 0.56)',
    glowColor: 'rgba(128, 168, 218, 0.36)',
    deepColor: 'rgba(113, 153, 203, 0.22)',
    isFeatured: true,
    floatDuration: 17,
    floatDelay: 0.35,
    scale: 1.048,
  },
  {
    id: 'personalized',
    title: 'Not One-Size-Fits-All',
    description: 'No generic career recommendations. Every path adapts to the student.',
    accentColor: 'rgba(180, 164, 140, 0.32)',
    glowColor: 'rgba(180, 164, 140, 0.14)',
    deepColor: 'rgba(165, 149, 125, 0.08)',
    floatDuration: 14,
    floatDelay: 0.7,
    scale: 1,
  },
];

// Premium intelligence flow connector with traveling pulse
function IntelligenceFlowConnector({ index, isInView }: { index: number; isInView: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        height: '36px',
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* Ultra-soft base line with gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.45 + index * 0.1, ease: easePremium }}
        style={{
          position: 'absolute',
          top: '10px',
          width: '1px',
          height: '16px',
          background: index === 0 
            ? 'linear-gradient(180deg, rgba(125, 156, 116, 0.12) 0%, rgba(128, 168, 218, 0.20) 100%)'
            : 'linear-gradient(180deg, rgba(128, 168, 218, 0.20) 0%, rgba(180, 164, 140, 0.12) 100%)',
          borderRadius: '1px',
        }}
      />
      
      {/* Ultra-subtle traveling intelligence pulse */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.35, 0.45, 0.35, 0],
          y: [0, 6, 12, 18, 24],
        } : { opacity: 0, y: 0 }}
        transition={{
          duration: 4.5,
          ease: easePremium,
          repeat: Infinity,
          delay: index * 0.8 + 0.6,
        }}
        style={{
          position: 'absolute',
          top: '8px',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: index === 0 
            ? 'rgba(128, 168, 218, 0.55)'
            : 'rgba(180, 164, 140, 0.50)',
          boxShadow: index === 0
            ? '0 0 10px rgba(128, 168, 218, 0.35), 0 0 20px rgba(128, 168, 218, 0.15)'
            : '0 0 10px rgba(180, 164, 140, 0.30), 0 0 20px rgba(180, 164, 140, 0.12)',
          filter: 'blur(0.4px)',
        }}
      />
      
      {/* Secondary micro pulse */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.25, 0.30, 0.25, 0],
          y: [0, 5, 10, 15, 20],
        } : { opacity: 0, y: 0 }}
        transition={{
          duration: 5,
          ease: easePremium,
          repeat: Infinity,
          delay: index * 0.8 + 2.2,
        }}
        style={{
          position: 'absolute',
          top: '10px',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          background: index === 0 
            ? 'rgba(125, 156, 116, 0.40)'
            : 'rgba(128, 168, 218, 0.38)',
          filter: 'blur(0.2px)',
        }}
      />
    </div>
  );
}

// Premium intelligence card with refined dimensional depth
function IntelligenceCard({
  card,
  index,
  isInView,
  scrollYProgress,
}: {
  card: (typeof intelligenceCards)[0];
  index: number;
  isInView: boolean;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const revealDelay = 0.3 + index * 0.12;
  const breathDuration = 14 + index * 1.5;
  const breathDelay = index * 0.35;

  // Parallax effect - gentler
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -6 + index * 2]
  );

  const isFeatured = card.isFeatured;
  const cardScale = card.scale;

  // Calmer, more premium easing
  const easeLuxury: [number, number, number, number] = [0.25, 1, 0.35, 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: cardScale,
        filter: 'blur(0px)',
      } : {
        opacity: 0,
        y: 20,
        scale: 0.98,
        filter: 'blur(4px)',
      }}
      transition={{
        duration: 0.85,
        delay: revealDelay,
        ease: easeLuxury,
      }}
      style={{
        position: 'relative',
        y: parallaxY,
        width: '100%',
        maxWidth: isFeatured ? '540px' : '520px',
        zIndex: isFeatured ? 2 : 1,
      }}
    >
      {/* Card with refined floating and hover */}
      <motion.div
        animate={isInView ? {
          y: [0, -3, 0],
          scale: [1, isFeatured ? 1.004 : 1.002, 1],
        } : { y: 0, scale: 1 }}
        transition={{
          y: { duration: breathDuration, ease: easeLuxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay },
          scale: { duration: breathDuration * 1.3, ease: easeLuxury, repeat: Infinity, repeatType: 'mirror', delay: breathDelay + 0.25 },
        }}
        whileHover={{
          y: -4,
          scale: isFeatured ? 1.008 : 1.005,
          transition: { duration: 0.5, ease: easeLuxury }
        }}
        style={{
          position: 'relative',
          padding: isFeatured ? '34px 44px' : '30px 40px',
          borderRadius: '32px',
          background: `
            linear-gradient(172deg,
              rgba(255, 255, 255, 0.96) 0%,
              rgba(255, 255, 255, 0.88) 40%,
              rgba(252, 251, 250, 0.82) 100%
            )
          `,
          border: `0.5px solid rgba(255, 255, 255, 0.92)`,
          boxShadow: isFeatured
            ? `
              0 0.5px 0.5px rgba(0,0,0,0.006),
              0 2px 4px rgba(0,0,0,0.01),
              0 5px 10px rgba(0,0,0,0.012),
              0 10px 24px rgba(0,0,0,0.015),
              0 20px 48px ${card.glowColor},
              0 36px 80px rgba(0,0,0,0.03),
              inset 0 1px 1px rgba(255,255,255,0.9)
            `
            : `
              0 0.5px 0.5px rgba(0,0,0,0.005),
              0 2px 4px rgba(0,0,0,0.008),
              0 4px 8px rgba(0,0,0,0.01),
              0 8px 18px rgba(0,0,0,0.012),
              0 16px 36px ${card.glowColor},
              inset 0 1px 1px rgba(255,255,255,0.85)
            `,
          cursor: 'default',
          overflow: 'hidden',
        }}
      >
        {/* Hover state - soft color wash */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '32px',
            background: `
              radial-gradient(ellipse 140% 120% at 25% 12%, ${card.accentColor} 0%, transparent 48%),
              radial-gradient(ellipse 120% 100% at 75% 88%, ${card.deepColor} 0%, transparent 42%)
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Soft inner sheen */}
        <div
          style={{
            position: 'absolute',
            inset: '1px',
            borderRadius: '31px',
            background: 'linear-gradient(175deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Deep ambient glow layer */}
        <motion.div
          animate={isInView ? {
            opacity: isFeatured ? [0.18, 0.32, 0.18] : [0.12, 0.24, 0.12],
            scale: isFeatured ? [1, 1.02, 1] : [1, 1.012, 1],
          } : { opacity: isFeatured ? 0.18 : 0.12, scale: 1 }}
          transition={{
            duration: breathDuration,
            ease: easeLuxury,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: breathDelay,
          }}
          style={{
            position: 'absolute',
            inset: isFeatured ? '-12%' : '-10%',
            borderRadius: '40px',
            background: `radial-gradient(ellipse at 50% 100%, ${card.glowColor} 0%, transparent 60%)`,
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Subtle color tint - top lighting */}
        <motion.div
          animate={isInView ? {
            opacity: isFeatured ? [0.38, 0.52, 0.38] : [0.32, 0.45, 0.32],
          } : { opacity: isFeatured ? 0.38 : 0.32 }}
          transition={{
            duration: breathDuration * 0.9,
            ease: easeLuxury,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: breathDelay + 0.1,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '32px',
            background: `
              radial-gradient(ellipse 140% 120% at 28% 12%, ${card.accentColor} 0%, transparent 48%),
              radial-gradient(ellipse 120% 100% at 72% 88%, ${card.deepColor} 0%, transparent 45%)
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Elegant border glow on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.5, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '32px',
            padding: '0.5px',
            background: `linear-gradient(165deg, rgba(255,255,255,0.98) 0%, ${card.accentColor} 50%, rgba(255,255,255,0.7) 100%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }}
        />

        {/* Soft lift shadow on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.5, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '32px',
            boxShadow: `
              0 16px 40px rgba(0, 0, 0, 0.028),
              0 6px 16px rgba(0, 0, 0, 0.015)
            `,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Card number indicator - refined */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: card.accentColor,
              marginBottom: '10px',
              boxShadow: `0 0 10px ${card.glowColor}`,
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '10px',
                fontWeight: isFeatured ? 640 : 620,
                color: isFeatured ? 'rgba(23, 21, 19, 0.78)' : 'rgba(26, 24, 22, 0.72)',
              }}
            >
              {index + 1}
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              fontWeight: isFeatured ? 680 : 620,
              letterSpacing: '-0.01em',
              color: isFeatured ? '#151311' : '#1a1816',
              margin: '0 0 5px 0',
              lineHeight: 1.35,
            }}
          >
            {card.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(11px, 1.25vw, 12.5px)',
              fontWeight: 420,
              lineHeight: 1.6,
              color: isFeatured ? 'rgba(26, 24, 22, 0.58)' : 'rgba(26, 24, 22, 0.52)',
              margin: 0,
              letterSpacing: '-0.002em',
            }}
          >
            {card.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WhyCareerOSIsDifferent() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '80px 20px 100px',
        background: 'transparent',
      }}
    >
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
        }}
      >
        {/* Premium Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.55, delay: 0, ease: easePremium }}
          style={{ marginBottom: '24px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#7D9C74',
              opacity: 0.9,
            }}
          >
            Why CareerOS Is Different
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.7, delay: 0.06, ease: easePremium }}
          style={{ marginBottom: '20px', maxWidth: 'min(90vw, 640px)', padding: '0 12px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(24px, 6vw, 44px)',
              fontWeight: 720,
              lineHeight: '1.15',
              letterSpacing: '-0.024em',
              color: '#1a1816',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Most career guidance helps you choose.
            <br />
            <span style={{ color: '#7D9C74' }}>CareerOS helps you think.</span>
          </h2>
        </motion.div>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.6, delay: 0.14, ease: easePremium }}
          style={{ maxWidth: 'min(90vw, 540px)', marginBottom: '38px', padding: '0 16px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(14px, 4vw, 15px)',
              fontWeight: 400,
              lineHeight: '1.7',
              color: 'rgba(26, 24, 22, 0.60)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Most students are pushed toward careers through marks, pressure, trends, or generic advice.
            <br /><br />
            CareerOS helps students make decisions using psychology, long-term life fit, intelligence, 
            fulfillment, money, sustainability, and future relevance.
          </p>
        </motion.div>

        {/* Intelligence Cards Stack with Flow Connectors */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '560px',
          }}
        >
          {intelligenceCards.map((card, index) => (
            <div key={card.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <IntelligenceCard 
                card={card} 
                index={index} 
                isInView={isInView}
                scrollYProgress={scrollYProgress}
              />
              {index < intelligenceCards.length - 1 && (
                <IntelligenceFlowConnector index={index} isInView={isInView} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyCareerOSIsDifferent;
