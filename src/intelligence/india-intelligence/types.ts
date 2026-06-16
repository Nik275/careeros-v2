/**
 * India Intelligence Layer - Types
 * 
 * Comprehensive type system for modeling Indian career reality including:
 * - Competitive exam pathways (JEE, NEET, UPSC, CA/CS/CMA)
 * - Family business dynamics
 * - Regional and economic constraints
 * - India-specific motivations
 * 
 * @module intelligence/india-intelligence
 */

// =============================================================================
// CORE ENUMS
// =============================================================================

/**
 * Major competitive exam systems in India
 */
export enum IndiaExamType {
  JEE = 'JEE',
  NEET = 'NEET',
  UPSC = 'UPSC',
  STATE_PSC = 'STATE_PSC',
  CA = 'CA',
  CS = 'CS',
  CMA = 'CMA',
  CLAT = 'CLAT',
  CAT = 'CAT',
  GATE = 'GATE',
  BANK_PO = 'BANK_PO',
  SSC = 'SSC',
  RAILWAYS = 'RAILWAYS',
  DEFENSE = 'DEFENSE',
}

/**
 * Engineering college tiers in India
 */
export enum EngineeringCollegeTier {
  OLD_IIT = 'OLD_IIT',           // IIT Bombay, Delhi, Kharagpur, Madras, Kanpur
  NEW_IIT = 'NEW_IIT',           // Post-2008 IITs
  TOP_NIT = 'TOP_NIT',           // NIT Trichy, Surathkal, Warangal
  OTHER_NIT = 'OTHER_NIT',       // Other NITs
  IIIT_HYDERABAD = 'IIIT_HYDERABAD',
  IIIT_BANGALORE = 'IIIT_BANGALORE',
  OTHER_IIIT = 'OTHER_IIIT',
  BITS = 'BITS',
  DTU_NSIT = 'DTU_NSIT',         // Delhi Tech University, NSIT
  TOP_STATE_GOV = 'TOP_STATE_GOV', // COEP, PEC, VJTI, etc.
  OTHER_STATE_GOV = 'OTHER_STATE_GOV',
  PRIVATE_TIER1 = 'PRIVATE_TIER1', // VIT, SRM, Manipal
  PRIVATE_TIER2 = 'PRIVATE_TIER2', // Other reputed private
  PRIVATE_TIER3 = 'PRIVATE_TIER3', // Local private colleges
}

/**
 * Medical education pathways
 */
export enum MedicalEducationPath {
  MBBS_GOV = 'MBBS_GOV',
  MBBS_PRIVATE_INDIA = 'MBBS_PRIVATE_INDIA',
  MBBS_ABROAD = 'MBBS_ABROAD',
  BDS_GOV = 'BDS_GOV',
  BDS_PRIVATE = 'BDS_PRIVATE',
  BAMS_GOV = 'BAMS_GOV',
  BAMS_PRIVATE = 'BAMS_PRIVATE',
  BHMS_GOV = 'BHMS_GOV',
  BHMS_PRIVATE = 'BHMS_PRIVATE',
  BUMS = 'BUMS',
  BVSC = 'BVSC',
  NURSING_GOV = 'NURSING_GOV',
  NURSING_PRIVATE = 'NURSING_PRIVATE',
  ALLIED_HEALTH = 'ALLIED_HEALTH',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  PHARMACY = 'PHARMACY',
}

/**
 * UPSC/PSC services
 */
export enum CivilServiceType {
  IAS = 'IAS',
  IPS = 'IPS',
  IFS = 'IFS',
  IRS_INCOME_TAX = 'IRS_INCOME_TAX',
  IRS_CUSTOMS = 'IRS_CUSTOMS',
  IRTS = 'IRTS',
  IRAS = 'IRAS',
  IRPS = 'IRPS',
  IAAS = 'IAAS',
  IIS = 'IIS',
  ICAS = 'ICAS',
  IDES = 'IDES',
  STATE_PCS = 'STATE_PCS',
  STATE_POLICE = 'STATE_POLICE',
  STATE_FOREST = 'STATE_FOREST',
}

/**
 * CA/CS/CMA professional levels
 */
export enum ProfessionalLevel {
  FOUNDATION = 'FOUNDATION',
  INTERMEDIATE = 'INTERMEDIATE',
  FINAL = 'FINAL',
  ARTICLESHIP = 'ARTICLESHIP',
  QUALIFIED = 'QUALIFIED',
}

/**
 * Regional tiers in India
 */
export enum RegionalTier {
  TIER_1_METRO = 'TIER_1_METRO',       // Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad
  TIER_2_CITY = 'TIER_2_CITY',         // Pune, Ahmedabad, Jaipur, Lucknow, Kochi, etc.
  TIER_3_TOWN = 'TIER_3_TOWN',         // Smaller district towns
  RURAL = 'RURAL',                     // Villages and rural areas
}

/**
 * Economic strata in India
 */
export enum EconomicStratum {
  BPL = 'BPL',                         // Below Poverty Line (< 2.5L annual)
  LOW_INCOME = 'LOW_INCOME',           // 2.5L - 5L
  LOWER_MIDDLE = 'LOWER_MIDDLE',       // 5L - 10L
  MIDDLE_CLASS = 'MIDDLE_CLASS',       // 10L - 25L
  UPPER_MIDDLE = 'UPPER_MIDDLE',       // 25L - 50L
  AFFLUENT = 'AFFLUENT',               // 50L - 1Cr
  WEALTHY = 'WEALTHY',                 // > 1Cr
}

