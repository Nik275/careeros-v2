/**
 * CareerOS Counterfactual Engine - Career Adapter
 *
 * Adapts Career ontology data to Counterfactual Engine format.
 * Enables real career comparisons using the elite career dataset.
 *
 * @module intelligence/counterfactual-engine
 * @version 1.0.0
 */

import { normalizeCareerData } from '@/ontology/career-ontology';
import type { CareerV2 } from '@/authoring';
import type {
  Career,
  CareerId,
  CareerSlug,
  CoachingLevel,
  DemandLevel,
  EducationLevel,
  EnglishDependency,
  ExamType,
  FamilyAcceptance,
  GrowthLevel,
  RemoteWorkLevel,
  RiskLevel,
  StressLevel,
  TeamOrientation,
  TravelRequirement,
  UrbanAdvantage,
  WorkLifeBalance,
} from '@/ontology/career-ontology';
import type { PathComparisonData, Opportunity, OpportunityCategory } from './CounterfactualEngine';
import type { CareerTransitionGraphV1, CareerNode } from '../career-transition-graph';
import { createCareerTransitionGraph, findCareerTransitionPath, getReachableCareersFrom } from '../career-transition-graph';
import { calculateOptionality, OptionalityAnalysis } from '../optionality-engine';
import { calculateCriticality, CriticalityAnalysis } from '../criticality-engine';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Adapter configuration options
 */
export interface CareerAdapterConfig {
  /** Time horizon for analysis in years */
  timeHorizon: number;

  /** Include transition graph analysis */
  includeTransitions: boolean;

  /** Include optionality analysis */
  includeOptionality: boolean;

  /** Include criticality analysis */
  includeCriticality: boolean;

  /** Income growth rate assumption */
  incomeGrowthRate: number;

  /** Discount rate for future value */
  discountRate: number;
}

export type CareerAdapterInput = Career | CareerV2;

/**
 * Default adapter configuration
 */
export const DEFAULT_ADAPTER_CONFIG: CareerAdapterConfig = {
  timeHorizon: 20,
  includeTransitions: true,
  includeOptionality: true,
  includeCriticality: true,
  incomeGrowthRate: 0.08,
  discountRate: 0.03,
};

/**
 * Risk level to numeric score mapping
 */
const RISK_LEVEL_SCORES: Record<string, number> = {
  'minimal': 10,
  'low': 25,
  'moderate': 50,
  'high': 75,
  'severe': 90,
};

/**
 * Demand level to numeric score mapping
 */
const DEMAND_LEVEL_SCORES: Record<string, number> = {
  'declining': 20,
  'stable': 50,
  'growing': 70,
  'high-growth': 85,
  'booming': 95,
};

/**
 * Work-life balance to numeric score mapping
 */
const WORK_LIFE_SCORES: Record<string, number> = {
  'excellent': 90,
  'good': 75,
  'average': 50,
  'poor': 25,
  'very-poor': 10,
};

/**
 * Stress level to numeric score mapping
 */
const STRESS_SCORES: Record<string, number> = {
  'low': 90,
  'moderate': 70,
  'high': 45,
  'very-high': 25,
  'extreme': 10,
};

function isOntologyCareer(career: CareerAdapterInput): career is Career {
  return 'identity' in career && 'future' in career;
}

function normalizeTenPointScore(value: number | undefined, fallback = 0.5): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  const normalized = value > 1 ? value / 10 : value;
  return Math.max(0, Math.min(1, normalized));
}

function normalizeBooleanScore(value: boolean | number | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value >= 5;
  }

  return fallback;
}

function normalizeRiskLevel(value: number | undefined, fallback: RiskLevel = 'moderate'): RiskLevel {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  if (value <= 2) return 'minimal';
  if (value <= 4) return 'low';
  if (value <= 6) return 'moderate';
  if (value <= 8) return 'high';
  return 'severe';
}

