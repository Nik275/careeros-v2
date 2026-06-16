import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  CareerTransitionGraphV1,
  createCareerTransitionGraph,
  findCareerTransitionPath,
  type CareerNode,
  type SkillCategory,
} from '../index';
import type { Career, PsychologicalProfile } from '../../../domains/career/Career';
import type {
  CareerSkillProfile,
  SkillCategory as TaxonomySkillCategory,
} from '../../skill-taxonomy/SkillTaxonomyV1';
import type { CareerRecommendation } from '../../../recommendation/recommendation-types';

describe('Phase 6.6.11 SkillProfile career-transition build regression', () => {
  it('imports and constructs CareerTransitionGraphV1 without the stale SkillProfile import', () => {
    expect(CareerTransitionGraphV1).toBeTypeOf('function');

    const graph = new CareerTransitionGraphV1();

    expect(graph.size()).toEqual({ nodes: 0, edges: 0 });
  });

  it('keeps SkillProfile out of the career-transition import surface', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-transition-graph/CareerTransitionGraphV1.ts'),
      'utf8'
    );

    expect(source).toContain("import type { Career, PsychologicalProfile } from '../../domains/career/Career';");
    expect(source).not.toMatch(/import\s+type\s+\{[^}]*SkillProfile[^}]*\}\s+from\s+['"]\.\.\/\.\.\/domains\/career\/Career['"]/);
  });

  it('documents the canonical skill-profile type surface without creating a divergent SkillProfile alias', () => {
    expectTypeOf<CareerSkillProfile>().toHaveProperty('careerId');
    expectTypeOf<CareerSkillProfile>().toHaveProperty('requiredSkills');
    expectTypeOf<CareerSkillProfile>().toHaveProperty('primaryCategories');
    expectTypeOf<CareerSkillProfile['primaryCategories'][number]>().toEqualTypeOf<TaxonomySkillCategory>();
  });

  it('preserves the career-transition graph skill surface', () => {
    expectTypeOf<CareerNode>().toHaveProperty('requiredProfile');
    expectTypeOf<CareerNode>().toHaveProperty('keySkills');
    expectTypeOf<CareerNode>().toHaveProperty('skillCategories');
    expectTypeOf<CareerNode['requiredProfile']>().toEqualTypeOf<PsychologicalProfile>();
    expectTypeOf<CareerNode['keySkills']>().toEqualTypeOf<string[]>();
    expectTypeOf<CareerNode['skillCategories'][number]>().toEqualTypeOf<SkillCategory>();
  });

  it('keeps minimal career-transition fixtures type-safe and output shape stable', () => {
    const graph = createCareerTransitionGraph([
      careerFixture({
        id: 'software-engineer',
        name: 'Software Engineer',
        psychologicalProfile: psychologicalProfile({
          analyticalThinking: 0.9,
          curiosity: 0.8,
          detailOrientation: 0.8,
        }),
      }),
      careerFixture({
        id: 'product-manager',
        name: 'Product Manager',
        psychologicalProfile: psychologicalProfile({
          analyticalThinking: 0.8,
          leadership: 0.8,
          socialOrientation: 0.8,
        }),
      }),
    ]);

    const sourceNode = graph.getNode('software-engineer');
    const targetNode = graph.getNode('product-manager');
    const path = findCareerTransitionPath('software-engineer', 'product-manager', graph);

    expect(sourceNode?.keySkills).toContain('analytical-thinking');
    expect(sourceNode?.keySkills).toContain('attention-to-detail');
    expect(sourceNode?.skillCategories).toContain('technical');
    expect(targetNode?.keySkills).toContain('leadership');
    expect(targetNode?.skillCategories).toContain('business');
    expect(path?.nodeIds).toEqual(['software-engineer', 'product-manager']);
    expect(path?.edges[0]).toMatchObject({
      fromNodeId: 'software-engineer',
      toNodeId: 'product-manager',
    });
  });

  it('preserves the existing recommendation output type surface', () => {
    expectTypeOf<CareerRecommendation>().toHaveProperty('careerId');
    expectTypeOf<CareerRecommendation>().toHaveProperty('careerTitle');
    expectTypeOf<CareerRecommendation>().toHaveProperty('recommendationType');
    expectTypeOf<CareerRecommendation>().toHaveProperty('fitResult');
    expectTypeOf<CareerRecommendation>().toHaveProperty('confidence');
  });

  it('does not enable live rollout, shadow routing, or raw payload capture by default', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});

function psychologicalProfile(overrides: Partial<PsychologicalProfile> = {}): PsychologicalProfile {
  return {
    analyticalThinking: 0.7,
    creativity: 0.5,
    socialOrientation: 0.5,
    leadership: 0.5,
    detailOrientation: 0.7,
    curiosity: 0.7,
    competitiveness: 0.4,
    riskTolerance: 0.4,
    ...overrides,
  };
}

function careerFixture(overrides: Partial<Career> & { id: string; name: string }): Career {
  const { id, name, psychologicalProfile: profileOverrides, ...rest } = overrides;

  return {
    id,
    name,
    slug: id,
    category: 'technology',
    description: `${name} fixture`,
    tagline: 'Build regression fixture',
    psychologicalProfile: psychologicalProfile(profileOverrides),
    workStyle: {
      remoteWork: 0.7,
      officeWork: 0.4,
      fieldWork: 0.1,
      travelRequirement: 0.2,
      teamOrientation: 0.6,
      soloOrientation: 0.4,
      structuredEnvironment: 0.5,
      unstructuredEnvironment: 0.5,
    },
    rewardProfile: {
      incomePotential: 0.7,
      statusPotential: 0.6,
      impactPotential: 0.6,
      freedomPotential: 0.6,
      stabilityPotential: 0.6,
    },
    riskProfile: {
      burnoutRisk: 0.5,
      automationRisk: 0.3,
      competitionLevel: 0.5,
      incomeVolatility: 0.4,
    },
    optionality: {
      careerFlexibility: 0.7,
      transferableSkills: 0.7,
      entrepreneurshipPotential: 0.5,
    },
    education: {
      minimumLevel: 'bachelors',
      typicalDegrees: ['B.Tech'],
      certifications: [],
    },
    indiaReality: {
      coachingDependency: 0.3,
      urbanAdvantage: 0.6,
      englishDependency: 0.5,
      migrationRequirement: 0.2,
      reservationApplicable: false,
    },
    evolution: {
      adjacentCareers: [],
      futureCareerPaths: [],
    },
    salary: {
      entrySalaryIndia: { min: 400000, max: 1000000, median: 700000 },
      midCareerSalaryIndia: { min: 1000000, max: 3000000, median: 2000000 },
      seniorSalaryIndia: { min: 2500000, max: 8000000, median: 5000000 },
    },
    createdAt: new Date('2026-06-07T00:00:00.000Z'),
    updatedAt: new Date('2026-06-07T00:00:00.000Z'),
    schemaVersion: 1,
    ...rest,
  } as Career;
}