/**
 * Family business involvement levels
 */
export enum FamilyBusinessInvolvement {
  NO_BUSINESS = 'NO_BUSINESS',
  PARENTS_EMPLOYEE = 'PARENTS_EMPLOYEE',
  SMALL_BUSINESS = 'SMALL_BUSINESS',   // Local shop, service
  MEDIUM_BUSINESS = 'MEDIUM_BUSINESS', // Regional presence
  LARGE_BUSINESS = 'LARGE_BUSINESS',   // National presence
  FAMILY_EMPIRE = 'FAMILY_EMPIRE',     // Large diversified business
}

/**
 * Family pressure sources
 */
export enum FamilyPressureSource {
  PARENT_EXPECTATION = 'PARENT_EXPECTATION',
  EXTENDED_FAMILY_OPINION = 'EXTENDED_FAMILY_OPINION',
  COMMUNITY_PRESSURE = 'COMMUNITY_PRESSURE',
  FINANCIAL_DEPENDENCY = 'FINANCIAL_DEPENDENCY',
  SIBLING_COMPARISON = 'SIBLING_COMPARISON',
  CULTURAL_OBLIGATION = 'CULTURAL_OBLIGATION',
  MARRIAGE_PRESSURE = 'MARRIAGE_PRESSURE',
  RELIGIOUS_OBLIGATION = 'RELIGIOUS_OBLIGATION',
}

/**
 * India-specific career motivations
 */
export enum IndiaCareerMotivation {
  STABILITY_SEEKING = 'STABILITY_SEEKING',
  PRESTIGE_SEEKING = 'PRESTIGE_SEEKING',
  FAMILY_RESPONSIBILITY = 'FAMILY_RESPONSIBILITY',
  SOCIAL_MOBILITY = 'SOCIAL_MOBILITY',
  PUBLIC_SERVICE = 'PUBLIC_SERVICE',
  WEALTH_CREATION = 'WEALTH_CREATION',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  FAMILY_LEGACY = 'FAMILY_LEGACY',
  GEOGRAPHICAL_MOBILITY = 'GEOGRAPHICAL_MOBILITY',
  STUDY_ABROAD = 'STUDY_ABROAD',
  GIVE_BACK_SOCIETY = 'GIVE_BACK_SOCIETY',
  PROVE_ABILITY = 'PROVE_ABILITY',
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Student profile for India analysis
 */
export interface IndiaStudentProfile {
  id: string;
  
  // Demographics
  currentLocation: RegionalTier;
  homeState: string;
  motherTongue: string;
  languagesKnown: string[];
  
  // Family background
  familyIncome: EconomicStratum;
  familyBusinessInvolvement: FamilyBusinessInvolvement;
  parentOccupations: {
    father?: string;
    mother?: string;
  };
  familyDependents: number; // People financially dependent on student/family
  
  // Education
  currentEducationLevel: 'SCHOOL_10' | 'SCHOOL_12' | 'UNDERGRAD' | 'POSTGRAD' | 'WORKING';
  board: 'CBSE' | 'ICSE' | 'STATE' | 'IB' | 'OTHER';
  academicPerformance: {
    class10Percentage: number;
    class12Percentage?: number;
    undergraduateCGPA?: number;
  };
  
  // Exam history
  examAttempts: ExamAttempt[];
  
