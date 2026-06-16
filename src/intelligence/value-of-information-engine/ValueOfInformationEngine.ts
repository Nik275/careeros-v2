/**
 * CareerOS Value of Information Engine
 *
 * Identifies which additional information would most improve decision quality.
 *
 * Inputs:
 * - StudentBelief
 * - Utility Profile
 * - Decision Intelligence Results
 * - Uncertainty Profiles
 * - Future Simulation Results
 *
 * Output:
 * - ValueOfInformationReport
 *
 * Requirements:
 * - Deterministic
 * - Explainable
 * - Strong TypeScript typing
 * - Compatible with existing engines
 */

import {
  DEFAULT_VOI_CONFIG,
} from './types';

import type {
  ValueOfInformationInput,
  ValueOfInformationReport,
  ValueOfInformationEngineConfig,
} from './types';

import { InformationGapDetector, createInformationGapDetector } from './InformationGapDetector';
import { ValueOfInformationCalculator, createValueOfInformationCalculator } from './ValueOfInformationCalculator';
import { InformationPrioritizer, createInformationPrioritizer } from './InformationPrioritizer';
import { ExperimentRecommender, createExperimentRecommender } from './ExperimentRecommender';
import { VoIExplanationEngine, createVoIExplanationEngine } from './VoIExplanationEngine';

/**
 * Main Value of Information Engine.
 *
 * Orchestrates gap detection, VoI calculation, prioritization,
 * experiment recommendation, and explanation generation.
 */
export class ValueOfInformationEngine {
  private config: ValueOfInformationEngineConfig;
  private gapDetector: InformationGapDetector;
  private calculator: ValueOfInformationCalculator;
  private prioritizer: InformationPrioritizer;
  private experimentRecommender: ExperimentRecommender;
  private explanationEngine: VoIExplanationEngine;

  constructor(config: Partial<ValueOfInformationEngineConfig> = {}) {
    this.config = { ...DEFAULT_VOI_CONFIG, ...config };

    this.gapDetector = createInformationGapDetector(this.config);
    this.calculator = createValueOfInformationCalculator(this.config);
    this.prioritizer = createInformationPrioritizer(this.config);
    this.experimentRecommender = createExperimentRecommender(this.config);
    this.explanationEngine = createVoIExplanationEngine(this.config);
  }

