/**
 * CareerOS Confidence History
 * 
 * Tracks historical confidence calculations for audit and analysis.
 * 
 * @module confidence/history
 * @version 1.0.0
 */

import type {
  Confidence,
  ConfidenceValue,
  PredictionType,
  ConfidenceHistory as ConfidenceHistoryType,
  ConfidenceHistoryEntry,
} from './ConfidenceTypes';

// ============================================================================
// HISTORY CONFIGURATION
// ============================================================================

export interface HistoryConfig {
  /** Maximum number of entries per system */
  readonly maxEntriesPerSystem: number;
  
  /** Maximum age of entries in milliseconds */
  readonly maxAgeMs: number;
  
  /** Enable persistence */
  readonly enablePersistence: boolean;
}

export const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
  maxEntriesPerSystem: 1000,
  maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  enablePersistence: false,
};

// ============================================================================
// HISTORY STORE
// ============================================================================

export class ConfidenceHistory {
  private config: HistoryConfig;
  private entries: Map<string, ConfidenceHistoryEntry[]> = new Map();

  constructor(config: Partial<HistoryConfig> = {}) {
    this.config = { ...DEFAULT_HISTORY_CONFIG, ...config };
  }

  /**
   * Store confidence value in history.
   * 
   * @param confidence - Confidence value to store
   * @param systemId - System that requested confidence
   */
  store(confidence: ConfidenceValue, systemId: string): void {
    const entry: ConfidenceHistoryEntry = {
      timestamp: confidence.calculatedAt,
      confidence: confidence.value,
      predictionType: this.inferPredictionType(confidence.component),
      lineageId: confidence.lineageId,
    };

    const systemEntries = this.entries.get(systemId) ?? [];
    systemEntries.push(entry);

    // Trim to max entries
    if (systemEntries.length > this.config.maxEntriesPerSystem) {
      systemEntries.shift();
    }

    // Remove old entries
    const cutoff = Date.now() - this.config.maxAgeMs;
    const filtered = systemEntries.filter(e => e.timestamp > cutoff);

    this.entries.set(systemId, filtered);
  }

  /**
   * Get history for system.
   * 
   * @param systemId - System identifier
   * @returns History entries
   */
  getHistory(systemId: string): ConfidenceHistoryType {
    const entries = this.entries.get(systemId) ?? [];
    
    return {
      systemId,
      entries: [...entries].sort((a, b) => b.timestamp - a.timestamp),
    };
  }

  /**
   * Get confidence trend for system.
   * 
   * @param systemId - System identifier
   * @param periods - Number of periods to analyze
   * @returns Trend data
   */
  getTrend(systemId: string, periods: number = 10): {
    direction: 'improving' | 'stable' | 'degrading';
    rate: number;
    periods: number;
    average: number;
  } {
    const history = this.getHistory(systemId);
    const entries = history.entries.slice(0, periods);

    if (entries.length < 2) {
      return { direction: 'stable', rate: 0, periods: entries.length, average: 0.5 };
    }

    const values = entries.map(e => e.confidence);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Calculate trend using linear regression
    const n = values.length;
    const indices = values.map((_, i) => i);
    const sumX = indices.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let direction: 'improving' | 'stable' | 'degrading';
    if (slope > 0.01) {
      direction = 'improving';
    } else if (slope < -0.01) {
      direction = 'degrading';
    } else {
      direction = 'stable';
    }

    return {
      direction,
      rate: slope,
      periods: entries.length,
      average,
    };
  }

  /**
   * Get average confidence for system.
   * 
   * @param systemId - System identifier
   * @param timeWindowMs - Time window in milliseconds
   * @returns Average confidence
   */
  getAverageConfidence(systemId: string, timeWindowMs?: number): number {
    const history = this.getHistory(systemId);
    
    let entries = history.entries;
    if (timeWindowMs) {
      const cutoff = Date.now() - timeWindowMs;
      entries = entries.filter(e => e.timestamp > cutoff);
    }

    if (entries.length === 0) {
      return 0.5;
    }

    return entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length;
  }

  /**
   * Get confidence distribution for system.
   * 
   * @param systemId - System identifier
   * @returns Distribution buckets
   */
  getDistribution(systemId: string): Record<string, number> {
    const history = this.getHistory(systemId);
    const entries = history.entries;

    const buckets: Record<string, number> = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0,
    };

    for (const entry of entries) {
      const confidence = entry.confidence;
      if (confidence < 0.2) buckets['0.0-0.2']++;
      else if (confidence < 0.4) buckets['0.2-0.4']++;
      else if (confidence < 0.6) buckets['0.4-0.6']++;
      else if (confidence < 0.8) buckets['0.6-0.8']++;
      else buckets['0.8-1.0']++;
    }

    // Convert to percentages
    const total = entries.length;
    if (total > 0) {
      for (const key of Object.keys(buckets)) {
        buckets[key] = buckets[key] / total;
      }
    }

    return buckets;
  }

  /**
   * Clear history for system.
   * 
   * @param systemId - System identifier
   */
  clear(systemId: string): void {
    this.entries.delete(systemId);
  }

  /**
   * Clear all history.
   */
  clearAll(): void {
    this.entries.clear();
  }

  /**
   * Get all system IDs with history.
   */
  getSystemIds(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Infer prediction type from component name.
   */
  private inferPredictionType(component: string): PredictionType {
    const typeMap: Record<string, PredictionType> = {
      'CareerConfidenceModule': 'career-fit',
      'DecisionConfidenceModule': 'decision',
      'ArchetypeConfidenceModule': 'archetype',
      'MarketConfidenceModule': 'market-trend',
      'ConfidenceCalculator': 'career-fit',
      'ConfidenceAggregator': 'career-fit',
    };

    return typeMap[component] ?? 'career-fit';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalHistory: ConfidenceHistory | null = null;

export function getConfidenceHistory(config?: Partial<HistoryConfig>): ConfidenceHistory {
  if (!globalHistory) {
    globalHistory = new ConfidenceHistory(config);
  }
  return globalHistory;
}

export function resetConfidenceHistory(): void {
  globalHistory = null;
}
