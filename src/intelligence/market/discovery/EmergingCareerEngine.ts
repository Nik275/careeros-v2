/**
 * CareerOS Market Intelligence - Emerging Career Engine
 *
 * Identifies careers that are newly emerging in the labor market.
 *
 * Examples:
 * - AI Agent Engineer
 * - Climate Risk Analyst
 * - Synthetic Media Producer
 * - Digital Twin Architect
 * - Autonomous Systems Supervisor
 *
 * Output: EmergingCareer records with confidence scores
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingCareer, CareerLifecycleStage } from './models/EmergingCareer';
import {
  createEmergingCareer,
  updateCareerStage,
  calculateMaturityScore,
} from './models/EmergingCareer';
import { DiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';

/**
 * Configuration for emerging career detection.
 */
export interface EmergingCareerConfig {
  /** Minimum signals required */
  minSignals: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Analysis period (days) */
  analysisPeriodDays: number;

  /** Growth threshold for emergence */
  growthThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_EMERGING_CAREER_CONFIG: EmergingCareerConfig = {
  minSignals: 3,
  minConfidence: 50,
  analysisPeriodDays: 90,
  growthThreshold: 60,
};

/**
 * Detection result.
 */
export interface CareerDetectionResult {
  /** Detected career */
  career: EmergingCareer;

  /** Confidence score */
  confidence: number;

  /** Supporting signals */
  signals: DiscoverySignal[];

  /** Is valid emerging career */
  isValid: boolean;

  /** Reason for rejection (if invalid) */
  rejectionReason?: string;
}

/**
 * Identifies emerging careers from discovery signals.
 */
export class EmergingCareerEngine {
  private config: EmergingCareerConfig;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // In-memory storage
  private careers: Map<string, EmergingCareer> = new Map();
  private signals: Map<string, DiscoverySignal[]> = new Map();

  constructor(config?: Partial<EmergingCareerConfig>) {
    this.config = { ...DEFAULT_EMERGING_CAREER_CONFIG, ...config };
    this.confidenceEngine = new DiscoveryConfidenceEngine();
  }

