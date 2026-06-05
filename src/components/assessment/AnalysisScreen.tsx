'use client';

import { motion, useAnimation } from 'framer-motion';
import { Brain, Sparkles, Target, Lightbulb, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ease, duration, stagger } from '@/lib/motion';

interface AnalysisScreenProps {
  onComplete: () => void;
}

const analysisStages = [
  {
    id: 'processing',
    icon: Brain,
    label: 'Processing your responses',
    description: 'Understanding your unique profile',
    color: 'rgba(125, 156, 116, 0.8)',
  },
  {
    id: 'patterns',
    icon: Sparkles,
    label: 'Identifying patterns',
    description: 'Finding what makes you unique',
    color: 'rgba(130, 165, 200, 0.8)',
  },
  {
    id: 'matching',
    icon: Target,
    label: 'Matching career paths',
    description: 'Aligning with your psychology',
    color: 'rgba(195, 170, 125, 0.8)',
  },
  {
    id: 'insights',
    icon: Lightbulb,
    label: 'Generating insights',
    description: 'Creating personalized guidance',
    color: 'rgba(175, 155, 185, 0.8)',
  },
  {
    id: 'direction',
    icon: Compass,
    label: 'Building your direction',
    description: 'Finalizing your career clarity',
    color: 'rgba(125, 156, 116, 0.8)',
  },
];

export function AnalysisScreen({ onComplete }: AnalysisScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const runAnalysis = async () => {
      // Stage progression
      for (let i = 0; i < analysisStages.length; i++) {
        setCurrentStage(i);
        setProgress(((i + 1) / analysisStages.length) * 100);
        
        // Wait between stages
        await new Promise(resolve => setTimeout(resolve, 1400));
      }

      // Small pause before completing
      await new Promise(resolve => setTimeout(resolve, 600));
      onComplete();
    };

    runAnalysis();
  }, [onComplete, controls]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slow, ease: ease.luxury }}
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Central Animation */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            marginBottom: '48px',
          }}
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px dashed rgba(125, 156, 116, 0.25)',
            }}
          />

          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 15,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              inset: '20px',
              borderRadius: '50%',
              border: '1px dashed rgba(130, 165, 200, 0.2)',
            }}
          />

          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              inset: '40px',
              borderRadius: '50%',
              border: '1px dashed rgba(195, 170, 125, 0.15)',
            }}
          />

          {/* Center icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: duration.slow, ease: ease.luxury }}
            style={{
              position: 'absolute',
              inset: '55px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(125, 156, 116, 0.15) 0%, rgba(130, 165, 200, 0.12) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(125, 156, 116, 0.2)',
              boxShadow: '0 8px 32px rgba(125, 156, 116, 0.15)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                ease: ease.luxury,
                repeat: Infinity,
              }}
            >
              <Brain
                size={40}
                strokeWidth={1.5}
                style={{ color: 'rgba(125, 156, 116, 0.9)' }}
              />
            </motion.div>
          </motion.div>

          {/* Orbiting particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8 + i * 2,
                ease: 'linear',
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                position: 'absolute',
                inset: `${10 + i * 15}px`,
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: `${6 - i}px`,
                  height: `${6 - i}px`,
                  borderRadius: '50%',
                  background: i % 2 === 0 
                    ? 'rgba(125, 156, 116, 0.5)' 
                    : 'rgba(130, 165, 200, 0.4)',
                  boxShadow: `0 0 ${8 - i}px ${i % 2 === 0 
                    ? 'rgba(125, 156, 116, 0.4)' 
                    : 'rgba(130, 165, 200, 0.3)'}`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Current Stage */}
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: duration.normal, ease: ease.luxury }}
          style={{ marginBottom: '32px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '999px',
              border: '1px solid rgba(0,0,0,0.04)',
              marginBottom: '16px',
            }}
          >
            {(() => {
              const Icon = analysisStages[currentStage].icon;
              return (
                <Icon
                  size={18}
                  strokeWidth={2}
                  style={{ color: analysisStages[currentStage].color }}
                />
              );
            })()}
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 550,
                color: analysisStages[currentStage].color,
              }}
            >
              {analysisStages[currentStage].label}
            </span>
          </div>

          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              color: 'rgba(26, 24, 22, 0.55)',
              margin: 0,
            }}
          >
            {analysisStages[currentStage].description}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '280px',
            height: '4px',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '48px',
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: duration.normal, ease: ease.luxury }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, rgba(125,156,116,0.8) 0%, rgba(130,165,200,0.8) 50%, rgba(195,170,125,0.8) 100%)',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Stage Indicators */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          {analysisStages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isComplete = index < currentStage;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isActive || isComplete ? 1 : 0.3,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{
                  duration: duration.normal,
                  ease: ease.luxury,
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isComplete
                      ? 'rgba(125, 156, 116, 0.15)'
                      : isActive
                      ? 'rgba(125, 156, 116, 0.12)'
                      : 'rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isActive || isComplete
                      ? '1px solid rgba(125, 156, 116, 0.3)'
                      : '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isComplete ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12L10 17L20 7"
                        stroke="#7D9C74"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <Icon
                      size={16}
                      strokeWidth={2}
                      style={{
                        color: isActive
                          ? 'rgba(125, 156, 116, 0.9)'
                          : 'rgba(26, 24, 22, 0.3)',
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Encouraging Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.slow, delay: 0.5 }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(26, 24, 22, 0.35)',
            marginTop: '40px',
            fontStyle: 'italic',
          }}
        >
          This will only take a moment...
        </motion.p>
      </motion.div>
    </div>
  );
}
