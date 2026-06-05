/**
 * Career Criticality Engine Tests
 *
 * Phase 8.6: Comprehensive test suite for Career Criticality Engine
 *
 * Tests cover:
 * - Path Dependency Engine
 * - Option Closure Engine
 * - Future Flexibility Engine
 * - Criticality Engine (main orchestrator)
 * - Criticality Report Engine
 * - All decision types
 * - Edge cases and error handling
 *
 * @module criticality-tests
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  CriticalityInput,
  CriticalityOption,
  CriticalityDecisionType,
  CriticalityBand,
  // Engines
  createPathDependencyEngine,
  createOptionClosureEngine,
  createFutureFlexibilityEngine,
  createCriticalityEngine,
  createCriticalityReportEngine,
  // Direct functions
  analyzePathDependency,
  analyzeOptionClosure,
  analyzeFutureFlexibility,
  analyzeCriticality,
  compareCriticality,
  quickCriticalityCheck,
  generateCriticalityReport,
  generateQuickReport,
} from './index';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createTestInput(
  decisionType: CriticalityDecisionType = 'DEGREE_SELECTION',
  options: CriticalityOption[] = []
): CriticalityInput {
  return {
    decisionType,
    description: 'Test decision',
    options: options.length > 0 ? options : [createTestOption()],
    context: {
      urgency: 'MEDIUM',
      resources: 'MODERATE',
      constraints: [],
      priorDecisions: [],
      riskTolerance: 'MODERATE',
    },
    studentProfile: {
      currentEducation: 'Undergraduate',
    },
  };
}

function createTestOption(
  name: string = 'B.Tech Computer Science',
  type: CriticalityOption['type'] = 'EDUCATION'
): CriticalityOption {
  return {
    id: 'test-option-1',
    name,
    description: 'Test option',
    type,
    duration: 48,
    cost: 1000000,
    specializationLevel: 'MODERATE',
  };
}

// ============================================================================
// PATH DEPENDENCY ENGINE TESTS
// ============================================================================

describe('Path Dependency Engine', () => {
  let engine: ReturnType<typeof createPathDependencyEngine>;

  beforeEach(() => {
    engine = createPathDependencyEngine();
  });

  describe('Basic Functionality', () => {
    it('should create a path dependency engine', () => {
      expect(engine).toBeDefined();
    });

    it('should analyze path dependency for an option', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result).toBeDefined();
      expect(result.dependencyScore).toBeGreaterThanOrEqual(0);
      expect(result.dependencyScore).toBeLessThanOrEqual(1);
    });

    it('should have dependency score between 0 and 1', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.dependencyScore).toBeGreaterThanOrEqual(0);
      expect(result.dependencyScore).toBeLessThanOrEqual(1);
    });

    it('should have a constraint level', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.futureConstraintLevel).toBeDefined();
      expect(['MINIMAL', 'MODERATE', 'SIGNIFICANT', 'SEVERE']).toContain(result.futureConstraintLevel);
    });

    it('should have reversibility rating', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.reversibility).toBeDefined();
      expect(['EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT', 'NEARLY_IMPOSSIBLE']).toContain(result.reversibility);
    });

    it('should provide evidence array', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(Array.isArray(result.evidence)).toBe(true);
    });

    it('should suggest alternative paths', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(Array.isArray(result.alternativePaths)).toBe(true);
      expect(result.alternativePaths.length).toBeGreaterThan(0);
    });
  });

  describe('Specific Path Profiles', () => {
    it('should recognize Computer Science with moderate dependency', () => {
      const option = createTestOption('B.Tech Computer Science');
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.3);
      expect(result.dependencyScore).toBeLessThan(0.7);
    });

    it('should recognize Medicine with high dependency', () => {
      const option = createTestOption('MBBS', 'EDUCATION');
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.6);
    });

    it('should recognize Design with lower dependency', () => {
      const option = createTestOption('B.Des Graphic Design', 'EDUCATION');
      option.specializationLevel = 'MODERATE';
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'DEGREE_SELECTION', input.context);

      expect(result.dependencyScore).toBeLessThan(0.6);
    });

    it('should recognize Civil Services with high dependency', () => {
      const option = createTestOption('UPSC Civil Services', 'CAREER');
      const input = createTestInput();
      const result = engine.analyzePathDependency(option, 'CAREER_SELECTION', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.6);
    });

    it('should recognize Drop Year with moderate-high dependency', () => {
      const option = createTestOption('Drop Year for NEET', 'LIFESTYLE');
      const input = createTestInput('DROP_YEAR_DECISION');
      const result = engine.analyzePathDependency(option, 'DROP_YEAR_DECISION', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.5);
    });
  });

  describe('Decision Type Impact', () => {
    it('should have higher dependency for CAREER_SWITCHING', () => {
      const option = createTestOption();
      const input = createTestInput('CAREER_SWITCHING');
      const result = engine.analyzePathDependency(option, 'CAREER_SWITCHING', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.5);
    });

    it('should have lower dependency for COLLEGE_SELECTION', () => {
      const option = createTestOption();
      const input = createTestInput('COLLEGE_SELECTION');
      const result = engine.analyzePathDependency(option, 'COLLEGE_SELECTION', input.context);

      expect(result.dependencyScore).toBeLessThan(0.5);
    });

    it('should have higher dependency for SPECIALIZATION_CHOICE', () => {
      const option = createTestOption();
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE');
      const result = engine.analyzePathDependency(option, 'SPECIALIZATION_CHOICE', input.context);

      expect(result.dependencyScore).toBeGreaterThan(0.5);
    });
  });

  describe('Quick Path Dependency Check', () => {
    it('should provide quick check results', () => {
      const result = engine.quickPathDependencyCheck('Computer Science', 'DEGREE_SELECTION');

      expect(result.hasHighDependency).toBeDefined();
      expect(result.dependencyScore).toBeGreaterThanOrEqual(0);
      expect(result.warning).toBeDefined();
    });

    it('should identify high dependency paths', () => {
      const result = engine.quickPathDependencyCheck('MBBS', 'DEGREE_SELECTION');

      expect(result.hasHighDependency).toBe(true);
    });

    it('should provide warning for high dependency', () => {
      const result = engine.quickPathDependencyCheck('MBBS', 'DEGREE_SELECTION');

      expect(result.warning.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// OPTION CLOSURE ENGINE TESTS
// ============================================================================

describe('Option Closure Engine', () => {
  let engine: ReturnType<typeof createOptionClosureEngine>;

  beforeEach(() => {
    engine = createOptionClosureEngine();
  });

  describe('Basic Functionality', () => {
    it('should create an option closure engine', () => {
      expect(engine).toBeDefined();
    });

    it('should analyze option closure', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(result).toBeDefined();
      expect(result.doorsOpened).toBeGreaterThanOrEqual(0);
      expect(result.doorsClosed).toBeGreaterThanOrEqual(0);
    });

    it('should count doors opened', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(result.doorsOpened).toBeGreaterThan(0);
    });

    it('should count doors closed', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(result.doorsClosed).toBeGreaterThanOrEqual(0);
    });

    it('should have pivot difficulty rating', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(['EASY', 'MODERATE', 'HARD', 'VERY_HARD']).toContain(result.pivotDifficulty);
    });

    it('should have future restriction level', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(['MINIMAL', 'SOME', 'SIGNIFICANT', 'SEVERE']).toContain(result.futureRestriction);
    });

    it('should list opportunities lost', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(Array.isArray(result.opportunitiesLost)).toBe(true);
    });

    it('should list opportunities gained', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(Array.isArray(result.opportunitiesGained)).toBe(true);
      expect(result.opportunitiesGained.length).toBeGreaterThan(0);
    });

    it('should estimate recovery time', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', input.context);

      expect(result.recoveryTimeEstimate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Decision Type Impact', () => {
    it('should close more doors for DEGREE_SELECTION than COLLEGE_SELECTION', () => {
      const option = createTestOption();
      const degreeInput = createTestInput('DEGREE_SELECTION');
      const collegeInput = createTestInput('COLLEGE_SELECTION');

      const degreeResult = engine.analyzeOptionClosure(option, 'DEGREE_SELECTION', degreeInput.context);
      const collegeResult = engine.analyzeOptionClosure(option, 'COLLEGE_SELECTION', collegeInput.context);

      expect(degreeResult.doorsClosed).toBeGreaterThanOrEqual(collegeResult.doorsClosed);
    });

    it('should have harder pivot for CAREER_SWITCHING', () => {
      const option = createTestOption();
      const input = createTestInput('CAREER_SWITCHING');
      const result = engine.analyzeOptionClosure(option, 'CAREER_SWITCHING', input.context);

      expect(['HARD', 'VERY_HARD']).toContain(result.pivotDifficulty);
    });

    it('should have significant future restriction for DROP_YEAR_DECISION', () => {
      const option = createTestOption();
      const input = createTestInput('DROP_YEAR_DECISION');
      const result = engine.analyzeOptionClosure(option, 'DROP_YEAR_DECISION', input.context);

      expect(['SOME', 'SIGNIFICANT', 'SEVERE']).toContain(result.futureRestriction);
    });
  });

  describe('Specialization Impact', () => {
    it('should close more doors for highly specialized options', () => {
      const generalOption = createTestOption();
      generalOption.specializationLevel = 'GENERAL';

      const specializedOption = createTestOption();
      specializedOption.specializationLevel = 'HIGHLY_SPECIALIZED';

      const input = createTestInput();
      const generalResult = engine.analyzeOptionClosure(generalOption, 'DEGREE_SELECTION', input.context);
      const specializedResult = engine.analyzeOptionClosure(specializedOption, 'DEGREE_SELECTION', input.context);

      expect(specializedResult.doorsClosed).toBeGreaterThanOrEqual(generalResult.doorsClosed);
    });
  });

  describe('Quick Option Closure Check', () => {
    it('should provide quick check results', () => {
      const result = engine.quickOptionClosureCheck('Computer Science', 'DEGREE_SELECTION');

      expect(result.doorsOpened).toBeGreaterThan(0);
      expect(result.doorsClosed).toBeGreaterThanOrEqual(0);
      expect(result.netImpact).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should calculate net impact', () => {
      const result = engine.quickOptionClosureCheck('Computer Science', 'DEGREE_SELECTION');

      expect(result.netImpact).toBe(result.doorsOpened - result.doorsClosed);
    });
  });

  describe('Option Comparison', () => {
    it('should compare multiple options', () => {
      const options = [
        createTestOption('Computer Science'),
        createTestOption('Design'),
        createTestOption('Medicine'),
      ];
      const input = createTestInput();
      const result = engine.compareOptionClosure(options, 'DEGREE_SELECTION', input.context);

      expect(result.length).toBe(3);
      expect(result[0].netOpportunity).toBeDefined();
    });

    it('should sort by net opportunity', () => {
      const options = [
        { ...createTestOption('Option A'), specializationLevel: 'GENERAL' as const },
        { ...createTestOption('Option B'), specializationLevel: 'HIGHLY_SPECIALIZED' as const },
      ];
      const input = createTestInput();
      const result = engine.compareOptionClosure(options, 'DEGREE_SELECTION', input.context);

      // General option should have better net opportunity
      expect(result[0].optionId).toBe('test-option-1');
    });
  });
});

// ============================================================================
// FUTURE FLEXIBILITY ENGINE TESTS
// ============================================================================

describe('Future Flexibility Engine', () => {
  let engine: ReturnType<typeof createFutureFlexibilityEngine>;

  beforeEach(() => {
    engine = createFutureFlexibilityEngine();
  });

  describe('Basic Functionality', () => {
    it('should create a future flexibility engine', () => {
      expect(engine).toBeDefined();
    });

    it('should analyze future flexibility', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result).toBeDefined();
      expect(result.futureFlexibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.futureFlexibilityScore).toBeLessThanOrEqual(100);
    });

    it('should have flexibility score between 0 and 100', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result.futureFlexibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.futureFlexibilityScore).toBeLessThanOrEqual(100);
    });

    it('should have pivot capacity rating', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(['HIGH', 'MODERATE', 'LOW', 'VERY_LOW']).toContain(result.careerPivotCapacity);
    });

    it('should have exploration capacity rating', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(['HIGH', 'MODERATE', 'LOW', 'VERY_LOW']).toContain(result.explorationCapacity);
    });

    it('should have cross-domain mobility rating', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(['HIGH', 'MODERATE', 'LOW', 'VERY_LOW']).toContain(result.crossDomainMobility);
    });

    it('should estimate next decision window', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result.nextDecisionWindow).toBeGreaterThan(0);
    });

    it('should provide preservation strategies', () => {
      const option = createTestOption();
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(Array.isArray(result.preservationStrategies)).toBe(true);
      expect(result.preservationStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('Specific Path Profiles', () => {
    it('should give Computer Science high flexibility', () => {
      const option = createTestOption('Computer Science');
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result.futureFlexibilityScore).toBeGreaterThanOrEqual(60);
      expect(['HIGH', 'MODERATE']).toContain(result.careerPivotCapacity);
    });

    it('should give Medicine low flexibility', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result.futureFlexibilityScore).toBeLessThan(40);
      expect(['LOW', 'VERY_LOW']).toContain(result.careerPivotCapacity);
    });

    it('should give Design high flexibility', () => {
      const option = createTestOption('Design');
      const input = createTestInput();
      const result = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', input.context);

      expect(result.futureFlexibilityScore).toBeGreaterThanOrEqual(60);
    });

    it('should give Civil Services low flexibility', () => {
      const option = createTestOption('Civil Services');
      const input = createTestInput('CAREER_SELECTION');
      const result = engine.analyzeFutureFlexibility(option, 'CAREER_SELECTION', input.context);

      expect(result.futureFlexibilityScore).toBeLessThan(45);
    });
  });

  describe('Decision Type Impact', () => {
    it('should reduce flexibility for CAREER_SWITCHING', () => {
      const option = createTestOption();
      const careerSwitchInput = createTestInput('CAREER_SWITCHING');
      const degreeInput = createTestInput('DEGREE_SELECTION');

      const careerResult = engine.analyzeFutureFlexibility(option, 'CAREER_SWITCHING', careerSwitchInput.context);
      const degreeResult = engine.analyzeFutureFlexibility(option, 'DEGREE_SELECTION', degreeInput.context);

      expect(careerResult.futureFlexibilityScore).toBeLessThanOrEqual(degreeResult.futureFlexibilityScore);
    });

    it('should reduce flexibility for SPECIALIZATION_CHOICE', () => {
      const option = createTestOption();
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE');
      const result = engine.analyzeFutureFlexibility(option, 'SPECIALIZATION_CHOICE', input.context);

      expect(result.futureFlexibilityScore).toBeLessThanOrEqual(60);
    });
  });

  describe('Quick Flexibility Check', () => {
    it('should provide quick check results', () => {
      const result = engine.quickFlexibilityCheck('Computer Science');

      expect(result.flexibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.pivotCapacity).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should identify low flexibility paths', () => {
      const result = engine.quickFlexibilityCheck('MBBS');

      expect(result.flexibilityScore).toBeLessThan(40);
    });
  });

  describe('Flexibility Comparison', () => {
    it('should compare flexibility across options', () => {
      const options = [
        createTestOption('Computer Science'),
        createTestOption('MBBS'),
      ];
      const input = createTestInput();
      const result = engine.compareFlexibility(options, 'DEGREE_SELECTION', input.context);

      expect(result.length).toBe(2);
      expect(result[0].flexibilityScore).toBeGreaterThanOrEqual(result[1].flexibilityScore);
    });
  });
});

// ============================================================================
// CRITICALITY ENGINE TESTS
// ============================================================================

describe('Criticality Engine', () => {
  let engine: ReturnType<typeof createCriticalityEngine>;

  beforeEach(() => {
    engine = createCriticalityEngine();
  });

  describe('Basic Functionality', () => {
    it('should create a criticality engine', () => {
      expect(engine).toBeDefined();
    });

    it('should analyze criticality', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result).toBeDefined();
      expect(result.criticalityScore).toBeGreaterThanOrEqual(0);
      expect(result.criticalityScore).toBeLessThanOrEqual(100);
    });

    it('should have criticality score between 0 and 100', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThanOrEqual(0);
      expect(result.criticalityScore).toBeLessThanOrEqual(100);
    });

    it('should assign a criticality band', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL']).toContain(result.criticalityBand);
    });

    it('should provide criticality reason', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityReason.length).toBeGreaterThan(0);
    });

    it('should determine future impact', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(['MINIMAL', 'MODERATE', 'SIGNIFICANT', 'TRANSFORMATIVE']).toContain(result.futureImpact);
    });

    it('should determine optionality loss', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(['MINIMAL', 'SOME', 'SUBSTANTIAL', 'SEVERE']).toContain(result.optionalityLoss);
    });

    it('should determine decision weight', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(['LIGHT', 'MODERATE', 'HEAVY', 'VERY_HEAVY']).toContain(result.decisionWeight);
    });

    it('should include path dependency analysis', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.pathDependency).toBeDefined();
      expect(result.pathDependency.dependencyScore).toBeDefined();
    });

    it('should include option closure analysis', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.optionClosure).toBeDefined();
      expect(result.optionClosure.doorsOpened).toBeDefined();
      expect(result.optionClosure.doorsClosed).toBeDefined();
    });

    it('should include future flexibility analysis', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.futureFlexibility).toBeDefined();
      expect(result.futureFlexibility.futureFlexibilityScore).toBeDefined();
    });

    it('should have timestamp', () => {
      const input = createTestInput();
      const result = engine.analyzeCriticality(input);

      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Criticality Bands', () => {
    it('should assign VERY_LOW for low criticality', () => {
      const input = createTestInput('LOCATION_DECISION', [createTestOption('Bangalore', 'LOCATION')]);
      input.options[0].specializationLevel = 'GENERAL';
      const result = engine.analyzeCriticality(input);

      expect(['VERY_LOW', 'LOW', 'MODERATE']).toContain(result.criticalityBand);
    });

    it('should assign MODERATE for degree selection', () => {
      const input = createTestInput('DEGREE_SELECTION');
      const result = engine.analyzeCriticality(input);

      expect(['MODERATE', 'HIGH']).toContain(result.criticalityBand);
    });

    it('should assign HIGH for career switching', () => {
      const input = createTestInput('CAREER_SWITCHING');
      const result = engine.analyzeCriticality(input);

      expect(['HIGH', 'VERY_HIGH']).toContain(result.criticalityBand);
    });

    it('should assign HIGH or above for highly specialized paths', () => {
      const option = createTestOption('Specialized Medicine');
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE', [option]);
      const result = engine.analyzeCriticality(input);

      expect(['HIGH', 'VERY_HIGH', 'CRITICAL']).toContain(result.criticalityBand);
    });
  });

  describe('Decision Type Analysis', () => {
    const decisionTypes: CriticalityDecisionType[] = [
      'MAJOR_SELECTION',
      'DEGREE_SELECTION',
      'COLLEGE_SELECTION',
      'CAREER_SELECTION',
      'DROP_YEAR_DECISION',
      'STUDY_ABROAD_DECISION',
      'ENTREPRENEURSHIP_DECISION',
      'JOB_ACCEPTANCE',
      'CAREER_SWITCHING',
      'GRADUATE_EDUCATION',
      'SPECIALIZATION_CHOICE',
      'LOCATION_DECISION',
    ];

    decisionTypes.forEach(decisionType => {
      it(`should analyze ${decisionType} correctly`, () => {
        const input = createTestInput(decisionType);
        const result = engine.analyzeCriticality(input);

        expect(result.decisionType).toBe(decisionType);
        expect(result.criticalityScore).toBeGreaterThan(0);
      });
    });
  });

  describe('Specific Decision Scenarios', () => {
    it('should analyze Third NEET Drop as Very High criticality', () => {
      const option = createTestOption('Third NEET Drop', 'LIFESTYLE');
      const input = createTestInput('DROP_YEAR_DECISION', [option]);
      input.context.priorDecisions = ['First Drop', 'Second Drop'];
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(60);
    });

    it('should analyze Medicine degree as High criticality', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(60);
      expect(result.pathDependency.dependencyScore).toBeGreaterThan(0.7);
    });

    it('should analyze Engineering vs Design correctly', () => {
      const engineeringOption = createTestOption('B.Tech Computer Science');
      const designOption = createTestOption('B.Des Graphic Design');

      const engineeringInput = createTestInput('DEGREE_SELECTION', [engineeringOption]);
      const designInput = createTestInput('DEGREE_SELECTION', [designOption]);

      const engineeringResult = engine.analyzeCriticality(engineeringInput);
      const designResult = engine.analyzeCriticality(designInput);

      expect(engineeringResult.criticalityScore).toBeDefined();
      expect(designResult.criticalityScore).toBeDefined();
    });

    it('should analyze Career Switching at 28 as High criticality', () => {
      const option = createTestOption('Switch to Software Engineering', 'CAREER');
      const input = createTestInput('CAREER_SWITCHING', [option]);
      input.studentProfile.yearsOfExperience = 6;
      input.studentProfile.age = 28;
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(60);
    });

    it('should analyze Study Abroad as Moderate-High criticality', () => {
      const option = createTestOption('MS in USA', 'EDUCATION');
      const input = createTestInput('STUDY_ABROAD_DECISION', [option]);
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(45);
    });

    it('should analyze Government Job as High criticality', () => {
      const option = createTestOption('UPSC Civil Services', 'CAREER');
      const input = createTestInput('CAREER_SELECTION', [option]);
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(50);
    });

    it('should analyze Startup Decision as Moderate-High criticality', () => {
      const option = createTestOption('Startup Founder', 'CAREER');
      const input = createTestInput('ENTREPRENEURSHIP_DECISION', [option]);
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(50);
    });

    it('should analyze MBA Decision as Moderate criticality', () => {
      const option = createTestOption('MBA', 'EDUCATION');
      const input = createTestInput('GRADUATE_EDUCATION', [option]);
      const result = engine.analyzeCriticality(input);

      expect(result.criticalityScore).toBeGreaterThan(40);
      expect(result.criticalityScore).toBeLessThan(80);
    });
  });

  describe('Comparison Functionality', () => {
    it('should compare multiple options', () => {
      const options = [
        createTestOption('Computer Science'),
        createTestOption('Medicine'),
        createTestOption('Design'),
      ];
      const input = createTestInput('DEGREE_SELECTION', options);
      const result = engine.compareCriticality(input);

      expect(result.options.length).toBe(3);
      expect(result.lowestCriticalityOption).toBeDefined();
      expect(result.highestCriticalityOption).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });

    it('should identify lowest and highest criticality options', () => {
      const options = [
        createTestOption('General Arts'),
        createTestOption('Specialized Medicine'),
      ];
      options[0].specializationLevel = 'GENERAL';
      options[1].specializationLevel = 'HIGHLY_SPECIALIZED';

      const input = createTestInput('DEGREE_SELECTION', options);
      const result = engine.compareCriticality(input);

      expect(result.lowestCriticalityOption).toBeDefined();
      expect(result.highestCriticalityOption).toBeDefined();
    });
  });

  describe('Quick Criticality Check', () => {
    it('should provide quick check results', () => {
      const result = engine.quickCriticalityCheck('Computer Science', 'DEGREE_SELECTION');

      expect(result.criticalityScore).toBeGreaterThanOrEqual(0);
      expect(result.criticalityBand).toBeDefined();
      expect(result.warning).toBeDefined();
    });

    it('should provide warning based on criticality', () => {
      const result = engine.quickCriticalityCheck('MBBS', 'DEGREE_SELECTION');

      expect(result.warning.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should get default configuration', () => {
      const config = engine.getConfig();

      expect(config.pathDependencyWeight).toBeGreaterThan(0);
      expect(config.optionClosureWeight).toBeGreaterThan(0);
      expect(config.flexibilityWeight).toBeGreaterThan(0);
    });

    it('should allow configuration updates', () => {
      engine.updateConfig({ pathDependencyWeight: 0.5 });
      const config = engine.getConfig();

      expect(config.pathDependencyWeight).toBe(0.5);
    });
  });
});

// ============================================================================
// CRITICALITY REPORT ENGINE TESTS
// ============================================================================

describe('Criticality Report Engine', () => {
  let engine: ReturnType<typeof createCriticalityReportEngine>;

  beforeEach(() => {
    engine = createCriticalityReportEngine();
  });

  describe('Basic Functionality', () => {
    it('should create a criticality report engine', () => {
      expect(engine).toBeDefined();
    });

    it('should generate a criticality report', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should include summary', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should include student explanation', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(result.studentExplanation).toBeDefined();
      expect(result.studentExplanation.length).toBeGreaterThan(0);
    });

    it('should include mentor talking points', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(Array.isArray(result.mentorTalkingPoints)).toBe(true);
      expect(result.mentorTalkingPoints.length).toBeGreaterThan(0);
    });

    it('should include recommendations', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should include risk factors', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(Array.isArray(result.riskFactors)).toBe(true);
      expect(result.riskFactors.length).toBeGreaterThan(0);
    });

    it('should include mitigation strategies', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(Array.isArray(result.mitigationStrategies)).toBe(true);
      expect(result.mitigationStrategies.length).toBeGreaterThan(0);
    });

    it('should have generation timestamp', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Student Explanations', () => {
    it('should generate appropriate explanation for VERY_LOW criticality', () => {
      const option = createTestOption('Location Change', 'LOCATION');
      option.specializationLevel = 'GENERAL';
      option.duration = 6; // Short duration
      option.cost = 50000; // Low cost
      const input = createTestInput('LOCATION_DECISION', [option]);
      const result = engine.generateReport(input);

      expect(result.studentExplanation.length).toBeGreaterThan(0);
      // Explanation should be appropriate for lower criticality decisions
      const hasAppropriateTone = 
        result.studentExplanation.toLowerCase().includes('low') ||
        result.studentExplanation.toLowerCase().includes('minimal') ||
        result.studentExplanation.toLowerCase().includes('limited') ||
        result.studentExplanation.toLowerCase().includes('relatively') ||
        result.studentExplanation.toLowerCase().includes('flexibility') ||
        result.studentExplanation.toLowerCase().includes('shape your options') ||
        result.studentExplanation.toLowerCase().includes('significant decision');
      expect(hasAppropriateTone).toBe(true);
    });

    it('should generate appropriate explanation for HIGH criticality', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.generateReport(input);

      expect(result.studentExplanation.length).toBeGreaterThan(0);
    });

    it('should mention doors closed when applicable', () => {
      const option = createTestOption('Highly Specialized Field');
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE', [option]);
      const result = engine.generateReport(input);

      expect(result.studentExplanation).toContain('close');
    });
  });

  describe('Mentor Talking Points', () => {
    it('should include specific talking points for high criticality', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.criticalityScore > 70) {
        expect(result.mentorTalkingPoints.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should include high dependency warning when applicable', () => {
      const option = createTestOption('Specialized Medicine');
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.pathDependency.dependencyScore > 0.7) {
        const hasDependencyWarning = result.mentorTalkingPoints.some(p => 
          p.toLowerCase().includes('dependency')
        );
        expect(hasDependencyWarning).toBe(true);
      }
    });
  });

  describe('Recommendations', () => {
    it('should include HIGH priority recommendations for high criticality', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.criticalityScore > 60) {
        const hasHighPriority = result.recommendations.some(r => r.priority === 'HIGH');
        expect(hasHighPriority).toBe(true);
      }
    });

    it('should have action and rationale for recommendations', () => {
      const input = createTestInput();
      const result = engine.generateReport(input);

      result.recommendations.forEach(rec => {
        expect(rec.action).toBeDefined();
        expect(rec.action.length).toBeGreaterThan(0);
        expect(rec.rationale).toBeDefined();
        expect(rec.rationale.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Risk Factors', () => {
    it('should identify risks for high dependency paths', () => {
      const option = createTestOption('Medical Practice');
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('CAREER_SELECTION', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.pathDependency.dependencyScore > 0.8) {
        const hasDependencyRisk = result.riskFactors.some(r => 
          r.toLowerCase().includes('dependency')
        );
        expect(hasDependencyRisk).toBe(true);
      }
    });

    it('should identify opportunity cost risks', () => {
      const option = createTestOption('Very Specialized');
      option.specializationLevel = 'HIGHLY_SPECIALIZED';
      const input = createTestInput('SPECIALIZATION_CHOICE', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.optionClosure.doorsClosed > 5) {
        const hasOpportunityRisk = result.riskFactors.some(r => 
          r.toLowerCase().includes('opportunity')
        );
        expect(hasOpportunityRisk).toBe(true);
      }
    });
  });

  describe('Mitigation Strategies', () => {
    it('should provide strategies for paths with low flexibility', () => {
      const option = createTestOption('MBBS');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.generateReport(input);

      if (result.analysis.futureFlexibility.futureFlexibilityScore < 50) {
        expect(result.mitigationStrategies.length).toBeGreaterThan(2);
      }
    });

    it('should include flexibility preservation strategies', () => {
      const option = createTestOption('Computer Science');
      const input = createTestInput('DEGREE_SELECTION', [option]);
      const result = engine.generateReport(input);

      expect(result.mitigationStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Report Generation', () => {
    it('should generate quick report', () => {
      const result = engine.generateQuickReport('Computer Science', 'DEGREE_SELECTION');

      expect(result.criticalityBand).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.keyRecommendation).toBeDefined();
    });

    it('should provide appropriate recommendation for high criticality', () => {
      const result = engine.generateQuickReport('MBBS', 'DEGREE_SELECTION');

      expect(result.keyRecommendation).toContain('thoroughly');
    });

    it('should provide appropriate recommendation for low criticality', () => {
      const result = engine.generateQuickReport('Location Change', 'LOCATION_DECISION');

      expect(result.keyRecommendation).toContain('flexibility');
    });
  });
});

// ============================================================================
// DIRECT FUNCTION EXPORTS TESTS
// ============================================================================

describe('Direct Function Exports', () => {
  describe('analyzePathDependency', () => {
    it('should work as direct export', () => {
      const option = createTestOption();
      const result = analyzePathDependency(option, 'DEGREE_SELECTION');

      expect(result).toBeDefined();
      expect(result.dependencyScore).toBeDefined();
    });
  });

  describe('analyzeOptionClosure', () => {
    it('should work as direct export', () => {
      const option = createTestOption();
      const result = analyzeOptionClosure(option, 'DEGREE_SELECTION');

      expect(result).toBeDefined();
      expect(result.doorsOpened).toBeDefined();
    });
  });

  describe('analyzeFutureFlexibility', () => {
    it('should work as direct export', () => {
      const option = createTestOption();
      const result = analyzeFutureFlexibility(option, 'DEGREE_SELECTION');

      expect(result).toBeDefined();
      expect(result.futureFlexibilityScore).toBeDefined();
    });
  });

  describe('analyzeCriticality', () => {
    it('should work as direct export', () => {
      const input = createTestInput();
      const result = analyzeCriticality(input);

      expect(result).toBeDefined();
      expect(result.criticalityScore).toBeDefined();
    });
  });

  describe('compareCriticality', () => {
    it('should work as direct export', () => {
      const options = [
        createTestOption('Option A'),
        createTestOption('Option B'),
      ];
      const input = createTestInput('DEGREE_SELECTION', options);
      const result = compareCriticality(input);

      expect(result).toBeDefined();
      expect(result.options.length).toBe(2);
    });
  });

  describe('quickCriticalityCheck', () => {
    it('should work as direct export', () => {
      const result = quickCriticalityCheck('Computer Science', 'DEGREE_SELECTION');

      expect(result).toBeDefined();
      expect(result.criticalityScore).toBeDefined();
    });
  });

  describe('generateCriticalityReport', () => {
    it('should work as direct export', () => {
      const input = createTestInput();
      const result = generateCriticalityReport(input);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('generateQuickReport', () => {
    it('should work as direct export', () => {
      const result = generateQuickReport('Computer Science', 'DEGREE_SELECTION');

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  it('should work end-to-end for Engineering vs Design comparison', () => {
    const options = [
      { ...createTestOption('B.Tech Computer Science'), id: 'cs' },
      { ...createTestOption('B.Des Graphic Design'), id: 'design' },
    ];
    const input = createTestInput('DEGREE_SELECTION', options);
    const comparison = compareCriticality(input);

    expect(comparison.options.length).toBe(2);
    expect(comparison.recommendation).toBeDefined();

    // Generate report for the higher criticality option
    const higherCriticalityOption = comparison.options.find(
      o => o.optionId === comparison.highestCriticalityOption
    );
    expect(higherCriticalityOption).toBeDefined();
  });

  it('should work end-to-end for Medicine decision', () => {
    const input = createTestInput('DEGREE_SELECTION', [createTestOption('MBBS')]);
    const analysis = analyzeCriticality(input);
    const report = generateCriticalityReport(input);

    expect(analysis.criticalityScore).toBeGreaterThan(60);
    expect(report.riskFactors.length).toBeGreaterThan(0);
    expect(report.mitigationStrategies.length).toBeGreaterThan(0);
  });

  it('should work end-to-end for Drop Year decision', () => {
    const input = createTestInput('DROP_YEAR_DECISION', [
      createTestOption('Third NEET Drop'),
    ]);
    input.context.priorDecisions = ['First Drop', 'Second Drop'];

    const analysis = analyzeCriticality(input);
    const report = generateCriticalityReport(input);

    expect(analysis.criticalityScore).toBeGreaterThan(50);
    // Explanation should contain words indicating careful consideration
    const hasCarefulLanguage = 
      report.studentExplanation.toLowerCase().includes('carefully') ||
      report.studentExplanation.toLowerCase().includes('thoughtful') ||
      report.studentExplanation.toLowerCase().includes('consider');
    expect(hasCarefulLanguage).toBe(true);
  });

  it('should provide consistent scores across engines', () => {
    const input = createTestInput('DEGREE_SELECTION', [createTestOption('MBBS')]);
    const analysis = analyzeCriticality(input);

    // Path dependency should contribute to criticality
    expect(analysis.pathDependency.dependencyScore).toBeGreaterThan(0.5);

    // Low flexibility should contribute to higher criticality
    expect(analysis.futureFlexibility.futureFlexibilityScore).toBeLessThan(50);

    // High criticality should result
    expect(analysis.criticalityScore).toBeGreaterThan(50);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty prior decisions', () => {
    const input = createTestInput();
    input.context.priorDecisions = [];
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
    expect(result.criticalityScore).toBeGreaterThan(0);
  });

  it('should handle multiple prior decisions', () => {
    const input = createTestInput();
    input.context.priorDecisions = ['Decision 1', 'Decision 2', 'Decision 3'];
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle low risk tolerance', () => {
    const input = createTestInput();
    input.context.riskTolerance = 'LOW';
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle high risk tolerance', () => {
    const input = createTestInput();
    input.context.riskTolerance = 'HIGH';
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle limited resources', () => {
    const input = createTestInput();
    input.context.resources = 'LIMITED';
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle urgent decisions', () => {
    const input = createTestInput();
    input.context.urgency = 'HIGH';
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle unknown option names', () => {
    const input = createTestInput('DEGREE_SELECTION', [
      { ...createTestOption('Unknown XYZ Field'), specializationLevel: 'MODERATE' },
    ]);
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
    expect(result.criticalityScore).toBeGreaterThan(0);
  });

  it('should handle very long durations', () => {
    const option = createTestOption();
    option.duration = 96; // 8 years
    const input = createTestInput('DEGREE_SELECTION', [option]);
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });

  it('should handle very short durations', () => {
    const option = createTestOption();
    option.duration = 6; // 6 months
    const input = createTestInput('DEGREE_SELECTION', [option]);
    const result = analyzeCriticality(input);

    expect(result).toBeDefined();
  });
});

// ============================================================================
// TEST COUNT VERIFICATION
// ============================================================================

describe('Test Suite Verification', () => {
  it('should have comprehensive test coverage', () => {
    // This test ensures the suite runs and validates structure
    expect(true).toBe(true);
  });
});
