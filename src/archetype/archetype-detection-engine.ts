/**
 * CareerOS Archetype Detection Engine
 *
 * Phase 1.2: Archetype Detection Engine
 *
 * Main orchestrator for detecting student archetypes.
 *
 * @module archetype-detection-engine
 * @version 1.0.0
 */

import type {
  ArchetypeProfile,
  ArchetypeType,
} from '@/types/archetype-profile';
import type {
  ArchetypeDetectionInput,
  ArchetypeDetectionResult,
  ArchetypeSignalCollection,
  ArchetypeScoringConfig,
  DetectionAnalysis,
} from './archetype-types';

import { ArchetypeMapper, createArchetypeMapper } from './archetype-mapper';
import {
  ArchetypeCalculator,
  createArchetypeCalculator,
  createSignalCollection,
} from './archetype-calculator';
import {
  DEFAULT_ARCHETYPE_SCORING_CONFIG,
  ALL_ARCHETYPE_TYPES,
  hasSufficientData,
} from './archetype-types';

/**
 * Main Archetype Detection Engine.
 *
 * Orchestrates the detection of career archetypes from student data.
 */
export class ArchetypeDetectionEngine {
  /** Signal mapper */
  private mapper: ArchetypeMapper;

  /** Score calculator */
  private calculator: ArchetypeCalculator;

  /** Scoring configuration */
  private config: ArchetypeScoringConfig;

  /**
   * Creates a new ArchetypeDetectionEngine.
   *
   * @param config - Scoring configuration
   */
  constructor(config: ArchetypeScoringConfig) {
    this.config = config;
    this.mapper = createArchetypeMapper();
    this.calculator = createArchetypeCalculator(config);
  }

  /**
   * Detects archetypes for a student.
   *
   * @param input - Detection input
   * @returns Detection result
   */
  detectArchetypes(input: ArchetypeDetectionInput): ArchetypeDetectionResult {
    try {
      // Validate sufficient data
      if (!hasSufficientData(input)) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: 'Insufficient data to determine archetypes',
        };
      }

      // Map inputs to signals
      const signalCollections = this.mapper.mapToSignals(input);

      // Ensure all archetypes have collections (even if empty)
      const completeCollections = this.ensureAllArchetypes(signalCollections);

      // Calculate scores
      const scores = this.calculator.calculateScores(completeCollections);

      // Validate scores
      const validation = this.calculator.validateScores(scores);
      if (!validation.valid) {
        return {
          success: false,
          error: 'LOW_CONFIDENCE',
          errorMessage: validation.reason,
        };
      }

      // Determine primary and secondary
      const { primary, secondary } =
        this.calculator.determinePrimarySecondary(scores);

      // Calculate confidence
      const confidence = this.calculator.calculateOverallConfidence(scores);

      // Build archetype profile
      const profile: ArchetypeProfile = {
        profileId: input.profileId,
        primaryArchetype: primary,
        secondaryArchetype: secondary,
        archetypeScores: scores,
        confidence,
        assessedAt: new Date(),
      };

      // Generate detection analysis
      const analysis = this.generateAnalysis(completeCollections, scores);

