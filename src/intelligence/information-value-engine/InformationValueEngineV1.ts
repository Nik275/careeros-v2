/**
 * CareerOS Information Value Engine V1
 *
 * Identifies missing information that would improve decision quality.
 * Estimates value of gathering information and recommends specific actions.
 *
 * Features:
 * - Uncertainty factor identification
 * - Information gap analysis
 * - Value of information calculation
 * - Recommended assessments and experiments
 * - Exploration activity suggestions
 *
 * @module intelligence/information-value-engine
 * @version 1.0.0
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type { UncertaintyProfile } from '../uncertainty-engine/index.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type of information that can be gathered
 */
export type InformationType =
  | 'psychological-assessment'
  | 'skill-assessment'
  | 'interest-exploration'
  | 'aptitude-testing'
  | 'reality-constraints'
  | 'career-research'
  | 'experiential-learning'
  | 'social-feedback'
  | 'market-research'
  | 'outcome-data';

/**
 * Information gathering method
 */
export type InformationMethod =
  | 'assessment'
  | 'interview'
  | 'shadowing'
  | 'internship'
  | 'project'
  | 'course'
  | 'conversation'
  | 'research'
  | 'experiment'
  | 'reflection';

/**
 * Uncertainty factor in decision making
 */
export interface UncertaintyFactor {
  /** Factor identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Category of uncertainty */
  category:
    | 'student-profile'
    | 'career-knowledge'
    | 'fit-assessment'
    | 'outcome-prediction'
    | 'external-factors';

  /** Current uncertainty level (0-100) */
  uncertainty: number;

  /** Impact on decision quality (0-100) */
  impact: number;

  /** Information value score (uncertainty × impact) */
  informationValue: number;

  /** Priority for addressing */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Current evidence status */
  evidenceStatus: 'none' | 'weak' | 'moderate' | 'strong';

  /** Specific gaps in knowledge */
  knowledgeGaps: string[];

  /** Assumptions being made */
  assumptions: string[];
}

/**
 * Missing evidence item
 */
export interface MissingEvidence {
  /** What evidence is missing */
  description: string;

  /** Type of information */
  type: InformationType;

  /** Why this evidence matters */
  relevance: string;

  /** How decision would improve with this evidence */
  potentialImprovement: string;

  /** Confidence gain if evidence were obtained */
  confidenceGain: number;

  /** Difficulty of obtaining evidence (0-100) */
  acquisitionDifficulty: number;

  /** Cost (time/money) of acquisition */
  acquisitionCost: 'low' | 'medium' | 'high';

  /** Time required */
  timeRequired: string;
}

/**
 * Weak assumption in current decision
 */
export interface WeakAssumption {
  /** The assumption being made */
  assumption: string;

  /** Why this assumption may be incorrect */
  risk: string;

  /** Impact if assumption is wrong */
  impact: 'minor' | 'moderate' | 'significant' | 'severe';

  /** How to validate this assumption */
  validationApproach: string;

  /** Confidence in this assumption (0-100) */
  confidence: number;
}

/**
 * Recommended information gathering action
 */
export interface RecommendedAction {
  /** Action identifier */
  id: string;

  /** What to do */
  description: string;

  /** Type of information gathered */
  informationType: InformationType;

  /** Method of gathering */
  method: InformationMethod;

  /** Target factors addressed */
  targetFactors: string[];

  /** Expected uncertainty reduction */
  uncertaintyReduction: number;

  /** Expected confidence gain */
  confidenceGain: number;

  /** Expected decision improvement */
  decisionImprovement: number;

  /** Cost (low/medium/high) */
  cost: 'low' | 'medium' | 'high';

  /** Time required */
  timeRequired: string;

  /** Prerequisites */
  prerequisites: string[];

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Rationale */
  rationale: string;
}

/**
 * Assessment recommendation
 */
export interface AssessmentRecommendation {
  /** Assessment name */
  name: string;

  /** What it measures */
  measures: string[];

  /** Type of assessment */
  type: InformationType;

  /** Expected outcomes */
  expectedOutcomes: string[];

  /** Confidence gain */
  confidenceGain: number;

  /** Time required */
  timeRequired: string;

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Experiment recommendation
 */
export interface ExperimentRecommendation {
  /** Experiment name */
  name: string;

  /** What to try */
  description: string;

  /** What it tests */
  hypothesis: string;

