/**
 * CareerOS Matching Engine V1 Tests
 *
 * Validates deterministic matching between StudentProfile and Careers.
 */

import { describe, it, expect } from 'vitest';
import {
  // Functions
  calculatePsychologicalFit,
  calculateWorkStyleFit,
  calculateMotivationFit,
  calculateConstraintFit,
  matchCareer,
  matchAllCareers,
  matchStudentToCareers,
  createNeutralWorkStylePreference,
  inferWorkStylePreference,

  // Types
  type WorkStylePreference,
  type MatchingInput,
  type CareerMatch,
} from '../index';

import type { Career, PsychologicalProfile, WorkStyleProfile, RewardProfile } from '../../../domains/career/Career';
import type { StudentProfile, PsychologyProfile, Motivations, RealityConstraints } from '../../../domains/student/StudentProfile';
import {
  FamilyIncomeBracket,
  FamilyPressure,
  LocationType,
  LanguageComfort,
  CoachingAccess,
  EducationStage,
  GradeScale,
} from '../../../domains/student/StudentProfile';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockStudentPsychology = (overrides: Partial<PsychologyProfile> = {}): PsychologyProfile => ({
  analyticalThinking: 0.7,
  creativity: 0.6,
  socialOrientation: 0.5,
  leadership: 0.6,
  detailOrientation: 0.8,
  curiosity: 0.7,
  competitiveness: 0.5,
  riskTolerance: 0.6,
  ...overrides,
});

const createMockMotivations = (overrides: Partial<Motivations> = {}): Motivations => ({
  money: 0.7,
  impact: 0.6,
  status: 0.5,
  freedom: 0.8,
  stability: 0.4,
  ...overrides,
});

const createMockConstraints = (overrides: Partial<RealityConstraints> = {}): RealityConstraints => ({
  financial: {
    familyIncomeBracket: FamilyIncomeBracket.BETWEEN_6_12_LPA,
    hasPersonalIncome: false,
    hasEducationLoan: false,
    canAffordCoaching: true,
    canAffordPrivateCollege: false,
    ...overrides.financial,
  },
  family: {
    familyPressure: FamilyPressure.MILD,
    isFirstGeneration: false,
    dependentCount: 0,
    expectedToContribute: false,
    mustStayNearFamily: false,
    ...overrides.family,
  },
  geographic: {
    locationType: LocationType.TIER_2_CITY,
    willingToRelocate: true,
    ...overrides.geographic,
  },
  accessibility: {
    languageComfort: LanguageComfort.FUNCTIONAL_ENGLISH,
    nativeLanguage: 'Hindi',
    coachingAccess: CoachingAccess.MODERATE,
    hasInternetAccess: true,
    hasLearningDevice: true,
    localInstitutionQuality: 'good',
    ...overrides.accessibility,
  },
});

