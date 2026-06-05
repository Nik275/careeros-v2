/**
 * CareerOS Career Taxonomy & Relationship System - Taxonomy Engine
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Main orchestrator for career taxonomy operations.
 *
 * @module career-taxonomy-engine
 * @version 1.0.0
 */

import type {
  CareerNode,
  CareerNodeId,
  CareerCategory,
  TaxonomyPath,
  TaxonomyQuery,
  CareerOptionality,
  AlternativeCareer,
  FutureOption,
  DEFAULT_TAXONOMY_CONFIG,
  TaxonomyConfig,
} from './career-taxonomy-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';

import { CareerGraphEngine } from './career-graph-engine';
import { CareerRelationshipEngine } from './career-relationship-engine';
import { CareerSimilarityEngine } from './career-similarity-engine';
import { CareerTransitionEngine } from './career-transition-engine';

/**
 * Main orchestrator for Career Taxonomy & Relationship System.
 *
 * Coordinates graph operations, relationship management, similarity
 * calculations, and transition modeling into unified taxonomy services.
 */
export class CareerTaxonomyEngine {
  private graph: CareerGraphEngine;
  private relationships: CareerRelationshipEngine;
  private similarity: CareerSimilarityEngine;
  private transitions: CareerTransitionEngine;
  private config: TaxonomyConfig;
  private careerIntelligenceMap: Map<CareerNodeId, CareerIntelligence> = new Map();

  constructor(config?: Partial<TaxonomyConfig>) {
    this.config = { ...DEFAULT_TAXONOMY_CONFIG, ...config };
    this.graph = new CareerGraphEngine();
    this.relationships = new CareerRelationshipEngine();
    this.similarity = new CareerSimilarityEngine();
    this.transitions = new CareerTransitionEngine();
  }

  /**
   * Register a career in the taxonomy.
   */
  registerCareer(
    careerIntelligence: CareerIntelligence,
    taxonomyPath: TaxonomyPath
  ): CareerNode {
    // Store intelligence reference
    this.careerIntelligenceMap.set(careerIntelligence.careerId, careerIntelligence);

    // Create career node
    const node: CareerNode = {
      id: careerIntelligence.careerId,
      title: careerIntelligence.careerTitle,
      category: careerIntelligence.metadata.category as CareerCategory,
      subCategory: taxonomyPath.subCategory,
      taxonomyPath,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'career-intelligence',
        isVerified: true,
      },
      careerIntelligenceRef: careerIntelligence.careerId,
    };

    // Add to graph
    this.graph.addNode(node);

