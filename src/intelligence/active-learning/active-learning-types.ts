/**
 * CareerOS Active Learning Engine - Type Definitions
 * 
 * Core types for intelligent learning prioritization:
 * - Uncertainty measurement
 * - Learning value estimation
 * - Decision boundary detection
 * - Outcome prioritization
 * - Evidence gap identification
 */

import { StudentProfile } from '@/types/student';
import { CareerPathway } from '@/types/career';
import { Recommendation } from '@/types/recommendation';
import { OutcomeSnapshot } from '@/intelligence/outcome-tracking/outcome-types';

// ============================================================================
// UNCERTAINTY TYPES
// ============================================================================

export type UncertaintyLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical';

export interface UncertaintyComponent {
  value: number; // 0-1 scale
  level: UncertaintyLevel;
  confidence: number;
  factors: string[];
}

export interface UncertaintyProfile {
  studentId: string;
  timestamp: Date;
  
  // Model uncertainty - how uncertain is the underlying model
  modelUncertainty: UncertaintyComponent;
  
  // Decision uncertainty - how uncertain are the student's choices
  decisionUncertainty: UncertaintyComponent;
  
  // Outcome uncertainty - how uncertain are predicted outcomes
  outcomeUncertainty: UncertaintyComponent;
  
  // Recommendation uncertainty - how uncertain are specific recommendations
  recommendationUncertainty: UncertaintyComponent;
  
  // Composite uncertainty score
  compositeUncertainty: number;
  compositeLevel: UncertaintyLevel;
  
  // Breakdown by dimension
  dimensions: {
    career: UncertaintyComponent;
    education: UncertaintyComponent;
    skills: UncertaintyComponent;
    geography: UncertaintyComponent;
    timing: UncertaintyComponent;
  };
}

// ============================================================================
// LEARNING VALUE TYPES
// ============================================================================

export type LearningValueTier = 'minimal' | 'low' | 'moderate' | 'high' | 'exceptional';

export interface LearningValueFactor {
  name: string;
  score: number; // 0-1
  weight: number;
  description: string;
}

export interface LearningValueScore {
  studentId: string;
  timestamp: Date;
  
  // Overall learning value (0-1)
  overallScore: number;
  tier: LearningValueTier;
  
  // Component scores
  uncertaintyValue: LearningValueFactor;
  volatilityValue: LearningValueFactor;
  rarityValue: LearningValueFactor;
  contradictionValue: LearningValueFactor;
  noveltyValue: LearningValueFactor;
  boundaryValue: LearningValueFactor;
  
  // Weighted composite
  weightedScore: number;
  
  // Expected information gain (bits)
  expectedInformationGain: number;
  
  // Priority ranking
  globalRank?: number;
  percentile?: number;
}

// ============================================================================
// DECISION BOUNDARY TYPES
// ============================================================================

export type BoundaryType = 
  | 'career_domain'
  | 'education_path'
  | 'work_environment'
  | 'risk_tolerance'
  | 'geography'
  | 'industry'
  | 'role_type'
  | 'company_stage'
  | 'specialization';

export type BoundaryProximity = 'distant' | 'approaching' | 'near' | 'at_boundary' | 'crossing';

export interface DecisionBoundary {
  id: string;
  type: BoundaryType;
  name: string;
  description: string;
  
  // The two sides of the boundary
  sideA: {
    name: string;
    characteristics: string[];
    examples: string[];
  };
  sideB: {
    name: string;
    characteristics: string[];
    examples: string[];
  };
  
  // Importance weight
  importance: number; // 0-1
  
  // How many students are at this boundary
  studentCount: number;
  
  // Learning value multiplier for boundary students
  learningMultiplier: number;
}

export interface BoundaryPosition {
  boundaryId: string;
  boundaryType: BoundaryType;
  
  // Position relative to boundary (-1 to 1, 0 is exactly on boundary)
  position: number;
  
  // Distance from boundary (0 = on boundary, 1 = far away)
  distance: number;
  
  // Proximity classification
  proximity: BoundaryProximity;
  
  // Which side the student leans toward
  leaning: 'side_a' | 'side_b' | 'neutral';
  leaningConfidence: number;
  
  // Factors pushing toward each side
  factorsA: string[];
  factorsB: string[];
  
  // Learning value from this boundary position
  learningValue: number;
}

export interface DecisionBoundaryProfile {
  studentId: string;
  timestamp: Date;
  
  // All boundary positions for this student
  boundaries: BoundaryPosition[];
  
  // Primary boundary (highest learning value)
  primaryBoundary?: BoundaryPosition;
  
  // Number of boundaries the student is near
  nearBoundaryCount: number;
  
  // Composite boundary score
  boundaryScore: number;
  
  // Is this student at a decision point?
  atDecisionPoint: boolean;
}

// ============================================================================
// OUTCOME PRIORITY TYPES
// ============================================================================

