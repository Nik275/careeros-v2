/**
 * Journey Analyzer
 * 
 * Analyzes career journeys to identify patterns, extract insights,
 * and compare different career paths.
 */

import {
  CareerJourney,
  JourneyComparisonInput,
  JourneyComparisonResult,
  Difference,
  PerformanceMetric,
  CareerPosition,
  EducationMilestone,
  CareerDecision,
  ImportanceLevel,
  ImpactLevel,
  JourneyPattern,
  AnalysisDepth,
} from './career-journey-types';

/**
 * Pattern detection result
 */
export interface PatternDetectionResult {
  patterns: JourneyPattern[];
  confidence: number;
}

/**
 * Trajectory analysis
 */
export interface TrajectoryAnalysis {
  direction: 'UPWARD' | 'DOWNWARD' | 'STAGNANT' | 'VARIABLE';
  velocity: number; // rate of progression
  consistency: number; // 0-1 how consistent the trajectory
  keyDrivers: string[];
  inflectionPoints: Array<{
    timestamp: Date;
    impact: ImpactLevel;
    description: string;
  }>;
}

/**
 * Decision pattern analysis
 */
export interface DecisionPatternAnalysis {
  totalDecisions: number;
  decisionTypes: Record<string, number>;
  averageConfidence: number;
  accuracy: number; // % of decisions with positive outcomes
  riskProfile: 'RISK_AVERSE' | 'MODERATE' | 'RISK_SEEKING';
  deliberationTime: 'QUICK' | 'MODERATE' | 'DELIBERATE';
  influenceSources: string[];
  decisionQuality: number; // 0-1 score
}

/**
 * Journey Analyzer
 * 
 * Provides analytical capabilities for understanding career journeys,
 * including pattern detection, trajectory analysis, and comparison.
 */
export class JourneyAnalyzer {

  /**
   * Compare multiple journeys and identify similarities and differences
   */
  compareJourneys(input: JourneyComparisonInput): JourneyComparisonResult {
    const { journeys, comparisonDimensions } = input;

    if (journeys.length < 2) {
      return {
        commonalities: [],
        differences: [{
          dimension: 'count',
          description: 'Need at least 2 journeys to compare',
          significance: 'CRITICAL',
        }],
        relativePerformance: new Map(),
        keyInsights: ['Insufficient data for comparison'],
      };
    }

    const commonalities: string[] = [];
    const differences: Difference[] = [];
    const keyInsights: string[] = [];

    // Compare by dimensions
    for (const dimension of comparisonDimensions) {
      switch (dimension) {
        case 'STARTING_POINT':
          const startingDiffs = this.compareStartingPoints(journeys);
          differences.push(...startingDiffs);
          break;

        case 'CAREER_PATH':
          const pathResult = this.compareCareerPaths(journeys);
          commonalities.push(...pathResult.commonalities);
          differences.push(...pathResult.differences);
          break;

        case 'DECISIONS':
          const decisionResult = this.compareDecisions(journeys);
          commonalities.push(...decisionResult.commonalities);
          differences.push(...decisionResult.differences);
          break;

        case 'OUTCOMES':
          const outcomeDiffs = this.compareOutcomes(journeys);
          differences.push(...outcomeDiffs);
          break;

        case 'TIMELINE':
          const timelineDiffs = this.compareTimelines(journeys);
          differences.push(...timelineDiffs);
          break;

        case 'CHALLENGES':
          const challengeResult = this.compareChallenges(journeys);
          commonalities.push(...challengeResult.commonalities);
          differences.push(...challengeResult.differences);
          break;

        case 'SUCCESSES':
          const successResult = this.compareSuccesses(journeys);
          commonalities.push(...successResult.commonalities);
          differences.push(...successResult.differences);
          break;
      }
    }

    // Generate key insights
    const insights = this.generateComparisonInsights(journeys, commonalities, differences);
    keyInsights.push(...insights);

    // Calculate relative performance
    const relativePerformance = this.calculateRelativePerformance(journeys);

    return {
      commonalities,
      differences,
      relativePerformance,
      keyInsights,
    };
  }

