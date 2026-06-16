/**
 * Career Repository Layer
 *
 * CareerOS - Career Intelligence System
 *
 * This module provides the repository pattern for career data access.
 * Abstracts the data source (in-memory now, database later) behind a clean interface.
 */

// Import implementation for factory function
import { InMemoryCareerRepository } from './InMemoryCareerRepository';

/**
 * Architecture Principles:
 *   - Repository pattern for data access abstraction
 *   - Interface-based design for easy implementation swapping
 *   - In-memory implementation with indexing for fast lookups
 *   - Type-safe filtering and search
 *   - Prepared for future database migration (MongoDB, PostgreSQL, etc.)
 *
 * Future Migration Path:
 *   1. Current: InMemoryCareerRepository (static data)
 *   2. Next: FileSystemCareerRepository (JSON/YAML files)
 *   3. Then: MongoCareerRepository or PostgresCareerRepository
 *   4. Application code remains unchanged
 *
 * Performance Targets (150+ careers):
 *   - getById/slug: O(1)
 *   - getByCategory: O(1)
 *   - search: O(n) with early termination
 *   - filter: O(n) with index support for common filters
 */

import type {
  Career,
  CareerId,
  CareerSlug,
  CareerCategory,
  CareerFilter,
  CareerSortOption,
  CareerCollection,
} from '../Career';

// ============================================================================
// REPOSITORY INTERFACE
// ============================================================================

/**
 * Career Repository Interface
 *
 * Defines the contract for all career data access operations.
 * All implementations must conform to this interface.
 */
export interface CareerRepository {
  // -------------------------------------------------------------------------
  // Basic Retrieval
  // -------------------------------------------------------------------------

  /**
   * Get all careers.
   *
   * @returns Collection of all careers
   */
  getAllCareers(): CareerCollection;

  /**
   * Get a career by its unique ID.
   *
   * @param id - Career ID
   * @returns Career or undefined if not found
   */
  getCareerById(id: CareerId): Career | undefined;

  /**
   * Get a career by its slug.
   *
   * @param slug - Career slug
   * @returns Career or undefined if not found
   */
  getCareerBySlug(slug: CareerSlug): Career | undefined;

  /**
   * Get multiple careers by their IDs.
   *
   * @param ids - Array of career IDs
   * @returns Array of found careers (may be fewer than input if some not found)
   */
  getCareersByIds(ids: CareerId[]): Career[];

  // -------------------------------------------------------------------------
  // Category & Filtering
  // -------------------------------------------------------------------------

  /**
   * Get careers by category.
   *
   * @param category - Career category
   * @returns Collection of careers in the category
   */
  getCareersByCategory(category: CareerCategory): CareerCollection;

  /**
   * Get careers by multiple categories.
   *
   * @param categories - Array of career categories
   * @returns Collection of careers in any of the categories
   */
  getCareersByCategories(categories: CareerCategory[]): CareerCollection;

  /**
   * Filter careers based on criteria.
   *
   * @param filter - Filter criteria
   * @param sortBy - Optional sort order
   * @param offset - Pagination offset
   * @param limit - Pagination limit
   * @returns Filtered collection of careers
   */
  filterCareers(
    filter: CareerFilter,
    sortBy?: CareerSortOption,
    offset?: number,
    limit?: number
  ): CareerCollection;

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  /**
   * Search careers by text query.
   *
   * Searches in name, description, and tags.
   *
   * @param query - Search query string
   * @param offset - Pagination offset
   * @param limit - Pagination limit
   * @returns Collection of matching careers
   */
  searchCareers(
    query: string,
    offset?: number,
    limit?: number
  ): CareerCollection;

  /**
   * Advanced search with filters.
   *
   * Combines text search with filtering.
   *
   * @param query - Search query string
   * @param filter - Additional filter criteria
   * @param sortBy - Sort order
   * @param offset - Pagination offset
   * @param limit - Pagination limit
   * @returns Collection of matching careers
   */
  advancedSearch(
    query: string,
    filter?: CareerFilter,
    sortBy?: CareerSortOption,
    offset?: number,
    limit?: number
  ): CareerCollection;

  // -------------------------------------------------------------------------
  // Related Careers
  // -------------------------------------------------------------------------

