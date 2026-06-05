/**
 * StudentBelief V3 - Enhanced Reality Domains
 *
 * CareerOS Intelligence - Student Model V3
 *
 * Purpose:
 *   Provides V3 StudentBelief builder with four new intelligence domains:
 *   1. FamilyReality - Family context, obligations, expectations
 *   2. EconomicReality - Financial situation, constraints, resources
 *   3. EducationalReality - Academic background, achievements, opportunities
 *   4. DecisionState - Timeline, pressure, readiness, context
 *
 * Architecture:
 *   - StudentBeliefV3Builder: Creates new V3 beliefs from V2 + reality assessment
 *   - migrateV2ToV3: Migrates existing V2 beliefs to V3
 *   - StudentBeliefV3Query: Query interface for V3 beliefs
 *
 * Backward Compatibility:
 *   - V2 beliefs remain valid and usable
 *   - Migration is opt-in and preserves all V2 data
 *   - Engines can check version and handle appropriately
 */

import { EvidenceSource, ConstraintType } from '../types';
import type {
  EntityId,
  BeliefTimestamp,
  ConfidenceScore,
  Evidence,
  StudentBelief,
  StudentBeliefV3,
  Motivation,
  Strength,
  Value,
  PersonalityTrait,
  LifestylePreference,
  Constraint,
  // V3 Reality Domains
  FamilyReality,
  FamilyStructure,
  FamilyStructureType,
  HouseholdMember,
  FamilyObligation,
  ObligationType,
  ParentalExpectation,
  ExpectationStrength,
  FamilySupport,
  SupportType,
  CulturalConstraint,
  CulturalConstraintType,
  // Economic
  EconomicReality,
  FinancialSituation,
  IncomeBracket,
  EducationFinancing,
  FundingSourceType,
  EducationLoan,
  Scholarship,
  EconomicConstraint,
  EconomicConstraintType,
  ResourceAvailability,
  FinancialRiskTolerance,
  // Educational
  EducationalReality,
  AcademicBackground,
  AcademicStream,
  EducationBoard,
  InstitutionTier,
  AcademicPerformance,
  SubjectPerformance,
  AcademicAchievement,
  CompetitiveExam,
  CompetitiveExamType,
  ExamStatus,
  InstitutionStanding,
  LearningProfile,
  LearningStyle,
  LearningEnvironment,
  EducationalOpportunity,
  // Decision
  DecisionState,
  DecisionTimeline,
  DecisionUrgency,
  DecisionDeadline,
  DecisionPressure,
  PressureSource,
  DecisionPressureFactor,
  InformationStatus,
  InformationCategory,
  InformationNeed,
  DecisionReadiness,
  ReadinessAspect,
  ReadinessComponent,
  DecisionContext,
  LifeSituation,
  DecisionEmotionalState,
} from '../types';

// ============================================================================
// REALITY ASSESSMENT INPUT
// ============================================================================

/**
 * Input for assessing family reality.
 */
export interface FamilyRealityInput {
  structureType: FamilyStructureType;
  dependentCount: number;
  isPrimaryBreadwinner: boolean;
  householdMembers: HouseholdMember[];
  obligations: Array<{
    type: ObligationType;
    description: string;
    monthlyAmount?: number;
    timeCommitmentHours?: number;
    duration: 'ONGOING' | 'TEMPORARY' | 'UNTIL_EVENT';
    isNegotiable: boolean;
    impactOnFlexibility: ConfidenceScore;
  }>;
  parentalExpectations: Array<{
    source: 'FATHER' | 'MOTHER' | 'BOTH' | 'GUARDIAN';
    expectedField?: string;
    expectedDegree?: string;
    preferredInstitutions?: string[];
    strength: ExpectationStrength;
    isExplicit: boolean;
    pressureLevel: ConfidenceScore;
  }>;
  support: Array<{
    type: SupportType;
    description: string;
    financialValue?: { amount: number; period: 'MONTHLY' | 'YEARLY' | 'ONE_TIME' };
    reliability: ConfidenceScore;
    expectedDuration: string;
  }>;
  culturalConstraints: Array<{
    type: CulturalConstraintType;
    description: string;
    impact: ConfidenceScore;
    flexibility: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
  }>;
  overallInfluence: ConfidenceScore;
  isMajorFactor: boolean;
  evidence: Evidence[];
}

/**
 * Input for assessing economic reality.
 */
export interface EconomicRealityInput {
  familyIncomeBracket: IncomeBracket;
  estimatedAnnualIncome?: number;
  locationType: 'METRO' | 'TIER_2' | 'TIER_3' | 'RURAL';
  monthlyDiscretionaryBudget: number;
  availableSavings: number;
  emergencyFundMonths: number;
  hasOwnIncome: boolean;
  studentMonthlyIncome?: number;
  fundingSources: Array<{
    type: FundingSourceType;
    amount: number;
    duration: string;
    reliability: ConfidenceScore;
  }>;
  loans: Array<{
    amount: number;
    interestRate: number;
    monthlyEMI: number;
    remainingMonths: number;
    outstandingPrincipal: number;
    isSubsidized: boolean;
    impactOnCareer: 'HIGH' | 'MODERATE' | 'LOW';
  }>;
  scholarships: Array<{
    name: string;
    amount: number;
    duration: string;
    conditions: string[];
    isRenewable: boolean;
  }>;
  constraints: Array<{
    type: EconomicConstraintType;
    description: string;
    prohibitiveCost?: number;
    impact: ConfidenceScore;
    hasWorkaround: boolean;
    workaroundDescription?: string;
  }>;
  resources: {
    monthlySkillBudget: number;
    certificationBudget: number;
    technologyAccess: 'FULL' | 'LIMITED' | 'MINIMAL';
    mentorshipAccess: 'FULL' | 'LIMITED' | 'NONE';
    timeAvailability: number;
    canRelocate: boolean;
    relocationBudget?: number;
  };
  riskTolerance: {
    canPursuePassion: boolean;
    canAffordRetraining: boolean;
    canAffordEntrepreneurship: boolean;
    canAffordUnpaidWork: boolean;
    canAffordDelayedROI: boolean;
    financialRunwayMonths: number;
    riskToleranceScore: ConfidenceScore;
  };
  overallBarrierScore: ConfidenceScore;
  isMajorFactor: boolean;
  evidence: Evidence[];
}

