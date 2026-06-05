/**
 * Identity Development Engine - Detection Algorithms
 *
 * Deterministic algorithms for detecting identity patterns.
 *
 * Design Principles:
 * - No machine learning - only transparent calculations
 * - Explainable detection logic
 * - Conservative confidence estimates
 * - Clear formulas
 */

import type {
  StudentBeliefV3,
  Strength,
  Value,
  Motivation,
  PersonalityTrait,
} from '../types/index.js';

import type {
  IdentityArchetypeId,
  IdentitySignal,
  SignalType,
  SignalSource,
  IdentityConfidence,
  IdentityConflict,
  ConflictType,
  IdentityStatus,
  IdentitySnapshot,
  IdentityTransition,
  TransitionType,
  EvolutionPattern,
  ArchetypeDefinition,
} from './types.js';

import {
  IDENTITY_ARCHETYPES,
  ARCHETYPE_DEFINITIONS,
  DEFAULT_IDENTITY_CONFIG,
} from './types.js';

// ============================================================================
// SIGNAL EXTRACTION
// ============================================================================

/**
 * Extract identity signals from student belief.
 */
export function extractSignalsFromBelief(
  belief: StudentBeliefV3,
  config = DEFAULT_IDENTITY_CONFIG
): IdentitySignal[] {
  const signals: IdentitySignal[] = [];
  const timestamp = belief.timestamp;

  // Extract signals from strengths
  for (const strength of belief.strengths) {
    if (strength.level >= config.minSignalStrength) {
      const archetypeMatches = findArchetypesForStrength(strength.name);
      for (const archetypeId of archetypeMatches) {
        signals.push({
          id: `signal_strength_${strength.id}_${archetypeId}`,
          type: 'strength-demonstration',
          archetypeId,
          strength: strength.level,
          source: strength.isSelfReported ? 'self-report' : 'behavioral-observation',
          evidence: strength.evidence,
          timestamp,
          context: {
            trigger: `Strength: ${strength.name}`,
            metadata: { category: strength.category },
          },
        });
      }
    }
  }

  // Extract signals from values
  for (const value of belief.values) {
    if (value.importance >= config.minSignalStrength) {
      const archetypeMatches = findArchetypesForValue(value.name);
      for (const archetypeId of archetypeMatches) {
        signals.push({
          id: `signal_value_${value.id}_${archetypeId}`,
          type: 'value-expression',
          archetypeId,
          strength: value.importance,
          source: 'self-report',
          evidence: value.evidence,
          timestamp,
          context: {
            trigger: `Value: ${value.name}`,
            metadata: { isNonNegotiable: value.isNonNegotiable },
          },
        });
      }
    }
  }

  // Extract signals from motivations
  for (const motivation of belief.motivations) {
    if (motivation.strength >= config.minSignalStrength) {
      const archetypeMatches = findArchetypesForMotivation(motivation.name);
      for (const archetypeId of archetypeMatches) {
        signals.push({
          id: `signal_motivation_${motivation.id}_${archetypeId}`,
          type: 'interest-expression',
          archetypeId,
          strength: motivation.strength,
          source: motivation.isExplicit ? 'self-report' : 'pattern-inference',
          evidence: motivation.evidence,
          timestamp,
          context: {
            trigger: `Motivation: ${motivation.name}`,
            metadata: { isExplicit: motivation.isExplicit },
          },
        });
      }
    }
  }

  // Extract signals from personality traits
  for (const trait of belief.personalityTraits) {
    const archetypeMatches = findArchetypesForTrait(trait.name);
    for (const archetypeId of archetypeMatches) {
      signals.push({
        id: `signal_trait_${trait.id}_${archetypeId}`,
        type: 'behavioral-demonstration',
        archetypeId,
        strength: trait.confidence * Math.abs(trait.position),
        source: 'behavioral-observation',
        evidence: trait.evidence,
        timestamp,
        context: {
          trigger: `Trait: ${trait.name} (${trait.position > 0 ? '+' : '-'}${Math.abs(trait.position).toFixed(2)})`,
          metadata: { dimension: trait.dimension },
        },
      });
    }
  }

  return signals;
}

/**
 * Find archetypes that match a strength.
 */
