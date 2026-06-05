/**
 * Indian Market Intelligence - Calculators
 *
 * Calculators for market confidence, freshness, and signal aggregation.
 *
 * Design Principles:
 *   - Deterministic calculations
 *   - Time-decay for signal relevance
 *   - Weighted aggregation by source quality
 *   - Explainable scoring
 */

import type {
  MarketSignal,
  SignalType,
  SignalSourceType,
  DataQualityMetrics,
  IndianMarketIntelligenceConfig,
} from './types.js';

import {
  DEFAULT_MARKET_INTELLIGENCE_CONFIG,
} from './types.js';

// ============================================================================
// SOURCE QUALITY WEIGHTS
// ============================================================================

/**
 * Quality weights for different signal sources.
 * Higher = more reliable.
 */
export const SOURCE_QUALITY_WEIGHTS: Record<SignalSourceType, number> = {
  'government-data': 1.0,
  'industry-report': 0.95,
  'academic-research': 0.9,
  'job-portal': 0.85,
  'expert-interview': 0.8,
  'news-media': 0.6,
  'historical-trend': 0.7,
  'ml-prediction': 0.75,
  'manual-entry': 0.5,
  'api-integration': 0.8,
};

/**
 * Get quality weight for a source type.
 */
export function getSourceQualityWeight(sourceType: SignalSourceType): number {
  return SOURCE_QUALITY_WEIGHTS[sourceType] ?? 0.5;
}

// ============================================================================
// MARKET CONFIDENCE CALCULATOR
// ============================================================================

/**
 * Calculate confidence score for a set of signals.
 *
 * Factors:
 *   - Number of signals (more = better)
 *   - Signal confidence values
 *   - Source quality
 *   - Signal agreement (consistency)
 */
export function calculateMarketConfidence(
  signals: MarketSignal[],
  config: IndianMarketIntelligenceConfig = DEFAULT_MARKET_INTELLIGENCE_CONFIG
): number {
  if (signals.length === 0) {
    return 0;
  }

  // Filter to recent, high-confidence signals
  const now = Date.now();
  const maxAgeMs = config.maxSignalAgeDays * 24 * 60 * 60 * 1000;

  const validSignals = signals.filter(s => {
    const age = now - s.timestamp;
    return (
      age <= maxAgeMs &&
      s.confidence >= config.minSignalConfidence
    );
  });

  if (validSignals.length === 0) {
    return 0.1; // Minimal confidence if only old data
  }

  // Calculate weighted confidence by source quality
  let totalWeight = 0;
  let weightedConfidence = 0;

  for (const signal of validSignals) {
    const sourceWeight = getSourceQualityWeight(signal.sourceType);
    const signalWeight = sourceWeight * signal.confidence;

    weightedConfidence += signal.value * signalWeight;
    totalWeight += signalWeight;
  }

  // Source diversity bonus
  const uniqueSources = new Set(validSignals.map(s => s.sourceType)).size;
  const diversityFactor = Math.min(uniqueSources / 3, 1.0); // Max bonus at 3+ sources

  // Signal count factor (diminishing returns after 5)
  const countFactor = Math.min(validSignals.length / 5, 1.0);

  // Final confidence
  const baseConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
  const adjustedConfidence = baseConfidence * (0.7 + 0.15 * diversityFactor + 0.15 * countFactor);

  return Math.min(Math.max(adjustedConfidence, 0), 1);
}

/**
 * Calculate confidence for a specific signal type.
 */
export function calculateSignalTypeConfidence(
  signals: MarketSignal[],
  signalType: SignalType,
  config?: IndianMarketIntelligenceConfig
): number {
  const typeSignals = signals.filter(s => s.signalType === signalType);
  return calculateMarketConfidence(typeSignals, config);
}

/**
 * Calculate overall data quality metrics.
 */
export function calculateDataQualityMetrics(
  signals: MarketSignal[],
  config: IndianMarketIntelligenceConfig = DEFAULT_MARKET_INTELLIGENCE_CONFIG
): DataQualityMetrics {
  const now = Date.now();

  // Confidence
  const confidence = calculateMarketConfidence(signals, config);

  // Freshness (based on average signal age)
  if (signals.length === 0) {
    return {
      confidence: 0,
      freshness: 0,
      sourceCount: 0,
      lastVerifiedAt: now,
      gaps: ['No signals available'],
    };
  }

  const ages = signals.map(s => now - s.timestamp);
  const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
  const maxAgeMs = config.maxSignalAgeDays * 24 * 60 * 60 * 1000;
  const freshness = Math.max(0, 1 - avgAge / maxAgeMs);

  // Source count
  const sourceCount = new Set(signals.map(s => s.sourceType)).size;

  // Last verified
  const lastVerifiedAt = Math.max(...signals.map(s => s.timestamp));

  // Gaps
  const gaps: string[] = [];
  if (confidence < 0.5) gaps.push('Low confidence in available data');
  if (freshness < 0.3) gaps.push('Data is stale');
  if (sourceCount < 2) gaps.push('Limited source diversity');

  return {
    confidence,
    freshness,
    sourceCount,
    lastVerifiedAt,
    gaps: gaps.length > 0 ? gaps : undefined,
  };
}

