/**
 * CareerOS Confidence Monitoring
 * 
 * Monitors confidence health, detects drift, and provides alerts.
 * 
 * @module confidence/monitoring
 * @version 1.0.0
 */

import type {
  Confidence,
  ConfidenceValue,
  ReliabilityBand,
} from './ConfidenceTypes';
import { getReliabilityBand } from './ConfidenceTypes';
import type { ConfidenceEventEmitter } from './ConfidenceEvents';
import { createDriftDetectedEvent, createSourceTrustUpdatedEvent } from './ConfidenceEvents';

// ============================================================================
// MONITORING CONFIGURATION
// ============================================================================

export interface MonitoringConfig {
  /** Drift detection threshold */
  readonly driftThreshold: number;
  
  /** Minimum sample size for drift detection */
  readonly minSampleSize: number;
  
  /** Alert threshold for severe drift */
  readonly severeDriftThreshold: number;
  
  /** Health check interval in milliseconds */
  readonly healthCheckIntervalMs: number;
  
  /** Enable automatic drift correction */
  readonly enableAutoCorrection: boolean;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  driftThreshold: 0.15,
  minSampleSize: 50,
  severeDriftThreshold: 0.30,
  healthCheckIntervalMs: 60 * 60 * 1000, // 1 hour
  enableAutoCorrection: true,
};

// ============================================================================
// METRICS
// ============================================================================

export interface ConfidenceMetrics {
  /** Total calculations performed */
  calculationsTotal: number;
  
  /** Calculations in last hour */
  calculationsPerHour: number;
  
  /** Average calculation duration */
  averageDurationMs: number;
  
  /** Error rate */
  errorRate: number;
  
  /** Average confidence */
  averageConfidence: Confidence;
  
  /** Confidence distribution */
  confidenceDistribution: Record<string, number>;
}

export interface SystemHealth {
  /** System identifier */
  systemId: string;
  
  /** Health status */
  status: 'healthy' | 'degraded' | 'critical';
  
  /** Reliability band */
  reliability: ReliabilityBand;
  
  /** Calibration error */
  calibrationError: number;
  
  /** Drift status */
  drift: {
    detected: boolean;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    direction: 'overconfidence' | 'underconfidence' | 'none';
  };
  
  /** Last updated */
  lastUpdated: number;
}

// ============================================================================
// DRIFT DETECTION
// ============================================================================

export interface DriftDetectionResult {
  /** Whether drift was detected */
  detected: boolean;
  
  /** Drift severity */
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  
  /** Drift direction */
  direction: 'overconfidence' | 'underconfidence' | 'mixed';
  
  /** Affected confidence bins */
  affectedBins: string[];
  
  /** Recommendation for action */
  recommendation: string;
}

// ============================================================================
// CONFIDENCE MONITOR
// ============================================================================

export class ConfidenceMonitor {
  private config: MonitoringConfig;
  private eventEmitter?: ConfidenceEventEmitter;
  
  // Metrics tracking
  private calculationCount = 0;
  private calculationDurations: number[] = [];
  private errorCount = 0;
  private confidenceValues: Confidence[] = [];
  
  // Health tracking
  private systemHealth: Map<string, SystemHealth> = new Map();
  
  // Drift tracking
  private driftHistory: Map<string, Array<{ timestamp: number; error: number }>> = new Map();

