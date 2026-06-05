/**
 * Personal Growth Engine - Analysis Algorithms
 *
 * Deterministic algorithms for growth analysis.
 *
 * Design Principles:
 * - No machine learning - only transparent calculations
 * - Conservative estimates
 * - Explainable logic
 * - Production-ready
 */

import type {
  StudentBeliefV3,
  Strength,
  PersonalityTrait,
} from '../types/index.js';

import type {
  GrowthDimension,
  GrowthState,
  GrowthIndicator,
  CurrentGrowthState,
  PotentialState,
  GrowthPotential,
  GrowthGap,
  GrowthGapAnalysis,
  TrajectoryPoint,
  DimensionTrajectory,
  GrowthTrajectory,
  GrowthInsight,
  GrowthRecommendation,
  GrowthInsightType,
  PersonalGrowthConfig,
} from './types.js';

import {
  GROWTH_DIMENSIONS,
  DIMENSION_DISPLAY_NAMES,
  DIMENSION_DESCRIPTIONS,
  DEFAULT_PERSONAL_GROWTH_CONFIG,
} from './types.js';

// ============================================================================
// CURRENT STATE ASSESSMENT
// ============================================================================

/**
 * Assess current growth state from student belief.
 */
export function assessCurrentState(
  studentId: string,
  belief: StudentBeliefV3,
  config = DEFAULT_PERSONAL_GROWTH_CONFIG
): CurrentGrowthState {
  const assessedAt = Date.now();
  const dimensions = {} as Record<GrowthDimension, GrowthState>;

  for (const dimension of GROWTH_DIMENSIONS) {
    dimensions[dimension] = assessDimension(dimension, belief, config);
  }

  // Calculate overall level
  const levels = Object.values(dimensions).map(d => d.currentLevel);
  const overallLevel = levels.reduce((a, b) => a + b, 0) / levels.length;

  // Find strongest and priority dimensions
  const sortedByLevel = Object.entries(dimensions).sort((a, b) => b[1].currentLevel - a[1].currentLevel);
  const strongestDimension = sortedByLevel[0][0] as GrowthDimension;
  const priorityDimension = sortedByLevel[sortedByLevel.length - 1][0] as GrowthDimension;

  return {
    studentId,
    assessedAt,
    dimensions,
    overallLevel,
    strongestDimension,
    priorityDimension,
  };
}

/**
 * Assess a single growth dimension.
 */
function assessDimension(
  dimension: GrowthDimension,
  belief: StudentBeliefV3,
  config: PersonalGrowthConfig
): GrowthState {
  let assessmentResult: {
    score: number;
    indicators: GrowthIndicator[];
    evidence: import('../types/index.js').Evidence[];
  };

  switch (dimension) {
    case 'skill':
      assessmentResult = assessSkillGrowth(belief);
      break;
    case 'confidence':
      assessmentResult = assessConfidenceGrowth(belief);
      break;
    case 'leadership':
      assessmentResult = assessLeadershipGrowth(belief);
      break;
    case 'communication':
      assessmentResult = assessCommunicationGrowth(belief);
      break;
    case 'decisionQuality':
      assessmentResult = assessDecisionQualityGrowth(belief);
      break;
    default:
      assessmentResult = { score: 0.5, indicators: [], evidence: [] };
  }

  // Calculate growth rate (default to conservative estimate)
  const growthRate = calculateGrowthRate(assessmentResult.indicators, belief);

  return {
    dimension,
    currentLevel: Math.max(0, Math.min(1, assessmentResult.score)),
    growthRate,
    confidence: assessmentResult.evidence.length > 0 ? Math.min(0.9, 0.5 + assessmentResult.evidence.length * 0.1) : 0.5,
    evidence: assessmentResult.evidence,
    indicators: assessmentResult.indicators,
    updatedAt: belief.timestamp,
  };
}

/**
 * Assess skill growth dimension.
 */
function assessSkillGrowth(belief: StudentBeliefV3): {
  score: number;
  indicators: GrowthIndicator[];
  evidence: import('../types/index.js').Evidence[];
} {
  const indicators: GrowthIndicator[] = [];
  let evidence: import('../types/index.js').Evidence[] = [];

  // Skill diversity indicator
  const skillCount = belief.strengths.length;
  const skillDiversityScore = Math.min(1, skillCount / 8);
  indicators.push({
    id: 'skill_diversity',
    name: 'Skill Diversity',
    value: skillDiversityScore,
    trend: skillCount >= 5 ? 'stable' : 'improving',
    evidence: [`${skillCount} skills identified`],
  });

  // Skill depth indicator
  const avgSkillLevel = belief.strengths.reduce((sum, s) => sum + s.level, 0) / Math.max(1, belief.strengths.length);
  indicators.push({
    id: 'skill_depth',
    name: 'Average Skill Level',
    value: avgSkillLevel,
    trend: avgSkillLevel > 0.6 ? 'stable' : 'improving',
    evidence: belief.strengths.map(s => `${s.name}: ${(s.level * 100).toFixed(0)}%`),
  });

  // Learning motivation indicator
  const learningMotivation = belief.motivations.find(m => 
    m.name.toLowerCase().includes('learn') || m.name.toLowerCase().includes('growth')
  );
  const learningScore = learningMotivation?.strength ?? 0.5;
  indicators.push({
    id: 'learning_motivation',
    name: 'Learning Motivation',
    value: learningScore,
    trend: learningScore > 0.6 ? 'stable' : 'improving',
    evidence: learningMotivation ? [learningMotivation.name] : ['No explicit learning motivation'],
  });

  evidence = belief.strengths.flatMap(s => s.evidence);

  // Combined score
  const score = (skillDiversityScore * 0.3 + avgSkillLevel * 0.5 + learningScore * 0.2);

  return { score, indicators, evidence };
}

