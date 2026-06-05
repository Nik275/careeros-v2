/**
 * Regret Forecast Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 7
 *
 * Forecasts regret likelihood at different time horizons:
 * - 5 Years
 * - 10 Years
 * - 20 Years
 * - 40 Years
 *
 * Shows how regret may evolve over a lifetime.
 *
 * @module regret-forecast-engine
 * @version 1.0.0
 */

import {
  RegretForecast,
  RegretForecastSet,
  TimeHorizon,
  RegretProbability,
  RegretSeverity,
  RegretCategory,
  ExplorationRegretAnalysis,
  IdentityRegretAnalysis,
  OpportunityRegretAnalysis,
  FearDrivenRegretAnalysis,
  ApprovalDrivenRegretAnalysis,
  RegretDecisionOption,
} from './regret-types';

// ============================================================================
// TIME DECAY FACTORS
// ============================================================================

/**
 * How different regret categories evolve over time
 */
const TIME_DECAY_PATTERNS: Record<RegretCategory, {
  fiveYearMultiplier: number;
  tenYearMultiplier: number;
  twentyYearMultiplier: number;
  fortyYearMultiplier: number;
}> = {
  'EXPLORATION': {
    fiveYearMultiplier: 0.8,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 1.3,
    fortyYearMultiplier: 1.5,
  },
  'IDENTITY': {
    fiveYearMultiplier: 0.9,
    tenYearMultiplier: 1.1,
    twentyYearMultiplier: 1.2,
    fortyYearMultiplier: 1.1,
  },
  'OPPORTUNITY': {
    fiveYearMultiplier: 1.0,
    tenYearMultiplier: 1.2,
    twentyYearMultiplier: 1.1,
    fortyYearMultiplier: 0.9,
  },
  'FINANCIAL': {
    fiveYearMultiplier: 1.1,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 0.8,
    fortyYearMultiplier: 0.6,
  },
  'LIFESTYLE': {
    fiveYearMultiplier: 0.9,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 1.0,
    fortyYearMultiplier: 0.9,
  },
  'PURPOSE': {
    fiveYearMultiplier: 0.7,
    tenYearMultiplier: 0.9,
    twentyYearMultiplier: 1.2,
    fortyYearMultiplier: 1.4,
  },
  'FEAR_BASED': {
    fiveYearMultiplier: 0.9,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 1.1,
    fortyYearMultiplier: 1.0,
  },
  'APPROVAL_BASED': {
    fiveYearMultiplier: 0.8,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 1.2,
    fortyYearMultiplier: 1.1,
  },
  'RELATIONSHIP': {
    fiveYearMultiplier: 1.0,
    tenYearMultiplier: 1.1,
    twentyYearMultiplier: 1.0,
    fortyYearMultiplier: 0.9,
  },
  'GROWTH': {
    fiveYearMultiplier: 0.8,
    tenYearMultiplier: 1.0,
    twentyYearMultiplier: 1.3,
    fortyYearMultiplier: 1.2,
  },
};

// ============================================================================
// REGRET FORECAST ENGINE
// ============================================================================

/**
 * Engine for forecasting regret at different time horizons
 */
export class RegretForecastEngine {
  /**
   * Generate complete regret forecast set
   */
  generateForecast(
    explorationAnalysis: ExplorationRegretAnalysis,
    identityAnalysis: IdentityRegretAnalysis,
    opportunityAnalysis: OpportunityRegretAnalysis,
    fearAnalysis: FearDrivenRegretAnalysis,
    approvalAnalysis: ApprovalDrivenRegretAnalysis,
    selectedOption: RegretDecisionOption
  ): RegretForecastSet {
    const fiveYear = this.forecastForHorizon(
      5,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      selectedOption
    );

    const tenYear = this.forecastForHorizon(
      10,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      selectedOption
    );

    const twentyYear = this.forecastForHorizon(
      20,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      selectedOption
    );

    const fortyYear = this.forecastForHorizon(
      40,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      selectedOption
    );

    return {
      fiveYear,
      tenYear,
      twentyYear,
      fortyYear,
      trajectory: this.determineTrajectory(fiveYear, tenYear, twentyYear, fortyYear),
    };
  }

  /**
   * Forecast regret for specific time horizon
   */
  private forecastForHorizon(
    horizon: TimeHorizon,
    explorationAnalysis: ExplorationRegretAnalysis,
    identityAnalysis: IdentityRegretAnalysis,
    opportunityAnalysis: OpportunityRegretAnalysis,
    fearAnalysis: FearDrivenRegretAnalysis,
    approvalAnalysis: ApprovalDrivenRegretAnalysis,
    selectedOption: RegretDecisionOption
  ): RegretForecast {
    // Calculate base scores for each regret category
    const categoryScores = this.calculateCategoryScores(
      horizon,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis
    );

    // Find dominant category
    const dominantCategory = this.findDominantCategory(categoryScores);

    // Calculate overall probability and severity
    const regretProbability = this.calculateRegretProbability(categoryScores);
    const regretSeverity = this.calculateRegretSeverity(categoryScores);

    return {
      timeHorizon: horizon,
      regretProbability,
      regretSeverity,
      dominantRegretCategory: dominantCategory,
      keyFactors: this.identifyKeyFactors(horizon, categoryScores),
      description: this.generateDescription(horizon, dominantCategory, regretProbability, regretSeverity),
    };
  }

