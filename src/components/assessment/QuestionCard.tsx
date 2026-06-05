'use client';

import { motion } from 'framer-motion';
import { ease, duration, stagger } from '@/lib/motion';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  subtext?: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
}

interface QuestionCardProps {
  question: Question;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedIds,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  const handleOptionClick = (optionId: string) => {
    if (question.allowMultiple) {
      if (selectedIds.includes(optionId)) {
        onSelect(selectedIds.filter(id => id !== optionId));
      } else {
        onSelect([...selectedIds, optionId]);
      }
    } else {
      onSelect([optionId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: duration.slow, ease: ease.luxury }}
      style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '3px',
          background: 'rgba(0,0,0,0.06)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: duration.normal, ease: ease.luxury }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, rgba(125,156,116,0.8) 0%, rgba(130,165,200,0.8) 100%)',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Question Header */}
      <div style={{ textAlign: 'center' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.normal, delay: 0.1 }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 580,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(125, 156, 116, 0.85)',
          }}
        >
          {question.category}
        </motion.span>
      </div>

      {/* Question Text */}
      <div style={{ textAlign: 'center' }}>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, delay: 0.15, ease: ease.luxury }}
          style={{
            fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 640,
            lineHeight: '1.3',
            letterSpacing: '-0.02em',
            color: '#0d0b09',
            margin: '0 0 12px 0',
          }}
        >
          {question.question}
        </motion.h2>
        {question.subtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration.normal, delay: 0.25 }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 400,
              lineHeight: '1.6',
              color: 'rgba(26, 24, 22, 0.55)',
              margin: 0,
            }}
          >
            {question.subtext}
          </motion.p>
        )}
      </div>

      {/* Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}
      >
        {question.options.map((option, index) => {
          const isSelected = selectedIds.includes(option.id);
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: duration.normal,
                delay: 0.2 + index * stagger.tight,
                ease: ease.luxury,
              }}
              whileHover={{
                scale: 1.01,
                y: -2,
                transition: { duration: duration.instant, ease: ease.snappy },
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: duration.instant },
              }}
              onClick={() => handleOptionClick(option.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                padding: '20px 24px',
                borderRadius: '16px',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(125, 156, 116, 0.12) 0%, rgba(130, 165, 200, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 252, 251, 0.9) 100%)',
                border: isSelected
                  ? '1.5px solid rgba(125, 156, 116, 0.4)'
                  : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isSelected
                  ? '0 4px 20px rgba(125,156,116,0.15), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.9)'
                  : '0 2px 12px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                }}
              >
                {/* Selection Indicator */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: question.allowMultiple ? '6px' : '50%',
                    background: isSelected
                      ? 'rgba(125, 156, 116, 0.15)'
                      : 'rgba(0,0,0,0.03)',
                    border: isSelected
                      ? '2px solid rgba(125, 156, 116, 0.6)'
                      : '2px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: duration.instant, ease: ease.snappy }}
                    >
                      {question.allowMultiple ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L20 7" stroke="#7D9C74" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#7D9C74',
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: isSelected ? 550 : 450,
                    color: isSelected ? '#0d0b09' : 'rgba(26, 24, 22, 0.75)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {option.label}
                </span>
              </div>

              {/* Description */}
              {option.description && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: isSelected ? 1 : 0.6, 
                    height: 'auto',
                  }}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '1.5',
                    color: isSelected ? 'rgba(26, 24, 22, 0.6)' : 'rgba(26, 24, 22, 0.4)',
                    margin: '0 0 0 34px',
                    paddingTop: '4px',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {option.description}
                </motion.p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Question Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.normal, delay: 0.4 }}
        style={{
          textAlign: 'center',
          marginTop: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 450,
            color: 'rgba(26, 24, 22, 0.4)',
          }}
        >
          {questionNumber} of {totalQuestions}
        </span>
      </motion.div>
    </motion.div>
  );
}
