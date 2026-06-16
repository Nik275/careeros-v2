import { describe, expect, it } from 'vitest';

import {
  DEFAULT_RECOMMENDATION_CONFIG,
  DEFAULT_RECOMMENDATION_WEIGHTS,
  createCareerRecommendationEngine,
  createRecommendationConfidenceEngine,
  createRecommendationExplainer,
  createRecommendationRanker,
} from './index';

describe('recommendation public surface', () => {
  it('exports recommendation factories and default configuration', () => {
    expect(DEFAULT_RECOMMENDATION_CONFIG).toBeDefined();
    expect(DEFAULT_RECOMMENDATION_WEIGHTS).toBeDefined();
    expect(createCareerRecommendationEngine()).toBeDefined();
    expect(createRecommendationRanker()).toBeDefined();
    expect(createRecommendationExplainer()).toBeDefined();
    expect(createRecommendationConfidenceEngine()).toBeDefined();
  });
});
