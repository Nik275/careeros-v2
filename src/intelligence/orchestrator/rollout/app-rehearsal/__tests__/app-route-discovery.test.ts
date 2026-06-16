import { describe, expect, it } from 'vitest';
import {
  analyzeAppRouteGaps,
  discoverAppEntrypoints,
  selectAppEntrypointAlignmentStrategy,
} from '../AppRouteDiscovery';

describe('Phase 5.9 app route discovery', () => {
  it('identifies assessment candidates and missing direct app-to-engine coverage', () => {
    const assessment = discoverAppEntrypoints().find(
      (entrypoint) => entrypoint.entrypointId === 'assessment-page.client-flow'
    );

    expect(assessment).toBeDefined();
    expect(assessment?.callsAssessmentProcessResponses).toBe(false);
    expect(assessment?.reachesObserveHook).toBe(false);
    expect(analyzeAppRouteGaps().find((gap) => gap.flow === 'ASSESSMENT')?.rootCause).toBe(
      'app route uses client-only logic'
    );
  });

  it('identifies career-fit candidates and the missing app route', () => {
    const dashboard = discoverAppEntrypoints().find(
      (entrypoint) => entrypoint.entrypointId === 'results-dashboard.component'
    );

    expect(dashboard).toBeDefined();
    expect(dashboard?.callsCareerFitCalculateFit).toBe(false);
    expect(dashboard?.currentBehavior).toContain('mockResults');
    expect(analyzeAppRouteGaps().find((gap) => gap.flow === 'CAREER-FIT')?.rootCause).toBe(
      'app route missing entirely'
    );
  });

  it('selects the strict test-only rehearsal adapter strategy', () => {
    const strategy = selectAppEntrypointAlignmentStrategy();

    expect(strategy.decision).toBe('IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER');
    expect(strategy.forbiddenActionsPreserved).toContain('no production route output replacement');
    expect(strategy.alignments.every((alignment) => alignment.liveRoutingEnabled === false)).toBe(true);
  });
});
