/**
 * CareerOS Market Intelligence - Career Market Profile Module
 *
 * Transforms raw market signals into actionable career intelligence.
 *
 * Single source of truth for career market intelligence.
 * All recommendation systems must consume these profiles.
 *
 * RULE: No other module should reason from raw market data.
 * Everything must become CareerMarketProfile before entering the recommendation system.
 */

// ============================================================================
// MODELS
// ============================================================================

export type {
  CareerMarketProfile,
  CareerMarketProfileId,
  MarketOutlook,
  GeographicPresence,
  ProfileEvidence,
  ScoreBreakdown,
  CareerMarketProfileUpdate,
  CareerMarketProfileSnapshot,
  CareerMarketProfileComparison,
} from './models/CareerMarketProfile';

export {
  calculateMarketOutlook,
  calculateTrendDirection,
  validateCareerMarketProfile,
} from './models/CareerMarketProfile';

export type {
  MarketScoreBreakdown,
  ScoreFactorContribution,
  ScoreAdjustment,
  DemandScoreBreakdown,
  SalaryScoreBreakdown,
  GrowthScoreBreakdown,
  ScarcityScoreBreakdown,
  AutomationRiskBreakdown,
  ResilienceScoreBreakdown,
  OpportunityScoreBreakdown,
  CompleteScoreBreakdown,
} from './models/MarketScoreBreakdown';

export {
  explainScore,
  compareBreakdowns,
} from './models/MarketScoreBreakdown';

export type {
  OpportunityAnalysis,
  CareerStrength,
  CareerWeakness,
  CareerOpportunity,
  CareerRisk,
  OpportunityAnalysisComparison,
} from './models/OpportunityAnalysis';

export {
  calculateOpportunityScore,
  generateExecutiveSummary,
  identifyCriticalFactors,
  validateOpportunityAnalysis,
} from './models/OpportunityAnalysis';

// ============================================================================
// ENGINES
// ============================================================================

export {
  DemandScoringEngine,
  DEFAULT_DEMAND_SCORING_CONFIG,
  createDemandScoringEngine,
} from './DemandScoringEngine';

export type {
  DemandScoringConfig,
  DemandMetrics,
} from './DemandScoringEngine';

export {
  SalaryScoringEngine,
  DEFAULT_SALARY_SCORING_CONFIG,
  createSalaryScoringEngine,
} from './SalaryScoringEngine';

export type {
  SalaryScoringConfig,
  SalaryMetrics,
} from './SalaryScoringEngine';

export {
  GrowthScoringEngine,
  DEFAULT_GROWTH_SCORING_CONFIG,
  createGrowthScoringEngine,
} from './GrowthScoringEngine';

export type {
  GrowthScoringConfig,
  GrowthMetrics,
} from './GrowthScoringEngine';

export {
  ScarcityScoringEngine,
  DEFAULT_SCARCITY_SCORING_CONFIG,
  createScarcityScoringEngine,
} from './ScarcityScoringEngine';

export type {
  ScarcityScoringConfig,
  ScarcityMetrics,
} from './ScarcityScoringEngine';

export {
  AutomationRiskEngine,
  DEFAULT_AUTOMATION_RISK_CONFIG,
  createAutomationRiskEngine,
} from './AutomationRiskEngine';

export type {
  AutomationRiskConfig,
  AutomationRiskMetrics,
} from './AutomationRiskEngine';

export {
  FutureResilienceEngine,
  DEFAULT_FUTURE_RESILIENCE_CONFIG,
  createFutureResilienceEngine,
} from './FutureResilienceEngine';

export type {
  FutureResilienceConfig,
  FutureResilienceMetrics,
} from './FutureResilienceEngine';

export {
  OpportunityScoringEngine,
  DEFAULT_OPPORTUNITY_SCORING_CONFIG,
  createOpportunityScoringEngine,
} from './OpportunityScoringEngine';

export type {
  OpportunityScoringConfig,
} from './OpportunityScoringEngine';

export {
  CareerMarketProfileEngine,
  DEFAULT_PROFILE_ENGINE_CONFIG,
  createCareerMarketProfileEngine,
} from './CareerMarketProfileEngine';

export type {
  ProfileEngineConfig,
  ProfileGenerationResult,
  ProfileGenerationInput,
} from './CareerMarketProfileEngine';

// ============================================================================
// COMPOSITE EXPORTS
// ============================================================================

/**
 * Complete scoring engines bundle.
 */
export const ScoringEngines = {
  demand: createDemandScoringEngine,
  salary: createSalaryScoringEngine,
  growth: createGrowthScoringEngine,
  scarcity: createScarcityScoringEngine,
  automationRisk: createAutomationRiskEngine,
  resilience: createFutureResilienceEngine,
  opportunity: createOpportunityScoringEngine,
} as const;

