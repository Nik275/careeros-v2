/**
 * Founder Intelligence V2 - Signal Patterns
 * 
 * Comprehensive signal patterns for extracting founder potential evidence
 * from text, portfolios, and assessments.
 * 
 * Each dimension has:
 * - Strong signals (high confidence evidence)
 * - Moderate signals (supporting evidence)
 * - Weak signals (contextual evidence)
 * - Anti-signals (evidence against)
 * 
 * @module intelligence/founder-intelligence-v2
 */

import { FounderDimensionV2, FounderEvidenceTypeV2, NonFounderProfileV2 } from './types';

// ============================================================================
// SIGNAL PATTERN INTERFACES
// ============================================================================

/**
 * Signal pattern for a specific dimension.
 */
export interface SignalPattern {
  /** Pattern to match (string or regex) */
  pattern: string | RegExp;
  
  /** Base strength of this signal (0-1) */
  strength: number;
  
  /** Evidence type */
  evidenceType: FounderEvidenceTypeV2;
  
  /** Human-readable description of what this signals */
  description: string;
  
  /** Context keywords that boost signal strength */
  contextBoosters?: string[];
  
  /** Keywords that reduce signal strength (ambiguous context) */
  contextDampeners?: string[];
  
  /** Whether this is a negative/anti-signal */
  isAntiSignal?: boolean;
  
  /** Non-founder profiles this specifically counters */
  countersProfiles?: NonFounderProfileV2[];
}

/**
 * Non-founder profile detection pattern.
 */
export interface NonFounderPattern {
  /** Pattern to match */
  pattern: string | RegExp;
  
  /** Strength of detection */
  strength: number;
  
  /** What this indicates about the profile */
  indication: string;
  
  /** Evidence type */
  evidenceType: FounderEvidenceTypeV2;
  
  /** Founder signals that override this pattern */
  overrideSignals?: string[];
  
  /** How much override signals reduce this pattern's strength (0-1) */
  overrideReduction?: number;
}

// ============================================================================
// OPPORTUNITY RECOGNITION SIGNALS
// ============================================================================

/**
 * Opportunity Recognition signals.
 * 
 * Detects ability to identify problems worth solving.
 * 
 * FALSE POSITIVE CHECK: Consultants also spot problems but don't build solutions.
 * Look for: Product language, ownership language, not just recommendations.
 */
export const OPPORTUNITY_RECOGNITION_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /noticed\s+a\s+(problem|gap|opportunity)/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Actively identified a problem or opportunity',
    countersProfiles: [NonFounderProfileV2.CONSULTANT, NonFounderProfileV2.RESEARCHER],
  },
  {
    pattern: /why\s+hasn['']t\s+anyone/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Questioned why solution doesn\'t exist',
  },
  {
    pattern: /someone\s+should\s+build/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Identified gap in market offerings',
    contextDampeners: ['but i won\'t', 'not me', 'someone else'],
  },
  {
    pattern: /wouldn['']t\s+it\s+be\s+great\s+if/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Envisioning improved solutions',
  },
  {
    pattern: /pain\s+point/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Identified customer pain point',
    countersProfiles: [NonFounderProfileV2.CONSULTANT],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /pattern/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Pattern recognition mentioned',
    contextBoosters: ['noticed', 'saw', 'recognized', 'identified'],
  },
  {
    pattern: /trend/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Market trend awareness',
  },
  {
    pattern: /market/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Market awareness',
    contextBoosters: ['opportunity', 'gap', 'need', 'demand'],
  },
  {
    pattern: /inefficient|broken|outdated/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Identified inefficiency or problem',
  },
  {
    pattern: /better\s+way/i,
    strength: 0.65,
    evidenceType: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
    description: 'Seeking better solutions',
  },
  
  // WEAK SIGNALS
  {
    pattern: /curious/i,
    strength: 0.45,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Curiosity mentioned',
  },
  {
    pattern: /observe|notice/i,
    strength: 0.4,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Observational tendency',
  },
  {
    pattern: /question/i,
    strength: 0.4,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Questioning tendency',
  },
  
  // ANTI-SIGNALS (consultant patterns)
  {
    pattern: /recommendation|advisory|advice/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Advisory language suggests consultant pattern',
    isAntiSignal: true,
    countersProfiles: [NonFounderProfileV2.CONSULTANT],
  },
];

