/**
 * @fileoverview Drift triage for golden parity baseline results.
 */

import type { GoldenScenarioResult } from './GoldenScenarioTypes';

export type GoldenParityDriftCategory =
  | 'NORMALIZER_MISMATCH'
  | 'EXPECTED_VOLATILE_FIELD'
  | 'REAL_SEMANTIC_DRIFT'
  | 'SCHEMA_MISMATCH'
  | 'MISSING_INPUT_DATA'
  | 'AUTHORITY_DRY_RUN_FAILURE'
  | 'PRODUCTION_FAILURE'
  | 'NOT_COMPARABLE_SHAPE'
  | 'SELF_MIRRORED_NO_PROOF'
  | 'UNKNOWN';

export type GoldenParityDriftSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GoldenParityDriftTriageItem {
  scenarioId: string;
  fieldPath: string;
  category: GoldenParityDriftCategory;
  severity: GoldenParityDriftSeverity;
  productionValueSummary: string;
  authorityValueSummary: string;
  likelyCause: string;
  recommendedFix: string;
}

export interface GoldenParityDriftTriageSummary {
  totalItems: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  items: readonly GoldenParityDriftTriageItem[];
}

const VOLATILE_FIELD_PATTERNS = [/timestamp/i, /evaluatedAt/i, /createdAt/i, /updatedAt/i, /\bid\b/i];

export class GoldenParityDriftTriage {
  triage(results: readonly GoldenScenarioResult[]): GoldenParityDriftTriageSummary {
    const items = results.flatMap((result) => this.triageResult(result));
    return {
      totalItems: items.length,
      criticalCount: items.filter((item) => item.severity === 'CRITICAL').length,
      highCount: items.filter((item) => item.severity === 'HIGH').length,
      mediumCount: items.filter((item) => item.severity === 'MEDIUM').length,
      lowCount: items.filter((item) => item.severity === 'LOW').length,
      items,
    };
  }

  triageResult(result: GoldenScenarioResult): readonly GoldenParityDriftTriageItem[] {
    if (result.status === 'SELF_MIRRORED') {
      return [
        this.createItem(result, {
          fieldPath: '*',
          category: 'SELF_MIRRORED_NO_PROOF',
          severity: 'MEDIUM',
          likelyCause: 'Dry-run returned the same object reference as production output.',
          recommendedFix: 'Use an independent authority dry-run execution before counting parity.',
        }),
      ];
    }

    if (result.status === 'NOT_COMPARABLE') {
      return [
        this.createItem(result, {
          fieldPath: '*',
          category: 'NOT_COMPARABLE_SHAPE',
          severity: 'MEDIUM',
          likelyCause: result.failureDetails[0] ?? 'One or both outputs could not be normalized.',
          recommendedFix: 'Align the validation fixture and output normalizer with actual engine output shape.',
        }),
      ];
    }

    if (result.status === 'FAILED') {
      const productionFailure = result.failureDetails.some((detail) =>
        /production/i.test(detail)
      );
      return [
        this.createItem(result, {
          fieldPath: '*',
          category: productionFailure ? 'PRODUCTION_FAILURE' : 'AUTHORITY_DRY_RUN_FAILURE',
          severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          likelyCause: result.failureDetails.join('; ') || 'Runner failure.',
          recommendedFix: productionFailure
            ? 'Fix the production import/runtime blocker or invalid scenario input before rerunning parity.'
            : 'Fix the authority dry-run path before considering rollout advancement.',
        }),
      ];
    }

    if (result.status !== 'DRIFT_DETECTED') {
      return [];
    }

    return result.driftDetails.map((fieldPath) => {
      const productionValue = readField(result.normalizedProduction, fieldPath);
      const authorityValue = readField(result.normalizedDryRun, fieldPath);
      const category = classifyDrift(fieldPath, productionValue, authorityValue);
      return this.createItem(result, {
        fieldPath,
        category,
        severity: severityFor(category, result.riskLevel),
        productionValueSummary: summarizeValue(productionValue),
        authorityValueSummary: summarizeValue(authorityValue),
        likelyCause: likelyCauseFor(category),
        recommendedFix: recommendedFixFor(category),
      });
    });
  }