// ============================================================================
// MARKET FRESHNESS CALCULATOR
// ============================================================================

/**
 * Calculate freshness score for market data.
 *
 * Freshness decays exponentially over time.
 */
export function calculateMarketFreshness(
  signals: MarketSignal[],
  config: IndianMarketIntelligenceConfig = DEFAULT_MARKET_INTELLIGENCE_CONFIG
): number {
  if (signals.length === 0) {
    return 0;
  }

  const now = Date.now();
  const maxAgeMs = config.maxSignalAgeDays * 24 * 60 * 60 * 1000;

  // Calculate freshness for each signal with exponential decay
  let totalFreshness = 0;

  for (const signal of signals) {
    const age = now - signal.timestamp;
    const normalizedAge = Math.min(age / maxAgeMs, 1);

    // Exponential decay: freshness = e^(-3 * normalized_age)
    // At max age, freshness ≈ 0.05
    const signalFreshness = Math.exp(-3 * normalizedAge);
    totalFreshness += signalFreshness;
  }

  // Average freshness weighted by signal confidence
  const weightedFreshness = signals.reduce((sum, s, i) => {
    const ages = signals.map(sig => now - sig.timestamp);
    const normalizedAge = Math.min(ages[i] / maxAgeMs, 1);
    const signalFreshness = Math.exp(-3 * normalizedAge);
    return sum + signalFreshness * s.confidence;
  }, 0);

  const totalConfidence = signals.reduce((sum, s) => sum + s.confidence, 0);

  return totalConfidence > 0 ? weightedFreshness / totalConfidence : 0;
}

/**
 * Calculate freshness for specific signal type.
 */
export function calculateSignalTypeFreshness(
  signals: MarketSignal[],
  signalType: SignalType,
  config?: IndianMarketIntelligenceConfig
): number {
  const typeSignals = signals.filter(s => s.signalType === signalType);
  return calculateMarketFreshness(typeSignals, config);
}

/**
 * Determine if data needs refresh.
 */
export function needsRefresh(
  signals: MarketSignal[],
  config: IndianMarketIntelligenceConfig = DEFAULT_MARKET_INTELLIGENCE_CONFIG
): boolean {
  const freshness = calculateMarketFreshness(signals, config);
  return freshness < 0.5; // Refresh if less than 50% fresh
}

/**
 * Get recommended refresh priority.
 */
export function getRefreshPriority(
  signals: MarketSignal[],
  config: IndianMarketIntelligenceConfig = DEFAULT_MARKET_INTELLIGENCE_CONFIG
): 'critical' | 'high' | 'medium' | 'low' {
  const freshness = calculateMarketFreshness(signals, config);
  const confidence = calculateMarketConfidence(signals, config);

  if (freshness < 0.2 || confidence < 0.3) return 'critical';
  if (freshness < 0.4 || confidence < 0.5) return 'high';
  if (freshness < 0.6) return 'medium';
  return 'low';
}

// ============================================================================
// SIGNAL AGGREGATION ENGINE
// ============================================================================

/**
 * Aggregate signals into a single value.
 *
 * Uses weighted average with time decay and source quality weighting.
 */
export function aggregateSignals(
  signals: MarketSignal[],
  options: {
    signalType?: SignalType;
    timeDecay?: boolean;
    sourceWeighting?: boolean;
    config?: IndianMarketIntelligenceConfig;
  } = {}
): {
  value: number;
  confidence: number;
  sampleSize: number;
  calculationMethod: string;
} {
  const {
    signalType,
    timeDecay = true,
    sourceWeighting = true,
    config = DEFAULT_MARKET_INTELLIGENCE_CONFIG,
  } = options;

  // Filter by signal type if specified
  let filteredSignals = signalType
    ? signals.filter(s => s.signalType === signalType)
    : [...signals];

  if (filteredSignals.length === 0) {
    return {
      value: 0.5, // Neutral default
      confidence: 0,
      sampleSize: 0,
      calculationMethod: 'no-signals',
    };
  }

  // Sort by timestamp (newest first)
  filteredSignals.sort((a, b) => b.timestamp - a.timestamp);

  const now = Date.now();
  const maxAgeMs = config.maxSignalAgeDays * 24 * 60 * 60 * 1000;

  // Calculate weights for each signal
  type WeightedSignal = MarketSignal & { weight: number };
  const weightedSignals: WeightedSignal[] = filteredSignals.map(signal => {
    let weight = signal.confidence;

    // Apply source quality weighting
    if (sourceWeighting) {
      weight *= getSourceQualityWeight(signal.sourceType);
    }

    // Apply time decay
    if (timeDecay) {
      const age = now - signal.timestamp;
      const normalizedAge = Math.min(age / maxAgeMs, 1);
      const timeDecayFactor = Math.exp(-2 * normalizedAge); // Faster decay than freshness
      weight *= timeDecayFactor;
    }

    return { ...signal, weight };
  });

  // Calculate weighted average
  const totalWeight = weightedSignals.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = weightedSignals.reduce((sum, s) => sum + s.value * s.weight, 0);
  const value = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

  // Calculate aggregate confidence
  const avgConfidence = filteredSignals.reduce((sum, s) => sum + s.confidence, 0) / filteredSignals.length;
  const confidence = calculateMarketConfidence(filteredSignals, config);

  return {
    value: Math.min(Math.max(value, 0), 1),
    confidence,
    sampleSize: filteredSignals.length,
    calculationMethod: `weighted-avg${timeDecay ? '-decay' : ''}${sourceWeighting ? '-source' : ''}`,
  };
}

