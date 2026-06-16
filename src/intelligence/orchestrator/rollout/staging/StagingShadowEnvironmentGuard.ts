/**
 * @fileoverview Deterministic non-production guard for staging shadow runs.
 */

import type { StagingShadowEnvironmentDecision } from './StagingShadowRunTypes';

export interface StagingShadowEnvironmentGuardInput {
  environment?: string;
  allowedEnvironments?: readonly string[];
  overrideEnvironment?: string;
  now?: string;
}

const PHASE_5_7_ALLOWED_ENVIRONMENTS = new Set(['test', 'development', 'local', 'staging']);
const PHASE_5_7_BLOCKED_ENVIRONMENTS = new Set(['production', 'prod', 'unknown']);

export class StagingShadowEnvironmentGuard {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluate(input: StagingShadowEnvironmentGuardInput = {}): StagingShadowEnvironmentDecision {
    const rawEnvironment = input.overrideEnvironment ?? input.environment;
    const normalizedEnvironment = normalizeEnvironment(rawEnvironment);
    const allowedEnvironments = new Set((input.allowedEnvironments ?? []).map(normalizeEnvironment));
    const decidedAt = input.now ?? this.now();

    if (PHASE_5_7_BLOCKED_ENVIRONMENTS.has(normalizedEnvironment)) {
      return decision({
        environment: rawEnvironment ?? 'undefined',
        normalizedEnvironment,
        allowed: false,
        reason: 'Phase 5.7 blocks production, prod, unknown, empty, and undefined environments.',
        evidence: [
          `normalizedEnvironment=${normalizedEnvironment}`,
          `overrideProvided=${input.overrideEnvironment !== undefined}`,
        ],
        decidedAt,
      });
    }

    if (!PHASE_5_7_ALLOWED_ENVIRONMENTS.has(normalizedEnvironment)) {
      return decision({
        environment: rawEnvironment ?? 'undefined',
        normalizedEnvironment,
        allowed: false,
        reason: 'Environment is not recognized as a Phase 5.7 non-production environment.',
        evidence: [`normalizedEnvironment=${normalizedEnvironment}`],
        decidedAt,
      });
    }

    if (!allowedEnvironments.has(normalizedEnvironment)) {
      return decision({
        environment: rawEnvironment ?? 'undefined',
        normalizedEnvironment,
        allowed: false,
        reason: 'Environment is safe in principle but was not explicitly allowed by run config.',
        evidence: [
          `normalizedEnvironment=${normalizedEnvironment}`,
          `allowedEnvironments=${Array.from(allowedEnvironments).join(',')}`,
        ],
        decidedAt,
      });
    }

    return decision({
      environment: rawEnvironment ?? 'undefined',
      normalizedEnvironment,
      allowed: true,
      reason: 'Environment is explicitly approved for Phase 5.7 staging shadow execution.',
      evidence: [
        `normalizedEnvironment=${normalizedEnvironment}`,
        `allowedEnvironments=${Array.from(allowedEnvironments).join(',')}`,
      ],
      decidedAt,
    });
  }
}

function decision(input: StagingShadowEnvironmentDecision): StagingShadowEnvironmentDecision {
  return Object.freeze({
    ...input,
    evidence: Object.freeze([...input.evidence]),
  });
}

function normalizeEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}
