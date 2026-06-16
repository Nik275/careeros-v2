import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  CalibrationEngine,
  CalibrationStatus,
  ConfidenceCalibrationEngine,
  DEFAULT_CALIBRATION_CONFIG,
  DEFAULT_RECOMMENDATION_CONFIG,
  DEFAULT_RELIABILITY_CONFIG,
  ReliabilityBand,
  RecommendationCalibrationEngine,
  TimeHorizon,
} from '../index';
import type {
  CalibrationEngineConfig,
  CalibrationProfile,
  ConfidenceLevel,
  RecommendationCalibrationConfig,
  RecommendationOutcome,
} from '../index';

describe('Calibration barrel export build regression', () => {
  it('imports the calibration barrel successfully', async () => {
    const barrel = await import('../index');

    expect(barrel.CalibrationEngine).toBeTypeOf('function');
    expect(barrel.default).toBe(barrel.CalibrationEngine);
  });

  it('keeps runtime calibration exports importable as runtime values', () => {
    expect(CalibrationStatus.WELL_CALIBRATED).toBe('well_calibrated');
    expect(ReliabilityBand.GOOD).toBe('good');
    expect(TimeHorizon.MEDIUM).toBe('medium');
    expect(DEFAULT_CALIBRATION_CONFIG.minSampleSize).toBeGreaterThan(0);
    expect(DEFAULT_RECOMMENDATION_CONFIG.outcomeWindow).toBeGreaterThan(0);
    expect(DEFAULT_RELIABILITY_CONFIG.minSampleSizeForReliable).toBeGreaterThan(0);
    expect(ConfidenceCalibrationEngine).toBeTypeOf('function');
    expect(RecommendationCalibrationEngine).toBeTypeOf('function');
  });

  it('keeps type-only calibration exports importable with import type', () => {
    expectTypeOf<ConfidenceLevel>().toEqualTypeOf<number>();
    expectTypeOf<CalibrationProfile>().toHaveProperty('status');
    expectTypeOf<CalibrationEngineConfig>().toHaveProperty('minSampleSize');
    expectTypeOf<RecommendationCalibrationConfig>().toHaveProperty('outcomeWindow');
    expectTypeOf<RecommendationOutcome>().toHaveProperty('recommendationId');
  });

  it('keeps type-only symbols out of runtime barrel exports', async () => {
    const barrel = await import('../index');

    expect('CalibrationProfile' in barrel).toBe(false);
    expect('ConfidenceLevel' in barrel).toBe(false);
    expect('RecommendationOutcome' in barrel).toBe(false);
  });

  it('keeps calibration/index.ts isolatedModules-safe for known type-only exports', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/calibration/index.ts'),
      'utf8'
    );
    const runtimeExportBlocks = Array.from(source.matchAll(/export\s+\{([\s\S]*?)\}\s+from/g))
      .map((match) => match[1])
      .join('\n');

    expect(source).toContain('export type {');
    expect(runtimeExportBlocks).not.toContain('ConfidenceLevel');
    expect(runtimeExportBlocks).not.toContain('CalibrationProfile');
    expect(runtimeExportBlocks).not.toContain('RecommendationOutcome');
    expect(runtimeExportBlocks).not.toContain('CalibrationEngineOptions');
  });

  it('supports calibration engine construction through the barrel', () => {
    const engine = new CalibrationEngine();

    expect(engine).toBeInstanceOf(CalibrationEngine);
    engine.dispose();
  });

  it('keeps recommendation calibration output shape stable through barrel imports', () => {
    const engine = new RecommendationCalibrationEngine();

    engine.recordRecommendation('phase-6-6-7-rec', 'career-match', 'career', 0.78, {
      domain: 'career',
      decisionType: 'recommendation',
      userSegment: 'phase-6-6-7',
      timeHorizon: TimeHorizon.MEDIUM,
    });
    engine.recordAcceptance('phase-6-6-7-rec');
    engine.recordOutcome('phase-6-6-7-rec', 0.8, 0.7);

    const data = engine.exportData();
    const profile = engine.getProfile();

    expect(data.outcomes).toHaveLength(1);
    expect(profile.sampleSize).toBe(1);
    expect(profile.successMetrics.acceptedRate).toBe(1);
    expect(profile.categoryCalibrations).toBeInstanceOf(Map);
    expect(profile.recommendationTypes).toBeInstanceOf(Map);
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
