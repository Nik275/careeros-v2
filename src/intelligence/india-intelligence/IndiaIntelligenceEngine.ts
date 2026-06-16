/**
 * India Intelligence Engine - Main Orchestrator
 *
 * Coordinates all India-specific intelligence sub-engines:
 * - JEEEngine (engineering entrance)
 * - NEETEngine (medical entrance)
 * - UPSCEngine (civil services)
 * - CAEngine (professional courses)
 * - FamilyBusinessEngine (family dynamics)
 * - RegionalConstraintEngine (geographic constraints)
 * - EconomicConstraintEngine (financial reality)
 * - IndiaMotivationModel (motivation detection)
 * - IndiaExplanationEngine (context-aware explanations)
 * - IndiaTradeoffEngine (dream vs practical decisions)
 *
 * Usage:
 * ```typescript
 * const engine = createIndiaIntelligenceEngine();
 * const analysis = engine.analyze(input);
 * ```
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  IndiaIntelligenceAnalysis,
  IndiaIntelligenceConfig,
  DEFAULT_INDIA_INTELLIGENCE_CONFIG,
  IntegratedRecommendation,
  IndiaExamType,
  EconomicStratum,
  EngineeringCollegeTier,
} from './types';

import {
  JEEEngine,
  createJEEEngine,
  JEEEngineConfig,
} from './engines/JEEEngine';

import {
  NEETEngine,
  createNEETEngine,
  NEETEngineConfig,
} from './engines/NEETEngine';

import {
  UPSCEngine,
  createUPSCConfig,
  UPSCEngineConfig,
} from './engines/UPSCEngine';

import {
  CAEngine,
  createCAEngine,
  CAEngineConfig,
} from './engines/CAEngine';

import {
  FamilyBusinessEngine,
  createFamilyBusinessEngine,
  FamilyBusinessEngineConfig,
} from './engines/FamilyBusinessEngine';

import {
  RegionalConstraintEngine,
  createRegionalConstraintEngine,
  RegionalConstraintEngineConfig,
} from './engines/RegionalConstraintEngine';

import {
  EconomicConstraintEngine,
  createEconomicConstraintEngine,
  EconomicConstraintEngineConfig,
} from './engines/EconomicConstraintEngine';

import {
  IndiaMotivationModel,
  createIndiaMotivationModel,
  IndiaMotivationModelConfig,
} from './IndiaMotivationModel';

import {
  IndiaExplanationEngine,
  createIndiaExplanationEngine,
  IndiaExplanationEngineConfig,
} from './IndiaExplanationEngine';

import {
  IndiaTradeoffEngine,
  createIndiaTradeoffEngine,
  IndiaTradeoffEngineConfig,
} from './IndiaTradeoffEngine';

/**
 * Configuration for India Intelligence Engine
 */
export interface IndiaIntelligenceEngineConfig {
  /** Main engine configuration */
  engine?: Partial<IndiaIntelligenceConfig>;
  /** JEE Engine configuration */
  jee?: Partial<JEEEngineConfig>;
  /** NEET Engine configuration */
  neet?: Partial<NEETEngineConfig>;
  /** UPSC Engine configuration */
  upsc?: Partial<UPSCEngineConfig>;
  /** CA Engine configuration */
  ca?: Partial<CAEngineConfig>;
  /** Family Business Engine configuration */
  familyBusiness?: Partial<FamilyBusinessEngineConfig>;
  /** Regional Constraint Engine configuration */
  regional?: Partial<RegionalConstraintEngineConfig>;
  /** Economic Constraint Engine configuration */
  economic?: Partial<EconomicConstraintEngineConfig>;
  /** Motivation Model configuration */
  motivation?: Partial<IndiaMotivationModelConfig>;
  /** Explanation Engine configuration */
  explanation?: Partial<IndiaExplanationEngineConfig>;
  /** Tradeoff Engine configuration */
  tradeoff?: Partial<IndiaTradeoffEngineConfig>;
}

/**
 * Main India Intelligence Engine
 */
export class IndiaIntelligenceEngine {
  private config: IndiaIntelligenceConfig;
  private jeeEngine: JEEEngine;
  private neetEngine: NEETEngine;
  private upscEngine: UPSCEngine;
  private caEngine: CAEngine;
  private familyBusinessEngine: FamilyBusinessEngine;
  private regionalEngine: RegionalConstraintEngine;
  private economicEngine: EconomicConstraintEngine;
  private motivationModel: IndiaMotivationModel;
  private explanationEngine: IndiaExplanationEngine;
  private tradeoffEngine: IndiaTradeoffEngine;

