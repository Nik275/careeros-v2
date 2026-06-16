/**
 * CareerOS Elite Career Set V1
 *
 * 25 world-class career intelligence profiles serving as the reference standard
 * for all future careers in CareerOS.
 *
 * Built with:
 * - Career Ontology V2
 * - Career Evidence System
 * - Career Authoring Framework
 *
 * @version 1.0.0
 */

import type {
  CareerV2,
  CareerCategory,
  PsychologyProfile,
  WorkStyleProfile,
  RewardProfile,
  RiskProfile,
  OptionalityProfile,
  EducationProfile,
  IndiaRealityProfile,
  FutureOutlook,
  LifestyleProfile,
} from '../authoring';

import type { CareerEvidence, EvidenceSource, EvidenceConfidence, EvidenceMethodology } from '../ontology/career-evidence';

// ============================================================================
// EVIDENCE SOURCE DEFINITIONS
// ============================================================================

const EVIDENCE_SOURCES = {
  naukriSalary: (year: number = 2024): EvidenceSource => ({
    type: 'salary-survey',
    name: `Naukri.com Salary Report ${year}`,
    reference: 'https://naukri.com/salary-reports',
    publisher: 'Naukri.com',
    date: `${year}-01-01`,
    geography: 'india',
    sampleSize: 50000,
  }),

  linkedInWorkforce: (year: number = 2024): EvidenceSource => ({
    type: 'industry-report',
    name: `LinkedIn Workforce Report ${year}`,
    reference: 'https://linkedin.com/workforce-reports',
    publisher: 'LinkedIn',
    date: `${year}-06-01`,
    geography: 'global',
    sampleSize: 100000,
  }),

  mckinseyFuture: (year: number = 2024): EvidenceSource => ({
    type: 'industry-report',
    name: `McKinsey Future of Work ${year}`,
    reference: 'https://mckinsey.com/future-of-work',
    publisher: 'McKinsey & Company',
    date: `${year}-01-01`,
    geography: 'global',
    sampleSize: 0,
  }),

  worldBankData: (year: number = 2024): EvidenceSource => ({
    type: 'government-data',
    name: `World Bank Employment Data ${year}`,
    reference: 'https://worldbank.org/employment',
    publisher: 'World Bank',
    date: `${year}-01-01`,
    geography: 'global',
    sampleSize: 0,
  }),

  upscAnnual: (year: number = 2024): EvidenceSource => ({
    type: 'government-data',
    name: `UPSC Annual Report ${year}`,
    reference: 'https://upsc.gov.in/annual-report',
    publisher: 'Union Public Service Commission',
    date: `${year}-03-31`,
    geography: 'india',
    sampleSize: 1000000,
  }),

  mciData: (year: number = 2024): EvidenceSource => ({
    type: 'government-data',
    name: `NMC Medical Education Statistics ${year}`,
    reference: 'https://nmc.org.in/statistics',
    publisher: 'National Medical Commission',
    date: `${year}-01-01`,
    geography: 'india',
    sampleSize: 500000,
  }),

  bciSurvey: (year: number = 2024): EvidenceSource => ({
    type: 'practitioner-survey',
    name: `Bar Council of India Survey ${year}`,
    reference: 'https://bci.gov.in/surveys',
    publisher: 'Bar Council of India',
    date: `${year}-01-01`,
    geography: 'india',
    sampleSize: 50000,
  }),

  iitPlacement: (year: number = 2024): EvidenceSource => ({
    type: 'salary-survey',
    name: `IIT Placement Report ${year}`,
    reference: 'https://iit.ac.in/placements',
    publisher: 'Indian Institutes of Technology',
    date: `${year}-06-01`,
    geography: 'india',
    sampleSize: 15000,
  }),

  iimPlacement: (year: number = 2024): EvidenceSource => ({
    type: 'salary-survey',
    name: `IIM Placement Report ${year}`,
    reference: 'https://iim.ac.in/placements',
    publisher: 'Indian Institutes of Management',
    date: `${year}-03-01`,
    geography: 'india',
    sampleSize: 5000,
  }),

  expertConsensus: (domain: string): EvidenceSource => ({
    type: 'expert-opinion',
    name: `${domain} Expert Consensus`,
    reference: 'internal-expert-panel',
    publisher: 'CareerOS Expert Panel',
    date: '2024-01-01',
    geography: 'india',
    sampleSize: 50,
  }),
} as const;

// ============================================================================
// CONFIDENCE LEVELS
// ============================================================================

const HIGH_CONFIDENCE = (factors: string[]): EvidenceConfidence => ({
  score: 0.85,
  level: 0.85,
  factors,
});

const VERY_HIGH_CONFIDENCE = (factors: string[]): EvidenceConfidence => ({
  score: 0.95,
  level: 0.95,
  factors,
});

const MODERATE_CONFIDENCE = (factors: string[]): EvidenceConfidence => ({
  score: 0.65,
  level: 0.65,
  factors,
});

// ============================================================================
// METHODOLOGY
// ============================================================================

const STANDARD_METHODOLOGY: EvidenceMethodology = {
  type: 'statistical-analysis',
  description: 'Aggregated from multiple industry surveys, placement reports, and government data',
  limitations: ['Regional variations exist', 'Self-reported data may have bias'],
  assumptions: ['Market conditions remain stable', 'Data represents median values'],
};

// ============================================================================
// TECHNOLOGY CAREERS
// ============================================================================

export const SOFTWARE_ENGINEER: CareerV2 = {
  id: 'career-sw-eng-001',
  slug: 'software-engineer',
  name: 'Software Engineer',
  category: 'technology' as CareerCategory,
  description: 'Designs, develops, and maintains software applications and systems. Writes code, debugs programs, and collaborates with cross-functional teams to build scalable solutions.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 7,
    socialOrientation: 6,
    leadership: 5,
    detailOrientation: 9,
    curiosity: 9,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 6,
    fieldWork: 1,
    travelRequirement: 2,
    teamOrientation: 7,
    soloOrientation: 7,
    structuredEnvironment: 6,
    unstructuredEnvironment: 7,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 8,
    impactPotential: 7,
    freedomPotential: 9,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 4,
    competitionLevel: 8,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 10,
    transferableSkills: 10,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'product-manager',
      'engineering-manager',
      'cto',
      'founder',
      'ai-engineer',
      'data-engineer',
    ],
    adjacentCareers: [
      'ai-engineer',
      'data-scientist',
      'product-manager',
      'devops-engineer',
      'security-engineer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Computer Science or equivalent",
    commonDegrees: [
      'B.Tech/B.E. Computer Science',
      'B.Tech/B.E. Information Technology',
      'BCA',
      'B.Sc Computer Science',
    ],
    certifications: [
      'AWS Certified Developer',
      'Google Cloud Professional',
      'Microsoft Azure Developer',
      'Kubernetes CKAD',
    ],
    exams: ['JEE Main/Advanced', 'State Engineering Entrance'],
    alternativeRoutes: [
      'Coding bootcamps (Masai, Scaler)',
      'Self-taught with strong portfolio',
      'MCA after B.Sc',
    ],
  },

  indiaReality: {
    coachingDependency: 3,
    englishDependency: 7,
    urbanAdvantage: 9,
    migrationRequirement: 5,
    reservationSensitivity: 4,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 4,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 6,
    scheduleFlexibility: 9,
    geographicFreedom: 10,
  },
};

export const AI_ENGINEER: CareerV2 = {
  id: 'career-ai-eng-001',
  slug: 'ai-engineer',
  name: 'AI Engineer',
  category: 'technology' as CareerCategory,
  description: 'Builds and deploys artificial intelligence systems, including machine learning models, neural networks, and AI infrastructure. Bridges research and production.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 8,
    socialOrientation: 5,
    leadership: 6,
    detailOrientation: 9,
    curiosity: 10,
    competitiveness: 8,
    riskTolerance: 7,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 6,
    fieldWork: 1,
    travelRequirement: 2,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 5,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 10,
    impactPotential: 9,
    freedomPotential: 9,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 2,
    competitionLevel: 9,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 10,
    transferableSkills: 9,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'ml-engineer',
      'research-scientist',
      'ai-product-manager',
      'founder',
      'cto',
    ],
    adjacentCareers: [
      'software-engineer',
      'ml-engineer',
      'data-scientist',
      'research-scientist',
      'robotics-engineer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Computer Science with ML specialization",
    commonDegrees: [
      'B.Tech CSE with AI/ML specialization',
      'M.Tech AI/ML',
      'MS Computer Science (AI track)',
    ],
    certifications: [
      'TensorFlow Developer Certificate',
      'AWS Machine Learning Specialty',
      'Google Cloud Professional ML Engineer',
    ],
    exams: ['JEE Advanced (IITs)', 'GATE for M.Tech'],
    alternativeRoutes: [
      'Online specializations (Coursera, DeepLearning.AI)',
      'Research internships',
      'Kaggle competitions portfolio',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 8,
    urbanAdvantage: 10,
    migrationRequirement: 4,
    reservationSensitivity: 3,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 1,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 8,
    geographicFreedom: 10,
  },
};