function normalizeDemandLevel(value: number | undefined): DemandLevel {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'stable';
  }

  if (value <= 2) return 'declining';
  if (value <= 4) return 'stable';
  if (value <= 6) return 'growing';
  if (value <= 8) return 'high-growth';
  return 'booming';
}

function normalizeGrowthLevel(value: number | undefined): GrowthLevel {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'moderate';
  }

  if (value <= 2) return 'declining';
  if (value <= 4) return 'stagnant';
  if (value <= 6) return 'slow';
  if (value <= 8) return 'moderate';
  return 'rapid';
}

function normalizeRemoteWorkLevel(value: string | number | undefined): RemoteWorkLevel {
  if (typeof value === 'string') {
    if (value === 'none') return 'none';
    if (value === 'possible' || value === 'hybrid') return 'hybrid';
    if (value === 'preferred' || value === 'remote-first') return 'remote-first';
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'hybrid';
  }

  if (value <= 1) return 'none';
  if (value <= 4) return 'limited';
  if (value <= 7) return 'hybrid';
  if (value <= 9) return 'fully-remote';
  return 'remote-first';
}

function normalizeTravelRequirement(value: string | number | undefined): TravelRequirement {
  if (typeof value === 'string') {
    if (value === 'minimal') return 'occasional';
    if (value === 'moderate') return 'frequent';
    if (value === 'high') return 'extensive';
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'occasional';
  }

  if (value <= 1) return 'none';
  if (value <= 4) return 'occasional';
  if (value <= 7) return 'frequent';
  if (value <= 9) return 'extensive';
  return 'constant';
}

function normalizeTeamOrientation(value: string | number | undefined): TeamOrientation {
  if (typeof value === 'string') {
    if (value === 'small') return 'small-team';
    if (value === 'medium') return 'medium-team';
    if (value === 'large') return 'large-team';
    if (value === 'solo' || value === 'fluid') return value;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'medium-team';
  }

  if (value <= 2) return 'solo';
  if (value <= 4) return 'small-team';
  if (value <= 7) return 'medium-team';
  if (value <= 9) return 'large-team';
  return 'fluid';
}

function normalizeCoachingLevel(value: number | undefined): CoachingLevel {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'moderate';
  }

  if (value <= 1) return 'none';
  if (value <= 3) return 'minimal';
  if (value <= 6) return 'moderate';
  if (value <= 8) return 'high';
  return 'essential';
}

function normalizeEnglishDependency(value: number | undefined): EnglishDependency {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'helpful';
  }

  if (value <= 1) return 'none';
  if (value <= 3) return 'minimal';
  if (value <= 5) return 'helpful';
  if (value <= 8) return 'important';
  return 'essential';
}

function normalizeUrbanAdvantage(value: number | undefined): UrbanAdvantage {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'moderate';
  }

  if (value <= 1) return 'none';
  if (value <= 3) return 'slight';
  if (value <= 6) return 'moderate';
  if (value <= 8) return 'significant';
  return 'essential';
}

function normalizeFamilyAcceptance(value: number | undefined): FamilyAcceptance {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'high';
  }

  if (value <= 3) return 'low';
  if (value <= 6) return 'moderate';
  if (value <= 8) return 'high';
  return 'very-high';
}

function normalizeWorkLifeBalance(value: number | undefined): WorkLifeBalance {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'average';
  }

  if (value >= 9) return 'excellent';
  if (value >= 7) return 'good';
  if (value >= 5) return 'average';
  if (value >= 3) return 'poor';
  return 'very-poor';
}

function normalizeStressLevel(value: number | undefined): StressLevel {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'moderate';
  }

  if (value >= 9) return 'extreme';
  if (value >= 7) return 'very-high';
  if (value >= 5) return 'high';
  if (value >= 3) return 'moderate';
  return 'low';
}

