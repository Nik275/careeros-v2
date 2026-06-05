/**
 * CareerOS Career Expansion Engine V1
 *
 * Automates scaling from 25 to 150+ careers without manual relationship definition.
 * Generates career relationships, skill relationships, transition candidates,
 * similarity scores, and optionality estimates automatically.
 *
 * Features:
 * - Automatic career similarity detection
 * - Adjacent career suggestion
 * - Transition candidate generation
 * - Expansion confidence scoring
 * - Career coverage analysis
 * - Graph density analysis
 *
 * Designed for 1000+ careers with explainable, deterministic generation.
 *
 * @module intelligence/career-expansion-engine
 * @version 1.0.0
 */

import type { CareerSlug } from '../../domains/career/Career.js';
import type {
  SkillTaxonomyV1,
  CareerSkillProfile,
  SkillId,
  SkillCategory,
} from '../skill-taxonomy/SkillTaxonomyV1.js';
import {
  calculateSkillOverlap,
  calculateSkillSimilarity,
  type SkillTaxonomyConfig,
  DEFAULT_SKILL_TAXONOMY_CONFIG,
} from '../skill-taxonomy/SkillTaxonomyV1.js';
import type {
  CareerTransitionEdge,
  RelationshipType,
} from '../career-graph-v2/CareerGraphV2.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifier for expansion analyses
 */
export type ExpansionAnalysisId = string;

/**
 * Career similarity result
 */
export interface CareerSimilarity {
  /** Source career */
  sourceCareerId: CareerSlug;

  /** Similar career */
  targetCareerId: CareerSlug;

  /** Overall similarity score (0-100) */
  similarityScore: number;

  /** Similarity rating */
  rating: 'identical' | 'very-high' | 'high' | 'moderate' | 'low' | 'minimal';

  /** Skill-based similarity */
  skillSimilarity: {
    score: number;
    commonSkills: number;
    skillOverlapPercentage: number;
    categoryMatch: number;
  };

  /** Industry/domain similarity */
  industrySimilarity: {
    score: number;
    sameIndustry: boolean;
    relatedIndustries: boolean;
    industryDistance: number; // 0 = same, 1 = unrelated
  };

  /** Education similarity */
  educationSimilarity: {
    score: number;
    sameEducationLevel: boolean;
    sameEducationField: boolean;
    educationOverlap: number;
  };

  /** Work style similarity */
  workStyleSimilarity: {
    score: number;
    workEnvironmentMatch: number;
    collaborationStyleMatch: number;
    autonomyLevelMatch: number;
  };

  /** Explanation of similarity */
  explanation: string;

  /** Confidence in similarity assessment */
  confidence: number;
}

/**
 * Adjacent career suggestion
 */
export interface AdjacentCareer {
  /** Career identifier */
  careerId: CareerSlug;

  /** Relationship to source career */
  relationship: 'adjacent' | 'progression' | 'specialization' | 'pivot' | 'cross-domain';

  /** Strength of adjacency (0-100) */
  adjacencyScore: number;

  /** Primary basis for adjacency */
  basis: 'skills' | 'industry' | 'education' | 'work-style' | 'hybrid';

  /** Skill overlap details */
  skillOverlap: {
    percentage: number;
    transferableSkills: SkillId[];
    missingSkills: SkillId[];
  };

  /** Transition difficulty estimate */
  transitionDifficulty: number;

  /** Estimated transition time (months) */
  estimatedTransitionMonths: number;

  /** Explanation */
  explanation: string;
}

/**
 * Generated transition candidate
 */
export interface TransitionCandidate {
  /** Unique candidate identifier */
  id: string;

  /** Source career */
  sourceCareerId: CareerSlug;

  /** Target career */
  targetCareerId: CareerSlug;

  /** Suggested relationship type */
  relationshipType: RelationshipType;

  /** Confidence in this transition (0-100) */
  confidence: number;

  /** Calculated metrics */
  metrics: {
    skillOverlap: number;
    transitionProbability: number;
    transitionDifficulty: number;
    estimatedTimeMonths: number;
    estimatedCost: number;
  };

  /** Supporting evidence */
  evidence: {
    sharedSkillCount: number;
    transferableSkillValue: number;
    industryRelatedness: number;
    educationCompatibility: number;
  };

  /** Human-readable reasoning */
  reasoning: string[];

  /** Whether this candidate should be added to graph */
  recommendation: 'strong' | 'moderate' | 'weak' | 'reject';
}

/**
 * Expansion confidence assessment
 */
export interface ExpansionConfidence {
  /** Overall confidence score (0-100) */
  overallConfidence: number;

  /** Confidence by dimension */
  dimensions: {
    skillData: number;
    industryData: number;
    educationData: number;
    transitionData: number;
    similarityData: number;
  };

  /** Data quality indicators */
  dataQuality: {
    completeSkillProfiles: number;
    partialSkillProfiles: number;
    missingSkillProfiles: number;
    averageSkillsPerCareer: number;
    taxonomyCoverage: number;
  };

  /** Confidence by relationship type */
  byRelationshipType: Record<RelationshipType, number>;

  /** Risk factors */
  riskFactors: string[];

  /** Recommendations to improve confidence */
  recommendations: string[];
}

/**
 * Career coverage analysis
 */
export interface CareerCoverageAnalysis {
  /** Analysis identifier */
  id: string;

  /** Timestamp */
  generatedAt: number;

  /** Coverage by industry/domain */
  byIndustry: Array<{
    industry: string;
    coverage: 'comprehensive' | 'good' | 'partial' | 'weak' | 'missing';
    careerCount: number;
    targetCareerCount: number;
    gapPercentage: number;
    missingCareers: string[];
  }>;

  /** Coverage by skill category */
  bySkillCategory: Record<SkillCategory, {
    coverage: number; // 0-100
    representativeCareers: CareerSlug[];
    gaps: string[];
  }>;

  /** Coverage by education level */
  byEducationLevel: Array<{
    level: string;
    coverage: number;
    careerCount: number;
    examples: CareerSlug[];
  }>;

  /** Geographic coverage (for India focus) */
  geographicCoverage: {
    indiaSpecific: number; // 0-100
    globalApplicable: number;
    nriRelevant: number;
  };

  /** Overall coverage metrics */
  overall: {
    totalCareers: number;
    targetCareers: number;
    coveragePercentage: number;
    criticalGaps: string[];
    priorityAdditions: string[];
  };

  /** Recommendations for expansion */
  expansionRecommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    suggestedCareers: string[];
    rationale: string;
  }>;
}

/**
 * Graph density analysis
 */
export interface GraphDensityAnalysis {
  /** Analysis identifier */
  id: string;

  /** Timestamp */
  generatedAt: number;

  /** Node statistics */
  nodes: {
    total: number;
    withSkillProfiles: number;
    withFullProfiles: number;
    isolated: number; // No connections
    weaklyConnected: number; // < 3 connections
    wellConnected: number; // 3-10 connections
    highlyConnected: number; // > 10 connections
  };

  /** Edge statistics */
  edges: {
    total: number;
    byType: Record<RelationshipType, number>;
    averagePerCareer: number;
    medianPerCareer: number;
    maxPerCareer: number;
    minPerCareer: number;
  };

  /** Connectivity metrics */
  connectivity: {
    density: number; // 0-1, actual edges / possible edges
    averageClustering: number;
    averagePathLength: number;
    connectedComponents: number;
    largestComponentSize: number;
    isolatedComponents: number;
  };

  /** Cluster analysis */
  clusters: Array<{
    id: string;
    careers: CareerSlug[];
    size: number;
    internalDensity: number;
    externalConnections: number;
    dominantCategory: string;
  }>;

  /** Quality indicators */
  quality: {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    strengths: string[];
    weaknesses: string[];
  };

  /** Missing connections analysis */
  missingConnections: {
    potentialEdges: number;
    highConfidenceMissing: number;
    mediumConfidenceMissing: number;
    suggestedNewEdges: TransitionCandidate[];
  };
}

/**
 * Career expansion candidate
 */
export interface CareerExpansionCandidate {
  /** Proposed career identifier */
  proposedCareerId: CareerSlug;

  /** Proposed career name */
  proposedName: string;

  /** Suggested category/industry */
  category: string;

  /** Basis for suggestion */
  basis: {
    type: 'skill-gap' | 'industry-gap' | 'similarity-cluster' | 'transition-hub' | 'user-demand';
    evidence: string[];
    relatedExistingCareers: CareerSlug[];
  };

