/**
 * Regret Prediction Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Main Orchestrator
 *
 * Generates comprehensive regret profiles for career decisions.
 * Combines exploration, identity, opportunity, fear, and approval analyses.
 *
 * @module regret-prediction-engine
 * @version 1.0.0
 */

import {
  RegretProfile,
  RegretPredictionInput,
  RegretAssessment,
  RegretCategory,
  RegretRisk,
  RegretProbability,
  RegretSeverity,
  RegretDecisionOption,
  RegretComparison,
  RegretEngineConfig,
} from './regret-types';

import {
  ExplorationRegretEngine,
  createExplorationRegretEngine,
} from './exploration-regret-engine';

import {
  IdentityRegretEngine,
  createIdentityRegretEngine,
} from './identity-regret-engine';

import {
  OpportunityRegretEngine,
  createOpportunityRegretEngine,
} from './opportunity-regret-engine';

import {
  FearDrivenRegretEngine,
  createFearDrivenRegretEngine,
} from './fear-driven-regret-engine';

import {
  ApprovalDrivenRegretEngine,
  createApprovalDrivenRegretEngine,
} from './approval-driven-regret-engine';

import {
  RegretForecastEngine,
  createRegretForecastEngine,
} from './regret-forecast-engine';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: RegretEngineConfig = {
  explorationWeight: 0.25,
  identityWeight: 0.25,
  opportunityWeight: 0.20,
  fearWeight: 0.15,
  approvalWeight: 0.15,
  severityThresholds: {
    mild: 0.2,
    moderate: 0.4,
    significant: 0.6,
    severe: 0.8,
  },
  probabilityThresholds: {
    veryLow: 0.1,
    low: 0.3,
    moderate: 0.5,
    high: 0.7,
  },
  includeExplanations: true,
  includePreventionStrategies: true,
};

// ============================================================================
// REGRET PREDICTION ENGINE
// ============================================================================

/**
 * Main engine for regret prediction
 */
export class RegretPredictionEngine {
  private explorationEngine: ExplorationRegretEngine;
  private identityEngine: IdentityRegretEngine;
  private opportunityEngine: OpportunityRegretEngine;
  private fearEngine: FearDrivenRegretEngine;
  private approvalEngine: ApprovalDrivenRegretEngine;
  private forecastEngine: RegretForecastEngine;
  private config: RegretEngineConfig;