  constructor(config: IndiaIntelligenceEngineConfig = {}) {
    this.config = { ...DEFAULT_INDIA_INTELLIGENCE_CONFIG, ...config.engine };

    this.jeeEngine = createJEEEngine(config.jee);
    this.neetEngine = createNEETEngine(config.neet);
    this.upscEngine = createUPSCConfig(config.upsc);
    this.caEngine = createCAEngine(config.ca);
    this.familyBusinessEngine = createFamilyBusinessEngine(config.familyBusiness);
    this.regionalEngine = createRegionalConstraintEngine(config.regional);
    this.economicEngine = createEconomicConstraintEngine(config.economic);
    this.motivationModel = createIndiaMotivationModel(config.motivation);
    this.explanationEngine = createIndiaExplanationEngine(config.explanation);
    this.tradeoffEngine = createIndiaTradeoffEngine(config.tradeoff);
  }

  /**
   * Perform comprehensive India intelligence analysis
   */
  analyze(input: IndiaIntelligenceInput): IndiaIntelligenceAnalysis {
    const startTime = Date.now();

    // Run all constraint and context engines first
    const regional = this.regionalEngine.analyze(input);
    const economic = this.economicEngine.analyze(input);

    // Run motivation analysis
    const motivations = this.motivationModel.analyze(input);

    // Run exam-specific engines based on stated interests
    let jee = undefined;
    let neet = undefined;
    let upsc = undefined;
    let ca = undefined;

    if (this.shouldRunJEE(input)) {
      jee = this.jeeEngine.analyze(input);
    }

    if (this.shouldRunNEET(input)) {
      neet = this.neetEngine.analyze(input);
    }

    if (this.shouldRunUPSC(input)) {
      upsc = this.upscEngine.analyze(input);
    }

    if (this.shouldRunCA(input)) {
      ca = this.caEngine.analyze(input);
    }

    // Run family business analysis if applicable
    let familyBusiness = undefined;
    if (input.familyBusiness && this.config.familyBusinessEnabled) {
      familyBusiness = this.familyBusinessEngine.analyze(input, input.familyBusiness);
    }

    // Build preliminary analysis for tradeoff and explanation engines
    const preliminaryAnalysis: IndiaIntelligenceAnalysis = {
      id: this.generateAnalysisId(),
      timestamp: Date.now(),
      studentId: input.profile.id,
      engineVersion: '2.0.0',
      jee,
      neet,
      upsc,
      ca,
      familyBusiness,
      regional,
      economic,
      motivations,
      tradeoffs: [],
      explanation: {} as any,
      integratedRecommendations: [],
      realityCheck: {
        dreamCareerFeasibility: 'MODERATE',
        optimalPathGivenConstraints: '',
        unacceptableTradeoffs: [],
        hiddenOpportunities: [],
      },
    };

    // Generate tradeoffs
    const tradeoffs = this.tradeoffEngine.analyze(input, preliminaryAnalysis);

    // Generate integrated recommendations
    const integratedRecommendations = this.generateIntegratedRecommendations(
      input,
      preliminaryAnalysis
    );

    // Generate reality check
    const realityCheck = this.generateRealityCheck(input, preliminaryAnalysis);

    // Update preliminary analysis
    const updatedAnalysis: IndiaIntelligenceAnalysis = {
      ...preliminaryAnalysis,
      tradeoffs,
      integratedRecommendations,
      realityCheck,
    };

    // Generate explanations
    const explanation = this.explanationEngine.generate(input, updatedAnalysis);

    // Return complete analysis
    return {
      ...updatedAnalysis,
      explanation,
    };
  }