  /** Estimated similarity to existing careers */
  estimatedSimilarities: Array<{
    careerId: CareerSlug;
    estimatedScore: number;
    basis: string;
  }>;

  /** Suggested skill profile (inferred) */
  suggestedSkillProfile: {
    requiredSkills: SkillId[];
    skillCategories: SkillCategory[];
    estimatedComplexity: number;
  };

  /** Priority for addition */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Confidence in suggestion */
  confidence: number;

  /** Rationale */
  rationale: string;
}

/**
 * Expansion engine configuration
 */
export interface CareerExpansionEngineConfig {
  /** Minimum similarity threshold for similar careers */
  minSimilarityThreshold: number;

  /** Minimum adjacency score for suggestions */
  minAdjacencyThreshold: number;

  /** Minimum confidence for transition candidates */
  minTransitionConfidence: number;

  /** Maximum careers to return in similarity queries */
  maxSimilarCareers: number;

  /** Maximum transition candidates to generate */
  maxTransitionCandidates: number;

  /** Similarity weights */
  similarityWeights: {
    skills: number;
    industry: number;
    education: number;
    workStyle: number;
  };

  /** Taxonomy configuration */
  taxonomyConfig: SkillTaxonomyConfig;
}

/**
 * Expansion result summary
 */
export interface ExpansionResult {
  /** Expansion identifier */
  id: string;

  /** Timestamp */
  generatedAt: number;

  /** New careers suggested */
  newCareers: CareerExpansionCandidate[];

  /** New transitions suggested */
  newTransitions: TransitionCandidate[];

  /** Similarity mappings discovered */
  similarities: CareerSimilarity[];

  /** Coverage improvement */
  coverageImprovement: {
    before: number;
    after: number;
    newIndustriesCovered: string[];
    newSkillCategoriesCovered: SkillCategory[];
  };

  /** Quality metrics */
  quality: {
    averageConfidence: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
  };

  /** Recommendations */
  recommendations: string[];
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CAREER_EXPANSION_CONFIG: CareerExpansionEngineConfig = {
  minSimilarityThreshold: 40,
  minAdjacencyThreshold: 35,
  minTransitionConfidence: 50,
  maxSimilarCareers: 10,
  maxTransitionCandidates: 20,
  similarityWeights: {
    skills: 0.45,
    industry: 0.25,
    education: 0.20,
    workStyle: 0.10,
  },
  taxonomyConfig: DEFAULT_SKILL_TAXONOMY_CONFIG,
};

// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Find careers similar to a given career
 *
 * Automatically identifies similar careers based on:
 * - Skill overlap
 * - Industry/domain alignment
 * - Education requirements
 * - Work style compatibility
 */
export function findSimilarCareers(
  taxonomy: SkillTaxonomyV1,
  sourceCareerId: CareerSlug,
  candidateCareers: CareerSlug[],
  config: CareerExpansionEngineConfig = DEFAULT_CAREER_EXPANSION_CONFIG
): CareerSimilarity[] {
  const sourceProfile = taxonomy.getCareerProfile(sourceCareerId);
  if (!sourceProfile) {
    throw new Error(`Career profile not found: ${sourceCareerId}`);
  }

  const similarities: CareerSimilarity[] = [];

  for (const targetId of candidateCareers) {
    if (targetId === sourceCareerId) continue;

    const targetProfile = taxonomy.getCareerProfile(targetId);
    if (!targetProfile) continue;

    const similarity = calculateCareerSimilarity(
      taxonomy,
      sourceCareerId,
      targetId,
      sourceProfile,
      targetProfile,
      config
    );

    if (similarity.similarityScore >= config.minSimilarityThreshold) {
      similarities.push(similarity);
    }
  }

  return similarities
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, config.maxSimilarCareers);
}

function calculateCareerSimilarity(
  taxonomy: SkillTaxonomyV1,
  sourceId: CareerSlug,
  targetId: CareerSlug,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile,
  config: CareerExpansionEngineConfig
): CareerSimilarity {
  const w = config.similarityWeights;

  // Skill similarity
  const skillOverlap = calculateSkillOverlap(sourceProfile, targetProfile);
  const skillSimilarityScore = calculateSkillSimilarity(taxonomy, sourceProfile, targetProfile);

  const skillSim = {
    score: skillSimilarityScore,
    commonSkills: skillOverlap.commonSkills.length,
    skillOverlapPercentage: skillOverlap.overlapScore,
    categoryMatch: calculateCategoryMatch(sourceProfile, targetProfile),
  };

  // Industry similarity (simplified - would use industry taxonomy)
  const industrySim = calculateIndustrySimilarity(sourceProfile, targetProfile);

  // Education similarity
  const educationSim = calculateEducationSimilarity(sourceProfile, targetProfile);

  // Work style similarity (simplified)
  const workStyleSim = calculateWorkStyleSimilarity(sourceProfile, targetProfile);

  // Weighted composite
  const similarityScore = Math.round(
    skillSim.score * w.skills +
    industrySim.score * w.industry +
    educationSim.score * w.education +
    workStyleSim.score * w.workStyle
  );

  // Determine rating
  let rating: CareerSimilarity['rating'];
  if (similarityScore >= 95) rating = 'identical';
  else if (similarityScore >= 80) rating = 'very-high';
  else if (similarityScore >= 65) rating = 'high';
  else if (similarityScore >= 50) rating = 'moderate';
  else if (similarityScore >= 35) rating = 'low';
  else rating = 'minimal';

  // Calculate confidence
  const confidence = calculateSimilarityConfidence(
    skillSim,
    industrySim,
    educationSim,
    workStyleSim
  );

  // Generate explanation
  const explanation = generateSimilarityExplanation(
    sourceId,
    targetId,
    similarityScore,
    rating,
    skillSim,
    industrySim
  );

  return {
    sourceCareerId: sourceId,
    targetCareerId: targetId,
    similarityScore,
    rating,
    skillSimilarity: skillSim,
    industrySimilarity: industrySim,
    educationSimilarity: educationSim,
    workStyleSimilarity: workStyleSim,
    explanation,
    confidence,
  };
}

function calculateCategoryMatch(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): number {
  const sourceCategories = new Set(sourceProfile.primaryCategories);
  const targetCategories = new Set(targetProfile.primaryCategories);

  let matchCount = 0;
  for (const cat of sourceCategories) {
    if (targetCategories.has(cat)) matchCount++;
  }

  const total = Math.max(sourceCategories.size, targetCategories.size);
  return total > 0 ? Math.round((matchCount / total) * 100) : 0;
}

function calculateIndustrySimilarity(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): CareerSimilarity['industrySimilarity'] {
  // Simplified industry detection from skill categories
  const sourceIndustry = detectIndustry(sourceProfile);
  const targetIndustry = detectIndustry(targetProfile);

  const sameIndustry = sourceIndustry === targetIndustry;
  const relatedIndustries = areIndustriesRelated(sourceIndustry, targetIndustry);

  let score = 0;
  if (sameIndustry) score = 100;
  else if (relatedIndustries) score = 60;
  else score = 20;

  // Adjust based on domain skills overlap
  const domainSkillsOverlap = calculateDomainSkillsOverlap(sourceProfile, targetProfile);
  score = Math.round(score * 0.7 + domainSkillsOverlap * 0.3);

  return {
    score,
    sameIndustry,
    relatedIndustries,
    industryDistance: sameIndustry ? 0 : relatedIndustries ? 0.5 : 1,
  };
}

function detectIndustry(profile: CareerSkillProfile): string {
  // Simple heuristic based on primary categories
  if (profile.primaryCategories.includes('technical')) return 'technology';
  if (profile.primaryCategories.includes('business')) return 'business';
  if (profile.primaryCategories.includes('creative')) return 'creative';
  if (profile.primaryCategories.includes('analytical')) return 'research';
  return 'general';
}

function areIndustriesRelated(industry1: string, industry2: string): boolean {
  if (industry1 === industry2) return true;

  const relatedPairs: Record<string, string[]> = {
    'technology': ['business', 'research'],
    'business': ['technology', 'general'],
    'creative': ['technology', 'general'],
    'research': ['technology', 'business'],
  };

  return relatedPairs[industry1]?.includes(industry2) ||
         relatedPairs[industry2]?.includes(industry1) ||
         false;
}

