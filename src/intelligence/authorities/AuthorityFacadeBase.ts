/**
 * @fileoverview Base class for Phase 4.1 constitutional authority facades.
 *
 * Facades are wrap-only infrastructure. They validate, emit observe-mode
 * constitutional events, and generate audits without changing wrapped engine
 * inputs, outputs, routing, or algorithms.
 */

import {
  ConstitutionalAuditService,
  ConstitutionalOwnershipRegistry,
  ConstitutionalValidator,
  createConstitutionalEvent,
  type AuditRecord,
  type AuthorityType,
  type AuthorityUsageRecord,
  type ConstitutionalCapability,
  type ConstitutionalEventEnvelope,
  type ConstitutionalEventType,
  type DependencyRelationship,
  type PublicSurfaceRecord,
  type ValidationResult,
} from '../constitutional';

export type DomainAuthorityType =
  | 'StudentUnderstandingAuthority'
  | 'OptionGeneratorAuthority'
  | 'OutcomeTrackerAuthority';

export type DomainAuthorityCapability = 'UNDERSTAND' | 'GENERATE' | 'LEARN';

export type AuthorityOperation<TResult> = () => TResult | Promise<TResult>;

export interface AuthorityFacadeDefinition {
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  facadeName: string;
  facadeModulePath: string;
  version: string;
  description: string;
  ownedSystemExamples: readonly string[];
}

export interface AuthorityFacadeMetadata extends AuthorityFacadeDefinition {
  registered: boolean;
  ownedModuleCount: number;
  ownedDomains: readonly string[];
  registrySourceDocument: string;
  registrySourceWave: string;
}

export interface AuthorityRegistrationRecord extends AuthorityFacadeMetadata {
  registrationId: string;
  status: 'active';
  registeredAt: string;
}

export interface AuthorityRegistrar {
  registerAuthority(metadata: AuthorityFacadeMetadata): AuthorityRegistrationRecord;
}

export interface AuthorityFacadeBaseOptions {
  registry?: ConstitutionalOwnershipRegistry;
  validator?: ConstitutionalValidator;
  auditService?: ConstitutionalAuditService;
  now?: () => string;
  onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
}

export interface AuthorityExecutionContext {
  operationName: string;
  modulePath?: string;
  modulePaths?: readonly string[];
  capability?: ConstitutionalCapability;
  dependencies?: readonly DependencyRelationship[];
  authorityUsages?: readonly AuthorityUsageRecord[];
  publicSurfaces?: readonly PublicSurfaceRecord[];
  auditNotes?: readonly string[];
  eventPayload?: Record<string, unknown>;
}

export type AuthorityExecutionOptions = Omit<AuthorityExecutionContext, 'operationName'>;

export interface AuthorityBoundaryObservation {
  observationId: string;
  type: 'unowned-module' | 'wrong-authority' | 'wrong-capability';
  authority: DomainAuthorityType;
  expectedCapability: DomainAuthorityCapability;
  modulePath?: string;
  observedOwner?: AuthorityType;
  observedCapability?: ConstitutionalCapability;
  requestedCapability?: ConstitutionalCapability;
  observedAt: string;
  evidence: readonly string[];
}

export interface AuthorityBoundaryValidationResult {
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  observedAt: string;
  checkedModules: number;
  valid: boolean;
  observations: readonly AuthorityBoundaryObservation[];
}

export interface AuthorityExecutionValidationSnapshot {
  authority: DomainAuthorityType;
  operationName: string;
  observedAt: string;
  ownership: AuthorityBoundaryValidationResult;
  capability: AuthorityBoundaryValidationResult;
  access: ValidationResult;
}

export abstract class AuthorityFacadeBase {
  private readonly definition: AuthorityFacadeDefinition;
  protected readonly registry: ConstitutionalOwnershipRegistry;
  protected readonly validator: ConstitutionalValidator;
  protected readonly auditService: ConstitutionalAuditService;
  private readonly now: () => string;
  private readonly onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
  private readonly emittedEvents: ConstitutionalEventEnvelope<Record<string, unknown>>[] = [];
  private readonly auditHistory: AuditRecord[] = [];
  private readonly validationHistory: AuthorityExecutionValidationSnapshot[] = [];
  private registeredAuthority?: AuthorityRegistrationRecord;

