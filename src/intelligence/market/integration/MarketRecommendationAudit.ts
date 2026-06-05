/**
 * CareerOS Market Intelligence - Market Recommendation Audit
 *
 * Verifies that no recommendation is being driven primarily by market demand.
 *
 * Principle: Market intelligence refines decisions. It does not replace decision intelligence.
 *
 * Priority Order:
 * 1. Psychological Fit
 * 2. Values Alignment
 * 3. Utility
 * 4. Optionality
 * 5. Future Resilience
 * 6. Market Intelligence (modifier)
 */

import type { MarketAwareCareerAnalysis } from './models/MarketAwareCareerAnalysis';
import type { ScoreWeights } from './models/MarketAwareCareerAnalysis';
import { DEFAULT_SCORE_WEIGHTS } from './models/MarketAwareCareerAnalysis';

/**
 * Audit result.
 */
export interface AuditResult {
  /** Whether the recommendation passed audit */
  passed: boolean;

  /** Severity of any issues */
  severity: 'none' | 'minor' | 'moderate' | 'critical';

  /** List of issues found */
  issues: AuditIssue[];

  /** Recommended actions */
  recommendedActions: string[];

  /** Audit score (0-100) */
  auditScore: number;

  /** Whether recommendation is market-driven */
  marketDriven: boolean;

  /** Confidence in audit result */
  confidence: number;
}

/**
 * Audit issue.
 */
export interface AuditIssue {
  /** Issue type */
  type: 'market_dominated' | 'low_fit_high_market' | 'insufficient_fit' | 'weight_misconfiguration';

  /** Severity */
  severity: 'minor' | 'moderate' | 'critical';

  /** Description */
  description: string;

  /** Suggested fix */
  suggestion: string;
}

/**
 * Audit configuration.
 */
export interface AuditConfig {
  /** Minimum fit threshold for any recommendation */
  minFitThreshold: number;

  /** Maximum market weight allowed */
  maxMarketWeight: number;

  /** Minimum fit weight required */
  minFitWeight: number;

  /** Threshold for market-dominated warning */
  marketDominatedThreshold: number;

  /** Maximum market/fit ratio allowed */
  maxMarketFitRatio: number;
}

/**
 * Default audit configuration.
 */
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  minFitThreshold: 50,
  maxMarketWeight: 0.15,
  minFitWeight: 0.25,
  marketDominatedThreshold: 0.4,
  maxMarketFitRatio: 0.5,
};

/**
 * Batch audit result.
 */
export interface BatchAuditResult {
  /** Individual audit results */
  individualResults: Map<string, AuditResult>;

  /** Summary statistics */
  summary: {
    totalAudited: number;
    passedCount: number;
    failedCount: number;
    marketDrivenCount: number;
    averageAuditScore: number;
  };

  /** Common issues */
  commonIssues: Array<{ type: string; count: number }>;

  /** Recommendations for system improvement */
  systemRecommendations: string[];
}

/**
 * Market Recommendation Audit Engine.
 */
export class MarketRecommendationAudit {
  private config: AuditConfig;

