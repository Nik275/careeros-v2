/**
 * Adaptive Mentor Foundation - Analysis Algorithms
 *
 * Deterministic algorithms for generating mentor guidance.
 *
 * Design Principles:
 * - No LLM integration - foundation layer only
 * - Pattern-based insights from longitudinal data
 * - Explainable logic
 * - Historical contrast detection
 */

import type {
  StudentBeliefV3,
} from '../types/index.js';

import type {
  LongitudinalAnalysis,
  TimelineEvent,
} from '../longitudinal-intelligence-engine/types.js';

import type {
  ValueEvolutionAnalysis,
  ValueEvolution,
} from '../value-evolution-engine/types.js';

import type {
  IdentityProfile,
} from '../identity-development-engine/types.js';

import type {
  PersonalGrowthAnalysis,
} from '../personal-growth-engine/types.js';

import type {
  MentorContext,
  StudentStateSnapshot,
  HistoricalPatterns,
  StateContrast,
  ContrastType,
  ActiveConsideration,
  ConsiderationCategory,
  GuidancePriority,
  MentorInsight,
  MentorInsightType,
  GrowthObservation,
  GrowthObservationType,
  DecisionWarning,
  DecisionWarningType,
  MentorFoundationInput,
  MentorFoundationOptions,
  MentorFoundationConfig,
} from './types.js';

import {
  DEFAULT_MENTOR_FOUNDATION_CONFIG,
} from './types.js';

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build mentor context from all inputs.
 */
export function buildMentorContext(
  studentId: string,
  belief: StudentBeliefV3,
  longitudinalAnalysis?: LongitudinalAnalysis,
  valueEvolution?: ValueEvolutionAnalysis,
  identityProfile?: IdentityProfile,
  growthAnalysis?: PersonalGrowthAnalysis,
  recentOutcomes: Array<{
    timestamp: number;
    type: string;
    satisfaction: number;
    valueAlignment: number;
  }> = [],
  config = DEFAULT_MENTOR_FOUNDATION_CONFIG
): MentorContext {
  const generatedAt = Date.now();

  // Build current state snapshot
  const currentState = buildCurrentStateSnapshot(
    belief,
    identityProfile,
    growthAnalysis,
    longitudinalAnalysis
  );

  // Build historical patterns
  const historicalPatterns = buildHistoricalPatterns(
    longitudinalAnalysis,
    valueEvolution,
    recentOutcomes,
    config
  );

  // Detect contrasts
  const contrasts = detectContrasts(
    currentState,
    historicalPatterns,
    config
  );

  // Build active considerations
  const considerations = buildActiveConsiderations(
    contrasts,
    longitudinalAnalysis,
    growthAnalysis
  );

  // Build guidance priorities
  const priorities = buildGuidancePriorities(
    considerations,
    contrasts,
    growthAnalysis
  );

  return {
    id: `context_${studentId}_${generatedAt}`,
    studentId,
    generatedAt,
    currentState,
    historicalPatterns,
    contrasts,
    considerations,
    priorities,
  };
}

/**
 * Build current state snapshot.
 */
function buildCurrentStateSnapshot(
  belief: StudentBeliefV3,
  identityProfile?: IdentityProfile,
  growthAnalysis?: PersonalGrowthAnalysis,
  longitudinalAnalysis?: LongitudinalAnalysis
): StudentStateSnapshot {
  // Extract top values from belief
  const topValues = belief.values
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map(v => ({
      valueId: v.id,
      valueName: v.name,
      priority: v.importance,
    }));

  // Extract growth levels
  const growthLevels: Record<string, number> = {};
  if (growthAnalysis) {
    for (const [dim, state] of Object.entries(growthAnalysis.currentState.dimensions)) {
      growthLevels[dim] = state.currentLevel;
    }
  }

  // Extract recent decisions
  const recentDecisions = longitudinalAnalysis?.timeline.events
    .filter(e => e.type === 'decision')
    .slice(-5)
    .map(e => ({
      decisionId: e.id,
      timestamp: e.timestamp,
      type: (e as unknown as { data: { decisionType: string } }).data?.decisionType || 'unknown',
      confidence: (e as unknown as { data: { confidence: number } }).data?.confidence || 0.5,
    })) ?? [];

  return {
    timestamp: belief.timestamp,
    primaryIdentity: identityProfile?.primaryIdentity,
    identityConfidence: identityProfile?.overallConfidence ?? 0.5,
    topValues,
    growthLevels,
    recentDecisions,
    activeConstraints: belief.constraints.map(c => c.name),
    activeGoals: belief.motivations.map(m => m.name),
  };
}