/**
 * Assess confidence growth dimension.
 */
function assessConfidenceGrowth(belief: StudentBeliefV3): {
  score: number;
  indicators: GrowthIndicator[];
  evidence: import('../types/index.js').Evidence[];
} {
  const indicators: GrowthIndicator[] = [];

  // Self-efficacy from strengths
  const selfEfficacy = belief.strengths.reduce((sum, s) => sum + s.level, 0) / Math.max(1, belief.strengths.length);
  indicators.push({
    id: 'self_efficacy',
    name: 'Self-Efficacy',
    value: selfEfficacy,
    trend: selfEfficacy > 0.6 ? 'stable' : 'improving',
    evidence: belief.strengths.filter(s => s.level > 0.6).map(s => s.name),
  });

  // Decision comfort from constraints
  const constraintScore = 1 - (belief.constraints.length / 10); // Fewer constraints = more confidence
  indicators.push({
    id: 'constraint_comfort',
    name: 'Comfort with Constraints',
    value: Math.max(0, constraintScore),
    trend: 'stable',
    evidence: [`${belief.constraints.length} constraints identified`],
  });

  // Validation indicator
  const validationScore = belief.isValidated ? 0.8 : 0.5;
  indicators.push({
    id: 'validation_confidence',
    name: 'Validation Confidence',
    value: validationScore,
    trend: belief.isValidated ? 'stable' : 'improving',
    evidence: [belief.isValidated ? 'Profile validated' : 'Profile not yet validated'],
  });

  const evidence = belief.strengths.flatMap(s => s.evidence);
  const score = (selfEfficacy * 0.5 + constraintScore * 0.25 + validationScore * 0.25);

  return { score, indicators, evidence };
}

/**
 * Assess leadership growth dimension.
 */
function assessLeadershipGrowth(belief: StudentBeliefV3): {
  score: number;
  indicators: GrowthIndicator[];
  evidence: import('../types/index.js').Evidence[];
} {
  const indicators: GrowthIndicator[] = [];

  // Leadership traits
  const leadershipTraits = belief.personalityTraits.filter(t => 
    t.name.toLowerCase().includes('lead') || 
    t.name.toLowerCase().includes('influence') ||
    t.name.toLowerCase().includes('assertive')
  );
  const leadershipScore = leadershipTraits.length > 0
    ? leadershipTraits.reduce((sum, t) => sum + Math.abs(t.position), 0) / leadershipTraits.length
    : 0.4;
  indicators.push({
    id: 'leadership_traits',
    name: 'Leadership Traits',
    value: leadershipScore,
    trend: leadershipScore > 0.5 ? 'stable' : 'improving',
    evidence: leadershipTraits.map(t => t.name),
  });

  // Responsibility motivation
  const responsibilityMotivation = belief.motivations.find(m => 
    m.name.toLowerCase().includes('lead') || m.name.toLowerCase().includes('responsibility')
  );
  const motivationScore = responsibilityMotivation?.strength ?? 0.4;
  indicators.push({
    id: 'leadership_motivation',
    name: 'Leadership Motivation',
    value: motivationScore,
    trend: motivationScore > 0.5 ? 'stable' : 'improving',
    evidence: responsibilityMotivation ? [responsibilityMotivation.name] : [],
  });

  // Social traits
  const socialTraits = belief.personalityTraits.filter(t => 
    t.dimension === 'extraversion' || t.dimension === 'agreeableness'
  );
  const socialScore = socialTraits.length > 0
    ? socialTraits.reduce((sum, t) => sum + (t.position + 1) / 2, 0) / socialTraits.length
    : 0.5;
  indicators.push({
    id: 'social_orientation',
    name: 'Social Orientation',
    value: socialScore,
    trend: 'stable',
    evidence: socialTraits.map(t => t.name),
  });

  const evidence = leadershipTraits.flatMap(t => t.evidence);
  const score = (leadershipScore * 0.5 + motivationScore * 0.3 + socialScore * 0.2);

  return { score, indicators, evidence };
}

/**
 * Assess communication growth dimension.
 */
