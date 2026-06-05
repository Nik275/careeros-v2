/**
 * Irreversibility Engine
 *
 * Measures "How difficult is it to reverse this decision later?"
 * Outputs an IrreversibilityScore (0-100) based on cost, time, credentials, and barriers.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  NodeId,
  IrreversibilityScore,
  Score,
  Probability,
} from './career-graph-types';

export interface IrreversibilityEngineOptions {
  financialWeight: number;
  timeWeight: number;
  credentialWeight: number;
  barrierWeight: number;
  skillAtrophyWeight: number;
}

export const DEFAULT_IRREVERSIBILITY_OPTIONS: IrreversibilityEngineOptions = {
  financialWeight: 0.25,
  timeWeight: 0.25,
  credentialWeight: 0.20,
  barrierWeight: 0.15,
  skillAtrophyWeight: 0.15,
};

export interface ReversibilityFactors {
  financialInvestment: number;
  timeInvestment: number;
  credentialSpecificity: number;
  reentryBarriers: number;
  skillDecay: number;
}

export class IrreversibilityEngine {
  private graph: CareerGraph;
  private options: IrreversibilityEngineOptions;

  constructor(graph: CareerGraph, options: Partial<IrreversibilityEngineOptions> = {}) {
    this.graph = graph;
    this.options = { ...DEFAULT_IRREVERSIBILITY_OPTIONS, ...options };
  }

  /**
   * Calculate irreversibility score for a node
   */
  calculateIrreversibility(nodeId: NodeId): IrreversibilityScore {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      return this.createEmptyScore();
    }

    const factors = this.analyzeReversibilityFactors(node);

    // Calculate component scores
    const financialCost = this.calculateFinancialCostScore(factors.financialInvestment);
    const timeInvestment = this.calculateTimeInvestmentScore(factors.timeInvestment);
    const credentialLockIn = this.calculateCredentialLockInScore(node, factors.credentialSpecificity);
    const entranceBarriers = this.calculateEntranceBarriersScore(node, factors.reentryBarriers);
    const skillAtrophy = this.calculateSkillAtrophyScore(node, factors.skillDecay);

    // Weighted total
    const totalScore = Math.round(
      financialCost * this.options.financialWeight +
      timeInvestment * this.options.timeWeight +
      credentialLockIn * this.options.credentialWeight +
      entranceBarriers * this.options.barrierWeight +
      skillAtrophy * this.options.skillAtrophyWeight
    );

    // Calculate reversibility probabilities
    const reversibleWithin = this.calculateReversibilityProbabilities(
      totalScore,
      factors
    );

    // Identify factors and mitigations
    const irreversibilityFactors = this.identifyIrreversibilityFactors(node, factors);
    const mitigationStrategies = this.identifyMitigationStrategies(node, factors);

    return {
      score: totalScore,
      financialCost,
      timeInvestment,
      credentialLockIn,
      entranceBarriers,
      skillAtrophy,
      reversibleWithin,
      irreversibilityFactors,
      mitigationStrategies,
    };
  }

  /**
   * Analyze reversibility factors
   */
  private analyzeReversibilityFactors(node: CareerNode): ReversibilityFactors {
    // Financial investment
    const financialInvestment = node.costRange.max;

    // Time investment
    const timeInvestment = node.typicalDuration;

    // Credential specificity (how specialized are the credentials)
    const credentialSpecificity = this.calculateCredentialSpecificity(node);

    // Reentry barriers
    const reentryBarriers = this.calculateReentryBarriers(node);

    // Skill decay
    const skillDecay = this.calculateSkillDecayRisk(node);

    return {
      financialInvestment,
      timeInvestment,
      credentialSpecificity,
      reentryBarriers,
      skillDecay,
    };
  }

  /**
   * Calculate credential specificity
   */
  private calculateCredentialSpecificity(node: CareerNode): number {
    let specificity = 50; // Base

    // Specialized degrees have higher specificity
    if (node.type === 'specialization') specificity += 30;
    if (node.type === 'certification') specificity += 20;

    // Check for specialized terms in name
    const specializedTerms = ['surgery', 'research', 'forensic', 'nuclear', 'quantum'];
    for (const term of specializedTerms) {
      if (node.name.toLowerCase().includes(term)) {
        specificity += 10;
      }
    }

    // More prerequisites = more specialized
    specificity += node.prerequisites.length * 5;

    return Math.min(100, specificity);
  }

  /**
   * Calculate reentry barriers
   */
  private calculateReentryBarriers(node: CareerNode): number {
    let barriers = 30; // Base

    // Entrance exams increase barriers
    const examKeywords = ['jee', 'neet', 'upsc', 'cat', 'gate'];
    for (const keyword of examKeywords) {
      if (node.name.toLowerCase().includes(keyword)) {
        barriers += 20;
      }
    }

    // Age restrictions
    if (node.entryAge.max < 30) {
      barriers += 15;
    }

    // High prerequisites
    barriers += node.prerequisites.length * 8;

    return Math.min(100, barriers);
  }

  /**
   * Calculate skill decay risk
   */
  private calculateSkillDecayRisk(node: CareerNode): number {
    let decay = 40; // Base

    // Technical skills decay faster if not used
    const technicalSkills = ['programming', 'engineering', 'medicine', 'research'];
    for (const skill of technicalSkills) {
      if (node.name.toLowerCase().includes(skill)) {
        decay += 15;
      }
    }

    // Certifications require ongoing renewal
    if (node.type === 'certification') {
      decay += 10;
    }

    // Longer duration = higher investment = higher decay risk
    if (node.typicalDuration > 48) {
      decay += 10;
    }

    return Math.min(100, decay);
  }

  /**
   * Calculate financial cost score
   */
  private calculateFinancialCostScore(investment: number): Score {
    // Score 0-100 based on investment amount
    if (investment <= 0) return 0;
    if (investment >= 5000000) return 100; // 50L+ is max irreversibility

    return Math.round((investment / 5000000) * 100);
  }

  /**
   * Calculate time investment score
   */
  private calculateTimeInvestmentScore(months: number): Score {
    // Score 0-100 based on time invested
    if (months <= 6) return 10;
    if (months >= 72) return 100; // 6+ years is max

    return Math.round((months / 72) * 100);
  }

  /**
   * Calculate credential lock-in score
   */
  private calculateCredentialLockInScore(node: CareerNode, specificity: number): Score {
    let lockIn = specificity;

    // Medical and legal credentials highly locked-in
    if (node.name.toLowerCase().includes('mbbs') || node.name.toLowerCase().includes('doctor')) {
      lockIn += 20;
    }
    if (node.name.toLowerCase().includes('ca') || node.name.toLowerCase().includes('law')) {
      lockIn += 15;
    }

    return Math.min(100, lockIn);
  }

  /**
   * Calculate entrance barriers score
   */
  private calculateEntranceBarriersScore(node: CareerNode, barriers: number): Score {
    return Math.min(100, barriers);
  }

  /**
   * Calculate skill atrophy score
   */
  private calculateSkillAtrophyScore(node: CareerNode, decay: number): Score {
    return Math.min(100, decay);
  }

  /**
   * Calculate reversibility probabilities over time
   */
  private calculateReversibilityProbabilities(
    totalScore: Score,
    factors: ReversibilityFactors
  ): {
    oneYear: Probability;
    threeYears: Probability;
    fiveYears: Probability;
  } {
    // Base probability inversely related to score
    const baseProbability = Math.max(0, 1 - totalScore / 100);

    // Adjust based on factors
    const timeFactor = Math.max(0, 1 - factors.timeInvestment / 60);
    const financialFactor = Math.max(0, 1 - factors.financialInvestment / 2000000);

    return {
      oneYear: Math.max(0, baseProbability * 0.8 * timeFactor),
      threeYears: Math.max(0, baseProbability * 0.6 * timeFactor * financialFactor),
      fiveYears: Math.max(0, baseProbability * 0.4 * timeFactor * financialFactor),
    };
  }

  /**
   * Identify irreversibility factors
   */
  private identifyIrreversibilityFactors(node: CareerNode, factors: ReversibilityFactors): string[] {
    const factors_list: string[] = [];

    if (factors.financialInvestment > 1000000) {
      factors_list.push(`High financial investment (₹${(factors.financialInvestment / 100000).toFixed(1)}L)`);
    }
    if (factors.timeInvestment > 36) {
      factors_list.push(`Long time commitment (${(factors.timeInvestment / 12).toFixed(1)} years)`);
    }
    if (factors.credentialSpecificity > 60) {
      factors_list.push('Specialized credentials with limited transferability');
    }
    if (factors.reentryBarriers > 50) {
      factors_list.push('High barriers to re-entry');
    }
    if (factors.skillDecay > 50) {
      factors_list.push('Skills decay quickly if not practiced');
    }

    // Node-specific factors
    if (node.type === 'specialization') {
      factors_list.push('Specialization limits pivot options');
    }
    if (node.prerequisites.length > 3) {
      factors_list.push('Multiple prerequisites required');
    }

    return factors_list;
  }

  /**
   * Identify mitigation strategies
   */
  private identifyMitigationStrategies(node: CareerNode, factors: ReversibilityFactors): string[] {
    const strategies: string[] = [];

    if (factors.credentialSpecificity > 50) {
      strategies.push('Maintain transferable skills alongside specialized credentials');
    }
    if (factors.skillDecay > 40) {
      strategies.push('Regular practice and continuing education');
    }
    if (factors.financialInvestment > 500000) {
      strategies.push('Financial planning for potential transition costs');
    }
    if (factors.timeInvestment > 24) {
      strategies.push('Consider part-time or parallel skill development');
    }

    strategies.push('Build diverse professional network');
    strategies.push('Document transferable achievements');

    return strategies;
  }

  /**
   * Compare irreversibility across multiple nodes
   */
  compareIrreversibility(nodeIds: NodeId[]): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    reversibleWithin1Year: Probability;
    reversibleWithin5Years: Probability;
    keyFactor: string;
  }> {
    return nodeIds.map(nodeId => {
      const score = this.calculateIrreversibility(nodeId);
      const node = this.graph.nodes.get(nodeId);

      return {
        nodeId,
        nodeName: node?.name || nodeId,
        score: score.score,
        reversibleWithin1Year: score.reversibleWithin.oneYear,
        reversibleWithin5Years: score.reversibleWithin.fiveYears,
        keyFactor: score.irreversibilityFactors[0] || 'Standard reversibility',
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Find highly irreversible nodes (high risk)
   */
  findHighlyIrreversibleNodes(minScore: Score = 70, limit: number = 10): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    warning: string;
  }> {
    const results: Array<{ nodeId: NodeId; nodeName: string; score: Score; warning: string }> = [];

    for (const [nodeId, node] of Array.from(this.graph.nodes)) {
      const score = this.calculateIrreversibility(nodeId);
      if (score.score >= minScore) {
        results.push({
          nodeId,
          nodeName: node.name,
          score: score.score,
          warning: score.irreversibilityFactors[0] || 'High commitment required',
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Find easily reversible nodes (low risk)
   */
  findEasilyReversibleNodes(maxScore: Score = 40, limit: number = 10): Array<{
    nodeId: NodeId;
    nodeName: string;
    score: Score;
    benefit: string;
  }> {
    const results: Array<{ nodeId: NodeId; nodeName: string; score: Score; benefit: string }> = [];

    for (const [nodeId, node] of Array.from(this.graph.nodes)) {
      const score = this.calculateIrreversibility(nodeId);
      if (score.score <= maxScore) {
        results.push({
          nodeId,
          nodeName: node.name,
          score: score.score,
          benefit: 'Easy to pivot if needed',
        });
      }
    }

    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  /**
   * Create empty irreversibility score
   */
  private createEmptyScore(): IrreversibilityScore {
    return {
      score: 0,
      financialCost: 0,
      timeInvestment: 0,
      credentialLockIn: 0,
      entranceBarriers: 0,
      skillAtrophy: 0,
      reversibleWithin: {
        oneYear: 1,
        threeYears: 1,
        fiveYears: 1,
      },
      irreversibilityFactors: [],
      mitigationStrategies: [],
    };
  }

  /**
   * Update graph reference
   */
  updateGraph(graph: CareerGraph): void {
    this.graph = graph;
  }
}
