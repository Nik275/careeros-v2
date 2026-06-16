import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROFILE_CONFIG,
  createProfileGenerator,
  createProfileInsightsEngine,
  createProfileInterpreter,
  createProfileSynthesizer,
} from './index';

describe('profile public surface', () => {
  it('exports profile factories and default configuration', () => {
    expect(DEFAULT_PROFILE_CONFIG).toBeDefined();
    expect(createProfileGenerator()).toBeDefined();
    expect(createProfileSynthesizer()).toBeDefined();
    expect(createProfileInterpreter()).toBeDefined();
    expect(createProfileInsightsEngine()).toBeDefined();
  });
});
