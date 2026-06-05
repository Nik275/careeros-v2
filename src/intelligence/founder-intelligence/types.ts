/**
 * Founder Intelligence V2 - Type Definitions
 * 
 * This module defines the complete type system for evaluating founder potential.
 * Unlike simple "startup interest" detection, this system evaluates the specific
 * psychological and behavioral traits that predict entrepreneurial success.
 * 
 * KEY PRINCIPLE: Founder ≠ Freelancer ≠ Consultant ≠ Researcher
 * 
 * The system uses an 8-dimension signal framework with false-positive protection
 * to distinguish true founder potential from related but distinct profiles.
 * 
 * @module intelligence/founder-intelligence
 */

import { StudentProfile } from '@/domains/student/StudentProfile';
import { AssessmentResponse } from '@/types/assessment';

// ============================================================================
// FOUNDER POTENTIAL ENUMS
// ============================================================================

/**
 * The 8 core dimensions of founder potential.
 * 
 * These dimensions were selected based on research into successful founders
 * and distinguish founders from freelancers, consultants, and other independent
 * professionals who may share some surface-level similarities.
 */
export enum FounderDimension {
  /** Ability to identify problems worth solving and market opportunities */
  OPPORTUNITY_RECOGNITION = 'OPPORTUNITY_RECOGNITION',
  
  /** Capacity for sustained commitment over years despite setbacks */
  OBSESSION_CAPACITY = 'OBSESSION_CAPACITY',
  
  /** Ability to create progress with limited resources */
  RESOURCEFULNESS = 'RESOURCEFULNESS',
  
  /** Comfort operating without clear structure or complete information */
  AMBIGUITY_TOLERANCE = 'AMBIGUITY_TOLERANCE',
  
  /** Ability to recover from failure and persist through challenges */
  RESILIENCE = 'RESILIENCE',
  
  /** Ability to attract, inspire, and retain talented people */
  TALENT_MAGNETISM = 'TALENT_MAGNETISM',
  
  /** Ability to persuade, sell ideas, and build relationships */
  SALES_CAPABILITY = 'SALES_CAPABILITY',
  
  /** Tendency to take ownership and act with accountability */
  OWNERSHIP_ORIENTATION = 'OWNERSHIP_ORIENTATION',
}

/**
 * Classification of founder types based on primary strengths.
 * 
 * These are not mutually exclusive - a founder may have characteristics
 * of multiple types, but typically has one dominant pattern.
 */
export enum FounderType {
  /** Technical depth with product-building capability */
  TECHNICAL_FOUNDER = 'TECHNICAL_FOUNDER',
  
  /** Product vision and user-centric design thinking */
  PRODUCT_FOUNDER = 'PRODUCT_FOUNDER',
  
  /** Business development, partnerships, and market expansion */
  BUSINESS_FOUNDER = 'BUSINESS_FOUNDER',
  
  /** Bold vision and category creation capability */
  VISIONARY_FOUNDER = 'VISIONARY_FOUNDER',
  
  /** Mission-driven with social impact focus */
  SOCIAL_ENTREPRENEUR = 'SOCIAL_ENTREPRENEUR',
  
  /** Community building and network effects expertise */
  COMMUNITY_BUILDER = 'COMMUNITY_BUILDER',
  
  /** Content, media, or creative product focus */
  CREATOR_FOUNDER = 'CREATOR_FOUNDER',
}

/**
 * Founder readiness levels indicating current capability to start.
 * 
 * This is separate from potential - a person may have high potential
 * but not be ready to start now due to skill gaps, life circumstances,
 * or market timing.
 */
export enum FounderReadiness {
  /** Early exploration phase, significant development needed */
  EARLY = 'EARLY',
  
  /** Developing capabilities, some key strengths present */
  EMERGING = 'EMERGING',
  
  /** Core capabilities in place, could start with preparation */
  READY = 'READY',
  
  /** Strong profile across dimensions, high success probability */
  HIGH_POTENTIAL = 'HIGH_POTENTIAL',
}

/**
 * Profiles that are commonly confused with founders but are distinct.
 * 
 * The false-positive protection system specifically detects these
 * profiles to avoid misclassification.
 */
