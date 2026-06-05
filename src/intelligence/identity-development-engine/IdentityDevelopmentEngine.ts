/**
 * Identity Development Engine
 *
 * Models identity formation and evolution.
 *
 * Purpose:
 *   - Track interests, strengths, beliefs, values, aspirations
 *   - Identify emerging, stable, and conflicted identities
 *   - Generate IdentityProfile, IdentityConfidence, IdentityEvolution
 *
 * Design Principles:
 *   - Deterministic analysis
 *   - Explainable identity detection
 *   - Strong typing
 *   - Compatible with StudentBeliefV3
 *
 * Example Usage:
 *   const engine = new IdentityDevelopmentEngine();
 *
 *   const result = engine.analyze({
 *     studentId: 'student-123',
 *     belief: currentBeliefSnapshot,
 *     beliefHistory: previousBeliefs,
 *   });
 *
 *   console.log(result.profile.primaryIdentity);        // 'builder'
 *   console.log(result.profile.status);                 // 'emerging'
 *   console.log(result.profile.identityConfidence.builder.score);
 *
 *   // Detected emerging builder identity:
 *   // - Creating projects (behavioral signal)
 *   // - Entrepreneurial curiosity (interest signal)
 *   // - Leadership tendencies (strength signal)
 */

import type {
  EntityId,
  StudentBeliefV3,
} from '../types/index.js';

import type {
  IdentityArchetypeId,
  ArchetypeDefinition,
  IdentitySignal,
  IdentityProfile,
  IdentityConfidence,
  IdentityConflict,
  IdentityStatus,
  IdentityEvolution,
  IdentitySnapshot,
  IdentityTransition,
  EvolutionPattern,
  IdentityAnalysisInput,
  IdentityAnalysisOptions,
  IdentityAnalysisOutput,
  IdentityInsight,
  IdentityRecommendation,
  PrimaryIdentityRecord,
  IdentityDevelopmentConfig,
} from './types.js';

import {
  IDENTITY_ARCHETYPES,
  ARCHETYPE_DEFINITIONS,
  ARCHETYPE_DISPLAY_NAMES,
  DEFAULT_IDENTITY_CONFIG,
} from './types.js';

import {
  extractSignalsFromBelief,
  calculateArchetypeScores,
  calculateIdentityConfidence,
  determineIdentityStatus,
  detectConflicts,
  detectTransitions,
  determineEvolutionPattern,
  generateInsights,
} from './detection.js';

// ============================================================================
// IDENTITY DEVELOPMENT ENGINE
// ============================================================================

/**
 * Engine for modeling identity formation and evolution.
 */
export class IdentityDevelopmentEngine {
  private config: IdentityDevelopmentConfig;
  private profiles: Map<EntityId, IdentityProfile> = new Map();
  private evolutions: Map<EntityId, IdentityEvolution> = new Map();

