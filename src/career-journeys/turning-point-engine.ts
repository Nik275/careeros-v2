/**
 * Turning Point Engine
 * 
 * Analyzes career turning points to understand inflection moments,
 * their causes, effects, and patterns across journeys.
 */

import {
  CareerJourney,
  TurningPoint,
  TurningPointAnalysis,
  TurningPointPattern,
  TurningPointType,
  TrajectoryImpact,
  ImportanceLevel,
  ImpactLevel,
  Effect,
} from './career-journey-types';

/**
 * Causal factor in turning points
 */
export interface CausalFactor {
  factor: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'HYBRID';
  controllability: 'CONTROLLABLE' | 'PARTIALLY_CONTROLLABLE' | 'UNCONTROLLABLE';
  predictability: 'PREDICTABLE' | 'PARTIALLY_PREDICTABLE' | 'UNPREDICTABLE';
}

/**
 * Effect analysis
 */
export interface EffectAnalysis {
  immediate: Effect[];
  shortTerm: Effect[];
  longTerm: Effect[];
  netImpact: TrajectoryImpact;
}

/**
 * Timing analysis
 */
export interface TimingAnalysis {
  careerStage: 'EARLY' | 'MID' | 'LATE';
  timingQuality: 'OPTIMAL' | 'GOOD' | 'NEUTRAL' | 'SUBOPTIMAL' | 'POOR';
  alternativeTiming: string;
  timeSensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Turning Point Engine
 * 
 * Specialized analysis for understanding career inflection points,
 * their causes, effects, and strategic implications.
 */
export class TurningPointEngine {

  /**
   * Analyze all turning points in a journey
   */
  analyzeTurningPoints(journey: CareerJourney): TurningPointAnalysis {
    const turningPoints = journey.turningPoints;

    if (turningPoints.length === 0) {
      return {
        turningPoints: [],
        criticalPoints: [],
        unexpectedPoints: [],
        patterns: [],
        netImpact: {
          direction: 'LATERAL',
          magnitude: 'NEGLIGIBLE',
          duration: 'SHORT_TERM',
        },
      };
    }

    // Identify critical points
    const criticalPoints = turningPoints.filter(tp => 
      tp.importance === 'CRITICAL' || tp.importance === 'HIGH'
    );

    // Identify unexpected points
    const unexpectedPoints = turningPoints.filter(tp => !tp.expected);

    // Detect patterns
    const patterns = this.detectTurningPointPatterns(turningPoints);

    // Calculate net impact
    const netImpact = this.calculateNetImpact(turningPoints);

    return {
      turningPoints,
      criticalPoints,
      unexpectedPoints,
      patterns,
      netImpact,
    };
  }

  /**
   * Analyze a single turning point in depth
   */
  analyzeTurningPoint(turningPoint: TurningPoint): {
    causalFactors: CausalFactor[];
    effectAnalysis: EffectAnalysis;
    timingAnalysis: TimingAnalysis;
    controllability: number; // 0-1
    replicability: string;
    lessons: string[];
  } {
    return {
      causalFactors: this.identifyCausalFactors(turningPoint),
      effectAnalysis: this.analyzeEffects(turningPoint),
      timingAnalysis: this.analyzeTiming(turningPoint),
      controllability: this.assessControllability(turningPoint),
      replicability: this.assessReplicability(turningPoint),
      lessons: this.extractLessons(turningPoint),
    };
  }

  /**
   * Compare turning points across multiple journeys
   */
  compareTurningPoints(journeys: CareerJourney[]): {
    commonTypes: TurningPointType[];
    typePatterns: Array<{
      type: TurningPointType;
      frequency: number;
      avgImpact: ImpactLevel;
      typicalTiming: string;
    }>;
    timingDistribution: Record<string, number>;
    impactDistribution: Record<string, number>;
    insights: string[];
  } {
    const allTurningPoints = journeys.flatMap(j => j.turningPoints);

    if (allTurningPoints.length === 0) {
      return {
        commonTypes: [],
        typePatterns: [],
        timingDistribution: {},
        impactDistribution: {},
        insights: ['No turning points recorded'],
      };
    }

    // Analyze by type
    const typeCounts: Record<string, number> = {};
    for (const tp of allTurningPoints) {
      typeCounts[tp.type] = (typeCounts[tp.type] || 0) + 1;
    }

    const sortedTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1]);