export enum NonFounderProfile {
  /** Independent worker selling services, not building products */
  FREELANCER = 'FREELANCER',
  
  /** Expert advisor selling knowledge, not building equity */
  CONSULTANT = 'CONSULTANT',
  
  /** Academic pursuit of knowledge, not commercial application */
  RESEARCHER = 'RESEARCHER',
  
  /** Institution-based knowledge creation */
  ACADEMIC = 'ACADEMIC',
  
  /** Creative expression focus, not necessarily commercial */
  ARTIST = 'ARTIST',
  
  /** Deep expertise in narrow domain, independent practice */
  INDEPENDENT_SPECIALIST = 'INDEPENDENT_SPECIALIST',
  
  /** Content creation without business building */
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  
  /** Investor mindset without operator capability */
  WANTREPRENEUR = 'WANTREPRENEUR',
}

/**
 * Evidence types for founder signal detection.
 */
export enum FounderEvidenceType {
  /** Direct statement of entrepreneurial intent */
  EXPLICIT_ENTREPRENEURIAL_STATEMENT = 'EXPLICIT_ENTREPRENEURIAL_STATEMENT',
  
  /** Evidence of having started something */
  PAST_STARTUP_EXPERIENCE = 'PAST_STARTUP_EXPERIENCE',
  
  /** Evidence of building products/projects */
  PRODUCT_BUILDING_BEHAVIOR = 'PRODUCT_BUILDING_BEHAVIOR',
  
  /** Evidence of selling or persuading */
  SALES_PERSUASION_EVIDENCE = 'SALES_PERSUASION_EVIDENCE',
  
  /** Evidence of leading teams */
  LEADERSHIP_EVIDENCE = 'LEADERSHIP_EVIDENCE',
  
  /** Evidence of recovering from setbacks */
  RESILIENCE_EVIDENCE = 'RESILIENCE_EVIDENCE',
  
  /** Evidence of identifying opportunities */
  OPPORTUNITY_IDENTIFICATION = 'OPPORTUNITY_IDENTIFICATION',
  
  /** Evidence of resource-constrained achievement */
  RESOURCEFULNESS_EVIDENCE = 'RESOURCEFULNESS_EVIDENCE',
  
  /** Evidence of long-term commitment */
  PERSISTENCE_EVIDENCE = 'PERSISTENCE_EVIDENCE',
  
  /** Evidence of ownership mentality */
  OWNERSHIP_BEHAVIOR = 'OWNERSHIP_BEHAVIOR',
  
  /** Evidence of comfort with uncertainty */
  AMBIGUITY_COMFORT_EVIDENCE = 'AMBIGUITY_COMFORT_EVIDENCE',
  
  /** Evidence of attracting collaborators */
  COLLABORATION_ATTRACTION = 'COLLABORATION_ATTRACTION',
  
  /** Psychological assessment indicators */
  PSYCHOLOGICAL_INDICATOR = 'PSYCHOLOGICAL_INDICATOR',
  
  /** Pattern across multiple responses */
  CROSS_RESPONSE_PATTERN = 'CROSS_RESPONSE_PATTERN',
  
  /** Contradictory evidence that reduces confidence */
  CONTRADICTORY_EVIDENCE = 'CONTRADICTORY_EVIDENCE',
}

// ============================================================================
// DIMENSION SCORE TYPES
// ============================================================================

/**
 * Score for a single founder dimension.
 */
export interface DimensionScore {
  /** The dimension being scored */
  dimension: FounderDimension;
  
  /** Score 0-1 (0 = no evidence, 1 = exceptional) */
  score: number;
  
  /** Confidence in this score 0-1 */
  confidence: number;
  
  /** Evidence supporting this score */
  evidence: FounderEvidence[];
  
  /** Number of evidence pieces */
  evidenceCount: number;
  
  /** Strength of strongest evidence */
  strongestEvidenceStrength: number;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Whether this dimension is a strength */
  isStrength: boolean;
  
  /** Whether this dimension needs development */
  needsDevelopment: boolean;
}

/**
 * Evidence supporting founder potential detection.
 */
export interface FounderEvidence {
  /** Unique identifier */
  id: string;
  
  /** Type of evidence */
  type: FounderEvidenceType;
  
  /** Dimension this evidence supports (if specific) */
  dimension?: FounderDimension;
  
