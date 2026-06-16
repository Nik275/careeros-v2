import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  CareerGraphEngine,
  DEFAULT_CAREER_GRAPH_CONFIG,
  DEFAULT_CASCADE_OPTIONS,
  DEFAULT_IRREVERSIBILITY_OPTIONS,
  DEFAULT_OPPORTUNITY_OPTIONS,
  DEFAULT_OPTIONALITY_OPTIONS,
  DEFAULT_SIMULATOR_OPTIONS,
  GraphBuilder,
  IrreversibilityEngine,
  OpportunityEngine,
  OptionalityEngine,
  PathSimulator,
  PREDEFINED_PATHWAYS,
} from '../index';
import type {
  CareerGraph,
  CareerGraphConfig,
  CareerGraphEventType,
  CareerGraphReport,
  EdgeId,
  GraphBuilderOptions,
  NodeId,
  OpportunityEngineOptions,
  PathId,
  Probability,
  Score,
  SimulationContext,
  Timestamp,
} from '../index';

describe('Career graph barrel export build regression', () => {
  it('imports the career-graph barrel successfully', async () => {
    const barrel = await import('../index');

    expect(barrel.CareerGraphEngine).toBeTypeOf('function');
    expect(barrel.default).toBe(barrel.CareerGraphEngine);
  });

  it('keeps runtime career-graph exports importable as runtime values', () => {
    expect(CareerGraphEngine).toBeTypeOf('function');
    expect(GraphBuilder).toBeTypeOf('function');
    expect(PathSimulator).toBeTypeOf('function');
    expect(OpportunityEngine).toBeTypeOf('function');
    expect(OptionalityEngine).toBeTypeOf('function');
    expect(IrreversibilityEngine).toBeTypeOf('function');
    expect(PREDEFINED_PATHWAYS).toBeTypeOf('object');
    expect(DEFAULT_CAREER_GRAPH_CONFIG).toBeTypeOf('object');
    expect(DEFAULT_SIMULATOR_OPTIONS).toBeTypeOf('object');
    expect(DEFAULT_OPPORTUNITY_OPTIONS).toBeTypeOf('object');
    expect(DEFAULT_OPTIONALITY_OPTIONS).toBeTypeOf('object');
    expect(DEFAULT_IRREVERSIBILITY_OPTIONS).toBeTypeOf('object');
    expect(DEFAULT_CASCADE_OPTIONS).toBeTypeOf('object');
  });

  it('keeps type-only career-graph exports importable with import type', () => {
    expectTypeOf<NodeId>().toEqualTypeOf<string>();
    expectTypeOf<EdgeId>().toEqualTypeOf<string>();
    expectTypeOf<PathId>().toEqualTypeOf<string>();
    expectTypeOf<Timestamp>().toEqualTypeOf<number>();
    expectTypeOf<Probability>().toEqualTypeOf<number>();
    expectTypeOf<Score>().toEqualTypeOf<number>();
    expectTypeOf<CareerGraph>().toHaveProperty('nodes');
    expectTypeOf<CareerGraphConfig>().toHaveProperty('maxPathsToSimulate');
    expectTypeOf<CareerGraphEventType>().toMatchTypeOf<string>();
    expectTypeOf<GraphBuilderOptions>().toBeObject();
    expectTypeOf<OpportunityEngineOptions>().toBeObject();
    expectTypeOf<SimulationContext>().toBeObject();
    expectTypeOf<CareerGraphReport>().toHaveProperty('id');
  });

  it('keeps type-only symbols out of runtime barrel exports', async () => {
    const barrel = await import('../index');

    expect('NodeId' in barrel).toBe(false);
    expect('CareerGraph' in barrel).toBe(false);
    expect('CareerGraphEventType' in barrel).toBe(false);
    expect('GraphBuilderOptions' in barrel).toBe(false);
  });

  it('keeps career-graph/index.ts isolatedModules-safe for known type-only exports', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-graph/index.ts'),
      'utf8'
    );
    const runtimeExportBlocks = Array.from(source.matchAll(/export\s+\{([\s\S]*?)\}\s+from/g))
      .map((match) => match[1])
      .join('\n');

    expect(source).toContain('export type {');
    expect(runtimeExportBlocks).not.toContain('NodeId');
    expect(runtimeExportBlocks).not.toMatch(/^\s*CareerGraph,\s*$/m);
    expect(runtimeExportBlocks).not.toMatch(/^\s*CareerGraphEventType,\s*$/m);
    expect(runtimeExportBlocks).not.toMatch(/^\s*CareerGraphEngineOptions,\s*$/m);
  });

  it('supports runtime engine construction through the barrel', () => {
    expect(new GraphBuilder()).toBeInstanceOf(GraphBuilder);
    expect(new CareerGraphEngine()).toBeInstanceOf(CareerGraphEngine);
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
