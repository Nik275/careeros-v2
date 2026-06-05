/**
 * CareerOS Market Intelligence - Emerging Skill Engine
 *
 * Identifies skills that are newly gaining relevance in the labor market.
 *
 * Examples:
 * - Agent Orchestration
 * - LLMOps
 * - AI Governance
 * - Synthetic Data Engineering
 * - Prompt Evaluation
 * - AI Safety Operations
 *
 * Output: EmergingSkill records with confidence scores
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingSkill, SkillAdoptionStage, SkillCategory } from './models/EmergingSkill';
import {
  createEmergingSkill,
  updateSkillStage,
  calculateRelevanceScore,
  predictSkillTrajectory,
} from './models/EmergingSkill';
import { DiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';

/**
 * Configuration for emerging skill detection.
 */
export interface EmergingSkillConfig {
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
export const DEFAULT_EMERGING_SKILL_CONFIG: EmergingSkillConfig = {
  minSignals: 3,
  minConfidence: 50,
  analysisPeriodDays: 90,
  growthThreshold: 60,
};

/**
 * Detection result.
 */
export interface SkillDetectionResult {
  /** Detected skill */
  skill: EmergingSkill;

  /** Confidence score */
  confidence: number;

  /** Supporting signals */
  signals: DiscoverySignal[];

  /** Is valid emerging skill */
  isValid: boolean;

  /** Rejection reason (if invalid) */
  rejectionReason?: string;
}

/**
 * Identifies emerging skills from discovery signals.
 */
export class EmergingSkillEngine {
  private config: EmergingSkillConfig;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // In-memory storage
  private skills: Map<string, EmergingSkill> = new Map();
  private signals: Map<string, DiscoverySignal[]> = new Map();

  constructor(config?: Partial<EmergingSkillConfig>) {
    this.config = { ...DEFAULT_EMERGING_SKILL_CONFIG, ...config };
    this.confidenceEngine = new DiscoveryConfidenceEngine();
  }