/**
 * Input for assessing educational reality.
 */
export interface EducationalRealityInput {
  stream: AcademicStream;
  board: EducationBoard;
  currentLevel: 'HIGH_SCHOOL' | 'HIGHER_SECONDARY' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'WORKING';
  currentYear?: number;
  institutionName?: string;
  institutionTier?: InstitutionTier;
  yearsCompleted: number;
  performance: {
    overallStanding: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';
    class10Score?: number;
    class12Score?: number;
    currentCGPA?: number;
    percentile?: number;
    subjectPerformance: Array<{
      subject: string;
      score: number;
      strength: 'STRONG' | 'MODERATE' | 'WEAK';
      careerRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    achievements: Array<{
      name: string;
      description: string;
      year?: number;
      level: 'SCHOOL' | 'DISTRICT' | 'STATE' | 'NATIONAL' | 'INTERNATIONAL';
    }>;
  };
  competitiveExams: Array<{
    examType: CompetitiveExamType;
    status: ExamStatus;
    year?: number;
    score?: number;
    percentile?: number;
    rank?: number;
    categoryRank?: number;
    isQualified?: boolean;
    expectedInstitutions?: string[];
    reachableTier?: InstitutionTier;
  }>;
  institutionStanding?: {
    tier: InstitutionTier;
    name?: string;
    naacGrade?: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C' | 'UNACCREDITED';
    nirfRanking?: number;
    placementQuality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'UNKNOWN';
    averagePackage?: number;
    topRecruiters?: string[];
  };
  learningProfile: {
    primaryStyle: LearningStyle;
    secondaryStyles: LearningStyle[];
    preferredEnvironment: LearningEnvironment;
    studyHoursPerWeek: number;
    peakLearningTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    attentionSpanMinutes: number;
    breakFrequency: 'FREQUENT' | 'MODERATE' | 'RARE';
    selfDiscipline: 'HIGH' | 'MODERATE' | 'LOW';
  };
  opportunities: Array<{
    type: 'DEGREE_PROGRAM' | 'CERTIFICATION' | 'ONLINE_COURSE' | 'WORKSHOP' | 'INTERNSHIP';
    name: string;
    provider: string;
    duration: string;
    cost: number;
    relevance: 'HIGH' | 'MEDIUM' | 'LOW';
    isEligible: boolean;
    deadline?: BeliefTimestamp;
  }>;
  overallPotential: ConfidenceScore;
  barriers: string[];
  isMajorFactor: boolean;
  evidence: Evidence[];
}

/**
 * Input for assessing decision state.
 */
export interface DecisionStateInput {
  timeline: {
    urgency: DecisionUrgency;
    deadlines: Array<{
      name: string;
      description: string;
      deadline: BeliefTimestamp;
      type: 'EXAM_DATE' | 'RESULT_DATE' | 'APPLICATION_DEADLINE' | 'COUNSELING_DATE' | 'OTHER';
      consequence: string;
      isFlexible: boolean;
    }>;
    currentPhase: 'EXPLORATION' | 'RESEARCH' | 'EVALUATION' | 'DECISION' | 'COMMITMENT';
  };
  pressure: {
    factors: Array<{
      source: PressureSource;
      description: string;
      intensity: ConfidenceScore;
      isExternal: boolean;
      impact: 'HELPFUL' | 'NEUTRAL' | 'HINDERING';
      isMitigable: boolean;
    }>;
    overallPressure: ConfidenceScore;
    isUnhealthy: boolean;
    reportedStressLevel?: ConfidenceScore;
  };
  information: {
    needs: Array<{
      category: InformationCategory;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      isCritical: boolean;
      difficultyToObtain: 'EASY' | 'MODERATE' | 'DIFFICULT';
    }>;
    sourcesUsed: string[];
    hasAdequateResearch: boolean;
  };
  readiness: {
    components: Array<{
      aspect: ReadinessAspect;
      level: ConfidenceScore;
      description: string;
      improvementAreas: string[];
    }>;
    overallReadiness: ConfidenceScore;
    category: 'READY' | 'NEARLY_READY' | 'NEEDS_PREP' | 'NOT_READY';
    canDecideNow: boolean;
    recommendedPreparation: string[];
  };
  context: {
    lifeSituation: LifeSituation;
    emotionalState: DecisionEmotionalState;
    lifeChanges: string[];
    supportSystemAvailable: boolean;
    decisionCapacity: 'FULL' | 'REDUCED' | 'LIMITED';
    isGoodTiming: boolean;
  };
  activeDecision?: string;
  alternativesConsidered: string[];
  isStuck: boolean;
  recommendedIntervention?: string;
  evidence: Evidence[];
}

// ============================================================================
// STUDENT BELIEF V3 BUILDER
// ============================================================================

/**
 * Builder for creating StudentBelief V3 instances.
 *
 * Usage:
 *   const builder = new StudentBeliefV3Builder(studentId, v2Belief);
 *   builder.addFamilyReality(familyInput);
 *   builder.addEconomicReality(economicInput);
 *   builder.addEducationalReality(educationalInput);
 *   builder.addDecisionState(decisionInput);
 *   const v3Belief = builder.build();
 */
export class StudentBeliefV3Builder {
  private studentId: EntityId;
  private v2Belief: StudentBelief;
  private familyReality?: FamilyReality;
  private economicReality?: EconomicReality;
  private educationalReality?: EducationalReality;
  private decisionState?: DecisionState;
  private contributingEngines: Set<string> = new Set();
  private additionalEvidence: Evidence[] = [];

