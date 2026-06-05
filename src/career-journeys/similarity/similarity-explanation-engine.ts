/**
 * Similarity Explanation Engine
 * 
 * Generates human-readable explanations of why a career journey is relevant
 * to a student. Creates narratives, highlights key similarities/differences,
 * and provides actionable takeaways.
 * 
 * @module SimilarityExplanationEngine
 */

import {
  JourneySimilarityResult,
  SimilarityExplanation,
  SimilarityFactor,
  Difference,
  DimensionSimilarity,
  SimilarityDimension,
  SimilarityLevel,
  RelevanceLevel,
  ExplanationTemplate,
  StudentProfileSnapshot,
} from './journey-similarity-types';

import { CareerJourney, CareerPosition, EducationMilestone } from '../career-journey-types';

/**
 * Similarity Explanation Engine
 * 
 * Generates natural language explanations of similarity results,
 * helping students understand why a particular journey is relevant to them.
 */
export class SimilarityExplanationEngine {
  private templates: Map<string, ExplanationTemplate>;

  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * Generate explanation for a similarity result
   */
  generateExplanation(
    result: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot
  ): SimilarityExplanation {
    const relevanceExplanation = this.generateRelevanceExplanation(result, studentProfile);
    const similarityExplanation = this.generateSimilarityExplanation(result);
    const differenceExplanation = this.generateDifferenceExplanation(result);
    const recommendationExplanation = this.generateRecommendationExplanation(result);

    const keySimilarities = this.extractKeySimilarities(result);
    const keyDifferences = this.extractKeyDifferences(result);
    const keyTakeaways = this.generateKeyTakeaways(result);

    const narrative = this.generateNarrative(
      result,
      studentProfile,
      relevanceExplanation,
      similarityExplanation,
      differenceExplanation
    );

    const explanationQuality = this.assessExplanationQuality(
      result,
      keySimilarities,
      keyDifferences
    );

    return {
      resultId: result.id,
      journeyId: result.journeyId,
      relevanceExplanation,
      similarityExplanation,
      differenceExplanation,
      recommendationExplanation,
      keySimilarities,
      keyDifferences,
      keyTakeaways,
      narrative,
      generatedAt: new Date(),
      explanationQuality,
    };
  }

  /**
   * Generate explanations for multiple results
   */
  generateExplanations(
    results: JourneySimilarityResult[],
    studentProfile: StudentProfileSnapshot
  ): SimilarityExplanation[] {
    return results.map(result => this.generateExplanation(result, studentProfile));
  }

  /**
   * Generate comparison explanation between two journeys
   */
  generateComparisonExplanation(
    resultA: JourneySimilarityResult,
    resultB: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot
  ): {
    comparison: string;
    whichIsBetter: 'A' | 'B' | 'DEPENDS';
    reasoning: string;
    recommendation: string;
  } {
    const scoreDiff = resultA.similarityScore - resultB.similarityScore;
    const confidenceDiff = resultA.confidence - resultB.confidence;

    let whichIsBetter: 'A' | 'B' | 'DEPENDS';
    let reasoning: string;

    if (scoreDiff > 0.1 && confidenceDiff >= 0) {
      whichIsBetter = 'A';
      reasoning = `${resultA.journey.careerHistory[0]?.title || 'This journey'} is more similar to your profile with higher confidence.`;
    } else if (scoreDiff < -0.1 && confidenceDiff <= 0) {
      whichIsBetter = 'B';
      reasoning = `${resultB.journey.careerHistory[0]?.title || 'This journey'} is more similar to your profile with higher confidence.`;
    } else {
      whichIsBetter = 'DEPENDS';
      reasoning = 'Both journeys have different strengths. Consider your specific priorities.';
    }

    const comparison = this.buildComparisonText(resultA, resultB);
    const recommendation = this.buildComparisonRecommendation(whichIsBetter, resultA, resultB);

    return {
      comparison,
      whichIsBetter,
      reasoning,
      recommendation,
    };
  }

  /**
   * Generate summary across multiple results
   */
  generateSummary(
    results: JourneySimilarityResult[],
    studentProfile: StudentProfileSnapshot
  ): {
    overview: string;
    keyFindings: string[];
    commonPatterns: string[];
    recommendations: string[];
    nextSteps: string[];
  } {
    const topResult = results[0];
    const highSimilarityCount = results.filter(r => r.similarityScore >= 0.7).length;

    const overview = `Found ${results.length} relevant career journeys based on your profile. ` +
      `${highSimilarityCount} showed high similarity (${highSimilarityCount > 0 ? 'excellent matches available' : 'moderate matches found'}).`;

    const keyFindings = this.identifyKeyFindings(results);
    const commonPatterns = this.identifyCommonPatterns(results);
    const recommendations = this.generateMultiJourneyRecommendations(results);
    const nextSteps = this.generateNextSteps(results, studentProfile);

    return {
      overview,
      keyFindings,
      commonPatterns,
      recommendations,
      nextSteps,
    };
  }

