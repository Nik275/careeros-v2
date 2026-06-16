/**
 * StudentBelief Model
 * 
 * This is the CENTRAL SOURCE OF TRUTH for the entire CareerOS Intelligence System.
 * 
 * Architecture Principle:
 *   Assessment answers NEVER directly generate recommendations.
 *   Instead: Assessment Answers → StudentBelief → Future Engines
 * 
 * The StudentBelief model:
 *   1. Captures all beliefs about a student (motivations, strengths, values, etc.)
 *   2. Tracks confidence and evidence for each belief
 *   3. Supports versioning for belief evolution tracking
 *   4. Provides a clean API for engines to query beliefs
 *   5. Enables explainability (why do we believe this?)
 * 
 * All intelligence engines read from StudentBelief. No engine should access
 * raw assessment data directly. This creates a clean separation between
 * data collection and intelligence generation.
 */

import {
  StudentBelief,
  Motivation,
  Strength,
  Value,
  PersonalityTrait,
  LifestylePreference,
  Constraint,
  Evidence,
  EvidenceSource,
  ConfidenceScore,
  BeliefTimestamp,
  EntityId,
  StrengthCategory,
  PersonalityDimension,
  LifestyleCategory,
  ConstraintType,
} from '../types';

/**
 * AssessmentAnswer represents a raw answer from the assessment flow.
 * This is the input to the StudentBelief builder.
 */
export interface AssessmentAnswer {
  /** Question identifier */
  questionId: string;
  
  /** Category of question (motivations, strengths, etc.) */
  category: string;
  
  /** Selected option IDs */
  selectedOptions: string[];
  
  /** Timestamp when answered */
  answeredAt: BeliefTimestamp;
  
  /** Time spent on this question (milliseconds) */
  timeSpent: number;
}

/**
 * StudentBeliefBuilder creates and updates StudentBelief instances.
 * 
 * Usage:
 *   const builder = new StudentBeliefBuilder(studentId);
 *   builder.addAssessmentAnswers(answers);
 *   const belief = builder.build();
 */
export class StudentBeliefBuilder {
  private studentId: EntityId;
  private motivations: Map<EntityId, Motivation> = new Map();
  private strengths: Map<EntityId, Strength> = new Map();
  private values: Map<EntityId, Value> = new Map();
  private personalityTraits: Map<EntityId, PersonalityTrait> = new Map();
  private lifestylePreferences: Map<EntityId, LifestylePreference> = new Map();
  private constraints: Map<EntityId, Constraint> = new Map();
  private evidence: Map<string, Evidence[]> = new Map();
  private assessmentQuestionCount: number = 0;
  private inferenceStepCount: number = 0;
  private contributingEngines: Set<string> = new Set();
  private assessmentStartTime: BeliefTimestamp = 0;
  private assessmentEndTime: BeliefTimestamp = 0;
  private previousBeliefId?: EntityId;
  private version: number = 1;

  constructor(studentId: EntityId, previousBelief?: StudentBelief) {
    this.studentId = studentId;
    
    if (previousBelief) {
      // Copy previous beliefs if updating
      this.previousBeliefId = previousBelief.id;
      this.version = previousBelief.version + 1;
      
      // Copy all previous beliefs
      previousBelief.motivations.forEach(m => this.motivations.set(m.id, m));
      previousBelief.strengths.forEach(s => this.strengths.set(s.id, s));
      previousBelief.values.forEach(v => this.values.set(v.id, v));
      previousBelief.personalityTraits.forEach(p => this.personalityTraits.set(p.id, p));
      previousBelief.lifestylePreferences.forEach(l => this.lifestylePreferences.set(l.id, l));
      previousBelief.constraints.forEach(c => this.constraints.set(c.id, c));
    }
  }

  /**
   * Add assessment answers to build beliefs.
   * This is the primary entry point for creating beliefs from assessment data.
   */
  addAssessmentAnswers(answers: AssessmentAnswer[]): this {
    this.assessmentQuestionCount = answers.length;
    
    if (answers.length > 0) {
      this.assessmentStartTime = Math.min(...answers.map(a => a.answeredAt));
      this.assessmentEndTime = Math.max(...answers.map(a => a.answeredAt + a.timeSpent));
    }

    for (const answer of answers) {
      this.processAnswer(answer);
    }

    this.contributingEngines.add('assessment');
    return this;
  }

