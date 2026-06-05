/**
 * CareerOS Career Ontology V2
 *
 * Definitive knowledge model for every career in CareerOS.
 * Comprehensive domain coverage for 1000+ careers.
 */

// ============================================================================
// CORE IDENTIFIER TYPES
// ============================================================================

/** Unique career identifier */
export type CareerId = string & { __brand: 'CareerId' };

/** URL-friendly career identifier */
export type CareerSlug = string & { __brand: 'CareerSlug' };

/** Career category classification */
export type CareerCategory =
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'engineering'
  | 'creative'
  | 'business'
  | 'legal'
  | 'science'
  | 'trades'
  | 'government'
  | 'nonprofit'
  | 'media'
  | 'agriculture'
  | 'hospitality'
  | 'manufacturing'
  | 'research'
  | 'sports'
  | 'military'
  | 'other';

// ============================================================================
// ENUM TYPES
// ============================================================================

/** Remote work capability level */
export type RemoteWorkLevel = 'none' | 'limited' | 'hybrid' | 'fully-remote' | 'remote-first';

/** Travel requirements for the role */
export type TravelRequirement = 'none' | 'occasional' | 'frequent' | 'extensive' | 'constant';

/** Team vs solo work orientation */
export type TeamOrientation = 'solo' | 'small-team' | 'medium-team' | 'large-team' | 'fluid';

/** Minimum education requirement */
export type EducationLevel =
  | 'none'
  | 'high-school'
  | 'diploma'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'doctorate'
  | 'professional-degree'
  | 'post-doctoral';

/** Examination requirements */
export type ExamType =
  | 'none'
  | 'entrance'
  | 'licensing'
  | 'certification'
  | 'competitive'
  | 'professional'
  | 'entrance+licensing';

/** Coaching dependency level (India-specific) */
export type CoachingLevel = 'none' | 'minimal' | 'moderate' | 'high' | 'essential';

/** English language dependency */
export type EnglishDependency = 'none' | 'minimal' | 'helpful' | 'important' | 'essential';

/** Urban location advantage */
export type UrbanAdvantage = 'none' | 'slight' | 'moderate' | 'significant' | 'essential';

/** Family acceptance level (India-specific) */
export type FamilyAcceptance = 'low' | 'moderate' | 'high' | 'very-high';

/** General risk level */
export type RiskLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'severe';

/** Future demand outlook */
export type DemandLevel = 'declining' | 'stable' | 'growing' | 'high-growth' | 'booming';

/** Industry growth trajectory */
export type GrowthLevel = 'declining' | 'stagnant' | 'slow' | 'moderate' | 'rapid';

/** Stress level classification */
export type StressLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

/** Work-life balance rating */
export type WorkLifeBalance = 'excellent' | 'good' | 'average' | 'poor' | 'very-poor';

// ============================================================================
// DOMAIN PROFILES
// ============================================================================

/**
 * Core identity information for a career
 */
export interface CareerIdentity {
  /** Unique identifier */
  id: CareerId;

  /** URL-friendly slug */
  slug: CareerSlug;

  /** Display name */
  name: string;

  /** Primary category */
  category: CareerCategory;

  /** Detailed description */
  description: string;

  /** Short tagline (50 chars max) */
  tagline?: string;

  /** Alternative names/aliases */
  aliases?: string[];

  /** Metadata */
  metadata?: {
    /** When this career entry was created */
    createdAt: number;

    /** Last update timestamp */
    updatedAt: number;

    /** Version of ontology schema */
    schemaVersion: string;

    /** Verification status */
    isVerified: boolean;

    /** Source of information */
    source?: string;
  };
}

/**
 * Psychological profile - cognitive and personality traits
 * All scores are 0.0 to 1.0 (normalized)
 */
export interface PsychologyProfile {
  /** Analytical and logical thinking capability */
  analyticalThinking: number;

  /** Creative and innovative thinking */
  creativity: number;

  /** Social interaction and interpersonal skills */
  socialOrientation: number;

  /** Leadership and management capability */
  leadership: number;

  /** Attention to detail and precision */
  detailOrientation: number;

  /** Curiosity and learning drive */
  curiosity: number;

  /** Competitive drive */
  competitiveness: number;

