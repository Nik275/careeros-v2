/**
 * CareerOS Market Intelligence - Industry Discovery Engine
 *
 * Main engine for discovering new industry sectors.
 * Coordinates detection, validation, and tracking of emerging industries.
 *
 * Examples of discoveries:
 * - Agent Economy
 * - Climate Tech
 * - Defense Tech
 * - Synthetic Biology
 * - Space Infrastructure
 * - Industrial AI
 * - Quantum Computing Services
 *
 * Output: Validated emerging industry candidates for review
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingIndustry } from './models/EmergingIndustry';
import { EmergingIndustryEngine, createEmergingIndustryEngine } from './EmergingIndustryEngine';
import { DiscoveryConfidenceEngine, createDiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';
import { createDiscoveryAnalysis, type DiscoveryAnalysis } from './models/DiscoveryAnalysis';

/**
 * Industry discovery configuration.
 */
export interface IndustryDiscoveryConfig {
  /** Minimum confidence for promotion to candidate */
  candidateThreshold: number;

  /** Minimum confidence for validation */
  validationThreshold: number;

  /** Auto-promote high-confidence discoveries */
  autoPromote: boolean;

  /** Auto-promote threshold */
  autoPromoteThreshold: number;

  /** Review queue enabled */
  reviewQueueEnabled: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_INDUSTRY_DISCOVERY_CONFIG: IndustryDiscoveryConfig = {
  candidateThreshold: 55,
  validationThreshold: 75,
  autoPromote: false,
  autoPromoteThreshold: 85,
  reviewQueueEnabled: true,
};

/**
 * Discovery queue entry.
 */
export interface IndustryQueueEntry {
  /** Industry ID */
  industryId: string;

  /** Industry name */
  industryName: string;

  /** Queue status */
  status: 'pending' | 'under_review' | 'approved' | 'rejected';

  /** Confidence score */
  confidence: number;

  /** Signal count */
  signalCount: number;

  /** Submitted at */
  submittedAt: Date;

  /** Reviewer assigned */
  reviewer?: string;

  /** Review notes */
  reviewNotes?: string;
}

/**
 * Main industry discovery engine.
 */
export class IndustryDiscoveryEngine {
  private config: IndustryDiscoveryConfig;
  private industryEngine: EmergingIndustryEngine;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // Review queue
  private reviewQueue: Map<string, IndustryQueueEntry> = new Map();

  // Discovery analyses
  private analyses: Map<string, DiscoveryAnalysis> = new Map();

  constructor(config?: Partial<IndustryDiscoveryConfig>) {
    this.config = { ...DEFAULT_INDUSTRY_DISCOVERY_CONFIG, ...config };
    this.industryEngine = createEmergingIndustryEngine();
    this.confidenceEngine = createDiscoveryConfidenceEngine();
  }

  /**
   * Process incoming signals and discover industries.
   */
  discover(signals: DiscoverySignal[]): {
    newDiscoveries: EmergingIndustry[];
    updatedIndustries: EmergingIndustry[];
    analyses: DiscoveryAnalysis[];
  } {
    const newDiscoveries: EmergingIndustry[] = [];
    const updatedIndustries: EmergingIndustry[] = [];
    const newAnalyses: DiscoveryAnalysis[] = [];

    // Process through emerging industry engine
    const results = this.industryEngine.processSignals(signals);

    for (const result of results) {
      if (!result.isValid) continue;

      // Check if this is new or updated
      const existing = this.industryEngine.getIndustry(result.industry.name);

      if (!existing || existing.id === result.industry.id) {
        newDiscoveries.push(result.industry);
      } else {
        updatedIndustries.push(result.industry);
      }

      // Create analysis
      const analysis = this.createAnalysis(result);
      this.analyses.set(analysis.id, analysis);
      newAnalyses.push(analysis);

      // Add to review queue if enabled
      if (this.config.reviewQueueEnabled) {
        this.addToReviewQueue(result);
      }

      // Auto-promote if configured and threshold met
      if (this.config.autoPromote && result.confidence >= this.config.autoPromoteThreshold) {
        this.approveIndustry(result.industry.id, 'Auto-approved based on high confidence');
      }
    }

    return {
      newDiscoveries,
      updatedIndustries,
      analyses: newAnalyses,
    };
  }

