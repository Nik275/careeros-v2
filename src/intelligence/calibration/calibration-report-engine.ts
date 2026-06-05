/**
 * Calibration Report Engine
 *
 * Generates comprehensive calibration reports including:
 * - Most/Least reliable systems
 * - Overconfidence/Underconfidence areas
 * - Calibration drift detection
 * - Learning progress tracking
 */

import {
  CalibrationReport,
  CalibrationSummary,
  SystemCalibration,
  DriftAnalysis,
  LearningProgress,
  CalibrationRecommendation,
  CalibrationProfile,
  CalibrationStatus,
  ReliabilityBand,
  Timestamp,
} from './calibration-types';
import { ReliabilityEngine } from './reliability-engine';

export interface ReportEngineConfig {
  reportPeriod: number; // milliseconds
  minObservationsForDrift: number;
  driftThreshold: number;
  maxRecommendations: number;
}

export const DEFAULT_REPORT_CONFIG: ReportEngineConfig = {
  reportPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
  minObservationsForDrift: 100,
  driftThreshold: 0.1,
  maxRecommendations: 10,
};

export interface SystemProfile {
  id: string;
  name: string;
  profile: CalibrationProfile;
  history: {
    reliabilityScores: number[];
    calibrationErrors: number[];
    sampleSizes: number[];
  };
}

export class CalibrationReportEngine {
  private config: ReportEngineConfig;
  private reliabilityEngine: ReliabilityEngine;
  private systemProfiles: Map<string, SystemProfile> = new Map();
  private lastReportTime: Timestamp = 0;

  constructor(config: Partial<ReportEngineConfig> = {}) {
    this.config = { ...DEFAULT_REPORT_CONFIG, ...config };
    this.reliabilityEngine = new ReliabilityEngine();
  }

  /**
   * Register a system for reporting
   */
  registerSystem(id: string, name: string, profile: CalibrationProfile): void {
    this.systemProfiles.set(id, {
      id,
      name,
      profile,
      history: {
        reliabilityScores: [],
        calibrationErrors: [],
        sampleSizes: [],
      },
    });
  }

  /**
   * Update system profile
   */
  updateSystemProfile(id: string, profile: CalibrationProfile): void {
    const system = this.systemProfiles.get(id);
    if (system) {
      system.profile = profile;
      system.history.reliabilityScores.push(profile.reliabilityScore);
      system.history.calibrationErrors.push(profile.calibrationError);
      system.history.sampleSizes.push(profile.sampleSize);

      // Keep history manageable
      const maxHistory = 50;
      if (system.history.reliabilityScores.length > maxHistory) {
        system.history.reliabilityScores.shift();
        system.history.calibrationErrors.shift();
        system.history.sampleSizes.shift();
      }
    }
  }

  /**
   * Generate calibration report
   */
  generateReport(period?: [Timestamp, Timestamp]): CalibrationReport {
    const now = Date.now();
    const reportPeriod: [Timestamp, Timestamp] = period || [
      now - this.config.reportPeriod,
      now,
    ];

    const systems = Array.from(this.systemProfiles.values());

    const summary = this.generateSummary(systems);
    const systemCalibrations = this.generateSystemCalibrations(systems);
    const driftAnalysis = this.analyzeDrift(systems);
    const learningProgress = this.calculateLearningProgress(systems, reportPeriod);
    const recommendations = this.generateRecommendations(systems);

    this.lastReportTime = now;

    return {
      id: `report-${now}`,
      generatedAt: now,
      period: reportPeriod,
      summary,
      systemCalibrations,
      driftAnalysis,
      learningProgress,
      recommendations,
    };
  }

  /**
   * Generate report summary
   */
  private generateSummary(systems: SystemProfile[]): CalibrationSummary {
    if (systems.length === 0) {
      return {
        overallReliability: 0,
        systemsCalibrated: 0,
        systemsDrifting: 0,
        averageCalibrationError: 0,
        worstPerformingSystem: '',
        bestPerformingSystem: '',
      };
    }

    const reliabilityScores = systems.map(s => s.profile.reliabilityScore);
    const calibrationErrors = systems.map(s => s.profile.calibrationError);

    const sortedByReliability = [...systems].sort(
      (a, b) => a.profile.reliabilityScore - b.profile.reliabilityScore
    );

    const driftingCount = systems.filter(
      s => s.profile.status === CalibrationStatus.DRIFTING
    ).length;

    return {
      overallReliability:
        reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length,
      systemsCalibrated: systems.filter(
        s => s.profile.status !== CalibrationStatus.INSUFFICIENT_DATA
      ).length,
      systemsDrifting: driftingCount,
      averageCalibrationError:
        calibrationErrors.reduce((a, b) => a + b, 0) / calibrationErrors.length,
      worstPerformingSystem: sortedByReliability[0]?.name || '',
      bestPerformingSystem: sortedByReliability[sortedByReliability.length - 1]?.name || '',
    };
  }

