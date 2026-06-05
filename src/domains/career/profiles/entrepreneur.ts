/**
 * Entrepreneur Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
} from '../Career';

export const entrepreneur = new CareerBuilder(
  'entrepreneur',
  'Entrepreneur / Startup Founder'
)
  .withDescription(
    'Identifies opportunities, builds businesses, and creates value. Entrepreneurs take financial risks ' +
    'to start ventures that solve problems or meet market needs. In India, the startup ecosystem has ' +
    'exploded with unicorns like Flipkart, Paytm, Ola, and Byju\'s. Entrepreneurs work in uncertainty, ' +
    'wear multiple hats, and face high failure rates, but successful exits can create generational wealth. ' +
    'Paths include tech startups, small businesses, family business expansion, and social enterprises. ' +
    'No formal requirements - successful entrepreneurs come from all backgrounds.',
    'Build something from nothing'
  )
  .inCategory(CareerCategory.BUSINESS)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.7,
    creativity: 0.9,
    socialOrientation: 0.7,
    leadership: 0.9,
    detailOrientation: 0.6,
    curiosity: 0.9,
    competitiveness: 0.9,
    riskTolerance: 0.95,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.5,
    officeWork: 0.3,
    fieldWork: 0.3,
    travelRequirement: 0.4,
    teamOrientation: 0.7,
    soloOrientation: 0.5,
    structuredEnvironment: 0.1,
    unstructuredEnvironment: 0.95,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 1.0,
    statusPotential: 0.8,
    impactPotential: 0.9,
    freedomPotential: 0.9,
    stabilityPotential: 0.1,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.95,
    automationRisk: 0.1,
    competitionLevel: 0.9,
    incomeVolatility: 0.95,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.9,
    transferableSkills: 0.8,
    entrepreneurshipPotential: 1.0,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.NO_FORMAL_REQUIREMENT,
    typicalDegrees: [DegreeType.BTECH, DegreeType.MBA, DegreeType.BBA],
    certifications: [],
    notes: 'No formal education required. Many successful founders are college dropouts or have ' +
           'non-traditional backgrounds. MBA helpful for network and frameworks but not essential. ' +
           'Engineering background common for tech startups.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.0,
    urbanAdvantage: 0.7,
    englishDependency: 0.6,
    migrationRequirement: 0.5,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'product-manager',
      'investor',
      'consultant',
      'author',
      'public-speaker',
    ],
    futureCareerPaths: [
      'founder',
      'serial-founder',
      'scale-up-ceo',
      'exit-via-acquisition',
      'exit-via-ipo',
      'angel-investor',
      'vc-partner',
    ],
    yearsToFirstMilestone: '3-5 years to product-market fit or failure',
    ceilingPotential: 'Unicorn founder, billionaire, or industry shaker',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 0,
      max: 500000,
      median: 0,
    },
    midCareerSalaryIndia: {
      min: 0,
      max: 2000000,
      median: 600000,
    },
    seniorSalaryIndia: {
      min: 1000000,
      max: 100000000,
      median: 5000000,
    },
    notes: 'Zero salary common in early years. Bootstrapped founders may take no pay for 1-3 years. ' +
           'VC-funded startup founders: 15-50 LPA. Successful exits: 10Cr-1000Cr+. ' +
           '90% of startups fail. Of the 10% that survive, only 1% become unicorns. ' +
           'Expected value calculation essential for decision-making.',
  })

  .withDataSource('CareerOS Research 2024', 0.8)
  .build();

export default entrepreneur;
