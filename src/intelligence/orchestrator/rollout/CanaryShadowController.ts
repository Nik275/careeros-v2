/**
 * @fileoverview Control-plane decision engine for CANARY_SHADOW.
 */

import { createCanaryShadowConfig, type CanaryShadowConfig } from './CanaryShadowConfig';
import { CanaryShadowSampler } from './CanaryShadowSampler';
import type { ManualApprovalRecord } from './ManualApprovalRecord';
import { validateManualApproval } from './ManualApprovalRecord';
import type { RolloutManager } from './RolloutManager';
import type { RolloutGateResult } from './RolloutControlTypes';
import type { CanaryShadowRollbackPolicy } from './CanaryShadowRollbackPolicy';
import type {
  CanaryShadowDecision,
  CanaryShadowFlowName,
  CanaryShadowGateResult,
  CanaryShadowRiskLevel,
  CanaryShadowSampleDecision,
  CanaryShadowStatus,
} from './CanaryShadowTypes';
import { resolveCanaryShadowFlowConfig } from './CanaryShadowTypes';

export interface CanaryShadowControllerOptions {
  config?: CanaryShadowConfig;
  sampler?: CanaryShadowSampler;
  rolloutManager?: RolloutManager;
  rollbackPolicy?: Pick<CanaryShadowRollbackPolicy, 'isFlowDisabled' | 'getRollbackRecord'>;
  now?: () => string;
}

export interface CanaryShadowEvaluationInput {
  requestId: string;
  flow: string;
  manualApproval?: ManualApprovalRecord;
  rolloutGateApproved?: boolean;
  goldenParityGateResult?: RolloutGateResult;
  expandedParityCIGatePassed?: boolean;
  privacySafe?: boolean;
  telemetryHealthy?: boolean;
  killSwitchActive?: boolean;
  flowKillSwitchActive?: boolean;
  unresolvedCriticalDrift?: boolean;
  failureRate?: number;
  latencyRegressionMs?: number;
  metadata?: Readonly<Record<string, unknown>>;
  config?: CanaryShadowConfig;
}

export class CanaryShadowController {
  private readonly config: CanaryShadowConfig;
  private readonly sampler: CanaryShadowSampler;
  private readonly rolloutManager?: RolloutManager;
  private readonly rollbackPolicy?: Pick<CanaryShadowRollbackPolicy, 'isFlowDisabled' | 'getRollbackRecord'>;
  private readonly now: () => string;

