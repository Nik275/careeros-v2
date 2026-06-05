/**
 * CareerOS Uncertainty Intelligence Foundation V1
 *
 * Explicitly models uncertainty in all CareerOS outputs.
 * Transforms deterministic scores into confidence-bounded predictions.
 *
 * Features:
 * - Multi-dimensional confidence calculation
 * - Uncertainty quantification
 * - Evidence quality assessment
 * - Data completeness tracking
 * - Explainable uncertainty reasoning
 *
 * @module intelligence/uncertainty-engine
 * @version 1.0.0
 */

import type { StudentBeliefV3 } from '../types/index.js';
// Career data type - using generic interface to avoid circular dependencies
interface CareerData {
  id: string;
  attributes: Record<string, unknown>;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Confidence level classification
 */
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

/**
 * Uncertainty profile for any CareerOS output
 */
export interface UncertaintyProfile {
  /** Unique identifier */
  id: string;

  /** What this uncertainty profile describes */
  subject: {
    type: 'student' | 'career' | 'path' | 'decision' | 'recommendation' | 'simulation';
    id: string;
    description: string;
  };

  /** Overall confidence (0-100) */
  confidence: number;

  /** Overall uncertainty (0-100, inverse of confidence) */
  uncertainty: number;

  /** Confidence level classification */
  confidenceLevel: ConfidenceLevel;

  /** Evidence quality (0-100) */
  evidenceQuality: number;

  /** Data completeness (0-100) */
  dataCompleteness: number;

  /** Component-level confidence breakdown */
  components: {
    /** Student profile completeness */
    studentProfile: ComponentConfidence;

    /** Career data quality */
    careerData: ComponentConfidence;

    /** Graph relationship quality */
    graphQuality: ComponentConfidence;

    /** Simulation/model confidence */
    simulation: ComponentConfidence;

    /** Temporal stability (will predictions hold) */
    temporalStability: ComponentConfidence;

    /** External factors (market conditions, etc.) */
    externalFactors: ComponentConfidence;
  };

  /** Confidence bounds for predictions */
  bounds: {
    /** Lower bound (conservative estimate) */
    lower: number;

    /** Point estimate (expected value) */
    expected: number;

    /** Upper bound (optimistic estimate) */
    upper: number;

    /** Confidence interval width */
    width: number;
  };

  /** Human-readable explanations */
  explanation: {
    /** Overall confidence summary */
    summary: string;

    /** Why confidence is at this level */
    reasons: string[];

    /** Specific gaps or limitations */
    gaps: string[];

    /** Recommendations to improve confidence */
    recommendations: string[];
  };

  /** Timestamp */
  timestamp: number;
}

/**
 * Confidence for a specific component
 */
export interface ComponentConfidence {
  /** Confidence score (0-100) */
  score: number;

  /** Level classification */
  level: ConfidenceLevel;

  /** What contributes to this score */
  factors: Array<{
    factor: string;
    impact: number; // How much this affects the score
    status: 'positive' | 'negative' | 'neutral';
  }>;

  /** Gaps in this component */
  gaps: string[];
}

/**
 * Student profile confidence assessment
 */
export interface StudentProfileConfidence {
  /** Overall profile completeness */
  overall: number;

  /** Psychological assessment completeness */
  psychological: number;

  /** Reality domains coverage */
  realityDomains: {
    family: number;
    economic: number;
    educational: number;
    decisionContext: number;
  };

  /** Assessment quality */
  assessmentQuality: {
    /** Number of assessments completed */
    count: number;

    /** Average assessment confidence */
    averageConfidence: number;

    /** Time since last assessment (days) */
    freshness: number;
  };

  /** Missing critical information */
  missingInfo: string[];
}

/**
 * Career data confidence assessment
 */
export interface CareerDataConfidence {
  /** Overall career data quality */
  overall: number;

  /** Evidence backing */
  evidence: {
    /** Amount of evidence available */
    quantity: number;

    /** Quality of evidence */
    quality: number;

    /** Recency of evidence */
    freshness: number;

    /** Source diversity */
    diversity: number;
  };

  /** Data coverage */
  coverage: {
    /** Percentage of attributes with data */
    attributeCoverage: number;

    /** Percentage of careers with profiles */
    careerCoverage: number;

    /** Percentage of relationships mapped */
    relationshipCoverage: number;
  };

  /** Known limitations */
  limitations: string[];
}

/**
 * Graph quality confidence assessment
 */
export interface GraphQualityConfidence {
  /** Overall graph quality */
  overall: number;

