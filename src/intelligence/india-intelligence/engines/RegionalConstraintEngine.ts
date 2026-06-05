/**
 * India Intelligence - Regional Constraint Engine
 *
 * Models geographic constraints and mobility limitations including:
 * - Tier 1/2/3/Rural location realities
 * - Mobility constraints (family, financial, cultural)
 * - Language and cultural barriers
 * - Local opportunity limitations
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  RegionalConstraintAnalysis,
  RegionalTier,
  MobilityProfile,
  ConstraintFactor,
  OpportunityLandscape,
  RegionalRecommendation,
} from '../types';

/**
 * Regional Constraint Engine Configuration
 */
export interface RegionalConstraintEngineConfig {
  /** Strict mode - treat constraints as hard limits */
  strictMode: boolean;
  /** Weight for family constraints */
  familyConstraintWeight: number;
  /** Weight for financial constraints */
  financialConstraintWeight: number;
}

/**
 * Default Regional Constraint Engine configuration
 */
export const DEFAULT_REGIONAL_CONFIG: RegionalConstraintEngineConfig = {
  strictMode: true,
  familyConstraintWeight: 0.4,
  financialConstraintWeight: 0.3,
};

/**
 * Regional Constraint Engine
 *
 * Analyzes geographic mobility and constraints
 */
export class RegionalConstraintEngine {
  private config: RegionalConstraintEngineConfig;

  constructor(config: Partial<RegionalConstraintEngineConfig> = {}) {
    this.config = { ...DEFAULT_REGIONAL_CONFIG, ...config };
  }

  /**
   * Analyze regional constraints for a student
   */
  analyze(input: IndiaIntelligenceInput): RegionalConstraintAnalysis {
    // Determine current tier
    const currentTier = input.profile.currentLocation;

    // Build mobility profile
    const mobilityProfile = this.buildMobilityProfile(input);

    // Identify constraint factors
    const constraintFactors = this.identifyConstraintFactors(input);

    // Analyze opportunity landscape
    const opportunityLandscape = this.analyzeOpportunityLandscape(
      currentTier,
      mobilityProfile,
      input
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentTier,
      mobilityProfile,
      constraintFactors,
      opportunityLandscape,
      input
    );

    return {
      currentTier,
      mobilityProfile,
      constraintFactors,
      opportunityLandscape,
      recommendations,
    };
  }

  /**
   * Build mobility profile
   */
  private buildMobilityProfile(
    input: IndiaIntelligenceInput
  ): MobilityProfile {
    return {
      canRelocate: input.profile.canRelocate,
      preferredLocations: input.statedPreferences.preferredLocations,
      forbiddenLocations: input.profile.relocationConstraints || [],
      familyDistanceConstraint: this.estimateDistanceConstraint(input),
      languageConstraints: this.identifyLanguageConstraints(input),
      culturalConstraints: this.identifyCulturalConstraints(input),
      financialConstraints: {
        relocationCost: this.estimateRelocationCost(input),
        canAfford: this.canAffordRelocation(input),
      },
    };
  }

  /**
   * Estimate distance constraint (max km from family)
   */
  private estimateDistanceConstraint(input: IndiaIntelligenceInput): number {
    if (!input.profile.canRelocate) return 50; // Within same city

    const tier = input.profile.currentLocation;

    const baseDistances: Record<RegionalTier, number> = {
      [RegionalTier.TIER_1_METRO]: 1000,
      [RegionalTier.TIER_2_CITY]: 500,
      [RegionalTier.TIER_3_TOWN]: 200,
      [RegionalTier.RURAL]: 100,
    };

    // Adjust for family dependents
    if (input.profile.familyDependents > 2) {
      return baseDistances[tier] * 0.5;
    }

    return baseDistances[tier];
  }

  /**
   * Identify language constraints
   */
  private identifyLanguageConstraints(input: IndiaIntelligenceInput): string[] {
    const constraints: string[] = [];

    // Check if Hindi is known (for North India moves)
    if (!input.profile.languagesKnown.includes('Hindi') &&
        !input.profile.languagesKnown.includes('English')) {
      constraints.push('Hindi required for North India opportunities');
    }

    // Check for regional languages
    const southIndianLanguages = ['Tamil', 'Telugu', 'Kannada', 'Malayalam'];
    const knowsSouthIndian = input.profile.languagesKnown.some(l =>
      southIndianLanguages.includes(l)
    );

    if (!knowsSouthIndian && input.profile.homeState !== 'Tamil Nadu' &&
        input.profile.homeState !== 'Karnataka' &&
        input.profile.homeState !== 'Telangana' &&
        input.profile.homeState !== 'Kerala') {
      constraints.push('Regional language barrier for South India');
    }

    return constraints;
  }

