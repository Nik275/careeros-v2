/**
 * @fileoverview Baseline metric calculations for measured golden parity runs.
 */

import type { GoldenParityRiskLevel, GoldenParityStatus } from './GoldenScenarioTypes';

export interface BaselineMetricInput {
  status: GoldenParityStatus;
  riskLevel: GoldenParityRiskLevel;
  executable?: boolean;
  criticalDrift?: boolean;
}

export interface FlowBaselineMetrics {
  totalScenarios: number;
  executableScenarios: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  skippedCount: number;
  independentComparableCount: number;
  criticalDriftCount: number;
  parityPercentage: number;
  comparableCoveragePercentage: number;
  executableCoveragePercentage: number;
  driftPercentage: number;
  failurePercentage: number;
  notComparablePercentage: number;
}

export interface CombinedBaselineMetrics extends FlowBaselineMetrics {
  combinedRiskScore: number;
}

export interface GoldenParityBaselineMetrics {
  assessment: FlowBaselineMetrics;
  careerFit: FlowBaselineMetrics;
  combined: CombinedBaselineMetrics;
}

export function calculateFlowBaselineMetrics(
  results: readonly BaselineMetricInput[]
): FlowBaselineMetrics {
  const matchedCount = count(results, 'MATCHED');
  const driftCount = count(results, 'DRIFT_DETECTED');
  const failedCount = count(results, 'FAILED');
  const notComparableCount = count(results, 'NOT_COMPARABLE');
  const selfMirroredCount = count(results, 'SELF_MIRRORED');
  const skippedCount = count(results, 'SKIPPED');
  const executableScenarios = results.filter((result) => result.executable !== false).length;
  const independentComparableCount = matchedCount + driftCount;
  const criticalDriftCount = results.filter(
    (result) =>
      result.criticalDrift === true ||
      (result.riskLevel === 'CRITICAL' && result.status === 'DRIFT_DETECTED')
  ).length;

  return {
    totalScenarios: results.length,
    executableScenarios,
    matchedCount,
    driftCount,
    failedCount,
    notComparableCount,
    selfMirroredCount,
    skippedCount,
    independentComparableCount,
    criticalDriftCount,
    parityPercentage: percentage(matchedCount, independentComparableCount),
    comparableCoveragePercentage: percentage(independentComparableCount, results.length),
    executableCoveragePercentage: percentage(executableScenarios, results.length),
    driftPercentage: percentage(driftCount, independentComparableCount),
    failurePercentage: percentage(failedCount, results.length),
    notComparablePercentage: percentage(notComparableCount, results.length),
  };
}

export function calculateCombinedBaselineMetrics(
  assessmentResults: readonly BaselineMetricInput[],
  careerFitResults: readonly BaselineMetricInput[]
): GoldenParityBaselineMetrics {
  const assessment = calculateFlowBaselineMetrics(assessmentResults);
  const careerFit = calculateFlowBaselineMetrics(careerFitResults);
  const combinedInputs = [...assessmentResults, ...careerFitResults];
  const combinedFlow = calculateFlowBaselineMetrics(combinedInputs);

  return {
    assessment,
    careerFit,
    combined: {
      ...combinedFlow,
      combinedRiskScore: calculateRiskScore(combinedFlow),
    },
  };
}

function calculateRiskScore(metrics: FlowBaselineMetrics): number {
  const driftPenalty = metrics.driftPercentage * 0.4;
  const failurePenalty = metrics.failurePercentage * 0.5;
  const notComparablePenalty = metrics.notComparablePercentage * 0.2;
  const criticalPenalty = metrics.criticalDriftCount * 10;
  return Math.min(100, Math.round((driftPenalty + failurePenalty + notComparablePenalty + criticalPenalty) * 100) / 100);
}

function count(results: readonly BaselineMetricInput[], status: GoldenParityStatus): number {
  return results.filter((result) => result.status === status).length;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10_000) / 100;
}