  /** Node coverage */
  nodes: {
    /** Total nodes */
    total: number;

    /** Nodes with complete profiles */
    complete: number;

    /** Percentage complete */
    coverage: number;
  };

  /** Edge coverage */
  edges: {
    /** Total possible edges */
    possible: number;

    /** Actual edges */
    actual: number;

    /** Density (0-1) */
    density: number;
  };

  /** Edge quality */
  edgeQuality: {
    /** Percentage with weights */
    weighted: number;

    /** Percentage with evidence */
    evidenced: number;

    /** Average confidence in edges */
    averageConfidence: number;
  };

  /** Graph connectivity */
  connectivity: {
    /** Number of connected components */
    components: number;

    /** Average path length */
    averagePathLength: number;

    /** Clustering coefficient */
    clustering: number;
  };
}

/**
 * Simulation confidence assessment
 */
export interface SimulationConfidence {
  /** Overall simulation confidence */
  overall: number;

  /** Model quality */
  model: {
    /** Validation accuracy (if known) */
    validationAccuracy?: number;

    /** Complexity appropriateness */
    complexity: number;

    /** Assumption validity */
    assumptions: number;
  };

  /** Input data quality */
  inputs: {
    /** Completeness of input data */
    completeness: number;

    /** Quality of input data */
    quality: number;

    /** Consistency across inputs */
    consistency: number;
  };

  /** Scenario coverage */
  scenarios: {
    /** Number of scenarios simulated */
    count: number;

    /** Diversity of scenarios */
    diversity: number;

    /** Edge case coverage */
    edgeCases: number;
  };

  /** Temporal factors */
  temporal: {
    /** Prediction horizon (years) */
    horizon: number;

    /** Confidence decay over time */
    decayRate: number;

    /** Stability of underlying trends */
    trendStability: number;
  };
}

/**
 * Uncertainty engine configuration
 */
export interface UncertaintyEngineConfig {
  /** Minimum confidence threshold for "reliable" outputs */
  minReliableConfidence: number;

  /** Weights for component contributions to overall confidence */
  componentWeights: {
    studentProfile: number;
    careerData: number;
    graphQuality: number;
    simulation: number;
    temporalStability: number;
    externalFactors: number;
  };

  /** Confidence bounds calculation method */
  boundsMethod: 'symmetric' | 'asymmetric' | 'percentile';

  /** Whether to include uncertainty in all outputs */
  propagateUncertainty: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_UNCERTAINTY_CONFIG: UncertaintyEngineConfig = {
  minReliableConfidence: 70,
  componentWeights: {
    studentProfile: 0.25,
    careerData: 0.20,
    graphQuality: 0.15,
    simulation: 0.20,
    temporalStability: 0.10,
    externalFactors: 0.10,
  },
  boundsMethod: 'symmetric',
  propagateUncertainty: true,
};

// ============================================================================
// CONFIDENCE LEVEL UTILITIES
// ============================================================================

/**
 * Convert numeric confidence to level
 */
export function confidenceToLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 85) return 'VERY_HIGH';
  if (confidence >= 70) return 'HIGH';
  if (confidence >= 50) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get human-readable description of confidence level
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
  const descriptions: Record<ConfidenceLevel, string> = {
    'VERY_HIGH': 'Very high confidence - predictions are likely accurate',
    'HIGH': 'High confidence - predictions are probably accurate',
    'MEDIUM': 'Medium confidence - predictions may be accurate, but significant uncertainty exists',
    'LOW': 'Low confidence - predictions are speculative',
  };
  return descriptions[level];
}

// ============================================================================
// STUDENT PROFILE CONFIDENCE
// ============================================================================

/**
 * Calculate confidence in student profile
 */
