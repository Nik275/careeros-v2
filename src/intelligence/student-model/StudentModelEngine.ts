/**
 * Student Model Engine
 * 
 * CareerOS Frontier Engine V2 - Student Model Engine
 * 
 * Purpose:
 *   Convert assessment responses into a structured StudentBelief with 10 core traits.
 * 
 * Architecture Principle:
 *   Assessment Answers → StudentModelEngine → StudentBelief
 * 
 *   NO recommendations.
 *   NO careers.
 *   NO mentor logic.
 * 
 *   ONLY: Assessment → Belief conversion.
 * 
 * The 10 Core Traits:
 *   1. autonomy          - Desire for independence and self-direction
 *   2. achievement       - Drive for accomplishment and recognition
 *   3. creativity        - Preference for innovation and original thought
 *   4. stability         - Preference for predictability and security
 *   5. impact            - Desire to make a meaningful difference
 *   6. leadership        - Drive to guide and influence others
 *   7. analytical        - Preference for logical reasoning and analysis
 *   8. communication     - Preference for interpersonal exchange and expression
 *   9. risk_tolerance    - Comfort with uncertainty and potential failure
 *   10. financial        - Importance of monetary compensation
 * 
 * Transparency:
 *   - All scoring rules are explicit and configurable
 *   - No magic numbers - all weights and thresholds are documented
 *   - Every belief is traceable to specific assessment evidence
 * 
 * Future-Proofing:
 *   - Bayesian update interface prepared for future implementation
 *   - Versioned beliefs for evolution tracking
 *   - Confidence scores enable weighted decision making
 */

import { EntityId, ConfidenceScore, BeliefTimestamp, EvidenceSource } from '../types';

// ============================================================================
// CORE TRAIT DEFINITIONS
// ============================================================================

/**
 * The 10 core student traits assessed by this engine.
 * These traits form the foundation for all downstream reasoning.
 */
export const CORE_TRAITS = [
  'autonomy',
  'achievement', 
  'creativity',
  'stability',
  'impact',
  'leadership',
  'analytical',
  'communication',
  'risk_tolerance',
  'financial',
] as const;

/**
 * Union type of all core trait identifiers.
 */
export type CoreTrait = typeof CORE_TRAITS[number];

/**
 * Human-readable descriptions for each trait.
 * Used for documentation and explainability.
 */
export const TRAIT_DESCRIPTIONS: Record<CoreTrait, string> = {
  autonomy: 'Desire for independence, self-direction, and control over work decisions',
  achievement: 'Drive for accomplishment, mastery, and recognition of excellence',
  creativity: 'Preference for innovation, original thought, and creating new things',
  stability: 'Preference for predictability, security, and structured environments',
  impact: 'Desire to make a meaningful difference in the world or help others',
  leadership: 'Drive to guide, influence, and inspire other people',
  analytical: 'Preference for logical reasoning, data analysis, and systematic thinking',
  communication: 'Preference for interpersonal exchange, expression, and relationship building',
  risk_tolerance: 'Comfort with uncertainty, ambiguity, and potential for failure',
  financial: 'Importance of monetary compensation and financial security',
};

/**
 * A single belief about a student's trait.
 * 
 * Every belief contains:
 *   - value: The estimated strength of the trait (0.0 - 1.0)
 *   - confidence: Our certainty in this estimate (0.0 - 1.0)
 *   - evidenceCount: How many pieces of evidence support this belief
 * 
 * This structure supports Bayesian updating even though the initial
 * implementation uses simpler scoring. The interface is designed to
 * accommodate future probabilistic inference.
 */
export interface TraitBelief {
  /** Estimated trait value (0.0 = not present, 1.0 = strongly present) */
  value: ConfidenceScore;
  
  /** Confidence in this estimate (0.0 = no confidence, 1.0 = certain) */
  confidence: ConfidenceScore;
  
  /** Number of evidence items supporting this belief */
  evidenceCount: number;
  
  /** Individual evidence items (for traceability) */
  evidence: TraitEvidence[];
}

/**
 * Evidence supporting a trait belief.
 * Every piece of evidence is traceable to its source.
 */
export interface TraitEvidence {
  /** Unique identifier for this evidence */
  id: string;
  
  /** Question that produced this evidence */
  questionId: string;
  
  /** The response value (option selected, rating given, etc.) */
  response: string | number;
  
  /** Weight this evidence carries (configured in scoring rules) */
  weight: number;
  
  /** Source of the evidence */
  source: EvidenceSource;
  
  /** When this evidence was recorded */
  timestamp: BeliefTimestamp;
}

