/**
 * Founder Intelligence V2 - Founder Classification Engine
 * 
 * Classifies founders into 7 types based on dimension scores and evidence:
 * - Technical Founder
 * - Product Founder
 * - Business Founder
 * - Visionary Founder
 * - Social Entrepreneur
 * - Community Builder
 * - Creator Founder
 * 
 * Also identifies hybrid types and provides co-founder recommendations.
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderTypeV2,
  FounderDimensionV2,
  DimensionScoreV2,
  FounderTypeFitV2,
  FounderTypeClassificationV2,
  FOUNDER_TYPE_DIMENSION_MAP,
  getFounderTypeLabelV2,
  getFounderTypeDescriptionV2,
  FounderEvidenceV2,
  FounderAnalysisInputV2,
} from './types';

/**
 * Configuration for founder classification.
 */
export interface FounderClassificationConfigV2 {
  /** Minimum fit score to consider a type */
  minFitThreshold: number;
  
  /** Threshold for primary type classification */
  primaryTypeThreshold: number;
  
  /** Gap required for clear classification vs ambiguous */
  clearClassificationGap: number;
  
  /** Weight for primary dimension scores */
  primaryDimensionWeight: number;
  
  /** Weight for secondary dimension scores */
  secondaryDimensionWeight: number;
  
  /** Weight for evidence match */
  evidenceWeight: number;
  
  /** Threshold for hybrid type detection */
  hybridThreshold: number;
}

/**
 * Default classification configuration.
 */
export const DEFAULT_CLASSIFICATION_CONFIG: FounderClassificationConfigV2 = {
  minFitThreshold: 0.4,
  primaryTypeThreshold: 0.6,
  clearClassificationGap: 0.15,
  primaryDimensionWeight: 0.6,
  secondaryDimensionWeight: 0.3,
  evidenceWeight: 0.1,
  hybridThreshold: 0.55,
};

/**
 * Type indicators from text patterns.
 */
const TYPE_TEXT_INDICATORS: Record<FounderTypeV2, { patterns: RegExp[]; weight: number }[]> = {
  [FounderTypeV2.TECHNICAL_FOUNDER]: [
    { patterns: [/engineer|engineering|coding|programming/i, /technical|tech|developer/i], weight: 0.8 },
    { patterns: [/built.*myself|wrote.*code|architecture/i], weight: 0.9 },
    { patterns: [/github|open.source|stack/i], weight: 0.6 },
  ],
  [FounderTypeV2.PRODUCT_FOUNDER]: [
    { patterns: [/product|ux|user.experience|design/i], weight: 0.8 },
    { patterns: [/user.research|product.market.fit|customer.interview/i], weight: 0.9 },
    { patterns: [/wireframe|prototype|figma|sketch/i], weight: 0.7 },
  ],
  [FounderTypeV2.BUSINESS_FOUNDER]: [
    { patterns: [/business.development|partnerships|sales/i], weight: 0.8 },
    { patterns: [/mba|business.school|strategy/i], weight: 0.7 },
    { patterns: [/revenue|growth|market.expansion/i], weight: 0.85 },
  ],
  [FounderTypeV2.VISIONARY_FOUNDER]: [
    { patterns: [/vision|category|industry.changing/i], weight: 0.85 },
    { patterns: [/disrupt|transform|revolutionize/i], weight: 0.8 },
    { patterns: [/moonshot|10x|massive.impact/i], weight: 0.9 },
  ],
  [FounderTypeV2.SOCIAL_ENTREPRENEUR]: [
    { patterns: [/social.impact|mission.driven|purpose/i], weight: 0.9 },
    { patterns: [/nonprofit|ngo|social.enterprise/i], weight: 0.85 },
    { patterns: [/helping|community.impact|social.good/i], weight: 0.75 },
  ],
  [FounderTypeV2.COMMUNITY_BUILDER]: [
    { patterns: [/community|network.effects|platform/i], weight: 0.85 },
    { patterns: [/forum|marketplace|two.sided/i], weight: 0.8 },
    { patterns: [/engagement|members|users/i], weight: 0.7 },
  ],
  [FounderTypeV2.CREATOR_FOUNDER]: [
    { patterns: [/content|media|creator|audience/i], weight: 0.85 },
    { patterns: [/youtube|podcast|newsletter|blog/i], weight: 0.8 },
    { patterns: [/personal.brand|influencer|thought.leader/i], weight: 0.75 },
  ],
};

