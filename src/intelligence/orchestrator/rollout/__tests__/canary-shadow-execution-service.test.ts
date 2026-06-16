import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import type { ObserveModeRequest } from '../../observe/ObserveModeTypes';
import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';

describe('CanaryShadowExecutionService', () => {
  it('executes assessment shadow through dry-run binding when all gates pass', async () => {
    const productionOutput = assessmentProductionSnapshot();
    const service = createService('assessment');

    const record = await service.execute({
      request: request({
        flowName: 'assessment',
        productionOutput,
        dryRunOutput: assessmentRawOutput(),
      }),
      productionOutput,
    });

    expect(record.status).toBe('COMPLETED');
    expect(record.comparison.status).toBe('MATCHED');
    expect(record.productionOutputPreserved).toBe(true);
  });

  it('executes career-fit shadow through dry-run binding when all gates pass', async () => {
    const productionOutput = careerFitProductionSnapshot();
    const service = createService('career-fit');

    const record = await service.execute({
      request: request({
        flowName: 'career-fit',
        productionOutput,
        dryRunOutput: careerFitRawOutput(),
      }),
      productionOutput,
    });

    expect(record.status).toBe('COMPLETED');
    expect(record.comparison.status).toBe('MATCHED');
    expect(record.bindingResult?.bindingId).toBe('career-fit.calculateFit');
  });

  it('does not mutate production output when shadow execution fails', async () => {
    const productionOutput = Object.freeze({ stable: true });
    const service = new CanaryShadowExecutionService({
      config: canaryConfig('assessment'),
      manualApproval: approval('assessment'),
      defaultGateInputs: gateInputs(),
      bindingCoordinator: {
        execute: async () => {
          throw new Error('shadow failed');
        },
      },
      now,
    });

    const record = await service.execute({
      request: request({
        flowName: 'assessment',
        productionOutput,
        dryRunOutput: assessmentRawOutput(),
      }),
      productionOutput,
    });

    expect(record.status).toBe('FAILED');
    expect(productionOutput).toEqual({ stable: true });
  });

  it('detects drift and rolls back without changing production output', async () => {
    const productionOutput = assessmentProductionSnapshot();
    const service = createService('assessment');

    const record = await service.execute({
      request: request({
        flowName: 'assessment',
        productionOutput,
        dryRunOutput: assessmentRawOutput({
          confidence: {
            profileConfidence: 50,
            assessmentCompleteness: 90,
          },
        }),
      }),
      productionOutput,
    });

    expect(record.comparison.status).toBe('DRIFT_DETECTED');
    expect(record.status).toBe('ROLLED_BACK');
    expect(service.getRollbackPolicy().isFlowDisabled('assessment')).toBe(true);
    expect(productionOutput).toEqual(assessmentProductionSnapshot());
  });

  it('creates audit records for skipped and completed shadow decisions', async () => {
    const auditService = new CanaryShadowAuditService();
    const service = new CanaryShadowExecutionService({
      config: createCanaryShadowConfig(),
      auditService,
      now,
    });

    const record = await service.execute({
      request: request({
        flowName: 'assessment',
        productionOutput: assessmentProductionSnapshot(),
        dryRunOutput: assessmentRawOutput(),
      }),
    });

    expect(record.status).toBe('DISABLED');
    expect(auditService.listRecords().length).toBe(1);
  });

  it('keeps raw student payloads out of payload summaries by default', async () => {
    const service = createService('assessment');
    const record = await service.execute({
      request: request({
        flowName: 'assessment',
        productionOutput: assessmentProductionSnapshot(),
        dryRunOutput: assessmentRawOutput(),
      }),
    });

    expect(record.payloadSummary).toBeUndefined();
    expect(JSON.stringify(record)).not.toContain('raw answer text');
  });
});

function createService(flow: 'assessment' | 'career-fit'): CanaryShadowExecutionService {
  return new CanaryShadowExecutionService({
    config: canaryConfig(flow),
    manualApproval: approval(flow),
    defaultGateInputs: gateInputs(),
    now,
  });
}