function findArchetypesForStrength(strengthName: string): IdentityArchetypeId[] {
  const matches: IdentityArchetypeId[] = [];
  const name = strengthName.toLowerCase();

  for (const def of ARCHETYPE_DEFINITIONS) {
    if (def.typicalStrengths.some(s => name.includes(s.toLowerCase()) || s.toLowerCase().includes(name))) {
      matches.push(def.id);
    }
  }

  return matches.length > 0 ? matches : IDENTITY_ARCHETYPES as unknown as IdentityArchetypeId[];
}

/**
 * Find archetypes that match a value.
 */
function findArchetypesForValue(valueName: string): IdentityArchetypeId[] {
  const matches: IdentityArchetypeId[] = [];
  const name = valueName.toLowerCase();

  for (const def of ARCHETYPE_DEFINITIONS) {
    if (def.typicalValues.some(v => name.includes(v.toLowerCase()) || v.toLowerCase().includes(name))) {
      matches.push(def.id);
    }
  }

  return matches;
}

/**
 * Find archetypes that match a motivation.
 */
function findArchetypesForMotivation(motivationName: string): IdentityArchetypeId[] {
  const matches: IdentityArchetypeId[] = [];
  const name = motivationName.toLowerCase();

  for (const def of ARCHETYPE_DEFINITIONS) {
    if (def.typicalInterests.some(i => name.includes(i.toLowerCase()) || i.toLowerCase().includes(name))) {
      matches.push(def.id);
    }
  }

  return matches;
}

/**
 * Find archetypes that match a personality trait.
 */
function findArchetypesForTrait(traitName: string): IdentityArchetypeId[] {
  const matches: IdentityArchetypeId[] = [];
  const name = traitName.toLowerCase();

  for (const def of ARCHETYPE_DEFINITIONS) {
    if (def.coreTraits.some(t => name.includes(t.toLowerCase()) || t.toLowerCase().includes(name))) {
      matches.push(def.id);
    }
  }

  return matches;
}

// ============================================================================
// ARCHETYPE SCORING
// ============================================================================

/**
 * Calculate archetype scores from signals.
 */
export function calculateArchetypeScores(
  signals: IdentitySignal[],
  config = DEFAULT_IDENTITY_CONFIG
): Record<IdentityArchetypeId, number> {
  const scores: Record<string, number> = {};
  const weights: Record<string, number> = {};

  // Initialize all archetypes
  for (const archetype of IDENTITY_ARCHETYPES) {
    scores[archetype] = 0;
    weights[archetype] = 0;
  }

  // Aggregate signals
  for (const signal of signals) {
    const sourceWeight = getSourceWeight(signal.source, config);
    const typeWeight = getTypeWeight(signal.type);
    const weightedStrength = signal.strength * sourceWeight * typeWeight;

    scores[signal.archetypeId] += weightedStrength;
    weights[signal.archetypeId] += sourceWeight * typeWeight;
  }

  // Normalize scores
  const normalized: Record<IdentityArchetypeId, number> = {} as Record<IdentityArchetypeId, number>;
  for (const archetype of IDENTITY_ARCHETYPES) {
    const archetypeId = archetype as IdentityArchetypeId;
    normalized[archetypeId] = weights[archetypeId] > 0
      ? Math.min(1, scores[archetypeId] / (weights[archetypeId] * 0.7))
      : 0;
  }

  return normalized;
}

/**
 * Get weight for signal source.
 */
function getSourceWeight(
  source: SignalSource,
  config: typeof DEFAULT_IDENTITY_CONFIG
): number {
  switch (source) {
    case 'self-report': return config.selfReportWeight;
    case 'behavioral-observation': return config.behavioralWeight;
    case 'assessment-response': return 0.75;
    case 'project-evidence': return 0.9;
    case 'third-party-feedback': return 0.8;
    case 'pattern-inference': return 0.6;
    default: return 0.5;
  }
}

/**
 * Get weight for signal type.
 */
function getTypeWeight(type: SignalType): number {
  switch (type) {
    case 'achievement-indicator': return 1.0;
    case 'behavioral-demonstration': return 0.9;
    case 'strength-demonstration': return 0.85;
    case 'preference-revelation': return 0.8;
    case 'value-expression': return 0.8;
    case 'aspiration-statement': return 0.7;
    case 'interest-expression': return 0.75;
    case 'feedback-confirmation': return 0.85;
    default: return 0.5;
  }
}

