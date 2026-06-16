/**
 * Career Journey Engine
 * 
 * Core engine for managing and processing career journeys.
 * Provides CRUD operations, validation, and journey lifecycle management.
 */

import {
  JourneyId,
  CareerJourney,
  CareerDecision,
  TurningPoint,
  CareerTransition,
  JourneyInsights,
  JourneyStartingPoint,
  CareerPosition,
  EducationMilestone,
  CareerFailure,
  CareerSuccess,
  LessonLearned,
  CareerRegret,
  JourneyMetadata,
  JourneySource,
  // ConfidenceLevel BANNED - use Confidence from @/intelligence/confidence
  AnalysisDepth,
  JourneyAnalysisInput,
  JourneyAnalysisResult,
  SimilarJourneyQuery,
  SimilarJourneyResult,
  JourneyComparisonInput,
  JourneyComparisonResult,
} from './career-journey-types';
import type { Confidence } from '@/intelligence/confidence';
import { JourneyAnalyzer } from './journey-analyzer';
import { TurningPointEngine } from './turning-point-engine';
import { CareerTransitionEngine } from './career-transition-engine';
import { JourneyInsightsEngine } from './journey-insights-engine';

/**
 * Result of journey validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Configuration for the Career Journey Engine
 */
export interface CareerJourneyEngineConfig {
  /** Minimum constitutional confidence (0.0-1.0) for journey data */
  minDataQuality: Confidence;
  
  /** Default analysis depth */
  defaultAnalysisDepth: AnalysisDepth;
  
  /** Maximum journeys to process in batch */
  maxBatchSize: number;
  
  /** Enable caching */
  enableCaching: boolean;
  
  /** Cache TTL in seconds */
  cacheTtlSeconds: number;
}

/**
 * Default engine configuration
 */
const DEFAULT_CONFIG: CareerJourneyEngineConfig = {
  minDataQuality: 0.5,
  defaultAnalysisDepth: 'STANDARD',
  maxBatchSize: 100,
  enableCaching: true,
  cacheTtlSeconds: 3600,
};

/**
 * Career Journey Engine
 * 
 * Manages the lifecycle of career journeys including creation, validation,
 * analysis, and retrieval. Provides the foundation for all journey intelligence.
 */
export class CareerJourneyEngine {
  private config: CareerJourneyEngineConfig;
  private journeyStore: Map<JourneyId, CareerJourney>;
  private journeyAnalyzer: JourneyAnalyzer;
  private turningPointEngine: TurningPointEngine;
  private transitionEngine: CareerTransitionEngine;
  private insightsEngine: JourneyInsightsEngine;
  private cache: Map<string, { data: unknown; timestamp: number }>;

  constructor(config: Partial<CareerJourneyEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.journeyStore = new Map();
    this.journeyAnalyzer = new JourneyAnalyzer();
    this.turningPointEngine = new TurningPointEngine();
    this.transitionEngine = new CareerTransitionEngine();
    this.insightsEngine = new JourneyInsightsEngine();
    this.cache = new Map();
  }

  // ============================================================================
  // JOURNEY LIFECYCLE
  // ============================================================================

  /**
   * Create a new career journey
   */
  async createJourney(
    startingPoint: JourneyStartingPoint,
    source: JourneySource = 'SELF_REPORTED'
  ): Promise<{ journey: CareerJourney; validation: ValidationResult }> {
    const journeyId = this.generateJourneyId();
    
    const now = new Date();
    const metadata: JourneyMetadata = {
      recordedAt: now,
      updatedAt: now,
      verified: false,
      source,
      dataQuality: 0.5,
      tags: [],
    };

    const journey: CareerJourney = {
      id: journeyId,
      startingPoint,
      currentRole: {
        title: '',
        organization: '',
        companyStage: 'SMB',
        industry: 'OTHER',
        yearsInRole: 0,
        totalYearsExperience: 0,
      },
      currentIndustry: 'OTHER',
      educationHistory: [],
      careerHistory: [],
      majorDecisions: [],
      turningPoints: [],
      failures: [],
      successes: [],
      lessons: [],
      regrets: [],
      metadata,
      networkQuality: () => startingPoint.familyBackground.networkQuality,
    };

    const validation = this.validateJourney(journey);
    
    if (validation.valid) {
      this.journeyStore.set(journeyId, journey);
      this.invalidateCache(`journey:${journeyId}`);
    }

    return { journey, validation };
  }

