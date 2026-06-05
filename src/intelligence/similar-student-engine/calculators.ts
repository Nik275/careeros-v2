/**
 * Similar Student Engine - Calculators
 * 
 * Dimension-specific similarity calculation algorithms.
 */

import type { 
  StudentBeliefV3,
  Motivation,
  Strength,
  Value,
  PersonalityTrait,
  LifestylePreference,
  Constraint,
} from '../types/index.js';

import type { 
  DimensionSimilarity, 
  SimilarityDetail,
  SimilarityScore,
} from './types.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Euclidean distance between two vectors.
 */
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

/**
 * Convert distance to similarity (0.0 - 1.0).
 */
function distanceToSimilarity(distance: number, maxDistance: number = Math.sqrt(2)): SimilarityScore {
  return Math.max(0, Math.min(1, 1 - distance / maxDistance));
}

/**
 * Calculate Jaccard similarity for sets.
 */
function jaccardSimilarity<T>(setA: T[], setB: T[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculate weighted average.
 */
function weightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
}

/**
 * Normalize a value to 0.0 - 1.0 range.
 */
function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// ============================================================================
// PSYCHOLOGICAL SIMILARITY
// ============================================================================

/**
 * Calculate psychological similarity between two students.
 * Compares personality traits, motivations, strengths, and values.
 */
export function calculatePsychologicalSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): DimensionSimilarity {
  const details: SimilarityDetail[] = [];
  
  // Compare personality traits
  const personalitySimilarity = comparePersonalityTraits(
    studentA.personalityTraits,
    studentB.personalityTraits,
    details
  );
  
  // Compare motivations
  const motivationSimilarity = compareMotivations(
    studentA.motivations,
    studentB.motivations,
    details
  );
  
  // Compare strengths
  const strengthSimilarity = compareStrengths(
    studentA.strengths,
    studentB.strengths,
    details
  );
  
  // Compare values
  const valueSimilarity = compareValues(
    studentA.values,
    studentB.values,
    details
  );
  
  // Weighted combination
  const weights = [0.30, 0.30, 0.20, 0.20];
  const similarities = [personalitySimilarity, motivationSimilarity, strengthSimilarity, valueSimilarity];
  const overallScore = weightedAverage(similarities, weights);
  
  return {
    score: overallScore,
    weight: 0.30,
    details,
    confidence: calculateConfidence(details),
  };
}

function comparePersonalityTraits(
  traitsA: PersonalityTrait[],
  traitsB: PersonalityTrait[],
  details: SimilarityDetail[]
): number {
  // Convert to map for easier lookup - use name as key since that's what identifies traits
  const mapA = new Map(traitsA.map(t => [t.name, t.position]));
  const mapB = new Map(traitsB.map(t => [t.name, t.position]));
  
  // Get all unique trait names
  const allTraits = new Set([...mapA.keys(), ...mapB.keys()]);
  const similarities: number[] = [];
  
  for (const traitName of allTraits) {
    const positionA = mapA.get(traitName) ?? 0; // Default to neutral (0)
    const positionB = mapB.get(traitName) ?? 0;
    const diff = Math.abs(positionA - positionB);
    // Convert -1..1 range difference to similarity (0..1)
    const similarity = 1 - (diff / 2); // Max diff is 2 (-1 to 1)
    similarities.push(similarity);
    
    if (diff < 0.6 || diff > 1.0) {
      details.push({
        aspect: `personality_${traitName}`,
        valueA: positionA,
        valueB: positionB,
        similarity,
        description: `${traitName}: ${similarity > 0.7 ? 'Similar' : 'Different'} traits (${(positionA * 100).toFixed(0)}% vs ${(positionB * 100).toFixed(0)}%)`,
      });
    }
  }
  
  return similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0.5;
}

function compareMotivations(
  motivationsA: Motivation[],
  motivationsB: Motivation[],
  details: SimilarityDetail[]
): number {
  // Map by name (which is the identifier in this type system)
  const mapA = new Map(motivationsA.map(m => [m.name, m.strength]));
  const mapB = new Map(motivationsB.map(m => [m.name, m.strength]));
  
  const allMotivations = new Set([...mapA.keys(), ...mapB.keys()]);
  const similarities: number[] = [];
  
  for (const name of allMotivations) {
    const strengthA = mapA.get(name) ?? 0.5;
    const strengthB = mapB.get(name) ?? 0.5;
    const diff = Math.abs(strengthA - strengthB);
    const similarity = 1 - diff;
    similarities.push(similarity);
    
    if (diff < 0.2 || diff > 0.4) {
      details.push({
        aspect: `motivation_${name}`,
        valueA: strengthA,
        valueB: strengthB,
        similarity,
        description: `${name} motivation: ${similarity > 0.8 ? 'Highly aligned' : similarity > 0.5 ? 'Somewhat aligned' : 'Different priorities'}`,
      });
    }
  }
  
  return similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0.5;
}

