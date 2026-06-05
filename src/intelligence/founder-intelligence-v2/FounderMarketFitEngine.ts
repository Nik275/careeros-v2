/**
 * Founder Intelligence V2 - Market Fit Engine
 * 
 * Assesses alignment between founder profile and:
 * - Market sectors
 * - Startup stages
 * - Market timing
 * - Co-founder needs
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderTypeV2,
  FounderDimensionV2,
  DimensionScoreV2,
  FounderMarketFitV2,
  FounderReadinessV2,
} from './types';

/**
 * Configuration for market fit engine.
 */
export interface MarketFitConfigV2 {
  /** Minimum match score to include sector */
  minSectorMatch: number;
  
  /** Weight for founder type in sector matching */
  typeWeight: number;
  
  /** Weight for dimensions in sector matching */
  dimensionWeight: number;
  
  /** Weight for readiness in stage matching */
  readinessWeight: number;
}

/**
 * Default market fit configuration.
 */
export const DEFAULT_MARKET_FIT_CONFIG: MarketFitConfigV2 = {
  minSectorMatch: 0.5,
  typeWeight: 0.4,
  dimensionWeight: 0.4,
  readinessWeight: 0.2,
};

/**
 * Sector definitions with founder type affinities.
 */
const SECTOR_DEFINITIONS: Record<string, {
  founderTypes: FounderTypeV2[];
  keyDimensions: FounderDimensionV2[];
  stageFit: Record<string, number>;
  description: string;
}> = {
  'SaaS/B2B Software': {
    founderTypes: [FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.PRODUCT_FOUNDER],
    keyDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.SALES_CAPABILITY],
    stageFit: { PRE_SEED: 0.9, SEED: 0.95, EARLY: 0.9, GROWTH: 0.85 },
    description: 'Software sold to businesses, high technical requirements',
  },
  'Consumer Apps': {
    founderTypes: [FounderTypeV2.PRODUCT_FOUNDER, FounderTypeV2.COMMUNITY_BUILDER],
    keyDimensions: [FounderDimensionV2.OPPORTUNITY_RECOGNITION, FounderDimensionV2.TALENT_MAGNETISM],
    stageFit: { PRE_SEED: 0.85, SEED: 0.9, EARLY: 0.85, GROWTH: 0.8 },
    description: 'Apps for consumers, requires product intuition and growth skills',
  },
  'Marketplaces': {
    founderTypes: [FounderTypeV2.COMMUNITY_BUILDER, FounderTypeV2.BUSINESS_FOUNDER],
    keyDimensions: [FounderDimensionV2.TALENT_MAGNETISM, FounderDimensionV2.SALES_CAPABILITY],
    stageFit: { PRE_SEED: 0.8, SEED: 0.85, EARLY: 0.9, GROWTH: 0.9 },
    description: 'Two-sided platforms connecting buyers and sellers',
  },
  'AI/ML': {
    founderTypes: [FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.VISIONARY_FOUNDER],
    keyDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.OBSESSION_CAPACITY],
    stageFit: { PRE_SEED: 0.9, SEED: 0.9, EARLY: 0.85, GROWTH: 0.85 },
    description: 'AI-powered products, deep technical expertise required',
  },
  'Fintech': {
    founderTypes: [FounderTypeV2.BUSINESS_FOUNDER, FounderTypeV2.TECHNICAL_FOUNDER],
    keyDimensions: [FounderDimensionV2.OWNERSHIP_ORIENTATION, FounderDimensionV2.AMBIGUITY_TOLERANCE],
    stageFit: { PRE_SEED: 0.75, SEED: 0.8, EARLY: 0.85, GROWTH: 0.9 },
    description: 'Financial technology, regulatory complexity',
  },
  'Healthcare/Biotech': {
    founderTypes: [FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.SOCIAL_ENTREPRENEUR],
    keyDimensions: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.RESILIENCE],
    stageFit: { PRE_SEED: 0.7, SEED: 0.75, EARLY: 0.8, GROWTH: 0.85 },
    description: 'Healthcare innovation, long development cycles',
  },
  'EdTech': {
    founderTypes: [FounderTypeV2.SOCIAL_ENTREPRENEUR, FounderTypeV2.PRODUCT_FOUNDER],
    keyDimensions: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.OPPORTUNITY_RECOGNITION],
    stageFit: { PRE_SEED: 0.85, SEED: 0.85, EARLY: 0.8, GROWTH: 0.75 },
    description: 'Education technology, mission-driven market',
  },
  'E-commerce/DTC': {
    founderTypes: [FounderTypeV2.BUSINESS_FOUNDER, FounderTypeV2.CREATOR_FOUNDER],
    keyDimensions: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.RESOURCEFULNESS],
    stageFit: { PRE_SEED: 0.8, SEED: 0.85, EARLY: 0.9, GROWTH: 0.85 },
    description: 'Direct-to-consumer brands, marketing-heavy',
  },
  'Creator Economy': {
    founderTypes: [FounderTypeV2.CREATOR_FOUNDER, FounderTypeV2.COMMUNITY_BUILDER],
    keyDimensions: [FounderDimensionV2.SALES_CAPABILITY, FounderDimensionV2.TALENT_MAGNETISM],
    stageFit: { PRE_SEED: 0.9, SEED: 0.85, EARLY: 0.8, GROWTH: 0.75 },
    description: 'Tools for creators, audience-first approach',
  },
  'Climate/Sustainability': {
    founderTypes: [FounderTypeV2.SOCIAL_ENTREPRENEUR, FounderTypeV2.VISIONARY_FOUNDER],
    keyDimensions: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.RESILIENCE],
    stageFit: { PRE_SEED: 0.8, SEED: 0.8, EARLY: 0.85, GROWTH: 0.85 },
    description: 'Climate tech, long-term mission required',
  },
  'Hard Tech/Hardware': {
    founderTypes: [FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.VISIONARY_FOUNDER],
    keyDimensions: [FounderDimensionV2.RESOURCEFULNESS, FounderDimensionV2.RESILIENCE],
    stageFit: { PRE_SEED: 0.75, SEED: 0.75, EARLY: 0.8, GROWTH: 0.85 },
    description: 'Physical products, capital intensive',
  },
  'Social Impact': {
    founderTypes: [FounderTypeV2.SOCIAL_ENTREPRENEUR],
    keyDimensions: [FounderDimensionV2.OBSESSION_CAPACITY, FounderDimensionV2.TALENT_MAGNETISM],
    stageFit: { PRE_SEED: 0.85, SEED: 0.85, EARLY: 0.8, GROWTH: 0.75 },
    description: 'Mission-driven ventures, impact measurement',
  },
};