  /**
   * Analyze and generate VoI report.
   *
   * @param input - All inputs for VoI analysis
   * @returns Complete Value of Information Report
   */
  analyze(input: ValueOfInformationInput): ValueOfInformationReport {
    const {
      studentBelief,
      utilityProfile,
      decisionResults,
      uncertaintyProfile,
      constraints,
    } = input;

    // Step 1: Detect information gaps
    const gapDetectionResult = this.gapDetector.detect(
      studentBelief,
      uncertaintyProfile
    );

    // Step 2: Calculate value of information for each gap
    const calculations = this.calculator.calculate(
      gapDetectionResult.gaps,
      uncertaintyProfile,
      decisionResults
    );

    // Step 3: Prioritize information opportunities
    const prioritizationResult = this.prioritizer.prioritize(
      gapDetectionResult.gaps,
      calculations
    );

    // Step 4: Recommend experiments
    const experimentResult = this.experimentRecommender.recommend(
      gapDetectionResult.gaps
    );

    // Step 5: Generate explanation
    const explanation = this.explanationEngine.explain(
      gapDetectionResult.gaps,
      prioritizationResult.rankedOpportunities,
      experimentResult.topRecommendation,
      decisionResults
    );

    // Step 6: Calculate expected improvements
    const expectedImprovements = this.calculateExpectedImprovements(
      prioritizationResult.minimumViableSet
    );

    // Step 7: Build action plan
    const actionPlan = this.buildActionPlan(
      prioritizationResult,
      constraints
    );

    // Step 8: Calculate value vs no information
    const valueVsNoInformation = this.calculateValueVsNoInformation(
      calculations,
      prioritizationResult.rankedOpportunities
    );

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      studentId: studentBelief.studentId,
      currentDecisionState: {
        topPath: decisionResults.bestOverall?.path?.name || 'unknown',
        confidence: (decisionResults.confidence?.overall || 50) / 100,
        utility: decisionResults.bestOverall?.expectedUtility?.score || 50,
        uncertainty: 1 - (decisionResults.confidence?.overall || 50) / 100,
      },
      informationGaps: gapDetectionResult.gaps,
      criticalGaps: gapDetectionResult.gaps.filter((g) => g.priority === 'critical'),
      opportunities: prioritizationResult.rankedOpportunities,
      highestValueActivities: prioritizationResult.rankedOpportunities.slice(0, 5),
      recommendedExperiments: experimentResult.experiments,
      expectedImprovements,
      explanation,
      actionPlan,
      valueVsNoInformation,
    };
  }

  /**
   * Quick analysis with minimal inputs.
   */
  quickAnalyze(
    studentBelief: ValueOfInformationInput['studentBelief'],
    uncertaintyProfile: ValueOfInformationInput['uncertaintyProfile'],
    decisionResults: ValueOfInformationInput['decisionResults']
  ): ValueOfInformationReport {
    return this.analyze({
      studentBelief,
      utilityProfile: { attributes: [] },
      decisionResults,
      uncertaintyProfile,
    });
  }

  /**
   * Get top recommendations only.
   */
  getTopRecommendations(
    input: ValueOfInformationInput,
    count: number = 3
  ): {
    gaps: ValueOfInformationReport['informationGaps'];
    opportunities: ValueOfInformationReport['opportunities'];
    experiments: ValueOfInformationReport['recommendedExperiments'];
  } {
    const report = this.analyze(input);

    return {
      gaps: report.criticalGaps.slice(0, count),
      opportunities: report.highestValueActivities.slice(0, count),
      experiments: report.recommendedExperiments.slice(0, count),
    };
  }

  /**
   * Calculate expected improvements from information gathering.
   */
  private calculateExpectedImprovements(
    minimumViableSet: ValueOfInformationReport['actionPlan']['immediate']
  ): ValueOfInformationReport['expectedImprovements'] {
    if (minimumViableSet.length === 0) {
      return {
        confidence: 0,
        utility: 0,
        decisionQuality: 0,
      };
    }

    const totalConfidenceGain = minimumViableSet.reduce(
      (sum, opp) => sum + opp.confidenceGain,
      0
    );
    const totalUtilityImprovement = minimumViableSet.reduce(
      (sum, opp) => sum + opp.utilityImprovement,
      0
    );
    const totalDecisionImprovement = minimumViableSet.reduce(
      (sum, opp) => sum + opp.decisionImprovement,
      0
    );

    return {
      confidence: Math.min(totalConfidenceGain, 0.5),
      utility: Math.min(totalUtilityImprovement, 0.3),
      decisionQuality: Math.min(totalDecisionImprovement, 0.4),
    };
  }

  /**
   * Build action plan with timing.
   */
  private buildActionPlan(
    prioritizationResult: ReturnType<InformationPrioritizer['prioritize']>,
    constraints?: ValueOfInformationInput['constraints']
  ): ValueOfInformationReport['actionPlan'] {
    // Filter by constraints if provided
    let opportunities = prioritizationResult.rankedOpportunities;

    if (constraints?.excludedMethods) {
      opportunities = opportunities.filter(
        (opp) => !constraints.excludedMethods?.includes(opp.method)
      );
    }

    // Categorize by timeline
    const immediate: typeof opportunities = [];
    const shortTerm: typeof opportunities = [];
    const longTerm: typeof opportunities = [];

    for (const opp of opportunities) {
      const timeEstimate = opp.acquisitionCost.time.toLowerCase();

      if (timeEstimate.includes('minute') || timeEstimate.includes('hour') || timeEstimate.includes('day')) {
        immediate.push(opp);
      } else if (timeEstimate.includes('week') && !timeEstimate.includes('month')) {
        shortTerm.push(opp);
      } else {
        longTerm.push(opp);
      }
    }

    return {
      immediate: immediate.slice(0, 5),
      shortTerm: shortTerm.slice(0, 5),
      longTerm: longTerm.slice(0, 5),
    };
  }

  /**
   * Calculate value of gathering information vs not gathering it.
   */
  private calculateValueVsNoInformation(
    calculations: ReturnType<ValueOfInformationCalculator['calculate']>,
    opportunities: ValueOfInformationReport['opportunities']
  ): ValueOfInformationReport['valueVsNoInformation'] {
    if (calculations.length === 0 || opportunities.length === 0) {
      return {
        netValue: 0,
        confidenceGain: 0,
        utilityGain: 0,
      };
    }

    // Calculate average net value
    const avgNetValue =
      calculations.reduce((sum, c) => sum + c.netValue, 0) / calculations.length;

    // Calculate expected confidence gain from top opportunities
    const confidenceGain = opportunities
      .slice(0, 3)
      .reduce((sum, opp) => sum + opp.confidenceGain, 0);

    // Calculate expected utility gain
    const utilityGain = opportunities
      .slice(0, 3)
      .reduce((sum, opp) => sum + opp.utilityImprovement, 0);

    return {
      netValue: Math.max(avgNetValue, 0),
      confidenceGain: Math.min(confidenceGain, 0.5),
      utilityGain: Math.min(utilityGain, 0.3),
    };
  }

  /**
   * Generate unique ID.
   */
  private generateId(): string {
    return `voi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ValueOfInformationEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Recreate components with new config
    this.gapDetector = createInformationGapDetector(this.config);
    this.calculator = createValueOfInformationCalculator(this.config);
    this.prioritizer = createInformationPrioritizer(this.config);
    this.experimentRecommender = createExperimentRecommender(this.config);
    this.explanationEngine = createVoIExplanationEngine(this.config);
  }

  /**
   * Get current configuration.
   */
  getConfig(): ValueOfInformationEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for ValueOfInformationEngine.
 */
export function createValueOfInformationEngine(
  config?: Partial<ValueOfInformationEngineConfig>
): ValueOfInformationEngine {
  return new ValueOfInformationEngine(config);
}

/**
 * Convenience function for single-call analysis.
 */
export function analyzeValueOfInformation(
  input: ValueOfInformationInput,
  config?: Partial<ValueOfInformationEngineConfig>
): ValueOfInformationReport {
  const engine = createValueOfInformationEngine(config);
  return engine.analyze(input);
}

// Export all types and components
export * from './types';
export { InformationGapDetector, createInformationGapDetector } from './InformationGapDetector';
export { ValueOfInformationCalculator, createValueOfInformationCalculator } from './ValueOfInformationCalculator';
export { InformationPrioritizer, createInformationPrioritizer } from './InformationPrioritizer';
export { ExperimentRecommender, createExperimentRecommender } from './ExperimentRecommender';
export { VoIExplanationEngine, createVoIExplanationEngine } from './VoIExplanationEngine';
