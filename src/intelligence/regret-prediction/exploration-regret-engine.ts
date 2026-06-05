/**
 * Exploration Regret Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 2
 *
 * Detects paths never explored by students.
 * Identifies when students suppress genuine interests.
 * Helps prevent "what if" regrets.
 *
 * Core philosophy: Humans often regret paths never explored
 * more than paths attempted and failed.
 *
 * @module exploration-regret-engine
 * @version 1.0.0
 */

import {
  ExplorationRegretAnalysis,
  RegretDecisionOption,
  RegretStudentProfile,
  RegretDecisionContext,
  UnexploredPath,
  RegretSeverity,
} from './regret-types';

// ============================================================================
// KNOWN PATH PATTERNS
// ============================================================================

/**
 * Path types with their exploration characteristics
 */
const PATH_PATTERNS: Record<string, {
  relatedInterests: string[];
  explorationBarriers: string[];
  recoverability: 'EASY' | 'MODERATE' | 'DIFFICULT';
}> = {
  'DESIGN': {
    relatedInterests: ['art', 'creativity', 'visual', 'aesthetics', 'user experience', 'fashion'],
    explorationBarriers: ['lack of portfolio', 'no formal training', 'parental pressure', 'financial concerns'],
    recoverability: 'MODERATE',
  },
  'ENTREPRENEURSHIP': {
    relatedInterests: ['business', 'innovation', 'leadership', 'risk-taking', 'independence'],
    explorationBarriers: ['fear of failure', 'financial risk', 'lack of support', 'social pressure'],
    recoverability: 'EASY',
  },
  'RESEARCH': {
    relatedInterests: ['science', 'discovery', 'academia', 'deep learning', 'curiosity'],
    explorationBarriers: ['long timeline', 'financial pressure', 'unclear career path'],
    recoverability: 'MODERATE',
  },
  'ARTS': {
    relatedInterests: ['creativity', 'expression', 'performance', 'music', 'writing'],
    explorationBarriers: ['financial concerns', 'parental pressure', 'perceived instability'],
    recoverability: 'MODERATE',
  },
  'TECHNICAL': {
    relatedInterests: ['coding', 'problem solving', 'technology', 'building', 'systems'],
    explorationBarriers: ['imposter syndrome', 'perceived difficulty', 'gender stereotypes'],
    recoverability: 'EASY',
  },
  'SOCIAL_IMPACT': {
    relatedInterests: ['helping others', 'social justice', 'nonprofit', 'community', 'teaching'],
    explorationBarriers: ['financial concerns', 'status pressure', 'limited exposure'],
    recoverability: 'EASY',
  },
  'INTERNATIONAL': {
    relatedInterests: ['travel', 'languages', 'culture', 'global', 'diversity'],
    explorationBarriers: ['financial constraints', 'family obligations', 'fear of unknown'],
    recoverability: 'MODERATE',
  },
};

// ============================================================================
// EXPLORATION REGRET ENGINE
// ============================================================================

/**
 * Engine for detecting exploration regret risks
 */
export class ExplorationRegretEngine {
  /**
   * Analyze exploration regret for a decision
   */
  analyzeExplorationRegret(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): ExplorationRegretAnalysis {
    const unexploredPaths = this.identifyUnexploredPaths(selectedOption, studentProfile);
    const explorationGap = this.calculateExplorationGap(selectedOption, studentProfile);
    const strongestInterestSuppressed = this.findStrongestSuppressedInterest(studentProfile, selectedOption);
    const severity = this.determineSeverity(unexploredPaths, explorationGap, strongestInterestSuppressed);

    return {
      hasExplorationRisk: unexploredPaths.length > 0 || explorationGap > 0.3,
      unexploredPaths,
      strongestInterestSuppressed,
      explorationGap,
      severity,
      evidence: this.generateEvidence(unexploredPaths, strongestInterestSuppressed, explorationGap),
      explanation: this.generateExplanation(unexploredPaths, strongestInterestSuppressed, severity),
      preventionPossible: true,
      preventionStrategies: this.generatePreventionStrategies(unexploredPaths, explorationGap),
    };
  }

