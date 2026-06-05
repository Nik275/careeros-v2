/**
 * CareerOS Student Profile Generator
 *
 * Phase B.3: Profile Generation Layer
 *
 * @module profile-generator
 * @version 1.0.0
 */

// Profile Types
export {
  DEFAULT_PROFILE_CONFIG,
  type AssessmentResult,
  type ProfileInterpretation,
  type IdentifiedStrength,
  type IdentifiedWeakness,
  type StudentArchetype,
  type ProfileInsights,
  type GeneratedProfile,
  type ArchetypeDefinition,
  type ProfileGenerationConfig,
  type ComponentConfidence,
} from './profile-types';

// Profile Generator
export {
  ProfileGenerator,
  createProfileGenerator,
} from './profile-generator';

// Profile Synthesizer
export {
  ProfileSynthesizer,
  createProfileSynthesizer,
} from './profile-synthesizer';

// Profile Interpreter
export {
  ProfileInterpreter,
  createProfileInterpreter,
} from './profile-interpreter';

// Profile Insights Engine
export {
  ProfileInsightsEngine,
  createProfileInsightsEngine,
} from './profile-insights-engine';