function compareStrengths(
  strengthsA: Strength[],
  strengthsB: Strength[],
  details: SimilarityDetail[]
): number {
  const categoriesA = strengthsA.map(s => s.category);
  const categoriesB = strengthsB.map(s => s.category);
  
  const similarity = jaccardSimilarity(categoriesA, categoriesB);
  
  const common = categoriesA.filter(c => categoriesB.includes(c));
  if (common.length > 0) {
    details.push({
      aspect: 'strength_categories',
      valueA: categoriesA,
      valueB: categoriesB,
      similarity,
      description: `Shared strength areas: ${common.join(', ')}`,
    });
  }
  
  return similarity;
}

function compareValues(
  valuesA: Value[],
  valuesB: Value[],
  details: SimilarityDetail[]
): number {
  // Map by name
  const mapA = new Map(valuesA.map(v => [v.name, v.importance]));
  const mapB = new Map(valuesB.map(v => [v.name, v.importance]));
  
  const allValues = new Set([...mapA.keys(), ...mapB.keys()]);
  const similarities: number[] = [];
  
  for (const name of allValues) {
    const importanceA = mapA.get(name) ?? 0.5;
    const importanceB = mapB.get(name) ?? 0.5;
    const diff = Math.abs(importanceA - importanceB);
    const similarity = 1 - diff;
    similarities.push(similarity);
    
    if (diff < 0.3) {
      details.push({
        aspect: `value_${name}`,
        valueA: importanceA,
        valueB: importanceB,
        similarity,
        description: `Both value ${name} similarly`,
      });
    }
  }
  
  return similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0.5;
}

// ============================================================================
// ECONOMIC SIMILARITY
// ============================================================================

/**
 * Calculate economic/reality similarity between two students.
 * Compares family background, financial constraints, and economic resources.
 */
export function calculateEconomicSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): DimensionSimilarity {
  const details: SimilarityDetail[] = [];
  
  const familyA = studentA.familyReality;
  const familyB = studentB.familyReality;
  const economicA = studentA.economicReality;
  const economicB = studentB.economicReality;
  
  // Family income similarity - use financial situation
  const incomeSimilarity = compareIncomeBrackets(
    economicA.financialSituation.familyIncomeBracket,
    economicB.financialSituation.familyIncomeBracket,
    details
  );
  
  // Monthly budget similarity
  const budgetA = economicA.financialSituation.monthlyDiscretionaryBudget;
  const budgetB = economicB.financialSituation.monthlyDiscretionaryBudget;
  const maxBudget = Math.max(budgetA, budgetB, 10000);
  const budgetSimilarity = 1 - (Math.abs(budgetA - budgetB) / maxBudget);
  
  details.push({
    aspect: 'monthly_budget',
    valueA: budgetA,
    valueB: budgetB,
    similarity: budgetSimilarity,
    description: `Monthly discretionary budget: ${budgetSimilarity > 0.8 ? 'Similar' : 'Different'} (₹${budgetA} vs ₹${budgetB})`,
  });
  
  // Location type similarity
  const locationMatch = economicA.financialSituation.locationType === economicB.financialSituation.locationType ? 1.0 : 0.3;
  details.push({
    aspect: 'location_type',
    valueA: economicA.financialSituation.locationType,
    valueB: economicB.financialSituation.locationType,
    similarity: locationMatch,
    description: `Location: ${locationMatch > 0.5 ? 'Same type' : 'Different types'}`,
  });
  
  // Has own income similarity
  const ownIncomeMatch = economicA.financialSituation.hasOwnIncome === economicB.financialSituation.hasOwnIncome ? 1.0 : 0.0;
  
  const weights = [0.40, 0.25, 0.20, 0.15];
  const similarities = [incomeSimilarity, budgetSimilarity, locationMatch, ownIncomeMatch];
  const overallScore = weightedAverage(similarities, weights);
  
  return {
    score: overallScore,
    weight: 0.20,
    details,
    confidence: calculateConfidence(details),
  };
}

