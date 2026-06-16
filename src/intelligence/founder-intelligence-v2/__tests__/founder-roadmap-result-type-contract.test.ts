import { describe, expect, it } from 'vitest';
import {
  FounderIntelligenceEngineV2,
  createFounderIntelligenceEngineV2,
} from '../FounderIntelligenceEngineV2';
import {
  FounderRoadmapEngineV2,
  createFounderRoadmapEngineV2,
} from '../FounderRoadmapEngine';
import {
  DIFFERENTIAL_FOUNDER_INDICATORS,
  resolveDifferentialIndicatorDimension,
} from '../signals';
import {
  DimensionScoreV2,
  FounderAnalysisInputV2,
  FounderDimensionV2,
  FounderReadinessV2,
  FounderRiskProfileV2,
  FounderRoadmapV2,
  isFounderDimensionV2,
} from '../types';
import {
  CoachingAccess,
  DecisionConfidence,
  DecisionUrgency,
  EducationStage,
  ExplorationStage,
  FamilyIncomeBracket,
  FamilyPressure,
  GradeScale,
  LanguageComfort,
  LocationType,
  type Motivations,
  type PsychologyProfile,
  type RealityConstraints,
  type StudentProfile,
} from '../../../domains/student/StudentProfile';

type FounderRoadmapResult = ReturnType<FounderRoadmapEngineV2['generateRoadmap']>;

interface FounderPsychologyProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  neuroticism: number;
  assertiveness: number;
}

type FounderStudentProfileFixture = StudentProfile & {
  psychology: PsychologyProfile & FounderPsychologyProfile;
  psychologyProfile: FounderPsychologyProfile;
};

const createStudentPsychologyFixture = (): PsychologyProfile & FounderPsychologyProfile => ({
  analyticalThinking: 0.7,
  creativity: 0.7,
  socialOrientation: 0.6,
  leadership: 0.7,
  detailOrientation: 0.6,
  curiosity: 0.8,
  competitiveness: 0.6,
  riskTolerance: 0.7,
  openness: 0.8,
  conscientiousness: 0.8,
  extraversion: 0.7,
  neuroticism: 0.2,
  assertiveness: 0.7,
});

const createFounderPsychologyFixture = (): FounderPsychologyProfile => ({
  openness: 0.8,
  conscientiousness: 0.8,
  extraversion: 0.7,
  neuroticism: 0.2,
  assertiveness: 0.7,
});

const createMotivationsFixture = (): Motivations => ({
  money: 0.6,
  impact: 0.8,
  status: 0.5,
  freedom: 0.8,
  stability: 0.4,
});

const createRealityConstraintsFixture = (): RealityConstraints => ({
  financial: {
    familyIncomeBracket: FamilyIncomeBracket.BETWEEN_6_12_LPA,
    hasPersonalIncome: false,
    hasEducationLoan: false,
    canAffordCoaching: true,
    canAffordPrivateCollege: false,
  },
  family: {
    familyPressure: FamilyPressure.MILD,
    isFirstGeneration: false,
    dependentCount: 0,
    expectedToContribute: false,
    mustStayNearFamily: false,
  },
  geographic: {
    locationType: LocationType.TIER_2_CITY,
    willingToRelocate: true,
  },
  accessibility: {
    languageComfort: LanguageComfort.FUNCTIONAL_ENGLISH,
    nativeLanguage: 'English',
    coachingAccess: CoachingAccess.MODERATE,
    hasInternetAccess: true,
    hasLearningDevice: true,
    localInstitutionQuality: 'good',
  },
});

const createStudentProfileFixture = (): FounderStudentProfileFixture => ({
  id: 'founder-roadmap-contract-student',
  studentId: 'founder-roadmap-contract-student',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  schemaVersion: 1,
  psychology: createStudentPsychologyFixture(),
  psychologyProfile: createFounderPsychologyFixture(),
  motivations: createMotivationsFixture(),
  primaryMotivation: 'impact',
  constraints: createRealityConstraintsFixture(),
  academic: {
    performance: {
      stage: EducationStage.UNDERGRADUATE,
      gradeScale: GradeScale.PERCENTAGE,
      overallScore: 0.82,
      subjectGrades: [],
    },
    aptitude: {},
    examResults: [],
    interests: {
      favoriteSubjects: [],
      dislikedSubjects: [],
      extracurriculars: [],
    },
  },
  decision: {
    explorationStage: ExplorationStage.EXPLORING,
    timeline: { urgency: DecisionUrgency.PLANNING },
    confidence: {
      level: DecisionConfidence.SOMEWHAT_CONFIDENT,
      score: 0.6,
      confidentAreas: [],
      uncertainAreas: [],
    },
    informationNeeds: {
      gaps: [],
      careersToResearch: [],
      openQuestions: [],
      hasDoneInformationalInterviews: false,
    },
    previousAssessments: [],
    hasMentor: false,
  },
  dataConfidence: 0.8,
  completeness: 0.8,
  dataSource: 'assessment',
});

