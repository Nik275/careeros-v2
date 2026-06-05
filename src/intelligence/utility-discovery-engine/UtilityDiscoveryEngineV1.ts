/**
 * CareerOS Personal Utility Discovery Engine V1
 *
 * Infers a student's true utility function from choices, tradeoffs, and behavioral signals.
 * Students often cannot directly state what they value - this engine discovers it.
 *
 * Features:
 * - Tradeoff analysis from choice patterns
 * - Value conflict detection (stated vs revealed preferences)
 * - Utility confidence scoring per attribute
 * - Utility evolution tracking over time
 * - Explainable inference with reasoning
 *
 * Integrates with MAUT Foundation for profile generation.
 *
 * @module intelligence/utility-discovery-engine
 * @version 1.0.0
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type {
  UtilityAttributeId,
  StudentUtilityProfile,
  UtilityValidationResult,
} from '../maut-foundation/MAUTFoundationV1.js';
import {
  createUtilityProfile,
  validateUtilityProfile,
  normalizeUtilityWeights,
  CORE_UTILITY_ATTRIBUTES,
  type MAUTConfig,
  DEFAULT_MAUT_CONFIG,
} from '../maut-foundation/MAUTFoundationV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Discovery analysis identifier
 */
export type DiscoveryAnalysisId = string;

/**
 * Types of behavioral signals for utility inference
 */
export type BehavioralSignalType =
  | 'explicit-ranking'      // Student explicitly ranked attributes
  | 'tradeoff-choice'       // Choice in tradeoff scenario
  | 'career-preference'     // Preferred careers indicate values
  | 'path-selection'        // Actual path choices
  | 'scenario-response'     // Response to hypothetical scenarios
  | 'time-allocation'       // How student spends time/effort
  | 'risk-preference'       // Risk tolerance in choices
  | 'sacrifice-willingness' // What they're willing to give up
  | 'exploration-pattern'   // What they explore vs ignore
  | 'decision-speed';       // Speed of decisions indicates priority

/**
 * Single behavioral signal observation
 */
export interface BehavioralSignal {
  /** Signal identifier */
  id: string;

  /** Type of signal */
  type: BehavioralSignalType;

  /** When observed */
  timestamp: number;

  /** Context of observation */
  context: {
    /** Assessment or scenario that generated signal */
    source: string;

    /** Question or prompt */
    prompt: string;

    /** Additional context */
    metadata: Record<string, unknown>;
  };

  /** Observed behavior/choice */
  observation: {
    /** What was chosen/preferred/indicated */
    value: string | number | boolean;

    /** What was rejected/alternative */
    alternative?: string | number | boolean;

    /** Confidence in observation (0-100) */
    confidence: number;
  };

  /** Attributes this signal informs */
  relevantAttributes: UtilityAttributeId[];

  /** Strength of signal (0-100) */
  signalStrength: number;
}

/**
 * Tradeoff scenario presented to student
 */
export interface TradeoffScenario {
  /** Scenario identifier */
  id: string;

  /** Scenario description */
  description: string;

  /** Option A */
  optionA: {
    label: string;
    attributes: Partial<Record<UtilityAttributeId, number>>;
  };

  /** Option B */
  optionB: {
    label: string;
    attributes: Partial<Record<UtilityAttributeId, number>>;
  };

  /** What attributes this scenario tests */
  testedAttributes: UtilityAttributeId[];

  /** Clear tradeoff dimension */
  tradeoffDimension: string;

  /** Expected inference from choice */
  expectedInference: {
    ifChooseA: string;
    ifChooseB: string;
  };
}

/**
 * Student's response to a tradeoff scenario
 */
export interface TradeoffResponse {
  /** Scenario ID */
  scenarioId: string;

  /** Which option chosen */
  choice: 'A' | 'B' | 'indifferent';

  /** Confidence in choice (0-100) */
  confidence: number;

  /** Time to decide (ms) */
  decisionTimeMs: number;

  /** Optional reasoning */
  reasoning?: string;

  /** Inferred attribute weights from this choice */
  inferredWeights: Partial<Record<UtilityAttributeId, number>>;
}

/**
 * Detected value conflict (stated vs revealed)
 */
export interface ValueConflict {
  /** Conflict identifier */
  id: string;

  /** Type of conflict */
  type: 'stated-vs-revealed' | 'temporal' | 'contextual' | 'internal';

  /** Attribute involved */
  attribute: UtilityAttributeId;

  /** What student claimed */
  statedValue: {
    value: number;
    source: string;
    timestamp: number;
  };

