/**
 * @fileoverview Rollout gate evaluation.
 */

import type {
  RolloutEvaluationInput,
  RolloutFlowPolicy,
  RolloutGateResult,
  RolloutMode,
  RolloutPolicy,
} from './RolloutControlTypes';

const DEFAULT_FLOW_POLICY: RolloutFlowPolicy = Object.freeze({
  enabled: false,
  allowedModes: ['DISABLED'] as readonly RolloutMode[],
  observeModeEnabled: false,
  bindingAvailable: false,
  parityPassed: false,
  unresolvedCriticalDrift: false,
  failureRate: 0,
  latencyRegressionMs: 0,
  telemetryHealthy: false,
  privacySafe: true,
  expandedParityCIGatePassed: false,
  manualApprovalGranted: false,
  scopedTypeCheckPassed: false,
  testCoveragePassed: false,
  canaryPercent: 0,
});

export class RolloutGateEvaluator {
  evaluate(input: {
    policy: RolloutPolicy;
    evaluation: RolloutEvaluationInput;
    killSwitchActive: boolean;
    flowKillSwitchActive: boolean;
  }): readonly RolloutGateResult[] {
    const flowPolicy = resolveFlowPolicy(input.policy, input.evaluation);
    const mode = input.evaluation.requestedMode;

    return [
      this.killSwitchGate(input.killSwitchActive, input.flowKillSwitchActive),
      this.parityGate(input.policy, flowPolicy, mode),
      this.driftGate(flowPolicy),
      this.failureRateGate(flowPolicy),
      this.latencyGate(flowPolicy),
      this.telemetryHealthGate(input.policy, flowPolicy, mode),
      this.privacyGate(flowPolicy),
      this.manualApprovalGate(input.policy, flowPolicy, mode),
      this.scopedTypeCheckGate(flowPolicy, mode),
      this.testCoverageGate(flowPolicy, mode),
    ];
  }

  private parityGate(
    policy: RolloutPolicy,
    flowPolicy: RolloutFlowPolicy,
    mode: RolloutMode
  ): RolloutGateResult {
    if (mode === 'CANARY_LIVE' || mode === 'FULL_LIVE') {
      return blocked('ParityGate', `${mode} remains blocked during Phase 5.4.`, [
        'liveRoutingEnabled=false',
      ]);
    }
    if (mode === 'CANARY_SHADOW' && !flowPolicy.expandedParityCIGatePassed) {
      return blocked('ParityGate', 'Expanded parity CI gate must pass before CANARY_SHADOW.', [
        `expandedParityCIGatePassed=${flowPolicy.expandedParityCIGatePassed}`,
      ]);
    }
    if (mode === 'DRY_RUN_COMPARE' && !flowPolicy.expandedParityCIGatePassed) {
      return warn('ParityGate', 'Expanded parity CI gate has not passed; dry-run compare may continue as validation.', [
        `expandedParityCIGatePassed=${flowPolicy.expandedParityCIGatePassed}`,
      ]);
    }
    if (!isLiveMode(mode) && mode !== 'DRY_RUN_COMPARE') {
      return notApplicable('ParityGate', 'Parity is not required for this rollout mode.');
    }
    if (policy.requireParityBeforeLive && !flowPolicy.parityPassed && isLiveMode(mode)) {
      return blocked('ParityGate', 'Parity has not been proven for live rollout.', [
        `parityPassed=${flowPolicy.parityPassed}`,
      ]);
    }
    return pass('ParityGate', 'Parity requirement satisfied or not required for dry-run comparison.', [
      `mode=${mode}`,
      `parityPassed=${flowPolicy.parityPassed}`,
    ]);
  }

  private driftGate(flowPolicy: RolloutFlowPolicy): RolloutGateResult {
    if (flowPolicy.unresolvedCriticalDrift) {
      return blocked('DriftGate', 'Unresolved critical drift blocks rollout.', [
        'unresolvedCriticalDrift=true',
      ]);
    }
    return pass('DriftGate', 'No unresolved critical drift.', ['unresolvedCriticalDrift=false']);
  }

  private failureRateGate(flowPolicy: RolloutFlowPolicy): RolloutGateResult {
    if (flowPolicy.failureRate > 0.05) {
      return blocked('FailureRateGate', 'Failure rate exceeds rollout threshold.', [
        `failureRate=${flowPolicy.failureRate}`,
      ]);
    }
    return pass('FailureRateGate', 'Failure rate is within threshold.', [
      `failureRate=${flowPolicy.failureRate}`,
    ]);
  }

  private latencyGate(flowPolicy: RolloutFlowPolicy): RolloutGateResult {
    if (flowPolicy.latencyRegressionMs > 250) {
      return blocked('LatencyGate', 'Latency regression exceeds rollout threshold.', [
        `latencyRegressionMs=${flowPolicy.latencyRegressionMs}`,
      ]);
    }
    return pass('LatencyGate', 'Latency regression is within threshold.', [
      `latencyRegressionMs=${flowPolicy.latencyRegressionMs}`,
    ]);
  }

