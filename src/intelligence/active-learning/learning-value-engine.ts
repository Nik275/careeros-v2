/**
 * CareerOS Learning Value Engine
 * 
 * Estimates how much each student can improve CareerOS.
 * Not all student outcomes are equally valuable - we prioritize:
 * - High uncertainty students
 * - Contradictory profiles
 * - Rare pathways
 * - Surprising outcomes
 * - Unstable recommendations
 * 
 * Core Philosophy: Data collection is expensive. Learn from the most
 * informative students first.
 */

import {
  LearningValueScore,
  LearningValueTier,
  LearningValueComponents,
  LearningAction,
  LearningActionType,
  UncertaintyProfile,
  UncertaintyLevel,
  StudentProfile,
  LearningValueEngineConfig,
  ActiveLearningMetrics,
  BoundaryProximity,
  EvidenceGap,
  StudentId,
} from './active-learning-types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_LEARNING_VALUE_CONFIG: LearningValueEngineConfig = {
  uncertaintyWeight: 0.25,
  volatilityWeight: 0.2,
  rarityWeight: 0.15,
  contradictionWeight: 0.2,
  noveltyWeight: 0.15,
  diversityWeight: 0.05,
  minimumInformationGain: 0.1,
};

// ============================================================================
// LEARNING VALUE COMPONENT CALCULATIONS
// ============================================================================

interface LearningValueContext {
  studentProfile: StudentProfile;
  uncertaintyProfile: UncertaintyProfile;
  historicalRecommendations: { recommendationId: string; score: number; timestamp: Date }[];
  similarStudents: string[];
  careerPathways: string[];
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[];
  dataPoints: number;
  existingTrainingDataSize: number;
  boundaryProximity?: BoundaryProximity[];
  evidenceGaps?: EvidenceGap[];
}

/**
 * Calculate uncertainty component of learning value
 * Higher uncertainty = more potential for learning
 */
export function calculateUncertaintyComponent(
  uncertaintyProfile: UncertaintyProfile
): number {
  const compositeUncertainty = uncertaintyProfile.compositeUncertainty.value;
  
  // Confidence in uncertainty estimate affects learning value
  // High uncertainty with high confidence = very valuable
  // High uncertainty with low confidence = less valuable (might just be noise)
  const uncertaintyConfidence = uncertaintyProfile.compositeUncertainty.confidence;
  
  // Scale uncertainty by confidence
  const adjustedUncertainty = compositeUncertainty * (0.5 + 0.5 * uncertaintyConfidence);
  
  // Boost learning value for very high uncertainty
  const boostFactor = compositeUncertainty > 0.7 ? 1.2 : 1.0;
  
  return Math.min(adjustedUncertainty * boostFactor, 1);
}

/**
 * Calculate volatility component - unstable recommendations provide learning opportunities
 */
export function calculateVolatilityComponent(
  historicalRecommendations: { recommendationId: string; score: number; timestamp: Date }[]
): number {
  if (historicalRecommendations.length < 2) {
    return 0.5; // Unknown volatility, moderate learning potential
  }
  
  // Sort by timestamp
  const sorted = [...historicalRecommendations].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Calculate recommendation churn
  let changes = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].recommendationId !== sorted[i - 1].recommendationId) {
      changes++;
    }
  }
  
  const churnRate = changes / (sorted.length - 1);
  
  // Calculate score variance
  const scores = sorted.map(r => r.score);
  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - meanScore, 2), 0) / scores.length;
  
  // High churn OR high variance indicates volatility
  const volatilityScore = Math.min(
    (churnRate * 0.6 + Math.sqrt(variance) * 0.4) * 1.5,
    1
  );
  
  return volatilityScore;
}

/**
 * Calculate rarity component - rare profiles teach us about edge cases
 */