// ============================================================================
// OBSESSION CAPACITY SIGNALS
// ============================================================================

/**
 * Obsession Capacity signals.
 * 
 * Detects ability to maintain long-term commitment.
 * 
 * FALSE POSITIVE CHECK: Researchers also persist but without commercial focus.
 * Look for: Years of commitment to projects with outcomes, not just study.
 */
export const OBSESSION_CAPACITY_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /spent\s+(years|over\s+a\s+year)/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Multi-year commitment demonstrated',
  },
  {
    pattern: /worked\s+on\s+it\s+for\s+(\d+\+?\s*years?|years)/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Sustained work over extended period',
  },
  {
    pattern: /dedicated\s+myself/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Self-dedication to pursuit',
  },
  {
    pattern: /can['']t\s+stop\s+thinking/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Obsessive thought pattern',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /obsessed\s+with/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Expressed obsession',
    contextDampeners: ['was obsessed', 'used to be'],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /passionate\s+about/i,
    strength: 0.65,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Passion expressed',
  },
  {
    pattern: /deep\s+interest/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Deep interest indicated',
  },
  {
    pattern: /long\s+term/i,
    strength: 0.65,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Long-term thinking',
  },
  {
    pattern: /committed\s+to/i,
    strength: 0.75,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Commitment expressed',
  },
  {
    pattern: /delayed\s+gratification/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Delayed gratification capacity',
  },
  {
    pattern: /sacrifice/i,
    strength: 0.75,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Willingness to sacrifice',
  },
  {
    pattern: /patient/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Patience indicated',
  },
  {
    pattern: /persistence|perseverance|stick\s+with\s+it/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
    description: 'Persistence demonstrated',
  },
  
  // WEAK SIGNALS
  {
    pattern: /dream|vision|mission/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Vision/dream mentioned',
  },
  
  // ANTI-SIGNALS
  {
    pattern: /lost\s+interest|moved\s+on|got\s+bored/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Lost interest quickly',
    isAntiSignal: true,
  },
  {
    pattern: /tried\s+for\s+a\s+while\s+but/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Gave up after short time',
    isAntiSignal: true,
  },
];

// ============================================================================
// RESOURCEFULNESS SIGNALS
// ============================================================================

/**
 * Resourcefulness signals.
 * 
 * Detects ability to create progress without resources.
 * 
 * FALSE POSITIVE CHECK: Freelancers are resourceful but within service constraints.
 * Look for: Creating something from nothing, not just delivering services efficiently.
 */
export const RESOURCEFULNESS_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /figured\s+it\s+out/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Self-solved problems',
  },
  {
    pattern: /learned\s+on\s+my\s+own/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Self-directed learning',
    countersProfiles: [NonFounderProfileV2.ACADEMIC],
  },
  {
    pattern: /taught\s+myself/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Self-taught skills',
  },
  {
    pattern: /no\s+budget|limited\s+resources|worked\s+with\s+what\s+i\s+had/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Achieved with constraints',
  },
  {
    pattern: /jugaad/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Frugal innovation (jugaad)',
  },
  {
    pattern: /hack|workaround|improvise/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Creative problem solving',
    contextBoosters: ['solution', 'fixed', 'solved'],
  },
  {
    pattern: /self-taught/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Self-taught capability',
  },
  {
    pattern: /youtube|online|documentation|google/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Used free resources to learn',
    contextBoosters: ['learned', 'taught', 'figured out'],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /bootstrap|bootstrapped/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Bootstrap mentality',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /scrappy|lean|mvp/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Lean/ scrappy approach',
  },
  {
    pattern: /find\s+a\s+way|make\s+it\s+work/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Determined problem solving',
  },
  {
    pattern: /solve.*with\s+constraints/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Constraint-aware problem solving',
  },
  {
    pattern: /didn['']t\s+have.*so\s+i/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Worked around missing resources',
  },
  
  // WEAK SIGNALS
  {
    pattern: /creative\s+solution/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Creative solution mentioned',
  },
  {
    pattern: /workaround/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
    description: 'Found workaround',
  },
];

