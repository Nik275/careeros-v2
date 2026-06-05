/**
 * Approval-Driven Regret Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 6
 *
 * Detects choices made for external validation:
 * - prestige
 * - status
 * - parental approval
 * - social comparison
 *
 * Core philosophy: Decisions made for approval often lead to regret
 * because they prioritize others' expectations over authentic self-expression.
 *
 * @module approval-driven-regret-engine
 * @version 1.0.0
 */

import {
  ApprovalDrivenRegretAnalysis,
  ApprovalSource,
  RegretDecisionOption,
  RegretStudentProfile,
  RegretDecisionContext,
  RegretSeverity,
} from './regret-types';

// ============================================================================
// APPROVAL PATTERNS
// ============================================================================

/**
 * Types of approval sources and their characteristics
 */
const APPROVAL_PATTERNS: Record<string, {
  indicators: string[];
  decisionMarkers: string[];
  typicalInfluence: number;
  alignmentRisk: 'LOW' | 'MODERATE' | 'HIGH';
}> = {
  'PRESTIGE': {
    indicators: ['want prestige', 'status matters', 'impressive title', 'bragging rights', 'reputation focused'],
    decisionMarkers: ['prestigious', 'top-tier', 'elite', 'high-status', 'respectable'],
    typicalInfluence: 0.7,
    alignmentRisk: 'HIGH',
  },
  'PARENTAL': {
    indicators: ['parents want', 'family tradition', 'dad said', 'mom expects', 'family pressure'],
    decisionMarkers: ['parents approve', 'family business', 'traditional', 'expected path'],
    typicalInfluence: 0.8,
    alignmentRisk: 'MODERATE',
  },
  'SOCIAL_COMPARISON': {
    indicators: ['friends are doing', 'peer pressure', 'keeping up', 'everyone is', 'social expectations'],
    decisionMarkers: ['popular choice', 'everyone does', 'trendy', 'in-demand'],
    typicalInfluence: 0.6,
    alignmentRisk: 'HIGH',
  },
  'SOCIETAL': {
    indicators: ['society expects', 'cultural norm', 'what people think', 'social status', 'conventional'],
    decisionMarkers: ['conventional', 'traditional', 'safe choice', 'respectable profession'],
    typicalInfluence: 0.65,
    alignmentRisk: 'MODERATE',
  },
  'EXPERT_VALIDATION': {
    indicators: ['experts recommend', 'counselor said', 'advisor suggested', 'professional opinion'],
    decisionMarkers: ['recommended by', 'expert-approved', 'professional standard'],
    typicalInfluence: 0.5,
    alignmentRisk: 'LOW',
  },
};

/**
 * High-prestige paths that may not align with interests
 */
const PRESTIGE_PATHS: string[] = [
  'medicine', 'mbbs', 'doctor', 'engineering', 'iit', 'mba', 'law', 'civil services', 
  'upsc', 'investment banking', 'consulting', 'mckinsey', 'bcg', 'bain'
];

// ============================================================================
// APPROVAL-DRIVEN REGRET ENGINE
// ============================================================================

/**
 * Engine for detecting approval-driven decision patterns
 */
export class ApprovalDrivenRegretEngine {
  /**
   * Analyze approval-driven regret for a decision
   */
  analyzeApprovalDrivenRegret(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): ApprovalDrivenRegretAnalysis {
    const approvalSources = this.identifyApprovalSources(selectedOption, studentProfile, context);
    const externalInfluenceScore = this.calculateExternalInfluenceScore(approvalSources);
    const authenticityGap = this.calculateAuthenticityGap(selectedOption, studentProfile, approvalSources);
    const severity = this.determineSeverity(approvalSources, externalInfluenceScore, authenticityGap);

    return {
      hasApprovalRisk: approvalSources.length > 0 || externalInfluenceScore > 0.4,
      approvalSources,
      externalInfluenceScore,
      authenticityGap,
      severity,
      evidence: this.generateEvidence(approvalSources, externalInfluenceScore, authenticityGap),
      explanation: this.generateExplanation(approvalSources, authenticityGap, severity),
      preventionPossible: true,
      authenticityRecoverySteps: this.generateRecoverySteps(approvalSources),
    };
  }

