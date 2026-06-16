/**
 * @fileoverview Pass/fail gate for controlled CANARY_SHADOW trials.
 */

import type {
  CanaryShadowTrialGateResult,
  CanaryShadowTrialMetrics,
  CanaryShadowTrialVerdict,
} from './CanaryShadowTrialTypes';

export interface CanaryShadowTrialGateThresholds {
  minExecutedScenarios: number;
  minComparableCoverage: number;
  minMatchRate: number;
  maxDriftRate: number;
  maxFailureRate: number;
  maxCriticalDriftCount: number;
  maxRollbackCount: number;
  maxPrivacyViolations: number;
  maxTelemetryFailures: number;
}

export const DEFAULT_CANARY_SHADOW_TRIAL_GATE_THRESHOLDS: CanaryShadowTrialGateThresholds = Object.freeze({
  minExecutedScenarios: 50,
  minComparableCoverage: 95,
  minMatchRate: 99,
  maxDriftRate: 1,
  maxFailureRate: 1,
  maxCriticalDriftCount: 0,
  maxRollbackCount: 0,
  maxPrivacyViolations: 0,
  maxTelemetryFailures: 0,
});

export class CanaryShadowTrialGate {
  private readonly thresholds: CanaryShadowTrialGateThresholds;
  private readonly now: () => string;

  constructor(
    thresholds: Partial<CanaryShadowTrialGateThresholds> = {},
    options: { now?: () => string } = {}
  ) {
    this.thresholds = {
      ...DEFAULT_CANARY_SHADOW_TRIAL_GATE_THRESHOLDS,
      ...thresholds,
    };
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluate(metrics: CanaryShadowTrialMetrics): CanaryShadowTrialGateResult {
    const failures = collectFailures(metrics, this.thresholds);
    const warnings = collectWarnings(metrics);
    const verdict = resolveVerdict(failures, warnings);

    return Object.freeze({
      verdict,
      passed: verdict === 'PASS' || verdict === 'PASS_WITH_WARNINGS',
      failures,
      warnings,
      evaluatedAt: this.now(),
      metrics,
    });
  }
}

function collectFailures(
  metrics: CanaryShadowTrialMetrics,
  thresholds: CanaryShadowTrialGateThresholds
): readonly string[] {
  const failures: string[] = [];

  if (metrics.executedScenarios < thresholds.minExecutedScenarios) {
    failures.push(`executedScenarios=${metrics.executedScenarios} < ${thresholds.minExecutedScenarios}`);
  }
  if (metrics.comparableCoverage < thresholds.minComparableCoverage) {
    failures.push(`comparableCoverage=${metrics.comparableCoverage} < ${thresholds.minComparableCoverage}`);
  }
  if (metrics.matchRate < thresholds.minMatchRate) {
    failures.push(`matchRate=${metrics.matchRate} < ${thresholds.minMatchRate}`);
  }
  if (metrics.driftRate > thresholds.maxDriftRate) {
    failures.push(`driftRate=${metrics.driftRate} > ${thresholds.maxDriftRate}`);
  }
  if (metrics.failureRate > thresholds.maxFailureRate) {
    failures.push(`failureRate=${metrics.failureRate} > ${thresholds.maxFailureRate}`);
  }
  if (metrics.criticalDriftCount > thresholds.maxCriticalDriftCount) {
    failures.push(`criticalDriftCount=${metrics.criticalDriftCount} > ${thresholds.maxCriticalDriftCount}`);
  }
  if (metrics.rollbackCount > thresholds.maxRollbackCount) {
    failures.push(`rollbackCount=${metrics.rollbackCount} > ${thresholds.maxRollbackCount}`);
  }
  if (metrics.privacyViolationCount > thresholds.maxPrivacyViolations) {
    failures.push(`privacyViolationCount=${metrics.privacyViolationCount} > ${thresholds.maxPrivacyViolations}`);
  }
  if (metrics.telemetryFailureCount > thresholds.maxTelemetryFailures) {
    failures.push(`telemetryFailureCount=${metrics.telemetryFailureCount} > ${thresholds.maxTelemetryFailures}`);
  }

  return failures;
}

function collectWarnings(metrics: CanaryShadowTrialMetrics): readonly string[] {
  const warnings: string[] = [];
  if (metrics.p95LatencyMs > 250) {
    warnings.push(`p95LatencyMs=${metrics.p95LatencyMs} > 250`);
  }
  if (metrics.gatePassRate < 100) {
    warnings.push(`gatePassRate=${metrics.gatePassRate} < 100`);
  }
  return warnings;
}

function resolveVerdict(
  failures: readonly string[],
  warnings: readonly string[]
): CanaryShadowTrialVerdict {
  if (failures.length > 0) return 'FAIL';
  if (warnings.length > 0) return 'PASS_WITH_WARNINGS';
  return 'PASS';
}
