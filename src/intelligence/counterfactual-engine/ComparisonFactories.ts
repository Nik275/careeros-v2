/**
 * CareerOS Counterfactual Engine - Comparison Factories
 *
 * Pre-built comparison factories for common career decision scenarios.
 * Enables quick "What if I choose X vs Y?" analysis using real career data.
 *
 * @module intelligence/counterfactual-engine
 * @version 1.0.0
 */

import {
  SOFTWARE_ENGINEER,
  DOCTOR,
  AI_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  INVESTMENT_BANKER,
  MANAGEMENT_CONSULTANT,
  CHARTERED_ACCOUNTANT,
  IAS_OFFICER,
  CORPORATE_LAWYER,
  UX_DESIGNER,
  RESEARCH_SCIENTIST,
} from '@/data';

import {
  CounterfactualEngine,
  CounterfactualComparison,
  CounterfactualConfig,
  PathComparisonData,
} from './CounterfactualEngine';

import {
  adaptCareerToPathData,
  createCareerComparisonPair,
  CareerAdapterInput,
  CareerAdapterConfig,
  DEFAULT_ADAPTER_CONFIG,
} from './CareerAdapter';

// ============================================================================
// COMMON COMPARISON FACTORIES
// ============================================================================

/**
 * Compare Medicine (Doctor) vs Software Engineering
 *
 * Classic dilemma: stable, prestigious healthcare vs dynamic, high-growth tech
 */
export function compareMedicineVsSoftwareEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    DOCTOR,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 25,
  });
}

/**
 * Compare AI Engineer vs Data Scientist
 *
 * Two closely related but distinct tech career paths
 */
export function compareAIEngineerVsDataScientist(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    AI_ENGINEER,
    DATA_SCIENTIST,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'detailed',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare Software Engineer vs Product Manager
 *
 * Technical IC track vs management/product track
 */
export function compareEngineerVsProductManager(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    SOFTWARE_ENGINEER,
    PRODUCT_MANAGER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare Investment Banking vs Software Engineering
 *
 * High finance vs high tech - two high-income paths with different lifestyles
 */
export function compareBankingVsEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    INVESTMENT_BANKER,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare Civil Services (IAS) vs Corporate Career
 *
 * Government prestige and stability vs private sector growth
 */
export function compareCivilServicesVsCorporate(
  corporateCareer: CareerAdapterInput = SOFTWARE_ENGINEER,
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    IAS_OFFICER,
    corporateCareer,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 30,
  });
}

/**
 * Compare CA (Chartered Accountant) vs Software Engineering
 *
 * Traditional professional services vs modern tech career
 */
export function compareCAVsEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    CHARTERED_ACCOUNTANT,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 25,
  });
}

/**
 * Compare Corporate Law vs Software Engineering
 *
 * Legal profession vs tech career
 */
export function compareLawVsEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    CORPORATE_LAWYER,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 25,
  });
}

/**
 * Compare UX Design vs Software Engineering
 *
 * Design-focused vs engineering-focused tech careers
 */
export function compareDesignVsEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    UX_DESIGNER,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'detailed',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare Research/PhD track vs Industry Engineering
 *
 * Academic research vs industry career
 */
export function compareResearchVsIndustry(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    RESEARCH_SCIENTIST,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 25,
  });
}

/**
 * Compare Consulting vs Software Engineering
 *
 * Management consulting vs tech career
 */
export function compareConsultingVsEngineering(
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary, alternative } = createCareerComparisonPair(
    MANAGEMENT_CONSULTANT,
    SOFTWARE_ENGINEER,
    config
  );

  return engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 20,
  });
}

// ============================================================================
// GENERIC COMPARISON FACTORIES
// ============================================================================

/**
 * Compare any two careers by their slugs
 * Uses the elite career dataset
 */
