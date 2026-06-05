/**
 * CareerOS Market Intelligence - Skill Discovery Engine
 *
 * Main engine for discovering new skills.
 * Coordinates detection, validation, and tracking of emerging skills.
 *
 * Examples of discoveries:
 * - Agent Orchestration
 * - LLMOps
 * - AI Governance
 * - Synthetic Data Engineering
 * - Prompt Evaluation
 * - AI Safety Operations
 * - Multi-Modal AI Development
 *
 * Output: Validated emerging skill candidates for review
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingSkill } from './models/EmergingSkill';
import { EmergingSkillEngine, createEmergingSkillEngine } from './EmergingSkillEngine';
import { DiscoveryConfidenceEngine, createDiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';
import { createDiscoveryAnalysis, type DiscoveryAnalysis } from './models/DiscoveryAnalysis';

/**
 * Skill discovery configuration.
 */
export interface SkillDiscoveryConfig {
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
export const DEFAULT_SKILL_DISCOVERY_CONFIG: SkillDiscoveryConfig = {
  candidateThreshold: 50,
  validationThreshold: 70,
  autoPromote: false,
  autoPromoteThreshold: 85,
  reviewQueueEnabled: true,
};

/**
 * Discovery queue entry.
 */
export interface SkillQueueEntry {
  /** Skill ID */
  skillId: string;

  /** Skill name */
  skillName: string;

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
 * Main skill discovery engine.
 */
export class SkillDiscoveryEngine {
  private config: SkillDiscoveryConfig;
  private skillEngine: EmergingSkillEngine;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // Review queue
  private reviewQueue: Map<string, SkillQueueEntry> = new Map();

  // Discovery analyses
  private analyses: Map<string, DiscoveryAnalysis> = new Map();

  constructor(config?: Partial<SkillDiscoveryConfig>) {
    this.config = { ...DEFAULT_SKILL_DISCOVERY_CONFIG, ...config };
    this.skillEngine = createEmergingSkillEngine();
    this.confidenceEngine = createDiscoveryConfidenceEngine();
  }

  /**
   * Process incoming signals and discover skills.
   */
  discover(signals: DiscoverySignal[]): {
    newDiscoveries: EmergingSkill[];
    updatedSkills: EmergingSkill[];
    analyses: DiscoveryAnalysis[];
  } {
    const newDiscoveries: EmergingSkill[] = [];
    const updatedSkills: EmergingSkill[] = [];
    const newAnalyses: DiscoveryAnalysis[] = [];

    // Process through emerging skill engine
    const results = this.skillEngine.processSignals(signals);

    for (const result of results) {
      if (!result.isValid) continue;

      // Check if this is new or updated
      const existing = this.skillEngine.getSkill(result.skill.name);

      if (!existing || existing.id === result.skill.id) {
        newDiscoveries.push(result.skill);
      } else {
        updatedSkills.push(result.skill);
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
        this.approveSkill(result.skill.id, 'Auto-approved based on high confidence');
      }
    }

    return {
      newDiscoveries,
      updatedSkills,
      analyses: newAnalyses,
    };
  }

  /**
   * Add single signal and process.
   */
  addSignal(signal: DiscoverySignal): {
    isDiscovery: boolean;
    skill?: EmergingSkill;
    analysis?: DiscoveryAnalysis;
  } {
    this.skillEngine.addSignal(signal);

    const skillName = signal.targetEntity.name;
    const skill = this.skillEngine.getSkill(skillName);

    if (!skill || skill.confidence < this.config.candidateThreshold) {
      return { isDiscovery: false };
    }

    // Check if already analyzed
    const existingAnalysis = Array.from(this.analyses.values()).find(
      (a) => a.entityName === skillName && a.discoveryType === 'skill'
    );

    if (existingAnalysis) {
      return { isDiscovery: true, skill, analysis: existingAnalysis };
    }

    // Create new analysis
    const result = this.skillEngine.analyzeSkillSignals(skillName, [signal]);

    if (!result?.isValid) {
      return { isDiscovery: false };
    }

    const analysis = this.createAnalysis(result);
    this.analyses.set(analysis.id, analysis);

    if (this.config.reviewQueueEnabled) {
      this.addToReviewQueue(result);
    }

    return { isDiscovery: true, skill, analysis };
  }

  /**
   * Get skill by name.
   */
  getSkill(name: string): EmergingSkill | null {
    return this.skillEngine.getSkill(name);
  }

  /**
   * Get all discovered skills.
   */
  getAllSkills(): EmergingSkill[] {
    return this.skillEngine.getAllSkills();
  }

  /**
   * Get skills awaiting review.
   */
  getPendingReview(): SkillQueueEntry[] {
    return Array.from(this.reviewQueue.values())
      .filter((e) => e.status === 'pending' || e.status === 'under_review')
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get skills by trajectory.
   */
  getAcceleratingSkills(): EmergingSkill[] {
    return this.skillEngine.getSkillsByTrajectory('accelerating');
  }

  /**
   * Get skills by category.
   */
  getSkillsByCategory(category: string): EmergingSkill[] {
    return this.skillEngine.getSkillsByCategory(category as any);
  }

  /**
   * Approve a skill for integration.
   */
  approveSkill(skillId: string, notes?: string): boolean {
    const skill = this.getSkillById(skillId);
    if (!skill) return false;

    // Update review status
    this.skillEngine.updateReviewStatus(skillId, 'approved', notes);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.skillId === skillId);
    if (entry) {
      entry.status = 'approved';
      entry.reviewNotes = notes;
    }

    return true;
  }

