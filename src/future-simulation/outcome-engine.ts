/**
 * CareerOS Future Simulation Engine - Outcome Engine
 *
 * Phase D.5: Future Simulation Engine
 *
 * Estimates potential advantages, risks, opportunities, and constraints.
 *
 * @module outcome-engine
 * @version 1.0.0
 */

import type {
  ScenarioOutcomes,
  PotentialOutcome,
  ScenarioType,
  TimeHorizon,
  LikelihoodEstimate,
  FutureSimulationConfig,
  KeyDriver,
  DriverCategory,
} from './future-simulation-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating potential outcomes.
 */
export class OutcomeEngine {
  /** Configuration */
  private config: FutureSimulationConfig;

  /**
   * Creates a new OutcomeEngine.
   *
   * @param config - Configuration
   */
  constructor(config: FutureSimulationConfig) {
    this.config = config;
  }

  /**
   * Generates scenario outcomes.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Scenario outcomes
   */
  generateOutcomes(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): ScenarioOutcomes {
    return {
      advantages: this.generateAdvantages(career, timeHorizon, scenarioType),
      risks: this.generateRisks(career, timeHorizon, scenarioType),
      opportunities: this.generateOpportunities(career, timeHorizon, scenarioType),
      constraints: this.generateConstraints(career, timeHorizon, scenarioType),
    };
  }

  /**
   * Generates potential advantages.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Potential advantages
   */
  private generateAdvantages(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): PotentialOutcome[] {
    const advantages: PotentialOutcome[] = [];
    const advantages_data = career.careerAdvantages;

    // Career growth advantage
    if (advantages_data.careerMobility?.score ?? 0 > 50) {
      advantages.push({
        name: 'Career Progression',
        description: 'Clear path to increasingly senior roles and responsibilities',
        likelihood: this.getScenarioLikelihood(scenarioType, 'HIGH'),
        impact: advantages_data.careerMobility.score ?? 70,
        timeframe: this.getTimeframe(timeHorizon, 0.5),
      });
    }

    // Financial advantage
    if (advantages_data.salaryGrowth?.score ?? 0 > 50) {
      advantages.push({
        name: 'Income Growth',
        description: 'Strong potential for increasing compensation over time',
        likelihood: this.getScenarioLikelihood(scenarioType, 'HIGH'),
        impact: advantages_data.salaryGrowth.score ?? 65,
        timeframe: this.getTimeframe(timeHorizon, 0.6),
      });
    }

    // Learning advantage
    if (advantages_data.skillDevelopment?.score ?? 0 > 50) {
      advantages.push({
        name: 'Continuous Learning',
        description: 'Ongoing opportunities to develop new skills and capabilities',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: advantages_data.skillDevelopment.score ?? 70,
        timeframe: this.getTimeframe(timeHorizon, 0.3),
      });
    }

    // Recognition advantage
    if (advantages_data.recognitionPotential?.score ?? 0 > 50) {
      advantages.push({
        name: 'Professional Recognition',
        description: 'Opportunities for visibility and acknowledgment in the field',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: advantages_data.recognitionPotential.score ?? 60,
        timeframe: this.getTimeframe(timeHorizon, 0.7),
      });
    }

    // Optionality advantage
    if (advantages_data.optionality?.score ?? 0 > 50) {
      advantages.push({
        name: 'Future Options',
        description: 'Preserves many future career paths and opportunities',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: advantages_data.optionality.score ?? 65,
        timeframe: this.getTimeframe(timeHorizon, 0.4),
      });
    }

    // Work-life advantage (if score is good)
    if (advantages_data.workLifeIntegration?.score ?? 0 > 60) {
      advantages.push({
        name: 'Work-Life Integration',
        description: 'Career allows for meaningful personal life outside work',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: advantages_data.workLifeIntegration.score ?? 70,
        timeframe: this.getTimeframe(timeHorizon, 0.2),
      });
    }

    // Add scenario-specific advantages
    if (scenarioType === 'OPTIMISTIC') {
      advantages.push({
        name: 'Accelerated Success',
        description: 'Faster than typical progression to senior roles',
        likelihood: 'POSSIBLE',
        impact: 75,
        timeframe: this.getTimeframe(timeHorizon, 0.4),
      });

      advantages.push({
        name: 'Unexpected Opportunities',
        description: 'Serendipitous opportunities arise from network and reputation',
        likelihood: 'POSSIBLE',
        impact: 70,
        timeframe: this.getTimeframe(timeHorizon, 0.6),
      });
    }

    return advantages.slice(0, 5);
  }

