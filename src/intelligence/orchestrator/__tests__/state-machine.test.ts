import { describe, expect, it } from 'vitest';
import { OrchestratorStateMachine } from '../OrchestratorStateMachine';

describe('OrchestratorStateMachine', () => {
  it('records explicit lifecycle transitions through completion', () => {
    const now = createClock();
    const machine = new OrchestratorStateMachine('state-1', {
      now,
    });

    machine.transitionTo('VALIDATING', 'validation');
    machine.transitionTo('UNDERSTANDING', 'understanding');
    machine.transitionTo('GENERATING', 'generation');
    machine.transitionTo('TRACKING', 'tracking');
    machine.transitionTo('LEARNING', 'learning');
    machine.complete('done');

    expect(machine.getCurrentState()).toBe('COMPLETED');
    expect(machine.getHistory().map((transition) => transition.toState)).toEqual([
      'RECEIVED',
      'VALIDATING',
      'UNDERSTANDING',
      'GENERATING',
      'TRACKING',
      'LEARNING',
      'COMPLETED',
    ]);
  });

  it('rejects invalid lifecycle transitions', () => {
    const machine = new OrchestratorStateMachine('state-2');

    expect(() => machine.transitionTo('GENERATING', 'skip validation')).toThrow(
      'Invalid orchestrator transition'
    );
  });
});

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