function canaryConfig(flow: 'assessment' | 'career-fit') {
  return createCanaryShadowConfig({
    globalShadowEnabled: true,
    allowedFlows: [flow],
    sampleRate: 1,
    maxExecutionsPerMinute: 10,
    maxLatencyMs: 1000,
  });
}

function gateInputs() {
  return {
    rolloutGateApproved: true,
    expandedParityCIGatePassed: true,
    privacySafe: true,
    telemetryHealthy: true,
    killSwitchActive: false,
    flowKillSwitchActive: false,
  };
}

function approval(flow: 'assessment' | 'career-fit'): ManualApprovalRecord {
  return {
    approvalId: `approval-${flow}`,
    approvedBy: 'phase-5-5-test',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    scope: 'CANARY_SHADOW',
    flows: [flow],
    maxSampleRate: 1,
    reason: 'Controlled shadow test approval.',
    evidence: [],
    status: 'APPROVED',
  };
}

function request(input: {
  flowName: 'assessment' | 'career-fit';
  productionOutput: unknown;
  dryRunOutput: unknown;
}): ObserveModeRequest {
  const assessment = input.flowName === 'assessment';
  return {
    observeRequestId: `observe-${input.flowName}`,
    traceId: `trace-${input.flowName}`,
    productionCall: {
      callId: `production-${input.flowName}`,
      flowName: input.flowName,
      sourceModule: assessment ? 'src/assessment/assessment-engine.ts' : 'src/career-fit/career-fit-engine.ts',
      operationName: assessment ? 'processResponses' : 'calculateFit',
      studentId: 'student-1',
      requestType: assessment ? 'UNDERSTAND' : 'GENERATE',
      capability: assessment ? 'UNDERSTAND' : 'GENERATE',
      timestamp: now(),
      inputSnapshot: {
        responseCount: 1,
      },
      outputSnapshot: input.productionOutput,
      metadata: {
        hook: assessment ? 'AssessmentEngine.processResponses' : 'CareerFitEngine.calculateFit',
        authority: assessment ? 'StudentUnderstandingAuthority' : 'OptionGeneratorAuthority',
      },
    },
    config: createObserveModeConfig({
      enabled: true,
      captureRawPayloads: false,
    }),
    executionPayload: {
      independentDryRunOperation: () => input.dryRunOutput,
    },
    metadata: {},
  };
}

function assessmentProductionSnapshot() {
  return {
    hasCognitiveProfile: true,
    hasMotivationProfile: true,
    hasLifestyleProfile: true,
    hasRiskProfile: true,
    hasWorkEnvironmentProfile: true,
    hasValuesProfile: true,
    profileConfidence: 80,
    assessmentCompleteness: 90,
    topStrengthCount: 1,
    developmentAreaCount: 1,
  };
}

function assessmentRawOutput(overrides: Record<string, unknown> = {}) {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: {
      profileConfidence: 80,
      assessmentCompleteness: 90,
    },
    strengths: {
      topStrengths: ['Analytical Thinking'],
    },
    weaknesses: {
      developmentAreas: ['Creative Thinking'],
    },
    rawAnswer: 'raw answer text',
    ...overrides,
  };
}

function careerFitProductionSnapshot() {
  return {
    careerId: 'career-1',
    studentProfileId: 'student-1',
    overallFitScore: 88,
    fitLevel: 'EXCELLENT',
    confidenceOverall: 92,
    confidenceLevel: 'HIGH',
    strengthCount: 1,
    concernCount: 0,
  };
}

function careerFitRawOutput() {
  return {
    careerId: 'career-1',
    studentProfileId: 'student-1',
    overallFitScore: 88,
    fitLevel: 'EXCELLENT',
    confidence: {
      overall: 92,
      level: 'HIGH',
    },
    strengths: ['Cognitive fit'],
    concerns: [],
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
