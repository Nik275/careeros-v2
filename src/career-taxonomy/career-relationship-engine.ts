/**
 * CareerOS Career Taxonomy & Relationship System - Relationship Engine
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Manages relationships between careers in the taxonomy graph.
 *
 * @module career-relationship-engine
 * @version 1.0.0
 */

import type {
  CareerNodeId,
  CareerRelationship,
  RelationshipType,
  RelationshipQuery,
  RelationshipEvidence,
} from './career-taxonomy-types';

/**
 * Manages career relationships in the taxonomy graph.
 *
 * Creates, stores, and queries relationships between careers
 * including similarity, adjacency, transition paths, and more.
 */
export class CareerRelationshipEngine {
  private relationships: Map<string, CareerRelationship> = new Map();
  private adjacencyList: Map<CareerNodeId, Set<CareerNodeId>> = new Map();

  /**
   * Create a relationship between two careers.
   */
  createRelationship(
    sourceCareerId: CareerNodeId,
    targetCareerId: CareerNodeId,
    relationshipType: RelationshipType,
    strength: number,
    evidence: RelationshipEvidence[],
    bidirectional: boolean = false
  ): CareerRelationship {
    const relationshipId = this.generateRelationshipId(sourceCareerId, targetCareerId, relationshipType);

    const relationship: CareerRelationship = {
      sourceCareerId,
      targetCareerId,
      relationshipType,
      strength: Math.min(100, Math.max(0, strength)),
      confidence: this.calculateConfidence(evidence),
      evidence,
      directionality: bidirectional ? 'BIDIRECTIONAL' : 'UNIDIRECTIONAL',
      metadata: {
        createdAt: new Date(),
        calculatedAt: new Date(),
        calculationMethod: 'manual',
        dataQuality: this.calculateDataQuality(evidence),
      },
    };

    this.relationships.set(relationshipId, relationship);
    this.updateAdjacencyList(sourceCareerId, targetCareerId);

    // Create reverse relationship if bidirectional
    if (bidirectional) {
      const reverseId = this.generateRelationshipId(targetCareerId, sourceCareerId, relationshipType);
      const reverseRelationship: CareerRelationship = {
        ...relationship,
        sourceCareerId: targetCareerId,
        targetCareerId: sourceCareerId,
      };
      this.relationships.set(reverseId, reverseRelationship);
      this.updateAdjacencyList(targetCareerId, sourceCareerId);
    }

    return relationship;
  }

  /**
   * Create a SIMILAR relationship.
   */
  createSimilarRelationship(
    careerA: CareerNodeId,
    careerB: CareerNodeId,
    similarityScore: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    return this.createRelationship(
      careerA,
      careerB,
      'SIMILAR',
      similarityScore,
      evidence,
      true
    );
  }

  /**
   * Create an ADJACENT relationship.
   */
  createAdjacentRelationship(
    careerA: CareerNodeId,
    careerB: CareerNodeId,
    adjacencyStrength: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    return this.createRelationship(
      careerA,
      careerB,
      'ADJACENT',
      adjacencyStrength,
      evidence,
      true
    );
  }

  /**
   * Create a TRANSITION relationship.
   */
  createTransitionRelationship(
    fromCareer: CareerNodeId,
    toCareer: CareerNodeId,
    transitionFeasibility: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    return this.createRelationship(
      fromCareer,
      toCareer,
      'TRANSITION',
      transitionFeasibility,
      evidence,
      false
    );
  }

  /**
   * Create a SPECIALIZATION relationship.
   */
  createSpecializationRelationship(
    generalCareer: CareerNodeId,
    specializedCareer: CareerNodeId,
    specializationStrength: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    // General → Specialized
    return this.createRelationship(
      generalCareer,
      specializedCareer,
      'SPECIALIZATION',
      specializationStrength,
      evidence,
      false
    );
  }

  /**
   * Create a GENERALIZATION relationship.
   */
  createGeneralizationRelationship(
    specializedCareer: CareerNodeId,
    generalCareer: CareerNodeId,
    generalizationStrength: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    // Specialized → General
    return this.createRelationship(
      specializedCareer,
      generalCareer,
      'GENERALIZATION',
      generalizationStrength,
      evidence,
      false
    );
  }

  /**
   * Create a FOUNDATION_FOR relationship.
   */
  createFoundationRelationship(
    foundationCareer: CareerNodeId,
    advancedCareer: CareerNodeId,
    foundationStrength: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    return this.createRelationship(
      foundationCareer,
      advancedCareer,
      'FOUNDATION_FOR',
      foundationStrength,
      evidence,
      false
    );
  }

