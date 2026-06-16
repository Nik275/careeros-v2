/**
 * Decision Coalition Engine Unit Tests
 * 
 * Comprehensive test suite for the India-first stakeholder modeling engine.
 * 
 * Test Coverage:
 *   - Coalition formation from assessment
 *   - All 7 pressure factors
 *   - Stakeholder identification
 *   - Explainability functions
 *   - Parent report generation
 *   - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DecisionCoalitionEngine,
  createDecisionCoalitionEngine,
  formDecisionCoalition,
  createEmptyCoalitionAssessment,
  DEFAULT_COALITION_SCORING,
  type DecisionCoalition,
  type CoalitionPressures,
} from '../DecisionCoalitionEngine';
import type {
  AssessmentResult,
  AssessmentResponse,
} from '../../student-model/StudentModelEngine';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const TEST_STUDENT_ID = 'test_student_123';

function createMockResponse(
  questionId: string,
  value: string,
  timeSpent: number = 5000
): AssessmentResponse {
  return {
    questionId,
    type: 'single_choice',
    category: 'composite',
    value,
    timestamp: Date.now(),
    timeSpent,
  };
}

/**
 * Traditional Indian family assessment
 * High parent influence, high family expectations
 */
function createTraditionalFamilyAssessment(): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId: TEST_STUDENT_ID,
    responses: [
      // Decision making - parent dominated
      createMockResponse('decision_maker', 'parents'),
      createMockResponse('parent_discussion_frequency', 'always'),
      createMockResponse('parent_career_expectation', 'very_important'),
      
      // Family influence - high
      createMockResponse('extended_family_opinion', 'very_important'),
      createMockResponse('family_type', 'joint_family'),
      createMockResponse('prestige_career_pressure', 'high'),
      
      // Financial - moderate pressure
      createMockResponse('financial_constraints', 'some_constraint'),
      createMockResponse('education_funding', 'family_savings'),
      createMockResponse('family_income_level', '3_to_8_lakh'),
      
      // Income urgency - moderate
      createMockResponse('income_urgency', 'within_3_years'),
      createMockResponse('family_financial_dependence', 'partially_dependent'),
      
      // Risk - conservative
      createMockResponse('family_risk_attitude', 'somewhat_conservative'),
      createMockResponse('career_path_preference', 'tried_tested'),
      
      // Flexibility - low
      createMockResponse('unconventional_career_acceptance', 'not_accepting'),
      createMockResponse('traditional_career_expectation', 'strong_expectation'),
      createMockResponse('entrepreneurship_support', 'not_supportive'),
    ],
    startedAt: Date.now() - 300000,
    completedAt: Date.now(),
  };
}

/**
 * Progressive family assessment
 * Student-led decision, lower family influence
 */
function createProgressiveFamilyAssessment(): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId: TEST_STUDENT_ID,
    responses: [
      // Decision making - student led
      createMockResponse('decision_maker', 'myself'),
      createMockResponse('parent_discussion_frequency', 'sometimes'),
      createMockResponse('parent_career_expectation', 'somewhat_important'),
      
      // Family influence - low
      createMockResponse('extended_family_opinion', 'not_important'),
      createMockResponse('family_type', 'nuclear_family'),
      
      // Financial - low pressure
      createMockResponse('financial_constraints', 'no_constraint'),
      createMockResponse('education_funding', 'family_savings'),
      createMockResponse('family_income_level', 'above_8_lakh'),
      
      // Income urgency - low
      createMockResponse('income_urgency', 'no_urgency'),
      createMockResponse('family_financial_dependence', 'not_dependent'),
      
      // Risk - moderate to high
      createMockResponse('family_risk_attitude', 'somewhat_risk_taking'),
      createMockResponse('career_path_preference', 'emerging_fields'),
      
      // Flexibility - high
      createMockResponse('unconventional_career_acceptance', 'very_accepting'),
      createMockResponse('traditional_career_expectation', 'mild_preference'),
      createMockResponse('entrepreneurship_support', 'fully_supportive'),
    ],
    startedAt: Date.now() - 300000,
    completedAt: Date.now(),
  };
}

/**
 * Financially constrained assessment
 * High financial pressure and income urgency
 */
