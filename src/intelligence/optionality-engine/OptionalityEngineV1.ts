/**
 * CareerOS Optionality Engine V1
 *
 * CareerOS - Career Intelligence System
 *
 * Measures how many future opportunities a career preserves.
 * Calculates optionality scores based on career flexibility, transferable skills,
 * pivot potential, entrepreneurship potential, and future career options.
 *
 * Architecture Principles:
 *   - Deterministic: Same input always produces same output
 *   - Explainable: Every score has human-readable reasoning
 *   - Pure Functions: No side effects, no external state
 *   - Scalable: Supports 150+ careers efficiently
 *   - Type-Safe: Full TypeScript coverage
 */

import type { Career, OptionalityProfile, PsychologicalProfile, WorkStyleProfile } from '../../domains/career/Career';
import type { CareerMatch } from '../matching-engine/MatchingEngineV1';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Individual optionality dimension score.
 */
export interface OptionalityDimensionScore {
  /** Dimension name */
  name: string;

  /** Score (0.0 - 1.0) */
  score: number;

  /** Human-readable explanation */
  explanation: string;

  /** Contributing factors */
  factors: string[];
}

/**
 * Complete optionality analysis for a career.
 */
export interface OptionalityAnalysis {
  /** Overall optionality score (0-100) */
  overallScore: number;

  /** Rating category */
  rating: 'exceptional' | 'high' | 'good' | 'moderate' | 'low' | 'limited';

  /** Individual dimension scores */
  dimensions: {
    careerFlexibility: OptionalityDimensionScore;
    transferableSkills: OptionalityDimensionScore;
    pivotPotential: OptionalityDimensionScore;
    entrepreneurshipPotential: OptionalityDimensionScore;
    futureCareerOptions: OptionalityDimensionScore;
  };

  /** Summary explanation */
  summary: string;

  /** Detailed reasoning */
  reasoning: string[];

  /** Adjacent careers accessible from this career */
  adjacentCareers: AdjacentCareer[];

  /** Transferable skill categories */
  skillCategories: SkillCategory[];

  /** Comparison to average (percentile) */
  percentile: number;

  /** Timestamp of analysis */
  calculatedAt: number;
}

/**
 * Adjacent career accessible from current career.
 */
export interface AdjacentCareer {
  /** Career ID */
  careerId: string;

  /** Career name */
  name: string;

  /** How easy the transition is (0.0 - 1.0) */
  transitionEase: number;

  /** Required skill overlap */
  skillOverlap: number;

  /** Estimated time to transition (months) */
  transitionTimeMonths: number;

  /** Why this career is accessible */
  reasoning: string;
}

/**
 * Transferable skill category.
 */
export interface SkillCategory {
  /** Category name */
  category: string;

  /** Skills in this category */
  skills: string[];

  /** Transferability score (0.0 - 1.0) */
  transferability: number;

  /** Industries where these skills apply */
  applicableIndustries: string[];
}

/**
 * Weights for optionality dimensions.
 * All weights should sum to 1.0.
 */
export interface OptionalityWeights {
  /** Weight for career flexibility (default: 0.25) */
  careerFlexibility: number;

  /** Weight for transferable skills (default: 0.25) */
  transferableSkills: number;

  /** Weight for pivot potential (default: 0.20) */
  pivotPotential: number;

  /** Weight for entrepreneurship potential (default: 0.15) */
  entrepreneurshipPotential: number;

  /** Weight for future career options (default: 0.15) */
  futureCareerOptions: number;
}

/**
 * Options for optionality calculation.
 */
export interface OptionalityCalculationOptions {
  /** Custom weights for dimensions */
  weights?: Partial<OptionalityWeights>;

  /** All available careers for adjacency analysis */
  allCareers?: Career[];

  /** Minimum threshold for adjacency (default: 0.3) */
  adjacencyThreshold?: number;