  /**
   * Reject a skill discovery.
   */
  rejectSkill(skillId: string, reason: string): boolean {
    const skill = this.getSkillById(skillId);
    if (!skill) return false;

    // Update review status
    this.skillEngine.updateReviewStatus(skillId, 'rejected', reason);

    // Update queue entry
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.skillId === skillId);
    if (entry) {
      entry.status = 'rejected';
      entry.reviewNotes = reason;
    }

    return true;
  }

  /**
   * Assign reviewer.
   */
  assignReviewer(skillId: string, reviewer: string): boolean {
    const entry = Array.from(this.reviewQueue.values()).find((e) => e.skillId === skillId);
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
    const skills = this.getAllSkills();
    const queue = Array.from(this.reviewQueue.values());

    const approved = queue.filter((e) => e.status === 'approved').length;
    const rejected = queue.filter((e) => e.status === 'rejected').length;
    const pending = queue.filter(
      (e) => e.status === 'pending' || e.status === 'under_review'
    ).length;

    const avgConfidence =
      skills.length > 0
        ? skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length
        : 0;

    return {
      totalDiscovered: skills.length,
      pendingReview: pending,
      approved,
      rejected,
      averageConfidence: Math.round(avgConfidence),
    };
  }

  /**
   * Find related skills.
   */
  findRelatedSkills(skillName: string, threshold?: number): EmergingSkill[] {
    return this.skillEngine.findRelatedSkills(skillName, threshold);
  }

  /**
   * Rank skills by relevance.
   */
  rankByRelevance(): EmergingSkill[] {
    return this.skillEngine.rankByRelevance();
  }

  /**
   * Get skill by ID.
   */
  private getSkillById(skillId: string): EmergingSkill | null {
    return this.getAllSkills().find((s) => s.id === skillId) ?? null;
  }

  /**
   * Create analysis for detection result.
   */
  private createAnalysis(result: {
    skill: EmergingSkill;
    confidence: number;
    signals: DiscoverySignal[];
  }): DiscoveryAnalysis {
    const confidenceFactors = this.confidenceEngine.calculateConfidenceFactors(result.signals);

    return createDiscoveryAnalysis({
      discoveryType: 'skill',
      entityName: result.skill.name,
      status:
        result.confidence >= this.config.validationThreshold
          ? 'validated'
          : result.confidence >= this.config.candidateThreshold
          ? 'candidate'
          : 'investigating',
      confidence: result.confidence,
      confidenceFactors,
      growthStrength: result.skill.growthSignal,
      evidenceStrength: Math.min(100, result.signals.length * 10),
      signalCount: result.signals.length,
      sourceCount: new Set(result.signals.map((s) => s.source)).size,
      explanation: [
        `${result.skill.growthSignal}/100 growth signal strength`,
        `${result.skill.adoptionSignal}/100 adoption signal strength`,
        `${result.skill.momentum}/100 momentum score`,
        `${result.skill.stage.replace('_', ' ')} adoption stage`,
      ],
      riskFlags: this.identifyRiskFlags(result),
      recommendations: this.generateRecommendations(result),
      signals: result.signals,
      relatedDiscoveries: result.skill.relatedSkills.map((name) => `skill:${name}`),
    });
  }

  /**
   * Add to review queue.
   */
  private addToReviewQueue(result: {
    skill: EmergingSkill;
    confidence: number;
    signals: DiscoverySignal[];
  }): void {
    const entry: SkillQueueEntry = {
      skillId: result.skill.id,
      skillName: result.skill.name,
      status: 'pending',
      confidence: result.confidence,
      signalCount: result.signals.length,
      submittedAt: new Date(),
    };

    this.reviewQueue.set(result.skill.id, entry);
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(result: {
    skill: EmergingSkill;
    signals: DiscoverySignal[];
  }): string[] {
    const flags: string[] = [];

    if (result.signals.length < 5) {
      flags.push('limited-signal-count');
    }

    if (result.skill.stage === 'experimental') {
      flags.push('experimental-stage');
    }

    if (result.skill.confidence < 60) {
      flags.push('low-confidence');
    }

    if (result.skill.adoptingIndustries.length < 2) {
      flags.push('limited-industry-adoption');
    }

    return flags;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(result: {
    skill: EmergingSkill;
    signals: DiscoverySignal[];
  }): string[] {
    const recommendations: string[] = [];

    if (result.signals.length < 8) {
      recommendations.push('Gather additional signals to increase confidence');
    }

    if (result.skill.prerequisites.length === 0) {
      recommendations.push('Identify prerequisite skills');
    }

    if (result.skill.tools.length === 0) {
      recommendations.push('Catalog associated tools and platforms');
    }

    if (result.skill.learningCurve === 'unknown') {
      recommendations.push('Assess learning curve difficulty');
    }

    return recommendations;
  }
}

/**
 * Factory function for SkillDiscoveryEngine.
 */
export function createSkillDiscoveryEngine(
  config?: Partial<SkillDiscoveryConfig>
): SkillDiscoveryEngine {
  return new SkillDiscoveryEngine(config);
}
