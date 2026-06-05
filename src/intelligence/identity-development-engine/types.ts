/**
 * Identity Development Engine - Types
 *
 * Type definitions for modeling identity formation and evolution.
 *
 * Design Principles:
 * - Strong typing for all identity constructs
 * - Compatible with StudentBeliefV3
 * - Deterministic identity detection
 * - Explainable identity confidence
 */

import type {
  EntityId,
  ConfidenceScore,
  Evidence,
  StudentBeliefV3,
  Strength,
  Value,
  Motivation,
  PersonalityTrait,
} from '../types/index.js';

// ============================================================================
// IDENTITY ARCHETYPES
// ============================================================================

/**
 * Identity archetypes represent common professional identity patterns.
 * These are descriptive, not prescriptive - students may blend multiple.
 */
export const IDENTITY_ARCHETYPES = [
  'builder',        // Creates things, entrepreneurial, hands-on
  'researcher',     // Investigates, analyzes, seeks truth
  'helper',         // Supports others, service-oriented, empathetic
  'artist',         // Creates beauty, expressive, original
  'organizer',      // Structures, plans, coordinates
  'leader',         // Directs, influences, takes responsibility
  'technician',     // Masters tools, precise, skilled
  'strategist',     // Plans, sees patterns, big-picture
  'performer',      // Presenter, entertainer, communicator
  'protector',      // Defends, secures, ensures safety
  'educator',       // Teaches, explains, develops others
  'innovator',      // Disrupts, experiments, challenges norms
  'craftsperson',   // Masters craft, quality-focused, detail-oriented
  'explorer',       // Discovers, travels, seeks novelty
  'healer',         // Restores, cares for, nurtures
] as const;

/** Type for identity archetype identifiers */
export type IdentityArchetypeId = (typeof IDENTITY_ARCHETYPES)[number];

/**
 * Human-readable names for archetypes.
 */
export const ARCHETYPE_DISPLAY_NAMES: Record<IdentityArchetypeId, string> = {
  builder: 'Builder',
  researcher: 'Researcher',
  helper: 'Helper',
  artist: 'Artist',
  organizer: 'Organizer',
  leader: 'Leader',
  technician: 'Technician',
  strategist: 'Strategist',
  performer: 'Performer',
  protector: 'Protector',
  educator: 'Educator',
  innovator: 'Innovator',
  craftsperson: 'Craftsperson',
  explorer: 'Explorer',
  healer: 'Healer',
};

/**
 * Archetype definitions with characteristic signals.
 */
export interface ArchetypeDefinition {
  /** Archetype identifier */
  id: IdentityArchetypeId;

  /** Display name */
  name: string;

  /** Description of this identity */
  description: string;

  /** Core defining characteristics */
  coreTraits: string[];

  /** Typical interests for this archetype */
  typicalInterests: string[];

  /** Typical strengths for this archetype */
  typicalStrengths: string[];

  /** Typical values for this archetype */
  typicalValues: string[];

  /** Common behavioral indicators */
  behavioralIndicators: string[];

  /** Career paths often associated */
  associatedPaths: string[];
}

// ============================================================================
// IDENTITY SIGNALS
// ============================================================================

/**
 * A signal indicating a particular identity dimension.
 */
export interface IdentitySignal {
  /** Signal identifier */
  id: string;

  /** Type of signal */
  type: SignalType;

  /** Archetype this signal relates to */
  archetypeId: IdentityArchetypeId;

  /** Signal strength (0.0 - 1.0) */
  strength: number;

  /** Source of the signal */
  source: SignalSource;

  /** Evidence supporting this signal */
  evidence: Evidence[];

  /** When this signal was observed */
  timestamp: number;

  /** Signal context */
  context: {
    /** What triggered the signal */
    trigger?: string;

    /** Additional metadata */
    metadata?: Record<string, unknown>;
  };
}

