import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { CalibrationEngine } from '../calibration-engine';
import { RecommendationCalibrationEngine } from '../recommendation-calibration-engine';
import {
  CalibrationStatus,
  ReliabilityBand,
  TimeHorizon,
} from '../calibration-types';
import type { CalibrationProfile } from '../calibration-types';

describe('Calibration status build regression', () => {
  it('resolves CalibrationStatus from the canonical calibration type surface', () => {
    expect(CalibrationStatus.WELL_CALIBRATED).toBe('well_calibrated');
    expect(CalibrationStatus.OVERCONFIDENT).toBe('overconfident');
    expect(CalibrationStatus.UNDERCONFIDENT).toBe('underconfident');
    expect(CalibrationStatus.INSUFFICIENT_DATA).toBe('insufficient_data');
    expect(CalibrationStatus.DRIFTING).toBe('drifting');
  });

  it('keeps GOOD represented as a reliability band, not a calibration status', () => {
    expect(ReliabilityBand.GOOD).toBe('good');
    expect(Object.prototype.hasOwnProperty.call(CalibrationStatus, 'GOOD')).toBe(false);
    expect(CalibrationStatus.WELL_CALIBRATED).toBe('well_calibrated');
  });

  it('does not diverge across the calibration barrel export surface', async () => {
    const barrel = await import('../index');

    expect(barrel.CalibrationStatus).toBe(CalibrationStatus);
    expect(barrel.CalibrationStatus.WELL_CALIBRATED).toBe(CalibrationStatus.WELL_CALIBRATED);
    expect(barrel.ReliabilityBand.GOOD).toBe(ReliabilityBand.GOOD);
  });

  it('keeps calibration-tests.ts away from nonexistent CalibrationStatus members', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/calibration/calibration-tests.ts'),
      'utf8'
    );

    expect(source).not.toContain('CalibrationStatus.GOOD');
    expect(source).toContain('CalibrationStatus.WELL_CALIBRATED');
    expect(source).toContain('ReliabilityBand.GOOD');
  });

  it('imports calibration engines successfully', () => {
    expect(CalibrationEngine).toBeTypeOf('function');
    expect(RecommendationCalibrationEngine).toBeTypeOf('function');
  });

  it('keeps calibration profile output shape stable', () => {
    const profile: CalibrationProfile = {
      id: 'phase-6-6-6-profile',
      name: 'Phase 6.6.6 Profile',
      status: CalibrationStatus.WELL_CALIBRATED,
      reliabilityBand: ReliabilityBand.GOOD,
      reliabilityScore: 0.78,
      calibrationError: 0.12,
      sampleSize: 150,
      lastUpdated: Date.now(),
      binCalibrations: [],
      trend: {
        direction: 'stable',
        rate: 0,
        periodsAnalyzed: 8,
      },
    };

    expectTypeOf(profile.status).toMatchTypeOf<CalibrationStatus>();
    expect(profile.status).toBe(CalibrationStatus.WELL_CALIBRATED);
    expect(profile.reliabilityBand).toBe(ReliabilityBand.GOOD);
    expect(profile.reliabilityScore).toBe(0.78);
  });

  it('keeps recommendation calibration output shape stable', () => {
    const engine = new RecommendationCalibrationEngine();

    engine.recordRecommendation('phase-6-6-6-rec', 'career-match', 'career', 0.76, {
      domain: 'career',
      decisionType: 'recommendation',
      userSegment: 'phase-6-6-6',
      timeHorizon: TimeHorizon.MEDIUM,
    });
    engine.recordAcceptance('phase-6-6-6-rec');
    engine.recordAction('phase-6-6-6-rec');
    engine.recordOutcome('phase-6-6-6-rec', 0.8, 0.7);

    const data = engine.exportData();
    const profile = engine.getProfile();

    expect(data.outcomes).toHaveLength(1);
    expect(profile.sampleSize).toBe(1);
    expect(profile.successMetrics.acceptedRate).toBe(1);
    expect(profile.successMetrics.actedUponRate).toBe(1);
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
