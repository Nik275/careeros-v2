/**
 * Identity Regret Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 3
 *
 * Detects when students repeatedly suppress their identity.
 * Identifies creative students forced into rigid paths,
 * entrepreneurial students avoiding risk, social students choosing isolation.
 *
 * Core philosophy: Humans often regret not expressing who they truly are.
 *
 * @module identity-regret-engine
 * @version 1.0.0
 */

import {
  IdentityRegretAnalysis,
  IdentityExpression,
  RegretDecisionOption,
  RegretStudentProfile,
  RegretDecisionContext,
  RegretSeverity,
} from './regret-types';

// ============================================================================
// IDENTITY PATTERNS
// ============================================================================

/**
 * Identity aspects and their characteristics
 */
const IDENTITY_PATTERNS: Record<string, {
  traits: string[];
  values: string[];
  incompatiblePaths: string[];
  compatiblePaths: string[];
}> = {
  'CREATIVE': {
    traits: ['artistic', 'imaginative', 'innovative', 'expressive', 'visual thinker'],
    values: ['self-expression', 'originality', 'aesthetics', 'freedom'],
    incompatiblePaths: ['rigid corporate', 'purely analytical', 'highly bureaucratic'],
    compatiblePaths: ['design', 'arts', 'marketing', 'content creation', 'product development'],
  },
  'ENTREPRENEURIAL': {
    traits: ['risk-taker', 'independent', 'opportunistic', 'visionary', 'self-starter'],
    values: ['autonomy', 'impact', 'wealth creation', 'innovation'],
    incompatiblePaths: ['bureaucratic', 'rigid hierarchy', 'slow-moving'],
    compatiblePaths: ['startups', 'consulting', 'investment', 'business development'],
  },
  'SOCIAL': {
    traits: ['extroverted', 'people-oriented', 'empathetic', 'collaborative', 'communicative'],
    values: ['connection', 'helping others', 'community', 'teamwork'],
    incompatiblePaths: ['isolated work', 'minimal human contact', 'individual contributor only'],
    compatiblePaths: ['teaching', 'counseling', 'sales', 'hr', 'customer success'],
  },
  'ANALYTICAL': {
    traits: ['logical', 'systematic', 'detail-oriented', 'intellectual', 'research-minded'],
    values: ['truth', 'accuracy', 'understanding', 'expertise'],
    incompatiblePaths: ['purely emotional', 'unstructured chaos', 'relationship-focused only'],
    compatiblePaths: ['research', 'data science', 'engineering', 'academia', 'finance'],
  },
  'ALTRUISTIC': {
    traits: ['helpful', 'compassionate', 'service-oriented', 'ethical', 'mission-driven'],
    values: ['helping others', 'social impact', 'ethics', 'meaning'],
    incompatiblePaths: ['profit-only', 'exploitative', 'socially neutral'],
    compatiblePaths: ['nonprofit', 'healthcare', 'education', 'social work', 'advocacy'],
  },
  'ADVENTUROUS': {
    traits: ['risk-tolerant', 'curious', 'restless', 'exploratory', 'novelty-seeking'],
    values: ['variety', 'excitement', 'growth', 'discovery'],
    incompatiblePaths: ['routine', 'repetitive', 'predictable', 'stable but stagnant'],
    compatiblePaths: ['travel', 'field work', 'startups', 'journalism', 'diplomacy'],
  },
  'LEADERSHIP': {
    traits: ['decisive', 'influential', 'strategic', 'responsible', 'visionary'],
    values: ['influence', 'responsibility', 'achievement', 'legacy'],
    incompatiblePaths: ['no growth potential', 'individual contributor only', 'flat hierarchy'],
    compatiblePaths: ['management', 'executive', 'politics', 'entrepreneurship'],
  },
};

// ============================================================================
// IDENTITY REGRET ENGINE
// ============================================================================

/**
 * Engine for detecting identity regret risks
 */
export class IdentityRegretEngine {
  /**
   * Analyze identity regret for a decision
   */
  analyzeIdentityRegret(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): IdentityRegretAnalysis {
    const identityExpressions = this.assessIdentityExpressions(selectedOption, studentProfile);
    const suppressedIdentities = this.identifySuppressedIdentities(identityExpressions);
    const identityAlignment = this.calculateIdentityAlignment(identityExpressions);
    const severity = this.determineSeverity(identityExpressions, suppressedIdentities, identityAlignment);

    return {
      hasIdentityRisk: suppressedIdentities.length > 0 || identityAlignment < 0.5,
      suppressedIdentities,
      identityExpressions,
      identityAlignment,
      severity,
      evidence: this.generateEvidence(identityExpressions, suppressedIdentities, identityAlignment),
      explanation: this.generateExplanation(suppressedIdentities, identityAlignment, severity),
      preventionPossible: true,
      identityRecoveryPath: this.generateRecoveryPath(suppressedIdentities, selectedOption),
    };
  }

