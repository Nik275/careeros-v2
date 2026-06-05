/**
 * CareerOS Market Intelligence - Career Discovery Engine
 *
 * Main engine for discovering new career opportunities.
 * Coordinates detection, validation, and tracking of emerging careers.
 *
 * Examples of discoveries:
 * - AI Agent Engineer
 * - Climate Risk Analyst
 * - Synthetic Media Producer
 * - Digital Twin Architect
 * - Autonomous Systems Supervisor
 * - Prompt Engineer
 *
 * Output: Validated emerging career candidates for review
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingCareer } from './models/EmergingCareer';
import { EmergingCareerEngine, createEmergingCareerEngine } from './EmergingCareerEngine';
import { DiscoveryConfidenceEngine, createDiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';
import { createDiscoveryAnalysis, type DiscoveryAnalysis } from './models/DiscoveryAnalysis';

/**
 * Career discovery configuration.
 */
export interface CareerDiscoveryConfig {
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
export const DEFAULT_CAREER_DISCOVERY_CONFIG: CareerDiscoveryConfig = {
  candidateThreshold: 50,
  validationThreshold: 70,
  autoPromote: false,
  autoPromoteThreshold: 85,
  reviewQueueEnabled: true,
};

/**
 * Discovery queue entry.
 */
export interface DiscoveryQueueEntry {
  /** Career ID */
  careerId: string;

  /** Career name */
  careerName: string;

  /** Queue status */
  status: 'pending' | 'under_review' | 'approved' | 'rejected';

  /** Confidence score */
  confidence: number;

  /** Signal count */
  signalCount: number;

  **Submitted at */
  submittedAt: Date;

  /** Reviewer assigned */
  reviewer?: string;

  /** Review notes */
  reviewNotes?: string;
}

/**
 * Main career discovery engine.
 */
export class CareerDiscoveryEngine {
  private config: CareerDiscoveryConfig;
  private careerEngine: EmergingCareerEngine;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // Review queue
  private reviewQueue: Map<string, DiscoveryQueueEntry> = new Map();

  // Discovery analyses
  private analyses: Map<string, DiscoveryAnalysis> = new Map();

  constructor(config?: Partial<CareerDiscoveryConfig>) {
    this.config = { ...DEFAULT_CAREER_DISCOVERY_CONFIG, ...config };
    this.careerEngine = createEmergingCareerEngine();
    this.confidenceEngine = createDiscoveryConfidenceEngine();
  }

  /**
   * Process incoming signals and discover careers.
   */
  discover(signals: DiscoverySignal[]): {
    newDiscoveries: EmergingCareer[];
    updatedCareers: EmergingCareer[];
    analyses: DiscoveryAnalysis[];
  } {
    const newDiscoveries: EmergingCareer[] = [];
    const updatedCareers: EmergingCareer[] = [];
    const newAnalyses: DiscoveryAnalysis[] = [];

    // Process through emerging career engine
    const results = this.careerEngine.processSignals(signals);

    for (const result of results) {
      if (!result.isValid) continue;

      // Check if this is new or updated
      const existing = this.careerEngine.getCareer(result.career.title);

      if (!existing || existing.id === result.career.id) {
        newDiscoveries.push(result.career);
      } else {
        updatedCareers.push(result.career);
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
        this.approveCareer(result.career.id, 'Auto-approved based on high confidence');
      }
    }

    return {
      newDiscoveries,
      updatedCareers,
      analyses: newAnalyses,
    };
  }

  /**
   * Add single signal and process.
   */
  addSignal(signal: DiscoverySignal): {
    isDiscovery: boolean;
    career?: EmergingCareer;
    analysis?: DiscoveryAnalysis;
  } {
    this.careerEngine.addSignal(signal);

    const careerName = signal.targetEntity.name;
    const career = this.careerEngine.getCareer(careerName);

    if (!career || career.confidence < this.config.candidateThreshold) {
      return { isDiscovery: false };
    }

    // Check if already analyzed
    const existingAnalysis = Array.from(this.analyses.values()).find(
      (a) => a.entityName === careerName && a.discoveryType === 'career'
    );

    if (existingAnalysis) {
      return { isDiscovery: true, career, analysis: existingAnalysis };
    }

    // Create new analysis
    const result = this.careerEngine.analyzeCareerSignals(careerName, [signal]);

    if (!result?.isValid) {
      return { isDiscovery: false };
    }

    const analysis = this.createAnalysis(result);
    this.analyses.set(analysis.id, analysis);

    if (this.config.reviewQueueEnabled) {
      this.addToReviewQueue(result);
    }

    return { isDiscovery: true, career, analysis };
  }

  /**
   * Get career by name.
   */
  getCareer(name: string): EmergingCareer | null {
    return this.careerEngine.getCareer(name);
  }

  /**
   * Get all discovered careers.
   */
  getAllCareers(): EmergingCareer[] {
    return this.careerEngine.getAllCareers();
  }

