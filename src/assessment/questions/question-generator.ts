/**
 * CareerOS Assessment Question Intelligence System - Question Generator
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * Architecture for AI-powered question generation and expansion.
 * Provides interfaces and templates for future AI integration.
 *
 * @module question-generator
 * @version 1.0.0
 */

import type {
  LikertQuestion,
  MultipleChoiceQuestion,
  RankingQuestion,
  ForcedChoiceQuestion,
  ScaleQuestion,
} from '../assessment-types';
import type { QuestionCategory } from './question-categories';

/**
 * Generated question with metadata.
 */
export type GeneratedQuestion =
  | LikertQuestion
  | MultipleChoiceQuestion
  | RankingQuestion
  | ForcedChoiceQuestion
  | ScaleQuestion;

/**
 * Request for question generation.
 */
export interface QuestionGenerationRequest {
  /** Target category for the question */
  category: QuestionCategory;

  /** Specific dimension to measure */
  dimension: string;

  /** Type of question to generate */
  questionType: 'likert' | 'multipleChoice' | 'ranking' | 'forcedChoice' | 'scale';

  /** Number of questions to generate */
  count: number;

  /** Target difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';

  /** Desired signal strength */
  targetSignalStrength: number;

  /** Context for generation (existing questions to avoid duplication) */
  existingQuestions?: string[];

  /** Style guidelines */
  style?: {
    /** Tone of the question */
    tone: 'professional' | 'conversational' | 'academic';

    /** Length preference */
    length: 'brief' | 'standard' | 'detailed';

    /** Cultural considerations */
    culturalContext?: string;
  };
}

/**
 * Prompt template for AI question generation.
 */
export interface GenerationPrompt {
  /** System context for the AI */
  systemContext: string;

  /** User prompt template */
  userTemplate: string;

  /** Output format specification */
  outputFormat: string;

  /** Constraints and requirements */
  constraints: string[];
}

/**
 * Quality criteria for generated questions.
 */
export interface QualityCriteria {
  /** Minimum behavioral indicator score (0-100) */
  minBehavioralScore: number;

  /** Maximum acceptable similarity to existing questions (0-100) */
  maxSimilarityScore: number;

  /** Required clarity score (0-100) */
  minClarityScore: number;

  /** Required specificity score (0-100) */
  minSpecificityScore: number;
}

/**
 * Default quality criteria.
 */
export const DEFAULT_QUALITY_CRITERIA: QualityCriteria = {
  minBehavioralScore: 70,
  maxSimilarityScore: 30,
  minClarityScore: 80,
  minSpecificityScore: 75,
};

/**
 * Generation result with questions and metadata.
 */
export interface GenerationResult {
  /** Generated questions */
  questions: GeneratedQuestion[];

  /** Generation metadata */
  metadata: {
    /** Timestamp of generation */
    generatedAt: Date;

    /** Prompt used */
    prompt: string;

    /** Quality score of generation */
    qualityScore: number;

    /** Generation duration in milliseconds */
    duration: number;
  };

  /** Validation results */
  validation: {
    /** Whether all questions passed quality checks */
    passed: boolean;

    /** Per-question quality scores */
    questionScores: Array<{
      questionId: string;
      behavioralScore: number;
      clarityScore: number;
      specificityScore: number;
    }>;
  };
}

/**
 * Template library for question generation prompts.
 */