export type OutcomePriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export type OutcomeCategory = 
  | 'career_transition'
  | 'salary_progression'
  | 'skill_acquisition'
  | 'network_growth'
  | 'job_satisfaction'
  | 'work_life_balance'
  | 'entrepreneurial_success'
  | 'further_education'
  | 'geographic_mobility'
  | 'industry_impact';

export interface OutcomePriority {
  category: OutcomeCategory;
  level: OutcomePriorityLevel;
  score: number; // 0-1
  
  // Why this priority?
  rationale: string;
  
  // Evidence strength
  evidenceStrength: number; // 0-1
  
  // Sample size for this outcome type
  sampleSize: number;
  
  // Uncertainty in this outcome
  outcomeUncertainty: number;
  
  // Business impact of learning this outcome
  businessImpact: number;
  
  // Recommended tracking intensity
  trackingIntensity: 'continuous' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface OutcomePriorityProfile {
  studentId: string;
  timestamp: Date;
  
  // Priority for each outcome category
  priorities: OutcomePriority[];
  
  // Overall tracking priority
  overallPriority: OutcomePriorityLevel;
  
  // Categories requiring aggressive tracking
  criticalCategories: OutcomeCategory[];
  highCategories: OutcomeCategory[];
  
  // Recommended check-in frequency
  recommendedCheckInDays: number;
}

// ============================================================================
// EVIDENCE GAP TYPES
// ============================================================================

export type EvidenceGapType = 
  | 'rare_career'
  | 'emerging_field'
  | 'new_industry'
  | 'geographic_region'
  | 'demographic_segment'
  | 'education_pathway'
  | 'skill_combination'
  | 'career_transition'
  | 'outcome_type'
  | 'recommendation_type';

export type EvidenceGapSeverity = 'critical' | 'severe' | 'moderate' | 'minor' | 'negligible';

export interface EvidenceGap {
  id: string;
  type: EvidenceGapType;
  severity: EvidenceGapSeverity;
  
  // What is missing
  description: string;
  
  // Specific area
  area: string;
  
  // Current evidence count
  currentEvidence: number;
  
  // Minimum evidence needed
  minimumEvidence: number;
  
  // Gap size
  gapSize: number;
  
  // Impact on recommendations
  impactOnRecommendations: number; // 0-1
  
  // Students who could fill this gap
  relevantStudentCount: number;
  
  // Priority for filling this gap
  fillPriority: number; // 0-1
  
  // Suggested data collection strategies
  strategies: string[];
}

export interface EvidenceGapProfile {
  studentId: string;
  timestamp: Date;
  
  // Gaps relevant to this student
  relevantGaps: EvidenceGap[];
  
  // Gaps this student could help fill
  fillableGaps: EvidenceGap[];
  
  // Student's contribution potential
  contributionScore: number;
}

// ============================================================================
// ACTIVE LEARNING REPORT TYPES
// ============================================================================

export interface LearningRecommendation {
  type: 'track_outcome' | 'validate_recommendation' | 'explore_boundary' | 'fill_evidence_gap' | 'deep_dive';
  priority: OutcomePriorityLevel;
  description: string;
  rationale: string;
  
  // Target student(s)
  targetStudentIds: string[];
  
  // Expected learning value
  expectedLearningValue: number;
  
  // Cost to implement
  estimatedCost: 'low' | 'medium' | 'high';
  
  // Timeline
  timeline: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  
  // Success metrics
  successMetrics: string[];
}

export interface ActiveLearningReport {
  reportId: string;
  generatedAt: Date;
  
  // Summary statistics
  summary: {
    totalStudentsAnalyzed: number;
    highLearningValueStudents: number;
    studentsAtBoundaries: number;
    criticalEvidenceGaps: number;
    recommendationsGenerated: number;
  };
  
  // Top learning opportunities
  topLearningOpportunities: LearningValueScore[];
  
  // Critical decision boundaries
  criticalBoundaries: DecisionBoundary[];
  
  // Evidence gaps requiring attention
  criticalEvidenceGaps: EvidenceGap[];
  
  // Prioritized recommendations
  recommendations: LearningRecommendation[];
  
  // Learning focus areas
  focusAreas: {
    area: string;
    priority: OutcomePriorityLevel;
    rationale: string;
  }[];
  
  // Resource allocation suggestions
  resourceAllocation: {
    area: string;
    suggestedEffort: number; // percentage
    expectedImpact: number;
  }[];
}

// ============================================================================
// ENGINE CONFIGURATION TYPES
// ============================================================================

export interface UncertaintyEngineConfig {
  // Weights for composite uncertainty
  modelWeight: number;
  decisionWeight: number;
  outcomeWeight: number;
  recommendationWeight: number;
  
  // Thresholds for uncertainty levels
  thresholds: {
    veryLow: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
  
  // Minimum confidence for reliable uncertainty
  minConfidence: number;
}

export interface LearningValueEngineConfig {
  // Factor weights
  uncertaintyWeight: number;
  volatilityWeight: number;
  rarityWeight: number;
  contradictionWeight: number;
  noveltyWeight: number;
  boundaryWeight: number;
  