// ============================================================================
// AMBIGUITY TOLERANCE SIGNALS
// ============================================================================

/**
 * Ambiguity Tolerance signals.
 * 
 * Detects comfort operating without structure.
 * 
 * FALSE POSITIVE CHECK: Artists tolerate ambiguity but without business discipline.
 * Look for: Ambiguity in business context, not just creative exploration.
 */
export const AMBIGUITY_TOLERANCE_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /comfortable\s+with\s+uncertainty/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Explicit comfort with uncertainty',
  },
  {
    pattern: /don['']t\s+need\s+all\s+the\s+answers/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Comfort with incomplete information',
  },
  {
    pattern: /experiment|test\s+and\s+learn/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Experimental approach',
    contextBoosters: ['business', 'market', 'product', 'customer'],
  },
  {
    pattern: /try\s+things/i,
    strength: 0.75,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Willingness to try',
  },
  {
    pattern: /figure\s+it\s+out\s+as\s+i\s+go/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Learn-as-you-go approach',
  },
  {
    pattern: /learn\s+by\s+doing/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Learning through action',
  },
  {
    pattern: /pivot|changed\s+direction/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Willingness to pivot',
    countersProfiles: [NonFounderProfileV2.OBSESSION_CAPACITY],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /no\s+clear\s+path/i,
    strength: 0.75,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Acknowledged unclear path',
  },
  {
    pattern: /undefined|ambiguous/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Comfort with ambiguity',
  },
  {
    pattern: /adapt|adaptable/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Adaptability indicated',
  },
  
  // WEAK SIGNALS
  {
    pattern: /risk/i,
    strength: 0.4,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Risk mentioned',
    contextBoosters: ['take', 'comfortable', 'accept', 'embrace'],
    contextDampeners: ['avoid', 'hate', 'don\'t like'],
  },
  {
    pattern: /uncertain|unknown/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
    description: 'Uncertainty acknowledged',
  },
  
  // ANTI-SIGNALS
  {
    pattern: /need\s+a\s+clear\s+plan|need\s+structure/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Requires structure/plan',
    isAntiSignal: true,
  },
  {
    pattern: /hate\s+uncertainty|uncomfortable\s+with\s+ambiguity/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Discomfort with ambiguity',
    isAntiSignal: true,
  },
];

// ============================================================================
// RESILIENCE SIGNALS
// ============================================================================

/**
 * Resilience signals.
 * 
 * Detects ability to recover from failure.
 * 
 * FALSE POSITIVE CHECK: All resilient people aren't founders - need other dimensions.
 * This is necessary but not sufficient. Combine with other dimensions.
 */
