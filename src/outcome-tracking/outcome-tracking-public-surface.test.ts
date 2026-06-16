import { describe, expect, it } from 'vitest';

import {
  ActionTracker,
  DecisionTracker,
  FeedbackEngine,
  OutcomeTracker,
  OutcomeTrackingEngine,
  RecommendationTracker,
} from './index';

describe('outcome-tracking public surface', () => {
  it('exports tracking engines from the public barrel', () => {
    expect(OutcomeTrackingEngine).toBeTypeOf('function');
    expect(RecommendationTracker).toBeTypeOf('function');
    expect(DecisionTracker).toBeTypeOf('function');
    expect(ActionTracker).toBeTypeOf('function');
    expect(OutcomeTracker).toBeTypeOf('function');
    expect(FeedbackEngine).toBeTypeOf('function');
  });
});
