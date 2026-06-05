/**
 * CareerOS Career Authoring Framework
 *
 * Standardized system for creating, validating, updating, and maintaining
 * career profiles at scale. Supports 1000+ careers with strong typing
 * and deterministic validation.
 */

import type {
  CareerId,
  CareerSlug,
  CareerV2,
  CareerCategory,
  PsychologyProfile,
  WorkStyleProfile,
  RewardProfile,
  RiskProfile,
  OptionalityProfile,
  EducationProfile,
  IndiaRealityProfile,
  FutureOutlook,
  LifestyleProfile,
} from '../ontology/career-ontology';

import type { CareerEvidence, EvidenceCollection, EvidenceId } from '../ontology/career-evidence';
import type { TransitionEdge } from '../intelligence/career-transition-graph';

// ============================================================================
// FRAMEWORK CONSTANTS
// ============================================================================

/** Schema version for authoring framework */
export const AUTHORING_SCHEMA_VERSION = '1.0.0';

/** Minimum profile completeness for publication */
export const MIN_PUBLISH_COMPLETENESS = 0.7;

/** Minimum quality score for publication */
export const MIN_PUBLISH_QUALITY = 0.6;

/** Required fields for a valid career profile */
export const REQUIRED_FIELDS: (keyof CareerV2)[] = [
  'id',
  'slug',
  'name',
  'category',
  'psychology',
  'workStyle',
  'reward',
];

/** Score ranges for validation */
export const VALID_SCORE_RANGES = {
  psychology: { min: 0, max: 1 },
  workStyle: { min: 0, max: 1 },
  reward: { min: 0, max: 10 },
  risk: { min: 0, max: 1 },
  optionality: { min: 0, max: 10 },
  indiaReality: { min: 0, max: 1 },
  futureOutlook: { min: 0, max: 10 },
  lifestyle: { min: 0, max: 10 },
};

// ============================================================================
// BRANDED TYPES
// ============================================================================

/** Validation result identifier */
export type ValidationId = string & { __brand: 'ValidationId' };

/** Audit report identifier */
export type AuditId = string & { __brand: 'AuditId' };

/** Builder session identifier */
export type BuilderSessionId = string & { __brand: 'BuilderSessionId' };

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/** Severity level for validation issues */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/** Single validation issue */
export interface ValidationIssue {
  id: ValidationId;
  field: string;
  severity: ValidationSeverity;
  message: string;
  code: string;
  suggestedFix?: string;
}

/** Complete validation result */
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  validatedAt: number;
  schemaVersion: string;
}

/** Field validation rule */
export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  customValidator?: (value: unknown) => boolean;
  customMessage?: string;
}

// ============================================================================
// COMPLETENESS TYPES
// ============================================================================

/** Completeness score breakdown by domain */
export interface DomainCompleteness {
  domain: string;
  score: number;
  filledFields: number;
  totalFields: number;
  missingFields: string[];
}

/** Evidence completeness metrics */
export interface EvidenceCompletenessMetrics {
  attributesWithEvidence: number;
  totalAttributes: number;
  score: number;
  evidenceCount: number;
  averageConfidence: number;
  attributesNeedingEvidence: string[];
}

/** Relationship completeness metrics */
export interface RelationshipCompletenessMetrics {
  incomingTransitions: number;
  outgoingTransitions: number;
  relatedCareers: number;
  score: number;
  missingRelationships: string[];
}

/** Complete completeness result */
export interface CompletenessResult {
  completenessScore: number;
  overallScore: number;
  domainScores: DomainCompleteness[];
  evidenceMetrics: EvidenceCompletenessMetrics;
  relationshipMetrics: RelationshipCompletenessMetrics;
  missingFields: string[];
  recommendations: string[];
  calculatedAt: number;
}

// ============================================================================
// QUALITY AUDIT TYPES
// ============================================================================

/** Quality dimension score */
export interface QualityDimension {
  name: string;
  score: number;
  weight: number;
  issues: string[];
}

