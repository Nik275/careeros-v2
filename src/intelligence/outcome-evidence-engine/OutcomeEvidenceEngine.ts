/**
 * Outcome Evidence Engine
 *
 * Converts outcome records into evidence for recommendations.
 *
 * Purpose:
 *   Analyze historical outcome data to generate evidence about
 *   which career paths work best for which student profiles.
 *
 * Example:
 *   Students with high curiosity + high autonomy who chose Product Management
 *   reported higher satisfaction than peers who chose Consulting.
 *
 * Design Principles:
 *   - Explainable: Every evidence has clear reasoning
 *   - Evidence-based: Based on actual outcome records
 *   - No black-box: Transparent statistical methods only
 *   - Conservative: Understate confidence rather than overstate
 */

import type { OutcomeRecord } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';
import type { StudentBeliefV3 } from '../types/index.js';
import type {
  OutcomeEvidence,
  OutcomeEvidenceId,
  GenerateEvidenceInput,
  GenerateEvidenceOutput,
  EvidenceQuery,
  EvidenceQueryResult,
  OutcomeGroupComparison,
  TraitFilter,
  OutcomeEvidenceEngineConfig,
  EvidenceDerivationExplanation,
} from './types.js';

import {
  OutcomeEvidenceType,
  EffectDirection,
  EvidenceQuality,
  StatisticalSignificance,
  DEFAULT_CONFIG,
} from './types.js';

import {
  calculateMean,
  calculateStdDev,
  calculateCohensD,
  welchTTest,
  determineSignificance,
  determineDirection,
  calculateConfidenceInterval,
  extractOutcomeValues,
  getSatisfactionScore,
  matchesTraitFilters,
  compareOutcomeGroups,
  calculateEvidenceQuality,
  calculateConsistencyScore,
  calculateConfidenceFromStats,
  calculateDataQuality,
} from './analysis.js';

import {
  generateEvidenceExplanation,
  generateDerivationExplanation,
  generateOneSentenceSummary,
  generateAudienceExplanation,
} from './explanations.js';

// ============================================================================
// OUTCOME EVIDENCE ENGINE
// ============================================================================

/**
 * Engine for generating evidence from outcome records.
 */
export class OutcomeEvidenceEngine {
  private config: OutcomeEvidenceEngineConfig;

  constructor(config: Partial<OutcomeEvidenceEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): OutcomeEvidenceEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<OutcomeEvidenceEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API: GENERATE EVIDENCE
  // ========================================================================

  /**
   * Generate evidence from outcome records.
   *
   * This is the primary API for converting outcomes into evidence.
   */
  generateEvidence(input: GenerateEvidenceInput): GenerateEvidenceOutput {
    const startedAt = Date.now();
    const evidence: OutcomeEvidence[] = [];

    // Filter records by age if needed
    const records = this.filterRecordsByAge(input.records);

    // Determine which evidence types to generate
    const evidenceTypes = input.evidenceTypes || Object.values(OutcomeEvidenceType);

    // Generate each type of evidence
    for (const type of evidenceTypes) {
      const generated = this.generateEvidenceByType(type, records, input);
      evidence.push(...generated);
    }

    // Filter by minimum quality
    const minQuality = input.minQuality || 'insufficient';
    const qualityOrder = ['insufficient', 'low', 'medium', 'high'];
    const minQualityIndex = qualityOrder.indexOf(minQuality);
    const filteredEvidence = evidence.filter(
      (e) => qualityOrder.indexOf(e.quality) >= minQualityIndex
    );

    // Filter by minimum sample size
    const minSampleSize = input.minSampleSize || this.config.minSampleSize;
    const finalEvidence = filteredEvidence.filter(
      (e) => e.statistics.sampleSize >= minSampleSize
    );

    // Sort by confidence
    finalEvidence.sort((a, b) => b.statistics.confidence - a.statistics.confidence);

    const completedAt = Date.now();

    return {
      evidence: finalEvidence,
      evidenceByType: this.groupEvidenceByType(finalEvidence),
      statistics: {
        totalRecordsAnalyzed: records.length,
        totalEvidenceGenerated: finalEvidence.length,
        averageConfidence:
          finalEvidence.reduce((sum, e) => sum + e.statistics.confidence, 0) /
            finalEvidence.length || 0,
        qualityDistribution: this.calculateQualityDistribution(finalEvidence),
      },
      metadata: {
        startedAt,
        completedAt,
        durationMs: completedAt - startedAt,
        parameters: input,
      },
    };
  }

