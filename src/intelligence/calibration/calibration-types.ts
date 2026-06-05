/**
 * CareerOS Intelligence Calibration Engine - Type Definitions
 * 
 * Ensures confidence scores reflect actual reliability through
 * continuous learning from real-world outcomes.
 */

// ============================================================================
// CORE CALIBRATION TYPES
// ============================================================================

export type ConfidenceLevel = number; // 0-1
export type ReliabilityScore = number; // 0-1
export type CalibrationError = number; // 0-1, lower is better
export type Timestamp = number;

export enum ReliabilityBand {
  EXCELLENT = 'excellent',    // 0.90-1.00
  GOOD = 'good',              // 0.75-0.89
  MODERATE = 'moderate',      // 0.60-0.74
  POOR = 'poor',              // 0.40-0.59
  UNRELIABLE = 'unreliable',  // 0.00-0.39
}

export enum CalibrationStatus {
  WELL_CALIBRATED = 'well_calibrated',
  OVERCONFIDENT = 'overconfident',
  UNDERCONFIDENT = 'underconfident',
  INSUFFICIENT_DATA = 'insufficient_data',
  DRIFTING = 'drifting',
}

// ============================================================================
// CALIBRATION OBSERVATIONS
// ============================================================================

export interface CalibrationObservation {
  id: string;
  predictedConfidence: ConfidenceLevel;
  actualOutcome: boolean;
  outcomeQuality: number; // 0-1, how good was the outcome
  timestamp: Timestamp;
  context: CalibrationContext;
  metadata: Record<string, unknown>;
}

export interface CalibrationContext {
  domain: string;
  decisionType: string;
  userSegment: string;
  marketConditions?: string;
  timeHorizon: TimeHorizon;
}

export enum TimeHorizon {
  IMMEDIATE = 'immediate',     // < 1 day
  SHORT = 'short',             // 1-7 days
  MEDIUM = 'medium',           // 1-4 weeks
  LONG = 'long',               // 1-6 months
  EXTENDED = 'extended',       // 6+ months
}

// ============================================================================
// CALIBRATION PROFILES
// ============================================================================

export interface CalibrationProfile {
  id: string;
  name: string;
  status: CalibrationStatus;
  reliabilityBand: ReliabilityBand;
  reliabilityScore: ReliabilityScore;
  calibrationError: CalibrationError;
  sampleSize: number;
  lastUpdated: Timestamp;
  binCalibrations: BinCalibration[];
  trend: CalibrationTrend;
}

export interface BinCalibration {
  binRange: [number, number]; // [min, max] confidence
  predictedRate: number;      // Average predicted confidence in bin
  observedRate: number;       // Actual success rate in bin
  sampleCount: number;
  calibrationError: number;
}

export interface CalibrationTrend {
  direction: 'improving' | 'stable' | 'degrading';
  rate: number; // Change per period
  periodsAnalyzed: number;
}

// ============================================================================
// DOMAIN-SPECIFIC PROFILES
// ============================================================================

export interface RecommendationCalibrationProfile extends CalibrationProfile {
  recommendationTypes: Map<string, CalibrationProfile>;
  categoryCalibrations: Map<string, CalibrationProfile>;
  successMetrics: RecommendationSuccessMetrics;
}

export interface RecommendationSuccessMetrics {
  acceptedRate: number;
  actedUponRate: number;
  positiveOutcomeRate: number;
  userSatisfactionRate: number;
}

export interface DecisionCalibrationProfile extends CalibrationProfile {
  decisionTypes: Map<string, CalibrationProfile>;
  complexityCalibrations: Map<string, CalibrationProfile>;
  qualityMetrics: DecisionQualityMetrics;
}

export interface DecisionQualityMetrics {
  optimalChoiceRate: number;
  regretRate: number;
  longTermSuccessRate: number;
  stakeholderSatisfactionRate: number;
}

export interface RegretCalibrationProfile extends CalibrationProfile {
  regretTypes: Map<string, CalibrationProfile>;
  severityCalibrations: Map<string, CalibrationProfile>;
  predictionMetrics: RegretPredictionMetrics;
}

export interface RegretPredictionMetrics {
  truePositiveRate: number;  // Predicted regret that occurred
  falsePositiveRate: number; // Predicted regret that didn't occur
  trueNegativeRate: number;  // Predicted no regret, no regret occurred
  falseNegativeRate: number; // Predicted no regret, regret occurred
  severityAccuracy: number;
}

