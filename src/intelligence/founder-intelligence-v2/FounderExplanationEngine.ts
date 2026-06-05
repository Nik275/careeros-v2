/**
 * Founder Intelligence V2 - Explanation Engine
 * 
 * Generates human-readable narratives about founder potential.
 * Creates comprehensive, nuanced explanations that capture:
 * - Overall potential assessment
 * - Type classification insights
 * - Strengths and development areas
 * - False positive warnings
 * - Comparative assessments
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderPotentialAnalysisV2,
  FounderNarrativeV2,
  DimensionScoreV2,
  FounderTypeV2,
  FounderReadinessV2,
  FounderDimensionV2,
  getDimensionLabelV2,
  getFounderTypeLabelV2,
  getReadinessLabelV2,
  getReadinessDescriptionV2,
  NonFounderProfileDetectionV2,
} from './types';

/**
 * Configuration for explanation engine.
 */
export interface ExplanationConfigV2 {
  /** Verbosity level */
  verbosity: 'minimal' | 'standard' | 'detailed';
  
  /** Include false positive warnings */
  includeWarnings: boolean;
  
  /** Include comparative assessment */
  includeComparisons: boolean;
  
  /** Max length for summary */
  maxSummaryLength: number;
}

/**
 * Default explanation configuration.
 */
export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfigV2 = {
  verbosity: 'detailed',
  includeWarnings: true,
  includeComparisons: true,
  maxSummaryLength: 150,
};

/**
 * Explanation Engine V2
 */
export class FounderExplanationEngineV2 {
  private config: ExplanationConfigV2;
  
  constructor(config: Partial<ExplanationConfigV2> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }
  
  /**
   * Generate complete narrative for founder analysis.
   */
  generateNarrative(analysis: FounderPotentialAnalysisV2): FounderNarrativeV2 {
    return {
      summary: this.generateSummary(analysis),
      potentialDescription: this.generatePotentialDescription(analysis),
      typeDescription: analysis.primaryFounderType 
        ? this.generateTypeDescription(analysis.primaryFounderType, analysis.typeClassification)
        : undefined,
      readinessExplanation: this.generateReadinessExplanation(analysis.readiness, analysis.dimensions),
      keyInsight: this.generateKeyInsight(analysis),
      falsePositiveWarning: this.config.includeWarnings && analysis.isFalsePositiveRisk
        ? this.generateFalsePositiveWarning(analysis.nonFounderProfiles)
        : undefined,
      comparativeAssessment: this.config.includeComparisons
        ? this.generateComparativeAssessment(analysis)
        : '',
      strengthsParagraph: this.generateStrengthsParagraph(analysis.strengths),
      developmentParagraph: this.generateDevelopmentParagraph(analysis.developmentAreas, analysis.criticalGaps),
    };
  }
  
  /**
   * Generate one-sentence summary.
   */
  private generateSummary(analysis: FounderPotentialAnalysisV2): string {
    const potential = analysis.overallPotential;
    const readiness = analysis.readiness;
    const type = analysis.primaryFounderType;
    const isBlocked = analysis.isClassificationBlocked;
    
    let summary = '';
    
    if (isBlocked && analysis.nonFounderProfiles.length > 0) {
      const profile = analysis.nonFounderProfiles[0].profile;
      summary = `Your profile shows strong indicators of a ${profile.toLowerCase().replace(/_/g, ' ')} pattern rather than founder potential.`;
    } else if (potential >= 0.7) {
      summary = `You demonstrate strong founder potential with a ${this.getReadinessDescription(readiness).toLowerCase()} profile`;
      if (type) {
        summary += `, particularly suited as a ${getFounderTypeLabelV2(type).toLowerCase()}`;
      }
      summary += '.';
    } else if (potential >= 0.5) {
      summary = `You show moderate founder potential with ${this.getReadinessDescription(readiness).toLowerCase()} characteristics`;
      if (type) {
        summary += `, showing tendencies toward ${getFounderTypeLabelV2(type).toLowerCase()} roles`;
      }
      summary += '.';
    } else {
      summary = `Your profile suggests early-stage founder development with significant growth areas to address.`;
    }
    
    return summary.substring(0, this.config.maxSummaryLength);
  }
  
