/**
 * Indian Market Intelligence - Repositories
 *
 * Repositories for market data storage and retrieval.
 *
 * Design Principles:
 *   - Type-safe storage
 *   - Signal history tracking
 *   - Efficient queries
 *   - Update tracking
 */

import type {
  EntityId,
  Timestamp,
  MarketEntity,
  MarketEntityType,
  MarketSignal,
  SignalType,
  SignalSourceType,
  CareerMarketProfile,
  SkillMarketProfile,
  IndustryMarketProfile,
  RegionMarketProfile,
  ExamMarketProfile,
  EducationPathMarketProfile,
  MarketSnapshot,
  MarketUpdateMetadata,
  IndianMarketIntelligenceConfig,
  DataQualityMetrics,
} from './types.js';

import {
  DEFAULT_MARKET_INTELLIGENCE_CONFIG,
} from './types.js';

import {
  calculateDataQualityMetrics,
  aggregateSignals,
  calculateOpportunityScore,
} from './calculators.js';

// ============================================================================
// MARKET SIGNAL REPOSITORY
// ============================================================================

/**
 * Repository for market signals.
 *
 * Handles storage and retrieval of market signals with
 * time-series querying capabilities.
 */
export class MarketSignalRepository {
  private signals: Map<string, MarketSignal> = new Map();
  private entitySignalIndex: Map<EntityId, Set<string>> = new Map();
  private typeSignalIndex: Map<SignalType, Set<string>> = new Map();

  /**
   * Store a signal.
   */
  storeSignal(signal: MarketSignal): void {
    this.signals.set(signal.id, signal);

    // Index by entity
    if (!this.entitySignalIndex.has(signal.entityId)) {
      this.entitySignalIndex.set(signal.entityId, new Set());
    }
    this.entitySignalIndex.get(signal.entityId)!.add(signal.id);

    // Index by type
    if (!this.typeSignalIndex.has(signal.signalType)) {
      this.typeSignalIndex.set(signal.signalType, new Set());
    }
    this.typeSignalIndex.get(signal.signalType)!.add(signal.id);
  }

  /**
   * Store multiple signals.
   */
  storeSignals(signals: MarketSignal[]): void {
    for (const signal of signals) {
      this.storeSignal(signal);
    }
  }

  /**
   * Get signal by ID.
   */
  getSignal(id: string): MarketSignal | undefined {
    return this.signals.get(id);
  }

