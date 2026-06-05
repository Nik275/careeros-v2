/**
 * Founder Intelligence V2 - False Positive Protection Engine
 * 
 * Distinguishes true founder potential from related but distinct profiles.
 * 
 * Key insight: Many profiles share surface-level similarities with founders:
 * - Freelancers: autonomy, self-direction, ownership of work
 * - Consultants: problem identification, strategic thinking
 * - Researchers: persistence, intelligence, expertise
 * - Artists: creativity, vision, ambiguity tolerance
 * 
 * This engine uses differential diagnosis to identify the specific
 * patterns that distinguish founders from these similar profiles.
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  NonFounderProfileV2,
  NonFounderProfileDetectionV2,
  FounderEvidenceV2,
  FounderEvidenceTypeV2,
  FounderDimensionV2,
  DimensionScoreV2,
  FounderAnalysisInputV2,
  ProjectInfoV2,
  getNonFounderProfileLabelV2,
  getNonFounderDistinctionV2,
} from './types';
import { 
  NON_FOUNDER_PATTERN_MAP, 
  NonFounderPattern,
  DIFFERENTIAL_FOUNDER_INDICATORS,
  SignalPattern,
} from './signals';

/**
 * Configuration for false positive protection.
 */
export interface FalsePositiveProtectionConfigV2 {
  /** Threshold to flag as non-founder profile */
  detectionThreshold: number;
  
  /** Threshold where non-founder profile blocks founder classification */
  blockThreshold: number;
  
  /** Minimum confidence for non-founder detection */
  minConfidence: number;
  
  /** Whether to enable protection */
  enabled: boolean;
  
  /** Weight for text pattern evidence */
  textPatternWeight: number;
  
  /** Weight for portfolio evidence */
  portfolioWeight: number;
  
  /** Weight for dimension pattern evidence */
  dimensionPatternWeight: number;
  
  /** Differential indicator override strength */
  differentialOverrideStrength: number;
}

/**
 * Default false positive protection configuration.
 */
export const DEFAULT_FALSE_POSITIVE_CONFIG: FalsePositiveProtectionConfigV2 = {
  detectionThreshold: 0.55,
  blockThreshold: 0.8,
  minConfidence: 0.4,
  enabled: true,
  textPatternWeight: 0.4,
  portfolioWeight: 0.3,
  dimensionPatternWeight: 0.3,
  differentialOverrideStrength: 0.6,
};

/**
 * Dimension patterns that suggest non-founder profiles.
 */