  /**
   * Generate path comparison evidence.
   *
   * Compares outcomes between two career paths for a specific student profile.
   */
  generatePathComparison(
    records: OutcomeRecord[],
    pathA: string,
    pathB: string,
    profileTraits: TraitFilter[],
    outcomeMetrics: string[] = ['satisfaction', 'success']
  ): OutcomeEvidence | null {
    // Filter records by path
    const pathARecords = records.filter(
      (r) => r.chosenPathId === pathA && matchesTraitFilters(r.baselineBelief, profileTraits)
    );
    const pathBRecords = records.filter(
      (r) => r.chosenPathId === pathB && matchesTraitFilters(r.baselineBelief, profileTraits)
    );

    // Check minimum sample size
    if (
      pathARecords.length < this.config.minSampleSize ||
      pathBRecords.length < this.config.minSampleSize
    ) {
      return null;
    }

    // Compare primary metric (satisfaction)
    const satisfactionA = pathARecords
      .map((r) => getSatisfactionScore(r))
      .filter((s): s is number => s !== undefined);
    const satisfactionB = pathBRecords
      .map((r) => getSatisfactionScore(r))
      .filter((s): s is number => s !== undefined);

    if (satisfactionA.length === 0 || satisfactionB.length === 0) {
      return null;
    }

    // Calculate statistics
    const meanA = calculateMean(satisfactionA);
    const meanB = calculateMean(satisfactionB);
    const pValue = welchTTest(satisfactionA, satisfactionB);
    const significance = determineSignificance(pValue);
    const effectSize = calculateCohensD(satisfactionA, satisfactionB);
    const ci = calculateConfidenceInterval(satisfactionA, satisfactionB);
    const direction = determineDirection(meanA, meanB);

    // Calculate quality
    const dataQuality = calculateDataQuality([...pathARecords, ...pathBRecords]);
    const consistency =
      (calculateConsistencyScore(satisfactionA) + calculateConsistencyScore(satisfactionB)) / 2;
    const qualityResult = calculateEvidenceQuality(
      pathARecords.length + pathBRecords.length,
      0.8, // Controlled comparison quality
      dataQuality,
      consistency,
      this.config.sampleSizeThresholds
    );

    // Calculate confidence
    const confidence = calculateConfidenceFromStats(
      pathARecords.length + pathBRecords.length,
      significance,
      Math.abs(effectSize),
      this.config.minSampleSize
    );

    // Generate ID
    const traitHash = profileTraits.map(t => t.trait).join('_');
    const id = this.generateEvidenceId('path_comparison', pathA, pathB, traitHash);

    // Create evidence
    const evidence: OutcomeEvidence = {
      id,
      type: OutcomeEvidenceType.PATH_COMPARISON,
      description: this.generatePathComparisonDescription(
        pathA,
        pathB,
        profileTraits,
        direction,
        Math.abs(meanA - meanB)
      ),
      explanation: '', // Will be generated on demand
      paths: {
        primary: pathA,
        comparison: pathB,
      },
      profile: {
        traits: profileTraits,
      },
      outcome: {
        metric: 'satisfaction',
        direction,
        magnitude: Math.min(1, Math.abs(effectSize) / 0.8),
        measuredDifference: meanA - meanB,
        unit: 'satisfaction_score',
      },
      statistics: {
        sampleSize: pathARecords.length,
        comparisonSampleSize: pathBRecords.length,
        confidence,
        significance,
        effectSize,
        confidenceInterval: ci,
      },
      quality: qualityResult.quality,
      qualityFactors: qualityResult.factors,
      sources: {
        recordIds: [...pathARecords, ...pathBRecords].map((r) => r.id),
        timeRange: this.getTimeRange([...pathARecords, ...pathBRecords]),
      },
      generatedAt: Date.now(),
      version: 1,
      isValidated: false,
    };

    // Generate explanation
    evidence.explanation = generateEvidenceExplanation(evidence);

    return evidence;
  }