/**
 * Build historical patterns.
 */
function buildHistoricalPatterns(
  longitudinalAnalysis?: LongitudinalAnalysis,
  valueEvolution?: ValueEvolutionAnalysis,
  recentOutcomes: Array<{
    timestamp: number;
    type: string;
    satisfaction: number;
    valueAlignment: number;
  }> = [],
  config = DEFAULT_MENTOR_FOUNDATION_CONFIG
): HistoricalPatterns {
  // Calculate consistent values
  const consistentValues: HistoricalPatterns['consistentValues'] = [];
  if (valueEvolution?.evolutions) {
    for (const [valueId, evolution] of Object.entries(valueEvolution.evolutions) as Array<[string, ValueEvolution]>) {
      if (evolution.pattern === 'stable' && evolution.confidence > 0.6) {
        consistentValues.push({
          valueId,
          valueName: valueId,
          averagePriority: evolution.currentValue,
          stability: 0.8, // Default stability for stable-consistent patterns
        });
      }
    }
  }

  // Calculate high satisfaction values
  const highSatisfactionValues: HistoricalPatterns['highSatisfactionValues'] = [];
  if (recentOutcomes.length > 0) {
    // Group outcomes by value alignment and find highest satisfaction
    const valueSatisfaction = new Map<string, number[]>();
    for (const outcome of recentOutcomes) {
      if (!valueSatisfaction.has(outcome.type)) {
        valueSatisfaction.set(outcome.type, []);
      }
      valueSatisfaction.get(outcome.type)!.push(outcome.satisfaction);
    }
    for (const [type, satisfactions] of valueSatisfaction) {
      const avg = satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length;
      if (avg > 0.7) {
        highSatisfactionValues.push({
          valueId: type,
          valueName: type,
          correlationScore: avg,
        });
      }
    }
  }

  // Build identity path
  const identityPath: HistoricalPatterns['identityPath'] = [];
  if (longitudinalAnalysis?.transitions) {
    for (const transition of longitudinalAnalysis.transitions) {
      if (transition.afterState.primaryIdentity) {
        identityPath.push({
          timestamp: transition.startedAt,
          identity: transition.afterState.primaryIdentity,
          duration: transition.durationMs,
        });
      }
    }
  }

  // Extract decision pattern
  const decisionPattern: HistoricalPatterns['decisionPattern'] = {
    dominantPattern: longitudinalAnalysis?.decisionPatterns[0]?.type || 'balanced',
    confidence: longitudinalAnalysis?.decisionPatterns[0]?.confidence ?? 0.5,
    avgDecisionTime: longitudinalAnalysis?.decisionPatterns[0]?.statistics.avgDecisionTime ?? 7,
    reversalRate: longitudinalAnalysis?.decisionPatterns[0]?.statistics.reversalRate ?? 0.1,
  };

  // Determine growth trajectory
  const growthTrajectory: HistoricalPatterns['growthTrajectory'] = 'steady';

  // Calculate history span
  const historySpanMs = longitudinalAnalysis?.timeRange.durationMs ?? 0;

  return {
    consistentValues,
    highSatisfactionValues,
    identityPath,
    decisionPattern,
    growthTrajectory,
    historySpanMs,
  };
}

// ============================================================================
// CONTRAST DETECTION
// ============================================================================

/**
 * Detect contrasts between current and historical state.
 */