/**
 * Complete student belief model.
 * 
 * This is the PRIMARY OUTPUT of the Student Model Engine.
 * All downstream engines consume this structure.
 */
export interface StudentBeliefModel {
  /** Unique identifier for this belief snapshot */
  id: EntityId;
  
  /** Student this belief belongs to */
  studentId: EntityId;
  
  /** Version number (increments with updates) */
  version: number;
  
  /** When this belief was generated */
  timestamp: BeliefTimestamp;
  
  /** The 10 core trait beliefs */
  traits: Record<CoreTrait, TraitBelief>;
  
  /** Overall confidence across all traits */
  overallConfidence: ConfidenceScore;
  
  /** Number of assessment questions that contributed */
  questionCount: number;
  
  /** Total evidence items across all traits */
  totalEvidenceCount: number;
  
  /** Scoring configuration used (for reproducibility) */
  scoringVersion: string;
}

// ============================================================================
// ASSESSMENT INPUT TYPES
// ============================================================================

/**
 * A single assessment question response.
 * This is the PRIMARY INPUT to the Student Model Engine.
 */
export interface AssessmentResponse {
  /** Question identifier */
  questionId: string;
  
  /** Type of question (determines scoring method) */
  type: QuestionType;
  
  /** Category this question assesses */
  category: QuestionCategory;
  
  /** The student's response */
  value: string | string[] | number;
  
  /** When this response was recorded */
  timestamp: BeliefTimestamp;
  
  /** Time spent on this question (ms) - for confidence weighting */
  timeSpent: number;
}

/**
 * Types of assessment questions.
 * Each type has a specific scoring methodology.
 */
export type QuestionType = 
  | 'single_choice'      // Select one option
  | 'multi_choice'       // Select multiple options  
  | 'rating'             // 1-5 or 1-7 scale
  | 'ranking'            // Rank options in order
  | 'likert';            // Strongly agree to strongly disagree

/**
 * Categories of assessment questions.
 * Maps to the 10 core traits.
 */
export type QuestionCategory = CoreTrait | 'composite' | 'demographic';

/**
 * Complete assessment result.
 */
export interface AssessmentResult {
  /** Assessment session identifier */
  assessmentId: EntityId;
  
  /** Student who took the assessment */
  studentId: EntityId;
  
  /** All responses */
  responses: AssessmentResponse[];
  
  /** When assessment started */
  startedAt: BeliefTimestamp;
  
  /** When assessment completed */
  completedAt: BeliefTimestamp;
}

// ============================================================================
// TRANSPARENT SCORING SYSTEM
// ============================================================================

/**
 * Scoring rule for a specific question-option combination.
 * 
 * TRANSPARENCY PRINCIPLE:
 *   Every score is defined by explicit rules. No hidden logic.
 *   All weights and multipliers are configurable and documented.
 */
export interface ScoringRule {
  /** Question this rule applies to */
  questionId: string;
  
  /** Response value this rule matches */
  responseValue: string | number;
  
  /** Which trait this rule contributes to */
  targetTrait: CoreTrait;
  
  /** Base score contribution (0.0 - 1.0) */
  baseScore: number;
  
  /** Weight of this evidence (higher = more reliable) */
  weight: number;
  
  /** Human-readable explanation */
  explanation: string;
}

/**
 * Scoring configuration for the entire engine.
 * 
 * This configuration makes the scoring system fully transparent.
 * Change these values to adjust how responses translate to beliefs.
 */
export interface ScoringConfiguration {
  /** Version identifier for this configuration */
  version: string;
  
  /** All scoring rules */
  rules: ScoringRule[];
  
  /** Confidence calculation parameters */
  confidence: {
    /** Base confidence for direct assessment */
    baseConfidence: number;
    
    /** Multiplier for each additional evidence item */
    evidenceMultiplier: number;
    
    /** Maximum confidence achievable */
    maxConfidence: number;
    
    /** Minimum time spent for full confidence (ms) */
    minTimeForFullConfidence: number;
    
    /** Penalty for rushing (confidence reduction factor) */
    rushPenaltyFactor: number;
  };
  
  /** Trait value calculation */
  calculation: {
    /** Method for combining multiple evidence scores */
    aggregationMethod: 'weighted_average' | 'bayesian' | 'maximum';
    
    /** Minimum evidence needed for non-zero confidence */
    minEvidenceForConfidence: number;
    
    /** Score smoothing factor (0 = raw scores, 1 = heavily smoothed) */
    smoothingFactor: number;
  };
}