  constructor(config: Partial<IdentityDevelopmentConfig> = {}) {
    this.config = { ...DEFAULT_IDENTITY_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): IdentityDevelopmentConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<IdentityDevelopmentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get archetype definitions.
   */
  getArchetypeDefinitions(): ArchetypeDefinition[] {
    return [...ARCHETYPE_DEFINITIONS];
  }

  /**
   * Get definition for a specific archetype.
   */
  getArchetypeDefinition(id: IdentityArchetypeId): ArchetypeDefinition | undefined {
    return ARCHETYPE_DEFINITIONS.find(d => d.id === id);
  }

  // ========================================================================
  // MAIN API: ANALYZE
  // ========================================================================

  /**
   * Perform identity analysis.
   *
   * This is the primary API for the engine.
   */
  analyze(input: IdentityAnalysisInput): IdentityAnalysisOutput {
    const startedAt = Date.now();
    const options = { ...DEFAULT_IDENTITY_CONFIG, ...input.options };

    // Extract signals from belief
    const signals = [
      ...extractSignalsFromBelief(input.belief, this.config),
      ...(input.additionalSignals ?? []),
    ];

    // Calculate archetype scores
    const scores = calculateArchetypeScores(signals, this.config);

    // Calculate confidence for each archetype
    const identityConfidence: Record<IdentityArchetypeId, IdentityConfidence> = {} as Record<IdentityArchetypeId, IdentityConfidence>;
    for (const archetype of IDENTITY_ARCHETYPES) {
      const archetypeId = archetype as IdentityArchetypeId;
      identityConfidence[archetypeId] = calculateIdentityConfidence(signals, archetypeId);
    }

    // Determine primary and secondary identities
    const sortedScores = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id: id as IdentityArchetypeId, score }));

    const primaryIdentity = sortedScores[0]?.score >= this.config.primaryIdentityThreshold
      ? sortedScores[0].id
      : undefined;

    const secondaryIdentities = sortedScores
      .slice(1)
      .filter(s => s.score >= this.config.secondaryIdentityThreshold)
      .map(s => s.id);

    // Determine identity status
    const previousProfile = input.previousProfile ?? this.getProfile(input.studentId);
    const status = determineIdentityStatus(
      scores,
      previousProfile ? { status: previousProfile.status, archetypeScores: previousProfile.archetypeScores } : undefined,
      this.config
    );

    // Detect conflicts
    const conflicts = options.detectConflicts !== false
      ? detectConflicts(scores, signals, this.config)
      : [];

    // Track evolution
    let evolution: IdentityEvolution | undefined;
    if (options.trackEvolution !== false) {
      evolution = this.updateEvolution(input.studentId, scores, input.beliefHistory);
    }

    // Build evidence summary
    const evidenceSummary: Record<IdentityArchetypeId, import('../types/index.js').Evidence[]> = {} as Record<IdentityArchetypeId, import('../types/index.js').Evidence[]>;
    for (const archetype of IDENTITY_ARCHETYPES) {
      const archetypeId = archetype as IdentityArchetypeId;
      const archetypeSignals = signals.filter(s => s.archetypeId === archetypeId);
      evidenceSummary[archetypeId] = archetypeSignals.flatMap(s => s.evidence);
    }

    // Generate profile
    const profile: IdentityProfile = {
      id: `profile_${input.studentId}_${startedAt}`,
      studentId: input.studentId,
      generatedAt: startedAt,
      primaryIdentity,
      secondaryIdentities,
      archetypeScores: scores,
      identityConfidence,
      overallConfidence: this.calculateOverallConfidence(identityConfidence),
      status,
      signals: options.includeEvidence !== false ? signals : [],
      conflicts,
      evolution,
      beliefSnapshot: input.belief,
      evidenceSummary: options.includeEvidence !== false ? evidenceSummary : {} as Record<IdentityArchetypeId, import('../types/index.js').Evidence[]>,
    };

    // Store profile
    this.profiles.set(input.studentId, profile);

    // Generate insights
    const insights = options.includeEvidence !== false
      ? generateInsights(scores, status, signals, conflicts)
      : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(profile, insights);

    const completedAt = Date.now();

    return {
      id: `analysis_${input.studentId}_${startedAt}`,
      generatedAt: startedAt,
      profile,
      insights,
      recommendations,
      metadata: {
        analysisDurationMs: completedAt - startedAt,
        signalCount: signals.length,
        archetypeScores: scores,
      },
    };
  }

  /**
   * Quick identity analysis with defaults.
   */
  quickAnalyze(studentId: EntityId, belief: StudentBeliefV3): IdentityAnalysisOutput {
    return this.analyze({ studentId, belief });
  }

  // ========================================================================
  // PROFILE MANAGEMENT
  // ========================================================================

  /**
   * Get stored profile for a student.
   */
  getProfile(studentId: EntityId): IdentityProfile | undefined {
    return this.profiles.get(studentId);
  }

  /**
   * Get all stored profiles.
   */
  getAllProfiles(): IdentityProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Clear stored profile for a student.
   */
  clearProfile(studentId: EntityId): void {
    this.profiles.delete(studentId);
    this.evolutions.delete(studentId);
  }

  // ========================================================================
  // EVOLUTION TRACKING
  // ========================================================================

  /**
   * Get evolution for a student.
   */
  getEvolution(studentId: EntityId): IdentityEvolution | undefined {
    return this.evolutions.get(studentId);
  }

  /**
   * Update evolution tracking.
   */
  private updateEvolution(
    studentId: EntityId,
    scores: Record<IdentityArchetypeId, number>,
    beliefHistory?: StudentBeliefV3[]
  ): IdentityEvolution {
    const now = Date.now();
    let evolution = this.evolutions.get(studentId);

    // Create new evolution if none exists
    if (!evolution) {
      evolution = {
        id: `evolution_${studentId}_${now}`,
        studentId,
        startedAt: now,
        lastUpdatedAt: now,
        snapshots: [],
        primaryIdentityHistory: [],
        transitions: [],
        pattern: 'stable-consistent',
        trajectory: 'stable',
      };
    }

    // Add current snapshot
    const topArchetype = this.getTopArchetype(scores);
    const snapshot: IdentitySnapshot = {
      id: `snapshot_${studentId}_${now}`,
      timestamp: now,
      archetypeScores: { ...scores },
      primaryIdentity: topArchetype,
      confidence: topArchetype ? scores[topArchetype] : 0.5,
    };

    evolution.snapshots.push(snapshot);
    evolution.lastUpdatedAt = now;

    // Update primary identity history
    if (topArchetype) {
      evolution.primaryIdentityHistory.push({
        timestamp: now,
        identity: topArchetype,
        confidence: scores[topArchetype],
      });
    }

    // Process historical beliefs if provided
    if (beliefHistory && beliefHistory.length > 0) {
      for (const belief of beliefHistory) {
        // Skip if already processed (based on timestamp)
        const alreadyProcessed = evolution.snapshots.some(s => 
          Math.abs(s.timestamp - belief.timestamp) < 1000
        );
        
        if (!alreadyProcessed) {
          const historicalSignals = extractSignalsFromBelief(belief, this.config);
          const historicalScores = calculateArchetypeScores(historicalSignals, this.config);
          const historicalTop = this.getTopArchetype(historicalScores);

          const historicalSnapshot: IdentitySnapshot = {
            id: `snapshot_${studentId}_${belief.timestamp}`,
            timestamp: belief.timestamp,
            archetypeScores: historicalScores,
            primaryIdentity: historicalTop,
            confidence: historicalTop ? historicalScores[historicalTop] : 0.5,
            context: `belief_v${belief.version}`,
          };

          evolution.snapshots.push(historicalSnapshot);

          if (historicalTop) {
            evolution.primaryIdentityHistory.push({
              timestamp: belief.timestamp,
              identity: historicalTop,
              confidence: historicalScores[historicalTop],
            });
          }
        }
      }

      // Sort snapshots chronologically
      evolution.snapshots.sort((a, b) => a.timestamp - b.timestamp);
      evolution.primaryIdentityHistory.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Detect transitions
    evolution.transitions = detectTransitions(evolution.snapshots);

    // Determine pattern
    if (evolution.snapshots.length >= this.config.minSnapshotsForEvolution) {
      evolution.pattern = determineEvolutionPattern(evolution.snapshots);
    }

    // Determine trajectory
    evolution.trajectory = this.determineTrajectory(evolution);

    // Store updated evolution
    this.evolutions.set(studentId, evolution);

    return evolution;
  }

  /**
   * Determine trajectory from evolution.
   */
  private determineTrajectory(evolution: IdentityEvolution): IdentityEvolution['trajectory'] {
    if (evolution.snapshots.length < 2) return 'stable';

    const first = evolution.snapshots[0];
    const last = evolution.snapshots[evolution.snapshots.length - 1];

    const firstTop = this.getTopArchetype(first.archetypeScores);
    const lastTop = this.getTopArchetype(last.archetypeScores);

    // Check for consolidation (same identity, stronger)
    if (firstTop && lastTop && firstTop === lastTop) {
      if (last.archetypeScores[lastTop] > first.archetypeScores[firstTop] + 0.1) {
        return 'consolidating';
      }
      return 'stable';
    }

    // Check for shift
    if (firstTop && lastTop && firstTop !== lastTop) {
      return 'shifting';
    }

    // Check for expanding (multiple strong identities)
    const strongLast = Object.values(last.archetypeScores).filter(s => s > 0.5).length;
    const strongFirst = Object.values(first.archetypeScores).filter(s => s > 0.5).length;
    if (strongLast > strongFirst) {
      return 'expanding';
    }

    // Check for exploring (multiple transitions)
    if (evolution.transitions.length >= 2) {
      return 'exploring';
    }

    return 'stable';
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Get top archetype from scores.
   */
  private getTopArchetype(scores: Record<IdentityArchetypeId, number>): IdentityArchetypeId | undefined {
    const entries = Object.entries(scores);
    if (entries.length === 0) return undefined;
    
    return entries.sort((a, b) => b[1] - a[1])[0][0] as IdentityArchetypeId;
  }

  /**
   * Calculate overall confidence.
   */
  private calculateOverallConfidence(
    confidences: Record<IdentityArchetypeId, IdentityConfidence>
  ): number {
    const scores = Object.values(confidences).map(c => c.score);
    if (scores.length === 0) return 0;
    
    // Weight by score (higher archetype scores contribute more to confidence)
    const weightedSum = Object.entries(confidences).reduce((sum, [archetypeId, conf]) => {
      const archetypeScore = confidences[archetypeId as IdentityArchetypeId]?.score ?? 0;
      return sum + conf.score * (0.5 + archetypeScore * 0.5);
    }, 0);
    
    return weightedSum / scores.length;
  }

  /**
   * Generate recommendations based on profile.
   */
  private generateRecommendations(
    profile: IdentityProfile,
    insights: IdentityInsight[]
  ): IdentityRecommendation[] {
    const recommendations: IdentityRecommendation[] = [];

    // Recommendation based on status
    switch (profile.status) {
      case 'emerging':
        if (profile.primaryIdentity) {
          recommendations.push({
            id: `rec_emerging_${Date.now()}`,
            area: 'exploration',
            recommendation: `Explore activities that reinforce ${ARCHETYPE_DISPLAY_NAMES[profile.primaryIdentity]} identity`,
            rationale: `${profile.primaryIdentity} identity is emerging. Structured exploration can help it develop.`,
            relatedArchetypes: [profile.primaryIdentity],
            priority: 'high',
          });
        }
        break;

      case 'conflicted':
        recommendations.push({
          id: `rec_conflicted_${Date.now()}`,
          area: 'resolution',
          recommendation: 'Work through identity conflicts by experimenting with different roles',
          rationale: 'Multiple competing identities detected. Real-world experimentation can help clarify which identity resonates most.',
          relatedArchetypes: profile.secondaryIdentities.slice(0, 2),
          priority: 'high',
        });
        break;

      case 'unclear':
        recommendations.push({
          id: `rec_unclear_${Date.now()}`,
          area: 'exploration',
          recommendation: 'Engage in diverse experiences to discover identity signals',
          rationale: 'Identity is unclear. Exposure to varied experiences will help reveal underlying patterns.',
          relatedArchetypes: [],
          priority: 'medium',
        });
        break;

      case 'stable':
        if (profile.primaryIdentity) {
          recommendations.push({
            id: `rec_stable_${Date.now()}`,
            area: 'development',
            recommendation: `Deepen ${ARCHETYPE_DISPLAY_NAMES[profile.primaryIdentity]} identity through mastery experiences`,
            rationale: 'Identity is well-established. Focus on developing expertise and depth.',
            relatedArchetypes: [profile.primaryIdentity],
            priority: 'medium',
          });
        }
        break;
    }

    // Recommendations based on insights
    const emergingInsight = insights.find(i => i.type === 'emerging-identity');
    if (emergingInsight && !recommendations.some(r => r.area === 'exploration')) {
      recommendations.push({
        id: `rec_emerging_insight_${Date.now()}`,
        area: 'exploration',
        recommendation: `Investigate emerging ${emergingInsight.relatedArchetypes[0]} identity through small experiments`,
        rationale: emergingInsight.description,
        relatedArchetypes: emergingInsight.relatedArchetypes,
        priority: 'medium',
      });
    }

    // Recommendations based on conflicts
    for (const conflict of profile.conflicts.slice(0, 2)) {
      recommendations.push({
        id: `rec_conflict_${conflict.id}_${Date.now()}`,
        area: 'decision',
        recommendation: `Address tension between ${ARCHETYPE_DISPLAY_NAMES[conflict.identityA]} and ${ARCHETYPE_DISPLAY_NAMES[conflict.identityB]}`,
        rationale: conflict.description,
        relatedArchetypes: [conflict.identityA, conflict.identityB],
        priority: conflict.severity > 0.7 ? 'high' : 'medium',
      });
    }

    return recommendations;
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate human-readable report.
   */
  generateReport(output: IdentityAnalysisOutput): string {
    const { profile, insights, recommendations } = output;
    const lines: string[] = [];

    lines.push('=== Identity Development Report ===');
    lines.push('');

    lines.push(`Student: ${profile.studentId}`);
    lines.push(`Generated: ${new Date(profile.generatedAt).toISOString()}`);
    lines.push(`Overall Confidence: ${(profile.overallConfidence * 100).toFixed(0)}%`);
    lines.push('');

    // Primary Identity
    lines.push('Primary Identity:');
    if (profile.primaryIdentity) {
      const def = this.getArchetypeDefinition(profile.primaryIdentity);
      lines.push(`  ${ARCHETYPE_DISPLAY_NAMES[profile.primaryIdentity]} (${profile.archetypeScores[profile.primaryIdentity].toFixed(2)})`);
      if (def) {
        lines.push(`  ${def.description}`);
      }
    } else {
      lines.push('  No clear primary identity detected');
    }
    lines.push('');

    // Status
    lines.push(`Identity Status: ${profile.status}`);
    lines.push('');

    // Secondary Identities
    if (profile.secondaryIdentities.length > 0) {
      lines.push('Secondary Identities:');
      for (const id of profile.secondaryIdentities.slice(0, 3)) {
        lines.push(`  - ${ARCHETYPE_DISPLAY_NAMES[id]} (${profile.archetypeScores[id].toFixed(2)})`);
      }
      lines.push('');
    }

    // Top Scores
    lines.push('All Identity Scores:');
    const sortedScores = Object.entries(profile.archetypeScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [id, score] of sortedScores) {
      const marker = id === profile.primaryIdentity ? '*' : ' ';
      lines.push(`  ${marker} ${ARCHETYPE_DISPLAY_NAMES[id as IdentityArchetypeId]}: ${score.toFixed(2)}`);
    }
    lines.push('');

    // Conflicts
    if (profile.conflicts.length > 0) {
      lines.push(`Conflicts Detected (${profile.conflicts.length}):`);
      for (const conflict of profile.conflicts) {
        lines.push(`  - ${ARCHETYPE_DISPLAY_NAMES[conflict.identityA]} vs ${ARCHETYPE_DISPLAY_NAMES[conflict.identityB]} (${(conflict.severity * 100).toFixed(0)}%)`);
      }
      lines.push('');
    }

    // Evolution
    if (profile.evolution) {
      lines.push('Evolution:');
      lines.push(`  Pattern: ${profile.evolution.pattern}`);
      lines.push(`  Trajectory: ${profile.evolution.trajectory}`);
      lines.push(`  Snapshots: ${profile.evolution.snapshots.length}`);
      if (profile.evolution.transitions.length > 0) {
        lines.push(`  Transitions: ${profile.evolution.transitions.length}`);
      }
      lines.push('');
    }

    // Insights
    if (insights.length > 0) {
      lines.push(`Insights (${insights.length}):`);
      for (const insight of insights) {
        lines.push(`  • ${insight.description}`);
      }
      lines.push('');
    }

    // Recommendations
    if (recommendations.length > 0) {
      lines.push(`Recommendations (${recommendations.length}):`);
      for (const rec of recommendations) {
        lines.push(`  [${rec.priority.toUpperCase()}] ${rec.recommendation}`);
      }
    }

    return lines.join('\n');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new IdentityDevelopmentEngine instance.
 */
export function createIdentityDevelopmentEngine(
  config?: Partial<IdentityDevelopmentConfig>
): IdentityDevelopmentEngine {
  return new IdentityDevelopmentEngine(config);
}

/**
 * Quick identity analysis with default settings.
 */
export function quickIdentityAnalysis(
  studentId: EntityId,
  belief: StudentBeliefV3
): IdentityAnalysisOutput {
  const engine = new IdentityDevelopmentEngine();
  return engine.quickAnalyze(studentId, belief);
}

/**
 * Get archetype definition by ID.
 */
export function getArchetypeDefinition(
  id: IdentityArchetypeId
): ArchetypeDefinition | undefined {
  return ARCHETYPE_DEFINITIONS.find(d => d.id === id);
}

/**
 * Get display name for archetype.
 */
export function getArchetypeDisplayName(id: IdentityArchetypeId): string {
  return ARCHETYPE_DISPLAY_NAMES[id] || id;
}
