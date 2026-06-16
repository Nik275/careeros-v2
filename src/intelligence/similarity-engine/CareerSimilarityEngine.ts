/**
 * CareerOS Career Similarity Engine
 *
 * Measures multi-dimensional similarity between careers.
 * Produces 0-100 similarity scores with detailed explanations.
 *
 * @version 1.0.0
 */

import {
  CareerCategory,
} from '../../domains/career/Career';

import type {
  Career,
  CareerId,
  EducationRequirements,
  PsychologicalProfile,
  WorkStyleProfile,
} from '../../domains/career/Career';

// ============================================================================
// TYPES
// ============================================================================

/** Individual dimension similarity score (0-100) */
export interface DimensionSimilarity {
  score: number;
  weight: number;
  details: string[];
}

/** Complete similarity analysis between two careers */
export interface CareerSimilarityResult {
  careerA: CareerId;
  careerB: CareerId;
  overallScore: number;
  dimensions: {
    skillOverlap: DimensionSimilarity;
    psychologyOverlap: DimensionSimilarity;
    workStyleOverlap: DimensionSimilarity;
    educationOverlap: DimensionSimilarity;
    industryOverlap: DimensionSimilarity;
  };
  explanation: SimilarityExplanation;
  confidence: number;
  computedAt: number;
}

/** Human-readable explanation of similarity */
export interface SimilarityExplanation {
  summary: string;
  keySimilarities: string[];
  keyDifferences: string[];
  transitionAssessment: string;
  recommendation: string;
}

/** Options for similarity calculation */
export interface SimilarityOptions {
  /** Custom weights for dimensions (must sum to 1) */
  weights?: Partial<DimensionWeights>;
  /** Minimum threshold for inclusion in results */
  minThreshold?: number;
  /** Include detailed breakdown */
  includeDetails?: boolean;
}

/** Weight configuration for each dimension */
export interface DimensionWeights {
  skillOverlap: number;
  psychologyOverlap: number;
  workStyleOverlap: number;
  educationOverlap: number;
  industryOverlap: number;
}

/** Batch comparison result */
export interface BatchSimilarityResult {
  targetCareer: CareerId;
  comparisons: CareerSimilarityResult[];
  ranked: CareerSimilarityResult[];
  statistics: SimilarityStatistics;
}

/** Statistical summary of similarity scores */
export interface SimilarityStatistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  quartiles: [number, number, number];
}

/** Risk level mapping for numeric conversion */
const RISK_LEVEL_MAP: Record<string, number> = {
  'minimal': 0.1,
  'low': 0.3,
  'moderate': 0.5,
  'high': 0.7,
  'severe': 0.9,
};

/** Demand level mapping */
const DEMAND_LEVEL_MAP: Record<string, number> = {
  'declining': 0.2,
  'stable': 0.5,
  'growing': 0.7,
  'high-growth': 0.9,
  'booming': 1.0,
};

/** Work-life balance mapping */
const WORK_LIFE_MAP: Record<string, number> = {
  'excellent': 1.0,
  'good': 0.8,
  'average': 0.5,
  'poor': 0.3,
  'very-poor': 0.1,
};

/** Stress level mapping */
const STRESS_LEVEL_MAP: Record<string, number> = {
  'low': 0.1,
  'moderate': 0.4,
  'high': 0.7,
  'very-high': 0.9,
  'extreme': 1.0,
};

/** Remote work level mapping */
const REMOTE_WORK_MAP: Record<string, number> = {
  'none': 0.0,
  'limited': 0.25,
  'hybrid': 0.5,
  'fully-remote': 0.75,
  'remote-first': 1.0,
};

/** Travel requirement mapping */
const TRAVEL_MAP: Record<string, number> = {
  'none': 0.0,
  'occasional': 0.25,
  'frequent': 0.5,
  'extensive': 0.75,
  'constant': 1.0,
};

/** Team orientation mapping */
const TEAM_ORIENTATION_MAP: Record<string, number> = {
  'solo': 0.0,
  'small-team': 0.25,
  'medium-team': 0.5,
  'large-team': 0.75,
  'fluid': 0.5,
};

