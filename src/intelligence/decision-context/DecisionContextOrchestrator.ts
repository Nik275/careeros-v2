/**
 * Decision Context Orchestrator
 * 
 * The main engine that coordinates context detection, scoring, and explanation.
 * This is the entry point for all context detection operations.
 * 
 * Architecture:
 * - Signal Extraction: Finds evidence from various sources
 * - Scoring: Calculates confidence using weighted evidence combination
 * - Prioritization: Ranks contexts by importance
 * - Conflict Detection: Identifies incompatible contexts
 * - Explanation: Generates human-readable narratives
 * 
 * @module intelligence/decision-context
 */

import { v4 as uuidv4 } from 'uuid';
import {
  DecisionContextType,
  ContextDetectionInput,
  ContextAnalysis,
  DetectedContext,
  ContextEvidence,
  ContextConflict,
  ContextPriority,
  ContextRecommendation,
  ContextEngineConfig,
  SignalExtractor,
  IDecisionContextEngine,
} from './types';
import { extractAllSignals, getExtractorForContext } from './detection/signalExtractors';
import {
  ContextScoringEngine,
  ConfidenceResult,
  DEFAULT_SCORING_CONFIG,
} from './scoring/ContextScoringEngine';
import {
  ContextExplanationEngine,
  DEFAULT_EXPLANATION_CONFIG,
} from './explanation/ContextExplanationEngine';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default configuration for the Decision Context Engine.
 */
export const DEFAULT_CONTEXT_ENGINE_CONFIG: ContextEngineConfig = {
  minConfidenceThreshold: 0.25,
  evidenceWeights: {
    EXPLICIT_ANSWER: 1.0,
    USER_DECLARED: 0.95,
    EDUCATION_DATA: 0.85,
    EXPERIENCE_DATA: 0.8,
    GOAL_STATEMENT: 0.85,
    IMPLICIT_SIGNAL: 0.6,
    PATTERN_MATCH: 0.5,
    TEMPORAL_INFERENCE: 0.45,
    COMBINATORIAL_INFERENCE: 0.4,
    BROWSING_PATTERN: 0.35,
    INTERACTION_HISTORY: 0.3,
  },
  minEvidenceForPrimary: 2,
  conflictThreshold: 0.4,
  includeIncidental: false,
  enabledContexts: Object.values(DecisionContextType),
  explanationVerbosity: 'standard',
  maxContexts: 5,
};

// ============================================================================
// DECISION CONTEXT ENGINE
// ============================================================================

/**
 * Decision Context Engine
 * 
 * Orchestrates the complete context detection pipeline:
 * 1. Extract signals from all enabled context types
 * 2. Calculate confidence scores
 * 3. Prioritize and rank contexts
 * 4. Detect conflicts
 * 5. Generate explanations
 * 6. Produce final analysis
 */
export class DecisionContextOrchestrator implements IDecisionContextEngine {
  private config: ContextEngineConfig;
  private scoringEngine: ContextScoringEngine;
  private explanationEngine: ContextExplanationEngine;
  private customExtractors: SignalExtractor[] = [];
  
  constructor(config: Partial<ContextEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONTEXT_ENGINE_CONFIG, ...config };
    
    this.scoringEngine = new ContextScoringEngine({
      evidenceWeights: this.config.evidenceWeights,
    });
    
