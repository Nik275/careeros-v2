/**
 * CareerOS Market Intelligence - Discovery Analysis Model
 *
 * Represents the analysis result of a discovery investigation.
 */

import type { DiscoverySignal } from './DiscoverySignal';

/**
 * Type of discovery being analyzed.
 */
export type DiscoveryType = 'career' | 'skill' | 'industry' | 'declining_career' | 'declining_skill';

/**
 * Discovery status.
 */
export type DiscoveryStatus =
  | 'investigating'     // Initial analysis
  | 'candidate'         // Potential discovery
  | 'validated'         // Multiple signals confirm
  | 'confirmed'         // High confidence
  | 'rejected'          // False positive
  | 'stale';            // Signals expired

/**
 * Confidence factors.
 */
export interface ConfidenceFactors {
  /** Source count factor (0-100) */
  sourceCount: number;

  /** Source quality factor (0-100) */
  sourceQuality: number;

  /** Signal consistency factor (0-100) */
  signalConsistency: number;

  /** Trend persistence factor (0-100) */
  trendPersistence: number;

  /** Evidence diversity factor (0-100) */
  evidenceDiversity: number;
}

/**
 * Discovery analysis result.
 */
export interface DiscoveryAnalysis {
  /** Unique identifier */
  id: string;

  /** Type of discovery */
  discoveryType: DiscoveryType;

  /** Entity name */
  entityName: string;

  /** Current status */
  status: DiscoveryStatus;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Confidence factor breakdown */
  confidenceFactors: ConfidenceFactors;

  /** Growth strength (0-100) */
  growthStrength: number;

  /** Evidence strength (0-100) */
  evidenceStrength: number;

  /** Signal count */
  signalCount: number;

  /** Source count */
  sourceCount: number;

  /** Analysis explanation */
  explanation: string[];

  /** Risk flags */
  riskFlags: string[];

  /** Recommendations */
  recommendations: string[];

  /** Supporting signals */
  signals: DiscoverySignal[];

  /** When analysis started */
  startedAt: Date;

  /** When analysis completed */
  completedAt?: Date;

  /** Last updated */
  updatedAt: Date;

  /** Review status */
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';

  /** Reviewer notes */
  reviewerNotes?: string;

  /** Related discoveries */
  relatedDiscoveries: string[];
}

/**
 * Create a discovery analysis.
 */
export function createDiscoveryAnalysis(
  params: Omit<DiscoveryAnalysis, 'id' | 'startedAt' | 'updatedAt' | 'reviewStatus'>
): DiscoveryAnalysis {
  const now = new Date();

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startedAt: now,
    updatedAt: now,
    reviewStatus: 'pending',
    ...params,
  };
}

/**
 * Calculate overall confidence from factors.
 */
export function calculateOverallConfidence(factors: ConfidenceFactors): number {
  const weights = {
    sourceCount: 0.15,
    sourceQuality: 0.25,
    signalConsistency: 0.25,
    trendPersistence: 0.2,
    evidenceDiversity: 0.15,
  };

  let weightedSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const factorKey = key as keyof ConfidenceFactors;
    weightedSum += (factors[factorKey] ?? 50) * weight;
  }

  return Math.round(weightedSum);
}

/**
 * Update discovery status based on confidence.
 */
export function updateDiscoveryStatus(
  analysis: DiscoveryAnalysis,
  newConfidence: number
): DiscoveryStatus {
  if (newConfidence >= 85) return 'confirmed';
  if (newConfidence >= 70) return 'validated';
  if (newConfidence >= 50) return 'candidate';
  if (newConfidence >= 30) return 'investigating';
  return 'rejected';
}

/**
 * Merge multiple analyses.
 */
export function mergeAnalyses(
  analyses: DiscoveryAnalysis[]
): DiscoveryAnalysis | null {
  if (analyses.length === 0) return null;
  if (analyses.length === 1) return analyses[0]!;

  const base = analyses[0]!;

  // Aggregate signals
  const allSignals = analyses.flatMap((a) => a.signals);
  const uniqueSignals = Array.from(new Map(allSignals.map((s) => [s.id, s])).values());

  // Average confidence
  const avgConfidence = Math.round(
    analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
  );

  // Aggregate explanations
  const allExplanations = analyses.flatMap((a) => a.explanation);
  const uniqueExplanations = Array.from(new Set(allExplanations));

  // Aggregate risk flags
  const allFlags = analyses.flatMap((a) => a.riskFlags);
  const uniqueFlags = Array.from(new Set(allFlags));

  return {
    ...base,
    id: `merged-${Date.now()}`,
    confidence: avgConfidence,
    signalCount: uniqueSignals.length,
    signals: uniqueSignals,
    explanation: uniqueExplanations,
    riskFlags: uniqueFlags,
    updatedAt: new Date(),
  };
}

/**
 * Generate discovery summary.
 */
export function generateDiscoverySummary(analysis: DiscoveryAnalysis): string {
  const parts: string[] = [];

  parts.push(`${analysis.entityName}:`);
  parts.push(`${analysis.discoveryType.replace('_', ' ')}`);
  parts.push(`confidence ${analysis.confidence}/100`);
  parts.push(`(${analysis.status})`);

  if (analysis.growthStrength > 0) {
    parts.push(`growth strength ${analysis.growthStrength}/100`);
  }

  return parts.join(' | ');
}
