import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  CareerPathIntelligenceEngine,
  PathType,
  createCareerPathIntelligenceEngine,
} from '../index';
import type {
  CareerPathIntelligenceAnalysis,
  CareerPathIntelligenceInput,
  IntegratedRecommendation,
  PathRecommendation,
} from '../index';
import type { CareerRecommendation } from '../../../recommendation/recommendation-types';

describe('IntegratedRecommendation career-path build regression', () => {
  it('imports the career-path intelligence barrel successfully', async () => {
    const barrel = await import('../index');

    expect(barrel.CareerPathIntelligenceEngine).toBeTypeOf('function');
    expect(barrel.createCareerPathIntelligenceEngine).toBeTypeOf('function');
    expect(barrel.PathType.DIRECT).toBe('DIRECT');
  });

  it('keeps IntegratedRecommendation as the local PathRecommendation compatibility alias', () => {
    expectTypeOf<IntegratedRecommendation>().toEqualTypeOf<PathRecommendation>();
    expectTypeOf<IntegratedRecommendation>().toHaveProperty('pathId');
    expectTypeOf<IntegratedRecommendation>().toHaveProperty('pathName');
    expectTypeOf<IntegratedRecommendation>().toHaveProperty('fitScore');
    expectTypeOf<IntegratedRecommendation>().toHaveProperty('warnings');
  });

  it('keeps IntegratedRecommendation out of runtime exports', async () => {
    const barrel = await import('../index');

    expect('IntegratedRecommendation' in barrel).toBe(false);
    expect('PathRecommendation' in barrel).toBe(false);
  });

  it('keeps the career-path barrel stable for runtime and type-only exports', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-path-intelligence/index.ts'),
      'utf8'
    );
    const runtimeExportBlocks = Array.from(source.matchAll(/export\s+\{([\s\S]*?)\}\s+from/g))
      .map((match) => match[1])
      .join('\n');

    expect(source).toContain('export type {');
    expect(runtimeExportBlocks).toContain('CareerPathIntelligenceEngine');
    expect(runtimeExportBlocks).toContain('createCareerPathIntelligenceEngine');
    expect(runtimeExportBlocks).not.toMatch(/^\s*CareerPathIntelligenceEngineConfig,\s*$/m);
    expect(runtimeExportBlocks).not.toMatch(/^\s*PathDiscoveryEngineConfig,\s*$/m);
  });

  it('constructs CareerPathIntelligenceEngine without changing runtime behavior', () => {
    const engine = createCareerPathIntelligenceEngine();
    const directEngine = new CareerPathIntelligenceEngine();

    expect(engine).toBeInstanceOf(CareerPathIntelligenceEngine);
    expect(directEngine).toBeInstanceOf(CareerPathIntelligenceEngine);
    expect(engine.getConfig().maxPathsToDiscover).toBeGreaterThan(0);
  });

  it('generates path recommendations with the existing output shape', () => {
    const engine = createCareerPathIntelligenceEngine();
    const recommendations = engine.getPathRecommendations(createTestInput());

    expect(recommendations.length).toBeGreaterThan(0);
    const firstRecommendation: IntegratedRecommendation = recommendations[0];

    expect(firstRecommendation.rank).toBe(1);
    expect(firstRecommendation.pathId).toBeTypeOf('string');
    expect(firstRecommendation.pathName).toBeTypeOf('string');
    expect(firstRecommendation.fitScore).toBeGreaterThanOrEqual(0);
    expect(firstRecommendation.rationale).toBeInstanceOf(Array);
    expect(firstRecommendation.warnings).toBeInstanceOf(Array);
    expect(firstRecommendation.nextSteps).toBeInstanceOf(Array);
  });

  it('preserves the analysis recommendation output contract', () => {
    const engine = createCareerPathIntelligenceEngine();
    const analysis: CareerPathIntelligenceAnalysis = engine.analyze(createTestInput());

    expect(analysis.recommendations.length).toBeGreaterThan(0);
    expectTypeOf<typeof analysis.recommendations[number]>().toEqualTypeOf<PathRecommendation>();
    expect(analysis.recommendations[0]).toHaveProperty('pathId');
    expect(analysis.recommendations[0]).toHaveProperty('pathName');
    expect(analysis.recommendations[0]).toHaveProperty('fitScore');
  });

  it('does not alter the existing career recommendation type surface', () => {
    expectTypeOf<CareerRecommendation>().toHaveProperty('careerId');
    expectTypeOf<CareerRecommendation>().toHaveProperty('careerTitle');
    expectTypeOf<CareerRecommendation>().toHaveProperty('recommendationType');
    expectTypeOf<CareerRecommendation>().toHaveProperty('fitResult');
    expectTypeOf<CareerRecommendation>().toHaveProperty('confidence');
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});

function createTestInput(): CareerPathIntelligenceInput {
  return {
    studentProfile: {
      id: 'phase-6-6-10-student',
      currentEducationLevel: 'SCHOOL_12',
      yearsOfExperience: 0,
      skills: ['Problem Solving', 'Communication'],
      credentials: ['Class 12'],
      certifications: [],
      financialConstraints: {
        maxInvestment: 2000000,
        monthlyBudget: 30000,
        canTakeLoan: true,
      },
      timeConstraints: {
        maxDuration: 72,
        hoursPerWeek: 40,
        canRelocate: true,
      },
      locationConstraints: {
        preferredLocations: ['Bangalore'],
        forbiddenLocations: [],
        remotePreference: 'OPEN',
      },
      riskTolerance: 'MODERATE',
      preferredPathTypes: [PathType.DIRECT, PathType.CORPORATE],
      careerGoals: ['Software Engineer'],
      familyContext: {
        dependents: 0,
        pressureSources: [],
      },
    },
    targetCareer: 'Software Engineer',
    constraints: {
      maxPaths: 5,
      maxDuration: 84,
      maxCost: 2500000,
    },
    preferences: {
      prioritizeSpeed: false,
      prioritizeOptionality: true,
      prioritizeSecurity: true,
      prioritizeCost: false,
    },
    timestamp: Date.now(),
  };
}