  /**
   * Process discovery signals to find emerging skills.
   */
  processSignals(signals: DiscoverySignal[]): SkillDetectionResult[] {
    const results: SkillDetectionResult[] = [];

    // Group signals by skill
    const grouped = this.groupSignalsBySkill(signals);

    for (const [skillName, skillSignals] of grouped) {
      const result = this.analyzeSkillSignals(skillName, skillSignals);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Analyze signals for a specific skill.
   */
  analyzeSkillSignals(
    skillName: string,
    signals: DiscoverySignal[]
  ): SkillDetectionResult | null {
    // Filter to relevant signals
    const relevantSignals = signals.filter(
      (s) =>
        s.targetEntity.type === 'skill' &&
        (s.signalType === 'skill_growth' ||
          s.signalType === 'new_job_title' ||
          s.signalType === 'education_adoption' ||
          s.signalType === 'technology_shift')
    );

    if (relevantSignals.length < this.config.minSignals) {
      return {
        skill: this.createPlaceholderSkill(skillName),
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
        skill: this.createPlaceholderSkill(skillName),
        confidence: confidence.overall,
        signals: relevantSignals,
        isValid: false,
        rejectionReason: `Confidence too low (${confidence.overall} < ${this.config.minConfidence})`,
      };
    }

    // Create or update skill record
    const skill = this.createOrUpdateSkill(skillName, relevantSignals, confidence);

    return {
      skill,
      confidence: confidence.overall,
      signals: relevantSignals,
      isValid: true,
    };
  }

  /**
   * Add new discovery signal.
   */
  addSignal(signal: DiscoverySignal): void {
    if (signal.targetEntity.type !== 'skill') return;

    const key = signal.targetEntity.name.toLowerCase();

    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }

    const existing = this.signals.get(key)!;
    existing.push(signal);

    // Update skill if exists
    this.updateSkillFromSignals(key);
  }

  /**
   * Get emerging skill by name.
   */
  getSkill(name: string): EmergingSkill | null {
    return this.skills.get(name.toLowerCase()) ?? null;
  }

  /**
   * Get all emerging skills.
   */
  getAllSkills(): EmergingSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skills by stage.
   */
  getSkillsByStage(stage: SkillAdoptionStage): EmergingSkill[] {
    return this.getAllSkills().filter((s) => s.stage === stage);
  }

  /**
   * Get skills by category.
   */
  getSkillsByCategory(category: SkillCategory): EmergingSkill[] {
    return this.getAllSkills().filter((s) => s.category === category);
  }

  /**
   * Get high-confidence emerging skills.
   */
  getHighConfidenceSkills(threshold: number = 70): EmergingSkill[] {
    return this.getAllSkills()
      .filter((s) => s.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rank skills by relevance.
   */
  rankByRelevance(): EmergingSkill[] {
    return this.getAllSkills().sort((a, b) => {
      const scoreA = calculateRelevanceScore(a);
      const scoreB = calculateRelevanceScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Find skills by trajectory.
   */
  getSkillsByTrajectory(
    direction: 'accelerating' | 'stable' | 'decelerating'
  ): EmergingSkill[] {
    return this.getAllSkills().filter((skill) => {
      const recentSignals = skill.signals.slice(-10);
      const trajectory = predictSkillTrajectory(skill, recentSignals);
      return trajectory.direction === direction;
    });
  }

  /**
   * Find related skills.
   */
  findRelatedSkills(skillName: string, threshold: number = 50): EmergingSkill[] {
    const skill = this.getSkill(skillName);
    if (!skill) return [];

    return this.getAllSkills().filter((s) => {
      if (s.id === skill.id) return false;

      // Check direct relationship
      if (skill.relatedSkills.includes(s.name)) return true;

      // Check industry overlap
      const industryOverlap = s.adoptingIndustries.filter((i) =>
        skill.adoptingIndustries.includes(i)
      ).length;

      const industryScore =
        skill.adoptingIndustries.length > 0
          ? (industryOverlap / skill.adoptingIndustries.length) * 100
          : 0;

      return industryScore >= threshold;
    });
  }

  /**
   * Update skill review status.
   */
  updateReviewStatus(
    skillId: string,
    status: EmergingSkill['reviewStatus'],
    notes?: string
  ): boolean {
    const skill = Array.from(this.skills.values()).find((s) => s.id === skillId);
    if (!skill) return false;

    skill.reviewStatus = status;
    if (notes) skill.reviewNotes = notes;
    skill.updatedAt = new Date();

    return true;
  }

  /**
   * Group signals by skill name.
   */
  private groupSignalsBySkill(
    signals: DiscoverySignal[]
  ): Map<string, DiscoverySignal[]> {
    const grouped = new Map<string, DiscoverySignal[]>();

    for (const signal of signals) {
      if (signal.targetEntity.type !== 'skill') continue;

      const name = signal.targetEntity.name.toLowerCase();

      if (!grouped.has(name)) {
        grouped.set(name, []);
      }

      grouped.get(name)!.push(signal);
    }

    return grouped;
  }

  /**
   * Create placeholder skill for invalid detection.
   */
  private createPlaceholderSkill(name: string): EmergingSkill {
    return createEmergingSkill({
      name,
      alternativeNames: [],
      category: 'technical',
      stage: 'experimental',
      confidence: 0,
      growthSignal: 0,
      adoptionSignal: 0,
      momentum: 0,
      evidenceSources: [],
      signals: [],
      relatedSkills: [],
      prerequisites: [],
      tools: [],
      adoptingIndustries: [],
      geography: { leadingRegions: [], emergingRegions: [] },
      learningCurve: 'unknown',
    });
  }

  /**
   * Create or update skill record.
   */
  private createOrUpdateSkill(
    name: string,
    signals: DiscoverySignal[],
    confidence: { overall: number }
  ): EmergingSkill {
    const existing = this.skills.get(name.toLowerCase());

    if (existing) {
      // Update existing
      existing.signals = [...existing.signals, ...signals];
      existing.confidence = confidence.overall;
      existing.growthSignal = this.calculateGrowthSignal(signals);
      existing.adoptionSignal = this.calculateAdoptionSignal(signals);
      existing.momentum = this.calculateMomentum(signals);

      // Update stage based on metrics
      const jobMentions = signals.filter((s) => s.signalType === 'new_job_title').length * 10;
      const courseAvailability = signals.filter((s) => s.signalType === 'education_adoption').length * 15;
      const toolMaturity = signals.filter((s) => s.signalType === 'technology_shift').length * 10;

      existing.stage = updateSkillStage(existing, jobMentions, courseAvailability, toolMaturity);
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
    const skill = createEmergingSkill({
      name,
      alternativeNames: this.extractAlternativeNames(signals),
      category: this.categorizeSkill(name, signals),
      stage: 'early_adoption',
      confidence: confidence.overall,
      growthSignal: this.calculateGrowthSignal(signals),
      adoptionSignal: this.calculateAdoptionSignal(signals),
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
      prerequisites: this.extractPrerequisites(signals),
      tools: this.extractTools(signals),
      adoptingIndustries: this.extractIndustries(signals),
      geography: this.extractGeography(signals),
      learningCurve: this.assessLearningCurve(signals),
    });

    this.skills.set(name.toLowerCase(), skill);
    return skill;
  }

  /**
   * Update skill from stored signals.
   */
  private updateSkillFromSignals(key: string): void {
    const signals = this.signals.get(key);
    if (!signals || signals.length < this.config.minSignals) return;

    const confidence = this.confidenceEngine.calculateConfidence(signals);
    if (confidence.overall < this.config.minConfidence) return;

    this.createOrUpdateSkill(key, signals, confidence);
  }

  /**
   * Calculate growth signal strength.
   */
  private calculateGrowthSignal(signals: DiscoverySignal[]): number {
    const growthSignals = signals.filter((s) => s.signalType === 'skill_growth');

    if (growthSignals.length === 0) return 50;

    const avgStrength =
      growthSignals.reduce((sum, s) => sum + s.strength, 0) / growthSignals.length;

    return Math.round(avgStrength);
  }

  /**
   * Calculate adoption signal strength.
   */
  private calculateAdoptionSignal(signals: DiscoverySignal[]): number {
    const adoptionSignals = signals.filter(
      (s) => s.signalType === 'education_adoption' || s.signalType === 'new_job_title'
    );

    if (adoptionSignals.length === 0) return 50;

    const avgStrength =
      adoptionSignals.reduce((sum, s) => sum + s.strength, 0) / adoptionSignals.length;

    return Math.round(avgStrength);
  }

  /**
   * Calculate momentum.
   */
  private calculateMomentum(signals: DiscoverySignal[]): number {
    if (signals.length < 2) return 50;

    const sorted = [...signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const recent = sorted.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.strength, 0) / recent.length;

    return Math.round(avgRecent);
  }

  /**
   * Map signal type to evidence type.
   */
  private mapSignalToEvidenceType(signalType: string): EmergingSkill['evidenceSources'][0]['type'] {
    const mapping: Record<string, EmergingSkill['evidenceSources'][0]['type']> = {
      skill_growth: 'job_description',
      new_job_title: 'job_description',
      education_adoption: 'course_catalog',
      technology_shift: 'tool_platform',
    };

    return mapping[signalType] ?? 'social_mention';
  }

  /**
   * Extract alternative names from signals.
   */
  private extractAlternativeNames(signals: DiscoverySignal[]): string[] {
    const names = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.description) {
        const akaMatch = signal.context.description.match(/aka "([^"]+)"/i);
        if (akaMatch) {
          names.add(akaMatch[1]!);
        }
      }
    }

    return Array.from(names);
  }

  /**
   * Categorize skill based on name and context.
   */
  private categorizeSkill(name: string, signals: DiscoverySignal[]): SkillCategory {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('ai') || nameLower.includes('ml') || nameLower.includes('learning')) {
      return 'ai_ml';
    }

    if (nameLower.includes('data')) {
      return 'data';
    }

    if (nameLower.includes('security') || nameLower.includes('privacy')) {
      return 'security';
    }

    if (nameLower.includes('sustainability') || nameLower.includes('climate')) {
      return 'sustainability';
    }

    if (nameLower.includes('automation') || nameLower.includes('orchestration')) {
      return 'automation';
    }

    // Check signal context
    for (const signal of signals) {
      for (const industry of signal.context?.industryScope ?? []) {
        if (industry.toLowerCase().includes('technology')) {
          return 'emerging_tech';
        }
      }
    }

    return 'technical';
  }

  /**
   * Extract related skills.
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
   * Extract prerequisites.
   */
  private extractPrerequisites(signals: DiscoverySignal[]): string[] {
    const prerequisites: string[] = [];

    for (const signal of signals) {
      if (signal.context?.description) {
        const prereqMatch = signal.context.description.match(/requires? ([^,]+)/i);
        if (prereqMatch) {
          prerequisites.push(prereqMatch[1]!.trim());
        }
      }
    }

    return prerequisites;
  }

  /**
   * Extract tools/platforms.
   */
  private extractTools(signals: DiscoverySignal[]): string[] {
    const tools = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        // Heuristic: capitalized words might be tools
        if (/^[A-Z][a-z]+$/.test(related)) {
          tools.add(related);
        }
      }
    }

    return Array.from(tools);
  }

  /**
   * Extract adopting industries.
   */
  private extractIndustries(signals: DiscoverySignal[]): string[] {
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
  private extractGeography(signals: DiscoverySignal[]): EmergingSkill['geography'] {
    const regions = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.geographicScope) {
        regions.add(signal.context.geographicScope);
      }
    }

    const regionList = Array.from(regions);

    return {
      leadingRegions: regionList.slice(0, 2),
      emergingRegions: regionList.slice(2),
    };
  }

  /**
   * Assess learning curve.
   */
  private assessLearningCurve(signals: DiscoverySignal[]): EmergingSkill['learningCurve'] {
    // Look for indicators in signal context
    for (const signal of signals) {
      if (signal.context?.description) {
        const desc = signal.context.description.toLowerCase();
        if (desc.includes('steep learning curve') || desc.includes('advanced')) {
          return 'steep';
        }
        if (desc.includes('easy') || desc.includes('beginner')) {
          return 'gentle';
        }
      }
    }

    return 'moderate';
  }
}

/**
 * Factory function for EmergingSkillEngine.
 */
export function createEmergingSkillEngine(
  config?: Partial<EmergingSkillConfig>
): EmergingSkillEngine {
  return new EmergingSkillEngine(config);
}