  /**
   * Add a motivation belief directly.
   * Used by inference engines to add derived beliefs.
   */
  addMotivation(motivation: Motivation): this {
    this.motivations.set(motivation.id, motivation);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Add a strength belief directly.
   */
  addStrength(strength: Strength): this {
    this.strengths.set(strength.id, strength);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Add a value belief directly.
   */
  addValue(value: Value): this {
    this.values.set(value.id, value);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Add a personality trait belief directly.
   */
  addPersonalityTrait(trait: PersonalityTrait): this {
    this.personalityTraits.set(trait.id, trait);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Add a lifestyle preference belief directly.
   */
  addLifestylePreference(preference: LifestylePreference): this {
    this.lifestylePreferences.set(preference.id, preference);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Add a constraint belief directly.
   */
  addConstraint(constraint: Constraint): this {
    this.constraints.set(constraint.id, constraint);
    this.inferenceStepCount++;
    return this;
  }

  /**
   * Mark an engine as contributing to this belief.
   */
  markEngineContribution(engineName: string): this {
    this.contributingEngines.add(engineName);
    return this;
  }

  /**
   * Build the final StudentBelief instance.
   */
  build(): StudentBelief {
    const belief: StudentBelief = {
      id: this.generateBeliefId(),
      studentId: this.studentId,
      version: this.version,
      timestamp: Date.now(),
      motivations: Array.from(this.motivations.values()),
      strengths: Array.from(this.strengths.values()),
      values: Array.from(this.values.values()),
      personalityTraits: Array.from(this.personalityTraits.values()),
      lifestylePreferences: Array.from(this.lifestylePreferences.values()),
      constraints: Array.from(this.constraints.values()),
      overallConfidence: this.calculateOverallConfidence(),
      isValidated: false,
      previousVersionId: this.previousBeliefId,
      metadata: {
        assessmentQuestionCount: this.assessmentQuestionCount,
        inferenceStepCount: this.inferenceStepCount,
        contributingEngines: Array.from(this.contributingEngines),
        assessmentDuration: this.assessmentEndTime - this.assessmentStartTime,
      },
    };

    return belief;
  }

  /**
   * Process a single assessment answer and create/update beliefs.
   */
  private processAnswer(answer: AssessmentAnswer): void {
    switch (answer.category) {
      case 'motivations':
        this.processMotivationAnswer(answer);
        break;
      case 'strengths':
        this.processStrengthAnswer(answer);
        break;
      case 'personality':
        this.processPersonalityAnswer(answer);
        break;
      case 'values':
        this.processValuesAnswer(answer);
        break;
      case 'lifestyle':
        this.processLifestyleAnswer(answer);
        break;
      default:
        console.warn('Unknown assessment category received safely.');
    }
  }

  /**
   * Process a motivation-related answer.
   */
  private processMotivationAnswer(answer: AssessmentAnswer): void {
    for (const optionId of answer.selectedOptions) {
      const motivation = this.createMotivationFromOption(optionId, answer);
      this.motivations.set(motivation.id, motivation);
    }
  }

  /**
   * Process a strength-related answer.
   */
  private processStrengthAnswer(answer: AssessmentAnswer): void {
    for (const optionId of answer.selectedOptions) {
      const strength = this.createStrengthFromOption(optionId, answer);
      this.strengths.set(strength.id, strength);
    }
  }

  /**
   * Process a personality-related answer.
   */
  private processPersonalityAnswer(answer: AssessmentAnswer): void {
    // Personality answers typically select one option
    if (answer.selectedOptions.length > 0) {
      const optionId = answer.selectedOptions[0];
      const trait = this.createPersonalityTraitFromOption(optionId, answer);
      this.personalityTraits.set(trait.id, trait);
    }
  }

  /**
   * Process a values-related answer.
   */
  private processValuesAnswer(answer: AssessmentAnswer): void {
    for (const optionId of answer.selectedOptions) {
      const value = this.createValueFromOption(optionId, answer);
      this.values.set(value.id, value);
    }
  }

  /**
   * Process a lifestyle-related answer.
   */
  private processLifestyleAnswer(answer: AssessmentAnswer): void {
    // Lifestyle answers typically select one option
    if (answer.selectedOptions.length > 0) {
      const optionId = answer.selectedOptions[0];
      const preference = this.createLifestylePreferenceFromOption(optionId, answer);
      this.lifestylePreferences.set(preference.id, preference);
    }
  }

  /**
   * Create a Motivation from an assessment option.
   * In production, this would map option IDs to motivation definitions.
   */
  private createMotivationFromOption(
    optionId: string,
    answer: AssessmentAnswer
  ): Motivation {
    // Map option IDs to motivation definitions
    const motivationMap: Record<string, { name: string; description: string }> = {
      creativity: {
        name: 'Creative Expression',
        description: 'Building, designing, or making things that didn\'t exist before',
      },
      impact: {
        name: 'Making a Difference',
        description: 'Helping people, solving problems, or improving lives',
      },
      mastery: {
        name: 'Becoming Excellent',
        description: 'Deep expertise, continuous learning, and skill development',
      },
      independence: {
        name: 'Freedom & Autonomy',
        description: 'Controlling your time, decisions, and work environment',
      },
      security: {
        name: 'Stability & Security',
        description: 'Predictable income, clear path, and reduced uncertainty',
      },
      recognition: {
        name: 'Recognition & Status',
        description: 'Being acknowledged for your work and achievements',
      },
    };

    const definition = motivationMap[optionId] || {
      name: optionId,
      description: 'Custom motivation',
    };

    const evidence: Evidence = {
      id: `evidence_${answer.questionId}_${optionId}`,
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ questionId: answer.questionId, optionId }),
      timestamp: answer.answeredAt,
      confidence: 0.85, // Direct assessment has high confidence
      explanation: `Student explicitly selected "${definition.name}" in assessment`,
    };

    return {
      id: `motivation_${optionId}`,
      name: definition.name,
      description: definition.description,
      strength: 0.75, // Default strength for direct selection
      evidence: [evidence],
      isExplicit: true,
    };
  }

  /**
   * Create a Strength from an assessment option.
   */
  private createStrengthFromOption(
    optionId: string,
    answer: AssessmentAnswer
  ): Strength {
    const strengthMap: Record<string, { name: string; category: StrengthCategory; description: string }> = {
      analytical: {
        name: 'Analytical Thinking',
        category: StrengthCategory.COGNITIVE,
        description: 'Breaking down complex problems and finding logical solutions',
      },
      creative: {
        name: 'Creative Thinking',
        category: StrengthCategory.CREATIVE,
        description: 'Generating new ideas, seeing patterns, and thinking outside the box',
      },
      social: {
        name: 'Connecting with People',
        category: StrengthCategory.SOCIAL,
        description: 'Understanding others, building relationships, and communicating',
      },
      practical: {
        name: 'Hands-on Execution',
        category: StrengthCategory.PRACTICAL,
        description: 'Building, fixing, or creating tangible things',
      },
      organizing: {
        name: 'Organizing & Planning',
        category: StrengthCategory.ORGANIZATIONAL,
        description: 'Structuring information, managing details, and coordinating',
      },
      leading: {
        name: 'Leading & Motivating',
        category: StrengthCategory.SOCIAL,
        description: 'Inspiring others, making decisions, and driving action',
      },
    };

    const definition = strengthMap[optionId] || {
      name: optionId,
      category: StrengthCategory.COGNITIVE,
      description: 'Custom strength',
    };

    const evidence: Evidence = {
      id: `evidence_${answer.questionId}_${optionId}`,
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ questionId: answer.questionId, optionId }),
      timestamp: answer.answeredAt,
      confidence: 0.8,
      explanation: `Student identified "${definition.name}" as a strength`,
    };

    return {
      id: `strength_${optionId}`,
      name: definition.name,
      category: definition.category,
      description: definition.description,
      level: 0.7, // Default level for self-reported strength
      evidence: [evidence],
      isSelfReported: true,
    };
  }

  /**
   * Create a PersonalityTrait from an assessment option.
   */
  private createPersonalityTraitFromOption(
    optionId: string,
    answer: AssessmentAnswer
  ): PersonalityTrait {
    // Map work style preferences to personality dimensions
    const traitMap: Record<string, { name: string; dimension: PersonalityDimension; position: number }> = {
      structured: {
        name: 'Structured & Organized',
        dimension: PersonalityDimension.CONSCIENTIOUSNESS,
        position: 0.7,
      },
      flexible: {
        name: 'Flexible & Adaptive',
        dimension: PersonalityDimension.CONSCIENTIOUSNESS,
        position: -0.5,
      },
      collaborative: {
        name: 'Collaborative & Social',
        dimension: PersonalityDimension.EXTRAVERSION,
        position: 0.6,
      },
      independent: {
        name: 'Independent & Focused',
        dimension: PersonalityDimension.EXTRAVERSION,
        position: -0.4,
      },
    };

    const definition = traitMap[optionId] || {
      name: optionId,
      dimension: PersonalityDimension.OPENNESS,
      position: 0,
    };

    const evidence: Evidence = {
      id: `evidence_${answer.questionId}_${optionId}`,
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ questionId: answer.questionId, optionId }),
      timestamp: answer.answeredAt,
      confidence: 0.75,
      explanation: `Student prefers "${definition.name}" work style`,
    };

