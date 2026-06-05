/**
 * CareerOS Career Evidence System
 *
 * Traceability and explainability for every career attribute.
 * Every score is backed by evidence with source, confidence, and methodology.
 */

import type { CareerId, CareerSlug } from '../career-ontology';

// ============================================================================
// CORE IDENTIFIER TYPES
// ============================================================================

/** Unique evidence identifier */
export type EvidenceId = string & { __brand: 'EvidenceId' };

/** Evidence collection identifier */
export type EvidenceCollectionId = string & { __brand: 'EvidenceCollectionId' };

// ============================================================================
// ENUM TYPES
// ============================================================================

/** Type of evidence source */
export type EvidenceSourceType =
  | 'government-data'
  | 'salary-survey'
  | 'industry-report'
  | 'academic-research'
  | 'expert-interview'
  | 'practitioner-survey'
  | 'job-posting-analysis'
  | 'market-research'
  | 'historical-data'
  | 'machine-learning-model'
  | 'expert-opinion'
  | 'user-generated'
  | 'third-party-api'
  | 'internal-research'
  | 'other';

// BANNED: ConfidenceLevel enum removed - use Confidence type from @/intelligence/confidence

/** Methodology used to derive evidence */
export type MethodologyType =
  | 'statistical-analysis'
  | 'survey'
  | 'interview'
  | 'regression-model'
  | 'machine-learning'
  | 'expert-judgment'
  | 'literature-review'
  | 'data-mining'
  | 'benchmarking'
  | 'aggregation'
  | 'estimation'
  | 'other';

/** Data quality assessment */
export type DataQuality = 'poor' | 'fair' | 'good' | 'excellent' | 'authoritative';

// ============================================================================
// EVIDENCE COMPONENTS
// ============================================================================

/**
 * Source of evidence
 */
export interface EvidenceSource {
  /** Type of source */
  type: EvidenceSourceType;

  /** Specific source name (e.g., "BLS Occupational Outlook Handbook") */
  name: string;

  /** Source URL or identifier */
  reference?: string;

  /** Publisher or organization */
  publisher?: string;

  /** Publication or collection date */
  date?: string;

  /** Geographic scope */
  geography?: 'global' | 'india' | 'us' | 'europe' | 'asia' | 'regional' | 'local';

  /** Sample size if applicable */
  sampleSize?: number;
}

/**
 * Confidence assessment for evidence
 */
export interface EvidenceConfidence {
  /** Numerical confidence score (0-1) */
  score: number;

  /** Constitutional confidence (0.0-1.0) - use Confidence Authority for evaluation */
  level: number; // Confidence value, not enum

  /** Factors affecting confidence */
  factors?: string[];
}

/**
 * Methodology used to derive evidence
 */
export interface EvidenceMethodology {
  /** Type of methodology */
  type: MethodologyType;

  /** Detailed description */
  description: string;

  /** Limitations of the methodology */
  limitations?: string[];

  /** Assumptions made */
  assumptions?: string[];
}

/**
 * Metadata for evidence tracking
 */
export interface EvidenceMetadata {
  /** When this evidence was created */
  createdAt: number;

  /** Last update timestamp */
  lastUpdated: number;

  /** Schema version */
  schemaVersion: string;

  /** Whether evidence has been verified */
  isVerified: boolean;

  /** Verification date */
  verifiedAt?: number;

  /** Data quality assessment */
  dataQuality: DataQuality;
}

/**
 * Attribution and authorship
 */
export interface EvidenceAttribution {
  /** Primary author or researcher */
  author?: string;

  /** Contributing researchers */
  contributors?: string[];

  /** Reviewer who verified */
  reviewer?: string;

  /** Organization responsible */
  organization?: string;
}

// ============================================================================
// CORE EVIDENCE TYPES
// ============================================================================

/**
 * Single piece of evidence for a career attribute
 */
export interface CareerEvidence {
  /** Unique identifier */
  id: EvidenceId;

  /** Career this evidence applies to */
  careerId: CareerId;

  /** Attribute path (e.g., "psychology.analyticalThinking") */
  attributePath: string;

  /** Value this evidence supports */
  value: number | string | boolean;

  /** Evidence source */
  source: EvidenceSource;

