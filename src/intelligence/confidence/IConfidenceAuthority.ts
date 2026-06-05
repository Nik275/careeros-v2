/**
 * CareerOS Confidence Authority Interface
 * 
 * Public contract for the Confidence Authority.
 * 
 * @module confidence/interface
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
  ConfidenceHistory,
} from './ConfidenceTypes';

/**
 * Confidence Authority Public Interface
 * 
 * Single entry point for all confidence operations.
 */
export interface IConfidenceAuthority {
  // ========================================================================
  // CONFIDENCE CALCULATION
  // ========================================================================
  
  /**
   * Calculate confidence for any prediction.
   * 
   * @param request - Confidence calculation request
   * @returns Confidence value with full metadata
   */
  calculateConfidence(request: ConfidenceRequest): Promise<ConfidenceValue>;
  
  /**
   * Calculate confidence for multiple predictions (batch).
   * 
   * @param requests - Array of confidence requests
   * @returns Array of confidence values
   */
  calculateConfidenceBatch(
    requests: ConfidenceRequest[]
  ): Promise<ConfidenceValue[]>;
  
  /**
   * Calculate uncertainty profile.
   * 
   * @param request - Uncertainty calculation request
   * @returns Uncertainty profile
   */
  calculateUncertainty(
    request: Omit<ConfidenceRequest, 'requiredComponents'>
  ): Promise<UncertaintyProfile>;
  
  /**
   * Calculate reliability assessment.
   * 
   * @param request - Reliability assessment request
   * @returns Reliability assessment
   */
  calculateReliability(
    request: { systemId: string; lookbackPeriod?: number }
  ): Promise<ReliabilityAssessment>;
  
  // ========================================================================
  // CALIBRATION
  // ========================================================================
  
  /**
   * Add calibration observation.
   * 
   * @param observation - Calibration observation
   */
  addCalibrationObservation(observation: CalibrationObservation): Promise<void>;
  
  /**
   * Get calibration profile for a system.
   * 
   * @param systemId - System identifier
   * @returns Calibration profile
   */
  getCalibrationProfile(systemId: string): Promise<CalibrationProfile>;
  
  /**
   * Apply calibration adjustment to confidence.
   * 
   * @param confidence - Raw confidence
   * @param systemId - System that produced confidence
   * @returns Calibrated confidence
   */
  calibrateConfidence(
    confidence: Confidence,
    systemId: string
  ): Promise<ConfidenceValue>;
  
  /**
   * Check if system is calibrated.
   * 
   * @param systemId - System identifier
   * @returns True if calibrated
   */
  isCalibrated(systemId: string): Promise<boolean>;
  
  // ========================================================================
  // EXPLANATION
  // ========================================================================
  
  /**
   * Get explanation for a confidence value.
   * 
   * Used by Mentor Authority to explain confidence to students.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Human-readable explanation
   */
  explainConfidence(lineageId: string): Promise<ConfidenceExplanation>;
  
  /**
   * Get confidence factors breakdown.
   * 
   * @param lineageId - Confidence lineage ID
   * @returns Factor breakdown
   */
  getConfidenceFactors(lineageId: string): Promise<ConfidenceFactor[]>;
  
  // ========================================================================
  // SOURCE TRUST
  // ========================================================================
  
  /**
   * Get trust score for a data source.
   * 
   * @param sourceId - Source identifier
   * @returns Source trust assessment
   */
  getSourceTrust(sourceId: string): Promise<{
    sourceId: string;
    trustScore: number;
    reliability: 'high' | 'moderate' | 'low';
    lastUpdated: number;
  }>;
  
  /**
   * Update source trust based on outcomes.
   * 
   * @param sourceId - Source identifier
   * @param outcome - Outcome data
   */
  updateSourceTrust(
    sourceId: string,
    outcome: { predicted: boolean; actual: boolean; confidence: Confidence }
  ): Promise<void>;
  
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
  aggregateConfidence(
    confidences: ConfidenceValue[],
    method: AggregationMethod
  ): Promise<ConfidenceValue>;
  
  // ========================================================================
  // QUERY
  // ========================================================================
  
  /**
   * Get confidence history for a system.
   * 
   * @param systemId - System identifier
   * @param options - Query options
   * @returns Confidence history
   */
  getConfidenceHistory(
    systemId: string,
    options?: HistoryQueryOptions
  ): Promise<ConfidenceHistory>;
  
  /**
   * Get reliability trend for a system.
   * 
   * @param systemId - System identifier
   * @returns Reliability trend
   */
  getReliabilityTrend(systemId: string): Promise<ReliabilityTrend>;
}
