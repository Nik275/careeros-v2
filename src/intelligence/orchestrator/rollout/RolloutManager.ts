/**
 * @fileoverview Rollout control-plane manager.
 *
 * The manager evaluates policy and records decisions. It does not execute
 * intelligence, call legacy engines, or replace production output.
 */

import { createRolloutConfig, type RolloutConfig } from './RolloutConfig';
import type {
  RolloutAuditRecord,
  RolloutDecision,
  RolloutEvaluationInput,
  RolloutFlow,
  RolloutHealthSnapshot,
  RolloutMode,
} from './RolloutControlTypes';
import { RolloutKillSwitch } from './RolloutKillSwitch';
import { RolloutPolicyEngine } from './RolloutPolicyEngine';
import {
  createRolloutHealthSnapshot,
  InMemoryRolloutStateStore,
  type RolloutStateStore,
} from './RolloutStateStore';

export interface RolloutManagerOptions {
  config?: RolloutConfig;
  policyEngine?: RolloutPolicyEngine;
  killSwitch?: RolloutKillSwitch;
  store?: RolloutStateStore;
  now?: () => string;
}

export class RolloutManager {
  private readonly config: RolloutConfig;
  private readonly policyEngine: RolloutPolicyEngine;
  private readonly killSwitch: RolloutKillSwitch;
  private readonly store: RolloutStateStore;
  private readonly now: () => string;
  private readonly auditRecords: RolloutAuditRecord[] = [];

  constructor(options: RolloutManagerOptions = {}) {
    this.config = options.config ?? createRolloutConfig();
    this.now = options.now ?? (() => new Date().toISOString());
    this.policyEngine = options.policyEngine ?? new RolloutPolicyEngine({ now: this.now });
    this.killSwitch =
      options.killSwitch ??
      new RolloutKillSwitch({
        activeByDefault: this.config.killSwitchEnabled,
        now: this.now,
      });
    this.store = options.store ?? new InMemoryRolloutStateStore({ now: this.now });
  }

  evaluate(input: RolloutEvaluationInput): RolloutDecision {
    const decision = this.policyEngine.evaluate({
      policy: this.config,
      evaluation: input,
      killSwitchActive: this.killSwitch.isGlobalActive(),
      flowKillSwitchActive: this.killSwitch.isFlowActive(input.flow),
    });
    this.store.recordDecision(decision);
    this.auditRecords.push(this.killSwitch.createAuditRecord(decision));
    return decision;
  }

  canRunMode(input: {
    flow: RolloutFlow;
    mode: RolloutMode;
    observeModeEnabled?: boolean;
    bindingAvailable?: boolean;
    telemetryHealthy?: boolean;
    privacySafe?: boolean;
    expandedParityCIGatePassed?: boolean;
    manualApprovalGranted?: boolean;
    canaryPercent?: number;
  }): boolean {
    return this.evaluate({
      flow: input.flow,
      requestedMode: input.mode,
      flowPolicy: {
        observeModeEnabled: input.observeModeEnabled ?? false,
        bindingAvailable: input.bindingAvailable ?? false,
        telemetryHealthy: input.telemetryHealthy ?? false,
        privacySafe: input.privacySafe ?? true,
        expandedParityCIGatePassed: input.expandedParityCIGatePassed ?? false,
        manualApprovalGranted: input.manualApprovalGranted ?? false,
        canaryPercent: input.canaryPercent ?? 0,
      },
    }).allowed;
  }

  getHealth(): RolloutHealthSnapshot {
    return createRolloutHealthSnapshot({
      store: this.store,
      killSwitchActive: this.killSwitch.isGlobalActive(),
    });
  }

  getRecentDecisions(limit: number): readonly RolloutDecision[] {
    return this.store.getRecentDecisions(limit);
  }

  getAuditRecords(): readonly RolloutAuditRecord[] {
    return [...this.auditRecords];
  }

  getKillSwitch(): RolloutKillSwitch {
    return this.killSwitch;
  }

  getStore(): RolloutStateStore {
    return this.store;
  }
}
