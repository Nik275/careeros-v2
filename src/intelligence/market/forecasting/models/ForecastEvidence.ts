/**
 * CareerOS Market Intelligence - Forecast Evidence Model
 *
 * Represents evidence used to generate forecasts.
 *
 * Purpose:
 * - Maintain audit trail of forecast inputs
 * - Enable forecast explanation and validation
 * - Support forecast confidence calculation
 */

/**
 * Evidence type.
 */
export type EvidenceType =
  | 'historical_data'
  | 'market_signal'
  | 'trend_observation'
  | 'industry_report'
  | 'economic_indicator'
  | 'policy_change'
  | 'technology_shift'
  | 'demographic_data';

/**
 * Evidence quality.
 */
export type EvidenceQuality = 'high' | 'medium' | 'low' | 'uncertain';

/**
 * Forecast evidence.
 */
export interface ForecastEvidence {
  /** Evidence identifier */
  id: string;

  /** Evidence type */
  type: EvidenceType;

  /** Evidence source */
  source: string;

  /** Evidence quality */
  quality: EvidenceQuality;

  /** Description of evidence */
  description: string;

  /** Numerical value if applicable */
  value?: number;

  /** Value range if uncertain */
  valueRange?: { min: number; max: number };

  /** Evidence timestamp */
  timestamp: Date;

  /** Geographic scope */
  geographicScope?: string;

  /** Industry relevance */
  industryRelevance?: string[];

  /** Related entities */
  relatedEntities: string[];

  /** Impact direction */
  impact: 'positive' | 'negative' | 'neutral';

  /** Impact strength (0-100) */
  impactStrength: number;

  /** Time horizon relevance */
  horizonRelevance: {
    '1_year': number;
    '3_year': number;
    '5_year': number;
    '10_year': number;
  };

  /** Validation status */
  validationStatus: 'unverified' | 'verified' | 'disputed';

  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * Create forecast evidence.
 */
export function createForecastEvidence(
  params: Omit<ForecastEvidence, 'id'>
): ForecastEvidence {
  return {
    id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...params,
  };
}

/**
 * Evidence collection for a forecast.
 */
export interface EvidenceCollection {
  /** All evidence */
  evidence: ForecastEvidence[];

  /** Evidence by type */
  byType: Record<EvidenceType, ForecastEvidence[]>;

  /** Evidence by quality */
  byQuality: Record<EvidenceQuality, ForecastEvidence[]>;

  /** Evidence by horizon */
  byHorizon: {
    '1_year': ForecastEvidence[];
    '3_year': ForecastEvidence[];
    '5_year': ForecastEvidence[];
    '10_year': ForecastEvidence[];
  };

  /** Summary statistics */
  summary: {
    totalCount: number;
    highQualityCount: number;
    averageImpactStrength: number;
    dateRange: { earliest: Date; latest: Date };
  };
}

/**
 * Build evidence collection.
 */
export function buildEvidenceCollection(evidence: ForecastEvidence[]): EvidenceCollection {
  const byType: Record<EvidenceType, ForecastEvidence[]> = {
    historical_data: [],
    market_signal: [],
    trend_observation: [],
    industry_report: [],
    economic_indicator: [],
    policy_change: [],
    technology_shift: [],
    demographic_data: [],
  };

  const byQuality: Record<EvidenceQuality, ForecastEvidence[]> = {
    high: [],
    medium: [],
    low: [],
    uncertain: [],
  };

  const byHorizon = {
    '1_year': [] as ForecastEvidence[],
    '3_year': [] as ForecastEvidence[],
    '5_year': [] as ForecastEvidence[],
    '10_year': [] as ForecastEvidence[],
  };

  for (const e of evidence) {
    byType[e.type].push(e);
    byQuality[e.quality].push(e);

    // Add to horizons where relevance is significant
    if (e.horizonRelevance['1_year'] > 50) byHorizon['1_year'].push(e);
    if (e.horizonRelevance['3_year'] > 50) byHorizon['3_year'].push(e);
    if (e.horizonRelevance['5_year'] > 50) byHorizon['5_year'].push(e);
    if (e.horizonRelevance['10_year'] > 50) byHorizon['10_year'].push(e);
  }

  const timestamps = evidence.map((e) => e.timestamp.getTime());

  const highQualityCount = evidence.filter((e) => e.quality === 'high').length;
  const avgImpact =
    evidence.length > 0
      ? evidence.reduce((sum, e) => sum + e.impactStrength, 0) / evidence.length
      : 0;

  return {
    evidence,
    byType,
    byQuality,
    byHorizon,
    summary: {
      totalCount: evidence.length,
      highQualityCount,
      averageImpactStrength: Math.round(avgImpact),
      dateRange: {
        earliest: new Date(Math.min(...timestamps)),
        latest: new Date(Math.max(...timestamps)),
      },
    },
  };
}

/**
 * Score evidence quality.
 */
export function scoreEvidenceQuality(evidence: ForecastEvidence[]): number {
  if (evidence.length === 0) return 0;

  const weights = {
    high: 1.0,
    medium: 0.7,
    low: 0.4,
    uncertain: 0.2,
  };

  const totalWeight = evidence.reduce((sum, e) => sum + weights[e.quality], 0);
  return Math.round((totalWeight / evidence.length) * 100);
}

/**
 * Filter evidence by criteria.
 */
export function filterEvidence(
  evidence: ForecastEvidence[],
  criteria: {
    types?: EvidenceType[];
    minQuality?: EvidenceQuality;
    horizon?: '1_year' | '3_year' | '5_year' | '10_year';
    minImpact?: number;
    startDate?: Date;
    endDate?: Date;
  }
): ForecastEvidence[] {
  const qualityOrder: EvidenceQuality[] = ['uncertain', 'low', 'medium', 'high'];

  return evidence.filter((e) => {
    if (criteria.types && !criteria.types.includes(e.type)) return false;

    if (criteria.minQuality) {
      const minIndex = qualityOrder.indexOf(criteria.minQuality);
      const eIndex = qualityOrder.indexOf(e.quality);
      if (eIndex < minIndex) return false;
    }

    if (criteria.horizon && e.horizonRelevance[criteria.horizon] < 50) return false;

    if (criteria.minImpact && e.impactStrength < criteria.minImpact) return false;

    if (criteria.startDate && e.timestamp < criteria.startDate) return false;

    if (criteria.endDate && e.timestamp > criteria.endDate) return false;

    return true;
  });
}

/**
 * Merge evidence collections.
 */
export function mergeEvidence(
  collections: ForecastEvidence[][]
): ForecastEvidence[] {
  const seen = new Set<string>();
  const merged: ForecastEvidence[] = [];

  for (const collection of collections) {
    for (const evidence of collection) {
      if (!seen.has(evidence.id)) {
        seen.add(evidence.id);
        merged.push(evidence);
      }
    }
  }

  return merged;
}

/**
 * Generate evidence summary.
 */
export function generateEvidenceSummary(collection: EvidenceCollection): string[] {
  const summary: string[] = [];

  summary.push(`Total evidence: ${collection.summary.totalCount} items`);
  summary.push(`High quality: ${collection.summary.highQualityCount} items`);
  summary.push(`Average impact: ${collection.summary.averageImpactStrength}/100`);

  // Type breakdown
  const typeBreakdown = Object.entries(collection.byType)
    .filter(([, items]) => items.length > 0)
    .map(([type, items]) => `${type.replace('_', ' ')}: ${items.length}`);

  summary.push(`Evidence types: ${typeBreakdown.join(', ')}`);

  return summary;
}