function detectContrasts(
  currentState: StudentStateSnapshot,
  historicalPatterns: HistoricalPatterns,
  config = DEFAULT_MENTOR_FOUNDATION_CONFIG
): StateContrast[] {
  const contrasts: StateContrast[] = [];
  const now = Date.now();

  // Check for value shifts
  for (const currentValue of currentState.topValues.slice(0, 3)) {
    const historicalMatch = historicalPatterns.consistentValues.find(
      v => v.valueId === currentValue.valueId
    );
    if (historicalMatch) {
      const magnitude = Math.abs(currentValue.priority - historicalMatch.averagePriority);
      if (magnitude > config.contrastThreshold) {
        contrasts.push({
          id: `contrast_value_${currentValue.valueId}_${now}`,
          type: 'value_shift',
          aspect: currentValue.valueName,
          current: {
            value: (currentValue.priority * 100).toFixed(0) + '%',
            timestamp: currentState.timestamp,
          },
          historical: {
            value: (historicalMatch.averagePriority * 100).toFixed(0) + '%',
            timestamp: now - historicalPatterns.historySpanMs,
            context: `historical average (stability: ${(historicalMatch.stability * 100).toFixed(0)}%)`,
          },
          magnitude,
          isConcerning: magnitude > 0.4,
          reflectionPrompt: `Your ${currentValue.valueName} priority has ${currentValue.priority > historicalMatch.averagePriority ? 'increased' : 'decreased'} significantly. Consider whether this shift reflects a genuine change or temporary circumstances.`,
        });
      }
    }
  }

  // Check for satisfaction gap (example from user request)
  if (historicalPatterns.highSatisfactionValues.length > 0) {
    const topSatisfactionValue = historicalPatterns.highSatisfactionValues[0];
    const currentPriority = currentState.topValues.find(v => v.valueId === topSatisfactionValue.valueId)?.priority ?? 0;
    
    if (currentPriority < 0.5 && topSatisfactionValue.correlationScore > 0.7) {
      contrasts.push({
        id: `contrast_satisfaction_${now}`,
        type: 'satisfaction_gap',
        aspect: topSatisfactionValue.valueName,
        current: {
          value: (currentPriority * 100).toFixed(0) + '%',
          timestamp: currentState.timestamp,
        },
        historical: {
          value: (topSatisfactionValue.correlationScore * 100).toFixed(0) + '%',
          timestamp: now - historicalPatterns.historySpanMs,
          context: 'historically highest satisfaction',
        },
        magnitude: topSatisfactionValue.correlationScore - currentPriority,
        isConcerning: true,
        reflectionPrompt: `Historically, your strongest satisfaction came from ${topSatisfactionValue.valueName}. Your current top priorities don't include this. Consider whether your current preference is temporary.`,
      });
    }
  }

  // Check for identity drift
  if (historicalPatterns.identityPath.length > 0 && currentState.primaryIdentity) {
    const lastIdentity = historicalPatterns.identityPath[historicalPatterns.identityPath.length - 1];
    if (lastIdentity.identity !== currentState.primaryIdentity) {
      contrasts.push({
        id: `contrast_identity_${now}`,
        type: 'identity_drift',
        aspect: 'Identity',
        current: {
          value: currentState.primaryIdentity,
          timestamp: currentState.timestamp,
        },
        historical: {
          value: lastIdentity.identity,
          timestamp: lastIdentity.timestamp,
          context: `held for ${(lastIdentity.duration / (24 * 60 * 60 * 1000)).toFixed(0)} days`,
        },
        magnitude: 0.5,
        isConcerning: false,
        reflectionPrompt: `Your identity has shifted from ${lastIdentity.identity} to ${currentState.primaryIdentity}. This is natural during exploration periods.`,
      });
    }
  }

  return contrasts.sort((a, b) => b.magnitude - a.magnitude);
}

// ============================================================================
// ACTIVE CONSIDERATIONS
// ============================================================================

/**
 * Build active considerations from analysis.
 */
