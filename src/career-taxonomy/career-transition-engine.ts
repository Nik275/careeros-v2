/**
 * CareerOS Career Taxonomy & Relationship System - Transition Engine
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Models career transitions, pivots, and upskilling paths.
 *
 * @module career-transition-engine
 * @version 1.0.0
 */

import type {
  CareerNodeId,
  CareerTransition,
  TransitionType,
  TransitionStep,
  TransitionQuery,
} from './career-taxonomy-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';

/**
 * Models career transitions and paths between careers.
 *
 * Calculates difficulty, required steps, prerequisites, and
 * success probabilities for career changes.
 */
export class CareerTransitionEngine {
  private transitionDatabase: Map<string, CareerTransition> = new Map();

  /**
   * Create a career transition model between two careers.
   */
  createTransition(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence
  ): CareerTransition {
    const transitionType = this.determineTransitionType(fromCareer, toCareer);
    const difficulty = this.calculateTransitionDifficulty(fromCareer, toCareer, transitionType);
    const requiredSteps = this.generateTransitionSteps(fromCareer, toCareer, transitionType);
    const prerequisites = this.identifyPrerequisites(fromCareer, toCareer);
    const estimatedTime = this.estimateTransitionTime(requiredSteps);
    const successRate = this.estimateSuccessRate(difficulty, fromCareer, toCareer);

    const transition: CareerTransition = {
      id: `${fromCareer.careerId}-${toCareer.careerId}`,
      fromCareerId: fromCareer.careerId,
      toCareerId: toCareer.careerId,
      transitionType,
      difficulty,
      estimatedTimeMonths: estimatedTime,
      requiredSteps,
      prerequisites,
      successRate,
      confidence: this.calculateTransitionConfidence(fromCareer, toCareer),
    };

    this.transitionDatabase.set(transition.id, transition);
    return transition;
  }

  /**
   * Determine the type of transition between careers.
   */
  private determineTransitionType(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence
  ): TransitionType {
    const fromCognitive = fromCareer.cognitiveDemands;
    const toCognitive = toCareer.cognitiveDemands;
    const fromEnv = fromCareer.workEnvironment;
    const toEnv = toCareer.workEnvironment;

    // Check for advancement (higher demands)
    const avgFromDemand = this.averageCognitiveDemand(fromCognitive);
    const avgToDemand = this.averageCognitiveDemand(toCognitive);

    if (avgToDemand > avgFromDemand + 15) {
      return 'ADVANCEMENT';
    }

    // Check for specialization (similar base, deeper in one area)
    if (this.isSpecialization(fromCareer, toCareer)) {
      return 'SPECIALIZATION';
    }

    // Check for generalization (broader scope)
    if (this.isGeneralization(fromCareer, toCareer)) {
      return 'GENERALIZATION';
    }

    // Check for lateral move (similar demands, different domain)
    if (Math.abs(avgToDemand - avgFromDemand) < 15) {
      return 'LATERAL';
    }

    // Check for alternative (similar profile, different path)
    if (this.isAlternativePath(fromCareer, toCareer)) {
      return 'ALTERNATIVE';
    }

    // Default to pivot
    return 'PIVOT';
  }

  /**
   * Calculate transition difficulty score.
   */
  private calculateTransitionDifficulty(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence,
    transitionType: TransitionType
  ): number {
    let difficulty = 0;

    // Cognitive gap difficulty
    const cognitiveGap = this.calculateCognitiveGap(fromCareer, toCareer);
    difficulty += cognitiveGap * 0.3;

    // Education barrier difficulty
    const educationGap = toCareer.careerRisks.educationBarrier.score - fromCareer.careerRisks.educationBarrier.score;
    difficulty += Math.max(0, educationGap) * 0.25;

    // Risk adjustment
    difficulty += (toCareer.careerRisks.competitionRisk.score - fromCareer.careerRisks.competitionRisk.score) * 0.15;

    // Type adjustment
    const typeMultipliers: Record<TransitionType, number> = {
      ADVANCEMENT: 1.2,
      SPECIALIZATION: 0.9,
      GENERALIZATION: 0.8,
      LATERAL: 0.7,
      ALTERNATIVE: 0.8,
      PIVOT: 1.3,
      UPSKILL: 0.6,
    };
    difficulty *= typeMultipliers[transitionType] ?? 1.0;

    return Math.min(100, Math.round(difficulty));
  }

