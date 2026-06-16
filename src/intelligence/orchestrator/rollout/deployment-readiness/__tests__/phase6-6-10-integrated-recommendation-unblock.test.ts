import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../CanaryShadowConfig';
import { createRouteShadowApproval } from '../../route-shadow/RouteShadowApprovalFactory';
import { DeploymentReadinessChecker } from '../DeploymentReadinessChecker';
import { evaluateDeploymentReadinessCIGate } from '../DeploymentReadinessCIGate';

describe('Phase 6.6.10 IntegratedRecommendation unblock readiness', () => {
  it('documents IntegratedRecommendation as a local PathRecommendation alias', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-path-intelligence/types.ts'),
      'utf8'
    );

    expect(source).toContain('export type IntegratedRecommendation = PathRecommendation;');
    expect(source).toContain('export interface PathRecommendation');
  });

  it('keeps career-path type-only config symbols out of runtime barrel exports', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-path-intelligence/index.ts'),
      'utf8'
    );
    const runtimeExportBlocks = Array.from(source.matchAll(/export\s+\{([\s\S]*?)\}\s+from/g))
      .map((match) => match[1])
      .join('\n');

    expect(source).toContain('export type {');
    expect(runtimeExportBlocks).not.toMatch(/^\s*CareerPathIntelligenceEngineConfig,\s*$/m);
    expect(runtimeExportBlocks).not.toMatch(/^\s*PathComparisonEngineConfig,\s*$/m);
    expect(runtimeExportBlocks).not.toMatch(/^\s*PathExplanationEngineConfig,\s*$/m);
  });

  it('reports build blockers honestly when build still fails', () => {
    const readiness = checker().check({
      env: validEnv(),
      config: { enabled: true },
      buildStatus: 'BUILD_BLOCKED_BY_TYPESCRIPT',
    });

    expect(readiness.activationDecision).toBe('BLOCKED_BY_BUILD');
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('build-not-ready');
  });

  it('keeps missing staging URL blocked without fake deployed smoke proof', () => {
    const readiness = checker().check({
      env: { NODE_ENV: 'test' },
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });
    const gate = evaluateDeploymentReadinessCIGate({ readiness });

    expect(readiness.stagingUrlConfigured).toBe(false);
    expect(readiness.allowedHostsConfigured).toBe(false);
    expect(readiness.approvalConfigured).toBe(false);
    expect(readiness.deployedHttpRequestsSent).toBe(false);
    expect(gate.status).toBe('PASS_WITH_WARNINGS');
  });

  it('keeps CANARY_LIVE, FULL_LIVE, and default CANARY_SHADOW blocked', () => {
    expect(() => approval('CANARY_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);
    expect(() => approval('FULL_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
  });

  it('does not enable live routing or raw payload capture', () => {
    const readiness = checker().check({
      env: {
        ...validEnv(),
        CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true',
        CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true',
      },
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });

    expect(readiness.liveRoutingEnabled).toBe(false);
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('live-routing-enabled');
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('raw-payload-capture-enabled');
  });
});

function checker() {
  return new DeploymentReadinessChecker({ now: () => '2026-06-07T00:00:00.000Z' });
}

function validEnv(): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'test',
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-6-10-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
  };
}

function approval(scope: 'CANARY_LIVE' | 'FULL_LIVE') {
  return createRouteShadowApproval({
    approvedBy: 'test',
    environment: 'staging',
    allowedFlows: ['assessment'],
    allowedRoutes: ['/api/internal/constitutional-shadow/assessment'],
    maxExecutions: 1,
    reason: 'Phase 6.6.10 live-mode block regression.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    requestedScope: scope,
  });
}
