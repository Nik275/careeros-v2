/**
 * India Intelligence - Tradeoff Engine
 *
 * Models Dream vs Practical career decisions:
 * - IIT Drop Year vs Accept Current College
 * - UPSC vs Corporate Career
 * - MBBS vs Engineering
 * - Family Business vs Independent Career
 * - Tier 1 vs Tier 2/3 College
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  TradeoffAnalysis,
  CareerOption,
  TradeoffComparison,
  DecisionFramework,
  TradeoffRecommendation,
  IndiaIntelligenceAnalysis,
  EconomicStratum,
  RegionalTier,
} from './types';

/**
 * Tradeoff Engine Configuration
 */
export interface IndiaTradeoffEngineConfig {
  /** Risk adjustment factor */
  riskAdjustmentFactor: number;
  /** Consider family opinion weight */
  familyOpinionWeight: number;
  /** Regret tolerance threshold */
  regretToleranceThreshold: number;
}

/**
 * Default Tradeoff Engine configuration
 */
export const DEFAULT_TRADEOFF_CONFIG: IndiaTradeoffEngineConfig = {
  riskAdjustmentFactor: 0.7,
  familyOpinionWeight: 0.3,
  regretToleranceThreshold: 0.4,
};

/**
 * India Tradeoff Engine
 *
 * Analyzes dream vs practical career tradeoffs
 */
export class IndiaTradeoffEngine {
  private config: IndiaTradeoffEngineConfig;

  constructor(config: Partial<IndiaTradeoffEngineConfig> = {}) {
    this.config = { ...DEFAULT_TRADEOFF_CONFIG, ...config };
  }

  /**
   * Analyze all relevant tradeoffs for a student
   */
  analyze(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis[] {
    const tradeoffs: TradeoffAnalysis[] = [];

    // JEE Tradeoff: Drop Year vs Accept College
    if (analysis.jee?.options.dropYear) {
      tradeoffs.push(this.analyzeJEEDropYearTradeoff(input, analysis));
    }

    // Career Path Tradeoff: UPSC vs Corporate
    if (analysis.upsc && input.selfAssessment.preferredWorkEnvironment !== 'GOVERNMENT') {
      tradeoffs.push(this.analyzeUPSCCorporateTradeoff(input, analysis));
    }

    // Medical Tradeoff: MBBS vs Engineering
    if (analysis.neet && analysis.jee) {
      tradeoffs.push(this.analyzeMedicalEngineeringTradeoff(input, analysis));
    }

    // College Tier Tradeoff: Tier 1 vs Affordable
    if (analysis.jee?.tradeoffs.feesVsPlacement) {
      tradeoffs.push(this.analyzeCollegeTierTradeoff(input, analysis));
    }

    // Family Business Tradeoff
    if (input.profile.familyBusinessInvolvement !== 'NO_BUSINESS' && analysis.familyBusiness) {
      tradeoffs.push(this.analyzeFamilyBusinessTradeoff(input, analysis));
    }

    // Location Tradeoff: Metro vs Hometown
    if (analysis.regional.mobilityProfile.canRelocate) {
      tradeoffs.push(this.analyzeLocationTradeoff(input, analysis));
    }

    return tradeoffs;
  }

  /**
   * Analyze JEE Drop Year vs Accept College
   */
  private analyzeJEEDropYearTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const dropYearOption: CareerOption = {
      name: 'Take Drop Year for JEE',
      type: 'PATHWAY',
      successProbability: analysis.jee!.options.dropYear.confidence,
      timeline: '1 year + 4 years engineering',
      cost: analysis.jee!.options.dropYear.requirements.estimatedCost,
      opportunityCost: 600000, // 1 year corporate salary
      expectedOutcome: `Expected rank improvement of ${analysis.jee!.options.dropYear.expectedImprovement.rankImprovement.toFixed(0)}, ` +
                      `${(analysis.jee!.options.dropYear.expectedImprovement.tierUpgradeProbability * 100).toFixed(0)}% chance of tier upgrade`,
      riskLevel: 'HIGH',
    };

    const acceptCollegeOption: CareerOption = {
      name: 'Accept Current College',
      type: 'PATHWAY',
      successProbability: 0.85,
      timeline: '4 years engineering',
      cost: analysis.jee!.recommendations.optimalChoice?.fees.total4Years || 1000000,
      opportunityCost: 0,
      expectedOutcome: `Graduate from ${analysis.jee!.recommendations.optimalChoice?.collegeName || 'available college'} ` +
                      `with avg package ₹${(analysis.jee!.recommendations.optimalChoice?.placement.averagePackage || 500000 / 100000).toFixed(1)}L`,
      riskLevel: 'LOW',
    };

    return this.buildTradeoffAnalysis(
      dropYearOption,
      acceptCollegeOption,
      'Drop Year',
      'Accept College',
      input,
      analysis
    );
  }