    return {
      id: `trait_${optionId}`,
      name: definition.name,
      dimension: definition.dimension,
      position: definition.position,
      confidence: 0.75,
      evidence: [evidence],
    };
  }

  /**
   * Create a Value from an assessment option.
   */
  private createValueFromOption(
    optionId: string,
    answer: AssessmentAnswer
  ): Value {
    const valueMap: Record<string, { name: string; description: string; isNonNegotiable: boolean }> = {
      worklife: {
        name: 'Work-Life Balance',
        description: 'Time for family, hobbies, and personal life',
        isNonNegotiable: false,
      },
      growth: {
        name: 'Continuous Growth',
        description: 'Always learning, evolving, and being challenged',
        isNonNegotiable: false,
      },
      purpose: {
        name: 'Purpose & Meaning',
        description: 'Work that aligns with your values and makes a difference',
        isNonNegotiable: true,
      },
      financial: {
        name: 'Financial Success',
        description: 'High earning potential and building wealth',
        isNonNegotiable: false,
      },
      creativity: {
        name: 'Creative Expression',
        description: 'Freedom to express yourself and be original',
        isNonNegotiable: false,
      },
      stability: {
        name: 'Job Security',
        description: 'Long-term stability and predictable career path',
        isNonNegotiable: false,
      },
    };

    const definition = valueMap[optionId] || {
      name: optionId,
      description: 'Custom value',
      isNonNegotiable: false,
    };

    const evidence: Evidence = {
      id: `evidence_${answer.questionId}_${optionId}`,
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ questionId: answer.questionId, optionId }),
      timestamp: answer.answeredAt,
      confidence: 0.9, // Values are usually strongly held
      explanation: `Student identified "${definition.name}" as important`,
    };

    return {
      id: `value_${optionId}`,
      name: definition.name,
      description: definition.description,
      importance: 0.85,
      evidence: [evidence],
      isNonNegotiable: definition.isNonNegotiable,
    };
  }

  /**
   * Create a LifestylePreference from an assessment option.
   */
  private createLifestylePreferenceFromOption(
    optionId: string,
    answer: AssessmentAnswer
  ): LifestylePreference {
    const preferenceMap: Record<string, { name: string; category: LifestyleCategory; preference: string }> = {
      office: {
        name: 'Office Environment',
        category: LifestyleCategory.WORK_ENVIRONMENT,
        preference: 'Office & team environment',
      },
      remote: {
        name: 'Remote Work',
        category: LifestyleCategory.WORK_ENVIRONMENT,
        preference: 'Remote & flexible',
      },
      field: {
        name: 'Field Work',
        category: LifestyleCategory.WORK_ENVIRONMENT,
        preference: 'On-site & active',
      },
      hybrid: {
        name: 'Hybrid Work',
        category: LifestyleCategory.WORK_ENVIRONMENT,
        preference: 'Mix of everything',
      },
    };

    const definition = preferenceMap[optionId] || {
      name: optionId,
      category: LifestyleCategory.WORK_ENVIRONMENT,
      preference: optionId,
    };

    const evidence: Evidence = {
      id: `evidence_${answer.questionId}_${optionId}`,
      source: EvidenceSource.DIRECT_ASSESSMENT,
      rawData: JSON.stringify({ questionId: answer.questionId, optionId }),
      timestamp: answer.answeredAt,
      confidence: 0.8,
      explanation: `Student prefers "${definition.preference}"`,
    };

    return {
      id: `lifestyle_${optionId}`,
      name: definition.name,
      category: definition.category,
      description: `Preferred work environment: ${definition.preference}`,
      preference: definition.preference,
      importance: 0.75,
      evidence: [evidence],
    };
  }

  /**
   * Calculate overall confidence in the belief model.
   */
  private calculateOverallConfidence(): ConfidenceScore {
    const allConfidences: number[] = [];

    // Collect all confidence scores
    this.motivations.forEach(m => {
      m.evidence.forEach(e => allConfidences.push(e.confidence));
    });
    this.strengths.forEach(s => {
      s.evidence.forEach(e => allConfidences.push(e.confidence));
    });
    this.values.forEach(v => {
      v.evidence.forEach(e => allConfidences.push(e.confidence));
    });
    this.personalityTraits.forEach(p => {
      p.evidence.forEach(e => allConfidences.push(e.confidence));
    });
    this.lifestylePreferences.forEach(l => {
      l.evidence.forEach(e => allConfidences.push(e.confidence));
    });

    if (allConfidences.length === 0) {
      return 0;
    }

    // Average confidence weighted by number of evidence items
    const sum = allConfidences.reduce((a, b) => a + b, 0);
    return sum / allConfidences.length;
  }

  /**
   * Generate a unique ID for this belief snapshot.
   */
  private generateBeliefId(): EntityId {
    return `belief_${this.studentId}_v${this.version}_${Date.now()}`;
  }
}

