'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const easeLuxury: [number, number, number, number] = [0.25, 1, 0.35, 1];

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  return (
    <footer
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        padding: '80px 20px 48px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Elegant top divider with glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          height: '1px',
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: easeLuxury }}
          style={{
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 20%, rgba(125,156,116,0.15) 50%, rgba(0,0,0,0.04) 80%, transparent 100%)',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* Subtle glow at divider */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '40px',
          background:
            'radial-gradient(ellipse, rgba(125,156,116,0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Logo mark with enhanced presence */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.3, ease: easeLuxury }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(125, 156, 116, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(125, 156, 116, 0.15)',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: 'rgba(125, 156, 116, 0.6)' }}
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: 620,
              letterSpacing: '-0.02em',
              color: 'rgba(26, 24, 22, 0.5)',
            }}
          >
            CareerOS
          </span>
        </motion.div>

        {/* Tagline with better hierarchy */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.4, ease: easeLuxury }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'rgba(26, 24, 22, 0.35)',
            margin: '0 0 32px 0',
            maxWidth: '340px',
            letterSpacing: '-0.01em',
          }}
        >
          Career intelligence for ambitious students making high-stakes life decisions.
        </motion.p>

        {/* Secondary divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: easeLuxury }}
          style={{
            width: '24px',
            height: '1px',
            background: 'rgba(0,0,0,0.06)',
            marginBottom: '28px',
          }}
        />

        {/* Copyright with refined typography */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: easeLuxury }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: 'rgba(26, 24, 22, 0.22)',
            letterSpacing: '-0.01em',
          }}
        >
          © 2025 CareerOS. Built for thoughtful decisions.
        </motion.p>
      </div>
    </footer>
  );
}

export default Footer;