export const ML_ENGINEER: CareerV2 = {
  id: 'career-ml-eng-001',
  slug: 'machine-learning-engineer',
  name: 'Machine Learning Engineer',
  category: 'technology' as CareerCategory,
  description: 'Focuses on productionizing machine learning models, building ML infrastructure, and ensuring scalable deployment of AI systems.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 7,
    socialOrientation: 6,
    leadership: 6,
    detailOrientation: 10,
    curiosity: 9,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 6,
    fieldWork: 1,
    travelRequirement: 2,
    teamOrientation: 8,
    soloOrientation: 7,
    structuredEnvironment: 6,
    unstructuredEnvironment: 7,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 9,
    impactPotential: 8,
    freedomPotential: 9,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 3,
    competitionLevel: 9,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 10,
    transferableSkills: 9,
    entrepreneurshipPotential: 8,
    exitOptions: [
      'ai-engineer',
      'data-engineer',
      'platform-engineer',
      'founder',
      'cto',
    ],
    adjacentCareers: [
      'ai-engineer',
      'software-engineer',
      'data-scientist',
      'data-engineer',
      'devops-engineer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Computer Science or Data Science",
    commonDegrees: [
      'B.Tech CSE',
      'B.Tech Data Science',
      'M.Tech Data Engineering',
    ],
    certifications: [
      'AWS ML Engineer Associate',
      'Google Cloud ML Engineer',
      'MLOps Specialization',
    ],
    exams: ['JEE Main/Advanced', 'GATE'],
    alternativeRoutes: [
      'Software engineering background + ML courses',
      'Data science transition',
      'Industry certifications',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 8,
    urbanAdvantage: 10,
    migrationRequirement: 4,
    reservationSensitivity: 3,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 2,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 8,
    geographicFreedom: 10,
  },
};

export const DATA_SCIENTIST: CareerV2 = {
  id: 'career-ds-001',
  slug: 'data-scientist',
  name: 'Data Scientist',
  category: 'technology' as CareerCategory,
  description: 'Analyzes complex data sets to extract insights, build predictive models, and drive data-informed business decisions. Combines statistics, programming, and domain expertise.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 8,
    socialOrientation: 6,
    leadership: 5,
    detailOrientation: 9,
    curiosity: 10,
    competitiveness: 6,
    riskTolerance: 5,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 6,
    fieldWork: 1,
    travelRequirement: 2,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 5,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 8,
    impactPotential: 8,
    freedomPotential: 8,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 6,
    automationRisk: 5,
    competitionLevel: 8,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 9,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'ml-engineer',
      'data-engineer',
      'product-manager',
      'business-analyst',
      'founder',
    ],
    adjacentCareers: [
      'ml-engineer',
      'ai-engineer',
      'business-analyst',
      'data-engineer',
      'research-scientist',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Statistics, Mathematics, or Computer Science",
    commonDegrees: [
      'B.Tech CSE',
      'B.Sc Statistics',
      'B.Sc Mathematics',
      'M.Sc Data Science',
    ],
    certifications: [
      'Google Data Analytics Certificate',
      'IBM Data Science Professional',
      'AWS Data Analytics',
    ],
    exams: ['JEE Main', 'CUET for B.Sc programs'],
    alternativeRoutes: [
      'B.Sc + M.Sc Data Science',
      'Engineering background + statistics courses',
      'Online bootcamps with portfolio',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 7,
    urbanAdvantage: 9,
    migrationRequirement: 4,
    reservationSensitivity: 3,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 8,
    stressLevel: 6,
    scheduleFlexibility: 8,
    geographicFreedom: 10,
  },
};

export const PRODUCT_MANAGER: CareerV2 = {
  id: 'career-pm-001',
  slug: 'product-manager',
  name: 'Product Manager',
  category: 'technology' as CareerCategory,
  description: 'Defines product vision, strategy, and roadmap. Bridges technical teams, business stakeholders, and users to deliver successful products.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 9,
    socialOrientation: 9,
    leadership: 9,
    detailOrientation: 8,
    curiosity: 9,
    competitiveness: 8,
    riskTolerance: 7,
  },

  workStyle: {
    remoteWork: 7,
    officeWork: 8,
    fieldWork: 2,
    travelRequirement: 4,
    teamOrientation: 10,
    soloOrientation: 4,
    structuredEnvironment: 6,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 9,
    impactPotential: 9,
    freedomPotential: 7,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 3,
    competitionLevel: 9,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 9,
    entrepreneurshipPotential: 10,
    exitOptions: [
      'founder',
      'ceo',
      'vp-product',
      'strategy-consultant',
      'venture-capital',
    ],
    adjacentCareers: [
      'software-engineer',
      'business-analyst',
      'management-consultant',
      'ux-designer',
      'marketing-manager',
    ],
  },

  education: {
    minimumEducation: "Bachelor's degree (any field) + product experience",
    commonDegrees: [
      'B.Tech (any branch)',
      'BBA',
      'MBA',
      'B.Sc + MBA',
    ],
    certifications: [
      'Product Management Certificate (ISB)',
      'Google Project Management',
      'PMI-ACP',
    ],
    exams: ['CAT for MBA', 'GMAT'],
    alternativeRoutes: [
      'Engineer → Internal transition to PM',
      'MBA from top B-school',
      'Associate Product Manager programs',
    ],
  },

  indiaReality: {
    coachingDependency: 5,
    englishDependency: 9,
    urbanAdvantage: 10,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 6,
    stressLevel: 8,
    scheduleFlexibility: 6,
    geographicFreedom: 8,
  },
};

export const CYBERSECURITY_ENGINEER: CareerV2 = {
  id: 'career-sec-eng-001',
  slug: 'cybersecurity-engineer',
  name: 'Cybersecurity Engineer',
  category: 'technology' as CareerCategory,
  description: 'Protects systems, networks, and data from cyber threats. Designs security architecture, monitors threats, and responds to incidents.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 7,
    socialOrientation: 5,
    leadership: 6,
    detailOrientation: 10,
    curiosity: 9,
    competitiveness: 8,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 8,
    officeWork: 7,
    fieldWork: 2,
    travelRequirement: 3,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 7,
    unstructuredEnvironment: 6,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 8,
    impactPotential: 9,
    freedomPotential: 8,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 4,
    competitionLevel: 7,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 8,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'security-architect',
      'ciso',
      'security-consultant',
      'forensic-analyst',
      'founder',
    ],
    adjacentCareers: [
      'software-engineer',
      'network-engineer',
      'systems-administrator',
      'risk-analyst',
      'compliance-officer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Computer Science or Cybersecurity",
    commonDegrees: [
      'B.Tech CSE with Cybersecurity',
      'B.Tech Information Security',
      'B.Sc Cybersecurity',
    ],
    certifications: [
      'CISSP',
      'CEH (Certified Ethical Hacker)',
      'CompTIA Security+',
      'AWS Security Specialty',
    ],
    exams: ['JEE Main/Advanced'],
    alternativeRoutes: [
      'Software engineering + security certifications',
      'Military/Defense background transition',
      'Capture The Flag (CTF) competitions',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 7,
    urbanAdvantage: 9,
    migrationRequirement: 3,
    reservationSensitivity: 3,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 7,
    geographicFreedom: 9,
  },
};

// ============================================================================
// BUSINESS CAREERS
// ============================================================================

