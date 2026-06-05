/**
 * CareerOS Career Graph V2
 *
 * Weighted transition network for career relationships.
 * Upgrades from binary relationships to probabilistic, cost-aware transitions.
 *
 * Every relationship contains:
 * - probability (likelihood of successful transition)
 * - difficulty (effort required)
 * - cost (monetary investment)
 * - time (months required)
 * - skill overlap (transferability)
 * - optionality gain (future pathways unlocked)
 * - future strength (resilience to market changes)
 *
 * Deterministic. Evidence-based. No AI.
 *
 * @module intelligence/career-graph-v2
 * @version 2.0.0
 */

import type { CareerSlug } from '../../domains/career/Career.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for career transition edges
 */
export type TransitionEdgeId = string;

/**
 * Types of career relationships
 */
export type RelationshipType =
  | 'adjacent'      // Similar role, different context
  | 'progression'   // Natural career advancement
  | 'specialization' // Deeper expertise in same domain
  | 'pivot'         // Significant direction change
  | 'cross-domain'  // Moving to entirely different field
  | 'foundational'; // Entry point that enables many paths

/**
 * Confidence level in transition data
 */
export type EvidenceConfidence = 'low' | 'medium' | 'high';

/**
 * Complete weighted transition edge between two careers
 */
export interface CareerTransitionEdge {
  /** Unique identifier */
  id: TransitionEdgeId;

  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Type of relationship */
  relationshipType: RelationshipType;

  /**
   * Probability of successful transition (0.0 - 1.0)
   * 0.0 = impossible
   * 1.0 = extremely common
   *
   * Examples:
   * - Frontend Engineer → Product Manager: 0.72
   * - Doctor → Investment Banker: 0.18
   */
  transitionProbability: number;

  /**
   * Difficulty of transition (0 - 100)
   * 0 = effortless
   * 100 = extremely difficult
   *
   * Examples:
   * - Backend Engineer → ML Engineer: 45
   * - Teacher → Surgeon: 95
   */
  transitionDifficulty: number;

  /**
   * Estimated monetary cost (0 - 100 normalized)
   * Includes: education, certifications, training
   *
   * Scale:
   * 0-20: Minimal cost (< ₹50K)
   * 21-40: Low cost (₹50K - ₹2L)
   * 41-60: Moderate cost (₹2L - ₹10L)
   * 61-80: High cost (₹10L - ₹50L)
   * 81-100: Very high cost (> ₹50L)
   */
  transitionCost: number;

  /**
   * Time required to make transition (months)
   *
   * Examples:
   * - Data Analyst → Product Analyst: 6
   * - Mechanical Engineer → Data Scientist: 18
   * - Teacher → Clinical Psychologist: 48
   */
  transitionTimeMonths: number;

  /**
   * Skill overlap between careers (0.0 - 1.0)
   * Percentage of transferable skills
   *
   * Examples:
   * - Data Analyst → Product Analyst: 0.82
   * - Doctor → Software Engineer: 0.11
   */
  skillOverlap: number;

  /**
   * Optionality gain from this transition (0 - 100)
   * How many future pathways become available after transition
   *
   * Scale:
   * 0-20: Minimal new options
   * 21-40: Some new options
   * 41-60: Moderate expansion
   * 61-80: Significant expansion
   * 81-100: Massive optionality increase
   */
  optionalityGain: number;

  /**
   * Future strength of this transition (0 - 100)
   * How resilient this transition appears in future labor markets
   *
   * Considers:
   * - AI risk to target career
   * - Market demand trajectory
   * - Automation exposure
   * - Industry growth rate
   */
  futureStrength: number;

  /**
   * Confidence in this transition data
   */
  evidenceConfidence: EvidenceConfidence;

  /**
   * Human-readable explanation of this transition
   */
  explanation: string;

  /**
   * Additional metadata
   */
  metadata: {
    /** When this edge was created */
    createdAt: number;

    /** When this edge was last updated */
    updatedAt: number;

    /** Source of this data */
    dataSource: string;

    /** Sample size if based on survey/data */
    sampleSize?: number;

    /** Geographic applicability */
    geography: 'global' | 'india' | 'us' | 'eu' | 'regional';

    /** Time period this data represents */
    timePeriod: string;
  };
}

/**
 * Composite score summarizing transition quality
 */
export interface TransitionOpportunityScore {
  /** Overall score (0 - 100) */
  score: number;

  /** Rating category */
  rating: 'exceptional' | 'excellent' | 'good' | 'moderate' | 'challenging' | 'difficult';

  /** Component breakdown */
  components: {
    probability: number;
    difficulty: number;
    cost: number;
    time: number;
    optionality: number;
    futureStrength: number;
  };

  /** Weights used in calculation */
  weights: {
    probability: number;
    difficulty: number;
    cost: number;
    time: number;
    optionality: number;
    futureStrength: number;
  };

  /** Explanation of scoring */
  explanation: string;
}

/**
 * Transition metrics for analysis
 */
export interface TransitionMetrics {
  /** Total transitions analyzed */
  totalTransitions: number;

  /** Average probability */
  averageProbability: number;

  /** Average difficulty */
  averageDifficulty: number;

  /** Average cost */
  averageCost: number;

  /** Average time */
  averageTimeMonths: number;

  /** Average skill overlap */
  averageSkillOverlap: number;