function inferEducationLevel(minimumEducation: string | undefined): EducationLevel {
  const normalized = minimumEducation?.toLowerCase() ?? '';

  if (normalized.includes('post-doctoral') || normalized.includes('postdoctoral')) return 'post-doctoral';
  if (normalized.includes('doctor') || normalized.includes('phd')) return 'doctorate';
  if (normalized.includes('mbbs') || normalized.includes('md') || normalized.includes('llb') || normalized.includes('ca')) return 'professional-degree';
  if (normalized.includes('master') || normalized.includes('m.tech') || normalized.includes('mtech') || normalized.includes('mca')) return 'master';
  if (normalized.includes('bachelor') || normalized.includes('b.tech') || normalized.includes('btech') || normalized.includes('b.e') || normalized.includes('bca')) return 'bachelor';
  if (normalized.includes('diploma')) return 'diploma';
  if (normalized.includes('high school') || normalized.includes('12th')) return 'high-school';

  return 'bachelor';
}

function inferExamType(exams: string[]): ExamType {
  if (exams.length === 0) {
    return 'none';
  }

  const joined = exams.join(' ').toLowerCase();
  if (joined.includes('license') || joined.includes('licensing')) return 'licensing';
  if (joined.includes('certification')) return 'certification';
  if (joined.includes('upsc') || joined.includes('civil') || joined.includes('ca')) return 'competitive';
  if (joined.includes('jee') || joined.includes('neet') || joined.includes('cat') || joined.includes('entrance')) return 'entrance';

  return 'professional';
}

function estimateYearsOfStudy(level: EducationLevel): number {
  const yearsByLevel: Record<EducationLevel, number> = {
    none: 0,
    'high-school': 2,
    diploma: 3,
    associate: 2,
    bachelor: 4,
    master: 6,
    doctorate: 8,
    'professional-degree': 5,
    'post-doctoral': 10,
  };

  return yearsByLevel[level];
}

