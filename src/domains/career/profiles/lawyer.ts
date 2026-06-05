/**
 * Lawyer Career Profile
 *
 * CareerOS - Career Intelligence System
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
} from '../Career';

export const lawyer = new CareerBuilder(
  'lawyer',
  'Lawyer (Advocate)'
)
  .withDescription(
    'Provides legal advice, represents clients in court, drafts legal documents, and interprets laws and regulations. ' +
    'Practice areas include corporate law, criminal law, civil litigation, intellectual property, family law, and more. ' +
    'In India, lawyers can practice in district courts, high courts, or the Supreme Court. Corporate lawyers work ' +
    'in law firms or company legal departments, while litigators argue cases in court. The profession requires ' +
    'excellent communication skills, analytical thinking, and the ability to work under pressure.',
    'Uphold justice and protect rights'
  )
  .inCategory(CareerCategory.LAW)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.9,
    creativity: 0.5,
    socialOrientation: 0.8,
    leadership: 0.6,
    detailOrientation: 0.9,
    curiosity: 0.7,
    competitiveness: 0.8,
    riskTolerance: 0.5,
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.3,
    officeWork: 0.6,
    fieldWork: 0.2,
    travelRequirement: 0.4,
    teamOrientation: 0.5,
    soloOrientation: 0.6,
    structuredEnvironment: 0.5,
    unstructuredEnvironment: 0.5,
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.8,
    statusPotential: 0.85,
    impactPotential: 0.8,
    freedomPotential: 0.7,
    stabilityPotential: 0.5,
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.7,
    automationRisk: 0.3,
    competitionLevel: 0.8,
    incomeVolatility: 0.7,
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.6,
    transferableSkills: 0.7,
    entrepreneurshipPotential: 0.7,
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [DegreeType.LLB, DegreeType.LLM],
    certifications: [],
    notes: 'LLB is 3 years (after graduation) or 5 years (after 12th). AIBE (All India Bar Examination) ' +
           'mandatory to practice. NLU graduates have significant advantage. CLAT for NLU admission.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.6,
    urbanAdvantage: 0.7,
    englishDependency: 0.8,
    migrationRequirement: 0.4,
    reservationApplicable: false,
  })

  // Evolution
  .withEvolution({
    adjacentCareers: [
      'judge',
      'legal-consultant',
      'corporate-counsel',
      'policy-analyst',
      'legal-journalist',
    ],
    futureCareerPaths: [
      'junior-associate',
      'associate',
      'senior-associate',
      'partner',
      'senior-partner',
      'managing-partner',
      'judge',
      'attorney-general',
    ],
    yearsToFirstMilestone: '3-5 years to Senior Associate',
    ceilingPotential: 'Senior Partner at top law firm, Judge, or Attorney General',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 200000,
      max: 1800000,
      median: 600000,
    },
    midCareerSalaryIndia: {
      min: 800000,
      max: 5000000,
      median: 2000000,
    },
    seniorSalaryIndia: {
      min: 2000000,
      max: 15000000,
      median: 6000000,
    },
    notes: 'Massive income gap: Freshers at district courts earn 2-5 LPA. NLU graduates at top firms ' +
           '(Cyril Amarchand, Khaitan) start at 15-18 LPA. Partners at tier-1 firms earn 50L-5Cr+. ' +
           'Independent practice varies from struggling to 10Cr+ for renowned advocates.',
  })

  .withDataSource('Bar Council of India + CareerOS Research 2024', 0.85)
  .build();

export default lawyer;