  /**
   * Generate system calibrations with rankings
   */
  private generateSystemCalibrations(systems: SystemProfile[]): SystemCalibration[] {
    return systems
      .map(system => ({
        systemId: system.id,
        systemName: system.name,
        profile: system.profile,
        rank: 0, // Will be set after sorting
        changeFromLastPeriod: this.calculateChangeFromLastPeriod(system),
      }))
      .sort((a, b) => b.profile.reliabilityScore - a.profile.reliabilityScore)
      .map((calibration, index) => ({
        ...calibration,
        rank: index + 1,
      }));
  }

  /**
   * Calculate change from last period
   */
  private calculateChangeFromLastPeriod(system: SystemProfile): number {
    const history = system.history.reliabilityScores;
    if (history.length < 2) return 0;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    return current - previous;
  }

  /**
   * Analyze calibration drift across systems
   */
  private analyzeDrift(systems: SystemProfile[]): DriftAnalysis {
    const driftingSystems: string[] = [];
    let overconfidentCount = 0;
    let underconfidentCount = 0;

    systems.forEach(system => {
      const history = system.history.calibrationErrors;
      if (history.length < 5) return;

      const recent = history.slice(-3);
      const older = history.slice(-6, -3);

      if (older.length === 0) return;

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

      if (Math.abs(recentAvg - olderAvg) > this.config.driftThreshold) {
        driftingSystems.push(system.name);

        if (system.profile.status === CalibrationStatus.OVERCONFIDENT) {
          overconfidentCount++;
        } else if (system.profile.status === CalibrationStatus.UNDERCONFIDENT) {
          underconfidentCount++;
        }
      }
    });

    const severity =
      driftingSystems.length === 0
        ? 'none'
        : driftingSystems.length < 3
        ? 'mild'
        : driftingSystems.length < 6
        ? 'moderate'
        : 'severe';

    let driftDirection: 'overconfidence' | 'underconfidence' | 'mixed';
    if (overconfidentCount > 0 && underconfidentCount > 0) {
      driftDirection = 'mixed';
    } else if (overconfidentCount > 0) {
      driftDirection = 'overconfidence';
    } else if (underconfidentCount > 0) {
      driftDirection = 'underconfidence';
    } else {
      driftDirection = 'mixed';
    }

    return {
      detected: driftingSystems.length > 0,
      severity,
      affectedSystems: driftingSystems,
      driftDirection,
      rootCauseAnalysis:
        driftingSystems.length > 0
          ? `Drift detected in ${driftingSystems.length} systems. ${overconfidentCount} overconfident, ${underconfidentCount} underconfident.`
          : undefined,
    };
  }

