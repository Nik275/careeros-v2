/**
 * Fear-Driven Regret Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 5
 *
 * Detects decisions motivated primarily by fear:
 * - fear of failure
 * - fear of judgment
 * - fear of uncertainty
 * - fear of disappointing family
 *
 * Core philosophy: Decisions made from fear often lead to regret
 * because they prioritize avoiding pain over pursuing growth.
 *
 * @module fear-driven-regret-engine
 * @version 1.0.0
 */

import {
  FearDrivenRegretAnalysis,
  FearFactor,
  RegretDecisionOption,
  RegretStudentProfile,
  RegretDecisionContext,
  RegretSeverity,
} from './regret-types';

// ============================================================================
// FEAR PATTERNS
// ============================================================================

/**
 * Types of fear and their characteristics
 */
const FEAR_PATTERNS: Record<string, {
  indicators: string[];
  decisionMarkers: string[];
  typicalImpact: number;
  rationality: 'RATIONAL' | 'MIXED' | 'IRRATIONAL';
}> = {
  'FAILURE': {
    indicators: ['fear of failing', 'scared of failing', 'afraid to fail', 'fear of failure', 'what if I fail'],
    decisionMarkers: ['safe choice', 'proven path', 'lower risk', 'guaranteed outcome'],
    typicalImpact: 0.8,
    rationality: 'MIXED',
  },
  'JUDGMENT': {
    indicators: ['fear of judgment', 'what will people think', 'afraid of criticism', 'fear of rejection', 'scared of embarrassment'],
    decisionMarkers: ['prestigious', 'respectable', 'impressive', 'what parents want'],
    typicalImpact: 0.7,
    rationality: 'IRRATIONAL',
  },
  'UNCERTAINTY': {
    indicators: ['fear of unknown', 'need certainty', 'afraid of ambiguity', 'fear of change', 'uncomfortable with uncertainty'],
    decisionMarkers: ['clear path', 'defined outcome', 'predictable', 'stable'],
    typicalImpact: 0.6,
    rationality: 'MIXED',
  },
  'DISAPPOINTING_FAMILY': {
    indicators: ['fear of disappointing parents', 'family expectations', 'don\'t want to let down', 'parental pressure'],
    decisionMarkers: ['parents approve', 'family tradition', 'expected path', 'parental wishes'],
    typicalImpact: 0.75,
    rationality: 'MIXED',
  },
  'FINANCIAL': {
    indicators: ['fear of poverty', 'financial insecurity', 'scared of being poor', 'money worries'],
    decisionMarkers: ['high salary', 'financially secure', 'good money', 'pays well'],
    typicalImpact: 0.7,
    rationality: 'RATIONAL',
  },
  'WASTING_TIME': {
    indicators: ['fear of wasting time', 'falling behind', 'losing time', 'too old'],
    decisionMarkers: ['fast track', 'quick path', 'efficient', 'no detours'],
    typicalImpact: 0.5,
    rationality: 'MIXED',
  },
};

// ============================================================================
// FEAR-DRIVEN REGRET ENGINE
// ============================================================================

/**
 * Engine for detecting fear-driven decision patterns
 */
export class FearDrivenRegretEngine {
  /**
   * Analyze fear-driven regret for a decision
   */
  analyzeFearDrivenRegret(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): FearDrivenRegretAnalysis {
    const fearFactors = this.identifyFearFactors(selectedOption, studentProfile, context);
    const fearInfluenceScore = this.calculateFearInfluenceScore(fearFactors, selectedOption);
    const severity = this.determineSeverity(fearFactors, fearInfluenceScore);

    return {
      hasFearRisk: fearFactors.length > 0 || fearInfluenceScore > 0.4,
      dominantFears: fearFactors.slice(0, 3),
      fearInfluenceScore,
      severity,
      evidence: this.generateEvidence(fearFactors, fearInfluenceScore),
      explanation: this.generateExplanation(fearFactors, fearInfluenceScore, severity),
      preventionPossible: true,
      fearMitigationStrategies: this.generateMitigationStrategies(fearFactors),
    };
  }

