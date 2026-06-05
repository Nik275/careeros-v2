/**
 * False Positive Protection Engine
 *
 * Distinguishes true founder potential from related but distinct profiles:
 * - Freelancers (sell services, not building products/equity)
 * - Consultants (sell expertise, not building solutions)
 * - Researchers (pursue knowledge, not commercial application)
 * - Academics (institution-based, peer recognition focus)
 * - Artists (creative expression, not necessarily commercial)
 * - Independent Specialists (deep expertise, individual practice)
 * - Content Creators (build audiences, not necessarily products)
 * - Wantrepreneurs (talk but don't act)
 *
 * This engine uses differential diagnosis - looking for evidence that
 * specifically distinguishes founders from these similar profiles.
 *
 * @module intelligence/founder-intelligence/protection
 */

import {
  NonFounderProfile,
  NonFounderProfileDetection,
  FounderEvidence,
  FounderEvidenceType,
  FounderDimension,
  DimensionScore,
  FounderAnalysisInput,
  ProjectInfo,
  getNonFounderProfileLabel,
  getNonFounderDistinction,
} from "../types";

/**
 * Configuration for false positive protection.
 */
export interface FalsePositiveConfig {
  /** Threshold to flag as non-founder profile */
  detectionThreshold: number;

  /** Threshold where non-founder profile blocks founder classification */
  blockThreshold: number;

  /** Minimum confidence for non-founder detection */
  minConfidence: number;

  /** Whether to enable protection */
  enabled: boolean;
}

/**
 * Default false positive protection configuration.
 */
export const DEFAULT_FALSE_POSITIVE_CONFIG: FalsePositiveConfig = {
  detectionThreshold: 0.6,
  blockThreshold: 0.75,
  minConfidence: 0.5,
  enabled: true,
};

/**
 * Signal patterns that indicate non-founder profiles.
 *
 * These patterns help distinguish similar-looking profiles from true
 * founder potential.
 */
const NON_FOUNDER_SIGNAL_PATTERNS: Record<
  NonFounderProfile,
  { patterns: string[]; strength: number; antiPatterns?: string[] }[]