  /**
   * Generate trait predictor evidence.
   *
   * Identifies which traits predict success on a given path.
   */
  generateTraitPredictor(
    records: OutcomeRecord[],
    pathId: string,
    traitCategory: string,
    traitName: string,
    outcomeMetric: string = 'satisfaction'
  ): OutcomeEvidence | null {
    // Split records by trait presence
    const highTraitRecords: OutcomeRecord[] = [];
    const lowTraitRecords: OutcomeRecord[] = [];

    for (const record of records) {
      if (record.chosenPathId !== pathId) continue;

      const traitValue = this.extractTraitValue(
        record.baselineBelief,
        traitCategory,
        traitName
      );

      if (traitValue === undefined) continue;

      if (traitValue >= 0.7) {
        highTraitRecords.push(record);
      } else if (traitValue <= 0.4) {
        lowTraitRecords.push(record);
      }
    }

    // Check sample sizes
    if (
      highTraitRecords.length < this.config.minSampleSize ||
      lowTraitRecords.length < this.config.minSampleSize
    ) {
      return null;
    }

    // Extract outcomes
    const outcomesHigh = highTraitRecords
      .map((r) => getSatisfactionScore(r))
      .filter((s): s is number => s !== undefined);
    const outcomesLow = lowTraitRecords
      .map((r) => getSatisfactionScore(r))
      .filter((s): s is number => s !== undefined);

    if (outcomesHigh.length === 0 || outcomesLow.length === 0) {
      return null;
    }

    // Calculate statistics
    const meanHigh = calculateMean(outcomesHigh);
    const meanLow = calculateMean(outcomesLow);
    const pValue = welchTTest(outcomesHigh, outcomesLow);
    const significance = determineSignificance(pValue);
    const effectSize = calculateCohensD(outcomesHigh, outcomesLow);
    const direction = determineDirection(meanHigh, meanLow);

    // Calculate quality
    const dataQuality = calculateDataQuality([...highTraitRecords, ...lowTraitRecords]);
    const consistency =
      (calculateConsistencyScore(outcomesHigh) + calculateConsistencyScore(outcomesLow)) / 2;
    const qualityResult = calculateEvidenceQuality(
      highTraitRecords.length + lowTraitRecords.length,
      0.7, // Observational quality
      dataQuality,
      consistency,
      this.config.sampleSizeThresholds
    );

    // Calculate confidence
    const confidence = calculateConfidenceFromStats(
      highTraitRecords.length + lowTraitRecords.length,
      significance,
      Math.abs(effectSize),
      this.config.minSampleSize
    );

    // Create trait filter
    const traitFilter: TraitFilter = {
      category: traitCategory,
      trait: traitName,
      level: 'high',
    };

    // Generate ID
    const id = this.generateEvidenceId('trait_predictor', pathId, traitName);

    const evidence: OutcomeEvidence = {
      id,
      type: OutcomeEvidenceType.TRAIT_PREDICTOR,
      description: `High ${traitName} predicts ${direction === EffectDirection.POSITIVE ? 'better' : 'worse'} ${outcomeMetric} on ${pathId}`,
      explanation: '',
      paths: {
        primary: pathId,
      },
      profile: {
        traits: [traitFilter],
      },
      outcome: {
        metric: outcomeMetric,
        direction,
        magnitude: Math.min(1, Math.abs(effectSize) / 0.8),
        measuredDifference: meanHigh - meanLow,
      },
      statistics: {
        sampleSize: highTraitRecords.length,
        comparisonSampleSize: lowTraitRecords.length,
        confidence,
        significance,
        effectSize,
      },
      quality: qualityResult.quality,
      qualityFactors: qualityResult.factors,
      sources: {
        recordIds: [...highTraitRecords, ...lowTraitRecords].map((r) => r.id),
        timeRange: this.getTimeRange([...highTraitRecords, ...lowTraitRecords]),
      },
      generatedAt: Date.now(),
      version: 1,
      isValidated: false,
    };

    evidence.explanation = generateEvidenceExplanation(evidence);

    return evidence;
  }

  // ========================================================================
  // EVIDENCE QUERY
  // ========================================================================