    this.explanationEngine = new ContextExplanationEngine({
      verbosity: this.config.explanationVerbosity,
    });
  }
  
  /**
   * Main analysis entry point.
   * 
   * Performs complete context detection and returns comprehensive analysis.
   * 
   * @param input - Context detection input data
   * @returns Complete context analysis
   */
  analyze(input: ContextDetectionInput): ContextAnalysis {
    const startTime = Date.now();
    
    // Step 1: Extract signals from all enabled contexts
    const signals = this.extractSignals(input);
    
    // Step 2: Score each context
    const scoredContexts = this.scoreContexts(signals);
    
    // Step 3: Filter by confidence threshold
    const validContexts = scoredContexts.filter(
      c => c.confidence >= this.config.minConfidenceThreshold
    );
    
    // Step 4: Prioritize contexts
    const prioritized = this.scoringEngine.prioritize(validContexts);
    
    // Step 5: Filter incidental contexts if configured
    const filtered = this.config.includeIncidental
      ? prioritized
      : prioritized.filter(c => c.priority !== ContextPriority.INCIDENTAL);
    
    // Step 6: Limit to max contexts
    const limited = filtered.slice(0, this.config.maxContexts);
    
    // Step 7: Detect conflicts
    const conflicts = this.scoringEngine.detectConflicts(limited);
    
    // Step 8: Generate explanations
    const contextsWithExplanations = this.generateExplanations(limited);
    
    // Step 9: Build final analysis
    const analysis = this.buildAnalysis(
      contextsWithExplanations,
      conflicts,
      input,
      startTime
    );
    
    return analysis;
  }
  
  /**
   * Detect a specific context type only.
   * 
   * Useful when you need to check for a single context without
   * running the full analysis pipeline.
   * 
   * @param contextType - Specific context to detect
   * @param input - Detection input
   * @returns Detected context or null if not found
   */
  detectContext(
    contextType: DecisionContextType,
    input: ContextDetectionInput
  ): DetectedContext | null {
    const extractor = getExtractorForContext(contextType);
    const evidence = extractor(input);
    
    if (evidence.length === 0) {
      return null;
    }
    
    const { confidence, uncertainty } = this.scoringEngine.calculateConfidence(
      contextType,
      evidence
    );
    
    if (confidence < this.config.minConfidenceThreshold) {
      return null;
    }
    
    const characteristics = this.explanationEngine.generateCharacteristics({
      context: contextType,
      category: this.getCategory(contextType),
      confidence,
      evidence,
      uncertainty,
      priority: ContextPriority.TERTIARY,
      explanation: '',
      characteristics: [],
      isActive: true,
      firstDetectedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    } as DetectedContext);
    
    const context: DetectedContext = {
      context: contextType,
      category: this.getCategory(contextType),
      confidence,
      evidence,
      uncertainty,
      priority: ContextPriority.TERTIARY,
      explanation: this.explanationEngine.explain(
        { context: contextType, confidence, evidence, uncertainty, priority: ContextPriority.TERTIARY, category: this.getCategory(contextType), characteristics, isActive: true, firstDetectedAt: Date.now(), lastUpdatedAt: Date.now(), explanation: '' },
        []
      ),
      characteristics,
      isActive: true,
      firstDetectedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };
    
    // Re-generate explanation with full context object
    context.explanation = this.explanationEngine.explain(context, []);
    
    return context;
  }
  
  /**
   * Extract signals for all enabled contexts.
   */
  private extractSignals(
    input: ContextDetectionInput
  ): Map<DecisionContextType, ContextEvidence[]> {
    // Use built-in extractors
    const signals = extractAllSignals(input, this.config.enabledContexts);
    
    // Apply custom extractors
    for (const extractor of this.customExtractors) {
      const customEvidence = extractor(input);
      
      // Group custom evidence by context type (if specified in evidence)
      for (const evidence of customEvidence) {
        // Custom extractors should specify context in source or description
        // For now, we'll add to all contexts as additional signal
        for (const [contextType, existing] of signals) {
          existing.push(evidence);
        }
      }
    }
    
    return signals;
  }
  
  /**
   * Score all contexts based on extracted evidence.
   */
  private scoreContexts(
    signals: Map<DecisionContextType, ContextEvidence[]>
  ): DetectedContext[] {
    const contexts: DetectedContext[] = [];
    const now = Date.now();
    
    for (const [contextType, evidence] of signals) {
      const { confidence, uncertainty, weightedEvidenceScore } = 
        this.scoringEngine.calculateConfidence(contextType, evidence);
      
      // Skip contexts with no meaningful evidence
      if (confidence < 0.1) {
        continue;
      }
      
      const category = this.getCategory(contextType);
      
      const context: DetectedContext = {
        context: contextType,
        category,
        confidence,
        evidence,
        uncertainty,
        priority: ContextPriority.TERTIARY, // Will be updated by prioritizer
        explanation: '', // Will be generated
        characteristics: [], // Will be generated
        isActive: confidence >= this.config.minConfidenceThreshold,
        firstDetectedAt: now,
        lastUpdatedAt: now,
      };
      
      contexts.push(context);
    }
    
    return contexts;
  }
  
  /**
   * Generate explanations for all detected contexts.
   */
  private generateExplanations(contexts: DetectedContext[]): DetectedContext[] {
    return contexts.map(context => {
      const characteristics = this.explanationEngine.generateCharacteristics(context);
      const explanation = this.explanationEngine.explain(context, contexts);
      
      return {
        ...context,
        characteristics,
        explanation,
      };
    });
  }
  
  /**
   * Build final analysis object.
   */
  private buildAnalysis(
    contexts: DetectedContext[],
    conflicts: ContextConflict[],
    input: ContextDetectionInput,
    startTime: number
  ): ContextAnalysis {
    const primaryContext = contexts.find(c => c.priority === ContextPriority.PRIMARY);
    const secondaryContexts = contexts.filter(c => c.priority === ContextPriority.SECONDARY);
    
    const overallConfidence = this.scoringEngine.calculateOverallConfidence(contexts);
    
    const narrative = this.explanationEngine.generateNarrative({
      id: '',
      timestamp: 0,
      studentId: input.profile.studentId || 'unknown',
      contexts,
      primaryContext,
      secondaryContexts,
      conflicts,
      overallConfidence,
      completeness: this.determineCompleteness(contexts, input),
      narrative: {} as any,
      recommendations: [],
    });
    
    const recommendations = this.generateRecommendations(contexts, input);
    
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      studentId: input.profile.studentId || 'unknown',
      contexts,
      primaryContext,
      secondaryContexts,
      conflicts,
      overallConfidence,
      completeness: this.determineCompleteness(contexts, input),
      narrative,
      recommendations,
    };
  }
  
  /**
   * Determine analysis completeness level.
   */
  private determineCompleteness(
    contexts: DetectedContext[],
    input: ContextDetectionInput
  ): 'complete' | 'partial' | 'insufficient_data' {
    // Check if we have primary context
    const hasPrimary = contexts.some(c => c.priority === ContextPriority.PRIMARY);
    
    // Check if we have sufficient input data
    const hasAssessmentData = input.assessmentResponses && input.assessmentResponses.length > 0;
    const hasExplicitGoals = input.explicitGoals && input.explicitGoals.length > 0;
    const hasUserInput = !!input.userInput;
    
    const dataSources = [hasAssessmentData, hasExplicitGoals, hasUserInput].filter(Boolean).length;
    
    if (!hasPrimary && dataSources < 2) {
      return 'insufficient_data';
    }
    
    if (!hasPrimary || dataSources < 3) {
      return 'partial';
    }
    
    return 'complete';
  }
  
  /**
   * Generate recommendations for improving context detection.
   */
  private generateRecommendations(
    contexts: DetectedContext[],
    input: ContextDetectionInput
  ): ContextRecommendation[] {
    const recommendations: ContextRecommendation[] = [];
    
    // Check for missing explicit goals
    if (!input.explicitGoals || input.explicitGoals.length === 0) {
      recommendations.push({
        type: 'clarification',
        description: 'Provide explicit statements about your current goals and situation',
        confidenceImpact: 0.2,
        priority: 'high',
      });
    }
    
    // Check for insufficient assessment data
    if (!input.assessmentResponses || input.assessmentResponses.length < 10) {
      recommendations.push({
        type: 'assessment',
        description: 'Complete additional assessment questions to improve context detection accuracy',
        confidenceImpact: 0.15,
        priority: 'medium',
      });
    }
    
    // Check for contexts with high uncertainty
    const highUncertainty = contexts.filter(c => c.uncertainty.score > 0.5);
    if (highUncertainty.length > 0) {
      recommendations.push({
        type: 'profile_update',
        description: `Update profile information to resolve uncertainty in ${highUncertainty.length} detected context(s)`,
        confidenceImpact: 0.25,
        priority: 'high',
      });
    }
    
    // Check for conflicts
    if (contexts.length >= 2) {
      recommendations.push({
        type: 'clarification',
        description: 'Clarify your primary focus if multiple competing contexts are detected',
        confidenceImpact: 0.15,
        priority: 'medium',
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get category for a context type.
   */
  private getCategory(contextType: DecisionContextType): any {
    const categories: Record<DecisionContextType, any> = {
      [DecisionContextType.JEE_PREPARATION]: 'ENTRANCE_EXAM',
      [DecisionContextType.NEET_PREPARATION]: 'ENTRANCE_EXAM',
      [DecisionContextType.UPSC_PREPARATION]: 'ENTRANCE_EXAM',
      [DecisionContextType.STATE_PSC_PREPARATION]: 'ENTRANCE_EXAM',
      [DecisionContextType.CA_PATHWAY]: 'PROFESSIONAL_QUALIFICATION',
      [DecisionContextType.CS_PATHWAY]: 'PROFESSIONAL_QUALIFICATION',
      [DecisionContextType.CMA_PATHWAY]: 'PROFESSIONAL_QUALIFICATION',
      [DecisionContextType.COLLEGE_SELECTION]: 'EDUCATION_SELECTION',
      [DecisionContextType.SCHOOL_SELECTION]: 'EDUCATION_SELECTION',
      [DecisionContextType.COURSE_SELECTION]: 'EDUCATION_SELECTION',
      [DecisionContextType.CAREER_EXPLORATION]: 'CAREER_PHASE',
      [DecisionContextType.EARLY_CAREER]: 'CAREER_PHASE',
      [DecisionContextType.MID_CAREER]: 'CAREER_PHASE',
      [DecisionContextType.CAREER_SWITCH]: 'CAREER_TRANSITION',
      [DecisionContextType.INDUSTRY_TRANSITION]: 'CAREER_TRANSITION',
      [DecisionContextType.STARTUP_EXPLORATION]: 'ENTREPRENEURIAL',
      [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: 'ENTREPRENEURIAL',
      [DecisionContextType.FAMILY_BUSINESS]: 'FAMILY_CONTEXT',
      [DecisionContextType.REGIONAL_CONSTRAINT]: 'CONSTRAINT_DRIVEN',
      [DecisionContextType.FINANCIAL_CONSTRAINT]: 'CONSTRAINT_DRIVEN',
      [DecisionContextType.TIME_CONSTRAINT]: 'CONSTRAINT_DRIVEN',
    };
    
    return categories[contextType] || 'UNKNOWN';
  }
  
  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================
  
  /**
   * Update engine configuration.
   */
  updateConfig(config: Partial<ContextEngineConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update sub-engines
    this.scoringEngine.updateConfig({
      evidenceWeights: this.config.evidenceWeights,
    });
    
    this.explanationEngine.updateConfig({
      verbosity: this.config.explanationVerbosity,
    });
  }
  
  /**
   * Get current configuration.
   */
  getConfig(): ContextEngineConfig {
    return { ...this.config };
  }
  
  /**
   * Add a custom signal extractor.
   */
  addSignalExtractor(extractor: SignalExtractor): void {
    this.customExtractors.push(extractor);
  }
  
  /**
   * Enable specific contexts for detection.
   */
  enableContexts(contexts: DecisionContextType[]): void {
    this.config.enabledContexts = contexts;
  }
  
  /**
   * Disable specific contexts.
   */
  disableContexts(contexts: DecisionContextType[]): void {
    this.config.enabledContexts = this.config.enabledContexts.filter(
      c => !contexts.includes(c)
    );
  }
  
  /**
   * Get currently enabled contexts.
   */
  getEnabledContexts(): DecisionContextType[] {
    return [...this.config.enabledContexts];
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a Decision Context Engine with default configuration.
 */
export function createDecisionContextEngine(
  config?: Partial<ContextEngineConfig>
): DecisionContextOrchestrator {
  return new DecisionContextOrchestrator(config);
}

/**
 * Create a Decision Context Engine configured for quick detection.
 * Uses lower thresholds for faster results with less precision.
 */
export function createQuickContextEngine(): DecisionContextOrchestrator {
  return new DecisionContextOrchestrator({
    minConfidenceThreshold: 0.15,
    includeIncidental: true,
    explanationVerbosity: 'minimal',
    maxContexts: 3,
  });
}

/**
 * Create a Decision Context Engine configured for high precision.
 * Uses higher thresholds and includes all contexts.
 */
export function createPreciseContextEngine(): DecisionContextOrchestrator {
  return new DecisionContextOrchestrator({
    minConfidenceThreshold: 0.4,
    includeIncidental: false,
    explanationVerbosity: 'detailed',
    maxContexts: 7,
  });
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  ContextScoringEngine,
  ConfidenceResult,
  DEFAULT_SCORING_CONFIG,
} from './scoring/ContextScoringEngine';

export {
  ContextExplanationEngine,
  ExplanationConfig,
  DEFAULT_EXPLANATION_CONFIG,
} from './explanation/ContextExplanationEngine';

export {
  extractAllSignals,
  getExtractorForContext,
  CONTEXT_EXTRACTORS,
} from './detection/signalExtractors';