/** Missing intelligence report */
export interface MissingIntelligence {
  type: 'evidence' | 'transition' | 'comparison' | 'market-data' | 'salary-data';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

/** Complete quality audit report */
export interface QualityAuditReport {
  auditId: AuditId;
  careerId: CareerId;
  qualityScore: number;
  confidenceScore: number;
  dimensions: QualityDimension[];
  missingIntelligence: MissingIntelligence[];
  validationWarnings: ValidationIssue[];
  recommendations: string[];
  generatedAt: number;
  schemaVersion: string;
}

// ============================================================================
// BUILDER TYPES
// ============================================================================

/** Career creation options */
export interface CareerCreationOptions {
  id?: CareerId;
  slug?: CareerSlug;
  autoGenerateId?: boolean;
  template?: CareerTemplate;
  initialData?: Partial<CareerV2>;
}

/** Career update options */
export interface CareerUpdateOptions {
  validateOnUpdate?: boolean;
  preserveEvidence?: boolean;
  updateTimestamp?: boolean;
}

/** Career enrichment options */
export interface CareerEnrichmentOptions {
  enrichPsychology?: boolean;
  enrichWorkStyle?: boolean;
  enrichRewards?: boolean;
  enrichRisks?: boolean;
  enrichIndiaReality?: boolean;
  enrichFutureOutlook?: boolean;
  enrichEvidence?: boolean;
}

/** Career template for quick creation */
export interface CareerTemplate {
  name: string;
  category: CareerCategory;
  defaults: Partial<CareerV2>;
}

/** Builder session state */
export interface BuilderSession {
  id: BuilderSessionId;
  career: CareerV2;
  evidence: Map<string, EvidenceCollection>;
  validationHistory: ValidationResult[];
  createdAt: number;
  lastModified: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

let validationCounter = 0;
let auditCounter = 0;
let sessionCounter = 0;

/** Generate unique validation ID */
export function generateValidationId(): ValidationId {
  return `val-${Date.now()}-${++validationCounter}` as ValidationId;
}

/** Generate unique audit ID */
export function generateAuditId(): AuditId {
  return `audit-${Date.now()}-${++auditCounter}` as AuditId;
}

/** Generate unique builder session ID */
export function generateBuilderSessionId(): BuilderSessionId {
  return `session-${Date.now()}-${++sessionCounter}` as BuilderSessionId;
}

/** Generate career ID */
export function generateCareerId(): CareerId {
  return `career-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as CareerId;
}

/** Generate career slug from name */
export function generateCareerSlug(name: string): CareerSlug {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') as CareerSlug;
}

// ============================================================================
// CAREER PROFILE BUILDER
// ============================================================================

/**
 * Builder for creating and managing career profiles
 */
export class CareerProfileBuilder {
  private sessions: Map<BuilderSessionId, BuilderSession> = new Map();
  private validationEngine: CareerValidationEngine;
  private completenessScorer: CareerCompletenessScorer;

  constructor() {
    this.validationEngine = new CareerValidationEngine();
    this.completenessScorer = new CareerCompletenessScorer();
  }

  /**
   * Create a new career profile
   */
  createCareer(name: string, category: CareerCategory, options: CareerCreationOptions = {}): BuilderSession {
    const id = options.id ?? (options.autoGenerateId !== false ? generateCareerId() : ('' as CareerId));
    const slug = options.slug ?? generateCareerSlug(name);

    const career: CareerV2 = {
      id,
      slug,
      name,
      category,
      description: options.initialData?.description ?? '',
      version: '2.0.0',
      lastUpdated: Date.now(),
      psychology: options.initialData?.psychology ?? this.createDefaultPsychology(),
      workStyle: options.initialData?.workStyle ?? this.createDefaultWorkStyle(),
      reward: options.initialData?.reward ?? this.createDefaultReward(),
      risk: options.initialData?.risk ?? this.createDefaultRisk(),
      optionality: options.initialData?.optionality ?? this.createDefaultOptionality(),
      education: options.initialData?.education ?? this.createDefaultEducation(),
      indiaReality: options.initialData?.indiaReality ?? this.createDefaultIndiaReality(),
      futureOutlook: options.initialData?.futureOutlook ?? this.createDefaultFutureOutlook(),
      lifestyle: options.initialData?.lifestyle ?? this.createDefaultLifestyle(),
    };

    const session: BuilderSession = {
      id: generateBuilderSessionId(),
      career,
      evidence: new Map(),
      validationHistory: [],
      createdAt: Date.now(),
      lastModified: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Load existing career into builder session
   */
  loadCareer(career: CareerV2): BuilderSession {
    const session: BuilderSession = {
      id: generateBuilderSessionId(),
      career: { ...career },
      evidence: new Map(),
      validationHistory: [],
      createdAt: Date.now(),
      lastModified: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: BuilderSessionId): BuilderSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update career in session
   */
  updateCareer(
    sessionId: BuilderSessionId,
    updates: Partial<CareerV2>,
    options: CareerUpdateOptions = {}
  ): { session: BuilderSession | null; validation: ValidationResult | null } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { session: null, validation: null };
    }

    // Apply updates
    Object.assign(session.career, updates);
    session.career.lastUpdated = Date.now();
    session.lastModified = Date.now();

    // Validate if requested
    let validation: ValidationResult | null = null;
    if (options.validateOnUpdate !== false) {
      validation = this.validationEngine.validateCareer(session.career);
      session.validationHistory.push(validation);
    }

    return { session, validation };
  }

  /**
   * Enrich career with additional data
   */
  enrichCareer(
    sessionId: BuilderSessionId,
    options: CareerEnrichmentOptions = {}
  ): { session: BuilderSession | null; enriched: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { session: null, enriched: [] };
    }

    const enriched: string[] = [];

    if (options.enrichPsychology) {
      session.career.psychology = this.enrichPsychologyProfile(session.career.psychology);
      enriched.push('psychology');
    }

    if (options.enrichWorkStyle) {
      session.career.workStyle = this.enrichWorkStyleProfile(session.career.workStyle);
      enriched.push('workStyle');
    }

    if (options.enrichRewards) {
      session.career.reward = this.enrichRewardProfile(session.career.reward);
      enriched.push('reward');
    }

    if (options.enrichRisks) {
      session.career.risk = this.enrichRiskProfile(session.career.risk);
      enriched.push('risk');
    }

    if (options.enrichIndiaReality) {
      session.career.indiaReality = this.enrichIndiaRealityProfile(session.career.indiaReality);
      enriched.push('indiaReality');
    }

    if (options.enrichFutureOutlook) {
      session.career.futureOutlook = this.enrichFutureOutlook(session.career.futureOutlook);
      enriched.push('futureOutlook');
    }

    session.career.lastUpdated = Date.now();
    session.lastModified = Date.now();

    return { session, enriched };
  }

  /**
   * Finalize career for publication
   */
  finalizeCareer(sessionId: BuilderSessionId): {
    career: CareerV2 | null;
    validation: ValidationResult;
    completeness: CompletenessResult;
    canPublish: boolean;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        career: null,
        validation: this.createEmptyValidation(),
        completeness: this.completenessScorer.createEmptyResult(),
        canPublish: false,
      };
    }

    const validation = this.validationEngine.validateCareer(session.career);
    const completeness = this.completenessScorer.calculateCompleteness(session.career);

    const canPublish =
      validation.isValid &&
      completeness.completenessScore >= MIN_PUBLISH_COMPLETENESS;

    return {
      career: session.career,
      validation,
      completeness,
      canPublish,
    };
  }

  /**
   * Export career from session
   */
  exportCareer(sessionId: BuilderSessionId): CareerV2 | null {
    const session = this.sessions.get(sessionId);
    return session ? { ...session.career } : null;
  }

  /**
   * Discard session
   */
  discardSession(sessionId: BuilderSessionId): boolean {
    return this.sessions.delete(sessionId);
  }

  // Private helper methods

  private createDefaultPsychology(): PsychologyProfile {
    return {
      analyticalThinking: 0.5,
      creativity: 0.5,
      socialOrientation: 0.5,
      leadership: 0.5,
      detailOrientation: 0.5,
    };
  }

  private createDefaultWorkStyle(): WorkStyleProfile {
    return {
      workEnvironment: 'hybrid',
      teamSize: 'medium',
      autonomyLevel: 0.5,
      travelRequirement: 'minimal',
      remoteWork: 'possible',
    };
  }

  private createDefaultReward(): RewardProfile {
    return {
      incomePotential: 5,
      statusPotential: 5,
      impactPotential: 5,
      freedomPotential: 5,
    };
  }

  private createDefaultRisk(): RiskProfile {
    return {
      burnoutRisk: 0.5,
      automationRisk: 0.5,
      competitionLevel: 0.5,
    };
  }

  private createDefaultOptionality(): OptionalityProfile {
    return {
      exitOptions: [],
      adjacentCareers: [],
      pivotDifficulty: 5,
      transferabilityScore: 5,
    };
  }

  private createDefaultEducation(): EducationProfile {
    return {
      requiredDegrees: [],
      preferredDegrees: [],
      certifications: [],
      continuousLearning: 5,
    };
  }

  private createDefaultIndiaReality(): IndiaRealityProfile {
    return {
      coachingDependency: 0.5,
      englishDependency: 0.5,
      urbanAdvantage: 0.5,
      familyAcceptance: 0.5,
    };
  }

  private createDefaultFutureOutlook(): FutureOutlook {
    return {
      aiImpact: 'neutral',
      growthTrajectory: 'stable',
      indiaDemand: 5,
    };
  }

  private createDefaultLifestyle(): LifestyleProfile {
    return {
      workLifeBalance: 5,
      stressLevel: 5,
      flexibility: 5,
    };
  }

  private enrichPsychologyProfile(profile: PsychologyProfile): PsychologyProfile {
    return {
      ...profile,
      analyticalThinking: profile.analyticalThinking ?? 0.5,
      creativity: profile.creativity ?? 0.5,
      socialOrientation: profile.socialOrientation ?? 0.5,
      leadership: profile.leadership ?? 0.5,
      detailOrientation: profile.detailOrientation ?? 0.5,
      curiosity: profile.curiosity ?? 0.5,
      competitiveness: profile.competitiveness ?? 0.5,
      riskTolerance: profile.riskTolerance ?? 0.5,
    };
  }

  private enrichWorkStyleProfile(profile: WorkStyleProfile): WorkStyleProfile {
    return {
      ...profile,
      workEnvironment: profile.workEnvironment ?? 'hybrid',
      teamSize: profile.teamSize ?? 'medium',
      autonomyLevel: profile.autonomyLevel ?? 0.5,
      travelRequirement: profile.travelRequirement ?? 'minimal',
      remoteWork: profile.remoteWork ?? 'possible',
      workSchedule: profile.workSchedule ?? 'flexible',
      physicalDemand: profile.physicalDemand ?? 'low',
    };
  }

  private enrichRewardProfile(profile: RewardProfile): RewardProfile {
    return {
      ...profile,
      incomePotential: profile.incomePotential ?? 5,
      statusPotential: profile.statusPotential ?? 5,
      impactPotential: profile.impactPotential ?? 5,
      freedomPotential: profile.freedomPotential ?? 5,
      stabilityPotential: profile.stabilityPotential ?? 5,
    };
  }

  private enrichRiskProfile(profile: RiskProfile): RiskProfile {
    return {
      ...profile,
      burnoutRisk: profile.burnoutRisk ?? 0.5,
      automationRisk: profile.automationRisk ?? 0.5,
      competitionLevel: profile.competitionLevel ?? 0.5,
      incomeVolatility: profile.incomeVolatility ?? 0.5,
    };
  }

  private enrichIndiaRealityProfile(profile: IndiaRealityProfile): IndiaRealityProfile {
    return {
      ...profile,
      coachingDependency: profile.coachingDependency ?? 0.5,
      englishDependency: profile.englishDependency ?? 0.5,
      urbanAdvantage: profile.urbanAdvantage ?? 0.5,
      familyAcceptance: profile.familyAcceptance ?? 0.5,
      casteDynamics: profile.casteDynamics ?? 'neutral',
      genderConsiderations: profile.genderConsiderations ?? 'neutral',
    };
  }

  private enrichFutureOutlook(profile: FutureOutlook): FutureOutlook {
    return {
      ...profile,
      aiImpact: profile.aiImpact ?? 'neutral',
      growthTrajectory: profile.growthTrajectory ?? 'stable',
      indiaDemand: profile.indiaDemand ?? 5,
      emergingSpecializations: profile.emergingSpecializations ?? [],
      skillObsolescenceRisk: profile.skillObsolescenceRisk ?? 0.3,
    };
  }

  private createEmptyValidation(): ValidationResult {
    return {
      isValid: false,
      issues: [],
      errors: [],
      warnings: [],
      info: [],
      summary: { totalIssues: 0, errorCount: 0, warningCount: 0, infoCount: 0 },
      validatedAt: Date.now(),
      schemaVersion: AUTHORING_SCHEMA_VERSION,
    };
  }
}

// ============================================================================
// CAREER VALIDATION ENGINE
// ============================================================================

/**
 * Engine for validating career profiles against rules and constraints
 */
export class CareerValidationEngine {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Validate complete career profile
   */
  validateCareer(career: CareerV2): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate required fields
    issues.push(...this.validateRequiredFields(career));

    // Validate score ranges
    issues.push(...this.validateScoreRanges(career));

    // Validate ontology compliance
    issues.push(...this.validateOntologyCompliance(career));

    // Categorize issues
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const info = issues.filter(i => i.severity === 'info');

    return {
      isValid: errors.length === 0,
      issues,
      errors,
      warnings,
      info,
      summary: {
        totalIssues: issues.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: info.length,
      },
      validatedAt: Date.now(),
      schemaVersion: AUTHORING_SCHEMA_VERSION,
    };
  }

  /**
   * Validate specific field
   */
  validateField(career: CareerV2, fieldPath: string): ValidationIssue[] {
    const value = this.getFieldValue(career, fieldPath);
    const rule = this.rules.find(r => r.field === fieldPath);

    if (!rule) {
      return [{
        id: generateValidationId(),
        field: fieldPath,
        severity: 'warning',
        message: `No validation rule found for field: ${fieldPath}`,
        code: 'NO_RULE',
      }];
    }

    return this.applyRule(rule, value, fieldPath);
  }

  /**
   * Validate transition consistency
   */
  validateTransitionConsistency(career: CareerV2, transitions: TransitionEdge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check if career is referenced in transitions
    const hasIncoming = transitions.some(t => t.to === career.id);
    const hasOutgoing = transitions.some(t => t.from === career.id);

    // Entry-level careers may not need incoming transitions
    const isEntryLevel = career.optionality?.pivotDifficulty === 10;

    if (!hasIncoming && !isEntryLevel) {
      issues.push({
        id: generateValidationId(),
        field: 'transitions.incoming',
        severity: 'warning',
        message: 'Career has no incoming transitions',
        code: 'NO_INCOMING_TRANSITIONS',
        suggestedFix: 'Add transition edges from related careers',
      });
    }

    if (!hasOutgoing) {
      issues.push({
        id: generateValidationId(),
        field: 'transitions.outgoing',
        severity: 'warning',
        message: 'Career has no outgoing transitions',
        code: 'NO_OUTGOING_TRANSITIONS',
        suggestedFix: 'Add transition edges to exit options',
      });
    }

    return issues;
  }

  /**
   * Validate evidence completeness
   */
  validateEvidenceCompleteness(career: CareerV2, evidenceCount: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (evidenceCount === 0) {
      issues.push({
        id: generateValidationId(),
        field: 'evidence',
        severity: 'warning',
        message: 'No evidence attached to career profile',
        code: 'NO_EVIDENCE',
        suggestedFix: 'Add evidence sources for key attributes',
      });
    } else if (evidenceCount < 3) {
      issues.push({
        id: generateValidationId(),
        field: 'evidence',
        severity: 'info',
        message: 'Limited evidence available',
        code: 'LIMITED_EVIDENCE',
        suggestedFix: 'Add more evidence sources for better confidence',
      });
    }

    return issues;
  }

  /**
   * Add custom validation rule
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Get all validation rules
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  // Private helper methods

  private initializeRules(): void {
    this.rules = [
      { field: 'id', required: true, type: 'string' },
      { field: 'slug', required: true, type: 'string', pattern: /^[a-z0-9-]+$/ },
      { field: 'name', required: true, type: 'string', min: 2, max: 100 },
      { field: 'category', required: true, type: 'string' },
      { field: 'version', required: true, type: 'string' },
      { field: 'psychology.analyticalThinking', required: true, type: 'number', min: 0, max: 1 },
      { field: 'psychology.creativity', required: true, type: 'number', min: 0, max: 1 },
      { field: 'psychology.socialOrientation', required: true, type: 'number', min: 0, max: 1 },
      { field: 'psychology.leadership', required: true, type: 'number', min: 0, max: 1 },
      { field: 'psychology.detailOrientation', required: true, type: 'number', min: 0, max: 1 },
      { field: 'reward.incomePotential', required: true, type: 'number', min: 0, max: 10 },
      { field: 'reward.statusPotential', required: true, type: 'number', min: 0, max: 10 },
      { field: 'reward.impactPotential', required: true, type: 'number', min: 0, max: 10 },
      { field: 'workStyle.autonomyLevel', required: true, type: 'number', min: 0, max: 1 },
      { field: 'risk.burnoutRisk', required: true, type: 'number', min: 0, max: 1 },
      { field: 'risk.automationRisk', required: true, type: 'number', min: 0, max: 1 },
    ];
  }

  private validateRequiredFields(career: CareerV2): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const field of REQUIRED_FIELDS) {
      const value = career[field];
      if (value === undefined || value === null || value === '') {
        issues.push({
          id: generateValidationId(),
          field,
          severity: 'error',
          message: `Required field missing: ${field}`,
          code: 'REQUIRED_FIELD_MISSING',
        });
      }
    }

    return issues;
  }

  private validateScoreRanges(career: CareerV2): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate psychology scores
    if (career.psychology) {
      for (const [key, value] of Object.entries(career.psychology)) {
        if (typeof value === 'number' && (value < 0 || value > 1)) {
          issues.push({
            id: generateValidationId(),
            field: `psychology.${key}`,
            severity: 'error',
            message: `Psychology score ${key} must be between 0 and 1`,
            code: 'INVALID_SCORE_RANGE',
            suggestedFix: 'Adjust score to valid range',
          });
        }
      }
    }

    // Validate reward scores
    if (career.reward) {
      for (const [key, value] of Object.entries(career.reward)) {
        if (typeof value === 'number' && (value < 0 || value > 10)) {
          issues.push({
            id: generateValidationId(),
            field: `reward.${key}`,
            severity: 'error',
            message: `Reward score ${key} must be between 0 and 10`,
            code: 'INVALID_SCORE_RANGE',
            suggestedFix: 'Adjust score to valid range',
          });
        }
      }
    }

    return issues;
  }

  private validateOntologyCompliance(career: CareerV2): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check version
    if (career.version !== '2.0.0') {
      issues.push({
        id: generateValidationId(),
        field: 'version',
        severity: 'warning',
        message: 'Career schema version should be 2.0.0',
        code: 'VERSION_MISMATCH',
        suggestedFix: 'Update version to 2.0.0',
      });
    }

    // Check lastUpdated
    if (!career.lastUpdated || career.lastUpdated > Date.now()) {
      issues.push({
        id: generateValidationId(),
        field: 'lastUpdated',
        severity: 'warning',
        message: 'Invalid or missing lastUpdated timestamp',
        code: 'INVALID_TIMESTAMP',
      });
    }

    return issues;
  }

  private getFieldValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((o, p) => (o as Record<string, unknown>)?.[p], obj);
  }

  private applyRule(rule: ValidationRule, value: unknown, fieldPath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (rule.required && (value === undefined || value === null)) {
      issues.push({
        id: generateValidationId(),
        field: fieldPath,
        severity: 'error',
        message: rule.customMessage || `Field ${fieldPath} is required`,
        code: 'REQUIRED_FIELD_MISSING',
      });
      return issues;
    }

    if (value === undefined || value === null) {
      return issues;
    }

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      issues.push({
        id: generateValidationId(),
        field: fieldPath,
        severity: 'error',
        message: `Field ${fieldPath} must be of type ${rule.type}`,
        code: 'TYPE_MISMATCH',
      });
    }

    // Range check for numbers
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        issues.push({
          id: generateValidationId(),
          field: fieldPath,
          severity: 'error',
          message: `Field ${fieldPath} must be at least ${rule.min}`,
          code: 'BELOW_MIN',
        });
      }
      if (rule.max !== undefined && value > rule.max) {
        issues.push({
          id: generateValidationId(),
          field: fieldPath,
          severity: 'error',
          message: `Field ${fieldPath} must be at most ${rule.max}`,
          code: 'ABOVE_MAX',
        });
      }
    }

    // Pattern check for strings
    if (rule.type === 'string' && typeof value === 'string' && rule.pattern) {
      if (!rule.pattern.test(value)) {
        issues.push({
          id: generateValidationId(),
          field: fieldPath,
          severity: 'error',
          message: `Field ${fieldPath} does not match required pattern`,
          code: 'PATTERN_MISMATCH',
        });
      }
    }

    // Custom validator
    if (rule.customValidator && !rule.customValidator(value)) {
      issues.push({
        id: generateValidationId(),
        field: fieldPath,
        severity: 'error',
        message: rule.customMessage || `Field ${fieldPath} failed custom validation`,
        code: 'CUSTOM_VALIDATION_FAILED',
      });
    }

    return issues;
  }
}

// ============================================================================
// CAREER COMPLETENESS SCORER
// ============================================================================

/**
 * Calculates completeness scores for career profiles
 */
export class CareerCompletenessScorer {
  private domainFieldCounts: Record<string, number> = {
    psychology: 8,
    workStyle: 7,
    reward: 5,
    risk: 4,
    optionality: 4,
    education: 4,
    indiaReality: 6,
    futureOutlook: 4,
    lifestyle: 3,
  };

  /**
   * Calculate completeness for a career profile
   */
  calculateCompleteness(career: CareerV2): CompletenessResult {
    const domainScores: DomainCompleteness[] = [];
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    // Calculate domain completeness
    domainScores.push(this.calculateDomainScore('psychology', career.psychology));
    domainScores.push(this.calculateDomainScore('workStyle', career.workStyle));
    domainScores.push(this.calculateDomainScore('reward', career.reward));
    domainScores.push(this.calculateDomainScore('risk', career.risk));
    domainScores.push(this.calculateDomainScore('optionality', career.optionality));
    domainScores.push(this.calculateDomainScore('education', career.education));
    domainScores.push(this.calculateDomainScore('indiaReality', career.indiaReality));
    domainScores.push(this.calculateDomainScore('futureOutlook', career.futureOutlook));
    domainScores.push(this.calculateDomainScore('lifestyle', career.lifestyle));

    // Collect missing fields
    domainScores.forEach(domain => {
      missingFields.push(...domain.missingFields);
      if (domain.score < 0.5) {
        recommendations.push(`Add more ${domain.domain} data (${Math.round(domain.score * 100)}% complete)`);
      }
    });

    // Calculate evidence metrics (placeholder - would integrate with evidence system)
    const evidenceMetrics: EvidenceCompletenessMetrics = {
      attributesWithEvidence: 0,
      totalAttributes: this.getTotalAttributeCount(),
      score: 0,
      evidenceCount: 0,
      averageConfidence: 0,
      attributesNeedingEvidence: this.getCriticalAttributes(),
    };

    // Calculate relationship metrics (placeholder)
    const relationshipMetrics: RelationshipCompletenessMetrics = {
      incomingTransitions: 0,
      outgoingTransitions: 0,
      relatedCareers: 0,
      score: 0,
      missingRelationships: [],
    };

    // Calculate overall score
    const domainAverage = domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length;
    const overallScore = domainAverage * 0.6 + evidenceMetrics.score * 0.3 + relationshipMetrics.score * 0.1;

    return {
      completenessScore: overallScore,
      overallScore,
      domainScores,
      evidenceMetrics,
      relationshipMetrics,
      missingFields,
      recommendations,
      calculatedAt: Date.now(),
    };
  }

  /**
   * Calculate evidence completeness
   */
  calculateEvidenceCompleteness(evidenceCount: number, attributesWithEvidence: number): EvidenceCompletenessMetrics {
    const totalAttributes = this.getTotalAttributeCount();
    const score = attributesWithEvidence / totalAttributes;

    return {
      attributesWithEvidence,
      totalAttributes,
      score,
      evidenceCount,
      averageConfidence: 0, // Would calculate from actual evidence
      attributesNeedingEvidence: this.getCriticalAttributes(),
    };
  }

  /**
   * Calculate relationship completeness
   */
  calculateRelationshipCompleteness(
    incomingTransitions: number,
    outgoingTransitions: number,
    relatedCareers: number
  ): RelationshipCompletenessMetrics {
    const idealTransitions = 5; // Target number of transitions
    const idealRelated = 10; // Target number of related careers

    const incomingScore = Math.min(incomingTransitions / idealTransitions, 1);
    const outgoingScore = Math.min(outgoingTransitions / idealTransitions, 1);
    const relatedScore = Math.min(relatedCareers / idealRelated, 1);

    const score = (incomingScore + outgoingScore + relatedScore) / 3;

    const missingRelationships: string[] = [];
    if (incomingTransitions === 0) missingRelationships.push('incoming-transitions');
    if (outgoingTransitions === 0) missingRelationships.push('outgoing-transitions');
    if (relatedCareers === 0) missingRelationships.push('related-careers');

    return {
      incomingTransitions,
      outgoingTransitions,
      relatedCareers,
      score,
      missingRelationships,
    };
  }

  /**
   * Create empty completeness result
   */
  createEmptyResult(): CompletenessResult {
    return {
      completenessScore: 0,
      overallScore: 0,
      domainScores: [],
      evidenceMetrics: {
        attributesWithEvidence: 0,
        totalAttributes: 0,
        score: 0,
        evidenceCount: 0,
        averageConfidence: 0,
        attributesNeedingEvidence: [],
      },
      relationshipMetrics: {
        incomingTransitions: 0,
        outgoingTransitions: 0,
        relatedCareers: 0,
        score: 0,
        missingRelationships: [],
      },
      missingFields: [],
      recommendations: [],
      calculatedAt: Date.now(),
    };
  }

  // Private helper methods

  private calculateDomainScore(domain: string, data: Record<string, unknown> | undefined): DomainCompleteness {
    if (!data) {
      return {
        domain,
        score: 0,
        filledFields: 0,
        totalFields: this.domainFieldCounts[domain] || 1,
        missingFields: [domain],
      };
    }

    const fields = Object.keys(data);
    const filledFields = fields.filter(f => {
      const value = data[f];
      return value !== undefined && value !== null;
    });

    const totalFields = this.domainFieldCounts[domain] || fields.length;
    const missingFields = fields.filter(f => {
      const value = data[f];
      return value === undefined || value === null;
    });

    return {
      domain,
      score: filledFields.length / totalFields,
      filledFields: filledFields.length,
      totalFields,
      missingFields: missingFields.map(f => `${domain}.${f}`),
    };
  }

  private getTotalAttributeCount(): number {
    return Object.values(this.domainFieldCounts).reduce((sum, count) => sum + count, 0);
  }

  private getCriticalAttributes(): string[] {
    return [
      'reward.incomePotential',
      'psychology.analyticalThinking',
      'risk.burnoutRisk',
      'indiaReality.familyAcceptance',
    ];
  }
}

// ============================================================================
// CAREER QUALITY AUDIT
// ============================================================================

/**
 * Generates quality audits for career profiles
 */
export class CareerQualityAudit {
  private validationEngine: CareerValidationEngine;
  private completenessScorer: CareerCompletenessScorer;

  constructor() {
    this.validationEngine = new CareerValidationEngine();
    this.completenessScorer = new CareerCompletenessScorer();
  }

  /**
   * Generate complete quality audit for a career
   */
  generateAudit(career: CareerV2, evidenceCount: number = 0): QualityAuditReport {
    const auditId = generateAuditId();

    // Run validation
    const validation = this.validationEngine.validateCareer(career);

    // Run completeness scoring
    const completeness = this.completenessScorer.calculateCompleteness(career);

    // Calculate quality dimensions
    const dimensions: QualityDimension[] = [
      {
        name: 'Completeness',
        score: completeness.completenessScore,
        weight: 0.3,
        issues: completeness.recommendations,
      },
      {
        name: 'Validation',
        score: validation.isValid ? 1 : 1 - (validation.errors.length * 0.1),
        weight: 0.25,
        issues: validation.errors.map(e => e.message),
      },
      {
        name: 'Evidence',
        score: Math.min(evidenceCount / 5, 1),
        weight: 0.25,
        issues: evidenceCount < 3 ? ['Insufficient evidence sources'] : [],
      },
      {
        name: 'Consistency',
        score: this.calculateConsistencyScore(career),
        weight: 0.2,
        issues: this.findConsistencyIssues(career),
      },
    ];

    // Calculate overall scores
    const qualityScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
    const confidenceScore = this.calculateConfidenceScore(dimensions, evidenceCount);

    // Identify missing intelligence
    const missingIntelligence = this.identifyMissingIntelligence(career, completeness, evidenceCount);

    return {
      auditId,
      careerId: career.id,
      qualityScore,
      confidenceScore,
      dimensions,
      missingIntelligence,
      validationWarnings: validation.warnings,
      recommendations: this.generateRecommendations(dimensions, missingIntelligence),
      generatedAt: Date.now(),
      schemaVersion: AUTHORING_SCHEMA_VERSION,
    };
  }

  /**
   * Batch audit multiple careers
   */
  batchAudit(careers: CareerV2[]): QualityAuditReport[] {
    return careers.map(career => this.generateAudit(career));
  }

  /**
   * Compare two career audits
   */
  compareAudits(auditA: QualityAuditReport, auditB: QualityAuditReport): {
    betterQuality: CareerId;
    qualityDifference: number;
    confidenceDifference: number;
    recommendations: string[];
  } {
    const qualityDiff = auditA.qualityScore - auditB.qualityScore;
    const confidenceDiff = auditA.confidenceScore - auditB.confidenceScore;

    return {
      betterQuality: qualityDiff > 0 ? auditA.careerId : auditB.careerId,
      qualityDifference: Math.abs(qualityDiff),
      confidenceDifference: Math.abs(confidenceDiff),
      recommendations: qualityDiff > 0
        ? [`Career ${auditA.careerId} has higher quality`]
        : [`Career ${auditB.careerId} has higher quality`],
    };
  }

  /**
   * Get careers ready for publication
   */
  getPublishReadyCareers(careers: CareerV2[]): CareerV2[] {
    return careers.filter(career => {
      const audit = this.generateAudit(career);
      return audit.qualityScore >= MIN_PUBLISH_QUALITY &&
             this.completenessScorer.calculateCompleteness(career).completenessScore >= MIN_PUBLISH_COMPLETENESS;
    });
  }

  // Private helper methods

  private calculateConsistencyScore(career: CareerV2): number {
    let score = 1;
    const issues: string[] = [];

    // Check psychology-workStyle consistency
    if (career.psychology?.socialOrientation && career.workStyle?.teamSize) {
      const social = career.psychology.socialOrientation;
      const teamSize = career.workStyle.teamSize;

      if (social > 0.7 && teamSize === 'solo') {
        score -= 0.2;
        issues.push('High social orientation with solo work');
      }
      if (social < 0.3 && teamSize === 'large') {
        score -= 0.2;
        issues.push('Low social orientation with large team');
      }
    }

    // Check reward-risk consistency
    if (career.reward?.incomePotential && career.risk?.incomeVolatility) {
      const highIncome = career.reward.incomePotential > 8;
      const highVolatility = career.risk.incomeVolatility > 0.7;

      if (highIncome && !highVolatility) {
        issues.push('High income without corresponding volatility');
      }
    }

    return Math.max(0, score);
  }

  private findConsistencyIssues(career: CareerV2): string[] {
    const issues: string[] = [];

    if (career.psychology?.socialOrientation && career.workStyle?.teamSize) {
      if (career.psychology.socialOrientation > 0.7 && career.workStyle.teamSize === 'solo') {
        issues.push('High social orientation but solo work style');
      }
    }

    return issues;
  }

  private calculateConfidenceScore(dimensions: QualityDimension[], evidenceCount: number): number {
    const baseScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
    const evidenceBoost = Math.min(evidenceCount * 0.05, 0.2);
    return Math.min(1, baseScore + evidenceBoost);
  }

  private identifyMissingIntelligence(
    career: CareerV2,
    completeness: CompletenessResult,
    evidenceCount: number
  ): MissingIntelligence[] {
    const missing: MissingIntelligence[] = [];

    if (evidenceCount === 0) {
      missing.push({
        type: 'evidence',
        priority: 'critical',
        description: 'No evidence sources attached',
        impact: 'Low confidence in all scores',
      });
    } else if (evidenceCount < 3) {
      missing.push({
        type: 'evidence',
        priority: 'high',
        description: 'Insufficient evidence sources',
        impact: 'Reduced confidence in accuracy',
      });
    }

    if (completeness.evidenceMetrics.attributesNeedingEvidence.length > 0) {
      missing.push({
        type: 'market-data',
        priority: 'medium',
        description: 'Missing market data for key attributes',
        impact: 'Incomplete career picture',
      });
    }

    if (!career.optionality?.exitOptions?.length) {
      missing.push({
        type: 'transition',
        priority: 'medium',
        description: 'No exit options defined',
        impact: 'Incomplete career pathway analysis',
      });
    }

    return missing;
  }

  private generateRecommendations(dimensions: QualityDimension[], missing: MissingIntelligence[]): string[] {
    const recommendations: string[] = [];

    dimensions.forEach(d => {
      if (d.score < 0.7) {
        recommendations.push(`Improve ${d.name.toLowerCase()} (${Math.round(d.score * 100)}%)`);
      }
    });

    missing.forEach(m => {
      recommendations.push(`Address ${m.type}: ${m.description}`);
    });

    return recommendations;
  }
}