function normalizeCareerAdapterInput(career: CareerAdapterInput): Career {
  if (isOntologyCareer(career)) {
    return career;
  }

  const minimumEducation = inferEducationLevel(career.education.minimumEducation);
  const exams = career.education.exams ?? [];

  return normalizeCareerData({
    identity: {
      id: career.id as CareerId,
      slug: career.slug as CareerSlug,
      name: career.name,
      category: career.category,
      description: career.description,
      metadata: {
        createdAt: career.lastUpdated,
        updatedAt: career.lastUpdated,
        schemaVersion: career.version,
        isVerified: true,
        source: 'career-authoring-v2',
      },
    },
    psychology: {
      analyticalThinking: normalizeTenPointScore(career.psychology.analyticalThinking),
      creativity: normalizeTenPointScore(career.psychology.creativity),
      socialOrientation: normalizeTenPointScore(career.psychology.socialOrientation),
      leadership: normalizeTenPointScore(career.psychology.leadership),
      detailOrientation: normalizeTenPointScore(career.psychology.detailOrientation),
      curiosity: normalizeTenPointScore(career.psychology.curiosity),
      competitiveness: normalizeTenPointScore(career.psychology.competitiveness),
      riskTolerance: normalizeTenPointScore(career.psychology.riskTolerance),
    },
    workStyle: {
      remoteWork: normalizeRemoteWorkLevel(career.workStyle.remoteWork),
      officeWork: normalizeBooleanScore(career.workStyle.officeWork, true),
      fieldWork: normalizeBooleanScore(career.workStyle.fieldWork, false),
      travelRequirement: normalizeTravelRequirement(career.workStyle.travelRequirement),
      teamOrientation: normalizeTeamOrientation(career.workStyle.teamOrientation),
      soloOrientation: normalizeBooleanScore(career.workStyle.soloOrientation, true),
      structuredEnvironment: normalizeBooleanScore(career.workStyle.structuredEnvironment, true),
      unstructuredEnvironment: normalizeBooleanScore(career.workStyle.unstructuredEnvironment, false),
    },
    reward: {
      incomePotential: normalizeTenPointScore(career.reward.incomePotential),
      statusPotential: normalizeTenPointScore(career.reward.statusPotential),
      impactPotential: normalizeTenPointScore(career.reward.impactPotential),
      freedomPotential: normalizeTenPointScore(career.reward.freedomPotential),
      stabilityPotential: normalizeTenPointScore(career.reward.stabilityPotential),
    },
    risk: {
      burnoutRisk: normalizeRiskLevel(career.risk.burnoutRisk),
      automationRisk: normalizeRiskLevel(career.risk.automationRisk),
      competitionLevel: normalizeRiskLevel(career.risk.competitionLevel),
      incomeVolatility: normalizeRiskLevel(career.risk.incomeVolatility, 'low'),
    },
    optionality: {
      careerFlexibility: normalizeTenPointScore(career.optionality.careerFlexibility ?? career.optionality.transferabilityScore),
      transferableSkills: normalizeTenPointScore(career.optionality.transferableSkills ?? career.optionality.transferabilityScore),
      entrepreneurshipPotential: normalizeTenPointScore(career.optionality.entrepreneurshipPotential),
    },
    education: {
      minimumEducation,
      typicalDegrees: career.education.commonDegrees ?? career.education.requiredDegrees ?? [],
      certifications: career.education.certifications,
      optionalCertifications: career.education.preferredDegrees,
      examRequirements: {
        type: inferExamType(exams),
        exams,
        difficulty: normalizeRiskLevel(career.risk.competitionLevel),
        preparationMonths: exams.length > 0 ? 12 : 0,
      },
      yearsOfStudy: estimateYearsOfStudy(minimumEducation),
      educationCostRange: {
        min: 0,
        max: 1000000,
        typical: 500000,
      },
    },
    indiaReality: {
      coachingDependency: normalizeCoachingLevel(career.indiaReality.coachingDependency),
      englishDependency: normalizeEnglishDependency(career.indiaReality.englishDependency),
      urbanAdvantage: normalizeUrbanAdvantage(career.indiaReality.urbanAdvantage),
      migrationRequirement: normalizeBooleanScore(career.indiaReality.migrationRequirement, false),
      reservationSensitivity: normalizeBooleanScore(career.indiaReality.reservationSensitivity, false),
      familyAcceptance: normalizeFamilyAcceptance(career.indiaReality.familyAcceptance),
      socioEconomicBarriers: normalizeRiskLevel(career.indiaReality.coachingDependency),
    },
    future: {
      aiDisruptionRisk: normalizeRiskLevel(career.futureOutlook.aiDisruptionRisk),
      futureDemand: normalizeDemandLevel(career.futureOutlook.futureDemand ?? career.futureOutlook.indiaDemand),
      globalMobility: normalizeTenPointScore(career.futureOutlook.globalMobility),
      industryGrowth: normalizeGrowthLevel(career.futureOutlook.industryGrowth),
      emergingOpportunities: career.futureOutlook.emergingSpecializations,
    },
    lifestyle: {
      workLifeBalance: normalizeWorkLifeBalance(career.lifestyle.workLifeBalance),
      stressLevel: normalizeStressLevel(career.lifestyle.stressLevel),
      scheduleFlexibility: normalizeTenPointScore(career.lifestyle.scheduleFlexibility ?? career.lifestyle.flexibility),
      geographicFreedom: normalizeTenPointScore(career.lifestyle.geographicFreedom),
    },
  });
}

// ============================================================================
// ADAPTER FUNCTIONS
// ============================================================================

/**
 * Convert a Career to PathComparisonData for counterfactual analysis
 */
export function adaptCareerToPathData(
  inputCareer: CareerAdapterInput,
  config: Partial<CareerAdapterConfig> = {}
): PathComparisonData {
  const fullConfig = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  const career = normalizeCareerAdapterInput(inputCareer);

  // Build path ID from career identity
  const pathId = career.identity.slug;
  const pathName = career.identity.name;
  const pathType = determinePathType(career);

  // Generate opportunities from career data
  const opportunities = generateOpportunitiesFromCareer(career);

  // Build path comparison data
  const pathData: PathComparisonData = {
    pathId,
    pathName,
    pathType,
    category: career.identity.category,
  };

  // Add analyses if enabled
  if (fullConfig.includeOptionality) {
    pathData.optionalityAnalysis = generateOptionalityAnalysis(career);
  }

  if (fullConfig.includeCriticality) {
    pathData.criticalityAnalysis = generateCriticalityAnalysis(career);
  }

  return pathData;
}

