/**
 * CareerOS Outcome Tracking System - Student Growth Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Tracks and analyzes student growth across multiple dimensions,
 * identifies patterns, and generates personalized growth insights.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentGrowthProfile,
  type GrowthMeasurement,
  type GrowthSnapshot,
  type GrowthDimension,
  type IGrowthEngine,
  type StudentId,
  type StudentOutcomeRecord,
  type TimelineEntry,
} from './outcome-types.js';

// ============================================================================
// GROWTH TYPES
// ============================================================================

/** Growth trajectory analysis */
export interface GrowthTrajectory {
  dimension: GrowthDimension;
  currentValue: number;
  slope: number;
  acceleration: number;
  projectedValue: number;
  projectionConfidence: number;
  inflectionPoints: Array<{
    timestamp: number;
    value: number;
    type: 'ACCELERATION' | 'DECELERATION' | 'PLATEAU' | 'BREAKTHROUGH';
  }>;
}

/** Growth pattern detection result */
export interface GrowthPattern {
  pattern: 'STEADY' | 'STEPWISE' | 'CYCLICAL' | 'DELAYED' | 'ACCELERATING' | 'DECLINING' | 'PLATEAUED';
  confidence: number;
  description: string;
  triggers: string[];
  recommendations: string[];
}

/** Comparative growth analysis */
export interface ComparativeGrowth {
  studentId: StudentId;
  dimension: GrowthDimension;
  studentGrowth: number;
  peerAverageGrowth: number;
  percentile: number;
  comparisonGroup: string;
  interpretation: string;
}

/** Growth recommendation */
export interface GrowthRecommendation {
  dimension: GrowthDimension;
  currentLevel: number;
  targetLevel: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actions: string[];
  resources: string[];
  expectedTimeline: string;
  expectedImpact: number;
}

/** Growth milestone */
export interface GrowthMilestone {
  dimension: GrowthDimension;
  level: number;
  title: string;
  description: string;
  achievedAt?: number;
  progress: number;
}

/** Growth report */
export interface GrowthReport {
  studentId: StudentId;
  generatedAt: number;
  overallGrowth: number;
  velocity: number;
  trajectories: GrowthTrajectory[];
  patterns: GrowthPattern[];
  recommendations: GrowthRecommendation[];
  upcomingMilestones: GrowthMilestone[];
  summary: string;
}

// ============================================================================
// STUDENT GROWTH ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Student Growth Engine
 *
 * Analyzes and tracks student growth across multiple dimensions.
 */
export class StudentGrowthEngine implements IGrowthEngine {
  /**
   * Calculate growth measurement for a dimension
   */
  calculateGrowth(profile: StudentGrowthProfile, dimension: GrowthDimension): GrowthMeasurement {
    const measurement = profile.measurements.get(dimension);

    if (!measurement) {
      return {
        dimension,
        baseline: 50,
        current: 50,
        change: 0,
        changePercent: 0,
        trend: 'STABLE',
        trajectory: 'STEADY',
        milestones: [],
      };
    }

    return measurement;
  }