  /** Distribution by relationship type */
  byType: Record<RelationshipType, number>;

  /** Distribution by confidence level */
  byConfidence: Record<EvidenceConfidence, number>;
}

/**
 * Path through the career graph
 */
export interface CareerTransitionPath {
  /** Path identifier */
  id: string;

  /** Ordered list of edges */
  edges: CareerTransitionEdge[];

  /** Starting career */
  startCareerId: CareerSlug;

  /** Ending career */
  endCareerId: CareerSlug;

  /** Cumulative metrics */
  cumulative: {
    /** Combined probability (multiplicative) */
    probability: number;

    /** Total difficulty (average weighted by time) */
    difficulty: number;

    /** Total cost (sum) */
    cost: number;

    /** Total time in months (sum) */
    timeMonths: number;

    /** Minimum skill overlap (weakest link) */
    minSkillOverlap: number;

    /** Total optionality gain (sum) */
    optionalityGain: number;

    /** Average future strength */
    futureStrength: number;
  };

  /** Path quality score */
  pathScore: number;
}

/**
 * Filter criteria for transition edges
 */
export interface TransitionFilter {
  /** Minimum probability threshold */
  minProbability?: number;

  /** Maximum difficulty threshold */
  maxDifficulty?: number;

  /** Maximum cost threshold */
  maxCost?: number;

  /** Maximum time threshold (months) */
  maxTimeMonths?: number;

  /** Minimum skill overlap threshold */
  minSkillOverlap?: number;

  /** Minimum optionality gain threshold */
  minOptionalityGain?: number;

  /** Minimum future strength threshold */
  minFutureStrength?: number;

  /** Relationship types to include */
  relationshipTypes?: RelationshipType[];

  /** Minimum confidence level */
  minConfidence?: EvidenceConfidence;
}

/**
 * Configuration for graph operations
 */
export interface CareerGraphV2Config {
  /** Default weights for opportunity scoring */
  defaultWeights: {
    probability: number;
    difficulty: number;
    cost: number;
    time: number;
    optionality: number;
    futureStrength: number;
  };

  /** Maximum path length to consider */
  maxPathLength: number;

  /** Minimum path probability to consider viable */
  minPathProbability: number;