/**
 * Determine path type based on career characteristics
 */
function determinePathType(career: Career): 'primary' | 'high-growth' | 'high-optionality' | 'low-risk' | 'balanced' {
  const { reward, optionality, risk } = career;

  // Score each path type
  const scores = {
    'high-growth': reward.incomePotential * 0.6 + reward.statusPotential * 0.4,
    'high-optionality': optionality.careerFlexibility * 0.5 + optionality.transferableSkills * 0.3 + optionality.entrepreneurshipPotential * 0.2,
    'low-risk': (100 - RISK_LEVEL_SCORES[risk.automationRisk]) * 0.4 + reward.stabilityPotential * 0.6,
    'primary': 0.5, // Default baseline
    'balanced': (reward.incomePotential + optionality.careerFlexibility + (100 - RISK_LEVEL_SCORES[risk.automationRisk])) / 3,
  };

  // Find highest scoring type
  let bestType: keyof typeof scores = 'primary';
  let bestScore = scores['primary'];

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as keyof typeof scores;
    }
  }

  return bestType;
}

/**
 * Generate optionality analysis from career data
 */
function generateOptionalityAnalysis(career: Career): OptionalityAnalysis {
  const { optionality, future, education } = career;

  // Calculate overall optionality score
  const overallScore = Math.round(
    optionality.careerFlexibility * 30 +
    optionality.transferableSkills * 35 +
    optionality.entrepreneurshipPotential * 25 +
    (future.globalMobility * 10)
  );

  // Generate adjacent careers based on transferable skills
  const adjacentCareers = generateAdjacentCareers(career);

  // Calculate skill categories
  const skillCategories = calculateSkillCategories(career);

  // Determine rating based on score
  let rating: 'exceptional' | 'high' | 'good' | 'moderate' | 'low' | 'limited';
  if (overallScore >= 85) rating = 'exceptional';
  else if (overallScore >= 70) rating = 'high';
  else if (overallScore >= 55) rating = 'good';
  else if (overallScore >= 40) rating = 'moderate';
  else if (overallScore >= 25) rating = 'low';
  else rating = 'limited';

  return {
    overallScore,
    rating,
  dimensions: {
      careerFlexibility: {
        name: 'Career Flexibility',
        score: Math.round(optionality.careerFlexibility * 100),
        explanation: 'Ease of transitioning to other careers',
        factors: ['Skill transferability', 'Industry demand', 'Experience relevance'],
      },
      transferableSkills: {
        name: 'Transferable Skills',
        score: Math.round(optionality.transferableSkills * 100),
        explanation: 'Number of transferable skills',
        factors: ['Core competencies', 'Soft skills', 'Technical abilities'],
      },
      pivotPotential: {
        name: 'Pivot Potential',
        score: Math.round(optionality.careerFlexibility * 80 + optionality.transferableSkills * 20),
        explanation: 'Ability to pivot to new career paths',
        factors: ['Career flexibility', 'Skill overlap', 'Market demand'],
      },
      entrepreneurshipPotential: {
        name: 'Entrepreneurship Potential',
        score: Math.round(optionality.entrepreneurshipPotential * 100),
        explanation: 'Potential to start own business',
        factors: ['Industry knowledge', 'Network', 'Capital requirements'],
      },
      futureCareerOptions: {
        name: 'Future Career Options',
        score: Math.round(future.globalMobility * 100),
        explanation: 'Number of future career options available',
        factors: ['Global mobility', 'Remote work potential', 'Industry growth'],
      },
    },
    summary: generateOptionalityExplanation(career),
    reasoning: [
      `Career flexibility score: ${Math.round(optionality.careerFlexibility * 100)}/100`,
      `Transferable skills score: ${Math.round(optionality.transferableSkills * 100)}/100`,
      `Entrepreneurship potential: ${Math.round(optionality.entrepreneurshipPotential * 100)}/100`,
    ],
    adjacentCareers,
    skillCategories,
    percentile: Math.round(overallScore),
    calculatedAt: Date.now(),
  };
}