export const RESILIENCE_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /failed\s+but/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Failed but continued',
  },
  {
    pattern: /setback.*recovered/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Recovered from setback',
  },
  {
    pattern: /got\s+back\s+up/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Resilience after failure',
  },
  {
    pattern: /tried\s+again/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Persistence after failure',
  },
  {
    pattern: /didn['']t\s+give\s+up/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Refused to quit',
  },
  {
    pattern: /learned\s+from\s+(failure|mistake|rejection)/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Learning from failure',
  },
  {
    pattern: /mistake\s+taught\s+me/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Extracted lessons from mistakes',
  },
  {
    pattern: /rejection/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Handled rejection',
    contextBoosters: ['faced', 'dealt with', 'learned from'],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /criticism/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Handled criticism',
    contextBoosters: ['accepted', 'learned from', 'used'],
  },
  {
    pattern: /bounce\s+back|bounced\s+back/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Bounced back from adversity',
  },
  {
    pattern: /resilient|thick\s+skin/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Resilience indicated',
  },
  {
    pattern: /challenge|difficult/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Faced challenges',
    contextBoosters: ['overcame', 'navigated', 'handled', 'solved'],
  },
  {
    pattern: /overcame/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Overcame obstacles',
  },
  
  // WEAK SIGNALS
  {
    pattern: /feedback/i,
    strength: 0.4,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Feedback mentioned',
  },
  
  // ANTI-SIGNALS
  {
    pattern: /gave\s+up|quit|abandoned/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Gave up when faced with difficulty',
    isAntiSignal: true,
    contextDampeners: ['right choice', 'should have', 'learned'],
  },
];

// ============================================================================
// TALENT MAGNETISM SIGNALS
// ============================================================================

/**
 * Talent Magnetism signals.
 * 
 * Detects ability to attract talented people.
 * 
 * FALSE POSITIVE CHECK: Need combined with ownership orientation (not just management).
 * Look for: Attracting people to YOUR vision, not just managing teams.
 */
export const TALENT_MAGNETISM_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /convinced\s+people\s+to\s+join/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Successfully recruited people',
  },
  {
    pattern: /built\s+a\s+team/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Built a team',
    countersProfiles: [NonFounderProfileV2.FREELANCER, NonFounderProfileV2.INDEPENDENT_SPECIALIST],
  },
  {
    pattern: /recruited/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Recruited talent',
  },
  {
    pattern: /people\s+believe\s+in\s+my\s+vision/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Vision attracts others',
  },
  {
    pattern: /inspired\s+others/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Inspirational leadership',
  },
  {
    pattern: /people\s+want\s+to\s+work\s+with\s+me/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Attracts collaborators',
  },
  {
    pattern: /attract\s+talent/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Talent attraction capability',
  },
  
  // MODERATE SIGNALS
  {
    pattern: /leadership/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Leadership indicated',
  },
  {
    pattern: /team/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Team experience',
    contextBoosters: ['led', 'built', 'managed', 'assembled'],
  },
  {
    pattern: /collaborators?/i,
    strength: 0.65,
    evidenceType: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
    description: 'Attracted collaborators',
  },
  {
    pattern: /network/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Network mentioned',
    contextBoosters: ['built', 'leveraged', 'attracted through'],
  },
  {
    pattern: /connections?/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Connections mentioned',
  },
  {
    pattern: /charismatic|inspiring|motivating/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
    description: 'Charismatic/inspiring traits',
  },
  {
    pattern: /relationships?/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Relationship building',
    contextBoosters: ['built', 'strong', 'deep'],
  },
  
  // ANTI-SIGNALS
  {
    pattern: /prefer\s+to\s+work\s+alone/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Prefers solo work',
    isAntiSignal: true,
  },
  {
    pattern: /solo|alone|by\s+myself/i,
    strength: 0.4,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Solo work preference',
    isAntiSignal: true,
    contextBoosters: ['prefer', 'like', 'rather'],
  },
];

// ============================================================================
// SALES CAPABILITY SIGNALS
// ============================================================================

/**
 * Sales Capability signals.
 * 
 * Detects ability to persuade and sell.
 * 
 * FALSE POSITIVE CHECK: Salespeople sell but lack ownership/product obsession.
 * Look for: Selling YOUR ideas/products, not just commissioned sales.
 */