const dimensionScores: DimensionScoreV2[] = Object.values(FounderDimensionV2).map((dimension) => ({
  dimension,
  score: 0.55,
  confidence: 0.6,
  evidence: [],
  evidenceCount: 0,
  strongestEvidenceStrength: 0,
  explanation: `${dimension} roadmap fixture`,
  isStrength: false,
  needsDevelopment: false,
}));

const riskProfile: FounderRiskProfileV2 = {
  overallRiskScore: 0.2,
  overallRiskLevel: 'LOW',
  risks: [],
  topRisks: [],
  riskAdjustedPotential: 0.55,
  confidence: 0.7,
};

const createInput = (overrides: Partial<FounderAnalysisInputV2> = {}): FounderAnalysisInputV2 => ({
  profile: createStudentProfileFixture(),
  userInput: 'I built a product with real users and I am learning founder skills.',
  timestamp: Date.now(),
  ...overrides,
});

describe('founder roadmap result type contract', () => {
  it('imports FounderIntelligenceEngineV2 successfully', () => {
    expect(FounderIntelligenceEngineV2).toBeTypeOf('function');
    expect(createFounderIntelligenceEngineV2).toBeTypeOf('function');
  });

  it('imports FounderRoadmapEngineV2 successfully', () => {
    expect(FounderRoadmapEngineV2).toBeTypeOf('function');
    expect(createFounderRoadmapEngineV2).toBeTypeOf('function');
  });

  it('generateRoadmap returns the canonical FounderRoadmapV2 result object', () => {
    const roadmapEngine = createFounderRoadmapEngineV2();
    const roadmap: FounderRoadmapResult = roadmapEngine.generateRoadmap(
      FounderReadinessV2.EMERGING,
      dimensionScores,
      null,
      riskProfile
    );

    const canonicalRoadmap: FounderRoadmapV2 = roadmap;

    expect(canonicalRoadmap).toBeDefined();
    expect(canonicalRoadmap.currentReadiness).toBe(FounderReadinessV2.EMERGING);
    expect(canonicalRoadmap.targetReadiness).toBeDefined();
    expect(canonicalRoadmap.milestones).toBeInstanceOf(Array);
    expect(canonicalRoadmap.immediateActions).toBeInstanceOf(Array);
    expect(canonicalRoadmap.skillPriorities).toBeInstanceOf(Array);
    expect(canonicalRoadmap.experienceGoals).toBeInstanceOf(Array);
    expect(canonicalRoadmap.networkGoals).toBeInstanceOf(Array);
    expect(canonicalRoadmap.decisionPoints).toBeInstanceOf(Array);
  });

  it('FounderIntelligenceEngineV2 returns roadmap as a result object, not a function', () => {
    const analysis = createFounderIntelligenceEngineV2({
      engine: { generateRoadmap: true },
    }).analyze(createInput());

    expect(analysis.roadmap).toBeDefined();
    expect(typeof analysis.roadmap).toBe('object');
    expect(typeof analysis.roadmap).not.toBe('function');
    expect(analysis.roadmap?.milestones).toBeInstanceOf(Array);
  });

  it('keeps roadmap undefined when roadmap generation is disabled', () => {
    const analysis = createFounderIntelligenceEngineV2({
      engine: { generateRoadmap: false },
    }).analyze(createInput());

    expect(analysis.roadmap).toBeUndefined();
  });

  it('preserves the Phase 6.6.AL false-positive dimension contract', () => {
    for (const indicator of DIFFERENTIAL_FOUNDER_INDICATORS) {
      expect(isFounderDimensionV2(resolveDifferentialIndicatorDimension(indicator))).toBe(true);
    }
  });

  it('does not enable live routing or raw payload capture through roadmap contract code', () => {
    expect(process.env.CAREEROS_CANARY_LIVE_ENABLED).not.toBe('true');
    expect(process.env.CAREEROS_FULL_LIVE_ENABLED).not.toBe('true');
    expect(process.env.CAREEROS_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
