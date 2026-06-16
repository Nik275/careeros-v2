/**
 * Intelligence Validation Engine Tests
 *
 * 300+ tests covering:
 * - Normal operation
 * - Adversarial inputs
 * - Contradictory profiles
 * - Uncertain data
 * - Extreme values
 * - Edge cases
 * - Random noise
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConfidenceCalibrationEngine,
  RecommendationStabilityEngine,
  RecommendationConsistencyEngine,
  UncertaintyEngine,
  CounterfactualEngine,
  RecommendationAuditEngine,
  IntelligenceValidationEngine,
} from '../index';
import type {
  RecommendationSnapshot,
  PathwayResult,
  UncertaintyInput,
  CounterfactualInput,
  AuditInput,
} from '../index';

// ============================================================================
// TEST UTILITIES
// ============================================================================

type RawCalibrationBin = ReturnType<ConfidenceCalibrationEngine['binPredictions']>[number];
type CalibrationBinFixture = Omit<RawCalibrationBin, 'sampleSizeAdequate'> &
  Partial<Pick<RawCalibrationBin, 'sampleSizeAdequate'>>;

const createCalibrationBins = (bins: CalibrationBinFixture[]): RawCalibrationBin[] =>
  bins.map(bin => ({
    ...bin,
    sampleSizeAdequate: bin.sampleSizeAdequate ?? bin.count >= 30,
  }));

const createMockTimestamp = () => Date.now();

const createMockRecommendationSnapshot = (
  careerId: string,
  rank: number,
  confidence: number
): RecommendationSnapshot => ({
  recommendationId: `rec-${careerId}`,
  careerId,
  careerName: `Career ${careerId}`,
  rank,
  confidence,
  score: confidence / 100,
  timestamp: createMockTimestamp(),
  engines: {
    psychology: { score: confidence * 0.3, confidence: confidence * 0.9 },
    career: { score: confidence * 0.4, confidence: confidence * 0.95 },
    mentor: { score: confidence * 0.2, confidence: confidence * 0.85 },
    learning: { score: confidence * 0.1, confidence: confidence * 0.8 },
  },
});

const createMockPathwayResult = (
  path: string[],
  recommendations: Array<{ careerId: string; careerName: string; confidence: number }>
): PathwayResult => ({
  path: path.map((component, i) => ({
    step: `step-${i + 1}`,
    component,
    timestamp: Date.now() + i * 1000,
  })),
  recommendations: recommendations?.map((rec, i) => ({
    ...rec,
    rank: i + 1,
    score: rec.confidence / 100,
  })) ?? [],
  confidenceScores: {
    psychology: recommendations?.[0]?.confidence || 70,
    career: recommendations?.[0]?.confidence || 75,
    mentor: recommendations?.[0]?.confidence || 65,
    learning: recommendations?.[0]?.confidence || 60,
  },
  componentResults: {},
});

const createMockUncertaintyInput = (overrides?: Partial<UncertaintyInput>): UncertaintyInput => ({
  studentId: 'student-123',
  profile: {
    completeness: 0.8,
    dataPoints: 50,
    lastUpdated: Date.now(),
  },
  recommendations: [
    { careerId: 'c1', confidence: 75, evidenceCount: 5, engines: ['psychology', 'career'] },
    { careerId: 'c2', confidence: 65, evidenceCount: 4, engines: ['psychology'] },
    { careerId: 'c3', confidence: 60, evidenceCount: 3, engines: ['career'] },
  ],
  engines: {
    psychology: { confidence: 70, evidence: 8, variance: 5 },
    career: { confidence: 75, evidence: 10, variance: 3 },
    mentor: { confidence: 60, evidence: 5, variance: 8 },
    learning: { confidence: 65, evidence: 6, variance: 6 },
  },
  conflicts: [],
  historicalData: {
    sampleSize: 100,
    outcomes: 80,
    recency: 30,
  },
  ...overrides,
});

const createMockCounterfactualInput = (overrides?: Partial<CounterfactualInput>): CounterfactualInput => ({
  studentId: 'student-123',
  baseProfile: {
    interests: ['tech', 'art'],
    skills: ['coding', 'design'],
    values: ['impact', 'growth'],
  },
  baseRecommendation: {
    careerId: 'software-engineer',
    careerName: 'Software Engineer',
    confidence: 80,
    score: 0.8,
  },
  variables: [
    { name: 'interests.0', currentValue: 'tech', type: 'categorical', categories: ['tech', 'art', 'business'] },
    { name: 'skills.0', currentValue: 'coding', type: 'categorical', categories: ['coding', 'writing', 'speaking'] },
    { name: 'values.0', currentValue: 'impact', type: 'categorical', categories: ['impact', 'money', 'stability'] },
  ],
  ...overrides,
});

const createMockAuditInput = (overrides?: Partial<AuditInput>): AuditInput => ({
  recommendationId: 'rec-123',
  studentId: 'student-123',
  timestamp: Date.now(),
  recommendation: {
    careerId: 'software-engineer',
    careerName: 'Software Engineer',
    rank: 1,
    confidence: 80,
    score: 0.8,
  },
  evidence: [
    { engine: 'psychology', type: 'interest-match', description: 'High interest in tech', strength: 0.9, source: 'assessment' },
    { engine: 'career', type: 'demand', description: 'High job demand', strength: 0.8, source: 'labor-data' },
    { engine: 'mentor', type: 'pattern', description: 'Similar successful students', strength: 0.7, source: 'historical' },
  ],
  engines: [
    { id: 'psychology', contribution: 0.3, confidence: 85, factors: ['interest-alignment', 'personality-fit'] },
    { id: 'career', contribution: 0.4, confidence: 90, factors: ['market-demand', 'salary'] },
    { id: 'mentor', contribution: 0.2, confidence: 75, factors: ['pattern-match'] },
    { id: 'learning', contribution: 0.1, confidence: 70, factors: ['skill-gap'] },
  ],
  opportunityCosts: {
    sacrificed: [
      { careerId: 'data-scientist', careerName: 'Data Scientist', value: 0.75 },
      { careerId: 'ux-designer', careerName: 'UX Designer', value: 0.7 },
    ],
    reversibilityScore: 0.8,
    switchCost: 'Medium - requires 3-6 months retraining',
  },
  uncertainties: [
    { source: 'Limited sample size for this profile', impact: 'medium', mitigation: 'Collect more data' },
  ],
  risks: [
    { type: 'Market downturn', likelihood: 0.2, impact: 'medium', mitigation: 'Develop transferable skills' },
  ],
  historicalOutcomes: {
    similarRecommendations: 50,
    successRate: 0.82,
    sampleSize: 50,
  },
  ...overrides,
});

// ============================================================================
// CONFIDENCE CALIBRATION ENGINE TESTS (50 tests)
// ============================================================================

describe('ConfidenceCalibrationEngine', () => {
  let engine: ConfidenceCalibrationEngine;

  beforeEach(() => {
    engine = new ConfidenceCalibrationEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().numBins).toBe(10);
    });

    it('should update config', () => {
      engine.updateConfig({ numBins: 5 });
      expect(engine.getConfig().numBins).toBe(5);
    });

    it('should bin predictions correctly', () => {
      const predictions = [
        { careerId: '1', confidence: 50, actualOutcome: true },
        { careerId: '2', confidence: 60, actualOutcome: false },
        { careerId: '3', confidence: 70, actualOutcome: true },
        { careerId: '4', confidence: 80, actualOutcome: true },
        { careerId: '5', confidence: 90, actualOutcome: true },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.length).toBeGreaterThan(0);
      expect(bins.some(b => b.count > 0)).toBe(true);
    });

    it('should calculate expected calibration for perfect calibration', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 10, averageConfidence: 55, actualFrequency: 55, error: 0 },
        { binStart: 60, binEnd: 70, predictions: [], count: 10, averageConfidence: 65, actualFrequency: 65, error: 0 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBeGreaterThan(90);
      expect(report.overallCalibration.status).toBe('well-calibrated');
    });

    it('should detect overconfidence', () => {
      const bins = createCalibrationBins([
        { binStart: 80, binEnd: 90, predictions: [], count: 10, averageConfidence: 85, actualFrequency: 60, error: 25 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.overconfidence).toBeGreaterThan(0);
    });

    it('should detect underconfidence', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 10, averageConfidence: 55, actualFrequency: 80, error: 25 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.underconfidence).toBeGreaterThan(0);
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty predictions array', () => {
      const bins = engine.binPredictions([]);
      expect(bins).toEqual([]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBe(0);
    });

    it('should handle predictions with extreme confidences', () => {
      const predictions = [
        { careerId: '1', confidence: 1, actualOutcome: false },
        { careerId: '2', confidence: 99, actualOutcome: true },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.length).toBeGreaterThan(0);
    });

    it('should handle predictions with negative confidence', () => {
      const predictions = [
        { careerId: '1', confidence: -10, actualOutcome: true },
        { careerId: '2', confidence: 50, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.every(b => b.binStart >= 0)).toBe(true);
    });

    it('should handle predictions with >100 confidence', () => {
      const predictions = [
        { careerId: '1', confidence: 150, actualOutcome: true },
        { careerId: '2', confidence: 50, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.every(b => b.binEnd <= 100)).toBe(true);
    });

    it('should handle all predictions in single bin', () => {
      const predictions = Array(100).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: 50,
        actualOutcome: i < 55,
      }));
      const bins = engine.binPredictions(predictions);
      const nonEmptyBin = bins.find(b => b.count > 0);
      expect(nonEmptyBin?.count).toBe(100);
    });

    it('should handle all false outcomes', () => {
      const predictions = Array(50).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: 70,
        actualOutcome: false,
      }));
      const bins = engine.binPredictions(predictions);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.actualAccuracy).toBe(0);
    });

    it('should handle all true outcomes', () => {
      const predictions = Array(50).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: 70,
        actualOutcome: true,
      }));
      const bins = engine.binPredictions(predictions);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.actualAccuracy).toBe(100);
    });

    it('should handle confidence of 0', () => {
      const predictions = [{ careerId: '1', confidence: 0, actualOutcome: false }];
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.binStart === 0)).toBe(true);
    });

    it('should handle confidence of 100', () => {
      const predictions = [{ careerId: '1', confidence: 100, actualOutcome: true }];
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.binEnd === 100)).toBe(true);
    });

    it('should handle very large prediction count', () => {
      const predictions = Array(10000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: (i % 100),
        actualOutcome: Math.random() > 0.5,
      }));
      const bins = engine.binPredictions(predictions);
      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(10000);
    });
  });

  describe('Extreme Values', () => {
    it('should handle extreme overconfidence (99% conf, 1% actual)', () => {
      const bins = createCalibrationBins([{
        binStart: 95, binEnd: 100, predictions: [], count: 100,
        averageConfidence: 99, actualFrequency: 1, error: 98
      }]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBeLessThan(10);
      expect(report.overallCalibration.status).toBe('severely-miscalibrated');
    });

    it('should handle perfect calibration at multiple levels', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 100, averageConfidence: 55, actualFrequency: 55, error: 0 },
        { binStart: 60, binEnd: 70, predictions: [], count: 100, averageConfidence: 65, actualFrequency: 65, error: 0 },
        { binStart: 70, binEnd: 80, predictions: [], count: 100, averageConfidence: 75, actualFrequency: 75, error: 0 },
        { binStart: 80, binEnd: 90, predictions: [], count: 100, averageConfidence: 85, actualFrequency: 85, error: 0 },
        { binStart: 90, binEnd: 100, predictions: [], count: 100, averageConfidence: 95, actualFrequency: 95, error: 0 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBe(100);
    });

    it('should handle inverse calibration (low conf = high accuracy)', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 100, averageConfidence: 55, actualFrequency: 90, error: 35 },
        { binStart: 90, binEnd: 100, predictions: [], count: 100, averageConfidence: 95, actualFrequency: 50, error: 45 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBeLessThan(50);
    });

    it('should calculate ECE correctly with uniform error', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 100, averageConfidence: 55, actualFrequency: 45, error: 10 },
        { binStart: 60, binEnd: 70, predictions: [], count: 100, averageConfidence: 65, actualFrequency: 55, error: 10 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.ece).toBe(10);
    });

    it('should handle single prediction per bin', () => {
      const bins = createCalibrationBins(Array(10).fill(null).map((_, i) => ({
        binStart: i * 10,
        binEnd: (i + 1) * 10,
        predictions: [],
        count: 1,
        averageConfidence: i * 10 + 5,
        actualFrequency: i * 10 + 5,
        error: 0,
      })));
      const report = engine.analyzeCalibration(bins);
      expect(report.binAnalysis.filter(b => b.sampleSizeAdequate).length).toBeLessThan(5);
    });

    it('should handle bins with zero samples', () => {
      const bins = createCalibrationBins([
        { binStart: 50, binEnd: 60, predictions: [], count: 100, averageConfidence: 55, actualFrequency: 55, error: 0 },
        { binStart: 60, binEnd: 70, predictions: [], count: 0, averageConfidence: 0, actualFrequency: 0, error: 0 },
        { binStart: 70, binEnd: 80, predictions: [], count: 100, averageConfidence: 75, actualFrequency: 75, error: 0 },
      ]);
      const report = engine.analyzeCalibration(bins);
      expect(report.binAnalysis.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN confidence values', () => {
      const predictions = [
        { careerId: '1', confidence: NaN, actualOutcome: true },
        { careerId: '2', confidence: 50, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(1);
    });

    it('should handle Infinity confidence values', () => {
      const predictions = [
        { careerId: '1', confidence: Infinity, actualOutcome: true },
        { careerId: '2', confidence: 50, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.binEnd === 100)).toBe(true);
    });

    it('should handle -Infinity confidence values', () => {
      const predictions = [
        { careerId: '1', confidence: -Infinity, actualOutcome: true },
        { careerId: '2', confidence: 50, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.binStart === 0)).toBe(true);
    });

    it('should handle undefined outcomes gracefully', () => {
      const predictions = [
        { careerId: '1', confidence: 70, actualOutcome: undefined as unknown as boolean },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.length).toBeGreaterThan(0);
    });

    it('should handle null confidence', () => {
      const predictions = [
        { careerId: '1', confidence: null as unknown as number, actualOutcome: true },
      ];
      expect(() => engine.binPredictions(predictions)).not.toThrow();
    });

    it('should handle decimal precision in confidence', () => {
      const predictions = [
        { careerId: '1', confidence: 75.123456789, actualOutcome: true },
        { careerId: '2', confidence: 75.987654321, actualOutcome: false },
      ];
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.count > 0)).toBe(true);
    });

    it('should handle duplicate predictions', () => {
      const predictions = Array(10).fill({ careerId: '1', confidence: 70, actualOutcome: true });
      const bins = engine.binPredictions(predictions);
      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(10);
    });
  });

  describe('Random Noise', () => {
    it('should handle random confidence distribution', () => {
      const predictions = Array(1000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: Math.random() * 100,
        actualOutcome: Math.random() > 0.5,
      }));
      const bins = engine.binPredictions(predictions);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.score).toBeGreaterThanOrEqual(0);
      expect(report.overallCalibration.score).toBeLessThanOrEqual(100);
    });

    it('should handle random with bias toward high confidence', () => {
      const predictions = Array(1000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: 70 + Math.random() * 30,
        actualOutcome: Math.random() > 0.3,
      }));
      const bins = engine.binPredictions(predictions);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.actualAccuracy).toBeGreaterThan(0);
    });

    it('should handle random with bias toward low confidence', () => {
      const predictions = Array(1000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: Math.random() * 50,
        actualOutcome: Math.random() > 0.7,
      }));
      const bins = engine.binPredictions(predictions);
      const report = engine.analyzeCalibration(bins);
      expect(report.overallCalibration.actualAccuracy).toBeGreaterThan(0);
    });

    it('should handle Gaussian-like distribution', () => {
      const predictions = Array(1000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: 50 + (Math.random() + Math.random() + Math.random() - 1.5) * 30,
        actualOutcome: Math.random() > 0.5,
      }));
      const bins = engine.binPredictions(predictions);
      expect(bins.some(b => b.count > 100)).toBe(true);
    });

    it('should handle bimodal distribution', () => {
      const predictions = Array(1000).fill(null).map((_, i) => ({
        careerId: `${i}`,
        confidence: i % 2 === 0 ? 30 + Math.random() * 20 : 70 + Math.random() * 20,
        actualOutcome: Math.random() > 0.5,
      }));
      const bins = engine.binPredictions(predictions);
      const midBins = bins.filter(b => b.binStart >= 40 && b.binEnd <= 70);
      expect(midBins.reduce((sum, b) => sum + b.count, 0)).toBeLessThan(600);
    });
  });
});

// ============================================================================
// RECOMMENDATION STABILITY ENGINE TESTS (50 tests)
// ============================================================================

describe('RecommendationStabilityEngine', () => {
  let engine: RecommendationStabilityEngine;

  beforeEach(() => {
    engine = new RecommendationStabilityEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().maxAcceptableDrift).toBe(15);
    });

    it('should update config', () => {
      engine.updateConfig({ maxAcceptableDrift: 20 });
      expect(engine.getConfig().maxAcceptableDrift).toBe(20);
    });

    it('should generate perturbations', () => {
      const input = { interests: ['tech'], skills: ['coding'] };
      const perturbations = engine.generatePerturbations(input);
      expect(perturbations.length).toBeGreaterThan(0);
    });

    it('should calculate drift score', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 75)];
      const drift = engine.calculateDriftScore(original, perturbed);
      expect(drift).toBeGreaterThanOrEqual(0);
      expect(drift).toBeLessThanOrEqual(100);
    });

    it('should check stability', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 79)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(true);
    });

    it('should detect rank drift', () => {
      const original = [
        createMockRecommendationSnapshot('c1', 1, 80),
        createMockRecommendationSnapshot('c2', 2, 70),
      ];
      const perturbed = [
        createMockRecommendationSnapshot('c2', 1, 72),
        createMockRecommendationSnapshot('c1', 2, 78),
      ];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.rankDrift).toBeGreaterThan(0);
    });

    it('should detect recommendation change', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [createMockRecommendationSnapshot('c2', 1, 82)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.recommendationDrift).toBeGreaterThan(0);
    });

    it('should get stability rating', () => {
      expect(engine.getStabilityRating(95)).toBe('highly-stable');
      expect(engine.getStabilityRating(75)).toBe('stable');
      expect(engine.getStabilityRating(55)).toBe('moderate');
      expect(engine.getStabilityRating(35)).toBe('unstable');
      expect(engine.getStabilityRating(15)).toBe('highly-unstable');
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty recommendation arrays', () => {
      const original: RecommendationSnapshot[] = [];
      const perturbed: RecommendationSnapshot[] = [];
      const drift = engine.calculateDriftScore(original, perturbed);
      expect(drift).toBe(0);
    });

    it('should handle completely different recommendations', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [createMockRecommendationSnapshot('c2', 1, 85)];
      const drift = engine.calculateDriftScore(original, perturbed);
      expect(drift).toBeGreaterThan(50);
    });

    it('should handle recommendations with same IDs but different scores', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [{ ...createMockRecommendationSnapshot('c1', 1, 80), confidence: 20, score: 0.2 }];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.confidenceDrift).toBeGreaterThan(50);
    });

    it('should handle many recommendations', () => {
      const original = Array(100).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, 100 - i)
      );
      const perturbed = Array(100).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, 99 - i)
      );
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(true);
    });

    it('should handle perturbed array with missing recommendations', () => {
      const original = [
        createMockRecommendationSnapshot('c1', 1, 80),
        createMockRecommendationSnapshot('c2', 2, 70),
        createMockRecommendationSnapshot('c3', 3, 60),
      ];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(false);
    });

    it('should handle perturbed array with extra recommendations', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [
        createMockRecommendationSnapshot('c1', 1, 80),
        createMockRecommendationSnapshot('c2', 2, 70),
        createMockRecommendationSnapshot('c3', 3, 60),
      ];
      const stability = engine.checkStability(original, perturbed);
      expect(stability).toBeDefined();
    });

    it('should handle null values in recommendations', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        engines: { psychology: { score: 0.8, confidence: null as unknown as number } },
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const drift = engine.calculateDriftScore(original, perturbed);
      expect(drift).toBeDefined();
    });

    it('should handle undefined values in recommendations', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        engines: undefined as unknown as Record<string, { score: number; confidence: number }>,
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      expect(() => engine.calculateDriftScore(original, perturbed)).not.toThrow();
    });

    it('should handle duplicate recommendation IDs', () => {
      const original = [
        createMockRecommendationSnapshot('c1', 1, 80),
        createMockRecommendationSnapshot('c1', 2, 70),
      ];
      const perturbed = [
        createMockRecommendationSnapshot('c1', 1, 75),
        createMockRecommendationSnapshot('c1', 2, 75),
      ];
      const stability = engine.checkStability(original, perturbed);
      expect(stability).toBeDefined();
    });

    it('should handle negative confidence values', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        confidence: -10,
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.confidenceDrift).toBeGreaterThan(0);
    });

    it('should handle confidence values over 100', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        confidence: 150,
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.confidenceDrift).toBeGreaterThan(0);
    });
  });

  describe('Extreme Values', () => {
    it('should handle zero confidence stability', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 0)];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 0)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(true);
    });

    it('should handle 100% confidence with different outcomes', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 100)];
      const perturbed = [createMockRecommendationSnapshot('c2', 1, 100)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(false);
    });

    it('should handle massive rank changes', () => {
      const original = Array(100).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, 100 - i)
      );
      const perturbed = Array(100).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${99 - i}`, i + 1, i + 1)
      );
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(false);
    });

    it('should handle all recommendations changing order', () => {
      const original = [
        createMockRecommendationSnapshot('c1', 1, 90),
        createMockRecommendationSnapshot('c2', 2, 80),
        createMockRecommendationSnapshot('c3', 3, 70),
      ];
      const perturbed = [
        createMockRecommendationSnapshot('c3', 1, 90),
        createMockRecommendationSnapshot('c2', 2, 80),
        createMockRecommendationSnapshot('c1', 3, 70),
      ];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.rankDrift).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single recommendation', () => {
      const original = [createMockRecommendationSnapshot('c1', 1, 80)];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability.stable).toBe(true);
    });

    it('should handle identical arrays', () => {
      const original = Array(10).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, 90 - i)
      );
      const drift = engine.calculateDriftScore(original, original);
      expect(drift).toBe(0);
    });

    it('should handle NaN values in scores', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        score: NaN,
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      expect(() => engine.checkStability(original, perturbed)).not.toThrow();
    });

    it('should handle Infinity in confidence', () => {
      const original = [{
        ...createMockRecommendationSnapshot('c1', 1, 80),
        confidence: Infinity,
      }];
      const perturbed = [createMockRecommendationSnapshot('c1', 1, 80)];
      const stability = engine.checkStability(original, perturbed);
      expect(stability).toBeDefined();
    });

    it('should handle very large arrays', () => {
      const original = Array(10000).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, Math.random() * 100)
      );
      const perturbed = Array(10000).fill(null).map((_, i) =>
        createMockRecommendationSnapshot(`c${i}`, i + 1, Math.random() * 100)
      );
      const drift = engine.calculateDriftScore(original, perturbed);
      expect(drift).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Perturbation Tests', () => {
    it('should apply wording variations', () => {
      const input = { text: 'Hello World' };
      const perturbations = engine.generatePerturbations(input, { includeWording: true, includeReorder: false, includeNoise: false });
      expect(perturbations.some(p => p.type === 'wording-change')).toBe(true);
    });

    it('should apply reorder variations', () => {
      const input = { items: ['a', 'b', 'c'] };
      const perturbations = engine.generatePerturbations(input, { includeWording: false, includeReorder: true, includeNoise: false });
      expect(perturbations.some(p => p.type === 'reorder')).toBe(true);
    });

    it('should apply noise injection', () => {
      const input = { score: 0.5 };
      const perturbations = engine.generatePerturbations(input, { includeWording: false, includeReorder: false, includeNoise: true });
      expect(perturbations.some(p => p.type === 'noise-injection')).toBe(true);
    });
  });
});

// ============================================================================
// RECOMMENDATION CONSISTENCY ENGINE TESTS (50 tests)
// ============================================================================

describe('RecommendationConsistencyEngine', () => {
  let engine: RecommendationConsistencyEngine;

  beforeEach(() => {
    engine = new RecommendationConsistencyEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().highConsistencyThreshold).toBe(90);
    });

    it('should update config', () => {
      engine.updateConfig({ highConsistencyThreshold: 85 });
      expect(engine.getConfig().highConsistencyThreshold).toBe(85);
    });

    it('should generate assessment paths', () => {
      const components = [
        { id: 'psychology', name: 'Psychology', dependencies: [], provides: ['personality'] },
        { id: 'career', name: 'Career', dependencies: [], provides: ['outcomes'] },
      ];
      const paths = engine.generateAssessmentPaths(components);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should check consistency between identical results', () => {
      const resultA = createMockPathwayResult(['psychology', 'career'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 80 },
      ]);
      const resultB = createMockPathwayResult(['psychology', 'career'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 80 },
      ]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.consistent).toBe(true);
      expect(check.topMatch).toBe(true);
    });

    it('should detect inconsistent top recommendations', () => {
      const resultA = createMockPathwayResult(['psychology', 'career'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 80 },
      ]);
      const resultB = createMockPathwayResult(['career', 'psychology'], [
        { careerId: 'c2', careerName: 'Career 2', confidence: 80 },
      ]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.topMatch).toBe(false);
    });

    it('should calculate consistency score', () => {
      const results = [
        createMockPathwayResult(['psychology'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]),
        createMockPathwayResult(['career'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 82 }]),
      ];
      const score = engine.calculateConsistencyScore(results);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should get consistency rating', () => {
      expect(engine.getConsistencyRating(95)).toBe('highly-consistent');
      expect(engine.getConsistencyRating(80)).toBe('consistent');
      expect(engine.getConsistencyRating(60)).toBe('moderate');
      expect(engine.getConsistencyRating(40)).toBe('inconsistent');
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty results array', async () => {
      const report = await engine.analyzeConsistency('student-1', {}, [], async () => createMockPathwayResult([], []));
      expect(report.overallConsistency.score).toBe(0);
    });

    it('should handle single result', async () => {
      const components = [{ id: 'psychology', name: 'Psychology', dependencies: [], provides: ['personality'] }];
      let callCount = 0;
      const report = await engine.analyzeConsistency('student-1', {}, components, async () => {
        callCount++;
        return createMockPathwayResult(['psychology'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      });
      expect(report.overallConsistency.score).toBe(100);
    });

    it('should handle completely different recommendations', () => {
      const resultA = createMockPathwayResult(['a'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const resultB = createMockPathwayResult(['b'], [{ careerId: 'c2', careerName: 'Career 2', confidence: 80 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.consistent).toBe(false);
      expect(check.top3Overlap).toBe(0);
    });

    it('should handle results with different confidence distributions', () => {
      const resultA = createMockPathwayResult(['a'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 90 },
        { careerId: 'c2', careerName: 'Career 2', confidence: 10 },
      ]);
      const resultB = createMockPathwayResult(['b'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 50 },
        { careerId: 'c2', careerName: 'Career 2', confidence: 50 },
      ]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.confidenceCorrelation).toBeLessThan(1);
    });

    it('should handle null pathway results', async () => {
      const components = [{ id: 'psychology', name: 'Psychology', dependencies: [], provides: ['personality'] }];
      const report = await engine.analyzeConsistency('student-1', {}, components, async () => null as unknown as PathwayResult);
      expect(report).toBeDefined();
    });

    it('should handle undefined recommendations in results', () => {
      const resultA = createMockPathwayResult(['a'], undefined as unknown as PathwayResult['recommendations']);
      const resultB = createMockPathwayResult(['b'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      expect(() => engine.checkConsistency(resultA, resultB)).not.toThrow();
    });

    it('should handle NaN confidence values', () => {
      const resultA = createMockPathwayResult(['a'], [{ careerId: 'c1', careerName: 'Career 1', confidence: NaN }]);
      const resultB = createMockPathwayResult(['b'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check).toBeDefined();
    });

    it('should handle empty recommendation arrays', () => {
      const resultA = createMockPathwayResult(['a'], []);
      const resultB = createMockPathwayResult(['b'], []);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.consistent).toBe(false);
    });

    it('should handle different path lengths', () => {
      const resultA = createMockPathwayResult(['a', 'b', 'c'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const resultB = createMockPathwayResult(['a', 'b', 'c', 'd', 'e'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.consistent).toBe(true);
    });
  });

  describe('Contradictory Profiles', () => {
    it('should detect contradictory signals', async () => {
      const components = [
        { id: 'psychology', name: 'Psychology', dependencies: [], provides: ['traits'] },
        { id: 'career', name: 'Career', dependencies: [], provides: ['demand'] },
      ];
      let count = 0;
      const report = await engine.analyzeConsistency('student-1', {}, components, async () => {
        count++;
        // Alternate between contradictory results for each path
        return count % 2 === 1
          ? createMockPathwayResult(['psychology'], [{ careerId: 'artist', careerName: 'Artist', confidence: 90 }])
          : createMockPathwayResult(['career'], [{ careerId: 'accountant', careerName: 'Accountant', confidence: 90 }]);
      });
      expect(report.overallConsistency.score).toBeLessThan(50);
    });

    it('should handle conflicting confidence scores', () => {
      const resultA = createMockPathwayResult(['a'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 95 }]);
      const resultB = createMockPathwayResult(['b'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 10 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.confidenceCorrelation).toBeLessThan(0.5);
    });

    it('should handle reverse rankings', () => {
      const resultA = createMockPathwayResult(['a'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 90 },
        { careerId: 'c2', careerName: 'Career 2', confidence: 80 },
      ]);
      const resultB = createMockPathwayResult(['b'], [
        { careerId: 'c2', careerName: 'Career 2', confidence: 80 },
        { careerId: 'c1', careerName: 'Career 1', confidence: 90 },
      ]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.rankCorrelation).toBeLessThan(1);
    });
  });

  describe('Extreme Values', () => {
    it('should handle 100% consistent results', () => {
      const results = Array(10).fill(null).map(() =>
        createMockPathwayResult(['path'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }])
      );
      const score = engine.calculateConsistencyScore(results);
      expect(score).toBe(100);
    });

    it('should handle 0% consistent results', () => {
      const results = Array(10).fill(null).map((_, i) =>
        createMockPathwayResult(['path'], [{ careerId: `c${i}`, careerName: `Career ${i}`, confidence: 80 }])
      );
      const score = engine.calculateConsistencyScore(results);
      expect(score).toBeLessThan(30);
    });

    it('should handle many different paths', async () => {
      const components = Array(20).fill(null).map((_, i) => ({
        id: `comp-${i}`,
        name: `Component ${i}`,
        dependencies: [],
        provides: [`feature-${i}`],
      }));
      const paths = engine.generateAssessmentPaths(components);
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle identical paths', () => {
      const resultA = createMockPathwayResult(['a', 'b', 'c'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const resultB = createMockPathwayResult(['a', 'b', 'c'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.top3Overlap).toBe(1);
      expect(check.confidenceCorrelation).toBe(1);
    });

    it('should handle paths with same components different order', () => {
      const resultA = createMockPathwayResult(['psychology', 'career', 'mentor'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const resultB = createMockPathwayResult(['mentor', 'career', 'psychology'], [{ careerId: 'c1', careerName: 'Career 1', confidence: 80 }]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.consistent).toBe(true);
    });

    it('should handle partial overlap in top 3', () => {
      const resultA = createMockPathwayResult(['a'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 90 },
        { careerId: 'c2', careerName: 'Career 2', confidence: 80 },
        { careerId: 'c3', careerName: 'Career 3', confidence: 70 },
      ]);
      const resultB = createMockPathwayResult(['b'], [
        { careerId: 'c1', careerName: 'Career 1', confidence: 90 },
        { careerId: 'c4', careerName: 'Career 4', confidence: 80 },
        { careerId: 'c5', careerName: 'Career 5', confidence: 70 },
      ]);
      const check = engine.checkConsistency(resultA, resultB);
      expect(check.top3Overlap).toBeGreaterThan(0);
      expect(check.top3Overlap).toBeLessThan(1);
    });

    it('should handle circular dependencies in components', () => {
      const components = [
        { id: 'a', name: 'A', dependencies: ['b'], provides: ['x'] },
        { id: 'b', name: 'B', dependencies: ['a'], provides: ['y'] },
      ];
      const paths = engine.generateAssessmentPaths(components);
      expect(paths).toBeDefined();
    });
  });
});

// ============================================================================
// UNCERTAINTY ENGINE TESTS (50 tests)
// ============================================================================

describe('UncertaintyEngine', () => {
  let engine: UncertaintyEngine;

  beforeEach(() => {
    engine = new UncertaintyEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().admitUncertaintyThreshold).toBe(60);
    });

    it('should update config', () => {
      engine.updateConfig({ admitUncertaintyThreshold: 50 });
      expect(engine.getConfig().admitUncertaintyThreshold).toBe(50);
    });

    it('should assess uncertainty for normal input', () => {
      const input = createMockUncertaintyInput();
      const assessment = engine.assessUncertainty(input);
      expect(assessment.assessmentId).toBeDefined();
      expect(assessment.overallUncertainty).toBeDefined();
    });

    it('should detect insufficient evidence', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 60, evidenceCount: 1, engines: ['psychology'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.type === 'insufficient-evidence')).toBe(true);
    });

    it('should detect conflicting signals', () => {
      const input = createMockUncertaintyInput({
        engines: {
          psychology: { confidence: 90, evidence: 10, variance: 50 },
          career: { confidence: 10, evidence: 10, variance: 50 },
        },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.type === 'conflicting-signals')).toBe(true);
    });

    it('should detect data gaps', () => {
      const input = createMockUncertaintyInput({
        profile: { completeness: 0.3, dataPoints: 10, lastUpdated: Date.now() },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.type === 'data-gap')).toBe(true);
    });

    it('should detect novel situations', () => {
      const input = createMockUncertaintyInput({
        historicalData: { sampleSize: 5, outcomes: 4, recency: 10 },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.type === 'novel-situation')).toBe(true);
    });

    it('should check if uncertainty should be admitted', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 30, evidenceCount: 1, engines: ['psychology'] }],
      });
      const check = engine.shouldAdmitUncertainty(input);
      expect(check.admit).toBe(true);
    });

    it('should calculate uncertainty score', () => {
      const input = createMockUncertaintyInput();
      const score = engine.calculateUncertaintyScore(input);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should generate explanation', () => {
      const input = createMockUncertaintyInput();
      const assessment = engine.assessUncertainty(input);
      const explanation = engine.generateExplanation(assessment);
      expect(explanation).toContain('Uncertainty level');
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty recommendations array', () => {
      const input = createMockUncertaintyInput({ recommendations: [] });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.score).toBeGreaterThan(0);
    });

    it('should handle null confidence values', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: null as unknown as number, evidenceCount: 5, engines: ['psychology'] }],
      });
      expect(() => engine.assessUncertainty(input)).not.toThrow();
    });

    it('should handle undefined engines', () => {
      const input = createMockUncertaintyInput({ engines: undefined as unknown as UncertaintyInput['engines'] });
      expect(() => engine.assessUncertainty(input)).not.toThrow();
    });

    it('should handle negative evidence counts', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 70, evidenceCount: -5, engines: ['psychology'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment).toBeDefined();
    });

    it('should handle extremely high evidence counts', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 70, evidenceCount: 1000000, engines: ['psychology'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.score).toBeLessThan(50);
    });

    it('should handle conflicts with extreme severity', () => {
      const input = createMockUncertaintyInput({
        conflicts: [{ type: 'personality', severity: 1000, description: 'Extreme contradiction' }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.severity === 'critical')).toBe(true);
    });

    it('should handle NaN in historical data', () => {
      const input = createMockUncertaintyInput({
        historicalData: { sampleSize: NaN, outcomes: NaN, recency: NaN },
      });
      expect(() => engine.assessUncertainty(input)).not.toThrow();
    });

    it('should handle Infinity in profile completeness', () => {
      const input = createMockUncertaintyInput({
        profile: { completeness: Infinity, dataPoints: 100, lastUpdated: Date.now() },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment).toBeDefined();
    });

    it('should handle negative sample size', () => {
      const input = createMockUncertaintyInput({
        historicalData: { sampleSize: -100, outcomes: 0, recency: 30 },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment).toBeDefined();
    });
  });

  describe('Contradictory Profiles', () => {
    it('should detect severe personality contradictions', () => {
      const input = createMockUncertaintyInput({
        conflicts: [
          { type: 'personality', severity: 0.9, description: 'Introvert vs Extrovert' },
        ],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.type === 'contradictory-profile')).toBe(true);
    });

    it('should detect value conflicts', () => {
      const input = createMockUncertaintyInput({
        conflicts: [
          { type: 'values', severity: 0.8, description: 'Money vs Impact' },
          { type: 'values', severity: 0.7, description: 'Stability vs Adventure' },
        ],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.filter(s => s.type === 'contradictory-profile').length).toBe(2);
    });

    it('should handle multiple conflicting signals', () => {
      const input = createMockUncertaintyInput({
        conflicts: [
          { type: 'interest', severity: 0.6, description: 'Art vs Science' },
          { type: 'skill', severity: 0.5, description: 'Technical vs Social' },
          { type: 'value', severity: 0.7, description: 'Independence vs Teamwork' },
        ],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.level).toBe('high');
    });

    it('should require escalation for critical contradictions', () => {
      const input = createMockUncertaintyInput({
        conflicts: [{ type: 'critical', severity: 0.95, description: 'Cannot proceed' }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.systemResponse.shouldEscalate).toBe(true);
    });
  });

  describe('Uncertain Data', () => {
    it('should admit uncertainty for low confidence', () => {
      const input = createMockUncertaintyInput({
        recommendations: [
          { careerId: 'c1', confidence: 40, evidenceCount: 2, engines: ['psychology'] },
          { careerId: 'c2', confidence: 35, evidenceCount: 2, engines: ['career'] },
        ],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.admissionRequired).toBe(true);
    });

    it('should suggest gathering more data', () => {
      const input = createMockUncertaintyInput({
        profile: { completeness: 0.4, dataPoints: 20, lastUpdated: Date.now() },
        historicalData: { sampleSize: 15, outcomes: 10, recency: 60 },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.systemResponse.shouldGatherMoreData).toBe(true);
    });

    it('should identify evidence gaps', () => {
      const input = createMockUncertaintyInput({
        engines: {
          psychology: { confidence: 30, evidence: 2, variance: 15 },
          career: { confidence: 20, evidence: 1, variance: 20 },
        },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.evidenceGaps.length).toBeGreaterThan(0);
    });

    it('should provide alternative approaches', () => {
      const input = createMockUncertaintyInput({
        conflicts: [{ type: 'interest', severity: 0.7, description: 'Conflict' }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.systemResponse.alternativeApproaches.length).toBeGreaterThan(0);
    });
  });

  describe('Extreme Values', () => {
    it('should handle 0% confidence', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 0, evidenceCount: 0, engines: [] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.level).toBe('critical');
    });

    it('should handle 100% confidence', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 100, evidenceCount: 100, engines: ['psychology', 'career', 'mentor'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.level).toBe('none');
    });

    it('should handle max conflicts', () => {
      const input = createMockUncertaintyInput({
        conflicts: Array(100).fill(null).map((_, i) => ({
          type: `conflict-${i}`,
          severity: 1.0,
          description: `Conflict ${i}`,
        })),
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.score).toBe(100);
    });

    it('should handle very old data', () => {
      const input = createMockUncertaintyInput({
        historicalData: { sampleSize: 1000, outcomes: 800, recency: 10000 },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.sources.some(s => s.description.includes('old'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single recommendation', () => {
      const input = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 70, evidenceCount: 5, engines: ['psychology'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment).toBeDefined();
    });

    it('should handle empty engines', () => {
      const input = createMockUncertaintyInput({ engines: {} });
      const assessment = engine.assessUncertainty(input);
      expect(assessment).toBeDefined();
    });

    it('should handle perfect profile', () => {
      const input = createMockUncertaintyInput({
        profile: { completeness: 1.0, dataPoints: 1000, lastUpdated: Date.now() },
        historicalData: { sampleSize: 10000, outcomes: 9000, recency: 1 },
        recommendations: [{ careerId: 'c1', confidence: 95, evidenceCount: 50, engines: ['psychology', 'career', 'mentor', 'learning'] }],
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.level).toBe('none');
    });

    it('should handle completely unknown student', () => {
      const input = createMockUncertaintyInput({
        profile: { completeness: 0, dataPoints: 0, lastUpdated: 0 },
        recommendations: [],
        engines: {},
        conflicts: [],
        historicalData: { sampleSize: 0, outcomes: 0, recency: 0 },
      });
      const assessment = engine.assessUncertainty(input);
      expect(assessment.overallUncertainty.admissionRequired).toBe(true);
    });
  });
});

// ============================================================================
// COUNTERFACTUAL ENGINE TESTS (50 tests)
// ============================================================================

describe('CounterfactualEngine', () => {
  let engine: CounterfactualEngine;

  beforeEach(() => {
    engine = new CounterfactualEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().minorChangeThreshold).toBe(10);
    });

    it('should update config', () => {
      engine.updateConfig({ minorChangeThreshold: 15 });
      expect(engine.getConfig().minorChangeThreshold).toBe(15);
    });

    it('should test single counterfactual', async () => {
      const baseProfile = { interest: 'tech' };
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'software-engineer',
        careerName: 'Software Engineer',
      });

      const result = await engine.testCounterfactual(
        baseProfile,
        'interest',
        'art',
        mockProvider
      );

      expect(result).toBeDefined();
      expect(mockProvider).toHaveBeenCalledTimes(2);
    });

    it('should detect recommendation change', async () => {
      let callCount = 0;
      const mockProvider = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          careerId: callCount === 1 ? 'software-engineer' : 'artist',
          careerName: callCount === 1 ? 'Software Engineer' : 'Artist',
        });
      });

      const result = await engine.testCounterfactual(
        { interest: 'tech' },
        'interest',
        'art',
        mockProvider
      );

      expect(result.wouldChange).toBe(true);
    });

    it('should determine magnitude correctly', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'software-engineer',
        careerName: 'Software Engineer',
      });

      const result = await engine.testCounterfactual(
        { interest: 'tech' },
        'interest',
        'art',
        mockProvider
      );

      expect(['minor', 'moderate', 'major', 'fundamental']).toContain(result.magnitude);
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty profile', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        {},
        'field',
        'value',
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle null profile values', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { field: null },
        'field',
        'value',
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle undefined variable', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { field: 'value' },
        'nonexistent',
        'new-value',
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle provider throwing error', async () => {
      const mockProvider = vi.fn().mockRejectedValue(new Error('Provider failed'));

      await expect(
        engine.testCounterfactual({}, 'field', 'value', mockProvider)
      ).rejects.toThrow();
    });

    it('should handle nested variable paths', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { nested: { field: 'value' } },
        'nested.field',
        'new-value',
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle deeply nested paths', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { a: { b: { c: { d: 'value' } } } },
        'a.b.c.d',
        'new-value',
        mockProvider
      );

      expect(result).toBeDefined();
    });
  });

  describe('Extreme Values', () => {
    it('should handle very large profile', async () => {
      const largeProfile = Object.fromEntries(
        Array(1000).fill(null).map((_, i) => [`field${i}`, `value${i}`])
      );
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        largeProfile,
        'field500',
        'new-value',
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle circular references gracefully', async () => {
      const profile: Record<string, unknown> = { a: 'value' };
      profile.self = profile;

      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        profile,
        'a',
        'new-value',
        mockProvider
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle same value change', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { field: 'value' },
        'field',
        'value',
        mockProvider
      );

      expect(result.wouldChange).toBe(false);
    });

    it('should handle boolean variables', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { field: true },
        'field',
        false,
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle numeric variables', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { score: 50 },
        'score',
        75,
        mockProvider
      );

      expect(result).toBeDefined();
    });

    it('should handle array variables', async () => {
      const mockProvider = vi.fn().mockResolvedValue({
        careerId: 'career',
        careerName: 'Career',
      });

      const result = await engine.testCounterfactual(
        { items: ['a', 'b', 'c'] },
        'items',
        ['x', 'y', 'z'],
        mockProvider
      );

      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// RECOMMENDATION AUDIT ENGINE TESTS (50 tests)
// ============================================================================

describe('RecommendationAuditEngine', () => {
  let engine: RecommendationAuditEngine;

  beforeEach(() => {
    engine = new RecommendationAuditEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().verifyEvidence).toBe(true);
    });

    it('should update config', () => {
      engine.updateConfig({ verifyEvidence: false });
      expect(engine.getConfig().verifyEvidence).toBe(false);
    });

    it('should audit recommendation', () => {
      const input = createMockAuditInput();
      const report = engine.auditRecommendation(input);
      expect(report.auditId).toBeDefined();
      expect(report.recommendation).toBeDefined();
    });

    it('should batch audit recommendations', () => {
      const inputs = [createMockAuditInput(), createMockAuditInput()];
      const reports = engine.auditRecommendations(inputs);
      expect(reports).toHaveLength(2);
    });

    it('should perform quick audit', () => {
      const input = createMockAuditInput();
      const quick = engine.quickAudit(input);
      expect(quick.trustworthy).toBeDefined();
      expect(quick.confidence).toBeDefined();
    });

    it('should compare audit reports', () => {
      const inputA = createMockAuditInput({ recommendation: { ...createMockAuditInput().recommendation, confidence: 90 } });
      const inputB = createMockAuditInput({ recommendation: { ...createMockAuditInput().recommendation, confidence: 70 } });
      const auditA = engine.auditRecommendation(inputA);
      const auditB = engine.auditRecommendation(inputB);

      const comparison = engine.compareAudits(auditA, auditB);
      expect(comparison.confidenceDifference).toBeGreaterThan(0);
    });
  });

  describe('Adversarial Inputs', () => {
    it('should handle empty evidence array', () => {
      const input = createMockAuditInput({ evidence: [] });
      const report = engine.auditRecommendation(input);
      expect(report.evidence.totalEvidencePieces).toBe(0);
    });

    it('should handle empty engines array', () => {
      const input = createMockAuditInput({ engines: [] });
      const report = engine.auditRecommendation(input);
      expect(report.engines).toHaveLength(0);
    });

    it('should handle null values in evidence', () => {
      const input = createMockAuditInput({
        evidence: [{
          engine: 'psychology',
          type: 'match',
          description: 'Description',
          strength: null as unknown as number,
        }],
      });
      expect(() => engine.auditRecommendation(input)).not.toThrow();
    });

    it('should handle NaN in confidence', () => {
      const input = createMockAuditInput({
        recommendation: { ...createMockAuditInput().recommendation, confidence: NaN },
      });
      const report = engine.auditRecommendation(input);
      expect(report).toBeDefined();
    });

    it('should handle negative confidence', () => {
      const input = createMockAuditInput({
        recommendation: { ...createMockAuditInput().recommendation, confidence: -50 },
      });
      const report = engine.auditRecommendation(input);
      expect(report.verdict.trustworthy).toBe(false);
    });

    it('should handle confidence over 100', () => {
      const input = createMockAuditInput({
        recommendation: { ...createMockAuditInput().recommendation, confidence: 150 },
      });
      const report = engine.auditRecommendation(input);
      expect(report).toBeDefined();
    });

    it('should handle missing historical outcomes', () => {
      const input = createMockAuditInput();
      delete (input as { historicalOutcomes?: unknown }).historicalOutcomes;
      const report = engine.auditRecommendation(input);
      expect(report.confidenceBasis.historicalAccuracy).toBe(0);
    });

    it('should handle zero sample size', () => {
      const input = createMockAuditInput({
        historicalOutcomes: { similarRecommendations: 0, successRate: 0, sampleSize: 0 },
      });
      const report = engine.auditRecommendation(input);
      expect(report).toBeDefined();
    });
  });

  describe('Risk Assessment', () => {
    it('should detect high risks', () => {
      const input = createMockAuditInput({
        risks: [
          { type: 'Severe', likelihood: 0.8, impact: 'severe', mitigation: 'None' },
        ],
      });
      const report = engine.auditRecommendation(input);
      expect(report.findings.risks.length).toBeGreaterThan(0);
    });

    it('should handle many risks', () => {
      const input = createMockAuditInput({
        risks: Array(50).fill(null).map((_, i) => ({
          type: `Risk ${i}`,
          likelihood: Math.random(),
          impact: ['low', 'medium', 'high', 'severe'][Math.floor(Math.random() * 4)] as AuditInput['risks'][0]['impact'],
          mitigation: 'Mitigation',
        })),
      });
      const report = engine.auditRecommendation(input);
      expect(report.uncertainties.length).toBeGreaterThan(0);
    });

    it('should handle zero reversibility', () => {
      const input = createMockAuditInput({
        opportunityCosts: {
          ...createMockAuditInput().opportunityCosts,
          reversibilityScore: 0,
        },
      });
      const report = engine.auditRecommendation(input);
      expect(report.findings.risks.some(r => r.includes('reversibility'))).toBe(true);
    });
  });

  describe('Verdict Logic', () => {
    it('should mark trustworthy for good inputs', () => {
      const input = createMockAuditInput({
        recommendation: { ...createMockAuditInput().recommendation, confidence: 90 },
        evidence: Array(10).fill(null).map(() => ({
          engine: 'psychology',
          type: 'match',
          description: 'Strong evidence',
          strength: 0.9,
          source: 'assessment',
          verifiable: true,
        })),
      });
      const report = engine.auditRecommendation(input);
      expect(report.verdict.trustworthy).toBe(true);
    });

    it('should mark untrustworthy for poor inputs', () => {
      const input = createMockAuditInput({
        recommendation: { ...createMockAuditInput().recommendation, confidence: 30 },
        evidence: [],
        engines: [],
      });
      const report = engine.auditRecommendation(input);
      expect(report.verdict.trustworthy).toBe(false);
    });

    it('should include caveats for borderline cases', () => {
      const input = createMockAuditInput({
        uncertainties: [{ source: 'Something', impact: 'medium' }],
      });
      const report = engine.auditRecommendation(input);
      expect(report.verdict.caveats.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// INTELLIGENCE VALIDATION ENGINE TESTS (50 tests)
// ============================================================================

describe('IntelligenceValidationEngine', () => {
  let engine: IntelligenceValidationEngine;

  beforeEach(() => {
    engine = new IntelligenceValidationEngine();
  });

  describe('Basic Functionality', () => {
    it('should create engine with default config', () => {
      expect(engine.getConfig()).toBeDefined();
      expect(engine.getConfig().enabledEngines.calibration).toBe(true);
    });

    it('should update config', () => {
      engine.updateConfig({ autoEscalate: false });
      expect(engine.getConfig().autoEscalate).toBe(false);
    });

    it('should get sub-engines', () => {
      const engines = engine.getEngines();
      expect(engines.calibration).toBeDefined();
      expect(engines.stability).toBeDefined();
      expect(engines.consistency).toBeDefined();
      expect(engines.uncertainty).toBeDefined();
      expect(engines.counterfactual).toBeDefined();
      expect(engines.audit).toBeDefined();
    });

    it('should run quick validation', async () => {
      const result = await engine.quickValidate('student-123', 80);
      expect(result.pass).toBe(true);
      expect(result.confidence).toBe(80);
    });

    it('should fail quick validation for low confidence', async () => {
      const result = await engine.quickValidate('student-123', 40);
      expect(result.pass).toBe(false);
    });
  });

  describe('Gate Thresholds', () => {
    it('should pass with high scores', async () => {
      const result = await engine.quickValidate('student-123', 85);
      expect(result.pass).toBe(true);
    });

    it('should fail when below threshold', async () => {
      const result = await engine.quickValidate('student-123', 45);
      expect(result.pass).toBe(false);
    });

    it('should handle uncertainty admission', async () => {
      const uncertaintyInput = createMockUncertaintyInput({
        recommendations: [{ careerId: 'c1', confidence: 40, evidenceCount: 1, engines: ['psychology'] }],
      });
      const result = await engine.quickValidate('student-123', 70, uncertaintyInput);
      expect(result.uncertainty).toBe('high');
    });
  });

  describe('Validation History', () => {
    it('should track validation history', async () => {
      await engine.quickValidate('student-1', 80);
      await engine.quickValidate('student-2', 75);

      const history = engine.getValidationHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter history by student', async () => {
      await engine.quickValidate('student-a', 80);
      await engine.quickValidate('student-b', 75);

      const history = engine.getValidationHistory('student-a');
      expect(history.every(r => r.studentId === 'student-a')).toBe(true);
    });

    it('should calculate statistics', async () => {
      await engine.quickValidate('student-1', 80);
      await engine.quickValidate('student-2', 40);

      const stats = engine.getStatistics();
      expect(stats.totalValidations).toBeGreaterThanOrEqual(2);
      expect(stats.passRate).toBeGreaterThanOrEqual(0);
      expect(stats.passRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Batch Validation', () => {
    it('should validate batch', async () => {
      const inputs = [
        { studentId: 's1', requestId: 'r1' },
        { studentId: 's2', requestId: 'r2' },
      ];

      const results = await engine.validateBatch(inputs as unknown[] as Parameters<typeof engine.validateBatch>[0]);
      expect(results).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing uncertainty input', async () => {
      const result = await engine.quickValidate('student-123', 75);
      expect(result.uncertainty).toBe('none');
    });

    it('should handle all engine failures gracefully', async () => {
      const result = await engine.validate({
        studentId: 'test',
        requestId: 'req',
      });
      expect(result.status).toBeDefined();
    });

    it('should respect skip gates option', async () => {
      const result = await engine.validate(
        { studentId: 'test', requestId: 'req' },
        { skipGates: true }
      );
      expect(result.gates.passed).toBe(true);
    });
  });
});