  /**
   * Process discovery signals to find emerging careers.
   */
  processSignals(signals: DiscoverySignal[]): CareerDetectionResult[] {
    const results: CareerDetectionResult[] = [];

    // Group signals by career
    const grouped = this.groupSignalsByCareer(signals);

    for (const [careerName, careerSignals] of grouped) {
      const result = this.analyzeCareerSignals(careerName, careerSignals);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Analyze signals for a specific career.
   */
  analyzeCareerSignals(
    careerName: string,
    signals: DiscoverySignal[]
  ): CareerDetectionResult | null {
    // Filter to relevant signals
    const relevantSignals = signals.filter(
      (s) =>
        s.targetEntity.type === 'career' &&
        (s.signalType === 'new_job_title' ||
          s.signalType === 'skill_growth' ||
          s.signalType === 'industry_growth' ||
          s.signalType === 'technology_shift')
    );

    if (relevantSignals.length < this.config.minSignals) {
      return {
        career: this.createPlaceholderCareer(careerName),
        confidence: 0,
        signals: relevantSignals,
        isValid: false,
        rejectionReason: `Insufficient signals (${relevantSignals.length} < ${this.config.minSignals})`,
      };
    }

    // Calculate confidence
    const confidence = this.confidenceEngine.calculateConfidence(relevantSignals);

    if (confidence.overall < this.config.minConfidence) {
      return {
        career: this.createPlaceholderCareer(careerName),
        confidence: confidence.overall,
        signals: relevantSignals,
        isValid: false,
        rejectionReason: `Confidence too low (${confidence.overall} < ${this.config.minConfidence})`,
      };
    }

    // Create or update career record
    const career = this.createOrUpdateCareer(careerName, relevantSignals, confidence);

    return {
      career,
      confidence: confidence.overall,
      signals: relevantSignals,
      isValid: true,
    };
  }

  /**
   * Add new discovery signal.
   */
  addSignal(signal: DiscoverySignal): void {
    if (signal.targetEntity.type !== 'career') return;

    const key = signal.targetEntity.name.toLowerCase();

    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }

    const existing = this.signals.get(key)!;
    existing.push(signal);

    // Update career if exists
    this.updateCareerFromSignals(key);
  }

  /**
   * Get emerging career by name.
   */
  getCareer(name: string): EmergingCareer | null {
    return this.careers.get(name.toLowerCase()) ?? null;
  }

  /**
   * Get all emerging careers.
   */
  getAllCareers(): EmergingCareer[] {
    return Array.from(this.careers.values());
  }

  /**
   * Get careers by stage.
   */
  getCareersByStage(stage: CareerLifecycleStage): EmergingCareer[] {
    return this.getAllCareers().filter((c) => c.stage === stage);
  }

  /**
   * Get high-confidence emerging careers.
   */
  getHighConfidenceCareers(threshold: number = 70): EmergingCareer[] {
    return this.getAllCareers()
      .filter((c) => c.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rank careers by growth potential.
   */
  rankByGrowthPotential(): EmergingCareer[] {
    return this.getAllCareers().sort((a, b) => {
      const scoreA = a.growthSignal * 0.4 + a.momentum * 0.3 + a.confidence * 0.3;
      const scoreB = b.growthSignal * 0.4 + b.momentum * 0.3 + b.confidence * 0.3;
      return scoreB - scoreA;
    });
  }

  /**
   * Find similar careers.
   */
  findSimilarCareers(careerName: string, threshold: number = 60): EmergingCareer[] {
    const career = this.getCareer(careerName);
    if (!career) return [];

    return this.getAllCareers().filter((c) => {
      if (c.id === career.id) return false;

      // Check skill overlap
      const skillOverlap = c.relatedSkills.filter((s) => career.relatedSkills.includes(s)).length;
      const skillScore =
        career.relatedSkills.length > 0
          ? (skillOverlap / career.relatedSkills.length) * 100
          : 0;

      // Check industry overlap
      const industryOverlap = c.relatedIndustries.filter((i) =>
        career.relatedIndustries.includes(i)
      ).length;
      const industryScore =
        career.relatedIndustries.length > 0
          ? (industryOverlap / career.relatedIndustries.length) * 100
          : 0;

      const similarity = skillScore * 0.6 + industryScore * 0.4;

      return similarity >= threshold;
    });
  }

  /**
   * Update career review status.
   */
  updateReviewStatus(
    careerId: string,
    status: EmergingCareer['reviewStatus'],
    notes?: string
  ): boolean {
    const career = Array.from(this.careers.values()).find((c) => c.id === careerId);
    if (!career) return false;

    career.reviewStatus = status;
    if (notes) career.reviewNotes = notes;
    career.updatedAt = new Date();

    return true;
  }

  /**
   * Group signals by career name.
   */
  private groupSignalsByCareer(
    signals: DiscoverySignal[]
  ): Map<string, DiscoverySignal[]> {
    const grouped = new Map<string, DiscoverySignal[]>();

    for (const signal of signals) {
      if (signal.targetEntity.type !== 'career') continue;

      const name = signal.targetEntity.name.toLowerCase();

      if (!grouped.has(name)) {
        grouped.set(name, []);
      }

      grouped.get(name)!.push(signal);
    }

    return grouped;
  }

  /**
   * Create placeholder career for invalid detection.
   */
  private createPlaceholderCareer(name: string): EmergingCareer {
    return createEmergingCareer({
      title: name,
      alternativeTitles: [],
      stage: 'unverified',
      confidence: 0,
      growthSignal: 0,
      demandSignal: 0,
      momentum: 0,
      evidenceSources: [],
      signals: [],
      relatedSkills: [],
      relatedIndustries: [],
      geography: { primaryRegions: [], emergingRegions: [] },
      estimatedMarketSize: 0,
      salaryIndicators: { currency: 'USD' },
    });
  }

  /**
   * Create or update career record.
   */
  private createOrUpdateCareer(
    name: string,
    signals: DiscoverySignal[],
    confidence: { overall: number; factors: { signalConsistency: number; trendPersistence: number } }
  ): EmergingCareer {
    const existing = this.careers.get(name.toLowerCase());

    if (existing) {
      // Update existing
      existing.signals = [...existing.signals, ...signals];
      existing.confidence = confidence.overall;
      existing.growthSignal = this.calculateGrowthSignal(signals);
      existing.demandSignal = this.calculateDemandSignal(signals);
      existing.momentum = this.calculateMomentum(signals);
      existing.stage = updateCareerStage(
        existing,
        existing.signals.length,
        confidence.overall
      );
      existing.updatedAt = new Date();

      // Update evidence sources
      existing.evidenceSources = signals.map((s) => ({
        type: this.mapSignalToEvidenceType(s.signalType),
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      }));

      return existing;
    }

    // Create new
    const career = createEmergingCareer({
      title: name,
      alternativeTitles: this.extractAlternativeTitles(signals),
      stage: 'emerging',
      confidence: confidence.overall,
      growthSignal: this.calculateGrowthSignal(signals),
      demandSignal: this.calculateDemandSignal(signals),
      momentum: this.calculateMomentum(signals),
      evidenceSources: signals.map((s) => ({
        type: this.mapSignalToEvidenceType(s.signalType),
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      })),
      signals,
      relatedSkills: this.extractRelatedSkills(signals),
      relatedIndustries: this.extractRelatedIndustries(signals),
      geography: this.extractGeography(signals),
      estimatedMarketSize: this.estimateMarketSize(signals),
      salaryIndicators: { currency: 'USD' },
    });

    this.careers.set(name.toLowerCase(), career);
    return career;
  }

  /**
   * Update career from stored signals.
   */
  private updateCareerFromSignals(key: string): void {
    const signals = this.signals.get(key);
    if (!signals || signals.length < this.config.minSignals) return;

    const confidence = this.confidenceEngine.calculateConfidence(signals);
    if (confidence.overall < this.config.minConfidence) return;

    this.createOrUpdateCareer(key, signals, confidence);
  }

  /**
   * Calculate growth signal strength.
   */
  private calculateGrowthSignal(signals: DiscoverySignal[]): number {
    const growthSignals = signals.filter(
      (s) => s.signalType === 'skill_growth' || s.signalType === 'industry_growth'
    );

    if (growthSignals.length === 0) return 50;

    const avgStrength =
      growthSignals.reduce((sum, s) => sum + s.strength, 0) / growthSignals.length;

    return Math.round(avgStrength);
  }

  /**
   * Calculate demand signal strength.
   */
  private calculateDemandSignal(signals: DiscoverySignal[]): number {
    const demandSignals = signals.filter((s) => s.signalType === 'new_job_title');

    if (demandSignals.length === 0) return 50;

    const avgStrength =
      demandSignals.reduce((sum, s) => sum + s.strength, 0) / demandSignals.length;

    return Math.round(avgStrength);
  }

  /**
   * Calculate momentum.
   */
  private calculateMomentum(signals: DiscoverySignal[]): number {
    if (signals.length < 2) return 50;

    // Sort by timestamp
    const sorted = [...signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate trend
    const recent = sorted.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.strength, 0) / recent.length;

    return Math.round(avgRecent);
  }

  /**
   * Map signal type to evidence type.
   */
  private mapSignalToEvidenceType(signalType: string): EmergingCareer['evidenceSources'][0]['type'] {
    const mapping: Record<string, EmergingCareer['evidenceSources'][0]['type']> = {
      new_job_title: 'job_posting',
      skill_growth: 'industry_report',
      industry_growth: 'industry_report',
      funding_activity: 'industry_report',
      government_policy: 'industry_report',
      education_adoption: 'education_program',
      technology_shift: 'research_paper',
    };

    return mapping[signalType] ?? 'news_article';
  }

  /**
   * Extract alternative titles from signals.
   */
  private extractAlternativeTitles(signals: DiscoverySignal[]): string[] {
    const titles = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.description) {
        // Look for "also known as" patterns
        const akaMatch = signal.context.description.match(/also known as "([^"]+)"/i);
        if (akaMatch) {
          titles.add(akaMatch[1]!);
        }
      }
    }

    return Array.from(titles);
  }