export function calculateStudentProfileConfidence(
  studentBelief: StudentBeliefV3,
  assessmentsCompleted: number = 0,
  lastAssessmentDays: number = 0
): StudentProfileConfidence {
  // Calculate psychological completeness
  const hasPersonality = studentBelief.personalityTraits && studentBelief.personalityTraits.length > 0;
  const hasMotivations = studentBelief.motivations && studentBelief.motivations.length > 0;
  const hasStrengths = studentBelief.strengths && studentBelief.strengths.length > 0;
  const hasValues = studentBelief.values && studentBelief.values.length > 0;
  const hasLifestyle = studentBelief.lifestylePreferences && studentBelief.lifestylePreferences.length > 0;
  const hasConstraints = studentBelief.constraints && studentBelief.constraints.length > 0;
  
  const psychologicalComponents = [hasPersonality, hasMotivations, hasStrengths, hasValues, hasLifestyle, hasConstraints];
  const psychological = psychologicalComponents.filter(Boolean).length / psychologicalComponents.length * 100;

  // Calculate reality domain coverage
  const realityDomains = {
    family: studentBelief.familyReality ? 100 : 0,
    economic: studentBelief.economicReality ? 100 : 0,
    educational: studentBelief.educationalReality ? 100 : 0,
    decisionContext: studentBelief.decisionState ? 100 : 0,
  };

  // Assessment quality
  const assessmentQuality = {
    count: assessmentsCompleted,
    averageConfidence: assessmentsCompleted > 0 ? 75 : 0,
    freshness: Math.max(0, 100 - lastAssessmentDays * 2), // Decay 2% per day
  };

  // Calculate overall
  const overall = (
    psychological * 0.3 +
    Object.values(realityDomains).reduce((sum, s) => sum + s, 0) / 4 * 0.4 +
    (assessmentsCompleted > 0 ? 100 : 0) * 0.2 +
    assessmentQuality.freshness * 0.1
  );

  // Identify missing info
  const missingInfo: string[] = [];
  if (psychological < 80) missingInfo.push('Complete psychological assessment');
  if (!studentBelief.familyReality) missingInfo.push('Family reality assessment');
  if (!studentBelief.economicReality) missingInfo.push('Economic reality assessment');
  if (assessmentsCompleted < 3) missingInfo.push('Additional career assessments');

  return {
    overall: Math.round(overall),
    psychological: Math.round(psychological),
    realityDomains,
    assessmentQuality,
    missingInfo,
  };
}

// ============================================================================
// CAREER DATA CONFIDENCE
// ============================================================================

/**
 * Calculate confidence in career data
 */
export function calculateCareerDataConfidence(
  careersAnalyzed: CareerData[],
  evidenceCount: number = 0
): CareerDataConfidence {
  const totalCareers = careersAnalyzed.length;
  
  // Evidence metrics
  const evidence = {
    quantity: Math.min(100, evidenceCount * 5), // 20 pieces = 100%
    quality: 75, // Default assumption
    freshness: 70, // Default assumption
    diversity: Math.min(100, evidenceCount * 3), // 33 sources = 100%
  };

  // Coverage metrics
  const attributesPerCareer = careersAnalyzed.map(c => 
    Object.values(c.attributes).filter(a => a !== undefined).length
  );
  const avgAttributes = attributesPerCareer.reduce((sum, a) => sum + a, 0) / Math.max(1, totalCareers);
  const attributeCoverage = Math.min(100, avgAttributes / 10 * 100); // Assume 10 attrs = full

  const coverage = {
    attributeCoverage: Math.round(attributeCoverage),
    careerCoverage: Math.min(100, totalCareers), // Capped at 100
    relationshipCoverage: 50, // Default assumption
  };

  // Calculate overall
  const overall = (
    evidence.quality * 0.3 +
    coverage.attributeCoverage * 0.25 +
    coverage.careerCoverage * 0.25 +
    evidence.freshness * 0.2
  );

  // Known limitations
  const limitations: string[] = [];
  if (totalCareers < 50) limitations.push('Limited career coverage');
  if (evidenceCount < 20) limitations.push('Insufficient evidence base');
  if (coverage.relationshipCoverage < 70) limitations.push('Incomplete relationship mapping');

  return {
    overall: Math.round(overall),
    evidence,
    coverage,
    limitations,
  };
}

// ============================================================================
// GRAPH QUALITY CONFIDENCE
// ============================================================================

/**
 * Calculate confidence in graph quality
 */