  /**
   * Analyze the trajectory of a single journey
   */
  analyzeTrajectory(journey: CareerJourney): TrajectoryAnalysis {
    const positions = journey.careerHistory;
    
    if (positions.length === 0) {
      return {
        direction: 'STAGNANT',
        velocity: 0,
        consistency: 0,
        keyDrivers: [],
        inflectionPoints: [],
      };
    }

    // Calculate direction based on progression
    const direction = this.calculateTrajectoryDirection(positions);
    
    // Calculate velocity (average progression per year)
    const velocity = this.calculateVelocity(positions);
    
    // Calculate consistency (low variance = high consistency)
    const consistency = this.calculateConsistency(positions);
    
    // Identify key drivers
    const keyDrivers = this.identifyTrajectoryDrivers(journey);
    
    // Extract inflection points from turning points
    const inflectionPoints = journey.turningPoints
      .filter(tp => tp.importance === 'CRITICAL' || tp.importance === 'HIGH')
      .map(tp => ({
        timestamp: tp.timestamp,
        impact: tp.impact.magnitude,
        description: tp.event,
      }));

    return {
      direction,
      velocity,
      consistency,
      keyDrivers,
      inflectionPoints,
    };
  }

  /**
   * Detect patterns in a career journey
   */
  detectPatterns(journey: CareerJourney, depth: AnalysisDepth = 'STANDARD'): PatternDetectionResult {
    const patterns: JourneyPattern[] = [];
    let confidence = 0;

    // Pattern: Steady Progression
    const progressionPattern = this.detectProgressionPattern(journey);
    if (progressionPattern) {
      patterns.push(progressionPattern);
    }

    // Pattern: Pivot Points
    const pivotPattern = this.detectPivotPattern(journey);
    if (pivotPattern) {
      patterns.push(pivotPattern);
    }

    // Pattern: Resilience
    const resiliencePattern = this.detectResiliencePattern(journey);
    if (resiliencePattern) {
      patterns.push(resiliencePattern);
    }

    // Pattern: Strategic Moves
    const strategicPattern = this.detectStrategicPattern(journey);
    if (strategicPattern) {
      patterns.push(strategicPattern);
    }

    // Pattern: Learning Orientation
    const learningPattern = this.detectLearningPattern(journey);
    if (learningPattern) {
      patterns.push(learningPattern);
    }

    // Deep analysis patterns
    if (depth === 'DEEP') {
      const deepPatterns = this.detectDeepPatterns(journey);
      patterns.push(...deepPatterns);
    }

    // Calculate overall confidence
    confidence = patterns.length > 0 
      ? patterns.reduce((acc, p) => acc + (p.significance === 'CRITICAL' ? 1 : p.significance === 'HIGH' ? 0.7 : 0.4), 0) / patterns.length
      : 0;

    return { patterns, confidence };
  }

  /**
   * Analyze decision-making patterns
   */
  analyzeDecisionPatterns(journey: CareerJourney): DecisionPatternAnalysis {
    const decisions = journey.majorDecisions;
    
    if (decisions.length === 0) {
      return {
        totalDecisions: 0,
        decisionTypes: {},
        averageConfidence: 0,
        accuracy: 0,
        riskProfile: 'MODERATE',
        deliberationTime: 'MODERATE',
        influenceSources: [],
        decisionQuality: 0,
      };
    }

    // Count decision types
    const decisionTypes: Record<string, number> = {};
    for (const decision of decisions) {
      decisionTypes[decision.type] = (decisionTypes[decision.type] || 0) + 1;
    }

    // Calculate average confidence
    const confidenceScores: Record<string, number> = {
      'VERY_HIGH': 5,
      'HIGH': 4,
      'MODERATE': 3,
      'LOW': 2,
      'VERY_LOW': 1,
    };
    const averageConfidence = decisions.reduce((acc, d) => acc + confidenceScores[d.confidence], 0) / decisions.length;

    // Calculate accuracy (% with positive outcomes)
    const positiveOutcomes = decisions.filter(d => d.actualOutcome.positive).length;
    const accuracy = positiveOutcomes / decisions.length;

    // Determine risk profile
    const riskProfile = this.determineRiskProfile(decisions);

    // Determine deliberation style
    const deliberationTime = this.determineDeliberationStyle(decisions);

    // Collect influence sources
    const influenceSources = [...new Set(decisions.flatMap(d => d.influences.map(i => i.source)))];

    // Calculate decision quality (composite score)
    const decisionQuality = this.calculateDecisionQuality(decisions);

    return {
      totalDecisions: decisions.length,
      decisionTypes,
      averageConfidence,
      accuracy,
      riskProfile,
      deliberationTime,
      influenceSources,
      decisionQuality,
    };
  }