  /**
   * Identify fear factors in the decision
   */
  private identifyFearFactors(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): FearFactor[] {
    const fears: FearFactor[] = [];

    // Check for explicit fear factors in student profile
    if (studentProfile.fearFactors) {
      for (const fear of studentProfile.fearFactors) {
        const matchedPattern = this.matchFearPattern(fear);
        if (matchedPattern) {
          fears.push({
            fearType: matchedPattern.type,
            intensity: 0.7,
            impactOnDecision: 0.6,
            rationality: matchedPattern.rationality,
          });
        }
      }
    }

    // Analyze decision option for fear markers
    for (const [fearType, pattern] of Object.entries(FEAR_PATTERNS)) {
      const intensity = this.assessFearIntensity(selectedOption, pattern);
      
      if (intensity > 0.3) {
        fears.push({
          fearType,
          intensity,
          impactOnDecision: this.assessDecisionImpact(selectedOption, pattern),
          rationality: pattern.rationality,
        });
      }
    }

    // Check motivations
    if (selectedOption.motivations.includes('FEAR_DRIVEN')) {
      fears.push({
        fearType: 'GENERAL',
        intensity: 0.8,
        impactOnDecision: 0.7,
        rationality: 'MIXED',
      });
    }

    // Check fear factors in option
    if (selectedOption.fearFactors) {
      for (const fear of selectedOption.fearFactors) {
        const matchedPattern = this.matchFearPattern(fear);
        if (matchedPattern && !fears.some(f => f.fearType === matchedPattern.type)) {
          fears.push({
            fearType: matchedPattern.type,
            intensity: 0.7,
            impactOnDecision: 0.6,
            rationality: matchedPattern.rationality,
          });
        }
      }
    }

    // Sort by impact
    return fears.sort((a, b) => b.impactOnDecision - a.impactOnDecision);
  }

  /**
   * Match fear text to known patterns
   */
  private matchFearPattern(fearText: string): { type: string; rationality: 'RATIONAL' | 'MIXED' | 'IRRATIONAL' } | null {
    const fearLower = fearText.toLowerCase();

    for (const [fearType, pattern] of Object.entries(FEAR_PATTERNS)) {
      for (const indicator of pattern.indicators) {
        if (fearLower.includes(indicator.toLowerCase()) || indicator.toLowerCase().includes(fearLower)) {
          return { type: fearType, rationality: pattern.rationality };
        }
      }
    }

    return null;
  }

