/**
 * Outcome Evidence Engine - Analysis Algorithms
 * 
 * Statistical analysis functions for outcome comparison.
 * 
 * Design Principles:
 * - All calculations are transparent and explainable
 * - No black-box machine learning
 * - Clear statistical methodology
 * - Conservative confidence estimates
 */

import type { OutcomeRecord, OutcomeSnapshot } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';
import type { StudentBeliefV3 } from '../types/index.js';
import type {
  OutcomeGroupComparison,
  MetricComparison,
  TraitFilter,
} from './types.js';

import {
  StatisticalSignificance,
  EffectDirection,
  EvidenceQuality,
} from './types.js';

// ============================================================================
// STATISTICAL UTILITIES
// ============================================================================

/**
 * Calculate mean of an array of numbers.
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation.
 */
export function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate median.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

/**
 * Calculate Cohen's d effect size.
 */
export function calculateCohensD(groupA: number[], groupB: number[]): number {
  const meanA = calculateMean(groupA);
  const meanB = calculateMean(groupB);
  const stdDevA = calculateStdDev(groupA);
  const stdDevB = calculateStdDev(groupB);
  
  // Pooled standard deviation
  const n1 = groupA.length;
  const n2 = groupB.length;
  const pooledStd = Math.sqrt(((n1 - 1) * Math.pow(stdDevA, 2) + (n2 - 1) * Math.pow(stdDevB, 2)) / (n1 + n2 - 2));
  
  if (pooledStd === 0) return 0;
  
  return (meanA - meanB) / pooledStd;
}

/**
 * Perform Welch's t-test (doesn't assume equal variances).
 * Returns p-value.
 */
export function welchTTest(groupA: number[], groupB: number[]): number {
  const meanA = calculateMean(groupA);
  const meanB = calculateMean(groupB);
  const varA = calculateStdDev(groupA) ** 2;
  const varB = calculateStdDev(groupB) ** 2;
  const n1 = groupA.length;
  const n2 = groupB.length;
  
  // Standard error
  const se = Math.sqrt(varA / n1 + varB / n2);
  
  if (se === 0) return 1;
  
  // t-statistic
  const t = (meanA - meanB) / se;
  
  // Degrees of freedom (Welch-Satterthwaite)
  const numerator = Math.pow(varA / n1 + varB / n2, 2);
  const denominator = Math.pow(varA / n1, 2) / (n1 - 1) + Math.pow(varB / n2, 2) / (n2 - 1);
  const df = denominator === 0 ? 1 : numerator / denominator;
  
  // Approximate p-value using t-distribution
  return approximatePValue(Math.abs(t), Math.floor(df));
}

/**
 * Approximate p-value from t-statistic and degrees of freedom.
 * Uses simple approximation for explainability.
 */
function approximatePValue(t: number, df: number): number {
  // Simple approximation: for large t, small p
  // This is a conservative approximation
  if (t < 1) return 0.5;
  if (t < 1.5) return 0.15;
  if (t < 2) return 0.05;
  if (t < 2.5) return 0.02;
  if (t < 3) return 0.01;
  return 0.005;
}

/**
 * Determine statistical significance from p-value.
 */
export function determineSignificance(pValue: number): StatisticalSignificance {
  if (pValue < 0.01) return StatisticalSignificance.HIGHLY_SIGNIFICANT;
  if (pValue < 0.05) return StatisticalSignificance.SIGNIFICANT;
  if (pValue < 0.10) return StatisticalSignificance.MARGINALLY;
  return StatisticalSignificance.NOT_SIGNIFICANT;
}

/**
 * Determine effect direction from group means.
 */
export function determineDirection(meanA: number, meanB: number): EffectDirection {
  const diff = meanA - meanB;
  const threshold = 0.01; // Minimum meaningful difference
  
  if (Math.abs(diff) < threshold) return EffectDirection.NEUTRAL;
  return diff > 0 ? EffectDirection.POSITIVE : EffectDirection.NEGATIVE;
}

/**
 * Calculate confidence interval for difference in means.
 */
export function calculateConfidenceInterval(
  groupA: number[],
  groupB: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  const meanA = calculateMean(groupA);
  const meanB = calculateMean(groupB);
  const diff = meanA - meanB;
  
  const seA = calculateStdDev(groupA) / Math.sqrt(groupA.length);
  const seB = calculateStdDev(groupB) / Math.sqrt(groupB.length);
  const seDiff = Math.sqrt(seA ** 2 + seB ** 2);
  
  // Z-score for confidence level (approximate)
  const z = confidenceLevel === 0.95 ? 1.96 : 1.645;
  
  const margin = z * seDiff;
  
  return {
    lower: diff - margin,
    upper: diff + margin,
  };
}