/**
 * Generate criticality analysis from career data
 */
function generateCriticalityAnalysis(career: Career): CriticalityAnalysis {
  const { education, indiaReality, risk } = career;

  // Calculate criticality based on entry barriers
  const examDifficulty = RISK_LEVEL_SCORES[education.examRequirements.difficulty] || 50;
  const coachingDependency = coachingLevelToScore(indiaReality.coachingDependency);
  const competitionLevel = RISK_LEVEL_SCORES[risk.competitionLevel] || 50;

  const criticalityScore = Math.round((examDifficulty + coachingDependency + competitionLevel) / 3);

  // Determine category based on score
  let category: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';
  if (criticalityScore < 20) category = 'minimal';
  else if (criticalityScore < 40) category = 'low';
  else if (criticalityScore < 60) category = 'moderate';
  else if (criticalityScore < 80) category = 'high';
  else category = 'extreme';

  return {
    id: `criticality-${career.identity.slug}`,
    careerId: career.identity.slug,
    careerName: career.identity.name,
    criticalityScore,
    category,
    summary: generateCriticalityExplanation(career, criticalityScore),
    explanation: generateCriticalityExplanation(career, criticalityScore),
    metrics: {
      reachableCareerCount: {
        value: Math.round(20 - criticalityScore / 5),
        explanation: 'Number of careers reachable from this path',
        impact: criticalityScore > 60 ? 'high' : 'medium',
        isPositive: false,
      },
      branchingFactor: {
        value: Math.round(5 - criticalityScore / 20),
        explanation: 'Average number of future options',
        impact: criticalityScore > 60 ? 'high' : 'medium',
        isPositive: false,
      },
      reversibility: {
        value: Math.round(100 - examDifficulty) / 100,
        explanation: 'How easy to pivot away (0-1)',
        impact: examDifficulty > 60 ? 'high' : 'medium',
        isPositive: true,
      },
      transferability: {
        value: Math.round(100 - coachingDependency) / 100,
        explanation: 'How transferable are skills (0-1)',
        impact: coachingDependency > 60 ? 'high' : 'medium',
        isPositive: true,
      },
      timeToFlexibility: {
        value: Math.round(coachingDependency / 10),
        explanation: 'Years before meaningful flexibility',
        impact: coachingDependency > 60 ? 'high' : 'low',
        isPositive: false,
      },
      optionalityPreservation: {
        value: Math.round(100 - criticalityScore) / 100,
        explanation: 'How many future possibilities remain (0-1)',
        impact: criticalityScore > 60 ? 'high' : 'medium',
        isPositive: true,
      },
      futureConstraint: {
        value: criticalityScore / 100,
        explanation: 'How many paths become inaccessible (0-1)',
        impact: criticalityScore > 60 ? 'high' : 'medium',
        isPositive: false,
      },
    },
    reachableCareers: {
      total: Math.round(20 - criticalityScore / 5),
      byCategory: new Map(),
      topPaths: [],
    },
    constraints: {
      inaccessibleCareers: [],
      minimumCommitmentYears: education.yearsOfStudy,
      financialCommitment: education.educationCostRange.typical,
      educationRequirements: education.typicalDegrees,
    },
    comparison: {
      percentile: Math.round(100 - criticalityScore),
      vsCategoryAverage: Math.round(criticalityScore - 50),
      categorySize: 10,
    },
    calculatedAt: Date.now(),
  };
}

/**
 * Convert coaching level to numeric score
 */
function coachingLevelToScore(level: string): number {
  const scores: Record<string, number> = {
    'none': 10,
    'minimal': 30,
    'moderate': 50,
    'high': 75,
    'essential': 95,
  };
  return scores[level] || 50;
}

/**
 * Generate opportunities from career data
 */
