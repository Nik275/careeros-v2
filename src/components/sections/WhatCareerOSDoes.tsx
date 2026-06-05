'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// World-class premium easing curves
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOutSine: [number, number, number, number] = [0.37, 0, 0.63, 1];
const easeLuxury: [number, number, number, number] = [0.23, 1, 0.32, 1];
const easePhysical: [number, number, number, number] = [0.22, 0.05, 0.25, 1];
const easeCinematic: [number, number, number, number] = [0.33, 1, 0.68, 1];
const easeCalm: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeGentle: [number, number, number, number] = [0.45, 0, 0.55, 1];

// Step data with refined emotional identities
const journeySteps = [
  {
    id: 'understand',
    number: '01',
    title: 'Understand You',
    description: 'Deep psychological profiling that reveals who you truly are.',
    details: ['Psychology & personality', 'Motivations & values', 'Strengths & hidden patterns', 'Fears & lifestyle fit'],
    emotion: 'discovery',
    accentColor: 'rgba(125, 156, 116, 0.38)',
    glowColor: 'rgba(125, 156, 116, 0.20)',
    atmosphereColor: 'rgba(125, 156, 116, 0.06)',
    floatDuration: 26,
    floatDelay: 0,
  },
  {
    id: 'intelligence',
    number: '02',
    title: 'Intelligence Engine',
    description: 'Sophisticated analysis of long-term outcomes and life fit.',
    details: ['Fulfillment potential', 'Financial sustainability', 'Future relevance', 'AI resilience & growth'],
    emotion: 'intelligence',
    accentColor: 'rgba(125, 165, 215, 0.72)',
    glowColor: 'rgba(125, 165, 215, 0.48)',
    atmosphereColor: 'rgba(125, 165, 215, 0.10)',
    isFeatured: true,
    floatDuration: 28,
    floatDelay: 0.8,
  },
  {
    id: 'direction',
    number: '03',
    title: 'Personalized Direction',
    description: 'Clear, actionable guidance tailored specifically to you.',
    details: ['Best-fit career paths', 'Personalized roadmap', 'Tradeoff clarity', 'Strategic backup plans'],
    emotion: 'clarity',
    accentColor: 'rgba(178, 162, 138, 0.45)',
    glowColor: 'rgba(178, 162, 138, 0.22)',
    atmosphereColor: 'rgba(178, 162, 138, 0.05)',
    floatDuration: 24,
    floatDelay: 1.6,
  },
  {
    id: 'mentor',
    number: '04',
    title: 'Wise Mentor',
    description: 'An intelligent guide for your most important life decisions.',
    details: ['Calm wisdom & clarity', 'Decision confidence', 'Long-term thinking', 'Life-aligned guidance'],
    emotion: 'wisdom',
    accentColor: 'rgba(180, 160, 135, 0.58)',
    glowColor: 'rgba(180, 160, 135, 0.38)',
    atmosphereColor: 'rgba(180, 160, 135, 0.14)',
    floatDuration: 32,
    floatDelay: 2.4,
  },
];