export interface CriticalityCalibrationProfile extends CalibrationProfile {
  criticalityLevels: Map<string, CalibrationProfile>;
  impactCalibrations: Map<string, CalibrationProfile>;
  impactMetrics: ImpactMetrics;
}

export interface ImpactMetrics {
  shortTermAccuracy: number;
  longTermAccuracy: number;
  impactMagnitudeAccuracy: number;
  impactDirectionAccuracy: number;
}

// ============================================================================
// RELIABILITY ENGINE TYPES
// ============================================================================

export interface ReliabilityAssessment {
  score: ReliabilityScore;
  band: ReliabilityBand;
  confidence: ConfidenceLevel;
  factors: ReliabilityFactor[];
  recommendations: string[];
}

export interface ReliabilityFactor {
  name: string;
  weight: number;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ConfidenceTrustworthiness {
  confidence: ConfidenceLevel;
  reliabilityScore: ReliabilityScore;
  adjustedConfidence: ConfidenceLevel;
  trustLevel: TrustLevel;
  explanation: string;
}

export enum TrustLevel {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  UNTRUSTWORTHY = 'untrustworthy',
}

// ============================================================================
// CALIBRATION REPORT TYPES
// ============================================================================

export interface CalibrationReport {
  id: string;
  generatedAt: Timestamp;
  period: [Timestamp, Timestamp];
  summary: CalibrationSummary;
  systemCalibrations: SystemCalibration[];
  driftAnalysis: DriftAnalysis;
  learningProgress: LearningProgress;
  recommendations: CalibrationRecommendation[];
}

export interface CalibrationSummary {
  overallReliability: ReliabilityScore;
  systemsCalibrated: number;
  systemsDrifting: number;
  averageCalibrationError: number;
  worstPerformingSystem: string;
  bestPerformingSystem: string;
}

export interface SystemCalibration {
  systemId: string;
  systemName: string;
  profile: CalibrationProfile;
  rank: number;
  changeFromLastPeriod: number;
}

export interface DriftAnalysis {
  detected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  affectedSystems: string[];
  driftDirection: 'overconfidence' | 'underconfidence' | 'mixed';
  rootCauseAnalysis?: string;
}

export interface LearningProgress {
  observationsAdded: number;
  calibrationImprovement: number;
  convergenceRate: number;
  estimatedTimeToWellCalibrated: number; // in days
}

export interface CalibrationRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  system: string;
  issue: string;
  action: string;
  expectedImpact: number;
}

// ============================================================================
// CALIBRATION ENGINE CONFIGURATION
// ============================================================================

export interface CalibrationEngineConfig {
  minSampleSize: number;
  binCount: number;
  confidenceThreshold: number;
  recalibrationInterval: number; // milliseconds
  driftDetectionWindow: number; // milliseconds
  maxCalibrationError: number;
  learningRate: number;
  enableAutoCorrection: boolean;
}

export const DEFAULT_CALIBRATION_CONFIG: CalibrationEngineConfig = {
  minSampleSize: 30,
  binCount: 10,
  confidenceThreshold: 0.5,
  recalibrationInterval: 24 * 60 * 60 * 1000, // 24 hours
  driftDetectionWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxCalibrationError: 0.15,
  learningRate: 0.1,
  enableAutoCorrection: true,
};

// ============================================================================
// CALIBRATION EVENTS
// ============================================================================

export interface CalibrationEvent {
  type: CalibrationEventType;
  timestamp: Timestamp;
  systemId: string;
  data: unknown;
}

export enum CalibrationEventType {
  OBSERVATION_ADDED = 'observation_added',
  CALIBRATION_UPDATED = 'calibration_updated',
  DRIFT_DETECTED = 'drift_detected',
  RELIABILITY_CHANGED = 'reliability_changed',
  AUTO_CORRECTION_APPLIED = 'auto_correction_applied',
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ConfidenceAdjustment {
  originalConfidence: ConfidenceLevel;
  adjustedConfidence: ConfidenceLevel;
  adjustmentFactor: number;
  reason: string;
}

export interface CalibrationMetrics {
  expectedCalibrationError: number;
  maximumCalibrationError: number;
  brierScore: number;
  reliabilityDiagram: ReliabilityDiagramPoint[];
}

export interface ReliabilityDiagramPoint {
  predictedProbability: number;
  observedFrequency: number;
  sampleCount: number;
}

export interface CalibrationHistory {
  timestamps: Timestamp[];
  reliabilityScores: ReliabilityScore[];
  calibrationErrors: CalibrationError[];
  sampleSizes: number[];
}
