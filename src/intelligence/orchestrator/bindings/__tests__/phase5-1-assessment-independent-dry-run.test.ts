import { describe, expect, it } from 'vitest';
import { StudentUnderstandingAuthorityFacade } from '../../../authorities/StudentUnderstandingAuthorityFacade';
import { createRolloutConfig } from '../../rollout/RolloutConfig';
import { RolloutManager } from '../../rollout/RolloutManager';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveExecutionGuard } from '../../observe/ObserveExecutionGuard';
import { AssessmentObserveHook } from '../../observe/AssessmentObserveHook';
import { ObservePayloadSanitizer } from '../../observe/ObservePayloadSanitizer';
import { OrchestratorDriftDetector } from '../../observe/OrchestratorDriftDetector';
import { IntelligenceOrchestrator } from '../../IntelligenceOrchestrator';
import { AssessmentAuthorityBinding } from '../AssessmentAuthorityBinding';
import { AuthorityExecutionBindingRegistry } from '../AuthorityExecutionBindingRegistry';
import { DryRunAuthorityExecutionCoordinator } from '../DryRunAuthorityExecutionCoordinator';
import {
  compareNormalizedBindingOutputs,
  normalizeAssessmentBindingOutput,
} from '../BindingOutputNormalizer';
import type { AuthorityExecutionBindingResult } from '../AuthorityExecutionBindingTypes';
import type { ObserveModeRequest } from '../../observe/ObserveModeTypes';

