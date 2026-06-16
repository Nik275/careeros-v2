import { describe, expect, it } from 'vitest';
import { InMemoryRolloutStateStore, NoopRolloutStateStore } from '../RolloutStateStore';
import type { RolloutDecision } from '../RolloutControlTypes';

describe('rollout state stores', () => {
  it('keeps NoopRolloutStateStore non-throwing', () => {
    const store = new NoopRolloutStateStore();

    expect(() => store.recordDecision(createDecision())).not.toThrow();
    expect(store.getRecentDecisions(10)).toEqual([]);
    expect(store.healthCheck()).toMatchObject({
      healthy: true,
      storageMode: 'noop',
    });
  });

  it('supports in-memory flow state and decisions', () => {
    const store = new InMemoryRolloutStateStore({
      now: () => '2026-06-06T00:00:00.000Z',
    });

    store.setFlowState('career-fit', {
      flow: 'career-fit',
      mode: 'DRY_RUN_COMPARE',
      updatedAt: '2026-06-06T00:00:00.000Z',
      metadata: {},
    });
    store.recordDecision(createDecision());

    expect(store.getFlowState('career-fit')?.mode).toBe('DRY_RUN_COMPARE');
    expect(store.getRecentDecisions(1)).toHaveLength(1);
    expect(store.healthCheck()).toMatchObject({
      healthy: true,
      storageMode: 'memory',
      flowCount: 1,
      decisionCount: 1,
    });
  });
});

function createDecision(): RolloutDecision {
  return {
    decisionId: 'decision-1',
    flow: 'career-fit',
    requestedMode: 'DRY_RUN_COMPARE',
    approvedMode: 'DRY_RUN_COMPARE',
    status: 'allowed',
    allowed: true,
    riskLevel: 'medium',
    gateResults: [],
    reasons: [],
    decidedAt: '2026-06-06T00:00:00.000Z',
    metadata: {},
  };
}