  /**
   * Generates potential risks.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Potential risks
   */
  private generateRisks(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): PotentialOutcome[] {
    const risks: PotentialOutcome[] = [];
    const risks_data = career.careerRisks;

    // Automation risk
    if (risks_data.automationRisk?.score ?? 0 > 40) {
      risks.push({
        name: 'Automation Displacement',
        description: 'Role may be partially or fully automated',
        likelihood: this.getScenarioLikelihood(scenarioType, 'RISK', risks_data.automationRisk.score),
        impact: risks_data.automationRisk.score ?? 50,
        timeframe: this.getTimeframe(timeHorizon, 0.7),
      });
    }

    // Competition risk
    if (risks_data.competitionRisk?.score ?? 0 > 40) {
      risks.push({
        name: 'Intense Competition',
        description: 'High competition for roles and advancement',
        likelihood: this.getScenarioLikelihood(scenarioType, 'RISK', risks_data.competitionRisk.score),
        impact: risks_data.competitionRisk.score ?? 55,
        timeframe: this.getTimeframe(timeHorizon, 0.3),
      });
    }

    // Education barrier
    if (risks_data.educationBarrier?.score ?? 0 > 40) {
      risks.push({
        name: 'Credential Requirements',
        description: 'Additional credentials may be required for advancement',
        likelihood: this.getScenarioLikelihood(scenarioType, 'RISK', risks_data.educationBarrier.score),
        impact: risks_data.educationBarrier.score ?? 45,
        timeframe: this.getTimeframe(timeHorizon, 0.5),
      });
    }

    // Physical demands
    if (risks_data.physicalDemands?.score ?? 0 > 50) {
      risks.push({
        name: 'Physical Strain',
        description: 'Physical demands may impact long-term sustainability',
        likelihood: this.getScenarioLikelihood(scenarioType, 'RISK', risks_data.physicalDemands.score),
        impact: risks_data.physicalDemands.score ?? 50,
        timeframe: this.getTimeframe(timeHorizon, 0.8),
      });
    }

    // Market risk
    if (risks_data.marketVolatility?.score ?? 0 > 40) {
      risks.push({
        name: 'Market Volatility',
        description: 'Industry or market instability affects career stability',
        likelihood: this.getScenarioLikelihood(scenarioType, 'RISK', risks_data.marketVolatility.score),
        impact: risks_data.marketVolatility.score ?? 55,
        timeframe: this.getTimeframe(timeHorizon, 0.4),
      });
    }

    // Add scenario-specific risks
    if (scenarioType === 'PESSIMISTIC') {
      risks.push({
        name: 'Career Stagnation',
        description: 'Limited opportunities for advancement or growth',
        likelihood: 'LIKELY',
        impact: 70,
        timeframe: this.getTimeframe(timeHorizon, 0.6),
      });

      risks.push({
        name: 'Skill Obsolescence',
        description: 'Skills become outdated or less valued',
        likelihood: 'POSSIBLE',
        impact: 65,
        timeframe: this.getTimeframe(timeHorizon, 0.7),
      });
    }

    return risks.slice(0, 5);
  }

