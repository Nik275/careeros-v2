/**
 * @fileoverview Explicit and auditable lifecycle state machine.
 */

import { canTransition, type RequestLifecycleState } from './RequestLifecycle';

export interface StateTransitionRecord {
  transitionId: string;
  requestId: string;
  fromState: RequestLifecycleState | null;
  toState: RequestLifecycleState;
  reason: string;
  timestamp: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface OrchestratorStateMachineOptions {
  now?: () => string;
}

export class OrchestratorStateMachine {
  private readonly requestId: string;
  private readonly now: () => string;
  private currentState: RequestLifecycleState = 'RECEIVED';
  private readonly history: StateTransitionRecord[] = [];

  constructor(requestId: string, options: OrchestratorStateMachineOptions = {}) {
    this.requestId = requestId;
    this.now = options.now ?? (() => new Date().toISOString());
    this.history.push(this.createTransition(null, 'RECEIVED', 'Request received by orchestrator.'));
  }

  getCurrentState(): RequestLifecycleState {
    return this.currentState;
  }

  getHistory(): readonly StateTransitionRecord[] {
    return [...this.history];
  }

  isTerminal(): boolean {
    return (
      this.currentState === 'COMPLETED' ||
      this.currentState === 'FAILED' ||
      this.currentState === 'CANCELLED'
    );
  }

  transitionTo(
    nextState: RequestLifecycleState,
    reason: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): StateTransitionRecord {
    if (this.isTerminal()) {
      throw new Error(
        `Cannot transition request ${this.requestId} from terminal state ${this.currentState}.`
      );
    }

    if (!canTransition(this.currentState, nextState)) {
      throw new Error(
        `Invalid orchestrator transition for ${this.requestId}: ${this.currentState} -> ${nextState}.`
      );
    }

    const transition = this.createTransition(this.currentState, nextState, reason, metadata);
    this.currentState = nextState;
    this.history.push(transition);
    return transition;
  }

  complete(
    reason: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): StateTransitionRecord {
    return this.transitionTo('COMPLETED', reason, metadata);
  }

  fail(
    reason: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): StateTransitionRecord {
    return this.transitionTo('FAILED', reason, metadata);
  }

  cancel(
    reason: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): StateTransitionRecord {
    return this.transitionTo('CANCELLED', reason, metadata);
  }

  private createTransition(
    fromState: RequestLifecycleState | null,
    toState: RequestLifecycleState,
    reason: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): StateTransitionRecord {
    return {
      transitionId: `orchestrator-transition-${this.requestId}-${this.history.length + 1}`,
      requestId: this.requestId,
      fromState,
      toState,
      reason,
      timestamp: this.now(),
      metadata,
    };
  }
}
