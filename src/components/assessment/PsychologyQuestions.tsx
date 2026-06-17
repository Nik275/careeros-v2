'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import { QuestionCard } from './QuestionCard';
import { ASSESSMENT_QUESTIONS, type AssessmentPsychologyData } from './assessmentQuestions';
import { ease, duration } from '@/lib/motion';

interface PsychologyQuestionsProps {
  data: AssessmentPsychologyData;
  onUpdate: (updates: Partial<PsychologyQuestionsProps['data']>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function PsychologyQuestions({
  data,
  onUpdate,
  onComplete,
  onBack,
}: PsychologyQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  
  const getCurrentSelection = () => {
    return data[currentQuestion.id];
  };

  const handleSelection = useCallback((ids: string[]) => {
    const update: Partial<AssessmentPsychologyData> = {};
    update[currentQuestion.id] = ids;
    onUpdate(update);
  }, [currentQuestion.id, onUpdate]);

  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const currentSelection = getCurrentSelection();
  const hasSelection = currentSelection.length > 0;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        padding: '20px 20px 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.normal, ease: ease.luxury }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingTop: '4px',
          flexShrink: 0,
        }}
      >
        <motion.button
          onClick={handlePrevious}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 450,
            color: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
              fontSize: '14px',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            CareerOS
          </span>
        </div>

        <div style={{ width: '80px' }} />
      </motion.div>

      {/* Question Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          minHeight: 0,
          padding: '0 0 calc(20px + env(safe-area-inset-bottom, 0px)) 0',
          scrollPaddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 400, damping: 35 },
              opacity: { duration: duration.fast, ease: ease.luxury },
            }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '0',
            }}
          >
            <QuestionCard
              question={currentQuestion}
              selectedIds={currentSelection}
              onSelect={handleSelection}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={ASSESSMENT_QUESTIONS.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.normal, delay: 0.3, ease: ease.luxury }}
        style={{
          position: 'relative',
          margin: '0 -20px',
          padding: '12px 20px calc(14px + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexShrink: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 450,
            color: 'rgba(255, 255, 255, 0.42)',
            lineHeight: 1,
          }}
        >
          {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
        </span>
        <motion.button
          onClick={handleNext}
          disabled={!hasSelection}
          whileHover={hasSelection ? { scale: 1.02, y: -2 } : {}}
          whileTap={hasSelection ? { scale: 0.98 } : {}}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            height: '56px',
            padding: '0 32px',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: hasSelection ? 'white' : 'rgba(255,255,255,0.4)',
            background: hasSelection
              ? 'linear-gradient(180deg, #8052ff 0%, #6c42db 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: hasSelection ? 'none' : '1px solid rgba(255,255,255,0.05)',
            cursor: hasSelection ? 'pointer' : 'not-allowed',
            boxShadow: hasSelection
              ? '0 12px 32px rgba(128,82,255,0.3), 0 4px 12px rgba(0,0,0,0.2)'
              : 'none',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto',
          }}
        >
          {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? 'See Your Results' : 'Continue'}
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