  /**
   * Generate detailed potential description.
   */
  private generatePotentialDescription(analysis: FounderPotentialAnalysisV2): string {
    const potential = analysis.overallPotential;
    const confidence = analysis.confidence;
    const dimensionCount = analysis.dimensions.filter(d => d.isStrength).length;
    
    let description = '';
    
    // Opening assessment
    if (potential >= 0.75) {
      description += 'Your founder potential assessment places you in the top tier of aspiring entrepreneurs. ';
    } else if (potential >= 0.6) {
      description += 'You demonstrate solid founder potential with several key strengths. ';
    } else if (potential >= 0.45) {
      description += 'You show emerging founder potential with both strengths and development areas. ';
    } else {
      description += 'Your founder potential is still developing, with significant opportunities for growth. ';
    }
    
    // Confidence statement
    if (confidence >= 0.7) {
      description += `This assessment is based on ${analysis.inputSummary.evidenceCount} pieces of evidence across multiple sources, giving us high confidence in these findings. `;
    } else if (confidence >= 0.5) {
      description += `This preliminary assessment is based on available evidence, though additional information would strengthen confidence. `;
    } else {
      description += `This early assessment has limited confidence due to minimal available evidence. More data would improve accuracy. `;
    }
    
    // Dimension summary
    description += `You demonstrate strengths in ${dimensionCount} of 8 core founder dimensions, `;
    
    if (dimensionCount >= 5) {
      description += 'suggesting a well-rounded entrepreneurial profile. ';
    } else if (dimensionCount >= 3) {
      description += 'indicating solid foundations with room for development. ';
    } else {
      description += 'highlighting the need for focused skill development. ';
    }
    
    // Risk-adjusted potential
    const riskAdjusted = analysis.riskProfile.riskAdjustedPotential;
    if (riskAdjusted < potential * 0.8) {
      description += `When accounting for identified risk factors, your risk-adjusted potential is ${(riskAdjusted * 100).toFixed(0)}%. Addressing these risks could unlock your full potential.`;
    }
    
    return description;
  }
  
  /**
   * Generate type description.
   */
  private generateTypeDescription(
    type: FounderTypeV2,
    classification: FounderPotentialAnalysisV2['typeClassification']
  ): string {
    let description = `Your profile aligns most closely with the ${getFounderTypeLabelV2(type)} archetype. `;
    
    const typeFit = classification.allTypes.find(t => t.type === type);
    if (typeFit) {
      description += `This classification is based on strong performance in `;
      description += typeFit.relevantDimensions.slice(0, 3).map(d => getDimensionLabelV2(d).toLowerCase()).join(', ');
      description += '. ';
      
      if (typeFit.skillGaps.length > 0) {
        description += `To fully realize this founder type, focus on developing ${typeFit.skillGaps.slice(0, 2).map(d => getDimensionLabelV2(d).toLowerCase()).join(' and ')}. `;
      }
      
      description += `Successful founders of this type include ${typeFit.archetypeExamples.slice(0, 3).join(', ')}. `;
      
      description += `You would benefit most from partnering with a ${typeFit.recommendedCoFounderTypes.slice(0, 2).map(t => getFounderTypeLabelV2(t).toLowerCase()).join(' or ')} co-founder.`;
    }
    
    return description;
  }
  
  /**
   * Generate readiness explanation.
   */
  private generateReadinessExplanation(
    readiness: FounderReadinessV2,
    dimensions: DimensionScoreV2[]
  ): string {
    let explanation = getReadinessDescriptionV2(readiness) + '. ';
    
    const strongDimensions = dimensions.filter(d => d.isStrength).length;
    const criticalGaps = dimensions.filter(d => d.score < 0.3).length;
    
    switch (readiness) {
      case FounderReadinessV2.HIGH_POTENTIAL:
        explanation += `With ${strongDimensions} strong dimensions and minimal critical gaps, you possess the core capabilities needed for entrepreneurial success. `;
        explanation += 'Your focus should be on market timing and idea validation rather than capability building.';
        break;
        
      case FounderReadinessV2.READY:
        explanation += `You have ${strongDimensions} developed dimensions, providing a solid foundation for starting. `;
        if (criticalGaps > 0) {
          explanation += `Address ${criticalGaps} critical gaps before launching, or find a co-founder who complements these areas.`;
        } else {
          explanation += 'Your well-rounded profile suggests you could succeed as a solo founder or with a complementary partner.';
        }
        break;
        
      case FounderReadinessV2.EMERGING:
        explanation += `Your profile shows ${strongDimensions} emerging strengths with ${criticalGaps} critical areas needing development. `;
        explanation += 'Focus on building specific skills through deliberate practice and side projects before committing to full-time entrepreneurship.';
        break;
        
      case FounderReadinessV2.EARLY:
        explanation += `As an early-stage aspiring founder with ${strongDimensions} developed dimensions, your priority should be learning and skill acquisition. `;
        explanation += 'Consider working at a startup to gain experience while building your capabilities.';
        break;
    }
    
    return explanation;
  }
  
