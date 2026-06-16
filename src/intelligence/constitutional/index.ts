/**
 * @fileoverview CareerOS constitutional foundation layer.
 *
 * Phase 4.0 exports observe-only registry, validation, audit, type, and event
 * definitions. Nothing in this module redirects traffic or changes business
 * behavior.
 */

export * from './ConstitutionalTypes';
export * from './ConstitutionalEvents';
export * from './ConstitutionalOwnershipRegistry';
export * from './ConstitutionalValidator';
export * from './ConstitutionalAuditService';
export {
  CONSTITUTIONAL_OWNERSHIP_RECORDS,
  GENERATED_OWNERSHIP_SOURCE,
} from './ownership-data.generated';
