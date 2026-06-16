/**
 * @fileoverview CI-safe parity gate for expanded golden parity suites.
 */

import type { RolloutGateResult } from '../rollout/RolloutControlTypes';
import type { CombinedBaselineMetrics } from './GoldenParityBaselineMetrics';
import type { GoldenParityFullExpandedSuiteResult } from './GoldenParityRunner';

export interface GoldenParityCIGateThresholds {
  minimumTotalScenarios: number;
  minimumExecutableCoveragePercentage: number;
  minimumComparableCoveragePercentage: number;
  minimumParityPercentage: number;
  maximumDriftPercentage: number;
  maximumFailurePercentage: number;
  maximumCriticalDriftCount: number;
}

export interface GoldenParityCIGateResult {
  status: 'PASS' | 'FAIL';
  passed: boolean;
  evaluatedAt: string;
  metrics: CombinedBaselineMetrics;
  thresholds: GoldenParityCIGateThresholds;
  failures: readonly string[];
  rolloutGate: RolloutGateResult;
}

const DEFAULT_THRESHOLDS: GoldenParityCIGateThresholds = Object.freeze({
  minimumTotalScenarios: 200,
  minimumExecutableCoveragePercentage: 95,
  minimumComparableCoveragePercentage: 90,
  minimumParityPercentage: 98,
  maximumDriftPercentage: 1,
  maximumFailurePercentage: 1,
  maximumCriticalDriftCount: 0,
});

export class GoldenParityCIGate {
  private readonly thresholds: GoldenParityCIGateThresholds;
  private readonly now: () => string;

  constructor(
    thresholds: Partial<GoldenParityCIGateThresholds> = {},
    options: { now?: () => string } = {}
  ) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluateExpandedSuite(result: GoldenParityFullExpandedSuiteResult): GoldenParityCIGateResult {
    return this.evaluateMetrics(result.metrics.combined);
  }

  evaluateMetrics(metrics: CombinedBaselineMetrics): GoldenParityCIGateResult {
    const failures = collectFailures(metrics, this.thresholds);
    const passed = failures.length === 0;
    return {
      status: passed ? 'PASS' : 'FAIL',
      passed,
      evaluatedAt: this.now(),
      metrics,
      thresholds: this.thresholds,
      failures,
      rolloutGate: {
        gateName: 'GoldenParityCIGate',
        status: passed ? 'PASS' : 'BLOCKED',
        reason: passed
          ? 'Expanded parity CI thresholds satisfied.'
          : 'Expanded parity CI thresholds were not satisfied.',
        evidence: failures.length > 0 ? failures : [
          `totalScenarios=${metrics.totalScenarios}`,
          `parityPercentage=${metrics.parityPercentage}`,
          `comparableCoveragePercentage=${metrics.comparableCoveragePercentage}`,
        ],
        blocking: !passed,
        recommendedAction: passed
          ? 'Use as validation evidence only. This does not enable live routing.'
          : 'Keep rollout gates blocked until expanded parity evidence improves.',
      },
    };
  }
}

function collectFailures(
  metrics: CombinedBaselineMetrics,
  thresholds: GoldenParityCIGateThresholds
): readonly string[] {
  const failures: string[] = [];

  if (metrics.totalScenarios < thresholds.minimumTotalScenarios) {
    failures.push(`totalScenarios=${metrics.totalScenarios} < ${thresholds.minimumTotalScenarios}`);
  }
  if (metrics.executableCoveragePercentage < thresholds.minimumExecutableCoveragePercentage) {
    failures.push(
      `executableCoveragePercentage=${metrics.executableCoveragePercentage} < ${thresholds.minimumExecutableCoveragePercentage}`
    );
  }
  if (metrics.comparableCoveragePercentage < thresholds.minimumComparableCoveragePercentage) {
    failures.push(
      `comparableCoveragePercentage=${metrics.comparableCoveragePercentage} < ${thresholds.minimumComparableCoveragePercentage}`
    );
  }
  if (metrics.parityPercentage < thresholds.minimumParityPercentage) {
    failures.push(`parityPercentage=${metrics.parityPercentage} < ${thresholds.minimumParityPercentage}`);
  }
  if (metrics.driftPercentage > thresholds.maximumDriftPercentage) {
    failures.push(`driftPercentage=${metrics.driftPercentage} > ${thresholds.maximumDriftPercentage}`);
  }
  if (metrics.failurePercentage > thresholds.maximumFailurePercentage) {
    failures.push(`failurePercentage=${metrics.failurePercentage} > ${thresholds.maximumFailurePercentage}`);
  }
  if (metrics.criticalDriftCount > thresholds.maximumCriticalDriftCount) {
    failures.push(`criticalDriftCount=${metrics.criticalDriftCount} > ${thresholds.maximumCriticalDriftCount}`);
  }

  return failures;
}
