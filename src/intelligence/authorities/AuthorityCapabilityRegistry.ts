/**
 * @fileoverview Canonical capability ownership registry for constitutional authorities.
 *
 * This registry centralizes capability-to-authority ownership so routing,
 * lifecycle planning, and authority registration all resolve from the same
 * source of truth.
 */

import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from './AuthorityFacadeBase';

export interface AuthorityCapabilityMetadata {
  capability: DomainAuthorityCapability;
  authority: DomainAuthorityType;
  title: string;
  description: string;
  observeOnly: boolean;
  ownedSystemExamples: readonly string[];
}

export interface CapabilityValidationResult {
  valid: boolean;
  requestedCapabilities: readonly DomainAuthorityCapability[];
  duplicateCapabilities: readonly DomainAuthorityCapability[];
  resolvedAuthorities: readonly DomainAuthorityType[];
  notes: readonly string[];
}

const DEFAULT_CAPABILITY_METADATA: readonly AuthorityCapabilityMetadata[] = [
  {
    capability: 'UNDERSTAND',
    authority: 'StudentUnderstandingAuthority',
    title: 'Student Understanding',
    description:
      'Assessment, profile interpretation, archetype inference, and student understanding.',
    observeOnly: true,
    ownedSystemExamples: [
      'assessment',
      'profile',
      'archetype',
      'student understanding',
      'psychological modeling',
    ],
  },
  {
    capability: 'GENERATE',
    authority: 'OptionGeneratorAuthority',
    title: 'Option Generation',
    description:
      'Recommendation, pathway generation, future simulation, market intelligence, and decision support.',
    observeOnly: true,
    ownedSystemExamples: [
      'recommendation',
      'career-fit',
      'pathway generation',
      'future simulation',
      'mentor intelligence',
      'decision intelligence',
    ],
  },
  {
    capability: 'LEARN',
    authority: 'OutcomeTrackerAuthority',
    title: 'Outcome Learning',
    description:
      'Outcome tracking, feedback processing, quality monitoring, and longitudinal learning.',
    observeOnly: true,
    ownedSystemExamples: [
      'outcome tracking',
      'feedback loops',
      'quality monitoring',
      'longitudinal learning',
    ],
  },
] as const;

export class AuthorityCapabilityRegistry {
  private readonly metadataByCapability: ReadonlyMap<
    DomainAuthorityCapability,
    AuthorityCapabilityMetadata
  >;
  private readonly capabilitiesByAuthority: ReadonlyMap<
    DomainAuthorityType,
    readonly AuthorityCapabilityMetadata[]
  >;

  constructor(definitions: readonly AuthorityCapabilityMetadata[] = DEFAULT_CAPABILITY_METADATA) {
    const capabilityMap = new Map<DomainAuthorityCapability, AuthorityCapabilityMetadata>();
    const authorityMap = new Map<DomainAuthorityType, AuthorityCapabilityMetadata[]>();

    for (const definition of definitions) {
      if (capabilityMap.has(definition.capability)) {
        throw new Error(`Duplicate capability registration for ${definition.capability}.`);
      }

      const frozenDefinition = Object.freeze({
        ...definition,
        ownedSystemExamples: Object.freeze([...definition.ownedSystemExamples]),
      });

      capabilityMap.set(definition.capability, frozenDefinition);
      const authorityEntries = authorityMap.get(definition.authority) ?? [];
      authorityEntries.push(frozenDefinition);
      authorityMap.set(definition.authority, authorityEntries);
    }

    this.metadataByCapability = capabilityMap;
    this.capabilitiesByAuthority = new Map(
      Array.from(authorityMap.entries()).map(([authority, entries]) => [
        authority,
        Object.freeze(
          [...entries].sort((left, right) => left.capability.localeCompare(right.capability))
        ),
      ])
    );
  }

  static createDefault(): AuthorityCapabilityRegistry {
    return new AuthorityCapabilityRegistry();
  }

  listCapabilities(): readonly AuthorityCapabilityMetadata[] {
    return Array.from(this.metadataByCapability.values());
  }

  listAuthorities(): readonly DomainAuthorityType[] {
    return Array.from(this.capabilitiesByAuthority.keys());
  }

  listCapabilitiesForAuthority(
    authority: DomainAuthorityType
  ): readonly AuthorityCapabilityMetadata[] {
    return this.capabilitiesByAuthority.get(authority) ?? [];
  }

  getMetadata(
    capability: DomainAuthorityCapability
  ): AuthorityCapabilityMetadata | undefined {
    return this.metadataByCapability.get(capability);
  }

  requireMetadata(capability: DomainAuthorityCapability): AuthorityCapabilityMetadata {
    const metadata = this.getMetadata(capability);
    if (!metadata) {
      throw new Error(`No authority capability metadata exists for ${capability}.`);
    }
    return metadata;
  }

  getAuthorityForCapability(
    capability: DomainAuthorityCapability
  ): DomainAuthorityType | undefined {
    return this.getMetadata(capability)?.authority;
  }

  requireAuthorityForCapability(
    capability: DomainAuthorityCapability
  ): DomainAuthorityType {
    return this.requireMetadata(capability).authority;
  }

  getOwnerMap(): Readonly<Record<DomainAuthorityCapability, DomainAuthorityType>> {
    return Object.freeze(
      Object.fromEntries(
        this.listCapabilities().map((metadata) => [metadata.capability, metadata.authority])
      ) as Record<DomainAuthorityCapability, DomainAuthorityType>
    );
  }

  validateRequestedCapabilities(
    requestedCapabilities: readonly DomainAuthorityCapability[]
  ): CapabilityValidationResult {
    const seen = new Set<DomainAuthorityCapability>();
    const duplicateCapabilities = new Set<DomainAuthorityCapability>();

    for (const capability of requestedCapabilities) {
      if (seen.has(capability)) {
        duplicateCapabilities.add(capability);
      }
      seen.add(capability);
      this.requireMetadata(capability);
    }

    const uniqueCapabilities = Array.from(seen);
    const resolvedAuthorities = Array.from(
      new Set(uniqueCapabilities.map((capability) => this.requireAuthorityForCapability(capability)))
    );

    return {
      valid: duplicateCapabilities.size === 0,
      requestedCapabilities: uniqueCapabilities,
      duplicateCapabilities: Array.from(duplicateCapabilities).sort(),
      resolvedAuthorities,
      notes: uniqueCapabilities.map(
        (capability) =>
          `${capability} is owned by ${this.requireAuthorityForCapability(capability)}.`
      ),
    };
  }
}
