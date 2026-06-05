/**
 * OutcomeScoringFramework
 * 
 * Comprehensive evaluation engine for career outcomes.
 * Orchestrates metric measurement, dimension scoring, and holistic outcome assessment.
 * Supports multi-horizon analysis, sensitivity analysis, and comparative evaluation.
 */

import {
  OutcomeId,
  OutcomeScore,
  OutcomeWeight,
  TimeHorizon,
  ConfidenceLevel,
  OutcomeCategory,
  ScoreBand,
  MetricValue,
  OptimizationDirection,
  AggregationMethod,
} from './types';

import {
  OutcomeMetric,
  MetricMeasurement,
  AllOutcomeMetrics,
  getMetricById,
} from './OutcomeMetric';

import {
  OutcomeDimension,
  DimensionScore,
  getAllDimensions,
  getDimensionByCategory,
  calculateDimensionScore,
} from './OutcomeDimension';

// ============================================
// FRAMEWORK CONFIGURATION
// ============================================

/**
 * Framework configuration for scoring
 */
export interface ScoringConfiguration {
  readonly defaultHorizon: TimeHorizon;
  readonly dimensionWeights: Record<OutcomeCategory, OutcomeWeight>;
  readonly aggregationMethod: AggregationMethod;
  readonly requireAllDimensions: boolean;
  readonly minDimensionsForScore: number;
  readonly enableSensitivityAnalysis: boolean;
  readonly confidenceThreshold: OutcomeScore;
}

/**
 * Default scoring configuration
 */
