/**
 * Adaptive Mentor Foundation
 *
 * Provide guidance using longitudinal intelligence.
 *
 * Purpose:
 *   - Process StudentBelief
 *   - Process Identity Development
 *   - Process Value Evolution
 *   - Process Outcome History
 *   - Process Decision History
 *
 * Generates:
 *   - MentorContext
 *   - MentorInsights
 *   - GrowthObservations
 *   - DecisionWarnings
 *
 * Example:
 *   "You are optimizing for status today.
 *    Historically, your strongest satisfaction came from autonomy and creation.
 *    Consider whether your current preference is temporary."
 *
 * Design Principles:
 *   - Foundation layer (no LLM integration)
 *   - Pattern-based insights from longitudinal data
 *   - Historical contrast detection
 *   - Explainable guidance
 *
 * Compatible with:
 *   - Longitudinal Intelligence Engine
 *   - Value Evolution Engine
 *   - Identity Development Engine
 *   - Personal Growth Engine
 *
 * Usage:
 *   const foundation = new AdaptiveMentorFoundation();
 *
 *   const output = foundation.analyze({
 *     studentId: 'student-123',
 *     belief: currentBelief,
 *     longitudinalAnalysis: longitudinalResult,
 *     valueEvolution: valueResult,
 *     identityProfile: identityResult.profile,
 *     growthAnalysis: growthResult,
 *   });
 *
 *   console.log(output.context.contrasts[0].reflectionPrompt);
 *   // "You are optimizing for status today.
 *   //  Historically, your strongest satisfaction came from autonomy and creation.
 *   //  Consider whether your current preference is temporary."
 */

import type {
  EntityId,
  StudentBeliefV3,
} from '../types/index.js';

import type {
  LongitudinalAnalysis,
} from '../longitudinal-intelligence-engine/types.js';

import type {
  ValueEvolutionAnalysis,
} from '../value-evolution-engine/types.js';

import type {
  IdentityProfile,
} from '../identity-development-engine/types.js';

import type {
  PersonalGrowthAnalysis,
} from '../personal-growth-engine/types.js';

import type {
  MentorContext,
  MentorInsight,
  GrowthObservation,
  DecisionWarning,
  MentorFoundationOutput,
  MentorFoundationInput,
  MentorFoundationOptions,
  MentorFoundationConfig,
} from './types.js';

import {
  DEFAULT_MENTOR_FOUNDATION_CONFIG,
} from './types.js';

import {
  buildMentorContext,
  generateInsights,
  generateGrowthObservations,
  generateDecisionWarnings,
} from './analysis.js';

// ============================================================================
// ADAPTIVE MENTOR FOUNDATION
// ============================================================================

/**
 * Foundation for adaptive mentor guidance using longitudinal intelligence.
 */
export class AdaptiveMentorFoundation {
  private config: MentorFoundationConfig;
  private outputs: Map<EntityId, MentorFoundationOutput> = new Map();

