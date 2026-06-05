/**
 * CareerOS Market Intelligence - Emerging Industry Engine
 *
 * Identifies emerging industry sectors.
 *
 * Examples:
 * - Agent Economy
 * - Climate Tech
 * - Defense Tech
 * - Synthetic Biology
 * - Space Infrastructure
 * - Industrial AI
 *
 * Output: EmergingIndustry records with confidence scores
 */

import type { DiscoverySignal } from './models/DiscoverySignal';
import type { EmergingIndustry, IndustryMaturityStage, IndustryCategory } from './models/EmergingIndustry';
import {
  createEmergingIndustry,
  updateIndustryStage,
  calculateOpportunityScore,
  assessIndustryRisk,
} from './models/EmergingIndustry';
import { DiscoveryConfidenceEngine } from './DiscoveryConfidenceEngine';

/**
 * Configuration for emerging industry detection.
 */
export interface EmergingIndustryConfig {
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
export const DEFAULT_EMERGING_INDUSTRY_CONFIG: EmergingIndustryConfig = {
  minSignals: 3,
  minConfidence: 55,
  analysisPeriodDays: 90,
  growthThreshold: 60,
};

/**
 * Detection result.
 */
export interface IndustryDetectionResult {
  /** Detected industry */
  industry: EmergingIndustry;

  /** Confidence score */
  confidence: number;

  /** Supporting signals */
  signals: DiscoverySignal[];

  /** Is valid emerging industry */
  isValid: boolean;

  /** Rejection reason (if invalid) */
  rejectionReason?: string;
}

/**
 * Identifies emerging industries from discovery signals.
 */
export class EmergingIndustryEngine {
  private config: EmergingIndustryConfig;
  private confidenceEngine: DiscoveryConfidenceEngine;

  // In-memory storage
  private industries: Map<string, EmergingIndustry> = new Map();
  private signals: Map<string, DiscoverySignal[]> = new Map();

  constructor(config?: Partial<EmergingIndustryConfig>) {
    this.config = { ...DEFAULT_EMERGING_INDUSTRY_CONFIG, ...config };
    this.confidenceEngine = new DiscoveryConfidenceEngine();
  }

