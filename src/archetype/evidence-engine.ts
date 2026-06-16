/**
 * CareerOS Archetype Confidence Engine - Evidence Engine
 *
 * Phase 1.3: Archetype Confidence Engine
 *
 * Tracks evidence count, quality, and diversity for archetype assignments.
 *
 * @module evidence-engine
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type { ArchetypeSignal, SignalSource } from './archetype-types';
import type {
  EvidenceItem,
  EvidenceCollection,
  EvidenceQuality,
} from './confidence-types';
import {
  EVIDENCE_QUALITY_WEIGHTS,
  calculateEvidenceQuality,
  ALL_SIGNAL_SOURCES,
} from './confidence-types';

/**
 * Evidence Engine for tracking and analyzing archetype evidence.
 */
export class EvidenceEngine {
  /**
   * Converts signals to evidence items.
   *
   * @param signals - Archetype signals
   * @returns Evidence items
   */
  signalsToEvidence(signals: ArchetypeSignal[]): EvidenceItem[] {
    return signals.map((signal, index) => ({
      evidenceId: `evidence-${signal.archetype}-${index}-${Date.now()}`,
      archetype: signal.archetype,
      source: signal.source,
      quality: calculateEvidenceQuality(signal),
      strength: signal.strength,
      description: signal.description,
      collectedAt: new Date(),
    }));
  }

  /**
   * Creates evidence collections grouped by archetype.
   *
   * @param evidence - All evidence items
   * @returns Evidence collections
   */
  createCollections(evidence: EvidenceItem[]): EvidenceCollection[] {
    const grouped = this.groupByArchetype(evidence);

    return Array.from(grouped.entries()).map(([archetype, items]) =>
      this.createCollection(archetype, items)
    );
  }

  /**
   * Creates a single evidence collection.
   *
   * @param archetype - The archetype
   * @param items - Evidence items
   * @returns Evidence collection
   */
  private createCollection(
    archetype: ArchetypeType,
    items: EvidenceItem[]
  ): EvidenceCollection {
    const countByQuality = this.countByQuality(items);
    const countBySource = this.countBySource(items);
    const totalStrength = items.reduce((sum, item) => sum + item.strength, 0);
    const weightedScore = this.calculateWeightedScore(items);

    return {
      archetype,
      items,
      countByQuality,
      countBySource,
      totalStrength,
      weightedScore,
    };
  }

  /**
   * Groups evidence by archetype.
   *
   * @param evidence - Evidence items
   * @returns Grouped evidence
   */
  private groupByArchetype(
    evidence: EvidenceItem[]
  ): Map<ArchetypeType, EvidenceItem[]> {
    const grouped = new Map<ArchetypeType, EvidenceItem[]>();

    for (const item of evidence) {
      const existing = grouped.get(item.archetype) ?? [];
      existing.push(item);
      grouped.set(item.archetype, existing);
    }

    return grouped;
  }

  /**
   * Counts evidence by quality tier.
   *
   * @param items - Evidence items
   * @returns Count by quality
   */
  private countByQuality(
    items: EvidenceItem[]
  ): Record<EvidenceQuality, number> {
    const counts: Record<EvidenceQuality, number> = {
      STRONG: 0,
      MODERATE: 0,
      WEAK: 0,
      ANECDOTAL: 0,
    };

    for (const item of items) {
      counts[item.quality]++;
    }

    return counts;
  }

  /**
   * Counts evidence by source.
   *
   * @param items - Evidence items
   * @returns Count by source
   */
  private countBySource(
    items: EvidenceItem[]
  ): Record<SignalSource, number> {
    const counts = {} as Record<SignalSource, number>;

    for (const source of ALL_SIGNAL_SOURCES) {
      counts[source] = 0;
    }

    for (const item of items) {
      counts[item.source]++;
    }

    return counts;
  }

  /**
   * Calculates weighted evidence score.
   *
   * @param items - Evidence items
   * @returns Weighted score
   */
  private calculateWeightedScore(items: EvidenceItem[]): number {
    if (items.length === 0) return 0;

    const weightedSum = items.reduce((sum, item) => {
      const qualityWeight = EVIDENCE_QUALITY_WEIGHTS[item.quality];
      return sum + item.strength * qualityWeight;
    }, 0);

    return weightedSum / items.length;
  }

  /**
   * Calculates evidence diversity score.
   *
   * Measures how diverse evidence sources are.
   *
   * @param collection - Evidence collection
   * @returns Diversity score (0-100)
   */
  calculateDiversityScore(collection: EvidenceCollection): number {
    const sourceCounts = Object.values(collection.countBySource);
    const totalSources = sourceCounts.length;
    const sourcesWithEvidence = sourceCounts.filter((c) => c > 0).length;

    if (sourcesWithEvidence === 0) return 0;

    // Base score from source coverage
    const coverageScore = (sourcesWithEvidence / totalSources) * 50;

    // Bonus for quality diversity
    const qualityCounts = Object.values(collection.countByQuality);
    const qualityTypes = qualityCounts.filter((c) => c > 0).length;
    const qualityScore = qualityTypes * 12.5;

    return Math.min(100, coverageScore + qualityScore);
  }