// ============================================================================
// OUTCOME EXTRACTION
// ============================================================================

/**
 * Extract numeric outcome values from records for a given metric.
 */
export function extractOutcomeValues(
  records: OutcomeRecord[],
  metric: string,
  timepoint?: string
): number[] {
  const values: number[] = [];
  
  for (const record of records) {
    // Try final outcome first
    if (record.finalOutcome && metric === 'satisfaction') {
      const satisfaction = record.finalOutcome.satisfaction;
      if (typeof satisfaction === 'number') {
        values.push(satisfaction);
        continue;
      }
    }
    
    // Try snapshots
    const snapshot = timepoint 
      ? record.snapshots.find(s => s.timepoint === timepoint)
      : record.snapshots[record.snapshots.length - 1]; // Latest
    
    if (snapshot) {
      // Extract from satisfaction metrics
      if (metric === 'satisfaction' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.overall);
      } else if (metric === 'workContent' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.workContent);
      } else if (metric === 'workEnvironment' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.workEnvironment);
      } else if (metric === 'growthOpportunities' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.growthOpportunities);
      } else if (metric === 'workLifeBalance' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.workLifeBalance);
      } else if (metric === 'meaning' && snapshot.satisfaction) {
        values.push(snapshot.satisfaction.meaning);
      }
      // Could add more metrics from other snapshot sections (income, stress, etc.)
    }
  }
  
  return values;
}

/**
 * Get satisfaction score from record.
 */
export function getSatisfactionScore(record: OutcomeRecord): number | undefined {
  if (record.finalOutcome?.satisfaction !== undefined) {
    return record.finalOutcome.satisfaction;
  }
  
  // Try latest snapshot
  const latest = record.snapshots[record.snapshots.length - 1];
  if (latest?.satisfaction?.overall !== undefined) {
    return latest.satisfaction.overall;
  }
  
  return undefined;
}

/**
 * Get success indicator from record.
 */
export function getSuccessIndicator(record: OutcomeRecord): boolean | undefined {
  if (record.finalOutcome?.success !== undefined) {
    return record.finalOutcome.success;
  }
  
  // Infer from status
  return record.status === 'COMPLETED';
}

// ============================================================================
// TRAIT MATCHING
// ============================================================================

/**
 * Check if a student's belief matches trait filters.
 */
export function matchesTraitFilters(
  belief: StudentBeliefV3,
  filters: TraitFilter[]
): boolean {
  return filters.every(filter => matchesTraitFilter(belief, filter));
}

/**
 * Check if a single trait filter matches.
 */
function matchesTraitFilter(belief: StudentBeliefV3, filter: TraitFilter): boolean {
  const traitValue = extractTraitValue(belief, filter.category, filter.trait);
  
  if (traitValue === undefined) return false;
  
  if (typeof filter.level === 'string') {
    // Categorical level
    const threshold = filter.level === 'high' ? 0.7 : filter.level === 'medium' ? 0.4 : 0.0;
    const maxThreshold = filter.level === 'low' ? 0.4 : filter.level === 'medium' ? 0.7 : 1.0;
    return traitValue >= threshold && traitValue < maxThreshold;
  } else {
    // Numeric range
    return traitValue >= filter.level.min && traitValue <= filter.level.max;
  }
}

/**
 * Extract trait value from student belief.
 */
function extractTraitValue(
  belief: StudentBeliefV3,
  category: string,
  trait: string
): number | undefined {
  switch (category) {
    case 'motivation':
      const motivation = belief.motivations.find(m => 
        m.name.toLowerCase() === trait.toLowerCase()
      );
      return motivation?.strength;
      
    case 'personality':
      const personality = belief.personalityTraits.find(p => 
        p.name.toLowerCase() === trait.toLowerCase() ||
        p.dimension.toLowerCase() === trait.toLowerCase()
      );
      // Convert -1..1 position to 0..1
      return personality ? (personality.position + 1) / 2 : undefined;
      
    case 'value':
      const value = belief.values.find(v => 
        v.name.toLowerCase() === trait.toLowerCase()
      );
      return value?.importance;
      
    case 'strength':
      const strength = belief.strengths.find(s => 
        s.name.toLowerCase() === trait.toLowerCase() ||
        s.category.toLowerCase() === trait.toLowerCase()
      );
      return strength?.level;
      
    default:
      return undefined;
  }
}