// ============================================================================
// IDENTITY CONFIDENCE
// ============================================================================

/**
 * Calculate confidence for each archetype.
 */
export function calculateIdentityConfidence(
  signals: IdentitySignal[],
  archetypeId: IdentityArchetypeId
): IdentityConfidence {
  const archetypeSignals = signals.filter(s => s.archetypeId === archetypeId);
  
  if (archetypeSignals.length === 0) {
    return {
      archetypeId,
      score: 0.1,
      bySignalType: {},
      signalCount: 0,
      signalStrengths: [],
      explanation: `No signals detected for ${archetypeId}`,
    };
  }

  // Calculate by signal type
  const bySignalType: Partial<Record<SignalType, number>> = {};
  for (const type of ['interest-expression', 'behavioral-demonstration', 'strength-demonstration', 'value-expression'] as SignalType[]) {
    const typeSignals = archetypeSignals.filter(s => s.type === type);
    if (typeSignals.length > 0) {
      const avgStrength = typeSignals.reduce((sum, s) => sum + s.strength, 0) / typeSignals.length;
      bySignalType[type] = avgStrength;
    }
  }

  // Signal diversity bonus
  const uniqueTypes = new Set(archetypeSignals.map(s => s.type)).size;
  const diversityBonus = Math.min(0.2, uniqueTypes * 0.05);

  // Signal count confidence (more signals = higher confidence, with diminishing returns)
  const countConfidence = Math.min(0.9, 0.3 + archetypeSignals.length * 0.1);

  // Average signal strength
  const avgStrength = archetypeSignals.reduce((sum, s) => sum + s.strength, 0) / archetypeSignals.length;
  
  // Combined confidence
  const score = Math.min(0.95, (countConfidence * 0.4 + avgStrength * 0.4 + diversityBonus * 2));

  return {
    archetypeId,
    score,
    bySignalType,
    signalCount: archetypeSignals.length,
    signalStrengths: archetypeSignals.map(s => s.strength),
    explanation: generateConfidenceExplanation(archetypeId, archetypeSignals.length, avgStrength, uniqueTypes),
  };
}

/**
 * Generate confidence explanation.
 */
function generateConfidenceExplanation(
  archetypeId: IdentityArchetypeId,
  signalCount: number,
  avgStrength: number,
  uniqueTypes: number
): string {
  let explanation = `${archetypeId}: ${signalCount} signals, avg strength ${avgStrength.toFixed(2)}`;
  
  if (uniqueTypes >= 3) {
    explanation += ', strong diversity of evidence';
  } else if (uniqueTypes >= 2) {
    explanation += ', moderate evidence diversity';
  } else {
    explanation += ', limited evidence diversity';
  }

  return explanation;
}

// ============================================================================
// IDENTITY STATUS DETERMINATION
// ============================================================================

/**
 * Determine identity status from scores and history.
 */
export function determineIdentityStatus(
  scores: Record<IdentityArchetypeId, number>,
  previousProfile?: { status: IdentityStatus; archetypeScores: Record<IdentityArchetypeId, number> },
  config = DEFAULT_IDENTITY_CONFIG
): IdentityStatus {
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id: id as IdentityArchetypeId, score }));

  const topScore = sortedScores[0]?.score ?? 0;
  const secondScore = sortedScores[1]?.score ?? 0;
  const gap = topScore - secondScore;

  // Check for conflict (multiple high scores)
  const highScoring = sortedScores.filter(s => s.score >= config.primaryIdentityThreshold);
  if (highScoring.length >= 2 && highScoring[0].score - highScoring[1].score < 0.15) {
    return 'conflicted';
  }

  // Check for emerging (moderate score, growing from previous)
  if (topScore >= 0.4 && topScore < config.primaryIdentityThreshold) {
    if (previousProfile && topScore > (previousProfile.archetypeScores[sortedScores[0].id] ?? 0)) {
      return 'emerging';
    }
    return 'developing';
  }

  // Check for stable (high score with clear gap)
  if (topScore >= config.primaryIdentityThreshold && gap > 0.15) {
    return 'stable';
  }

  // Check for transitioning (score changing from previous dominant)
  if (previousProfile?.status === 'stable' && previousProfile.archetypeScores) {
    const prevTop = Object.entries(previousProfile.archetypeScores)
      .sort((a, b) => b[1] - a[1])[0];
    if (prevTop && prevTop[0] !== sortedScores[0].id && topScore > 0.5) {
      return 'transitioning';
    }
  }

  // Check for complex (multiple moderate scores)
  const moderateScoring = sortedScores.filter(s => s.score >= 0.35).length;
  if (moderateScoring >= 3) {
    return 'complex';
  }

  // Check for unclear (low scores overall)
  if (topScore < 0.3) {
    return 'unclear';
  }

  return 'developing';
}

