/**
 * Career Domain Model
 *
 * CareerOS - Career Intelligence System
 *
 * This is the foundational domain model for careers in CareerOS.
 * Designed to support 150+ careers with comprehensive profiling
 * across psychological, work style, reward, risk, and India-specific dimensions.
 *
 * Architecture Principles:
 *   - Strong typing throughout
 *   - Normalized scores (0.0 - 1.0) for all profile dimensions
 *   - Immutable domain objects
 *   - Comprehensive India-specific context
 *   - Extensible for future career intelligence layers
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Normalized score representing a dimension of a career.
 * Range: 0.0 (low/absent) to 1.0 (high/present)
 *
 * Used for:
 *   - Psychological profile dimensions
 *   - Work style preferences
 *   - Reward potential scores
 *   - Risk factor levels
 *   - Optionality measures
 */
export type CareerScore = number;

/**
 * Unique identifier for a career.
 * Format: slug-based, kebab-case
 * Example: "software-engineer", "data-scientist", "cardiologist"
 */
export type CareerId = string;

/**
 * URL-friendly identifier for a career.
 * Used in URLs, API endpoints, and references.
 */
export type CareerSlug = string;

/**
 * Salary in Indian Rupees (INR) per annum.
 * Stored as number for calculations, display formatted as "₹X LPA"
 */
export type SalaryINR = number;

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Career categories - broad domains of work.
 */
export enum CareerCategory {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  BUSINESS = 'business',
  ENGINEERING = 'engineering',
  SCIENCE = 'science',
  ARTS = 'arts',
  LAW = 'law',
  EDUCATION = 'education',
  GOVERNMENT = 'government',
  MEDIA = 'media',
  FINANCE = 'finance',
  CONSULTING = 'consulting',
  TRADES = 'trades',
  SOCIAL_SERVICE = 'social_service',
  SPORTS = 'sports',
}

/**
 * Minimum education level required for entry.
 */
export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  DIPLOMA = 'diploma',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  DOCTORATE = 'doctorate',
  PROFESSIONAL_DEGREE = 'professional_degree',
  NO_FORMAL_REQUIREMENT = 'no_formal_requirement',
}

/**
 * Degree types common in India.
 */
export enum DegreeType {
  // Technology
  BTECH = 'B.Tech',
  MTECH = 'M.Tech',
  BCA = 'BCA',
  MCA = 'MCA',

  // Science
  BSC = 'B.Sc',
  MSC = 'M.Sc',

  // Commerce/Business
  BCOM = 'B.Com',
  MCOM = 'M.Com',
  BBA = 'BBA',
  MBA = 'MBA',

  // Arts/Humanities
  BA = 'B.A',
  MA = 'M.A',

  // Professional
  MBBS = 'MBBS',
  MD = 'MD',
  MS_MEDICINE = 'MS (Medicine)',
  BDS = 'BDS',
  MDS = 'MDS',
  BAMS = 'BAMS',
  BHMS = 'BHMS',
  BPHARM = 'B.Pharm',
  MPHARM = 'M.Pharm',
  BPT = 'BPT',

  // Law
  LLB = 'LLB',
  LLM = 'LLM',

  // Education
  BED = 'B.Ed',
  MED = 'M.Ed',

  // Design
  BDES = 'B.Des',
  MDES = 'M.Des',

  // Architecture
  BARCH = 'B.Arch',
  MARCH = 'M.Arch',

  // General
  CA = 'CA',
  CS = 'CS',
  CWA = 'CWA',
  CFA = 'CFA',
}

/**
 * Certification types relevant to Indian careers.
 */
export enum CertificationType {
  // Technology
  AWS_CERTIFIED = 'AWS Certified',
  AZURE_CERTIFIED = 'Microsoft Azure Certified',
  GOOGLE_CLOUD_CERTIFIED = 'Google Cloud Certified',
  ORACLE_CERTIFIED = 'Oracle Certified',
  CISCO_CERTIFIED = 'Cisco Certified',
  SCRUM_MASTER = 'Certified Scrum Master',
  PMP = 'Project Management Professional',

  // Data
  DATA_SCIENCE_CERTIFICATION = 'Data Science Certification',
  MACHINE_LEARNING_CERTIFICATION = 'Machine Learning Certification',

  // Finance
  NCFM = 'NCFM',
  NISM = 'NISM',
  FRM = 'Financial Risk Manager',