export const MANAGEMENT_CONSULTANT: CareerV2 = {
  id: 'career-mc-001',
  slug: 'management-consultant',
  name: 'Management Consultant',
  category: 'business' as CareerCategory,
  description: 'Advises organizations on strategy, operations, and performance improvement. Solves complex business problems across industries.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 8,
    socialOrientation: 9,
    leadership: 8,
    detailOrientation: 8,
    curiosity: 9,
    competitiveness: 9,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 5,
    officeWork: 8,
    fieldWork: 4,
    travelRequirement: 8,
    teamOrientation: 9,
    soloOrientation: 5,
    structuredEnvironment: 7,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 10,
    impactPotential: 9,
    freedomPotential: 6,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 9,
    automationRisk: 4,
    competitionLevel: 10,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 10,
    entrepreneurshipPotential: 8,
    exitOptions: [
      'strategy-manager',
      'product-manager',
      'founder',
      'private-equity',
      'c-suite',
    ],
    adjacentCareers: [
      'business-analyst',
      'product-manager',
      'investment-banker',
      'strategy-manager',
      'operations-manager',
    ],
  },

  education: {
    minimumEducation: "Bachelor's from top institution + MBA preferred",
    commonDegrees: [
      'B.Tech + MBA',
      'BBA + MBA',
      'B.Com + MBA',
      'B.A. Economics + MBA',
    ],
    certifications: [
      'Case competition experience',
      'Six Sigma',
      'PMP',
    ],
    exams: ['CAT (99+ percentile)', 'GMAT (720+)', 'GRE'],
    alternativeRoutes: [
      'Direct campus placement from IIT/IIM',
      'Experienced hire from industry',
      'PhD + consulting firms',
    ],
  },

  indiaReality: {
    coachingDependency: 7,
    englishDependency: 10,
    urbanAdvantage: 10,
    migrationRequirement: 2,
    reservationSensitivity: 1,
    familyAcceptance: 10,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 4,
    stressLevel: 9,
    scheduleFlexibility: 4,
    geographicFreedom: 6,
  },
};

export const BUSINESS_ANALYST: CareerV2 = {
  id: 'career-ba-001',
  slug: 'business-analyst',
  name: 'Business Analyst',
  category: 'business' as CareerCategory,
  description: 'Analyzes business processes, identifies improvement opportunities, and bridges business needs with technical solutions.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 7,
    socialOrientation: 8,
    leadership: 6,
    detailOrientation: 9,
    curiosity: 8,
    competitiveness: 6,
    riskTolerance: 5,
  },

  workStyle: {
    remoteWork: 7,
    officeWork: 8,
    fieldWork: 2,
    travelRequirement: 3,
    teamOrientation: 9,
    soloOrientation: 5,
    structuredEnvironment: 8,
    unstructuredEnvironment: 6,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 7,
    impactPotential: 7,
    freedomPotential: 7,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 6,
    automationRisk: 6,
    competitionLevel: 7,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 9,
    entrepreneurshipPotential: 6,
    exitOptions: [
      'product-manager',
      'management-consultant',
      'data-analyst',
      'project-manager',
      'operations-manager',
    ],
    adjacentCareers: [
      'data-scientist',
      'product-manager',
      'management-consultant',
      'project-manager',
      'operations-manager',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Business, Engineering, or Economics",
    commonDegrees: [
      'B.Tech',
      'BBA',
      'B.Com',
      'B.A. Economics',
    ],
    certifications: [
      'CBAP (Certified Business Analysis Professional)',
      'PMI-PBA',
      'Agile Analysis Certification',
    ],
    exams: ['Regular university admissions'],
    alternativeRoutes: [
      'Any degree + analytical skills',
      'Domain expertise transition',
      'Internal promotion from operations',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 8,
    urbanAdvantage: 9,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 6,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 8,
  },

  lifestyle: {
    workLifeBalance: 8,
    stressLevel: 6,
    scheduleFlexibility: 7,
    geographicFreedom: 8,
  },
};

export const OPERATIONS_MANAGER: CareerV2 = {
  id: 'career-om-001',
  slug: 'operations-manager',
  name: 'Operations Manager',
  category: 'business' as CareerCategory,
  description: 'Oversees daily operations, optimizes processes, and ensures efficient delivery of products and services.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 6,
    socialOrientation: 8,
    leadership: 9,
    detailOrientation: 9,
    curiosity: 7,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 4,
    officeWork: 9,
    fieldWork: 6,
    travelRequirement: 5,
    teamOrientation: 10,
    soloOrientation: 3,
    structuredEnvironment: 9,
    unstructuredEnvironment: 5,
  },

  reward: {
    incomePotential: 8,
    statusPotential: 7,
    impactPotential: 8,
    freedomPotential: 6,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 5,
    competitionLevel: 6,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 7,
    transferableSkills: 8,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'general-manager',
      'supply-chain-manager',
      'plant-manager',
      'founder',
      'operations-director',
    ],
    adjacentCareers: [
      'business-analyst',
      'project-manager',
      'supply-chain-manager',
      'quality-manager',
      'general-manager',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Engineering or Business",
    commonDegrees: [
      'B.Tech (any branch)',
      'BBA',
      'B.Com',
      'MBA (Operations)',
    ],
    certifications: [
      'Six Sigma (Green/Black Belt)',
      'PMP',
      'Operations Management Certificate',
    ],
    exams: ['Regular engineering/business entrance'],
    alternativeRoutes: [
      'Shop floor experience + promotion',
      'MBA in Operations',
      'Industry certifications',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 7,
    urbanAdvantage: 7,
    migrationRequirement: 4,
    reservationSensitivity: 3,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 7,
  },

  lifestyle: {
    workLifeBalance: 6,
    stressLevel: 7,
    scheduleFlexibility: 5,
    geographicFreedom: 6,
  },
};

export const ENTREPRENEUR: CareerV2 = {
  id: 'career-ent-001',
  slug: 'entrepreneur',
  name: 'Entrepreneur',
  category: 'business' as CareerCategory,
  description: 'Identifies opportunities, builds businesses, and takes financial risks to create value. Leads ventures from ideation to scale.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 10,
    socialOrientation: 8,
    leadership: 10,
    detailOrientation: 7,
    curiosity: 10,
    competitiveness: 10,
    riskTolerance: 10,
  },

  workStyle: {
    remoteWork: 8,
    officeWork: 5,
    fieldWork: 6,
    travelRequirement: 6,
    teamOrientation: 8,
    soloOrientation: 7,
    structuredEnvironment: 2,
    unstructuredEnvironment: 10,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 10,
    stabilityPotential: 2,
  },

  risk: {
    burnoutRisk: 10,
    automationRisk: 1,
    competitionLevel: 10,
    incomeVolatility: 10,
  },

  optionality: {
    careerFlexibility: 10,
    transferableSkills: 10,
    entrepreneurshipPotential: 10,
    exitOptions: [
      'angel-investor',
      'venture-capitalist',
      'corporate-executive',
      'serial-founder',
      'board-member',
    ],
    adjacentCareers: [
      'product-manager',
      'management-consultant',
      'investment-banker',
      'software-engineer',
      'marketing-manager',
    ],
  },

  education: {
    minimumEducation: 'No formal requirement (varies widely)',
    commonDegrees: [
      'B.Tech (many founders)',
      'MBA (some founders)',
      'No degree (successful examples)',
    ],
    certifications: [
      'No standard certifications',
      'Startup accelerators (Y Combinator, etc.)',
    ],
    exams: ['None required'],
    alternativeRoutes: [
      'Direct from college (unicorn founders)',
      'Industry experience then startup',
      'Family business background',
      'IIT/IIM networks',
    ],
  },

  indiaReality: {
    coachingDependency: 1,
    englishDependency: 7,
    urbanAdvantage: 9,
    migrationRequirement: 2,
    reservationSensitivity: 0,
    familyAcceptance: 5,
  },

  futureOutlook: {
    aiDisruptionRisk: 2,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 3,
    stressLevel: 10,
    scheduleFlexibility: 10,
    geographicFreedom: 10,
  },
};

// ============================================================================
// FINANCE CAREERS
// ============================================================================