/** Types of identity signals */
export type SignalType =
  | 'interest-expression'      // Student expressed interest
  | 'behavioral-demonstration' // Student demonstrated behavior
  | 'achievement-indicator'    // Achievement suggests identity
  | 'preference-revelation'    // Choice revealed preference
  | 'aspiration-statement'     // Student stated aspiration
  | 'value-expression'         // Value consistent with archetype
  | 'strength-demonstration'   // Strength matches archetype
  | 'feedback-confirmation';   // External feedback confirmed

/** Sources of identity signals */
export type SignalSource =
  | 'self-report'              // Student directly stated
  | 'behavioral-observation'   // Observed in behavior
  | 'assessment-response'      // Derived from assessment
  | 'project-evidence'         // Evidence from projects/work
  | 'third-party-feedback'     // Feedback from others
  | 'pattern-inference';       // Inferred from patterns

// ============================================================================
// IDENTITY PROFILE
// ============================================================================

/**
 * Complete identity profile for a student.
 */
export interface IdentityProfile {
  /** Profile identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When profile was generated */
  generatedAt: number;

  /** Primary (dominant) identity */
  primaryIdentity?: IdentityArchetypeId;

  /** Secondary identities */
  secondaryIdentities: IdentityArchetypeId[];

  /** All archetype scores (0.0 - 1.0) */
  archetypeScores: Record<IdentityArchetypeId, number>;

  /** Identity confidence for each archetype */
  identityConfidence: Record<IdentityArchetypeId, IdentityConfidence>;

  /** Overall profile confidence */
  overallConfidence: ConfidenceScore;

  /** Detected identity status */
  status: IdentityStatus;

  /** Signals that contributed to this profile */
  signals: IdentitySignal[];

  /** Conflicts between identities */
  conflicts: IdentityConflict[];

  /** Evolution of this profile */
  evolution?: IdentityEvolution;

  /** Student belief snapshot used */
  beliefSnapshot: StudentBeliefV3;

  /** Supporting evidence summary */
  evidenceSummary: Record<IdentityArchetypeId, Evidence[]>;
}

/**
 * Confidence in an identity assessment.
 */
export interface IdentityConfidence {
  /** Archetype identifier */
  archetypeId: IdentityArchetypeId;

  /** Overall confidence score (0.0 - 1.0) */
  score: ConfidenceScore;

  /** Confidence by signal type */
  bySignalType: Partial<Record<SignalType, number>>;

  /** Number of supporting signals */
  signalCount: number;

  /** Signal strength distribution */
  signalStrengths: number[];

  /** Confidence explanation */
  explanation: string;
}

/**
 * Identity status classification.
 */
export type IdentityStatus =
  | 'emerging'      // Identity forming, signals building
  | 'developing'    // Identity becoming clearer
  | 'stable'        // Identity well-established
  | 'conflicted'    // Multiple competing identities
  | 'transitioning' // Identity is changing
  | 'unclear'       // Insufficient data to determine
  | 'complex';      // Multiple blended identities

/**
 * Conflict between two identities.
 */
export interface IdentityConflict {
  /** Conflict identifier */
  id: string;

  /** First conflicting identity */
  identityA: IdentityArchetypeId;

  /** Second conflicting identity */
  identityB: IdentityArchetypeId;

  /** Conflict type */
  type: ConflictType;

  /** Conflict severity (0.0 - 1.0) */
  severity: number;

  /** Description of the conflict */
  description: string;

  /** Areas of tension */
  tensionAreas: string[];

  /** Potential resolution strategies */
  resolutionStrategies: string[];
}

/** Types of identity conflicts */
export type ConflictType =
  | 'value-conflict'      // Values are incompatible
  | 'behavioral-tension'  // Required behaviors differ
  | 'path-divergence'     // Career paths conflict
  | 'time-competition'    // Can't pursue both fully
  | 'skill-mismatch';     // Skills needed differ

// ============================================================================
// IDENTITY EVOLUTION
// ============================================================================

/**
 * Tracks how identity evolves over time.
 */