function calculateDomainSkillsOverlap(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): number {
  const sourceDomainSkills = sourceProfile.requiredSkills
    .filter(s => s.skillId.startsWith('domain-') || s.skillId.includes('industry'));
  const targetDomainSkills = targetProfile.requiredSkills
    .filter(s => s.skillId.startsWith('domain-') || s.skillId.includes('industry'));

  if (sourceDomainSkills.length === 0 || targetDomainSkills.length === 0) return 50;

  const sourceIds = new Set(sourceDomainSkills.map(s => s.skillId));
  const targetIds = new Set(targetDomainSkills.map(s => s.skillId));

  let overlap = 0;
  for (const id of sourceIds) {
    if (targetIds.has(id)) overlap++;
  }

  return Math.round((overlap / Math.max(sourceIds.size, targetIds.size)) * 100);
}

function calculateEducationSimilarity(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): CareerSimilarity['educationSimilarity'] {
  // Simplified - would use actual education requirements
  const sourceComplexity = sourceProfile.complexityScore;
  const targetComplexity = targetProfile.complexityScore;

  const complexityDiff = Math.abs(sourceComplexity - targetComplexity);
  const complexityMatch = Math.max(0, 100 - complexityDiff);

  // Category-based education similarity
  const categoryMatch = calculateCategoryMatch(sourceProfile, targetProfile);

  const score = Math.round(complexityMatch * 0.6 + categoryMatch * 0.4);

  return {
    score,
    sameEducationLevel: complexityDiff < 20,
    sameEducationField: categoryMatch > 60,
    educationOverlap: categoryMatch,
  };
}

function calculateWorkStyleSimilarity(
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): CareerSimilarity['workStyleSimilarity'] {
  // Simplified work style inference from skill categories
  const sourceStyle = inferWorkStyle(sourceProfile);
  const targetStyle = inferWorkStyle(targetProfile);

  const environmentMatch = sourceStyle.environment === targetStyle.environment ? 100 :
    sourceStyle.environment === 'hybrid' || targetStyle.environment === 'hybrid' ? 60 : 30;

  const collaborationMatch = 100 - Math.abs(sourceStyle.collaboration - targetStyle.collaboration) * 20;
  const autonomyMatch = 100 - Math.abs(sourceStyle.autonomy - targetStyle.autonomy) * 20;

  const score = Math.round(
    environmentMatch * 0.4 +
    collaborationMatch * 0.3 +
    autonomyMatch * 0.3
  );

  return {
    score,
    workEnvironmentMatch: environmentMatch,
    collaborationStyleMatch: collaborationMatch,
    autonomyLevelMatch: autonomyMatch,
  };
}

function inferWorkStyle(profile: CareerSkillProfile): {
  environment: 'office' | 'remote' | 'hybrid' | 'field';
  collaboration: number; // 1-5
  autonomy: number; // 1-5
} {
  // Heuristic based on skill categories
  const hasTechnical = profile.primaryCategories.includes('technical');
  const hasLeadership = profile.primaryCategories.includes('leadership');
  const hasCreative = profile.primaryCategories.includes('creative');

  let environment: 'office' | 'remote' | 'hybrid' | 'field' = 'office';
  if (hasTechnical && !hasLeadership) environment = 'remote';
  if (hasCreative) environment = 'hybrid';

  const collaboration = hasLeadership ? 4 : hasTechnical ? 2 : 3;
  const autonomy = hasTechnical ? 4 : hasLeadership ? 3 : 3;

  return { environment, collaboration, autonomy };
}

function calculateSimilarityConfidence(
  skillSim: CareerSimilarity['skillSimilarity'],
  industrySim: CareerSimilarity['industrySimilarity'],
  educationSim: CareerSimilarity['educationSimilarity'],
  workStyleSim: CareerSimilarity['workStyleSimilarity']
): number {
  // Higher confidence with more data points
  let confidence = 50;

  // Boost for skill data quality
  if (skillSim.commonSkills >= 5) confidence += 20;
  else if (skillSim.commonSkills >= 3) confidence += 10;

  // Boost for clear industry signal
  if (industrySim.sameIndustry) confidence += 15;
  else if (industrySim.relatedIndustries) confidence += 5;

  // Boost for education clarity
  if (educationSim.sameEducationField) confidence += 10;

  return Math.min(100, confidence);
}

function generateSimilarityExplanation(
  sourceId: CareerSlug,
  targetId: CareerSlug,
  score: number,
  rating: string,
  skillSim: CareerSimilarity['skillSimilarity'],
  industrySim: CareerSimilarity['industrySimilarity']
): string {
  const parts: string[] = [];

  parts.push(`${targetId} is ${rating.replace('-', ' ')} similar to ${sourceId} (${score}% match).`);

  if (skillSim.commonSkills > 0) {
    parts.push(`They share ${skillSim.commonSkills} skills with ${skillSim.skillOverlapPercentage}% skill overlap.`);
  }

  if (industrySim.sameIndustry) {
    parts.push('Both careers are in the same industry.');
  } else if (industrySim.relatedIndustries) {
    parts.push('The careers are in related industries.');
  }

  if (skillSim.categoryMatch >= 70) {
    parts.push('Strong alignment in core skill categories.');
  }

  return parts.join(' ');
}

// ============================================================================
// ADJACENCY FUNCTIONS
// ============================================================================

/**
 * Suggest adjacent careers based on skill, industry, and education overlap
 */
export function suggestAdjacentCareers(
  taxonomy: SkillTaxonomyV1,
  sourceCareerId: CareerSlug,
  candidatePool: CareerSlug[],
  config: CareerExpansionEngineConfig = DEFAULT_CAREER_EXPANSION_CONFIG
): AdjacentCareer[] {
  const sourceProfile = taxonomy.getCareerProfile(sourceCareerId);
  if (!sourceProfile) {
    throw new Error(`Career profile not found: ${sourceCareerId}`);
  }

  const adjacent: AdjacentCareer[] = [];

  for (const candidateId of candidatePool) {
    if (candidateId === sourceCareerId) continue;

    const candidateProfile = taxonomy.getCareerProfile(candidateId);
    if (!candidateProfile) continue;

    const adjacency = calculateAdjacency(
      taxonomy,
      sourceCareerId,
      candidateId,
      sourceProfile,
      candidateProfile
    );

    if (adjacency.adjacencyScore >= config.minAdjacencyThreshold) {
      adjacent.push(adjacency);
    }
  }

  return adjacent.sort((a, b) => b.adjacencyScore - a.adjacencyScore);
}

function calculateAdjacency(
  taxonomy: SkillTaxonomyV1,
  sourceId: CareerSlug,
  targetId: CareerSlug,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): AdjacentCareer {
  // Calculate skill overlap
  const skillOverlap = calculateSkillOverlap(sourceProfile, targetProfile);

  // Determine relationship type based on overlap and characteristics
  let relationship: AdjacentCareer['relationship'];
  if (skillOverlap.overlapScore >= 70) {
    relationship = 'adjacent';
  } else if (skillOverlap.overlapScore >= 50 && isProgression(sourceProfile, targetProfile)) {
    relationship = 'progression';
  } else if (skillOverlap.overlapScore >= 40 && isSpecialization(sourceProfile, targetProfile)) {
    relationship = 'specialization';
  } else if (skillOverlap.overlapScore >= 25) {
    relationship = 'pivot';
  } else {
    relationship = 'cross-domain';
  }

  // Determine basis
  let basis: AdjacentCareer['basis'] = 'hybrid';
  const skillWeight = skillOverlap.overlapScore;
  const industryWeight = calculateIndustrySimilarity(sourceProfile, targetProfile).score;

  if (skillWeight > industryWeight + 20) basis = 'skills';
  else if (industryWeight > skillWeight + 20) basis = 'industry';

  // Calculate transition difficulty
  const missingSkills = targetProfile.requiredSkills.filter(
    req => !sourceProfile.requiredSkills.some(s => s.skillId === req.skillId) &&
           !sourceProfile.optionalSkills.some(s => s.skillId === req.skillId)
  );

  const transitionDifficulty = Math.min(100, missingSkills.length * 8 + 20);

  // Estimate transition time
  const estimatedTransitionMonths = Math.round(
    missingSkills.reduce((sum, s) => {
      const skill = taxonomy.getSkill(s.skillId);
      return sum + (skill?.timeToAcquireMonths || 6);
    }, 0) / Math.max(1, missingSkills.length * 0.6) // Parallel learning factor
  );

  // Generate explanation
  const explanation = generateAdjacencyExplanation(
    sourceId,
    targetId,
    relationship,
    basis,
    skillOverlap,
    missingSkills.length
  );

  return {
    careerId: targetId,
    relationship,
    adjacencyScore: Math.round(skillOverlap.overlapScore * 0.7 + (100 - transitionDifficulty) * 0.3),
    basis,
    skillOverlap: {
      percentage: skillOverlap.overlapScore,
      transferableSkills: skillOverlap.commonSkills.map(s => s.skillId),
      missingSkills: missingSkills.map(s => s.skillId),
    },
    transitionDifficulty,
    estimatedTransitionMonths,
    explanation,
  };
}