  protected constructor(definition: AuthorityFacadeDefinition, options: AuthorityFacadeBaseOptions = {}) {
    this.definition = Object.freeze({
      ...definition,
      ownedSystemExamples: Object.freeze([...definition.ownedSystemExamples]),
    });
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.now = options.now ?? (() => new Date().toISOString());
    this.validator =
      options.validator ??
      new ConstitutionalValidator({
        registry: this.registry,
        observedAt: this.now,
      });
    this.auditService =
      options.auditService ??
      new ConstitutionalAuditService({
        registry: this.registry,
        now: this.now,
      });
    this.onEvent = options.onEvent;
  }

  register(registrar: AuthorityRegistrar): AuthorityRegistrationRecord {
    const registration = registrar.registerAuthority(this.getAuthorityMetadata());
    this.registeredAuthority = registration;
    this.emitEvent('ownership.record.observed', {
      authority: this.definition.authority,
      facadeName: this.definition.facadeName,
      registrationId: registration.registrationId,
      ownedModuleCount: registration.ownedModuleCount,
    });

    const validation = this.validator.validate({
      modulePaths: this.getOwnedModulePaths(),
    });
    this.audit('register', validation, [], [
      `Registered ${this.definition.facadeName} for ${this.definition.authority}.`,
    ]);

    return registration;
  }

  validateOwnership(context: AuthorityExecutionContext): AuthorityBoundaryValidationResult {
    const observedAt = this.now();
    const modulePaths = this.collectModulePaths(context);
    const observations: AuthorityBoundaryObservation[] = [];

    for (const modulePath of modulePaths) {
      const record = this.registry.getRecord(modulePath);

      if (!record) {
        observations.push(
          this.createBoundaryObservation({
            type: 'unowned-module',
            observedAt,
            modulePath,
            evidence: [`${modulePath} is not present in ConstitutionalOwnershipRegistry.`],
          })
        );
        continue;
      }

      if (record.owner !== this.definition.authority) {
        observations.push(
          this.createBoundaryObservation({
            type: 'wrong-authority',
            observedAt,
            modulePath,
            observedOwner: record.owner,
            observedCapability: record.capability,
            evidence: [
              `${modulePath} is owned by ${record.owner}, not ${this.definition.authority}.`,
            ],
          })
        );
      }
    }

    return {
      authority: this.definition.authority,
      capability: this.definition.capability,
      observedAt,
      checkedModules: modulePaths.length,
      valid: observations.length === 0,
      observations,
    };
  }

  validateCapability(context: AuthorityExecutionContext): AuthorityBoundaryValidationResult {
    const observedAt = this.now();
    const requestedCapability = context.capability ?? this.definition.capability;
    const modulePaths = this.collectModulePaths(context);
    const observations: AuthorityBoundaryObservation[] = [];

    if (requestedCapability !== this.definition.capability) {
      observations.push(
        this.createBoundaryObservation({
          type: 'wrong-capability',
          observedAt,
          requestedCapability,
          evidence: [
            `${this.definition.facadeName} expected ${this.definition.capability} but received ${requestedCapability}.`,
          ],
        })
      );
    }

    for (const modulePath of modulePaths) {
      const record = this.registry.getRecord(modulePath);
      if (record && record.capability !== this.definition.capability) {
        observations.push(
          this.createBoundaryObservation({
            type: 'wrong-capability',
            observedAt,
            modulePath,
            observedOwner: record.owner,
            observedCapability: record.capability,
            requestedCapability,
            evidence: [
              `${modulePath} is classified as ${record.capability}, not ${this.definition.capability}.`,
            ],
          })
        );
      }
    }

    return {
      authority: this.definition.authority,
      capability: this.definition.capability,
      observedAt,
      checkedModules: modulePaths.length,
      valid: observations.length === 0,
      observations,
    };
  }

