/**
 * CareerOS - Outcome Tracking Engine
 *
 * Phase: Outcome Tracking Engine
 *
 * Intelligence feedback system for CareerOS.
 *
 * Track: Recommendation → Decision → Action → Outcome
 *
 * Learn: Which recommendations actually work
 *
 * @module outcome-tracking
 * @version 1.0.0
 */

// Export all types
export * from './types';

// Export all engines
export * from './engines';

// Re-export main engine for convenience
export { OutcomeTrackingEngine } from './engines';