  /**
   * Calculate time to reach milestones
   */
  calculateTimeToMilestones(journey: CareerJourney): Array<{
    milestone: string;
    yearsToAchieve: number;
    startYear: number;
  }> {
    const startYear = journey.startingPoint.startYear;
    const milestones: Array<{
      milestone: string;
      yearsToAchieve: number;
      startYear: number;
    }> = [];

    // First job
    if (journey.careerHistory.length > 0) {
      const firstJob = journey.careerHistory[0];
      milestones.push({
        milestone: 'First Job',
        yearsToAchieve: firstJob.startDate.getFullYear() - startYear,
        startYear: firstJob.startDate.getFullYear(),
      });
    }

    // First promotion / role change
    if (journey.careerHistory.length > 1) {
      const secondRole = journey.careerHistory[1];
      milestones.push({
        milestone: 'First Role Change',
        yearsToAchieve: secondRole.startDate.getFullYear() - startYear,
        startYear: secondRole.startDate.getFullYear(),
      });
    }

    // Industry change
    const industryChanges = this.identifyIndustryChanges(journey);
    for (const change of industryChanges.slice(0, 1)) {
      milestones.push({
        milestone: 'First Industry Change',
        yearsToAchieve: change.year - startYear,
        startYear: change.year,
      });
    }

    // First management role (heuristic: title includes manager/lead/head)
    const managementRole = journey.careerHistory.find(p => 
      /manager|lead|head|director/i.test(p.title)
    );
    if (managementRole) {
      milestones.push({
        milestone: 'First Management Role',
        yearsToAchieve: managementRole.startDate.getFullYear() - startYear,
        startYear: managementRole.startDate.getFullYear(),
      });
    }

    return milestones;
  }