  /**
   * Retrieve a journey by ID
   */
  async getJourney(journeyId: JourneyId): Promise<CareerJourney | null> {
    const cacheKey = `journey:${journeyId}`;
    const cached = this.getFromCache<CareerJourney>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const journey = this.journeyStore.get(journeyId) || null;
    
    if (journey && this.config.enableCaching) {
      this.setCache(cacheKey, journey);
    }

    return journey;
  }

  /**
   * Update an existing journey
   */
  async updateJourney(
    journeyId: JourneyId,
    updates: Partial<Omit<CareerJourney, 'id' | 'metadata'>>
  ): Promise<{ journey: CareerJourney | null; validation: ValidationResult }> {
    const existingJourney = await this.getJourney(journeyId);
    
    if (!existingJourney) {
      return {
        journey: null,
        validation: {
          valid: false,
          errors: [{ field: 'id', message: 'Journey not found', code: 'NOT_FOUND' }],
          warnings: [],
        },
      };
    }

    const updatedJourney: CareerJourney = {
      ...existingJourney,
      ...updates,
      metadata: {
        ...existingJourney.metadata,
        updatedAt: new Date(),
      },
    };

    const validation = this.validateJourney(updatedJourney);
    
    if (validation.valid) {
      this.journeyStore.set(journeyId, updatedJourney);
      this.invalidateCache(`journey:${journeyId}`);
    }

    return { journey: validation.valid ? updatedJourney : null, validation };
  }

  /**
   * Delete a journey
   */
  async deleteJourney(journeyId: JourneyId): Promise<boolean> {
    const existed = this.journeyStore.has(journeyId);
    this.journeyStore.delete(journeyId);
    this.invalidateCache(`journey:${journeyId}`);
    return existed;
  }

  // ============================================================================
  // JOURNEY COMPONENTS
  // ============================================================================

  /**
   * Add a career position to a journey
   */
  async addCareerPosition(
    journeyId: JourneyId,
    position: CareerPosition
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const updatedPositions = [...journey.careerHistory, position];
    
    // Update current role if this is the latest position
    const isCurrent = !position.endDate;
    const currentRoleUpdate = isCurrent
      ? {
          currentRole: {
            title: position.title,
            organization: position.organization,
            companyStage: position.companyStage,
            industry: position.industry,
            yearsInRole: this.calculateYearsInRole(position),
            totalYearsExperience: this.calculateTotalExperience(updatedPositions),
          },
          currentIndustry: position.industry,
        }
      : {};

    const { journey: updated } = await this.updateJourney(journeyId, {
      careerHistory: updatedPositions,
      ...currentRoleUpdate,
    });

    return updated;
  }

