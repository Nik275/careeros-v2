/**
 * @fileoverview Observe-mode constitutional validator.
 *
 * This validator detects ownership, authority, dependency, and public surface
 * violations. It never blocks, throws for policy reasons, redirects traffic, or
 * changes business behavior.
 */

import type {
  AuthorityType,
  ConstitutionalLogger,
  DependencyRelationship,
  PublicSurfaceRecord,
  ValidationInput,
  ValidationResult,
  ViolationRecord,
  ViolationSeverity,
  ViolationType,
} from './ConstitutionalTypes';
import {
  ConstitutionalOwnershipRegistry,
  normalizeModulePath,
} from './ConstitutionalOwnershipRegistry';

const DOMAIN_AUTHORITIES: readonly AuthorityType[] = [
  'StudentUnderstandingAuthority',
  'OptionGeneratorAuthority',
  'OutcomeTrackerAuthority',
] as const;

const EMPTY_LOGGER: ConstitutionalLogger = {
  logViolation: () => undefined,
  logAudit: () => undefined,
};

export interface ConstitutionalValidatorOptions {
  registry?: ConstitutionalOwnershipRegistry;
  logger?: ConstitutionalLogger;
  observedAt?: () => string;
}

export class ConstitutionalValidator {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly logger: ConstitutionalLogger;
  private readonly observedAt: () => string;

  constructor(options: ConstitutionalValidatorOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.logger = options.logger ?? EMPTY_LOGGER;
    this.observedAt = options.observedAt ?? (() => new Date().toISOString());
  }

  validate(input: ValidationInput = {}): ValidationResult {
    const observedAt = this.observedAt();
    const violations: ViolationRecord[] = [];

    violations.push(...this.validateOwnership(input.modulePaths ?? [], observedAt));
    violations.push(...this.validateDependencies(input.dependencies ?? [], observedAt));
    violations.push(...this.validateAuthorityUsages(input.authorityUsages ?? [], observedAt));
    violations.push(...this.validatePublicSurfaces(input.publicSurfaces ?? [], observedAt));

    for (const violation of violations) {
      this.logger.logViolation(violation);
    }

    return {
      mode: 'observe',
      observedAt,
      checkedModules: input.modulePaths?.length ?? 0,
      checkedDependencies: input.dependencies?.length ?? 0,
      checkedAuthorityUsages: input.authorityUsages?.length ?? 0,
      checkedPublicSurfaces: input.publicSurfaces?.length ?? 0,
      violations,
      summary: buildViolationSummary(violations),
    };
  }

  validateOwnership(
    modulePaths: readonly string[],
    observedAt: string = this.observedAt()
  ): readonly ViolationRecord[] {
    return modulePaths
      .filter((modulePath) => !this.registry.hasModule(modulePath))
      .map((modulePath) =>
        createViolation({
          type: 'OWNERSHIP_VIOLATION',
          severity: 'medium',
          observedAt,
          modulePath,
          description: `Module ${modulePath} has no constitutional ownership record.`,
          impact: 'New or unclassified intelligence can become shadow intelligence.',
          resolutionStrategy:
            'Classify the module as UNDERSTAND, GENERATE, LEARN, ORCHESTRATE, DECIDE, CONFIDENCE, or SHARED before implementation proceeds.',
          evidence: [modulePath],
        })
      );
  }

  validateDependencies(
    dependencies: readonly DependencyRelationship[],
    observedAt: string = this.observedAt()
  ): readonly ViolationRecord[] {
    const violations: ViolationRecord[] = [];

    for (const relationship of dependencies) {
      const source = this.registry.getRecord(relationship.sourceModule);
      const target = this.registry.getRecord(relationship.targetModule);

      if (!source || !target) {
        continue;
      }

      if (isForbiddenAuthorityEdge(source.owner, target.owner)) {
        violations.push(
          createViolation({
            type: 'DEPENDENCY_VIOLATION',
            severity: 'high',
            observedAt,
            sourceModule: relationship.sourceModule,
            targetModule: relationship.targetModule,
            sourceAuthority: source.owner,
            targetAuthority: target.owner,
            description: `${source.owner} module imports ${target.owner} module in observe mode.`,
            impact:
              'Direct cross-authority dependencies bypass the future IntelligenceOrchestrator boundary.',
            resolutionStrategy:
              'Replace direct dependency with an orchestrator-routed snapshot, event, or authority facade contract during later migration waves.',
            evidence: [relationship.evidence ?? relationship.relationshipType],
          })
        );
      }
    }

    return violations;
  }