  /**
   * Identify paths that match student interests but aren't being explored
   */
  private identifyUnexploredPaths(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile
  ): UnexploredPath[] {
    const unexplored: UnexploredPath[] = [];
    const selectedPathTypes = this.inferPathTypes(selectedOption);

    for (const [pathType, pattern] of Object.entries(PATH_PATTERNS)) {
      // Skip if already exploring this path type
      if (selectedPathTypes.includes(pathType)) continue;

      // Check for interest alignment
      const interestAlignment = this.calculateInterestAlignment(studentProfile.interests, pattern.relatedInterests);
      
      if (interestAlignment > 0.5) {
        unexplored.push({
          pathName: pathType,
          pathType: this.getPathTypeDescription(pathType),
          interestAlignment,
          explorationBarrier: pattern.explorationBarriers[0] || 'unknown barrier',
          recoverability: pattern.recoverability,
        });
      }
    }

    // Sort by interest alignment
    return unexplored.sort((a, b) => b.interestAlignment - a.interestAlignment);
  }

  /**
   * Infer path types from selected option
   */
  private inferPathTypes(option: RegretDecisionOption): string[] {
    const types: string[] = [];
    const nameLower = option.name.toLowerCase();
    const descLower = option.description.toLowerCase();

    if (nameLower.includes('design') || descLower.includes('design')) types.push('DESIGN');
    if (nameLower.includes('startup') || nameLower.includes('business') || descLower.includes('entrepreneur')) types.push('ENTREPRENEURSHIP');
    if (nameLower.includes('research') || nameLower.includes('phd') || descLower.includes('academia')) types.push('RESEARCH');
    if (nameLower.includes('art') || nameLower.includes('music') || nameLower.includes('dance')) types.push('ARTS');
    if (nameLower.includes('tech') || nameLower.includes('engineering') || nameLower.includes('computer')) types.push('TECHNICAL');
    if (nameLower.includes('social') || nameLower.includes('ngo') || nameLower.includes('teaching')) types.push('SOCIAL_IMPACT');
    if (nameLower.includes('abroad') || nameLower.includes('international')) types.push('INTERNATIONAL');

    return types;
  }

  /**
   * Calculate alignment between student interests and path interests
   */
  private calculateInterestAlignment(studentInterests: string[], pathInterests: string[]): number {
    if (studentInterests.length === 0 || pathInterests.length === 0) return 0;

    let matches = 0;
    for (const studentInterest of studentInterests) {
      const studentLower = studentInterest.toLowerCase();
      for (const pathInterest of pathInterests) {
        if (pathInterest.includes(studentLower) || studentLower.includes(pathInterest)) {
          matches++;
          break;
        }
      }
    }

    return matches / studentInterests.length;
  }

  /**
   * Get human-readable path type description
   */
  private getPathTypeDescription(pathType: string): string {
    const descriptions: Record<string, string> = {
      'DESIGN': 'Creative and design-oriented path',
      'ENTREPRENEURSHIP': 'Entrepreneurial and business-building path',
      'RESEARCH': 'Research and academic discovery path',
      'ARTS': 'Artistic and expressive path',
      'TECHNICAL': 'Technical and problem-solving path',
      'SOCIAL_IMPACT': 'Social impact and helping others path',
      'INTERNATIONAL': 'International and globally-oriented path',
    };
    return descriptions[pathType] || pathType;
  }

  /**
   * Calculate the exploration gap score
   */
  private calculateExplorationGap(
    selectedOption: RegretDecisionOption,
    studentProfile: RegretStudentProfile
  ): number {
    const interestAlignment = selectedOption.alignmentWithInterests;
    const explorationValue = selectedOption.explorationValue;
    
    // Gap is high when interests don't align and exploration value is low
    const gap = (1 - interestAlignment) * 0.6 + (1 - explorationValue) * 0.4;
    
    return Math.min(1, Math.max(0, gap));
  }

  /**
   * Find the strongest suppressed interest
   */
  private findStrongestSuppressedInterest(
    studentProfile: RegretStudentProfile,
    selectedOption: RegretDecisionOption
  ): string | null {
    if (studentProfile.interests.length === 0) return null;

    // Find interests with low alignment to selected option
    const suppressed: { interest: string; strength: number }[] = [];
    
    for (const interest of studentProfile.interests) {
      const interestLower = interest.toLowerCase();
      const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
      
      // If interest not mentioned in option, it might be suppressed
      if (!optionText.includes(interestLower)) {
        suppressed.push({ interest, strength: 0.7 });
      }
    }

    if (suppressed.length === 0) return null;
    
    // Return the first (assumed strongest) suppressed interest
    return suppressed[0].interest;
  }