function isProgression(source: CareerSkillProfile, target: CareerSkillProfile): boolean {
  // Heuristic: target has higher complexity or more leadership
  return target.complexityScore > source.complexityScore + 10 ||
    (target.primaryCategories.includes('leadership') && !source.primaryCategories.includes('leadership'));
}

function isSpecialization(source: CareerSkillProfile, target: CareerSkillProfile): boolean {
  // Heuristic: same primary category but deeper skills
  const commonCategories = source.primaryCategories.filter(c => target.primaryCategories.includes(c));
  return commonCategories.length > 0 && target.complexityScore > source.complexityScore;
}

function generateAdjacencyExplanation(
  sourceId: CareerSlug,
  targetId: CareerSlug,
  relationship: AdjacentCareer['relationship'],
  basis: AdjacentCareer['basis'],
  skillOverlap: { overlapScore: number; commonSkills: Array<{ skillId: string }> },
  missingSkillCount: number
): string {
  const parts: string[] = [];

  parts.push(`${targetId} is a ${relationship} career to ${sourceId}.`);

  if (basis === 'skills') {
    parts.push(`Based primarily on ${skillOverlap.overlapScore}% skill overlap.`);
  } else if (basis === 'industry') {
    parts.push(`Based on industry alignment with ${skillOverlap.commonSkills.length} shared skills.`);
  } else {
    parts.push(`Based on combined skill (${skillOverlap.overlapScore}%) and industry alignment.`);
  }

  if (missingSkillCount > 0) {
    parts.push(`Requires acquiring ${missingSkillCount} new skills.`);
  } else {
    parts.push('Skills transfer directly with minimal new learning.');
  }

  return parts.join(' ');
}

// ============================================================================
// TRANSITION CANDIDATE FUNCTIONS
// ============================================================================

/**
 * Generate transition candidates between careers
 *
 * Automatically suggests graph edges based on skill analysis
 */
export function generateTransitionCandidates(
  taxonomy: SkillTaxonomyV1,
  sourceCareerId: CareerSlug,
  targetCandidates: CareerSlug[],
  config: CareerExpansionEngineConfig = DEFAULT_CAREER_EXPANSION_CONFIG
): TransitionCandidate[] {
  const sourceProfile = taxonomy.getCareerProfile(sourceCareerId);
  if (!sourceProfile) {
    throw new Error(`Career profile not found: ${sourceCareerId}`);
  }

  const candidates: TransitionCandidate[] = [];

  for (const targetId of targetCandidates) {
    if (targetId === sourceCareerId) continue;

    const targetProfile = taxonomy.getCareerProfile(targetId);
    if (!targetProfile) continue;

    const candidate = buildTransitionCandidate(
      taxonomy,
      sourceCareerId,
      targetId,
      sourceProfile,
      targetProfile
    );

    if (candidate.confidence >= config.minTransitionConfidence) {
      candidates.push(candidate);
    }
  }

  return candidates
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.maxTransitionCandidates);
}

function buildTransitionCandidate(
  taxonomy: SkillTaxonomyV1,
  sourceId: CareerSlug,
  targetId: CareerSlug,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): TransitionCandidate {
  // Calculate skill overlap
  const skillOverlap = calculateSkillOverlap(sourceProfile, targetProfile);

  // Determine relationship type
  const relationshipType = determineRelationshipType(
    skillOverlap.overlapScore,
    sourceProfile,
    targetProfile
  );

  // Calculate metrics
  const sharedSkillCount = skillOverlap.commonSkills.length;

  // Calculate transferable skill value
  const transferableValue = skillOverlap.commonSkills.reduce((sum, s) => {
    return sum + Math.min(s.importanceInSource, s.importanceInTarget);
  }, 0) / Math.max(1, sharedSkillCount);

  // Calculate missing skills and difficulty
  const missingSkills = targetProfile.requiredSkills.filter(
    req => !sourceProfile.requiredSkills.some(s => s.skillId === req.skillId)
  );

  const transitionDifficulty = Math.min(100,
    missingSkills.length * 7 +
    (100 - skillOverlap.overlapScore) * 0.3
  );

  // Calculate transition probability
  const transitionProbability = Math.max(0.1, Math.min(0.9,
    (skillOverlap.overlapScore / 100) * 0.6 +
    (1 - transitionDifficulty / 100) * 0.3 +
    0.1 // Base probability
  ));

  // Estimate time and cost
  const estimatedTimeMonths = Math.round(
    missingSkills.reduce((sum, s) => {
      const skill = taxonomy.getSkill(s.skillId);
      return sum + (skill?.timeToAcquireMonths || 6);
    }, 0) / 2 // Parallel learning
  );

  const estimatedCost = Math.min(100, estimatedTimeMonths * 3 + missingSkills.length * 2);

  // Calculate confidence
  const confidence = calculateTransitionConfidence(
    skillOverlap,
    sharedSkillCount,
    missingSkills.length,
    sourceProfile,
    targetProfile
  );

  // Determine recommendation
  let recommendation: TransitionCandidate['recommendation'];
  if (confidence >= 80 && transitionProbability >= 0.6) {
    recommendation = 'strong';
  } else if (confidence >= 60 && transitionProbability >= 0.4) {
    recommendation = 'moderate';
  } else if (confidence >= 40) {
    recommendation = 'weak';
  } else {
    recommendation = 'reject';
  }

  // Generate reasoning
  const reasoning = generateTransitionReasoning(
    sourceId,
    targetId,
    relationshipType,
    skillOverlap,
    missingSkills.length,
    transitionProbability,
    transitionDifficulty
  );

  return {
    id: `${sourceId}→${targetId}`,
    sourceCareerId: sourceId,
    targetCareerId: targetId,
    relationshipType,
    confidence,
    metrics: {
      skillOverlap: skillOverlap.overlapScore,
      transitionProbability,
      transitionDifficulty,
      estimatedTimeMonths,
      estimatedCost,
    },
    evidence: {
      sharedSkillCount,
      transferableSkillValue: Math.round(transferableValue),
      industryRelatedness: calculateIndustrySimilarity(sourceProfile, targetProfile).score,
      educationCompatibility: calculateEducationSimilarity(sourceProfile, targetProfile).score,
    },
    reasoning,
    recommendation,
  };
}

function determineRelationshipType(
  overlapScore: number,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): RelationshipType {
  if (overlapScore >= 75) return 'adjacent';
  if (overlapScore >= 55 && isProgression(sourceProfile, targetProfile)) return 'progression';
  if (overlapScore >= 45 && isSpecialization(sourceProfile, targetProfile)) return 'specialization';
  if (overlapScore >= 30) return 'pivot';
  if (overlapScore >= 15) return 'cross-domain';
  return 'foundational';
}

function calculateTransitionConfidence(
  skillOverlap: { overlapScore: number; commonSkills: Array<{ skillId: string }> },
  sharedSkillCount: number,
  missingSkillCount: number,
  sourceProfile: CareerSkillProfile,
  targetProfile: CareerSkillProfile
): number {
  let confidence = 50;

  // Boost for high skill overlap
  if (skillOverlap.overlapScore >= 60) confidence += 25;
  else if (skillOverlap.overlapScore >= 40) confidence += 15;
  else if (skillOverlap.overlapScore >= 20) confidence += 5;

  // Boost for sufficient data
  if (sharedSkillCount >= 5) confidence += 15;
  else if (sharedSkillCount >= 3) confidence += 8;

  // Penalty for too many missing skills
  if (missingSkillCount > 8) confidence -= 15;
  else if (missingSkillCount > 5) confidence -= 8;

  // Boost for complete profiles
  if (sourceProfile.requiredSkills.length >= 5 && targetProfile.requiredSkills.length >= 5) {
    confidence += 10;
  }

  return Math.max(20, Math.min(95, confidence));
}