export interface IdentityEvolution {
  /** Evolution record identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When tracking started */
  startedAt: number;

  /** Latest update */
  lastUpdatedAt: number;

  /** Historical identity snapshots */
  snapshots: IdentitySnapshot[];

  /** Primary identity history */
  primaryIdentityHistory: PrimaryIdentityRecord[];

  /** Detected transitions */
  transitions: IdentityTransition[];

  /** Evolution pattern */
  pattern: EvolutionPattern;

  /** Overall trajectory */
  trajectory: 'consolidating' | 'expanding' | 'shifting' | 'exploring' | 'stable';
}

/**
 * Single identity snapshot.
 */
export interface IdentitySnapshot {
  /** Snapshot identifier */
  id: string;

  /** When snapshot was taken */
  timestamp: number;

  /** Archetype scores at this point */
  archetypeScores: Record<IdentityArchetypeId, number>;

  /** Primary identity at this point */
  primaryIdentity?: IdentityArchetypeId;

  /** Confidence at this point */
  confidence: number;

  /** Life stage or context */
  context?: string;
}

/**
 * Record of primary identity at a point in time.
 */
export interface PrimaryIdentityRecord {
  timestamp: number;
  identity: IdentityArchetypeId;
  confidence: number;
}

/**
 * Identity transition event.
 */
export interface IdentityTransition {
  /** Transition identifier */
  id: string;

  /** When transition occurred */
  timestamp: number;

  /** Identity before transition */
  fromIdentity?: IdentityArchetypeId;

  /** Identity after transition */
  toIdentity: IdentityArchetypeId;

  /** Transition type */
  type: TransitionType;

  /** Transition magnitude (0.0 - 1.0) */
  magnitude: number;

  /** Trigger for transition */
  trigger?: string;

  /** Description of change */
  description: string;
}

/** Types of identity transitions */
export type TransitionType =
  | 'emergence'     // New identity emerged
  | 'consolidation' // Identity solidified
  | 'shift'         // Changed dominant identity
  | 'expansion'     // Added secondary identity
  | 'contraction'   // Identity faded
  | 'integration';  // Multiple identities integrated

/** Evolution pattern classification */
export type EvolutionPattern =
  | 'linear-progression'   // Clear progression path
  | 'cyclical-exploration' // Revisiting identities
  | 'divergent-branching'  // Multiple paths emerging
  | 'convergent-focusing'  // Narrowing down
  | 'stable-consistent'    // Little change
  | 'volatile-shifting';   // Frequent changes

// ============================================================================
// IDENTITY ANALYSIS
// ============================================================================

/**
 * Input for identity analysis.
 */
export interface IdentityAnalysisInput {
  /** Student identifier */
  studentId: EntityId;

  /** Current student belief snapshot */
  belief: StudentBeliefV3;

  /** Historical belief snapshots for evolution tracking */
  beliefHistory?: StudentBeliefV3[];

  /** Previous identity profile (for evolution tracking) */
  previousProfile?: IdentityProfile;

  /** Additional signals to consider */
  additionalSignals?: IdentitySignal[];

  /** Analysis options */
  options?: IdentityAnalysisOptions;
}

/**
 * Options for identity analysis.
 */
export interface IdentityAnalysisOptions {
  /** Minimum confidence threshold for primary identity */
  minPrimaryConfidence?: number;

  /** Whether to detect conflicts */
  detectConflicts?: boolean;

  /** Whether to track evolution */
  trackEvolution?: boolean;

  /** Number of top identities to return */
  topIdentityCount?: number;

  /** Whether to include detailed evidence */
  includeEvidence?: boolean;
}

/**
 * Output from identity analysis.
 */
export interface IdentityAnalysisOutput {
  /** Analysis identifier */
  id: string;

  /** When analysis was performed */
  generatedAt: number;

  /** Generated identity profile */
  profile: IdentityProfile;

  /** Identity insights */
  insights: IdentityInsight[];

