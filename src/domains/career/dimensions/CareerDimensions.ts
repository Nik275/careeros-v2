/**
 * Career Dimensions System
 *
 * CareerOS - Career Intelligence System
 *
 * This module defines the complete dimensional framework for evaluating
 * careers in CareerOS. Every career is assessed using identical dimensions
 * to enable consistent comparison, matching, and analysis.
 *
 * Architecture Principles:
 *   - Single source of truth for all career dimensions
 *   - Rich metadata for each dimension (descriptions, ranges, weights)
 *   - Type-safe access to dimension values from Career objects
 *   - Extensible for future dimension additions
 *   - Normalized scoring (0-10 scale for evaluation, 0.0-1.0 for storage)
 *
 * Dimension Categories:
 *   - Psychology: 8 dimensions of psychological traits
 *   - Work Style: 8 dimensions of work environment preferences
 *   - Rewards: 5 dimensions of potential satisfactions
 *   - Risks: 4 dimensions of potential downsides
 *   - Optionality: 3 dimensions of future flexibility
 *
 * Total: 28 dimensions
 */

import type { Career, CareerScore } from '../Career';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Dimension score on a 0-10 scale for evaluation and display.
 *
 * 0 = Absent/Minimum
 * 5 = Moderate/Average
 * 10 = Maximum/Present
 *
 * This is the user-facing scale. Internally stored as 0.0-1.0 CareerScore.
 */
export type DimensionScore = number;

/**
 * Valid range for dimension scores.
 */
export const DIMENSION_SCORE_MIN = 0;
export const DIMENSION_SCORE_MAX = 10;

// ============================================================================
// DIMENSION CATEGORIES
// ============================================================================

/**
 * Categories of career dimensions.
 */
export enum DimensionCategory {
  PSYCHOLOGY = 'psychology',
  WORK_STYLE = 'work_style',
  REWARDS = 'rewards',
  RISKS = 'risks',
  OPTIONALITY = 'optionality',
}

/**
 * Human-readable labels for dimension categories.
 */
export const DimensionCategoryLabels: Record<DimensionCategory, string> = {
  [DimensionCategory.PSYCHOLOGY]: 'Psychological Traits',
  [DimensionCategory.WORK_STYLE]: 'Work Style',
  [DimensionCategory.REWARDS]: 'Rewards & Satisfaction',
  [DimensionCategory.RISKS]: 'Risks & Challenges',
  [DimensionCategory.OPTIONALITY]: 'Future Flexibility',
};

/**
 * Descriptions for dimension categories.
 */
export const DimensionCategoryDescriptions: Record<DimensionCategory, string> = {
  [DimensionCategory.PSYCHOLOGY]:
    'Psychological traits that this career requires, rewards, or develops. ' +
    'High scores indicate the career strongly demands or cultivates this trait.',

  [DimensionCategory.WORK_STYLE]:
    'Characteristics of the work environment and daily work patterns. ' +
    'Describes where, how, and with whom work happens.',

  [DimensionCategory.REWARDS]:
    'Potential satisfactions, benefits, and positive outcomes this career offers. ' +
    'Not all careers excel in all reward dimensions - tradeoffs are common.',

  [DimensionCategory.RISKS]:
    'Potential downsides, challenges, and negative factors in this career. ' +
    'Higher scores indicate greater risk or more significant challenges.',

  [DimensionCategory.OPTIONALITY]:
    'Flexibility and future opportunities this career creates. ' +
    'Measures how well this career keeps future options open.',
};

// ============================================================================
// CAREER DIMENSION ENUM
// ============================================================================

/**
 * All career dimensions in CareerOS.
 *
 * This enum is the single source of truth for all dimensions used to
 * evaluate careers. Every career assessment uses these identical dimensions
 * to enable consistent comparison and matching.
 */
export enum CareerDimension {
  // ========================================================================
  // PSYCHOLOGY (8 dimensions)
  // ========================================================================

  /** Analytical thinking: logical reasoning, problem decomposition, data analysis */
  ANALYTICAL_THINKING = 'analyticalThinking',

  /** Creativity: original thinking, innovation, artistic expression */
  CREATIVITY = 'creativity',

  /** Social orientation: interpersonal interaction, empathy, communication */
  SOCIAL_ORIENTATION = 'socialOrientation',

  /** Leadership: influence, decision-making, team direction */
  LEADERSHIP = 'leadership',

  /** Detail orientation: precision, thoroughness, error detection */
  DETAIL_ORIENTATION = 'detailOrientation',

  /** Curiosity: continuous learning, exploration, questioning */
  CURIOSITY = 'curiosity',

  /** Competitiveness: drive to outperform, achievement orientation */
  COMPETITIVENESS = 'competitiveness',

  /** Risk tolerance: comfort with uncertainty, taking calculated risks */
  RISK_TOLERANCE = 'riskTolerance',

  // ========================================================================
  // WORK STYLE (8 dimensions)
  // ========================================================================

  /** Remote work: possibility of working from home/anywhere (0=never, 10=fully remote) */
  REMOTE_WORK = 'remoteWork',

  /** Office work: requirement to work from office (0=never, 10=full-time office) */
  OFFICE_WORK = 'officeWork',

  /** Field work: requirement for on-site/field work (0=never, 10=primarily field) */
  FIELD_WORK = 'fieldWork',