  /** Include detailed analysis (default: true) */
  detailed?: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_WEIGHTS: OptionalityWeights = {
  careerFlexibility: 0.25,
  transferableSkills: 0.25,
  pivotPotential: 0.20,
  entrepreneurshipPotential: 0.15,
  futureCareerOptions: 0.15,
};

// Skill taxonomy for transferable skills analysis
const SKILL_TAXONOMY: Record<string, { category: string; transferability: number; industries: string[] }> = {
  // Technical skills
  programming: { category: 'Technical', transferability: 0.9, industries: ['Technology', 'Finance', 'Healthcare', 'Media', 'Government'] },
  dataAnalysis: { category: 'Technical', transferability: 0.85, industries: ['Technology', 'Finance', 'Consulting', 'Healthcare', 'Marketing'] },
  systemDesign: { category: 'Technical', transferability: 0.8, industries: ['Technology', 'Engineering', 'Finance', 'Consulting'] },

  // Business skills
  projectManagement: { category: 'Business', transferability: 0.95, industries: ['All'] },
  strategicPlanning: { category: 'Business', transferability: 0.9, industries: ['All'] },
  financialAnalysis: { category: 'Business', transferability: 0.85, industries: ['Finance', 'Consulting', 'Technology', 'Healthcare'] },
  sales: { category: 'Business', transferability: 0.9, industries: ['All'] },
  marketing: { category: 'Business', transferability: 0.85, industries: ['All'] },
  operations: { category: 'Business', transferability: 0.8, industries: ['Manufacturing', 'Logistics', 'Technology', 'Retail'] },

  // People skills
  leadership: { category: 'People', transferability: 0.95, industries: ['All'] },
  communication: { category: 'People', transferability: 0.95, industries: ['All'] },
  negotiation: { category: 'People', transferability: 0.9, industries: ['All'] },
  teamManagement: { category: 'People', transferability: 0.9, industries: ['All'] },
  teaching: { category: 'People', transferability: 0.85, industries: ['Education', 'Technology', 'Consulting', 'Healthcare'] },

  // Creative skills
  design: { category: 'Creative', transferability: 0.85, industries: ['Media', 'Technology', 'Fashion', 'Architecture', 'Marketing'] },
  contentCreation: { category: 'Creative', transferability: 0.8, industries: ['Media', 'Technology', 'Marketing', 'Education'] },
  problemSolving: { category: 'Cognitive', transferability: 0.95, industries: ['All'] },
  research: { category: 'Cognitive', transferability: 0.9, industries: ['Technology', 'Healthcare', 'Finance', 'Consulting', 'Academia'] },
};

// Career adjacency map - defines typical career transitions
const CAREER_ADJACENCY_RULES: Record<string, { target: string; ease: number; reasoning: string }[]> = {
  'software-engineer': [
    { target: 'product-manager', ease: 0.8, reasoning: 'Technical background valuable for product decisions' },
    { target: 'data-scientist', ease: 0.7, reasoning: 'Strong programming foundation applicable to data science' },
    { target: 'entrepreneur', ease: 0.7, reasoning: 'Can build technical products independently' },
    { target: 'engineering-manager', ease: 0.8, reasoning: 'Natural progression for senior engineers' },
    { target: 'solutions-architect', ease: 0.75, reasoning: 'Leverages technical depth for design decisions' },
    { target: 'technical-writer', ease: 0.6, reasoning: 'Technical knowledge useful for documentation' },
  ],
  'doctor': [
    { target: 'healthcare-administrator', ease: 0.6, reasoning: 'Clinical experience valuable for healthcare management' },
    { target: 'medical-researcher', ease: 0.7, reasoning: 'Research builds on clinical knowledge' },
    { target: 'public-health-official', ease: 0.5, reasoning: 'Medical background relevant to public health' },
    { target: 'medical-educator', ease: 0.7, reasoning: 'Can teach next generation of doctors' },
  ],
  'teacher': [
    { target: 'instructional-designer', ease: 0.7, reasoning: 'Teaching experience informs curriculum design' },
    { target: 'educational-consultant', ease: 0.6, reasoning: 'Classroom experience valuable for consulting' },
    { target: 'corporate-trainer', ease: 0.7, reasoning: 'Teaching skills directly transferable' },
    { target: 'curriculum-developer', ease: 0.65, reasoning: 'Understands what works in education' },
  ],
  'lawyer': [
    { target: 'corporate-strategy', ease: 0.6, reasoning: 'Legal training useful for strategic analysis' },
    { target: 'compliance-officer', ease: 0.8, reasoning: 'Legal expertise directly applicable' },
    { target: 'legal-tech-entrepreneur', ease: 0.6, reasoning: 'Can identify legal industry pain points' },
    { target: 'policy-analyst', ease: 0.65, reasoning: 'Legal background relevant to policy work' },
    { target: 'contract-manager', ease: 0.75, reasoning: 'Contract expertise in high demand' },
  ],
  'chartered-accountant': [
    { target: 'financial-analyst', ease: 0.8, reasoning: 'Strong financial foundation' },
    { target: 'cfo', ease: 0.7, reasoning: 'Natural progression in finance track' },
    { target: 'investment-banker', ease: 0.6, reasoning: 'Financial acumen transferable' },
    { target: 'financial-consultant', ease: 0.75, reasoning: 'Can advise on financial matters' },
    { target: 'tax-advisor', ease: 0.85, reasoning: 'Specialized tax knowledge valuable' },
  ],
  'product-manager': [
    { target: 'startup-founder', ease: 0.7, reasoning: 'Product skills essential for startups' },
    { target: 'product-marketing', ease: 0.75, reasoning: 'Understands product deeply' },
    { target: 'strategy-consultant', ease: 0.6, reasoning: 'Strategic thinking skills transferable' },
    { target: 'vp-product', ease: 0.8, reasoning: 'Natural career progression' },
    { target: 'venture-capital', ease: 0.55, reasoning: 'Product judgment valued by VCs' },
  ],
  'data-scientist': [
    { target: 'machine-learning-engineer', ease: 0.8, reasoning: 'Strong ML foundation' },
    { target: 'product-manager', ease: 0.6, reasoning: 'Data skills valuable for product decisions' },
    { target: 'research-scientist', ease: 0.7, reasoning: 'Research skills applicable' },
    { target: 'data-engineer', ease: 0.75, reasoning: 'Technical skills overlap' },
    { target: 'business-analyst', ease: 0.7, reasoning: 'Analytics skills transferable' },
  ],
  'ux-designer': [
    { target: 'product-manager', ease: 0.7, reasoning: 'User empathy valuable for product' },
    { target: 'ui-designer', ease: 0.85, reasoning: 'Design skills directly applicable' },
    { target: 'design-lead', ease: 0.8, reasoning: 'Natural progression' },
    { target: 'design-researcher', ease: 0.75, reasoning: 'Research skills valuable' },
    { target: 'creative-director', ease: 0.6, reasoning: 'Design foundation for creative leadership' },
  ],
  'civil-servant': [
    { target: 'policy-advisor', ease: 0.7, reasoning: 'Government experience valuable' },
    { target: 'public-affairs', ease: 0.65, reasoning: 'Understands government workings' },
    { target: 'ngo-leader', ease: 0.6, reasoning: 'Public service mindset transferable' },
    { target: 'corporate-affairs', ease: 0.55, reasoning: 'Government relations expertise' },
  ],
  'entrepreneur': [
    { target: 'venture-capitalist', ease: 0.6, reasoning: 'Operating experience valued' },
    { target: 'startup-advisor', ease: 0.8, reasoning: 'Can guide other founders' },
    { target: 'corporate-innovation', ease: 0.65, reasoning: 'Innovation mindset transferable' },
    { target: 'product-manager', ease: 0.7, reasoning: 'Product-building experience' },
  ],
};

// ============================================================================
// OPTIONALITY ENGINE
// ============================================================================

export class OptionalityEngineV1 {
  private weights: OptionalityWeights;
  private allCareers: Career[];
  private adjacencyThreshold: number;
  private detailed: boolean;

