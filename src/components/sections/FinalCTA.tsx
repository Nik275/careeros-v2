'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { ease, duration } from '@/lib/motion';

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-15%' });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '140px 20px 120px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Primary ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: duration.cinematic, delay: 0.2, ease: ease.luxury }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(125, 156, 116, 0.1) 0%, transparent 55%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Secondary glow layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: duration.slow, delay: 0.4, ease: ease.luxury }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '10%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '50%',
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '760px',
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
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: duration.slow, delay: 0, ease: ease.luxury }}
          style={{ marginBottom: '28px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 580,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(125, 156, 116, 0.9)',
            }}
          >
            Begin
          </span>
        </motion.div>

        {/* Headline - emotionally intelligent */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: duration.cinematic, delay: 0.1, ease: ease.luxury }}
          style={{
            fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
            fontSize: 'clamp(36px, 9vw, 56px)',
            fontWeight: 700,
            lineHeight: '1.08',
            letterSpacing: '-0.032em',
            color: '#0d0b09',
            margin: '0 0 28px 0',
            maxWidth: 'min(94vw, 640px)',
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          Stop guessing.
          <br />
          <span style={{ color: 'rgba(13, 11, 9, 0.75)' }}>
            Start understanding what actually fits you.
          </span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: duration.slow, delay: 0.25, ease: ease.luxury }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(18px, 5vw, 20px)',
            fontWeight: 400,
            lineHeight: '1.8',
            color: 'rgba(26, 24, 22, 0.52)',
            margin: '0 0 56px 0',
            maxWidth: 'min(92vw, 520px)',
            textAlign: 'center',
            padding: '0 24px',
          }}
        >
          Take a few minutes to understand what actually fits who you are — psychologically,
          financially, and long term.
        </motion.p>

        {/* CTA Button - premium luxurious feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: duration.slow, delay: 0.4, ease: ease.luxury }}
        >
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
              y: -4,
              scale: 1.02,
              transition: { duration: duration.fast, ease: ease.luxury },
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '68px',
              padding: '0 44px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 640,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'white',
              background: isHovered
                ? 'linear-gradient(180deg, #6d9665 0%, #4d7a48 100%)'
                : 'linear-gradient(180deg, #5d8660 0%, #3d6a40 100%)',
              gap: '12px',
              letterSpacing: '-0.012em',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isHovered
                ? '0 28px 70px rgba(93,134,96,0.45), 0 12px 28px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.35)'
                : '0 20px 55px rgba(93,134,96,0.35), 0 10px 22px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.3)',
              transition: `all ${duration.fast}s cubic-bezier(0.25, 1, 0.35, 1)`,
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow */}
            <motion.div
              animate={{ opacity: isHovered ? 0.85 : 0.55 }}
              transition={{ duration: duration.fast }}
              style={{
                position: 'absolute',
                inset: '-30%',
                background:
                  'radial-gradient(circle, rgba(93,134,96,0.5) 0%, transparent 70%)',
                borderRadius: '9999px',
                filter: 'blur(35px)',
                zIndex: 0,
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '200%' } : { x: '-100%' }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                transform: 'skewX(-20deg)',
                zIndex: 1,
              }}
            />

            <span style={{ position: 'relative', zIndex: 2 }}>Start Your Career Clarity</span>
            <motion.div
              animate={{ x: isHovered ? 6 : 0 }}
              transition={{ duration: duration.fast, ease: ease.luxury }}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowRight strokeWidth={2.5} style={{ width: '22px', height: '22px' }} />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Trust microcopy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: duration.slow, delay: 0.65, ease: ease.luxury }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '36px',
            flexWrap: 'wrap',
          }}
        >
          {['Free', 'Takes 3 minutes', 'No signup needed'].map((text, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: 'rgba(26, 24, 22, 0.32)',
                letterSpacing: '-0.01em',
              }}
            >
              {text}
              {i < 2 && (
                <span style={{ marginLeft: '20px', color: 'rgba(0,0,0,0.08)' }}>•</span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