  /**
   * Calculate learning progress
   */
  private calculateLearningProgress(
    systems: SystemProfile[],
    period: [Timestamp, Timestamp]
  ): LearningProgress {
    const totalObservations = systems.reduce(
      (sum, s) => sum + s.profile.sampleSize,
      0
    );

    // Calculate improvement rate
    const improvements = systems.map(system => {
      const history = system.history.reliabilityScores;
      if (history.length < 5) return 0;

      const recent = history.slice(-5);
      const earlier = history.slice(0, 5);

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

      return recentAvg - earlierAvg;
    });

    const avgImprovement =
      improvements.reduce((a, b) => a + b, 0) / improvements.length;

    // Estimate time to well calibrated (reliability > 0.8)
    const belowThreshold = systems.filter(s => s.profile.reliabilityScore < 0.8);
    const avgGap = belowThreshold.reduce(
      (sum, s) => sum + (0.8 - s.profile.reliabilityScore),
      0
    ) / Math.max(1, belowThreshold.length);

    const convergenceRate = avgImprovement > 0 ? avgImprovement : 0.001;
    const estimatedDays = Math.ceil(avgGap / convergenceRate);

    return {
      observationsAdded: totalObservations,
      calibrationImprovement: avgImprovement,
      convergenceRate,
      estimatedTimeToWellCalibrated: estimatedDays,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    systems: SystemProfile[]
  ): CalibrationRecommendation[] {
    const recommendations: CalibrationRecommendation[] = [];

    // Find most overconfident system
    const overconfident = systems.filter(
      s => s.profile.status === CalibrationStatus.OVERCONFIDENT
    );
    if (overconfident.length > 0) {
      const worst = overconfident.sort(
        (a, b) => b.profile.calibrationError - a.profile.calibrationError
      )[0];
      recommendations.push({
        priority: 'critical',
        system: worst.name,
        issue: `Overconfident by ${(worst.profile.calibrationError * 100).toFixed(1)}%`,
        action: 'Apply 15-20% confidence discount and review model features',
        expectedImpact: 0.2,
      });
    }

    // Find systems with insufficient data
    const insufficient = systems.filter(
      s => s.profile.status === CalibrationStatus.INSUFFICIENT_DATA
    );
    insufficient.forEach(system => {
      recommendations.push({
        priority: 'high',
        system: system.name,
        issue: `Only ${system.profile.sampleSize} observations`,
        action: 'Collect at least 50 more observations',
        expectedImpact: 0.15,
      });
    });

    // Find degrading systems
    const degrading = systems.filter(s => {
      const history = s.history.reliabilityScores;
      if (history.length < 5) return false;

      const recent = history.slice(-3);
      const older = history.slice(-6, -3);
      if (older.length === 0) return false;

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

      return recentAvg < olderAvg - 0.05;
    });

    degrading.forEach(system => {
      recommendations.push({
        priority: 'high',
        system: system.name,
        issue: 'Calibration is degrading',
        action: 'Investigate data drift and retrain model',
        expectedImpact: 0.15,
      });
    });

    // Find unreliable systems
    const unreliable = systems.filter(
      s => s.profile.reliabilityBand === ReliabilityBand.UNRELIABLE
    );
    unreliable.forEach(system => {
      recommendations.push({
        priority: 'medium',
        system: system.name,
        issue: 'System is unreliable',
        action: 'Complete recalibration with recent data',
        expectedImpact: 0.25,
      });
    });

    return recommendations.slice(0, this.config.maxRecommendations);
  }

  /**
   * Get most reliable systems
   */
  getMostReliableSystems(limit: number = 5): SystemCalibration[] {
    const systems = Array.from(this.systemProfiles.values());
    return this.generateSystemCalibrations(systems).slice(0, limit);
  }

  /**
   * Get least reliable systems
   */
  getLeastReliableSystems(limit: number = 5): SystemCalibration[] {
    const systems = Array.from(this.systemProfiles.values());
    return this.generateSystemCalibrations(systems)
      .sort((a, b) => a.profile.reliabilityScore - b.profile.reliabilityScore)
      .slice(0, limit);
  }

  /**
   * Get overconfidence areas
   */
  getOverconfidenceAreas(): Array<{
    system: string;
    overconfidence: number;
    sampleSize: number;
  }> {
    return Array.from(this.systemProfiles.values())
      .filter(s => s.profile.status === CalibrationStatus.OVERCONFIDENT)
      .map(s => ({
        system: s.name,
        overconfidence: s.profile.calibrationError,
        sampleSize: s.profile.sampleSize,
      }))
      .sort((a, b) => b.overconfidence - a.overconfidence);
  }

  /**
   * Get underconfidence areas
   */
  getUnderconfidenceAreas(): Array<{
    system: string;
    underconfidence: number;
    sampleSize: number;
  }> {
    return Array.from(this.systemProfiles.values())
      .filter(s => s.profile.status === CalibrationStatus.UNDERCONFIDENT)
      .map(s => ({
        system: s.name,
        underconfidence: s.profile.calibrationError,
        sampleSize: s.profile.sampleSize,
      }))
      .sort((a, b) => b.underconfidence - a.underconfidence);
  }

  /**
   * Get calibration trends
   */
  getCalibrationTrends(): Array<{
    system: string;
    trend: 'improving' | 'stable' | 'degrading';
    rate: number;
  }> {
    return Array.from(this.systemProfiles.values()).map(system => ({
      system: system.name,
      trend: system.profile.trend.direction,
      rate: system.profile.trend.rate,
    }));
  }

  /**
   * Export report as JSON
   */
  exportReport(report: CalibrationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate summary statistics
   */
  generateSummaryStats(): {
    totalSystems: number;
    wellCalibratedCount: number;
    overconfidentCount: number;
    underconfidentCount: number;
    insufficientDataCount: number;
    averageSampleSize: number;
    totalObservations: number;
  } {
    const systems = Array.from(this.systemProfiles.values());

    return {
      totalSystems: systems.length,
      wellCalibratedCount: systems.filter(
        s => s.profile.status === CalibrationStatus.WELL_CALIBRATED
      ).length,
      overconfidentCount: systems.filter(
        s => s.profile.status === CalibrationStatus.OVERCONFIDENT
      ).length,
      underconfidentCount: systems.filter(
        s => s.profile.status === CalibrationStatus.UNDERCONFIDENT
      ).length,
      insufficientDataCount: systems.filter(
        s => s.profile.status === CalibrationStatus.INSUFFICIENT_DATA
      ).length,
      averageSampleSize:
        systems.reduce((sum, s) => sum + s.profile.sampleSize, 0) /
        Math.max(1, systems.length),
      totalObservations: systems.reduce(
        (sum, s) => sum + s.profile.sampleSize,
        0
      ),
    };
  }

  /**
   * Clear all system profiles
   */
  clearSystems(): void {
    this.systemProfiles.clear();
  }

  /**
   * Get registered system count
   */
  getSystemCount(): number {
    return this.systemProfiles.size;
  }
}