  /** Recommendations based on identity */
  recommendations: IdentityRecommendation[];

  /** Analysis metadata */
  metadata: {
    analysisDurationMs: number;
    signalCount: number;
    archetypeScores: Record<IdentityArchetypeId, number>;
  };
}

/**
 * Insight from identity analysis.
 */
export interface IdentityInsight {
  /** Insight identifier */
  id: string;

  /** Type of insight */
  type: InsightType;

  /** Insight description */
  description: string;

  /** Related archetype(s) */
  relatedArchetypes: IdentityArchetypeId[];

  /** Confidence in insight */
  confidence: ConfidenceScore;

  /** Supporting evidence */
  evidence: string[];
}

/** Types of identity insights */
export type InsightType =
  | 'emerging-identity'
  | 'stable-identity'
  | 'conflicted-identities'
  | 'identity-shift'
  | 'strength-alignment'
  | 'value-alignment'
  | 'behavioral-pattern'
  | 'potential-growth-area'
  | 'integration-opportunity';

/**
 * Recommendation based on identity analysis.
 */
export interface IdentityRecommendation {
  /** Recommendation identifier */
  id: string;

  /** What this addresses */
  area: 'exploration' | 'development' | 'resolution' | 'decision';

  /** Recommendation text */
  recommendation: string;

  /** Rationale based on identity */
  rationale: string;

  /** Related archetype(s) */
  relatedArchetypes: IdentityArchetypeId[];

  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for IdentityDevelopmentEngine.
 */
export interface IdentityDevelopmentConfig {
  /** Minimum signal strength to consider (0.0 - 1.0) */
  minSignalStrength: number;

  /** Threshold for primary identity (0.0 - 1.0) */
  primaryIdentityThreshold: number;

  /** Threshold for secondary identity inclusion (0.0 - 1.0) */
  secondaryIdentityThreshold: number;

  /** Threshold for conflict detection (0.0 - 1.0) */
  conflictThreshold: number;

  /** Weight given to self-reported signals */
  selfReportWeight: number;

  /** Weight given to behavioral observations */
  behavioralWeight: number;

  /** Weight given to achievement indicators */
  achievementWeight: number;