  /**
   * Calculates evidence strength score.
   *
   * @param collection - Evidence collection
   * @returns Strength score (0-100)
   */
  calculateStrengthScore(collection: EvidenceCollection): number {
    if (collection.items.length === 0) return 0;

    // Base from weighted score
    let score = collection.weightedScore;

    // Boost for strong evidence
    const strongCount = collection.countByQuality.STRONG;
    score += strongCount * 5;

    // Boost for evidence count (up to reasonable limit)
    const countBonus = Math.min(20, collection.items.length * 2);
    score += countBonus;

    return Math.min(100, score);
  }

  /**
   * Calculates overall evidence score.
   *
   * Combines strength and diversity.
   *
   * @param collection - Evidence collection
   * @returns Overall score (0-100)
   */
  calculateOverallScore(collection: EvidenceCollection): number {
    const strength = this.calculateStrengthScore(collection);
    const diversity = this.calculateDiversityScore(collection);

    // Weight strength more heavily
    return Math.round(strength * 0.6 + diversity * 0.4);
  }

  /**
   * Identifies evidence gaps.
   *
   * @param collections - All evidence collections
   * @returns Missing evidence types
   */
  identifyGaps(collections: EvidenceCollection[]): {
    missingSources: SignalSource[];
    weakArchetypes: ArchetypeType[];
  } {
    const allSources = new Set<SignalSource>();
    const weakArchetypes: ArchetypeType[] = [];

    for (const collection of collections) {
      for (const [source, count] of Object.entries(collection.countBySource)) {
        if (count > 0) {
          allSources.add(source as SignalSource);
        }
      }

      if (collection.items.length < 3) {
        weakArchetypes.push(collection.archetype);
      }
    }

    const missingSources = ALL_SIGNAL_SOURCES.filter(
      (source) => !allSources.has(source)
    );

    return { missingSources, weakArchetypes };
  }

  /**
   * Gets top evidence for an archetype.
   *
   * @param collection - Evidence collection
   * @param count - Number to return
   * @returns Top evidence items
   */
  getTopEvidence(
    collection: EvidenceCollection,
    count: number
  ): EvidenceItem[] {
    return [...collection.items]
      .sort((a, b) => {
        const aWeight = EVIDENCE_QUALITY_WEIGHTS[a.quality] * a.strength;
        const bWeight = EVIDENCE_QUALITY_WEIGHTS[b.quality] * b.strength;
        return bWeight - aWeight;
      })
      .slice(0, count);
  }

  /**
   * Validates evidence sufficiency.
   *
   * @param collection - Evidence collection
   * @returns Validation result
   */
  validateSufficiency(collection: EvidenceCollection): {
    sufficient: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    if (collection.items.length < 3) {
      reasons.push(
        `Insufficient evidence: ${collection.items.length} items (minimum 3)`
      );
    }

    if (collection.countByQuality.STRONG < 1) {
      reasons.push('No strong evidence found');
    }

    const sourceCount = Object.values(collection.countBySource).filter(
      (c) => c > 0
    ).length;
    if (sourceCount < 2) {
      reasons.push(`Insufficient source diversity: ${sourceCount} sources`);
    }

    return {
      sufficient: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Merges evidence collections.
   *
   * @param collections - Collections to merge
   * @returns Merged collection
   */
  mergeCollections(collections: EvidenceCollection[]): EvidenceCollection {
    if (collections.length === 0) {
      throw new Error('Cannot merge empty collections');
    }

    const archetype = collections[0].archetype;

    // Verify all same archetype
    if (!collections.every((c) => c.archetype === archetype)) {
      throw new Error('Cannot merge collections for different archetypes');
    }

    const items = collections.flatMap((c) => c.items);
    return this.createCollection(archetype, items);
  }
}

/**
 * Creates default evidence engine.
 *
 * @returns New EvidenceEngine instance
 */
export function createEvidenceEngine(): EvidenceEngine {
  return new EvidenceEngine();
}

/**
 * Calculates evidence score for archetype.
 *
 * Quick utility function.
 *
 * @param signals - Archetype signals
 * @returns Evidence score (0-100)
 */
export function calculateEvidenceScore(signals: ArchetypeSignal[]): number {
  const engine = createEvidenceEngine();
  const evidence = engine.signalsToEvidence(signals);
  const collection = engine.createCollections(evidence)[0];

  return collection ? engine.calculateOverallScore(collection) : 0;
}