  /** Confidence assessment */
  confidence: EvidenceConfidence;

  /** Methodology used */
  methodology: EvidenceMethodology;

  /** Free-form notes */
  notes?: string;

  /** Metadata */
  metadata: EvidenceMetadata;

  /** Attribution */
  attribution?: EvidenceAttribution;
}

/**
 * Collection of evidence for a single attribute
 */
export interface EvidenceCollection {
  /** Unique identifier */
  id: EvidenceCollectionId;

  /** Career this collection applies to */
  careerId: CareerId;

  /** Attribute path */
  attributePath: string;

  /** Current consolidated value */
  consolidatedValue: number | string | boolean;

  /** How the consolidation was calculated */
  consolidationMethod: 'average' | 'weighted-average' | 'median' | 'mode' | 'expert-judgment' | 'most-recent';

  /** Individual evidence items */
  evidenceItems: CareerEvidence[];

  /** Aggregate confidence across all evidence */
  aggregateConfidence: EvidenceConfidence;

  /** Conflicts between evidence items */
  conflicts?: {
    between: EvidenceId[];
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];

  /** Last time collection was updated */
  lastUpdated: number;
}

// ============================================================================
// CAREER ATTRIBUTE EVIDENCE MAPPINGS
// ============================================================================

/**
 * Evidence for psychology profile attributes
 */
export interface PsychologyEvidence {
  analyticalThinking?: EvidenceCollection;
  creativity?: EvidenceCollection;
  socialOrientation?: EvidenceCollection;
  leadership?: EvidenceCollection;
  detailOrientation?: EvidenceCollection;
  curiosity?: EvidenceCollection;
  competitiveness?: EvidenceCollection;
  riskTolerance?: EvidenceCollection;
}

/**
 * Evidence for work style attributes
 */
export interface WorkStyleEvidence {
  remoteWork?: EvidenceCollection;
  officeWork?: EvidenceCollection;
  fieldWork?: EvidenceCollection;
  travelRequirement?: EvidenceCollection;
  teamOrientation?: EvidenceCollection;
  soloOrientation?: EvidenceCollection;
  structuredEnvironment?: EvidenceCollection;
  unstructuredEnvironment?: EvidenceCollection;
}

/**
 * Evidence for reward profile attributes
 */
export interface RewardEvidence {
  incomePotential?: EvidenceCollection;
  statusPotential?: EvidenceCollection;
  impactPotential?: EvidenceCollection;
  freedomPotential?: EvidenceCollection;
  stabilityPotential?: EvidenceCollection;
}

/**
 * Evidence for risk profile attributes
 */
export interface RiskEvidence {
  burnoutRisk?: EvidenceCollection;
  automationRisk?: EvidenceCollection;
  competitionLevel?: EvidenceCollection;
  incomeVolatility?: EvidenceCollection;
}

/**
 * Evidence for optionality attributes
 */
export interface OptionalityEvidence {
  careerFlexibility?: EvidenceCollection;
  transferableSkills?: EvidenceCollection;
  entrepreneurshipPotential?: EvidenceCollection;
}

/**
 * Evidence for education attributes
 */
export interface EducationEvidence {
  minimumEducation?: EvidenceCollection;
  typicalDegrees?: EvidenceCollection;
  certifications?: EvidenceCollection;
  examRequirements?: EvidenceCollection;
  yearsOfStudy?: EvidenceCollection;
  educationCostRange?: EvidenceCollection;
}

/**
 * Evidence for India reality attributes
 */
export interface IndiaRealityEvidence {
  coachingDependency?: EvidenceCollection;
  englishDependency?: EvidenceCollection;
  urbanAdvantage?: EvidenceCollection;
  migrationRequirement?: EvidenceCollection;
  reservationSensitivity?: EvidenceCollection;
  familyAcceptance?: EvidenceCollection;
  socioEconomicBarriers?: EvidenceCollection;
  genderConsiderations?: EvidenceCollection;
}

/**
 * Evidence for future profile attributes
 */
export interface FutureEvidence {
  aiDisruptionRisk?: EvidenceCollection;
  futureDemand?: EvidenceCollection;
  globalMobility?: EvidenceCollection;
  industryGrowth?: EvidenceCollection;
  emergingOpportunities?: EvidenceCollection;
  decliningAspects?: EvidenceCollection;
}