  /** What behavior revealed */
  revealedValue: {
    value: number;
    source: string;
    timestamp: number;
  };

  /** Magnitude of conflict */
  discrepancy: number;

  /** Severity */
  severity: 'minor' | 'moderate' | 'significant' | 'critical';

  /** Possible explanations */
  explanations: string[];

  /** Recommendation for resolution */
  recommendation: string;
}

/**
 * Confidence in inferred utility weight
 */
export interface WeightConfidence {
  /** Attribute */
  attribute: UtilityAttributeId;

  /** Inferred weight */
  weight: number;

  /** Confidence in inference (0-100) */
  confidence: number;

  /** Confidence rating */
  rating: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';

  /** Number of supporting signals */
  signalCount: number;

  /** Quality of supporting signals */
  signalQuality: number;

  /** Consistency across signals */
  consistency: number;

  /** Conflicting signals */
  conflicts: number;

  /** Recommendation for additional data */
  dataRecommendation: string;
}

/**
 * Utility profile evolution snapshot
 */
export interface UtilityEvolutionSnapshot {
  /** Snapshot identifier */
  id: string;

  /** Timestamp */
  timestamp: number;

  /** Inferred weights at this time */
  weights: Record<UtilityAttributeId, number>;

  /** Confidence scores */
  confidences: Record<UtilityAttributeId, number>;

  /** What changed since last snapshot */
  changes: Array<{
    attribute: UtilityAttributeId;
    previousWeight: number;
    currentWeight: number;
    change: number;
    significance: 'major' | 'moderate' | 'minor';
  }>;

  /** Triggering events */
  triggerEvents: string[];

  /** Overall stability score */
  stabilityScore: number;
}

/**
 * Explanation for inferred utility weight
 */
export interface WeightExplanation {
  /** Attribute */
  attribute: UtilityAttributeId;

  /** Inferred weight */
  weight: number;

  /** Human-readable explanation */
  explanation: string;

  /** Key evidence supporting this inference */
  evidence: Array<{
    type: BehavioralSignalType;
    description: string;
    strength: number;
  }>;

  /** Alternative interpretations considered */
  alternatives: string[];

  /** Confidence justification */
  confidenceJustification: string;
}

/**
 * Complete utility discovery result
 */
export interface UtilityDiscoveryResult {
  /** Analysis identifier */
  id: DiscoveryAnalysisId;

  /** Student identifier */
  studentId: string;

  /** When analysis performed */
  timestamp: number;

  /** Discovered utility profile */
  profile: StudentUtilityProfile;

  /** Validation result */
  validation: UtilityValidationResult;

  /** Confidence in each weight */
  weightConfidences: Record<UtilityAttributeId, WeightConfidence>;

  /** Overall confidence */
  overallConfidence: number;

  /** Detected value conflicts */
  valueConflicts: ValueConflict[];

  /** Weight explanations */
  explanations: Record<UtilityAttributeId, WeightExplanation>;

  /** Evolution history (if available) */
  evolution?: UtilityEvolutionSnapshot[];

  /** Data quality assessment */
  dataQuality: {
    totalSignals: number;
    signalTypes: Record<BehavioralSignalType, number>;
    coverage: Record<UtilityAttributeId, number>; // 0-100 coverage per attribute
    gaps: UtilityAttributeId[];
  };

  /** Recommendations for improving discovery */
  recommendations: string[];
}

/**
 * Discovery engine configuration
 */
export interface UtilityDiscoveryConfig {
  /** Minimum signals for confident inference */
  minSignalsPerAttribute: number;

  /** Minimum confidence threshold */
  minConfidenceThreshold: number;

  /** Weight change threshold for significance */
  weightChangeThreshold: number;

  /** Conflict detection threshold */
  conflictThreshold: number;

  /** Signal decay (older signals weighted less) */
  signalDecayRate: number;