  /**
   * Identify sources of external approval driving the decision
   */
  private identifyApprovalSources(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): ApprovalSource[] {
    const sources: ApprovalSource[] = [];
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();

    // Check for explicit family expectations
    if (studentProfile.familyExpectations && studentProfile.familyExpectations.length > 0) {
      for (const expectation of studentProfile.familyExpectations) {
        const influence = this.assessFamilyExpectationInfluence(expectation, selectedOption);
        sources.push({
          sourceType: 'FAMILY',
          sourceName: 'Family',
          influenceLevel: influence,
          alignmentWithSelf: selectedOption.alignmentWithValues,
        });
      }
    }

    // Check for social pressures
    if (studentProfile.socialPressures && studentProfile.socialPressures.length > 0) {
      for (const pressure of studentProfile.socialPressures) {
        const influence = this.assessSocialPressureInfluence(pressure, selectedOption);
        if (influence > 0.3) {
          sources.push({
            sourceType: 'SOCIAL',
            sourceName: 'Peers/Society',
            influenceLevel: influence,
            alignmentWithSelf: selectedOption.alignmentWithValues,
          });
        }
      }
    }

    // Check external pressures from context
    for (const pressure of context.externalPressures) {
      const matchedPattern = this.matchApprovalPattern(pressure);
      if (matchedPattern) {
        sources.push({
          sourceType: matchedPattern.type,
          sourceName: matchedPattern.type,
          influenceLevel: 0.6,
          alignmentWithSelf: selectedOption.alignmentWithValues,
        });
      }
    }

    // Check approval factors in option
    if (selectedOption.approvalFactors) {
      for (const factor of selectedOption.approvalFactors) {
        const matchedPattern = this.matchApprovalPattern(factor);
        if (matchedPattern && !sources.some(s => s.sourceType === matchedPattern.type)) {
          sources.push({
            sourceType: matchedPattern.type,
            sourceName: matchedPattern.type,
            influenceLevel: 0.7,
            alignmentWithSelf: selectedOption.alignmentWithValues,
          });
        }
      }
    }

    // Analyze option for approval markers
    for (const [approvalType, pattern] of Object.entries(APPROVAL_PATTERNS)) {
      const influence = this.assessApprovalInfluence(optionText, pattern);
      
      if (influence > 0.3 && !sources.some(s => s.sourceType === approvalType)) {
        sources.push({
          sourceType: approvalType,
          sourceName: approvalType,
          influenceLevel: influence,
          alignmentWithSelf: selectedOption.alignmentWithValues,
        });
      }
    }

    // Check if path is high-prestige but low alignment
    if (this.isHighPrestigePath(selectedOption) && selectedOption.alignmentWithInterests < 0.5) {
      sources.push({
        sourceType: 'PRESTIGE',
        sourceName: 'Prestige/Status',
        influenceLevel: 0.7,
        alignmentWithSelf: selectedOption.alignmentWithValues,
      });
    }

    // Sort by influence level
    return sources.sort((a, b) => b.influenceLevel - a.influenceLevel);
  }

  /**
   * Match approval text to known patterns
   */
  private matchApprovalPattern(approvalText: string): { type: string } | null {
    const textLower = approvalText.toLowerCase();

    for (const [approvalType, pattern] of Object.entries(APPROVAL_PATTERNS)) {
      for (const indicator of pattern.indicators) {
        if (textLower.includes(indicator.toLowerCase())) {
          return { type: approvalType };
        }
      }
    }

    return null;
  }

  /**
   * Assess family expectation influence
   */
  private assessFamilyExpectationInfluence(
    expectation: string,
    selectedOption: RegretDecisionOption
  ): number {
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
    const expectationLower = expectation.toLowerCase();

    // High influence if option matches expectation
    if (optionText.includes(expectationLower) || expectationLower.includes(optionText)) {
      return 0.8;
    }

    return 0.5;
  }