  /**
   * Identify cultural constraints
   */
  private identifyCulturalConstraints(input: IndiaIntelligenceInput): string[] {
    const constraints: string[] = [];

    // Food/cultural preferences
    if (input.profile.homeState === 'Gujarat' || input.profile.homeState === 'Rajasthan') {
      constraints.push('Vegetarian food availability outside home region');
    }

    // Marriage pressure
    if (input.profile.familyPressureSources.includes('MARRIAGE_PRESSURE')) {
      constraints.push('Marriage prospects may be affected by long-distance relocation');
    }

    return constraints;
  }

  /**
   * Estimate relocation cost
   */
  private estimateRelocationCost(input: IndiaIntelligenceInput): number {
    const tier = input.profile.currentLocation;

    const costs: Record<RegionalTier, number> = {
      [RegionalTier.TIER_1_METRO]: 50000,
      [RegionalTier.TIER_2_CITY]: 75000,
      [RegionalTier.TIER_3_TOWN]: 100000,
      [RegionalTier.RURAL]: 150000,
    };

    return costs[tier] || 100000;
  }

  /**
   * Check if can afford relocation
   */
  private canAffordRelocation(input: IndiaIntelligenceInput): boolean {
    const relocationCost = this.estimateRelocationCost(input);
    const buffer = 50000; // Additional buffer

    return input.profile.financialConstraints.maxEducationBudget >= (relocationCost + buffer);
  }

  /**
   * Identify constraint factors
   */
  private identifyConstraintFactors(
    input: IndiaIntelligenceInput
  ): ConstraintFactor[] {
    const factors: ConstraintFactor[] = [];

    // Family dependency
    if (input.profile.familyDependents > 0) {
      factors.push({
        factor: 'FAMILY_DEPENDENCY',
        impact: input.profile.familyDependents > 2 ? 'CRITICAL' : 'HIGH',
        description: `${input.profile.familyDependents} family members financially dependent`,
        mitigatable: true,
        mitigationOptions: [
          'Find location within commuting distance',
          'Establish remote income source',
          'Stagger relocation timeline',
        ],
      });
    }

    // Language constraints
    const languageConstraints = this.identifyLanguageConstraints(input);
    if (languageConstraints.length > 0) {
      factors.push({
        factor: 'LANGUAGE',
        impact: 'MODERATE',
        description: languageConstraints[0],
        mitigatable: true,
        mitigationOptions: [
          'Learn Hindi/English before moving',
          'Choose cosmopolitan cities initially',
          'Join language communities',
        ],
      });
    }

    // Financial constraints
    if (!this.canAffordRelocation(input)) {
      factors.push({
        factor: 'FINANCE',
        impact: 'HIGH',
        description: 'Insufficient funds for relocation',
        mitigatable: true,
        mitigationOptions: [
          'Request relocation assistance from employer',
          'Save for 6 months before moving',
          'Find remote work initially',
        ],
      });
    }

    // Caregiver responsibilities
    if (input.profile.familyDependents > 1 && input.profile.canRelocate === false) {
      factors.push({
        factor: 'CAREGIVER',
        impact: 'CRITICAL',
        description: 'Primary caregiver responsibilities',
        mitigatable: false,
        mitigationOptions: [
          'Arrange alternative care before relocating',
          'Choose nearby location',
          'Consider remote work options',
        ],
      });
    }

    return factors;
  }

  /**
   * Analyze opportunity landscape
   */
  private analyzeOpportunityLandscape(
    currentTier: RegionalTier,
    mobility: MobilityProfile,
    input: IndiaIntelligenceInput
  ): OpportunityLandscape {
    // Tier 1 opportunities
    const tier1Accessible = mobility.canRelocate &&
                           mobility.financialConstraints.canAfford &&
                           mobility.familyDistanceConstraint >= 500;

    const tier1Opportunities: OpportunityLandscape['tier1Opportunities'] = {
      accessible: tier1Accessible,
      types: tier1Accessible ? [
        'MNC Corporate Jobs',
        'Tech Startups',
        'Finance & Consulting',
        'Creative Industries',
        'Research Institutions',
      ] : [],
      barriers: tier1Accessible ? [] : [
        'High cost of living',
        'Distance from family',
        'Competition intensity',
        'Cultural adjustment',
      ],
    };

    // Tier 2 opportunities
    const tier2Accessible = mobility.canRelocate || currentTier === RegionalTier.TIER_2_CITY;

    const tier2Opportunities: OpportunityLandscape['tier2Opportunities'] = {
      accessible: tier2Accessible,
      types: [
        'IT Services Companies',
        'Manufacturing Units',
        'Regional Headquarters',
        'Healthcare',
        'Education Institutions',
      ],
      benefits: [
        'Lower cost of living than Tier 1',
        'Better work-life balance',
        'Growing opportunities',
        'Easier family proximity',
      ],
    };

    // Home region opportunities
    const homeRegionOpportunities: OpportunityLandscape['homeRegionOpportunities'] = {
      types: this.getHomeRegionOpportunities(currentTier),
      limitations: this.getHomeRegionLimitations(currentTier),
      growthPotential: currentTier === RegionalTier.TIER_2_CITY ? 'HIGH' :
                       currentTier === RegionalTier.TIER_3_TOWN ? 'MODERATE' : 'LOW',
    };

    return {
      tier1Opportunities,
      tier2Opportunities,
      homeRegionOpportunities,
    };
  }

