import { describe, expect, it } from 'vitest';
import {
  createFalsePositiveProtectionEngineV2,
} from '../FalsePositiveProtectionEngine';
import {
  DIFFERENTIAL_FOUNDER_INDICATOR_DIMENSIONS,
  DIFFERENTIAL_FOUNDER_INDICATORS,
  DifferentialIndicatorDimensionConfigError,
  SignalPattern,
  resolveDifferentialIndicatorDimension,
  validateDifferentialFounderIndicatorDimensions,
} from '../signals';
import {
  DimensionScoreV2,
  FounderAnalysisInputV2,
  FounderDimensionV2,
  FounderEvidenceV2,
  NonFounderProfileV2,
  isFounderDimensionV2,
} from '../types';

const createMockInput = (userInput: string): FounderAnalysisInputV2 => ({
  profile: {
    id: 'founder-counter-evidence-student',
    psychology: {},
  } as FounderAnalysisInputV2['profile'],
  userInput,
  timestamp: Date.now(),
});

const dimensionScores: DimensionScoreV2[] = Object.values(FounderDimensionV2).map((dimension) => ({
  dimension,
  score: dimension === FounderDimensionV2.OWNERSHIP_ORIENTATION ? 0.65 : 0.1,
  confidence: 0.5,
  evidence: [],
  evidenceCount: 0,
  strongestEvidenceStrength: 0,
  explanation: `${dimension} fixture`,
  isStrength: dimension === FounderDimensionV2.OWNERSHIP_ORIENTATION,
  needsDevelopment: dimension !== FounderDimensionV2.OWNERSHIP_ORIENTATION,
}));

const collectCounterEvidence = (input: FounderAnalysisInputV2): FounderEvidenceV2[] => {
  const engine = createFalsePositiveProtectionEngineV2({
    minConfidence: 0,
    detectionThreshold: 0,
    blockThreshold: 1,
  });

  return engine
    .analyze(input, dimensionScores)
    .flatMap((detection) => detection.counterEvidence);
};

describe('false-positive counter-evidence dimension contract', () => {
  it('imports the false-positive protection engine successfully', () => {
    expect(createFalsePositiveProtectionEngineV2).toBeTypeOf('function');
    expect(createFalsePositiveProtectionEngineV2()).toBeDefined();
  });

  it('keeps the generic SignalPattern contract dimensionless', () => {
    const pattern: SignalPattern = {
      pattern: /built.*product/i,
      strength: 0.95,
      evidenceType: DIFFERENTIAL_FOUNDER_INDICATORS[0].evidenceType,
      description: 'Generic signal pattern fixture',
    };

    expect('dimension' in pattern).toBe(false);
  });

  it('keeps FounderEvidenceV2 compatible with explicit valid dimensions', () => {
    const evidence: FounderEvidenceV2 = {
      id: 'contract-evidence',
      type: DIFFERENTIAL_FOUNDER_INDICATORS[0].evidenceType,
      dimension: FounderDimensionV2.OWNERSHIP_ORIENTATION,
      strength: 0.9,
      description: 'Dimension-classified counter evidence',
      source: 'test',
      rawValue: {},
      timestamp: Date.now(),
      isContradictory: false,
    };

    expect(isFounderDimensionV2(evidence.dimension)).toBe(true);
  });

  it('maps every differential founder indicator to an explicit FounderDimensionV2', () => {
    validateDifferentialFounderIndicatorDimensions();

    for (const indicator of DIFFERENTIAL_FOUNDER_INDICATORS) {
      const dimension = resolveDifferentialIndicatorDimension(indicator);

      expect(isFounderDimensionV2(dimension)).toBe(true);
      expect(DIFFERENTIAL_FOUNDER_INDICATOR_DIMENSIONS[indicator.key]).toBe(dimension);
    }
  });

  it('does not use a universal fallback dimension for all differential indicators', () => {
    const dimensions = new Set(
      DIFFERENTIAL_FOUNDER_INDICATORS.map((indicator) =>
        resolveDifferentialIndicatorDimension(indicator)
      )
    );

    expect(dimensions.size).toBeGreaterThan(1);
  });

  it('fails loudly when a differential indicator has no dimension mapping', () => {
    expect(() =>
      resolveDifferentialIndicatorDimension({ key: 'unmapped_indicator' })
    ).toThrow(DifferentialIndicatorDimensionConfigError);
  });

  it('emits counter-evidence with valid dimensions', () => {
    const evidence = collectCounterEvidence(
      createMockInput('I do freelance work, but I built a product with paying customers.')
    );

    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.every((item) => isFounderDimensionV2(item.dimension))).toBe(true);
  });

  it('never emits undefined or null dimensions for counter-evidence', () => {
    const evidence = collectCounterEvidence(
      createMockInput('I do freelance client work, but I built a product with actual users.')
    );

    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.some((item) => item.dimension === undefined || item.dimension === null)).toBe(false);
  });

  it('preserves representative false-positive override behavior', () => {
    const [withoutCounterEvidence] = createFalsePositiveProtectionEngineV2({
      minConfidence: 0,
    }).analyze(
      createMockInput('I work as a freelance designer and take client projects for hourly rates.'),
      dimensionScores
    );

    const [withCounterEvidence] = createFalsePositiveProtectionEngineV2({
      minConfidence: 0,
    }).analyze(
      createMockInput('I work as a freelance designer, but I built a product and co-founded a startup.'),
      dimensionScores
    );

    expect(withoutCounterEvidence.profile).toBe(NonFounderProfileV2.FREELANCER);
    expect(withCounterEvidence.profile).toBe(NonFounderProfileV2.FREELANCER);
    expect(withCounterEvidence.confidence).toBeLessThan(withoutCounterEvidence.confidence);
    expect(withCounterEvidence.counterEvidence.length).toBeGreaterThan(0);
  });

  it('does not enable live routing or raw payload capture through founder contract code', () => {
    expect(process.env.CAREEROS_CANARY_LIVE_ENABLED).not.toBe('true');
    expect(process.env.CAREEROS_FULL_LIVE_ENABLED).not.toBe('true');
    expect(process.env.CAREEROS_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