function generateOpportunitiesFromCareer(career: Career): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const { reward, optionality, future, education } = career;

  // Income opportunity
  if (reward.incomePotential > 0.6) {
    opportunities.push({
      id: `${career.identity.slug}-income`,
      name: 'High Income Potential',
      description: `Earn ${(reward.incomePotential * 100).toFixed(0)}th percentile income in India`,
      category: 'financial',
      value: Math.round(reward.incomePotential * 100),
      probability: 70,
      timeToAccess: 5,
      prerequisites: ['Develop expertise', 'Build portfolio', 'Network effectively'],
      isReversible: true,
    });
  }

  // Entrepreneurship opportunity
  if (optionality.entrepreneurshipPotential > 0.5) {
    opportunities.push({
      id: `${career.identity.slug}-entrepreneurship`,
      name: 'Entrepreneurship Path',
      description: 'Start your own business or consultancy',
      category: 'entrepreneurship',
      value: Math.round(optionality.entrepreneurshipPotential * 100),
      probability: Math.round(optionality.entrepreneurshipPotential * 60),
      timeToAccess: 7,
      prerequisites: ['Gain industry experience', 'Build network', 'Save capital'],
      isReversible: false,
    });
  }

  // Global mobility
  if (future.globalMobility > 0.5) {
    opportunities.push({
      id: `${career.identity.slug}-global`,
      name: 'Global Career Mobility',
      description: 'Work internationally or remotely for global companies',
      category: 'geographic-mobility',
      value: Math.round(future.globalMobility * 100),
      probability: Math.round(future.globalMobility * 80),
      timeToAccess: 3,
      prerequisites: ['Build international network', 'Develop portable skills'],
      isReversible: true,
    });
  }

  // Career advancement
  opportunities.push({
    id: `${career.identity.slug}-advancement`,
    name: 'Career Advancement',
    description: 'Progress to senior roles and leadership positions',
    category: 'career-advancement',
    value: Math.round(reward.statusPotential * 100),
    probability: 75,
    timeToAccess: 8,
    prerequisites: ['Consistent performance', 'Leadership development', 'Mentorship'],
    isReversible: false,
  });

  // Skill development
  opportunities.push({
    id: `${career.identity.slug}-skills`,
    name: 'Continuous Skill Growth',
    description: 'Learn and develop new capabilities throughout career',
    category: 'skill-development',
    value: 85,
    probability: 90,
    timeToAccess: 0,
    prerequisites: ['Commitment to learning'],
    isReversible: false,
  });

  return opportunities;
}

/**
 * Generate adjacent careers based on career characteristics
 */
function generateAdjacentCareers(career: Career) {
  // This would ideally use the career transition graph
  // For now, generate plausible adjacent careers based on category
  const adjacent: Array<{
    careerId: string;
    name: string;
    transitionEase: number;
    skillOverlap: number;
    transitionTimeMonths: number;
    reasoning: string;
  }> = [];

  const categoryAdjacents: Record<string, string[]> = {
    'technology': ['Product Manager', 'Data Scientist', 'Technical Lead', 'Engineering Manager'],
    'healthcare': ['Hospital Administrator', 'Medical Researcher', 'Public Health Specialist'],
    'finance': ['Investment Banker', 'Financial Consultant', 'Risk Analyst', 'Portfolio Manager'],
    'business': ['Strategy Consultant', 'Operations Manager', 'Business Development'],
    'legal': ['Corporate Lawyer', 'Legal Consultant', 'Compliance Officer'],
    'education': ['Curriculum Designer', 'Education Consultant', 'Training Manager'],
    'creative': ['Art Director', 'Creative Consultant', 'Freelance Specialist'],
  };

  const adjacents = categoryAdjacents[career.identity.category] || ['Consultant', 'Manager', 'Specialist'];

  adjacents.forEach((name, index) => {
    adjacent.push({
      careerId: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      transitionEase: Math.round((60 - index * 10) / 100 * 10) / 10,
      skillOverlap: Math.max(30, 80 - index * 15) / 100,
      transitionTimeMonths: Math.round((1 + index * 0.5) * 12),
      reasoning: `Shares core skills with ${career.identity.name}`,
    });
  });

  return adjacent;
}