  /**
   * Analyze UPSC vs Corporate Career
   */
  private analyzeUPSCCorporateTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const upscOption: CareerOption = {
      name: 'UPSC Civil Services',
      type: 'EXAM',
      successProbability: analysis.upsc!.riskAssessment.selectionProbability,
      timeline: `${analysis.upsc!.attemptStrategy.recommendedAttempts} years preparation + attempts`,
      cost: analysis.upsc!.attemptStrategy.coachingRecommendation.cost,
      opportunityCost: analysis.upsc!.riskAssessment.opportunityCost.income,
      expectedOutcome: 'IAS/IPS/IRS with starting salary ₹8-12L + perks',
      riskLevel: 'HIGH',
    };

    const corporateOption: CareerOption = {
      name: 'Corporate Career',
      type: 'CAREER',
      successProbability: 0.7,
      timeline: 'Immediate entry after graduation',
      cost: 100000, // Skill development
      opportunityCost: 0,
      expectedOutcome: 'Private sector job with growth to ₹15-30L in 10 years',
      riskLevel: 'MEDIUM',
    };

    return this.buildTradeoffAnalysis(
      upscOption,
      corporateOption,
      'UPSC',
      'Corporate',
      input,
      analysis
    );
  }

  /**
   * Analyze MBBS vs Engineering
   */
  private analyzeMedicalEngineeringTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const mbbsOption: CareerOption = {
      name: 'Pursue Medicine (MBBS)',
      type: 'CAREER',
      successProbability: analysis.neet!.currentStatus.eligibleSeats.length > 0 ? 0.8 : 0.3,
      timeline: '5.5 years + 3 years PG',
      cost: analysis.neet!.financialAnalysis.totalInvestment,
      opportunityCost: 1200000, // 2 years of engineering salary
      expectedOutcome: 'Doctor with income ₹10L-50L depending on specialization',
      riskLevel: 'MEDIUM',
    };

    const engineeringOption: CareerOption = {
      name: 'Pursue Engineering',
      type: 'CAREER',
      successProbability: 0.9,
      timeline: '4 years',
      cost: analysis.jee?.recommendations.optimalChoice?.fees.total4Years || 1000000,
      opportunityCost: 0,
      expectedOutcome: 'Engineer with income ₹5-25L depending on college/tier',
      riskLevel: 'LOW',
    };

    return this.buildTradeoffAnalysis(
      mbbsOption,
      engineeringOption,
      'Medicine',
      'Engineering',
      input,
      analysis
    );
  }

  /**
   * Analyze College Tier Tradeoff
   */
  private analyzeCollegeTierTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const expensiveTier1Option: CareerOption = {
      name: 'Tier 1 Private College',
      type: 'PATHWAY',
      successProbability: 0.75,
      timeline: '4 years',
      cost: 2000000,
      opportunityCost: 0,
      expectedOutcome: 'Better placements (avg ₹8-12L) and brand value',
      riskLevel: 'MEDIUM',
    };

    const affordableOption: CareerOption = {
      name: 'Government/Tier 2 College',
      type: 'PATHWAY',
      successProbability: 0.85,
      timeline: '4 years',
      cost: 500000,
      opportunityCost: 0,
      expectedOutcome: 'Lower fees, moderate placements (avg ₹4-6L), no debt',
      riskLevel: 'LOW',
    };

    return this.buildTradeoffAnalysis(
      expensiveTier1Option,
      affordableOption,
      'Tier 1 College',
      'Affordable College',
      input,
      analysis
    );
  }

  /**
   * Analyze Family Business Tradeoff
   */
  private analyzeFamilyBusinessTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const independentOption: CareerOption = {
      name: 'Independent Career',
      type: 'CAREER',
      successProbability: 0.6,
      timeline: 'Variable',
      cost: 500000,
      opportunityCost: analysis.familyBusiness!.independentPath.financialIndependence === 'DEPENDENT' ? 300000 : 0,
      expectedOutcome: 'Build your own career path and identity',
      riskLevel: 'HIGH',
    };

    const familyBusinessOption: CareerOption = {
      name: 'Join Family Business',
      type: 'CAREER',
      successProbability: 0.9,
      timeline: 'Immediate',
      cost: 0,
      opportunityCost: 0,
      expectedOutcome: 'Established platform with family support',
      riskLevel: 'LOW',
    };

    return this.buildTradeoffAnalysis(
      independentOption,
      familyBusinessOption,
      'Independent Career',
      'Family Business',
      input,
      analysis
    );
  }

  /**
   * Analyze Location Tradeoff
   */
  private analyzeLocationTradeoff(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const metroOption: CareerOption = {
      name: 'Move to Metro City',
      type: 'PATHWAY',
      successProbability: 0.7,
      timeline: 'Long-term',
      cost: 200000, // Relocation + higher living
      opportunityCost: 0,
      expectedOutcome: 'More opportunities, higher salaries, broader exposure',
      riskLevel: 'MEDIUM',
    };

    const hometownOption: CareerOption = {
      name: 'Stay in Hometown',
      type: 'PATHWAY',
      successProbability: 0.5,
      timeline: 'Long-term',
      cost: 0,
      opportunityCost: analysis.regional.opportunityLandscape.tier1Opportunities.accessible ? 0 : 300000,
      expectedOutcome: 'Lower costs, family support, limited local opportunities',
      riskLevel: 'LOW',
    };

    return this.buildTradeoffAnalysis(
      metroOption,
      hometownOption,
      'Metro City',
      'Hometown',
      input,
      analysis
    );
  }

  /**
   * Build complete tradeoff analysis
   */
  private buildTradeoffAnalysis(
    dreamOption: CareerOption,
    practicalOption: CareerOption,
    dreamLabel: string,
    practicalLabel: string,
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffAnalysis {
    const comparison = this.buildComparison(dreamOption, practicalOption, input);
    const framework = this.buildDecisionFramework(dreamOption, practicalOption);
    const recommendation = this.generateRecommendation(
      dreamOption,
      practicalOption,
      dreamLabel,
      practicalLabel,
      input,
      analysis
    );

    return {
      dreamOption,
      practicalOption,
      comparison,
      decisionFramework: framework,
      recommendation,
    };
  }

  /**
   * Build comparison between options
   */
  private buildComparison(
    dream: CareerOption,
    practical: CareerOption,
    input: IndiaIntelligenceInput
  ): TradeoffComparison {
    const dimensions = [
      {
        name: 'Success Probability',
        dreamScore: dream.successProbability,
        practicalScore: practical.successProbability,
        importance: 0.25,
      },
      {
        name: 'Financial Investment',
        dreamScore: Math.max(0, 1 - dream.cost / 5000000), // Lower cost = higher score
        practicalScore: Math.max(0, 1 - practical.cost / 5000000),
        importance: input.profile.familyIncome <= EconomicStratum.MIDDLE_CLASS ? 0.3 : 0.15,
      },
      {
        name: 'Timeline to Goal',
        dreamScore: Math.max(0, 1 - this.extractYears(dream.timeline) / 10),
        practicalScore: Math.max(0, 1 - this.extractYears(practical.timeline) / 10),
        importance: 0.2,
      },
      {
        name: 'Income Potential',
        dreamScore: this.extractIncome(dream.expectedOutcome) / 50, // Scale to 0-1
        practicalScore: this.extractIncome(practical.expectedOutcome) / 50,
        importance: 0.2,
      },
      {
        name: 'Risk Level',
        dreamScore: dream.riskLevel === 'LOW' ? 1 : dream.riskLevel === 'MEDIUM' ? 0.5 : 0.2,
        practicalScore: practical.riskLevel === 'LOW' ? 1 : practical.riskLevel === 'MEDIUM' ? 0.5 : 0.2,
        importance: input.selfAssessment.riskTolerance === 'LOW' ? 0.25 : 0.15,
      },
    ];

    const financialComparison = {
      dreamInvestment: dream.cost,
      practicalInvestment: practical.cost,
      dreamReturn: this.extractIncome(dream.expectedOutcome) * 10, // 10 year income
      practicalReturn: this.extractIncome(practical.expectedOutcome) * 10,
    };

    const regretAnalysis = {
      regretIfDreamFails: `If ${dream.name} fails after ${this.extractYears(dream.timeline)} years, you lose time and money, but gain experience.`,
      regretIfPracticalChosen: `If you choose ${practical.name}, you may wonder "what if" but have stability.`,
    };

    return {
      dimensions,
      financialComparison,
      regretAnalysis,
    };
  }

  /**
   * Build decision framework
   */
  private buildDecisionFramework(
    dream: CareerOption,
    practical: CareerOption
  ): DecisionFramework {
    return {
      questionsToAsk: [
        `Can you afford ${dream.cost.toLocaleString()} and ${this.extractYears(dream.timeline)} years without income?`,
        `How will you feel in 10 years if you don't try ${dream.name}?`,
        `Do you have family support for ${dream.riskLevel.toLowerCase()}-risk path?`,
        `What's your backup plan if ${dream.name} doesn't work out?`,
      ],
      criteriaToEvaluate: [
        'Financial runway available',
        'Emotional resilience for failure',
        'Family situation and obligations',
        'Age and timeline flexibility',
        'Alternative career prospects',
      ],
      dealBreakers: [
        dream.cost > 5000000 && 'Budget cannot exceed 50L',
        dream.riskLevel === 'HIGH' && 'Cannot tolerate high risk',
        this.extractYears(dream.timeline) > 8 && 'Cannot commit 8+ years',
      ].filter(Boolean) as string[],
      acceptableCompromises: [
        'Lower tier college for dream branch',
        'Delayed timeline for better preparation',
        'Part-time work during preparation',
        'Starting at smaller company',
      ],
    };
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    dream: CareerOption,
    practical: CareerOption,
    dreamLabel: string,
    practicalLabel: string,
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): TradeoffRecommendation {
    // Calculate scores
    let dreamScore = dream.successProbability;
    let practicalScore = practical.successProbability;

    // Adjust for economic constraints
    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      dreamScore *= 0.8; // Penalize expensive/risky options
      practicalScore *= 1.1; // Boost affordable options
    }

    // Adjust for risk tolerance
    if (input.selfAssessment.riskTolerance === 'LOW') {
      dreamScore *= dream.riskLevel === 'HIGH' ? 0.6 : 0.9;
    } else if (input.selfAssessment.riskTolerance === 'HIGH') {
      dreamScore *= 1.2;
    }

    // Adjust for family pressure
    if (input.profile.pressureIntensity === 'HIGH' || input.profile.pressureIntensity === 'EXTREME') {
      dreamScore *= 0.9;
      practicalScore *= 1.1;
    }

    // Determine recommendation
    let recommendedOption: TradeoffRecommendation['recommendedOption'];
    let confidence: number;
    const rationale: string[] = [];
    const conditions: string[] = [];

    if (dreamScore > practicalScore * 1.2) {
      recommendedOption = 'DREAM';
      confidence = dreamScore;
      rationale.push(`${dreamLabel} aligns better with your profile and goals`);
      rationale.push('Success probability justifies the risk');
      conditions.push('Secure financial backing for the duration');
      conditions.push('Have clear exit criteria and backup plan');
    } else if (practicalScore > dreamScore * 1.1) {
      recommendedOption = 'PRACTICAL';
      confidence = practicalScore;
      rationale.push(`${practicalLabel} offers more reliable path given your constraints`);
      rationale.push('Lower risk with acceptable outcomes');
    } else {
      recommendedOption = 'HYBRID';
      confidence = (dreamScore + practicalScore) / 2;
      rationale.push('Neither option is clearly superior');
      rationale.push('Consider phased approach or combining elements');
    }

    // Exit strategy
    const exitStrategy = recommendedOption === 'DREAM'
      ? `If ${dreamLabel} doesn't succeed within ${Math.ceil(this.extractYears(dream.timeline) * 1.5)} years, pivot to ${practicalLabel}`
      : `After establishing in ${practicalLabel}, you can explore ${dreamLabel} elements`;

    return {
      recommendedOption,
      confidence,
      rationale,
      conditions,
      exitStrategy,
    };
  }

  /**
   * Extract years from timeline string
   */
  private extractYears(timeline: string): number {
    const match = timeline.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }

  /**
   * Extract income from outcome string (in Lakhs)
   */
  private extractIncome(outcome: string): number {
    const match = outcome.match(/₹?(\d+)[-\s]?(\d*)\s*L/);
    if (match) {
      return parseInt(match[2] || match[1]);
    }
    // Default estimates
    if (outcome.includes('Doctor')) return 20;
    if (outcome.includes('IAS')) return 12;
    if (outcome.includes('Engineer')) return 8;
    return 5;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IndiaTradeoffEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for India Tradeoff Engine
 */
export function createIndiaTradeoffEngine(
  config?: Partial<IndiaTradeoffEngineConfig>
): IndiaTradeoffEngine {
  return new IndiaTradeoffEngine(config);
}
