/**
 * CareerOS Confidence Authority
 * 
 * SINGLE constitutional owner of all uncertainty quantification.
 * 
 * No other system may calculate confidence.
 * No other system may calculate uncertainty.
 * No other system may calculate reliability.
 * 
 * @module confidence/authority
 * @version 1.0.0
 */

import type {
  Confidence,
  ConfidenceValue,
  ConfidenceRequest,
  UncertaintyProfile,
  ReliabilityAssessment,
  CalibrationObservation,
  CalibrationProfile,
  AggregationMethod,
  ConfidenceExplanation,
  ConfidenceFactor,
  ReliabilityTrend,
  HistoryQueryOptions,
  ConfidenceHistory as ConfidenceHistorySnapshot,
} from './ConfidenceTypes';

import { ConfidenceCalculator, getConfidenceCalculator } from './ConfidenceCalculator';
import { ConfidenceAggregator, getConfidenceAggregator } from './ConfidenceAggregator';
import { ConfidenceCalibration, getConfidenceCalibration } from './ConfidenceCalibration';
import { ConfidenceHistory, getConfidenceHistory } from './ConfidenceHistory';
import { ConfidenceMonitor, getConfidenceMonitor } from './ConfidenceMonitoring';
import { ConfidenceEventEmitter, createCalculatedEvent } from './ConfidenceEvents';
import type { IConfidenceAuthority } from './IConfidenceAuthority';
import { uuidv4 } from './ConfidenceId';

// ============================================================================
// AUTHORITY CONFIGURATION
// ============================================================================

export interface ConfidenceAuthorityConfig {
  /** Enable caching */
  readonly enableCache: boolean;
  
  /** Cache TTL in milliseconds */
  readonly cacheTtlMs: number;
  
  /** Enable calibration */
  readonly enableCalibration: boolean;
  
  /** Enable monitoring */
  readonly enableMonitoring: boolean;
  
  /** Enable audit logging */
  readonly enableAudit: boolean;
}

export const DEFAULT_AUTHORITY_CONFIG: ConfidenceAuthorityConfig = {
  enableCache: true,
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes
  enableCalibration: true,
  enableMonitoring: true,
  enableAudit: true,
};

// ============================================================================
// CONFIDENCE AUTHORITY
// ============================================================================

export class ConfidenceAuthority implements IConfidenceAuthority {
  private config: ConfidenceAuthorityConfig;
  private calculator: ConfidenceCalculator;
  private aggregator: ConfidenceAggregator;
  private calibration: ConfidenceCalibration;
  private history: ConfidenceHistory;
  private monitor: ConfidenceMonitor;
  private eventEmitter: ConfidenceEventEmitter;
  
  // Cache
  private cache: Map<string, { value: ConfidenceValue; expires: number }> = new Map();

  constructor(config: Partial<ConfidenceAuthorityConfig> = {}) {
    this.config = { ...DEFAULT_AUTHORITY_CONFIG, ...config };
    
    // Initialize components
    this.eventEmitter = new ConfidenceEventEmitter();
    this.calculator = getConfidenceCalculator();
    this.aggregator = getConfidenceAggregator();
    this.calibration = getConfidenceCalibration();
    this.history = getConfidenceHistory();
    this.monitor = getConfidenceMonitor({}, this.eventEmitter);
  }

  // ========================================================================
  // CONFIDENCE CALCULATION
  // ========================================================================

  /**
   * Calculate confidence for any prediction.
   * 
   * THIS IS THE SINGLE ENTRY POINT FOR ALL CONFIDENCE CALCULATIONS.
   * 
   * @param request - Confidence calculation request
   * @returns Confidence value with full metadata
   */
  async calculateConfidence(request: ConfidenceRequest): Promise<ConfidenceValue> {
    const startTime = Date.now();
    
    try {
      // Validate request
      this.validateRequest(request);

      // Check cache
      if (this.config.enableCache) {
        const cached = this.getCached(request);
        if (cached) {
          return cached;
        }
      }

      // Calculate confidence
      const confidence = this.calculator.calculateFromRequest(request);

      // Apply calibration
      let calibratedConfidence = confidence;
      if (this.config.enableCalibration) {
        calibratedConfidence = this.calibration.calibrateConfidence(
          confidence,
          request.requestingSystem
        );
      }

      // Store in history
      this.history.store(calibratedConfidence, request.requestingSystem);

      // Record in monitor
      if (this.config.enableMonitoring) {
        this.monitor.recordCalculation(calibratedConfidence, Date.now() - startTime);
      }

      // Emit event
      this.eventEmitter.emit(createCalculatedEvent(
        calibratedConfidence.lineageId,
        request.requestId,
        request.requestingSystem,
        request.predictionType,
        calibratedConfidence.value,
        Date.now() - startTime,
        calibratedConfidence.factors.map(f => f.name)
      ));

      // Cache result
      if (this.config.enableCache) {
        this.setCached(request, calibratedConfidence);
      }

      return calibratedConfidence;
    } catch {
      // Record error
      this.monitor.recordError();
      
      // Return fallback confidence
      console.error('Confidence calculation failed safely.');
      return this.createFallbackConfidence(request);
    }
  }

