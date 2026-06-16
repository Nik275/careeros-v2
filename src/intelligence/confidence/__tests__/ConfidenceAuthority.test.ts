/**
 * CareerOS Confidence Authority Tests
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConfidenceAuthority,
  resetConfidenceAuthority,
} from '../ConfidenceAuthority';
import type { ConfidenceRequest } from '../ConfidenceTypes';

describe('ConfidenceAuthority', () => {
  let authority: ConfidenceAuthority;

  beforeEach(() => {
    resetConfidenceAuthority();
    authority = new ConfidenceAuthority();
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence for valid request', async () => {
      const request: ConfidenceRequest = {
        requestId: 'test-request',
        requestingSystem: 'test-system',
        predictionType: 'career-fit',
        prediction: { test: 'data' },
        evidence: [
          { type: 'test', source: 'source1', quality: 0.8, timestamp: Date.now() },
        ],
        context: {
          timestamp: Date.now(),
          metadata: { test: true },
        },
      };

      const result = await authority.calculateConfidence(request);

      expect(result.value).toBeGreaterThan(0);
      expect(result.value).toBeLessThanOrEqual(1);
      expect(result.authority).toBe('ConfidenceAuthority');
      expect(result.lineageId).toMatch(/^conf-/);
    });

    it('should validate request', async () => {
      const invalidRequest = {
        requestId: '',
        requestingSystem: '',
        predictionType: 'career-fit',
        prediction: {},
        evidence: [],
        context: { timestamp: Date.now() },
      } satisfies ConfidenceRequest;

      // Should return fallback confidence, not throw
      const result = await authority.calculateConfidence(invalidRequest);
      expect(result.value).toBe(0.5);
      expect(result.component).toBe('fallback');
    });

    it('should cache results', async () => {
      const request: ConfidenceRequest = {
        requestId: 'cached-request',
        requestingSystem: 'test-system',
        predictionType: 'career-fit',
        prediction: { test: 'data' },
        evidence: [],
        context: { timestamp: Date.now() },
      };

      const result1 = await authority.calculateConfidence(request);
      const result2 = await authority.calculateConfidence(request);

      // Should return cached result (same lineageId)
      expect(result1.lineageId).toBe(result2.lineageId);
    });
  });

  describe('calculateUncertainty', () => {
    it('should calculate uncertainty profile', async () => {
      const result = await authority.calculateUncertainty({
        requestId: 'uncertainty-request',
        requestingSystem: 'test-system',
        predictionType: 'career-fit',
        prediction: { test: 'data' },
        evidence: [],
        context: { timestamp: Date.now() },
      });

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
      expect(result.aleatoric).toBeGreaterThanOrEqual(0);
      expect(result.epistemic).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateReliability', () => {
    it('should calculate reliability assessment', async () => {
      const result = await authority.calculateReliability({
        systemId: 'test-system',
      });

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const health = authority.getHealth();

      expect(['healthy', 'degraded', 'critical']).toContain(health.status);
      expect(health.metrics).toBeDefined();
      expect(health.systems).toBeDefined();
    });
  });

  describe('batch operations', () => {
    it('should calculate confidence batch', async () => {
      const requests: ConfidenceRequest[] = [
        {
          requestId: 'req-1',
          requestingSystem: 'system-1',
          predictionType: 'career-fit',
          prediction: {},
          evidence: [],
          context: { timestamp: Date.now() },
        },
        {
          requestId: 'req-2',
          requestingSystem: 'system-2',
          predictionType: 'career-fit',
          prediction: {},
          evidence: [],
          context: { timestamp: Date.now() },
        },
      ];

      const results = await authority.calculateConfidenceBatch(requests);
      expect(results.length).toBe(2);
      expect(results[0].authority).toBe('ConfidenceAuthority');
      expect(results[1].authority).toBe('ConfidenceAuthority');
    });
  });
});