  /** Method */
  method: InformationMethod;

  /** Success criteria */
  successCriteria: string[];

  /** Duration */
  duration: string;

  /** Expected learning */
  expectedLearning: string[];

  /** Confidence gain */
  confidenceGain: number;

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Exploration activity recommendation
 */
export interface ExplorationActivity {
  /** Activity name */
  name: string;

  /** What to do */
  description: string;

  /** Type of activity */
  type: InformationType;

  /** What it reveals */
  reveals: string[];

  /** How to do it */
  howTo: string[];

  /** Resources needed */
  resources: string[];

  /** Time required */
  timeRequired: string;

  /** Expected value */
  expectedValue: string;

  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Complete information value analysis
 */
export interface InformationValueAnalysis {
  /** Analysis identifier */
  id: string;

  /** Student identifier */
  studentId: string;

  /** Current decision confidence */
  currentConfidence: number;

  /** Target confidence (with perfect information) */
  targetConfidence: number;

  /** Confidence gap */
  confidenceGap: number;

  /** Uncertainty factors */
  uncertaintyFactors: UncertaintyFactor[];

  /** Missing evidence */
  missingEvidence: MissingEvidence[];

  /** Weak assumptions */
  weakAssumptions: WeakAssumption[];

  /** Knowledge gaps */
  knowledgeGaps: string[];

  /** Recommended assessments */
  recommendedAssessments: AssessmentRecommendation[];

  /** Recommended experiments */
  recommendedExperiments: ExperimentRecommendation[];

  /** Exploration activities */
  explorationActivities: ExplorationActivity[];

  /** All recommended actions (merged and sorted) */
  allRecommendedActions: RecommendedAction[];

  /** Value of perfect information */
  valueOfPerfectInformation: {
    /** Maximum possible confidence gain */
    maxConfidenceGain: number;

    /** Maximum possible decision improvement */
    maxDecisionImprovement: number;

    /** Whether perfect information is achievable */
    achievable: boolean;

    /** Why/why not */
    explanation: string;
  };

  /** Strategic recommendations */
  strategy: {
    /** Quick wins (low cost, high value) */
    quickWins: RecommendedAction[];

    /** High impact actions */
    highImpact: RecommendedAction[];

    /** Long-term investments */
    longTerm: RecommendedAction[];

    /** Minimum viable actions to reach target confidence */
    minimumViable: RecommendedAction[];
  };

  /** Explanation */
  explanation: {
    /** Summary of analysis */
    summary: string;

    /** Key insights */
    insights: string[];

    /** Why information matters */
    informationValueExplanation: string;

    /** Recommended approach */
    recommendedApproach: string;

    /** Next steps */
    nextSteps: string[];
  };
}

/**
 * Information value configuration
 */
export interface InformationValueConfig {
  /** Minimum uncertainty to flag (0-100) */
  minUncertaintyThreshold: number;

  /** Minimum impact to flag (0-100) */
  minImpactThreshold: number;

  /** Target confidence level */
  targetConfidence: number;

  /** Maximum recommendations to return */
  maxRecommendations: number;

  /** Weight for cost in priority calculation */
  costWeight: number;

  /** Weight for time in priority calculation */
  timeWeight: number;