/**
 * Profile score categories and their weights.
 */
export const PROFILE_SCORE_WEIGHTS = {
  demand: 0.25,
  salary: 0.2,
  growth: 0.2,
  scarcity: 0.1,
  automationRisk: 0.1,
  resilience: 0.15,
} as const;

/**
 * Score interpretation ranges.
 */
export const SCORE_INTERPRETATION = {
  excellent: { min: 80, max: 100, label: 'Excellent' },
  good: { min: 65, max: 79, label: 'Good' },
  neutral: { min: 45, max: 64, label: 'Neutral' },
  caution: { min: 30, max: 44, label: 'Caution' },
  poor: { min: 0, max: 29, label: 'Poor' },
} as const;

/**
 * Risk level interpretation.
 */
export const RISK_LEVELS = {
  low: { min: 0, max: 24, label: 'Low Risk' },
  moderate: { min: 25, max: 49, label: 'Moderate Risk' },
  high: { min: 50, max: 74, label: 'High Risk' },
  critical: { min: 75, max: 100, label: 'Critical Risk' },
} as const;

/**
 * Resilience level interpretation.
 */
export const RESILIENCE_LEVELS = {
  fragile: { min: 0, max: 29, label: 'Fragile' },
  vulnerable: { min: 30, max: 49, label: 'Vulnerable' },
  stable: { min: 50, max: 69, label: 'Stable' },
  resilient: { min: 70, max: 84, label: 'Resilient' },
  antifragile: { min: 85, max: 100, label: 'Antifragile' },
} as const;

/**
 * Interpret a score value.
 */
export function interpretScore(score: number): {
  level: keyof typeof SCORE_INTERPRETATION;
  label: string;
} {
  for (const [level, range] of Object.entries(SCORE_INTERPRETATION)) {
    if (score >= range.min && score <= range.max) {
      return { level: level as keyof typeof SCORE_INTERPRETATION, label: range.label };
    }
  }
  return { level: 'poor', label: 'Poor' };
}

/**
 * Interpret a risk score.
 */
export function interpretRisk(riskScore: number): {
  level: keyof typeof RISK_LEVELS;
  label: string;
} {
  for (const [level, range] of Object.entries(RISK_LEVELS)) {
    if (riskScore >= range.min && riskScore <= range.max) {
      return { level: level as keyof typeof RISK_LEVELS, label: range.label };
    }
  }
  return { level: 'critical', label: 'Critical Risk' };
}

/**
 * Interpret a resilience score.
 */
export function interpretResilience(resilienceScore: number): {
  level: keyof typeof RESILIENCE_LEVELS;
  label: string;
} {
  for (const [level, range] of Object.entries(RESILIENCE_LEVELS)) {
    if (resilienceScore >= range.min && resilienceScore <= range.max) {
      return { level: level as keyof typeof RESILIENCE_LEVELS, label: range.label };
    }
  }
  return { level: 'fragile', label: 'Fragile' };
}

/**
 * Profile health check.
 */
export function checkProfileHealth(profile: CareerMarketProfile): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Confidence check
  if (profile.confidence < 50) {
    issues.push('Low confidence in profile data');
    recommendations.push('Gather more market signals');
  }

  // Data freshness check
  if (profile.dataFreshness > 168) { // 1 week
    issues.push('Profile data is stale');
    recommendations.push('Refresh market signals');
  }

  // Score validity check
  const scores = [
    profile.demandScore,
    profile.salaryScore,
    profile.growthScore,
    profile.scarcityScore,
    profile.automationRiskScore,
    profile.futureResilienceScore,
    profile.opportunityScore,
  ];

  const invalidScores = scores.filter((s) => s < 0 || s > 100);
  if (invalidScores.length > 0) {
    issues.push('Invalid score values detected');
  }

  // Automation risk check
  if (profile.automationRiskScore >= 70) {
    issues.push('Critical automation risk identified');
    recommendations.push('Prioritize skill development');
  }

  return {
    healthy: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Create a profile summary.
 */
export function createProfileSummary(profile: CareerMarketProfile): string {
  const parts: string[] = [];

  parts.push(`${profile.careerId.toUpperCase()}`);
  parts.push(`Opportunity: ${profile.opportunityScore}/100 (${profile.outlook})`);
  parts.push(`Demand: ${profile.demandScore} | Salary: ${profile.salaryScore} | Growth: ${profile.growthScore}`);
  parts.push(`Risk: ${profile.automationRiskScore} | Resilience: ${profile.futureResilienceScore}`);
  parts.push(`Confidence: ${profile.confidence}%`);

  if (profile.riskFlags.length > 0) {
    parts.push(`⚠️ ${profile.riskFlags.length} risk flags`);
  }

  return parts.join(' | ');
}