  // Tier thresholds
  tierThresholds: {
    minimal: number;
    low: number;
    moderate: number;
    high: number;
    exceptional: number;
  };
  
  // Minimum sample size for reliable estimates
  minSampleSize: number;
}

export interface DecisionBoundaryEngineConfig {
  // Proximity thresholds
  distantThreshold: number;
  approachingThreshold: number;
  nearThreshold: number;
  boundaryThreshold: number;
  
  // Minimum importance for boundary consideration
  minImportance: number;
  
  // Learning multiplier by proximity
  proximityMultipliers: {
    distant: number;
    approaching: number;
    near: number;
    at_boundary: number;
    crossing: number;
  };
}

export interface OutcomePriorityEngineConfig {
  // Priority thresholds
  criticalThreshold: number;
  highThreshold: number;
  mediumThreshold: number;
  lowThreshold: number;
  
  // Minimum evidence for priority assessment
  minEvidence: number;
  
  // Check-in frequency mapping
  checkInDays: {
    continuous: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  };
}

export interface EvidenceGapEngineConfig {
  // Severity thresholds
  criticalThreshold: number;
  severeThreshold: number;
  moderateThreshold: number;
  minorThreshold: number;
  
  // Minimum sample sizes by gap type
  minSamplesByType: Record<EvidenceGapType, number>;
  
  // Impact weights
  recommendationImpactWeight: number;
  studentRelevanceWeight: number;
}

export interface ActiveLearningEngineConfig {
  uncertainty: UncertaintyEngineConfig;
  learningValue: LearningValueEngineConfig;
  decisionBoundary: DecisionBoundaryEngineConfig;
  outcomePriority: OutcomePriorityEngineConfig;
  evidenceGap: EvidenceGapEngineConfig;
  
  // Global settings
  maxStudentsPerBatch: number;
  minLearningValueThreshold: number;
  reportGenerationInterval: number; // days
}

// ============================================================================
// STUDENT LEARNING PROFILE
// ============================================================================

export interface StudentLearningProfile {
  studentId: string;
  lastUpdated: Date;
  
  // All engine outputs
  uncertainty: UncertaintyProfile;
  learningValue: LearningValueScore;
  decisionBoundaries: DecisionBoundaryProfile;
  outcomePriorities: OutcomePriorityProfile;
  evidenceGaps: EvidenceGapProfile;
  
  // Composite learning priority
  learningPriority: number; // 0-1
  priorityRank?: number;
  
  // Recommended actions
  recommendedActions: string[];
  
  // Historical learning value trend
  learningValueHistory: {
    timestamp: Date;
    score: number;
  }[];
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

export interface IUncertaintyEngine {
  calculateUncertainty(student: StudentProfile): Promise<UncertaintyProfile>;
  calculateBatchUncertainty(students: StudentProfile[]): Promise<UncertaintyProfile[]>;
  getUncertaintyTrend(studentId: string, days: number): Promise<UncertaintyComponent[]>;
}

export interface ILearningValueEngine {
  calculateLearningValue(
    student: StudentProfile,
    uncertainty: UncertaintyProfile,
    boundaries: DecisionBoundaryProfile
  ): Promise<LearningValueScore>;
  rankStudentsByLearningValue(profiles: StudentLearningProfile[]): StudentLearningProfile[];
  getLearningValueDistribution(): Promise<{
    tier: LearningValueTier;
    count: number;
    percentage: number;
  }[]>;
}

export interface IDecisionBoundaryEngine {
  detectBoundaries(student: StudentProfile): Promise<DecisionBoundaryProfile>;
  getAllBoundaries(): DecisionBoundary[];
  getBoundaryById(id: string): DecisionBoundary | undefined;
  findStudentsAtBoundary(boundaryId: string): Promise<string[]>;
}

export interface IOutcomePriorityEngine {
  calculatePriorities(
    student: StudentProfile,
    recommendations: Recommendation[]
  ): Promise<OutcomePriorityProfile>;
  getCategoryStats(category: OutcomeCategory): Promise<{
    sampleSize: number;
    evidenceStrength: number;
    priority: OutcomePriorityLevel;
  }>;
}

export interface IEvidenceGapEngine {
  identifyGaps(student: StudentProfile): Promise<EvidenceGapProfile>;
  getAllGaps(): EvidenceGap[];
  getCriticalGaps(): EvidenceGap[];
  calculateContributionPotential(student: StudentProfile): number;
}

export interface IActiveLearningEngine {
  generateStudentProfile(student: StudentProfile): Promise<StudentLearningProfile>;
  generateBatchProfiles(students: StudentProfile[]): Promise<StudentLearningProfile[]>;
  generateLearningReport(): Promise<ActiveLearningReport>;
  getTopLearningOpportunities(count: number): Promise<StudentLearningProfile[]>;
  getRecommendationsForStudent(studentId: string): Promise<LearningRecommendation[]>;
}
