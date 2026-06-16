/**
 * @fileoverview Golden parity metric calculations.
 */

import type { GoldenScenarioResult } from './GoldenScenarioTypes';

export interface GoldenParityMetrics {
  totalScenarios: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  skippedCount: number;
  parityPercentage: number;
  driftPercentage: number;
  failurePercentage: number;
  comparableCoveragePercentage: number;
}

export function calculateGoldenParityMetrics(
  results: readonly GoldenScenarioResult[]
): GoldenParityMetrics {
  const matchedCount = count(results, 'MATCHED');
  const driftCount = count(results, 'DRIFT_DETECTED');
  const failedCount = count(results, 'FAILED');
  const notComparableCount = count(results, 'NOT_COMPARABLE');
  const selfMirroredCount = count(results, 'SELF_MIRRORED');
  const skippedCount = count(results, 'SKIPPED');
  const comparableCount = matchedCount + driftCount;

  return {
    totalScenarios: results.length,
    matchedCount,
    driftCount,
    failedCount,
    notComparableCount,
    selfMirroredCount,
    skippedCount,
    parityPercentage: percentage(matchedCount, comparableCount),
    driftPercentage: percentage(driftCount, comparableCount),
    failurePercentage: percentage(failedCount, results.length),
    comparableCoveragePercentage: percentage(comparableCount, results.length),
  };
}

function count(results: readonly GoldenScenarioResult[], status: GoldenScenarioResult['status']): number {
  return results.filter((result) => result.status === status).length;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10_000) / 100;
}
