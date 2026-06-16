/**
 * @fileoverview Golden parity gate for rollout readiness.
 */

import type { RolloutGateResult } from '../rollout/RolloutControlTypes';
import type { CombinedBaselineMetrics, FlowBaselineMetrics } from './GoldenParityBaselineMetrics';
import { calculateGoldenParityMetrics } from './GoldenParityMetrics';
import {
  evaluateGoldenParityThresholds,
  type GoldenParityThresholdMode,
} from './GoldenParityThresholds';
import type { GoldenParityCIGateResult } from './GoldenParityCIGate';
import type { GoldenScenarioResult } from './GoldenScenarioTypes';

export interface GoldenParityGateThresholds {
  minScenarioCoverage: number;
  maxDriftPercentage: number;
  maxFailurePercentage: number;
  minComparableCoveragePercentage: number;
}

const DEFAULT_THRESHOLDS: GoldenParityGateThresholds = {
  minScenarioCoverage: 40,
  maxDriftPercentage: 5,
  maxFailurePercentage: 0,
  minComparableCoveragePercentage: 80,
};

export class GoldenParityGate {
  private readonly thresholds: GoldenParityGateThresholds;

  constructor(thresholds: Partial<GoldenParityGateThresholds> = {}) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };
  }

  evaluate(results: readonly GoldenScenarioResult[]): RolloutGateResult {
    const metrics = calculateGoldenParityMetrics(results);
    const criticalFailures = results.filter(
      (result) => result.riskLevel === 'CRITICAL' && result.status !== 'MATCHED'
    );

    if (metrics.totalScenarios < this.thresholds.minScenarioCoverage) {
      return blocked('GoldenParityGate', 'Insufficient golden scenario coverage.', [
        `totalScenarios=${metrics.totalScenarios}`,
        `required=${this.thresholds.minScenarioCoverage}`,
      ]);
    }

    if (metrics.driftPercentage > this.thresholds.maxDriftPercentage) {
      return blocked('GoldenParityGate', 'Golden parity drift exceeds threshold.', [
        `driftPercentage=${metrics.driftPercentage}`,
      ]);
    }

    if (metrics.failurePercentage > this.thresholds.maxFailurePercentage) {
      return blocked('GoldenParityGate', 'Golden parity failures exceed threshold.', [
        `failurePercentage=${metrics.failurePercentage}`,
      ]);
    }

    if (metrics.comparableCoveragePercentage < this.thresholds.minComparableCoveragePercentage) {
      return blocked('GoldenParityGate', 'Comparable coverage is below threshold.', [
        `comparableCoveragePercentage=${metrics.comparableCoveragePercentage}`,
      ]);
    }

    if (criticalFailures.length > 0) {
      return blocked('GoldenParityGate', 'Critical golden scenarios failed parity.', [
        ...criticalFailures.map((failure) => `${failure.scenarioId}:${failure.status}`),
      ]);
    }

    return {
      gateName: 'GoldenParityGate',
      status: 'PASS',
      reason: 'Golden parity thresholds satisfied for validation readiness.',
      evidence: [
        `totalScenarios=${metrics.totalScenarios}`,
        `parityPercentage=${metrics.parityPercentage}`,
        `comparableCoveragePercentage=${metrics.comparableCoveragePercentage}`,
      ],
      blocking: false,
      recommendedAction: 'Continue validation. This gate does not enable live routing.',
    };
  }

  evaluateBaselineMetrics(
    metrics: FlowBaselineMetrics | CombinedBaselineMetrics,
    mode: GoldenParityThresholdMode = 'CANARY_SHADOW'
  ): RolloutGateResult {
    return evaluateGoldenParityThresholds(mode, metrics);
  }

  evaluateCIGateResult(result: GoldenParityCIGateResult): RolloutGateResult {
    return result.rolloutGate;
  }
}

function blocked(gateName: string, reason: string, evidence: readonly string[]): RolloutGateResult {
  return {
    gateName,
    status: 'BLOCKED',
    reason,
    evidence,
    blocking: true,
    recommendedAction: 'Do not advance rollout readiness until golden parity evidence improves.',
  };
}