export const GENERATION_TEMPLATES: Record<QuestionCategory, GenerationPrompt> = {
  cognitive: {
    systemContext:
      'You are an expert in cognitive assessment and psychometrics. Generate questions that reveal thinking patterns, problem-solving approaches, and cognitive preferences. Focus on behavioral indicators rather than self-reported traits.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the cognitive domain. Target difficulty: {difficulty}. Avoid direct self-assessment. Use scenarios and behavioral choices.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'No questions starting with "Are you" or "Do you like"',
      'Use behavioral scenarios',
      'Include specific context',
      'Avoid abstract self-assessment',
    ],
  },
  motivation: {
    systemContext:
      'You are an expert in motivation psychology and career assessment. Generate questions that uncover intrinsic drivers, energizers, and motivational patterns through behavioral choices and preferences.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the motivation domain. Target difficulty: {difficulty}. Focus on what energizes and drives behavior.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Focus on energy and drive, not capability',
      'Use preference rankings and trade-offs',
      'Include concrete scenarios',
      'Avoid value judgments',
    ],
  },
  values: {
    systemContext:
      'You are an expert in values assessment and career counseling. Generate questions that reveal core priorities and fundamental beliefs through forced choices and ranking exercises.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the values domain. Target difficulty: {difficulty}. Use trade-offs and priorities to reveal values.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use forced choices between competing values',
      'Include sacrifice scenarios',
      'Avoid obvious "right" answers',
      'Make trade-offs realistic',
    ],
  },
  lifestyle: {
    systemContext:
      'You are an expert in work-life integration and lifestyle assessment. Generate questions that reveal work preferences, boundary needs, and lifestyle priorities.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the lifestyle domain. Target difficulty: {difficulty}. Focus on practical work arrangements and preferences.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use concrete work scenarios',
      'Include time and location trade-offs',
      'Focus on sustainable patterns',
      'Avoid idealized preferences',
    ],
  },
  risk: {
    systemContext:
      'You are an expert in risk psychology and decision-making. Generate questions that reveal risk tolerance, ambiguity comfort, and uncertainty handling through behavioral scenarios.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the risk domain. Target difficulty: {difficulty}. Use scenarios with uncertain outcomes.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Include concrete risk scenarios',
      'Vary uncertainty levels',
      'Use realistic stakes',
      'Avoid hypothetical extremes',
    ],
  },
  workEnvironment: {
    systemContext:
      'You are an expert in organizational psychology and work environment assessment. Generate questions that reveal environmental preferences and situational fit.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the work environment domain. Target difficulty: {difficulty}. Focus on physical and social environment preferences.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use specific environment descriptions',
      'Include social context',
      'Vary noise and activity levels',
      'Make scenarios relatable',
    ],
  },
  leadership: {
    systemContext:
      'You are an expert in leadership assessment and organizational behavior. Generate questions that reveal leadership tendencies, influence styles, and responsibility comfort.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the leadership domain. Target difficulty: {difficulty}. Use group and influence scenarios.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use group dynamics scenarios',
      'Include influence situations',
      'Vary responsibility levels',
      'Avoid management cliches',
    ],
  },
  social: {
    systemContext:
      'You are an expert in interpersonal dynamics and social assessment. Generate questions that reveal social energy, empathy, communication style, and relationship patterns.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the social domain. Target difficulty: {difficulty}. Focus on interaction patterns and social energy.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use interpersonal scenarios',
      'Include conflict situations',
      'Vary social intensity',
      'Focus on energy, not skill',
    ],
  },
  careerExploration: {
    systemContext:
      'You are an expert in career development and exploration assessment. Generate questions that reveal career curiosity, openness, and awareness levels.',
    userTemplate:
      'Generate {count} {questionType} question(s) measuring {dimension} in the career exploration domain. Target difficulty: {difficulty}. Focus on curiosity and openness to possibilities.',
    outputFormat:
      'Return valid JSON array of question objects with: id, category, dimension, prompt, type-specific fields, weight (50-100), difficulty (1-5), expectedSignalStrength (0-100)',
    constraints: [
      'Use discovery scenarios',
      'Include information-seeking behaviors',
      'Focus on curiosity, not knowledge',
      'Make options concrete',
    ],
  },
};

/**
 * Question generator for AI-powered question creation.
 *
 * Provides the architecture for generating questions using AI models.
 * Implementation is a placeholder for future AI integration.
 */
export class QuestionGenerator {
  private qualityCriteria: QualityCriteria;

  constructor(qualityCriteria?: Partial<QualityCriteria>) {
    this.qualityCriteria = { ...DEFAULT_QUALITY_CRITERIA, ...qualityCriteria };
  }

