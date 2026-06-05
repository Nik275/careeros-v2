/**
 * CareerOS Market Intelligence - Emerging Career Engine
 *
 * Detects new careers emerging from market signals.
 * Does not rely on pre-existing career definitions.
 */

import type { MarketSignal } from './models/MarketSignal';
import type {
  EmergingCareer,
  EmergingCareerStage,
  EmergingCareerEvidence,
} from './models/EmergingCareer';
import type { MarketRepository } from './repositories/MarketRepository';
import type { MarketConfidenceEngine } from './MarketConfidenceEngine';
import {
  EMERGING_CAREER_CONFIDENCE_WEIGHTS,
  EMERGING_CAREER_EVIDENCE_WEIGHTS,
  GROWTH_RATE_THRESHOLDS,
} from './constants/MarketWeights';

/**
 * Configuration for EmergingCareerEngine.
 */
export interface EmergingCareerEngineConfig {
  /** Minimum signal strength for consideration */
  minSignalStrength: number;

  /** Minimum time window (days) */
  minTimeWindowDays: number;

  /** Growth rate threshold for emerging status */
  minGrowthRate: number;

  /** Minimum evidence sources */
  minEvidenceSources: number;

  /** Confidence threshold for emergence */
  minEmergenceConfidence: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_EMERGING_CAREER_ENGINE_CONFIG: EmergingCareerEngineConfig = {
  minSignalStrength: 10,
  minTimeWindowDays: 30,
  minGrowthRate: 20,
  minEvidenceSources: 2,
  minEmergenceConfidence: 60,
};

/**
 * Candidate emerging career from signal analysis.
 */
interface EmergingCandidate {
  careerTitle: string;
  careerIdentifier: string;
  signals: MarketSignal[];
  firstAppearance: Date;
  lastAppearance: Date;
}

/**
 * Detects emerging careers from market signals.
 */
export class EmergingCareerEngine {
  private config: EmergingCareerEngineConfig;
  private repository: MarketRepository;
  private confidenceEngine: MarketConfidenceEngine;

  constructor(
    repository: MarketRepository,
    confidenceEngine: MarketConfidenceEngine,
    config?: Partial<EmergingCareerEngineConfig>
  ) {
    this.repository = repository;
    this.confidenceEngine = confidenceEngine;
    this.config = { ...DEFAULT_EMERGING_CAREER_ENGINE_CONFIG, ...config };
  }

  /**
   * Detect emerging careers from recent signals.
   */
  async detectEmergingCareers(options?: {
    timeWindowDays?: number;
    minGrowthRate?: number;
  }): Promise<EmergingCareer[]> {
    const timeWindow = options?.timeWindowDays ?? 90;
    const minGrowth = options?.minGrowthRate ?? this.config.minGrowthRate;

    // Get recent signals
    const startDate = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);
    const signals = await this.repository.getSignalsByType('job_postings', {
      startDate,
    });

    // Group signals by career title
    const candidates = this.identifyCandidates(signals);

    // Analyze each candidate
    const emergingCareers: EmergingCareer[] = [];

    for (const candidate of candidates) {
      const emerging = await this.analyzeCandidate(candidate, minGrowth);
      if (emerging) {
        emergingCareers.push(emerging);
      }
    }

    // Sort by confidence
    return emergingCareers.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze a specific career title for emergence.
   */
  async analyzeCareerTitle(
    careerTitle: string,
    options?: {
      timeWindowDays?: number;
      minGrowthRate?: number;
    }
  ): Promise<EmergingCareer | null> {
    const timeWindow = options?.timeWindowDays ?? 180;
    const minGrowth = options?.minGrowthRate ?? this.config.minGrowthRate;

    // Get signals for this career
    const startDate = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);
    const signals = await this.repository.getSignalsByType('job_postings', { startDate });

    // Filter to matching career
    const careerSignals = signals.filter(
      (s) => s.careerTitle.toLowerCase() === careerTitle.toLowerCase()
    );

    if (careerSignals.length < 3) {
      return null;
    }

    const candidate: EmergingCandidate = {
      careerTitle,
      careerIdentifier: careerSignals[0].careerId,
      signals: careerSignals,
      firstAppearance: new Date(Math.min(...careerSignals.map((s) => s.timestamp.getTime()))),
      lastAppearance: new Date(Math.max(...careerSignals.map((s) => s.timestamp.getTime()))),
    };

    return this.analyzeCandidate(candidate, minGrowth);
  }

  /**
   * Identify candidate careers from signals.
   */
  private identifyCandidates(signals: MarketSignal[]): EmergingCandidate[] {
    const byCareer = new Map<string, MarketSignal[]>();

    for (const signal of signals) {
      const key = signal.careerTitle.toLowerCase();
      const existing = byCareer.get(key) ?? [];
      existing.push(signal);
      byCareer.set(key, existing);
    }

    const candidates: EmergingCandidate[] = [];

    for (const [careerTitle, careerSignals] of byCareer) {
      // Filter strong signals
      const strongSignals = careerSignals.filter(
        (s) => Math.abs(s.strength) >= this.config.minSignalStrength
      );

      if (strongSignals.length < 3) continue;

      const timestamps = strongSignals.map((s) => s.timestamp.getTime());

      candidates.push({
        careerTitle,
        careerIdentifier: strongSignals[0].careerId,
        signals: strongSignals,
        firstAppearance: new Date(Math.min(...timestamps)),
        lastAppearance: new Date(Math.max(...timestamps)),
      });
    }

    return candidates;
  }

