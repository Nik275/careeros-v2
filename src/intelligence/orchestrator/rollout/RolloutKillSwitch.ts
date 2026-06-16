/**
 * @fileoverview In-process rollout kill switch.
 */

import type { RolloutAuditRecord, RolloutDecision, RolloutFlow } from './RolloutControlTypes';

export interface RolloutKillSwitchState {
  active: boolean;
  reason?: string;
  activatedAt?: string;
}

export class RolloutKillSwitch {
  private globalState: RolloutKillSwitchState = { active: true, reason: 'safe default disabled' };
  private readonly flowStates = new Map<string, RolloutKillSwitchState>();
  private readonly audits: RolloutAuditRecord[] = [];
  private readonly now: () => string;

  constructor(options: { activeByDefault?: boolean; now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.globalState = {
      active: options.activeByDefault ?? true,
      reason: options.activeByDefault === false ? undefined : 'safe default disabled',
      activatedAt: options.activeByDefault === false ? undefined : this.now(),
    };
  }

  activateGlobal(reason: string): void {
    this.globalState = { active: true, reason, activatedAt: this.now() };
  }

  deactivateGlobal(): void {
    this.globalState = { active: false };
  }

  activateFlow(flow: RolloutFlow, reason: string): void {
    this.flowStates.set(flow, { active: true, reason, activatedAt: this.now() });
  }

  deactivateFlow(flow: RolloutFlow): void {
    this.flowStates.set(flow, { active: false });
  }

  isGlobalActive(): boolean {
    return this.globalState.active;
  }

  isFlowActive(flow: RolloutFlow): boolean {
    return this.flowStates.get(flow)?.active ?? false;
  }

  getGlobalState(): RolloutKillSwitchState {
    return { ...this.globalState };
  }

  getFlowState(flow: RolloutFlow): RolloutKillSwitchState {
    return { ...(this.flowStates.get(flow) ?? { active: false }) };
  }

  createAuditRecord(decision: RolloutDecision): RolloutAuditRecord {
    const record: RolloutAuditRecord = {
      auditId: `rollout-audit-${decision.decisionId}`,
      decision,
      createdAt: this.now(),
      notes: [
        `Global kill switch active: ${this.isGlobalActive()}.`,
        `Flow kill switch active: ${this.isFlowActive(decision.flow)}.`,
      ],
    };
    this.audits.push(record);
    return record;
  }

  getAuditRecords(): readonly RolloutAuditRecord[] {
    return [...this.audits];
  }
}
