/**
 * Career Examples
 *
 * Pre-defined career profiles using the CareerOS domain model.
 *
 * These examples demonstrate proper career definition and serve as
 * reference implementations for adding new careers.
 */

export { softwareEngineer } from './softwareEngineer';
export { doctor } from './doctor';

// Example career collection for testing
import { softwareEngineer } from './softwareEngineer';
import { doctor } from './doctor';
import type { Career } from '../Career';

/**
 * Sample careers for development and testing.
 */
export const sampleCareers: Career[] = [
  softwareEngineer,
  doctor,
];

/**
 * Career registry for lookup by slug.
 */
export const careerRegistry: Record<string, Career> = {
  [softwareEngineer.slug]: softwareEngineer,
  [doctor.slug]: doctor,
};

/**
 * Get a career by its slug.
 */
export function getCareerBySlug(slug: string): Career | undefined {
  return careerRegistry[slug];
}

/**
 * Get all example careers.
 */
export function getAllExampleCareers(): Career[] {
  return [...sampleCareers];
}
