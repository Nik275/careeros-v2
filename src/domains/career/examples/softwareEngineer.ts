/**
 * Software Engineer Career Definition
 *
 * Example career using the CareerOS domain model.
 * Demonstrates proper structuring of all profile dimensions.
 */

import {
  CareerBuilder,
  CareerCategory,
  EducationLevel,
  DegreeType,
  CertificationType,
} from '../Career';

/**
 * Software Engineer - Technology sector
 *
 * One of the most popular career choices in India.
 * High optionality, strong income potential, remote-friendly.
 */
export const softwareEngineer = new CareerBuilder(
  'software-engineer',
  'Software Engineer'
)
  .withDescription(
    'Designs, develops, and maintains software applications and systems. ' +
    'Works with programming languages, frameworks, and tools to build ' +
    'everything from mobile apps to enterprise systems. Strong demand ' +
    'across industries with excellent growth trajectories in product ' +
    'companies, startups, and multinational corporations.',
    'Build the digital infrastructure of the modern world'
  )
  .inCategory(CareerCategory.TECHNOLOGY)

  // Psychological Profile
  .withPsychologicalProfile({
    analyticalThinking: 0.9,  // Heavy logic, debugging, system design
    creativity: 0.6,          // Some creativity in architecture and UX
    socialOrientation: 0.4,   // Can be solo work, though collaboration increasing
    leadership: 0.4,          // Individual contributor track common
    detailOrientation: 0.8,   // Precision critical for code quality
    curiosity: 0.9,           // Must continuously learn new technologies
    competitiveness: 0.5,     // Moderate - not winner-take-all
    riskTolerance: 0.5,       // Startup risk vs big company stability
  })

  // Work Style
  .withWorkStyle({
    remoteWork: 0.85,         // Post-COVID, highly remote-friendly
    officeWork: 0.4,          // Many still prefer hybrid
    fieldWork: 0.0,           // No field work
    travelRequirement: 0.1,   // Minimal travel (conferences, occasional client)
    teamOrientation: 0.6,     // Agile teams, pair programming
    soloOrientation: 0.6,     // Deep work periods
    structuredEnvironment: 0.4, // Startups chaotic, big corps structured
    unstructuredEnvironment: 0.6, // Problem-solving requires flexibility
  })

  // Reward Profile
  .withRewardProfile({
    incomePotential: 0.9,     // Top 5% earning potential (FAANG, startups)
    statusPotential: 0.7,     // Respected, "engineer" prestige in India
    impactPotential: 0.6,     // Can build products used by millions
    freedomPotential: 0.8,    // Remote work, freelance options
    stabilityPotential: 0.7,  // High demand, but layoffs occur
  })

  // Risk Profile
  .withRiskProfile({
    burnoutRisk: 0.6,         // "Crunch" culture, on-call pressure
    automationRisk: 0.2,      // AI assists but doesn't replace engineers
    competitionLevel: 0.7,    // Thousands of engineering grads annually
    incomeVolatility: 0.4,    // Equity risk vs salary stability
  })

  // Optionality
  .withOptionality({
    careerFlexibility: 0.9,   // Can move to PM, data science, entrepreneurship
    transferableSkills: 0.9,  // Logic, problem-solving applicable everywhere
    entrepreneurshipPotential: 0.8, // Low barrier to startup founding
  })

  // Education
  .withEducation({
    minimumLevel: EducationLevel.BACHELORS,
    typicalDegrees: [
      DegreeType.BTECH,
      DegreeType.BCA,
      DegreeType.BSC,
      DegreeType.MTECH,
      DegreeType.MCA,
    ],
    certifications: [
      CertificationType.AWS_CERTIFIED,
      CertificationType.AZURE_CERTIFIED,
      CertificationType.GOOGLE_CLOUD_CERTIFIED,
      CertificationType.SCRUM_MASTER,
    ],
    notes: 'Many successful engineers have non-CS degrees or are self-taught. ' +
           'Skills matter more than pedigree in most companies.',
  })

  // India Reality
  .withIndiaReality({
    coachingDependency: 0.2,   // Can learn online, no coaching needed
    urbanAdvantage: 0.4,       // Tier-2 cities have opportunities now
    englishDependency: 0.6,    // Important for global teams, documentation
    migrationRequirement: 0.1, // Can work remotely from anywhere
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
    ],
    futureCareerPaths: [
      'senior-software-engineer',
      'staff-engineer',
      'principal-engineer',
      'engineering-manager',
      'cto',
      'founder',
    ],
    yearsToFirstMilestone: '2-4 years to Senior Engineer',
    ceilingPotential: 'CTO, VP Engineering, or successful Founder',
  })

  // Salary
  .withSalary({
    entrySalaryIndia: {
      min: 400000,      // ₹4 LPA (small services company)
      max: 2500000,     // ₹25 LPA (top product company)
      median: 800000,   // ₹8 LPA
    },
    midCareerSalaryIndia: {
      min: 800000,      // ₹8 LPA
      max: 6000000,     // ₹60 LPA (FAANG, startups)
      median: 2000000,  // ₹20 LPA
    },
    seniorSalaryIndia: {
      min: 1500000,     // ₹15 LPA
      max: 15000000,    // ₹1.5 Cr (top companies)
      median: 5000000,  // ₹50 LPA
    },
    notes: 'Salaries vary dramatically between services companies (TCS, Infosys) ' +
           'vs product companies (Google, Microsoft) vs startups. Stock options ' +
           'can significantly increase total compensation at startups.',
  })

  .withDataSource('CareerOS Research 2024', 0.85)
  .build();

export default softwareEngineer;
