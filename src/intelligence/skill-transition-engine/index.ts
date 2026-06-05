/**
 * CareerOS Skill Transition Engine V1
 *
 * Analyzes career transitions using actual skill profiles.
 * Transition quality emerges from skill relationships, not arbitrary scores.
 *
 * Integrates with:
 * - Career Graph V2 (weighted transitions)
 * - Optionality Engine (pivot potential)
 * - Criticality Engine (irreversibility)
 * - Path Explorer (path quality)
 * - Future Explorer (scenario modeling)
 * - Recommendation Engine (fit scoring)
 *
 * @module intelligence/skill-transition-engine
 * @version 1.0.0
 */

export {
  SkillTransitionEngineV1,
  createSkillTransitionEngine,
  analyzeCareerTransition,
  compareTransitions,
  generateCareerGraphEdgeData,
  generateOptionalityData,
  generatePathExplorerData,
  DEFAULT_SKILL_TRANSITION_CONFIG,
} from './SkillTransitionEngineV1.js';

export type {
  TransitionAnalysisId,
  SkillMatch,
  MissingSkill,
  TransferableSkill,
  LearningPath,
  SkillTransitionAnalysis,
  SkillTransitionEngineConfig,
  SkillTransitionInput,
  TransitionComparison,
} from './SkillTransitionEngineV1.js';
