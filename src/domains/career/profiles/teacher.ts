/**
 * Teacher Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
} from '../Career';

export const teacher = new CareerBuilder(
  'teacher',
  'Teacher'
)
  .withDescription(
    'Educates students, designs curriculum, and shapes the next generation. Teachers work in schools, ' +
    'colleges, universities, and coaching institutes. In India, teaching offers job security, ' +
    'work-life balance, and immense social respect. Options range from government school teachers ' +
    '(through TET/CTET) to university professors (through NET/SET). Private school teachers earn less ' +
    'but have better infrastructure. Coaching institute teachers (IIT-JEE, NEET) can earn exceptionally ' +
    'well. Online teaching and EdTech roles are growing rapidly.',
    'Shape minds and build the future'
  )
  .inCategory(CareerCategory.EDUCATION)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.6,
    creativity: 0.7,
    socialOrientation: 0.9,
    leadership: 0.6,
    detailOrientation: 0.6,
    curiosity: 0.8,
    competitiveness: 0.3,
    riskTolerance: 0.2,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.2,
    officeWork: 0.7,
    fieldWork: 0.1,
    travelRequirement: 0.1,
    teamOrientation: 0.7,
    soloOrientation: 0.5,
    structuredEnvironment: 0.7,
    unstructuredEnvironment: 0.3,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.4,
    statusPotential: 0.85,
    impactPotential: 0.9,
    freedomPotential: 0.5,
    stabilityPotential: 0.85,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.6,
    automationRisk: 0.2,
    competitionLevel: 0.6,
    incomeVolatility: 0.2,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.5,
    transferableSkills: 0.6,
    entrepreneurshipPotential: 0.5,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.BED, DegreeType.BA, DegreeType.BSC, DegreeType.MED, DegreeType.MA, DegreeType.MSC],
    certifications: [],
    notes: 'B.Ed required for school teaching. TET/CTET for government schools. ' +
           'NET/SET + PhD for university professorship. Coaching teachers often need ' +
           'no formal teaching degree but strong subject expertise.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.3,
    urbanAdvantage: 0.4,
    englishDependency: 0.4,
    migrationRequirement: 0.1,
    reservationApplicable: true,
    reservationCategories: ['SC', 'ST', 'OBC', 'EWS'],
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'educational-consultant',
      'content-developer',
      'edtech-product-manager',
      'academic-coordinator',
    ],
    futureCareerPaths: [
      'assistant-teacher',
      'teacher',
      'senior-teacher',
      'head-of-department',
      'vice-principal',
      'principal',
      'director',
      'education-officer',
    ],
    yearsToFirstMilestone: '2-3 years to Senior Teacher',
    ceilingPotential: 'Principal of prestigious school, Education Secretary, or EdTech founder',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 200000,
      max: 800000,
      median: 400000,
    },
    midCareerSalaryIndia: {
      min: 400000,
      max: 1500000,
      median: 800000,
    },
    seniorSalaryIndia: {
      min: 800000,
      max: 4000000,
      median: 1800000,
    },
    notes: 'Government school teachers (TET): 3-8 LPA with job security. Private schools: 2-6 LPA. ' +
           'International schools: 6-15 LPA. University professors: 8-20 LPA. ' +
           'Coaching institute teachers (IIT-JEE/NEET): 10L-1Cr+ depending on reputation. ' +
           'Star teachers at Kota institutes earn 50L-2Cr+.',
  })

  .withDataSource('NCTE + UGC + CareerOS Research 2024', 0.85)
  .build();

export default teacher;