/**
 * DEFAULT SCORING CONFIGURATION
 * 
 * These are the default scoring rules. They are explicit and documented.
 * Modify these values to change assessment behavior.
 * 
 * TRANSPARENCY NOTE:
 *   All numbers below are chosen based on psychometric best practices:
 *   - Base confidence of 0.7 reflects moderate certainty in self-report
 *   - Evidence multiplier of 0.05 provides diminishing returns
 *   - Max confidence of 0.95 leaves room for uncertainty
 *   - 10 second minimum prevents rushing without being punitive
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfiguration = {
  version: 'v2.0.0',
  
  rules: [
    // =========================================================================
    // AUTONOMY QUESTIONS
    // =========================================================================
    {
      questionId: 'work_style_preference',
      responseValue: 'independent',
      targetTrait: 'autonomy',
      baseScore: 0.85,
      weight: 1.0,
      explanation: 'Explicit preference for independent work indicates high autonomy',
    },
    {
      questionId: 'work_style_preference',
      responseValue: 'collaborative',
      targetTrait: 'autonomy',
      baseScore: 0.35,
      weight: 0.8,
      explanation: 'Collaborative preference suggests lower autonomy needs',
    },
    {
      questionId: 'decision_making_preference',
      responseValue: 'self_directed',
      targetTrait: 'autonomy',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Self-directed decision making is strong autonomy indicator',
    },
    {
      questionId: 'decision_making_preference',
      responseValue: 'team_consensus',
      targetTrait: 'autonomy',
      baseScore: 0.30,
      weight: 0.8,
      explanation: 'Consensus preference indicates lower autonomy',
    },
    {
      questionId: 'supervision_comfort',
      responseValue: 'minimal',
      targetTrait: 'autonomy',
      baseScore: 0.80,
      weight: 0.9,
      explanation: 'Comfort with minimal supervision indicates high autonomy',
    },
    
    // =========================================================================
    // ACHIEVEMENT QUESTIONS
    // =========================================================================
    {
      questionId: 'goal_orientation',
      responseValue: 'ambitious_goals',
      targetTrait: 'achievement',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Ambitious goal setting indicates high achievement drive',
    },
    {
      questionId: 'goal_orientation',
      responseValue: 'steady_progress',
      targetTrait: 'achievement',
      baseScore: 0.60,
      weight: 0.8,
      explanation: 'Steady progress indicates moderate achievement drive',
    },
    {
      questionId: 'recognition_importance',
      responseValue: 'very_important',
      targetTrait: 'achievement',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Recognition importance correlates with achievement motivation',
    },
    {
      questionId: 'mastery_vs_performance',
      responseValue: 'mastery',
      targetTrait: 'achievement',
      baseScore: 0.75,
      weight: 0.85,
      explanation: 'Mastery orientation indicates achievement drive',
    },
    {
      questionId: 'mastery_vs_performance',
      responseValue: 'performance',
      targetTrait: 'achievement',
      baseScore: 0.70,
      weight: 0.85,
      explanation: 'Performance orientation also indicates achievement drive',
    },
    
    // =========================================================================
    // CREATIVITY QUESTIONS
    // =========================================================================
    {
      questionId: 'problem_solving_approach',
      responseValue: 'innovative',
      targetTrait: 'creativity',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Innovative problem solving indicates high creativity',
    },
    {
      questionId: 'problem_solving_approach',
      responseValue: 'proven_methods',
      targetTrait: 'creativity',
      baseScore: 0.25,
      weight: 0.8,
      explanation: 'Preference for proven methods suggests lower creativity',
    },
    {
      questionId: 'idea_generation_comfort',
      responseValue: 'very_comfortable',
      targetTrait: 'creativity',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Comfort with idea generation indicates creativity',
    },
    {
      questionId: 'routine_tolerance',
      responseValue: 'low',
      targetTrait: 'creativity',
      baseScore: 0.75,
      weight: 0.8,
      explanation: 'Low routine tolerance often correlates with creativity',
    },
    
    // =========================================================================
    // STABILITY QUESTIONS
    // =========================================================================
    {
      questionId: 'change_comfort',
      responseValue: 'prefer_stability',
      targetTrait: 'stability',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Explicit preference for stability indicates high stability trait',
    },
    {
      questionId: 'change_comfort',
      responseValue: 'embrace_change',
      targetTrait: 'stability',
      baseScore: 0.20,
      weight: 0.8,
      explanation: 'Embracing change indicates low stability preference',
    },
    {
      questionId: 'predictability_importance',
      responseValue: 'very_important',
      targetTrait: 'stability',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Predictability importance is direct stability indicator',
    },
    {
      questionId: 'career_path_preference',
      responseValue: 'clear_ladder',
      targetTrait: 'stability',
      baseScore: 0.80,
      weight: 0.85,
      explanation: 'Preference for clear ladder indicates stability need',
    },
    
    // =========================================================================
    // IMPACT QUESTIONS
    // =========================================================================
    {
      questionId: 'work_meaning_importance',
      responseValue: 'essential',
      targetTrait: 'impact',
      baseScore: 0.95,
      weight: 1.0,
      explanation: 'Essential meaning indicates very high impact drive',
    },
    {
      questionId: 'work_meaning_importance',
      responseValue: 'important',
      targetTrait: 'impact',
      baseScore: 0.75,
      weight: 0.9,
      explanation: 'Important meaning indicates impact drive',
    },
    {
      questionId: 'helping_others_motivation',
      responseValue: 'very_motivated',
      targetTrait: 'impact',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Helping others motivation is strong impact indicator',
    },
    {
      questionId: 'social_contribution_desire',
      responseValue: 'high',
      targetTrait: 'impact',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'High social contribution desire indicates impact drive',
    },
    
    // =========================================================================
    // LEADERSHIP QUESTIONS
    // =========================================================================
    {
      questionId: 'leadership_comfort',
      responseValue: 'very_comfortable',
      targetTrait: 'leadership',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Comfort leading indicates strong leadership trait',
    },
    {
      questionId: 'leadership_comfort',
      responseValue: 'prefer_following',
      targetTrait: 'leadership',
      baseScore: 0.20,
      weight: 0.8,
      explanation: 'Preference for following indicates low leadership drive',
    },
    {
      questionId: 'influence_desire',
      responseValue: 'high',
      targetTrait: 'leadership',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'High influence desire indicates leadership trait',
    },
    {
      questionId: 'team_coordination_enjoyment',
      responseValue: 'enjoy',
      targetTrait: 'leadership',
      baseScore: 0.75,
      weight: 0.85,
      explanation: 'Enjoying coordination indicates leadership interest',
    },
    
    // =========================================================================
    // ANALYTICAL QUESTIONS
    // =========================================================================
    {
      questionId: 'data_comfort',
      responseValue: 'very_comfortable',
      targetTrait: 'analytical',
      baseScore: 0.85,
      weight: 1.0,
      explanation: 'Comfort with data indicates analytical strength',
    },
    {
      questionId: 'problem_breakdown_preference',
      responseValue: 'systematic',
      targetTrait: 'analytical',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Systematic breakdown is core analytical trait',
    },
    {
      questionId: 'logic_vs_intuition',
      responseValue: 'logic',
      targetTrait: 'analytical',
      baseScore: 0.80,
      weight: 0.9,
      explanation: 'Logic preference indicates analytical thinking',
    },
    {
      questionId: 'detail_attention',
      responseValue: 'high',
      targetTrait: 'analytical',
      baseScore: 0.75,
      weight: 0.85,
      explanation: 'Detail attention is analytical trait indicator',
    },
    
    // =========================================================================
    // COMMUNICATION QUESTIONS
    // =========================================================================
    {
      questionId: 'social_interaction_preference',
      responseValue: 'very_social',
      targetTrait: 'communication',
      baseScore: 0.85,
      weight: 1.0,
      explanation: 'Very social preference indicates communication strength',
    },
    {
      questionId: 'expression_comfort',
      responseValue: 'very_comfortable',
      targetTrait: 'communication',
      baseScore: 0.80,
      weight: 0.9,
      explanation: 'Expression comfort indicates communication trait',
    },
    {
      questionId: 'relationship_building',
      responseValue: 'enjoy',
      targetTrait: 'communication',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Enjoying relationship building indicates communication strength',
    },
    {
      questionId: 'listening_vs_speaking',
      responseValue: 'balanced',
      targetTrait: 'communication',
      baseScore: 0.75,
      weight: 0.8,
      explanation: 'Balanced communication indicates communication skill',
    },
    
    // =========================================================================
    // RISK TOLERANCE QUESTIONS
    // =========================================================================
    {
      questionId: 'uncertainty_comfort',
      responseValue: 'very_comfortable',
      targetTrait: 'risk_tolerance',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Comfort with uncertainty is direct risk tolerance indicator',
    },
    {
      questionId: 'uncertainty_comfort',
      responseValue: 'prefer_clarity',
      targetTrait: 'risk_tolerance',
      baseScore: 0.20,
      weight: 0.8,
      explanation: 'Clarity preference indicates low risk tolerance',
    },
    {
      questionId: 'failure_perspective',
      responseValue: 'learning_opportunity',
      targetTrait: 'risk_tolerance',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Positive failure perspective indicates risk tolerance',
    },
    {
      questionId: 'startup_vs_corporate',
      responseValue: 'startup',
      targetTrait: 'risk_tolerance',
      baseScore: 0.80,
      weight: 0.85,
      explanation: 'Startup preference indicates higher risk tolerance',
    },
    {
      questionId: 'startup_vs_corporate',
      responseValue: 'corporate',
      targetTrait: 'risk_tolerance',
      baseScore: 0.25,
      weight: 0.85,
      explanation: 'Corporate preference indicates lower risk tolerance',
    },
    
    // =========================================================================
    // FINANCIAL QUESTIONS
    // =========================================================================
    {
      questionId: 'salary_importance',
      responseValue: 'very_important',
      targetTrait: 'financial',
      baseScore: 0.90,
      weight: 1.0,
      explanation: 'Very important salary indicates high financial priority',
    },
    {
      questionId: 'salary_importance',
      responseValue: 'somewhat_important',
      targetTrait: 'financial',
      baseScore: 0.60,
      weight: 0.8,
      explanation: 'Moderate salary importance indicates moderate financial priority',
    },
    {
      questionId: 'salary_importance',
      responseValue: 'not_important',
      targetTrait: 'financial',
      baseScore: 0.15,
      weight: 0.8,
      explanation: 'Low salary importance indicates low financial priority',
    },
    {
      questionId: 'wealth_building_desire',
      responseValue: 'high',
      targetTrait: 'financial',
      baseScore: 0.85,
      weight: 0.9,
      explanation: 'Wealth building desire indicates financial motivation',
    },
    {
      questionId: 'financial_security_vs_growth',
      responseValue: 'security',
      targetTrait: 'financial',
      baseScore: 0.70,
      weight: 0.85,
      explanation: 'Security focus indicates moderate financial priority',
    },
    {
      questionId: 'financial_security_vs_growth',
      responseValue: 'growth',
      targetTrait: 'financial',
      baseScore: 0.80,
      weight: 0.85,
      explanation: 'Growth focus can indicate financial ambition',
    },
  ],
  
  confidence: {
    // Base confidence for direct assessment answers
    // 0.7 = moderately confident in self-reported data
    baseConfidence: 0.70,
    
    // Each additional evidence item adds 0.05 confidence (diminishing returns)
    evidenceMultiplier: 0.05,
    
    // Maximum achievable confidence
    // 0.95 leaves room for uncertainty even with lots of evidence
    maxConfidence: 0.95,
    
    // Minimum time spent for full confidence (10 seconds)
    // Less than this reduces confidence
    minTimeForFullConfidence: 10000,
    
    // Factor to reduce confidence for rushed answers
    // 0.2 means rushed answers lose 20% confidence
    rushPenaltyFactor: 0.20,
  },
  
  calculation: {
    // How to aggregate multiple evidence items
    // weighted_average = sum(score * weight) / sum(weights)
    aggregationMethod: 'weighted_average',
    
    // Need at least 2 pieces of evidence for non-zero confidence
    minEvidenceForConfidence: 2,
    
    // Smoothing factor for final scores
    // 0.1 = slight smoothing to prevent extreme values
    smoothingFactor: 0.1,
  },
};

// ============================================================================
// STUDENT MODEL ENGINE
// ============================================================================

/**
 * Configuration for the Student Model Engine.
 */
