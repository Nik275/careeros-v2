/**
 * Student Domain
 *
 * CareerOS - Career Intelligence System
 *
 * Student profile management and related domain logic.
 */

// Main model and types
export type {
  // Core types
  ProfileScore,
  StudentProfileId,
  StudentId,
  Timestamp,

  // Psychology
  PsychologyProfile,

  // Motivations
  Motivations,
  PrimaryMotivation,

  // Reality Constraints
  RealityConstraints,
  FinancialContext,
  FamilyContext,
  GeographicContext,
  AccessibilityContext,

  // Academic
  AcademicProfile,
  AcademicPerformance,
  SubjectGrade,
  AptitudeScores,
  ExamResult,
  AcademicInterests,

  // Decision Context
  DecisionContext,
  DecisionTimeline,
  DecisionConfidenceAssessment,
  InformationNeeds,

  // Main interface
  StudentProfile,
} from './StudentProfile';

// Enums
export {
  EducationStage,
  AcademicStream,
  EducationBoard,
  LocationType,
  LanguageComfort,
  CoachingAccess,
  FamilyIncomeBracket,
  FamilyPressure,
  DecisionUrgency,
  ExplorationStage,
  DecisionConfidence,
  GradeScale,
  CompetitiveExamType,
} from './StudentProfile';

// Validation functions
export {
  isValidProfileScore,
  validatePsychologyProfile,
  validateMotivations,
  validateStudentProfile,
} from './StudentProfile';

// Builder
export { StudentProfileBuilder } from './StudentProfile';

// Utility functions
export {
  createNeutralPsychologyProfile,
  createNeutralMotivations,
  derivePrimaryMotivation,
  calculateProfileCompleteness,
  formatProfileScore,
  comparePsychologyProfiles,
  isStudentProfile,
} from './StudentProfile';
