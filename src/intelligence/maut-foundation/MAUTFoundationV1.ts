/**
 * CareerOS Multi-Attribute Utility Theory (MAUT) Foundation V1
 *
 * Personalized decision optimization system based on Multi-Attribute Utility Theory.
 * Supports individual student utility functions for career evaluation.
 *
 * Features:
 * - Multi-dimensional utility attributes (financial, lifestyle, psychological, social, future)
 * - Personalized utility weight profiles
 * - Automatic validation and normalization
 * - Consistency checking
 * - Explainable utility scoring
 * - Career path utility calculation
 *
 * Deterministic. Explainable. No AI. No arbitrary weights.
 *
 * @module intelligence/maut-foundation
 * @version 1.0.0
 */

import type { CareerSlug } from '../../domains/career/Career.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for utility attributes
 */
export type UtilityAttributeId = string;

/**
 * Categories of utility attributes
 */
export type UtilityAttributeCategory =
  | 'financial'    // Money, wealth, economic outcomes
  | 'lifestyle'    // Work-life balance, freedom, flexibility
  | 'psychological' // Meaning, mastery, growth, curiosity
  | 'social'       // Status, family approval, social impact
  | 'future';      // Optionality, stability, resilience

/**
 * Single utility attribute definition
 */
export interface UtilityAttribute {
  /** Unique identifier */
  id: UtilityAttributeId;

  /** Human-readable name */
  name: string;

  /** Detailed description */
  description: string;

  /** Attribute category */
  category: UtilityAttributeCategory;

  /** Whether higher values are better */
  higherIsBetter: boolean;

  /** Typical range for this attribute (0-100 scale) */
  typicalRange: {
    min: number;
    max: number;
  };

  /** Importance guidance */
  guidance: {
    /** When this attribute is most important */
    highImportanceContext: string;

    /** When this attribute is less important */
    lowImportanceContext: string;

    /** Trade-offs to consider */
    commonTradeoffs: string[];
  };

  /** Measurement approach */
  measurement: {
    /** How this attribute is measured */
    method: string;

    /** Data sources */
    sources: string[];

    /** Confidence in measurement (0-100) */
    reliability: number;
  };
}

/**
 * Student's personalized utility profile
 */
export interface StudentUtilityProfile {
  /** Profile identifier */
  id: string;

  /** Student identifier */
  studentId: string;

  /** Utility weights for each attribute (must sum to 1.0) */
  utilityWeights: Record<UtilityAttributeId, number>;

  /** Attribute importance rankings (1 = most important) */
  rankings: Record<UtilityAttributeId, number>;

  /** Minimum acceptable thresholds for critical attributes */
  minimumThresholds: Partial<Record<UtilityAttributeId, number>>;

  /** Attributes that are deal-breakers if below threshold */
  dealBreakers: UtilityAttributeId[];

  /** Trade-off preferences */
  tradeOffs: {
    /** Willingness to sacrifice short-term for long-term (0-100) */
    shortTermLongTerm: number;

    /** Willingness to sacrifice income for meaning (0-100) */
    incomeForMeaning: number;

    /** Willingness to sacrifice stability for growth (0-100) */
    stabilityForGrowth: number;

    /** Willingness to sacrifice status for freedom (0-100) */
    statusForFreedom: number;
  };

  /** Profile metadata */
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
    validated: boolean;
    consistencyScore: number;
  };
}

/**
 * Career path utility input data
 */
export interface CareerPathUtilityData {
  /** Career identifier */
  careerId: CareerSlug;

  /** Path identifier (if multi-step path) */
  pathId?: string;

  /** Attribute scores (0-100) */
  attributes: Record<UtilityAttributeId, number>;

  /** Confidence in each attribute score (0-100) */
  confidence: Record<UtilityAttributeId, number>;

  /** Data quality indicators */
  dataQuality: {
    completeness: number; // 0-100
    reliability: number; // 0-100
    freshness: number;   // 0-100
  };
}

/**
 * Calculated utility score
 */
export interface UtilityScore {
  /** Overall utility score (0-100) */
  overall: number;

  /** Category scores */
  byCategory: Record<UtilityAttributeCategory, number>;

  /** Attribute contributions */
  byAttribute: Record<UtilityAttributeId, {
    rawScore: number;
    weightedScore: number;
    contribution: number; // Percentage of total utility
    importance: number;   // Student's weight
  }>;

  /** Score interpretation */
  interpretation: {
    rating: 'exceptional' | 'excellent' | 'good' | 'moderate' | 'poor';
    percentile: number;
    confidence: number;
  };

  /** Deal-breaker status */
  dealBreakers: {
    violated: UtilityAttributeId[];
    atRisk: UtilityAttributeId[];
    satisfied: UtilityAttributeId[];
  };

  /** Threshold compliance */
  thresholds: {
    met: UtilityAttributeId[];
    missed: UtilityAttributeId[];
    partial: UtilityAttributeId[];
  };
}

/**
 * Utility explanation for a career path
 */
export interface UtilityExplanation {
  /** Explanation identifier */
  id: string;

  /** Student profile used */
  profileId: string;

  /** Career/path evaluated */
  careerId: CareerSlug;
  pathId?: string;

  /** Overall assessment */
  overall: {
    score: number;
    rating: string;
    summary: string;
  };

  /** Strengths - why this path ranks highly */
  strengths: Array<{
    attribute: UtilityAttributeId;
    attributeName: string;
    score: number;
    importance: number;
    explanation: string;
  }>;

  /** Weaknesses - why this path scores lower */
  weaknesses: Array<{
    attribute: UtilityAttributeId;
    attributeName: string;
    score: number;
    importance: number;
    explanation: string;
    impact: 'critical' | 'significant' | 'moderate' | 'minor';
  }>;

  /** Trade-off analysis */
  tradeOffs: Array<{
    gained: UtilityAttributeId;
    sacrificed: UtilityAttributeId;
    gainScore: number;
    sacrificeScore: number;
    explanation: string;
  }>;

  /** Personalized insights */
  insights: string[];

  /** Recommendations */
  recommendations: string[];

  /** Comparison guidance */
  comparisonGuidance: {
    betterAlternatives: string[];
    similarOptions: string[];
    worseAlternatives: string[];
  };
}

/**
 * Utility profile validation result
 */
export interface UtilityValidationResult {
  /** Is profile valid */
  valid: boolean;