function generateTransitionReasoning(
  sourceId: CareerSlug,
  targetId: CareerSlug,
  relationshipType: RelationshipType,
  skillOverlap: { overlapScore: number; commonSkills: Array<{ skillId: string }> },
  missingSkillCount: number,
  transitionProbability: number,
  transitionDifficulty: number
): string[] {
  const reasoning: string[] = [];

  reasoning.push(`Identified as ${relationshipType} transition based on ${skillOverlap.overlapScore}% skill overlap.`);

  if (skillOverlap.commonSkills.length > 0) {
    reasoning.push(`${skillOverlap.commonSkills.length} skills transfer between ${sourceId} and ${targetId}.`);
  }

  if (missingSkillCount > 0) {
    reasoning.push(`${missingSkillCount} skills need to be acquired for this transition.`);
  }

  reasoning.push(`Estimated ${Math.round(transitionProbability * 100)}% success probability with ${transitionDifficulty}/100 difficulty.`);

  if (transitionDifficulty <= 30) {
    reasoning.push('Low difficulty indicates natural career progression.');
  } else if (transitionDifficulty >= 70) {
    reasoning.push('High difficulty suggests significant career change requiring substantial preparation.');
  }

  return reasoning;
}

// ============================================================================
// CONFIDENCE FUNCTIONS
// ============================================================================

/**
 * Calculate confidence in expansion data
 */