/**
 * Archetype examples for each founder type.
 */
const FOUNDER_ARCHETYPE_EXAMPLES: Record<FounderTypeV2, string[]> = {
  [FounderTypeV2.TECHNICAL_FOUNDER]: [
    'Mark Zuckerberg (Meta)',
    'Bill Gates (Microsoft)',
    'Patrick Collison (Stripe)',
    'Jensen Huang (NVIDIA)',
  ],
  [FounderTypeV2.PRODUCT_FOUNDER]: [
    'Steve Jobs (Apple)',
    'Brian Chesky (Airbnb)',
    'Chad Hurley (YouTube)',
    'Evan Spiegel (Snap)',
  ],
  [FounderTypeV2.BUSINESS_FOUNDER]: [
    'Travis Kalanick (Uber)',
    'Sara Blakely (Spanx)',
    'Howard Schultz (Starbucks)',
    'Whitney Wolfe Herd (Bumble)',
  ],
  [FounderTypeV2.VISIONARY_FOUNDER]: [
    'Elon Musk (Tesla/SpaceX)',
    'Jeff Bezos (Amazon)',
    'Larry Ellison (Oracle)',
    'Richard Branson (Virgin)',
  ],
  [FounderTypeV2.SOCIAL_ENTREPRENEUR]: [
    'Muhammad Yunus (Grameen)',
    'Jacqueline Novogratz (Acumen)',
    'Jeff Skoll (eBay/Skoll Foundation)',
    'Blake Mycoskie (TOMS)',
  ],
  [FounderTypeV2.COMMUNITY_BUILDER]: [
    'Steve Huffman (Reddit)',
    'Alexis Ohanian (Reddit)',
    'Craig Newmark (Craigslist)',
    'Ev Williams (Twitter/Medium)',
  ],
  [FounderTypeV2.CREATOR_FOUNDER]: [
    'PewDiePie (early YouTube)',
    'Joe Rogan (podcast empire)',
    'Ben Thompson (Stratechery)',
    'Tim Ferriss (media empire)',
  ],
};

/**
 * Recommended co-founder types for each founder type.
 */
const CO_FOUNDER_RECOMMENDATIONS: Record<FounderTypeV2, FounderTypeV2[]> = {
  [FounderTypeV2.TECHNICAL_FOUNDER]: [
    FounderTypeV2.BUSINESS_FOUNDER,
    FounderTypeV2.PRODUCT_FOUNDER,
    FounderTypeV2.VISIONARY_FOUNDER,
  ],
  [FounderTypeV2.PRODUCT_FOUNDER]: [
    FounderTypeV2.TECHNICAL_FOUNDER,
    FounderTypeV2.BUSINESS_FOUNDER,
  ],
  [FounderTypeV2.BUSINESS_FOUNDER]: [
    FounderTypeV2.TECHNICAL_FOUNDER,
    FounderTypeV2.PRODUCT_FOUNDER,
    FounderTypeV2.VISIONARY_FOUNDER,
  ],
  [FounderTypeV2.VISIONARY_FOUNDER]: [
    FounderTypeV2.TECHNICAL_FOUNDER,
    FounderTypeV2.BUSINESS_FOUNDER,
    FounderTypeV2.PRODUCT_FOUNDER,
  ],
  [FounderTypeV2.SOCIAL_ENTREPRENEUR]: [
    FounderTypeV2.BUSINESS_FOUNDER,
    FounderTypeV2.COMMUNITY_BUILDER,
  ],
  [FounderTypeV2.COMMUNITY_BUILDER]: [
    FounderTypeV2.TECHNICAL_FOUNDER,
    FounderTypeV2.BUSINESS_FOUNDER,
  ],
  [FounderTypeV2.CREATOR_FOUNDER]: [
    FounderTypeV2.BUSINESS_FOUNDER,
    FounderTypeV2.PRODUCT_FOUNDER,
  ],
};

/**
 * Founder Classification Engine V2
 * 
 * Classifies founders into types based on dimension scores and evidence.
 */