function createFinanciallyConstrainedAssessment(): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId: TEST_STUDENT_ID,
    responses: [
      // Decision making - mixed
      createMockResponse('decision_maker', 'family_collective'),
      createMockResponse('parent_discussion_frequency', 'always'),
      
      // Family influence - moderate
      createMockResponse('extended_family_opinion', 'somewhat_important'),
      
      // Financial - high pressure
      createMockResponse('financial_constraints', 'major_constraint'),
      createMockResponse('education_funding', 'education_loan'),
      createMockResponse('family_income_level', 'below_3_lakh'),
      
      // Income urgency - high
      createMockResponse('income_urgency', 'immediate'),
      createMockResponse('family_financial_dependence', 'fully_dependent'),
      
      // Risk - very conservative
      createMockResponse('family_risk_attitude', 'very_conservative'),
      createMockResponse('career_path_preference', 'tried_tested'),
      
      // Flexibility - very low
      createMockResponse('unconventional_career_acceptance', 'not_accepting'),
      createMockResponse('traditional_career_expectation', 'strong_expectation'),
      createMockResponse('entrepreneurship_support', 'not_supportive'),
    ],
    startedAt: Date.now() - 300000,
    completedAt: Date.now(),
  };
}

/**
 * Minimal assessment with only a few responses
 */