  /** Risk tolerance and comfort with uncertainty */
  riskTolerance: number;
}

/**
 * Work style preferences and environment
 */
export interface WorkStyleProfile {
  /** Remote work capability */
  remoteWork: RemoteWorkLevel;

  /** Traditional office work */
  officeWork: boolean;

  /** Field/outdoor work */
  fieldWork: boolean;

  /** Travel requirements */
  travelRequirement: TravelRequirement;

  /** Team collaboration orientation */
  teamOrientation: TeamOrientation;

  /** Independent/solo work capability */
  soloOrientation: boolean;

  /** Structured environment preference */
  structuredEnvironment: boolean;

  /** Unstructured/flexible environment */
  unstructuredEnvironment: boolean;
}

/**
 * Reward and compensation potential
 * All potentials are 0.0 to 1.0 (normalized)
 */
export interface RewardProfile {
  /** Income earning potential */
  incomePotential: number;

  /** Social status and prestige */
  statusPotential: number;

  /** Ability to make impact */
  impactPotential: number;

  /** Autonomy and freedom */
  freedomPotential: number;

  /** Job security and stability */
  stabilityPotential: number;
}

/**
 * Risk factors and challenges
 */
export interface RiskProfile {
  /** Burnout and mental health risk */
  burnoutRisk: RiskLevel;

  /** Automation and AI displacement risk */
  automationRisk: RiskLevel;

  /** Competition level for positions */
  competitionLevel: RiskLevel;

  /** Income volatility and unpredictability */
  incomeVolatility: RiskLevel;
}

/**
 * Future career flexibility and optionality
 */
export interface OptionalityProfile {
  /** Ease of transitioning to other careers */
  careerFlexibility: number;

  /** Number of transferable skills */
  transferableSkills: number;

  /** Entrepreneurship potential */
  entrepreneurshipPotential: number;
}

/**
 * Education and qualification requirements
 */
export interface EducationProfile {
  /** Minimum education level required */
  minimumEducation: EducationLevel;

  /** Typical degree paths */
  typicalDegrees: string[];

  /** Required certifications */
  certifications: string[];

  /** Optional but valuable certifications */
  optionalCertifications?: string[];

  /** Examination requirements */
  examRequirements: {
    type: ExamType;
    exams: string[];
    difficulty: RiskLevel;
    preparationMonths: number;
  };

  /** Years of study typically required */
  yearsOfStudy: number;

  /** Cost of education (INR) */
  educationCostRange: {
    min: number;
    max: number;
    typical: number;
  };
}

/**
 * India-specific contextual factors
 */
export interface IndiaRealityProfile {
  /** Dependency on coaching/tutoring */
  coachingDependency: CoachingLevel;

  /** English language requirement */
  englishDependency: EnglishDependency;

  /** Advantage of being in urban areas */
  urbanAdvantage: UrbanAdvantage;

  /** Need to migrate for opportunities */
  migrationRequirement: boolean;

  /** Sensitivity to reservation policies */
  reservationSensitivity: boolean;

  /** Traditional family acceptance level */
  familyAcceptance: FamilyAcceptance;

  /** Socio-economic barriers */
  socioEconomicBarriers: RiskLevel;

  /** Gender considerations */
  genderConsiderations?: {
    maleDominance: boolean;
    femaleRepresentation: number;
    genderBarriers: RiskLevel;
  };
}

/**
 * Future outlook and trends
 */
export interface FutureProfile {
  /** AI and automation disruption risk */
  aiDisruptionRisk: RiskLevel;

  /** Future demand outlook */
  futureDemand: DemandLevel;

  /** Global mobility and remote work potential */
  globalMobility: number;

  /** Industry growth trajectory */
  industryGrowth: GrowthLevel;

  /** Emerging opportunities */
  emergingOpportunities?: string[];

  /** Declining aspects */
  decliningAspects?: string[];
}

/**
 * Lifestyle and quality of life factors
 */
export interface LifestyleProfile {
  /** Work-life balance rating */
  workLifeBalance: WorkLifeBalance;

  /** Stress level */
  stressLevel: StressLevel;

  /** Schedule flexibility */
  scheduleFlexibility: number;

  /** Geographic freedom */
  geographicFreedom: number;
}