  /**
   * Calculate confidence for multiple predictions (batch).
   * 
   * @param requests - Array of confidence requests
   * @returns Array of confidence values
   */
  async calculateConfidenceBatch(
    requests: ConfidenceRequest[]
  ): Promise<ConfidenceValue[]> {
    // Process in parallel
    const promises = requests.map(req => this.calculateConfidence(req));
    return Promise.all(promises);
  }

  /**
   * Calculate uncertainty profile.
   * 
   * @param request - Uncertainty calculation request
   * @returns Uncertainty profile
   */
  async calculateUncertainty(
    request: Omit<ConfidenceRequest, 'requiredComponents'>
  ): Promise<UncertaintyProfile> {
    // Calculate base confidence
    const confidence = await this.calculateConfidence({
      ...request,
      requiredComponents: ['model-confidence'],
    });

    // Derive uncertainty from confidence
    const overallUncertainty = 1 - confidence.value;

    // Calculate components
    const components = confidence.factors.map(f => ({
      name: f.name,
      uncertainty: 1 - f.score,
      reducible: f.score < 0.8,
      reductionActions: this.generateReductionActions(f.name, f.score),
    }));

    return {
      overall: overallUncertainty,
      aleatoric: overallUncertainty * 0.3, // 30% irreducible
      epistemic: overallUncertainty * 0.4, // 40% knowledge gaps
      model: overallUncertainty * 0.2,     // 20% model uncertainty
      data: overallUncertainty * 0.1,      // 10% data uncertainty
      components,
    };
  }

  /**
   * Calculate reliability assessment.
   * 
   * @param request - Reliability assessment request
   * @returns Reliability assessment
   */
  async calculateReliability(
    request: { systemId: string; lookbackPeriod?: number }
  ): Promise<ReliabilityAssessment> {
    const profile = this.calibration.getProfile(request.systemId);
    const trend = this.history.getTrend(request.systemId);

    // Build factors
    const factors: ReliabilityAssessment['factors'] = [
      {
        name: 'calibration-accuracy',
        score: 1 - profile.calibrationError,
        weight: 0.4,
        impact: profile.calibrationError < 0.15 ? 'positive' : 'negative',
      },
      {
        name: 'sample-size',
        score: Math.min(1, profile.sampleSize / 100),
        weight: 0.3,
        impact: profile.sampleSize > 50 ? 'positive' : 'negative',
      },
      {
        name: 'trend-stability',
        score: trend.direction === 'stable' ? 0.9 : 0.6,
        weight: 0.3,
        impact: trend.direction === 'stable' ? 'positive' : 'negative',
      },
    ];

    // Calculate overall reliability
    const overall = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

    return {
      overall,
      factors,
      trend: {
        direction: trend.direction,
        rate: trend.rate,
        periods: 10,
      },
      recommendations: this.generateReliabilityRecommendations(profile, trend),
    };
  }

  // ========================================================================
  // CALIBRATION
  // ========================================================================

  /**
   * Add calibration observation.
   * 
   * @param observation - Calibration observation
   */
  async addCalibrationObservation(observation: CalibrationObservation): Promise<void> {
    this.calibration.addObservation(observation);
  }

  /**
   * Get calibration profile for system.
   * 
   * @param systemId - System identifier
   * @returns Calibration profile
   */
  async getCalibrationProfile(systemId: string): Promise<CalibrationProfile> {
    return this.calibration.getProfile(systemId);
  }