  /**
   * Add single signal and process.
   */
  addSignal(signal: DiscoverySignal): {
    isDiscovery: boolean;
    industry?: EmergingIndustry;
    analysis?: DiscoveryAnalysis;
  } {
    this.industryEngine.addSignal(signal);

    const industryName = signal.targetEntity.name;
    const industry = this.industryEngine.getIndustry(industryName);

    if (!industry || industry.confidence < this.config.candidateThreshold) {
      return { isDiscovery: false };
    }

    // Check if already analyzed
    const existingAnalysis = Array.from(this.analyses.values()).find(
      (a) => a.entityName === industryName && a.discoveryType === 'industry'
    );

    if (existingAnalysis) {
      return { isDiscovery: true, industry, analysis: existingAnalysis };
    }

    // Create new analysis
    const result = this.industryEngine.analyzeIndustrySignals(industryName, [signal]);

    if (!result?.isValid) {
      return { isDiscovery: false };
    }

    const analysis = this.createAnalysis(result);
    this.analyses.set(analysis.id, analysis);

    if (this.config.reviewQueueEnabled) {
      this.addToReviewQueue(result);
    }

    return { isDiscovery: true, industry, analysis };
  }

  /**
   * Get industry by name.
   */
  getIndustry(name: string): EmergingIndustry | null {
    return this.industryEngine.getIndustry(name);
  }

  /**
   * Get all discovered industries.
   */
  getAllIndustries(): EmergingIndustry[] {
    return this.industryEngine.getAllIndustries();
  }

  /**
   * Get industries awaiting review.
   */
  getPendingReview(): IndustryQueueEntry[] {
    return Array.from(this.reviewQueue.values())
      .filter((e) => e.status === 'pending' || e.status === 'under_review')
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get industries by opportunity score.
   */
  getTopOpportunities(count: number = 10): EmergingIndustry[] {
    return this.industryEngine.rankByOpportunity().slice(0, count);
  }

  /**
   * Get industries by risk level.
   */
  getByRiskLevel(level: 'low' | 'moderate' | 'high' | 'extreme'): EmergingIndustry[] {
    return this.industryEngine.getIndustriesByRiskLevel(level);
  }

  /**
   * Approve an industry for integration.
   */
  approveIndustry(industryId: string, notes?: string): boolean {
    const industry = this.getIndustryById(industryId);
    if (!industry) return false;

    // Update review status
    this.industryEngine.updateReviewStatus(industryId, 'approved', notes);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.industryId === industryId);
    if (entry) {
      entry.status = 'approved';
      entry.reviewNotes = notes;
    }

    return true;
  }

  /**
   * Reject an industry discovery.
   */
  rejectIndustry(industryId: string, reason: string): boolean {
    const industry = this.getIndustryById(industryId);
    if (!industry) return false;

    // Update review status
    this.industryEngine.updateReviewStatus(industryId, 'rejected', reason);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.industryId === industryId);
    if (entry) {
      entry.status = 'rejected';
      entry.reviewNotes = reason;
    }

    return true;
  }

  /**
   * Assign reviewer.
   */
  assignReviewer(industryId: string, reviewer: string): boolean {
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.industryId === industryId);
    if (!entry) return false;

    entry.reviewer = reviewer;
    entry.status = 'under_review';