/**
 * StudentBeliefQuery provides read-only access to StudentBelief.
 * 
 * All engines should use this to query beliefs rather than accessing
 * the raw StudentBelief object directly. This enables:
 *   1. Query optimization
 *   2. Caching
 *   3. Access control
 *   4. Query logging for debugging
 */
export class StudentBeliefQuery {
  constructor(private belief: StudentBelief) {}

  /**
   * Get all motivations.
   */
  getMotivations(): Motivation[] {
    return this.belief.motivations;
  }

  /**
   * Get motivations above a certain strength threshold.
   */
  getStrongMotivations(threshold: number = 0.6): Motivation[] {
    return this.belief.motivations.filter(m => m.strength >= threshold);
  }

  /**
   * Get all strengths.
   */
  getStrengths(): Strength[] {
    return this.belief.strengths;
  }

  /**
   * Get strengths by category.
   */
  getStrengthsByCategory(category: StrengthCategory): Strength[] {
    return this.belief.strengths.filter(s => s.category === category);
  }

  /**
   * Get all values.
   */
  getValues(): Value[] {
    return this.belief.values;
  }

  /**
   * Get non-negotiable values.
   */
  getNonNegotiableValues(): Value[] {
    return this.belief.values.filter(v => v.isNonNegotiable);
  }

