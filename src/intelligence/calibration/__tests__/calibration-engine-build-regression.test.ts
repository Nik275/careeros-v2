import { describe, expect, it } from 'vitest';
import { CalibrationEngine } from '../calibration-engine';
import { RecommendationCalibrationEngine } from '../recommendation-calibration-engine';
import { TimeHorizon } from '../calibration-types';

describe('Calibration engine build regression', () => {
  it('imports calibration and recommendation calibration engines successfully', () => {
    expect(CalibrationEngine).toBeTypeOf('function');
    expect(RecommendationCalibrationEngine).toBeTypeOf('function');
  });

  it('exposes type-safe recommendation observation count for empty state', () => {
    const engine = new RecommendationCalibrationEngine();

    expect(engine.getObservationCount()).toBe(0);
    expect(engine.getPendingCount()).toBe(0);
  });

  it('counts only finalized recommendation calibration observations', () => {
    const engine = new RecommendationCalibrationEngine();

    engine.recordRecommendation('rec-1', 'career-match', 'career', 0.82, context());
    expect(engine.getPendingCount()).toBe(1);
    expect(engine.getObservationCount()).toBe(0);

    engine.recordOutcome('rec-1', 0.9, 0.8);
    expect(engine.getPendingCount()).toBe(0);
    expect(engine.getObservationCount()).toBe(1);
    expect(engine.exportData().outcomes).toHaveLength(1);
  });

  it('keeps calibration system status output shape stable', () => {
    const engine = new CalibrationEngine();

    for (let i = 0; i < 3; i += 1) {
      engine.recordRecommendation(`rec-${i}`, 'career-match', 'career', 0.75, context());
      engine.recordRecommendationOutcome(`rec-${i}`, 0.8, 0.7);
    }
    seedNonRecommendationProfiles(engine);

    const status = engine.getSystemStatus();

    expect(status).toHaveProperty('recommendation');
    expect(status.recommendation.observations).toBe(3);
    expect(status.recommendation.reliability).toBeGreaterThanOrEqual(0);
    expect(status.overall.status).toMatch(/healthy|degraded|critical/);
    expect(status.overall.reliability).toBeGreaterThanOrEqual(0);

    engine.dispose();
  });

  it('keeps recommendation calibration output shape stable', () => {
    const engine = new RecommendationCalibrationEngine();

    engine.recordRecommendation('rec-1', 'career-match', 'career', 0.7, context());
    engine.recordAcceptance('rec-1');
    engine.recordAction('rec-1');
    engine.recordOutcome('rec-1', 0.8, 0.7);

    const data = engine.exportData();
    const profile = engine.getProfile();

    expect(data.outcomes).toHaveLength(1);
    expect(data.baseProfile?.sampleSize).toBe(1);
    expect(profile.sampleSize).toBe(1);
    expect(profile.successMetrics.acceptedRate).toBe(1);
    expect(profile.successMetrics.actedUponRate).toBe(1);
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});

function context() {
  return {
    domain: 'career',
    decisionType: 'recommendation',
    userSegment: 'phase-6-6-4',
    timeHorizon: TimeHorizon.MEDIUM,
  };
}

function seedNonRecommendationProfiles(engine: CalibrationEngine): void {
  engine.recordDecision(
    'decision-1',
    'career-choice',
    'simple',
    0.74,
    2,
    context(),
    ['fit', 'growth']
  );
  engine.recordDecisionOutcome('decision-1', {
    optimality: 0.8,
    regretProbability: 0.1,
    longTermValue: 0.78,
    stakeholderAlignment: 0.7,
    overallQuality: 0.76,
  });

  engine.recordRegretPrediction(
    {
      decisionId: 'decision-1',
      riskLevel: 0.2,
      confidence: 0.8,
      primaryFactors: ['optionality'],
      severityDistribution: new Map([['mild', 0.7]]),
    },
    context()
  );
  engine.recordRegretSignal({
    decisionId: 'decision-1',
    regretType: 'opportunity',
    severity: 'mild',
    predictedRisk: 0.2,
    actualRegret: false,
    timeToRegret: 86_400_000,
    factors: ['optionality'],
    timestamp: Date.now(),
    context: context(),
  });

  engine.recordCriticalityPrediction(
    {
      decisionId: 'decision-1',
      level: 'medium',
      score: 0.55,
      reasoning: ['Synthetic calibration regression scenario.'],
      expectedImpacts: [{ timeframe: 'long', magnitude: 0.5, probability: 0.7 }],
    },
    context()
  );
  engine.recordImpact({
    decisionId: 'decision-1',
    criticalityLevel: 'medium',
    predictedCriticality: 0.55,
    predictedImpact: {
      magnitude: 0.5,
      direction: 'positive',
      timeHorizon: 'long',
    },
    actualImpact: {
      shortTerm: 0.3,
      longTerm: 0.5,
      magnitude: 0.5,
      direction: 'positive',
    },
    timestamp: Date.now(),
    context: context(),
    impactFactors: ['growth'],
  });
}