  constructor(options: OptionalityCalculationOptions = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...options.weights };
    this.allCareers = options.allCareers || [];
    this.adjacencyThreshold = options.adjacencyThreshold ?? 0.3;
    this.detailed = options.detailed ?? true;
  }

  /**
   * Calculate optionality score for a single career.
   */
  calculateOptionality(career: Career): OptionalityAnalysis {
    const dimensions = {
      careerFlexibility: this.calculateCareerFlexibility(career),
      transferableSkills: this.calculateTransferableSkills(career),
      pivotPotential: this.calculatePivotPotential(career),
      entrepreneurshipPotential: this.calculateEntrepreneurshipPotential(career),
      futureCareerOptions: this.calculateFutureCareerOptions(career),
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      dimensions.careerFlexibility.score * this.weights.careerFlexibility * 100 +
      dimensions.transferableSkills.score * this.weights.transferableSkills * 100 +
      dimensions.pivotPotential.score * this.weights.pivotPotential * 100 +
      dimensions.entrepreneurshipPotential.score * this.weights.entrepreneurshipPotential * 100 +
      dimensions.futureCareerOptions.score * this.weights.futureCareerOptions * 100
    );

    const rating = this.determineRating(overallScore);
    const adjacentCareers = this.calculateAdjacentCareers(career);
    const skillCategories = this.identifySkillCategories(career);
    const percentile = this.calculatePercentile(overallScore);

    return {
      overallScore,
      rating,
      dimensions,
      summary: this.generateSummary(career, overallScore, rating, dimensions),
      reasoning: this.generateReasoning(dimensions, adjacentCareers),
      adjacentCareers,
      skillCategories,
      percentile,
      calculatedAt: Date.now(),
    };
  }

