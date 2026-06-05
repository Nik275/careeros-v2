/**
 * Civil Servant (IAS/IPS/IFS) Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
} from '../Career';

export const civilServant = new CareerBuilder(
  'civil-servant',
  'Civil Servant (IAS/IPS/IFS)'
)
  .withDescription(
    'Administrates government functions, implements policies, and serves the public. The Indian Administrative ' +
    'Service (IAS) is the premier civil service handling district administration, policy formulation, and ' +
    'implementation. IPS handles law enforcement, IFS manages foreign diplomacy. Considered one of the most ' +
    'prestigious careers in India with immense social status, job security, and power to impact millions. ' +
    'Requires clearing UPSC Civil Services Examination, one of the world\'s toughest competitive exams ' +
    'with a success rate of less than 0.1%.',
    'Serve the nation and shape policy'
  )
  .inCategory(CareerCategory.GOVERNMENT)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.8,
    creativity: 0.4,
    socialOrientation: 0.8,
    leadership: 0.9,
    detailOrientation: 0.8,
    curiosity: 0.8,
    competitiveness: 0.9,
    riskTolerance: 0.5,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.1,
    officeWork: 0.8,
    fieldWork: 0.5,
    travelRequirement: 0.5,
    teamOrientation: 0.8,
    soloOrientation: 0.3,
    structuredEnvironment: 0.95,
    unstructuredEnvironment: 0.05,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.5,
    statusPotential: 0.98,
    impactPotential: 0.95,
    freedomPotential: 0.4,
    stabilityPotential: 1.0,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.7,
    automationRisk: 0.05,
    competitionLevel: 1.0,
    incomeVolatility: 0.0,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.2,
    transferableSkills: 0.5,
    entrepreneurshipPotential: 0.2,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.BA, DegreeType.BSC, DegreeType.BCOM, DegreeType.BTECH, DegreeType.MBA],
    certifications: [],
    notes: 'Any bachelor\'s degree eligible. UPSC CSE requires extensive preparation (1-3 years). ' +
           'Coaching at institutes like Vajiram, Rau\'s IAS common but not mandatory. ' +
           'Success rate: ~0.1% of applicants clear the exam.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.8,
    urbanAdvantage: 0.3,
    englishDependency: 0.7,
    migrationRequirement: 0.8,
    reservationApplicable: true,
    reservationCategories: ['SC', 'ST', 'OBC', 'EWS'],
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'public-policy-analyst',
      'politician',
      'international-organizations',
      'corporate-strategy',
    ],
    futureCareerPaths: [
      'probationary-officer',
      'sub-divisional-magistrate',
      'district-magistrate',
      'divisional-commissioner',
      'secretary',
      'principal-secretary',
      'chief-secretary',
      'cabinet-secretary',
    ],
    yearsToFirstMilestone: '2 years training + 4 years to SDM',
    ceilingPotential: 'Cabinet Secretary of India, Chief Secretary of State, or Ambassador',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 900000,
      max: 1200000,
      median: 1000000,
    },
    midCareerSalaryIndia: {
      min: 1500000,
      max: 2500000,
      median: 2000000,
    },
    seniorSalaryIndia: {
      min: 2500000,
      max: 3500000,
      median: 3000000,
    },
    notes: 'Salary modest compared to private sector but includes significant perks: ' +
           'government housing, official vehicle, staff, medical coverage, pension. ' +
           'District Magistrate gets bungalow, car, security. Post-retirement opportunities ' +
           'in politics, corporate boards, or international organizations.',
  })

  .withDataSource('DoPT + UPSC + CareerOS Research 2024', 0.95)
  .build();

export default civilServant;