/**
 * Stage requirements by readiness.
 */
const STAGE_READINESS_MAP: Record<FounderReadinessV2, {
  suitableStages: string[];
  maxStage: string;
  reasoning: string;
}> = {
  [FounderReadinessV2.EARLY]: {
    suitableStages: ['IDEATION', 'PRE_SEED'],
    maxStage: 'PRE_SEED',
    reasoning: 'Early stage founders should focus on validation and learning',
  },
  [FounderReadinessV2.EMERGING]: {
    suitableStages: ['IDEATION', 'PRE_SEED', 'SEED'],
    maxStage: 'SEED',
    reasoning: 'Emerging founders can handle early validation and initial funding',
  },
  [FounderReadinessV2.READY]: {
    suitableStages: ['PRE_SEED', 'SEED', 'EARLY'],
    maxStage: 'EARLY',
    reasoning: 'Ready founders can execute through product-market fit',
  },
  [FounderReadinessV2.HIGH_POTENTIAL]: {
    suitableStages: ['SEED', 'EARLY', 'GROWTH', 'LATE'],
    maxStage: 'LATE',
    reasoning: 'High potential founders can scale ventures',
  },
};

/**
 * Market Fit Engine V2
 */
export class FounderMarketFitEngineV2 {
  private config: MarketFitConfigV2;
  
