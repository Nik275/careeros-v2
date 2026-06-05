/**
 * OutcomeMetric
 * 
 * Individual measurable outcome indicators.
 * Each metric represents a quantifiable aspect of career outcomes.
 */

import {
  OutcomeId,
  OutcomeSlug,
  OutcomeScore,
  OutcomeWeight,
  MetricUnit,
  TimeHorizon,
  ConfidenceLevel,
  MetricValue,
  OutcomeCategory,
  MetricType,
  OptimizationDirection,
} from './types';

/**
 * Core outcome metric definition
 */
export interface OutcomeMetric {
  readonly id: OutcomeId;
  readonly slug: OutcomeSlug;
  readonly name: string;
  readonly description: string;
  readonly category: OutcomeCategory;
  
  // Measurement properties
  readonly metricType: MetricType;
  readonly unit: MetricUnit;
  readonly direction: OptimizationDirection;
  
  // Normalization parameters (raw value -> 0-1 score)
  readonly minValue: number;
  readonly maxValue: number;
  readonly targetValue?: number; // For TARGET direction metrics
  
  // Time and confidence
  readonly applicableHorizons: TimeHorizon[];
  readonly confidence: ConfidenceLevel;
  
  // Scoring weights
  readonly defaultWeight: OutcomeWeight;
  readonly categoryWeight: OutcomeWeight; // Weight within its category
  
  // Metadata
  readonly dataSource?: string;
  readonly validationRules?: MetricValidationRules;
  readonly tags: string[];
  readonly relatedMetrics: OutcomeId[];
}

/**
 * Validation rules for metric values
 */
export interface MetricValidationRules {
  readonly min?: number;
  readonly max?: number;
  readonly required?: boolean;
  readonly allowedValues?: string[];
  readonly precision?: number; // Decimal places
}

/**
 * Concrete metric value with context
 */
export interface MetricMeasurement {
  readonly metricId: OutcomeId;
  readonly value: MetricValue;
  readonly rawScore: OutcomeScore; // Normalized 0-1
  readonly weightedScore: OutcomeScore; // After weighting
  readonly horizon: TimeHorizon;
  readonly measuredAt: Date;
  readonly confidence: ConfidenceLevel;
  readonly source?: string;
  readonly notes?: string;
}

/**
 * Detailed score for individual metric within dimension
 */
export interface MetricScoreDetail {
  readonly metricId: OutcomeId;
  readonly metricName: string;
  readonly rawScore: OutcomeScore;
  readonly normalizedScore: OutcomeScore;
  readonly weightedScore: OutcomeScore;
  readonly weight: OutcomeWeight;
  readonly contribution: OutcomeScore; // Percentage contribution to dimension
}

// ============================================
// STANDARD OUTCOME METRICS LIBRARY
// ============================================

/**
 * Financial Outcome Metrics
 */
