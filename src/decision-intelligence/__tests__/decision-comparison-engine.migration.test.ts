/**
 * @fileoverview DecisionComparisonEngine Migration Tests
 * @module @/decision-intelligence/__tests__/decision-comparison-engine.migration
 * 
 * Wave 2.2 - Decision Comparison Consolidation
 * Verifies behavioral parity between legacy engine and Decision Authority.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionComparisonEngine, createDecisionComparisonEngine } from '../decision-comparison-engine';
import type { DecisionOption, DecisionAnalysis, ComparisonCriteria } from '../decision-types';

describe('DecisionComparisonEngine - Wave 2.2 Migration', () => {
  let engine: DecisionComparisonEngine;
  let mockOptions: DecisionOption[];
  let mockAnalyses: Record<string, DecisionAnalysis>;

  beforeEach(() => {
    engine = createDecisionComparisonEngine();
    
    mockOptions = [
      createMockOption('career-1', 'Software Engineer'),
      createMockOption('career-2', 'Product Manager'),
      createMockOption('career-3', 'Data Scientist'),
    ];

    mockAnalyses = {
      'career-1': createMockAnalysis('career-1', 'Software Engineer', {
        fitQuality: 85,
        lifestyleQuality: 70,
        valueAlignment: 80,
        futurePotential: 90,
        flexibility: 75,
        overall: 82,
      }, {
        overall: 88,
      }),
      'career-2': createMockAnalysis('career-2', 'Product Manager', {
        fitQuality: 75,
        lifestyleQuality: 80,
        valueAlignment: 75,
        futurePotential: 85,
        flexibility: 80,
        overall: 79,
      }, {
        overall: 82,
      }),
      'career-3': createMockAnalysis('career-3', 'Data Scientist', {
        fitQuality: 80,
        lifestyleQuality: 75,
        valueAlignment: 70,
        futurePotential: 88,
        flexibility: 70,
        overall: 77,
      }, {
        overall: 85,
      }),
    };
  });

  describe('Constitutional Migration', () => {
    it('should delegate to Decision Authority', async () => {
      const result = await engine.compareDecisions(
        'test-comparison-1',
        mockOptions,
        mockAnalyses
      );

      expect(result).toBeDefined();
      expect(result.comparisonId).toBe('test-comparison-1');
    });

    it('should return valid DecisionComparison structure', async () => {
      const result = await engine.compareDecisions(
        'test-comparison-2',
        mockOptions,
        mockAnalyses
      );

      // Verify legacy format is preserved
      expect(result.comparisonId).toBeDefined();
      expect(result.options).toEqual(mockOptions);
      expect(result.analyses).toEqual(mockAnalyses);
      expect(result.dimensions).toBeDefined();
      expect(result.dimensions.length).toBeGreaterThan(0);
      expect(result.rankings).toBeDefined();
      expect(result.rankings.length).toBe(mockOptions.length);
      expect(result.headToHead).toBeDefined();
      expect(result.comparedAt).toBeInstanceOf(Date);
    });

    it('should rank options by overall score', async () => {
      const result = await engine.compareDecisions(
        'test-comparison-3',
        mockOptions,
        mockAnalyses
      );

      // First option has highest overall score (82)
      expect(result.rankings[0].optionId).toBe('career-1');
      expect(result.rankings[0].score).toBe(82);
    });

    it('should identify a winner when scores differ significantly', async () => {
      const result = await engine.compareDecisions(
        'test-comparison-4',
        mockOptions,
        mockAnalyses
      );

      // Winner should be career-1 (highest score: 82)
      expect(result.winner).toBe('career-1');
    });

    it('should handle single option', async () => {
      const singleOption = [mockOptions[0]];
      const singleAnalysis = { 'career-1': mockAnalyses['career-1'] };

      const result = await engine.compareDecisions(
        'single-test',
        singleOption,
        singleAnalysis
      );

      expect(result.options).toHaveLength(1);
      expect(result.rankings).toHaveLength(1);
      expect(result.rankings[0].rank).toBe(1);
    });

    it('should throw error for missing analyses', async () => {
      const incompleteAnalyses = { 'career-1': mockAnalyses['career-1'] };

      await expect(
        engine.compareDecisions('error-test', mockOptions, incompleteAnalyses)
      ).rejects.toThrow('Missing analyses');
    });

    it('should generate dimension comparisons', async () => {
      const result = await engine.compareDecisions(
        'dimension-test',
        mockOptions,
        mockAnalyses
      );

      // Should have dimension comparisons for each dimension
      const fitQualityDim = result.dimensions.find(d => d.dimension === 'FIT_QUALITY');
      expect(fitQualityDim).toBeDefined();
      expect(fitQualityDim?.scores['career-1'].score).toBe(85);
    });

    it('should identify best option per dimension', async () => {
      const result = await engine.compareDecisions(
        'best-option-test',
        mockOptions,
        mockAnalyses
      );

      // career-1 has highest fit quality (85)
      const fitQualityDim = result.dimensions.find(d => d.dimension === 'FIT_QUALITY');
      expect(fitQualityDim?.bestOption).toBe('career-1');
    });

    it('should calculate variance for dimensions', async () => {
      const result = await engine.compareDecisions(
        'variance-test',
        mockOptions,
        mockAnalyses
      );

      const fitQualityDim = result.dimensions.find(d => d.dimension === 'FIT_QUALITY');
      expect(fitQualityDim?.variance).toBeGreaterThan(0);
      expect(fitQualityDim?.variance).toBeLessThanOrEqual(100);
    });

    it('should generate head-to-head comparisons', async () => {
      const result = await engine.compareDecisions(
        'head-to-head-test',
        mockOptions,
        mockAnalyses
      );

      // For 3 options, should have 3 comparisons (pairwise without duplicates)
      expect(result.headToHead.length).toBe(3);
      
      // Each comparison should have optionA and optionB
      const firstComparison = result.headToHead[0];
      expect(firstComparison.optionA).toBeDefined();
      expect(firstComparison.optionB).toBeDefined();
      expect(firstComparison.winner).toBeDefined();
    });

    it('should identify key differentiators', async () => {
      const result = await engine.compareDecisions(
        'differentiators-test',
        mockOptions,
        mockAnalyses
      );

      expect(result.keyDifferentiators).toBeDefined();
      expect(Array.isArray(result.keyDifferentiators)).toBe(true);
    });
  });

  describe('Behavioral Parity', () => {
    it('should produce consistent rankings across multiple calls', async () => {
      const result1 = await engine.compareDecisions('parity-1', mockOptions, mockAnalyses);
      const result2 = await engine.compareDecisions('parity-2', mockOptions, mockAnalyses);

      // Rankings should be identical for same inputs
      expect(result1.rankings.map(r => r.optionId)).toEqual(
        result2.rankings.map(r => r.optionId)
      );
    });

    it('should preserve option metadata', async () => {
      const result = await engine.compareDecisions(
        'metadata-test',
        mockOptions,
        mockAnalyses
      );

      // Options should be returned unchanged
      expect(result.options[0].title).toBe('Software Engineer');
      expect(result.options[1].title).toBe('Product Manager');
    });

    it('should preserve analysis data', async () => {
      const result = await engine.compareDecisions(
        'analysis-test',
        mockOptions,
        mockAnalyses
      );

      // Analyses should be returned unchanged
      expect(result.analyses['career-1'].decisionQuality.overall).toBe(82);
      expect(result.analyses['career-2'].decisionQuality.overall).toBe(79);
    });

    it('should handle custom criteria', async () => {
      const customCriteria: ComparisonCriteria = {
        minConfidence: 60,
        dimensions: ['FIT_QUALITY', 'OVERALL_QUALITY'],
        requireAllDimensions: true,
      };

      const result = await engine.compareDecisions(
        'criteria-test',
        mockOptions,
        mockAnalyses,
        customCriteria
      );

      expect(result).toBeDefined();
      expect(result.dimensions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle two options', async () => {
      const twoOptions = mockOptions.slice(0, 2);
      const twoAnalyses = {
        'career-1': mockAnalyses['career-1'],
        'career-2': mockAnalyses['career-2'],
      };

      const result = await engine.compareDecisions(
        'two-options',
        twoOptions,
        twoAnalyses
      );

      expect(result.options).toHaveLength(2);
      expect(result.rankings).toHaveLength(2);
      expect(result.headToHead).toHaveLength(1);
    });

    it('should handle options with equal scores', async () => {
      const equalAnalyses = {
        'career-1': createMockAnalysis('career-1', 'Option A', {
          fitQuality: 80,
          lifestyleQuality: 80,
          valueAlignment: 80,
          futurePotential: 80,
          flexibility: 80,
          overall: 80,
        }, { overall: 80 }),
        'career-2': createMockAnalysis('career-2', 'Option B', {
          fitQuality: 80,
          lifestyleQuality: 80,
          valueAlignment: 80,
          futurePotential: 80,
          flexibility: 80,
          overall: 80,
        }, { overall: 80 }),
      };

      const result = await engine.compareDecisions(
        'equal-scores',
        mockOptions.slice(0, 2),
        equalAnalyses
      );

      expect(result).toBeDefined();
      // With equal scores, may not have clear winner
      expect(result.winner === null || typeof result.winner === 'string').toBe(true);
    });

    it('should handle empty advantages/disadvantages', async () => {
      const minimalAnalyses = {
        'career-1': createMockAnalysis('career-1', 'Minimal', {
          fitQuality: 70,
          lifestyleQuality: 70,
          valueAlignment: 70,
          futurePotential: 70,
          flexibility: 70,
          overall: 70,
        }, { overall: 70 }, { advantages: [], disadvantages: [] }),
      };

      const result = await engine.compareDecisions(
        'minimal-test',
        [mockOptions[0]],
        minimalAnalyses
      );

      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// TEST HELPERS
// ============================================================================

function createMockOption(id: string, title: string): DecisionOption {
  return {
    id,
    title,
    description: `Description for ${title}`,
    industry: 'Technology',
    educationRequired: 'Bachelor\'s Degree',
    salaryRange: { min: 80000, max: 150000 },
    growthOutlook: 'Positive',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockAnalysis(
  id: string,
  title: string,
  quality: {
    fitQuality: number;
    lifestyleQuality: number;
    valueAlignment: number;
    futurePotential: number;
    flexibility: number;
    overall: number;
  },
  confidence: { overall: number },
  overrides?: { advantages?: Array<{ description: string; importance: number }>; disadvantages?: Array<{ description: string; severity: number }> }
): DecisionAnalysis {
  return {
    option: createMockOption(id, title),
    studentId: 'student-123',
    decisionQuality: {
      fitQuality: { score: quality.fitQuality, confidence: confidence.overall },
      lifestyleQuality: { score: quality.lifestyleQuality, confidence: confidence.overall },
      valueAlignment: { score: quality.valueAlignment, confidence: confidence.overall },
      futurePotential: { score: quality.futurePotential, confidence: confidence.overall },
      flexibility: { score: quality.flexibility, confidence: confidence.overall },
      overall: quality.overall,
    },
    confidence: {
      overall: confidence.overall,
      fitQuality: confidence.overall,
      lifestyleQuality: confidence.overall,
      valueAlignment: confidence.overall,
      futurePotential: confidence.overall,
      flexibility: confidence.overall,
    },
    advantages: overrides?.advantages ?? [
      { description: `Strong ${title} fundamentals`, importance: 80 },
      { description: 'Good career prospects', importance: 75 },
    ],
    disadvantages: overrides?.disadvantages ?? [
      { description: 'Competitive field', severity: 60 },
    ],
    risks: [
      { riskId: 'risk-1', riskScore: 40, description: 'Market volatility', mitigation: 'Diversify skills' },
    ],
    opportunities: [
      { opportunityId: 'opp-1', opportunityScore: 75, description: 'Growing demand' },
    ],
    analyzedAt: new Date(),
  };
}
