/**
 * Regret Prediction Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine
 *
 * Helps CareerOS understand future regret:
 * - Likely future regrets
 * - Regret sources
 * - Regret severity
 * - Regret probability
 * - Preventable regret
 * - Irreversible regret
 * - Identity regret
 * - Exploration regret
 * - Opportunity regret
 *
 * Core philosophy: Humans rarely regret working too hard.
 * Humans often regret paths never explored, risks never taken,
 * identities never expressed, opportunities abandoned.
 *
 * CareerOS helps students identify future regret before it happens,
 * not to predict the future, but to enable wiser decision-making.
 *
 * @module regret-prediction
 * @version 1.0.0
 */

// Export all types
export * from './regret-types';

// Export Exploration Regret Engine
export {
  ExplorationRegretEngine,
  createExplorationRegretEngine,
  analyzeExplorationRegret,
} from './exploration-regret-engine';

// Export Identity Regret Engine
export {
  IdentityRegretEngine,
  createIdentityRegretEngine,
  analyzeIdentityRegret,
} from './identity-regret-engine';

// Export Opportunity Regret Engine
export {
  OpportunityRegretEngine,
  createOpportunityRegretEngine,
  analyzeOpportunityRegret,
} from './opportunity-regret-engine';

// Export Fear-Driven Regret Engine
export {
  FearDrivenRegretEngine,
  createFearDrivenRegretEngine,
  analyzeFearDrivenRegret,
} from './fear-driven-regret-engine';

// Export Approval-Driven Regret Engine
export {
  ApprovalDrivenRegretEngine,
  createApprovalDrivenRegretEngine,
  analyzeApprovalDrivenRegret,
} from './approval-driven-regret-engine';

// Export Regret Forecast Engine
export {
  RegretForecastEngine,
  createRegretForecastEngine,
  generateRegretForecast,
} from './regret-forecast-engine';

// Export Regret Prediction Engine
export {
  RegretPredictionEngine,
  createRegretPredictionEngine,
  predictRegret,
  compareRegretOptions,
  quickRegretCheck,
} from './regret-prediction-engine';

// Export Regret Report Engine
export {
  RegretReportEngine,
  createRegretReportEngine,
  generateRegretReport,
  generateQuickRegretReport,
} from './regret-report-engine';

// Default export - main regret prediction engine
export { createRegretPredictionEngine as default } from './regret-prediction-engine';