describe('Phase 5.1 assessment independent dry-run parity', () => {
  it('keeps assessment independent dry-run disabled by default', () => {
    const config = createObserveModeConfig();

    expect(config.enableAssessmentIndependentDryRun).toBe(false);
    expect(config.assessmentDryRunMode).toBe('DISABLED');
    expect(config.assessmentParityComparisonEnabled).toBe(false);
  });

  it('does not execute assessment dry-run when observe mode is disabled', async () => {
    let executed = false;
    const result = await createCoordinator().execute(
      createAssessmentRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawAssessmentOutput();
        },
      }),
      createObserveModeConfig({
        enabled: false,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
        enableAssessmentIndependentDryRun: true,
        assessmentDryRunMode: 'INDEPENDENT_DRY_RUN',
        assessmentParityComparisonEnabled: true,
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('does not execute assessment dry-run when dry-run compare mode is disabled', async () => {
    let executed = false;
    const result = await createCoordinator().execute(
      createAssessmentRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawAssessmentOutput();
        },
      }),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: false,
        enableAssessmentIndependentDryRun: true,
        assessmentDryRunMode: 'INDEPENDENT_DRY_RUN',
        assessmentParityComparisonEnabled: true,
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('blocks assessment dry-run through the rollout kill switch', async () => {
    let executed = false;
    const manager = new RolloutManager({
      config: createRolloutConfig({ globalEnabled: true }),
    });
    const result = await createCoordinator(manager).execute(
      createAssessmentRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawAssessmentOutput();
        },
      }),
      createAssessmentPilotConfig()
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('captures assessment dry-run failure without mutating production output', async () => {
    const productionOutput = Object.freeze(createNormalizedAssessmentOutput());
    const result = await createCoordinator().execute(
      createAssessmentRequest({
        productionOutput,
        independentDryRunOperation: () => {
          throw new Error('assessment dry-run failed');
        },
      }),
      createAssessmentPilotConfig()
    );

    expect(result.comparisonStatus).toBe('BINDING_FAILED');
    expect(result.failure?.message).toBe('assessment dry-run failed');
    expect(productionOutput).toEqual(createNormalizedAssessmentOutput());
  });

  it('keeps production assessment output unchanged', async () => {
    const productionOutput = Object.freeze(createNormalizedAssessmentOutput());

    await createCoordinator().execute(
      createAssessmentRequest({
        productionOutput,
        independentDryRunOperation: () => createRawAssessmentOutput(),
      }),
      createAssessmentPilotConfig()
    );

    expect(productionOutput).toEqual(createNormalizedAssessmentOutput());
  });

  it('prevents nested assessment observe execution through the recursion guard', async () => {
    ObserveExecutionGuard.resetForTests();
    const calls: ObserveModeRequest[] = [];
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({ enabled: true }),
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });

    ObserveExecutionGuard.runWithoutObserve(() => {
      hook.observeProcessResponses({
        questions: [],
        responses: [],
        productionOutput: createRawAssessmentOutput(),
      });
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(ObserveExecutionGuard.getSnapshot().skippedRecursiveObserveCount).toBe(1);
  });

  it('ignores volatile fields during assessment normalization', () => {
    const comparison = compareNormalizedBindingOutputs({
      flowType: 'assessment',
      productionOutput: {
        ...createRawAssessmentOutput(),
        id: 'profile-1',
        generatedAt: '2026-01-01T00:00:00.000Z',
      },
      dryRunOutput: {
        ...createRawAssessmentOutput(),
        id: 'profile-2',
        generatedAt: '2026-01-02T00:00:00.000Z',
      },
    });

    expect(comparison.status).toBe('MATCHED');
    expect(comparison.differences).toEqual([]);
  });

  it('detects semantic assessment drift', () => {
    const comparison = compareNormalizedBindingOutputs({
      flowType: 'assessment',
      productionOutput: createRawAssessmentOutput(),
      dryRunOutput: {
        ...createRawAssessmentOutput(),
        confidence: {
          profileConfidence: 40,
          assessmentCompleteness: 70,
        },
      },
    });

    expect(comparison.status).toBe('DRIFT_DETECTED');
    expect(comparison.differences).toContain('profileConfidence');
  });

  it('requires independent comparable output for MATCHED', async () => {
    const result = await createPilotResult(createRawAssessmentOutput());
    const comparison = compareWithDetector(result);

    expect(result.independent).toBe(true);
    expect(comparison.status).toBe('MATCHED');
  });

  it('requires independent comparable output for DRIFT_DETECTED', async () => {
    const result = await createPilotResult({
      ...createRawAssessmentOutput(),
      confidence: {
        profileConfidence: 41,
        assessmentCompleteness: 70,
      },
    });
    const comparison = compareWithDetector(result);

    expect(result.independent).toBe(true);
    expect(comparison.status).toBe('DRIFT_DETECTED');
  });

  it('handles NOT_COMPARABLE honestly', async () => {
    const result = await createPilotResult('not an assessment output');
    const comparison = compareWithDetector(result);

    expect(result.comparisonStatus).toBe('NOT_COMPARABLE');
    expect(comparison.status).toBe('NOT_COMPARABLE');
    expect(comparison.status).not.toBe('MATCHED');
  });

  it('does not count SELF_MIRRORED as MATCHED', async () => {
    const result = await createCoordinator().execute(
      createAssessmentRequest(),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
      })
    );
    const comparison = compareWithDetector(result);

    expect(result.comparisonStatus).toBe('SELF_MIRRORED');
    expect(comparison.status).toBe('SELF_MIRRORED');
    expect(comparison.status).not.toBe('MATCHED');
  });

  it('removes raw student answers from sanitized telemetry payloads', () => {
    const sanitizer = new ObservePayloadSanitizer();
    const summary = sanitizer.sanitize({
      studentId: 'student-1',
      responses: [{ value: 'raw private answer' }],
      output: createRawAssessmentOutput(),
    });

    expect(JSON.stringify(summary.summary)).not.toContain('raw private answer');
    expect(summary.redactedFields).toContain('responses');
    expect(summary.hashedFields).toContain('studentId');
  });

  it('keeps IntelligenceOrchestrator free of direct AssessmentEngine imports', () => {
    const source = IntelligenceOrchestrator.toString();

    expect(source).not.toContain('AssessmentEngine');
    expect(source).not.toContain('assessment-engine');
  });

  it('normalizes raw assessment output into a stable comparable summary', () => {
    expect(normalizeAssessmentBindingOutput(createRawAssessmentOutput())).toEqual(
      createNormalizedAssessmentOutput()
    );
  });
});

