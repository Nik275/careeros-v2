/**
 * UX Designer Career Profile
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

export const uxDesigner = new CareerBuilder(
  'ux-designer',
  'UX Designer'
)
  .withDescription(
    'Designs user experiences for digital products, ensuring they are intuitive, accessible, and enjoyable. ' +
    'UX designers research user needs, create wireframes and prototypes, conduct usability testing, and ' +
    'collaborate with developers and product managers. In India, demand is growing rapidly with the ' +
    'digital transformation across industries. The role combines psychology, design thinking, and ' +
    'technology. Specializations include UI design, interaction design, and user research. ' +
    'Portfolio quality matters more than formal education.',
    'Design experiences that delight users'
  )
  .inCategory(CareerCategory.TECHNOLOGY)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.7,
    creativity: 0.9,
    socialOrientation: 0.7,
    leadership: 0.4,
    detailOrientation: 0.7,
    curiosity: 0.9,
    competitiveness: 0.4,
    riskTolerance: 0.4,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.8,
    officeWork: 0.3,
    fieldWork: 0.1,
    travelRequirement: 0.1,
    teamOrientation: 0.8,
    soloOrientation: 0.5,
    structuredEnvironment: 0.4,
    unstructuredEnvironment: 0.6,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.8,
    statusPotential: 0.7,
    impactPotential: 0.75,
    freedomPotential: 0.8,
    stabilityPotential: 0.7,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.6,
    automationRisk: 0.3,
    competitionLevel: 0.6,
    incomeVolatility: 0.4,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.9,
    transferableSkills: 0.8,
    entrepreneurshipPotential: 0.7,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.BDES, DegreeType.MDES, DegreeType.BTECH, DegreeType.BA],
    certifications: [
      CertificationType.ADOBE_CERTIFIED,
      CertificationType.GOOGLE_ADS_CERTIFIED,
    ],
    notes: 'No specific degree required. Design, psychology, or arts backgrounds common. ' +
           'Strong portfolio essential. Bootcamps (10k Designers, Design Boat) increasingly popular. ' +
           'Certifications from Google, Adobe helpful but not mandatory.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.1,
    urbanAdvantage: 0.7,
    englishDependency: 0.6,
    migrationRequirement: 0.2,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'product-manager',
      'graphic-designer',
      'frontend-developer',
      'user-researcher',
      'design-strategist',
    ],
    futureCareerPaths: [
      'junior-ux-designer',
      'ux-designer',
      'senior-ux-designer',
      'lead-designer',
      'design-manager',
      'director-of-design',
      'vp-design',
      'chief-design-officer',
    ],
    yearsToFirstMilestone: '2-4 years to Senior UX Designer',
    ceilingPotential: 'Chief Design Officer, independent design agency owner, or design thought leader',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 400000,
      max: 1000000,
      median: 600000,
    },
    midCareerSalaryIndia: {
      min: 1000000,
      max: 3500000,
      median: 2000000,
    },
    seniorSalaryIndia: {
      min: 3000000,
      max: 12000000,
      median: 6000000,
    },
    notes: 'Freshers: 4-10 LPA. Mid-level (4-6 years): 12-30 LPA. Senior at tech companies: 40L-80L+. ' +
           'Design leads at unicorns: 60L-1.5Cr. Freelance designers: 1K-5K/day, top freelancers 10L+ per project. ' +
           'Remote work for US companies: 50L-2Cr+.',
  })

  .withDataSource('CareerOS Research 2024', 0.85)
  .build();

export default uxDesigner;