  /**
   * Assess social pressure influence
   */
  private assessSocialPressureInfluence(
    pressure: string,
    selectedOption: RegretDecisionOption
  ): number {
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
    const pressureLower = pressure.toLowerCase();

    if (optionText.includes(pressureLower)) {
      return 0.7;
    }

    return 0.4;
  }

  /**
   * Assess approval influence from decision markers
   */
  private assessApprovalInfluence(
    optionText: string,
    pattern: { decisionMarkers: string[] }
  ): number {
    let matches = 0;

    for (const marker of pattern.decisionMarkers) {
      if (optionText.includes(marker.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(1, matches * 0.25 + 0.2);
  }

  /**
   * Check if option is a high-prestige path
   */
  private isHighPrestigePath(selectedOption: RegretDecisionOption): boolean {
    const optionLower = selectedOption.name.toLowerCase();
    return PRESTIGE_PATHS.some(path => optionLower.includes(path));
  }

  /**
   * Calculate external influence score
   */
  private calculateExternalInfluenceScore(approvalSources: ApprovalSource[]): number {
    if (approvalSources.length === 0) return 0;

    const weightedSum = approvalSources.reduce((sum, source) => {
      return sum + source.influenceLevel;
    }, 0);

    return Math.min(1, weightedSum / approvalSources.length);
  }

  /**
   * Calculate authenticity gap
   */
  private calculateAuthenticityGap(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    approvalSources: ApprovalSource[]
  ): number {
    // High gap when external influence is high but personal alignment is low
    const externalInfluence = this.calculateExternalInfluenceScore(approvalSources);
    const personalAlignment = (selectedOption.alignmentWithInterests + selectedOption.alignmentWithValues) / 2;

    const gap = externalInfluence * (1 - personalAlignment);
    
    return Math.min(1, gap);
  }

  /**
   * Determine regret severity
   */
  private determineSeverity(
    approvalSources: ApprovalSource[],
    externalInfluenceScore: number,
    authenticityGap: number
  ): RegretSeverity {
    let score = externalInfluenceScore * 0.5 + authenticityGap * 0.5;

    // Increase severity for multiple approval sources
    if (approvalSources.length > 2) {
      score += 0.1;
    }

    // Increase severity for high-prestige, low-alignment combinations
    const prestigeSources = approvalSources.filter(s => s.sourceType === 'PRESTIGE');
    if (prestigeSources.length > 0 && authenticityGap > 0.5) {
      score += 0.15;
    }

    if (score < 0.3) return 'MILD';
    if (score < 0.5) return 'MODERATE';
    if (score < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Generate evidence for analysis
   */
  private generateEvidence(
    approvalSources: ApprovalSource[],
    externalInfluenceScore: number,
    authenticityGap: number
  ): string[] {
    const evidence: string[] = [];

    if (approvalSources.length > 0) {
      evidence.push(`Identified ${approvalSources.length} external approval source${approvalSources.length === 1 ? '' : 's'}`);
      
      const topSource = approvalSources[0];
      evidence.push(`Primary influence: ${topSource.sourceName} (${Math.round(topSource.influenceLevel * 100)}% influence)`);
      
      const misalignedSources = approvalSources.filter(s => s.alignmentWithSelf < 0.4);
      if (misalignedSources.length > 0) {
        evidence.push(`${misalignedSources.length} approval source${misalignedSources.length === 1 ? '' : 's'} are misaligned with personal values`);
      }
    }

    evidence.push(`External influence score: ${Math.round(externalInfluenceScore * 100)}%`);
    evidence.push(`Authenticity gap: ${Math.round(authenticityGap * 100)}%`);

    return evidence;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    approvalSources: ApprovalSource[],
    authenticityGap: number,
    severity: RegretSeverity
  ): string {
    if (approvalSources.length === 0) {
      return 'This decision appears to be driven primarily by your own values and interests, with minimal external influence. Low approval-seeking regret risk.';
    }

    let explanation = '';

    const topSource = approvalSources[0];
    explanation += `This decision appears to be influenced by ${topSource.sourceName.toLowerCase().replace('_', ' ')}. `;

    if (approvalSources.length > 1) {
      explanation += `Additional influences include ${approvalSources.slice(1).map(s => s.sourceName.toLowerCase().replace('_', ' ')).join(', ')}. `;
    }

    if (authenticityGap > 0.5) {
      explanation += 'There is a significant gap between what others expect and what you may truly want. ';
    }

    const severityDescriptions: Record<RegretSeverity, string> = {
      'MILD': 'This represents a mild external influence.',
      'MODERATE': 'This represents a moderate external influence worth examining.',
      'SIGNIFICANT': 'This represents a significant external influence that may lead to regret.',
      'SEVERE': 'This represents a severe external influence with high potential for regret.',
      'PROFOUND': 'This represents a profound external influence that may fundamentally compromise your authenticity.',
    };

    explanation += severityDescriptions[severity];
    explanation += ' Decisions made primarily for approval often lead to regret because they prioritize others expectations over your authentic path.';

    return explanation;
  }

  /**
   * Generate authenticity recovery steps
   */
  private generateRecoverySteps(approvalSources: ApprovalSource[]): string[] {
    const steps: string[] = [];

    for (const source of approvalSources.slice(0, 2)) {
      switch (source.sourceType) {
        case 'PARENTAL':
          steps.push('Have an honest conversation with family about what you truly want');
          steps.push('Distinguish between respecting parents and obeying their wishes for your life');
          break;
        case 'PRESTIGE':
          steps.push('Ask yourself: "Would I choose this if no one ever knew what I did?"');
          steps.push('Consider that prestige fades but fulfillment endures');
          break;
        case 'SOCIAL_COMPARISON':
          steps.push('Remember that you are comparing your behind-the-scenes to others highlight reels');
          steps.push('Consider that the people you compare yourself to may have their own regrets');
          break;
        case 'SOCIETAL':
          steps.push('Question which societal expectations actually matter to you personally');
          steps.push('Find examples of people who defied conventions and thrived');
          break;
      }
    }

    // General recovery steps
    steps.push('Journal about what you would choose if no one else\'s opinion mattered');
    steps.push('Identify which parts of your decision are truly yours vs. borrowed from others');
    steps.push('Talk to someone who made authentic choices despite external pressure');

    return steps;
  }

  /**
   * Quick approval check
   */
  quickApprovalCheck(
    decisionDescription: string,
    externalPressures: string[]
  ): {
    hasApprovalRisk: boolean;
    primarySource: string | null;
    authenticityGap: number;
    severity: RegretSeverity;
    advice: string;
  } {
    const mockOption: RegretDecisionOption = {
      id: 'quick-check',
      name: decisionDescription,
      description: decisionDescription,
      type: 'OTHER',
      motivations: externalPressures.length > 0 ? ['APPROVAL_SEEKING'] : ['INTRINSIC'],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      approvalFactors: externalPressures,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const mockProfile: RegretStudentProfile = {
      currentEducation: 'Unknown',
      interests: [],
      strengths: [],
      values: [],
      previousChoices: [],
      familyExpectations: externalPressures,
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures,
    };

    const result = this.analyzeApprovalDrivenRegret(mockOption, mockProfile, mockContext);

    return {
      hasApprovalRisk: result.hasApprovalRisk,
      primarySource: result.approvalSources[0]?.sourceType || null,
      authenticityGap: result.authenticityGap,
      severity: result.severity,
      advice: result.authenticityRecoverySteps[0] || 'Reflect on your true desires',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an approval-driven regret engine
 */
export function createApprovalDrivenRegretEngine(): ApprovalDrivenRegretEngine {
  return new ApprovalDrivenRegretEngine();
}

/**
 * Analyze approval-driven regret directly
 */
export function analyzeApprovalDrivenRegret(
  selectedOption: RegretDecisionOption,
  studentProfile: RegretStudentProfile,
  context: RegretDecisionContext
): ApprovalDrivenRegretAnalysis {
  const engine = createApprovalDrivenRegretEngine();
  return engine.analyzeApprovalDrivenRegret(selectedOption, studentProfile, context);
}