export class FounderClassificationEngineV2 {
  private config: FounderClassificationConfigV2;
  
  constructor(config: Partial<FounderClassificationConfigV2> = {}) {
    this.config = { ...DEFAULT_CLASSIFICATION_CONFIG, ...config };
  }
  
  /**
   * Classify founder type based on dimension scores and input.
   * 
   * @param dimensionScores - All 8 dimension scores
   * @param input - Original analysis input
   * @returns Type classification result
   */
  classify(
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): FounderTypeClassificationV2 {
    // Calculate fit for each founder type
    const typeFits = this.calculateAllTypeFits(dimensionScores, input);
    
    // Sort by fit score
    const sortedFits = [...typeFits].sort((a, b) => b.fitScore - a.fitScore);
    
    // Determine primary type
    const primaryTypeFit = sortedFits[0];
    const secondaryTypeFit = sortedFits[1];
    
    // Determine if classification is clear
    const classificationGap = primaryTypeFit.fitScore - (secondaryTypeFit?.fitScore ?? 0);
    const isClearClassification = primaryTypeFit.fitScore >= this.config.primaryTypeThreshold &&
      classificationGap >= this.config.clearClassificationGap;
    
    // Identify hybrid indicators
    const hybridIndicators = this.identifyHybridTypes(sortedFits);
    
    // Get secondary types (above threshold but not primary)
    const secondaryTypes = sortedFits.slice(1).filter(t => t.fitScore >= this.config.minFitThreshold);
    
    // Generate classification explanation
    const classificationExplanation = this.generateClassificationExplanation(
      primaryTypeFit,
      secondaryTypeFit,
      isClearClassification,
      hybridIndicators
    );
    
    return {
      primaryType: primaryTypeFit.fitScore >= this.config.minFitThreshold ? primaryTypeFit.type : null,
      primaryConfidence: primaryTypeFit.confidence,
      secondaryTypes,
      allTypes: sortedFits,
      isClearClassification,
      ambiguityReason: !isClearClassification ? this.getAmbiguityReason(primaryTypeFit, secondaryTypeFit) : undefined,
      classificationExplanation,
      hybridIndicators: hybridIndicators.length > 0 ? hybridIndicators : undefined,
    };
  }
  
  /**
   * Calculate fit for all founder types.
   */
  private calculateAllTypeFits(
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): FounderTypeFitV2[] {
    const fits: FounderTypeFitV2[] = [];
    
    for (const type of Object.values(FounderTypeV2)) {
      const fit = this.calculateTypeFit(type, dimensionScores, input);
      fits.push(fit);
    }
    
    return fits;
  }
  
  /**
   * Calculate fit for a specific founder type.
   */
  private calculateTypeFit(
    type: FounderTypeV2,
    dimensionScores: DimensionScoreV2[],
    input: FounderAnalysisInputV2
  ): FounderTypeFitV2 {
    const dimensionMap = new Map(dimensionScores.map(d => [d.dimension, d]));
    const typeDimensions = FOUNDER_TYPE_DIMENSION_MAP[type];
    
    // Calculate primary dimension score
    const primaryScores = typeDimensions.primary.map(d => dimensionMap.get(d)?.score ?? 0);
    const primaryAvg = primaryScores.reduce((a, b) => a + b, 0) / primaryScores.length;
    
    // Calculate secondary dimension score
    const secondaryScores = typeDimensions.secondary.map(d => dimensionMap.get(d)?.score ?? 0);
    const secondaryAvg = secondaryScores.length > 0
      ? secondaryScores.reduce((a, b) => a + b, 0) / secondaryScores.length
      : 0;
    
    // Calculate text evidence score
    const textEvidenceScore = this.calculateTextEvidenceScore(type, input);
    
    // Calculate weighted fit score
    const fitScore = 
      primaryAvg * this.config.primaryDimensionWeight +
      secondaryAvg * this.config.secondaryDimensionWeight +
      textEvidenceScore * this.config.evidenceWeight;
    
    // Calculate confidence
    const primaryConfidence = typeDimensions.primary.map(d => dimensionMap.get(d)?.confidence ?? 0);
    const avgConfidence = primaryConfidence.reduce((a, b) => a + b, 0) / primaryConfidence.length;
    
    // Identify skill gaps
    const skillGaps = typeDimensions.primary.filter(d => (dimensionMap.get(d)?.score ?? 0) < 0.5);
    
    return {
      type,
      fitScore,
      confidence: avgConfidence,
      relevantDimensions: [...typeDimensions.primary, ...typeDimensions.secondary],
      relevantDimensionScore: (primaryAvg + secondaryAvg) / 2,
      explanation: this.generateTypeExplanation(type, primaryAvg, secondaryAvg, textEvidenceScore),
      archetypeExamples: FOUNDER_ARCHETYPE_EXAMPLES[type],
      isRecommended: false, // Set later
      skillGaps,
      recommendedCoFounderTypes: CO_FOUNDER_RECOMMENDATIONS[type],
    };
  }
  