/** Education level mapping */
const EDUCATION_LEVEL_MAP: Record<string, number> = {
  'none': 0,
  'no_formal_requirement': 0,
  'high-school': 1,
  'high_school': 1,
  'diploma': 2,
  'associate': 3,
  'bachelor': 4,
  'bachelors': 4,
  'master': 5,
  'masters': 5,
  'doctorate': 6,
  'professional-degree': 7,
  'professional_degree': 7,
  'post-doctoral': 8,
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_WEIGHTS: DimensionWeights = {
  skillOverlap: 0.25,
  psychologyOverlap: 0.20,
  workStyleOverlap: 0.20,
  educationOverlap: 0.15,
  industryOverlap: 0.20,
};

// ============================================================================
// SIMILARITY ENGINE
// ============================================================================

export class CareerSimilarityEngine {
  private weights: DimensionWeights;

  constructor(weights: Partial<DimensionWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.validateWeights();
  }

  private validateWeights(): void {
    const total = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      throw new Error(`Weights must sum to 1.0, got ${total}`);
    }
  }

  /**
   * Calculate similarity between two careers
   */
  calculateSimilarity(
    careerA: Career,
    careerB: Career,
    options: SimilarityOptions = {}
  ): CareerSimilarityResult {
    const dimensions = {
      skillOverlap: this.calculateSkillOverlap(careerA, careerB),
      psychologyOverlap: this.calculatePsychologyOverlap(careerA, careerB),
      workStyleOverlap: this.calculateWorkStyleOverlap(careerA, careerB),
      educationOverlap: this.calculateEducationOverlap(careerA, careerB),
      industryOverlap: this.calculateIndustryOverlap(careerA, careerB),
    };

    // Apply custom weights if provided
    if (options.weights) {
      const customWeights = { ...this.weights, ...options.weights };
      Object.keys(dimensions).forEach((key) => {
        const k = key as keyof DimensionWeights;
        dimensions[k as keyof typeof dimensions].weight = customWeights[k];
      });
    }

    // Calculate weighted overall score
    const overallScore = Math.round(
      Object.entries(dimensions).reduce((sum, [key, dim]) => {
        return sum + dim.score * dim.weight;
      }, 0)
    );

    const explanation = this.generateExplanation(careerA, careerB, dimensions, overallScore);
    const confidence = this.calculateConfidence(dimensions);

    return {
      careerA: careerA.id as CareerId,
      careerB: careerB.id as CareerId,
      overallScore,
      dimensions,
      explanation,
      confidence,
      computedAt: Date.now(),
    };
  }

  /**
   * Calculate skill overlap between careers
   * Based on: transferable skills, optionality, and psychological traits
   */
  private calculateSkillOverlap(careerA: Career, careerB: Career): DimensionSimilarity {
    const details: string[] = [];

    // Transferable skills comparison
    const transferableDiff = Math.abs(
      (careerA.optionality?.transferableSkills || 5) - (careerB.optionality?.transferableSkills || 5)
    );
    const transferableScore = Math.max(0, 100 - transferableDiff * 10);

    // Career flexibility comparison
    const flexibilityDiff = Math.abs(
      ((careerA.optionality?.careerFlexibility || 0.5) - (careerB.optionality?.careerFlexibility || 0.5)) * 100
    );
    const flexibilityScore = 100 - flexibilityDiff;

    // Analytical thinking similarity (key skill indicator)
    const analyticalDiff = Math.abs(
      ((careerA.psychologicalProfile.analyticalThinking ?? 0.5) - (careerB.psychologicalProfile.analyticalThinking ?? 0.5)) * 100
    );
    const analyticalScore = 100 - analyticalDiff;

    // Creativity similarity
    const creativityDiff = Math.abs(
      ((careerA.psychologicalProfile.creativity ?? 0.5) - (careerB.psychologicalProfile.creativity ?? 0.5)) * 100
    );
    const creativityScore = 100 - creativityDiff;

    // Detail orientation similarity
    const detailDiff = Math.abs(
      ((careerA.psychologicalProfile.detailOrientation ?? 0.5) - (careerB.psychologicalProfile.detailOrientation ?? 0.5)) * 100
    );
    const detailScore = 100 - detailDiff;

    // Weighted combination
    const score = Math.round(
      transferableScore * 0.25 +
      flexibilityScore * 0.20 +
      analyticalScore * 0.20 +
      creativityScore * 0.15 +
      detailScore * 0.20
    );

    // Generate details
    if (transferableScore > 70) {
      details.push(`Both careers offer ${careerA.optionality?.transferableSkills || 5} transferable skills`);
    }
    if (analyticalScore > 80) {
      details.push('Strong analytical thinking requirements in both');
    } else if (analyticalScore < 40) {
      details.push('Different analytical thinking demands');
    }
    if (creativityScore > 80) {
      details.push('Both value creative problem-solving');
    }
    if (detailScore > 80) {
      details.push('Similar attention to detail requirements');
    }

    return { score, weight: this.weights.skillOverlap, details };
  }

  /**
   * Calculate psychology overlap
   * Compares all psychological traits
   */
  private calculatePsychologyOverlap(careerA: Career, careerB: Career): DimensionSimilarity {
    const details: string[] = [];
    const psychA = careerA.psychologicalProfile;
    const psychB = careerB.psychologicalProfile;

    const traits: Array<{ key: keyof PsychologicalProfile; name: string }> = [
      { key: 'analyticalThinking', name: 'analytical thinking' },
      { key: 'creativity', name: 'creativity' },
      { key: 'socialOrientation', name: 'social orientation' },
      { key: 'leadership', name: 'leadership' },
      { key: 'detailOrientation', name: 'detail orientation' },
      { key: 'curiosity', name: 'curiosity' },
      { key: 'competitiveness', name: 'competitiveness' },
      { key: 'riskTolerance', name: 'risk tolerance' },
    ];

    let totalDiff = 0;
    const similarTraits: string[] = [];
    const differentTraits: string[] = [];

    for (const { key, name } of traits) {
      const valA = (psychA[key] as number) || 0.5;
      const valB = (psychB[key] as number) || 0.5;
      const diff = Math.abs(valA - valB) * 100;
      totalDiff += diff;

      if (diff < 20) {
        similarTraits.push(name);
      } else if (diff > 50) {
        differentTraits.push(name);
      }
    }

    const avgDiff = totalDiff / traits.length;
    const score = Math.round(Math.max(0, 100 - avgDiff));

    // Generate details
    if (similarTraits.length > 0) {
      details.push(`Similar ${similarTraits.slice(0, 3).join(', ')} requirements`);
    }
    if (differentTraits.length > 0) {
      details.push(`Different ${differentTraits.slice(0, 2).join(', ')} profiles`);
    }

    return { score, weight: this.weights.psychologyOverlap, details };
  }

  /**
   * Calculate work-style overlap
   * Compares work environment preferences
   */
  private calculateWorkStyleOverlap(careerA: Career, careerB: Career): DimensionSimilarity {
    const details: string[] = [];
    const workA = careerA.workStyle;
    const workB = careerB.workStyle;

    // Remote work compatibility
    const remoteA = workA.remoteWork ?? 0.5;
    const remoteB = workB.remoteWork ?? 0.5;
    const remoteDiff = Math.abs(remoteA - remoteB) * 100;
    const remoteScore = 100 - remoteDiff;

    // Travel requirement compatibility
    const travelA = workA.travelRequirement ?? 0.25;
    const travelB = workB.travelRequirement ?? 0.25;
    const travelDiff = Math.abs(travelA - travelB) * 100;
    const travelScore = 100 - travelDiff;

    // Team orientation compatibility
    const teamA = workA.teamOrientation ?? 0.5;
    const teamB = workB.teamOrientation ?? 0.5;
    const teamDiff = Math.abs(teamA - teamB) * 100;
    const teamScore = 100 - teamDiff;

    // Office/field work compatibility
    const officeMatch = 100 - Math.abs((workA.officeWork ?? 0.5) - (workB.officeWork ?? 0.5)) * 100;
    const fieldMatch = 100 - Math.abs((workA.fieldWork ?? 0.5) - (workB.fieldWork ?? 0.5)) * 100;

    // Solo orientation compatibility
    const soloMatch = 100 - Math.abs((workA.soloOrientation ?? 0.5) - (workB.soloOrientation ?? 0.5)) * 100;

    // Structured environment compatibility
    const structuredMatch = 100 - Math.abs((workA.structuredEnvironment ?? 0.5) - (workB.structuredEnvironment ?? 0.5)) * 100;

    const score = Math.round(
      remoteScore * 0.20 +
      travelScore * 0.15 +
      teamScore * 0.15 +
      officeMatch * 0.15 +
      fieldMatch * 0.10 +
      soloMatch * 0.10 +
      structuredMatch * 0.15
    );

    // Generate details
    if (remoteScore > 80) {
      details.push('Similar remote work flexibility');
    } else if (remoteScore < 30) {
      details.push('Different remote work arrangements');
    }
    if (travelScore > 80) {
      details.push('Matching travel requirements');
    }
    if (teamScore > 80) {
      details.push('Similar team collaboration styles');
    }
    if (officeMatch === 100) {
      details.push((workA.officeWork ?? 0) > 0.5 ? 'Both office-based' : 'Both non-office roles');
    }

    return { score, weight: this.weights.workStyleOverlap, details };
  }

  /**
   * Calculate education overlap
   * Compares educational requirements and paths
   */
  private calculateEducationOverlap(careerA: Career, careerB: Career): DimensionSimilarity {
    const details: string[] = [];
    const eduA = careerA.education;
    const eduB = careerB.education;

    // Education level comparison
    const levelA = EDUCATION_LEVEL_MAP[eduA.minimumLevel] ?? 4;
    const levelB = EDUCATION_LEVEL_MAP[eduB.minimumLevel] ?? 4;
    const levelDiff = Math.abs(levelA - levelB);
    const levelScore = Math.max(0, 100 - levelDiff * 20);

    // Years of study comparison
    const yearsA = levelA;
    const yearsB = levelB;
    const yearsDiff = Math.abs(yearsA - yearsB);
    const yearsScore = Math.max(0, 100 - yearsDiff * 15);

    // Degree overlap
    const degreesA = new Set(eduA.typicalDegrees || []);
    const degreesB = new Set(eduB.typicalDegrees || []);
    const intersection = new Set([...degreesA].filter(d => degreesB.has(d)));
    const degreeOverlap = degreesA.size > 0
      ? (intersection.size / Math.max(degreesA.size, degreesB.size)) * 100
      : 50;

    // Certification overlap
    const certsA = new Set(eduA.certifications || []);
    const certsB = new Set(eduB.certifications || []);
    const certIntersection = new Set([...certsA].filter(c => certsB.has(c)));
    const certOverlap = certsA.size > 0 || certsB.size > 0
      ? (certIntersection.size / Math.max(certsA.size, certsB.size, 1)) * 100
      : 100; // If neither requires certs, they're similar in that aspect

    // Exam difficulty comparison
    const examDiffA = careerA.indiaReality.coachingDependency ?? 0.5;
    const examDiffB = careerB.indiaReality.coachingDependency ?? 0.5;
    const examDiff = Math.abs(examDiffA - examDiffB) * 100;
    const examScore = 100 - examDiff;

    const score = Math.round(
      levelScore * 0.30 +
      yearsScore * 0.20 +
      degreeOverlap * 0.25 +
      certOverlap * 0.15 +
      examScore * 0.10
    );

    // Generate details
    if (levelScore > 80) {
      details.push(`Both require ${eduA.minimumLevel} education`);
    } else if (levelDiff > 2) {
      details.push(`Different education requirements (${levelDiff} levels apart)`);
    }
    if (intersection.size > 0) {
      details.push(`Shared degree paths: ${Array.from(intersection).slice(0, 2).join(', ')}`);
    }
    if (yearsScore > 80) {
      details.push('Similar time investment for education');
    }

    return { score, weight: this.weights.educationOverlap, details };
  }

  /**
   * Calculate industry overlap
   * Compares industry category and future outlook
   */
  private calculateIndustryOverlap(careerA: Career, careerB: Career): DimensionSimilarity {
    const details: string[] = [];

    // Category match (strong indicator)
    const categoryMatch = careerA.category === careerB.category ? 100 : 0;
    if (categoryMatch === 100) {
      details.push(`Both in ${careerA.category} sector`);
    }

    // Related categories scoring
    const relatedCategories = this.getRelatedCategories(careerA.category, careerB.category);
    const categoryScore = categoryMatch === 100 ? 100 : relatedCategories ? 60 : 20;

    if (relatedCategories && categoryMatch !== 100) {
      details.push('Related industry sectors');
    }

    // Future demand alignment
    const demandA = Math.min(1, careerA.evolution.futureCareerPaths.length / 5);
    const demandB = Math.min(1, careerB.evolution.futureCareerPaths.length / 5);
    const demandDiff = Math.abs(demandA - demandB) * 100;
    const demandScore = 100 - demandDiff;

    if (demandScore > 80) {
      details.push('Aligned future demand trajectories');
    }

    // Industry growth alignment
    const growthA = careerA.evolution.futureCareerPaths.length;
    const growthB = careerB.evolution.futureCareerPaths.length;
    const growthMatch = growthA === growthB ? 100 : 50;

    if (growthMatch === 100) {
      details.push('Similar future pathway breadth');
    }

    // AI disruption risk alignment
    const aiRiskA = careerA.riskProfile.automationRisk ?? 0.5;
    const aiRiskB = careerB.riskProfile.automationRisk ?? 0.5;
    const aiDiff = Math.abs(aiRiskA - aiRiskB) * 100;
    const aiScore = 100 - aiDiff;

    // Global mobility comparison
    const mobilityDiff = Math.abs(
      ((careerA.optionality.careerFlexibility ?? 0.5) - (careerB.optionality.careerFlexibility ?? 0.5)) * 100
    );
    const mobilityScore = 100 - mobilityDiff;

    const score = Math.round(
      categoryScore * 0.40 +
      demandScore * 0.20 +
      growthMatch * 0.15 +
      aiScore * 0.15 +
      mobilityScore * 0.10
    );

    return { score, weight: this.weights.industryOverlap, details };
  }

  /**
   * Determine if two categories are related
   */
  private getRelatedCategories(catA?: CareerCategory, catB?: CareerCategory): boolean {
    if (!catA || !catB) return false;

    const relatedGroups: CareerCategory[][] = [
      [CareerCategory.TECHNOLOGY, CareerCategory.ENGINEERING, CareerCategory.SCIENCE],
      [CareerCategory.FINANCE, CareerCategory.BUSINESS],
      [CareerCategory.HEALTHCARE, CareerCategory.SCIENCE],
      [CareerCategory.LAW, CareerCategory.BUSINESS, CareerCategory.GOVERNMENT],
      [CareerCategory.ARTS, CareerCategory.MEDIA],
      [CareerCategory.EDUCATION, CareerCategory.SCIENCE],
    ];

    return relatedGroups.some(group => group.includes(catA) && group.includes(catB));
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    careerA: Career,
    careerB: Career,
    dimensions: CareerSimilarityResult['dimensions'],
    overallScore: number
  ): SimilarityExplanation {
    const keySimilarities: string[] = [];
    const keyDifferences: string[] = [];

    // Collect all dimension details
    Object.entries(dimensions).forEach(([key, dim]) => {
      if (dim.score > 70) {
        keySimilarities.push(...dim.details);
      } else if (dim.score < 40) {
        keyDifferences.push(...dim.details);
      }
    });

    // Deduplicate
    const uniqueSimilarities = [...new Set(keySimilarities)].slice(0, 5);
    const uniqueDifferences = [...new Set(keyDifferences)].slice(0, 3);

    // Generate summary
    let summary: string;
    if (overallScore >= 80) {
      summary = `${careerA.name} and ${careerB.name} are highly similar careers with strong overlap in core requirements.`;
    } else if (overallScore >= 60) {
      summary = `${careerA.name} and ${careerB.name} share significant similarities with some notable differences.`;
    } else if (overallScore >= 40) {
      summary = `${careerA.name} and ${careerB.name} have moderate overlap but distinct characteristics.`;
    } else {
      summary = `${careerA.name} and ${careerB.name} are quite different careers with limited overlap.`;
    }

    // Transition assessment
    let transitionAssessment: string;
    if (overallScore >= 75) {
      transitionAssessment = `Transition from ${careerA.name} to ${careerB.name} is highly feasible with minimal reskilling required.`;
    } else if (overallScore >= 55) {
      transitionAssessment = `Transition is viable with moderate preparation in key difference areas.`;
    } else if (overallScore >= 35) {
      transitionAssessment = `Transition possible but requires significant reskilling and adaptation.`;
    } else {
      transitionAssessment = `Transition would be challenging, essentially a career restart.`;
    }

    // Recommendation
    let recommendation: string;
    if (overallScore >= 70) {
      recommendation = `Strong alternative path - consider if seeking similar work with different focus.`;
    } else if (overallScore >= 50) {
      recommendation = `Viable pivot option - evaluate based on interest in the different aspects.`;
    } else if (overallScore >= 30) {
      recommendation = `Possible with preparation - only pursue if genuinely interested in the new domain.`;
    } else {
      recommendation = `Not recommended as a direct transition - consider intermediate steps.`;
    }

    return {
      summary,
      keySimilarities: uniqueSimilarities,
      keyDifferences: uniqueDifferences,
      transitionAssessment,
      recommendation,
    };
  }

  /**
   * Calculate confidence in the similarity score
   */
  private calculateConfidence(dimensions: CareerSimilarityResult['dimensions']): number {
    // Higher confidence when dimensions agree
    const scores = Object.values(dimensions).map(d => d.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Lower stdDev = higher confidence
    const consistencyScore = Math.max(0, 100 - stdDev);

    // Base confidence starts at 0.85, adjusted by consistency
    return Math.min(0.98, 0.85 + (consistencyScore / 100) * 0.13);
  }

  /**
   * Compare target career against multiple careers
   */
  compareWithMany(
    targetCareer: Career,
    comparisonCareers: Career[],
    options: SimilarityOptions = {}
  ): BatchSimilarityResult {
    const comparisons = comparisonCareers
      .filter(c => c.id !== targetCareer.id)
      .map(c => this.calculateSimilarity(targetCareer, c, options));

    // Sort by score descending
    const ranked = [...comparisons].sort((a, b) => b.overallScore - a.overallScore);

    return {
      targetCareer: targetCareer.id as CareerId,
      comparisons,
      ranked,
      statistics: this.calculateStatistics(comparisons.map(c => c.overallScore)),
    };
  }

  /**
   * Find most similar careers from a pool
   */
  findMostSimilar(
    targetCareer: Career,
    careerPool: Career[],
    limit: number = 5,
    minThreshold: number = 30
  ): CareerSimilarityResult[] {
    const result = this.compareWithMany(targetCareer, careerPool, { minThreshold });
    return result.ranked
      .filter(r => r.overallScore >= minThreshold)
      .slice(0, limit);
  }

  /**
   * Find least similar careers (for diversity exploration)
   */
  findLeastSimilar(
    targetCareer: Career,
    careerPool: Career[],
    limit: number = 5
  ): CareerSimilarityResult[] {
    const result = this.compareWithMany(targetCareer, careerPool);
    return [...result.ranked]
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, limit);
  }

  /**
   * Calculate statistics for a set of scores
   */
  private calculateStatistics(scores: number[]): SimilarityStatistics {
    const sorted = [...scores].sort((a, b) => a - b);
    const n = scores.length;
    const mean = scores.reduce((a, b) => a + b, 0) / n;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    const q1 = sorted[Math.floor(n * 0.25)];
    const q2 = median;
    const q3 = sorted[Math.floor(n * 0.75)];

    return {
      mean: Math.round(mean),
      median: Math.round(median),
      stdDev: Math.round(stdDev),
      min: sorted[0],
      max: sorted[n - 1],
      quartiles: [q1, q2, q3],
    };
  }

  /**
   * Update weights dynamically
   */
  setWeights(weights: Partial<DimensionWeights>): void {
    this.weights = { ...this.weights, ...weights };
    this.validateWeights();
  }

  /**
   * Get current weights
   */
  getWeights(): DimensionWeights {
    return { ...this.weights };
  }
}

