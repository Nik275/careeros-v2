/**
 * @fileoverview Read-only constitutional ownership registry.
 *
 * This registry maps current intelligence modules to constitutional owners.
 * It is observe-only infrastructure and does not affect application behavior.
 */

import type {
  AuthorityType,
  ConstitutionalCapability,
  ConstitutionalRegistryHealth,
  ConstitutionalRegistryQuery,
  OwnershipRecord,
  OwnershipSummary,
} from './ConstitutionalTypes';
import {
  CONSTITUTIONAL_OWNERSHIP_RECORDS,
  GENERATED_OWNERSHIP_SOURCE,
} from './ownership-data.generated';

const AUTHORITY_TYPES: readonly AuthorityType[] = [
  'StudentUnderstandingAuthority',
  'OptionGeneratorAuthority',
  'OutcomeTrackerAuthority',
  'IntelligenceOrchestrator',
  'DecisionAuthority',
  'ConfidenceAuthority',
  'UnknownAuthority',
] as const;

const CAPABILITY_TYPES: readonly ConstitutionalCapability[] = [
  'UNDERSTAND',
  'GENERATE',
  'LEARN',
  'ORCHESTRATE',
  'DECIDE',
  'CONFIDENCE',
  'SHARED',
  'UNKNOWN',
] as const;

export class ConstitutionalOwnershipRegistry {
  private readonly records: readonly OwnershipRecord[];
  private readonly recordsByModule: ReadonlyMap<string, OwnershipRecord>;
  private readonly duplicateModules: readonly string[];

  constructor(records: readonly OwnershipRecord[] = CONSTITUTIONAL_OWNERSHIP_RECORDS) {
    this.records = records.map((record) => freezeRecord(normalizeRecord(record)));

    const mutableMap = new Map<string, OwnershipRecord>();
    const duplicateSet = new Set<string>();

    for (const record of this.records) {
      const key = normalizeModulePath(record.modulePath);
      if (mutableMap.has(key)) {
        duplicateSet.add(record.modulePath);
        continue;
      }
      mutableMap.set(key, record);
    }

    this.recordsByModule = mutableMap;
    this.duplicateModules = Array.from(duplicateSet).sort();
  }

  static createDefault(): ConstitutionalOwnershipRegistry {
    return new ConstitutionalOwnershipRegistry();
  }

  getSourceMetadata(): typeof GENERATED_OWNERSHIP_SOURCE {
    return GENERATED_OWNERSHIP_SOURCE;
  }

  listRecords(): readonly OwnershipRecord[] {
    return this.records;
  }

  hasModule(modulePath: string): boolean {
    return this.recordsByModule.has(normalizeModulePath(modulePath));
  }

  getRecord(modulePath: string): OwnershipRecord | undefined {
    return this.recordsByModule.get(normalizeModulePath(modulePath));
  }

  getOwner(modulePath: string): AuthorityType | undefined {
    return this.getRecord(modulePath)?.owner;
  }

  listByAuthority(authority: AuthorityType): readonly OwnershipRecord[] {
    return this.records.filter((record) => record.owner === authority);
  }

  listByCapability(capability: ConstitutionalCapability): readonly OwnershipRecord[] {
    return this.records.filter((record) => record.capability === capability);
  }

  query(query: ConstitutionalRegistryQuery = {}): readonly OwnershipRecord[] {
    return this.records.filter((record) => {
      if (query.owner && record.owner !== query.owner) return false;
      if (query.capability && record.capability !== query.capability) return false;
      if (query.domain && record.domain !== query.domain) return false;
      if (query.status && record.metadata.status !== query.status) return false;
      if (query.modulePathIncludes && !record.modulePath.includes(query.modulePathIncludes)) {
        return false;
      }
      return true;
    });
  }

  getSummary(): OwnershipSummary {
    return {
      totalRecords: this.records.length,
      authorityCounts: countBy(this.records, AUTHORITY_TYPES, (record) => record.owner),
      capabilityCounts: countBy(this.records, CAPABILITY_TYPES, (record) => record.capability),
      domainCounts: countByDomain(this.records),
      sourceDocuments: Array.from(
        new Set(this.records.map((record) => record.metadata.sourceDocument))
      ).sort(),
    };
  }

  getHealth(): ConstitutionalRegistryHealth {
    const missingOwners = this.records
      .filter((record) => !record.owner || record.owner === 'UnknownAuthority')
      .map((record) => record.modulePath);

    const notes = [
      'Registry is read-only and observe-only for Phase 4.0.',
      'Records are generated from Wave3_3_IntelligenceOwnershipMap.md.',
    ];

    return {
      healthy: this.duplicateModules.length === 0 && missingOwners.length === 0,
      totalRecords: this.records.length,
      duplicateModules: this.duplicateModules,
      missingOwners,
      notes,
    };
  }
}

export function normalizeModulePath(modulePath: string): string {
  return modulePath.replaceAll('\\', '/').replace(/^\.\/+/, '').toLowerCase();
}

function normalizeRecord(record: OwnershipRecord): OwnershipRecord {
  return {
    ...record,
    modulePath: record.modulePath.replaceAll('\\', '/'),
    layer: record.layer ?? 'authority-internal',
  };
}

function freezeRecord(record: OwnershipRecord): OwnershipRecord {
  return Object.freeze({
    ...record,
    classNames: Object.freeze([...record.classNames]),
    functionNames: Object.freeze([...record.functionNames]),
    dependencies: Object.freeze([...record.dependencies]),
    consumers: Object.freeze([...record.consumers]),
    metadata: Object.freeze({ ...record.metadata }),
  });
}

function countBy<TKey extends string, TItem>(
  items: readonly TItem[],
  keys: readonly TKey[],
  selector: (item: TItem) => TKey
): Readonly<Record<TKey, number>> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<TKey, number>;
  for (const item of items) {
    counts[selector(item)] += 1;
  }
  return counts;
}

function countByDomain(records: readonly OwnershipRecord[]): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    counts[record.domain] = (counts[record.domain] ?? 0) + 1;
  }
  return counts;
}
