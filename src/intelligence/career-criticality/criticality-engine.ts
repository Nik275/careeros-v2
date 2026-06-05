/**
 * Career Criticality Engine
 *
 * Phase 8.6: Career Criticality Engine - Main Orchestrator
 *
 * Generates comprehensive criticality analysis for career decisions.
 * Combines path dependency, option closure, and future flexibility analyses.
 *
 * @module criticality-engine
 * @version 1.0.0
 */

import {
  CriticalityAnalysis,
  CriticalityInput,
  CriticalityOption,
  CriticalityReport,
  CriticalityDecisionType,
  CriticalityBand,
  CriticalityEngineConfig,
  CriticalityComparison,
} from './criticality-types';

import {
  PathDependencyEngine,
  createPathDependencyEngine,
} from './path-dependency-engine';

import {
  OptionClosureEngine,
  createOptionClosureEngine,
} from './option-closure-engine';

import {
  FutureFlexibilityEngine,
  createFutureFlexibilityEngine,
} from './future-flexibility-engine';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: CriticalityEngineConfig = {
  pathDependencyWeight: 0.35,
  optionClosureWeight: 0.35,
  flexibilityWeight: 0.30,
  bandThresholds: {
    veryLow: 15,
    low: 35,
    moderate: 55,
    high: 75,
    veryHigh: 90,
  },
  includeExplanations: true,
  includeMitigations: true,
};

// ============================================================================
// DECISION TYPE CRITICALITY DATA
// ============================================================================

/**
 * Criticality profiles for decision types
 */
const DECISION_TYPE_PROFILES: Record<CriticalityDecisionType, {
  baseCriticality: number;
  timeSensitivity: number;
  reversibilityDifficulty: number;
  pathDependencyWeight: number;
  explanation: string;
}> = {
  'MAJOR_SELECTION': {
    baseCriticality: 45,
    timeSensitivity: 70,
    reversibilityDifficulty: 50,
    pathDependencyWeight: 60,
    explanation: 'Major selection creates moderate path dependency but can be changed within first year or two.',
  },
  'DEGREE_SELECTION': {
    baseCriticality: 55,
    timeSensitivity: 80,
    reversibilityDifficulty: 60,
    pathDependencyWeight: 70,
    explanation: 'Degree selection commits 3-5 years and significantly influences career trajectory.',
  },
  'COLLEGE_SELECTION': {
    baseCriticality: 35,
    timeSensitivity: 60,
    reversibilityDifficulty: 30,
    pathDependencyWeight: 40,
    explanation: 'College selection is important but transfer options often remain available.',
  },
  'CAREER_SELECTION': {
    baseCriticality: 65,
    timeSensitivity: 75,
    reversibilityDifficulty: 65,
    pathDependencyWeight: 70,
    explanation: 'Initial career selection sets trajectory but switching remains possible.',
  },
  'DROP_YEAR_DECISION': {
    baseCriticality: 60,
    timeSensitivity: 85,
    reversibilityDifficulty: 70,
    pathDependencyWeight: 65,
    explanation: 'Gap years can be beneficial but each additional year increases pressure and reduces alternatives.',
  },
  'STUDY_ABROAD_DECISION': {
    baseCriticality: 55,
    timeSensitivity: 70,
    reversibilityDifficulty: 55,
    pathDependencyWeight: 60,
    explanation: 'Study abroad creates international networks but also visa and financial commitments.',
  },
  'ENTREPRENEURSHIP_DECISION': {
    baseCriticality: 60,
    timeSensitivity: 80,
    reversibilityDifficulty: 50,
    pathDependencyWeight: 55,
    explanation: 'Entrepreneurship is high-risk but skills gained are often transferable.',
  },
  'JOB_ACCEPTANCE': {
    baseCriticality: 50,
    timeSensitivity: 60,
    reversibilityDifficulty: 40,
    pathDependencyWeight: 50,
    explanation: 'Job acceptance is moderately binding but job changes are increasingly common.',
  },
  'CAREER_SWITCHING': {
    baseCriticality: 70,
    timeSensitivity: 90,
    reversibilityDifficulty: 80,
    pathDependencyWeight: 75,
    explanation: 'Career switching later in life involves significant investment and risk.',
  },
  'GRADUATE_EDUCATION': {
    baseCriticality: 65,
    timeSensitivity: 75,
    reversibilityDifficulty: 65,
    pathDependencyWeight: 70,
    explanation: 'Graduate education is a significant investment that typically requires completion.',
  },
  'SPECIALIZATION_CHOICE': {
    baseCriticality: 60,
    timeSensitivity: 70,
    reversibilityDifficulty: 75,
    pathDependencyWeight: 80,
    explanation: 'Deep specialization creates expertise but limits lateral mobility.',
  },
  'LOCATION_DECISION': {
    baseCriticality: 40,
    timeSensitivity: 50,
    reversibilityDifficulty: 35,
    pathDependencyWeight: 30,
    explanation: 'Location decisions are important but increasingly reversible with remote work.',
  },
};

