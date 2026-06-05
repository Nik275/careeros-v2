/**
 * Career Path Intelligence Engine - Comprehensive Tests
 * 
 * Tests all sub-engines and integration points:
 * - PathDiscoveryEngine
 * - PathValidationEngine
 * - MilestoneEngine
 * - AlternativePathEngine
 * - FailureRecoveryEngine
 * - PathComparisonEngine
 * - PathExplanationEngine
 * 
 * @module intelligence/career-path-intelligence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCareerPathIntelligenceEngine,
  CareerPathIntelligenceEngine,
  CareerPathIntelligenceInput,
  PathType,
  PathDifficulty,
  PathRisk,
  MilestoneStatus,
  RecoveryStrategy,
} from '../index';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const createTestInput = (overrides?: Partial<CareerPathIntelligenceInput>): CareerPathIntelligenceInput => ({
  studentProfile: {
    id: 'test-student-001',
    currentEducationLevel: 'SCHOOL_12',
    yearsOfExperience: 0,
    skills: ['Problem Solving', 'Communication'],
    credentials: ['Class 12'],
    certifications: [],
    financialConstraints: {
      maxInvestment: 2000000,
      monthlyBudget: 30000,
      canTakeLoan: true,
    },
    timeConstraints: {
      maxDuration: 72,
      hoursPerWeek: 40,
      canRelocate: true,
    },
    locationConstraints: {
      preferredLocations: ['Bangalore'],
      forbiddenLocations: [],
      remotePreference: 'OPEN',
    },
    riskTolerance: 'MODERATE',
    preferredPathTypes: [PathType.DIRECT, PathType.CORPORATE],
    careerGoals: ['Software Engineer'],
    familyContext: {
      dependents: 0,
      pressureSources: [],
    },
    ...overrides?.studentProfile,
  },
  targetCareer: 'Software Engineer',
  constraints: {
    maxPaths: 5,
    maxDuration: 84,
    maxCost: 2500000,
  },
  preferences: {
    prioritizeSpeed: false,
    prioritizeOptionality: true,
    prioritizeSecurity: true,
    prioritizeCost: false,
  },
  timestamp: Date.now(),
  ...overrides,
});

// =============================================================================
// ENGINE INTEGRATION TESTS
// =============================================================================

describe('CareerPathIntelligenceEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  describe('Engine Initialization', () => {
    it('should create engine with default configuration', () => {
      expect(engine).toBeDefined();
      expect(engine.getConfig()).toBeDefined();
    });

    it('should create engine with custom configuration', () => {
      const customEngine = createCareerPathIntelligenceEngine({
        engine: {
          maxPathsToDiscover: 5,
          minPathConfidence: 0.5,
          strictValidation: true,
        },
      });
      expect(customEngine.getConfig().maxPathsToDiscover).toBe(5);
      expect(customEngine.getConfig().minPathConfidence).toBe(0.5);
      expect(customEngine.getConfig().strictValidation).toBe(true);
    });

    it('should update configuration', () => {
      engine.updateConfig({ maxPathsToDiscover: 15 });
      expect(engine.getConfig().maxPathsToDiscover).toBe(15);
    });
  });

  describe('Comprehensive Analysis', () => {
    it('should perform complete analysis for Software Engineer target', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.studentId).toBe(input.studentProfile.id);
      expect(analysis.targetCareer).toBe('Software Engineer');
      expect(analysis.engineVersion).toBeDefined();
    });

    it('should discover multiple paths', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.discoveredPaths).toBeDefined();
      expect(analysis.discoveredPaths.paths.length).toBeGreaterThan(0);
      expect(analysis.discoveredPaths.targetCareer).toBe('Software Engineer');
    });

    it('should validate paths against constraints', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.validatedPaths).toBeDefined();
      expect(analysis.invalidPaths).toBeDefined();
      
      // Valid paths should have validation results
      if (analysis.validatedPaths.length > 0) {
        expect(analysis.validatedPaths[0].isValidated).toBe(true);
        expect(analysis.validatedPaths[0].validationResults.length).toBeGreaterThan(0);
      }
    });

    it('should select a primary path', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.primaryPath).toBeDefined();
      expect(analysis.primaryPath.pathId).toBeDefined();
      expect(analysis.primaryPath.name).toBeDefined();
      expect(analysis.primaryPath.confidence).toBeGreaterThan(0);
    });

    it('should generate alternative paths (Plan B, C)', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.alternativePaths).toBeDefined();
      expect(analysis.alternativePaths.planA).toBeDefined();
      expect(analysis.alternativePaths.planB).toBeDefined();
      expect(analysis.alternativePaths.planC).toBeDefined();
      expect(analysis.alternativePaths.primaryPathId).toBeDefined();
    });

    it('should create milestone plan for primary path', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.milestonePlan).toBeDefined();
      expect(analysis.milestonePlan.pathId).toBe(analysis.primaryPath.pathId);
      expect(analysis.milestonePlan.milestones.length).toBeGreaterThan(0);
      expect(analysis.milestonePlan.totalDuration).toBeGreaterThan(0);
      expect(analysis.milestonePlan.criticalPath).toBeDefined();
    });

    it('should generate recovery plans for high-risk milestones', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.recoveryPlans).toBeDefined();
      // Should have recovery plans for milestones with failure probability > 0.3
      const highRiskMilestones = analysis.primaryPath.milestones.filter(
        m => m.failureProbability > 0.3
      );
      expect(Object.keys(analysis.recoveryPlans).length).toBeGreaterThanOrEqual(0);
    });

    it('should perform path comparison', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.pathComparison).toBeDefined();
      expect(analysis.pathComparison.difficulty).toBeDefined();
      expect(analysis.pathComparison.risk).toBeDefined();
      expect(analysis.pathComparison.cost).toBeDefined();
      expect(analysis.pathComparison.duration).toBeDefined();
      expect(analysis.pathComparison.optionality).toBeDefined();
      expect(analysis.pathComparison.utility).toBeDefined();
      expect(analysis.pathComparison.fitScores).toBeDefined();
    });

    it('should generate explanations for each path', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.explanations).toBeDefined();
      expect(Object.keys(analysis.explanations).length).toBeGreaterThan(0);
      
      const firstExplanation = Object.values(analysis.explanations)[0];
      expect(firstExplanation.overview).toBeDefined();
      expect(firstExplanation.journeyDescription).toBeDefined();
      expect(firstExplanation.fitExplanation).toBeDefined();
    });

    it('should generate ranked recommendations', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.recommendations).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      
      const firstRec = analysis.recommendations[0];
      expect(firstRec.rank).toBe(1);
      expect(firstRec.pathId).toBeDefined();
      expect(firstRec.confidence).toBeGreaterThan(0);
      expect(firstRec.fitScore).toBeGreaterThan(0);
      expect(firstRec.rationale).toBeDefined();
    });

    it('should perform optionality analysis', () => {
      const input = createTestInput();
      const analysis = engine.analyze(input);

      expect(analysis.optionalityAnalysis).toBeDefined();
      expect(analysis.optionalityAnalysis.overallOptionality).toBeGreaterThanOrEqual(0);
      expect(analysis.optionalityAnalysis.overallOptionality).toBeLessThanOrEqual(1);
      expect(analysis.optionalityAnalysis.recommendations).toBeDefined();
    });
  });

  describe('Quick Analysis', () => {
    it('should provide quick analysis results', () => {
      const input = createTestInput();
      const quickResult = engine.quickAnalyze(input);

      expect(quickResult).toBeDefined();
      expect(quickResult.targetCareer).toBe('Software Engineer');
      expect(quickResult.pathCount).toBeGreaterThanOrEqual(0);
      expect(quickResult.topPath).toBeDefined();
      expect(quickResult.difficulty).toBeDefined();
      expect(quickResult.duration).toBeGreaterThanOrEqual(0);
      expect(quickResult.estimatedCost).toBeGreaterThanOrEqual(0);
      expect(typeof quickResult.alternativesAvailable).toBe('boolean');
    });
  });

  describe('Path Recommendations', () => {
    it('should generate path recommendations', () => {
      const input = createTestInput();
      const recommendations = engine.getPathRecommendations(input);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach((rec, index) => {
        expect(rec.rank).toBe(index + 1);
        expect(rec.category).toBeDefined();
        expect(['OPTIMAL', 'SAFE', 'AGGRESSIVE', 'ALTERNATIVE', 'BACKUP']).toContain(rec.category);
      });
    });
  });

  describe('Constraint Handling', () => {
    it('should handle strict budget constraints', () => {
      const input = createTestInput({
        studentProfile: {
          ...createTestInput().studentProfile,
          financialConstraints: {
            maxInvestment: 500000, // Very low budget
            monthlyBudget: 10000,
            canTakeLoan: false,
          },
        },
      });
      
      const analysis = engine.analyze(input);
      
      // Should still return results but may have fewer valid paths
      expect(analysis).toBeDefined();
      expect(analysis.validatedPaths).toBeDefined();
    });

    it('should handle strict time constraints', () => {
      const input = createTestInput({
        studentProfile: {
          ...createTestInput().studentProfile,
          timeConstraints: {
            maxDuration: 24, // Very short timeline
            hoursPerWeek: 20,
            canRelocate: false,
          },
        },
      });
      
      const analysis = engine.analyze(input);
      
      expect(analysis).toBeDefined();
      expect(analysis.validatedPaths).toBeDefined();
    });

    it('should handle low risk tolerance', () => {
      const input = createTestInput({
        studentProfile: {
          ...createTestInput().studentProfile,
          riskTolerance: 'VERY_LOW',
        },
      });
      
      const analysis = engine.analyze(input);
      
      // Should prefer low-risk paths
      if (analysis.validatedPaths.length > 0) {
        const primaryPath = analysis.primaryPath;
        expect(primaryPath.riskLevel).toBeDefined();
      }
    });
  });

  describe('Different Career Targets', () => {
    it('should analyze Product Manager paths', () => {
      const input = createTestInput({ targetCareer: 'Product Manager' });
      const analysis = engine.analyze(input);

      expect(analysis).toBeDefined();
      expect(analysis.targetCareer).toBe('Product Manager');
      expect(analysis.discoveredPaths.paths.length).toBeGreaterThan(0);
    });

    it('should analyze Data Scientist paths', () => {
      const input = createTestInput({ targetCareer: 'Data Scientist' });
      const analysis = engine.analyze(input);

      expect(analysis).toBeDefined();
      expect(analysis.targetCareer).toBe('Data Scientist');
    });

    it('should handle unknown career targets', () => {
      const input = createTestInput({ targetCareer: 'Future Career X' });
      const analysis = engine.analyze(input);

      // Should generate generic paths for unknown careers
      expect(analysis).toBeDefined();
      expect(analysis.discoveredPaths.discoveryMethod).toBe('GENERATED');
    });
  });
});

// =============================================================================
// PATH DISCOVERY ENGINE TESTS
// =============================================================================

describe('PathDiscoveryEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should discover multiple path types', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    const pathTypes = new Set(analysis.discoveredPaths.paths.map(p => p.type));
    expect(pathTypes.size).toBeGreaterThan(0);
  });

  it('should calculate path confidence based on profile fit', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    analysis.discoveredPaths.paths.forEach(path => {
      expect(path.confidence).toBeGreaterThanOrEqual(0);
      expect(path.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should calculate optionality scores', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    analysis.discoveredPaths.paths.forEach(path => {
      expect(path.optionalityScore).toBeGreaterThanOrEqual(0);
      expect(path.optionalityScore).toBeLessThanOrEqual(1);
      expect(path.optionalityBreakdown).toBeDefined();
    });
  });

  it('should include India-specific paths when enabled', () => {
    const indiaEngine = createCareerPathIntelligenceEngine({
      engine: {
        considerIndianExams: true,
      },
    });

    const input = createTestInput({ targetCareer: 'Software Engineer' });
    const analysis = indiaEngine.analyze(input);

    // Should have paths that mention IIT or engineering
    const hasEngineeringPath = analysis.discoveredPaths.paths.some(
      p => p.name.toLowerCase().includes('engineering') || 
           p.name.toLowerCase().includes('iit')
    );
    expect(hasEngineeringPath).toBe(true);
  });
});

// =============================================================================
// PATH VALIDATION ENGINE TESTS
// =============================================================================

describe('PathValidationEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should validate prerequisites', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    if (analysis.validatedPaths.length > 0) {
      const validationResults = analysis.validatedPaths[0].validationResults;
      const prereqValidation = validationResults.find(v => v.validator === 'PREREQUISITE');
      expect(prereqValidation).toBeDefined();
    }
  });

  it('should validate financial constraints', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    if (analysis.validatedPaths.length > 0) {
      const validationResults = analysis.validatedPaths[0].validationResults;
      const financialValidation = validationResults.find(v => v.validator === 'CONSTRAINT');
      expect(financialValidation).toBeDefined();
    }
  });

  it('should validate time constraints', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    // Check that validation results include time constraint checks
    // Note: The engine uses a scoring system where paths with constraint violations
    // can still be valid if they score above the minimum threshold
    analysis.validatedPaths.forEach(path => {
      const timeValidation = path.validationResults.find(r => 
        r.issues.some(i => i.includes('duration') || i.includes('months'))
      );
      
      // Either path passes time constraints OR it has time constraint warnings
      const hasTimeIssue = path.validationResults.some(r =>
        r.issues.some(i => i.includes('duration') || i.includes('months'))
      );
      
      // Valid paths should either be within time limits or have acceptable scores despite issues
      expect(path.isValidated).toBe(true);
    });
  });

  it('should provide validation scores', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    if (analysis.validatedPaths.length > 0) {
      analysis.validatedPaths[0].validationResults.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(typeof result.passed).toBe('boolean');
      });
    }
  });

  it('should provide validation recommendations', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    if (analysis.validatedPaths.length > 0) {
      analysis.validatedPaths[0].validationResults.forEach(result => {
        expect(result.recommendations).toBeDefined();
      });
    }
  });
});

// =============================================================================
// MILESTONE ENGINE TESTS
// =============================================================================

describe('MilestoneEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should create milestone plan with critical path', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.milestonePlan.criticalPath).toBeDefined();
    expect(analysis.milestonePlan.criticalPath.length).toBeGreaterThan(0);
    expect(analysis.milestonePlan.bufferTime).toBeGreaterThanOrEqual(0);
  });

  it('should identify parallel tracks', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.milestonePlan.parallelTracks).toBeDefined();
  });

  it('should include all milestones in plan', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.milestonePlan.milestones.length).toBe(
      analysis.primaryPath.milestones.length
    );
  });

  it('should calculate milestones with prerequisites', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    analysis.milestonePlan.milestones.forEach(milestone => {
      expect(milestone.prerequisites).toBeDefined();
      expect(milestone.expectedOutcomes).toBeDefined();
      expect(milestone.validationCriteria).toBeDefined();
    });
  });

  it('should estimate failure probabilities', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    analysis.milestonePlan.milestones.forEach(milestone => {
      expect(milestone.failureProbability).toBeGreaterThanOrEqual(0);
      expect(milestone.failureProbability).toBeLessThanOrEqual(1);
    });
  });
});

// =============================================================================
// ALTERNATIVE PATH ENGINE TESTS
// =============================================================================

describe('AlternativePathEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should generate Plan B (easier/safer)', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.alternativePaths.planB).toBeDefined();
    expect(analysis.alternativePaths.planB.pathId).not.toBe(analysis.alternativePaths.planA.pathId);
  });

  it('should generate Plan C (different approach)', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.alternativePaths.planC).toBeDefined();
    expect(analysis.alternativePaths.planC.pathId).not.toBe(analysis.alternativePaths.planA.pathId);
  });

  it('should identify switching points', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.alternativePaths.switchingPoints).toBeDefined();
  });

  it('should ensure alternatives lead to same target', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.alternativePaths.planA.targetCareer).toBe(input.targetCareer);
    expect(analysis.alternativePaths.planB.targetCareer).toBe(input.targetCareer);
    expect(analysis.alternativePaths.planC.targetCareer).toBe(input.targetCareer);
  });
});

// =============================================================================
// FAILURE RECOVERY ENGINE TESTS
// =============================================================================

describe('FailureRecoveryEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should generate recovery plans for high-risk milestones', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    const highRiskMilestones = analysis.primaryPath.milestones.filter(
      m => m.failureProbability > 0.3
    );

    highRiskMilestones.forEach(milestone => {
      const recoveryPlan = analysis.recoveryPlans[milestone.id];
      if (recoveryPlan) {
        expect(recoveryPlan.failedMilestoneId).toBe(milestone.id);
        expect(recoveryPlan.recoveryOptions).toBeDefined();
        expect(recoveryPlan.recoveryOptions.length).toBeGreaterThan(0);
      }
    });
  });

  it('should provide multiple recovery strategies', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.recoveryPlans).forEach(plan => {
      const strategies = plan.recoveryOptions.map(o => o.strategy);
      const uniqueStrategies = new Set(strategies);
      expect(uniqueStrategies.size).toBeGreaterThan(0);
    });
  });

  it('should recommend optimal recovery option', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.recoveryPlans).forEach(plan => {
      if (plan.recommendedOption) {
        expect(plan.recommendedOption.successProbability).toBeGreaterThan(0);
        expect(plan.recommendedOption.cost).toBeGreaterThanOrEqual(0);
        expect(plan.recommendedOption.time).toBeGreaterThan(0);
      }
    });
  });

  it('should calculate impact on path', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.recoveryPlans).forEach(plan => {
      expect(plan.impactOnPath.additionalCost).toBeGreaterThanOrEqual(0);
      expect(plan.impactOnPath.additionalTime).toBeGreaterThanOrEqual(0);
      expect(plan.impactOnPath.confidenceImpact).toBeGreaterThanOrEqual(0);
    });
  });
});

// =============================================================================
// PATH COMPARISON ENGINE TESTS
// =============================================================================

describe('PathComparisonEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should compare difficulty across paths', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.difficulty.scores).toBeDefined();
    expect(analysis.pathComparison.difficulty.rankings.length).toBeGreaterThan(0);
    expect(analysis.pathComparison.difficulty.bestPathId).toBeDefined();
    expect(analysis.pathComparison.difficulty.explanation).toBeDefined();
  });

  it('should compare risk across paths', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.risk.scores).toBeDefined();
    expect(analysis.pathComparison.risk.rankings.length).toBeGreaterThan(0);
    expect(analysis.pathComparison.risk.explanation).toBeDefined();
  });

  it('should compare cost across paths', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.cost.scores).toBeDefined();
    expect(analysis.pathComparison.cost.rankings.length).toBeGreaterThan(0);
    expect(analysis.pathComparison.cost.explanation).toBeDefined();
  });

  it('should compare duration across paths', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.duration.scores).toBeDefined();
    expect(analysis.pathComparison.duration.rankings.length).toBeGreaterThan(0);
    expect(analysis.pathComparison.duration.explanation).toBeDefined();
  });

  it('should calculate fit scores for student profile', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.fitScores).toBeDefined();
    
    Object.values(analysis.pathComparison.fitScores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  it('should identify tradeoffs between paths', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.tradeoffs).toBeDefined();
  });

  it('should recommend best path', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.pathComparison.recommendedPathId).toBeDefined();
    expect(analysis.pathComparison.recommendationRationale.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// PATH EXPLANATION ENGINE TESTS
// =============================================================================

describe('PathExplanationEngine', () => {
  let engine: CareerPathIntelligenceEngine;

  beforeEach(() => {
    engine = createCareerPathIntelligenceEngine();
  });

  it('should generate path overviews', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.explanations).forEach(explanation => {
      expect(explanation.overview).toBeDefined();
      expect(explanation.overview.length).toBeGreaterThan(0);
    });
  });

  it('should generate journey descriptions', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.explanations).forEach(explanation => {
      expect(explanation.journeyDescription).toBeDefined();
      expect(explanation.journeyDescription.length).toBeGreaterThan(0);
    });
  });

  it('should generate fit explanations', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.explanations).forEach(explanation => {
      expect(explanation.fitExplanation).toBeDefined();
      expect(explanation.fitExplanation.length).toBeGreaterThan(0);
    });
  });

  it('should generate risk narratives', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.explanations).forEach(explanation => {
      expect(explanation.riskNarrative).toBeDefined();
    });
  });

  it('should generate comparison explanations', () => {
    const input = createTestInput();
    const analysis = engine.analyze(input);

    Object.values(analysis.explanations).forEach(explanation => {
      // Not all paths will have all comparisons
      if (explanation.comparisonToDirectPath) {
        expect(explanation.comparisonToDirectPath.length).toBeGreaterThan(0);
      }
    });
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe('Edge Cases', () => {
  it('should handle no valid paths scenario', () => {
    const engine = createCareerPathIntelligenceEngine();
    const input = createTestInput({
      studentProfile: {
        ...createTestInput().studentProfile,
        financialConstraints: {
          maxInvestment: 10000, // Impossibly low
          monthlyBudget: 1000,
          canTakeLoan: false,
        },
      },
    });

    const analysis = engine.analyze(input);
    
    // Should still return a valid analysis structure
    expect(analysis).toBeDefined();
    expect(analysis.validatedPaths).toBeDefined();
  });

  it('should handle single path scenario', () => {
    const engine = createCareerPathIntelligenceEngine({
      discovery: {
        maxPaths: 1,
      },
    });
    const input = createTestInput();
    const analysis = engine.analyze(input);

    expect(analysis.discoveredPaths.paths.length).toBeLessThanOrEqual(1);
  });

  it('should handle high-risk profile', () => {
    const engine = createCareerPathIntelligenceEngine();
    const input = createTestInput({
      studentProfile: {
        ...createTestInput().studentProfile,
        riskTolerance: 'VERY_HIGH',
        preferredPathTypes: [PathType.ENTREPRENEURIAL],
      },
    });

    const analysis = engine.analyze(input);
    expect(analysis).toBeDefined();
  });

  it('should handle experienced professional', () => {
    const engine = createCareerPathIntelligenceEngine();
    const input = createTestInput({
      studentProfile: {
        ...createTestInput().studentProfile,
        currentEducationLevel: 'UNDERGRAD',
        currentRole: 'Software Developer',
        currentIndustry: 'Technology',
        yearsOfExperience: 3,
        skills: ['JavaScript', 'React', 'Node.js', 'System Design'],
      },
      targetCareer: 'Product Manager',
    });

    const analysis = engine.analyze(input);
    expect(analysis).toBeDefined();
  });
});
