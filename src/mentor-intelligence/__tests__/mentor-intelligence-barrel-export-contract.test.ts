import { describe, expect, it } from 'vitest';

import * as mentorIntelligence from '../index';
import type {
  ExtractIntelligenceInput,
  MentorInsight,
  MentorIntelligenceEngineConfig,
  MentorIntelligenceReport,
  PatternId,
} from '../index';

describe('mentor-intelligence public barrel export contract', () => {
  it('imports the public index and preserves runtime exports', () => {
    expect(mentorIntelligence.MentorIntelligenceEngine).toBeTypeOf('function');
    expect(mentorIntelligence.PatternExtractionEngine).toBeTypeOf('function');
    expect(mentorIntelligence.LessonEngine).toBeTypeOf('function');
    expect(mentorIntelligence.MistakeEngine).toBeTypeOf('function');
    expect(mentorIntelligence.DecisionOutcomeEngine).toBeTypeOf('function');
    expect(mentorIntelligence.DEFAULT_EXTRACTION_CONFIG).toBeDefined();
    expect(mentorIntelligence.DEFAULT_MENTOR_INTELLIGENCE_CONFIG).toBeDefined();
    expect(mentorIntelligence.MENTOR_INTELLIGENCE_VERSION).toBe('8.3.0');
  });

  it('keeps type-only exports available to TypeScript consumers', () => {
    const config: Partial<MentorIntelligenceEngineConfig> = {};
    const input = undefined as unknown as ExtractIntelligenceInput;
    const insight = undefined as unknown as MentorInsight;
    const patternId = undefined as unknown as PatternId;
    const report = undefined as unknown as MentorIntelligenceReport;

    expect(config).toEqual({});
    expect(input).toBeUndefined();
    expect(insight).toBeUndefined();
    expect(patternId).toBeUndefined();
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
