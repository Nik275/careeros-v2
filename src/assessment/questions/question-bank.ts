/**
 * CareerOS Assessment Question Intelligence System - Question Bank
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * Comprehensive question bank with 150+ high-quality behavioral
 * questions designed to reveal hidden psychological traits and
 * career-relevant patterns.
 *
 * @module question-bank
 * @version 1.0.0
 */

import type {
  LikertQuestion,
  MultipleChoiceQuestion,
  RankingQuestion,
  ForcedChoiceQuestion,
  ScaleQuestion,
} from '../assessment-types';
import { QUESTION_CATEGORIES } from './question-categories';

/**
 * Union type for all question types in the bank.
 */
export type BankQuestion =
  | LikertQuestion
  | MultipleChoiceQuestion
  | RankingQuestion
  | ForcedChoiceQuestion
  | ScaleQuestion;

/**
 * Complete question bank with 150+ professional questions.
 */
export const QUESTION_BANK: BankQuestion[] = [
  // =====================================================
  // COGNITIVE PATTERNS (20 questions)
  // =====================================================

  {
    id: 'cog-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'analyticalThinking',
    weight: 85,
    prompt: 'When faced with an unfamiliar problem, I naturally break it down into smaller components before attempting a solution.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'analyticalThinking',
    weight: 80,
    prompt: 'When learning something new, which approach feels more natural?',
    optionA: {
      id: 'cog-002-a',
      text: 'Understanding the underlying principles and theory first',
      dimension: 'abstractReasoning',
    },
    optionB: {
      id: 'cog-002-b',
      text: 'Jumping in and figuring it out through trial and error',
      dimension: 'creativeProblemSolving',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'cog-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'creativeProblemSolving',
    weight: 85,
    prompt: 'I often find unconventional solutions that others miss because I approach problems from unique angles.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-004',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'systematicProcessing',
    weight: 80,
    prompt: 'How do you typically organize complex projects or assignments?',
    allowMultiple: false,
    options: [
      { id: 'cog-004-a', text: 'Create detailed step-by-step plans with deadlines', score: 95 },
      { id: 'cog-004-b', text: 'Start with a general outline and adjust as I go', score: 70 },
      { id: 'cog-004-c', text: 'Work on whatever feels most urgent at the moment', score: 40 },
      { id: 'cog-004-d', text: 'Wait until inspiration strikes, then work intensely', score: 30 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'cog-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'patternRecognition',
    weight: 75,
    prompt: 'I naturally notice connections and patterns in data or situations that others overlook.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-006',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'abstractReasoning',
    weight: 80,
    prompt: 'In discussions, I tend to focus more on:',
    optionA: {
      id: 'cog-006-a',
      text: 'Abstract concepts, theories, and future possibilities',
      dimension: 'abstractReasoning',
    },
    optionB: {
      id: 'cog-006-b',
      text: 'Concrete details, practical applications, and present realities',
      dimension: 'systematicProcessing',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'cog-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'criticalEvaluation',
    weight: 80,
    prompt: 'I instinctively question assumptions and look for flaws in arguments, even when I agree with the conclusion.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-008',
    type: 'ranking',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'analyticalThinking',
    weight: 75,
    prompt: 'Rank these problem-solving approaches by how often you use them:',
    items: [
      { id: 'cog-008-a', text: 'Logical analysis and step-by-step reasoning' },
      { id: 'cog-008-b', text: 'Brainstorming multiple creative solutions' },
      { id: 'cog-008-c', text: 'Consulting others and gathering perspectives' },
      { id: 'cog-008-d', text: 'Trusting my intuition and gut feeling' },
    ],
  } as RankingQuestion,

  {
    id: 'cog-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'creativeProblemSolving',
    weight: 75,
    prompt: 'I enjoy work that requires me to invent new approaches rather than follow established procedures.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-010',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'patternRecognition',
    weight: 70,
    prompt: 'When reading articles or reports, what do you focus on most?',
    allowMultiple: false,
    options: [
      { id: 'cog-010-a', text: 'The underlying trends and patterns', score: 90 },
      { id: 'cog-010-b', text: 'The key facts and data points', score: 80 },
      { id: 'cog-010-c', text: 'The implications and future impact', score: 85 },
      { id: 'cog-010-d', text: 'The practical actions to take', score: 70 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'cog-011',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'systematicProcessing',
    weight: 80,
    prompt: 'I feel uncomfortable when tasks lack clear structure or defined processes.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-012',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'criticalEvaluation',
    weight: 75,
    prompt: 'When making an important decision, I prioritize:',
    optionA: {
      id: 'cog-012-a',
      text: 'Thorough analysis of all options and potential outcomes',
      dimension: 'criticalEvaluation',
    },
    optionB: {
      id: 'cog-012-b',
      text: 'What feels right based on experience and intuition',
      dimension: 'patternRecognition',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'cog-013',
    type: 'scale',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'abstractReasoning',
    weight: 70,
    prompt: 'On a scale of comfort with abstract concepts (0 = uncomfortable, 100 = very comfortable):',
    min: 0,
    max: 100,
    step: 5,
    unit: 'comfort level',
  } as ScaleQuestion,

  {
    id: 'cog-014',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'analyticalThinking',
    weight: 75,
    prompt: 'I prefer work that requires deep thinking and analysis over tasks that can be completed quickly.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-015',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'creativeProblemSolving',
    weight: 80,
    prompt: 'When stuck on a difficult problem, my most common response is:',
    allowMultiple: false,
    options: [
      { id: 'cog-015-a', text: 'Take a break and approach it from a completely different angle', score: 90 },
      { id: 'cog-015-b', text: 'Research how others have solved similar problems', score: 75 },
      { id: 'cog-015-c', text: 'Keep working systematically until I find the solution', score: 70 },
      { id: 'cog-015-d', text: 'Ask someone for help or a fresh perspective', score: 60 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'cog-016',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'patternRecognition',
    weight: 70,
    prompt: 'I often trust my instincts about people or situations before I have concrete evidence.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-017',
    type: 'ranking',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'systematicProcessing',
    weight: 75,
    prompt: 'Rank what gives you the most satisfaction when working:',
    items: [
      { id: 'cog-017-a', text: 'Finding an elegant, efficient solution' },
      { id: 'cog-017-b', text: 'Understanding something deeply and thoroughly' },
      { id: 'cog-017-c', text: 'Creating something entirely new' },
      { id: 'cog-017-d', text: 'Completing tasks accurately and on time' },
    ],
  } as RankingQuestion,

  {
    id: 'cog-018',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'criticalEvaluation',
    weight: 75,
    prompt: 'I often play devil\'s advocate in discussions to test the strength of ideas.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'cog-019',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'creativeProblemSolving',
    weight: 80,
    prompt: 'I am more energized by:',
    optionA: {
      id: 'cog-019-a',
      text: 'Improving existing processes and making them more efficient',
      dimension: 'systematicProcessing',
    },
    optionB: {
      id: 'cog-019-b',
      text: 'Creating entirely new approaches and solutions',
      dimension: 'creativeProblemSolving',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'cog-020',
    type: 'likert',
    category: QUESTION_CATEGORIES.COGNITIVE,
    dimension: 'abstractReasoning',
    weight: 70,
    prompt: 'I enjoy discussing theoretical concepts and "what if" scenarios even without immediate practical application.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  // =====================================================
  // MOTIVATIONAL DRIVERS (20 questions)
  // =====================================================

  {
    id: 'mot-001',
    type: 'ranking',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'achievementDrive',
    weight: 90,
    prompt: 'Rank what drives you most in your work:',
    items: [
      { id: 'mot-001-a', text: 'Achieving ambitious goals and recognition' },
      { id: 'mot-001-b', text: 'Mastering skills and becoming an expert' },
      { id: 'mot-001-c', text: 'Having freedom to work how and when I want' },
      { id: 'mot-001-d', text: 'Making a meaningful impact on others' },
    ],
  } as RankingQuestion,

  {
    id: 'mot-002',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'achievementDrive',
    weight: 85,
    prompt: 'Setting and achieving challenging goals is one of the most satisfying aspects of work for me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-003',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'masteryOrientation',
    weight: 85,
    prompt: 'Given the choice, I would rather:',
    optionA: {
      id: 'mot-003-a',
      text: 'Become one of the best in a specialized area',
      dimension: 'masteryOrientation',
    },
    optionB: {
      id: 'mot-003-b',
      text: 'Have broad knowledge across many areas',
      dimension: 'autonomyNeed',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'mot-004',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'autonomyNeed',
    weight: 85,
    prompt: 'I become demotivated when I have to follow strict procedures and cannot use my own judgment.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-005',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'purposeAlignment',
    weight: 80,
    prompt: 'What type of achievement feels most satisfying to you?',
    allowMultiple: false,
    options: [
      { id: 'mot-005-a', text: 'Knowing my work helped someone or made a difference', score: 90 },
      { id: 'mot-005-b', text: 'Receiving recognition and praise for my accomplishments', score: 70 },
      { id: 'mot-005-c', text: 'Successfully completing a difficult challenge', score: 85 },
      { id: 'mot-005-d', text: 'Learning something new and expanding my capabilities', score: 75 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'mot-006',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'recognitionDrive',
    weight: 75,
    prompt: 'External recognition and praise significantly boost my motivation and engagement.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-007',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'securityNeed',
    weight: 80,
    prompt: 'When considering career opportunities, I prioritize:',
    optionA: {
      id: 'mot-007-a',
      text: 'Stability, predictability, and job security',
      dimension: 'securityNeed',
    },
    optionB: {
      id: 'mot-007-b',
      text: 'Growth potential, excitement, and new challenges',
      dimension: 'achievementDrive',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'mot-008',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'masteryOrientation',
    weight: 80,
    prompt: 'I am driven by the desire to continuously improve and develop expertise in my field.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-009',
    type: 'ranking',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'purposeAlignment',
    weight: 85,
    prompt: 'Rank what would make you most proud of your work:',
    items: [
      { id: 'mot-009-a', text: 'Creating something that outlasts me' },
      { id: 'mot-009-b', text: 'Being recognized as the best at what I do' },
      { id: 'mot-009-c', text: 'Knowing I helped others succeed' },
      { id: 'mot-009-d', text: 'Building something from nothing' },
    ],
  } as RankingQuestion,

  {
    id: 'mot-010',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'autonomyNeed',
    weight: 80,
    prompt: 'I am most productive when I can set my own priorities and work independently.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-011',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'achievementDrive',
    weight: 80,
    prompt: 'What makes work feel most meaningful to you?',
    allowMultiple: false,
    options: [
      { id: 'mot-011-a', text: 'Accomplishing challenging objectives', score: 90 },
      { id: 'mot-011-b', text: 'Learning and growing continuously', score: 75 },
      { id: 'mot-011-c', text: 'Having control over my work and schedule', score: 70 },
      { id: 'mot-011-d', text: 'Contributing to something larger than myself', score: 85 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'mot-012',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'securityNeed',
    weight: 75,
    prompt: 'Knowing exactly what to expect from my work situation is very important to my peace of mind.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-013',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'recognitionDrive',
    weight: 75,
    prompt: 'I would rather receive:',
    optionA: {
      id: 'mot-013-a',
      text: 'Public acknowledgment for my achievements',
      dimension: 'recognitionDrive',
    },
    optionB: {
      id: 'mot-013-b',
      text: 'The satisfaction of knowing I did excellent work',
      dimension: 'masteryOrientation',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'mot-014',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'purposeAlignment',
    weight: 80,
    prompt: 'I need to feel that my work contributes to something meaningful beyond just earning a living.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-015',
    type: 'scale',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'achievementDrive',
    weight: 75,
    prompt: 'How important is career advancement and reaching higher positions to you?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'mot-016',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'masteryOrientation',
    weight: 75,
    prompt: 'I feel most fulfilled when I am learning and developing new skills, even if there is no immediate reward.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-017',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'autonomyNeed',
    weight: 80,
    prompt: 'In my ideal work situation, I prefer:',
    allowMultiple: false,
    options: [
      { id: 'mot-017-a', text: 'Complete independence in how I approach my work', score: 90 },
      { id: 'mot-017-b', text: 'Clear guidelines with freedom in execution', score: 70 },
      { id: 'mot-017-c', text: 'Collaborative decision-making with my team', score: 60 },
      { id: 'mot-017-d', text: 'Structured direction and regular check-ins', score: 40 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'mot-018',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'securityNeed',
    weight: 75,
    prompt: 'I would choose a lower-paying stable job over a higher-paying uncertain one.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'mot-019',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'purposeAlignment',
    weight: 80,
    prompt: 'Between these two options, I would rather:',
    optionA: {
      id: 'mot-019-a',
      text: 'Work on something that helps society, even if less prestigious',
      dimension: 'purposeAlignment',
    },
    optionB: {
      id: 'mot-019-b',
      text: 'Work on cutting-edge technology, even if impact is unclear',
      dimension: 'masteryOrientation',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'mot-020',
    type: 'likert',
    category: QUESTION_CATEGORIES.MOTIVATION,
    dimension: 'recognitionDrive',
    weight: 70,
    prompt: 'Being seen as successful and accomplished by others motivates me more than private satisfaction.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  // =====================================================
  // CORE VALUES (20 questions)
  // =====================================================

  {
    id: 'val-001',
    type: 'ranking',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'intrinsicValues',
    weight: 85,
    prompt: 'Rank these values by their importance to your life:',
    items: [
      { id: 'val-001-a', text: 'Personal growth and self-improvement' },
      { id: 'val-001-b', text: 'Financial security and wealth' },
      { id: 'val-001-c', text: 'Making a positive impact on the world' },
      { id: 'val-001-d', text: 'Freedom and independence' },
    ],
  } as RankingQuestion,

  {
    id: 'val-002',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'extrinsicValues',
    weight: 80,
    prompt: 'Having material possessions and a comfortable lifestyle is very important to me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-003',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'socialValues',
    weight: 80,
    prompt: 'If forced to choose, I would prioritize:',
    optionA: {
      id: 'val-003-a',
      text: 'Spending time with family and close relationships',
      dimension: 'socialValues',
    },
    optionB: {
      id: 'val-003-b',
      text: 'Advancing my career and professional success',
      dimension: 'extrinsicValues',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'val-004',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'growthValues',
    weight: 80,
    prompt: 'Continuous learning and intellectual growth are essential to my sense of self.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-005',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'stabilityValues',
    weight: 75,
    prompt: 'What matters most in your ideal life?',
    allowMultiple: false,
    options: [
      { id: 'val-005-a', text: 'Predictability and knowing what comes next', score: 90 },
      { id: 'val-005-b', text: 'Excitement and new experiences', score: 60 },
      { id: 'val-005-c', text: 'Achievement and recognition', score: 70 },
      { id: 'val-005-d', text: 'Connection and belonging', score: 80 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'val-006',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'impactValues',
    weight: 80,
    prompt: 'I want my career to contribute positively to society, not just earn money.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-007',
    type: 'scale',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'intrinsicValues',
    weight: 75,
    prompt: 'How important is having work that feels personally meaningful, regardless of pay?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'val-008',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'extrinsicValues',
    weight: 80,
    prompt: 'I would rather have a job that:',
    optionA: {
      id: 'val-008-a',
      text: 'Pays very well but is not personally fulfilling',
      dimension: 'extrinsicValues',
    },
    optionB: {
      id: 'val-008-b',
      text: 'Pays modestly but gives me deep satisfaction',
      dimension: 'intrinsicValues',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'val-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'socialValues',
    weight: 75,
    prompt: 'Building and maintaining strong relationships is more important than individual achievement.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-010',
    type: 'ranking',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'growthValues',
    weight: 80,
    prompt: 'Rank these priorities for your future:',
    items: [
      { id: 'val-010-a', text: 'Achieving financial independence' },
      { id: 'val-010-b', text: 'Developing expertise in my field' },
      { id: 'val-010-c', text: 'Creating a positive legacy' },
      { id: 'val-010-d', text: 'Having diverse life experiences' },
    ],
  } as RankingQuestion,

  {
    id: 'val-011',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'stabilityValues',
    weight: 75,
    prompt: 'I value consistency and routine in my daily life.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-012',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'impactValues',
    weight: 80,
    prompt: 'When thinking about career success, I define it as:',
    allowMultiple: false,
    options: [
      { id: 'val-012-a', text: 'Making a meaningful difference in people\'s lives', score: 90 },
      { id: 'val-012-b', text: 'Achieving a high position and influence', score: 70 },
      { id: 'val-012-c', text: 'Becoming financially independent', score: 75 },
      { id: 'val-012-d', text: 'Mastering a craft or skill', score: 80 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'val-013',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'intrinsicValues',
    weight: 75,
    prompt: 'I would be willing to take a pay cut for work that aligns with my personal values.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-014',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'growthValues',
    weight: 75,
    prompt: 'In the long run, I prioritize:',
    optionA: {
      id: 'val-014-a',
      text: 'Continuous learning and evolving as a person',
      dimension: 'growthValues',
    },
    optionB: {
      id: 'val-014-b',
      text: 'Reaching a stable, comfortable plateau',
      dimension: 'stabilityValues',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'val-015',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'socialValues',
    weight: 75,
    prompt: 'Being part of a community and feeling connected to others is essential to my well-being.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-016',
    type: 'scale',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'extrinsicValues',
    weight: 75,
    prompt: 'How important is achieving a high social status or prestige?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'val-017',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'impactValues',
    weight: 75,
    prompt: 'I want to leave the world better than I found it through my work.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-018',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'stabilityValues',
    weight: 75,
    prompt: 'My ideal work environment is one where:',
    allowMultiple: false,
    options: [
      { id: 'val-018-a', text: 'Things are predictable and well-established', score: 90 },
      { id: 'val-018-b', text: 'There is constant change and innovation', score: 60 },
      { id: 'val-018-c', text: 'I have clear authority and decision-making power', score: 70 },
      { id: 'val-018-d', text: 'Collaboration and harmony are prioritized', score: 80 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'val-019',
    type: 'likert',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'growthValues',
    weight: 75,
    prompt: 'I believe people should continuously challenge themselves rather than settle into comfort.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'val-020',
    type: 'ranking',
    category: QUESTION_CATEGORIES.VALUES,
    dimension: 'socialValues',
    weight: 80,
    prompt: 'Rank what you would sacrifice last if you had to:',
    items: [
      { id: 'val-020-a', text: 'Time with family and friends' },
      { id: 'val-020-b', text: 'Personal ambitions and goals' },
      { id: 'val-020-c', text: 'Financial comfort and security' },
      { id: 'val-020-d', text: 'Freedom to make my own choices' },
    ],
  } as RankingQuestion,

  // =====================================================
  // LIFESTYLE PREFERENCES (20 questions)
  // =====================================================

  {
    id: 'lif-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'workLifeIntegration',
    weight: 85,
    prompt: 'It is important to me to keep work and personal life strictly separate.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'flexibilityNeed',
    weight: 85,
    prompt: 'I would prefer:',
    optionA: {
      id: 'lif-002-a',
      text: 'A 9-5 job with fixed schedule but guaranteed free time',
      dimension: 'stabilityPreference',
    },
    optionB: {
      id: 'lif-002-b',
      text: 'Flexible hours that change based on workload but more autonomy',
      dimension: 'flexibilityNeed',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'lif-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'locationPreference',
    weight: 80,
    prompt: 'I am willing to relocate anywhere for the right career opportunity.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-004',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'pacePreference',
    weight: 80,
    prompt: 'What pace of work feels most natural to you?',
    allowMultiple: false,
    options: [
      { id: 'lif-004-a', text: 'Fast-paced with constant new challenges', score: 80 },
      { id: 'lif-004-b', text: 'Steady and predictable most of the time', score: 90 },
      { id: 'lif-004-c', text: 'Variable - intense periods followed by slower periods', score: 70 },
      { id: 'lif-004-d', text: 'Self-directed based on my energy levels', score: 85 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'lif-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'stabilityPreference',
    weight: 80,
    prompt: 'I prefer having a consistent daily routine over variety and spontaneity.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-006',
    type: 'ranking',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'workLifeIntegration',
    weight: 85,
    prompt: 'Rank these work arrangements by preference:',
    items: [
      { id: 'lif-006-a', text: 'Fully remote with flexible hours' },
      { id: 'lif-006-b', text: 'Hybrid - some days in office, some at home' },
      { id: 'lif-006-c', text: 'Traditional office with fixed hours' },
      { id: 'lif-006-d', text: 'On-site with varying shifts and schedules' },
    ],
  } as RankingQuestion,

  {
    id: 'lif-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'flexibilityNeed',
    weight: 80,
    prompt: 'I need the ability to adjust my work schedule for personal appointments and family needs.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-008',
    type: 'scale',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'locationPreference',
    weight: 75,
    prompt: 'How important is it to work near family or in a specific geographic location?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'lif-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'pacePreference',
    weight: 75,
    prompt: 'I thrive in high-pressure environments with tight deadlines.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-010',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'workLifeIntegration',
    weight: 80,
    prompt: 'Between these options, I would rather:',
    optionA: {
      id: 'lif-010-a',
      text: 'Work fewer hours for less pay and have more personal time',
      dimension: 'workLifeIntegration',
    },
    optionB: {
      id: 'lif-010-b',
      text: 'Work longer hours for more money and career advancement',
      dimension: 'pacePreference',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'lif-011',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'stabilityPreference',
    weight: 75,
    prompt: 'Knowing my work schedule weeks in advance reduces my stress significantly.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-012',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'flexibilityNeed',
    weight: 80,
    prompt: 'What matters most for your daily work experience?',
    allowMultiple: false,
    options: [
      { id: 'lif-012-a', text: 'Control over when and where I work', score: 90 },
      { id: 'lif-012-b', text: 'Clear boundaries between work and personal life', score: 80 },
      { id: 'lif-012-c', text: 'Social interaction and team camaraderie', score: 70 },
      { id: 'lif-012-d', text: 'Predictable routine and structure', score: 85 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'lif-013',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'locationPreference',
    weight: 75,
    prompt: 'I enjoy traveling frequently for work and experiencing new places.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-014',
    type: 'ranking',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'pacePreference',
    weight: 80,
    prompt: 'Rank these workday characteristics by importance:',
    items: [
      { id: 'lif-014-a', text: 'Variety and changing tasks throughout the day' },
      { id: 'lif-014-b', text: 'Deep focus time without interruptions' },
      { id: 'lif-014-c', text: 'Collaboration and interaction with others' },
      { id: 'lif-014-d', text: 'Predictable, repeatable tasks' },
    ],
  } as RankingQuestion,

  {
    id: 'lif-015',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'workLifeIntegration',
    weight: 80,
    prompt: 'I am comfortable checking work emails or messages outside of business hours.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-016',
    type: 'scale',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'stabilityPreference',
    weight: 75,
    prompt: 'How important is having a predictable, stable work environment?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'lif-017',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'flexibilityNeed',
    weight: 75,
    prompt: 'I need the freedom to take breaks and manage my own time throughout the day.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-018',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'locationPreference',
    weight: 75,
    prompt: 'I would prefer to work:',
    optionA: {
      id: 'lif-018-a',
      text: 'In a major city with many opportunities but higher cost of living',
      dimension: 'pacePreference',
    },
    optionB: {
      id: 'lif-018-b',
      text: 'In a smaller town with lower costs but fewer opportunities',
      dimension: 'stabilityPreference',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'lif-019',
    type: 'likert',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'workLifeIntegration',
    weight: 75,
    prompt: 'I would rather have intense, focused work periods with extended time off than consistent moderate workloads.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lif-020',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.LIFESTYLE,
    dimension: 'pacePreference',
    weight: 75,
    prompt: 'My ideal work week would be:',
    allowMultiple: false,
    options: [
      { id: 'lif-020-a', text: '4 long days with a 3-day weekend', score: 85 },
      { id: 'lif-020-b', text: 'Traditional 5-day week with standard hours', score: 90 },
      { id: 'lif-020-c', text: 'Flexible schedule based on project needs', score: 80 },
      { id: 'lif-020-d', text: 'Compressed schedule with alternating weeks', score: 75 },
    ],
  } as MultipleChoiceQuestion,

  // =====================================================
  // RISK PROFILE (20 questions)
  // =====================================================

  {
    id: 'risk-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'careerRiskTolerance',
    weight: 85,
    prompt: 'I am comfortable joining a startup or new venture even if it might fail.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'financialRiskTolerance',
    weight: 85,
    prompt: 'Given the choice between two job offers, I would prefer:',
    optionA: {
      id: 'risk-002-a',
      text: 'Lower base salary but significant upside potential',
      dimension: 'financialRiskTolerance',
    },
    optionB: {
      id: 'risk-002-b',
      text: 'Higher guaranteed salary with limited growth',
      dimension: 'careerRiskTolerance',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'risk-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'ambiguityTolerance',
    weight: 80,
    prompt: 'I can function effectively even when goals and expectations are unclear.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-004',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'failureRecovery',
    weight: 80,
    prompt: 'When I experience a significant setback, I typically:',
    allowMultiple: false,
    options: [
      { id: 'risk-004-a', text: 'Analyze what went wrong and try again quickly', score: 90 },
      { id: 'risk-004-b', text: 'Take time to recover and then plan carefully', score: 70 },
      { id: 'risk-004-c', text: 'Become discouraged and hesitant to try similar things', score: 40 },
      { id: 'risk-004-d', text: 'Seek advice and support before deciding next steps', score: 75 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'risk-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'uncertaintyComfort',
    weight: 80,
    prompt: 'Not knowing exactly what my career will look like in 5 years excites rather than worries me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-006',
    type: 'ranking',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'careerRiskTolerance',
    weight: 80,
    prompt: 'Rank these career scenarios by appeal:',
    items: [
      { id: 'risk-006-a', text: 'Joining an established company with clear career path' },
      { id: 'risk-006-b', text: 'Starting my own business from scratch' },
      { id: 'risk-006-c', text: 'Joining a promising but unproven startup' },
      { id: 'risk-006-d', text: 'Freelancing with variable income' },
    ],
  } as RankingQuestion,

  {
    id: 'risk-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'financialRiskTolerance',
    weight: 75,
    prompt: 'I would be willing to invest my savings in a business opportunity with uncertain returns.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-008',
    type: 'scale',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'ambiguityTolerance',
    weight: 75,
    prompt: 'How comfortable are you making decisions with incomplete information?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'comfort level',
  } as ScaleQuestion,

  {
    id: 'risk-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'failureRecovery',
    weight: 80,
    prompt: 'I view failure as a learning opportunity rather than something to be avoided.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-010',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'uncertaintyComfort',
    weight: 80,
    prompt: 'I prefer situations where:',
    optionA: {
      id: 'risk-010-a',
      text: 'Outcomes are somewhat unpredictable and dynamic',
      dimension: 'uncertaintyComfort',
    },
    optionB: {
      id: 'risk-010-b',
      text: 'Results are predictable and consistent',
      dimension: 'careerRiskTolerance',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'risk-011',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'careerRiskTolerance',
    weight: 75,
    prompt: 'I would consider leaving a stable job for an opportunity that might not work out.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-012',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'financialRiskTolerance',
    weight: 80,
    prompt: 'Regarding income stability, I prefer:',
    allowMultiple: false,
    options: [
      { id: 'risk-012-a', text: 'Variable income with high earning potential', score: 80 },
      { id: 'risk-012-b', text: 'Steady, predictable monthly salary', score: 95 },
      { id: 'risk-012-c', text: 'Base salary plus performance bonuses', score: 75 },
      { id: 'risk-012-d', text: 'Equity compensation with delayed returns', score: 60 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'risk-013',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'ambiguityTolerance',
    weight: 75,
    prompt: 'I can remain calm and productive when project requirements change frequently.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-014',
    type: 'ranking',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'failureRecovery',
    weight: 75,
    prompt: 'Rank these attitudes toward failure:',
    items: [
      { id: 'risk-014-a', text: 'Failure is temporary feedback, not identity' },
      { id: 'risk-014-b', text: 'Failure should be avoided when possible' },
      { id: 'risk-014-c', text: 'Failure means I need to try harder' },
      { id: 'risk-014-d', text: 'Failure teaches more than success' },
    ],
  } as RankingQuestion,

  {
    id: 'risk-015',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'uncertaintyComfort',
    weight: 75,
    prompt: 'I prefer having multiple options open rather than committing to a specific path.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-016',
    type: 'scale',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'careerRiskTolerance',
    weight: 75,
    prompt: 'How willing are you to take career risks for potential high rewards?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'willingness',
  } as ScaleQuestion,

  {
    id: 'risk-017',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'financialRiskTolerance',
    weight: 75,
    prompt: 'Having emergency savings is more important to me than pursuing high-growth opportunities.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-018',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'failureRecovery',
    weight: 75,
    prompt: 'After a significant failure, I am more likely to:',
    optionA: {
      id: 'risk-018-a',
      text: 'Take time to process before trying again',
      dimension: 'ambiguityTolerance',
    },
    optionB: {
      id: 'risk-018-b',
      text: 'Immediately look for the next opportunity',
      dimension: 'careerRiskTolerance',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'risk-019',
    type: 'likert',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'uncertaintyComfort',
    weight: 75,
    prompt: 'I find it energizing to navigate situations where the outcome is uncertain.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'risk-020',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.RISK,
    dimension: 'careerRiskTolerance',
    weight: 75,
    prompt: 'My approach to career decisions is best described as:',
    allowMultiple: false,
    options: [
      { id: 'risk-020-a', text: 'Cautious and thoroughly researched', score: 90 },
      { id: 'risk-020-b', text: 'Balanced with calculated risks', score: 70 },
      { id: 'risk-020-c', text: 'Opportunistic and adaptable', score: 60 },
      { id: 'risk-020-d', text: 'Bold and willing to take big risks', score: 40 },
    ],
  } as MultipleChoiceQuestion,

  // =====================================================
  // WORK ENVIRONMENT (20 questions)
  // =====================================================

  {
    id: 'work-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'independencePreference',
    weight: 85,
    prompt: 'I produce my best work when I have minimal supervision and can set my own approach.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'collaborationPreference',
    weight: 85,
    prompt: 'I am more energized by:',
    optionA: {
      id: 'work-002-a',
      text: 'Collaborative work with frequent team interaction',
      dimension: 'collaborationPreference',
    },
    optionB: {
      id: 'work-002-b',
      text: 'Solo work with time for deep concentration',
      dimension: 'independencePreference',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'work-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'structureNeed',
    weight: 80,
    prompt: 'I prefer clear processes and guidelines over figuring things out as I go.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-004',
    type: 'ranking',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'varietyNeed',
    weight: 80,
    prompt: 'Rank these work environment characteristics:',
    items: [
      { id: 'work-004-a', text: 'Quiet, distraction-free private space' },
      { id: 'work-004-b', text: 'Open collaborative area with teammates' },
      { id: 'work-004-c', text: 'Dynamic environment with changing scenery' },
      { id: 'work-004-d', text: 'Structured setting with clear boundaries' },
    ],
  } as RankingQuestion,

  {
    id: 'work-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'environmentSensitivity',
    weight: 75,
    prompt: 'My physical work environment significantly affects my productivity and mood.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-006',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'independencePreference',
    weight: 80,
    prompt: 'My ideal workday involves:',
    allowMultiple: false,
    options: [
      { id: 'work-006-a', text: 'Mostly independent work with occasional check-ins', score: 90 },
      { id: 'work-006-b', text: 'Regular collaboration with team members', score: 60 },
      { id: 'work-006-c', text: 'Constant coordination with many stakeholders', score: 40 },
      { id: 'work-006-d', text: 'A mix of solo and group work throughout the day', score: 75 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'work-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'collaborationPreference',
    weight: 80,
    prompt: 'I thrive in environments where brainstorming and group problem-solving are common.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-008',
    type: 'scale',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'structureNeed',
    weight: 75,
    prompt: 'How important is having clear hierarchy and reporting structures?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'work-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'varietyNeed',
    weight: 75,
    prompt: 'I prefer jobs where my tasks change frequently rather than doing similar work repeatedly.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-010',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'environmentSensitivity',
    weight: 75,
    prompt: 'When choosing a workplace, I prioritize:',
    optionA: {
      id: 'work-010-a',
      text: 'Modern amenities and aesthetic environment',
      dimension: 'environmentSensitivity',
    },
    optionB: {
      id: 'work-010-b',
      text: 'The nature of the work and growth opportunities',
      dimension: 'varietyNeed',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'work-011',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'independencePreference',
    weight: 75,
    prompt: 'Regular check-ins and status updates from my manager feel necessary rather than intrusive.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-012',
    type: 'ranking',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'collaborationPreference',
    weight: 80,
    prompt: 'Rank how you prefer to interact with colleagues:',
    items: [
      { id: 'work-012-a', text: 'Frequent in-person collaboration' },
      { id: 'work-012-b', text: 'Scheduled meetings with clear agendas' },
      { id: 'work-012-c', text: 'Asynchronous communication when needed' },
      { id: 'work-012-d', text: 'Minimal interaction, focus on individual tasks' },
    ],
  } as RankingQuestion,

  {
    id: 'work-013',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'structureNeed',
    weight: 75,
    prompt: 'I feel anxious when I do not have clear instructions for a task.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-014',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'varietyNeed',
    weight: 75,
    prompt: 'I prefer work that:',
    allowMultiple: false,
    options: [
      { id: 'work-014-a', text: 'Varies daily with new challenges', score: 80 },
      { id: 'work-014-b', text: 'Follows predictable patterns', score: 90 },
      { id: 'work-014-c', text: 'Mixes routine with special projects', score: 75 },
      { id: 'work-014-d', text: 'Evolves gradually over time', score: 70 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'work-015',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'environmentSensitivity',
    weight: 70,
    prompt: 'I am sensitive to noise, lighting, and other environmental factors when working.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-016',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'independencePreference',
    weight: 80,
    prompt: 'When given an assignment, I prefer:',
    optionA: {
      id: 'work-016-a',
      text: 'Clear expectations with freedom in execution',
      dimension: 'independencePreference',
    },
    optionB: {
      id: 'work-016-b',
      text: 'Detailed instructions on how to complete it',
      dimension: 'structureNeed',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'work-017',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'collaborationPreference',
    weight: 75,
    prompt: 'I feel energized after collaborative sessions with colleagues.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-018',
    type: 'scale',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'structureNeed',
    weight: 75,
    prompt: 'How much do you prefer defined roles and responsibilities?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'preference',
  } as ScaleQuestion,

  {
    id: 'work-019',
    type: 'likert',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'varietyNeed',
    weight: 75,
    prompt: 'Doing the same type of task repeatedly drains my energy.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'work-020',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    dimension: 'environmentSensitivity',
    weight: 70,
    prompt: 'My ideal workspace is:',
    allowMultiple: false,
    options: [
      { id: 'work-020-a', text: 'A private office or dedicated quiet space', score: 85 },
      { id: 'work-020-b', text: 'An open office with team interaction', score: 60 },
      { id: 'work-020-c', text: 'A co-working space with variety', score: 75 },
      { id: 'work-020-d', text: 'Anywhere I can work effectively', score: 90 },
    ],
  } as MultipleChoiceQuestion,

  // =====================================================
  // LEADERSHIP (10 questions)
  // =====================================================

  {
    id: 'lead-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'influenceOrientation',
    weight: 90,
    prompt: 'I naturally take charge in group situations when no one else steps up.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lead-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'decisionComfort',
    weight: 85,
    prompt: 'When a group needs to decide, I prefer to:',
    optionA: {
      id: 'lead-002-a',
      text: 'Make the decision and take responsibility',
      dimension: 'decisionComfort',
    },
    optionB: {
      id: 'lead-002-b',
      text: 'Facilitate discussion until consensus emerges',
      dimension: 'teamOrientation',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'lead-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'responsibilityCapacity',
    weight: 85,
    prompt: 'I feel comfortable being accountable for the success or failure of a team.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lead-004',
    type: 'ranking',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'visionCapability',
    weight: 85,
    prompt: 'Rank these leadership styles by how natural they feel to you:',
    items: [
      { id: 'lead-004-a', text: 'Setting clear vision and direction' },
      { id: 'lead-004-b', text: 'Supporting and developing team members' },
      { id: 'lead-004-c', text: 'Leading by example and expertise' },
      { id: 'lead-004-d', text: 'Facilitating collaborative decisions' },
    ],
  } as RankingQuestion,

  {
    id: 'lead-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'teamOrientation',
    weight: 80,
    prompt: 'I am motivated by helping others succeed and grow in their careers.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lead-006',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'influenceOrientation',
    weight: 85,
    prompt: 'In group projects, I typically find myself:',
    allowMultiple: false,
    options: [
      { id: 'lead-006-a', text: 'Organizing tasks and assigning roles', score: 90 },
      { id: 'lead-006-b', text: 'Contributing ideas and expertise', score: 70 },
      { id: 'lead-006-c', text: 'Supporting others and maintaining harmony', score: 60 },
      { id: 'lead-006-d', text: 'Focusing on my assigned part', score: 40 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'lead-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'decisionComfort',
    weight: 80,
    prompt: 'Making difficult decisions with incomplete information energizes me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lead-008',
    type: 'scale',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'responsibilityCapacity',
    weight: 80,
    prompt: 'How comfortable are you managing other people and their work?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'comfort level',
  } as ScaleQuestion,

  {
    id: 'lead-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'visionCapability',
    weight: 80,
    prompt: 'I naturally think about the big picture and long-term direction rather than immediate tasks.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'lead-010',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.LEADERSHIP,
    dimension: 'teamOrientation',
    weight: 80,
    prompt: 'As a leader, I would prioritize:',
    optionA: {
      id: 'lead-010-a',
      text: 'Achieving results and meeting objectives',
      dimension: 'influenceOrientation',
    },
    optionB: {
      id: 'lead-010-b',
      text: 'Building team cohesion and morale',
      dimension: 'teamOrientation',
    },
  } as ForcedChoiceQuestion,

  // =====================================================
  // SOCIAL DYNAMICS (10 questions)
  // =====================================================

  {
    id: 'soc-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'socialEnergy',
    weight: 85,
    prompt: 'Interacting with others throughout the day energizes me rather than drains me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'soc-002',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'empathyLevel',
    weight: 85,
    prompt: 'When someone is upset, I tend to:',
    optionA: {
      id: 'soc-002-a',
      text: 'Feel their emotions strongly and want to help',
      dimension: 'empathyLevel',
    },
    optionB: {
      id: 'soc-002-b',
      text: 'Analyze the situation logically to find solutions',
      dimension: 'conflictApproach',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'soc-003',
    type: 'likert',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'communicationStyle',
    weight: 80,
    prompt: 'I adapt my communication style based on who I am talking to.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'soc-004',
    type: 'ranking',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'relationshipImportance',
    weight: 85,
    prompt: 'Rank what matters most in professional relationships:',
    items: [
      { id: 'soc-004-a', text: 'Trust and mutual respect' },
      { id: 'soc-004-b', text: 'Clear communication and expectations' },
      { id: 'soc-004-c', text: 'Personal connection and camaraderie' },
      { id: 'soc-004-d', text: 'Professional competence and reliability' },
    ],
  } as RankingQuestion,

  {
    id: 'soc-005',
    type: 'likert',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'conflictApproach',
    weight: 80,
    prompt: 'I address conflicts directly rather than avoiding them.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'soc-006',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'socialEnergy',
    weight: 80,
    prompt: 'After a day with extensive social interaction, I feel:',
    allowMultiple: false,
    options: [
      { id: 'soc-006-a', text: 'Energized and motivated', score: 90 },
      { id: 'soc-006-b', text: 'Satisfied but ready for quiet time', score: 60 },
      { id: 'soc-006-c', text: 'Drained and need recovery', score: 40 },
      { id: 'soc-006-d', text: 'Neutral - depends on the interaction quality', score: 70 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'soc-007',
    type: 'likert',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'empathyLevel',
    weight: 80,
    prompt: 'I often understand what others are feeling before they explicitly tell me.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'soc-008',
    type: 'scale',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'relationshipImportance',
    weight: 80,
    prompt: 'How important are strong workplace relationships to your job satisfaction?',
    min: 0,
    max: 100,
    step: 5,
    unit: 'importance',
  } as ScaleQuestion,

  {
    id: 'soc-009',
    type: 'likert',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'communicationStyle',
    weight: 75,
    prompt: 'I prefer direct, straightforward communication over diplomatic or subtle approaches.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'soc-010',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.SOCIAL,
    dimension: 'conflictApproach',
    weight: 80,
    prompt: 'In a disagreement with a colleague, I prefer to:',
    optionA: {
      id: 'soc-010-a',
      text: 'Discuss it openly and find a resolution',
      dimension: 'conflictApproach',
    },
    optionB: {
      id: 'soc-010-b',
      text: 'Focus on areas of agreement and move forward',
      dimension: 'relationshipImportance',
    },
  } as ForcedChoiceQuestion,

  // =====================================================
  // CAREER EXPLORATION (10 questions)
  // =====================================================

  {
    id: 'explore-001',
    type: 'likert',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'explorationOpenness',
    weight: 85,
    prompt: 'I am actively curious about career paths I have not yet considered.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'explore-002',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'industryInterest',
    weight: 80,
    prompt: 'Which industry areas interest you most?',
    allowMultiple: true,
    options: [
      { id: 'explore-002-a', text: 'Technology and Software', score: 80 },
      { id: 'explore-002-b', text: 'Healthcare and Medicine', score: 80 },
      { id: 'explore-002-c', text: 'Finance and Business', score: 80 },
      { id: 'explore-002-d', text: 'Education and Research', score: 80 },
      { id: 'explore-002-e', text: 'Creative Arts and Media', score: 80 },
      { id: 'explore-002-f', text: 'Government and Public Service', score: 80 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'explore-003',
    type: 'ranking',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'roleCuriosity',
    weight: 85,
    prompt: 'Rank these role types by your interest in learning more:',
    items: [
      { id: 'explore-003-a', text: 'Analytical and research roles' },
      { id: 'explore-003-b', text: 'Creative and design roles' },
      { id: 'explore-003-c', text: 'People-facing and service roles' },
      { id: 'explore-003-d', text: 'Technical and hands-on roles' },
    ],
  } as RankingQuestion,

  {
    id: 'explore-004',
    type: 'likert',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'careerAwareness',
    weight: 80,
    prompt: 'I have a clear understanding of what different careers actually involve day-to-day.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'explore-005',
    type: 'forcedChoice',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'explorationOpenness',
    weight: 85,
    prompt: 'When thinking about my career, I prefer to:',
    optionA: {
      id: 'explore-005-a',
      text: 'Explore many possibilities before committing',
      dimension: 'explorationOpenness',
    },
    optionB: {
      id: 'explore-005-b',
      text: 'Focus on a clear goal and work toward it',
      dimension: 'careerAwareness',
    },
  } as ForcedChoiceQuestion,

  {
    id: 'explore-006',
    type: 'likert',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'industryInterest',
    weight: 75,
    prompt: 'I actively seek information about emerging industries and new types of jobs.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'explore-007',
    type: 'scale',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'roleCuriosity',
    weight: 80,
    prompt: 'How many different career paths have you seriously researched or considered?',
    min: 0,
    max: 20,
    step: 1,
    unit: 'career paths',
  } as ScaleQuestion,

  {
    id: 'explore-008',
    type: 'likert',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'careerAwareness',
    weight: 75,
    prompt: 'I have talked to professionals or done informational interviews about careers I am considering.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,

  {
    id: 'explore-009',
    type: 'multipleChoice',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'explorationOpenness',
    weight: 80,
    prompt: 'How do you approach career decisions?',
    allowMultiple: false,
    options: [
      { id: 'explore-009-a', text: 'I explore widely and keep my options open', score: 90 },
      { id: 'explore-009-b', text: 'I research thoroughly before narrowing down', score: 80 },
      { id: 'explore-009-c', text: 'I follow a planned path toward a specific goal', score: 60 },
      { id: 'explore-009-d', text: 'I rely on opportunities that come my way', score: 50 },
    ],
  } as MultipleChoiceQuestion,

  {
    id: 'explore-010',
    type: 'likert',
    category: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    dimension: 'roleCuriosity',
    weight: 75,
    prompt: 'I am curious about what people in different roles actually do in their daily work.',
    minScale: 1,
    maxScale: 5,
    labels: { min: 'Strongly Disagree', max: 'Strongly Agree' },
  } as LikertQuestion,
];

/**
 * Get questions by category.
 */
export function getQuestionsByCategory(category: string): BankQuestion[] {
  return QUESTION_BANK.filter((q) => q.category === category);
}

/**
 * Get question by ID.
 */
export function getQuestionById(id: string): BankQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

/**
 * Get all question IDs.
 */
export function getAllQuestionIds(): string[] {
  return QUESTION_BANK.map((q) => q.id);
}

/**
 * Count questions by category.
 */
export function countQuestionsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const question of QUESTION_BANK) {
    counts[question.category] = (counts[question.category] ?? 0) + 1;
  }

  return counts;
}

/**
 * Total question count.
 */
export const TOTAL_QUESTION_COUNT = QUESTION_BANK.length;
