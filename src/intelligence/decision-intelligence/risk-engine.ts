/**
 * Risk Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 7
 *
 * Estimates realistic downside across risk categories.
 * Calculates financial, identity, career, lifestyle, and opportunity cost risks.
 *
 * @module risk-engine
 * @version 1.0.0
 */

import {
  RiskProfile,
  RiskAssessment,
  RiskCategory,
  RiskSeverity,
  DecisionInput,
  DecisionOption,
  RiskEngineConfig,
} from './decision-types';

/**
 * Risk Engine implementation
 */
export class RiskEngine {
  private config: RiskEngineConfig;

  constructor(config?: Partial<RiskEngineConfig>) {
    this.config = {
      riskAppetite: 'MODERATE',
      categoryWeights: new Map([
        ['IDENTITY', 1.0],
        ['FINANCIAL', 0.9],
        ['CAREER', 0.85],
        ['LIFESTYLE', 0.75],
        ['BURNOUT', 0.8],
        ['OPPORTUNITY_COST', 0.7],
      ]),
      mitigationEffectiveness: 0.7,
      horizon: 10,
      ...config,
    };
  }

  /**
   * Calculate comprehensive risk profile
   */
  calculateRiskProfile(
    input: DecisionInput,
    option: DecisionOption
  ): RiskProfile {
    const assessments: RiskAssessment[] = [];

    // Assess each risk category
    for (const category of this.config.categoryWeights.keys()) {
      const assessment = this.assessRiskCategory(category, option, input);
      assessments.push(assessment);
    }

    // Calculate overall risk
    const overallRisk = this.calculateOverallRisk(assessments);

    // Identify highest risk category
    const highestRiskCategory = this.identifyHighestRisk(assessments);

    // Generate mitigation priorities
    const mitigationPriorities = this.generateMitigationPriorities(
      assessments,
      highestRiskCategory
    );

    return {
      assessments,
      overallRisk: Math.round(overallRisk),
      highestRiskCategory,
      riskAdjustedRecommendation: this.generateRiskAdjustedRecommendation(
        assessments,
        overallRisk
      ),
      mitigationPriorities,
      explanation: this.generateExplanation(assessments, highestRiskCategory, overallRisk),
    };
  }

  /**
   * Assess risk for a specific category
   */
  private assessRiskCategory(
    category: RiskCategory,
    option: DecisionOption,
    input: DecisionInput
  ): RiskAssessment {
    const probability = this.calculateProbability(category, option, input);
    const impact = this.calculateImpact(category, option, input);
    const score = (probability + impact) / 2;

    const severity = this.classifySeverity(score);
    const rationale = this.generateRiskRationale(category, option, input, probability, impact);
    const mitigations = this.identifyMitigations(category, option);
    const earlyWarningSigns = this.identifyEarlyWarningSigns(category);

    return {
      category,
      severity,
      probability: Math.round(probability),
      impact: Math.round(impact),
      score: Math.round(score),
      rationale,
      mitigations,
      earlyWarningSigns,
    };
  }

  /**
   * Calculate probability of risk materializing
   */
  private calculateProbability(
    category: RiskCategory,
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 30; // Base probability

    switch (category) {
      case 'FINANCIAL':
        probability = this.calculateFinancialProbability(option);
        break;
      case 'IDENTITY':
        probability = this.calculateIdentityProbability(option, input);
        break;
      case 'CAREER':
        probability = this.calculateCareerProbability(option);
        break;
      case 'LIFESTYLE':
        probability = this.calculateLifestyleProbability(option, input);
        break;
      case 'BURNOUT':
        probability = this.calculateBurnoutProbability(option, input);
        break;
      case 'OPPORTUNITY_COST':
        probability = this.calculateOpportunityCostProbability(option);
        break;
      case 'MARKET':
        probability = this.calculateMarketProbability(option);
        break;
      case 'SKILL_OBSOLESCENCE':
        probability = this.calculateSkillObsolescenceProbability(option);
        break;
      case 'RELATIONSHIP':
        probability = this.calculateRelationshipProbability(option, input);
        break;
      case 'HEALTH':
        probability = this.calculateHealthProbability(option, input);
        break;
    }

    // Adjust for risk appetite
    if (this.config.riskAppetite === 'CONSERVATIVE') {
      probability *= 1.1;
    } else if (this.config.riskAppetite === 'AGGRESSIVE') {
      probability *= 0.9;
    }

    return Math.min(100, Math.max(0, probability));
  }