// ============================================================================
// CONFLICT DETECTION
// ============================================================================

/**
 * Detect conflicts between identities.
 */
export function detectConflicts(
  scores: Record<IdentityArchetypeId, number>,
  signals: IdentitySignal[],
  config = DEFAULT_IDENTITY_CONFIG
): IdentityConflict[] {
  const conflicts: IdentityConflict[] = [];
  const archetypeIds = Object.keys(scores).filter(
    id => scores[id as IdentityArchetypeId] >= config.secondaryIdentityThreshold
  ) as IdentityArchetypeId[];

  // Check all pairs
  for (let i = 0; i < archetypeIds.length; i++) {
    for (let j = i + 1; j < archetypeIds.length; j++) {
      const idA = archetypeIds[i];
      const idB = archetypeIds[j];
      
      const conflict = analyzeConflict(idA, idB, scores, signals);
      if (conflict && conflict.severity >= config.conflictThreshold) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts.sort((a, b) => b.severity - a.severity);
}

/**
 * Analyze potential conflict between two archetypes.
 */
function analyzeConflict(
  idA: IdentityArchetypeId,
  idB: IdentityArchetypeId,
  scores: Record<IdentityArchetypeId, number>,
  signals: IdentitySignal[]
): IdentityConflict | null {
  const defA = ARCHETYPE_DEFINITIONS.find(d => d.id === idA);
  const defB = ARCHETYPE_DEFINITIONS.find(d => d.id === idB);

  if (!defA || !defB) return null;

  // Calculate conflict severity based on scores and inherent tensions
  const scoreA = scores[idA];
  const scoreB = scores[idB];
  const combinedStrength = (scoreA + scoreB) / 2;

  // Check for inherent value conflicts
  const valueOverlap = defA.typicalValues.filter(v => defB.typicalValues.includes(v));
  const valueConflict = defA.typicalValues.filter(v => 
    defB.typicalValues.some(w => areConflictingValues(v, w))
  );

  // Calculate severity
  let severity = combinedStrength * 0.5;
  
  if (valueConflict.length > 0) severity += 0.2;
  if (valueOverlap.length === 0) severity += 0.15;

  // Check for behavioral tension
  const behavioralTension = detectBehavioralTension(defA, defB, signals);
  severity += behavioralTension * 0.3;

  if (severity < 0.3) return null;

  // Determine conflict type
  let type: ConflictType = 'value-conflict';
  if (behavioralTension > 0.5) type = 'behavioral-tension';
  else if (valueConflict.length > 0) type = 'value-conflict';
  else if (valueOverlap.length === 0) type = 'path-divergence';

  return {
    id: `conflict_${idA}_${idB}_${Date.now()}`,
    identityA: idA,
    identityB: idB,
    type,
    severity: Math.min(1, severity),
    description: `Tension between ${idA} and ${idB} identities`,
    tensionAreas: valueConflict.length > 0 ? valueConflict : ['different core values', 'different approaches'],
    resolutionStrategies: generateResolutionStrategies(idA, idB, type),
  };
}

/**
 * Check if two values are conflicting.
 */
function areConflictingValues(v1: string, v2: string): boolean {
  const conflicts: Record<string, string[]> = {
    'freedom': ['stability', 'familyApproval'],
    'stability': ['freedom', 'optionality'],
    'optionality': ['mastery', 'stability'],
    'mastery': ['optionality'],
    'income': ['meaning', 'socialImpact'],
    'socialImpact': ['income', 'wealthPotential'],
  };

  return conflicts[v1]?.includes(v2) || conflicts[v2]?.includes(v1) || false;
}

/**
 * Detect behavioral tension between archetypes.
 */
function detectBehavioralTension(
  defA: ArchetypeDefinition,
  defB: ArchetypeDefinition,
  signals: IdentitySignal[]
): number {
  // Analyze signal patterns for tension
  const signalsA = signals.filter(s => s.archetypeId === defA.id);
  const signalsB = signals.filter(s => s.archetypeId === defB.id);

  // Check for contradictory signal types
  let tension = 0;

  // Different sources can indicate tension
  const sourcesA = new Set(signalsA.map(s => s.source));
  const sourcesB = new Set(signalsB.map(s => s.source));
  
  // If one is mostly self-reported and other behavioral, possible tension
  if (sourcesA.has('self-report') && !sourcesA.has('behavioral-observation') &&
      sourcesB.has('behavioral-observation') && !sourcesB.has('self-report')) {
    tension += 0.3;
  }

  return Math.min(1, tension);
}

/**
 * Generate resolution strategies for conflict.
 */
function generateResolutionStrategies(
  idA: IdentityArchetypeId,
  idB: IdentityArchetypeId,
  type: ConflictType
): string[] {
  const strategies: string[] = [];

  strategies.push(`Explore careers that blend ${idA} and ${idB} strengths`);
  strategies.push(`Consider which identity is more authentic vs aspirational`);

  if (type === 'value-conflict') {
    strategies.push('Identify which values are truly core vs inherited');
  }

  if (type === 'behavioral-tension') {
    strategies.push('Experiment with behaviors from both identities in low-stakes contexts');
  }

  strategies.push(`Seek role models who successfully integrate ${idA} and ${idB}`);

  return strategies;
}

// ============================================================================
// EVOLUTION TRACKING
// ============================================================================

/**
 * Detect transitions between identity snapshots.
 */
export function detectTransitions(
  snapshots: IdentitySnapshot[]
): IdentityTransition[] {
  if (snapshots.length < 2) return [];

  const transitions: IdentityTransition[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    const prevTop = getTopArchetype(prev.archetypeScores);
    const currTop = getTopArchetype(curr.archetypeScores);

    if (prevTop && currTop && prevTop !== currTop) {
      // Primary identity changed
      const magnitude = Math.abs(curr.archetypeScores[currTop] - prev.archetypeScores[prevTop]);
      
      transitions.push({
        id: `transition_${i}_${Date.now()}`,
        timestamp: curr.timestamp,
        fromIdentity: prevTop,
        toIdentity: currTop,
        type: 'shift',
        magnitude,
        description: `Primary identity shifted from ${prevTop} to ${currTop}`,
      });
    } else if (prevTop && currTop && prevTop === currTop) {
      // Same primary but check for consolidation
      const scoreChange = curr.archetypeScores[currTop] - prev.archetypeScores[currTop];
      
      if (scoreChange > 0.2) {
        transitions.push({
          id: `transition_consolidation_${i}_${Date.now()}`,
          timestamp: curr.timestamp,
          fromIdentity: prevTop,
          toIdentity: currTop,
          type: 'consolidation',
          magnitude: scoreChange,
          description: `${currTop} identity consolidated (strength +${scoreChange.toFixed(2)})`,
        });
      }
    }

    // Check for emergence (new high-scoring identity)
    for (const [archetypeId, score] of Object.entries(curr.archetypeScores)) {
      const prevScore = prev.archetypeScores[archetypeId as IdentityArchetypeId];
      if (score >= 0.6 && prevScore < 0.4 && score - prevScore > 0.25) {
        // Check if not already recorded as primary shift
        const alreadyRecorded = transitions.some(t => 
          t.timestamp === curr.timestamp && (t.toIdentity === archetypeId || t.fromIdentity === archetypeId)
        );
        
        if (!alreadyRecorded) {
          transitions.push({
            id: `transition_emergence_${archetypeId}_${i}_${Date.now()}`,
            timestamp: curr.timestamp,
            toIdentity: archetypeId as IdentityArchetypeId,
            type: 'emergence',
            magnitude: score - prevScore,
            description: `${archetypeId} identity emerging`,
          });
        }
      }
    }
  }

  return transitions.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get top archetype from scores.
 */
function getTopArchetype(scores: Record<IdentityArchetypeId, number>): IdentityArchetypeId | undefined {
  const entries = Object.entries(scores);
  if (entries.length === 0) return undefined;
  
  return entries.sort((a, b) => b[1] - a[1])[0][0] as IdentityArchetypeId;
}

/**
 * Determine evolution pattern from snapshots.
 */
export function determineEvolutionPattern(
  snapshots: IdentitySnapshot[]
): EvolutionPattern {
  if (snapshots.length < 3) return 'stable-consistent';

  const primaryHistory = snapshots.map(s => getTopArchetype(s.archetypeScores));
  const uniquePrimaries = new Set(primaryHistory.filter(Boolean)).size;

  // Check for frequent changes
  let changes = 0;
  for (let i = 1; i < primaryHistory.length; i++) {
    if (primaryHistory[i] !== primaryHistory[i - 1]) changes++;
  }

  const changeRate = changes / (primaryHistory.length - 1);

  if (changeRate > 0.5) return 'volatile-shifting';
  if (uniquePrimaries === 1) return 'stable-consistent';
  if (uniquePrimaries === 2) return 'linear-progression';
  
  // Check for revisiting
  const firstPrimary = primaryHistory[0];
  const lastPrimary = primaryHistory[primaryHistory.length - 1];
  if (firstPrimary === lastPrimary && changes > 1) return 'cyclical-exploration';

  // Check for expanding
  if (uniquePrimaries > 2 && changeRate < 0.3) return 'divergent-branching';

  // Check for focusing
  if (uniquePrimaries >= 2 && lastPrimary && 
      snapshots[snapshots.length - 1].archetypeScores[lastPrimary] > 0.7) {
    return 'convergent-focusing';
  }

  return 'stable-consistent';
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate insights from identity analysis.
 */
export function generateInsights(
  scores: Record<IdentityArchetypeId, number>,
  status: IdentityStatus,
  signals: IdentitySignal[],
  conflicts: IdentityConflict[]
): import('./types.js').IdentityInsight[] {
  const insights: import('./types.js').IdentityInsight[] = [];

  // Emerging identity insight
  if (status === 'emerging') {
    const emerging = getTopArchetype(scores);
    if (emerging) {
      insights.push({
        id: `insight_emerging_${Date.now()}`,
        type: 'emerging-identity',
        description: `${emerging} identity is emerging based on accumulating evidence`,
        relatedArchetypes: [emerging],
        confidence: scores[emerging],
        evidence: signals.filter(s => s.archetypeId === emerging).map(s => s.context.trigger || s.type),
      });
    }
  }

  // Stable identity insight
  if (status === 'stable') {
    const stable = getTopArchetype(scores);
    if (stable) {
      insights.push({
        id: `insight_stable_${Date.now()}`,
        type: 'stable-identity',
        description: `${stable} identity is well-established with consistent strong signals`,
        relatedArchetypes: [stable],
        confidence: scores[stable],
        evidence: ['Consistent pattern across multiple assessments'],
      });
    }
  }

  // Conflicted identities insight
  if (status === 'conflicted' && conflicts.length > 0) {
    insights.push({
      id: `insight_conflicted_${Date.now()}`,
      type: 'conflicted-identities',
      description: `Multiple strong identities detected with potential conflicts: ${conflicts.map(c => `${c.identityA}/${c.identityB}`).join(', ')}`,
      relatedArchetypes: conflicts.flatMap(c => [c.identityA, c.identityB]),
      confidence: 0.8,
      evidence: conflicts.map(c => c.description),
    });
  }

  // Strength alignment insight
  const topArchetype = getTopArchetype(scores);
  if (topArchetype) {
    const def = ARCHETYPE_DEFINITIONS.find(d => d.id === topArchetype);
    const strengthSignals = signals.filter(s => 
      s.archetypeId === topArchetype && s.type === 'strength-demonstration'
    );
    
    if (strengthSignals.length >= 2) {
      insights.push({
        id: `insight_strength_alignment_${Date.now()}`,
        type: 'strength-alignment',
        description: `Demonstrated strengths align well with ${topArchetype} identity`,
        relatedArchetypes: [topArchetype],
        confidence: Math.min(0.9, 0.6 + strengthSignals.length * 0.1),
        evidence: strengthSignals.map(s => s.context.trigger || 'strength demonstrated'),
      });
    }
  }

  return insights;
}
