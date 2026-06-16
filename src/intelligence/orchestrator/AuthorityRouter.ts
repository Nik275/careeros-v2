/**
 * @fileoverview Routes orchestrator stages to registered authority facades.
 *
 * The router never accesses intelligence engines directly. It coordinates only
 * through Phase 4.1 authority facades.
 */

import type {
  AuditRecord,
  ConstitutionalEventEnvelope,
} from '../constitutional';
import { ConstitutionalOwnershipRegistry } from '../constitutional';
import { AuthorityCapabilityRegistry } from '../authorities/AuthorityCapabilityRegistry';
import type {
  AuthorityRegistrationRecord,
  AuthorityExecutionOptions,
  AuthorityExecutionValidationSnapshot,
  AuthorityFacadeMetadata,
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../authorities/AuthorityFacadeBase';
import {
  AuthorityRegistrationService,
  type AuthorityRegistryStatus,
} from '../authorities/AuthorityRegistrationService';
import { OptionGeneratorAuthorityFacade } from '../authorities/OptionGeneratorAuthorityFacade';
import { OutcomeTrackerAuthorityFacade } from '../authorities/OutcomeTrackerAuthorityFacade';
import { StudentUnderstandingAuthorityFacade } from '../authorities/StudentUnderstandingAuthorityFacade';
import type { OrchestratorExecutionStage } from './OrchestratorExecutionPlan';

export interface AuthorityRouteExecutionInput extends AuthorityExecutionOptions {
  operationName: string;
  operation?: () => unknown | Promise<unknown>;
}

export interface RoutedAuthorityExecutionResult {
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  result: unknown;
  registration: AuthorityRegistrationRecord;
  metadata: AuthorityFacadeMetadata;
  emittedEvents: readonly ConstitutionalEventEnvelope<Record<string, unknown>>[];
  auditRecord?: AuditRecord;
  validationSnapshot?: AuthorityExecutionValidationSnapshot;
}

export interface RoutedAuthority {
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  registration: AuthorityRegistrationRecord;
  metadata: AuthorityFacadeMetadata;
  registryModulePath: string;
  invoke(input: AuthorityRouteExecutionInput): Promise<RoutedAuthorityExecutionResult>;
}

export interface AuthorityRouterOptions {
  registry?: ConstitutionalOwnershipRegistry;
  capabilityRegistry?: AuthorityCapabilityRegistry;
  registrationService?: AuthorityRegistrationService;
  studentUnderstandingAuthority?: StudentUnderstandingAuthorityFacade;
  optionGeneratorAuthority?: OptionGeneratorAuthorityFacade;
  outcomeTrackerAuthority?: OutcomeTrackerAuthorityFacade;
  now?: () => string;
  onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
}

export class AuthorityRouter {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly capabilityRegistry: AuthorityCapabilityRegistry;
  private readonly registrationService: AuthorityRegistrationService;
  private readonly studentUnderstandingAuthority: StudentUnderstandingAuthorityFacade;
  private readonly optionGeneratorAuthority: OptionGeneratorAuthorityFacade;
  private readonly outcomeTrackerAuthority: OutcomeTrackerAuthorityFacade;
  private readonly now: () => string;

  constructor(options: AuthorityRouterOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.capabilityRegistry =
      options.capabilityRegistry ?? AuthorityCapabilityRegistry.createDefault();
    this.now = options.now ?? (() => new Date().toISOString());
    this.registrationService =
      options.registrationService ??
      new AuthorityRegistrationService({
        registry: this.registry,
        capabilityRegistry: this.capabilityRegistry,
        now: this.now,
        onEvent: options.onEvent,
      });
    this.studentUnderstandingAuthority =
      options.studentUnderstandingAuthority ??
      new StudentUnderstandingAuthorityFacade({
        registry: this.registry,
        now: this.now,
        onEvent: options.onEvent,
      });
    this.optionGeneratorAuthority =
      options.optionGeneratorAuthority ??
      new OptionGeneratorAuthorityFacade({
        registry: this.registry,
        now: this.now,
        onEvent: options.onEvent,
      });
    this.outcomeTrackerAuthority =
      options.outcomeTrackerAuthority ??
      new OutcomeTrackerAuthorityFacade({
        registry: this.registry,
        now: this.now,
        onEvent: options.onEvent,
      });

    this.ensureAllAuthoritiesRegistered();
  }

  getIntegrationStatus(): AuthorityRegistryStatus {
    return this.registrationService.getRegistryStatus();
  }

  resolveStage(stage: OrchestratorExecutionStage): RoutedAuthority {
    if (!stage.authority || !stage.capability) {
      throw new Error(`Execution stage ${stage.stageId} does not declare an authority route.`);
    }
    return this.resolveCapability(stage.capability);
  }

  resolveCapability(capability: DomainAuthorityCapability): RoutedAuthority {
    const authority = this.capabilityRegistry.requireAuthorityForCapability(capability);
    return this.createRoute(authority, capability, this.getFacadeForAuthority(authority));
  }

  private ensureAllAuthoritiesRegistered(): void {
    if (!this.registrationService.isRegistered('StudentUnderstandingAuthority')) {
      this.studentUnderstandingAuthority.register(this.registrationService);
    }
    if (!this.registrationService.isRegistered('OptionGeneratorAuthority')) {
      this.optionGeneratorAuthority.register(this.registrationService);
    }
    if (!this.registrationService.isRegistered('OutcomeTrackerAuthority')) {
      this.outcomeTrackerAuthority.register(this.registrationService);
    }
  }

  private createRoute(
    authority: DomainAuthorityType,
    capability: DomainAuthorityCapability,
    facade:
      | StudentUnderstandingAuthorityFacade
      | OptionGeneratorAuthorityFacade
      | OutcomeTrackerAuthorityFacade
  ): RoutedAuthority {
    const registration = this.registrationService.getRegistration(authority);
    if (!registration) {
      throw new Error(`${authority} is not registered with AuthorityRegistrationService.`);
    }

    const registryModulePath = this.registry.listByAuthority(authority)[0]?.modulePath;
    if (!registryModulePath) {
      throw new Error(`No registry-backed module path exists for ${authority}.`);
    }

    return {
      authority,
      capability,
      registration,
      metadata: facade.getAuthorityMetadata(),
      registryModulePath,
      invoke: async (input: AuthorityRouteExecutionInput) => {
        const eventStart = facade.getEmittedEvents().length;
        const auditStart = facade.getAuditHistory().length;
        const validationStart = facade.getValidationHistory().length;
        const operation = input.operation ?? (() => undefined);
        const options: AuthorityExecutionOptions = {
          ...input,
        };

        const result = await Promise.resolve(invokeFacade(facade, capability, input.operationName, operation, options));
        const emittedEvents = facade.getEmittedEvents().slice(eventStart);
        const auditRecord = facade.getAuditHistory().slice(auditStart).at(-1);
        const validationSnapshot = facade.getValidationHistory().slice(validationStart).at(-1);

        return {
          authority,
          capability,
          result,
          registration,
          metadata: facade.getAuthorityMetadata(),
          emittedEvents,
          auditRecord,
          validationSnapshot,
        };
      },
    };
  }

  private getFacadeForAuthority(
    authority: DomainAuthorityType
  ):
    | StudentUnderstandingAuthorityFacade
    | OptionGeneratorAuthorityFacade
    | OutcomeTrackerAuthorityFacade {
    switch (authority) {
      case 'StudentUnderstandingAuthority':
        return this.studentUnderstandingAuthority;
      case 'OptionGeneratorAuthority':
        return this.optionGeneratorAuthority;
      case 'OutcomeTrackerAuthority':
        return this.outcomeTrackerAuthority;
      default:
        throw new Error(`Unsupported authority route ${authority}.`);
    }
  }
}

function invokeFacade(
  facade:
    | StudentUnderstandingAuthorityFacade
    | OptionGeneratorAuthorityFacade
    | OutcomeTrackerAuthorityFacade,
  capability: DomainAuthorityCapability,
  operationName: string,
  operation: () => unknown | Promise<unknown>,
  options: AuthorityExecutionOptions
): unknown | Promise<unknown> {
  switch (capability) {
    case 'UNDERSTAND':
      return (facade as StudentUnderstandingAuthorityFacade).understand(operationName, operation, options);
    case 'GENERATE':
      return (facade as OptionGeneratorAuthorityFacade).generate(operationName, operation, options);
    case 'LEARN':
      return (facade as OutcomeTrackerAuthorityFacade).learn(operationName, operation, options);
    default:
      throw new Error(`Unsupported capability ${capability}.`);
  }
}