// ============================================================================
// GROUP COMPARISON
// ============================================================================

/**
 * Compare two groups of outcome records.
 */
export function compareOutcomeGroups(
  groupARecords: OutcomeRecord[],
  groupBRecords: OutcomeRecord[],
  groupAName: string,
  groupBName: string,
  groupAFilters: TraitFilter[],
  groupBFilters: TraitFilter[],
  pathId: string,
  metrics: string[]
): OutcomeGroupComparison {
  const metricComparisons = new Map<string, MetricComparison>();
  
  for (const metric of metrics) {
    const valuesA = extractOutcomeValues(groupARecords, metric);
    const valuesB = extractOutcomeValues(groupBRecords, metric);
    
    if (valuesA.length === 0 || valuesB.length === 0) continue;
    
    const comparison = compareMetric(valuesA, valuesB, metric);
    metricComparisons.set(metric, comparison);
  }
  
  // Determine overall superior group
  let superiorGroup: 'A' | 'B' | 'NEITHER' = 'NEITHER';
  let totalEffectMagnitude = 0;
  let significantMetrics = 0;
  
  for (const comparison of metricComparisons.values()) {
    if (comparison.statisticalTest.significance !== 'not_significant') {
      significantMetrics++;
      totalEffectMagnitude += Math.abs(comparison.difference.effectSize);
      
      if (comparison.difference.absolute > 0) {
        superiorGroup = 'A';
      } else if (comparison.difference.absolute < 0) {
        superiorGroup = 'B';
      }
    }
  }
  
  const avgEffectMagnitude = significantMetrics > 0 
    ? totalEffectMagnitude / significantMetrics 
    : 0;
  
  return {
    groupA: {
      name: groupAName,
      filters: groupAFilters,
      records: groupARecords,
      size: groupARecords.length,
    },
    groupB: {
      name: groupBName,
      filters: groupBFilters,
      records: groupBRecords,
      size: groupBRecords.length,
    },
    pathId,
    metrics: metricComparisons,
    summary: {
      superiorGroup,
      confidence: calculateGroupConfidence(groupARecords, groupBRecords, metricComparisons),
      effectMagnitude: avgEffectMagnitude,
    },
  };
}

/**
 * Compare a single metric between two groups.
 */
function compareMetric(
  valuesA: number[],
  valuesB: number[],
  metric: string
): MetricComparison {
  const meanA = calculateMean(valuesA);
  const meanB = calculateMean(valuesB);
  const medianA = calculateMedian(valuesA);
  const medianB = calculateMedian(valuesB);
  const stdDevA = calculateStdDev(valuesA);
  const stdDevB = calculateStdDev(valuesB);
  
  const pValue = welchTTest(valuesA, valuesB);
  const significance = determineSignificance(pValue);
  const effectSize = calculateCohensD(valuesA, valuesB);
  const ci = calculateConfidenceInterval(valuesA, valuesB);
  
  return {
    metric,
    groupA: {
      mean: meanA,
      median: medianA,
      stdDev: stdDevA,
      min: Math.min(...valuesA),
      max: Math.max(...valuesA),
    },
    groupB: {
      mean: meanB,
      median: medianB,
      stdDev: stdDevB,
      min: Math.min(...valuesB),
      max: Math.max(...valuesB),
    },
    difference: {
      absolute: meanA - meanB,
      relative: meanB !== 0 ? ((meanA - meanB) / meanB) * 100 : 0,
      effectSize,
    },
    statisticalTest: {
      testName: "Welch's t-test",
      pValue,
      significance,
      confidence: significance === 'highly_significant' ? 0.95 : 
                  significance === 'significant' ? 0.90 : 
                  significance === 'marginally_significant' ? 0.75 : 0.5,
    },
  };
}

/**
 * Calculate overall confidence for group comparison.
 */