    return true;
  }

  /**
   * Get discovery statistics.
   */
  getStatistics(): {
    totalDiscovered: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    averageConfidence: number;
  } {
    const industries = this.getAllIndustries();
    const queue = Array.from(this.reviewQueue.values());

    const approved = queue.filter((e) => e.status === 'approved').length;
    const rejected = queue.filter((e) => e.status === 'rejected').length;
    const pending = queue.filter(
      (e) => e.status === 'pending' || e.status === 'under_review'
    ).length;

    const avgConfidence =
      industries.length > 0
        ? industries.reduce((sum, i) => sum + i.confidence, 0) / industries.length
        : 0;

    return {
      totalDiscovered: industries.length,
      pendingReview: pending,
      approved,
      rejected,
      averageConfidence: Math.round(avgConfidence),
    };
  }

  /**
   * Find related industries.
   */
  findRelatedIndustries(industryName: string, threshold?: number): EmergingIndustry[] {
    return this.industryEngine.findRelatedIndustries(industryName, threshold);
  }

  /**
   * Get industry by ID.
   */
  private getIndustryById(industryId: string): EmergingIndustry | null {
    return this.getAllIndustries().find((i) => i.id === industryId) ?? null;
  }

  /**
   * Create analysis for detection result.
   */
  private createAnalysis(result: {
    industry: EmergingIndustry;
    confidence: number;
    signals: DiscoverySignal[];
  }): DiscoveryAnalysis {
    const confidenceFactors = this.confidenceEngine.calculateConfidenceFactors(result.signals);

    return createDiscoveryAnalysis({
      discoveryType: 'industry',
      entityName: result.industry.name,
      status:
        result.confidence >= this.config.validationThreshold
          ? 'validated'
          : result.confidence >= this.config.candidateThreshold
          ? 'candidate'
          : 'investigating',
      confidence: result.confidence,
      confidenceFactors,
      growthStrength: result.industry.growthSignal,
      evidenceStrength: Math.min(100, result.signals.length * 10),
      signalCount: result.signals.length,
      sourceCount: new Set(result.signals.map((s) => s.source)).size,
      explanation: [
        `${result.industry.growthSignal}/100 growth signal strength`,
        `${result.industry.investmentSignal}/100 investment signal strength`,
        `${result.industry.momentum}/100 momentum score`,
        `${result.industry.stage} maturity stage`,
      ],
      riskFlags: this.identifyRiskFlags(result),
      recommendations: this.generateRecommendations(result),
      signals: result.signals,
      relatedDiscoveries: result.industry.relatedTechnologies.map((tech) => `technology:${tech}`),
    });
  }

  /**
   * Add to review queue.
   */
  private addToReviewQueue(result: {
    industry: EmergingIndustry;
    confidence: number;
    signals: DiscoverySignal[];
  }): void {
    const entry: IndustryQueueEntry = {
      industryId: result.industry.id,
      industryName: result.industry.name,
      status: 'pending',
      confidence: result.confidence,
      signalCount: result.signals.length,
      submittedAt: new Date(),
    };

    this.reviewQueue.set(result.industry.id, entry);
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(result: {
    industry: EmergingIndustry;
    signals: DiscoverySignal[];
  }): string[] {
    const flags: string[] = [];

    if (result.signals.length < 5) {
      flags.push('limited-signal-count');
    }

    if (result.industry.stage === 'frontier') {
      flags.push('frontier-stage');
    }

    if (result.industry.confidence < 60) {
      flags.push('low-confidence');
    }

    if (result.industry.regulatoryEnvironment === 'restrictive') {
      flags.push('restrictive-regulations');
    }

    if (result.industry.keyPlayers.length < 2) {
      flags.push('limited-market-participants');
    }

    return flags;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(result: {
    industry: EmergingIndustry;
    signals: DiscoverySignal[];
  }): string[] {
    const recommendations: string[] = [];

    if (result.signals.length < 8) {
      recommendations.push('Gather additional signals to increase confidence');
    }

    if (result.industry.keyPlayers.length === 0) {
      recommendations.push('Identify key market players');
    }

    if (result.industry.relatedTechnologies.length === 0) {
      recommendations.push('Catalog enabling technologies');
    }

    if (result.industry.geography.leadingHubs.length === 0) {
      recommendations.push('Determine geographic centers');
    }

    if (result.industry.regulatoryEnvironment === 'uncertain') {
      recommendations.push('Monitor regulatory developments');
    }

    return recommendations;
  }
}

/**
 * Factory function for IndustryDiscoveryEngine.
 */
export function createIndustryDiscoveryEngine(
  config?: Partial<IndustryDiscoveryConfig>
): IndustryDiscoveryEngine {
  return new IndustryDiscoveryEngine(config);
}
