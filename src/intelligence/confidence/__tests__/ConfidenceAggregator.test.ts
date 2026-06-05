/**
 * CareerOS Confidence Aggregator Tests
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConfidenceAggregator,
  resetConfidenceAggregator,
} from '../ConfidenceAggregator';
import type { AggregationInput } from '../ConfidenceAggregator';
import type { ConfidenceValue } from '../ConfidenceTypes';

function createMockConfidence(value: number): ConfidenceValue {
  return {
    value,
    lineageId: `mock-${value}`,
    authority: 'ConfidenceAuthority',
    component: 'test',
    calculatedAt: Date.now(),
    factors: [],
    evidence: [],
    calibration: {
      isCalibrated: true,
      error: 0.1,
      sampleSize: 100,
      reliability: 'good',
    },
    bounds: {
      lower: value - 0.1,
      upper: value + 0.1,
      confidenceLevel: 0.95,
    },
  };
}

describe('ConfidenceAggregator', () => {
  let aggregator: ConfidenceAggregator;

  beforeEach(() => {
    resetConfidenceAggregator();
    aggregator = new ConfidenceAggregator();
  });

  describe('aggregate', () => {
    it('should throw on empty array', () => {
      const input: AggregationInput = {
        confidences: [],
        method: 'weighted-average',
        systemId: 'test',
        requestId: 'test',
      };

      expect(() => aggregator.aggregate(input)).toThrow('Cannot aggregate empty confidence array');
    });

    it('should return single confidence unchanged', () => {
      const conf = createMockConfidence(0.7);
      const input: AggregationInput = {
        confidences: [conf],
        method: 'weighted-average',
        systemId: 'test',
        requestId: 'test',
      };

      const result = aggregator.aggregate(input);
      expect(result.value).toBe(0.7);
    });

    it('should calculate weighted average', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.6),
        ],
        method: 'weighted-average',
        systemId: 'test',
        requestId: 'test',
        weights: [0.7, 0.3],
      };

      const result = aggregator.aggregate(input);
      expect(result.value).toBeCloseTo(0.74, 2);
    });

    it('should calculate minimum (conservative)', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.6),
          createMockConfidence(0.9),
        ],
        method: 'minimum',
        systemId: 'test',
        requestId: 'test',
      };

      const result = aggregator.aggregate(input);
      expect(result.value).toBe(0.6);
    });

    it('should calculate maximum (optimistic)', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.6),
          createMockConfidence(0.9),
        ],
        method: 'maximum',
        systemId: 'test',
        requestId: 'test',
      };

      const result = aggregator.aggregate(input);
      expect(result.value).toBe(0.9);
    });

    it('should calculate consensus', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.82),
          createMockConfidence(0.79),
        ],
        method: 'consensus',
        systemId: 'test',
        requestId: 'test',
      };

      const result = aggregator.aggregate(input);
      // High agreement should result in high confidence
      expect(result.value).toBeGreaterThan(0.8);
    });
  });

  describe('error handling', () => {
    it('should throw on weight mismatch', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.6),
        ],
        method: 'weighted-average',
        systemId: 'test',
        requestId: 'test',
        weights: [0.5], // Wrong length
      };

      expect(() => aggregator.aggregate(input)).toThrow('Weights length must match');
    });

    it('should throw on zero total weight', () => {
      const input: AggregationInput = {
        confidences: [
          createMockConfidence(0.8),
          createMockConfidence(0.6),
        ],
        method: 'weighted-average',
        systemId: 'test',
        requestId: 'test',
        weights: [0, 0],
      };

      expect(() => aggregator.aggregate(input)).toThrow('Total weight cannot be zero');
    });
  });
});