function compareIncomeBrackets(
  bracketA: string,
  bracketB: string,
  details: SimilarityDetail[]
): number {
  const bracketOrder = ['BELOW_3_LAKH', '3_TO_6_LAKH', '6_TO_12_LAKH', '12_TO_25_LAKH', 'ABOVE_25_LAKH'];
  const idxA = bracketOrder.indexOf(bracketA);
  const idxB = bracketOrder.indexOf(bracketB);
  
  if (idxA === -1 || idxB === -1) return 0.5;
  
  const diff = Math.abs(idxA - idxB);
  const similarity = 1 - (diff / bracketOrder.length);
  
  details.push({
    aspect: 'family_income',
    valueA: bracketA,
    valueB: bracketB,
    similarity,
    description: `Family income: ${diff === 0 ? 'Same bracket' : diff <= 1 ? 'Similar bracket' : 'Different brackets'}`,
  });
  
  return similarity;
}

// ============================================================================
// EDUCATIONAL SIMILARITY
// ============================================================================

/**
 * Calculate educational similarity between two students.
 * Compares academic background, achievements, and opportunities.
 */
export function calculateEducationalSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): DimensionSimilarity {
  const details: SimilarityDetail[] = [];
  
  const eduA = studentA.educationalReality;
  const eduB = studentB.educationalReality;
  
  // Current level similarity
  const levelSimilarity = compareEducationLevels(
    eduA.background.currentLevel,
    eduB.background.currentLevel,
    details
  );
  
  // Stream similarity
  const streamMatch = eduA.background.stream === eduB.background.stream ? 1.0 : 0.0;
  if (streamMatch > 0) {
    details.push({
      aspect: 'academic_stream',
      valueA: eduA.background.stream,
      valueB: eduB.background.stream,
      similarity: streamMatch,
      description: `Same academic stream: ${eduA.background.stream}`,
    });
  }
  
  // Institution tier similarity
  const institutionSimilarity = compareInstitutionTiers(
    eduA.background.institutionTier,
    eduB.background.institutionTier,
    details
  );
  
  // Board similarity
  const boardMatch = eduA.background.board === eduB.background.board ? 1.0 : 0.3;
  
  const weights = [0.30, 0.30, 0.25, 0.15];
  const similarities = [levelSimilarity, streamMatch, institutionSimilarity, boardMatch];
  const overallScore = weightedAverage(similarities, weights);
  
  return {
    score: overallScore,
    weight: 0.20,
    details,
    confidence: calculateConfidence(details),
  };
}

function compareEducationLevels(
  levelA: string,
  levelB: string,
  details: SimilarityDetail[]
): number {
  const levels = ['HIGH_SCHOOL', 'HIGHER_SECONDARY', 'UNDERGRADUATE', 'POSTGRADUATE', 'WORKING'];
  const idxA = levels.indexOf(levelA);
  const idxB = levels.indexOf(levelB);
  
  if (idxA === -1 || idxB === -1) return 0.5;
  
  const diff = Math.abs(idxA - idxB);
  const similarity = 1 - (diff / levels.length);
  
  details.push({
    aspect: 'education_level',
    valueA: levelA,
    valueB: levelB,
    similarity,
    description: `Education level: ${diff === 0 ? 'Same level' : diff <= 1 ? 'Adjacent levels' : 'Different levels'}`,
  });
  
  return similarity;
}

function compareInstitutionTiers(
  tierA: string | undefined,
  tierB: string | undefined,
  details: SimilarityDetail[]
): number {
  if (!tierA || !tierB) return 0.5;
  
  const tiers = ['LOCAL', 'TIER_3', 'TIER_2', 'TIER_1', 'NIT_IIIT', 'IIT'];
  const idxA = tiers.indexOf(tierA);
  const idxB = tiers.indexOf(tierB);
  
  if (idxA === -1 || idxB === -1) return 0.5;
  
  const diff = Math.abs(idxA - idxB);
  const similarity = 1 - (diff / tiers.length);
  
  details.push({
    aspect: 'institution_tier',
    valueA: tierA,
    valueB: tierB,
    similarity,
    description: `Institution tier: ${similarity > 0.75 ? 'Similar tiers' : 'Different tiers'}`,
  });
  
  return similarity;
}

// ============================================================================
// UTILITY SIMILARITY
// ============================================================================