  constructor(config?: Partial<AuditConfig>) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
  }

  /**
   * Audit a single recommendation.
   */
  audit(analysis: MarketAwareCareerAnalysis, weights?: ScoreWeights): AuditResult {
    const issues: AuditIssue[] = [];
    const usedWeights = weights ?? DEFAULT_SCORE_WEIGHTS;

    // Check 1: Minimum fit threshold
    if (analysis.fitScore < this.config.minFitThreshold) {
      issues.push({
        type: 'insufficient_fit',
        severity: 'critical',
        description: `Fit score ${analysis.fitScore} below minimum threshold ${this.config.minFitThreshold}`,
        suggestion: 'Do not recommend careers with fit below threshold, regardless of market conditions',
      });
    }

    // Check 2: Market weight configuration
    if (usedWeights.market > this.config.maxMarketWeight) {
      issues.push({
        type: 'weight_misconfiguration',
        severity: 'critical',
        description: `Market weight ${usedWeights.market} exceeds maximum ${this.config.maxMarketWeight}`,
        suggestion: 'Reduce market weight to ensure fit remains primary driver',
      });
    }

    // Check 3: Fit weight configuration
    if (usedWeights.fit < this.config.minFitWeight) {
      issues.push({
        type: 'weight_misconfiguration',
        severity: 'moderate',
        description: `Fit weight ${usedWeights.fit} below minimum ${this.config.minFitWeight}`,
        suggestion: 'Increase fit weight to maintain proper prioritization',
      });
    }

    // Check 4: Market-dominated recommendation
    const marketContribution = analysis.marketScore * usedWeights.market;
    const fitContribution = analysis.fitScore * usedWeights.fit;

    if (marketContribution > fitContribution * this.config.maxMarketFitRatio) {
      issues.push({
        type: 'market_dominated',
        severity: 'critical',
        description: `Market contribution (${marketContribution.toFixed(1)}) disproportionately high relative to fit contribution (${fitContribution.toFixed(1)})`,
        suggestion: 'Review scoring to ensure fit, not market, drives recommendation',
      });
    }

    // Check 5: Low fit, high market
    if (analysis.fitScore < 65 && analysis.marketScore > 75) {
      issues.push({
        type: 'low_fit_high_market',
        severity: 'moderate',
        description: `Moderate fit (${analysis.fitScore}) with strong market (${analysis.marketScore}) suggests market-driven recommendation`,
        suggestion: 'Flag for manual review - verify user would thrive in this career',
      });
    }

    // Calculate audit score
    const auditScore = this.calculateAuditScore(analysis, issues, usedWeights);

    // Determine severity
    const severity = this.determineSeverity(issues);

    // Determine if passed
    const passed = severity !== 'critical' && auditScore >= 70;

    // Determine if market-driven
    const marketDriven = issues.some((i) => i.type === 'market_dominated' || i.type === 'low_fit_high_market');

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(issues, analysis);

    return {
      passed,
      severity,
      issues,
      recommendedActions,
      auditScore,
      marketDriven,
      confidence: this.calculateAuditConfidence(issues),
    };
  }

  /**
   * Audit multiple recommendations.
   */
  auditBatch(
    analyses: MarketAwareCareerAnalysis[],
    weights?: ScoreWeights
  ): BatchAuditResult {
    const individualResults = new Map<string, AuditResult>();

    for (const analysis of analyses) {
      individualResults.set(analysis.careerId, this.audit(analysis, weights));
    }

    // Calculate summary
    const results = Array.from(individualResults.values());
    const passed = results.filter((r) => r.passed);
    const marketDriven = results.filter((r) => r.marketDriven);

    // Find common issues
    const issueCounts = new Map<string, number>();
    for (const result of results) {
      for (const issue of result.issues) {
        issueCounts.set(issue.type, (issueCounts.get(issue.type) ?? 0) + 1);
      }
    }

    const commonIssues = Array.from(issueCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // System recommendations
    const systemRecommendations = this.generateSystemRecommendations(commonIssues, results);

    return {
      individualResults,
      summary: {
        totalAudited: analyses.length,
        passedCount: passed.length,
        failedCount: analyses.length - passed.length,
        marketDrivenCount: marketDriven.length,
        averageAuditScore: Math.round(
          results.reduce((sum, r) => sum + r.auditScore, 0) / results.length
        ),
      },
      commonIssues,
      systemRecommendations,
    };
  }

  /**
   * Validate weight configuration.
   */
  validateWeights(weights: ScoreWeights): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check sum
    const sum =
      weights.fit + weights.values + weights.utility + weights.optionality + weights.resilience + weights.market;

    if (Math.abs(sum - 1.0) > 0.01) {
      issues.push(`Weights sum to ${sum.toFixed(2)}, expected 1.0`);
    }

    // Check market weight
    if (weights.market > this.config.maxMarketWeight) {
      issues.push(`Market weight ${weights.market} exceeds maximum ${this.config.maxMarketWeight}`);
    }

    // Check fit weight
    if (weights.fit < this.config.minFitWeight) {
      issues.push(`Fit weight ${weights.fit} below minimum ${this.config.minFitWeight}`);
    }

    // Check fit is highest
    const maxWeight = Math.max(
      weights.fit,
      weights.values,
      weights.utility,
      weights.optionality,
      weights.resilience,
      weights.market
    );

    if (weights.fit !== maxWeight) {
      issues.push('Fit should have the highest weight');
    }

    return { valid: issues.length === 0, issues };
  }

  /**
   * Generate audit report.
   */
  generateReport(result: AuditResult): string {
    const lines: string[] = [];

    lines.push('Market Recommendation Audit Report');
    lines.push('=' .repeat(40));
    lines.push('');

    lines.push(`Result: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);
    lines.push(`Severity: ${result.severity.toUpperCase()}`);
    lines.push(`Audit Score: ${result.auditScore}/100`);
    lines.push(`Market-Driven: ${result.marketDriven ? 'Yes' : 'No'}`);
    lines.push('');

    if (result.issues.length > 0) {
      lines.push('Issues Found:');
      for (const issue of result.issues) {
        lines.push(`  [${issue.severity.toUpperCase()}] ${issue.type}`);
        lines.push(`    ${issue.description}`);
        lines.push(`    Suggestion: ${issue.suggestion}`);
        lines.push('');
      }
    }

    if (result.recommendedActions.length > 0) {
      lines.push('Recommended Actions:');
      for (const action of result.recommendedActions) {
        lines.push(`  - ${action}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Check if analysis needs manual review.
   */
  needsManualReview(analysis: MarketAwareCareerAnalysis): boolean {
    const audit = this.audit(analysis);
    return !audit.passed || audit.marketDriven || audit.issues.some((i) => i.severity === 'moderate');
  }

  // Private methods

  private calculateAuditScore(
    analysis: MarketAwareCareerAnalysis,
    issues: AuditIssue[],
    weights: ScoreWeights
  ): number {
    let score = 100;

    // Deduct for issues
    for (const issue of issues) {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'moderate') score -= 15;
      else score -= 5;
    }

    // Bonus for good fit
    if (analysis.fitScore >= 80) score += 5;
    if (analysis.fitScore >= 90) score += 5;

    // Penalty for low fit
    if (analysis.fitScore < 60) score -= 10;
    if (analysis.fitScore < 50) score -= 15;

    // Bonus for proper weighting
    if (weights.market <= 0.1) score += 5;
    if (weights.fit >= 0.3) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private determineSeverity(issues: AuditIssue[]): AuditResult['severity'] {
    if (issues.some((i) => i.severity === 'critical')) return 'critical';
    if (issues.some((i) => i.severity === 'moderate')) return 'moderate';
    if (issues.length > 0) return 'minor';
    return 'none';
  }

  private calculateAuditConfidence(issues: AuditIssue[]): number {
    // More issues = lower confidence in audit
    const baseConfidence = 95;
    const deduction = issues.length * 5;
    return Math.max(50, baseConfidence - deduction);
  }

  private generateRecommendations(issues: AuditIssue[], analysis: MarketAwareCareerAnalysis): string[] {
    const actions: string[] = [];

    for (const issue of issues) {
      switch (issue.type) {
        case 'market_dominated':
          actions.push('Reconfigure weights to prioritize fit over market');
          actions.push('Recompute scores with reduced market weight');
          break;
        case 'low_fit_high_market':
          actions.push(`Conduct additional fit assessment for ${analysis.careerTitle}`);
          actions.push('Consider whether user has been exposed to actual work in this field');
          break;
        case 'insufficient_fit':
          actions.push('Do not recommend this career - fit below threshold');
          actions.push('Explore related careers with better fit alignment');
          break;
        case 'weight_misconfiguration':
          actions.push('Update scoring configuration to use approved weights');
          actions.push('Review weight validation in scoring pipeline');
          break;
      }
    }

    return [...new Set(actions)];
  }

  private generateSystemRecommendations(
    commonIssues: Array<{ type: string; count: number }>,
    results: AuditResult[]
  ): string[] {
    const recommendations: string[] = [];

    const marketDrivenRate = results.filter((r) => r.marketDriven).length / results.length;

    if (marketDrivenRate > 0.2) {
      recommendations.push('High rate of market-driven recommendations detected. Review scoring algorithm.');
    }

    const avgScore = results.reduce((sum, r) => sum + r.auditScore, 0) / results.length;
    if (avgScore < 80) {
      recommendations.push('Average audit score below 80. Review weight configuration across system.');
    }

    for (const issue of commonIssues.slice(0, 3)) {
      if (issue.count > results.length * 0.1) {
        recommendations.push(`Frequent ${issue.type} issues (${issue.count} cases). Investigate root cause.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('System operating within expected parameters.');
    }

    return recommendations;
  }
}

/**
 * Factory function.
 */
export function createMarketRecommendationAudit(
  config?: Partial<AuditConfig>
): MarketRecommendationAudit {
  return new MarketRecommendationAudit(config);
}