  /**
   * Calculate scores for each regret category at given horizon
   */
  private calculateCategoryScores(
    horizon: TimeHorizon,
    explorationAnalysis: ExplorationRegretAnalysis,
    identityAnalysis: IdentityRegretAnalysis,
    opportunityAnalysis: OpportunityRegretAnalysis,
    fearAnalysis: FearDrivenRegretAnalysis,
    approvalAnalysis: ApprovalDrivenRegretAnalysis
  ): Record<RegretCategory, number> {
    const multiplier = this.getHorizonMultiplier(horizon);

    return {
      'EXPLORATION': this.calculateCategoryScore('EXPLORATION', explorationAnalysis.hasExplorationRisk, explorationAnalysis.explorationGap, multiplier),
      'IDENTITY': this.calculateCategoryScore('IDENTITY', identityAnalysis.hasIdentityRisk, 1 - identityAnalysis.identityAlignment, multiplier),
      'OPPORTUNITY': this.calculateCategoryScore('OPPORTUNITY', opportunityAnalysis.hasOpportunityRisk, opportunityAnalysis.opportunityCostScore, multiplier),
      'FEAR_BASED': this.calculateCategoryScore('FEAR_BASED', fearAnalysis.hasFearRisk, fearAnalysis.fearInfluenceScore, multiplier),
      'APPROVAL_BASED': this.calculateCategoryScore('APPROVAL_BASED', approvalAnalysis.hasApprovalRisk, approvalAnalysis.authenticityGap, multiplier),
      'FINANCIAL': 0.3, // Default moderate baseline
      'LIFESTYLE': 0.4, // Default moderate baseline
      'PURPOSE': this.calculatePurposeScore(explorationAnalysis, identityAnalysis),
      'RELATIONSHIP': 0.3, // Default moderate baseline
      'GROWTH': this.calculateGrowthScore(explorationAnalysis, identityAnalysis),
    };
  }

  /**
   * Get time multiplier for horizon
   */
  private getHorizonMultiplier(horizon: TimeHorizon): number {
    switch (horizon) {
      case 5: return 1.0;
      case 10: return 1.1;
      case 20: return 1.2;
      case 40: return 1.3;
      default: return 1.0;
    }
  }

  /**
   * Calculate score for a specific category
   */
  private calculateCategoryScore(
    category: RegretCategory,
    hasRisk: boolean,
    baseScore: number,
    horizonMultiplier: number
  ): number {
    if (!hasRisk) return 0;

    const decayPattern = TIME_DECAY_PATTERNS[category];
    let timeMultiplier = 1.0;

    switch (horizonMultiplier) {
      case 1.0: timeMultiplier = decayPattern.fiveYearMultiplier; break;
      case 1.1: timeMultiplier = decayPattern.tenYearMultiplier; break;
      case 1.2: timeMultiplier = decayPattern.twentyYearMultiplier; break;
      case 1.3: timeMultiplier = decayPattern.fortyYearMultiplier; break;
    }

    return Math.min(1, baseScore * timeMultiplier);
  }

  /**
   * Calculate purpose-related regret score
   */
  private calculatePurposeScore(
    explorationAnalysis: ExplorationRegretAnalysis,
    identityAnalysis: IdentityRegretAnalysis
  ): number {
    let score = 0;
    if (explorationAnalysis.hasExplorationRisk) score += 0.3;
    if (identityAnalysis.hasIdentityRisk) score += 0.3;
    return Math.min(1, score);
  }

  /**
   * Calculate growth-related regret score
   */
  private calculateGrowthScore(
    explorationAnalysis: ExplorationRegretAnalysis,
    identityAnalysis: IdentityRegretAnalysis
  ): number {
    let score = 0;
    if (explorationAnalysis.hasExplorationRisk) score += 0.4;
    if (identityAnalysis.hasIdentityRisk) score += 0.2;
    return Math.min(1, score);
  }

