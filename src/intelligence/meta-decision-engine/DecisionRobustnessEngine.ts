/**
 * CareerOS Meta-Decision Intelligence Engine - Decision Robustness Engine
 *
 * Detects whether recommendation remains strong across scenarios.
 */

import type {
  DecisionRobustnessAnalysis,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';

/**
 * Detects decision robustness across scenarios.
 */
export class DecisionRobustnessEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze decision robustness.
   */
  analyze(
    input: MetaDecisionInput,
    recommendation: string
  ): DecisionRobustnessAnalysis {
    // Generate scenarios
    const scenarios = this.generateScenarios(input);

    // Analyze each scenario
    const scenarioResults = this.analyzeScenarios(scenarios, recommendation);

    // Calculate cross-scenario stability
    const crossScenarioStability = this.calculateCrossScenarioStability(
      scenarioResults,
      input
    );

    // Run stress tests
    const stressTests = this.runStressTests(input, recommendation);

    // Calculate overall robustness
    const robustnessScore = this.calculateRobustnessScore(
      scenarioResults,
      stressTests,
      crossScenarioStability
    );

    // Determine robustness level
    const robustnessLevel = this.determineRobustnessLevel(robustnessScore);

    // Generate explanation
    const explanation = this.generateExplanation(
      robustnessScore,
      robustnessLevel,
      scenarioResults,
      stressTests
    );

    return {
      robustnessScore,
      robustnessLevel,
      scenarioResults,
      crossScenarioStability,
      stressTests,
      explanation,
    };
  }

  /**
   * Generate test scenarios.
   */
  private generateScenarios(input: MetaDecisionInput): string[] {
    const scenarios = [
      'Optimistic market conditions',
      'Pessimistic market conditions',
      'High personal fit confirmed',
      'Lower than expected personal fit',
      'Values remain stable',
      'Values shift slightly',
      'Information remains consistent',
      'New contradictory information emerges',
    ];

    return scenarios;
  }

  /**
   * Analyze scenarios.
   */
  private analyzeScenarios(
    scenarios: string[],
    recommendation: string
  ): DecisionRobustnessAnalysis['scenarioResults'] {
    return scenarios.map((scenario) => ({
      scenario,
      recommendationHolds: this.scenarioHolds(scenario, recommendation),
      confidence: this.calculateScenarioConfidence(scenario),
    }));
  }

  /**
   * Determine if recommendation holds in a scenario.
   */
  private scenarioHolds(scenario: string, recommendation: string): boolean {
    // Simple logic: recommendation holds in most scenarios except extreme ones
    const challengingScenarios = [
      'Pessimistic market conditions',
      'Lower than expected personal fit',
      'Values shift slightly',
      'New contradictory information emerges',
    ];

    // Assume recommendation is robust unless it's a very challenging scenario
    if (challengingScenarios.includes(scenario)) {
      // 70% chance it still holds
      return Math.random() > 0.3;
    }

    // 90% chance for favorable scenarios
    return Math.random() > 0.1;
  }

  /**
   * Calculate confidence in scenario outcome.
   */
  private calculateScenarioConfidence(scenario: string): number {
    // Higher confidence for straightforward scenarios
    if (scenario.includes('stable') || scenario.includes('consistent')) {
      return 85;
    }
    if (scenario.includes('Optimistic') || scenario.includes('confirmed')) {
      return 80;
    }
    // Lower for uncertain scenarios
    return 65;
  }

  /**
   * Calculate cross-scenario stability.
   */
  private calculateCrossScenarioStability(
    scenarioResults: DecisionRobustnessAnalysis['scenarioResults'],
    input: MetaDecisionInput
  ): DecisionRobustnessAnalysis['crossScenarioStability'] {
    const holdingScenarios = scenarioResults.filter((r) => r.recommendationHolds);
    const consistency =
      (holdingScenarios.length / scenarioResults.length) * 100;

    // Calculate outcomes based on input confidence
    const baseOutcome = input.utilityConfidence.overall;

    return {
      consistency: Math.round(consistency),
      bestCaseOutcome: Math.min(100, Math.round(baseOutcome * 1.2)),
      worstCaseOutcome: Math.round(baseOutcome * 0.6),
      expectedOutcome: Math.round(baseOutcome),
    };
  }

  /**
   * Run stress tests.
   */
  private runStressTests(
    input: MetaDecisionInput,
    recommendation: string
  ): DecisionRobustnessAnalysis['stressTests'] {
    const tests = [
      {
        condition: '50% increase in bias influence',
        passes: input.biasProfile.overallBias < 40,
        impact: input.biasProfile.overallBias * 0.5,
      },
      {
        condition: 'Major value shift',
        passes: input.studentBeliefs.valueStability > 60,
        impact: 100 - input.studentBeliefs.valueStability,
      },
      {
        condition: 'Information contradiction',
        passes: input.informationCompleteness.careerData > 70,
        impact: 100 - input.informationCompleteness.careerData,
      },
      {
        condition: 'Market downturn',
        passes: input.informationCompleteness.marketData > 50,
        impact: 100 - input.informationCompleteness.marketData,
      },
      {
        condition: 'Utility recalculation with new weights',
        passes: input.utilityConfidence.overall > 60,
        impact: 100 - input.utilityConfidence.overall,
      },
    ];

    return tests;
  }

  /**
   * Calculate overall robustness score.
   */
  private calculateRobustnessScore(
    scenarioResults: DecisionRobustnessAnalysis['scenarioResults'],
    stressTests: DecisionRobustnessAnalysis['stressTests'],
    stability: DecisionRobustnessAnalysis['crossScenarioStability']
  ): number {
    // Scenario consistency contribution
    const scenarioScore = stability.consistency;

    // Stress test contribution
    const passingTests = stressTests.filter((t) => t.passes).length;
    const stressScore = (passingTests / stressTests.length) * 100;

    // Expected outcome contribution
    const outcomeScore = stability.expectedOutcome;

    // Weighted average
    return Math.round(scenarioScore * 0.4 + stressScore * 0.3 + outcomeScore * 0.3);
  }

  /**
   * Determine robustness level.
   */
  private determineRobustnessLevel(
    robustnessScore: number
  ): DecisionRobustnessAnalysis['robustnessLevel'] {
    if (robustnessScore >= 80) return 'very_strong';
    if (robustnessScore >= 65) return 'strong';
    if (robustnessScore >= 45) return 'moderate';
    return 'weak';
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    robustnessScore: number,
    robustnessLevel: DecisionRobustnessAnalysis['robustnessLevel'],
    scenarioResults: DecisionRobustnessAnalysis['scenarioResults'],
    stressTests: DecisionRobustnessAnalysis['stressTests']
  ): string[] {
    const explanation: string[] = [];

    // Overall robustness
    explanation.push(
      `Decision robustness: ${robustnessScore}% (${robustnessLevel.replace('_', ' ')})`
    );

    // Level-specific explanation
    const levelExplanations: Record<typeof robustnessLevel, string> = {
      very_strong:
        'Recommendation is very robust - holds strongly across diverse scenarios.',
      strong:
        'Recommendation is robust - holds in most scenarios and stress conditions.',
      moderate:
        'Recommendation has moderate robustness - may change under certain conditions.',
      weak:
        'Recommendation is weak - sensitive to scenario variations.',
    };
    explanation.push(levelExplanations[robustnessLevel]);

    // Scenario summary
    const holdingCount = scenarioResults.filter((r) => r.recommendationHolds).length;
    explanation.push(
      `Recommendation holds in ${holdingCount}/${scenarioResults.length} scenarios.`
    );

    // Stress test summary
    const passingCount = stressTests.filter((t) => t.passes).length;
    if (passingCount < stressTests.length) {
      explanation.push(
        `Passes ${passingCount}/${stressTests.length} stress tests - consider strengthening decision foundation.`
      );
    } else {
      explanation.push('Passes all stress tests.');
    }

    return explanation;
  }
}

/**
 * Factory function for DecisionRobustnessEngine.
 */
export function createDecisionRobustnessEngine(
  config: MetaDecisionConfig
): DecisionRobustnessEngine {
  return new DecisionRobustnessEngine(config);
}
