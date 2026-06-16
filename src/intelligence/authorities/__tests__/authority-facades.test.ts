import { describe, expect, it } from 'vitest';
import { OptionGeneratorAuthorityFacade } from '../OptionGeneratorAuthorityFacade';
import { OutcomeTrackerAuthorityFacade } from '../OutcomeTrackerAuthorityFacade';
import { StudentUnderstandingAuthorityFacade } from '../StudentUnderstandingAuthorityFacade';

const FIXED_TIME = '2026-06-05T00:00:00.000Z';

describe('authority facades', () => {
  it('preserves exact synchronous engine output while observing student understanding execution', () => {
    const facade = new StudentUnderstandingAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const engineOutput = {
      studentModelId: 'student-model-1',
      dimensions: {
        curiosity: 0.91,
      },
    };

    const result = facade.processAssessment(() => engineOutput, {
      modulePath: 'src/assessment/assessment-engine.ts',
      auditNotes: ['unit-test assessment wrapper'],
      eventPayload: {
        requestId: 'request-1',
      },
    });

    const validation = facade.getLastValidationSnapshot();

    expect(result).toBe(engineOutput);
    expect(validation?.authority).toBe('StudentUnderstandingAuthority');
    expect(validation?.ownership.valid).toBe(true);
    expect(validation?.capability.valid).toBe(true);
    expect(validation?.access.summary.totalViolations).toBe(0);
    expect(facade.getAuditHistory()).toHaveLength(1);
    expect(facade.getEmittedEvents().map((event) => event.eventType)).toEqual([
      'authority.usage.observed',
      'validation.started',
      'validation.completed',
      'audit.report.created',
    ]);
  });

  it('preserves exact async engine output while observing outcome tracking execution', async () => {
    const facade = new OutcomeTrackerAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const outcome = {
      outcomeId: 'outcome-1',
      status: 'recorded',
    };

    const result = await facade.trackOutcome(() => Promise.resolve(outcome), {
      modulePath: 'src/outcome-tracking/engines/outcome-tracking-engine.ts',
    });

    expect(result).toBe(outcome);
    expect(facade.getLastValidationSnapshot()?.access.summary.totalViolations).toBe(0);
    expect(facade.getAuditHistory()).toHaveLength(1);
  });

  it('makes cross-authority boundary violations observable without changing option output', () => {
    const facade = new OptionGeneratorAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const recommendations = [
      {
        careerId: 'software-engineering',
        score: 0.94,
      },
    ];

    const result = facade.generateRecommendations(() => recommendations, {
      modulePath: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
      dependencies: [
        {
          sourceModule: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
          targetModule: 'src/intelligence/student-model/StudentBelief.ts',
          relationshipType: 'import',
          evidence: 'unit-test existing Option -> Student dependency',
        },
      ],
    });

    const validation = facade.getLastValidationSnapshot();

    expect(result).toBe(recommendations);
    expect(validation?.ownership.valid).toBe(true);
    expect(validation?.capability.valid).toBe(true);
    expect(validation?.access.summary.byType.DEPENDENCY_VIOLATION).toBe(1);
    expect(facade.getEmittedEvents().some((event) => event.eventType === 'violation.observed')).toBe(
      true
    );
    expect(facade.getAuditHistory()[0]?.validationSummary.totalViolations).toBe(1);
  });

  it('observes wrong authority and wrong capability usage without blocking execution', () => {
    const facade = new OptionGeneratorAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const profileOutput = {
      profileId: 'student-profile-1',
    };

    const result = facade.generate('misclassifiedProfileRead', () => profileOutput, {
      modulePath: 'src/assessment/assessment-engine.ts',
      capability: 'UNDERSTAND',
    });

    const validation = facade.getLastValidationSnapshot();

    expect(result).toBe(profileOutput);
    expect(validation?.ownership.valid).toBe(false);
    expect(validation?.ownership.observations[0]?.type).toBe('wrong-authority');
    expect(validation?.capability.valid).toBe(false);
    expect(validation?.capability.observations.map((observation) => observation.type)).toContain(
      'wrong-capability'
    );
    expect(validation?.access.summary.byType.AUTHORITY_VIOLATION).toBe(1);
  });

  it('rethrows wrapped engine failures after producing observe-only audit records', () => {
    const facade = new StudentUnderstandingAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const engineError = new Error('engine failed');

    expect(() =>
      facade.interpretProfile(
        () => {
          throw engineError;
        },
        {
          modulePath: 'src/profile/profile-engine.ts',
        }
      )
    ).toThrow(engineError);

    expect(facade.getAuditHistory()).toHaveLength(1);
    expect(facade.getAuditHistory()[0]?.notes).toContain('Wrapped operation failed.');
  });
});