export function calculateRarityComponent(
  similarStudents: string[],
  careerPathways: string[],
  existingTrainingDataSize: number
): number {
  // Fewer similar students = higher rarity = more learning value
  const similarityRarity = Math.max(0, 1 - similarStudents.length / 100);
  
  // Rare career pathways
  const pathwayRarity = careerPathways.length > 0
    ? careerPathways.reduce((sum, pathway) => {
        // Assume we have a function to get pathway frequency
        // Lower frequency = higher rarity
        const frequency = getPathwayFrequency(pathway);
        return sum + (1 - frequency);
      }, 0) / careerPathways.length
    : 0.5;
  
  // Overall data scarcity in the system
  const dataScarcity = Math.max(0, 1 - existingTrainingDataSize / 10000);
  
  // Combine factors
  const rarityScore = 
    similarityRarity * 0.4 +
    pathwayRarity * 0.4 +
    dataScarcity * 0.2;
  
  return Math.min(rarityScore, 1);
}

/**
 * Helper function to get pathway frequency (placeholder)
 */
function getPathwayFrequency(pathwayId: string): number {
  // In production, this would query the database
  // For now, return a mock value based on pathway characteristics
  const commonPathways = ['software_engineering', 'data_science', 'medicine', 'finance'];
  return commonPathways.includes(pathwayId) ? 0.8 : 0.3;
}

/**
 * Calculate contradiction component - contradictory profiles challenge our assumptions
 */
export function calculateContradictionComponent(
  studentProfile: StudentProfile,
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[]
): number {
  const contradictions: number[] = [];
  
  // Check for skill-interest contradictions
  if (studentProfile.skills && studentProfile.interests) {
    const skillInterestContradiction = detectSkillInterestContradiction(
      studentProfile.skills,
      studentProfile.interests
    );
    contradictions.push(skillInterestContradiction);
  }
  
  // Check for value-behavior contradictions
  if (studentProfile.values && outcomeHistory.length > 0) {
    const valueBehaviorContradiction = detectValueBehaviorContradiction(
      studentProfile.values,
      outcomeHistory
    );
    contradictions.push(valueBehaviorContradiction);
  }
  
  // Check for expectation-reality contradictions
  if (outcomeHistory.length > 0) {
    const expectationRealityContradiction = detectExpectationRealityContradiction(
      studentProfile,
      outcomeHistory
    );
    contradictions.push(expectationRealityContradiction);
  }
  
  // Aggregate contradiction intensity
  if (contradictions.length === 0) {
    return 0.3; // Default moderate contradiction (unknown)
  }
  
  const maxContradiction = Math.max(...contradictions);
  const avgContradiction = contradictions.reduce((a, b) => a + b, 0) / contradictions.length;
  
  // High max OR high average indicates strong contradiction
  return Math.min(maxContradiction * 0.7 + avgContradiction * 0.3, 1);
}

/**
 * Detect contradictions between skills and interests
 */
function detectSkillInterestContradiction(
  skills: string[],
  interests: string[]
): number {
  // Define skill-interest mappings that typically align
  const alignedPairs: Record<string, string[]> = {
    'programming': ['technology', 'problem_solving', 'innovation'],
    'design': ['creativity', 'art', 'visual_thinking'],
    'writing': ['communication', 'storytelling', 'research'],
    'analysis': ['research', 'data', 'problem_solving'],
    'leadership': ['management', 'teamwork', 'influence'],
  };
  
  let contradictions = 0;
  let totalChecks = 0;
  
  for (const skill of skills) {
    const alignedInterests = alignedPairs[skill] || [];
    const hasAlignedInterest = interests.some(i => 
      alignedInterests.some(ai => i.toLowerCase().includes(ai))
    );
    
    if (!hasAlignedInterest && interests.length > 0) {
      contradictions++;
    }
    totalChecks++;
  }
  
  return totalChecks > 0 ? contradictions / totalChecks : 0;
}

/**
 * Detect contradictions between stated values and actual behavior
 */
function detectValueBehaviorContradiction(
  values: string[],
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[]
): number {
  // Define value-outcome alignments
  const valueOutcomeAlignments: Record<string, string[]> = {
    'work_life_balance': ['flexible_schedule', 'remote_work', 'reasonable_hours'],
    'high_income': ['high_salary', 'bonus', 'stock_options'],
    'social_impact': ['nonprofit', 'education', 'healthcare', 'environmental'],
    'creativity': ['design', 'art', 'innovation', 'entrepreneurship'],
    'stability': ['government', 'large_corporation', 'tenure'],
  };
  
  let misalignments = 0;
  let totalChecks = 0;
  
  for (const value of values) {
    const alignedOutcomes = valueOutcomeAlignments[value] || [];
    
    for (const outcome of outcomeHistory) {
      const isAligned = alignedOutcomes.some(ao => 
        outcome.outcome.toLowerCase().includes(ao)
      );
      
      // If outcome contradicts value and was unsuccessful, that's a contradiction
      if (!isAligned && !outcome.success) {
        misalignments++;
      }
      totalChecks++;
    }
  }
  
  return totalChecks > 0 ? Math.min(misalignments / totalChecks * 2, 1) : 0;
}

