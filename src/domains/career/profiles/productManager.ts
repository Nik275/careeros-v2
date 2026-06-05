/**
 * Product Manager Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
  CertificationType,
} from '../Career';

export const productManager = new CareerBuilder(
  'product-manager',
  'Product Manager'
)
  .withDescription(
    'Defines product vision, strategy, and roadmap. Bridges business, technology, and user needs ' +
    'to build successful products. Product managers prioritize features, work with engineering teams, ' +
    'analyze metrics, and make data-driven decisions. In India, PM roles are growing rapidly with ' +
    'the startup ecosystem and entry of global tech companies. PMs need a mix of technical understanding, ' +
    'business acumen, and user empathy. Backgrounds vary widely: engineering, MBA, design, or even liberal arts.',
    'Build products that users love'
  )
  .inCategory(CareerCategory.TECHNOLOGY)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.8,
    creativity: 0.7,
    socialOrientation: 0.8,
    leadership: 0.8,
    detailOrientation: 0.6,
    curiosity: 0.9,
    competitiveness: 0.7,
    riskTolerance: 0.6,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.6,
    officeWork: 0.5,
    fieldWork: 0.1,
    travelRequirement: 0.2,
    teamOrientation: 0.9,
    soloOrientation: 0.3,
    structuredEnvironment: 0.4,
    unstructuredEnvironment: 0.6,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.9,
    statusPotential: 0.75,
    impactPotential: 0.8,
    freedomPotential: 0.7,
    stabilityPotential: 0.6,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.7,
    automationRisk: 0.3,
    competitionLevel: 0.7,
    incomeVolatility: 0.5,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.8,
    transferableSkills: 0.8,
    entrepreneurshipPotential: 0.9,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.BTECH, DegreeType.MBA, DegreeType.BBA, DegreeType.BA],
    certifications: [CertificationType.SCRUM_MASTER],
    notes: 'No specific degree required. Engineering + MBA common. Many PMs come from engineering ' +
           'backgrounds or business school. Startup experience highly valued.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.1,
    urbanAdvantage: 0.7,
    englishDependency: 0.8,
    migrationRequirement: 0.4,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'software-engineer',
      'product-marketing-manager',
      'strategy-consultant',
      'startup-founder',
      'engineering-manager',
    ],
    futureCareerPaths: [
      'associate-product-manager',
      'product-manager',
      'senior-product-manager',
      'group-product-manager',
      'director-of-product',
      'vp-product',
      'chief-product-officer',
      'founder',
    ],
    yearsToFirstMilestone: '3-5 years to Senior PM',
    ceilingPotential: 'CPO at unicorn, successful founder, or VC partner',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 800000,
      max: 2500000,
      median: 1500000,
    },
    midCareerSalaryIndia: {
      min: 2000000,
      max: 8000000,
      median: 4500000,
    },
    seniorSalaryIndia: {
      min: 6000000,
      max: 25000000,
      median: 12000000,
    },
    notes: 'APM programs at Google, Microsoft: 20-35 LPA. Mid-level at startups: 30-60 LPA. ' +
           'Senior PMs at unicorns: 80L-2Cr+. Stock options can be significant at startups. ' +
           'CPOs at large tech companies: 2Cr-5Cr+.',
  })

  .withDataSource('CareerOS Research 2024', 0.85)
  .build();

export default productManager;