/**
 * Calculate skill categories for optionality
 */
function calculateSkillCategories(career: Career) {
  const categories: Array<{
    category: string;
    skills: string[];
    transferability: number;
    applicableIndustries: string[];
  }> = [];

  // Technical skills
  if (career.psychology.analyticalThinking > 0.6) {
    categories.push({
      category: 'Technical/Analytical',
      skills: ['Problem Solving', 'Data Analysis', 'Logical Reasoning', 'System Design'],
      transferability: career.psychology.analyticalThinking,
      applicableIndustries: ['Technology', 'Finance', 'Consulting', 'Research'],
    });
  }

  // Creative skills
  if (career.psychology.creativity > 0.6) {
    categories.push({
      category: 'Creative/Innovation',
      skills: ['Design Thinking', 'Innovation', 'Brainstorming', 'Concept Development'],
      transferability: career.psychology.creativity,
      applicableIndustries: ['Media', 'Technology', 'Design', 'Marketing'],
    });
  }

  // Social/Communication skills
  if (career.psychology.socialOrientation > 0.6) {
    categories.push({
      category: 'Communication/Interpersonal',
      skills: ['Communication', 'Negotiation', 'Relationship Building', 'Presentation'],
      transferability: career.psychology.socialOrientation,
      applicableIndustries: ['Business', 'Healthcare', 'Education', 'Sales'],
    });
  }

  // Leadership skills
  if (career.psychology.leadership > 0.5) {
    categories.push({
      category: 'Leadership/Management',
      skills: ['Team Management', 'Strategic Planning', 'Decision Making', 'Delegation'],
      transferability: career.psychology.leadership,
      applicableIndustries: ['Business', 'Technology', 'Government', 'Non-profit'],
    });
  }

  return categories;
}

/**
 * Generate optionality explanation
 */
function generateOptionalityExplanation(career: Career): string {
  const { optionality, future } = career;

  if (optionality.careerFlexibility > 0.7) {
    return `${career.identity.name} offers excellent career flexibility with easy transitions to related fields. The skills are highly transferable and in ${future.futureDemand} demand.`;
  } else if (optionality.careerFlexibility > 0.4) {
    return `${career.identity.name} provides moderate career flexibility. While specialized, there are pathways to adjacent careers with additional training.`;
  } else {
    return `${career.identity.name} is a specialized path with limited direct transitions. However, expertise gained can open senior opportunities within the field.`;
  }
}

/**
 * Generate criticality explanation
 */
function generateCriticalityExplanation(career: Career, score: number): string {
  if (score > 70) {
    return `Choosing ${career.identity.name} is a highly critical decision with significant entry barriers. The path requires substantial preparation and has limited reversibility.`;
  } else if (score > 40) {
    return `Entering ${career.identity.name} requires careful consideration of preparation requirements, but offers some flexibility to pivot if needed.`;
  } else {
    return `${career.identity.name} offers a more flexible entry path with lower barriers, making it easier to course-correct if needed.`;
  }
}

// ============================================================================
// BATCH ADAPTER FUNCTIONS
// ============================================================================

/**
 * Adapt multiple careers for comparison
 */
export function adaptCareersForComparison(
  careers: CareerAdapterInput[],
  config?: Partial<CareerAdapterConfig>
): PathComparisonData[] {
  return careers.map(career => adaptCareerToPathData(career, config));
}

/**
 * Create comparison data for two specific careers
 */
export function createCareerComparisonPair(
  primary: CareerAdapterInput,
  alternative: CareerAdapterInput,
  config?: Partial<CareerAdapterConfig>
): { primary: PathComparisonData; alternative: PathComparisonData } {
  return {
    primary: adaptCareerToPathData(primary, config),
    alternative: adaptCareerToPathData(alternative, config),
  };
}
