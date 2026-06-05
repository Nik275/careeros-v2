/**
 * Mentor Weight Engine
 *
 * Calculates influence from mentor intelligence:
 * - observed patterns
 * - historical mistakes
 * - recurring themes
 * - decision quality
 */

import {
  MentorWeight,
  FusionTimestamp,
  Weight,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface MentorWeightConfig {
  // Component weights
  patternWeight: Weight;
  mistakesWeight: Weight;
  themesWeight: Weight;
  decisionQualityWeight: Weight;

  // Quality thresholds
  minPatternConfidence: Weight;
  minHistoricalDepth: number;

  // Boost factors
  highPatternConfidenceBoost: number;
  recurringThemeBoost: number;
  lessonLearnedBoost: number;
}

export const DEFAULT_MENTOR_CONFIG: MentorWeightConfig = {
  patternWeight: 0.30,
  mistakesWeight: 0.25,
  themesWeight: 0.25,
  decisionQualityWeight: 0.20,

  minPatternConfidence: 0.6,
  minHistoricalDepth: 5,

  highPatternConfidenceBoost: 1.2,
  recurringThemeBoost: 1.15,
  lessonLearnedBoost: 1.1,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface MentorPattern {
  pattern: string;
  description: string;
  frequency: number;
  confidence: Weight;
  supportingEvidence: string[];
}

export interface HistoricalMistake {
  mistake: string;
  lesson: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  context: string;
}

export interface MentorProfile {
  observedPatterns: MentorPattern[];
  historicalMistakes: HistoricalMistake[];
  recurringThemes: string[];
  decisionQuality: Weight;
  totalStudentsMentored: number;
  yearsOfExperience: number;
}

export interface CareerMentorFit {
  careerId: string;
  careerName: string;

  // Pattern matches
  matchingPatterns: Array<{
    pattern: string;
    relevance: Weight;
    insight: string;
  }>;

  // Mistake avoidance
  relevantLessons: Array<{
    lesson: string;
    relevance: Weight;
    warning: string;
  }>;

  // Theme alignment
  themeAlignment: Array<{
    theme: string;
    alignment: Weight;
  }>;

  // Decision quality for this career
  careerSpecificQuality: Weight;
}

// ============================================================================
// ENGINE
// ============================================================================

export class MentorWeightEngine {
  private config: MentorWeightConfig;

  constructor(config: Partial<MentorWeightConfig> = {}) {
    this.config = { ...DEFAULT_MENTOR_CONFIG, ...config };
  }

  /**
   * Calculate mentor weight for a specific career
   */
  calculateWeight(
    profile: MentorProfile,
    fit: CareerMentorFit,
    options: {
      patternConfidence?: Weight;
      historicalDepth?: number;
    } = {}
  ): MentorWeight {
    const timestamp = Date.now();

    // Calculate component scores
    const observedPatterns = this.calculatePatternWeight(profile, fit);
    const historicalMistakes = this.calculateMistakesWeight(profile, fit);
    const recurringThemes = this.calculateThemesWeight(profile, fit);
    const decisionQuality = this.calculateDecisionQuality(profile, fit);

    // Calculate quality metrics
    const patternConfidence =
      options.patternConfidence ?? this.assessPatternConfidence(profile);
    const historicalDepth =
      options.historicalDepth ?? profile.totalStudentsMentored;
    const themeConsistency = this.assessThemeConsistency(profile);

    // Calculate total weight
    let totalWeight =
      observedPatterns * this.config.patternWeight +
      historicalMistakes * this.config.mistakesWeight +
      recurringThemes * this.config.themesWeight +
      decisionQuality * this.config.decisionQualityWeight;

    // Apply quality adjustments
    const depthFactor = Math.min(1, historicalDepth / this.config.minHistoricalDepth);
    totalWeight *= patternConfidence * depthFactor * themeConsistency;

    // Generate reasoning
    const reasoning = this.generateReasoning(profile, fit, {
      observedPatterns,
      historicalMistakes,
      recurringThemes,
      decisionQuality,
    });

    return {
      engineId: 'mentor',
      timestamp,
      observedPatterns,
      historicalMistakes,
      recurringThemes,
      decisionQuality,
      totalWeight: Math.min(1, Math.max(0, totalWeight)),
      patternConfidence,
      historicalDepth: depthFactor,
      themeConsistency,
      reasoning,
    };
  }

  /**
   * Calculate batch weights for multiple careers
   */
  calculateBatchWeights(
    profile: MentorProfile,
    fits: CareerMentorFit[],
    options?: { patternConfidence?: Weight; historicalDepth?: number }
  ): Map<string, MentorWeight> {
    const weights = new Map<string, MentorWeight>();

    for (const fit of fits) {
      const weight = this.calculateWeight(profile, fit, options);
      weights.set(fit.careerId, weight);
    }

    return weights;
  }

  /**
   * Extract mentor insights for a career
   */
  extractInsights(
    profile: MentorProfile,
    fit: CareerMentorFit
  ): {
    patterns: string[];
    warnings: string[];
    advice: string[];
    confidence: Weight;
  } {
    const patterns: string[] = [];
    const warnings: string[] = [];
    const advice: string[] = [];

    // Extract pattern insights
    for (const match of fit.matchingPatterns) {
      if (match.relevance > 0.7) {
        patterns.push(match.insight);
      }
    }

    // Extract mistake lessons as warnings
    for (const lesson of fit.relevantLessons) {
      if (lesson.relevance > 0.6) {
        warnings.push(lesson.warning);
        advice.push(lesson.lesson);
      }
    }

    // Calculate confidence
    const weight = this.calculateWeight(profile, fit);
    const confidence = weight.totalWeight;

    return { patterns, warnings, advice, confidence };
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculatePatternWeight(profile: MentorProfile, fit: CareerMentorFit): Weight {
    if (fit.matchingPatterns.length === 0) return 0.5;

    let totalScore = 0;
    let totalWeight = 0;

    for (const match of fit.matchingPatterns) {
      const pattern = profile.observedPatterns.find(p => p.pattern === match.pattern);
      if (pattern) {
        const weight = pattern.confidence * pattern.frequency;
        totalScore += match.relevance * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return 0.5;

    let score = totalScore / totalWeight;

    // Boost for high confidence patterns
    const highConfidencePatterns = fit.matchingPatterns.filter(
      m => m.relevance > 0.8
    ).length;
    if (highConfidencePatterns >= 2) {
      score *= this.config.highPatternConfidenceBoost;
    }

    return Math.min(1, score);
  }

  private calculateMistakesWeight(profile: MentorProfile, fit: CareerMentorFit): Weight {
    if (fit.relevantLessons.length === 0) return 0.6; // Neutral if no lessons

    let lessonScore = 0;
    let lessonCount = 0;

    for (const lesson of fit.relevantLessons) {
      const mistake = profile.historicalMistakes.find(m => m.lesson === lesson.lesson);
      if (mistake) {
        // Higher weight for lessons from severe mistakes
        const severityMultiplier =
          mistake.severity === 'high' ? 1.5 :
          mistake.severity === 'medium' ? 1.2 :
          1.0;

        lessonScore += lesson.relevance * severityMultiplier * mistake.frequency;
        lessonCount += mistake.frequency;
      }
    }

    if (lessonCount === 0) return 0.6;

    // Higher score = more relevant lessons learned
    let score = Math.min(1, lessonScore / (lessonCount * 2));

    // Boost for multiple relevant lessons
    if (fit.relevantLessons.length >= 3) {
      score *= this.config.lessonLearnedBoost;
    }

    return Math.min(1, score);
  }

  private calculateThemesWeight(profile: MentorProfile, fit: CareerMentorFit): Weight {
    if (fit.themeAlignment.length === 0) return 0.5;

    const totalAlignment = fit.themeAlignment.reduce(
      (sum, t) => sum + t.alignment,
      0
    );
    let score = totalAlignment / fit.themeAlignment.length;

    // Boost for recurring themes
    const recurringThemeMatches = fit.themeAlignment.filter(ta =>
      profile.recurringThemes.includes(ta.theme) && ta.alignment > 0.7
    ).length;

    if (recurringThemeMatches >= 2) {
      score *= this.config.recurringThemeBoost;
    }

    return Math.min(1, score);
  }

  private calculateDecisionQuality(profile: MentorProfile, fit: CareerMentorFit): Weight {
    // Combine general decision quality with career-specific quality
    const generalQuality = profile.decisionQuality;
    const specificQuality = fit.careerSpecificQuality;

    // Weight more toward specific quality if available
    return generalQuality * 0.4 + specificQuality * 0.6;
  }

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  private assessPatternConfidence(profile: MentorProfile): Weight {
    if (profile.observedPatterns.length === 0) return 0.5;

    const avgConfidence =
      profile.observedPatterns.reduce((sum, p) => sum + p.confidence, 0) /
      profile.observedPatterns.length;

    return Math.max(this.config.minPatternConfidence, avgConfidence);
  }

  private assessThemeConsistency(profile: MentorProfile): Weight {
    if (profile.recurringThemes.length === 0) return 0.5;

    // More recurring themes = higher consistency
    const themeScore = Math.min(1, profile.recurringThemes.length / 5);

    // Consider years of experience
    const experienceFactor = Math.min(1, profile.yearsOfExperience / 10);

    return themeScore * 0.6 + experienceFactor * 0.4;
  }

  // ============================================================================
  // REASONING GENERATION
  // ============================================================================

  private generateReasoning(
    profile: MentorProfile,
    fit: CareerMentorFit,
    scores: {
      observedPatterns: Weight;
      historicalMistakes: Weight;
      recurringThemes: Weight;
      decisionQuality: Weight;
    }
  ): string[] {
    const reasoning: string[] = [];

    // Pattern reasoning
    if (scores.observedPatterns > 0.8) {
      const topPattern = fit.matchingPatterns[0];
      reasoning.push(
        `Strong pattern match: ${topPattern?.insight || 'Aligns with observed success patterns.'}`
      );
    }

    // Mistake lesson reasoning
    if (fit.relevantLessons.length > 0) {
      const topLesson = fit.relevantLessons[0];
      reasoning.push(
        `Lesson applied: ${topLesson.lesson}`
      );
    }

    // Theme reasoning
    if (scores.recurringThemes > 0.7) {
      const alignedThemes = fit.themeAlignment
        .filter(ta => ta.alignment > 0.7)
        .map(ta => ta.theme);
      if (alignedThemes.length > 0) {
        reasoning.push(
          `Theme alignment: Matches recurring themes of ${alignedThemes.join(', ')}.`
        );
      }
    }

    // Experience-based reasoning
    if (profile.yearsOfExperience >= 5) {
      reasoning.push(
        `Experience-based insight: Drawn from ${profile.yearsOfExperience} years mentoring ${profile.totalStudentsMentored} students.`
      );
    }

    return reasoning;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getConfig(): MentorWeightConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<MentorWeightConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default MentorWeightEngine;