  private telemetryHealthGate(
    policy: RolloutPolicy,
    flowPolicy: RolloutFlowPolicy,
    mode: RolloutMode
  ): RolloutGateResult {
    if (mode === 'DISABLED') {
      return notApplicable('TelemetryHealthGate', 'Telemetry is not required while disabled.');
    }
    if (policy.rollbackOnTelemetryFailure && !flowPolicy.telemetryHealthy) {
      return blocked('TelemetryHealthGate', 'Telemetry health is missing or failing.', [
        `telemetryHealthy=${flowPolicy.telemetryHealthy}`,
      ]);
    }
    return pass('TelemetryHealthGate', 'Telemetry health is acceptable.', [
      `telemetryHealthy=${flowPolicy.telemetryHealthy}`,
    ]);
  }

  private privacyGate(flowPolicy: RolloutFlowPolicy): RolloutGateResult {
    if (!flowPolicy.privacySafe) {
      return blocked('PrivacyGate', 'Privacy configuration is unsafe for rollout.', [
        'privacySafe=false',
      ]);
    }
    return pass('PrivacyGate', 'Privacy configuration is safe.', ['privacySafe=true']);
  }

  private manualApprovalGate(
    policy: RolloutPolicy,
    flowPolicy: RolloutFlowPolicy,
    mode: RolloutMode
  ): RolloutGateResult {
    if (!requiresManualApproval(mode)) {
      return notApplicable('ManualApprovalGate', 'Manual approval is not required for this mode.');
    }
    if (policy.requireManualApproval && !flowPolicy.manualApprovalGranted) {
      return blocked('ManualApprovalGate', 'Manual approval is required for this rollout mode.', [
        `manualApprovalGranted=${flowPolicy.manualApprovalGranted}`,
      ]);
    }
    return pass('ManualApprovalGate', 'Manual approval requirement satisfied.', [
      `manualApprovalGranted=${flowPolicy.manualApprovalGranted}`,
    ]);
  }

  private killSwitchGate(globalActive: boolean, flowActive: boolean): RolloutGateResult {
    if (globalActive || flowActive) {
      return blocked('KillSwitchGate', 'A rollout kill switch is active.', [
        `globalKillSwitch=${globalActive}`,
        `flowKillSwitch=${flowActive}`,
      ]);
    }
    return pass('KillSwitchGate', 'No kill switch is active.', [
      `globalKillSwitch=${globalActive}`,
      `flowKillSwitch=${flowActive}`,
    ]);
  }

  private scopedTypeCheckGate(flowPolicy: RolloutFlowPolicy, mode: RolloutMode): RolloutGateResult {
    if (!isLiveMode(mode)) {
      return notApplicable('ScopedTypeCheckGate', 'Scoped type check gate is required only for live modes.');
    }
    if (!flowPolicy.scopedTypeCheckPassed) {
      return blocked('ScopedTypeCheckGate', 'Scoped TypeScript validation is required for live rollout.', [
        `scopedTypeCheckPassed=${flowPolicy.scopedTypeCheckPassed}`,
      ]);
    }
    return pass('ScopedTypeCheckGate', 'Scoped TypeScript validation passed.', [
      'scopedTypeCheckPassed=true',
    ]);
  }

  private testCoverageGate(flowPolicy: RolloutFlowPolicy, mode: RolloutMode): RolloutGateResult {
    if (!isLiveMode(mode)) {
      return notApplicable('TestCoverageGate', 'Test coverage gate is required only for live modes.');
    }
    if (!flowPolicy.testCoveragePassed) {
      return blocked('TestCoverageGate', 'Test validation is required for live rollout.', [
        `testCoveragePassed=${flowPolicy.testCoveragePassed}`,
      ]);
    }
    return pass('TestCoverageGate', 'Required tests passed.', ['testCoveragePassed=true']);
  }
}

export function resolveFlowPolicy(
  policy: RolloutPolicy,
  evaluation: RolloutEvaluationInput
): RolloutFlowPolicy {
  return Object.freeze({
    ...DEFAULT_FLOW_POLICY,
    enabled: policy.globalEnabled,
    allowedModes: policy.allowedModes,
    ...(policy.perFlowConfig[evaluation.flow] ?? {}),
    ...(evaluation.flowPolicy ?? {}),
  });
}

function isLiveMode(mode: RolloutMode): boolean {
  return mode === 'CANARY_LIVE' || mode === 'FULL_LIVE';
}

function requiresManualApproval(mode: RolloutMode): boolean {
  return mode === 'CANARY_SHADOW' || isLiveMode(mode);
}

function pass(gateName: string, reason: string, evidence: readonly string[]): RolloutGateResult {
  return {
    gateName,
    status: 'PASS',
    reason,
    evidence,
    blocking: false,
    recommendedAction: 'Continue rollout evaluation.',
  };
}

function warn(gateName: string, reason: string, evidence: readonly string[]): RolloutGateResult {
  return {
    gateName,
    status: 'WARN',
    reason,
    evidence,
    blocking: false,
    recommendedAction: 'Continue validation only; do not advance rollout mode.',
  };
}

function blocked(gateName: string, reason: string, evidence: readonly string[]): RolloutGateResult {
  return {
    gateName,
    status: 'BLOCKED',
    reason,
    evidence,
    blocking: true,
    recommendedAction: 'Keep production output authoritative and do not advance rollout.',
  };
}

function notApplicable(gateName: string, reason: string): RolloutGateResult {
  return {
    gateName,
    status: 'NOT_APPLICABLE',
    reason,
    evidence: [],
    blocking: false,
    recommendedAction: 'No action required for this mode.',
  };
}