export const INVESTMENT_BANKER: CareerV2 = {
  id: 'career-ib-001',
  slug: 'investment-banker',
  name: 'Investment Banker',
  category: 'finance' as CareerCategory,
  description: 'Facilitates capital raising, mergers & acquisitions, and financial advisory for corporations and institutions. Works in high-stakes financial markets.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 7,
    socialOrientation: 8,
    leadership: 8,
    detailOrientation: 10,
    curiosity: 8,
    competitiveness: 10,
    riskTolerance: 8,
  },

  workStyle: {
    remoteWork: 2,
    officeWork: 10,
    fieldWork: 3,
    travelRequirement: 6,
    teamOrientation: 9,
    soloOrientation: 4,
    structuredEnvironment: 8,
    unstructuredEnvironment: 6,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 10,
    impactPotential: 9,
    freedomPotential: 4,
    stabilityPotential: 7,
  },

  risk: {
    burnoutRisk: 10,
    automationRisk: 5,
    competitionLevel: 10,
    incomeVolatility: 7,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 9,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'private-equity',
      'hedge-fund',
      'corporate-development',
      'venture-capital',
      'cfo',
      'founder',
    ],
    adjacentCareers: [
      'financial-analyst',
      'management-consultant',
      'chartered-accountant',
      'cfa-professional',
      'private-equity-associate',
    ],
  },

  education: {
    minimumEducation: "Bachelor's from top institution + MBA preferred",
    commonDegrees: [
      'B.Com (Hons) + MBA',
      'B.A. Economics + MBA',
      'B.Tech + MBA',
      'CA + MBA',
    ],
    certifications: [
      'CFA Level 1-3',
      'Series 7, 63 (US)',
      'Financial Modeling',
    ],
    exams: ['CAT (99+ percentile)', 'GMAT (720+)', 'IIM entrance'],
    alternativeRoutes: [
      'IIM campus placement',
      'CA + investment banking firms',
      'Global MBA + recruitment',
    ],
  },

  indiaReality: {
    coachingDependency: 8,
    englishDependency: 10,
    urbanAdvantage: 10,
    migrationRequirement: 2,
    reservationSensitivity: 1,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 6,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 2,
    stressLevel: 10,
    scheduleFlexibility: 2,
    geographicFreedom: 8,
  },
};

export const FINANCIAL_ANALYST: CareerV2 = {
  id: 'career-fa-001',
  slug: 'financial-analyst',
  name: 'Financial Analyst',
  category: 'finance' as CareerCategory,
  description: 'Analyzes financial data, creates forecasts, and provides investment recommendations. Supports corporate finance and investment decisions.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 6,
    socialOrientation: 6,
    leadership: 5,
    detailOrientation: 10,
    curiosity: 8,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 6,
    officeWork: 9,
    fieldWork: 1,
    travelRequirement: 3,
    teamOrientation: 7,
    soloOrientation: 7,
    structuredEnvironment: 9,
    unstructuredEnvironment: 5,
  },

  reward: {
    incomePotential: 8,
    statusPotential: 7,
    impactPotential: 7,
    freedomPotential: 6,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 6,
    competitionLevel: 8,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 9,
    entrepreneurshipPotential: 5,
    exitOptions: [
      'investment-banker',
      'portfolio-manager',
      'financial-controller',
      'cfo',
      'equity-research',
    ],
    adjacentCareers: [
      'investment-banker',
      'chartered-accountant',
      'cfa-professional',
      'business-analyst',
      'risk-analyst',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Finance, Economics, or Commerce",
    commonDegrees: [
      'B.Com',
      'B.A. Economics',
      'BBA (Finance)',
      'MBA (Finance)',
    ],
    certifications: [
      'CFA',
      'Financial Modeling & Valuation',
      'NCFM (NSE)',
    ],
    exams: ['Regular university admissions'],
    alternativeRoutes: [
      'CA articleship + transition',
      'MBA Finance',
      'CFA while working',
    ],
  },

  indiaReality: {
    coachingDependency: 5,
    englishDependency: 8,
    urbanAdvantage: 9,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 6,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 6,
    stressLevel: 7,
    scheduleFlexibility: 5,
    geographicFreedom: 8,
  },
};

export const CHARTERED_ACCOUNTANT: CareerV2 = {
  id: 'career-ca-001',
  slug: 'chartered-accountant',
  name: 'Chartered Accountant',
  category: 'finance' as CareerCategory,
  description: 'Provides audit, taxation, and financial advisory services. Ensures compliance and advises on financial strategy for businesses.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 5,
    socialOrientation: 6,
    leadership: 7,
    detailOrientation: 10,
    curiosity: 7,
    competitiveness: 7,
    riskTolerance: 4,
  },

  workStyle: {
    remoteWork: 5,
    officeWork: 9,
    fieldWork: 4,
    travelRequirement: 5,
    teamOrientation: 8,
    soloOrientation: 6,
    structuredEnvironment: 10,
    unstructuredEnvironment: 4,
  },

  reward: {
    incomePotential: 8,
    statusPotential: 9,
    impactPotential: 8,
    freedomPotential: 8,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 7,
    competitionLevel: 8,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 9,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'cfo',
      'investment-banker',
      'management-consultant',
      'entrepreneur',
      'private-equity',
    ],
    adjacentCareers: [
      'financial-analyst',
      'cfa-professional',
      'investment-banker',
      'tax-consultant',
      'auditor',
    ],
  },

  education: {
    minimumEducation: 'CA from ICAI (3-5 years)',
    commonDegrees: [
      'CA (Chartered Accountant)',
      'B.Com + CA',
      'CA + MBA',
    ],
    certifications: [
      'CA from ICAI',
      'CPA (US)',
      'ACCA (UK)',
    ],
    exams: ['CA Foundation', 'CA Intermediate', 'CA Final', 'Articleship (3 years)'],
    alternativeRoutes: [
      'Direct after 12th (CPT route)',
      'After graduation (Direct entry)',
      'CA + international qualifications',
    ],
  },

  indiaReality: {
    coachingDependency: 9,
    englishDependency: 8,
    urbanAdvantage: 8,
    migrationRequirement: 2,
    reservationSensitivity: 2,
    familyAcceptance: 10,
  },

  futureOutlook: {
    aiDisruptionRisk: 7,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 5,
    stressLevel: 8,
    scheduleFlexibility: 5,
    geographicFreedom: 8,
  },
};

export const CFA_PROFESSIONAL: CareerV2 = {
  id: 'career-cfa-001',
  slug: 'cfa-professional',
  name: 'CFA Professional',
  category: 'finance' as CareerCategory,
  description: 'Investment and financial analysis expert with CFA charter. Specializes in portfolio management, equity research, and investment strategy.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 6,
    socialOrientation: 6,
    leadership: 6,
    detailOrientation: 10,
    curiosity: 9,
    competitiveness: 8,
    riskTolerance: 7,
  },

  workStyle: {
    remoteWork: 6,
    officeWork: 9,
    fieldWork: 1,
    travelRequirement: 3,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 8,
    unstructuredEnvironment: 6,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 9,
    impactPotential: 8,
    freedomPotential: 7,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 5,
    competitionLevel: 9,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 9,
    entrepreneurshipPotential: 6,
    exitOptions: [
      'portfolio-manager',
      'investment-banker',
      'equity-research',
      'private-equity',
      'cfo',
    ],
    adjacentCareers: [
      'financial-analyst',
      'investment-banker',
      'chartered-accountant',
      'risk-manager',
      'portfolio-manager',
    ],
  },

  education: {
    minimumEducation: "Bachelor's + CFA Charter (3 levels)",
    commonDegrees: [
      'B.Com + CFA',
      'B.A. Economics + CFA',
      'B.Tech + CFA',
      'MBA + CFA',
    ],
    certifications: [
      'CFA Charter (Level I, II, III)',
      'FRM (Financial Risk Manager)',
    ],
    exams: ['CFA Level I', 'CFA Level II', 'CFA Level III', '4 years work experience'],
    alternativeRoutes: [
      'Work in finance + CFA alongside',
      'MBA Finance + CFA',
      'CA + CFA combination',
    ],
  },

  indiaReality: {
    coachingDependency: 7,
    englishDependency: 9,
    urbanAdvantage: 10,
    migrationRequirement: 3,
    reservationSensitivity: 1,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 6,
    stressLevel: 7,
    scheduleFlexibility: 6,
    geographicFreedom: 9,
  },
};

// ============================================================================
// GOVERNMENT CAREERS
// ============================================================================