  // Constraints
  canRelocate: boolean;
  relocationConstraints: string[];
  financialConstraints: {
    maxEducationBudget: number;
    canTakeEducationLoan: boolean;
    loanTolerance: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  // Family context
  familyExpectations: string[];
  familyPressureSources: FamilyPressureSource[];
  pressureIntensity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

/**
 * Exam attempt record
 */
export interface ExamAttempt {
  examType: IndiaExamType;
  year: number;
  rank?: number;
  percentile?: number;
  score?: number;
  qualified: boolean;
  wasDropYear: boolean;
  coachingAttended: boolean;
  coachingType?: 'LOCAL' | 'DISTANCE' | 'KOTA' | 'HYDERABAD' | 'DELHI' | 'NONE';
}

/**
 * Family business context
 */
export interface FamilyBusinessContext {
  businessType: string;
  businessSize: FamilyBusinessInvolvement;
  annualRevenue?: number;
  employeeCount?: number;
  locations: string[];
  successionPlan?: 'DEFINED' | 'UNDEFINED' | 'NO_SUCCESSION';
  studentRoleIfJoining: 'OWNER' | 'MANAGER' | 'EMPLOYEE' | 'UNDECIDED';
  parentsExpectStudentToJoin: boolean;
  pressureLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  studentInterestInJoining: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
  modernizationPotential: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'NA';
  growthProspects: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Complete input for India intelligence analysis
 */
export interface IndiaIntelligenceInput {
  profile: IndiaStudentProfile;
  familyBusiness?: FamilyBusinessContext;
  statedPreferences: {
    preferredCareers: string[];
    rejectedCareers: string[];
    preferredLocations: string[];
    willingToTakeGapYear: boolean;
    willingToStudyAbroad: boolean;
    willingToJoinFamilyBusiness: boolean;
    preferredMotivations: IndiaCareerMotivation[];
  };
  selfAssessment: {
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    preferredWorkEnvironment: 'GOVERNMENT' | 'CORPORATE' | 'STARTUP' | 'OWN_BUSINESS' | 'RESEARCH' | 'FLEXIBLE';
    importanceOfPrestige: 1 | 2 | 3 | 4 | 5;
    importanceOfStability: 1 | 2 | 3 | 4 | 5;
    importanceOfIncome: 1 | 2 | 3 | 4 | 5;
    importanceOfLocation: 1 | 2 | 3 | 4 | 5;
  };
  timestamp: number;
}

// =============================================================================
// JEE ENGINE TYPES
// =============================================================================

/**
 * JEE pathway options
 */
export interface JEEPathway {
  route: 'JEE_ADVANCED' | 'JEE_MAIN_ONLY' | 'STATE_CET' | 'PRIVATE_ENTRANCE';
  rank?: number;
  percentile?: number;
  dropYearsTaken: number;
  attemptsRemaining: number;
}

/**
 * Engineering branch options
 */
export enum EngineeringBranch {
  CSE = 'CSE',
  IT = 'IT',
  ECE = 'ECE',
  EEE = 'EEE',
  MECHANICAL = 'MECHANICAL',
  CIVIL = 'CIVIL',
  CHEMICAL = 'CHEMICAL',
  AEROSPACE = 'AEROSPACE',
  BIOTECH = 'BIOTECH',
  METALLURGY = 'METALLURGY',
  MINING = 'MINING',
  PRODUCTION = 'PRODUCTION',
  TEXTILE = 'TEXTILE',
}

/**
 * College placement tier
 */
export enum PlacementTier {
  TIER_1 = 'TIER_1',     // 20+ LPA average
  TIER_2 = 'TIER_2',     // 10-20 LPA average
  TIER_3 = 'TIER_3',     // 5-10 LPA average
  TIER_4 = 'TIER_4',     // < 5 LPA average
  UNKNOWN = 'UNKNOWN',
}

/**
 * JEE outcome model
 */
export interface JEEOutcome {
  collegeTier: EngineeringCollegeTier;
  collegeName?: string;
  branch: EngineeringBranch;
  location: string;
  fees: {
    perYear: number;
    total4Years: number;
    hostelAdditional: number;
  };
  placement: {
    tier: PlacementTier;
    averagePackage: number;
    medianPackage: number;
    topRecruiters: string[];
    placementPercentage: number;
  };
  ranking: {
    nirfRank?: number;
    perceivedTier: EngineeringCollegeTier;
  };
  opportunities: {
    higherEducationAbroad: 'HIGH' | 'MODERATE' | 'LOW';
    coreJobs: 'HIGH' | 'MODERATE' | 'LOW';
    itJobs: 'HIGH' | 'MODERATE' | 'LOW';
    psuJobs: 'HIGH' | 'MODERATE' | 'LOW';
    mbaTopCollege: 'HIGH' | 'MODERATE' | 'LOW';
    startups: 'HIGH' | 'MODERATE' | 'LOW';
  };
}

/**
 * JEE analysis result
 */
export interface JEEAnalysis {
  currentStatus: {
    jeeMainRank?: number;
    jeeAdvancedRank?: number;
    eligibleColleges: JEEOutcome[];
  };
  options: {
    acceptCurrent: JEEOutcome[];
    dropYear: JEEPathwayAnalysis;
    stateCET: JEEOutcome[];
    privateColleges: JEEOutcome[];
  };
  tradeoffs: {
    tierVsBranch: TierVsBranchTradeoff;
    collegeVsLocation: CollegeVsLocationTradeoff;
    feesVsPlacement: FeesVsPlacementTradeoff;
  };
  recommendations: {
    optimalChoice?: JEEOutcome;
    rationale: string[];
    warnings: string[];
  };
}

/**
 * Drop year analysis
 */
export interface JEEPathwayAnalysis {
  recommended: boolean;
  confidence: number;
  expectedImprovement: {
    rankImprovement: number;
    tierUpgradeProbability: number;
  };
  risks: {
    noImprovementProbability: number;
    mentalHealthRisk: 'LOW' | 'MODERATE' | 'HIGH';
    opportunityCost: number; // Years lost
  };
  requirements: {
    coachingRecommended: boolean;
    coachingLocation?: 'KOTA' | 'HYDERABAD' | 'DELHI' | 'LOCAL';
    estimatedCost: number;
    dedicationRequired: 'EXTREME' | 'HIGH' | 'MODERATE';
  };
}

/**
 * Tier vs Branch tradeoff
 */
export interface TierVsBranchTradeoff {
  higherTierLowerBranch?: {
    option: JEEOutcome;
    pros: string[];
    cons: string[];
    bestFor: string[];
  };
  lowerTierHigherBranch?: {
    option: JEEOutcome;
    pros: string[];
    cons: string[];
    bestFor: string[];
  };
  recommendation: 'TIER' | 'BRANCH' | 'CONTEXT_DEPENDENT';
  rationale: string;
}

/**
 * College vs Location tradeoff
 */
export interface CollegeVsLocationTradeoff {
  betterCollegeFar?: {
    option: JEEOutcome;
    relocation: boolean;
    pros: string[];
    cons: string[];
  };
  worseCollegeNear?: {
    option: JEEOutcome;
    pros: string[];
    cons: string[];
  };
  recommendation: 'RELOCATE' | 'STAY' | 'CONTEXT_DEPENDENT';
}

/**
 * Fees vs Placement tradeoff
 */
export interface FeesVsPlacementTradeoff {
  expensiveGoodPlacements?: {
    option: JEEOutcome;
    roi: number;
    loanRequired: boolean;
  };
  affordableAveragePlacements?: {
    option: JEEOutcome;
    roi: number;
  };
  recommendation: 'EXPENSIVE' | 'AFFORDABLE' | 'CONTEXT_DEPENDENT';
}

// =============================================================================
// NEET ENGINE TYPES
// =============================================================================

/**
 * NEET analysis result
 */
export interface NEETAnalysis {
  currentStatus: {
    neetRank?: number;
    neetScore?: number;
    percentile?: number;
    eligibleSeats: MedicalSeat[];
  };
  pathwayOptions: {
    governmentMBBS: MedicalSeat[];
    privateMBBSIndia: MedicalSeat[];
    mbbsAbroad: AbroadMedicalOption[];
    alternativeMedical: AlternativeMedicalPath[];
  };
  longTermOutlook: {
    specializationPathways: SpecializationPath[];
    practiceOptions: PracticeOption[];
    employmentOptions: MedicalEmployment[];
  };
  financialAnalysis: MedicalFinancialAnalysis;
  recommendations: NEETRecommendation;
}

/**
 * Medical seat allocation
 */
export interface MedicalSeat {
  type: MedicalEducationPath;
  collegeName: string;
  location: string;
  fees: {
    totalTuition: number;
    perYear: number;
    additionalCosts: number;
  };
  cutOffRank: number;
  quota: 'ALL_INDIA' | 'STATE' | 'MANAGEMENT' | 'NRI';
  seatAvailability: 'CONFIRMED' | 'LIKELY' | 'POSSIBLE' | 'UNLIKELY';
  bond: {
    required: boolean;
    years: number;
    penalty: number;
  };
}

/**
 * Abroad medical education
 */
export interface AbroadMedicalOption {
  country: string;
  popularDestinations: string[];
  fees: {
    tuition: number;
    living: number;
    total: number;
  };
  duration: number;
  recognition: {
    mciRecognized: boolean;
    screeningTestRequired: boolean;
    practiceInIndia: 'DIRECT' | 'AFTER_FMGE' | 'RESTRICTED';
  };
  pros: string[];
  cons: string[];
  suitableFor: string[];
}

/**
 * Alternative medical paths
 */
export interface AlternativeMedicalPath {
  path: 'BDS' | 'BAMS' | 'BHMS' | 'BUMS' | 'BVSC' | 'NURSING' | 'ALLIED_HEALTH';
  duration: number;
  fees: number;
  careerProspects: {
    governmentJobs: 'HIGH' | 'MODERATE' | 'LOW';
    privatePractice: 'HIGH' | 'MODERATE' | 'LOW';
    abroadOpportunities: 'HIGH' | 'MODERATE' | 'LOW';
    incomePotential: 'HIGH' | 'MODERATE' | 'LOW';
  };
  comparisonWithMBBS: string;
}

/**
 * Medical specialization pathways
 */
export interface SpecializationPath {
  field: string;
  superSpecialization: string[];
  duration: number; // Including PG
  entranceRequired: 'NEET_PG' | 'INI_CET' | 'FOREIGN' | 'NONE';
  competitionLevel: 'EXTREME' | 'HIGH' | 'MODERATE';
  incomePotential: number;
}

/**
 * Practice ownership options
 */
export interface PracticeOption {
  type: 'OWN_CLINIC' | 'MULTI_SPECIALTY' | 'HOSPITAL_EMPLOYMENT' | 'GOVERNMENT_HOSPITAL' | 'TEACHING' | 'RESEARCH';
  initialInvestment: number;
  timeline: string;
  incomeTrajectory: 'STEADY' | 'GROWING' | 'EXPONENTIAL';
  lifestyle: 'DEMANDING' | 'BALANCED' | 'RELAXED';
  requirements: string[];
}

/**
 * Medical employment options
 */
export interface MedicalEmployment {
  employer: string;
  role: string;
  startingSalary: number;
  growthTrajectory: string;
  workLifeBalance: 'DEMANDING' | 'MODERATE' | 'BALANCED' | 'VARIES';
}

/**
 * Medical education financial analysis
 */
export interface MedicalFinancialAnalysis {
  totalInvestment: number;
  roiTimeline: number; // Years to break even
  loanRequired: boolean;
  recommendedLoanAmount?: number;
  expectedStartingIncome: number;
  incomeAt10Years: number;
  comparisonWithEngineering: string;
}

/**
 * NEET recommendations
 */
export interface NEETRecommendation {
  primaryPath: 'GOVT_MBBS' | 'PRIVATE_MBBS' | 'MBBS_ABROAD' | 'ALTERNATIVE' | 'DROP_YEAR';
  secondaryPath?: string;
  rationale: string[];
  warnings: string[];
  timeline: string;
}

// =============================================================================
// UPSC ENGINE TYPES
// =============================================================================

/**
 * UPSC analysis result
 */
export interface UPSCAnalysis {
  eligibility: {
    ageEligible: boolean;
    attemptsRemaining: number;
    yearsLeft: number;
    categoryBenefits: boolean;
  };
  currentReadiness: {
    preliminaryScore: number;
    mainsScore: number;
    interviewScore: number;
    overallReadiness: 'NOT_READY' | 'EARLY' | 'READY' | 'STRONG';
  };
  attemptStrategy: AttemptStrategy;
  servicePreferences: ServicePreference[];
  backupPlans: UPSCBackupPlan[];
  riskAssessment: UPSCRiskAssessment;
  recommendations: UPSCRecommendation;
}

/**
 * UPSC attempt strategy
 */
export interface AttemptStrategy {
  recommendedAttempts: number;
  preparationTimeline: number; // Months
  coachingRecommendation: {
    required: boolean;
    type?: 'DELHI' | 'HYDERABAD' | 'ONLINE' | 'SELF';
    duration: number;
    cost: number;
  };
  attemptSchedule: {
    firstAttempt: number; // Year
    gapBetweenAttempts: number; // Months
    finalAttemptBy: number; // Year
  };
  dropYearRecommended: boolean;
}

/**
 * Service preference ranking
 */
export interface ServicePreference {
  service: CivilServiceType;
  rank: number;
  probabilityAtCurrentReadiness: number;
  workProfile: string;
  posting: {
    initial: 'RURAL' | 'URBAN' | 'MIXED';
    later: 'RURAL' | 'URBAN' | 'MIXED';
  };
  lifestyle: {
    power: 'HIGH' | 'MODERATE' | 'LOW';
    prestige: 'HIGH' | 'MODERATE' | 'LOW';
    workLifeBalance: 'DEMANDING' | 'MODERATE' | 'BALANCED';
    transfers: 'FREQUENT' | 'MODERATE' | 'STABLE';
  };
  income: {
    starting: number;
    atRetirement: number;
    perksValue: number;
  };
  bestFor: string[];
}

/**
 * UPSC backup plans
 */
export interface UPSCBackupPlan {
  option: 'STATE_PSC' | 'BANK_PO' | 'SSC' | 'RAILWAYS' | 'CORPORATE' | 'OTHER_EXAM' | 'START_CAREER';
  similarityToUPSC: 'HIGH' | 'MODERATE' | 'LOW';
  preparationOverlap: number; // Percentage
  fallbackTrigger: string;
  transitionEffort: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT';
  careerOutcome: string;
}

/**
 * UPSC risk assessment
 */
export interface UPSCRiskAssessment {
  selectionProbability: number;
  timeInvestment: number; // Years
  opportunityCost: {
    income: number;
    careerProgress: string;
    ageImpact: string;
  };
  failureScenarios: {
    noSelection: string;
    partialSuccess: string; // State service, lower rank
    healthImpact: string;
  };
  mitigationStrategies: string[];
}

/**
 * UPSC recommendations
 */
export interface UPSCRecommendation {
  shouldAttempt: boolean;
  commitmentRequired: 'FULL_TIME' | 'PART_TIME_WITH_BACKUP' | 'NOT_RECOMMENDED';
  optimalStrategy: string;
  timeline: string;
  warnings: string[];
}

// =============================================================================
// CA ENGINE TYPES
// =============================================================================

/**
 * CA/CS/CMA analysis
 */
export interface CAAnalysis {
  pathway: CAPathway;
  currentProgress: {
    level: ProfessionalLevel;
    attemptsAtCurrentLevel: number;
    clearRate: number;
  };
  articleship: ArticleshipAnalysis;
  careerOptions: CACareerOption[];
  timelineToQualification: number; // Months
  financialAnalysis: CAFinancialAnalysis;
  recommendations: CARecommendation;
}

/**
 * CA pathway structure
 */
export interface CAPathway {
  course: 'CA' | 'CS' | 'CMA';
  stages: {
    foundation: {
      required: boolean;
      cleared: boolean;
      attempts: number;
    };
    intermediate: {
      cleared: boolean;
      attempts: number;
      groupsCleared: number;
    };
    final: {
      cleared: boolean;
      attempts: number;
      groupsCleared: number;
    };
    articleship: {
      completed: boolean;
      monthsCompleted: number;
      monthsRequired: number;
    };
  };
  expectedQualification: number; // Year
}

/**
 * Articleship analysis
 */
export interface ArticleshipAnalysis {
  type: 'BIG_4' | 'MID_TIER' | 'SMALL_FIRM' | 'INDUSTRY' | 'NOT_STARTED';
  firmName?: string;
  exposure: {
    audit: 'HIGH' | 'MODERATE' | 'LOW';
    taxation: 'HIGH' | 'MODERATE' | 'LOW';
    consulting: 'HIGH' | 'MODERATE' | 'LOW';
  };
  workLoad: 'EXTREME' | 'HIGH' | 'MODERATE';
  learningQuality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  networkingValue: 'HIGH' | 'MODERATE' | 'LOW';
  stipend: number;
}

/**
 * CA career options
 */
export interface CACareerOption {
  path: 'PRACTICE' | 'BIG_4' | 'CORPORATE_MNC' | 'CORPORATE_INDIAN' | 'STARTUP' | 'CONSULTING' | 'TEACHING';
  entrySalary: number;
    growthTrajectory: 'EXPONENTIAL' | 'STEEP' | 'MODERATE' | 'STEADY';
  workLifeBalance: 'DEMANDING' | 'MODERATE' | 'BALANCED';
  longTermIncome: number;
  suitableFor: string[];
}

/**
 * CA financial analysis
 */
export interface CAFinancialAnalysis {
  totalCourseCost: number;
  articleshipEarnings: number;
  netCost: number;
  roi: number;
  breakEvenAge: number;
  comparisonWithMBA: string;
}

/**
 * CA recommendations
 */
export interface CARecommendation {
  shouldContinue: boolean;
  alternativeIfStruggling: string;
  optimalCareerPath: string;
  timelineToCompletion: string;
  strategyForSuccess: string[];
}

// =============================================================================
// FAMILY BUSINESS ENGINE TYPES
// =============================================================================

/**
 * Family business analysis
 */
export interface FamilyBusinessAnalysis {
  businessProfile: {
    industry: string;
    size: FamilyBusinessInvolvement;
    growthStage: 'STARTUP' | 'GROWTH' | 'MATURE' | 'DECLINE';
    modernizationNeed: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'NA';
  };
  succession: SuccessionAnalysis;
  integrationOptions: FamilyBusinessIntegration[];
  independentPath: IndependentPathAnalysis;
  pressureAssessment: FamilyPressureAssessment;
  recommendations: FamilyBusinessRecommendation;
}

/**
 * Succession analysis
 */
export interface SuccessionAnalysis {
  defined: boolean;
  studentPosition: 'SOLE_HEIR' | 'CO_HEIR' | 'EMPLOYEE' | 'UNDEFINED';
  timelineToLeadership: number; // Years
  preparationRequired: string[];
  challenges: string[];
  opportunities: string[];
}

/**
 * Family business integration options
 */
export interface FamilyBusinessIntegration {
  model: 'FULL_TIME' | 'PART_TIME' | 'HYBRID' | 'LATER';
  timeline: string;
  role: string;
  valueAdd: string;
  challenges: string[];
  benefits: string[];
}

/**
 * Independent path analysis
 */
export interface IndependentPathAnalysis {
  feasibility: 'HIGH' | 'MODERATE' | 'LOW';
  familySupport: 'FULL' | 'PARTIAL' | 'NONE';
  financialIndependence: 'ACHIEVED' | 'PARTIAL' | 'DEPENDENT';
  guiltFactor: 'HIGH' | 'MODERATE' | 'LOW';
  longTermRelationsImpact: string;
}

/**
 * Family pressure assessment
 */
export interface FamilyPressureAssessment {
  sources: FamilyPressureSource[];
  intensity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  manipulativeTactics: string[];
  culturalObligations: string[];
  resistanceStrategies: string[];
}

/**
 * Family business recommendations
 */
export interface FamilyBusinessRecommendation {
  optimalPath: 'JOIN_NOW' | 'JOIN_LATER' | 'HYBRID' | 'INDEPENDENT' | 'UNDECIDED';
  rationale: string[];
  negotiationPoints: string[];
  timeline: string;
  preparationActions: string[];
}

// =============================================================================
// REGIONAL CONSTRAINT ENGINE TYPES
// =============================================================================

/**
 * Regional constraint analysis
 */
export interface RegionalConstraintAnalysis {
  currentTier: RegionalTier;
  mobilityProfile: MobilityProfile;
  constraintFactors: ConstraintFactor[];
  opportunityLandscape: OpportunityLandscape;
  recommendations: RegionalRecommendation;
}

/**
 * Mobility profile
 */
export interface MobilityProfile {
  canRelocate: boolean;
  preferredLocations: string[];
  forbiddenLocations: string[];
  familyDistanceConstraint: number; // Max km from family
  languageConstraints: string[];
  culturalConstraints: string[];
  financialConstraints: {
    relocationCost: number;
    canAfford: boolean;
  };
}

/**
 * Constraint factors
 */
export interface ConstraintFactor {
  factor: 'FAMILY_DEPENDENCY' | 'LANGUAGE' | 'CULTURE' | 'FINANCE' | 'MARRIAGE' | 'HEALTH' | 'CAREGIVER';
  impact: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  mitigatable: boolean;
  mitigationOptions: string[];
}

/**
 * Opportunity landscape by region
 */
export interface OpportunityLandscape {
  tier1Opportunities: {
    accessible: boolean;
    types: string[];
    barriers: string[];
  };
  tier2Opportunities: {
    accessible: boolean;
    types: string[];
    benefits: string[];
  };
  homeRegionOpportunities: {
    types: string[];
    limitations: string[];
    growthPotential: 'HIGH' | 'MODERATE' | 'LOW';
  };
}

/**
 * Regional recommendations
 */
export interface RegionalRecommendation {
  optimalLocation: string;
  nearTermLocation: string;
  longTermLocation: string;
  mobilityStrategy: string;
  constraintWorkarounds: string[];
}

// =============================================================================
// ECONOMIC CONSTRAINT ENGINE TYPES
// =============================================================================

/**
 * Economic constraint analysis
 */
export interface EconomicConstraintAnalysis {
  stratum: EconomicStratum;
  affordability: AffordabilityProfile;
  constraints: EconomicConstraint[];
  opportunities: EconomicOpportunity[];
  timeline: EconomicTimeline;
  recommendations: EconomicRecommendation;
}

/**
 * Affordability profile
 */
export interface AffordabilityProfile {
  maxEducationBudget: number;
  affordableExamCoaching: string[];
  affordableColleges: string[];
  loanCapacity: number;
  loanWillingness: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  familyContribution: number;
  selfContributionRequired: boolean;
}

/**
 * Economic constraints
 */
export interface EconomicConstraint {
  type: 'UPFRONT_COST' | 'OPPORTUNITY_COST' | 'ONGOING_EXPENSE' | 'DEBT_AVERSION' | 'FAMILY_DEPENDENCY';
  severity: 'BLOCKING' | 'LIMITING' | 'MANAGEABLE';
  description: string;
  alternatives: string[];
}

/**
 * Economic opportunities
 */
export interface EconomicOpportunity {
  path: string;
  cost: number;
  roi: number;
  timeline: string;
  accessible: boolean;
  financialAid: string[];
}

/**
 * Economic timeline
 */
export interface EconomicTimeline {
  yearsToFinancialIndependence: number;
  yearsToFamilySupportCapability: number;
  criticalEarningPoints: {
    age: number;
    need: string;
    amount: number;
  }[];
}

/**
 * Economic recommendations
 */
export interface EconomicRecommendation {
  financiallyViablePaths: string[];
  scholarshipTargets: string[];
  loanStrategy: string;
  earningWhileLearning: string[];
  urgencyLevel: 'IMMEDIATE' | 'MODERATE' | 'FLEXIBLE';
}

// =============================================================================
// MOTIVATION MODEL TYPES
// =============================================================================

/**
 * India motivation analysis
 */
export interface IndiaMotivationAnalysis {
  detectedMotivations: DetectedMotivation[];
  primaryMotivation: IndiaCareerMotivation;
  secondaryMotivations: IndiaCareerMotivation[];
  conflicts: MotivationConflict[];
  alignmentWithPathways: MotivationAlignment[];
}

/**
 * Detected motivation
 */
export interface DetectedMotivation {
  motivation: IndiaCareerMotivation;
  confidence: number;
  evidence: string[];
  intensity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

/**
 * Motivation conflicts
 */
export interface MotivationConflict {
  motivation1: IndiaCareerMotivation;
  motivation2: IndiaCareerMotivation;
  conflictSeverity: 'MILD' | 'MODERATE' | 'SEVERE';
  resolution: string;
}

/**
 * Motivation alignment with pathways
 */
export interface MotivationAlignment {
  pathway: string;
  alignmentScore: number;
  satisfyingMotivations: IndiaCareerMotivation[];
  frustratingMotivations: IndiaCareerMotivation[];
}

// =============================================================================
// TRADEOFF ENGINE TYPES
// =============================================================================

/**
 * Dream vs Practical tradeoff analysis
 */
export interface TradeoffAnalysis {
  dreamOption: CareerOption;
  practicalOption: CareerOption;
  comparison: TradeoffComparison;
  decisionFramework: DecisionFramework;
  recommendation: TradeoffRecommendation;
}

/**
 * Career option for tradeoff
 */
export interface CareerOption {
  name: string;
  type: 'EXAM' | 'CAREER' | 'PATHWAY';
  successProbability: number;
  timeline: string;
  cost: number;
  opportunityCost: number;
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Tradeoff comparison
 */
export interface TradeoffComparison {
  dimensions: {
    name: string;
    dreamScore: number;
    practicalScore: number;
    importance: number;
  }[];
  financialComparison: {
    dreamInvestment: number;
    practicalInvestment: number;
    dreamReturn: number;
    practicalReturn: number;
  };
  regretAnalysis: {
    regretIfDreamFails: string;
    regretIfPracticalChosen: string;
  };
}

/**
 * Decision framework
 */
export interface DecisionFramework {
  questionsToAsk: string[];
  criteriaToEvaluate: string[];
  dealBreakers: string[];
  acceptableCompromises: string[];
}

/**
 * Tradeoff recommendation
 */
export interface TradeoffRecommendation {
  recommendedOption: 'DREAM' | 'PRACTICAL' | 'HYBRID';
  confidence: number;
  rationale: string[];
  conditions: string[];
  exitStrategy: string;
}

// =============================================================================
// EXPLANATION ENGINE TYPES
// =============================================================================

/**
 * India-specific explanation
 */
export interface IndiaExplanation {
  summary: string;
  contextParagraph: string;
  constraintImpact: string;
  familyContext: string;
  economicReality: string;
  regionalConsiderations: string;
  motivationAlignment: string;
  practicalAdvice: string;
}

// =============================================================================
// MAIN ANALYSIS OUTPUT
// =============================================================================

/**
 * Complete India intelligence analysis
 */
export interface IndiaIntelligenceAnalysis {
  id: string;
  timestamp: number;
  studentId: string;
  engineVersion: string;
  
  // Sub-engine results
  jee?: JEEAnalysis;
  neet?: NEETAnalysis;
  upsc?: UPSCAnalysis;
  ca?: CAAnalysis;
  familyBusiness?: FamilyBusinessAnalysis;
  regional: RegionalConstraintAnalysis;
  economic: EconomicConstraintAnalysis;
  
  // Cross-cutting analyses
  motivations: IndiaMotivationAnalysis;
  tradeoffs: TradeoffAnalysis[];
  
  // Explanations
  explanation: IndiaExplanation;
  
  // Integrated recommendations
  integratedRecommendations: IntegratedRecommendation[];
  
  // Reality check
  realityCheck: {
    dreamCareerFeasibility: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
    optimalPathGivenConstraints: string;
    unacceptableTradeoffs: string[];
    hiddenOpportunities: string[];
  };
}

/**
 * Integrated recommendation
 */
export interface IntegratedRecommendation {
  rank: number;
  path: string;
  category: 'OPTIMAL' | 'REALISTIC' | 'BACKUP' | 'AVOID';
  confidence: number;
  rationale: string[];
  constraintsConsidered: string[];
  timeline: string;
  nextSteps: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * India intelligence engine configuration
 */
export interface IndiaIntelligenceConfig {
  // JEE config
  jeeEnabled: boolean;
  jeeDropYearMaxAttempts: number;
  
  // NEET config
  neetEnabled: boolean;
  neetMaxAttempts: number;
  
  // UPSC config
  upscEnabled: boolean;
  upscMaxAttempts: number;
  upscAgeLimitGeneral: number;
  
  // CA config
  caEnabled: boolean;
  caMaxAttemptsPerLevel: number;
  
  // Family business config
  familyBusinessEnabled: boolean;
  
  // Constraint config
  strictRegionalConstraints: boolean;
  strictEconomicConstraints: boolean;
  
  // General
  considerFamilyPressure: boolean;
  considerSocialMobility: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_INDIA_INTELLIGENCE_CONFIG: IndiaIntelligenceConfig = {
  jeeEnabled: true,
  jeeDropYearMaxAttempts: 2,
  
  neetEnabled: true,
  neetMaxAttempts: 3,
  
  upscEnabled: true,
  upscMaxAttempts: 6,
  upscAgeLimitGeneral: 32,
  
  caEnabled: true,
  caMaxAttemptsPerLevel: 10,
  
  familyBusinessEnabled: true,
  
  strictRegionalConstraints: true,
  strictEconomicConstraints: true,
  
  considerFamilyPressure: true,
  considerSocialMobility: true,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get readable label for exam type
 */
export function getExamLabel(exam: IndiaExamType): string {
  const labels: Record<IndiaExamType, string> = {
    [IndiaExamType.JEE]: 'JEE',
    [IndiaExamType.NEET]: 'NEET',
    [IndiaExamType.UPSC]: 'UPSC',
    [IndiaExamType.STATE_PSC]: 'State PSC',
    [IndiaExamType.CA]: 'Chartered Accountancy',
    [IndiaExamType.CS]: 'Company Secretary',
    [IndiaExamType.CMA]: 'Cost & Management Accounting',
    [IndiaExamType.CLAT]: 'CLAT',
    [IndiaExamType.CAT]: 'CAT',
    [IndiaExamType.GATE]: 'GATE',
    [IndiaExamType.BANK_PO]: 'Bank PO',
    [IndiaExamType.SSC]: 'SSC',
    [IndiaExamType.RAILWAYS]: 'Railways',
    [IndiaExamType.DEFENSE]: 'Defense',
  };
  return labels[exam] || exam;
}

/**
 * Get readable label for regional tier
 */
export function getRegionalTierLabel(tier: RegionalTier): string {
  const labels: Record<RegionalTier, string> = {
    [RegionalTier.TIER_1_METRO]: 'Tier 1 Metro',
    [RegionalTier.TIER_2_CITY]: 'Tier 2 City',
    [RegionalTier.TIER_3_TOWN]: 'Tier 3 Town',
    [RegionalTier.RURAL]: 'Rural',
  };
  return labels[tier];
}

/**
 * Get readable label for economic stratum
 */
export function getEconomicStratumLabel(stratum: EconomicStratum): string {
  const labels: Record<EconomicStratum, string> = {
    [EconomicStratum.BPL]: 'Below Poverty Line',
    [EconomicStratum.LOW_INCOME]: 'Low Income',
    [EconomicStratum.LOWER_MIDDLE]: 'Lower Middle Class',
    [EconomicStratum.MIDDLE_CLASS]: 'Middle Class',
    [EconomicStratum.UPPER_MIDDLE]: 'Upper Middle Class',
    [EconomicStratum.AFFLUENT]: 'Affluent',
    [EconomicStratum.WEALTHY]: 'Wealthy',
  };
  return labels[stratum];
}

/**
 * Calculate age from birth year
 */
export function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

/**
 * Check if UPSC age eligible
 */
export function isUPSCAgeEligible(
  birthYear: number,
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' = 'GENERAL'
): { eligible: boolean; yearsLeft: number; maxAge: number } {
  const age = calculateAge(birthYear);
  const maxAges: Record<string, number> = {
    GENERAL: 32,
    OBC: 35,
    SC: 37,
    ST: 37,
    EWS: 32,
  };
  const maxAge = maxAges[category] || 32;
  return {
    eligible: age <= maxAge,
    yearsLeft: Math.max(0, maxAge - age),
    maxAge,
  };
}

/**
 * Calculate JEE college tier from rank
 */
export function calculateJEECollegeTier(
  rank: number,
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' = 'GENERAL'
): EngineeringCollegeTier {
  const rankMultipliers: Record<string, number> = {
    GENERAL: 1,
    OBC: 1.5,
    SC: 2.5,
    ST: 3,
    EWS: 1.2,
  };
  
  const adjustedRank = rank * (rankMultipliers[category] || 1);
  
  if (adjustedRank <= 5000) return EngineeringCollegeTier.OLD_IIT;
  if (adjustedRank <= 15000) return EngineeringCollegeTier.NEW_IIT;
  if (adjustedRank <= 25000) return EngineeringCollegeTier.TOP_NIT;
  if (adjustedRank <= 50000) return EngineeringCollegeTier.OTHER_NIT;
  if (adjustedRank <= 75000) return EngineeringCollegeTier.IIIT_HYDERABAD;
  if (adjustedRank <= 100000) return EngineeringCollegeTier.TOP_STATE_GOV;
  if (adjustedRank <= 200000) return EngineeringCollegeTier.OTHER_STATE_GOV;
  if (adjustedRank <= 500000) return EngineeringCollegeTier.PRIVATE_TIER1;
  return EngineeringCollegeTier.PRIVATE_TIER2;
}

/**
 * Calculate placement tier from package
 */
export function calculatePlacementTier(averagePackage: number): PlacementTier {
  if (averagePackage >= 2000000) return PlacementTier.TIER_1;
  if (averagePackage >= 1000000) return PlacementTier.TIER_2;
  if (averagePackage >= 500000) return PlacementTier.TIER_3;
  return PlacementTier.TIER_4;
}
