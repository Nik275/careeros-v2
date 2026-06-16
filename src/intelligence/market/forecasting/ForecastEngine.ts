/**
 * CareerOS Market Intelligence - Forecast Engine
 *
 * Main orchestrator for market forecasting.
 *
 * Purpose:
 * - Coordinate all forecasting engines
 * - Provide unified forecasting interface
 * - Manage forecast lifecycle
 * - Track forecast accuracy
 *
 * Principle: Never output deterministic predictions.
 * Always output scenarios with confidence and uncertainty.
 */

import type { Forecast } from './models/Forecast';
import type { ForecastHorizon } from './models/Forecast';
import type { CareerForecastInputs, CareerForecastResult } from './CareerForecastEngine';
import type { SkillForecastInputs, SkillForecastResult } from './SkillForecastEngine';
import type { IndustryForecastInputs, IndustryForecastResult } from './IndustryForecastEngine';
import type { RegionForecastInputs, RegionForecastResult } from './RegionForecastEngine';
import { CareerForecastEngine, createCareerForecastEngine } from './CareerForecastEngine';
import { SkillForecastEngine, createSkillForecastEngine } from './SkillForecastEngine';
import { IndustryForecastEngine, createIndustryForecastEngine } from './IndustryForecastEngine';
import { RegionForecastEngine, createRegionForecastEngine } from './RegionForecastEngine';
import { ForecastValidationEngine, createForecastValidationEngine } from './ForecastValidationEngine';
import type { ValidationResult, CalibrationMetrics } from './ForecastValidationEngine';

/**
 * Forecast engine configuration.
 */
export interface ForecastEngineConfig {
  /** Default horizon for forecasts */
  defaultHorizon: ForecastHorizon;

  /** Enable career forecasting */
  enableCareerForecasting: boolean;

  /** Enable skill forecasting */
  enableSkillForecasting: boolean;

  /** Enable industry forecasting */
  enableIndustryForecasting: boolean;

  /** Enable region forecasting */
  enableRegionForecasting: boolean;

  /** Enable validation tracking */
  enableValidation: boolean;

  /** Auto-validate forecasts */
  autoValidate: boolean;

  /** Cache forecasts */
  cacheForecasts: boolean;

  /** Cache TTL (hours) */
  cacheTTL: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_FORECAST_CONFIG: ForecastEngineConfig = {
  defaultHorizon: '3_year',
  enableCareerForecasting: true,
  enableSkillForecasting: true,
  enableIndustryForecasting: true,
  enableRegionForecasting: true,
  enableValidation: true,
  autoValidate: false,
  cacheForecasts: true,
  cacheTTL: 24,
};

/**
 * Batch forecast result.
 */
export interface BatchForecastResult {
  /** Career forecasts */
  careers: CareerForecastResult[];

  /** Skill forecasts */
  skills: SkillForecastResult[];

  /** Industry forecasts */
  industries: IndustryForecastResult[];

  /** Region forecasts */
  regions: RegionForecastResult[];

  /** Summary statistics */
  summary: {
    totalForecasts: number;
    highConfidenceCount: number;
    averageConfidence: number;
    processingTime: number;
  };
}

/**
 * Forecast comparison result.
 */
export interface ForecastComparison {
  /** Best performing */
  topPerformers: Array<{ entityId: string; entityType: string; score: number }>;

  /** Most uncertain */
  mostUncertain: Array<{ entityId: string; entityType: string; uncertainty: number }>;

  /** Riskiest */
  riskiest: Array<{ entityId: string; entityType: string; riskScore: number }>;

  /** Safest */
  safest: Array<{ entityId: string; entityType: string; safetyScore: number }>;
}

/**
 * Main forecast orchestrator.
 */
export class ForecastEngine {
  private config: ForecastEngineConfig;

  // Domain engines
  private careerEngine: CareerForecastEngine;
  private skillEngine: SkillForecastEngine;
  private industryEngine: IndustryForecastEngine;
  private regionEngine: RegionForecastEngine;

  // Validation engine
  private validationEngine: ForecastValidationEngine;

