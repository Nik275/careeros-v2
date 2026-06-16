import { describe, expect, it } from 'vitest';
import { AuthorityRegistrationService } from '../AuthorityRegistrationService';
import { OptionGeneratorAuthorityFacade } from '../OptionGeneratorAuthorityFacade';
import { OutcomeTrackerAuthorityFacade } from '../OutcomeTrackerAuthorityFacade';
import { StudentUnderstandingAuthorityFacade } from '../StudentUnderstandingAuthorityFacade';

const FIXED_TIME = '2026-06-05T00:00:00.000Z';

describe('AuthorityRegistrationService', () => {
  it('registers all Phase 4.1 authority facades and exposes registry status', () => {
    const service = new AuthorityRegistrationService({
      now: () => FIXED_TIME,
    });
    const student = new StudentUnderstandingAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const option = new OptionGeneratorAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const outcome = new OutcomeTrackerAuthorityFacade({
      now: () => FIXED_TIME,
    });

    const studentRegistration = student.register(service);
    const optionRegistration = option.register(service);
    const outcomeRegistration = outcome.register(service);
    const status = service.getRegistryStatus();

    expect(studentRegistration).toMatchObject({
      authority: 'StudentUnderstandingAuthority',
      capability: 'UNDERSTAND',
      ownedModuleCount: 50,
      registered: true,
      registeredAt: FIXED_TIME,
    });
    expect(optionRegistration.ownedModuleCount).toBe(339);
    expect(outcomeRegistration.ownedModuleCount).toBe(55);
    expect(status.activeAuthorityCount).toBe(3);
    expect(status.missingRequiredAuthorities).toEqual([]);
    expect(status.registryHealthy).toBe(true);
    expect(status.registryRecordCount).toBe(444);
    expect(status.coverage.map((entry) => [entry.authority, entry.registered])).toEqual([
      ['StudentUnderstandingAuthority', true],
      ['OptionGeneratorAuthority', true],
      ['OutcomeTrackerAuthority', true],
    ]);
    expect(service.getEmittedEvents()).toHaveLength(3);
    expect(student.getRegistration()?.registrationId).toBe(
      'authority-registration-StudentUnderstandingAuthority'
    );
  });

  it('validates uniqueness for active authority registrations', () => {
    const service = new AuthorityRegistrationService({
      now: () => FIXED_TIME,
    });
    const first = new StudentUnderstandingAuthorityFacade({
      now: () => FIXED_TIME,
    });
    const duplicate = new StudentUnderstandingAuthorityFacade({
      now: () => FIXED_TIME,
    });

    first.register(service);

    expect(() => duplicate.register(service)).toThrow(
      'StudentUnderstandingAuthority is already registered.'
    );
    expect(service.listActiveAuthorities()).toHaveLength(1);
  });

  it('reports missing required authorities before registration completes', () => {
    const service = new AuthorityRegistrationService({
      now: () => FIXED_TIME,
    });
    const option = new OptionGeneratorAuthorityFacade({
      now: () => FIXED_TIME,
    });

    option.register(service);

    expect(service.getRegistryStatus().missingRequiredAuthorities).toEqual([
      'StudentUnderstandingAuthority',
      'OutcomeTrackerAuthority',
    ]);
  });
});