    return node;
  }

  /**
   * Get career node by ID.
   */
  getCareer(careerId: CareerNodeId): CareerNode | undefined {
    return this.graph.getNode(careerId);
  }

  /**
   * Get full career intelligence.
   */
  getCareerIntelligence(careerId: CareerNodeId): CareerIntelligence | undefined {
    return this.careerIntelligenceMap.get(careerId);
  }

  /**
   * Query careers by taxonomy criteria.
   */
  queryCareers(query: TaxonomyQuery): CareerNode[] {
    let results = this.graph.getAllNodes();

    if (query.category) {
      results = results.filter((n) => n.category === query.category);
    }

    if (query.subCategory) {
      results = results.filter((n) => n.subCategory === query.subCategory);
    }

    if (query.domain) {
      results = results.filter((n) => n.taxonomyPath.domain === query.domain);
    }

    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      results = results.filter((n) => n.title.toLowerCase().includes(term));
    }

    if (query.verifiedOnly) {
      results = results.filter((n) => n.metadata.isVerified);
    }

    return results;
  }

  /**
   * Create relationship between careers.
   */
  createRelationship(
    sourceId: CareerNodeId,
    targetId: CareerNodeId,
    relationshipType: 'SIMILAR' | 'ADJACENT' | 'TRANSITION' | 'ALTERNATIVE_TO',
    strength: number
  ): void {
    const source = this.getCareerIntelligence(sourceId);
    const target = this.getCareerIntelligence(targetId);

    if (!source || !target) {
      throw new Error('Both careers must be registered before creating relationship');
    }

    const evidence = this.generateRelationshipEvidence(source, target, relationshipType);

    switch (relationshipType) {
      case 'SIMILAR':
        this.relationships.createSimilarRelationship(sourceId, targetId, strength, evidence);
        break;
      case 'ADJACENT':
        this.relationships.createAdjacentRelationship(sourceId, targetId, strength, evidence);
        break;
      case 'TRANSITION':
        this.relationships.createTransitionRelationship(sourceId, targetId, strength, evidence);
        break;
      case 'ALTERNATIVE_TO':
        this.relationships.createAlternativeRelationship(sourceId, targetId, strength, evidence);
        break;
    }

    // Sync with graph
    const relationship = this.relationships.getRelationship(sourceId, targetId, relationshipType);
    if (relationship) {
      this.graph.addEdge(relationship);
    }
  }

  /**
   * Calculate similarity between two careers.
   */
  calculateSimilarity(careerAId: CareerNodeId, careerBId: CareerNodeId) {
    const careerA = this.getCareerIntelligence(careerAId);
    const careerB = this.getCareerIntelligence(careerBId);

    if (!careerA || !careerB) {
      return null;
    }

    return this.similarity.calculateSimilarity(careerA, careerB);
  }

  /**
   * Find similar careers.
   */
  findSimilarCareers(
    careerId: CareerNodeId,
    threshold: number = 60,
    limit: number = 10
  ): Array<{ career: CareerNode; similarity: number }> {
    const target = this.getCareerIntelligence(careerId);
    if (!target) return [];

    const candidates = Array.from(this.careerIntelligenceMap.values()).filter(
      (c) => c.careerId !== careerId
    );

    const similar = this.similarity.findSimilarCareers(target, candidates, threshold);

    return similar
      .map((result) => ({
        career: this.graph.getNode(result.career.careerId)!,
        similarity: result.similarity.overallScore,
      }))
      .filter((r) => r.career)
      .slice(0, limit);
  }

  /**
   * Create transition model.
   */
  createTransition(fromCareerId: CareerNodeId, toCareerId: CareerNodeId) {
    const from = this.getCareerIntelligence(fromCareerId);
    const to = this.getCareerIntelligence(toCareerId);

    if (!from || !to) {
      return null;
    }

    return this.transitions.createTransition(from, to);
  }

  /**
   * Find path between careers.
   */
  findPath(fromCareerId: CareerNodeId, toCareerId: CareerNodeId) {
    return this.graph.findPath(fromCareerId, toCareerId, this.config.maxPathLength);
  }

  /**
   * Find all paths between careers.
   */
  findAllPaths(fromCareerId: CareerNodeId, toCareerId: CareerNodeId) {
    return this.graph.findAllPaths(fromCareerId, toCareerId, this.config.maxPathLength);
  }

  /**
   * Get career neighbors.
   */
  getNeighbors(careerId: CareerNodeId): CareerNode[] {
    const neighborIds = this.graph.getNeighbors(careerId);
    return neighborIds
      .map((id) => this.graph.getNode(id))
      .filter((node): node is CareerNode => node !== undefined);
  }

  /**
   * Analyze optionality for a career.
   *
   * Answers: "If this career doesn't work out, what are my alternatives?"
   * and "What careers remain available after choosing this path?"
   */
  analyzeOptionality(careerId: CareerNodeId): CareerOptionality | null {
    const career = this.getCareerIntelligence(careerId);
    const node = this.graph.getNode(careerId);

    if (!career || !node) return null;

    // Find alternatives (similar careers)
    const alternatives = this.findAlternatives(careerId);

    // Find future options (accessible via transition paths)
    const futureOptions = this.findFutureOptions(careerId);

    // Calculate optionality score
    const optionalityScore = this.calculateOptionalityScore(alternatives, futureOptions, career);

    // Calculate lock-in risk
    const lockInRisk = this.calculateLockInRisk(career, alternatives.length);

    // Determine flexibility rating
    const flexibility = this.determineFlexibility(optionalityScore, lockInRisk);

    return {
      careerId,
      alternatives,
      futureOptions,
      optionalityScore,
      lockInRisk,
      flexibility,
    };
  }

  /**
   * Find alternative careers.
   */
  private findAlternatives(careerId: CareerNodeId): AlternativeCareer[] {
    const alternatives: AlternativeCareer[] = [];

    // Get similar careers
    const similar = this.findSimilarCareers(careerId, 50, 10);

    for (const { career, similarity } of similar) {
      const careerIntelligence = this.getCareerIntelligence(career.id);
      if (!careerIntelligence) continue;

      alternatives.push({
        careerId: career.id,
        reason: this.generateAlternativeReason(careerId, career.id, similarity),
        similarityScore: similarity,
        transitionDifficulty: this.estimateTransitionDifficulty(careerId, career.id),
      });
    }

    // Get ALTERNATIVE_TO relationships
    const alternativeRelationships = this.relationships.getRelationshipsFrom(
      careerId,
      'ALTERNATIVE_TO'
    );

    for (const rel of alternativeRelationships) {
      if (!alternatives.some((a) => a.careerId === rel.targetCareerId)) {
        alternatives.push({
          careerId: rel.targetCareerId,
          reason: 'Direct alternative path',
          similarityScore: rel.strength,
          transitionDifficulty: Math.round(100 - rel.strength),
        });
      }
    }

    return alternatives.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Find future career options.
   */
  private findFutureOptions(careerId: CareerNodeId): FutureOption[] {
    const options: FutureOption[] = [];

    // Get transitions from this career
    const transitions = this.transitions.getTransitionsFrom(careerId);

    for (const transition of transitions.slice(0, 8)) {
      const path = this.graph.findPath(careerId, transition.toCareerId);
      if (path) {
        options.push({
          careerId: transition.toCareerId,
          path,
          timeToReach: transition.estimatedTimeMonths,
          difficulty: transition.difficulty,
        });
      }
    }

    // Get reachable careers via graph traversal
    const reachable = this.graph.findWithinDistance(careerId, 2, 50);

    for (const { careerId: reachableId, distance, strength } of reachable.slice(0, 10)) {
      if (!options.some((o) => o.careerId === reachableId)) {
        const path = this.graph.findPath(careerId, reachableId);
        if (path) {
          options.push({
            careerId: reachableId,
            path,
            timeToReach: distance * 12,
            difficulty: Math.round(100 - strength),
          });
        }
      }
    }

    return options.sort((a, b) => a.difficulty - b.difficulty);
  }

  /**
   * Calculate optionality score.
   */
  private calculateOptionalityScore(
    alternatives: AlternativeCareer[],
    futureOptions: FutureOption[],
    career: CareerIntelligence
  ): number {
    let score = career.careerAdvantages.optionality.score;

    // Boost for number of alternatives
    score += Math.min(20, alternatives.length * 3);

    // Boost for number of future options
    score += Math.min(15, futureOptions.length * 2);

    // Boost for transferability
    score += (career.careerAdvantages.transferability.score - 50) * 0.2;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate lock-in risk.
   */
  private calculateLockInRisk(career: CareerIntelligence, alternativeCount: number): number {
    let risk = 0;

    // Low transferability increases lock-in
    risk += (100 - career.careerAdvantages.transferability.score) * 0.3;

    // Low optionality increases lock-in
    risk += (100 - career.careerAdvantages.optionality.score) * 0.3;

    // Few alternatives increases lock-in
    risk += Math.max(0, 30 - alternativeCount * 5);

    // High specialization increases lock-in
    const cognitiveVariance = this.calculateCognitiveVariance(career);
    risk += cognitiveVariance * 0.2;

    return Math.min(100, Math.round(risk));
  }

  /**
   * Determine flexibility rating.
   */
  private determineFlexibility(
    optionalityScore: number,
    lockInRisk: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const netFlexibility = optionalityScore - lockInRisk;

    if (netFlexibility >= 30) return 'HIGH';
    if (netFlexibility >= 0) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate reason for alternative.
   */
  private generateAlternativeReason(
    fromCareerId: CareerNodeId,
    toCareerId: CareerNodeId,
    similarity: number
  ): string {
    if (similarity >= 80) return 'Very similar career profile';
    if (similarity >= 65) return 'Similar skills and demands';
    if (similarity >= 50) return 'Related career path';
    return 'Alternative with transferable skills';
  }

  /**
   * Estimate transition difficulty.
   */
  private estimateTransitionDifficulty(fromId: CareerNodeId, toId: CareerNodeId): number {
    const transition = this.transitions.getTransition(`${fromId}-${toId}`);
    if (transition) return transition.difficulty;

    const from = this.getCareerIntelligence(fromId);
    const to = this.getCareerIntelligence(toId);

    if (!from || !to) return 70;

    // Simple estimation
    const cognitiveGap = Math.abs(
      from.cognitiveDemands.analyticalDemand.score - to.cognitiveDemands.analyticalDemand.score
    );

    return Math.round(cognitiveGap);
  }

  /**
   * Calculate cognitive variance.
   */
  private calculateCognitiveVariance(career: CareerIntelligence): number {
    const scores = [
      career.cognitiveDemands.analyticalDemand.score,
      career.cognitiveDemands.creativeDemand.score,
      career.cognitiveDemands.systematicDemand.score,
    ];

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

    return Math.round(variance / 10);
  }

  /**
   * Generate relationship evidence.
   */
  private generateRelationshipEvidence(
    source: CareerIntelligence,
    target: CareerIntelligence,
    relationshipType: string
  ) {
    const evidence = [];

    if (relationshipType === 'SIMILAR' || relationshipType === 'ALTERNATIVE_TO') {
      const similarity = this.similarity.calculateSimilarity(source, target);

      evidence.push({
        type: 'SKILL_OVERLAP' as const,
        description: `Skill similarity score: ${similarity.dimensions.skillSimilarity}%`,
        score: similarity.dimensions.skillSimilarity,
        weight: 0.3,
      });

      evidence.push({
        type: 'COGNITIVE_SIMILARITY' as const,
        description: `Cognitive demand similarity: ${similarity.dimensions.cognitiveSimilarity}%`,
        score: similarity.dimensions.cognitiveSimilarity,
        weight: 0.3,
      });
    }

    if (relationshipType === 'TRANSITION') {
      evidence.push({
        type: 'TRANSITION_DATA' as const,
        description: `Career progression path exists from ${source.careerTitle} to ${target.careerTitle}`,
        score: 75,
        weight: 0.5,
      });
    }

    return evidence;
  }

  /**
   * Get taxonomy statistics.
   */
  getStatistics() {
    const graphStats = this.graph.getStatistics();
    const relationshipStats = this.relationships.getStatistics();

    return {
      ...graphStats,
      ...relationshipStats,
      registeredCareers: this.careerIntelligenceMap.size,
    };
  }

  /**
   * Get careers by category.
   */
  getCareersByCategory(category: CareerCategory): CareerNode[] {
    return this.graph.getNodesByCategory(category);
  }

  /**
   * Get all career IDs.
   */
  getAllCareerIds(): CareerNodeId[] {
    return this.graph.getAllNodeIds();
  }
}

/**
 * Factory function for CareerTaxonomyEngine.
 */
export function createCareerTaxonomyEngine(
  config?: Partial<TaxonomyConfig>
): CareerTaxonomyEngine {
  return new CareerTaxonomyEngine(config);
}

// Re-export all engines and types
export * from './career-taxonomy-types';
export { CareerGraphEngine, createCareerGraphEngine } from './career-graph-engine';
export { CareerRelationshipEngine, createCareerRelationshipEngine } from './career-relationship-engine';
export { CareerSimilarityEngine, createCareerSimilarityEngine } from './career-similarity-engine';
export { CareerTransitionEngine, createCareerTransitionEngine } from './career-transition-engine';