  /**
   * Generates potential opportunities.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Potential opportunities
   */
  private generateOpportunities(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): PotentialOutcome[] {
    const opportunities: PotentialOutcome[] = [];
    const metadata = career.metadata;
    const category = metadata.category.toUpperCase();

    // Leadership opportunity
    if (career.workEnvironment.leadershipOpportunity?.score ?? 0 > 50) {
      opportunities.push({
        name: 'Leadership Roles',
        description: 'Opportunities to lead teams and initiatives',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: 70,
        timeframe: this.getTimeframe(timeHorizon, 0.6),
      });
    }

    // Entrepreneurship opportunity
    const founderFit = this.estimateFounderFit(category);
    if (founderFit > 50) {
      opportunities.push({
        name: 'Entrepreneurship',
        description: 'Foundation for starting own company or venture',
        likelihood: this.getScenarioLikelihood(scenarioType, 'LOW'),
        impact: 80,
        timeframe: this.getTimeframe(timeHorizon, 0.8),
      });
    }

    // Consulting opportunity
    opportunities.push({
      name: 'Independent Consulting',
      description: 'Leverage expertise as independent consultant',
      likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
      impact: 60,
      timeframe: this.getTimeframe(timeHorizon, 0.7),
    });

    // Specialization opportunity
    opportunities.push({
      name: 'Deep Specialization',
      description: 'Become recognized expert in niche area',
      likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
      impact: 75,
      timeframe: this.getTimeframe(timeHorizon, 0.7),
    });

    // Industry transition opportunity
    opportunities.push({
      name: 'Industry Transition',
      description: 'Apply skills in different industry or sector',
      likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
      impact: 65,
      timeframe: this.getTimeframe(timeHorizon, 0.5),
      });

    // Geographic mobility
    if (career.workEnvironment.remoteCompatibility?.score ?? 0 > 50) {
      opportunities.push({
        name: 'Geographic Flexibility',
        description: 'Work from different locations or relocate',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: 55,
        timeframe: this.getTimeframe(timeHorizon, 0.3),
      });
    }

    // Add scenario-specific opportunities
    if (scenarioType === 'OPTIMISTIC') {
      opportunities.push({
        name: 'Executive Track',
        description: 'Path to C-suite or senior executive role',
        likelihood: 'POSSIBLE',
        impact: 85,
        timeframe: this.getTimeframe(timeHorizon, 0.9),
      });

      opportunities.push({
        name: 'Industry Thought Leadership',
        description: 'Become recognized voice in the field',
        likelihood: 'POSSIBLE',
        impact: 75,
        timeframe: this.getTimeframe(timeHorizon, 0.8),
      });
    }

    return opportunities.slice(0, 5);
  }

  /**
   * Generates potential constraints.
   *
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @param scenarioType - Scenario type
   * @returns Potential constraints
   */
  private generateConstraints(
    career: CareerIntelligence,
    timeHorizon: TimeHorizon,
    scenarioType: ScenarioType
  ): PotentialOutcome[] {
    const constraints: PotentialOutcome[] = [];

    // Work schedule constraints
    const schedulePredictability = career.workEnvironment.schedulePredictability?.score ?? 50;
    if (schedulePredictability < 60) {
      constraints.push({
        name: 'Unpredictable Schedule',
        description: 'Work demands may require irregular hours',
        likelihood: this.getScenarioLikelihood(scenarioType, 'HIGH'),
        impact: 60,
        timeframe: this.getTimeframe(timeHorizon, 0.2),
      });
    }

    // Location constraints
    const remoteCompatibility = career.workEnvironment.remoteCompatibility?.score ?? 50;
    if (remoteCompatibility < 50) {
      constraints.push({
        name: 'Location Requirements',
        description: 'Role may require specific location or travel',
        likelihood: this.getScenarioLikelihood(scenarioType, 'HIGH'),
        impact: 55,
        timeframe: this.getTimeframe(timeHorizon, 0.2),
      });
    }

    // Skill ceiling constraint
    const learningRequirement = career.cognitiveDemands.learningRequirement?.score ?? 50;
    if (learningRequirement < 50) {
      constraints.push({
        name: 'Skill Development Ceiling',
        description: 'Limited opportunities for learning new skills',
        likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
        impact: 65,
        timeframe: this.getTimeframe(timeHorizon, 0.6),
      });
    }

    // Advancement ceiling
    constraints.push({
      name: 'Advancement Limitations',
      description: 'Organizational structure may limit promotion opportunities',
      likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
      impact: 60,
      timeframe: this.getTimeframe(timeHorizon, 0.7),
    });

    // Industry constraints
    constraints.push({
      name: 'Industry Specialization',
      description: 'Deep expertise may limit cross-industry mobility',
      likelihood: this.getScenarioLikelihood(scenarioType, 'MEDIUM'),
      impact: 50,
      timeframe: this.getTimeframe(timeHorizon, 0.8),
    });

    // Add scenario-specific constraints
    if (scenarioType === 'PESSIMISTIC') {
      constraints.push({
        name: 'Reduced Marketability',
        description: 'Skills may become less transferable over time',
        likelihood: 'LIKELY',
        impact: 65,
        timeframe: this.getTimeframe(timeHorizon, 0.7),
      });

      constraints.push({
        name: 'Lifestyle Sacrifices',
        description: 'Career demands may require significant personal compromises',
        likelihood: 'POSSIBLE',
        impact: 70,
        timeframe: this.getTimeframe(timeHorizon, 0.5),
      });
    }

    return constraints.slice(0, 5);
  }