export const SALES_CAPABILITY_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /sold\s+.*\$|closed\s+the\s+deal/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Closed sales with revenue',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /convinced\s+them/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Successfully persuaded',
  },
  {
    pattern: /persuaded/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Persuasion demonstrated',
  },
  {
    pattern: /negotiation|negotiated/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Negotiation experience',
  },
  {
    pattern: /pitch|pitching/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Pitching experience',
    contextBoosters: ['investor', 'customer', 'client', 'deck'],
  },
  {
    pattern: /presentation|presented/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Presentation skills',
    contextBoosters: ['sold', 'convinced', 'won', 'closed'],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /relationship\s+building/i,
    strength: 0.75,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Relationship building focus',
  },
  {
    pattern: /trust|rapport/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Trust/rapport building',
    contextBoosters: ['built', 'established', 'earned'],
  },
  {
    pattern: /storytelling/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Storytelling capability',
  },
  {
    pattern: /communicate|communication/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    description: 'Communication mentioned',
    contextBoosters: ['clearly', 'effectively', 'persuasively'],
  },
  {
    pattern: /influence|influenced/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Influence demonstrated',
  },
  {
    pattern: /customer|client/i,
    strength: 0.55,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Customer/client focus',
    contextBoosters: ['acquired', 'won', 'signed', 'sold'],
  },
  {
    pattern: /buyer/i,
    strength: 0.6,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Buyer understanding',
  },
  {
    pattern: /win\s+over|won\s+over/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Won people over',
  },
  
  // WEAK SIGNALS
  {
    pattern: /convince/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Convincing ability',
  },
];

// ============================================================================
// OWNERSHIP ORIENTATION SIGNALS
// ============================================================================

/**
 * Ownership Orientation signals.
 * 
 * Detects tendency to take ownership and act with accountability.
 * 
 * FALSE POSITIVE CHECK: Freelancers have ownership but of services not products.
 * Look for: Ownership of outcomes, equity mindset, not just task ownership.
 */
export const OWNERSHIP_ORIENTATION_SIGNALS: SignalPattern[] = [
  // STRONG SIGNALS
  {
    pattern: /took\s+responsibility/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Took responsibility',
  },
  {
    pattern: /my\s+fault/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Took accountability for failures',
  },
  {
    pattern: /accountable/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Accountability indicated',
  },
  {
    pattern: /ownership|act\s+like\s+an\s+owner|treat\s+it\s+as\s+mine/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Ownership mentality',
    countersProfiles: [NonFounderProfileV2.EMPLOYEE_MINDSET],
  },
  {
    pattern: /equity|stake|skin\s+in\s+the\s+game/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Equity mindset',
  },
  {
    pattern: /initiative|proactive/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Proactive initiative',
  },
  {
    pattern: /didn['']t\s+wait/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Did not wait for permission',
  },
  {
    pattern: /decided\s+to|chose\s+to|made\s+the\s+call/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Made decisions independently',
  },
  {
    pattern: /responsible\s+for|in\s+charge\s+of/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Took responsibility for outcomes',
    contextBoosters: ['results', 'success', 'failure', 'outcome'],
  },
  {
    pattern: /led/i,
    strength: 0.8,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Led initiatives',
    contextBoosters: ['team', 'project', 'effort', 'initiative'],
  },
  
  // MODERATE SIGNALS
  {
    pattern: /not\s+my\s+job\s+but|stepped\s+up/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Went beyond defined role',
  },
  {
    pattern: /volunteered/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Volunteered for responsibility',
  },
  {
    pattern: /founder['']s?\s+mindset|entrepreneurial\s+mindset/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.OWNERSHIP_BEHAVIOR,
    description: 'Explicit founder mindset',
  },
  {
    pattern: /started.*on\s+my\s+own|started\s+my\s+own/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
    description: 'Started something independently',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /built\s+it\s+myself|created\s+it/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
    description: 'Built/created independently',
  },
  
  // ANTI-SIGNALS
  {
    pattern: /not\s+my\s+job|not\s+my\s+responsibility/i,
    strength: 0.7,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Avoided responsibility',
    isAntiSignal: true,
  },
  {
    pattern: /waited\s+for.*approval|needed\s+permission/i,
    strength: 0.5,
    evidenceType: FounderEvidenceTypeV2.CONTRADICTORY_EVIDENCE,
    description: 'Waited for permission',
    isAntiSignal: true,
  },
];