  validateAuthorityUsages(
    usages: readonly {
      sourceModule: string;
      targetAuthority: AuthorityType;
      operation: string;
      evidence?: string;
    }[],
    observedAt: string = this.observedAt()
  ): readonly ViolationRecord[] {
    const violations: ViolationRecord[] = [];

    for (const usage of usages) {
      const source = this.registry.getRecord(usage.sourceModule);
      if (!source) continue;

      if (isForbiddenAuthorityEdge(source.owner, usage.targetAuthority)) {
        violations.push(
          createViolation({
            type: 'AUTHORITY_VIOLATION',
            severity: 'high',
            observedAt,
            sourceModule: usage.sourceModule,
            sourceAuthority: source.owner,
            targetAuthority: usage.targetAuthority,
            description: `${source.owner} module attempted ${usage.operation} against ${usage.targetAuthority}.`,
            impact:
              'Authority-to-authority behavior must be routed through IntelligenceOrchestrator in the target architecture.',
            resolutionStrategy:
              'Route this authority interaction through IntelligenceOrchestrator once facades exist. Phase 4.0 observes only.',
            evidence: [usage.evidence ?? usage.operation],
          })
        );
      }
    }

    return violations;
  }

  validatePublicSurfaces(
    publicSurfaces: readonly PublicSurfaceRecord[],
    observedAt: string = this.observedAt()
  ): readonly ViolationRecord[] {
    const violations: ViolationRecord[] = [];

    for (const surface of publicSurfaces) {
      const authorities = new Set<AuthorityType>();

      for (const exposedModule of surface.exposedModules) {
        const owner = this.registry.getOwner(exposedModule);
        if (owner && DOMAIN_AUTHORITIES.includes(owner)) {
          authorities.add(owner);
        }
      }

      if (authorities.size > 1) {
        violations.push(
          createViolation({
            type: 'PUBLIC_SURFACE_VIOLATION',
            severity: 'medium',
            observedAt,
            modulePath: surface.surfaceModule,
            description: `Public surface ${surface.surfaceModule} exposes multiple authority domains.`,
            impact:
              'Callers can assemble cross-authority intelligence without IntelligenceOrchestrator.',
            resolutionStrategy:
              'Classify the surface as orchestrator-owned, single-authority, shared-neutral, or test-only before enforcement.',
            evidence: [
              surface.evidence ?? surface.surfaceModule,
              ...Array.from(authorities).sort(),
            ],
          })
        );
      }
    }

    return violations;
  }
}

function isForbiddenAuthorityEdge(source: AuthorityType, target: AuthorityType): boolean {
  if (source === target) return false;
  if (source === 'IntelligenceOrchestrator') return false;
  if (source === 'UnknownAuthority' || target === 'UnknownAuthority') return false;
  return DOMAIN_AUTHORITIES.includes(source) && DOMAIN_AUTHORITIES.includes(target);
}

function createViolation(input: {
  type: ViolationType;
  severity: ViolationSeverity;
  observedAt: string;
  description: string;
  impact: string;
  resolutionStrategy: string;
  modulePath?: string;
  sourceModule?: string;
  targetModule?: string;
  sourceAuthority?: AuthorityType;
  targetAuthority?: AuthorityType;
  evidence: readonly string[];
}): ViolationRecord {
  const identity = [
    input.type,
    input.modulePath,
    input.sourceModule,
    input.targetModule,
    input.sourceAuthority,
    input.targetAuthority,
    input.description,
  ]
    .filter(Boolean)
    .join('|');

  return {
    violationId: `constitutional-${hashString(identity)}`,
    type: input.type,
    severity: input.severity,
    observedAt: input.observedAt,
    enforcementMode: 'observe',
    status: 'observed',
    description: input.description,
    impact: input.impact,
    resolutionStrategy: input.resolutionStrategy,
    modulePath: input.modulePath ? normalizeDisplayPath(input.modulePath) : undefined,
    sourceModule: input.sourceModule ? normalizeDisplayPath(input.sourceModule) : undefined,
    targetModule: input.targetModule ? normalizeDisplayPath(input.targetModule) : undefined,
    sourceAuthority: input.sourceAuthority,
    targetAuthority: input.targetAuthority,
    evidence: input.evidence,
  };
}

function buildViolationSummary(violations: readonly ViolationRecord[]): ValidationResult['summary'] {
  const byType: Record<ViolationType, number> = {
    OWNERSHIP_VIOLATION: 0,
    AUTHORITY_VIOLATION: 0,
    DEPENDENCY_VIOLATION: 0,
    PUBLIC_SURFACE_VIOLATION: 0,
    REGISTRY_VIOLATION: 0,
  };
  const bySeverity: Record<ViolationSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const violation of violations) {
    byType[violation.type] += 1;
    bySeverity[violation.severity] += 1;
  }

  return {
    totalViolations: violations.length,
    byType,
    bySeverity,
  };
}

function normalizeDisplayPath(modulePath: string): string {
  return normalizeModulePath(modulePath).replace(/^src\//, 'src/');
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