  constructor(options: CanaryShadowControllerOptions = {}) {
    this.config = options.config ?? createCanaryShadowConfig();
    this.sampler = options.sampler ?? new CanaryShadowSampler({ now: options.now });
    this.rolloutManager = options.rolloutManager;
    this.rollbackPolicy = options.rollbackPolicy;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluate(input: CanaryShadowEvaluationInput): CanaryShadowDecision {
    const config = input.config ?? this.config;
    const decidedAt = this.now();
    const gates: CanaryShadowGateResult[] = [];
    const flowConfig = resolveCanaryShadowFlowConfig(input.flow);
    let sampleDecision: CanaryShadowSampleDecision | undefined;

    if (!config.globalShadowEnabled) {
      return this.createDecision(input, config, decidedAt, {
        status: 'DISABLED',
        approved: false,
        gates: [blocked('GlobalShadowGate', 'CANARY_SHADOW is disabled by default.', ['globalShadowEnabled=false'])],
        sampleDecision,
      });
    }

    if (!flowConfig) {
      gates.push(blocked('ValidatedFlowGate', 'Flow is not validated for CANARY_SHADOW.', [`flow=${input.flow}`]));
    } else {
      gates.push(pass('ValidatedFlowGate', 'Flow is validated for CANARY_SHADOW.', [`flow=${input.flow}`]));
    }

    if (!config.allowedFlows.includes(input.flow as CanaryShadowFlowName)) {
      gates.push(blocked('AllowedFlowGate', 'Flow is not explicitly allowed.', [
        `flow=${input.flow}`,
        `allowedFlows=${config.allowedFlows.join(',')}`,
      ]));
    } else {
      gates.push(pass('AllowedFlowGate', 'Flow is explicitly allowed.', [`flow=${input.flow}`]));
    }

    if (this.rollbackPolicy?.isFlowDisabled(input.flow)) {
      const rollback = this.rollbackPolicy.getRollbackRecord(input.flow);
      gates.push(blocked('RollbackGate', 'Flow is disabled by rollback policy.', [
        `rollbackReason=${rollback?.reason ?? 'unknown'}`,
      ]));
    } else {
      gates.push(pass('RollbackGate', 'No rollback is active for this flow.', [`flow=${input.flow}`]));
    }

    if (config.killSwitchRequired) {
      const globalKillSwitch = input.killSwitchActive ?? true;
      const flowKillSwitch = input.flowKillSwitchActive ?? false;
      if (globalKillSwitch || flowKillSwitch) {
        gates.push(blocked('KillSwitchGate', 'Kill switch blocks CANARY_SHADOW.', [
          `globalKillSwitch=${globalKillSwitch}`,
          `flowKillSwitch=${flowKillSwitch}`,
        ]));
      } else {
        gates.push(pass('KillSwitchGate', 'Kill switch is inactive.', [
          'globalKillSwitch=false',
          'flowKillSwitch=false',
        ]));
      }
    }

    const rolloutGate = this.evaluateRolloutGate(input, config);
    gates.push(rolloutGate.gate);

    if (config.requireParityGate) {
      const parityPassed =
        input.expandedParityCIGatePassed === true &&
        (input.goldenParityGateResult === undefined || !input.goldenParityGateResult.blocking);
      if (!parityPassed) {
        gates.push(blocked('ParityGate', 'Expanded parity evidence is required for CANARY_SHADOW.', [
          `expandedParityCIGatePassed=${input.expandedParityCIGatePassed === true}`,
          `goldenParityBlocking=${input.goldenParityGateResult?.blocking ?? 'not_provided'}`,
        ]));
      } else {
        gates.push(pass('ParityGate', 'Expanded parity evidence is satisfied.', [
          'expandedParityCIGatePassed=true',
        ]));
      }
    }

    if (input.unresolvedCriticalDrift) {
      gates.push(blocked('DriftGate', 'Unresolved critical drift blocks CANARY_SHADOW.', [
        'unresolvedCriticalDrift=true',
      ]));
    } else {
      gates.push(pass('DriftGate', 'No unresolved critical drift was reported.', [
        `unresolvedCriticalDrift=${formatBoolean(input.unresolvedCriticalDrift)}`,
      ]));
    }

    if ((input.failureRate ?? 0) > 0.05) {
      gates.push(blocked('FailureRateGate', 'Recent failure rate blocks CANARY_SHADOW.', [
        `failureRate=${input.failureRate}`,
      ]));
    } else {
      gates.push(pass('FailureRateGate', 'Failure rate is within threshold.', [
        `failureRate=${input.failureRate ?? 0}`,
      ]));
    }

    if (config.requirePrivacyGate && input.privacySafe !== true) {
      gates.push(blocked('PrivacyGate', 'Privacy gate blocks CANARY_SHADOW.', [
        `privacySafe=${formatBoolean(input.privacySafe)}`,
      ]));
    } else {
      gates.push(pass('PrivacyGate', 'Privacy gate passed.', [`privacySafe=${formatBoolean(input.privacySafe)}`]));
    }

    if (config.requireTelemetryHealth && input.telemetryHealthy !== true) {
      gates.push(blocked('TelemetryHealthGate', 'Telemetry health gate blocks CANARY_SHADOW.', [
        `telemetryHealthy=${formatBoolean(input.telemetryHealthy)}`,
      ]));
    } else {
      gates.push(pass('TelemetryHealthGate', 'Telemetry health gate passed.', [
        `telemetryHealthy=${formatBoolean(input.telemetryHealthy)}`,
      ]));
    }

    if (config.requireManualApproval) {
      const manualApproval = validateManualApproval(input.manualApproval, {
        flow: input.flow,
        sampleRate: config.sampleRate,
        requestedScope: 'CANARY_SHADOW',
        now: decidedAt,
      });
      gates.push(
        manualApproval.valid
          ? pass('ManualApprovalGate', manualApproval.reason, manualApproval.evidence)
          : blocked('ManualApprovalGate', manualApproval.reason, manualApproval.evidence)
      );
    }

    if (config.sampleRate <= 0) {
      gates.push(blocked('SamplingGate', 'Sample rate must be greater than 0 for CANARY_SHADOW.', [
        `sampleRate=${config.sampleRate}`,
      ]));
    } else if (config.maxExecutionsPerMinute <= 0) {
      gates.push(blocked('SamplingGate', 'Max executions per minute must be greater than 0.', [
        `maxExecutionsPerMinute=${config.maxExecutionsPerMinute}`,
      ]));
    } else {
      gates.push(pass('SamplingGate', 'Sampling configuration can select requests.', [
        `sampleRate=${config.sampleRate}`,
        `maxExecutionsPerMinute=${config.maxExecutionsPerMinute}`,
      ]));
    }

    const blockingGates = gates.filter((gate) => gate.blocking);
    if (blockingGates.length > 0) {
      return this.createDecision(input, config, decidedAt, {
        status: this.rollbackPolicy?.isFlowDisabled(input.flow) ? 'ROLLED_BACK' : 'BLOCKED',
        approved: false,
        gates,
        sampleDecision,
        rolloutDecision: rolloutGate.rolloutDecision,
      });
    }

    sampleDecision = this.sampler.shouldSample({
      requestId: input.requestId,
      flow: input.flow,
      sampleRate: config.sampleRate,
      maxExecutionsPerMinute: config.maxExecutionsPerMinute,
    });

    if (!sampleDecision.selected) {
      return this.createDecision(input, config, decidedAt, {
        status: 'SKIPPED',
        approved: false,
        gates,
        sampleDecision,
        rolloutDecision: rolloutGate.rolloutDecision,
      });
    }

    return this.createDecision(input, config, decidedAt, {
      status: 'ELIGIBLE',
      approved: true,
      gates,
      sampleDecision,
      rolloutDecision: rolloutGate.rolloutDecision,
    });
  }

  private evaluateRolloutGate(
    input: CanaryShadowEvaluationInput,
    config: CanaryShadowConfig
  ): { gate: CanaryShadowGateResult; rolloutDecision?: ReturnType<RolloutManager['evaluate']> } {
    if (this.rolloutManager) {
      const decision = this.rolloutManager.evaluate({
        flow: input.flow,
        requestedMode: 'CANARY_SHADOW',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          parityPassed: input.expandedParityCIGatePassed === true,
          expandedParityCIGatePassed: input.expandedParityCIGatePassed === true,
          unresolvedCriticalDrift: input.unresolvedCriticalDrift === true,
          failureRate: input.failureRate ?? 0,
          latencyRegressionMs: input.latencyRegressionMs ?? 0,
          telemetryHealthy: input.telemetryHealthy === true,
          privacySafe: input.privacySafe === true,
          manualApprovalGranted: input.manualApproval?.status === 'APPROVED',
          canaryPercent: Math.round(config.sampleRate * 100),
        },
        metadata: {
          requestId: input.requestId,
          source: 'CanaryShadowController',
        },
      });

      return {
        rolloutDecision: decision,
        gate: decision.allowed
          ? pass('RolloutPolicyGate', 'Rollout policy allows CANARY_SHADOW.', decision.gateResults.map(formatRolloutGate))
          : blocked('RolloutPolicyGate', 'Rollout policy blocks CANARY_SHADOW.', decision.reasons),
      };
    }

    if (input.rolloutGateApproved !== true) {
      return {
        gate: blocked('RolloutPolicyGate', 'Explicit rollout gate approval is required.', [
          `rolloutGateApproved=${formatBoolean(input.rolloutGateApproved)}`,
        ]),
      };
    }

    return {
      gate: pass('RolloutPolicyGate', 'Explicit rollout gate approval is present.', [
        'rolloutGateApproved=true',
      ]),
    };
  }