  /**
   * Assess fear intensity from decision markers
   */
  private assessFearIntensity(
    selectedOption: RegretDecisionOption,
    pattern: { decisionMarkers: string[] }
  ): number {
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
    let matches = 0;

    for (const marker of pattern.decisionMarkers) {
      if (optionText.includes(marker.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(1, matches / pattern.decisionMarkers.length + 0.2);
  }

  /**
   * Assess how much fear is impacting the decision
   */
  private assessDecisionImpact(
    selectedOption: RegretDecisionOption,
    pattern: { indicators: string[]; decisionMarkers: string[] }
  ): number {
    let impact = 0.3; // Baseline

    // Increase impact if decision markers are present
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
    for (const marker of pattern.decisionMarkers) {
      if (optionText.includes(marker.toLowerCase())) {
        impact += 0.2;
      }
    }

    // Decrease impact if intrinsic motivation is high
    if (selectedOption.motivations.includes('INTRINSIC')) {
      impact -= 0.15;
    }

    return Math.min(1, Math.max(0, impact));
  }

  /**
   * Calculate overall fear influence score
   */
  private calculateFearInfluenceScore(fearFactors: FearFactor[], selectedOption: RegretDecisionOption): number {
    if (fearFactors.length === 0) return 0;

    const weightedSum = fearFactors.reduce((sum, fear) => {
      return sum + (fear.intensity * fear.impactOnDecision);
    }, 0);

    const baseScore = weightedSum / Math.max(1, fearFactors.length);

    // Adjust based on alignment
    const alignmentBonus = (1 - selectedOption.alignmentWithInterests) * 0.2;
    
    return Math.min(1, baseScore + alignmentBonus);
  }

  /**
   * Determine regret severity
   */
  private determineSeverity(fearFactors: FearFactor[], fearInfluenceScore: number): RegretSeverity {
    let score = fearInfluenceScore;

    // Increase severity for irrational fears
    const irrationalFears = fearFactors.filter(f => f.rationality === 'IRRATIONAL');
    score += irrationalFears.length * 0.05;

    // Increase severity for high-impact fears
    const highImpactFears = fearFactors.filter(f => f.impactOnDecision > 0.6);
    score += highImpactFears.length * 0.05;

    if (score < 0.3) return 'MILD';
    if (score < 0.5) return 'MODERATE';
    if (score < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Generate evidence for analysis
   */
  private generateEvidence(fearFactors: FearFactor[], fearInfluenceScore: number): string[] {
    const evidence: string[] = [];

    if (fearFactors.length > 0) {
      evidence.push(`Identified ${fearFactors.length} fear factor${fearFactors.length === 1 ? '' : 's'} influencing decision`);
      
      const topFear = fearFactors[0];
      evidence.push(`Primary fear: ${topFear.fearType} (${Math.round(topFear.intensity * 100)}% intensity, ${topFear.rationality.toLowerCase()})`);
      
      const irrationalFears = fearFactors.filter(f => f.rationality === 'IRRATIONAL');
      if (irrationalFears.length > 0) {
        evidence.push(`${irrationalFears.length} fear${irrationalFears.length === 1 ? '' : 's'} appear to be irrational`);
      }
    }

    evidence.push(`Fear influence score: ${Math.round(fearInfluenceScore * 100)}%`);

    return evidence;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    fearFactors: FearFactor[],
    fearInfluenceScore: number,
    severity: RegretSeverity
  ): string {
    if (fearFactors.length === 0) {
      return 'No significant fear factors detected in this decision. The choice appears to be driven by positive motivations.';
    }

    let explanation = '';

    const topFear = fearFactors[0];
    explanation += `This decision appears to be influenced by ${topFear.fearType.toLowerCase().replace('_', ' ')}. `;

    if (fearFactors.length > 1) {
      explanation += `Additional fears include ${fearFactors.slice(1).map(f => f.fearType.toLowerCase().replace('_', ' ')).join(', ')}. `;
    }

    if (topFear.rationality === 'IRRATIONAL') {
      explanation += 'This fear may not be grounded in realistic assessment of the situation. ';
    } else if (topFear.rationality === 'RATIONAL') {
      explanation += 'While this fear has some rational basis, it may be overly influencing your decision. ';
    }

    const severityDescriptions: Record<RegretSeverity, string> = {
      'MILD': 'This represents a mild fear influence.',
      'MODERATE': 'This represents a moderate fear influence worth examining.',
      'SIGNIFICANT': 'This represents a significant fear influence that may lead to regret.',
      'SEVERE': 'This represents a severe fear influence with high potential for regret.',
      'PROFOUND': 'This represents a profound fear influence that may fundamentally limit your choices.',
    };

    explanation += severityDescriptions[severity];
    explanation += ' Decisions driven primarily by fear often prioritize avoiding pain over pursuing growth, which can lead to long-term regret.';

    return explanation;
  }

  /**
   * Generate fear mitigation strategies
   */
  private generateMitigationStrategies(fearFactors: FearFactor[]): string[] {
    const strategies: string[] = [];

    for (const fear of fearFactors.slice(0, 2)) {
      switch (fear.fearType) {
        case 'FAILURE':
          strategies.push('Reframe failure as learning and growth rather than an endpoint');
          strategies.push('Research people who failed before succeeding in your area of interest');
          break;
        case 'JUDGMENT':
          strategies.push('Ask yourself: "Whose opinion will matter in 10 years?"');
          strategies.push('Connect with people who made unconventional choices and thrived');
          break;
        case 'UNCERTAINTY':
          strategies.push('Practice tolerating small uncertainties to build comfort');
          strategies.push('Remember that no path is truly certain - stability is often an illusion');
          break;
        case 'DISAPPOINTING_FAMILY':
          strategies.push('Have an honest conversation with family about your true aspirations');
          strategies.push('Distinguish between disappointing family and disappointing family expectations');
          break;
        case 'FINANCIAL':
          strategies.push('Create a financial safety net to reduce fear of instability');
          strategies.push('Research financial outcomes of people in paths you are considering');
          break;
        case 'WASTING_TIME':
          strategies.push('Consider that "wasted time" on the wrong path is costlier than exploration');
          strategies.push('Remember that many successful people took non-linear paths');
          break;
      }
    }

    // General strategies
    strategies.push('Ask: "What would I choose if I knew I could not fail?"');
    strategies.push('Visualize yourself 10 years from now - what would you regret more?');
    strategies.push('Consider talking to a counselor or trusted mentor about your fears');

    return strategies;
  }

  /**
   * Quick fear check
   */
  quickFearCheck(
    decisionDescription: string,
    fearFactors: string[]
  ): {
    hasFearRisk: boolean;
    dominantFear: string | null;
    fearScore: number;
    severity: RegretSeverity;
    advice: string;
  } {
    const mockOption: RegretDecisionOption = {
      id: 'quick-check',
      name: decisionDescription,
      description: decisionDescription,
      type: 'OTHER',
      motivations: fearFactors.length > 0 ? ['FEAR_DRIVEN'] : ['INTRINSIC'],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      fearFactors,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const mockProfile: RegretStudentProfile = {
      currentEducation: 'Unknown',
      interests: [],
      strengths: [],
      values: [],
      fearFactors,
      previousChoices: [],
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures: [],
    };

    const result = this.analyzeFearDrivenRegret(mockOption, mockProfile, mockContext);

    return {
      hasFearRisk: result.hasFearRisk,
      dominantFear: result.dominantFears[0]?.fearType || null,
      fearScore: result.fearInfluenceScore,
      severity: result.severity,
      advice: result.fearMitigationStrategies[0] || 'Examine your motivations carefully',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a fear-driven regret engine
 */
export function createFearDrivenRegretEngine(): FearDrivenRegretEngine {
  return new FearDrivenRegretEngine();
}

/**
 * Analyze fear-driven regret directly
 */
export function analyzeFearDrivenRegret(
  selectedOption: RegretDecisionOption,
  studentProfile: RegretStudentProfile,
  context: RegretDecisionContext
): FearDrivenRegretAnalysis {
  const engine = createFearDrivenRegretEngine();
  return engine.analyzeFearDrivenRegret(selectedOption, studentProfile, context);
}