export const IAS_OFFICER: CareerV2 = {
  id: 'career-ias-001',
  slug: 'ias-officer',
  name: 'IAS Officer',
  category: 'government' as CareerCategory,
  description: 'Indian Administrative Service officer. Leads district administration, formulates policies, and manages public service delivery at highest levels.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 7,
    socialOrientation: 9,
    leadership: 10,
    detailOrientation: 9,
    curiosity: 9,
    competitiveness: 10,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 1,
    officeWork: 8,
    fieldWork: 9,
    travelRequirement: 8,
    teamOrientation: 9,
    soloOrientation: 5,
    structuredEnvironment: 9,
    unstructuredEnvironment: 7,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 4,
    stabilityPotential: 10,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 1,
    competitionLevel: 10,
    incomeVolatility: 1,
  },

  optionality: {
    careerFlexibility: 4,
    transferableSkills: 8,
    entrepreneurshipPotential: 3,
    exitOptions: [
      'private-sector-cxo',
      'international-organizations',
      'public-policy',
      'academia',
      'politics',
    ],
    adjacentCareers: [
      'ips-officer',
      'irs-officer',
      'state-pcs-officer',
      'public-policy-expert',
      'diplomat',
    ],
  },

  education: {
    minimumEducation: "Bachelor's degree (any discipline) + UPSC CSE",
    commonDegrees: [
      'B.A. (History, Political Science)',
      'B.Sc',
      'B.Tech (common among IAS)',
      'B.Com',
    ],
    certifications: [
      'UPSC CSE Selection',
      'Foundation Course (LBSNAA)',
    ],
    exams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'Personality Test (Interview)'],
    alternativeRoutes: [
      'Engineering + UPSC (common pattern)',
      'Humanities + UPSC',
      'Multiple attempts (average 2-3)',
    ],
  },

  indiaReality: {
    coachingDependency: 10,
    englishDependency: 9,
    urbanAdvantage: 8,
    migrationRequirement: 10,
    reservationSensitivity: 10,
    familyAcceptance: 10,
  },

  futureOutlook: {
    aiDisruptionRisk: 1,
    futureDemand: 10,
    industryGrowth: 9,
    globalMobility: 6,
  },

  lifestyle: {
    workLifeBalance: 5,
    stressLevel: 9,
    scheduleFlexibility: 2,
    geographicFreedom: 2,
  },
};

export const IPS_OFFICER: CareerV2 = {
  id: 'career-ips-001',
  slug: 'ips-officer',
  name: 'IPS Officer',
  category: 'government' as CareerCategory,
  description: 'Indian Police Service officer. Maintains law and order, leads police forces, and ensures public safety at district and state levels.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 6,
    socialOrientation: 9,
    leadership: 10,
    detailOrientation: 8,
    curiosity: 7,
    competitiveness: 10,
    riskTolerance: 8,
  },

  workStyle: {
    remoteWork: 1,
    officeWork: 6,
    fieldWork: 10,
    travelRequirement: 9,
    teamOrientation: 10,
    soloOrientation: 3,
    structuredEnvironment: 9,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 3,
    stabilityPotential: 10,
  },

  risk: {
    burnoutRisk: 9,
    automationRisk: 1,
    competitionLevel: 10,
    incomeVolatility: 1,
  },

  optionality: {
    careerFlexibility: 3,
    transferableSkills: 7,
    entrepreneurshipPotential: 2,
    exitOptions: [
      'security-consultant',
      'intelligence-agencies',
      'private-security',
      'politics',
      'academia',
    ],
    adjacentCareers: [
      'ias-officer',
      'irs-officer',
      'state-police-service',
      'intelligence-officer',
      'defence-officer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's degree (any discipline) + UPSC CSE",
    commonDegrees: [
      'B.A.',
      'B.Sc',
      'B.Tech',
      'Any degree + physical fitness',
    ],
    certifications: [
      'UPSC CSE Selection',
      'Police Training (SVPNPA)',
    ],
    exams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'Personality Test', 'Physical Tests'],
    alternativeRoutes: [
      'State Police Service promotion',
      'UPSC direct recruitment',
      'Engineering + UPSC',
    ],
  },

  indiaReality: {
    coachingDependency: 10,
    englishDependency: 8,
    urbanAdvantage: 7,
    migrationRequirement: 10,
    reservationSensitivity: 10,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 2,
    futureDemand: 10,
    industryGrowth: 9,
    globalMobility: 4,
  },

  lifestyle: {
    workLifeBalance: 4,
    stressLevel: 10,
    scheduleFlexibility: 1,
    geographicFreedom: 2,
  },
};

export const IRS_OFFICER: CareerV2 = {
  id: 'career-irs-001',
  slug: 'irs-officer',
  name: 'IRS Officer',
  category: 'government' as CareerCategory,
  description: 'Indian Revenue Service officer. Administers direct and indirect taxes, ensures tax compliance, and formulates revenue policy.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 5,
    socialOrientation: 7,
    leadership: 8,
    detailOrientation: 10,
    curiosity: 7,
    competitiveness: 9,
    riskTolerance: 5,
  },

  workStyle: {
    remoteWork: 2,
    officeWork: 9,
    fieldWork: 6,
    travelRequirement: 5,
    teamOrientation: 8,
    soloOrientation: 7,
    structuredEnvironment: 10,
    unstructuredEnvironment: 5,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 9,
    impactPotential: 9,
    freedomPotential: 5,
    stabilityPotential: 10,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 3,
    competitionLevel: 10,
    incomeVolatility: 1,
  },

  optionality: {
    careerFlexibility: 5,
    transferableSkills: 8,
    entrepreneurshipPotential: 4,
    exitOptions: [
      'tax-consultant',
      'private-sector-cfo',
      'international-tax-expert',
      'academia',
      'policy-think-tank',
    ],
    adjacentCareers: [
      'ias-officer',
      'chartered-accountant',
      'tax-consultant',
      'financial-analyst',
      'customs-officer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's degree (any discipline) + UPSC CSE",
    commonDegrees: [
      'B.Com',
      'B.A.',
      'B.Sc',
      'B.Tech',
      'Law (helpful for tax)',
    ],
    certifications: [
      'UPSC CSE Selection',
      'Revenue Service Training',
    ],
    exams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'Personality Test'],
    alternativeRoutes: [
      'Commerce background + UPSC',
      'CA + UPSC (advantageous)',
      'Law + UPSC',
    ],
  },

  indiaReality: {
    coachingDependency: 10,
    englishDependency: 8,
    urbanAdvantage: 8,
    migrationRequirement: 9,
    reservationSensitivity: 10,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 6,
  },

  lifestyle: {
    workLifeBalance: 6,
    stressLevel: 7,
    scheduleFlexibility: 4,
    geographicFreedom: 4,
  },
};

// ============================================================================
// HEALTHCARE CAREERS
// ============================================================================

export const DOCTOR: CareerV2 = {
  id: 'career-doc-001',
  slug: 'doctor',
  name: 'Doctor (Physician)',
  category: 'healthcare' as CareerCategory,
  description: 'Medical doctor diagnosing illnesses, prescribing treatments, and providing comprehensive patient care. Requires MBBS + specialization.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 7,
    socialOrientation: 9,
    leadership: 7,
    detailOrientation: 10,
    curiosity: 10,
    competitiveness: 8,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 2,
    officeWork: 7,
    fieldWork: 3,
    travelRequirement: 2,
    teamOrientation: 9,
    soloOrientation: 5,
    structuredEnvironment: 8,
    unstructuredEnvironment: 7,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 7,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 9,
    automationRisk: 2,
    competitionLevel: 9,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 6,
    transferableSkills: 7,
    entrepreneurshipPotential: 8,
    exitOptions: [
      'specialist-doctor',
      'surgeon',
      'hospital-administrator',
      'medical-researcher',
      'public-health-expert',
    ],
    adjacentCareers: [
      'surgeon',
      'psychiatrist',
      'radiologist',
      'pathologist',
      'medical-researcher',
    ],
  },

  education: {
    minimumEducation: 'MBBS (5.5 years) + MD/MS (3 years)',
    commonDegrees: [
      'MBBS',
      'MD (Medicine)',
      'MS (Surgery)',
      'DM (Super-specialization)',
    ],
    certifications: [
      'NMC Registration',
      'Specialization Board Certification',
    ],
    exams: ['NEET UG (MBBS)', 'NEET PG (MD/MS)', 'NEXT (proposed)'],
    alternativeRoutes: [
      'MBBS abroad + FMGE',
      'BDS + transition (rare)',
      'Ayush + bridge course',
    ],
  },

  indiaReality: {
    coachingDependency: 10,
    englishDependency: 9,
    urbanAdvantage: 9,
    migrationRequirement: 5,
    reservationSensitivity: 9,
    familyAcceptance: 10,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 4,
    stressLevel: 9,
    scheduleFlexibility: 3,
    geographicFreedom: 7,
  },
};