export function calculateGraphQualityConfidence(
  nodeCount: number,
  edgeCount: number,
  weightedEdges: number = 0,
  evidencedEdges: number = 0
): GraphQualityConfidence {
  // Node metrics
  const nodes = {
    total: nodeCount,
    complete: Math.round(nodeCount * 0.8), // Assume 80% complete
    coverage: 80,
  };

  // Edge metrics
  const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2;
  const edges = {
    possible: maxPossibleEdges,
    actual: edgeCount,
    density: maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0,
  };

  // Edge quality
  const edgeQuality = {
    weighted: edgeCount > 0 ? Math.round(weightedEdges / edgeCount * 100) : 0,
    evidenced: edgeCount > 0 ? Math.round(evidencedEdges / edgeCount * 100) : 0,
    averageConfidence: 65, // Default
  };

  // Connectivity (simplified)
  const connectivity = {
    components: Math.max(1, Math.round(nodeCount / 10)),
    averagePathLength: Math.log(nodeCount + 1),
    clustering: edges.density * 0.5,
  };

  // Calculate overall
  const overall = (
    nodes.coverage * 0.25 +
    Math.min(100, edges.density * 200) * 0.25 + // Scale density
    edgeQuality.weighted * 0.2 +
    edgeQuality.evidenced * 0.2 +
    (connectivity.components === 1 ? 100 : 50) * 0.1
  );

  return {
    overall: Math.round(overall),
    nodes,
    edges,
    edgeQuality,
    connectivity,
  };
}

// ============================================================================
// SIMULATION CONFIDENCE
// ============================================================================

/**
 * Calculate confidence in simulation results
 */
export function calculateSimulationConfidence(
  scenarioCount: number,
  predictionYears: number,
  validationAccuracy?: number
): SimulationConfidence {
  // Model quality
  const model = {
    validationAccuracy,
    complexity: 70, // Balanced complexity
    assumptions: 65, // Reasonable assumptions
  };

  // Inputs
  const inputs = {
    completeness: 75,
    quality: 70,
    consistency: 80,
  };

  // Scenarios
  const scenarios = {
    count: scenarioCount,
    diversity: Math.min(100, scenarioCount * 10),
    edgeCases: Math.min(100, scenarioCount * 5),
  };

  // Temporal
  const temporal = {
    horizon: predictionYears,
    decayRate: Math.min(50, predictionYears * 5), // 5% per year
    trendStability: Math.max(0, 100 - predictionYears * 3),
  };

  // Calculate overall
  const overall = (
    (validationAccuracy || 60) * 0.3 +
    inputs.completeness * 0.2 +
    inputs.quality * 0.15 +
    scenarios.diversity * 0.15 +
    temporal.trendStability * 0.2
  );

  return {
    overall: Math.round(overall),
    model,
    inputs,
    scenarios,
    temporal,
  };
}

// ============================================================================
// UNCERTAINTY PROFILE GENERATION
// ============================================================================

/**
 * Generate complete uncertainty profile
 */
