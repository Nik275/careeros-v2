'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ease, duration, stagger } from '@/lib/motion';

interface AssessmentWelcomeProps {
  onStart: () => void;
}

export function AssessmentWelcome({ onStart }: AssessmentWelcomeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflowY: 'auto',
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(18px) saturate(150%)',
              WebkitBackdropFilter: 'blur(18px) saturate(150%)',
              borderRadius: '9999px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: '#8052ff' }}
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span
              style={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              CareerOS
            </span>
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          variants={itemVariants}
          style={{
            marginBottom: '32px',
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.15) 0%, rgba(100, 50, 200, 0.12) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(128, 82, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(128, 82, 255, 0.12)',
          }}
        >
          <Sparkles
            size={32}
            strokeWidth={1.5}
            style={{ color: '#8052ff' }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <h1
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(28px, 7vw, 48px)',
              fontWeight: 680,
              lineHeight: '1.12',
              letterSpacing: '-0.028em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            Let's understand
            <br />
            <span style={{ color: '#8052ff' }}>who you are</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.div variants={itemVariants} style={{ marginBottom: '48px', maxWidth: '480px' }}>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: 400,
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.58)',
              margin: 0,
            }}
          >
            A few thoughtful questions to help us understand your psychology, 
            motivations, and what actually fits your life.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '48px',
          }}
        >
          {[
            { number: '5', label: 'minutes', desc: 'Deeper but still focused' },
            { number: '15', label: 'questions', desc: 'Psychology, pressure, and fit' },
            { number: '1', label: 'result', desc: 'Your personalized direction' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: duration.slow,
                delay: 0.4 + index * stagger.tight,
                ease: ease.luxury,
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.85) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(128, 82, 255, 0.12)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(128, 82, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(128, 82, 255, 0.2)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#8052ff',
                  }}
                >
                  {item.number}
                </span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: '2px',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onClick={onStart}
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
              height: '64px',
              padding: '0 40px',
              borderRadius: '999px',
              fontSize: '17px',
              fontWeight: 640,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'white',
              background: isHovered
                ? 'linear-gradient(180deg, #9065ff 0%, #7c52eb 100%)'
                : 'linear-gradient(180deg, #8052ff 0%, #6c42db 100%)',
              gap: '10px',
              letterSpacing: '-0.012em',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isPressed
                ? '0 12px 30px rgba(128,82,255,0.25), 0 4px 12px rgba(0,0,0,0.2), inset 0 2px 4px rgba(0,0,0,0.1)'
                : isHovered
                ? '0 24px 60px rgba(128,82,255,0.42), 0 10px 24px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.25)'
                : '0 18px 45px rgba(128,82,255,0.32), 0 8px 18px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)',
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow */}
            <motion.div
              animate={{ opacity: isHovered ? 0.75 : 0.5 }}
              transition={{ duration: duration.fast }}
              style={{
                position: 'absolute',
                inset: '-30%',
                background: 'radial-gradient(circle, rgba(109,145,101,0.5) 0%, transparent 70%)',
                borderRadius: '9999px',
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />

            <span style={{ position: 'relative', zIndex: 2 }}>Begin Assessment</span>
            <motion.div
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: duration.fast, ease: ease.luxury }}
              style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}
            >
              <ArrowRight strokeWidth={2.5} size={20} />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Trust text */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '24px',
            marginBottom: '24px',
            letterSpacing: '-0.01em',
          }}
        >
          Your responses are private and only used to personalize your results
        </motion.p>
      </motion.div>
    </div>
  );
}
