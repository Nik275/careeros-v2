import { describe, expect, it } from 'vitest';
import { createConfidenceCalculator as createAssessmentConfidenceCalculator } from '../../../../../assessment/confidence-calculator';
import { createRouteShadowApproval } from '../../route-shadow/RouteShadowApprovalFactory';
import { DeploymentReadinessChecker } from '../DeploymentReadinessChecker';
import { evaluateDeploymentReadinessCIGate } from '../DeploymentReadinessCIGate';

describe('Phase 6.6 build unblock readiness', () => {
  it('detects build-ready status when build passes and staging contract is safe', () => {
    const readiness = checker().check({
      env: validEnv(),
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });

    expect(readiness.activationDecision).toBe('READY_FOR_DEPLOYED_SMOKE');
    expect(readiness.buildStatus).toBe('BUILD_READY');
    expect(readiness.deployedHttpRequestsSent).toBe(false);
  });

  it('reports build blockers honestly when build fails', () => {
    const readiness = checker().check({
      env: validEnv(),
      config: { enabled: true },
      buildStatus: 'BUILD_BLOCKED_BY_TYPESCRIPT',
    });

    expect(readiness.activationDecision).toBe('BLOCKED_BY_BUILD');
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('build-not-ready');
  });

  it('keeps missing staging URL as a blocked/warning condition, not a fake pass', () => {
    const readiness = checker().check({
      env: {},
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });
    const gate = evaluateDeploymentReadinessCIGate({ readiness });

    expect(readiness.stagingUrlConfigured).toBe(false);
    expect(readiness.deployedHttpRequestsSent).toBe(false);
    expect(gate.status).toBe('PASS_WITH_WARNINGS');
  });

  it('keeps live modes and unsafe payload behavior blocked', () => {
    expect(() => approval('CANARY_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);
    expect(() => approval('FULL_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);

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

  it('keeps deprecated assessment confidence threshold helper typed and operational', () => {
    const calculator = createAssessmentConfidenceCalculator({ minTotalQuestions: 1, minQuestionsPerDimension: 1 });
    const confidence = calculator.calculateConfidence(
      [
        { questionId: 'q1', dimension: 'analyticalThinking', strength: 80, confidence: 80, category: 'cognitive', weight: 1 },
        { questionId: 'q2', dimension: 'creativity', strength: 75, confidence: 75, category: 'cognitive', weight: 1 },
        { questionId: 'q3', dimension: 'leadership', strength: 70, confidence: 70, category: 'motivation', weight: 1 },
      ],
      [
        { questionId: 'q1', type: 'likert', value: 5 },
      ]
    );

    expect(confidence.confidence).toBeGreaterThan(0);
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(confidence.level);
    expect(calculator.meetsThreshold(confidence, 'LOW')).toBe(true);
  });
});

function checker() {
  return new DeploymentReadinessChecker({ now: () => '2026-06-06T00:00:00.000Z' });
}

function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-6-test',
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
    reason: 'Phase 6.6 live-mode block regression.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    requestedScope: scope,
  });
}
