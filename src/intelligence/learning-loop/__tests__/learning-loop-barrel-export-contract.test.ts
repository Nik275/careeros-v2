import { describe, expect, it } from 'vitest';

import * as learningLoop from '../index';
import type {
  LearningLoopConfig,
  LearningLoopReport,
  OutcomeFeedback,
  RecommendationSet,
  StudentProfile,
} from '../index';

describe('learning-loop public barrel export contract', () => {
  it('imports the public index and preserves runtime exports', () => {
    expect(learningLoop.LearningLoopEngine).toBeTypeOf('function');
    expect(learningLoop.OutcomeFeedbackEngine).toBeTypeOf('function');
    expect(learningLoop.RecommendationLearningEngine).toBeTypeOf('function');
    expect(learningLoop.ConfidenceAdjustmentEngine).toBeTypeOf('function');
    expect(learningLoop.PopulationLearningEngine).toBeTypeOf('function');
    expect(learningLoop.DEFAULT_LEARNING_CONFIG).toBeDefined();
    expect(learningLoop.LearningEventType).toBeDefined();
    expect(learningLoop.default).toBe(learningLoop.LearningLoopEngine);
  });

  it('keeps type-only exports available to TypeScript consumers', () => {
    const config: Partial<LearningLoopConfig> = {};
    const report = undefined as unknown as LearningLoopReport;
    const feedback = undefined as unknown as OutcomeFeedback;
    const recommendationSet = undefined as unknown as RecommendationSet;
    const student = undefined as unknown as StudentProfile;

    expect(config).toEqual({});
    expect(report).toBeUndefined();
    expect(feedback).toBeUndefined();
    expect(recommendationSet).toBeUndefined();
    expect(student).toBeUndefined();
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