  /**
   * Determine regret severity
   */
  private determineSeverity(
    unexploredPaths: UnexploredPath[],
    explorationGap: number,
    strongestInterestSuppressed: string | null
  ): RegretSeverity {
    let score = explorationGap;
    
    if (unexploredPaths.length > 0) {
      score += 0.2;
    }
    
    if (strongestInterestSuppressed) {
      score += 0.15;
    }

    if (unexploredPaths.some(p => p.recoverability === 'DIFFICULT')) {
      score += 0.1;
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
    unexploredPaths: UnexploredPath[],
    strongestInterestSuppressed: string | null,
    explorationGap: number
  ): string[] {
    const evidence: string[] = [];

    if (unexploredPaths.length > 0) {
      evidence.push(`Found ${unexploredPaths.length} unexplored paths matching student interests`);
      evidence.push(`Strongest unexplored path: ${unexploredPaths[0].pathName} (${Math.round(unexploredPaths[0].interestAlignment * 100)}% interest match)`);
    }

    if (strongestInterestSuppressed) {
      evidence.push(`Interest "${strongestInterestSuppressed}" not reflected in current path`);
    }

    if (explorationGap > 0.5) {
      evidence.push(`High exploration gap: ${Math.round(explorationGap * 100)}%`);
    }

    return evidence;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    unexploredPaths: UnexploredPath[],
    strongestInterestSuppressed: string | null,
    severity: RegretSeverity
  ): string {
    if (unexploredPaths.length === 0 && !strongestInterestSuppressed) {
      return 'Current path appears to align well with interests. Low exploration regret risk.';
    }

    let explanation = '';

    if (strongestInterestSuppressed) {
      explanation += `You have expressed interest in "${strongestInterestSuppressed}", but your current path doesn't appear to explore this area. `;
    }

    if (unexploredPaths.length > 0) {
      explanation += `There ${unexploredPaths.length === 1 ? 'is' : 'are'} ${unexploredPaths.length} path${unexploredPaths.length === 1 ? '' : 's'} that match your interests that you haven't explored. `;
      explanation += `The strongest match is ${unexploredPaths[0].pathName.toLowerCase()}. `;
    }

    const severityDescriptions: Record<RegretSeverity, string> = {
      'MILD': 'This represents a mild exploration gap.',
      'MODERATE': 'This represents a moderate exploration gap worth considering.',
      'SIGNIFICANT': 'This represents a significant exploration gap that may lead to future regret.',
      'SEVERE': 'This represents a severe exploration gap with high potential for future regret.',
      'PROFOUND': 'This represents a profound exploration gap with very high potential for lasting regret.',
    };

    explanation += severityDescriptions[severity];

    return explanation;
  }

  /**
   * Generate prevention strategies
   */
  private generatePreventionStrategies(
    unexploredPaths: UnexploredPath[],
    explorationGap: number
  ): string[] {
    const strategies: string[] = [];

    if (unexploredPaths.length > 0) {
      strategies.push(`Explore ${unexploredPaths[0].pathName.toLowerCase()} through a small project or internship`);
      
      if (unexploredPaths[0].recoverability === 'EASY') {
        strategies.push(`Consider trying ${unexploredPaths[0].pathName.toLowerCase()} as a side project before fully committing`);
      }
    }

    strategies.push('Identify specific aspects of your interests that could be integrated into your current path');
    strategies.push('Connect with people who have explored the paths you are curious about');
    strategies.push('Set aside dedicated time for exploration and experimentation');

    if (explorationGap > 0.5) {
      strategies.push('Consider a gap year or sabbatical to explore suppressed interests');
    }

    return strategies;
  }

  /**
   * Quick exploration check
   */
  quickExplorationCheck(
    interests: string[],
    currentPath: string
  ): {
    hasExplorationRisk: boolean;
    topUnexploredInterest: string | null;
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
      interests,
      strengths: [],
      values: [],
      previousChoices: [],
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures: [],
    };

    const result = this.analyzeExplorationRegret(mockOption, mockProfile, mockContext);

    return {
      hasExplorationRisk: result.hasExplorationRisk,
      topUnexploredInterest: result.strongestInterestSuppressed,
      severity: result.severity,
      advice: result.preventionStrategies[0] || 'Continue exploring your interests',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an exploration regret engine
 */
export function createExplorationRegretEngine(): ExplorationRegretEngine {
  return new ExplorationRegretEngine();
}

/**
 * Analyze exploration regret directly
 */
export function analyzeExplorationRegret(
  selectedOption: RegretDecisionOption,
  studentProfile: RegretStudentProfile,
  context: RegretDecisionContext
): ExplorationRegretAnalysis {
  const engine = createExplorationRegretEngine();
  return engine.analyzeExplorationRegret(selectedOption, studentProfile, context);
}
