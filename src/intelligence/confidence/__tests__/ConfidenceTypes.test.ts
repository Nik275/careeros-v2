/**
 * CareerOS Confidence Types Tests
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  validateConfidence,
  migrateLegacyConfidence,
  getReliabilityBand,
  createDefaultBounds,
  ConfidenceValidationError,
} from '../ConfidenceTypes';

describe('ConfidenceTypes', () => {
  describe('validateConfidence', () => {
    it('should accept valid confidence values', () => {
      expect(validateConfidence(0)).toBe(0);
      expect(validateConfidence(0.5)).toBe(0.5);
      expect(validateConfidence(1)).toBe(1);
      expect(validateConfidence(0.75)).toBe(0.75);
    });

    it('should clamp values outside range', () => {
      expect(validateConfidence(-0.5)).toBe(0);
      expect(validateConfidence(1.5)).toBe(1);
      expect(validateConfidence(-100)).toBe(0);
      expect(validateConfidence(100)).toBe(1);
    });

    it('should throw on invalid types', () => {
      expect(() => validateConfidence('high')).toThrow(ConfidenceValidationError);
      expect(() => validateConfidence(null)).toThrow(ConfidenceValidationError);
      expect(() => validateConfidence(undefined)).toThrow(ConfidenceValidationError);
      expect(() => validateConfidence(NaN)).toThrow(ConfidenceValidationError);
      expect(() => validateConfidence(Infinity)).toThrow(ConfidenceValidationError);
    });
  });

  describe('migrateLegacyConfidence', () => {
    it('should convert enum strings to floats', () => {
      expect(migrateLegacyConfidence('HIGH')).toBe(0.80);
      expect(migrateLegacyConfidence('MEDIUM')).toBe(0.55);
      expect(migrateLegacyConfidence('LOW')).toBe(0.30);
      expect(migrateLegacyConfidence('VERY_HIGH')).toBe(0.95);
    });

    it('should convert percentage integers to floats', () => {
      expect(migrateLegacyConfidence(95)).toBe(0.95);
      expect(migrateLegacyConfidence(50)).toBe(0.5);
      expect(migrateLegacyConfidence(100)).toBe(1);
    });

    it('should pass through valid floats', () => {
      expect(migrateLegacyConfidence(0.75)).toBe(0.75);
      expect(migrateLegacyConfidence(0.5)).toBe(0.5);
    });

    it('should return default for unknown values', () => {
      expect(migrateLegacyConfidence('UNKNOWN')).toBe(0.5);
      expect(migrateLegacyConfidence({})).toBe(0.5);
    });
  });

  describe('getReliabilityBand', () => {
    it('should return correct bands', () => {
      expect(getReliabilityBand(0.95)).toBe('excellent');
      expect(getReliabilityBand(0.85)).toBe('good');
      expect(getReliabilityBand(0.70)).toBe('moderate');
      expect(getReliabilityBand(0.50)).toBe('poor');
      expect(getReliabilityBand(0.20)).toBe('unreliable');
    });

    it('should handle boundary values', () => {
      expect(getReliabilityBand(0.90)).toBe('excellent');
      expect(getReliabilityBand(0.75)).toBe('good');
      expect(getReliabilityBand(0.60)).toBe('moderate');
      expect(getReliabilityBand(0.40)).toBe('poor');
    });
  });

  describe('createDefaultBounds', () => {
    it('should create bounds around confidence', () => {
      const bounds = createDefaultBounds(0.5);
      expect(bounds.lower).toBeLessThan(0.5);
      expect(bounds.upper).toBeGreaterThan(0.5);
      expect(bounds.confidenceLevel).toBe(0.95);
    });

    it('should handle edge cases', () => {
      const zeroBounds = createDefaultBounds(0);
      expect(zeroBounds.lower).toBe(0);
      expect(zeroBounds.upper).toBeGreaterThan(0);

      const oneBounds = createDefaultBounds(1);
      expect(oneBounds.lower).toBeLessThan(1);
      expect(oneBounds.upper).toBe(1);
    });
  });
});
