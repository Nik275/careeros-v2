/**
 * CareerOS Decision Intelligence Engine - Decision Analyzer
 *
 * Phase D.1: Decision Intelligence Engine
 *
 * Analyzes decision quality, tradeoffs, advantages, disadvantages,
 * risks, and opportunities for career decisions.
 *
 * @module decision-analyzer
 * @version 1.0.0
 */

import type {
  DecisionAnalysis,
  DecisionOption,
  DecisionQuality,
  DecisionExplanation,
  TradeoffAnalysis,
  TradeoffSummary,
  Advantage,
  Disadvantage,
  Risk,
  Opportunity,
  Gain,
  Loss,
  DecisionIntelligenceConfig,
  DecisionContext,
  ScoredDimension,
} from './decision-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence, Tradeoff as CareerTradeoff } from '@/career-intelligence/career-types';
import type { GeneratedProfile } from '@/profile/profile-types';

/**
 * Engine for analyzing career decisions.
 */
export class DecisionAnalyzer {
  /** Engine configuration */
  private config: DecisionIntelligenceConfig;

  /**
   * Creates a new DecisionAnalyzer.
   *
   * @param config - Configuration for the analyzer
   */
  constructor(config: DecisionIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Performs complete analysis of a decision option.
   *
   * @param option - Decision option to analyze
   * @param fitResult - Career fit result for this option
   * @param career - Career intelligence data
   * @param profile - Student profile
   * @param context - Decision context
   * @returns Complete decision analysis
   */
  analyzeDecision(
    option: DecisionOption,
    fitResult: CareerFitResult,
    career: CareerIntelligence,
    profile: GeneratedProfile,
    context?: DecisionContext
  ): Omit<DecisionAnalysis, 'decisionId' | 'confidence' | 'analyzedAt'> {
    const decisionQuality = this.evaluateDecisionQuality(fitResult, career, profile);
    const advantages = this.identifyAdvantages(fitResult, career, profile);
    const disadvantages = this.identifyDisadvantages(fitResult, career, profile);
    const risks = this.analyzeRisks(career, fitResult, context);
    const opportunities = this.analyzeOpportunities(career, fitResult, profile);
    const tradeoffs = this.analyzeTradeoffs(career, fitResult, profile, option);
    const explanation = this.generateExplanation(
      option,
      decisionQuality,
      advantages,
      disadvantages,
      risks
    );

    return {
      option,
      decisionQuality,
      advantages,
      disadvantages,
      risks,
      opportunities,
      tradeoffs,
      explanation,
    };
  }

  /**
   * Evaluates decision quality across multiple dimensions.
   *
   * @param fitResult - Career fit result
   * @param career - Career intelligence
   * @param profile - Student profile
   * @returns Decision quality assessment
   */
  private evaluateDecisionQuality(
    fitResult: CareerFitResult,
    career: CareerIntelligence,
    profile: GeneratedProfile
  ): DecisionQuality {
    // Fit Quality - based on overall fit score
    const fitQuality: ScoredDimension = {
      score: fitResult.overallFitScore,
      confidence: fitResult.confidence.overall,
    };

    // Lifestyle Quality - based on lifestyle fit and career characteristics
    const lifestyleScore = this.calculateLifestyleQuality(fitResult, career);
    const lifestyleQuality: ScoredDimension = {
      score: lifestyleScore,
      confidence: fitResult.breakdown.lifestyle.incomeFit.score > 0 ? 75 : 60,
    };

    // Value Alignment - based on values fit
    const valueAlignment: ScoredDimension = {
      score: fitResult.breakdown.values.score,
      confidence: fitResult.confidence.overall,
    };

    // Future Potential - based on career advantages and market outlook
    const futureScore = this.calculateFuturePotential(career, fitResult);
    const futurePotential: ScoredDimension = {
      score: futureScore,
      confidence: career.evidence.dataFreshness,
    };

    // Flexibility - based on career advantages and lifestyle characteristics
    const flexibilityScore = this.calculateFlexibility(career, fitResult);
    const flexibility: ScoredDimension = {
      score: flexibilityScore,
      confidence: 70,
    };

    // Calculate overall quality using weighted formula
    const overall = Math.round(
      fitQuality.score * this.config.fitQualityWeight +
      lifestyleQuality.score * this.config.lifestyleQualityWeight +
      valueAlignment.score * this.config.valueAlignmentWeight +
      futurePotential.score * this.config.futurePotentialWeight +
      flexibility.score * this.config.flexibilityWeight
    );

    return {
      fitQuality,
      lifestyleQuality,
      valueAlignment,
      futurePotential,
      flexibility,
      overall,
    };
  }

  /**
   * Calculates lifestyle quality score.
   *
   * @param fitResult - Career fit result
   * @param career - Career intelligence
   * @returns Lifestyle quality score 0-100
   */
  private calculateLifestyleQuality(
    fitResult: CareerFitResult,
    career: CareerIntelligence
  ): number {
    const lifestyle = fitResult.breakdown.lifestyle;
    const lifestyleChars = career.lifestyleCharacteristics;

    // Weighted combination of lifestyle factors
    const incomeScore = lifestyle.incomeFit.score;
    const balanceScore = lifestyle.workLifeBalanceFit.score;
    const locationScore = lifestyle.locationFit.score;
    const stabilityScore = lifestyleChars.stabilityLevel?.score ?? 50;
    const travelScore = lifestyle.travelFit.score;

    return Math.round(
      incomeScore * 0.25 +
      balanceScore * 0.25 +
      locationScore * 0.2 +
      stabilityScore * 0.15 +
      travelScore * 0.15
    );
  }

  /**
   * Calculates future potential score.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Future potential score 0-100
   */
  private calculateFuturePotential(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): number {
    const advantages = career.careerAdvantages;
    const riskFit = fitResult.breakdown.risk;

    // Future relevance
    const futureRelevance = advantages.futureRelevance?.score ?? 50;

    // Career mobility
    const mobility = advantages.careerMobility?.score ?? 50;

    // Optionality
    const optionality = advantages.optionality?.score ?? 50;

    // Transferability
    const transferability = advantages.transferability?.score ?? 50;

    // Risk-adjusted potential (lower risk = higher potential realization)
    const riskAdjustment = (100 - riskFit.automationRiskFit.careerDemand) / 100;

    const rawPotential = Math.round(
      futureRelevance * 0.3 +
      mobility * 0.25 +
      optionality * 0.25 +
      transferability * 0.2
    );

    return Math.round(rawPotential * (0.7 + riskAdjustment * 0.3));
  }

  /**
   * Calculates flexibility score.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Flexibility score 0-100
   */
  private calculateFlexibility(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): number {
    const lifestyle = career.lifestyleCharacteristics;
    const advantages = career.careerAdvantages;
    const environment = career.workEnvironment;

    // Location flexibility
    const locationFlex = lifestyle.locationFlexibility?.score ?? 50;

    // Optionality (ability to pivot)
    const optionality = advantages.optionality?.score ?? 50;

    // Transferability (skills transfer)
    const transferability = advantages.transferability?.score ?? 50;

    // Independence (work structure flexibility)
    const independence = environment.independenceLevel?.score ?? 50;

    return Math.round(
      locationFlex * 0.3 +
      optionality * 0.25 +
      transferability * 0.25 +
      independence * 0.2
    );
  }

  /**
   * Identifies advantages of a decision option.
   *
   * @param fitResult - Career fit result
   * @param career - Career intelligence
   * @param profile - Student profile
   * @returns List of advantages
   */
  private identifyAdvantages(
    fitResult: CareerFitResult,
    career: CareerIntelligence,
    profile: GeneratedProfile
  ): Advantage[] {
    const advantages: Advantage[] = [];
    let id = 0;

    // Fit-based advantages
    fitResult.strengths.forEach((strength) => {
      advantages.push({
        id: `adv-${++id}`,
        description: strength.description,
        category: this.mapCategoryToAdvantage(strength.category),
        importance: strength.impact === 'MAJOR' ? 90 : strength.impact === 'MODERATE' ? 70 : 50,
        evidence: [strength.dimension],
      });
    });

    // Career advantages
    if (career.careerAdvantages.futureRelevance?.score ?? 0 > 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: `Strong future relevance in evolving job market`,
        category: 'GROWTH',
        importance: career.careerAdvantages.futureRelevance!.score,
        evidence: ['Future relevance scoring'],
      });
    }

