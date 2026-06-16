/**
 * Counterfactual Engine
 *
 * Tests "What would change the recommendation?"
 * Analyzes sensitivity to different variables.
 */

import {
  CounterfactualReport,
  ValidationTimestamp,
  ValidationId,
} from './validation-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CounterfactualConfig {
  // Sensitivity thresholds
  minorChangeThreshold: number;  // 0-100
  moderateChangeThreshold: number;
  majorChangeThreshold: number;

  // Variable ranges
  minVariableChange: number;
  maxVariableChange: number;

  // Scenario settings
  maxScenarios: number;
  minSensitivityScore: number;
}

export const DEFAULT_COUNTERFACTUAL_CONFIG: CounterfactualConfig = {
  minorChangeThreshold: 10,
  moderateChangeThreshold: 25,
  majorChangeThreshold: 50,
  minVariableChange: -50,
  maxVariableChange: 50,
  maxScenarios: 20,
  minSensitivityScore: 10,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface CounterfactualInput {
  studentId: string;
  baseProfile: Record<string, unknown>;
  baseRecommendation: {
    careerId: string;
    careerName: string;
    confidence: number;
    score: number;
  };
  variables: Array<{
    name: string;
    currentValue: unknown;
    type: 'numeric' | 'boolean' | 'categorical' | 'array';
    range?: { min: number; max: number };
    categories?: string[];
  }>;
}

// ============================================================================
// ENGINE
// ============================================================================

export class CounterfactualEngine {
  private config: CounterfactualConfig;

  constructor(config: Partial<CounterfactualConfig> = {}) {
    this.config = { ...DEFAULT_COUNTERFACTUAL_CONFIG, ...config };
  }

  /**
   * Generate counterfactual analysis
   */
  async analyzeCounterfactuals(
    input: CounterfactualInput,
    recommendationProvider: (
      profile: Record<string, unknown>
    ) => Promise<{ careerId: string; careerName: string; confidence: number; score: number }>
  ): Promise<CounterfactualReport> {
    const reportId = `counterfactual-${input.studentId}-${Date.now()}`;
    const generatedAt = Date.now();

    // Generate scenarios
    const scenarios = await this.generateScenarios(input, recommendationProvider);

    // Calculate sensitivity ranking
    const sensitivityRanking = this.calculateSensitivityRanking(scenarios);

    // Calculate robustness
    const robustness = this.calculateRobustness(scenarios);

    // Determine decision boundaries
    const decisionBoundaries = this.determineDecisionBoundaries(scenarios);

    return {
      reportId,
      generatedAt,
      studentId: input.studentId,
      baseRecommendation: input.baseRecommendation.careerName,
      scenarios,
      sensitivityRanking,
      robustness,
      decisionBoundaries,
    };
  }

  /**
   * Test single counterfactual
   */
  async testCounterfactual(
    baseProfile: Record<string, unknown>,
    variable: string,
    newValue: unknown,
    recommendationProvider: (
      profile: Record<string, unknown>
    ) => Promise<{ careerId: string; careerName: string }>
  ): Promise<{
    wouldChange: boolean;
    originalRecommendation: string;
    counterfactualRecommendation: string;
    magnitude: 'minor' | 'moderate' | 'major' | 'fundamental';
  }> {
    const original = await recommendationProvider(baseProfile);

    const modifiedProfile = this.setNestedValue({ ...baseProfile }, variable, newValue);
    const counterfactual = await recommendationProvider(modifiedProfile);

    const wouldChange = original.careerId !== counterfactual.careerId;

    return {
      wouldChange,
      originalRecommendation: original.careerName,
      counterfactualRecommendation: counterfactual.careerName,
      magnitude: this.determineMagnitude(baseProfile, modifiedProfile),
    };
  }

  /**
   * Find critical threshold for a variable
   */
  async findCriticalThreshold(
    baseProfile: Record<string, unknown>,
    variable: string,
    targetRecommendation: string,
    recommendationProvider: (
      profile: Record<string, unknown>
    ) => Promise<{ careerId: string; careerName: string }>,
    options?: { min?: number; max?: number; precision?: number }
  ): Promise<{
    threshold: number | null;
    belowRecommendation: string;
    aboveRecommendation: string;
  }> {
    const min = options?.min ?? 0;
    const max = options?.max ?? 100;
    const precision = options?.precision ?? 1;

    const original = await recommendationProvider(baseProfile);

    // Binary search for threshold
    let low = min;
    let high = max;
    let threshold: number | null = null;

    while (high - low > precision) {
      const mid = (low + high) / 2;
      const modified = this.setNestedValue({ ...baseProfile }, variable, mid);
      const result = await recommendationProvider(modified);

      if (result.careerName === targetRecommendation) {
        threshold = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    return {
      threshold,
      belowRecommendation: original.careerName,
      aboveRecommendation: targetRecommendation,
    };
  }

  /**
   * Get current config
   */
  getConfig(): CounterfactualConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<CounterfactualConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async generateScenarios(
    input: CounterfactualInput,
    recommendationProvider: (
      profile: Record<string, unknown>
    ) => Promise<{ careerId: string; careerName: string; confidence: number; score: number }>
  ): Promise<CounterfactualReport['scenarios']> {
    const scenarios: CounterfactualReport['scenarios'] = [];

    for (const variable of input.variables.slice(0, this.config.maxScenarios)) {
      // Generate counterfactual values
      const counterfactualValues = this.generateCounterfactualValues(variable);

      for (const newValue of counterfactualValues) {
        try {
          const modifiedProfile = this.setNestedValue(
            { ...input.baseProfile },
            variable.name,
            newValue
          );

          const counterfactual = await recommendationProvider(modifiedProfile);
          const wouldChange = counterfactual.careerId !== input.baseRecommendation.careerId;

          if (wouldChange || scenarios.length < 5) {
            scenarios.push({
              scenarioId: `${variable.name}-${scenarios.length}`,
              description: `Change ${variable.name} from ${variable.currentValue} to ${newValue}`,
              change: {
                variable: variable.name,
                from: variable.currentValue,
                to: newValue,
              },
              originalRecommendation: input.baseRecommendation.careerName,
              counterfactualRecommendation: counterfactual.careerName,
              wouldChange,
              magnitude: this.determineMagnitudeByChange(variable, newValue),
              reasoning: this.generateReasoning(variable, newValue, wouldChange),
              sensitivityScore: this.calculateSensitivityScore(
                input.baseRecommendation,
                counterfactual
              ),
            });
          }
        } catch {
          console.error('Counterfactual scenario generation failed safely.');
        }
      }
    }

    return scenarios.sort((a, b) => b.sensitivityScore - a.sensitivityScore);
  }

  private generateCounterfactualValues(
    variable: CounterfactualInput['variables'][0]
  ): unknown[] {
    const values: unknown[] = [];

    switch (variable.type) {
      case 'numeric': {
        const range = variable.range ?? { min: 0, max: 100 };
        const step = (range.max - range.min) / 5;
        for (let i = 1; i <= 4; i++) {
          values.push(range.min + step * i);
        }
        break;
      }

      case 'boolean':
        values.push(!(variable.currentValue as boolean));
        break;

      case 'categorical':
        if (variable.categories) {
          for (const cat of variable.categories) {
            if (cat !== variable.currentValue) {
              values.push(cat);
            }
          }
        }
        break;

      case 'array': {
        const arr = variable.currentValue as string[];
        if (arr.length > 0) {
          // Remove one element
          values.push(arr.slice(1));
          // Add new element
          values.push([...arr, 'new-item']);
        }
        break;
      }
    }

    return values.slice(0, 3);
  }

  private determineMagnitudeByChange(
    variable: CounterfactualInput['variables'][0],
    newValue: unknown
  ): CounterfactualReport['scenarios'][0]['magnitude'] {
    if (variable.type !== 'numeric') {
      return 'moderate';
    }

    const current = variable.currentValue as number;
    const change = Math.abs((newValue as number) - current);
    const percentChange = variable.range
      ? change / (variable.range.max - variable.range.min)
      : change / 100;

    if (percentChange < this.config.minorChangeThreshold / 100) return 'minor';
    if (percentChange < this.config.moderateChangeThreshold / 100) return 'moderate';
    if (percentChange < this.config.majorChangeThreshold / 100) return 'major';
    return 'fundamental';
  }

  private determineMagnitude(
    original: Record<string, unknown>,
    modified: Record<string, unknown>
  ): CounterfactualReport['scenarios'][0]['magnitude'] {
    const differences = this.countDifferences(original, modified);

    if (differences <= 1) return 'minor';
    if (differences <= 3) return 'moderate';
    if (differences <= 5) return 'major';
    return 'fundamental';
  }

  private generateReasoning(
    variable: CounterfactualInput['variables'][0],
    newValue: unknown,
    wouldChange: boolean
  ): string {
    if (wouldChange) {
      return `Changing ${variable.name} to ${newValue} significantly alters the recommendation profile.`;
    }
    return `The recommendation is robust to changes in ${variable.name}.`;
  }

  private calculateSensitivityScore(
    original: CounterfactualInput['baseRecommendation'],
    counterfactual: { confidence: number; score: number }
  ): number {
    const confidenceDelta = Math.abs(original.confidence - counterfactual.confidence);
    const scoreDelta = Math.abs(original.score - counterfactual.score);
    return Math.min(100, confidenceDelta + scoreDelta);
  }

  private calculateSensitivityRanking(
    scenarios: CounterfactualReport['scenarios']
  ): CounterfactualReport['sensitivityRanking'] {
    const variableScores: Record<string, number[]> = {};

    for (const scenario of scenarios) {
      const variable = scenario.change.variable;
      if (!variableScores[variable]) {
        variableScores[variable] = [];
      }
      variableScores[variable].push(scenario.sensitivityScore);
    }

    const ranking: CounterfactualReport['sensitivityRanking'] = [];

    for (const [variable, scores] of Object.entries(variableScores)) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const maxScore = Math.max(...scores);

      ranking.push({
        variable,
        sensitivityScore: Math.round(maxScore),
        impact:
          maxScore > this.config.majorChangeThreshold
            ? 'high'
            : maxScore > this.config.moderateChangeThreshold
            ? 'medium'
            : 'low',
      });
    }

    return ranking.sort((a, b) => b.sensitivityScore - a.sensitivityScore);
  }

  private calculateRobustness(
    scenarios: CounterfactualReport['scenarios']
  ): CounterfactualReport['robustness'] {
    const changingScenarios = scenarios.filter(s => s.wouldChange);
    const changeRatio = changingScenarios.length / Math.max(1, scenarios.length);

    const score = Math.max(0, 100 - changeRatio * 100);

    const status: CounterfactualReport['robustness']['status'] =
      score >= 80 ? 'robust' : score >= 50 ? 'moderately-robust' : 'fragile';

    const criticalFactors = changingScenarios
      .filter(s => s.magnitude === 'major' || s.magnitude === 'fundamental')
      .map(s => s.change.variable)
      .filter((v, i, a) => a.indexOf(v) === i);

    return {
      score: Math.round(score),
      status,
      criticalFactors,
    };
  }

  private determineDecisionBoundaries(
    scenarios: CounterfactualReport['scenarios']
  ): CounterfactualReport['decisionBoundaries'] {
    const boundaries: CounterfactualReport['decisionBoundaries'] = [];

    // Group scenarios by variable
    const byVariable: Record<string, typeof scenarios> = {};
    for (const scenario of scenarios) {
      const variable = scenario.change.variable;
      if (!byVariable[variable]) {
        byVariable[variable] = [];
      }
      byVariable[variable].push(scenario);
    }

    for (const [variable, variableScenarios] of Object.entries(byVariable)) {
      const changingScenarios = variableScenarios.filter(s => s.wouldChange);

      if (changingScenarios.length > 0) {
        // Find threshold where recommendation changes
        const threshold = this.estimateThreshold(changingScenarios);

        boundaries.push({
          variable,
          threshold,
          belowRecommendation: changingScenarios[0].originalRecommendation,
          aboveRecommendation: changingScenarios[0].counterfactualRecommendation,
        });
      }
    }

    return boundaries;
  }

  private estimateThreshold(scenarios: CounterfactualReport['scenarios']): number {
    // Simple average of values that cause change
    const values = scenarios
      .filter(s => typeof s.change.to === 'number')
      .map(s => s.change.to as number);

    return values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 50;
  }

  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): Record<string, unknown> {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return obj;
  }

  private countDifferences(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
    prefix = '',
    visited = new WeakSet<object>()
  ): number {
    // Handle circular references
    if (visited.has(obj1) || visited.has(obj2)) {
      return 0;
    }
    visited.add(obj1);
    visited.add(obj2);

    let count = 0;
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        count += this.countDifferences(
          val1 as Record<string, unknown>,
          val2 as Record<string, unknown>,
          path,
          visited
        );
      } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        count++;
      }
    }

    return count;
  }
}

export default CounterfactualEngine;