  /** Travel requirement: amount of travel required (0=none, 10=extensive) */
  TRAVEL_REQUIREMENT = 'travelRequirement',

  /** Team orientation: degree of teamwork required (0=solo, 10=constant team) */
  TEAM_ORIENTATION = 'teamOrientation',

  /** Solo orientation: degree of independent work (0=no solo, 10=primarily solo) */
  SOLO_ORIENTATION = 'soloOrientation',

  /** Structured environment: degree of structure/rules (0=chaotic, 10=highly structured) */
  STRUCTURED_ENVIRONMENT = 'structuredEnvironment',

  /** Unstructured environment: degree of flexibility (0=rigid, 10=highly flexible) */
  UNSTRUCTURED_ENVIRONMENT = 'unstructuredEnvironment',

  // ========================================================================
  // REWARDS (5 dimensions)
  // ========================================================================

  /** Income potential: earning ceiling and growth trajectory */
  INCOME_POTENTIAL = 'incomePotential',

  /** Status potential: social prestige and recognition */
  STATUS_POTENTIAL = 'statusPotential',

  /** Impact potential: ability to make a difference, help others */
  IMPACT_POTENTIAL = 'impactPotential',

  /** Freedom potential: autonomy, flexibility, independence */
  FREEDOM_POTENTIAL = 'freedomPotential',

  /** Stability potential: job security, predictable income */
  STABILITY_POTENTIAL = 'stabilityPotential',

  // ========================================================================
  // RISKS (4 dimensions)
  // ========================================================================

  /** Burnout risk: stress, overwork, emotional exhaustion */
  BURNOUT_RISK = 'burnoutRisk',

  /** Automation risk: likelihood of being replaced by AI/automation */
  AUTOMATION_RISK = 'automationRisk',

  /** Competition level: difficulty entering and advancing */
  COMPETITION_LEVEL = 'competitionLevel',

  /** Income volatility: irregularity and unpredictability of earnings */
  INCOME_VOLATILITY = 'incomeVolatility',

  // ========================================================================
  // OPTIONALITY (3 dimensions)
  // ========================================================================

  /** Career flexibility: ease of switching to related careers */
  CAREER_FLEXIBILITY = 'careerFlexibility',

  /** Transferable skills: how applicable skills are to other fields */
  TRANSFERABLE_SKILLS = 'transferableSkills',

  /** Entrepreneurship potential: ease of starting own business in this domain */
  ENTREPRENEURSHIP_POTENTIAL = 'entrepreneurshipPotential',
}

/**
 * All career dimensions as an array for iteration.
 */
export const ALL_CAREER_DIMENSIONS: CareerDimension[] = Object.values(CareerDimension);

/**
 * Number of career dimensions.
 */
export const TOTAL_DIMENSION_COUNT = ALL_CAREER_DIMENSIONS.length; // 28

// ============================================================================
// DIMENSION METADATA
// ============================================================================

/**
 * Metadata for a single career dimension.
 *
 * Provides rich context about what the dimension measures,
 * how to interpret scores, and how to use it in evaluations.
 */
export interface DimensionMetadata {
  /** The dimension enum value */
  dimension: CareerDimension;

  /** Human-readable label */
  label: string;

  /** Detailed description of what this dimension measures */
  description: string;

  /** Which category this dimension belongs to */
  category: DimensionCategory;

  /** Low score description (what 0-2 means) */
  lowScoreDescription: string;

  /** Medium score description (what 4-6 means) */
  mediumScoreDescription: string;

  /** High score description (what 8-10 means) */
  highScoreDescription: string;

  /** Whether higher scores are "better" (for guidance) */
  isPositive: boolean;

  /** Whether this dimension is a risk factor (higher = more risk) */
  isRiskFactor: boolean;

  /** Weight for importance calculations (0.0 - 1.0) */
  defaultWeight: number;

  /** Related dimensions that correlate with this one */
  relatedDimensions?: CareerDimension[];

  /** Student profile trait that maps to this dimension */
  relatedStudentTrait?: string;
}

// ============================================================================
// DIMENSION REGISTRY
// ============================================================================

/**
 * Complete metadata for all career dimensions.
 *
 * This is the authoritative source of dimension information.
 * All dimension UI, validation, and logic should reference this registry.
 */
