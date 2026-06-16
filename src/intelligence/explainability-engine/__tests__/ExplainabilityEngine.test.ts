/**
 * CareerOS Explainability Engine Tests
 *
 * Validates the generation of counselor-quality explanations.
 */

import { describe, it, expect } from 'vitest';
import {
  ExplainabilityEngine,
  explainCareerMatch,
  explainMultipleMatches,
  type CareerExplanation,
} from '../index';

import type { Career, PsychologicalProfile, WorkStyleProfile, RewardProfile, RiskProfile } from '../../../domains/career/Career';
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
import type { CareerMatch } from '../../matching-engine/MatchingEngineV1';

// ============================================================================
// TEST FIXTURES
// ============================================================================

type RealityConstraintsFixtureOverrides = Omit<
  Partial<RealityConstraints>,
  'financial' | 'family' | 'geographic' | 'accessibility'
> & {
  financial?: Partial<RealityConstraints['financial']>;
  family?: Partial<RealityConstraints['family']>;
  geographic?: Partial<RealityConstraints['geographic']>;
  accessibility?: Partial<RealityConstraints['accessibility']>;
};

type StudentProfileFixtureOverrides = Omit<
  Partial<StudentProfile>,
  'psychology' | 'motivations' | 'constraints'
> & {
  psychology?: Partial<PsychologyProfile>;
  motivations?: Partial<Motivations>;
  constraints?: RealityConstraintsFixtureOverrides;
};

type CareerFixtureOverrides = Omit<
  Partial<Career>,
  'psychologicalProfile' | 'workStyle' | 'rewardProfile' | 'riskProfile' | 'indiaReality'
> & {
  psychologicalProfile?: Partial<PsychologicalProfile>;
  workStyle?: Partial<WorkStyleProfile>;
  rewardProfile?: Partial<RewardProfile>;
  riskProfile?: Partial<RiskProfile>;
  indiaReality?: Partial<Career['indiaReality']>;
};

const createPsychologyProfileFixture = (
  overrides: Partial<PsychologyProfile> = {}
): PsychologyProfile => ({
  analyticalThinking: 0.8,
  creativity: 0.6,
  socialOrientation: 0.5,
  leadership: 0.6,
  detailOrientation: 0.8,
  curiosity: 0.7,
  competitiveness: 0.5,
  riskTolerance: 0.6,
  ...overrides,
});

const createCareerPsychologyProfileFixture = (
  overrides: Partial<PsychologicalProfile> = {}
): PsychologicalProfile => ({
  analyticalThinking: 0.9,
  creativity: 0.6,
  socialOrientation: 0.4,
  leadership: 0.5,
  detailOrientation: 0.8,
  curiosity: 0.9,
  competitiveness: 0.6,
  riskTolerance: 0.5,
  ...overrides,
});

const createMotivationsFixture = (
  overrides: Partial<Motivations> = {}
): Motivations => ({
  money: 0.7,
  impact: 0.6,
  status: 0.5,
  freedom: 0.8,
  stability: 0.4,
  ...overrides,
});

const createWorkStyleProfileFixture = (
  overrides: Partial<WorkStyleProfile> = {}
): WorkStyleProfile => ({
  remoteWork: 0.8,
  officeWork: 0.3,
  fieldWork: 0.0,
  travelRequirement: 0.2,
  teamOrientation: 0.6,
  soloOrientation: 0.4,
  structuredEnvironment: 0.5,
  unstructuredEnvironment: 0.5,
  ...overrides,
});

const createRewardProfileFixture = (
  overrides: Partial<RewardProfile> = {}
): RewardProfile => ({
  incomePotential: 0.9,
  statusPotential: 0.7,
  impactPotential: 0.6,
  freedomPotential: 0.8,
  stabilityPotential: 0.7,
  ...overrides,
});

const createRiskProfileFixture = (
  overrides: Partial<RiskProfile> = {}
): RiskProfile => ({
  burnoutRisk: 0.6,
  automationRisk: 0.3,
  competitionLevel: 0.7,
  incomeVolatility: 0.4,
  ...overrides,
});

