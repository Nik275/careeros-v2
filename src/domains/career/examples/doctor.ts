/**
 * Doctor (Physician) Career Definition
 *
 * Example career using the CareerOS domain model.
 * Contrasts with Software Engineer - shows high coaching dependency,
 * different psychological profile, different risk/reward tradeoffs.
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
  CertificationType,
} from '../Career';

/**
 * Doctor (Physician) - Healthcare sector
 *
 * One of the most prestigious careers in India.
 * Extremely high coaching dependency, long training period,
 * high social status, stable income.
 */
export const doctor = new CareerBuilder(
  'doctor',
  'Doctor (Physician)'
)
  .withDescription(
    'Diagnoses and treats illnesses, injuries, and other health conditions. ' +
    'Works in hospitals, clinics, or private practice. Specializations include ' +
    'cardiology, neurology, pediatrics, surgery, and many others. Requires ' +
    'extensive education, lifelong learning, and high ethical standards. ' +
    'Highly respected profession with strong job security and social impact.',
    'Heal, serve, and save lives'
  )
  .inCategory(CareerCategory.HEALTHCARE)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.9,  // Diagnosis requires systematic thinking
    creativity: 0.3,          // Protocol-driven, limited creative freedom
    socialOrientation: 0.8,   // Patient interaction central to role
    leadership: 0.6,          // Lead medical teams, own practice
    detailOrientation: 0.95,  // Life-or-death precision required
    curiosity: 0.8,           // Must stay current with medical advances
    competitiveness: 0.7,     // NEET competition, then specialization seats
    riskTolerance: 0.3,       // Conservative profession, malpractice risk
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.1,          // Telemedicine limited, mostly in-person
    officeWork: 0.3,          // Hospitals/clinics, not typical offices
    fieldWork: 0.0,           // Some rural postings, but not field work
    travelRequirement: 0.1,   // Minimal, unless rural doctor
    teamOrientation: 0.7,     // Work with nurses, specialists, staff
    soloOrientation: 0.4,     // Independent decision-making
    structuredEnvironment: 0.9, // Protocols, standards, regulations
    unstructuredEnvironment: 0.1, // Little flexibility in procedures
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.7,     // Good but ceiling lower than tech CEOs
    statusPotential: 0.95,    // Among highest status in Indian society
    impactPotential: 0.95,    // Directly save and improve lives
    freedomPotential: 0.5,    // Own practice possible, but regulated
    stabilityPotential: 0.9,  // Always in demand, recession-proof
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.8,         // Long hours, emotional toll, night shifts
    automationRisk: 0.1,      // AI assists diagnosis, but doctors remain
    competitionLevel: 0.95,   // NEET: 2M+ students for 90K seats
    incomeVolatility: 0.2,    // Very stable income once established
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.3,   // Hard to pivot out of medicine
    transferableSkills: 0.4,  // Some transfer to healthcare admin
    entrepreneurshipPotential: 0.6, // Can open clinic, but regulated
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.PROFESSIONAL_DEGREE,
    typicalDegrees: [
      DegreeType.MBBS,
      DegreeType.MD,
      DegreeType.MS_MEDICINE,
    ],
    certifications: [
      CertificationType.IELTS,  // For foreign practice
    ],
    notes: 'MBBS is 5.5 years. Specialization (MD/MS) adds 3+ years. ' +
           'Super-specialization (DM/MCh) adds 2-3 more years. ' +
           'Total training can be 10-12 years.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.95, // Almost impossible without Allen/Aakash/etc
    urbanAdvantage: 0.3,      // Good hospitals in Tier-2 now
    englishDependency: 0.4,   // Important for higher studies, global practice
    migrationRequirement: 0.1, // Can practice anywhere, but cities have better facilities
    reservationApplicable: true,
    reservationCategories: ['SC', 'ST', 'OBC', 'EWS'],
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'medical-researcher',
      'public-health-official',
      'hospital-administrator',
    ],
    futureCareerPaths: [
      'resident-doctor',
      'senior-resident',
      'consultant',
      'senior-consultant',
      'hospital-director',
      'dean',
    ],
    yearsToFirstMilestone: '5.5 years MBBS + 3 years MD/MS to become specialist',
    ceilingPotential: 'Dean of Medical College, Director of AIIMS, or renowned specialist',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 50000,       // ₹50K/month = ₹6 LPA (rural posting)
      max: 1200000,     // ₹12 LPA (corporate hospital)
      median: 600000,   // ₹6 LPA
    },
    midCareerSalaryIndia: {
      min: 800000,      // ₹8 LPA
      max: 2500000,     // ₹25 LPA (corporate hospital specialist)
      median: 1500000,  // ₹15 LPA
    },
    seniorSalaryIndia: {
      min: 1500000,     // ₹15 LPA
      max: 10000000,    // ₹1 Cr+ (renowned surgeon, private practice)
      median: 4000000,  // ₹40 LPA
    },
    notes: 'Government doctors earn less but have job security. ' +
           'Private practice income varies wildly based on reputation and location. ' +
           'Super-specialists (cardiac surgeons, neurosurgeons) earn significantly more.',
  })

  .withDataSource('Medical Council of India + CareerOS Research 2024', 0.9)
  .build();

export default doctor;
