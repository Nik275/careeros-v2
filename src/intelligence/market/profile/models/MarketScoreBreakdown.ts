/**
 * CareerOS Market Intelligence - Market Score Breakdown Model
 *
 * Explainable scoring - no black-box calculations.
 */

/**
 * Contribution of a single factor to a score.
 */
export interface ScoreFactorContribution {
  /** Factor name */
  factor: string;

  /** Raw weight (0-1) */
  weight: number;

  /** Factor value (0-100) */
  value: number;

  /** Contribution to final score */
  contribution: number;

  /** Explanation of this factor */
  explanation: string;
}

/**
 * Adjustment applied to a score.
 */
export interface ScoreAdjustment {
  /** Type of adjustment */
  type: 'bonus' | 'penalty' | 'multiplier' | 'override';

  /** Amount of adjustment */
  amount: number;

  /** Reason for adjustment */
  reason: string;

  /** Evidence supporting adjustment */
  evidence?: string;
}

/**
 * Complete breakdown of how a score was calculated.
 */
export interface MarketScoreBreakdown {
  /** Score type */
  scoreType: 
    | 'demand' 
    | 'salary' 
    | 'growth' 
    | 'scarcity' 
    | 'automationRisk' 
    | 'resilience' 
    | 'opportunity';

  /** Career being scored */
  careerId: string;

  /** Timestamp of calculation */
  calculatedAt: Date;

  /** Individual factor contributions */
  contributions: ScoreFactorContribution[];

  /** Adjustments applied */
  adjustments: ScoreAdjustment[];

  /** Calculation formula used */
  formula: string;

  /** Base score (before adjustments) */
  baseScore: number;

  /** Final score (after adjustments) */
  finalScore: number;

  /** Confidence in this breakdown */
  confidence: number;

  /** Key evidence used */
  evidence: Array<{
    source: string;
    value: number;
    timestamp: Date;
    impact: number;
  }>;

  /** Comparison to previous calculation */
  previousCalculation?: {
    timestamp: Date;
    score: number;
    change: number;
  };
}

/**
 * Demand score breakdown.
 */
export interface DemandScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'demand';

  /** Job posting metrics */
  jobPostings: {
    count: number;
    growth: number;
    velocity: number;
  };

  /** Hiring metrics */
  hiring: {
    rate: number;
    timeToFill: number;
    competitionRatio: number;
  };

  /** Geographic demand distribution */
  geographicDemand: Array<{
    region: string;
    score: number;
    postingCount: number;
  }>;
}

/**
 * Salary score breakdown.
 */
export interface SalaryScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'salary';

  /** Entry level */
  entryLevel: {
    median: number;
    growth: number;
  };

  /** Mid level */
  midLevel: {
    median: number;
    growth: number;
  };

  /** Senior level */
  seniorLevel: {
    median: number;
    growth: number;
  };

  /** Regional variations */
  regionalVariation: Array<{
    region: string;
    medianSalary: number;
    costOfLivingAdjusted: number;
  }>;
}

/**
 * Growth score breakdown.
 */
export interface GrowthScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'growth';

  /** Hiring growth */
  hiringGrowth: {
    oneYear: number;
    threeYear: number;
    trend: 'accelerating' | 'steady' | 'decelerating';
  };

  /** Industry growth */
  industryGrowth: {
    sectorGrowth: number;
    marketExpansion: number;
  };

  /** Investment indicators */
  investment: {
    fundingGrowth: number;
    newCompanies: number;
  };
}

/**
 * Scarcity score breakdown.
 */
export interface ScarcityScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'scarcity';

  /** Talent availability */
  talentAvailability: {
    qualifiedCandidates: number;
    timeToHire: number;
    fillRate: number;
  };

  /** Skill gap metrics */
  skillGap: {
    requiredSkills: string[];
    availabilityScore: number;
    gapSeverity: number;
  };

  /** Education pipeline */
  educationPipeline: {
    graduatesPerYear: number;
    marketDemand: number;
    balanceRatio: number;
  };
}

/**
 * Automation risk score breakdown.
 */
export interface AutomationRiskBreakdown extends MarketScoreBreakdown {
  scoreType: 'automationRisk';

  /** Task automation potential */
  taskAutomation: {
    routineTasks: number;
    cognitiveTasks: number;
    creativeTasks: number;
    socialTasks: number;
  };