export const SURGEON: CareerV2 = {
  id: 'career-surg-001',
  slug: 'surgeon',
  name: 'Surgeon',
  category: 'healthcare' as CareerCategory,
  description: 'Specialized medical doctor performing operations to treat injuries, diseases, and deformities. Requires exceptional manual dexterity and decision-making under pressure.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 8,
    socialOrientation: 7,
    leadership: 9,
    detailOrientation: 10,
    curiosity: 9,
    competitiveness: 9,
    riskTolerance: 8,
  },

  workStyle: {
    remoteWork: 1,
    officeWork: 6,
    fieldWork: 2,
    travelRequirement: 2,
    teamOrientation: 10,
    soloOrientation: 4,
    structuredEnvironment: 8,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 10,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 7,
    stabilityPotential: 9,
  },

  risk: {
    burnoutRisk: 10,
    automationRisk: 3,
    competitionLevel: 10,
    incomeVolatility: 3,
  },

  optionality: {
    careerFlexibility: 5,
    transferableSkills: 6,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'hospital-founder',
      'medical-device-consultant',
      'academic-surgeon',
      'robotic-surgery-specialist',
    ],
    adjacentCareers: [
      'doctor',
      'anesthesiologist',
      'radiologist',
      'surgical-oncologist',
      'orthopedic-surgeon',
    ],
  },

  education: {
    minimumEducation: 'MBBS + MS (Surgery) + MCh (Super-specialization)',
    commonDegrees: [
      'MBBS',
      'MS (General Surgery)',
      'MCh (Cardiac/Neuro/Plastic/etc.)',
    ],
    certifications: [
      'NMC Registration',
      'FRCS (Royal College)',
      'Specialty Board Certification',
    ],
    exams: ['NEET UG', 'NEET PG', 'NEET SS (Super-specialty)'],
    alternativeRoutes: [
      'MBBS → MS → MCh (long route)',
      'Fellowships abroad',
      'Robotic surgery certifications',
    ],
  },

  indiaReality: {
    coachingDependency: 10,
    englishDependency: 9,
    urbanAdvantage: 10,
    migrationRequirement: 5,
    reservationSensitivity: 9,
    familyAcceptance: 10,
  },

  futureOutlook: {
    aiDisruptionRisk: 4,
    futureDemand: 10,
    industryGrowth: 10,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 3,
    stressLevel: 10,
    scheduleFlexibility: 2,
    geographicFreedom: 7,
  },
};

export const PSYCHOLOGIST: CareerV2 = {
  id: 'career-psych-001',
  slug: 'psychologist',
  name: 'Psychologist',
  category: 'healthcare' as CareerCategory,
  description: 'Studies human behavior and mental processes. Provides therapy, conducts assessments, and helps individuals overcome psychological challenges.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 8,
    socialOrientation: 10,
    leadership: 6,
    detailOrientation: 9,
    curiosity: 10,
    competitiveness: 5,
    riskTolerance: 4,
  },

  workStyle: {
    remoteWork: 8,
    officeWork: 7,
    fieldWork: 3,
    travelRequirement: 2,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 5,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 6,
    statusPotential: 7,
    impactPotential: 9,
    freedomPotential: 9,
    stabilityPotential: 7,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 3,
    competitionLevel: 6,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 8,
    entrepreneurshipPotential: 8,
    exitOptions: [
      'clinical-psychologist',
      'organizational-psychologist',
      'school-counselor',
      'hr-consultant',
      'user-researcher',
    ],
    adjacentCareers: [
      'psychiatrist',
      'counselor',
      'hr-specialist',
      'user-researcher',
      'social-worker',
    ],
  },

  education: {
    minimumEducation: "Bachelor's + Master's in Psychology",
    commonDegrees: [
      'B.A./B.Sc Psychology',
      'M.A./M.Sc Psychology',
      'M.Phil Clinical Psychology',
      'PhD Psychology',
    ],
    certifications: [
      'RCI Registration (Rehabilitation Council)',
      'Clinical Psychology License',
    ],
    exams: ['University entrance exams', 'NET/JRF for PhD'],
    alternativeRoutes: [
      'B.A. Psychology + M.A. + M.Phil',
      'Counseling psychology (shorter path)',
      'Industrial/Organizational psychology',
    ],
  },

  indiaReality: {
    coachingDependency: 5,
    englishDependency: 8,
    urbanAdvantage: 9,
    migrationRequirement: 3,
    reservationSensitivity: 4,
    familyAcceptance: 6,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 8,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 8,
    geographicFreedom: 8,
  },
};

// ============================================================================
// LAW CAREERS
// ============================================================================

export const CORPORATE_LAWYER: CareerV2 = {
  id: 'career-law-corp-001',
  slug: 'corporate-lawyer',
  name: 'Corporate Lawyer',
  category: 'law' as CareerCategory,
  description: 'Advises businesses on legal matters including mergers, acquisitions, contracts, and compliance. Works in law firms or corporate legal departments.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 7,
    socialOrientation: 8,
    leadership: 7,
    detailOrientation: 10,
    curiosity: 8,
    competitiveness: 8,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 5,
    officeWork: 9,
    fieldWork: 1,
    travelRequirement: 4,
    teamOrientation: 8,
    soloOrientation: 6,
    structuredEnvironment: 8,
    unstructuredEnvironment: 6,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 9,
    impactPotential: 8,
    freedomPotential: 6,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 5,
    competitionLevel: 9,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 8,
    transferableSkills: 8,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'general-counsel',
      'compliance-officer',
      'investment-banker',
      'private-equity',
      'legal-entrepreneur',
    ],
    adjacentCareers: [
      'litigation-lawyer',
      'judge',
      'investment-banker',
      'management-consultant',
      'compliance-officer',
    ],
  },

  education: {
    minimumEducation: 'LLB (3 years) or BA LLB (5 years)',
    commonDegrees: [
      'BA LLB (5-year integrated)',
      'LLB (3-year after graduation)',
      'LLM (optional)',
    ],
    certifications: [
      'Bar Council Registration',
      'Corporate Law Certifications',
    ],
    exams: ['CLAT (for 5-year)', 'AILET', 'LSAT', 'State bar exams'],
    alternativeRoutes: [
      'Engineering + LLB (IP law)',
      'CA + LLB (tax law)',
      'CS + LLB (corporate)',
    ],
  },

  indiaReality: {
    coachingDependency: 7,
    englishDependency: 10,
    urbanAdvantage: 10,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 8,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 5,
    stressLevel: 8,
    scheduleFlexibility: 5,
    geographicFreedom: 8,
  },
};

export const LITIGATION_LAWYER: CareerV2 = {
  id: 'career-law-lit-001',
  slug: 'litigation-lawyer',
  name: 'Litigation Lawyer',
  category: 'law' as CareerCategory,
  description: 'Represents clients in court proceedings, argues cases before judges, and navigates the judicial system to resolve disputes.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 9,
    creativity: 8,
    socialOrientation: 9,
    leadership: 8,
    detailOrientation: 9,
    curiosity: 8,
    competitiveness: 10,
    riskTolerance: 7,
  },

  workStyle: {
    remoteWork: 3,
    officeWork: 7,
    fieldWork: 6,
    travelRequirement: 6,
    teamOrientation: 7,
    soloOrientation: 7,
    structuredEnvironment: 6,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 9,
    impactPotential: 9,
    freedomPotential: 7,
    stabilityPotential: 6,
  },

  risk: {
    burnoutRisk: 8,
    automationRisk: 3,
    competitionLevel: 10,
    incomeVolatility: 7,
  },

  optionality: {
    careerFlexibility: 7,
    transferableSkills: 8,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'senior-advocate',
      'judge',
      'corporate-lawyer',
      'legal-academia',
      'politics',
    ],
    adjacentCareers: [
      'corporate-lawyer',
      'judge',
      'public-prosecutor',
      'legal-aid-lawyer',
      'arbitration-lawyer',
    ],
  },

  education: {
    minimumEducation: 'LLB + Bar Registration',
    commonDegrees: [
      'BA LLB',
      'LLB',
      'LLM (optional)',
    ],
    certifications: [
      'Bar Council Registration',
      'Advocate-on-Record (Supreme Court)',
    ],
    exams: ['CLAT', 'AILET', 'State Bar Council exams'],
    alternativeRoutes: [
      'Apprenticeship under senior advocate',
      'District court practice → High Court',
      'Judicial services exam preparation',
    ],
  },

  indiaReality: {
    coachingDependency: 7,
    englishDependency: 9,
    urbanAdvantage: 9,
    migrationRequirement: 4,
    reservationSensitivity: 3,
    familyAcceptance: 7,
  },

  futureOutlook: {
    aiDisruptionRisk: 4,
    futureDemand: 8,
    industryGrowth: 8,
    globalMobility: 7,
  },

  lifestyle: {
    workLifeBalance: 5,
    stressLevel: 9,
    scheduleFlexibility: 6,
    geographicFreedom: 7,
  },
};