  /**
   * Generate explanation for a specific dimension
   */
  generateDimensionExplanation(
    dimension: SimilarityDimension,
    score: number,
    studentProfile: StudentProfileSnapshot,
    journey: CareerJourney
  ): string {
    const templates: Record<SimilarityDimension, (s: number) => string> = {
      'ARCHETYPE': s => this.archetypeExplanation(s, studentProfile, journey),
      'MOTIVATION': s => this.motivationExplanation(s, studentProfile, journey),
      'CONSTRAINT': s => this.constraintExplanation(s, studentProfile, journey),
      'EDUCATION': s => this.educationExplanation(s, studentProfile, journey),
      'LOCATION': s => this.locationExplanation(s, studentProfile, journey),
      'CAREER_GOAL': s => this.careerGoalExplanation(s, studentProfile, journey),
      'DECISION_CONTEXT': s => this.decisionContextExplanation(s, studentProfile, journey),
      'STARTING_POINT': s => this.startingPointExplanation(s, studentProfile, journey),
      'PERSONALITY_TRAITS': s => `Personality similarity: ${this.scoreToDescription(s)}`,
      'BACKGROUND': s => this.backgroundExplanation(s, studentProfile, journey),
    };

    return templates[dimension]?.(score) || `Similarity in ${dimension}: ${this.scoreToDescription(score)}`;
  }

