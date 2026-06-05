/**
 * CareerOS Market Intelligence - Opportunity Analysis Model
 *
 * Strategic analysis of career opportunities based on market profile.
 */

/**
 * Strength identified for a career.
 */
export interface CareerStrength {
  /** Strength area */
  area: string;

  /** Score in this area (0-100) */
  score: number;

  /** Why this is a strength */
  explanation: string;

  /** Evidence */
  evidence: string[];

  /** Market context */
  marketContext: string;
}

/**
 * Weakness identified for a career.
 */
export interface CareerWeakness {
  /** Weakness area */
  area: string;

  /** Score in this area (0-100) */
  score: number;

  /** Impact severity */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Why this is a weakness */
  explanation: string;

  /** Mitigation suggestions */
  mitigation: string[];
}

/**
 * Opportunity identified for a career.
 */
export interface CareerOpportunity {
  /** Opportunity type */
  type: 
    | 'market_growth' 
    | 'skill_shortage' 
    | 'emerging_sector' 
    | 'geographic_expansion'
    | 'technology_shift'
    | 'regulatory_change'
    | 'demographic_trend';

  /** Opportunity description */
  description: string;

  /** Time window */
  timeWindow: 'immediate' | 'short_term' | 'medium_term' | 'long_term';

  /** Magnitude of opportunity (0-100) */
  magnitude: number;

  /** Likelihood of realization (0-100) */
  likelihood: number;

  /** Required actions to capture */
  requiredActions: string[];

  /** Confidence in this opportunity */
  confidence: number;
}

/**
 * Risk identified for a career.
 */
export interface CareerRisk {
  /** Risk type */
  type:
    | 'automation'
    | 'outsourcing'
    | 'market_contraction'
    | 'skill_obsolescence'
    | 'regulatory'
    | 'economic_cycle'
    | 'globalization';

  /** Risk description */
  description: string;

  /** Time horizon */
  timeHorizon: 'short_term' | 'medium_term' | 'long_term';

  /** Probability (0-100) */
  probability: number;

  /** Impact if realized (0-100) */
  impact: number;

  /** Risk score (probability × impact) */
  riskScore: number;

  /** Mitigation strategies */
  mitigation: string[];

  /** Early warning indicators */
  earlyWarning: string[];

  /** Confidence in this risk assessment */
  confidence: number;
}

/**
 * Complete opportunity analysis for a career.
 */
export interface OpportunityAnalysis {
  /** Career ID */
  careerId: string;

  /** Analysis timestamp */
  generatedAt: Date;

  /** Overall opportunity score (0-100) */
  opportunityScore: number;

  /** Confidence in analysis */
  confidence: number;

  // ============================================================================
  // SWOT ANALYSIS
  // ============================================================================

  /** Strengths */
  strengths: CareerStrength[];

  /** Weaknesses */
  weaknesses: CareerWeakness[];

  /** Opportunities */
  opportunities: CareerOpportunity[];

  /** Risks */
  risks: CareerRisk[];

  // ============================================================================
  // STRATEGIC ASSESSMENT
  // ============================================================================

  /** Market timing */
  marketTiming: {
    /** Current market phase */
    phase: 'growth' | 'maturity' | 'decline' | 'emerging';

    /** Entry recommendation */
    entryRecommendation: 'excellent' | 'good' | 'neutral' | 'poor' | 'avoid';

    /** Explanation */
    explanation: string;
  };

  /** Career trajectory */
  trajectory: {
    /** Short term (0-2 years) */
    shortTerm: 'accelerating' | 'stable' | 'decelerating';

    /** Medium term (2-5 years) */
    mediumTerm: 'accelerating' | 'stable' | 'decelerating';

    /** Long term (5+ years) */
    longTerm: 'accelerating' | 'stable' | 'decelerating';

    /** Explanation */
    explanation: string;
  };

  /** Competitive landscape */
  competitiveLandscape: {
    /** Barriers to entry */
    barriersToEntry: 'low' | 'medium' | 'high';

    /** Competition intensity */
    competitionIntensity: 'low' | 'medium' | 'high';

    /** Differentiation potential */
    differentiationPotential: 'low' | 'medium' | 'high';
  };

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  /** Key recommendations */
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    timeframe: string;
  }>;

  /** Skill development priorities */
  skillPriorities: Array<{
    skill: string;
    importance: number;
    urgency: 'immediate' | 'near_term' | 'future';
  }>;

  // ============================================================================
  // SUMMARY
  // ============================================================================

  /** Executive summary */
  summary: string;

  /** Key takeaways */
  keyTakeaways: string[];

  /** Red flags */
  redFlags: string[];

  /** Green lights */
  greenLights: string[];
}

/**
 * Comparison of opportunity analyses.
 */
export interface OpportunityAnalysisComparison {
  /** Base career ID */
  baseCareerId: string;

  /** Comparison career ID */
  comparisonCareerId: string;

  /** Score comparison */
  scoreComparison: {
    base: number;
    comparison: number;
    difference: number;
  };

  /** Strength comparison */
  strengthComparison: {
    baseCount: number;
    comparisonCount: number;
    baseAvgScore: number;
    comparisonAvgScore: number;
  };