export function generateUncertaintyProfile(
  subjectType: UncertaintyProfile['subject']['type'],
  subjectId: string,
  subjectDescription: string,
  studentConfidence: StudentProfileConfidence,
  careerConfidence: CareerDataConfidence,
  graphConfidence: GraphQualityConfidence,
  simulationConfidence: SimulationConfidence,
  pointEstimate: number,
  config: UncertaintyEngineConfig = DEFAULT_UNCERTAINTY_CONFIG
): UncertaintyProfile {
  // Calculate component confidences
  const studentProfile: ComponentConfidence = {
    score: studentConfidence.overall,
    level: confidenceToLevel(studentConfidence.overall),
    factors: [
      { factor: 'Psychological assessment', impact: 30, status: studentConfidence.psychological > 70 ? 'positive' : 'negative' },
      { factor: 'Reality domain coverage', impact: 40, status: studentConfidence.realityDomains.family > 50 ? 'positive' : 'negative' },
      { factor: 'Assessment freshness', impact: 10, status: studentConfidence.assessmentQuality.freshness > 70 ? 'positive' : 'negative' },
    ],
    gaps: studentConfidence.missingInfo,
  };

  const careerData: ComponentConfidence = {
    score: careerConfidence.overall,
    level: confidenceToLevel(careerConfidence.overall),
    factors: [
      { factor: 'Evidence quality', impact: 30, status: careerConfidence.evidence.quality > 70 ? 'positive' : 'negative' },
      { factor: 'Attribute coverage', impact: 25, status: careerConfidence.coverage.attributeCoverage > 70 ? 'positive' : 'negative' },
      { factor: 'Career coverage', impact: 25, status: careerConfidence.coverage.careerCoverage > 50 ? 'positive' : 'negative' },
    ],
    gaps: careerConfidence.limitations,
  };

  const graphQuality: ComponentConfidence = {
    score: graphConfidence.overall,
    level: confidenceToLevel(graphConfidence.overall),
    factors: [
      { factor: 'Node coverage', impact: 25, status: graphConfidence.nodes.coverage > 70 ? 'positive' : 'negative' },
      { factor: 'Edge density', impact: 25, status: graphConfidence.edges.density > 0.1 ? 'positive' : 'negative' },
      { factor: 'Weighted edges', impact: 20, status: graphConfidence.edgeQuality.weighted > 50 ? 'positive' : 'negative' },
    ],
    gaps: [],
  };

  const simulation: ComponentConfidence = {
    score: simulationConfidence.overall,
    level: confidenceToLevel(simulationConfidence.overall),
    factors: [
      { factor: 'Input completeness', impact: 20, status: simulationConfidence.inputs.completeness > 70 ? 'positive' : 'negative' },
      { factor: 'Scenario diversity', impact: 15, status: simulationConfidence.scenarios.diversity > 50 ? 'positive' : 'negative' },
      { factor: 'Temporal stability', impact: 20, status: simulationConfidence.temporal.trendStability > 60 ? 'positive' : 'negative' },
    ],
    gaps: [],
  };

  const temporalStability: ComponentConfidence = {
    score: simulationConfidence.temporal.trendStability,
    level: confidenceToLevel(simulationConfidence.temporal.trendStability),
    factors: [
      { factor: 'Prediction horizon', impact: 50, status: simulationConfidence.temporal.horizon < 5 ? 'positive' : 'negative' },
      { factor: 'Trend stability', impact: 50, status: simulationConfidence.temporal.trendStability > 70 ? 'positive' : 'negative' },
    ],
    gaps: simulationConfidence.temporal.horizon > 10 ? ['Long prediction horizon reduces confidence'] : [],
  };

  const externalFactors: ComponentConfidence = {
    score: 60, // Default moderate confidence
    level: 'MEDIUM',
    factors: [
      { factor: 'Labor market stability', impact: 40, status: 'neutral' },
      { factor: 'Economic conditions', impact: 30, status: 'neutral' },
      { factor: 'Technological change', impact: 30, status: 'neutral' },
    ],
    gaps: ['External factors are inherently uncertain'],
  };

  // Calculate overall confidence
  const overallConfidence = (
    studentProfile.score * config.componentWeights.studentProfile +
    careerData.score * config.componentWeights.careerData +
    graphQuality.score * config.componentWeights.graphQuality +
    simulation.score * config.componentWeights.simulation +
    temporalStability.score * config.componentWeights.temporalStability +
    externalFactors.score * config.componentWeights.externalFactors
  );

  const uncertainty = 100 - overallConfidence;
  const confidenceLevel = confidenceToLevel(overallConfidence);

  // Calculate bounds
  let lower: number;
  let upper: number;
  
  switch (config.boundsMethod) {
    case 'asymmetric':
      // Asymmetric: more downside uncertainty
      lower = pointEstimate * (overallConfidence / 100) * 0.8;
      upper = pointEstimate + (100 - pointEstimate) * (overallConfidence / 100) * 0.5;
      break;
    case 'percentile':
      // Percentile-based
      const range = (100 - overallConfidence) * 0.5;
      lower = Math.max(0, pointEstimate - range);
      upper = Math.min(100, pointEstimate + range);
      break;
    default: // symmetric
      const halfWidth = (100 - overallConfidence) * 0.4;
      lower = Math.max(0, pointEstimate - halfWidth);
      upper = Math.min(100, pointEstimate + halfWidth);
  }

  // Generate explanation
  const explanation = generateUncertaintyExplanation(
    overallConfidence,
    studentProfile,
    careerData,
    simulation
  );

  return {
    id: `uncertainty-${subjectId}-${Date.now()}`,
    subject: {
      type: subjectType,
      id: subjectId,
      description: subjectDescription,
    },
    confidence: Math.round(overallConfidence),
    uncertainty: Math.round(uncertainty),
    confidenceLevel,
    evidenceQuality: careerConfidence.evidence.quality,
    dataCompleteness: studentConfidence.overall,
    components: {
      studentProfile,
      careerData,
      graphQuality,
      simulation,
      temporalStability,
      externalFactors,
    },
    bounds: {
      lower: Math.round(lower),
      expected: pointEstimate,
      upper: Math.round(upper),
      width: Math.round(upper - lower),
    },
    explanation,
    timestamp: Date.now(),
  };
}

