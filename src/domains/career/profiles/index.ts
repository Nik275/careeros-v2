/**
 * Career Profiles
 *
 * CareerOS - Career Intelligence System
 *
 * Fully populated career profiles for use in CareerOS.
 * Each career includes complete data across all dimensions
 * with realistic India-specific context.
 */

// Individual career exports
export { softwareEngineer } from './softwareEngineer';
export { doctor } from './doctor';
export { lawyer } from './lawyer';
export { charteredAccountant } from './charteredAccountant';
export { productManager } from './productManager';
export { dataScientist } from './dataScientist';
export { civilServant } from './civilServant';
export { teacher } from './teacher';
export { entrepreneur } from './entrepreneur';
export { uxDesigner } from './uxDesigner';

// Career collection
import { softwareEngineer } from './softwareEngineer';
import { doctor } from './doctor';
import { lawyer } from './lawyer';
import { charteredAccountant } from './charteredAccountant';
import { productManager } from './productManager';
import { dataScientist } from './dataScientist';
import { civilServant } from './civilServant';
import { teacher } from './teacher';
import { entrepreneur } from './entrepreneur';
import { uxDesigner } from './uxDesigner';

import type { Career } from '../Career';

/**
 * All career profiles.
 */
export const allCareers: Career[] = [
  softwareEngineer,
  doctor,
  lawyer,
  charteredAccountant,
  productManager,
  dataScientist,
  civilServant,
  teacher,
  entrepreneur,
  uxDesigner,
];

/**
 * Career registry for lookup by slug.
 */
export const careerRegistry: Record<string, Career> = {
  [softwareEngineer.slug]: softwareEngineer,
  [doctor.slug]: doctor,
  [lawyer.slug]: lawyer,
  [charteredAccountant.slug]: charteredAccountant,
  [productManager.slug]: productManager,
  [dataScientist.slug]: dataScientist,
  [civilServant.slug]: civilServant,
  [teacher.slug]: teacher,
  [entrepreneur.slug]: entrepreneur,
  [uxDesigner.slug]: uxDesigner,
};

/**
 * Get a career by its slug.
 */
export function getCareerBySlug(slug: string): Career | undefined {
  return careerRegistry[slug];
}

/**
 * Get all career profiles.
 */
export function getAllCareers(): Career[] {
  return [...allCareers];
}

/**
 * Get careers by category.
 */
export function getCareersByCategory(category: string): Career[] {
  return allCareers.filter(career => career.category === category);
}

/**
 * Number of available career profiles.
 */
export const CAREER_COUNT = allCareers.length;