  /**
   * Generate required steps for transition.
   */
  private generateTransitionSteps(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence,
    transitionType: TransitionType
  ): TransitionStep[] {
    const steps: TransitionStep[] = [];
    let order = 1;

    // Skill gap steps
    const skillGaps = this.identifySkillGaps(fromCareer, toCareer);
    for (const gap of skillGaps.slice(0, 3)) {
      steps.push({
        order: order++,
        description: `Develop ${gap} skills`,
        type: 'SKILL',
        estimatedTimeMonths: 3,
        difficulty: 50,
      });
    }

    // Education requirement
    if (toCareer.careerRisks.educationBarrier.score > fromCareer.careerRisks.educationBarrier.score + 20) {
      steps.push({
        order: order++,
        description: 'Complete required education or certification',
        type: 'EDUCATION',
        estimatedTimeMonths: 12,
        difficulty: 70,
      });
    }

    // Certification requirements
    if (toCareer.careerRisks.educationBarrier.score >= 60) {
      steps.push({
        order: order++,
        description: 'Obtain professional certification',
        type: 'CERTIFICATION',
        estimatedTimeMonths: 6,
        difficulty: 60,
      });
    }

    // Experience requirement
    if (toCareer.metadata.experienceLevel !== fromCareer.metadata.experienceLevel) {
      steps.push({
        order: order++,
        description: `Gain ${toCareer.metadata.experienceLevel.toLowerCase()}-level experience`,
        type: 'EXPERIENCE',
        estimatedTimeMonths: 24,
        difficulty: 50,
      });
    }

    // Networking
    steps.push({
      order: order++,
      description: 'Build professional network in target field',
      type: 'NETWORK',
      estimatedTimeMonths: 6,
      difficulty: 40,
    });

    return steps;
  }

  /**
   * Identify prerequisites for transition.
   */
  private identifyPrerequisites(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence
  ): string[] {
    const prerequisites: string[] = [];

    // Education prerequisites
    if (toCareer.metadata.educationLevel === 'DOCTORAL' || toCareer.metadata.educationLevel === 'PROFESSIONAL') {
      prerequisites.push(`Advanced degree (${toCareer.metadata.educationLevel})`);
    }

    // Skill prerequisites
    const toCognitive = toCareer.cognitiveDemands;
    if (toCognitive.analyticalDemand.score >= 70) {
      prerequisites.push('Strong analytical skills');
    }
    if (toCognitive.creativeDemand.score >= 70) {
      prerequisites.push('Creative problem-solving ability');
    }

    // Risk prerequisites
    if (toCareer.careerRisks.automationRisk.score >= 60) {
      prerequisites.push('Adaptability to technological change');
    }

    // Lifestyle prerequisites
    if (toCareer.lifestyleCharacteristics.workLifeBalance.score <= 40) {
      prerequisites.push('Willingness to accept demanding schedule');
    }

    return prerequisites;
  }

  /**
   * Estimate total transition time.
   */
  private estimateTransitionTime(steps: TransitionStep[]): number {
    return steps.reduce((sum, step) => sum + step.estimatedTimeMonths, 0);
  }

  /**
   * Estimate success rate for transition.
   */
  private estimateSuccessRate(
    difficulty: number,
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence
  ): number {
    // Base success rate inversely related to difficulty
    let successRate = Math.max(20, 100 - difficulty);

    // Adjust for transferability
    successRate += (toCareer.careerAdvantages.transferability.score - 50) * 0.2;

    // Adjust for optionality
    successRate += (fromCareer.careerAdvantages.optionality.score - 50) * 0.1;

    return Math.min(95, Math.round(successRate));
  }

  /**
   * Calculate confidence in transition assessment.
   */
  private calculateTransitionConfidence(
    fromCareer: CareerIntelligence,
    toCareer: CareerIntelligence
  ): number {
    const avgConfidence = (fromCareer.evidence.overallConfidence + toCareer.evidence.overallConfidence) / 2;
    return Math.round(avgConfidence);
  }

  /**
   * Check if transition is a specialization.
   */
  private isSpecialization(from: CareerIntelligence, to: CareerIntelligence): boolean {
    // Specialization: similar base, one dimension significantly higher
    const fromCognitive = this.averageCognitiveDemand(from.cognitiveDemands);
    const toCognitive = this.averageCognitiveDemand(to.cognitiveDemands);

    // Cognitive demands similar but one area much higher
    const maxFromDim = Math.max(
      from.cognitiveDemands.analyticalDemand.score,
      from.cognitiveDemands.creativeDemand.score
    );
    const maxToDim = Math.max(
      to.cognitiveDemands.analyticalDemand.score,
      to.cognitiveDemands.creativeDemand.score
    );

    return Math.abs(toCognitive - fromCognitive) < 10 && maxToDim > maxFromDim + 20;
  }

  /**
   * Check if transition is a generalization.
   */
  private isGeneralization(from: CareerIntelligence, to: CareerIntelligence): boolean {
    // Generalization: broader scope, lower specific demands
    const fromEnv = from.workEnvironment;
    const toEnv = to.workEnvironment;

    // Moving to higher independence + broader scope
    return toEnv.independenceLevel.score > fromEnv.independenceLevel.score + 20 &&
           to.careerAdvantages.optionality.score > from.careerAdvantages.optionality.score + 15;
  }