/**
 * Evidence for lifestyle attributes
 */
export interface LifestyleEvidence {
  workLifeBalance?: EvidenceCollection;
  stressLevel?: EvidenceCollection;
  scheduleFlexibility?: EvidenceCollection;
  geographicFreedom?: EvidenceCollection;
}

/**
 * Complete evidence mapping for a career
 */
export interface CompleteCareerEvidence {
  careerId: CareerId;
  careerSlug: CareerSlug;

  psychology: PsychologyEvidence;
  workStyle: WorkStyleEvidence;
  reward: RewardEvidence;
  risk: RiskEvidence;
  optionality: OptionalityEvidence;
  education: EducationEvidence;
  indiaReality: IndiaRealityEvidence;
  future: FutureEvidence;
  lifestyle: LifestyleEvidence;

  /** Overall evidence coverage percentage */
  coverageScore: number;

  /** Overall confidence across all attributes */
  overallConfidence: EvidenceConfidence;

  /** Last comprehensive update */
  lastComprehensiveUpdate: number;
}

// ============================================================================
// OPTIONS & RESULT TYPES
// ============================================================================

/** Options for creating evidence */
export interface EvidenceCreationOptions {
  /** Auto-generate ID */
  autoGenerateId?: boolean;

  /** Set verification status */
  isVerified?: boolean;

  /** Data quality assessment */
  dataQuality?: DataQuality;
}

/** Validation result for evidence */
export interface EvidenceValidationResult {
  isValid: boolean;
  errors: EvidenceValidationError[];
  warnings: EvidenceValidationWarning[];
}

/** Validation error */
export interface EvidenceValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/** Validation warning */
export interface EvidenceValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/** Query for filtering evidence */
export interface EvidenceQuery {
  careerIds?: CareerId[];
  attributePaths?: string[];
  sourceTypes?: EvidenceSourceType[];
  /** Constitutional confidence thresholds (0.0-1.0) */
  confidenceMin?: number;
  confidenceMax?: number;
  dateRange?: { start: number; end: number };
  isVerified?: boolean;
  dataQuality?: DataQuality[];
}

/** Comparison between evidence items */
export interface EvidenceComparison {
  evidenceA: CareerEvidence;
  evidenceB: CareerEvidence;
  valueDifference: number;
  confidenceDifference: number;
  sourceQualityComparison: 'better' | 'worse' | 'equivalent' | 'incomparable';
  dateComparison: 'newer' | 'older' | 'same';
  recommendation: 'prefer-a' | 'prefer-b' | 'use-both' | 'insufficient-data';
}

/** Audit trail for evidence */
export interface EvidenceAudit {
  evidenceId: EvidenceId;
  careerId: CareerId;
  attributePath: string;

  creation: {
    timestamp: number;
    value: unknown;
    source: EvidenceSource;
  };

  updates: {
    timestamp: number;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    reason?: string;
  }[];