  /** Whether to include indirect paths */
  includeIndirectPaths: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CAREER_GRAPH_V2_CONFIG: CareerGraphV2Config = {
  defaultWeights: {
    probability: 0.25,    // 25% - How likely is success
    difficulty: 0.15,     // 15% - How hard is it (inverse)
    cost: 0.15,           // 15% - How expensive (inverse)
    time: 0.15,           // 15% - How long (inverse)
    optionality: 0.15,    // 15% - How many new options
    futureStrength: 0.15, // 15% - How future-proof
  },
  maxPathLength: 5,
  minPathProbability: 0.05,
  includeIndirectPaths: true,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate transition quality score from individual components
 *
 * Combines probability, difficulty, cost, time, optionality, and future strength
 * into a single 0-100 opportunity score.
 */
export function calculateTransitionQuality(
  edge: CareerTransitionEdge,
  weights?: Partial<CareerGraphV2Config['defaultWeights']>
): TransitionOpportunityScore {
  const w = { ...DEFAULT_CAREER_GRAPH_V2_CONFIG.defaultWeights, ...weights };

  // Normalize each component to 0-100 scale
  // Probability: already 0-1, multiply by 100
  const probabilityScore = edge.transitionProbability * 100;

  // Difficulty: invert (lower is better), 100 - difficulty
  const difficultyScore = 100 - edge.transitionDifficulty;

  // Cost: invert (lower is better), 100 - cost
  const costScore = 100 - edge.transitionCost;

  // Time: normalize and invert (shorter is better)
  // Assume 48 months is max reasonable, score = 100 * (1 - time/48)
  const timeScore = Math.max(0, 100 * (1 - edge.transitionTimeMonths / 48));

  // Optionality: already 0-100
  const optionalityScore = edge.optionalityGain;

  // Future strength: already 0-100
  const futureStrengthScore = edge.futureStrength;

  // Calculate weighted composite score
  const score = Math.round(
    probabilityScore * w.probability +
    difficultyScore * w.difficulty +
    costScore * w.cost +
    timeScore * w.time +
    optionalityScore * w.optionality +
    futureStrengthScore * w.futureStrength
  );

  // Determine rating
  let rating: TransitionOpportunityScore['rating'];
  if (score >= 85) rating = 'exceptional';
  else if (score >= 70) rating = 'excellent';
  else if (score >= 55) rating = 'good';
  else if (score >= 40) rating = 'moderate';
  else if (score >= 25) rating = 'challenging';
  else rating = 'difficult';

  // Generate explanation
  const explanation = generateTransitionExplanation(edge, score, rating);

  return {
    score,
    rating,
    components: {
      probability: Math.round(probabilityScore),
      difficulty: Math.round(difficultyScore),
      cost: Math.round(costScore),
      time: Math.round(timeScore),
      optionality: Math.round(optionalityScore),
      futureStrength: Math.round(futureStrengthScore),
    },
    weights: w,
    explanation,
  };
}

/**
 * Calculate transition difficulty from career attributes
 *
 * Estimates difficulty based on:
 * - Education requirements gap
 * - Experience requirements gap
 * - Skill gap
 * - Certification requirements
 */
export function calculateTransitionDifficulty(
  sourceCareer: {
    typicalEducation: string;
    yearsOfExperience: number;
    keySkills: string[];
  },
  targetCareer: {
    typicalEducation: string;
    yearsOfExperience: number;
    keySkills: string[];
    requiredCertifications: string[];
  }
): number {
  let difficulty = 0;

  // Education gap (0-30 points)
  const educationLevels: Record<string, number> = {
    'none': 0,
    'high-school': 1,
    'diploma': 2,
    'bachelors': 3,
    'masters': 4,
    'phd': 5,
    'professional-degree': 5,
    'medical-degree': 6,
  };

  const sourceEdu = educationLevels[sourceCareer.typicalEducation] || 2;
  const targetEdu = educationLevels[targetCareer.typicalEducation] || 2;
  const eduGap = Math.max(0, targetEdu - sourceEdu);
  difficulty += eduGap * 6; // Max 30 points

  // Experience gap (0-25 points)
  const expGap = Math.max(0, targetCareer.yearsOfExperience - sourceCareer.yearsOfExperience);
  difficulty += Math.min(25, expGap * 5);

  // Skill gap (0-30 points)
  const targetSkills = new Set(targetCareer.keySkills);
  const sourceSkills = new Set(sourceCareer.keySkills);
  const missingSkills = [...targetSkills].filter(s => !sourceSkills.has(s));
  const skillGapRatio = missingSkills.length / Math.max(1, targetCareer.keySkills.length);
  difficulty += skillGapRatio * 30;

  // Certification requirements (0-15 points)
  difficulty += Math.min(15, targetCareer.requiredCertifications.length * 3);

  return Math.min(100, Math.round(difficulty));
}

/**
 * Calculate skill transferability between careers
 *
 * Returns 0.0-1.0 representing percentage of skills that transfer
 */
export function calculateSkillTransferability(
  sourceSkills: string[],
  targetSkills: string[]
): number {
  if (targetSkills.length === 0) return 0;
  if (sourceSkills.length === 0) return 0;

  const sourceSet = new Set(sourceSkills.map(s => s.toLowerCase()));
  const targetSet = new Set(targetSkills.map(s => s.toLowerCase()));

  // Count overlapping skills
  let overlap = 0;
  for (const skill of targetSet) {
    // Check for exact match or partial match
    if (sourceSet.has(skill)) {
      overlap += 1;
    } else {
      // Check for related skills (simplified)
      for (const sourceSkill of sourceSet) {
        if (skill.includes(sourceSkill) || sourceSkill.includes(skill)) {
          overlap += 0.5; // Partial credit
          break;
        }
      }
    }
  }

  return Math.min(1, overlap / targetSet.size);
}

/**
 * Calculate optionality gain from a transition
 *
 * Estimates how many new career paths become available
 * after making this transition.
 */
export function calculateOptionalityGain(
  targetCareer: {
    adjacentCareers: string[];
    progressionPaths: string[];
    pivotOptions: string[];
  },
  sourceCareer: {
    adjacentCareers: string[];
    progressionPaths: string[];
    pivotOptions: string[];
  }
): number {
  // Count new options in target not available in source
  const sourceOptions = new Set([
    ...sourceCareer.adjacentCareers,
    ...sourceCareer.progressionPaths,
    ...sourceCareer.pivotOptions,
  ]);

  const targetOptions = new Set([
    ...targetCareer.adjacentCareers,
    ...targetCareer.progressionPaths,
    ...targetCareer.pivotOptions,
  ]);

  // New options = target options not in source
  const newOptions = [...targetOptions].filter(o => !sourceOptions.has(o));

  // Calculate gain ratio
  const baseOptions = Math.max(1, sourceOptions.size);
  const gainRatio = newOptions.length / baseOptions;

  // Convert to 0-100 scale
  // A 50% increase in options = 50 points
  // A 100% increase (doubling) = 100 points
  return Math.min(100, Math.round(gainRatio * 100));
}

/**
 * Calculate future strength of a career transition
 *
 * Considers:
 * - AI/automation risk to target career
 * - Market demand trajectory
 * - Industry growth rate
 * - Skill obsolescence risk
 */
export function calculateFutureStrength(
  targetCareer: {
    aiDisruptionRisk: number; // 0-10
    futureDemand: 'declining' | 'stable' | 'growing' | 'high-growth' | 'booming';
    industryGrowth: 'declining' | 'stable' | 'moderate' | 'rapid';
    skillHalfLife: number; // years until skills become obsolete
  },
  transitionSkills: string[]
): number {
  let strength = 100;

  // AI disruption risk (0-40 point reduction)
  const aiRisk = (targetCareer.aiDisruptionRisk / 10) * 40;
  strength -= aiRisk;

  // Market demand (0-30 points)
  const demandScores: Record<string, number> = {
    'declining': 0,
    'stable': 15,
    'growing': 25,
    'high-growth': 30,
    'booming': 30,
  };
  strength += (demandScores[targetCareer.futureDemand] || 15) - 15;

  // Industry growth (0-20 points)
  const growthScores: Record<string, number> = {
    'declining': 0,
    'stable': 10,
    'moderate': 15,
    'rapid': 20,
  };
  strength += (growthScores[targetCareer.industryGrowth] || 10) - 10;

  // Skill half-life (0-10 points)
  // Longer half-life = more future-proof
  if (targetCareer.skillHalfLife > 0) {
    const skillStability = Math.min(10, targetCareer.skillHalfLife / 2);
    strength += skillStability - 5;
  }

  return Math.max(0, Math.min(100, Math.round(strength)));
}

/**
 * Calculate transition probability from multiple factors
 *
 * Estimates likelihood of successful transition based on:
 * - Historical success rates
 * - Skill overlap
 * - Market conditions
 * - Barriers to entry
 */
export function calculateTransitionProbability(
  factors: {
    skillOverlap: number;
    difficulty: number;
    marketDemandGap: number; // -10 to +10
    barrierToEntry: number; // 0-100
    historicalSuccessRate?: number; // 0-1, optional
  }
): number {
  // Base probability from skill overlap
  let probability = factors.skillOverlap * 0.6;

  // Adjust for difficulty (higher difficulty = lower probability)
  const difficultyPenalty = (factors.difficulty / 100) * 0.3;
  probability -= difficultyPenalty;

  // Adjust for market demand (positive gap = easier transition)
  const demandBonus = (factors.marketDemandGap / 10) * 0.15;
  probability += demandBonus;

  // Adjust for barriers to entry
  const barrierPenalty = (factors.barrierToEntry / 100) * 0.2;
  probability -= barrierPenalty;

  // Incorporate historical data if available
  if (factors.historicalSuccessRate !== undefined) {
    // Weighted average: 70% calculated, 30% historical
    probability = probability * 0.7 + factors.historicalSuccessRate * 0.3;
  }

  // Clamp to valid range
  return Math.max(0, Math.min(1, probability));
}

/**
 * Calculate transition cost estimate
 *
 * Returns normalized cost score (0-100)
 * Based on education, certifications, training, and opportunity cost
 */
export function calculateTransitionCost(
  requirements: {
    additionalEducation: boolean;
    educationCost: number; // in INR
    certifications: string[];
    certificationCost: number; // in INR
    trainingDuration: number; // months
    opportunityCost: number; // lost income in INR
  }
): number {
  // Total monetary cost
  const totalCost = requirements.educationCost + requirements.certificationCost + requirements.opportunityCost;

  // Normalize to 0-100 scale
  // ₹50L+ = 100 points
  // ₹0 = 0 points
  const costScore = Math.min(100, (totalCost / 5000000) * 100);

  // Time cost factor (additional penalty for long transitions)
  const timePenalty = Math.min(20, (requirements.trainingDuration / 24) * 20);

  return Math.min(100, Math.round(costScore + timePenalty));
}

/**
 * Calculate transition time estimate
 *
 * Returns estimated months required for transition
 */
export function calculateTransitionTime(
  factors: {
    educationRequired: boolean;
    educationDuration: number; // months
    experienceRequired: number; // years
    certificationTime: number; // months
    skillGapSize: number; // 0-1
    partTimePossible: boolean;
  }
): number {
  let timeMonths = 0;

  // Education time
  if (factors.educationRequired) {
    timeMonths += factors.educationDuration;
  }

  // Experience time (can be gained while working, so 50% weight)
  timeMonths += (factors.experienceRequired * 12) * 0.5;

  // Certification time
  timeMonths += factors.certificationTime;

  // Skill acquisition time
  // Assume 6 months per 0.1 skill gap
  timeMonths += factors.skillGapSize * 10 * 6;

  // Adjust for part-time possibility
  if (!factors.partTimePossible) {
    // Full-time transition takes longer due to opportunity cost constraints
    timeMonths *= 1.2;
  }

  return Math.round(timeMonths);
}

// ============================================================================
// EDGE FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new career transition edge
 */
export function createTransitionEdge(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  relationshipType: RelationshipType,
  metrics: {
    probability: number;
    difficulty: number;
    cost: number;
    timeMonths: number;
    skillOverlap: number;
    optionalityGain: number;
    futureStrength: number;
  },
  explanation: string,
  confidence: EvidenceConfidence = 'medium',
  dataSource: string = 'calculated'
): CareerTransitionEdge {
  const id = `${sourceCareerId}→${targetCareerId}`;
  const now = Date.now();

  return {
    id,
    sourceCareerId,
    targetCareerId,
    relationshipType,
    transitionProbability: metrics.probability,
    transitionDifficulty: metrics.difficulty,
    transitionCost: metrics.cost,
    transitionTimeMonths: metrics.timeMonths,
    skillOverlap: metrics.skillOverlap,
    optionalityGain: metrics.optionalityGain,
    futureStrength: metrics.futureStrength,
    evidenceConfidence: confidence,
    explanation,
    metadata: {
      createdAt: now,
      updatedAt: now,
      dataSource,
      geography: 'global',
      timePeriod: '2024-2025',
    },
  };
}

/**
 * Create a transition edge with automatic quality calculation
 */
export function createTransitionEdgeWithQuality(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  relationshipType: RelationshipType,
  metrics: {
    probability: number;
    difficulty: number;
    cost: number;
    timeMonths: number;
    skillOverlap: number;
    optionalityGain: number;
    futureStrength: number;
  },
  explanation: string,
  confidence: EvidenceConfidence = 'medium',
  dataSource: string = 'calculated',
  weights?: Partial<CareerGraphV2Config['defaultWeights']>
): { edge: CareerTransitionEdge; quality: TransitionOpportunityScore } {
  const edge = createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    relationshipType,
    metrics,
    explanation,
    confidence,
    dataSource
  );

  const quality = calculateTransitionQuality(edge, weights);

  return { edge, quality };
}

/**
 * Create a high-probability adjacent transition
 */
export function createAdjacentTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  skillOverlap: number,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'adjacent',
    {
      probability: 0.5 + (skillOverlap * 0.4), // 0.5 to 0.9 based on skill overlap
      difficulty: Math.round((1 - skillOverlap) * 50), // Lower difficulty with more overlap
      cost: Math.round((1 - skillOverlap) * 40),
      timeMonths: Math.round((1 - skillOverlap) * 12) + 3,
      skillOverlap,
      optionalityGain: Math.round(skillOverlap * 30) + 10,
      futureStrength: 60, // Neutral default
    },
    explanation,
    'high'
  );
}