const createMockCareer = (overrides: Partial<Career> = {}): Career => ({
  id: 'software-engineer',
  name: 'Software Engineer',
  slug: 'software-engineer',
  category: 'technology' as any,
  description: 'Builds software applications and systems.',
  tagline: 'Code the future',
  psychologicalProfile: {
    analyticalThinking: 0.9,
    creativity: 0.6,
    socialOrientation: 0.4,
    leadership: 0.5,
    detailOrientation: 0.8,
    curiosity: 0.9,
    competitiveness: 0.6,
    riskTolerance: 0.5,
    ...overrides.psychologicalProfile,
  },
  workStyle: {
    remoteWork: 0.8,
    officeWork: 0.3,
    fieldWork: 0.0,
    travelRequirement: 0.2,
    teamOrientation: 0.6,
    soloOrientation: 0.4,
    structuredEnvironment: 0.5,
    unstructuredEnvironment: 0.5,
    ...overrides.workStyle,
  },
  rewardProfile: {
    incomePotential: 0.9,
    statusPotential: 0.7,
    impactPotential: 0.6,
    freedomPotential: 0.8,
    stabilityPotential: 0.7,
    ...overrides.rewardProfile,
  },
  riskProfile: {
    burnoutRisk: 0.6,
    automationRisk: 0.3,
    competitionLevel: 0.7,
    incomeVolatility: 0.4,
    ...overrides.riskProfile,
  },
  optionality: {
    careerFlexibility: 0.9,
    transferableSkills: 0.9,
    entrepreneurshipPotential: 0.8,
    ...overrides.optionality,
  },
  education: {
    minimumLevel: 'bachelors' as any,
    typicalDegrees: ['B.Tech', 'B.E.', 'B.Sc CS'] as any[],
    certifications: [],
    ...overrides.education,
  },
  indiaReality: {
    coachingDependency: 0.2,
    urbanAdvantage: 0.6,
    englishDependency: 0.6,
    migrationRequirement: 0.2,
    reservationApplicable: false,
    ...overrides.indiaReality,
  },
  evolution: {
    adjacentCareers: [],
    futureCareerPaths: [],
    ...overrides.evolution,
  },
  salary: {
    entrySalaryIndia: { min: 400000, max: 1500000, median: 800000 },
    midCareerSalaryIndia: { min: 1200000, max: 4000000, median: 2500000 },
    seniorSalaryIndia: { min: 3000000, max: 10000000, median: 6000000 },
    ...overrides.salary,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  schemaVersion: 1,
  ...overrides,
});

// ============================================================================
// PSYCHOLOGICAL FIT TESTS
// ============================================================================

describe('calculatePsychologicalFit', () => {
  it('should return perfect score for identical profiles', () => {
    const psychology = createMockStudentPsychology();
    const result = calculatePsychologicalFit(psychology, psychology);

    expect(result.score).toBeGreaterThan(0.95);
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('should identify analytical thinking match', () => {
    const student = createMockStudentPsychology({ analyticalThinking: 0.9 });
    const career = createMockCareer({
      psychologicalProfile: {
        ...createMockStudentPsychology(),
        analyticalThinking: 0.9,
      },
    });

    const result = calculatePsychologicalFit(student, career.psychologicalProfile);

    const analyticalMatch = result.matches.find((m) => m.trait === 'Analytical Thinking');
    expect(analyticalMatch).toBeDefined();
    expect(analyticalMatch!.matchScore).toBeCloseTo(1.0);
  });

  it('should identify social orientation mismatch', () => {
    const student = createMockStudentPsychology({ socialOrientation: 0.2 }); // Low social
    const career = createMockCareer({
      psychologicalProfile: {
        ...createMockStudentPsychology(),
        socialOrientation: 0.9, // High social required
      },
    });

    const result = calculatePsychologicalFit(student, career.psychologicalProfile);

    const socialMismatch = result.mismatches.find((m) => m.trait === 'Social Orientation');
    expect(socialMismatch).toBeDefined();
    expect(socialMismatch!.matchScore).toBeLessThan(0.5);
  });

  it('should weight career-important traits more heavily', () => {
    const student = createMockStudentPsychology({ analyticalThinking: 0.5, socialOrientation: 0.9 });
    const career = createMockCareer({
      psychologicalProfile: {
        ...createMockStudentPsychology(),
        analyticalThinking: 0.9, // Very important
        socialOrientation: 0.3, // Less important
      },
    });

    const result = calculatePsychologicalFit(student, career.psychologicalProfile);

    // Score should still be reasonable since we matched well on 7/8 traits
    expect(result.score).toBeGreaterThan(0.6);
  });

  it('should be deterministic', () => {
    const student = createMockStudentPsychology();
    const career = createMockCareer();

    const result1 = calculatePsychologicalFit(student, career.psychologicalProfile);
    const result2 = calculatePsychologicalFit(student, career.psychologicalProfile);

    expect(result1.score).toBe(result2.score);
    expect(result1.matches.length).toBe(result2.matches.length);
  });
});

// ============================================================================
// WORK STYLE FIT TESTS
// ============================================================================

describe('calculateWorkStyleFit', () => {
  it('should match remote work preference to remote-friendly career', () => {
    const preference: WorkStylePreference = {
      remoteWork: 0.9,
      officeWork: 0.2,
      fieldWork: 0.1,
      travelComfort: 0.5,
      teamPreference: 0.5,
      structurePreference: 0.5,
    };

    const career = createMockCareer({
      workStyle: {
        ...createMockCareer().workStyle,
        remoteWork: 0.8,
        officeWork: 0.2,
      },
    });

    const result = calculateWorkStyleFit(preference, career.workStyle);

    const remoteMatch = result.matches.find((m) => m.trait === 'Remote Work');
    expect(remoteMatch).toBeDefined();
    expect(remoteMatch!.matchScore).toBeGreaterThan(0.8);
  });

  it('should flag work style mismatches', () => {
    const preference: WorkStylePreference = {
      remoteWork: 0.9, // Wants remote
      officeWork: 0.1,
      fieldWork: 0.0,
      travelComfort: 0.2,
      teamPreference: 0.8,
      structurePreference: 0.7,
    };

    const career = createMockCareer({
      workStyle: {
        ...createMockCareer().workStyle,
        remoteWork: 0.1, // Office-based
        officeWork: 0.9,
        travelRequirement: 0.8, // Lots of travel
      },
    });

    const result = calculateWorkStyleFit(preference, career.workStyle);

    expect(result.mismatches.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(0.6);
  });

  it('should calculate average score correctly', () => {
    const preference = createNeutralWorkStylePreference();
    const career = createMockCareer();

    const result = calculateWorkStyleFit(preference, career.workStyle);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});

// ============================================================================
// MOTIVATION FIT TESTS
// ============================================================================

describe('calculateMotivationFit', () => {
  it('should match high money motivation to high income career', () => {
    const motivations = createMockMotivations({ money: 0.9 });
    const career = createMockCareer({
      rewardProfile: {
        ...createMockCareer().rewardProfile,
        incomePotential: 0.9,
      },
    });

    const result = calculateMotivationFit(motivations, career.rewardProfile);

    const moneyMatch = result.matches.find((m) => m.motivation === 'Income Potential');
    expect(moneyMatch).toBeDefined();
    expect(moneyMatch!.matchScore).toBeGreaterThan(0.8);
  });

  it('should flag when student highly values what career lacks', () => {
    const motivations = createMockMotivations({ stability: 0.9 }); // Wants stability
    const career = createMockCareer({
      rewardProfile: {
        ...createMockCareer().rewardProfile,
        stabilityPotential: 0.3, // Low stability
      },
    });

    const result = calculateMotivationFit(motivations, career.rewardProfile);

    const stabilityMismatch = result.mismatches.find((m) => m.motivation === 'Stability Potential');
    expect(stabilityMismatch).toBeDefined();
    expect(stabilityMismatch!.matchScore).toBeLessThan(0.6);
  });

  it('should be lenient for low-importance motivations', () => {
    const motivations = createMockMotivations({ status: 0.1 }); // Doesn't care about status
    const career = createMockCareer({
      rewardProfile: {
        ...createMockCareer().rewardProfile,
        statusPotential: 0.9, // High status career
      },
    });

    const result = calculateMotivationFit(motivations, career.rewardProfile);

    // Should not be a mismatch since student doesn't care
    const statusMatch = result.mismatches.find((m) => m.motivation === 'Status Potential');
    expect(statusMatch).toBeUndefined();
  });
});

// ============================================================================
// CONSTRAINT FIT TESTS
// ============================================================================

describe('calculateConstraintFit', () => {
  it('should pass when all constraints satisfied', () => {
    const constraints = createMockConstraints();
    const career = createMockCareer();

    const result = calculateConstraintFit(constraints, career);

    expect(result.score).toBeGreaterThanOrEqual(0.9);
    expect(result.results.filter((r) => !r.isSatisfied).length).toBe(0);
  });

  it('should flag coaching dependency constraint', () => {
    const constraints = createMockConstraints({
      financial: { canAffordCoaching: false },
    });
    const career = createMockCareer({
      indiaReality: { coachingDependency: 0.8 }, // High coaching dependency
    });

    const result = calculateConstraintFit(constraints, career);

    const coachingResult = result.results.find((r) => r.constraint === 'Coaching Access');
    expect(coachingResult).toBeDefined();
    expect(coachingResult!.isSatisfied).toBe(false);
    expect(result.score).toBeLessThan(1);
  });

  it('should flag location constraint for non-relocating student', () => {
    const constraints = createMockConstraints({
      geographic: { willingToRelocate: false, locationType: LocationType.RURAL },
    });
    const career = createMockCareer({
      indiaReality: { urbanAdvantage: 0.9 }, // Requires urban
    });

    const result = calculateConstraintFit(constraints, career);

    const locationResult = result.results.find((r) => r.constraint === 'Urban Location');
    expect(locationResult).toBeDefined();
    expect(locationResult!.isSatisfied).toBe(false);
  });

  it('should flag English requirement for limited English speaker', () => {
    const constraints = createMockConstraints({
      accessibility: { languageComfort: LanguageComfort.NATIVE_ONLY },
    });
    const career = createMockCareer({
      indiaReality: { englishDependency: 0.9 }, // Requires English
    });

    const result = calculateConstraintFit(constraints, career);

    const englishResult = result.results.find((r) => r.constraint === 'English Proficiency');
    expect(englishResult).toBeDefined();
    expect(englishResult!.isSatisfied).toBe(false);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('matchCareer', () => {
  const createMatchingInput = (overrides: Partial<MatchingInput> = {}): MatchingInput => ({
    psychology: createMockStudentPsychology(),
    motivations: createMockMotivations(),
    constraints: createMockConstraints(),
    workStylePreference: createNeutralWorkStylePreference(),
    ...overrides,
  });

  it('should return valid CareerMatch structure', () => {
    const input = createMatchingInput();
    const career = createMockCareer();

    const result = matchCareer(input, career);

    expect(result.careerId).toBe(career.id);
    expect(result.careerName).toBe(career.name);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.explanation).toBeDefined();
    expect(result.explanation.psychologicalFit).toBeDefined();
    expect(result.explanation.workStyleFit).toBeDefined();
    expect(result.explanation.motivationFit).toBeDefined();
    expect(result.explanation.constraintFit).toBeDefined();
    expect(result.explanation.reasoning.length).toBeGreaterThan(0);
    expect(result.explanation.insights.length).toBeGreaterThanOrEqual(0);
  });

  it('should calculate weighted overall score', () => {
    const input = createMatchingInput({
      weights: {
        psychological: 0.4,
        workStyle: 0.2,
        motivation: 0.2,
        constraint: 0.2,
      },
    });
    const career = createMockCareer();

    const result = matchCareer(input, career);

    // Score should be reasonable given the inputs
    expect(result.score).toBeGreaterThan(0.3);
    expect(result.score).toBeLessThan(0.95);
  });

  it('should provide explanation with strongest matches', () => {
    const input = createMatchingInput({
      psychology: createMockStudentPsychology({ analyticalThinking: 0.9 }),
    });
    const career = createMockCareer({
      psychologicalProfile: {
        ...createMockStudentPsychology(),
        analyticalThinking: 0.9,
      },
    });

    const result = matchCareer(input, career);

    expect(result.explanation.psychologicalFit.strongestMatches.length).toBeGreaterThan(0);
  });

  it('should identify blocking constraints', () => {
    const input = createMatchingInput({
      constraints: createMockConstraints({
        accessibility: { languageComfort: LanguageComfort.NATIVE_ONLY },
      }),
    });
    const career = createMockCareer({
      indiaReality: { englishDependency: 0.9 },
    });

    const result = matchCareer(input, career);

    expect(result.explanation.constraintFit.violated.length).toBeGreaterThan(0);
  });
});

describe('matchAllCareers', () => {
  it('should match against all careers and sort by score', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
    };

    const careers = [
      createMockCareer({ id: 'career-1', name: 'Career 1' }),
      createMockCareer({ id: 'career-2', name: 'Career 2' }),
      createMockCareer({ id: 'career-3', name: 'Career 3' }),
    ];

    const result = matchAllCareers(input, careers);

    expect(result.matches.length).toBe(3);
    expect(result.statistics.totalCareers).toBe(3);

    // Should be sorted by score descending
    for (let i = 0; i < result.matches.length - 1; i++) {
      expect(result.matches[i].score).toBeGreaterThanOrEqual(result.matches[i + 1].score);
    }
  });

  it('should filter by minimum threshold', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
      minimumThreshold: 0.8,
    };

    const careers = [
      createMockCareer({ id: 'good', name: 'Good Match' }),
      createMockCareer({ id: 'bad', name: 'Bad Match', psychologicalProfile: { ...createMockStudentPsychology(), analyticalThinking: 0.1, creativity: 0.1 } }),
    ];

    const result = matchAllCareers(input, careers);

    expect(result.qualifyingMatches.every((m) => m.score >= 0.8)).toBe(true);
  });

  it('should identify best match', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology({ analyticalThinking: 0.9 }),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
    };

    const careers = [
      createMockCareer({ id: 'perfect', name: 'Perfect Match', psychologicalProfile: { ...createMockStudentPsychology(), analyticalThinking: 0.9 } }),
      createMockCareer({ id: 'mismatch', name: 'Mismatch', psychologicalProfile: { ...createMockStudentPsychology(), analyticalThinking: 0.2 } }),
    ];

    const result = matchAllCareers(input, careers);

    expect(result.bestMatch).toBeDefined();
    expect(result.bestMatch!.careerId).toBe('perfect');
  });

  it('should provide score distribution statistics', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
    };

    const careers = Array.from({ length: 10 }, (_, i) =>
      createMockCareer({ id: `career-${i}`, name: `Career ${i}` })
    );

    const result = matchAllCareers(input, careers);

    expect(result.statistics.scoreDistribution.excellent).toBeGreaterThanOrEqual(0);
    expect(result.statistics.scoreDistribution.good).toBeGreaterThanOrEqual(0);
    expect(result.statistics.scoreDistribution.moderate).toBeGreaterThanOrEqual(0);
    expect(result.statistics.scoreDistribution.poor).toBeGreaterThanOrEqual(0);

    const total =
      result.statistics.scoreDistribution.excellent +
      result.statistics.scoreDistribution.good +
      result.statistics.scoreDistribution.moderate +
      result.statistics.scoreDistribution.poor;

    expect(total).toBe(10);
  });
});

// ============================================================================
// WORK STYLE PREFERENCE TESTS
// ============================================================================

describe('createNeutralWorkStylePreference', () => {
  it('should create middle-of-road preferences', () => {
    const preference = createNeutralWorkStylePreference();

    expect(preference.remoteWork).toBe(0.5);
    expect(preference.officeWork).toBe(0.5);
    expect(preference.teamPreference).toBe(0.5);
  });
});

describe('inferWorkStylePreference', () => {
  it('should infer remote preference from high creativity', () => {
    const profile = {
      psychology: createMockStudentPsychology({ creativity: 0.9, socialOrientation: 0.2 }),
    } as StudentProfile;

    const preference = inferWorkStylePreference(profile);

    expect(preference.remoteWork).toBeGreaterThan(0.5);
    expect(preference.officeWork).toBeLessThan(0.5);
  });

  it('should infer team preference from high social orientation', () => {
    const profile = {
      psychology: createMockStudentPsychology({ socialOrientation: 0.9 }),
    } as StudentProfile;

    const preference = inferWorkStylePreference(profile);

    expect(preference.teamPreference).toBeGreaterThan(0.5);
  });

  it('should infer structure preference from detail orientation', () => {
    const profile = {
      psychology: createMockStudentPsychology({ detailOrientation: 0.9 }),
    } as StudentProfile;

    const preference = inferWorkStylePreference(profile);

    expect(preference.structurePreference).toBeGreaterThan(0.5);
  });
});

// ============================================================================
// HIGH-LEVEL API TESTS
// ============================================================================

describe('matchStudentToCareers', () => {
  it('should match complete profile to careers', () => {
    const profile: StudentProfile = {
      id: 'profile-1',
      studentId: 'student-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      schemaVersion: 1,
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      primaryMotivation: 'freedom',
      constraints: createMockConstraints(),
      academic: {
        performance: {
          stage: EducationStage.HIGH_SCHOOL_12,
          gradeScale: GradeScale.PERCENTAGE,
          overallScore: 0.85,
          subjectGrades: [],
        },
        aptitude: {},
        examResults: [],
        interests: { favoriteSubjects: [], dislikedSubjects: [], extracurriculars: [] },
      },
      decision: {
        explorationStage: 'exploring' as any,
        timeline: { urgency: 'planning' as any },
        confidence: { level: 'somewhat_confident' as any, score: 0.6, confidentAreas: [], uncertainAreas: [] },
        informationNeeds: { gaps: [], careersToResearch: [], openQuestions: [], hasDoneInformationalInterviews: false },
        previousAssessments: [],
        hasMentor: false,
      },
      dataConfidence: 0.8,
      completeness: 0.7,
      dataSource: 'assessment',
    };

    const careers = [
      createMockCareer({ id: 'se', name: 'Software Engineer' }),
      createMockCareer({ id: 'ds', name: 'Data Scientist' }),
    ];

    const result = matchStudentToCareers(profile, careers);

    expect(result.matches.length).toBe(2);
    expect(result.bestMatch).toBeDefined();
  });

  it('should accept custom work style preferences', () => {
    const profile: StudentProfile = {
      id: 'profile-1',
      studentId: 'student-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      schemaVersion: 1,
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      primaryMotivation: 'freedom',
      constraints: createMockConstraints(),
      academic: {
        performance: {
          stage: EducationStage.HIGH_SCHOOL_12,
          gradeScale: GradeScale.PERCENTAGE,
          overallScore: 0.85,
          subjectGrades: [],
        },
        aptitude: {},
        examResults: [],
        interests: { favoriteSubjects: [], dislikedSubjects: [], extracurriculars: [] },
      },
      decision: {
        explorationStage: 'exploring' as any,
        timeline: { urgency: 'planning' as any },
        confidence: { level: 'somewhat_confident' as any, score: 0.6, confidentAreas: [], uncertainAreas: [] },
        informationNeeds: { gaps: [], careersToResearch: [], openQuestions: [], hasDoneInformationalInterviews: false },
        previousAssessments: [],
        hasMentor: false,
      },
      dataConfidence: 0.8,
      completeness: 0.7,
      dataSource: 'assessment',
    };

    const customWorkStyle: WorkStylePreference = {
      remoteWork: 0.9,
      officeWork: 0.1,
      fieldWork: 0.0,
      travelComfort: 0.3,
      teamPreference: 0.4,
      structurePreference: 0.6,
    };

    const careers = [createMockCareer()];

    const result = matchStudentToCareers(profile, careers, {
      workStylePreference: customWorkStyle,
    });

    expect(result.matches.length).toBe(1);
  });
});

// ============================================================================
// DETERMINISM TESTS
// ============================================================================

describe('Determinism', () => {
  it('should produce identical results for identical inputs', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
    };

    const career = createMockCareer();

    const results: CareerMatch[] = [];
    for (let i = 0; i < 5; i++) {
      results.push(matchCareer(input, career));
    }

    const firstScore = results[0].score;
    expect(results.every((r) => r.score === firstScore)).toBe(true);
    expect(results.every((r) => r.explanation.reasoning.length === results[0].explanation.reasoning.length)).toBe(true);
  });

  it('should produce consistent rankings across multiple runs', () => {
    const input: MatchingInput = {
      psychology: createMockStudentPsychology(),
      motivations: createMockMotivations(),
      constraints: createMockConstraints(),
      workStylePreference: createNeutralWorkStylePreference(),
    };

    const careers = Array.from({ length: 5 }, (_, i) =>
      createMockCareer({ id: `career-${i}`, name: `Career ${i}` })
    );

    const run1 = matchAllCareers(input, careers);
    const run2 = matchAllCareers(input, careers);
    const run3 = matchAllCareers(input, careers);

    const order1 = run1.matches.map((m) => m.careerId);
    const order2 = run2.matches.map((m) => m.careerId);
    const order3 = run3.matches.map((m) => m.careerId);

    expect(order1).toEqual(order2);
    expect(order2).toEqual(order3);
  });
});