  validateAuthorityAccess(context: AuthorityExecutionContext): ValidationResult {
    const modulePaths = this.collectModulePaths(context);
    const facadeAuthorityUsages: AuthorityUsageRecord[] = modulePaths.map((modulePath) => ({
      sourceModule: modulePath,
      targetAuthority: this.definition.authority,
      operation: context.operationName,
      evidence: 'Phase 4.1 authority facade access validation.',
    }));

    return this.validator.validate({
      modulePaths,
      dependencies: context.dependencies ?? [],
      authorityUsages: [...facadeAuthorityUsages, ...(context.authorityUsages ?? [])],
      publicSurfaces: context.publicSurfaces ?? [],
    });
  }

  emitEvent<TPayload extends Record<string, unknown>>(
    eventType: ConstitutionalEventType,
    payload: TPayload
  ): ConstitutionalEventEnvelope<TPayload> {
    const event = createConstitutionalEvent(eventType, payload, {
      authority: this.definition.authority,
      occurredAt: this.now(),
    });
    const storedEvent = event as ConstitutionalEventEnvelope<Record<string, unknown>>;
    this.emittedEvents.push(storedEvent);

    try {
      this.onEvent?.(storedEvent);
    } catch {
      // Event observers are non-authoritative in Phase 4.1 and must not affect engine behavior.
    }

    return event;
  }

  audit(
    operationName: string,
    validationResult: ValidationResult,
    dependencyRelationships: readonly DependencyRelationship[] = [],
    notes: readonly string[] = []
  ): AuditRecord {
    const report = this.auditService.generateAuditReport({
      validationResult,
      dependencyRelationships,
      notes: [
        `Phase 4.1 ${this.definition.facadeName}.${operationName} audit.`,
        `Authority: ${this.definition.authority}.`,
        `Capability: ${this.definition.capability}.`,
        ...notes,
      ],
    });
    this.auditHistory.push(report.audit);
    this.emitEvent('audit.report.created', {
      authority: this.definition.authority,
      facadeName: this.definition.facadeName,
      operationName,
      auditId: report.audit.auditId,
      violationCount: report.audit.validationSummary.totalViolations,
    });
    return report.audit;
  }

  execute<TResult>(
    context: AuthorityExecutionContext,
    operation: () => Promise<TResult>
  ): Promise<TResult>;
  execute<TResult>(context: AuthorityExecutionContext, operation: () => TResult): TResult;
  execute<TResult>(
    context: AuthorityExecutionContext,
    operation: AuthorityOperation<TResult>
  ): TResult | Promise<TResult> {
    const validation = this.prepareExecution(context);

    try {
      const result = operation();

      if (isPromiseLike(result)) {
        return result
          .then((resolved) => {
            this.completeExecution(context, validation, 'completed');
            return resolved;
          })
          .catch((error: unknown) => {
            this.completeExecution(context, validation, 'failed', error);
            throw error;
          });
      }

      this.completeExecution(context, validation, 'completed');
      return result;
    } catch (error) {
      this.completeExecution(context, validation, 'failed', error);
      throw error;
    }
  }

  getAuthorityMetadata(): AuthorityFacadeMetadata {
    const records = this.registry.listByAuthority(this.definition.authority);
    const source = this.registry.getSourceMetadata();
    const ownedDomains = Array.from(new Set(records.map((record) => record.domain))).sort();

    return Object.freeze({
      ...this.definition,
      ownedSystemExamples: Object.freeze([...this.definition.ownedSystemExamples]),
      registered: this.registeredAuthority !== undefined,
      ownedModuleCount: records.length,
      ownedDomains: Object.freeze(ownedDomains),
      registrySourceDocument: source.sourceDocument,
      registrySourceWave: source.sourceWave,
    });
  }

  getRegistration(): AuthorityRegistrationRecord | undefined {
    return this.registeredAuthority;
  }

  getEmittedEvents(): readonly ConstitutionalEventEnvelope<Record<string, unknown>>[] {
    return [...this.emittedEvents];
  }

  getAuditHistory(): readonly AuditRecord[] {
    return [...this.auditHistory];
  }

  getValidationHistory(): readonly AuthorityExecutionValidationSnapshot[] {
    return [...this.validationHistory];
  }

  getLastValidationSnapshot(): AuthorityExecutionValidationSnapshot | undefined {
    return this.validationHistory.at(-1);
  }

