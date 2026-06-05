/**
 * Software Engineer Career Profile
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

export const softwareEngineer = new CareerBuilder(
  'software-engineer',
  'Software Engineer'
)
  .withDescription(
    'Designs, develops, and maintains software applications and systems. Works with programming languages, ' +
    'frameworks, and tools to build everything from mobile apps to enterprise systems. Strong demand across ' +
    'industries with excellent growth trajectories in product companies, startups, and multinational corporations. ' +
    'India is a global hub for software engineering with opportunities ranging from service companies to cutting-edge ' +
    'product development at FAANG companies and successful startups.',
    'Build the digital infrastructure of the modern world'
  )
  .inCategory(CareerCategory.TECHNOLOGY)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.9,
    creativity: 0.6,
    socialOrientation: 0.4,
    leadership: 0.4,
    detailOrientation: 0.8,
    curiosity: 0.9,
    competitiveness: 0.5,
    riskTolerance: 0.5,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.85,
    officeWork: 0.4,
    fieldWork: 0.0,
    travelRequirement: 0.1,
    teamOrientation: 0.6,
    soloOrientation: 0.6,
    structuredEnvironment: 0.4,
    unstructuredEnvironment: 0.6,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.9,
    statusPotential: 0.7,
    impactPotential: 0.6,
    freedomPotential: 0.8,
    stabilityPotential: 0.7,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.6,
    automationRisk: 0.2,
    competitionLevel: 0.7,
    incomeVolatility: 0.4,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.9,
    transferableSkills: 0.9,
    entrepreneurshipPotential: 0.8,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.BTECH, DegreeType.BCA, DegreeType.BSC, DegreeType.MTECH, DegreeType.MCA],
    certifications: [
      CertificationType.AWS_CERTIFIED,
      CertificationType.AZURE_CERTIFIED,
      CertificationType.GOOGLE_CLOUD_CERTIFIED,
      CertificationType.SCRUM_MASTER,
    ],
    notes: 'Many successful engineers have non-CS degrees or are self-taught. Skills matter more than pedigree. ' +
           'Coding bootcamps and online certifications increasingly accepted.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.2,
    urbanAdvantage: 0.4,
    englishDependency: 0.6,
    migrationRequirement: 0.1,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'product-manager',
      'data-scientist',
      'devops-engineer',
      'technical-writer',
      'software-architect',
      'engineering-manager',
    ],
    futureCareerPaths: [
      'senior-software-engineer',
      'staff-engineer',
      'principal-engineer',
      'engineering-manager',
      'director-of-engineering',
      'vp-engineering',
      'cto',
      'founder',
    ],
    yearsToFirstMilestone: '2-4 years to Senior Engineer',
    ceilingPotential: 'CTO, VP Engineering, or successful Founder',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 400000,
      max: 2500000,
      median: 800000,
    },
    midCareerSalaryIndia: {
      min: 800000,
      max: 6000000,
      median: 2000000,
    },
    seniorSalaryIndia: {
      min: 1500000,
      max: 15000000,
      median: 5000000,
    },
    notes: 'Massive variation between services companies (TCS, Infosys: 3-6 LPA entry) vs product companies ' +
           '(Google, Microsoft: 20-50 LPA entry). Stock options significantly increase TC at startups. ' +
           'Remote work for US companies can pay 50L-2Cr+.',
  })

  .withDataSource('CareerOS Research 2024', 0.9)
  .build();

export default softwareEngineer;
