/**
 * @fileoverview Decision History - Historical Record Management
 * @module @/intelligence/decision/DecisionHistory
 * 
 * Stores and retrieves decision history for audit and reconsideration.
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type { DecisionId, DecisionOutput, DecisionEvent } from './DecisionTypes';

/**
 * Interface for Decision History storage.
 */
export interface IDecisionHistory {
  /**
   * Store a decision.
   */
  store<T = unknown>(decision: DecisionOutput<T>): Promise<void>;

  /**
   * Retrieve a decision by ID.
   */
  retrieve<T = unknown>(decisionId: DecisionId): Promise<DecisionOutput<T> | undefined>;

  /**
   * Get decision history for a student.
   */
  getStudentHistory(
    studentId: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: string[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ReadonlyArray<DecisionOutput>>;

  /**
   * Check if decision exists.
   */
  exists(decisionId: DecisionId): Promise<boolean>;

  /**
   * Get decision count for a student.
   */
  getCount(studentId: string): Promise<number>;

  /**
   * Clear history for a student.
   */
  clear(studentId: string): Promise<void>;
}

/**
 * In-memory implementation of Decision History.
 */
export class InMemoryDecisionHistory implements IDecisionHistory {
  private decisions: Map<DecisionId, DecisionOutput> = new Map();
  private studentDecisions: Map<string, DecisionId[]> = new Map();

  async store<T = unknown>(decision: DecisionOutput<T>): Promise<void> {
    this.decisions.set(decision.decisionId, decision as DecisionOutput);
    
    const studentId = this.extractStudentId(decision);
    if (studentId) {
      const existing = this.studentDecisions.get(studentId) ?? [];
      existing.push(decision.decisionId);
      this.studentDecisions.set(studentId, existing);
    }
  }

  async retrieve<T = unknown>(decisionId: DecisionId): Promise<DecisionOutput<T> | undefined> {
    return this.decisions.get(decisionId) as DecisionOutput<T> | undefined;
  }

  async getStudentHistory(
    studentId: string,
    options: {
      limit?: number;
      offset?: number;
      types?: string[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<ReadonlyArray<DecisionOutput>> {
    const decisionIds = this.studentDecisions.get(studentId) ?? [];
    
    let decisions = decisionIds
      .map(id => this.decisions.get(id))
      .filter((d): d is DecisionOutput => d !== undefined);

    // Filter by type
    if (options.types && options.types.length > 0) {
      decisions = decisions.filter(d => options.types!.includes(d.type));
    }

    // Filter by date range
    if (options.startDate) {
      decisions = decisions.filter(d => d.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      decisions = decisions.filter(d => d.timestamp <= options.endDate!);
    }

    // Sort by timestamp descending
    decisions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset ?? 0;
    const limit = options.limit ?? decisions.length;
    
    return decisions.slice(offset, offset + limit);
  }

  async exists(decisionId: DecisionId): Promise<boolean> {
    return this.decisions.has(decisionId);
  }

  async getCount(studentId: string): Promise<number> {
    return this.studentDecisions.get(studentId)?.length ?? 0;
  }

  async clear(studentId: string): Promise<void> {
    const decisionIds = this.studentDecisions.get(studentId) ?? [];
    
    for (const id of decisionIds) {
      this.decisions.delete(id);
    }
    
    this.studentDecisions.delete(studentId);
  }

  /**
   * Extract student ID from decision.
   */
  private extractStudentId(decision: DecisionOutput): string | undefined {
    // Try to extract from audit or context
    const auditSteps = decision.audit.steps;
    if (auditSteps.length > 0) {
      const firstStep = auditSteps[0];
      const inputs = firstStep.inputs as Record<string, unknown> | undefined;
      if (inputs?.context && typeof inputs.context === 'object') {
        const context = inputs.context as Record<string, unknown>;
        return context.studentId as string | undefined;
      }
    }
    return undefined;
  }
}

/**
 * Factory function for creating Decision History.
 */
export function createDecisionHistory(): IDecisionHistory {
  return new InMemoryDecisionHistory();
}

// Default instance
export const defaultDecisionHistory = createDecisionHistory();