    const commonTypes = sortedTypes
      .slice(0, 3)
      .map(([type]) => type as TurningPointType);

    // Create type patterns
    const typePatterns = sortedTypes.map(([type, count]) => ({
      type: type as TurningPointType,
      frequency: count,
      avgImpact: this.calculateAverageImpact(
        allTurningPoints.filter(tp => tp.type === type)
      ),
      typicalTiming: this.estimateTypicalTiming(
        allTurningPoints.filter(tp => tp.type === type)
      ),
    }));

    // Timing distribution
    const timingDistribution = this.calculateTimingDistribution(allTurningPoints);

    // Impact distribution
    const impactDistribution = this.calculateImpactDistribution(allTurningPoints);

    // Generate insights
    const insights = this.generateTurningPointInsights(
      journeys,
      commonTypes,
      typePatterns
    );

    return {
      commonTypes,
      typePatterns,
      timingDistribution,
      impactDistribution,
      insights,
    };
  }

  /**
   * Identify the most impactful turning points
   */
  identifyMostImpactful(
    journey: CareerJourney,
    count: number = 3
  ): TurningPoint[] {
    return journey.turningPoints
      .map(tp => ({
        turningPoint: tp,
        impactScore: this.calculateImpactScore(tp),
      }))
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, count)
      .map(item => item.turningPoint);
  }

  /**
   * Analyze what-if scenarios for turning points
   */
  analyzeCounterfactual(
    turningPoint: TurningPoint,
    scenario: 'HAPPENED_EARLIER' | 'HAPPENED_LATER' | 'DID_NOT_HAPPEN'
  ): {
    scenario: string;
    likelyOutcome: string;
    probability: number;
    reasoning: string[];
  } {
    switch (scenario) {
      case 'HAPPENED_EARLIER':
        return this.analyzeEarlierScenario(turningPoint);
      case 'HAPPENED_LATER':
        return this.analyzeLaterScenario(turningPoint);
      case 'DID_NOT_HAPPEN':
        return this.analyzeNoHappenScenario(turningPoint);
      default:
        return {
          scenario: 'Unknown',
          likelyOutcome: 'Cannot analyze',
          probability: 0,
          reasoning: ['Invalid scenario'],
        };
    }
  }

  /**
   * Predict potential future turning points
   */
  predictTurningPoints(
    journey: CareerJourney,
    lookAheadYears: number = 2
  ): Array<{
    type: TurningPointType;
    probability: number;
    timeframe: string;
    triggers: string[];
    preparation: string[];
  }> {
    const predictions: Array<{
      type: TurningPointType;
      probability: number;
      timeframe: string;
      triggers: string[];
      preparation: string[];
    }> = [];

    const trajectory = this.inferTrajectory(journey);
    const currentStage = this.determineCareerStage(journey);

    // Predict based on patterns
    if (currentStage === 'MID' && trajectory === 'UPWARD') {
      predictions.push({
        type: 'OPPORTUNITY',
        probability: 0.6,
        timeframe: `${lookAheadYears} years`,
        triggers: ['Performance visibility', 'Network expansion', 'Market conditions'],
        preparation: ['Document achievements', 'Expand network', 'Develop leadership skills'],
      });
    }

    if (journey.careerHistory.length >= 3) {
      predictions.push({
        type: 'REALIZATION',
        probability: 0.4,
        timeframe: '1-2 years',
        triggers: ['Cumulative experience', 'New perspective', 'External influence'],
        preparation: ['Reflect regularly', 'Seek diverse perspectives', 'Stay open to change'],
      });
    }

    return predictions;
  }

  /**
   * Assess readiness for upcoming turning points
   */
  assessReadiness(
    journey: CareerJourney,
    turningPointType: TurningPointType
  ): {
    readiness: 'READY' | 'MOSTLY_READY' | 'PARTIALLY_READY' | 'NOT_READY';
    score: number; // 0-1
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const gaps: string[] = [];

    // Assess based on journey characteristics
    if (journey.lessons.length >= 5) {
      strengths.push('Strong learning orientation');
    } else {
      gaps.push('Limited documented learning');
    }

    if (journey.networkQuality() === 'EXTENSIVE') {
      strengths.push('Strong network for opportunities');
    } else {
      gaps.push('Network could be expanded');
    }

    if (journey.careerHistory.length >= 3) {
      strengths.push('Sufficient experience base');
    } else {
      gaps.push('Limited career history');
    }

    // Calculate score
    const score = strengths.length / (strengths.length + gaps.length);

    // Determine readiness level
    let readiness: 'READY' | 'MOSTLY_READY' | 'PARTIALLY_READY' | 'NOT_READY';
    if (score >= 0.8) readiness = 'READY';
    else if (score >= 0.6) readiness = 'MOSTLY_READY';
    else if (score >= 0.4) readiness = 'PARTIALLY_READY';
    else readiness = 'NOT_READY';

    // Generate recommendations
    const recommendations = gaps.map(gap => `Address: ${gap}`);

    return {
      readiness,
      score,
      strengths,
      gaps,
      recommendations,
    };
  }

  // ============================================================================
  // PRIVATE ANALYSIS HELPERS
  // ============================================================================

  private detectTurningPointPatterns(turningPoints: TurningPoint[]): TurningPointPattern[] {
    const patterns: TurningPointPattern[] = [];

    // Pattern: Clustering
    const sorted = [...turningPoints].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i].timestamp.getTime() - sorted[i-1].timestamp.getTime()) / 
        (1000 * 60 * 60 * 24 * 30); // months
      
      if (diff < 6) {
        patterns.push({
          type: sorted[i].type,
          frequency: 2,
          typicalImpact: sorted[i].impact,
          commonTiming: 'Clustered events within 6 months',
        });
      }
    }

    // Pattern: Type recurrence
    const typeCounts: Record<string, number> = {};
    for (const tp of turningPoints) {
      typeCounts[tp.type] = (typeCounts[tp.type] || 0) + 1;
    }

    for (const [type, count] of Object.entries(typeCounts)) {
      if (count >= 2) {
        const avgImpact = this.calculateAverageImpact(
          turningPoints.filter(tp => tp.type === type)
        );
        
        patterns.push({
          type: type as TurningPointType,
          frequency: count,
          typicalImpact: avgImpact,
          commonTiming: 'Recurring pattern',
        });
      }
    }

    return patterns;
  }

  private calculateNetImpact(turningPoints: TurningPoint[]): TrajectoryImpact {
    let upward = 0;
    let downward = 0;
    let lateral = 0;

    for (const tp of turningPoints) {
      switch (tp.impact.direction) {
        case 'UPWARD':
          upward++;
          break;
        case 'DOWNWARD':
          downward++;
          break;
        case 'LATERAL':
        case 'CHANGED_PATH':
          lateral++;
          break;
      }
    }

    const direction = upward > downward ? 'UPWARD' : 
                      downward > upward ? 'DOWNWARD' : 'LATERAL';

    const magnitude: ImpactLevel = turningPoints.some(tp => 
      tp.impact.magnitude === 'TRANSFORMATIONAL'
    ) ? 'TRANSFORMATIONAL' :
    turningPoints.some(tp => tp.impact.magnitude === 'MAJOR') ? 'MAJOR' :
    turningPoints.some(tp => tp.impact.magnitude === 'MODERATE') ? 'MODERATE' :
    'MINOR';

    return {
      direction,
      magnitude,
      duration: 'LONG_TERM',
    };
  }

  private identifyCausalFactors(turningPoint: TurningPoint): CausalFactor[] {
    const factors: CausalFactor[] = [];

    // Analyze based on type
    switch (turningPoint.type) {
      case 'OPPORTUNITY':
        factors.push({
          factor: 'Network connection',
          type: 'EXTERNAL',
          controllability: 'PARTIALLY_CONTROLLABLE',
          predictability: 'UNPREDICTABLE',
        });
        factors.push({
          factor: 'Preparation and readiness',
          type: 'INTERNAL',
          controllability: 'CONTROLLABLE',
          predictability: 'PREDICTABLE',
        });
        break;

      case 'CRISIS':
        factors.push({
          factor: 'External market conditions',
          type: 'EXTERNAL',
          controllability: 'UNCONTROLLABLE',
          predictability: 'PARTIALLY_PREDICTABLE',
        });
        break;

      case 'REALIZATION':
        factors.push({
          factor: 'Self-awareness and reflection',
          type: 'INTERNAL',
          controllability: 'CONTROLLABLE',
          predictability: 'PARTIALLY_PREDICTABLE',
        });
        break;

      case 'MEETING':
        factors.push({
          factor: 'Proactive networking',
          type: 'HYBRID',
          controllability: 'CONTROLLABLE',
          predictability: 'UNPREDICTABLE',
        });
        break;
    }

    return factors;
  }

  private analyzeEffects(turningPoint: TurningPoint): EffectAnalysis {
    const immediate = turningPoint.positiveEffects.filter(e => 
      this.isImmediateEffect(e)
    );

    const shortTerm = [
      ...turningPoint.positiveEffects.filter(e => !this.isImmediateEffect(e)),
      ...turningPoint.negativeEffects.filter(e => this.isShortTermEffect(e)),
    ];

    const longTerm = turningPoint.negativeEffects.filter(e => 
      !this.isShortTermEffect(e)
    );

    return {
      immediate,
      shortTerm,
      longTerm,
      netImpact: turningPoint.impact,
    };
  }

  private isImmediateEffect(effect: Effect): boolean {
    return ['CAREER', 'FINANCIAL'].includes(effect.category) && 
           effect.magnitude === 'MAJOR';
  }

  private isShortTermEffect(effect: Effect): boolean {
    return effect.magnitude === 'MODERATE' || effect.magnitude === 'MINOR';
  }

  private analyzeTiming(turningPoint: TurningPoint): TimingAnalysis {
    // Determine career stage from timestamp
    // This would need the journey context in reality
    const careerStage: 'EARLY' | 'MID' | 'LATE' = 'MID';

    // Assess timing quality
    let timingQuality: TimingAnalysis['timingQuality'] = 'NEUTRAL';
    
    if (turningPoint.expected && turningPoint.importance === 'HIGH') {
      timingQuality = 'OPTIMAL';
    } else if (!turningPoint.expected && turningPoint.positiveEffects.length > turningPoint.negativeEffects.length) {
      timingQuality = 'GOOD';
    }

    return {
      careerStage,
      timingQuality,
      alternativeTiming: this.suggestAlternativeTiming(turningPoint),
      timeSensitivity: this.assessTimeSensitivity(turningPoint),
    };
  }

  private suggestAlternativeTiming(turningPoint: TurningPoint): string {
    // Heuristic suggestions
    if (turningPoint.type === 'OPPORTUNITY') {
      return 'Could have been pursued earlier with more preparation';
    }
    if (turningPoint.type === 'CRISIS') {
      return 'Timing was externally determined';
    }
    return 'Timing was appropriate';
  }

  private assessTimeSensitivity(turningPoint: TurningPoint): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (turningPoint.type === 'OPPORTUNITY' || turningPoint.type === 'CRISIS') {
      return 'HIGH';
    }
    if (turningPoint.type === 'REALIZATION') {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private assessControllability(turningPoint: TurningPoint): number {
    const factors = this.identifyCausalFactors(turningPoint);
    if (factors.length === 0) return 0.5;

    const controllableScores: Record<string, number> = {
      'CONTROLLABLE': 1,
      'PARTIALLY_CONTROLLABLE': 0.5,
      'UNCONTROLLABLE': 0,
    };

    const total = factors.reduce((acc, f) => acc + controllableScores[f.controllability], 0);
    return total / factors.length;
  }

  private assessReplicability(turningPoint: TurningPoint): string {
    const controllability = this.assessControllability(turningPoint);
    
    if (controllability > 0.7) {
      return 'Highly replicable with similar preparation and context';
    } else if (controllability > 0.4) {
      return 'Partially replicable - some factors controllable';
    } else {
      return 'Not easily replicable - largely dependent on external factors';
    }
  }

  private extractLessons(turningPoint: TurningPoint): string[] {
    const lessons: string[] = [];

    if (turningPoint.keyLearning) {
      lessons.push(turningPoint.keyLearning);
    }

    // Derive additional lessons
    if (turningPoint.positiveEffects.length > turningPoint.negativeEffects.length) {
      lessons.push('Taking action led to net positive outcome');
    }

    if (!turningPoint.expected && turningPoint.impact.magnitude === 'MAJOR') {
      lessons.push('Unexpected events can have major impact - stay adaptable');
    }

    return lessons;
  }

  private calculateImpactScore(turningPoint: TurningPoint): number {
    let score = 0;

    // Importance weight
    const importanceWeights: Record<ImportanceLevel, number> = {
      'CRITICAL': 1,
      'HIGH': 0.7,
      'MODERATE': 0.4,
      'LOW': 0.1,
    };
    score += importanceWeights[turningPoint.importance];

    // Direction bonus/penalty
    if (turningPoint.impact.direction === 'UPWARD') score += 0.3;
    if (turningPoint.impact.direction === 'DOWNWARD') score -= 0.2;

    // Magnitude
    const magnitudeWeights: Record<ImpactLevel, number> = {
      'TRANSFORMATIONAL': 1,
      'MAJOR': 0.7,
      'MODERATE': 0.4,
      'MINOR': 0.2,
      'NEGLIGIBLE': 0,
    };
    score += magnitudeWeights[turningPoint.impact.magnitude];

    // Effect balance
    const effectBalance = turningPoint.positiveEffects.length - turningPoint.negativeEffects.length;
    score += effectBalance * 0.1;

    return Math.max(0, score);
  }

  private calculateAverageImpact(turningPoints: TurningPoint[]): ImpactLevel {
    const magnitudeScores: Record<ImpactLevel, number> = {
      'TRANSFORMATIONAL': 4,
      'MAJOR': 3,
      'MODERATE': 2,
      'MINOR': 1,
      'NEGLIGIBLE': 0,
    };

    const avg = turningPoints.reduce((acc, tp) => acc + magnitudeScores[tp.impact.magnitude], 0) / 
                turningPoints.length;

    if (avg >= 3.5) return 'TRANSFORMATIONAL';
    if (avg >= 2.5) return 'MAJOR';
    if (avg >= 1.5) return 'MODERATE';
    if (avg >= 0.5) return 'MINOR';
    return 'NEGLIGIBLE';
  }

  private estimateTypicalTiming(turningPoints: TurningPoint[]): string {
    if (turningPoints.length === 0) return 'Unknown';

    // This would need career stage context
    const years = turningPoints.map(tp => tp.timestamp.getFullYear());
    const avg = years.reduce((a, b) => a + b, 0) / years.length;

    return `Typically around year ${Math.round(avg)}`;
  }

  private calculateTimingDistribution(turningPoints: TurningPoint[]): Record<string, number> {
    const stages: Record<string, number> = {
      'Year 0-2': 0,
      'Year 3-5': 0,
      'Year 6-10': 0,
      'Year 11+': 0,
    };

    // This would need journey start date context
    for (const tp of turningPoints) {
      stages['Year 3-5']++; // Simplified
    }

    return stages;
  }

  private calculateImpactDistribution(turningPoints: TurningPoint[]): Record<string, number> {
    const distribution: Record<string, number> = {
      'TRANSFORMATIONAL': 0,
      'MAJOR': 0,
      'MODERATE': 0,
      'MINOR': 0,
    };

    for (const tp of turningPoints) {
      distribution[tp.impact.magnitude]++;
    }

    return distribution;
  }

  private generateTurningPointInsights(
    journeys: CareerJourney[],
    commonTypes: TurningPointType[],
    typePatterns: Array<{ type: TurningPointType; frequency: number }>
  ): string[] {
    const insights: string[] = [];

    const totalTPs = journeys.reduce((acc, j) => acc + j.turningPoints.length, 0);
    
    insights.push(
      `Found ${totalTPs} turning points across ${journeys.length} journeys ` +
      `(${(totalTPs / journeys.length).toFixed(1)} per journey)`
    );

    if (commonTypes.length > 0) {
      insights.push(
        `Most common turning point type: ${commonTypes[0]} ` +
        `(${typePatterns.find(p => p.type === commonTypes[0])?.frequency} occurrences)`
      );
    }

    const unexpectedCount = journeys.reduce(
      (acc, j) => acc + j.turningPoints.filter(tp => !tp.expected).length, 
      0
    );
    
    if (unexpectedCount > totalTPs * 0.3) {
      insights.push('High proportion of unexpected turning points suggests need for adaptability');
    }

    return insights;
  }

  private analyzeEarlierScenario(turningPoint: TurningPoint): {
    scenario: string;
    likelyOutcome: string;
    probability: number;
    reasoning: string[];
  } {
    return {
      scenario: 'Happened Earlier',
      likelyOutcome: 'Greater long-term compounding effect',
      probability: 0.6,
      reasoning: [
        'Earlier action allows more time for benefits to compound',
        'May have had less preparation at earlier time',
        'Context might have been different',
      ],
    };
  }

  private analyzeLaterScenario(turningPoint: TurningPoint): {
    scenario: string;
    likelyOutcome: string;
    probability: number;
    reasoning: string[];
  } {
    return {
      scenario: 'Happened Later',
      likelyOutcome: 'More preparation but less compounding time',
      probability: 0.5,
      reasoning: [
        'More time to prepare could improve outcome',
        'Opportunity might have been missed',
        'Less time for benefits to compound',
      ],
    };
  }

  private analyzeNoHappenScenario(turningPoint: TurningPoint): {
    scenario: string;
    likelyOutcome: string;
    probability: number;
    reasoning: string[];
  } {
    return {
      scenario: 'Did Not Happen',
      likelyOutcome: 'Alternative path with different outcomes',
      probability: 0.7,
      reasoning: [
        'Would have continued on previous trajectory',
        'Missed opportunity for growth',
        'Avoided potential negative effects',
      ],
    };
  }

  private inferTrajectory(journey: CareerJourney): 'UPWARD' | 'DOWNWARD' | 'FLAT' {
    // Simplified - would use proper trajectory analysis
    return 'UPWARD';
  }

  private determineCareerStage(journey: CareerJourney): 'EARLY' | 'MID' | 'LATE' {
    const years = journey.careerHistory.reduce((acc, p) => acc + p.durationMonths, 0) / 12;
    
    if (years < 3) return 'EARLY';
    if (years < 10) return 'MID';
    return 'LATE';
  }
}

// Extend CareerJourney type for internal methods
declare module './career-journey-types' {
  interface CareerJourney {
    networkQuality(): import('./career-journey-types').NetworkQuality;
  }
}

// Implementation of networkQuality method
import './career-journey-types';
