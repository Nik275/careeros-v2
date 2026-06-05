/**
 * Data Scientist Career Profile
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

export const dataScientist = new CareerBuilder(
  'data-scientist',
  'Data Scientist'
)
  .withDescription(
    'Analyzes complex data to extract insights, build predictive models, and support business decisions. ' +
    'Uses statistics, machine learning, and programming to solve problems. Data scientists work across ' +
    'industries: tech, finance, healthcare, e-commerce, and consulting. In India, demand is growing rapidly ' +
    'with digital transformation across sectors. The role requires strong math/stats foundation, ' +
    'programming skills (Python/R), and domain knowledge. Specializations include ML engineer, ' +
    'AI researcher, and business analyst.',
    'Turn data into decisions'
  )
  .inCategory(CareerCategory.TECHNOLOGY)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.95,
    creativity: 0.6,
    socialOrientation: 0.4,
    leadership: 0.4,
    detailOrientation: 0.85,
    curiosity: 0.9,
    competitiveness: 0.5,
    riskTolerance: 0.5,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.7,
    officeWork: 0.4,
    fieldWork: 0.0,
    travelRequirement: 0.1,
    teamOrientation: 0.5,
    soloOrientation: 0.7,
    structuredEnvironment: 0.4,
    unstructuredEnvironment: 0.6,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.9,
    statusPotential: 0.75,
    impactPotential: 0.7,
    freedomPotential: 0.7,
    stabilityPotential: 0.7,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.6,
    automationRisk: 0.3,
    competitionLevel: 0.7,
    incomeVolatility: 0.4,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.9,
    transferableSkills: 0.9,
    entrepreneurshipPotential: 0.7,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.MASTERS,
    typicalDegrees: [DegreeType.MSC, DegreeType.MTECH, DegreeType.BTECH],
    certifications: [
      CertificationType.DATA_SCIENCE_CERTIFICATION,
      CertificationType.MACHINE_LEARNING_CERTIFICATION,
    ],
    notes: 'Masters in Stats/CS preferred but not mandatory. Strong portfolio (Kaggle, GitHub) ' +
           'can substitute for formal education. PhD required for research roles.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.2,
    urbanAdvantage: 0.6,
    englishDependency: 0.6,
    migrationRequirement: 0.2,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'software-engineer',
      'machine-learning-engineer',
      'data-engineer',
      'business-analyst',
      'product-manager',
    ],
    futureCareerPaths: [
      'junior-data-scientist',
      'data-scientist',
      'senior-data-scientist',
      'staff-data-scientist',
      'principal-data-scientist',
      'director-of-data-science',
      'chief-data-officer',
    ],
    yearsToFirstMilestone: '2-4 years to Senior Data Scientist',
    ceilingPotential: 'Chief Data Officer, AI Research Director, or founder',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 600000,
      max: 1800000,
      median: 1000000,
    },
    midCareerSalaryIndia: {
      min: 1500000,
      max: 6000000,
      median: 3000000,
    },
    seniorSalaryIndia: {
      min: 5000000,
      max: 20000000,
      median: 10000000,
    },
    notes: 'Freshers: 6-18 LPA. Mid-level (5 years): 20-50 LPA. Senior at tech companies: 50L-1.5Cr+. ' +
           'AI/ML specialists at top companies (Google, Meta) can earn 80L-2Cr+. ' +
           'PhDs in AI from top schools can command 1Cr+ starting.',
  })

  .withDataSource('CareerOS Research 2024', 0.85)
  .build();

export default dataScientist;
