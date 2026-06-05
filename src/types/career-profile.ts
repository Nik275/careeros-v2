/**
 * CareerOS - Career Profile Foundation
 *
 * Phase A.2: Core Domain Model for Career Intelligence
 *
 * This module defines the foundational type system for representing careers
 * in CareerOS. Each CareerProfile captures the essential characteristics,
 * requirements, and outlook of a specific career path.
 *
 * All numeric scores are normalized to a 0-100 scale unless otherwise specified.
 * Salary values are in Indian Rupees (INR) annual compensation.
 *
 * @module career-profile
 * @version 1.0.0
 */

/**
 * Canonical representation of a career in CareerOS.
 *
 * CareerProfile serves as the central model for all career-related
 * intelligence, matching, and recommendation systems. It captures
 * multidimensional career characteristics required for sophisticated
 * career guidance.
 *
 * @example
 * const career: CareerProfile = {
 *   id: 'software-engineer-001',
 *   title: 'Software Engineer',
 *   category: { primary: 'Technology', secondary: 'Engineering' },
 *   workNature: { analytical: 85, creative: 70, technical: 95, ... },
 *   // ... other profiles
 * };
 */
export interface CareerProfile {
  /** Unique identifier for this career (stable across versions) */
  id: string;

  /** Human-readable career title */
  title: string;

  /** Hierarchical classification of the career domain */
  category: CareerCategory;

  /** Comprehensive description of the career, responsibilities, and day-to-day work */
  description: string;

  /** Nature of work and task characteristics */
  workNature: WorkNatureProfile;

  /** Educational requirements and qualifications */
  education: EducationProfile;

  /** Compensation structure across career stages */
  compensation: CompensationProfile;

  /** Market demand and growth trajectory */
  growth: GrowthProfile;

  /** Lifestyle implications and work arrangements */
  lifestyle: CareerLifestyleProfile;

  /** Long-term outlook and future viability */
  futureOutlook: FutureOutlookProfile;

  /** Entry requirements and barriers to entry */
  barriers: EntryBarrierProfile;
}

/**
 * Hierarchical classification system for career categorization.
 *
 * Enables filtering, grouping, and comparative analysis across
 * career domains and specializations.
 */
export interface CareerCategory {
  /** Primary domain (e.g., "Technology", "Healthcare", "Finance") */
  primary: string;

  /** Secondary specialization (e.g., "Engineering", "Nursing", "Investment") */
  secondary: string;
}

/**
 * Characteristics of the work itself and daily tasks.
 *
 * Describes the nature of activities performed in this career.
 * These dimensions are used for matching against student cognitive
 * preferences and work style compatibility.
 *
 * All scores normalized to 0-100 scale:
 * - 0-30: Minimal requirement/involvement
 * - 31-50: Moderate involvement
 * - 51-70: Significant component
 * - 71-90: Major component
 * - 91-100: Dominant characteristic
 */
export interface WorkNatureProfile {
  /** Degree of analytical reasoning and problem-solving required (0-100) */
  analytical: number;

  /** Degree of creative thinking and innovation required (0-100) */
  creative: number;

  /** Level of technical knowledge and specialized skills required (0-100) */
  technical: number;

  /** Degree of interpersonal interaction and relationship focus (0-100) */
  peopleFocused: number;

  /** Extent of leadership and management responsibilities (0-100) */
  leadership: number;

  /** Amount of physical activity and manual work involved (0-100) */
  physicalActivity: number;
}

/**
 * Educational requirements and qualification pathways.
 *
 * Defines the minimum and preferred educational credentials
 * needed for entry and progression in this career.
 */
export interface EducationProfile {
  /** Minimum qualification required for entry-level positions */
  minimumQualification: string;

  /** Preferred or advantageous qualifications for better opportunities */
  preferredQualifications: string[];

  /** Industry-recognized certifications that enhance prospects */
  certifications: string[];
}

/**
 * Compensation structure across career progression stages.
 *
 * Salary figures in Indian Rupees (INR) lakhs per annum.
 * Represents typical ranges for the Indian market.
 *
 * @example
 * {
 *   entrySalary: 400000,    // 4 LPA
 *   midSalary: 1200000,     // 12 LPA
 *   seniorSalary: 2500000   // 25 LPA
 * }
 */
export interface CompensationProfile {
  /** Typical entry-level annual compensation in INR */
  entrySalary: number;

  /** Typical mid-career annual compensation in INR */
  midSalary: number;

  /** Typical senior-level annual compensation in INR */
  seniorSalary: number;
}

/**
 * Market demand and career growth characteristics.
 *
 * Captures the current and projected state of the job market
 * for this career, informing opportunity assessment.
 *
 * All scores normalized to 0-100 scale:
 * - demand: Current job market availability
 * - projectedDemand: Expected future demand
 * - growthRate: Annual growth percentage mapped to 0-100 scale
 */
export interface GrowthProfile {
  /** Current market demand for this career (0-100) */
  currentDemand: number;

  /** Projected future demand trajectory (0-100) */
  projectedDemand: number;

  /** Annual growth rate normalized to 0-100 scale (0-100) */
  growthRate: number;
}

/**
 * Lifestyle and work arrangement characteristics.
 *
 * Describes how this career impacts daily life, flexibility,
 * and work-life integration. Critical for lifestyle matching.
 *
 * All scores normalized to 0-100 scale.
 */
export interface CareerLifestyleProfile {
  /** Degree of schedule and work arrangement flexibility (0-100) */
  flexibility: number;

  /** Compatibility with remote or hybrid work models (0-100) */
  remoteCompatibility: number;

  /** Frequency and extent of required travel (0-100) */
  travelRequirement: number;

  /** Typical work-life balance achievability (0-100) */
  workLifeBalance: number;
}

/**
 * Long-term outlook and future viability assessment.
 *
 * Evaluates the career's sustainability and relevance over
 * the coming decades, considering technological and economic shifts.
 *
 * All scores normalized to 0-100 scale:
 * - automationRisk: Higher = more risk of automation
 * - resilienceScore: Higher = more resilient to disruption
 * - futureRelevance: Higher = more relevant in future economy
 */
export interface FutureOutlookProfile {
  /** Risk of job displacement by automation and AI (0-100) */
  automationRisk: number;

  /** Resilience against economic and technological disruption (0-100) */
  resilienceScore: number;

  /** Projected relevance and importance in future economy (0-100) */
  futureRelevance: number;
}

/**
 * Barriers and challenges to entering this career.
 *
 * Documents the difficulty and competitiveness of breaking
 * into this career field. Helps set realistic expectations.
 *
 * All scores normalized to 0-100 scale:
 * - educationDifficulty: Rigor and competitiveness of required education
 * - competitionLevel: Competition for available positions
 * - entryComplexity: Overall complexity of entry pathway
 */
export interface EntryBarrierProfile {
  /** Difficulty level of required educational pathway (0-100) */
  educationDifficulty: number;

  /** Level of competition for entry-level positions (0-100) */
  competitionLevel: number;

  /** Overall complexity of the entry process (0-100) */
  entryComplexity: number;
}
