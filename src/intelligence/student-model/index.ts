/**
 * Student model public export surface.
 *
 * Compatibility barrel for modules that import from `../student-model`.
 */

export * from './StudentBelief';
export * from './StudentModelEngine';
export * from './StudentBeliefV3';

export type {
  StudentBelief,
  StudentBeliefV3,
} from '../types';