// ============================================================================
// CRITICALITY ENGINE
// ============================================================================

/**
 * Main engine for career criticality analysis
 */
export class CriticalityEngine {
  private pathDependencyEngine: PathDependencyEngine;
  private optionClosureEngine: OptionClosureEngine;
  private futureFlexibilityEngine: FutureFlexibilityEngine;
  private config: CriticalityEngineConfig;

  constructor(config?: Partial<CriticalityEngineConfig>) {
    this.pathDependencyEngine = createPathDependencyEngine();
    this.optionClosureEngine = createOptionClosureEngine();
    this.futureFlexibilityEngine = createFutureFlexibilityEngine();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze criticality for a decision option
   */
  analyzeCriticality(input: CriticalityInput): CriticalityAnalysis {
    const option = input.options[0]; // Primary option
    const decisionType = input.decisionType;

    // Run sub-engine analyses
    const pathDependency = this.pathDependencyEngine.analyzePathDependency(
      option,
      decisionType,
      input.context
    );

    const optionClosure = this.optionClosureEngine.analyzeOptionClosure(
      option,
      decisionType,
      input.context
    );

    const futureFlexibility = this.futureFlexibilityEngine.analyzeFutureFlexibility(
      option,
      decisionType,
      input.context
    );

    // Calculate overall criticality score
    const criticalityScore = this.calculateCriticalityScore(
      pathDependency.dependencyScore,
      optionClosure.doorsClosed,
      optionClosure.doorsOpened,
      futureFlexibility.futureFlexibilityScore,
      decisionType
    );

    // Determine criticality band
    const criticalityBand = this.scoreToBand(criticalityScore);

    // Generate reason
    const criticalityReason = this.generateCriticalityReason(
      criticalityBand,
      pathDependency,
      optionClosure,
      futureFlexibility,
      decisionType
    );

    return {
      id: `criticality-${Date.now()}`,
      decisionType,
      criticalityScore,
      criticalityBand,
      criticalityReason,
      futureImpact: this.calculateFutureImpact(criticalityScore),
      optionalityLoss: this.calculateOptionalityLoss(optionClosure, futureFlexibility),
      decisionWeight: this.calculateDecisionWeight(criticalityScore),
      pathDependency,
      optionClosure,
      futureFlexibility,
      timestamp: new Date(),
    };
  }

  /**
   * Compare criticality across multiple options
   */
  compareCriticality(input: CriticalityInput): CriticalityComparison {
    const analyses = input.options.map(option => {
      const singleOptionInput: CriticalityInput = {
        ...input,
        options: [option],
      };
      return this.analyzeCriticality(singleOptionInput);
    });

    const options = analyses.map((analysis, index) => ({
      optionId: input.options[index].id,
      optionName: input.options[index].name,
      criticalityScore: analysis.criticalityScore,
      criticalityBand: analysis.criticalityBand,
      keyConstraint: analysis.pathDependency.evidence[0]?.description || 'General constraint',
    }));

    // Sort by criticality score
    const sorted = [...options].sort((a, b) => b.criticalityScore - a.criticalityScore);

    return {
      options,
      lowestCriticalityOption: sorted[sorted.length - 1]?.optionId || '',
      highestCriticalityOption: sorted[0]?.optionId || '',
      recommendation: this.generateComparisonRecommendation(sorted),
    };
  }

  /**
   * Calculate overall criticality score
   */
  private calculateCriticalityScore(
    dependencyScore: number,
    doorsClosed: number,
    doorsOpened: number,
    flexibilityScore: number,
    decisionType: CriticalityDecisionType
  ): number {
    const profile = DECISION_TYPE_PROFILES[decisionType];
    const baseScore = profile?.baseCriticality ?? 50;

    // Component scores (normalized to 0-100)
    const pathScore = dependencyScore * 100;
    const closureScore = Math.min(100, (doorsClosed / (doorsOpened || 1)) * 50);
    const flexibilityComponent = 100 - flexibilityScore;

    // Weighted combination
    const weightedScore =
      pathScore * this.config.pathDependencyWeight +
      closureScore * this.config.optionClosureWeight +
      flexibilityComponent * this.config.flexibilityWeight;

    // Blend with base score
    const finalScore = Math.round((weightedScore * 0.7) + (baseScore * 0.3));

    return Math.max(10, Math.min(100, finalScore));
  }

  /**
   * Convert score to criticality band
   */
  private scoreToBand(score: number): CriticalityBand {
    const { bandThresholds } = this.config;
    
    if (score < bandThresholds.veryLow) return 'VERY_LOW';
    if (score < bandThresholds.low) return 'LOW';
    if (score < bandThresholds.moderate) return 'MODERATE';
    if (score < bandThresholds.high) return 'HIGH';
    if (score < bandThresholds.veryHigh) return 'VERY_HIGH';
    return 'CRITICAL';
  }

  /**
   * Generate human-readable criticality reason
   */
  private generateCriticalityReason(
    band: CriticalityBand,
    pathDependency: CriticalityAnalysis['pathDependency'],
    optionClosure: CriticalityAnalysis['optionClosure'],
    futureFlexibility: CriticalityAnalysis['futureFlexibility'],
    decisionType: CriticalityDecisionType
  ): string {
    const profile = DECISION_TYPE_PROFILES[decisionType];
    const baseExplanation = profile?.explanation || '';

    const bandExplanations: Record<CriticalityBand, string> = {
      'VERY_LOW': `This decision has minimal long-term impact. ${baseExplanation} You can easily change course if needed.`,
      'LOW': `This decision has limited future constraints. ${baseExplanation} Flexibility remains high.`,
      'MODERATE': `This decision moderately constrains future options. ${baseExplanation} Consider the tradeoffs carefully.`,
      'HIGH': `This decision significantly impacts future pathways. ${baseExplanation} Changing course later will require substantial effort.`,
      'VERY_HIGH': `This decision has profound long-term implications. ${baseExplanation} Future flexibility will be severely limited.`,
      'CRITICAL': `This is a life-defining decision. ${baseExplanation} The path chosen will be very difficult to reverse.`,
    };

    let reason = bandExplanations[band];

    // Add specific details
    if (optionClosure.doorsClosed > optionClosure.doorsOpened) {
      reason += ` It closes ${optionClosure.doorsClosed} paths while opening ${optionClosure.doorsOpened}.`;
    }

    if (futureFlexibility.futureFlexibilityScore < 40) {
      reason += ` Future flexibility will be significantly constrained.`;
    }

    return reason;
  }

  /**
   * Calculate future impact level
   */
  private calculateFutureImpact(score: number): 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'TRANSFORMATIVE' {
    if (score < 30) return 'MINIMAL';
    if (score < 55) return 'MODERATE';
    if (score < 80) return 'SIGNIFICANT';
    return 'TRANSFORMATIVE';
  }

  /**
   * Calculate optionality loss level
   */
  private calculateOptionalityLoss(
    optionClosure: CriticalityAnalysis['optionClosure'],
    futureFlexibility: CriticalityAnalysis['futureFlexibility']
  ): 'MINIMAL' | 'SOME' | 'SUBSTANTIAL' | 'SEVERE' {
    const ratio = optionClosure.doorsClosed / (optionClosure.doorsOpened + optionClosure.doorsClosed || 1);
    const flexibilityFactor = (100 - futureFlexibility.futureFlexibilityScore) / 100;
    
    const combinedScore = (ratio + flexibilityFactor) / 2;

    if (combinedScore < 0.25) return 'MINIMAL';
    if (combinedScore < 0.50) return 'SOME';
    if (combinedScore < 0.75) return 'SUBSTANTIAL';
    return 'SEVERE';
  }

  /**
   * Calculate decision weight
   */
  private calculateDecisionWeight(score: number): 'LIGHT' | 'MODERATE' | 'HEAVY' | 'VERY_HEAVY' {
    if (score < 30) return 'LIGHT';
    if (score < 55) return 'MODERATE';
    if (score < 80) return 'HEAVY';
    return 'VERY_HEAVY';
  }

  /**
   * Generate comparison recommendation
   */
  private generateComparisonRecommendation(
    sorted: CriticalityComparison['options']
  ): string {
    if (sorted.length < 2) {
      return 'Insufficient options for comparison.';
    }

    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    const diff = highest.criticalityScore - lowest.criticalityScore;

    if (diff > 30) {
      return `${lowest.optionName} offers significantly lower criticality (${lowest.criticalityScore} vs ${highest.criticalityScore}), preserving more future options.`;
    } else if (diff > 15) {
      return `${lowest.optionName} has moderately lower criticality, offering somewhat more flexibility.`;
    } else {
      return 'All options have similar criticality levels. Other factors should guide the decision.';
    }
  }

  /**
   * Quick criticality check
   */
  quickCriticalityCheck(
    optionName: string,
    decisionType: CriticalityDecisionType
): {
    criticalityScore: number;
    criticalityBand: CriticalityBand;
    warning: string;
  } {
    const mockOption: CriticalityOption = {
      id: 'quick-check',
      name: optionName,
      description: '',
      type: 'OTHER',
    };

    const mockInput: CriticalityInput = {
      decisionType,
      description: 'Quick check',
      options: [mockOption],
      context: {
        urgency: 'MEDIUM',
        resources: 'MODERATE',
        constraints: [],
        priorDecisions: [],
        riskTolerance: 'MODERATE',
      },
      studentProfile: {
        currentEducation: 'Undergraduate',
      },
    };

    const analysis = this.analyzeCriticality(mockInput);

    return {
      criticalityScore: analysis.criticalityScore,
      criticalityBand: analysis.criticalityBand,
      warning: this.generateWarning(analysis.criticalityBand),
    };
  }

  /**
   * Generate warning based on criticality band
   */
  private generateWarning(band: CriticalityBand): string {
    const warnings: Record<CriticalityBand, string> = {
      'VERY_LOW': 'Low stakes decision.',
      'LOW': 'Relatively low impact.',
      'MODERATE': 'Consider implications carefully.',
      'HIGH': 'Significant future impact expected.',
      'VERY_HIGH': 'Major life decision - proceed with caution.',
      'CRITICAL': 'Life-defining choice - ensure thorough deliberation.',
    };
    return warnings[band];
  }

  /**
   * Get engine configuration
   */
  getConfig(): CriticalityEngineConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<CriticalityEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a criticality engine
 */
export function createCriticalityEngine(
  config?: Partial<CriticalityEngineConfig>
): CriticalityEngine {
  return new CriticalityEngine(config);
}

/**
 * Analyze criticality for a quick check
 */
export function analyzeCriticality(input: CriticalityInput): CriticalityAnalysis {
  const engine = createCriticalityEngine();
  return engine.analyzeCriticality(input);
}

/**
 * Compare criticality across options
 */
export function compareCriticality(input: CriticalityInput): CriticalityComparison {
  const engine = createCriticalityEngine();
  return engine.compareCriticality(input);
}

/**
 * Quick criticality check
 */
export function quickCriticalityCheck(
  optionName: string,
  decisionType: CriticalityDecisionType
): {
  criticalityScore: number;
  criticalityBand: CriticalityBand;
  warning: string;
} {
  const engine = createCriticalityEngine();
  return engine.quickCriticalityCheck(optionName, decisionType);
}