/**
 * Create a natural progression transition
 */
export function createProgressionTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  difficulty: number,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'progression',
    {
      probability: 0.7, // Progressions are generally achievable
      difficulty,
      cost: Math.round(difficulty * 0.3),
      timeMonths: Math.round(difficulty * 0.2) + 6,
      skillOverlap: 0.8, // High overlap for progression
      optionalityGain: 20, // Moderate new options
      futureStrength: 70, // Progressions tend to be future-positive
    },
    explanation,
    'high'
  );
}

/**
 * Create a specialization transition (deepening expertise)
 */
export function createSpecializationTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  difficulty: number,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'specialization',
    {
      probability: 0.6,
      difficulty,
      cost: Math.round(difficulty * 0.4),
      timeMonths: Math.round(difficulty * 0.25) + 12,
      skillOverlap: 0.7,
      optionalityGain: 15, // Specialization reduces optionality
      futureStrength: 75, // But increases future strength in domain
    },
    explanation,
    'medium'
  );
}

/**
 * Create a pivot transition (significant direction change)
 */
export function createPivotTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  skillOverlap: number,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'pivot',
    {
      probability: 0.2 + (skillOverlap * 0.3), // 0.2 to 0.5
      difficulty: Math.round((1 - skillOverlap) * 80) + 20,
      cost: Math.round((1 - skillOverlap) * 60) + 20,
      timeMonths: Math.round((1 - skillOverlap) * 24) + 6,
      skillOverlap,
      optionalityGain: Math.round(skillOverlap * 40) + 20, // Pivots can open new worlds
      futureStrength: 50, // Unknown future impact
    },
    explanation,
    'low'
  );
}