  /** Validation errors */
  errors: Array<{
    type: 'sum' | 'range' | 'missing' | 'inconsistent' | 'threshold';
    attribute?: UtilityAttributeId;
    message: string;
    severity: 'error' | 'warning';
  }>;

  /** Normalization applied */
  normalization: {
    applied: boolean;
    originalSum: number;
    normalizedSum: number;
    adjustments: Array<{
      attribute: UtilityAttributeId;
      original: number;
      adjusted: number;
    }>;
  };

  /** Consistency metrics */
  consistency: {
    score: number; // 0-100
    issues: string[];
    suggestions: string[];
  };

  /** Suggested corrections */
  suggestions: Array<{
    issue: string;
    suggestion: string;
    autoFixable: boolean;
  }>;
}

/**
 * Utility comparison between multiple options
 */
export interface UtilityComparison {
  /** Comparison identifier */
  id: string;

  /** Student profile used */
  profileId: string;

  /** Options compared */
  options: Array<{
    careerId: CareerSlug;
    pathId?: string;
    score: UtilityScore;
    rank: number;
    advantage: string;
  }>;

  /** Best option */
  bestOption: {
    careerId: CareerSlug;
    pathId?: string;
    score: number;
    margin: number;
  };

  /** Comparison analysis */
  analysis: {
    /** Key differentiating attributes */
    keyDifferentiators: UtilityAttributeId[];

    /** Where each option excels */
    optionStrengths: Record<string, UtilityAttributeId[]>;

    /** Trade-offs between top options */
    tradeOffs: Array<{
      between: [string, string];
      tradeOff: string;
      winner: string;
    }>;
  };

  /** Decision guidance */
  guidance: {
    clearWinner: boolean;
    needsMoreInfo: boolean;
    closeCall: boolean;
    recommendation: string;
  };
}

/**
 * MAUT configuration
 */
export interface MAUTConfig {
  /** Default attribute weights (equal if not specified) */
  defaultWeights: Record<UtilityAttributeId, number>;

  /** Validation rules */
  validation: {
    /** Tolerance for sum deviation from 1.0 */
    sumTolerance: number;

    /** Minimum weight for any attribute */
    minWeight: number;

    /** Maximum weight for any attribute */
    maxWeight: number;

    /** Minimum number of attributes with non-zero weight */
    minActiveAttributes: number;
  };

  /** Scoring rules */
  scoring: {
    /** Minimum score for "good" rating */
    goodThreshold: number;

    /** Minimum score for "excellent" rating */
    excellentThreshold: number;

    /** Deal-breaker penalty */
    dealBreakerPenalty: number;

    /** Threshold violation penalty */
    thresholdPenalty: number;
  };

