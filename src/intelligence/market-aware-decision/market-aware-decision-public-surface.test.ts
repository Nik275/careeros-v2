import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG,
  DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG,
  createDecisionNarrativeGenerator,
  createMarketAdjustmentCalculator,
  createMarketAwareDecisionEngine,
} from './index.js';

describe('market-aware-decision public surface', () => {
  it('exports market-aware decision factories and defaults', () => {
    expect(DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG).toBeDefined();
    expect(DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG).toBeDefined();
    expect(createMarketAwareDecisionEngine()).toBeDefined();
    expect(createMarketAdjustmentCalculator()).toBeDefined();
    expect(createDecisionNarrativeGenerator()).toBeDefined();
  });
});