export const FinancialMetrics = {
  INCOME: {
    id: 'financial_income',
    slug: 'income',
    name: 'Annual Income',
    description: 'Total annual compensation including base salary, bonuses, and equity',
    category: OutcomeCategory.FINANCIAL,
    metricType: MetricType.CURRENCY,
    unit: 'INR',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 5000000, // 50L for normalization context
    applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term'],
    confidence: 'established',
    defaultWeight: 0.25,
    categoryWeight: 0.35,
    tags: ['compensation', 'salary', 'primary'],
    relatedMetrics: ['financial_savings_rate', 'financial_wealth_velocity'],
  },
  
  SAVINGS_RATE: {
    id: 'financial_savings_rate',
    slug: 'savings-rate',
    name: 'Savings Rate',
    description: 'Percentage of income saved or invested',
    category: OutcomeCategory.FINANCIAL,
    metricType: MetricType.PERCENTAGE,
    unit: '%',
    direction: OptimizationDirection.TARGET,
    minValue: 0,
    maxValue: 100,
    targetValue: 30, // 30% target
    applicableHorizons: ['short_term', 'medium_term', 'long_term', 'lifetime'],
    confidence: 'established',
    defaultWeight: 0.20,
    categoryWeight: 0.25,
    tags: ['savings', 'investment', 'discipline'],
    relatedMetrics: ['financial_income', 'financial_net_worth'],
  },
  
  WEALTH_VELOCITY: {
    id: 'financial_wealth_velocity',
    slug: 'wealth-velocity',
    name: 'Wealth Trajectory',
    description: 'Rate of net worth growth year-over-year',
    category: OutcomeCategory.FINANCIAL,
    metricType: MetricType.PERCENTAGE,
    unit: '%_yoy',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: -20,
    maxValue: 100,
    applicableHorizons: ['medium_term', 'long_term', 'lifetime'],
    confidence: 'probable',
    defaultWeight: 0.20,
    categoryWeight: 0.20,
    tags: ['growth', 'wealth', 'compound'],
    relatedMetrics: ['financial_income', 'financial_savings_rate'],
  },
  
  NET_WORTH: {
    id: 'financial_net_worth',
    slug: 'net-worth',
    name: 'Net Worth',
    description: 'Total assets minus liabilities',
    category: OutcomeCategory.FINANCIAL,
    metricType: MetricType.CURRENCY,
    unit: 'INR',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: -1000000,
    maxValue: 100000000, // 10Cr
    applicableHorizons: ['short_term', 'medium_term', 'long_term', 'lifetime'],
    confidence: 'established',
    defaultWeight: 0.20,
    categoryWeight: 0.15,
    tags: ['wealth', 'assets', 'security'],
    relatedMetrics: ['financial_savings_rate', 'financial_wealth_velocity'],
  },
  
  FINANCIAL_SECURITY: {
    id: 'financial_security',
    slug: 'financial-security',
    name: 'Financial Security',
    description: 'Months of expenses covered by emergency fund',
    category: OutcomeCategory.FINANCIAL,
    metricType: MetricType.COUNT,
    unit: 'months',
    direction: OptimizationDirection.TARGET,
    minValue: 0,
    maxValue: 36,
    targetValue: 12, // 12 months target
    applicableHorizons: ['short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.15,
    categoryWeight: 0.05,
    tags: ['emergency', 'safety', 'resilience'],
    relatedMetrics: ['financial_savings_rate'],
  },
} as const satisfies Record<string, OutcomeMetric>;

/**
 * Educational Outcome Metrics
 */
export const EducationalMetrics = {
  HIGHEST_DEGREE: {
    id: 'education_highest_degree',
    slug: 'highest-degree',
    name: 'Highest Educational Attainment',
    description: 'Maximum education level achieved',
    category: OutcomeCategory.EDUCATIONAL,
    metricType: MetricType.ORDINAL,
    unit: 'level',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0, // No formal education
    maxValue: 10, // Doctorate/Post-doc
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.30,
    categoryWeight: 0.40,
    tags: ['degree', 'qualification', 'credential'],
    relatedMetrics: ['education_field_relevance', 'education_prestige'],
  },
  
  FIELD_RELEVANCE: {
    id: 'education_field_relevance',
    slug: 'field-relevance',
    name: 'Field of Study Relevance',
    description: 'How aligned education is with career path',
    category: OutcomeCategory.EDUCATIONAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'probable',
    defaultWeight: 0.25,
    categoryWeight: 0.30,
    tags: ['alignment', 'relevance', 'fit'],
    relatedMetrics: ['education_highest_degree', 'education_skill_transferability'],
  },
  
  INSTITUTION_PRESTIGE: {
    id: 'education_prestige',
    slug: 'institution-prestige',
    name: 'Institution Prestige',
    description: 'Reputation and ranking of educational institution',
    category: OutcomeCategory.EDUCATIONAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term'],
    confidence: 'established',
    defaultWeight: 0.20,
    categoryWeight: 0.20,
    tags: ['brand', 'reputation', 'network'],
    relatedMetrics: ['education_highest_degree', 'career_network_strength'],
  },
  
  SKILL_TRANSFERABILITY: {
    id: 'education_skill_transferability',
    slug: 'skill-transferability',
    name: 'Educational Skill Transferability',
    description: 'How applicable skills are across different roles/industries',
    category: OutcomeCategory.EDUCATIONAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['medium_term', 'long_term'],
    confidence: 'probable',
    defaultWeight: 0.15,
    categoryWeight: 0.10,
    tags: ['versatility', 'flexibility', 'portability'],
    relatedMetrics: ['education_field_relevance', 'career_optionality'],
  },
  
  CONTINUOUS_LEARNING: {
    id: 'education_continuous',
    slug: 'continuous-learning',
    name: 'Continuous Learning Index',
    description: 'Rate of ongoing education and skill development',
    category: OutcomeCategory.EDUCATIONAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['short_term', 'medium_term', 'long_term', 'lifetime'],
    confidence: 'projected',
    defaultWeight: 0.10,
    categoryWeight: 0.00,
    tags: ['growth', 'upskilling', 'adaptability'],
    relatedMetrics: ['career_skill_growth'],
  },
} as const satisfies Record<string, OutcomeMetric>;

/**
 * Psychological Outcome Metrics
 */
export const PsychologicalMetrics = {
  JOB_SATISFACTION: {
    id: 'psych_satisfaction',
    slug: 'job-satisfaction',
    name: 'Job Satisfaction',
    description: 'Overall contentment with work and career',
    category: OutcomeCategory.PSYCHOLOGICAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term'],
    confidence: 'established',
    defaultWeight: 0.25,
    categoryWeight: 0.25,
    tags: ['happiness', 'contentment', 'fulfillment'],
    relatedMetrics: ['psych_meaning', 'psych_engagement'],
  },
  
  BURNOUT_RISK: {
    id: 'psych_burnout',
    slug: 'burnout-risk',
    name: 'Burnout Risk',
    description: 'Likelihood of experiencing burnout',
    category: OutcomeCategory.PSYCHOLOGICAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MINIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.25,
    categoryWeight: 0.25,
    tags: ['stress', 'exhaustion', 'health'],
    relatedMetrics: ['lifestyle_work_life_balance', 'psych_engagement'],
  },
  
  MEANING: {
    id: 'psych_meaning',
    slug: 'meaning',
    name: 'Sense of Meaning',
    description: 'Perceived purpose and significance of work',
    category: OutcomeCategory.PSYCHOLOGICAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['short_term', 'medium_term', 'long_term'],
    confidence: 'probable',
    defaultWeight: 0.20,
    categoryWeight: 0.20,
    tags: ['purpose', 'impact', 'significance'],
    relatedMetrics: ['psych_satisfaction', 'psych_autonomy'],
  },
  
  ENGAGEMENT: {
    id: 'psych_engagement',
    slug: 'engagement',
    name: 'Work Engagement',
    description: 'Level of enthusiasm and absorption in work',
    category: OutcomeCategory.PSYCHOLOGICAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.15,
    categoryWeight: 0.15,
    tags: ['flow', 'motivation', 'energy'],
    relatedMetrics: ['psych_satisfaction', 'psych_autonomy'],
  },
  
  AUTONOMY: {
    id: 'psych_autonomy',
    slug: 'autonomy',
    name: 'Perceived Autonomy',
    description: 'Sense of control over work decisions',
    category: OutcomeCategory.PSYCHOLOGICAL,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.15,
    categoryWeight: 0.15,
    tags: ['control', 'independence', 'agency'],
    relatedMetrics: ['psych_satisfaction', 'lifestyle_flexibility'],
  },
} as const satisfies Record<string, OutcomeMetric>;

/**
 * Lifestyle Outcome Metrics
 */
export const LifestyleMetrics = {
  WORK_LIFE_BALANCE: {
    id: 'lifestyle_balance',
    slug: 'work-life-balance',
    name: 'Work-Life Balance',
    description: 'Equilibrium between professional and personal life',
    category: OutcomeCategory.LIFESTYLE,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.TARGET,
    minValue: 0,
    maxValue: 1,
    targetValue: 0.7,
    applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term'],
    confidence: 'established',
    defaultWeight: 0.30,
    categoryWeight: 0.35,
    tags: ['balance', 'wellbeing', 'time'],
    relatedMetrics: ['lifestyle_flexibility', 'lifestyle_commute', 'psych_burnout'],
  },
  
  FLEXIBILITY: {
    id: 'lifestyle_flexibility',
    slug: 'flexibility',
    name: 'Workplace Flexibility',
    description: 'Degree of freedom in when, where, and how work is done',
    category: OutcomeCategory.LIFESTYLE,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'established',
    defaultWeight: 0.25,
    categoryWeight: 0.30,
    tags: ['remote', 'hours', 'location'],
    relatedMetrics: ['lifestyle_balance', 'psych_autonomy'],
  },
  
  COMMUTE_BURDEN: {
    id: 'lifestyle_commute',
    slug: 'commute-burden',
    name: 'Commute Burden',
    description: 'Time and stress associated with commuting',
    category: OutcomeCategory.LIFESTYLE,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MINIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term'],
    confidence: 'established',
    defaultWeight: 0.20,
    categoryWeight: 0.20,
    tags: ['travel', 'time', 'stress'],
    relatedMetrics: ['lifestyle_balance', 'lifestyle_flexibility'],
  },
  
  LOCATION_DESIRABILITY: {
    id: 'lifestyle_location',
    slug: 'location-desirability',
    name: 'Location Desirability',
    description: 'Quality of life in required work location',
    category: OutcomeCategory.LIFESTYLE,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term'],
    confidence: 'probable',
    defaultWeight: 0.15,
    categoryWeight: 0.10,
    tags: ['city', 'quality', 'environment'],
    relatedMetrics: ['lifestyle_flexibility'],
  },
  
  FAMILY_FRIENDLINESS: {
    id: 'lifestyle_family',
    slug: 'family-friendliness',
    name: 'Family Friendliness',
    description: 'Support for family obligations and parenting',
    category: OutcomeCategory.LIFESTYLE,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term'],
    confidence: 'probable',
    defaultWeight: 0.10,
    categoryWeight: 0.05,
    tags: ['parenting', 'family', 'support'],
    relatedMetrics: ['lifestyle_balance', 'lifestyle_flexibility'],
  },
} as const satisfies Record<string, OutcomeMetric>;

/**
 * Career Outcome Metrics
 */
export const CareerMetrics = {
  PROMOTION_VELOCITY: {
    id: 'career_promotions',
    slug: 'promotion-velocity',
    name: 'Promotion Velocity',
    description: 'Rate of career advancement and level progression',
    category: OutcomeCategory.CAREER,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['short_term', 'medium_term', 'long_term'],
    confidence: 'probable',
    defaultWeight: 0.25,
    categoryWeight: 0.25,
    tags: ['growth', 'advancement', 'seniority'],
    relatedMetrics: ['career_skill_growth', 'career_momentum'],
  },
  
  SKILL_GROWTH: {
    id: 'career_skill_growth',
    slug: 'skill-growth',
    name: 'Skill Growth Rate',
    description: 'Pace of acquiring new relevant capabilities',
    category: OutcomeCategory.CAREER,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['short_term', 'medium_term', 'long_term'],
    confidence: 'probable',
    defaultWeight: 0.20,
    categoryWeight: 0.25,
    tags: ['learning', 'development', 'competence'],
    relatedMetrics: ['education_continuous', 'career_promotions'],
  },
  
  CAREER_MOMENTUM: {
    id: 'career_momentum',
    slug: 'career-momentum',
    name: 'Career Momentum',
    description: 'Overall trajectory and future opportunity potential',
    category: OutcomeCategory.CAREER,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['medium_term', 'long_term'],
    confidence: 'projected',
    defaultWeight: 0.20,
    categoryWeight: 0.20,
    tags: ['trajectory', 'future', 'opportunity'],
    relatedMetrics: ['career_promotions', 'career_skill_growth'],
  },
  
  OPTIONALITY: {
    id: 'career_optionality',
    slug: 'optionality',
    name: 'Career Optionality',
    description: 'Number of viable future paths available',
    category: OutcomeCategory.CAREER,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['medium_term', 'long_term'],
    confidence: 'projected',
    defaultWeight: 0.15,
    categoryWeight: 0.15,
    tags: ['options', 'flexibility', 'pivot'],
    relatedMetrics: ['career_skill_growth', 'education_skill_transferability'],
  },
  
  MARKET_DEMAND: {
    id: 'career_market_demand',
    slug: 'market-demand',
    name: 'Market Demand',
    description: 'Industry demand for current role/skills',
    category: OutcomeCategory.CAREER,
    metricType: MetricType.NORMALIZED,
    unit: 'score',
    direction: OptimizationDirection.MAXIMIZE,
    minValue: 0,
    maxValue: 1,
    applicableHorizons: ['short_term', 'medium_term'],
    confidence: 'probable',
    defaultWeight: 0.20,
    categoryWeight: 0.15,
    tags: ['demand', 'employability', 'security'],
    relatedMetrics: ['career_momentum', 'career_optionality'],
  },
} as const satisfies Record<string, OutcomeMetric>;

/**
 * All standard metrics combined
 */
export const AllOutcomeMetrics = {
  ...FinancialMetrics,
  ...EducationalMetrics,
  ...PsychologicalMetrics,
  ...LifestyleMetrics,
  ...CareerMetrics,
} as const;

/**
 * Get metrics by category
 */
export function getMetricsByCategory(
  category: OutcomeCategory
): OutcomeMetric[] {
  return Object.values(AllOutcomeMetrics).filter(
    (metric) => metric.category === category
  );
}

/**
 * Get metric by ID
 */
export function getMetricById(id: OutcomeId): OutcomeMetric | undefined {
  return Object.values(AllOutcomeMetrics).find((metric) => metric.id === id);
}

/**
 * Get metric by slug
 */
export function getMetricBySlug(slug: OutcomeSlug): OutcomeMetric | undefined {
  return Object.values(AllOutcomeMetrics).find((metric) => metric.slug === slug);
}