  /**
   * Quick analysis for lightweight use cases
   */
  quickAnalyze(input: IndiaIntelligenceInput): {
    primaryMotivation: string;
    constraints: string[];
    topRecommendations: string[];
    feasibility: 'HIGH' | 'MODERATE' | 'LOW';
  } {
    const motivations = this.motivationModel.analyze(input);
    const regional = this.regionalEngine.analyze(input);
    const economic = this.economicEngine.analyze(input);

    const constraints: string[] = [];

    if (regional.constraintFactors.length > 0) {
      constraints.push(...regional.constraintFactors.map(f => f.factor));
    }

    if (economic.constraints.length > 0) {
      constraints.push(...economic.constraints.map(c => c.type));
    }

    // Determine feasibility
    let feasibility: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

    if (constraints.includes('BLOCKING') || constraints.includes('CRITICAL')) {
      feasibility = 'LOW';
    } else if (constraints.length <= 2) {
      feasibility = 'HIGH';
    }

    // Generate top recommendations
    const topRecommendations: string[] = [];

    if (economic.recommendations.financiallyViablePaths.length > 0) {
      topRecommendations.push(...economic.recommendations.financiallyViablePaths.slice(0, 2));
    }

    return {
      primaryMotivation: motivations.primaryMotivation,
      constraints: [...new Set(constraints)],
      topRecommendations,
      feasibility,
    };
  }