  verifications: {
    timestamp: number;
    verifiedBy: string;
    result: 'approved' | 'rejected' | 'flagged';
    notes?: string;
  }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Current schema version */
export const EVIDENCE_SCHEMA_VERSION = '1.0.0';

/** Default confidence for new evidence */
export const DEFAULT_CONFIDENCE: EvidenceConfidence = {
  score: 0.5,
  level: 'moderate',
  factors: ['Default confidence - requires review'],
};

/** Default methodology */
export const DEFAULT_METHODOLOGY: EvidenceMethodology = {
  type: 'expert-judgment',
  description: 'Initial estimate based on domain expertise',
  limitations: ['May be subject to bias', 'Limited empirical validation'],
};

/** Source type quality rankings (higher = better) */
export const SOURCE_QUALITY_RANK: Record<EvidenceSourceType, number> = {
  'government-data': 10,
  'academic-research': 9,
  'salary-survey': 8,
  'industry-report': 7,
  'market-research': 6,
  'practitioner-survey': 6,
  'job-posting-analysis': 5,
  'machine-learning-model': 5,
  'historical-data': 4,
  'expert-interview': 4,
  'expert-opinion': 3,
  'third-party-api': 3,
  'internal-research': 2,
  'user-generated': 1,
  'other': 0,
};

// BANNED: CONFIDENCE_LEVEL_VALUES enum mapping removed
// Use Confidence Authority: confidenceAuthority.evaluate(...)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique evidence ID
 */
export function generateEvidenceId(): EvidenceId {
  return `evidence-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as EvidenceId;
}

/**
 * Generate unique collection ID
 */
export function generateCollectionId(): EvidenceCollectionId {
  return `collection-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as EvidenceCollectionId;
}

/**
 * Create evidence from parameters
 */
export function createEvidence(
  careerId: CareerId,
  attributePath: string,
  value: number | string | boolean,
  source: EvidenceSource,
  methodology: EvidenceMethodology,
  confidence?: EvidenceConfidence,
  notes?: string,
  options: EvidenceCreationOptions = {}
): CareerEvidence {
  const now = Date.now();

  return {
    id: options.autoGenerateId !== false ? generateEvidenceId() : ('' as EvidenceId),
    careerId,
    attributePath,
    value,
    source,
    confidence: confidence ?? DEFAULT_CONFIDENCE,
    methodology,
    notes,
    metadata: {
      createdAt: now,
      lastUpdated: now,
      schemaVersion: EVIDENCE_SCHEMA_VERSION,
      isVerified: options.isVerified ?? false,
      dataQuality: options.dataQuality ?? 'fair',
    },
  };
}

/**
 * Create an evidence collection
 */
export function createEvidenceCollection(
  careerId: CareerId,
  attributePath: string,
  consolidatedValue: number | string | boolean,
  evidenceItems: CareerEvidence[],
  consolidationMethod: EvidenceCollection['consolidationMethod'] = 'weighted-average'
): EvidenceCollection {
  return {
    id: generateCollectionId(),
    careerId,
    attributePath,
    consolidatedValue,
    consolidationMethod,
    evidenceItems,
    aggregateConfidence: calculateAggregateConfidence(evidenceItems),
    lastUpdated: Date.now(),
  };
}

/**
 * Calculate aggregate confidence from multiple evidence items
 */
export function calculateAggregateConfidence(evidenceItems: CareerEvidence[]): EvidenceConfidence {
  if (evidenceItems.length === 0) {
    return { score: 0, level: 'very-low', factors: ['No evidence'] };
  }

  // Weight by source quality and recency
  let totalWeight = 0;
  let weightedConfidence = 0;

  const now = Date.now();
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

  for (const item of evidenceItems) {
    const sourceQuality = SOURCE_QUALITY_RANK[item.source.type] / 10;
    const confidenceScore = item.confidence.score;

    // Recency decay
    const age = now - item.metadata.createdAt;
    const recencyWeight = Math.max(0.5, 1 - age / maxAge);

    const weight = sourceQuality * recencyWeight;
    totalWeight += weight;
    weightedConfidence += confidenceScore * weight;
  }

  const aggregateScore = totalWeight > 0 ? weightedConfidence / totalWeight : 0;

  // BANNED: ConfidenceLevel enum calculation removed
  // Use Confidence Authority for confidence evaluation

  return {
    score: aggregateScore,
    level: aggregateScore, // Constitutional confidence (0.0-1.0)
    factors: [`Based on ${evidenceItems.length} evidence sources`],
  };
}

/**
 * Validate evidence object
 */
export function validateEvidence(evidence: Partial<CareerEvidence>): EvidenceValidationResult {
  const errors: EvidenceValidationError[] = [];
  const warnings: EvidenceValidationWarning[] = [];

  if (!evidence.careerId) {
    errors.push({ field: 'careerId', message: 'Career ID is required' });
  }

  if (!evidence.attributePath) {
    errors.push({ field: 'attributePath', message: 'Attribute path is required' });
  }

  if (evidence.value === undefined || evidence.value === null) {
    errors.push({ field: 'value', message: 'Value is required' });
  }

  if (!evidence.source) {
    errors.push({ field: 'source', message: 'Source is required' });
  } else {
    if (!evidence.source.type) {
      errors.push({ field: 'source.type', message: 'Source type is required' });
    }
    if (!evidence.source.name) {
      errors.push({ field: 'source.name', message: 'Source name is required' });
    }
  }

  if (!evidence.methodology) {
    errors.push({ field: 'methodology', message: 'Methodology is required' });
  } else {
    if (!evidence.methodology.type) {
      errors.push({ field: 'methodology.type', message: 'Methodology type is required' });
    }
    if (!evidence.methodology.description) {
      errors.push({ field: 'methodology.description', message: 'Methodology description is required' });
    }
  }

  if (evidence.confidence) {
    if (typeof evidence.confidence.score !== 'number' || evidence.confidence.score < 0 || evidence.confidence.score > 1) {
      errors.push({ field: 'confidence.score', message: 'Confidence score must be between 0 and 1' });
    }
  }

  // Warnings
  if (!evidence.notes) {
    warnings.push({ field: 'notes', message: 'Adding notes improves traceability' });
  }

  if (!evidence.attribution) {
    warnings.push({ field: 'attribution', message: 'Attribution information recommended' });
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Convert source type to human-readable string
 */
export function evidenceSourceToString(sourceType: EvidenceSourceType): string {
  const map: Record<EvidenceSourceType, string> = {
    'government-data': 'Government Data',
    'salary-survey': 'Salary Survey',
    'industry-report': 'Industry Report',
    'academic-research': 'Academic Research',
    'expert-interview': 'Expert Interview',
    'practitioner-survey': 'Practitioner Survey',
    'job-posting-analysis': 'Job Posting Analysis',
    'market-research': 'Market Research',
    'historical-data': 'Historical Data',
    'machine-learning-model': 'Machine Learning Model',
    'expert-opinion': 'Expert Opinion',
    'user-generated': 'User Generated',
    'third-party-api': 'Third-Party API',
    'internal-research': 'Internal Research',
    'other': 'Other',
  };
  return map[sourceType] ?? sourceType;
}

// BANNED: confidenceLevelToString() removed - Confidence Authority owns confidence formatting

// ============================================================================
// CAREER EVIDENCE SYSTEM CLASS
// ============================================================================

/**
 * Main class for managing career evidence
 */
export class CareerEvidenceSystem {
  private evidenceStore: Map<EvidenceId, CareerEvidence> = new Map();
  private collectionStore: Map<EvidenceCollectionId, EvidenceCollection> = new Map();
  private careerIndex: Map<CareerId, EvidenceId[]> = new Map();
  private attributeIndex: Map<string, EvidenceId[]> = new Map();

  /**
   * Add evidence to the system
   */
  addEvidence(evidence: CareerEvidence): EvidenceValidationResult {
    const validation = validateEvidence(evidence);

    if (!validation.isValid) {
      return validation;
    }

    this.evidenceStore.set(evidence.id, evidence);

    // Update career index
    const careerEvidence = this.careerIndex.get(evidence.careerId) ?? [];
    if (!careerEvidence.includes(evidence.id)) {
      careerEvidence.push(evidence.id);
      this.careerIndex.set(evidence.careerId, careerEvidence);
    }

    // Update attribute index
    const attributeEvidence = this.attributeIndex.get(evidence.attributePath) ?? [];
    if (!attributeEvidence.includes(evidence.id)) {
      attributeEvidence.push(evidence.id);
      this.attributeIndex.set(evidence.attributePath, attributeEvidence);
    }

    return validation;
  }

  /**
   * Get evidence by ID
   */
  getEvidence(id: EvidenceId): CareerEvidence | undefined {
    return this.evidenceStore.get(id);
  }

  /**
   * Get all evidence for a career
   */
  getEvidenceForCareer(careerId: CareerId): CareerEvidence[] {
    const ids = this.careerIndex.get(careerId) ?? [];
    return ids.map(id => this.evidenceStore.get(id)!).filter(Boolean);
  }

  /**
   * Get evidence for specific attribute
   */
  getEvidenceForAttribute(careerId: CareerId, attributePath: string): CareerEvidence[] {
    return this.getEvidenceForCareer(careerId).filter(e => e.attributePath === attributePath);
  }

  /**
   * Query evidence with filters
   */
  queryEvidence(query: EvidenceQuery): CareerEvidence[] {
    let results = Array.from(this.evidenceStore.values());

    if (query.careerIds) {
      results = results.filter(e => query.careerIds!.includes(e.careerId));
    }

    if (query.attributePaths) {
      results = results.filter(e => query.attributePaths!.includes(e.attributePath));
    }

    if (query.sourceTypes) {
      results = results.filter(e => query.sourceTypes!.includes(e.source.type));
    }

    if (query.confidenceLevels) {
      results = results.filter(e => query.confidenceLevels!.includes(e.confidence.level));
    }

    if (query.dateRange) {
      results = results.filter(e =>
        e.metadata.createdAt >= query.dateRange!.start &&
        e.metadata.createdAt <= query.dateRange!.end
      );
    }

    if (query.isVerified !== undefined) {
      results = results.filter(e => e.metadata.isVerified === query.isVerified);
    }

    if (query.dataQuality) {
      results = results.filter(e => query.dataQuality!.includes(e.metadata.dataQuality));
    }

    return results;
  }

  /**
   * Create or update evidence collection
   */
  createCollection(
    careerId: CareerId,
    attributePath: string,
    consolidationMethod: EvidenceCollection['consolidationMethod'] = 'weighted-average'
  ): EvidenceCollection {
    const evidenceItems = this.getEvidenceForAttribute(careerId, attributePath);

    // Calculate consolidated value based on method
    let consolidatedValue: number | string | boolean;

    if (evidenceItems.length === 0) {
      consolidatedValue = 0;
    } else if (typeof evidenceItems[0].value === 'number') {
      const numericValues = evidenceItems.map(e => e.value as number);

      switch (consolidationMethod) {
        case 'average':
          consolidatedValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          break;
        case 'median':
          const sorted = [...numericValues].sort((a, b) => a - b);
          consolidatedValue = sorted[Math.floor(sorted.length / 2)];
          break;
        case 'weighted-average':
          const totalWeight = evidenceItems.reduce((sum, e) => sum + e.confidence.score, 0);
          consolidatedValue = evidenceItems.reduce((sum, e) => sum + (e.value as number) * e.confidence.score, 0) / totalWeight;
          break;
        default:
          consolidatedValue = numericValues[0];
      }
    } else {
      // For non-numeric, use most recent
      consolidatedValue = evidenceItems[evidenceItems.length - 1].value;
    }

    const collection = createEvidenceCollection(
      careerId,
      attributePath,
      consolidatedValue,
      evidenceItems,
      consolidationMethod
    );

    this.collectionStore.set(collection.id, collection);
    return collection;
  }

  /**
   * Get collection by ID
   */
  getCollection(id: EvidenceCollectionId): EvidenceCollection | undefined {
    return this.collectionStore.get(id);
  }

  /**
   * Compare two evidence items
   */
  compareEvidence(idA: EvidenceId, idB: EvidenceId): EvidenceComparison | null {
    const evidenceA = this.evidenceStore.get(idA);
    const evidenceB = this.evidenceStore.get(idB);

    if (!evidenceA || !evidenceB) return null;

    const valueDiff = typeof evidenceA.value === 'number' && typeof evidenceB.value === 'number'
      ? Math.abs(evidenceA.value - evidenceB.value)
      : 0;

    const confidenceDiff = evidenceA.confidence.score - evidenceB.confidence.score;

    const sourceQualityA = SOURCE_QUALITY_RANK[evidenceA.source.type];
    const sourceQualityB = SOURCE_QUALITY_RANK[evidenceB.source.type];
    const sourceQualityComparison = sourceQualityA > sourceQualityB ? 'better' :
      sourceQualityA < sourceQualityB ? 'worse' : 'equivalent';

    const dateComparison = evidenceA.metadata.createdAt > evidenceB.metadata.createdAt ? 'newer' :
      evidenceA.metadata.createdAt < evidenceB.metadata.createdAt ? 'older' : 'same';

    let recommendation: EvidenceComparison['recommendation'];
    if (confidenceDiff > 0.2 && sourceQualityComparison === 'better') {
      recommendation = 'prefer-a';
    } else if (confidenceDiff < -0.2 && sourceQualityComparison === 'worse') {
      recommendation = 'prefer-b';
    } else if (sourceQualityComparison === 'equivalent' && Math.abs(confidenceDiff) < 0.2) {
      recommendation = 'use-both';
    } else {
      recommendation = 'insufficient-data';
    }

    return {
      evidenceA,
      evidenceB,
      valueDifference: valueDiff,
      confidenceDifference: confidenceDiff,
      sourceQualityComparison,
      dateComparison,
      recommendation,
    };
  }

  /**
   * Verify evidence
   */
  verifyEvidence(id: EvidenceId, verifiedBy: string, notes?: string): boolean {
    const evidence = this.evidenceStore.get(id);
    if (!evidence) return false;

    evidence.metadata.isVerified = true;
    evidence.metadata.verifiedAt = Date.now();
    evidence.metadata.lastUpdated = Date.now();

    return true;
  }

  /**
   * Get evidence count
   */
  getEvidenceCount(): number {
    return this.evidenceStore.size;
  }

  /**
   * Get collection count
   */
  getCollectionCount(): number {
    return this.collectionStore.size;
  }

  /**
   * Get careers with evidence
   */
  getCareersWithEvidence(): CareerId[] {
    return Array.from(this.careerIndex.keys());
  }

  /**
   * Get evidence coverage for a career
   */
  getEvidenceCoverage(careerId: CareerId): {
    totalAttributes: number;
    attributesWithEvidence: number;
    coveragePercentage: number;
  } {
    const evidence = this.getEvidenceForCareer(careerId);
    const uniqueAttributes = new Set(evidence.map(e => e.attributePath));

    // Total possible attributes across all domains
    const totalAttributes = 50; // Approximate count
    const attributesWithEvidence = uniqueAttributes.size;

    return {
      totalAttributes,
      attributesWithEvidence,
      coveragePercentage: (attributesWithEvidence / totalAttributes) * 100,
    };
  }

  /**
   * Remove evidence
   */
  removeEvidence(id: EvidenceId): boolean {
    const evidence = this.evidenceStore.get(id);
    if (!evidence) return false;

    this.evidenceStore.delete(id);

    // Update indexes
    const careerEvidence = this.careerIndex.get(evidence.careerId) ?? [];
    const idx = careerEvidence.indexOf(id);
    if (idx > -1) {
      careerEvidence.splice(idx, 1);
      if (careerEvidence.length === 0) {
        this.careerIndex.delete(evidence.careerId);
      } else {
        this.careerIndex.set(evidence.careerId, careerEvidence);
      }
    }

    const attributeEvidence = this.attributeIndex.get(evidence.attributePath) ?? [];
    const attrIdx = attributeEvidence.indexOf(id);
    if (attrIdx > -1) {
      attributeEvidence.splice(attrIdx, 1);
      if (attributeEvidence.length === 0) {
        this.attributeIndex.delete(evidence.attributePath);
      } else {
        this.attributeIndex.set(evidence.attributePath, attributeEvidence);
      }
    }

    return true;
  }

  /**
   * Clear all evidence
   */
  clear(): void {
    this.evidenceStore.clear();
    this.collectionStore.clear();
    this.careerIndex.clear();
    this.attributeIndex.clear();
  }

  /**
   * Export all evidence to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      evidence: Array.from(this.evidenceStore.values()),
      collections: Array.from(this.collectionStore.values()),
      exportedAt: Date.now(),
      schemaVersion: EVIDENCE_SCHEMA_VERSION,
    }, null, 2);
  }

  /**
   * Import evidence from JSON
   */
  importFromJSON(json: string): { evidence: number; collections: number; errors: number } {
    const data = JSON.parse(json);
    let evidenceCount = 0;
    let collectionCount = 0;
    let errorCount = 0;

    if (data.evidence) {
      for (const item of data.evidence) {
        const result = this.addEvidence(item);
        if (result.isValid) {
          evidenceCount++;
        } else {
          errorCount++;
        }
      }
    }

    if (data.collections) {
      for (const collection of data.collections) {
        this.collectionStore.set(collection.id, collection);
        collectionCount++;
      }
    }

    return { evidence: evidenceCount, collections: collectionCount, errors: errorCount };
  }
}
