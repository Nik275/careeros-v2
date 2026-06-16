/**
 * Similarity Calculator
 * 
 * Core calculation engine for journey similarity across multiple dimensions.
 * Implements various similarity algorithms for different data types.
 * 
 * @module SimilarityCalculator
 */

import {
  CareerJourney,
  EducationMilestone,
  CareerPosition,
  CityTier,
  Constraint,
  ConstraintType,
  CareerDecision,
  TurningPoint,
} from '../career-journey-types';

import {
  SimilarityScore,
  SimilarityDimension,
  DimensionSimilarity,
  DimensionWeight,
  SimilarityWeights,
  StudentProfileSnapshot,
  ArchetypeProfileSnapshot,
  MotivationProfileSnapshot,
  ConstraintProfileSnapshot,
  DecisionContextSnapshot,
  DistanceResult,
  FeatureVector,
  DEFAULT_SIMILARITY_WEIGHTS,
} from './journey-similarity-types';

/**
 * Calculator for a single dimension
 */
export type DimensionCalculator = (
  student: StudentProfileSnapshot,
  journey: CareerJourney,
  context?: Record<string, unknown>
) => { score: SimilarityScore; confidence: number; details: string };

/**
 * Similarity Calculator
 * 
 * Provides methods for calculating similarity across different dimensions
 * using appropriate algorithms for each data type.
 */
export class SimilarityCalculator {
  private weights: SimilarityWeights;
  private calculators: Map<SimilarityDimension, DimensionCalculator>;

  constructor(weights: Partial<SimilarityWeights> = {}) {
    this.weights = { ...DEFAULT_SIMILARITY_WEIGHTS, ...weights };
    this.calculators = this.initializeCalculators();
  }