  /**
   * Calculate optionality for multiple careers.
   */
  calculateBatch(careers: Career[]): Map<string, OptionalityAnalysis> {
    this.allCareers = careers;

    const results = new Map<string, OptionalityAnalysis>();

    for (const career of careers) {
      results.set(career.id, this.calculateOptionality(career));
    }

    return results;
  }

  /**
   * Compare optionality between two careers.
   */
  compareOptionality(career1: Career, career2: Career): {
    winner: 'career1' | 'career2' | 'tie';
    score1: number;
    score2: number;
    difference: number;
    comparison: string;
    dimensionComparison: Record<string, { career1: number; career2: number; winner: string }>;
  } {
    const analysis1 = this.calculateOptionality(career1);
    const analysis2 = this.calculateOptionality(career2);

    const winner = analysis1.overallScore > analysis2.overallScore + 5
      ? 'career1'
      : analysis2.overallScore > analysis1.overallScore + 5
        ? 'career2'
        : 'tie';

    const difference = Math.abs(analysis1.overallScore - analysis2.overallScore);

    const dimensionComparison: Record<string, { career1: number; career2: number; winner: string }> = {};

    for (const [key, dim1] of Object.entries(analysis1.dimensions)) {
      const dim2 = analysis2.dimensions[key as keyof typeof analysis2.dimensions];
      dimensionComparison[key] = {
        career1: dim1.score,
        career2: dim2.score,
        winner: dim1.score > dim2.score + 0.05 ? 'career1' : dim2.score > dim1.score + 0.05 ? 'career2' : 'tie',
      };
    }

    return {
      winner,
      score1: analysis1.overallScore,
      score2: analysis2.overallScore,
      difference,
      comparison: this.generateComparison(career1, career2, analysis1, analysis2, winner, difference),
      dimensionComparison,
    };
  }

  // ============================================================================
  // DIMENSION CALCULATIONS
  // ============================================================================

  private calculateCareerFlexibility(career: Career): OptionalityDimensionScore {
    const factors: string[] = [];
    let score = career.optionality?.careerFlexibility ?? 0.5;

    // Adjust based on psychological profile
    const psych = career.psychologicalProfile;

    // High analytical thinking enables more career switches
    if (psych.analyticalThinking >= 0.7) {
      score += 0.05;
      factors.push('Strong analytical skills enable diverse problem-solving roles');
    }

    // High adaptability (curiosity + risk tolerance)
    if (psych.curiosity >= 0.7 && psych.riskTolerance >= 0.5) {
      score += 0.05;
      factors.push('Curiosity and risk tolerance support career transitions');
    }

    // Low social orientation may limit some transitions
    if (psych.socialOrientation <= 0.4) {
      score -= 0.03;
      factors.push('Lower social orientation may limit people-heavy roles');
    }

    // Work style flexibility
    const ws = career.workStyle;
    if (ws.remoteWork >= 0.7) {
      score += 0.03;
      factors.push('Remote work capability expands geographic options');
    }

    // Normalize to 0-1
    score = Math.min(1, Math.max(0, score));

    return {
      name: 'Career Flexibility',
      score,
      explanation: this.generateFlexibilityExplanation(score, factors),
      factors: factors.length > 0 ? factors : ['Standard career flexibility'],
    };
  }

