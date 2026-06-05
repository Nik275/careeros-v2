'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Ultra-premium easing curves for Apple-level fluidity
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOutSine: [number, number, number, number] = [0.37, 0, 0.63, 1];
const easeLuxury: [number, number, number, number] = [0.23, 1, 0.32, 1];
const easePhysical: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const easeSoftLand: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// Traditional guidance items
const traditionalItems = [
  'Based on marks and grades',
  'Generic one-size-fits-all advice',
  'Short-term thinking only',
  'Chasing current trends',
  'External pressure driven',
  'Leaves students confused',
];

// CareerOS intelligence items
const careerOSItems = [
  'Deep psychological understanding',
  'Personalized to each student',
  'Long-term fulfillment focused',
  'Future relevance optimized',
  'Intelligent decision framework',
  'Clear personalized direction',
];

// Premium comparison item with refined microinteractions
function ComparisonItem({
  text,
  isCareerOS,
  index,
  isInView,
}: {
  text: string;
  isCareerOS: boolean;
  index: number;
  isInView: boolean;
}) {
  const itemDelay = 0.6 + index * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, x: isCareerOS ? 10 : -10, filter: 'blur(4px)' }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        filter: 'blur(0px)',
      } : { 
        opacity: 0, 
        x: isCareerOS ? 10 : -10, 
        filter: 'blur(4px)',
      }}
      transition={{ 
        duration: 0.95, 
        delay: itemDelay, 
        ease: easeLuxury,
      }}
      whileHover={{
        x: isCareerOS ? 1.5 : -1.5,
        transition: { duration: 0.55, ease: easePhysical }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '13px',
        marginBottom: index === 5 ? 0 : index === 2 ? '20px' : '19px',
        cursor: 'default',
        willChange: 'transform',
      }}
    >
      {/* Indicator dot with soft breathing */}
      <motion.div
        animate={isInView ? {
          scale: [1, 1.06, 1],
          opacity: isCareerOS ? [0.65, 0.9, 0.65] : [0.3, 0.48, 0.3],
        } : { scale: 1, opacity: isCareerOS ? 0.65 : 0.3 }}
        transition={{
          duration: isCareerOS ? 6 : 7.5,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: index * 0.35,
        }}
        whileHover={{
          scale: 1.12,
          opacity: isCareerOS ? 1 : 0.65,
          transition: { duration: 0.5, ease: easePhysical }
        }}
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          marginTop: '9px',
          flexShrink: 0,
          background: isCareerOS 
            ? 'rgba(125, 165, 215, 0.88)'
            : 'rgba(180, 164, 140, 0.42)',
          boxShadow: isCareerOS
            ? '0 0 6px rgba(125, 165, 215, 0.38)'
            : '0 0 4px rgba(180, 164, 140, 0.18)',
          willChange: 'transform, opacity',
        }}
      />
      
      {/* Text with clarity enhancement on hover */}
      <motion.span
        whileHover={{
          color: isCareerOS ? 'rgba(26, 24, 22, 0.92)' : 'rgba(26, 24, 22, 0.58)',
          transition: { duration: 0.55, ease: easePhysical }
        }}
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 'clamp(13.5px, 1.55vw, 15.5px)',
          fontWeight: isCareerOS ? 445 : 395,
          lineHeight: 1.58,
          color: isCareerOS ? 'rgba(26, 24, 22, 0.76)' : 'rgba(26, 24, 22, 0.48)',
          letterSpacing: '-0.004em',
          transition: 'color 0.55s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