  /**
   * Update weights for similarity calculation
   */
  updateWeights(weights: Partial<SimilarityWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Calculate similarity across all dimensions
   */
  calculateAllDimensions(
    student: StudentProfileSnapshot,
    journey: CareerJourney,
    archetype?: ArchetypeProfileSnapshot,
    motivation?: MotivationProfileSnapshot,
    constraints?: ConstraintProfileSnapshot,
    decisionContext?: DecisionContextSnapshot
  ): DimensionSimilarity[] {
    const context = {
      archetype,
      motivation,
      constraints,
      decisionContext,
    };

    const dimensions: SimilarityDimension[] = [
      'ARCHETYPE',
      'MOTIVATION',
      'CONSTRAINT',
      'EDUCATION',
      'LOCATION',
      'CAREER_GOAL',
      'DECISION_CONTEXT',
      'STARTING_POINT',
      'PERSONALITY_TRAITS',
      'BACKGROUND',
    ];

    return dimensions
      .map(dimension => this.calculateDimension(dimension, student, journey, context))
      .filter((d): d is DimensionSimilarity => d !== null);
  }

  /**
   * Calculate similarity for a specific dimension
   */
  calculateDimension(
    dimension: SimilarityDimension,
    student: StudentProfileSnapshot,
    journey: CareerJourney,
    context?: Record<string, unknown>
  ): DimensionSimilarity | null {
    const calculator = this.calculators.get(dimension);
    if (!calculator) return null;

    const weight = this.getWeightForDimension(dimension);
    const result = calculator(student, journey, context);

    return {
      dimension,
      score: result.score,
      weight,
      weightedScore: result.score * weight,
      confidence: result.confidence,
      details: result.details,
      contributingFactors: this.extractContributingFactors(dimension, result.score, student, journey),
    };
  }

  /**
   * Calculate overall similarity score from dimension scores
   */
  calculateOverallScore(dimensions: DimensionSimilarity[]): SimilarityScore {
    if (dimensions.length === 0) return 0;

    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = dimensions.reduce((sum, d) => sum + d.weightedScore, 0);
    return weightedSum / totalWeight;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): SimilarityScore {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  /**
   * Calculate Jaccard similarity for sets
   */
  jaccardSimilarity(setA: Set<string>, setB: Set<string>): SimilarityScore {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    if (union.size === 0) return 1; // Both empty = identical
    return intersection.size / union.size;
  }

  /**
   * Calculate string similarity using normalized Levenshtein distance
   */
  stringSimilarity(strA: string, strB: string): SimilarityScore {
    if (strA === strB) return 1;
    if (strA.length === 0 || strB.length === 0) return 0;

    const distance = this.levenshteinDistance(strA.toLowerCase(), strB.toLowerCase());
    const maxLength = Math.max(strA.length, strB.length);
    return 1 - distance / maxLength;
  }

  /**
   * Calculate similarity between city tiers
   */
  cityTierSimilarity(tierA: CityTier, tierB: CityTier): SimilarityScore {
    const tierValues: Record<CityTier, number> = {
      'TIER_1': 1.0,
      'TIER_2': 0.8,
      'TIER_3': 0.6,
      'RURAL': 0.2,
    };

    const diff = Math.abs(tierValues[tierA] - tierValues[tierB]);
    return 1 - diff;
  }

  /**
   * Calculate similarity between education backgrounds
   */
  educationSimilarity(
    studentEducation: StudentProfileSnapshot['education'],
    journeyEducation: EducationMilestone[]
  ): SimilarityScore {
    if (journeyEducation.length === 0) return 0.5; // Unknown

    // Check field of study match
    const fields = journeyEducation.map(e => e.fieldOfStudy.toLowerCase());
    const studentField = studentEducation.fieldOfStudy.toLowerCase();
    
    const fieldScores = fields.map(f => this.stringSimilarity(studentField, f));
    const bestFieldScore = Math.max(...fieldScores);

    // Check level match
    const levels = journeyEducation.map(e => e.type);
    const levelScore = levels.some(l => 
      this.normalizeEducationLevel(l) === this.normalizeEducationLevel(studentEducation.currentLevel)
    ) ? 1 : 0.5;

    // Check institution tier match
    const tierScore = journeyEducation.some(e => 
      e.institutionTier === studentEducation.institutionTier
    ) ? 1 : 0.7;

    return (bestFieldScore * 0.5 + levelScore * 0.3 + tierScore * 0.2);
  }

  /**
   * Calculate similarity between constraints
   */
  constraintSimilarity(
    studentConstraints: ConstraintProfileSnapshot | undefined,
    journey: CareerJourney
  ): SimilarityScore {
    if (!studentConstraints || studentConstraints.constraints.length === 0) {
      return 0.5; // Neutral when no constraints specified
    }

    const journeyConstraints = journey.startingPoint.initialConstraints;
    
    if (journeyConstraints.length === 0) {
      // Journey had no constraints but student has some
      return 0.3; // Somewhat different
    }

    // Compare constraint types
    const studentTypes = new Set(studentConstraints.constraints.map(c => c.type));
    const journeyTypes = new Set(journeyConstraints.map(c => c.type));

    const typeSimilarity = this.jaccardSimilarity(studentTypes, journeyTypes);

    // Compare severity
    const studentHasCritical = studentConstraints.constraints.some(c => c.severity === 'CRITICAL');
    const journeyHasCritical = journeyConstraints.some(c => c.type === 'FINANCIAL'); // Financial constraints often critical

    const severityMatch = studentHasCritical === journeyHasCritical ? 1 : 0.7;

    return (typeSimilarity * 0.6 + severityMatch * 0.4);
  }

  /**
   * Calculate archetype similarity
   */
  archetypeSimilarity(
    studentArchetype: ArchetypeProfileSnapshot | undefined,
    journey: CareerJourney
  ): SimilarityScore {
    if (!studentArchetype) return 0.5;

    // Infer journey archetype from career path
    const journeyArchetype = this.inferJourneyArchetype(journey);
    
    // Check primary archetype match
    const primaryMatch = studentArchetype.primaryArchetype === journeyArchetype ? 1 : 0;

    // Check secondary archetypes
    const secondaryMatch = studentArchetype.secondaryArchetypes.includes(journeyArchetype) ? 0.8 : 0;

    // Use best match
    const bestMatch = Math.max(primaryMatch, secondaryMatch);

    // If no direct match, calculate based on archetype scores
    if (bestMatch === 0) {
      const journeyScore = studentArchetype.archetypeScores[journeyArchetype] || 0;
      return journeyScore * 0.5; // Scale down indirect matches
    }

    return bestMatch;
  }

  /**
   * Calculate motivation similarity
   */
  motivationSimilarity(
    studentMotivation: MotivationProfileSnapshot | undefined,
    journey: CareerJourney
  ): SimilarityScore {
    if (!studentMotivation) return 0.5;

    // Infer journey motivations from decisions and turning points
    const journeyMotivations = this.inferJourneyMotivations(journey);

    if (journeyMotivations.length === 0) return 0.5;

    // Compare primary motivators
    const studentMotivators = new Set(studentMotivation.primaryMotivators);
    const journeyMotivators = new Set(journeyMotivations);

    return this.jaccardSimilarity(studentMotivators, journeyMotivators);
  }

  /**
   * Calculate career goal similarity
   */
  careerGoalSimilarity(
    studentGoals: string[],
    journey: CareerJourney
  ): SimilarityScore {
    if (studentGoals.length === 0) return 0.5;

    // Extract journey's achieved goals from career history
    const journeyGoals = this.extractJourneyGoals(journey);

    if (journeyGoals.length === 0) return 0.3;

    // Calculate similarity between goal sets
    const studentGoalSet = new Set(studentGoals.map(g => g.toLowerCase()));
    const journeyGoalSet = new Set(journeyGoals.map(g => g.toLowerCase()));

    return this.jaccardSimilarity(studentGoalSet, journeyGoalSet);
  }

  /**
   * Calculate decision context similarity
   */
  decisionContextSimilarity(
    studentContext: DecisionContextSnapshot | undefined,
    journey: CareerJourney
  ): SimilarityScore {
    if (!studentContext) return 0.5;

    // Find similar decisions in journey
    const similarDecisions = journey.majorDecisions.filter(d =>
      this.decisionsAreSimilar(studentContext.currentDecision, d.decision)
    );

    if (similarDecisions.length === 0) return 0.3;

    // Calculate based on number and quality of similar decisions
    const decisionScore = Math.min(similarDecisions.length / 2, 1);

    // Check if stakes align
    const highStakesDecisions = similarDecisions.filter(d => 
      d.actualOutcome.impact === 'TRANSFORMATIONAL' || d.actualOutcome.impact === 'MAJOR'
    );
    const stakesMatch = studentContext.stakes === 'HIGH' && highStakesDecisions.length > 0 ? 1 : 0.7;

    return (decisionScore * 0.6 + stakesMatch * 0.4);
  }

  /**
   * Calculate starting point similarity
   */
  startingPointSimilarity(
    student: StudentProfileSnapshot,
    journey: CareerJourney
  ): SimilarityScore {
    let score = 0;
    let factors = 0;

    // Location tier
    score += this.cityTierSimilarity(student.location.cityTier, journey.startingPoint.location.tier);
    factors++;

    // Family background (if available)
    if (student.constraints) {
      const economicMatch = this.inferEconomicBackground(student) === 
        journey.startingPoint.economicContext.familyIncomeLevel;
      score += economicMatch ? 1 : 0.5;
      factors++;
    }

    return score / factors;
  }

  /**
   * Calculate background similarity
   */
  backgroundSimilarity(
    student: StudentProfileSnapshot,
    journey: CareerJourney
  ): SimilarityScore {
    const factors: SimilarityScore[] = [];

    // Education background
    const firstEducation = journey.educationHistory[0];
    if (firstEducation) {
      const eduSim = this.stringSimilarity(
        student.education.fieldOfStudy,
        firstEducation.fieldOfStudy
      );
      factors.push(eduSim);
    }

    // Location background
    factors.push(this.cityTierSimilarity(student.location.cityTier, journey.startingPoint.location.tier));

    // Initial constraints
    const journeyConstraints = journey.startingPoint.initialConstraints;
    if (journeyConstraints.length > 0) {
      // Check if student has similar constraints
      const hasSimilarConstraints = student.constraints?.some(sc =>
        journeyConstraints.some(jc => jc.type === this.mapConstraintType(sc))
      );
      factors.push(hasSimilarConstraints ? 0.8 : 0.4);
    }

    return factors.length > 0 
      ? factors.reduce((a, b) => a + b, 0) / factors.length 
      : 0.5;
  }

  /**
   * Generate feature vector for a profile
   */
  generateFeatureVector(
    student: StudentProfileSnapshot,
    archetype?: ArchetypeProfileSnapshot,
    motivation?: MotivationProfileSnapshot
  ): FeatureVector {
    const dimensions: Record<SimilarityDimension, number[]> = {
      ARCHETYPE: archetype ? this.archetypeToVector(archetype) : [0.5, 0.5, 0.5, 0.5],
      MOTIVATION: motivation ? this.motivationToVector(motivation) : [0.5, 0.5, 0.5],
      CONSTRAINT: this.constraintsToVector(this.constraintStringsToSnapshot(student.constraints)),
      EDUCATION: this.educationToVector(student.education),
      LOCATION: this.locationToVector(student.location),
      CAREER_GOAL: this.goalsToVector(student.careerGoals),
      DECISION_CONTEXT: [0.5, 0.5, 0.5], // Context-dependent
      STARTING_POINT: this.startingPointToVector(student),
      PERSONALITY_TRAITS: [0.5, 0.5], // Not fully implemented
      BACKGROUND: this.backgroundToVector(student),
    };

    return {
      dimensions,
      metadata: {
        normalized: true,
        version: '1.0',
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Calculate multiple distance metrics
   */
  calculateDistances(vecA: number[], vecB: number[]): DistanceResult[] {
    return [
      {
        metric: 'COSINE',
        distance: 1 - this.cosineSimilarity(vecA, vecB),
        normalized: this.cosineSimilarity(vecA, vecB),
        similarity: this.cosineSimilarity(vecA, vecB),
      },
      {
        metric: 'EUCLIDEAN',
        distance: this.euclideanDistance(vecA, vecB),
        normalized: 1 / (1 + this.euclideanDistance(vecA, vecB)),
        similarity: 1 / (1 + this.euclideanDistance(vecA, vecB)),
      },
    ];
  }

  // ============================================================================
  // PRIVATE CALCULATORS
  // ============================================================================

  private initializeCalculators(): Map<SimilarityDimension, DimensionCalculator> {
    const calculators = new Map<SimilarityDimension, DimensionCalculator>();

    calculators.set('ARCHETYPE', (s, j, ctx) => ({
      score: this.archetypeSimilarity(ctx?.archetype as ArchetypeProfileSnapshot, j),
      confidence: ctx?.archetype ? 0.85 : 0.5,
      details: 'Based on archetype alignment',
    }));

    calculators.set('MOTIVATION', (s, j, ctx) => ({
      score: this.motivationSimilarity(ctx?.motivation as MotivationProfileSnapshot, j),
      confidence: ctx?.motivation ? 0.8 : 0.5,
      details: 'Based on motivation alignment',
    }));

    calculators.set('CONSTRAINT', (s, j, ctx) => ({
      score: this.constraintSimilarity(ctx?.constraints as ConstraintProfileSnapshot, j),
      confidence: ctx?.constraints ? 0.75 : 0.5,
      details: 'Based on constraint similarity',
    }));

    calculators.set('EDUCATION', (s, j) => ({
      score: this.educationSimilarity(s.education, j.educationHistory),
      confidence: j.educationHistory.length > 0 ? 0.9 : 0.4,
      details: 'Based on education background match',
    }));

    calculators.set('LOCATION', (s, j) => ({
      score: this.cityTierSimilarity(s.location.cityTier, j.startingPoint.location.tier),
      confidence: 0.95,
      details: `Student: ${s.location.cityTier}, Journey: ${j.startingPoint.location.tier}`,
    }));

    calculators.set('CAREER_GOAL', (s, j) => ({
      score: this.careerGoalSimilarity(s.careerGoals, j),
      confidence: s.careerGoals.length > 0 ? 0.8 : 0.5,
      details: 'Based on career goal alignment',
    }));

    calculators.set('DECISION_CONTEXT', (s, j, ctx) => ({
      score: this.decisionContextSimilarity(ctx?.decisionContext as DecisionContextSnapshot, j),
      confidence: ctx?.decisionContext ? 0.75 : 0.4,
      details: 'Based on decision context similarity',
    }));

    calculators.set('STARTING_POINT', (s, j) => ({
      score: this.startingPointSimilarity(s, j),
      confidence: 0.85,
      details: 'Based on starting conditions',
    }));

    calculators.set('PERSONALITY_TRAITS', () => ({
      score: 0.5,
      confidence: 0.3,
      details: 'Personality data not available',
    }));

    calculators.set('BACKGROUND', (s, j) => ({
      score: this.backgroundSimilarity(s, j),
      confidence: 0.7,
      details: 'Based on overall background similarity',
    }));

    return calculators;
  }

  private getWeightForDimension(dimension: SimilarityDimension): DimensionWeight {
    const weightMap: Record<SimilarityDimension, keyof SimilarityWeights> = {
      'ARCHETYPE': 'archetype',
      'MOTIVATION': 'motivation',
      'CONSTRAINT': 'constraint',
      'EDUCATION': 'education',
      'LOCATION': 'location',
      'CAREER_GOAL': 'careerGoal',
      'DECISION_CONTEXT': 'decisionContext',
      'STARTING_POINT': 'startingPoint',
      'PERSONALITY_TRAITS': 'personalityTraits',
      'BACKGROUND': 'background',
    };

    return this.weights[weightMap[dimension]];
  }

  private extractContributingFactors(
    dimension: SimilarityDimension,
    score: SimilarityScore,
    student: StudentProfileSnapshot,
    journey: CareerJourney
  ): string[] {
    const factors: string[] = [];

    if (score > 0.8) {
      factors.push(`Strong ${dimension.toLowerCase()} alignment`);
    } else if (score > 0.5) {
      factors.push(`Moderate ${dimension.toLowerCase()} similarity`);
    } else {
      factors.push(`Low ${dimension.toLowerCase()} match`);
    }

    return factors;
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private euclideanDistance(vecA: number[], vecB: number[]): number {
    return Math.sqrt(vecA.reduce((sum, a, i) => sum + Math.pow(a - vecB[i], 2), 0));
  }

  private normalizeEducationLevel(level: string): string {
    const normalized = level.toLowerCase();
    if (normalized.includes('bachelor')) return 'undergraduate';
    if (normalized.includes('master')) return 'graduate';
    if (normalized.includes('phd') || normalized.includes('doctorate')) return 'doctoral';
    if (normalized.includes('diploma')) return 'diploma';
    return normalized;
  }

  private inferJourneyArchetype(journey: CareerJourney): string {
    // Simple heuristic based on career progression
    const industries = [...new Set(journey.careerHistory.map(p => p.industry))];
    const companyStages = journey.careerHistory.map(p => p.companyStage);

    if (companyStages.some(stage => stage.startsWith('STARTUP_')) || companyStages.includes('SELF_EMPLOYED')) {
      return 'FOUNDER';
    }

    if (industries.length >= 3) {
      return 'EXPLORER';
    }

    if (journey.careerHistory.some(p => p.industry === 'TECHNOLOGY')) {
      return 'TECH_SPECIALIST';
    }

    if (journey.failures.length >= 2 && journey.successes.length >= 2) {
      return 'RESILIENT_BUILDER';
    }

    return 'PROFESSIONAL';
  }

  private inferJourneyMotivations(journey: CareerJourney): string[] {
    const motivations: string[] = [];

    // Analyze decisions
    for (const decision of journey.majorDecisions) {
      if (decision.reasoning.toLowerCase().includes('growth')) motivations.push('GROWTH');
      if (decision.reasoning.toLowerCase().includes('impact')) motivations.push('IMPACT');
      if (decision.reasoning.toLowerCase().includes('money') || decision.reasoning.toLowerCase().includes('salary')) {
        motivations.push('FINANCIAL_SECURITY');
      }
      if (decision.reasoning.toLowerCase().includes('learn')) motivations.push('LEARNING');
    }

    return [...new Set(motivations)];
  }

  private extractJourneyGoals(journey: CareerJourney): string[] {
    const goals: string[] = [];

    // From career progression
    const currentRole = journey.careerHistory[journey.careerHistory.length - 1];
    if (currentRole) {
      goals.push(currentRole.title);
      goals.push(currentRole.industry);
    }

    // From decisions
    for (const decision of journey.majorDecisions) {
      if (decision.expectedOutcome.toLowerCase().includes('promotion')) goals.push('CAREER_ADVANCEMENT');
      if (decision.expectedOutcome.toLowerCase().includes('skill')) goals.push('SKILL_DEVELOPMENT');
    }

    return [...new Set(goals)];
  }

  private decisionsAreSimilar(decisionA: string, decisionB: string): boolean {
    const a = decisionA.toLowerCase();
    const b = decisionB.toLowerCase();

    // Check for common decision types
    const commonTypes = ['job', 'career', 'education', 'location', 'company', 'industry'];
    
    for (const type of commonTypes) {
      if (a.includes(type) && b.includes(type)) {
        return this.stringSimilarity(a, b) > 0.5;
      }
    }

    return this.stringSimilarity(a, b) > 0.7;
  }

  private inferEconomicBackground(student: StudentProfileSnapshot): 'LOW' | 'MIDDLE' | 'UNKNOWN' {
    // Infer from constraints
    if (student.constraints?.some(
      (constraint) =>
        this.mapConstraintType(constraint) === 'FINANCIAL' &&
        constraint.toLowerCase().includes('critical')
    )) {
      return 'LOW';
    }
    if (student.constraints?.some((constraint) => this.mapConstraintType(constraint) === 'FINANCIAL')) {
      return 'MIDDLE';
    }
    return 'UNKNOWN';
  }

  private mapConstraintType(constraintString: string): ConstraintType {
    const typeMap: Record<string, ConstraintType> = {
      'financial': 'FINANCIAL',
      'money': 'FINANCIAL',
      'location': 'GEOGRAPHIC',
      'family': 'FAMILY',
      'time': 'TIMING',
      'health': 'HEALTH',
      'education': 'EDUCATION',
    };

    const lower = constraintString.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
      if (lower.includes(key)) return value;
    }

    return 'OTHER';
  }

  // ============================================================================
  // VECTOR CONVERSION METHODS
  // ============================================================================

  private archetypeToVector(archetype: ArchetypeProfileSnapshot): number[] {
    // Encode archetype as a 4-dimensional vector
    const scores = Object.values(archetype.archetypeScores);
    if (scores.length >= 4) return scores.slice(0, 4);
    
    // Pad if necessary
    return [...scores, ...Array(4 - scores.length).fill(0.5)];
  }

  private motivationToVector(motivation: MotivationProfileSnapshot): number[] {
    // Encode motivation as a 3-dimensional vector
    const scores = Object.values(motivation.motivationScores);
    if (scores.length >= 3) return scores.slice(0, 3);
    
    return [...scores, ...Array(3 - scores.length).fill(0.5)];
  }

  private constraintsToVector(constraints: ConstraintProfileSnapshot | undefined): number[] {
    if (!constraints) return [0.5, 0.5, 0.5];
    
    const severityMap: Record<string, number> = { 'CRITICAL': 1, 'HIGH': 0.75, 'MODERATE': 0.5, 'LOW': 0.25 };
    const avgSeverity = constraints.constraints.reduce((sum, c) => sum + (severityMap[c.severity] || 0.5), 0) 
      / Math.max(constraints.constraints.length, 1);
    
    const flexibilityMap: Record<string, number> = { 'HIGH': 1, 'MEDIUM': 0.5, 'LOW': 0 };
    const flexibility = flexibilityMap[constraints.flexibilityLevel] || 0.5;
    
    return [avgSeverity, flexibility, constraints.constraints.length / 5];
  }

  private constraintStringsToSnapshot(
    constraints: string[] | undefined
  ): ConstraintProfileSnapshot | undefined {
    if (!constraints || constraints.length === 0) {
      return undefined;
    }

    return {
      constraints: constraints.map((constraint) => ({
        type: this.mapConstraintType(constraint),
        description: constraint,
        severity: 'MODERATE',
      })),
      flexibilityLevel: 'MEDIUM',
    };
  }

  private educationToVector(education: StudentProfileSnapshot['education']): number[] {
    const levelMap: Record<string, number> = {
      'high_school': 0.2,
      'undergraduate': 0.5,
      'graduate': 0.8,
      'postgraduate': 1.0,
    };
    
    const tierMap: Record<string, number> = {
      'tier_1': 1,
      'tier_2': 0.7,
      'tier_3': 0.4,
    };

    return [
      levelMap[education.currentLevel.toLowerCase().replace(' ', '_')] || 0.5,
      tierMap[education.institutionTier?.toLowerCase() || ''] || 0.5,
      0.5, // Field similarity placeholder
    ];
  }

  private locationToVector(location: StudentProfileSnapshot['location']): number[] {
    const tierMap: Record<CityTier, number> = {
      'TIER_1': 1,
      'TIER_2': 0.8,
      'TIER_3': 0.6,
      'RURAL': 0.2,
    };

    return [tierMap[location.cityTier] || 0.5, 0.5];
  }

  private goalsToVector(goals: string[]): number[] {
    // Simple encoding: number of goals normalized
    return [Math.min(goals.length / 5, 1), 0.5, 0.5];
  }

  private startingPointToVector(student: StudentProfileSnapshot): number[] {
    return this.locationToVector(student.location);
  }

  private backgroundToVector(student: StudentProfileSnapshot): number[] {
    return [
      ...this.educationToVector(student.education),
      ...this.locationToVector(student.location),
    ].slice(0, 3);
  }
}
