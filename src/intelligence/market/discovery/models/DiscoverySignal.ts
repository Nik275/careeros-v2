/**
 * CareerOS Market Intelligence - Discovery Signal Model
 *
 * Raw signals indicating potential discoveries in the labor market.
 *
 * Questions:
 * - What new patterns are emerging?
 * - What evidence supports this discovery?
 * - How strong is the signal?
 */

/**
 * Types of discovery signals.
 */
export type DiscoverySignalType =
  | 'new_job_title'        // New job titles appearing
  | 'skill_growth'         // Rapid skill adoption
  | 'industry_growth'      // Emerging sector growth
  | 'funding_activity'     // Investment/funding signals
  | 'government_policy'    // Policy changes
  | 'education_adoption'   // New courses/certifications
  | 'technology_shift'     // Tech enabling new roles
  | 'market_convergence'   // Cross-industry blending
  | 'automation_trigger'   // Automation creating new roles
  | 'regulatory_change';   // Compliance-driven roles

/**
 * Source quality tiers.
 */
export type SourceQuality = 'high' | 'medium' | 'low' | 'unverified';

/**
 * Signal confidence levels.
 */
export type SignalConfidence = 'strong' | 'moderate' | 'weak' | 'uncertain';

/**
 * A discovery signal from the market.
 */
export interface DiscoverySignal {
  /** Unique identifier */
  id: string;

  /** Signal source */
  source: string;

  /** Source quality tier */
  sourceQuality: SourceQuality;

  /** Type of signal */
  signalType: DiscoverySignalType;

  /** Signal strength (0-100) */
  strength: number;

  /** Confidence in signal (0-100) */
  confidence: number;

  /** What was discovered */
  targetEntity: {
    type: 'career' | 'skill' | 'industry';
    name: string;
    identifier?: string;
  };

  /** Contextual details */
  context: {
    description: string;
    relatedEntities: string[];
    geographicScope?: string;
    industryScope?: string[];
  };

  /** When signal was detected */
  timestamp: Date;

  /** Supporting evidence */
  evidence: Array<{
    type: string;
    value: string;
    url?: string;
  }>;

  /** Related signals */
  relatedSignals: string[];
}

/**
 * Configuration for signal processing.
 */
export interface SignalProcessingConfig {
  /** Minimum strength threshold */
  minStrength: number;

  /** Minimum confidence threshold */
  minConfidence: number;

  /** Required source quality */
  minSourceQuality: SourceQuality;

  /** Signal recency (days) */
  maxAgeDays: number;

  /** Weight by source quality */
  sourceWeights: Record<SourceQuality, number>;
}

/**
 * Default signal processing configuration.
 */
export const DEFAULT_SIGNAL_CONFIG: SignalProcessingConfig = {
  minStrength: 40,
  minConfidence: 50,
  minSourceQuality: 'medium',
  maxAgeDays: 90,
  sourceWeights: {
    high: 1.0,
    medium: 0.7,
    low: 0.4,
    unverified: 0.1,
  },
};

/**
 * Create a discovery signal.
 */
export function createDiscoverySignal(
  params: Omit<DiscoverySignal, 'id' | 'timestamp'> & { id?: string }
): DiscoverySignal {
  return {
    id: params.id ?? `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...params,
  };
}

/**
 * Validate a discovery signal.
 */
export function validateSignal(signal: DiscoverySignal): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!signal.source || signal.source.length < 2) {
    errors.push('Source must be at least 2 characters');
  }

  if (signal.strength < 0 || signal.strength > 100) {
    errors.push('Strength must be 0-100');
  }

  if (signal.confidence < 0 || signal.confidence > 100) {
    errors.push('Confidence must be 0-100');
  }

  if (!signal.targetEntity?.name || signal.targetEntity.name.length < 2) {
    errors.push('Target entity name required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate weighted signal strength.
 */
export function calculateWeightedStrength(
  signal: DiscoverySignal,
  config: SignalProcessingConfig = DEFAULT_SIGNAL_CONFIG
): number {
  const sourceWeight = config.sourceWeights[signal.sourceQuality] ?? 0.5;
  const weightedStrength = signal.strength * sourceWeight;
  const weightedConfidence = signal.confidence * sourceWeight;

  return Math.round((weightedStrength + weightedConfidence) / 2);
}

/**
 * Group signals by target entity.
 */
export function groupSignalsByEntity(
  signals: DiscoverySignal[]
): Map<string, DiscoverySignal[]> {
  const grouped = new Map<string, DiscoverySignal[]>();

  for (const signal of signals) {
    const key = `${signal.targetEntity.type}:${signal.targetEntity.name}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)!.push(signal);
  }

  return grouped;
}

/**
 * Filter signals by criteria.
 */
export function filterSignals(
  signals: DiscoverySignal[],
  criteria: {
    types?: DiscoverySignalType[];
    minStrength?: number;
    minConfidence?: number;
    sources?: string[];
    maxAgeDays?: number;
  }
): DiscoverySignal[] {
  const now = Date.now();

  return signals.filter((signal) => {
    if (criteria.types && !criteria.types.includes(signal.signalType)) {
      return false;
    }

    if (criteria.minStrength !== undefined && signal.strength < criteria.minStrength) {
      return false;
    }

    if (criteria.minConfidence !== undefined && signal.confidence < criteria.minConfidence) {
      return false;
    }

    if (criteria.sources && !criteria.sources.includes(signal.source)) {
      return false;
    }

    if (criteria.maxAgeDays !== undefined) {
      const ageMs = now - signal.timestamp.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays > criteria.maxAgeDays) {
        return false;
      }
    }

    return true;
  });
}