  constructor(config?: Partial<RegretEngineConfig>) {
    this.explorationEngine = createExplorationRegretEngine();
    this.identityEngine = createIdentityRegretEngine();
    this.opportunityEngine = createOpportunityRegretEngine();
    this.fearEngine = createFearDrivenRegretEngine();
    this.approvalEngine = createApprovalDrivenRegretEngine();
    this.forecastEngine = createRegretForecastEngine();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate complete regret profile for a decision
   */
  predictRegret(input: RegretPredictionInput): RegretProfile {
    const selectedOption = input.selectedOption || input.options[0];
    const alternativeOptions = input.options.filter(o => o.id !== selectedOption.id);

    // Run all sub-engine analyses
    const explorationAnalysis = this.explorationEngine.analyzeExplorationRegret(
      selectedOption,
      input.studentProfile,
      input.context
    );

    const identityAnalysis = this.identityEngine.analyzeIdentityRegret(
      selectedOption,
      input.studentProfile,
      input.context
    );

    const opportunityAnalysis = this.opportunityEngine.analyzeOpportunityRegret(
      selectedOption,
      alternativeOptions,
      input.studentProfile,
      input.context
    );

    const fearAnalysis = this.fearEngine.analyzeFearDrivenRegret(
      selectedOption,
      input.studentProfile,
      input.context
    );

    const approvalAnalysis = this.approvalEngine.analyzeApprovalDrivenRegret(
      selectedOption,
      input.studentProfile,
      input.context
    );

    // Generate forecast
    const forecast = this.forecastEngine.generateForecast(
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      selectedOption
    );

    // Generate assessments
    const allRegrets = this.generateRegretAssessments(
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis
    );

    const preventableRegrets = allRegrets.filter(r => r.preventable);
    const irreversibleRegrets = allRegrets.filter(r => !r.reversible);

    // Calculate overall metrics
    const overallRegretRisk = this.calculateOverallRegretRisk(allRegrets);
    const overallRegretProbability = this.calculateOverallRegretProbability(allRegrets);
    const highestRiskRegret = this.findHighestRiskRegret(allRegrets);

    return {
      id: `regret-${Date.now()}`,
      overallRegretRisk,
      overallRegretProbability,
      highestRiskRegret,
      preventableRegrets,
      irreversibleRegrets,
      allRegrets,
      explorationAnalysis,
      identityAnalysis,
      opportunityAnalysis,
      fearAnalysis,
      approvalAnalysis,
      forecast,
      confidence: this.calculateConfidence(allRegrets),
      explanation: this.generateExplanation(allRegrets, overallRegretRisk, highestRiskRegret),
      timestamp: new Date(),
    };
  }

  /**
   * Compare regret profiles across multiple options
   */
  compareRegretOptions(input: RegretPredictionInput): RegretComparison {
    const comparisons = input.options.map(option => {
      const singleOptionInput: RegretPredictionInput = {
        ...input,
        selectedOption: option,
      };
      const profile = this.predictRegret(singleOptionInput);

      return {
        optionId: option.id,
        optionName: option.name,
        overallRegretRisk: profile.overallRegretRisk,
        dominantRegretCategory: profile.highestRiskRegret,
        explorationRegret: profile.explorationAnalysis.severity,
        identityRegret: profile.identityAnalysis.severity,
        keyInsight: this.generateOptionInsight(profile),
      };
    });

    // Sort by risk level
    const sorted = [...comparisons].sort((a, b) => {
      return this.riskToScore(b.overallRegretRisk) - this.riskToScore(a.overallRegretRisk);
    });

    return {
      options: comparisons,
      lowestRegretOption: sorted[sorted.length - 1]?.optionId || '',
      highestRegretOption: sorted[0]?.optionId || '',
      recommendation: this.generateComparisonRecommendation(sorted),
      keyInsight: this.generateComparisonInsight(sorted),
    };
  }

  /**
   * Generate regret assessments from all analyses
   */
  private generateRegretAssessments(
    explorationAnalysis: RegretProfile['explorationAnalysis'],
    identityAnalysis: RegretProfile['identityAnalysis'],
    opportunityAnalysis: RegretProfile['opportunityAnalysis'],
    fearAnalysis: RegretProfile['fearAnalysis'],
    approvalAnalysis: RegretProfile['approvalAnalysis']
  ): RegretAssessment[] {
    const assessments: RegretAssessment[] = [];

    if (explorationAnalysis.hasExplorationRisk) {
      assessments.push({
        category: 'EXPLORATION',
        risk: this.severityToRisk(explorationAnalysis.severity),
        probability: this.calculateProbability(explorationAnalysis.explorationGap),
        severity: explorationAnalysis.severity,
        preventable: explorationAnalysis.preventionPossible,
        reversible: explorationAnalysis.unexploredPaths.some(p => p.recoverability !== 'DIFFICULT'),
        timeToManifest: '5-10 years',
        description: explorationAnalysis.explanation,
      });
    }

    if (identityAnalysis.hasIdentityRisk) {
      assessments.push({
        category: 'IDENTITY',
        risk: this.severityToRisk(identityAnalysis.severity),
        probability: this.calculateProbability(1 - identityAnalysis.identityAlignment),
        severity: identityAnalysis.severity,
        preventable: identityAnalysis.preventionPossible,
        reversible: true,
        timeToManifest: '3-7 years',
        description: identityAnalysis.explanation,
      });
    }

    if (opportunityAnalysis.hasOpportunityRisk) {
      assessments.push({
        category: 'OPPORTUNITY',
        risk: this.severityToRisk(opportunityAnalysis.severity),
        probability: this.calculateProbability(opportunityAnalysis.opportunityCostScore),
        severity: opportunityAnalysis.severity,
        preventable: opportunityAnalysis.preventionPossible,
        reversible: opportunityAnalysis.opportunitiesForegone.some(o => o.recoverability === 'EASY'),
        timeToManifest: '2-5 years',
        description: opportunityAnalysis.explanation,
      });
    }

    if (fearAnalysis.hasFearRisk) {
      assessments.push({
        category: 'FEAR_BASED',
        risk: this.severityToRisk(fearAnalysis.severity),
        probability: this.calculateProbability(fearAnalysis.fearInfluenceScore),
        severity: fearAnalysis.severity,
        preventable: fearAnalysis.preventionPossible,
        reversible: true,
        timeToManifest: '5-15 years',
        description: fearAnalysis.explanation,
      });
    }

    if (approvalAnalysis.hasApprovalRisk) {
      assessments.push({
        category: 'APPROVAL_BASED',
        risk: this.severityToRisk(approvalAnalysis.severity),
        probability: this.calculateProbability(approvalAnalysis.authenticityGap),
        severity: approvalAnalysis.severity,
        preventable: approvalAnalysis.preventionPossible,
        reversible: true,
        timeToManifest: '5-20 years',
        description: approvalAnalysis.explanation,
      });
    }

    return assessments;
  }

  /**
   * Calculate overall regret risk
   */
  private calculateOverallRegretRisk(assessments: RegretAssessment[]): RegretRisk {
    if (assessments.length === 0) return 'MINIMAL';

    const maxRisk = Math.max(...assessments.map(a => this.riskToScore(a.risk)));
    const avgRisk = assessments.reduce((sum, a) => sum + this.riskToScore(a.risk), 0) / assessments.length;

    const combined = maxRisk * 0.6 + avgRisk * 0.4;

    if (combined < 0.2) return 'MINIMAL';
    if (combined < 0.4) return 'LOW';
    if (combined < 0.6) return 'MODERATE';
    if (combined < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Calculate overall regret probability
   */
  private calculateOverallRegretProbability(assessments: RegretAssessment[]): RegretProbability {
    if (assessments.length === 0) return 'VERY_LOW';

    const scores = assessments.map(a => this.probabilityToScore(a.probability));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore < 0.2) return 'VERY_LOW';
    if (avgScore < 0.4) return 'LOW';
    if (avgScore < 0.6) return 'MODERATE';
    if (avgScore < 0.8) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Find highest risk regret category
   */
  private findHighestRiskRegret(assessments: RegretAssessment[]): RegretCategory | null {
    if (assessments.length === 0) return null;

    return assessments.reduce((max, current) => {
      return this.riskToScore(current.risk) > this.riskToScore(max.risk) ? current : max;
    }).category;
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(assessments: RegretAssessment[]): number {
    if (assessments.length === 0) return 0.7;

    // Higher confidence when more assessments agree
    const riskScores = assessments.map(a => this.riskToScore(a.risk));
    const avgScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    const variance = riskScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / riskScores.length;

    // Lower variance = higher confidence
    const baseConfidence = 0.7;
    const varianceAdjustment = (1 - variance) * 0.2;

    return Math.min(0.95, baseConfidence + varianceAdjustment);
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    assessments: RegretAssessment[],
    overallRisk: RegretRisk,
    highestRisk: RegretCategory | null
  ): string {
    if (assessments.length === 0) {
      return 'No significant regret risks identified for this decision.';
    }

    let explanation = `This decision carries ${overallRisk.toLowerCase().replace('_', ' ')} regret risk overall. `;

    if (highestRisk) {
      const riskNames: Record<RegretCategory, string> = {
        'EXPLORATION': 'exploration regret',
        'IDENTITY': 'identity regret',
        'OPPORTUNITY': 'opportunity regret',
        'FINANCIAL': 'financial regret',
        'LIFESTYLE': 'lifestyle regret',
        'PURPOSE': 'purpose regret',
        'FEAR_BASED': 'fear-driven regret',
        'APPROVAL_BASED': 'approval-driven regret',
        'RELATIONSHIP': 'relationship regret',
        'GROWTH': 'growth regret',
      };
      explanation += `The primary concern is ${riskNames[highestRisk]}. `;
    }

    const preventableCount = assessments.filter(a => a.preventable).length;
    if (preventableCount > 0) {
      explanation += `${preventableCount} of these regrets may be preventable with thoughtful action. `;
    }

    explanation += 'Remember: this analysis identifies possibilities, not certainties. The goal is awareness, not prediction.';

    return explanation;
  }

  /**
   * Generate insight for an option
   */
  private generateOptionInsight(profile: RegretProfile): string {
    const topRegret = profile.allRegrets[0];
    if (!topRegret) return 'Low regret risk identified';

    return `${topRegret.category.toLowerCase().replace('_', ' ')} risk: ${topRegret.severity.toLowerCase()}`;
  }

  /**
   * Generate recommendation for comparison
   */
  private generateComparisonRecommendation(sorted: RegretComparison['options']): string {
    if (sorted.length < 2) {
      return 'Insufficient options for comparison.';
    }

    const lowest = sorted[sorted.length - 1];
    const highest = sorted[0];

    const diff = this.riskToScore(highest.overallRegretRisk) - this.riskToScore(lowest.overallRegretRisk);

    if (diff > 0.4) {
      return `${lowest.optionName} shows significantly lower regret risk. Consider whether it better aligns with your authentic interests.`;
    } else if (diff > 0.2) {
      return `${lowest.optionName} has moderately lower regret risk. The difference may be worth exploring.`;
    } else {
      return 'All options show similar regret risk profiles. Other factors may be more important in your decision.';
    }
  }

  /**
   * Generate comparison insight
   */
  private generateComparisonInsight(sorted: RegretComparison['options']): string {
    const highest = sorted[0];
    if (!highest) return '';

    if (highest.dominantRegretCategory === 'EXPLORATION') {
      return 'The highest-risk option may limit exploration of your interests';
    } else if (highest.dominantRegretCategory === 'IDENTITY') {
      return 'The highest-risk option may suppress aspects of who you are';
    } else if (highest.dominantRegretCategory === 'FEAR_BASED') {
      return 'The highest-risk option appears driven by fear rather than desire';
    } else if (highest.dominantRegretCategory === 'APPROVAL_BASED') {
      return 'The highest-risk option prioritizes others expectations over your own';
    }

    return 'Consider which option allows you to express your authentic self';
  }

  /**
   * Convert severity to risk level
   */
  private severityToRisk(severity: RegretSeverity): RegretRisk {
    const mapping: Record<RegretSeverity, RegretRisk> = {
      'MILD': 'LOW',
      'MODERATE': 'MODERATE',
      'SIGNIFICANT': 'HIGH',
      'SEVERE': 'CRITICAL',
      'PROFOUND': 'CRITICAL',
    };
    return mapping[severity];
  }

  /**
   * Calculate probability from score
   */
  private calculateProbability(score: number): RegretProbability {
    if (score < 0.2) return 'VERY_LOW';
    if (score < 0.4) return 'LOW';
    if (score < 0.6) return 'MODERATE';
    if (score < 0.8) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Convert risk to numeric score
   */
  private riskToScore(risk: RegretRisk): number {
    const scores: Record<RegretRisk, number> = {
      'MINIMAL': 0.1,
      'LOW': 0.3,
      'MODERATE': 0.5,
      'HIGH': 0.7,
      'CRITICAL': 0.9,
    };
    return scores[risk];
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
   * Quick regret check
   */
  quickRegretCheck(
    optionName: string,
    interests: string[],
    motivations: string[]
  ): {
    regretRisk: RegretRisk;
    dominantConcern: string;
    warning: string;
  } {
    const mockOption: RegretDecisionOption = {
      id: 'quick-check',
      name: optionName,
      description: optionName,
      type: 'OTHER',
      motivations: motivations as any[],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const mockProfile: RegretStudentProfile = {
      currentEducation: 'Unknown',
      interests,
      strengths: [],
      values: [],
      previousChoices: [],
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures: [],
    };

    const mockInput: RegretPredictionInput = {
      decisionType: 'QUICK_CHECK',
      description: 'Quick check',
      options: [mockOption],
      selectedOption: mockOption,
      studentProfile: mockProfile,
      context: mockContext,
    };

    const result = this.predictRegret(mockInput);

    return {
      regretRisk: result.overallRegretRisk,
      dominantConcern: result.highestRiskRegret || 'None identified',
      warning: this.generateWarning(result.overallRegretRisk, result.highestRiskRegret),
    };
  }

  /**
   * Generate warning based on regret risk
   */
  private generateWarning(risk: RegretRisk, highestRisk: RegretCategory | null): string {
    const warnings: Record<RegretRisk, string> = {
      'MINIMAL': 'Low regret risk detected.',
      'LOW': 'Some factors to consider, but generally low regret risk.',
      'MODERATE': 'Moderate regret risk - worth examining your motivations.',
      'HIGH': 'Elevated regret risk - consider whether this path truly reflects your interests.',
      'CRITICAL': 'High regret risk - this decision may not align with your authentic self.',
    };

    let warning = warnings[risk];

    if (highestRisk === 'FEAR_BASED') {
      warning += ' Fear appears to be a significant factor.';
    } else if (highestRisk === 'APPROVAL_BASED') {
      warning += ' External approval may be driving this choice.';
    }

    return warning;
  }

  /**
   * Get engine configuration
   */
  getConfig(): RegretEngineConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<RegretEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a regret prediction engine
 */
export function createRegretPredictionEngine(
  config?: Partial<RegretEngineConfig>
): RegretPredictionEngine {
  return new RegretPredictionEngine(config);
}

/**
 * Predict regret directly
 */
export function predictRegret(input: RegretPredictionInput): RegretProfile {
  const engine = createRegretPredictionEngine();
  return engine.predictRegret(input);
}

/**
 * Compare regret across options
 */
export function compareRegretOptions(input: RegretPredictionInput): RegretComparison {
  const engine = createRegretPredictionEngine();
  return engine.compareRegretOptions(input);
}

/**
 * Quick regret check
 */
export function quickRegretCheck(
  optionName: string,
  interests: string[],
  motivations: string[]
): {
  regretRisk: RegretRisk;
  dominantConcern: string;
  warning: string;
} {
  const engine = createRegretPredictionEngine();
  return engine.quickRegretCheck(optionName, interests, motivations);
}