function createCoordinator(rolloutManager?: RolloutManager): DryRunAuthorityExecutionCoordinator {
  const registry = new AuthorityExecutionBindingRegistry();
  registry.register(
    new AssessmentAuthorityBinding({
      facade: new StudentUnderstandingAuthorityFacade({ now: createClock() }),
      now: createClock(),
    })
  );
  return new DryRunAuthorityExecutionCoordinator({
    registry,
    rolloutManager,
    now: createClock(),
  });
}

async function createPilotResult(dryRunOutput: unknown): Promise<AuthorityExecutionBindingResult> {
  return createCoordinator().execute(
    createAssessmentRequest({
      independentDryRunOperation: () => dryRunOutput,
    }),
    createAssessmentPilotConfig()
  );
}

function compareWithDetector(bindingResult: AuthorityExecutionBindingResult) {
  const detector = new OrchestratorDriftDetector();
  return detector.compare({
    productionCall: createAssessmentRequest().productionCall,
    orchestratorCall: {
      requestId: 'orchestrator-assessment',
      status:
        bindingResult.comparisonStatus === 'INDEPENDENT_COMPARISON'
          ? 'INDEPENDENT_COMPARISON'
          : bindingResult.comparisonStatus,
      outputSnapshot: bindingResult.outputSnapshot,
      bindingResult,
      startedAt: '2026-06-06T00:00:00.000Z',
      completedAt: '2026-06-06T00:00:01.000Z',
      latencyMs: 1000,
    },
    compareOutputs: true,
  });
}

function createAssessmentPilotConfig() {
  return createObserveModeConfig({
    enabled: true,
    dryRunBindingsEnabled: true,
    enabledBindings: ['assessment.processResponses'],
    enableAssessmentIndependentDryRun: true,
    assessmentDryRunMode: 'INDEPENDENT_DRY_RUN',
    assessmentParityComparisonEnabled: true,
  });
}

function createAssessmentRequest(
  overrides: {
    productionOutput?: unknown;
    independentDryRunOperation?: () => unknown;
  } = {}
): ObserveModeRequest {
  const config = createAssessmentPilotConfig();
  return {
    observeRequestId: 'observe-assessment',
    traceId: 'trace-assessment',
    productionCall: {
      callId: 'production-assessment',
      flowName: 'assessment',
      sourceModule: 'src/assessment/assessment-engine.ts',
      operationName: 'processResponses',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      capability: 'UNDERSTAND',
      timestamp: '2026-06-06T00:00:00.000Z',
      inputSnapshot: {
        questionCount: 2,
        responseCount: 2,
      },
      outputSnapshot:
        'productionOutput' in overrides
          ? overrides.productionOutput
          : createNormalizedAssessmentOutput(),
      metadata: {
        hook: 'AssessmentEngine.processResponses',
        authority: 'StudentUnderstandingAuthority',
      },
    },
    config,
    executionPayload: {
      independentDryRunOperation: overrides.independentDryRunOperation,
    },
    metadata: {},
  };
}

function createRawAssessmentOutput(): Record<string, unknown> {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    strengths: {
      topStrengths: ['Analytical Thinking'],
    },
    weaknesses: {
      developmentAreas: ['Creative Thinking'],
    },
    confidence: {
      profileConfidence: 80,
      assessmentCompleteness: 70,
    },
    id: 'volatile-profile-id',
    generatedAt: '2026-06-06T00:00:00.000Z',
  };
}

function createNormalizedAssessmentOutput(): Record<string, unknown> {
  return {
    hasCognitiveProfile: true,
    hasMotivationProfile: true,
    hasLifestyleProfile: true,
    hasRiskProfile: true,
    hasWorkEnvironmentProfile: true,
    hasValuesProfile: true,
    profileConfidence: 80,
    assessmentCompleteness: 70,
    topStrengthCount: 1,
    developmentAreaCount: 1,
  };
}

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