  /**
   * Generate key insight.
   */
  private generateKeyInsight(analysis: FounderPotentialAnalysisV2): string {
    const insights: string[] = [];
    
    // Top strength insight
    if (analysis.strengths.length > 0) {
      const topStrength = analysis.strengths[0];
      insights.push(`Your strongest asset is ${getDimensionLabelV2(topStrength.dimension).toLowerCase()}, which puts you ahead of many aspiring founders.`);
    }
    
    // False positive insight
    if (analysis.isFalsePositiveRisk && analysis.nonFounderProfiles.length > 0) {
      const topProfile = analysis.nonFounderProfiles[0];
      insights.push(`However, your profile shows indicators more consistent with ${topProfile.profile.toLowerCase().replace(/_/g, ' ')} patterns than founder potential.`);
    }
    
    // Risk insight
    if (analysis.riskProfile.topRisks.length > 0) {
      const topRisk = analysis.riskProfile.topRisks[0];
      insights.push(`Your highest priority should be addressing ${topRisk.factor.toLowerCase().replace(/_/g, ' ')} to increase your success probability.`);
    }
    
    // Market fit insight
    if (analysis.marketFit.bestSectors.length > 0) {
      const topSector = analysis.marketFit.bestSectors[0];
      insights.push(`You are best suited for the ${topSector.sector} sector based on your strengths.`);
    }
    
    // Co-founder insight
    if (analysis.marketFit.coFounderNeeds.needed) {
      insights.push(`Finding a complementary co-founder should be a priority given your skill gaps.`);
    }
    
    // Select most important insight
    if (analysis.isFalsePositiveRisk) {
      return insights.find(i => i.includes('However')) || insights[0];
    }
    
    if (analysis.riskProfile.topRisks.length > 0 && analysis.riskProfile.topRisks[0].level === 'CRITICAL') {
      return insights.find(i => i.includes('priority')) || insights[0];
    }
    
    return insights[0] || 'Continue developing your entrepreneurial capabilities through deliberate practice.';
  }
  
  /**
   * Generate false positive warning.
   */
  private generateFalsePositiveWarning(detections: NonFounderProfileDetectionV2[]): string {
    if (detections.length === 0) return '';
    
    const topDetection = detections[0];
    const profile = topDetection.profile.toLowerCase().replace(/_/g, ' ');
    
    let warning = `Warning: Strong ${profile} indicators detected. `;
    warning += topDetection.distinctionExplanation + ' ';
    
    if (topDetection.blocksClassification) {
      warning += 'These patterns significantly reduce confidence in founder potential classification.';
    } else {
      warning += 'While not definitive, these patterns suggest you should carefully consider whether entrepreneurship aligns with your true interests.';
    }
    
    return warning;
  }
  
  /**
   * Generate comparative assessment.
   */
  private generateComparativeAssessment(analysis: FounderPotentialAnalysisV2): string {
    const potential = analysis.overallPotential;
    const avgDimensionScore = analysis.dimensions.reduce((sum, d) => sum + d.score, 0) / analysis.dimensions.length;
    
    let comparison = '';
    
    if (potential >= 0.75) {
      comparison = 'Your founder potential places you in the top 20% of aspiring entrepreneurs we assess. ';
      comparison += 'You possess a rare combination of capabilities that predict entrepreneurial success.';
    } else if (potential >= 0.6) {
      comparison = 'Your founder potential is above average compared to aspiring entrepreneurs. ';
      comparison += 'You have solid foundations that many successful founders started with.';
    } else if (potential >= 0.45) {
      comparison = 'Your founder potential is in line with many early-stage aspiring founders. ';
      comparison += 'With focused development, you could join the ranks of successful entrepreneurs.';
    } else {
      comparison = 'Your founder potential is still developing compared to typical aspiring entrepreneurs. ';
      comparison += 'This is normal for early-stage exploration and can improve significantly with deliberate practice.';
    }
    
    // Add dimension-specific comparisons
    const topDimension = analysis.strengths[0];
    if (topDimension && topDimension.score > 0.7) {
      comparison += ` Your ${getDimensionLabelV2(topDimension.dimension).toLowerCase()} particularly stands out as a competitive advantage.`;
    }
    
    return comparison;
  }
  