  // Digital Marketing
  GOOGLE_ADS_CERTIFIED = 'Google Ads Certified',
  GOOGLE_ANALYTICS_CERTIFIED = 'Google Analytics Certified',
  META_BLUEPRINT = 'Meta Blueprint Certified',

  // Language
  IELTS = 'IELTS',
  TOEFL = 'TOEFL',
  GERMAN_CERTIFICATION = 'German Language Certification',
  FRENCH_CERTIFICATION = 'French Language Certification',

  // Creative
  ADOBE_CERTIFIED = 'Adobe Certified Professional',
  AUTODESK_CERTIFIED = 'Autodesk Certified',

  // General
  SIX_SIGMA = 'Six Sigma',
  LEAN_CERTIFICATION = 'Lean Certification',
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

/**
 * Psychological Profile
 *
 * Measures the degree to which a career requires or rewards
 * specific psychological traits.
 *
 * All scores 0.0 - 1.0:
 *   0.0 = Career does not require or reward this trait
 *   0.5 = Moderate relevance
 *   1.0 = Career heavily requires and rewards this trait
 */
export interface PsychologicalProfile {
  /** Analytical thinking: logical reasoning, problem decomposition, data analysis */
  analyticalThinking: CareerScore;

  /** Creativity: original thinking, innovation, artistic expression */
  creativity: CareerScore;

  /** Social orientation: interpersonal interaction, empathy, communication */
  socialOrientation: CareerScore;

  /** Leadership: influence, decision-making, team direction */
  leadership: CareerScore;

  /** Detail orientation: precision, thoroughness, error detection */
  detailOrientation: CareerScore;

  /** Curiosity: continuous learning, exploration, questioning */
  curiosity: CareerScore;

  /** Competitiveness: drive to outperform, achievement orientation */
  competitiveness: CareerScore;

  /** Risk tolerance: comfort with uncertainty, taking calculated risks */
  riskTolerance: CareerScore;
}

/**
 * Work Style Profile
 *
 * Describes the work environment and style of a career.
 *
 * Note: remoteWork + officeWork + fieldWork may sum to > 1.0
 * indicating hybrid possibilities.
 */
export interface WorkStyleProfile {
  /** Remote work possibility (0.0 = never, 1.0 = fully remote) */
  remoteWork: CareerScore;

  /** Office work requirement (0.0 = never, 1.0 = full-time office) */
  officeWork: CareerScore;

  /** Field work requirement (0.0 = never, 1.0 = primarily field) */
  fieldWork: CareerScore;

  /** Travel requirement (0.0 = no travel, 1.0 = extensive travel) */
  travelRequirement: CareerScore;

  /** Team orientation (0.0 = solo work, 1.0 = constant teamwork) */
  teamOrientation: CareerScore;

  /** Solo orientation (0.0 = no solo work, 1.0 = primarily solo) */
  soloOrientation: CareerScore;

  /** Structured environment (0.0 = chaotic, 1.0 = highly structured) */
  structuredEnvironment: CareerScore;

  /** Unstructured environment (0.0 = rigid, 1.0 = highly flexible) */
  unstructuredEnvironment: CareerScore;
}

/**
 * Reward Profile
 *
 * Potential rewards and satisfactions a career offers.
 *
 * Not all careers score high on all dimensions.
 * Tradeoffs are common (e.g., high income vs high freedom).
 */
export interface RewardProfile {
  /** Income potential: earning ceiling and growth trajectory */
  incomePotential: CareerScore;

  /** Status potential: social prestige and recognition */
  statusPotential: CareerScore;

  /** Impact potential: ability to make a difference, help others */
  impactPotential: CareerScore;

  /** Freedom potential: autonomy, flexibility, independence */
  freedomPotential: CareerScore;

  /** Stability potential: job security, predictable income */
  stabilityPotential: CareerScore;
}

/**
 * Risk Profile
 *
 * Potential downsides and challenges of a career.
 *
 * Higher scores indicate higher risk/negative factors.
 */
export interface RiskProfile {
  /** Burnout risk: stress, overwork, emotional exhaustion */
  burnoutRisk: CareerScore;

  /** Automation risk: likelihood of being replaced by AI/automation */
  automationRisk: CareerScore;

  /** Competition level: difficulty entering and advancing */
  competitionLevel: CareerScore;

