'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import { QuestionCard, Question } from './QuestionCard';
import { ease, duration } from '@/lib/motion';

interface PsychologyQuestionsProps {
  data: {
    motivations: string[];
    strengths: string[];
    personalityTraits: string[];
    values: string[];
    lifestylePreferences: string[];
  };
  onUpdate: (updates: Partial<PsychologyQuestionsProps['data']>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const questions: Question[] = [
  {
    id: 'motivations',
    category: 'Understanding You',
    question: 'What drives you most?',
    subtext: 'Select all that resonate with you',
    allowMultiple: true,
    options: [
      { id: 'creativity', label: 'Creating something new', description: 'Building, designing, or making things that didn\'t exist before' },
      { id: 'impact', label: 'Making a difference', description: 'Helping people, solving problems, or improving lives' },
      { id: 'mastery', label: 'Becoming excellent', description: 'Deep expertise, continuous learning, and skill development' },
      { id: 'independence', label: 'Freedom & autonomy', description: 'Controlling your time, decisions, and work environment' },
      { id: 'security', label: 'Stability & security', description: 'Predictable income, clear path, and reduced uncertainty' },
      { id: 'recognition', label: 'Recognition & status', description: 'Being acknowledged for your work and achievements' },
    ],
  },
  {
    id: 'strengths',
    category: 'Your Strengths',
    question: 'What comes naturally to you?',
    subtext: 'What do others often ask for your help with?',
    allowMultiple: true,
    options: [
      { id: 'analytical', label: 'Analyzing & problem-solving', description: 'Breaking down complex problems and finding logical solutions' },
      { id: 'creative', label: 'Creative thinking', description: 'Generating new ideas, seeing patterns, and thinking outside the box' },
      { id: 'social', label: 'Connecting with people', description: 'Understanding others, building relationships, and communicating' },
      { id: 'practical', label: 'Hands-on execution', description: 'Building, fixing, or creating tangible things' },
      { id: 'organizing', label: 'Organizing & planning', description: 'Structuring information, managing details, and coordinating' },
      { id: 'leading', label: 'Leading & motivating', description: 'Inspiring others, making decisions, and driving action' },
    ],
  },
  {
    id: 'personality',
    category: 'How You Work',
    question: 'How do you prefer to work?',
    subtext: 'Select the environment that suits you best',
    allowMultiple: false,
    options: [
      { id: 'structured', label: 'Structured & planned', description: 'Clear goals, defined processes, and predictable routines' },
      { id: 'flexible', label: 'Flexible & adaptive', description: 'Variety, spontaneity, and responding to changing situations' },
      { id: 'collaborative', label: 'Collaborative & team-based', description: 'Working closely with others, sharing ideas, and group dynamics' },
      { id: 'independent', label: 'Independent & focused', description: 'Deep solo work, minimal interruptions, and self-directed' },
    ],
  },
  {
    id: 'values',
    category: 'What Matters',
    question: 'What\'s most important to you?',
    subtext: 'Choose what you couldn\'t compromise on',
    allowMultiple: true,
    options: [
      { id: 'worklife', label: 'Work-life balance', description: 'Time for family, hobbies, and personal life' },
      { id: 'growth', label: 'Continuous growth', description: 'Always learning, evolving, and being challenged' },
      { id: 'purpose', label: 'Purpose & meaning', description: 'Work that aligns with your values and makes a difference' },
      { id: 'financial', label: 'Financial success', description: 'High earning potential and building wealth' },
      { id: 'creativity', label: 'Creative expression', description: 'Freedom to express yourself and be original' },
      { id: 'stability', label: 'Job security', description: 'Long-term stability and predictable career path' },
    ],
  },
  {
    id: 'lifestyle',
    category: 'Your Future',
    question: 'What does your ideal day look like?',
    subtext: 'Imagine your typical workday in 5 years',
    allowMultiple: false,
    options: [
      { id: 'office', label: 'Office & team environment', description: 'Working in a professional setting with colleagues' },
      { id: 'remote', label: 'Remote & flexible', description: 'Working from anywhere with control over your schedule' },
      { id: 'field', label: 'On-site & active', description: 'Being out in the world, meeting people, moving around' },
      { id: 'hybrid', label: 'Mix of everything', description: 'Some office time, some remote, some variety' },
    ],
  },
];

export function PsychologyQuestions({
  data,
  onUpdate,
  onComplete,
  onBack,
}: PsychologyQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  
  const getCurrentSelection = () => {
    switch (currentQuestion.id) {
      case 'motivations': return data.motivations;
      case 'strengths': return data.strengths;
      case 'personality': return data.personalityTraits;
      case 'values': return data.values;
      case 'lifestyle': return data.lifestylePreferences;
      default: return [];
    }
  };

  const handleSelection = useCallback((ids: string[]) => {
    switch (currentQuestion.id) {
      case 'motivations':
        onUpdate({ motivations: ids });
        break;
      case 'strengths':
        onUpdate({ strengths: ids });
        break;
      case 'personality':
        onUpdate({ personalityTraits: ids });
        break;
      case 'values':
        onUpdate({ values: ids });
        break;
      case 'lifestyle':
        onUpdate({ lifestylePreferences: ids });
        break;
    }
  }, [currentQuestion.id, onUpdate]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
        padding: '20px',
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
          marginBottom: '24px',
          paddingTop: '8px',
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
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 450,
            color: 'rgba(26, 24, 22, 0.7)',
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
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '0 0 100px 0',
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
            }}
          >
            <QuestionCard
              question={currentQuestion}
              selectedIds={currentSelection}
              onSelect={handleSelection}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
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
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(to top, rgba(248,245,238,0.98) 0%, rgba(248,245,238,0.9) 70%, transparent 100%)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
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
            color: 'white',
            background: hasSelection
              ? 'linear-gradient(180deg, #6d9165 0%, #4d7548 100%)'
              : 'linear-gradient(180deg, rgba(109,145,101,0.4) 0%, rgba(77,117,72,0.4) 100%)',
            border: 'none',
            cursor: hasSelection ? 'pointer' : 'not-allowed',
            boxShadow: hasSelection
              ? '0 12px 32px rgba(109,145,101,0.3), 0 4px 12px rgba(0,0,0,0.08)'
              : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'See Your Results' : 'Continue'}
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
