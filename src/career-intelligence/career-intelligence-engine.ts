/**
 * CareerOS Career Intelligence Engine - Main Orchestrator
 *
 * Phase C.1: Career Intelligence Engine
 *
 * Orchestrates career intelligence creation, analysis, and insight generation.
 *
 * @module career-intelligence-engine
 * @version 1.0.0
 */

import type {
  CareerIntelligence,
  CareerId,
  CareerIntelligenceConfig,
  DEFAULT_CAREER_INTELLIGENCE_CONFIG,
  CareerIntelligenceQuery,
  CareerIntelligenceResult,
} from './career-types';

import { CareerEvidenceEngine } from './career-evidence-engine';
import { CareerAnalyzer } from './career-analyzer';
import { CareerInsightsEngine } from './career-insights-engine';

/**
 * Main orchestrator for Career Intelligence Engine.
 *
 * Coordinates evidence management, career analysis, and insight generation
 * into a unified career intelligence system.
 */
export class CareerIntelligenceEngine {
  private evidenceEngine: CareerEvidenceEngine;
  private analyzer: CareerAnalyzer;
  private insightsEngine: CareerInsightsEngine;
  private config: CareerIntelligenceConfig;
  private careerDatabase: Map<CareerId, CareerIntelligence>;

  constructor(config?: Partial<CareerIntelligenceConfig>) {
    this.config = { ...DEFAULT_CAREER_INTELLIGENCE_CONFIG, ...config };
    this.evidenceEngine = new CareerEvidenceEngine();
    this.analyzer = new CareerAnalyzer();
    this.insightsEngine = new CareerInsightsEngine();
    this.careerDatabase = new Map();
  }

  /**
   * Register a career in the intelligence system.
   */
  registerCareer(career: CareerIntelligence): CareerIntelligence {
    // Validate career data
    const validation = this.evidenceEngine.validateEvidence(career);

    if (!validation.valid && this.config.enableEvidenceTracking) {
      console.warn(`Career ${career.careerId} has evidence issues:`, validation.issues);
    }

    // Build evidence summary
    const evidence = this.evidenceEngine.buildCareerEvidence(career);

    // Generate insights if enabled
    const insights = this.config.enableInsights
      ? this.insightsEngine.generateInsights(career)
      : undefined;

    // Create complete career intelligence
    const completeCareer: CareerIntelligence = {
      ...career,
      evidence,
      insights,
      metadata: {
        ...career.metadata,
        updatedAt: new Date(),
      },
    };

    // Store in database
    this.careerDatabase.set(career.careerId, completeCareer);

    return completeCareer;
  }

  /**
   * Get career intelligence by ID.
   */
  getCareer(careerId: CareerId): CareerIntelligence | undefined {
    return this.careerDatabase.get(careerId);
  }

  /**
   * Get multiple careers by IDs.
   */
  getCareers(careerIds: CareerId[]): CareerIntelligence[] {
    return careerIds
      .map((id) => this.careerDatabase.get(id))
      .filter((career): career is CareerIntelligence => career !== undefined);
  }

  /**
   * Query careers by criteria.
   */
  queryCareers(query: CareerIntelligenceQuery): CareerIntelligenceResult {
    let careers = Array.from(this.careerDatabase.values());

    // Filter by career IDs
    if (query.careerIds && query.careerIds.length > 0) {
      careers = careers.filter((c) => query.careerIds!.includes(c.careerId));
    }

    // Filter by category
    if (query.category) {
      careers = careers.filter((c) => c.metadata.category === query.category);
    }

    // Filter by industry
    if (query.industry) {
      careers = careers.filter((c) => c.metadata.industry === query.industry);
    }

    // Filter by education level
    if (query.educationLevel) {
      careers = careers.filter(
        (c) => c.metadata.educationLevel === query.educationLevel
      );
    }

    // Filter by minimum confidence
    if (query.minConfidence) {
      careers = careers.filter(
        (c) => c.evidence.overallConfidence >= query.minConfidence
      );
    }

    const totalCount = careers.length;

    // Generate insights if requested
    if (query.includeInsights) {
      careers = careers.map((career) => {
        if (!career.insights) {
          return {
            ...career,
            insights: this.insightsEngine.generateInsights(career),
          };
        }
        return career;
      });
    }

    return {
      careers,
      totalCount,
      query,
      generatedAt: new Date(),
    };
  }

  /**
   * Analyze a specific career.
   */
  analyzeCareer(careerId: CareerId): ReturnType<CareerAnalyzer['analyzeCareer']> | null {
    const career = this.careerDatabase.get(careerId);
    if (!career) return null;

    return this.analyzer.analyzeCareer(career);
  }

  /**
   * Compare multiple careers.
   */
  compareCareers(careerIds: CareerId[]): ReturnType<CareerAnalyzer['compareCareers']> | null {
    const careers = this.getCareers(careerIds);
    if (careers.length < 2) return null;

    return this.analyzer.compareCareers(careers);
  }