  /** Strength 0-1 */
  strength: number;
  
  /** Human-readable description */
  description: string;
  
  /** Source of evidence */
  source: string;
  
  /** Raw data */
  rawValue: unknown;
  
  /** Timestamp */
  timestamp: number;
  
  /** Whether this is contradictory evidence */
  isContradictory: boolean;
}

// ============================================================================
// FOUNDER POTENTIAL ANALYSIS
// ============================================================================

/**
 * Complete founder potential analysis.
 */
export interface FounderPotentialAnalysis {
  /** Unique ID */
  id: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Student ID */
  studentId: string;
  
  /** Overall founder potential score 0-1 */
  overallPotential: number;
  
  /** Confidence in overall assessment 0-1 */
  confidence: number;
  
  /** Dimension-by-dimension breakdown */
  dimensions: DimensionScore[];
  
  /** Dimension scores as map for easy access */
  dimensionMap: Map<FounderDimension, DimensionScore>;
  
  /** Identified founder type (if any) */
  founderType?: FounderType;
  
  /** Confidence in type classification */
  typeConfidence?: number;
  
  /** Founder readiness level */
  readiness: FounderReadiness;
  
  /** Confidence in readiness assessment */
  readinessConfidence: number;
  
  /** Non-founder profiles detected (false positive protection) */
  nonFounderProfiles: NonFounderProfileDetection[];
  
  /** Whether any non-founder profile is dominant */
  isFalsePositiveRisk: boolean;
  
  /** Risk score of false positive 0-1 */
  falsePositiveRiskScore: number;
  
  /** Top strengths */
  strengths: DimensionScore[];
  
  /** Areas needing development */
  developmentAreas: DimensionScore[];
  
  /** Human-readable narrative */
  narrative: FounderNarrative;
  
  /** Recommended next steps */
  recommendations: FounderRecommendation[];
  
  /** Development roadmap */
  roadmap?: FounderRoadmap;
}

/**
 * Detection of a non-founder profile (for false positive protection).
 */
export interface NonFounderProfileDetection {
  /** The detected profile */
  profile: NonFounderProfile;
  
  /** Confidence in detection 0-1 */
  confidence: number;
  
  /** Evidence supporting this profile */
  evidence: FounderEvidence[];
  
  /** Why this differs from founder profile */
  distinctionExplanation: string;
  
  /** Whether this profile is dominant over founder potential */
  isDominant: boolean;
}

/**
 * Human-readable narrative about founder potential.
 */
export interface FounderNarrative {
  /** One-sentence summary */
  summary: string;
  
  /** Detailed potential assessment */
  potentialDescription: string;
  
  /** Type description (if identified) */
  typeDescription?: string;
  
  /** Readiness explanation */
  readinessExplanation: string;
  
  /** Key insight about profile */
  keyInsight: string;
  
  /** Warning about false positive risk (if any) */
  falsePositiveWarning?: string;
  
  /** How this compares to typical founders */
  comparativeAssessment: string;
}

/**
 * Recommendation for founder development.
 */
export interface FounderRecommendation {
  /** Type of recommendation */
  type: 'skill_building' | 'experience' | 'network' | 'mindset' | 'timing';
  
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** Description */
  description: string;
  
  /** Expected impact on founder potential */
  potentialImpact: number;
  
  /** Specific action items */
  actionItems: string[];
  
  /** Resources or pathways */
  resources?: string[];
}

// ============================================================================
// FOUNDER TYPE ANALYSIS
// ============================================================================

/**
 * Analysis of fit with a specific founder type.
 */
export interface FounderTypeFit {
  /** The founder type */
  type: FounderType;
  
  /** Fit score 0-1 */
  fitScore: number;
  
  /** Confidence in fit assessment */
  confidence: number;
  
  /** Dimension scores most relevant to this type */
  relevantDimensions: FounderDimension[];
  
  /** Score in relevant dimensions */
  relevantDimensionScore: number;
  
  /** Why this type fits or doesn't fit */
  explanation: string;
  
  /** Examples of successful founders of this type */
  archetypeExamples: string[];
  
  /** Whether this is the primary recommendation */
  isRecommended: boolean;
}

/**
 * Complete founder type classification result.
 */
