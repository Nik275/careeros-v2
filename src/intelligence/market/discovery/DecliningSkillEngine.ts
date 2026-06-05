/**
 * CareerOS Market Intelligence - Declining Skill Engine
 *
 * Identifies skills losing relevance in the labor market.
 *
 * Examples:
 * - Legacy programming languages (COBOL in new contexts)
 * - Manual data entry
 * - Traditional typesetting
 * - Fax machine operation
 * - Manual bookkeeping (superseded by software)
 *
 * Output: Declining skill records with obsolescence assessments
 */

import type { DiscoverySignal } from './models/DiscoverySignal';

/**
 * Obsolescence stage.
 */
export type ObsolescenceStage =
  | 'reducing_demand'    // Early signs of reduced demand
  | 'declining'          // Clear downward trend
  | 'legacy'             // Maintained but not growing
  | 'obsolete';          // No longer relevant

/**
 * Obsolescence driver.
 */
export type ObsolescenceDriver =
  | 'technology_replacement'
  | 'automation'
  | 'platform_consolidation'
  | 'standardization'
  | 'skill_merger'
  | 'regulatory_obsolescence';

/**
 * Declining skill record.
 */
export interface DecliningSkill {
  /** Unique identifier */
  id: string;

  /** Skill name */
  name: string;

  /** Alternative names */
  alternativeNames: string[];

  /** Current obsolescence stage */
  stage: ObsolescenceStage;

  /** Overall confidence (0-100) */
  confidence: number;

  /** Obsolescence severity (0-100) */
  obsolescenceSeverity: number;

  /** Rate of decline (0-100) */
  declineRate: number;

  /** Primary drivers */
  drivers: ObsolescenceDriver[];

  /** Replacing skills/technologies */
  replacingSkills: string[];

  /** Evidence sources */
  evidenceSources: Array<{
    type: string;
    source: string;
    date: Date;
    strength: number;
  }>;

  /** Discovery signals */
  signals: DiscoverySignal[];

  /** When first identified */
  identifiedAt: Date;

  /** Last updated */
  updatedAt: Date;

  /** Review status */
  reviewStatus: 'pending' | 'confirmed' | 'disputed';

  /** Estimated time to obsolescence (years) */
  timeToObsolescence?: number;

  /** Migration difficulty (0-100) */
  migrationDifficulty: number;
}

/**
 * Configuration for declining skill detection.
 */
export interface DecliningSkillConfig {
  /** Minimum signals required */
  minSignals: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Decline threshold */
  declineThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DECLINING_SKILL_CONFIG: DecliningSkillConfig = {
  minSignals: 3,
  minConfidence: 60,
  declineThreshold: 55,
};

/**
 * Detection result.
 */
export interface SkillDeclineResult {
  /** Detected declining skill */
  skill: DecliningSkill;

  /** Confidence score */
  confidence: number;

  /** Is valid declining skill */
  isValid: boolean;
}

/**
 * Identifies declining skills from discovery signals.
 */
export class DecliningSkillEngine {
  private config: DecliningSkillConfig;

  // In-memory storage
  private skills: Map<string, DecliningSkill> = new Map();
  private signals: Map<string, DiscoverySignal[]> = new Map();

  constructor(config?: Partial<DecliningSkillConfig>) {
    this.config = { ...DEFAULT_DECLINING_SKILL_CONFIG, ...config };
  }