/**
 * Aggregate signals by type.
 */
export function aggregateSignalsByType(
  signals: MarketSignal[],
  options: {
    timeDecay?: boolean;
    sourceWeighting?: boolean;
    config?: IndianMarketIntelligenceConfig;
  } = {}
): Record<SignalType, { value: number; confidence: number; sampleSize: number }> {
  const result = {} as Record<SignalType, { value: number; confidence: number; sampleSize: number }>;

  const signalTypes: SignalType[] = [
    'demand',
    'salary',
    'competition',
    'growth',
    'automationRisk',
    'skillDemand',
    'examDifficulty',
    'regionalOpportunity',
  ];

  for (const signalType of signalTypes) {
    const aggregated = aggregateSignals(signals, { ...options, signalType });
    result[signalType] = {
      value: aggregated.value,
      confidence: aggregated.confidence,
      sampleSize: aggregated.sampleSize,
    };
  }

  return result;
}

/**
 * Detect signal trends over time.
 */
export function detectSignalTrend(
  signals: MarketSignal[],
  signalType: SignalType,
  windowMs: number = 90 * 24 * 60 * 60 * 1000 // 90 days
): {
  direction: 'increasing' | 'stable' | 'decreasing';
  magnitude: number;
  confidence: number;
} {
  const now = Date.now();
  const typeSignals = signals
    .filter(s => s.signalType === signalType)
    .filter(s => now - s.timestamp <= windowMs)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (typeSignals.length < 3) {
    return { direction: 'stable', magnitude: 0, confidence: 0.3 };
  }

  // Simple linear regression
  const n = typeSignals.length;
  const sumX = typeSignals.reduce((sum, s, i) => sum + i, 0);
  const sumY = typeSignals.reduce((sum, s) => sum + s.value, 0);
  const sumXY = typeSignals.reduce((sum, s, i) => sum + i * s.value, 0);
  const sumX2 = typeSignals.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Calculate R-squared for confidence
  const meanY = sumY / n;
  const ssTotal = typeSignals.reduce((sum, s) => sum + Math.pow(s.value - meanY, 2), 0);
  const ssResidual = typeSignals.reduce((sum, s, i) => {
    const predicted = meanY + slope * (i - sumX / n);
    return sum + Math.pow(s.value - predicted, 2);
  }, 0);
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  // Determine direction
  const threshold = 0.01; // Minimum slope to be considered a trend
  let direction: 'increasing' | 'stable' | 'decreasing';
  if (slope > threshold) direction = 'increasing';
  else if (slope < -threshold) direction = 'decreasing';
  else direction = 'stable';

  return {
    direction,
    magnitude: Math.abs(slope),
    confidence: Math.sqrt(rSquared),
  };
}

/**
 * Detect anomalies in signals.
 */
export function detectSignalAnomalies(
  signals: MarketSignal[],
  signalType: SignalType,
  threshold: number = 2 // Standard deviations
): MarketSignal[] {
  const typeSignals = signals.filter(s => s.signalType === signalType);

  if (typeSignals.length < 5) {
    return []; // Need enough data for meaningful statistics
  }

  // Calculate mean and standard deviation
  const values = typeSignals.map(s => s.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Find anomalies
  return typeSignals.filter(s => {
    const zScore = Math.abs(s.value - mean) / stdDev;
    return zScore > threshold;
  });
}

// ============================================================================
// OPPORTUNITY SCORE CALCULATOR
// ============================================================================

/**
 * Calculate overall opportunity score.
 *
 * Composite score based on demand, growth, salary, and competition.
 */
export function calculateOpportunityScore(
  demandScore: number,
  growthScore: number,
  salaryScore: number,
  competitionScore: number,
  weights: {
    demand: number;
    growth: number;
    salary: number;
    competition: number;
  } = { demand: 0.3, growth: 0.3, salary: 0.25, competition: 0.15 }
): number {
  // Competition is inverted (lower competition = higher opportunity)
  const invertedCompetition = 1 - competitionScore;

  const score =
    weights.demand * demandScore +
    weights.growth * growthScore +
    weights.salary * salaryScore +
    weights.competition * invertedCompetition;

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Calculate risk-adjusted opportunity score.
 */
export function calculateRiskAdjustedScore(
  opportunityScore: number,
  automationRisk: number,
  volatility: number
): number {
  // Adjust for automation risk and volatility
  const riskPenalty = automationRisk * 0.3 + volatility * 0.2;
  return Math.max(0, opportunityScore - riskPenalty);
}