  /**
   * Estimates founder fit for entrepreneurship.
   *
   * @param category - Career category
   * @returns Founder fit score (0-100)
   */
  private estimateFounderFit(category: string): number {
    const founderFitMap: Record<string, number> = {
      'ENGINEERING': 75,
      'PRODUCT': 80,
      'MARKETING': 70,
      'SALES': 75,
      'CONSULTING': 70,
      'DESIGN': 70,
      'DATA': 75,
      'OPERATIONS': 60,
      'FINANCE': 65,
      'RESEARCH': 55,
    };

    return founderFitMap[category] ?? 50;
  }

  /**
   * Gets scenario-adjusted likelihood.
   *
   * @param scenarioType - Scenario type
   * @param baseLikelihood - Base likelihood type
   * @param riskScore - Optional risk score for risk adjustment
   * @returns Adjusted likelihood
   */
  private getScenarioLikelihood(
    scenarioType: ScenarioType,
    baseLikelihood: 'HIGH' | 'MEDIUM' | 'LOW' | 'RISK',
    riskScore?: number
  ): LikelihoodEstimate {
    const likelihoodMap: Record<string, LikelihoodEstimate> = {
      'HIGH': 'LIKELY',
      'MEDIUM': 'POSSIBLE',
      'LOW': 'UNLIKELY',
      'RISK': riskScore && riskScore > 60 ? 'LIKELY' : riskScore && riskScore > 40 ? 'POSSIBLE' : 'UNLIKELY',
    };

    let likelihood = likelihoodMap[baseLikelihood];

    // Adjust by scenario
    if (scenarioType === 'OPTIMISTIC') {
      if (likelihood === 'VERY_UNLIKELY') likelihood = 'UNLIKELY';
      else if (likelihood === 'UNLIKELY') likelihood = 'POSSIBLE';
      else if (likelihood === 'POSSIBLE') likelihood = 'LIKELY';
      else if (likelihood === 'LIKELY') likelihood = 'VERY_LIKELY';
    } else if (scenarioType === 'PESSIMISTIC') {
      if (likelihood === 'VERY_LIKELY') likelihood = 'LIKELY';
      else if (likelihood === 'LIKELY') likelihood = 'POSSIBLE';
      else if (likelihood === 'POSSIBLE') likelihood = 'UNLIKELY';
      else if (likelihood === 'UNLIKELY') likelihood = 'VERY_UNLIKELY';
    }

    return likelihood;
  }

  /**
   * Gets timeframe string.
   *
   * @param timeHorizon - Time horizon
   * @param progress - Progress through horizon (0-1)
   * @returns Timeframe string
   */
  private getTimeframe(timeHorizon: TimeHorizon, progress: number): string {
    const years = Math.round(timeHorizon * progress);
    if (years === 0) return 'Early in career';
    if (years === 1) return 'Year 1';
    return `Years ${years - 1}-${years + 1}`;
  }