function buildActiveConsiderations(
  contrasts: StateContrast[],
  longitudinalAnalysis?: LongitudinalAnalysis,
  growthAnalysis?: PersonalGrowthAnalysis
): ActiveConsideration[] {
  const considerations: ActiveConsideration[] = [];
  const now = Date.now();

  // Value clarity consideration
  const valueContrasts = contrasts.filter(c => c.type === 'value_shift');
  if (valueContrasts.length > 0) {
    considerations.push({
      id: `consideration_values_${now}`,
      category: 'value_clarity',
      priority: valueContrasts[0].isConcerning ? 'high' : 'medium',
      description: 'Value priorities have shifted significantly from historical patterns',
      evidence: valueContrasts.map(c => `${c.aspect}: ${c.current.value} vs ${c.historical.value}`),
      suggestedAction: 'Reflect on whether current priorities align with long-term satisfaction',
      confidence: 0.75,
    });
  }

  // Satisfaction gap consideration
  const satisfactionGap = contrasts.find(c => c.type === 'satisfaction_gap');
  if (satisfactionGap) {
    considerations.push({
      id: `consideration_satisfaction_${now}`,
      category: 'value_clarity',
      priority: 'high',
      description: 'Current priorities may not align with historically satisfying pursuits',
      evidence: [satisfactionGap.reflectionPrompt],
      suggestedAction: 'Consider experimenting with activities that historically brought satisfaction',
      confidence: 0.8,
    });
  }

  // Growth consideration
  if (growthAnalysis?.insights.some(i => i.type === 'rapid-growth-detected')) {
    considerations.push({
      id: `consideration_growth_${now}`,
      category: 'growth_opportunity',
      priority: 'medium',
      description: 'Rapid growth detected in one or more dimensions',
      evidence: growthAnalysis.insights
        .filter(i => i.type === 'rapid-growth-detected')
        .map(i => i.description),
      suggestedAction: 'Maintain momentum while watching for burnout signs',
      confidence: 0.7,
    });
  }

  // Decision pattern consideration
  if (longitudinalAnalysis?.decisionPatterns.some(p => p.type === 'avoidant')) {
    considerations.push({
      id: `consideration_decisions_${now}`,
      category: 'decision_quality',
      priority: 'high',
      description: 'Decision pattern shows tendency to delay or avoid decisions',
      evidence: ['Low decision confidence and extended decision times detected'],
      suggestedAction: 'Set specific deadlines and break complex decisions into smaller steps',
      confidence: 0.75,
    });
  }

  return considerations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// GUIDANCE PRIORITIES
// ============================================================================

/**
 * Build guidance priorities.
 */
function buildGuidancePriorities(
  considerations: ActiveConsideration[],
  contrasts: StateContrast[],
  growthAnalysis?: PersonalGrowthAnalysis
): GuidancePriority[] {
  const priorities: GuidancePriority[] = [];
  const now = Date.now();

  let rank = 1;

  // Priority 1: Value alignment if there's a satisfaction gap
  const satisfactionGap = contrasts.find(c => c.type === 'satisfaction_gap');
  if (satisfactionGap) {
    priorities.push({
      id: `priority_${rank}`,
      area: 'Value Alignment',
      rank: rank++,
      rationale: 'Historical data shows strongest satisfaction from different values than currently prioritized',
      suggestedFocus: 'Help student explore the disconnect between current priorities and historical satisfaction',
      expectedOutcome: 'Student gains clarity on whether current preferences are temporary or genuine',
    });
  }

  // Priority 2: Identity exploration if identity is in flux
  const identityContrast = contrasts.find(c => c.type === 'identity_drift');
  if (identityContrast) {
    priorities.push({
      id: `priority_${rank}`,
      area: 'Identity Exploration',
      rank: rank++,
      rationale: 'Identity has recently shifted, suggesting active exploration',
      suggestedFocus: 'Support identity consolidation or continued exploration as appropriate',
      expectedOutcome: 'Student gains confidence in their emerging identity',
    });
  }

  // Priority 3: Growth support if in acceleration phase
  if (growthAnalysis?.trajectory.overallShape === 'accelerating') {
    priorities.push({
      id: `priority_${rank}`,
      area: 'Growth Support',
      rank: rank++,
      rationale: 'Growth trajectory is accelerating - critical development period',
      suggestedFocus: 'Provide resources and encouragement while monitoring for sustainability',
      expectedOutcome: 'Student maintains growth momentum without burnout',
    });
  }

  // Priority 4: Decision support if needed
  const decisionConsideration = considerations.find(c => c.category === 'decision_quality');
  if (decisionConsideration) {
    priorities.push({
      id: `priority_${rank}`,
      area: 'Decision Support',
      rank: rank++,
      rationale: 'Decision patterns suggest need for support',
      suggestedFocus: decisionConsideration.suggestedAction || 'Provide structured decision-making support',
      expectedOutcome: 'Student makes decisions with appropriate confidence',
    });
  }

  return priorities;
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate mentor insights.
 */
export function generateInsights(
  context: MentorContext,
  longitudinalAnalysis?: LongitudinalAnalysis,
  config = DEFAULT_MENTOR_FOUNDATION_CONFIG
): MentorInsight[] {
  const insights: MentorInsight[] = [];
  const now = Date.now();

  // Historical contrast insights
  for (const contrast of context.contrasts) {
    if (contrast.magnitude > config.contrastThreshold) {
      insights.push({
        id: `insight_contrast_${contrast.id}_${now}`,
        type: 'historical_contrast',
        title: `${contrast.aspect} Contrast Detected`,
        description: contrast.reflectionPrompt,
        longitudinalBasis: {
          pattern: `${contrast.type} with magnitude ${(contrast.magnitude * 100).toFixed(0)}%`,
          evidence: [`Current: ${contrast.current.value}`, `Historical: ${contrast.historical.value} (${contrast.historical.context})`],
          confidence: 0.75,
        },
        relevance: {
          score: contrast.magnitude,
          reason: 'Direct relevance to current state',
        },
        suggestedResponse: `Acknowledge the shift and invite reflection: "${contrast.reflectionPrompt}"`,
        priority: contrast.isConcerning ? 'immediate' : 'opportunistic',
      });
    }
  }

  // Pattern recognition insights
  if (longitudinalAnalysis?.decisionPatterns && longitudinalAnalysis.decisionPatterns.length > 0) {
    const dominantPattern = longitudinalAnalysis.decisionPatterns[0];
    insights.push({
      id: `insight_pattern_${now}`,
      type: 'pattern_recognition',
      title: `Decision Pattern: ${dominantPattern.type}`,
      description: dominantPattern.description,
      longitudinalBasis: {
        pattern: dominantPattern.type,
        evidence: dominantPattern.evidence,
        confidence: dominantPattern.confidence,
      },
      relevance: {
        score: dominantPattern.confidence,
        reason: 'Affects future decision quality',
      },
      suggestedResponse: `Share observation: "I've noticed you tend to ${dominantPattern.description.toLowerCase()}. How is that working for you?"`,
      priority: 'background',
    });
  }

  // Growth moment insights
  if (context.historicalPatterns.growthTrajectory === 'accelerating') {
    insights.push({
      id: `insight_growth_${now}`,
      type: 'growth_moment',
      title: 'Growth Acceleration',
      description: 'You are in a period of rapid development. This is a valuable time to build strong foundations.',
      longitudinalBasis: {
        pattern: 'accelerating_growth',
        evidence: ['Growth trajectory analysis shows acceleration'],
        confidence: 0.7,
      },
      relevance: {
        score: 0.8,
        reason: 'Timely for encouraging momentum',
      },
      suggestedResponse: 'Acknowledge growth: "You are growing rapidly right now. What support do you need to maintain this?"',
      priority: 'opportunistic',
    });
  }

  // Reflection prompts for concerning contrasts
  for (const contrast of context.contrasts.filter(c => c.isConcerning)) {
    insights.push({
      id: `insight_reflection_${contrast.id}_${now}`,
      type: 'reflection_prompt',
      title: `Reflect on ${contrast.aspect}`,
      description: contrast.reflectionPrompt,
      longitudinalBasis: {
        pattern: 'significant_deviation',
        evidence: [contrast.reflectionPrompt],
        confidence: 0.8,
      },
      relevance: {
        score: contrast.magnitude,
        reason: 'May indicate important consideration needed',
      },
      suggestedResponse: `Gently prompt: "${contrast.reflectionPrompt}"`,
      priority: 'immediate',
    });
  }

  return insights
    .filter(i => i.longitudinalBasis.confidence >= config.minConfidenceThreshold)
    .sort((a, b) => {
      const priorityOrder = { immediate: 0, opportunistic: 1, background: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, config.maxInsights);
}

// ============================================================================
// GROWTH OBSERVATIONS
// ============================================================================

/**
 * Generate growth observations.
 */
export function generateGrowthObservations(
  growthAnalysis?: PersonalGrowthAnalysis,
  longitudinalAnalysis?: LongitudinalAnalysis
): GrowthObservation[] {
  const observations: GrowthObservation[] = [];
  const now = Date.now();

  if (!growthAnalysis) return observations;

  for (const [dimension, state] of Object.entries(growthAnalysis.currentState.dimensions)) {
    const dimKey = dimension as string;
    const gap = growthAnalysis.gapAnalysis.dimensions[dimKey as keyof typeof growthAnalysis.gapAnalysis.dimensions];

    if (!gap) continue;

    let observationType: GrowthObservationType;
    let observation: string;

    if (state.growthRate > 0.03) {
      observationType = 'breakthrough_detected';
      observation = `Rapid growth detected in ${dimKey}. Current level: ${(state.currentLevel * 100).toFixed(0)}%`;
    } else if (gap.significance === 'critical') {
      observationType = 'potential_unrealized';
      observation = `Significant gap between current and potential in ${dimKey}. Consider focused development.`;
    } else if (state.growthRate < 0.005 && state.currentLevel > 0.7) {
      observationType = 'plateau_warning';
      observation = `Growth in ${dimKey} has slowed. May be reaching current plateau.`;
    } else {
      observationType = 'consistent_progress';
      observation = `Steady progress in ${dimKey}. Keep maintaining current approach.`;
    }

    observations.push({
      id: `observation_${dimKey}_${now}`,
      dimension: dimKey,
      type: observationType,
      observation,
      evidence: {
        startingLevel: Math.max(0, state.currentLevel - state.growthRate * 12), // Approximate 12 months ago
        currentLevel: state.currentLevel,
        milestones: [],
        trend: state.growthRate > 0.02 ? 'accelerating' : state.growthRate > 0.01 ? 'steady' : 'decelerating',
      },
      comparisonToTypical: {
        percentile: 50,
        description: 'Compared to similar students',
      },
      nextMilestone: gap.timeToClose ? {
        description: `Reach ${(gap.targetLevel * 100).toFixed(0)}% in ${dimKey}`,
        estimatedTime: gap.timeToClose * 30, // Convert months to days
        requiredActions: ['Consistent practice', 'Regular feedback'],
      } : undefined,
    });
  }

  return observations;
}

// ============================================================================
// DECISION WARNINGS
// ============================================================================

/**
 * Generate decision warnings.
 */
export function generateDecisionWarnings(
  context: MentorContext,
  longitudinalAnalysis?: LongitudinalAnalysis,
  config = DEFAULT_MENTOR_FOUNDATION_CONFIG
): DecisionWarning[] {
  const warnings: DecisionWarning[] = [];
  const now = Date.now();

  // Check for value misalignment
  const satisfactionGap = context.contrasts.find(c => c.type === 'satisfaction_gap');
  if (satisfactionGap && context.currentState.recentDecisions.length > 0) {
    const recentDecision = context.currentState.recentDecisions[context.currentState.recentDecisions.length - 1];
    if (recentDecision.confidence > 0.7) {
      warnings.push({
        id: `warning_value_misalignment_${now}`,
        type: 'value_misalignment',
        severity: 'high',
        title: 'Decision May Not Align with Historical Satisfaction',
        description: `Recent high-confidence decision may not align with values that historically brought satisfaction`,
        historicalBasis: {
          similarDecisions: longitudinalAnalysis?.timeline.events.filter(e => e.type === 'decision').length ?? 0,
          outcomes: 'Historically highest satisfaction from different values',
          pattern: 'value_satisfaction_mismatch',
        },
        concern: `You are optimizing for ${context.currentState.topValues[0]?.valueName} now, but historically your strongest satisfaction came from ${satisfactionGap.historical.value}.`,
        suggestedMitigation: 'Consider whether your current preference is temporary or if circumstances have genuinely changed.',
        confidence: 0.75,
      });
    }
  }

  // Check for impulsive pattern
  const impulsivePattern = longitudinalAnalysis?.decisionPatterns.find(p => p.type === 'impulsive');
  if (impulsivePattern && impulsivePattern.confidence > 0.6) {
    warnings.push({
      id: `warning_impulsive_${now}`,
      type: 'impulsive_pattern',
      severity: 'medium',
      title: 'Impulsive Decision Pattern Detected',
      description: 'Pattern of quick decisions with high reversal rate',
      historicalBasis: {
        similarDecisions: impulsivePattern.statistics.totalDecisions,
        outcomes: `${(impulsivePattern.statistics.reversalRate * 100).toFixed(0)}% reversal rate`,
        pattern: impulsivePattern.type,
      },
      concern: 'Quick decisions may not fully consider long-term implications',
      suggestedMitigation: 'Implement a cooling-off period for major decisions. Sleep on it.',
      confidence: impulsivePattern.confidence,
    });
  }

  // Check for avoidance pattern
  const avoidantPattern = longitudinalAnalysis?.decisionPatterns.find(p => p.type === 'avoidant');
  if (avoidantPattern && avoidantPattern.confidence > 0.6) {
    warnings.push({
      id: `warning_avoidance_${now}`,
      type: 'avoidance_pattern',
      severity: 'medium',
      title: 'Decision Avoidance Pattern',
      description: 'Pattern of delaying decisions beyond optimal timeframe',
      historicalBasis: {
        similarDecisions: avoidantPattern.statistics.totalDecisions,
        outcomes: `Average ${avoidantPattern.statistics.avgDecisionTime.toFixed(1)} days to decide`,
        pattern: avoidantPattern.type,
      },
      concern: 'Delaying decisions may close off opportunities',
      suggestedMitigation: 'Set specific deadlines and break complex decisions into smaller steps.',
      confidence: avoidantPattern.confidence,
    });
  }

  return warnings
    .filter(w => w.confidence >= config.minConfidenceThreshold)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, config.maxWarnings);
}