    if (career.careerAdvantages.careerMobility?.score ?? 0 > 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: `Excellent career mobility and advancement opportunities`,
        category: 'GROWTH',
        importance: career.careerAdvantages.careerMobility!.score,
        evidence: ['Career mobility assessment'],
      });
    }

    if (career.careerAdvantages.optionality?.score ?? 0 > 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: `High optionality - multiple paths available`,
        category: 'FLEXIBILITY',
        importance: career.careerAdvantages.optionality!.score,
        evidence: ['Optionality assessment'],
      });
    }

    // Income potential
    if (career.lifestyleCharacteristics.incomePotential?.score ?? 0 > 75) {
      advantages.push({
        id: `adv-${++id}`,
        description: `Strong income potential`,
        category: 'INCOME',
        importance: career.lifestyleCharacteristics.incomePotential!.score,
        evidence: ['Income potential data'],
      });
    }

    // Work-life balance
    if (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0 > 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: `Good work-life balance characteristics`,
        category: 'LIFESTYLE',
        importance: career.lifestyleCharacteristics.workLifeBalance!.score,
        evidence: ['Work-life balance assessment'],
      });
    }

    // Profile-based advantages
    profile.strengths.primary.forEach((strength) => {
      advantages.push({
        id: `adv-${++id}`,
        description: `Leverages your strength: ${strength.name}`,
        category: 'FIT',
        importance: strength.score,
        evidence: strength.evidence,
      });
    });

    return advantages.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Maps fit category to advantage category.
   *
   * @param category - Fit strength category
   * @returns Advantage category
   */
  private mapCategoryToAdvantage(
    category: string
  ): Advantage['category'] {
    const mapping: Record<string, Advantage['category']> = {
      COGNITIVE: 'FIT',
      MOTIVATION: 'FIT',
      LIFESTYLE: 'LIFESTYLE',
      RISK: 'STABILITY',
      ENVIRONMENT: 'FLEXIBILITY',
      VALUES: 'IMPACT',
    };
    return mapping[category] ?? 'FIT';
  }

  /**
   * Identifies disadvantages of a decision option.
   *
   * @param fitResult - Career fit result
   * @param career - Career intelligence
   * @param profile - Student profile
   * @returns List of disadvantages
   */
  private identifyDisadvantages(
    fitResult: CareerFitResult,
    career: CareerIntelligence,
    profile: GeneratedProfile
  ): Disadvantage[] {
    const disadvantages: Disadvantage[] = [];
    let id = 0;

    // Fit concerns become disadvantages
    fitResult.concerns.forEach((concern) => {
      disadvantages.push({
        id: `dis-${++id}`,
        description: concern.description,
        category: this.mapCategoryToDisadvantage(concern.category),
        severity: concern.severity === 'HIGH' ? 85 : concern.severity === 'MEDIUM' ? 60 : 40,
        isDealBreaker: concern.severity === 'HIGH' && !concern.isAddressable,
        evidence: [concern.dimension],
      });
    });

    // High automation risk
    if (career.careerRisks.automationRisk?.score ?? 0 > 60) {
      disadvantages.push({
        id: `dis-${++id}`,
        description: `Elevated automation risk may affect long-term viability`,
        category: 'INSTABILITY',
        severity: career.careerRisks.automationRisk!.score,
        isDealBreaker: career.careerRisks.automationRisk!.score > 80,
        evidence: ['Automation risk assessment'],
      });
    }

    // High competition
    if (career.careerRisks.competitionRisk?.score ?? 0 > 70) {
      disadvantages.push({
        id: `dis-${++id}`,
        description: `High competition for positions`,
        category: 'BARRIER_TO_ENTRY',
        severity: career.careerRisks.competitionRisk!.score,
        isDealBreaker: false,
        evidence: ['Competition risk data'],
      });
    }

    // High burnout risk
    if (career.careerRisks.burnoutRisk?.score ?? 0 > 70) {
      disadvantages.push({
        id: `dis-${++id}`,
        description: `Elevated burnout risk requires careful management`,
        category: 'LIFESTYLE_CONFLICT',
        severity: career.careerRisks.burnoutRisk!.score,
        isDealBreaker: false,
        evidence: ['Burnout risk assessment'],
      });
    }

    // Education barrier
    if (career.careerRisks.educationBarrier?.score ?? 0 > 75) {
      disadvantages.push({
        id: `dis-${++id}`,
        description: `Significant education requirements create entry barrier`,
        category: 'BARRIER_TO_ENTRY',
        severity: career.careerRisks.educationBarrier!.score,
        isDealBreaker: false,
        evidence: ['Education barrier assessment'],
      });
    }

    // Poor work-life balance
    if (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0 < 40) {
      disadvantages.push({
        id: `dis-${++id}`,
        description: `Challenging work-life balance`,
        category: 'LIFESTYLE_CONFLICT',
        severity: 100 - (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0),
        isDealBreaker: false,
        evidence: ['Work-life balance data'],
      });
    }

    return disadvantages.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Maps fit category to disadvantage category.
   *
   * @param category - Fit concern category
   * @returns Disadvantage category
   */
  private mapCategoryToDisadvantage(
    category: string
  ): Disadvantage['category'] {
    const mapping: Record<string, Disadvantage['category']> = {
      COGNITIVE: 'MISFIT',
      MOTIVATION: 'MISFIT',
      LIFESTYLE: 'LIFESTYLE_CONFLICT',
      RISK: 'INSTABILITY',
      ENVIRONMENT: 'RIGIDITY',
      VALUES: 'LIMITED_IMPACT',
    };
    return mapping[category] ?? 'MISFIT';
  }

  /**
   * Analyzes risks for a decision option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param context - Decision context
   * @returns List of risks
   */
  private analyzeRisks(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    context?: DecisionContext
  ): Risk[] {
    const risks: Risk[] = [];
    let id = 0;

    // Market risks
    if (career.careerRisks.automationRisk?.score ?? 0 > 30) {
      const probability = career.careerRisks.automationRisk!.score;
      risks.push({
        id: `risk-${++id}`,
        description: `Job automation may reduce demand`,
        category: 'AUTOMATION',
        probability,
        impact: this.calculateAutomationImpact(career),
        riskScore: 0, // Calculated below
        mitigations: [
          'Focus on uniquely human skills',
          'Develop complementary technical skills',
          'Build transferable expertise',
        ],
      });
    }

    if (career.careerRisks.competitionRisk?.score ?? 0 > 30) {
      const probability = Math.min(career.careerRisks.competitionRisk!.score * 1.2, 100);
      risks.push({
        id: `risk-${++id}`,
        description: `Intense competition for roles`,
        category: 'MARKET',
        probability,
        impact: 60,
        riskScore: 0,
        mitigations: [
          'Develop distinctive expertise',
          'Build professional network early',
          'Pursue advanced credentials',
        ],
      });
    }

    // Personal risks
    if (career.careerRisks.burnoutRisk?.score ?? 0 > 40) {
      const probability = career.careerRisks.burnoutRisk!.score;
      risks.push({
        id: `risk-${++id}`,
        description: `Burnout due to high demands`,
        category: 'HEALTH',
        probability,
        impact: 75,
        riskScore: 0,
        mitigations: [
          'Establish clear boundaries',
          'Develop stress management practices',
          'Monitor workload carefully',
        ],
      });
    }

    // Economic risks
    const economicVulnerability = this.calculateEconomicVulnerability(career);
    if (economicVulnerability > 50) {
      risks.push({
        id: `risk-${++id}`,
        description: `Vulnerability to economic downturns`,
        category: 'ECONOMIC',
        probability: economicVulnerability,
        impact: 70,
        riskScore: 0,
        mitigations: [
          'Build emergency fund',
          'Maintain diverse skill set',
          'Develop side income streams',
        ],
      });
    }

    // Calculate risk scores
    risks.forEach((risk) => {
      risk.riskScore = Math.round((risk.probability * risk.impact) / 100);
    });

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Calculates automation impact based on career characteristics.
   *
   * @param career - Career intelligence
   * @returns Impact score 0-100
   */
  private calculateAutomationImpact(career: CareerIntelligence): number {
    // High cognitive and creative demands = lower automation impact
    const cognitiveDemand =
      (career.cognitiveDemands.analyticalDemand?.score ?? 50) +
      (career.cognitiveDemands.creativeDemand?.score ?? 50) / 2;

    // High people interaction = lower automation impact
    const peopleIntensity = career.workEnvironment.peopleIntensity?.score ?? 50;

    // Higher demands = lower impact
    return Math.round(100 - (cognitiveDemand * 0.5 + peopleIntensity * 0.3));
  }

  /**
   * Calculates economic vulnerability.
   *
   * @param career - Career intelligence
   * @returns Vulnerability score 0-100
   */
  private calculateEconomicVulnerability(career: CareerIntelligence): number {
    const stabilityLevel = career.lifestyleCharacteristics.stabilityLevel?.score ?? 50;
    const optionality = career.careerAdvantages.optionality?.score ?? 50;

    // Lower stability and optionality = higher vulnerability
    return Math.round(100 - (stabilityLevel * 0.6 + optionality * 0.4));
  }

  /**
   * Analyzes opportunities for a decision option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param profile - Student profile
   * @returns List of opportunities
   */
  private analyzeOpportunities(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    profile: GeneratedProfile
  ): Opportunity[] {
    const opportunities: Opportunity[] = [];
    let id = 0;

    // Career advancement opportunities
    if (career.careerAdvantages.careerMobility?.score ?? 0 > 50) {
      const probability = career.careerAdvantages.careerMobility!.score;
      opportunities.push({
        id: `opp-${++id}`,
        description: `Rapid career advancement potential`,
        category: 'ADVANCEMENT',
        probability,
        potentialValue: 80,
        opportunityScore: 0,
        requirements: [
          'Strong performance in current role',
          'Leadership skill development',
          'Strategic relationship building',
        ],
      });
    }

    // Skill development opportunities
    if (fitResult.breakdown.cognitive.score > 60) {
      opportunities.push({
        id: `opp-${++id}`,
        description: `Continuous learning and skill expansion`,
        category: 'SKILL_DEVELOPMENT',
        probability: 75,
        potentialValue: 85,
        opportunityScore: 0,
        requirements: [
          'Commitment to professional development',
          'Proactive learning approach',
          'Application of new skills',
        ],
      });
    }

    // Networking opportunities
    if (career.workEnvironment.peopleIntensity?.score ?? 0 > 50) {
      opportunities.push({
        id: `opp-${++id}`,
        description: `Extensive professional network development`,
        category: 'NETWORKING',
        probability: 80,
        potentialValue: 75,
        opportunityScore: 0,
        requirements: [
          'Active professional engagement',
          'Relationship building skills',
          'Industry event participation',
        ],
      });
    }

    // Leadership opportunities
    if (career.workEnvironment.leadershipOpportunity?.score ?? 0 > 60) {
      const probability = career.workEnvironment.leadershipOpportunity!.score;
      opportunities.push({
        id: `opp-${++id}`,
        description: `Leadership and management pathway`,
        category: 'LEADERSHIP',
        probability,
        potentialValue: 90,
        opportunityScore: 0,
        requirements: [
          'Demonstrated leadership capabilities',
          'Strategic thinking development',
          'Team management experience',
        ],
      });
    }

    // Entrepreneurship opportunities
    if (career.careerAdvantages.optionality?.score ?? 0 > 70) {
      opportunities.push({
        id: `opp-${++id}`,
        description: `Future entrepreneurship or consulting potential`,
        category: 'ENTREPRENEURSHIP',
        probability: 50,
        potentialValue: 95,
        opportunityScore: 0,
        requirements: [
          'Industry expertise development',
          'Network building',
          'Business skill acquisition',
        ],
      });
    }

    // Calculate opportunity scores
    opportunities.forEach((opp) => {
      opp.opportunityScore = Math.round((opp.probability * opp.potentialValue) / 100);
    });

    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Analyzes tradeoffs for a decision option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param profile - Student profile
   * @param option - Decision option
   * @returns Tradeoff analysis
   */
  private analyzeTradeoffs(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    profile: GeneratedProfile,
    option: DecisionOption
  ): TradeoffAnalysis {
    const gains = this.identifyGains(career, fitResult, profile);
    const losses = this.identifyLosses(career, fitResult, profile);
    const becomesEasier = this.identifyWhatBecomesEasier(career, fitResult);
    const becomesHarder = this.identifyWhatBecomesHarder(career, fitResult);
    const primaryTradeoff = this.identifyPrimaryTradeoff(career, fitResult, option);

    return {
      gains,
      losses,
      becomesEasier,
      becomesHarder,
      primaryTradeoff,
    };
  }

  /**
   * Identifies gains from choosing this option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param profile - Student profile
   * @returns List of gains
   */
  private identifyGains(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    profile: GeneratedProfile
  ): Gain[] {
    const gains: Gain[] = [];
    let id = 0;

    // Skill gains
    const skills = profile.insights.keyAdvantages.map((a) => a.advantage);
    if (skills.length > 0) {
      gains.push({
        id: `gain-${++id}`,
        description: `Opportunity to leverage and strengthen: ${skills.slice(0, 3).join(', ')}`,
        category: 'SKILL',
        magnitude: Math.round(fitResult.breakdown.cognitive.score),
      });
    }

    // Experience gains
    gains.push({
      id: `gain-${++id}`,
      description: `Professional experience in ${career.metadata.industry}`,
      category: 'EXPERIENCE',
      magnitude: 75,
    });

    // Network gains
    if (career.workEnvironment.peopleIntensity?.score ?? 0 > 40) {
      gains.push({
        id: `gain-${++id}`,
        description: `Professional network in ${career.metadata.industry}`,
        category: 'NETWORK',
        magnitude: Math.round(career.workEnvironment.peopleIntensity!.score),
      });
    }

    // Income gains
    if (career.lifestyleCharacteristics.incomePotential?.score ?? 0 > 50) {
      gains.push({
        id: `gain-${++id}`,
        description: `Income potential and financial stability`,
        category: 'INCOME',
        magnitude: career.lifestyleCharacteristics.incomePotential!.score,
      });
    }

    // Status/recognition gains
    if (career.workEnvironment.leadershipOpportunity?.score ?? 0 > 60) {
      gains.push({
        id: `gain-${++id}`,
        description: `Professional recognition and advancement potential`,
        category: 'STATUS',
        magnitude: career.workEnvironment.leadershipOpportunity!.score,
      });
    }

    // Fulfillment gains
    if (fitResult.breakdown.values.score > 60) {
      gains.push({
        id: `gain-${++id}`,
        description: `Alignment with personal values and sense of purpose`,
        category: 'FULFILLMENT',
        magnitude: fitResult.breakdown.values.score,
      });
    }

    return gains.sort((a, b) => b.magnitude - a.magnitude);
  }

  /**
   * Identifies losses from choosing this option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param profile - Student profile
   * @returns List of losses
   */
  private identifyLosses(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    profile: GeneratedProfile
  ): Loss[] {
    const losses: Loss[] = [];
    let id = 0;

    // Alternative path loss
    losses.push({
      id: `loss-${++id}`,
      description: `Alternative career paths not pursued`,
      category: 'ALTERNATIVE_PATH',
      magnitude: 40,
      isPermanent: false, // Can switch later
    });

    // Time investment
    const educationBarrier = career.careerRisks.educationBarrier?.score ?? 0;
    if (educationBarrier > 50) {
      losses.push({
        id: `loss-${++id}`,
        description: `Years of education and training required`,
        category: 'TIME',
        magnitude: Math.round(educationBarrier),
        isPermanent: true, // Time cannot be recovered
      });
    }

    // Income opportunity cost
    if (educationBarrier > 60) {
      losses.push({
        id: `loss-${++id}`,
        description: `Delayed earnings during education/training period`,
        category: 'INCOME_OPPORTUNITY',
        magnitude: Math.round(educationBarrier * 0.8),
        isPermanent: false, // Can be made up over time
      });
    }

    // Location flexibility loss
    if (career.lifestyleCharacteristics.locationFlexibility?.score ?? 0 < 50) {
      losses.push({
        id: `loss-${++id}`,
        description: `Limited geographic flexibility`,
        category: 'LOCATION',
        magnitude: 100 - (career.lifestyleCharacteristics.locationFlexibility?.score ?? 0),
        isPermanent: false,
      });
    }

    // Work-life tradeoff
    if (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0 < 50) {
      losses.push({
        id: `loss-${++id}`,
        description: `Personal time and work-life balance`,
        category: 'TIME',
        magnitude: 100 - (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0),
        isPermanent: false,
      });
    }

    // Experience type loss
    const environmentType = this.inferEnvironmentType(career);
    losses.push({
      id: `loss-${++id}`,
      description: `Experience types associated with other work environments`,
      category: 'EXPERIENCE_TYPE',
      magnitude: 30,
      isPermanent: false,
    });

    return losses.sort((a, b) => b.magnitude - a.magnitude);
  }

  /**
   * Infers the environment type from career characteristics.
   *
   * @param career - Career intelligence
   * @returns Environment type description
   */
  private inferEnvironmentType(career: CareerIntelligence): string {
    const peopleIntensity = career.workEnvironment.peopleIntensity?.score ?? 50;
    const independence = career.workEnvironment.independenceLevel?.score ?? 50;
    const researchIntensity = career.workEnvironment.researchIntensity?.score ?? 50;

    if (peopleIntensity > 70) return 'people-focused';
    if (researchIntensity > 70) return 'research-focused';
    if (independence > 70) return 'independent';
    return 'collaborative';
  }

  /**
   * Identifies what becomes easier with this option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns List of things that become easier
   */
  private identifyWhatBecomesEasier(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): string[] {
    const easier: string[] = [];

    // Strong fit = easier to succeed
    if (fitResult.overallFitScore > 70) {
      easier.push('Achieving job performance and satisfaction');
      easier.push('Building professional confidence');
    }

    // High income potential
    if (career.lifestyleCharacteristics.incomePotential?.score ?? 0 > 70) {
      easier.push('Achieving financial goals');
      easier.push('Building financial security');
    }

    // Good work-life balance
    if (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0 > 60) {
      easier.push('Maintaining personal relationships');
      easier.push('Pursuing hobbies and interests');
    }

    // High mobility
    if (career.careerAdvantages.careerMobility?.score ?? 0 > 60) {
      easier.push('Career advancement');
      easier.push('Salary growth');
    }

    // High transferability
    if (career.careerAdvantages.transferability?.score ?? 0 > 70) {
      easier.push('Pivoting to related roles');
      easier.push('Adapting to industry changes');
    }

    // High people intensity
    if (career.workEnvironment.peopleIntensity?.score ?? 0 > 60) {
      easier.push('Building professional network');
      easier.push('Finding mentorship');
    }

    // High optionality
    if (career.careerAdvantages.optionality?.score ?? 0 > 70) {
      easier.push('Exploring different career paths');
      easier.push('Adapting to changing interests');
    }

    return easier;
  }

  /**
   * Identifies what becomes harder with this option.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns List of things that become harder
   */
  private identifyWhatBecomesHarder(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): string[] {
    const harder: string[] = [];

    // High barriers
    if (career.careerRisks.educationBarrier?.score ?? 0 > 60) {
      harder.push('Entering the profession (education requirements)');
    }

    // High competition
    if (career.careerRisks.competitionRisk?.score ?? 0 > 60) {
      harder.push('Securing positions and promotions');
    }

    // Poor work-life balance
    if (career.lifestyleCharacteristics.workLifeBalance?.score ?? 0 < 50) {
      harder.push('Maintaining work-life boundaries');
      harder.push('Balancing personal and professional commitments');
    }

    // High burnout risk
    if (career.careerRisks.burnoutRisk?.score ?? 0 > 60) {
      harder.push('Sustaining long-term energy and engagement');
      harder.push('Avoiding exhaustion and stress');
    }

    // Low location flexibility
    if (career.lifestyleCharacteristics.locationFlexibility?.score ?? 0 < 40) {
      harder.push('Relocating for opportunities');
      harder.push('Working remotely');
    }

    // High automation risk
    if (career.careerRisks.automationRisk?.score ?? 0 > 60) {
      harder.push('Maintaining job security long-term');
      harder.push('Avoiding skill obsolescence');
    }

    // Low fit concerns
    if (fitResult.overallFitScore < 60) {
      harder.push('Achieving job satisfaction and engagement');
      harder.push('Performing at your best');
    }

    return harder;
  }

  /**
   * Identifies the primary tradeoff for this decision.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @param option - Decision option
   * @returns Primary tradeoff summary
   */
  private identifyPrimaryTradeoff(
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    option: DecisionOption
  ): TradeoffSummary {
    // Determine the most significant tradeoff
    const incomePotential = career.lifestyleCharacteristics.incomePotential?.score ?? 50;
    const workLifeBalance = career.lifestyleCharacteristics.workLifeBalance?.score ?? 50;
    const educationBarrier = career.careerRisks.educationBarrier?.score ?? 0;
    const securityDemand = career.motivationalDemands.securityDemand?.score ?? 50;
    const autonomyDemand = career.motivationalDemands.autonomyDemand?.score ?? 50;

    // Income vs Work-Life Balance
    if (incomePotential > 75 && workLifeBalance < 50) {
      return {
        name: 'Income vs. Work-Life Balance',
        description: `High earning potential requires significant personal time investment`,
        gain: `Strong financial rewards and wealth building potential`,
        sacrifice: `Personal time, leisure, and potentially relationships`,
        forWhom: `Those who prioritize financial success and are willing to invest heavily in their career`,
        avoidIf: `You value work-life balance, have significant personal commitments, or prioritize lifestyle over income`,
      };
    }

    // Education Investment vs. Career Entry
    if (educationBarrier > 70) {
      return {
        name: 'Education Investment vs. Career Entry',
        description: `Significant upfront education investment for career access`,
        gain: `Prestigious career with strong long-term prospects`,
        sacrifice: `Years of education, delayed earnings, and potential debt`,
        forWhom: `Those committed to the field, with resources for education, and long-term career focus`,
        avoidIf: `You need immediate income, have limited education resources, or are uncertain about the field`,
      };
    }

    // Security vs. Autonomy
    if (securityDemand > 70 && autonomyDemand < 50) {
      return {
        name: 'Security vs. Autonomy',
        description: `Structured environment provides stability but limits independence`,
        gain: `Predictable career path, job security, and clear advancement`,
        sacrifice: `Independence, creative freedom, and control over work`,
        forWhom: `Those who value stability, clear direction, and predictable outcomes`,
        avoidIf: `You crave independence, want to set your own direction, or dislike rigid structures`,
      };
    }

    // Risk vs. Reward
    if (fitResult.breakdown.risk.score < 50) {
      return {
        name: 'Risk vs. Reward',
        description: `Higher career risks for potentially greater rewards`,
        gain: `High potential upside, excitement, and growth opportunities`,
        sacrifice: `Stability, predictability, and security`,
        forWhom: `Risk-tolerant individuals who thrive on challenge and potential high rewards`,
        avoidIf: `You prioritize stability, have financial obligations, or prefer predictable outcomes`,
      };
    }

    // Default tradeoff
    return {
      name: 'Commitment vs. Flexibility',
      description: `Specialization in ${option.title} requires focused commitment`,
      gain: `Deep expertise, professional recognition, and career advancement in chosen field`,
      sacrifice: `Alternative career paths and experiences outside this specialization`,
      forWhom: `Those committed to this career direction and willing to invest in specialization`,
      avoidIf: `You want to keep options open, are uncertain about direction, or value diverse experiences`,
    };
  }

  /**
   * Generates explanation for decision analysis.
   *
   * @param option - Decision option
   * @param quality - Decision quality
   * @param advantages - List of advantages
   * @param disadvantages - List of disadvantages
   * @param risks - List of risks
   * @returns Decision explanation
   */
  private generateExplanation(
    option: DecisionOption,
    quality: DecisionQuality,
    advantages: Advantage[],
    disadvantages: Disadvantage[],
    risks: Risk[]
  ): DecisionExplanation {
    // Why attractive
    const topAdvantages = advantages.slice(0, 3).map((a) => a.description);
    const whyAttractive = this.buildAttractivenessExplanation(
      option,
      quality,
      topAdvantages
    );

    // Why risky
    const topRisks = risks.slice(0, 3).map((r) => r.description);
    const whyRisky = this.buildRiskExplanation(option, topRisks, disadvantages);

    // Why alternative may outperform
    const whyAlternativeMayOutperform = this.buildAlternativeExplanation(
      option,
      quality,
      disadvantages
    );

    // Key factors
    const keyFactors = this.identifyKeyFactors(quality, advantages, disadvantages, risks);

    // Summary
    const summary = this.buildSummary(option, quality, advantages, disadvantages);

    return {
      whyAttractive,
      whyRisky,
      whyAlternativeMayOutperform,
      keyFactors,
      summary,
    };
  }

  /**
   * Builds attractiveness explanation.
   *
   * @param option - Decision option
   * @param quality - Decision quality
   * @param topAdvantages - Top advantages
   * @returns Attractiveness explanation
   */
  private buildAttractivenessExplanation(
    option: DecisionOption,
    quality: DecisionQuality,
    topAdvantages: string[]
  ): string {
    const parts: string[] = [];

    parts.push(`${option.title} is an attractive choice`);

    if (quality.overall >= 75) {
      parts.push('that represents a strong overall match');
    } else if (quality.overall >= 60) {
      parts.push('that offers a solid foundation with some tradeoffs');
    } else {
      parts.push('that may require careful consideration');
    }

    if (topAdvantages.length > 0) {
      parts.push(`Key strengths include: ${topAdvantages.join('; ')}.`);
    }

    // Add specific dimension highlights
    const highlights: string[] = [];
    if (quality.fitQuality.score >= 75) highlights.push('strong personal fit');
    if (quality.lifestyleQuality.score >= 75) highlights.push('favorable lifestyle characteristics');
    if (quality.futurePotential.score >= 75) highlights.push('strong future potential');
    if (quality.valueAlignment.score >= 75) highlights.push('good value alignment');

    if (highlights.length > 0) {
      parts.push(`It offers ${highlights.join(', ')}.`);
    }

    return parts.join(' ');
  }

  /**
   * Builds risk explanation.
   *
   * @param option - Decision option
   * @param topRisks - Top risks
   * @param disadvantages - Disadvantages
   * @returns Risk explanation
   */
  private buildRiskExplanation(
    option: DecisionOption,
    topRisks: string[],
    disadvantages: Disadvantage[]
  ): string {
    const parts: string[] = [];

    const dealBreakers = disadvantages.filter((d) => d.isDealBreaker);

    if (dealBreakers.length > 0) {
      parts.push(`This choice has significant concerns:`);
      parts.push(dealBreakers.map((d) => d.description).join('; '));
    } else if (topRisks.length > 0) {
      parts.push(`${option.title} carries notable risks:`);
      parts.push(topRisks.join('; '));
    } else {
      parts.push(`The primary risks are manageable`);
    }

    // Add context about severity
    const highSeverityRisks = disadvantages.filter((d) => d.severity >= 70);
    if (highSeverityRisks.length > 0) {
      parts.push('These factors warrant serious consideration before committing.');
    } else {
      parts.push('Most risks can be mitigated with proper planning.');
    }

    return parts.join(' ');
  }

  /**
   * Builds alternative explanation.
   *
   * @param option - Decision option
   * @param quality - Decision quality
   * @param disadvantages - Disadvantages
   * @returns Alternative explanation
   */
  private buildAlternativeExplanation(
    option: DecisionOption,
    quality: DecisionQuality,
    disadvantages: Disadvantage[]
  ): string {
    const parts: string[] = [];

    const weakDimensions: string[] = [];
    if (quality.fitQuality.score < 60) weakDimensions.push('personal fit');
    if (quality.lifestyleQuality.score < 60) weakDimensions.push('lifestyle compatibility');
    if (quality.futurePotential.score < 60) weakDimensions.push('future prospects');
    if (quality.valueAlignment.score < 60) weakDimensions.push('value alignment');
    if (quality.flexibility.score < 60) weakDimensions.push('flexibility');

    if (weakDimensions.length > 0) {
      parts.push(`Another option may be better if you prioritize ${weakDimensions.join(', ')}.`);
    }

    // Address specific concerns
    const lifestyleConcerns = disadvantages.filter(
      (d) => d.category === 'LIFESTYLE_CONFLICT' || d.category === 'INSTABILITY'
    );
    if (lifestyleConcerns.length > 0) {
      parts.push(`Careers with better ${lifestyleConcerns.map((d) => d.description.toLowerCase()).join(', ')} may provide greater satisfaction.`);
    }

    if (parts.length === 0) {
      parts.push(`While this is a strong option, exploring alternatives ensures you've considered all possibilities.`);
    }

    return parts.join(' ');
  }

  /**
   * Identifies key factors for decision.
   *
   * @param quality - Decision quality
   * @param advantages - Advantages
   * @param disadvantages - Disadvantages
   * @param risks - Risks
   * @returns Key factors
   */
  private identifyKeyFactors(
    quality: DecisionQuality,
    advantages: Advantage[],
    disadvantages: Disadvantage[],
    risks: Risk[]
  ): string[] {
    const factors: string[] = [];

    // Quality factors
    if (quality.fitQuality.score >= 75) {
      factors.push('Strong alignment between your profile and career demands');
    }
    if (quality.fitQuality.score < 50) {
      factors.push('Significant gaps between your profile and career requirements');
    }

    // Top advantage
    if (advantages.length > 0) {
      factors.push(`Primary advantage: ${advantages[0].description}`);
    }

    // Top concern
    const dealBreakers = disadvantages.filter((d) => d.isDealBreaker);
    if (dealBreakers.length > 0) {
      factors.push(`Critical concern: ${dealBreakers[0].description}`);
    } else if (disadvantages.length > 0 && disadvantages[0].severity >= 70) {
      factors.push(`Key challenge: ${disadvantages[0].description}`);
    }

    // Top risk
    if (risks.length > 0 && risks[0].riskScore >= 50) {
      factors.push(`Primary risk: ${risks[0].description} (probability: ${risks[0].probability}%)`);
    }

    // Future potential
    if (quality.futurePotential.score >= 75) {
      factors.push('Strong long-term growth trajectory');
    } else if (quality.futurePotential.score < 50) {
      factors.push('Uncertain long-term prospects require monitoring');
    }

    return factors;
  }

  /**
   * Builds decision summary.
   *
   * @param option - Decision option
   * @param quality - Decision quality
   * @param advantages - Advantages
   * @param disadvantages - Disadvantages
   * @returns Summary statement
   */
  private buildSummary(
    option: DecisionOption,
    quality: DecisionQuality,
    advantages: Advantage[],
    disadvantages: Disadvantage[]
  ): string {
    const parts: string[] = [];

    // Quality assessment
    if (quality.overall >= 80) {
      parts.push(`${option.title} is an excellent choice`);
    } else if (quality.overall >= 65) {
      parts.push(`${option.title} is a strong choice`);
    } else if (quality.overall >= 50) {
      parts.push(`${option.title} is a viable choice`);
    } else {
      parts.push(`${option.title} requires careful consideration`);
    }

    parts.push(`(${quality.overall}/100 overall quality)`);

    // Advantage count
    if (advantages.length >= 5) {
      parts.push(`with ${advantages.length} identified advantages`);
    }

    // Concern count
    const significantConcerns = disadvantages.filter((d) => d.severity >= 60);
    if (significantConcerns.length > 0) {
      parts.push(`and ${significantConcerns.length} significant concerns to address`);
    }

    return parts.join(' ') + '.';
  }
}

/**
 * Creates a default decision analyzer.
 *
 * @param config - Partial configuration
 * @returns Configured DecisionAnalyzer
 */
export function createDecisionAnalyzer(
  config?: Partial<DecisionIntelligenceConfig>
): DecisionAnalyzer {
  const fullConfig: DecisionIntelligenceConfig = {
    minConfidenceThreshold: 50,
    defaultTimeHorizon: 5,
    enableTradeoffAnalysis: true,
    enableRiskAnalysis: true,
    enableOpportunityAnalysis: true,
    fitQualityWeight: 0.25,
    lifestyleQualityWeight: 0.2,
    valueAlignmentWeight: 0.2,
    futurePotentialWeight: 0.2,
    flexibilityWeight: 0.15,
    ...config,
  };

  return new DecisionAnalyzer(fullConfig);
}