  /**
   * Create an ALTERNATIVE_TO relationship.
   */
  createAlternativeRelationship(
    careerA: CareerNodeId,
    careerB: CareerNodeId,
    alternativeStrength: number,
    evidence: RelationshipEvidence[]
  ): CareerRelationship {
    return this.createRelationship(
      careerA,
      careerB,
      'ALTERNATIVE_TO',
      alternativeStrength,
      evidence,
      true
    );
  }

  /**
   * Get a relationship by IDs.
   */
  getRelationship(
    sourceCareerId: CareerNodeId,
    targetCareerId: CareerNodeId,
    relationshipType?: RelationshipType
  ): CareerRelationship | undefined {
    if (relationshipType) {
      const relationshipId = this.generateRelationshipId(sourceCareerId, targetCareerId, relationshipType);
      return this.relationships.get(relationshipId);
    }

    // Find any relationship between the careers
    for (const [id, relationship] of this.relationships) {
      if (
        relationship.sourceCareerId === sourceCareerId &&
        relationship.targetCareerId === targetCareerId
      ) {
        return relationship;
      }
    }

    return undefined;
  }

  /**
   * Query relationships with filters.
   */
  queryRelationships(query: RelationshipQuery): CareerRelationship[] {
    let results = Array.from(this.relationships.values());

    if (query.sourceCareerId) {
      results = results.filter((r) => r.sourceCareerId === query.sourceCareerId);
    }

    if (query.targetCareerId) {
      results = results.filter((r) => r.targetCareerId === query.targetCareerId);
    }

    if (query.relationshipTypes && query.relationshipTypes.length > 0) {
      results = results.filter((r) => query.relationshipTypes!.includes(r.relationshipType));
    }

    if (query.minStrength !== undefined) {
      results = results.filter((r) => r.strength >= query.minStrength!);
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((r) => r.confidence >= query.minConfidence!);
    }

    return results;
  }

  /**
   * Get all relationships from a career.
   */
  getRelationshipsFrom(careerId: CareerNodeId, type?: RelationshipType): CareerRelationship[] {
    let relationships = Array.from(this.relationships.values()).filter(
      (r) => r.sourceCareerId === careerId
    );

    if (type) {
      relationships = relationships.filter((r) => r.relationshipType === type);
    }

    return relationships;
  }

  /**
   * Get all relationships to a career.
   */
  getRelationshipsTo(careerId: CareerNodeId, type?: RelationshipType): CareerRelationship[] {
    let relationships = Array.from(this.relationships.values()).filter(
      (r) => r.targetCareerId === careerId
    );

    if (type) {
      relationships = relationships.filter((r) => r.relationshipType === type);
    }

    return relationships;
  }

  /**
   * Get related careers (neighbors).
   */
  getRelatedCareers(careerId: CareerNodeId): CareerNodeId[] {
    const related = this.adjacencyList.get(careerId);
    return related ? Array.from(related) : [];
  }

  /**
   * Get neighbors by relationship type.
   */
  getNeighborsByType(careerId: CareerNodeId, type: RelationshipType): CareerNodeId[] {
    const relationships = this.getRelationshipsFrom(careerId, type);
    return relationships.map((r) => r.targetCareerId);
  }

  /**
   * Check if relationship exists.
   */
  hasRelationship(
    sourceCareerId: CareerNodeId,
    targetCareerId: CareerNodeId,
    type?: RelationshipType
  ): boolean {
    return this.getRelationship(sourceCareerId, targetCareerId, type) !== undefined;
  }

  /**
   * Remove a relationship.
   */
  removeRelationship(
    sourceCareerId: CareerNodeId,
    targetCareerId: CareerNodeId,
    type: RelationshipType
  ): boolean {
    const relationshipId = this.generateRelationshipId(sourceCareerId, targetCareerId, type);
    const existed = this.relationships.has(relationshipId);
    this.relationships.delete(relationshipId);

    // Update adjacency list
    const neighbors = this.adjacencyList.get(sourceCareerId);
    if (neighbors) {
      neighbors.delete(targetCareerId);
    }

    return existed;
  }