  /**
   * Identify skill acquisition pattern
   */
  analyzeSkillAcquisition(journey: CareerJourney): {
    skillsByPhase: Array<{
      phase: string;
      skills: string[];
      learningMode: string;
    }>;
    primaryLearningModes: string[];
    skillDepthOverTime: Array<{
      period: string;
      breadth: number;
      depth: number;
    }>;
  } {
    const skillsByPhase: Array<{
      phase: string;
      skills: string[];
      learningMode: string;
    }> = [];

    // Analyze skills from education
    const eduSkills = journey.educationHistory.flatMap(e => e.skillsGained);
    if (eduSkills.length > 0) {
      skillsByPhase.push({
        phase: 'Education',
        skills: [...new Set(eduSkills)],
        learningMode: 'Formal Education',
      });
    }

    // Analyze skills from career positions
    for (const position of journey.careerHistory.slice(0, 3)) {
      const gainedSkills = position.skills
        .filter(s => s.gainedOrUsed === 'GAINED' || s.gainedOrUsed === 'BOTH')
        .map(s => s.skill);
      
      if (gainedSkills.length > 0) {
        skillsByPhase.push({
          phase: position.title,
          skills: gainedSkills,
          learningMode: 'On-the-Job',
        });
      }
    }

    // Determine primary learning modes
    const learningModes = skillsByPhase.map(s => s.learningMode);
    const modeCounts: Record<string, number> = {};
    for (const mode of learningModes) {
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;
    }
    const primaryLearningModes = Object.entries(modeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mode]) => mode);

    // Calculate skill depth over time
    const skillDepthOverTime = this.calculateSkillDepthOverTime(journey);

    return {
      skillsByPhase,
      primaryLearningModes,
      skillDepthOverTime,
    };
  }

  // ============================================================================
  // PRIVATE COMPARISON HELPERS
  // ============================================================================

  private compareStartingPoints(journeys: CareerJourney[]): Difference[] {
    const differences: Difference[] = [];

    // Compare location tiers
    const tiers = [...new Set(journeys.map(j => j.startingPoint.location.tier))];
    if (tiers.length > 1) {
      differences.push({
        dimension: 'Starting Location Tier',
        description: `Journeys started in different city tiers: ${tiers.join(', ')}`,
        significance: 'HIGH',
      });
    }

    // Compare economic context
    const incomeLevels = [...new Set(journeys.map(j => j.startingPoint.economicContext.familyIncomeLevel))];
    if (incomeLevels.length > 1) {
      differences.push({
        dimension: 'Economic Background',
        description: `Different economic starting points: ${incomeLevels.join(', ')}`,
        significance: 'HIGH',
      });
    }

    // Compare education levels
    const eduLevels = [...new Set(journeys.map(j => j.startingPoint.initialEducation))];
    if (eduLevels.length > 1) {
      differences.push({
        dimension: 'Initial Education',
        description: `Different starting education levels: ${eduLevels.join(', ')}`,
        significance: 'MODERATE',
      });
    }

    return differences;
  }

  private compareCareerPaths(journeys: CareerJourney[]): {
    commonalities: string[];
    differences: Difference[];
  } {
    const commonalities: string[] = [];
    const differences: Difference[] = [];

    // Check for common industries
    const industries = journeys.map(j => j.currentIndustry);
    const commonIndustries = this.findCommonElements(industries);
    if (commonIndustries.length > 0) {
      commonalities.push(`All journeys ended in: ${commonIndustries.join(', ')}`);
    }

    // Compare path lengths
    const pathLengths = journeys.map(j => j.careerHistory.length);
    const avgLength = pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length;
    
    if (Math.max(...pathLengths) - Math.min(...pathLengths) > 2) {
      differences.push({
        dimension: 'Career Path Length',
        description: `Varied number of positions: ${Math.min(...pathLengths)} to ${Math.max(...pathLengths)} (avg: ${avgLength.toFixed(1)})`,
        significance: 'MODERATE',
      });
    }

    return { commonalities, differences };
  }

  private compareDecisions(journeys: CareerJourney[]): {
    commonalities: string[];
    differences: Difference[];
  } {
    const commonalities: string[] = [];
    const differences: Difference[] = [];

    // Analyze decision types
    const allDecisionTypes = journeys.flatMap(j => 
      j.majorDecisions.map(d => d.type)
    );
    const typeCounts: Record<string, number> = {};
    for (const type of allDecisionTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    const commonTypes = Object.entries(typeCounts)
      .filter(([_, count]) => count >= journeys.length * 0.5)
      .map(([type]) => type);

    if (commonTypes.length > 0) {
      commonalities.push(`Common decision types: ${commonTypes.join(', ')}`);
    }

    // Compare decision counts
    const decisionCounts = journeys.map(j => j.majorDecisions.length);
    if (Math.max(...decisionCounts) - Math.min(...decisionCounts) > 3) {
      differences.push({
        dimension: 'Decision Frequency',
        description: 'Significant variation in number of major decisions made',
        significance: 'MODERATE',
      });
    }

    return { commonalities, differences };
  }

  private compareOutcomes(journeys: CareerJourney[]): Difference[] {
    const differences: Difference[] = [];

    // Compare current roles
    const currentLevels = journeys.map(j => this.inferRoleLevel(j.currentRole.title));
    const uniqueLevels = [...new Set(currentLevels)];
    
    if (uniqueLevels.length > 1) {
      differences.push({
        dimension: 'Current Career Level',
        description: `Different achievement levels: ${uniqueLevels.join(', ')}`,
        significance: 'HIGH',
      });
    }

    // Compare success counts
    const successCounts = journeys.map(j => j.successes.length);
    if (Math.max(...successCounts) > Math.min(...successCounts) * 2) {
      differences.push({
        dimension: 'Success Frequency',
        description: 'Significant difference in documented successes',
        significance: 'MODERATE',
      });
    }

    return differences;
  }

  private compareTimelines(journeys: CareerJourney[]): Difference[] {
    const differences: Difference[] = [];

    // Compare total duration
    const durations = journeys.map(j => {
      if (j.careerHistory.length === 0) return 0;
      const first = j.careerHistory[0].startDate;
      const last = j.careerHistory[j.careerHistory.length - 1];
      const end = last.endDate || new Date();
      return (end.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    if (Math.max(...durations) - Math.min(...durations) > 5) {
      differences.push({
        dimension: 'Career Duration',
        description: `Varied career lengths: ${Math.min(...durations).toFixed(1)} to ${Math.max(...durations).toFixed(1)} years (avg: ${avgDuration.toFixed(1)})`,
        significance: 'MODERATE',
      });
    }

    return differences;
  }

  private compareChallenges(journeys: CareerJourney[]): {
    commonalities: string[];
    differences: Difference[];
  } {
    const commonalities: string[] = [];
    const differences: Difference[] = [];

    // Analyze failure types
    const allFailureTypes = journeys.flatMap(j => 
      j.failures.map(f => f.type)
    );
    const typeCounts: Record<string, number> = {};
    for (const type of allFailureTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    const commonFailures = Object.entries(typeCounts)
      .filter(([_, count]) => count >= journeys.length * 0.3)
      .map(([type]) => type);

    if (commonFailures.length > 0) {
      commonalities.push(`Common challenges faced: ${commonFailures.join(', ')}`);
    }

    return { commonalities, differences };
  }

  private compareSuccesses(journeys: CareerJourney[]): {
    commonalities: string[];
    differences: Difference[];
  } {
    const commonalities: string[] = [];
    const differences: Difference[] = [];

    // Analyze success types
    const allSuccessTypes = journeys.flatMap(j => 
      j.successes.map(s => s.type)
    );
    const typeCounts: Record<string, number> = {};
    for (const type of allSuccessTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    const commonSuccesses = Object.entries(typeCounts)
      .filter(([_, count]) => count >= journeys.length * 0.3)
      .map(([type]) => type);

    if (commonSuccesses.length > 0) {
      commonalities.push(`Common success types: ${commonSuccesses.join(', ')}`);
    }

    return { commonalities, differences };
  }

  // ============================================================================
  // PRIVATE TRAJECTORY HELPERS
  // ============================================================================

  private calculateTrajectoryDirection(positions: CareerPosition[]): 'UPWARD' | 'DOWNWARD' | 'STAGNANT' | 'VARIABLE' {
    if (positions.length < 2) return 'STAGNANT';

    const levels = positions.map(p => this.inferRoleLevel(p.title));
    const levelScores: Record<string, number> = {
      'ENTRY': 1,
      'JUNIOR': 2,
      'MID': 3,
      'SENIOR': 4,
      'LEAD': 5,
      'MANAGEMENT': 6,
      'EXECUTIVE': 7,
    };

    const scores = levels.map(l => levelScores[l] || 3);
    
    // Calculate trend
    let upward = 0;
    let downward = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[i - 1]) upward++;
      if (scores[i] < scores[i - 1]) downward++;
    }

    if (upward > downward && upward > scores.length * 0.3) return 'UPWARD';
    if (downward > upward && downward > scores.length * 0.3) return 'DOWNWARD';
    if (upward === 0 && downward === 0) return 'STAGNANT';
    return 'VARIABLE';
  }

  private calculateVelocity(positions: CareerPosition[]): number {
    if (positions.length < 2) return 0;

    const start = positions[0].startDate;
    const end = positions[positions.length - 1].endDate || new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);

    const levels = positions.map(p => this.inferRoleLevel(p.title));
    const levelScores: Record<string, number> = {
      'ENTRY': 1,
      'JUNIOR': 2,
      'MID': 3,
      'SENIOR': 4,
      'LEAD': 5,
      'MANAGEMENT': 6,
      'EXECUTIVE': 7,
    };

    const startScore = levelScores[levels[0]] || 1;
    const endScore = levelScores[levels[levels.length - 1]] || 1;
    const totalProgress = endScore - startScore;

    return years > 0 ? totalProgress / years : 0;
  }

  private calculateConsistency(positions: CareerPosition[]): number {
    if (positions.length < 3) return 1;

    const levels = positions.map(p => this.inferRoleLevel(p.title));
    const levelScores: Record<string, number> = {
      'ENTRY': 1,
      'JUNIOR': 2,
      'MID': 3,
      'SENIOR': 4,
      'LEAD': 5,
      'MANAGEMENT': 6,
      'EXECUTIVE': 7,
    };

    const scores = levels.map(l => levelScores[l] || 3);
    
    // Calculate variance in progression
    const progresses: number[] = [];
    for (let i = 1; i < scores.length; i++) {
      progresses.push(scores[i] - scores[i - 1]);
    }

    const avgProgress = progresses.reduce((a, b) => a + b, 0) / progresses.length;
    const variance = progresses.reduce((acc, p) => acc + Math.pow(p - avgProgress, 2), 0) / progresses.length;

    // Lower variance = higher consistency
    return Math.max(0, 1 - variance / 2);
  }

  private identifyTrajectoryDrivers(journey: CareerJourney): string[] {
    const drivers: string[] = [];

    // Education as driver
    if (journey.educationHistory.some(e => e.institutionTier === 'TIER_1')) {
      drivers.push('Tier-1 Education');
    }

    // Network as driver
    if (journey.startingPoint.familyBackground.networkQuality === 'EXTENSIVE') {
      drivers.push('Strong Network');
    }

    // Strategic decisions as driver
    const strategicDecisions = journey.majorDecisions.filter(d => 
      d.actualOutcome.positive && d.actualOutcome.impact === 'MAJOR'
    );
    if (strategicDecisions.length >= 2) {
      drivers.push('Strategic Decision Making');
    }

    // Resilience as driver
    if (journey.failures.length > 0 && journey.failures.every(f => f.recovered)) {
      drivers.push('Resilience');
    }

    // Skill acquisition as driver
    const skillsGained = journey.careerHistory.reduce((acc, p) => 
      acc + p.skills.filter(s => s.gainedOrUsed === 'GAINED').length, 0
    );
    if (skillsGained > 10) {
      drivers.push('Continuous Skill Development');
    }

    return drivers;
  }

  // ============================================================================
  // PRIVATE PATTERN DETECTION
  // ============================================================================

  private detectProgressionPattern(journey: CareerJourney): JourneyPattern | null {
    const positions = journey.careerHistory;
    if (positions.length < 3) return null;

    const trajectory = this.analyzeTrajectory(journey);
    
    if (trajectory.direction === 'UPWARD' && trajectory.consistency > 0.6) {
      return {
        pattern: 'Steady Progression',
        description: 'Consistent upward movement through career levels',
        evidence: positions.map(p => `${p.title} at ${p.organization}`),
        significance: trajectory.velocity > 0.5 ? 'HIGH' : 'MODERATE',
      };
    }

    return null;
  }

  private detectPivotPattern(journey: CareerJourney): JourneyPattern | null {
    const turns = journey.turningPoints;
    if (turns.length < 2) return null;

    const majorPivots = turns.filter(tp => 
      tp.type === 'REALIZATION' || tp.type === 'CRISIS'
    );

    if (majorPivots.length >= 2) {
      return {
        pattern: 'Multiple Pivots',
        description: 'Career direction changed significantly multiple times',
        evidence: majorPivots.map(tp => tp.event),
        significance: 'HIGH',
      };
    }

    return null;
  }

  private detectResiliencePattern(journey: CareerJourney): JourneyPattern | null {
    const failures = journey.failures;
    if (failures.length === 0) return null;

    const recoveredFailures = failures.filter(f => f.recovered);
    const recoveryRate = recoveredFailures.length / failures.length;

    if (recoveryRate >= 0.7 && failures.length >= 2) {
      return {
        pattern: 'High Resilience',
        description: 'Successfully recovered from multiple setbacks',
        evidence: recoveredFailures.map(f => f.description),
        significance: 'HIGH',
      };
    }

    return null;
  }

  private detectStrategicPattern(journey: CareerJourney): JourneyPattern | null {
    const decisions = journey.majorDecisions;
    if (decisions.length < 3) return null;

    const strategicDecisions = decisions.filter(d => {
      const goodOutcome = d.actualOutcome.positive;
      const highImpact = d.actualOutcome.impact === 'MAJOR' || d.actualOutcome.impact === 'TRANSFORMATIONAL';
      const highConfidence = d.confidence === 'HIGH' || d.confidence === 'VERY_HIGH';
      return goodOutcome && highImpact && highConfidence;
    });

    if (strategicDecisions.length >= 2) {
      return {
        pattern: 'Strategic Decision Maker',
        description: 'Made well-reasoned, high-impact decisions with positive outcomes',
        evidence: strategicDecisions.map(d => d.decision),
        significance: 'HIGH',
      };
    }

    return null;
  }

  private detectLearningPattern(journey: CareerJourney): JourneyPattern | null {
    const lessons = journey.lessons;
    const education = journey.educationHistory;

    if (lessons.length >= 5 || education.length >= 3) {
      return {
        pattern: 'Continuous Learner',
        description: 'Actively seeks knowledge and learns from experience',
        evidence: [
          ...lessons.slice(0, 3).map(l => l.lesson),
          ...education.slice(0, 2).map(e => `Completed ${e.type}`),
        ],
        significance: lessons.length >= 10 ? 'HIGH' : 'MODERATE',
      };
    }

    return null;
  }

  private detectDeepPatterns(journey: CareerJourney): JourneyPattern[] {
    const patterns: JourneyPattern[] = [];

    // Pattern: Early Mover
    if (journey.careerHistory.length > 0) {
      const firstJobYear = journey.careerHistory[0].startDate.getFullYear();
      const startYear = journey.startingPoint.startYear;
      if (firstJobYear - startYear <= 1) {
        patterns.push({
          pattern: 'Early Starter',
          description: 'Started career quickly after journey began',
          evidence: [`Started career in ${firstJobYear}, only ${firstJobYear - startYear} year(s) after ${startYear}`],
          significance: 'MODERATE',
        });
      }
    }

    // Pattern: Industry Explorer
    const industries = [...new Set(journey.careerHistory.map(p => p.industry))];
    if (industries.length >= 3) {
      patterns.push({
        pattern: 'Industry Explorer',
        description: 'Worked across multiple industries',
        evidence: industries.map(i => `Experience in ${i}`),
        significance: 'MODERATE',
      });
    }

    return patterns;
  }

  // ============================================================================
  // PRIVATE DECISION HELPERS
  // ============================================================================

  private determineRiskProfile(decisions: CareerDecision[]): 'RISK_AVERSE' | 'MODERATE' | 'RISK_SEEKING' {
    const riskyTypes = ['CAREER_CHANGE', 'ENTREPRENEURSHIP', 'RELOCATION'];
    const riskyDecisions = decisions.filter(d => riskyTypes.includes(d.type));
    const riskRatio = riskyDecisions.length / decisions.length;

    if (riskRatio < 0.2) return 'RISK_AVERSE';
    if (riskRatio > 0.5) return 'RISK_SEEKING';
    return 'MODERATE';
  }

  private determineDeliberationStyle(decisions: CareerDecision[]): 'QUICK' | 'MODERATE' | 'DELIBERATE' {
    // This is a heuristic - in reality would need more data
    const avgAlternatives = decisions.reduce((acc, d) => acc + d.alternativesConsidered.length, 0) / decisions.length;
    
    if (avgAlternatives <= 1) return 'QUICK';
    if (avgAlternatives >= 3) return 'DELIBERATE';
    return 'MODERATE';
  }

  private calculateDecisionQuality(decisions: CareerDecision[]): number {
    let score = 0;
    
    for (const decision of decisions) {
      // Outcome match (0-0.4)
      if (decision.actualOutcome.matchedExpectations) score += 0.4;
      else if (decision.actualOutcome.positive) score += 0.2;
      
      // Confidence calibration (0-0.3)
      if (decision.confidence === 'HIGH' && decision.actualOutcome.positive) score += 0.3;
      else if (decision.confidence === 'MODERATE') score += 0.15;
      
      // Consideration of alternatives (0-0.3)
      if (decision.alternativesConsidered.length >= 2) score += 0.3;
      else if (decision.alternativesConsidered.length === 1) score += 0.15;
    }

    return decisions.length > 0 ? score / decisions.length : 0;
  }

  // ============================================================================
  // PRIVATE UTILITY HELPERS
  // ============================================================================

  private generateComparisonInsights(
    journeys: CareerJourney[],
    commonalities: string[],
    differences: Difference[]
  ): string[] {
    const insights: string[] = [];

    if (commonalities.length > 0) {
      insights.push(`These ${journeys.length} journeys share ${commonalities.length} common factors, suggesting similar starting conditions or paths.`);
    }

    const highSigDiffs = differences.filter(d => d.significance === 'HIGH' || d.significance === 'CRITICAL');
    if (highSigDiffs.length > 0) {
      insights.push(`Found ${highSigDiffs.length} significant differences that likely led to different outcomes.`);
    }

    // Compare trajectory directions
    const trajectories = journeys.map(j => this.analyzeTrajectory(j));
    const upwardCount = trajectories.filter(t => t.direction === 'UPWARD').length;
    
    if (upwardCount === journeys.length) {
      insights.push('All journeys show upward trajectory, indicating effective strategies across different contexts.');
    } else if (upwardCount === 0) {
      insights.push('No upward trajectories observed - may indicate challenging circumstances or different success definitions.');
    } else {
      insights.push(`${upwardCount}/${journeys.length} journeys show upward trajectory - mixed outcomes suggest different factors at play.`);
    }

    return insights;
  }

  private calculateRelativePerformance(journeys: CareerJourney[]): Map<string, PerformanceMetric[]> {
    const performanceMap = new Map<string, PerformanceMetric[]>();

    for (const journey of journeys) {
      const metrics: PerformanceMetric[] = [];

      // Speed to first role
      if (journey.careerHistory.length > 0) {
        const yearsToFirstRole = journey.careerHistory[0].startDate.getFullYear() - journey.startingPoint.startYear;
        metrics.push({
          metric: 'Years to First Role',
          value: yearsToFirstRole,
          percentile: 0, // Would need cohort data
        });
      }

      // Total positions (career mobility)
      metrics.push({
        metric: 'Career Mobility',
        value: journey.careerHistory.length,
        percentile: 0,
      });

      // Decision quality
      const decisionAnalysis = this.analyzeDecisionPatterns(journey);
      metrics.push({
        metric: 'Decision Accuracy',
        value: decisionAnalysis.accuracy * 100,
        percentile: 0,
      });

      performanceMap.set(journey.id, metrics);
    }

    return performanceMap;
  }

  private inferRoleLevel(title: string): string {
    const lower = title.toLowerCase();
    
    if (/ceo|cto|cfo|chief|president|founder/i.test(lower)) return 'EXECUTIVE';
    if (/director|vp|vice president|head of/i.test(lower)) return 'MANAGEMENT';
    if (/manager|lead|principal/i.test(lower)) return 'LEAD';
    if (/senior|sr/i.test(lower)) return 'SENIOR';
    if (/junior|jr|associate/i.test(lower)) return 'JUNIOR';
    if (/intern|trainee/i.test(lower)) return 'ENTRY';
    
    return 'MID';
  }

  private identifyIndustryChanges(journey: CareerJourney): Array<{ year: number; from: string; to: string }> {
    const changes: Array<{ year: number; from: string; to: string }> = [];
    
    for (let i = 1; i < journey.careerHistory.length; i++) {
      const prev = journey.careerHistory[i - 1];
      const curr = journey.careerHistory[i];
      
      if (prev.industry !== curr.industry) {
        changes.push({
          year: curr.startDate.getFullYear(),
          from: prev.industry,
          to: curr.industry,
        });
      }
    }

    return changes;
  }

  private calculateSkillDepthOverTime(journey: CareerJourney): Array<{
    period: string;
    breadth: number;
    depth: number;
  }> {
    // Simplified calculation
    const periods: Array<{ period: string; breadth: number; depth: number }> = [];
    
    // Early career
    const earlySkills = new Set(journey.careerHistory.slice(0, 2).flatMap(p => 
      p.skills.map(s => s.skill)
    ));
    periods.push({
      period: 'Early Career',
      breadth: earlySkills.size,
      depth: 2, // Simplified
    });

    // Mid career
    if (journey.careerHistory.length > 2) {
      const midSkills = new Set(journey.careerHistory.slice(2, 4).flatMap(p => 
        p.skills.map(s => s.skill)
      ));
      periods.push({
        period: 'Mid Career',
        breadth: midSkills.size,
        depth: 3,
      });
    }

    return periods;
  }

  private findCommonElements<T>(arr: T[]): T[] {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    
    return Array.from(counts.entries())
      .filter(([_, count]) => count > 1)
      .map(([item]) => item);
  }
}