/**
 * Calculate utility/career preference similarity between two students.
 * Compares career preferences, desired outcomes, and decision factors.
 */
export function calculateUtilitySimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): DimensionSimilarity {
  const details: SimilarityDetail[] = [];
  
  // Compare top career preferences (motivations)
  const careerPrefSimilarity = compareCareerPreferences(
    studentA.motivations,
    studentB.motivations,
    details
  );
  
  // Compare desired outcomes (values)
  const outcomeSimilarity = compareDesiredOutcomes(
    studentA.values,
    studentB.values,
    details
  );
  
  // Compare decision timelines
  const timelineSimilarity = compareDecisionTimelines(
    studentA.decisionState.timeline.urgency,
    studentB.decisionState.timeline.urgency,
    details
  );
  
  const weights = [0.45, 0.35, 0.20];
  const similarities = [careerPrefSimilarity, outcomeSimilarity, timelineSimilarity];
  const overallScore = weightedAverage(similarities, weights);
  
  return {
    score: overallScore,
    weight: 0.20,
    details,
    confidence: calculateConfidence(details),
  };
}

function compareCareerPreferences(
  motivationsA: Motivation[],
  motivationsB: Motivation[],
  details: SimilarityDetail[]
): number {
  // Extract top 3 motivations for each student by strength
  const topA = motivationsA
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(m => m.name);
  
  const topB = motivationsB
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(m => m.name);
  
  const similarity = jaccardSimilarity(topA, topB);
  
  const common = topA.filter(n => topB.includes(n));
  details.push({
    aspect: 'career_preferences',
    valueA: topA,
    valueB: topB,
    similarity,
    description: `Career priorities: ${common.length > 0 ? `Both prioritize ${common.join(', ')}` : 'Different priorities'}`,
  });
  
  return similarity;
}

function compareDesiredOutcomes(
  valuesA: Value[],
  valuesB: Value[],
  details: SimilarityDetail[]
): number {
  const topA = valuesA
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)
    .map(v => v.name);
  
  const topB = valuesB
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)
    .map(v => v.name);
  
  const similarity = jaccardSimilarity(topA, topB);
  
  details.push({
    aspect: 'desired_outcomes',
    valueA: topA,
    valueB: topB,
    similarity,
    description: `Desired outcomes: ${similarity > 0.5 ? 'Aligned goals' : 'Different aspirations'}`,
  });
  
  return similarity;
}

function compareDecisionTimelines(
  urgencyA: string,
  urgencyB: string,
  details: SimilarityDetail[]
): number {
  const urgencyOrder = ['EXPLORATORY', 'LONG_TERM', 'MEDIUM_TERM', 'SHORT_TERM', 'IMMEDIATE'];
  const idxA = urgencyOrder.indexOf(urgencyA);
  const idxB = urgencyOrder.indexOf(urgencyB);
  
  if (idxA === -1 || idxB === -1) {
    const match = urgencyA === urgencyB ? 1.0 : 0.3;
    details.push({
      aspect: 'decision_timeline',
      valueA: urgencyA,
      valueB: urgencyB,
      similarity: match,
      description: `Decision urgency: ${match > 0.5 ? 'Similar timeline' : 'Different timing needs'}`,
    });
    return match;
  }
  
  const diff = Math.abs(idxA - idxB);
  const similarity = 1 - (diff / urgencyOrder.length);
  
  details.push({
    aspect: 'decision_timeline',
    valueA: urgencyA,
    valueB: urgencyB,
    similarity,
    description: `Decision urgency: ${diff === 0 ? 'Same timeline' : diff <= 1 ? 'Similar urgency' : 'Different timing needs'}`,
  });
  
  return similarity;
}

// ============================================================================
// LIFESTYLE SIMILARITY
// ============================================================================

/**
 * Calculate lifestyle preference similarity between two students.
 * Compares work-life preferences, location constraints, and living arrangements.
 */
export function calculateLifestyleSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): DimensionSimilarity {
  const details: SimilarityDetail[] = [];
  
  // Compare lifestyle preferences
  const preferenceSimilarity = compareLifestylePreferences(
    studentA.lifestylePreferences,
    studentB.lifestylePreferences,
    details
  );
  
  // Compare constraints
  const constraintSimilarity = compareLifestyleConstraints(
    studentA.constraints,
    studentB.constraints,
    details
  );
  
  const weights = [0.60, 0.40];
  const similarities = [preferenceSimilarity, constraintSimilarity];
  const overallScore = weightedAverage(similarities, weights);
  
  return {
    score: overallScore,
    weight: 0.10,
    details,
    confidence: calculateConfidence(details),
  };
}