  // Forecast cache
  private forecastCache: Map<string, { forecast: Forecast; expiresAt: Date }> = new Map();
  private careerResultCache: Map<string, { result: CareerForecastResult; expiresAt: Date }> = new Map();
  private skillResultCache: Map<string, { result: SkillForecastResult; expiresAt: Date }> = new Map();

  constructor(config?: Partial<ForecastEngineConfig>) {
    this.config = { ...DEFAULT_FORECAST_CONFIG, ...config };

    // Initialize engines
    this.careerEngine = createCareerForecastEngine();
    this.skillEngine = createSkillForecastEngine();
    this.industryEngine = createIndustryForecastEngine();
    this.regionEngine = createRegionForecastEngine();

    // Initialize validation
    this.validationEngine = createForecastValidationEngine();
  }

  /**
   * Generate career forecast.
   */
  forecastCareer(
    inputs: CareerForecastInputs,
    horizon?: ForecastHorizon
  ): CareerForecastResult {
    if (!this.config.enableCareerForecasting) {
      throw new Error('Career forecasting is disabled');
    }

    const targetHorizon = horizon ?? this.config.defaultHorizon;

    // Check cache
    const cacheKey = `career-${inputs.careerId}-${targetHorizon}`;
    const cached = this.getCachedCareerResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate forecast
    const result = this.careerEngine.generateForecast(inputs, targetHorizon);

    // Cache result
    if (this.config.cacheForecasts) {
      this.cacheCareerResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Generate skill forecast.
   */
  forecastSkill(
    inputs: SkillForecastInputs,
    horizon?: ForecastHorizon
  ): SkillForecastResult {
    if (!this.config.enableSkillForecasting) {
      throw new Error('Skill forecasting is disabled');
    }

    const targetHorizon = horizon ?? this.config.defaultHorizon;

    // Check cache
    const cacheKey = `skill-${inputs.skillId}-${targetHorizon}`;
    const cached = this.getCachedSkillResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate forecast
    const result = this.skillEngine.generateForecast(inputs, targetHorizon);

    // Cache result
    if (this.config.cacheForecasts) {
      this.cacheSkillResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Generate industry forecast.
   */
  forecastIndustry(
    inputs: IndustryForecastInputs,
    horizon?: ForecastHorizon
  ): IndustryForecastResult {
    if (!this.config.enableIndustryForecasting) {
      throw new Error('Industry forecasting is disabled');
    }

    const targetHorizon = horizon ?? this.config.defaultHorizon;

    // Generate forecast
    const result = this.industryEngine.generateForecast(inputs, targetHorizon);

    return result;
  }

  /**
   * Generate region forecast.
   */
  forecastRegion(
    inputs: RegionForecastInputs,
    horizon?: ForecastHorizon
  ): RegionForecastResult {
    if (!this.config.enableRegionForecasting) {
      throw new Error('Region forecasting is disabled');
    }

    const targetHorizon = horizon ?? this.config.defaultHorizon;

    // Generate forecast
    const result = this.regionEngine.generateForecast(inputs, targetHorizon);

    return result;
  }

  /**
   * Generate batch forecasts.
   */
  generateBatchForecasts(params: {
    careers?: CareerForecastInputs[];
    skills?: SkillForecastInputs[];
    industries?: IndustryForecastInputs[];
    regions?: RegionForecastInputs[];
    horizon?: ForecastHorizon;
  }): BatchForecastResult {
    const startTime = Date.now();
    const horizon = params.horizon ?? this.config.defaultHorizon;

    const result: BatchForecastResult = {
      careers: [],
      skills: [],
      industries: [],
      regions: [],
      summary: {
        totalForecasts: 0,
        highConfidenceCount: 0,
        averageConfidence: 0,
        processingTime: 0,
      },
    };

    // Generate career forecasts
    if (params.careers && this.config.enableCareerForecasting) {
      for (const career of params.careers) {
        result.careers.push(this.careerEngine.generateForecast(career, horizon));
      }
    }

    // Generate skill forecasts
    if (params.skills && this.config.enableSkillForecasting) {
      for (const skill of params.skills) {
        result.skills.push(this.skillEngine.generateForecast(skill, horizon));
      }
    }

    // Generate industry forecasts
    if (params.industries && this.config.enableIndustryForecasting) {
      for (const industry of params.industries) {
        result.industries.push(this.industryEngine.generateForecast(industry, horizon));
      }
    }

    // Generate region forecasts
    if (params.regions && this.config.enableRegionForecasting) {
      for (const region of params.regions) {
        result.regions.push(this.regionEngine.generateForecast(region, horizon));
      }
    }

    // Calculate summary
    const allForecasts = [
      ...result.careers.map((c) => c.forecast),
      ...result.skills.map((s) => s.forecast),
      ...result.industries.map((i) => i.forecast),
      ...result.regions.map((r) => r.forecast),
    ];

    result.summary.totalForecasts = allForecasts.length;
    result.summary.highConfidenceCount = allForecasts.filter(
      (f) => f.confidence.level === 'high' || f.confidence.level === 'very_high'
    ).length;
    result.summary.averageConfidence =
      allForecasts.length > 0
        ? Math.round(
            allForecasts.reduce((sum, f) => sum + f.confidence.overall, 0) /
              allForecasts.length
          )
        : 0;
    result.summary.processingTime = Date.now() - startTime;

    return result;
  }

  /**
   * Compare forecasts across entities.
   */
  compareForecasts(params: {
    careers?: Array<{ careerId: string; forecast: Forecast }>;
    skills?: Array<{ skillId: string; forecast: Forecast }>;
    industries?: Array<{ industryId: string; forecast: Forecast }>;
    regions?: Array<{ regionId: string; forecast: Forecast; costOfLiving: number }>;
  }): ForecastComparison {
    const comparison: ForecastComparison = {
      topPerformers: [],
      mostUncertain: [],
      riskiest: [],
      safest: [],
    };

    // Compare careers
    if (params.careers) {
      const careerComparison = this.careerEngine.compareCareers(params.careers);
      for (const c of careerComparison.slice(0, 5)) {
        comparison.topPerformers.push({
          entityId: c.careerId,
          entityType: 'career',
          score: c.overallScore,
        });
      }
    }

    // Compare skills
    if (params.skills) {
      const skillComparison = this.skillEngine.compareSkills(params.skills);
      for (const s of skillComparison.slice(0, 5)) {
        comparison.topPerformers.push({
          entityId: s.skillId,
          entityType: 'skill',
          score: s.investmentValue,
        });
      }
    }

    // Compare industries
    if (params.industries) {
      const industryComparison = this.industryEngine.compareIndustries(params.industries);
      for (const i of industryComparison.slice(0, 5)) {
        comparison.topPerformers.push({
          entityId: i.industryId,
          entityType: 'industry',
          score: i.attractiveness,
        });
      }
    }

    // Compare regions
    if (params.regions) {
      const regionComparison = this.regionEngine.compareRegions(params.regions);
      for (const r of regionComparison.slice(0, 5)) {
        comparison.topPerformers.push({
          entityId: r.regionId,
          entityType: 'region',
          score: r.attractiveness,
        });
      }
    }

    // Sort top performers
    comparison.topPerformers.sort((a, b) => b.score - a.score);
    comparison.topPerformers = comparison.topPerformers.slice(0, 10);

    // Identify most uncertain (lowest confidence)
    const allForecasts: Array<{ entityId: string; entityType: string; forecast: Forecast }> = [];

    if (params.careers) {
      for (const c of params.careers) {
        allForecasts.push({
          entityId: c.careerId,
          entityType: 'career',
          forecast: c.forecast,
        });
      }
    }

    if (params.skills) {
      for (const s of params.skills) {
        allForecasts.push({
          entityId: s.skillId,
          entityType: 'skill',
          forecast: s.forecast,
        });
      }
    }

    if (params.industries) {
      for (const i of params.industries) {
        allForecasts.push({
          entityId: i.industryId,
          entityType: 'industry',
          forecast: i.forecast,
        });
      }
    }

    // Most uncertain (low confidence, wide ranges)
    const uncertain = [...allForecasts]
      .sort(
        (a, b) =>
          (100 - a.forecast.confidence.overall) - (100 - b.forecast.confidence.overall)
      )
      .slice(0, 5);

    for (const u of uncertain) {
      comparison.mostUncertain.push({
        entityId: u.entityId,
        entityType: u.entityType,
        uncertainty: 100 - u.forecast.confidence.overall,
      });
    }

    return comparison;
  }

  /**
   * Validate forecast against actual outcomes.
   */
  validateForecast(
    forecast: Forecast,
    actualValues: {
      demand?: number;
      salary?: number;
      growth?: number;
      opportunity?: number;
    }
  ): ValidationResult {
    if (!this.config.enableValidation) {
      throw new Error('Validation is disabled');
    }

    return this.validationEngine.validateForecast(forecast, actualValues);
  }

  /**
   * Get calibration metrics.
   */
  getCalibrationMetrics(): CalibrationMetrics | null {
    if (!this.config.enableValidation) {
      return null;
    }

    return this.validationEngine.calculateCalibration();
  }

  /**
   * Get accuracy statistics.
   */
  getAccuracyStats(): ReturnType<ForecastValidationEngine['getAccuracyStats']> {
    return this.validationEngine.getAccuracyStats();
  }

  /**
   * Get cached forecast.
   */
  getCachedForecast(entityId: string, horizon: ForecastHorizon): Forecast | null {
    const cacheKey = `${entityId}-${horizon}`;
    const cached = this.forecastCache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      return cached.forecast;
    }

    // Remove expired
    if (cached) {
      this.forecastCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Invalidate cache for entity.
   */
  invalidateCache(entityId: string): void {
    for (const key of this.forecastCache.keys()) {
      if (key.startsWith(entityId) || key.includes(`-${entityId}-`)) {
        this.forecastCache.delete(key);
      }
    }

    for (const key of this.careerResultCache.keys()) {
      if (key.startsWith(`career-${entityId}-`)) {
        this.careerResultCache.delete(key);
      }
    }

    for (const key of this.skillResultCache.keys()) {
      if (key.startsWith(`skill-${entityId}-`)) {
        this.skillResultCache.delete(key);
      }
    }
  }

  /**
   * Clear all caches.
   */
  clearCache(): void {
    this.forecastCache.clear();
    this.careerResultCache.clear();
    this.skillResultCache.clear();
  }

  /**
   * Get engine statistics.
   */
  getStatistics(): {
    totalCachedForecasts: number;
    cacheHitRate: number;
    validationCount: number;
  } {
    return {
      totalCachedForecasts:
        this.forecastCache.size + this.careerResultCache.size + this.skillResultCache.size,
      cacheHitRate: 0, // Would need tracking
      validationCount: this.config.enableValidation
        ? this.validationEngine.getAccuracyStats().totalValidations
        : 0,
    };
  }

  // Private methods

  private getCachedForecastByKey(key: string): Forecast | null {
    const cached = this.forecastCache.get(key);

    if (cached && cached.expiresAt > new Date()) {
      return cached.forecast;
    }

    if (cached) {
      this.forecastCache.delete(key);
    }

    return null;
  }

  private cacheForecast(key: string, forecast: Forecast): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheTTL);

    this.forecastCache.set(key, { forecast, expiresAt });
  }

  private getCachedCareerResult(key: string): CareerForecastResult | null {
    const cached = this.careerResultCache.get(key);

    if (cached && cached.expiresAt > new Date()) {
      return cached.result;
    }

    if (cached) {
      this.careerResultCache.delete(key);
    }

    return null;
  }

  private cacheCareerResult(key: string, result: CareerForecastResult): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheTTL);

    this.careerResultCache.set(key, { result, expiresAt });
    this.cacheForecast(key, result.forecast);
  }

  private getCachedSkillResult(key: string): SkillForecastResult | null {
    const cached = this.skillResultCache.get(key);

    if (cached && cached.expiresAt > new Date()) {
      return cached.result;
    }

    if (cached) {
      this.skillResultCache.delete(key);
    }

    return null;
  }

  private cacheSkillResult(key: string, result: SkillForecastResult): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheTTL);

    this.skillResultCache.set(key, { result, expiresAt });
    this.cacheForecast(key, result.forecast);
  }
}

/**
 * Factory function for ForecastEngine.
 */
export function createForecastEngine(config?: Partial<ForecastEngineConfig>): ForecastEngine {
  return new ForecastEngine(config);
}