  /**
   * Get home region opportunity types
   */
  private getHomeRegionOpportunities(tier: RegionalTier): string[] {
    const opportunities: Record<RegionalTier, string[]> = {
      [RegionalTier.TIER_1_METRO]: [
        'All career types available',
        'Startup ecosystem',
        'Multinational companies',
      ],
      [RegionalTier.TIER_2_CITY]: [
        'IT/ITES',
        'Manufacturing',
        'Education',
        'Healthcare',
        'Government jobs',
        'Family businesses',
      ],
      [RegionalTier.TIER_3_TOWN]: [
        'Local government jobs',
        'Small businesses',
        'Education sector',
        'Healthcare (limited)',
        'Agriculture allied',
      ],
      [RegionalTier.RURAL]: [
        'Agriculture',
        'Government schemes',
        'Primary education',
        'Basic healthcare',
        'Self-employment',
      ],
    };

    return opportunities[tier];
  }

  /**
   * Get home region limitations
   */
  private getHomeRegionLimitations(tier: RegionalTier): string[] {
    const limitations: Record<RegionalTier, string[]> = {
      [RegionalTier.TIER_1_METRO]: [
        'High competition',
        'High living costs',
        'Commute stress',
      ],
      [RegionalTier.TIER_2_CITY]: [
        'Limited MNC opportunities',
        'Lower salaries than Tier 1',
        'Fewer specialized roles',
      ],
      [RegionalTier.TIER_3_TOWN]: [
        'Limited corporate jobs',
        'Lower salary levels',
        'Few growth companies',
        'Networking limitations',
      ],
      [RegionalTier.RURAL]: [
        'Very limited formal employment',
        'Agriculture dependency',
        'Limited education/healthcare',
        'Connectivity issues',
      ],
    };

    return limitations[tier];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    currentTier: RegionalTier,
    mobility: MobilityProfile,
    constraints: ConstraintFactor[],
    opportunities: OpportunityLandscape,
    input: IndiaIntelligenceInput
  ): RegionalRecommendation {
    // Determine optimal location strategy
    let optimalLocation: string;
    let nearTermLocation: string;
    let longTermLocation: string;

    if (!mobility.canRelocate || constraints.some(c => c.impact === 'CRITICAL' && !c.mitigatable)) {
      // Must stay local
      optimalLocation = input.profile.homeState;
      nearTermLocation = input.profile.homeState;
      longTermLocation = input.profile.homeState;
    } else if (mobility.familyDistanceConstraint < 200) {
      // Nearby cities only
      optimalLocation = `Nearby Tier 2 city in ${input.profile.homeState}`;
      nearTermLocation = input.profile.homeState;
      longTermLocation = `Regional hub near ${input.profile.homeState}`;
    } else if (mobility.financialConstraints.canAfford) {
      // Can consider Tier 1
      optimalLocation = 'Metro with lowest cost (Pune/Hyderabad/Chennai)';
      nearTermLocation = input.profile.homeState;
      longTermLocation = 'Preferred Metro';
    } else {
      // Financial constraints
      optimalLocation = 'Tier 2 city with best opportunities';
      nearTermLocation = input.profile.homeState;
      longTermLocation = 'Growth Tier 2 city';
    }

    // Mobility strategy
    const mobilityStrategy = mobility.canRelocate
      ? `Phase 1: Build skills locally. Phase 2: Relocate to ${longTermLocation} for opportunities.`
      : 'Build location-independent skills (remote work, online businesses)';

    // Constraint workarounds
    const constraintWorkarounds: string[] = [];

    for (const constraint of constraints) {
      if (constraint.mitigatable) {
        constraintWorkarounds.push(...constraint.mitigationOptions.slice(0, 2));
      }
    }

    // Add general workarounds
    if (currentTier === RegionalTier.RURAL || currentTier === RegionalTier.TIER_3_TOWN) {
      constraintWorkarounds.push('Develop remote-work capable skills');
      constraintWorkarounds.push('Build online professional network');
    }

    return {
      optimalLocation,
      nearTermLocation,
      longTermLocation,
      mobilityStrategy,
      constraintWorkarounds,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RegionalConstraintEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for Regional Constraint Engine
 */
export function createRegionalConstraintEngine(
  config?: Partial<RegionalConstraintEngineConfig>
): RegionalConstraintEngine {
  return new RegionalConstraintEngine(config);
}