function assessCommunicationGrowth(belief: StudentBeliefV3): {
  score: number;
  indicators: GrowthIndicator[];
  evidence: import('../types/index.js').Evidence[];
} {
  const indicators: GrowthIndicator[] = [];

  // Expressive traits
  const expressiveTraits = belief.personalityTraits.filter(t => 
    t.name.toLowerCase().includes('express') || 
    t.name.toLowerCase().includes('communic') ||
    t.dimension === 'extraversion'
  );
  const expressiveScore = expressiveTraits.length > 0
    ? expressiveTraits.reduce((sum, t) => sum + (t.position + 1) / 2, 0) / expressiveTraits.length
    : 0.5;
  indicators.push({
    id: 'expressiveness',
    name: 'Expressiveness',
    value: expressiveScore,
    trend: 'stable',
    evidence: expressiveTraits.map(t => t.name),
  });

  // Social strengths
  const socialStrengths = belief.strengths.filter(s => 
    s.category === 'social' || s.name.toLowerCase().includes('communic')
  );
  const socialSkillScore = socialStrengths.length > 0
    ? socialStrengths.reduce((sum, s) => sum + s.level, 0) / socialStrengths.length
    : 0.4;
  indicators.push({
    id: 'social_skills',
    name: 'Social Skills',
    value: socialSkillScore,
    trend: socialSkillScore > 0.5 ? 'stable' : 'improving',
    evidence: socialStrengths.map(s => s.name),
  });

  // Collaboration motivation
  const collaborationMotivation = belief.motivations.find(m => 
    m.name.toLowerCase().includes('collaborat') || m.name.toLowerCase().includes('team')
  );
  const collaborationScore = collaborationMotivation?.strength ?? 0.5;
  indicators.push({
    id: 'collaboration',
    name: 'Collaboration Drive',
    value: collaborationScore,
    trend: collaborationScore > 0.5 ? 'stable' : 'improving',
    evidence: collaborationMotivation ? [collaborationMotivation.name] : [],
  });

  const evidence = expressiveTraits.flatMap(t => t.evidence);
  const score = (expressiveScore * 0.4 + socialSkillScore * 0.4 + collaborationScore * 0.2);

  return { score, indicators, evidence };
}

/**
 * Assess decision quality growth dimension.
 */
function assessDecisionQualityGrowth(belief: StudentBeliefV3): {
  score: number;
  indicators: GrowthIndicator[];
  evidence: import('../types/index.js').Evidence[];
} {
  const indicators: GrowthIndicator[] = [];

  // Analytical traits
  const analyticalTraits = belief.personalityTraits.filter(t => 
    t.name.toLowerCase().includes('analy') || 
    t.name.toLowerCase().includes('system') ||
    t.dimension === 'conscientiousness'
  );
  const analyticalScore = analyticalTraits.length > 0
    ? analyticalTraits.reduce((sum, t) => sum + Math.abs(t.position), 0) / analyticalTraits.length
    : 0.5;
  indicators.push({
    id: 'analytical_thinking',
    name: 'Analytical Thinking',
    value: analyticalScore,
    trend: 'stable',
    evidence: analyticalTraits.map(t => t.name),
  });

  // Cognitive strengths
  const cognitiveStrengths = belief.strengths.filter(s => 
    s.category === 'cognitive' || s.name.toLowerCase().includes('decision')
  );
  const cognitiveScore = cognitiveStrengths.length > 0
    ? cognitiveStrengths.reduce((sum, s) => sum + s.level, 0) / cognitiveStrengths.length
    : 0.4;
  indicators.push({
    id: 'cognitive_skills',
    name: 'Cognitive Skills',
    value: cognitiveScore,
    trend: cognitiveScore > 0.5 ? 'stable' : 'improving',
    evidence: cognitiveStrengths.map(s => s.name),
  });

  // Openness to experience
  const opennessTrait = belief.personalityTraits.find(t => t.dimension === 'openness');
  const opennessScore = opennessTrait ? (opennessTrait.position + 1) / 2 : 0.5;
  indicators.push({
    id: 'openness',
    name: 'Openness to Experience',
    value: opennessScore,
    trend: 'stable',
    evidence: opennessTrait ? [opennessTrait.name] : [],
  });

  const evidence = analyticalTraits.flatMap(t => t.evidence);
  const score = (analyticalScore * 0.4 + cognitiveScore * 0.3 + opennessScore * 0.3);

  return { score, indicators, evidence };
}

/**
 * Calculate growth rate from indicators and history.
 */