  /**
   * Extract related skills from signals.
   */
  private extractRelatedSkills(signals: DiscoverySignal[]): string[] {
    const skills = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        skills.add(related);
      }
    }

    return Array.from(skills);
  }

  /**
   * Extract related industries from signals.
   */
  private extractRelatedIndustries(signals: DiscoverySignal[]): string[] {
    const industries = new Set<string>();

    for (const signal of signals) {
      for (const industry of signal.context?.industryScope ?? []) {
        industries.add(industry);
      }
    }

    return Array.from(industries);
  }

  /**
   * Extract geographic information.
   */
  private extractGeography(signals: DiscoverySignal[]): EmergingCareer['geography'] {
    const regions = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.geographicScope) {
        regions.add(signal.context.geographicScope);
      }
    }

    const regionList = Array.from(regions);

    return {
      primaryRegions: regionList.slice(0, 2),
      emergingRegions: regionList.slice(2),
    };
  }

  /**
   * Estimate market size.
   */
  private estimateMarketSize(signals: DiscoverySignal[]): number {
    // Based on signal volume and strength
    const signalScore = Math.min(100, signals.length * 5);
    const strengthScore =
      signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

    return Math.round((signalScore + strengthScore) / 2);
  }
}

/**
 * Factory function for EmergingCareerEngine.
 */
export function createEmergingCareerEngine(
  config?: Partial<EmergingCareerConfig>
): EmergingCareerEngine {
  return new EmergingCareerEngine(config);
}