  /**
   * Assess how well the decision expresses each identity aspect
   */
  private assessIdentityExpressions(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile
  ): IdentityExpression[] {
    const expressions: IdentityExpression[] = [];
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();

    for (const [identityAspect, pattern] of Object.entries(IDENTITY_PATTERNS)) {
      // Calculate current expression based on option match
      const currentExpression = this.calculateExpression(optionText, pattern.compatiblePaths, pattern.incompatiblePaths);
      
      // Calculate required expression based on personality traits and values
      const requiredExpression = this.calculateRequiredExpression(studentProfile, pattern);
      
      expressions.push({
        identityAspect,
        currentExpression,
        requiredExpression,
        gap: Math.max(0, requiredExpression - currentExpression),
        importance: requiredExpression,
      });
    }

    // Sort by gap (descending) to prioritize biggest mismatches
    return expressions.sort((a, b) => b.gap - a.gap);
  }

  /**
   * Calculate how well current option expresses an identity
   */
  private calculateExpression(
    optionText: string,
    compatiblePaths: string[],
    incompatiblePaths: string[]
  ): number {
    let score = 0.5; // Neutral baseline

    // Increase for compatible paths
    for (const path of compatiblePaths) {
      if (optionText.includes(path.toLowerCase())) {
        score += 0.15;
      }
    }

    // Decrease for incompatible paths
    for (const path of incompatiblePaths) {
      if (optionText.includes(path.toLowerCase())) {
        score -= 0.15;
      }
    }

    // Use identity expression score if available
    if (score === 0.5) {
      // No direct match found, use default
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate required expression based on student profile
   */
  private calculateRequiredExpression(
    studentProfile: RegretStudentProfile,
    pattern: { traits: string[]; values: string[] }
  ): number {
    let matches = 0;

    // Check personality traits
    for (const trait of pattern.traits) {
      if (studentProfile.personalityTraits?.some(t => 
        t.toLowerCase().includes(trait.toLowerCase()) ||
        trait.toLowerCase().includes(t.toLowerCase())
      )) {
        matches += 0.1;
      }
    }

    // Check values
    for (const value of pattern.values) {
      if (studentProfile.values.some(v => 
        v.toLowerCase().includes(value.toLowerCase()) ||
        value.toLowerCase().includes(v.toLowerCase())
      )) {
        matches += 0.1;
      }
    }

    // Check interests
    for (const trait of pattern.traits) {
      if (studentProfile.interests.some(i => 
        i.toLowerCase().includes(trait.toLowerCase()) ||
        trait.toLowerCase().includes(i.toLowerCase())
      )) {
        matches += 0.05;
      }
    }

    return Math.min(1, matches);
  }

  /**
   * Identify which identities are being suppressed
   */
  private identifySuppressedIdentities(expressions: IdentityExpression[]): string[] {
    return expressions
      .filter(e => e.gap > 0.3 && e.importance > 0.3)
      .map(e => e.identityAspect);
  }

  /**
   * Calculate overall identity alignment
   */
  private calculateIdentityAlignment(expressions: IdentityExpression[]): number {
    if (expressions.length === 0) return 0;

    const totalGap = expressions.reduce((sum, e) => sum + e.gap * e.importance, 0);
    const totalImportance = expressions.reduce((sum, e) => sum + e.importance, 0);

    if (totalImportance === 0) return 0.5;

    const weightedGap = totalGap / totalImportance;
    return Math.max(0, 1 - weightedGap);
  }

  /**
   * Determine regret severity
   */
  private determineSeverity(
    expressions: IdentityExpression[],
    suppressedIdentities: string[],
    identityAlignment: number
  ): RegretSeverity {
    let score = (1 - identityAlignment);

    if (suppressedIdentities.length > 0) {
      score += 0.1 * suppressedIdentities.length;
    }

    // Check for severe mismatches
    const severeMismatches = expressions.filter(e => e.gap > 0.6 && e.importance > 0.5);
    score += 0.15 * severeMismatches.length;

    if (score < 0.3) return 'MILD';
    if (score < 0.5) return 'MODERATE';
    if (score < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Generate evidence for analysis
   */
  private generateEvidence(
    expressions: IdentityExpression[],
    suppressedIdentities: string[],
    identityAlignment: number
  ): string[] {
    const evidence: string[] = [];

    if (suppressedIdentities.length > 0) {
      evidence.push(`Suppressed identities: ${suppressedIdentities.join(', ')}`);
    }

    const topMismatch = expressions[0];
    if (topMismatch && topMismatch.gap > 0.3) {
      evidence.push(`Largest identity gap: ${topMismatch.identityAspect} (${Math.round(topMismatch.gap * 100)}% gap)`);
    }

    evidence.push(`Overall identity alignment: ${Math.round(identityAlignment * 100)}%`);

    return evidence;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    suppressedIdentities: string[],
    identityAlignment: number,
    severity: RegretSeverity
  ): string {
    if (suppressedIdentities.length === 0 && identityAlignment > 0.7) {
      return 'Your current path aligns well with your identity. Low identity regret risk.';
    }

    let explanation = '';

    if (suppressedIdentities.length > 0) {
      explanation += `Your choice appears to suppress ${suppressedIdentities.length === 1 ? 'an aspect' : 'aspects'} of who you are. `;
      explanation += `Specifically, your ${suppressedIdentities[0].toLowerCase()} identity may not find expression in this path. `;
    } else if (identityAlignment < 0.5) {
      explanation += 'Your current path shows limited alignment with your core identity. ';
    }

    const severityDescriptions: Record<RegretSeverity, string> = {
      'MILD': 'This represents a mild identity tension.',
      'MODERATE': 'This represents a moderate identity gap that may cause dissatisfaction over time.',
      'SIGNIFICANT': 'This represents a significant identity suppression that could lead to lasting regret.',
      'SEVERE': 'This represents a severe identity mismatch with high potential for profound regret.',
      'PROFOUND': 'This represents a profound identity suppression that may fundamentally affect your well-being.',
    };

    explanation += severityDescriptions[severity];

    return explanation;
  }

  /**
   * Generate recovery path for suppressed identities
   */
  private generateRecoveryPath(
    suppressedIdentities: string[],
    selectedOption: RegretDecisionOption
  ): string[] {
    const recoveryPath: string[] = [];

    for (const identity of suppressedIdentities) {
      const pattern = IDENTITY_PATTERNS[identity];
      if (pattern) {
        recoveryPath.push(`Find ways to express your ${identity.toLowerCase()} side through ${pattern.compatiblePaths[0]}`);
      }
    }

    recoveryPath.push('Identify aspects of your current path where your identity can still emerge');
    recoveryPath.push('Consider side projects or hobbies that honor your suppressed identity');
    recoveryPath.push('Connect with communities that share your authentic identity');

    return recoveryPath;
  }

  /**
   * Quick identity check
   */
  quickIdentityCheck(
    personalityTraits: string[],
    values: string[],
    currentPath: string
  ): {
    hasIdentityRisk: boolean;
    suppressedAspect: string | null;
    alignment: number;
    severity: RegretSeverity;
    advice: string;
  } {
    const mockOption: RegretDecisionOption = {
      id: 'quick-check',
      name: currentPath,
      description: currentPath,
      type: 'OTHER',
      motivations: ['INTRINSIC'],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const mockProfile: RegretStudentProfile = {
      currentEducation: 'Unknown',
      interests: [],
      strengths: [],
      values,
      personalityTraits,
      previousChoices: [],
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures: [],
    };

    const result = this.analyzeIdentityRegret(mockOption, mockProfile, mockContext);

    return {
      hasIdentityRisk: result.hasIdentityRisk,
      suppressedAspect: result.suppressedIdentities[0] || null,
      alignment: result.identityAlignment,
      severity: result.severity,
      advice: result.identityRecoveryPath[0] || 'Continue expressing your authentic self',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an identity regret engine
 */
export function createIdentityRegretEngine(): IdentityRegretEngine {
  return new IdentityRegretEngine();
}

/**
 * Analyze identity regret directly
 */
export function analyzeIdentityRegret(
  selectedOption: RegretDecisionOption,
  studentProfile: RegretStudentProfile,
  context: RegretDecisionContext
): IdentityRegretAnalysis {
  const engine = createIdentityRegretEngine();
  return engine.analyzeIdentityRegret(selectedOption, studentProfile, context);
}