// ============================================================================
// NON-FOUNDER PROFILE PATTERNS
// ============================================================================

/**
 * Freelancer detection patterns.
 */
export const FREELANCER_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /freelance|freelancing/i,
    strength: 0.95,
    indication: 'Explicit freelancer identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['product', 'startup', 'company', 'team', 'equity', 'co-founder'],
    overrideReduction: 0.5,
  },
  {
    pattern: /client\s+work|billable\s+hours|hourly\s+rate/i,
    strength: 0.9,
    indication: 'Service-based work model',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /project\s+basis|contract\s+work/i,
    strength: 0.85,
    indication: 'Contract/project work model',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /deliverables?|scope\s+of\s+work/i,
    strength: 0.8,
    indication: 'Service delivery language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /independent\s+contractor|1099/i,
    strength: 0.9,
    indication: 'Independent contractor status',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /work\s+for\s+clients/i,
    strength: 0.85,
    indication: 'Client service model',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Consultant detection patterns.
 */
export const CONSULTANT_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /consultant|consulting/i,
    strength: 0.95,
    indication: 'Explicit consultant identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['built', 'created', 'product', 'implementation', 'execution'],
    overrideReduction: 0.5,
  },
  {
    pattern: /advisor|advisory/i,
    strength: 0.9,
    indication: 'Advisory role',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /strategic\s+advice|recommendations?/i,
    strength: 0.85,
    indication: 'Recommendation-focused work',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /best\s+practices|framework/i,
    strength: 0.75,
    indication: 'Consulting methodology language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /mckinsey|bain|bcg|big\s+four/i,
    strength: 0.9,
    indication: 'Major consulting firm background',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /help\s+companies|guide\s+organizations/i,
    strength: 0.8,
    indication: 'External advisory position',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Researcher/Academic detection patterns.
 */
export const RESEARCHER_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /research|researcher/i,
    strength: 0.85,
    indication: 'Research focus',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['commercial', 'market', 'product', 'customers', 'revenue'],
    overrideReduction: 0.6,
  },
  {
    pattern: /phd|doctoral|dissertation|thesis/i,
    strength: 0.9,
    indication: 'Academic research background',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /publication|paper|journal|peer\s+review/i,
    strength: 0.9,
    indication: 'Academic publication focus',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /professor|lecturer|academic/i,
    strength: 0.95,
    indication: 'Academic position',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /knowledge\s+for\s+its\s+own\s+sake/i,
    strength: 0.85,
    indication: 'Pure research motivation',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /understand|discover|insights?|findings?/i,
    strength: 0.7,
    indication: 'Knowledge-seeking language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Artist detection patterns.
 */
export const ARTIST_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /artist|artistic/i,
    strength: 0.9,
    indication: 'Explicit artist identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['product', 'market', 'business model', 'customers', 'revenue'],
    overrideReduction: 0.5,
  },
  {
    pattern: /creative\s+expression|artistic\s+vision/i,
    strength: 0.85,
    indication: 'Expression-focused work',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /gallery|exhibition|portfolio/i,
    strength: 0.8,
    indication: 'Art world context',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /aesthetic|masterpiece/i,
    strength: 0.75,
    indication: 'Aesthetic-focused language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /fine\s+art|painting|sculpture/i,
    strength: 0.85,
    indication: 'Traditional art forms',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Wantrepreneur detection patterns.
 */
export const WANTREPRENEUR_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /want\s+to\s+start|thinking\s+about\s+starting/i,
    strength: 0.85,
    indication: 'Future intent without action',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['built', 'launched', 'started', 'created', 'working on', 'have'],
    overrideReduction: 0.7,
  },
  {
    pattern: /someday|one\s+day\s+i\s+will|eventually/i,
    strength: 0.8,
    indication: 'Deferred action language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /dream\s+of|planning\s+to|considering/i,
    strength: 0.75,
    indication: 'Contemplation without execution',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /great\s+idea|million\s+dollar\s+idea/i,
    strength: 0.75,
    indication: 'Idea-focused without execution',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /waiting\s+for|need\s+funding\s+first|once\s+i\s+have/i,
    strength: 0.8,
    indication: 'Waiting for external conditions',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /after\s+i\s+learn|when\s+the\s+time\s+is\s+right/i,
    strength: 0.7,
    indication: 'Conditional/deferred action',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Independent Specialist detection patterns.
 */
export const INDEPENDENT_SPECIALIST_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /specialist|expert\s+in/i,
    strength: 0.8,
    indication: 'Specialist identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['team', 'hire', 'delegate', 'manage', 'organization'],
    overrideReduction: 0.5,
  },
  {
    pattern: /deep\s+expertise|niche|highly\s+skilled/i,
    strength: 0.8,
    indication: 'Deep specialization',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /solo\s+practice|individual\s+contributor/i,
    strength: 0.85,
    indication: 'Solo practice model',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /subject\s+matter\s+expert|thought\s+leader/i,
    strength: 0.75,
    indication: 'Expert positioning',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /certification|credentials?|licensed/i,
    strength: 0.65,
    indication: 'Credential-focused practice',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Content Creator detection patterns.
 */
export const CONTENT_CREATOR_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /content\s+creator|influencer|youtuber|blogger/i,
    strength: 0.95,
    indication: 'Content creator identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['product', 'solve problem', 'users', 'customers'],
    overrideReduction: 0.5,
  },
  {
    pattern: /subscribers?|followers?|audience/i,
    strength: 0.85,
    indication: 'Audience-focused metrics',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /views|likes|engagement|viral/i,
    strength: 0.8,
    indication: 'Content metrics focus',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /personal\s+brand|content\s+strategy/i,
    strength: 0.85,
    indication: 'Content creator methodology',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /sponsored|brand\s+deal|ad\s+revenue/i,
    strength: 0.8,
    indication: 'Content monetization model',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

/**
 * Investor Mindset detection patterns.
 */
export const INVESTOR_MINDSET_PATTERNS: NonFounderPattern[] = [
  {
    pattern: /investor|investing|portfolio/i,
    strength: 0.85,
    indication: 'Investor identity',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
    overrideSignals: ['built', 'operated', 'ran', 'managed team'],
    overrideReduction: 0.5,
  },
  {
    pattern: /roi|return\s+on\s+investment|cash\s+flow/i,
    strength: 0.75,
    indication: 'Investment metrics language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /diversif/i,
    strength: 0.7,
    indication: 'Diversification mindset',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /allocate\s+capital|capital\s+allocation/i,
    strength: 0.8,
    indication: 'Capital allocation focus',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
  {
    pattern: /deal\s+flow|due\s+diligence/i,
    strength: 0.85,
    indication: 'Investment process language',
    evidenceType: FounderEvidenceTypeV2.CROSS_RESPONSE_PATTERN,
  },
];

// ============================================================================
// DIFFERENTIAL FOUNDER INDICATORS
// ============================================================================

/**
 * Strong founder signals that override non-founder patterns.
 * 
 * These are specific signals that indicate true founder potential
 * even when some non-founder patterns are present.
 */
export const DIFFERENTIAL_FOUNDER_INDICATORS: SignalPattern[] = [
  {
    pattern: /built.*product/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
    description: 'Built a product (strong founder signal)',
    countersProfiles: [NonFounderProfileV2.FREELANCER, NonFounderProfileV2.CONSULTANT, NonFounderProfileV2.CONTENT_CREATOR],
  },
  {
    pattern: /actual\s+users?|real\s+users?/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
    description: 'Has actual users',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /paying\s+customers?|revenue/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
    description: 'Generated revenue',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR, NonFounderProfileV2.ARTIST],
  },
  {
    pattern: /co-founder|cofounder/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
    description: 'Has co-founder experience',
    countersProfiles: [NonFounderProfileV2.FREELANCER, NonFounderProfileV2.INDEPENDENT_SPECIALIST],
  },
  {
    pattern: /raised.*funding|seed\s+round|series\s+[a-z]/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
    description: 'Raised funding',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /incorporated|registered\s+company|legal\s+entity/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
    description: 'Formed legal entity',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /product-market\s+fit|pmf/i,
    strength: 0.95,
    evidenceType: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
    description: 'Achieved product-market fit',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /hired.*employees?|team\s+of\s+\d+/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.LEADERSHIP_EVIDENCE,
    description: 'Built team/ hired employees',
    countersProfiles: [NonFounderProfileV2.FREELANCER, NonFounderProfileV2.INDEPENDENT_SPECIALIST],
  },
  {
    pattern: /pivot|pivoted/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
    description: 'Has pivoted a venture',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /mvp|minimum\s+viable\s+product/i,
    strength: 0.9,
    evidenceType: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
    description: 'Built MVP',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
  {
    pattern: /startup\s+(failed|shut\s+down|closed)/i,
    strength: 0.85,
    evidenceType: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
    description: 'Experienced startup failure and learned',
    countersProfiles: [NonFounderProfileV2.WANTREPRENEUR],
  },
];

// ============================================================================
// SIGNAL MAP
// ============================================================================

/**
 * Map of all dimension signals for easy access.
 */
export const DIMENSION_SIGNAL_MAP: Record<FounderDimensionV2, SignalPattern[]> = {
  [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: OPPORTUNITY_RECOGNITION_SIGNALS,
  [FounderDimensionV2.OBSESSION_CAPACITY]: OBSESSION_CAPACITY_SIGNALS,
  [FounderDimensionV2.RESOURCEFULNESS]: RESOURCEFULNESS_SIGNALS,
  [FounderDimensionV2.AMBIGUITY_TOLERANCE]: AMBIGUITY_TOLERANCE_SIGNALS,
  [FounderDimensionV2.RESILIENCE]: RESILIENCE_SIGNALS,
  [FounderDimensionV2.TALENT_MAGNETISM]: TALENT_MAGNETISM_SIGNALS,
  [FounderDimensionV2.SALES_CAPABILITY]: SALES_CAPABILITY_SIGNALS,
  [FounderDimensionV2.OWNERSHIP_ORIENTATION]: OWNERSHIP_ORIENTATION_SIGNALS,
};

/**
 * Map of all non-founder profile patterns.
 */
export const NON_FOUNDER_PATTERN_MAP: Record<NonFounderProfileV2, NonFounderPattern[]> = {
  [NonFounderProfileV2.FREELANCER]: FREELANCER_PATTERNS,
  [NonFounderProfileV2.CONSULTANT]: CONSULTANT_PATTERNS,
  [NonFounderProfileV2.RESEARCHER]: RESEARCHER_PATTERNS,
  [NonFounderProfileV2.ACADEMIC]: RESEARCHER_PATTERNS, // Same patterns
  [NonFounderProfileV2.ARTIST]: ARTIST_PATTERNS,
  [NonFounderProfileV2.INDEPENDENT_SPECIALIST]: INDEPENDENT_SPECIALIST_PATTERNS,
  [NonFounderProfileV2.CONTENT_CREATOR]: CONTENT_CREATOR_PATTERNS,
  [NonFounderProfileV2.INVESTOR_MINDSET]: INVESTOR_MINDSET_PATTERNS,
  [NonFounderProfileV2.WANTREPRENEUR]: WANTREPRENEUR_PATTERNS,
};

// Helper for type compatibility
const NonFounderProfileV2_EMPLOYEE_MINDSET = 'EMPLOYEE_MINDSET' as NonFounderProfileV2;