export function calculateExpansionConfidence(
  taxonomy: SkillTaxonomyV1,
  careerIds: CareerSlug[]
): ExpansionConfidence {
  const dimensions = {
    skillData: 0,
    industryData: 0,
    educationData: 0,
    transitionData: 0,
    similarityData: 0,
  };

  let completeProfiles = 0;
  let partialProfiles = 0;
  let missingProfiles = 0;
  let totalSkills = 0;

  for (const careerId of careerIds) {
    const profile = taxonomy.getCareerProfile(careerId);

    if (!profile) {
      missingProfiles++;
      continue;
    }

    const skillCount = profile.requiredSkills.length + profile.optionalSkills.length;
    totalSkills += skillCount;

    if (skillCount >= 8 && profile.primaryCategories.length > 0) {
      completeProfiles++;
    } else if (skillCount >= 4) {
      partialProfiles++;
    } else {
      missingProfiles++;
    }
  }

  // Calculate dimension scores
  const total = careerIds.length;
  dimensions.skillData = Math.round((completeProfiles / total) * 80 + (partialProfiles / total) * 40);
  dimensions.industryData = Math.round((completeProfiles / total) * 70);
  dimensions.educationData = Math.round((completeProfiles / total) * 60);
  dimensions.transitionData = Math.round((completeProfiles / total) * 75);
  dimensions.similarityData = Math.round((completeProfiles + partialProfiles) / total * 70);

  // Calculate overall
  const overallConfidence = Math.round(
    dimensions.skillData * 0.35 +
    dimensions.industryData * 0.20 +
    dimensions.educationData * 0.15 +
    dimensions.transitionData * 0.20 +
    dimensions.similarityData * 0.10
  );

  // Identify risk factors
  const riskFactors: string[] = [];
  if (missingProfiles > total * 0.2) {
    riskFactors.push(`${missingProfiles} careers lack skill profiles`);
  }
  if (completeProfiles < total * 0.5) {
    riskFactors.push('Less than 50% complete career profiles');
  }
  if (totalSkills / total < 5) {
    riskFactors.push('Low average skills per career');
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (missingProfiles > 0) {
    recommendations.push(`Add skill profiles for ${missingProfiles} careers`);
  }
  if (partialProfiles > completeProfiles) {
    recommendations.push('Expand partial skill profiles to complete');
  }
  if (totalSkills / total < 8) {
    recommendations.push('Increase average skills per career to 8+');
  }

  // By relationship type (placeholder - would analyze actual edges)
  const byRelationshipType: Record<RelationshipType, number> = {
    adjacent: overallConfidence,
    progression: overallConfidence - 5,
    specialization: overallConfidence - 10,
    pivot: overallConfidence - 15,
    'cross-domain': overallConfidence - 20,
    foundational: overallConfidence - 10,
  };

  return {
    overallConfidence,
    dimensions,
    dataQuality: {
      completeSkillProfiles: completeProfiles,
      partialSkillProfiles: partialProfiles,
      missingSkillProfiles: missingProfiles,
      averageSkillsPerCareer: Math.round(totalSkills / total),
      taxonomyCoverage: Math.round((completeProfiles + partialProfiles) / total * 100),
    },
    byRelationshipType,
    riskFactors,
    recommendations,
  };
}

// ============================================================================
// COVERAGE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze career coverage across industries and categories
 */
export function careerCoverageAnalysis(
  taxonomy: SkillTaxonomyV1,
  existingCareers: CareerSlug[],
  targetIndustries: string[]
): CareerCoverageAnalysis {
  const byIndustry: CareerCoverageAnalysis['byIndustry'] = [];
  const bySkillCategory: CareerCoverageAnalysis['bySkillCategory'] = {
    technical: { coverage: 0, representativeCareers: [], gaps: [] },
    analytical: { coverage: 0, representativeCareers: [], gaps: [] },
    creative: { coverage: 0, representativeCareers: [], gaps: [] },
    business: { coverage: 0, representativeCareers: [], gaps: [] },
    leadership: { coverage: 0, representativeCareers: [], gaps: [] },
    communication: { coverage: 0, representativeCareers: [], gaps: [] },
    domain: { coverage: 0, representativeCareers: [], gaps: [] },
  };

  // Analyze by industry
  for (const industry of targetIndustries) {
    const careersInIndustry = existingCareers.filter(id => {
      const profile = taxonomy.getCareerProfile(id);
      return profile && detectIndustry(profile) === industry;
    });

    // Estimate target count (simplified)
    const targetCount = 15; // Assume 15 careers per industry for comprehensive coverage
    const gapPercentage = Math.round((1 - careersInIndustry.length / targetCount) * 100);

    let coverage: CareerCoverageAnalysis['byIndustry'][0]['coverage'];
    if (gapPercentage <= 10) coverage = 'comprehensive';
    else if (gapPercentage <= 30) coverage = 'good';
    else if (gapPercentage <= 50) coverage = 'partial';
    else if (gapPercentage <= 70) coverage = 'weak';
    else coverage = 'missing';

    byIndustry.push({
      industry,
      coverage,
      careerCount: careersInIndustry.length,
      targetCareerCount: targetCount,
      gapPercentage,
      missingCareers: generateMissingCareers(industry, careersInIndustry.length, targetCount),
    });
  }

  // Analyze by skill category
  for (const category of Object.keys(bySkillCategory) as SkillCategory[]) {
    const careersInCategory = existingCareers.filter(id => {
      const profile = taxonomy.getCareerProfile(id);
      return profile?.primaryCategories.includes(category);
    });

    bySkillCategory[category] = {
      coverage: Math.round((careersInCategory.length / 20) * 100), // Assume 20 is comprehensive
      representativeCareers: careersInCategory.slice(0, 5),
      gaps: careersInCategory.length < 10 ? [`Need more ${category} careers`] : [],
    };
  }

  // Education level analysis (simplified)
  const byEducationLevel: CareerCoverageAnalysis['byEducationLevel'] = [
    { level: 'High School', coverage: 30, careerCount: 3, examples: [] },
    { level: 'Bachelor\'s', coverage: 70, careerCount: 15, examples: [] },
    { level: 'Master\'s', coverage: 50, careerCount: 8, examples: [] },
    { level: 'Doctoral/Professional', coverage: 40, careerCount: 5, examples: [] },
  ];

  // Geographic coverage (India focus)
  const geographicCoverage = {
    indiaSpecific: 75, // Assume most careers are India-relevant
    globalApplicable: 85,
    nriRelevant: 40,
  };

  // Overall metrics
  const totalCareers = existingCareers.length;
  const targetTotal = 150;
  const coveragePercentage = Math.round((totalCareers / targetTotal) * 100);

  const criticalGaps = byIndustry
    .filter(i => i.coverage === 'missing' || i.coverage === 'weak')
    .map(i => i.industry);

  // Generate expansion recommendations
  const expansionRecommendations: CareerCoverageAnalysis['expansionRecommendations'] = [];

  for (const industry of byIndustry) {
    if (industry.coverage === 'missing' || industry.coverage === 'weak') {
      expansionRecommendations.push({
        priority: industry.coverage === 'missing' ? 'critical' : 'high',
        category: industry.industry,
        suggestedCareers: industry.missingCareers.slice(0, 5),
        rationale: `${industry.industry} has only ${industry.careerCount} careers, needs ${industry.targetCareerCount - industry.careerCount} more`,
      });
    }
  }

  return {
    id: `coverage-${Date.now()}`,
    generatedAt: Date.now(),
    byIndustry,
    bySkillCategory,
    byEducationLevel,
    geographicCoverage,
    overall: {
      totalCareers,
      targetCareers: targetTotal,
      coveragePercentage,
      criticalGaps,
      priorityAdditions: criticalGaps.slice(0, 5),
    },
    expansionRecommendations: expansionRecommendations.slice(0, 10),
  };
}

function generateMissingCareers(industry: string, current: number, target: number): string[] {
  const missing: string[] = [];
  const count = Math.min(target - current, 10);

  const templates: Record<string, string[]> = {
    'technology': ['AI Engineer', 'DevOps Engineer', 'Security Analyst', 'Cloud Architect', 'Mobile Developer'],
    'business': ['Operations Manager', 'Business Analyst', 'Supply Chain Manager', 'Risk Analyst', 'Compliance Officer'],
    'healthcare': ['Clinical Researcher', 'Health Informatics', 'Medical Writer', 'Patient Advocate', 'Healthcare Administrator'],
    'finance': ['Quantitative Analyst', 'Financial Planner', 'Risk Manager', 'Investment Associate', 'Credit Analyst'],
    'creative': ['UX Researcher', 'Motion Designer', 'Content Strategist', 'Brand Manager', 'Creative Director'],
    'education': ['Curriculum Developer', 'Education Technologist', 'Student Counselor', 'Academic Advisor', 'Training Manager'],
    'science': ['Research Scientist', 'Lab Manager', 'Field Researcher', 'Data Curator', 'Science Communicator'],
    'general': ['Project Coordinator', 'Administrative Manager', 'Quality Assurance', 'Process Analyst', 'Resource Manager'],
  };

  const suggestions = templates[industry] || templates['general'];
  for (let i = 0; i < count && i < suggestions.length; i++) {
    missing.push(suggestions[i]);
  }

  return missing;
}

// ============================================================================
// GRAPH DENSITY FUNCTIONS
// ============================================================================

/**
 * Analyze graph density and connectivity
 */
export function graphDensityAnalysis(
  taxonomy: SkillTaxonomyV1,
  existingCareers: CareerSlug[],
  existingEdges: CareerTransitionEdge[]
): GraphDensityAnalysis {
  // Node statistics
  const nodesWithProfiles = existingCareers.filter(id => taxonomy.getCareerProfile(id) !== undefined).length;
  const nodesWithFullProfiles = existingCareers.filter(id => {
    const profile = taxonomy.getCareerProfile(id);
    return profile && profile.requiredSkills.length >= 8;
  }).length;

  // Edge statistics by career
  const edgeCounts = new Map<CareerSlug, number>();
  for (const careerId of existingCareers) {
    edgeCounts.set(careerId, 0);
  }

  for (const edge of existingEdges) {
    edgeCounts.set(edge.sourceCareerId, (edgeCounts.get(edge.sourceCareerId) || 0) + 1);
  }

  const edgeCountValues = [...edgeCounts.values()];
  const isolated = edgeCountValues.filter(c => c === 0).length;
  const weaklyConnected = edgeCountValues.filter(c => c >= 1 && c < 3).length;
  const wellConnected = edgeCountValues.filter(c => c >= 3 && c <= 10).length;
  const highlyConnected = edgeCountValues.filter(c => c > 10).length;

  const totalEdges = existingEdges.length;
  const byType: Record<RelationshipType, number> = {
    adjacent: 0,
    progression: 0,
    specialization: 0,
    pivot: 0,
    'cross-domain': 0,
    foundational: 0,
  };

  for (const edge of existingEdges) {
    byType[edge.relationshipType]++;
  }

  const averagePerCareer = edgeCountValues.length > 0
    ? edgeCountValues.reduce((sum, c) => sum + c, 0) / edgeCountValues.length
    : 0;

  const sortedCounts = [...edgeCountValues].sort((a, b) => a - b);
  const medianPerCareer = sortedCounts.length > 0
    ? sortedCounts[Math.floor(sortedCounts.length / 2)]
    : 0;

  // Connectivity metrics
  const n = existingCareers.length;
  const possibleEdges = n * (n - 1); // Directed graph
  const density = possibleEdges > 0 ? totalEdges / possibleEdges : 0;

  // Simplified clustering coefficient
  const averageClustering = calculateClusteringCoefficient(existingEdges, existingCareers);

  // Connected components (simplified)
  const connectedComponents = estimateConnectedComponents(existingEdges, existingCareers);

  // Cluster analysis (simplified)
  const clusters = identifyClusters(existingEdges, existingCareers);

  // Quality assessment
  const qualityScore = calculateGraphQualityScore(
    density,
    averageClustering,
    isolated,
    existingCareers.length
  );

  let qualityRating: GraphDensityAnalysis['quality']['rating'];
  if (qualityScore >= 80) qualityRating = 'excellent';
  else if (qualityScore >= 65) qualityRating = 'good';
  else if (qualityScore >= 50) qualityRating = 'fair';
  else if (qualityScore >= 35) qualityRating = 'poor';
  else qualityRating = 'critical';

  // Missing connections analysis
  const missingConnections = analyzeMissingConnections(
    taxonomy,
    existingCareers,
    existingEdges
  );

  return {
    id: `density-${Date.now()}`,
    generatedAt: Date.now(),
    nodes: {
      total: n,
      withSkillProfiles: nodesWithProfiles,
      withFullProfiles: nodesWithFullProfiles,
      isolated,
      weaklyConnected,
      wellConnected,
      highlyConnected,
    },
    edges: {
      total: totalEdges,
      byType,
      averagePerCareer: Math.round(averagePerCareer * 10) / 10,
      medianPerCareer,
      maxPerCareer: Math.max(...edgeCountValues, 0),
      minPerCareer: Math.min(...edgeCountValues, 0),
    },
    connectivity: {
      density: Math.round(density * 1000) / 1000,
      averageClustering: Math.round(averageClustering * 100) / 100,
      averagePathLength: estimateAveragePathLength(existingEdges, n),
      connectedComponents: connectedComponents.count,
      largestComponentSize: connectedComponents.largest,
      isolatedComponents: isolated,
    },
    clusters,
    quality: {
      score: qualityScore,
      rating: qualityRating,
      strengths: generateGraphStrengths(density, averageClustering, isolated, n),
      weaknesses: generateGraphWeaknesses(density, averageClustering, isolated, n),
    },
    missingConnections,
  };
}

function calculateClusteringCoefficient(
  edges: CareerTransitionEdge[],
  careers: CareerSlug[]
): number {
  // Simplified clustering - ratio of actual to possible triangles
  if (careers.length < 3) return 0;

  const edgeSet = new Set(edges.map(e => `${e.sourceCareerId}→${e.targetCareerId}`));

  let triangles = 0;
  let possibleTriangles = 0;

  for (let i = 0; i < careers.length; i++) {
    for (let j = i + 1; j < careers.length; j++) {
      for (let k = j + 1; k < careers.length; k++) {
        const a = careers[i];
        const b = careers[j];
        const c = careers[k];

        possibleTriangles++;

        // Check for triangle (simplified - directed)
        const ab = edgeSet.has(`${a}→${b}`);
        const bc = edgeSet.has(`${b}→${c}`);
        const ca = edgeSet.has(`${c}→${a}`);

        if (ab && bc && ca) triangles++;
      }
    }
  }

  return possibleTriangles > 0 ? triangles / possibleTriangles : 0;
}

function estimateConnectedComponents(
  edges: CareerTransitionEdge[],
  careers: CareerSlug[]
): { count: number; largest: number } {
  // Union-Find to count components
  const parent = new Map<CareerSlug, CareerSlug>();

  for (const career of careers) {
    parent.set(career, career);
  }

  function find(c: CareerSlug): CareerSlug {
    const p = parent.get(c);
    if (!p || p === c) return c;
    parent.set(c, find(p));
    return parent.get(c)!;
  }

  function union(a: CareerSlug, b: CareerSlug) {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) {
      parent.set(pa, pb);
    }
  }

  for (const edge of edges) {
    union(edge.sourceCareerId, edge.targetCareerId);
  }

  const components = new Map<CareerSlug, number>();
  for (const career of careers) {
    const root = find(career);
    components.set(root, (components.get(root) || 0) + 1);
  }

  return {
    count: components.size,
    largest: Math.max(...components.values(), 0),
  };
}