// ============================================================================
// COMPLETE CAREER TYPE
// ============================================================================

/**
 * Complete career definition with all domains
 */
export interface Career {
  identity: CareerIdentity;
  psychology: PsychologyProfile;
  workStyle: WorkStyleProfile;
  reward: RewardProfile;
  risk: RiskProfile;
  optionality: OptionalityProfile;
  education: EducationProfile;
  indiaReality: IndiaRealityProfile;
  future: FutureProfile;
  lifestyle: LifestyleProfile;
}

// ============================================================================
// OPTIONS & RESULT TYPES
// ============================================================================

/** Options for career creation */
export interface CareerCreationOptions {
  /** Auto-generate slug from name */
  autoSlug?: boolean;

  /** Schema version to use */
  schemaVersion?: string;

  /** Verification status */
  isVerified?: boolean;

  /** Source attribution */
  source?: string;
}

/** Validation result */
export interface CareerValidationResult {
  isValid: boolean;
  errors: CareerValidationError[];
  warnings: CareerValidationWarning[];
}

/** Validation error */
export interface CareerValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/** Validation warning */
export interface CareerValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/** Filter criteria for career search */
export interface CareerFilterCriteria {
  categories?: CareerCategory[];
  minIncomePotential?: number;
  maxRiskLevel?: RiskLevel;
  remoteWork?: RemoteWorkLevel[];
  educationLevel?: EducationLevel[];
  futureDemand?: DemandLevel[];
  workLifeBalance?: WorkLifeBalance[];
  coachingDependency?: CoachingLevel[];
  familyAcceptance?: FamilyAcceptance[];
}