function compareLifestylePreferences(
  prefsA: LifestylePreference[],
  prefsB: LifestylePreference[],
  details: SimilarityDetail[]
): number {
  // Map by category
  const mapA = new Map(prefsA.map(p => [p.category, p.importance]));
  const mapB = new Map(prefsB.map(p => [p.category, p.importance]));
  
  const allCategories = new Set([...mapA.keys(), ...mapB.keys()]);
  const similarities: number[] = [];
  
  for (const category of allCategories) {
    const importanceA = mapA.get(category) ?? 0.5;
    const importanceB = mapB.get(category) ?? 0.5;
    const diff = Math.abs(importanceA - importanceB);
    const similarity = 1 - diff;
    similarities.push(similarity);
  }
  
  const avgSimilarity = similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0.5;
  
  const commonCategories = [...mapA.keys()].filter(c => mapB.has(c));
  if (commonCategories.length > 0) {
    details.push({
      aspect: 'lifestyle_preferences',
      valueA: [...mapA.keys()],
      valueB: [...mapB.keys()],
      similarity: avgSimilarity,
      description: `Shared lifestyle categories: ${commonCategories.join(', ')}`,
    });
  }
  
  return avgSimilarity;
}

function compareLifestyleConstraints(
  constraintsA: Constraint[],
  constraintsB: Constraint[],
  details: SimilarityDetail[]
): number {
  // Map by type
  const mapA = new Map(constraintsA.map(c => [c.type, c.severity]));
  const mapB = new Map(constraintsB.map(c => [c.type, c.severity]));
  
  const allTypes = new Set([...mapA.keys(), ...mapB.keys()]);
  const similarities: number[] = [];
  
  for (const type of allTypes) {
    const impactA = mapA.get(type) ?? 0.0;
    const impactB = mapB.get(type) ?? 0.0;
    const diff = Math.abs(impactA - impactB);
    const similarity = 1 - diff;
    similarities.push(similarity);
  }
  
  const avgSimilarity = similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0.5;
  
  const commonTypes = [...mapA.keys()].filter(t => mapB.has(t));
  if (commonTypes.length > 0) {
    details.push({
      aspect: 'lifestyle_constraints',
      valueA: [...mapA.keys()],
      valueB: [...mapB.keys()],
      similarity: avgSimilarity,
      description: `Shared constraint types: ${commonTypes.join(', ')}`,
    });
  }
  
  return avgSimilarity;
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence based on data completeness.
 */
function calculateConfidence(details: SimilarityDetail[]): number {
  if (details.length === 0) return 0.5;
  
  // More details = higher confidence, up to a point
  const baseConfidence = Math.min(0.95, 0.4 + details.length * 0.05);
  
  // Check for missing data (value of undefined/null)
  const missingDataRatio = details.filter(
    d => d.valueA === undefined || d.valueB === undefined
  ).length / details.length;
  
  return Math.max(0.3, baseConfidence - missingDataRatio * 0.3);
}

// ============================================================================
// OVERALL SIMILARITY
// ============================================================================

/**
 * Calculate overall similarity between two students across all dimensions.
 */
export function calculateOverallSimilarity(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3,
  weights: { psychological: number; economic: number; educational: number; utility: number; lifestyle: number }
): { score: number; dimensions: ReturnType<typeof calculatePsychologicalSimilarity>[] } {
  const psychSim = calculatePsychologicalSimilarity(studentA, studentB);
  const econSim = calculateEconomicSimilarity(studentA, studentB);
  const eduSim = calculateEducationalSimilarity(studentA, studentB);
  const utilSim = calculateUtilitySimilarity(studentA, studentB);
  const lifeSim = calculateLifestyleSimilarity(studentA, studentB);
  
  const similarities = [psychSim.score, econSim.score, eduSim.score, utilSim.score, lifeSim.score];
  const dimensionWeights = [weights.psychological, weights.economic, weights.educational, weights.utility, weights.lifestyle];
  
  const overallScore = weightedAverage(similarities, dimensionWeights);
  
  return {
    score: overallScore,
    dimensions: [psychSim, econSim, eduSim, utilSim, lifeSim],
  };
}