function identifyClusters(
  edges: CareerTransitionEdge[],
  careers: CareerSlug[]
): GraphDensityAnalysis['clusters'] {
  // Simplified clustering - group by connectivity patterns
  const clusters: GraphDensityAnalysis['clusters'] = [];

  // For now, create placeholder clusters based on edge density
  const careerSet = new Set(careers);
  const connectedCareers = new Set<CareerSlug>();

  for (const edge of edges) {
    connectedCareers.add(edge.sourceCareerId);
    connectedCareers.add(edge.targetCareerId);
  }

  if (connectedCareers.size > 0) {
    clusters.push({
      id: 'main-cluster',
      careers: [...connectedCareers],
      size: connectedCareers.size,
      internalDensity: edges.length / (connectedCareers.size * (connectedCareers.size - 1)),
      externalConnections: edges.filter(e => !connectedCareers.has(e.sourceCareerId) || !connectedCareers.has(e.targetCareerId)).length,
      dominantCategory: 'mixed',
    });
  }

  const isolatedCareers = careers.filter(c => !connectedCareers.has(c));
  if (isolatedCareers.length > 0) {
    clusters.push({
      id: 'isolated',
      careers: isolatedCareers,
      size: isolatedCareers.length,
      internalDensity: 0,
      externalConnections: 0,
      dominantCategory: 'unconnected',
    });
  }

  return clusters;
}

