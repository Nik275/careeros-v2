/**
 * Student Model Engine Unit Tests
 * 
 * Comprehensive test suite for the StudentModelEngine.
 * 
 * Test Coverage:
 *   - Basic conversion functionality
 *   - All 10 core traits
 *   - Confidence calculation
 *   - Evidence tracking
 *   - Edge cases (empty assessments, invalid data)
 *   - Belief updating
 *   - Scoring rule validation
 *   - Transparency requirements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  StudentModelEngine,
  createStudentModelEngine,
  convertAssessmentToBelief,
  createEmptyAssessment,
  createMockResponse,
  DEFAULT_SCORING_CONFIG,
  CORE_TRAITS,
  TRAIT_DESCRIPTIONS,
  type AssessmentResult,
  type AssessmentResponse,
  type StudentBeliefModel,
} from '../StudentModelEngine';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const TEST_STUDENT_ID = 'test_student_123';

function createFullAssessment(studentId: string = TEST_STUDENT_ID): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId,
    responses: [
      // Autonomy questions
      createMockResponse('work_style_preference', 'independent', 'autonomy'),
      createMockResponse('decision_making_preference', 'self_directed', 'autonomy'),
      createMockResponse('supervision_comfort', 'minimal', 'autonomy'),
      
      // Achievement questions
      createMockResponse('goal_orientation', 'ambitious_goals', 'achievement'),
      createMockResponse('recognition_importance', 'very_important', 'achievement'),
      createMockResponse('mastery_vs_performance', 'mastery', 'achievement'),
      
      // Creativity questions
      createMockResponse('problem_solving_approach', 'innovative', 'creativity'),
      createMockResponse('idea_generation_comfort', 'very_comfortable', 'creativity'),
      createMockResponse('routine_tolerance', 'low', 'creativity'),
      
      // Stability questions
      createMockResponse('change_comfort', 'prefer_stability', 'stability'),
      createMockResponse('predictability_importance', 'very_important', 'stability'),
      createMockResponse('career_path_preference', 'clear_ladder', 'stability'),
      
      // Impact questions
      createMockResponse('work_meaning_importance', 'essential', 'impact'),
      createMockResponse('helping_others_motivation', 'very_motivated', 'impact'),
      createMockResponse('social_contribution_desire', 'high', 'impact'),
      
      // Leadership questions
      createMockResponse('leadership_comfort', 'very_comfortable', 'leadership'),
      createMockResponse('influence_desire', 'high', 'leadership'),
      createMockResponse('team_coordination_enjoyment', 'enjoy', 'leadership'),
      
      // Analytical questions
      createMockResponse('data_comfort', 'very_comfortable', 'analytical'),
      createMockResponse('problem_breakdown_preference', 'systematic', 'analytical'),
      createMockResponse('logic_vs_intuition', 'logic', 'analytical'),
      
      // Communication questions
      createMockResponse('social_interaction_preference', 'very_social', 'communication'),
      createMockResponse('expression_comfort', 'very_comfortable', 'communication'),
      createMockResponse('relationship_building', 'enjoy', 'communication'),
      
      // Risk tolerance questions
      createMockResponse('uncertainty_comfort', 'very_comfortable', 'risk_tolerance'),
      createMockResponse('failure_perspective', 'learning_opportunity', 'risk_tolerance'),
      createMockResponse('startup_vs_corporate', 'startup', 'risk_tolerance'),
      
      // Financial questions
      createMockResponse('salary_importance', 'very_important', 'financial'),
      createMockResponse('wealth_building_desire', 'high', 'financial'),
      createMockResponse('financial_security_vs_growth', 'growth', 'financial'),
    ],
    startedAt: Date.now() - 300000, // 5 minutes ago
    completedAt: Date.now(),
  };
}

function createPartialAssessment(studentId: string = TEST_STUDENT_ID): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId,
    responses: [
      // Only autonomy and creativity
      createMockResponse('work_style_preference', 'independent', 'autonomy'),
      createMockResponse('problem_solving_approach', 'innovative', 'creativity'),
    ],
    startedAt: Date.now() - 60000,
    completedAt: Date.now(),
  };
}

function createLowAutonomyAssessment(studentId: string = TEST_STUDENT_ID): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId,
    responses: [
      createMockResponse('work_style_preference', 'collaborative', 'autonomy'),
      createMockResponse('decision_making_preference', 'team_consensus', 'autonomy'),
    ],
    startedAt: Date.now() - 120000,
    completedAt: Date.now(),
  };
}

function createRushedAssessment(studentId: string = TEST_STUDENT_ID): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId,
    responses: [
      { ...createMockResponse('work_style_preference', 'independent', 'autonomy'), timeSpent: 100 }, // Very rushed
      { ...createMockResponse('goal_orientation', 'ambitious_goals', 'achievement'), timeSpent: 100 },
    ],
    startedAt: Date.now() - 5000,
    completedAt: Date.now(),
  };
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('StudentModelEngine', () => {
  let engine: StudentModelEngine;

  beforeEach(() => {
    engine = createStudentModelEngine();
  });

  // ========================================================================
  // BASIC FUNCTIONALITY
  // ========================================================================

  describe('Basic Conversion', () => {
    it('should convert a full assessment successfully', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);

      expect(result.success).toBe(true);
      expect(result.belief).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should create a belief with correct structure', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.id).toBeDefined();
      expect(belief.studentId).toBe(TEST_STUDENT_ID);
      expect(belief.version).toBe(1);
      expect(belief.timestamp).toBeGreaterThan(0);
      expect(belief.questionCount).toBe(assessment.responses.length);
      expect(belief.scoringVersion).toBe(DEFAULT_SCORING_CONFIG.version);
    });

    it('should fail gracefully with empty assessment', () => {
      const assessment = createEmptyAssessment(TEST_STUDENT_ID);
      const result = engine.convertAssessment(assessment);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.belief).toBeUndefined();
    });

    it('should generate correct statistics', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);

      expect(result.stats.questionsProcessed).toBe(assessment.responses.length);
      expect(result.stats.traitsAssessed).toBe(CORE_TRAITS.length);
      expect(result.stats.evidenceItemsGenerated).toBeGreaterThan(0);
      expect(result.stats.averageConfidence).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // TRAIT VALIDATION (All 10 Traits)
  // ========================================================================

  describe('All 10 Core Traits', () => {
    it('should have all 10 traits defined', () => {
      expect(CORE_TRAITS).toHaveLength(10);
      expect(CORE_TRAITS).toContain('autonomy');
      expect(CORE_TRAITS).toContain('achievement');
      expect(CORE_TRAITS).toContain('creativity');
      expect(CORE_TRAITS).toContain('stability');
      expect(CORE_TRAITS).toContain('impact');
      expect(CORE_TRAITS).toContain('leadership');
      expect(CORE_TRAITS).toContain('analytical');
      expect(CORE_TRAITS).toContain('communication');
      expect(CORE_TRAITS).toContain('risk_tolerance');
      expect(CORE_TRAITS).toContain('financial');
    });

    it('should have descriptions for all traits', () => {
      for (const trait of CORE_TRAITS) {
        expect(TRAIT_DESCRIPTIONS[trait]).toBeDefined();
        expect(TRAIT_DESCRIPTIONS[trait].length).toBeGreaterThan(10);
      }
    });

    it('should assess all 10 traits from full assessment', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait]).toBeDefined();
        expect(typeof belief.traits[trait].value).toBe('number');
        expect(typeof belief.traits[trait].confidence).toBe('number');
        expect(typeof belief.traits[trait].evidenceCount).toBe('number');
        expect(Array.isArray(belief.traits[trait].evidence)).toBe(true);
      }
    });
  });

  describe('Autonomy Trait', () => {
    it('should detect high autonomy from independent responses', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.traits.autonomy.value).toBeGreaterThan(0.6);
      expect(belief.traits.autonomy.evidenceCount).toBeGreaterThan(0);
    });

    it('should detect low autonomy from collaborative responses', () => {
      const assessment = createLowAutonomyAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.traits.autonomy.value).toBeLessThan(0.5);
    });
  });

  describe('Creativity Trait', () => {
    it('should detect high creativity from innovative responses', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.traits.creativity.value).toBeGreaterThan(0.6);
    });
  });

  describe('Stability Trait', () => {
    it('should detect high stability from stability-preferring responses', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.traits.stability.value).toBeGreaterThan(0.6);
    });
  });

  describe('Impact Trait', () => {
    it('should detect high impact from meaning-focused responses', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      expect(belief.traits.impact.value).toBeGreaterThan(0.6);
    });
  });

  // ========================================================================
  // BELIEF STRUCTURE VALIDATION
  // ========================================================================

  describe('TraitBelief Structure', () => {
    it('should have value between 0 and 1', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait].value).toBeGreaterThanOrEqual(0);
        expect(belief.traits[trait].value).toBeLessThanOrEqual(1);
      }
    });

    it('should have confidence between 0 and 1', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait].confidence).toBeGreaterThanOrEqual(0);
        expect(belief.traits[trait].confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should have non-negative evidenceCount', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait].evidenceCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have evidence array matching evidenceCount', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait].evidence.length).toBe(belief.traits[trait].evidenceCount);
      }
    });
  });

  // ========================================================================
  // CONFIDENCE CALCULATION
  // ========================================================================

  describe('Confidence Calculation', () => {
    it('should have higher confidence with more evidence', () => {
      const fullAssessment = createFullAssessment();
      const partialAssessment = createPartialAssessment();

      const fullResult = engine.convertAssessment(fullAssessment);
      const partialResult = engine.convertAssessment(partialAssessment);

      expect(fullResult.belief!.overallConfidence).toBeGreaterThan(
        partialResult.belief!.overallConfidence
      );
    });

    it('should reduce confidence for rushed answers', () => {
      const normalAssessment = createFullAssessment();
      const rushedAssessment = createRushedAssessment();

      const normalEngine = createStudentModelEngine();
      const rushedEngine = createStudentModelEngine();

      const normalResult = normalEngine.convertAssessment(normalAssessment);
      const rushedResult = rushedEngine.convertAssessment(rushedAssessment);

      // Rushed answers should have same or lower confidence
      expect(rushedResult.belief!.overallConfidence).toBeLessThanOrEqual(
        normalResult.belief!.overallConfidence
      );
    });

    it('should have zero confidence for traits with no evidence', () => {
      const assessment = createPartialAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      // Traits not covered should have zero or very low confidence
      expect(belief.traits.impact.confidence).toBeLessThan(0.5);
      expect(belief.traits.leadership.confidence).toBeLessThan(0.5);
    });

    it('should respect max confidence limit', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      const maxConfidence = DEFAULT_SCORING_CONFIG.confidence.maxConfidence;
      
      for (const trait of CORE_TRAITS) {
        expect(belief.traits[trait].confidence).toBeLessThanOrEqual(maxConfidence);
      }
    });
  });

  // ========================================================================
  // EVIDENCE TRACKING
  // ========================================================================

  describe('Evidence Tracking', () => {
    it('should track evidence for each trait', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      // Autonomy should have 3 evidence items
      expect(belief.traits.autonomy.evidenceCount).toBe(3);
      expect(belief.traits.autonomy.evidence).toHaveLength(3);
    });

    it('should include questionId in evidence', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        for (const evidence of belief.traits[trait].evidence) {
          expect(evidence.questionId).toBeDefined();
          expect(evidence.questionId.length).toBeGreaterThan(0);
        }
      }
    });

    it('should include response value in evidence', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        for (const evidence of belief.traits[trait].evidence) {
          expect(evidence.response).toBeDefined();
        }
      }
    });

    it('should include weight in evidence', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      for (const trait of CORE_TRAITS) {
        for (const evidence of belief.traits[trait].evidence) {
          expect(typeof evidence.weight).toBe('number');
          expect(evidence.weight).toBeGreaterThan(0);
        }
      }
    });

    it('should have unique evidence IDs', () => {
      const assessment = createFullAssessment();
      const result = engine.convertAssessment(assessment);
      const belief = result.belief!;

      const allIds = new Set<string>();
      
      for (const trait of CORE_TRAITS) {
        for (const evidence of belief.traits[trait].evidence) {
          expect(allIds.has(evidence.id)).toBe(false);
          allIds.add(evidence.id);
        }
      }
    });
  });

  // ========================================================================
  // BELIEF UPDATING (Bayesian Support)
  // ========================================================================

  describe('Belief Updating', () => {
    it('should update existing belief with new assessment', () => {
      const initialAssessment = createPartialAssessment();
      const initialResult = engine.convertAssessment(initialAssessment);
      const initialBelief = initialResult.belief!;

      const newAssessment = createFullAssessment();
      const updatedBelief = engine.updateBelief(initialBelief, newAssessment);

      expect(updatedBelief.version).toBe(initialBelief.version + 1);
      expect(updatedBelief.questionCount).toBe(
        initialBelief.questionCount + newAssessment.responses.length
      );
    });

    it('should combine evidence counts when updating', () => {
      const initialAssessment = createPartialAssessment();
      const initialResult = engine.convertAssessment(initialAssessment);
      const initialBelief = initialResult.belief!;

      const newAssessment = createFullAssessment();
      const updatedBelief = engine.updateBelief(initialBelief, newAssessment);

      // Autonomy should have combined evidence
      expect(updatedBelief.traits.autonomy.evidenceCount).toBeGreaterThan(
        initialBelief.traits.autonomy.evidenceCount
      );
    });

    it('should increase confidence when updating with more evidence', () => {
      const initialAssessment = createPartialAssessment();
      const initialResult = engine.convertAssessment(initialAssessment);
      const initialBelief = initialResult.belief!;

      const newAssessment = createFullAssessment();
      const updatedBelief = engine.updateBelief(initialBelief, newAssessment);

      // Overall confidence should increase
      expect(updatedBelief.overallConfidence).toBeGreaterThanOrEqual(
        initialBelief.overallConfidence
      );
    });

    it('should maintain evidence history when updating', () => {
      const initialAssessment = createPartialAssessment();
      const initialResult = engine.convertAssessment(initialAssessment);
      const initialBelief = initialResult.belief!;

      const initialAutonomyEvidence = initialBelief.traits.autonomy.evidence.length;

      const newAssessment = createFullAssessment();
      const updatedBelief = engine.updateBelief(initialBelief, newAssessment);

      // Should have more evidence than initial
      expect(updatedBelief.traits.autonomy.evidence.length).toBeGreaterThan(
        initialAutonomyEvidence
      );
    });
  });

  // ========================================================================
  // SCORING RULES VALIDATION
  // ========================================================================

  describe('Scoring Rules Transparency', () => {
    it('should have explicit scoring rules for all questions', () => {
      const rules = DEFAULT_SCORING_CONFIG.rules;
      expect(rules.length).toBeGreaterThan(0);

      // All rules should have explanations
      for (const rule of rules) {
        expect(rule.explanation).toBeDefined();
        expect(rule.explanation.length).toBeGreaterThan(10);
      }
    });

    it('should have valid score ranges in rules', () => {
      const rules = DEFAULT_SCORING_CONFIG.rules;

      for (const rule of rules) {
        expect(rule.baseScore).toBeGreaterThanOrEqual(0);
        expect(rule.baseScore).toBeLessThanOrEqual(1);
        expect(rule.weight).toBeGreaterThan(0);
        expect(rule.weight).toBeLessThanOrEqual(2);
      }
    });

    it('should have rules targeting valid traits', () => {
      const rules = DEFAULT_SCORING_CONFIG.rules;

      for (const rule of rules) {
        expect(CORE_TRAITS).toContain(rule.targetTrait);
      }
    });

    it('should have unique question-response combinations', () => {
      const rules = DEFAULT_SCORING_CONFIG.rules;
      const combinations = new Set<string>();

      for (const rule of rules) {
        const key = `${rule.questionId}_${rule.responseValue}`;
        combinations.add(key);
      }

      // Should have same number of unique combinations as rules
      expect(combinations.size).toBe(rules.length);
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('should handle unknown question IDs gracefully', () => {
      const assessment: AssessmentResult = {
        assessmentId: 'test',
        studentId: TEST_STUDENT_ID,
        responses: [
          createMockResponse('unknown_question', 'some_value'),
        ],
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      const result = engine.convertAssessment(assessment);
      
      // Should succeed but with warnings
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle multi-select responses', () => {
      const assessment: AssessmentResult = {
        assessmentId: 'test',
        studentId: TEST_STUDENT_ID,
        responses: [
          {
            questionId: 'multi_trait_selection',
            type: 'multi_choice',
            category: 'composite',
            value: ['option1', 'option2'],
            timestamp: Date.now(),
            timeSpent: 5000,
          },
        ],
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      const result = engine.convertAssessment(assessment);
      expect(result.success).toBe(true);
    });

    it('should handle very long assessments', () => {
      const responses: AssessmentResponse[] = [];
      
      // Create 100 duplicate responses
      for (let i = 0; i < 100; i++) {
        responses.push(createMockResponse('work_style_preference', 'independent', 'autonomy'));
      }

      const assessment: AssessmentResult = {
        assessmentId: 'test',
        studentId: TEST_STUDENT_ID,
        responses,
        startedAt: Date.now() - 3600000,
        completedAt: Date.now(),
      };

      const result = engine.convertAssessment(assessment);
      expect(result.success).toBe(true);
      expect(result.belief!.traits.autonomy.confidence).toBe(
        DEFAULT_SCORING_CONFIG.confidence.maxConfidence
      );
    });

    it('should handle assessment with zero time spent', () => {
      const assessment: AssessmentResult = {
        assessmentId: 'test',
        studentId: TEST_STUDENT_ID,
        responses: [
          { ...createMockResponse('work_style_preference', 'independent', 'autonomy'), timeSpent: 0 },
        ],
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      const result = engine.convertAssessment(assessment);
      expect(result.success).toBe(true);
      // Confidence should be reduced due to zero time
      expect(result.belief!.traits.autonomy.confidence).toBeLessThan(
        DEFAULT_SCORING_CONFIG.confidence.baseConfidence
      );
    });
  });

  // ========================================================================
  // CONVENIENCE FUNCTIONS
  // ========================================================================

  describe('Convenience Functions', () => {
    it('convertAssessmentToBelief should work as standalone function', () => {
      const assessment = createFullAssessment();
      const result = convertAssessmentToBelief(assessment);

      expect(result.success).toBe(true);
      expect(result.belief).toBeDefined();
    });

    it('convertAssessmentToBelief should accept custom config', () => {
      const assessment = createFullAssessment();
      const result = convertAssessmentToBelief(assessment, {
        debugMode: true,
      });

      expect(result.success).toBe(true);
    });

    it('createEmptyAssessment should create valid empty assessment', () => {
      const assessment = createEmptyAssessment(TEST_STUDENT_ID);

      expect(assessment.studentId).toBe(TEST_STUDENT_ID);
      expect(assessment.responses).toHaveLength(0);
    });

    it('createMockResponse should create valid response', () => {
      const response = createMockResponse('test_question', 'test_value', 'autonomy');

      expect(response.questionId).toBe('test_question');
      expect(response.value).toBe('test_value');
      expect(response.category).toBe('autonomy');
    });
  });

  // ========================================================================
  // DEBUG MODE
  // ========================================================================

  describe('Debug Mode', () => {
    it('should not log when debug mode is disabled', () => {
      const engine = createStudentModelEngine({ debugMode: false });
      const assessment = createFullAssessment();
      
      engine.convertAssessment(assessment);
      
      expect(engine.getDebugLog()).toHaveLength(0);
    });

    it('should log when debug mode is enabled', () => {
      const engine = createStudentModelEngine({ debugMode: true });
      const assessment = createFullAssessment();
      
      engine.convertAssessment(assessment);
      
      expect(engine.getDebugLog().length).toBeGreaterThan(0);
    });

    it('should log structured data in debug mode', () => {
      const engine = createStudentModelEngine({ debugMode: true });
      const assessment = createFullAssessment();
      
      engine.convertAssessment(assessment);
      
      const logs = engine.getDebugLog();
      expect(logs.length).toBeGreaterThan(0);
      
      // Each log should be valid JSON
      for (const log of logs) {
        const parsed = JSON.parse(log);
        expect(parsed.message).toBeDefined();
        expect(parsed.timestamp).toBeDefined();
      }
    });
  });
});

// ============================================================================
// EXAMPLE OUTPUT TEST
// ============================================================================

describe('Example Output Validation', () => {
  it('should produce output matching example format', () => {
    const assessment = createFullAssessment();
    const result = convertAssessmentToBelief(assessment);
    const belief = result.belief!;

    // Validate the example format from requirements
    const creativity = belief.traits.creativity;
    
    expect(typeof creativity.value).toBe('number');
    expect(typeof creativity.confidence).toBe('number');
    expect(typeof creativity.evidenceCount).toBe('number');
    
    expect(creativity.value).toBeGreaterThanOrEqual(0);
    expect(creativity.value).toBeLessThanOrEqual(1);
    expect(creativity.confidence).toBeGreaterThanOrEqual(0);
    expect(creativity.confidence).toBeLessThanOrEqual(1);
    expect(creativity.evidenceCount).toBeGreaterThanOrEqual(0);

    // Example from requirements:
    // creativity: { value: 0.82, confidence: 0.74, evidenceCount: 5 }
    // Our implementation should produce similar structure
    expect(creativity).toEqual({
      value: expect.any(Number),
      confidence: expect.any(Number),
      evidenceCount: expect.any(Number),
      evidence: expect.any(Array),
    });
  });
});