  /**
   * Get all signals for an entity.
   */
  getSignalsByEntity(entityId: EntityId): MarketSignal[] {
    const signalIds = this.entitySignalIndex.get(entityId);
    if (!signalIds) return [];

    return Array.from(signalIds)
      .map(id => this.signals.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get signals by type.
   */
  getSignalsByType(signalType: SignalType): MarketSignal[] {
    const signalIds = this.typeSignalIndex.get(signalType);
    if (!signalIds) return [];

    return Array.from(signalIds)
      .map(id => this.signals.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get signals in time range.
   */
  getSignalsInRange(
    startTime: Timestamp,
    endTime: Timestamp,
    options: {
      entityId?: EntityId;
      signalType?: SignalType;
    } = {}
  ): MarketSignal[] {
    let signals = Array.from(this.signals.values());

    signals = signals.filter(s =>
      s.timestamp >= startTime && s.timestamp <= endTime
    );

    if (options.entityId) {
      signals = signals.filter(s => s.entityId === options.entityId);
    }

    if (options.signalType) {
      signals = signals.filter(s => s.signalType === options.signalType);
    }

    return signals.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get latest signal for an entity and type.
   */
  getLatestSignal(
    entityId: EntityId,
    signalType: SignalType
  ): MarketSignal | undefined {
    const signals = this.getSignalsByEntity(entityId)
      .filter(s => s.signalType === signalType)
      .sort((a, b) => b.timestamp - a.timestamp);

    return signals[0];
  }

  /**
   * Get signal history for an entity.
   */
  getSignalHistory(
    entityId: EntityId,
    options: {
      signalTypes?: SignalType[];
      limit?: number;
    } = {}
  ): MarketSignal[] {
    let signals = this.getSignalsByEntity(entityId);

    if (options.signalTypes) {
      signals = signals.filter(s => options.signalTypes!.includes(s.signalType));
    }

    signals = signals.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      signals = signals.slice(0, options.limit);
    }

    return signals;
  }

  /**
   * Delete old signals.
   */
  deleteSignalsBefore(cutoffTime: Timestamp): number {
    let deleted = 0;
    for (const [id, signal] of this.signals) {
      if (signal.timestamp < cutoffTime) {
        this.signals.delete(id);
        this.entitySignalIndex.get(signal.entityId)?.delete(id);
        this.typeSignalIndex.get(signal.signalType)?.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Get total signal count.
   */
  getSignalCount(): number {
    return this.signals.size;
  }

  /**
   * Clear all signals.
   */
  clear(): void {
    this.signals.clear();
    this.entitySignalIndex.clear();
    this.typeSignalIndex.clear();
  }
}

// ============================================================================
// MARKET PROFILE REPOSITORY
// ============================================================================

/**
 * Repository for market entity profiles.
 *
 * Stores and retrieves career, skill, industry, region,
 * exam, and education path profiles.
 */
export class MarketProfileRepository {
  private careers: Map<EntityId, CareerMarketProfile> = new Map();
  private skills: Map<EntityId, SkillMarketProfile> = new Map();
  private industries: Map<EntityId, IndustryMarketProfile> = new Map();
  private regions: Map<EntityId, RegionMarketProfile> = new Map();
  private exams: Map<EntityId, ExamMarketProfile> = new Map();
  private educationPaths: Map<EntityId, EducationPathMarketProfile> = new Map();

  // ========================================================================
  // CAREER PROFILES
  // ========================================================================

  storeCareerProfile(profile: CareerMarketProfile): void {
    this.careers.set(profile.id, profile);
  }

  getCareerProfile(id: EntityId): CareerMarketProfile | undefined {
    return this.careers.get(id);
  }

  getCareerProfileBySlug(slug: string): CareerMarketProfile | undefined {
    return Array.from(this.careers.values()).find(c => c.careerSlug === slug);
  }

  getAllCareerProfiles(): CareerMarketProfile[] {
    return Array.from(this.careers.values());
  }

  findCareersByOpportunityScore(
    minScore: number = 0.6
  ): CareerMarketProfile[] {
    return this.getAllCareerProfiles()
      .filter(c => c.opportunityScore >= minScore)
      .sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  // ========================================================================
  // SKILL PROFILES
  // ========================================================================

  storeSkillProfile(profile: SkillMarketProfile): void {
    this.skills.set(profile.id, profile);
  }

  getSkillProfile(id: EntityId): SkillMarketProfile | undefined {
    return this.skills.get(id);
  }

  getAllSkillProfiles(): SkillMarketProfile[] {
    return Array.from(this.skills.values());
  }

  findSkillsByDemand(
    minDemand: number = 0.6
  ): SkillMarketProfile[] {
    return this.getAllSkillProfiles()
      .filter(s => s.skillDemand >= minDemand)
      .sort((a, b) => b.skillDemand - a.skillDemand);
  }

  // ========================================================================
  // INDUSTRY PROFILES
  // ========================================================================

  storeIndustryProfile(profile: IndustryMarketProfile): void {
    this.industries.set(profile.id, profile);
  }

  getIndustryProfile(id: EntityId): IndustryMarketProfile | undefined {
    return this.industries.get(id);
  }

  getAllIndustryProfiles(): IndustryMarketProfile[] {
    return Array.from(this.industries.values());
  }

  findGrowingIndustries(
    minGrowth: number = 0.05
  ): IndustryMarketProfile[] {
    return this.getAllIndustryProfiles()
      .filter(i => i.industryGrowth >= minGrowth)
      .sort((a, b) => b.industryGrowth - a.industryGrowth);
  }

  // ========================================================================
  // REGION PROFILES
  // ========================================================================

  storeRegionProfile(profile: RegionMarketProfile): void {
    this.regions.set(profile.id, profile);
  }

  getRegionProfile(id: EntityId): RegionMarketProfile | undefined {
    return this.regions.get(id);
  }

  getAllRegionProfiles(): RegionMarketProfile[] {
    return Array.from(this.regions.values());
  }

  findTopRegionsForOpportunity(
    limit: number = 5
  ): RegionMarketProfile[] {
    return this.getAllRegionProfiles()
      .sort((a, b) => b.jobAvailability - a.jobAvailability)
      .slice(0, limit);
  }

  // ========================================================================
  // EXAM PROFILES
  // ========================================================================

  storeExamProfile(profile: ExamMarketProfile): void {
    this.exams.set(profile.id, profile);
  }

  getExamProfile(id: EntityId): ExamMarketProfile | undefined {
    return this.exams.get(id);
  }

  getAllExamProfiles(): ExamMarketProfile[] {
    return Array.from(this.exams.values());
  }

  findExamsByCompetitionLevel(
    maxCompetition: number = 0.7
  ): ExamMarketProfile[] {
    return this.getAllExamProfiles()
      .filter(e => e.competitionLevel <= maxCompetition)
      .sort((a, b) => a.competitionLevel - b.competitionLevel);
  }

  // ========================================================================
  // EDUCATION PATH PROFILES
  // ========================================================================

  storeEducationPathProfile(profile: EducationPathMarketProfile): void {
    this.educationPaths.set(profile.id, profile);
  }

  getEducationPathProfile(id: EntityId): EducationPathMarketProfile | undefined {
    return this.educationPaths.get(id);
  }

  getAllEducationPathProfiles(): EducationPathMarketProfile[] {
    return Array.from(this.educationPaths.values());
  }

  findPathsByROI(
    minROI: number = 0.6
  ): EducationPathMarketProfile[] {
    return this.getAllEducationPathProfiles()
      .filter(p => p.roiScore >= minROI)
      .sort((a, b) => b.roiScore - a.roiScore);
  }

  // ========================================================================
  // GENERIC OPERATIONS
  // ========================================================================

  /**
   * Get profile by entity type and ID.
   */
  getProfile<T extends MarketEntity>(
    entityType: MarketEntityType,
    id: EntityId
  ): T | undefined {
    switch (entityType) {
      case 'career':
        return this.getCareerProfile(id) as unknown as T;
      case 'skill':
        return this.getSkillProfile(id) as unknown as T;
      case 'industry':
        return this.getIndustryProfile(id) as unknown as T;
      case 'region':
        return this.getRegionProfile(id) as unknown as T;
      case 'exam':
        return this.getExamProfile(id) as unknown as T;
      case 'education-path':
        return this.getEducationPathProfile(id) as unknown as T;
      default:
        return undefined;
    }
  }

  /**
   * Get all profiles of a specific type.
   */
  getAllProfiles<T extends MarketEntity>(
    entityType: MarketEntityType
  ): T[] {
    switch (entityType) {
      case 'career':
        return this.getAllCareerProfiles() as unknown as T[];
      case 'skill':
        return this.getAllSkillProfiles() as unknown as T[];
      case 'industry':
        return this.getAllIndustryProfiles() as unknown as T[];
      case 'region':
        return this.getAllRegionProfiles() as unknown as T[];
      case 'exam':
        return this.getAllExamProfiles() as unknown as T[];
      case 'education-path':
        return this.getAllEducationPathProfiles() as unknown as T[];
      default:
        return [];
    }
  }

  /**
   * Get entity counts by type.
   */
  getEntityCounts(): Record<MarketEntityType, number> {
    return {
      career: this.careers.size,
      skill: this.skills.size,
      industry: this.industries.size,
      region: this.regions.size,
      exam: this.exams.size,
      'education-path': this.educationPaths.size,
    };
  }

  /**
   * Clear all profiles.
   */
  clear(): void {
    this.careers.clear();
    this.skills.clear();
    this.industries.clear();
    this.regions.clear();
    this.exams.clear();
    this.educationPaths.clear();
  }
}

// ============================================================================
// MARKET INTELLIGENCE REPOSITORY
// ============================================================================

/**
 * Main repository for Indian Market Intelligence.
 *
 * Combines signals and profiles with high-level operations
 * for market analysis and updates.
 */
export class MarketIntelligenceRepository {
  signals: MarketSignalRepository;
  profiles: MarketProfileRepository;

  private snapshots: MarketSnapshot[] = [];
  private updateHistory: MarketUpdateMetadata[] = [];
  private config: IndianMarketIntelligenceConfig;

  constructor(
    config: Partial<IndianMarketIntelligenceConfig> = {}
  ) {
    this.config = { ...DEFAULT_MARKET_INTELLIGENCE_CONFIG, ...config };
    this.signals = new MarketSignalRepository();
    this.profiles = new MarketProfileRepository();
  }

  /**
   * Get current configuration.
   */
  getConfig(): IndianMarketIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<IndianMarketIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // SIGNAL OPERATIONS
  // ========================================================================

  /**
   * Add a market signal and update related profiles.
   */
  addSignal(signal: MarketSignal): void {
    this.signals.storeSignal(signal);

    // Track update
    this.updateHistory.push({
      id: `update_${Date.now()}_${signal.id}`,
      entityType: signal.entityType,
      entityId: signal.entityId,
      updatedAt: signal.timestamp,
      source: signal.sourceType,
      confidence: signal.confidence,
      changes: [{
        field: signal.signalType,
        oldValue: null,
        newValue: signal.value,
      }],
    });
  }

  /**
   * Add multiple signals.
   */
  addSignals(signals: MarketSignal[]): void {
    for (const signal of signals) {
      this.addSignal(signal);
    }
  }

  /**
   * Get aggregated signal value for an entity.
   */
  getAggregatedSignal(
    entityId: EntityId,
    signalType: SignalType
  ): { value: number; confidence: number; sampleSize: number } {
    const signals = this.signals.getSignalsByEntity(entityId);
    const aggregated = aggregateSignals(signals, { signalType });

    return {
      value: aggregated.value,
      confidence: aggregated.confidence,
      sampleSize: aggregated.sampleSize,
    };
  }

  // ========================================================================
  // PROFILE OPERATIONS
  // ========================================================================

  /**
   * Update profile from signals.
   */
  updateProfileFromSignals<T extends MarketEntity>(
    entityType: MarketEntityType,
    entityId: EntityId
  ): T | undefined {
    const signals = this.signals.getSignalsByEntity(entityId);
    const profile = this.profiles.getProfile<T>(entityType, entityId);

    if (!profile) return undefined;

    // Calculate data quality
    const dataQuality = calculateDataQualityMetrics(signals, this.config);

    // Update profile
    const updatedProfile = {
      ...profile,
      signals: signals.slice(-10), // Keep last 10 signals
      signalHistory: signals,
      dataQuality,
      updatedAt: Date.now(),
      version: profile.version + 1,
    };

    // Store updated profile
    switch (entityType) {
      case 'career':
        this.profiles.storeCareerProfile(updatedProfile as unknown as CareerMarketProfile);
        break;
      case 'skill':
        this.profiles.storeSkillProfile(updatedProfile as unknown as SkillMarketProfile);
        break;
      case 'industry':
        this.profiles.storeIndustryProfile(updatedProfile as unknown as IndustryMarketProfile);
        break;
      case 'region':
        this.profiles.storeRegionProfile(updatedProfile as unknown as RegionMarketProfile);
        break;
      case 'exam':
        this.profiles.storeExamProfile(updatedProfile as unknown as ExamMarketProfile);
        break;
      case 'education-path':
        this.profiles.storeEducationPathProfile(updatedProfile as unknown as EducationPathMarketProfile);
        break;
    }

    return updatedProfile as T;
  }

  /**
   * Get career opportunity score.
   */
  getCareerOpportunityScore(careerId: EntityId): number {
    const profile = this.profiles.getCareerProfile(careerId);
    if (!profile) return 0;

    return calculateOpportunityScore(
      profile.demandScore,
      profile.futureDemandScore,
      profile.salaryGrowthScore,
      profile.competitionScore
    );
  }

  // ========================================================================
  // MARKET SNAPSHOT
  // ========================================================================

  /**
   * Generate market snapshot.
   */
  generateMarketSnapshot(): MarketSnapshot {
    const timestamp = Date.now();

    // Top careers
    const topCareers = this.profiles.getAllCareerProfiles()
      .map(c => ({
        careerId: c.id,
        careerName: c.name,
        opportunityScore: c.opportunityScore,
      }))
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 10);

    // Top skills
    const topSkills = this.profiles.getAllSkillProfiles()
      .map(s => ({
        skillId: s.id,
        skillName: s.name,
        demandScore: s.skillDemand,
      }))
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 10);

    // Growing industries
    const growingIndustries = this.profiles.getAllIndustryProfiles()
      .map(i => ({
        industryId: i.id,
        industryName: i.name,
        growthRate: i.industryGrowth,
      }))
      .filter(i => i.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 5);

    // Top regions
    const topRegions = this.profiles.getAllRegionProfiles()
      .map(r => ({
        regionId: r.id,
        regionName: r.name,
        opportunityScore: r.jobAvailability,
      }))
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 5);

    // Calculate overall health
    const healthScores = [
      topCareers.length > 0 ? topCareers[0].opportunityScore : 0.5,
      growingIndustries.length > 0 ? growingIndustries[0].growthRate + 0.5 : 0.5,
      topRegions.length > 0 ? topRegions[0].opportunityScore : 0.5,
    ];
    const overallHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;

    // Detect notable changes
    const notableChanges: string[] = [];
    if (this.snapshots.length > 0) {
      const lastSnapshot = this.snapshots[this.snapshots.length - 1];

      if (topCareers[0]?.careerId !== lastSnapshot.topCareers[0]?.careerId) {
        notableChanges.push(`Top career changed to ${topCareers[0]?.careerName}`);
      }

      if (growingIndustries[0]?.industryId !== lastSnapshot.growingIndustries[0]?.industryId) {
        notableChanges.push(`Fastest growing industry is now ${growingIndustries[0]?.industryName}`);
      }
    }

    const snapshot: MarketSnapshot = {
      id: `snapshot_${timestamp}`,
      timestamp,
      overallHealth,
      topCareers,
      topSkills,
      growingIndustries,
      topRegions,
      trendsSummary: `Market health: ${(overallHealth * 100).toFixed(0)}%`,
      notableChanges,
    };

    this.snapshots.push(snapshot);

    return snapshot;
  }

  /**
   * Get latest snapshot.
   */
  getLatestSnapshot(): MarketSnapshot | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  /**
   * Get snapshot history.
   */
  getSnapshotHistory(limit: number = 10): MarketSnapshot[] {
    return this.snapshots.slice(-limit);
  }

  // ========================================================================
  // QUERY OPERATIONS
  // ========================================================================

  /**
   * Search across all entities.
   */
  search(query: string): MarketEntity[] {
    const results: MarketEntity[] = [];
    const lowerQuery = query.toLowerCase();

    // Search careers
    results.push(...this.profiles.getAllCareerProfiles().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.careerSlug.toLowerCase().includes(lowerQuery)
    ));

    // Search skills
    results.push(...this.profiles.getAllSkillProfiles().filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.skillId.toLowerCase().includes(lowerQuery)
    ));

    // Search industries
    results.push(...this.profiles.getAllIndustryProfiles().filter(i =>
      i.name.toLowerCase().includes(lowerQuery)
    ));

    // Search regions
    results.push(...this.profiles.getAllRegionProfiles().filter(r =>
      r.name.toLowerCase().includes(lowerQuery)
    ));

    // Search exams
    results.push(...this.profiles.getAllExamProfiles().filter(e =>
      e.name.toLowerCase().includes(lowerQuery)
    ));

    return results;
  }

  /**
   * Get update history.
   */
  getUpdateHistory(
    options: {
      entityType?: MarketEntityType;
      limit?: number;
    } = {}
  ): MarketUpdateMetadata[] {
    let history = this.updateHistory;

    if (options.entityType) {
      history = history.filter(u => u.entityType === options.entityType);
    }

    history = history.sort((a, b) => b.updatedAt - a.updatedAt);

    if (options.limit) {
      history = history.slice(0, options.limit);
    }

    return history;
  }

  /**
   * Get repository statistics.
   */
  getStatistics(): {
    signalCount: number;
    profileCounts: Record<MarketEntityType, number>;
    snapshotCount: number;
    updateCount: number;
  } {
    return {
      signalCount: this.signals.getSignalCount(),
      profileCounts: this.profiles.getEntityCounts(),
      snapshotCount: this.snapshots.length,
      updateCount: this.updateHistory.length,
    };
  }

  /**
   * Clear all data.
   */
  clear(): void {
    this.signals.clear();
    this.profiles.clear();
    this.snapshots = [];
    this.updateHistory = [];
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new MarketIntelligenceRepository.
 */
export function createMarketIntelligenceRepository(
  config?: Partial<IndianMarketIntelligenceConfig>
): MarketIntelligenceRepository {
  return new MarketIntelligenceRepository(config);
}

/**
 * Create a MarketSignal.
 */
export function createMarketSignal(
  signalType: SignalType,
  value: number,
  entityId: EntityId,
  entityType: MarketEntityType,
  options: {
    confidence?: number;
    sourceType?: SignalSourceType;
    notes?: string;
  } = {}
): MarketSignal {
  const timestamp = Date.now();

  return {
    id: `signal_${signalType}_${entityId}_${timestamp}`,
    signalType,
    value: Math.min(Math.max(value, 0), 1),
    confidence: options.confidence ?? 0.7,
    timestamp,
    sourceType: options.sourceType ?? 'manual-entry',
    notes: options.notes,
    entityId,
    entityType,
  };
}