  /**
   * Check if transition is an alternative path.
   */
  private isAlternativePath(from: CareerIntelligence, to: CareerIntelligence): boolean {
    // Alternative: similar overall profile, different domain
    const lifestyleSim = Math.abs(from.lifestyleCharacteristics.incomePotential.score - to.lifestyleCharacteristics.incomePotential.score) < 20;
    const motivationSim = Math.abs(from.motivationalDemands.achievementDemand.score - to.motivationalDemands.achievementDemand.score) < 20;

    return lifestyleSim && motivationSim && from.metadata.category !== to.metadata.category;
  }

  /**
   * Calculate cognitive gap between careers.
   */
  private calculateCognitiveGap(from: CareerIntelligence, to: CareerIntelligence): number {
    const gaps = [
      Math.abs(to.cognitiveDemands.analyticalDemand.score - from.cognitiveDemands.analyticalDemand.score),
      Math.abs(to.cognitiveDemands.creativeDemand.score - from.cognitiveDemands.creativeDemand.score),
      Math.abs(to.cognitiveDemands.systematicDemand.score - from.cognitiveDemands.systematicDemand.score),
    ];

    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }

  /**
   * Identify skill gaps between careers.
   */
  private identifySkillGaps(from: CareerIntelligence, to: CareerIntelligence): string[] {
    const gaps: string[] = [];

    if (to.cognitiveDemands.analyticalDemand.score > from.cognitiveDemands.analyticalDemand.score + 15) {
      gaps.push('analytical');
    }
    if (to.cognitiveDemands.creativeDemand.score > from.cognitiveDemands.creativeDemand.score + 15) {
      gaps.push('creative');
    }
    if (to.cognitiveDemands.systematicDemand.score > from.cognitiveDemands.systematicDemand.score + 15) {
      gaps.push('systematic');
    }
    if (to.cognitiveDemands.verbalDemand.score > from.cognitiveDemands.verbalDemand.score + 15) {
      gaps.push('communication');
    }

    return gaps;
  }

  /**
   * Calculate average cognitive demand.
   */
  private averageCognitiveDemand(cognitive: CareerIntelligence['cognitiveDemands']): number {
    return Math.round(
      (cognitive.analyticalDemand.score +
        cognitive.creativeDemand.score +
        cognitive.systematicDemand.score) / 3
    );
  }

  /**
   * Get transition by ID.
   */
  getTransition(transitionId: string): CareerTransition | undefined {
    return this.transitionDatabase.get(transitionId);
  }

  /**
   * Query transitions.
   */
  queryTransitions(query: TransitionQuery): CareerTransition[] {
    let transitions = Array.from(this.transitionDatabase.values());

    if (query.fromCareerId) {
      transitions = transitions.filter((t) => t.fromCareerId === query.fromCareerId);
    }

    if (query.toCareerId) {
      transitions = transitions.filter((t) => t.toCareerId === query.toCareerId);
    }

    if (query.maxDifficulty !== undefined) {
      transitions = transitions.filter((t) => t.difficulty <= query.maxDifficulty!);
    }

    if (query.maxTimeMonths !== undefined) {
      transitions = transitions.filter((t) => t.estimatedTimeMonths <= query.maxTimeMonths!);
    }

    if (query.transitionTypes && query.transitionTypes.length > 0) {
      transitions = transitions.filter((t) => query.transitionTypes!.includes(t.transitionType));
    }

    return transitions;
  }

  /**
   * Get all transitions from a career.
   */
  getTransitionsFrom(careerId: CareerNodeId): CareerTransition[] {
    return Array.from(this.transitionDatabase.values()).filter(
      (t) => t.fromCareerId === careerId
    );
  }

  /**
   * Get all transitions to a career.
   */
  getTransitionsTo(careerId: CareerNodeId): CareerTransition[] {
    return Array.from(this.transitionDatabase.values()).filter(
      (t) => t.toCareerId === careerId
    );
  }

  /**
   * Find easiest transitions from a career.
   */
  findEasiestTransitions(
    fromCareerId: CareerNodeId,
    limit: number = 5
  ): CareerTransition[] {
    return this.getTransitionsFrom(fromCareerId)
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, limit);
  }

  /**
   * Find fastest transitions from a career.
   */
  findFastestTransitions(
    fromCareerId: CareerNodeId,
    limit: number = 5
  ): CareerTransition[] {
    return this.getTransitionsFrom(fromCareerId)
      .sort((a, b) => a.estimatedTimeMonths - b.estimatedTimeMonths)
      .slice(0, limit);
  }

  /**
   * Get transition count.
   */
  getTransitionCount(): number {
    return this.transitionDatabase.size;
  }
}

/**
 * Factory function for CareerTransitionEngine.
 */
export function createCareerTransitionEngine(): CareerTransitionEngine {
  return new CareerTransitionEngine();
}
