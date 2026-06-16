/**
 * @fileoverview Decision Authority - Unit Tests
 * @module @/intelligence/decision/__tests__/DecisionAuthority.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDecisionAuthority,
  DEFAULT_DECISION_CONFIG,
  type DecisionInput,
  type DecisionOption,
  type DecisionContext,
} from '../index';

type DecisionAuthorityInstance = ReturnType<typeof createDecisionAuthority>;

describe('DecisionAuthority', () => {
  let authority: DecisionAuthorityInstance;

  beforeEach(() => {
    authority = createDecisionAuthority();
  });

  describe('Basic Operations', () => {
    it('should create a decision authority with default config', () => {
      expect(authority).toBeDefined();
      expect(authority.getConfig()).toEqual(DEFAULT_DECISION_CONFIG);
    });

    it('should pass health check', async () => {
      const healthy = await authority.healthCheck();
      expect(healthy).toBe(true);
    });

    it('should make a simple decision', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
        createTestOption('opt-2', 'Option 2', 0.7),
      ]);

      const result = await authority.decide(input);

      expect(result).toBeDefined();
      expect(result.decisionId).toBeDefined();
      expect(result.type).toBe('career-selection');
      expect(result.status).toBe('completed');
      expect(result.winner).toBeDefined();
      expect(result.rankedOptions).toHaveLength(2);
      expect(result.explanation).toBeDefined();
      expect(result.audit).toBeDefined();
    });

    it('should select the highest scoring option', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
        createTestOption('opt-2', 'Option 2', 0.7),
        createTestOption('opt-3', 'Option 3', 0.5),
      ]);

      const result = await authority.decide(input);

      expect(result.winner?.id).toBe('opt-1');
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = { debug: true };
      authority.updateConfig(newConfig);
      
      expect(authority.getConfig().debug).toBe(true);
    });

    it('should preserve unmodified config values', () => {
      authority.updateConfig({ debug: true });
      
      expect(authority.getConfig().ranking.algorithm).toBe(DEFAULT_DECISION_CONFIG.ranking.algorithm);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid input', async () => {
      const invalidInput = {} as DecisionInput;
      
      await expect(authority.decide(invalidInput)).rejects.toThrow();
    });

    it('should throw error for empty options', async () => {
      const input = createTestInput([]);
      
      await expect(authority.decide(input)).rejects.toThrow('No options provided');
    });
  });

  describe('History', () => {
    it('should store and retrieve decisions', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      const result = await authority.decide(input);
      const retrieved = await authority.getDecision(result.decisionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.decisionId).toBe(result.decisionId);
    });

    it('should return undefined for non-existent decision', async () => {
      const retrieved = await authority.getDecision('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get decision history for student', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      await authority.decide(input);
      const history = await authority.getDecisionHistory('student-1');

      expect(history).toHaveLength(1);
    });
  });

  describe('Events', () => {
    it('should emit events during decision', async () => {
      const events: string[] = [];
      
      authority.on('decision-created', () => {
        events.push('created');
      });
      authority.on('decision-completed', () => {
        events.push('completed');
      });

      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      await authority.decide(input);

      expect(events).toContain('created');
      expect(events).toContain('completed');
    });

    it('should allow unsubscribing from events', async () => {
      const events: string[] = [];
      
      const unsubscribe = authority.on('decision-created', () => {
        events.push('created');
      });
      unsubscribe();

      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      await authority.decide(input);

      expect(events).not.toContain('created');
    });
  });

  describe('Metrics', () => {
    it('should track metrics', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      await authority.decide(input);
      const metrics = await authority.getMetrics();

      expect(metrics.totalDecisions).toBe(1);
    });

    it('should reset metrics', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      await authority.decide(input);
      authority.resetMetrics();
      const metrics = await authority.getMetrics();

      expect(metrics.totalDecisions).toBe(0);
    });
  });

  describe('Reconsideration', () => {
    it('should reconsider a decision', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
        createTestOption('opt-2', 'Option 2', 0.8),
      ]);

      const original = await authority.decide(input);
      
      const newContext = createTestContext();
      const reconsidered = await authority.reconsider(original.decisionId, newContext);

      expect(reconsidered).toBeDefined();
      expect(reconsidered.decisionId).not.toBe(original.decisionId);
    });

    it('should throw for non-existent decision', async () => {
      await expect(
        authority.reconsider('non-existent', createTestContext())
      ).rejects.toThrow('not found');
    });
  });

  describe('Appeals', () => {
    it('should create an appeal', async () => {
      const input = createTestInput([
        createTestOption('opt-1', 'Option 1', 0.9),
      ]);

      const result = await authority.decide(input);
      const appeal = await authority.appeal(result.decisionId, 'Test reason', 'student-1');

      expect(appeal.success).toBe(true);
      expect(appeal.appealId).toBeDefined();
      expect(appeal.status).toBe('pending-review');
    });
  });
});

// ============================================================================
// TEST HELPERS
// ============================================================================

function createTestContext(): DecisionContext {
  return {
    studentId: 'student-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

function createTestOption(
  id: string,
  name: string,
  confidence: number
): DecisionOption {
  return {
    id,
    type: 'career',
    data: { name },
    metadata: {
      label: name,
      sourceConfidence: confidence,
    },
    source: 'test',
    createdAt: new Date(),
  };
}

function createTestInput(options: DecisionOption[]): DecisionInput {
  return {
    type: 'career-selection',
    context: createTestContext(),
    options,
  };
}