  /**
   * Determine if JEE analysis should run
   */
  private shouldRunJEE(input: IndiaIntelligenceInput): boolean {
    if (!this.config.jeeEnabled) return false;

    // Check explicit interest
    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('engineer') ||
      c.toLowerCase().includes('iit') ||
      c.toLowerCase().includes('nit')
    )) {
      return true;
    }

    // Check exam attempts
    if (input.profile.examAttempts.some(a => a.examType === 'JEE')) {
      return true;
    }

    // Check education level
    if (input.profile.currentEducationLevel === 'SCHOOL_12' ||
        input.profile.currentEducationLevel === 'SCHOOL_10') {
      return true;
    }

    return false;
  }

  /**
   * Determine if NEET analysis should run
   */
  private shouldRunNEET(input: IndiaIntelligenceInput): boolean {
    if (!this.config.neetEnabled) return false;

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('doctor') ||
      c.toLowerCase().includes('medical') ||
      c.toLowerCase().includes('mbbs')
    )) {
      return true;
    }

    if (input.profile.examAttempts.some(a => a.examType === 'NEET')) {
      return true;
    }

    return false;
  }

  /**
   * Determine if UPSC analysis should run
   */
  private shouldRunUPSC(input: IndiaIntelligenceInput): boolean {
    if (!this.config.upscEnabled) return false;

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('ias') ||
      c.toLowerCase().includes('civil service') ||
      c.toLowerCase().includes('upsc')
    )) {
      return true;
    }

    if (input.profile.examAttempts.some(a => a.examType === 'UPSC')) {
      return true;
    }

    if (input.selfAssessment.preferredWorkEnvironment === 'GOVERNMENT') {
      return true;
    }

    return false;
  }

  /**
   * Determine if CA analysis should run
   */
  private shouldRunCA(input: IndiaIntelligenceInput): boolean {
    if (!this.config.caEnabled) return false;

    if (input.statedPreferences.preferredCareers.some(c =>
      c.toLowerCase().includes('ca') ||
      c.toLowerCase().includes('chartered') ||
      c.toLowerCase().includes('accountant')
    )) {
      return true;
    }

    return false;
  }

  /**
   * Generate integrated recommendations
   */
  private generateIntegratedRecommendations(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): IntegratedRecommendation[] {
    const recommendations: IntegratedRecommendation[] = [];

    // Score each potential path
    const pathScores: Map<string, { score: number; rationale: string[]; constraints: string[] }> = new Map();

    // JEE paths
    if (analysis.jee?.recommendations.optimalChoice) {
      const college = analysis.jee.recommendations.optimalChoice;
      const rationale: string[] = [];
      let score = 0.5;

      if (this.isTopEngineeringTier(college.collegeTier)) score += 0.2; // IIT/NIT
      if (college.placement.tier === 'TIER_1') score += 0.15;

      const totalCost = college.fees.total4Years + college.fees.hostelAdditional;
      if (totalCost <= input.profile.financialConstraints.maxEducationBudget) {
        score += 0.1;
        rationale.push('Within budget');
      }

      pathScores.set(`Engineering at ${college.collegeName}`, {
        score,
        rationale: [...rationale, ...analysis.jee.recommendations.rationale],
        constraints: analysis.jee.recommendations.warnings,
      });
    }

    // NEET paths
    if (analysis.neet?.recommendations.primaryPath === 'GOVT_MBBS') {
      pathScores.set('MBBS Government College', {
        score: 0.9,
        rationale: analysis.neet.recommendations.rationale,
        constraints: analysis.neet.recommendations.warnings,
      });
    }

    // UPSC path
    if (analysis.upsc?.recommendations.shouldAttempt) {
      const score = analysis.upsc.currentReadiness.overallReadiness === 'STRONG' ? 0.7 : 0.4;
      pathScores.set('UPSC Civil Services', {
        score,
        rationale: [analysis.upsc.recommendations.optimalStrategy],
        constraints: analysis.upsc.recommendations.warnings,
      });
    }

    // CA path
    if (analysis.ca?.recommendations.shouldContinue) {
      pathScores.set('CA Professional Course', {
        score: 0.75,
        rationale: [analysis.ca.recommendations.strategyForSuccess[0]],
        constraints: [],
      });
    }

    // Family Business
    if (analysis.familyBusiness?.recommendations.optimalPath) {
      const score = analysis.familyBusiness.recommendations.optimalPath === 'JOIN_NOW' ? 0.8 :
                    analysis.familyBusiness.recommendations.optimalPath === 'HYBRID' ? 0.7 : 0.5;

      pathScores.set('Family Business', {
        score,
        rationale: analysis.familyBusiness.recommendations.rationale,
        constraints: [],
      });
    }

    // Government job paths
    if (analysis.economic.recommendations.financiallyViablePaths.includes('Government Job (SSC/Banking/State PSC)')) {
      pathScores.set('Government Job (Banking/SSC)', {
        score: 0.65,
        rationale: ['Reliable income path', 'Job security'],
        constraints: [],
      });
    }

    // Sort by score and create recommendations
    const sortedPaths = Array.from(pathScores.entries())
      .sort((a, b) => b[1].score - a[1].score);

    for (let i = 0; i < sortedPaths.length; i++) {
      const [path, data] = sortedPaths[i];

      let category: IntegratedRecommendation['category'] = 'REALISTIC';
      if (i === 0) category = 'OPTIMAL';
      else if (i === sortedPaths.length - 1) category = 'BACKUP';

      recommendations.push({
        rank: i + 1,
        path,
        category,
        confidence: data.score,
        rationale: data.rationale,
        constraintsConsidered: [
          ...analysis.economic.constraints.map(c => c.type),
          ...analysis.regional.constraintFactors.map(f => f.factor),
        ],
        timeline: this.estimateTimeline(path),
        nextSteps: this.generateNextSteps(path, analysis),
      });
    }

    return recommendations;
  }

  /**
   * Estimate timeline for a path
   */
  private estimateTimeline(path: string): string {
    if (path.includes('MBBS')) return '5.5 years + 3 years PG';
    if (path.includes('Engineering')) return '4 years';
    if (path.includes('UPSC')) return '2-6 years (including attempts)';
    if (path.includes('CA')) return '4-5 years';
    if (path.includes('Government')) return '1-2 years preparation';
    if (path.includes('Family Business')) return 'Immediate to 3 years';
    return 'Varies';
  }

  /**
   * Generate next steps for a path
   */
  private generateNextSteps(path: string, analysis: IndiaIntelligenceAnalysis): string[] {
    const steps: string[] = [];

    if (path.includes('Engineering')) {
      steps.push('Register for JEE Main/Advanced');
      steps.push('Research specific colleges and branches');
      steps.push('Apply for counseling');
    } else if (path.includes('MBBS')) {
      steps.push('Register for NEET counseling');
      steps.push('Prepare documents for admission');
      steps.push('Research college bonds and fees');
    } else if (path.includes('UPSC')) {
      steps.push('Start NCERT reading');
      steps.push('Join coaching or self-study plan');
      steps.push('Clear Prelims syllabus in 6 months');
    } else if (path.includes('CA')) {
      steps.push('Register with ICAI');
      steps.push('Begin Foundation/Intermediate preparation');
      steps.push('Plan articleship timing');
    } else if (path.includes('Government')) {
      steps.push('Choose specific exam (Banking/SSC/State PSC)');
      steps.push('Get study material');
      steps.push('Create daily study schedule');
    } else if (path.includes('Family Business')) {
      steps.push('Have structured discussion with parents');
      steps.push('Understand business financials');
      steps.push('Identify your role and timeline');
    }

    return steps;
  }

  /**
   * Generate reality check
   */
  private generateRealityCheck(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): IndiaIntelligenceAnalysis['realityCheck'] {
    // Determine dream career feasibility
    let dreamCareerFeasibility: IndiaIntelligenceAnalysis['realityCheck']['dreamCareerFeasibility'] = 'MODERATE';

    const blockingConstraints = [
      ...analysis.economic.constraints.filter(c => c.severity === 'BLOCKING'),
      ...analysis.regional.constraintFactors.filter(f => f.impact === 'CRITICAL'),
    ];

    if (blockingConstraints.length >= 2) {
      dreamCareerFeasibility = 'VERY_LOW';
    } else if (blockingConstraints.length === 1) {
      dreamCareerFeasibility = 'LOW';
    } else if (analysis.economic.constraints.length === 0 &&
               analysis.regional.constraintFactors.length <= 1) {
      dreamCareerFeasibility = 'HIGH';
    }

    // Determine optimal path given constraints
    const optimalPath = analysis.integratedRecommendations[0]?.path ||
                       analysis.economic.recommendations.financiallyViablePaths[0] ||
                       'Further exploration needed';

    // Identify unacceptable tradeoffs
    const unacceptableTradeoffs: string[] = [];

    for (const tradeoff of analysis.tradeoffs) {
      if (tradeoff.recommendation.recommendedOption === 'PRACTICAL' &&
          tradeoff.dreamOption.riskLevel === 'HIGH') {
        unacceptableTradeoffs.push(`High risk of ${tradeoff.dreamOption.name}`);
      }
    }

    if (input.profile.financialConstraints.loanTolerance === 'NONE' &&
        analysis.economic.constraints.some(c => c.type === 'UPFRONT_COST')) {
      unacceptableTradeoffs.push('High education costs without loan option');
    }

    // Identify hidden opportunities
    const hiddenOpportunities: string[] = [];

    if (input.profile.familyIncome <= EconomicStratum.LOWER_MIDDLE) {
      hiddenOpportunities.push('Government scholarship schemes for economically weaker sections');
      hiddenOpportunities.push('Free coaching programs for competitive exams');
    }

    if (input.profile.academicPerformance.class10Percentage >= 90) {
      hiddenOpportunities.push('Merit-based fee waivers at private institutions');
    }

    if (input.profile.currentLocation === 'TIER_3_TOWN' || input.profile.currentLocation === 'RURAL') {
      hiddenOpportunities.push('Rural quota benefits in government jobs');
      hiddenOpportunities.push('Distance education options while staying local');
    }

    return {
      dreamCareerFeasibility,
      optimalPathGivenConstraints: optimalPath,
      unacceptableTradeoffs,
      hiddenOpportunities,
    };
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): string {
    return `india_analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private isTopEngineeringTier(tier: EngineeringCollegeTier): boolean {
    return [
      EngineeringCollegeTier.OLD_IIT,
      EngineeringCollegeTier.NEW_IIT,
      EngineeringCollegeTier.TOP_NIT,
    ].includes(tier);
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<IndiaIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): IndiaIntelligenceConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for India Intelligence Engine
 */
export function createIndiaIntelligenceEngine(
  config: IndiaIntelligenceEngineConfig = {}
): IndiaIntelligenceEngine {
  return new IndiaIntelligenceEngine(config);
}

// Re-export all types and engines
export * from './types';
export { JEEEngine, createJEEEngine } from './engines/JEEEngine';
export { NEETEngine, createNEETEngine } from './engines/NEETEngine';
export { UPSCEngine, createUPSCConfig } from './engines/UPSCEngine';
export { CAEngine, createCAEngine } from './engines/CAEngine';
export { FamilyBusinessEngine, createFamilyBusinessEngine } from './engines/FamilyBusinessEngine';
export { RegionalConstraintEngine, createRegionalConstraintEngine } from './engines/RegionalConstraintEngine';
export { EconomicConstraintEngine, createEconomicConstraintEngine } from './engines/EconomicConstraintEngine';
export { IndiaMotivationModel, createIndiaMotivationModel } from './IndiaMotivationModel';
export { IndiaExplanationEngine, createIndiaExplanationEngine } from './IndiaExplanationEngine';
export { IndiaTradeoffEngine, createIndiaTradeoffEngine } from './IndiaTradeoffEngine';