  /**
   * Calculate text evidence score for a type.
   */
  private calculateTextEvidenceScore(type: FounderTypeV2, input: FounderAnalysisInputV2): number {
    const indicators = TYPE_TEXT_INDICATORS[type];
    const textSources = this.getTextSources(input);
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const { text } of textSources) {
      const lowerText = text.toLowerCase();
      
      for (const indicator of indicators) {
        let matchCount = 0;
        for (const pattern of indicator.patterns) {
          if (pattern.test(lowerText)) {
            matchCount++;
          }
        }
        
        if (matchCount > 0) {
          totalScore += Math.min(matchCount / indicator.patterns.length, 1) * indicator.weight;
          totalWeight += indicator.weight;
        }
      }
    }
    
    return totalWeight > 0 ? Math.min(totalScore / totalWeight, 1) : 0;
  }
  
  /**
   * Generate explanation for type fit.
   */
  private generateTypeExplanation(
    type: FounderTypeV2,
    primaryAvg: number,
    secondaryAvg: number,
    textScore: number
  ): string {
    const typeLabel = getFounderTypeLabelV2(type);
    const typeDesc = getFounderTypeDescriptionV2(type);
    
    let explanation = `${typeLabel} fit based on `;
    
    if (primaryAvg >= 0.6) {
      explanation += `strong primary dimensions (${(primaryAvg * 100).toFixed(0)}%)`;
    } else if (primaryAvg >= 0.4) {
      explanation += `moderate primary dimensions (${(primaryAvg * 100).toFixed(0)}%)`;
    } else {
      explanation += `weak primary dimensions (${(primaryAvg * 100).toFixed(0)}%)`;
    }
    
    if (secondaryAvg >= 0.5) {
      explanation += ` with supporting secondary strengths`;
    }
    
    if (textScore >= 0.5) {
      explanation += ` and explicit indicators in responses`;
    }
    
    explanation += `. ${typeDesc}`;
    
    return explanation;
  }
  
  /**
   * Identify potential hybrid types.
   */
  private identifyHybridTypes(sortedFits: FounderTypeFitV2[]): FounderTypeV2[] {
    const hybrids: FounderTypeV2[] = [];
    
    // Check for types that are close to the primary
    if (sortedFits.length >= 2) {
      const primary = sortedFits[0];
      
      for (let i = 1; i < sortedFits.length; i++) {
        const fit = sortedFits[i];
        if (fit.fitScore >= this.config.hybridThreshold &&
            primary.fitScore - fit.fitScore < this.config.clearClassificationGap) {
          hybrids.push(fit.type);
        }
      }
    }
    
    return hybrids;
  }
  
  /**
   * Get reason for classification ambiguity.
   */
  private getAmbiguityReason(
    primary: FounderTypeFitV2,
    secondary?: FounderTypeFitV2
  ): string {
    if (primary.fitScore < this.config.primaryTypeThreshold) {
      return `No founder type exceeds the classification threshold (${(this.config.primaryTypeThreshold * 100).toFixed(0)}%). Your profile is still developing.`;
    }
    
    if (secondary && primary.fitScore - secondary.fitScore < this.config.clearClassificationGap) {
      return `Close scores between ${getFounderTypeLabelV2(primary.type)} and ${getFounderTypeLabelV2(secondary.type)} indicate hybrid potential or need for more data.`;
    }
    
    return 'Profile shows characteristics of multiple founder types.';
  }
  
  /**
   * Generate classification explanation.
   */
  private generateClassificationExplanation(
    primary: FounderTypeFitV2,
    secondary: FounderTypeFitV2 | undefined,
    isClear: boolean,
    hybrids: FounderTypeV2[]
  ): string {
    if (!isClear) {
      if (primary.fitScore < this.config.minFitThreshold) {
        return 'Your profile does not clearly align with any specific founder type yet. This suggests you are still developing your entrepreneurial identity or have a unique hybrid profile.';
      }
      
      let explanation = `Your profile shows characteristics of ${getFounderTypeLabelV2(primary.type)}`;
      
      if (secondary && secondary.fitScore >= this.config.minFitThreshold) {
        explanation += ` with strong elements of ${getFounderTypeLabelV2(secondary.type)}`;
      }
      
      explanation += '. As you gain more experience, your type will likely become clearer.';
      
      return explanation;
    }
    
    let explanation = `You show clear indicators of a ${getFounderTypeLabelV2(primary.type)} profile. `;
    explanation += `Your strongest dimensions align with this type: ${primary.relevantDimensions.slice(0, 3).map(d => d.replace(/_/g, ' ').toLowerCase()).join(', ')}. `;
    
    if (primary.skillGaps.length > 0) {
      explanation += `Consider developing these areas: ${primary.skillGaps.slice(0, 2).map(d => d.replace(/_/g, ' ').toLowerCase()).join(', ')}. `;
    }
    
    explanation += `Best co-founder matches: ${primary.recommendedCoFounderTypes.slice(0, 2).map(t => getFounderTypeLabelV2(t)).join(' or ')}.`;
    
    return explanation;
  }
  
  /**
   * Get text sources from input.
   */
  private getTextSources(input: FounderAnalysisInputV2): { text: string }[] {
    const sources: { text: string }[] = [];
    
    if (input.userInput) {
      sources.push({ text: input.userInput });
    }
    
    if (input.explicitStatements) {
      input.explicitStatements.forEach(stmt => sources.push({ text: stmt }));
    }
    
    if (input.experienceDescriptions) {
      input.experienceDescriptions.forEach(desc => sources.push({ text: desc }));
    }
    
    return sources;
  }
  
  /**
   * Find best co-founder match for a given type.
   */
  findBestCoFounderMatch(
    type: FounderTypeV2,
    availableTypes: FounderTypeFitV2[]
  ): FounderTypeFitV2 | undefined {
    const recommended = CO_FOUNDER_RECOMMENDATIONS[type];
    
    for (const recType of recommended) {
      const match = availableTypes.find(t => t.type === recType && t.fitScore >= this.config.minFitThreshold);
      if (match) return match;
    }
    
    return undefined;
  }
  
  /**
   * Check if type combination is complementary.
   */
  isComplementary(type1: FounderTypeV2, type2: FounderTypeV2): boolean {
    const recommendations = CO_FOUNDER_RECOMMENDATIONS[type1];
    return recommendations.includes(type2);
  }
  
  /**
   * Get type recommendations for skill development.
   */
  getSkillDevelopmentRecommendation(
    type: FounderTypeV2,
    skillGaps: FounderDimensionV2[]
  ): { dimension: FounderDimensionV2; priority: 'critical' | 'high' | 'medium' }[] {
    const typeDimensions = FOUNDER_TYPE_DIMENSION_MAP[type];
    const recommendations: { dimension: FounderDimensionV2; priority: 'critical' | 'high' | 'medium' }[] = [];
    
    for (const gap of skillGaps) {
      if (typeDimensions.primary.includes(gap)) {
        recommendations.push({ dimension: gap, priority: 'critical' });
      } else if (typeDimensions.secondary.includes(gap)) {
        recommendations.push({ dimension: gap, priority: 'high' });
      } else {
        recommendations.push({ dimension: gap, priority: 'medium' });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<FounderClassificationConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating classification engine.
 */
export function createFounderClassificationEngineV2(
  config?: Partial<FounderClassificationConfigV2>
): FounderClassificationEngineV2 {
  return new FounderClassificationEngineV2(config);
}
