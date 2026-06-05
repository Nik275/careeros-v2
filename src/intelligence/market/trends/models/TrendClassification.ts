/**
 * CareerOS Market Intelligence - Trend Classification Model
 *
 * Classification system for market trends.
 */

/**
 * Trend classification categories.
 */
export enum TrendClassification {
  /** Very rapid growth (>30% change) */
  RAPID_GROWTH = 'RAPID_GROWTH',

  /** Steady growth (10-30% change) */
  GROWTH = 'GROWTH',

  /** Minimal change (-10% to +10%) */
  STABLE = 'STABLE',

  /** Declining (-30% to -10%) */
  DECLINING = 'DECLINING',

  /** Rapid decline (<-30%) */
  RAPID_DECLINE = 'RAPID_DECLINE',

  /** Erratic changes, no clear direction */
  VOLATILE = 'VOLATILE',

  /** New trend, insufficient data */
  EMERGING = 'EMERGING',
}

/**
 * Classification metadata.
 */
export interface ClassificationMetadata {
  /** Classification category */
  classification: TrendClassification;

  /** Human-readable label */
  label: string;

  /** Description */
  description: string;

  /** Typical change range (%) */
  changeRange: { min: number; max: number };

  /** Visual indicator */
  indicator: '↑↑' | '↑' | '→' | '↓' | '↓↓' | '↔' | '?';

  /** Color coding */
  color: 'green' | 'lightgreen' | 'yellow' | 'orange' | 'red' | 'purple' | 'gray';
}

/**
 * Classification definitions.
 */
export const CLASSIFICATION_METADATA: Record<TrendClassification, ClassificationMetadata> = {
  [TrendClassification.RAPID_GROWTH]: {
    classification: TrendClassification.RAPID_GROWTH,
    label: 'Rapid Growth',
    description: 'Very strong upward trend with significant acceleration',
    changeRange: { min: 30, max: Infinity },
    indicator: '↑↑',
    color: 'green',
  },

  [TrendClassification.GROWTH]: {
    classification: TrendClassification.GROWTH,
    label: 'Growth',
    description: 'Steady upward trend with consistent improvement',
    changeRange: { min: 10, max: 30 },
    indicator: '↑',
    color: 'lightgreen',
  },

  [TrendClassification.STABLE]: {
    classification: TrendClassification.STABLE,
    label: 'Stable',
    description: 'Minimal change, maintaining current levels',
    changeRange: { min: -10, max: 10 },
    indicator: '→',
    color: 'yellow',
  },

  [TrendClassification.DECLINING]: {
    classification: TrendClassification.DECLINING,
    label: 'Declining',
    description: 'Steady downward trend with consistent decrease',
    changeRange: { min: -30, max: -10 },
    indicator: '↓',
    color: 'orange',
  },

  [TrendClassification.RAPID_DECLINE]: {
    classification: TrendClassification.RAPID_DECLINE,
    label: 'Rapid Decline',
    description: 'Very strong downward trend with significant deceleration',
    changeRange: { min: -Infinity, max: -30 },
    indicator: '↓↓',
    color: 'red',
  },

  [TrendClassification.VOLATILE]: {
    classification: TrendClassification.VOLATILE,
    label: 'Volatile',
    description: 'Erratic changes with no clear direction',
    changeRange: { min: -Infinity, max: Infinity },
    indicator: '↔',
    color: 'purple',
  },

  [TrendClassification.EMERGING]: {
    classification: TrendClassification.EMERGING,
    label: 'Emerging',
    description: 'New trend with insufficient historical data',
    changeRange: { min: 0, max: 0 },
    indicator: '?',
    color: 'gray',
  },
};

/**
 * Classify a percentage change.
 */
export function classifyChange(percentageChange: number, volatility: number = 0): TrendClassification {
  // High volatility takes precedence
  if (volatility > 25) {
    return TrendClassification.VOLATILE;
  }

  if (percentageChange >= 30) {
    return TrendClassification.RAPID_GROWTH;
  }

  if (percentageChange >= 10) {
    return TrendClassification.GROWTH;
  }

  if (percentageChange <= -30) {
    return TrendClassification.RAPID_DECLINE;
  }

  if (percentageChange <= -10) {
    return TrendClassification.DECLINING;
  }

  return TrendClassification.STABLE;
}

/**
 * Get classification metadata.
 */
export function getClassificationMetadata(
  classification: TrendClassification
): ClassificationMetadata {
  return CLASSIFICATION_METADATA[classification];
}

/**
 * Get human-readable classification label.
 */
export function getClassificationLabel(classification: TrendClassification): string {
  return CLASSIFICATION_METADATA[classification].label;
}

/**
 * Determine if classification is positive.
 */
export function isPositiveTrend(classification: TrendClassification): boolean {
  return (
    classification === TrendClassification.RAPID_GROWTH ||
    classification === TrendClassification.GROWTH
  );
}

/**
 * Determine if classification is negative.
 */
export function isNegativeTrend(classification: TrendClassification): boolean {
  return (
    classification === TrendClassification.RAPID_DECLINE ||
    classification === TrendClassification.DECLINING
  );
}

/**
 * Determine if classification is concerning.
 */
export function isConcerningTrend(classification: TrendClassification): boolean {
  return (
    classification === TrendClassification.RAPID_DECLINE ||
    classification === TrendClassification.DECLINING ||
    classification === TrendClassification.VOLATILE
  );
}

/**
 * Compare two classifications.
 */
export function compareClassifications(
  a: TrendClassification,
  b: TrendClassification
): 'better' | 'worse' | 'similar' {
  const order = [
    TrendClassification.RAPID_GROWTH,
    TrendClassification.GROWTH,
    TrendClassification.EMERGING,
    TrendClassification.STABLE,
    TrendClassification.VOLATILE,
    TrendClassification.DECLINING,
    TrendClassification.RAPID_DECLINE,
  ];

  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);

  if (indexA < indexB) return 'better';
  if (indexA > indexB) return 'worse';
  return 'similar';
}
