/**
 * Founder Intelligence V2 - Type Definitions
 * 
 * Production-grade type system for evaluating founder potential across
 * 8 core dimensions with false-positive protection and comprehensive
 * classification systems.
 * 
 * KEY DISTINCTION: This system detects "founder potential" not "startup interest".
 * A person can be interested in startups without having founder potential.
 * 
 * FALSE POSITIVE PROTECTION:
 * - Freelancers (sell services, not build equity)
 * - Consultants (sell advice, not build products)
 * - Researchers (pursue knowledge, not commercial solutions)
 * - Academics (institutional, theory-focused)
 * - Artists (creative expression, not necessarily scalable)
 * - Independent Specialists (deep expertise, individual practice)
 * 
 * @module intelligence/founder-intelligence-v2
 */

import { StudentProfile } from '@/domains/student/StudentProfile';
import { AssessmentResponse } from '@/types/assessment';

// ============================================================================
// CORE DIMENSIONS
// ============================================================================

/**
 * The 8 core dimensions of founder potential.
 * 
 * Research basis: Analysis of successful founders across industries
 * shows these 8 dimensions consistently predict entrepreneurial success.
 * 
 * Each dimension has specific signals that distinguish founders from
 * false positives (freelancers, consultants, researchers, etc.)
 */
export enum FounderDimensionV2 {
  /** 
   * Ability to identify problems worth solving and recognize market opportunities.
   * 
   * Founder signals: Pattern recognition, market awareness, pain-point identification
   * False positive check: Consultants also spot problems but don't build solutions
   */
  OPPORTUNITY_RECOGNITION = 'OPPORTUNITY_RECOGNITION',
  
  /**
   * Capacity for sustained commitment over years despite setbacks.
   * 
   * Founder signals: Long-term focus, deep interest formation, delayed gratification
   * False positive check: Researchers also persist but without commercial focus
   */
  OBSESSION_CAPACITY = 'OBSESSION_CAPACITY',
  
  /**
   * Ability to create progress with limited resources.
   * 
   * Founder signals: Self-learning, improvisation, constraint navigation, bootstrap mentality
   * False positive check: Freelancers are resourceful but within service constraints
   */
  RESOURCEFULNESS = 'RESOURCEFULNESS',
  
  /**
   * Comfort operating without structure or complete information.
   * 
   * Founder signals: Experimentation, pivot willingness, incomplete information decisions
   * False positive check: Artists tolerate ambiguity but without business discipline
   */
  AMBIGUITY_TOLERANCE = 'AMBIGUITY_TOLERANCE',
  
  /**
   * Ability to recover from failure and persist through challenges.
   * 
   * Founder signals: Failure recovery, emotional stability, perseverance through rejection
   * False positive check: All resilient people aren't founders - need other dimensions
   */
  RESILIENCE = 'RESILIENCE',
  
  /**
   * Ability to attract, inspire, and retain talented people.
   * 
   * Founder signals: Communication, leadership, trust building, influence
   * False positive check: Need combined with ownership orientation (not just management)
   */
  TALENT_MAGNETISM = 'TALENT_MAGNETISM',
  
  /**
   * Ability to persuade, sell ideas, and build relationships.
   * 
   * Founder signals: Persuasion, negotiation, storytelling, customer acquisition
   * False positive check: Salespeople sell but lack ownership/product obsession
   */
  SALES_CAPABILITY = 'SALES_CAPABILITY',
  
  /**
   * Tendency to take ownership and act with accountability.
   * 
   * Founder signals: Responsibility taking, initiative, accountability, equity mindset
   * False positive check: Freelancers have ownership but of services not products
   */
  OWNERSHIP_ORIENTATION = 'OWNERSHIP_ORIENTATION',
}

/**
 * Weight configuration for each dimension in overall potential calculation.
 * 
 * Rationale: All dimensions matter but some are more predictive:
 * - Ownership orientation (0.95): Core differentiator from employees/freelancers
 * - Resilience (0.95): Startups have high failure rates
 * - Obsession capacity (1.0): Multi-year commitment required
 * - Opportunity recognition (1.0): Must identify real problems
 * - Resourcefulness (0.9): Bootstrapping is default state
 * - Ambiguity tolerance (0.9): Operating without structure
 * - Sales capability (0.9): Must acquire customers
 * - Talent magnetism (0.85): Can be learned/compensated for
 */