> = {
  [NonFounderProfile.FREELANCER]: [
    {
      patterns: [
        "freelance",
        "freelancing",
        "client work",
        "billable hours",
        "hourly rate",
        "project basis",
        "contract work",
        "gig work",
      ],
      strength: 0.9,
      antiPatterns: [
        "product",
        "users",
        "customers",
        "revenue",
        "startup",
        "company",
        "team",
      ],
    },
    {
      patterns: [
        "work for clients",
        "deliverables",
        "scope of work",
        "service provider",
      ],
      strength: 0.85,
    },
    {
      patterns: ["independent contractor", "1099", "invoice", "time tracking"],
      strength: 0.8,
    },
  ],

  [NonFounderProfile.CONSULTANT]: [
    {
      patterns: [
        "consultant",
        "consulting",
        "advisory",
        "advise clients",
        "strategic advice",
        "recommendations",
        "expertise",
      ],
      strength: 0.9,
      antiPatterns: [
        "built",
        "created",
        "product",
        "implementation",
        "execution",
      ],
    },
    {
      patterns: [
        "help companies",
        "guide organizations",
        "best practices",
        "framework",
        "assessment",
      ],
      strength: 0.8,
    },
    {
      patterns: ["big four", "mckinsey", "bain", "bcg", "strategy firm"],
      strength: 0.85,
    },
  ],

  [NonFounderProfile.RESEARCHER]: [
    {
      patterns: [
        "research",
        "investigate",
        "study",
        "analysis",
        "hypothesis",
        "experiment",
        "data collection",
      ],
      strength: 0.85,
      antiPatterns: [
        "commercial",
        "market",
        "customers",
        "product",
        "business model",
      ],
    },
    {
      patterns: [
        "understand",
        "discover",
        "knowledge",
        "insights",
        "findings",
        "publication",
      ],
      strength: 0.8,
    },
    {
      patterns: ["phd", "doctoral", "dissertation", "thesis", "academic research"],
      strength: 0.9,
    },
  ],

  [NonFounderProfile.ACADEMIC]: [
    {
      patterns: [
        "professor",
        "lecturer",
        "university",
        "college faculty",
        "tenure",
        "academic",
        "institution",
      ],
      strength: 0.95,
    },
    {
      patterns: [
        "publish",
        "paper",
        "journal",
        "peer review",
        "conference",
        "citation",
        "h-index",
      ],
      strength: 0.85,
    },
    {
      patterns: [
        "grant",
        "funding application",
        "research proposal",
        "lab",
        "department",
      ],
      strength: 0.8,
    },
  ],

  [NonFounderProfile.ARTIST]: [
    {
      patterns: [
        "artist",
        "artistic",
        "creative expression",
        "portfolio",
        "gallery",
        "exhibition",
        "aesthetic",
      ],
      strength: 0.9,
      antiPatterns: [
        "product",
        "users",
        "scalable",
        "business model",
        "customers",
        "market",
      ],
    },
    {
      patterns: [
        "vision",
        "expression",
        "creative vision",
        "artistic integrity",
        "masterpiece",
      ],
      strength: 0.75,
    },
    {
      patterns: ["painting", "sculpture", "performance", "installation", "fine art"],
      strength: 0.85,
    },
  ],

  [NonFounderProfile.INDEPENDENT_SPECIALIST]: [
    {
      patterns: [
        "specialist",
        "expert in",
        "deep expertise",
        "niche",
        "highly skilled",
        "master of",
        "authority in",
      ],
      strength: 0.85,
      antiPatterns: ["team", "hire", "delegate", "manage", "organization"],
    },
    {
      patterns: [
        "solo practice",
        "individual contributor",
        "subject matter expert",
        "thought leader",
      ],
      strength: 0.8,
    },
    {
      patterns: [
        "certification",
        "credentials",
        "qualifications",
        "licensed",
        "accredited",
      ],
      strength: 0.7,
    },
  ],

  [NonFounderProfile.CONTENT_CREATOR]: [
    {
      patterns: [
        "content creator",
        "influencer",
        "youtuber",
        "blogger",
        "streamer",
        "podcaster",
        "subscribers",
        "followers",
      ],
      strength: 0.9,
      antiPatterns: [
        "product",
        "solve problem",
        "users",
        "customers",
        "revenue",
        "business",
      ],
    },
    {
      patterns: [
        "audience",
        "engagement",
        "views",
        "likes",
        "viral",
        "content strategy",
        "personal brand",
      ],
      strength: 0.85,
    },
    {
      patterns: ["sponsored", "brand deal", "monetization", "ad revenue", "affiliate"],
      strength: 0.8,
    },
  ],

  [NonFounderProfile.WANTREPRENEUR]: [
    {
      patterns: [
        "want to start",
        "thinking about",
        "someday",
        "one day i will",
        "dream of",
        "planning to",
        "considering",
      ],
      strength: 0.85,
      antiPatterns: [
        "built",
        "launched",
        "started",
        "created",
        "working on",
        "currently",
        "already",
      ],
    },
    {
      patterns: [
        "great idea",
        "million dollar idea",
        "if only",
        "someone should",
        "wouldn't it be great",
      ],
      strength: 0.8,
    },
    {
      patterns: [
        "waiting for",
        "need funding first",
        "once i have",
        "after i learn",
        "when the time is right",
      ],
      strength: 0.75,
    },
  ],
};

/**
 * Differential indicators - evidence that specifically distinguishes founders.
 *
 * These are strong founder signals that override non-founder patterns.
 */
const FOUNDER_DIFFERENTIAL_INDICATORS = [
  { pattern: "built.*product", strength: 0.9 },
  { pattern: "actual users", strength: 0.85 },
  { pattern: "paying customers", strength: 0.9 },
  { pattern: "revenue", strength: 0.8 },
  { pattern: "co-founder", strength: 0.85 },
  { pattern: "raised.*funding", strength: 0.9 },
  { pattern: "incorporated", strength: 0.85 },
  { pattern: "mvp", strength: 0.8 },
  { pattern: "pivot", strength: 0.85 },
  { pattern: "product-market fit", strength: 0.9 },
  { pattern: "team.*people", strength: 0.8 },
  { pattern: "hired.*employees", strength: 0.85 },
];