export const JUDGE: CareerV2 = {
  id: 'career-judge-001',
  slug: 'judge',
  name: 'Judge',
  category: 'law' as CareerCategory,
  description: 'Presides over court proceedings, interprets law, and delivers judgments. Ensures justice and upholds the rule of law.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 6,
    socialOrientation: 8,
    leadership: 10,
    detailOrientation: 10,
    curiosity: 8,
    competitiveness: 6,
    riskTolerance: 4,
  },

  workStyle: {
    remoteWork: 1,
    officeWork: 9,
    fieldWork: 2,
    travelRequirement: 3,
    teamOrientation: 8,
    soloOrientation: 7,
    structuredEnvironment: 10,
    unstructuredEnvironment: 5,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 10,
    impactPotential: 10,
    freedomPotential: 3,
    stabilityPotential: 10,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 2,
    competitionLevel: 10,
    incomeVolatility: 1,
  },

  optionality: {
    careerFlexibility: 2,
    transferableSkills: 7,
    entrepreneurshipPotential: 1,
    exitOptions: [
      'law-commission',
      'tribunal-member',
      'arbitrator',
      'legal-academia',
      'post-retirement-practice',
    ],
    adjacentCareers: [
      'litigation-lawyer',
      'corporate-lawyer',
      'public-prosecutor',
      'legal-academia',
      'tribunal-judge',
    ],
  },

  education: {
    minimumEducation: 'LLB + Judicial Services Exam',
    commonDegrees: [
      'LLB',
      'LLM (helpful)',
    ],
    certifications: [
      'Judicial Service Selection',
      'Judicial Training',
    ],
    exams: ['State Judicial Services', 'Higher Judicial Services', 'Supreme Court Advocate'],
    alternativeRoutes: [
      'Litigation practice + Judicial exam',
      'Fresh law graduate + State judicial exam',
      'Promoted from lower judiciary',
    ],
  },

  indiaReality: {
    coachingDependency: 9,
    englishDependency: 9,
    urbanAdvantage: 8,
    migrationRequirement: 10,
    reservationSensitivity: 8,
    familyAcceptance: 9,
  },

  futureOutlook: {
    aiDisruptionRisk: 2,
    futureDemand: 9,
    industryGrowth: 8,
    globalMobility: 4,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 8,
    scheduleFlexibility: 3,
    geographicFreedom: 2,
  },
};

// ============================================================================
// DESIGN & CREATIVE CAREERS
// ============================================================================

export const UX_DESIGNER: CareerV2 = {
  id: 'career-ux-001',
  slug: 'ux-designer',
  name: 'UX Designer',
  category: 'design' as CareerCategory,
  description: 'Designs user experiences for digital products. Conducts research, creates wireframes, and ensures products meet user needs effectively.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 9,
    socialOrientation: 8,
    leadership: 6,
    detailOrientation: 8,
    curiosity: 9,
    competitiveness: 6,
    riskTolerance: 5,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 7,
    fieldWork: 2,
    travelRequirement: 2,
    teamOrientation: 9,
    soloOrientation: 6,
    structuredEnvironment: 6,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 8,
    statusPotential: 7,
    impactPotential: 8,
    freedomPotential: 9,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 6,
    automationRisk: 4,
    competitionLevel: 8,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 9,
    entrepreneurshipPotential: 8,
    exitOptions: [
      'product-manager',
      'ux-researcher',
      'design-lead',
      'design-consultant',
      'founder',
    ],
    adjacentCareers: [
      'product-designer',
      'ui-designer',
      'product-manager',
      'user-researcher',
      'interaction-designer',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Design, HCI, or related field",
    commonDegrees: [
      'B.Des (Design)',
      'B.Tech (HCI)',
      'B.A. Psychology + Design',
      'M.Des UX',
    ],
    certifications: [
      'Google UX Design Certificate',
      'NN/g UX Master',
      'Adobe Certified',
    ],
    exams: ['NID Entrance', 'NIFT Entrance', 'Regular admissions'],
    alternativeRoutes: [
      'Engineering + design bootcamp',
      'Psychology + UX courses',
      'Self-taught + strong portfolio',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 8,
    urbanAdvantage: 10,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 7,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 8,
    stressLevel: 6,
    scheduleFlexibility: 9,
    geographicFreedom: 10,
  },
};

export const PRODUCT_DESIGNER: CareerV2 = {
  id: 'career-pd-001',
  slug: 'product-designer',
  name: 'Product Designer',
  category: 'design' as CareerCategory,
  description: 'End-to-end designer combining UX, UI, and product thinking. Owns the complete design of digital products from concept to launch.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 8,
    creativity: 9,
    socialOrientation: 7,
    leadership: 7,
    detailOrientation: 9,
    curiosity: 9,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 9,
    officeWork: 7,
    fieldWork: 2,
    travelRequirement: 2,
    teamOrientation: 9,
    soloOrientation: 6,
    structuredEnvironment: 6,
    unstructuredEnvironment: 8,
  },

  reward: {
    incomePotential: 9,
    statusPotential: 8,
    impactPotential: 9,
    freedomPotential: 9,
    stabilityPotential: 8,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 4,
    competitionLevel: 8,
    incomeVolatility: 4,
  },

  optionality: {
    careerFlexibility: 9,
    transferableSkills: 9,
    entrepreneurshipPotential: 9,
    exitOptions: [
      'design-lead',
      'product-manager',
      'design-founder',
      'design-consultant',
      'design-director',
    ],
    adjacentCareers: [
      'ux-designer',
      'ui-designer',
      'product-manager',
      'graphic-designer',
      'design-researcher',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Design or related field",
    commonDegrees: [
      'B.Des',
      'B.Tech + Design courses',
      'B.F.A.',
      'M.Des',
    ],
    certifications: [
      'Google UX Certificate',
      'Design sprint certifications',
      'Figma/Sketch mastery',
    ],
    exams: ['NID', 'NIFT', 'Regular admissions'],
    alternativeRoutes: [
      'Engineering + design transition',
      'Bootcamps + portfolio',
      'Self-taught + freelance experience',
    ],
  },

  indiaReality: {
    coachingDependency: 4,
    englishDependency: 8,
    urbanAdvantage: 10,
    migrationRequirement: 3,
    reservationSensitivity: 2,
    familyAcceptance: 7,
  },

  futureOutlook: {
    aiDisruptionRisk: 5,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 9,
    geographicFreedom: 10,
  },
};

// ============================================================================
// SCIENCE CAREERS
// ============================================================================

export const RESEARCH_SCIENTIST: CareerV2 = {
  id: 'career-rs-001',
  slug: 'research-scientist',
  name: 'Research Scientist',
  category: 'science' as CareerCategory,
  description: 'Conducts original research to advance knowledge in a scientific field. Works in academia, industry R&D, or research institutions.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 9,
    socialOrientation: 5,
    leadership: 6,
    detailOrientation: 10,
    curiosity: 10,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 6,
    officeWork: 7,
    fieldWork: 4,
    travelRequirement: 4,
    teamOrientation: 7,
    soloOrientation: 8,
    structuredEnvironment: 5,
    unstructuredEnvironment: 9,
  },

  reward: {
    incomePotential: 6,
    statusPotential: 9,
    impactPotential: 10,
    freedomPotential: 8,
    stabilityPotential: 6,
  },

  risk: {
    burnoutRisk: 7,
    automationRisk: 3,
    competitionLevel: 9,
    incomeVolatility: 6,
  },

  optionality: {
    careerFlexibility: 7,
    transferableSkills: 8,
    entrepreneurshipPotential: 6,
    exitOptions: [
      'professor',
      'industry-rd',
      'science-policy',
      'tech-transfer',
      'founder',
    ],
    adjacentCareers: [
      'biotechnologist',
      'data-scientist',
      'ai-researcher',
      'professor',
      'science-writer',
    ],
  },

  education: {
    minimumEducation: 'PhD in relevant scientific discipline',
    commonDegrees: [
      'B.Sc',
      'M.Sc',
      'PhD',
      'Post-doctoral fellowship',
    ],
    certifications: [
      'Publication record',
      'Research grants',
      'Peer review experience',
    ],
    exams: ['JAM', 'GATE', 'NET/JRF', 'GRE (for abroad)'],
    alternativeRoutes: [
      'Integrated PhD after B.Sc',
      'B.Tech + MS/PhD',
      'Research assistant → PhD',
    ],
  },

  indiaReality: {
    coachingDependency: 6,
    englishDependency: 9,
    urbanAdvantage: 9,
    migrationRequirement: 7,
    reservationSensitivity: 5,
    familyAcceptance: 7,
  },

  futureOutlook: {
    aiDisruptionRisk: 3,
    futureDemand: 9,
    industryGrowth: 9,
    globalMobility: 10,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 7,
    scheduleFlexibility: 8,
    geographicFreedom: 8,
  },
};