  constructor(config: Partial<MentorFoundationConfig> = {}) {
    this.config = { ...DEFAULT_MENTOR_FOUNDATION_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): MentorFoundationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<MentorFoundationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API: ANALYZE
  // ========================================================================

  /**
   * Perform comprehensive mentor foundation analysis.
   *
   * This is the primary API for the foundation.
   */
  analyze(input: MentorFoundationInput): MentorFoundationOutput {
    const startedAt = Date.now();

    // Build mentor context
    const context = buildMentorContext(
      input.studentId,
      input.belief,
      input.longitudinalAnalysis,
      input.valueEvolution,
      input.identityProfile,
      input.growthAnalysis,
      input.recentOutcomes,
      this.config
    );

    // Generate insights
    const insights = generateInsights(
      context,
      input.longitudinalAnalysis,
      this.config
    );

    // Generate growth observations
    const growthObservations = generateGrowthObservations(
      input.growthAnalysis,
      input.longitudinalAnalysis
    );

    // Generate decision warnings
    const decisionWarnings = generateDecisionWarnings(
      context,
      input.longitudinalAnalysis,
      this.config
    );

    // Build LLM summary
    const llmSummary = {
      keyPoints: this.generateKeyPoints(context, insights),
      historicalContrasts: context.contrasts.map(c => c.reflectionPrompt),
      activeWarnings: decisionWarnings.map(w => w.concern),
      guidanceThemes: context.priorities.map(p => p.area),
    };

    const output: MentorFoundationOutput = {
      id: `mentor_${input.studentId}_${startedAt}`,
      studentId: input.studentId,
      generatedAt: startedAt,
      context,
      insights,
      growthObservations,
      decisionWarnings,
      llmSummary,
    };

    // Store output
    this.outputs.set(input.studentId, output);

    return output;
  }

  /**
   * Quick analysis with minimal data.
   */
  quickAnalyze(
    studentId: EntityId,
    belief: StudentBeliefV3
  ): MentorFoundationOutput {
    return this.analyze({ studentId, belief });
  }

  // ========================================================================
  // CONTEXT QUERIES
  // ========================================================================

  /**
   * Get context for a student.
   */
  getContext(studentId: EntityId): MentorContext | undefined {
    return this.outputs.get(studentId)?.context;
  }

  /**
   * Get contrasts for a student.
   */
  getContrasts(studentId: EntityId): import('./types.js').StateContrast[] {
    return this.outputs.get(studentId)?.context.contrasts ?? [];
  }

  /**
   * Get concerning contrasts.
   */
  getConcerningContrasts(studentId: EntityId): import('./types.js').StateContrast[] {
    return this.getContrasts(studentId).filter(c => c.isConcerning);
  }

  /**
   * Get active considerations.
   */
  getConsiderations(studentId: EntityId): import('./types.js').ActiveConsideration[] {
    return this.outputs.get(studentId)?.context.considerations ?? [];
  }

  /**
   * Get guidance priorities.
   */
  getPriorities(studentId: EntityId): import('./types.js').GuidancePriority[] {
    return this.outputs.get(studentId)?.context.priorities ?? [];
  }

  // ========================================================================
  // INSIGHT QUERIES
  // ========================================================================

  /**
   * Get insights for a student.
   */
  getInsights(studentId: EntityId): MentorInsight[] {
    return this.outputs.get(studentId)?.insights ?? [];
  }

  /**
   * Get immediate priority insights.
   */
  getImmediateInsights(studentId: EntityId): MentorInsight[] {
    return this.getInsights(studentId).filter(i => i.priority === 'immediate');
  }

  /**
   * Get insights by type.
   */
  getInsightsByType(
    studentId: EntityId,
    type: import('./types.js').MentorInsightType
  ): MentorInsight[] {
    return this.getInsights(studentId).filter(i => i.type === type);
  }

  // ========================================================================
  // GROWTH OBSERVATION QUERIES
  // ========================================================================

  /**
   * Get growth observations for a student.
   */
  getGrowthObservations(studentId: EntityId): GrowthObservation[] {
    return this.outputs.get(studentId)?.growthObservations ?? [];
  }

  /**
   * Get observations by dimension.
   */
  getObservationsByDimension(
    studentId: EntityId,
    dimension: string
  ): GrowthObservation[] {
    return this.getGrowthObservations(studentId).filter(o => o.dimension === dimension);
  }

  /**
   * Get breakthrough observations.
   */
  getBreakthroughObservations(studentId: EntityId): GrowthObservation[] {
    return this.getGrowthObservations(studentId).filter(
      o => o.type === 'breakthrough_detected'
    );
  }

  // ========================================================================
  // DECISION WARNING QUERIES
  // ========================================================================

  /**
   * Get decision warnings for a student.
   */
  getDecisionWarnings(studentId: EntityId): DecisionWarning[] {
    return this.outputs.get(studentId)?.decisionWarnings ?? [];
  }

  /**
   * Get critical warnings.
   */
  getCriticalWarnings(studentId: EntityId): DecisionWarning[] {
    return this.getDecisionWarnings(studentId).filter(w => w.severity === 'critical');
  }

  /**
   * Get warnings by type.
   */
  getWarningsByType(
    studentId: EntityId,
    type: import('./types.js').DecisionWarningType
  ): DecisionWarning[] {
    return this.getDecisionWarnings(studentId).filter(w => w.type === type);
  }

  // ========================================================================
  // GUIDANCE GENERATION
  // ========================================================================

  /**
   * Generate guidance message (template-based, no LLM).
   */
  generateGuidance(output: MentorFoundationOutput): string {
    const lines: string[] = [];

    // Opening
    lines.push('=== Adaptive Mentor Guidance ===');
    lines.push('');

    // Historical contrasts (the core insight)
    if (output.context.contrasts.length > 0) {
      lines.push('Historical Reflection:');
      for (const contrast of output.context.contrasts.slice(0, 2)) {
        lines.push(`  • ${contrast.reflectionPrompt}`);
      }
      lines.push('');
    }

    // Active considerations
    if (output.context.considerations.length > 0) {
      lines.push('Active Considerations:');
      for (const consideration of output.context.considerations.slice(0, 3)) {
        const priorityIcon = consideration.priority === 'critical' ? '!!!' : consideration.priority === 'high' ? '!!' : '';
        lines.push(`  ${priorityIcon} ${consideration.description}`);
        if (consideration.suggestedAction) {
          lines.push(`     Action: ${consideration.suggestedAction}`);
        }
      }
      lines.push('');
    }

    // Growth observations
    if (output.growthObservations.length > 0) {
      lines.push('Growth Observations:');
      for (const obs of output.growthObservations.slice(0, 3)) {
        lines.push(`  • ${obs.observation}`);
      }
      lines.push('');
    }

    // Decision warnings
    if (output.decisionWarnings.length > 0) {
      lines.push('Decision Considerations:');
      for (const warning of output.decisionWarnings) {
        const severityIcon = warning.severity === 'critical' ? '[CRITICAL]' : warning.severity === 'high' ? '[HIGH]' : '';
        lines.push(`  ${severityIcon} ${warning.concern}`);
        lines.push(`     Suggestion: ${warning.suggestedMitigation}`);
      }
      lines.push('');
    }

    // Guidance priorities
    if (output.context.priorities.length > 0) {
      lines.push('Guidance Priorities:');
      for (const priority of output.context.priorities) {
        lines.push(`  ${priority.rank}. ${priority.area}`);
        lines.push(`     Focus: ${priority.suggestedFocus}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate example guidance (like user example).
   */
  generateExampleGuidance(output: MentorFoundationOutput): string | null {
    // Find satisfaction gap contrast (the example from user request)
    const satisfactionGap = output.context.contrasts.find(c => c.type === 'satisfaction_gap');
    if (satisfactionGap) {
      return `You are optimizing for ${output.context.currentState.topValues[0]?.valueName} today.\n` +
             `Historically, your strongest satisfaction came from ${satisfactionGap.historical.value}.\n` +
             `Consider whether your current preference is temporary.`;
    }

    // Find value shift contrast
    const valueShift = output.context.contrasts.find(c => c.type === 'value_shift' && c.isConcerning);
    if (valueShift) {
      return `Your ${valueShift.aspect} priority has changed significantly.\n` +
             `You previously valued it at ${valueShift.historical.value}, now at ${valueShift.current.value}.\n` +
             `Consider what prompted this change.`;
    }

    return null;
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate human-readable report.
   */
  generateReport(output: MentorFoundationOutput): string {
    return this.generateGuidance(output);
  }

  /**
   * Export output as JSON.
   */
  exportJSON(output: MentorFoundationOutput): string {
    return JSON.stringify(output, null, 2);
  }

  // ========================================================================
  // STORAGE
  // ========================================================================

  /**
   * Get stored output.
   */
  getOutput(studentId: EntityId): MentorFoundationOutput | undefined {
    return this.outputs.get(studentId);
  }

  /**
   * Get all stored outputs.
   */
  getAllOutputs(): MentorFoundationOutput[] {
    return Array.from(this.outputs.values());
  }

  /**
   * Clear stored data.
   */
  clearStudentData(studentId: EntityId): void {
    this.outputs.delete(studentId);
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Generate key points for LLM summary.
   */
  private generateKeyPoints(
    context: MentorContext,
    insights: MentorInsight[]
  ): string[] {
    const points: string[] = [];

    // Add primary identity if available
    if (context.currentState.primaryIdentity) {
      points.push(`Primary identity: ${context.currentState.primaryIdentity} (${(context.currentState.identityConfidence * 100).toFixed(0)}% confidence)`);
    }

    // Add top values
    if (context.currentState.topValues.length > 0) {
      points.push(`Top value: ${context.currentState.topValues[0].valueName} (${(context.currentState.topValues[0].priority * 100).toFixed(0)}%)`);
    }

    // Add key contrasts
    for (const contrast of context.contrasts.slice(0, 2)) {
      points.push(contrast.reflectionPrompt);
    }

    // Add key insights
    for (const insight of insights.slice(0, 2)) {
      points.push(insight.description);
    }

    return points;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new AdaptiveMentorFoundation instance.
 */
export function createAdaptiveMentorFoundation(
  config?: Partial<MentorFoundationConfig>
): AdaptiveMentorFoundation {
  return new AdaptiveMentorFoundation(config);
}

/**
 * Quick mentor analysis.
 */
export function quickMentorAnalysis(
  studentId: EntityId,
  belief: StudentBeliefV3
): MentorFoundationOutput {
  const foundation = new AdaptiveMentorFoundation();
  return foundation.quickAnalyze(studentId, belief);
}

/**
 * Generate satisfaction gap warning (example from requirements).
 */
export function generateSatisfactionGapWarning(
  currentValue: string,
  historicalSatisfactionValue: string
): string {
  return `You are optimizing for ${currentValue} today.\n` +
         `Historically, your strongest satisfaction came from ${historicalSatisfactionValue}.\n` +
         `Consider whether your current preference is temporary.`;
}