/**
 * Create a cross-domain transition (major field change)
 */
export function createCrossDomainTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  skillOverlap: number,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'cross-domain',
    {
      probability: 0.1 + (skillOverlap * 0.2), // 0.1 to 0.3
      difficulty: Math.round((1 - skillOverlap) * 90) + 10,
      cost: Math.round((1 - skillOverlap) * 80) + 20,
      timeMonths: Math.round((1 - skillOverlap) * 36) + 12,
      skillOverlap,
      optionalityGain: Math.round(skillOverlap * 50) + 30, // Major optionality shift
      futureStrength: 40, // Uncertain
    },
    explanation,
    'low'
  );
}

/**
 * Create a foundational transition (entry point enabling many paths)
 */
export function createFoundationalTransition(
  sourceCareerId: CareerSlug,
  targetCareerId: CareerSlug,
  explanation: string
): CareerTransitionEdge {
  return createTransitionEdge(
    sourceCareerId,
    targetCareerId,
    'foundational',
    {
      probability: 0.8, // Entry points are designed to be accessible
      difficulty: 40,
      cost: 30,
      timeMonths: 6,
      skillOverlap: 0.5, // Foundational skills are transferable
      optionalityGain: 80, // Massive optionality from entry points
      futureStrength: 70,
    },
    explanation,
    'high'
  );
}

// ============================================================================
// PATH CALCULATIONS
// ============================================================================

/**
 * Calculate cumulative metrics for a path through multiple transitions
 */
export function calculatePathMetrics(
  edges: CareerTransitionEdge[]
): CareerTransitionPath['cumulative'] {
  if (edges.length === 0) {
    return {
      probability: 1,
      difficulty: 0,
      cost: 0,
      timeMonths: 0,
      minSkillOverlap: 1,
      optionalityGain: 0,
      futureStrength: 0,
    };
  }

  // Combined probability (multiplicative)
  const probability = edges.reduce(
    (acc, edge) => acc * edge.transitionProbability,
    1
  );

  // Total cost (sum)
  const cost = edges.reduce((acc, edge) => acc + edge.transitionCost, 0);

  // Total time (sum)
  const timeMonths = edges.reduce((acc, edge) => acc + edge.transitionTimeMonths, 0);

  // Total optionality gain (sum)
  const optionalityGain = edges.reduce((acc, edge) => acc + edge.optionalityGain, 0);

  // Average difficulty (weighted by time)
  const totalTime = edges.reduce((acc, edge) => acc + edge.transitionTimeMonths, 0);
  const difficulty = totalTime > 0
    ? edges.reduce((acc, edge) => acc + edge.transitionDifficulty * edge.transitionTimeMonths, 0) / totalTime
    : 0;

  // Minimum skill overlap (weakest link)
  const minSkillOverlap = Math.min(...edges.map(e => e.skillOverlap));

  // Average future strength
  const futureStrength = edges.reduce((acc, edge) => acc + edge.futureStrength, 0) / edges.length;

  return {
    probability: Math.max(0, Math.min(1, probability)),
    difficulty: Math.round(difficulty),
    cost: Math.round(cost),
    timeMonths: Math.round(timeMonths),
    minSkillOverlap: Math.round(minSkillOverlap * 100) / 100,
    optionalityGain: Math.round(optionalityGain),
    futureStrength: Math.round(futureStrength),
  };
}