  private calculateTransferableSkills(career: Career): OptionalityDimensionScore {
    const factors: string[] = [];
    let score = career.optionality?.transferableSkills ?? 0.5;

    // Analyze psychological profile for transferable traits
    const psych = career.psychologicalProfile;

    // Leadership is highly transferable
    if (psych.leadership >= 0.7) {
      score += 0.08;
      factors.push('Leadership skills apply across all industries');
    }

    // Communication (implied by social orientation)
    if (psych.socialOrientation >= 0.7) {
      score += 0.06;
      factors.push('Strong interpersonal skills transferable to many roles');
    }

    // Problem-solving (analytical + creativity)
    if (psych.analyticalThinking >= 0.7 && psych.creativity >= 0.6) {
      score += 0.07;
      factors.push('Problem-solving capabilities valued across domains');
    }

    // Detail orientation
    if (psych.detailOrientation >= 0.7) {
      score += 0.04;
      factors.push('Attention to detail applicable in many contexts');
    }

    // Normalize
    score = Math.min(1, Math.max(0, score));

    return {
      name: 'Transferable Skills',
      score,
      explanation: this.generateTransferabilityExplanation(score, factors),
      factors: factors.length > 0 ? factors : ['Moderate skill transferability'],
    };
  }

  private calculatePivotPotential(career: Career): OptionalityDimensionScore {
    const factors: string[] = [];

    // Base score on adjacency rules
    const adjacencies = CAREER_ADJACENCY_RULES[career.id] || CAREER_ADJACENCY_RULES[career.slug] || [];
    let score = Math.min(0.9, adjacencies.length * 0.12);

    if (adjacencies.length >= 5) {
      factors.push(`Multiple adjacent career paths (${adjacencies.length})`);
    } else if (adjacencies.length >= 3) {
      factors.push(`Several pivot options available (${adjacencies.length})`);
      score += 0.1;
    } else if (adjacencies.length > 0) {
      factors.push(`Limited but viable pivot paths (${adjacencies.length})`);
      score += 0.05;
    } else {
      factors.push('Few documented pivot paths');
      score = Math.max(0.2, score);
    }

    // Psychological factors for pivoting
    const psych = career.psychologicalProfile;

    // High risk tolerance enables pivots
    if (psych.riskTolerance >= 0.6) {
      score += 0.08;
      factors.push('Risk tolerance supports career transitions');
    }

    // Competitiveness may help in competitive transitions
    if (psych.competitiveness >= 0.7) {
      score += 0.04;
      factors.push('Competitive drive aids in challenging transitions');
    }

    // Normalize
    score = Math.min(1, Math.max(0, score));

    return {
      name: 'Pivot Potential',
      score,
      explanation: this.generatePivotExplanation(score, adjacencies.length, factors),
      factors,
    };
  }

  private calculateEntrepreneurshipPotential(career: Career): OptionalityDimensionScore {
    let score = career.optionality?.entrepreneurshipPotential ?? 0.5;
    const factors: string[] = [];

    const psych = career.psychologicalProfile;
    const rewards = career.rewardProfile;

    // Risk tolerance is crucial for entrepreneurship
    if (psych.riskTolerance >= 0.7) {
      score += 0.1;
      factors.push('High risk tolerance essential for entrepreneurship');
    } else if (psych.riskTolerance <= 0.4) {
      score -= 0.1;
      factors.push('Lower risk tolerance may limit entrepreneurial paths');
    }

    // Leadership and competitiveness
    if (psych.leadership >= 0.7 && psych.competitiveness >= 0.6) {
      score += 0.08;
      factors.push('Leadership and competitive drive support founding');
    }

    // Creativity for innovation
    if (psych.creativity >= 0.7) {
      score += 0.05;
      factors.push('Creative thinking enables innovative ventures');
    }

    // Independence/freedom motivation
    if (rewards.freedomPotential >= 0.7) {
      score += 0.05;
      factors.push('Drive for autonomy aligns with entrepreneurship');
    }

    // Technical skills enable product-building
    if (psych.analyticalThinking >= 0.7) {
      score += 0.04;
      factors.push('Technical capabilities support product development');
    }

    // Normalize
    score = Math.min(1, Math.max(0, score));

    return {
      name: 'Entrepreneurship Potential',
      score,
      explanation: this.generateEntrepreneurshipExplanation(score, factors),
      factors: factors.length > 0 ? factors : ['Moderate entrepreneurial potential'],
    };
  }