  /** Income volatility: irregularity and unpredictability of earnings */
  incomeVolatility: CareerScore;
}

/**
 * Optionality Profile
 *
 * Measures career flexibility and future opportunities.
 *
 * Higher scores indicate more future options.
 */
export interface OptionalityProfile {
  /** Career flexibility: ease of switching to related careers */
  careerFlexibility: CareerScore;

  /** Transferable skills: how applicable skills are to other fields */
  transferableSkills: CareerScore;

  /** Entrepreneurship potential: ease of starting own business in this domain */
  entrepreneurshipPotential: CareerScore;
}

// ============================================================================
// EDUCATION TYPES
// ============================================================================

/**
 * Education requirements for a career.
 */
export interface EducationRequirements {
  /** Minimum education level required for entry */
  minimumLevel: EducationLevel;

  /** Typical degrees held by professionals in this career */
  typicalDegrees: DegreeType[];

  /** Certifications that enhance or are required for this career */
  certifications: CertificationType[];

  /** Additional education notes specific to India context */
  notes?: string;
}

// ============================================================================
// INDIA REALITY TYPES
// ============================================================================

/**
 * India Reality Profile
 *
 * India-specific factors that affect career accessibility and success.
 *
 * These factors are critical for accurate career guidance in India
 * but would not appear in generic Western career databases.
 */
export interface IndiaRealityProfile {
  /**
   * Coaching dependency: How critical is coaching for entry?
   * 0.0 = No coaching needed (e.g., B.Com)
   * 0.5 = Helpful but not essential
   * 1.0 = Almost impossible without coaching (e.g., IIT-JEE, NEET)
   */
  coachingDependency: CareerScore;

  /**
   * Urban advantage: How much does being in Tier-1 city help?
   * 0.0 = No advantage (works equally well in villages)
   * 0.5 = Moderate advantage
   * 1.0 = Essential (e.g., film industry, VC, consulting)
   */
  urbanAdvantage: CareerScore;

  /**
   * English dependency: How important is English proficiency?
   * 0.0 = Hindi/regional language sufficient
   * 0.5 = Basic English helpful
   * 1.0 = Fluent English essential (e.g., consulting, MNCs)
   */
  englishDependency: CareerScore;

  /**
   * Migration requirement: Must you move to succeed?
   * 0.0 = Can succeed anywhere in India
   * 0.5 = Better opportunities in specific cities
   * 1.0 = Must migrate to specific location (e.g., Mumbai for Bollywood)
   */
  migrationRequirement: CareerScore;

  /**
   * Reservation applicable: Does caste-based reservation apply?
   * Note: This is informational, not a recommendation factor
   */
  reservationApplicable: boolean;

  /**
   * Reservation quota availability: For which categories?
   * Only relevant if reservationApplicable is true
   */
  reservationCategories?: Array<'SC' | 'ST' | 'OBC' | 'EWS'>;
}

// ============================================================================
// CAREER EVOLUTION TYPES
// ============================================================================

/**
 * Career evolution pathways.
 *
 * Describes how this career connects to other careers.
 */
export interface CareerEvolution {
  /**
   * Careers adjacent to this one - easy lateral moves.
   * Stored as CareerSlugs for loose coupling.
   */
  adjacentCareers: CareerSlug[];

  /**
   * Future career paths - promotions or evolutions.
   * Ordered from early-career to senior possibilities.
   * Stored as CareerSlugs for loose coupling.
   */
  futureCareerPaths: CareerSlug[];

  /**
   * Years to first milestone: Time to achieve first significant progression.
   * E.g., "3-5 years to Senior Engineer"
   */
  yearsToFirstMilestone?: string;

  /**
   * Ceiling potential: How high can one go?
   * E.g., "CEO", "Partner", "Independent practice"
   */
  ceilingPotential?: string;
}

// ============================================================================
// SALARY TYPES
// ============================================================================

/**
 * Salary information for India.
 *
 * All values in INR per annum.
 * Ranges represent typical variation by company tier and location.
 */
export interface SalaryProfile {
  /** Entry-level salary (0-2 years experience) */
  entrySalaryIndia: {
    min: SalaryINR;
    max: SalaryINR;
    median: SalaryINR;
  };

  /** Mid-career salary (5-10 years experience) */
  midCareerSalaryIndia: {
    min: SalaryINR;
    max: SalaryINR;
    median: SalaryINR;
  };