/**
 * Calculate overall path quality score
 */
export function calculatePathQuality(
  path: CareerTransitionPath,
  weights?: Partial<CareerGraphV2Config['defaultWeights']>
): number {
  const w = { ...DEFAULT_CAREER_GRAPH_V2_CONFIG.defaultWeights, ...weights };

  const { cumulative } = path;

  // Normalize components
  const probabilityScore = cumulative.probability * 100;
  const difficultyScore = 100 - cumulative.difficulty;
  const costScore = 100 - Math.min(100, cumulative.cost);
  const timeScore = Math.max(0, 100 * (1 - cumulative.timeMonths / 120)); // 10 years max
  const optionalityScore = Math.min(100, cumulative.optionalityGain);
  const futureStrengthScore = cumulative.futureStrength;

  // Weighted composite
  return Math.round(
    probabilityScore * w.probability +
    difficultyScore * w.difficulty +
    costScore * w.cost +
    timeScore * w.time +
    optionalityScore * w.optionality +
    futureStrengthScore * w.futureStrength
  );
}

// ============================================================================
// FILTERING & SEARCH
// ============================================================================

/**
 * Filter edges based on criteria
 */
export function filterTransitions(
  edges: CareerTransitionEdge[],
  filter: TransitionFilter
): CareerTransitionEdge[] {
  return edges.filter(edge => {
    if (filter.minProbability !== undefined && edge.transitionProbability < filter.minProbability) {
      return false;
    }
    if (filter.maxDifficulty !== undefined && edge.transitionDifficulty > filter.maxDifficulty) {
      return false;
    }
    if (filter.maxCost !== undefined && edge.transitionCost > filter.maxCost) {
      return false;
    }
    if (filter.maxTimeMonths !== undefined && edge.transitionTimeMonths > filter.maxTimeMonths) {
      return false;
    }
    if (filter.minSkillOverlap !== undefined && edge.skillOverlap < filter.minSkillOverlap) {
      return false;
    }
    if (filter.minOptionalityGain !== undefined && edge.optionalityGain < filter.minOptionalityGain) {
      return false;
    }
    if (filter.minFutureStrength !== undefined && edge.futureStrength < filter.minFutureStrength) {
      return false;
    }
    if (filter.relationshipTypes !== undefined && !filter.relationshipTypes.includes(edge.relationshipType)) {
      return false;
    }
    if (filter.minConfidence !== undefined) {
      const confidenceLevels: Record<EvidenceConfidence, number> = { low: 1, medium: 2, high: 3 };
      if (confidenceLevels[edge.evidenceConfidence] < confidenceLevels[filter.minConfidence]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Find best transitions from a given career
 */
export function findBestTransitions(
  edges: CareerTransitionEdge[],
  sourceCareerId: CareerSlug,
  limit: number = 5,
  weights?: Partial<CareerGraphV2Config['defaultWeights']>
): Array<{ edge: CareerTransitionEdge; quality: TransitionOpportunityScore }> {
  const sourceEdges = edges.filter(e => e.sourceCareerId === sourceCareerId);

  const scored = sourceEdges.map(edge => ({
    edge,
    quality: calculateTransitionQuality(edge, weights),
  }));

  return scored
    .sort((a, b) => b.quality.score - a.quality.score)
    .slice(0, limit);
}

/**
 * Find viable paths between two careers
 */
export function findViablePaths(
  edges: CareerTransitionEdge[],
  startCareerId: CareerSlug,
  endCareerId: CareerSlug,
  maxLength: number = 3,
  minProbability: number = 0.05
): CareerTransitionPath[] {
  const paths: CareerTransitionPath[] = [];

  // Build adjacency map
  const adjacency = new Map<CareerSlug, CareerTransitionEdge[]>();
  for (const edge of edges) {
    const existing = adjacency.get(edge.sourceCareerId) || [];
    existing.push(edge);
    adjacency.set(edge.sourceCareerId, existing);
  }

  // DFS to find paths
  function dfs(
    current: CareerSlug,
    target: CareerSlug,
    path: CareerTransitionEdge[],
    visited: Set<CareerSlug>
  ) {
    if (current === target) {
      const cumulative = calculatePathMetrics(path);
      if (cumulative.probability >= minProbability) {
        const fullPath: CareerTransitionPath = {
          id: `${startCareerId}→${endCareerId}-${paths.length}`,
          edges: [...path],
          startCareerId,
          endCareerId,
          cumulative,
          pathScore: 0, // Will calculate below
        };
        fullPath.pathScore = calculatePathQuality(fullPath);
        paths.push(fullPath);
      }
      return;
    }

    if (path.length >= maxLength) return;
    if (visited.has(current)) return;

    visited.add(current);

    const neighbors = adjacency.get(current) || [];
    for (const edge of neighbors) {
      // Pruning: skip if probability too low
      const currentProb = path.reduce((acc, e) => acc * e.transitionProbability, 1);
      if (currentProb * edge.transitionProbability < minProbability) continue;

      path.push(edge);
      dfs(edge.targetCareerId, target, path, visited);
      path.pop();
    }

    visited.delete(current);
  }

  dfs(startCareerId, endCareerId, [], new Set());

  return paths.sort((a, b) => b.pathScore - a.pathScore);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate human-readable explanation for transition
 */
function generateTransitionExplanation(
  edge: CareerTransitionEdge,
  score: number,
  rating: string
): string {
  const parts: string[] = [];

  // Overall assessment
  parts.push(`This is a ${rating} transition opportunity (${score}/100).`);

  // Probability
  if (edge.transitionProbability >= 0.7) {
    parts.push(`The transition is highly achievable with a ${Math.round(edge.transitionProbability * 100)}% success rate.`);
  } else if (edge.transitionProbability >= 0.4) {
    parts.push(`The transition is moderately achievable with a ${Math.round(edge.transitionProbability * 100)}% success rate.`);
  } else {
    parts.push(`The transition is challenging with only a ${Math.round(edge.transitionProbability * 100)}% success rate.`);
  }

  // Difficulty and time
  if (edge.transitionDifficulty < 30) {
    parts.push(`It requires relatively low effort (${edge.transitionDifficulty}/100 difficulty).`);
  } else if (edge.transitionDifficulty < 60) {
    parts.push(`It requires moderate effort (${edge.transitionDifficulty}/100 difficulty).`);
  } else {
    parts.push(`It requires significant effort (${edge.transitionDifficulty}/100 difficulty).`);
  }

  // Skill overlap
  if (edge.skillOverlap >= 0.7) {
    parts.push(`Your existing skills transfer well (${Math.round(edge.skillOverlap * 100)}% overlap).`);
  } else if (edge.skillOverlap >= 0.4) {
    parts.push(`Some skills transfer (${Math.round(edge.skillOverlap * 100)}% overlap), but you'll need to develop new capabilities.`);
  } else {
    parts.push(`This is largely a new skill set (${Math.round(edge.skillOverlap * 100)}% overlap), requiring significant retraining.`);
  }

  // Optionality
  if (edge.optionalityGain >= 60) {
    parts.push(`This transition significantly expands your future career options (+${edge.optionalityGain} optionality points).`);
  } else if (edge.optionalityGain >= 30) {
    parts.push(`This transition moderately expands your future options (+${edge.optionalityGain} optionality points).`);
  }

  // Future strength
  if (edge.futureStrength >= 70) {
    parts.push(`The target career appears resilient to future market changes (${edge.futureStrength}/100 future strength).`);
  } else if (edge.futureStrength <= 40) {
    parts.push(`Note: The target career faces some future uncertainty (${edge.futureStrength}/100 future strength).`);
  }

  return parts.join(' ');
}

/**
 * Compare two transitions
 */
export function compareTransitions(
  edgeA: CareerTransitionEdge,
  edgeB: CareerTransitionEdge,
  weights?: Partial<CareerGraphV2Config['defaultWeights']>
): {
  better: CareerTransitionEdge;
  worse: CareerTransitionEdge;
  scoreDifference: number;
  explanation: string;
} {
  const qualityA = calculateTransitionQuality(edgeA, weights);
  const qualityB = calculateTransitionQuality(edgeB, weights);

  const better = qualityA.score >= qualityB.score ? edgeA : edgeB;
  const worse = qualityA.score >= qualityB.score ? edgeB : edgeA;
  const scoreDifference = Math.abs(qualityA.score - qualityB.score);

  const explanation = `${better.sourceCareerId} → ${better.targetCareerId} is ${scoreDifference} points better than ${worse.sourceCareerId} → ${worse.targetCareerId}. ` +
    `Key differences: ${generateComparisonDetails(better, worse)}`;

  return { better, worse, scoreDifference, explanation };
}

function generateComparisonDetails(
  better: CareerTransitionEdge,
  worse: CareerTransitionEdge
): string {
  const differences: string[] = [];

  if (better.transitionProbability > worse.transitionProbability + 0.1) {
    differences.push(`${Math.round((better.transitionProbability - worse.transitionProbability) * 100)}% higher success probability`);
  }
  if (better.transitionDifficulty < worse.transitionDifficulty - 10) {
    differences.push(`${worse.transitionDifficulty - better.transitionDifficulty} points lower difficulty`);
  }
  if (better.skillOverlap > worse.skillOverlap + 0.15) {
    differences.push(`${Math.round((better.skillOverlap - worse.skillOverlap) * 100)}% more skill transferability`);
  }
  if (better.optionalityGain > worse.optionalityGain + 15) {
    differences.push(`${better.optionalityGain - worse.optionalityGain} more optionality points`);
  }

  return differences.length > 0 ? differences.join(', ') : 'better overall balance of factors';
}

/**
 * Calculate aggregate metrics for a set of transitions
 */
export function calculateTransitionMetrics(
  edges: CareerTransitionEdge[]
): TransitionMetrics {
  if (edges.length === 0) {
    return {
      totalTransitions: 0,
      averageProbability: 0,
      averageDifficulty: 0,
      averageCost: 0,
      averageTimeMonths: 0,
      averageSkillOverlap: 0,
      byType: { adjacent: 0, progression: 0, specialization: 0, pivot: 0, 'cross-domain': 0, foundational: 0 },
      byConfidence: { low: 0, medium: 0, high: 0 },
    };
  }

  const byType: Record<RelationshipType, number> = {
    adjacent: 0, progression: 0, specialization: 0, pivot: 0, 'cross-domain': 0, foundational: 0
  };
  const byConfidence: Record<EvidenceConfidence, number> = { low: 0, medium: 0, high: 0 };

  for (const edge of edges) {
    byType[edge.relationshipType]++;
    byConfidence[edge.evidenceConfidence]++;
  }

  return {
    totalTransitions: edges.length,
    averageProbability: Math.round(edges.reduce((a, b) => a + b.transitionProbability, 0) / edges.length * 100) / 100,
    averageDifficulty: Math.round(edges.reduce((a, b) => a + b.transitionDifficulty, 0) / edges.length),
    averageCost: Math.round(edges.reduce((a, b) => a + b.transitionCost, 0) / edges.length),
    averageTimeMonths: Math.round(edges.reduce((a, b) => a + b.transitionTimeMonths, 0) / edges.length),
    averageSkillOverlap: Math.round(edges.reduce((a, b) => a + b.skillOverlap, 0) / edges.length * 100) / 100,
    byType,
    byConfidence,
  };
}

// ============================================================================
// MAIN CAREER GRAPH V2 CLASS
// ============================================================================

export class CareerGraphV2 {
  private edges: Map<TransitionEdgeId, CareerTransitionEdge> = new Map();
  private config: CareerGraphV2Config;

  constructor(config?: Partial<CareerGraphV2Config>) {
    this.config = { ...DEFAULT_CAREER_GRAPH_V2_CONFIG, ...config };
  }

  /**
   * Add a transition edge to the graph
   */
  addEdge(edge: CareerTransitionEdge): void {
    this.edges.set(edge.id, edge);
  }

  /**
   * Add multiple edges to the graph
   */
  addEdges(edges: CareerTransitionEdge[]): void {
    for (const edge of edges) {
      this.edges.set(edge.id, edge);
    }
  }

  /**
   * Get an edge by ID
   */
  getEdge(id: TransitionEdgeId): CareerTransitionEdge | undefined {
    return this.edges.get(id);
  }

  /**
   * Get all edges from a source career
   */
  getEdgesFrom(sourceCareerId: CareerSlug): CareerTransitionEdge[] {
    return [...this.edges.values()].filter(e => e.sourceCareerId === sourceCareerId);
  }

  /**
   * Get all edges to a target career
   */
  getEdgesTo(targetCareerId: CareerSlug): CareerTransitionEdge[] {
    return [...this.edges.values()].filter(e => e.targetCareerId === targetCareerId);
  }

  /**
   * Get all edges in the graph
   */
  getAllEdges(): CareerTransitionEdge[] {
    return [...this.edges.values()];
  }

  /**
   * Calculate quality score for an edge
   */
  calculateQuality(
    edgeId: TransitionEdgeId,
    weights?: Partial<CareerGraphV2Config['defaultWeights']>
  ): TransitionOpportunityScore | null {
    const edge = this.edges.get(edgeId);
    if (!edge) return null;
    return calculateTransitionQuality(edge, weights);
  }

  /**
   * Find best transitions from a career
   */
  findBestTransitions(
    sourceCareerId: CareerSlug,
    limit: number = 5,
    filter?: TransitionFilter
  ): Array<{ edge: CareerTransitionEdge; quality: TransitionOpportunityScore }> {
    let edges = this.getEdgesFrom(sourceCareerId);

    if (filter) {
      edges = filterTransitions(edges, filter);
    }

    return edges
      .map(edge => ({
        edge,
        quality: calculateTransitionQuality(edge, this.config.defaultWeights),
      }))
      .sort((a, b) => b.quality.score - a.quality.score)
      .slice(0, limit);
  }

  /**
   * Find viable paths between two careers
   */
  findPaths(
    startCareerId: CareerSlug,
    endCareerId: CareerSlug,
    maxLength: number = this.config.maxPathLength
  ): CareerTransitionPath[] {
    return findViablePaths(
      this.getAllEdges(),
      startCareerId,
      endCareerId,
      maxLength,
      this.config.minPathProbability
    );
  }

  /**
   * Get graph metrics
   */
  getMetrics(): TransitionMetrics {
    return calculateTransitionMetrics(this.getAllEdges());
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    totalEdges: number;
    uniqueSources: number;
    uniqueTargets: number;
    averageQuality: number;
  } {
    const edges = this.getAllEdges();
    const sources = new Set(edges.map(e => e.sourceCareerId));
    const targets = new Set(edges.map(e => e.targetCareerId));

    const averageQuality = edges.length > 0
      ? edges.reduce((sum, e) => sum + calculateTransitionQuality(e, this.config.defaultWeights).score, 0) / edges.length
      : 0;

    return {
      totalEdges: edges.length,
      uniqueSources: sources.size,
      uniqueTargets: targets.size,
      averageQuality: Math.round(averageQuality),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createCareerGraphV2(
  config?: Partial<CareerGraphV2Config>
): CareerGraphV2 {
  return new CareerGraphV2(config);
}


