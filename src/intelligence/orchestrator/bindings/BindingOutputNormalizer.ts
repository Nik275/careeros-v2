/**
 * @fileoverview Stable output normalization for dry-run binding comparison.
 */

export interface BindingOutputComparison {
  status: 'MATCHED' | 'DRIFT_DETECTED' | 'NOT_COMPARABLE';
  normalizedProduction: unknown;
  normalizedDryRun: unknown;
  differences: readonly string[];
}

export function normalizeCareerFitBindingOutput(output: unknown): Readonly<Record<string, unknown>> | undefined {
  if (!isRecord(output)) {
    return undefined;
  }

  const confidence = isRecord(output.confidence) ? output.confidence : {};
  const strengths = Array.isArray(output.strengths) ? output.strengths : [];
  const concerns = Array.isArray(output.concerns) ? output.concerns : [];

  return {
    careerId: readString(output, 'careerId') ?? 'unknown-career',
    studentProfileId: readString(output, 'studentProfileId') ?? 'unknown-profile',
    overallFitScore: readNumber(output, 'overallFitScore'),
    fitLevel: readString(output, 'fitLevel') ?? 'UNKNOWN',
    confidenceOverall: readNumber(confidence, 'overall'),
    confidenceLevel: readString(confidence, 'level') ?? 'UNKNOWN',
    strengthCount: strengths.length,
    concernCount: concerns.length,
  };
}

export function normalizeAssessmentBindingOutput(output: unknown): Readonly<Record<string, unknown>> | undefined {
  if (!isRecord(output)) {
    return undefined;
  }

  const confidence = isRecord(output.confidence) ? output.confidence : {};
  const strengths = isRecord(output.strengths) ? output.strengths : {};
  const weaknesses = isRecord(output.weaknesses) ? output.weaknesses : {};

  return {
    hasCognitiveProfile: isRecord(output.cognitive),
    hasMotivationProfile: isRecord(output.motivation),
    hasLifestyleProfile: isRecord(output.lifestyle),
    hasRiskProfile: isRecord(output.risk),
    hasWorkEnvironmentProfile: isRecord(output.workEnvironment),
    hasValuesProfile: isRecord(output.values),
    profileConfidence: readNumber(confidence, 'profileConfidence'),
    assessmentCompleteness: readNumber(confidence, 'assessmentCompleteness'),
    topStrengthCount: Array.isArray(strengths.topStrengths) ? strengths.topStrengths.length : 0,
    developmentAreaCount: Array.isArray(weaknesses.developmentAreas)
      ? weaknesses.developmentAreas.length
      : 0,
  };
}

export function compareNormalizedBindingOutputs(input: {
  productionOutput: unknown;
  dryRunOutput: unknown;
  flowType?: 'career-fit' | 'assessment';
}): BindingOutputComparison {
  const normalizer =
    input.flowType === 'assessment'
      ? normalizeAssessmentBindingOutput
      : normalizeCareerFitBindingOutput;
  const normalizedProduction = normalizer(input.productionOutput);
  const normalizedDryRun = normalizer(input.dryRunOutput);

  if (!normalizedProduction || !normalizedDryRun) {
    return {
      status: 'NOT_COMPARABLE',
      normalizedProduction,
      normalizedDryRun,
      differences: ['One or both outputs could not be normalized.'],
    };
  }

  const differences = findDifferences(normalizedProduction, normalizedDryRun);
  return {
    status: differences.length === 0 ? 'MATCHED' : 'DRIFT_DETECTED',
    normalizedProduction,
    normalizedDryRun,
    differences,
  };
}

function findDifferences(
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>
): readonly string[] {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  return keys.filter((key) => stableStringify(left[key]) !== stableStringify(right[key]));
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
