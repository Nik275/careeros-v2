/**
 * Career Criticality Engine
 *
 * Phase 8.6: CareerOS Career Criticality Engine
 *
 * Helps CareerOS understand how much a decision matters:
 * - How irreversible a decision is
 * - How many future opportunities a decision closes
 * - How much optionality is lost
 * - How much flexibility remains
 * - Which decisions create long-term lock-in
 * - Which decisions are easy to reverse
 *
 * This engine answers not just "What is the best choice?" but
 * "How much does this choice matter?"
 *
 * @module career-criticality
 * @version 1.0.0
 */

// Export all types
export * from './criticality-types';

// Export Path Dependency Engine
export {
  PathDependencyEngine,
  createPathDependencyEngine,
  analyzePathDependency,
} from './path-dependency-engine';

// Export Option Closure Engine
export {
  OptionClosureEngine,
  createOptionClosureEngine,
  analyzeOptionClosure,
} from './option-closure-engine';

// Export Future Flexibility Engine
export {
  FutureFlexibilityEngine,
  createFutureFlexibilityEngine,
  analyzeFutureFlexibility,
} from './future-flexibility-engine';

// Export Criticality Engine
export {
  CriticalityEngine,
  createCriticalityEngine,
  analyzeCriticality,
  compareCriticality,
  quickCriticalityCheck,
} from './criticality-engine';

// Export Criticality Report Engine
export {
  CriticalityReportEngine,
  createCriticalityReportEngine,
  generateCriticalityReport,
  generateQuickReport,
} from './criticality-report-engine';

// Default export - main criticality engine
export { createCriticalityEngine as default } from './criticality-engine';