export interface FounderTypeClassification {
  /** Primary founder type */
  primaryType?: FounderType;
  
  /** Confidence in primary type */
  primaryConfidence: number;
  
  /** Secondary type possibilities */
  secondaryTypes: FounderTypeFit[];
  
  /** All types ranked */
  allTypes: FounderTypeFit[];
  
  /** Whether classification is clear or ambiguous */
  isClearClassification: boolean;
  
  /** Explanation of classification logic */
  classificationExplanation: string;
}

// ============================================================================
// FOUNDER ROADMAP
// ============================================================================

/**
 * Development roadmap for founder potential.
 */
export interface FounderRoadmap {
  /** Current readiness level */
  currentReadiness: FounderReadiness;
  
  /** Target readiness level */
  targetReadiness: FounderReadiness;
  
  /** Estimated time to reach target (in months) */
  estimatedMonths: number;
  
  /** Milestones along the way */
  milestones: RoadmapMilestone[];
  
  /** Immediate next steps */
  immediateActions: string[];
  
  /** Skill development priorities */
  skillPriorities: SkillPriority[];
  
  /** Experience building recommendations */
  experienceGoals: ExperienceGoal[];
}

/**
 * Milestone in founder development roadmap.
 */
export interface RoadmapMilestone {
  /** Milestone name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Target readiness at this milestone */
  targetReadiness: FounderReadiness;
  
  /** Estimated time to reach (months from now) */
  estimatedMonths: number;
  
  /** Key achievements needed */
  achievements: string[];
  
  /** Skills to develop */
  skillsToDevelop: FounderDimension[];
  
  /** Whether this is a decision point */
  isDecisionPoint: boolean;
}

/**
 * Priority skill for development.
 */
export interface SkillPriority {
  /** The dimension/skill */
  dimension: FounderDimension;
  
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** Current score */
  currentScore: number;
  
  /** Target score */
  targetScore: number;
  
  /** How to develop this skill */
  developmentPath: string;
  
  /** Resources for development */
  resources: string[];
}

/**
 * Experience goal for founder development.
 */
export interface ExperienceGoal {
  /** Type of experience */
  type: 'project' | 'role' | 'environment' | 'challenge';
  
  /** Description */
  description: string;
  
  /** Dimensions this experience develops */
  developsDimensions: FounderDimension[];
  
  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** How to pursue this experience */
  pursuitPath: string;
}

// ============================================================================
// INPUT & CONFIGURATION
// ============================================================================

/**
 * Input for founder potential analysis.
 */
export interface FounderAnalysisInput {
  /** Student profile */
  profile: StudentProfile;
  
  /** Assessment responses */
  assessmentResponses?: AssessmentResponse[];
  
  /** Explicit statements about entrepreneurship */
  explicitStatements?: string[];
  
  /** Past experience descriptions */
  experienceDescriptions?: string[];
  
  /** Project/portfolio information */
  projectPortfolio?: ProjectInfo[];
  
  /** Free-form user input */
  userInput?: string;
  
  /** Previous analysis (for delta tracking) */
  previousAnalysis?: FounderPotentialAnalysis;
  
  /** Timestamp */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: {
    assessmentId?: string;
    sessionId?: string;
    source: 'assessment' | 'profile' | 'conversation' | 'portfolio_review';
  };
}

/**
 * Information about a project (for portfolio analysis).
 */
export interface ProjectInfo {
  /** Project name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Whether this was a product (not just a project) */
  isProduct: boolean;
  
  /** Whether this had users/customers */
  hadUsers: boolean;
  
  /** Whether this generated revenue */
  hadRevenue: boolean;
  
  /** Team size */
  teamSize: number;
  
  /** Duration in months */
  durationMonths: number;
  
  /** Outcome */
  outcome: 'completed' | 'ongoing' | 'pivoted' | 'failed' | 'abandoned';
  
  /** Skills demonstrated */
  demonstratedSkills: string[];
}

/**
 * Configuration for founder intelligence engine.
 */
export interface FounderEngineConfig {
  /** Minimum score to consider a dimension present */
  minDimensionThreshold: number;
  
  /** Minimum overall potential to classify as founder */
  minFounderPotentialThreshold: number;
  