/**
 * False Positive Protection Engine
 *
 * Detects non-founder profiles that are commonly confused with founders.
 */
export class FalsePositiveProtectionEngine {
  private config: FalsePositiveConfig;

  constructor(config: Partial<FalsePositiveConfig> = {}) {
    this.config = { ...DEFAULT_FALSE_POSITIVE_CONFIG, ...config };
  }

  /**
   * Analyze input for non-founder profile signals.
   *
   * @param input - Founder analysis input
   * @param dimensionScores - Current dimension scores
   * @returns Array of detected non-founder profiles
   */
  analyze(
    input: FounderAnalysisInput,
    dimensionScores: DimensionScore[]
  ): NonFounderProfileDetection[] {
    if (!this.config.enabled) {
      return [];
    }

    const detections: NonFounderProfileDetection[] = [];

    for (const profile of Object.values(NonFounderProfile)) {
      const detection = this.detectProfile(profile, input, dimensionScores);
      if (detection && detection.confidence >= this.config.minConfidence) {
        detections.push(detection);
      }
    }

    // Sort by confidence
    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect a specific non-founder profile.
   */
  private detectProfile(
    profile: NonFounderProfile,
    input: FounderAnalysisInput,
    dimensionScores: DimensionScore[]
  ): NonFounderProfileDetection | null {
    const patterns = NON_FOUNDER_SIGNAL_PATTERNS[profile];
    const evidence: FounderEvidence[] = [];
    let totalScore = 0;

    // Combine all text sources
    const textSources = this.getTextSources(input);

    // Check for pattern matches
    for (const { text, source } of textSources) {
      for (const {
        patterns: keywords,
        strength,
        antiPatterns,
      } of patterns) {
        for (const keyword of keywords) {
          if (this.textMatches(text, keyword)) {
            // Check if anti-patterns are present
            let finalStrength = strength;
            if (antiPatterns) {
              const antiPatternMatch = antiPatterns.some((ap) =>
                this.textMatches(text, ap)
              );
              if (antiPatternMatch) {
                finalStrength *= 0.5; // Reduce strength if anti-patterns present
              }
            }

            evidence.push({
              id: `fp_${profile}_${source}_${Date.now()}`,
              type: FounderEvidenceType.CROSS_RESPONSE_PATTERN,
              strength: finalStrength,
              description: `Non-founder pattern: "${keyword}"`,
              source,
              rawValue: { keyword, context: text.substring(0, 100) },
              timestamp: Date.now(),
              isContradictory: true,
            });

            totalScore += finalStrength;
          }
        }
      }
    }

    // Check for differential indicators that override non-founder signals
    const differentialScore = this.checkDifferentialIndicators(input);
    const adjustedScore = Math.max(0, totalScore - differentialScore);

    // Check portfolio for non-founder signals
    if (input.projectPortfolio) {
      const portfolioEvidence = this.checkPortfolioForNonFounderSignals(
        profile,
        input.projectPortfolio
      );
      evidence.push(...portfolioEvidence);
    }

    // Check dimension patterns for non-founder profiles
    const dimensionEvidence = this.checkDimensionPatterns(profile, dimensionScores);
    evidence.push(...dimensionEvidence);

    // Calculate confidence
    const confidence = this.calculateDetectionConfidence(evidence, adjustedScore);

    if (confidence < this.config.minConfidence) {
      return null;
    }

    // Determine if this profile is dominant
    const isDominant =
      confidence >= this.config.blockThreshold ||
      (profile === NonFounderProfile.WANTREPRENEUR &&
        this.isWantrepreneurPattern(dimensionScores));

    return {
      profile,
      confidence,
      evidence,
      distinctionExplanation: getNonFounderDistinction(profile),
      isDominant,
    };
  }

  /**
   * Check for founder differential indicators that override non-founder patterns.
   */
  private checkDifferentialIndicators(input: FounderAnalysisInput): number {
    const textSources = this.getTextSources(input);
    let differentialScore = 0;

    for (const { text } of textSources) {
      for (const { pattern, strength } of FOUNDER_DIFFERENTIAL_INDICATORS) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(text)) {
          differentialScore += strength;
        }
      }
    }