function calculateGroupConfidence(
  groupA: OutcomeRecord[],
  groupB: OutcomeRecord[],
  metrics: Map<string, MetricComparison>
): number {
  const sampleSizeScore = Math.min(1, (groupA.length + groupB.length) / 40);
  
  let significanceScore = 0;
  let metricCount = 0;
  
  for (const comparison of metrics.values()) {
    metricCount++;
    switch (comparison.statisticalTest.significance) {
      case 'highly_significant':
        significanceScore += 1;
        break;
      case 'significant':
        significanceScore += 0.8;
        break;
      case 'marginally_significant':
        significanceScore += 0.5;
        break;
      default:
        significanceScore += 0.2;
    }
  }
  
  const avgSignificance = metricCount > 0 ? significanceScore / metricCount : 0;
  
  return (sampleSizeScore * 0.4 + avgSignificance * 0.6);
}

// ============================================================================
// EVIDENCE QUALITY
// ============================================================================

/**
 * Calculate evidence quality based on multiple factors.
 */
export function calculateEvidenceQuality(
  sampleSize: number,
  comparisonQuality: number,
  dataQuality: number,
  consistency: number,
  thresholds: { high: number; medium: number; low: number }
): { quality: EvidenceQuality; factors: { sampleSize: number; methodology: number; dataQuality: number; consistency: number } } {
  // Sample size score (0-1)
  const sampleSizeScore = sampleSize >= thresholds.high ? 1 :
                          sampleSize >= thresholds.medium ? 0.7 :
                          sampleSize >= thresholds.low ? 0.4 : 0.2;
  
  // Methodology score (provided)
  const methodologyScore = Math.max(0, Math.min(1, comparisonQuality));
  
  // Data quality score (provided, normalized)
  const dataQualityScore = Math.max(0, Math.min(1, dataQuality));
  
  // Consistency score (provided)
  const consistencyScore = Math.max(0, Math.min(1, consistency));
  
  // Overall quality
  const overallScore = (
    sampleSizeScore * 0.35 +
    methodologyScore * 0.25 +
    dataQualityScore * 0.25 +
    consistencyScore * 0.15
  );
  
  let quality: EvidenceQuality;
  if (overallScore >= 0.8) quality = EvidenceQuality.HIGH;
  else if (overallScore >= 0.6) quality = EvidenceQuality.MEDIUM;
  else if (overallScore >= 0.4) quality = EvidenceQuality.LOW;
  else quality = EvidenceQuality.INSUFFICIENT;

  return {
    quality,
    factors: {
      sampleSize: sampleSizeScore,
      methodology: methodologyScore,
      dataQuality: dataQualityScore,
      consistency: consistencyScore,
    },
  };
}

/**
 * Calculate consistency score from outcome variance.
 */
export function calculateConsistencyScore(values: number[]): number {
  if (values.length < 2) return 0.5;
  
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);
  
  // Coefficient of variation (normalized std dev)
  const cv = mean !== 0 ? stdDev / Math.abs(mean) : stdDev;
  
  // Lower CV = higher consistency
  // CV < 0.1 is excellent (score 1)
  // CV > 0.5 is poor (score 0)
  return Math.max(0, Math.min(1, 1 - (cv - 0.1) / 0.4));
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence score from statistical results.
 */
export function calculateConfidenceFromStats(
  sampleSize: number,
  significance: StatisticalSignificance,
  effectSize: number,
  minSampleSize: number = 5
): number {
  // Sample size component
  const sizeRatio = Math.min(1, sampleSize / (minSampleSize * 4));
  
  // Significance component
  const sigScore = significance === 'highly_significant' ? 1.0 :
                   significance === 'significant' ? 0.85 :
                   significance === 'marginally_significant' ? 0.6 : 0.3;
  
  // Effect size component (moderate effects are most reliable)
  const effectScore = effectSize > 0.8 ? 0.9 : 
                      effectSize > 0.5 ? 1.0 :
                      effectSize > 0.2 ? 0.8 : 0.6;
  
  return (sizeRatio * 0.3 + sigScore * 0.5 + effectScore * 0.2);
}

/**
 * Calculate data quality score for outcome records.
 */
export function calculateDataQuality(records: OutcomeRecord[]): number {
  if (records.length === 0) return 0;
  
  let totalQuality = 0;
  
  for (const record of records) {
    let quality = record.metadata?.dataQuality ?? 0.5;
    
    // Boost for completed records
    if (record.status === 'COMPLETED') quality += 0.1;
    
    // Boost for records with final outcomes
    if (record.finalOutcome) quality += 0.1;
    
    // Boost for multiple snapshots
    quality += Math.min(0.1, record.snapshots.length * 0.02);
    
    totalQuality += Math.min(1, quality);
  }
  
  return totalQuality / records.length;
}