  /**
   * Find dominant regret category
   */
  private findDominantCategory(categoryScores: Record<RegretCategory, number>): RegretCategory {
    let maxScore = 0;
    let dominant: RegretCategory = 'EXPLORATION';

    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = category as RegretCategory;
      }
    }

    return dominant;
  }

  /**
   * Calculate overall regret probability
   */
  private calculateRegretProbability(categoryScores: Record<RegretCategory, number>): RegretProbability {
    const scores = Object.values(categoryScores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);

    // Weight toward max score (worst case matters more)
    const weightedScore = avgScore * 0.4 + maxScore * 0.6;

    if (weightedScore < 0.2) return 'VERY_LOW';
    if (weightedScore < 0.4) return 'LOW';
    if (weightedScore < 0.6) return 'MODERATE';
    if (weightedScore < 0.8) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Calculate overall regret severity
   */
  private calculateRegretSeverity(categoryScores: Record<RegretCategory, number>): RegretSeverity {
    const scores = Object.values(categoryScores);
    const maxScore = Math.max(...scores);

    if (maxScore < 0.3) return 'MILD';
    if (maxScore < 0.5) return 'MODERATE';
    if (maxScore < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Identify key factors for forecast
   */
  private identifyKeyFactors(horizon: TimeHorizon, categoryScores: Record<RegretCategory, number>): string[] {
    const factors: string[] = [];
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [category, score] of sortedCategories) {
      if (score > 0.3) {
        factors.push(this.formatFactor(category as RegretCategory, horizon, score));
      }
    }

    return factors;
  }

  /**
   * Format factor description
   */
  private formatFactor(category: RegretCategory, horizon: TimeHorizon, score: number): string {
    const descriptions: Record<RegretCategory, string> = {
      'EXPLORATION': `${horizon}-year exploration gap`,
      'IDENTITY': `${horizon}-year identity suppression`,
      'OPPORTUNITY': `${horizon}-year opportunity cost`,
      'FINANCIAL': `${horizon}-year financial considerations`,
      'LIFESTYLE': `${horizon}-year lifestyle impact`,
      'PURPOSE': `${horizon}-year purpose alignment`,
      'FEAR_BASED': `${horizon}-year fear influence`,
      'APPROVAL_BASED': `${horizon}-year approval-seeking`,
      'RELATIONSHIP': `${horizon}-year relationship impact`,
      'GROWTH': `${horizon}-year growth limitations`,
    };

    return `${descriptions[category]} (${Math.round(score * 100)}%)`;
  }

  /**
   * Generate forecast description
   */
  private generateDescription(
    horizon: TimeHorizon,
    dominantCategory: RegretCategory,
    probability: RegretProbability,
    severity: RegretSeverity
  ): string {
    const timeframe = this.formatTimeframe(horizon);
    
    const categoryDescriptions: Record<RegretCategory, string> = {
      'EXPLORATION': `In ${timeframe}, exploration regret may be prominent - wondering about paths never taken.`,
      'IDENTITY': `In ${timeframe}, identity regret may surface - feeling that you never fully expressed who you are.`,
      'OPPORTUNITY': `In ${timeframe}, opportunity regret may weigh heavily - thinking about doors that closed.`,
      'FINANCIAL': `In ${timeframe}, financial considerations may become a source of reflection.`,
      'LIFESTYLE': `In ${timeframe}, lifestyle fit may become clearer - for better or worse.`,
      'PURPOSE': `In ${timeframe}, purpose and meaning questions may become more pressing.`,
      'FEAR_BASED': `In ${timeframe}, you may reflect on how fear shaped your choices.`,
      'APPROVAL_BASED': `In ${timeframe}, approval-driven choices may feel less satisfying.`,
      'RELATIONSHIP': `In ${timeframe}, relationship impacts of your choices may become apparent.`,
      'GROWTH': `In ${timeframe}, growth limitations may feel more pronounced.`,
    };

    let description = categoryDescriptions[dominantCategory];

    // Add probability and severity context
    if (probability === 'VERY_HIGH' || probability === 'HIGH') {
      description += ' The probability of significant regret is elevated.';
    } else if (probability === 'VERY_LOW' || probability === 'LOW') {
      description += ' The probability of significant regret appears low.';
    }

    return description;
  }

  /**
   * Format timeframe for readability
   */
  private formatTimeframe(horizon: TimeHorizon): string {
    switch (horizon) {
      case 5: return '5 years';
      case 10: return '10 years';
      case 20: return '20 years';
      case 40: return '40 years';
      default: return `${horizon} years`;
    }
  }

  /**
   * Determine overall trajectory
   */
  private determineTrajectory(
    fiveYear: RegretForecast,
    tenYear: RegretForecast,
    twentyYear: RegretForecast,
    fortyYear: RegretForecast
  ): 'IMPROVING' | 'STABLE' | 'WORSENING' {
    const scores = [
      this.probabilityToScore(fiveYear.regretProbability),
      this.probabilityToScore(tenYear.regretProbability),
      this.probabilityToScore(twentyYear.regretProbability),
      this.probabilityToScore(fortyYear.regretProbability),
    ];

    // Compare first half to second half
    const early = (scores[0] + scores[1]) / 2;
    const late = (scores[2] + scores[3]) / 2;

    if (late < early - 0.3) return 'IMPROVING';
    if (late > early + 0.3) return 'WORSENING';
    return 'STABLE';
  }

  /**
   * Convert probability to numeric score
   */
  private probabilityToScore(probability: RegretProbability): number {
    const scores: Record<RegretProbability, number> = {
      'VERY_LOW': 0.1,
      'LOW': 0.3,
      'MODERATE': 0.5,
      'HIGH': 0.7,
      'VERY_HIGH': 0.9,
    };
    return scores[probability];
  }

  /**
   * Quick forecast check
   */
  quickForecastCheck(
    hasExplorationRisk: boolean,
    hasIdentityRisk: boolean,
    hasFearRisk: boolean,
    hasApprovalRisk: boolean
  ): {
    fiveYearRisk: RegretProbability;
    twentyYearRisk: RegretProbability;
    trajectory: 'IMPROVING' | 'STABLE' | 'WORSENING';
    summary: string;
  } {
    const mockExploration: ExplorationRegretAnalysis = {
      hasExplorationRisk,
      unexploredPaths: [],
      strongestInterestSuppressed: null,
      explorationGap: hasExplorationRisk ? 0.6 : 0.1,
      severity: hasExplorationRisk ? 'MODERATE' : 'MILD',
      evidence: [],
      explanation: '',
      preventionPossible: true,
      preventionStrategies: [],
    };

    const mockIdentity: IdentityRegretAnalysis = {
      hasIdentityRisk,
      suppressedIdentities: [],
      identityExpressions: [],
      identityAlignment: hasIdentityRisk ? 0.4 : 0.8,
      severity: hasIdentityRisk ? 'MODERATE' : 'MILD',
      evidence: [],
      explanation: '',
      preventionPossible: true,
      identityRecoveryPath: [],
    };

    const mockOpportunity: OpportunityRegretAnalysis = {
      hasOpportunityRisk: false,
      opportunitiesForegone: [],
      opportunityCostScore: 0.2,
      severity: 'MILD',
      evidence: [],
      explanation: '',
      preventionPossible: true,
      alternativePaths: [],
    };

    const mockFear: FearDrivenRegretAnalysis = {
      hasFearRisk,
      dominantFears: [],
      fearInfluenceScore: hasFearRisk ? 0.6 : 0.1,
      severity: hasFearRisk ? 'MODERATE' : 'MILD',
      evidence: [],
      explanation: '',
      preventionPossible: true,
      fearMitigationStrategies: [],
    };

    const mockApproval: ApprovalDrivenRegretAnalysis = {
      hasApprovalRisk,
      approvalSources: [],
      externalInfluenceScore: hasApprovalRisk ? 0.6 : 0.1,
      authenticityGap: hasApprovalRisk ? 0.5 : 0.1,
      severity: hasApprovalRisk ? 'MODERATE' : 'MILD',
      evidence: [],
      explanation: '',
      preventionPossible: true,
      authenticityRecoverySteps: [],
    };

    const mockOption: RegretDecisionOption = {
      id: 'quick-check',
      name: 'Quick Check',
      description: '',
      type: 'OTHER',
      motivations: ['INTRINSIC'],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const forecast = this.generateForecast(
      mockExploration,
      mockIdentity,
      mockOpportunity,
      mockFear,
      mockApproval,
      mockOption
    );

    return {
      fiveYearRisk: forecast.fiveYear.regretProbability,
      twentyYearRisk: forecast.twentyYear.regretProbability,
      trajectory: forecast.trajectory,
      summary: `Regret risk trajectory: ${forecast.trajectory.toLowerCase()}. 5-year: ${forecast.fiveYear.regretProbability.toLowerCase().replace('_', ' ')}, 20-year: ${forecast.twentyYear.regretProbability.toLowerCase().replace('_', ' ')}.`,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a regret forecast engine
 */
export function createRegretForecastEngine(): RegretForecastEngine {
  return new RegretForecastEngine();
}

/**
 * Generate regret forecast directly
 */
export function generateRegretForecast(
  explorationAnalysis: ExplorationRegretAnalysis,
  identityAnalysis: IdentityRegretAnalysis,
  opportunityAnalysis: OpportunityRegretAnalysis,
  fearAnalysis: FearDrivenRegretAnalysis,
  approvalAnalysis: ApprovalDrivenRegretAnalysis,
  selectedOption: RegretDecisionOption
): RegretForecastSet {
  const engine = createRegretForecastEngine();
  return engine.generateForecast(
    explorationAnalysis,
    identityAnalysis,
    opportunityAnalysis,
    fearAnalysis,
    approvalAnalysis,
    selectedOption
  );
}
