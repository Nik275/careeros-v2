/**
 * CareerOS Market Intelligence - Declining Career Engine
 *
 * Identifies careers experiencing structural decline.
 *
 * Examples:
 * - Manual Data Entry
 * - Traditional Print Journalism
 * - Toll Booth Operator
 * - Film Developer
 * - Travel Agent (traditional)
 * - Telephone Operator
 *
 * Output: DecliningCareer records with decline assessments
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { DecliningCareer, DeclineStage, DeclineDriver } from './models/DecliningCareer';
import {
  createDecliningCareer,
  updateDeclineStage,
  calculateDeclineUrgency,
  recommendAlternativePaths,
  generateDeclineExplanation,
} from './models/DecliningCareer';
import { DiscoveryConfidenceEngine, createDiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';

/**
 * Configuration for declining career detection.
 */
export interface DecliningCareerConfig {
  /** Minimum signals required */
  minSignals: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Decline threshold to trigger detection */
  declineThreshold: number;

  /** Analysis period (days) */
  analysisPeriodDays: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DECLINING_CAREER_CONFIG: DecliningCareerConfig = {
  minSignals: 3,
  minConfidence: 60,
  declineThreshold: 50,
  analysisPeriodDays: 180,
};

/**
 * Decline detection result.
 */
export interface DeclineDetectionResult {
  /** Detected declining career */
  career: DecliningCareer;

  /** Confidence score */
  confidence: number;

  /** Supporting signals */
  signals: DiscoverySignal[];

  /** Is valid declining career */
  isValid: boolean;

  /** Rejection reason (if invalid) */
  rejectionReason?: string;
}

/**
 * Decline alert.
 */
export interface DeclineAlert {
  /** Career ID */
  careerId: string;

  /** Career title */
  title: string;

  /** Alert level */
  level: 'info' | 'warning' | 'critical';

  /** Decline severity */
  severity: number;

  /** Urgency score */
  urgency: number;

  /** Timeline estimate */
  timeline?: number;

  /** Affected regions */
  affectedRegions: string[];

  /** Recommended actions */
  recommendedActions: string[];
}

/**
 * Identifies declining careers from discovery signals.
 */
export class DecliningCareerEngine {
  private config: DecliningCareerConfig;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // In-memory storage
  private careers: Map<string, DecliningCareer> = new Map();
  private signals: Map<string, DiscoverySignal[]> = new Map();

  constructor(config?: Partial<DecliningCareerConfig>) {
    this.config = { ...DEFAULT_DECLINING_CAREER_CONFIG, ...config };
    this.confidenceEngine = createDiscoveryConfidenceEngine();
  }

  /**
   * Process discovery signals to find declining careers.
   */
  processSignals(signals: DiscoverySignal[]): DeclineDetectionResult[] {
    const results: DeclineDetectionResult[] = [];

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
  ): DeclineDetectionResult | null {
    // Filter to relevant decline signals
    const relevantSignals = signals.filter(
      (s) =>
        s.targetEntity.type === 'career' &&
        (s.signalType === 'technology_shift' ||
          s.signalType === 'automation_trigger' ||
          s.signalType === 'market_convergence' ||
          s.signalType === 'regulatory_change')
    );

    // Check for negative strength (indicates decline)
    const declineSignals = relevantSignals.filter((s) => s.strength < 50);

    if (declineSignals.length < this.config.minSignals) {
      return {
        career: this.createPlaceholderCareer(careerName),
        confidence: 0,
        signals: declineSignals,
        isValid: false,
        rejectionReason: `Insufficient decline signals (${declineSignals.length} < ${this.config.minSignals})`,
      };
    }

    // Calculate decline metrics
    const declineSeverity = this.calculateDeclineSeverity(declineSignals);

    if (declineSeverity < this.config.declineThreshold) {
      return {
        career: this.createPlaceholderCareer(careerName),
        confidence: 0,
        signals: declineSignals,
        isValid: false,
        rejectionReason: `Decline severity below threshold (${declineSeverity} < ${this.config.declineThreshold})`,
      };
    }

    // Calculate confidence
    const confidence = this.confidenceEngine.calculateConfidence(declineSignals);

    if (confidence.overall < this.config.minConfidence) {
      return {
        career: this.createPlaceholderCareer(careerName),
        confidence: confidence.overall,
        signals: declineSignals,
        isValid: false,
        rejectionReason: `Confidence too low (${confidence.overall} < ${this.config.minConfidence})`,
      };
    }

    // Create or update career record
    const career = this.createOrUpdateCareer(careerName, declineSignals, confidence.overall, declineSeverity);

    return {
      career,
      confidence: confidence.overall,
      signals: declineSignals,
      isValid: true,
    };
  }

