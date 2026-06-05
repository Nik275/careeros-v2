'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Premium easing curves
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOutSine: [number, number, number, number] = [0.37, 0, 0.63, 1];
const easeLuxury: [number, number, number, number] = [0.23, 1, 0.32, 1];
const easePhysical: [number, number, number, number] = [0.22, 0.05, 0.25, 1];
const easeCinematic: [number, number, number, number] = [0.33, 1, 0.68, 1];
const easeCalm: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Premium experience stages - emotionally intelligent copy with refined color psychology
const experienceStages = [
  {
    id: 'understand',
    number: '01',
    title: 'Understand You',
    description: 'We start with who you are — your strengths, values, and what actually matters to you.',
    descriptionSecondary: 'Not surface-level interests. The deeper patterns that shape how you thrive.',
    features: ['Psychology & personality', 'Hidden strengths', 'Lifestyle fit', 'What drives you'],
    emotion: 'understanding',
    // Soft sage green - growth, self-awareness, calm (slightly more present)
    accentColor: 'rgba(138, 168, 125, 0.38)',
    glowColor: 'rgba(138, 168, 125, 0.17)',
    deepTint: 'rgba(125, 155, 115, 0.11)',
    atmosphereColor: 'rgba(138, 168, 125, 0.06)',
    pillBg: 'rgba(138, 168, 125, 0.14)',
  },
  {
    id: 'intelligence',
    number: '02',
    title: 'Intelligence Engine',
    description: 'We look at what actually happens over time — fulfillment, financial sustainability, and the tradeoffs no one talks about.',
    descriptionSecondary: 'Future relevance, long-term fit, and the real picture beyond the obvious.',
    features: ['Long-term outcomes', 'Financial sustainability', 'Future relevance', 'Hidden tradeoffs'],
    emotion: 'intelligence',
    // Soft muted blue - clarity, thoughtfulness, precision (slightly more present)
    accentColor: 'rgba(148, 178, 212, 0.42)',
    glowColor: 'rgba(148, 178, 212, 0.19)',
    deepTint: 'rgba(135, 165, 198, 0.12)',
    atmosphereColor: 'rgba(148, 178, 212, 0.07)',
    pillBg: 'rgba(148, 178, 212, 0.16)',
    isFeatured: true,
  },
  {
    id: 'direction',
    number: '03',
    title: 'Personalized Direction',
    description: 'You get a clear path forward — not generic advice, but directions that fit your life.',
    descriptionSecondary: 'Your values, your pace, and the future you actually want to build.',
    features: ['Best-fit directions', 'Detailed roadmap', 'Alternative paths', 'Decision clarity'],
    emotion: 'direction',
    // Warm champagne gold - possibility, warmth, clarity (slightly more present)
    accentColor: 'rgba(195, 175, 148, 0.35)',
    glowColor: 'rgba(195, 175, 148, 0.15)',
    deepTint: 'rgba(182, 162, 138, 0.10)',
    atmosphereColor: 'rgba(195, 175, 148, 0.05)',
    pillBg: 'rgba(195, 175, 148, 0.13)',
  },
  {
    id: 'mentor',
    number: '04',
    title: 'Wise Mentor',
    description: 'Calm, thoughtful guidance for decisions that shape your life.',
    descriptionSecondary: 'Someone in your corner who thinks long-term and helps you move with confidence.',
    features: ['Life-aligned guidance', 'Long-term perspective', 'Moving with confidence', 'Ongoing support'],
    emotion: 'mentor',
    // Soft warm cream - wisdom, trust, safety (slightly more present)
    accentColor: 'rgba(205, 185, 158, 0.40)',
    glowColor: 'rgba(205, 185, 158, 0.18)',
    deepTint: 'rgba(192, 172, 148, 0.11)',
    atmosphereColor: 'rgba(205, 185, 158, 0.06)',
    pillBg: 'rgba(205, 185, 158, 0.14)',
  },
];