  /** Explanation rules */
  explanation: {
    /** Number of top strengths to include */
    topStrengthsCount: number;

    /** Number of top weaknesses to include */
    topWeaknessesCount: number;

    /** Minimum contribution percentage to mention */
    minContributionPercent: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_MAUT_CONFIG: MAUTConfig = {
  defaultWeights: {}, // Will be set dynamically based on available attributes
  validation: {
    sumTolerance: 0.01,      // Allow 1% deviation
    minWeight: 0,            // Allow zero weights
    maxWeight: 0.6,          // No single attribute > 60%
    minActiveAttributes: 3,  // At least 3 attributes must have weight
  },
  scoring: {
    goodThreshold: 60,
    excellentThreshold: 75,
    dealBreakerPenalty: 30,
    thresholdPenalty: 15,
  },
  explanation: {
    topStrengthsCount: 3,
    topWeaknessesCount: 3,
    minContributionPercent: 5,
  },
};

// ============================================================================
// CORE UTILITY ATTRIBUTES
// ============================================================================

export const CORE_UTILITY_ATTRIBUTES: UtilityAttribute[] = [
  // Financial
  {
    id: 'income',
    name: 'Income',
    description: 'Immediate earning potential and starting salary',
    category: 'financial',
    higherIsBetter: true,
    typicalRange: { min: 20, max: 95 },
    guidance: {
      highImportanceContext: 'When you have immediate financial obligations, family support needs, or loan burdens',
      lowImportanceContext: 'When you have financial cushion, family support, or prioritize other values',
      commonTradeoffs: ['meaning', 'freedom', 'workLifeBalance'],
    },
    measurement: {
      method: 'Starting salary percentile within career',
      sources: ['industry-salary-data', 'location-adjusted', 'experience-level'],
      reliability: 85,
    },
  },
  {
    id: 'wealthPotential',
    name: 'Wealth Potential',
    description: 'Long-term wealth accumulation and financial growth trajectory',
    category: 'financial',
    higherIsBetter: true,
    typicalRange: { min: 15, max: 98 },
    guidance: {
      highImportanceContext: 'When building long-term financial security is a primary goal',
      lowImportanceContext: 'When you prioritize present quality of life over future wealth',
      commonTradeoffs: ['workLifeBalance', 'meaning', 'stability'],
    },
    measurement: {
      method: '10-year income trajectory and equity potential',
      sources: ['career-progression-data', 'equity-opportunities', 'industry-growth'],
      reliability: 70,
    },
  },

  // Lifestyle
  {
    id: 'freedom',
    name: 'Freedom & Autonomy',
    description: 'Control over work, schedule, and decision-making',
    category: 'lifestyle',
    higherIsBetter: true,
    typicalRange: { min: 10, max: 90 },
    guidance: {
      highImportanceContext: 'When you value independence, dislike micromanagement, or want entrepreneurial flexibility',
      lowImportanceContext: 'When you prefer structure, clear direction, or collaborative decision-making',
      commonTradeoffs: ['income', 'stability', 'status'],
    },
    measurement: {
      method: 'Autonomy index based on decision rights and schedule flexibility',
      sources: ['job-characteristics', 'work-arrangement-data', 'hierarchy-level'],
      reliability: 80,
    },
  },
  {
    id: 'workLifeBalance',
    name: 'Work-Life Balance',
    description: 'Ability to maintain healthy boundaries between work and personal life',
    category: 'lifestyle',
    higherIsBetter: true,
    typicalRange: { min: 15, max: 85 },
    guidance: {
      highImportanceContext: 'When you have family responsibilities, health priorities, or value personal time',
      lowImportanceContext: 'When you are career-focused, single, or find fulfillment in work intensity',
      commonTradeoffs: ['wealthPotential', 'mastery', 'status'],
    },
    measurement: {
      method: 'Hours, flexibility, and predictability assessment',
      sources: ['work-hours-data', 'remote-work-potential', 'industry-norms'],
      reliability: 75,
    },
  },
  {
    id: 'geographicFlexibility',
    name: 'Geographic Flexibility',
    description: 'Ability to work from different locations or relocate easily',
    category: 'lifestyle',
    higherIsBetter: true,
    typicalRange: { min: 20, max: 95 },
    guidance: {
      highImportanceContext: 'When you want location independence, travel opportunities, or family mobility needs',
      lowImportanceContext: 'When you are location-anchored or prefer in-person collaboration',
      commonTradeoffs: ['income', 'familyApproval'],
    },
    measurement: {
      method: 'Remote work potential and location requirements',
      sources: ['remote-work-data', 'location-constraints', 'travel-requirements'],
      reliability: 85,
    },
  },

  // Psychological
  {
    id: 'meaning',
    name: 'Meaning & Purpose',
    description: 'Sense that work contributes to something larger than yourself',
    category: 'psychological',
    higherIsBetter: true,
    typicalRange: { min: 10, max: 95 },
    guidance: {
      highImportanceContext: 'When you need purpose-driven work, social impact, or alignment with values',
      lowImportanceContext: 'When you separate work from purpose or find meaning outside career',
      commonTradeoffs: ['income', 'wealthPotential', 'status'],
    },
    measurement: {
      method: 'Purpose alignment and social impact assessment',
      sources: ['job-meaning-research', 'impact-metrics', 'value-alignment'],
      reliability: 65,
    },
  },
  {
    id: 'mastery',
    name: 'Mastery & Excellence',
    description: 'Opportunity to develop deep expertise and become world-class',
    category: 'psychological',
    higherIsBetter: true,
    typicalRange: { min: 25, max: 90 },
    guidance: {
      highImportanceContext: 'When you are driven by craft, expertise, or becoming the best',
      lowImportanceContext: 'When you prefer generalist roles or breadth over depth',
      commonTradeoffs: ['optionality', 'workLifeBalance'],
    },
    measurement: {
      method: 'Skill depth trajectory and expertise development potential',
      sources: ['skill-progression-data', 'expertise-requirements', 'learning-curve'],
      reliability: 75,
    },
  },
  {
    id: 'growth',
    name: 'Growth & Learning',
    description: 'Continuous learning opportunities and personal development',
    category: 'psychological',
    higherIsBetter: true,
    typicalRange: { min: 30, max: 95 },
    guidance: {
      highImportanceContext: 'When you value continuous learning, skill diversity, or rapid development',
      lowImportanceContext: 'When you prefer stability, routine, or have reached your learning goals',
      commonTradeoffs: ['stability', 'mastery'],
    },
    measurement: {
      method: 'Learning velocity and development opportunity assessment',
      sources: ['skill-acquisition-rate', 'training-opportunities', 'challenge-level'],
      reliability: 80,
    },
  },
  {
    id: 'curiosity',
    name: 'Curiosity Satisfaction',
    description: 'Intellectual stimulation and opportunity to explore interesting problems',
    category: 'psychological',
    higherIsBetter: true,
    typicalRange: { min: 20, max: 90 },
    guidance: {
      highImportanceContext: 'When you are intellectually driven, love puzzles, or need mental stimulation',
      lowImportanceContext: 'When you prefer execution over exploration or value other outcomes',
      commonTradeoffs: ['income', 'stability'],
    },
    measurement: {
      method: 'Problem complexity and intellectual challenge assessment',
      sources: ['task-complexity', 'problem-variety', 'intellectual-demand'],
      reliability: 70,
    },
  },

  // Social
  {
    id: 'status',
    name: 'Status & Prestige',
    description: 'Social standing and recognition from career choice',
    category: 'social',
    higherIsBetter: true,
    typicalRange: { min: 15, max: 95 },
    guidance: {
      highImportanceContext: 'When social recognition, family pride, or external validation matters',
      lowImportanceContext: 'When you are internally motivated or indifferent to external opinion',
      commonTradeoffs: ['meaning', 'freedom', 'workLifeBalance'],
    },
    measurement: {
      method: 'Social prestige index and recognition potential',
      sources: ['prestige-surveys', 'social-perception-data', 'title-hierarchy'],
      reliability: 60,
    },
  },
  {
    id: 'familyApproval',
    name: 'Family Approval',
    description: 'Alignment with family expectations and values',
    category: 'social',
    higherIsBetter: true,
    typicalRange: { min: 10, max: 90 },
    guidance: {
      highImportanceContext: 'When family harmony, parental approval, or cultural alignment is critical',
      lowImportanceContext: 'When you prioritize personal choice over family expectations',
      commonTradeoffs: ['freedom', 'meaning', 'curiosity'],
    },
    measurement: {
      method: 'Cultural and family value alignment assessment',
      sources: ['family-expectations', 'cultural-norms', 'generational-values'],
      reliability: 55,
    },
  },
  {
    id: 'socialImpact',
    name: 'Social Impact',
    description: 'Direct positive effect on people, communities, or society',
    category: 'social',
    higherIsBetter: true,
    typicalRange: { min: 10, max: 95 },
    guidance: {
      highImportanceContext: 'When making a difference, helping others, or social contribution drives you',
      lowImportanceContext: 'When you focus on personal or organizational goals over societal impact',
      commonTradeoffs: ['income', 'wealthPotential', 'status'],
    },
    measurement: {
      method: 'Social impact magnitude and beneficiary reach',
      sources: ['impact-metrics', 'beneficiary-data', 'outcome-measurement'],
      reliability: 65,
    },
  },

  // Future
  {
    id: 'optionality',
    name: 'Future Optionality',
    description: 'Keeps future career options open and enables pivots',
    category: 'future',
    higherIsBetter: true,
    typicalRange: { min: 20, max: 90 },
    guidance: {
      highImportanceContext: 'When you value flexibility, want to keep options open, or are uncertain',
      lowImportanceContext: 'When you are committed to a path or prefer depth over breadth',
      commonTradeoffs: ['mastery', 'income'],
    },
    measurement: {
      method: 'Transferable skills and pivot potential assessment',
      sources: ['skill-transferability', 'adjacent-careers', 'pivot-data'],
      reliability: 75,
    },
  },
  {
    id: 'stability',
    name: 'Stability & Security',
    description: 'Predictability, job security, and low risk of disruption',
    category: 'future',
    higherIsBetter: true,
    typicalRange: { min: 25, max: 95 },
    guidance: {
      highImportanceContext: 'When you prioritize security, have dependents, or are risk-averse',
      lowImportanceContext: 'When you embrace uncertainty, have safety nets, or value growth over security',
      commonTradeoffs: ['growth', 'wealthPotential', 'optionality'],
    },
    measurement: {
      method: 'Job security and career stability assessment',
      sources: ['industry-stability', 'automation-risk', 'demand-trajectory'],
      reliability: 70,
    },
  },
  {
    id: 'resilience',
    name: 'Career Resilience',
    description: 'Ability to withstand economic downturns and industry changes',
    category: 'future',
    higherIsBetter: true,
    typicalRange: { min: 30, max: 90 },
    guidance: {
      highImportanceContext: 'When you want recession-proof careers or long-term adaptability',
      lowImportanceContext: 'When you accept volatility for higher rewards or are early in career',
      commonTradeoffs: ['income', 'growth'],
    },
    measurement: {
      method: 'Economic resilience and adaptability assessment',
      sources: ['recession-performance', 'skill-obsolescence', 'industry-volatility'],
      reliability: 65,
    },
  },
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a student utility profile
 */
export function validateUtilityProfile(
  profile: StudentUtilityProfile,
  availableAttributes: UtilityAttributeId[],
  config: MAUTConfig = DEFAULT_MAUT_CONFIG
): UtilityValidationResult {
  const errors: UtilityValidationResult['errors'] = [];
  const normalization: UtilityValidationResult['normalization'] = {
    applied: false,
    originalSum: 0,
    normalizedSum: 0,
    adjustments: [],
  };
  const consistency: UtilityValidationResult['consistency'] = {
    score: 100,
    issues: [],
    suggestions: [],
  };
  const suggestions: UtilityValidationResult['suggestions'] = [];

  // Check 1: Sum of weights must be close to 1.0
  const weightSum = Object.values(profile.utilityWeights).reduce((sum, w) => sum + w, 0);
  normalization.originalSum = weightSum;

  if (Math.abs(weightSum - 1.0) > config.validation.sumTolerance) {
    errors.push({
      type: 'sum',
      message: `Weights sum to ${weightSum.toFixed(3)}, must be 1.0 (±${config.validation.sumTolerance})`,
      severity: 'error',
    });

    suggestions.push({
      issue: 'Weights do not sum to 1.0',
      suggestion: 'Normalize weights by dividing each by the total sum',
      autoFixable: true,
    });
  }

  // Check 2: Individual weight ranges
  for (const [attrId, weight] of Object.entries(profile.utilityWeights)) {
    if (weight < config.validation.minWeight) {
      errors.push({
        type: 'range',
        attribute: attrId,
        message: `Weight for ${attrId} (${weight}) is below minimum ${config.validation.minWeight}`,
        severity: 'warning',
      });
    }

    if (weight > config.validation.maxWeight) {
      errors.push({
        type: 'range',
        attribute: attrId,
        message: `Weight for ${attrId} (${weight}) exceeds maximum ${config.validation.maxWeight}`,
        severity: 'error',
      });

      suggestions.push({
        issue: `Weight for ${attrId} is too high`,
        suggestion: `Reduce ${attrId} weight to ${config.validation.maxWeight} or lower`,
        autoFixable: true,
      });
    }
  }

  // Check 3: Minimum active attributes
  const activeAttributes = Object.entries(profile.utilityWeights)
    .filter(([, w]) => w > 0)
    .map(([id]) => id);

  if (activeAttributes.length < config.validation.minActiveAttributes) {
    errors.push({
      type: 'missing',
      message: `Only ${activeAttributes.length} attributes have weight, minimum is ${config.validation.minActiveAttributes}`,
      severity: 'error',
    });

    suggestions.push({
      issue: 'Too few attributes weighted',
      suggestion: `Add weights for at least ${config.validation.minActiveAttributes - activeAttributes.length} more attributes`,
      autoFixable: false,
    });
  }

  // Check 4: All weights must be for valid attributes
  for (const attrId of Object.keys(profile.utilityWeights)) {
    if (!availableAttributes.includes(attrId)) {
      errors.push({
        type: 'missing',
        attribute: attrId,
        message: `Unknown attribute: ${attrId}`,
        severity: 'error',
      });
    }
  }

  // Check 5: Consistency between rankings and weights
  const rankedAttrs = Object.entries(profile.rankings)
    .sort(([, a], [, b]) => a - b)
    .map(([id]) => id);

  const weightedAttrs = Object.entries(profile.utilityWeights)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  // Check if top-ranked attributes have high weights
  const topRanked = rankedAttrs.slice(0, 3);
  const topWeighted = weightedAttrs.slice(0, 3);

  const overlap = topRanked.filter(id => topWeighted.includes(id)).length;
  const consistencyScore = (overlap / 3) * 100;
  consistency.score = Math.round(consistencyScore);

  if (consistencyScore < 50) {
    consistency.issues.push('Rankings and weights are inconsistent');
    consistency.suggestions.push('Review whether your rankings match your weight priorities');

    suggestions.push({
      issue: 'Rankings and weights do not align',
      suggestion: 'Adjust weights to match your stated rankings, or update rankings to reflect weights',
      autoFixable: false,
    });
  }

  // Check 6: Deal-breakers must have thresholds
  for (const dealBreaker of profile.dealBreakers) {
    if (!profile.minimumThresholds[dealBreaker]) {
      errors.push({
        type: 'threshold',
        attribute: dealBreaker,
        message: `Deal-breaker ${dealBreaker} has no minimum threshold defined`,
        severity: 'warning',
      });

      suggestions.push({
        issue: `Missing threshold for deal-breaker ${dealBreaker}`,
        suggestion: `Set a minimum threshold for ${dealBreaker}`,
        autoFixable: false,
      });
    }
  }

  // Check 7: Threshold values must be valid (0-100)
  for (const [attrId, threshold] of Object.entries(profile.minimumThresholds)) {
    if (threshold !== undefined && (threshold < 0 || threshold > 100)) {
      errors.push({
        type: 'range',
        attribute: attrId,
        message: `Threshold for ${attrId} (${threshold}) must be between 0 and 100`,
        severity: 'error',
      });
    }
  }

  const hasErrors = errors.some(e => e.severity === 'error');

  return {
    valid: !hasErrors,
    errors,
    normalization,
    consistency,
    suggestions,
  };
}

/**
 * Normalize utility weights to sum to 1.0
 */
export function normalizeUtilityWeights(
  weights: Record<UtilityAttributeId, number>
): Record<UtilityAttributeId, number> {
  const sum = Object.values(weights).reduce((s, w) => s + w, 0);

  if (sum === 0) {
    // If all weights are zero, distribute equally
    const attrs = Object.keys(weights);
    const equalWeight = 1 / attrs.length;
    return Object.fromEntries(attrs.map(id => [id, equalWeight]));
  }

  const normalized: Record<UtilityAttributeId, number> = {};
  for (const [id, weight] of Object.entries(weights)) {
    normalized[id] = weight / sum;
  }

  return normalized;
}

/**
 * Check consistency between rankings and weights
 */
export function checkUtilityConsistency(
  profile: StudentUtilityProfile
): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Sort rankings (1 = most important)
  const rankedAttrs = Object.entries(profile.rankings)
    .sort(([, a], [, b]) => a - b)
    .map(([id]) => id);

  // Sort weights (highest first)
  const weightedAttrs = Object.entries(profile.utilityWeights)
    .filter(([, w]) => w > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  // Check top 3 alignment
  const topRanked = rankedAttrs.slice(0, 3);
  const topWeighted = weightedAttrs.slice(0, 3);

  const misaligned = topRanked.filter(id => !topWeighted.includes(id));
  if (misaligned.length > 0) {
    issues.push(`Top-ranked attributes ${misaligned.join(', ')} do not have highest weights`);
    suggestions.push('Consider increasing weights for your top-ranked attributes');
  }

  // Check for zero-weight highly-ranked attributes
  for (let i = 0; i < Math.min(5, rankedAttrs.length); i++) {
    const attrId = rankedAttrs[i];
    const weight = profile.utilityWeights[attrId] || 0;
    if (weight === 0) {
      issues.push(`Highly-ranked attribute ${attrId} has zero weight`);
      suggestions.push(`Assign a weight to ${attrId} or lower its ranking`);
    }
  }

  // Check for high-weight low-ranked attributes
  const lowRanked = rankedAttrs.slice(-3);
  for (const attrId of lowRanked) {
    const weight = profile.utilityWeights[attrId] || 0;
    if (weight > 0.2) {
      issues.push(`Low-ranked attribute ${attrId} has high weight (${(weight * 100).toFixed(0)}%)`);
      suggestions.push(`Consider if ${attrId} should be ranked higher or weight reduced`);
    }
  }

  // Calculate consistency score
  let alignmentScore = 100;
  alignmentScore -= misaligned.length * 20;
  alignmentScore -= issues.length * 10;

  return {
    score: Math.max(0, alignmentScore),
    issues,
    suggestions,
  };
}

// ============================================================================
// UTILITY CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate utility score for a career path
 */
export function calculateUtilityScore(
  profile: StudentUtilityProfile,
  pathData: CareerPathUtilityData,
  config: MAUTConfig = DEFAULT_MAUT_CONFIG
): UtilityScore {
  // Validate profile first
  const availableAttrs = Object.keys(pathData.attributes);
  const validation = validateUtilityProfile(profile, availableAttrs, config);

  if (!validation.valid) {
    throw new Error(`Invalid utility profile: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  // Normalize weights
  const normalizedWeights = normalizeUtilityWeights(profile.utilityWeights);

  // Calculate weighted scores for each attribute
  const byAttribute: UtilityScore['byAttribute'] = {};
  let totalWeightedScore = 0;

  for (const [attrId, rawScore] of Object.entries(pathData.attributes)) {
    const weight = normalizedWeights[attrId] || 0;
    const weightedScore = rawScore * weight;

    byAttribute[attrId] = {
      rawScore,
      weightedScore,
      contribution: 0, // Will calculate after total
      importance: weight,
    };

    totalWeightedScore += weightedScore;
  }

  // Calculate contributions as percentages
  for (const attrId of Object.keys(byAttribute)) {
    if (totalWeightedScore > 0) {
      byAttribute[attrId].contribution = Math.round(
        (byAttribute[attrId].weightedScore / totalWeightedScore) * 100
      );
    }
  }

  // Calculate category scores
  const byCategory: UtilityScore['byCategory'] = {
    financial: 0,
    lifestyle: 0,
    psychological: 0,
    social: 0,
    future: 0,
  };

  const categoryWeights: Record<UtilityAttributeCategory, number> = {
    financial: 0,
    lifestyle: 0,
    psychological: 0,
    social: 0,
    future: 0,
  };

  // Map attributes to categories and calculate weighted averages
  const attrToCategory = new Map<UtilityAttributeId, UtilityAttributeCategory>();
  for (const attr of CORE_UTILITY_ATTRIBUTES) {
    attrToCategory.set(attr.id, attr.category);
  }

  for (const [attrId, data] of Object.entries(byAttribute)) {
    const category = attrToCategory.get(attrId);
    if (category) {
      byCategory[category] += data.weightedScore;
      categoryWeights[category] += data.importance;
    }
  }

  // Normalize category scores by category weight
  for (const category of Object.keys(byCategory) as UtilityAttributeCategory[]) {
    if (categoryWeights[category] > 0) {
      byCategory[category] = Math.round(byCategory[category] / categoryWeights[category]);
    }
  }

  // Apply deal-breaker penalties
  let dealBreakerPenalty = 0;
  const violatedDealBreakers: UtilityAttributeId[] = [];
  const atRiskDealBreakers: UtilityAttributeId[] = [];
  const satisfiedDealBreakers: UtilityAttributeId[] = [];

  for (const dealBreaker of profile.dealBreakers) {
    const threshold = profile.minimumThresholds[dealBreaker] || 0;
    const score = pathData.attributes[dealBreaker] || 0;

    if (score < threshold * 0.8) {
      // Severely below threshold
      dealBreakerPenalty += config.scoring.dealBreakerPenalty;
      violatedDealBreakers.push(dealBreaker);
    } else if (score < threshold) {
      // Below threshold but close
      dealBreakerPenalty += config.scoring.dealBreakerPenalty * 0.5;
      atRiskDealBreakers.push(dealBreaker);
    } else {
      satisfiedDealBreakers.push(dealBreaker);
    }
  }

  // Apply threshold penalties
  let thresholdPenalty = 0;
  const metThresholds: UtilityAttributeId[] = [];
  const missedThresholds: UtilityAttributeId[] = [];
  const partialThresholds: UtilityAttributeId[] = [];

  for (const [attrId, threshold] of Object.entries(profile.minimumThresholds)) {
    if (profile.dealBreakers.includes(attrId)) continue; // Already counted
    if (threshold === undefined) continue;

    const score = pathData.attributes[attrId] || 0;

    if (score >= threshold) {
      metThresholds.push(attrId);
    } else if (score >= threshold * 0.7) {
      partialThresholds.push(attrId);
      thresholdPenalty += config.scoring.thresholdPenalty * 0.5;
    } else {
      missedThresholds.push(attrId);
      thresholdPenalty += config.scoring.thresholdPenalty;
    }
  }

  // Calculate final score
  let overall = Math.max(0, Math.min(100, totalWeightedScore - dealBreakerPenalty - thresholdPenalty));

  // Determine rating
  let rating: UtilityScore['interpretation']['rating'];
  if (overall >= 90) rating = 'exceptional';
  else if (overall >= config.scoring.excellentThreshold) rating = 'excellent';
  else if (overall >= config.scoring.goodThreshold) rating = 'good';
  else if (overall >= 40) rating = 'moderate';
  else rating = 'poor';

  // Calculate confidence
  const avgConfidence = Object.values(pathData.confidence).reduce((sum, c) => sum + c, 0) /
    Math.max(1, Object.keys(pathData.confidence).length);

  return {
    overall: Math.round(overall),
    byCategory,
    byAttribute,
    interpretation: {
      rating,
      percentile: Math.round(overall), // Simplified - would use distribution
      confidence: Math.round(avgConfidence),
    },
    dealBreakers: {
      violated: violatedDealBreakers,
      atRisk: atRiskDealBreakers,
      satisfied: satisfiedDealBreakers,
    },
    thresholds: {
      met: metThresholds,
      missed: missedThresholds,
      partial: partialThresholds,
    },
  };
}

// ============================================================================
// EXPLANATION FUNCTIONS
// ============================================================================

/**
 * Generate utility explanation for a career path
 */
export function generateUtilityExplanation(
  profile: StudentUtilityProfile,
  pathData: CareerPathUtilityData,
  score: UtilityScore,
  attributes: UtilityAttribute[] = CORE_UTILITY_ATTRIBUTES
): UtilityExplanation {
  // Build attribute name map
  const attrNames = new Map<UtilityAttributeId, string>();
  for (const attr of attributes) {
    attrNames.set(attr.id, attr.name);
  }

  // Identify strengths (high contribution + high importance)
  const strengths = Object.entries(score.byAttribute)
    .filter(([, data]) => data.importance > 0.05 && data.rawScore >= 60)
    .sort(([, a], [, b]) => b.contribution - a.contribution)
    .slice(0, 3)
    .map(([attrId, data]) => ({
      attribute: attrId,
      attributeName: attrNames.get(attrId) || attrId,
      score: data.rawScore,
      importance: data.importance,
      explanation: `Strong ${data.rawScore}/100 score on ${attrNames.get(attrId) || attrId}, which is ${(data.importance * 100).toFixed(0)}% important to you`,
    }));

  // Identify weaknesses (low score + high importance)
  const weaknesses = Object.entries(score.byAttribute)
    .filter(([, data]) => data.importance > 0.05 && data.rawScore < 60)
    .sort(([, a], [, b]) => b.importance - a.importance)
    .slice(0, 3)
    .map(([attrId, data]) => {
      const gap = 60 - data.rawScore;
      let impact: UtilityExplanation['weaknesses'][0]['impact'];
      if (gap > 30) impact = 'critical';
      else if (gap > 20) impact = 'significant';
      else if (gap > 10) impact = 'moderate';
      else impact = 'minor';

      return {
        attribute: attrId,
        attributeName: attrNames.get(attrId) || attrId,
        score: data.rawScore,
        importance: data.importance,
        explanation: `Weak ${data.rawScore}/100 score on ${attrNames.get(attrId) || attrId}, which is ${(data.importance * 100).toFixed(0)}% important to you`,
        impact,
      };
    });

  // Identify trade-offs
  const tradeOffs: UtilityExplanation['tradeOffs'] = [];
  const highScoring = Object.entries(score.byAttribute)
    .filter(([, data]) => data.rawScore >= 70)
    .map(([id]) => id);
  const lowScoring = Object.entries(score.byAttribute)
    .filter(([, data]) => data.rawScore < 50 && data.importance > 0.05)
    .map(([id]) => id);

  if (highScoring.length > 0 && lowScoring.length > 0) {
    tradeOffs.push({
      gained: highScoring[0],
      sacrificed: lowScoring[0],
      gainScore: score.byAttribute[highScoring[0]].rawScore,
      sacrificeScore: score.byAttribute[lowScoring[0]].rawScore,
      explanation: `You gain ${attrNames.get(highScoring[0])} but sacrifice ${attrNames.get(lowScoring[0])}`,
    });
  }

  // Generate insights
  const insights: string[] = [];

  if (strengths.length > 0) {
    insights.push(`This path excels in ${strengths.length} areas you value highly.`);
  }

  if (weaknesses.length > 0) {
    const criticalWeaknesses = weaknesses.filter(w => w.impact === 'critical');
    if (criticalWeaknesses.length > 0) {
      insights.push(`Critical concern: ${criticalWeaknesses.length} important attributes score below 50.`);
    }
  }

  if (score.dealBreakers.violated.length > 0) {
    insights.push(`Deal-breaker alert: ${score.dealBreakers.violated.length} non-negotiable requirements not met.`);
  }

  // Category insights
  const bestCategory = Object.entries(score.byCategory)
    .sort(([, a], [, b]) => b - a)[0];
  if (bestCategory[1] >= 70) {
    insights.push(`Strongest in ${bestCategory[0]} category (${bestCategory[1]}/100).`);
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (weaknesses.length > 0) {
    recommendations.push(`Consider whether you can accept ${weaknesses[0].attributeName} at ${weaknesses[0].score}/100 given its importance to you.`);
  }

  if (score.dealBreakers.violated.length > 0) {
    recommendations.push(`This path violates ${score.dealBreakers.violated.length} deal-breakers - consider alternatives unless these are negotiable.`);
  }

  if (score.interpretation.confidence < 60) {
    recommendations.push('Low confidence in data - gather more information before deciding.');
  }

  // Comparison guidance
  const comparisonGuidance: UtilityExplanation['comparisonGuidance'] = {
    betterAlternatives: [],
    similarOptions: [],
    worseAlternatives: [],
  };

  if (score.overall >= 75) {
    comparisonGuidance.similarOptions.push('Look for paths with similar scores but different strength/weakness profiles');
  } else if (score.overall >= 50) {
    comparisonGuidance.betterAlternatives.push('Seek paths with higher scores in your top 3 attributes');
  } else {
    comparisonGuidance.betterAlternatives.push('This path scores low - explore alternatives with better alignment to your priorities');
  }

  return {
    id: `explanation-${profile.id}-${pathData.careerId}-${Date.now()}`,
    profileId: profile.id,
    careerId: pathData.careerId,
    pathId: pathData.pathId,
    overall: {
      score: score.overall,
      rating: score.interpretation.rating,
      summary: `This career path scores ${score.overall}/100, rated "${score.interpretation.rating}" based on your utility profile.`,
    },
    strengths,
    weaknesses,
    tradeOffs,
    insights,
    recommendations,
    comparisonGuidance,
  };
}

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare multiple career paths using utility scores
 */
export function compareUtilityScores(
  profile: StudentUtilityProfile,
  pathsData: CareerPathUtilityData[],
  config: MAUTConfig = DEFAULT_MAUT_CONFIG
): UtilityComparison {
  // Calculate scores for all paths
  const scoredPaths = pathsData.map(pathData => ({
    pathData,
    score: calculateUtilityScore(profile, pathData, config),
  }));

  // Sort by score
  const ranked = scoredPaths
    .sort((a, b) => b.score.overall - a.score.overall)
    .map((item, index) => ({
      careerId: item.pathData.careerId,
      pathId: item.pathData.pathId,
      score: item.score,
      rank: index + 1,
      advantage: generateAdvantageDescription(item.score, index === 0),
    }));

  // Identify best option
  const best = ranked[0];
  const secondBest = ranked[1];
  const margin = secondBest ? best.score.overall - secondBest.score.overall : 100;

  // Identify key differentiators
  const keyDifferentiators = identifyKeyDifferentiators(scoredPaths);

  // Identify option strengths
  const optionStrengths: UtilityComparison['analysis']['optionStrengths'] = {};
  for (const option of ranked) {
    const topAttrs = Object.entries(option.score.byAttribute)
      .filter(([, data]) => data.rawScore >= 70)
      .sort(([, a], [, b]) => b.rawScore - a.rawScore)
      .slice(0, 3)
      .map(([id]) => id);
    optionStrengths[option.careerId] = topAttrs;
  }

  // Identify trade-offs between top options
  const tradeOffs: UtilityComparison['analysis']['tradeOffs'] = [];
  if (ranked.length >= 2) {
    const top1 = scoredPaths.find(p => p.pathData.careerId === ranked[0].careerId)!;
    const top2 = scoredPaths.find(p => p.pathData.careerId === ranked[1].careerId)!;

    const diffAttrs = Object.keys(top1.score.byAttribute).filter(attrId => {
      const diff = Math.abs(top1.score.byAttribute[attrId].rawScore - top2.score.byAttribute[attrId].rawScore);
      return diff > 15;
    });

    for (const attrId of diffAttrs.slice(0, 2)) {
      const score1 = top1.score.byAttribute[attrId].rawScore;
      const score2 = top2.score.byAttribute[attrId].rawScore;
      const winner = score1 > score2 ? ranked[0].careerId : ranked[1].careerId;

      tradeOffs.push({
        between: [ranked[0].careerId, ranked[1].careerId],
        tradeOff: `${attrId} differs significantly (${Math.abs(score1 - score2)} points)`,
        winner,
      });
    }
  }

  // Generate guidance
  const clearWinner = margin > 15;
  const closeCall = margin < 5;
  const needsMoreInfo = ranked.some(r => r.score.interpretation.confidence < 60);

  let recommendation: string;
  if (clearWinner) {
    recommendation = `${best.careerId} is the clear winner with a ${margin}-point advantage.`;
  } else if (closeCall) {
    recommendation = `Close decision - ${best.careerId} wins by only ${margin} points. Consider secondary factors.`;
  } else if (needsMoreInfo) {
    recommendation = 'Gather more information before deciding - confidence is low on some options.';
  } else {
    recommendation = `${best.careerId} is recommended, but review trade-offs carefully.`;
  }

  return {
    id: `comparison-${profile.id}-${Date.now()}`,
    profileId: profile.id,
    options: ranked,
    bestOption: {
      careerId: best.careerId,
      pathId: best.pathId,
      score: best.score.overall,
      margin,
    },
    analysis: {
      keyDifferentiators,
      optionStrengths,
      tradeOffs,
    },
    guidance: {
      clearWinner,
      needsMoreInfo,
      closeCall,
      recommendation,
    },
  };
}

function generateAdvantageDescription(score: UtilityScore, isBest: boolean): string {
  if (isBest) {
    return `Highest overall utility (${score.overall}/100) with strong alignment to your priorities.`;
  }

  const topCategory = Object.entries(score.byCategory)
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory[1] >= 75) {
    return `Excels in ${topCategory[0]} (${topCategory[1]}/100).`;
  }

  if (score.dealBreakers.violated.length === 0) {
    return 'Meets all your deal-breaker requirements.';
  }

  return `Solid option with ${score.overall}/100 utility score.`;
}

function identifyKeyDifferentiators(
  scoredPaths: Array<{ pathData: CareerPathUtilityData; score: UtilityScore }>
): UtilityAttributeId[] {
  if (scoredPaths.length < 2) return [];

  const differentiators: UtilityAttributeId[] = [];
  const attrIds = Object.keys(scoredPaths[0].score.byAttribute);

  for (const attrId of attrIds) {
    const scores = scoredPaths.map(p => p.score.byAttribute[attrId].rawScore);
    const maxDiff = Math.max(...scores) - Math.min(...scores);

    if (maxDiff > 20) {
      differentiators.push(attrId);
    }
  }

  return differentiators.slice(0, 5);
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a default utility profile with equal weights
 */
export function createDefaultUtilityProfile(
  studentId: string,
  attributes: UtilityAttribute[] = CORE_UTILITY_ATTRIBUTES
): StudentUtilityProfile {
  const equalWeight = 1 / attributes.length;
  const weights: Record<UtilityAttributeId, number> = {};
  const rankings: Record<UtilityAttributeId, number> = {};

  attributes.forEach((attr, index) => {
    weights[attr.id] = equalWeight;
    rankings[attr.id] = index + 1;
  });

  const now = Date.now();

  return {
    id: `profile-${studentId}-${now}`,
    studentId,
    utilityWeights: weights,
    rankings,
    minimumThresholds: {},
    dealBreakers: [],
    tradeOffs: {
      shortTermLongTerm: 50,
      incomeForMeaning: 50,
      stabilityForGrowth: 50,
      statusForFreedom: 50,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
      validated: true,
      consistencyScore: 100,
    },
  };
}

/**
 * Create a utility profile from explicit weights
 */
export function createUtilityProfile(
  studentId: string,
  weights: Record<UtilityAttributeId, number>,
  options: {
    rankings?: Record<UtilityAttributeId, number>;
    minimumThresholds?: Partial<Record<UtilityAttributeId, number>>;
    dealBreakers?: UtilityAttributeId[];
    tradeOffs?: Partial<StudentUtilityProfile['tradeOffs']>;
  } = {}
): StudentUtilityProfile {
  const normalizedWeights = normalizeUtilityWeights(weights);

  // Generate rankings from weights if not provided
  const rankings = options.rankings || Object.entries(normalizedWeights)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [id], index) => {
      acc[id] = index + 1;
      return acc;
    }, {} as Record<UtilityAttributeId, number>);

  const now = Date.now();

  return {
    id: `profile-${studentId}-${now}`,
    studentId,
    utilityWeights: normalizedWeights,
    rankings,
    minimumThresholds: options.minimumThresholds || {},
    dealBreakers: options.dealBreakers || [],
    tradeOffs: {
      shortTermLongTerm: 50,
      incomeForMeaning: 50,
      stabilityForGrowth: 50,
      statusForFreedom: 50,
      ...options.tradeOffs,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
      validated: false,
      consistencyScore: 0,
    },
  };
}

/**
 * Create career path utility data
 */
export function createCareerPathUtilityData(
  careerId: CareerSlug,
  attributes: Record<UtilityAttributeId, number>,
  options: {
    pathId?: string;
    confidence?: Record<UtilityAttributeId, number>;
    dataQuality?: Partial<CareerPathUtilityData['dataQuality']>;
  } = {}
): CareerPathUtilityData {
  const now = Date.now();

  return {
    careerId,
    pathId: options.pathId,
    attributes,
    confidence: options.confidence || Object.fromEntries(
      Object.keys(attributes).map(id => [id, 70])
    ),
    dataQuality: {
      completeness: 80,
      reliability: 75,
      freshness: 90,
      ...options.dataQuality,
    },
  };
}

// ============================================================================
// MAUT FOUNDATION CLASS
// ============================================================================

export class MAUTFoundationV1 {
  private config: MAUTConfig;
  private attributes: UtilityAttribute[];

  constructor(
    config?: Partial<MAUTConfig>,
    attributes: UtilityAttribute[] = CORE_UTILITY_ATTRIBUTES
  ) {
    this.config = { ...DEFAULT_MAUT_CONFIG, ...config };
    this.attributes = attributes;

    // Initialize default weights based on available attributes
    if (Object.keys(this.config.defaultWeights).length === 0) {
      const equalWeight = 1 / attributes.length;
      this.config.defaultWeights = Object.fromEntries(
        attributes.map(attr => [attr.id, equalWeight])
      );
    }
  }

  /**
   * Get all available utility attributes
   */
  getAttributes(): UtilityAttribute[] {
    return [...this.attributes];
  }

  /**
   * Get attribute by ID
   */
  getAttribute(id: UtilityAttributeId): UtilityAttribute | undefined {
    return this.attributes.find(a => a.id === id);
  }

  /**
   * Get attributes by category
   */
  getAttributesByCategory(category: UtilityAttributeCategory): UtilityAttribute[] {
    return this.attributes.filter(a => a.category === category);
  }

  /**
   * Validate a utility profile
   */
  validateProfile(profile: StudentUtilityProfile): UtilityValidationResult {
    return validateUtilityProfile(profile, this.attributes.map(a => a.id), this.config);
  }

  /**
   * Calculate utility score
   */
  calculateScore(profile: StudentUtilityProfile, pathData: CareerPathUtilityData): UtilityScore {
    return calculateUtilityScore(profile, pathData, this.config);
  }

  /**
   * Generate utility explanation
   */
  generateExplanation(
    profile: StudentUtilityProfile,
    pathData: CareerPathUtilityData,
    score: UtilityScore
  ): UtilityExplanation {
    return generateUtilityExplanation(profile, pathData, score, this.attributes);
  }

  /**
   * Compare multiple paths
   */
  comparePaths(profile: StudentUtilityProfile, pathsData: CareerPathUtilityData[]): UtilityComparison {
    return compareUtilityScores(profile, pathsData, this.config);
  }

  /**
   * Create default profile
   */
  createDefaultProfile(studentId: string): StudentUtilityProfile {
    return createDefaultUtilityProfile(studentId, this.attributes);
  }

  /**
   * Create profile from weights
   */
  createProfile(
    studentId: string,
    weights: Record<UtilityAttributeId, number>,
    options?: Parameters<typeof createUtilityProfile>[2]
  ): StudentUtilityProfile {
    return createUtilityProfile(studentId, weights, options);
  }

  /**
   * Normalize weights
   */
  normalizeWeights(weights: Record<UtilityAttributeId, number>): Record<UtilityAttributeId, number> {
    return normalizeUtilityWeights(weights);
  }

  /**
   * Check consistency
   */
  checkConsistency(profile: StudentUtilityProfile): ReturnType<typeof checkUtilityConsistency> {
    return checkUtilityConsistency(profile);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MAUTConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MAUTConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createMAUTFoundation(
  config?: Partial<MAUTConfig>,
  attributes?: UtilityAttribute[]
): MAUTFoundationV1 {
  return new MAUTFoundationV1(config, attributes);
}


