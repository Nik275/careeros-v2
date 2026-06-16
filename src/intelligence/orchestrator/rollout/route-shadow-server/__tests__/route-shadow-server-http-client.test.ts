import { describe, expect, it } from 'vitest';
import { validateBaseUrl } from '../RouteShadowServerHttpClient';

describe('RouteShadowServerHttpClient', () => {
  it('blocks invalid and production hosts', () => {
    expect(() => validateBaseUrl('not-a-url')).toThrow(/host is not allowed/);
    expect(() => validateBaseUrl('https://careeros.com')).toThrow(/host is not allowed|production host is blocked/);
  });

  it('allows local hosts', () => {
    expect(() => validateBaseUrl('http://127.0.0.1:31620')).not.toThrow();
    expect(() => validateBaseUrl('http://localhost:31620')).not.toThrow();
  });
});