export function compareCareersBySlug(
  primarySlug: string,
  alternativeSlug: string,
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison | null {
  // Import elite careers dynamically
  const { getEliteCareerBySlug } = require('@/data');

  const primary = getEliteCareerBySlug(primarySlug);
  const alternative = getEliteCareerBySlug(alternativeSlug);

  if (!primary || !alternative) {
    console.error('Career comparison input was not found safely.');
    return null;
  }

  const engine = new CounterfactualEngine(config);
  const { primary: primaryData, alternative: altData } = createCareerComparisonPair(
    primary,
    alternative,
    config
  );

  return engine.compare({
    primary: primaryData,
    alternative: altData,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare any two Career objects directly
 */
export function compareAnyCareers(
  primary: CareerAdapterInput,
  alternative: CareerAdapterInput,
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison {
  const engine = new CounterfactualEngine(config);
  const { primary: primaryData, alternative: altData } = createCareerComparisonPair(
    primary,
    alternative,
    config
  );

  return engine.compare({
    primary: primaryData,
    alternative: altData,
    depth: 'comprehensive',
    timeHorizon: config?.timeHorizon || 20,
  });
}

/**
 * Compare a primary career against multiple alternatives
 */
export function compareAgainstAlternatives(
  primary: CareerAdapterInput,
  alternatives: CareerAdapterInput[],
  config?: Partial<CareerAdapterConfig & CounterfactualConfig>
): CounterfactualComparison[] {
  const engine = new CounterfactualEngine(config);
  const primaryData = adaptCareerToPathData(primary, config);

  return alternatives.map(alt => {
    const altData = adaptCareerToPathData(alt, config);
    return engine.compare({
      primary: primaryData,
      alternative: altData,
      depth: 'detailed',
      timeHorizon: config?.timeHorizon || 20,
    });
  });
}

// ============================================================================
// COMPARISON CATEGORIES
// ============================================================================

/**
 * Get all predefined comparison scenarios
 */
export function getAllComparisonScenarios(): Array<{
  id: string;
  name: string;
  description: string;
  primary: string;
  alternative: string;
  factory: () => CounterfactualComparison;
}> {
  return [
    {
      id: 'medicine-vs-engineering',
      name: 'Medicine vs Software Engineering',
      description: 'Classic dilemma: stable, prestigious healthcare vs dynamic, high-growth tech',
      primary: 'doctor',
      alternative: 'software-engineer',
      factory: compareMedicineVsSoftwareEngineering,
    },
    {
      id: 'ai-vs-data-science',
      name: 'AI Engineer vs Data Scientist',
      description: 'Two closely related but distinct tech career paths',
      primary: 'ai-engineer',
      alternative: 'data-scientist',
      factory: compareAIEngineerVsDataScientist,
    },
    {
      id: 'engineer-vs-pm',
      name: 'Software Engineer vs Product Manager',
      description: 'Technical IC track vs management/product track',
      primary: 'software-engineer',
      alternative: 'product-manager',
      factory: compareEngineerVsProductManager,
    },
    {
      id: 'banking-vs-engineering',
      name: 'Investment Banking vs Software Engineering',
      description: 'High finance vs high tech - two high-income paths with different lifestyles',
      primary: 'investment-banker',
      alternative: 'software-engineer',
      factory: compareBankingVsEngineering,
    },
    {
      id: 'civil-services-vs-corporate',
      name: 'Civil Services (IAS) vs Corporate Career',
      description: 'Government prestige and stability vs private sector growth',
      primary: 'ias-officer',
      alternative: 'software-engineer',
      factory: () => compareCivilServicesVsCorporate(),
    },
    {
      id: 'ca-vs-engineering',
      name: 'Chartered Accountant vs Software Engineering',
      description: 'Traditional professional services vs modern tech career',
      primary: 'chartered-accountant',
      alternative: 'software-engineer',
      factory: compareCAVsEngineering,
    },
    {
      id: 'law-vs-engineering',
      name: 'Corporate Law vs Software Engineering',
      description: 'Legal profession vs tech career',
      primary: 'corporate-lawyer',
      alternative: 'software-engineer',
      factory: compareLawVsEngineering,
    },
    {
      id: 'design-vs-engineering',
      name: 'UX Design vs Software Engineering',
      description: 'Design-focused vs engineering-focused tech careers',
      primary: 'ux-designer',
      alternative: 'software-engineer',
      factory: compareDesignVsEngineering,
    },
    {
      id: 'research-vs-industry',
      name: 'Research/PhD vs Industry Engineering',
      description: 'Academic research vs industry career',
      primary: 'research-scientist',
      alternative: 'software-engineer',
      factory: compareResearchVsIndustry,
    },
    {
      id: 'consulting-vs-engineering',
      name: 'Management Consulting vs Software Engineering',
      description: 'Management consulting vs tech career',
      primary: 'management-consultant',
      alternative: 'software-engineer',
      factory: compareConsultingVsEngineering,
    },
  ];
}

/**
 * Get comparison scenarios by category
 */
export function getComparisonsByCategory(
  category: 'tech' | 'professional' | 'government' | 'creative' | 'all' = 'all'
): Array<{ id: string; name: string; factory: () => CounterfactualComparison }> {
  const all = getAllComparisonScenarios();

  const categoryMap: Record<string, string[]> = {
    'tech': ['medicine-vs-engineering', 'ai-vs-data-science', 'engineer-vs-pm', 'banking-vs-engineering', 'ca-vs-engineering', 'law-vs-engineering', 'design-vs-engineering', 'research-vs-industry', 'consulting-vs-engineering'],
    'professional': ['medicine-vs-engineering', 'banking-vs-engineering', 'ca-vs-engineering', 'law-vs-engineering', 'consulting-vs-engineering'],
    'government': ['civil-services-vs-corporate'],
    'creative': ['design-vs-engineering'],
  };

  if (category === 'all') {
    return all.map(s => ({ id: s.id, name: s.name, factory: s.factory }));
  }

  const ids = categoryMap[category] || [];
  return all
    .filter(s => ids.includes(s.id))
    .map(s => ({ id: s.id, name: s.name, factory: s.factory }));
}
