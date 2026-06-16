/**
 * @fileoverview Phase 4.1 authority facade registration service.
 *
 * Tracks active authority facades against the read-only constitutional
 * ownership registry. This service does not route traffic or instantiate
 * intelligence engines.
 */

import {
  ConstitutionalOwnershipRegistry,
  createConstitutionalEvent,
  type ConstitutionalEventEnvelope,
} from '../constitutional';
import { AuthorityCapabilityRegistry } from './AuthorityCapabilityRegistry';
import type {
  AuthorityFacadeMetadata,
  AuthorityRegistrationRecord,
  DomainAuthorityCapability,
  DomainAuthorityType,
} from './AuthorityFacadeBase';

export interface AuthorityRegistrationServiceOptions {
  registry?: ConstitutionalOwnershipRegistry;
  capabilityRegistry?: AuthorityCapabilityRegistry;
  now?: () => string;
  onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
}

export interface AuthorityCoverageStatus {
  authority: DomainAuthorityType;
  expectedCapability: DomainAuthorityCapability;
  registered: boolean;
  ownedModuleCount: number;
  ownedDomains: readonly string[];
}

export interface AuthorityRegistryStatus {
  activeAuthorityCount: number;
  requiredAuthorityCount: number;
  registeredAuthorities: readonly DomainAuthorityType[];
  missingRequiredAuthorities: readonly DomainAuthorityType[];
  coverage: readonly AuthorityCoverageStatus[];
  registryHealthy: boolean;
  registryRecordCount: number;
  sourceDocument: string;
  sourceWave: string;
}

export class AuthorityRegistrationService {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly capabilityRegistry: AuthorityCapabilityRegistry;
  private readonly now: () => string;
  private readonly onEvent?: (event: ConstitutionalEventEnvelope<Record<string, unknown>>) => void;
  private readonly registrations = new Map<DomainAuthorityType, AuthorityRegistrationRecord>();
  private readonly facadeNames = new Set<string>();
  private readonly events: ConstitutionalEventEnvelope<Record<string, unknown>>[] = [];

  constructor(options: AuthorityRegistrationServiceOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.capabilityRegistry =
      options.capabilityRegistry ?? AuthorityCapabilityRegistry.createDefault();
    this.now = options.now ?? (() => new Date().toISOString());
    this.onEvent = options.onEvent;
  }

  registerAuthority(metadata: AuthorityFacadeMetadata): AuthorityRegistrationRecord {
    this.validateRegistration(metadata);

    const registration = Object.freeze({
      ...metadata,
      registered: true,
      ownedSystemExamples: Object.freeze([...metadata.ownedSystemExamples]),
      ownedDomains: Object.freeze([...metadata.ownedDomains]),
      registrationId: createRegistrationId(metadata.authority),
      status: 'active' as const,
      registeredAt: this.now(),
    });

    this.registrations.set(metadata.authority, registration);
    this.facadeNames.add(metadata.facadeName);
    this.emitRegistrationEvent(registration);

    return registration;
  }

  isRegistered(authority: DomainAuthorityType): boolean {
    return this.registrations.has(authority);
  }

  getRegistration(authority: DomainAuthorityType): AuthorityRegistrationRecord | undefined {
    return this.registrations.get(authority);
  }

  listActiveAuthorities(): readonly AuthorityRegistrationRecord[] {
    return Array.from(this.registrations.values()).sort((left, right) =>
      left.authority.localeCompare(right.authority)
    );
  }

  getRegistryStatus(): AuthorityRegistryStatus {
    const source = this.registry.getSourceMetadata();
    const registryHealth = this.registry.getHealth();
    const registeredAuthorities = this.listActiveAuthorities().map(
      (registration) => registration.authority
    );
    const requiredAuthorities = this.capabilityRegistry.listAuthorities();
    const missingRequiredAuthorities = requiredAuthorities.filter(
      (authority) => !this.registrations.has(authority)
    );

    return {
      activeAuthorityCount: this.registrations.size,
      requiredAuthorityCount: requiredAuthorities.length,
      registeredAuthorities,
      missingRequiredAuthorities,
      coverage: requiredAuthorities.map((authority) => {
        const registration = this.registrations.get(authority);
        const ownedRecords = this.registry.listByAuthority(authority);
        return {
          authority,
          expectedCapability: this.requireAuthorityCapability(authority),
          registered: registration !== undefined,
          ownedModuleCount: ownedRecords.length,
          ownedDomains: Array.from(new Set(ownedRecords.map((record) => record.domain))).sort(),
        };
      }),
      registryHealthy: registryHealth.healthy,
      registryRecordCount: registryHealth.totalRecords,
      sourceDocument: source.sourceDocument,
      sourceWave: source.sourceWave,
    };
  }

  getEmittedEvents(): readonly ConstitutionalEventEnvelope<Record<string, unknown>>[] {
    return [...this.events];
  }

  private validateRegistration(metadata: AuthorityFacadeMetadata): void {
    if (this.registrations.has(metadata.authority)) {
      throw new Error(`${metadata.authority} is already registered.`);
    }

    if (this.facadeNames.has(metadata.facadeName)) {
      throw new Error(`${metadata.facadeName} is already registered.`);
    }

    const expectedCapability = this.requireAuthorityCapability(metadata.authority);
    if (metadata.capability !== expectedCapability) {
      throw new Error(
        `${metadata.authority} must register capability ${expectedCapability}, received ${metadata.capability}.`
      );
    }

    const ownedRecords = this.registry.listByAuthority(metadata.authority);
    if (ownedRecords.length === 0) {
      throw new Error(`${metadata.authority} has no ownership records in the registry.`);
    }

    if (metadata.ownedModuleCount !== ownedRecords.length) {
      throw new Error(
        `${metadata.authority} metadata reports ${metadata.ownedModuleCount} records, registry has ${ownedRecords.length}.`
      );
    }
  }

  private emitRegistrationEvent(registration: AuthorityRegistrationRecord): void {
    const event = createConstitutionalEvent(
      'ownership.record.observed',
      {
        authority: registration.authority,
        facadeName: registration.facadeName,
        registrationId: registration.registrationId,
        ownedModuleCount: registration.ownedModuleCount,
      },
      {
        authority: registration.authority,
        occurredAt: this.now(),
      }
    );
    const storedEvent = event as ConstitutionalEventEnvelope<Record<string, unknown>>;
    this.events.push(storedEvent);

    try {
      this.onEvent?.(storedEvent);
    } catch {
      // Registration event observers must not affect registration state.
    }
  }

  private requireAuthorityCapability(
    authority: DomainAuthorityType
  ): DomainAuthorityCapability {
    const capabilities = this.capabilityRegistry.listCapabilitiesForAuthority(authority);
    const metadata = capabilities[0];
    if (!metadata) {
      throw new Error(`No capability registration exists for ${authority}.`);
    }
    return metadata.capability;
  }
}

export function createAuthorityRegistrationService(
  options: AuthorityRegistrationServiceOptions = {}
): AuthorityRegistrationService {
  return new AuthorityRegistrationService(options);
}

function createRegistrationId(authority: DomainAuthorityType): string {
  return `authority-registration-${authority}`;
}
