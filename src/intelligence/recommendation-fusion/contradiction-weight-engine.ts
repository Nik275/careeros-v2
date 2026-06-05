/**
 * Contradiction Weight Engine
 *
 * Detects and resolves conflicts:
 * - student values conflict
 * - goals conflict
 * - identity conflicts
 * - family pressure
 */

import {
  ContradictionWeight,
  FusionTimestamp,
  Weight,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ContradictionConfig {
  // Severity thresholds
  highSeverityThreshold: Weight;
  mediumSeverityThreshold: Weight;

  // Adjustment factors
  highSeverityAdjustment: number;
  mediumSeverityAdjustment: number;
  lowSeverityAdjustment: number;

  // Family pressure
  familyPressureAdjustment: number;

  // Resolution preferences
  prioritizeStudentValues: boolean;
  balanceGoals: boolean;
  flagIdentityConflicts: boolean;
}

export const DEFAULT_CONTRADICTION_CONFIG: ContradictionConfig = {
  highSeverityThreshold: 0.7,
  mediumSeverityThreshold: 0.4,

  highSeverityAdjustment: 0.7,
  mediumSeverityAdjustment: 0.85,
  lowSeverityAdjustment: 0.95,

  familyPressureAdjustment: 0.9,

  prioritizeStudentValues: true,
  balanceGoals: true,
  flagIdentityConflicts: true,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface ValueConflict {
  value1: string;
  value2: string;
  severity: Weight;
  context: string;
}

export interface GoalConflict {
  goal1: string;
  goal2: string;
  severity: Weight;
  timeframe: 'short' | 'medium' | 'long';
}

export interface IdentityConflict {
  aspect1: string;
  aspect2: string;
  severity: Weight;
  description: string;
}

export interface FamilyPressure {
  detected: boolean;
  severity: Weight;
  source: string[];
  expectation: string;
  studentDesire: string;
}

export interface ContradictionInput {
  valueConflicts: ValueConflict[];
  goalConflicts: GoalConflict[];
  identityConflicts: IdentityConflict[];
  familyPressure: FamilyPressure;
}

export interface CareerContradictionContext {
  careerId: string;
  careerName: string;
  supportedValues: string[];
  supportedGoals: string[];
  identityAlignment: string[];
  familyApproval: Weight;
}

// ============================================================================
// ENGINE
// ============================================================================

export class ContradictionWeightEngine {
  private config: ContradictionConfig;

  constructor(config: Partial<ContradictionConfig> = {}) {
    this.config = { ...DEFAULT_CONTRADICTION_CONFIG, ...config };
  }

  /**
   * Calculate contradiction weight for a specific career
   */
  calculateWeight(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): ContradictionWeight {
    const timestamp = Date.now();

    // Detect conflicts specific to this career
    const valueConflicts = this.detectValueConflicts(input, context);
    const goalConflicts = this.detectGoalConflicts(input, context);
    const identityConflicts = this.detectIdentityConflicts(input, context);

    // Calculate family pressure impact
    const familyPressure = this.calculateFamilyPressure(input, context);

    // Calculate adjustment factor
    const adjustmentFactor = this.calculateAdjustmentFactor(
      valueConflicts,
      goalConflicts,
      identityConflicts,
      familyPressure
    );

    // Calculate total weight (inverse - fewer conflicts = higher weight)
    const conflictPenalty = this.calculateConflictPenalty(
      valueConflicts,
      goalConflicts,
      identityConflicts,
      familyPressure
    );
    const totalWeight = Math.max(0, 1 - conflictPenalty);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      valueConflicts,
      goalConflicts,
      identityConflicts,
      familyPressure
    );

    return {
      engineId: 'contradiction',
      timestamp,
      valueConflicts,
      goalConflicts,
      identityConflicts,
      familyPressure,
      totalWeight,
      adjustmentFactor,
      reasoning,
    };
  }

  /**
   * Resolve contradictions and generate recommendations
   */
  resolveContradictions(
    input: ContradictionInput
  ): {
    resolved: Array<{
      type: 'value' | 'goal' | 'identity' | 'family';
      description: string;
      resolution: string;
    }>;
    flagged: Array<{
      type: 'value' | 'goal' | 'identity' | 'family';
      description: string;
      requiresAttention: boolean;
    }>;
    requiresAttention: boolean;
    totalConflicts: number;
  } {
    const resolved = [];
    const flagged = [];

    // Resolve value conflicts
    for (const conflict of input.valueConflicts) {
      if (conflict.severity < this.config.mediumSeverityThreshold) {
        resolved.push({
          type: 'value',
          description: `${conflict.value1} vs ${conflict.value2}`,
          resolution: this.resolveValueConflict(conflict),
        });
      } else {
        flagged.push({
          type: 'value',
          description: `${conflict.value1} conflicts with ${conflict.value2}: ${conflict.context}`,
          requiresAttention: conflict.severity > this.config.highSeverityThreshold,
        });
      }
    }

    // Resolve goal conflicts
    for (const conflict of input.goalConflicts) {
      if (this.config.balanceGoals && conflict.severity < this.config.highSeverityThreshold) {
        resolved.push({
          type: 'goal',
          description: `${conflict.goal1} vs ${conflict.goal2}`,
          resolution: this.resolveGoalConflict(conflict),
        });
      } else {
        flagged.push({
          type: 'goal',
          description: `${conflict.goal1} conflicts with ${conflict.goal2} (${conflict.timeframe} term)`,
          requiresAttention: conflict.severity > this.config.highSeverityThreshold,
        });
      }
    }

    // Identity conflicts are usually flagged
    for (const conflict of input.identityConflicts) {
      if (this.config.flagIdentityConflicts) {
        flagged.push({
          type: 'identity',
          description: `${conflict.aspect1} vs ${conflict.aspect2}: ${conflict.description}`,
          requiresAttention: true,
        });
      }
    }

    // Family pressure
    if (input.familyPressure.detected) {
      if (input.familyPressure.severity < this.config.mediumSeverityThreshold) {
        resolved.push({
          type: 'family',
          description: `Family expects ${input.familyPressure.expectation}`,
          resolution: 'Moderate family influence, student preference considered',
        });
      } else {
        flagged.push({
          type: 'family',
          description: `Strong family pressure for ${input.familyPressure.expectation} vs student desire for ${input.familyPressure.studentDesire}`,
          requiresAttention: input.familyPressure.severity > this.config.highSeverityThreshold,
        });
      }
    }

    const totalConflicts = input.valueConflicts.length + input.goalConflicts.length + input.identityConflicts.length + (input.familyPressure.detected ? 1 : 0);

    return {
      resolved,
      flagged,
      requiresAttention: flagged.some(f => f.requiresAttention),
      totalConflicts,
    };
  }

  /**
   * Check if a career is compatible with student profile
   */
  checkCompatibility(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): {
    compatible: boolean;
    score: Weight;
    issues: string[];
  } {
    const weight = this.calculateWeight(input, context);

    const issues: string[] = [];

    // Check value conflicts
    for (const conflict of weight.valueConflicts) {
      if (conflict.severity > this.config.mediumSeverityThreshold) {
        issues.push(`Value conflict: ${conflict.value1} vs ${conflict.value2}`);
      }
    }

    // Check goal conflicts
    for (const conflict of weight.goalConflicts) {
      if (conflict.severity > this.config.mediumSeverityThreshold) {
        issues.push(`Goal conflict: ${conflict.goal1} vs ${conflict.goal2}`);
      }
    }

    // Check identity conflicts
    for (const conflict of weight.identityConflicts) {
      issues.push(`Identity tension: ${conflict.aspect1} vs ${conflict.aspect2}`);
    }

    // Check family pressure
    if (weight.familyPressure.detected && weight.familyPressure.severity > 0.6) {
      issues.push('Significant family pressure detected');
    }

    return {
      compatible: weight.totalWeight > 0.5,
      score: weight.totalWeight,
      issues,
    };
  }

  // ============================================================================
  // PRIVATE DETECTION METHODS
  // ============================================================================

  private detectValueConflicts(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): ContradictionWeight['valueConflicts'] {
    const conflicts: ContradictionWeight['valueConflicts'] = [];

    for (const conflict of input.valueConflicts) {
      // Check if this career supports either value
      const supportsValue1 = context.supportedValues.includes(conflict.value1);
      const supportsValue2 = context.supportedValues.includes(conflict.value2);

      if (supportsValue1 && supportsValue2) {
        // Career supports both - no conflict
        continue;
      }

      if (!supportsValue1 && !supportsValue2) {
        // Career supports neither - mild conflict
        conflicts.push({
          value1: conflict.value1,
          value2: conflict.value2,
          severity: conflict.severity * 0.5,
          resolution: 'flag',
        });
      } else {
        // Career supports one but not the other
        const resolution = this.config.prioritizeStudentValues ? 'prioritize' : 'balance';
        conflicts.push({
          value1: conflict.value1,
          value2: conflict.value2,
          severity: conflict.severity,
          resolution,
        });
      }
    }

    return conflicts;
  }

  private detectGoalConflicts(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): ContradictionWeight['goalConflicts'] {
    const conflicts: ContradictionWeight['goalConflicts'] = [];

    for (const conflict of input.goalConflicts) {
      const supportsGoal1 = context.supportedGoals.includes(conflict.goal1);
      const supportsGoal2 = context.supportedGoals.includes(conflict.goal2);

      if (supportsGoal1 && supportsGoal2) {
        continue;
      }

      if (!supportsGoal1 && !supportsGoal2) {
        conflicts.push({
          goal1: conflict.goal1,
          goal2: conflict.goal2,
          severity: conflict.severity * 0.5,
          resolution: 'flag',
        });
      } else {
        conflicts.push({
          goal1: conflict.goal1,
          goal2: conflict.goal2,
          severity: conflict.severity,
          resolution: this.config.balanceGoals ? 'balance' : 'prioritize',
        });
      }
    }

    return conflicts;
  }

  private detectIdentityConflicts(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): ContradictionWeight['identityConflicts'] {
    const conflicts: ContradictionWeight['identityConflicts'] = [];

    for (const conflict of input.identityConflicts) {
      const alignsWith1 = context.identityAlignment.includes(conflict.aspect1);
      const alignsWith2 = context.identityAlignment.includes(conflict.aspect2);

      if (alignsWith1 && alignsWith2) {
        continue;
      }

      if (!alignsWith1 && !alignsWith2) {
        conflicts.push({
          aspect1: conflict.aspect1,
          aspect2: conflict.aspect2,
          severity: conflict.severity * 0.5,
          resolution: 'flag',
        });
      } else {
        conflicts.push({
          aspect1: conflict.aspect1,
          aspect2: conflict.aspect2,
          severity: conflict.severity,
          resolution: 'flag',
        });
      }
    }

    return conflicts;
  }

  private calculateFamilyPressure(
    input: ContradictionInput,
    context: CareerContradictionContext
  ): ContradictionWeight['familyPressure'] {
    if (!input.familyPressure.detected) {
      return {
        detected: false,
        severity: 0,
        source: [],
        resolution: 'none',
      };
    }

    // Check if career aligns with family expectation
    const alignsWithExpectation = context.familyApproval > 0.6;

    let resolution: string;
    if (alignsWithExpectation) {
      resolution = 'Career aligns with family expectations';
    } else if (input.familyPressure.severity < this.config.mediumSeverityThreshold) {
      resolution = 'Family pressure moderate, student preference prioritized';
    } else {
      resolution = 'Significant family pressure conflict requires attention';
    }

    return {
      detected: true,
      severity: input.familyPressure.severity,
      source: input.familyPressure.source,
      resolution,
    };
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  private calculateAdjustmentFactor(
    valueConflicts: ContradictionWeight['valueConflicts'],
    goalConflicts: ContradictionWeight['goalConflicts'],
    identityConflicts: ContradictionWeight['identityConflicts'],
    familyPressure: ContradictionWeight['familyPressure']
  ): number {
    let factor = 1.0;

    // Adjust for value conflicts
    for (const conflict of valueConflicts) {
      factor *= this.getSeverityAdjustment(conflict.severity);
    }

    // Adjust for goal conflicts
    for (const conflict of goalConflicts) {
      factor *= this.getSeverityAdjustment(conflict.severity);
    }

    // Adjust for identity conflicts
    for (const conflict of identityConflicts) {
      factor *= this.getSeverityAdjustment(conflict.severity);
    }

    // Adjust for family pressure
    if (familyPressure.detected) {
      factor *= (1 - familyPressure.severity * (1 - this.config.familyPressureAdjustment));
    }

    return Math.max(0.5, Math.min(1.5, factor));
  }

  private calculateConflictPenalty(
    valueConflicts: ContradictionWeight['valueConflicts'],
    goalConflicts: ContradictionWeight['goalConflicts'],
    identityConflicts: ContradictionWeight['identityConflicts'],
    familyPressure: ContradictionWeight['familyPressure']
  ): Weight {
    let penalty = 0;

    // Value conflict penalties
    for (const conflict of valueConflicts) {
      penalty += conflict.severity * 0.2;
    }

    // Goal conflict penalties
    for (const conflict of goalConflicts) {
      penalty += conflict.severity * 0.15;
    }

    // Identity conflict penalties
    for (const conflict of identityConflicts) {
      penalty += conflict.severity * 0.25;
    }

    // Family pressure penalty
    if (familyPressure.detected) {
      penalty += familyPressure.severity * 0.15;
    }

    return Math.min(1, penalty);
  }

  private getSeverityAdjustment(severity: Weight): number {
    if (severity >= this.config.highSeverityThreshold) {
      return this.config.highSeverityAdjustment;
    }
    if (severity >= this.config.mediumSeverityThreshold) {
      return this.config.mediumSeverityAdjustment;
    }
    return this.config.lowSeverityAdjustment;
  }

  // ============================================================================
  // RESOLUTION METHODS
  // ============================================================================

  private resolveValueConflict(conflict: ValueConflict): string {
    if (this.config.prioritizeStudentValues) {
      return `Prioritizing student values: ${conflict.value1} given preference over ${conflict.value2}`;
    }
    return `Balancing values: Seeking middle ground between ${conflict.value1} and ${conflict.value2}`;
  }

  private resolveGoalConflict(conflict: GoalConflict): string {
    if (conflict.timeframe === 'short') {
      return `Short-term goal ${conflict.goal1} prioritized; ${conflict.goal2} remains long-term objective`;
    }
    if (conflict.timeframe === 'long') {
      return `Long-term vision ${conflict.goal1} maintained; ${conflict.goal2} adjusted`;
    }
    return `Medium-term goals balanced: ${conflict.goal1} and ${conflict.goal2} both achievable with sequencing`;
  }

  // ============================================================================
  // REASONING GENERATION
  // ============================================================================

  private generateReasoning(
    valueConflicts: ContradictionWeight['valueConflicts'],
    goalConflicts: ContradictionWeight['goalConflicts'],
    identityConflicts: ContradictionWeight['identityConflicts'],
    familyPressure: ContradictionWeight['familyPressure']
  ): string[] {
    const reasoning: string[] = [];

    const totalConflicts = valueConflicts.length + goalConflicts.length + identityConflicts.length;

    if (totalConflicts === 0 && !familyPressure.detected) {
      reasoning.push('No significant contradictions detected for this career.');
      return reasoning;
    }

    // Value conflict reasoning
    for (const conflict of valueConflicts) {
      if (conflict.severity > this.config.mediumSeverityThreshold) {
        reasoning.push(
          `Value conflict: ${conflict.value1} vs ${conflict.value2} (${conflict.resolution})`
        );
      }
    }

    // Goal conflict reasoning
    for (const conflict of goalConflicts) {
      if (conflict.severity > this.config.mediumSeverityThreshold) {
        reasoning.push(
          `Goal conflict: ${conflict.goal1} vs ${conflict.goal2} (${conflict.resolution})`
        );
      }
    }

    // Identity conflict reasoning
    for (const conflict of identityConflicts) {
      reasoning.push(
        `Identity tension: ${conflict.aspect1} vs ${conflict.aspect2} (flagged for discussion)`
      );
    }

    // Family pressure reasoning
    if (familyPressure.detected) {
      reasoning.push(
        `Family pressure: ${familyPressure.resolution}`
      );
    }

    return reasoning;
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  getConfig(): ContradictionConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<ContradictionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default ContradictionWeightEngine;
