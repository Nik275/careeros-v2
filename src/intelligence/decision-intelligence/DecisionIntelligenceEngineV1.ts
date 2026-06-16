/**
 * CareerOS Decision Intelligence Engine V1
 *
 * Synthesizes outputs from all intelligence layers into a single decision recommendation.
 * Weighted decision framework considering psychological fit, optionality, criticality,
 * coalition stability, regret risk, and long-term flexibility.
 */

import type { StudentBeliefV3, Value } from '../types';
import type { CareerPathExplorerResult, ExploredCareerPath } from '../path-explorer';
import type { RegretAnalysis, PathRegretAnalysis } from '../regret-functional';
import type { DecisionCoalitionAnalysis, PathCoalitionAnalysis } from '../decision-coalition-v3';
import type { CareerTransitionGraphV1 } from '../career-transition-graph';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DecisionIntelligenceId = string & { __brand: 'DecisionIntelligenceId' };
export type DecisionTier = 'primary' | 'strong' | 'conditional' | 'exploratory';
export type DecisionUrgency = 'immediate' | 'soon' | 'consider' | 'monitor';

export interface RecommendationStrength {
  factor: string;
  description: string;
  score: number;
}

export interface RecommendationCaveat {
  factor: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DecisionRecommendation {
  pathId: string;
  path: ExploredCareerPath;
  tier: DecisionTier;
  urgency: DecisionUrgency;
  compositeScore: number;
  confidence: number;
  strengths: RecommendationStrength[];
  caveats: RecommendationCaveat[];
  actionItems: string[];
}

export interface DecisionAlternative {
  pathId: string;
  path: ExploredCareerPath;
  compositeScore: number;
  rank: number;
  rationale: string;
  whenToConsider: string;
  keyDifferences: string[];
}

export interface DecisionConfidence {
  overall: number;
  psychologicalFit: number;
  optionality: number;
  criticality: number;
  coalition: number;
  regret: number;
  flexibility: number;
  confidenceExplanation: string;
}

export interface DecisionReasoning {
  primary: string;
  supportingFactors: string[];
  addressingConcerns: string[];
  confidenceExplanation: string;
  longTermOutlook: string;
}

export interface DecisionTradeoffs {
  summary: string;
  keyTradeoffs: {
    factor: string;
    tradeoff: string;
    weight: number;
  }[];
  acceptedRisks: string[];
  missedOpportunities: string[];
  comparisonWithAlternatives: string;
}

export interface DecisionFactors {
  psychologicalFit: number;
  optionality: number;
  criticality: number;
  coalition: number;
  regret: number;
  flexibility: number;
}

export interface PathDecisionScore {
  pathId: string;
  psychologicalFit: number;
  optionality: number;
  criticality: number;
  coalition: number;
  regret: number;
  flexibility: number;
  composite: number;
  weightedComposite: number;
}

export interface DecisionIntelligenceOptions {
  factorWeights?: Partial<DecisionFactors>;
  minConfidenceThreshold?: number;
  maxAlternatives?: number;
  requireCoalitionStability?: boolean;
}

export interface DecisionRecommendationOutput {
  id: DecisionIntelligenceId;
  recommendation: DecisionRecommendation;
  alternatives: DecisionAlternative[];
  confidence: DecisionConfidence;
  reasoning: DecisionReasoning;
  tradeoffs: DecisionTradeoffs;
  pathScores: Map<string, PathDecisionScore>;
  rankedPathIds: string[];
  generatedAt: number;
}

interface LegacyStudentValueShape {
  coreValues?: string[];
  valuePriorities?: ReadonlyMap<string, number> | Record<string, number>;
}

type StudentBeliefV3Readable = Omit<StudentBeliefV3, 'values'> & {
  values?: StudentBeliefV3['values'] | LegacyStudentValueShape;
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_FACTOR_WEIGHTS: DecisionFactors = {
  psychologicalFit: 0.25,
  optionality: 0.20,
  criticality: 0.15,
  coalition: 0.15,
  regret: 0.15,
  flexibility: 0.10,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateDecisionId(): DecisionIntelligenceId {
  return `decision-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as DecisionIntelligenceId;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeScore(value: number, min = 0, max = 100): number {
  return clamp((value - min) / (max - min), 0, 1);
}

function normalizeValueIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/^value[_-]/, '').replace(/[\s_]+/g, '-');
}

function getTierFromScore(score: number, confidence: number): DecisionTier {
  if (score >= 80 && confidence >= 0.7) return 'primary';
  if (score >= 65 && confidence >= 0.6) return 'strong';
  if (score >= 50 && confidence >= 0.5) return 'conditional';
  return 'exploratory';
}

function getUrgencyFromCriticality(criticalityScore: number): DecisionUrgency {
  if (criticalityScore >= 75) return 'immediate';
  if (criticalityScore >= 60) return 'soon';
  if (criticalityScore >= 40) return 'consider';
  return 'monitor';
}

// ============================================================================
// DECISION INTELLIGENCE ENGINE V1
// ============================================================================

export class DecisionIntelligenceEngineV1 {
  private studentBelief: StudentBeliefV3;
  private pathExplorerResult: CareerPathExplorerResult;
  private regretAnalysis: RegretAnalysis;
  private coalitionAnalysis: DecisionCoalitionAnalysis;
  private graph: CareerTransitionGraphV1;

  constructor(
    studentBelief: StudentBeliefV3,
    pathExplorerResult: CareerPathExplorerResult,
    regretAnalysis: RegretAnalysis,
    coalitionAnalysis: DecisionCoalitionAnalysis,
    graph: CareerTransitionGraphV1
  ) {
    this.studentBelief = studentBelief;
    this.pathExplorerResult = pathExplorerResult;
    this.regretAnalysis = regretAnalysis;
    this.coalitionAnalysis = coalitionAnalysis;
    this.graph = graph;
  }

  /**
   * Generate a comprehensive decision recommendation
   */
  generate(options: DecisionIntelligenceOptions = {}): DecisionRecommendationOutput {
    const weights = { ...DEFAULT_FACTOR_WEIGHTS, ...options.factorWeights };
    const pathScores = this.calculatePathScores(weights);
    const rankedPaths = this.rankPaths(pathScores);

    if (rankedPaths.length === 0) {
      return this.generateEmptyRecommendation();
    }

    const topPathId = rankedPaths[0];
    const topPath = this.pathExplorerResult.paths.find(p => p.id === topPathId)!;
    const topScores = pathScores.get(topPathId)!;

    const recommendation = this.buildRecommendation(topPath, topScores, weights);
    const alternatives = this.buildAlternatives(rankedPaths.slice(1), pathScores);
    const confidence = this.calculateConfidence(topScores, topPathId);
    const reasoning = this.buildReasoning(topPath, topScores, recommendation);
    const tradeoffs = this.buildTradeoffs(topPath, topScores, alternatives);

    return {
      id: generateDecisionId(),
      recommendation,
      alternatives,
      confidence,
      reasoning,
      tradeoffs,
      pathScores,
      rankedPathIds: rankedPaths,
      generatedAt: Date.now(),
    };
  }

  /**
   * Calculate decision scores for all paths
   */
  private calculatePathScores(weights: DecisionFactors): Map<string, PathDecisionScore> {
    const scores = new Map<string, PathDecisionScore>();

    for (const path of this.pathExplorerResult.paths) {
      const pathScore = this.calculateSinglePathScore(path, weights);
      scores.set(path.id, pathScore);
    }

    return scores;
  }

  /**
   * Calculate decision score for a single path
   */
  private calculateSinglePathScore(path: ExploredCareerPath, weights: DecisionFactors): PathDecisionScore {
    const regretAnalysis = this.regretAnalysis.pathAnalyses.get(path.id);
    const coalitionAnalysis = this.coalitionAnalysis.pathAnalyses.get(path.id);

    // 1. Psychological Fit (25%)
    const psychologicalFit = this.calculatePsychologicalFit(path, regretAnalysis);

    // 2. Future Optionality (20%)
    const optionality = this.calculateOptionality(path);

    // 3. Criticality (15%)
    const criticality = this.calculateCriticality(path);

    // 4. Coalition Stability (15%)
    const coalition = this.calculateCoalition(coalitionAnalysis);

    // 5. Regret Risk (15%)
    const regret = this.calculateRegret(regretAnalysis);

    // 6. Long-Term Flexibility (10%)
    const flexibility = this.calculateFlexibility(path);

    // Composite score (weighted average)
    const composite =
      psychologicalFit * weights.psychologicalFit +
      optionality * weights.optionality +
      criticality * weights.criticality +
      coalition * weights.coalition +
      regret * weights.regret +
      flexibility * weights.flexibility;

    // Normalize to 0-100 scale
    const weightedComposite = composite * 100;

    return {
      pathId: path.id,
      psychologicalFit: psychologicalFit * 100,
      optionality: optionality * 100,
      criticality: criticality * 100,
      coalition: coalition * 100,
      regret: regret * 100,
      flexibility: flexibility * 100,
      composite,
      weightedComposite,
    };
  }

  /**
   * Calculate psychological fit score (0-1)
   */
  private calculatePsychologicalFit(path: ExploredCareerPath, regretAnalysis?: PathRegretAnalysis): number {
    let score = 0.5; // Base score
    let factors = 0;

    // Identity alignment from regret analysis
    if (regretAnalysis) {
      const identityFactor = regretAnalysis.factors.get('identity');
      if (identityFactor) {
        // Lower regret = higher fit
        score += (1 - identityFactor.score / 100) * 0.3;
        factors++;
      }
    }

    // Path composite score contribution
    score += (path.scores.compositeScore / 100) * 0.3;
    factors++;

    // Growth score alignment
    score += (path.scores.growthScore / 100) * 0.2;
    factors++;

    // Stability preference match
    const stabilityValue = this.readStudentValuePriority('stability', 0.5);
    const stabilityMatch = 1 - Math.abs(stabilityValue - path.scores.stabilityScore / 100);
    score += stabilityMatch * 0.2;
    factors++;

    return clamp(score, 0, 1);
  }

  /**
   * Read a student value priority from canonical StudentBeliefV3 values.
   * Keeps legacy fixture compatibility local while preserving the V3 Value[] contract.
   */
  private readStudentValuePriority(valueName: string, fallback: number): number {
    const values = (this.studentBelief as StudentBeliefV3Readable).values;

    if (!values) {
      return fallback;
    }

    if (Array.isArray(values)) {
      const matchingValue = values.find((value) => this.matchesStudentValue(value, valueName));
      return matchingValue ? clamp(matchingValue.importance, 0, 1) : fallback;
    }

    const legacyPriority = this.readLegacyValuePriority(values.valuePriorities, valueName);
    return legacyPriority === undefined ? fallback : clamp(legacyPriority, 0, 1);
  }

  private matchesStudentValue(value: Value, valueName: string): boolean {
    const target = normalizeValueIdentifier(valueName);
    return [value.id, value.name].some((candidate) => normalizeValueIdentifier(candidate) === target);
  }

  private readLegacyValuePriority(
    priorities: LegacyStudentValueShape['valuePriorities'],
    valueName: string
  ): number | undefined {
    if (!priorities) {
      return undefined;
    }

    if (priorities instanceof Map) {
      return priorities.get(valueName) ?? priorities.get(normalizeValueIdentifier(valueName));
    }

    const target = normalizeValueIdentifier(valueName);
    const matchingEntry = Object.entries(priorities).find(([key]) => normalizeValueIdentifier(key) === target);
    return matchingEntry?.[1];
  }

  /**
   * Calculate optionality score (0-1)
   */
  private calculateOptionality(path: ExploredCareerPath): number {
    // Direct optionality score from path
    let score = path.scores.optionalityScore / 100;

    // Factor in preserved options
    const preservedRatio = path.explanation.preservedOptions.length /
      Math.max(1, path.explanation.preservedOptions.length + path.explanation.closedOptions.length);
    score = score * 0.6 + preservedRatio * 0.4;

    return clamp(score, 0, 1);
  }

  /**
   * Calculate criticality score (0-1)
   */
  private calculateCriticality(path: ExploredCareerPath): number {
    // Criticality from path scores
    const criticalityScore = path.scores.criticalityScore / 100;

    // Factor in time pressure (inverse of years to first transition)
    const timePressure = Math.min(1, 2 / Math.max(1, path.metrics.avgTransitionTime));

    // Combine scores - higher criticality = higher score
    return clamp(criticalityScore * 0.7 + timePressure * 0.3, 0, 1);
  }

  /**
   * Calculate coalition stability score (0-1)
   */
  private calculateCoalition(coalitionAnalysis?: PathCoalitionAnalysis): number {
    if (!coalitionAnalysis) return 0.5;

    const aggregate = coalitionAnalysis.aggregate;
    return normalizeScore(aggregate.stabilityScore);
  }

  /**
   * Calculate regret risk score (0-1, inverted - higher = lower regret)
   */
  private calculateRegret(regretAnalysis?: PathRegretAnalysis): number {
    if (!regretAnalysis) return 0.5;

    // Overall regret score (0-100, lower is better)
    const regretScore = regretAnalysis.aggregate.overallRegretScore;

    // Convert to positive score (100 - regret)
    const positiveScore = (100 - regretScore) / 100;

    // Confidence adjustment
    const confidence = regretAnalysis.aggregate.overallConfidence;

    return clamp(positiveScore * confidence, 0, 1);
  }

  /**
   * Calculate flexibility score (0-1)
   */
  private calculateFlexibility(path: ExploredCareerPath): number {
    // Flexibility score from path
    let score = path.scores.flexibilityScore / 100;

    // Reversibility factor
    score = score * 0.6 + (path.metrics.minReversibility * 0.4);

    // Transition difficulty (inverse)
    const difficultyFactor = 1 - Math.min(1, path.metrics.totalDifficulty / 200);
    score = score * 0.7 + difficultyFactor * 0.3;

    return clamp(score, 0, 1);
  }

  /**
   * Rank paths by composite score (descending)
   */
  private rankPaths(scores: Map<string, PathDecisionScore>): string[] {
    return Array.from(scores.entries())
      .sort((a, b) => b[1].weightedComposite - a[1].weightedComposite)
      .map(([pathId]) => pathId);
  }

  /**
   * Build the primary recommendation
   */
  private buildRecommendation(
    path: ExploredCareerPath,
    scores: PathDecisionScore,
    weights: DecisionFactors
  ): DecisionRecommendation {
    const tier = getTierFromScore(scores.weightedComposite, this.estimateConfidence(scores));
    const urgency = getUrgencyFromCriticality(scores.criticality);

    return {
      pathId: path.id,
      path,
      tier,
      urgency,
      compositeScore: scores.weightedComposite,
      confidence: this.estimateConfidence(scores),
      strengths: this.identifyStrengths(scores, weights),
      caveats: this.identifyCaveats(scores),
      actionItems: this.generateActionItems(path, scores, tier),
    };
  }

  /**
   * Estimate overall confidence for a path
   */
  private estimateConfidence(scores: PathDecisionScore): number {
    const confidenceFactors = [
      scores.psychologicalFit / 100,
      scores.coalition / 100,
      scores.regret / 100,
    ];

    return confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length;
  }

  /**
   * Identify strengths for the recommendation
   */
  private identifyStrengths(scores: PathDecisionScore, weights: DecisionFactors): RecommendationStrength[] {
    const strengths: RecommendationStrength[] = [];

    if (scores.psychologicalFit >= 70) {
      strengths.push({
        factor: 'Psychological Fit',
        description: 'Strong alignment with your interests and values',
        score: scores.psychologicalFit,
      });
    }

    if (scores.optionality >= 70) {
      strengths.push({
        factor: 'Future Optionality',
        description: 'Preserves many future career options',
        score: scores.optionality,
      });
    }

    if (scores.criticality >= 60) {
      strengths.push({
        factor: 'Critical Timing',
        description: 'Important decision point with significant impact',
        score: scores.criticality,
      });
    }

    if (scores.coalition >= 70) {
      strengths.push({
        factor: 'Coalition Support',
        description: 'Strong alignment with stakeholder interests',
        score: scores.coalition,
      });
    }

    if (scores.regret >= 70) {
      strengths.push({
        factor: 'Low Regret Risk',
        description: 'Minimal expected future regret',
        score: scores.regret,
      });
    }

    if (scores.flexibility >= 70) {
      strengths.push({
        factor: 'Flexibility',
        description: 'High adaptability to changing circumstances',
        score: scores.flexibility,
      });
    }

    return strengths.sort((a, b) => b.score - a.score);
  }

  /**
   * Identify caveats for the recommendation
   */
  private identifyCaveats(scores: PathDecisionScore): RecommendationCaveat[] {
    const caveats: RecommendationCaveat[] = [];

    if (scores.psychologicalFit < 50) {
      caveats.push({
        factor: 'Psychological Fit',
        description: 'Moderate misalignment with core interests or values',
        severity: 'medium',
      });
    }

    if (scores.optionality < 50) {
      caveats.push({
        factor: 'Optionality',
        description: 'This path may close off some future options',
        severity: 'high',
      });
    }

    if (scores.coalition < 50) {
      caveats.push({
        factor: 'Coalition Support',
        description: 'Some stakeholders may have concerns',
        severity: 'medium',
      });
    }

    if (scores.regret < 50) {
      caveats.push({
        factor: 'Regret Risk',
        description: 'Higher than average risk of future regret',
        severity: 'high',
      });
    }

    return caveats;
  }

  /**
   * Generate action items for the recommendation
   */
  private generateActionItems(path: ExploredCareerPath, scores: PathDecisionScore, tier: DecisionTier): string[] {
    const actions: string[] = [];

    if (tier === 'primary' || tier === 'strong') {
      actions.push(`Commit to exploring ${path.name} in detail`);
      actions.push('Identify specific first steps and milestones');
    } else if (tier === 'conditional') {
      actions.push(`Further research needed on ${path.name}`);
      actions.push('Address identified concerns before committing');
    } else {
      actions.push(`Consider ${path.name} as a backup option`);
      actions.push('Explore additional alternatives');
    }

    if (scores.coalition < 70) {
      actions.push('Discuss decision with key stakeholders');
    }

    if (scores.regret < 60) {
      actions.push('Develop risk mitigation strategies');
    }

    return actions;
  }

  /**
   * Build alternative recommendations
   */
  private buildAlternatives(
    pathIds: string[],
    scores: Map<string, PathDecisionScore>
  ): DecisionAlternative[] {
    return pathIds.map((pathId, index) => {
      const path = this.pathExplorerResult.paths.find(p => p.id === pathId)!;
      const pathScores = scores.get(pathId)!;

      return {
        pathId,
        path,
        compositeScore: pathScores.weightedComposite,
        rank: index + 2,
        rationale: this.generateAlternativeRationale(path, pathScores),
        whenToConsider: this.generateWhenToConsider(path, pathScores),
        keyDifferences: this.identifyKeyDifferences(path, this.pathExplorerResult.paths[0]),
      };
    });
  }

  /**
   * Generate rationale for an alternative
   */
  private generateAlternativeRationale(path: ExploredCareerPath, scores: PathDecisionScore): string {
    const factors: string[] = [];

    if (scores.psychologicalFit > 70) factors.push('strong psychological fit');
    if (scores.optionality > 70) factors.push('excellent future optionality');
    if (scores.criticality > 60) factors.push('timely opportunity');
    if (scores.coalition > 70) factors.push('strong stakeholder support');
    if (scores.regret > 70) factors.push('low regret risk');
    if (scores.flexibility > 70) factors.push('high flexibility');

    if (factors.length === 0) {
      return `A viable alternative with balanced characteristics.`;
    }

    return `Strong alternative offering ${factors.join(', ')}.`;
  }

  /**
   * Generate when to consider text for an alternative
   */
  private generateWhenToConsider(path: ExploredCareerPath, scores: PathDecisionScore): string {
    if (scores.psychologicalFit > 75) {
      return 'When your interests evolve more toward this direction';
    }
    if (scores.optionality > 75) {
      return 'When you want to preserve maximum future flexibility';
    }
    if (scores.criticality > 70) {
      return 'When timing becomes more pressing';
    }
    if (scores.coalition > 75) {
      return 'When stakeholder alignment becomes a priority';
    }
    return 'As a backup option if primary recommendation becomes unavailable';
  }

  /**
   * Identify key differences between two paths
   */
  private identifyKeyDifferences(path: ExploredCareerPath, baseline: ExploredCareerPath): string[] {
    const differences: string[] = [];

    const scoreDiff = path.scores.compositeScore - baseline.scores.compositeScore;
    if (Math.abs(scoreDiff) > 10) {
      differences.push(`${scoreDiff > 0 ? 'Higher' : 'Lower'} overall suitability (${Math.abs(scoreDiff).toFixed(0)} points)`);
    }

    const optionalityDiff = path.scores.optionalityScore - baseline.scores.optionalityScore;
    if (Math.abs(optionalityDiff) > 10) {
      differences.push(`${optionalityDiff > 0 ? 'More' : 'Fewer'} future options preserved`);
    }

    const riskDiff = path.risk.score - baseline.risk.score;
    if (Math.abs(riskDiff) > 15) {
      differences.push(`${riskDiff > 0 ? 'Higher' : 'Lower'} risk profile`);
    }

    return differences;
  }

  /**
   * Calculate comprehensive confidence metrics
   */
  private calculateConfidence(scores: PathDecisionScore, pathId: string): DecisionConfidence {
    const overall = this.estimateConfidence(scores);

    const regretAnalysis = this.regretAnalysis.pathAnalyses.get(pathId);
    const coalitionAnalysis = this.coalitionAnalysis.pathAnalyses.get(pathId);

    const confidenceExplanation = overall >= 0.7
      ? 'High confidence based on strong alignment across multiple factors'
      : overall >= 0.5
        ? 'Moderate confidence with some areas requiring attention'
        : 'Lower confidence due to significant uncertainties or misalignments';

    return {
      overall,
      psychologicalFit: scores.psychologicalFit / 100,
      optionality: scores.optionality / 100,
      criticality: scores.criticality / 100,
      coalition: scores.coalition / 100,
      regret: regretAnalysis?.aggregate.overallConfidence ?? scores.regret / 100,
      flexibility: scores.flexibility / 100,
      confidenceExplanation,
    };
  }

  /**
   * Build reasoning for the decision
   */
  private buildReasoning(
    path: ExploredCareerPath,
    scores: PathDecisionScore,
    recommendation: DecisionRecommendation
  ): DecisionReasoning {
    const supportingFactors: string[] = [];
    const addressingConcerns: string[] = [];

    // Supporting factors
    if (scores.psychologicalFit >= 70) {
      supportingFactors.push('Strong alignment with your psychological profile and values');
    }
    if (scores.optionality >= 70) {
      supportingFactors.push('Preserves excellent future career flexibility');
    }
    if (scores.coalition >= 70) {
      supportingFactors.push('Strong support from your decision coalition');
    }
    if (scores.regret >= 70) {
      supportingFactors.push('Low expected regret based on comprehensive analysis');
    }

    // Addressing concerns
    if (scores.psychologicalFit < 60) {
      addressingConcerns.push('Some aspects may require adjustment to fully align with your interests');
    }
    if (scores.regret < 60) {
      addressingConcerns.push('Monitor for regret indicators and maintain option to pivot');
    }
    if (scores.coalition < 60) {
      addressingConcerns.push('Address stakeholder concerns through open communication');
    }

    return {
      primary: `The ${path.name} path offers the best overall balance of fit, flexibility, and future potential based on your profile and goals.`,
      supportingFactors,
      addressingConcerns: addressingConcerns.length > 0 ? addressingConcerns : ['No major concerns identified'],
      confidenceExplanation: recommendation.confidence >= 0.7
        ? 'High confidence reflects strong data quality and alignment'
        : recommendation.confidence >= 0.5
          ? 'Moderate confidence suggests proceeding with monitoring'
          : 'Lower confidence indicates need for additional exploration',
      longTermOutlook: this.generateLongTermOutlook(path, scores),
    };
  }

  /**
   * Generate long-term outlook text
   */
  private generateLongTermOutlook(path: ExploredCareerPath, scores: PathDecisionScore): string {
    if (scores.optionality >= 75 && scores.flexibility >= 70) {
      return 'This path positions you excellently for long-term adaptability and multiple future directions.';
    }
    if (scores.optionality >= 60 && scores.regret >= 60) {
      return 'This path offers good future prospects with manageable tradeoffs.';
    }
    if (scores.criticality >= 70) {
      return 'While this decision is significant, the timing makes it the right moment to commit.';
    }
    return 'Consider revisiting this decision as circumstances evolve and more information becomes available.';
  }

  /**
   * Build tradeoffs analysis
   */
  private buildTradeoffs(
    path: ExploredCareerPath,
    scores: PathDecisionScore,
    alternatives: DecisionAlternative[]
  ): DecisionTradeoffs {
    const keyTradeoffs: { factor: string; tradeoff: string; weight: number }[] = [];

    if (scores.optionality < 60) {
      keyTradeoffs.push({
        factor: 'Optionality',
        tradeoff: 'Sacrificing some future options for current fit',
        weight: 0.2,
      });
    }

    if (scores.regret < 60) {
      keyTradeoffs.push({
        factor: 'Risk',
        tradeoff: 'Accepting higher uncertainty for potential rewards',
        weight: 0.15,
      });
    }

    const acceptedRisks: string[] = [];
    if (scores.regret < 60) acceptedRisks.push('Higher than average regret risk');
    if (scores.coalition < 60) acceptedRisks.push('Some stakeholder misalignment');
    if (scores.flexibility < 50) acceptedRisks.push('Reduced future flexibility');

    const missedOpportunities = alternatives.slice(0, 2).map(alt =>
      `${alt.path.name}: ${alt.rationale}`
    );

    const comparisonText = alternatives.length > 0
      ? `Compared to ${alternatives[0].path.name}, this recommendation offers ${scores.weightedComposite > alternatives[0].compositeScore ? 'better overall alignment' : 'different tradeoffs that better match your priorities'}.`
      : 'This is the primary viable path identified.';

    return {
      summary: `Choosing ${path.name} means prioritizing ${this.identifyTopFactors(scores).join(' and ')}.`,
      keyTradeoffs,
      acceptedRisks: acceptedRisks.length > 0 ? acceptedRisks : ['Minimal significant risks identified'],
      missedOpportunities: missedOpportunities.length > 0 ? missedOpportunities : ['No major alternatives foregone'],
      comparisonWithAlternatives: comparisonText,
    };
  }

  /**
   * Identify top contributing factors
   */
  private identifyTopFactors(scores: PathDecisionScore): string[] {
    const factors = [
      { name: 'psychological fit', score: scores.psychologicalFit },
      { name: 'future optionality', score: scores.optionality },
      { name: 'coalition support', score: scores.coalition },
      { name: 'low regret risk', score: scores.regret },
      { name: 'flexibility', score: scores.flexibility },
    ];

    return factors
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(f => f.name);
  }

  /**
   * Generate empty recommendation when no paths available
   */
  private generateEmptyRecommendation(): DecisionRecommendationOutput {
    return {
      id: generateDecisionId(),
      recommendation: {
        pathId: '',
        path: {} as ExploredCareerPath,
        tier: 'exploratory',
        urgency: 'monitor',
        compositeScore: 0,
        confidence: 0,
        strengths: [],
        caveats: [{
          factor: 'Data',
          description: 'No viable career paths identified',
          severity: 'high',
        }],
        actionItems: ['Expand career exploration', 'Gather more information about options'],
      },
      alternatives: [],
      confidence: {
        overall: 0.1,
        psychologicalFit: 0,
        optionality: 0,
        criticality: 0,
        coalition: 0,
        regret: 0,
        flexibility: 0,
        confidenceExplanation: 'Insufficient data for confident recommendation',
      },
      reasoning: {
        primary: 'Unable to generate recommendation due to lack of viable paths.',
        supportingFactors: [],
        addressingConcerns: ['Need to expand career exploration'],
        confidenceExplanation: 'No data available',
        longTermOutlook: 'Revisit after gathering more career information',
      },
      tradeoffs: {
        summary: 'No tradeoffs to analyze without viable paths',
        keyTradeoffs: [],
        acceptedRisks: ['Indecision due to lack of information'],
        missedOpportunities: ['Unable to identify alternatives'],
        comparisonWithAlternatives: 'No alternatives available',
      },
      pathScores: new Map(),
      rankedPathIds: [],
      generatedAt: Date.now(),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function generateDecision(
  studentBelief: StudentBeliefV3,
  pathExplorerResult: CareerPathExplorerResult,
  regretAnalysis: RegretAnalysis,
  coalitionAnalysis: DecisionCoalitionAnalysis,
  graph: CareerTransitionGraphV1,
  options: DecisionIntelligenceOptions = {}
): DecisionRecommendationOutput {
  const engine = new DecisionIntelligenceEngineV1(
    studentBelief,
    pathExplorerResult,
    regretAnalysis,
    coalitionAnalysis,
    graph
  );
  return engine.generate(options);
}