export const DimensionRegistry: Record<CareerDimension, DimensionMetadata> = {
  // ========================================================================
  // PSYCHOLOGY
  // ========================================================================

  [CareerDimension.ANALYTICAL_THINKING]: {
    dimension: CareerDimension.ANALYTICAL_THINKING,
    label: 'Analytical Thinking',
    description:
      'The degree to which this career requires logical reasoning, systematic problem-solving, ' +
      'data analysis, and structured thinking. Careers high in this dimension involve breaking ' +
      'down complex problems, identifying patterns, and making data-driven decisions.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Intuitive, experience-based decision making; little data analysis required',
    mediumScoreDescription: 'Balanced approach; some analysis combined with judgment',
    highScoreDescription: 'Heavy reliance on data, logic, and systematic analysis',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 1.0,
    relatedDimensions: [CareerDimension.DETAIL_ORIENTATION, CareerDimension.CURIOSITY],
    relatedStudentTrait: 'analyticalThinking',
  },

  [CareerDimension.CREATIVITY]: {
    dimension: CareerDimension.CREATIVITY,
    label: 'Creativity',
    description:
      'The degree to which this career rewards original thinking, innovation, artistic expression, ' +
      'and novel problem-solving. High-creativity careers involve generating new ideas, designs, ' +
      'or approaches rather than following established patterns.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Follow established procedures; little room for original thinking',
    mediumScoreDescription: 'Some opportunity for creative problem-solving within guidelines',
    highScoreDescription: 'Generate original ideas; innovation and artistic expression central',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.CURIOSITY, CareerDimension.UNSTRUCTURED_ENVIRONMENT],
    relatedStudentTrait: 'creativity',
  },

  [CareerDimension.SOCIAL_ORIENTATION]: {
    dimension: CareerDimension.SOCIAL_ORIENTATION,
    label: 'Social Orientation',
    description:
      'The degree to which this career involves interpersonal interaction, empathy, communication, ' +
      'and understanding others. High scores indicate careers where working with people is central ' +
      'to success.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Work primarily with systems, data, or objects; minimal people interaction',
    mediumScoreDescription: 'Regular interaction with colleagues and some external contacts',
    highScoreDescription: 'Constant people interaction; empathy and communication essential',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 1.0,
    relatedDimensions: [CareerDimension.TEAM_ORIENTATION, CareerDimension.LEADERSHIP],
    relatedStudentTrait: 'socialOrientation',
  },

  [CareerDimension.LEADERSHIP]: {
    dimension: CareerDimension.LEADERSHIP,
    label: 'Leadership',
    description:
      'The degree to which this career requires influencing others, making decisions for groups, ' +
      'directing teams, and taking responsibility for outcomes. Leadership is required at all ' +
      'levels in some careers; in others, it is only needed for senior roles.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Individual contributor; follow direction from others',
    mediumScoreDescription: 'Some leadership of small teams or projects',
    highScoreDescription: 'Direct large teams; strategic decision-making responsibility',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.8,
    relatedDimensions: [CareerDimension.SOCIAL_ORIENTATION, CareerDimension.COMPETITIVENESS],
    relatedStudentTrait: 'leadership',
  },

  [CareerDimension.DETAIL_ORIENTATION]: {
    dimension: CareerDimension.DETAIL_ORIENTATION,
    label: 'Detail Orientation',
    description:
      'The degree to which this career requires precision, thoroughness, error detection, and ' +
      'attention to fine points. High scores indicate careers where mistakes have significant ' +
      'consequences and accuracy is paramount.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Big-picture focus; minor errors acceptable',
    mediumScoreDescription: 'Balance between detail and speed; some accuracy required',
    highScoreDescription: 'Extreme precision required; errors have serious consequences',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.ANALYTICAL_THINKING, CareerDimension.STRUCTURED_ENVIRONMENT],
    relatedStudentTrait: 'detailOrientation',
  },

  [CareerDimension.CURIOSITY]: {
    dimension: CareerDimension.CURIOSITY,
    label: 'Curiosity',
    description:
      'The degree to which this career rewards continuous learning, exploration, questioning ' +
      'assumptions, and seeking new knowledge. High-curiosity careers are constantly evolving ' +
      'and require staying current with developments.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Stable knowledge base; little need for ongoing learning',
    mediumScoreDescription: 'Periodic updates to skills and knowledge',
    highScoreDescription: 'Constant learning required; field evolves rapidly',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.85,
    relatedDimensions: [CareerDimension.CREATIVITY, CareerDimension.ANALYTICAL_THINKING],
    relatedStudentTrait: 'curiosity',
  },

  [CareerDimension.COMPETITIVENESS]: {
    dimension: CareerDimension.COMPETITIVENESS,
    label: 'Competitiveness',
    description:
      'The degree to which this career rewards drive to outperform others, achievement orientation, ' +
      'and winning mentality. High-competitiveness careers often have clear winners and losers, ' +
      'rankings, or zero-sum elements.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Collaborative environment; success not measured against others',
    mediumScoreDescription: 'Some competitive elements; performance comparisons exist',
    highScoreDescription: 'Highly competitive; winners and losers clearly defined',
    isPositive: false, // Not necessarily better or worse
    isRiskFactor: false,
    defaultWeight: 0.7,
    relatedDimensions: [CareerDimension.LEADERSHIP, CareerDimension.COMPETITION_LEVEL],
    relatedStudentTrait: 'competitiveness',
  },

  [CareerDimension.RISK_TOLERANCE]: {
    dimension: CareerDimension.RISK_TOLERANCE,
    label: 'Risk Tolerance',
    description:
      'The degree to which this career requires comfort with uncertainty, taking calculated risks, ' +
      'and operating without guaranteed outcomes. High risk-tolerance careers involve ambiguity, ' +
      'experimentation, and potential for failure.',
    category: DimensionCategory.PSYCHOLOGY,
    lowScoreDescription: 'Predictable outcomes; low uncertainty; safe choices',
    mediumScoreDescription: 'Some uncertainty; calculated risks occasionally needed',
    highScoreDescription: 'High uncertainty; frequent risky decisions; failure is possible',
    isPositive: false, // Depends on student preference
    isRiskFactor: false,
    defaultWeight: 0.75,
    relatedDimensions: [CareerDimension.INCOME_VOLATILITY, CareerDimension.ENTREPRENEURSHIP_POTENTIAL],
    relatedStudentTrait: 'riskTolerance',
  },

  // ========================================================================
  // WORK STYLE
  // ========================================================================

  [CareerDimension.REMOTE_WORK]: {
    dimension: CareerDimension.REMOTE_WORK,
    label: 'Remote Work',
    description:
      'The degree to which this career allows or requires working from home or anywhere, ' +
      'without being physically present at a specific workplace.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'Must be physically present at workplace every day',
    mediumScoreDescription: 'Hybrid arrangement; some remote days possible',
    highScoreDescription: 'Fully remote; can work from anywhere',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.8,
    relatedDimensions: [CareerDimension.OFFICE_WORK, CareerDimension.FREEDOM_POTENTIAL],
  },

  [CareerDimension.OFFICE_WORK]: {
    dimension: CareerDimension.OFFICE_WORK,
    label: 'Office Work',
    description:
      'The degree to which this career requires working from a traditional office environment ' +
      'with typical office infrastructure and in-person colleagues.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'No office required; field or remote work only',
    mediumScoreDescription: 'Some office time with flexibility',
    highScoreDescription: 'Full-time office presence required',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.6,
    relatedDimensions: [CareerDimension.REMOTE_WORK],
  },

  [CareerDimension.FIELD_WORK]: {
    dimension: CareerDimension.FIELD_WORK,
    label: 'Field Work',
    description:
      'The degree to which this career requires on-site work, outdoor activities, or working ' +
      'at locations outside of traditional office environments.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'No field work; indoor/office environment only',
    mediumScoreDescription: 'Occasional site visits or outdoor activities',
    highScoreDescription: 'Primarily field-based; outdoor/worksite focus',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.7,
    relatedDimensions: [CareerDimension.OFFICE_WORK, CareerDimension.TRAVEL_REQUIREMENT],
  },

  [CareerDimension.TRAVEL_REQUIREMENT]: {
    dimension: CareerDimension.TRAVEL_REQUIREMENT,
    label: 'Travel Requirement',
    description:
      'The amount of travel this career requires, including overnight trips, client visits, ' +
      'and location changes.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'No travel; work from fixed location',
    mediumScoreDescription: 'Occasional travel for meetings or conferences',
    highScoreDescription: 'Extensive travel; frequently on the road',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.7,
    relatedDimensions: [CareerDimension.FIELD_WORK],
  },

  [CareerDimension.TEAM_ORIENTATION]: {
    dimension: CareerDimension.TEAM_ORIENTATION,
    label: 'Team Orientation',
    description:
      'The degree to which this career involves working collaboratively with others, ' +
      'coordinating efforts, and achieving shared goals.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'Independent work; minimal collaboration',
    mediumScoreDescription: 'Regular team interaction with solo work periods',
    highScoreDescription: 'Constant teamwork; collaboration essential',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.8,
    relatedDimensions: [CareerDimension.SOLO_ORIENTATION, CareerDimension.SOCIAL_ORIENTATION],
  },

  [CareerDimension.SOLO_ORIENTATION]: {
    dimension: CareerDimension.SOLO_ORIENTATION,
    label: 'Solo Orientation',
    description:
      'The degree to which this career involves independent work, self-direction, and ' +
      'minimal collaboration with others.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'Always working with others; no independent work',
    mediumScoreDescription: 'Mix of team and independent work',
    highScoreDescription: 'Primarily independent work; self-directed',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.7,
    relatedDimensions: [CareerDimension.TEAM_ORIENTATION, CareerDimension.FREEDOM_POTENTIAL],
  },

  [CareerDimension.STRUCTURED_ENVIRONMENT]: {
    dimension: CareerDimension.STRUCTURED_ENVIRONMENT,
    label: 'Structured Environment',
    description:
      'The degree to which this career operates within clear rules, procedures, hierarchies, ' +
      'and predictable patterns.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'Chaotic, unpredictable, few rules or procedures',
    mediumScoreDescription: 'Some structure with flexibility',
    highScoreDescription: 'Highly structured; clear rules and procedures',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.75,
    relatedDimensions: [CareerDimension.UNSTRUCTURED_ENVIRONMENT, CareerDimension.DETAIL_ORIENTATION],
  },

  [CareerDimension.UNSTRUCTURED_ENVIRONMENT]: {
    dimension: CareerDimension.UNSTRUCTURED_ENVIRONMENT,
    label: 'Unstructured Environment',
    description:
      'The degree to which this career offers flexibility, autonomy in how work is done, ' +
      'and freedom from rigid procedures.',
    category: DimensionCategory.WORK_STYLE,
    lowScoreDescription: 'Rigid procedures; no flexibility in how work is done',
    mediumScoreDescription: 'Some flexibility within guidelines',
    highScoreDescription: 'Highly flexible; define your own approach',
    isPositive: false, // Preference-dependent
    isRiskFactor: false,
    defaultWeight: 0.75,
    relatedDimensions: [CareerDimension.STRUCTURED_ENVIRONMENT, CareerDimension.FREEDOM_POTENTIAL],
  },

  // ========================================================================
  // REWARDS
  // ========================================================================

  [CareerDimension.INCOME_POTENTIAL]: {
    dimension: CareerDimension.INCOME_POTENTIAL,
    label: 'Income Potential',
    description:
      'The earning ceiling and growth trajectory this career offers. Considers top earners, ' +
      'typical progression, and time to reach high income levels.',
    category: DimensionCategory.REWARDS,
    lowScoreDescription: 'Limited earning potential; modest salary ceiling',
    mediumScoreDescription: 'Good middle-class income with steady growth',
    highScoreDescription: 'Very high earning potential; top percentile possible',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 1.0,
    relatedDimensions: [CareerDimension.INCOME_VOLATILITY, CareerDimension.STATUS_POTENTIAL],
  },

  [CareerDimension.STATUS_POTENTIAL]: {
    dimension: CareerDimension.STATUS_POTENTIAL,
    label: 'Status Potential',
    description:
      'The social prestige, respect, and recognition this career provides. Considers ' +
      'societal perception, professional standing, and perceived success.',
    category: DimensionCategory.REWARDS,
    lowScoreDescription: 'Little social recognition or prestige',
    mediumScoreDescription: 'Respected profession with moderate status',
    highScoreDescription: 'High social prestige; widely respected and admired',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.INCOME_POTENTIAL, CareerDimension.STABILITY_POTENTIAL],
  },

  [CareerDimension.IMPACT_POTENTIAL]: {
    dimension: CareerDimension.IMPACT_POTENTIAL,
    label: 'Impact Potential',
    description:
      'The ability to make a positive difference, help others, contribute to society, ' +
      'and create meaningful change through this career.',
    category: DimensionCategory.REWARDS,
    lowScoreDescription: 'Limited societal impact; work serves narrow purpose',
    mediumScoreDescription: 'Moderate impact on customers, team, or community',
    highScoreDescription: 'Transformative impact; change lives and society',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.95,
    relatedDimensions: [CareerDimension.STATUS_POTENTIAL, CareerDimension.SOCIAL_ORIENTATION],
  },

  [CareerDimension.FREEDOM_POTENTIAL]: {
    dimension: CareerDimension.FREEDOM_POTENTIAL,
    label: 'Freedom Potential',
    description:
      'The autonomy, flexibility, and independence this career offers. Considers control ' +
      'over schedule, work location, decision-making, and life balance.',
    category: DimensionCategory.REWARDS,
    lowScoreDescription: 'Little autonomy; rigid schedule and supervision',
    mediumScoreDescription: 'Some flexibility in schedule and approach',
    highScoreDescription: 'High autonomy; control over work and life',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.REMOTE_WORK, CareerDimension.ENTREPRENEURSHIP_POTENTIAL],
  },

  [CareerDimension.STABILITY_POTENTIAL]: {
    dimension: CareerDimension.STABILITY_POTENTIAL,
    label: 'Stability Potential',
    description:
      'The job security, predictable income, and low risk of unemployment this career provides. ' +
      'Considers demand trends, layoff history, and recession resistance.',
    category: DimensionCategory.REWARDS,
    lowScoreDescription: 'High uncertainty; frequent layoffs or income fluctuations',
    mediumScoreDescription: 'Moderate stability; some risk but manageable',
    highScoreDescription: 'Very stable; secure employment and predictable income',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.95,
    relatedDimensions: [CareerDimension.AUTOMATION_RISK, CareerDimension.INCOME_VOLATILITY],
  },

  // ========================================================================
  // RISKS
  // ========================================================================

  [CareerDimension.BURNOUT_RISK]: {
    dimension: CareerDimension.BURNOUT_RISK,
    label: 'Burnout Risk',
    description:
      'The risk of stress, overwork, emotional exhaustion, and burnout in this career. ' +
      'Considers work hours, emotional demands, and recovery difficulty.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Low stress; sustainable workload; good balance',
    mediumScoreDescription: 'Moderate pressure; occasional intense periods',
    highScoreDescription: 'High stress; long hours; significant burnout risk',
    isPositive: false, // Lower is better
    isRiskFactor: true,
    defaultWeight: 1.0,
    relatedDimensions: [CareerDimension.COMPETITION_LEVEL, CareerDimension.INCOME_VOLATILITY],
  },

  [CareerDimension.AUTOMATION_RISK]: {
    dimension: CareerDimension.AUTOMATION_RISK,
    label: 'Automation Risk',
    description:
      'The likelihood that this career will be significantly disrupted or replaced by ' +
      'AI, automation, or technology in the next 10-15 years.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Highly resistant to automation; human skills essential',
    mediumScoreDescription: 'Some tasks automated; core work remains human',
    highScoreDescription: 'High automation risk; significant job displacement likely',
    isPositive: false, // Lower is better
    isRiskFactor: true,
    defaultWeight: 0.95,
    relatedDimensions: [CareerDimension.STABILITY_POTENTIAL, CareerDimension.CURIOSITY],
  },

  [CareerDimension.COMPETITION_LEVEL]: {
    dimension: CareerDimension.COMPETITION_LEVEL,
    label: 'Competition Level',
    description:
      'The difficulty of entering this career and advancing. Considers number of applicants ' +
      'per position, selectivity of entry paths, and advancement difficulty.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Easy entry; many opportunities; low barriers',
    mediumScoreDescription: 'Moderate competition; achievable with effort',
    highScoreDescription: 'Extremely competitive; few succeed; high barriers',
    isPositive: false, // Lower is better
    isRiskFactor: true,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.COMPETITIVENESS, CareerDimension.BURNOUT_RISK],
  },

  [CareerDimension.INCOME_VOLATILITY]: {
    dimension: CareerDimension.INCOME_VOLATILITY,
    label: 'Income Volatility',
    description:
      'The irregularity and unpredictability of earnings in this career. Considers ' +
      'commission-based pay, freelance nature, and economic sensitivity.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Predictable salary; steady income month to month',
    mediumScoreDescription: 'Some variation; bonuses or seasonal fluctuations',
    highScoreDescription: 'Highly variable; feast-or-famine income patterns',
    isPositive: false, // Lower is better
    isRiskFactor: true,
    defaultWeight: 0.85,
    relatedDimensions: [CareerDimension.INCOME_POTENTIAL, CareerDimension.RISK_TOLERANCE],
  },

  // ========================================================================
  // OPTIONALITY
  // ========================================================================

  [CareerDimension.CAREER_FLEXIBILITY]: {
    dimension: CareerDimension.CAREER_FLEXIBILITY,
    label: 'Career Flexibility',
    description:
      'The ease of switching to related careers or pivoting to new paths. Considers ' +
      'how well skills transfer and how accepting other fields are of this background.',
    category: DimensionCategory.OPTIONALITY,
    lowScoreDescription: 'Specialized path; difficult to switch careers',
    mediumScoreDescription: 'Some related options; moderate pivot difficulty',
    highScoreDescription: 'Many adjacent careers; easy to switch directions',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.85,
    relatedDimensions: [CareerDimension.TRANSFERABLE_SKILLS, CareerDimension.CURIOSITY],
  },

  [CareerDimension.TRANSFERABLE_SKILLS]: {
    dimension: CareerDimension.TRANSFERABLE_SKILLS,
    label: 'Transferable Skills',
    description:
      'How applicable the skills gained in this career are to other fields and industries. ' +
      'Considers universality of competencies and cross-domain value.',
    category: DimensionCategory.OPTIONALITY,
    lowScoreDescription: 'Narrow, specialized skills; limited outside application',
    mediumScoreDescription: 'Some skills transfer; domain-specific but adaptable',
    highScoreDescription: 'Universal skills valuable across many domains',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.9,
    relatedDimensions: [CareerDimension.CAREER_FLEXIBILITY, CareerDimension.ANALYTICAL_THINKING],
  },

  [CareerDimension.ENTREPRENEURSHIP_POTENTIAL]: {
    dimension: CareerDimension.ENTREPRENEURSHIP_POTENTIAL,
    label: 'Entrepreneurship Potential',
    description:
      'The ease of starting your own business or practice in this domain. Considers ' +
      'capital requirements, regulatory barriers, and market opportunities.',
    category: DimensionCategory.OPTIONALITY,
    lowScoreDescription: 'High barriers; difficult to start independently',
    mediumScoreDescription: 'Possible with effort; moderate barriers',
    highScoreDescription: 'Low barriers; easy to start own business/practice',
    isPositive: true,
    isRiskFactor: false,
    defaultWeight: 0.75,
    relatedDimensions: [CareerDimension.FREEDOM_POTENTIAL, CareerDimension.RISK_TOLERANCE],
  },
};

