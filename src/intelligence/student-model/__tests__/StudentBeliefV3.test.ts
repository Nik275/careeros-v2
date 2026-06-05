/**
 * StudentBelief V3 Unit Tests
 *
 * Comprehensive test suite for the V3 StudentBelief implementation
 * including all four reality domains and migration from V2.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceSource } from '../../types';
import type {
  StudentBelief,
  StudentBeliefV3,
  FamilyReality,
  EconomicReality,
  EducationalReality,
  DecisionState,
  Motivation,
  Strength,
  Value,
  Evidence,
} from '../../types';
import {
  StudentBeliefV3Builder,
  StudentBeliefV3Query,
  migrateV2ToV3,
  createStudentBeliefV3,
  queryStudentBeliefV3,
  isStudentBeliefV3,
  type FamilyRealityInput,
  type EconomicRealityInput,
  type EducationalRealityInput,
  type DecisionStateInput,
  type V2ToV3MigrationResult,
} from '../StudentBeliefV3';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createMockV2Belief(): StudentBelief {
  const evidence: Evidence = {
    id: 'evidence_test_1',
    source: EvidenceSource.DIRECT_ASSESSMENT,
    rawData: JSON.stringify({ test: 'data' }),
    timestamp: Date.now(),
    confidence: 0.8,
    explanation: 'Test evidence',
  };

  return {
    id: 'belief_v2_test_123',
    studentId: 'student_test_123',
    version: 2,
    timestamp: Date.now() - 86400000, // 1 day ago
    motivations: [{
      id: 'motivation_impact',
      name: 'Making a Difference',
      description: 'Helping people and solving problems',
      strength: 0.8,
      evidence: [evidence],
      isExplicit: true,
    }],
    strengths: [{
      id: 'strength_analytical',
      name: 'Analytical Thinking',
      category: 'COGNITIVE',
      description: 'Breaking down complex problems',
      level: 0.75,
      evidence: [evidence],
      isSelfReported: true,
    }],
    values: [{
      id: 'value_growth',
      name: 'Continuous Growth',
      description: 'Always learning and evolving',
      importance: 0.85,
      evidence: [evidence],
      isNonNegotiable: false,
    }],
    personalityTraits: [{
      id: 'trait_structured',
      name: 'Structured & Organized',
      dimension: 'CONSCIENTIOUSNESS',
      position: 0.7,
      confidence: 0.75,
      evidence: [evidence],
    }],
    lifestylePreferences: [{
      id: 'lifestyle_office',
      name: 'Office Environment',
      category: 'WORK_ENVIRONMENT',
      description: 'Preferred work environment: Office & team environment',
      preference: 'Office & team environment',
      importance: 0.75,
      evidence: [evidence],
    }],
    constraints: [{
      id: 'constraint_location',
      name: 'Location Constraint',
      type: 'GEOGRAPHIC',
      description: 'Must stay in current city',
      severity: 0.6,
      evidence: [evidence],
      isHardConstraint: false,
    }],
    overallConfidence: 0.78,
    isValidated: false,
    metadata: {
      assessmentQuestionCount: 25,
      inferenceStepCount: 5,
      contributingEngines: ['assessment', 'inference'],
      assessmentDuration: 180000, // 3 minutes
    },
  };
}

function createMockFamilyRealityInput(): FamilyRealityInput {
  return {
    structureType: 'NUCLEAR',
    dependentCount: 0,
    isPrimaryBreadwinner: false,
    householdMembers: [
      { relationship: 'FATHER', isEarning: true, requiresSupport: false, providesSupport: true },
      { relationship: 'MOTHER', isEarning: false, requiresSupport: false, providesSupport: false },
    ],
    obligations: [{
      type: 'CONTRIBUTION',
      description: 'Expected to contribute to family income after graduation',
      duration: 'UNTIL_EVENT',
      isNegotiable: true,
      impactOnFlexibility: 0.4,
    }],
    parentalExpectations: [{
      source: 'FATHER',
      expectedField: 'Engineering',
      strength: 'MODERATE',
      isExplicit: true,
      pressureLevel: 0.5,
    }],
    support: [{
      type: 'FINANCIAL',
      description: 'Parents will pay for education',
      financialValue: { amount: 500000, period: 'ONE_TIME' },
      reliability: 0.9,
      expectedDuration: 'Until graduation',
    }],
    culturalConstraints: [],
    overallInfluence: 0.5,
    isMajorFactor: true,
    evidence: [{
      id: 'evidence_family_1',
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ familyAssessment: true }),
      timestamp: Date.now(),
      confidence: 0.8,
      explanation: 'Family reality assessment data',
    }],
  };
}

function createMockEconomicRealityInput(): EconomicRealityInput {
  return {
    familyIncomeBracket: '6_TO_12_LAKH',
    locationType: 'TIER_2',
    monthlyDiscretionaryBudget: 10000,
    availableSavings: 150000,
    emergencyFundMonths: 3,
    hasOwnIncome: false,
    fundingSources: [{
      type: 'FAMILY_SAVINGS',
      amount: 500000,
      duration: '4 years',
      reliability: 0.9,
    }],
    loans: [],
    scholarships: [],
    constraints: [{
      type: 'TUITION_FEES',
      description: 'Cannot afford private colleges with high fees',
      impact: 0.6,
      hasWorkaround: true,
      workaroundDescription: 'Education loans available',
    }],
    resources: {
      monthlySkillBudget: 2000,
      certificationBudget: 10000,
      technologyAccess: 'FULL',
      mentorshipAccess: 'LIMITED',
      timeAvailability: 25,
      canRelocate: false,
    },
    riskTolerance: {
      canPursuePassion: false,
      canAffordRetraining: false,
      canAffordEntrepreneurship: false,
      canAffordUnpaidWork: false,
      canAffordDelayedROI: false,
      financialRunwayMonths: 6,
      riskToleranceScore: 0.3,
    },
    overallBarrierScore: 0.5,
    isMajorFactor: true,
    evidence: [{
      id: 'evidence_economic_1',
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ economicAssessment: true }),
      timestamp: Date.now(),
      confidence: 0.75,
      explanation: 'Economic reality assessment data',
    }],
  };
}

function createMockEducationalRealityInput(): EducationalRealityInput {
  return {
    stream: 'SCIENCE_PCM',
    board: 'CBSE',
    currentLevel: 'HIGHER_SECONDARY',
    currentYear: 12,
    institutionName: 'Delhi Public School',
    institutionTier: 'TIER_2',
    yearsCompleted: 11,
    performance: {
      overallStanding: 'GOOD',
      class10Score: 88,
      class12Score: 85,
      percentile: 75,
      subjectPerformance: [
        { subject: 'Mathematics', score: 92, strength: 'STRONG', careerRelevance: 'HIGH' },
        { subject: 'Physics', score: 85, strength: 'MODERATE', careerRelevance: 'HIGH' },
        { subject: 'Chemistry', score: 78, strength: 'MODERATE', careerRelevance: 'MEDIUM' },
      ],
      achievements: [{
        name: 'Math Olympiad Regional Finalist',
        description: 'Qualified for regional mathematics olympiad',
        year: 2023,
        level: 'DISTRICT',
      }],
    },
    competitiveExams: [{
      examType: 'JEE_MAIN',
      status: 'PREPARING',
      year: 2024,
      expectedInstitutions: ['NIT Trichy', 'NIT Suratkal'],
      reachableTier: 'NIT_IIIT',
    }],
    institutionStanding: {
      tier: 'TIER_2',
      name: 'Delhi Public School',
      placementQuality: 'GOOD',
    },
    learningProfile: {
      primaryStyle: 'MULTIMODAL',
      secondaryStyles: ['VISUAL', 'KINESTHETIC'],
      preferredEnvironment: 'STRUCTURED_CLASSROOM',
      studyHoursPerWeek: 40,
      peakLearningTime: 'MORNING',
      attentionSpanMinutes: 60,
      breakFrequency: 'MODERATE',
      selfDiscipline: 'MODERATE',
    },
    opportunities: [{
      type: 'DEGREE_PROGRAM',
      name: 'B.Tech Computer Science',
      provider: 'NIT Trichy',
      duration: '4 years',
      cost: 800000,
      relevance: 'HIGH',
      isEligible: true,
    }],
    overallPotential: 0.75,
    barriers: ['High competition for top colleges'],
    isMajorFactor: true,
    evidence: [{
      id: 'evidence_educational_1',
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ educationalAssessment: true }),
      timestamp: Date.now(),
      confidence: 0.8,
      explanation: 'Educational reality assessment data',
    }],
  };
}

function createMockDecisionStateInput(): DecisionStateInput {
  return {
    timeline: {
      urgency: 'SHORT_TERM',
      deadlines: [{
        name: 'JEE Main Application',
        description: 'Last date to apply for JEE Main 2024',
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        type: 'APPLICATION_DEADLINE',
        consequence: 'Cannot appear for exam',
        isFlexible: false,
      }],
      currentPhase: 'EVALUATION',
    },
    pressure: {
      factors: [{
        source: 'FAMILY',
        description: 'Parents expect engineering career',
        intensity: 0.6,
        isExternal: true,
        impact: 'HINDERING',
        isMitigable: true,
      }],
      overallPressure: 0.5,
      isUnhealthy: false,
      reportedStressLevel: 0.4,
    },
    information: {
      needs: [{
        category: 'CAREER_OPTIONS',
        description: 'More information about non-engineering careers',
        priority: 'HIGH',
        isCritical: true,
        difficultyToObtain: 'MODERATE',
      }],
      sourcesUsed: ['Internet', 'School counselor', 'Family'],
      hasAdequateResearch: false,
    },
    readiness: {
      components: [{
        aspect: 'SELF_AWARENESS',
        level: 0.7,
        description: 'Good understanding of strengths and interests',
        improvementAreas: ['Explore more career options'],
      }],
      overallReadiness: 0.65,
      category: 'NEARLY_READY',
      canDecideNow: false,
      recommendedPreparation: ['Research alternative careers', 'Talk to professionals'],
    },
    context: {
      lifeSituation: 'IN_SCHOOL',
      emotionalState: 'OPTIMISTIC',
      lifeChanges: [],
      supportSystemAvailable: true,
      decisionCapacity: 'FULL',
      isGoodTiming: true,
    },
    activeDecision: 'Choose stream for higher education',
    alternativesConsidered: ['Engineering', 'Data Science', 'Architecture'],
    isStuck: false,
    evidence: [{
      id: 'evidence_decision_1',
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ decisionAssessment: true }),
      timestamp: Date.now(),
      confidence: 0.75,
      explanation: 'Decision state assessment data',
    }],
  };
}

// ============================================================================
// TEST SUITE: StudentBeliefV3Builder
// ============================================================================

describe('StudentBeliefV3Builder', () => {
  let v2Belief: StudentBelief;
  let builder: StudentBeliefV3Builder;

  beforeEach(() => {
    v2Belief = createMockV2Belief();
    builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);
  });

  describe('Construction', () => {
    it('should create builder with V2 belief', () => {
      expect(builder).toBeDefined();
    });

    it('should copy V2 contributing engines', () => {
      // Build with minimal data to test
      builder
        .addFamilyReality(createMockFamilyRealityInput())
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput());

      const v3Belief = builder.build();
      expect(v3Belief.metadata.contributingEngines).toContain('assessment');
      expect(v3Belief.metadata.contributingEngines).toContain('inference');
    });
  });

  describe('Family Reality', () => {
    it('should add family reality', () => {
      const input = createMockFamilyRealityInput();
      builder.addFamilyReality(input, 0.85);

      const familyReality = (builder as unknown as { familyReality?: FamilyReality }).familyReality;
      expect(familyReality).toBeDefined();
      expect(familyReality?.structure.type).toBe('NUCLEAR');
      expect(familyReality?.obligations).toHaveLength(1);
      expect(familyReality?.parentalExpectations).toHaveLength(1);
    });

    it('should mark family-reality-assessment engine contribution', () => {
      builder.addFamilyReality(createMockFamilyRealityInput());

      const v3Belief = builder
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput())
        .build();

      expect(v3Belief.metadata.contributingEngines).toContain('family-reality-assessment');
    });
  });

  describe('Economic Reality', () => {
    it('should add economic reality', () => {
      const input = createMockEconomicRealityInput();
      builder.addEconomicReality(input, 0.8);

      const economicReality = (builder as unknown as { economicReality?: EconomicReality }).economicReality;
      expect(economicReality).toBeDefined();
      expect(economicReality?.financialSituation.familyIncomeBracket).toBe('6_TO_12_LAKH');
      expect(economicReality?.constraints).toHaveLength(1);
    });

    it('should calculate total education debt correctly', () => {
      const input = createMockEconomicRealityInput();
      input.loans = [
        { amount: 200000, interestRate: 8, monthlyEMI: 5000, remainingMonths: 48, outstandingPrincipal: 180000, isSubsidized: true, impactOnCareer: 'MODERATE' },
        { amount: 100000, interestRate: 10, monthlyEMI: 2500, remainingMonths: 24, outstandingPrincipal: 90000, isSubsidized: false, impactOnCareer: 'LOW' },
      ];

      builder.addEconomicReality(input);

      const economicReality = (builder as unknown as { economicReality?: EconomicReality }).economicReality;
      expect(economicReality?.educationFinancing.totalEducationDebt).toBe(270000);
      expect(economicReality?.educationFinancing.monthlyDebtObligation).toBe(7500);
    });
  });

  describe('Educational Reality', () => {
    it('should add educational reality', () => {
      const input = createMockEducationalRealityInput();
      builder.addEducationalReality(input, 0.9);

      const educationalReality = (builder as unknown as { educationalReality?: EducationalReality }).educationalReality;
      expect(educationalReality).toBeDefined();
      expect(educationalReality?.background.stream).toBe('SCIENCE_PCM');
      expect(educationalReality?.performance.subjectPerformance).toHaveLength(3);
    });

    it('should handle optional institution standing', () => {
      const input = createMockEducationalRealityInput();
      delete (input as unknown as { institutionStanding?: unknown }).institutionStanding;

      builder.addEducationalReality(input);

      const educationalReality = (builder as unknown as { educationalReality?: EducationalReality }).educationalReality;
      expect(educationalReality?.institutionStanding).toBeUndefined();
    });
  });

  describe('Decision State', () => {
    it('should add decision state', () => {
      const input = createMockDecisionStateInput();
      builder.addDecisionState(input, 0.8);

      const decisionState = (builder as unknown as { decisionState?: DecisionState }).decisionState;
      expect(decisionState).toBeDefined();
      expect(decisionState?.timeline.urgency).toBe('SHORT_TERM');
      expect(decisionState?.pressure.factors).toHaveLength(1);
    });

    it('should calculate days remaining for deadlines', () => {
      const input = createMockDecisionStateInput();
      const futureDate = Date.now() + 15 * 24 * 60 * 60 * 1000; // 15 days
      input.timeline.deadlines[0].deadline = futureDate;

      builder.addDecisionState(input);

      const decisionState = (builder as unknown as { decisionState?: DecisionState }).decisionState;
      expect(decisionState?.timeline.daysToNextDecision).toBeGreaterThanOrEqual(14);
      expect(decisionState?.timeline.daysToNextDecision).toBeLessThanOrEqual(16);
    });
  });

  describe('Build', () => {
    it('should build V3 belief with all domains', () => {
      const v3Belief = builder
        .addFamilyReality(createMockFamilyRealityInput())
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput())
        .build();

      expect(v3Belief.version).toBe(3);
      expect(v3Belief.familyReality).toBeDefined();
      expect(v3Belief.economicReality).toBeDefined();
      expect(v3Belief.educationalReality).toBeDefined();
      expect(v3Belief.decisionState).toBeDefined();
    });

    it('should copy V2 psychology data', () => {
      const v3Belief = builder
        .addFamilyReality(createMockFamilyRealityInput())
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput())
        .build();

      expect(v3Belief.motivations).toEqual(v2Belief.motivations);
      expect(v3Belief.strengths).toEqual(v2Belief.strengths);
      expect(v3Belief.values).toEqual(v2Belief.values);
    });

    it('should link to previous V2 belief', () => {
      const v3Belief = builder
        .addFamilyReality(createMockFamilyRealityInput())
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput())
        .build();

      expect(v3Belief.previousVersionId).toBe(v2Belief.id);
    });

    it('should calculate overall confidence', () => {
      const v3Belief = builder
        .addFamilyReality(createMockFamilyRealityInput(), 0.8)
        .addEconomicReality(createMockEconomicRealityInput(), 0.7)
        .addEducationalReality(createMockEducationalRealityInput(), 0.9)
        .addDecisionState(createMockDecisionStateInput(), 0.75)
        .build();

      // Average of 0.78 (V2), 0.8, 0.7, 0.9, 0.75 = 0.786
      expect(v3Belief.overallConfidence).toBeGreaterThan(0.7);
      expect(v3Belief.overallConfidence).toBeLessThan(0.9);
    });

    it('should include migration metadata', () => {
      const v3Belief = builder
        .addFamilyReality(createMockFamilyRealityInput())
        .addEconomicReality(createMockEconomicRealityInput())
        .addEducationalReality(createMockEducationalRealityInput())
        .addDecisionState(createMockDecisionStateInput())
        .build();

      expect(v3Belief.metadata.migratedFromV2).toBeDefined();
      expect(v3Belief.metadata.migratedFromV2?.originalVersion).toBe(2);
      expect(v3Belief.metadata.migratedFromV2?.migrationReason).toContain('Reality Domains');
    });

    it('should throw error if any domain is missing', () => {
      builder.addFamilyReality(createMockFamilyRealityInput());

      expect(() => builder.build()).toThrow('requires all four reality domains');
    });
  });
});

// ============================================================================
// TEST SUITE: V2 to V3 Migration
// ============================================================================

describe('V2 to V3 Migration', () => {
  let v2Belief: StudentBelief;

  beforeEach(() => {
    v2Belief = createMockV2Belief();
  });

  describe('migrateV2ToV3', () => {
    it('should successfully migrate V2 to V3', () => {
      const result = migrateV2ToV3(v2Belief);

      expect(result.success).toBe(true);
      expect(result.v3Belief).toBeDefined();
      expect(result.v3Belief?.version).toBe(3);
    });

    it('should apply all four reality domains by default', () => {
      const result = migrateV2ToV3(v2Belief);

      expect(result.migrationsApplied).toContain('familyReality');
      expect(result.migrationsApplied).toContain('economicReality');
      expect(result.migrationsApplied).toContain('educationalReality');
      expect(result.migrationsApplied).toContain('decisionState');
    });

    it('should allow selective migration', () => {
      const result = migrateV2ToV3(v2Belief, {
        includeFamilyReality: true,
        includeEconomicReality: false,
        includeEducationalReality: false,
        includeDecisionState: false,
      });

      expect(result.migrationsApplied).toEqual(['familyReality']);
    });

    it('should use custom reality data when provided', () => {
      const customFamily: FamilyRealityInput = {
        ...createMockFamilyRealityInput(),
        structureType: 'JOINT',
        dependentCount: 2,
      };

      const result = migrateV2ToV3(v2Belief, {
        customFamilyReality: customFamily,
      });

      expect(result.v3Belief?.familyReality.structure.type).toBe('JOINT');
      expect(result.v3Belief?.familyReality.structure.dependentCount).toBe(2);
    });

    it('should handle errors gracefully', () => {
      // Create a malformed V2 belief
      const malformedV2 = { ...v2Belief, studentId: undefined as unknown as string };

      const result = migrateV2ToV3(malformedV2);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use default confidence for inferred data', () => {
      const result = migrateV2ToV3(v2Belief, { defaultConfidence: 0.5 });

      expect(result.v3Belief?.familyReality.confidence).toBe(0.5);
      expect(result.v3Belief?.economicReality.confidence).toBe(0.5);
    });
  });

  describe('Inference Functions', () => {
    it('should infer family reality from V2 constraints', () => {
      // Add a family constraint to V2
      v2Belief.constraints.push({
        id: 'constraint_family',
        name: 'Family Location',
        type: 'GEOGRAPHIC',
        description: 'Must stay near family',
        severity: 0.7,
        evidence: [],
        isHardConstraint: false,
      });

      const result = migrateV2ToV3(v2Belief);

      expect(result.v3Belief?.familyReality.isMajorFactor).toBe(true);
      expect(result.v3Belief?.familyReality.obligations.length).toBeGreaterThan(0);
    });

    it('should infer economic reality from V2 constraints', () => {
      // Add a financial constraint
      v2Belief.constraints.push({
        id: 'constraint_financial',
        name: 'Financial Limit',
        type: 'FINANCIAL',
        description: 'Limited budget for education',
        severity: 0.8,
        evidence: [],
        isHardConstraint: true,
      });

      const result = migrateV2ToV3(v2Belief);

      expect(result.v3Belief?.economicReality.isMajorFactor).toBe(true);
      expect(result.v3Belief?.economicReality.constraints.length).toBeGreaterThan(0);
    });

    it('should infer educational reality from V2 strengths', () => {
      // Add analytical strength
      v2Belief.strengths.push({
        id: 'strength_math',
        name: 'Mathematics',
        category: 'COGNITIVE',
        description: 'Strong in math',
        level: 0.9,
        evidence: [],
        isSelfReported: true,
      });

      const result = migrateV2ToV3(v2Belief);

      expect(result.v3Belief?.educationalReality.background.stream).toBe('SCIENCE_PCM');
    });

    it('should infer decision state from V2 confidence', () => {
      // Low confidence V2 belief
      v2Belief.overallConfidence = 0.4;

      const result = migrateV2ToV3(v2Belief);

      expect(result.v3Belief?.decisionState.readiness.category).toBe('NEEDS_PREP');
      expect(result.v3Belief?.decisionState.information.needs.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TEST SUITE: StudentBeliefV3Query
// ============================================================================

describe('StudentBeliefV3Query', () => {
  let v3Belief: StudentBeliefV3;
  let query: StudentBeliefV3Query;

  beforeEach(() => {
    const v2Belief = createMockV2Belief();
    v3Belief = createStudentBeliefV3(
      v2Belief.studentId,
      v2Belief,
      {
        family: createMockFamilyRealityInput(),
        economic: createMockEconomicRealityInput(),
        educational: createMockEducationalRealityInput(),
        decision: createMockDecisionStateInput(),
      },
      0.8
    );
    query = queryStudentBeliefV3(v3Belief);
  });

  describe('V2 Compatibility', () => {
    it('should get motivations', () => {
      expect(query.getMotivations()).toHaveLength(1);
      expect(query.getMotivations()[0].name).toBe('Making a Difference');
    });

    it('should get strengths', () => {
      expect(query.getStrengths()).toHaveLength(1);
    });

    it('should get values', () => {
      expect(query.getValues()).toHaveLength(1);
    });

    it('should get personality traits', () => {
      expect(query.getPersonalityTraits()).toHaveLength(1);
    });

    it('should get constraints', () => {
      expect(query.getConstraints()).toHaveLength(1);
    });

    it('should get overall confidence', () => {
      expect(query.getOverallConfidence()).toBeGreaterThan(0);
    });

    it('should check if validated', () => {
      expect(query.isValidated()).toBe(false);
    });
  });

  describe('V3 Reality Domains', () => {
    it('should get family reality', () => {
      expect(query.getFamilyReality().structure.type).toBe('NUCLEAR');
    });

    it('should get economic reality', () => {
      expect(query.getEconomicReality().financialSituation.locationType).toBe('TIER_2');
    });

    it('should get educational reality', () => {
      expect(query.getEducationalReality().background.stream).toBe('SCIENCE_PCM');
    });

    it('should get decision state', () => {
      expect(query.getDecisionState().timeline.urgency).toBe('SHORT_TERM');
    });
  });

  describe('V3 Utility Queries', () => {
    it('should get major decision factors', () => {
      const factors = query.getMajorDecisionFactors();
      expect(factors.length).toBeGreaterThan(0);
      expect(factors[0]).toHaveProperty('domain');
      expect(factors[0]).toHaveProperty('factor');
      expect(factors[0]).toHaveProperty('impact');
    });

    it('should check if ready to decide', () => {
      // Mock decision state shows not ready
      expect(query.isReadyToDecide()).toBe(false);
    });

    it('should get decision urgency', () => {
      expect(query.getDecisionUrgency()).toBe('SHORT_TERM');
    });

    it('should get days to next deadline', () => {
      const days = query.getDaysToNextDeadline();
      expect(days).toBeGreaterThan(0);
    });

    it('should check if under unhealthy pressure', () => {
      expect(query.isUnderUnhealthyPressure()).toBe(false);
    });

    it('should get financial constraints', () => {
      const constraints = query.getFinancialConstraints();
      expect(constraints.length).toBeGreaterThan(0);
    });

    it('should get academic standing', () => {
      expect(query.getAcademicStanding()).toBe('GOOD');
    });

    it('should get raw belief', () => {
      expect(query.getRawBelief().version).toBe(3);
    });
  });

  describe('Type Guard', () => {
    it('should identify V3 belief', () => {
      expect(StudentBeliefV3Query.isV3(v3Belief)).toBe(true);
    });

    it('should not identify V2 belief as V3', () => {
      const v2Belief = createMockV2Belief();
      expect(StudentBeliefV3Query.isV3(v2Belief)).toBe(false);
    });
  });
});

// ============================================================================
// TEST SUITE: Convenience Functions
// ============================================================================

describe('Convenience Functions', () => {
  describe('createStudentBeliefV3', () => {
    it('should create V3 belief from V2 and reality data', () => {
      const v2Belief = createMockV2Belief();

      const v3Belief = createStudentBeliefV3(
        v2Belief.studentId,
        v2Belief,
        {
          family: createMockFamilyRealityInput(),
          economic: createMockEconomicRealityInput(),
          educational: createMockEducationalRealityInput(),
          decision: createMockDecisionStateInput(),
        }
      );

      expect(v3Belief.version).toBe(3);
      expect(v3Belief.studentId).toBe(v2Belief.studentId);
    });

    it('should accept custom confidence', () => {
      const v2Belief = createMockV2Belief();

      const v3Belief = createStudentBeliefV3(
        v2Belief.studentId,
        v2Belief,
        {
          family: createMockFamilyRealityInput(),
          economic: createMockEconomicRealityInput(),
          educational: createMockEducationalRealityInput(),
          decision: createMockDecisionStateInput(),
        },
        0.9
      );

      expect(v3Belief.familyReality.confidence).toBe(0.9);
    });
  });

  describe('queryStudentBeliefV3', () => {
    it('should create query interface', () => {
      const v2Belief = createMockV2Belief();
      const v3Belief = createStudentBeliefV3(
        v2Belief.studentId,
        v2Belief,
        {
          family: createMockFamilyRealityInput(),
          economic: createMockEconomicRealityInput(),
          educational: createMockEducationalRealityInput(),
          decision: createMockDecisionStateInput(),
        }
      );

      const query = queryStudentBeliefV3(v3Belief);
      expect(query).toBeInstanceOf(StudentBeliefV3Query);
    });
  });

  describe('isStudentBeliefV3', () => {
    it('should return true for V3 belief', () => {
      const v2Belief = createMockV2Belief();
      const v3Belief = createStudentBeliefV3(
        v2Belief.studentId,
        v2Belief,
        {
          family: createMockFamilyRealityInput(),
          economic: createMockEconomicRealityInput(),
          educational: createMockEducationalRealityInput(),
          decision: createMockDecisionStateInput(),
        }
      );

      expect(isStudentBeliefV3(v3Belief)).toBe(true);
    });

    it('should return false for V2 belief', () => {
      const v2Belief = createMockV2Belief();
      expect(isStudentBeliefV3(v2Belief)).toBe(false);
    });
  });
});

// ============================================================================
// TEST SUITE: Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty V2 belief', () => {
    const emptyV2: StudentBelief = {
      ...createMockV2Belief(),
      motivations: [],
      strengths: [],
      values: [],
      personalityTraits: [],
      lifestylePreferences: [],
      constraints: [],
      overallConfidence: 0,
    };

    const result = migrateV2ToV3(emptyV2);

    expect(result.success).toBe(true);
    expect(result.v3Belief?.motivations).toHaveLength(0);
  });

  it('should handle multiple loans in economic reality', () => {
    const input = createMockEconomicRealityInput();
    input.loans = [
      { amount: 100000, interestRate: 8, monthlyEMI: 2500, remainingMonths: 48, outstandingPrincipal: 90000, isSubsidized: true, impactOnCareer: 'MODERATE' },
      { amount: 200000, interestRate: 10, monthlyEMI: 5500, remainingMonths: 48, outstandingPrincipal: 180000, isSubsidized: false, impactOnCareer: 'HIGH' },
      { amount: 50000, interestRate: 12, monthlyEMI: 1500, remainingMonths: 24, outstandingPrincipal: 45000, isSubsidized: false, impactOnCareer: 'LOW' },
    ];

    const v2Belief = createMockV2Belief();
    const builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);
    builder.addEconomicReality(input);

    const economicReality = (builder as unknown as { economicReality?: EconomicReality }).economicReality;
    expect(economicReality?.educationFinancing.totalEducationDebt).toBe(315000);
    expect(economicReality?.educationFinancing.monthlyDebtObligation).toBe(9500);
  });

  it('should handle multiple competitive exams', () => {
    const input = createMockEducationalRealityInput();
    input.competitiveExams = [
      { examType: 'JEE_MAIN', status: 'TAKEN_WAITING', year: 2024 },
      { examType: 'JEE_ADVANCED', status: 'PREPARING', year: 2024 },
      { examType: 'BITSAT', status: 'NOT_TAKEN', year: 2024 },
    ];

    const v2Belief = createMockV2Belief();
    const builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);
    builder.addEducationalReality(input);

    const educationalReality = (builder as unknown as { educationalReality?: EducationalReality }).educationalReality;
    expect(educationalReality?.competitiveExams).toHaveLength(3);
  });

  it('should handle decision state with no deadlines', () => {
    const input = createMockDecisionStateInput();
    input.timeline.deadlines = [];

    const v2Belief = createMockV2Belief();
    const builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);
    builder.addDecisionState(input);

    const decisionState = (builder as unknown as { decisionState?: DecisionState }).decisionState;
    expect(decisionState?.timeline.daysToNextDecision).toBe(365);
  });

  it('should handle joint family structure', () => {
    const input = createMockFamilyRealityInput();
    input.structureType = 'JOINT';
    input.dependentCount = 3;
    input.householdMembers = [
      { relationship: 'FATHER', isEarning: true, requiresSupport: false, providesSupport: true },
      { relationship: 'MOTHER', isEarning: false, requiresSupport: false, providesSupport: false },
      { relationship: 'GRANDPARENT', isEarning: false, requiresSupport: true, providesSupport: false },
      { relationship: 'SIBLING', isEarning: false, requiresSupport: true, providesSupport: false, educationLevel: 'Class 10' },
    ];

    const v2Belief = createMockV2Belief();
    const builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);
    builder.addFamilyReality(input);

    const familyReality = (builder as unknown as { familyReality?: FamilyReality }).familyReality;
    expect(familyReality?.structure.type).toBe('JOINT');
    expect(familyReality?.structure.householdMembers).toHaveLength(4);
  });
});