function calculateGraphQualityScore(
  density: number,
  clustering: number,
  isolated: number,
  total: number
): number {
  let score = 50;

  // Density factor (0.1-0.3 is good for career graphs)
  if (density >= 0.1 && density <= 0.3) score += 20;
  else if (density >= 0.05) score += 10;
  else score -= 10;

  // Clustering factor
  score += clustering * 20;

  // Isolation penalty
  const isolationRate = isolated / total;
  score -= isolationRate * 30;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function estimateAveragePathLength(edges: CareerTransitionEdge[], n: number): number {
  // Simplified estimate
  if (n <= 1) return 0;
  if (edges.length === 0) return Infinity;

  // For a connected graph with m edges and n nodes, approximate path length
  const m = edges.length;
  const density = m / (n * (n - 1));

  // Higher density = shorter paths
  return Math.max(1, Math.round((1 / (density + 0.1)) * 10) / 10);
}

function generateGraphStrengths(
  density: number,
  clustering: number,
  isolated: number,
  total: number
): string[] {
  const strengths: string[] = [];

  if (density >= 0.1) {
    strengths.push('Good edge density enables multiple transition paths');
  }

  if (clustering >= 0.3) {
    strengths.push('Strong clustering indicates natural career groupings');
  }

  if (isolated / total < 0.1) {
    strengths.push('Low isolation rate - most careers are connected');
  }

  if (strengths.length === 0) {
    strengths.push('Graph structure exists and can be improved');
  }

  return strengths;
}

function generateGraphWeaknesses(
  density: number,
  clustering: number,
  isolated: number,
  total: number
): string[] {
  const weaknesses: string[] = [];

  if (density < 0.05) {
    weaknesses.push('Low edge density limits transition options');
  }

  if (clustering < 0.2) {
    weaknesses.push('Weak clustering - careers lack natural groupings');
  }

  if (isolated / total >= 0.1) {
    weaknesses.push(`${isolated} isolated careers need connections`);
  }

  if (density > 0.5) {
    weaknesses.push('Very high density may indicate over-connected graph');
  }

  return weaknesses;
}

function analyzeMissingConnections(
  taxonomy: SkillTaxonomyV1,
  careers: CareerSlug[],
  existingEdges: CareerTransitionEdge[]
): GraphDensityAnalysis['missingConnections'] {
  const edgeSet = new Set(existingEdges.map(e => `${e.sourceCareerId}→${e.targetCareerId}`));

  let potentialEdges = 0;
  let highConfidenceMissing = 0;
  let mediumConfidenceMissing = 0;
  const suggestedNewEdges: TransitionCandidate[] = [];

  for (let i = 0; i < careers.length; i++) {
    for (let j = 0; j < careers.length; j++) {
      if (i === j) continue;

      potentialEdges++;

      const source = careers[i];
      const target = careers[j];
      const edgeKey = `${source}→${target}`;

      if (edgeSet.has(edgeKey)) continue;

      // Check if edge should exist
      const sourceProfile = taxonomy.getCareerProfile(source);
      const targetProfile = taxonomy.getCareerProfile(target);

      if (!sourceProfile || !targetProfile) continue;

      const skillOverlap = calculateSkillOverlap(sourceProfile, targetProfile);

      if (skillOverlap.overlapScore >= 50) {
        highConfidenceMissing++;

        // Generate candidate
        const candidate = buildTransitionCandidate(
          taxonomy,
          source,
          target,
          sourceProfile,
          targetProfile
        );

        if (candidate.confidence >= 60) {
          suggestedNewEdges.push(candidate);
        }
      } else if (skillOverlap.overlapScore >= 30) {
        mediumConfidenceMissing++;
      }
    }
  }

  return {
    potentialEdges,
    highConfidenceMissing,
    mediumConfidenceMissing,
    suggestedNewEdges: suggestedNewEdges.slice(0, 20),
  };
}

// ============================================================================
// EXPANSION CANDIDATE FUNCTIONS
// ============================================================================

/**
 * Suggest new careers to add to the system
 */
export function suggestCareerExpansions(
  taxonomy: SkillTaxonomyV1,
  existingCareers: CareerSlug[],
  targetIndustries: string[]
): CareerExpansionCandidate[] {
  const coverage = careerCoverageAnalysis(taxonomy, existingCareers, targetIndustries);
  const candidates: CareerExpansionCandidate[] = [];

  for (const rec of coverage.expansionRecommendations) {
    for (const careerName of rec.suggestedCareers) {
      const careerId = careerName.toLowerCase().replace(/\s+/g, '-');

      // Estimate similarities to existing careers
      const estimatedSimilarities: CareerExpansionCandidate['estimatedSimilarities'] = [];

      for (const existingId of existingCareers.slice(0, 10)) {
        const existingProfile = taxonomy.getCareerProfile(existingId);
        if (!existingProfile) continue;

        // Heuristic similarity based on industry/category
        const estimatedScore = rec.priority === 'critical' ? 45 : 35;

        estimatedSimilarities.push({
          careerId: existingId,
          estimatedScore,
          basis: `Same ${rec.category} domain`,
        });
      }

      // Infer skill profile
      const suggestedSkillProfile: CareerExpansionCandidate['suggestedSkillProfile'] = {
        requiredSkills: inferSkillsForCareer(careerName, rec.category),
        skillCategories: inferCategoriesForCareer(careerName, rec.category),
        estimatedComplexity: rec.priority === 'critical' ? 65 : 55,
      };

      candidates.push({
        proposedCareerId: careerId as CareerSlug,
        proposedName: careerName,
        category: rec.category,
        basis: {
          type: 'industry-gap',
          evidence: [rec.rationale],
          relatedExistingCareers: estimatedSimilarities.map(s => s.careerId),
        },
        estimatedSimilarities,
        suggestedSkillProfile,
        priority: rec.priority,
        confidence: rec.priority === 'critical' ? 70 : 55,
        rationale: rec.rationale,
      });
    }
  }

  return candidates.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function inferSkillsForCareer(careerName: string, category: string): SkillId[] {
  // Simplified skill inference based on career name and category
  const skills: SkillId[] = [];

  if (careerName.toLowerCase().includes('engineer')) {
    skills.push('programming', 'systems-design', 'problem-solving');
  }

  if (careerName.toLowerCase().includes('manager')) {
    skills.push('leadership', 'communication', 'project-management');
  }

  if (careerName.toLowerCase().includes('analyst')) {
    skills.push('data-analysis', 'critical-thinking', 'research');
  }

  if (careerName.toLowerCase().includes('designer')) {
    skills.push('design-thinking', 'creativity', 'user-research');
  }

  // Add category-specific skills
  const categorySkills: Record<string, SkillId[]> = {
    'technology': ['technical-documentation', 'agile-methodologies'],
    'business': ['stakeholder-management', 'business-strategy'],
    'healthcare': ['medical-knowledge', 'patient-care'],
    'finance': ['financial-analysis', 'risk-assessment'],
    'creative': ['visual-design', 'creative-software'],
  };

  const additional = categorySkills[category] || ['domain-expertise'];
  skills.push(...additional);

  return [...new Set(skills)];
}

function inferCategoriesForCareer(careerName: string, category: string): SkillCategory[] {
  const categories: SkillCategory[] = ['domain'];

  if (careerName.toLowerCase().includes('engineer') || category === 'technology') {
    categories.push('technical', 'analytical');
  }

  if (careerName.toLowerCase().includes('manager') || careerName.toLowerCase().includes('director')) {
    categories.push('leadership', 'business');
  }

  if (careerName.toLowerCase().includes('designer') || careerName.toLowerCase().includes('creative')) {
    categories.push('creative');
  }

  if (careerName.toLowerCase().includes('analyst') || careerName.toLowerCase().includes('researcher')) {
    categories.push('analytical');
  }

  if (careerName.toLowerCase().includes('consultant') || careerName.toLowerCase().includes('advisor')) {
    categories.push('communication', 'business');
  }

  return [...new Set(categories)];
}

// ============================================================================
// MAIN EXPANSION FUNCTION
// ============================================================================

/**
 * Execute full career expansion analysis
 */
export function executeCareerExpansion(
  taxonomy: SkillTaxonomyV1,
  existingCareers: CareerSlug[],
  existingEdges: CareerTransitionEdge[],
  targetIndustries: string[],
  config: CareerExpansionEngineConfig = DEFAULT_CAREER_EXPANSION_CONFIG
): ExpansionResult {
  const generatedAt = Date.now();

  // Find similar careers for all existing careers
  const allSimilarities: CareerSimilarity[] = [];
  for (const careerId of existingCareers) {
    const similar = findSimilarCareers(taxonomy, careerId, existingCareers, config);
    allSimilarities.push(...similar);
  }

  // Suggest new careers
  const newCareers = suggestCareerExpansions(taxonomy, existingCareers, targetIndustries);

  // Generate transition candidates
  const newTransitions: TransitionCandidate[] = [];
  for (const careerId of existingCareers) {
    const candidates = generateTransitionCandidates(taxonomy, careerId, existingCareers, config);
    newTransitions.push(...candidates.filter(c => c.recommendation !== 'reject'));
  }

  // Calculate coverage improvement
  const coverageBefore = careerCoverageAnalysis(taxonomy, existingCareers, targetIndustries);

  const simulatedNewCareers = [...existingCareers, ...newCareers.map(c => c.proposedCareerId)];
  const coverageAfter = careerCoverageAnalysis(taxonomy, simulatedNewCareers, targetIndustries);

  // Quality metrics
  const confidences = newTransitions.map(t => t.confidence);
  const averageConfidence = confidences.length > 0
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0;

  const highConfidenceCount = newTransitions.filter(t => t.confidence >= 75).length;
  const mediumConfidenceCount = newTransitions.filter(t => t.confidence >= 50 && t.confidence < 75).length;
  const lowConfidenceCount = newTransitions.filter(t => t.confidence < 50).length;

  // Recommendations
  const recommendations: string[] = [];

  if (newCareers.length > 0) {
    recommendations.push(`Add ${newCareers.length} new careers to fill industry gaps`);
  }

  if (newTransitions.length > 0) {
    recommendations.push(`Add ${newTransitions.filter(t => t.recommendation === 'strong').length} high-confidence transitions`);
  }

  if (coverageBefore.overall.coveragePercentage < 50) {
    recommendations.push('Prioritize critical industry gaps first');
  }

  if (coverageBefore.overall.criticalGaps.length > 0) {
    recommendations.push(`Address critical gaps in: ${coverageBefore.overall.criticalGaps.slice(0, 3).join(', ')}`);
  }

  return {
    id: `expansion-${generatedAt}`,
    generatedAt,
    newCareers,
    newTransitions,
    similarities: allSimilarities,
    coverageImprovement: {
      before: coverageBefore.overall.coveragePercentage,
      after: coverageAfter.overall.coveragePercentage,
      newIndustriesCovered: coverageAfter.byIndustry
        .filter(i => i.coverage !== 'missing' && coverageBefore.byIndustry.find(b => b.industry === i.industry)?.coverage === 'missing')
        .map(i => i.industry),
      newSkillCategoriesCovered: [],
    },
    quality: {
      averageConfidence: Math.round(averageConfidence),
      highConfidenceCount,
      mediumConfidenceCount,
      lowConfidenceCount,
    },
    recommendations,
  };
}

// ============================================================================
// CAREER EXPANSION ENGINE CLASS
// ============================================================================

export class CareerExpansionEngineV1 {
  private taxonomy: SkillTaxonomyV1;
  private config: CareerExpansionEngineConfig;

  constructor(
    taxonomy: SkillTaxonomyV1,
    config?: Partial<CareerExpansionEngineConfig>
  ) {
    this.taxonomy = taxonomy;
    this.config = {
      ...DEFAULT_CAREER_EXPANSION_CONFIG,
      ...config,
    };
  }

  /**
   * Find careers similar to a given career
   */
  findSimilarCareers(
    sourceCareerId: CareerSlug,
    candidateCareers: CareerSlug[]
  ): CareerSimilarity[] {
    return findSimilarCareers(this.taxonomy, sourceCareerId, candidateCareers, this.config);
  }

  /**
   * Suggest adjacent careers
   */
  suggestAdjacentCareers(
    sourceCareerId: CareerSlug,
    candidatePool: CareerSlug[]
  ): AdjacentCareer[] {
    return suggestAdjacentCareers(this.taxonomy, sourceCareerId, candidatePool, this.config);
  }

  /**
   * Generate transition candidates
   */
  generateTransitionCandidates(
    sourceCareerId: CareerSlug,
    targetCandidates: CareerSlug[]
  ): TransitionCandidate[] {
    return generateTransitionCandidates(this.taxonomy, sourceCareerId, targetCandidates, this.config);
  }

  /**
   * Calculate expansion confidence
   */
  calculateExpansionConfidence(careerIds: CareerSlug[]): ExpansionConfidence {
    return calculateExpansionConfidence(this.taxonomy, careerIds);
  }

  /**
   * Analyze career coverage
   */
  analyzeCareerCoverage(
    existingCareers: CareerSlug[],
    targetIndustries: string[]
  ): CareerCoverageAnalysis {
    return careerCoverageAnalysis(this.taxonomy, existingCareers, targetIndustries);
  }

  /**
   * Analyze graph density
   */
  analyzeGraphDensity(
    existingCareers: CareerSlug[],
    existingEdges: CareerTransitionEdge[]
  ): GraphDensityAnalysis {
    return graphDensityAnalysis(this.taxonomy, existingCareers, existingEdges);
  }

  /**
   * Suggest new career additions
   */
  suggestCareerExpansions(
    existingCareers: CareerSlug[],
    targetIndustries: string[]
  ): CareerExpansionCandidate[] {
    return suggestCareerExpansions(this.taxonomy, existingCareers, targetIndustries);
  }

  /**
   * Execute full expansion
   */
  executeExpansion(
    existingCareers: CareerSlug[],
    existingEdges: CareerTransitionEdge[],
    targetIndustries: string[]
  ): ExpansionResult {
    return executeCareerExpansion(
      this.taxonomy,
      existingCareers,
      existingEdges,
      targetIndustries,
      this.config
    );
  }

  /**
   * Batch generate all transitions for a career set
   */
  batchGenerateTransitions(careers: CareerSlug[]): TransitionCandidate[] {
    const allCandidates: TransitionCandidate[] = [];

    for (const sourceId of careers) {
      const candidates = this.generateTransitionCandidates(sourceId, careers);
      allCandidates.push(...candidates);
    }

    // Remove duplicates and sort by confidence
    const seen = new Set<string>();
    return allCandidates
      .filter(c => {
        const key = `${c.sourceCareerId}→${c.targetCareerId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CareerExpansionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CareerExpansionEngineConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createCareerExpansionEngine(
  taxonomy: SkillTaxonomyV1,
  config?: Partial<CareerExpansionEngineConfig>
): CareerExpansionEngineV1 {
  return new CareerExpansionEngineV1(taxonomy, config);
}
