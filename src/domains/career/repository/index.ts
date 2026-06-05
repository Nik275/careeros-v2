/**
 * Career Repository Layer
 *
 * CareerOS - Career Intelligence System
 *
 * Data access layer for career information. Provides abstraction over
 * data storage mechanism (in-memory, database, etc.)
 *
 * Usage:
 *   import { getDefaultCareerRepository, RepositoryType } from './repository';
 *
 *   // Get default repository (in-memory)
 *   const repo = getDefaultCareerRepository();
 *
 *   // Get career by slug
 *   const career = repo.getCareerBySlug('software-engineer');
 *
 *   // Search careers
 *   const results = repo.searchCareers('engineer');
 *
 *   // Filter careers
 *   const techCareers = repo.getCareersByCategory(CareerCategory.TECHNOLOGY);
 */

// Repository interface and types
export type {
  CareerRepository,
  CareerRepositoryOptions,
  ExtendedCareerFilter,
  FilterCondition,
  ComplexFilter,
} from './CareerRepository';

export {
  RepositoryType,
  createCareerRepository,
  getDefaultCareerRepository,
  setDefaultCareerRepository,
  resetDefaultCareerRepository,
} from './CareerRepository';

// Implementation
export { InMemoryCareerRepository } from './InMemoryCareerRepository';
