import { describe, expect, it } from 'vitest';

import { EconomicConstraintEngine } from '../engines/EconomicConstraintEngine';
import {
  normalizeLoanToleranceToWillingness,
  type IndiaLoanTolerance,
  type IndiaLoanWillingness,
} from '../vocabulary';
import {
  EconomicStratum,
  FamilyBusinessInvolvement,
  IndiaCareerMotivation,
  RegionalTier,
  type IndiaIntelligenceInput,
} from '../types';

const expectedLoanMappings: Record<IndiaLoanTolerance, IndiaLoanWillingness> = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MODERATE',
  HIGH: 'HIGH',
};

function createInput(loanTolerance: IndiaLoanTolerance): IndiaIntelligenceInput {
  return {
    profile: {
      id: 'india-loan-vocabulary-student',
      currentLocation: RegionalTier.TIER_2_CITY,
      homeState: 'Maharashtra',
      motherTongue: 'Marathi',
      languagesKnown: ['Marathi', 'Hindi', 'English'],
      familyIncome: EconomicStratum.MIDDLE_CLASS,
      familyBusinessInvolvement: FamilyBusinessInvolvement.NO_BUSINESS,
      parentOccupations: {
        father: 'Teacher',
        mother: 'Homemaker',
      },
      familyDependents: 1,
      currentEducationLevel: 'SCHOOL_12',
      board: 'CBSE',
      academicPerformance: {
        class10Percentage: 91,
        class12Percentage: 88,
      },
      examAttempts: [],
      canRelocate: true,
      relocationConstraints: [],
      financialConstraints: {
        maxEducationBudget: 1200000,
        canTakeEducationLoan: true,
        loanTolerance,
      },
      familyExpectations: ['Stable career'],
      familyPressureSources: [],
      pressureIntensity: 'LOW',
    },
    statedPreferences: {
      preferredCareers: ['Software Engineer'],
      rejectedCareers: [],
      preferredLocations: ['Pune', 'Mumbai'],
      willingToTakeGapYear: false,
      willingToStudyAbroad: false,
      willingToJoinFamilyBusiness: false,
      preferredMotivations: [
        IndiaCareerMotivation.STABILITY_SEEKING,
        IndiaCareerMotivation.SOCIAL_MOBILITY,
      ],
    },
    selfAssessment: {
      riskTolerance: 'MEDIUM',
      preferredWorkEnvironment: 'CORPORATE',
      importanceOfPrestige: 3,
      importanceOfStability: 5,
      importanceOfIncome: 4,
      importanceOfLocation: 3,
    },
    timestamp: 1710000000000,
  };
}

describe('India loan vocabulary contract', () => {
  it('imports EconomicConstraintEngine successfully', () => {
    expect(new EconomicConstraintEngine()).toBeInstanceOf(EconomicConstraintEngine);
  });

  it.each([
    ['NONE', 'NONE'],
    ['LOW', 'LOW'],
    ['MEDIUM', 'MODERATE'],
    ['HIGH', 'HIGH'],
  ] satisfies Array<[IndiaLoanTolerance, IndiaLoanWillingness]>)(
    'maps loanTolerance %s to loanWillingness %s',
    (loanTolerance, loanWillingness) => {
      expect(normalizeLoanToleranceToWillingness(loanTolerance)).toBe(loanWillingness);
    }
  );

  it('has an exhaustive mapping for every current loan tolerance value', () => {
    const supportedValues = Object.keys(expectedLoanMappings).sort();

    expect(supportedValues).toEqual(['HIGH', 'LOW', 'MEDIUM', 'NONE']);
    for (const loanTolerance of supportedValues as IndiaLoanTolerance[]) {
      expect(normalizeLoanToleranceToWillingness(loanTolerance)).toBe(
        expectedLoanMappings[loanTolerance]
      );
    }
  });

  it('never emits MEDIUM when output contract expects MODERATE', () => {
    const emittedValues = (Object.keys(expectedLoanMappings) as IndiaLoanTolerance[]).map(
      normalizeLoanToleranceToWillingness
    );

    expect(emittedValues).not.toContain('MEDIUM');
    expect(emittedValues).toContain('MODERATE');
  });

  it('returns MODERATE loan willingness from economic analysis for MEDIUM loan tolerance', () => {
    const analysis = new EconomicConstraintEngine().analyze(createInput('MEDIUM'));

    expect(analysis.affordability.loanWillingness).toBe('MODERATE');
    expect(analysis.affordability.loanCapacity).toBeGreaterThan(0);
    expect(analysis.recommendations.financiallyViablePaths.length).toBeGreaterThan(0);
  });

  it('does not enable live routing or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
