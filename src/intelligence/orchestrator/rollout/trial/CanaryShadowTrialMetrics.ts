/**
 * @fileoverview Metrics for controlled CANARY_SHADOW trial results.
 */

import type { CanaryShadowTrialFlowResult, CanaryShadowTrialMetrics } from './CanaryShadowTrialTypes';

export function calculateCanaryShadowTrialMetrics(
  results: readonly CanaryShadowTrialFlowResult[]
): CanaryShadowTrialMetrics {
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
    sampledScenarios: results.filter((result) => result.sampled).length,
    executedScenarios: executed.length,
    skippedScenarios: results.filter((result) => !result.executed).length,
    matchedCount: count(results, (result) => result.matched),
    driftCount: count(results, (result) => result.drifted),
    failedCount: count(results, (result) => result.failed),
    notComparableCount: count(results, (result) => result.notComparable),
    selfMirroredCount: count(results, (result) => result.selfMirrored),
    rollbackCount: count(results, (result) => result.rollbackTriggered),
    criticalDriftCount: count(results, (result) => result.criticalDrift),
    privacyViolationCount: count(results, (result) => result.privacyViolation),
    telemetryFailureCount: count(results, (result) => result.telemetryFailure),
    averageLatencyMs: round(average(latencies)),
    p95LatencyMs: percentile(latencies, 95),
    failureRate: percentage(countExecuted(results, (result) => result.failed), executed.length),
    driftRate: percentage(countExecuted(results, (result) => result.drifted), executed.length),
    matchRate: percentage(countExecuted(results, (result) => result.matched), executed.length),
    comparableCoverage: percentage(comparableCount, executed.length),
    gatePassRate: percentage(gateTotals.passed, gateTotals.total),
  });
}

function count(
  results: readonly CanaryShadowTrialFlowResult[],
  predicate: (result: CanaryShadowTrialFlowResult) => boolean
): number {
  return results.filter(predicate).length;
}

function countExecuted(
  results: readonly CanaryShadowTrialFlowResult[],
  predicate: (result: CanaryShadowTrialFlowResult) => boolean
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
