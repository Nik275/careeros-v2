/**
 * Career Dimensions System
 *
 * CareerOS - Career Intelligence System
 *
 * This module provides the dimensional framework for evaluating careers.
 * Every career in CareerOS is assessed using identical dimensions to enable
 * consistent comparison, matching, and analysis.
 *
 * Exports:
 *   - CareerDimension enum (all 28 dimensions)
 *   - DimensionCategory enum and metadata
 *   - DimensionMetadata interface and full registry
 *   - India-specific dimensions
 *   - Utility functions for dimension operations
 *   - Type conversion and validation
 */

// Core types and enums
export {
  CareerDimension,
  DimensionCategory,
  IndiaCareerDimension,
  ALL_CAREER_DIMENSIONS,
  TOTAL_DIMENSION_COUNT,
  DIMENSION_SCORE_MIN,
  DIMENSION_SCORE_MAX,
} from './CareerDimensions';

// Metadata
export {
  DimensionRegistry,
  IndiaDimensionRegistry,
  DimensionCategoryLabels,
  DimensionCategoryDescriptions,
} from './CareerDimensions';

// Type exports
export type {
  DimensionScore,
  DimensionMetadata,
  DimensionProfile,
} from './CareerDimensions';

// Utility functions
export {
  // Dimension access
  getDimensionMetadata,
  getDimensionsByCategory,

  // Score conversion
  toDimensionScore,
  toCareerScore,
  isValidDimensionScore,

  // Career dimension extraction
  getCareerDimensionValue,
  getAllCareerDimensionValues,
  getDimensionScoreLabel,

  // Comparison
  compareCareersOnDimension,
  findCareerDimensionDifferences,

  // Matching
  calculateDimensionMatchScore,

  // Profile creation
  createNeutralDimensionProfile,
} from './CareerDimensions';