  /**
   * Identifies key drivers of outcomes.
   *
   * @param career - Career intelligence
   * @returns Key drivers
   */
  identifyKeyDrivers(career: CareerIntelligence): KeyDriver[] {
    const drivers: KeyDriver[] = [];

    // Personal drivers
    drivers.push({
      id: 'driver-learning-speed',
      name: 'Learning Speed',
      description: 'Rate at which you acquire new skills and adapt to changes',
      category: 'PERSONAL',
      importance: 80,
      influence: 'Determines how quickly you advance and adapt to changing demands',
      controllability: 'CONTROLLABLE',
    });

    drivers.push({
      id: 'driver-adaptability',
      name: 'Adaptability',
      description: 'Willingness and ability to change direction when needed',
      category: 'PERSONAL',
      importance: 75,
      influence: 'Affects ability to navigate career transitions and setbacks',
      controllability: 'CONTROLLABLE',
    });

    drivers.push({
      id: 'driver-persistence',
      name: 'Persistence',
      description: 'Ability to maintain effort despite obstacles',
      category: 'PERSONAL',
      importance: 70,
      influence: 'Determines success through difficult periods and challenges',
      controllability: 'CONTROLLABLE',
    });

    drivers.push({
      id: 'driver-risk-tolerance',
      name: 'Risk Tolerance',
      description: 'Comfort with uncertainty and taking calculated risks',
      category: 'PERSONAL',
      importance: 65,
      influence: 'Influences willingness to pursue opportunities and change paths',
      controllability: 'CONTROLLABLE',
    });

    // Skill drivers
    drivers.push({
      id: 'driver-technical-excellence',
      name: 'Technical Excellence',
      description: 'Depth and breadth of technical or domain skills',
      category: 'SKILL',
      importance: 75,
      influence: 'Foundation for career advancement and opportunities',
      controllability: 'CONTROLLABLE',
    });

    drivers.push({
      id: 'driver-communication',
      name: 'Communication Skills',
      description: 'Ability to convey ideas and influence others',
      category: 'SKILL',
      importance: 70,
      influence: 'Critical for leadership and collaboration',
      controllability: 'CONTROLLABLE',
    });

    // Market drivers
    drivers.push({
      id: 'driver-market-conditions',
      name: 'Market Conditions',
      description: 'Economic and industry health',
      category: 'MARKET',
      importance: 70,
      influence: 'Affects availability of opportunities and compensation',
      controllability: 'EXTERNAL',
    });

    drivers.push({
      id: 'driver-technology-change',
      name: 'Technology Change',
      description: 'Rate of technological change in the field',
      category: 'MARKET',
      importance: 65,
      influence: 'Creates both opportunities and obsolescence risks',
      controllability: 'EXTERNAL',
    });

    // Network drivers
    drivers.push({
      id: 'driver-professional-network',
      name: 'Professional Network',
      description: 'Quality and breadth of professional relationships',
      category: 'NETWORK',
      importance: 70,
      influence: 'Opens opportunities and provides support',
      controllability: 'PARTIAL',
    });

    // Organization drivers
    drivers.push({
      id: 'driver-organizational-fit',
      name: 'Organizational Fit',
      description: 'Alignment with employer culture and values',
      category: 'ORGANIZATION',
      importance: 60,
      influence: 'Affects satisfaction and advancement opportunities',
      controllability: 'PARTIAL',
    });

    return drivers.slice(0, this.config.maxKeyDrivers);
  }
}

/**
 * Creates a default outcome engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured OutcomeEngine
 */
export function createOutcomeEngine(
  config?: Partial<FutureSimulationConfig>
): OutcomeEngine {
  const fullConfig: FutureSimulationConfig = {
    ...import('./future-simulation-types').DEFAULT_FUTURE_SIMULATION_CONFIG,
    ...config,
  };

  return new OutcomeEngine(fullConfig);
}