/**
 * Detect contradictions between expectations and reality
 */
function detectExpectationRealityContradiction(
  studentProfile: StudentProfile,
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[]
): number {
  // High expectations but poor outcomes = contradiction
  const expectations: Record<string, unknown> = studentProfile.careerExpectations || {};
  const expectationLevel = Object.values(expectations).reduce(
    (sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0),
    0
  ) / Math.max(Object.keys(expectations).length, 1);
  
  const successRate = outcomeHistory.filter(o => o.success).length / outcomeHistory.length;
  
  // High expectations + low success = high contradiction
  if (expectationLevel > 0.7 && successRate < 0.3) {
    return 0.9;
  }
  
  // Low expectations + high success = moderate contradiction (pleasant surprise)
  if (expectationLevel < 0.3 && successRate > 0.7) {
    return 0.5;
  }
  
  return Math.abs(expectationLevel - successRate);
}

/**
 * Calculate novelty component - novel situations expand our understanding
 */
export function calculateNoveltyComponent(
  studentProfile: StudentProfile,
  careerPathways: string[],
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[]
): number {
  // Novel career combinations
  const careerNovelty = calculateCareerCombinationNovelty(careerPathways);
  
  // Novel background combinations
  const backgroundNovelty = calculateBackgroundNovelty(studentProfile);
  
  // Novel outcomes
  const outcomeNovelty = calculateOutcomeNovelty(outcomeHistory);
  
  // Combine novelty scores
  const noveltyScore = 
    careerNovelty * 0.4 +
    backgroundNovelty * 0.35 +
    outcomeNovelty * 0.25;
  
  return Math.min(noveltyScore, 1);
}

/**
 * Calculate novelty of career pathway combinations
 */
function calculateCareerCombinationNovelty(pathways: string[]): number {
  if (pathways.length < 2) {
    return 0.3; // Single pathway, moderate novelty
  }
  
  // Check for unusual combinations
  const unusualCombinations = [
    ['technology', 'arts'],
    ['science', 'business'],
    ['medicine', 'technology'],
    ['finance', 'social_impact'],
    ['engineering', 'policy'],
  ];
  
  let noveltySum = 0;
  for (let i = 0; i < pathways.length; i++) {
    for (let j = i + 1; j < pathways.length; j++) {
      const pair = [pathways[i], pathways[j]];
      const isUnusual = unusualCombinations.some(uc => 
        (pair[0].includes(uc[0]) && pair[1].includes(uc[1])) ||
        (pair[0].includes(uc[1]) && pair[1].includes(uc[0]))
      );
      if (isUnusual) noveltySum += 1;
    }
  }
  
  const maxPairs = (pathways.length * (pathways.length - 1)) / 2;
  return Math.min(noveltySum / Math.max(maxPairs, 1) * 2, 1);
}

/**
 * Calculate novelty of student background
 */
function calculateBackgroundNovelty(studentProfile: StudentProfile): number {
  let noveltyFactors = 0;
  let totalFactors = 0;
  
  // Unusual education background
  if (studentProfile.education) {
    const unusualFields = ['interdisciplinary', 'self_taught', 'bootcamp', 'unconventional'];
    const isUnusualEd = unusualFields.some(f => 
      JSON.stringify(studentProfile.education).toLowerCase().includes(f)
    );
    if (isUnusualEd) noveltyFactors += 1;
    totalFactors++;
  }
  
  // Diverse experience
  if (studentProfile.experience) {
    const diverseSectors = new Set(
      studentProfile.experience.map(e => e.sector || 'unknown')
    ).size;
    if (diverseSectors > 3) noveltyFactors += 1;
    totalFactors++;
  }
  
  // Unique skill combinations
  if (studentProfile.skills) {
    const rareSkills = ['ai_ethics', 'bioinformatics', 'space_law', 'neurodesign'];
    const hasRareSkill = studentProfile.skills.some(s => 
      rareSkills.includes(s.toLowerCase())
    );
    if (hasRareSkill) noveltyFactors += 1;
    totalFactors++;
  }
  
  return totalFactors > 0 ? noveltyFactors / totalFactors : 0.3;
}