  /** MAUT configuration */
  mautConfig: MAUTConfig;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_UTILITY_DISCOVERY_CONFIG: UtilityDiscoveryConfig = {
  minSignalsPerAttribute: 3,
  minConfidenceThreshold: 60,
  weightChangeThreshold: 0.1, // 10% change is significant
  conflictThreshold: 0.2, // 20% discrepancy triggers conflict
  signalDecayRate: 0.95, // 5% decay per month
  mautConfig: DEFAULT_MAUT_CONFIG,
};

// ============================================================================
// TRADEOFF ANALYZER
// ============================================================================

/**
 * Analyze tradeoff choices to infer utility weights
 */
export function analyzeTradeoffChoices(
  responses: TradeoffResponse[],
  scenarios: TradeoffScenario[]
): Partial<Record<UtilityAttributeId, number>> {
  const attributeSignals: Record<UtilityAttributeId, number[]> = {};

  for (const response of responses) {
    const scenario = scenarios.find(s => s.id === response.scenarioId);
    if (!scenario) continue;

    // Skip indifferent responses
    if (response.choice === 'indifferent') continue;

    const chosen = response.choice === 'A' ? scenario.optionA : scenario.optionB;
    const rejected = response.choice === 'A' ? scenario.optionB : scenario.optionA;

    // Calculate differences for each tested attribute
    for (const attrId of scenario.testedAttributes) {
      const chosenValue = chosen.attributes[attrId] ?? 50;
      const rejectedValue = rejected.attributes[attrId] ?? 50;
      const difference = chosenValue - rejectedValue;

      // Weight by response confidence and inverse decision time (faster = stronger signal)
      const speedFactor = Math.max(0.5, 1 - (response.decisionTimeMs / 10000));
      const signalStrength = response.confidence * speedFactor;

      // Positive difference means attribute favored chosen option
      // Scale to 0-1 range for weight inference
      const signal = difference > 0 ? signalStrength / 100 : 0;

      if (!attributeSignals[attrId]) {
        attributeSignals[attrId] = [];
      }
      attributeSignals[attrId].push(signal);
    }
  }

  // Average signals per attribute
  const inferredWeights: Partial<Record<UtilityAttributeId, number>> = {};
  for (const [attrId, signals] of Object.entries(attributeSignals)) {
    if (signals.length > 0) {
      const average = signals.reduce((sum, s) => sum + s, 0) / signals.length;
      inferredWeights[attrId as UtilityAttributeId] = Math.min(0.5, average); // Cap individual inferences
    }
  }

  return inferredWeights;
}

/**
 * Generate standard tradeoff scenarios
 */
export function generateTradeoffScenarios(): TradeoffScenario[] {
  return [
    {
      id: 'income-vs-freedom',
      description: 'Choose between income and autonomy',
      optionA: {
        label: 'High Income, Low Freedom',
        attributes: { income: 90, freedom: 20 },
      },
      optionB: {
        label: 'Moderate Income, High Freedom',
        attributes: { income: 60, freedom: 85 },
      },
      testedAttributes: ['income', 'freedom'],
      tradeoffDimension: 'financial-vs-autonomy',
      expectedInference: {
        ifChooseA: 'Income more important than freedom',
        ifChooseB: 'Freedom more important than income',
      },
    },
    {
      id: 'income-vs-meaning',
      description: 'Choose between salary and purpose',
      optionA: {
        label: 'High Salary, Low Purpose',
        attributes: { income: 95, meaning: 15 },
      },
      optionB: {
        label: 'Moderate Salary, High Purpose',
        attributes: { income: 55, meaning: 90 },
      },
      testedAttributes: ['income', 'meaning'],
      tradeoffDimension: 'financial-vs-purpose',
      expectedInference: {
        ifChooseA: 'Income more important than meaning',
        ifChooseB: 'Meaning more important than income',
      },
    },
    {
      id: 'stability-vs-growth',
      description: 'Choose between security and learning',
      optionA: {
        label: 'Stable Job, Slow Growth',
        attributes: { stability: 90, growth: 30 },
      },
      optionB: {
        label: 'Uncertain Job, Rapid Growth',
        attributes: { stability: 30, growth: 90 },
      },
      testedAttributes: ['stability', 'growth'],
      tradeoffDimension: 'security-vs-development',
      expectedInference: {
        ifChooseA: 'Stability more important than growth',
        ifChooseB: 'Growth more important than stability',
      },
    },
    {
      id: 'status-vs-worklife',
      description: 'Choose between prestige and balance',
      optionA: {
        label: 'Prestigious Title, Long Hours',
        attributes: { status: 90, workLifeBalance: 20 },
      },
      optionB: {
        label: 'Standard Title, Good Balance',
        attributes: { status: 40, workLifeBalance: 85 },
      },
      testedAttributes: ['status', 'workLifeBalance'],
      tradeoffDimension: 'recognition-vs-balance',
      expectedInference: {
        ifChooseA: 'Status more important than work-life balance',
        ifChooseB: 'Work-life balance more important than status',
      },
    },
    {
      id: 'mastery-vs-optionality',
      description: 'Choose between depth and flexibility',
      optionA: {
        label: 'Deep Expertise, Narrow Options',
        attributes: { mastery: 95, optionality: 25 },
      },
      optionB: {
        label: 'General Skills, Wide Options',
        attributes: { mastery: 35, optionality: 90 },
      },
      testedAttributes: ['mastery', 'optionality'],
      tradeoffDimension: 'depth-vs-breadth',
      expectedInference: {
        ifChooseA: 'Mastery more important than optionality',
        ifChooseB: 'Optionality more important than mastery',
      },
    },
  ];
}

// ============================================================================
// VALUE CONFLICT DETECTOR
// ============================================================================

/**
 * Detect conflicts between stated and revealed values
 */
export function detectValueConflicts(
  statedWeights: Partial<Record<UtilityAttributeId, number>>,
  revealedWeights: Partial<Record<UtilityAttributeId, number>>,
  signals: BehavioralSignal[],
  config: UtilityDiscoveryConfig = DEFAULT_UTILITY_DISCOVERY_CONFIG
): ValueConflict[] {
  const conflicts: ValueConflict[] = [];

  for (const attrId of Object.keys(revealedWeights) as UtilityAttributeId[]) {
    const stated = statedWeights[attrId];
    const revealed = revealedWeights[attrId];

    if (stated === undefined || revealed === undefined) continue;

    const discrepancy = Math.abs(stated - revealed);

    if (discrepancy > config.conflictThreshold) {
      const severity = discrepancy > 0.4 ? 'critical' :
        discrepancy > 0.3 ? 'significant' :
          discrepancy > 0.2 ? 'moderate' : 'minor';

      const statedSignal = signals.find(s =>
        s.type === 'explicit-ranking' && s.relevantAttributes.includes(attrId)
      );

      const revealedSignals = signals.filter(s =>
        s.relevantAttributes.includes(attrId) && s.type !== 'explicit-ranking'
      );

      conflicts.push({
        id: `conflict-${attrId}-${Date.now()}`,
        type: 'stated-vs-revealed',
        attribute: attrId,
        statedValue: {
          value: stated,
          source: statedSignal?.context.source || 'explicit-statement',
          timestamp: statedSignal?.timestamp || Date.now(),
        },
        revealedValue: {
          value: revealed,
          source: revealedSignals[0]?.context.source || 'behavioral-inference',
          timestamp: revealedSignals[0]?.timestamp || Date.now(),
        },
        discrepancy: Math.round(discrepancy * 100) / 100,
        severity,
        explanations: generateConflictExplanations(attrId, stated, revealed),
        recommendation: generateConflictRecommendation(attrId, severity),
      });
    }
  }

  return conflicts.sort((a, b) => {
    const severityOrder = { critical: 0, significant: 1, moderate: 2, minor: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function generateConflictExplanations(
  attrId: UtilityAttributeId,
  stated: number,
  revealed: number
): string[] {
  const explanations: string[] = [];

  if (revealed > stated) {
    explanations.push(`Behavior suggests ${attrId} is more important than stated`);
    explanations.push(`Possible social desirability bias - claiming lower priority than true preference`);
  } else {
    explanations.push(`Behavior suggests ${attrId} is less important than stated`);
    explanations.push(`Possible aspirational bias - claiming higher priority than demonstrated`);
  }

  explanations.push('Context may affect importance (e.g., different in theory vs practice)');
  explanations.push('Values may have changed since original statement');

  return explanations;
}

function generateConflictRecommendation(
  attrId: UtilityAttributeId,
  severity: ValueConflict['severity']
): string {
  if (severity === 'critical' || severity === 'significant') {
    return `Prioritize gathering more behavioral data on ${attrId} to resolve discrepancy`;
  } else {
    return `Note discrepancy but proceed with revealed preference for ${attrId}`;
  }
}

// ============================================================================
// UTILITY CONFIDENCE ENGINE
// ============================================================================

/**
 * Calculate confidence in inferred utility weights
 */
export function calculateWeightConfidences(
  inferredWeights: Partial<Record<UtilityAttributeId, number>>,
  signals: BehavioralSignal[],
  config: UtilityDiscoveryConfig = DEFAULT_UTILITY_DISCOVERY_CONFIG
): Record<UtilityAttributeId, WeightConfidence> {
  const confidences: Record<UtilityAttributeId, WeightConfidence> = {};

  for (const attrId of Object.keys(inferredWeights) as UtilityAttributeId[]) {
    const weight = inferredWeights[attrId] || 0;

    // Get relevant signals
    const attrSignals = signals.filter(s => s.relevantAttributes.includes(attrId));

    // Signal count
    const signalCount = attrSignals.length;

    // Signal quality (average confidence)
    const signalQuality = signalCount > 0
      ? attrSignals.reduce((sum, s) => sum + s.signalStrength, 0) / signalCount
      : 0;

    // Consistency (low variance = high consistency)
    const signalValues = attrSignals.map(s => {
      if (typeof s.observation.value === 'number') return s.observation.value;
      if (typeof s.observation.value === 'boolean') return s.observation.value ? 100 : 0;
      return 50;
    });

    const avg = signalValues.reduce((sum, v) => sum + v, 0) / Math.max(1, signalValues.length);
    const variance = signalValues.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / Math.max(1, signalValues.length);
    const consistency = Math.max(0, 100 - variance);

    // Conflicting signals
    const conflicts = attrSignals.filter(s => s.observation.confidence < 50).length;

    // Calculate overall confidence
    let confidence = 0;

    // Base from signal count
    if (signalCount >= config.minSignalsPerAttribute) {
      confidence += 40;
    } else {
      confidence += (signalCount / config.minSignalsPerAttribute) * 40;
    }

    // Add quality component
    confidence += (signalQuality / 100) * 30;

    // Add consistency component
    confidence += (consistency / 100) * 20;

    // Penalty for conflicts
    confidence -= conflicts * 5;

    confidence = Math.max(10, Math.min(95, confidence));

    // Determine rating
    let rating: WeightConfidence['rating'];
    if (confidence >= 85) rating = 'very-high';
    else if (confidence >= 70) rating = 'high';
    else if (confidence >= 55) rating = 'moderate';
    else if (confidence >= 40) rating = 'low';
    else rating = 'very-low';

    // Generate data recommendation
    let dataRecommendation: string;
    if (signalCount < config.minSignalsPerAttribute) {
      dataRecommendation = `Need ${config.minSignalsPerAttribute - signalCount} more observations for confident inference`;
    } else if (consistency < 60) {
      dataRecommendation = 'Inconsistent signals - need more specific tradeoff scenarios';
    } else if (confidence < config.minConfidenceThreshold) {
      dataRecommendation = 'Low confidence - gather more behavioral data';
    } else {
      dataRecommendation = 'Sufficient data for confident inference';
    }

    confidences[attrId] = {
      attribute: attrId,
      weight,
      confidence: Math.round(confidence),
      rating,
      signalCount,
      signalQuality: Math.round(signalQuality),
      consistency: Math.round(consistency),
      conflicts,
      dataRecommendation,
    };
  }

  return confidences;
}

// ============================================================================
// UTILITY EVOLUTION TRACKER
// ============================================================================

/**
 * Track how utility weights evolve over time
 */
export function trackUtilityEvolution(
  snapshots: UtilityEvolutionSnapshot[],
  newWeights: Record<UtilityAttributeId, number>,
  triggerEvents: string[]
): UtilityEvolutionSnapshot {
  const previousSnapshot = snapshots[snapshots.length - 1];

  const changes: UtilityEvolutionSnapshot['changes'] = [];

  for (const [attrId, newWeight] of Object.entries(newWeights)) {
    const previousWeight = previousSnapshot?.weights[attrId] ?? newWeight;
    const change = newWeight - previousWeight;

    if (Math.abs(change) > 0.05) { // 5% change threshold
      let significance: UtilityEvolutionSnapshot['changes'][0]['significance'];
      if (Math.abs(change) > 0.2) significance = 'major';
      else if (Math.abs(change) > 0.1) significance = 'moderate';
      else significance = 'minor';

      changes.push({
        attribute: attrId as UtilityAttributeId,
        previousWeight,
        currentWeight: newWeight,
        change: Math.round(change * 100) / 100,
        significance,
      });
    }
  }

  // Calculate stability score
  let stabilityScore = 100;
  for (const change of changes) {
    if (change.significance === 'major') stabilityScore -= 25;
    else if (change.significance === 'moderate') stabilityScore -= 15;
    else stabilityScore -= 5;
  }
  stabilityScore = Math.max(0, stabilityScore);

  return {
    id: `snapshot-${Date.now()}`,
    timestamp: Date.now(),
    weights: newWeights,
    confidences: {}, // Would be populated from confidence engine
    changes,
    triggerEvents,
    stabilityScore: Math.round(stabilityScore),
  };
}

// ============================================================================
// UTILITY EXPLANATION ENGINE
// ============================================================================

/**
 * Generate explanations for inferred utility weights
 */
export function generateWeightExplanations(
  inferredWeights: Partial<Record<UtilityAttributeId, number>>,
  signals: BehavioralSignal[],
  conflicts: ValueConflict[]
): Record<UtilityAttributeId, WeightExplanation> {
  const explanations: Record<UtilityAttributeId, WeightExplanation> = {};

  for (const [attrId, weight] of Object.entries(inferredWeights)) {
    if (weight === undefined) continue;
    
    const attrSignals = signals.filter(s => s.relevantAttributes.includes(attrId));

    // Get top evidence
    const evidence = attrSignals
      .sort((a, b) => b.signalStrength - a.signalStrength)
      .slice(0, 3)
      .map(s => ({
        type: s.type,
        description: generateEvidenceDescription(s, attrId as UtilityAttributeId),
        strength: s.signalStrength,
      }));

    // Check for conflicts
    const attrConflict = conflicts.find(c => c.attribute === attrId);

    // Generate explanation
    let explanation: string;
    if (weight > 0.25) {
      explanation = `${attrId} is highly important to you (${(weight * 100).toFixed(0)}%) based on consistent preference patterns.`;
    } else if (weight > 0.15) {
      explanation = `${attrId} is moderately important to you (${(weight * 100).toFixed(0)}%) based on observed choices.`;
    } else if (weight > 0.05) {
      explanation = `${attrId} has some importance to you (${(weight * 100).toFixed(0)}%) but is not a primary driver.`;
    } else {
      explanation = `${attrId} appears to be of low importance (${(weight * 100).toFixed(0)}%) based on your decisions.`;
    }

    if (attrConflict) {
      explanation += ` Note: There is a ${attrConflict.severity} discrepancy between stated and revealed preference.`;
    }

    // Generate alternatives
    const alternatives = [
      `Alternative: ${attrId} could be ${weight > 0.2 ? 'lower' : 'higher'} if we weight recent signals more heavily.`,
      `Alternative: Context-specific importance (higher in some situations, lower in others).`,
    ];

    // Confidence justification
    const confidenceJustification = evidence.length >= 3
      ? 'High confidence from multiple consistent signals.'
      : evidence.length >= 2
        ? 'Moderate confidence from limited but consistent signals.'
        : 'Low confidence due to insufficient data.';

    explanations[attrId as UtilityAttributeId] = {
      attribute: attrId as UtilityAttributeId,
      weight,
      explanation,
      evidence,
      alternatives,
      confidenceJustification,
    };
  }

  return explanations;
}

function generateEvidenceDescription(
  signal: BehavioralSignal,
  attrId: UtilityAttributeId
): string {
  const typeDescriptions: Record<BehavioralSignalType, string> = {
    'explicit-ranking': `Explicitly ranked ${attrId} as important`,
    'tradeoff-choice': `Chose option favoring ${attrId} in tradeoff scenario`,
    'career-preference': `Preferred careers high in ${attrId}`,
    'path-selection': `Selected path prioritizing ${attrId}`,
    'scenario-response': `Responded favorably to ${attrId}-rich scenarios`,
    'time-allocation': `Spent more time exploring ${attrId}-related options`,
    'risk-preference': `Willing to take risks for ${attrId}`,
    'sacrifice-willingness': `Willing to sacrifice other values for ${attrId}`,
    'exploration-pattern': `Explored more options related to ${attrId}`,
    'decision-speed': `Made quick decisions favoring ${attrId}`,
  };

  return typeDescriptions[signal.type] || `Behavior indicated preference for ${attrId}`;
}

// ============================================================================
// MAIN DISCOVERY FUNCTION
// ============================================================================

/**
 * Discover student utility profile from behavioral signals
 */
export function discoverUtilityProfile(
  studentId: string,
  signals: BehavioralSignal[],
  tradeoffResponses: TradeoffResponse[],
  scenarios: TradeoffScenario[],
  statedPreferences?: Partial<Record<UtilityAttributeId, number>>,
  evolutionHistory?: UtilityEvolutionSnapshot[],
  config: UtilityDiscoveryConfig = DEFAULT_UTILITY_DISCOVERY_CONFIG
): UtilityDiscoveryResult {
  // Step 1: Analyze tradeoff choices
  const tradeoffWeights = analyzeTradeoffChoices(tradeoffResponses, scenarios);

  // Step 2: Infer weights from other behavioral signals
  const signalWeights: Partial<Record<UtilityAttributeId, number>> = {};

  for (const signal of signals) {
    for (const attrId of signal.relevantAttributes) {
      let weight = 0;

      // Convert signal to weight inference
      switch (signal.type) {
        case 'explicit-ranking':
          if (typeof signal.observation.value === 'number') {
            weight = (6 - signal.observation.value) / 5 * 0.3; // Top rank = 0.3
          }
          break;
        case 'career-preference':
          weight = signal.observation.confidence / 100 * 0.25;
          break;
        case 'path-selection':
          weight = signal.observation.confidence / 100 * 0.25;
          break;
        case 'scenario-response':
          weight = signal.observation.confidence / 100 * 0.2;
          break;
        default:
          weight = signal.signalStrength / 100 * 0.15;
      }

      if (!signalWeights[attrId]) {
        signalWeights[attrId] = [] as unknown as number;
      }
      (signalWeights[attrId] as unknown as number[]) = [
        ...((signalWeights[attrId] as unknown as number[]) || []),
        weight,
      ];
    }
  }

  // Average signal weights
  const averagedSignalWeights: Partial<Record<UtilityAttributeId, number>> = {};
  for (const [attrId, weights] of Object.entries(signalWeights)) {
    const weightArray = weights as unknown as number[];
    averagedSignalWeights[attrId as UtilityAttributeId] =
      weightArray.reduce((sum, w) => sum + w, 0) / weightArray.length;
  }

  // Step 3: Combine all weight sources
  const combinedWeights: Record<UtilityAttributeId, number> = {} as Record<UtilityAttributeId, number>;
  const allAttrIds = new Set([
    ...Object.keys(tradeoffWeights),
    ...Object.keys(averagedSignalWeights),
    ...Object.keys(statedPreferences || {}),
  ]);

  for (const attrId of allAttrIds as Set<UtilityAttributeId>) {
    const tradeoff = tradeoffWeights[attrId] || 0;
    const signal = averagedSignalWeights[attrId] || 0;
    const stated = statedPreferences?.[attrId] || 0;

    // Weighted combination (tradeoffs most reliable, then signals, then stated)
    combinedWeights[attrId] = tradeoff * 0.5 + signal * 0.35 + stated * 0.15;
  }

  // Step 4: Normalize to sum to 1.0
  const normalizedWeights = normalizeUtilityWeights(combinedWeights);

  // Step 5: Detect value conflicts
  const conflicts = detectValueConflicts(
    statedPreferences || {},
    normalizedWeights,
    signals,
    config
  );

  // Step 6: Calculate confidences
  const weightConfidences = calculateWeightConfidences(normalizedWeights, signals, config);

  // Step 7: Calculate overall confidence
  const confidenceValues = Object.values(weightConfidences).map(wc => wc.confidence);
  const overallConfidence = confidenceValues.length > 0
    ? confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length
    : 0;

  // Step 8: Generate explanations
  const explanations = generateWeightExplanations(normalizedWeights, signals, conflicts);

  // Step 9: Create utility profile
  const profile = createUtilityProfile(studentId, normalizedWeights, {
    rankings: Object.fromEntries(
      Object.entries(normalizedWeights)
        .sort(([, a], [, b]) => b - a)
        .map(([id], index) => [id, index + 1])
    ) as Record<UtilityAttributeId, number>,
  });

  // Step 10: Validate profile
  const validation = validateUtilityProfile(
    profile,
    CORE_UTILITY_ATTRIBUTES.map(a => a.id),
    config.mautConfig
  );

  // Step 11: Track evolution (if history exists)
  let evolution: UtilityEvolutionSnapshot[] | undefined;
  if (evolutionHistory) {
    const newSnapshot = trackUtilityEvolution(
      evolutionHistory,
      normalizedWeights,
      ['utility-discovery-analysis']
    );
    evolution = [...evolutionHistory, newSnapshot];
  }

  // Step 12: Assess data quality
  const signalTypes: Record<BehavioralSignalType, number> = {
    'explicit-ranking': 0,
    'tradeoff-choice': 0,
    'career-preference': 0,
    'path-selection': 0,
    'scenario-response': 0,
    'time-allocation': 0,
    'risk-preference': 0,
    'sacrifice-willingness': 0,
    'exploration-pattern': 0,
    'decision-speed': 0,
  };

  for (const signal of signals) {
    signalTypes[signal.type]++;
  }

  const coverage: Record<UtilityAttributeId, number> = {} as Record<UtilityAttributeId, number>;
  for (const attr of CORE_UTILITY_ATTRIBUTES) {
    const attrSignals = signals.filter(s => s.relevantAttributes.includes(attr.id));
    coverage[attr.id] = Math.min(100, attrSignals.length * 15); // 7 signals = 100%
  }

  const gaps = Object.entries(coverage)
    .filter(([, cov]) => cov < 30)
    .map(([id]) => id as UtilityAttributeId);

  // Step 13: Generate recommendations
  const recommendations: string[] = [];

  if (overallConfidence < config.minConfidenceThreshold) {
    recommendations.push('Gather more behavioral data to increase confidence');
  }

  if (gaps.length > 0) {
    recommendations.push(`Focus on understanding: ${gaps.slice(0, 3).join(', ')}`);
  }

  if (conflicts.length > 0) {
    recommendations.push('Resolve value conflicts through additional targeted questions');
  }

  if (signalTypes['tradeoff-choice'] < 3) {
    recommendations.push('Complete more tradeoff scenarios for better inference');
  }

  return {
    id: `discovery-${studentId}-${Date.now()}`,
    studentId,
    timestamp: Date.now(),
    profile,
    validation,
    weightConfidences,
    overallConfidence: Math.round(overallConfidence),
    valueConflicts: conflicts,
    explanations,
    evolution,
    dataQuality: {
      totalSignals: signals.length,
      signalTypes,
      coverage,
      gaps,
    },
    recommendations,
  };
}

// ============================================================================
// UTILITY DISCOVERY ENGINE CLASS
// ============================================================================

export class UtilityDiscoveryEngineV1 {
  private config: UtilityDiscoveryConfig;
  private scenarios: TradeoffScenario[];

  constructor(config?: Partial<UtilityDiscoveryConfig>) {
    this.config = { ...DEFAULT_UTILITY_DISCOVERY_CONFIG, ...config };
    this.scenarios = generateTradeoffScenarios();
  }

  /**
   * Discover utility profile from student data
   */
  discoverProfile(
    studentId: string,
    signals: BehavioralSignal[],
    tradeoffResponses: TradeoffResponse[],
    statedPreferences?: Partial<Record<UtilityAttributeId, number>>,
    evolutionHistory?: UtilityEvolutionSnapshot[]
  ): UtilityDiscoveryResult {
    return discoverUtilityProfile(
      studentId,
      signals,
      tradeoffResponses,
      this.scenarios,
      statedPreferences,
      evolutionHistory,
      this.config
    );
  }

  /**
   * Get tradeoff scenarios
   */
  getScenarios(): TradeoffScenario[] {
    return [...this.scenarios];
  }

  /**
   * Add custom scenario
   */
  addScenario(scenario: TradeoffScenario): void {
    this.scenarios.push(scenario);
  }

  /**
   * Analyze tradeoff responses
   */
  analyzeTradeoffs(responses: TradeoffResponse[]): Partial<Record<UtilityAttributeId, number>> {
    return analyzeTradeoffChoices(responses, this.scenarios);
  }

  /**
   * Detect value conflicts
   */
  detectConflicts(
    stated: Partial<Record<UtilityAttributeId, number>>,
    revealed: Partial<Record<UtilityAttributeId, number>>,
    signals: BehavioralSignal[]
  ): ValueConflict[] {
    return detectValueConflicts(stated, revealed, signals, this.config);
  }

  /**
   * Calculate weight confidences
   */
  calculateConfidences(
    weights: Partial<Record<UtilityAttributeId, number>>,
    signals: BehavioralSignal[]
  ): Record<UtilityAttributeId, WeightConfidence> {
    return calculateWeightConfidences(weights, signals, this.config);
  }

  /**
   * Track utility evolution
   */
  trackEvolution(
    snapshots: UtilityEvolutionSnapshot[],
    newWeights: Record<UtilityAttributeId, number>,
    events: string[]
  ): UtilityEvolutionSnapshot {
    return trackUtilityEvolution(snapshots, newWeights, events);
  }

  /**
   * Generate explanations
   */
  generateExplanations(
    weights: Partial<Record<UtilityAttributeId, number>>,
    signals: BehavioralSignal[],
    conflicts: ValueConflict[]
  ): Record<UtilityAttributeId, WeightExplanation> {
    return generateWeightExplanations(weights, signals, conflicts);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<UtilityDiscoveryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): UtilityDiscoveryConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createUtilityDiscoveryEngine(
  config?: Partial<UtilityDiscoveryConfig>
): UtilityDiscoveryEngineV1 {
  return new UtilityDiscoveryEngineV1(config);
}