// Premium intelligence comparison panel with physical hover
function ComparisonPanel({
  title,
  subtitle,
  items,
  isCareerOS,
  isInView,
  delay,
}: {
  title: string;
  subtitle: string;
  items: string[];
  isCareerOS: boolean;
  isInView: boolean;
  delay: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -6]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 40, scale: 0.97, filter: 'blur(6px)' }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)',
      } : { 
        opacity: 0, 
        y: 40, 
        scale: 0.97,
        filter: 'blur(6px)',
      }}
      transition={{ 
        duration: 1.2, 
        delay, 
        ease: easeLuxury,
      }}
      style={{
        position: 'relative',
        y: parallaxY,
        width: '100%',
        maxWidth: '500px',
        willChange: 'transform',
        flex: '1 1 380px',
      }}
    >
      <motion.div
        animate={isInView ? {
          y: [0, -2.5, 0],
          scale: [1, isCareerOS ? 1.0015 : 1.0008, 1],
        } : { y: 0, scale: 1 }}
        transition={{
          y: { 
            duration: isCareerOS ? 24 : 22, 
            ease: easeInOutSine, 
            repeat: Infinity, 
            repeatType: 'mirror', 
            delay: isCareerOS ? 0.7 : 0 
          },
          scale: { 
            duration: isCareerOS ? 26 : 24, 
            ease: easeInOutSine, 
            repeat: Infinity, 
            repeatType: 'mirror', 
            delay: isCareerOS ? 0.9 : 0.2 
          },
        }}
        whileHover={{ 
          y: -7, 
          scale: 1.005,
          transition: { 
            duration: 0.75, 
            ease: easeSoftLand,
          }
        }}
        style={{
          position: 'relative',
          padding: isCareerOS ? '52px 48px' : '48px 44px',
          borderRadius: '36px',
          background: isCareerOS
            ? `linear-gradient(165deg, 
                rgba(255, 255, 255, 0.995) 0%, 
                rgba(254, 252, 250, 0.985) 35%,
                rgba(252, 250, 248, 0.975) 100%
              )`
            : `linear-gradient(165deg, 
                rgba(249, 247, 245, 0.72) 0%, 
                rgba(247, 245, 243, 0.68) 50%,
                rgba(245, 243, 241, 0.64) 100%
              )`,
          border: isCareerOS 
            ? '1px solid rgba(255, 255, 255, 0.99)'
            : '1px solid rgba(255, 255, 255, 0.48)',
          boxShadow: isCareerOS
            ? `
              0 0.3px 0.6px rgba(0,0,0,0.004),
              0 0.8px 1.6px rgba(0,0,0,0.004),
              0 1.5px 3px rgba(0,0,0,0.005),
              0 3px 6px rgba(0,0,0,0.006),
              0 6px 12px rgba(0,0,0,0.008),
              0 12px 24px rgba(0,0,0,0.01),
              0 24px 48px rgba(0,0,0,0.012),
              0 40px 80px rgba(125, 165, 215, 0.14),
              0 60px 120px rgba(125, 165, 215, 0.1),
              inset 0 1px 0.5px rgba(255,255,255,0.995)
            `
            : `
              0 0.3px 0.6px rgba(0,0,0,0.002),
              0 0.8px 1.6px rgba(0,0,0,0.002),
              0 1.5px 3px rgba(0,0,0,0.003),
              0 3px 6px rgba(0,0,0,0.004),
              0 6px 12px rgba(0,0,0,0.005),
              0 12px 24px rgba(0,0,0,0.006),
              0 24px 48px rgba(180, 164, 140, 0.04),
              inset 0 1px 0.5px rgba(255,255,255,0.82)
            `,
          cursor: 'default',
          overflow: 'hidden',
          willChange: 'transform, box-shadow',
        }}
      >
        {/* Glass diffusion layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '36px',
            background: isCareerOS
              ? 'linear-gradient(170deg, rgba(255,255,255,0.8) 0%, rgba(125, 165, 215, 0.03) 55%, transparent 100%)'
              : 'linear-gradient(170deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Physical hover bloom - subtle depth increase */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: easePhysical }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '36px',
            background: isCareerOS
              ? 'radial-gradient(ellipse 220% 200% at 35% 25%, rgba(125, 165, 215, 0.18) 0%, transparent 35%)'
              : 'radial-gradient(ellipse 220% 200% at 35% 25%, rgba(180, 164, 140, 0.04) 0%, transparent 35%)',
            pointerEvents: 'none',
          }}
        />

        {/* Microscopic inner glow */}
        <div
          style={{
            position: 'absolute',
            inset: '2px',
            borderRadius: '34px',
            background: isCareerOS
              ? 'linear-gradient(170deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.08) 45%, transparent 75%)'
              : 'linear-gradient(170deg, rgba(255,255,255,0.22) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Intelligence aura - barely perceptible blue diffusion */}
        {isCareerOS && (
          <motion.div
            animate={isInView ? {
              opacity: [0.15, 0.28, 0.15],
              scale: [1, 1.02, 1],
            } : { opacity: 0.15, scale: 1 }}
            transition={{
              duration: 22,
              ease: easeInOutSine,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: 0.5,
            }}
            style={{
              position: 'absolute',
              inset: '-30%',
              borderRadius: '64px',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(125, 165, 215, 0.35) 0%, transparent 40%)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: -2,
              willChange: 'transform, opacity',
            }}
          />
        )}

        {/* Ambient glow layer - refined breathing */}
        <motion.div
          animate={isInView ? {
            opacity: isCareerOS ? [0.22, 0.65, 0.22] : [0.06, 0.18, 0.06],
            scale: [1, 1.025, 1],
          } : { opacity: isCareerOS ? 0.22 : 0.06, scale: 1 }}
          transition={{
            duration: isCareerOS ? 22 : 20,
            ease: easeInOutSine,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: isCareerOS ? 0.5 : 0,
          }}
          style={{
            position: 'absolute',
            inset: isCareerOS ? '-22%' : '-8%',
            borderRadius: '52px',
            background: isCareerOS
              ? 'radial-gradient(ellipse at 50% 100%, rgba(125, 165, 215, 0.42) 0%, transparent 42%)'
              : 'radial-gradient(ellipse at 50% 100%, rgba(180, 164, 140, 0.12) 0%, transparent 42%)',
            filter: 'blur(64px)',
            pointerEvents: 'none',
            zIndex: -1,
            willChange: 'transform, opacity',
          }}
        />

        {/* Color tint layer - subtle breathing */}
        <motion.div
          animate={isInView ? {
            opacity: isCareerOS ? [0.45, 0.88, 0.45] : [0.08, 0.25, 0.08],
          } : { opacity: isCareerOS ? 0.45 : 0.08 }}
          transition={{
            duration: isCareerOS ? 21 : 19,
            ease: easeInOutSine,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: isCareerOS ? 0.6 : 0.1,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '36px',
            background: isCareerOS
              ? 'radial-gradient(ellipse 220% 180% at 28% 12%, rgba(125, 165, 215, 0.32) 0%, transparent 35%)'
              : 'radial-gradient(ellipse 220% 180% at 28% 12%, rgba(180, 164, 140, 0.08) 0%, transparent 35%)',
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />

        {/* Refined edge highlight */}
        <div
          style={{
            position: 'absolute',
            inset: '1px',
            borderRadius: '35px',
            background: isCareerOS
              ? 'linear-gradient(170deg, rgba(255,255,255,0.995) 0%, transparent 25%)'
              : 'linear-gradient(170deg, rgba(255,255,255,0.58) 0%, transparent 20%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Label with refined reveal */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.85, delay: delay + 0.3, ease: easeLuxury }}
            style={{ marginBottom: '14px' }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: isCareerOS ? 660 : 520,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: isCareerOS ? 'rgba(125, 165, 215, 0.99)' : 'rgba(180, 164, 140, 0.52)',
              }}
            >
              {subtitle}
            </span>
          </motion.div>

          {/* Title with refined typography */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.95, delay: delay + 0.38, ease: easeLuxury }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(21px, 2.6vw, 27px)',
              fontWeight: isCareerOS ? 800 : 580,
              letterSpacing: '-0.022em',
              color: isCareerOS ? '#0a0806' : '#1a1816',
              margin: '0 0 38px 0',
              lineHeight: 1.18,
              opacity: isCareerOS ? 1 : 0.72,
            }}
          >
            {title}
          </motion.h3>

          {/* Items with staggered reveal */}
          <div>
            {items.map((item, index) => (
              <ComparisonItem
                key={index}
                text={item}
                isCareerOS={isCareerOS}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Subtle atmospheric transition
function AtmosphericTransition({ isInView }: { isInView: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '70%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible',
      }}
    >
      {/* Ultra-subtle light drift */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.1, 0.08, 0.1, 0],
          x: [-20, 5, 20],
        } : { opacity: 0 }}
        transition={{
          duration: 10,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: 2,
        }}
        style={{
          position: 'absolute',
          top: '40%',
          left: '10%',
          width: '40px',
          height: '1.5px',
          borderRadius: '1px',
          background: 'rgba(125, 165, 215, 0.35)',
          filter: 'blur(6px)',
        }}
      />

      {/* Soft particles drifting right */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { 
            opacity: [0, 0.18, 0.14, 0.18, 0],
            x: [-25 + i * 4, 5 + i * 6, 18 + i * 8],
            y: [i * 15 - 15, i * 15 - 22, i * 15 - 26],
          } : { opacity: 0 }}
          transition={{
            duration: 12 + i * 2.5,
            ease: easeInOutSine,
            repeat: Infinity,
            delay: 2.5 + i * 1.5,
          }}
          style={{
            position: 'absolute',
            top: `${30 + i * 20}%`,
            left: '20%',
            width: '1px',
            height: '1px',
            borderRadius: '50%',
            background: 'rgba(125, 165, 215, 0.45)',
            boxShadow: '0 0 4px rgba(125, 165, 215, 0.28)',
            filter: 'blur(0.2px)',
          }}
        />
      ))}

      {/* Ambient light wash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.06, 0.05, 0.06, 0],
        } : { opacity: 0 }}
        transition={{
          duration: 14,
          ease: easeInOutSine,
          repeat: Infinity,
          delay: 1.5,
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 75% 50%, rgba(125, 165, 215, 0.12) 0%, transparent 65%)',
          filter: 'blur(16px)',
        }}
      />
    </div>
  );
}

export function WhyCareerOSComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-12%' });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 20px 120px',
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
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.9, delay: 0, ease: easeLuxury }}
          style={{ marginBottom: '26px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: '#7D9C74',
              opacity: 0.9,
            }}
          >
            The Difference
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 1.05, delay: 0.14, ease: easeLuxury }}
          style={{ marginBottom: '22px', maxWidth: 'min(90vw, 680px)', padding: '0 12px' }}
        >
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(26px, 6.5vw, 50px)',
              fontWeight: 720,
              lineHeight: '1.15',
              letterSpacing: '-0.028em',
              color: '#1a1816',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Not your typical career advice.
          </h2>
        </motion.div>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.9, delay: 0.28, ease: easeLuxury }}
          style={{ maxWidth: 'min(90vw, 580px)', marginBottom: '68px', padding: '0 16px' }}
        >
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(15px, 4vw, 17px)',
              fontWeight: 400,
              lineHeight: '1.72',
              color: 'rgba(26, 24, 22, 0.6)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            CareerOS thinks deeper. We combine psychology, intelligence, and long-term optimization 
            to help students make genuinely better decisions.
          </p>
        </motion.div>

        {/* Comparison Panels - reduced gap for better relationship */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '28px',
            width: '100%',
            maxWidth: '1040px',
            flexWrap: 'wrap',
          }}
        >
          {/* Atmospheric transition */}
          <AtmosphericTransition isInView={isInView} />

          <ComparisonPanel
            title="Traditional Career Guidance"
            subtitle="The Old Way"
            items={traditionalItems}
            isCareerOS={false}
            isInView={isInView}
            delay={0.4}
          />
          
          <ComparisonPanel
            title="CareerOS Intelligence"
            subtitle="The CareerOS Way"
            items={careerOSItems}
            isCareerOS={true}
            isInView={isInView}
            delay={0.55}
          />
        </div>
      </div>
    </section>
  );
}

export default WhyCareerOSComparison;