  /**
   * Add new decline signal.
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
   * Get declining career by name.
   */
  getCareer(name: string): DecliningCareer | null {
    return this.careers.get(name.toLowerCase()) ?? null;
  }

  /**
   * Get all declining careers.
   */
  getAllCareers(): DecliningCareer[] {
    return Array.from(this.careers.values());
  }

  /**
   * Get careers by decline stage.
   */
  getCareersByStage(stage: DeclineStage): DecliningCareer[] {
    return this.getAllCareers().filter((c) => c.stage === stage);
  }

  /**
   * Get high-priority declining careers.
   */
  getHighPriority(threshold: number = 70): DecliningCareer[] {
    return this.getAllCareers()
      .filter((c) => calculateDeclineUrgency(c) >= threshold)
      .sort((a, b) => calculateDeclineUrgency(b) - calculateDeclineUrgency(a));
  }

  /**
   * Get decline alerts.
   */
  getAlerts(minUrgency: number = 60): DeclineAlert[] {
    const alerts: DeclineAlert[] = [];

    for (const career of this.getAllCareers()) {
      const urgency = calculateDeclineUrgency(career);

      if (urgency >= minUrgency) {
        alerts.push({
          careerId: career.id,
          title: career.title,
          level: urgency >= 80 ? 'critical' : urgency >= 60 ? 'warning' : 'info',
          severity: career.declineSeverity,
          urgency,
          timeline: career.timelineEstimate,
          affectedRegions: career.affectedRegions,
          recommendedActions: this.generateRecommendedActions(career),
        });
      }
    }

    return alerts.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Get alternative path recommendations.
   */
  getAlternativePaths(
    careerName: string,
    availablePaths: Array<{ id: string; requiredSkills: string[] }>
  ): Array<{ pathId: string; matchScore: number; reasoning: string }> {
    const career = this.getCareer(careerName);
    if (!career) return [];

    return recommendAlternativePaths(career, availablePaths);
  }

  /**
   * Update career review status.
   */
  updateReviewStatus(
    careerId: string,
    status: DecliningCareer['reviewStatus'],
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
   * Generate decline explanation.
   */
  explainDecline(careerName: string): string[] {
    const career = this.getCareer(careerName);
    if (!career) return [];

    return generateDeclineExplanation(career);
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
  private createPlaceholderCareer(name: string): DecliningCareer {
    return createDecliningCareer({
      title: name,
      alternativeTitles: [],
      stage: 'early_decline',
      confidence: 0,
      declineSeverity: 0,
      declineRate: 0,
      drivers: [],
      evidenceSources: [],
      signals: [],
      affectedRegions: [],
      alternativePaths: [],
      transferableSkills: [],
      reskillingDifficulty: 50,
    });
  }

  /**
   * Create or update career record.
   */
  private createOrUpdateCareer(
    name: string,
    signals: DiscoverySignal[],
    confidence: number,
    declineSeverity: number
  ): DecliningCareer {
    const existing = this.careers.get(name.toLowerCase());

    if (existing) {
      // Update existing
      existing.signals = [...existing.signals, ...signals];
      existing.confidence = confidence;
      existing.declineSeverity = declineSeverity;
      existing.declineRate = this.calculateDeclineRate(existing.signals);
      existing.stage = updateDeclineStage(existing, declineSeverity);
      existing.updatedAt = new Date();

      // Update drivers
      existing.drivers = this.extractDrivers(signals);

      // Update evidence sources
      existing.evidenceSources = signals.map((s) => ({
        type: 'job_decline',
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      }));

      return existing;
    }

    // Create new
    const career = createDecliningCareer({
      title: name,
      alternativeTitles: [],
      stage: 'early_decline',
      confidence,
      declineSeverity,
      declineRate: this.calculateDeclineRate(signals),
      drivers: this.extractDrivers(signals),
      evidenceSources: signals.map((s) => ({
        type: 'job_decline',
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      })),
      signals,
      affectedRegions: this.extractAffectedRegions(signals),
      alternativePaths: [],
      transferableSkills: this.extractTransferableSkills(signals),
      reskillingDifficulty: this.assessReskillingDifficulty(signals),
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

    const declineSignals = signals.filter((s) => s.strength < 50);
    if (declineSignals.length < this.config.minSignals) return;

    const declineSeverity = this.calculateDeclineSeverity(declineSignals);
    if (declineSeverity < this.config.declineThreshold) return;

    const confidence = this.confidenceEngine.calculateConfidence(declineSignals);
    if (confidence.overall < this.config.minConfidence) return;

    this.createOrUpdateCareer(key, declineSignals, confidence.overall, declineSeverity);
  }

  /**
   * Calculate decline severity.
   */
  private calculateDeclineSeverity(signals: DiscoverySignal[]): number {
    // Invert strength (lower strength = higher decline)
    const invertedStrengths = signals.map((s) => 100 - s.strength);
    const avgSeverity =
      invertedStrengths.reduce((sum, s) => sum + s, 0) / invertedStrengths.length;

    return Math.round(avgSeverity);
  }

  /**
   * Calculate decline rate.
   */
  private calculateDeclineRate(signals: DiscoverySignal[]): number {
    if (signals.length < 2) return 0;

    // Sort by timestamp
    const sorted = [...signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const first = sorted[0].strength;
    const last = sorted[sorted.length - 1].strength;

    // Rate of change per signal
    return Math.round((first - last) / signals.length);
  }

  /**
   * Extract decline drivers.
   */
  private extractDrivers(signals: DiscoverySignal[]): DeclineDriver[] {
    const driverMap: Record<string, DeclineDriver> = {
      technology_shift: 'technology_obsolescence',
      automation_trigger: 'automation',
      ai_replacement: 'ai_replacement',
      market_convergence: 'market_contraction',
      regulatory_change: 'regulatory_change',
      outsourcing: 'outsourcing',
    };

    const drivers = new Set<DeclineDriver>();

    for (const signal of signals) {
      const driver = driverMap[signal.signalType];
      if (driver) {
        drivers.add(driver);
      }
    }

    return Array.from(drivers);
  }

  /**
   * Extract affected regions.
   */
  private extractAffectedRegions(signals: DiscoverySignal[]): string[] {
    const regions = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.geographicScope) {
        regions.add(signal.context.geographicScope);
      }
    }

    return Array.from(regions);
  }

  /**
   * Extract transferable skills.
   */
  private extractTransferableSkills(signals: DiscoverySignal[]): string[] {
    const skills = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        // Assume related entities might be skills
        skills.add(related);
      }
    }

    return Array.from(skills).slice(0, 10);
  }

  /**
   * Assess reskilling difficulty.
   */
  private assessReskillingDifficulty(signals: DiscoverySignal[]): number {
    // Look for indicators in signal context
    for (const signal of signals) {
      if (signal.context?.description) {
        const desc = signal.context.description.toLowerCase();
        if (desc.includes('highly specialized') || desc.includes('niche')) {
          return 80;
        }
        if (desc.includes('transferable') || desc.includes('versatile')) {
          return 40;
        }
      }
    }

    return 60; // Default moderate difficulty
  }

  /**
   * Generate recommended actions.
   */
  private generateRecommendedActions(career: DecliningCareer): string[] {
    const actions: string[] = [];

    if (career.alternativePaths.length > 0) {
      actions.push('Explore identified alternative career paths');
    }

    if (career.transferableSkills.length > 0) {
      actions.push('Leverage transferable skills for transition');
    }

    if (career.reskillingDifficulty < 70) {
      actions.push('Consider reskilling opportunities');
    }

    const urgency = calculateDeclineUrgency(career);
    if (urgency >= 80) {
      actions.push('Urgent: Begin transition planning immediately');
    } else if (urgency >= 60) {
      actions.push('Begin exploring alternatives within 6 months');
    }

    return actions;
  }
}

/**
 * Factory function for DecliningCareerEngine.
 */
export function createDecliningCareerEngine(
  config?: Partial<DecliningCareerConfig>
): DecliningCareerEngine {
  return new DecliningCareerEngine(config);
}
