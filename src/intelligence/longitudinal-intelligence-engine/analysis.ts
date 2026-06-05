/**
 * Longitudinal Intelligence Engine - Analysis Algorithms
 *
 * Deterministic algorithms for longitudinal analysis.
 *
 * Design Principles:
 * - No machine learning - only transparent calculations
 * - Pattern detection through statistical analysis
 * - Explainable logic
 * - Production-ready
 */

import type {
  TimelineEvent,
  TimelineEventType,
  StudentTimeline,
  TimelineSummary,
  MajorTransition,
  TransitionType,
  GrowthMilestone,
  MilestoneType,
  DecisionPattern,
  DecisionPatternType,
  LongitudinalInsight,
  LongitudinalPrediction,
  AssessmentSnapshot,
  DecisionRecord,
  OutcomeRecord,
  LongitudinalConfig,
} from './types.js';

import {
  TIMELINE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  TRANSITION_TYPES,
  MILESTONE_TYPES,
  DECISION_PATTERN_TYPES,
  DEFAULT_LONGITUDINAL_CONFIG,
} from './types.js';

// ============================================================================
// TIMELINE GENERATION
// ============================================================================

/**
 * Generate student timeline from input data.
 */
export function generateTimeline(
  studentId: string,
  assessments: AssessmentSnapshot[] = [],
  decisions: DecisionRecord[] = [],
  valueHistory?: import('../value-evolution-engine/types.js').ValueHistory,
  identityEvolution?: import('../identity-development-engine/types.js').IdentityEvolution,
  growthAnalyses: import('../personal-growth-engine/types.js').PersonalGrowthAnalysis[] = [],
  outcomes: OutcomeRecord[] = [],
  config = DEFAULT_LONGITUDINAL_CONFIG
): StudentTimeline {
  const id = `timeline_${studentId}_${Date.now()}`;
  const events: TimelineEvent[] = [];

  // Convert assessments to events
  for (const assessment of assessments) {
    events.push({
      id: `evt_assessment_${assessment.id}`,
      type: 'assessment',
      timestamp: assessment.timestamp,
      description: `${assessment.type} assessment completed`,
      data: {
        assessmentType: assessment.type,
        scores: assessment.metrics,
        insights: [],
      },
      evidence: [],
      relatedEvents: [],
      significance: 0.6,
    });
  }

  // Convert decisions to events
  for (const decision of decisions) {
    events.push({
      id: `evt_decision_${decision.id}`,
      type: 'decision',
      timestamp: decision.timestamp,
      description: `Decision: ${decision.type}`,
      data: {
        decisionId: decision.id,
        decisionType: decision.type,
        options: decision.options,
        chosenOption: decision.chosen,
        confidence: decision.confidence,
        rationale: '',
      },
      evidence: [],
      relatedEvents: [],
      significance: decision.confidence > 0.7 ? 0.8 : 0.5,
    });
  }

  // Convert value history to events
  if (valueHistory) {
    for (let i = 1; i < valueHistory.snapshots.length; i++) {
      const current = valueHistory.snapshots[i];
      const previous = valueHistory.snapshots[i - 1];

      // Find significant value changes
      for (const [valueId, currentValue] of Object.entries(current.values)) {
        const previousValue = previous.values[valueId as keyof typeof previous.values] as number | undefined;
        if (previousValue !== undefined) {
          const change = Math.abs(currentValue - previousValue);
          if (change > 0.15) {
            events.push({
              id: `evt_valueshift_${current.id}_${valueId}`,
              type: 'value_shift',
              timestamp: current.timestamp,
              description: `Value shift: ${valueId} ${currentValue > previousValue ? 'increased' : 'decreased'}`,
              data: {
                valueId,
                valueName: valueId,
                previousPriority: previousValue,
                newPriority: currentValue,
                shiftType: currentValue > previousValue ? 'increase' : 'decrease',
              },
              evidence: [],
              relatedEvents: [],
              significance: change,
            });
          }
        }
      }
    }
  }

  // Convert identity evolution to events
  if (identityEvolution) {
    for (const transition of identityEvolution.transitions) {
      events.push({
        id: `evt_identity_${transition.id}`,
        type: 'identity_transition',
        timestamp: transition.timestamp,
        description: `Identity transition: ${transition.fromIdentity || 'none'} -> ${transition.toIdentity || 'none'}`,
        data: {
          fromIdentity: transition.fromIdentity,
          toIdentity: transition.toIdentity,
          fromArchetype: transition.fromIdentity,
          toArchetype: transition.toIdentity,
          transitionType: transition.type,
        },
        evidence: [],
        relatedEvents: [],
        significance: transition.magnitude,
      });
    }
  }

  // Convert growth analyses to milestone events
  for (const analysis of growthAnalyses) {
    const insights = analysis.insights;
    for (const insight of insights) {
      if (insight.type === 'rapid-growth-detected' || insight.type === 'high-potential-identified') {
        events.push({
          id: `evt_milestone_${insight.id}`,
          type: 'milestone',
          timestamp: analysis.generatedAt,
          description: insight.description,
          data: {
            milestoneType: insight.type,
            dimension: insight.dimensions[0] || 'overall',
            level: analysis.currentState.overallLevel,
            previousLevel: analysis.currentState.overallLevel - 0.1,
          },
          evidence: [],
          relatedEvents: [],
          significance: 0.7,
        });
      }
    }
  }

  // Convert outcomes to events
  for (const outcome of outcomes) {
    events.push({
      id: `evt_outcome_${outcome.id}`,
      type: 'outcome',
      timestamp: outcome.timestamp,
      description: `Outcome: ${outcome.type}`,
      data: {
        outcomeType: outcome.type,
        outcomeValue: outcome.value,
        expectedValue: outcome.expectedValue,
        satisfaction: outcome.satisfaction,
      },
      evidence: [],
      relatedEvents: outcome.relatedDecisionId ? [`evt_decision_${outcome.relatedDecisionId}`] : [],
      significance: Math.abs(outcome.value - outcome.expectedValue) > 0.2 ? 0.8 : 0.4,
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate time range
  const timestamps = events.map(e => e.timestamp);
  const start = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
  const end = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

  // Calculate summary
  const summary = calculateTimelineSummary(events, start, end);

  return {
    id,
    studentId,
    startedAt: start,
    lastUpdatedAt: end,
    events,
    timeRange: {
      start,
      end,
      durationMs: end - start,
    },
    summary,
  };
}

/**
 * Calculate timeline summary statistics.
 */
function calculateTimelineSummary(
  events: TimelineEvent[],
  start: number,
  end: number
): TimelineSummary {
  const totalEvents = events.length;
  const durationMs = end - start;
  const durationMonths = Math.max(1, durationMs / (30 * 24 * 60 * 60 * 1000));

  // Count by type
  const eventsByType = {} as Record<TimelineEventType, number>;
  for (const type of TIMELINE_EVENT_TYPES) {
    eventsByType[type] = events.filter(e => e.type === type).length;
  }

  // Find most active period (30-day windows)
  let mostActivePeriod = { start, end, eventCount: 0 };
  if (events.length > 0) {
    const windowMs = 30 * 24 * 60 * 60 * 1000;
    for (let windowStart = start; windowStart <= end - windowMs; windowStart += windowMs / 4) {
      const windowEnd = windowStart + windowMs;
      const count = events.filter(e => e.timestamp >= windowStart && e.timestamp <= windowEnd).length;
      if (count > mostActivePeriod.eventCount) {
        mostActivePeriod = { start: windowStart, end: windowEnd, eventCount: count };
      }
    }
  }

  // Find quietest period
  let quietestPeriod: TimelineSummary['quietestPeriod'] = null;
  if (events.length > 1) {
    const gaps: { start: number; end: number; durationMs: number }[] = [];
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].timestamp - events[i - 1].timestamp;
      if (gap > 30 * 24 * 60 * 60 * 1000) { // At least 30 days
        gaps.push({
          start: events[i - 1].timestamp,
          end: events[i].timestamp,
          durationMs: gap,
        });
      }
    }
    if (gaps.length > 0) {
      const largestGap = gaps.reduce((max, g) => g.durationMs > max.durationMs ? g : max, gaps[0]);
      quietestPeriod = largestGap;
    }
  }

  return {
    totalEvents,
    eventsByType,
    eventsPerMonth: totalEvents / durationMonths,
    mostActivePeriod,
    quietestPeriod,
  };
}

// ============================================================================
// TRANSITION DETECTION
// ============================================================================

/**
 * Detect major transitions from timeline and snapshots.
 */
export function detectTransitions(
  timeline: StudentTimeline,
  assessments: AssessmentSnapshot[],
  config = DEFAULT_LONGITUDINAL_CONFIG
): MajorTransition[] {
  const transitions: MajorTransition[] = [];

  if (assessments.length < 2) return transitions;

  // Sort assessments by timestamp
  const sortedAssessments = [...assessments].sort((a, b) => a.timestamp - b.timestamp);

  // Detect identity transitions
  for (let i = 1; i < sortedAssessments.length; i++) {
    const current = sortedAssessments[i];
    const previous = sortedAssessments[i - 1];

    // Check for identity change
    if (current.metrics.primaryIdentity && previous.metrics.primaryIdentity &&
        current.metrics.primaryIdentity !== previous.metrics.primaryIdentity) {
      const transition: MajorTransition = {
        id: `transition_identity_${current.id}`,
        type: 'identity_shift',
        startedAt: previous.timestamp,
        completedAt: current.timestamp,
        durationMs: current.timestamp - previous.timestamp,
        description: `Identity shifted from ${previous.metrics.primaryIdentity} to ${current.metrics.primaryIdentity}`,
        triggerEvent: `evt_assessment_${current.id}`,
        factors: ['Assessment revealed new identity alignment'],
        beforeState: {
          primaryIdentity: previous.metrics.primaryIdentity,
          dominantValue: previous.metrics.dominantValue,
          topStrengths: previous.metrics.topStrengths,
          overallConfidence: previous.metrics.overallConfidence,
        },
        afterState: {
          primaryIdentity: current.metrics.primaryIdentity,
          dominantValue: current.metrics.dominantValue,
          topStrengths: current.metrics.topStrengths,
          overallConfidence: current.metrics.overallConfidence,
        },
        wasPositive: current.metrics.overallConfidence > previous.metrics.overallConfidence,
        confidence: 0.75,
      };
      transitions.push(transition);
    }

    // Check for value realignment
    if (current.metrics.dominantValue && previous.metrics.dominantValue &&
        current.metrics.dominantValue !== previous.metrics.dominantValue) {
      const transition: MajorTransition = {
        id: `transition_value_${current.id}`,
        type: 'value_realignment',
        startedAt: previous.timestamp,
        completedAt: current.timestamp,
        durationMs: current.timestamp - previous.timestamp,
        description: `Values realigned from ${previous.metrics.dominantValue} to ${current.metrics.dominantValue}`,
        triggerEvent: `evt_assessment_${current.id}`,
        factors: ['Value priorities shifted based on experience'],
        beforeState: {
          primaryIdentity: previous.metrics.primaryIdentity,
          dominantValue: previous.metrics.dominantValue,
          topStrengths: previous.metrics.topStrengths,
          overallConfidence: previous.metrics.overallConfidence,
        },
        afterState: {
          primaryIdentity: current.metrics.primaryIdentity,
          dominantValue: current.metrics.dominantValue,
          topStrengths: current.metrics.topStrengths,
          overallConfidence: current.metrics.overallConfidence,
        },
        wasPositive: current.metrics.overallConfidence > previous.metrics.overallConfidence,
        confidence: 0.7,
      };
      transitions.push(transition);
    }

    // Check for confidence breakthrough
    const confidenceChange = current.metrics.overallConfidence - previous.metrics.overallConfidence;
    if (confidenceChange > config.transitionSensitivity) {
      const transition: MajorTransition = {
        id: `transition_confidence_${current.id}`,
        type: 'confidence_growth',
        startedAt: previous.timestamp,
        completedAt: current.timestamp,
        durationMs: current.timestamp - previous.timestamp,
        description: `Significant confidence growth detected`,
        triggerEvent: `evt_assessment_${current.id}`,
        factors: [`Confidence increased by ${(confidenceChange * 100).toFixed(0)}%`],
        beforeState: {
          primaryIdentity: previous.metrics.primaryIdentity,
          dominantValue: previous.metrics.dominantValue,
          topStrengths: previous.metrics.topStrengths,
          overallConfidence: previous.metrics.overallConfidence,
        },
        afterState: {
          primaryIdentity: current.metrics.primaryIdentity,
          dominantValue: current.metrics.dominantValue,
          topStrengths: current.metrics.topStrengths,
          overallConfidence: current.metrics.overallConfidence,
        },
        wasPositive: true,
        confidence: 0.8,
      };
      transitions.push(transition);
    }
  }

  // Detect decision-driven transitions
  const decisionEvents = timeline.events.filter(e => e.type === 'decision');
  for (const decision of decisionEvents) {
    const decisionData = (decision as TimelineEvent & { data: { confidence: number; chosenOption: string } }).data;
    if (decisionData.confidence > 0.8) {
      // High-confidence decision often triggers transition
      const existingTransition = transitions.find(t => t.triggerEvent === decision.id);
      if (!existingTransition) {
        const transition: MajorTransition = {
          id: `transition_decision_${decision.id}`,
          type: 'career_direction',
          startedAt: decision.timestamp,
          durationMs: 0,
          description: `Career direction set: ${decisionData.chosenOption}`,
          triggerEvent: decision.id,
          factors: ['High-confidence decision made'],
          beforeState: {
            topStrengths: [],
            overallConfidence: 0.5,
          },
          afterState: {
            topStrengths: [],
            overallConfidence: decisionData.confidence,
          },
          wasPositive: true,
          confidence: decisionData.confidence,
        };
        transitions.push(transition);
      }
    }
  }

  return transitions.sort((a, b) => a.startedAt - b.startedAt);
}

// ============================================================================
// MILESTONE IDENTIFICATION
// ============================================================================

/**
 * Identify growth milestones from timeline and analyses.
 */
export function identifyMilestones(
  timeline: StudentTimeline,
  assessments: AssessmentSnapshot[],
  growthAnalyses: import('../personal-growth-engine/types.js').PersonalGrowthAnalysis[] = [],
  config = DEFAULT_LONGITUDINAL_CONFIG
): GrowthMilestone[] {
  const milestones: GrowthMilestone[] = [];

  // Milestones from assessments
  for (let i = 1; i < assessments.length; i++) {
    const current = assessments[i];
    const previous = assessments[i - 1];

    // Confidence milestone
    if (current.metrics.overallConfidence >= config.milestoneThreshold &&
        previous.metrics.overallConfidence < config.milestoneThreshold) {
      milestones.push({
        id: `milestone_confidence_${current.id}`,
        type: 'confidence_breakthrough',
        achievedAt: current.timestamp,
        title: 'Confidence Breakthrough',
        description: `Overall confidence reached ${(current.metrics.overallConfidence * 100).toFixed(0)}%`,
        dimension: 'confidence',
        level: current.metrics.overallConfidence,
        evidence: [],
        relatedEventIds: [`evt_assessment_${current.id}`],
      });
    }

    // Identity consolidation milestone
    if (current.metrics.primaryIdentity && current.metrics.overallConfidence > 0.6) {
      milestones.push({
        id: `milestone_identity_${current.id}`,
        type: 'identity_consolidation',
        achievedAt: current.timestamp,
        title: 'Identity Consolidation',
        description: `${current.metrics.primaryIdentity} identity consolidated with ${(current.metrics.overallConfidence * 100).toFixed(0)}% confidence`,
        dimension: 'identity',
        level: current.metrics.overallConfidence,
        evidence: [],
        relatedEventIds: [`evt_assessment_${current.id}`],
      });
    }
  }

  // Milestones from growth analyses
  for (const analysis of growthAnalyses) {
    for (const insight of analysis.insights) {
      if (insight.type === 'rapid-growth-detected') {
        const dimension = insight.dimensions[0] || 'skill';
        milestones.push({
          id: `milestone_growth_${analysis.id}_${dimension}`,
          type: 'skill_mastery',
          achievedAt: analysis.generatedAt,
          title: 'Rapid Growth Milestone',
          description: insight.description,
          dimension,
          level: analysis.currentState.dimensions[dimension]?.currentLevel || 0.5,
          evidence: [],
          relatedEventIds: [],
        });
      }
    }
  }

  // Milestones from value clarity
  const valueEvents = timeline.events.filter(e => e.type === 'value_shift');
  for (const event of valueEvents) {
    const valueData = (event as TimelineEvent & { data: { shiftType: string; newPriority: number } }).data;
    if (valueData.newPriority > 0.7) {
      milestones.push({
        id: `milestone_value_${event.id}`,
        type: 'value_clarity',
        achievedAt: event.timestamp,
        title: 'Value Clarity',
        description: `Value priority clarified at ${(valueData.newPriority * 100).toFixed(0)}%`,
        dimension: 'values',
        level: valueData.newPriority,
        evidence: event.evidence,
        relatedEventIds: [event.id],
      });
    }
  }

  return milestones.sort((a, b) => a.achievedAt - b.achievedAt);
}

// ============================================================================
// DECISION PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze decision patterns from decision records.
 */
export function analyzeDecisionPatterns(
  decisions: DecisionRecord[],
  config = DEFAULT_LONGITUDINAL_CONFIG
): DecisionPattern[] {
  if (decisions.length < config.minDecisionsForPattern) return [];

  const patterns: DecisionPattern[] = [];

  // Calculate basic statistics
  const totalDecisions = decisions.length;
  const avgDecisionTime = decisions.reduce((sum, d) => sum + d.decisionTimeDays, 0) / totalDecisions;
  const avgConfidence = decisions.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions;
  const reversalRate = decisions.filter(d => d.wasReversed).length / totalDecisions;
  const satisfactionRate = decisions.filter(d => (d.satisfaction || 0) > 0.6).length / totalDecisions;

  // Detect analytical pattern (long decision time, high confidence)
  if (avgDecisionTime > 7 && avgConfidence > 0.7) {
    patterns.push({
      id: `pattern_analytical_${Date.now()}`,
      type: 'analytical',
      confidence: 0.75,
      description: 'Takes time to analyze options thoroughly before deciding',
      evidence: [`Average decision time: ${avgDecisionTime.toFixed(1)} days`, `High confidence: ${(avgConfidence * 100).toFixed(0)}%`],
      statistics: {
        totalDecisions,
        avgDecisionTime,
        avgConfidence,
        reversalRate,
        satisfactionRate,
      },
      evolution: [],
      recommendations: ['Continue thorough analysis', 'Watch for analysis paralysis'],
    });
  }

  // Detect intuitive pattern (quick decisions, moderate confidence)
  if (avgDecisionTime < 3 && avgConfidence > 0.5) {
    patterns.push({
      id: `pattern_intuitive_${Date.now()}`,
      type: 'intuitive',
      confidence: 0.7,
      description: 'Makes quick decisions based on gut feeling',
      evidence: [`Fast decision time: ${avgDecisionTime.toFixed(1)} days`, `Moderate confidence: ${(avgConfidence * 100).toFixed(0)}%`],
      statistics: {
        totalDecisions,
        avgDecisionTime,
        avgConfidence,
        reversalRate,
        satisfactionRate,
      },
      evolution: [],
      recommendations: ['Trust instincts but validate key assumptions', 'Consider gathering more data for major decisions'],
    });
  }

  // Detect avoidant pattern (long decision time, low confidence)
  if (avgDecisionTime > 10 && avgConfidence < 0.6) {
    patterns.push({
      id: `pattern_avoidant_${Date.now()}`,
      type: 'avoidant',
      confidence: 0.8,
      description: 'Tends to delay decisions and lacks confidence',
      evidence: [`Long decision time: ${avgDecisionTime.toFixed(1)} days`, `Low confidence: ${(avgConfidence * 100).toFixed(0)}%`],
      statistics: {
        totalDecisions,
        avgDecisionTime,
        avgConfidence,
        reversalRate,
        satisfactionRate,
      },
      evolution: [],
      recommendations: ['Set decision deadlines', 'Break complex decisions into smaller steps', 'Practice with low-stakes decisions'],
    });
  }

  // Detect values-aligned pattern (high satisfaction, low reversal)
  if (satisfactionRate > 0.7 && reversalRate < 0.2) {
    patterns.push({
      id: `pattern_values_aligned_${Date.now()}`,
      type: 'values_aligned',
      confidence: 0.85,
      description: 'Decisions consistently align with values and goals',
      evidence: [`High satisfaction: ${(satisfactionRate * 100).toFixed(0)}%`, `Low reversal rate: ${(reversalRate * 100).toFixed(0)}%`],
      statistics: {
        totalDecisions,
        avgDecisionTime,
        avgConfidence,
        reversalRate,
        satisfactionRate,
      },
      evolution: [],
      recommendations: ['Maintain value clarity', 'Document decision criteria for future reference'],
    });
  }

  // Detect impulsive pattern (quick decisions, high reversal)
  if (avgDecisionTime < 2 && reversalRate > 0.3) {
    patterns.push({
      id: `pattern_impulsive_${Date.now()}`,
      type: 'impulsive',
      confidence: 0.75,
      description: 'Makes quick decisions but often reverses them',
      evidence: [`Fast decisions: ${avgDecisionTime.toFixed(1)} days`, `High reversal: ${(reversalRate * 100).toFixed(0)}%`],
      statistics: {
        totalDecisions,
        avgDecisionTime,
        avgConfidence,
        reversalRate,
        satisfactionRate,
      },
      evolution: [],
      recommendations: ['Implement a cooling-off period', 'Get input from trusted advisors', 'Reflect on past reversals'],
    });
  }

  return patterns;
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate longitudinal insights.
 */
export function generateInsights(
  timeline: StudentTimeline,
  transitions: MajorTransition[],
  milestones: GrowthMilestone[],
  patterns: DecisionPattern[]
): LongitudinalInsight[] {
  const insights: LongitudinalInsight[] = [];
  const now = Date.now();

  // Consistent growth insight
  if (milestones.length >= 3) {
    const recentMilestones = milestones.filter(m => now - m.achievedAt < 180 * 24 * 60 * 60 * 1000); // 6 months
    if (recentMilestones.length >= 2) {
      insights.push({
        id: `insight_growth_${now}`,
        type: 'consistent_growth',
        timeframe: 'present',
        description: 'Consistent growth trajectory with multiple milestones achieved recently',
        evidence: [`${recentMilestones.length} milestones in last 6 months`],
        relatedEventIds: recentMilestones.map(m => m.id),
        confidence: 0.8,
        urgency: 'long-term',
      });
    }
  }

  // Stagnation detection
  const lastEvent = timeline.events[timeline.events.length - 1];
  if (lastEvent && now - lastEvent.timestamp > 90 * 24 * 60 * 60 * 1000) { // 3 months
    insights.push({
      id: `insight_stagnation_${now}`,
      type: 'stagnation_detected',
      timeframe: 'present',
      description: 'No significant activity in the last 3 months - possible stagnation',
      evidence: [`Last activity: ${new Date(lastEvent.timestamp).toISOString()}`],
      relatedEventIds: [lastEvent.id],
      confidence: 0.7,
      urgency: 'near-term',
    });
  }

  // Pattern break detection
  if (patterns.length > 0 && transitions.length > 0) {
    const recentTransition = transitions[transitions.length - 1]?.completedAt;
    if (recentTransition && now - recentTransition < 30 * 24 * 60 * 60 * 1000) { // 1 month
      insights.push({
        id: `insight_pattern_break_${now}`,
        type: 'pattern_break',
        timeframe: 'present',
        description: 'Recent major transition suggests a shift in approach or priorities',
        evidence: transitions.slice(-1).map(t => t.description),
        relatedEventIds: transitions.slice(-1).map(t => t.id),
        confidence: 0.75,
        urgency: 'near-term',
      });
    }
  }

  // Positive trajectory
  const positiveTransitions = transitions.filter(t => t.wasPositive).length;
  const totalTransitions = transitions.length;
  if (totalTransitions > 0 && positiveTransitions / totalTransitions > 0.7) {
    insights.push({
      id: `insight_positive_${now}`,
      type: 'positive_trajectory',
      timeframe: 'past',
      description: 'Most transitions have been positive, indicating good decision-making',
      evidence: [`${positiveTransitions}/${totalTransitions} transitions were positive`],
      relatedEventIds: transitions.filter(t => t.wasPositive).map(t => t.id),
      confidence: 0.8,
      urgency: 'long-term',
    });
  }

  // Decision style insight
  const dominantPattern = patterns.sort((a, b) => b.confidence - a.confidence)[0];
  if (dominantPattern) {
    insights.push({
      id: `insight_decision_style_${now}`,
      type: 'decision_style_shift',
      timeframe: 'present',
      description: `Decision-making style: ${dominantPattern.description}`,
      evidence: dominantPattern.evidence,
      relatedEventIds: [],
      confidence: dominantPattern.confidence,
      urgency: 'long-term',
    });
  }

  return insights;
}

// ============================================================================
// PREDICTION GENERATION
// ============================================================================

/**
 * Generate longitudinal predictions.
 */
export function generatePredictions(
  timeline: StudentTimeline,
  transitions: MajorTransition[],
  milestones: GrowthMilestone[],
  config = DEFAULT_LONGITUDINAL_CONFIG
): LongitudinalPrediction[] {
  const predictions: LongitudinalPrediction[] = [];
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;

  // Predict next milestone based on recent velocity
  if (milestones.length >= 2) {
    const recentMilestones = milestones.slice(-3);
    const avgGap = (recentMilestones[recentMilestones.length - 1].achievedAt - recentMilestones[0].achievedAt) / (recentMilestones.length - 1);
    const nextMilestoneTime = now + avgGap;

    predictions.push({
      id: `prediction_milestone_${now}`,
      prediction: 'Next growth milestone likely within the coming period',
      likelihood: 0.7,
      timeframe: {
        earliest: now + avgGap * 0.7,
        latest: now + avgGap * 1.3,
        mostLikely: nextMilestoneTime,
      },
      basis: [`Recent milestone velocity: ${(avgGap / msPerDay).toFixed(0)} days between milestones`],
      confidence: 0.65,
    });
  }

  // Predict transition risk based on pattern
  if (transitions.length >= 2) {
    const avgTransitionGap = (transitions[transitions.length - 1].startedAt - transitions[0].startedAt) / (transitions.length - 1);
    const timeSinceLastTransition = now - transitions[transitions.length - 1].startedAt;

    if (timeSinceLastTransition > avgTransitionGap * 1.5) {
      predictions.push({
        id: `prediction_transition_${now}`,
        prediction: 'Transition may be approaching based on historical pattern',
        likelihood: 0.5,
        timeframe: {
          earliest: now,
          latest: now + avgTransitionGap * 0.5,
          mostLikely: now + avgTransitionGap * 0.25,
        },
        basis: ['Time since last transition exceeds historical average'],
        confidence: 0.5,
      });
    }
  }

  // Predict event activity
  const eventsPerMonth = timeline.summary.eventsPerMonth;
  if (eventsPerMonth > 0) {
    const expectedNextEvent = now + (30 * msPerDay / eventsPerMonth);

    predictions.push({
      id: `prediction_activity_${now}`,
      prediction: 'Continued development activity expected',
      likelihood: Math.min(0.9, 0.5 + eventsPerMonth * 0.1),
      timeframe: {
        earliest: expectedNextEvent * 0.8,
        latest: expectedNextEvent * 1.5,
        mostLikely: expectedNextEvent,
      },
      basis: [`Historical activity rate: ${eventsPerMonth.toFixed(1)} events per month`],
      confidence: 0.6,
    });
  }

  return predictions;
}