// ============================================================================
// INDIA-SPECIFIC DIMENSIONS (Additional Layer)
// ============================================================================

/**
 * India-specific career dimensions.
 *
 * These dimensions capture factors unique to the Indian context that affect
 * career accessibility and success. They complement the universal dimensions.
 */
export enum IndiaCareerDimension {
  COACHING_DEPENDENCY = 'coachingDependency',
  URBAN_ADVANTAGE = 'urbanAdvantage',
  ENGLISH_DEPENDENCY = 'englishDependency',
  MIGRATION_REQUIREMENT = 'migrationRequirement',
}

/**
 * Metadata for India-specific dimensions.
 */
export const IndiaDimensionRegistry: Record<IndiaCareerDimension, DimensionMetadata> = {
  [IndiaCareerDimension.COACHING_DEPENDENCY]: {
    dimension: IndiaCareerDimension.COACHING_DEPENDENCY as unknown as CareerDimension,
    label: 'Coaching Dependency',
    description:
      'How critical is entrance exam coaching (FIITJEE, Allen, Aakash, etc.) for success? ' +
      'High scores indicate careers where coaching is almost essential.',
    category: DimensionCategory.RISKS, // Treat as risk factor
    lowScoreDescription: 'Can succeed without coaching; self-study sufficient',
    mediumScoreDescription: 'Coaching helpful but not essential',
    highScoreDescription: 'Coaching almost mandatory; hard to succeed without',
    isPositive: false, // Lower is better (less dependency)
    isRiskFactor: true,
    defaultWeight: 0.9,
  },

  [IndiaCareerDimension.URBAN_ADVANTAGE]: {
    dimension: IndiaCareerDimension.URBAN_ADVANTAGE as unknown as CareerDimension,
    label: 'Urban Advantage',
    description:
      'How much does being in a Tier-1 city (Delhi, Mumbai, Bangalore) help career success? ' +
      'High scores indicate careers concentrated in major cities.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Location doesn\'t matter; equal opportunity everywhere',
    mediumScoreDescription: 'Some advantage in cities; possible from Tier-2',
    highScoreDescription: 'Must be in major city; Tier-2/3 significant disadvantage',
    isPositive: false, // Lower is better (more accessible)
    isRiskFactor: true,
    defaultWeight: 0.8,
  },

  [IndiaCareerDimension.ENGLISH_DEPENDENCY]: {
    dimension: IndiaCareerDimension.ENGLISH_DEPENDENCY as unknown as CareerDimension,
    label: 'English Dependency',
    description:
      'How important is English proficiency for success? High scores indicate careers ' +
      'where English is essential for advancement.',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Regional language sufficient; English not required',
    mediumScoreDescription: 'Basic English helpful for some opportunities',
    highScoreDescription: 'Fluent English essential for success',
    isPositive: false, // Lower is better (more accessible)
    isRiskFactor: true,
    defaultWeight: 0.85,
  },

  [IndiaCareerDimension.MIGRATION_REQUIREMENT]: {
    dimension: IndiaCareerDimension.MIGRATION_REQUIREMENT as unknown as CareerDimension,
    label: 'Migration Requirement',
    description:
      'Must you move to a specific location to succeed? High scores indicate careers ' +
      'tied to specific cities or regions (e.g., Bollywood → Mumbai).',
    category: DimensionCategory.RISKS,
    lowScoreDescription: 'Can succeed from anywhere in India',
    mediumScoreDescription: 'Better in certain cities; possible elsewhere',
    highScoreDescription: 'Must migrate to specific location; no remote option',
    isPositive: false, // Lower is better (more accessible)
    isRiskFactor: true,
    defaultWeight: 0.8,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get metadata for a dimension.
 */
export function getDimensionMetadata(dimension: CareerDimension): DimensionMetadata {
  return DimensionRegistry[dimension];
}

/**
 * Get all dimensions in a category.
 */
export function getDimensionsByCategory(category: DimensionCategory): CareerDimension[] {
  return ALL_CAREER_DIMENSIONS.filter(
    (d) => DimensionRegistry[d].category === category
  );
}

/**
 * Convert a CareerScore (0.0-1.0) to DimensionScore (0-10).
 */
export function toDimensionScore(score: CareerScore): DimensionScore {
  return Math.round(score * 10);
}

/**
 * Convert a DimensionScore (0-10) to CareerScore (0.0-1.0).
 */
export function toCareerScore(score: DimensionScore): CareerScore {
  return score / 10;
}

/**
 * Validate a dimension score is within valid range.
 */
export function isValidDimensionScore(score: number): score is DimensionScore {
  return (
    typeof score === 'number' &&
    score >= DIMENSION_SCORE_MIN &&
    score <= DIMENSION_SCORE_MAX
  );
}

/**
 * Get a human-readable label for a dimension score.
 */
export function getDimensionScoreLabel(
  dimension: CareerDimension,
  score: DimensionScore
): string {
  const metadata = DimensionRegistry[dimension];

  if (score <= 2) return metadata.lowScoreDescription;
  if (score <= 6) return metadata.mediumScoreDescription;
  return metadata.highScoreDescription;
}

/**
 * Extract dimension value from a Career object.
 */
export function getCareerDimensionValue(
  career: Career,
  dimension: CareerDimension
): CareerScore {
  switch (dimension) {
    // Psychology
    case CareerDimension.ANALYTICAL_THINKING:
      return career.psychologicalProfile.analyticalThinking;
    case CareerDimension.CREATIVITY:
      return career.psychologicalProfile.creativity;
    case CareerDimension.SOCIAL_ORIENTATION:
      return career.psychologicalProfile.socialOrientation;
    case CareerDimension.LEADERSHIP:
      return career.psychologicalProfile.leadership;
    case CareerDimension.DETAIL_ORIENTATION:
      return career.psychologicalProfile.detailOrientation;
    case CareerDimension.CURIOSITY:
      return career.psychologicalProfile.curiosity;
    case CareerDimension.COMPETITIVENESS:
      return career.psychologicalProfile.competitiveness;
    case CareerDimension.RISK_TOLERANCE:
      return career.psychologicalProfile.riskTolerance;

    // Work Style
    case CareerDimension.REMOTE_WORK:
      return career.workStyle.remoteWork;
    case CareerDimension.OFFICE_WORK:
      return career.workStyle.officeWork;
    case CareerDimension.FIELD_WORK:
      return career.workStyle.fieldWork;
    case CareerDimension.TRAVEL_REQUIREMENT:
      return career.workStyle.travelRequirement;
    case CareerDimension.TEAM_ORIENTATION:
      return career.workStyle.teamOrientation;
    case CareerDimension.SOLO_ORIENTATION:
      return career.workStyle.soloOrientation;
    case CareerDimension.STRUCTURED_ENVIRONMENT:
      return career.workStyle.structuredEnvironment;
    case CareerDimension.UNSTRUCTURED_ENVIRONMENT:
      return career.workStyle.unstructuredEnvironment;

    // Rewards
    case CareerDimension.INCOME_POTENTIAL:
      return career.rewardProfile.incomePotential;
    case CareerDimension.STATUS_POTENTIAL:
      return career.rewardProfile.statusPotential;
    case CareerDimension.IMPACT_POTENTIAL:
      return career.rewardProfile.impactPotential;
    case CareerDimension.FREEDOM_POTENTIAL:
      return career.rewardProfile.freedomPotential;
    case CareerDimension.STABILITY_POTENTIAL:
      return career.rewardProfile.stabilityPotential;

    // Risks
    case CareerDimension.BURNOUT_RISK:
      return career.riskProfile.burnoutRisk;
    case CareerDimension.AUTOMATION_RISK:
      return career.riskProfile.automationRisk;
    case CareerDimension.COMPETITION_LEVEL:
      return career.riskProfile.competitionLevel;
    case CareerDimension.INCOME_VOLATILITY:
      return career.riskProfile.incomeVolatility;

    // Optionality
    case CareerDimension.CAREER_FLEXIBILITY:
      return career.optionality.careerFlexibility;
    case CareerDimension.TRANSFERABLE_SKILLS:
      return career.optionality.transferableSkills;
    case CareerDimension.ENTREPRENEURSHIP_POTENTIAL:
      return career.optionality.entrepreneurshipPotential;

    default:
      throw new Error(`Unknown dimension: ${dimension}`);
  }
}

/**
 * Extract all dimension values from a Career as a map.
 */
export function getAllCareerDimensionValues(
  career: Career
): Record<CareerDimension, CareerScore> {
  return ALL_CAREER_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = getCareerDimensionValue(career, dimension);
    return acc;
  }, {} as Record<CareerDimension, CareerScore>);
}