  /**
   * Apply calibration adjustment to confidence.
   * 
   * @param confidence - Raw confidence
   * @param systemId - System that produced confidence
   * @returns Calibrated confidence
   */
  async calibrateConfidence(
    confidence: Confidence,
    systemId: string
  ): Promise<ConfidenceValue> {
    const tempValue: ConfidenceValue = {
      value: confidence,
      lineageId: `temp-${uuidv4()}`,
      authority: 'ConfidenceAuthority',
      component: 'calibration',
      calculatedAt: Date.now(),
      factors: [],
      evidence: [],
      calibration: {
        isCalibrated: false,
        error: 0.2,
        sampleSize: 0,
        reliability: 'unreliable',
      },
      bounds: {
        lower: confidence * 0.9,
        upper: Math.min(1, confidence * 1.1),
        confidenceLevel: 0.95,
      },
    };

    return this.calibration.calibrateConfidence(tempValue, systemId);
  }

  /**
   * Check if system is calibrated.
   * 
   * @param systemId - System identifier
   * @returns True if calibrated
   */
  async isCalibrated(systemId: string): Promise<boolean> {
    return this.calibration.isCalibrated(systemId);
  }

  // ========================================================================
  // EXPLANATION
  // ========================================================================

  /**
   * Get explanation for confidence value.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Human-readable explanation
   */
  async explainConfidence(lineageId: string): Promise<ConfidenceExplanation> {
    // Find confidence in history
    const allHistories = this.history.getSystemIds().map(id =>
      this.history.getHistory(id)
    );
    
    const entry = allHistories
      .flatMap(h => h.entries)
      .find(e => e.lineageId === lineageId);

    if (!entry) {
      return {
        summary: 'Confidence not found',
        factors: [],
        recommendations: [],
        confidence: 0.5,
      };
    }

    const confidence = entry.confidence;

    return {
      summary: `Confidence of ${Math.round(confidence * 100)}% based on historical calculations`,
      factors: [`Historical average: ${Math.round(confidence * 100)}%`],
      recommendations: this.generateExplanationRecommendations(confidence),
      confidence,
    };
  }

  /**
   * Get confidence factors breakdown.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Factor breakdown
   */
  async getConfidenceFactors(lineageId: string): Promise<ConfidenceFactor[]> {
    // In a real implementation, we'd store and retrieve the full factor list
    // For now, return empty array
    return [];
  }

  // ========================================================================
  // SOURCE TRUST
  // ========================================================================

  /**
   * Get trust score for data source.
   * 
   * @param sourceId - Source identifier
   * @returns Source trust assessment
   */
  async getSourceTrust(sourceId: string): Promise<{
    sourceId: string;
    trustScore: number;
    reliability: 'high' | 'moderate' | 'low';
    lastUpdated: number;
  }> {
    // In a real implementation, this would query a source trust store
    // For now, return default values
    return {
      sourceId,
      trustScore: 0.7,
      reliability: 'moderate',
      lastUpdated: Date.now(),
    };
  }

  /**
   * Update source trust based on outcomes.
   * 
   * @param sourceId - Source identifier
   * @param outcome - Outcome data
   */
  async updateSourceTrust(
    sourceId: string,
    outcome: { predicted: boolean; actual: boolean; confidence: Confidence }
  ): Promise<void> {
    void sourceId;
    void outcome;
    // In a real implementation, this would update a privacy-safe source trust store.
  }

  // ========================================================================
  // AGGREGATION
  // ========================================================================

  /**
   * Aggregate multiple confidence values.
   * 
   * @param confidences - Confidence values to aggregate
   * @param method - Aggregation method
   * @returns Aggregated confidence
   */
  async aggregateConfidence(
    confidences: ConfidenceValue[],
    method: AggregationMethod
  ): Promise<ConfidenceValue> {
    return this.aggregator.aggregate({
      confidences,
      method,
      systemId: 'aggregation',
      requestId: uuidv4(),
    });
  }

  // ========================================================================
  // QUERY
  // ========================================================================

  /**
   * Get confidence history for system.
   * 
   * @param systemId - System identifier
   * @param options - Query options
   * @returns Confidence history
   */
  async getConfidenceHistory(
    systemId: string,
    options?: HistoryQueryOptions
  ): Promise<ConfidenceHistorySnapshot> {
    return this.history.getHistory(systemId);
  }

  /**
   * Get reliability trend for system.
   * 
   * @param systemId - System identifier
   * @returns Reliability trend
   */
  async getReliabilityTrend(systemId: string): Promise<ReliabilityTrend> {
    return this.history.getTrend(systemId);
  }

  // ========================================================================
  // HEALTH & MONITORING
  // ========================================================================

