/**
 * @fileoverview Rollout policy engine.
 */

import { RolloutGateEvaluator, resolveFlowPolicy } from './RolloutGateEvaluator';
import type {
  RolloutDecision,
  RolloutEvaluationInput,
  RolloutMode,
  RolloutPolicy,
  RolloutRiskLevel,
} from './RolloutControlTypes';

export class RolloutPolicyEngine {
  private readonly gateEvaluator: RolloutGateEvaluator;
  private readonly now: () => string;

  constructor(options: { gateEvaluator?: RolloutGateEvaluator; now?: () => string } = {}) {
    this.gateEvaluator = options.gateEvaluator ?? new RolloutGateEvaluator();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluate(input: {
    policy: RolloutPolicy;
    evaluation: RolloutEvaluationInput;
    killSwitchActive: boolean;
    flowKillSwitchActive: boolean;
  }): RolloutDecision {
    const flowPolicy = resolveFlowPolicy(input.policy, input.evaluation);
    const explicitReasons: string[] = [];
    let forcedBlock = false;

    if (!input.policy.globalEnabled && input.evaluation.requestedMode !== 'DISABLED') {
      forcedBlock = true;
      explicitReasons.push('Global rollout is disabled.');
    }

    if (!input.policy.allowedModes.includes(input.evaluation.requestedMode)) {
      forcedBlock = true;
      explicitReasons.push(`Mode ${input.evaluation.requestedMode} is not in allowedModes.`);
    }

    if (input.evaluation.requestedMode === 'CANARY_LIVE' && !input.policy.explicitlyAllowCanaryLive) {
      forcedBlock = true;
      explicitReasons.push('CANARY_LIVE is blocked unless explicitly allowed by policy.');
    }

    if (input.evaluation.requestedMode === 'FULL_LIVE') {
      forcedBlock = true;
      explicitReasons.push('FULL_LIVE is blocked in Phase 5.0.');
    }

    if (input.evaluation.requestedMode === 'DRY_RUN_COMPARE') {
      if (!flowPolicy.observeModeEnabled) {
        forcedBlock = true;
        explicitReasons.push('DRY_RUN_COMPARE requires observe mode to be enabled.');
      }
      if (!flowPolicy.bindingAvailable) {
        forcedBlock = true;
        explicitReasons.push('DRY_RUN_COMPARE requires a dry-run binding.');
      }
    }

    if (input.evaluation.requestedMode === 'CANARY_SHADOW') {
      if (!flowPolicy.observeModeEnabled) {
        forcedBlock = true;
        explicitReasons.push('CANARY_SHADOW requires observe mode to be enabled.');
      }
      if (!flowPolicy.bindingAvailable) {
        forcedBlock = true;
        explicitReasons.push('CANARY_SHADOW requires a dry-run authority binding.');
      }
      if (flowPolicy.canaryPercent <= 0) {
        forcedBlock = true;
        explicitReasons.push('CANARY_SHADOW requires canaryPercent greater than 0.');
      }
    }

    if (input.evaluation.requestedMode === 'OBSERVE_ONLY' && !flowPolicy.observeModeEnabled) {
      forcedBlock = true;
      explicitReasons.push('OBSERVE_ONLY requires observe mode to be enabled.');
    }

    const gateResults = this.gateEvaluator.evaluate(input);
    const blockingGates = gateResults.filter((gate) => gate.blocking);
    const allowed = !forcedBlock && blockingGates.length === 0;
    const decidedAt = this.now();

    return Object.freeze({
      decisionId: `rollout-decision-${hashString(
        `${input.evaluation.flow}|${input.evaluation.requestedMode}|${decidedAt}|${allowed}`
      )}`,
      flow: input.evaluation.flow,
      requestedMode: input.evaluation.requestedMode,
      approvedMode: allowed ? input.evaluation.requestedMode : 'DISABLED',
      status: allowed ? 'allowed' : forcedBlock || blockingGates.length > 0 ? 'blocked' : 'disabled',
      allowed,
      riskLevel: resolveRiskLevel(input.evaluation.requestedMode, blockingGates.length),
      gateResults,
      reasons: [
        ...explicitReasons,
        ...blockingGates.map((gate) => `${gate.gateName}: ${gate.reason}`),
      ],
      rollbackReason: allowed ? undefined : 'policy_block',
      decidedAt,
      metadata: input.evaluation.metadata ?? {},
    } satisfies RolloutDecision);
  }
}

function resolveRiskLevel(mode: RolloutMode, blockingGateCount: number): RolloutRiskLevel {
  if (blockingGateCount > 0) return 'critical';
  if (mode === 'CANARY_LIVE' || mode === 'FULL_LIVE') return 'high';
  if (mode === 'CANARY_SHADOW' || mode === 'DRY_RUN_COMPARE') return 'medium';
  return 'low';
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
