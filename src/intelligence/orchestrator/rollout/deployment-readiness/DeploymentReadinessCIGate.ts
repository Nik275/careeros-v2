/**
 * @fileoverview Phase 6.5 deployment readiness CI gate.
 */

import { DeploymentReadinessChecker } from './DeploymentReadinessChecker';
import type { DeploymentReadinessResult } from './DeploymentReadinessTypes';

export type DeploymentReadinessCIGateStatus = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export interface DeploymentReadinessCIGateResult {
  status: DeploymentReadinessCIGateStatus;
  reason: string;
  readiness: DeploymentReadinessResult;
  smokePassed: boolean;
  warnings: readonly string[];
  failures: readonly string[];
}

export function evaluateDeploymentReadinessCIGate(input: {
  env?: Partial<NodeJS.ProcessEnv>;
  readiness?: DeploymentReadinessResult;
  smokePassed?: boolean;
  rootDir?: string;
} = {}): DeploymentReadinessCIGateResult {
  const readiness = input.readiness ?? new DeploymentReadinessChecker({ rootDir: input.rootDir }).check({ env: input.env });
  const smokePassed = input.smokePassed ?? false;
  const failureReasons = readiness.failures.map((failure) => failure.reason);

  if (readiness.failures.some((failure) => failure.failureId.includes('production') || failure.failureId.includes('unsafe-host') || failure.failureId.includes('live-routing') || failure.failureId.includes('output-replacement') || failure.failureId.includes('raw-payload'))) {
    return result('FAIL', 'Unsafe deployment readiness config is present.', readiness, smokePassed, failureReasons);
  }

  if (!readiness.stagingUrlConfigured) {
    return result('PASS_WITH_WARNINGS', 'Staging URL is missing; CI passes with warnings because deployment smoke remains safely blocked.', readiness, smokePassed, failureReasons);
  }

  if (readiness.activationDecision !== 'READY_FOR_DEPLOYED_SMOKE') {
    return result('BLOCKED', 'Deployment readiness is blocked before deployed smoke execution.', readiness, smokePassed, failureReasons);
  }

  if (!smokePassed) {
    return result('BLOCKED', 'Deployment readiness is safe, but deployed smoke has not passed yet.', readiness, smokePassed, failureReasons);
  }

  return result('PASS', 'Deployment readiness config is safe and deployed smoke passed.', readiness, smokePassed, failureReasons);
}

function result(
  status: DeploymentReadinessCIGateStatus,
  reason: string,
  readiness: DeploymentReadinessResult,
  smokePassed: boolean,
  failures: readonly string[]
): DeploymentReadinessCIGateResult {
  return Object.freeze({
    status,
    reason,
    readiness,
    smokePassed,
    warnings: Object.freeze(readiness.warnings),
    failures: Object.freeze([...failures]),
  });
}
