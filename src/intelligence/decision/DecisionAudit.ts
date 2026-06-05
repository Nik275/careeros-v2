/**
 * @fileoverview Decision Audit - Audit Trail Management
 * @module @/intelligence/decision/DecisionAudit
 * 
 * Audit trail for decision accountability and traceability.
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type {
  DecisionId,
  DecisionAudit,
  AuditStep,
  DecisionConfig,
  DecisionInput,
} from './DecisionTypes';

/**
 * Interface for Decision Audit.
 */
export interface IDecisionAudit {
  /**
   * Create new audit record.
   */
  createAudit(
    decisionId: DecisionId,
    input: DecisionInput,
    config: DecisionConfig
  ): DecisionAudit;

  /**
   * Add audit step.
   */
  addStep(
    audit: DecisionAudit,
    step: Omit<AuditStep, 'timestamp'>
  ): DecisionAudit;

  /**
   * Finalize audit.
   */
  finalize(audit: DecisionAudit): DecisionAudit;

  /**
   * Calculate input hash.
   */
  hashInput(input: DecisionInput): string;
}

/**
 * Decision Audit implementation.
 */
export class DecisionAuditor implements IDecisionAudit {
  private version: string;

  constructor(version: string = '1.0.0') {
    this.version = version;
  }

  /**
   * Create new audit record.
   */
  createAudit(
    decisionId: DecisionId,
    input: DecisionInput,
    config: DecisionConfig
  ): DecisionAudit {
    return {
      decisionId,
      timestamp: new Date(),
      authorityVersion: this.version,
      steps: [],
      inputHash: this.hashInput(input),
      config,
      traceId: this.generateTraceId(),
    };
  }

  /**
   * Add audit step.
   */
  addStep(
    audit: DecisionAudit,
    step: Omit<AuditStep, 'timestamp'>
  ): DecisionAudit {
    const fullStep: AuditStep = {
      ...step,
      timestamp: new Date(),
    };

    return {
      ...audit,
      steps: [...audit.steps, fullStep],
    };
  }

  /**
   * Finalize audit.
   */
  finalize(audit: DecisionAudit): DecisionAudit {
    return {
      ...audit,
      steps: audit.steps.map(step => ({
        ...step,
        // Ensure all steps have final values
      })),
    };
  }

  /**
   * Calculate simple input hash.
   */
  hashInput(input: DecisionInput): string {
    // Simple hash for audit purposes
    const str = JSON.stringify({
      type: input.type,
      optionCount: input.options.length,
      contextId: input.context.studentId,
      timestamp: input.context.timestamp.getTime(),
    });
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate trace ID.
   */
  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for creating Decision Auditor.
 */
export function createDecisionAuditor(version?: string): IDecisionAudit {
  return new DecisionAuditor(version);
}

// Default instance
export const defaultDecisionAuditor = createDecisionAuditor();