  /** Senior-level salary (15+ years experience) */
  seniorSalaryIndia: {
    min: SalaryINR;
    max: SalaryINR;
    median: SalaryINR;
  };

  /**
   * Salary notes: context, variation factors, timing.
   * E.g., "Salaries 2x in product companies vs services"
   */
  notes?: string;
}

// ============================================================================
// MAIN CAREER INTERFACE
// ============================================================================

/**
 * Career
 *
 * The central domain entity for CareerOS.
 *
 * A Career represents a distinct professional path with:
 *   - Unique identity and categorization
 *   - Comprehensive psychological profiling
 *   - Work style characteristics
 *   - Reward and risk profiles
 *   - Optionality and flexibility measures
 *   - Education requirements
 *   - India-specific context
 *   - Career evolution pathways
 *   - Salary expectations
 *
 * Design Notes:
 *   - All profile scores are normalized (0.0 - 1.0)
 *   - No optional fields at the top level
 *   - All sub-interfaces are fully specified
 *   - References to other careers use slugs (not IDs) for loose coupling
 */
export interface Career {
  // -------------------------------------------------------------------------
  // Identity
  // -------------------------------------------------------------------------

  /** Unique identifier - slug format */
  id: CareerId;

  /** Human-readable name */
  name: string;

  /** URL-friendly identifier */
  slug: CareerSlug;

  /** Broad career category */
  category: CareerCategory;

  /** Detailed description of the career */
  description: string;

  /** Short tagline for display */
  tagline?: string;

  // -------------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------------

  /** Psychological traits required and rewarded */
  psychologicalProfile: PsychologicalProfile;

  /** Work environment and style characteristics */
  workStyle: WorkStyleProfile;

  /** Potential rewards and satisfactions */
  rewardProfile: RewardProfile;

  /** Risks and challenges */
  riskProfile: RiskProfile;

  /** Flexibility and future options */
  optionality: OptionalityProfile;

  // -------------------------------------------------------------------------
  // Requirements & Context
  // -------------------------------------------------------------------------

  /** Education and certification requirements */
  education: EducationRequirements;

  /** India-specific factors */
  indiaReality: IndiaRealityProfile;

  // -------------------------------------------------------------------------
  // Evolution & Connections
  // -------------------------------------------------------------------------

  /** Career pathways and adjacent options */
  evolution: CareerEvolution;

  // -------------------------------------------------------------------------
  // Compensation
  // -------------------------------------------------------------------------

  /** Salary information for India */
  salary: SalaryProfile;

  // -------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------

  /** When this career definition was created */
  createdAt: Date;

  /** When this career definition was last updated */
  updatedAt: Date;

  /** Version of the career schema used */
  schemaVersion: number;

  /** Source of this career data */
  dataSource?: string;

  /** Confidence in this career data (0.0 - 1.0) */
  dataConfidence?: CareerScore;
}

// ============================================================================
// CAREER COLLECTION TYPES
// ============================================================================

/**
 * Career collection - a set of careers.
 * Used for database operations, API responses, and bulk operations.
 */
export interface CareerCollection {
  /** Careers in the collection */
  careers: Career[];

  /** Total count (for pagination) */
  totalCount: number;

  /** Pagination cursor or offset */
  pagination?: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Career reference - lightweight reference to a career.
 * Used when full career data is not needed.
 */
export interface CareerReference {
  id: CareerId;
  name: string;
  slug: CareerSlug;
  category: CareerCategory;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

/**
 * Career filter criteria.
 */
export interface CareerFilter {
  /** Filter by category */
  categories?: CareerCategory[];

  /** Filter by minimum education level */
  minEducationLevel?: EducationLevel;

  /** Filter by remote work possibility */
  remoteWork?: boolean;

  /** Filter by salary range */
  salaryRange?: {
    min: SalaryINR;
    max: SalaryINR;
    level: 'entry' | 'mid' | 'senior';
  };

  /** Filter by psychological trait minimums */
  psychologicalTraits?: Partial<Record<keyof PsychologicalProfile, {
    min: CareerScore;
    max?: CareerScore;
  }>>;

  /** Filter by risk tolerance maximums */
  maxRiskScores?: Partial<Record<keyof RiskProfile, CareerScore>>;