  /** AI substitution risk */
  aiSubstitution: {
    generativeAIRisk: number;
    machineLearningRisk: number;
    roboticRisk: number;
  };

  /** Timeline predictions */
  timeline: {
    shortTermRisk: number; // 0-2 years
    mediumTermRisk: number; // 2-5 years
    longTermRisk: number; // 5+ years
  };
}

/**
 * Future resilience score breakdown.
 */
export interface ResilienceScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'resilience';

  /** Skill adaptability */
  skillAdaptability: {
    transferableSkills: number;
    upskillingPotential: number;
    crossIndustryMobility: number;
  };

  /** Industry resilience */
  industryResilience: {
    industryStability: number;
    economicCycleResistance: number;
    globalCompetitionResistance: number;
  };

  /** Human dependency factors */
  humanDependency: {
    empathyRequired: number;
    creativityRequired: number;
    complexDecisionMaking: number;
  };
}

/**
 * Opportunity score breakdown.
 */
export interface OpportunityScoreBreakdown extends MarketScoreBreakdown {
  scoreType: 'opportunity';

  /** Component contributions */
  components: {
    demand: { score: number; weight: number; contribution: number };
    salary: { score: number; weight: number; contribution: number };
    growth: { score: number; weight: number; contribution: number };
    scarcity: { score: number; weight: number; contribution: number };
    automationRisk: { score: number; weight: number; contribution: number };
    resilience: { score: number; weight: number; contribution: number };
  };

  /** Risk-adjusted opportunity */
  riskAdjustedScore: number;

  /** Market timing assessment */
  marketTiming: 'favorable' | 'neutral' | 'unfavorable';
}

/**
 * Aggregate breakdown for a career profile.
 */
export interface CompleteScoreBreakdown {
  /** Career ID */
  careerId: string;

  /** Timestamp */
  generatedAt: Date;

  /** Individual score breakdowns */
  demand: DemandScoreBreakdown;
  salary: SalaryScoreBreakdown;
  growth: GrowthScoreBreakdown;
  scarcity: ScarcityScoreBreakdown;
  automationRisk: AutomationRiskBreakdown;
  resilience: ResilienceScoreBreakdown;
  opportunity: OpportunityScoreBreakdown;

  /** Overall profile confidence */
  overallConfidence: number;

  /** Data quality indicators */
  dataQuality: {
    signalCount: number;
    sourceDiversity: number;
    freshness: number;
    consistency: number;
  };
}

/**
 * Generate human-readable explanation of a score.
 */
export function explainScore(breakdown: MarketScoreBreakdown): string {
  const parts: string[] = [];

  // Base explanation
  parts.push(`${breakdown.scoreType} score: ${breakdown.finalScore}/100`);

  // Top contributors
  const topContributors = breakdown.contributions
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

  parts.push('Top factors:');
  for (const contrib of topContributors) {
    parts.push(`  - ${contrib.factor}: ${contrib.value}/100 (weight: ${Math.round(contrib.weight * 100)}%)`);
  }

  // Adjustments
  if (breakdown.adjustments.length > 0) {
    parts.push('Adjustments:');
    for (const adj of breakdown.adjustments) {
      const sign = adj.amount >= 0 ? '+' : '';
      parts.push(`  - ${adj.reason}: ${sign}${adj.amount}`);
    }
  }

  // Confidence
  parts.push(`Confidence: ${breakdown.confidence}%`);

  return parts.join('\n');
}

/**
 * Compare two score breakdowns.
 */
export function compareBreakdowns(
  base: MarketScoreBreakdown,
  comparison: MarketScoreBreakdown
): {
  scoreDiff: number;
  confidenceDiff: number;
  factorChanges: Array<{
    factor: string;
    baseValue: number;
    comparisonValue: number;
    change: number;
  }>;
} {
  const scoreDiff = comparison.finalScore - base.finalScore;
  const confidenceDiff = comparison.confidence - base.confidence;

  const factorChanges = base.contributions.map((baseContrib) => {
    const comparisonContrib = comparison.contributions.find(
      (c) => c.factor === baseContrib.factor
    );

    return {
      factor: baseContrib.factor,
      baseValue: baseContrib.value,
      comparisonValue: comparisonContrib?.value ?? 0,
      change: (comparisonContrib?.value ?? 0) - baseContrib.value,
    };
  });

  return {
    scoreDiff,
    confidenceDiff,
    factorChanges,
  };
}
