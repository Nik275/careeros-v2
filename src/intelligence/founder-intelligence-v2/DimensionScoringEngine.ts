/**
 * Founder Intelligence V2 - Dimension Scoring Engine
 * 
 * Scores each of the 8 founder dimensions based on evidence extraction
 * from text, portfolios, assessments, and psychological profiles.
 * 
 * Key features:
 * - Multi-source evidence extraction
 * - Signal pattern matching with context awareness
 * - Confidence calculation based on evidence quality and quantity
 * - Anti-signal detection for accuracy
 * 
 * @module intelligence/founder-intelligence-v2
 */

import {
  FounderDimensionV2,
  DimensionScoreV2,
  FounderEvidenceV2,
  FounderEvidenceTypeV2,
  FounderAnalysisInputV2,
  ProjectInfoV2,
  DEFAULT_DIMENSION_WEIGHTS,
} from './types';
import type { FounderAssessmentResponseV2 } from './types';
import { DIMENSION_SIGNAL_MAP, SignalPattern, DIFFERENTIAL_FOUNDER_INDICATORS } from './signals';

/**
 * Configuration for dimension scoring.
 */
export interface DimensionScoringConfigV2 {
  /** Minimum evidence strength to count */
  minEvidenceStrength: number;
  
  /** Threshold to consider a dimension a strength */
  strengthThreshold: number;
  
  /** Threshold to flag for development */
  developmentThreshold: number;
  
  /** Diminishing returns factor for multiple evidence */
  diminishingReturnsFactor: number;
  
  /** Maximum score possible */
  maxScore: number;
  
  /** Boost for contextual keywords */
  contextBoosterFactor: number;
  
  /** Reduction for ambiguous context */
  contextDampenerFactor: number;
  
  /** Minimum confidence for high confidence */
  minEvidenceForHighConfidence: number;
}

/**
 * Default dimension scoring configuration.
 */
export const DEFAULT_DIMENSION_SCORING_CONFIG: DimensionScoringConfigV2 = {
  minEvidenceStrength: 0.2,
  strengthThreshold: 0.6,
  developmentThreshold: 0.4,
  diminishingReturnsFactor: 0.85,
  maxScore: 1.0,
  contextBoosterFactor: 0.15,
  contextDampenerFactor: 0.2,
  minEvidenceForHighConfidence: 4,
};

/**
 * Text source for analysis.
 */
interface TextSource {
  text: string;
  source: string;
  timestamp?: number;
}

type FounderAssessmentResponse = FounderAssessmentResponseV2;

/**
 * Dimension Scoring Engine V2
 * 
 * Implements sophisticated signal extraction and scoring for all 8
 * founder dimensions with confidence estimation and explainability.
 */
export class DimensionScoringEngineV2 {
  private config: DimensionScoringConfigV2;
  
  constructor(config: Partial<DimensionScoringConfigV2> = {}) {
    this.config = { ...DEFAULT_DIMENSION_SCORING_CONFIG, ...config };
  }
  
  /**
   * Score all 8 founder dimensions.
   * 
   * @param input - Founder analysis input
   * @returns Array of dimension scores
   */
  scoreAllDimensions(input: FounderAnalysisInputV2): DimensionScoreV2[] {
    const scores: DimensionScoreV2[] = [];
    
    for (const dimension of Object.values(FounderDimensionV2)) {
      const score = this.scoreDimension(dimension, input);
      scores.push(score);
    }
    
    return scores;
  }
  
  /**
   * Score a specific dimension.
   * 
   * @param dimension - Dimension to score
   * @param input - Analysis input
   * @returns Dimension score with evidence
   */
  scoreDimension(dimension: FounderDimensionV2, input: FounderAnalysisInputV2): DimensionScoreV2 {
    // Extract evidence for this dimension
    const evidence = this.extractDimensionEvidence(dimension, input);
    
    // Calculate score from evidence
    const { score, confidence } = this.calculateScoreFromEvidence(evidence);
    
    // Determine if this is a strength or development area
    const isStrength = score >= this.config.strengthThreshold;
    const needsDevelopment = score < this.config.developmentThreshold;
    
    // Generate explanation
    const explanation = this.generateDimensionExplanation(dimension, score, evidence);
    
    // Get strongest evidence strength
    const strongestEvidenceStrength = evidence.length > 0
      ? Math.max(...evidence.filter(e => !e.isContradictory).map(e => e.strength))
      : 0;
    
    return {
      dimension,
      score,
      confidence,
      evidence,
      evidenceCount: evidence.length,
      strongestEvidenceStrength,
      explanation,
      isStrength,
      needsDevelopment,
    };
  }
  
