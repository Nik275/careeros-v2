/**
 * @fileoverview Metrics for Phase 5.7 staging shadow results.
 */

import type { StagingShadowFlowResult, StagingShadowMetrics } from './StagingShadowRunTypes';

export function calculateStagingShadowMetrics(
  results: readonly StagingShadowFlowResult[]
): StagingShadowMetrics {
  const executed = results.filter((result) => result.executed);
  const latencies = executed.map((result) => result.latencyMs).sort((left, right) => left - right);
  const comparableCount = countExecuted(results, (result) => result.matched || result.drifted);
  const gateTotals = results.reduce(
    (accumulator, result) => ({
      passed: accumulator.passed + result.gateResultsPassed,
      total: accumulator.total + result.gateResultsTotal,
    }),
    { passed: 0, total: 0 }
  );

  return Object.freeze({
    totalScenarios: results.length,
    executedScenarios: executed.length,
    blockedScenarios: results.filter((result) => result.status === 'BLOCKED').length,
    skippedScenarios: results.filter((result) => !result.executed && result.status !== 'BLOCKED').length,
    matchedCount: count(results, (result) => result.matched),
    driftCount: count(results, (result) => result.drifted),
    failedCount: count(results, (result) => result.failed),
    rollbackCount: count(results, (result) => result.rollbackTriggered),
    notComparableCount: count(results, (result) => result.notComparable),
    selfMirroredCount: count(results, (result) => result.selfMirrored),
    matchRate: percentage(countExecuted(results, (result) => result.matched), executed.length),
    driftRate: percentage(countExecuted(results, (result) => result.drifted), executed.length),
    failureRate: percentage(countExecuted(results, (result) => result.failed), executed.length),
    comparableCoverage: percentage(comparableCount, executed.length),
    averageLatencyMs: round(average(latencies)),
    p95LatencyMs: percentile(latencies, 95),
    gatePassRate: percentage(gateTotals.passed, gateTotals.total),
    privacyViolationCount: count(results, (result) => result.privacyViolation),
    telemetryFailureCount: count(results, (result) => result.telemetryFailure),
  });
}

function count(
  results: readonly StagingShadowFlowResult[],
  predicate: (result: StagingShadowFlowResult) => boolean
): number {
  return results.filter(predicate).length;
}

function countExecuted(
  results: readonly StagingShadowFlowResult[],
  predicate: (result: StagingShadowFlowResult) => boolean
): number {
  return results.filter((result) => result.executed && predicate(result)).length;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: readonly number[], percentileValue: number): number {
  if (values.length === 0) return 0;
  const index = Math.min(
    values.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * values.length) - 1)
  );
  return values[index];
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return round((numerator / denominator) * 100);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
