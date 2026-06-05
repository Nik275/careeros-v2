/**
 * Doctor (Physician) Career Profile
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

export const doctor = new CareerBuilder(
  'doctor',
  'Doctor (Physician)'
)
  .withDescription(
    'Diagnoses and treats illnesses, injuries, and other health conditions. Works in hospitals, clinics, ' +
    'or private practice. Specializations include cardiology, neurology, pediatrics, surgery, and many others. ' +
    'Requires extensive education, lifelong learning, and high ethical standards. In India, doctors hold ' +
    'immense social prestige and job security. The profession requires clearing NEET-UG for MBBS admission, ' +
    'followed by NEET-PG for specialization. Super-specialization (DM/MCh) requires further competitive exams.',
    'Heal, serve, and save lives'
  )
  .inCategory(CareerCategory.HEALTHCARE)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.9,
    creativity: 0.3,
    socialOrientation: 0.8,
    leadership: 0.6,
    detailOrientation: 0.95,
    curiosity: 0.8,
    competitiveness: 0.7,
    riskTolerance: 0.3,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.1,
    officeWork: 0.3,
    fieldWork: 0.0,
    travelRequirement: 0.1,
    teamOrientation: 0.7,
    soloOrientation: 0.4,
    structuredEnvironment: 0.9,
    unstructuredEnvironment: 0.1,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.7,
    statusPotential: 0.95,
    impactPotential: 0.95,
    freedomPotential: 0.5,
    stabilityPotential: 0.9,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.8,
    automationRisk: 0.1,
    competitionLevel: 0.95,
    incomeVolatility: 0.2,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.3,
    transferableSkills: 0.4,
    entrepreneurshipPotential: 0.6,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.PROFESSIONAL_DEGREE,
    typicalDegrees: [DegreeType.MBBS, DegreeType.MD, DegreeType.MS_MEDICINE],
    certifications: [CertificationType.IELTS],
    notes: 'MBBS is 5.5 years including internship. MD/MS (specialization) adds 3 years. ' +
           'DM/MCh (super-specialization) adds 2-3 more years. Total training: 10-12 years. ' +
           'NEET-UG and NEET-PG are mandatory competitive exams.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.95,
    urbanAdvantage: 0.3,
    englishDependency: 0.4,
    migrationRequirement: 0.1,
    reservationApplicable: true,
    reservationCategories: ['SC', 'ST', 'OBC', 'EWS'],
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'medical-researcher',
      'public-health-official',
      'hospital-administrator',
      'medical-writer',
    ],
    futureCareerPaths: [
      'resident-doctor',
      'senior-resident',
      'junior-consultant',
      'senior-consultant',
      'head-of-department',
      'medical-director',
      'hospital-director',
      'dean',
    ],
    yearsToFirstMilestone: '5.5 years MBBS + 3 years MD/MS to become specialist',
    ceilingPotential: 'Dean of Medical College, Director of AIIMS, or renowned specialist',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 60000,
      max: 1200000,
      median: 600000,
    },
    midCareerSalaryIndia: {
      min: 800000,
      max: 2500000,
      median: 1500000,
    },
    seniorSalaryIndia: {
      min: 1500000,
      max: 10000000,
      median: 4000000,
    },
    notes: 'Government doctors earn 6-15 LPA with job security. Corporate hospitals pay 12-30 LPA. ' +
           'Private practice varies wildly: 5L to 2Cr+ depending on reputation and location. ' +
           'Super-specialists (cardiac surgeons, neurosurgeons) earn significantly more. ' +
           'USMLE route to USA can lead to $200K-500K+ salaries.',
  })

  .withDataSource('Medical Council of India + CareerOS Research 2024', 0.9)
  .build();

export default doctor;