  /**
   * Generate questions based on request parameters.
   *
   * Note: This is a placeholder implementation. In production, this would
   * call an AI service (e.g., OpenAI, Anthropic) to generate questions.
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    // Build prompt from template
    const prompt = this.buildPrompt(request);

    // Placeholder: In production, call AI service here
    // const aiResponse = await this.callAIService(prompt);

    // Return placeholder result for architecture validation
    const questions: GeneratedQuestion[] = [];
    const duration = Date.now() - startTime;

    return {
      questions,
      metadata: {
        generatedAt: new Date(),
        prompt,
        qualityScore: 0,
        duration,
      },
      validation: {
        passed: false,
        questionScores: [],
      },
    };
  }

  /**
   * Validate generated questions against quality criteria.
   */
  validateGeneratedQuestions(questions: GeneratedQuestion[]): GenerationResult['validation'] {
    const questionScores = questions.map((q) => ({
      questionId: q.id,
      behavioralScore: this.estimateBehavioralScore(q),
      clarityScore: this.estimateClarityScore(q),
      specificityScore: this.estimateSpecificityScore(q),
    }));

    const allPassed = questionScores.every(
      (s) =>
        s.behavioralScore >= this.qualityCriteria.minBehavioralScore &&
        s.clarityScore >= this.qualityCriteria.minClarityScore &&
        s.specificityScore >= this.qualityCriteria.minSpecificityScore
    );

    return {
      passed: allPassed,
      questionScores,
    };
  }

  /**
   * Build generation prompt from template.
   */
  private buildPrompt(request: QuestionGenerationRequest): string {
    const template = GENERATION_TEMPLATES[request.category];

    let prompt = template.systemContext + '\n\n';
    prompt += template.userTemplate
      .replace('{count}', request.count.toString())
      .replace('{questionType}', request.questionType)
      .replace('{dimension}', request.dimension)
      .replace('{difficulty}', request.difficulty);

    prompt += '\n\nConstraints:\n';
    prompt += template.constraints.map((c) => `- ${c}`).join('\n');

    prompt += '\n\nOutput Format:\n';
    prompt += template.outputFormat;

    if (request.existingQuestions && request.existingQuestions.length > 0) {
      prompt += '\n\nAvoid duplicating these existing questions:\n';
      prompt += request.existingQuestions.map((q) => `- ${q}`).join('\n');
    }

    return prompt;
  }

  /**
   * Estimate behavioral indicator score for a question.
   */
  private estimateBehavioralScore(question: GeneratedQuestion): number {
    const prompt = question.prompt.toLowerCase();

    // Check for behavioral indicators
    const behavioralMarkers = [
      'when',
      'how do you',
      'what do you do',
      'in a situation',
      'imagine',
      'consider',
      'given',
    ];

    const selfReportMarkers = ['are you', 'do you like', 'do you enjoy', 'would you say'];

    let score = 50;

    for (const marker of behavioralMarkers) {
      if (prompt.includes(marker)) score += 10;
    }

    for (const marker of selfReportMarkers) {
      if (prompt.includes(marker)) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate clarity score for a question.
   */
  private estimateClarityScore(question: GeneratedQuestion): number {
    const prompt = question.prompt;

    // Simple heuristics for clarity
    let score = 70;

    // Length check
    if (prompt.length < 30) score -= 10;
    if (prompt.length > 200) score -= 5;

    // Vague terms
    const vagueTerms = ['somewhat', 'kind of', 'sort of', 'maybe', 'perhaps'];
    for (const term of vagueTerms) {
      if (prompt.toLowerCase().includes(term)) score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate specificity score for a question.
   */
  private estimateSpecificityScore(question: GeneratedQuestion): number {
    const prompt = question.prompt;

    let score = 60;

    // Specific context indicators
    const specificMarkers = [
      'specifically',
      'exactly',
      'particular',
      'concrete',
      'example',
      'scenario',
    ];

    for (const marker of specificMarkers) {
      if (prompt.toLowerCase().includes(marker)) score += 8;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate similarity between two question texts.
   */
  calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return (intersection.size / union.size) * 100;
  }
}

/**
 * Factory function for QuestionGenerator.
 */
export function createQuestionGenerator(
  qualityCriteria?: Partial<QualityCriteria>
): QuestionGenerator {
  return new QuestionGenerator(qualityCriteria);
}