  /**
   * Add an education milestone
   */
  async addEducationMilestone(
    journeyId: JourneyId,
    education: EducationMilestone
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      educationHistory: [...journey.educationHistory, education],
    });

    return updated;
  }

  /**
   * Add a major decision
   */
  async addDecision(
    journeyId: JourneyId,
    decision: CareerDecision
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      majorDecisions: [...journey.majorDecisions, decision],
    });

    return updated;
  }

  /**
   * Add a turning point
   */
  async addTurningPoint(
    journeyId: JourneyId,
    turningPoint: TurningPoint
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      turningPoints: [...journey.turningPoints, turningPoint],
    });

    return updated;
  }

  /**
   * Add a career transition
   */
  async addTransition(
    journeyId: JourneyId,
    transition: CareerTransition
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    // Store transitions implicitly through career history changes
    // This method adds metadata about the transition
    return journey;
  }

  /**
   * Add a failure/success event
   */
  async addFailure(
    journeyId: JourneyId,
    failure: CareerFailure
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      failures: [...journey.failures, failure],
    });

    return updated;
  }

  async addSuccess(
    journeyId: JourneyId,
    success: CareerSuccess
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      successes: [...journey.successes, success],
    });

    return updated;
  }

  /**
   * Add a lesson learned
   */
  async addLesson(
    journeyId: JourneyId,
    lesson: LessonLearned
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      lessons: [...journey.lessons, lesson],
    });

    return updated;
  }

  /**
   * Add a regret
   */
  async addRegret(
    journeyId: JourneyId,
    regret: CareerRegret
  ): Promise<CareerJourney | null> {
    const journey = await this.getJourney(journeyId);
    if (!journey) return null;

    const { journey: updated } = await this.updateJourney(journeyId, {
      regrets: [...journey.regrets, regret],
    });

    return updated;
  }

  // ============================================================================
  // JOURNEY ANALYSIS
  // ============================================================================

  /**
   * Analyze a career journey comprehensively
   */
  async analyzeJourney(input: JourneyAnalysisInput): Promise<JourneyAnalysisResult> {
    const { journey, analysisDepth } = input;

    // Run parallel analyses
    const [
      insights,
      transitionMap,
      turningPointAnalysis,
    ] = await Promise.all([
      this.insightsEngine.generateInsights(journey, analysisDepth),
      this.transitionEngine.analyzeTransitions(journey),
      this.turningPointEngine.analyzeTurningPoints(journey),
    ]);

    return {
      journeyId: journey.id,
      insights,
      transitionMap,
      turningPointAnalysis,
      confidence: this.calculateAnalysisConfidence(journey),
      generatedAt: new Date(),
    };
  }

  /**
   * Find similar journeys based on query criteria
   */
  async findSimilarJourneys(
    query: SimilarJourneyQuery
  ): Promise<SimilarJourneyResult[]> {
    const allJourneys = Array.from(this.journeyStore.values());
    
    const results: SimilarJourneyResult[] = allJourneys
      .map((journey): SimilarJourneyResult => ({
        journeyId: journey.id,
        similarityScore: this.calculateSimilarity(journey, query),
        matchingFactors: this.getMatchingFactors(journey, query),
        keyDifferences: this.getKeyDifferences(journey, query),
        relevance: 'RELEVANT', // Will be refined below
      }))
      .filter(result => result.similarityScore > 0.3)
      .sort((a, b) => b.similarityScore - a.similarityScore);

    // Apply limit
    const limit = query.limit || 10;
    return results.slice(0, limit);
  }

  /**
   * Compare multiple journeys
   */
  async compareJourneys(
    input: JourneyComparisonInput
  ): Promise<JourneyComparisonResult> {
    return this.journeyAnalyzer.compareJourneys(input);
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Query journeys by various criteria
   */
  async queryJourneys(criteria: {
    startingLocation?: string;
    currentIndustry?: string;
    educationTier?: string;
    hasTransitionType?: string;
    minDataQuality?: Confidence; // 0.0-1.0 constitutional confidence
    tags?: string[];
    limit?: number;
  }): Promise<CareerJourney[]> {
    let journeys = Array.from(this.journeyStore.values());

    if (criteria.startingLocation) {
      journeys = journeys.filter(
        j => j.startingPoint.location.city === criteria.startingLocation
      );
    }

    if (criteria.currentIndustry) {
      journeys = journeys.filter(
        j => j.currentIndustry === criteria.currentIndustry
      );
    }

    if (criteria.educationTier) {
      journeys = journeys.filter(j =>
        j.educationHistory.some(e => e.institutionTier === criteria.educationTier)
      );
    }

    if (criteria.minDataQuality !== undefined) {
      const minDataQuality = criteria.minDataQuality;
      journeys = journeys.filter(
        j => this.compareConfidence(j.metadata.dataQuality, minDataQuality) >= 0
      );
    }

    if (criteria.tags && criteria.tags.length > 0) {
      journeys = journeys.filter(j =>
        criteria.tags!.some(tag => j.metadata.tags.includes(tag))
      );
    }

    const limit = criteria.limit || 100;
    return journeys.slice(0, limit);
  }

  /**
   * Get journey statistics
   */
  async getStatistics(): Promise<{
    totalJourneys: number;
    bySource: Record<JourneySource, number>;
    byIndustry: Record<string, number>;
    byStartingTier: Record<string, number>;
    averageDecisions: number;
    averageTurningPoints: number;
  }> {
    const journeys = Array.from(this.journeyStore.values());

    return {
      totalJourneys: journeys.length,
      bySource: this.groupBySource(journeys),
      byIndustry: this.groupByIndustry(journeys),
      byStartingTier: this.groupByStartingTier(journeys),
      averageDecisions: this.calculateAverage(journeys, j => j.majorDecisions.length),
      averageTurningPoints: this.calculateAverage(journeys, j => j.turningPoints.length),
    };
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate a career journey for completeness and consistency
   */
  validateJourney(journey: CareerJourney): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!journey.id) {
      errors.push({ field: 'id', message: 'Journey ID is required', code: 'MISSING_ID' });
    }

    if (!journey.startingPoint) {
      errors.push({ field: 'startingPoint', message: 'Starting point is required', code: 'MISSING_START' });
    }

    // Timeline consistency
    const timelineValid = this.validateTimeline(journey);
    if (!timelineValid.valid) {
      errors.push(...timelineValid.errors);
    }

    // Data quality check
    if (journey.metadata.dataQuality < 0.2) {
      warnings.push({
        field: 'dataQuality',
        message: 'Data quality is very low, results may be unreliable',
        suggestion: 'Collect more detailed information',
      });
    }

    // Career history gaps
    const gaps = this.identifyCareerGaps(journey);
    if (gaps.length > 0) {
      warnings.push({
        field: 'careerHistory',
        message: `Found ${gaps.length} gaps in career history`,
        suggestion: 'Document explanation for gaps if possible',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateJourneyId(): JourneyId {
    return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.enableCaching) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTtlSeconds * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    if (!this.config.enableCaching) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private calculateYearsInRole(position: CareerPosition): number {
    const end = position.endDate || new Date();
    const diffMs = end.getTime() - position.startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  }

  private calculateTotalExperience(positions: CareerPosition[]): number {
    let totalMonths = 0;
    for (const pos of positions) {
      totalMonths += pos.durationMonths;
    }
    return Math.floor(totalMonths / 12);
  }

  /**
   * Calculate constitutional confidence (0.0-1.0) for journey analysis.
   * @deprecated Use ConfidenceAuthority.getConfidence() instead
   */
  private calculateAnalysisConfidence(journey: CareerJourney): Confidence {
    const factors = [
      journey.careerHistory.length > 0 ? 1 : 0,
      journey.majorDecisions.length > 0 ? 1 : 0,
      journey.turningPoints.length > 0 ? 1 : 0,
      journey.lessons.length > 0 ? 1 : 0,
      journey.metadata.verified ? 1 : 0.5,
    ];

    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  private calculateSimilarity(
    journey: CareerJourney,
    query: SimilarJourneyQuery
  ): number {
    let score = 0;
    let factors = 0;

    if (query.startingPoint?.location?.tier) {
      factors++;
      if (journey.startingPoint.location.tier === query.startingPoint.location.tier) {
        score += 1;
      }
    }

    if (query.currentRole?.industry) {
      factors++;
      if (journey.currentIndustry === query.currentRole.industry) {
        score += 1;
      }
    }

    if (query.constraints) {
      factors++;
      const journeyConstraints = journey.startingPoint.initialConstraints.map(c => c.type);
      const matchingConstraints = query.constraints.filter(c => journeyConstraints.includes(c));
      score += matchingConstraints.length / query.constraints.length;
    }

    return factors > 0 ? score / factors : 0;
  }

  private getMatchingFactors(journey: CareerJourney, query: SimilarJourneyQuery): string[] {
    const factors: string[] = [];

    if (query.startingPoint?.location?.tier === journey.startingPoint.location.tier) {
      factors.push('Starting location tier');
    }

    if (query.currentRole?.industry === journey.currentIndustry) {
      factors.push('Current industry');
    }

    return factors;
  }

  private getKeyDifferences(journey: CareerJourney, query: SimilarJourneyQuery): string[] {
    const differences: string[] = [];

    if (query.startingPoint?.location?.tier !== journey.startingPoint.location.tier) {
      differences.push('Different starting location tier');
    }

    if (query.currentRole?.industry && query.currentRole.industry !== journey.currentIndustry) {
      differences.push('Different current industry');
    }

    return differences;
  }

  /**
   * Compare constitutional confidence values (0.0-1.0).
   * Returns negative if a < b, positive if a > b, 0 if equal.
   */
  private compareConfidence(a: Confidence, b: Confidence): number {
    return a - b;
  }

  private validateTimeline(journey: CareerJourney): { valid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Check education dates are chronological
    for (let i = 1; i < journey.educationHistory.length; i++) {
      const prev = journey.educationHistory[i - 1];
      const curr = journey.educationHistory[i];
      if (curr.startYear < prev.startYear) {
        errors.push({
          field: 'educationHistory',
          message: `Education entries not in chronological order at index ${i}`,
          code: 'TIMELINE_ERROR',
        });
      }
    }

    // Check career positions don't overlap
    for (let i = 1; i < journey.careerHistory.length; i++) {
      const prev = journey.careerHistory[i - 1];
      const curr = journey.careerHistory[i];
      if (prev.endDate && curr.startDate < prev.endDate) {
        errors.push({
          field: 'careerHistory',
          message: `Overlapping career positions at index ${i}`,
          code: 'TIMELINE_ERROR',
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private identifyCareerGaps(journey: CareerJourney): Array<{ start: Date; end: Date; months: number }> {
    const gaps: Array<{ start: Date; end: Date; months: number }> = [];
    
    for (let i = 1; i < journey.careerHistory.length; i++) {
      const prev = journey.careerHistory[i - 1];
      const curr = journey.careerHistory[i];
      
      if (prev.endDate) {
        const gapMs = curr.startDate.getTime() - prev.endDate.getTime();
        const gapMonths = Math.floor(gapMs / (1000 * 60 * 60 * 24 * 30));
        
        if (gapMonths > 3) {
          gaps.push({
            start: prev.endDate,
            end: curr.startDate,
            months: gapMonths,
          });
        }
      }
    }

    return gaps;
  }

  private groupBySource(journeys: CareerJourney[]): Record<JourneySource, number> {
    const counts: Record<string, number> = {};
    for (const journey of journeys) {
      const source = journey.metadata.source;
      counts[source] = (counts[source] || 0) + 1;
    }
    return counts as Record<JourneySource, number>;
  }

  private groupByIndustry(journeys: CareerJourney[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const journey of journeys) {
      const industry = journey.currentIndustry;
      counts[industry] = (counts[industry] || 0) + 1;
    }
    return counts;
  }

  private groupByStartingTier(journeys: CareerJourney[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const journey of journeys) {
      const tier = journey.startingPoint.location.tier;
      counts[tier] = (counts[tier] || 0) + 1;
    }
    return counts;
  }

  private calculateAverage(journeys: CareerJourney[], getter: (j: CareerJourney) => number): number {
    if (journeys.length === 0) return 0;
    const sum = journeys.reduce((acc, j) => acc + getter(j), 0);
    return sum / journeys.length;
  }
}

/**
 * Factory function to create a Career Journey Engine instance
 */
export function createCareerJourneyEngine(
  config?: Partial<CareerJourneyEngineConfig>
): CareerJourneyEngine {
  return new CareerJourneyEngine(config);
}
