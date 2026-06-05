'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { AmbientBlobs } from '@/components/background/AmbientBlobs';
import { ActiveParticles } from '@/components/background/ActiveParticles';
import { WhyCareerOS } from '@/components/sections/WhyCareerOS';
import { WhyCareerOSDifferent } from '@/components/sections/WhyCareerOSDifferent';
import { WhyCareerOSIsDifferent } from '@/components/sections/WhyCareerOSIsDifferent';
import { HowCareerOSWorks } from '@/components/sections/HowCareerOSWorks';
import { WhyCareerOSComparison } from '@/components/sections/WhyCareerOSComparison';
import { WhatCareerOSDoes } from '@/components/sections/WhatCareerOSDoes';
import { InsideCareerOS } from '@/components/sections/InsideCareerOS';
import { ProblemReframe } from '@/components/sections/ProblemReframe';
import { WhyStudentsTrust } from '@/components/sections/WhyStudentsTrust';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';
import { ease, duration, stagger } from '@/lib/motion';

export default function WelcomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Unified container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.relaxed,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration.slow,
        ease: ease.luxury,
      },
    },
  };

  return (
    <>
      {/* Fixed Background Layers - Behind all content */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Base Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.normal, ease: ease.luxury }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#F8F5EE',
          }}
        />

        {/* Blobs */}
        <AmbientBlobs />

        {/* Particles */}
        <ActiveParticles />

        {/* Light Flow - refined ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '85%',
            height: '80%',
            transform: 'translate(-50%, -50%)',
            animation: 'lightFlow 12s ease-in-out infinite alternate',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(252,250,245,0.04) 50%, transparent 80%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <main style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Hero Section */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(24px, 6vh, 48px) 0 clamp(60px, 10vh, 100px)',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              width: '100%',
              maxWidth: '800px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 20px',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Logo Chip */}
            <motion.div
              variants={itemVariants}
              style={{ marginBottom: 'clamp(22px, 4.5vh, 42px)' }}
            >
              <motion.div
                whileHover={{ scale: 1.02, transition: { duration: duration.instant, ease: ease.snappy } }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.52)',
                  backdropFilter: 'blur(18px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: '#7D9C74' }}
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
                <span
                  style={{
                    color: '#171312',
                    fontWeight: 600,
                    fontSize: 'clamp(11px, 3vw, 13px)',
                    letterSpacing: '-0.02em',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  CareerOS
                </span>
              </motion.div>
            </motion.div>

            {/* Hero Headline */}
            <motion.div
              variants={itemVariants}
              style={{ marginBottom: 'clamp(12px, 2.8vh, 24px)', width: '100%' }}
            >
              <h1
                style={{
                  fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
                  fontSize: 'clamp(32px, 10vw, 80px)',
                  fontWeight: 860,
                  lineHeight: '0.95',
                  letterSpacing: '-0.042em',
                  color: '#1a1816',
                  textAlign: 'center',
                  maxWidth: '100%',
                  margin: '0 auto',
                  padding: '0 8px',
                }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, delay: 0.22, ease: ease.luxury }}
                  style={{ display: 'block', marginBottom: '0.015em' }}
                >
                  Figure out
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, delay: 0.36, ease: ease.luxury }}
                  style={{ display: 'block', marginBottom: '0.015em' }}
                >
                  your future
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, delay: 0.5, ease: ease.luxury }}
                  style={{ display: 'block' }}
                >
                  <span style={{ color: '#789c70' }}>intelligently</span>.
                </motion.span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(15px, 4vw, 20px)',
                fontWeight: 450,
                lineHeight: '1.6',
                maxWidth: 'min(85vw, 500px)',
                width: '100%',
                color: 'rgba(30, 30, 30, 0.68)',
                marginBottom: 'clamp(22px, 4vh, 32px)',
                textAlign: 'center',
                letterSpacing: '-0.01em',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '0 16px',
              }}
            >
              Career intelligence for ambitious students making high-stakes life decisions.
            </motion.p>

            {/* Premium CTA Button - refined interactions */}
            <motion.div variants={itemVariants}>
              <motion.button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                whileHover={{
                  y: -3,
                  scale: 1.02,
                  transition: { duration: duration.fast, ease: ease.luxury },
                }}
                whileTap={{
                  scale: 0.97,
                  transition: { duration: duration.instant, ease: ease.snappy },
                }}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 'clamp(52px, 11vw, 62px)',
                  padding: '0 clamp(24px, 6.5vw, 36px)',
                  width: 'fit-content',
                  borderRadius: '999px',
                  fontSize: 'clamp(15px, 4vw, 21px)',
                  fontWeight: 650,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: 'white',
                  background: isHovered
                    ? 'linear-gradient(180deg, #759b6d 0%, #558050 100%)'
                    : 'linear-gradient(180deg, #6d9165 0%, #4d7548 100%)',
                  gap: 'clamp(4px, 1vw, 7px)',
                  letterSpacing: '-0.018em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  willChange: 'transform',
                  boxShadow: isPressed
                    ? '0 12px 30px rgba(109,145,101,0.25), 0 4px 12px rgba(0,0,0,0.08), inset 0 2px 4px rgba(0,0,0,0.1)'
                    : isHovered
                    ? '0 24px 60px rgba(109,145,101,0.38), 0 10px 24px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.25)'
                    : '0 18px 45px rgba(109,145,101,0.28), 0 8px 18px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.4s ease, box-shadow 0.4s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Ambient glow - refined */}
                <motion.div
                  animate={{
                    opacity: isHovered ? 0.7 : 0.45,
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ duration: duration.fast, ease: ease.luxury }}
                  style={{
                    position: 'absolute',
                    inset: '-30%',
                    background: 'radial-gradient(circle, rgba(109,145,101,0.5) 0%, transparent 70%)',
                    borderRadius: '9999px',
                    filter: 'blur(30px)',
                    zIndex: 0,
                  }}
                />

                {/* Shimmer - refined timing */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    transform: 'skewX(-20deg)',
                    animation: 'buttonShimmer 12s ease-in-out infinite',
                    zIndex: 1,
                  }}
                />

                <span style={{ position: 'relative', zIndex: 2, whiteSpace: 'nowrap' }}>Get Career Clarity</span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: duration.fast, ease: ease.luxury }}
                  style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}
                >
                  <ArrowRight strokeWidth={2.5} style={{ width: 'clamp(15px, 3.5vw, 19px)', height: 'clamp(15px, 3.5vw, 19px)', flexShrink: 0 }} />
                </motion.div>
              </motion.button>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(11px, 2.8vw, 13px)',
                fontWeight: 400,
                color: 'rgba(0, 0, 0, 0.38)',
                marginTop: 'clamp(10px, 2vh, 13px)',
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}
            >
              3 minutes • No signup required
            </motion.p>
          </motion.div>
        </section>

        {/* Why CareerOS Section */}
        <WhyCareerOS />

        {/* How CareerOS Works Section */}
        <WhyCareerOSDifferent />

        {/* Why CareerOS Is Different Section */}
        <WhyCareerOSIsDifferent />

        {/* Why CareerOS Comparison Section */}
        <WhyCareerOSComparison />

        {/* What CareerOS Actually Does Section */}
        <WhatCareerOSDoes />

        {/* Inside CareerOS Section */}
        <InsideCareerOS />

        {/* Problem Reframe Section - Trust Building */}
        <ProblemReframe />

        {/* How CareerOS Actually Works - 4 Step Process */}
        <HowCareerOSWorks />

        {/* Why Students Trust CareerOS - Trust Building */}
        <WhyStudentsTrust />

        {/* Final CTA Section */}
        <FinalCTA />

        {/* Footer */}
        <Footer />
      </main>

      <style jsx global>{`
        @keyframes lightFlow {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.08;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.06);
            opacity: 0.16;
          }
        }

        @keyframes buttonShimmer {
          0%, 85% { left: '-100%'; }
          92% { left: '150%'; }
          100% { left: '150%'; }
        }

        /* Smooth scrolling for the entire page */
        html {
          scroll-behavior: smooth;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