  /** Filter by India reality factors */
  indiaReality?: Partial<{
    coachingDependency: { max: CareerScore };
    urbanAdvantage: { max: CareerScore };
    englishDependency: { max: CareerScore };
    migrationRequirement: { max: CareerScore };
  }>;
}

/**
 * Career sort options.
 */
export enum CareerSortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  INCOME_POTENTIAL = 'income_potential',
  STABILITY_POTENTIAL = 'stability_potential',
  FREEDOM_POTENTIAL = 'freedom_potential',
  IMPACT_POTENTIAL = 'impact_potential',
  AUTOMATION_RISK_ASC = 'automation_risk_asc',
  ENTRY_SALARY_DESC = 'entry_salary_desc',
  SENIOR_SALARY_DESC = 'senior_salary_desc',
}

/**
 * Career search query.
 */
export interface CareerSearchQuery {
  /** Text search query */
  query?: string;

  /** Filter criteria */
  filter?: CareerFilter;

  /** Sort order */
  sortBy?: CareerSortOption;

  /** Pagination */
  offset?: number;
  limit?: number;
}

// ============================================================================
// VALIDATION & TYPE GUARDS
// ============================================================================

/**
 * Validates that a score is within the valid range (0.0 - 1.0).
 */
export function isValidCareerScore(score: number): score is CareerScore {
  return typeof score === 'number' && score >= 0 && score <= 1;
}

/**
 * Validates a complete Career object.
 */
export function validateCareer(career: unknown): career is Career {
  if (!career || typeof career !== 'object') return false;

  const c = career as Partial<Career>;

  // Check required fields
  if (!c.id || !c.name || !c.slug || !c.description) return false;
  if (!c.category || !Object.values(CareerCategory).includes(c.category)) return false;

  // Check profiles exist
  if (!c.psychologicalProfile || !c.workStyle || !c.rewardProfile) return false;
  if (!c.riskProfile || !c.optionality) return false;

  // Check nested profiles
  if (!validatePsychologicalProfile(c.psychologicalProfile)) return false;
  if (!validateWorkStyleProfile(c.workStyle)) return false;
  if (!validateRewardProfile(c.rewardProfile)) return false;
  if (!validateRiskProfile(c.riskProfile)) return false;
  if (!validateOptionalityProfile(c.optionality)) return false;

  // Check requirements & context
  if (!c.education || !c.indiaReality) return false;
  if (!c.evolution || !c.salary) return false;

  return true;
}

function validatePsychologicalProfile(profile: PsychologicalProfile): boolean {
  const keys: (keyof PsychologicalProfile)[] = [
    'analyticalThinking', 'creativity', 'socialOrientation', 'leadership',
    'detailOrientation', 'curiosity', 'competitiveness', 'riskTolerance',
  ];
  return keys.every(key => isValidCareerScore(profile[key]));
}

function validateWorkStyleProfile(profile: WorkStyleProfile): boolean {
  const keys: (keyof WorkStyleProfile)[] = [
    'remoteWork', 'officeWork', 'fieldWork', 'travelRequirement',
    'teamOrientation', 'soloOrientation', 'structuredEnvironment', 'unstructuredEnvironment',
  ];
  return keys.every(key => isValidCareerScore(profile[key]));
}

function validateRewardProfile(profile: RewardProfile): boolean {
  const keys: (keyof RewardProfile)[] = [
    'incomePotential', 'statusPotential', 'impactPotential',
    'freedomPotential', 'stabilityPotential',
  ];
  return keys.every(key => isValidCareerScore(profile[key]));
}

function validateRiskProfile(profile: RiskProfile): boolean {
  const keys: (keyof RiskProfile)[] = [
    'burnoutRisk', 'automationRisk', 'competitionLevel', 'incomeVolatility',
  ];
  return keys.every(key => isValidCareerScore(profile[key]));
}

function validateOptionalityProfile(profile: OptionalityProfile): boolean {
  const keys: (keyof OptionalityProfile)[] = [
    'careerFlexibility', 'transferableSkills', 'entrepreneurshipPotential',
  ];
  return keys.every(key => isValidCareerScore(profile[key]));
}

// ============================================================================
// BUILDER PATTERN
// ============================================================================

/**
 * Career builder for creating Career objects.
 *
 * Usage:
 *   const career = new CareerBuilder('software-engineer', 'Software Engineer')
 *     .withDescription('Builds software applications...')
 *     .inCategory(CareerCategory.TECHNOLOGY)
 *     .withPsychologicalProfile({ analyticalThinking: 0.9, ... })
 *     .withWorkStyle({ remoteWork: 0.8, ... })
 *     ...
 *     .build();
 */
export class CareerBuilder {
  private career: Partial<Career> = {
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  constructor(id: CareerId, name: string) {
    this.career.id = id;
    this.career.name = name;
    this.career.slug = id;
  }

  withDescription(description: string, tagline?: string): this {
    this.career.description = description;
    if (tagline) this.career.tagline = tagline;
    return this;
  }

  inCategory(category: CareerCategory): this {
    this.career.category = category;
    return this;
  }

  withPsychologicalProfile(profile: PsychologicalProfile): this {
    this.career.psychologicalProfile = profile;
    return this;
  }

  withWorkStyle(workStyle: WorkStyleProfile): this {
    this.career.workStyle = workStyle;
    return this;
  }

  withRewardProfile(profile: RewardProfile): this {
    this.career.rewardProfile = profile;
    return this;
  }

  withRiskProfile(profile: RiskProfile): this {
    this.career.riskProfile = profile;
    return this;
  }

  withOptionality(optionality: OptionalityProfile): this {
    this.career.optionality = optionality;
    return this;
  }

  withEducation(education: EducationRequirements): this {
    this.career.education = education;
    return this;
  }

  withIndiaReality(reality: IndiaRealityProfile): this {
    this.career.indiaReality = reality;
    return this;
  }

  withEvolution(evolution: CareerEvolution): this {
    this.career.evolution = evolution;
    return this;
  }

  withSalary(salary: SalaryProfile): this {
    this.career.salary = salary;
    return this;
  }

  withDataSource(source: string, confidence?: CareerScore): this {
    this.career.dataSource = source;
    if (confidence !== undefined) this.career.dataConfidence = confidence;
    return this;
  }

  build(): Career {
    if (!validateCareer(this.career)) {
      throw new Error('Invalid Career: missing required fields or invalid scores');
    }
    return this.career as Career;
  }
}

// ============================================================================
// DEFAULT VALUES & HELPERS
// ============================================================================

/**
 * Creates a neutral psychological profile (all 0.5).
 * Useful as a starting point for career definition.
 */
export function createNeutralPsychologicalProfile(): PsychologicalProfile {
  return {
    analyticalThinking: 0.5,
    creativity: 0.5,
    socialOrientation: 0.5,
    leadership: 0.5,
    detailOrientation: 0.5,
    curiosity: 0.5,
    competitiveness: 0.5,
    riskTolerance: 0.5,
  };
}

/**
 * Creates a neutral work style profile.
 */
export function createNeutralWorkStyleProfile(): WorkStyleProfile {
  return {
    remoteWork: 0.5,
    officeWork: 0.5,
    fieldWork: 0.0,
    travelRequirement: 0.3,
    teamOrientation: 0.5,
    soloOrientation: 0.5,
    structuredEnvironment: 0.5,
    unstructuredEnvironment: 0.5,
  };
}

/**
 * Creates a neutral reward profile.
 */
export function createNeutralRewardProfile(): RewardProfile {
  return {
    incomePotential: 0.5,
    statusPotential: 0.5,
    impactPotential: 0.5,
    freedomPotential: 0.5,
    stabilityPotential: 0.5,
  };
}

/**
 * Creates a neutral risk profile.
 */
export function createNeutralRiskProfile(): RiskProfile {
  return {
    burnoutRisk: 0.5,
    automationRisk: 0.3,
    competitionLevel: 0.5,
    incomeVolatility: 0.4,
  };
}

/**
 * Creates a neutral optionality profile.
 */
export function createNeutralOptionalityProfile(): OptionalityProfile {
  return {
    careerFlexibility: 0.5,
    transferableSkills: 0.5,
    entrepreneurshipPotential: 0.5,
  };
}

/**
 * Formats salary for display in LPA (Lakhs Per Annum).
 */
export function formatSalaryINR(salary: SalaryINR): string {
  const lakhs = salary / 100000;
  return `₹${lakhs.toFixed(1)} LPA`;
}

/**
 * Converts salary range to display string.
 */
export function formatSalaryRange(
  min: SalaryINR,
  max: SalaryINR,
  median: SalaryINR
): string {
  return `${formatSalaryINR(min)} - ${formatSalaryINR(max)} (median: ${formatSalaryINR(median)})`;
}