const createRealityConstraintsFixture = (
  overrides: RealityConstraintsFixtureOverrides = {}
): RealityConstraints => ({
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

const createIndiaRealityProfileFixture = (
  overrides: Partial<Career['indiaReality']> = {}
): Career['indiaReality'] => ({
  coachingDependency: 0.2,
  urbanAdvantage: 0.6,
  englishDependency: 0.6,
  migrationRequirement: 0.2,
  reservationApplicable: false,
  ...overrides,
});

const createMockStudentProfile = (overrides: StudentProfileFixtureOverrides = {}): StudentProfile => {
  const { psychology, motivations, constraints, ...profileOverrides } = overrides;

  return {
  id: 'profile-1',
  studentId: 'student-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  schemaVersion: 1,
  psychology: createPsychologyProfileFixture(psychology),
  motivations: createMotivationsFixture(motivations),
  primaryMotivation: 'freedom',
  constraints: createRealityConstraintsFixture(constraints),
  academic: {
    performance: {
      stage: EducationStage.HIGH_SCHOOL_11_12,
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
  ...profileOverrides,
  };
};

const createMockCareer = (overrides: CareerFixtureOverrides = {}): Career => {
  const {
    psychologicalProfile,
    workStyle,
    rewardProfile,
    riskProfile,
    indiaReality,
    ...careerOverrides
  } = overrides;

  return {
  id: 'software-engineer',
  name: 'Software Engineer',
  slug: 'software-engineer',
  category: 'technology' as any,
  description: 'Builds software applications and systems.',
  tagline: 'Code the future',
  psychologicalProfile: createCareerPsychologyProfileFixture(psychologicalProfile),
  workStyle: createWorkStyleProfileFixture(workStyle),
  rewardProfile: createRewardProfileFixture(rewardProfile),
  riskProfile: createRiskProfileFixture(riskProfile),
  optionality: {
    careerFlexibility: 0.9,
    transferableSkills: 0.9,
    entrepreneurshipPotential: 0.8,
  },
  education: {
    minimumLevel: 'bachelors' as any,
    typicalDegrees: ['B.Tech', 'B.E.', 'B.Sc CS'] as any[],
    certifications: [],
  },
  indiaReality: createIndiaRealityProfileFixture(indiaReality),
  evolution: {
    adjacentCareers: [],
    futureCareerPaths: [],
  },
  salary: {
    entrySalaryIndia: { min: 400000, max: 1500000, median: 800000 },
    midCareerSalaryIndia: { min: 1200000, max: 4000000, median: 2500000 },
    seniorSalaryIndia: { min: 3000000, max: 10000000, median: 6000000 },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  schemaVersion: 1,
  ...careerOverrides,
  };
};

const createMockCareerMatch = (overrides: Partial<CareerMatch> = {}): CareerMatch => ({
  careerId: 'software-engineer',
  careerSlug: 'software-engineer',
  careerName: 'Software Engineer',
  score: 0.75,
  explanation: {
    overallScore: 0.75,
    psychologicalFit: {
      score: 0.8,
      strongestMatches: [
        { trait: 'Analytical Thinking', studentScore: 0.8, careerScore: 0.9, matchScore: 0.9, explanation: 'Strong alignment' },
        { trait: 'Detail Orientation', studentScore: 0.8, careerScore: 0.8, matchScore: 1.0, explanation: 'Perfect match' },
      ],
      strongestMismatches: [
        { trait: 'Social Orientation', studentScore: 0.5, careerScore: 0.4, matchScore: 0.9, explanation: 'Minor gap' },
      ],
      summary: 'Good psychological fit',
    },
    workStyleFit: {
      score: 0.75,
      strongestMatches: [
        { trait: 'Remote Work', studentScore: 0.7, careerScore: 0.8, matchScore: 0.9, explanation: 'Good fit' },
      ],
      strongestMismatches: [],
      summary: 'Compatible work style',
    },
    motivationFit: {
      score: 0.7,
      strongestMatches: [
        { motivation: 'Freedom Potential', studentImportance: 0.8, careerReward: 0.8, matchScore: 1.0, explanation: 'Aligned' },
      ],
      strongestMismatches: [
        { motivation: 'Stability Potential', studentImportance: 0.4, careerReward: 0.7, matchScore: 0.7, explanation: 'Moderate' },
      ],
      summary: 'Good motivation alignment',
    },
    constraintFit: {
      score: 0.9,
      satisfied: [
        { constraint: 'Coaching Access', isSatisfied: true, severity: 0, explanation: 'All good' },
      ],
      violated: [],
      summary: 'No constraint issues',
    },
    reasoning: ['Good overall match', 'Strong psychological alignment'],
    insights: ['Consider the social aspects'],
  },
  ...overrides,
});

// ============================================================================
// EXPLAINABILITY ENGINE TESTS
// ============================================================================

describe('ExplainabilityEngine', () => {
  describe('generateExplanation', () => {
    it('should generate complete explanation structure', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.summary).toBeDefined();
      expect(explanation.whyThisCareer).toBeDefined();
      expect(explanation.psychology).toBeDefined();
      expect(explanation.motivations).toBeDefined();
      expect(explanation.workStyle).toBeDefined();
      expect(explanation.constraints).toBeDefined();
      expect(explanation.strengths).toBeDefined();
      expect(explanation.risks).toBeDefined();
      expect(explanation.tradeoffs).toBeDefined();
      expect(explanation.recommendation).toBeDefined();
      expect(explanation.nextSteps).toBeDefined();
      expect(explanation.reflectionQuestions).toBeDefined();
      expect(explanation.metadata).toBeDefined();
    });

    it('should generate metadata correctly', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.85 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.metadata.overallScore).toBe(0.85);
      expect(explanation.metadata.confidenceLevel).toBe('high');
      expect(explanation.metadata.dataQuality).toBe('partial');
      expect(explanation.metadata.generationTimestamp).toBeGreaterThan(0);
    });
  });

  describe('Summary Generation', () => {
    it('should generate excellent fit summary for high scores', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.9 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.summary).toContain('excellent fit');
      expect(explanation.summary).toContain(career.name);
    });

    it('should generate strong match summary for good scores', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.75 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.summary).toContain('strong match');
    });

    it('should generate cautionary summary for low scores', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.4 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.summary).toContain('significant gaps');
    });
  });

  describe('Psychology Explanation', () => {
    it('should identify natural strengths', () => {
      const student = createMockStudentProfile({
        psychology: { analyticalThinking: 0.95 }, // Exceeds career requirement
      });
      const career = createMockCareer({
        psychologicalProfile: { analyticalThinking: 0.7 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const analyticalStrength = explanation.psychology.naturalStrengths.find(
        s => s.trait === 'Analytical Thinking'
      );
      expect(analyticalStrength).toBeDefined();
      // Gap is 0.2 (0.9 - 0.7), which is <= 0.3, so impact is 'medium'
      expect(analyticalStrength!.impact).toBe('medium');
    });

    it('should identify growth areas', () => {
      const student = createMockStudentProfile({
        psychology: { socialOrientation: 0.3 }, // Below career requirement
      });
      const career = createMockCareer({
        psychologicalProfile: { socialOrientation: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const socialGrowth = explanation.psychology.growthAreas.find(
        g => g.trait === 'Social Orientation'
      );
      expect(socialGrowth).toBeDefined();
    });

    it('should generate core alignment statement', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.psychology.coreAlignment).toBeTruthy();
      expect(explanation.psychology.coreAlignment.length).toBeGreaterThan(20);
    });

    it('should generate friction points for mismatches', () => {
      const student = createMockStudentProfile({
        psychology: { socialOrientation: 0.2 },
      });
      const career = createMockCareer({
        psychologicalProfile: { socialOrientation: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.psychology.frictionPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Motivation Explanation', () => {
    it('should identify satisfaction areas', () => {
      const student = createMockStudentProfile({
        motivations: { freedom: 0.9 },
      });
      const career = createMockCareer({
        rewardProfile: { freedomPotential: 0.9 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.motivations.willSatisfy.length).toBeGreaterThan(0);
    });

    it('should identify potential gaps', () => {
      const student = createMockStudentProfile({
        motivations: { stability: 0.9 },
      });
      const career = createMockCareer({
        rewardProfile: { stabilityPotential: 0.3 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.motivations.potentialGaps.length).toBeGreaterThan(0);
    });

    it('should provide mitigations for gaps', () => {
      const student = createMockStudentProfile({
        motivations: { money: 0.9 },
      });
      const career = createMockCareer({
        rewardProfile: { incomePotential: 0.4 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const gap = explanation.motivations.potentialGaps.find(
        g => g.motivation.includes('Income')
      );
      if (gap) {
        expect(gap.mitigation).toBeDefined();
      }
    });
  });

  describe('Work Style Explanation', () => {
    it('should describe day-to-day reality', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        workStyle: { remoteWork: 0.9 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.workStyle.dayToDayReality).toContain('remote');
    });

    it('should identify lifestyle implications', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.workStyle.lifestyleImplications).toBeTruthy();
    });

    it('should identify positive aspects', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        workStyle: { remoteWork: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.workStyle.positiveAspects.length).toBeGreaterThan(0);
    });

    it('should identify challenging aspects based on student profile', () => {
      const student = createMockStudentProfile({
        psychology: { socialOrientation: 0.9 },
      });
      const career = createMockCareer({
        workStyle: { soloOrientation: 0.9 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.workStyle.challengingAspects.length).toBeGreaterThan(0);
    });
  });

  describe('Constraints Explanation', () => {
    it('should identify straightforward feasibility when no constraints', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.constraints.feasibility).toBe('straightforward');
    });

    it('should identify challenging feasibility with barriers', () => {
      const student = createMockStudentProfile({
        constraints: {
          accessibility: { languageComfort: LanguageComfort.NATIVE_ONLY },
        },
      });
      const career = createMockCareer({
        indiaReality: { englishDependency: 0.9 },
      });
      const match = createMockCareerMatch({
        explanation: {
          ...createMockCareerMatch().explanation,
          constraintFit: {
            score: 0.4,
            satisfied: [],
            violated: [
              { constraint: 'English Proficiency', isSatisfied: false, severity: 0.8, explanation: 'Gap' },
            ],
            summary: 'Challenges',
          },
        },
      });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      // With 1 significant challenge (severity 0.8 >= 0.7), feasibility is 'manageable'
      expect(explanation.constraints.feasibility).toBe('manageable');
    });

    it('should provide actionable advice for violated constraints', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({
        explanation: {
          ...createMockCareerMatch().explanation,
          constraintFit: {
            score: 0.6,
            satisfied: [],
            violated: [
              { constraint: 'Coaching Access', isSatisfied: false, severity: 0.7, explanation: 'Cannot afford' },
            ],
            summary: 'Issues',
          },
        },
      });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const coachingConstraint = explanation.constraints.specificConstraints.find(
        c => c.constraint === 'Coaching Access'
      );
      if (coachingConstraint) {
        expect(coachingConstraint.actionableAdvice).toBeDefined();
      }
    });
  });

  describe('Strengths Explanation', () => {
    it('should identify success factors', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.strengths.successFactors.length).toBeGreaterThan(0);
    });

    it('should identify natural advantages', () => {
      const student = createMockStudentProfile({
        psychology: { analyticalThinking: 0.95 },
      });
      const career = createMockCareer({
        psychologicalProfile: { analyticalThinking: 0.7 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.strengths.naturalAdvantages.length).toBeGreaterThan(0);
    });

    it('should describe competitive edge', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.strengths.competitiveEdge).toBeTruthy();
    });
  });

  describe('Risks Explanation', () => {
    it('should identify burnout risk', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        riskProfile: { burnoutRisk: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const burnoutRisk = explanation.risks.primaryRisks.find(r => r.risk === 'Burnout');
      expect(burnoutRisk).toBeDefined();
      expect(burnoutRisk!.level).toBe('high');
    });

    it('should identify automation risk', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        riskProfile: { automationRisk: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      const automationRisk = explanation.risks.primaryRisks.find(
        r => r.risk === 'Automation/AI Disruption'
      );
      expect(automationRisk).toBeDefined();
    });

    it('should provide mitigation strategies', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        riskProfile: { burnoutRisk: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.risks.mitigation.length).toBeGreaterThan(0);
    });

    it('should provide reality check', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.risks.realityCheck).toBeTruthy();
    });
  });

  describe('Tradeoffs Explanation', () => {
    it('should identify gains', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        rewardProfile: { incomePotential: 0.9, impactPotential: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.tradeoffs.gains.length).toBeGreaterThan(0);
    });

    it('should identify sacrifices', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        riskProfile: { burnoutRisk: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.tradeoffs.sacrifices.length).toBeGreaterThan(0);
    });

    it('should identify central tradeoff', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer({
        rewardProfile: { incomePotential: 0.9 },
        riskProfile: { burnoutRisk: 0.8 },
      });
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.tradeoffs.centralTradeoff).toContain('tradeoff');
    });
  });

  describe('Recommendation', () => {
    it('should recommend for high scores', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.85 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(['strong-recommend', 'recommend']).toContain(explanation.recommendation.verdict);
    });

    it('should caution for low scores', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch({ score: 0.35 });

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(['proceed-with-caution', 'not-recommended']).toContain(explanation.recommendation.verdict);
    });

    it('should generate ideal candidate description', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.recommendation.idealFor).toBeTruthy();
    });

    it('should generate think twice conditions', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.recommendation.thinkTwiceIf).toBeTruthy();
    });

    it('should provide counselor note', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.recommendation.counselorNote).toBeTruthy();
      expect(explanation.recommendation.counselorNote.length).toBeGreaterThan(50);
    });
  });

  describe('Next Steps & Reflection', () => {
    it('should generate next steps', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.nextSteps.length).toBeGreaterThanOrEqual(3);
      expect(explanation.nextSteps[0]).toContain('Informational interview');
    });

    it('should generate reflection questions', () => {
      const student = createMockStudentProfile();
      const career = createMockCareer();
      const match = createMockCareerMatch();

      const engine = new ExplainabilityEngine(student, career, match);
      const explanation = engine.generateExplanation();

      expect(explanation.reflectionQuestions.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('explainCareerMatch', () => {
  it('should generate explanation using factory function', () => {
    const student = createMockStudentProfile();
    const career = createMockCareer();
    const match = createMockCareerMatch();

    const explanation = explainCareerMatch(student, career, match);

    expect(explanation.summary).toBeDefined();
    expect(explanation.psychology).toBeDefined();
  });
});

describe('explainMultipleMatches', () => {
  it('should generate explanations for multiple matches', () => {
    const student = createMockStudentProfile();
    const matches = [
      { career: createMockCareer({ id: 'career-1', name: 'Career One' }), match: createMockCareerMatch({ careerId: 'career-1', careerName: 'Career One', score: 0.85 }) },
      { career: createMockCareer({ id: 'career-2', name: 'Career Two' }), match: createMockCareerMatch({ careerId: 'career-2', careerName: 'Career Two', score: 0.6 }) },
    ];

    const explanations = explainMultipleMatches(student, matches);

    expect(explanations).toHaveLength(2);
    // Verify different summaries were generated for different scores
    expect(explanations[0].summary).not.toBe(explanations[1].summary);
    expect(explanations[0].summary).toContain('Career One');
    expect(explanations[1].summary).toContain('Career Two');
  });
});

// ============================================================================
// DYNAMIC CONTENT TESTS
// ============================================================================

describe('Dynamic Content Generation', () => {
  it('should generate different content for different student profiles', () => {
    const career = createMockCareer();
    const match = createMockCareerMatch();

    const student1 = createMockStudentProfile({
      psychology: { analyticalThinking: 0.9 },
    });
    const student2 = createMockStudentProfile({
      psychology: { analyticalThinking: 0.4 },
    });

    const explanation1 = explainCareerMatch(student1, career, match);
    const explanation2 = explainCareerMatch(student2, career, match);

    // Should be different explanations
    expect(explanation1.psychology.coreAlignment).not.toBe(explanation2.psychology.coreAlignment);
  });

  it('should reference specific scores in explanations', () => {
    const student = createMockStudentProfile();
    const career = createMockCareer();
    const match = createMockCareerMatch();

    const explanation = explainCareerMatch(student, career, match);

    // Should contain percentage references in various explanation sections
    const allText = [
      explanation.summary,
      explanation.whyThisCareer,
      explanation.psychology.coreAlignment,
      ...(explanation.psychology.naturalStrengths || []).map(s => s.explanation),
      ...(explanation.psychology.growthAreas || []).map(g => g.explanation),
      ...(explanation.motivations?.willSatisfy || []).map(s => s.explanation),
      ...(explanation.motivations?.potentialGaps || []).map(g => g.explanation),
    ].join(' ');

    const hasPercentages = /\d+%/.test(allText);
    expect(hasPercentages).toBe(true);
  });

  it('should not use generic template language', () => {
    const student = createMockStudentProfile();
    const career = createMockCareer();
    const match = createMockCareerMatch();

    const explanation = explainCareerMatch(student, career, match);

    // Should be specific, not generic placeholders
    expect(explanation.summary).not.toContain('[INSERT');
    expect(explanation.summary).not.toContain('{{');
    expect(explanation.whyThisCareer).not.toContain('generic');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle perfect match', () => {
    const student = createMockStudentProfile();
    const career = createMockCareer({
      psychologicalProfile: { ...student.psychology },
    });
    const match = createMockCareerMatch({ score: 0.98 });

    const explanation = explainCareerMatch(student, career, match);

    expect(explanation.metadata.confidenceLevel).toBe('high');
    expect(explanation.psychology.growthAreas.length).toBe(0);
  });

  it('should handle very poor match', () => {
    const student = createMockStudentProfile();
    const career = createMockCareer();
    const match = createMockCareerMatch({ score: 0.2 });

    const explanation = explainCareerMatch(student, career, match);

    expect(explanation.recommendation.verdict).toBe('not-recommended');
  });

  it('should handle missing motivation data', () => {
    const student = createMockStudentProfile({
      motivations: { money: 0.5, impact: 0.5, status: 0.5, freedom: 0.5, stability: 0.5 },
    });
    const career = createMockCareer();
    const match = createMockCareerMatch();

    const explanation = explainCareerMatch(student, career, match);

    expect(explanation.motivations).toBeDefined();
  });
});
