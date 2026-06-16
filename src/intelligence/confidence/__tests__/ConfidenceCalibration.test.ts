/**
 * CareerOS Confidence Calibration Tests
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConfidenceCalibration,
  resetConfidenceCalibration,
} from '../ConfidenceCalibration';
import type { CalibrationObservation, ConfidenceValue } from '../ConfidenceTypes';

describe('ConfidenceCalibration', () => {
  let calibration: ConfidenceCalibration;

  beforeEach(() => {
    resetConfidenceCalibration();
    calibration = new ConfidenceCalibration();
  });

  describe('addObservation', () => {
    it('should store observation', () => {
      const obs: CalibrationObservation = {
        id: 'test-1',
        systemId: 'test-system',
        predictedConfidence: 0.8,
        actualOutcome: true,
        outcomeQuality: 0.9,
        timestamp: Date.now(),
        context: {
          domain: 'test',
          decisionType: 'test',
          userSegment: 'test',
          timeHorizon: 'short',
        },
      };

      calibration.addObservation(obs);
      const profile = calibration.getProfile('test-system');
      
      expect(profile.sampleSize).toBe(1);
    });

    it('should calibrate when enough observations', () => {
      // Add 30 observations (minSampleSize)
      for (let i = 0; i < 30; i++) {
        calibration.addObservation({
          id: `obs-${i}`,
          systemId: 'test-system',
          predictedConfidence: 0.7,
          actualOutcome: i < 20, // 67% success rate
          outcomeQuality: 0.8,
          timestamp: Date.now(),
          context: {
            domain: 'test',
            decisionType: 'test',
            userSegment: 'test',
            timeHorizon: 'short',
          },
        });
      }

      const profile = calibration.getProfile('test-system');
      expect(profile.sampleSize).toBe(30);
      expect(profile.status).not.toBe('insufficient_data');
    });
  });

  describe('calibrateConfidence', () => {
    it('should return uncalibrated for insufficient data', () => {
      const confidence: ConfidenceValue = {
        value: 0.8,
        lineageId: 'test',
        authority: 'ConfidenceAuthority',
        component: 'test',
        calculatedAt: Date.now(),
        factors: [],
        evidence: [],
        calibration: {
          isCalibrated: false,
          error: 0.2,
          sampleSize: 0,
          reliability: 'unreliable',
        },
        bounds: {
          lower: 0.7,
          upper: 0.9,
          confidenceLevel: 0.95,
        },
      };

      const result = calibration.calibrateConfidence(confidence, 'test-system');
      expect(result.calibration.isCalibrated).toBe(false);
    });

    it('should apply calibration when data available', () => {
      // Add observations with pattern
      for (let i = 0; i < 50; i++) {
        calibration.addObservation({
          id: `obs-${i}`,
          systemId: 'test-system',
          predictedConfidence: 0.8,
          actualOutcome: i < 32, // 64% vs 80% predicted = overconfident
          outcomeQuality: 0.8,
          timestamp: Date.now(),
          context: {
            domain: 'test',
            decisionType: 'test',
            userSegment: 'test',
            timeHorizon: 'short',
          },
        });
      }

      const confidence: ConfidenceValue = {
        value: 0.8,
        lineageId: 'test',
        authority: 'ConfidenceAuthority',
        component: 'test',
        calculatedAt: Date.now(),
        factors: [],
        evidence: [],
        calibration: {
          isCalibrated: false,
          error: 0.2,
          sampleSize: 0,
          reliability: 'unreliable',
        },
        bounds: {
          lower: 0.7,
          upper: 0.9,
          confidenceLevel: 0.95,
        },
      };

      const result = calibration.calibrateConfidence(confidence, 'test-system');
      
      // Should adjust down for overconfidence
      expect(result.value).toBeLessThan(0.8);
      expect(result.calibration.isCalibrated).toBe(true);
    });
  });

  describe('isCalibrated', () => {
    it('should return false for new system', () => {
      expect(calibration.isCalibrated('new-system')).toBe(false);
    });

    it('should return true for well-calibrated system', () => {
      // Add well-calibrated observations
      for (let i = 0; i < 100; i++) {
        calibration.addObservation({
          id: `obs-${i}`,
          systemId: 'calibrated-system',
          predictedConfidence: 0.7,
          actualOutcome: i < 70, // 70% matches 70% predicted
          outcomeQuality: 0.8,
          timestamp: Date.now(),
          context: {
            domain: 'test',
            decisionType: 'test',
            userSegment: 'test',
            timeHorizon: 'short',
          },
        });
      }

      expect(calibration.isCalibrated('calibrated-system')).toBe(true);
    });
  });
});