  /** Threshold for false positive risk warning */
  falsePositiveWarningThreshold: number;
  
  /** Threshold to block founder classification */
  falsePositiveBlockThreshold: number;
  
  /** Weights for each dimension in overall score */
  dimensionWeights: Record<FounderDimension, number>;
  
  /** Weights for evidence types */
  evidenceWeights: Record<FounderEvidenceType, number>;
  
  /** Minimum evidence for high confidence */
  minEvidenceForHighConfidence: number;
  
  /** Whether to include non-founder profile detection */
  enableFalsePositiveProtection: boolean;
  
  /** Verbosity of explanations */
  explanationVerbosity: 'minimal' | 'standard' | 'detailed';
  
  /** Whether to generate roadmap */
  generateRoadmap: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard for FounderDimension.
 */
export function isFounderDimension(value: unknown): value is FounderDimension {
  return typeof value === 'string' && Object.values(FounderDimension).includes(value as FounderDimension);
}

/**
 * Type guard for FounderType.
 */
export function isFounderType(value: unknown): value is FounderType {
  return typeof value === 'string' && Object.values(FounderType).includes(value as FounderType);
}

/**
 * Type guard for FounderReadiness.
 */
export function isFounderReadiness(value: unknown): value is FounderReadiness {
  return typeof value === 'string' && Object.values(FounderReadiness).includes(value as FounderReadiness);
}

/**
 * Get human-readable label for a founder dimension.
 */
export function getDimensionLabel(dimension: FounderDimension): string {
  const labels: Record<FounderDimension, string> = {
    [FounderDimension.OPPORTUNITY_RECOGNITION]: 'Opportunity Recognition',
    [FounderDimension.OBSESSION_CAPACITY]: 'Obsession Capacity',
    [FounderDimension.RESOURCEFULNESS]: 'Resourcefulness',
    [FounderDimension.AMBIGUITY_TOLERANCE]: 'Ambiguity Tolerance',
    [FounderDimension.RESILIENCE]: 'Resilience',
    [FounderDimension.TALENT_MAGNETISM]: 'Talent Magnetism',
    [FounderDimension.SALES_CAPABILITY]: 'Sales Capability',
    [FounderDimension.OWNERSHIP_ORIENTATION]: 'Ownership Orientation',
  };
  return labels[dimension] || dimension;
}

/**
 * Get description for a founder dimension.
 */
export function getDimensionDescription(dimension: FounderDimension): string {
  const descriptions: Record<FounderDimension, string> = {
    [FounderDimension.OPPORTUNITY_RECOGNITION]: 
      'The ability to identify problems worth solving and recognize market opportunities that others miss',
    [FounderDimension.OBSESSION_CAPACITY]: 
      'The capacity to maintain deep commitment and focus over years, persisting through setbacks',
    [FounderDimension.RESOURCEFULNESS]: 
      'The ability to create significant progress despite severe resource constraints',
    [FounderDimension.AMBIGUITY_TOLERANCE]: 
      'Comfort operating without clear structure, complete information, or guaranteed outcomes',
    [FounderDimension.RESILIENCE]: 
      'The ability to recover from failure, learn from setbacks, and persist through challenges',
    [FounderDimension.TALENT_MAGNETISM]: 
      'The ability to attract, inspire, and retain talented people to join your mission',
    [FounderDimension.SALES_CAPABILITY]: 
      'The ability to persuade, sell ideas, build relationships, and drive action',
    [FounderDimension.OWNERSHIP_ORIENTATION]: 
      'The tendency to take ownership, act with accountability, and think like an owner not an employee',
  };
  return descriptions[dimension] || 'No description available';
}

/**
 * Get human-readable label for a founder type.
 */
export function getFounderTypeLabel(type: FounderType): string {
  const labels: Record<FounderType, string> = {
    [FounderType.TECHNICAL_FOUNDER]: 'Technical Founder',
    [FounderType.PRODUCT_FOUNDER]: 'Product Founder',
    [FounderType.BUSINESS_FOUNDER]: 'Business Founder',
    [FounderType.VISIONARY_FOUNDER]: 'Visionary Founder',
    [FounderType.SOCIAL_ENTREPRENEUR]: 'Social Entrepreneur',
    [FounderType.COMMUNITY_BUILDER]: 'Community Builder',
    [FounderType.CREATOR_FOUNDER]: 'Creator Founder',
  };
  return labels[type] || type;
}

/**
 * Get description for a founder type.
 */
export function getFounderTypeDescription(type: FounderType): string {
  const descriptions: Record<FounderType, string> = {
    [FounderType.TECHNICAL_FOUNDER]: 
      'Builds technical products, often with engineering background. Strong in building, weaker in sales/marketing initially. Examples: Zuckerberg, Gates.',
    [FounderType.PRODUCT_FOUNDER]: 
      'Obsessed with user experience and product-market fit. Design-thinking background. Examples: Jobs, Chesky.',
    [FounderType.BUSINESS_FOUNDER]: 
      'Excels at partnerships, business development, and market expansion. Often MBA or sales background. Examples: Kalanick, Blakely.',
    [FounderType.VISIONARY_FOUNDER]: 
      'Creates new categories with bold vision. Strong storyteller and category designer. Examples: Musk, Bezos.',
    [FounderType.SOCIAL_ENTREPRENEUR]: 
      'Mission-driven, solves social/environmental problems. Impact-first, profit-second. Examples: Yunus, Novogratz.',
    [FounderType.COMMUNITY_BUILDER]: 
      'Builds network effects through community. Platform and marketplace expertise. Examples: Huffman, Alexis.',
    [FounderType.CREATOR_FOUNDER]: 
      'Builds media, content, or creative product businesses. Creator economy native. Examples: Kjellberg, Rogan.',
  };
  return descriptions[type] || 'No description available';
}

/**
 * Get label for non-founder profile.
 */
export function getNonFounderProfileLabel(profile: NonFounderProfile): string {
  const labels: Record<NonFounderProfile, string> = {
    [NonFounderProfile.FREELANCER]: 'Freelancer',
    [NonFounderProfile.CONSULTANT]: 'Consultant',
    [NonFounderProfile.RESEARCHER]: 'Researcher',
    [NonFounderProfile.ACADEMIC]: 'Academic',
    [NonFounderProfile.ARTIST]: 'Artist',
    [NonFounderProfile.INDEPENDENT_SPECIALIST]: 'Independent Specialist',
    [NonFounderProfile.CONTENT_CREATOR]: 'Content Creator',
    [NonFounderProfile.WANTREPRENEUR]: 'Wantrepreneur',
  };
  return labels[profile] || profile;
}

/**
 * Get explanation of how a non-founder profile differs from founder.
 */
export function getNonFounderDistinction(profile: NonFounderProfile): string {
  const distinctions: Record<NonFounderProfile, string> = {
    [NonFounderProfile.FREELANCER]: 
      'Freelancers sell services for immediate income. They trade time for money without building equity or scalable products. Founders build assets that generate value independently.',
    [NonFounderProfile.CONSULTANT]: 
      'Consultants sell expertise and advice. They leverage knowledge but typically don\'t build products or take equity risk. Founders create solutions, not just recommendations.',
    [NonFounderProfile.RESEARCHER]: 
      'Researchers pursue knowledge for its own sake. They prioritize understanding over commercial application. Founders prioritize solving problems and creating value for customers.',
    [NonFounderProfile.ACADEMIC]: 
      'Academics work within institutional frameworks pursuing peer recognition. They value publication and theory. Founders operate outside institutions pursuing market validation.',
    [NonFounderProfile.ARTIST]: 
      'Artists prioritize creative expression and aesthetic vision. Commercial success is secondary. Founders prioritize solving customer problems and building sustainable businesses.',
    [NonFounderProfile.INDEPENDENT_SPECIALIST]: 
      'Independent specialists sell deep expertise in narrow domains. They are individual contributors. Founders build organizations and delegate across functions.',
    [NonFounderProfile.CONTENT_CREATOR]: 
      'Content creators build audiences through media. They focus on distribution and engagement. Founders build products and systems that solve problems at scale.',
    [NonFounderProfile.WANTREPRENEUR]: 
      'Wantrepreneurs talk about starting businesses but don\'t take action. They lack execution and commitment. Founders demonstrate through building, not just discussing.',
  };
  return distinctions[profile] || 'No distinction available';
}