export const BIOTECHNOLOGIST: CareerV2 = {
  id: 'career-bt-001',
  slug: 'biotechnologist',
  name: 'Biotechnologist',
  category: 'science' as CareerCategory,
  description: 'Applies biological principles to develop products and technologies. Works in pharmaceuticals, agriculture, healthcare, and environmental sectors.',
  version: '2.0.0',
  lastUpdated: Date.now(),

  psychology: {
    analyticalThinking: 10,
    creativity: 8,
    socialOrientation: 6,
    leadership: 6,
    detailOrientation: 10,
    curiosity: 9,
    competitiveness: 7,
    riskTolerance: 6,
  },

  workStyle: {
    remoteWork: 3,
    officeWork: 7,
    fieldWork: 5,
    travelRequirement: 3,
    teamOrientation: 8,
    soloOrientation: 7,
    structuredEnvironment: 7,
    unstructuredEnvironment: 7,
  },

  reward: {
    incomePotential: 7,
    statusPotential: 8,
    impactPotential: 9,
    freedomPotential: 7,
    stabilityPotential: 7,
  },

  risk: {
    burnoutRisk: 6,
    automationRisk: 4,
    competitionLevel: 8,
    incomeVolatility: 5,
  },

  optionality: {
    careerFlexibility: 7,
    transferableSkills: 8,
    entrepreneurshipPotential: 7,
    exitOptions: [
      'research-scientist',
      'pharma-rd',
      'bioinformatics',
      'regulatory-affairs',
      'biotech-founder',
    ],
    adjacentCareers: [
      'research-scientist',
      'pharmacologist',
      'bioinformatician',
      'clinical-research-associate',
      'quality-control-scientist',
    ],
  },

  education: {
    minimumEducation: "Bachelor's in Biotechnology/Life Sciences",
    commonDegrees: [
      'B.Tech Biotechnology',
      'B.Sc Biotechnology',
      'M.Sc Biotechnology',
      'PhD (for research)',
    ],
    certifications: [
      'GMP Certification',
      'Clinical Research certifications',
      'Bioinformatics tools',
    ],
    exams: ['JEE (B.Tech)', 'University entrances', 'GATE (M.Tech)'],
    alternativeRoutes: [
      'B.Sc + M.Sc + PhD',
      'B.Tech + MTech',
      'B.Pharm + biotech transition',
    ],
  },

  indiaReality: {
    coachingDependency: 7,
    englishDependency: 8,
    urbanAdvantage: 9,
    migrationRequirement: 6,
    reservationSensitivity: 5,
    familyAcceptance: 7,
  },

  futureOutlook: {
    aiDisruptionRisk: 4,
    futureDemand: 9,
    industryGrowth: 10,
    globalMobility: 9,
  },

  lifestyle: {
    workLifeBalance: 7,
    stressLevel: 6,
    scheduleFlexibility: 7,
    geographicFreedom: 8,
  },
};

// ============================================================================
// ELITE CAREER SET EXPORTS
// ============================================================================

/** All 25 elite careers as an array */
export const ELITE_CAREERS: CareerV2[] = [
  // Technology (6)
  SOFTWARE_ENGINEER,
  AI_ENGINEER,
  ML_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  CYBERSECURITY_ENGINEER,

  // Business (4)
  MANAGEMENT_CONSULTANT,
  BUSINESS_ANALYST,
  OPERATIONS_MANAGER,
  ENTREPRENEUR,

  // Finance (4)
  INVESTMENT_BANKER,
  FINANCIAL_ANALYST,
  CHARTERED_ACCOUNTANT,
  CFA_PROFESSIONAL,

  // Government (3)
  IAS_OFFICER,
  IPS_OFFICER,
  IRS_OFFICER,

  // Healthcare (3)
  DOCTOR,
  SURGEON,
  PSYCHOLOGIST,

  // Law (3)
  CORPORATE_LAWYER,
  LITIGATION_LAWYER,
  JUDGE,

  // Design (2)
  UX_DESIGNER,
  PRODUCT_DESIGNER,

  // Science (2)
  RESEARCH_SCIENTIST,
  BIOTECHNOLOGIST,
];

/** Elite careers grouped by category */
export const ELITE_CAREERS_BY_CATEGORY: Record<string, CareerV2[]> = {
  technology: [
    SOFTWARE_ENGINEER,
    AI_ENGINEER,
    ML_ENGINEER,
    DATA_SCIENTIST,
    PRODUCT_MANAGER,
    CYBERSECURITY_ENGINEER,
  ],
  business: [
    MANAGEMENT_CONSULTANT,
    BUSINESS_ANALYST,
    OPERATIONS_MANAGER,
    ENTREPRENEUR,
  ],
  finance: [
    INVESTMENT_BANKER,
    FINANCIAL_ANALYST,
    CHARTERED_ACCOUNTANT,
    CFA_PROFESSIONAL,
  ],
  government: [
    IAS_OFFICER,
    IPS_OFFICER,
    IRS_OFFICER,
  ],
  healthcare: [
    DOCTOR,
    SURGEON,
    PSYCHOLOGIST,
  ],
  law: [
    CORPORATE_LAWYER,
    LITIGATION_LAWYER,
    JUDGE,
  ],
  design: [
    UX_DESIGNER,
    PRODUCT_DESIGNER,
  ],
  science: [
    RESEARCH_SCIENTIST,
    BIOTECHNOLOGIST,
  ],
};

/** Get career by slug */
export function getEliteCareerBySlug(slug: string): CareerV2 | undefined {
  return ELITE_CAREERS.find(career => career.slug === slug);
}

/** Get careers by category */
export function getEliteCareersByCategory(category: string): CareerV2[] {
  return ELITE_CAREERS_BY_CATEGORY[category] || [];
}

/** Validate all elite careers using the authoring framework */
export function validateEliteCareers(): {
  valid: CareerV2[];
  invalid: { career: CareerV2; errors: string[] }[];
} {
  const valid: CareerV2[] = [];
  const invalid: { career: CareerV2; errors: string[] }[] = [];

  for (const career of ELITE_CAREERS) {
    const errors: string[] = [];

    // Basic validation
    if (!career.id) errors.push('Missing ID');
    if (!career.slug) errors.push('Missing slug');
    if (!career.name) errors.push('Missing name');
    if (!career.category) errors.push('Missing category');
    if (!career.psychology) errors.push('Missing psychology profile');
    if (!career.reward) errors.push('Missing reward profile');

    // Score range validation
    if (career.psychology) {
      for (const [key, value] of Object.entries(career.psychology)) {
        if (typeof value === 'number' && (value < 0 || value > 10)) {
          errors.push(`Psychology ${key} out of range: ${value}`);
        }
      }
    }

    if (career.reward) {
      for (const [key, value] of Object.entries(career.reward)) {
        if (typeof value === 'number' && (value < 0 || value > 10)) {
          errors.push(`Reward ${key} out of range: ${value}`);
        }
      }
    }

    if (errors.length === 0) {
      valid.push(career);
    } else {
      invalid.push({ career, errors });
    }
  }

  return { valid, invalid };
}

/** Get elite career statistics */
export function getEliteCareerStats(): {
  total: number;
  byCategory: Record<string, number>;
  avgIncomePotential: number;
  avgWorkLifeBalance: number;
  avgCompetitionLevel: number;
} {
  const byCategory: Record<string, number> = {};
  let totalIncome = 0;
  let totalWorkLifeBalance = 0;
  let totalCompetition = 0;

  for (const career of ELITE_CAREERS) {
    byCategory[career.category] = (byCategory[career.category] || 0) + 1;
    totalIncome += career.reward?.incomePotential || 0;
    totalWorkLifeBalance += career.lifestyle?.workLifeBalance || 0;
    totalCompetition += career.risk?.competitionLevel || 0;
  }

  return {
    total: ELITE_CAREERS.length,
    byCategory,
    avgIncomePotential: totalIncome / ELITE_CAREERS.length,
    avgWorkLifeBalance: totalWorkLifeBalance / ELITE_CAREERS.length,
    avgCompetitionLevel: totalCompetition / ELITE_CAREERS.length,
  };
}