    return Math.min(differentialScore, 2); // Cap at 2 to not completely override
  }

  /**
   * Check portfolio for non-founder signals.
   */
  private checkPortfolioForNonFounderSignals(
    profile: NonFounderProfile,
    portfolio: ProjectInfo[]
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];

    for (const project of portfolio) {
      switch (profile) {
        case NonFounderProfile.FREELANCER:
          // Freelancer projects: no product, just service delivery
          if (!project.isProduct && project.hadRevenue && project.teamSize === 1) {
            evidence.push({
              id: `fp_freelance_${project.name}`,
              type: FounderEvidenceType.PAST_STARTUP_EXPERIENCE,
              strength: 0.7,
              description: `Service project "${project.name}" without product/users`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          break;

        case NonFounderProfile.WANTREPRENEUR:
          // Wantrepreneur: many abandoned projects, no completion
          if (project.outcome === "abandoned" && portfolio.length > 3) {
            evidence.push({
              id: `fp_wantrep_${project.name}`,
              type: FounderEvidenceType.RESILIENCE_EVIDENCE,
              strength: 0.6,
              description: `Abandoned project "${project.name}" without completion`,
              source: `project_${project.name}`,
              rawValue: project,
              timestamp: Date.now(),
              isContradictory: true,
            });
          }
          break;
      }
    }

    return evidence;
  }

  /**
   * Check dimension patterns for non-founder profile indicators.
   */
  private checkDimensionPatterns(
    profile: NonFounderProfile,
    dimensionScores: DimensionScore[]
  ): FounderEvidence[] {
    const evidence: FounderEvidence[] = [];

    // Dimension score patterns that suggest non-founder profiles
    const dimensionMap = new Map(
      dimensionScores.map((d) => [d.dimension, d])
    );

    switch (profile) {
      case NonFounderProfile.FREELANCER:
        // Freelancers: high ownership, low talent magnetism, low sales
        const ownershipScore = dimensionMap.get(FounderDimension.OWNERSHIP_ORIENTATION)?.score || 0;
        const talentScore = dimensionMap.get(FounderDimension.TALENT_MAGNETISM)?.score || 0;

        if (ownershipScore > 0.6 && talentScore < 0.4) {
          evidence.push({
            id: `fp_freelance_dims`,
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
            strength: 0.6,
            description:
              "High ownership with low team-building suggests freelancer pattern",
            source: "dimension_analysis",
            rawValue: { ownershipScore, talentScore },
            timestamp: Date.now(),
            isContradictory: true,
          });
        }
        break;

      case NonFounderProfile.RESEARCHER:
      case NonFounderProfile.ACADEMIC:
        // Researchers: high obsession, low sales, low ownership
        const obsessionScore = dimensionMap.get(FounderDimension.OBSESSION_CAPACITY)?.score || 0;
        const salesScore = dimensionMap.get(FounderDimension.SALES_CAPABILITY)?.score || 0;

        if (obsessionScore > 0.7 && salesScore < 0.3) {
          evidence.push({
            id: `fp_researcher_dims`,
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
            strength: 0.65,
            description:
              "High persistence with low sales suggests research/academic pattern",
            source: "dimension_analysis",
            rawValue: { obsessionScore, salesScore },
            timestamp: Date.now(),
            isContradictory: true,
          });
        }
        break;

      case NonFounderProfile.CONSULTANT:
        // Consultants: high opportunity recognition, low resourcefulness
        const oppScore = dimensionMap.get(FounderDimension.OPPORTUNITY_RECOGNITION)?.score || 0;
        const resourceScore = dimensionMap.get(FounderDimension.RESOURCEFULNESS)?.score || 0;

        if (oppScore > 0.6 && resourceScore < 0.4) {
          evidence.push({
            id: `fp_consultant_dims`,
            type: FounderEvidenceType.PSYCHOLOGICAL_INDICATOR,
            strength: 0.6,
            description:
              "High problem recognition with low resource-building suggests consultant pattern",
            source: "dimension_analysis",
            rawValue: { oppScore, resourceScore },
            timestamp: Date.now(),
            isContradictory: true,
          });
        }
        break;
    }

    return evidence;
  }

  /**
   * Check for specific wantrepreneur patterns.
   */
  private isWantrepreneurPattern(dimensionScores: DimensionScore[]): boolean {
    const dimensionMap = new Map(
      dimensionScores.map((d) => [d.dimension, d])
    );

    // Wantrepreneurs talk about ideas but don't execute
    // High opportunity recognition, low ownership, low resourcefulness
    const oppScore = dimensionMap.get(FounderDimension.OPPORTUNITY_RECOGNITION)?.score || 0;
    const ownershipScore = dimensionMap.get(FounderDimension.OWNERSHIP_ORIENTATION)?.score || 0;
    const resourceScore = dimensionMap.get(FounderDimension.RESOURCEFULNESS)?.score || 0;

    return oppScore > 0.6 && ownershipScore < 0.4 && resourceScore < 0.4;
  }

  /**
   * Calculate confidence in non-founder profile detection.
   */
  private calculateDetectionConfidence(
    evidence: FounderEvidence[],
    score: number
  ): number {
    if (evidence.length === 0) return 0;

    // Base confidence from evidence count and strength
    const evidenceConfidence = Math.min(evidence.length * 0.2, 0.6);
    const strengthConfidence = Math.max(...evidence.map((e) => e.strength)) * 0.4;

    // Adjust by score
    const adjustedScore = Math.min(score / 3, 0.3);

    return Math.min(evidenceConfidence + strengthConfidence + adjustedScore, 1);
  }

  /**
   * Get all text sources from input.
   */
  private getTextSources(
    input: FounderAnalysisInput
  ): { text: string; source: string }[] {
    const sources: { text: string; source: string }[] = [];

    if (input.userInput) {
      sources.push({ text: input.userInput.toLowerCase(), source: "user_input" });
    }

    if (input.explicitStatements) {
      input.explicitStatements.forEach((stmt, idx) => {
        sources.push({
          text: stmt.toLowerCase(),
          source: `explicit_${idx}`,
        });
      });
    }

    if (input.experienceDescriptions) {
      input.experienceDescriptions.forEach((desc, idx) => {
        sources.push({
          text: desc.toLowerCase(),
          source: `experience_${idx}`,
        });
      });
    }

    return sources;
  }

  /**
   * Check if text matches a pattern.
   */
  private textMatches(text: string, pattern: string): boolean {
    return text.includes(pattern.toLowerCase());
  }

  /**
   * Calculate overall false positive risk.
   */
  calculateFalsePositiveRisk(
    detections: NonFounderProfileDetection[]
  ): number {
    if (detections.length === 0) return 0;

    // Weight by whether profile is dominant
    let weightedSum = 0;
    let totalWeight = 0;

    for (const detection of detections) {
      const weight = detection.isDominant ? 1.5 : 1;
      weightedSum += detection.confidence * weight;
      totalWeight += weight;
    }

    return Math.min(weightedSum / totalWeight, 1);
  }

  /**
   * Check if founder classification should be blocked.
   */
  shouldBlockFounderClassification(
    detections: NonFounderProfileDetection[]
  ): boolean {
    return detections.some(
      (d) => d.isDominant && d.confidence >= this.config.blockThreshold
    );
  }

  /**
   * Get warning message for false positive risk.
   */
  getFalsePositiveWarning(
    detections: NonFounderProfileDetection[],
    riskScore: number
  ): string | undefined {
    if (riskScore < this.config.detectionThreshold) {
      return undefined;
    }

    const topDetection = detections[0];
    const profileLabel = getNonFounderProfileLabel(topDetection.profile);

    if (riskScore >= this.config.blockThreshold) {
      return `Strong indicators suggest ${profileLabel} profile rather than founder potential. ${topDetection.distinctionExplanation}`;
    }

    return `Some indicators suggest ${profileLabel} tendencies. Consider whether you're looking to build a scalable product/company or offer services/expertise.`;
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<FalsePositiveConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating false positive protection engine.
 */
export function createFalsePositiveProtectionEngine(
  config?: Partial<FalsePositiveConfig>
): FalsePositiveProtectionEngine {
  return new FalsePositiveProtectionEngine(config);
}
