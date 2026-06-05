/**
 * Dimension Scoring Engine
 * 
 * Implements the 8-dimension signal framework for founder potential detection.
 * Each dimension is scored independently based on specific evidence patterns.
 * 
 * Dimensions:
 * 1. Opportunity Recognition - pattern recognition, market awareness
 * 2. Obsession Capacity - persistence, long-term focus
 * 3. Resourcefulness - improvisation, constraint navigation
 * 4. Ambiguity Tolerance - comfort with uncertainty
 * 5. Resilience - failure recovery
 * 6. Talent Magnetism - attracting collaborators
 * 7. Sales Capability - persuasion, relationship building
 * 8. Ownership Orientation - accountability, initiative
 * 
 * @module intelligence/founder-intelligence/scoring
 */

import {
  FounderDimension,
  DimensionScore,
  FounderEvidence,
  FounderEvidenceType,
  FounderAnalysisInput,
  ProjectInfo,
} from '../types';

/**
 * Configuration for dimension scoring.
 */
export interface DimensionScoringConfig {
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
}

/**
 * Default dimension scoring configuration.
 */
export const DEFAULT_DIMENSION_CONFIG: DimensionScoringConfig = {
  minEvidenceStrength: 0.2,
  strengthThreshold: 0.7,
  developmentThreshold: 0.4,
  diminishingReturnsFactor: 0.8,
  maxScore: 1.0,
};

/**
 * Signal patterns for each dimension.
 * 
 * These patterns are used to extract evidence from text input.
 * Each pattern includes keywords and the strength of evidence it provides.
 */
const DIMENSION_SIGNAL_PATTERNS: Record<FounderDimension, { patterns: string[]; strength: number }[]> = {
  [FounderDimension.OPPORTUNITY_RECOGNITION]: [
    { patterns: ['noticed a problem', 'saw an opportunity', 'gap in the market', 'pain point'], strength: 0.9 },
    { patterns: ['why hasn\'t anyone', 'wouldn\'t it be great if', 'someone should build'], strength: 0.8 },
    { patterns: ['pattern', 'trend', 'market', 'industry'], strength: 0.6 },
    { patterns: ['curious', 'observe', 'notice', 'question'], strength: 0.5 },
    { patterns: ['improve', 'better way', 'inefficient', 'broken'], strength: 0.7 },
  ],
  [FounderDimension.OBSESSION_CAPACITY]: [
    { patterns: ['spent years', 'worked on it for', 'dedicated myself'], strength: 0.9 },
    { patterns: ['can\'t stop thinking', 'obsessed with', 'passionate about'], strength: 0.85 },
    { patterns: ['deep interest', 'long term', 'committed to'], strength: 0.7 },
    { patterns: ['delayed gratification', 'sacrifice', 'patient'], strength: 0.75 },
    { patterns: ['persistence', 'perseverance', 'stick with it'], strength: 0.8 },
    { patterns: ['dream', 'vision', 'mission'], strength: 0.6 },
  ],
  [FounderDimension.RESOURCEFULNESS]: [
    { patterns: ['figured it out', 'learned on my own', 'taught myself'], strength: 0.85 },
    { patterns: ['no budget', 'limited resources', 'worked with what i had'], strength: 0.9 },
    { patterns: ['hack', 'workaround', 'improvise', 'jugaad'], strength: 0.8 },
    { patterns: ['self-taught', 'learned online', 'youtube', 'documentation'], strength: 0.75 },
    { patterns: ['bootstrap', 'scrappy', 'lean', 'mvp'], strength: 0.85 },
    { patterns: ['find a way', 'make it work', 'solve with constraints'], strength: 0.8 },
  ],
  [FounderDimension.AMBIGUITY_TOLERANCE]: [
    { patterns: ['comfortable with uncertainty', 'don\'t need all the answers'], strength: 0.85 },
    { patterns: ['experiment', 'try things', 'test and learn'], strength: 0.8 },
    { patterns: ['figure it out as i go', 'learn by doing'], strength: 0.8 },
    { patterns: ['no clear path', 'undefined', 'ambiguous'], strength: 0.7 },
    { patterns: ['risk', 'uncertain', 'unknown'], strength: 0.6 },
    { patterns: ['adapt', 'pivot', 'change direction'], strength: 0.75 },
  ],
  [FounderDimension.RESILIENCE]: [
    { patterns: ['failed but', 'setback', 'recovered from'], strength: 0.9 },
    { patterns: ['got back up', 'tried again', 'didn\'t give up'], strength: 0.85 },
    { patterns: ['learned from failure', 'mistake taught me'], strength: 0.85 },
    { patterns: ['rejection', 'criticism', 'feedback'], strength: 0.7 },
    { patterns: ['bounce back', 'resilient', 'thick skin'], strength: 0.8 },
    { patterns: ['challenge', 'difficult', 'overcame'], strength: 0.65 },
  ],
  [FounderDimension.TALENT_MAGNETISM]: [
    { patterns: ['convinced people to join', 'built a team', 'recruited'], strength: 0.9 },
    { patterns: ['people believe in my vision', 'inspired others'], strength: 0.85 },
    { patterns: ['leadership', 'team', 'collaborators'], strength: 0.75 },
    { patterns: ['network', 'connections', 'relationships'], strength: 0.65 },
    { patterns: ['charismatic', 'inspiring', 'motivating'], strength: 0.8 },
    { patterns: ['people want to work with me', 'attract talent'], strength: 0.85 },
  ],
  [FounderDimension.SALES_CAPABILITY]: [
    { patterns: ['sold', 'closed the deal', 'convinced them', 'persuaded'], strength: 0.9 },
    { patterns: ['negotiation', 'pitch', 'presentation'], strength: 0.8 },
    { patterns: ['relationship building', 'trust', 'rapport'], strength: 0.75 },
    { patterns: ['storytelling', 'communicate', 'influence'], strength: 0.7 },
    { patterns: ['customer', 'client', 'buyer'], strength: 0.65 },
    { patterns: ['convince', 'persuade', 'win over'], strength: 0.8 },
  ],
  [FounderDimension.OWNERSHIP_ORIENTATION]: [
    { patterns: ['took responsibility', 'my fault', 'accountable'], strength: 0.9 },
    { patterns: ['ownership', 'act like an owner', 'treat it as mine'], strength: 0.9 },
    { patterns: ['initiative', 'proactive', 'didn\'t wait'], strength: 0.85 },
    { patterns: ['decided to', 'chose to', 'made the call'], strength: 0.75 },
    { patterns: ['responsible for', 'in charge of', 'led'], strength: 0.8 },
    { patterns: ['not my job but', 'stepped up', 'volunteered'], strength: 0.85 },
  ],
};