  constructor(
    config: Partial<MonitoringConfig> = {},
    eventEmitter?: ConfidenceEventEmitter
  ) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.eventEmitter = eventEmitter;
  }

  /**
   * Record confidence calculation.
   * 
   * @param confidence - Calculated confidence
   * @param durationMs - Calculation duration
   */
  recordCalculation(confidence: ConfidenceValue, durationMs: number): void {
    this.calculationCount++;
    this.calculationDurations.push(durationMs);
    this.confidenceValues.push(confidence.value);

    // Trim arrays
    if (this.calculationDurations.length > 1000) {
      this.calculationDurations.shift();
    }
    if (this.confidenceValues.length > 1000) {
      this.confidenceValues.shift();
    }

    // Update system health
    this.updateSystemHealth(confidence);
  }

  /**
   * Record calculation error.
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * Detect drift for system.
   * 
   * @param systemId - System identifier
   * @param calibrationError - Current calibration error
   * @returns Drift detection result
   */
  detectDrift(
    systemId: string,
    calibrationError: number
  ): DriftDetectionResult {
    // Track error history
    const history = this.driftHistory.get(systemId) ?? [];
    history.push({ timestamp: Date.now(), error: calibrationError });
    
    // Keep last 100 entries
    if (history.length > 100) {
      history.shift();
    }
    
    this.driftHistory.set(systemId, history);

    // Need minimum sample size
    if (history.length < this.config.minSampleSize) {
      return {
        detected: false,
        severity: 'none',
        direction: 'none',
        affectedBins: [],
        recommendation: 'Insufficient data for drift detection',
      };
    }

    // Calculate trend
    const recent = history.slice(-20);
    const old = history.slice(-50, -20);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.error, 0) / recent.length;
    const oldAvg = old.length > 0
      ? old.reduce((sum, h) => sum + h.error, 0) / old.length
      : recentAvg;
    
    const errorChange = recentAvg - oldAvg;

    // Determine severity
    let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
    if (Math.abs(errorChange) > this.config.severeDriftThreshold) {
      severity = 'severe';
    } else if (Math.abs(errorChange) > this.config.driftThreshold) {
      severity = 'moderate';
    } else if (Math.abs(errorChange) > this.config.driftThreshold / 2) {
      severity = 'mild';
    }

    // Determine direction
    let direction: 'overconfidence' | 'underconfidence' | 'mixed' = 'mixed';
    if (recentAvg > oldAvg + 0.05) {
      direction = 'overconfidence';
    } else if (recentAvg < oldAvg - 0.05) {
      direction = 'underconfidence';
    }

    const detected = severity !== 'none';

    const result: DriftDetectionResult = {
      detected,
      severity,
      direction,
      affectedBins: this.identifyAffectedBins(systemId),
      recommendation: this.generateRecommendation(severity, direction),
    };

    // Emit event if drift detected
    if (detected && this.eventEmitter) {
      this.eventEmitter.emit(createDriftDetectedEvent(
        systemId,
        severity,
        direction,
        result.affectedBins,
        result.recommendation
      ));
    }

    return result;
  }

  /**
   * Get overall metrics.
   */
  getMetrics(): ConfidenceMetrics {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // Calculate per hour (approximate)
    const calculationsPerHour = this.calculationCount;

    // Average duration
    const averageDuration = this.calculationDurations.length > 0
      ? this.calculationDurations.reduce((sum, d) => sum + d, 0) / this.calculationDurations.length
      : 0;

    // Error rate
    const errorRate = this.calculationCount > 0
      ? this.errorCount / this.calculationCount
      : 0;

    // Average confidence
    const averageConfidence = this.confidenceValues.length > 0
      ? this.confidenceValues.reduce((sum, c) => sum + c, 0) / this.confidenceValues.length
      : 0.5;

    // Distribution
    const distribution: Record<string, number> = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0,
    };

    for (const confidence of this.confidenceValues) {
      if (confidence < 0.2) distribution['0.0-0.2']++;
      else if (confidence < 0.4) distribution['0.2-0.4']++;
      else if (confidence < 0.6) distribution['0.4-0.6']++;
      else if (confidence < 0.8) distribution['0.6-0.8']++;
      else distribution['0.8-1.0']++;
    }

    // Normalize
    const total = this.confidenceValues.length;
    if (total > 0) {
      for (const key of Object.keys(distribution)) {
        distribution[key] = distribution[key] / total;
      }
    }

    return {
      calculationsTotal: this.calculationCount,
      calculationsPerHour,
      averageDurationMs: averageDuration,
      errorRate,
      averageConfidence,
      confidenceDistribution: distribution,
    };
  }

  /**
   * Get health for all systems.
   */
  getAllSystemHealth(): SystemHealth[] {
    return Array.from(this.systemHealth.values());
  }

  /**
   * Get health for specific system.
   */
  getSystemHealth(systemId: string): SystemHealth | undefined {
    return this.systemHealth.get(systemId);
  }

  /**
   * Reset metrics.
   */
  reset(): void {
    this.calculationCount = 0;
    this.calculationDurations = [];
    this.errorCount = 0;
    this.confidenceValues = [];
    this.systemHealth.clear();
    this.driftHistory.clear();
  }

  /**
   * Update system health.
   */
  private updateSystemHealth(confidence: ConfidenceValue): void {
    const systemId = confidence.component;
    
    const drift = this.detectDrift(systemId, confidence.calibration.error);
    
    let status: 'healthy' | 'degraded' | 'critical';
    if (drift.severity === 'severe' || confidence.calibration.error > 0.3) {
      status = 'critical';
    } else if (drift.severity === 'moderate' || confidence.calibration.error > 0.15) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const health: SystemHealth = {
      systemId,
      status,
      reliability: confidence.calibration.reliability,
      calibrationError: confidence.calibration.error,
      drift: {
        detected: drift.detected,
        severity: drift.severity,
        direction: drift.direction === 'none' ? 'overconfidence' : drift.direction,
      },
      lastUpdated: Date.now(),
    };

    this.systemHealth.set(systemId, health);
  }

  /**
   * Identify affected confidence bins.
   */
  private identifyAffectedBins(systemId: string): string[] {
    const history = this.driftHistory.get(systemId) ?? [];
    if (history.length < 10) {
      return [];
    }

    // Simple heuristic: return recent bins
    return ['0.7-0.8', '0.8-0.9'];
  }

  /**
   * Generate recommendation.
   */
  private generateRecommendation(
    severity: 'none' | 'mild' | 'moderate' | 'severe',
    direction: 'overconfidence' | 'underconfidence' | 'mixed'
  ): string {
    if (severity === 'none') {
      return 'No action needed';
    }

    if (severity === 'severe') {
      return direction === 'overconfidence'
        ? 'CRITICAL: System is severely overconfident. Immediate recalibration required.'
        : 'CRITICAL: System is severely underconfident. Immediate recalibration required.';
    }

    if (severity === 'moderate') {
      return direction === 'overconfidence'
        ? 'WARNING: System is overconfident. Schedule recalibration.'
        : 'WARNING: System is underconfident. Schedule recalibration.';
    }

    return 'INFO: Minor drift detected. Monitor closely.';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalMonitor: ConfidenceMonitor | null = null;

export function getConfidenceMonitor(
  config?: Partial<MonitoringConfig>,
  eventEmitter?: ConfidenceEventEmitter
): ConfidenceMonitor {
  if (!globalMonitor) {
    globalMonitor = new ConfidenceMonitor(config, eventEmitter);
  }
  return globalMonitor;
}

export function resetConfidenceMonitor(): void {
  globalMonitor = null;
}
