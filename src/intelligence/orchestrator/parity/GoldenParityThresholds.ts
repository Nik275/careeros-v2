/**
 * @fileoverview Rollout threshold calibration for measured golden parity baselines.
 */

import type { RolloutGateResult, RolloutMode } from '../rollout/RolloutControlTypes';
import type { CombinedBaselineMetrics, FlowBaselineMetrics } from './GoldenParityBaselineMetrics';

export interface GoldenParityModeThresholds {
  minimumExecutableCoveragePercentage?: number;
  maximumFailurePercentage?: number;
  maximumNotComparablePercentage?: number;
  minimumComparableCoveragePercentage?: number;
  minimumParityPercentage?: number;
  maximumDriftPercentage?: number;
  maximumCriticalDriftCount?: number;
  liveBlocked: boolean;
}

export type GoldenParityThresholdMode = Extract<
  RolloutMode,
  'OBSERVE_ONLY' | 'DRY_RUN_COMPARE' | 'CANARY_SHADOW' | 'CANARY_LIVE' | 'FULL_LIVE'
>;

export const GOLDEN_PARITY_THRESHOLDS: Readonly<Record<GoldenParityThresholdMode, GoldenParityModeThresholds>> =
  Object.freeze({
    OBSERVE_ONLY: Object.freeze({
      liveBlocked: false,
    }),
    DRY_RUN_COMPARE: Object.freeze({
      minimumExecutableCoveragePercentage: 70,
      maximumFailurePercentage: 10,
      maximumCriticalDriftCount: 0,
      liveBlocked: false,
    }),
    CANARY_SHADOW: Object.freeze({
      minimumComparableCoveragePercentage: 80,
      minimumParityPercentage: 95,
      maximumDriftPercentage: 3,
      maximumFailurePercentage: 2,
      maximumCriticalDriftCount: 0,
      liveBlocked: false,
    }),
    CANARY_LIVE: Object.freeze({
      liveBlocked: true,
    }),
    FULL_LIVE: Object.freeze({
      liveBlocked: true,
    }),
  });

export function evaluateGoldenParityThresholds(
  mode: GoldenParityThresholdMode,
  metrics: FlowBaselineMetrics | CombinedBaselineMetrics
): RolloutGateResult {
  const thresholds = GOLDEN_PARITY_THRESHOLDS[mode];

  if (thresholds.liveBlocked) {
    return blocked(
      `GoldenParity${mode}Gate`,
      `${mode} remains blocked during Phase 5.3.`,
      ['Phase 5.3 is measurement-only and does not enable live routing.']
    );
  }

  const failures: string[] = [];

  if (
    thresholds.minimumExecutableCoveragePercentage !== undefined &&
    metrics.executableCoveragePercentage < thresholds.minimumExecutableCoveragePercentage
  ) {
    failures.push(
      `executableCoveragePercentage=${metrics.executableCoveragePercentage} < ${thresholds.minimumExecutableCoveragePercentage}`
    );
  }

  if (
    thresholds.minimumComparableCoveragePercentage !== undefined &&
    metrics.comparableCoveragePercentage < thresholds.minimumComparableCoveragePercentage
  ) {
    failures.push(
      `comparableCoveragePercentage=${metrics.comparableCoveragePercentage} < ${thresholds.minimumComparableCoveragePercentage}`
    );
  }

  if (
    thresholds.minimumParityPercentage !== undefined &&
    metrics.parityPercentage < thresholds.minimumParityPercentage
  ) {
    failures.push(`parityPercentage=${metrics.parityPercentage} < ${thresholds.minimumParityPercentage}`);
  }

  if (
    thresholds.maximumDriftPercentage !== undefined &&
    metrics.driftPercentage > thresholds.maximumDriftPercentage
  ) {
    failures.push(`driftPercentage=${metrics.driftPercentage} > ${thresholds.maximumDriftPercentage}`);
  }

  if (
    thresholds.maximumFailurePercentage !== undefined &&
    metrics.failurePercentage > thresholds.maximumFailurePercentage
  ) {
    failures.push(`failurePercentage=${metrics.failurePercentage} > ${thresholds.maximumFailurePercentage}`);
  }

  if (
    thresholds.maximumNotComparablePercentage !== undefined &&
    metrics.notComparablePercentage > thresholds.maximumNotComparablePercentage
  ) {
    failures.push(
      `notComparablePercentage=${metrics.notComparablePercentage} > ${thresholds.maximumNotComparablePercentage}`
    );
  }

  if (
    thresholds.maximumCriticalDriftCount !== undefined &&
    metrics.criticalDriftCount > thresholds.maximumCriticalDriftCount
  ) {
    failures.push(`criticalDriftCount=${metrics.criticalDriftCount} > ${thresholds.maximumCriticalDriftCount}`);
  }

  if (failures.length > 0) {
    return blocked(`GoldenParity${mode}Gate`, `${mode} baseline thresholds were not satisfied.`, failures);
  }

  return {
    gateName: `GoldenParity${mode}Gate`,
    status: mode === 'OBSERVE_ONLY' ? 'NOT_APPLICABLE' : 'PASS',
    reason:
      mode === 'OBSERVE_ONLY'
        ? 'Observe-only mode does not require golden parity threshold satisfaction.'
        : `${mode} baseline thresholds were satisfied.`,
    evidence: [
      `executableCoveragePercentage=${metrics.executableCoveragePercentage}`,
      `comparableCoveragePercentage=${metrics.comparableCoveragePercentage}`,
      `parityPercentage=${metrics.parityPercentage}`,
      `driftPercentage=${metrics.driftPercentage}`,
      `failurePercentage=${metrics.failurePercentage}`,
      `criticalDriftCount=${metrics.criticalDriftCount}`,
    ],
    blocking: false,
    recommendedAction: 'Continue validation. This threshold result does not enable live routing.',
  };
}

function blocked(gateName: string, reason: string, evidence: readonly string[]): RolloutGateResult {
  return {
    gateName,
    status: 'BLOCKED',
    reason,
    evidence,
    blocking: true,
    recommendedAction: 'Keep rollout progression blocked until measured golden parity improves.',
  };
}