// Step-specific atmospheric effects
function StepAtmosphere({ step, isInView }: { step: typeof journeySteps[0]; isInView: boolean }) {
  if (step.emotion === 'discovery') {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={isInView ? {
              opacity: [0, 0.1, 0.08, 0.1, 0],
              x: [-20 + i * 10, 6 + i * 5, 28 + i * 3],
              y: [i * 15 - 20, i * 15 - 28, i * 15 - 24],
            } : { opacity: 0 }}
            transition={{
              duration: 12 + i * 3,
              ease: easeInOutSine,
              repeat: Infinity,
              delay: i * 2,
            }}
            style={{
              position: 'absolute',
              width: '1.5px',
              height: '1.5px',
              borderRadius: '50%',
              background: step.accentColor,
              boxShadow: `0 0 5px ${step.glowColor}`,
              filter: 'blur(0.3px)',
            }}
          />
        ))}
      </>
    );
  }
  
  if (step.emotion === 'intelligence') {
    return (
      <>
        <motion.div
          animate={isInView ? {
            opacity: [0.05, 0.12, 0.05],
            scale: [1, 1.012, 1],
          } : { opacity: 0.05 }}
          transition={{
            duration: 8,
            ease: easeInOutSine,
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            inset: '-10%',
            background: `radial-gradient(ellipse at 35% 25%, ${step.atmosphereColor} 0%, transparent 55%)`,
            filter: 'blur(50px)',
          }}
        />
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={isInView ? {
              opacity: [0, 0.15, 0.12, 0.15, 0],
              x: [0, 20, 48],
            } : { opacity: 0 }}
            transition={{
              duration: 14 + i * 4,
              ease: easeInOutSine,
              repeat: Infinity,
              delay: i * 3,
            }}
            style={{
              position: 'absolute',
              top: `${30 + i * 40}%`,
              left: '12%',
              width: '30px',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${step.accentColor}, transparent)`,
              filter: 'blur(1.5px)',
            }}
          />
        ))}
      </>
    );
  }
  
  if (step.emotion === 'clarity') {
    return (
      <>
        <motion.div
          animate={isInView ? {
            opacity: [0.04, 0.1, 0.04],
          } : { opacity: 0.04 }}
          transition={{
            duration: 9,
            ease: easeInOutSine,
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            inset: '-6%',
            background: `radial-gradient(ellipse at 65% 45%, ${step.atmosphereColor} 0%, transparent 50%)`,
            filter: 'blur(45px)',
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 0.08, 0.06, 0.08, 0],
            x: [-6, 15, 38],
          } : { opacity: 0 }}
          transition={{
            duration: 16,
            ease: easeInOutSine,
            repeat: Infinity,
            delay: 1.5,
          }}
          style={{
            position: 'absolute',
            top: '48%',
            left: '22%',
            width: '22px',
            height: '1.5px',
            background: `linear-gradient(90deg, transparent, ${step.accentColor})`,
            filter: 'blur(0.8px)',
          }}
        />
      </>
    );
  }
  
  // Wisdom - warm, reassuring, emotionally resonant atmosphere
  return (
    <>
      {/* Primary warm glow - gentle breathing calm */}
      <motion.div
        animate={isInView ? {
          opacity: [0.22, 0.42, 0.22],
          scale: [1, 1.008, 1],
        } : { opacity: 0.22 }}
        transition={{
          duration: 14,
          ease: easeGentle,
          repeat: Infinity,
        }}
        style={{
          position: 'absolute',
          inset: '-45%',
          background: `radial-gradient(ellipse at 50% 90%, ${step.glowColor} 0%, transparent 40%)`,
          filter: 'blur(100px)',
        }}
      />
      {/* Secondary soft warmth - upper area */}
      <motion.div
        animate={isInView ? {
          opacity: [0.12, 0.28, 0.12],
        } : { opacity: 0.12 }}
        transition={{
          duration: 12,
          ease: easeCalm,
          repeat: Infinity,
          delay: 1,
        }}
        style={{
          position: 'absolute',
          inset: '-25%',
          background: `radial-gradient(ellipse at 45% 30%, ${step.atmosphereColor} 0%, transparent 50%)`,
          filter: 'blur(70px)',
        }}
      />
      {/* Gentle floating warmth particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 0.12, 0.1, 0.12, 0],
            y: [i * 12, i * 12 - 6, i * 12 - 10],
            x: [i * 8 - 12, i * 8 - 4, i * 8],
          } : { opacity: 0 }}
          transition={{
            duration: 18 + i * 4,
            ease: easeGentle,
            repeat: Infinity,
            delay: i * 2.5,
          }}
          style={{
            position: 'absolute',
            top: `${55 + i * 10}%`,
            left: `${15 + i * 20}%`,
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: step.accentColor,
            boxShadow: `0 0 6px ${step.glowColor}`,
            filter: 'blur(0.2px)',
          }}
        />
      ))}
    </>
  );
}

// Subtle intelligence continuity between cards
function IntelligenceStream({ index, isInView }: { index: number; isInView: boolean }) {
  const currentStep = journeySteps[index];
  const nextStep = journeySteps[index + 1];
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '100px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible',
      }}
    >
      {/* Very subtle gradient line */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={isInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 1.6, delay: 1.2 + index * 0.3, ease: easeCinematic }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: '1.5px',
          height: '100%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, ${currentStep.accentColor} 0%, ${nextStep.accentColor} 70%, ${nextStep.accentColor} 100%)`,
          opacity: 0.15,
          borderRadius: '1px',
          transformOrigin: 'top',
        }}
      />
      
      {/* Primary flowing energy - very subtle */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={isInView ? { 
          opacity: [0, 0.55, 0.65, 0.55, 0],
          y: [-5, 35, 70, 105],
        } : { opacity: 0, y: -5 }}
        transition={{
          duration: 7,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: index * 1.2 + 1.6,
        }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: nextStep.accentColor,
          boxShadow: `0 0 10px ${nextStep.glowColor}, 0 0 20px ${nextStep.glowColor}`,
          transform: 'translateX(-50%)',
          filter: 'blur(0.2px)',
        }}
      />
      
      {/* Secondary micro flow */}
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={isInView ? { 
          opacity: [0, 0.3, 0.38, 0.3, 0],
          y: [-3, 30, 65, 102],
        } : { opacity: 0, y: -3 }}
        transition={{
          duration: 8,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: index * 1.2 + 3.5,
        }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '3px',
          width: '1.5px',
          height: '1.5px',
          borderRadius: '50%',
          background: currentStep.accentColor,
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

// Premium journey step card with refined physical presence
function JourneyStepCard({
  step,
  index,
  isInView,
}: {
  step: typeof journeySteps[0];
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const revealDelay = 0.5 + index * 0.32;
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const isFeatured = step.isFeatured;
  const isWisdom = step.emotion === 'wisdom';

  // Step-specific refined styling
  const getStepStyles = () => {
    switch (step.emotion) {
      case 'discovery':
        return {
          padding: '50px 46px',
          bgOpacity: 0.95,
          borderOpacity: 0.9,
          radius: '36px',
        };
      case 'intelligence':
        return {
          padding: '56px 52px',
          bgOpacity: 0.99,
          borderOpacity: 0.97,
          radius: '38px',
        };
      case 'clarity':
        return {
          padding: '52px 48px',
          bgOpacity: 0.98,
          borderOpacity: 0.94,
          radius: '36px',
        };
      case 'wisdom':
        return {
          padding: '60px 56px',
          bgOpacity: 0.995,
          borderOpacity: 0.99,
          radius: '42px',
        };
      default:
        return { padding: '50px 46px', bgOpacity: 0.96, borderOpacity: 0.92, radius: '36px' };
    }
  };

  const styles = getStepStyles();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.98, filter: 'blur(10px)' }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
      } : { 
        opacity: 0, 
        y: 50, 
        scale: 0.98,
        filter: 'blur(10px)',
      }}
      transition={{ 
        duration: 1.6, 
        delay: revealDelay, 
        ease: easeCinematic,
      }}
      style={{
        position: 'relative',
        y: parallaxY,
        width: '100%',
        maxWidth: isFeatured ? '600px' : isWisdom ? '620px' : '560px',
        willChange: 'transform',
      }}
    >
      {/* Step atmosphere effects */}
      <StepAtmosphere step={step} isInView={isInView} />

      <motion.div
        animate={isInView ? {
          y: [0, -2, 0],
          scale: [1, isFeatured ? 1.001 : isWisdom ? 1.0015 : 1.0008, 1],
        } : { y: 0, scale: 1 }}
        transition={{
          y: { 
            duration: step.floatDuration, 
            ease: isWisdom ? easeGentle : easeInOutSine, 
            repeat: Infinity, 
            repeatType: 'mirror', 
            delay: step.floatDelay 
          },
          scale: { 
            duration: step.floatDuration * 1.6, 
            ease: easeInOutSine, 
            repeat: Infinity, 
            repeatType: 'mirror', 
            delay: step.floatDelay + 0.8 
          },
        }}
        whileHover={{ 
          y: -8, 
          scale: 1.001,
          transition: { 
            duration: 1.1, 
            ease: easePhysical,
          }
        }}
        style={{
          position: 'relative',
          padding: styles.padding,
          borderRadius: styles.radius,
          background: `linear-gradient(165deg, 
            rgba(255, 255, 255, ${styles.bgOpacity}) 0%, 
            rgba(254, 252, 250, ${styles.bgOpacity - 0.01}) 45%,
            rgba(252, 250, 248, ${styles.bgOpacity - 0.02}) 100%
          )`,
          border: `1px solid rgba(255, 255, 255, ${styles.borderOpacity})`,
          boxShadow: isFeatured
            ? `
              0 0.15px 0.3px rgba(0,0,0,0.002),
              0 0.4px 0.8px rgba(0,0,0,0.002),
              0 0.8px 1.6px rgba(0,0,0,0.003),
              0 1.6px 3.2px rgba(0,0,0,0.004),
              0 3.2px 6.4px rgba(0,0,0,0.005),
              0 6.4px 12.8px rgba(0,0,0,0.006),
              0 12.8px 25.6px rgba(0,0,0,0.008),
              0 28px 56px ${step.glowColor},
              0 48px 96px rgba(125, 165, 215, 0.1),
              inset 0 1px 0.5px rgba(255,255,255,0.998)
            `
            : isWisdom
            ? `
              0 0.15px 0.3px rgba(0,0,0,0.001),
              0 0.4px 0.8px rgba(0,0,0,0.001),
              0 0.8px 1.6px rgba(0,0,0,0.002),
              0 1.6px 3.2px rgba(0,0,0,0.002),
              0 3.2px 6.4px rgba(0,0,0,0.003),
              0 6.4px 12.8px rgba(0,0,0,0.004),
              0 12.8px 25.6px rgba(0,0,0,0.005),
              0 28px 56px ${step.glowColor},
              0 56px 112px ${step.glowColor},
              inset 0 1px 0.5px rgba(255,255,255,0.999)
            `
            : `
              0 0.15px 0.3px rgba(0,0,0,0.001),
              0 0.4px 0.8px rgba(0,0,0,0.001),
              0 0.8px 1.6px rgba(0,0,0,0.002),
              0 1.6px 3.2px rgba(0,0,0,0.002),
              0 3.2px 6.4px rgba(0,0,0,0.003),
              0 6.4px 12.8px rgba(0,0,0,0.004),
              0 12.8px 25.6px ${step.glowColor},
              inset 0 1px 0.5px rgba(255,255,255,0.99)
            `,
          cursor: 'default',
          overflow: 'hidden',
          willChange: 'transform, box-shadow',
        }}
      >
        {/* Glass diffusion - step specific */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: styles.radius,
            background: isWisdom
              ? `linear-gradient(170deg, rgba(255,255,255,0.85) 0%, ${step.accentColor} 55%, transparent 100%)`
              : `linear-gradient(170deg, rgba(255,255,255,0.7) 0%, ${step.accentColor} 50%, transparent 100%)`,
            opacity: isWisdom ? 0.12 : 0.06,
            pointerEvents: 'none',
          }}
        />

        {/* Physical hover bloom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: easePhysical }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: styles.radius,
            background: isWisdom
              ? `radial-gradient(ellipse 260% 240% at 45% 40%, ${step.accentColor} 0%, transparent 25%)`
              : `radial-gradient(ellipse 240% 220% at 40% 35%, ${step.accentColor} 0%, transparent 30%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Inner glow */}
        <div
          style={{
            position: 'absolute',
            inset: '2px',
            borderRadius: isWisdom ? '40px' : '34px',
            background: isWisdom
              ? 'linear-gradient(170deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 55%, transparent 85%)'
              : 'linear-gradient(170deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.08) 50%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient glow layer */}
        <motion.div
          animate={isInView ? {
            opacity: isFeatured ? [0.28, 0.68, 0.28] : isWisdom ? [0.32, 0.58, 0.32] : [0.18, 0.42, 0.18],
            scale: [1, 1.015, 1],
          } : { opacity: isFeatured ? 0.28 : isWisdom ? 0.32 : 0.18, scale: 1 }}
          transition={{
            duration: step.floatDuration,
            ease: isWisdom ? easeGentle : easeInOutSine,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: step.floatDelay + 0.6,
          }}
          style={{
            position: 'absolute',
            inset: isFeatured ? '-32%' : isWisdom ? '-50%' : '-20%',
            borderRadius: '72px',
            background: `radial-gradient(ellipse at 50% 100%, ${step.glowColor} 0%, transparent 38%)`,
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: -1,
            willChange: 'transform, opacity',
          }}
        />

        {/* Color tint layer */}
        <motion.div
          animate={isInView ? {
            opacity: isFeatured ? [0.45, 0.88, 0.45] : isWisdom ? [0.52, 0.92, 0.52] : [0.32, 0.65, 0.32],
          } : { opacity: isFeatured ? 0.45 : isWisdom ? 0.52 : 0.32 }}
          transition={{
            duration: step.floatDuration * 0.75,
            ease: easeInOutSine,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: step.floatDelay + 0.5,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: styles.radius,
            background: isWisdom
              ? `radial-gradient(ellipse 260% 220% at 40% 35%, ${step.accentColor} 0%, transparent 22%)`
              : `radial-gradient(ellipse 240% 200% at 35% 25%, ${step.accentColor} 0%, transparent 28%)`,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />

        {/* Edge highlight */}
        <div
          style={{
            position: 'absolute',
            inset: '1px',
            borderRadius: isWisdom ? '41px' : '35px',
            background: isWisdom
              ? 'linear-gradient(170deg, rgba(255,255,255,0.998) 0%, transparent 15%)'
              : 'linear-gradient(170deg, rgba(255,255,255,0.98) 0%, transparent 22%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Step number */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.9, delay: revealDelay + 0.35, ease: easeCinematic }}
            style={{ marginBottom: '18px' }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: isFeatured ? 720 : isWisdom ? 660 : 640,
                letterSpacing: '0.22em',
                color: step.accentColor,
                opacity: isFeatured ? 1 : isWisdom ? 0.99 : 0.92,
              }}
            >
              {step.number}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 6 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 1, delay: revealDelay + 0.48, ease: easeCinematic }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isWisdom ? 'clamp(26px, 3vw, 34px)' : isFeatured ? 'clamp(24px, 2.8vw, 32px)' : 'clamp(22px, 2.6vw, 30px)',
              fontWeight: isFeatured ? 840 : isWisdom ? 800 : 760,
              letterSpacing: isWisdom ? '-0.014em' : '-0.018em',
              color: isWisdom ? '#080604' : isFeatured ? '#090705' : '#0f0d0b',
              margin: '0 0 20px 0',
              lineHeight: 1.08,
            }}
          >
            {step.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.95, delay: revealDelay + 0.6, ease: easeCinematic }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15.5px, 1.85vw, 19px)',
              fontWeight: isWisdom ? 440 : 420,
              lineHeight: 1.55,
              color: isWisdom ? 'rgba(26, 24, 22, 0.82)' : isFeatured ? 'rgba(26, 24, 22, 0.78)' : 'rgba(26, 24, 22, 0.72)',
              margin: '0 0 40px 0',
              letterSpacing: isWisdom ? '-0.004em' : '-0.006em',
            }}
          >
            {step.description}
          </motion.p>

          {/* Details */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isWisdom ? '16px' : isFeatured ? '14px' : '12px' 
          }}>
            {step.details.map((detail, detailIndex) => (
              <motion.div
                key={detailIndex}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={{ 
                  duration: 0.85, 
                  delay: revealDelay + 0.72 + detailIndex * 0.14, 
                  ease: easeCinematic 
                }}
                whileHover={{
                  x: 1,
                  transition: { duration: 0.6, ease: easePhysical }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '13px',
                  cursor: 'default',
                }}
              >
                <motion.div
                  animate={isInView ? {
                    scale: [1, 1.04, 1],
                    opacity: isWisdom ? [0.5, 0.85, 0.5] : [0.45, 0.75, 0.45],
                  } : { scale: 1, opacity: isWisdom ? 0.5 : 0.45 }}
                  transition={{
                    duration: isWisdom ? 8 : 7 + detailIndex,
                    ease: easeInOutSine,
                    repeat: Infinity,
                    delay: detailIndex * 0.6,
                  }}
                  whileHover={{
                    scale: 1.1,
                    opacity: isWisdom ? 1 : 0.95,
                    transition: { duration: 0.5, ease: easePhysical }
                  }}
                  style={{
                    width: isWisdom ? '6px' : '5px',
                    height: isWisdom ? '6px' : '5px',
                    borderRadius: '50%',
                    background: step.accentColor,
                    flexShrink: 0,
                    boxShadow: `0 0 ${isWisdom ? '14px' : '10px'} ${step.glowColor}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 'clamp(14.5px, 1.7vw, 16px)',
                    fontWeight: isWisdom ? 460 : isFeatured ? 450 : 440,
                    color: isWisdom ? 'rgba(26, 24, 22, 0.8)' : isFeatured ? 'rgba(26, 24, 22, 0.75)' : 'rgba(26, 24, 22, 0.68)',
                    letterSpacing: isWisdom ? '-0.003em' : '-0.005em',
                  }}
                >
                  {detail}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Intelligence stream connector */}
        {index < journeySteps.length - 1 && (
          <IntelligenceStream index={index} isInView={isInView} />
        )}
      </motion.div>
    </motion.div>
  );
}

export function WhatCareerOSDoes() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '130px 20px 150px',
        background: 'transparent',
      }}
    >
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
          initial={{ opacity: 0, y: 4 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 1, delay: 0, ease: easeCinematic }}
          style={{ marginBottom: '32px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#7D9C74',
              opacity: 0.9,
            }}
          >
            The Journey
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 1.2, delay: 0.18, ease: easeCinematic }}
          style={{ marginBottom: '28px', maxWidth: 'min(92vw, 780px)', padding: '0 12px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(30px, 8vw, 64px)',
              fontWeight: 720,
              lineHeight: '1.08',
              letterSpacing: '-0.035em',
              color: '#1a1816',
              margin: 0,
              textAlign: 'center',
            }}
          >
            What if someone actually understood you?
          </h2>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 1.1, delay: 0.36, ease: easeCinematic }}
          style={{ maxWidth: 'min(90vw, 700px)', marginBottom: '100px', padding: '0 16px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4.5vw, 21px)',
              fontWeight: 400,
              lineHeight: '1.65',
              color: 'rgba(26, 24, 22, 0.62)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            CareerOS doesn't recommend careers like everyone else. It deeply understands 
            who you are, analyzes long-term outcomes, and helps you make smarter life decisions.
          </p>
        </motion.div>

        {/* Journey Steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '96px',
            width: '100%',
            maxWidth: '640px',
          }}
        >
          {journeySteps.map((step, index) => (
            <JourneyStepCard
              key={step.id}
              step={step}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatCareerOSDoes;
