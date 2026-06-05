/**
 * Outcome Ontology - Core Types
 * 
 * Domain primitives and type aliases for the outcome measurement system.
 * All scores normalized to 0.0 - 1.0 scale for consistency.
 */

// Domain Primitive Types
export type OutcomeScore = number;
export type OutcomeWeight = number;
export type OutcomeId = string;
export type OutcomeSlug = string;
export type MetricUnit = string;

// Time horizons for outcome measurement
export type TimeHorizon = 
  | 'immediate'    // 0-1 year
  | 'short_term'   // 1-3 years
  | 'medium_term'  // 3-7 years
  | 'long_term'    // 7-15 years
  | 'lifetime';    // 15+ years

// Confidence level for outcome predictions
export type ConfidenceLevel = 
  | 'established'   // Research-backed, high confidence
  | 'probable'      // Strong indicators, good confidence
  | 'projected'     // Modeled predictions, moderate confidence
  | 'speculative';  // Uncertain, low confidence

// Metric value types
export type MetricValue =
  | number      // Quantitative (salary, satisfaction score)
  | boolean     // Binary (has flexibility, is burnt out)
  | string      // Categorical (promotion level, education degree)
  | Date        // Temporal (promotion date, graduation year)
  | null;       // Unknown/unmeasured

// Outcome categories aligned with career decision dimensions
export enum OutcomeCategory {
  FINANCIAL = 'financial',
  EDUCATIONAL = 'educational',
  PSYCHOLOGICAL = 'psychological',
  LIFESTYLE = 'lifestyle',
  CAREER = 'career',
}

// Metric measurement types
export enum MetricType {
  CURRENCY = 'currency',           // INR, USD, etc.
  PERCENTAGE = 'percentage',       // 0-100%
  NORMALIZED = 'normalized',       // 0.0 - 1.0
  COUNT = 'count',                 // Discrete numbers
  BOOLEAN = 'boolean',             // true/false
  ORDINAL = 'ordinal',             // Ordered categories
  NOMINAL = 'nominal',             // Unordered categories
  DURATION = 'duration',           // Time periods
  RATING = 'rating',               // Likert scales, 1-5, 1-10
}

// Score interpretation bands
export enum ScoreBand {
  CRITICAL = 'critical',     // 0.0 - 0.2 - Requires immediate attention
  POOR = 'poor',             // 0.2 - 0.4 - Below acceptable
  MODERATE = 'moderate',     // 0.4 - 0.6 - Acceptable range
  GOOD = 'good',             // 0.6 - 0.8 - Above average
  EXCELLENT = 'excellent',   // 0.8 - 1.0 - Outstanding
}

// Aggregation methods for combining scores
export enum AggregationMethod {
  WEIGHTED_AVERAGE = 'weighted_average',
  ARITHMETIC_MEAN = 'arithmetic_mean',
  GEOMETRIC_MEAN = 'geometric_mean',
  MINIMUM = 'minimum',           // Worst metric determines score
  MAXIMUM = 'maximum',           // Best metric determines score
  MEDIAN = 'median',
}

// Direction of desired change
export enum OptimizationDirection {
  MAXIMIZE = 'maximize',   // Higher is better (income, satisfaction)
  MINIMIZE = 'minimize',   // Lower is better (burnout, commute time)
  TARGET = 'target',       // Aim for specific value (work-life balance)
}
