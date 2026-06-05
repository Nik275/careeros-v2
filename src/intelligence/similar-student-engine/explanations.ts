/**
 * Similar Student Engine - Explanations
 * 
 * Human-readable explanation generation for student similarity.
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type { 
  SimilarityExplanation, 
  DimensionSimilarity,
} from './types.js';

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

/**
 * Generate human-readable explanation of student similarity.
 */
export function generateExplanation(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3,
  dimensions: {
    psychological: DimensionSimilarity;
    economic: DimensionSimilarity;
    educational: DimensionSimilarity;
    utility: DimensionSimilarity;
    lifestyle: DimensionSimilarity;
  },
  overallScore: number
): SimilarityExplanation {
  const summary = generateSummary(studentA, studentB, overallScore, dimensions);
  const keySimilarities = extractKeySimilarities(dimensions);
  const keyDifferences = extractKeyDifferences(dimensions);
  const comparisonValue = generateComparisonValue(overallScore, keySimilarities, keyDifferences);
  const suggestedInsights = generateSuggestedInsights(dimensions, studentA, studentB);

  return {
    summary,
    keySimilarities,
    keyDifferences,
    comparisonValue,
    suggestedInsights,
  };
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

function generateSummary(
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3,
  overallScore: number,
  dimensions: Record<string, DimensionSimilarity>
): string {
  const percentage = Math.round(overallScore * 100);
  const strongestDimension = findStrongestDimension(dimensions);
  const weakestDimension = findWeakestDimension(dimensions);

  if (overallScore >= 0.8) {
    return `${studentA.studentId} and ${studentB.studentId} are highly similar (${percentage}% match), especially in their ${strongestDimension} profiles. They likely share similar career paths and challenges.`;
  } else if (overallScore >= 0.6) {
    return `${studentA.studentId} and ${studentB.studentId} are moderately similar (${percentage}% match). They share significant alignment in ${strongestDimension}, though they differ in ${weakestDimension}.`;
  } else if (overallScore >= 0.4) {
    return `${studentA.studentId} and ${studentB.studentId} have some similarities (${percentage}% match), particularly in ${strongestDimension}. Their differences in ${weakestDimension} may lead to different optimal paths.`;
  } else {
    return `${studentA.studentId} and ${studentB.studentId} are quite different (${percentage}% match). While they share some ${strongestDimension} traits, their overall profiles suggest distinct approaches to career decisions.`;
  }
}

// ============================================================================
// SIMILARITY EXTRACTION
// ============================================================================

function extractKeySimilarities(dimensions: Record<string, DimensionSimilarity>): string[] {
  const similarities: string[] = [];

  for (const [dimensionName, dimension] of Object.entries(dimensions)) {
    if (dimension.score >= 0.7) {
      // High similarity in this dimension
      const topDetails = dimension.details
        .filter(d => d.similarity >= 0.8)
        .slice(0, 2);

      for (const detail of topDetails) {
        similarities.push(formatSimilarity(dimensionName, detail));
      }
    }
  }

  return similarities.slice(0, 5); // Top 5
}

function extractKeyDifferences(dimensions: Record<string, DimensionSimilarity>): string[] {
  const differences: string[] = [];

  for (const [dimensionName, dimension] of Object.entries(dimensions)) {
    if (dimension.score <= 0.4) {
      // Low similarity = high difference
      const differingDetails = dimension.details
        .filter(d => d.similarity <= 0.3)
        .slice(0, 2);

      for (const detail of differingDetails) {
        differences.push(formatDifference(dimensionName, detail));
      }
    }
  }

  return differences.slice(0, 4); // Top 4
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatSimilarity(dimension: string, detail: { aspect: string; description: string }): string {
  const dimensionLabels: Record<string, string> = {
    psychological: 'Psychological',
    economic: 'Economic',
    educational: 'Educational',
    utility: 'Career preferences',
    lifestyle: 'Lifestyle',
  };

  return `${dimensionLabels[dimension] || dimension}: ${detail.description}`;
}

function formatDifference(dimension: string, detail: { aspect: string; description: string }): string {
  const dimensionLabels: Record<string, string> = {
    psychological: 'Psychologically',
    economic: 'Economically',
    educational: 'Educationally',
    utility: 'In career preferences',
    lifestyle: 'In lifestyle',
  };

  return `${dimensionLabels[dimension] || dimension}: ${detail.description}`;
}

// ============================================================================
// VALUE GENERATION
// ============================================================================

function generateComparisonValue(
  overallScore: number,
  similarities: string[],
  differences: string[]
): string {
  if (overallScore >= 0.8) {
    return `These students can learn a great deal from each other's experiences. Their high similarity means career decisions that worked for one are very likely to work for the other.`;
  } else if (overallScore >= 0.6) {
    return `Comparison is valuable. Shared traits in ${similarities.length > 0 ? similarities[0].split(':')[0].toLowerCase() : 'key areas'} provide common ground, while differences offer alternative perspectives.`;
  } else if (overallScore >= 0.4) {
    return `Limited but targeted comparison value. Focus on the specific areas of similarity rather than overall approach. Differences may highlight alternative paths worth considering.`;
  } else {
    return `Low direct comparability. These students face different constraints and have different priorities. However, their differences may provide useful contrast for exploring options.`;
  }
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

function generateSuggestedInsights(
  dimensions: Record<string, DimensionSimilarity>,
  studentA: StudentBeliefV3,
  studentB: StudentBeliefV3
): string[] {
  const insights: string[] = [];

  // Psychological insights
  if (dimensions.psychological.score > 0.7) {
    insights.push('Both students share similar psychological profiles - what motivates one likely motivates the other.');
  }

  // Economic insights  
  if (dimensions.economic.score > 0.7) {
    insights.push('Similar economic backgrounds mean similar financial constraints and opportunities.');
  } else if (dimensions.economic.score < 0.3) {
    insights.push('Different economic situations may lead to different optimal career paths despite other similarities.');
  }

  // Educational insights
  if (dimensions.educational.score > 0.7) {
    insights.push('Comparable educational backgrounds suggest similar academic strengths and learning approaches.');
  }

  // Utility insights
  if (dimensions.utility.score > 0.7) {
    const topMotivationA = getTopMotivation(studentA);
    const topMotivationB = getTopMotivation(studentB);
    if (topMotivationA === topMotivationB) {
      insights.push(`Both prioritize ${topMotivationA} in their career decisions.`);
    }
  }

  // Lifestyle insights
  if (dimensions.lifestyle.score > 0.7) {
    insights.push('Similar lifestyle preferences suggest compatible work-life balance needs.');
  }

  // Outcome learning specific
  insights.push('Consider comparing actual career outcomes if available to validate similarity predictions.');

  return insights.slice(0, 5);
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function findStrongestDimension(dimensions: Record<string, DimensionSimilarity>): string {
  let strongest = '';
  let highestScore = -1;

  for (const [name, dim] of Object.entries(dimensions)) {
    if (dim.score > highestScore) {
      highestScore = dim.score;
      strongest = name;
    }
  }

  return strongest;
}

function findWeakestDimension(dimensions: Record<string, DimensionSimilarity>): string {
  let weakest = '';
  let lowestScore = 2;

  for (const [name, dim] of Object.entries(dimensions)) {
    if (dim.score < lowestScore) {
      lowestScore = dim.score;
      weakest = name;
    }
  }

  return weakest;
}

function getTopMotivation(student: StudentBeliefV3): string {
  if (!student.motivations || student.motivations.length === 0) {
    return 'career success';
  }

  const sorted = [...student.motivations].sort((a, b) => b.strength - a.strength);
  return sorted[0].name;
}

// ============================================================================
// SIMPLE EXPLANATIONS
// ============================================================================

/**
 * Generate a simple one-line explanation.
 */
export function generateSimpleExplanation(
  similarityScore: number,
  topSimilarDimension?: string
): string {
  const percentage = Math.round(similarityScore * 100);

  if (similarityScore >= 0.8) {
    return `Very similar profiles (${percentage}% match)${topSimilarDimension ? `, especially in ${topSimilarDimension}` : ''}`;
  } else if (similarityScore >= 0.6) {
    return `Moderately similar (${percentage}% match)${topSimilarDimension ? ` with strong alignment in ${topSimilarDimension}` : ''}`;
  } else if (similarityScore >= 0.4) {
    return `Somewhat similar (${percentage}% match)`;
  } else {
    return `Different profiles (${percentage}% match)`;
  }
}

/**
 * Generate explanation for a specific dimension.
 */
export function generateDimensionExplanation(
  dimension: string,
  score: number
): string {
  const dimensionNames: Record<string, string> = {
    psychological: 'Psychological traits',
    economic: 'Economic background',
    educational: 'Educational background',
    utility: 'Career preferences',
    lifestyle: 'Lifestyle preferences',
  };

  const name = dimensionNames[dimension] || dimension;

  if (score >= 0.8) {
    return `${name} are highly aligned`;
  } else if (score >= 0.6) {
    return `${name} show significant similarity`;
  } else if (score >= 0.4) {
    return `${name} have some overlap`;
  } else {
    return `${name} differ considerably`;
  }
}