/** Career comparison result */
export interface CareerComparisonResult {
  careers: Career[];
  differences: Map<string, { field: string; values: unknown[]; significance: 'high' | 'medium' | 'low' }>;
  similarities: string[];
  recommendation?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Current ontology schema version */
export const ONTOLOGY_SCHEMA_VERSION = '2.0.0';

/** Default values for profiles */
export const DEFAULT_PSYCHOLOGY_PROFILE: PsychologyProfile = {
  analyticalThinking: 0.5,
  creativity: 0.5,
  socialOrientation: 0.5,
  leadership: 0.5,
  detailOrientation: 0.5,
  curiosity: 0.5,
  competitiveness: 0.5,
  riskTolerance: 0.5,
};

export const DEFAULT_WORK_STYLE_PROFILE: WorkStyleProfile = {
  remoteWork: 'hybrid',
  officeWork: true,
  fieldWork: false,
  travelRequirement: 'occasional',
  teamOrientation: 'medium-team',
  soloOrientation: true,
  structuredEnvironment: true,
  unstructuredEnvironment: false,
};

export const DEFAULT_REWARD_PROFILE: RewardProfile = {
  incomePotential: 0.5,
  statusPotential: 0.5,
  impactPotential: 0.5,
  freedomPotential: 0.5,
  stabilityPotential: 0.5,
};

export const DEFAULT_RISK_PROFILE: RiskProfile = {
  burnoutRisk: 'moderate',
  automationRisk: 'moderate',
  competitionLevel: 'moderate',
  incomeVolatility: 'low',
};

export const DEFAULT_OPTIONALITY_PROFILE: OptionalityProfile = {
  careerFlexibility: 0.5,
  transferableSkills: 5,
  entrepreneurshipPotential: 0.5,
};

export const DEFAULT_EDUCATION_PROFILE: EducationProfile = {
  minimumEducation: 'bachelor',
  typicalDegrees: [],
  certifications: [],
  examRequirements: {
    type: 'none',
    exams: [],
    difficulty: 'low',
    preparationMonths: 0,
  },
  yearsOfStudy: 4,
  educationCostRange: {
    min: 0,
    max: 1000000,
    typical: 500000,
  },
};

export const DEFAULT_INDIA_REALITY_PROFILE: IndiaRealityProfile = {
  coachingDependency: 'moderate',
  englishDependency: 'helpful',
  urbanAdvantage: 'moderate',
  migrationRequirement: false,
  reservationSensitivity: false,
  familyAcceptance: 'high',
  socioEconomicBarriers: 'moderate',
};

export const DEFAULT_FUTURE_PROFILE: FutureProfile = {
  aiDisruptionRisk: 'moderate',
  futureDemand: 'stable',
  globalMobility: 0.5,
  industryGrowth: 'moderate',
};

export const DEFAULT_LIFESTYLE_PROFILE: LifestyleProfile = {
  workLifeBalance: 'average',
  stressLevel: 'moderate',
  scheduleFlexibility: 0.5,
  geographicFreedom: 0.5,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a career slug from a name
 */
export function createCareerSlug(name: string): CareerSlug {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  return slug as CareerSlug;
}

/**
 * Generate a unique career ID
 */
export function generateCareerId(): CareerId {
  return `career-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as CareerId;
}

/**
 * Validate a career object
 */
export function validateCareer(career: Partial<Career>): CareerValidationResult {
  const errors: CareerValidationError[] = [];
  const warnings: CareerValidationWarning[] = [];

  // Validate identity
  if (!career.identity?.id) {
    errors.push({ field: 'identity.id', message: 'Career ID is required' });
  }
  if (!career.identity?.name) {
    errors.push({ field: 'identity.name', message: 'Career name is required' });
  }
  if (!career.identity?.slug) {
    errors.push({ field: 'identity.slug', message: 'Career slug is required' });
  }
  if (!career.identity?.category) {
    errors.push({ field: 'identity.category', message: 'Career category is required' });
  }
  if (!career.identity?.description) {
    errors.push({ field: 'identity.description', message: 'Career description is required' });
  }

  // Validate psychology profile
  if (career.psychology) {
    const psychFields: (keyof PsychologyProfile)[] = [
      'analyticalThinking', 'creativity', 'socialOrientation', 'leadership',
      'detailOrientation', 'curiosity', 'competitiveness', 'riskTolerance',
    ];
    for (const field of psychFields) {
      const value = career.psychology[field];
      if (typeof value !== 'number' || value < 0 || value > 1) {
        errors.push({ field: `psychology.${field}`, message: `${field} must be between 0 and 1`, value });
      }
    }
  }

  // Validate reward profile
  if (career.reward) {
    const rewardFields: (keyof RewardProfile)[] = [
      'incomePotential', 'statusPotential', 'impactPotential',
      'freedomPotential', 'stabilityPotential',
    ];
    for (const field of rewardFields) {
      const value = career.reward[field];
      if (typeof value !== 'number' || value < 0 || value > 1) {
        errors.push({ field: `reward.${field}`, message: `${field} must be between 0 and 1`, value });
      }
    }
  }

  // Warnings for optional fields
  if (!career.identity?.tagline) {
    warnings.push({ field: 'identity.tagline', message: 'Tagline recommended for better UX' });
  }
  if (!career.identity?.aliases || career.identity.aliases.length === 0) {
    warnings.push({ field: 'identity.aliases', message: 'Aliases help with search and matching' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalize career data to ensure all fields have values
 */
export function normalizeCareerData(partial: Partial<Career>): Career {
  const now = Date.now();

  return {
    identity: {
      id: partial.identity?.id ?? generateCareerId(),
      slug: partial.identity?.slug ?? createCareerSlug(partial.identity?.name ?? 'unknown'),
      name: partial.identity?.name ?? 'Unknown Career',
      category: partial.identity?.category ?? 'other',
      description: partial.identity?.description ?? '',
      tagline: partial.identity?.tagline,
      aliases: partial.identity?.aliases ?? [],
      metadata: {
        createdAt: partial.identity?.metadata?.createdAt ?? now,
        updatedAt: now,
        schemaVersion: partial.identity?.metadata?.schemaVersion ?? ONTOLOGY_SCHEMA_VERSION,
        isVerified: partial.identity?.metadata?.isVerified ?? false,
        source: partial.identity?.metadata?.source,
      },
    },
    psychology: { ...DEFAULT_PSYCHOLOGY_PROFILE, ...partial.psychology },
    workStyle: { ...DEFAULT_WORK_STYLE_PROFILE, ...partial.workStyle },
    reward: { ...DEFAULT_REWARD_PROFILE, ...partial.reward },
    risk: { ...DEFAULT_RISK_PROFILE, ...partial.risk },
    optionality: { ...DEFAULT_OPTIONALITY_PROFILE, ...partial.optionality },
    education: { ...DEFAULT_EDUCATION_PROFILE, ...partial.education },
    indiaReality: { ...DEFAULT_INDIA_REALITY_PROFILE, ...partial.indiaReality },
    future: { ...DEFAULT_FUTURE_PROFILE, ...partial.future },
    lifestyle: { ...DEFAULT_LIFESTYLE_PROFILE, ...partial.lifestyle },
  };
}

/**
 * Create a complete career object
 */
export function createCareer(
  identity: Omit<CareerIdentity, 'id' | 'slug' | 'metadata'> & { id?: CareerId; slug?: CareerSlug },
  profiles: Partial<Omit<Career, 'identity'>>,
  options: CareerCreationOptions = {}
): Career {
  const now = Date.now();
  const id = identity.id ?? generateCareerId();
  const slug = identity.slug ?? (options.autoSlug !== false ? createCareerSlug(identity.name) : identity.name as CareerSlug);

  const fullIdentity: CareerIdentity = {
    ...identity,
    id,
    slug,
    metadata: {
      createdAt: now,
      updatedAt: now,
      schemaVersion: options.schemaVersion ?? ONTOLOGY_SCHEMA_VERSION,
      isVerified: options.isVerified ?? false,
      source: options.source,
    },
  };

  return normalizeCareerData({
    identity: fullIdentity,
    ...profiles,
  });
}

// ============================================================================
// CAREER ONTOLOGY V2 CLASS
// ============================================================================

/**
 * Career Ontology V2 - Main class for career management
 */
export class CareerOntologyV2 {
  private careers: Map<CareerId, Career> = new Map();
  private slugIndex: Map<CareerSlug, CareerId> = new Map();
  private categoryIndex: Map<CareerCategory, CareerId[]> = new Map();

  /**
   * Add a career to the ontology
   */
  addCareer(career: Career): CareerValidationResult {
    const validation = validateCareer(career);

    if (!validation.isValid) {
      return validation;
    }

    // Check for duplicate slug
    if (this.slugIndex.has(career.identity.slug) && this.slugIndex.get(career.identity.slug) !== career.identity.id) {
      return {
        isValid: false,
        errors: [{ field: 'identity.slug', message: `Slug '${career.identity.slug}' already exists`, value: career.identity.slug }],
        warnings: validation.warnings,
      };
    }

    this.careers.set(career.identity.id, career);
    this.slugIndex.set(career.identity.slug, career.identity.id);

    // Update category index
    const categoryCareers = this.categoryIndex.get(career.identity.category) ?? [];
    if (!categoryCareers.includes(career.identity.id)) {
      categoryCareers.push(career.identity.id);
      this.categoryIndex.set(career.identity.category, categoryCareers);
    }

    return validation;
  }

  /**
   * Get a career by ID
   */
  getCareer(id: CareerId): Career | undefined {
    return this.careers.get(id);
  }

  /**
   * Get a career by slug
   */
  getCareerBySlug(slug: CareerSlug): Career | undefined {
    const id = this.slugIndex.get(slug);
    return id ? this.careers.get(id) : undefined;
  }

  /**
   * Get all careers
   */
  getAllCareers(): Career[] {
    return Array.from(this.careers.values());
  }

  /**
   * Get careers by category
   */
  getCareersByCategory(category: CareerCategory): Career[] {
    const ids = this.categoryIndex.get(category) ?? [];
    return ids.map(id => this.careers.get(id)!).filter(Boolean);
  }

  /**
   * Get all categories
   */
  getCategories(): CareerCategory[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Filter careers by criteria
   */
  filterCareers(criteria: CareerFilterCriteria): Career[] {
    return this.getAllCareers().filter(career => {
      // Category filter
      if (criteria.categories && !criteria.categories.includes(career.identity.category)) {
        return false;
      }

      // Income potential filter
      if (criteria.minIncomePotential !== undefined && career.reward.incomePotential < criteria.minIncomePotential) {
        return false;
      }

      // Risk level filter
      if (criteria.maxRiskLevel !== undefined) {
        const riskOrder = ['minimal', 'low', 'moderate', 'high', 'severe'];
        if (riskOrder.indexOf(career.risk.automationRisk) > riskOrder.indexOf(criteria.maxRiskLevel)) {
          return false;
        }
      }

      // Remote work filter
      if (criteria.remoteWork && !criteria.remoteWork.includes(career.workStyle.remoteWork)) {
        return false;
      }

      // Education level filter
      if (criteria.educationLevel && !criteria.educationLevel.includes(career.education.minimumEducation)) {
        return false;
      }

      // Future demand filter
      if (criteria.futureDemand && !criteria.futureDemand.includes(career.future.futureDemand)) {
        return false;
      }

      // Work-life balance filter
      if (criteria.workLifeBalance && !criteria.workLifeBalance.includes(career.lifestyle.workLifeBalance)) {
        return false;
      }

      // Coaching dependency filter
      if (criteria.coachingDependency && !criteria.coachingDependency.includes(career.indiaReality.coachingDependency)) {
        return false;
      }

      // Family acceptance filter
      if (criteria.familyAcceptance && !criteria.familyAcceptance.includes(career.indiaReality.familyAcceptance)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Compare multiple careers
   */
  compareCareers(careerIds: CareerId[]): CareerComparisonResult {
    const careers = careerIds.map(id => this.careers.get(id)).filter(Boolean) as Career[];

    if (careers.length < 2) {
      return { careers, differences: new Map(), similarities: [] };
    }

    const differences = new Map<string, { field: string; values: unknown[]; significance: 'high' | 'medium' | 'low' }>();
    const similarities: string[] = [];

    // Compare psychology profiles
    const psychFields: (keyof PsychologyProfile)[] = [
      'analyticalThinking', 'creativity', 'socialOrientation', 'leadership',
      'detailOrientation', 'curiosity', 'competitiveness', 'riskTolerance',
    ];

    for (const field of psychFields) {
      const values = careers.map(c => c.psychology[field]);
      const variance = Math.max(...values) - Math.min(...values);

      if (variance < 0.1) {
        similarities.push(`Similar ${field}`);
      } else if (variance > 0.3) {
        differences.set(field, { field, values, significance: variance > 0.5 ? 'high' : 'medium' });
      }
    }

    // Compare reward profiles
    const rewardFields: (keyof RewardProfile)[] = ['incomePotential', 'statusPotential', 'impactPotential'];
    for (const field of rewardFields) {
      const values = careers.map(c => c.reward[field]);
      const variance = Math.max(...values) - Math.min(...values);

      if (variance > 0.3) {
        differences.set(`reward.${field}`, { field: `reward.${field}`, values, significance: variance > 0.5 ? 'high' : 'medium' });
      }
    }

    // Category comparison
    const categories = new Set(careers.map(c => c.identity.category));
    if (categories.size === 1) {
      similarities.push(`All in ${careers[0].identity.category} category`);
    }

    return {
      careers,
      differences,
      similarities,
    };
  }

  /**
   * Get career count
   */
  getCareerCount(): number {
    return this.careers.size;
  }

  /**
   * Check if a career exists
   */
  hasCareer(id: CareerId): boolean {
    return this.careers.has(id);
  }

  /**
   * Remove a career
   */
  removeCareer(id: CareerId): boolean {
    const career = this.careers.get(id);
    if (!career) return false;

    this.careers.delete(id);
    this.slugIndex.delete(career.identity.slug);

    // Update category index
    const categoryCareers = this.categoryIndex.get(career.identity.category) ?? [];
    const index = categoryCareers.indexOf(id);
    if (index > -1) {
      categoryCareers.splice(index, 1);
      if (categoryCareers.length === 0) {
        this.categoryIndex.delete(career.identity.category);
      } else {
        this.categoryIndex.set(career.identity.category, categoryCareers);
      }
    }

    return true;
  }

  /**
   * Clear all careers
   */
  clear(): void {
    this.careers.clear();
    this.slugIndex.clear();
    this.categoryIndex.clear();
  }

  /**
   * Export all careers to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.getAllCareers(), null, 2);
  }

  /**
   * Import careers from JSON
   */
  importFromJSON(json: string): CareerValidationResult[] {
    const careers: Career[] = JSON.parse(json);
    return careers.map(career => this.addCareer(career));
  }
}