  /**
   * Create growth snapshot
   */
  createSnapshot(studentId: StudentId, scores: Record<GrowthDimension, number>): GrowthSnapshot {
    const id = `gs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as GrowthSnapshot['id'];

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    // Generate insights based on scores
    const insights = this.generateInsights(scores);

    // Generate recommendations
    const recommendations = this.generateRecommendations(scores);

    return {
      id,
      studentId,
      timestamp: Date.now(),
      timepoint: 'IMMEDIATE',
      scores,
      overallScore,
      insights,
      recommendations,
    };
  }

  /**
   * Update growth profile with new snapshot
   */
  updateProfile(profile: StudentGrowthProfile, snapshot: GrowthSnapshot): StudentGrowthProfile {
    const updatedProfile = { ...profile };
    updatedProfile.lastUpdated = snapshot.timestamp;

    // Update measurements for each dimension
    for (const [dimension, value] of Object.entries(snapshot.scores)) {
      const dim = dimension as GrowthDimension;
      const existing = updatedProfile.measurements.get(dim);

      if (existing) {
        const oldValue = existing.current;
        existing.current = value;
        existing.change = value - existing.baseline;
        existing.changePercent = existing.baseline !== 0
          ? (existing.change / existing.baseline) * 100
          : 0;

        // Update trend
        if (value > oldValue + 3) {
          existing.trend = 'IMPROVING';
        } else if (value < oldValue - 3) {
          existing.trend = 'DECLINING';
        } else {
          existing.trend = 'STABLE';
        }

        // Update trajectory
        const recentChanges = existing.milestones.slice(-3);
        if (recentChanges.length >= 2) {
          const recentGrowth = recentChanges[recentChanges.length - 1].value - recentChanges[0].value;
          if (recentGrowth > 15) {
            existing.trajectory = 'ACCELERATING';
          } else if (recentGrowth < -5) {
            existing.trajectory = 'DECELERATING';
          } else {
            existing.trajectory = 'STEADY';
          }
        }

        // Add milestone if significant change
        if (Math.abs(value - oldValue) > 5) {
          existing.milestones.push({
            timestamp: snapshot.timestamp,
            value,
            trigger: 'measurement_update',
          });
        }
      } else {
        // Create new measurement
        updatedProfile.measurements.set(dim, {
          dimension: dim,
          baseline: value,
          current: value,
          change: 0,
          changePercent: 0,
          trend: 'STABLE',
          trajectory: 'STEADY',
          milestones: [{
            timestamp: snapshot.timestamp,
            value,
            trigger: 'baseline_established',
          }],
        });
      }
    }

    // Recalculate overall metrics
    const measurements = Array.from(updatedProfile.measurements.values());
    updatedProfile.overallGrowth = measurements.reduce((sum, m) => sum + m.changePercent, 0) / measurements.length;

    // Calculate growth velocity (change in growth rate)
    const velocities = measurements.map(m => {
      if (m.milestones.length < 2) return 0;
      const recent = m.milestones.slice(-2);
      return recent[1].value - recent[0].value;
    });
    updatedProfile.growthVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

    // Update strongest/weakest dimensions
    const sorted = [...measurements].sort((a, b) => b.current - a.current);
    updatedProfile.strongestDimensions = sorted.slice(0, 3).map(m => m.dimension);
    updatedProfile.weakestDimensions = sorted.slice(-3).map(m => m.dimension);

    // Identify improvement areas and success factors
    updatedProfile.improvementAreas = sorted
      .filter(m => m.trend === 'DECLINING' || m.current < 50)
      .map(m => m.dimension);

    updatedProfile.successFactors = sorted
      .filter(m => m.trend === 'IMPROVING' && m.current > 70)
      .map(m => m.dimension);

    return updatedProfile;
  }

  /**
   * Identify growth patterns
   */
  identifyGrowthPatterns(profile: StudentGrowthProfile): string[] {
    const patterns: string[] = [];

    for (const [dimension, measurement] of profile.measurements) {
      const pattern = this.detectDimensionPattern(measurement);
      if (pattern) {
        patterns.push(`${dimension}: ${pattern}`);
      }
    }

    // Identify cross-dimensional patterns
    const allTrends = Array.from(profile.measurements.values()).map(m => m.trend);
    const improvingCount = allTrends.filter(t => t === 'IMPROVING').length;
    const decliningCount = allTrends.filter(t => t === 'DECLINING').length;

    if (improvingCount > allTrends.length * 0.7) {
      patterns.push('BROAD_IMPROVEMENT: Most dimensions showing improvement');
    } else if (decliningCount > allTrends.length * 0.7) {
      patterns.push('BROAD_DECLINE: Most dimensions showing decline');
    }

    if (profile.growthVelocity > 10) {
      patterns.push('ACCELERATING_GROWTH: Rapid improvement across dimensions');
    } else if (profile.growthVelocity < -5) {
      patterns.push('DECELERATING_GROWTH: Slowing improvement');
    }

    return patterns;
  }

  /**
   * Analyze growth trajectory for a dimension
   */
  analyzeTrajectory(profile: StudentGrowthProfile, dimension: GrowthDimension): GrowthTrajectory {
    const measurement = profile.measurements.get(dimension);

    if (!measurement || measurement.milestones.length < 2) {
      return {
        dimension,
        currentValue: measurement?.current ?? 50,
        slope: 0,
        acceleration: 0,
        projectedValue: measurement?.current ?? 50,
        projectionConfidence: 0,
        inflectionPoints: [],
      };
    }

    const milestones = measurement.milestones;
    const n = milestones.length;

    // Calculate slope (simple linear regression)
    const sumX = milestones.reduce((sum, m, i) => sum + i, 0);
    const sumY = milestones.reduce((sum, m) => sum + m.value, 0);
    const sumXY = milestones.reduce((sum, m, i) => sum + i * m.value, 0);
    const sumX2 = milestones.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculate acceleration (change in slope)
    let acceleration = 0;
    if (n >= 4) {
      const mid = Math.floor(n / 2);
      const firstHalf = milestones.slice(0, mid);
      const secondHalf = milestones.slice(mid);

      const slope1 = this.calculateSimpleSlope(firstHalf);
      const slope2 = this.calculateSimpleSlope(secondHalf);
      acceleration = slope2 - slope1;
    }

    // Identify inflection points
    const inflectionPoints: GrowthTrajectory['inflectionPoints'] = [];
    for (let i = 2; i < milestones.length; i++) {
      const prevSlope = milestones[i - 1].value - milestones[i - 2].value;
      const currSlope = milestones[i].value - milestones[i - 1].value;
      const change = currSlope - prevSlope;

      if (Math.abs(change) > 10) {
        inflectionPoints.push({
          timestamp: milestones[i].timestamp,
          value: milestones[i].value,
          type: change > 0 ? 'ACCELERATION' : 'DECELERATION',
        });
      }
    }

    // Project future value
    const projectedValue = Math.min(100, Math.max(0,
      measurement.current + slope * 3 // Project 3 periods ahead
    ));

    // Calculate projection confidence
    const projectionConfidence = Math.max(0, 100 - Math.abs(acceleration) * 10 - n * 2);

    return {
      dimension,
      currentValue: measurement.current,
      slope,
      acceleration,
      projectedValue,
      projectionConfidence,
      inflectionPoints,
    };
  }

  /**
   * Detect growth pattern for a dimension
   */
  detectPattern(profile: StudentGrowthProfile, dimension: GrowthDimension): GrowthPattern {
    const measurement = profile.measurements.get(dimension);

    if (!measurement || measurement.milestones.length < 3) {
      return {
        pattern: 'STEADY',
        confidence: 0.5,
        description: 'Insufficient data for pattern detection',
        triggers: [],
        recommendations: ['Continue tracking to identify patterns'],
      };
    }

    const milestones = measurement.milestones;
    const values = milestones.map(m => m.value);

    // Check for stepwise pattern
    const diffs = values.slice(1).map((v, i) => v - values[i]);
    const largeJumps = diffs.filter(d => Math.abs(d) > 15).length;
    const stepwise = largeJumps > 0 && largeJumps < diffs.length * 0.3;

    // Check for cyclical pattern
    const peaks = values.filter((v, i) => i > 0 && i < values.length - 1 && v > values[i - 1] && v > values[i + 1]).length;
    const valleys = values.filter((v, i) => i > 0 && i < values.length - 1 && v < values[i - 1] && v < values[i + 1]).length;
    const cyclical = peaks >= 2 || valleys >= 2;

    // Check for plateau
    const recentValues = values.slice(-3);
    const plateau = recentValues.length >= 3 &&
      Math.max(...recentValues) - Math.min(...recentValues) < 5;

    // Determine pattern
    let pattern: GrowthPattern['pattern'] = 'STEADY';
    let description = '';

    if (plateau) {
      pattern = 'PLATEAUED';
      description = 'Growth has plateaued in recent measurements';
    } else if (cyclical) {
      pattern = 'CYCLICAL';
      description = 'Growth shows cyclical up and down patterns';
    } else if (stepwise) {
      pattern = 'STEPWISE';
      description = 'Growth occurs in distinct jumps rather than gradually';
    } else if (measurement.trajectory === 'ACCELERATING') {
      pattern = 'ACCELERATING';
      description = 'Growth rate is increasing';
    } else if (measurement.trajectory === 'DECELERATING') {
      pattern = 'DECLINING';
      description = 'Growth rate is decreasing';
    }

    return {
      pattern,
      confidence: 0.7 + (milestones.length > 5 ? 0.2 : 0),
      description,
      triggers: this.identifyTriggers(measurement),
      recommendations: this.generatePatternRecommendations(pattern, measurement),
    };
  }

  /**
   * Generate comprehensive growth report
   */
  generateReport(studentId: StudentId, profile: StudentGrowthProfile): GrowthReport {
    const trajectories: GrowthTrajectory[] = [];
    const patterns: GrowthPattern[] = [];
    const recommendations: GrowthRecommendation[] = [];
    const upcomingMilestones: GrowthMilestone[] = [];

    for (const dimension of profile.measurements.keys()) {
      // Analyze trajectory
      const trajectory = this.analyzeTrajectory(profile, dimension);
      trajectories.push(trajectory);

      // Detect pattern
      const pattern = this.detectPattern(profile, dimension);
      patterns.push(pattern);

      // Generate recommendations for weak dimensions
      const measurement = profile.measurements.get(dimension)!;
      if (measurement.current < 60 || measurement.trend === 'DECLINING') {
        recommendations.push(this.createGrowthRecommendation(dimension, measurement));
      }

      // Identify upcoming milestones
      const nextMilestone = this.identifyNextMilestone(dimension, measurement);
      if (nextMilestone) {
        upcomingMilestones.push(nextMilestone);
      }
    }

    // Sort milestones by progress (closest first)
    upcomingMilestones.sort((a, b) => b.progress - a.progress);

    return {
      studentId,
      generatedAt: Date.now(),
      overallGrowth: profile.overallGrowth,
      velocity: profile.growthVelocity,
      trajectories,
      patterns,
      recommendations,
      upcomingMilestones: upcomingMilestones.slice(0, 5),
      summary: this.generateReportSummary(profile, patterns),
    };
  }

  /**
   * Compare growth to peers
   */
  compareToPeers(
    profile: StudentGrowthProfile,
    peerProfiles: StudentGrowthProfile[],
    dimension: GrowthDimension
  ): ComparativeGrowth {
    const measurement = profile.measurements.get(dimension);
    const studentGrowth = measurement?.changePercent ?? 0;

    const peerGrowths = peerProfiles
      .map(p => p.measurements.get(dimension)?.changePercent ?? 0)
      .filter(g => !isNaN(g));

    const peerAverageGrowth = peerGrowths.length > 0
      ? peerGrowths.reduce((a, b) => a + b, 0) / peerGrowths.length
      : 0;

    // Calculate percentile
    const sortedGrowths = [...peerGrowths, studentGrowth].sort((a, b) => a - b);
    const rank = sortedGrowths.indexOf(studentGrowth);
    const percentile = peerGrowths.length > 0
      ? (rank / peerGrowths.length) * 100
      : 50;

    let interpretation = '';
    if (percentile >= 80) {
      interpretation = `Exceptional growth in ${dimension} compared to peers`;
    } else if (percentile >= 60) {
      interpretation = `Above-average growth in ${dimension}`;
    } else if (percentile >= 40) {
      interpretation = `Average growth in ${dimension}`;
    } else if (percentile >= 20) {
      interpretation = `Below-average growth in ${dimension}`;
    } else {
      interpretation = `Growth in ${dimension} needs attention`;
    }

    return {
      studentId: profile.studentId,
      dimension,
      studentGrowth,
      peerAverageGrowth,
      percentile,
      comparisonGroup: 'similar_students',
      interpretation,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateInsights(scores: Record<GrowthDimension, number>): string[] {
    const insights: string[] = [];
    const entries = Object.entries(scores);

    // Find highest and lowest
    entries.sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      const [highestDim, highestScore] = entries[0];
      insights.push(`Strongest in ${highestDim}: ${highestScore.toFixed(1)}`);
    }

    if (entries.length > 1) {
      const [lowestDim, lowestScore] = entries[entries.length - 1];
      if (lowestScore < 50) {
        insights.push(`Opportunity in ${lowestDim}: ${lowestScore.toFixed(1)}`);
      }
    }

    // Check for balance
    const values = entries.map(([, v]) => v);
    const spread = Math.max(...values) - Math.min(...values);
    if (spread > 30) {
      insights.push('Significant variation across dimensions');
    }

    return insights;
  }

  private generateRecommendations(scores: Record<GrowthDimension, number>): string[] {
    const recommendations: string[] = [];

    for (const [dimension, score] of Object.entries(scores)) {
      if (score < 40) {
        recommendations.push(`Focus on improving ${dimension}`);
      } else if (score < 60) {
        recommendations.push(`Continue developing ${dimension}`);
      }
    }

    return recommendations;
  }

  private detectDimensionPattern(measurement: GrowthMeasurement): string | null {
    if (measurement.milestones.length < 3) return null;

    const values = measurement.milestones.map(m => m.value);

    // Check for consistent improvement
    const improvements = values.slice(1).map((v, i) => v > values[i]);
    if (improvements.every(i => i)) {
      return 'consistent_improvement';
    }

    // Check for consistent decline
    const declines = values.slice(1).map((v, i) => v < values[i]);
    if (declines.every(i => i)) {
      return 'consistent_decline';
    }

    // Check for volatility
    const diffs = values.slice(1).map((v, i) => Math.abs(v - values[i]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avgDiff > 10) {
      return 'volatile';
    }

    return null;
  }

  private calculateSimpleSlope(milestones: GrowthMeasurement['milestones']): number {
    if (milestones.length < 2) return 0;
    const first = milestones[0].value;
    const last = milestones[milestones.length - 1].value;
    return (last - first) / (milestones.length - 1);
  }

  private identifyTriggers(measurement: GrowthMeasurement): string[] {
    const triggers: string[] = [];

    for (const milestone of measurement.milestones) {
      if (milestone.trigger !== 'measurement_update' && milestone.trigger !== 'baseline_established') {
        triggers.push(milestone.trigger);
      }
    }

    return [...new Set(triggers)];
  }

  private generatePatternRecommendations(
    pattern: GrowthPattern['pattern'],
    measurement: GrowthMeasurement
  ): string[] {
    const recommendations: string[] = [];

    switch (pattern) {
      case 'PLATEAUED':
        recommendations.push('Introduce new challenges to restart growth');
        recommendations.push('Seek feedback on current approach');
        break;
      case 'CYCLICAL':
        recommendations.push('Identify triggers for ups and downs');
        recommendations.push('Develop strategies to maintain momentum');
        break;
      case 'DECLINING':
        recommendations.push('Reassess current strategies');
        recommendations.push('Seek additional support or resources');
        break;
      case 'ACCELERATING':
        recommendations.push('Maintain current momentum');
        recommendations.push('Document successful strategies');
        break;
    }

    return recommendations;
  }

  private createGrowthRecommendation(dimension: GrowthDimension, measurement: GrowthMeasurement): GrowthRecommendation {
    const targetLevel = Math.min(100, measurement.current + 20);

    return {
      dimension,
      currentLevel: measurement.current,
      targetLevel,
      priority: measurement.current < 40 ? 'HIGH' : measurement.current < 60 ? 'MEDIUM' : 'LOW',
      actions: [
        `Practice ${dimension.toLowerCase().replace('_', ' ')} exercises`,
        'Seek feedback from mentors',
        'Set specific improvement goals',
      ],
      resources: [
        'Online courses',
        'Practice projects',
        'Mentorship sessions',
      ],
      expectedTimeline: '3-6 months',
      expectedImpact: targetLevel - measurement.current,
    };
  }

  private identifyNextMilestone(dimension: GrowthDimension, measurement: GrowthMeasurement): GrowthMilestone | null {
    const thresholds = [60, 70, 80, 90];

    for (const threshold of thresholds) {
      if (measurement.current < threshold) {
        return {
          dimension,
          level: threshold,
          title: `${dimension} Level ${threshold}`,
          description: `Reach ${threshold} in ${dimension.toLowerCase().replace('_', ' ')}`,
          progress: (measurement.current / threshold) * 100,
        };
      }
    }

    return null;
  }

  private generateReportSummary(profile: StudentGrowthProfile, patterns: GrowthPattern[]): string {
    const parts: string[] = [];

    parts.push(`Overall growth: ${profile.overallGrowth > 0 ? '+' : ''}${profile.overallGrowth.toFixed(1)}%`);

    const improvingCount = Array.from(profile.measurements.values())
      .filter(m => m.trend === 'IMPROVING').length;
    const totalDimensions = profile.measurements.size;

    parts.push(`${improvingCount} of ${totalDimensions} dimensions improving`);

    const significantPatterns = patterns.filter(p => p.confidence > 0.7);
    if (significantPatterns.length > 0) {
      parts.push(`Key patterns: ${significantPatterns.map(p => p.pattern.toLowerCase()).join(', ')}`);
    }

    return parts.join('. ') + '.';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create student growth engine
 */
export function createStudentGrowthEngine(): StudentGrowthEngine {
  return new StudentGrowthEngine();
}

/**
 * Create initial growth profile for a student
 */
export function createInitialGrowthProfile(studentId: StudentId): StudentGrowthProfile {
  const dimensions: GrowthDimension[] = [
    'CONFIDENCE', 'CLARITY', 'DECISION_QUALITY', 'SELF_AWARENESS',
    'CAREER_READINESS', 'EMOTIONAL_STABILITY', 'EXPLORATION_BREADTH',
    'RESILIENCE', 'MOTIVATION', 'SKILL_DEPTH', 'NETWORK_STRENGTH', 'EXECUTION_CAPABILITY'
  ];

  const measurements = new Map<GrowthDimension, GrowthMeasurement>();

  for (const dimension of dimensions) {
    measurements.set(dimension, {
      dimension,
      baseline: 50,
      current: 50,
      change: 0,
      changePercent: 0,
      trend: 'STABLE',
      trajectory: 'STEADY',
      milestones: [],
    });
  }

  return {
    studentId,
    baselineDate: Date.now(),
    lastUpdated: Date.now(),
    measurements,
    overallGrowth: 0,
    growthVelocity: 0,
    strongestDimensions: [],
    weakestDimensions: [],
    improvementAreas: [],
    successFactors: [],
  };
}

/**
 * Generate growth report (convenience function)
 */
export function generateGrowthReport(studentId: StudentId, profile: StudentGrowthProfile): GrowthReport {
  const engine = createStudentGrowthEngine();
  return engine.generateReport(studentId, profile);
}