  /**
   * Process signals to find declining skills.
   */
  processSignals(signals: DiscoverySignal[]): SkillDeclineResult[] {
    const results: SkillDeclineResult[] = [];

    // Group by skill
    const grouped = this.groupSignalsBySkill(signals);

    for (const [skillName, skillSignals] of grouped) {
      const result = this.analyzeSkillDecline(skillName, skillSignals);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Analyze decline for specific skill.
   */
  analyzeSkillDecline(
    skillName: string,
    signals: DiscoverySignal[]
  ): SkillDeclineResult | null {
    // Filter to relevant decline signals
    const declineSignals = signals.filter(
      (s) =>
        s.targetEntity.type === 'skill' &&
        (s.signalType === 'technology_shift' ||
          s.signalType === 'automation_trigger') &&
        s.strength < 50
    );

    if (declineSignals.length < this.config.minSignals) {
      return null;
    }

    // Calculate obsolescence metrics
    const severity = this.calculateObsolescenceSeverity(declineSignals);

    if (severity < this.config.declineThreshold) {
      return null;
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(declineSignals);

    if (confidence < this.config.minConfidence) {
      return null;
    }

    const skill = this.createOrUpdateSkill(skillName, declineSignals, confidence, severity);

    return {
      skill,
      confidence,
      isValid: true,
    };
  }

  /**
   * Add new signal.
   */
  addSignal(signal: DiscoverySignal): void {
    if (signal.targetEntity.type !== 'skill') return;

    const key = signal.targetEntity.name.toLowerCase();

    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }

    this.signals.get(key)!.push(signal);
    this.updateSkillFromSignals(key);
  }

  /**
   * Get declining skill.
   */
  getSkill(name: string): DecliningSkill | null {
    return this.skills.get(name.toLowerCase()) ?? null;
  }

  /**
   * Get all declining skills.
   */
  getAllSkills(): DecliningSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skills by stage.
   */
  getSkillsByStage(stage: ObsolescenceStage): DecliningSkill[] {
    return this.getAllSkills().filter((s) => s.stage === stage);
  }

  /**
   * Get high-priority declining skills.
   */
  getHighPriority(threshold: number = 70): DecliningSkill[] {
    return this.getAllSkills()
      .filter((s) => s.obsolescenceSeverity >= threshold)
      .sort((a, b) => b.obsolescenceSeverity - a.obsolescenceSeverity);
  }

  /**
   * Get replacement recommendations.
   */
  getReplacements(skillName: string): string[] {
    const skill = this.getSkill(skillName);
    return skill?.replacingSkills ?? [];
  }

  /**
   * Group signals by skill.
   */
  private groupSignalsBySkill(signals: DiscoverySignal[]): Map<string, DiscoverySignal[]> {
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
   * Create or update skill.
   */
  private createOrUpdateSkill(
    name: string,
    signals: DiscoverySignal[],
    confidence: number,
    severity: number
  ): DecliningSkill {
    const existing = this.skills.get(name.toLowerCase());

    if (existing) {
      existing.signals = [...existing.signals, ...signals];
      existing.confidence = confidence;
      existing.obsolescenceSeverity = severity;
      existing.declineRate = this.calculateDeclineRate(signals);
      existing.stage = this.updateStage(severity);
      existing.updatedAt = new Date();
      existing.drivers = this.extractDrivers(signals);
      existing.replacingSkills = this.extractReplacements(signals);
      return existing;
    }

    const skill: DecliningSkill = {
      id: `declining-skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      alternativeNames: [],
      stage: this.updateStage(severity),
      confidence,
      obsolescenceSeverity: severity,
      declineRate: this.calculateDeclineRate(signals),
      drivers: this.extractDrivers(signals),
      replacingSkills: this.extractReplacements(signals),
      evidenceSources: signals.map((s) => ({
        type: 'skill_decline',
        source: s.source,
        date: s.timestamp,
        strength: s.strength,
      })),
      signals,
      identifiedAt: new Date(),
      updatedAt: new Date(),
      reviewStatus: 'pending',
      migrationDifficulty: this.assessMigrationDifficulty(signals),
    };

    this.skills.set(name.toLowerCase(), skill);
    return skill;
  }

  /**
   * Update skill from signals.
   */
  private updateSkillFromSignals(key: string): void {
    const signals = this.signals.get(key);
    if (!signals || signals.length < this.config.minSignals) return;

    const declineSignals = signals.filter((s) => s.strength < 50);
    if (declineSignals.length < this.config.minSignals) return;

    const severity = this.calculateObsolescenceSeverity(declineSignals);
    if (severity < this.config.declineThreshold) return;

    const confidence = this.calculateConfidence(declineSignals);
    if (confidence < this.config.minConfidence) return;

    this.createOrUpdateSkill(key, declineSignals, confidence, severity);
  }

  /**
   * Calculate obsolescence severity.
   */
  private calculateObsolescenceSeverity(signals: DiscoverySignal[]): number {
    const invertedStrengths = signals.map((s) => 100 - s.strength);
    const avg = invertedStrengths.reduce((sum, s) => sum + s, 0) / invertedStrengths.length;
    return Math.round(avg);
  }

  /**
   * Calculate confidence.
   */
  private calculateConfidence(signals: DiscoverySignal[]): number {
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const sourceBonus = Math.min(20, new Set(signals.map((s) => s.source)).size * 5);
    return Math.min(100, Math.round(avgConfidence + sourceBonus));
  }

  /**
   * Calculate decline rate.
   */
  private calculateDeclineRate(signals: DiscoverySignal[]): number {
    if (signals.length < 2) return 0;

    const sorted = [...signals].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const first = sorted[0].strength;
    const last = sorted[sorted.length - 1].strength;

    return Math.round((first - last) / signals.length);
  }

  /**
   * Update stage based on severity.
   */
  private updateStage(severity: number): ObsolescenceStage {
    if (severity >= 90) return 'obsolete';
    if (severity >= 75) return 'legacy';
    if (severity >= 60) return 'declining';
    return 'reducing_demand';
  }

  /**
   * Extract drivers.
   */
  private extractDrivers(signals: DiscoverySignal[]): ObsolescenceDriver[] {
    const driverMap: Record<string, ObsolescenceDriver> = {
      technology_shift: 'technology_replacement',
      automation_trigger: 'automation',
      market_convergence: 'skill_merger',
    };

    const drivers = new Set<ObsolescenceDriver>();
    for (const signal of signals) {
      const driver = driverMap[signal.signalType];
      if (driver) drivers.add(driver);
    }

    return Array.from(drivers);
  }

  /**
   * Extract replacement skills.
   */
  private extractReplacements(signals: DiscoverySignal[]): string[] {
    const replacements = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        replacements.add(related);
      }
    }

    return Array.from(replacements).slice(0, 5);
  }

  /**
   * Assess migration difficulty.
   */
  private assessMigrationDifficulty(signals: DiscoverySignal[]): number {
    for (const signal of signals) {
      if (signal.context?.description?.toLowerCase().includes('steep learning curve')) {
        return 80;
      }
    }
    return 50;
  }
}

/**
 * Factory function.
 */
export function createDecliningSkillEngine(
  config?: Partial<DecliningSkillConfig>
): DecliningSkillEngine {
  return new DecliningSkillEngine(config);
}