  /**
   * Get adjacent careers for a given career.
   *
   * @param careerId - Career ID
   * @returns Array of adjacent careers
   */
  getAdjacentCareers(careerId: CareerId): Career[];

  /**
   * Get future career paths for a given career.
   *
   * @param careerId - Career ID
   * @returns Array of future career path careers
   */
  getFutureCareerPaths(careerId: CareerId): Career[];

  // -------------------------------------------------------------------------
  // Statistics & Metadata
  // -------------------------------------------------------------------------

  /**
   * Get total count of careers.
   */
  getCount(): number;

  /**
   * Get count by category.
   */
  getCountByCategory(category: CareerCategory): number;

  /**
   * Get all available categories with counts.
   */
  getCategoriesWithCounts(): Record<CareerCategory, number>;

  /**
   * Check if repository is ready (loaded).
   */
  isReady(): boolean;
}

// ============================================================================
// REPOSITORY OPTIONS
// ============================================================================

/**
 * Options for repository initialization.
 */
export interface CareerRepositoryOptions {
  /** Pre-load specific careers on initialization */
  preloadCareers?: Career[];

  /** Enable caching for expensive operations */
  enableCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTtl?: number;

  /** Logger function for debugging */
  logger?: (message: string, ...args: unknown[]) => void;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Extended filter options beyond the base CareerFilter.
 */
export interface ExtendedCareerFilter extends CareerFilter {
  /** Minimum overall confidence score */
  minConfidence?: number;

  /** Maximum coaching dependency (India-specific) */
  maxCoachingDependency?: number;

  /** Maximum urban advantage (India-specific) */
  maxUrbanAdvantage?: number;

  /** Whether to include only careers with reservation applicable */
  reservationApplicable?: boolean;
}

/**
 * Filter operators for complex queries.
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';

/**
 * Single filter condition.
 */
export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
}

/**
 * Complex filter with AND/OR logic.
 */
export interface ComplexFilter {
  and?: FilterCondition[];
  or?: FilterCondition[];
}

// ============================================================================
// REPOSITORY FACTORY
// ============================================================================

/**
 * Repository implementation types.
 */
export enum RepositoryType {
  IN_MEMORY = 'in_memory',
  FILE_SYSTEM = 'file_system',
  MONGODB = 'mongodb',
  POSTGRES = 'postgres',
}

/**
 * Factory function to create repository instances.
 *
 * Usage:
 *   const repo = createCareerRepository(RepositoryType.IN_MEMORY);
 *   const repo = createCareerRepository(RepositoryType.MONGODB, { url: '...' });
 */
export function createCareerRepository(
  type: RepositoryType.IN_MEMORY,
  options?: CareerRepositoryOptions
): CareerRepository;

export function createCareerRepository(
  type: RepositoryType,
  options?: CareerRepositoryOptions
): CareerRepository;

export function createCareerRepository(
  type: RepositoryType,
  options?: CareerRepositoryOptions
): CareerRepository {
  switch (type) {
    case RepositoryType.IN_MEMORY:
      return new InMemoryCareerRepository(options);

    case RepositoryType.FILE_SYSTEM:
      throw new Error('FileSystemCareerRepository not yet implemented');

    case RepositoryType.MONGODB:
      throw new Error('MongoCareerRepository not yet implemented');

    case RepositoryType.POSTGRES:
      throw new Error('PostgresCareerRepository not yet implemented');

    default:
      throw new Error(`Unknown repository type: ${type}`);
  }
}

// ============================================================================
// DEFAULT REPOSITORY INSTANCE
// ============================================================================

let defaultRepository: CareerRepository | null = null;

/**
 * Get the default career repository instance.
 *
 * Lazily initializes with InMemoryCareerRepository on first call.
 */
export function getDefaultCareerRepository(): CareerRepository {
  if (!defaultRepository) {
    defaultRepository = createCareerRepository(RepositoryType.IN_MEMORY);
  }
  return defaultRepository;
}

/**
 * Set the default career repository instance.
 *
 * Useful for dependency injection and testing.
 */
export function setDefaultCareerRepository(repository: CareerRepository): void {
  defaultRepository = repository;
}

/**
 * Reset the default repository (mainly for testing).
 */
export function resetDefaultCareerRepository(): void {
  defaultRepository = null;
}