  /**
   * Extract all evidence for a specific dimension.
   */
  private extractDimensionEvidence(
    dimension: FounderDimensionV2,
    input: FounderAnalysisInputV2
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    // Extract from text inputs using signal patterns
    evidence.push(...this.extractFromTextPatterns(dimension, input));
    
    // Extract from portfolio
    if (input.projectPortfolio && input.projectPortfolio.length > 0) {
      evidence.push(...this.extractFromPortfolio(dimension, input.projectPortfolio));
    }
    
    // Extract from profile psychology
    evidence.push(...this.extractFromPsychology(dimension, input.profile));
    
    // Extract from explicit statements
    if (input.explicitStatements && input.explicitStatements.length > 0) {
      evidence.push(...this.extractFromExplicitStatements(dimension, input.explicitStatements));
    }
    
    // Extract from assessment responses
    if (input.assessmentResponses && input.assessmentResponses.length > 0) {
      evidence.push(...this.extractFromAssessments(dimension, input.assessmentResponses));
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from text using signal patterns.
   */
  private extractFromTextPatterns(
    dimension: FounderDimensionV2,
    input: FounderAnalysisInputV2
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    const patterns = DIMENSION_SIGNAL_MAP[dimension];
    const textSources = this.getTextSources(input);
    
    for (const { text, source } of textSources) {
      const lowerText = text.toLowerCase();
      
      for (const pattern of patterns) {
        const matches = this.findPatternMatches(lowerText, pattern.pattern);
        
        for (const match of matches) {
          // Calculate contextual strength
          let strength = pattern.strength;
          
          // Apply context boosters
          if (pattern.contextBoosters) {
            for (const booster of pattern.contextBoosters) {
              if (lowerText.includes(booster.toLowerCase())) {
                strength += this.config.contextBoosterFactor;
              }
            }
          }
          
          // Apply context dampeners
          if (pattern.contextDampeners) {
            for (const dampener of pattern.contextDampeners) {
              if (lowerText.includes(dampener.toLowerCase())) {
                strength -= this.config.contextDampenerFactor;
              }
            }
          }
          
          // Cap at max
          strength = Math.min(Math.max(strength, 0), 1);
          
          evidence.push({
            id: this.generateEvidenceId(dimension, source, match),
            type: pattern.evidenceType,
            dimension: pattern.isAntiSignal ? undefined : dimension,
            strength,
            description: pattern.description,
            source,
            rawValue: { 
              pattern: pattern.pattern.toString(), 
              match,
              context: this.extractContext(lowerText, match),
            },
            timestamp: Date.now(),
            isContradictory: pattern.isAntiSignal ?? false,
          });
        }
      }
    }
    
    return evidence;
  }
  
  /**
   * Find all matches for a pattern in text.
   */
  private findPatternMatches(text: string, pattern: string | RegExp): string[] {
    const matches: string[] = [];
    
    if (typeof pattern === 'string') {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
      }
    } else {
      let match: RegExpExecArray | null;
      const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
      }
    }
    
    return matches;
  }
  
  /**
   * Extract surrounding context for a match.
   */
  private extractContext(text: string, match: string, window: number = 50): string {
    const index = text.indexOf(match);
    if (index === -1) return '';
    
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + match.length + window);
    
