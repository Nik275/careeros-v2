/**
 * @fileoverview Golden parity validation harness.
 */

import { compareNormalizedBindingOutputs } from '../bindings/BindingOutputNormalizer';
import { ObservePayloadSanitizer } from '../observe/ObservePayloadSanitizer';
import { calculateGoldenParityMetrics } from './GoldenParityMetrics';
import type {
  GoldenParityReport,
  GoldenParityStatus,
  GoldenScenario,
  GoldenScenarioResult,
} from './GoldenScenarioTypes';

export interface GoldenParityRunner {
  production: (scenario: GoldenScenario) => unknown | Promise<unknown>;
  dryRun: (scenario: GoldenScenario) => unknown | Promise<unknown>;
}

export interface GoldenParityHarnessOptions {
  assessmentRunner?: GoldenParityRunner;
  careerFitRunner?: GoldenParityRunner;
  sanitizer?: ObservePayloadSanitizer;
  now?: () => string;
}

export class GoldenParityHarness {
  private readonly assessmentRunner?: GoldenParityRunner;
  private readonly careerFitRunner?: GoldenParityRunner;
  private readonly sanitizer: ObservePayloadSanitizer;
  private readonly now: () => string;

  constructor(options: GoldenParityHarnessOptions = {}) {
    this.assessmentRunner = options.assessmentRunner;
    this.careerFitRunner = options.careerFitRunner;
    this.sanitizer = options.sanitizer ?? new ObservePayloadSanitizer();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async runAssessmentScenario(scenario: GoldenScenario): Promise<GoldenScenarioResult> {
    return this.runScenario(scenario);
  }

  async runCareerFitScenario(scenario: GoldenScenario): Promise<GoldenScenarioResult> {
    return this.runScenario(scenario);
  }

  async runScenarioBatch(scenarios: readonly GoldenScenario[]): Promise<readonly GoldenScenarioResult[]> {
    const results: GoldenScenarioResult[] = [];
    for (const scenario of scenarios) {
      results.push(await this.runScenario(scenario));
    }
    return results;
  }

  generateParityReport(results: readonly GoldenScenarioResult[]): GoldenParityReport {
    const metrics = calculateGoldenParityMetrics(results);
    return {
      reportId: `golden-parity-${hashString(`${this.now()}|${results.length}`)}`,
      generatedAt: this.now(),
      totalScenarios: results.length,
      results,
      metrics,
      criticalGaps: results
        .filter((result) => result.riskLevel === 'CRITICAL' && result.status !== 'MATCHED')
        .flatMap((result) => [`${result.scenarioId}: ${result.status}`]),
    };
  }

  private async runScenario(scenario: GoldenScenario): Promise<GoldenScenarioResult> {
    const runner = scenario.flowType === 'assessment' ? this.assessmentRunner : this.careerFitRunner;
    if (!runner) {
      return this.createResult(scenario, {
        status: 'SKIPPED',
        driftDetails: [],
        failureDetails: ['No runner configured for scenario flow.'],
        notes: ['Scenario skipped because no runner was configured.'],
      });
    }

    let productionOutput: unknown;
    try {
      productionOutput = await runner.production(scenario);
    } catch (error) {
      return this.createResult(scenario, {
        status: 'FAILED',
        driftDetails: [],
        failureDetails: [`Production runner failed: ${describeError(error)}`],
        notes: ['Production output remains authoritative; scenario failed before comparison.'],
      });
    }

    try {
      const dryRunOutput = await runner.dryRun(scenario);
      if (dryRunOutput === productionOutput) {
        return this.createResult(scenario, {
          status: 'SELF_MIRRORED',
          productionOutput,
          dryRunOutput,
          driftDetails: [],
          failureDetails: [],
          notes: ['Dry-run returned the same object reference as production output.'],
        });
      }

      const comparison = compareNormalizedBindingOutputs({
        flowType: scenario.flowType,
        productionOutput,
        dryRunOutput,
      });
      const status: GoldenParityStatus = comparison.status;

      return this.createResult(scenario, {
        status,
        productionOutput,
        dryRunOutput,
        normalizedProduction: comparison.normalizedProduction,
        normalizedDryRun: comparison.normalizedDryRun,
        driftDetails: comparison.differences,
        failureDetails: [],
        notes: [`Golden parity comparison completed with ${status}.`],
      });
    } catch (error) {
      return this.createResult(scenario, {
        status: 'FAILED',
        productionOutput,
        driftDetails: [],
        failureDetails: [`Dry-run runner failed: ${describeError(error)}`],
        notes: ['Dry-run failure was captured without mutating production output.'],
      });
    }
  }

  private createResult(
    scenario: GoldenScenario,
    input: {
      status: GoldenParityStatus;
      productionOutput?: unknown;
      dryRunOutput?: unknown;
      normalizedProduction?: unknown;
      normalizedDryRun?: unknown;
      driftDetails: readonly string[];
      failureDetails: readonly string[];
      notes: readonly string[];
    }
  ): GoldenScenarioResult {
    return {
      scenarioId: scenario.scenarioId,
      flowType: scenario.flowType,
      status: input.status,
      riskLevel: scenario.expectedBehavior.riskLevel,
      productionOutput: input.productionOutput,
      dryRunOutput: input.dryRunOutput,
      normalizedProduction: input.normalizedProduction,
      normalizedDryRun: input.normalizedDryRun,
      driftDetails: input.driftDetails,
      failureDetails: input.failureDetails,
      payloadSummary: this.sanitizer.sanitize(scenario.input.payload),
      notes: input.notes,
    };
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