  /** Weight for value in priority calculation */
  valueWeight: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_INFORMATION_VALUE_CONFIG: InformationValueConfig = {
  minUncertaintyThreshold: 30,
  minImpactThreshold: 40,
  targetConfidence: 80,
  maxRecommendations: 10,
  costWeight: 0.2,
  timeWeight: 0.15,
  valueWeight: 0.65,
};

// ============================================================================
// UNCERTAINTY FACTOR IDENTIFICATION
// ============================================================================

/**
 * Identify uncertainty factors from student belief
 */
export function identifyUncertaintyFactors(
  student: StudentBeliefV3,
  config: InformationValueConfig = DEFAULT_INFORMATION_VALUE_CONFIG
): UncertaintyFactor[] {
  const factors: UncertaintyFactor[] = [];

  // Student profile completeness
  const profileFactors = assessStudentProfileUncertainty(student);
  factors.push(...profileFactors);

  // Career knowledge gaps
  const knowledgeFactors = assessCareerKnowledgeUncertainty(student);
  factors.push(...knowledgeFactors);

  // Fit assessment uncertainty
  const fitFactors = assessFitUncertainty(student);
  factors.push(...fitFactors);

  // Outcome prediction uncertainty
  const outcomeFactors = assessOutcomeUncertainty(student);
  factors.push(...outcomeFactors);

  // Filter by thresholds
  return factors
    .filter(f => f.uncertainty >= config.minUncertaintyThreshold)
    .filter(f => f.impact >= config.minImpactThreshold)
    .sort((a, b) => b.informationValue - a.informationValue);
}

function assessStudentProfileUncertainty(student: StudentBeliefV3): UncertaintyFactor[] {
  const factors: UncertaintyFactor[] = [];

  // Psychological profile completeness
  const psychCompleteness = calculatePsychCompleteness(student);
  if (psychCompleteness < 100) {
    factors.push({
      id: 'psychological-profile',
      name: 'Psychological Profile Completeness',
      category: 'student-profile',
      uncertainty: 100 - psychCompleteness,
      impact: 85,
      informationValue: (100 - psychCompleteness) * 0.85,
      priority: psychCompleteness < 50 ? 'critical' : psychCompleteness < 75 ? 'high' : 'medium',
      evidenceStatus: psychCompleteness < 50 ? 'weak' : 'moderate',
      knowledgeGaps: identifyPsychGaps(student),
      assumptions: ['Student can accurately self-report personality traits'],
    });
  }

  // Reality constraints clarity
  const realityCompleteness = calculateRealityCompleteness(student);
  if (realityCompleteness < 100) {
    factors.push({
      id: 'reality-constraints',
      name: 'Reality Constraints Clarity',
      category: 'student-profile',
      uncertainty: 100 - realityCompleteness,
      impact: 80,
      informationValue: (100 - realityCompleteness) * 0.80,
      priority: realityCompleteness < 60 ? 'high' : 'medium',
      evidenceStatus: realityCompleteness < 60 ? 'weak' : 'moderate',
      knowledgeGaps: identifyRealityGaps(student),
      assumptions: ['Family constraints will remain stable'],
    });
  }

  return factors;
}

function calculatePsychCompleteness(student: StudentBeliefV3): number {
  const components = [
    student.motivations.length > 0,
    student.strengths.length > 0,
    student.values.length > 0,
    student.personalityTraits.length > 0,
    student.lifestylePreferences.length > 0,
    student.constraints.length > 0,
  ];

  const presentComponents = components.filter(Boolean).length;
  return Math.round((presentComponents / components.length) * 100);
}

function identifyPsychGaps(student: StudentBeliefV3): string[] {
  const gaps: string[] = [];

  if (student.motivations.length === 0) gaps.push('Motivation assessment');
  if (student.strengths.length === 0) gaps.push('Strengths assessment');
  if (student.values.length === 0) gaps.push('Values clarification');
  if (student.personalityTraits.length === 0) gaps.push('Personality assessment');
  if (student.lifestylePreferences.length === 0) gaps.push('Lifestyle preferences');

  return gaps;
}

function calculateRealityCompleteness(student: StudentBeliefV3): number {
  let score = 0;
  let total = 0;

  // Family reality
  total += 25;
  if (student.familyReality) {
    if (student.familyReality.structure) score += 10;
    if (student.familyReality.parentalExpectations && student.familyReality.parentalExpectations.length > 0) score += 10;
    if (student.familyReality.support && student.familyReality.support.length > 0) score += 5;
  }

  // Economic reality
  total += 25;
  if (student.economicReality) {
    if (student.economicReality.financialSituation) score += 10;
    if (student.economicReality.educationFinancing) score += 10;
    if (student.economicReality.riskTolerance !== undefined) score += 5;
  }

  // Educational reality
  total += 25;
  if (student.educationalReality) {
    if (student.educationalReality.background) score += 10;
    if (student.educationalReality.performance) score += 10;
    if (student.educationalReality.learningProfile) score += 5;
  }

  // Decision state
  total += 25;
  if (student.decisionState) {
    if (student.decisionState.timeline) score += 10;
    if (student.decisionState.readiness) score += 10;
    if (student.decisionState.context) score += 5;
  }

  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function identifyRealityGaps(student: StudentBeliefV3): string[] {
  const gaps: string[] = [];

  if (!student.familyReality?.structure) gaps.push('Family structure clarification');
  if (student.economicReality?.riskTolerance === undefined) gaps.push('Personal risk tolerance assessment');
  if (!student.decisionState?.timeline) gaps.push('Decision timeline clarification');

  return gaps;
}

function assessCareerKnowledgeUncertainty(student: StudentBeliefV3): UncertaintyFactor[] {
  const isInitialExploration = student.decisionState?.timeline?.currentPhase === 'EXPLORATION';
  
  return [
    {
      id: 'career-exposure',
      name: 'Direct Career Exposure',
      category: 'career-knowledge',
      uncertainty: isInitialExploration ? 80 : 50,
      impact: 90,
      informationValue: isInitialExploration ? 72 : 45,
      priority: isInitialExploration ? 'critical' : 'medium',
      evidenceStatus: 'weak',
      knowledgeGaps: ['First-hand experience with target careers', 'Day-to-day reality of work'],
      assumptions: ['Student understands what careers actually involve'],
    },
    {
      id: 'market-knowledge',
      name: 'Labor Market Understanding',
      category: 'career-knowledge',
      uncertainty: 60,
      impact: 70,
      informationValue: 42,
      priority: 'medium',
      evidenceStatus: 'weak',
      knowledgeGaps: ['Salary progression', 'Job market trends', 'Geographic opportunities'],
      assumptions: ['Market conditions will remain stable'],
    },
  ];
}

function assessFitUncertainty(student: StudentBeliefV3): UncertaintyFactor[] {
  const isInitialExploration = student.decisionState?.timeline?.currentPhase === 'EXPLORATION';
  
  return [
    {
      id: 'interest-stability',
      name: 'Interest Stability',
      category: 'fit-assessment',
      uncertainty: 50,
      impact: 85,
      informationValue: 42.5,
      priority: 'high',
      evidenceStatus: 'weak',
      knowledgeGaps: ['Will interests persist over 10+ years?', 'How will interests evolve?'],
      assumptions: ['Current interests predict future satisfaction'],
    },
    {
      id: 'aptitude-validation',
      name: 'Aptitude Validation',
      category: 'fit-assessment',
      uncertainty: isInitialExploration ? 70 : 40,
      impact: 80,
      informationValue: isInitialExploration ? 56 : 32,
      priority: isInitialExploration ? 'high' : 'medium',
      evidenceStatus: 'weak',
      knowledgeGaps: ['Actual performance vs self-assessment', 'Skill development potential'],
      assumptions: ['Self-assessed aptitudes are accurate'],
    },
  ];
}

function assessOutcomeUncertainty(student: StudentBeliefV3): UncertaintyFactor[] {
  return [
    {
      id: 'outcome-prediction',
      name: 'Outcome Prediction Accuracy',
      category: 'outcome-prediction',
      uncertainty: 65,
      impact: 75,
      informationValue: 48.75,
      priority: 'medium',
      evidenceStatus: 'weak',
      knowledgeGaps: ['Long-term career success factors', 'External disruption risks'],
      assumptions: ['Historical patterns predict future outcomes'],
    },
  ];
}

// ============================================================================
// MISSING EVIDENCE IDENTIFICATION
// ============================================================================

/**
 * Identify missing evidence
 */
export function identifyMissingEvidence(
  factors: UncertaintyFactor[],
  config: InformationValueConfig = DEFAULT_INFORMATION_VALUE_CONFIG
): MissingEvidence[] {
  const evidence: MissingEvidence[] = [];

  for (const factor of factors) {
    const factorEvidence = generateEvidenceRecommendations(factor);
    evidence.push(...factorEvidence);
  }

  // Remove duplicates and sort by value
  const unique = new Map<string, MissingEvidence>();
  for (const e of evidence) {
    if (!unique.has(e.description) || unique.get(e.description)!.confidenceGain < e.confidenceGain) {
      unique.set(e.description, e);
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => b.confidenceGain - a.confidenceGain)
    .slice(0, config.maxRecommendations);
}

function generateEvidenceRecommendations(factor: UncertaintyFactor): MissingEvidence[] {
  const evidence: MissingEvidence[] = [];

  switch (factor.id) {
    case 'psychological-profile':
      evidence.push({
        description: 'Complete personality assessment (Big Five)',
        type: 'psychological-assessment',
        relevance: 'Personality is foundational to career fit',
        potentialImprovement: 'Improve fit prediction accuracy by 25%',
        confidenceGain: 15,
        acquisitionDifficulty: 20,
        acquisitionCost: 'low',
        timeRequired: '30-45 minutes',
      });
      break;

    case 'career-exposure':
      evidence.push({
        description: 'Informational interview with 2-3 professionals in target field',
        type: 'career-research',
        relevance: 'Understand day-to-day reality of careers',
        potentialImprovement: 'Reduce mismatch between expectations and reality',
        confidenceGain: 20,
        acquisitionDifficulty: 40,
        acquisitionCost: 'low',
        timeRequired: '2-3 hours total',
      });
      evidence.push({
        description: 'Job shadowing for 1-2 days',
        type: 'experiential-learning',
        relevance: 'Direct observation of work environment',
        potentialImprovement: 'Validate interest and fit assumptions',
        confidenceGain: 25,
        acquisitionDifficulty: 60,
        acquisitionCost: 'medium',
        timeRequired: '2-3 days',
      });
      break;

    case 'aptitude-validation':
      evidence.push({
        description: 'Skills-based project in target area',
        type: 'skill-assessment',
        relevance: 'Validate actual ability vs self-assessment',
        potentialImprovement: 'Confirm aptitude and enjoyment',
        confidenceGain: 20,
        acquisitionDifficulty: 50,
        acquisitionCost: 'medium',
        timeRequired: '1-2 weeks',
      });
      break;

    case 'interest-stability':
      evidence.push({
        description: 'Journal reflection on past interest patterns',
        type: 'interest-exploration',
        relevance: 'Understand how interests have evolved',
        potentialImprovement: 'Predict future interest trajectory',
        confidenceGain: 10,
        acquisitionDifficulty: 10,
        acquisitionCost: 'low',
        timeRequired: '1-2 hours',
      });
      break;
  }

  return evidence;
}

// ============================================================================
// WEAK ASSUMPTION IDENTIFICATION
// ============================================================================

/**
 * Identify weak assumptions
 */
export function identifyWeakAssumptions(
  student: StudentBeliefV3,
  factors: UncertaintyFactor[]
): WeakAssumption[] {
  const assumptions: WeakAssumption[] = [];

  for (const factor of factors) {
    for (const assumption of factor.assumptions) {
      assumptions.push({
        assumption,
        risk: `If incorrect, ${factor.name} assessment may be wrong`,
        impact: factor.impact > 70 ? 'significant' : factor.impact > 50 ? 'moderate' : 'minor',
        validationApproach: generateValidationApproach(factor.id),
        confidence: 100 - factor.uncertainty,
      });
    }
  }

  return assumptions.sort((a, b) => {
    const impactOrder = { severe: 4, significant: 3, moderate: 2, minor: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
}

function generateValidationApproach(factorId: string): string {
  const approaches: Record<string, string> = {
    'psychological-profile': 'Take validated assessment + compare to past behavior',
    'career-exposure': 'Shadow professional + compare to online research',
    'aptitude-validation': 'Complete skills project + get expert feedback',
    'interest-stability': 'Review past interests + discuss with mentors',
    'outcome-prediction': 'Research outcomes of similar decision-makers',
  };

  return approaches[factorId] || 'Gather additional evidence through experimentation';
}

// ============================================================================
// ACTION RECOMMENDATION GENERATION
// ============================================================================

/**
 * Generate recommended actions
 */
export function generateRecommendedActions(
  factors: UncertaintyFactor[],
  evidence: MissingEvidence[],
  config: InformationValueConfig = DEFAULT_INFORMATION_VALUE_CONFIG
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  // Generate from evidence
  for (const e of evidence) {
    actions.push(evidenceToAction(e));
  }

  // Add targeted actions for critical factors
  for (const factor of factors.filter(f => f.priority === 'critical')) {
    actions.push(...generateFactorActions(factor));
  }

  // Sort by priority and value
  return actions
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.decisionImprovement - a.decisionImprovement;
    })
    .slice(0, config.maxRecommendations);
}

function evidenceToAction(evidence: MissingEvidence): RecommendedAction {
  const methodMap: Record<InformationType, InformationMethod> = {
    'psychological-assessment': 'assessment',
    'skill-assessment': 'project',
    'interest-exploration': 'reflection',
    'aptitude-testing': 'assessment',
    'reality-constraints': 'conversation',
    'career-research': 'interview',
    'experiential-learning': 'internship',
    'social-feedback': 'conversation',
    'market-research': 'research',
    'outcome-data': 'research',
  };

  return {
    id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    description: evidence.description,
    informationType: evidence.type,
    method: methodMap[evidence.type] || 'research',
    targetFactors: [evidence.type],
    uncertaintyReduction: evidence.confidenceGain * 0.8,
    confidenceGain: evidence.confidenceGain,
    decisionImprovement: evidence.confidenceGain * 0.5,
    cost: evidence.acquisitionCost,
    timeRequired: evidence.timeRequired,
    prerequisites: [],
    priority: evidence.confidenceGain > 20 ? 'critical' : evidence.confidenceGain > 15 ? 'high' : 'medium',
    rationale: `Would address ${evidence.relevance.toLowerCase()}`,
  };
}

function generateFactorActions(factor: UncertaintyFactor): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  switch (factor.id) {
    case 'career-exposure':
      actions.push({
        id: `action-shadowing-${Date.now()}`,
        description: 'Arrange 1-2 day job shadowing in target career',
        informationType: 'experiential-learning',
        method: 'shadowing',
        targetFactors: ['career-exposure', 'fit-assessment'],
        uncertaintyReduction: 30,
        confidenceGain: 25,
        decisionImprovement: 20,
        cost: 'medium',
        timeRequired: '2-3 days',
        prerequisites: ['Identify target career', 'Network connection'],
        priority: 'critical',
        rationale: 'Direct observation provides irreplaceable information about day-to-day reality',
      });
      break;

    case 'aptitude-validation':
      actions.push({
        id: `action-project-${Date.now()}`,
        description: 'Complete small project in target field',
        informationType: 'skill-assessment',
        method: 'project',
        targetFactors: ['aptitude-validation', 'interest-stability'],
        uncertaintyReduction: 25,
        confidenceGain: 20,
        decisionImprovement: 18,
        cost: 'low',
        timeRequired: '1-2 weeks',
        prerequisites: ['Basic skills in area'],
        priority: 'high',
        rationale: 'Validates both ability and sustained interest',
      });
      break;
  }

  return actions;
}

// ============================================================================
// STRATEGIC RECOMMENDATIONS
// ============================================================================

/**
 * Generate strategic recommendations
 */
export function generateStrategy(
  actions: RecommendedAction[],
  config: InformationValueConfig = DEFAULT_INFORMATION_VALUE_CONFIG
): InformationValueAnalysis['strategy'] {
  // Quick wins: low cost + high value
  const quickWins = actions
    .filter(a => (a.cost === 'low' || a.timeRequired.includes('hour')) && a.priority !== 'low')
    .sort((a, b) => b.decisionImprovement - a.decisionImprovement)
    .slice(0, 3);

  // High impact: highest decision improvement
  const highImpact = actions
    .sort((a, b) => b.decisionImprovement - a.decisionImprovement)
    .slice(0, 3);

  // Long-term: higher cost/time but valuable
  const longTerm = actions
    .filter(a => a.cost === 'high' || a.timeRequired.includes('week') || a.timeRequired.includes('month'))
    .sort((a, b) => b.decisionImprovement - a.decisionImprovement)
    .slice(0, 3);

  // Minimum viable: fewest actions to reach target confidence
  const minimumViable = calculateMinimumViable(actions, config.targetConfidence);

  return { quickWins, highImpact, longTerm, minimumViable };
}

function calculateMinimumViable(
  actions: RecommendedAction[],
  targetConfidence: number
): RecommendedAction[] {
  // Sort by confidence gain per unit cost
  const scored = actions.map(a => ({
    action: a,
    score: a.confidenceGain / (a.cost === 'high' ? 3 : a.cost === 'medium' ? 2 : 1),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Greedy selection
  const selected: RecommendedAction[] = [];
  let currentConfidence = 50; // Assume starting point

  for (const { action } of scored) {
    if (currentConfidence >= targetConfidence) break;
    selected.push(action);
    currentConfidence = Math.min(95, currentConfidence + action.confidenceGain * 0.5);
  }

  return selected;
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

/**
 * Generate information value explanation
 */
export function generateExplanation(
  analysis: Omit<InformationValueAnalysis, 'explanation'>
): InformationValueAnalysis['explanation'] {
  const summary = generateAnalysisSummary(analysis);
  const insights = generateInsights(analysis);
  const informationValueExplanation = generateValueExplanation(analysis);
  const recommendedApproach = generateApproach(analysis);
  const nextSteps = generateNextSteps(analysis);

  return {
    summary,
    insights,
    informationValueExplanation,
    recommendedApproach,
    nextSteps,
  };
}

function generateAnalysisSummary(analysis: Omit<InformationValueAnalysis, 'explanation'>): string {
  const criticalFactors = analysis.uncertaintyFactors.filter(f => f.priority === 'critical').length;
  const highValueActions = analysis.allRecommendedActions.filter(a => a.decisionImprovement > 15).length;

  let summary = `Analysis identified ${analysis.uncertaintyFactors.length} significant uncertainty factors `;
  summary += `with ${criticalFactors} critical priorities. `;
  summary += `Your current decision confidence is ${Math.round(analysis.currentConfidence)}%, `;
  summary += `with potential to reach ${Math.round(analysis.targetConfidence)}% through targeted information gathering. `;
  summary += `${highValueActions} high-value information gathering actions are recommended.`;

  return summary;
}

function generateInsights(analysis: Omit<InformationValueAnalysis, 'explanation'>): string[] {
  const insights: string[] = [];

  // Factor insights
  const criticalFactor = analysis.uncertaintyFactors.find(f => f.priority === 'critical');
  if (criticalFactor) {
    insights.push(`Critical uncertainty: ${criticalFactor.name} (${Math.round(criticalFactor.uncertainty)}% uncertainty)`);
  }

  // Gap insights
  if (analysis.missingEvidence.length > 0) {
    insights.push(`Missing evidence: ${analysis.missingEvidence[0].description}`);
  }

  // Value of information
  const maxValue = analysis.uncertaintyFactors[0]?.informationValue || 0;
  insights.push(`Highest value information: could improve decision by ${Math.round(maxValue)}%`);

  // Approach
  if (analysis.strategy.quickWins.length > 0) {
    insights.push(`Quick win available: ${analysis.strategy.quickWins[0].description}`);
  }

  return insights;
}

function generateValueExplanation(analysis: Omit<InformationValueAnalysis, 'explanation'>): string {
  return `Information has value because your current decision is based on incomplete data. ` +
    `Gathering additional evidence can reduce uncertainty from ${Math.round(100 - analysis.currentConfidence)}% ` +
    `to ${Math.round(100 - analysis.targetConfidence)}%, potentially improving decision quality by ` +
    `${Math.round(analysis.targetConfidence - analysis.currentConfidence)} percentage points.`;
}

function generateApproach(analysis: Omit<InformationValueAnalysis, 'explanation'>): string {
  if (analysis.strategy.quickWins.length >= 2) {
    return `Start with quick wins: complete low-cost, high-value actions first to gain immediate confidence. ` +
      `Then proceed to deeper exploration if needed.`;
  }

  if (analysis.uncertaintyFactors.some(f => f.priority === 'critical')) {
    return `Address critical uncertainties first, even if they require more effort. ` +
      `These factors have the highest impact on decision quality.`;
  }

  return `Take a balanced approach: mix quick wins with targeted deep dives to efficiently build decision confidence.`;
}

function generateNextSteps(analysis: Omit<InformationValueAnalysis, 'explanation'>): string[] {
  const steps: string[] = [];

  if (analysis.allRecommendedActions.length > 0) {
    steps.push(`Start with: ${analysis.allRecommendedActions[0].description}`);
  }

  if (analysis.uncertaintyFactors.length > 0) {
    steps.push(`Focus on reducing uncertainty in: ${analysis.uncertaintyFactors[0].name}`);
  }

  if (analysis.missingEvidence.length > 0) {
    steps.push(`Gather missing evidence: ${analysis.missingEvidence[0].description}`);
  }

  steps.push('Reassess confidence after completing 2-3 information gathering actions');
  steps.push('Return to CareerOS for updated recommendations with improved confidence');

  return steps;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze information value for a student
 */
export function analyzeInformationValue(
  studentId: string,
  student: StudentBeliefV3,
  uncertaintyProfile: UncertaintyProfile,
  config: InformationValueConfig = DEFAULT_INFORMATION_VALUE_CONFIG
): InformationValueAnalysis {
  // Identify uncertainty factors
  const uncertaintyFactors = identifyUncertaintyFactors(student, config);

  // Identify missing evidence
  const missingEvidence = identifyMissingEvidence(uncertaintyFactors, config);

  // Identify weak assumptions
  const weakAssumptions = identifyWeakAssumptions(student, uncertaintyFactors);

  // Extract knowledge gaps
  const knowledgeGaps = uncertaintyFactors.flatMap(f => f.knowledgeGaps);

  // Generate recommended actions
  const allRecommendedActions = generateRecommendedActions(uncertaintyFactors, missingEvidence, config);

  // Generate assessments
  const recommendedAssessments = allRecommendedActions
    .filter(a => a.method === 'assessment')
    .map(a => ({
      name: a.description,
      measures: a.targetFactors,
      type: a.informationType,
      expectedOutcomes: [a.rationale],
      confidenceGain: a.confidenceGain,
      timeRequired: a.timeRequired,
      priority: a.priority,
    }));

  // Generate experiments
  const recommendedExperiments = allRecommendedActions
    .filter(a => a.method === 'project' || a.method === 'experiment')
    .map(a => ({
      name: a.description,
      description: a.description,
      hypothesis: a.rationale,
      method: a.method,
      successCriteria: ['Validate interest', 'Confirm aptitude'],
      duration: a.timeRequired,
      expectedLearning: a.targetFactors,
      confidenceGain: a.confidenceGain,
      priority: a.priority,
    }));

  // Generate exploration activities
  const explorationActivities = allRecommendedActions
    .filter(a => a.method === 'interview' || a.method === 'shadowing' || a.method === 'internship')
    .map(a => ({
      name: a.description,
      description: a.description,
      type: a.informationType,
      reveals: a.targetFactors,
      howTo: [a.description],
      resources: a.prerequisites,
      timeRequired: a.timeRequired,
      expectedValue: a.rationale,
      priority: a.priority,
    }));

  // Calculate current and target confidence
  const currentConfidence = uncertaintyProfile.confidence;
  const targetConfidence = config.targetConfidence;
  const confidenceGap = targetConfidence - currentConfidence;

  // Generate strategy
  const strategy = generateStrategy(allRecommendedActions, config);

  // Value of perfect information
  const valueOfPerfectInformation = {
    maxConfidenceGain: Math.min(45, confidenceGap),
    maxDecisionImprovement: Math.min(40, confidenceGap * 0.8),
    achievable: confidenceGap < 40,
    explanation: confidenceGap < 40
      ? 'Target confidence is achievable through recommended information gathering.'
      : 'Target confidence may be difficult to achieve due to inherent uncertainty in long-term predictions.',
  };

  // Build base analysis
  const baseAnalysis = {
    id: `info-value-${studentId}-${Date.now()}`,
    studentId,
    currentConfidence,
    targetConfidence,
    confidenceGap,
    uncertaintyFactors,
    missingEvidence,
    weakAssumptions,
    knowledgeGaps,
    recommendedAssessments,
    recommendedExperiments,
    explorationActivities,
    allRecommendedActions,
    valueOfPerfectInformation,
    strategy,
  };

  // Generate explanation
  const explanation = generateExplanation(baseAnalysis);

  return {
    ...baseAnalysis,
    explanation,
  };
}

// ============================================================================
// INFORMATION VALUE ENGINE CLASS
// ============================================================================

export class InformationValueEngineV1 {
  private config: InformationValueConfig;

  constructor(config?: Partial<InformationValueConfig>) {
    this.config = { ...DEFAULT_INFORMATION_VALUE_CONFIG, ...config };
  }

  /**
   * Analyze information value for a student
   */
  analyze(
    studentId: string,
    student: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationValueAnalysis {
    return analyzeInformationValue(studentId, student, uncertaintyProfile, this.config);
  }

  /**
   * Identify uncertainty factors
   */
  identifyFactors(student: StudentBeliefV3): UncertaintyFactor[] {
    return identifyUncertaintyFactors(student, this.config);
  }

  /**
   * Generate recommended actions
   */
  generateActions(
    factors: UncertaintyFactor[],
    evidence: MissingEvidence[]
  ): RecommendedAction[] {
    return generateRecommendedActions(factors, evidence, this.config);
  }

  /**
   * Calculate minimum viable action set
   */
  calculateMinimumViable(actions: RecommendedAction[]): RecommendedAction[] {
    return calculateMinimumViable(actions, this.config.targetConfidence);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InformationValueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): InformationValueConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createInformationValueEngine(
  config?: Partial<InformationValueConfig>
): InformationValueEngineV1 {
  return new InformationValueEngineV1(config);
}


