/**
 * CareerOS Confidence Calculator Tests
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConfidenceCalculator,
  resetConfidenceCalculator,
} from '../ConfidenceCalculator';
import type { CalculationInput } from '../ConfidenceCalculator';

describe('ConfidenceCalculator', () => {
  let calculator: ConfidenceCalculator;

  beforeEach(() => {
    resetConfidenceCalculator();
    calculator = new ConfidenceCalculator();
  });

  describe('calculate', () => {
    it('should calculate confidence with factors', () => {
      const input: CalculationInput = {
        predictionType: 'career-fit',
        evidence: [],
        factorScores: {
          'profile-confidence': 0.8,
          'career-confidence': 0.7,
          'evidence-confidence': 0.6,
        },
        systemId: 'test-system',
        requestId: 'test-request',
      };

      const result = calculator.calculate(input);

      expect(result.value).toBeGreaterThan(0);
      expect(result.value).toBeLessThanOrEqual(1);
      expect(result.authority).toBe('ConfidenceAuthority');
      expect(result.lineageId).toMatch(/^conf-/);
      expect(result.factors.length).toBe(3);
    });

    it('should use default confidence for empty factors', () => {
      const input: CalculationInput = {
        predictionType: 'default',
        evidence: [],
        factorScores: {},
        systemId: 'test-system',
        requestId: 'test-request',
      };

      const result = calculator.calculate(input);
      expect(result.value).toBe(0.5);
    });

    it('should validate factor scores', () => {
      const input: CalculationInput = {
        predictionType: 'career-fit',
        evidence: [],
        factorScores: {
          'profile-confidence': 0.8,
          'career-confidence': NaN,
        },
        systemId: 'test-system',
        requestId: 'test-request',
      };

      expect(() => calculator.calculate(input)).toThrow();
    });

    it('should clamp confidence to bounds', () => {
      const input: CalculationInput = {
        predictionType: 'career-fit',
        evidence: [],
        factorScores: {
          'profile-confidence': 10, // Should be clamped
          'career-confidence': -5,  // Should be clamped
        },
        systemId: 'test-system',
        requestId: 'test-request',
      };

      const result = calculator.calculate(input);
      expect(result.value).toBeGreaterThanOrEqual(0.1); // minConfidence
      expect(result.value).toBeLessThanOrEqual(0.99);   // maxConfidence
    });
  });

  describe('fallback behavior', () => {
    it('should return fallback confidence on error', () => {
      const input: CalculationInput = {
        predictionType: '', // Invalid - will cause error
        evidence: [],
        factorScores: { test: 0.5 },
        systemId: '', // Invalid
        requestId: '', // Invalid
      };

      const result = calculator.calculate(input);
      expect(result.value).toBe(0.5);
      expect(result.component).toBe('fallback');
    });
  });

  describe('evidence handling', () => {
    it('should factor evidence quality into calculation', () => {
      const input: CalculationInput = {
        predictionType: 'career-fit',
        evidence: [
          { type: 'test', source: 'source1', quality: 0.9, timestamp: Date.now() },
          { type: 'test', source: 'source2', quality: 0.7, timestamp: Date.now() },
        ],
        factorScores: { 'test': 0.8 },
        systemId: 'test-system',
        requestId: 'test-request',
      };

      const result = calculator.calculate(input);
      expect(result.evidence.length).toBe(2);
    });
  });
});
