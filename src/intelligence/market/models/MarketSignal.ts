/**
 * CareerOS Market Intelligence - Market Signal Model
 *
 * Represents raw market evidence before intelligence processing.
 * This is the foundational data structure for all market intelligence.
 */

/**
 * Unique identifier for market signals.
 */
export type MarketSignalId = string;

/**
 * Types of market signals that can be captured.
 */
export type MarketSignalType =
  | 'job_postings'
  | 'salary_growth'
  | 'skill_growth'
  | 'hiring_rate'
  | 'layoffs'
  | 'automation_risk'
  | 'government_push'
  | 'startup_activity'
  | 'investment_flow';

/**
 * Source types for market signals.
 */
export type MarketSignalSource =
  | 'ncs_india'
  | 'nsdc'
  | 'nasscom'
  | 'naukri'
  | 'foundit'
  | 'linkedin'
  | 'indeed'
  | 'wef'
  | 'ilo'
  | 'government_report'
  | 'industry_association'
  | 'news_media'
  | 'company_announcement'
  | 'research_report';

/**
 * Direction of normalized market impact.
 */
export type MarketSignalDirection = 'positive' | 'negative' | 'neutral';

/**
 * Raw market signal captured from external sources.
 * 
 * This is the raw input to the market intelligence system.
 * All signals must be processed and normalized before use.
 */
export interface MarketSignal {
  /** Unique identifier for this signal */
  readonly id: MarketSignalId;

  /** Career this signal relates to */
  readonly careerId: string;

  /** Human-readable career title if supplied by a provider */
  readonly careerTitle?: string;

  /** Provider-specific career identifier if different from careerId */
  readonly careerIdentifier?: string;

  /** Source of the signal */
  readonly source: MarketSignalSource;

  /** Type of market signal */
  readonly signalType: MarketSignalType;

  /** Signal strength (-100 to +100, negative = negative signal) */
  readonly strength: number;

  /** Confidence in this signal (0-100) */
  readonly confidence: number;

  /** When the signal was captured */
  readonly timestamp: Date;

  /** Raw data payload (source-specific) */
  readonly rawData: Record<string, unknown>;

  /** Signal unit if supplied by a provider */
  readonly unit?: string;

  /** Flattened geography if supplied by a provider */
  readonly geography?: string;

  /** Processing metadata */
  readonly metadata: {
    /** Source reliability score (0-100) */
    sourceReliability: number;

    /** Geographic scope */
    geography: 'india' | 'state' | 'city' | 'global';

    /** Industry sector */
    sector?: string;

    /** Time period the signal covers */
    timePeriod: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * Processing metadata attached to a market signal.
 */
export type MarketSignalMetadata = MarketSignal['metadata'];

/**
 * Validated and normalized market signal.
 * 
 * Output from MarketSignalEngine after processing.
 */
export interface NormalizedMarketSignal extends MarketSignal {
  /** Normalized strength (0-100, always positive) */
  readonly normalizedStrength: number;

  /** Provider/source career identifier used by profile scoring */
  readonly careerIdentifier: string;

  /** Signal unit used by profile scoring */
  readonly unit: string;

  /** Flattened geography used by profile scoring */
  readonly geography: string;

  /** Direction of signal (positive/negative impact) */
  readonly direction: MarketSignalDirection;

  /** Weight based on source reliability and confidence */
  readonly weight: number;

  /** Processing timestamp */
  readonly processedAt: Date;

  /** Validation status */
  readonly validation: {
    isValid: boolean;
    issues: string[];
  };
}

/**
 * Aggregate signal combining multiple raw signals.
 */
export interface AggregateMarketSignal {
  /** Career identifier */
  readonly careerId: string;

  /** Signal type */
  readonly signalType: MarketSignalType;

  /** Aggregated strength (0-100) */
  readonly aggregatedStrength: number;

  /** Confidence in aggregation (0-100) */
  readonly confidence: number;

  /** Number of signals aggregated */
  readonly signalCount: number;

  /** Contributing sources */
  readonly sources: MarketSignalSource[];

  /** Time range of aggregated signals */
  readonly timeRange: {
    start: Date;
    end: Date;
  };

  /** Last updated */
  readonly lastUpdated: Date;
}

/**
 * Factory function to create a market signal.
 */
export function createMarketSignal(
  careerId: string,
  source: MarketSignalSource,
  signalType: MarketSignalType,
  strength: number,
  confidence: number,
  rawData: Record<string, unknown>,
  metadata: MarketSignal['metadata']
): MarketSignal {
  return {
    id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    careerId,
    source,
    signalType,
    strength: Math.max(-100, Math.min(100, strength)),
    confidence: Math.max(0, Math.min(100, confidence)),
    timestamp: new Date(),
    rawData,
    metadata,
  };
}

/**
 * Validate a market signal.
 */
export function validateMarketSignal(signal: MarketSignal): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!signal.careerId || signal.careerId.trim() === '') {
    issues.push('Career ID is required');
  }

  if (signal.strength < -100 || signal.strength > 100) {
    issues.push('Strength must be between -100 and 100');
  }

  if (signal.confidence < 0 || signal.confidence > 100) {
    issues.push('Confidence must be between 0 and 100');
  }

  if (!signal.metadata?.timePeriod?.start || !signal.metadata?.timePeriod?.end) {
    issues.push('Time period is required in metadata');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