function generateUncertaintyExplanation(
  overallConfidence: number,
  studentProfile: ComponentConfidence,
  careerData: ComponentConfidence,
  simulation: ComponentConfidence
): UncertaintyProfile['explanation'] {
  const reasons: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];

  // Student profile reasons
  if (studentProfile.score >= 80) {
    reasons.push('Student profile is comprehensive and well-assessed.');
  } else if (studentProfile.score >= 60) {
    reasons.push('Student profile is moderately complete.');
    gaps.push('Some psychological or reality domain assessments are missing.');
    recommendations.push('Complete remaining assessment modules.');
  } else {
    reasons.push('Student profile has significant gaps.');
    gaps.push('Critical information about student preferences and constraints is missing.');
    recommendations.push('Priority: Complete full student assessment.');
  }

  // Career data reasons
  if (careerData.score >= 75) {
    reasons.push('Career data quality is good with solid evidence base.');
  } else if (careerData.score >= 50) {
    reasons.push('Career data is adequate but could be improved.');
    gaps.push('Limited career coverage or evidence.');
    recommendations.push('Expand career database and evidence collection.');
  } else {
    reasons.push('Career data quality is limited.');
    gaps.push('Insufficient career profiles and supporting evidence.');
    recommendations.push('Significant data collection needed.');
  }

  // Simulation reasons
  if (simulation.score >= 75) {
    reasons.push('Simulation models are well-validated and robust.');
  } else {
    reasons.push('Simulation confidence is moderate due to prediction uncertainty.');
    gaps.push('Long-term predictions are inherently uncertain.');
    recommendations.push('Focus on near-term decisions where confidence is higher.');
  }

  const summary = `Confidence = ${Math.round(overallConfidence)}% (${getConfidenceDescription(confidenceToLevel(overallConfidence))})`;

  return {
    summary,
    reasons,
    gaps,
    recommendations,
  };
}

// ============================================================================
// UNCERTAINTY ENGINE CLASS
// ============================================================================

export class UncertaintyEngineV1 {
  private config: UncertaintyEngineConfig;

  constructor(config?: Partial<UncertaintyEngineConfig>) {
    this.config = { ...DEFAULT_UNCERTAINTY_CONFIG, ...config };
  }

  /**
   * Calculate confidence from student profile
   */
  calculateStudentConfidence(
    studentBelief: StudentBeliefV3,
    assessmentsCompleted?: number,
    lastAssessmentDays?: number
  ): StudentProfileConfidence {
    return calculateStudentProfileConfidence(studentBelief, assessmentsCompleted, lastAssessmentDays);
  }

  /**
   * Calculate confidence in career data
   */
  calculateCareerConfidence(
    careers: CareerData[],
    evidenceCount?: number
  ): CareerDataConfidence {
    return calculateCareerDataConfidence(careers, evidenceCount);
  }

  /**
   * Calculate confidence in graph quality
   */
  calculateGraphConfidence(
    nodeCount: number,
    edgeCount: number,
    weightedEdges?: number,
    evidencedEdges?: number
  ): GraphQualityConfidence {
    return calculateGraphQualityConfidence(nodeCount, edgeCount, weightedEdges, evidencedEdges);
  }

  /**
   * Calculate confidence in simulation
   */
  calculateSimulationConfidence(
    scenarioCount: number,
    predictionYears: number,
    validationAccuracy?: number
  ): SimulationConfidence {
    return calculateSimulationConfidence(scenarioCount, predictionYears, validationAccuracy);
  }

  /**
   * Generate complete uncertainty profile
   */
  generateProfile(
    subjectType: UncertaintyProfile['subject']['type'],
    subjectId: string,
    subjectDescription: string,
    studentConfidence: StudentProfileConfidence,
    careerConfidence: CareerDataConfidence,
    graphConfidence: GraphQualityConfidence,
    simulationConfidence: SimulationConfidence,
    pointEstimate: number
  ): UncertaintyProfile {
    return generateUncertaintyProfile(
      subjectType,
      subjectId,
      subjectDescription,
      studentConfidence,
      careerConfidence,
      graphConfidence,
      simulationConfidence,
      pointEstimate,
      this.config
    );
  }

  /**
   * Check if confidence is sufficient for reliable output
   */
  isReliable(confidence: number): boolean {
    return confidence >= this.config.minReliableConfidence;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<UncertaintyEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): UncertaintyEngineConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createUncertaintyEngine(
  config?: Partial<UncertaintyEngineConfig>
): UncertaintyEngineV1 {
  return new UncertaintyEngineV1(config);
}