export interface StudentModelEngineConfig {
  /** Scoring configuration to use */
  scoringConfig: ScoringConfiguration;
  
  /** Whether to enable debug logging */
  debugMode: boolean;
  
  /** Minimum confidence threshold for valid beliefs */
  minConfidenceThreshold: number;
}

/**
 * Default engine configuration.
 */
export const DEFAULT_ENGINE_CONFIG: StudentModelEngineConfig = {
  scoringConfig: DEFAULT_SCORING_CONFIG,
  debugMode: false,
  minConfidenceThreshold: 0.3,
};

/**
 * Result of converting assessment to belief.
 */
export interface ConversionResult {
  /** Success status */
  success: boolean;
  
  /** The generated belief model (if successful) */
  belief?: StudentBeliefModel;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Warnings about the conversion */
  warnings: string[];
  
  /** Statistics about the conversion */
  stats: {
    questionsProcessed: number;
    evidenceItemsGenerated: number;
    traitsAssessed: number;
    averageConfidence: number;
  };
}

/**
 * Student Model Engine
 * 
 * The core engine for converting assessment responses into structured beliefs.
 * 
 * Usage:
 *   const engine = createStudentModelEngine();
 *   const result = engine.convertAssessment(assessment);
 *   if (result.success) {
 *     const belief = result.belief;
 *     console.log(belief.traits.creativity.value);
 *   }
 */