  private calculateFutureCareerOptions(career: Career): OptionalityDimensionScore {
    const factors: string[] = [];

    // Calculate based on adjacency network size
    const adjacencies = CAREER_ADJACENCY_RULES[career.id] || CAREER_ADJACENCY_RULES[career.slug] || [];

    // Base score from direct adjacencies
    let score = Math.min(0.7, adjacencies.length * 0.1);

    // Calculate secondary options (adjacencies of adjacencies)
    const secondaryOptions = new Set<string>();
    for (const adj of adjacencies) {
      const secondary = CAREER_ADJACENCY_RULES[adj.target] || [];
      for (const sec of secondary) {
        if (sec.target !== career.id && sec.target !== career.slug) {
          secondaryOptions.add(sec.target);
        }
      }
    }

    // Add score for secondary options
    score += Math.min(0.2, secondaryOptions.size * 0.02);

    if (adjacencies.length >= 4) {
      factors.push(`${adjacencies.length} direct career transitions available`);
    }
    if (secondaryOptions.size >= 5) {
      factors.push(`${secondaryOptions.size} secondary career paths accessible`);
    }

    // Career evolution profile
    const evolution = career.evolution;
    if (evolution?.futureCareerPaths && evolution.futureCareerPaths.length > 0) {
      score += Math.min(0.1, evolution.futureCareerPaths.length * 0.03);
      factors.push(`${evolution.futureCareerPaths.length} documented advancement paths`);
    }

    if (evolution?.adjacentCareers && evolution.adjacentCareers.length > 0) {
      score += Math.min(0.1, evolution.adjacentCareers.length * 0.03);
      factors.push(`${evolution.adjacentCareers.length} adjacent career options`);
    }

    // Normalize
    score = Math.min(1, Math.max(0.2, score));

    return {
      name: 'Future Career Options',
      score,
      explanation: this.generateFutureOptionsExplanation(score, adjacencies.length, secondaryOptions.size, factors),
      factors: factors.length > 0 ? factors : ['Standard career progression options'],
    };
  }

  // ============================================================================
  // HELPER CALCULATIONS
  // ============================================================================

  private calculateAdjacentCareers(career: Career): AdjacentCareer[] {
    const adjacencies = CAREER_ADJACENCY_RULES[career.id] || CAREER_ADJACENCY_RULES[career.slug] || [];

    return adjacencies.map(adj => ({
      careerId: adj.target,
      name: this.formatCareerName(adj.target),
      transitionEase: adj.ease,
      skillOverlap: this.estimateSkillOverlap(career, adj.target),
      transitionTimeMonths: Math.round((1 - adj.ease) * 24 + 6), // 6-30 months
      reasoning: adj.reasoning,
    }));
  }

  private identifySkillCategories(career: Career): SkillCategory[] {
    const categories = new Map<string, { skills: string[]; transferability: number }>();

    // Map psychological traits to skill categories
    const psych = career.psychologicalProfile;

    if (psych.analyticalThinking >= 0.6) {
      this.addSkillCategory(categories, 'Technical', ['problemSolving', 'dataAnalysis'], 0.9);
    }
    if (psych.creativity >= 0.6) {
      this.addSkillCategory(categories, 'Creative', ['design', 'contentCreation'], 0.85);
    }
    if (psych.socialOrientation >= 0.6) {
      this.addSkillCategory(categories, 'People', ['communication', 'negotiation', 'teamManagement'], 0.95);
    }
    if (psych.leadership >= 0.6) {
      this.addSkillCategory(categories, 'Leadership', ['leadership', 'strategicPlanning'], 0.95);
    }
    if (psych.detailOrientation >= 0.6) {
      this.addSkillCategory(categories, 'Operational', ['projectManagement', 'operations'], 0.8);
    }
    if (psych.curiosity >= 0.6) {
      this.addSkillCategory(categories, 'Research', ['research'], 0.9);
    }

    return Array.from(categories.entries()).map(([category, data]) => ({
      category,
      skills: data.skills,
      transferability: data.transferability,
      applicableIndustries: this.getIndustriesForCategory(category),
    }));
  }

  private addSkillCategory(
    categories: Map<string, { skills: string[]; transferability: number }>,
    category: string,
    skills: string[],
    transferability: number
  ): void {
    const existing = categories.get(category);
    if (existing) {
      existing.skills.push(...skills);
      existing.transferability = Math.max(existing.transferability, transferability);
    } else {
      categories.set(category, { skills, transferability });
    }
  }

