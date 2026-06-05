/**
 * CareerOS Market Intelligence - Career Market Repository Interface
 *
 * Abstraction for career market profile persistence.
 */

import type {
  CareerMarketProfile,
  CareerMarketProfileId,
  CareerMarketProfileSnapshot,
  CareerMarketProfileComparison,
  CareerMarketProfileUpdate,
  MarketOutlook,
} from '../models/CareerMarketProfile';

/**
 * Repository interface for career market profile storage.
 * 
 * This repository handles the authoritative market profiles for careers.
 * Profiles are the output of the market intelligence system.
 */
export interface CareerMarketRepository {
  // ============================================================================
  // PROFILE CRUD
  // ============================================================================

  /**
   * Save a career market profile.
   */
  saveProfile(profile: CareerMarketProfile): Promise<void>;

  /**
   * Get profile by ID.
   */
  getProfile(id: CareerMarketProfileId): Promise<CareerMarketProfile | null>;

  /**
   * Get profile by career ID.
   */
  getProfileByCareerId(careerId: string): Promise<CareerMarketProfile | null>;

  /**
   * Get multiple profiles by career IDs.
   */
  getProfilesByCareerIds(careerIds: string[]): Promise<CareerMarketProfile[]>;

  /**
   * Update a profile.
   */
  updateProfile(update: CareerMarketProfileUpdate): Promise<CareerMarketProfile>;

  /**
   * Delete a profile.
   */
  deleteProfile(careerId: string): Promise<void>;

  // ============================================================================
  // PROFILE QUERIES
  // ============================================================================

  /**
   * Get all profiles.
   */
  getAllProfiles(options?: {
    limit?: number;
    offset?: number;
  }): Promise<CareerMarketProfile[]>;

  /**
   * Get profiles by outlook.
   */
  getProfilesByOutlook(outlook: MarketOutlook): Promise<CareerMarketProfile[]>;

  /**
   * Get profiles with minimum confidence.
   */
  getProfilesWithMinConfidence(minConfidence: number): Promise<CareerMarketProfile[]>;

  /**
   * Get top profiles by score.
   */
  getTopProfilesByScore(scoreType: keyof CareerMarketProfile['components'], limit: number): Promise<CareerMarketProfile[]>;

  /**
   * Get profiles requiring update.
   */
  getProfilesRequiringUpdate(maxAgeHours: number): Promise<CareerMarketProfile[]>;

  /**
   * Get recently updated profiles.
   */
  getRecentlyUpdated(since: Date): Promise<CareerMarketProfile[]>;

  // ============================================================================
  // PROFILE HISTORY
  // ============================================================================

  /**
   * Save a profile snapshot.
   */
  saveProfileSnapshot(careerId: string, snapshot: CareerMarketProfileSnapshot): Promise<void>;

  /**
   * Get profile history.
   */
  getProfileHistory(careerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CareerMarketProfileSnapshot[]>;

  /**
   * Get profile at specific time.
   */
  getProfileAtTime(careerId: string, timestamp: Date): Promise<CareerMarketProfileSnapshot | null>;

  /**
   * Get score history for a specific metric.
   */
  getScoreHistory(
    careerId: string,
    scoreType: keyof CareerMarketProfile,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Array<{ date: Date; value: number; confidence: number }>>;

  // ============================================================================
  // PROFILE COMPARISON
  // ============================================================================

  /**
   * Compare two career profiles.
   */
  compareProfiles(
    careerId1: string,
    careerId2: string
  ): Promise<CareerMarketProfileComparison>;

  /**
   * Get similar profiles.
   */
  getSimilarProfiles(careerId: string, options?: {
    minSimilarity?: number;
    limit?: number;
  }): Promise<Array<{ profile: CareerMarketProfile; similarity: number }>>;

  /**
   * Get profiles in score range.
   */
  getProfilesInScoreRange(
    scoreType: keyof CareerMarketProfile,
    minScore: number,
    maxScore: number
  ): Promise<CareerMarketProfile[]>;

  // ============================================================================
  // PROFILE STATISTICS
  // ============================================================================

  /**
   * Get market statistics.
   */
  getMarketStatistics(): Promise<{
    totalProfiles: number;
    byOutlook: Record<MarketOutlook, number>;
    averageConfidence: number;
    averageScores: {
      demandScore: number;
      salaryScore: number;
      growthScore: number;
      scarcityScore: number;
      automationRiskScore: number;
      futureResilienceScore: number;
    };
  }>;

  /**
   * Get score distribution.
   */
  getScoreDistribution(scoreType: keyof CareerMarketProfile): Promise<{
    min: number;
    max: number;
    average: number;
    median: number;
    distribution: Array<{ range: string; count: number }>;
  }>;

  /**
   * Get trends across all careers.
   */
  getOverallTrends(timeRange: { start: Date; end: Date }): Promise<{
    demandTrend: number;
    salaryTrend: number;
    growthTrend: number;
    automationRiskTrend: number;
  }>;

  // ============================================================================
  // SEARCH
  // ============================================================================

  /**
   * Search profiles by criteria.
   */
  searchProfiles(criteria: {
    minDemandScore?: number;
    minSalaryScore?: number;
    minGrowthScore?: number;
    maxAutomationRisk?: number;
    outlook?: MarketOutlook;
  }): Promise<CareerMarketProfile[]>;

  /**
   * Find profiles with significant changes.
   */
  findProfilesWithSignificantChanges(
    timeWindow: { start: Date; end: Date },
    minChange: number
  ): Promise<Array<{ profile: CareerMarketProfile; change: number }>>;

  // ============================================================================
  // MAINTENANCE
  // ============================================================================

  /**
   * Archive old snapshots.
   */
  archiveOldSnapshots(olderThan: Date): Promise<number>;

  /**
   * Consolidate history.
   */
  consolidateHistory(careerId: string, options?: {
    keepDaily?: number;
    keepWeekly?: number;
    keepMonthly?: number;
  }): Promise<void>;

  /**
   * Validate all profiles.
   */
  validateAllProfiles(): Promise<{
    valid: number;
    invalid: number;
    issues: Array<{ careerId: string; issues: string[] }>;
  }>;

  /**
   * Repository health check.
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    profileCount: number;
    lastUpdate: Date | null;
    issues: string[];
  }>;
}

/**
 * Repository configuration options.
 */
export interface CareerMarketRepositoryConfig {
  /** Maximum history snapshots to keep per career */
  maxHistorySnapshots: number;

  /** Profile update frequency (hours) */
  profileUpdateFrequencyHours: number;

  /** Enable automatic archiving */
  enableArchiving: boolean;

  /** Archive threshold (days) */
  archiveThresholdDays: number;

  /** Cache TTL (minutes) */
  cacheTtlMinutes: number;
}

/**
 * Default repository configuration.
 */
export const DEFAULT_CAREER_MARKET_REPOSITORY_CONFIG: CareerMarketRepositoryConfig = {
  maxHistorySnapshots: 100,
  profileUpdateFrequencyHours: 24,
  enableArchiving: true,
  archiveThresholdDays: 365,
  cacheTtlMinutes: 60,
};
