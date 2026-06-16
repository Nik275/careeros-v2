/**
 * @fileoverview Deterministic and rate-limited CANARY_SHADOW sampler.
 */

import type { CanaryShadowSampleDecision } from './CanaryShadowTypes';

export interface CanaryShadowSamplerOptions {
  random?: () => number;
  now?: () => string;
}

export interface CanaryShadowSamplingInput {
  requestId?: string;
  flow: string;
  sampleRate: number;
  maxExecutionsPerMinute: number;
}

export class CanaryShadowSampler {
  private readonly random: () => number;
  private readonly now: () => string;
  private readonly executionsByMinute = new Map<string, number>();

  constructor(options: CanaryShadowSamplerOptions = {}) {
    this.random = options.random ?? Math.random;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  shouldSample(input: CanaryShadowSamplingInput): CanaryShadowSampleDecision {
    const sampleRate = clamp(input.sampleRate, 0, 1);
    const sampleKey = `${input.flow}|${input.requestId ?? 'random-fallback'}`;

    if (sampleRate <= 0) {
      return this.createDecision(sampleKey, sampleRate, false, undefined, 0, 'Sample rate is 0.');
    }

    if (input.maxExecutionsPerMinute <= 0) {
      return this.createDecision(
        sampleKey,
        sampleRate,
        false,
        undefined,
        0,
        'Max executions per minute is 0.'
      );
    }

    const sampleValue =
      input.requestId && input.requestId.length > 0
        ? deterministicSampleValue(sampleKey)
        : clamp(this.random(), 0, 1);
    if (sampleValue >= sampleRate) {
      return this.createDecision(
        sampleKey,
        sampleRate,
        false,
        sampleValue,
        this.remainingForCurrentMinute(input.flow, input.maxExecutionsPerMinute),
        'Request was not selected by sample rate.'
      );
    }

    const bucketKey = this.bucketKey(input.flow);
    const current = this.executionsByMinute.get(bucketKey) ?? 0;
    const limit = Math.max(0, Math.floor(input.maxExecutionsPerMinute));
    if (current >= limit) {
      return this.createDecision(
        sampleKey,
        sampleRate,
        false,
        sampleValue,
        0,
        'Per-flow max executions per minute was reached.'
      );
    }

    this.executionsByMinute.set(bucketKey, current + 1);
    return this.createDecision(
      sampleKey,
      sampleRate,
      true,
      sampleValue,
      Math.max(0, limit - current - 1),
      'Request selected for CANARY_SHADOW.'
    );
  }

  reset(): void {
    this.executionsByMinute.clear();
  }

  private remainingForCurrentMinute(flow: string, maxExecutionsPerMinute: number): number {
    const limit = Math.max(0, Math.floor(maxExecutionsPerMinute));
    const current = this.executionsByMinute.get(this.bucketKey(flow)) ?? 0;
    return Math.max(0, limit - current);
  }

  private bucketKey(flow: string): string {
    return `${flow}|${this.now().slice(0, 16)}`;
  }

  private createDecision(
    sampleKey: string,
    sampleRate: number,
    selected: boolean,
    hashValue: number | undefined,
    rateLimitRemaining: number,
    reason: string
  ): CanaryShadowSampleDecision {
    return Object.freeze({
      selected,
      sampleKey,
      sampleRate,
      hashValue,
      rateLimitRemaining,
      reason,
    });
  }
}

export function deterministicSampleValue(value: string): number {
  const hash = hashString(value);
  return hash / 0xffffffff;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