  private getIndustriesForCategory(category: string): string[] {
    const industryMap: Record<string, string[]> = {
      'Technical': ['Technology', 'Finance', 'Consulting', 'Healthcare'],
      'Creative': ['Media', 'Technology', 'Marketing', 'Design'],
      'People': ['All industries'],
      'Leadership': ['All industries'],
      'Operational': ['Manufacturing', 'Logistics', 'Technology', 'Retail'],
      'Research': ['Technology', 'Healthcare', 'Finance', 'Academia'],
    };
    return industryMap[category] || ['Various'];
  }

  private estimateSkillOverlap(career1: Career, career2Id: string): number {
    // Simplified overlap estimation based on psychological profile similarity
    const psych1 = career1.psychologicalProfile;

    // Get typical profile for target career from adjacency rules
    const rules = CAREER_ADJACENCY_RULES[career2Id];
    if (!rules) return 0.5;

    // Estimate based on transition ease
    const rule = rules.find(r => r.target === career1.id || r.target === career1.slug);
    if (rule) {
      return Math.min(0.9, rule.ease + 0.1);
    }

    return 0.5;
  }

  private calculatePercentile(score: number): number {
    // Simplified percentile calculation
    // In production, this would compare against all careers
    if (score >= 85) return 90;
    if (score >= 75) return 75;
    if (score >= 65) return 60;
    if (score >= 55) return 45;
    if (score >= 45) return 30;
    return 15;
  }

  // ============================================================================
  // EXPLANATION GENERATION
  // ============================================================================

  private generateFlexibilityExplanation(score: number, factors: string[]): string {
    if (score >= 0.8) {
      return 'Exceptional career flexibility. This career opens doors to many other paths.';
    } else if (score >= 0.6) {
      return 'Good career flexibility with several viable transition options.';
    } else if (score >= 0.4) {
      return 'Moderate flexibility. Some career transitions possible with effort.';
    } else {
      return 'Limited flexibility. This career path is somewhat specialized.';
    }
  }

  private generateTransferabilityExplanation(score: number, factors: string[]): string {
    if (score >= 0.8) {
      return 'Highly transferable skills applicable across industries and roles.';
    } else if (score >= 0.6) {
      return 'Good skill transferability to related fields and functions.';
    } else if (score >= 0.4) {
      return 'Moderate transferability. Some skills apply to other contexts.';
    } else {
      return 'Specialized skills with limited direct applicability elsewhere.';
    }
  }

  private generatePivotExplanation(score: number, adjacencyCount: number, factors: string[]): string {
    if (score >= 0.8) {
      return `Excellent pivot potential with ${adjacencyCount}+ clear transition paths.`;
    } else if (score >= 0.6) {
      return `Good pivot potential with ${adjacencyCount} viable career transitions.`;
    } else if (score >= 0.4) {
      return `Moderate pivot potential. Some career changes possible with planning.`;
    } else {
      return 'Limited pivot options. Career transitions would require significant retraining.';
    }
  }

  private generateEntrepreneurshipExplanation(score: number, factors: string[]): string {
    if (score >= 0.8) {
      return 'Strong entrepreneurial profile. Well-suited for starting ventures.';
    } else if (score >= 0.6) {
      return 'Good entrepreneurial potential. Can build businesses with preparation.';
    } else if (score >= 0.4) {
      return 'Moderate entrepreneurial potential. Some business paths viable.';
    } else {
      return 'Limited entrepreneurial fit. Traditional employment may be preferable.';
    }
  }

  private generateFutureOptionsExplanation(
    score: number,
    directOptions: number,
    secondaryOptions: number,
    factors: string[]
  ): string {
    if (score >= 0.8) {
      return `Exceptional future options with ${directOptions}+ direct and ${secondaryOptions}+ secondary paths.`;
    } else if (score >= 0.6) {
      return `Good future prospects with ${directOptions} direct career transitions available.`;
    } else if (score >= 0.4) {
      return `Moderate future options. Some advancement and transition paths exist.`;
    } else {
      return 'Limited future career options. Specialization has tradeoffs.';
    }
  }

  private generateSummary(
    career: Career,
    score: number,
    rating: string,
    dimensions: OptionalityAnalysis['dimensions']
  ): string {
    const careerName = career.name;
    const topDimensions = Object.entries(dimensions)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 2)
      .map(([_, dim]) => dim.name.toLowerCase());

    let summary = `${careerName} scores ${score}/100 on optionality (${rating}). `;