  /**
   * Register a custom explanation template
   */
  registerTemplate(template: ExplanationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get explanation by template
   */
  getTemplateExplanation(
    templateId: string,
    variables: Record<string, string>,
    result: JourneySimilarityResult
  ): string | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    if (!template.condition(result)) return null;

    let explanation = template.template;
    for (const [key, value] of Object.entries(variables)) {
      explanation = explanation.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return explanation;
  }

  // ============================================================================
  // PRIVATE GENERATION METHODS
  // ============================================================================

  private generateRelevanceExplanation(
    result: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot
  ): string {
    const level = result.similarityLevel;
    const relevance = result.relevanceLevel;

    const explanations: Record<RelevanceLevel, string> = {
      'HIGHLY_RELEVANT': `This journey is highly relevant to you because ${this.getTopSimilarityReason(result)}.`,
      'RELEVANT': `This journey is relevant as ${this.getTopSimilarityReason(result)}.`,
      'SOMEWHAT_RELEVANT': `This journey has some relevance. ${this.getTopSimilarityReason(result)}, though there are notable differences.`,
      'MINIMALLY_RELEVANT': `This journey offers limited relevance. While ${this.getTopSimilarityReason(result)}, significant differences exist.`,
      'NOT_RELEVANT': `This journey is not particularly relevant to your current situation.`,
    };

    return explanations[relevance];
  }

  private generateSimilarityExplanation(result: JourneySimilarityResult): string {
    const topDimensions = result.dimensionScores
      .filter(d => d.score >= 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topDimensions.length === 0) {
      return 'No strong similarities identified in the analyzed dimensions.';
    }

    const dimensionDescriptions = topDimensions.map(d => 
      `${d.dimension.toLowerCase().replace('_', ' ')} (${Math.round(d.score * 100)}% match)`
    );

    return `Strong similarities in: ${this.joinWithAnd(dimensionDescriptions)}.`;
  }

  private generateDifferenceExplanation(result: JourneySimilarityResult): string {
    const majorDifferences = result.differences.filter(d => d.impact === 'MAJOR');
    const moderateDifferences = result.differences.filter(d => d.impact === 'MODERATE');

    if (majorDifferences.length === 0 && moderateDifferences.length === 0) {
      return 'No significant differences identified.';
    }

    const parts: string[] = [];

    if (majorDifferences.length > 0) {
      parts.push(`Major differences in ${this.joinWithAnd(majorDifferences.map(d => d.aspect))} may affect your path.`);
    }

    if (moderateDifferences.length > 0) {
      parts.push(`Moderate differences exist in ${this.joinWithAnd(moderateDifferences.map(d => d.aspect))}.`);
    }

    return parts.join(' ');
  }

  private generateRecommendationExplanation(result: JourneySimilarityResult): string {
    if (result.relevanceLevel === 'HIGHLY_RELEVANT' || result.relevanceLevel === 'RELEVANT') {
      return 'This journey is worth studying closely. The similarities suggest you could follow a comparable path.';
    }

    if (result.relevanceLevel === 'SOMEWHAT_RELEVANT') {
      return 'This journey offers useful insights, but consider the identified differences when applying lessons.';
    }

    return 'This journey provides reference points, but significant differences mean outcomes may vary.';
  }

  private generateNarrative(
    result: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot,
    relevance: string,
    similarity: string,
    differences: string
  ): string {
    const journey = result.journey;
    const currentRole = journey.careerHistory[journey.careerHistory.length - 1];
    const startingPoint = journey.startingPoint;

    let narrative = `This professional started from ${this.describeStartingPoint(startingPoint)}, `;
    narrative += `similar to your situation in ${this.listKeySimilaritiesBrief(result)}. `;
    
    if (currentRole) {
      narrative += `They progressed to become ${currentRole.title} at ${currentRole.organization}. `;
    }

    narrative += relevance + ' ';
    narrative += similarity + ' ';
    
    if (result.differences.length > 0) {
      narrative += differences;
    }

    narrative += ` Overall similarity: ${Math.round(result.similarityScore * 100)}% `;
    narrative += `with ${this.confidenceToDescription(result.confidence)} confidence.`;

    return narrative;
  }

  private extractKeySimilarities(result: JourneySimilarityResult): string[] {
    return result.similarityFactors
      .filter(f => f.impact === 'STRONGLY_POSITIVE' || f.impact === 'POSITIVE')
      .slice(0, 5)
      .map(f => f.description);
  }

  private extractKeyDifferences(result: JourneySimilarityResult): string[] {
    return result.differences
      .filter(d => d.impact === 'MAJOR' || d.impact === 'MODERATE')
      .slice(0, 3)
      .map(d => `${d.aspect}: ${d.studentValue} vs ${d.journeyValue}`);
  }

  private generateKeyTakeaways(result: JourneySimilarityResult): string[] {
    const takeaways: string[] = [];

    // From biggest lesson
    if (result.journey.lessons.length > 0) {
      const sortedLessons = [...result.journey.lessons]
        .sort((a, b) => {
          const importanceOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
          return importanceOrder.indexOf(a.importance) - importanceOrder.indexOf(b.importance);
        });
      
      if (sortedLessons[0]) {
        takeaways.push(`Key lesson: ${sortedLessons[0].lesson}`);
      }
    }

    // From regrets
    if (result.journey.regrets.length > 0) {
      const addressableRegret = result.journey.regrets.find(r => r.addressable);
      if (addressableRegret) {
        takeaways.push(`Avoid: ${addressableRegret.regret}`);
      }
    }

    // From success factors
    if (result.journey.successes.length > 0) {
      const latestSuccess = result.journey.successes[result.journey.successes.length - 1];
      takeaways.push(`Success factor: ${latestSuccess.contributingFactors[0]}`);
    }

    // From differences
    for (const diff of result.differences.slice(0, 2)) {
      if (diff.outcomeImplication) {
        takeaways.push(`Consider: ${diff.outcomeImplication}`);
      }
    }

    return takeaways.slice(0, 5);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getTopSimilarityReason(result: JourneySimilarityResult): string {
    const topFactor = result.similarityFactors[0];
    if (topFactor) {
      return topFactor.description;
    }

    const topDimension = result.dimensionScores.sort((a, b) => b.score - a.score)[0];
    if (topDimension) {
      return `your ${topDimension.dimension.toLowerCase().replace('_', ' ')} closely matches`;
    }

    return 'there are meaningful similarities';
  }

  private listKeySimilaritiesBrief(result: JourneySimilarityResult): string {
    const topDims = result.dimensionScores
      .filter(d => d.score >= 0.7)
      .slice(0, 2)
      .map(d => d.dimension.toLowerCase().replace('_', ' '));

    return topDims.length > 0 ? this.joinWithAnd(topDims) : 'several key aspects';
  }

  private describeStartingPoint(startingPoint: CareerJourney['startingPoint']): string {
    const parts: string[] = [];

    if (startingPoint.location.tier) {
      parts.push(startingPoint.location.tier.toLowerCase().replace('_', ' '));
    }

    if (startingPoint.familyBackground.economicStatus) {
      parts.push(startingPoint.familyBackground.economicStatus.toLowerCase().replace('_', ' '));
    }

    return parts.length > 0 ? parts.join(', ') : 'a similar background';
  }

  private joinWithAnd(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }

  private scoreToDescription(score: number): string {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.8) return 'very strong';
    if (score >= 0.7) return 'strong';
    if (score >= 0.6) return 'moderate';
    if (score >= 0.5) return 'fair';
    if (score >= 0.4) return 'weak';
    return 'minimal';
  }

  private confidenceToDescription(confidence: number): string {
    if (confidence >= 0.9) return 'very high';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'moderate';
    return 'low';
  }

  private archetypeExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `You share the same professional archetype, suggesting similar strengths and approaches to career development.`;
    }
    if (score >= 0.6) {
      return `Your archetype has significant overlap, indicating compatible career strategies.`;
    }
    return `Different archetypes mean you may need to adapt their approach to fit your style.`;
  }

  private motivationExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `Your motivations align closely, meaning their choices may resonate with your values.`;
    }
    if (score >= 0.6) {
      return `Similar motivations suggest comparable career satisfaction patterns.`;
    }
    return `Different motivations may lead to different optimal paths.`;
  }

  private constraintExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `You faced similar constraints, making their solutions particularly relevant to your situation.`;
    }
    if (score >= 0.6) {
      return `Some constraint overlap exists, offering partial guidance for your challenges.`;
    }
    return `Different constraints mean you'll need to adapt their strategies to your circumstances.`;
  }

  private educationExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    const studentField = student.education.fieldOfStudy;
    const journeyFields = journey.educationHistory.map(e => e.fieldOfStudy);
    
    if (score >= 0.8) {
      return `Your educational background in ${studentField} closely matches theirs in ${journeyFields.join(', ')}, providing a similar foundation.`;
    }
    if (score >= 0.6) {
      return `Related educational backgrounds offer transferable lessons.`;
    }
    return `Different educational paths may require additional skill bridging.`;
  }

  private locationExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    const location = student.location.cityTier.toLowerCase().replace('_', '-');
    
    if (score >= 0.9) {
      return `Starting from the same ${location} location means you face similar geographic and resource constraints.`;
    }
    if (score >= 0.7) {
      return `Similar location tiers suggest comparable early-career challenges and opportunities.`;
    }
    return `Different starting locations may affect the applicability of specific strategies.`;
  }

  private careerGoalExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `Your career goals align closely with where they ended up.`;
    }
    if (score >= 0.6) {
      return `Related career goals offer useful reference points.`;
    }
    return `Different goals mean you'll need to extract general principles rather than specific steps.`;
  }

  private decisionContextExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `You're facing a similar decision to one they made, making their experience directly applicable.`;
    }
    return `Different decision contexts, though their general decision-making approach may still inform you.`;
  }

  private startingPointExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `Very similar starting conditions increase the relevance of their entire journey.`;
    }
    return `Some starting point differences, but the overall path may still offer insights.`;
  }

  private backgroundExplanation(score: number, student: StudentProfileSnapshot, journey: CareerJourney): string {
    if (score >= 0.8) {
      return `Strong overall background similarity creates a solid foundation for learning from their experience.`;
    }
    return `Moderate background overlap - extract principles that transcend specific circumstances.`;
  }

  private assessExplanationQuality(
    result: JourneySimilarityResult,
    keySimilarities: string[],
    keyDifferences: string[]
  ): SimilarityExplanation['explanationQuality'] {
    const hasContent = keySimilarities.length > 0 || keyDifferences.length > 0;
    const hasHighConfidence = result.confidence >= 0.7;
    const hasGoodSimilarity = result.similarityScore >= 0.6;

    if (hasContent && hasHighConfidence && hasGoodSimilarity) return 'EXCELLENT';
    if (hasContent && (hasHighConfidence || hasGoodSimilarity)) return 'GOOD';
    if (hasContent) return 'ADEQUATE';
    return 'LIMITED';
  }

  private buildComparisonText(a: JourneySimilarityResult, b: JourneySimilarityResult): string {
    const scoreDiff = Math.abs(a.similarityScore - b.similarityScore);
    
    if (scoreDiff < 0.1) {
      return 'Both journeys are similarly relevant to your profile.';
    }

    const higher = a.similarityScore > b.similarityScore ? a : b;
    const lower = a.similarityScore > b.similarityScore ? b : a;

    return `${higher.journey.careerHistory[0]?.title || 'The first journey'} is ${Math.round(scoreDiff * 100)}% more similar than ${lower.journey.careerHistory[0]?.title || 'the second'}.`;
  }

  private buildComparisonRecommendation(
    whichIsBetter: 'A' | 'B' | 'DEPENDS',
    a: JourneySimilarityResult,
    b: JourneySimilarityResult
  ): string {
    if (whichIsBetter === 'A') {
      return `Start with ${a.journey.careerHistory[0]?.title || 'the first journey'} for the most relevant insights.`;
    }
    if (whichIsBetter === 'B') {
      return `Start with ${b.journey.careerHistory[0]?.title || 'the second journey'} for the most relevant insights.`;
    }
    return 'Review both journeys to understand different approaches to similar challenges.';
  }

  private identifyKeyFindings(results: JourneySimilarityResult[]): string[] {
    const findings: string[] = [];

    const avgSimilarity = results.reduce((sum, r) => sum + r.similarityScore, 0) / results.length;
    findings.push(`Average similarity across all journeys: ${Math.round(avgSimilarity * 100)}%`);

    const highMatches = results.filter(r => r.similarityScore >= 0.7).length;
    findings.push(`${highMatches} journeys show high similarity (≥70%)`);

    // Most common similar dimension
    const dimensionCounts: Record<string, number> = {};
    for (const result of results) {
      for (const dim of result.dimensionScores) {
        if (dim.score >= 0.7) {
          dimensionCounts[dim.dimension] = (dimensionCounts[dim.dimension] || 0) + 1;
        }
      }
    }

    const topDimension = Object.entries(dimensionCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topDimension) {
      findings.push(`${topDimension[0]} is the most common similarity across journeys`);
    }

    return findings;
  }

  private identifyCommonPatterns(results: JourneySimilarityResult[]): string[] {
    const patterns: string[] = [];

    // Pattern: Common career paths
    const industries = results.flatMap(r => 
      r.journey.careerHistory.map(p => p.industry)
    );
    const industryCounts: Record<string, number> = {};
    for (const ind of industries) {
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
    }
    const commonIndustries = Object.entries(industryCounts)
      .filter(([_, count]) => count >= results.length * 0.3)
      .map(([ind]) => ind);
    
    if (commonIndustries.length > 0) {
      patterns.push(`Common industries: ${commonIndustries.join(', ')}`);
    }

    // Pattern: Common success factors
    const successFactors = results.flatMap(r => 
      r.journey.successes.flatMap(s => s.contributingFactors)
    );
    const factorCounts: Record<string, number> = {};
    for (const factor of successFactors) {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    }
    const commonFactors = Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([f]) => f);
    
    if (commonFactors.length > 0) {
      patterns.push(`Common success factors: ${commonFactors.join(', ')}`);
    }

    return patterns;
  }

  private generateMultiJourneyRecommendations(results: JourneySimilarityResult[]): string[] {
    const recommendations: string[] = [];

    if (results.some(r => r.similarityScore >= 0.8)) {
      recommendations.push('Focus on the highest similarity journeys first for most relevant insights');
    }

    if (results.some(r => r.differences.length > 0)) {
      recommendations.push('Pay attention to noted differences when applying lessons');
    }

    if (results.length >= 5) {
      recommendations.push('Review multiple journeys to identify common patterns vs unique circumstances');
    }

    return recommendations;
  }

  private generateNextSteps(results: JourneySimilarityResult[], student: StudentProfileSnapshot): string[] {
    const steps: string[] = [];

    steps.push('Review the top 3 most similar journeys in detail');
    steps.push('Identify 2-3 key lessons from each journey');

    if (student.decisionContext) {
      steps.push('Focus on journeys with similar decision contexts');
    }

    steps.push('Create an action plan based on common success patterns');
    steps.push('Schedule check-ins to assess progress');

    return steps;
  }

  private initializeTemplates(): Map<string, ExplanationTemplate> {
    const templates = new Map<string, ExplanationTemplate>();

    templates.set('high_archetype_match', {
      id: 'high_archetype_match',
      template: 'You share the {archetype} archetype, suggesting similar approaches to career challenges.',
      variables: ['archetype'],
      condition: (r) => r.dimensionScores.some(d => d.dimension === 'ARCHETYPE' && d.score >= 0.8),
      priority: 1,
    });

    templates.set('same_location_tier', {
      id: 'same_location_tier',
      template: 'Starting from {location} creates similar early-career constraints and opportunities.',
      variables: ['location'],
      condition: (r) => r.dimensionScores.some(d => d.dimension === 'LOCATION' && d.score >= 0.9),
      priority: 2,
    });

    templates.set('education_match', {
      id: 'education_match',
      template: 'Your {field} background provides a similar foundation for career development.',
      variables: ['field'],
      condition: (r) => r.dimensionScores.some(d => d.dimension === 'EDUCATION' && d.score >= 0.7),
      priority: 3,
    });

    return templates;
  }
}