  private createDecision(
    input: CanaryShadowEvaluationInput,
    config: CanaryShadowConfig,
    decidedAt: string,
    result: {
      status: CanaryShadowStatus;
      approved: boolean;
      gates: readonly CanaryShadowGateResult[];
      sampleDecision?: CanaryShadowSampleDecision;
      rolloutDecision?: ReturnType<RolloutManager['evaluate']>;
    }
  ): CanaryShadowDecision {
    const reasons = result.gates.filter((gate) => gate.blocking).map((gate) => `${gate.gateName}: ${gate.reason}`);
    return Object.freeze({
      decisionId: `canary-shadow-decision-${hashString(
        `${input.requestId}|${input.flow}|${result.status}|${decidedAt}`
      )}`,
      requestId: input.requestId,
      flow: input.flow,
      mode: config.globalShadowEnabled ? 'CANARY_SHADOW' : 'DISABLED',
      status: result.status,
      approved: result.approved,
      sampleDecision: result.sampleDecision,
      gateResults: result.gates,
      rolloutDecision: result.rolloutDecision,
      goldenParityGateResult: input.goldenParityGateResult,
      riskLevel: resolveRiskLevel(result.status, result.gates),
      reasons: reasons.length > 0 ? reasons : [result.sampleDecision?.reason ?? 'CANARY_SHADOW eligible.'],
      decidedAt,
      metadata: input.metadata ?? {},
    });
  }
}

function resolveRiskLevel(
  status: CanaryShadowStatus,
  gates: readonly CanaryShadowGateResult[]
): CanaryShadowRiskLevel {
  if (status === 'ROLLED_BACK' || gates.some((gate) => gate.gateName === 'RollbackGate' && gate.blocking)) {
    return 'critical';
  }
  if (gates.some((gate) => gate.blocking)) {
    return 'high';
  }
  if (status === 'SKIPPED' || status === 'DISABLED') {
    return 'low';
  }
  return 'medium';
}

function pass(gateName: string, reason: string, evidence: readonly string[]): CanaryShadowGateResult {
  return {
    gateName,
    status: 'PASS',
    passed: true,
    blocking: false,
    reason,
    evidence,
  };
}

function blocked(gateName: string, reason: string, evidence: readonly string[]): CanaryShadowGateResult {
  return {
    gateName,
    status: 'BLOCKED',
    passed: false,
    blocking: true,
    reason,
    evidence,
  };
}

function formatRolloutGate(gate: { gateName: string; status: string; reason: string }): string {
  return `${gate.gateName}:${gate.status}:${gate.reason}`;
}

function formatBoolean(value: boolean | undefined): string {
  return value === true ? 'true' : 'false';
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
