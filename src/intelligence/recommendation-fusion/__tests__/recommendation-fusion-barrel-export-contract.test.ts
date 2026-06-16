import { describe, expect, it } from 'vitest';

import * as recommendationFusion from '../index';
import type {
  EngineRecommendation,
  FusionConfig,
  FusedRecommendation,
  RecommendationFusionEngineConfig,
  UnifiedRecommendationReport,
} from '../index';

describe('recommendation-fusion public barrel export contract', () => {
  it('imports the public index and preserves runtime exports', () => {
    expect(recommendationFusion.RecommendationFusionEngine).toBeTypeOf('function');
    expect(recommendationFusion.PsychologyWeightEngine).toBeTypeOf('function');
    expect(recommendationFusion.CareerWeightEngine).toBeTypeOf('function');
    expect(recommendationFusion.MentorWeightEngine).toBeTypeOf('function');
    expect(recommendationFusion.LearningWeightEngine).toBeTypeOf('function');
    expect(recommendationFusion.ConfidenceFusionEngine).toBeTypeOf('function');
    expect(recommendationFusion.DEFAULT_FUSION_CONFIG).toBeDefined();
    expect(recommendationFusion.default).toBe(recommendationFusion.RecommendationFusionEngine);
  });

  it('keeps type-only exports available to TypeScript consumers', () => {
    const config: Partial<FusionConfig> = {};
    const engineConfig: Partial<RecommendationFusionEngineConfig> = {};
    const recommendation = undefined as unknown as EngineRecommendation;
    const fused = undefined as unknown as FusedRecommendation;
    const report = undefined as unknown as UnifiedRecommendationReport;

    expect(config).toEqual({});
    expect(engineConfig).toEqual({});
    expect(recommendation).toBeUndefined();
    expect(fused).toBeUndefined();
    expect(report).toBeUndefined();
  });

  it('does not enable live routing, shadow routing, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('CANARY_LIVE');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('FULL_LIVE');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
