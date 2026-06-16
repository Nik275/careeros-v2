/**
 * @fileoverview Golden parity scenario contracts.
 */

export type GoldenParityStatus =
  | 'MATCHED'
  | 'DRIFT_DETECTED'
  | 'FAILED'
  | 'NOT_COMPARABLE'
  | 'SELF_MIRRORED'
  | 'SKIPPED';

export type GoldenParityRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GoldenScenarioInput {
  flowType: 'assessment' | 'career-fit';
  payload: unknown;
}

export interface GoldenScenarioExpectedBehavior {
  comparableFields: readonly string[];
  expectedStatus?: GoldenParityStatus;
  riskLevel: GoldenParityRiskLevel;
  riskNotes: readonly string[];
}

export interface GoldenScenario {
  scenarioId: string;
  flowType: 'assessment' | 'career-fit';
  purpose: string;
  input: GoldenScenarioInput;
  expectedBehavior: GoldenScenarioExpectedBehavior;
}

export interface GoldenScenarioResult {
  scenarioId: string;
  flowType: 'assessment' | 'career-fit';
  status: GoldenParityStatus;
  riskLevel: GoldenParityRiskLevel;
  productionOutput?: unknown;
  dryRunOutput?: unknown;
  normalizedProduction?: unknown;
  normalizedDryRun?: unknown;
  driftDetails: readonly string[];
  failureDetails: readonly string[];
  payloadSummary: unknown;
  notes: readonly string[];
}

export interface GoldenParityReport {
  reportId: string;
  generatedAt: string;
  totalScenarios: number;
  results: readonly GoldenScenarioResult[];
  metrics: {
    totalScenarios: number;
    matchedCount: number;
    driftCount: number;
    failedCount: number;
    notComparableCount: number;
    selfMirroredCount: number;
    skippedCount: number;
    parityPercentage: number;
    driftPercentage: number;
    failurePercentage: number;
    comparableCoveragePercentage: number;
  };
  criticalGaps: readonly string[];
}