const DIMENSION_NON_FOUNDER_PATTERNS: Record<NonFounderProfileV2, {
  requiredDimensions: FounderDimensionV2[];
  excludedDimensions: FounderDimensionV2[];
  dimensionThreshold: number;
}> = {
  [NonFounderProfileV2.FREELANCER]: {
    requiredDimensions: [FounderDimensionV2.OWNERSHIP_ORIENTATION],
    excludedDimensions: [FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.SALES_CAPABILITY],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.CONSULTANT]: {
    requiredDimensions: [FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    excludedDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.RESEARCHER]: {
    requiredDimensions: [FounderDimensionV2.OBSESSION_CAPACITY],
    excludedDimensions: [FounderDimensionV2.SALES_CAPABILITY],
    dimensionThreshold: 0.6,
  },
  [NonFounderProfileV2.ACADEMIC]: {
    requiredDimensions: [FounderDimensionV2.OBSESSION_CAPACITY],
    excludedDimensions: [FounderDimensionV2.OWNERSHIP_ORIENTATION, FounderDimensionV2.SALES_CAPABILITY],
    dimensionThreshold: 0.6,
  },
  [NonFounderProfileV2.ARTIST]: {
    requiredDimensions: [FounderDimensionV2.AMBIGUITY_TOLERANCE],
    excludedDimensions: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.INDEPENDENT_SPECIALIST]: {
    requiredDimensions: [FounderDimensionV2.RESOURCEFULNESS],
    excludedDimensions: [FounderDimensionV2.TALENT_MAGNETISM],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.CONTENT_CREATOR]: {
    requiredDimensions: [FounderDimensionV2.SALES_CAPABILITY],
    excludedDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.OWNERSHIP_ORIENTATION],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.INVESTOR_MINDSET]: {
    requiredDimensions: [FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    excludedDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.RESILIENCE],
    dimensionThreshold: 0.5,
  },
  [NonFounderProfileV2.WANTREPRENEUR]: {
    requiredDimensions: [FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    excludedDimensions: [FounderDimensionV2.OWNERSHIP_ORIENTATION, FounderDimensionV2.RESOURCEFULNESS],
    dimensionThreshold: 0.4,
  },
};

/**
 * False Positive Protection Engine V2
 * 
 * Detects non-founder profiles with differential diagnosis.
 */
export class FalsePositiveProtectionEngineV2 {
  private config: FalsePositiveProtectionConfigV2;
  
  constructor(config: Partial<FalsePositiveProtectionConfigV2> = {}) {
    this.config = { ...DEFAULT_FALSE_POSITIVE_CONFIG, ...config };
  }
  
  /**
   * Analyze input for non-founder profile signals.
   * 
   * @param input - Founder analysis input
   * @param dimensionScores - Current dimension scores
   * @returns Array of detected non-founder profiles
   */
  analyze(
    input: FounderAnalysisInputV2,
    dimensionScores: DimensionScoreV2[]
  ): NonFounderProfileDetectionV2[] {
    if (!this.config.enabled) {
      return [];
    }
    
    const detections: NonFounderProfileDetectionV2[] = [];
    
    // Check for differential founder indicators first
    const differentialScore = this.calculateDifferentialScore(input);
    
    for (const profile of Object.values(NonFounderProfileV2)) {
      const detection = this.detectProfile(profile, input, dimensionScores, differentialScore);
      if (detection && detection.confidence >= this.config.minConfidence) {
        detections.push(detection);
      }
    }
    
    // Sort by confidence
    return detections.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Detect a specific non-founder profile.
   */
  private detectProfile(
    profile: NonFounderProfileV2,
    input: FounderAnalysisInputV2,
    dimensionScores: DimensionScoreV2[],
    differentialScore: number
  ): NonFounderProfileDetectionV2 | null {
    // Get evidence from different sources
    const textEvidence = this.detectFromTextPatterns(profile, input);
    const portfolioEvidence = this.detectFromPortfolio(profile, input.projectPortfolio);
    const dimensionEvidence = this.detectFromDimensionPatterns(profile, dimensionScores);
    
    // Combine all evidence
    const allEvidence = [...textEvidence, ...portfolioEvidence, ...dimensionEvidence];
    
    if (allEvidence.length === 0) {
      return null;
    }
    
    // Calculate confidence with differential override
    const baseConfidence = this.calculateConfidence(allEvidence);
    const adjustedConfidence = Math.max(0, baseConfidence - differentialScore * this.config.differentialOverrideStrength);
    
    if (adjustedConfidence < this.config.minConfidence) {
      return null;
    }
    
    // Get counter-evidence (differential indicators that specifically counter this profile)
    const counterEvidence = this.getCounterEvidence(profile, input);
    
    // Determine if this profile is dominant
    const isDominant = adjustedConfidence >= this.config.blockThreshold;
    
    // Determine if classification should be blocked
    const blocksClassification = isDominant && counterEvidence.length < 2;
    
    return {
      profile,
      confidence: adjustedConfidence,
      evidence: allEvidence,
      distinctionExplanation: getNonFounderDistinctionV2(profile),
      isDominant,
      blocksClassification,
      counterEvidence,
    };
  }
  
  /**
   * Detect non-founder profile from text patterns.
   */
  private detectFromTextPatterns(
    profile: NonFounderProfileV2,
    input: FounderAnalysisInputV2
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    const patterns = NON_FOUNDER_PATTERN_MAP[profile];
    
    if (!patterns) return evidence;
    
    const textSources = this.getTextSources(input);
    
    for (const { text, source } of textSources) {
      const lowerText = text.toLowerCase();
      
      for (const pattern of patterns) {
        const regex = pattern.pattern instanceof RegExp 
          ? pattern.pattern 
          : new RegExp(pattern.pattern, 'i');
        
        if (regex.test(lowerText)) {
          let strength = pattern.strength;
          
          // Check for override signals
          if (pattern.overrideSignals) {
            const hasOverride = pattern.overrideSignals.some(signal => 
              lowerText.includes(signal.toLowerCase())
            );
            if (hasOverride) {
              strength *= (1 - (pattern.overrideReduction || 0.3));
            }
          }
          
          evidence.push({
            id: `fp_${profile}_${source}_${Date.now()}`,
            type: pattern.evidenceType,
            strength,
            description: `${getNonFounderProfileLabelV2(profile)} pattern: "${pattern.pattern.toString()}"`,
            source,
            rawValue: { pattern: pattern.pattern.toString(), text: text.substring(0, 100) },
            timestamp: Date.now(),
            isContradictory: true,
          });
        }
      }
    }
    
    return evidence;
  }
  
  /**
   * Detect non-founder profile from portfolio.
   */
  private detectFromPortfolio(
    profile: NonFounderProfileV2,
    portfolio?: ProjectInfoV2[]
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    if (!portfolio || portfolio.length === 0) return evidence;
    
    for (const project of portfolio) {
      switch (profile) {
        case NonFounderProfileV2.FREELANCER:
          // Freelancer projects: service delivery, no product
          if (!project.isProduct && project.hadRevenue && project.teamSize === 1) {
            evidence.push({
              id: `fp_freelance_${project.name}`,
              type: FounderEvidenceTypeV2.PORTFOLIO_ANALYSIS,
              strength: 0.75,
              description: `Service project "${project.name}" without product/users suggests freelancer pattern`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          break;
          
        case NonFounderProfileV2.WANTREPRENEUR:
          // Wantrepreneur: many abandoned projects, no completion
          const abandonedCount = portfolio.filter(p => p.outcome === 'abandoned').length;
          if (abandonedCount >= 2 && portfolio.length >= 3) {
            evidence.push({
              id: `fp_wantrep_${project.name}`,
              type: FounderEvidenceTypeV2.PORTFOLIO_ANALYSIS,
              strength: Math.min(0.6 + abandonedCount * 0.1, 0.85),
              description: `${abandonedCount} abandoned projects out of ${portfolio.length} suggests wantrepreneur pattern`,
              source: `project_${project.name}`,
              rawValue: { abandonedCount, totalCount: portfolio.length },
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          // Many projects but none with users/revenue
          const noTractionProjects = portfolio.filter(p => !p.hadUsers && !p.hadRevenue).length;
          if (noTractionProjects >= 3 && portfolio.length >= 4) {
            evidence.push({
              id: `fp_wantrep_traction_${project.name}`,
              type: FounderEvidenceTypeV2.PORTFOLIO_ANALYSIS,
              strength: 0.7,
              description: `${noTractionProjects} projects without users/revenue suggests wantrepreneur pattern`,
              source: `project_${project.name}`,
              rawValue: { noTractionProjects, totalCount: portfolio.length },
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          break;
          
        case NonFounderProfileV2.CONTENT_CREATOR:
          // Content projects: audience focus, no product
          if (!project.isProduct && project.userCount && project.userCount > 1000 && !project.hadRevenue) {
            evidence.push({
              id: `fp_content_${project.name}`,
              type: FounderEvidenceTypeV2.PORTFOLIO_ANALYSIS,
              strength: 0.75,
              description: `Large audience (${project.userCount}) without monetization suggests content creator pattern`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          break;
      }
    }
    
    return evidence;
  }
  
  /**
   * Detect non-founder profile from dimension score patterns.
   */
  private detectFromDimensionPatterns(
    profile: NonFounderProfileV2,
    dimensionScores: DimensionScoreV2[]
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    const pattern = DIMENSION_NON_FOUNDER_PATTERNS[profile];
    
    if (!pattern) return evidence;
    
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d]));
    
    // Check required dimensions
    const requiredScores = pattern.requiredDimensions.map(d => dimensionMap.get(d)?.score ?? 0);
    const hasRequiredDimensions = requiredScores.every(s => s >= pattern.dimensionThreshold);
    
    if (!hasRequiredDimensions) return evidence;
    
    // Check excluded dimensions
    const excludedScores = pattern.excludedDimensions.map(d => ({
      dimension: d,
      score: dimensionMap.get(d)?.score ?? 0,
    }));
    const hasExcludedLow = excludedScores.some(s => s.score < pattern.dimensionThreshold);
    
    // Generate evidence if pattern matches
    if (hasRequiredDimensions && hasExcludedLow) {
      const avgRequired = requiredScores.reduce((a, b) => a + b, 0) / requiredScores.length;
      const avgExcluded = excludedScores.reduce((a, b) => a + b.score, 0) / excludedScores.length;
      
      evidence.push({
        id: `fp_${profile}_dimensions`,
        type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
        strength: (avgRequired + (1 - avgExcluded)) / 2,
        description: `Dimension pattern matches ${getNonFounderProfileLabelV2(profile)} profile`,
        source: 'dimension_analysis',
        rawValue: { requiredScores, excludedScores },
        timestamp: Date.now(),
        isContradictory: true,
      });
    }
    
    return evidence;
  }
  
  /**
   * Get evidence that counters a non-founder profile.
   */
  private getCounterEvidence(
    profile: NonFounderProfileV2,
    input: FounderAnalysisInputV2
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    const textSources = this.getTextSources(input);
    
    for (const { text, source } of textSources) {
      const lowerText = text.toLowerCase();
      
      for (const indicator of DIFFERENTIAL_FOUNDER_INDICATORS) {
        if (indicator.countersProfiles?.includes(profile)) {
          const regex = indicator.pattern instanceof RegExp
            ? indicator.pattern
            : new RegExp(indicator.pattern, 'i');
          
          if (regex.test(lowerText)) {
            evidence.push({
              id: `counter_${profile}_${Date.now()}`,
              type: indicator.evidenceType,
              dimension: indicator.dimension,
              strength: indicator.strength,
              description: `Counters ${getNonFounderProfileLabelV2(profile)}: ${indicator.description}`,
              source,
              rawValue: { pattern: indicator.pattern.toString() },
              timestamp: Date.now(),
              isContradictory: false,
              countersNonFounderProfile: profile,
            });
          }
        }
      }
    }
    
    return evidence;
  }
  
  /**
   * Calculate differential founder score.
   */
  private calculateDifferentialScore(input: FounderAnalysisInputV2): number {
    const textSources = this.getTextSources(input);
    let score = 0;
    
    for (const { text } of textSources) {
      const lowerText = text.toLowerCase();
      
      for (const indicator of DIFFERENTIAL_FOUNDER_INDICATORS) {
        const regex = indicator.pattern instanceof RegExp
          ? indicator.pattern
          : new RegExp(indicator.pattern, 'i');
        
        if (regex.test(lowerText)) {
          score += indicator.strength;
        }
      }
    }
    
    // Check portfolio for differential indicators
    if (input.projectPortfolio) {
      for (const project of input.projectPortfolio) {
        if (project.isProduct && project.hadUsers) score += 0.8;
        if (project.hadRevenue) score += 0.9;
        if (project.role === 'CO_FOUNDER') score += 0.85;
        if (project.teamSize > 2) score += 0.7;
      }
    }
    
    return Math.min(score / 3, 1); // Normalize
  }
  
  /**
   * Calculate confidence in detection.
   */
  private calculateConfidence(evidence: FounderEvidenceV2[]): number {
    if (evidence.length === 0) return 0;
    
    // Base confidence from evidence count and strength
    const countConfidence = Math.min(evidence.length * 0.15, 0.4);
    const strengthConfidence = Math.max(...evidence.map(e => e.strength)) * 0.4;
    const consistencyConfidence = this.calculateConsistency(evidence) * 0.2;
    
    return Math.min(countConfidence + strengthConfidence + consistencyConfidence, 1);
  }
  
  /**
   * Calculate consistency of evidence.
   */
  private calculateConsistency(evidence: FounderEvidenceV2[]): number {
    if (evidence.length < 2) return 0.5;
    
    const strengths = evidence.map(e => e.strength);
    const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
    const variance = strengths.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / strengths.length;
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - variance * 2);
  }
  
  /**
   * Get all text sources from input.
   */
  private getTextSources(input: FounderAnalysisInputV2): { text: string; source: string }[] {
    const sources: { text: string; source: string }[] = [];
    
    if (input.userInput) {
      sources.push({ text: input.userInput.toLowerCase(), source: 'user_input' });
    }
    
    if (input.explicitStatements) {
      input.explicitStatements.forEach((stmt, idx) => {
        sources.push({ text: stmt.toLowerCase(), source: `explicit_${idx}` });
      });
    }
    
    if (input.experienceDescriptions) {
      input.experienceDescriptions.forEach((desc, idx) => {
        sources.push({ text: desc.toLowerCase(), source: `experience_${idx}` });
      });
    }
    
    return sources;
  }
  
  /**
   * Calculate overall false positive risk.
   */
  calculateFalsePositiveRisk(detections: NonFounderProfileDetectionV2[]): number {
    if (detections.length === 0) return 0;
    
    // Weight by whether profile is dominant
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const detection of detections) {
      const weight = detection.isDominant ? 2 : 1;
      weightedSum += detection.confidence * weight;
      totalWeight += weight;
    }
    
    return Math.min(weightedSum / totalWeight, 1);
  }
  
  /**
   * Check if founder classification should be blocked.
   */
  shouldBlockFounderClassification(detections: NonFounderProfileDetectionV2[]): boolean {
    return detections.some(d => d.blocksClassification);
  }
  
  /**
   * Get warning message for false positive risk.
   */
  getFalsePositiveWarning(
    detections: NonFounderProfileDetectionV2[],
    riskScore: number
  ): string | undefined {
    if (riskScore < this.config.detectionThreshold) {
      return undefined;
    }
    
    const topDetection = detections[0];
    const profileLabel = getNonFounderProfileLabelV2(topDetection.profile);
    
    if (riskScore >= this.config.blockThreshold) {
      return `Strong indicators suggest ${profileLabel} profile rather than founder potential. ${topDetection.distinctionExplanation}`;
    }
    
    return `Some indicators suggest ${profileLabel} tendencies. Consider whether you're looking to build a scalable product/company or offer services/expertise.`;
  }
  
  /**
   * Get recommendation for addressing false positive risk.
   */
  getFalsePositiveRecommendation(
    detections: NonFounderProfileDetectionV2[]
  ): { action: string; reasoning: string } | undefined {
    if (detections.length === 0) return undefined;
    
    const topDetection = detections[0];
    
    const recommendations: Record<NonFounderProfileV2, { action: string; reasoning: string }> = {
      [NonFounderProfileV2.FREELANCER]: {
        action: 'Build a product with users, not just deliver services',
        reasoning: 'Freelancers trade time for money. Founders build equity through products.',
      },
      [NonFounderProfileV2.CONSULTANT]: {
        action: 'Execute on recommendations, not just advise',
        reasoning: 'Consultants give advice. Founders build solutions.',
      },
      [NonFounderProfileV2.RESEARCHER]: {
        action: 'Focus on commercial application, not just understanding',
        reasoning: 'Researchers seek knowledge. Founders solve customer problems.',
      },
      [NonFounderProfileV2.ACADEMIC]: {
        action: 'Pursue market validation, not peer validation',
        reasoning: 'Academics seek publication. Founders seek customers.',
      },
      [NonFounderProfileV2.ARTIST]: {
        action: 'Solve customer problems, not just express vision',
        reasoning: 'Artists prioritize expression. Founders prioritize customer needs.',
      },
      [NonFounderProfileV2.INDEPENDENT_SPECIALIST]: {
        action: 'Build a team and delegate, not just do the work yourself',
        reasoning: 'Specialists are individual contributors. Founders build organizations.',
      },
      [NonFounderProfileV2.CONTENT_CREATOR]: {
        action: 'Build a product that solves problems, not just an audience',
        reasoning: 'Creators build distribution. Founders build solutions.',
      },
      [NonFounderProfileV2.INVESTOR_MINDSET]: {
        action: 'Create value through operations, not just allocate capital',
        reasoning: 'Investors analyze. Founders execute.',
      },
      [NonFounderProfileV2.WANTREPRENEUR]: {
        action: 'Take concrete action now, not just plan for the future',
        reasoning: 'Wantrepreneurs talk. Founders build.',
      },
    };
    
    return recommendations[topDetection.profile];
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<FalsePositiveProtectionConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating false positive protection engine.
 */
export function createFalsePositiveProtectionEngineV2(
  config?: Partial<FalsePositiveProtectionConfigV2>
): FalsePositiveProtectionEngineV2 {
  return new FalsePositiveProtectionEngineV2(config);
}