    if (score >= 75) {
      summary += `This is a high-optionality career with strong ${topDimensions.join(' and ')}. `;
      summary += `It preserves many future opportunities.`;
    } else if (score >= 55) {
      summary += `This career offers moderate optionality with reasonable ${topDimensions[0]}. `;
      summary += `Some future paths remain open.`;
    } else {
      summary += `This is a more specialized path with limited optionality. `;
      summary += `Consider if the tradeoffs align with your goals.`;
    }

    return summary;
  }

  private generateReasoning(dimensions: OptionalityAnalysis['dimensions'], adjacents: AdjacentCareer[]): string[] {
    const reasoning: string[] = [];

    // Add dimension-specific reasoning
    for (const [key, dim] of Object.entries(dimensions)) {
      if (dim.score >= 0.7) {
        reasoning.push(`Strong ${dim.name.toLowerCase()}: ${dim.factors[0] || 'Above average'}`);
      } else if (dim.score <= 0.4) {
        reasoning.push(`Limited ${dim.name.toLowerCase()}: ${dim.factors[0] || 'Below average'}`);
      }
    }

    // Add adjacency reasoning
    if (adjacents.length >= 4) {
      reasoning.push(`Multiple adjacent careers: ${adjacents.slice(0, 3).map(a => a.name).join(', ')}, and others`);
    } else if (adjacents.length > 0) {
      reasoning.push(`Adjacent options: ${adjacents.map(a => a.name).join(', ')}`);
    }

    return reasoning;
  }

  private generateComparison(
    career1: Career,
    career2: Career,
    analysis1: OptionalityAnalysis,
    analysis2: OptionalityAnalysis,
    winner: 'career1' | 'career2' | 'tie',
    difference: number
  ): string {
    if (winner === 'tie') {
      return `${career1.name} and ${career2.name} offer similar optionality profiles. Both preserve comparable future opportunities.`;
    }

    const winnerName = winner === 'career1' ? career1.name : career2.name;
    const loserName = winner === 'career1' ? career2.name : career1.name;
    const winnerAnalysis = winner === 'career1' ? analysis1 : analysis2;

    let comparison = `${winnerName} offers superior optionality (${difference} points higher). `;

    // Highlight specific strengths
    const strongDimensions = Object.entries(winnerAnalysis.dimensions)
      .filter(([_, dim]) => dim.score >= 0.7)
      .map(([key, _]) => key);

    if (strongDimensions.length > 0) {
      const dimensionNames = strongDimensions.map(d => {
        const names: Record<string, string> = {
          careerFlexibility: 'career flexibility',
          transferableSkills: 'transferable skills',
          pivotPotential: 'pivot potential',
          entrepreneurshipPotential: 'entrepreneurship potential',
          futureCareerOptions: 'future options',
        };
        return names[d] || d;
      });
      comparison += `It particularly excels in ${dimensionNames.join(', ')}. `;
    }

    comparison += `${loserName} may be more specialized but offers fewer future paths.`;

    return comparison;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private determineRating(score: number): OptionalityAnalysis['rating'] {
    if (score >= 90) return 'exceptional';
    if (score >= 75) return 'high';
    if (score >= 60) return 'good';
    if (score >= 45) return 'moderate';
    if (score >= 30) return 'low';
    return 'limited';
  }

  private formatCareerName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Calculate optionality for a single career.
 */
export function calculateOptionality(
  career: Career,
  options?: OptionalityCalculationOptions
): OptionalityAnalysis {
  const engine = new OptionalityEngineV1(options);
  return engine.calculateOptionality(career);
}

/**
 * Calculate optionality for multiple careers.
 */
export function calculateBatchOptionality(
  careers: Career[],
  options?: OptionalityCalculationOptions
): Map<string, OptionalityAnalysis> {
  const engine = new OptionalityEngineV1(options);
  return engine.calculateBatch(careers);
}

/**
 * Compare optionality between two careers.
 */
export function compareCareerOptionality(
  career1: Career,
  career2: Career,
  options?: OptionalityCalculationOptions
): ReturnType<OptionalityEngineV1['compareOptionality']> {
  const engine = new OptionalityEngineV1(options);
  return engine.compareOptionality(career1, career2);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  OptionalityAnalysis,
  OptionalityDimensionScore,
  AdjacentCareer,
  SkillCategory,
  OptionalityWeights,
  OptionalityCalculationOptions,
};
