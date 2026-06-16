import { describe, expect, it, vi } from 'vitest';
import { getConfidenceAuthority } from '@/intelligence/confidence';
import { ConfidenceAuthority } from '@/intelligence/confidence/ConfidenceAuthority';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { createRolloutConfig } from '../../rollout/RolloutConfig';
import { assessmentGoldenScenarios } from '../assessmentGoldenScenarios';
import { careerFitGoldenScenarios } from '../careerFitGoldenScenarios';
import { GoldenParityRunner } from '../GoldenParityRunner';

describe('Phase 5.3.1 runtime blocker regression tests', () => {
  it('@/intelligence/confidence resolves in the parity test runtime', () => {
    expect(getConfidenceAuthority).toBeTypeOf('function');
    expect(getConfidenceAuthority()).toBeDefined();
  });

  it('ConfidenceAuthority imports without duplicate declaration parse failure', () => {
    expect(ConfidenceAuthority).toBeTypeOf('function');
    expect(new ConfidenceAuthority({ enableCache: false })).toBeInstanceOf(ConfidenceAuthority);
  });

  it('assessment golden scenario production path executes at least one valid scenario', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const runner = new GoldenParityRunner({
      assessmentScenarios: [assessmentGoldenScenarios[0]],
      careerFitScenarios: [],
      now: fixedClock,
    });

    const result = await runner.runAssessmentBaseline();

    expect(result.results[0].productionExecutionStatus, result.results[0].failureDetails.join('; ')).toBe('SUCCEEDED');
    expect(result.results[0].authorityDryRunExecutionStatus, result.results[0].failureDetails.join('; ')).toBe('SUCCEEDED');
    expect(result.results[0].productionOutput).toBeDefined();
    expect(result.results[0].dryRunOutput).toBeDefined();
    expect(result.results[0].productionOutput).not.toBe(result.results[0].dryRunOutput);
  });

  it('career-fit golden scenario production path executes at least one valid scenario', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const runner = new GoldenParityRunner({
      assessmentScenarios: [],
      careerFitScenarios: [careerFitGoldenScenarios[0]],
      now: fixedClock,
    });

    const result = await runner.runCareerFitBaseline();

    expect(result.results[0].productionExecutionStatus, result.results[0].failureDetails.join('; ')).toBe('SUCCEEDED');
    expect(result.results[0].authorityDryRunExecutionStatus, result.results[0].failureDetails.join('; ')).toBe('SUCCEEDED');
    expect(result.results[0].productionOutput).toBeDefined();
    expect(result.results[0].dryRunOutput).toBeDefined();
    expect(result.results[0].productionOutput).not.toBe(result.results[0].dryRunOutput);
  });

  it('does not enable observe mode, dry-run bindings, telemetry, or rollout by default', () => {
    const observeConfig = createObserveModeConfig();
    const rolloutConfig = createRolloutConfig();

    expect(observeConfig.enabled).toBe(false);
    expect(observeConfig.dryRunBindingsEnabled).toBe(false);
    expect(observeConfig.telemetryEnabled).toBe(false);
    expect(rolloutConfig.globalEnabled).toBe(false);
    expect(rolloutConfig.explicitlyAllowCanaryLive).toBe(false);
  });

  it('does not replace production output or call the orchestrator as a live route', async () => {
    const productionOutput = Object.freeze({
      cognitive: {},
      confidence: { profileConfidence: 80, assessmentCompleteness: 80 },
    });
    let productionCallCount = 0;
    let dryRunCallCount = 0;
    const runner = new GoldenParityRunner({
      assessmentScenarios: [assessmentGoldenScenarios[0]],
      careerFitScenarios: [],
      assessmentRunner: {
        production: () => {
          productionCallCount += 1;
          return productionOutput;
        },
        dryRun: () => {
          dryRunCallCount += 1;
          return {
            cognitive: {},
            confidence: { profileConfidence: 80, assessmentCompleteness: 80 },
          };
        },
      },
      now: fixedClock,
    });

    const result = await runner.runAssessmentBaseline();

    expect(productionCallCount).toBe(1);
    expect(dryRunCallCount).toBe(1);
    expect(result.results[0].productionOutput).toBe(productionOutput);
    expect(result.results[0].dryRunOutput).not.toBe(productionOutput);
    expect(result.results[0].notes.join(' ')).not.toContain('IntelligenceOrchestrator');
  });
});

function fixedClock(): string {
  return '2026-06-06T00:00:00.000Z';
}