  /**
   * Process discovery signals to find emerging industries.
   */
  processSignals(signals: DiscoverySignal[]): IndustryDetectionResult[] {
    const results: IndustryDetectionResult[] = [];

    // Group signals by industry
    const grouped = this.groupSignalsByIndustry(signals);

    for (const [industryName, industrySignals] of grouped) {
      const result = this.analyzeIndustrySignals(industryName, industrySignals);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Analyze signals for a specific industry.
   */
  analyzeIndustrySignals(
    industryName: string,
    signals: DiscoverySignal[]
  ): IndustryDetectionResult | null {
    // Filter to relevant signals
    const relevantSignals = signals.filter(
      (s) =>
        s.targetEntity.type === 'industry' &&
        (s.signalType === 'industry_growth' ||
          s.signalType === 'funding_activity' ||
          s.signalType === 'technology_shift' ||
          s.signalType === 'government_policy')
    );

    if (relevantSignals.length < this.config.minSignals) {
      return {
        industry: this.createPlaceholderIndustry(industryName),
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
        industry: this.createPlaceholderIndustry(industryName),
        confidence: confidence.overall,
        signals: relevantSignals,
        isValid: false,
        rejectionReason: `Confidence too low (${confidence.overall} < ${this.config.minConfidence})`,
      };
    }

    // Create or update industry record
    const industry = this.createOrUpdateIndustry(industryName, relevantSignals, confidence);

    return {
      industry,
      confidence: confidence.overall,
      signals: relevantSignals,
      isValid: true,
    };
  }

  /**
   * Add new discovery signal.
   */
  addSignal(signal: DiscoverySignal): void {
    if (signal.targetEntity.type !== 'industry') return;

    const key = signal.targetEntity.name.toLowerCase();

    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }

    const existing = this.signals.get(key)!;
    existing.push(signal);

    // Update industry if exists
    this.updateIndustryFromSignals(key);
  }

  /**
   * Get emerging industry by name.
   */
  getIndustry(name: string): EmergingIndustry | null {
    return this.industries.get(name.toLowerCase()) ?? null;
  }

  /**
   * Get all emerging industries.
   */
  getAllIndustries(): EmergingIndustry[] {
    return Array.from(this.industries.values());
  }

  /**
   * Get industries by stage.
   */
  getIndustriesByStage(stage: IndustryMaturityStage): EmergingIndustry[] {
    return this.getAllIndustries().filter((i) => i.stage === stage);
  }

  /**
   * Get industries by category.
   */
  getIndustriesByCategory(category: IndustryCategory): EmergingIndustry[] {
    return this.getAllIndustries().filter((i) => i.category === category);
  }

  /**
   * Get high-confidence emerging industries.
   */
  getHighConfidenceIndustries(threshold: number = 70): EmergingIndustry[] {
    return this.getAllIndustries()
      .filter((i) => i.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rank industries by opportunity score.
   */
  rankByOpportunity(): EmergingIndustry[] {
    return this.getAllIndustries().sort((a, b) => {
      const scoreA = calculateOpportunityScore(a);
      const scoreB = calculateOpportunityScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Find industries by risk level.
   */
  getIndustriesByRiskLevel(
    level: 'low' | 'moderate' | 'high' | 'extreme'
  ): EmergingIndustry[] {
    return this.getAllIndustries().filter((industry) => {
      const risk = assessIndustryRisk(industry);
      return risk.level === level;
    });
  }

  /**
   * Find related industries.
   */
  findRelatedIndustries(industryName: string, threshold: number = 50): EmergingIndustry[] {
    const industry = this.getIndustry(industryName);
    if (!industry) return [];

    return this.getAllIndustries().filter((i) => {
      if (i.id === industry.id) return false;

      // Check technology overlap
      const techOverlap = i.relatedTechnologies.filter((t) =>
        industry.relatedTechnologies.includes(t)
      ).length;

      const techScore =
        industry.relatedTechnologies.length > 0
          ? (techOverlap / industry.relatedTechnologies.length) * 100
          : 0;

      // Check geography overlap
      const geoOverlap = i.geography.leadingHubs.filter((h) =>
        industry.geography.leadingHubs.includes(h)
      ).length;

      const geoScore =
        industry.geography.leadingHubs.length > 0
          ? (geoOverlap / industry.geography.leadingHubs.length) * 100
          : 0;

      const similarity = techScore * 0.7 + geoScore * 0.3;

      return similarity >= threshold;
    });
  }

  /**
   * Update industry review status.
   */
  updateReviewStatus(
    industryId: string,
    status: EmergingIndustry['reviewStatus'],
    notes?: string
  ): boolean {
    const industry = Array.from(this.industries.values()).find((i) => i.id === industryId);
    if (!industry) return false;

    industry.reviewStatus = status;
    if (notes) industry.reviewNotes = notes;
    industry.updatedAt = new Date();

    return true;
  }

  /**
   * Group signals by industry name.
   */
  private groupSignalsByIndustry(
    signals: DiscoverySignal[]
  ): Map<string, DiscoverySignal[]> {
    const grouped = new Map<string, DiscoverySignal[]>();

    for (const signal of signals) {
      if (signal.targetEntity.type !== 'industry') continue;

      const name = signal.targetEntity.name.toLowerCase();

      if (!grouped.has(name)) {
        grouped.set(name, []);
      }

      grouped.get(name)!.push(signal);
    }

    return grouped;
  }

  /**
   * Create placeholder industry for invalid detection.
   */
  private createPlaceholderIndustry(name: string): EmergingIndustry {
    return createEmergingIndustry({
      name,
      alternativeNames: [],
      category: 'technology',
      stage: 'frontier',
      confidence: 0,
      growthSignal: 0,
      investmentSignal: 0,
      marketSizeIndicator: 0,
      momentum: 0,
      evidenceSources: [],
      signals: [],
      keyPlayers: [],
      relatedTechnologies: [],
      geography: { leadingHubs: [], emergingHubs: [] },
      regulatoryEnvironment: 'uncertain',
      investmentTrend: 'stable',
      talentDemand: 0,
    });
  }

  /**
   * Create or update industry record.
   */
  private createOrUpdateIndustry(
    name: string,
    signals: DiscoverySignal[],
    confidence: { overall: number }
  ): EmergingIndustry {
    const existing = this.industries.get(name.toLowerCase());

    if (existing) {
      // Update existing
      existing.signals = [...existing.signals, ...signals];
      existing.confidence = confidence.overall;
      existing.growthSignal = this.calculateGrowthSignal(signals);
      existing.investmentSignal = this.calculateInvestmentSignal(signals);
      existing.momentum = this.calculateMomentum(signals);

      // Update stage based on signals
      const companyCount = signals.filter((s) => s.signalType === 'industry_growth').length * 3;
      const totalFunding = signals
        .filter((s) => s.signalType === 'funding_activity')
        .reduce((sum, s) => sum + s.strength, 0);
      const marketAwareness = existing.confidence;

      existing.stage = updateIndustryStage(existing, companyCount, totalFunding, marketAwareness);
      existing.updatedAt = new Date();

      // Update evidence sources
      existing.evidenceSources = signals.map((s) => ({
        type: this.mapSignalToEvidenceType(s.signalType),
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      }));

      // Update investment trend
      existing.investmentTrend = this.determineInvestmentTrend(existing.signals);

      return existing;
    }

    // Create new
    const industry = createEmergingIndustry({
      name,
      alternativeNames: this.extractAlternativeNames(signals),
      category: this.categorizeIndustry(name, signals),
      stage: 'emerging',
      confidence: confidence.overall,
      growthSignal: this.calculateGrowthSignal(signals),
      investmentSignal: this.calculateInvestmentSignal(signals),
      marketSizeIndicator: this.estimateMarketSize(signals),
      momentum: this.calculateMomentum(signals),
      evidenceSources: signals.map((s) => ({
        type: this.mapSignalToEvidenceType(s.signalType),
        source: s.source,
        url: s.evidence[0]?.url,
        date: s.timestamp,
        strength: s.strength,
      })),
      signals,
      keyPlayers: this.extractKeyPlayers(signals),
      relatedTechnologies: this.extractTechnologies(signals),
      geography: this.extractGeography(signals),
      regulatoryEnvironment: this.assessRegulatoryEnvironment(signals),
      investmentTrend: this.determineInvestmentTrend(signals),
      talentDemand: this.estimateTalentDemand(signals),
    });

    this.industries.set(name.toLowerCase(), industry);
    return industry;
  }

  /**
   * Update industry from stored signals.
   */
  private updateIndustryFromSignals(key: string): void {
    const signals = this.signals.get(key);
    if (!signals || signals.length < this.config.minSignals) return;

    const confidence = this.confidenceEngine.calculateConfidence(signals);
    if (confidence.overall < this.config.minConfidence) return;

    this.createOrUpdateIndustry(key, signals, confidence);
  }

  /**
   * Calculate growth signal strength.
   */
  private calculateGrowthSignal(signals: DiscoverySignal[]): number {
    const growthSignals = signals.filter((s) => s.signalType === 'industry_growth');

    if (growthSignals.length === 0) return 50;

    const avgStrength =
      growthSignals.reduce((sum, s) => sum + s.strength, 0) / growthSignals.length;

    return Math.round(avgStrength);
  }

  /**
   * Calculate investment signal strength.
   */
  private calculateInvestmentSignal(signals: DiscoverySignal[]): number {
    const investmentSignals = signals.filter((s) => s.signalType === 'funding_activity');

    if (investmentSignals.length === 0) return 50;

    const avgStrength =
      investmentSignals.reduce((sum, s) => sum + s.strength, 0) / investmentSignals.length;

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
  private mapSignalToEvidenceType(signalType: string): EmergingIndustry['evidenceSources'][0]['type'] {
    const mapping: Record<string, EmergingIndustry['evidenceSources'][0]['type']> = {
      funding_activity: 'funding_round',
      industry_growth: 'industry_report',
      government_policy: 'regulatory_filing',
      technology_shift: 'patent_filing',
    };

    return mapping[signalType] ?? 'news_coverage';
  }

  /**
   * Extract alternative names.
   */
  private extractAlternativeNames(signals: DiscoverySignal[]): string[] {
    const names = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.description) {
        const akaMatch = signal.context.description.match(/also called "([^"]+)"/i);
        if (akaMatch) {
          names.add(akaMatch[1]!);
        }
      }
    }

    return Array.from(names);
  }

  /**
   * Categorize industry.
   */
  private categorizeIndustry(name: string, signals: DiscoverySignal[]): IndustryCategory {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('climate') || nameLower.includes('clean') || nameLower.includes('green')) {
      return 'sustainability';
    }

    if (nameLower.includes('health') || nameLower.includes('bio') || nameLower.includes('med')) {
      return 'healthcare';
    }

    if (nameLower.includes('finance') || nameLower.includes('fintech') || nameLower.includes('crypto')) {
      return 'finance';
    }

    if (nameLower.includes('defense') || nameLower.includes('security') || nameLower.includes('military')) {
      return 'defense';
    }

    if (nameLower.includes('energy') || nameLower.includes('solar') || nameLower.includes('battery')) {
      return 'energy';
    }

    if (nameLower.includes('transport') || nameLower.includes('logistics') || nameLower.includes('mobility')) {
      return 'transportation';
    }

    if (nameLower.includes('manufacturing') || nameLower.includes('industrial')) {
      return 'manufacturing';
    }

    return 'technology';
  }

  /**
   * Extract key players.
   */
  private extractKeyPlayers(signals: DiscoverySignal[]): string[] {
    const players = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        // Heuristic: company names often appear in funding signals
        if (signal.signalType === 'funding_activity' && /^[A-Z]/.test(related)) {
          players.add(related);
        }
      }
    }

    return Array.from(players).slice(0, 5);
  }

  /**
   * Extract related technologies.
   */
  private extractTechnologies(signals: DiscoverySignal[]): string[] {
    const techs = new Set<string>();

    for (const signal of signals) {
      for (const related of signal.context?.relatedEntities ?? []) {
        // Heuristic: technologies often mentioned with technology_shift signals
        if (signal.signalType === 'technology_shift') {
          techs.add(related);
        }
      }
    }

    return Array.from(techs);
  }

  /**
   * Extract geographic information.
   */
  private extractGeography(signals: DiscoverySignal[]): EmergingIndustry['geography'] {
    const hubs = new Set<string>();

    for (const signal of signals) {
      if (signal.context?.geographicScope) {
        hubs.add(signal.context.geographicScope);
      }
    }

    const hubList = Array.from(hubs);

    return {
      leadingHubs: hubList.slice(0, 3),
      emergingHubs: hubList.slice(3),
    };
  }

  /**
   * Assess regulatory environment.
   */
  private assessRegulatoryEnvironment(
    signals: DiscoverySignal[]
  ): EmergingIndustry['regulatoryEnvironment'] {
    const policySignals = signals.filter((s) => s.signalType === 'government_policy');

    if (policySignals.length === 0) return 'uncertain';

    const avgSentiment =
      policySignals.reduce((sum, s) => sum + s.strength, 0) / policySignals.length;

    if (avgSentiment >= 70) return 'supportive';
    if (avgSentiment >= 50) return 'neutral';
    if (avgSentiment >= 30) return 'uncertain';
    return 'restrictive';
  }

  /**
   * Determine investment trend.
   */
  private determineInvestmentTrend(signals: DiscoverySignal[]): EmergingIndustry['investmentTrend'] {
    const investmentSignals = signals.filter((s) => s.signalType === 'funding_activity');

    if (investmentSignals.length < 3) return 'stable';

    // Sort by time
    const sorted = [...investmentSignals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.strength, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.strength, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;

    if (change > 15) return 'accelerating';
    if (change > 5) return 'growing';
    if (change < -15) return 'declining';
    if (change < -5) return 'slowing';
    return 'stable';
  }

  /**
   * Estimate market size.
   */
  private estimateMarketSize(signals: DiscoverySignal[]): number {
    const signalScore = Math.min(100, signals.length * 5);
    const strengthScore =
      signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

    return Math.round((signalScore + strengthScore) / 2);
  }

  /**
   * Estimate talent demand.
   */
  private estimateTalentDemand(signals: DiscoverySignal[]): number {
    const hiringSignals = signals.filter(
      (s) => s.signalType === 'industry_growth' || s.signalType === 'new_job_title'
    );

    if (hiringSignals.length === 0) return 50;

    return Math.round(
      hiringSignals.reduce((sum, s) => sum + s.strength, 0) / hiringSignals.length
    );
  }
}

/**
 * Factory function for EmergingIndustryEngine.
 */
export function createEmergingIndustryEngine(
  config?: Partial<EmergingIndustryConfig>
): EmergingIndustryEngine {
  return new EmergingIndustryEngine(config);
}