  constructor(config: Partial<MarketFitConfigV2> = {}) {
    this.config = { ...DEFAULT_MARKET_FIT_CONFIG, ...config };
  }
  
  /**
   * Assess market fit for founder profile.
   */
  assess(
    founderType: FounderTypeV2 | null,
    dimensionScores: DimensionScoreV2[],
    readiness: FounderReadinessV2,
    overallPotential: number
  ): FounderMarketFitV2 {
    // Assess sector matches
    const sectorMatches = this.assessSectorMatches(founderType, dimensionScores);
    
    // Assess stage matches
    const stageMatches = this.assessStageMatches(readiness, overallPotential);
    
    // Calculate overall alignment
    const alignmentScore = this.calculateAlignmentScore(sectorMatches, stageMatches);
    
    // Assess co-founder needs
    const coFounderNeeds = this.assessCoFounderNeeds(founderType, dimensionScores, readiness);
    
    // Assess timing
    const timingAssessment = this.assessTiming(readiness, overallPotential);
    
    return {
      alignmentScore,
      confidence: this.calculateConfidence(sectorMatches, stageMatches),
      bestSectors: sectorMatches.slice(0, 5),
      bestStages: stageMatches.slice(0, 3),
      coFounderNeeds,
      timingAssessment,
    };
  }
  