  constructor(studentId: EntityId, v2Belief: StudentBelief) {
    this.studentId = studentId;
    this.v2Belief = v2Belief;
    // Copy contributing engines from V2
    v2Belief.metadata.contributingEngines.forEach(e => this.contributingEngines.add(e));
  }

  /**
   * Add family reality assessment.
   */
  addFamilyReality(input: FamilyRealityInput, confidence: ConfidenceScore = 0.8): this {
    const now = Date.now();

    const structure: FamilyStructure = {
      id: `family_structure_${this.studentId}_${now}`,
      type: input.structureType,
      description: this.getFamilyStructureDescription(input.structureType),
      dependentCount: input.dependentCount,
      isPrimaryBreadwinner: input.isPrimaryBreadwinner,
      householdMembers: input.householdMembers,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const obligations: FamilyObligation[] = input.obligations.map((o, i) => ({
      id: `obligation_${this.studentId}_${i}_${now}`,
      type: o.type,
      description: o.description,
      monthlyAmount: o.monthlyAmount,
      timeCommitmentHours: o.timeCommitmentHours,
      duration: o.duration,
      isNegotiable: o.isNegotiable,
      impactOnFlexibility: o.impactOnFlexibility,
      evidence: input.evidence,
      confidence,
    }));

    const parentalExpectations: ParentalExpectation[] = input.parentalExpectations.map((e, i) => ({
      id: `expectation_${this.studentId}_${i}_${now}`,
      source: e.source,
      expectedField: e.expectedField,
      expectedDegree: e.expectedDegree,
      preferredInstitutions: e.preferredInstitutions,
      strength: e.strength,
      isExplicit: e.isExplicit,
      pressureLevel: e.pressureLevel,
      evidence: input.evidence,
      confidence,
    }));

    const support: FamilySupport[] = input.support.map((s, i) => ({
      id: `support_${this.studentId}_${i}_${now}`,
      type: s.type,
      description: s.description,
      financialValue: s.financialValue,
      reliability: s.reliability,
      expectedDuration: s.expectedDuration,
      evidence: input.evidence,
      confidence,
    }));

    const culturalConstraints: CulturalConstraint[] = input.culturalConstraints.map((c, i) => ({
      id: `cultural_${this.studentId}_${i}_${now}`,
      type: c.type,
      description: c.description,
      impact: c.impact,
      flexibility: c.flexibility,
      evidence: input.evidence,
      confidence,
    }));

    this.familyReality = {
      id: `family_reality_${this.studentId}_${now}`,
      structure,
      obligations,
      parentalExpectations,
      support,
      culturalConstraints,
      overallInfluence: input.overallInfluence,
      isMajorFactor: input.isMajorFactor,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    this.contributingEngines.add('family-reality-assessment');
    return this;
  }

  /**
   * Add economic reality assessment.
   */
  addEconomicReality(input: EconomicRealityInput, confidence: ConfidenceScore = 0.8): this {
    const now = Date.now();

    const financialSituation: FinancialSituation = {
      id: `financial_${this.studentId}_${now}`,
      familyIncomeBracket: input.familyIncomeBracket,
      estimatedAnnualIncome: input.estimatedAnnualIncome,
      locationType: input.locationType,
      monthlyDiscretionaryBudget: input.monthlyDiscretionaryBudget,
      availableSavings: input.availableSavings,
      emergencyFundMonths: input.emergencyFundMonths,
      hasOwnIncome: input.hasOwnIncome,
      studentMonthlyIncome: input.studentMonthlyIncome,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const fundingSources = input.fundingSources.map((fs, i) => ({
      type: fs.type,
      amount: fs.amount,
      duration: fs.duration,
      reliability: fs.reliability,
    }));

    const loans: EducationLoan[] = input.loans.map((l, i) => ({
      id: `loan_${this.studentId}_${i}_${now}`,
      amount: l.amount,
      interestRate: l.interestRate,
      monthlyEMI: l.monthlyEMI,
      remainingMonths: l.remainingMonths,
      outstandingPrincipal: l.outstandingPrincipal,
      isSubsidized: l.isSubsidized,
      impactOnCareer: l.impactOnCareer,
    }));

    const scholarships: Scholarship[] = input.scholarships.map((s, i) => ({
      id: `scholarship_${this.studentId}_${i}_${now}`,
      name: s.name,
      amount: s.amount,
      duration: s.duration,
      conditions: s.conditions,
      isRenewable: s.isRenewable,
    }));

    const educationFinancing: EducationFinancing = {
      id: `financing_${this.studentId}_${now}`,
      fundingSources,
      loans,
      scholarships,
      totalEducationDebt: loans.reduce((sum, l) => sum + l.outstandingPrincipal, 0),
      monthlyDebtObligation: loans.reduce((sum, l) => sum + l.monthlyEMI, 0),
      debtToIncomeRatio: input.hasOwnIncome && input.studentMonthlyIncome
        ? loans.reduce((sum, l) => sum + l.monthlyEMI, 0) / input.studentMonthlyIncome
        : undefined,
      isConstraint: loans.length > 0 && loans.some(l => l.impactOnCareer === 'HIGH'),
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const constraints: EconomicConstraint[] = input.constraints.map((c, i) => ({
      id: `econ_constraint_${this.studentId}_${i}_${now}`,
      type: c.type,
      description: c.description,
      prohibitiveCost: c.prohibitiveCost,
      impact: c.impact,
      hasWorkaround: c.hasWorkaround,
      workaroundDescription: c.workaroundDescription,
      evidence: input.evidence,
      confidence,
    }));

    const resources: ResourceAvailability = {
      id: `resources_${this.studentId}_${now}`,
      monthlySkillBudget: input.resources.monthlySkillBudget,
      certificationBudget: input.resources.certificationBudget,
      technologyAccess: input.resources.technologyAccess,
      mentorshipAccess: input.resources.mentorshipAccess,
      timeAvailability: input.resources.timeAvailability,
      canRelocate: input.resources.canRelocate,
      relocationBudget: input.resources.relocationBudget,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const riskTolerance: FinancialRiskTolerance = {
      id: `risk_${this.studentId}_${now}`,
      canPursuePassion: input.riskTolerance.canPursuePassion,
      canAffordRetraining: input.riskTolerance.canAffordRetraining,
      canAffordEntrepreneurship: input.riskTolerance.canAffordEntrepreneurship,
      canAffordUnpaidWork: input.riskTolerance.canAffordUnpaidWork,
      canAffordDelayedROI: input.riskTolerance.canAffordDelayedROI,
      financialRunwayMonths: input.riskTolerance.financialRunwayMonths,
      riskToleranceScore: input.riskTolerance.riskToleranceScore,
      evidence: input.evidence,
      confidence,
    };

    this.economicReality = {
      id: `economic_reality_${this.studentId}_${now}`,
      financialSituation,
      educationFinancing,
      constraints,
      resources,
      riskTolerance,
      overallBarrierScore: input.overallBarrierScore,
      isMajorFactor: input.isMajorFactor,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    this.contributingEngines.add('economic-reality-assessment');
    return this;
  }

  /**
   * Add educational reality assessment.
   */
  addEducationalReality(input: EducationalRealityInput, confidence: ConfidenceScore = 0.8): this {
    const now = Date.now();

    const background: AcademicBackground = {
      id: `academic_bg_${this.studentId}_${now}`,
      stream: input.stream,
      board: input.board,
      currentLevel: input.currentLevel,
      currentYear: input.currentYear,
      institutionName: input.institutionName,
      institutionTier: input.institutionTier,
      yearsCompleted: input.yearsCompleted,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const performance: AcademicPerformance = {
      id: `performance_${this.studentId}_${now}`,
      overallStanding: input.performance.overallStanding,
      class10Score: input.performance.class10Score,
      class12Score: input.performance.class12Score,
      currentCGPA: input.performance.currentCGPA,
      percentile: input.performance.percentile,
      subjectPerformance: input.performance.subjectPerformance.map((s, i) => ({
        subject: s.subject,
        score: s.score,
        strength: s.strength,
        careerRelevance: s.careerRelevance,
      })),
      achievements: input.performance.achievements.map(a => ({
        name: a.name,
        description: a.description,
        year: a.year,
        level: a.level,
      })),
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const competitiveExams: CompetitiveExam[] = input.competitiveExams.map((e, i) => ({
      id: `exam_${this.studentId}_${i}_${now}`,
      examType: e.examType,
      status: e.status,
      year: e.year,
      score: e.score,
      percentile: e.percentile,
      rank: e.rank,
      categoryRank: e.categoryRank,
      isQualified: e.isQualified,
      expectedInstitutions: e.expectedInstitutions,
      reachableTier: e.reachableTier,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    }));

    const institutionStanding: InstitutionStanding | undefined = input.institutionStanding ? {
      id: `institution_${this.studentId}_${now}`,
      tier: input.institutionStanding.tier,
      name: input.institutionStanding.name,
      naacGrade: input.institutionStanding.naacGrade,
      nirfRanking: input.institutionStanding.nirfRanking,
      placementQuality: input.institutionStanding.placementQuality,
      averagePackage: input.institutionStanding.averagePackage,
      topRecruiters: input.institutionStanding.topRecruiters,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    } : undefined;

    const learningProfile: LearningProfile = {
      id: `learning_${this.studentId}_${now}`,
      primaryStyle: input.learningProfile.primaryStyle,
      secondaryStyles: input.learningProfile.secondaryStyles,
      preferredEnvironment: input.learningProfile.preferredEnvironment,
      studyHoursPerWeek: input.learningProfile.studyHoursPerWeek,
      peakLearningTime: input.learningProfile.peakLearningTime,
      attentionSpanMinutes: input.learningProfile.attentionSpanMinutes,
      breakFrequency: input.learningProfile.breakFrequency,
      selfDiscipline: input.learningProfile.selfDiscipline,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const opportunities: EducationalOpportunity[] = input.opportunities.map((o, i) => ({
      id: `opportunity_${this.studentId}_${i}_${now}`,
      type: o.type,
      name: o.name,
      provider: o.provider,
      duration: o.duration,
      cost: o.cost,
      relevance: o.relevance,
      isEligible: o.isEligible,
      deadline: o.deadline,
    }));

    this.educationalReality = {
      id: `educational_reality_${this.studentId}_${now}`,
      background,
      performance,
      competitiveExams,
      institutionStanding,
      learningProfile,
      opportunities,
      overallPotential: input.overallPotential,
      barriers: input.barriers,
      isMajorFactor: input.isMajorFactor,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    this.contributingEngines.add('educational-reality-assessment');
    return this;
  }

  /**
   * Add decision state assessment.
   */
  addDecisionState(input: DecisionStateInput, confidence: ConfidenceScore = 0.8): this {
    const now = Date.now();

    // Calculate days for deadlines
    const deadlines: DecisionDeadline[] = input.timeline.deadlines.map((d, i) => ({
      id: `deadline_${this.studentId}_${i}_${now}`,
      name: d.name,
      description: d.description,
      deadline: d.deadline,
      type: d.type,
      consequence: d.consequence,
      isFlexible: d.isFlexible,
      daysRemaining: Math.ceil((d.deadline - now) / (1000 * 60 * 60 * 24)),
    }));

    const timeline: DecisionTimeline = {
      id: `timeline_${this.studentId}_${now}`,
      urgency: input.timeline.urgency,
      deadlines,
      daysToNextDecision: deadlines.length > 0
        ? Math.min(...deadlines.map(d => d.daysRemaining))
        : 365,
      daysToFinalDecision: deadlines.length > 0
        ? Math.max(...deadlines.map(d => d.daysRemaining))
        : undefined,
      currentPhase: input.timeline.currentPhase,
      explorationTimeAvailable: this.calculateExplorationTime(deadlines, input.timeline.currentPhase),
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const pressureFactors: DecisionPressureFactor[] = input.pressure.factors.map((f, i) => ({
      id: `pressure_${this.studentId}_${i}_${now}`,
      source: f.source,
      description: f.description,
      intensity: f.intensity,
      isExternal: f.isExternal,
      impact: f.impact,
      isMitigable: f.isMitigable,
      evidence: input.evidence,
    }));

    const pressure: DecisionPressure = {
      id: `pressure_aggregate_${this.studentId}_${now}`,
      factors: pressureFactors,
      overallPressure: input.pressure.overallPressure,
      isUnhealthy: input.pressure.isUnhealthy,
      primarySource: pressureFactors.length > 0
        ? pressureFactors.reduce((max, f) => f.intensity > max.intensity ? f : max).source
        : undefined,
      reportedStressLevel: input.pressure.reportedStressLevel,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const needs: InformationNeed[] = input.information.needs.map((n, i) => ({
      id: `need_${this.studentId}_${i}_${now}`,
      category: n.category,
      description: n.description,
      priority: n.priority,
      isCritical: n.isCritical,
      difficultyToObtain: n.difficultyToObtain,
    }));

    const information: InformationStatus = {
      id: `information_${this.studentId}_${now}`,
      needs,
      gapsCount: needs.length,
      criticalGapsCount: needs.filter(n => n.isCritical).length,
      sufficiencyScore: input.information.hasAdequateResearch ? 0.8 : 0.4,
      hasAdequateResearch: input.information.hasAdequateResearch,
      sourcesUsed: input.information.sourcesUsed,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const components: ReadinessComponent[] = input.readiness.components.map(c => ({
      aspect: c.aspect,
      level: c.level,
      description: c.description,
      improvementAreas: c.improvementAreas,
    }));

    const readiness: DecisionReadiness = {
      id: `readiness_${this.studentId}_${now}`,
      components,
      overallReadiness: input.readiness.overallReadiness,
      category: input.readiness.category,
      canDecideNow: input.readiness.canDecideNow,
      recommendedPreparation: input.readiness.recommendedPreparation,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    const context: DecisionContext = {
      id: `context_${this.studentId}_${now}`,
      lifeSituation: input.context.lifeSituation,
      emotionalState: input.context.emotionalState,
      lifeChanges: input.context.lifeChanges,
      supportSystemAvailable: input.context.supportSystemAvailable,
      decisionCapacity: input.context.decisionCapacity,
      isGoodTiming: input.context.isGoodTiming,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    this.decisionState = {
      id: `decision_state_${this.studentId}_${now}`,
      timeline,
      pressure,
      information,
      readiness,
      context,
      activeDecision: input.activeDecision,
      alternativesConsidered: input.alternativesConsidered,
      isStuck: input.isStuck,
      recommendedIntervention: input.recommendedIntervention,
      evidence: input.evidence,
      confidence,
      assessedAt: now,
    };

    this.contributingEngines.add('decision-state-assessment');
    return this;
  }

  /**
   * Mark an additional engine as contributing.
   */
  markEngineContribution(engineName: string): this {
    this.contributingEngines.add(engineName);
    return this;
  }

  /**
   * Build the final StudentBelief V3 instance.
   */
  build(): StudentBeliefV3 {
    if (!this.familyReality || !this.economicReality || !this.educationalReality || !this.decisionState) {
      throw new Error(
        'StudentBeliefV3 requires all four reality domains: ' +
        'familyReality, economicReality, educationalReality, decisionState'
      );
    }

    const allConfidences = [
      this.familyReality.confidence,
      this.economicReality.confidence,
      this.educationalReality.confidence,
      this.decisionState.confidence,
      this.v2Belief.overallConfidence,
    ];

    const overallConfidence = allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length;

    const v3Belief: StudentBeliefV3 = {
      id: `belief_v3_${this.studentId}_${Date.now()}`,
      studentId: this.studentId,
      version: 3,
      timestamp: Date.now(),

      // V2 Psychology Layer
      motivations: this.v2Belief.motivations,
      strengths: this.v2Belief.strengths,
      values: this.v2Belief.values,
      personalityTraits: this.v2Belief.personalityTraits,
      lifestylePreferences: this.v2Belief.lifestylePreferences,
      constraints: this.v2Belief.constraints,

      // V3 Reality Layer
      familyReality: this.familyReality,
      economicReality: this.economicReality,
      educationalReality: this.educationalReality,

      // V3 Decision Context Layer
      decisionState: this.decisionState,

      // Metadata
      overallConfidence,
      isValidated: this.v2Belief.isValidated,
      previousVersionId: this.v2Belief.id,
      metadata: {
        assessmentQuestionCount: this.v2Belief.metadata.assessmentQuestionCount,
        inferenceStepCount: this.v2Belief.metadata.inferenceStepCount + 4, // +4 for new domains
        contributingEngines: Array.from(this.contributingEngines),
        assessmentDuration: this.v2Belief.metadata.assessmentDuration,
        migratedFromV2: {
          originalVersion: this.v2Belief.version,
          migratedAt: Date.now(),
          migrationReason: 'Upgraded to V3 with Reality Domains',
        },
      },
    };

    return v3Belief;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private getFamilyStructureDescription(type: FamilyStructureType): string {
    const descriptions: Record<FamilyStructureType, string> = {
      NUCLEAR: 'Nuclear family - parents and children living together',
      JOINT: 'Joint family - multi-generational household',
      EXTENDED: 'Extended family - nuclear with nearby relatives',
      SINGLE_PARENT: 'Single parent household',
      GUARDIAN: 'Living with guardian/non-parent relatives',
      INDEPENDENT: 'Living independently',
 };
    return descriptions[type];
  }

  private calculateExplorationTime(deadlines: DecisionDeadline[], phase: string): number {
    if (deadlines.length === 0) return 365;

    const minDays = Math.min(...deadlines.map(d => d.daysRemaining));

    // If in decision phase, less exploration time
    if (phase === 'DECISION' || phase === 'COMMITMENT') {
      return Math.max(0, minDays - 7); // 1 week buffer
    }

    return Math.max(0, minDays - 30); // 1 month buffer
  }
}

// ============================================================================
// V2 TO V3 MIGRATION
// ============================================================================

/**
 * Migration options for V2 to V3 upgrade.
 */
export interface V2ToV3MigrationOptions {
  /** Whether to include family reality assessment */
  includeFamilyReality?: boolean;

  /** Whether to include economic reality assessment */
  includeEconomicReality?: boolean;

  /** Whether to include educational reality assessment */
  includeEducationalReality?: boolean;

  /** Whether to include decision state assessment */
  includeDecisionState?: boolean;

  /** Default confidence for inferred reality data */
  defaultConfidence?: ConfidenceScore;

  /** Custom reality data to use (overrides inference) */
  customFamilyReality?: FamilyRealityInput;
  customEconomicReality?: EconomicRealityInput;
  customEducationalReality?: EducationalRealityInput;
  customDecisionState?: DecisionStateInput;
}

/**
 * Result of V2 to V3 migration.
 */
export interface V2ToV3MigrationResult {
  success: boolean;
  v3Belief?: StudentBeliefV3;
  error?: string;
  migrationsApplied: string[];
}

/**
 * Migrate a V2 StudentBelief to V3.
 *
 * This function creates default reality assessments from V2 data.
 * For production use, reality data should be collected through
 * dedicated assessment flows.
 *
 * Usage:
 *   const result = migrateV2ToV3(v2Belief, {
 *     includeFamilyReality: true,
 *     includeEconomicReality: true,
 *     customFamilyReality: { ... }
 *   });
 *   if (result.success) {
 *     const v3Belief = result.v3Belief;
 *   }
 */
export function migrateV2ToV3(
  v2Belief: StudentBelief,
  options: V2ToV3MigrationOptions = {}
): V2ToV3MigrationResult {
  const {
    includeFamilyReality = true,
    includeEconomicReality = true,
    includeEducationalReality = true,
    includeDecisionState = true,
    defaultConfidence = 0.6,
  } = options;

  const migrationsApplied: string[] = [];

  try {
    // Validate V2 belief has required fields
    if (!v2Belief?.studentId) {
      throw new Error('Invalid V2 belief: missing studentId');
    }
    if (!v2Belief?.id) {
      throw new Error('Invalid V2 belief: missing id');
    }

    const builder = new StudentBeliefV3Builder(v2Belief.studentId, v2Belief);

    // Migrate Family Reality
    if (includeFamilyReality) {
      const familyInput = options.customFamilyReality || inferFamilyRealityFromV2(v2Belief);
      builder.addFamilyReality(familyInput, defaultConfidence);
      migrationsApplied.push('familyReality');
    }

    // Migrate Economic Reality
    if (includeEconomicReality) {
      const economicInput = options.customEconomicReality || inferEconomicRealityFromV2(v2Belief);
      builder.addEconomicReality(economicInput, defaultConfidence);
      migrationsApplied.push('economicReality');
    }

    // Migrate Educational Reality
    if (includeEducationalReality) {
      const educationalInput = options.customEducationalReality || inferEducationalRealityFromV2(v2Belief);
      builder.addEducationalReality(educationalInput, defaultConfidence);
      migrationsApplied.push('educationalReality');
    }

    // Migrate Decision State
    if (includeDecisionState) {
      const decisionInput = options.customDecisionState || inferDecisionStateFromV2(v2Belief);
      builder.addDecisionState(decisionInput, defaultConfidence);
      migrationsApplied.push('decisionState');
    }

    const v3Belief = builder.build();

    return {
      success: true,
      v3Belief,
      migrationsApplied,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error',
      migrationsApplied,
    };
  }
}

// ============================================================================
// INFERENCE FUNCTIONS (V2 -> V3)
// ============================================================================

/**
 * Infer family reality from V2 constraints and values.
 */
function inferFamilyRealityFromV2(v2Belief: StudentBelief): FamilyRealityInput {
  const evidence: Evidence = {
    id: `inferred_family_${v2Belief.studentId}`,
    source: EvidenceSource.PATTERN_MATCH,
    rawData: JSON.stringify({ inferredFrom: 'v2_constraints_and_values' }),
    timestamp: Date.now(),
    confidence: 0.5,
    explanation: 'Family reality inferred from V2 constraints and values (low confidence - needs assessment)',
  };

  // Look for family-related constraints
  const familyConstraints = v2Belief.constraints.filter(c =>
    c.description.toLowerCase().includes('family') ||
    c.description.toLowerCase().includes('parent')
  );

  const hasFamilyConstraint = familyConstraints.length > 0;

  return {
    structureType: 'NUCLEAR', // Default assumption
    dependentCount: 0,
    isPrimaryBreadwinner: false,
    householdMembers: [],
    obligations: hasFamilyConstraint ? [{
      type: 'FINANCIAL_SUPPORT',
      description: 'Family obligations inferred from constraints',
      duration: 'ONGOING',
      isNegotiable: false,
      impactOnFlexibility: 0.5,
    }] : [],
    parentalExpectations: [],
    support: [],
    culturalConstraints: [],
    overallInfluence: hasFamilyConstraint ? 0.6 : 0.3,
    isMajorFactor: hasFamilyConstraint,
    evidence: [evidence],
  };
}

/**
 * Infer economic reality from V2 constraints and lifestyle.
 */
function inferEconomicRealityFromV2(v2Belief: StudentBelief): EconomicRealityInput {
  const evidence: Evidence = {
    id: `inferred_economic_${v2Belief.studentId}`,
    source: EvidenceSource.PATTERN_MATCH,
    rawData: JSON.stringify({ inferredFrom: 'v2_constraints_and_lifestyle' }),
    timestamp: Date.now(),
    confidence: 0.5,
    explanation: 'Economic reality inferred from V2 constraints (low confidence - needs assessment)',
  };

  // Look for financial constraints
  const financialConstraints = v2Belief.constraints.filter(c =>
    c.type === ConstraintType.FINANCIAL ||
    c.description.toLowerCase().includes('financial') ||
    c.description.toLowerCase().includes('money') ||
    c.description.toLowerCase().includes('cost') ||
    c.description.toLowerCase().includes('budget')
  );

  const hasFinancialConstraint = financialConstraints.length > 0;

  return {
    familyIncomeBracket: '6_TO_12_LAKH', // Middle class default
    locationType: 'TIER_2',
    monthlyDiscretionaryBudget: hasFinancialConstraint ? 5000 : 15000,
    availableSavings: hasFinancialConstraint ? 50000 : 200000,
    emergencyFundMonths: 3,
    hasOwnIncome: false,
    fundingSources: [],
    loans: [],
    scholarships: [],
    constraints: hasFinancialConstraint ? [{
      type: 'TUITION_FEES',
      description: 'Financial constraints on education options',
      impact: 0.6,
      hasWorkaround: true,
      workaroundDescription: 'Education loans, scholarships, part-time work',
    }] : [],
    resources: {
      monthlySkillBudget: hasFinancialConstraint ? 1000 : 5000,
      certificationBudget: hasFinancialConstraint ? 5000 : 20000,
      technologyAccess: 'FULL',
      mentorshipAccess: 'LIMITED',
      timeAvailability: 20,
      canRelocate: !hasFinancialConstraint,
    },
    riskTolerance: {
      canPursuePassion: !hasFinancialConstraint,
      canAffordRetraining: !hasFinancialConstraint,
      canAffordEntrepreneurship: !hasFinancialConstraint,
      canAffordUnpaidWork: !hasFinancialConstraint,
      canAffordDelayedROI: !hasFinancialConstraint,
      financialRunwayMonths: hasFinancialConstraint ? 3 : 12,
      riskToleranceScore: hasFinancialConstraint ? 0.3 : 0.7,
    },
    overallBarrierScore: hasFinancialConstraint ? 0.6 : 0.3,
    isMajorFactor: hasFinancialConstraint,
    evidence: [evidence],
  };
}

/**
 * Infer educational reality from V2 strengths and personality.
 */
function inferEducationalRealityFromV2(v2Belief: StudentBelief): EducationalRealityInput {
  const evidence: Evidence = {
    id: `inferred_educational_${v2Belief.studentId}`,
    source: EvidenceSource.PATTERN_MATCH,
    rawData: JSON.stringify({ inferredFrom: 'v2_strengths_and_personality' }),
    timestamp: Date.now(),
    confidence: 0.5,
    explanation: 'Educational reality inferred from V2 strengths (low confidence - needs assessment)',
  };

  // Infer stream from strengths
  const hasScienceStrength = v2Belief.strengths.some(s =>
    s.name.toLowerCase().includes('analytical') ||
    s.name.toLowerCase().includes('math') ||
    s.name.toLowerCase().includes('technical')
  );

  const stream: AcademicStream = hasScienceStrength ? 'SCIENCE_PCM' : 'GENERAL';

  return {
    stream,
    board: 'CBSE',
    currentLevel: 'HIGHER_SECONDARY',
    yearsCompleted: 12,
    performance: {
      overallStanding: 'GOOD',
      subjectPerformance: v2Belief.strengths.map(s => ({
        subject: s.name,
        score: s.level * 100,
        strength: s.level > 0.7 ? 'STRONG' : s.level > 0.4 ? 'MODERATE' : 'WEAK',
        careerRelevance: 'MEDIUM',
      })),
      achievements: [],
    },
    competitiveExams: [],
    learningProfile: {
      primaryStyle: 'MULTIMODAL',
      secondaryStyles: [],
      preferredEnvironment: 'STRUCTURED_CLASSROOM',
      studyHoursPerWeek: 20,
      peakLearningTime: 'MORNING',
      attentionSpanMinutes: 45,
      breakFrequency: 'MODERATE',
      selfDiscipline: 'MODERATE',
    },
    opportunities: [],
    overallPotential: 0.7,
    barriers: [],
    isMajorFactor: false,
    evidence: [evidence],
  };
}

/**
 * Infer decision state from V2 belief metadata and confidence.
 */
function inferDecisionStateFromV2(v2Belief: StudentBelief): DecisionStateInput {
  const evidence: Evidence = {
    id: `inferred_decision_${v2Belief.studentId}`,
    source: EvidenceSource.PATTERN_MATCH,
    rawData: JSON.stringify({ inferredFrom: 'v2_metadata_and_confidence' }),
    timestamp: Date.now(),
    confidence: 0.4,
    explanation: 'Decision state inferred from V2 metadata (low confidence - needs assessment)',
  };

  const lowConfidence = v2Belief.overallConfidence < 0.6;

  return {
    timeline: {
      urgency: 'EXPLORATORY',
      deadlines: [],
      currentPhase: 'EXPLORATION',
    },
    pressure: {
      factors: [],
      overallPressure: 0.3,
      isUnhealthy: false,
    },
    information: {
      needs: lowConfidence ? [{
        category: 'CAREER_OPTIONS',
        description: 'More information needed about career options',
        priority: 'HIGH',
        isCritical: true,
        difficultyToObtain: 'MODERATE',
      }] : [],
      sourcesUsed: ['assessment'],
      hasAdequateResearch: !lowConfidence,
    },
    readiness: {
      components: [{
        aspect: 'SELF_AWARENESS',
        level: v2Belief.overallConfidence,
        description: 'Self-awareness from assessment',
        improvementAreas: lowConfidence ? ['More detailed assessment needed'] : [],
      }],
      overallReadiness: v2Belief.overallConfidence,
      category: v2Belief.overallConfidence > 0.7 ? 'NEARLY_READY' : 'NEEDS_PREP',
      canDecideNow: v2Belief.overallConfidence > 0.8,
      recommendedPreparation: lowConfidence
        ? ['Complete additional assessment questions', 'Explore career options']
        : [],
    },
    context: {
      lifeSituation: 'IN_SCHOOL',
      emotionalState: 'OPTIMISTIC',
      lifeChanges: [],
      supportSystemAvailable: true,
      decisionCapacity: 'FULL',
      isGoodTiming: true,
    },
    alternativesConsidered: [],
    isStuck: false,
    evidence: [evidence],
  };
}

// ============================================================================
// STUDENT BELIEF V3 QUERY
// ============================================================================

/**
 * Query interface for StudentBelief V3.
 *
 * Provides typed access to V3-specific fields and maintains
 * backward compatibility with V2 queries.
 */
export class StudentBeliefV3Query {
  constructor(private belief: StudentBeliefV3) {}

  // ==========================================================================
  // V2 COMPATIBILITY
  // ==========================================================================

  getMotivations(): Motivation[] {
    return this.belief.motivations;
  }

  getStrengths(): Strength[] {
    return this.belief.strengths;
  }

  getValues(): Value[] {
    return this.belief.values;
  }

  getPersonalityTraits(): PersonalityTrait[] {
    return this.belief.personalityTraits;
  }

  getLifestylePreferences(): LifestylePreference[] {
    return this.belief.lifestylePreferences;
  }

  getConstraints(): Constraint[] {
    return this.belief.constraints;
  }

  getOverallConfidence(): ConfidenceScore {
    return this.belief.overallConfidence;
  }

  isValidated(): boolean {
    return this.belief.isValidated;
  }

  getMetadata(): StudentBeliefV3['metadata'] {
    return this.belief.metadata;
  }

  // ==========================================================================
  // V3 REALITY DOMAINS
  // ==========================================================================

  getFamilyReality(): FamilyReality {
    return this.belief.familyReality;
  }

  getEconomicReality(): EconomicReality {
    return this.belief.economicReality;
  }

  getEducationalReality(): EducationalReality {
    return this.belief.educationalReality;
  }

  getDecisionState(): DecisionState {
    return this.belief.decisionState;
  }

  // ==========================================================================
  // V3 UTILITY QUERIES
  // ==========================================================================

  /**
   * Get all major decision factors across all domains.
   */
  getMajorDecisionFactors(): Array<{ domain: string; factor: string; impact: number }> {
    const factors: Array<{ domain: string; factor: string; impact: number }> = [];

    if (this.belief.familyReality.isMajorFactor) {
      factors.push({
        domain: 'Family',
        factor: this.belief.familyReality.structure.type,
        impact: this.belief.familyReality.overallInfluence,
      });
    }

    if (this.belief.economicReality.isMajorFactor) {
      factors.push({
        domain: 'Economic',
        factor: `Barrier Score: ${this.belief.economicReality.overallBarrierScore}`,
        impact: this.belief.economicReality.overallBarrierScore,
      });
    }

    if (this.belief.educationalReality.isMajorFactor) {
      factors.push({
        domain: 'Educational',
        factor: this.belief.educationalReality.background.stream,
        impact: this.belief.educationalReality.overallPotential,
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Check if student is ready to make a decision.
   */
  isReadyToDecide(): boolean {
    return this.belief.decisionState.readiness.canDecideNow;
  }

  /**
   * Get decision urgency level.
   */
  getDecisionUrgency(): DecisionUrgency {
    return this.belief.decisionState.timeline.urgency;
  }

  /**
   * Get days until next critical deadline.
   */
  getDaysToNextDeadline(): number {
    return this.belief.decisionState.timeline.daysToNextDecision;
  }

  /**
   * Check if student is under unhealthy pressure.
   */
  isUnderUnhealthyPressure(): boolean {
    return this.belief.decisionState.pressure.isUnhealthy;
  }

  /**
   * Get financial constraints summary.
   */
  getFinancialConstraints(): EconomicConstraint[] {
    return this.belief.economicReality.constraints;
  }

  /**
   * Get academic standing.
   */
  getAcademicStanding(): string {
    return this.belief.educationalReality.performance.overallStanding;
  }

  /**
   * Get the raw V3 belief.
   */
  getRawBelief(): StudentBeliefV3 {
    return this.belief;
  }

  /**
   * Check if this is a V3 belief (type guard).
   */
  static isV3(belief: StudentBelief | StudentBeliefV3): belief is StudentBeliefV3 {
    return 'version' in belief && belief.version === 3;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a V3 belief from V2 with reality assessments.
 */
export function createStudentBeliefV3(
  studentId: EntityId,
  v2Belief: StudentBelief,
  realityData: {
    family: FamilyRealityInput;
    economic: EconomicRealityInput;
    educational: EducationalRealityInput;
    decision: DecisionStateInput;
  },
  confidence: ConfidenceScore = 0.8
): StudentBeliefV3 {
  const builder = new StudentBeliefV3Builder(studentId, v2Belief);

  builder
    .addFamilyReality(realityData.family, confidence)
    .addEconomicReality(realityData.economic, confidence)
    .addEducationalReality(realityData.educational, confidence)
    .addDecisionState(realityData.decision, confidence);

  return builder.build();
}

/**
 * Create a query interface for a V3 belief.
 */
export function queryStudentBeliefV3(belief: StudentBeliefV3): StudentBeliefV3Query {
  return new StudentBeliefV3Query(belief);
}

/**
 * Check if a belief is V3 (type guard).
 */
export function isStudentBeliefV3(belief: StudentBelief | StudentBeliefV3): belief is StudentBeliefV3 {
  return StudentBeliefV3Query.isV3(belief);
}