  /**
   * Get all personality traits.
   */
  getPersonalityTraits(): PersonalityTrait[] {
    return this.belief.personalityTraits;
  }

  /**
   * Get trait by dimension.
   */
  getTraitByDimension(dimension: PersonalityDimension): PersonalityTrait | undefined {
    return this.belief.personalityTraits.find(t => t.dimension === dimension);
  }

  /**
   * Get all lifestyle preferences.
   */
  getLifestylePreferences(): LifestylePreference[] {
    return this.belief.lifestylePreferences;
  }

  /**
   * Get preferences by category.
   */
  getPreferencesByCategory(category: LifestyleCategory): LifestylePreference[] {
    return this.belief.lifestylePreferences.filter(p => p.category === category);
  }

  /**
   * Get all constraints.
   */
  getConstraints(): Constraint[] {
    return this.belief.constraints;
  }

  /**
   * Get hard constraints only.
   */
  getHardConstraints(): Constraint[] {
    return this.belief.constraints.filter(c => c.isHardConstraint);
  }

  /**
   * Get overall confidence.
   */
  getOverallConfidence(): ConfidenceScore {
    return this.belief.overallConfidence;
  }

  /**
   * Check if belief is validated.
   */
  isValidated(): boolean {
    return this.belief.isValidated;
  }

  /**
   * Get belief metadata.
   */
  getMetadata(): StudentBelief['metadata'] {
    return this.belief.metadata;
  }

  /**
   * Get the raw belief (for advanced use cases).
   */
  getRawBelief(): StudentBelief {
    return this.belief;
  }
}

/**
 * Create a StudentBelief from assessment answers.
 * This is the main entry point for building beliefs from assessment data.
 */
export function createStudentBeliefFromAssessment(
  studentId: EntityId,
  answers: AssessmentAnswer[],
  previousBelief?: StudentBelief
): StudentBelief {
  const builder = new StudentBeliefBuilder(studentId, previousBelief);
  return builder.addAssessmentAnswers(answers).build();
}

/**
 * Create a query interface for a StudentBelief.
 */
export function queryStudentBelief(belief: StudentBelief): StudentBeliefQuery {
  return new StudentBeliefQuery(belief);
}