      return {
        success: true,
        profile,
        signalCollections: completeCollections,
      };
    } catch (error) {
      return {
        success: false,
        error: 'CALCULATION_ERROR',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Ensures all archetypes have signal collections.
   *
   * @param collections - Existing collections
   * @returns Complete collections for all archetypes
   */
  private ensureAllArchetypes(
    collections: ArchetypeSignalCollection[]
  ): ArchetypeSignalCollection[] {
    const existingArchetypes = new Set(
      collections.map((c) => c.archetype)
    );

    const complete: ArchetypeSignalCollection[] = [...collections];

    // Add empty collections for missing archetypes
    for (const archetype of ALL_ARCHETYPE_TYPES) {
      if (!existingArchetypes.has(archetype)) {
        complete.push(createSignalCollection(archetype, []));
      }
    }

    return complete;
  }

  /**
   * Generates detection analysis metadata.
   *
   * @param collections - Signal collections
   * @param scores - Archetype scores
   * @returns Detection analysis
   */
  private generateAnalysis(
    collections: ArchetypeSignalCollection[],
    scores: import('@/types/archetype-profile').ArchetypeScore[]
  ): DetectionAnalysis {
    const totalSignals = collections.reduce(
      (sum, c) => sum + c.signals.length,
      0
    );

    // Count by source
    const signalsBySource: Record<
      import('./archetype-types').SignalSource,
      number
    > = {
      COGNITIVE_ASSESSMENT: 0,
      INTEREST_ASSESSMENT: 0,
      VALUE_ASSESSMENT: 0,
      BEHAVIORAL_ASSESSMENT: 0,
      STRENGTH_ASSESSMENT: 0,
      PREFERENCE_ASSESSMENT: 0,
      PROFILE_INSIGHT: 0,
      DEMOGRAPHIC: 0,
    };

    for (const collection of collections) {
      for (const [source, count] of Object.entries(
        collection.signalCountBySource
      )) {
        signalsBySource[source as import('./archetype-types').SignalSource] +=
          count;
      }
    }

    // Calculate consistency
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const topScore = sortedScores[0]?.score ?? 0;
    const secondScore = sortedScores[1]?.score ?? 0;
    const scoreGap = topScore - secondScore;
    const signalConsistency = Math.min(100, scoreGap * 2 + 50);

    // Calculate coverage
    const archetypesWithSignals = collections.filter(
      (c) => c.signals.length > 0
    ).length;
    const coverageScore = Math.round(
      (archetypesWithSignals / ALL_ARCHETYPE_TYPES.length) * 100
    );

    // Calculate evidence strength
    const evidenceStrength = Math.min(
      100,
      totalSignals * 5 + coverageScore / 2
    );

    return {
      totalSignals,
      signalsBySource,
      signalConsistency,
      coverageScore,
      evidenceStrength,
      triggeredRules: [],
    };
  }

  /**
   * Gets archetype scores for a specific archetype.
   *
   * @param result - Detection result
   * @param archetype - Archetype to find
   * @returns Score or undefined
   */
  getArchetypeScore(
    result: ArchetypeDetectionResult,
    archetype: ArchetypeType
  ): import('@/types/archetype-profile').ArchetypeScore | undefined {
    if (!result.success || !result.profile) {
      return undefined;
    }

    return result.profile.archetypeScores.find(
      (s) => s.archetype === archetype
    );
  }

  /**
   * Gets signals for a specific archetype.
   *
   * @param result - Detection result
   * @param archetype - Archetype to find
   * @returns Signal collection or undefined
   */
  getArchetypeSignals(
    result: ArchetypeDetectionResult,
    archetype: ArchetypeType
  ): ArchetypeSignalCollection | undefined {
    if (!result.success || !result.signalCollections) {
      return undefined;
    }

    return result.signalCollections.find((c) => c.archetype === archetype);
  }

  /**
   * Gets top N archetypes by score.
   *
   * @param result - Detection result
   * @param count - Number to return
   * @returns Top archetypes
   */
  getTopArchetypes(
    result: ArchetypeDetectionResult,
    count: number
  ): import('@/types/archetype-profile').ArchetypeScore[] {
    if (!result.success || !result.profile) {
      return [];
    }

    return [...result.profile.archetypeScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Compares two archetype profiles.
   *
   * @param profile1 - First profile
   * @param profile2 - Second profile
   * @returns Similarity score (0-100)
   */
  compareProfiles(
    profile1: ArchetypeProfile,
    profile2: ArchetypeProfile
  ): number {
    let similarity = 0;

    // Primary match
    if (profile1.primaryArchetype === profile2.primaryArchetype) {
      similarity += 40;
    }

    // Secondary match
    if (
      profile1.secondaryArchetype &&
      profile2.secondaryArchetype &&
      profile1.secondaryArchetype === profile2.secondaryArchetype
    ) {
      similarity += 20;
    }

    // Cross match (primary matches secondary)
    if (
      profile1.primaryArchetype === profile2.secondaryArchetype ||
      profile2.primaryArchetype === profile1.secondaryArchetype
    ) {
      similarity += 15;
    }

    // Score correlation
    const scoreDiffs = profile1.archetypeScores.map((s1) => {
      const s2 = profile2.archetypeScores.find(
        (s) => s.archetype === s1.archetype
      );
      if (!s2) return 100;
      return Math.abs(s1.score - s2.score);
    });

    const avgDiff =
      scoreDiffs.reduce((sum, d) => sum + d, 0) / scoreDiffs.length;
    similarity += Math.max(0, 25 - avgDiff / 4);

    return Math.round(Math.min(100, similarity));
  }

  /**
   * Gets the engine configuration.
   *
   * @returns Current configuration
   */
  getConfig(): ArchetypeScoringConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<ArchetypeScoringConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculator = createArchetypeCalculator(this.config);
  }
}

/**
 * Creates a default archetype detection engine.
 *
 * @param config - Optional custom configuration
 * @returns Configured engine
 */
export function createArchetypeDetectionEngine(
  config?: Partial<ArchetypeScoringConfig>
): ArchetypeDetectionEngine {
  const fullConfig: ArchetypeScoringConfig = {
    ...DEFAULT_ARCHETYPE_SCORING_CONFIG,
    ...config,
  };

  return new ArchetypeDetectionEngine(fullConfig);
}

/**
 * Quick detect function for simple use cases.
 *
 * @param input - Detection input
 * @param config - Optional configuration
 * @returns Detection result
 */
export function detectArchetypes(
  input: ArchetypeDetectionInput,
  config?: Partial<ArchetypeScoringConfig>
): ArchetypeDetectionResult {
  const engine = createArchetypeDetectionEngine(config);
  return engine.detectArchetypes(input);
}

/**
 * Default exports for the archetype detection module.
 */
export { ArchetypeMapper, createArchetypeMapper } from './archetype-mapper';
export {
  ArchetypeCalculator,
  createArchetypeCalculator,
} from './archetype-calculator';
export * from './archetype-types';