/**
 * Dimension Scoring Engine
 * 
 * Scores each of the 8 founder dimensions independently based on:
 * - Evidence extraction from input
 * - Pattern matching on text
 * - Portfolio/project analysis
 * - Psychological indicators
 */
export class DimensionScoringEngine {
  private config: DimensionScoringConfig;
  
  constructor(config: Partial<DimensionScoringConfig> = {}) {
    this.config = { ...DEFAULT_DIMENSION_CONFIG, ...config };
  }
  
  /**
   * Score all 8 founder dimensions.
   * 
   * @param input - Founder analysis input
   * @returns Array of dimension scores
   */
  scoreAllDimensions(input: FounderAnalysisInput): DimensionScore[] {
    const scores: DimensionScore[] = [];
    
    for (const dimension of Object.values(FounderDimension)) {
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
   * @returns Dimension score
   */
  scoreDimension(dimension: FounderDimension, input: FounderAnalysisInput): DimensionScore {
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
      ? Math.max(...evidence.map(e => e.strength))
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
   * Extract evidence for a specific dimension.
   */
  private extractDimensionEvidence(
    dimension: FounderDimension,
    input: FounderAnalysisInput
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];
    
    // Extract from text inputs
    evidence.push(...this.extractFromText(dimension, input));
    
    // Extract from portfolio
    if (input.projectPortfolio) {
      evidence.push(...this.extractFromPortfolio(dimension, input.projectPortfolio));
    }
    
    // Extract from profile psychology
    evidence.push(...this.extractFromPsychology(dimension, input.profile));
    
    // Extract from explicit statements
    if (input.explicitStatements) {
      evidence.push(...this.extractFromExplicitStatements(dimension, input.explicitStatements));
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from text inputs using pattern matching.
   */
  private extractFromText(
    dimension: FounderDimension,
    input: FounderAnalysisInput
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];
    const patterns = DIMENSION_SIGNAL_PATTERNS[dimension];
    
    // Combine all text sources
    const textSources: { text: string; source: string }[] = [];
    
    if (input.userInput) {
      textSources.push({ text: input.userInput.toLowerCase(), source: 'user_input' });
    }
    
    if (input.experienceDescriptions) {
      input.experienceDescriptions.forEach((desc, idx) => {
        textSources.push({ text: desc.toLowerCase(), source: `experience_${idx}` });
      });
    }
    
    // Search for patterns
    for (const { text, source } of textSources) {
      for (const { patterns: keywords, strength: baseStrength } of patterns) {
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            // Calculate strength based on match quality
            const strength = this.calculateMatchStrength(text, keyword, baseStrength);
            
            evidence.push({
              id: this.generateEvidenceId(dimension, source),
              type: FounderEvidenceType.CROSS_RESPONSE_PATTERN,
              dimension,
              strength,
              description: `Pattern match: "${keyword}"`,
              source,
              rawValue: { keyword, context: text.substring(0, 100) },
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
   * Calculate match strength based on context and repetition.
   */
  private calculateMatchStrength(text: string, keyword: string, baseStrength: number): number {
    // Count occurrences
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const count = (text.match(regex) || []).length;
    
    // Boost for multiple mentions (diminishing returns)
    const repetitionBoost = Math.min((count - 1) * 0.1, 0.2);
    
    // Check for strong contextual words
    const strongContextWords = ['successfully', 'achieved', 'accomplished', 'delivered'];
    const hasStrongContext = strongContextWords.some(word => text.includes(word));
    const contextBoost = hasStrongContext ? 0.1 : 0;
    
    return Math.min(baseStrength + repetitionBoost + contextBoost, 1.0);
  }
  
  /**
   * Extract evidence from project portfolio.
   */
  private extractFromPortfolio(
    dimension: FounderDimension,
    portfolio: ProjectInfo[]
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];
    
    for (const project of portfolio) {
      switch (dimension) {
        case FounderDimension.OWNERSHIP_ORIENTATION:
          if (project.isProduct && project.hadUsers) {
            evidence.push({
              id: this.generateEvidenceId(dimension, project.name),
              type: FounderEvidenceType.PRODUCT_BUILDING_BEHAVIOR,
              dimension,
              strength: 0.8,
              description: `Built product "${project.name}" with actual users`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
          break;
          
        case FounderDimension.RESOURCEFULNESS:
          if (project.durationMonths > 0 && project.teamSize <= 2) {
            evidence.push({
              id: this.generateEvidenceId(dimension, project.name),
              type: FounderEvidenceType.RESOURCEFULNESS_EVIDENCE,
              dimension,
              strength: 0.7,
              description: `Built "${project.name}" with small team over ${project.durationMonths} months`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
          break;
          
        case FounderDimension.RESILIENCE:
          if (project.outcome === 'failed' || project.outcome === 'pivoted') {
            evidence.push({
              id: this.generateEvidenceId(dimension, project.name),
              type: FounderEvidenceType.RESILIENCE_EVIDENCE,
              dimension,
              strength: 0.75,
              description: `Experienced ${project.outcome} with "${project.name}" and continued`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
          break;
          
        case FounderDimension.TALENT_MAGNETISM:
          if (project.teamSize > 2) {
            evidence.push({
              id: this.generateEvidenceId(dimension, project.name),
              type: FounderEvidenceType.COLLABORATION_ATTRACTION,
              dimension,
              strength: 0.7,
              description: `Attracted ${project.teamSize} people to work on "${project.name}"`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
          break;
          
        case FounderDimension.SALES_CAPABILITY:
          if (project.hadRevenue) {
            evidence.push({
              id: this.generateEvidenceId(dimension, project.name),
              type: FounderEvidenceType.SALES_PERSUASION_EVIDENCE,
              dimension,
              strength: 0.85,
              description: `Generated revenue from "${project.name}"`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: false,
            });
          }
          break;
      }
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from psychological profile.
   */
  private extractFromPsychology(
    dimension: FounderDimension,
    profile: any
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];
    const psychology = profile.psychology;
    
    if (!psychology) return evidence;
    
    switch (dimension) {
      case FounderDimension.AMBIGUITY_TOLERANCE:
        // Openness correlates with ambiguity tolerance
        if (psychology.openness > 0.7) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology'),
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
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
        
      case FounderDimension.OBSESSION_CAPACITY:
        // Conscientiousness correlates with persistence
        if (psychology.conscientiousness > 0.7) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology'),
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
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
        
      case FounderDimension.RESILIENCE:
        // Low neuroticism correlates with resilience
        if (psychology.neuroticism < 0.4) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology'),
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
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
        
      case FounderDimension.TALENT_MAGNETISM:
        // Extraversion correlates with leadership
        if (psychology.extraversion > 0.6) {
          evidence.push({
            id: this.generateEvidenceId(dimension, 'psychology'),
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
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
    }
    
    return evidence;
  }
  
  /**
   * Extract evidence from explicit statements.
   */
  private extractFromExplicitStatements(
    dimension: FounderDimension,
    statements: string[]
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];
    
    // Check for explicit entrepreneurial statements
    if (dimension === FounderDimension.OWNERSHIP_ORIENTATION) {
      const founderIntentKeywords = ['want to start', 'build a company', 'found a startup', 'entrepreneur'];
      
      for (const statement of statements) {
        const lowerStatement = statement.toLowerCase();
        for (const keyword of founderIntentKeywords) {
          if (lowerStatement.includes(keyword)) {
            evidence.push({
              id: this.generateEvidenceId(dimension, 'explicit'),
              type: FounderEvidenceType.EXPLICIT_ENTREPRENEURIAL_STATEMENT,
              dimension,
              strength: 0.9,
              description: `Explicit entrepreneurial intent: "${statement.substring(0, 50)}..."`,
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
   * Calculate dimension score from evidence.
   */
  private calculateScoreFromEvidence(
    evidence: FounderEvidence[]
  ): { score: number; confidence: number } {
    // Filter weak evidence
    const validEvidence = evidence.filter(
      e => e.strength >= this.config.minEvidenceStrength
    );
    
    if (validEvidence.length === 0) {
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
    
    // Normalize
    const score = Math.min(weightedSum / (1 + weightedSum * 0.3), this.config.maxScore);
    
    // Calculate confidence based on evidence quantity and quality
    const evidenceCountConfidence = Math.min(validEvidence.length / 3, 0.5);
    const evidenceQualityConfidence = Math.max(...validEvidence.map(e => e.strength)) * 0.5;
    const confidence = Math.min(evidenceCountConfidence + evidenceQualityConfidence, 1);
    
    return { score, confidence };
  }
  
  /**
   * Generate explanation for a dimension score.
   */
  private generateDimensionExplanation(
    dimension: FounderDimension,
    score: number,
    evidence: FounderEvidence[]
  ): string {
    const dimensionLabel = dimension.replace(/_/g, ' ').toLowerCase();
    
    if (evidence.length === 0) {
      return `No strong evidence of ${dimensionLabel} found in the provided information.`;
    }
    
    const strength = score >= this.config.strengthThreshold ? 'strong' 
      : score >= this.config.developmentThreshold ? 'moderate' 
      : 'limited';
    
    const topEvidence = evidence
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2)
      .map(e => e.description)
      .join('; ');
    
    return `Shows ${strength} ${dimensionLabel} (${(score * 100).toFixed(0)}% score). Key indicators: ${topEvidence}.`;
  }
  
  /**
   * Generate unique evidence ID.
   */
  private generateEvidenceId(dimension: FounderDimension, source: string): string {
    return `${dimension}_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get top dimensions by score.
   */
  getTopDimensions(scores: DimensionScore[], count: number = 3): DimensionScore[] {
    return [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }
  
  /**
   * Get dimensions needing development.
   */
  getDevelopmentAreas(scores: DimensionScore[]): DimensionScore[] {
    return scores.filter(s => s.needsDevelopment);
  }
  
  /**
   * Calculate overall potential from dimension scores.
   */
  calculateOverallPotential(
    scores: DimensionScore[],
    weights?: Record<FounderDimension, number>
  ): number {
    const defaultWeights: Record<FounderDimension, number> = {
      [FounderDimension.OPPORTUNITY_RECOGNITION]: 1.0,
      [FounderDimension.OBSESSION_CAPACITY]: 1.0,
      [FounderDimension.RESOURCEFULNESS]: 0.9,
      [FounderDimension.AMBIGUITY_TOLERANCE]: 0.9,
      [FounderDimension.RESILIENCE]: 0.95,
      [FounderDimension.TALENT_MAGNETISM]: 0.85,
      [FounderDimension.SALES_CAPABILITY]: 0.9,
      [FounderDimension.OWNERSHIP_ORIENTATION]: 0.95,
    };
    
    const w = weights || defaultWeights;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const score of scores) {
      weightedSum += score.score * (w[score.dimension] || 1);
      totalWeight += (w[score.dimension] || 1);
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

/**
 * Factory function for creating dimension scoring engine.
 */
export function createDimensionScoringEngine(
  config?: Partial<DimensionScoringConfig>
): DimensionScoringEngine {
  return new DimensionScoringEngine(config);
}