    return text.substring(start, end);
  }
  
  /**
   * Get all text sources from input.
   */
  private getTextSources(input: FounderAnalysisInputV2): TextSource[] {
    const sources: TextSource[] = [];
    
    if (input.userInput) {
      sources.push({ text: input.userInput, source: 'user_input' });
    }
    
    if (input.experienceDescriptions) {
      input.experienceDescriptions.forEach((desc, idx) => {
        sources.push({ text: desc, source: `experience_${idx}` });
      });
    }
    
    if (input.explicitStatements) {
      input.explicitStatements.forEach((stmt, idx) => {
        sources.push({ text: stmt, source: `explicit_${idx}` });
      });
    }
    
    return sources;
  }
  
  /**
   * Extract evidence from project portfolio.
   */
  private extractFromPortfolio(
    dimension: FounderDimensionV2,
    portfolio: ProjectInfoV2[]
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    for (const project of portfolio) {
      const projectEvidence = this.extractProjectEvidence(dimension, project);
      evidence.push(...projectEvidence);
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from a single project.
   */
  private extractProjectEvidence(
    dimension: FounderDimensionV2,
    project: ProjectInfoV2
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    switch (dimension) {
      case FounderDimensionV2.OWNERSHIP_ORIENTATION:
        if (project.isProduct && project.hadUsers) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'product_users'),
            type: FounderEvidenceTypeV2.PRODUCT_BUILDING_BEHAVIOR,
            dimension,
            strength: project.hadRevenue ? 0.95 : 0.85,
            description: `Built product "${project.name}" with ${project.hadRevenue ? 'paying customers' : 'actual users'}`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        if (project.role === 'CO_FOUNDER') {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'co_founder'),
            type: FounderEvidenceTypeV2.PAST_STARTUP_EXPERIENCE,
            dimension,
            strength: 0.9,
            description: `Co-founded "${project.name}"`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.RESOURCEFULNESS:
        if (project.durationMonths > 3 && project.teamSize <= 2 && project.isProduct) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'bootstrap'),
            type: FounderEvidenceTypeV2.RESOURCEFULNESS_EVIDENCE,
            dimension,
            strength: 0.8,
            description: `Built "${project.name}" with small team (${project.teamSize}) over ${project.durationMonths} months`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        if (project.outcome === 'completed' || project.outcome === 'ongoing') {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'completion'),
            type: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
            dimension,
            strength: 0.75,
            description: `Saw "${project.name}" through to completion`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.RESILIENCE:
        if (project.outcome === 'failed' || project.outcome === 'pivoted') {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'failure'),
            type: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
            dimension,
            strength: 0.8,
            description: `Experienced ${project.outcome} with "${project.name}" and continued`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        if (project.lessonsLearned && project.lessonsLearned.length > 0) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'lessons'),
            type: FounderEvidenceTypeV2.RESILIENCE_EVIDENCE,
            dimension,
            strength: 0.75,
            description: `Extracted lessons from "${project.name}" experience`,
            source: `project_${project.name}`,
            rawValue: project.lessonsLearned,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.TALENT_MAGNETISM:
        if (project.teamSize > 2) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'team'),
            type: FounderEvidenceTypeV2.COLLABORATION_ATTRACTION,
            dimension,
            strength: Math.min(0.7 + (project.teamSize - 2) * 0.05, 0.9),
            description: `Attracted ${project.teamSize} people to work on "${project.name}"`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.SALES_CAPABILITY:
        if (project.hadRevenue) {
          const strength = project.revenueAmount && project.revenueAmount > 10000 ? 0.95 : 0.85;
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'revenue'),
            type: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
            dimension,
            strength,
            description: `Generated ${project.revenueAmount ? '$' + project.revenueAmount : 'revenue'} from "${project.name}"`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        if (project.userCount && project.userCount > 100) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'users'),
            type: FounderEvidenceTypeV2.SALES_PERSUASION_EVIDENCE,
            dimension,
            strength: Math.min(0.7 + Math.log10(project.userCount) * 0.05, 0.9),
            description: `Acquired ${project.userCount} users for "${project.name}"`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.OPPORTUNITY_RECOGNITION:
        if (project.isProduct) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'product'),
            type: FounderEvidenceTypeV2.OPPORTUNITY_IDENTIFICATION,
            dimension,
            strength: 0.75,
            description: `Identified opportunity and built "${project.name}"`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.OBSESSION_CAPACITY:
        if (project.durationMonths >= 12) {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'duration'),
            type: FounderEvidenceTypeV2.PERSISTENCE_EVIDENCE,
            dimension,
            strength: Math.min(0.7 + (project.durationMonths - 12) * 0.01, 0.95),
            description: `Committed to "${project.name}" for ${project.durationMonths} months`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.AMBIGUITY_TOLERANCE:
        if (project.outcome === 'pivoted') {
          evidence.push({
            id: this.generateEvidenceId(dimension, `project_${project.name}`, 'pivot'),
            type: FounderEvidenceTypeV2.AMBIGUITY_COMFORT_EVIDENCE,
            dimension,
            strength: 0.85,
            description: `Pivoted "${project.name}" when needed`,
            source: `project_${project.name}`,
            rawValue: project,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from psychological profile.
   */
  private extractFromPsychology(
    dimension: FounderDimensionV2,
    profile: any
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    const psychology = profile.psychology || profile.psychologyProfile;
    
    if (!psychology) return evidence;
    
    switch (dimension) {
      case FounderDimensionV2.AMBIGUITY_TOLERANCE:
        // Openness correlates with ambiguity tolerance
        if (psychology.openness > 0.7) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology', 'openness'),
            type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
            dimension,
            strength: psychology.openness * 0.8,
            description: `High openness (${(psychology.openness * 100).toFixed(0)}%) suggests ambiguity tolerance`,
            source: 'psychology_profile',
            rawValue: psychology.openness,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.OBSESSION_CAPACITY:
        // Conscientiousness correlates with persistence
        if (psychology.conscientiousness > 0.7) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology', 'conscientiousness'),
            type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
            dimension,
            strength: psychology.conscientiousness * 0.75,
            description: `High conscientiousness (${(psychology.conscientiousness * 100).toFixed(0)}%) suggests persistence`,
            source: 'psychology_profile',
            rawValue: psychology.conscientiousness,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.RESILIENCE:
        // Low neuroticism correlates with resilience
        if (psychology.neuroticism < 0.4) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology', 'neuroticism'),
            type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
            dimension,
            strength: (1 - psychology.neuroticism) * 0.7,
            description: `Low neuroticism (${(psychology.neuroticism * 100).toFixed(0)}%) suggests emotional stability`,
            source: 'psychology_profile',
            rawValue: psychology.neuroticism,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.TALENT_MAGNETISM:
        // Extraversion correlates with leadership
        if (psychology.extraversion > 0.65) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology', 'extraversion'),
            type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
            dimension,
            strength: psychology.extraversion * 0.7,
            description: `High extraversion (${(psychology.extraversion * 100).toFixed(0)}%) suggests people orientation`,
            source: 'psychology_profile',
            rawValue: psychology.extraversion,
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
        
      case FounderDimensionV2.SALES_CAPABILITY:
        // Extraversion + assertiveness for sales
        if (psychology.extraversion > 0.6 && psychology.assertiveness > 0.6) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology', 'assertiveness'),
            type: FounderEvidenceTypeV2.PSYCHOLOGICAL_INDICATOR,
            dimension,
            strength: ((psychology.extraversion + psychology.assertiveness) / 2) * 0.75,
            description: `Assertive extraversion suggests sales capability`,
            source: 'psychology_profile',
            rawValue: { extraversion: psychology.extraversion, assertiveness: psychology.assertiveness },
            timestamp: Date.now(),
            isContradictory: false,
          });
        }
        break;
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from explicit statements.
   */
  private extractFromExplicitStatements(
    dimension: FounderDimensionV2,
    statements: string[]
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    for (const statement of statements) {
      const lowerStatement = statement.toLowerCase();
      
      // Check for explicit founder intent (ownership dimension)
      if (dimension === FounderDimensionV2.OWNERSHIP_ORIENTATION) {
        const founderKeywords = [
          'want to start a company',
          'build a company',
          'found a startup',
          'want to be an entrepreneur',
          'starting my own business',
        ];
        
        for (const keyword of founderKeywords) {
          if (lowerStatement.includes(keyword)) {
            evidence.push({
              id: this.generateEvidenceId(dimension, 'explicit', keyword),
              type: FounderEvidenceTypeV2.EXPLICIT_ENTREPRENEURIAL_STATEMENT,
              dimension,
              strength: 0.9,
              description: `Explicit entrepreneurial intent: "${statement.substring(0, 60)}..."`,
              source: 'explicit_statement',
              rawValue: statement,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
        }
      }
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from assessment responses.
   */
  private extractFromAssessments(
    dimension: FounderDimensionV2,
    responses: FounderAssessmentResponse[]
  ): FounderEvidenceV2[] {
    const evidence: FounderEvidenceV2[] = [];
    
    // Map assessment question types to dimensions
    const dimensionQuestionMap: Record<FounderDimensionV2, string[]> = {
      [FounderDimensionV2.OWNERSHIP_ORIENTATION]: ['autonomy', 'ownership', 'initiative', 'independence'],
      [FounderDimensionV2.RESILIENCE]: ['resilience', 'persistence', 'failure', 'setbacks'],
      [FounderDimensionV2.RESOURCEFULNESS]: ['resourcefulness', 'creativity', 'problem_solving'],
      [FounderDimensionV2.SALES_CAPABILITY]: ['influence', 'persuasion', 'negotiation'],
      [FounderDimensionV2.TALENT_MAGNETISM]: ['leadership', 'teamwork', 'collaboration'],
      [FounderDimensionV2.AMBIGUITY_TOLERANCE]: ['risk_tolerance', 'uncertainty', 'ambiguity'],
      [FounderDimensionV2.OBSESSION_CAPACITY]: ['commitment', 'persistence', 'focus'],
      [FounderDimensionV2.OPPORTUNITY_RECOGNITION]: ['pattern_recognition', 'opportunity', 'vision'],
    };
    
    const relevantQuestions = dimensionQuestionMap[dimension] || [];
    
    for (const response of responses) {
      const questionText = (response.questionText || response.questionId || '').toLowerCase();
      
      // Check if this question is relevant to this dimension
      const isRelevant = relevantQuestions.some(q => questionText.includes(q.toLowerCase()));
      
      if (isRelevant) {
        // Extract strength from response value
        let strength = 0.5;
        
        if (typeof response.value === 'number') {
          // Likert scale (assuming 1-5 or 1-7)
          const maxScale = response.scaleMax || 5;
          strength = response.value / maxScale;
        } else if (typeof response.value === 'string') {
          // Look for strength indicators in text responses
          const positiveIndicators = ['strongly agree', 'very', 'extremely', 'definitely', 'absolutely'];
          const negativeIndicators = ['disagree', 'not', 'rarely', 'never'];
          
          const lowerValue = response.value.toLowerCase();
          if (positiveIndicators.some(p => lowerValue.includes(p))) strength = 0.8;
          else if (negativeIndicators.some(n => lowerValue.includes(n))) strength = 0.3;
        }
        
        evidence.push({
          id: this.generateEvidenceId(dimension, 'assessment', response.questionId || 'unknown'),
          type: FounderEvidenceTypeV2.ASSESSMENT_SIGNAL,
          dimension,
          strength,
          description: `Assessment response: ${response.questionId || 'unknown'}`,
          source: 'assessment',
          rawValue: response,
          timestamp: Date.now(),
          isContradictory: false,
        });
      }
    }
    
    return evidence;
  }
  
  /**
   * Calculate dimension score from evidence.
   */
  private calculateScoreFromEvidence(
    evidence: FounderEvidenceV2[]
  ): { score: number; confidence: number } {
    // Separate supporting and contradictory evidence
    const supportingEvidence = evidence.filter(e => !e.isContradictory);
    const contradictoryEvidence = evidence.filter(e => e.isContradictory);
    
    // Filter weak evidence
    const validEvidence = supportingEvidence.filter(
      e => e.strength >= this.config.minEvidenceStrength
    );
    
    if (validEvidence.length === 0) {
      // Check if there's strong contradictory evidence
      const strongContradiction = contradictoryEvidence.some(e => e.strength > 0.6);
      if (strongContradiction) {
        return { score: 0.1, confidence: 0.5 };
      }
      return { score: 0, confidence: 0 };
    }
    
    // Sort by strength (strongest first)
    const sorted = [...validEvidence].sort((a, b) => b.strength - a.strength);
    
    // Apply weighted combination with diminishing returns
    let weightedSum = 0;
    let weight = 1;
    
    for (const e of sorted) {
      weightedSum += e.strength * weight;
      weight *= this.config.diminishingReturnsFactor;
    }
    
    // Normalize to 0-1
    const rawScore = weightedSum / (1 + weightedSum * 0.3);
    
    // Apply penalty for contradictory evidence
    const contradictionPenalty = contradictoryEvidence.reduce(
      (sum, e) => sum + e.strength * 0.2, 
      0
    );
    
    const score = Math.max(0, Math.min(rawScore - contradictionPenalty, this.config.maxScore));
    
    // Calculate confidence
    const evidenceCountConfidence = Math.min(validEvidence.length / this.config.minEvidenceForHighConfidence, 0.5);
    const evidenceQualityConfidence = sorted[0]?.strength * 0.4 || 0;
    const varietyConfidence = this.calculateVarietyConfidence(validEvidence) * 0.1;
    
    const confidence = Math.min(evidenceCountConfidence + evidenceQualityConfidence + varietyConfidence, 1);
    
    return { score, confidence };
  }
  
  /**
   * Calculate confidence bonus from evidence variety.
   */
  private calculateVarietyConfidence(evidence: FounderEvidenceV2[]): number {
    const sources = new Set(evidence.map(e => e.source.split('_')[0]));
    const types = new Set(evidence.map(e => e.type));
    
    // More sources and types = higher confidence
    const sourceVariety = Math.min(sources.size / 3, 1);
    const typeVariety = Math.min(types.size / 3, 1);
    
    return (sourceVariety + typeVariety) / 2;
  }
  
  /**
   * Generate explanation for a dimension score.
   */
  private generateDimensionExplanation(
    dimension: FounderDimensionV2,
    score: number,
    evidence: FounderEvidenceV2[]
  ): string {
    const dimensionLabel = dimension.replace(/_/g, ' ').toLowerCase();
    
    const supportingEvidence = evidence.filter(e => !e.isContradictory);
    const contradictoryEvidence = evidence.filter(e => e.isContradictory);
    
    if (supportingEvidence.length === 0) {
      if (contradictoryEvidence.length > 0) {
        return `No strong evidence of ${dimensionLabel} found. Some indicators suggest this may not be a natural strength.`;
      }
      return `No strong evidence of ${dimensionLabel} found in the provided information.`;
    }
    
    const strength = score >= this.config.strengthThreshold ? 'strong' 
      : score >= this.config.developmentThreshold ? 'moderate' 
      : 'limited';
    
    const topEvidence = supportingEvidence
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2)
      .map(e => e.description)
      .join('; ');
    
    let explanation = `Shows ${strength} ${dimensionLabel} (${(score * 100).toFixed(0)}% score). `;
    explanation += `Key indicators: ${topEvidence}.`;
    
    if (contradictoryEvidence.length > 0) {
      explanation += ` Note: Some contradictory signals detected.`;
    }
    
    return explanation;
  }
  
  /**
   * Generate unique evidence ID.
   */
  private generateEvidenceId(dimension: FounderDimensionV2, source: string, suffix: string): string {
    return `${dimension}_${source}_${suffix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Get top dimensions by score.
   */
  getTopDimensions(scores: DimensionScoreV2[], count: number = 3): DimensionScoreV2[] {
    return [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }
  
  /**
   * Get dimensions needing development.
   */
  getDevelopmentAreas(scores: DimensionScoreV2[]): DimensionScoreV2[] {
    return scores
      .filter(s => s.needsDevelopment)
      .sort((a, b) => a.score - b.score);
  }
  
  /**
   * Calculate overall potential from dimension scores.
   */
  calculateOverallPotential(
    scores: DimensionScoreV2[],
    weights?: Record<FounderDimensionV2, number>
  ): { potential: number; confidence: number } {
    const w = weights || DEFAULT_DIMENSION_WEIGHTS;
    
    let weightedSum = 0;
    let totalWeight = 0;
    let totalConfidence = 0;
    
    for (const score of scores) {
      const weight = w[score.dimension] || 1;
      weightedSum += score.score * weight;
      totalWeight += weight;
      totalConfidence += score.confidence * weight;
    }
    
    const potential = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const confidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
    
    return { potential, confidence };
  }
  
  /**
   * Get dimension score statistics.
   */
  getScoreStatistics(scores: DimensionScoreV2[]): {
    average: number;
    median: number;
    range: number;
    strongest: DimensionScoreV2 | null;
    weakest: DimensionScoreV2 | null;
  } {
    if (scores.length === 0) {
      return { average: 0, median: 0, range: 0, strongest: null, weakest: null };
    }
    
    const sorted = [...scores].sort((a, b) => a.score - b.score);
    const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1].score + sorted[sorted.length / 2].score) / 2
      : sorted[Math.floor(sorted.length / 2)].score;
    const range = sorted[sorted.length - 1].score - sorted[0].score;
    
    return {
      average,
      median,
      range,
      strongest: sorted[sorted.length - 1],
      weakest: sorted[0],
    };
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<DimensionScoringConfigV2>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating dimension scoring engine.
 */
export function createDimensionScoringEngineV2(
  config?: Partial<DimensionScoringConfigV2>
): DimensionScoringEngineV2 {
  return new DimensionScoringEngineV2(config);
}
