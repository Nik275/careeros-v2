'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerGlobeBackground } from '@/components/landing/CareerGlobeBackground';
import { AssessmentWelcome } from '@/components/assessment/AssessmentWelcome';
import { PsychologyQuestions } from '@/components/assessment/PsychologyQuestions';
import { AnalysisScreen } from '@/components/assessment/AnalysisScreen';
import { ResultsDashboard } from '@/components/assessment/ResultsDashboard';
import {
  createEmptyAssessmentPsychologyData,
  type AssessmentPsychologyData,
} from '@/components/assessment/assessmentQuestions';
import { ease, duration } from '@/lib/motion';

export type AssessmentScreen = 'welcome' | 'psychology' | 'analysis' | 'results';

export interface AssessmentData {
  psychology: AssessmentPsychologyData;
}

function createInitialAssessmentData(): AssessmentData {
  return {
    psychology: createEmptyAssessmentPsychologyData(),
  };
}

export default function AssessmentPage() {
  const [currentScreen, setCurrentScreen] = useState<AssessmentScreen>('welcome');
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(() => createInitialAssessmentData());
  const [direction, setDirection] = useState(1);

  const navigateTo = useCallback((screen: AssessmentScreen, dir: number = 1) => {
    setDirection(dir);
    setCurrentScreen(screen);
  }, []);

  const updatePsychologyData = useCallback((updates: Partial<AssessmentData['psychology']>) => {
    setAssessmentData(prev => ({
      ...prev,
      psychology: { ...prev.psychology, ...updates },
    }));
  }, []);

  const handleStartAssessment = () => {
    navigateTo('psychology', 1);
  };

  const handlePsychologyComplete = () => {
    navigateTo('analysis', 1);
  };

  const handleAnalysisComplete = () => {
    navigateTo('results', 1);
  };

  const handleRestart = () => {
    setAssessmentData(createInitialAssessmentData());
    navigateTo('welcome', -1);
  };

  const screenVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <>
      {/* Fixed Background Layers */}
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
            backgroundColor: '#000000',
          }}
        />

        {/* Cosmic Background */}
        <CareerGlobeBackground variant="assessment" />
      </div>

      {/* Screen Container */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100dvh',
          minHeight: '100svh',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: duration.fast, ease: ease.luxury },
              }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AssessmentWelcome onStart={handleStartAssessment} />
            </motion.div>
          )}

          {currentScreen === 'psychology' && (
            <motion.div
              key="psychology"
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: duration.fast, ease: ease.luxury },
              }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <PsychologyQuestions
                data={assessmentData.psychology}
                onUpdate={updatePsychologyData}
                onComplete={handlePsychologyComplete}
                onBack={() => navigateTo('welcome', -1)}
              />
            </motion.div>
          )}

          {currentScreen === 'analysis' && (
            <motion.div
              key="analysis"
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: duration.fast, ease: ease.luxury },
              }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AnalysisScreen onComplete={handleAnalysisComplete} />
            </motion.div>
          )}

          {currentScreen === 'results' && (
            <motion.div
              key="results"
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: duration.fast, ease: ease.luxury },
              }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ResultsDashboard
                data={assessmentData}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
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
