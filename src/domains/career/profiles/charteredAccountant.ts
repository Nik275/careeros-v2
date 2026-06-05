/**
 * Chartered Accountant Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
} from '../Career';

export const charteredAccountant = new CareerBuilder(
  'chartered-accountant',
  'Chartered Accountant (CA)'
)
  .withDescription(
    'Manages financial records, audits accounts, provides tax advice, and ensures regulatory compliance. ' +
    'CAs work in audit firms, corporate finance departments, banks, or independent practice. ' +
    'In India, CA is one of the most prestigious commerce careers with rigorous qualification through ICAI. ' +
    'The course has three levels: CA Foundation, Intermediate, and Final, with mandatory articleship. ' +
    'CAs are essential for businesses of all sizes and have recession-proof demand.',
    'The backbone of business finance'
  )
  .inCategory(CareerCategory.FINANCE)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.95,
    creativity: 0.2,
    socialOrientation: 0.5,
    leadership: 0.5,
    detailOrientation: 0.95,
    curiosity: 0.5,
    competitiveness: 0.7,
    riskTolerance: 0.3,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.4,
    officeWork: 0.7,
    fieldWork: 0.3,
    travelRequirement: 0.4,
    teamOrientation: 0.5,
    soloOrientation: 0.5,
    structuredEnvironment: 0.9,
    unstructuredEnvironment: 0.1,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.8,
    statusPotential: 0.85,
    impactPotential: 0.5,
    freedomPotential: 0.6,
    stabilityPotential: 0.9,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.7,
    automationRisk: 0.4,
    competitionLevel: 0.85,
    incomeVolatility: 0.3,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.7,
    transferableSkills: 0.7,
    entrepreneurshipPotential: 0.7,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.PROFESSIONAL_DEGREE,
    typicalDegrees: [DegreeType.CA, DegreeType.BCOM, DegreeType.MCOM],
    certifications: [],
    notes: 'CA course: Foundation (after 12th) or Direct Entry (after graduation), ' +
           'Intermediate, 3-year articleship, Final. Pass rates are low (5-10%), ' +
           'making this one of the toughest professional courses.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.8,
    urbanAdvantage: 0.4,
    englishDependency: 0.5,
    migrationRequirement: 0.2,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'cost-accountant',
      'company-secretary',
      'financial-analyst',
      'investment-banker',
      'cfo',
    ],
    futureCareerPaths: [
      'article-assistant',
      'audit-associate',
      'senior-auditor',
      'manager',
      'senior-manager',
      'partner',
      'cfo',
      'finance-director',
    ],
    yearsToFirstMilestone: '3-4 years to clear CA + 2 years to Manager',
    ceilingPotential: 'Partner at Big 4, CFO of large company, or independent practice owner',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 700000,
      max: 1200000,
      median: 900000,
    },
    midCareerSalaryIndia: {
      min: 1500000,
      max: 4000000,
      median: 2500000,
    },
    seniorSalaryIndia: {
      min: 4000000,
      max: 15000000,
      median: 8000000,
    },
    notes: 'Articleship stipend: 2K-10K/month. Fresh CAs: 7-12 LPA. Big 4 partners: 1Cr-5Cr+. ' +
           'Independent practice: 10L to 2Cr+ depending on client base. ' +
           'CFOs of listed companies: 2Cr-10Cr+.',
  })

  .withDataSource('ICAI + CareerOS Research 2024', 0.9)
  .build();

export default charteredAccountant;