/**
 * Calculate novelty of outcomes
 */
function calculateOutcomeNovelty(
  outcomeHistory: { outcome: string; timestamp: Date; success: boolean }[]
): number {
  if (outcomeHistory.length === 0) return 0.5;
  
  // Check for surprising outcomes
  const surprisingOutcomes = [
    'career_pivot_success',
    'entrepreneurship_success',
    'unconventional_path_success',
    'late_career_change_success',
  ];
  
  const surprisingCount = outcomeHistory.filter(o => 
    surprisingOutcomes.some(so => o.outcome.toLowerCase().includes(so))
  ).length;
  
  return Math.min(surprisingCount / outcomeHistory.length * 2, 1);
}

/**
 * Calculate diversity component - how different from existing training data
 */
export function calculateDiversityComponent(
  studentProfile: StudentProfile,
  existingTrainingDataSize: number,
  dataPoints: number
): number {
  // More data points from this student = less additional diversity value
  const dataSaturation = Math.min(dataPoints / 50, 1);
  const saturationPenalty = 1 - dataSaturation * 0.5;
  
  // Profile diversity based on unique characteristics
  let uniqueCharacteristics = 0;
  let totalCharacteristics = 0;
  
  // Check unique demographics
  if (studentProfile.demographics) {
    // Underrepresented demographics add diversity
    const underrepresented = ['rural', 'first_generation', 'non_traditional_age'];
    const hasUnderrepresented = underrepresented.some(d => 
      JSON.stringify(studentProfile.demographics).toLowerCase().includes(d)
    );
    if (hasUnderrepresented) uniqueCharacteristics += 1;
    totalCharacteristics++;
  }
  
  // Check unique challenges
  if (studentProfile.challenges) {
    uniqueCharacteristics += Math.min(studentProfile.challenges.length / 3, 1);
    totalCharacteristics++;
  }
  
  // Check unique constraints
  if (studentProfile.constraints) {
    uniqueCharacteristics += Math.min(studentProfile.constraints.length / 3, 1);
    totalCharacteristics++;
  }
  
  const profileDiversity = totalCharacteristics > 0 
    ? uniqueCharacteristics / totalCharacteristics 
    : 0.3;
  
  // System diversity need decreases as training data grows
  const systemDiversityNeed = Math.max(0, 1 - existingTrainingDataSize / 50000);
  
  const diversityScore = 
    profileDiversity * 0.6 +
    systemDiversityNeed * 0.4;
  
  return Math.min(diversityScore * saturationPenalty, 1);
}

// ============================================================================
// LEARNING VALUE AGGREGATION
// ============================================================================

/**
 * Calculate complete learning value score
 */
