import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { CalibrationEngine } from '../calibration-engine';
import { RecommendationCalibrationEngine } from '../recommendation-calibration-engine';
import { CalibrationStatus, ReliabilityBand, TimeHorizon } from '../calibration-types';
import type { CalibrationProfile, RecommendationCalibrationProfile } from '../calibration-types';

describe('Calibration profile build regression', () => {
  it('resolves CalibrationProfile from the canonical calibration type surface', () => {
    expectTypeOf<CalibrationProfile>().toHaveProperty('id');
    expectTypeOf<CalibrationProfile>().toHaveProperty('sampleSize');
    expectTypeOf<RecommendationCalibrationProfile>().toMatchTypeOf<CalibrationProfile>();
  });

  it('keeps calibration-tests.ts using a type-only canonical import', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/calibration/calibration-tests.ts'),
      'utf8'
    );

    expect(source).toContain("import type { CalibrationProfile } from './calibration-types';");
    expect(source).toContain('const profile: CalibrationProfile');
  });

  it('imports calibration engines successfully', () => {
    expect(CalibrationEngine).toBeTypeOf('function');
    expect(RecommendationCalibrationEngine).toBeTypeOf('function');
  });

  it('keeps the calibration profile fixture shape stable', () => {
    const profile: CalibrationProfile = {
      id: 'phase-6-6-5-profile',
      name: 'Phase 6.6.5 Profile',
      status: CalibrationStatus.WELL_CALIBRATED,
      reliabilityBand: ReliabilityBand.GOOD,
      reliabilityScore: 0.8,
      calibrationError: 0.1,
      sampleSize: 42,
      lastUpdated: Date.now(),
      binCalibrations: [],
      trend: {
        direction: 'stable',
        rate: 0,
        periodsAnalyzed: 1,
      },
    };

    expect(profile.sampleSize).toBe(42);
    expect(profile.reliabilityBand).toBe(ReliabilityBand.GOOD);
  });

  it('keeps recommendation calibration output shape stable', () => {
    const engine = new RecommendationCalibrationEngine();

    engine.recordRecommendation('rec-1', 'career-match', 'career', 0.74, {
      domain: 'career',
      decisionType: 'recommendation',
      userSegment: 'phase-6-6-5',
      timeHorizon: TimeHorizon.MEDIUM,
    });
    engine.recordAcceptance('rec-1');
    engine.recordOutcome('rec-1', 0.8, 0.7);

    const profile = engine.getProfile();

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