  /**
   * Get overall health status.
   */
  getHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    metrics: ReturnType<ConfidenceMonitor['getMetrics']>;
    systems: ReturnType<ConfidenceMonitor['getAllSystemHealth']>;
  } {
    const metrics = this.monitor.getMetrics();
    const systems = this.monitor.getAllSystemHealth();
    
    const criticalSystems = systems.filter(s => s.status === 'critical');
    const degradedSystems = systems.filter(s => s.status === 'degraded');

    let status: 'healthy' | 'degraded' | 'critical';
    if (criticalSystems.length > 0) {
      status = 'critical';
    } else if (degradedSystems.length > 0) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return { status, metrics, systems };
  }

  /**
   * Get event emitter.
   */
  getEventEmitter(): ConfidenceEventEmitter {
    return this.eventEmitter;
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private validateRequest(request: ConfidenceRequest): void {
    if (!request.requestId) {
      throw new Error('Request ID is required');
    }
    if (!request.requestingSystem) {
      throw new Error('Requesting system is required');
    }
    if (!request.predictionType) {
      throw new Error('Prediction type is required');
    }
  }

  private getCached(request: ConfidenceRequest): ConfidenceValue | null {
    const key = this.getCacheKey(request);
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCached(request: ConfidenceRequest, value: ConfidenceValue): void {
    const key = this.getCacheKey(request);
    this.cache.set(key, {
      value,
      expires: Date.now() + this.config.cacheTtlMs,
    });
  }

  private getCacheKey(request: ConfidenceRequest): string {
    // Simple cache key based on system and prediction type
    return `${request.requestingSystem}:${request.predictionType}:${JSON.stringify(request.prediction)}`;
  }

  private createFallbackConfidence(request: ConfidenceRequest): ConfidenceValue {
    const lineageId = `fallback-${uuidv4()}`;
    
    return {
      value: 0.5,
      lineageId,
      authority: 'ConfidenceAuthority',
      component: 'fallback',
      calculatedAt: Date.now(),
      factors: [{
        name: 'fallback',
        weight: 1.0,
        score: 0.5,
        contribution: 0.5,
        explanation: 'Fallback confidence due to calculation error',
      }],
      evidence: [],
      calibration: {
        isCalibrated: false,
        error: 0.5,
        sampleSize: 0,
        reliability: 'unreliable',
      },
      bounds: {
        lower: 0.4,
        upper: 0.6,
        confidenceLevel: 0.95,
      },
    };
  }

  private generateReductionActions(name: string, score: number): string[] {
    if (score >= 0.8) {
      return ['No action needed'];
    }
    
    const actions: Record<string, string[]> = {
      'profile-confidence': ['Complete more assessments', 'Verify profile data'],
      'career-confidence': ['Gather more career data', 'Check data sources'],
      'evidence-confidence': ['Collect more evidence', 'Verify evidence quality'],
      'calculation-confidence': ['Review calculation method', 'Check for errors'],
    };

    return actions[name] ?? ['Improve data quality'];
  }

  private generateReliabilityRecommendations(
    profile: CalibrationProfile,
    trend: { direction: string }
  ): string[] {
    const recommendations: string[] = [];

    if (profile.status === 'insufficient_data') {
      recommendations.push('Collect more observations for calibration');
    }

    if (profile.calibrationError > 0.15) {
      recommendations.push('Recalibrate system to improve accuracy');
    }

    if (trend.direction === 'degrading') {
      recommendations.push('Investigate degrading reliability trend');
    }

    if (profile.sampleSize < 50) {
      recommendations.push('Increase sample size for better calibration');
    }

    return recommendations;
  }

  private generateExplanationRecommendations(confidence: Confidence): string[] {
    if (confidence >= 0.8) {
      return ['Confidence is high - proceed with recommendation'];
    }
    if (confidence >= 0.6) {
      return ['Confidence is moderate - consider additional data'];
    }
    if (confidence >= 0.4) {
      return ['Confidence is low - gather more information'];
    }
    return ['Confidence is very low - significant uncertainty exists'];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalAuthority: ConfidenceAuthority | null = null;

export function getConfidenceAuthority(
  config?: Partial<ConfidenceAuthorityConfig>
): ConfidenceAuthority {
  if (!globalAuthority) {
    globalAuthority = new ConfidenceAuthority(config);
  }
  return globalAuthority;
}

export function resetConfidenceAuthority(): void {
  globalAuthority = null;
}

// Default export
export default ConfidenceAuthority;