export function calculateLearningValue(
  context: LearningValueContext,
  config: LearningValueEngineConfig = DEFAULT_LEARNING_VALUE_CONFIG
): LearningValueScore {
  // Calculate all components
  const uncertaintyComponent = calculateUncertaintyComponent(context.uncertaintyProfile);
  
  const volatilityComponent = calculateVolatilityComponent(
    context.historicalRecommendations
  );
  
  const rarityComponent = calculateRarityComponent(
    context.similarStudents,
    context.careerPathways,
    context.existingTrainingDataSize
  );
  
  const contradictionComponent = calculateContradictionComponent(
    context.studentProfile,
    context.outcomeHistory
  );
  
  const noveltyComponent = calculateNoveltyComponent(
    context.studentProfile,
    context.careerPathways,
    context.outcomeHistory
  );
  
  const diversityComponent = calculateDiversityComponent(
    context.studentProfile,
    context.existingTrainingDataSize,
    context.dataPoints
  );
  
  // Combine components with weights
  const totalScore = 
    uncertaintyComponent * config.uncertaintyWeight +
    volatilityComponent * config.volatilityWeight +
    rarityComponent * config.rarityWeight +
    contradictionComponent * config.contradictionWeight +
    noveltyComponent * config.noveltyWeight +
    diversityComponent * config.diversityWeight;
  
  // Determine tier
  const tier = scoreToTier(totalScore);
  
  // Calculate estimated information gain (in bits)
  const estimatedInformationGain = calculateInformationGain(
    uncertaintyComponent,
    noveltyComponent,
    rarityComponent
  );
  
  // Calculate estimated model improvement
  const estimatedModelImprovement = calculateModelImprovement(
    totalScore,
    context.existingTrainingDataSize
  );
  
  // Generate recommended actions
  const recommendedActions = generateLearningActions(
    context,
    uncertaintyComponent,
    volatilityComponent,
    rarityComponent,
    contradictionComponent,
    noveltyComponent
  );
  
  return {
    studentId: context.studentProfile.id,
    totalScore: Math.min(totalScore, 1),
    tier,
    components: {
      uncertaintyComponent,
      volatilityComponent,
      rarityComponent,
      contradictionComponent,
      noveltyComponent,
      diversityComponent,
    },
    confidence: calculateLearningValueConfidence(context),
    estimatedInformationGain,
    estimatedModelImprovement,
    priorityRank: 0, // Will be set by batch processor
    recommendedActions,
  };
}

/**
 * Convert score to tier
 */
function scoreToTier(score: number): LearningValueTier {
  if (score < 0.2) return LearningValueTier.TRIVIAL;
  if (score < 0.4) return LearningValueTier.LOW;
  if (score < 0.6) return LearningValueTier.MODERATE;
  if (score < 0.8) return LearningValueTier.HIGH;
  if (score < 0.99) return LearningValueTier.EXCEPTIONAL;
  return LearningValueTier.CRITICAL;
}

/**
 * Calculate estimated information gain
 */
function calculateInformationGain(
  uncertaintyComponent: number,
  noveltyComponent: number,
  rarityComponent: number
): number {
  // Information gain is highest when we have high uncertainty about novel/rare cases
  const baseGain = uncertaintyComponent * 2; // 0-2 bits
  const noveltyBoost = noveltyComponent * 0.5;
  const rarityBoost = rarityComponent * 0.3;
  
  return baseGain + noveltyBoost + rarityBoost;
}

/**
 * Calculate estimated model improvement
 */
function calculateModelImprovement(
  totalScore: number,
  existingTrainingDataSize: number
): number {
  // Diminishing returns as training data grows
  const dataFactor = 1 / Math.sqrt(existingTrainingDataSize / 100 + 1);
  
  // Improvement proportional to learning value and inversely to data size
  const improvement = totalScore * dataFactor * 0.1; // Max 10% improvement per high-value student
  
  return Math.min(improvement, 0.1);
}

/**
 * Calculate confidence in learning value estimate
 */
function calculateLearningValueConfidence(context: LearningValueContext): number {
  let confidence = 0.5;
  
  // More data = higher confidence
  confidence += Math.min(context.dataPoints / 100, 0.2);
  
  // More outcomes = higher confidence
  confidence += Math.min(context.outcomeHistory.length / 20, 0.15);
  
  // High uncertainty profile confidence = higher learning value confidence
  confidence += context.uncertaintyProfile.compositeUncertainty.confidence * 0.15;
  
  return Math.min(confidence, 1);
}

/**
 * Generate recommended learning actions based on component scores
 */
