/**
 * CareerOS Intelligence Consistency Engine - Utilities
 *
 * Helper functions for consistency validation.
 */

import type { IntelligenceResults } from './types';

/**
 * Validate input data structure.
 */
export function validateInput(results: IntelligenceResults): { valid: boolean; error?: string } {
  if (!results || typeof results !== 'object') {
    return { valid: false, error: 'Results must be a valid object' };
  }

  // Check if at least one engine result is present
  const hasResults =
    results.matching ||
    results.utility ||
    results.optionality ||
    results.criticality ||
    results.coalition ||
    results.regret ||
    results.market ||
    results.futureSimulation ||
    results.recommendations;

  if (!hasResults) {
    return { valid: false, error: 'At least one engine result must be provided' };
  }

  return { valid: true };
}

/**
 * Calculate normalized distance between two values.
 */
export function calculateValueDistance(
  value1: number,
  value2: number,
  normalizeTo: number = 1
): number {
  const diff = Math.abs(value1 - value2);
  return Math.min(diff / normalizeTo, 1);
}

/**
 * Detect if two values conflict directionally.
 */
export function detectDirectionalConflict(
  value1: number,
  value2: number,
  threshold: number = 0.3
): boolean {
  const normalizedDiff = Math.abs(value1 - value2);
  return normalizedDiff > threshold;
}

/**
 * Normalize a score to 0-1 range.
 */
export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate weighted average of values.
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights must have same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
  return weightedSum / totalWeight;
}

/**
 * Calculate standard deviation.
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Check if value is within range.
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value to range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format confidence as percentage string.
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Compare engine outputs for equality within tolerance.
 */
export function approximatelyEqual(
  value1: number,
  value2: number,
  tolerance: number = 0.01
): boolean {
  return Math.abs(value1 - value2) <= tolerance;
}

/**
 * Get severity color for UI display.
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
      return '#16a34a'; // green-600
    case 'info':
      return '#2563eb'; // blue-600
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Get consistency score color.
 */
export function getConsistencyColor(score: number): string {
  if (score >= 90) return '#16a34a'; // green-600
  if (score >= 70) return '#65a30d'; // lime-600
  if (score >= 50) return '#ca8a04'; // yellow-600
  if (score >= 30) return '#ea580c'; // orange-600
  return '#dc2626'; // red-600
}

/**
 * Deep merge two objects.
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return result;
}