  /** Number of snapshots required for evolution tracking */
  minSnapshotsForEvolution: number;
}

/** Default configuration */
export const DEFAULT_IDENTITY_CONFIG: IdentityDevelopmentConfig = {
  minSignalStrength: 0.2,
  primaryIdentityThreshold: 0.6,
  secondaryIdentityThreshold: 0.4,
  conflictThreshold: 0.5,
  selfReportWeight: 0.8,
  behavioralWeight: 0.9,
  achievementWeight: 0.85,
  minSnapshotsForEvolution: 3,
};

// ============================================================================
// ARCHETYPE DEFINITIONS
// ============================================================================

/**
 * Archetype definitions with characteristic signals.
 */
export const ARCHETYPE_DEFINITIONS: ArchetypeDefinition[] = [
  {
    id: 'builder',
    name: 'Builder',
    description: 'Creates things, entrepreneurial, hands-on. Driven to bring ideas into reality.',
    coreTraits: ['creative', 'practical', 'resourceful', 'action-oriented'],
    typicalInterests: ['creating products', 'startups', 'DIY projects', 'building teams'],
    typicalStrengths: ['execution', 'problem-solving', 'resourcefulness', 'vision'],
    typicalValues: ['freedom', 'impact', 'growth', 'mastery'],
    behavioralIndicators: [
      'Starts projects independently',
      'Prefers creating over analyzing',
      'Shows entrepreneurial curiosity',
      'Takes initiative to build things',
    ],
    associatedPaths: ['entrepreneurship', 'product-management', 'engineering', 'design'],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Investigates, analyzes, seeks truth. Driven by curiosity and understanding.',
    coreTraits: ['analytical', 'curious', 'systematic', 'intellectually-driven'],
    typicalInterests: ['deep investigation', 'academic research', 'data analysis', 'understanding systems'],
    typicalStrengths: ['analysis', 'critical thinking', 'attention to detail', 'synthesis'],
    typicalValues: ['curiosity', 'mastery', 'meaning', 'growth'],
    behavioralIndicators: [
      'Asks deep questions',
      'Seeks to understand fundamentals',
      'Enjoys complex problems',
      'Values accuracy and rigor',
    ],
    associatedPaths: ['research', 'data-science', 'academia', 'consulting', 'analysis'],
  },
  {
    id: 'helper',
    name: 'Helper',
    description: 'Supports others, service-oriented, empathetic. Driven by making a difference in lives.',
    coreTraits: ['empathetic', 'supportive', 'patient', 'interpersonally-skilled'],
    typicalInterests: ['helping people', 'coaching', 'counseling', 'social service'],
    typicalStrengths: ['empathy', 'listening', 'relationship-building', 'patience'],
    typicalValues: ['socialImpact', 'meaning', 'familyApproval', 'stability'],
    behavioralIndicators: [
      'Naturally helps others',
      'Good listener',
      'Shows genuine care',
      'Seeks to make a difference',
    ],
    associatedPaths: ['healthcare', 'social-work', 'education', 'counseling', 'HR'],
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Creates beauty, expressive, original. Driven by self-expression and aesthetics.',
    coreTraits: ['creative', 'expressive', 'original', 'aesthetically-sensitive'],
    typicalInterests: ['artistic expression', 'design', 'creative writing', 'performance'],
    typicalStrengths: ['creativity', 'aesthetic sense', 'originality', 'expression'],
    typicalValues: ['freedom', 'meaning', 'mastery', 'curiosity'],
    behavioralIndicators: [
      'Creates for self-expression',
      'Has strong aesthetic opinions',
      'Values originality',
      'Sees beauty in unexpected places',
    ],
    associatedPaths: ['design', 'arts', 'writing', 'media', 'creative-industries'],
  },
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Structures, plans, coordinates. Driven by order and efficiency.',
    coreTraits: ['systematic', 'detail-oriented', 'reliable', 'process-minded'],
    typicalInterests: ['planning', 'organizing', 'systems', 'operations'],
    typicalStrengths: ['organization', 'planning', 'attention to detail', 'reliability'],
    typicalValues: ['stability', 'mastery', 'status', 'resilience'],
    behavioralIndicators: [
      'Creates systems and processes',
      'Plans ahead',
      'Notices details others miss',
      'Values punctuality and order',
    ],
    associatedPaths: ['operations', 'project-management', 'administration', 'logistics'],
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Directs, influences, takes responsibility. Driven by impact through others.',
    coreTraits: ['influential', 'decisive', 'responsible', 'visionary'],
    typicalInterests: ['leading teams', 'strategic decisions', 'inspiring others', 'organizational impact'],
    typicalStrengths: ['leadership', 'decision-making', 'influence', 'strategic thinking'],
    typicalValues: ['status', 'impact', 'wealthPotential', 'mastery'],
    behavioralIndicators: [
      'Naturally takes charge',
      'Influences others',
      'Takes responsibility',
      'Thinks about group dynamics',
    ],
    associatedPaths: ['management', 'executive', 'entrepreneurship', 'politics', 'consulting'],
  },
  {
    id: 'technician',
    name: 'Technician',
    description: 'Masters tools, precise, skilled. Driven by technical excellence.',
    coreTraits: ['technical', 'precise', 'skilled', 'tool-oriented'],
    typicalInterests: ['technical skills', 'tools and equipment', 'craftsmanship', 'specialized knowledge'],
    typicalStrengths: ['technical skill', 'precision', 'problem-solving', 'reliability'],
    typicalValues: ['mastery', 'stability', 'resilience', 'income'],
    behavioralIndicators: [
      'Masters tools quickly',
      'Values technical precision',
      'Enjoys hands-on work',
      'Takes pride in craft',
    ],
    associatedPaths: ['engineering', 'trades', 'technology', 'healthcare-technical', 'manufacturing'],
  },
  {
    id: 'strategist',
    name: 'Strategist',
    description: 'Plans, sees patterns, big-picture. Driven by understanding complex systems.',
    coreTraits: ['analytical', 'systemic', 'future-oriented', 'pattern-seeking'],
    typicalInterests: ['strategy', 'systems thinking', 'forecasting', 'complex problem-solving'],
    typicalStrengths: ['strategic thinking', 'pattern recognition', 'systems analysis', 'foresight'],
    typicalValues: ['mastery', 'impact', 'wealthPotential', 'status'],
    behavioralIndicators: [
      'Sees big picture',
      'Connects disparate ideas',
      'Plans for long-term',
      'Enjoys complex strategy',
    ],
    associatedPaths: ['strategy', 'consulting', 'finance', 'policy', 'product-management'],
  },
  {
    id: 'performer',
    name: 'Performer',
    description: 'Presenter, entertainer, communicator. Driven by expression and audience connection.',
    coreTraits: ['expressive', 'charismatic', 'communicative', 'audience-aware'],
    typicalInterests: ['public speaking', 'performance', 'entertainment', 'media'],
    typicalStrengths: ['communication', 'presence', 'adaptability', 'emotional intelligence'],
    typicalValues: ['status', 'freedom', 'socialImpact', 'income'],
    behavioralIndicators: [
      'Comfortable in spotlight',
      'Engaging communicator',
      'Adapts to audience',
      'Enjoys being seen',
    ],
    associatedPaths: ['media', 'entertainment', 'sales', 'public-relations', 'speaking'],
  },
  {
    id: 'educator',
    name: 'Educator',
    description: 'Teaches, explains, develops others. Driven by enabling growth in others.',
    coreTraits: ['patient', 'communicative', 'knowledgeable', 'mentoring'],
    typicalInterests: ['teaching', 'mentoring', 'explaining', 'curriculum development'],
    typicalStrengths: ['communication', 'patience', 'knowledge transfer', 'empathy'],
    typicalValues: ['socialImpact', 'meaning', 'stability', 'growth'],
    behavioralIndicators: [
      'Enjoys explaining things',
      'Patient with learners',
      'Finds teaching rewarding',
      'Organizes knowledge well',
    ],
    associatedPaths: ['education', 'training', 'coaching', 'consulting', 'content-creation'],
  },
  {
    id: 'innovator',
    name: 'Innovator',
    description: 'Disrupts, experiments, challenges norms. Driven by creating the new.',
    coreTraits: ['experimental', 'risk-tolerant', 'visionary', 'challenging'],
    typicalInterests: ['experimentation', 'new ideas', 'disruption', 'unconventional approaches'],
    typicalStrengths: ['creativity', 'risk-taking', 'vision', 'adaptability'],
    typicalValues: ['freedom', 'growth', 'impact', 'curiosity'],
    behavioralIndicators: [
      'Questions conventions',
      'Tries new approaches',
      'Comfortable with uncertainty',
      'Challenges status quo',
    ],
    associatedPaths: ['entrepreneurship', 'R&D', 'design', 'consulting', 'creative-industries'],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discovers, travels, seeks novelty. Driven by new experiences and frontiers.',
    coreTraits: ['curious', 'adventurous', 'adaptable', 'restless'],
    typicalInterests: ['travel', 'new experiences', 'frontiers', 'discovery'],
    typicalStrengths: ['adaptability', 'curiosity', 'resilience', 'open-mindedness'],
    typicalValues: ['freedom', 'curiosity', 'growth', 'optionality'],
    behavioralIndicators: [
      'Seeks new experiences',
      'Gets bored with routine',
      'Curious about different cultures',
      'Takes calculated risks',
    ],
    associatedPaths: ['research', 'journalism', 'travel', 'diplomacy', 'field-work'],
  },
];