  /**
   * Analyze a candidate for emergence indicators.
   */
  private async analyzeCandidate(
    candidate: EmergingCandidate,
    minGrowthRate: number
  ): Promise<EmergingCareer | null> {
    // Calculate growth metrics
    const growthMetrics = this.calculateGrowthMetrics(candidate);

    // Check minimum growth rate
    if (growthMetrics.growthRate < minGrowthRate) {
      return null;
    }

    // Gather evidence
    const evidence = this.gatherEvidence(candidate);

    // Check minimum evidence sources
    if (evidence.length < this.config.minEvidenceSources) {
      return null;
    }

    // Calculate confidence
    const confidence = this.calculateEmergenceConfidence(candidate, evidence);

    // Check minimum confidence
    if (confidence < this.config.minEmergenceConfidence) {
      return null;
    }

    // Determine stage
    const stage = this.determineStage(candidate, growthMetrics, confidence);

    // Calculate velocity score
    const velocity = this.calculateVelocityScore(growthMetrics);

    // Identify related careers
    const relatedCareers = await this.identifyRelatedCareers(candidate);

    // Build emerging career
    return {
      id: `emerging-${candidate.careerIdentifier}-${Date.now()}`,
      careerTitle: candidate.careerTitle,
      careerIdentifier: candidate.careerIdentifier,
      firstDetected: candidate.firstAppearance,
      stage,
      confidence,
      evidence,
      emergenceIndicators: {
        growthRate: Math.round(growthMetrics.growthRate),
        volumeIncrease: Math.round(growthMetrics.volumeIncrease),
        geographicSpread: growthMetrics.geographicSpread,
        skillMentions: growthMetrics.skillMentions,
      },
      velocity,
      relatedCareers,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate growth metrics for a candidate.
   */
  private calculateGrowthMetrics(candidate: EmergingCandidate): {
    growthRate: number;
    volumeIncrease: number;
    geographicSpread: number;
    skillMentions: number;
  } {
    // Sort signals chronologically
    const sorted = [...candidate.signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Split into periods
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    // Calculate volume increase
    const firstVolume = firstHalf.length;
    const secondVolume = secondHalf.length;
    const volumeIncrease =
      firstVolume > 0 ? ((secondVolume - firstVolume) / firstVolume) * 100 : 0;

    // Calculate growth rate (annualized)
    const timeSpanDays =
      (candidate.lastAppearance.getTime() - candidate.firstAppearance.getTime()) /
      (1000 * 60 * 60 * 24);
    const growthRate = timeSpanDays > 0 ? (volumeIncrease / timeSpanDays) * 365 : 0;

    // Calculate geographic spread
    const geographies = new Set(candidate.signals.map((s) => s.geography));
    const geographicSpread = Math.min(100, geographies.size * 20);

    // Estimate skill mentions from metadata
    const skillMentions = candidate.signals.reduce((sum, s) => {
      const metadata = s.metadata as Record<string, unknown>;
      return sum + (metadata.skillMentions ? 1 : 0);
    }, 0);

    return {
      growthRate,
      volumeIncrease,
      geographicSpread,
      skillMentions,
    };
  }

  /**
   * Gather evidence for emerging career.
   */
  private gatherEvidence(candidate: EmergingCandidate): EmergingCareerEvidence[] {
    const evidence: EmergingCareerEvidence[] = [];

    // Group by evidence type
    const byType = new Map<string, MarketSignal[]>();

    for (const signal of candidate.signals) {
      const type = this.classifyEvidenceType(signal);
      const existing = byType.get(type) ?? [];
      existing.push(signal);
      byType.set(type, existing);
    }

    for (const [type, signals] of byType) {
      evidence.push({
        type: type as EmergingCareerEvidence['type'],
        source: signals[0].source,
        timestamp: new Date(Math.max(...signals.map((s) => s.timestamp.getTime()))),
        description: `${signals.length} ${type} signals detected`,
        confidence: Math.round(
          signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
        ),
        rawData: signals[0].metadata,
      });
    }

    return evidence;
  }

  /**
   * Classify evidence type from signal.
   */
  private classifyEvidenceType(signal: MarketSignal): string {
    const typeMap: Record<string, string> = {
      job_postings: 'job_titles',
      salary_growth: 'salary_trends',
      skill_growth: 'skills_mention',
      government_push: 'industry_reports',
      startup_activity: 'startup_titles',
      investment_flow: 'industry_reports',
      layoffs: 'job_titles',
    };

    return typeMap[signal.signalType] ?? 'other';
  }

  /**
   * Calculate emergence confidence.
   */
  private calculateEmergenceConfidence(
    candidate: EmergingCandidate,
    evidence: EmergingCareerEvidence[]
  ): number {
    // Signal strength score
    const avgSignalStrength =
      candidate.signals.reduce((sum, s) => sum + Math.abs(s.strength), 0) /
      candidate.signals.length;
    const signalStrengthScore = Math.min(100, avgSignalStrength * 2);

    // Signal consistency
    const strengths = candidate.signals.map((s) => s.strength);
    const avgStrength = strengths.reduce((a, b) => a + b, 0) / strengths.length;
    const variance =
      strengths.reduce((sum, s) => Math.pow(s - avgStrength, 2), 0) / strengths.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    // Source diversity
    const sources = new Set(candidate.signals.map((s) => s.source));
    const sourceDiversityScore = Math.min(100, sources.size * 25);

    // Growth trajectory (from evidence)
    const evidenceConfidence =
      evidence.reduce((sum, e) => sum + e.confidence, 0) / Math.max(evidence.length, 1);

    // Weighted calculation
    const confidence =
      signalStrengthScore * EMERGING_CAREER_CONFIDENCE_WEIGHTS.signalStrength +
      consistencyScore * EMERGING_CAREER_CONFIDENCE_WEIGHTS.signalConsistency +
      sourceDiversityScore * EMERGING_CAREER_CONFIDENCE_WEIGHTS.sourceDiversity +
      evidenceConfidence * EMERGING_CAREER_CONFIDENCE_WEIGHTS.growthTrajectory;

    return Math.round(confidence);
  }

  /**
   * Determine emergence stage.
   */
  private determineStage(
    candidate: EmergingCandidate,
    metrics: { growthRate: number; volumeIncrease: number },
    confidence: number
  ): EmergingCareerStage {
    const ageDays =
      (Date.now() - candidate.firstAppearance.getTime()) / (1000 * 60 * 60 * 24);

    // Early stage: < 60 days, high growth
    if (ageDays < 60 && metrics.growthRate >= GROWTH_RATE_THRESHOLDS.rapid) {
      return EmergingCareerStage.EARLY;
    }

    // Accelerating: consistent high growth
    if (metrics.growthRate >= GROWTH_RATE_THRESHOLDS.strong && confidence >= 70) {
      return EmergingCareerStage.ACCELERATING;
    }

    // Established: older, stable growth
    if (ageDays > 180 && metrics.growthRate >= GROWTH_RATE_THRESHOLDS.moderate) {
      return EmergingCareerStage.ESTABLISHED;
    }

    // Slowing: declining growth rate
    if (metrics.growthRate < GROWTH_RATE_THRESHOLDS.moderate && ageDays > 90) {
      return EmergingCareerStage.SLOWING;
    }

    // Default to early
    return EmergingCareerStage.EARLY;
  }

  /**
   * Calculate velocity score.
   */
  private calculateVelocityScore(metrics: {
    growthRate: number;
    volumeIncrease: number;
    geographicSpread: number;
  }): number {
    // Weight components
    const growthWeight = 0.4;
    const volumeWeight = 0.35;
    const spreadWeight = 0.25;

    // Normalize to 0-100
    const normalizedGrowth = Math.min(100, metrics.growthRate * 2);
    const normalizedVolume = Math.min(100, metrics.volumeIncrease);
    const normalizedSpread = metrics.geographicSpread;

    return Math.round(
      normalizedGrowth * growthWeight +
        normalizedVolume * volumeWeight +
        normalizedSpread * spreadWeight
    );
  }

  /**
   * Identify related careers.
   */
  private async identifyRelatedCareers(
    candidate: EmergingCandidate
  ): Promise<EmergingCareer['relatedCareers']> {
    // In real implementation, would analyze signal metadata for related skills
    // For now, return placeholder
    return [];
  }

  /**
   * Promote emerging career to established.
   */
  async promoteToEstablished(emergingCareerId: string): Promise<boolean> {
    // This would integrate with the career taxonomy system
    // For now, just return success
    return true;
  }

  /**
   * Get emerging careers by stage.
   */
  async getEmergingByStage(stage: EmergingCareerStage): Promise<EmergingCareer[]> {
    const all = await this.detectEmergingCareers();
    return all.filter((e) => e.stage === stage);
  }

  /**
   * Monitor career for emergence.
   */
  async monitorCareer(careerTitle: string): Promise<{
    isEmerging: boolean;
    confidence: number;
    stage?: EmergingCareerStage;
  }> {
    const emerging = await this.analyzeCareerTitle(careerTitle);

    if (!emerging) {
      return { isEmerging: false, confidence: 0 };
    }

    return {
      isEmerging: true,
      confidence: emerging.confidence,
      stage: emerging.stage,
    };
  }
}

/**
 * Factory function for EmergingCareerEngine.
 */
export function createEmergingCareerEngine(
  repository: MarketRepository,
  confidenceEngine: MarketConfidenceEngine,
  config?: Partial<EmergingCareerEngineConfig>
): EmergingCareerEngine {
  return new EmergingCareerEngine(repository, confidenceEngine, config);
}