export const DefaultScoringConfiguration: ScoringConfiguration = {
  defaultHorizon: 'medium_term',
  dimensionWeights: {
    [OutcomeCategory.FINANCIAL]: 0.25,
    [OutcomeCategory.EDUCATIONAL]: 0.15,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.20,
    [OutcomeCategory.CAREER]: 0.15,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requireAllDimensions: false,
  minDimensionsForScore: 3,
  enableSensitivityAnalysis: true,
  confidenceThreshold: 0.6,
};

/**
 * Horizon-specific weight configurations
 */
export const HorizonWeightConfigurations: Record<TimeHorizon, Partial<Record<OutcomeCategory, OutcomeWeight>>> = {
  immediate: {
    [OutcomeCategory.FINANCIAL]: 0.35,
    [OutcomeCategory.EDUCATIONAL]: 0.20,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.15,
    [OutcomeCategory.CAREER]: 0.05,
  },
  short_term: {
    [OutcomeCategory.FINANCIAL]: 0.30,
    [OutcomeCategory.EDUCATIONAL]: 0.15,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.20,
    [OutcomeCategory.CAREER]: 0.10,
  },
  medium_term: {
    [OutcomeCategory.FINANCIAL]: 0.25,
    [OutcomeCategory.EDUCATIONAL]: 0.15,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.20,
    [OutcomeCategory.CAREER]: 0.15,
  },
  long_term: {
    [OutcomeCategory.FINANCIAL]: 0.20,
    [OutcomeCategory.EDUCATIONAL]: 0.10,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.20,
    [OutcomeCategory.CAREER]: 0.25,
  },
  lifetime: {
    [OutcomeCategory.FINANCIAL]: 0.15,
    [OutcomeCategory.EDUCATIONAL]: 0.05,
    [OutcomeCategory.PSYCHOLOGICAL]: 0.25,
    [OutcomeCategory.LIFESTYLE]: 0.25,
    [OutcomeCategory.CAREER]: 0.30,
  },
};

// ============================================
// SCORING RESULTS
// ============================================

/**
 * Complete outcome assessment result
 */
export interface OutcomeAssessment {
  readonly id: OutcomeId;
  readonly subjectId: string; // Career ID, student ID, or scenario ID
  readonly overallScore: OutcomeScore;
  readonly band: ScoreBand;
  readonly dimensionScores: DimensionScore[];
  readonly metricMeasurements: MetricMeasurement[];
  readonly horizon: TimeHorizon;
  readonly confidence: ConfidenceLevel;
  readonly scoredAt: Date;
  readonly configuration: ScoringConfiguration;
  readonly analysis: OutcomeAnalysis;
}

/**
 * Detailed outcome analysis
 */
export interface OutcomeAnalysis {
  readonly strengths: DimensionScore[];
  readonly weaknesses: DimensionScore[];
  readonly opportunities: OpportunityAnalysis[];
  readonly risks: RiskAnalysis[];
  readonly tradeoffs: TradeoffAnalysis[];
  readonly recommendations: Recommendation[];
}

/**
 * Opportunity analysis
 */
export interface OpportunityAnalysis {
  readonly dimension: OutcomeCategory;
  readonly metricId: OutcomeId;
  readonly description: string;
  readonly potentialImpact: OutcomeScore;
  readonly easeOfImprovement: OutcomeScore;
  readonly priority: number;
}

/**
 * Risk analysis
 */
export interface RiskAnalysis {
  readonly dimension: OutcomeCategory;
  readonly metricId: OutcomeId;
  readonly description: string;
  readonly severity: OutcomeScore;
  readonly likelihood: OutcomeScore;
  readonly mitigationStrategy?: string;
}

/**
 * Tradeoff analysis
 */
export interface TradeoffAnalysis {
  readonly dimensionA: OutcomeCategory;
  readonly dimensionB: OutcomeCategory;
  readonly correlation: number; // -1 to 1
  readonly description: string;
}

/**
 * Recommendation
 */
export interface Recommendation {
  readonly priority: number;
  readonly category: OutcomeCategory;
  readonly action: string;
  readonly expectedImpact: OutcomeScore;
  readonly effort: 'low' | 'medium' | 'high';
}

/**
 * Comparative outcome analysis
 */
export interface ComparativeAnalysis {
  readonly baseAssessment: OutcomeAssessment;
  readonly comparisonAssessment: OutcomeAssessment;
  readonly deltaScore: number;
  readonly dimensionDeltas: DimensionDelta[];
  readonly winner: OutcomeCategory[];
  readonly loser: OutcomeCategory[];
}

/**
 * Dimension comparison delta
 */
export interface DimensionDelta {
  readonly category: OutcomeCategory;
  readonly baseScore: OutcomeScore;
  readonly comparisonScore: OutcomeScore;
  readonly delta: number;
  readonly significance: 'major' | 'moderate' | 'minor';
}

// ============================================
// SENSITIVITY ANALYSIS
// ============================================

/**
 * Sensitivity analysis result
 */
export interface SensitivityAnalysis {
  readonly baseScore: OutcomeScore;
  readonly metricSensitivities: MetricSensitivity[];
  readonly dimensionSensitivities: DimensionSensitivity[];
  readonly optimalWeights?: Record<OutcomeCategory, OutcomeWeight>;
}

/**
 * Metric sensitivity
 */
export interface MetricSensitivity {
  readonly metricId: OutcomeId;
  readonly metricName: string;
  readonly currentScore: OutcomeScore;
  readonly scoreImpact: OutcomeScore; // Impact of 10% change
  readonly rank: number;
}

/**
 * Dimension sensitivity
 */
export interface DimensionSensitivity {
  readonly category: OutcomeCategory;
  readonly currentWeight: OutcomeWeight;
  readonly currentScore: OutcomeScore;
  readonly scoreElasticity: number; // % change in overall / % change in weight
}

// ============================================
// MAIN FRAMEWORK CLASS
// ============================================

/**
 * OutcomeScoringFramework
 * 
 * Main evaluation engine for comprehensive outcome assessment.
 */
export class OutcomeScoringFramework {
  private config: ScoringConfiguration;

  constructor(config: Partial<ScoringConfiguration> = {}) {
    this.config = { ...DefaultScoringConfiguration, ...config };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): ScoringConfiguration {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: Partial<ScoringConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Calculate comprehensive outcome assessment
   */
  calculateAssessment(
    subjectId: string,
    measurements: MetricMeasurement[],
    horizon?: TimeHorizon
  ): OutcomeAssessment {
    const targetHorizon = horizon ?? this.config.defaultHorizon;
    const assessmentId = `assessment_${subjectId}_${Date.now()}`;
    
    // Get dimension weights for horizon
    const weights = this.getDimensionWeights(targetHorizon);
    
    // Calculate dimension scores
    const dimensionScores = this.calculateAllDimensionScores(
      measurements,
      targetHorizon,
      weights
    );
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(dimensionScores);
    
    // Determine confidence
    const confidence = this.calculateConfidence(dimensionScores, measurements);
    
    // Perform analysis
    const analysis = this.performAnalysis(dimensionScores, measurements);
    
    return {
      id: assessmentId,
      subjectId,
      overallScore,
      band: scoreToBand(overallScore),
      dimensionScores,
      metricMeasurements: measurements,
      horizon: targetHorizon,
      confidence,
      scoredAt: new Date(),
      configuration: { ...this.config },
      analysis,
    };
  }

  /**
   * Calculate dimension scores for all categories
   */
  private calculateAllDimensionScores(
    measurements: MetricMeasurement[],
    horizon: TimeHorizon,
    weights: Record<OutcomeCategory, OutcomeWeight>
  ): DimensionScore[] {
    const dimensions = getAllDimensions();
    
    return dimensions.map(dimension => 
      calculateDimensionScore(dimension, measurements, horizon, weights[dimension.category])
    );
  }

  /**
   * Calculate overall score from dimension scores
   */
  private calculateOverallScore(dimensionScores: DimensionScore[]): OutcomeScore {
    const validScores = dimensionScores.filter(ds => ds.metricScores.length > 0);
    
    if (validScores.length < this.config.minDimensionsForScore) {
      return 0;
    }

    switch (this.config.aggregationMethod) {
      case AggregationMethod.WEIGHTED_AVERAGE:
        const totalWeight = validScores.reduce((sum, ds) => {
          const weight = this.config.dimensionWeights[ds.category];
          return sum + weight;
        }, 0);
        
        return validScores.reduce((sum, ds) => {
          const weight = this.config.dimensionWeights[ds.category];
          return sum + (ds.overallScore * weight);
        }, 0) / totalWeight;

      case AggregationMethod.ARITHMETIC_MEAN:
        return validScores.reduce((sum, ds) => sum + ds.overallScore, 0) / validScores.length;

      case AggregationMethod.GEOMETRIC_MEAN:
        return Math.pow(
          validScores.reduce((product, ds) => product * ds.overallScore, 1),
          1 / validScores.length
        );

      case AggregationMethod.MINIMUM:
        return Math.min(...validScores.map(ds => ds.overallScore));

      case AggregationMethod.MAXIMUM:
        return Math.max(...validScores.map(ds => ds.overallScore));

      case AggregationMethod.MEDIAN:
        const sorted = validScores.map(ds => ds.overallScore).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

      default:
        return validScores.reduce((sum, ds) => sum + ds.weightedScore, 0);
    }
  }

  /**
   * Get dimension weights for specific horizon
   */
  private getDimensionWeights(horizon: TimeHorizon): Record<OutcomeCategory, OutcomeWeight> {
    const horizonWeights = HorizonWeightConfigurations[horizon];
    return {
      [OutcomeCategory.FINANCIAL]: horizonWeights[OutcomeCategory.FINANCIAL] ?? this.config.dimensionWeights[OutcomeCategory.FINANCIAL],
      [OutcomeCategory.EDUCATIONAL]: horizonWeights[OutcomeCategory.EDUCATIONAL] ?? this.config.dimensionWeights[OutcomeCategory.EDUCATIONAL],
      [OutcomeCategory.PSYCHOLOGICAL]: horizonWeights[OutcomeCategory.PSYCHOLOGICAL] ?? this.config.dimensionWeights[OutcomeCategory.PSYCHOLOGICAL],
      [OutcomeCategory.LIFESTYLE]: horizonWeights[OutcomeCategory.LIFESTYLE] ?? this.config.dimensionWeights[OutcomeCategory.LIFESTYLE],
      [OutcomeCategory.CAREER]: horizonWeights[OutcomeCategory.CAREER] ?? this.config.dimensionWeights[OutcomeCategory.CAREER],
    };
  }

  /**
   * Calculate confidence level based on data completeness
   */
  private calculateConfidence(
    dimensionScores: DimensionScore[],
    measurements: MetricMeasurement[]
  ): ConfidenceLevel {
    const totalMetrics = Object.keys(AllOutcomeMetrics).length;
    const measuredMetrics = measurements.length;
    const coverageRatio = measuredMetrics / totalMetrics;

    const dimensionsWithData = dimensionScores.filter(ds => ds.metricScores.length > 0).length;
    const dimensionCoverage = dimensionsWithData / dimensionScores.length;

    const avgConfidence = measurements.reduce((sum, m) => {
      const confidenceScores: Record<ConfidenceLevel, number> = {
        established: 1.0,
        probable: 0.75,
        projected: 0.5,
        speculative: 0.25,
      };
      return sum + confidenceScores[m.confidence];
    }, 0) / (measurements.length || 1);

    const overallConfidence = coverageRatio * 0.3 + dimensionCoverage * 0.3 + avgConfidence * 0.4;

    if (overallConfidence > 0.8) return 'established';
    if (overallConfidence > 0.6) return 'probable';
    if (overallConfidence > 0.4) return 'projected';
    return 'speculative';
  }

  /**
   * Perform comprehensive analysis
   */
  private performAnalysis(
    dimensionScores: DimensionScore[],
    measurements: MetricMeasurement[]
  ): OutcomeAnalysis {
    // Sort dimensions by score
    const sortedByScore = [...dimensionScores].sort((a, b) => b.overallScore - a.overallScore);
    
    const strengths = sortedByScore.slice(0, 2).filter(ds => ds.overallScore > 0.6);
    const weaknesses = sortedByScore.slice(-2).filter(ds => ds.overallScore < 0.5);

    return {
      strengths,
      weaknesses,
      opportunities: this.identifyOpportunities(dimensionScores, measurements),
      risks: this.identifyRisks(dimensionScores, measurements),
      tradeoffs: this.analyzeTradeoffs(dimensionScores),
      recommendations: this.generateRecommendations(dimensionScores, measurements),
    };
  }

  /**
   * Identify improvement opportunities
   */
  private identifyOpportunities(
    dimensionScores: DimensionScore[],
    _measurements: MetricMeasurement[]
  ): OpportunityAnalysis[] {
    const opportunities: OpportunityAnalysis[] = [];

    for (const dimension of dimensionScores) {
      for (const metricScore of dimension.metricScores) {
        if (metricScore.rawScore < 0.6) {
          const metric = getMetricById(metricScore.metricId);
          if (!metric) continue;

          opportunities.push({
            dimension: dimension.category,
            metricId: metric.id,
            description: `Improve ${metric.name.toLowerCase()} from ${(metricScore.rawScore * 100).toFixed(0)}%`,
            potentialImpact: 0.7 - metricScore.rawScore,
            easeOfImprovement: 0.5 + (0.5 - metricScore.rawScore) * 0.5,
            priority: 0,
          });
        }
      }
    }

    // Sort by impact and assign priority
    return opportunities
      .sort((a, b) => b.potentialImpact - a.potentialImpact)
      .map((opp, index) => ({ ...opp, priority: index + 1 }));
  }

  /**
   * Identify risks
   */
  private identifyRisks(
    dimensionScores: DimensionScore[],
    _measurements: MetricMeasurement[]
  ): RiskAnalysis[] {
    const risks: RiskAnalysis[] = [];

    for (const dimension of dimensionScores) {
      for (const metricScore of dimension.metricScores) {
        if (metricScore.rawScore < 0.3) {
          const metric = getMetricById(metricScore.metricId);
          if (!metric) continue;

          risks.push({
            dimension: dimension.category,
            metricId: metric.id,
            description: `Low ${metric.name.toLowerCase()} (${(metricScore.rawScore * 100).toFixed(0)}%)`,
            severity: 1 - metricScore.rawScore,
            likelihood: 0.8,
          });
        }
      }
    }

    return risks.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Analyze tradeoffs between dimensions
   */
  private analyzeTradeoffs(dimensionScores: DimensionScore[]): TradeoffAnalysis[] {
    const tradeoffs: TradeoffAnalysis[] = [];

    // Known tradeoffs in career outcomes
    const knownTradeoffs: Array<[OutcomeCategory, OutcomeCategory, string]> = [
      [OutcomeCategory.FINANCIAL, OutcomeCategory.LIFESTYLE, 'Higher income often requires sacrificing work-life balance'],
      [OutcomeCategory.CAREER, OutcomeCategory.PSYCHOLOGICAL, 'Rapid career growth can increase stress and reduce satisfaction'],
      [OutcomeCategory.EDUCATIONAL, OutcomeCategory.FINANCIAL, 'Additional education delays earning but increases long-term income'],
    ];

    for (const [catA, catB, description] of knownTradeoffs) {
      const dimA = dimensionScores.find(ds => ds.category === catA);
      const dimB = dimensionScores.find(ds => ds.category === catB);

      if (dimA && dimB) {
        const correlation = this.calculateCorrelation(dimA, dimB);
        
        if (correlation < -0.3) {
          tradeoffs.push({
            dimensionA: catA,
            dimensionB: catB,
            correlation,
            description,
          });
        }
      }
    }

    return tradeoffs;
  }

  /**
   * Calculate correlation between dimensions
   */
  private calculateCorrelation(dimA: DimensionScore, dimB: DimensionScore): number {
    // Simplified correlation based on overall scores
    // In practice, this would use historical data
    const diff = dimA.overallScore - dimB.overallScore;
    return -Math.abs(diff) * 0.5; // Inverse relationship heuristic
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    dimensionScores: DimensionScore[],
    _measurements: MetricMeasurement[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Generate recommendations for lowest scoring dimensions
    const sortedDimensions = [...dimensionScores].sort((a, b) => a.overallScore - b.overallScore);
    
    for (let i = 0; i < Math.min(3, sortedDimensions.length); i++) {
      const dimension = sortedDimensions[i];
      if (dimension.overallScore < 0.7) {
        recommendations.push({
          priority: i + 1,
          category: dimension.category,
          action: `Focus on improving ${dimension.category.toLowerCase()} outcomes`,
          expectedImpact: 0.7 - dimension.overallScore,
          effort: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
        });
      }
    }

    return recommendations;
  }

  /**
   * Compare two outcome assessments
   */
  compareAssessments(
    base: OutcomeAssessment,
    comparison: OutcomeAssessment
  ): ComparativeAnalysis {
    const deltaScore = comparison.overallScore - base.overallScore;
    
    const dimensionDeltas: DimensionDelta[] = base.dimensionScores.map(baseDim => {
      const compDim = comparison.dimensionScores.find(
        ds => ds.category === baseDim.category
      );
      
      if (!compDim) {
        return {
          category: baseDim.category,
          baseScore: baseDim.overallScore,
          comparisonScore: 0,
          delta: -baseDim.overallScore,
          significance: 'major',
        };
      }

      const delta = compDim.overallScore - baseDim.overallScore;
      const absDelta = Math.abs(delta);
      
      return {
        category: baseDim.category,
        baseScore: baseDim.overallScore,
        comparisonScore: compDim.overallScore,
        delta,
        significance: absDelta > 0.2 ? 'major' : absDelta > 0.1 ? 'moderate' : 'minor',
      };
    });

    const winner = dimensionDeltas
      .filter(d => d.delta > 0.1)
      .map(d => d.category);
    
    const loser = dimensionDeltas
      .filter(d => d.delta < -0.1)
      .map(d => d.category);

    return {
      baseAssessment: base,
      comparisonAssessment: comparison,
      deltaScore,
      dimensionDeltas,
      winner,
      loser,
    };
  }

  /**
   * Perform sensitivity analysis
   */
  performSensitivityAnalysis(
    subjectId: string,
    measurements: MetricMeasurement[],
    horizon?: TimeHorizon
  ): SensitivityAnalysis {
    const baseAssessment = this.calculateAssessment(subjectId, measurements, horizon);
    const baseScore = baseAssessment.overallScore;

    // Metric sensitivities
    const metricSensitivities: MetricSensitivity[] = [];
    
    for (const measurement of measurements) {
      const metric = getMetricById(measurement.metricId);
      if (!metric) continue;

      // Test 10% improvement
      const improvedValue = Math.min(1, measurement.rawScore * 1.1 + 0.1);
      const improvedMeasurement: MetricMeasurement = {
        ...measurement,
        rawScore: improvedValue,
        weightedScore: improvedValue * metric.categoryWeight,
      };

      const otherMeasurements = measurements.filter(m => m.metricId !== measurement.metricId);
      const testAssessment = this.calculateAssessment(
        subjectId,
        [...otherMeasurements, improvedMeasurement],
        horizon
      );

      const scoreImpact = testAssessment.overallScore - baseScore;

      metricSensitivities.push({
        metricId: metric.id,
        metricName: metric.name,
        currentScore: measurement.rawScore,
        scoreImpact,
        rank: 0,
      });
    }

    // Sort by impact and assign ranks
    const rankedSensitivities = metricSensitivities
      .sort((a, b) => b.scoreImpact - a.scoreImpact)
      .map((sens, index) => ({ ...sens, rank: index + 1 }));

    // Dimension sensitivities
    const dimensionSensitivities: DimensionSensitivity[] = baseAssessment.dimensionScores.map(ds => {
      const weight = this.config.dimensionWeights[ds.category];
      const scoreChange = ds.overallScore * 0.1; // 10% dimension improvement
      const weightChange = weight * 0.1; // 10% weight change
      const scoreElasticity = weightChange > 0 ? scoreChange / weightChange : 0;

      return {
        category: ds.category,
        currentWeight: weight,
        currentScore: ds.overallScore,
        scoreElasticity,
      };
    });

    return {
      baseScore,
      metricSensitivities: rankedSensitivities,
      dimensionSensitivities,
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert score to band
 */
function scoreToBand(score: OutcomeScore): ScoreBand {
  if (score < 0.2) return ScoreBand.CRITICAL;
  if (score < 0.4) return ScoreBand.POOR;
  if (score < 0.6) return ScoreBand.MODERATE;
  if (score < 0.8) return ScoreBand.GOOD;
  return ScoreBand.EXCELLENT;
}

/**
 * Normalize raw value to 0-1 score
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number,
  direction: OptimizationDirection,
  targetValue?: number
): OutcomeScore {
  // Clamp to range
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Normalize to 0-1
  let normalized = (clampedValue - min) / (max - min);
  
  switch (direction) {
    case OptimizationDirection.MAXIMIZE:
      return normalized;
    
    case OptimizationDirection.MINIMIZE:
      return 1 - normalized;
    
    case OptimizationDirection.TARGET:
      if (targetValue === undefined) return normalized;
      const targetNormalized = (targetValue - min) / (max - min);
      const distance = Math.abs(normalized - targetNormalized);
      return Math.max(0, 1 - distance * 2); // Peak at target, falls off
    
    default:
      return normalized;
  }
}

/**
 * Create metric measurement from raw value
 */
export function createMetricMeasurement(
  metric: OutcomeMetric,
  rawValue: number,
  horizon: TimeHorizon,
  source?: string
): MetricMeasurement {
  const normalizedScore = normalizeValue(
    rawValue,
    metric.minValue,
    metric.maxValue,
    metric.direction,
    metric.targetValue
  );

  return {
    metricId: metric.id,
    value: rawValue,
    rawScore: normalizedScore,
    weightedScore: normalizedScore * metric.categoryWeight,
    horizon,
    measuredAt: new Date(),
    confidence: metric.confidence,
    source,
  };
}

/**
 * Factory function to create framework instance
 */
export function createScoringFramework(
  config?: Partial<ScoringConfiguration>
): OutcomeScoringFramework {
  return new OutcomeScoringFramework(config);
}