function createMinimalAssessment(): AssessmentResult {
  return {
    assessmentId: `test_assessment_${Date.now()}`,
    studentId: TEST_STUDENT_ID,
    responses: [
      createMockResponse('decision_maker', 'myself'),
      createMockResponse('financial_constraints', 'some_constraint'),
    ],
    startedAt: Date.now() - 60000,
    completedAt: Date.now(),
  };
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('DecisionCoalitionEngine', () => {
  let engine: DecisionCoalitionEngine;

  beforeEach(() => {
    engine = createDecisionCoalitionEngine();
  });

  // ========================================================================
  // BASIC COALITION FORMATION
  // ========================================================================

  describe('Basic Coalition Formation', () => {
    it('should form coalition from traditional family assessment', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);

      expect(result.success).toBe(true);
      expect(result.coalition).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should create coalition with correct structure', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.id).toBeDefined();
      expect(coalition.studentId).toBe(TEST_STUDENT_ID);
      expect(coalition.version).toBe(1);
      expect(coalition.timestamp).toBeGreaterThan(0);
      expect(coalition.stakeholders).toBeInstanceOf(Array);
      expect(coalition.pressures).toBeDefined();
      expect(coalition.dynamics).toBeDefined();
      expect(coalition.parentReportData).toBeDefined();
    });

    it('should fail gracefully with empty assessment', () => {
      const assessment = createEmptyCoalitionAssessment(TEST_STUDENT_ID);
      const result = engine.formCoalition(assessment);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.coalition).toBeUndefined();
    });

    it('should generate correct statistics', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);

      expect(result.stats.questionsProcessed).toBe(assessment.responses.length);
      expect(result.stats.factorsAssessed).toBe(7); // All 7 pressure factors
      expect(result.stats.evidenceItemsGenerated).toBeGreaterThan(0);
      expect(result.stats.averageConfidence).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // ALL 7 PRESSURE FACTORS
  // ========================================================================

  describe('All 7 Pressure Factors', () => {
    it('should have all 7 pressure factors defined', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.studentWeight).toBeDefined();
      expect(pressures.parentWeight).toBeDefined();
      expect(pressures.familyInfluence).toBeDefined();
      expect(pressures.financialPressure).toBeDefined();
      expect(pressures.incomeUrgency).toBeDefined();
      expect(pressures.riskTolerance).toBeDefined();
      expect(pressures.careerFlexibility).toBeDefined();
    });

    it('should assess all 7 factors from full assessment', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      const factorKeys = Object.keys(pressures) as (keyof CoalitionPressures)[];
      for (const factor of factorKeys) {
        expect(typeof pressures[factor].value).toBe('number');
        expect(typeof pressures[factor].confidence).toBe('number');
        expect(typeof pressures[factor].evidenceCount).toBe('number');
        expect(Array.isArray(pressures[factor].evidence)).toBe(true);
        expect(typeof pressures[factor].explanation).toBe('string');
      }
    });

    it('should have values between 0 and 1 for all factors', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      const factorKeys = Object.keys(pressures) as (keyof CoalitionPressures)[];
      for (const factor of factorKeys) {
        expect(pressures[factor].value).toBeGreaterThanOrEqual(0);
        expect(pressures[factor].value).toBeLessThanOrEqual(1);
        expect(pressures[factor].confidence).toBeGreaterThanOrEqual(0);
        expect(pressures[factor].confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Student Weight Factor', () => {
    it('should detect high student weight in progressive families', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.studentWeight.value).toBeGreaterThan(0.6);
    });

    it('should detect low student weight in traditional families', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.studentWeight.value).toBeLessThan(0.5);
    });
  });

  describe('Parent Weight Factor', () => {
    it('should detect high parent weight in traditional families', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.parentWeight.value).toBeGreaterThan(0.5);
    });

    it('should detect lower parent weight when student decides', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.parentWeight.value).toBeLessThan(0.5);
    });
  });

  describe('Financial Pressure Factor', () => {
    it('should detect high financial pressure in constrained families', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.financialPressure.value).toBeGreaterThan(0.7);
    });

    it('should detect low financial pressure in well-off families', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.financialPressure.value).toBeLessThan(0.3);
    });
  });

  describe('Income Urgency Factor', () => {
    it('should detect high income urgency when family is dependent', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.incomeUrgency.value).toBeGreaterThan(0.7);
    });

    it('should detect low income urgency when no dependence', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.incomeUrgency.value).toBeLessThan(0.3);
    });
  });

  describe('Family Influence Factor', () => {
    it('should detect high family influence in joint families', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.familyInfluence.value).toBeGreaterThan(0.5);
    });

    it('should detect low family influence in nuclear families', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.familyInfluence.value).toBeLessThan(0.5);
    });
  });

  describe('Risk Tolerance Factor', () => {
    it('should detect low risk tolerance in conservative families', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.riskTolerance.value).toBeLessThan(0.5);
    });

    it('should detect higher risk tolerance in progressive families', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.riskTolerance.value).toBeGreaterThan(0.5);
    });
  });

  describe('Career Flexibility Factor', () => {
    it('should detect low flexibility in traditional families', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.careerFlexibility.value).toBeLessThan(0.4);
    });

    it('should detect high flexibility in progressive families', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const pressures = result.coalition!.pressures;

      expect(pressures.careerFlexibility.value).toBeGreaterThan(0.6);
    });
  });

  // ========================================================================
  // STAKEHOLDER IDENTIFICATION
  // ========================================================================

  describe('Stakeholder Identification', () => {
    it('should identify student stakeholder', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const stakeholders = result.coalition!.stakeholders;

      const student = stakeholders.find(s => s.type === 'STUDENT');
      expect(student).toBeDefined();
      expect(student!.name).toBe('Student');
    });

    it('should identify parent stakeholder', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const stakeholders = result.coalition!.stakeholders;

      const parent = stakeholders.find(s => s.type === 'PARENT_PRIMARY');
      expect(parent).toBeDefined();
      expect(parent!.name).toBe('Parents');
    });

    it('should include extended family when influence is significant', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const stakeholders = result.coalition!.stakeholders;

      const extendedFamily = stakeholders.find(s => s.type === 'EXTENDED_FAMILY');
      expect(extendedFamily).toBeDefined();
    });

    it('should not include extended family when influence is low', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const stakeholders = result.coalition!.stakeholders;

      const extendedFamily = stakeholders.find(s => s.type === 'EXTENDED_FAMILY');
      expect(extendedFamily).toBeUndefined();
    });

    it('should assign correct weights to stakeholders', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const stakeholders = result.coalition!.stakeholders;

      const student = stakeholders.find(s => s.type === 'STUDENT');
      const parent = stakeholders.find(s => s.type === 'PARENT_PRIMARY');

      expect(student!.weight).toBeGreaterThan(0);
      expect(parent!.weight).toBeGreaterThan(0);
      expect(student!.weight + parent!.weight).toBeGreaterThan(0.5);
    });
  });

  // ========================================================================
  // COALITION DYNAMICS
  // ========================================================================

  describe('Coalition Dynamics', () => {
    it('should detect parent-dominated power balance', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const dynamics = result.coalition!.dynamics;

      expect(dynamics.powerBalance).toContain('Parent');
    });

    it('should detect student-led power balance', () => {
      const assessment = createProgressiveFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const dynamics = result.coalition!.dynamics;

      expect(dynamics.powerBalance).toContain('Student');
    });

    it('should identify conflict areas when present', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const dynamics = result.coalition!.dynamics;

      expect(dynamics.conflictAreas.length).toBeGreaterThan(0);
    });

    it('should calculate stakeholder alignment', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const dynamics = result.coalition!.dynamics;

      expect(dynamics.stakeholderAlignment).toBeGreaterThanOrEqual(0);
      expect(dynamics.stakeholderAlignment).toBeLessThanOrEqual(1);
    });

    it('should identify primary decision maker', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const dynamics = result.coalition!.dynamics;

      expect(['STUDENT', 'PARENT_PRIMARY', 'EXTENDED_FAMILY']).toContain(
        dynamics.primaryDecisionMaker
      );
    });
  });

  // ========================================================================
  // EXPLAINABILITY FUNCTIONS
  // ========================================================================

  describe('Explainability Functions', () => {
    it('should explain student weight factor', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const explanation = engine.explainFactor(coalition, 'studentWeight');
      
      expect(explanation).toContain('Student Decision Weight');
      expect(explanation).toContain('because');
      expect(explanation.length).toBeGreaterThan(20);
    });

    it('should explain parent weight factor', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const explanation = engine.explainFactor(coalition, 'parentWeight');
      
      expect(explanation).toContain('Parent Influence');
      expect(explanation).toContain('because');
    });

    it('should handle explanation for factor with no evidence', () => {
      const assessment = createMinimalAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const explanation = engine.explainFactor(coalition, 'familyInfluence');
      
      expect(explanation).toContain('No assessment data available');
    });

    it('should explain all factors', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const explanations = engine.explainAllFactors(coalition);
      
      expect(explanations['Student Decision Weight']).toBeDefined();
      expect(explanations['Parent Influence']).toBeDefined();
      expect(explanations['Financial Pressure']).toBeDefined();
      expect(Object.keys(explanations)).toHaveLength(7);
    });

    it('should include confidence in explanations', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const explanation = engine.explainFactor(coalition, 'studentWeight');
      
      expect(explanation).toContain('confidence');
      expect(explanation).toContain('%');
    });
  });

  // ========================================================================
  // PARENT REPORT GENERATION
  // ========================================================================

  describe('Parent Report Generation', () => {
    it('should generate parent report', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const report = engine.generateParentReport(coalition);
      
      expect(report.summary).toBeDefined();
      expect(report.theirInfluence).toBeDefined();
      expect(report.studentPerspective).toBeDefined();
      expect(report.financialContext).toBeDefined();
      expect(report.conversationGuide).toBeInstanceOf(Array);
    });

    it('should acknowledge high parent influence in report', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const report = engine.generateParentReport(coalition);
      
      expect(report.theirInfluence).toContain('significant influence');
    });

    it('should provide financial guidance in report', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const report = engine.generateParentReport(coalition);
      
      expect(report.financialContext).toContain('significantly');
    });

    it('should provide conversation starters', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const report = engine.generateParentReport(coalition);
      
      expect(report.conversationGuide.length).toBeGreaterThan(0);
      expect(report.conversationGuide[0]).toContain('?');
    });
  });

  // ========================================================================
  // FAMILY OBLIGATIONS
  // ========================================================================

  describe('Family Obligations', () => {
    it('should calculate financial obligations when urgent', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const obligations = result.coalition!.familyObligations;

      const financialObligation = obligations.find(o => o.type === 'FINANCIAL_SUPPORT');
      expect(financialObligation).toBeDefined();
    });

    it('should calculate status obligations when family influence is high', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const obligations = result.coalition!.familyObligations;

      const statusObligation = obligations.find(o => o.type === 'STATUS_MAINTENANCE');
      expect(statusObligation).toBeDefined();
    });

    it('should include obligation timeline', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const obligations = result.coalition!.familyObligations;

      if (obligations.length > 0) {
        expect(['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM']).toContain(obligations[0].timeline);
      }
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('should handle assessment with unknown question IDs', () => {
      const assessment: AssessmentResult = {
        assessmentId: 'test',
        studentId: TEST_STUDENT_ID,
        responses: [
          createMockResponse('unknown_question', 'some_value'),
        ],
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      const result = engine.formCoalition(assessment);
      
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle partial assessment gracefully', () => {
      const assessment = createMinimalAssessment();
      const result = engine.formCoalition(assessment);

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should maintain evidence count accuracy', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const factorKeys = Object.keys(coalition.pressures) as (keyof CoalitionPressures)[];
      for (const factor of factorKeys) {
        expect(coalition.pressures[factor].evidence.length).toBe(
          coalition.pressures[factor].evidenceCount
        );
      }
    });

    it('should respect max confidence limit', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      const maxConfidence = DEFAULT_COALITION_SCORING.confidence.maxConfidence;
      const factorKeys = Object.keys(coalition.pressures) as (keyof CoalitionPressures)[];
      
      for (const factor of factorKeys) {
        expect(coalition.pressures[factor].confidence).toBeLessThanOrEqual(maxConfidence);
      }
    });
  });

  // ========================================================================
  // CONVENIENCE FUNCTIONS
  // ========================================================================

  describe('Convenience Functions', () => {
    it('formDecisionCoalition should work as standalone function', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = formDecisionCoalition(assessment);

      expect(result.success).toBe(true);
      expect(result.coalition).toBeDefined();
    });

    it('createEmptyCoalitionAssessment should create valid empty assessment', () => {
      const assessment = createEmptyCoalitionAssessment(TEST_STUDENT_ID);

      expect(assessment.studentId).toBe(TEST_STUDENT_ID);
      expect(assessment.responses).toHaveLength(0);
    });
  });

  // ========================================================================
  // DEBUG MODE
  // ========================================================================

  describe('Debug Mode', () => {
    it('should not log when debug mode is disabled', () => {
      const engine = createDecisionCoalitionEngine({ debugMode: false });
      const assessment = createTraditionalFamilyAssessment();
      
      engine.formCoalition(assessment);
      
      expect(engine.getDebugLog()).toHaveLength(0);
    });

    it('should log when debug mode is enabled', () => {
      const engine = createDecisionCoalitionEngine({ debugMode: true });
      const assessment = createTraditionalFamilyAssessment();
      
      engine.formCoalition(assessment);
      
      expect(engine.getDebugLog().length).toBeGreaterThan(0);
    });

    it('should log structured data', () => {
      const engine = createDecisionCoalitionEngine({ debugMode: true });
      const assessment = createTraditionalFamilyAssessment();
      
      engine.formCoalition(assessment);
      
      const logs = engine.getDebugLog();
      expect(logs.length).toBeGreaterThan(0);
      
      for (const log of logs) {
        const parsed = JSON.parse(log);
        expect(parsed.message).toBeDefined();
        expect(parsed.timestamp).toBeDefined();
      }
    });
  });

  // ========================================================================
  // INDIA-FIRST SPECIFIC TESTS
  // ========================================================================

  describe('India-First Architecture', () => {
    it('should model joint family dynamics', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.pressures.familyInfluence.value).toBeGreaterThan(0.4);
    });

    it('should model education loan pressure', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.pressures.financialPressure.value).toBeGreaterThan(0.5);
    });

    it('should model prestige career pressure', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.pressures.careerFlexibility.value).toBeLessThan(0.5);
    });

    it('should include income urgency for dependent families', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.pressures.incomeUrgency.value).toBeGreaterThan(0.5);
    });

    it('should prepare parent report data for future portal', () => {
      const assessment = createTraditionalFamilyAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.parentReportData.canShowToParents).toBe(true);
      expect(coalition.parentReportData.parentSummary).toBeDefined();
      expect(coalition.parentReportData.conversationStarters.length).toBeGreaterThan(0);
    });

    it('should calculate family obligations for future use', () => {
      const assessment = createFinanciallyConstrainedAssessment();
      const result = engine.formCoalition(assessment);
      const coalition = result.coalition!;

      expect(coalition.familyObligations).toBeInstanceOf(Array);
      expect(coalition.familyObligations.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// EXAMPLE OUTPUT VALIDATION
// ============================================================================

describe('Example Output Validation', () => {
  it('should produce output matching documented format', () => {
    const engine = createDecisionCoalitionEngine();
    const assessment = createTraditionalFamilyAssessment();
    const result = formDecisionCoalition(assessment);
    const coalition = result.coalition!;

    // Validate parentWeight structure
    const parentWeight = coalition.pressures.parentWeight;
    
    expect(typeof parentWeight.value).toBe('number');
    expect(typeof parentWeight.confidence).toBe('number');
    expect(typeof parentWeight.evidenceCount).toBe('number');
    expect(parentWeight.explanation).toBeDefined();
    
    expect(parentWeight.value).toBeGreaterThanOrEqual(0);
    expect(parentWeight.value).toBeLessThanOrEqual(1);
    expect(parentWeight.confidence).toBeGreaterThanOrEqual(0);
    expect(parentWeight.confidence).toBeLessThanOrEqual(1);

    // Example from requirements:
    // "Parent influence is high because the user indicated 
    //  major decisions are usually discussed with family."
    const explanation = engine.explainFactor(coalition, 'parentWeight');
    expect(explanation.toLowerCase()).toContain('parent');
    expect(explanation.toLowerCase()).toContain('because');
  });
});