// Premium ambient background - intentional intelligence field
function JourneyBackground({ isInView }: { isInView: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Central journey path glow - concentrated intelligence energy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2.2, delay: 0.4, ease: easeLuxury }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '12%',
          bottom: '12%',
          width: '120px',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, 
            rgba(138, 168, 125, 0.025) 0%,
            rgba(148, 178, 212, 0.032) 33%,
            rgba(195, 175, 148, 0.025) 66%,
            rgba(205, 185, 158, 0.032) 100%
          )`,
          filter: 'blur(50px)',
        }}
      />

      {/* Inner core glow - tighter concentration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2, delay: 0.6, ease: easeLuxury }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '20%',
          bottom: '20%',
          width: '40px',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, 
            rgba(138, 168, 125, 0.04) 0%,
            rgba(148, 178, 212, 0.05) 50%,
            rgba(205, 185, 158, 0.04) 100%
          )`,
          filter: 'blur(25px)',
        }}
      />

      {/* Soft ambient orbs - positioned closer to journey path */}
      <motion.div
        animate={isInView ? {
          y: [0, -12, 0],
          opacity: [0.025, 0.04, 0.025],
        } : { opacity: 0 }}
        transition={{
          duration: 22,
          ease: easeCalm,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{
          position: 'absolute',
          left: '35%',
          top: '28%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 168, 125, 0.035) 0%, transparent 70%)',
          filter: 'blur(55px)',
        }}
      />

      <motion.div
        animate={isInView ? {
          y: [0, 10, 0],
          opacity: [0.02, 0.035, 0.02],
        } : { opacity: 0 }}
        transition={{
          duration: 26,
          ease: easeCalm,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 4,
        }}
        style={{
          position: 'absolute',
          right: '32%',
          top: '48%',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(148, 178, 212, 0.028) 0%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      <motion.div
        animate={isInView ? {
          y: [0, -8, 0],
          opacity: [0.02, 0.032, 0.02],
        } : { opacity: 0 }}
        transition={{
          duration: 20,
          ease: easeCalm,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 8,
        }}
        style={{
          position: 'absolute',
          left: '38%',
          bottom: '22%',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(205, 185, 158, 0.03) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
    </div>
  );
}

// Premium vertical journey connector - scroll-reactive intelligence path
function VerticalProgression({ index, isInView, cardRef }: { index: number; isInView: boolean; cardRef: React.RefObject<HTMLDivElement | null> }) {
  const currentStage = experienceStages[index];
  const nextStage = experienceStages[index + 1];

  // Scroll-based reactive glow
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const connectorGlow = useTransform(scrollYProgress, [0.3, 0.7], [0.08, 0.28]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
        width: '1px',
        height: '44px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible',
      }}
    >
      {/* Base connecting line - ultra subtle */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={isInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 1.4, delay: 0.4 + index * 0.1, ease: easeLuxury }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            ${currentStage.accentColor} 0%, 
            rgba(255,255,255,0.6) 50%,
            ${nextStage.accentColor} 100%
          )`,
          opacity: 0.1,
          transformOrigin: 'top',
        }}
      />

      {/* Scroll-reactive glow - illuminates near active card */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            ${currentStage.glowColor} 0%, 
            rgba(255,255,255,0.4) 50%,
            ${nextStage.glowColor} 100%
          )`,
          opacity: connectorGlow,
          transformOrigin: 'top',
          filter: 'blur(1px)',
        }}
      />

      {/* Ambient traveling pulse - signature premium moment */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? {
          opacity: [0, 0.32, 0.4, 0.32, 0],
          y: [0, 14, 28, 36, 44],
        } : { opacity: 0, y: 0 }}
        transition={{
          duration: 4.5,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: index * 0.8 + 1.2,
        }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: nextStage.accentColor,
          boxShadow: `0 0 8px ${nextStage.glowColor}, 0 0 16px ${nextStage.atmosphereColor}`,
          transform: 'translateX(-50%)',
          filter: 'blur(0.6px)',
        }}
      />

      {/* Secondary companion pulse - softer */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? {
          opacity: [0, 0.18, 0.22, 0.18, 0],
          y: [0, 12, 26, 34, 44],
        } : { opacity: 0, y: 0 }}
        transition={{
          duration: 5,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: index * 0.8 + 2.5,
        }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          background: currentStage.accentColor,
          transform: 'translateX(-50%)',
          filter: 'blur(0.3px)',
        }}
      />
    </div>
  );
}