export class StudentModelEngine {
  private config: StudentModelEngineConfig;
  private debugLog: string[] = [];

  constructor(config: Partial<StudentModelEngineConfig> = {}) {
    this.config = {
      ...DEFAULT_ENGINE_CONFIG,
      ...config,
      scoringConfig: {
        ...DEFAULT_SCORING_CONFIG,
        ...config.scoringConfig,
      },
    };
  }

  /**
   * Convert an assessment result into a StudentBeliefModel.
   * 
   * This is the PRIMARY METHOD of the engine.
   * 
   * @param assessment - The assessment result to convert
   * @returns ConversionResult containing the belief or error
   */
  convertAssessment(assessment: AssessmentResult): ConversionResult {
    this.debug('Starting assessment conversion', { 
      assessmentId: assessment.assessmentId,
      responseCount: assessment.responses.length,
    });

    const warnings: string[] = [];

    // Validate input
    if (assessment.responses.length === 0) {
      return {
        success: false,
        error: 'No responses provided in assessment',
        warnings: ['Empty assessment submitted'],
        stats: {
          questionsProcessed: 0,
          evidenceItemsGenerated: 0,
          traitsAssessed: 0,
          averageConfidence: 0,
        },
      };
    }

    // Initialize traits with default beliefs
    const traits = this.initializeTraits();
    
    // Process each response
    let totalEvidence = 0;
    for (const response of assessment.responses) {
      const evidenceCount = this.processResponse(response, traits);
      totalEvidence += evidenceCount;
    }

    // Calculate final trait values and confidence
    this.finalizeTraits(traits);

    // Check for under-assessed traits
    for (const trait of CORE_TRAITS) {
      if (traits[trait].evidenceCount < this.config.scoringConfig.calculation.minEvidenceForConfidence) {
        warnings.push(`Trait "${trait}" has insufficient evidence (${traits[trait].evidenceCount} items)`);
      }
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(traits);

    // Create the belief model
    const belief: StudentBeliefModel = {
      id: this.generateBeliefId(assessment.studentId),
      studentId: assessment.studentId,
      version: 1,
      timestamp: Date.now(),
      traits,
      overallConfidence,
      questionCount: assessment.responses.length,
      totalEvidenceCount: totalEvidence,
      scoringVersion: this.config.scoringConfig.version,
    };

    this.debug('Assessment conversion complete', {
      beliefId: belief.id,
      overallConfidence,
      totalEvidence,
    });

    return {
      success: true,
      belief,
      warnings,
      stats: {
        questionsProcessed: assessment.responses.length,
        evidenceItemsGenerated: totalEvidence,
        traitsAssessed: CORE_TRAITS.length,
        averageConfidence: overallConfidence,
      },
    };
  }

  /**
   * Update an existing belief with new assessment data.
   * 
   * FUTURE BAYESIAN SUPPORT:
   *   This method is designed to support Bayesian updating when implemented.
   *   Currently uses simple weighted combination.
   * 
   * @param existingBelief - The current belief to update
   * @param newAssessment - New assessment data
   * @returns Updated belief model
   */
  updateBelief(
    existingBelief: StudentBeliefModel,
    newAssessment: AssessmentResult
  ): StudentBeliefModel {
    this.debug('Updating existing belief', {
      beliefId: existingBelief.id,
      currentVersion: existingBelief.version,
    });

    // Convert new assessment
    const result = this.convertAssessment(newAssessment);
    if (!result.success || !result.belief) {
      throw new Error(`Failed to convert new assessment: ${result.error}`);
    }

    const newBelief = result.belief;
    const updatedTraits: Record<CoreTrait, TraitBelief> = { ...existingBelief.traits };

    // Combine traits using weighted average
    for (const trait of CORE_TRAITS) {
      const existing = existingBelief.traits[trait];
      const new_ = newBelief.traits[trait];

      // Weight by confidence
      const totalWeight = (existing.confidence || 0) + (new_.confidence || 0);
      if (totalWeight > 0) {
        updatedTraits[trait] = {
          value: (existing.value * existing.confidence + new_.value * new_.confidence) / totalWeight,
          confidence: Math.min(
            this.config.scoringConfig.confidence.maxConfidence,
            existing.confidence + (new_.confidence * this.config.scoringConfig.confidence.evidenceMultiplier)
          ),
          evidenceCount: existing.evidenceCount + new_.evidenceCount,
          evidence: [...existing.evidence, ...new_.evidence],
        };
      } else {
        // Both have zero confidence - use simple average
        updatedTraits[trait] = {
          value: (existing.value + new_.value) / 2,
          confidence: new_.confidence,
          evidenceCount: existing.evidenceCount + new_.evidenceCount,
          evidence: [...existing.evidence, ...new_.evidence],
        };
      }
      
      // Ensure valid numbers
      updatedTraits[trait].value = Math.max(0, Math.min(1, updatedTraits[trait].value || 0.5));
      updatedTraits[trait].confidence = Math.max(0, Math.min(1, updatedTraits[trait].confidence || 0));
    }

    return {
      id: this.generateBeliefId(existingBelief.studentId),
      studentId: existingBelief.studentId,
      version: existingBelief.version + 1,
      timestamp: Date.now(),
      traits: updatedTraits,
      overallConfidence: this.calculateOverallConfidence(updatedTraits),
      questionCount: existingBelief.questionCount + newBelief.questionCount,
      totalEvidenceCount: existingBelief.totalEvidenceCount + newBelief.totalEvidenceCount,
      scoringVersion: this.config.scoringConfig.version,
    };
  }

  /**
   * Get the debug log (if debug mode is enabled).
   */
  getDebugLog(): string[] {
    return [...this.debugLog];
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Initialize all traits with default (neutral) beliefs.
   */
  private initializeTraits(): Record<CoreTrait, TraitBelief> {
    const traits = {} as Record<CoreTrait, TraitBelief>;
    
    for (const trait of CORE_TRAITS) {
      traits[trait] = {
        value: 0.5,  // Neutral default
        confidence: 0,
        evidenceCount: 0,
        evidence: [],
      };
    }

    return traits;
  }

  /**
   * Process a single assessment response and update traits.
   * 
   * @returns Number of evidence items generated
   */
  private processResponse(
    response: AssessmentResponse,
    traits: Record<CoreTrait, TraitBelief>
  ): number {
    let evidenceCount = 0;

    // Find matching scoring rules
    const matchingRules = this.config.scoringConfig.rules.filter(
      rule => rule.questionId === response.questionId &&
              (rule.responseValue === response.value || 
               (Array.isArray(response.value) && 
                response.value.some(v => v === String(rule.responseValue))))
    );

    for (const rule of matchingRules) {
      const trait = traits[rule.targetTrait];
      
      // Calculate confidence based on time spent
      const timeConfidence = this.calculateTimeConfidence(response.timeSpent);
      
      // Create evidence record
      const evidence: TraitEvidence = {
        id: `ev_${response.questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionId: response.questionId,
        response: Array.isArray(response.value) ? response.value.join(',') : response.value,
        weight: rule.weight * timeConfidence,
        source: EvidenceSource.DIRECT_ASSESSMENT,
        timestamp: response.timestamp,
      };

      // Add to trait evidence
      trait.evidence.push(evidence);
      trait.evidenceCount++;
      evidenceCount++;

      this.debug('Processed evidence', {
        questionId: response.questionId,
        trait: rule.targetTrait,
        baseScore: rule.baseScore,
        weight: rule.weight,
        explanation: rule.explanation,
      });
    }

    return evidenceCount;
  }

  /**
   * Calculate confidence modifier based on time spent answering.
   */
  private calculateTimeConfidence(timeSpent: number): number {
    const { minTimeForFullConfidence, rushPenaltyFactor } = this.config.scoringConfig.confidence;
    
    if (timeSpent >= minTimeForFullConfidence) {
      return 1.0;
    }
    
    // Linear penalty for rushed answers
    const timeRatio = timeSpent / minTimeForFullConfidence;
    return 1.0 - (rushPenaltyFactor * (1 - timeRatio));
  }

  /**
   * Calculate final trait values and confidence from accumulated evidence.
   */
  private finalizeTraits(traits: Record<CoreTrait, TraitBelief>): void {
    for (const trait of CORE_TRAITS) {
      const belief = traits[trait];
      
      if (belief.evidenceCount === 0) {
        // No evidence - keep neutral value with zero confidence
        belief.value = 0.5;
        belief.confidence = 0;
        continue;
      }

      // Calculate weighted average of evidence scores
      let weightedSum = 0;
      let totalWeight = 0;

      for (const evidence of belief.evidence) {
        // Find the rule to get the base score
        // Must match questionId, targetTrait, AND responseValue
        const rule = this.config.scoringConfig.rules.find(
          r => r.questionId === evidence.questionId && 
               r.targetTrait === trait &&
               r.responseValue === evidence.response
        );
        
        if (rule) {
          weightedSum += rule.baseScore * evidence.weight;
          totalWeight += evidence.weight;
        }
      }

      if (totalWeight > 0) {
        // Calculate raw value
        let rawValue = weightedSum / totalWeight;
        
        // Apply smoothing
        const smoothing = this.config.scoringConfig.calculation.smoothingFactor;
        rawValue = (rawValue * (1 - smoothing)) + (0.5 * smoothing);
        
        belief.value = Math.max(0, Math.min(1, rawValue));
        
      } else {
        // No matching rules - keep neutral value
        belief.value = 0.5;
      }

      // Calculate confidence
      const { baseConfidence, evidenceMultiplier, maxConfidence } = 
        this.config.scoringConfig.confidence;
      const { minEvidenceForConfidence } = this.config.scoringConfig.calculation;
      
      // Ensure minEvidenceForConfidence is at least 1 to avoid division by zero
      const safeMinEvidence = Math.max(1, minEvidenceForConfidence || 2);
      
      if (belief.evidenceCount >= safeMinEvidence) {
        const extraEvidence = belief.evidenceCount - safeMinEvidence;
        belief.confidence = Math.min(
          maxConfidence,
          baseConfidence + (extraEvidence * evidenceMultiplier)
        );
      } else {
        // Linear confidence ramp based on evidence count
        belief.confidence = baseConfidence * (belief.evidenceCount / safeMinEvidence);
      }
      
      // Ensure confidence is a valid number between 0 and 1
      belief.confidence = Math.max(0, Math.min(1, belief.confidence || 0));
    }
  }

  /**
   * Calculate overall confidence across all traits.
   */
  private calculateOverallConfidence(traits: Record<CoreTrait, TraitBelief>): ConfidenceScore {
    const confidences = CORE_TRAITS.map(trait => traits[trait].confidence);
    // Filter out NaN values
    const validConfidences = confidences.filter(c => typeof c === 'number' && !isNaN(c));
    if (validConfidences.length === 0) return 0;
    const sum = validConfidences.reduce((a, b) => a + b, 0);
    return sum / validConfidences.length;
  }

  /**
   * Generate a unique belief identifier.
   */
  private generateBeliefId(studentId: EntityId): EntityId {
    return `belief_${studentId}_${Date.now()}`;
  }

  /**
   * Log debug message if debug mode is enabled.
   */
  private debug(message: string, data?: Record<string, unknown>): void {
    if (this.config.debugMode) {
      this.debugLog.push(JSON.stringify({ message, data, timestamp: Date.now() }));
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Student Model Engine with the specified configuration.
 * 
 * @param config - Partial configuration to override defaults
 * @returns Configured StudentModelEngine instance
 * 
 * @example
 * ```typescript
 * const engine = createStudentModelEngine({
 *   debugMode: true,
 *   scoringConfig: customScoringRules,
 * });
 * ```
 */
export function createStudentModelEngine(
  config?: Partial<StudentModelEngineConfig>
): StudentModelEngine {
  return new StudentModelEngine(config);
}

/**
 * Convenience function to convert an assessment in one call.
 * 
 * @param assessment - Assessment result to convert
 * @param config - Optional engine configuration
 * @returns Conversion result
 * 
 * @example
 * ```typescript
 * const result = convertAssessmentToBelief(assessment);
 * if (result.success) {
 *   console.log(result.belief.traits.autonomy);
 * }
 * ```
 */
export function convertAssessmentToBelief(
  assessment: AssessmentResult,
  config?: Partial<StudentModelEngineConfig>
): ConversionResult {
  const engine = createStudentModelEngine(config);
  return engine.convertAssessment(assessment);
}

/**
 * Create an empty assessment result for testing.
 */
export function createEmptyAssessment(studentId: EntityId): AssessmentResult {
  return {
    assessmentId: `assessment_${Date.now()}`,
    studentId,
    responses: [],
    startedAt: Date.now(),
    completedAt: Date.now(),
  };
}

/**
 * Create a mock assessment response for testing.
 */
export function createMockResponse(
  questionId: string,
  value: string | number,
  category: QuestionCategory = 'composite',
  type: QuestionType = 'single_choice'
): AssessmentResponse {
  return {
    questionId,
    type,
    category,
    value,
    timestamp: Date.now(),
    timeSpent: 5000,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Types are already exported as part of their interface declarations above
// No additional exports needed here
