/**
 * @fileoverview Rollout state storage abstraction and in-process stores.
 */

import type { RolloutDecision, RolloutFlow, RolloutHealthSnapshot, RolloutMode } from './RolloutControlTypes';

export interface RolloutFlowState {
  flow: RolloutFlow;
  mode: RolloutMode;
  updatedAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RolloutGlobalState {
  mode: RolloutMode;
  updatedAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RolloutStateStoreHealth {
  healthy: boolean;
  storageMode: 'noop' | 'memory';
  flowCount: number;
  decisionCount: number;
  lastErrorMessage?: string;
}

export interface RolloutStateStore {
  getFlowState(flow: RolloutFlow): RolloutFlowState | undefined;
  setFlowState(flow: RolloutFlow, state: RolloutFlowState): void;
  getGlobalState(): RolloutGlobalState;
  setGlobalState(state: RolloutGlobalState): void;
  recordDecision(decision: RolloutDecision): void;
  getRecentDecisions(limit: number): readonly RolloutDecision[];
  healthCheck(): RolloutStateStoreHealth;
}

export class NoopRolloutStateStore implements RolloutStateStore {
  getFlowState(_flow: RolloutFlow): RolloutFlowState | undefined {
    return undefined;
  }

  setFlowState(_flow: RolloutFlow, _state: RolloutFlowState): void {}

  getGlobalState(): RolloutGlobalState {
    return {
      mode: 'DISABLED',
      updatedAt: new Date(0).toISOString(),
      metadata: {},
    };
  }

  setGlobalState(_state: RolloutGlobalState): void {}

  recordDecision(_decision: RolloutDecision): void {}

  getRecentDecisions(_limit: number): readonly RolloutDecision[] {
    return [];
  }

  healthCheck(): RolloutStateStoreHealth {
    return {
      healthy: true,
      storageMode: 'noop',
      flowCount: 0,
      decisionCount: 0,
    };
  }
}

export class InMemoryRolloutStateStore implements RolloutStateStore {
  private readonly flowStates = new Map<string, RolloutFlowState>();
  private decisions: RolloutDecision[] = [];
  private globalState: RolloutGlobalState;
  private readonly maxDecisions: number;

  constructor(options: { maxDecisions?: number; now?: () => string } = {}) {
    const now = options.now ?? (() => new Date().toISOString());
    this.maxDecisions = Math.max(1, Math.floor(options.maxDecisions ?? 1_000));
    this.globalState = {
      mode: 'DISABLED',
      updatedAt: now(),
      metadata: {},
    };
  }

  getFlowState(flow: RolloutFlow): RolloutFlowState | undefined {
    return this.flowStates.get(flow);
  }

  setFlowState(flow: RolloutFlow, state: RolloutFlowState): void {
    this.flowStates.set(flow, Object.freeze({ ...state }));
  }

  getGlobalState(): RolloutGlobalState {
    return this.globalState;
  }

  setGlobalState(state: RolloutGlobalState): void {
    this.globalState = Object.freeze({ ...state });
  }

  recordDecision(decision: RolloutDecision): void {
    this.decisions.push(Object.freeze(decision));
    if (this.decisions.length > this.maxDecisions) {
      this.decisions = this.decisions.slice(-this.maxDecisions);
    }
  }

  getRecentDecisions(limit: number): readonly RolloutDecision[] {
    return this.decisions.slice(-Math.max(0, Math.floor(limit))).reverse();
  }

  healthCheck(): RolloutStateStoreHealth {
    return {
      healthy: true,
      storageMode: 'memory',
      flowCount: this.flowStates.size,
      decisionCount: this.decisions.length,
    };
  }
}

export function createRolloutHealthSnapshot(input: {
  store: RolloutStateStore;
  killSwitchActive: boolean;
}): RolloutHealthSnapshot {
  const health = input.store.healthCheck();
  const recent = input.store.getRecentDecisions(1)[0];
  return {
    healthy: health.healthy && !input.killSwitchActive,
    mode: input.store.getGlobalState().mode,
    flowCount: health.flowCount,
    killSwitchActive: input.killSwitchActive,
    recentDecisionCount: health.decisionCount,
    lastDecisionStatus: recent?.status,
  };
}