  /**
   * Get career attractiveness scores.
   */
  getAttractivenessScores(): Array<{ careerId: CareerId; score: number }> {
    const scores: Array<{ careerId: CareerId; score: number }> = [];

    for (const [id, career] of this.careerDatabase) {
      const score = this.analyzer.getAttractivenessScore(career);
      scores.push({ careerId: id, score });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get career complexity scores.
   */
  getComplexityScores(): Array<{ careerId: CareerId; score: number }> {
    const scores: Array<{ careerId: CareerId; score: number }> = [];

    for (const [id, career] of this.careerDatabase) {
      const score = this.analyzer.getComplexityScore(career);
      scores.push({ careerId: id, score });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get careers by category.
   */
  getCareersByCategory(category: string): CareerIntelligence[] {
    return this.queryCareers({ category }).careers;
  }

  /**
   * Get careers by industry.
   */
  getCareersByIndustry(industry: string): CareerIntelligence[] {
    return this.queryCareers({ industry }).careers;
  }

  /**
   * Get all registered career IDs.
   */
  getAllCareerIds(): CareerId[] {
    return Array.from(this.careerDatabase.keys());
  }

  /**
   * Get count of registered careers.
   */
  getCareerCount(): number {
    return this.careerDatabase.size;
  }

  /**
   * Remove a career from the system.
   */
  removeCareer(careerId: CareerId): boolean {
    return this.careerDatabase.delete(careerId);
  }

  /**
   * Clear all careers.
   */
  clearAllCareers(): void {
    this.careerDatabase.clear();
  }

  /**
   * Check if career exists.
   */
  hasCareer(careerId: CareerId): boolean {
    return this.careerDatabase.has(careerId);
  }

  /**
   * Get careers with confidence below threshold.
   */
  getLowConfidenceCareers(threshold?: number): CareerIntelligence[] {
    const minConfidence = threshold ?? this.config.minConfidenceThreshold;
    return Array.from(this.careerDatabase.values()).filter(
      (c) => c.evidence.overallConfidence < minConfidence
    );
  }

  /**
   * Get careers needing evidence update.
   */
  getStaleCareers(maxAgeDays?: number): CareerIntelligence[] {
    const maxAge = maxAgeDays ?? this.config.maxDataAgeDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    return Array.from(this.careerDatabase.values()).filter(
      (c) => c.metadata.updatedAt < cutoffDate
    );
  }

  /**
   * Update career intelligence.
   */
  updateCareer(
    careerId: CareerId,
    updates: Partial<Omit<CareerIntelligence, 'careerId'>>
  ): CareerIntelligence | null {
    const existing = this.careerDatabase.get(careerId);
    if (!existing) return null;

    const updated: CareerIntelligence = {
      ...existing,
      ...updates,
      careerId, // Ensure ID doesn't change
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    // Re-validate and rebuild evidence
    if (this.config.enableEvidenceTracking) {
      updated.evidence = this.evidenceEngine.buildCareerEvidence(updated);
    }

    // Regenerate insights
    if (this.config.enableInsights) {
      updated.insights = this.insightsEngine.generateInsights(updated);
    }

    this.careerDatabase.set(careerId, updated);
    return updated;
  }

  /**
   * Batch register multiple careers.
   */
  batchRegisterCareers(careers: CareerIntelligence[]): CareerIntelligence[] {
    return careers.map((career) => this.registerCareer(career));
  }

  /**
   * Get engine statistics.
   */
  getStatistics(): {
    totalCareers: number;
    categories: string[];
    industries: string[];
    avgConfidence: number;
    lowConfidenceCount: number;
  } {
    const careers = Array.from(this.careerDatabase.values());
    const categories = new Set(careers.map((c) => c.metadata.category));
    const industries = new Set(careers.map((c) => c.metadata.industry));

    const avgConfidence =
      careers.length > 0
        ? Math.round(
            careers.reduce((sum, c) => sum + c.evidence.overallConfidence, 0) /
              careers.length
          )
        : 0;

    const lowConfidenceCount = careers.filter(
      (c) => c.evidence.overallConfidence < this.config.minConfidenceThreshold
    ).length;

    return {
      totalCareers: careers.length,
      categories: Array.from(categories),
      industries: Array.from(industries),
      avgConfidence,
      lowConfidenceCount,
    };
  }
}

/**
 * Factory function for CareerIntelligenceEngine.
 */
export function createCareerIntelligenceEngine(
  config?: Partial<CareerIntelligenceConfig>
): CareerIntelligenceEngine {
  return new CareerIntelligenceEngine(config);
}

// Re-export all types and engines
export * from './career-types';
export { CareerEvidenceEngine, createCareerEvidenceEngine } from './career-evidence-engine';
export { CareerAnalyzer, createCareerAnalyzer } from './career-analyzer';
export { CareerInsightsEngine, createCareerInsightsEngine } from './career-insights-engine';