  /**
   * Calculate financial risk probability
   */
  private calculateFinancialProbability(option: DecisionOption): number {
    let probability = 30;

    // High initial cost increases financial risk
    if (option.financialImplications.initialCost > 500000) {
      probability += 15;
    }

    // Low expected income increases risk
    if (option.financialImplications.expectedIncome < 300000) {
      probability += 10;
    }

    // Long break-even time increases risk
    if (option.financialImplications.breakEvenTime > 36) {
      probability += 15;
    }

    // High risk level
    if (option.riskLevel === 'HIGH' || option.riskLevel === 'VERY_HIGH') {
      probability += 20;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate identity risk probability
   */
  private calculateIdentityProbability(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 25;

    // Check for value misalignment
    const valueAlignment = this.assessValueAlignment(option, input);
    if (valueAlignment < 50) {
      probability += 25;
    }

    // External pressure indicators
    if (input.context.familyExpectations.length > 0) {
      probability += 10;
    }

    // Contradictions increase identity risk
    if (input.contradictions && input.contradictions.length > 0) {
      probability += input.contradictions.length * 5;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate career risk probability
   */
  private calculateCareerProbability(option: DecisionOption): number {
    let probability = 25;

    // Specialized paths have higher career change risk
    if (option.educationPath?.specialization) {
      probability += 15;
    }

    // High-risk career choices
    if (option.riskLevel === 'HIGH' || option.riskLevel === 'VERY_HIGH') {
      probability += 20;
    }

    // Emerging/uncertain fields
    if (option.tags.includes('emerging') || option.tags.includes('uncertain')) {
      probability += 15;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate lifestyle risk probability
   */
  private calculateLifestyleProbability(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 20;

    // High intensity affects lifestyle
    if (option.timeCommitment.intensity === 'INTENSIVE') {
      probability += 20;
    }

    // Low flexibility affects lifestyle
    if (option.timeCommitment.flexibility === 'RIGID') {
      probability += 15;
    }

    // Location factors
    if (option.location?.costOfLiving === 'VERY_HIGH') {
      probability += 10;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate burnout risk probability
   */
  private calculateBurnoutProbability(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 20;

    // Intensive paths increase burnout risk
    if (option.timeCommitment.intensity === 'INTENSIVE') {
      probability += 25;
    }

    // Long duration increases risk
    if (option.timeCommitment.duration > 36) {
      probability += 15;
    }

    // Rigid schedules increase risk
    if (option.timeCommitment.flexibility === 'RIGID') {
      probability += 10;
    }

    // Check personality factors
    const resilience = input.dimensionScores.get('resilience')?.score ?? 50;
    if (resilience < 40) {
      probability += 15;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate opportunity cost probability
   */
  private calculateOpportunityCostProbability(option: DecisionOption): number {
    let probability = 30;

    // High opportunity cost increases this risk
    if (option.financialImplications.opportunityCost > 500000) {
      probability += 15;
    }

    // Specialized paths have higher opportunity cost
    if (option.educationPath?.specialization) {
      probability += 10;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate market risk probability
   */
  private calculateMarketProbability(option: DecisionOption): number {
    let probability = 25;

    // Emerging fields have market uncertainty
    if (option.tags.includes('emerging')) {
      probability += 20;
    }

    // Cyclical industries
    if (option.tags.includes('cyclical')) {
      probability += 15;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate skill obsolescence probability
   */
  private calculateSkillObsolescenceProbability(option: DecisionOption): number {
    let probability = 30;

    // Technology-dependent fields
    if (option.tags.includes('tech-dependent')) {
      probability += 20;
    }

    // Rapidly changing fields
    if (option.tags.includes('fast-changing')) {
      probability += 15;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate relationship risk probability
   */
  private calculateRelationshipProbability(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 20;

    // Geographic relocation affects relationships
    if (option.location && option.location.country !== 'India') {
      probability += 20;
    }

    // Intensive time commitment
    if (option.timeCommitment.intensity === 'INTENSIVE') {
      probability += 15;
    }

    // Long duration
    if (option.timeCommitment.duration > 48) {
      probability += 10;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate health risk probability
   */
  private calculateHealthProbability(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let probability = 15;

    // High stress levels
    if (option.tags.includes('high-stress')) {
      probability += 25;
    }

    // Intensive schedules
    if (option.timeCommitment.intensity === 'INTENSIVE') {
      probability += 15;
    }

    return Math.min(100, probability);
  }

  /**
   * Calculate impact of risk materializing
   */
  private calculateImpact(
    category: RiskCategory,
    option: DecisionOption,
    input: DecisionInput
  ): number {
    // Impact scores by category
    const baseImpacts: Record<RiskCategory, number> = {
      FINANCIAL: 60,
      IDENTITY: 80,
      CAREER: 70,
      LIFESTYLE: 50,
      BURNOUT: 75,
      OPPORTUNITY_COST: 55,
      MARKET: 65,
      SKILL_OBSOLESCENCE: 60,
      RELATIONSHIP: 70,
      HEALTH: 85,
    };

    let impact = baseImpacts[category] ?? 50;

    // Adjust for time horizon
    if (this.config.horizon > 15) {
      impact *= 1.1; // Long-term impacts compound
    }

    return Math.min(100, impact);
  }

  /**
   * Assess value alignment
   */
  private assessValueAlignment(option: DecisionOption, input: DecisionInput): number {
    const context = [...input.context.values, ...input.context.aspirationalGoals]
      .join(' ')
      .toLowerCase();

    let alignment = 50;

    for (const value of input.context.values) {
      if (option.description.toLowerCase().includes(value.toLowerCase())) {
        alignment += 10;
      }
    }

    return Math.min(100, alignment);
  }

  /**
   * Classify risk severity
   */
  private classifySeverity(score: number): RiskSeverity {
    if (score < 20) return 'MINIMAL';
    if (score < 40) return 'LOW';
    if (score < 60) return 'MODERATE';
    if (score < 80) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Generate risk rationale
   */
  private generateRiskRationale(
    category: RiskCategory,
    option: DecisionOption,
    input: DecisionInput,
    probability: number,
    impact: number
  ): string {
    const rationales: Record<RiskCategory, string> = {
      FINANCIAL: `Financial risk stems from investment costs, uncertain returns, and opportunity costs.`,
      IDENTITY: `Identity risk arises when choices conflict with core values or authentic self.`,
      CAREER: `Career risk includes path dependency, limited options, and market changes.`,
      LIFESTYLE: `Lifestyle risk affects work-life balance, location, and daily satisfaction.`,
      BURNOUT: `Burnout risk comes from intensity, duration, and misalignment with capacity.`,
      OPPORTUNITY_COST: `Opportunity cost risk is what you give up by choosing this path.`,
      MARKET: `Market risk reflects industry volatility and demand uncertainty.`,
      SKILL_OBSOLESCENCE: `Skill obsolescence risk means your expertise may become outdated.`,
      RELATIONSHIP: `Relationship risk involves strain on personal connections.`,
      HEALTH: `Health risk includes stress-related and lifestyle health impacts.`,
    };

    let rationale = rationales[category];

    if (probability > 60) {
      rationale += ` Probability is high based on path characteristics.`;
    }

    if (impact > 70) {
      rationale += ` Impact would be significant if realized.`;
    }

    return rationale;
  }

  /**
   * Identify mitigations for a risk category
   */
  private identifyMitigations(category: RiskCategory, option: DecisionOption): string[] {
    const mitigations: Record<RiskCategory, string[]> = {
      FINANCIAL: ['Build emergency fund', 'Diversify income sources', 'Plan for multiple scenarios'],
      IDENTITY: ['Regular self-reflection', 'Maintain authentic connections', 'Set identity checkpoints'],
      CAREER: ['Build transferable skills', 'Maintain professional network', 'Stay informed about trends'],
      LIFESTYLE: ['Set boundaries early', 'Negotiate flexibility', 'Prioritize wellbeing'],
      BURNOUT: ['Monitor stress signals', 'Build recovery practices', 'Adjust intensity as needed'],
      OPPORTUNITY_COST: ['Document decision rationale', 'Keep alternative paths warm', 'Set review points'],
      MARKET: ['Develop adaptable skills', 'Monitor industry trends', 'Build diverse experience'],
      SKILL_OBSOLESCENCE: ['Continuous learning', 'Cross-train in adjacent areas', 'Stay current with trends'],
      RELATIONSHIP: ['Prioritize key relationships', 'Schedule connection time', 'Communicate about demands'],
      HEALTH: ['Establish health routines', 'Monitor stress levels', 'Seek support when needed'],
    };

    return mitigations[category] || ['Monitor and adjust as needed'];
  }

  /**
   * Identify early warning signs
   */
  private identifyEarlyWarningSigns(category: RiskCategory): string[] {
    const signs: Record<RiskCategory, string[]> = {
      FINANCIAL: ['Unexpected expenses', 'Income shortfalls', 'Debt accumulation'],
      IDENTITY: ['Sense of inauthenticity', 'Disconnection from values', 'External validation dependency'],
      CAREER: ['Limited advancement', 'Skill mismatch', 'Market changes'],
      LIFESTYLE: ['Chronic stress', 'Work-life imbalance', 'Relocation dissatisfaction'],
      BURNOUT: ['Exhaustion', 'Cynicism', 'Reduced efficacy'],
      OPPORTUNITY_COST: ['Persistent curiosity about alternatives', 'Envy of other paths', 'Sense of missing out'],
      MARKET: ['Industry decline signals', 'Job scarcity', 'Salary stagnation'],
      SKILL_OBSOLESCENCE: ['Technology changes', 'Decreasing relevance', 'Competition from new approaches'],
      RELATIONSHIP: ['Distance from loved ones', 'Conflict increase', 'Social isolation'],
      HEALTH: ['Sleep issues', 'Physical symptoms', 'Mental health changes'],
    };

    return signs[category] || ['Stay alert to changes'];
  }

  /**
   * Calculate overall risk from assessments
   */
  private calculateOverallRisk(assessments: RiskAssessment[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const assessment of assessments) {
      const weight = this.config.categoryWeights.get(assessment.category) ?? 0.5;
      weightedSum += assessment.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Identify highest risk category
   */
  private identifyHighestRisk(assessments: RiskAssessment[]): RiskCategory {
    if (assessments.length === 0) return 'FINANCIAL';

    return assessments.reduce((max, a) => (a.score > max.score ? a : max)).category;
  }

  /**
   * Generate mitigation priorities
   */
  private generateMitigationPriorities(
    assessments: RiskAssessment[],
    highestRisk: RiskCategory
  ): string[] {
    // Sort by risk score
    const sorted = [...assessments].sort((a, b) => b.score - a.score);

    const priorities: string[] = [];

    // Top 3 risks
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const assessment = sorted[i];
      if (assessment.mitigations.length > 0) {
        priorities.push(`${assessment.category}: ${assessment.mitigations[0]}`);
      }
    }

    return priorities;
  }

  /**
   * Generate risk-adjusted recommendation
   */
  private generateRiskAdjustedRecommendation(
    assessments: RiskAssessment[],
    overallRisk: number
  ): string {
    if (overallRisk < 30) {
      return 'Risk profile is favorable. Proceed with standard precautions.';
    } else if (overallRisk < 50) {
      return 'Moderate risks identified. Implement mitigation strategies.';
    } else if (overallRisk < 70) {
      return 'Significant risks present. Consider alternatives or add safeguards.';
    } else {
      return 'High risk profile. Reconsider or substantially modify approach.';
    }
  }

  /**
   * Generate explanation
   */
  private generateExplanation(
    assessments: RiskAssessment[],
    highestRisk: RiskCategory,
    overallRisk: number
  ): string {
    let explanation = `Overall risk assessment: ${Math.round(overallRisk)}%. `;

    const highest = assessments.find((a) => a.category === highestRisk);
    if (highest) {
      explanation += `Highest concern is ${highestRisk.toLowerCase().replace('_', ' ')} risk at ${highest.score}%. `;
      explanation += highest.rationale;
    }

    return explanation;
  }

  /**
   * Get current configuration
   */
  getConfig(): RiskEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating risk engine
 */
export function createRiskEngine(config?: Partial<RiskEngineConfig>): RiskEngine {
  return new RiskEngine(config);
}

/**
 * Quick risk check
 */
export function analyzeQuickRisk(
  riskLevel: string,
  timeCommitment: number,
  financialCost: number
): { score: number; level: 'LOW' | 'MODERATE' | 'HIGH' } {
  let score = 30;

  if (riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH') score += 25;
  if (timeCommitment > 36) score += 15;
  if (financialCost > 500000) score += 20;

  const level: 'LOW' | 'MODERATE' | 'HIGH' =
    score < 40 ? 'LOW' : score < 65 ? 'MODERATE' : 'HIGH';

  return { score: Math.min(100, score), level };
}