  protected runWrappedOperation<TResult>(
    operationName: string,
    operation: () => Promise<TResult>,
    options?: AuthorityExecutionOptions
  ): Promise<TResult>;
  protected runWrappedOperation<TResult>(
    operationName: string,
    operation: () => TResult,
    options?: AuthorityExecutionOptions
  ): TResult;
  protected runWrappedOperation<TResult>(
    operationName: string,
    operation: AuthorityOperation<TResult>,
    options: AuthorityExecutionOptions = {}
  ): TResult | Promise<TResult> {
    return this.execute(
      {
        ...options,
        operationName,
        capability: options.capability ?? this.definition.capability,
      },
      operation
    );
  }

  private prepareExecution(context: AuthorityExecutionContext): AuthorityExecutionValidationSnapshot {
    this.emitEvent('authority.usage.observed', {
      authority: this.definition.authority,
      facadeName: this.definition.facadeName,
      operationName: context.operationName,
      modulePaths: this.collectModulePaths(context),
      payload: context.eventPayload ?? {},
    });
    this.emitEvent('validation.started', {
      authority: this.definition.authority,
      facadeName: this.definition.facadeName,
      operationName: context.operationName,
    });

    const ownership = this.validateOwnership(context);
    const capability = this.validateCapability(context);
    const access = this.validateAuthorityAccess(context);

    for (const violation of access.violations) {
      this.emitEvent('violation.observed', {
        authority: this.definition.authority,
        facadeName: this.definition.facadeName,
        operationName: context.operationName,
        violation,
      });
    }

    const snapshot: AuthorityExecutionValidationSnapshot = {
      authority: this.definition.authority,
      operationName: context.operationName,
      observedAt: this.now(),
      ownership,
      capability,
      access,
    };
    this.validationHistory.push(snapshot);

    this.emitEvent('validation.completed', {
      authority: this.definition.authority,
      facadeName: this.definition.facadeName,
      operationName: context.operationName,
      ownershipObservationCount: ownership.observations.length,
      capabilityObservationCount: capability.observations.length,
      violationCount: access.summary.totalViolations,
    });

    return snapshot;
  }

  private completeExecution(
    context: AuthorityExecutionContext,
    validation: AuthorityExecutionValidationSnapshot,
    status: 'completed' | 'failed',
    error?: unknown
  ): void {
    this.audit(context.operationName, validation.access, context.dependencies ?? [], [
      `Wrapped operation ${status}.`,
      `Ownership observations: ${validation.ownership.observations.length}.`,
      `Capability observations: ${validation.capability.observations.length}.`,
      ...(context.auditNotes ?? []),
      ...(error ? [`Wrapped operation error observed: ${describeError(error)}.`] : []),
    ]);
  }

  private collectModulePaths(context: AuthorityExecutionContext): readonly string[] {
    return Array.from(
      new Set([context.modulePath, ...(context.modulePaths ?? [])].filter(isStringWithValue))
    );
  }

  private getOwnedModulePaths(): readonly string[] {
    return this.registry
      .listByAuthority(this.definition.authority)
      .map((record) => record.modulePath);
  }

  private createBoundaryObservation(input: {
    type: AuthorityBoundaryObservation['type'];
    observedAt: string;
    modulePath?: string;
    observedOwner?: AuthorityType;
    observedCapability?: ConstitutionalCapability;
    requestedCapability?: ConstitutionalCapability;
    evidence: readonly string[];
  }): AuthorityBoundaryObservation {
    return {
      observationId: `authority-boundary-${hashString(
        [
          this.definition.authority,
          this.definition.capability,
          input.type,
          input.modulePath,
          input.observedOwner,
          input.observedCapability,
          input.requestedCapability,
        ]
          .filter(Boolean)
          .join('|')
      )}`,
      type: input.type,
      authority: this.definition.authority,
      expectedCapability: this.definition.capability,
      modulePath: input.modulePath,
      observedOwner: input.observedOwner,
      observedCapability: input.observedCapability,
      requestedCapability: input.requestedCapability,
      observedAt: input.observedAt,
      evidence: input.evidence,
    };
  }
}

function isPromiseLike<TResult>(value: TResult | Promise<TResult>): value is Promise<TResult> {
  return typeof value === 'object' && value !== null && 'then' in value;
}

function isStringWithValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