function calculateGrowthRate(
  indicators: GrowthIndicator[],
  belief: StudentBeliefV3
): number {
  // Base growth rate on trend
  const improvingCount = indicators.filter(i => i.trend === 'improving').length;
  const baseRate = improvingCount / Math.max(1, indicators.length) * 0.05;

  // Adjust by learning motivation
  const learningMotivation = belief.motivations.find(m =>
    m.name.toLowerCase().includes('learn') || m.name.toLowerCase().includes('growth')
  );
  const motivationMultiplier = 0.5 + (learningMotivation?.strength ?? 0.5) * 0.5;

  return baseRate * motivationMultiplier;
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

/**
 * Analyze growth gaps.
 */
export function analyzeGaps(
  studentId: string,
  currentState: CurrentGrowthState,
  potential: GrowthPotential,
  config = DEFAULT_PERSONAL_GROWTH_CONFIG
): GrowthGapAnalysis {
  const analyzedAt = Date.now();
  const dimensions = {} as Record<GrowthDimension, GrowthGap>;

  for (const dimension of GROWTH_DIMENSIONS) {
    dimensions[dimension] = calculateGap(
      dimension,
      currentState.dimensions[dimension],
      potential.dimensions[dimension],
      config
    );
  }

  // Find largest and smallest gaps
  const sortedByGap = Object.entries(dimensions).sort((a, b) => b[1].absoluteGap - a[1].absoluteGap);
  const largestGap = sortedByGap[0][0] as GrowthDimension;
  const smallestGap = sortedByGap[sortedByGap.length - 1][0] as GrowthDimension;

  // Find most urgent (critical significance or largest relative gap)
  const mostUrgent = sortedByGap.find(([_, gap]) => gap.significance === 'critical')?.[0] as GrowthDimension
    || largestGap;

  // Calculate overall gap
  const overallGap = Object.values(dimensions).reduce((sum, g) => sum + g.relativeGap, 0) / GROWTH_DIMENSIONS.length;

  return {
    studentId,
    analyzedAt,
    dimensions,
    largestGap,
    smallestGap,
    mostUrgent,
    overallGap,
  };
}

/**
 * Calculate gap for a single dimension.
 */
function calculateGap(
  dimension: GrowthDimension,
  currentState: GrowthState,
  potential: PotentialState,
  config: PersonalGrowthConfig
): GrowthGap {
  const currentLevel = currentState.currentLevel;
  const targetLevel = potential.achievableLevel;
  const absoluteGap = targetLevel - currentLevel;
  const relativeGap = targetLevel > 0 ? absoluteGap / targetLevel : 0;

  // Determine significance
  let significance: GrowthGap['significance'];
  if (relativeGap >= config.criticalGapThreshold) significance = 'critical';
  else if (relativeGap >= config.significantGapThreshold) significance = 'significant';
  else if (relativeGap >= 0.2) significance = 'moderate';
  else if (relativeGap >= 0.1) significance = 'minor';
  else significance = 'negligible';

  // Calculate closure metrics
  const closureRate = currentState.growthRate;
  const isClosing = closureRate > 0.001;
  const timeToClose = isClosing && absoluteGap > 0 ? Math.ceil(absoluteGap / closureRate) : null;

  return {
    dimension,
    currentLevel,
    targetLevel,
    absoluteGap,
    relativeGap,
    significance,
    isClosing,
    closureRate,
    timeToClose,
    barriers: potential.limitingFactors,
    opportunities: potential.enablingFactors,
  };
}

// ============================================================================
// TRAJECTORY GENERATION
// ============================================================================

/**
 * Generate growth trajectory.
 */
export function generateTrajectory(
  studentId: string,
  currentState: CurrentGrowthState,
  potential: GrowthPotential,
  beliefHistory: import('../types/index.js').StudentBeliefV3[],
  config = DEFAULT_PERSONAL_GROWTH_CONFIG
): GrowthTrajectory {
  const generatedAt = Date.now();
  const horizonMonths = config.defaultHorizonMonths;
  const dimensions = {} as Record<GrowthDimension, DimensionTrajectory>;

  for (const dimension of GROWTH_DIMENSIONS) {
    dimensions[dimension] = generateDimensionTrajectory(
      dimension,
      currentState.dimensions[dimension],
      potential.dimensions[dimension],
      beliefHistory,
      horizonMonths,
      config
    );
  }

  // Determine overall shape
  const shapes = Object.values(dimensions).map(d => d.shape);
  const acceleratingCount = shapes.filter(s => s === 'exponential' || s === 's-curve').length;
  const plateauCount = shapes.filter(s => s === 'plateau' || s === 'logarithmic').length;

  let overallShape: GrowthTrajectory['overallShape'];
  if (acceleratingCount >= 3) overallShape = 'accelerating';
  else if (plateauCount >= 3) overallShape = 'plateauing';
  else if (acceleratingCount > plateauCount) overallShape = 'steady';
  else overallShape = 'decelerating';

  return {
    id: `trajectory_${studentId}_${generatedAt}`,
    studentId,
    generatedAt,
    horizonMonths,
    dimensions,
    overallShape,
    confidence: currentState.dimensions.skill.confidence,
    assumptions: [
      'Current motivation levels remain stable',
      'Growth opportunities are available',
      'No major life disruptions',
      'Effort levels match current trajectory',
    ],
  };
}

/**
 * Generate trajectory for a single dimension.
 */
function generateDimensionTrajectory(
  dimension: GrowthDimension,
  currentState: GrowthState,
  potential: PotentialState,
  beliefHistory: import('../types/index.js').StudentBeliefV3[],
  horizonMonths: number,
  config: PersonalGrowthConfig
): DimensionTrajectory {
  const points: TrajectoryPoint[] = [];
  const milestones: DimensionTrajectory['keyMilestones'] = [];
  const inflectionPoints: DimensionTrajectory['inflectionPoints'] = [];

  const startLevel = currentState.currentLevel;
  const targetLevel = potential.achievableLevel;
  const maxLevel = potential.maximumLevel;
  const growthRate = currentState.growthRate;

  // Determine shape based on current level and target
  let shape: DimensionTrajectory['shape'];
  if (startLevel > 0.8) {
    shape = 'plateau';
  } else if (startLevel < 0.3 && targetLevel > 0.7) {
    shape = 's-curve';
  } else if (growthRate > 0.03) {
    shape = 'exponential';
  } else if (growthRate < 0.01) {
    shape = 'logarithmic';
  } else {
    shape = 'linear';
  }

  // Generate points
  for (let month = 0; month <= horizonMonths; month += 3) {
    const progress = month / potential.timeToAchievable;
    let projectedLevel: number;

    switch (shape) {
      case 'linear':
        projectedLevel = Math.min(maxLevel, startLevel + (targetLevel - startLevel) * progress);
        break;
      case 'exponential':
        projectedLevel = Math.min(maxLevel, startLevel + (targetLevel - startLevel) * (1 - Math.exp(-progress * 2)));
        break;
      case 'logarithmic':
        projectedLevel = Math.min(maxLevel, startLevel + (targetLevel - startLevel) * Math.log(1 + progress) / Math.log(2));
        break;
      case 's-curve':
        projectedLevel = Math.min(maxLevel, startLevel + (targetLevel - startLevel) / (1 + Math.exp(-(progress - 0.5) * 6)));
        break;
      case 'plateau':
        projectedLevel = startLevel + (targetLevel - startLevel) * (1 - Math.exp(-progress));
        break;
    }

    // Add uncertainty that increases over time
    const uncertainty = 0.05 + month * 0.005;

    const point: TrajectoryPoint = {
      monthsFromNow: month,
      projectedLevel,
      confidenceInterval: {
        lower: Math.max(0, projectedLevel - uncertainty),
        upper: Math.min(1, projectedLevel + uncertainty),
      },
      milestones: [],
    };

    // Add milestones at key levels
    if (month > 0 && month % 6 === 0) {
      if (projectedLevel >= 0.25 && points[points.length - 1]?.projectedLevel < 0.25) {
        point.milestones.push(`Reached foundational level in ${DIMENSION_DISPLAY_NAMES[dimension]}`);
      }
      if (projectedLevel >= 0.5 && points[points.length - 1]?.projectedLevel < 0.5) {
        point.milestones.push(`Reached competent level in ${DIMENSION_DISPLAY_NAMES[dimension]}`);
      }
      if (projectedLevel >= 0.75 && points[points.length - 1]?.projectedLevel < 0.75) {
        point.milestones.push(`Reached advanced level in ${DIMENSION_DISPLAY_NAMES[dimension]}`);
      }
    }

    points.push(point);

    // Track key milestones
    if (point.milestones.length > 0) {
      milestones.push({
        monthsFromNow: month,
        level: projectedLevel,
        description: point.milestones[0],
      });
    }
  }

  // Find inflection points for s-curve
  if (shape === 's-curve') {
    const midPoint = points[Math.floor(points.length / 2)];
    if (midPoint) {
      inflectionPoints.push({
        monthsFromNow: midPoint.monthsFromNow,
        description: `Growth acceleration point in ${DIMENSION_DISPLAY_NAMES[dimension]}`,
      });
    }
  }

  return {
    dimension,
    points,
    shape,
    inflectionPoints,
    keyMilestones: milestones.slice(0, 3),
  };
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate insights from growth analysis.
 */
export function generateInsights(
  currentState: CurrentGrowthState,
  potential: GrowthPotential,
  gapAnalysis: GrowthGapAnalysis,
  trajectory: GrowthTrajectory
): GrowthInsight[] {
  const insights: GrowthInsight[] = [];
  const now = Date.now();

  // Rapid growth detection
  const rapidGrowthDimensions = Object.entries(currentState.dimensions)
    .filter(([_, state]) => state.growthRate > 0.03)
    .map(([dim]) => dim as GrowthDimension);

  if (rapidGrowthDimensions.length > 0) {
    insights.push({
      id: `insight_rapid_${now}`,
      type: 'rapid-growth-detected',
      dimensions: rapidGrowthDimensions,
      description: `Rapid growth detected in ${rapidGrowthDimensions.map(d => DIMENSION_DISPLAY_NAMES[d]).join(', ')}. Momentum is strong and should be maintained.`,
      evidence: rapidGrowthDimensions.map(d => `${DIMENSION_DISPLAY_NAMES[d]} growing at ${(currentState.dimensions[d].growthRate * 100).toFixed(1)}% monthly`),
      confidence: 0.85,
      urgency: 'near-term',
    });
  }

  // High potential identification
  const highPotentialDimensions = Object.entries(potential.dimensions)
    .filter(([_, pot]) => pot.achievableLevel > 0.8)
    .map(([dim]) => dim as GrowthDimension);

  if (highPotentialDimensions.length > 0) {
    insights.push({
      id: `insight_potential_${now}`,
      type: 'high-potential-identified',
      dimensions: highPotentialDimensions,
      description: `High growth potential identified in ${highPotentialDimensions.map(d => DIMENSION_DISPLAY_NAMES[d]).join(', ')}. Significant development possible with focused effort.`,
      evidence: highPotentialDimensions.map(d => `Achievable level: ${(potential.dimensions[d].achievableLevel * 100).toFixed(0)}%`),
      confidence: 0.8,
      urgency: 'long-term',
    });
  }

  // Critical gaps
  const criticalGaps = Object.entries(gapAnalysis.dimensions)
    .filter(([_, gap]) => gap.significance === 'critical')
    .map(([dim]) => dim as GrowthDimension);

  if (criticalGaps.length > 0) {
    insights.push({
      id: `insight_critical_${now}`,
      type: 'critical-gap',
      dimensions: criticalGaps,
      description: `Critical growth gaps in ${criticalGaps.map(d => DIMENSION_DISPLAY_NAMES[d]).join(', ')} require immediate attention.`,
      evidence: criticalGaps.map(d => `Gap of ${(gapAnalysis.dimensions[d].relativeGap * 100).toFixed(0)}% to target level`),
      confidence: 0.9,
      urgency: 'immediate',
    });
  }

  // Balanced vs lopsided growth
  const levels = Object.values(currentState.dimensions).map(d => d.currentLevel);
  const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
  const variance = levels.reduce((sum, l) => sum + Math.pow(l - avgLevel, 2), 0) / levels.length;

  if (variance < 0.02) {
    insights.push({
      id: `insight_balanced_${now}`,
      type: 'balanced-growth',
      dimensions: [...GROWTH_DIMENSIONS],
      description: 'Growth is well-balanced across all dimensions. This provides a strong foundation for holistic development.',
      evidence: [`Variance across dimensions: ${(variance * 100).toFixed(1)}%`],
      confidence: 0.8,
      urgency: 'long-term',
    });
  } else if (variance > 0.08) {
    const highest = Object.entries(currentState.dimensions)
      .sort((a, b) => b[1].currentLevel - a[1].currentLevel)[0];
    const lowest = Object.entries(currentState.dimensions)
      .sort((a, b) => a[1].currentLevel - b[1].currentLevel)[0];

    insights.push({
      id: `insight_lopsided_${now}`,
      type: 'lopsided-growth',
      dimensions: [highest[0], lowest[0]] as GrowthDimension[],
      description: `Growth is uneven. ${DIMENSION_DISPLAY_NAMES[highest[0] as GrowthDimension]} is strong while ${DIMENSION_DISPLAY_NAMES[lowest[0] as GrowthDimension]} needs attention.`,
      evidence: [
        `${DIMENSION_DISPLAY_NAMES[highest[0] as GrowthDimension]}: ${(highest[1].currentLevel * 100).toFixed(0)}%`,
        `${DIMENSION_DISPLAY_NAMES[lowest[0] as GrowthDimension]}: ${(lowest[1].currentLevel * 100).toFixed(0)}%`,
      ],
      confidence: 0.85,
      urgency: 'near-term',
    });
  }

  // Acceleration opportunities
  const easyImprovements = Object.entries(potential.dimensions)
    .filter(([dim, pot]) => {
      const current = currentState.dimensions[dim as GrowthDimension].currentLevel;
      return pot.achievableLevel - current > 0.2 && pot.requiredInvestment.effortIntensity < 0.5;
    })
    .map(([dim]) => dim as GrowthDimension);

  if (easyImprovements.length > 0) {
    insights.push({
      id: `insight_acceleration_${now}`,
      type: 'acceleration-opportunity',
      dimensions: easyImprovements,
      description: `Low-effort opportunities exist to accelerate growth in ${easyImprovements.map(d => DIMENSION_DISPLAY_NAMES[d]).join(', ')}.`,
      evidence: easyImprovements.map(d => `${DIMENSION_DISPLAY_NAMES[d]} requires only ${potential.dimensions[d].requiredInvestment.timePerWeek.toFixed(0)} hours/week`),
      confidence: 0.75,
      urgency: 'near-term',
    });
  }

  return insights;
}

// ============================================================================
// RECOMMENDATION GENERATION
// ============================================================================

/**
 * Generate recommendations from growth analysis.
 */
export function generateRecommendations(
  gapAnalysis: GrowthGapAnalysis,
  potential: GrowthPotential,
  currentState: CurrentGrowthState,
  insights: GrowthInsight[]
): GrowthRecommendation[] {
  const recommendations: GrowthRecommendation[] = [];
  const now = Date.now();

  // Priority gap recommendations
  const priorityGap = gapAnalysis.dimensions[gapAnalysis.mostUrgent];
  if (priorityGap.significance === 'critical' || priorityGap.significance === 'significant') {
    const dimension = gapAnalysis.mostUrgent;
    const dimPotential = potential.dimensions[dimension];

    recommendations.push({
      id: `rec_priority_${now}`,
      dimensions: [dimension],
      recommendation: `Focus development efforts on ${DIMENSION_DISPLAY_NAMES[dimension]}`,
      rationale: `${DIMENSION_DISPLAY_NAMES[dimension]} has the largest growth gap at ${(priorityGap.relativeGap * 100).toFixed(0)}%. Addressing this will have the highest impact on overall development.`,
      expectedImpact: 0.3,
      timeToResults: 8,
      difficulty: dimPotential.requiredInvestment.effortIntensity,
      priority: priorityGap.significance === 'critical' ? 'critical' : 'high',
      actionSteps: generateActionSteps(dimension, dimPotential),
      successMetrics: [
        `${DIMENSION_DISPLAY_NAMES[dimension]} level increases by 10%`,
        'Observable improvement in related behaviors',
        'Positive feedback from peers or mentors',
      ],
    });
  }

  // High potential recommendations
  const highPotentialDim = potential.highestPotentialDimension;
  if (highPotentialDim !== gapAnalysis.mostUrgent) {
    const dimPotential = potential.dimensions[highPotentialDim];

    recommendations.push({
      id: `rec_potential_${now}`,
      dimensions: [highPotentialDim],
      recommendation: `Invest in ${DIMENSION_DISPLAY_NAMES[highPotentialDim]} to realize high potential`,
      rationale: `${DIMENSION_DISPLAY_NAMES[highPotentialDim]} shows the highest achievable level at ${(dimPotential.achievableLevel * 100).toFixed(0)}%. This represents a significant opportunity for growth.`,
      expectedImpact: 0.25,
      timeToResults: 12,
      difficulty: dimPotential.requiredInvestment.effortIntensity,
      priority: 'high',
      actionSteps: generateActionSteps(highPotentialDim, dimPotential),
      successMetrics: [
        `Progress toward ${(dimPotential.achievableLevel * 100).toFixed(0)}% level`,
        'Sustained practice and improvement',
      ],
    });
  }

  // Balanced growth recommendation
  const balancedInsight = insights.find(i => i.type === 'balanced-growth');
  if (balancedInsight) {
    recommendations.push({
      id: `rec_balanced_${now}`,
      dimensions: [...GROWTH_DIMENSIONS],
      recommendation: 'Maintain balanced development across all dimensions',
      rationale: 'Current growth is well-balanced. Continue investing in all dimensions to maintain holistic development.',
      expectedImpact: 0.15,
      timeToResults: 16,
      difficulty: 0.4,
      priority: 'medium',
      actionSteps: [
        'Continue current development activities',
        'Monitor for any emerging gaps',
        'Rotate focus across dimensions monthly',
      ],
      successMetrics: [
        'Variance across dimensions stays below 10%',
        'All dimensions show positive growth',
      ],
    });
  }

  // Lopsided growth fix
  const lopsidedInsight = insights.find(i => i.type === 'lopsided-growth');
  if (lopsidedInsight) {
    const weakestDim = Object.entries(currentState.dimensions)
      .sort((a, b) => a[1].currentLevel - b[1].currentLevel)[0][0] as GrowthDimension;

    recommendations.push({
      id: `rec_balance_${now}`,
      dimensions: [weakestDim],
      recommendation: `Strengthen ${DIMENSION_DISPLAY_NAMES[weakestDim]} to balance growth profile`,
      rationale: 'Uneven growth creates vulnerabilities. The weakest dimension limits overall effectiveness.',
      expectedImpact: 0.2,
      timeToResults: 10,
      difficulty: 0.5,
      priority: 'high',
      actionSteps: generateActionSteps(weakestDim, potential.dimensions[weakestDim]),
      successMetrics: [
        `${DIMENSION_DISPLAY_NAMES[weakestDim]} level improves by 15%`,
        'Gap between strongest and weakest narrows',
      ],
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate action steps for a dimension.
 */
function generateActionSteps(
  dimension: GrowthDimension,
  potential: PotentialState
): string[] {
  const baseSteps: Record<GrowthDimension, string[]> = {
    skill: [
      'Identify 2-3 key skills to develop',
      'Create a structured learning plan',
      'Find practice opportunities weekly',
      'Seek feedback on skill application',
    ],
    confidence: [
      'Set and achieve small wins regularly',
      'Keep a success journal',
      'Practice self-affirmation techniques',
      'Take on slightly challenging tasks',
    ],
    leadership: [
      'Volunteer for team leadership opportunities',
      'Study leadership case studies',
      'Practice active listening and empathy',
      'Seek mentorship from experienced leaders',
    ],
    communication: [
      'Practice presenting ideas to small groups',
      'Write regularly to clarify thinking',
      'Seek feedback on communication style',
      'Study effective communicators',
    ],
    decisionQuality: [
      'Practice decision journaling',
      'Study decision-making frameworks',
      'Analyze past decisions for learning',
      'Seek diverse perspectives before deciding',
    ],
  };

  return [
    ...baseSteps[dimension],
    `Invest ${potential.requiredInvestment.timePerWeek.toFixed(0)} hours per week`,
    ...potential.requiredInvestment.resources.map(r => `Acquire/Use: ${r}`),
  ];
}
export function assessPotential(
  studentId: string,
  currentState: CurrentGrowthState,
  belief: StudentBeliefV3,
  config = DEFAULT_PERSONAL_GROWTH_CONFIG
): GrowthPotential {
  const assessedAt = Date.now();
  const dimensions = {} as Record<GrowthDimension, PotentialState>;

  for (const dimension of GROWTH_DIMENSIONS) {
    dimensions[dimension] = calculatePotential(dimension, currentState.dimensions[dimension], belief, config);
  }

  // Calculate overall achievable
  const achievableLevels = Object.values(dimensions).map(d => d.achievableLevel);
  const overallAchievable = achievableLevels.reduce((a, b) => a + b, 0) / achievableLevels.length;

  // Find highest potential and easiest improvement
  const sortedByPotential = Object.entries(dimensions).sort((a, b) => b[1].achievableLevel - a[1].achievableLevel);
  const highestPotentialDimension = sortedByPotential[0][0] as GrowthDimension;

  // Easiest = highest gap between achievable and current, with low difficulty
  const sortedByEase = Object.entries(dimensions).sort((a, b) => {
    const gapA = a[1].achievableLevel - currentState.dimensions[a[0] as GrowthDimension].currentLevel;
    const gapB = b[1].achievableLevel - currentState.dimensions[b[0] as GrowthDimension].currentLevel;
    const difficultyA = a[1].requiredInvestment.effortIntensity;
    const difficultyB = b[1].requiredInvestment.effortIntensity;
    return (gapB / (difficultyB + 0.1)) - (gapA / (difficultyA + 0.1));
  });
  const easiestImprovement = sortedByEase[0][0] as GrowthDimension;

  return {
    studentId,
    assessedAt,
    dimensions,
    overallAchievable,
    highestPotentialDimension,
    easiestImprovement,
  };
}

/**
 * Calculate potential for a single dimension.
 */
function calculatePotential(
  dimension: GrowthDimension,
  currentState: GrowthState,
  belief: StudentBeliefV3,
  config: PersonalGrowthConfig
): PotentialState {
  const currentLevel = currentState.currentLevel;

  // Calculate maximum theoretical (diminishing returns near ceiling)
  const maxLevel = 0.95;

  // Calculate achievable based on current trajectory and motivation
  const learningMotivation = belief.motivations.find(m => 
    m.name.toLowerCase().includes('learn') || m.name.toLowerCase().includes('growth')
  );
  const motivationBoost = (learningMotivation?.strength ?? 0.5) * 0.2;

  // Gap to ceiling
  const remainingGap = maxLevel - currentLevel;

  // Achievable closes 60-80% of remaining gap depending on motivation
  const achievableLevel = Math.min(maxLevel, currentLevel + remainingGap * (0.6 + motivationBoost));

  // Time to achievable (inverse of growth rate)
  const growthRate = Math.max(0.01, currentState.growthRate);
  const timeToAchievable = Math.ceil((achievableLevel - currentLevel) / growthRate);

  // Required investment
  const effortIntensity = 0.3 + (achievableLevel - currentLevel) * 0.5;
  const timePerWeek = 5 + effortIntensity * 10;

  return {
    dimension,
    achievableLevel,
    maximumLevel: maxLevel,
    confidence: currentState.confidence * 0.9,
    enablingFactors: generateEnablingFactors(dimension, belief),
    limitingFactors: generateLimitingFactors(dimension, belief, currentState),
    timeToAchievable,
    requiredInvestment: {
      timePerWeek,
      effortIntensity,
      resources: generateRequiredResources(dimension),
    },
  };
}

/**
 * Generate enabling factors for a dimension.
 */
function generateEnablingFactors(
  dimension: GrowthDimension,
  belief: StudentBeliefV3
): string[] {
  const factors: string[] = [];

  switch (dimension) {
    case 'skill':
      if (belief.strengths.length >= 5) factors.push('Diverse skill foundation');
      if (belief.motivations.some(m => m.name.toLowerCase().includes('learn'))) {
        factors.push('Strong learning motivation');
      }
      break;
    case 'confidence':
      if (belief.strengths.some(s => s.level > 0.7)) factors.push('Areas of proven competence');
      if (belief.isValidated) factors.push('Validated self-assessment');
      break;
    case 'leadership':
      if (belief.personalityTraits.some(t => t.dimension === 'extraversion' && t.position > 0)) {
        factors.push('Natural extroversion');
      }
      break;
    case 'communication':
      if (belief.personalityTraits.some(t => t.dimension === 'extraversion')) {
        factors.push('Social orientation');
      }
      break;
    case 'decisionQuality':
      if (belief.personalityTraits.some(t => t.dimension === 'conscientiousness')) {
        factors.push('Conscientious nature');
      }
      break;
  }

  return factors.length > 0 ? factors : ['General capability for growth'];
}

/**
 * Generate limiting factors for a dimension.
 */
function generateLimitingFactors(
  dimension: GrowthDimension,
  belief: StudentBeliefV3,
  currentState: GrowthState
): string[] {
  const factors: string[] = [];

  if (currentState.currentLevel < 0.3) {
    factors.push('Currently at early stage of development');
  }

  if (belief.constraints.length > 3) {
    factors.push('Multiple constraints may limit practice opportunities');
  }

  switch (dimension) {
    case 'skill':
      if (belief.strengths.length < 3) factors.push('Limited skill diversity so far');
      break;
    case 'confidence':
      if (!belief.isValidated) factors.push('Self-assessment not yet validated');
      break;
    case 'leadership':
      if (belief.constraints.some(c => c.type === 'personal')) {
        factors.push('Family obligations may limit leadership opportunities');
      }
      break;
  }

  return factors.length > 0 ? factors : ['None significant identified'];
}

/**
 * Generate required resources for a dimension.
 */
function generateRequiredResources(dimension: GrowthDimension): string[] {
  const resources: Record<GrowthDimension, string[]> = {
    skill: ['Learning materials', 'Practice opportunities', 'Feedback sources'],
    confidence: ['Supportive environment', 'Success experiences', 'Mentorship'],
    leadership: ['Leadership opportunities', 'Team contexts', 'Role models'],
    communication: ['Practice audiences', 'Feedback mechanisms', 'Communication training'],
    decisionQuality: ['Decision contexts', 'Feedback loops', 'Analytical tools'],
  };

  return resources[dimension];
}