  /**
   * Get strongest relationships for a career.
   */
  getStrongestRelationships(careerId: CareerNodeId, limit: number = 5): CareerRelationship[] {
    return this.getRelationshipsFrom(careerId)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  /**
   * Get relationship statistics.
   */
  getStatistics(): {
    totalRelationships: number;
    byType: Record<RelationshipType, number>;
    averageStrength: number;
    averageConfidence: number;
  } {
    const byType: Record<RelationshipType, number> = {
      SIMILAR: 0,
      ADJACENT: 0,
      TRANSITION: 0,
      SPECIALIZATION: 0,
      GENERALIZATION: 0,
      FOUNDATION_FOR: 0,
      ALTERNATIVE_TO: 0,
    };

    let totalStrength = 0;
    let totalConfidence = 0;

    for (const relationship of this.relationships.values()) {
      byType[relationship.relationshipType]++;
      totalStrength += relationship.strength;
      totalConfidence += relationship.confidence;
    }

    const count = this.relationships.size;

    return {
      totalRelationships: count,
      byType,
      averageStrength: count > 0 ? Math.round(totalStrength / count) : 0,
      averageConfidence: count > 0 ? Math.round(totalConfidence / count) : 0,
    };
  }

  /**
   * Create evidence for relationship.
   */
  createEvidence(
    type: RelationshipEvidence['type'],
    description: string,
    score: number,
    weight: number
  ): RelationshipEvidence {
    return {
      type,
      description,
      score: Math.min(100, Math.max(0, score)),
      weight: Math.min(1, Math.max(0, weight)),
    };
  }

  /**
   * Generate relationship ID.
   */
  private generateRelationshipId(
    source: CareerNodeId,
    target: CareerNodeId,
    type: RelationshipType
  ): string {
    return `${source}-${target}-${type}`;
  }

  /**
   * Update adjacency list.
   */
  private updateAdjacencyList(source: CareerNodeId, target: CareerNodeId): void {
    let neighbors = this.adjacencyList.get(source);
    if (!neighbors) {
      neighbors = new Set();
      this.adjacencyList.set(source, neighbors);
    }
    neighbors.add(target);
  }

  /**
   * Calculate confidence from evidence.
   */
  private calculateConfidence(evidence: RelationshipEvidence[]): number {
    if (evidence.length === 0) return 50;

    const weightedSum = evidence.reduce((sum, e) => sum + e.score * e.weight, 0);
    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0);

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  }

  /**
   * Calculate data quality from evidence.
   */
  private calculateDataQuality(evidence: RelationshipEvidence[]): number {
    if (evidence.length === 0) return 30;

    // Quality based on number of sources and average weight
    const sourceBonus = Math.min(30, evidence.length * 6);
    const avgWeight = evidence.reduce((sum, e) => sum + e.weight, 0) / evidence.length;

    return Math.round(40 + sourceBonus + avgWeight * 30);
  }

  /**
   * Get all relationship types between two careers.
   */
  getRelationshipTypesBetween(
    careerA: CareerNodeId,
    careerB: CareerNodeId
  ): RelationshipType[] {
    const types: RelationshipType[] = [];

    for (const relationship of this.relationships.values()) {
      if (
        (relationship.sourceCareerId === careerA && relationship.targetCareerId === careerB) ||
        (relationship.sourceCareerId === careerB && relationship.targetCareerId === careerA &&
         relationship.directionality === 'BIDIRECTIONAL')
      ) {
        types.push(relationship.relationshipType);
      }
    }

    return types;
  }

  /**
   * Find careers with mutual relationships.
   */
  findMutuallyRelated(careerId: CareerNodeId): Array<{
    careerId: CareerNodeId;
    outgoing: CareerRelationship[];
    incoming: CareerRelationship[];
  }> {
    const result: Array<{
      careerId: CareerNodeId;
      outgoing: CareerRelationship[];
      incoming: CareerRelationship[];
    }> = [];

    const related = this.getRelatedCareers(careerId);

    for (const relatedId of related) {
      const outgoing = this.getRelationshipsFrom(careerId).filter(
        (r) => r.targetCareerId === relatedId
      );
      const incoming = this.getRelationshipsTo(careerId).filter(
        (r) => r.sourceCareerId === relatedId
      );

      if (outgoing.length > 0 || incoming.length > 0) {
        result.push({ careerId: relatedId, outgoing, incoming });
      }
    }

    return result;
  }

  /**
   * Clear all relationships.
   */
  clearAll(): void {
    this.relationships.clear();
    this.adjacencyList.clear();
  }

  /**
   * Get relationship count.
   */
  getRelationshipCount(): number {
    return this.relationships.size;
  }
}

/**
 * Factory function for CareerRelationshipEngine.
 */
export function createCareerRelationshipEngine(): CareerRelationshipEngine {
  return new CareerRelationshipEngine();
}