  /**
   * Query evidence for a specific student and path.
   *
   * Finds evidence most relevant to a student's decision context.
   */
  queryEvidence(evidence: OutcomeEvidence[], query: EvidenceQuery): EvidenceQueryResult[] {
    const results: EvidenceQueryResult[] = [];

    for (const item of evidence) {
      // Check path match
      if (query.pathId && item.paths.primary !== query.pathId) {
        continue;
      }

      // Check comparison path
      if (query.comparisonPathId && item.paths.comparison !== query.comparisonPathId) {
        continue;
      }

      // Check evidence types
      if (query.evidenceTypes && !query.evidenceTypes.includes(item.type)) {
        continue;
      }

      // Check quality
      if (query.minQuality) {
        const qualityOrder = ['insufficient', 'low', 'medium', 'high'];
        if (qualityOrder.indexOf(item.quality) < qualityOrder.indexOf(query.minQuality)) {
          continue;
        }
      }

      // Check confidence
      if (query.minConfidence && item.statistics.confidence < query.minConfidence) {
        continue;
      }

      // Check sample size
      if (query.minSampleSize && item.statistics.sampleSize < query.minSampleSize) {
        continue;
      }

      // Calculate relevance for student profile
      let relevanceScore = 0;
      const matchedTraits: string[] = [];

      if (query.studentProfile) {
        for (const trait of item.profile.traits) {
          const traitValue = this.extractTraitValue(
            query.studentProfile,
            trait.category,
            trait.trait
          );

          if (traitValue !== undefined) {
            const targetLevel =
              typeof trait.level === 'string'
                ? trait.level === 'high'
                  ? 0.7
                  : trait.level === 'medium'
                    ? 0.5
                    : 0.3
                : (trait.level.min + trait.level.max) / 2;

            const matchScore = 1 - Math.abs(traitValue - targetLevel);
            relevanceScore += matchScore;
            matchedTraits.push(trait.trait);
          }
        }

        relevanceScore =
          item.profile.traits.length > 0 ? relevanceScore / item.profile.traits.length : 0.5;
      } else {
        relevanceScore = 0.5;
      }

      // Boost relevance based on evidence quality
      relevanceScore *= item.statistics.confidence;

      results.push({
        evidence: item,
        relevanceScore,
        matchedTraits,
        applicability: {
          score: relevanceScore,
          explanation: `Matches ${matchedTraits.length} of ${item.profile.traits.length} profile traits`,
        },
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    const limit = query.limit || results.length;
    return results.slice(0, limit);
  }

  // ========================================================================
  // EXPLANATION API
  // ========================================================================

  /**
   * Get detailed explanation for evidence.
   */
  explainEvidence(evidence: OutcomeEvidence): string {
    return generateEvidenceExplanation(evidence);
  }

  /**
   * Get derivation explanation showing step-by-step reasoning.
   */
  explainDerivation(
    comparison: OutcomeGroupComparison,
    evidenceType: OutcomeEvidenceType
  ): EvidenceDerivationExplanation {
    return generateDerivationExplanation(comparison, evidenceType);
  }

  /**
   * Get one-sentence summary.
   */
  summarizeEvidence(evidence: OutcomeEvidence): string {
    return generateOneSentenceSummary(evidence);
  }

  /**
   * Get explanation tailored to specific audience.
   */
  explainForAudience(
    evidence: OutcomeEvidence,
    audience: 'student' | 'counselor' | 'researcher'
  ): string {
    return generateAudienceExplanation(evidence, audience);
  }

  // ========================================================================
  // PRIVATE HELPERS
  // ========================================================================

  /**
   * Generate evidence by type.
   */
  private generateEvidenceByType(
    type: OutcomeEvidenceType,
    records: OutcomeRecord[],
    input: GenerateEvidenceInput
  ): OutcomeEvidence[] {
    const evidence: OutcomeEvidence[] = [];

    switch (type) {
      case OutcomeEvidenceType.PATH_COMPARISON:
        if (input.pathComparison) {
          const item = this.generatePathComparison(
            records,
            input.pathComparison.pathA,
            input.pathComparison.pathB,
            input.profileFilter?.traits || [],
            input.outcomeMetrics
          );
          if (item) evidence.push(item);
        }
        break;

      case OutcomeEvidenceType.TRAIT_PREDICTOR:
        // Generate for common trait categories
        const traitsToAnalyze = [
          { category: 'motivation', name: 'autonomy' },
          { category: 'motivation', name: 'impact' },
          { category: 'personality', name: 'openness' },
          { category: 'value', name: 'work_life_balance' },
        ];

        const uniquePaths = [...new Set(records.map((r) => r.chosenPathId))];
        for (const path of uniquePaths) {
          for (const trait of traitsToAnalyze) {
            const item = this.generateTraitPredictor(
              records,
              path,
              trait.category,
              trait.name,
              'satisfaction'
            );
            if (item) evidence.push(item);
          }
        }
        break;

      // Add other evidence types as needed
      default:
        break;
    }

    return evidence;
  }

  /**
   * Filter records by age.
   */
  private filterRecordsByAge(records: OutcomeRecord[]): OutcomeRecord[] {
    const cutoff = Date.now() - this.config.maxRecordAge;
    return records.filter((r) => r.metadata.createdAt >= cutoff);
  }

  /**
   * Group evidence by type.
   */
  private groupEvidenceByType(evidence: OutcomeEvidence[]): Map<OutcomeEvidenceType, OutcomeEvidence[]> {
    const grouped = new Map<OutcomeEvidenceType, OutcomeEvidence[]>();

    for (const item of evidence) {
      const existing = grouped.get(item.type) || [];
      existing.push(item);
      grouped.set(item.type, existing);
    }

    return grouped;
  }

  /**
   * Calculate quality distribution.
   */
  private calculateQualityDistribution(
    evidence: OutcomeEvidence[]
  ): Map<EvidenceQuality, number> {
    const distribution = new Map<EvidenceQuality, number>();
    distribution.set(EvidenceQuality.HIGH, 0);
    distribution.set(EvidenceQuality.MEDIUM, 0);
    distribution.set(EvidenceQuality.LOW, 0);
    distribution.set(EvidenceQuality.INSUFFICIENT, 0);

    for (const item of evidence) {
      const current = distribution.get(item.quality) || 0;
      distribution.set(item.quality, current + 1);
    }

    return distribution;
  }

  /**
   * Generate unique evidence ID.
   */
  private generateEvidenceId(...parts: string[]): OutcomeEvidenceId {
    const hash = parts
      .join('_')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    return `ev_${hash}_${Date.now()}`;
  }

  /**
   * Generate path comparison description.
   */
  private generatePathComparisonDescription(
    pathA: string,
    pathB: string,
    traits: TraitFilter[],
    direction: EffectDirection,
    difference: number
  ): string {
    const traitDesc = traits.length > 0 ? `with ${traits.map((t) => t.trait).join(', ')} ` : '';
    const advantage = direction === EffectDirection.POSITIVE ? 'outperforms' : 'underperforms';

    return `Students ${traitDesc}who chose ${pathA} ${advantage} those who chose ${pathB} by ${Math.abs(difference).toFixed(2)} satisfaction points`;
  }

  /**
   * Extract trait value from student belief.
   */
  private extractTraitValue(
    belief: StudentBeliefV3,
    category: string,
    trait: string
  ): number | undefined {
    switch (category) {
      case 'motivation':
        const motivation = belief.motivations.find(
          (m) => m.name.toLowerCase() === trait.toLowerCase()
        );
        return motivation?.strength;

      case 'personality':
        const personality = belief.personalityTraits.find(
          (p) => p.name.toLowerCase() === trait.toLowerCase()
        );
        return personality ? (personality.position + 1) / 2 : undefined;

      case 'value':
        const value = belief.values.find((v) => v.name.toLowerCase() === trait.toLowerCase());
        return value?.importance;

      case 'strength':
        const strength = belief.strengths.find(
          (s) => s.name.toLowerCase() === trait.toLowerCase()
        );
        return strength?.level;

      default:
        return undefined;
    }
  }

  /**
   * Get time range from records.
   */
  private getTimeRange(records: OutcomeRecord[]): { start: number; end: number } {
    const timestamps = records.map((r) => r.metadata.createdAt);
    return {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps),
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new OutcomeEvidenceEngine instance.
 */
export function createOutcomeEvidenceEngine(
  config?: Partial<OutcomeEvidenceEngineConfig>
): OutcomeEvidenceEngine {
  return new OutcomeEvidenceEngine(config);
}

/**
 * Quick evidence generation with default settings.
 */
export function generateQuickEvidence(
  records: OutcomeRecord[],
  pathA: string,
  pathB: string,
  profileTraits: TraitFilter[]
): OutcomeEvidence | null {
  const engine = new OutcomeEvidenceEngine();
  return engine.generatePathComparison(records, pathA, pathB, profileTraits);
}

/**
 * Batch compare paths and generate evidence.
 */
export function batchComparePaths(
  records: OutcomeRecord[],
  paths: string[],
  profileTraits: TraitFilter[]
): OutcomeEvidence[] {
  const engine = new OutcomeEvidenceEngine();
  const evidence: OutcomeEvidence[] = [];

  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const item = engine.generatePathComparison(records, paths[i], paths[j], profileTraits);
      if (item) evidence.push(item);
    }
  }

  return evidence;
}