/**
 * Compare two careers on a specific dimension.
 */
export function compareCareersOnDimension(
  careerA: Career,
  careerB: Career,
  dimension: CareerDimension
): number {
  const valueA = getCareerDimensionValue(careerA, dimension);
  const valueB = getCareerDimensionValue(careerB, dimension);
  return valueA - valueB;
}

/**
 * Find dimensions where two careers differ significantly.
 */
export function findCareerDimensionDifferences(
  careerA: Career,
  careerB: Career,
  threshold: number = 0.2
): Array<{ dimension: CareerDimension; careerA: CareerScore; careerB: CareerScore; difference: number }> {
  return ALL_CAREER_DIMENSIONS
    .map((dimension) => {
      const valueA = getCareerDimensionValue(careerA, dimension);
      const valueB = getCareerDimensionValue(careerB, dimension);
      return {
        dimension,
        careerA: valueA,
        careerB: valueB,
        difference: Math.abs(valueA - valueB),
      };
    })
    .filter((diff) => diff.difference >= threshold)
    .sort((a, b) => b.difference - a.difference);
}

/**
 * Calculate dimension match score between a career and student preferences.
 */
export function calculateDimensionMatchScore(
  career: Career,
  preferences: Partial<Record<CareerDimension, DimensionScore>>,
  weights?: Partial<Record<CareerDimension, number>>
): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const dimension of ALL_CAREER_DIMENSIONS) {
    if (preferences[dimension] === undefined) continue;

    const careerValue = getCareerDimensionValue(career, dimension);
    const preferenceValue = toCareerScore(preferences[dimension]!);
    const weight = weights?.[dimension] ?? DimensionRegistry[dimension].defaultWeight;

    // Calculate match (inverse of difference)
    const difference = Math.abs(careerValue - preferenceValue);
    const matchScore = 1 - difference;

    totalScore += matchScore * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

// ============================================================================
// DIMENSION PROFILES
// ============================================================================

/**
 * A complete dimensional profile for comparison purposes.
 */
export interface DimensionProfile {
  [CareerDimension.ANALYTICAL_THINKING]: DimensionScore;
  [CareerDimension.CREATIVITY]: DimensionScore;
  [CareerDimension.SOCIAL_ORIENTATION]: DimensionScore;
  [CareerDimension.LEADERSHIP]: DimensionScore;
  [CareerDimension.DETAIL_ORIENTATION]: DimensionScore;
  [CareerDimension.CURIOSITY]: DimensionScore;
  [CareerDimension.COMPETITIVENESS]: DimensionScore;
  [CareerDimension.RISK_TOLERANCE]: DimensionScore;
  [CareerDimension.REMOTE_WORK]: DimensionScore;
  [CareerDimension.OFFICE_WORK]: DimensionScore;
  [CareerDimension.FIELD_WORK]: DimensionScore;
  [CareerDimension.TRAVEL_REQUIREMENT]: DimensionScore;
  [CareerDimension.TEAM_ORIENTATION]: DimensionScore;
  [CareerDimension.SOLO_ORIENTATION]: DimensionScore;
  [CareerDimension.STRUCTURED_ENVIRONMENT]: DimensionScore;
  [CareerDimension.UNSTRUCTURED_ENVIRONMENT]: DimensionScore;
  [CareerDimension.INCOME_POTENTIAL]: DimensionScore;
  [CareerDimension.STATUS_POTENTIAL]: DimensionScore;
  [CareerDimension.IMPACT_POTENTIAL]: DimensionScore;
  [CareerDimension.FREEDOM_POTENTIAL]: DimensionScore;
  [CareerDimension.STABILITY_POTENTIAL]: DimensionScore;
  [CareerDimension.BURNOUT_RISK]: DimensionScore;
  [CareerDimension.AUTOMATION_RISK]: DimensionScore;
  [CareerDimension.COMPETITION_LEVEL]: DimensionScore;
  [CareerDimension.INCOME_VOLATILITY]: DimensionScore;
  [CareerDimension.CAREER_FLEXIBILITY]: DimensionScore;
  [CareerDimension.TRANSFERABLE_SKILLS]: DimensionScore;
  [CareerDimension.ENTREPRENEURSHIP_POTENTIAL]: DimensionScore;
}

/**
 * Create a neutral dimension profile (all 5s).
 */
export function createNeutralDimensionProfile(): DimensionProfile {
  return ALL_CAREER_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = 5;
    return acc;
  }, {} as DimensionProfile);
}