  /** Risk comparison */
  riskComparison: {
    baseRiskCount: number;
    comparisonRiskCount: number;
    baseAvgRiskScore: number;
    comparisonAvgRiskScore: number;
  };

  /** Overall recommendation */
  recommendation: 'base' | 'comparison' | 'neutral';

  /** Reasoning */
  reasoning: string;
}

/**
 * Calculate overall opportunity score from SWOT.
 */
export function calculateOpportunityScore(analysis: OpportunityAnalysis): number {
  // Strengths contribute positively
  const strengthScore = analysis.strengths.reduce(
    (sum, s) => sum + s.score * 0.1,
    0
  );

  // Weaknesses penalize
  const weaknessPenalty = analysis.weaknesses.reduce(
    (sum, w) => sum + (w.severity === 'critical' ? 15 : w.severity === 'high' ? 10 : w.severity === 'medium' ? 5 : 2),
    0
  );

  // Opportunities add potential
  const opportunityScore = analysis.opportunities.reduce(
    (sum, o) => sum + (o.magnitude * o.likelihood) / 100 * 0.1,
    0
  );

  // Risks penalize
  const riskPenalty = analysis.risks.reduce(
    (sum, r) => sum + r.riskScore * 0.05,
    0
  );

  // Base score
  let score = 50 + strengthScore + opportunityScore - weaknessPenalty - riskPenalty;

  // Adjust for market timing
  const timingMultiplier = {
    'excellent': 1.15,
    'good': 1.05,
    'neutral': 1.0,
    'poor': 0.9,
    'avoid': 0.75,
  }[analysis.marketTiming.entryRecommendation];

  score *= timingMultiplier;

  // Clamp to valid range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate executive summary from analysis.
 */
export function generateExecutiveSummary(analysis: OpportunityAnalysis): string {
  const parts: string[] = [];

  // Opening
  parts.push(`Career Opportunity Analysis: ${analysis.careerId}`);
  parts.push(`Overall Score: ${analysis.opportunityScore}/100 (Confidence: ${analysis.confidence}%)\n`);

  // Market timing
  parts.push(`Market Timing: ${analysis.marketTiming.phase} phase`);
  parts.push(`Entry Recommendation: ${analysis.marketTiming.entryRecommendation.toUpperCase()}`);
  parts.push(`${analysis.marketTiming.explanation}\n`);

  // Key strengths
  if (analysis.strengths.length > 0) {
    parts.push('Key Strengths:');
    for (const strength of analysis.strengths.slice(0, 3)) {
      parts.push(`  • ${strength.area}: ${strength.explanation}`);
    }
    parts.push('');
  }

  // Key risks
  if (analysis.risks.length > 0) {
    const topRisks = analysis.risks
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 2);

    parts.push('Key Risks:');
    for (const risk of topRisks) {
      parts.push(`  • ${risk.type}: ${risk.description} (Risk Score: ${risk.riskScore})`);
    }
    parts.push('');
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    parts.push('Top Recommendations:');
    const topRecs = analysis.recommendations
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 3);

    for (const rec of topRecs) {
      parts.push(`  [${rec.priority.toUpperCase()}] ${rec.action}`);
    }
  }

  return parts.join('\n');
}

/**
 * Identify critical factors from analysis.
 */
export function identifyCriticalFactors(analysis: OpportunityAnalysis): {
  criticalStrengths: CareerStrength[];
  criticalWeaknesses: CareerWeakness[];
  criticalRisks: CareerRisk[];
  topOpportunities: CareerOpportunity[];
} {
  return {
    criticalStrengths: analysis.strengths
      .filter((s) => s.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),

    criticalWeaknesses: analysis.weaknesses
      .filter((w) => w.severity === 'critical' || w.severity === 'high')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),

    criticalRisks: analysis.risks
      .filter((r) => r.riskScore >= 50)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3),

    topOpportunities: analysis.opportunities
      .filter((o) => o.magnitude >= 70 && o.likelihood >= 60)
      .sort((a, b) => b.magnitude * b.likelihood - a.magnitude * a.likelihood)
      .slice(0, 3),
  };
}

/**
 * Validate opportunity analysis.
 */
export function validateOpportunityAnalysis(analysis: OpportunityAnalysis): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Score range check
  if (analysis.opportunityScore < 0 || analysis.opportunityScore > 100) {
    issues.push(`Opportunity score out of range: ${analysis.opportunityScore}`);
  }

  // Confidence check
  if (analysis.confidence < 0 || analysis.confidence > 100) {
    issues.push(`Confidence out of range: ${analysis.confidence}`);
  }

  // Required fields
  if (!analysis.careerId) {
    issues.push('Missing careerId');
  }

  // Empty analysis check
  if (analysis.strengths.length === 0 && analysis.weaknesses.length === 0) {
    issues.push('No strengths or weaknesses identified');
  }

  // Risk validation
  for (const risk of analysis.risks) {
    if (risk.probability < 0 || risk.probability > 100) {
      issues.push(`Risk probability out of range for ${risk.type}`);
    }
    if (risk.impact < 0 || risk.impact > 100) {
      issues.push(`Risk impact out of range for ${risk.type}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