// ============================================================================
// FACTORY & UTILITIES
// ============================================================================

/**
 * Create similarity engine with default weights
 */
export function createSimilarityEngine(weights?: Partial<DimensionWeights>): CareerSimilarityEngine {
  return new CareerSimilarityEngine(weights);
}

/**
 * Quick similarity check between two careers
 */
export function quickSimilarity(careerA: Career, careerB: Career): number {
  const engine = new CareerSimilarityEngine();
  return engine.calculateSimilarity(careerA, careerB).overallScore;
}

/**
 * Pre-configured engines for specific use cases
 */
export const SimilarityEngines = {
  /** Balanced across all dimensions */
  balanced: () => new CareerSimilarityEngine(DEFAULT_WEIGHTS),

  /** Prioritizes skill transferability */
  skillFocused: () => new CareerSimilarityEngine({
    skillOverlap: 0.40,
    psychologyOverlap: 0.15,
    workStyleOverlap: 0.15,
    educationOverlap: 0.15,
    industryOverlap: 0.15,
  }),

  /** Prioritizes work environment fit */
  lifestyleFocused: () => new CareerSimilarityEngine({
    skillOverlap: 0.15,
    psychologyOverlap: 0.15,
    workStyleOverlap: 0.40,
    educationOverlap: 0.10,
    industryOverlap: 0.20,
  }),

  /** Prioritizes industry and future outlook */
  futureFocused: () => new CareerSimilarityEngine({
    skillOverlap: 0.15,
    psychologyOverlap: 0.10,
    workStyleOverlap: 0.15,
    educationOverlap: 0.15,
    industryOverlap: 0.45,
  }),

  /** Prioritizes psychological fit */
  psychologyFocused: () => new CareerSimilarityEngine({
    skillOverlap: 0.15,
    psychologyOverlap: 0.45,
    workStyleOverlap: 0.20,
    educationOverlap: 0.10,
    industryOverlap: 0.10,
  }),
};

// ============================================================================
// EXPORTS
// ============================================================================

export { DEFAULT_WEIGHTS };