  /**
   * Assess sector matches for founder type and dimensions.
   */
  private assessSectorMatches(
    founderType: FounderTypeV2 | null,
    dimensionScores: DimensionScoreV2[]
  ): { sector: string; matchScore: number; reasoning: string }[] {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    const matches: { sector: string; matchScore: number; reasoning: string }[] = [];
    
    for (const [sector, definition] of Object.entries(SECTOR_DEFINITIONS)) {
      // Calculate type match
      let typeScore = 0;
      if (founderType && definition.founderTypes.includes(founderType)) {
        typeScore = 1;
      } else if (founderType) {
        // Check for partial match (similar types)
        typeScore = 0.3;
      }
      
      // Calculate dimension match
      const dimensionScores_ = definition.keyDimensions.map(d => dimensionMap.get(d) ?? 0);
      const dimensionScore = dimensionScores_.reduce((a, b) => a + b, 0) / dimensionScores_.length;
      
      // Calculate weighted match
      const matchScore = 
        typeScore * this.config.typeWeight +
        dimensionScore * this.config.dimensionWeight +
        (typeScore > 0 && dimensionScore > 0.5 ? 0.2 : 0); // Bonus for alignment
      
      if (matchScore >= this.config.minSectorMatch) {
        const reasoning = this.generateSectorReasoning(sector, typeScore, dimensionScore, definition);
        matches.push({ sector, matchScore, reasoning });
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  /**
   * Generate reasoning for sector match.
   */
  private generateSectorReasoning(
    sector: string,
    typeScore: number,
    dimensionScore: number,
    definition: typeof SECTOR_DEFINITIONS[string]
  ): string {
    let reasoning = '';
    
    if (typeScore >= 0.8) {
      reasoning += `Your founder type aligns well with typical ${sector} founders. `;
    } else if (typeScore >= 0.3) {
      reasoning += `Your founder type shows some compatibility with ${sector}. `;
    }
    
    if (dimensionScore >= 0.6) {
      reasoning += `Your strengths in ${definition.keyDimensions.slice(0, 2).map(d => d.replace(/_/g, ' ').toLowerCase()).join(' and ')} match this sector's requirements.`;
    } else if (dimensionScore >= 0.4) {
      reasoning += `You have developing capabilities in key areas for this sector.`;
    }
    
    return reasoning || `General compatibility with ${sector} based on profile analysis.`;
  }
  
  /**
   * Assess stage matches based on readiness.
   */
  private assessStageMatches(
    readiness: FounderReadinessV2,
    overallPotential: number
  ): { stage: 'IDEATION' | 'PRE_SEED' | 'SEED' | 'EARLY' | 'GROWTH' | 'LATE'; matchScore: number; reasoning: string }[] {
    const stageMapping = STAGE_READINESS_MAP[readiness];
    const matches: { stage: 'IDEATION' | 'PRE_SEED' | 'SEED' | 'EARLY' | 'GROWTH' | 'LATE'; matchScore: number; reasoning: string }[] = [];
    
    for (const stage of stageMapping.suitableStages) {
      // Base score from readiness mapping
      let score = 0.7;
      
      // Adjust based on potential
      if (overallPotential > 0.7) score += 0.15;
      else if (overallPotential > 0.5) score += 0.05;
      
      // Penalty for stages beyond readiness
      if (stage === stageMapping.maxStage) score += 0.1;
      
      matches.push({
        stage: stage as any,
        matchScore: Math.min(score, 1),
        reasoning: stageMapping.reasoning,
      });
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  /**
   * Assess co-founder needs.
   */
  private assessCoFounderNeeds(
    founderType: FounderTypeV2 | null,
    dimensionScores: DimensionScoreV2[],
    readiness: FounderReadinessV2
  ): FounderMarketFitV2['coFounderNeeds'] {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d.score]));
    
    // Determine if co-founder is needed
    const soloRiskFactors = [
      dimensionMap.get(FounderDimensionV2.TALENT_MAGNETISM) ?? 0 < 0.5,
      dimensionMap.get(FounderDimensionV2.SALES_CAPABILITY) ?? 0 < 0.4,
      dimensionMap.get(FounderDimensionV2.RESOURCEFULNESS) ?? 0 < 0.5,
    ].filter(Boolean).length;
    
    const needsCoFounder = soloRiskFactors >= 2 || readiness === FounderReadinessV2.EARLY;
    
    // Determine priority
    let priority: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL' = 'OPTIONAL';
    if (soloRiskFactors >= 2 || readiness === FounderReadinessV2.EARLY) {
      priority = 'CRITICAL';
    } else if (soloRiskFactors === 1 || readiness === FounderReadinessV2.EMERGING) {
      priority = 'RECOMMENDED';
    }
    
    // Recommend complementary types
    const complementaryTypes: FounderTypeV2[] = [];
    
    if (founderType) {
      // Add type-specific recommendations
      switch (founderType) {
        case FounderTypeV2.TECHNICAL_FOUNDER:
          complementaryTypes.push(FounderTypeV2.BUSINESS_FOUNDER, FounderTypeV2.PRODUCT_FOUNDER);
          break;
        case FounderTypeV2.BUSINESS_FOUNDER:
          complementaryTypes.push(FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.PRODUCT_FOUNDER);
          break;
        case FounderTypeV2.PRODUCT_FOUNDER:
          complementaryTypes.push(FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.BUSINESS_FOUNDER);
          break;
        case FounderTypeV2.VISIONARY_FOUNDER:
          complementaryTypes.push(FounderTypeV2.TECHNICAL_FOUNDER, FounderTypeV2.BUSINESS_FOUNDER);
          break;
        default:
          complementaryTypes.push(FounderTypeV2.BUSINESS_FOUNDER, FounderTypeV2.TECHNICAL_FOUNDER);
      }
    } else {
      // Generic recommendations based on weak dimensions
      if ((dimensionMap.get(FounderDimensionV2.SALES_CAPABILITY) ?? 0) < 0.5) {
        complementaryTypes.push(FounderTypeV2.BUSINESS_FOUNDER);
      }
      if ((dimensionMap.get(FounderDimensionV2.RESOURCEFULNESS) ?? 0) < 0.5) {
        complementaryTypes.push(FounderTypeV2.TECHNICAL_FOUNDER);
      }
    }
    
    return {
      needed: needsCoFounder,
      priority,
      complementaryTypes: [...new Set(complementaryTypes)],
      reasoning: needsCoFounder
        ? `Your profile shows gaps in ${soloRiskFactors >= 2 ? 'multiple' : 'key'} areas where a co-founder would provide essential balance.`
        : 'Your profile shows strength across key dimensions, though a co-founder could still accelerate success.',
    };
  }
  
  /**
   * Assess market timing.
   */
  private assessTiming(
    readiness: FounderReadinessV2,
    overallPotential: number
  ): FounderMarketFitV2['timingAssessment'] {
    const favorable = readiness === FounderReadinessV2.READY || 
                      readiness === FounderReadinessV2.HIGH_POTENTIAL;
    
    const score = favorable ? 
      0.7 + (overallPotential - 0.6) * 0.5 : 
      0.3 + (overallPotential * 0.3);
    
    let explanation = '';
    const recommendations: string[] = [];
    
    if (readiness === FounderReadinessV2.HIGH_POTENTIAL) {
      explanation = 'Your profile suggests strong readiness to start now. Market timing is favorable given your capabilities.';
      recommendations.push('Validate specific market opportunities immediately');
      recommendations.push('Begin networking with potential co-founders');
      recommendations.push('Start customer discovery conversations');
    } else if (readiness === FounderReadinessV2.READY) {
      explanation = 'You appear ready to start, though some preparation would strengthen your position.';
      recommendations.push('Spend 3-6 months validating ideas before committing');
      recommendations.push('Build a small advisory network');
      recommendations.push('Develop specific domain expertise');
    } else if (readiness === FounderReadinessV2.EMERGING) {
      explanation = 'Consider gaining more experience before starting. Focus on skill development.';
      recommendations.push('Join an early-stage startup to learn');
      recommendations.push('Build side projects to develop capabilities');
      recommendations.push('Find a mentor who has founded before');
    } else {
      explanation = 'Early stage in founder development. Focus on learning and skill building.';
      recommendations.push('Work in startups to understand the environment');
      recommendations.push('Develop technical or business skills');
      recommendations.push('Study successful founders and their journeys');
    }
    
    return {
      favorable,
      score: Math.min(Math.max(score, 0), 1),
      explanation,
      recommendations,
    };
  }
  
  /**
   * Calculate overall alignment score.
   */
  private calculateAlignmentScore(
    sectorMatches: { matchScore: number }[],
    stageMatches: { matchScore: number }[]
  ): number {
    const sectorScore = sectorMatches.length > 0 ?
      sectorMatches.slice(0, 3).reduce((sum, m) => sum + m.matchScore, 0) / Math.min(sectorMatches.length, 3) :
      0.4;
    
    const stageScore = stageMatches.length > 0 ?
      stageMatches[0].matchScore :
      0.4;
    
    return (sectorScore * 0.6 + stageScore * 0.4);
  }
  
  /**
   * Calculate confidence in assessment.
   */
  private calculateConfidence(
    sectorMatches: unknown[],
    stageMatches: unknown[]
  ): number {
    // More matches = higher confidence
    const sectorConfidence = Math.min(sectorMatches.length / 3, 0.5);
    const stageConfidence = 0.3; // Stage is deterministic
    
    return Math.min(sectorConfidence + stageConfidence + 0.2, 1);
  }
  
  /**
   * Get sectors compatible with a founder type.
   */
  getSectorsForType(type: FounderTypeV2): string[] {
    const sectors: string[] = [];
    
    for (const [sector, definition] of Object.entries(SECTOR_DEFINITIONS)) {
      if (definition.founderTypes.includes(type)) {
        sectors.push(sector);
      }
    }
    
    return sectors;
  }
  
  /**
   * Check if founder can handle specific stage.
   */
  canHandleStage(readiness: FounderReadinessV2, stage: string): boolean {
    const mapping = STAGE_READINESS_MAP[readiness];
    return mapping.suitableStages.includes(stage);
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<MarketFitConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating market fit engine.
 */
export function createFounderMarketFitEngineV2(
  config?: Partial<MarketFitConfigV2>
): FounderMarketFitEngineV2 {
  return new FounderMarketFitEngineV2(config);
}