// Stage atmosphere - refined subtle breathing glow
function StageAtmosphere({ stage, isInView }: { stage: typeof experienceStages[0]; isInView: boolean }) {
  const isMentor = stage.emotion === 'mentor';
  const isFeatured = stage.isFeatured;
  const isUnderstand = stage.emotion === 'understanding';
  const isDirection = stage.emotion === 'direction';
  const breathDuration = isMentor ? 20 : isFeatured ? 16 : 18;

  return (
    <>
      {/* Primary ambient glow - extremely subtle breathing */}
      <motion.div
        animate={isInView ? {
          opacity: isUnderstand ? [0.07, 0.13, 0.07] : isFeatured ? [0.08, 0.15, 0.08] : isDirection ? [0.06, 0.12, 0.06] : [0.09, 0.17, 0.09],
          scale: [1, 1.006, 1],
        } : { opacity: isUnderstand ? 0.07 : isFeatured ? 0.08 : isDirection ? 0.06 : 0.09, scale: 1 }}
        transition={{
          duration: breathDuration,
          ease: easeCalm,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
        style={{
          position: 'absolute',
          inset: isUnderstand ? '-15%' : isFeatured ? '-18%' : isDirection ? '-14%' : '-22%',
          borderRadius: '60px',
          background: `radial-gradient(ellipse at 50% 100%, ${stage.glowColor} 0%, transparent 60%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* Secondary soft atmosphere - top accent lighting */}
      <motion.div
        animate={isInView ? {
          opacity: isUnderstand ? [0.025, 0.05, 0.025] : isFeatured ? [0.03, 0.06, 0.03] : isDirection ? [0.02, 0.045, 0.02] : [0.035, 0.07, 0.035],
        } : { opacity: isUnderstand ? 0.025 : isFeatured ? 0.03 : isDirection ? 0.02 : 0.035 }}
        transition={{
          duration: breathDuration * 0.85,
          ease: easeInOutSine,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 0.5,
        }}
        style={{
          position: 'absolute',
          inset: '-8%',
          background: `radial-gradient(ellipse at 40% 20%, ${stage.atmosphereColor} 0%, transparent 70%)`,
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* Deep color tint - dimensional depth */}
      <motion.div
        animate={isInView ? {
          opacity: isUnderstand ? [0.035, 0.075, 0.035] : isFeatured ? [0.04, 0.085, 0.04] : isDirection ? [0.03, 0.065, 0.03] : [0.05, 0.10, 0.05],
        } : { opacity: isUnderstand ? 0.035 : isFeatured ? 0.04 : isDirection ? 0.03 : 0.05 }}
        transition={{
          duration: breathDuration * 0.8,
          ease: easeInOutSine,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 0.3,
        }}
        style={{
          position: 'absolute',
          inset: '-6%',
          background: `radial-gradient(ellipse at 60% 85%, ${stage.deepTint} 0%, transparent 55%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </>
  );
}

// Premium experience stage card - refined dimensional depth
function ExperienceStageCard({
  stage,
  index,
  isInView,
}: {
  stage: typeof experienceStages[0];
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const revealDelay = 0.3 + index * 0.18;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const isFeatured = stage.isFeatured;
  const isMentor = stage.emotion === 'mentor';
  const isUnderstand = stage.emotion === 'understanding';
  const isDirection = stage.emotion === 'direction';

  // Calmer, more premium easing
  const easeLuxury: [number, number, number, number] = [0.25, 1, 0.35, 1];
  const breathDuration = isMentor ? 16 : isFeatured ? 12 : 14;
  const breathDelay = index * 0.3;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14, scale: 0.992, filter: 'blur(4px)' }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      } : {
        opacity: 0,
        y: 14,
        scale: 0.992,
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
        maxWidth: '580px',
      }}
    >
      <StageAtmosphere stage={stage} isInView={isInView} />

      <motion.div
        animate={isInView ? {
          y: [0, -1.5, 0],
        } : { y: 0 }}
        transition={{
          duration: breathDuration,
          ease: easeInOutSine,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: breathDelay,
        }}
        whileHover={{
          y: -2.5,
          scale: 1.001,
          transition: { duration: 0.35, ease: easeLuxury }
        }}
        style={{
          position: 'relative',
          padding: '32px 36px',
          borderRadius: '26px',
          background: `linear-gradient(172deg,
            rgba(255, 255, 255, 0.97) 0%,
            rgba(255, 255, 255, 0.92) 40%,
            rgba(252, 251, 250, 0.88) 100%
          )`,
          border: `0.5px solid rgba(255, 255, 255, 0.96)`,
          boxShadow: `
            0 0.5px 0.5px rgba(0,0,0,0.003),
            0 1.5px 2.5px rgba(0,0,0,0.004),
            0 3px 5px rgba(0,0,0,0.005),
            0 6px 10px rgba(0,0,0,0.006),
            0 12px 20px ${stage.glowColor},
            0 20px 36px rgba(0,0,0,0.012),
            inset 0 1px 1px rgba(255,255,255,0.94)
          `,
          cursor: 'default',
          overflow: 'hidden',
        }}
      >
        {/* Soft gradient lighting - dimensional depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            background: `linear-gradient(168deg, rgba(255,255,255,0.95) 0%, ${stage.deepTint} 30%, transparent 65%)`,
            opacity: 0.04,
            pointerEvents: 'none',
          }}
        />

        {/* Hover soft bloom - subtle warmth */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            background: `radial-gradient(ellipse 160% 140% at 25% 20%, ${stage.accentColor} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Premium surface sheen */}
        <div
          style={{
            position: 'absolute',
            inset: '1px',
            borderRadius: '25px',
            background: 'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.25) 25%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        {/* Elegant border glow on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.35 }}
          transition={{ duration: 0.4, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            padding: '0.5px',
            background: `linear-gradient(165deg, rgba(255,255,255,0.98) 0%, ${stage.accentColor} 50%, rgba(255,255,255,0.85) 100%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }}
        />

        {/* Soft lift shadow on hover - atmospheric depth */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.14 }}
          transition={{ duration: 0.35, ease: easeLuxury }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.014),
              0 3px 8px rgba(0, 0, 0, 0.006)
            `,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header row - refined */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.6, delay: revealDelay + 0.1, ease: easeLuxury }}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: 620,
                letterSpacing: '0.14em',
                color: stage.accentColor,
              }}
            >
              {stage.number}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.8, delay: revealDelay + 0.2, ease: easeLuxury }}
              style={{
                width: '16px',
                height: '1px',
                background: stage.accentColor,
                transformOrigin: 'left',
              }}
            />
          </div>

          {/* Title - refined typography */}
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.9, delay: revealDelay + 0.15, ease: easeLuxury }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isMentor ? 'clamp(19px, 2.2vw, 24px)' : isFeatured ? 'clamp(18px, 2vw, 22px)' : 'clamp(17px, 1.9vw, 20px)',
              fontWeight: isFeatured ? 680 : isMentor ? 660 : 640,
              letterSpacing: '-0.014em',
              color: '#0a0806',
              margin: '0 0 10px 0',
              lineHeight: 1.2,
            }}
          >
            {stage.title}
          </motion.h3>

          {/* Description - premium typography rhythm */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.85, delay: revealDelay + 0.22, ease: easeLuxury }}
            style={{ margin: '0 0 16px 0', maxWidth: '440px' }}
          >
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(13px, 1.4vw, 14.5px)',
                fontWeight: 420,
                lineHeight: 1.55,
                color: 'rgba(26, 24, 22, 0.68)',
                margin: '0 0 8px 0',
                letterSpacing: '-0.002em',
              }}
            >
              {stage.description}
            </p>
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(12.5px, 1.3vw, 13.5px)',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(26, 24, 22, 0.52)',
                margin: 0,
                letterSpacing: '-0.001em',
              }}
            >
              {stage.descriptionSecondary}
            </p>
          </motion.div>

          {/* Premium pills - subtle color psychology */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: revealDelay + 0.35 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 8px',
            }}
          >
            {stage.features.map((feature, featureIndex) => (
              <motion.div
                key={featureIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  duration: 0.5,
                  delay: revealDelay + 0.4 + featureIndex * 0.05,
                  ease: easeLuxury
                }}
                whileHover={{
                  scale: 1.015,
                  transition: { duration: 0.18, ease: easeLuxury }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  background: stage.pillBg || 'rgba(255,255,255,0.5)',
                  borderRadius: '16px',
                  border: `0.5px solid rgba(255,255,255,0.9)`,
                  cursor: 'default',
                  transition: 'background 0.3s ease',
                }}
              >
                {/* Subtle colored dot */}
                <div
                  style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: stage.accentColor,
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 'clamp(10.5px, 1.2vw, 11.5px)',
                    fontWeight: 460,
                    color: 'rgba(26, 24, 22, 0.58)',
                    letterSpacing: '-0.001em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Vertical progression to next stage */}
        {index < experienceStages.length - 1 && (
          <VerticalProgression index={index} isInView={isInView} cardRef={cardRef} />
        )}
      </motion.div>
    </motion.div>
  );
}

export function InsideCareerOS() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 20px 120px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Premium ambient background */}
      <JourneyBackground isInView={isInView} />

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
        }}
      >
        {/* Section label - refined */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0, ease: easeLuxury }}
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
            Inside CareerOS
          </span>
        </motion.div>

        {/* Headline - refined entrance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 1, delay: 0.1, ease: easeLuxury }}
          style={{ marginBottom: '18px', maxWidth: 'min(90vw, 680px)', padding: '0 12px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(26px, 6vw, 48px)',
              fontWeight: 680,
              lineHeight: '1.12',
              letterSpacing: '-0.03em',
              color: '#0d0b09',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Built Around Who You Actually Are
          </h2>
        </motion.div>

        {/* Subheadline - refined */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easeLuxury }}
          style={{ maxWidth: 'min(85vw, 560px)', marginBottom: '64px', padding: '0 16px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4vw, 17px)',
              fontWeight: 400,
              lineHeight: '1.65',
              color: 'rgba(26, 24, 22, 0.58)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            CareerOS understands who you are, evaluates long-term outcomes, 
            and helps you make smarter life decisions.
          </p>
        </motion.div>

        {/* Experience stages - connected premium journey */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          {experienceStages.map((stage, index) => (
            <ExperienceStageCard
              key={stage.id}
              stage={stage}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Premium section exit - emotional bridge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.2, delay: 1.4, ease: easeLuxury }}
          style={{
            marginTop: '64px',
            textAlign: 'center',
            maxWidth: 'min(85vw, 420px)',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(138, 168, 125, 0.3), rgba(205, 185, 158, 0.3), transparent)',
              margin: '0 auto 24px',
            }}
          />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(13px, 4vw, 14px)',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'rgba(26, 24, 22, 0.48)',
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            Built for people who think deeply about their lives.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default InsideCareerOS;