  /**
   * Get careers awaiting review.
   */
  getPendingReview(): DiscoveryQueueEntry[] {
    return Array.from(this.reviewQueue.values())
      .filter((e) => e.status === 'pending' || e.status === 'under_review')
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Approve a career for integration.
   */
  approveCareer(careerId: string, notes?: string): boolean {
    const career = this.getCareerById(careerId);
    if (!career) return false;

    // Update review status
    this.careerEngine.updateReviewStatus(careerId, 'approved', notes);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.careerId === careerId);
    if (entry) {
      entry.status = 'approved';
      entry.reviewNotes = notes;
    }

    return true;
  }

  /**
   * Reject a career discovery.
   */
  rejectCareer(careerId: string, reason: string): boolean {
    const career = this.getCareerById(careerId);
    if (!career) return false;

    // Update review status
    this.careerEngine.updateReviewStatus(careerId, 'rejected', reason);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.careerId === careerId);
    if (entry) {
      entry.status = 'rejected';
      entry.reviewNotes = reason;
    }

    return true;
  }

  /**
   * Assign reviewer.
   */
  assignReviewer(careerId: string, reviewer: string): boolean {
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.careerId === careerId);
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
    const careers = this.getAllCareers();
    const queue = Array.from(this.reviewQueue.values());

    const approved = queue.filter((e) => e.status === 'approved').length;
    const rejected = queue.filter((e) => e.status === 'rejected').length;
    const pending = queue.filter(
      (e) => e.status === 'pending' || e.status === 'under_review'
    ).length;

    const avgConfidence =
      careers.length > 0
        ? careers.reduce((sum, c) => sum + c.confidence, 0) / careers.length
        : 0;

    return {
      totalDiscovered: careers.length,
      pendingReview: pending,
      approved,
      rejected,
      averageConfidence: Math.round(avgConfidence),
    };
  }

  /**
   * Find similar careers to a known career.
   */
  findSimilarCareers(careerName: string, threshold?: number): EmergingCareer[] {
    return this.careerEngine.findSimilarCareers(careerName, threshold);
  }

  /**
   * Get career by ID.
   */
  private getCareerById(careerId: string): EmergingCareer | null {
    return this.getAllCareers().find((c) => c.id === careerId) ?? null;
  }

  /**
   * Create analysis for detection result.
   */
  private createAnalysis(result: {
    career: EmergingCareer;
    confidence: number;
    signals: DiscoverySignal[];
  }): DiscoveryAnalysis {
    const confidenceFactors = this.confidenceEngine.calculateConfidenceFactors(result.signals);

    return createDiscoveryAnalysis({
      discoveryType: 'career',
      entityName: result.career.title,
      status:
        result.confidence >= this.config.validationThreshold
          ? 'validated'
          : result.confidence >= this.config.candidateThreshold
          ? 'candidate'
          : 'investigating',
      confidence: result.confidence,
      confidenceFactors,
      growthStrength: result.career.growthSignal,
      evidenceStrength: Math.min(100, result.signals.length * 10),
      signalCount: result.signals.length,
      sourceCount: new Set(result.signals.map((s) => s.source)).size,
      explanation: [
        `${result.career.growthSignal}/100 growth signal strength`,
        `${result.career.demandSignal}/100 demand signal strength`,
        `${result.career.momentum}/100 momentum score`,
      ],
      riskFlags: this.identifyRiskFlags(result),
      recommendations: this.generateRecommendations(result),
      signals: result.signals,
      relatedDiscoveries: [],
    });
  }

  /**
   * Add to review queue.
   */
  private addToReviewQueue(result: {
    career: EmergingCareer;
    confidence: number;
    signals: DiscoverySignal[];
  }): void {
    const entry: DiscoveryQueueEntry = {
      careerId: result.career.id,
      careerName: result.career.title,
      status: 'pending',
      confidence: result.confidence,
      signalCount: result.signals.length,
      submittedAt: new Date(),
    };

    this.reviewQueue.set(result.career.id, entry);
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(result: {
    career: EmergingCareer;
    signals: DiscoverySignal[];
  }): string[] {
    const flags: string[] = [];

    if (result.signals.length < 5) {
      flags.push('limited-signal-count');
    }

    if (result.career.stage === 'unverified') {
      flags.push('unverified-stage');
    }

    if (result.career.confidence < 60) {
      flags.push('low-confidence');
    }

    const highQualitySources = result.signals.filter((s) => s.sourceQuality === 'high').length;
    if (highQualitySources < 2) {
      flags.push('limited-high-quality-sources');
    }

    return flags;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(result: {
    career: EmergingCareer;
    signals: DiscoverySignal[];
  }): string[] {
    const recommendations: string[] = [];

    if (result.signals.length < 8) {
      recommendations.push('Gather additional signals to increase confidence');
    }

    if (result.career.relatedSkills.length === 0) {
      recommendations.push('Identify required skills for this career');
    }

    if (result.career.geography.primaryRegions.length === 0) {
      recommendations.push('Determine geographic distribution');
    }

    if (result.career.evidenceSources.length < 3) {
      recommendations.push('Collect diverse evidence types');
    }

    return recommendations;
  }
}

/**
 * Factory function for CareerDiscoveryEngine.
 */
export function createCareerDiscoveryEngine(
  config?: Partial<CareerDiscoveryConfig>
): CareerDiscoveryEngine {
  return new CareerDiscoveryEngine(config);
}