  private createItem(
    result: GoldenScenarioResult,
    input: {
      fieldPath: string;
      category: GoldenParityDriftCategory;
      severity: GoldenParityDriftSeverity;
      productionValueSummary?: string;
      authorityValueSummary?: string;
      likelyCause: string;
      recommendedFix: string;
    }
  ): GoldenParityDriftTriageItem {
    return {
      scenarioId: result.scenarioId,
      fieldPath: input.fieldPath,
      category: input.category,
      severity: input.severity,
      productionValueSummary: input.productionValueSummary ?? summarizeValue(result.normalizedProduction),
      authorityValueSummary: input.authorityValueSummary ?? summarizeValue(result.normalizedDryRun),
      likelyCause: input.likelyCause,
      recommendedFix: input.recommendedFix,
    };
  }
}

function classifyDrift(
  fieldPath: string,
  productionValue: unknown,
  authorityValue: unknown
): GoldenParityDriftCategory {
  if (VOLATILE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldPath))) {
    return 'EXPECTED_VOLATILE_FIELD';
  }

  if (productionValue === undefined || authorityValue === undefined) {
    return 'SCHEMA_MISMATCH';
  }

  if (fieldPath.toLowerCase().includes('confidencelevel') && (productionValue === 'UNKNOWN' || authorityValue === 'UNKNOWN')) {
    return 'NORMALIZER_MISMATCH';
  }

  if (typeof productionValue !== typeof authorityValue) {
    return 'SCHEMA_MISMATCH';
  }

  if (isScalar(productionValue) && isScalar(authorityValue)) {
    return 'REAL_SEMANTIC_DRIFT';
  }

  return 'UNKNOWN';
}

function severityFor(
  category: GoldenParityDriftCategory,
  riskLevel: GoldenScenarioResult['riskLevel']
): GoldenParityDriftSeverity {
  if (riskLevel === 'CRITICAL' && category === 'REAL_SEMANTIC_DRIFT') return 'CRITICAL';
  if (category === 'REAL_SEMANTIC_DRIFT') return 'HIGH';
  if (category === 'SCHEMA_MISMATCH' || category === 'AUTHORITY_DRY_RUN_FAILURE' || category === 'PRODUCTION_FAILURE') return 'HIGH';
  if (category === 'NOT_COMPARABLE_SHAPE' || category === 'SELF_MIRRORED_NO_PROOF') return 'MEDIUM';
  return 'LOW';
}

function likelyCauseFor(category: GoldenParityDriftCategory): string {
  switch (category) {
    case 'NORMALIZER_MISMATCH':
      return 'The normalizer may be comparing a derived or defaulted field rather than a stable semantic field.';
    case 'EXPECTED_VOLATILE_FIELD':
      return 'The field is expected to vary between independent executions.';
    case 'REAL_SEMANTIC_DRIFT':
      return 'Production and authority dry-run produced different semantic output.';
    case 'SCHEMA_MISMATCH':
      return 'Production and authority dry-run outputs expose different comparable shapes.';
    default:
      return 'Cause requires manual investigation.';
  }
}

function recommendedFixFor(category: GoldenParityDriftCategory): string {
  switch (category) {
    case 'NORMALIZER_MISMATCH':
      return 'Refine normalizer field selection before using this field as rollout evidence.';
    case 'EXPECTED_VOLATILE_FIELD':
      return 'Exclude or stabilize volatile fields in parity comparison.';
    case 'REAL_SEMANTIC_DRIFT':
      return 'Investigate engine inputs, authority wrapper behavior, and deterministic configuration.';
    case 'SCHEMA_MISMATCH':
      return 'Align schema contracts or mark the scenario NOT_COMPARABLE until the shape is stable.';
    default:
      return 'Review the scenario and authority dry-run trace.';
  }
}

function readField(value: unknown, fieldPath: string): unknown {
  if (!isRecord(value)) return undefined;
  return value[fieldPath];
}

function summarizeValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  const serialized = JSON.stringify(value);
  if (!serialized) return String(value);
  return serialized.length > 160 ? `${serialized.slice(0, 160)}...[TRUNCATED]` : serialized;
}

function isScalar(value: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof value) || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