function generateLearningActions(
  context: LearningValueContext,
  uncertaintyComponent: number,
  volatilityComponent: number,
  rarityComponent: number,
  contradictionComponent: number,
  noveltyComponent: number
): LearningAction[] {
  const actions: LearningAction[] = [];
  
  // High uncertainty → deep interview
  if (uncertaintyComponent > 0.6) {
    actions.push({
      type: LearningActionType.DEEP_INTERVIEW,
      priority: 1,
      expectedValue: uncertaintyComponent * 0.8,
      cost: 0.7,
      description: 'Conduct comprehensive interview to reduce uncertainty about student profile',
    });
  }
  
  // High volatility → A/B test
  if (volatilityComponent > 0.6) {
    actions.push({
      type: LearningActionType.A_B_TEST,
      priority: 2,
      expectedValue: volatilityComponent * 0.7,
      cost: 0.5,
      description: 'Test different recommendation approaches to understand volatility sources',
    });
  }
  
  // High rarity → skill assessment
  if (rarityComponent > 0.5) {
    actions.push({
      type: LearningActionType.SKILL_ASSESSMENT,
      priority: 3,
      expectedValue: rarityComponent * 0.6,
      cost: 0.4,
      description: 'Detailed skill assessment to understand rare profile capabilities',
    });
  }
  
  // High contradiction → expert review
  if (contradictionComponent > 0.6) {
    actions.push({
      type: LearningActionType.EXPERT_REVIEW,
      priority: 1,
      expectedValue: contradictionComponent * 0.9,
      cost: 0.8,
      description: 'Expert review to resolve contradictions in profile',
    });
  }
  
  // High novelty → career exploration
  if (noveltyComponent > 0.5) {
    actions.push({
      type: LearningActionType.CAREER_EXPLORATION,
      priority: 2,
      expectedValue: noveltyComponent * 0.75,
      cost: 0.5,
      description: 'Structured career exploration for novel pathways',
    });
  }
  
  // Always include outcome tracking for high-value students
  if (uncertaintyComponent + volatilityComponent + rarityComponent > 1.5) {
    actions.push({
      type: LearningActionType.OUTCOME_TRACKING,
      priority: 4,
      expectedValue: 0.6,
      cost: 0.3,
      description: 'Intensive outcome tracking to capture learning',
    });
  }
  
  // Sort by expected value / cost ratio
  return actions.sort((a, b) => 
    (b.expectedValue / b.cost) - (a.expectedValue / a.cost)
  );
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchLearningValueResult {
  scores: LearningValueScore[];
  highValueStudents: LearningValueScore[];
  exceptionalStudents: LearningValueScore[];
  averageScore: number;
  scoreDistribution: Record<LearningValueTier, number>;
  processingTime: number;
}

/**
 * Process learning value calculations for multiple students
 */
export async function calculateLearningValueBatch(
  contexts: LearningValueContext[],
  config: LearningValueEngineConfig = DEFAULT_LEARNING_VALUE_CONFIG
): Promise<BatchLearningValueResult> {
  const startTime = Date.now();
  
  const scores: LearningValueScore[] = [];
  const scoreDistribution: Record<LearningValueTier, number> = {
    [LearningValueTier.TRIVIAL]: 0,
    [LearningValueTier.LOW]: 0,
    [LearningValueTier.MODERATE]: 0,
    [LearningValueTier.HIGH]: 0,
    [LearningValueTier.EXCEPTIONAL]: 0,
    [LearningValueTier.CRITICAL]: 0,
  };
  
  for (const context of contexts) {
    const score = calculateLearningValue(context, config);
    scores.push(score);
    scoreDistribution[score.tier]++;
  }
  
  // Sort by total score and assign priority ranks
  scores.sort((a, b) => b.totalScore - a.totalScore);
  scores.forEach((score, index) => {
    score.priorityRank = index + 1;
  });
  
  // Identify high-value and exceptional students
  const highValueStudents = scores.filter(s => 
    s.tier === LearningValueTier.HIGH ||
    s.tier === LearningValueTier.EXCEPTIONAL ||
    s.tier === LearningValueTier.CRITICAL
  );
  
  const exceptionalStudents = scores.filter(s => 
    s.tier === LearningValueTier.EXCEPTIONAL ||
    s.tier === LearningValueTier.CRITICAL
  );
  
  const totalScore = scores.reduce((sum, s) => sum + s.totalScore, 0);
  
  return {
    scores,
    highValueStudents,
    exceptionalStudents,
    averageScore: scores.length > 0 ? totalScore / scores.length : 0,
    scoreDistribution,
    processingTime: Date.now() - startTime,
  };
}

// ============================================================================
// LEARNING VALUE ENGINE CLASS
// ============================================================================

export class LearningValueEngine {
  private config: LearningValueEngineConfig;
  private learningValueHistory: Map<string, LearningValueScore[]>;
  private metrics: ActiveLearningMetrics;
  
  constructor(config: Partial<LearningValueEngineConfig> = {}) {
    this.config = { ...DEFAULT_LEARNING_VALUE_CONFIG, ...config };
    this.learningValueHistory = new Map();
    this.metrics = {
      totalStudentsProcessed: 0,
      averageLearningValue: 0,
      highValueStudentPercentage: 0,
      boundaryDetectionRate: 0,
      evidenceGapClosureRate: 0,
      modelImprovementRate: 0,
      informationGainPerStudent: 0,
    };
  }
  
  /**
   * Calculate learning value for a single student
   */
  calculateLearningValue(context: LearningValueContext): LearningValueScore {
    const score = calculateLearningValue(context, this.config);
    
    // Store in history
    if (!this.learningValueHistory.has(context.studentProfile.id)) {
      this.learningValueHistory.set(context.studentProfile.id, []);
    }
    this.learningValueHistory.get(context.studentProfile.id)!.push(score);
    
    // Update metrics
    this.metrics.totalStudentsProcessed++;
    this.updateMetrics();
    
    return score;
  }
  
  /**
   * Calculate learning value for multiple students
   */
  async calculateBatch(contexts: LearningValueContext[]): Promise<BatchLearningValueResult> {
    const result = await calculateLearningValueBatch(contexts, this.config);
    
    // Update metrics
    this.metrics.totalStudentsProcessed += contexts.length;
    this.updateMetrics();
    
    return result;
  }
  
  /**
   * Update engine metrics
   */
  private updateMetrics(): void {
    const allScores: LearningValueScore[] = [];
    for (const scores of this.learningValueHistory.values()) {
      if (scores.length > 0) {
        allScores.push(scores[scores.length - 1]);
      }
    }
    
    if (allScores.length === 0) return;
    
    this.metrics.averageLearningValue = 
      allScores.reduce((sum, s) => sum + s.totalScore, 0) / allScores.length;
    
    const highValueCount = allScores.filter(s => 
      s.tier === LearningValueTier.HIGH ||
      s.tier === LearningValueTier.EXCEPTIONAL ||
      s.tier === LearningValueTier.CRITICAL
    ).length;
    
    this.metrics.highValueStudentPercentage = highValueCount / allScores.length;
    
    this.metrics.informationGainPerStudent = 
      allScores.reduce((sum, s) => sum + s.estimatedInformationGain, 0) / allScores.length;
  }
  
  /**
   * Get students with highest learning value
   */
  getHighValueStudents(
    minTier: LearningValueTier | number = LearningValueTier.HIGH,
    limit: number = 100
  ): LearningValueScore[] {
    if (typeof minTier === 'number') {
      limit = minTier;
      minTier = LearningValueTier.HIGH;
    }

    const tierOrder = [
      LearningValueTier.TRIVIAL,
      LearningValueTier.LOW,
      LearningValueTier.MODERATE,
      LearningValueTier.HIGH,
      LearningValueTier.EXCEPTIONAL,
      LearningValueTier.CRITICAL,
    ];
    
    const minTierIndex = tierOrder.indexOf(minTier);
    
    const highValueScores: LearningValueScore[] = [];
    for (const [_, scores] of this.learningValueHistory.entries()) {
      const latest = scores[scores.length - 1];
      if (latest && tierOrder.indexOf(latest.tier) >= minTierIndex) {
        highValueScores.push(latest);
      }
    }
    
    // Sort by score descending
    highValueScores.sort((a, b) => b.totalScore - a.totalScore);
    
    return highValueScores.slice(0, limit);
  }
  
  /**
   * Get top learning opportunities
   */
  getTopOpportunities(limit: number = 50): Array<{
    studentId: string;
    score: LearningValueScore;
    topAction: LearningAction | string;
  }> {
    const highValueStudents = this.getHighValueStudents(LearningValueTier.MODERATE, limit * 2);
    
    return highValueStudents
      .filter(s => s.recommendedActions.length > 0)
      .map(s => ({
        studentId: s.studentId,
        score: s,
        topAction: s.recommendedActions[0],
      }))
      .slice(0, limit);
  }
  
  /**
   * Get learning value history for a student
   */
  getLearningValueHistory(studentId: string): LearningValueScore[] {
    return this.learningValueHistory.get(studentId) || [];
  }

  recordQuery(_studentId: string): void {
    // Query generation is tracked by the orchestrating ActiveLearningEngine.
  }

  recordResponseQuality(_studentId: string, _quality: number): void {
    // Response quality is tracked by the orchestrating ActiveLearningEngine.
  }

  recordLearningGain(_studentId: string, gain: number): void {
    this.metrics.informationGainPerStudent =
      (this.metrics.informationGainPerStudent + gain) / 2;
  }

  getPrioritizedStudents(): StudentId[] {
    return this.getHighValueStudents().map((score) => score.studentId as StudentId);
  }

  isPriorityStudent(studentId: string): boolean {
    return this.getPrioritizedStudents().includes(studentId as StudentId);
  }
  
  /**
   * Get engine metrics
   */
  getMetrics(): ActiveLearningMetrics {
    return { ...this.metrics };
  }

  getStats(): ActiveLearningMetrics {
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let deferredCount = 0;

    for (const scores of this.learningValueHistory.values()) {
      const latest = scores[scores.length - 1];
      if (!latest) {
        continue;
      }

      switch (latest.tier) {
        case LearningValueTier.EXCEPTIONAL:
        case LearningValueTier.CRITICAL:
          criticalCount++;
          break;
        case LearningValueTier.HIGH:
          highCount++;
          break;
        case LearningValueTier.MODERATE:
          mediumCount++;
          break;
        case LearningValueTier.LOW:
          lowCount++;
          break;
        case LearningValueTier.TRIVIAL:
        default:
          deferredCount++;
          break;
      }
    }

    return {
      ...this.getMetrics(),
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      deferredCount,
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<LearningValueEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current configuration
   */
  getConfig(): LearningValueEngineConfig {
    return { ...this.config };
  }
  
  /**
   * Clear all history
   */
  clearHistory(): void {
    this.learningValueHistory.clear();
  }

  clear(): void {
    this.clearHistory();
  }
  
  /**
   * Get learning value statistics
   */
  getStatistics(): {
    averageScore: number;
    medianScore: number;
    scoreStdDev: number;
    tierDistribution: Record<LearningValueTier, number>;
    averageInformationGain: number;
    averageModelImprovement: number;
  } {
    const latestScores: LearningValueScore[] = [];
    const tierDistribution: Record<LearningValueTier, number> = {
      [LearningValueTier.TRIVIAL]: 0,
      [LearningValueTier.LOW]: 0,
      [LearningValueTier.MODERATE]: 0,
      [LearningValueTier.HIGH]: 0,
      [LearningValueTier.EXCEPTIONAL]: 0,
      [LearningValueTier.CRITICAL]: 0,
    };
    
    for (const scores of this.learningValueHistory.values()) {
      if (scores.length > 0) {
        const latest = scores[scores.length - 1];
        latestScores.push(latest);
        tierDistribution[latest.tier]++;
      }
    }
    
    if (latestScores.length === 0) {
      return {
        averageScore: 0,
        medianScore: 0,
        scoreStdDev: 0,
        tierDistribution,
        averageInformationGain: 0,
        averageModelImprovement: 0,
      };
    }
    
    const averageScore = latestScores.reduce((sum, s) => sum + s.totalScore, 0) / latestScores.length;
    
    const sorted = [...latestScores].sort((a, b) => a.totalScore - b.totalScore);
    const medianScore = sorted[Math.floor(sorted.length / 2)].totalScore;
    
    const variance = latestScores.reduce(
      (sum, s) => sum + Math.pow(s.totalScore - averageScore, 2),
      0
    ) / latestScores.length;
    const scoreStdDev = Math.sqrt(variance);
    
    const averageInformationGain = latestScores.reduce(
      (sum, s) => sum + s.estimatedInformationGain, 0
    ) / latestScores.length;
    
    const averageModelImprovement = latestScores.reduce(
      (sum, s) => sum + s.estimatedModelImprovement, 0
    ) / latestScores.length;
    
    return {
      averageScore,
      medianScore,
      scoreStdDev,
      tierDistribution,
      averageInformationGain,
      averageModelImprovement,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const learningValueEngine = new LearningValueEngine();