export const DEFAULT_DIMENSION_WEIGHTS: Record<FounderDimensionV2, number> = {
  [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: 1.0,
  [FounderDimensionV2.OBSESSION_CAPACITY]: 1.0,
  [FounderDimensionV2.RESOURCEFULNESS]: 0.9,
  [FounderDimensionV2.AMBIGUITY_TOLERANCE]: 0.9,
  [FounderDimensionV2.RESILIENCE]: 0.95,
  [FounderDimensionV2.TALENT_MAGNETISM]: 0.85,
  [FounderDimensionV2.SALES_CAPABILITY]: 0.9,
  [FounderDimensionV2.OWNERSHIP_ORIENTATION]: 0.95,
};

// ============================================================================
// FOUNDER TYPES
// ============================================================================

/**
 * Classification of founder types based on primary strengths.
 * 
 * A founder typically has one dominant type but may have secondary characteristics.
 * Type classification helps with:
 * - Co-founder matching (complementary types)
 * - Role recommendations within startups
 * - Skill development priorities
 * - Market/sector alignment
 */
export enum FounderTypeV2 {
  /** 
   * Technical depth with product-building capability.
   * 
   * Strengths: Building, architecture, technical decisions
   * Weaknesses: Sales, marketing, business development
   * Examples: Zuckerberg (Meta), Gates (Microsoft), Collison (Stripe)
   * Best with: Business founder or product founder as co-founder
   */
  TECHNICAL_FOUNDER = 'TECHNICAL_FOUNDER',
  
  /**
   * Product vision and user-centric design thinking.
   * 
   * Strengths: UX, product-market fit, user empathy
   * Weaknesses: Technical architecture, operations at scale
   * Examples: Jobs (Apple), Chesky (Airbnb), Hurley (YouTube)
   * Best with: Technical founder as co-founder
   */
  PRODUCT_FOUNDER = 'PRODUCT_FOUNDER',
  
  /**
   * Business development, partnerships, and market expansion.
   * 
   * Strengths: Sales, partnerships, fundraising, growth
     * Weaknesses: Technical depth, product details
   * Examples: Kalanick (Uber), Blakely (Spanx), Schultz (Starbucks)
   * Best with: Technical founder or product founder as co-founder
   */
  BUSINESS_FOUNDER = 'BUSINESS_FOUNDER',
  
  /**
   * Bold vision and category creation capability.
   * 
   * Strengths: Vision, storytelling, category design, inspiration
   * Weaknesses: Execution details, operations
   * Examples: Musk (Tesla/SpaceX), Bezos (Amazon), Jobs (Apple - later years)
   * Best with: Strong operators as co-founders/executives
   */
  VISIONARY_FOUNDER = 'VISIONARY_FOUNDER',
  
  /**
   * Mission-driven with social impact focus.
   * 
   * Strengths: Purpose-driven, mission alignment, impact measurement
   * Weaknesses: Profit maximization, commercial ruthlessness
   * Examples: Yunus (Grameen), Novogratz (Acumen), Skoll (eBay/Skoll Foundation)
   * Best with: Business founder to handle commercial sustainability
   */
  SOCIAL_ENTREPRENEUR = 'SOCIAL_ENTREPRENEUR',
  
  /**
   * Community building and network effects expertise.
   * 
   * Strengths: Platform thinking, network effects, user engagement
   * Weaknesses: Technical infrastructure, monetization
   * Examples: Huffman/Ohanian (Reddit), Newmark (Craigslist), Williams (Twitter/Medium)
   * Best with: Technical founder for platform infrastructure
   */
  COMMUNITY_BUILDER = 'COMMUNITY_BUILDER',
  
  /**
   * Content, media, or creative product focus.
   * 
   * Strengths: Content creation, audience building, media intuition
   * Weaknesses: Business operations, technical systems
   * Examples: Kjellberg (early), various creator economy founders
   * Best with: Business founder to monetize and scale
   */
  CREATOR_FOUNDER = 'CREATOR_FOUNDER',
}

/**
 * Dimension requirements for each founder type.
 * 
 * Maps which dimensions are most important for each founder type.
 * Used for type classification and gap analysis.
 */
export const FOUNDER_TYPE_DIMENSION_MAP: Record<FounderTypeV2, {
  primary: FounderDimensionV2[];
  secondary: FounderDimensionV2[];
  weakIndicators: FounderDimensionV2[];
}> = {
  [FounderTypeV2.TECHNICAL_FOUNDER]: {
    primary: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    secondary: [FounderDimensionV2.OPPORTUNITY_RECOGNITION, FounderDimensionV2.AMBIGUITY_TOLERANCE],
    weakIndicators: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.TALENT_MAGNETISM],
  },
  [FounderTypeV2.PRODUCT_FOUNDER]: {
    primary: [FounderDimensionV2.OPPORTUNITY_RECOGNITION, FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.AMBIGUITY_TOLERANCE],
    secondary: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.SALES_CAPABILITY],
    weakIndicators: [FounderDimensionV2.TALENT_MAGNETISM],
  },
  [FounderTypeV2.BUSINESS_FOUNDER]: {
    primary: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    secondary: [FounderDimensionV2.OWNERSHIP_ORIENTATION, FounderDimensionV2.RESILIENCE],
    weakIndicators: [FounderDimensionV2.RESOURCEFULNESS],
  },
  [FounderTypeV2.VISIONARY_FOUNDER]: {
    primary: [FounderDimensionV2.OPPORTUNITY_RECOGNITION, FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.OBSESSION_CAPACITY],
    secondary: [FounderDimensionV2.AMBIGUITY_TOLERANCE, FounderDimensionV2.RESILIENCE],
    weakIndicators: [FounderDimensionV2.RESOURCEFULNESS],
  },
  [FounderTypeV2.SOCIAL_ENTREPRENEUR]: {
    primary: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.RESILIENCE, FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    secondary: [FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    weakIndicators: [FounderDimensionV2.SALES_CAPABILITY],
  },
  [FounderTypeV2.COMMUNITY_BUILDER]: {
    primary: [FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.SALES_CAPABILITY],
    secondary: [FounderDimensionV2.OPPORTUNITY_RECOGNITION, FounderDimensionV2.AMBIGUITY_TOLERANCE],
    weakIndicators: [FounderDimensionV2.RESOURCEFULNESS],
  },
  [FounderTypeV2.CREATOR_FOUNDER]: {
    primary: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    secondary: [FounderDimensionV2.AMBIGUITY_TOLERANCE, FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    weakIndicators: [FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.RESOURCEFULNESS],
  },
};

// ============================================================================
// FOUNDER READINESS
// ============================================================================

/**
 * Founder readiness levels indicating current capability to start.
 * 
 * Separate from potential - a person may have high potential but not be
 * ready now due to skill gaps, life circumstances, or market timing.
 */
export enum FounderReadinessV2 {
  /** 
   * Early exploration phase, significant development needed.
   * 
   * Characteristics: 
   * - Overall potential < 0.4 OR
   * - < 3 dimensions above threshold OR
   * - Major skill gaps in critical areas
   * 
   * Recommendation: Focus on skill development, learning, side projects
   */
  EARLY = 'EARLY',
  
  /**
   * Developing capabilities, some key strengths present.
   * 
   * Characteristics:
   * - Overall potential 0.4-0.6 OR
   * - 3-5 dimensions above threshold OR
   * - Clear strengths with notable gaps
   * 
   * Recommendation: Build specific skills, find complementary co-founder
   */
  EMERGING = 'EMERGING',
  
  /**
   * Core capabilities in place, could start with preparation.
   * 
   * Characteristics:
   * - Overall potential 0.6-0.75 OR
   * - 5-6 dimensions above threshold OR
   * - Strong profile with minor gaps
   * 
   * Recommendation: Validate ideas, build network, prepare for launch
   */
  READY = 'READY',
  
  /**
   * Strong profile across dimensions, high success probability.
   * 
   * Characteristics:
   * - Overall potential > 0.75 OR
   * - 6+ dimensions above threshold OR
   * - Exceptional strengths in key areas
   * 
   * Recommendation: Start now, focus on idea validation and market timing
   */
  HIGH_POTENTIAL = 'HIGH_POTENTIAL',
}

/**
 * Readiness thresholds for classification.
 */
export const READINESS_THRESHOLDS: Record<FounderReadinessV2, {
  minPotential: number;
  minDimensions: number;
  dimensionThreshold: number;
}> = {
  [FounderReadinessV2.EARLY]: {
    minPotential: 0,
    minDimensions: 0,
    dimensionThreshold: 0.5,
  },
  [FounderReadinessV2.EMERGING]: {
    minPotential: 0.4,
    minDimensions: 3,
    dimensionThreshold: 0.5,
  },
  [FounderReadinessV2.READY]: {
    minPotential: 0.6,
    minDimensions: 5,
    dimensionThreshold: 0.5,
  },
  [FounderReadinessV2.HIGH_POTENTIAL]: {
    minPotential: 0.75,
    minDimensions: 6,
    dimensionThreshold: 0.6,
  },
};

// ============================================================================
// FALSE POSITIVE PROTECTION
// ============================================================================

/**
 * Profiles commonly confused with founders but fundamentally different.
 * 
 * Each has distinct patterns that distinguish them from true founders.
 * Detection of these profiles is critical for accuracy.
 */
export enum NonFounderProfileV2 {
  /** 
   * Independent worker selling services, not building products/equity.
   * 
   * Key distinctions from founders:
   * - Trades time for money (hourly/project rates)
   * - No equity or scalable assets
   * - Clients vs customers/users
   * - Service delivery vs product building
   * 
   * Confusion: High autonomy, ownership of work, self-directed
   * Detection: Lack of product, revenue from services, client language
   */
  FREELANCER = 'FREELANCER',
  
  /**
   * Expert advisor selling knowledge, not building solutions.
   * 
   * Key distinctions from founders:
   * - Recommends vs implements
   * - Advice vs products
   * - External perspective vs ownership
   * - Billable hours vs equity value
   * 
   * Confusion: Problem identification, strategic thinking, expertise
   * Detection: Framework/recommendation language, lack of execution
   */
  CONSULTANT = 'CONSULTANT',
  
  /**
   * Academic pursuit of knowledge, not commercial application.
   * 
   * Key distinctions from founders:
   * - Knowledge for its own sake
   * - Publication vs commercialization
   * - Understanding vs solving
   * - Peer recognition vs market validation
   * 
   * Confusion: Deep expertise, persistence, intelligence
   * Detection: Research/publication language, theory focus, institution
   */
  RESEARCHER = 'RESEARCHER',
  
  /**
   * Institution-based knowledge creation.
   * 
   * Similar to researcher but with institutional context.
   * Key distinctions: Tenure, grants, peer review, academic hierarchy
   */
  ACADEMIC = 'ACADEMIC',
  
  /**
   * Creative expression focus, not necessarily commercial.
   * 
   * Key distinctions from founders:
   * - Expression vs problem-solving
   * - Aesthetic vs functional
   * - Personal vision vs market needs
   * - Artistic integrity vs customer focus
   * 
   * Confusion: Creativity, vision, independence, ambiguity tolerance
   * Detection: Art/expression language, lack of commercial intent
   */
  ARTIST = 'ARTIST',
  
  /**
   * Deep expertise in narrow domain, independent practice.
   * 
   * Key distinctions from founders:
   * - Individual contributor vs organization builder
   * - Deep vs broad expertise
   * - Practice vs company building
   * - Reputation vs equity value
   * 
   * Confusion: Expertise, independence, professional standing
   * Detection: Solo practice, deep specialization, lack of delegation
   */
  INDEPENDENT_SPECIALIST = 'INDEPENDENT_SPECIALIST',
  
  /**
   * Content creation without product building.
   * 
   * Key distinctions from founders:
   * - Audience vs users/customers
   * - Content vs product
   * - Engagement vs problem-solving
   * - Distribution vs innovation
   * 
   * Confusion: Creator economy overlap, platform building, influence
   * Detection: Content metrics, audience focus, lack of product
   */
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  
  /**
   * Investor mindset without operator capability.
   * 
   * Key distinctions from founders:
   * - Capital allocation vs value creation
   * - Portfolio vs focused commitment
   * - Analysis vs execution
   * - Diversification vs obsession
   * 
   * Confusion: Business understanding, strategy, deal-making
   * Detection: Investment language, lack of operational experience
   */
  INVESTOR_MINDSET = 'INVESTOR_MINDSET',
  
  /**
   * Talks about entrepreneurship but doesn't execute.
   * 
   * Key distinctions from founders:
   * - Discussion vs action
   * - Ideas vs execution
   * - Plans vs progress
   * - Future tense vs present/past tense
   * 
   * Confusion: Interest in startups, business knowledge, networking
   * Detection: Future tense, lack of concrete actions, idea collection
   */
  WANTREPRENEUR = 'WANTREPRENEUR',
}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

/**
 * Evidence types for founder signal detection.
 * 
 * Evidence is categorized by type to enable:
 * - Confidence weighting (explicit statements > inferred patterns)
 * - Source tracking (where signals came from)
 * - Contradiction detection (conflicting evidence)
 */
export enum FounderEvidenceTypeV2 {
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
  
  /** Portfolio or project analysis */
  PORTFOLIO_ANALYSIS = 'PORTFOLIO_ANALYSIS',
  
  /** Assessment response analysis */
  ASSESSMENT_SIGNAL = 'ASSESSMENT_SIGNAL',
}

// ============================================================================
// SCORE TYPES
// ============================================================================

/**
 * Score for a single founder dimension.
 */
export interface DimensionScoreV2 {
  /** The dimension being scored */
  dimension: FounderDimensionV2;
  
  /** Score 0-1 (0 = no evidence, 1 = exceptional) */
  score: number;
  
  /** Confidence in this score 0-1 */
  confidence: number;
  
  /** Evidence supporting this score */
  evidence: FounderEvidenceV2[];
  
  /** Number of evidence pieces */
  evidenceCount: number;
  
  /** Strength of strongest evidence */
  strongestEvidenceStrength: number;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Whether this dimension is a strength (above threshold) */
  isStrength: boolean;
  
  /** Whether this dimension needs development (below threshold) */
  needsDevelopment: boolean;
  
  /** Percentile compared to other founders (if available) */
  percentile?: number;
}

/**
 * Evidence supporting founder potential detection.
 */
export interface FounderEvidenceV2 {
  /** Unique identifier */
  id: string;
  
  /** Type of evidence */
  type: FounderEvidenceTypeV2;
  
  /** Dimension this evidence supports (if specific) */
  dimension?: FounderDimensionV2;
  
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
  
  /** Whether this evidence specifically counters a non-founder profile */
  countersNonFounderProfile?: NonFounderProfileV2;
}

// ============================================================================
// RISK PROFILE
// ============================================================================

/**
 * Risk factors that impact founder success probability.
 */
export enum FounderRiskFactorV2 {
  /** Risk of financial instability affecting startup */
  FINANCIAL_INSTABILITY = 'FINANCIAL_INSTABILITY',
  
  /** Risk of commitment gaps (quitting early) */
  COMMITMENT_RISK = 'COMMITMENT_RISK',
  
  /** Risk of co-founder conflicts or solo founder challenges */
  CO_FOUNDER_RISK = 'CO_FOUNDER_RISK',
  
  /** Risk of skill gaps in critical areas */
  SKILL_GAP_RISK = 'SKILL_GAP_RISK',
  
  /** Risk of market timing or idea quality */
  MARKET_RISK = 'MARKET_RISK',
  
  /** Risk of execution capability */
  EXECUTION_RISK = 'EXECUTION_RISK',
  
  /** Risk of emotional/mental health challenges */
  WELLNESS_RISK = 'WELLNESS_RISK',
  
  /** Risk of misclassified profile (false positive) */
  PROFILE_MISCLASSIFICATION_RISK = 'PROFILE_MISCLASSIFICATION_RISK',
}

/**
 * Risk level for a specific factor.
 */
export interface RiskAssessmentV2 {
  /** The risk factor */
  factor: FounderRiskFactorV2;
  
  /** Risk level */
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Risk score 0-1 */
  score: number;
  
  /** Explanation of the risk */
  explanation: string;
  
  /** Mitigation strategies */
  mitigations: string[];
  
  /** Evidence supporting this risk assessment */
  evidence: FounderEvidenceV2[];
}

/**
 * Complete founder risk profile.
 */
export interface FounderRiskProfileV2 {
  /** Overall risk score 0-1 (higher = more risky) */
  overallRiskScore: number;
  
  /** Risk level */
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Individual risk assessments */
  risks: RiskAssessmentV2[];
  
  /** Top risks to address */
  topRisks: RiskAssessmentV2[];
  
  /** Risk-adjusted potential score */
  riskAdjustedPotential: number;
  
  /** Confidence in risk assessment */
  confidence: number;
}

// ============================================================================
// MARKET FIT
// ============================================================================

/**
 * Market/opportunity alignment assessment.
 */
export interface FounderMarketFitV2 {
  /** 
   * Alignment score 0-1.
   * 
   * Measures how well the founder's strengths match current
   * market opportunities and startup ecosystem needs.
   */
  alignmentScore: number;
  
  /** Confidence in alignment assessment */
  confidence: number;
  
  /** Best matching market sectors */
  bestSectors: {
    sector: string;
    matchScore: number;
    reasoning: string;
  }[];
  
  /** Best matching startup stages */
  bestStages: {
    stage: 'IDEATION' | 'PRE_SEED' | 'SEED' | 'EARLY' | 'GROWTH' | 'LATE';
    matchScore: number;
    reasoning: string;
  }[];
  
  /** Co-founder needs based on profile */
  coFounderNeeds: {
    needed: boolean;
    priority: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
    complementaryTypes: FounderTypeV2[];
    reasoning: string;
  };
  
  /** Market timing assessment */
  timingAssessment: {
    favorable: boolean;
    score: number;
    explanation: string;
    recommendations: string[];
  };
}

// ============================================================================
// FOUNDER POTENTIAL ANALYSIS
// ============================================================================

/**
 * Detection of a non-founder profile (for false positive protection).
 */
export interface NonFounderProfileDetectionV2 {
  /** The detected profile */
  profile: NonFounderProfileV2;
  
  /** Confidence in detection 0-1 */
  confidence: number;
  
  /** Evidence supporting this profile */
  evidence: FounderEvidenceV2[];
  
  /** Why this differs from founder profile */
  distinctionExplanation: string;
  
  /** Whether this profile is dominant over founder potential */
  isDominant: boolean;
  
  /** Whether this profile completely blocks founder classification */
  blocksClassification: boolean;
  
  /** Differential evidence that counters this profile */
  counterEvidence: FounderEvidenceV2[];
}

/**
 * Human-readable narrative about founder potential.
 */
export interface FounderNarrativeV2 {
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
  
  /** Strengths paragraph */
  strengthsParagraph: string;
  
  /** Development areas paragraph */
  developmentParagraph: string;
}

/**
 * Recommendation for founder development.
 */
export interface FounderRecommendationV2 {
  /** Type of recommendation */
  type: 'skill_building' | 'experience' | 'network' | 'mindset' | 'timing' | 'co_founder';
  
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** Description */
  description: string;
  
  /** Expected impact on founder potential 0-1 */
  potentialImpact: number;
  
  /** Specific action items */
  actionItems: string[];
  
  /** Resources or pathways */
  resources?: string[];
  
  /** Timeline for completion */
  timeline?: string;
  
  /** Related dimensions this addresses */
  relatedDimensions: FounderDimensionV2[];
}

/**
 * Analysis of fit with a specific founder type.
 */
export interface FounderTypeFitV2 {
  /** The founder type */
  type: FounderTypeV2;
  
  /** Fit score 0-1 */
  fitScore: number;
  
  /** Confidence in fit assessment */
  confidence: number;
  
  /** Dimension scores most relevant to this type */
  relevantDimensions: FounderDimensionV2[];
  
  /** Score in relevant dimensions */
  relevantDimensionScore: number;
  
  /** Why this type fits or doesn't fit */
  explanation: string;
  
  /** Examples of successful founders of this type */
  archetypeExamples: string[];
  
  /** Whether this is the primary recommendation */
  isRecommended: boolean;
  
  /** Skill gaps for this founder type */
  skillGaps: FounderDimensionV2[];
  
  /** Recommended co-founder types */
  recommendedCoFounderTypes: FounderTypeV2[];
}

/**
 * Complete founder type classification result.
 */
export interface FounderTypeClassificationV2 {
  /** Primary founder type */
  primaryType: FounderTypeV2 | null;
  
  /** Confidence in primary type */
  primaryConfidence: number;
  
  /** Secondary type possibilities */
  secondaryTypes: FounderTypeFitV2[];
  
  /** All types ranked */
  allTypes: FounderTypeFitV2[];
  
  /** Whether classification is clear or ambiguous */
  isClearClassification: boolean;
  
  /** Ambiguity reason (if not clear) */
  ambiguityReason?: string;
  
  /** Explanation of classification logic */
  classificationExplanation: string;
  
  /** Hybrid type indicators (if applicable) */
  hybridIndicators?: FounderTypeV2[];
}

// ============================================================================
// ROADMAP TYPES
// ============================================================================

/**
 * Development roadmap for founder potential.
 */
export interface FounderRoadmapV2 {
  /** Current readiness level */
  currentReadiness: FounderReadinessV2;
  
  /** Target readiness level */
  targetReadiness: FounderReadinessV2;
  
  /** Estimated time to reach target (in months) */
  estimatedMonths: number;
  
  /** Confidence in timeline estimate */
  timelineConfidence: number;
  
  /** Milestones along the way */
  milestones: RoadmapMilestoneV2[];
  
  /** Immediate next steps */
  immediateActions: string[];
  
  /** Skill development priorities */
  skillPriorities: SkillPriorityV2[];
  
  /** Experience building recommendations */
  experienceGoals: ExperienceGoalV2[];
  
  /** Network development recommendations */
  networkGoals: NetworkGoalV2[];
  
  /** Key decision points */
  decisionPoints: DecisionPointV2[];
}

/**
 * Milestone in founder development roadmap.
 */
export interface RoadmapMilestoneV2 {
  /** Milestone name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Target readiness at this milestone */
  targetReadiness: FounderReadinessV2;
  
  /** Estimated time to reach (months from now) */
  estimatedMonths: number;
  
  /** Key achievements needed */
  achievements: string[];
  
  /** Skills to develop */
  skillsToDevelop: FounderDimensionV2[];
  
  /** Whether this is a decision point */
  isDecisionPoint: boolean;
  
  /** Success criteria */
  successCriteria: string[];
}

/**
 * Priority skill for development.
 */
export interface SkillPriorityV2 {
  /** The dimension/skill */
  dimension: FounderDimensionV2;
  
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** Current score */
  currentScore: number;
  
  /** Target score */
  targetScore: number;
  
  /** Gap to close */
  gap: number;
  
  /** How to develop this skill */
  developmentPath: string;
  
  /** Resources for development */
  resources: string[];
  
  /** Estimated time to develop (months) */
  estimatedMonths: number;
  
  /** Practice opportunities */
  practiceOpportunities: string[];
}

/**
 * Experience goal for founder development.
 */
export interface ExperienceGoalV2 {
  /** Type of experience */
  type: 'project' | 'role' | 'environment' | 'challenge' | 'failure';
  
  /** Description */
  description: string;
  
  /** Dimensions this experience develops */
  developsDimensions: FounderDimensionV2[];
  
  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** How to pursue this experience */
  pursuitPath: string;
  
  /** Success indicators */
  successIndicators: string[];
  
  /** Timeline */
  timeline: string;
}

/**
 * Network development goal.
 */
export interface NetworkGoalV2 {
  /** Type of network to build */
  networkType: 'founders' | 'investors' | 'customers' | 'mentors' | 'talent';
  
  /** Description */
  description: string;
  
  /** Why this network matters */
  importance: string;
  
  /** How to build this network */
  buildingStrategy: string[];
  
  /** Priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Key decision point in founder journey.
 */
export interface DecisionPointV2 {
  /** Decision description */
  decision: string;
  
  /** When this decision arises */
  timing: string;
  
  /** Options to consider */
  options: string[];
  
  /** Factors to weigh */
  decisionFactors: string[];
  
  /** Recommended criteria for decision */
  recommendationCriteria: string;
}

// ============================================================================
// INPUT & CONFIGURATION
// ============================================================================

/**
 * Project/venture information for portfolio analysis.
 */
export interface ProjectInfoV2 {
  /** Project name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Whether this was a product (not just a project) */
  isProduct: boolean;
  
  /** Whether this had users/customers */
  hadUsers: boolean;
  
  /** Number of users (if known) */
  userCount?: number;
  
  /** Whether this generated revenue */
  hadRevenue: boolean;
  
  /** Revenue amount (if known) */
  revenueAmount?: number;
  
  /** Team size */
  teamSize: number;
  
  /** Duration in months */
  durationMonths: number;
  
  /** Outcome */
  outcome: 'completed' | 'ongoing' | 'pivoted' | 'failed' | 'abandoned' | 'acquired';
  
  /** Skills demonstrated */
  demonstratedSkills: string[];
  
  /** Founder role in this project */
  role?: 'SOLO' | 'CO_FOUNDER' | 'EARLY_EMPLOYEE' | 'CONTRIBUTOR';
  
  /** Lessons learned */
  lessonsLearned?: string[];
}

/**
 * Input for founder potential analysis.
 */
export interface FounderAnalysisInputV2 {
  /** Student profile */
  profile: StudentProfile;
  
  /** Assessment responses */
  assessmentResponses?: AssessmentResponse[];
  
  /** Explicit statements about entrepreneurship */
  explicitStatements?: string[];
  
  /** Past experience descriptions */
  experienceDescriptions?: string[];
  
  /** Project/portfolio information */
  projectPortfolio?: ProjectInfoV2[];
  
  /** Free-form user input */
  userInput?: string;
  
  /** Previous analysis (for delta tracking) */
  previousAnalysis?: FounderPotentialAnalysisV2;
  
  /** Timestamp */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: {
    assessmentId?: string;
    sessionId?: string;
    source: 'assessment' | 'profile' | 'conversation' | 'portfolio_review' | 'interview';
    analystNotes?: string;
  };
  
  /** Current life context (for timing recommendations) */
  lifeContext?: {
    currentCommitments: 'FULL_TIME_STUDENT' | 'PART_TIME_STUDENT' | 'EMPLOYED' | 'UNEMPLOYED' | 'FOUNDER';
    financialStability: 'STABLE' | 'MODERATE' | 'UNSTABLE';
    familySupport: 'SUPPORTIVE' | 'NEUTRAL' | 'OPPOSED';
    geographicLocation: string;
    riskTolerance: number; // 0-1
  };
}

/**
 * Configuration for founder intelligence engine.
 */
export interface FounderEngineConfigV2 {
  /** Minimum score to consider a dimension present */
  minDimensionThreshold: number;
  
  /** Minimum overall potential to classify as founder */
  minFounderPotentialThreshold: number;
  
  /** Threshold for false positive risk warning */
  falsePositiveWarningThreshold: number;
  
  /** Threshold to block founder classification */
  falsePositiveBlockThreshold: number;
  
  /** Weights for each dimension in overall score */
  dimensionWeights: Record<FounderDimensionV2, number>;
  
  /** Weights for evidence types */
  evidenceWeights: Record<FounderEvidenceTypeV2, number>;
  
  /** Minimum evidence for high confidence */
  minEvidenceForHighConfidence: number;
  
  /** Whether to include non-founder profile detection */
  enableFalsePositiveProtection: boolean;
  
  /** Verbosity of explanations */
  explanationVerbosity: 'minimal' | 'standard' | 'detailed';
  
  /** Whether to generate roadmap */
  generateRoadmap: boolean;
  
  /** Whether to generate risk profile */
  generateRiskProfile: boolean;
  
  /** Whether to assess market fit */
  assessMarketFit: boolean;
  
  /** Type classification threshold */
  typeClassificationThreshold: number;
}

/**
 * Default engine configuration.
 */
export const DEFAULT_FOUNDER_ENGINE_CONFIG: FounderEngineConfigV2 = {
  minDimensionThreshold: 0.3,
  minFounderPotentialThreshold: 0.45,
  falsePositiveWarningThreshold: 0.5,
  falsePositiveBlockThreshold: 0.75,
  dimensionWeights: DEFAULT_DIMENSION_WEIGHTS,
  evidenceWeights: {
    [FounderEvidenceTypeV2.EXPLICIT_ENTREPRENEURIAL_STATEMENT]: 1.0,
    [FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE]: 1.0,
    [FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR]: 0.95,
    [FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE]: 0.9,
    [FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE]: 0.85,
    [FounderEvidenceTypeV2.RESILIENCE_EVIDENCE]: 0.85,
    [FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION]: 0.8,
    [FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE]: 0.8,
    [FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE]: 0.75,
    [FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR]: 0.9,
    [FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE]: 0.75,
    [FounderEvidenceTypeV2.COLLABORATION_ATTRACTION]: 0.8,
    [FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR]: 0.6,
    [FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN]: 0.7,
    [FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE]: 0.5,
    [FounderEvidenceTypeV2.PORTFOLIO_ANALYSIS]: 0.85,
    [FounderEvidenceTypeV2.ASSESSMENT_SIGNAL]: 0.75,
  },
  minEvidenceForHighConfidence: 5,
  enableFalsePositiveProtection: true,
  explanationVerbosity: 'detailed',
  generateRoadmap: true,
  generateRiskProfile: true,
  assessMarketFit: true,
  typeClassificationThreshold: 0.6,
};

// ============================================================================
// MAIN ANALYSIS OUTPUT
// ============================================================================

/**
 * Complete founder potential analysis.
 * 
 * This is the main output of the Founder Intelligence V2 engine.
 */
export interface FounderPotentialAnalysisV2 {
  /** Unique ID */
  id: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Student ID */
  studentId: string;
  
  /** Engine version */
  engineVersion: string;
  
  /** Overall founder potential score 0-1 */
  overallPotential: number;
  
  /** Confidence in overall assessment 0-1 */
  confidence: number;
  
  /** Dimension-by-dimension breakdown */
  dimensions: DimensionScoreV2[];
  
  /** Dimension scores as map for easy access */
  dimensionMap: Map<FounderDimensionV2, DimensionScoreV2>;
  
  /** Identified founder type classification */
  typeClassification: FounderTypeClassificationV2;
  
  /** Primary founder type (convenience accessor) */
  primaryFounderType: FounderTypeV2 | null;
  
  /** Founder readiness level */
  readiness: FounderReadinessV2;
  
  /** Confidence in readiness assessment */
  readinessConfidence: number;
  
  /** Non-founder profiles detected (false positive protection) */
  nonFounderProfiles: NonFounderProfileDetectionV2[];
  
  /** Whether any non-founder profile is dominant */
  isFalsePositiveRisk: boolean;
  
  /** Risk score of false positive 0-1 */
  falsePositiveRiskScore: number;
  
  /** Whether founder classification is blocked */
  isClassificationBlocked: boolean;
  
  /** Risk profile */
  riskProfile: FounderRiskProfileV2;
  
  /** Market fit assessment */
  marketFit: FounderMarketFitV2;
  
  /** Top strengths */
  strengths: DimensionScoreV2[];
  
  /** Areas needing development */
  developmentAreas: DimensionScoreV2[];
  
  /** Critical gaps that must be addressed */
  criticalGaps: FounderDimensionV2[];
  
  /** Human-readable narrative */
  narrative: FounderNarrativeV2;
  
  /** Recommended next steps */
  recommendations: FounderRecommendationV2[];
  
  /** Development roadmap */
  roadmap?: FounderRoadmapV2;
  
  /** Input data summary (for debugging) */
  inputSummary: {
    evidenceCount: number;
    textSourcesAnalyzed: number;
    projectsAnalyzed: number;
    assessmentResponsesUsed: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard for FounderDimensionV2.
 */
export function isFounderDimensionV2(value: unknown): value is FounderDimensionV2 {
  return typeof value === 'string' && Object.values(FounderDimensionV2).includes(value as FounderDimensionV2);
}

/**
 * Type guard for FounderTypeV2.
 */
export function isFounderTypeV2(value: unknown): value is FounderTypeV2 {
  return typeof value === 'string' && Object.values(FounderTypeV2).includes(value as FounderTypeV2);
}

/**
 * Type guard for FounderReadinessV2.
 */
export function isFounderReadinessV2(value: unknown): value is FounderReadinessV2 {
  return typeof value === 'string' && Object.values(FounderReadinessV2).includes(value as FounderReadinessV2);
}

/**
 * Type guard for NonFounderProfileV2.
 */
export function isNonFounderProfileV2(value: unknown): value is NonFounderProfileV2 {
  return typeof value === 'string' && Object.values(NonFounderProfileV2).includes(value as NonFounderProfileV2);
}

/**
 * Get human-readable label for a founder dimension.
 */
export function getDimensionLabelV2(dimension: FounderDimensionV2): string {
  const labels: Record<FounderDimensionV2, string> = {
    [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: 'Opportunity Recognition',
    [FounderDimensionV2.OBSESSION_CAPACITY]: 'Obsession Capacity',
    [FounderDimensionV2.RESOURCEFULNESS]: 'Resourcefulness',
    [FounderDimensionV2.AMBIGUITY_TOLERANCE]: 'Ambiguity Tolerance',
    [FounderDimensionV2.RESILIENCE]: 'Resilience',
    [FounderDimensionV2.TALENT_MAGNETISM]: 'Talent Magnetism',
    [FounderDimensionV2.SALES_CAPABILITY]: 'Sales Capability',
    [FounderDimensionV2.OWNERSHIP_ORIENTATION]: 'Ownership Orientation',
  };
  return labels[dimension] ?? dimension;
}

/**
 * Get description for a founder dimension.
 */
export function getDimensionDescriptionV2(dimension: FounderDimensionV2): string {
  const descriptions: Record<FounderDimensionV2, string> = {
    [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: 
      'The ability to identify problems worth solving and recognize market opportunities that others miss',
    [FounderDimensionV2.OBSESSION_CAPACITY]: 
      'The capacity to maintain deep commitment and focus over years, persisting through setbacks',
    [FounderDimensionV2.RESOURCEFULNESS]: 
      'The ability to create significant progress despite severe resource constraints',
    [FounderDimensionV2.AMBIGUITY_TOLERANCE]: 
      'Comfort operating without clear structure, complete information, or guaranteed outcomes',
    [FounderDimensionV2.RESILIENCE]: 
      'The ability to recover from failure, learn from setbacks, and persist through challenges',
    [FounderDimensionV2.TALENT_MAGNETISM]: 
      'The ability to attract, inspire, and retain talented people to join your mission',
    [FounderDimensionV2.SALES_CAPABILITY]: 
      'The ability to persuade, sell ideas, build relationships, and drive action',
    [FounderDimensionV2.OWNERSHIP_ORIENTATION]: 
      'The tendency to take ownership, act with accountability, and think like an owner not an employee',
  };
  return descriptions[dimension] ?? 'No description available';
}

/**
 * Get human-readable label for a founder type.
 */
export function getFounderTypeLabelV2(type: FounderTypeV2): string {
  const labels: Record<FounderTypeV2, string> = {
    [FounderTypeV2.TECHNICAL_FOUNDER]: 'Technical Founder',
    [FounderTypeV2.PRODUCT_FOUNDER]: 'Product Founder',
    [FounderTypeV2.BUSINESS_FOUNDER]: 'Business Founder',
    [FounderTypeV2.VISIONARY_FOUNDER]: 'Visionary Founder',
    [FounderTypeV2.SOCIAL_ENTREPRENEUR]: 'Social Entrepreneur',
    [FounderTypeV2.COMMUNITY_BUILDER]: 'Community Builder',
    [FounderTypeV2.CREATOR_FOUNDER]: 'Creator Founder',
  };
  return labels[type] ?? type;
}

/**
 * Get description for a founder type.
 */
export function getFounderTypeDescriptionV2(type: FounderTypeV2): string {
  const descriptions: Record<FounderTypeV2, string> = {
    [FounderTypeV2.TECHNICAL_FOUNDER]: 
      'Builds technical products, often with engineering background. Strong in building, weaker in sales/marketing initially. Examples: Zuckerberg, Gates.',
    [FounderTypeV2.PRODUCT_FOUNDER]: 
      'Obsessed with user experience and product-market fit. Design-thinking background. Examples: Jobs, Chesky.',
    [FounderTypeV2.BUSINESS_FOUNDER]: 
      'Excels at partnerships, business development, and market expansion. Often MBA or sales background. Examples: Kalanick, Blakely.',
    [FounderTypeV2.VISIONARY_FOUNDER]: 
      'Creates new categories with bold vision. Strong storyteller and category designer. Examples: Musk, Bezos.',
    [FounderTypeV2.SOCIAL_ENTREPRENEUR]: 
      'Mission-driven, solves social/environmental problems. Impact-first, profit-second. Examples: Yunus, Novogratz.',
    [FounderTypeV2.COMMUNITY_BUILDER]: 
      'Builds network effects through community. Platform and marketplace expertise. Examples: Huffman, Alexis.',
    [FounderTypeV2.CREATOR_FOUNDER]: 
      'Builds media, content, or creative product businesses. Creator economy native. Examples: Various creator economy founders.',
  };
  return descriptions[type] ?? 'No description available';
}

/**
 * Get label for non-founder profile.
 */
export function getNonFounderProfileLabelV2(profile: NonFounderProfileV2): string {
  const labels: Record<NonFounderProfileV2, string> = {
    [NonFounderProfileV2.FREELANCER]: 'Freelancer',
    [NonFounderProfileV2.CONSULTANT]: 'Consultant',
    [NonFounderProfileV2.RESEARCHER]: 'Researcher',
    [NonFounderProfileV2.ACADEMIC]: 'Academic',
    [NonFounderProfileV2.ARTIST]: 'Artist',
    [NonFounderProfileV2.INDEPENDENT_SPECIALIST]: 'Independent Specialist',
    [NonFounderProfileV2.CONTENT_CREATOR]: 'Content Creator',
    [NonFounderProfileV2.INVESTOR_MINDSET]: 'Investor Mindset',
    [NonFounderProfileV2.WANTREPRENEUR]: 'Wantrepreneur',
  };
  return labels[profile] ?? profile;
}

/**
 * Get explanation of how a non-founder profile differs from founder.
 */
export function getNonFounderDistinctionV2(profile: NonFounderProfileV2): string {
  const distinctions: Record<NonFounderProfileV2, string> = {
    [NonFounderProfileV2.FREELANCER]: 
      'Freelancers sell services for immediate income. They trade time for money without building equity or scalable products. Founders build assets that generate value independently.',
    [NonFounderProfileV2.CONSULTANT]: 
      'Consultants sell expertise and advice. They leverage knowledge but typically don\'t build products or take equity risk. Founders create solutions, not just recommendations.',
    [NonFounderProfileV2.RESEARCHER]: 
      'Researchers pursue knowledge for its own sake. They prioritize understanding over commercial application. Founders prioritize solving problems and creating value for customers.',
    [NonFounderProfileV2.ACADEMIC]: 
      'Academics work within institutional frameworks pursuing peer recognition. They value publication and theory. Founders operate outside institutions pursuing market validation.',
    [NonFounderProfileV2.ARTIST]: 
      'Artists prioritize creative expression and aesthetic vision. Commercial success is secondary. Founders prioritize solving customer problems and building sustainable businesses.',
    [NonFounderProfileV2.INDEPENDENT_SPECIALIST]: 
      'Independent specialists sell deep expertise in narrow domains. They are individual contributors. Founders build organizations and delegate across functions.',
    [NonFounderProfileV2.CONTENT_CREATOR]: 
      'Content creators build audiences through media. They focus on distribution and engagement. Founders build products and systems that solve problems at scale.',
    [NonFounderProfileV2.INVESTOR_MINDSET]: 
      'Investors allocate capital and analyze opportunities. They don\'t build products or lead operations. Founders create value through execution and operations.',
    [NonFounderProfileV2.WANTREPRENEUR]: 
      'Wantrepreneurs talk about starting businesses but don\'t take action. They lack execution and commitment. Founders demonstrate through building, not just discussing.',
  };
  return distinctions[profile] ?? 'No distinction available';
}

/**
 * Get readiness label.
 */
export function getReadinessLabelV2(readiness: FounderReadinessV2): string {
  const labels: Record<FounderReadinessV2, string> = {
    [FounderReadinessV2.EARLY]: 'Early Stage',
    [FounderReadinessV2.EMERGING]: 'Emerging',
    [FounderReadinessV2.READY]: 'Ready',
    [FounderReadinessV2.HIGH_POTENTIAL]: 'High Potential',
  };
  return labels[readiness] ?? readiness;
}

/**
 * Get readiness description.
 */
export function getReadinessDescriptionV2(readiness: FounderReadinessV2): string {
  const descriptions: Record<FounderReadinessV2, string> = {
    [FounderReadinessV2.EARLY]: 
      'Early exploration phase with significant development needed. Focus on skill building and learning.',
    [FounderReadinessV2.EMERGING]: 
      'Developing capabilities with some key strengths present. Build specific skills and find complementary co-founders.',
    [FounderReadinessV2.READY]: 
      'Core capabilities in place. Could start with proper preparation and idea validation.',
    [FounderReadinessV2.HIGH_POTENTIAL]: 
      'Strong profile across dimensions with high success probability. Focus on market timing and idea validation.',
  };
  return descriptions[readiness] ?? 'No description available';
}

/**
 * Calculate readiness from dimension scores.
 */
export function calculateReadinessV2(
  overallPotential: number,
  dimensions: DimensionScoreV2[],
  threshold: number = 0.5
): FounderReadinessV2 {
  const dimensionsAboveThreshold = dimensions.filter(d => d.score >= threshold).length;
  
  if (overallPotential >= READINESS_THRESHOLDS[FounderReadinessV2.HIGH_POTENTIAL].minPotential &&
      dimensionsAboveThreshold >= READINESS_THRESHOLDS[FounderReadinessV2.HIGH_POTENTIAL].minDimensions) {
    return FounderReadinessV2.HIGH_POTENTIAL;
  }
  
  if (overallPotential >= READINESS_THRESHOLDS[FounderReadinessV2.READY].minPotential &&
      dimensionsAboveThreshold >= READINESS_THRESHOLDS[FounderReadinessV2.READY].minDimensions) {
    return FounderReadinessV2.READY;
  }
  
  if (overallPotential >= READINESS_THRESHOLDS[FounderReadinessV2.EMERGING].minPotential &&
      dimensionsAboveThreshold >= READINESS_THRESHOLDS[FounderReadinessV2.EMERGING].minDimensions) {
    return FounderReadinessV2.EMERGING;
  }
  
  return FounderReadinessV2.EARLY;
}