  /**
   * Generate strengths paragraph.
   */
  private generateStrengthsParagraph(strengths: DimensionScoreV2[]): string {
    if (strengths.length === 0) {
      return 'No clear strengths have emerged from the current assessment. This is common in early-stage founder development.';
    }
    
    let paragraph = `Your founder profile is anchored by ${strengths.length > 1 ? 'several key strengths' : 'a key strength'}: `;
    
    const strengthDescriptions = strengths.slice(0, 4).map(s => {
      let desc = `${getDimensionLabelV2(s.dimension)} (${(s.score * 100).toFixed(0)}%)`;
      
      // Add evidence count if detailed
      if (this.config.verbosity === 'detailed' && s.evidenceCount > 0) {
        desc += ` supported by ${s.evidenceCount} indicators`;
      }
      
      return desc;
    });
    
    paragraph += strengthDescriptions.join(', ') + '. ';
    
    // Add interpretation
    const topStrength = strengths[0];
    paragraph += `Your strongest capability in ${getDimensionLabelV2(topStrength.dimension).toLowerCase()} `;
    
    if (topStrength.dimension === FounderDimensionV2.OWNERSHIP_ORIENTATION) {
      paragraph += 'is particularly valuable as it distinguishes true founders from those who prefer employment.';
    } else if (topStrength.dimension === FounderDimensionV2.RESILIENCE) {
      paragraph += 'will serve you well through the inevitable setbacks of startup life.';
    } else if (topStrength.dimension === FounderDimensionV2.OBSESSION_CAPACITY) {
      paragraph += 'suggests you have the staying power needed for multi-year ventures.';
    } else if (topStrength.dimension === FounderDimensionV2.RESOURCEFULNESS) {
      paragraph += 'enables you to make progress even when resources are scarce.';
    } else {
      paragraph += 'provides a strong foundation for entrepreneurial success.';
    }
    
    return paragraph;
  }
  
  /**
   * Generate development paragraph.
   */
  private generateDevelopmentParagraph(
    developmentAreas: DimensionScoreV2[],
    criticalGaps: FounderDimensionV2[]
  ): string {
    if (developmentAreas.length === 0) {
      return 'Your profile shows no significant development areas. Maintain your strengths while continuing to grow.';
    }
    
    let paragraph = '';
    
    if (criticalGaps.length > 0) {
      paragraph += `Critical priority: Address ${criticalGaps.length === 1 ? 'the gap' : 'gaps'} in ${criticalGaps.map(d => getDimensionLabelV2(d).toLowerCase()).join(' and ')}. `;
      paragraph += `These are foundational capabilities for founder success. `;
    }
    
    if (developmentAreas.length > criticalGaps.length) {
      const nonCriticalAreas = developmentAreas
        .filter(d => !criticalGaps.includes(d.dimension))
        .slice(0, 3);
      
      if (nonCriticalAreas.length > 0) {
        paragraph += `Additional development areas include ${nonCriticalAreas.map(d => getDimensionLabelV2(d.dimension).toLowerCase()).join(', ')}. `;
      }
    }
    
    paragraph += 'Focus your development efforts on these areas through deliberate practice, side projects, and learning experiences.';
    
    return paragraph;
  }
  
  /**
   * Helper to get readability description.
   */
  private getReadinessDescription(readiness: FounderReadinessV2): string {
    const descriptions: Record<FounderReadinessV2, string> = {
      [FounderReadinessV2.EARLY]: 'Early-stage',
      [FounderReadinessV2.EMERGING]: 'Emerging',
      [FounderReadinessV2.READY]: 'Ready',
      [FounderReadinessV2.HIGH_POTENTIAL]: 'High-potential',
    };
    return descriptions[readiness] || readiness;
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ExplanationConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating explanation engine.
 */
export function createFounderExplanationEngineV2(
  config?: Partial<ExplanationConfigV2>
): FounderExplanationEngineV2 {
  return new FounderExplanationEngineV2(config);
}
