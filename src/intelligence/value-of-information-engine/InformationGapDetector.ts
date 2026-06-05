/**
 * CareerOS Value of Information Engine - Information Gap Detector
 *
 * Identifies gaps in student information that affect decision quality:
 * - Unknown interests
 * - Weak aptitude evidence
 * - Identity uncertainty
 * - Value uncertainty
 * - Skill uncertainty
 * - Market understanding gaps
 */

import type {
  StudentBeliefV3,
} from '../types';

import type {
  UncertaintyProfile,
} from '../uncertainty-engine';

import type {
  InformationGap,
  InformationGapCategory,
  GapDetectionResult,
  ValueOfInformationEngineConfig,
} from './types';

/**
 * Detects information gaps in student belief and uncertainty profiles.
 */
export class InformationGapDetector {
  private config: ValueOfInformationEngineConfig;

  constructor(config: ValueOfInformationEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: detect all information gaps.
   */
  detect(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): GapDetectionResult {
    const gaps: InformationGap[] = [];

    // Detect interest gaps
    gaps.push(...this.detectInterestGaps(studentBelief, uncertaintyProfile));

    // Detect aptitude gaps
    gaps.push(...this.detectAptitudeGaps(studentBelief, uncertaintyProfile));

    // Detect value gaps
    gaps.push(...this.detectValueGaps(studentBelief, uncertaintyProfile));

    // Detect skill gaps
    gaps.push(...this.detectSkillGaps(studentBelief, uncertaintyProfile));

    // Detect identity gaps
    gaps.push(...this.detectIdentityGaps(studentBelief, uncertaintyProfile));

    // Detect market understanding gaps
    gaps.push(...this.detectMarketGaps(studentBelief, uncertaintyProfile));

    // Detect constraints gaps
    gaps.push(...this.detectConstraintsGaps(studentBelief, uncertaintyProfile));

    // Sort by information value (uncertainty × impact)
    gaps.sort((a, b) => b.informationValue - a.informationValue);

    // Filter by thresholds
    const filteredGaps = gaps.filter(
      (gap) =>
        gap.currentUncertainty >= this.config.minUncertaintyThreshold &&
        gap.decisionImpact >= this.config.minDecisionImpact
    );

    // Limit results
    const limitedGaps = filteredGaps.slice(0, this.config.maxGaps);

    // Group by category
    const gapsByCategory = this.groupByCategory(limitedGaps);

    // Calculate statistics
    const statistics = this.calculateStatistics(limitedGaps);

    return {
      gaps: limitedGaps,
      gapsByCategory,
      statistics,
    };
  }

  /**
   * Detect gaps in career interests.
   */
  private detectInterestGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check motivation clarity
    const motivations = studentBelief.motivations || [];
    const motivationConfidence = motivations.length > 0
      ? motivations.reduce((sum, m) => sum + (m.strength || 0), 0) / Math.max(motivations.length, 1)
      : 0;

    if (motivationConfidence < 0.6) {
      gaps.push({
        id: `gap-interest-motivations`,
        category: 'interest',
        aspect: 'Core career motivations',
        currentUncertainty: 1 - motivationConfidence,
        potentialReduction: 0.5,
        decisionImpact: 0.7,
        informationValue: (1 - motivationConfidence) * 0.7,
        priority: motivationConfidence < 0.3 ? 'critical' : 'high',
        explanation: [
          'Career motivations are unclear or conflicting',
          'What drives this student professionally is not well understood',
          'Without clear motivations, career fit cannot be assessed',
        ],
        currentEvidence: motivations.map((m) => m.name || 'unknown'),
        missingEvidence: [
          'Intrinsic vs extrinsic motivation clarity',
          'Long-term vs short-term goal alignment',
          'Passion areas vs competence areas',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check for unexplored interest areas
    const interestDomains = new Set<string>();
    motivations.forEach((m) => {
      if (m.name?.includes('technical')) interestDomains.add('technical');
      if (m.name?.includes('creative')) interestDomains.add('creative');
      if (m.name?.includes('social')) interestDomains.add('social');
      if (m.name?.includes('analytical')) interestDomains.add('analytical');
    });

    if (interestDomains.size < 2) {
      gaps.push({
        id: `gap-interest-breadth`,
        category: 'interest',
        aspect: 'Breadth of interest exploration',
        currentUncertainty: 0.6,
        potentialReduction: 0.4,
        decisionImpact: 0.5,
        informationValue: 0.3,
        priority: 'medium',
        explanation: [
          'Student has explored limited career domains',
          'May be unaware of interests in unexplored areas',
          'Narrow exploration increases risk of missed opportunities',
        ],
        currentEvidence: Array.from(interestDomains),
        missingEvidence: [
          'Interests in unexplored domains',
          'Cross-domain interest patterns',
          'Emerging interest areas',
        ],
        affectedPaths: ['exploratory-paths'],
      });
    }

    return gaps;
  }

  /**
   * Detect gaps in aptitude evidence.
   */
  private detectAptitudeGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check strength clarity
    const strengths = studentBelief.strengths || [];
    const strengthConfidence = strengths.length > 0
      ? strengths.reduce((sum, s) => sum + (s.level || 0), 0) / Math.max(strengths.length, 1)
      : 0;

    if (strengthConfidence < 0.6) {
      gaps.push({
        id: `gap-aptitude-strengths`,
        category: 'aptitude',
        aspect: 'Core strengths and abilities',
        currentUncertainty: 1 - strengthConfidence,
        potentialReduction: 0.5,
        decisionImpact: 0.75,
        informationValue: (1 - strengthConfidence) * 0.75,
        priority: strengthConfidence < 0.3 ? 'critical' : 'high',
        explanation: [
          'Natural abilities and strengths are not well documented',
          'Limited evidence of what this student excels at',
          'Strength-affected career options cannot be reliably scored',
        ],
        currentEvidence: strengths.map((s) => s.name || 'unknown'),
        missingEvidence: [
          'Validated skill assessments',
          'Performance evidence in different domains',
          'Cognitive ability indicators',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check for evidence of transferable skills
    const hasTransferableSkills = strengths.some((s) =>
      ['communication', 'leadership', 'problem-solving', 'critical-thinking'].some((ts) =>
        s.name?.toLowerCase().includes(ts)
      )
    );

    if (!hasTransferableSkills) {
      gaps.push({
        id: `gap-aptitude-transferable`,
        category: 'aptitude',
        aspect: 'Transferable skills',
        currentUncertainty: 0.7,
        potentialReduction: 0.4,
        decisionImpact: 0.6,
        informationValue: 0.42,
        priority: 'high',
        explanation: [
          'No documented evidence of transferable skills',
          'Transferable skills are critical for career pivoting',
          'Missing information on adaptability and versatility',
        ],
        currentEvidence: strengths.map((s) => s.name || 'unknown'),
        missingEvidence: [
          'Communication effectiveness',
          'Leadership experiences',
          'Problem-solving demonstrations',
          'Collaboration evidence',
        ],
        affectedPaths: ['all'],
      });
    }

    return gaps;
  }

  /**
   * Detect gaps in value clarity.
   */
  private detectValueGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check value clarity
    const values = studentBelief.values || [];
    const valueConfidence = values.length > 0
      ? values.reduce((sum, v) => sum + (v.importance || 0), 0) / Math.max(values.length, 1)
      : 0;

    if (valueConfidence < 0.6) {
      gaps.push({
        id: `gap-values-clarity`,
        category: 'values',
        aspect: 'Work values and priorities',
        currentUncertainty: 1 - valueConfidence,
        potentialReduction: 0.45,
        decisionImpact: 0.8,
        informationValue: (1 - valueConfidence) * 0.8,
        priority: valueConfidence < 0.3 ? 'critical' : 'high',
        explanation: [
          'Work values are unclear or weakly held',
          'What matters most to this student is not well understood',
          'Value misalignment is a major predictor of career regret',
        ],
        currentEvidence: values.map((v) => v.name || 'unknown'),
        missingEvidence: [
          'Value hierarchy (what matters most)',
          'Non-negotiable vs flexible values',
          'Long-term vs short-term value priorities',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check for value conflicts
    const workLifeValue = values.find((v) =>
      v.name?.toLowerCase().includes('work-life') || v.name?.toLowerCase().includes('balance')
    );
    const achievementValue = values.find((v) =>
      v.name?.toLowerCase().includes('achievement') || v.name?.toLowerCase().includes('success')
    );

    if (workLifeValue && achievementValue) {
      const workLifeStrength = workLifeValue.importance || 0;
      const achievementStrength = achievementValue.importance || 0;

      if (Math.abs(workLifeStrength - achievementStrength) < 0.2 && workLifeStrength > 0.6) {
        gaps.push({
          id: `gap-values-conflict`,
          category: 'values',
          aspect: 'Value priority resolution',
          currentUncertainty: 0.5,
          potentialReduction: 0.3,
          decisionImpact: 0.65,
          informationValue: 0.33,
          priority: 'medium',
          explanation: [
            'Potential conflict between achievement and work-life values',
            'Both values are strong but may be incompatible in some careers',
            'Need clarity on which value takes priority in tradeoffs',
          ],
          currentEvidence: [workLifeValue.name || 'work-life', achievementValue.name || 'achievement'],
          missingEvidence: [
            'Value tradeoff preferences',
            'Historical value-prioritization patterns',
            'Stress response to value conflicts',
          ],
          affectedPaths: ['high-achievement-paths', 'work-life-balance-paths'],
        });
      }
    }

    return gaps;
  }

  /**
   * Detect gaps in skill documentation.
   */
  private detectSkillGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check for specific technical skills
    const technicalStrengths = (studentBelief.strengths || []).filter(
      (s) => s.category === 'technical'
    );

    if (technicalStrengths.length < 2) {
      gaps.push({
        id: `gap-skills-technical`,
        category: 'skills',
        aspect: 'Technical skills inventory',
        currentUncertainty: 0.75,
        potentialReduction: 0.5,
        decisionImpact: 0.55,
        informationValue: 0.41,
        priority: 'high',
        explanation: [
          'Limited documentation of technical skills',
          'Technical skills are increasingly required across careers',
          'Without skill evidence, technical career paths cannot be assessed',
        ],
        currentEvidence: technicalStrengths.map((s) => s.name || 'unknown'),
        missingEvidence: [
          'Programming or software skills',
          'Data analysis capabilities',
          'Digital tool proficiency',
          'Technical project portfolio',
        ],
        affectedPaths: ['technical-paths', 'data-paths', 'engineering-paths'],
      });
    }

    // Check for skill development trajectory
    const hasDevelopmentEvidence = (studentBelief.strengths || []).some(
      (s) => (s.evidence || []).length > 2
    );

    if (!hasDevelopmentEvidence) {
      gaps.push({
        id: `gap-skills-development`,
        category: 'skills',
        aspect: 'Skill development patterns',
        currentUncertainty: 0.65,
        potentialReduction: 0.35,
        decisionImpact: 0.45,
        informationValue: 0.29,
        priority: 'medium',
        explanation: [
          'Limited evidence of skill acquisition patterns',
          'How this student learns new skills is not well understood',
          'Skill learning rate affects career transition feasibility',
        ],
        currentEvidence: ['self-reported strengths'],
        missingEvidence: [
          'Learning velocity indicators',
          'Skill acquisition history',
          'Adaptability evidence',
        ],
        affectedPaths: ['skill-intensive-paths'],
      });
    }

    return gaps;
  }

  /**
   * Detect gaps in professional identity.
   */
  private detectIdentityGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check personality trait clarity
    const traits = studentBelief.personalityTraits || [];
    const traitConfidence = traits.length > 0
      ? traits.reduce((sum, t) => sum + (t.confidence || 0), 0) / Math.max(traits.length, 1)
      : 0;

    if (traitConfidence < 0.5) {
      gaps.push({
        id: `gap-identity-personality`,
        category: 'identity',
        aspect: 'Personality and work style',
        currentUncertainty: 1 - traitConfidence,
        potentialReduction: 0.4,
        decisionImpact: 0.7,
        informationValue: (1 - traitConfidence) * 0.7,
        priority: traitConfidence < 0.3 ? 'critical' : 'high',
        explanation: [
          'Personality traits are not well characterized',
          'Work style preferences are unclear',
          'Identity misalignment leads to career dissatisfaction',
        ],
        currentEvidence: traits.map((t) => t.name || 'unknown'),
        missingEvidence: [
          'Validated personality assessment',
          'Work environment preferences',
          'Social interaction style',
          'Decision-making patterns',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check for professional identity exploration
    const hasIdentityExploration =
      (studentBelief.metadata?.contributingEngines || []).some((e) =>
        e.toLowerCase().includes('identity')
      );

    if (!hasIdentityExploration) {
      gaps.push({
        id: `gap-identity-exploration`,
        category: 'identity',
        aspect: 'Professional identity development',
        currentUncertainty: 0.8,
        potentialReduction: 0.45,
        decisionImpact: 0.6,
        informationValue: 0.48,
        priority: 'high',
        explanation: [
          'No structured exploration of professional identity',
          'How student sees themselves professionally is unclear',
          'Identity clarity predicts career commitment and satisfaction',
        ],
        currentEvidence: ['implicit from assessments'],
        missingEvidence: [
          'Professional self-concept',
          'Identity exploration activities',
          'Role model identification',
          'Professional narrative coherence',
        ],
        affectedPaths: ['all'],
      });
    }

    return gaps;
  }

  /**
   * Detect gaps in market understanding.
   */
  private detectMarketGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check career knowledge
    const componentGaps = uncertaintyProfile.components || {};
    const careerDataGap = componentGaps.careerData?.gaps || [];

    if (careerDataGap.length > 0) {
      gaps.push({
        id: `gap-market-careers`,
        category: 'market',
        aspect: 'Career and industry knowledge',
        currentUncertainty: 0.7,
        potentialReduction: 0.4,
        decisionImpact: 0.5,
        informationValue: 0.35,
        priority: 'medium',
        explanation: [
          'Limited understanding of target careers',
          'Industry realities may differ from assumptions',
          'Market knowledge gaps increase risk of poor decisions',
        ],
        currentEvidence: ['basic career descriptions'],
        missingEvidence: [
          'Day-to-day realities of target careers',
          'Industry trend understanding',
          'Market demand awareness',
          'Entry pathway clarity',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check economic reality clarity
    const economicReality = studentBelief.economicReality;
    if (!economicReality || !economicReality.financialSituation) {
      gaps.push({
        id: `gap-market-economic`,
        category: 'market',
        aspect: 'Economic and financial constraints',
        currentUncertainty: 0.75,
        potentialReduction: 0.5,
        decisionImpact: 0.65,
        informationValue: 0.49,
        priority: 'high',
        explanation: [
          'Economic reality is not well understood',
          'Financial constraints affect career feasibility',
          'Resource limitations may rule out certain paths',
        ],
        currentEvidence: ['minimal economic data'],
        missingEvidence: [
          'Income requirements',
          'Education funding constraints',
          'Financial risk tolerance',
          'Support system assessment',
        ],
        affectedPaths: ['education-intensive-paths', 'low-initial-income-paths'],
      });
    }

    return gaps;
  }

  /**
   * Detect gaps in reality constraints understanding.
   */
  private detectConstraintsGaps(
    studentBelief: StudentBeliefV3,
    uncertaintyProfile: UncertaintyProfile
  ): InformationGap[] {
    const gaps: InformationGap[] = [];

    // Check family constraints
    const familyReality = studentBelief.familyReality;
    const hasFamilyAssessment = familyReality && familyReality.familyStructure;

    if (!hasFamilyAssessment) {
      gaps.push({
        id: `gap-constraints-family`,
        category: 'constraints',
        aspect: 'Family obligations and expectations',
        currentUncertainty: 0.8,
        potentialReduction: 0.45,
        decisionImpact: 0.7,
        informationValue: 0.56,
        priority: 'high',
        explanation: [
          'Family context is not well understood',
          'Family obligations may constrain career options',
          'Expectation misalignment can cause long-term conflict',
        ],
        currentEvidence: ['minimal family data'],
        missingEvidence: [
          'Family obligation details',
          'Parental expectations',
          'Cultural considerations',
          'Support system assessment',
        ],
        affectedPaths: ['all'],
      });
    }

    // Check geographic constraints
    const geographicConstraints = (studentBelief.constraints || []).filter(
      (c) => c.type === 'GEOGRAPHIC'
    );

    if (geographicConstraints.length === 0) {
      gaps.push({
        id: `gap-constraints-geographic`,
        category: 'constraints',
        aspect: 'Geographic and mobility constraints',
        currentUncertainty: 0.6,
        potentialReduction: 0.3,
        decisionImpact: 0.4,
        informationValue: 0.24,
        priority: 'low',
        explanation: [
          'Geographic preferences not documented',
          'Location constraints affect career availability',
          'Mobility willingness impacts opportunity access',
        ],
        currentEvidence: ['no geographic data'],
        missingEvidence: [
          'Location preferences',
          'Relocation willingness',
          'Remote work flexibility',
          'Regional market constraints',
        ],
        affectedPaths: ['location-dependent-paths'],
      });
    }

    // Check lifestyle constraints
    const lifestylePreferences = studentBelief.lifestylePreferences || [];
    if (lifestylePreferences.length < 3) {
      gaps.push({
        id: `gap-constraints-lifestyle`,
        category: 'constraints',
        aspect: 'Lifestyle and work-life preferences',
        currentUncertainty: 0.65,
        potentialReduction: 0.35,
        decisionImpact: 0.55,
        informationValue: 0.36,
        priority: 'medium',
        explanation: [
          'Lifestyle preferences are not well documented',
          'Work-life requirements affect career satisfaction',
          'Schedule and environment preferences are unclear',
        ],
        currentEvidence: lifestylePreferences.map((lp) => lp.name || 'unknown'),
        missingEvidence: [
          'Work schedule preferences',
          'Travel tolerance',
          'Remote work requirements',
          'Work environment preferences',
        ],
        affectedPaths: ['all'],
      });
    }

    return gaps;
  }

  /**
   * Group gaps by category.
   */
  private groupByCategory(
    gaps: InformationGap[]
  ): Record<InformationGapCategory, InformationGap[]> {
    const grouped: Partial<Record<InformationGapCategory, InformationGap[]>> = {};

    const categories: InformationGapCategory[] = [
      'interest',
      'aptitude',
      'values',
      'skills',
      'market',
      'identity',
      'constraints',
      'outcomes',
    ];

    for (const category of categories) {
      grouped[category] = gaps.filter((g) => g.category === category);
    }

    return grouped as Record<InformationGapCategory, InformationGap[]>;
  }

  /**
   * Calculate summary statistics.
   */
  private calculateStatistics(gaps: InformationGap[]): GapDetectionResult['statistics'] {
    if (gaps.length === 0) {
      return {
        totalGaps: 0,
        criticalGaps: 0,
        highGaps: 0,
        averageUncertainty: 0,
        highestImpactCategory: null,
      };
    }

    const criticalGaps = gaps.filter((g) => g.priority === 'critical').length;
    const highGaps = gaps.filter((g) => g.priority === 'high').length;
    const averageUncertainty =
      gaps.reduce((sum, g) => sum + g.currentUncertainty, 0) / gaps.length;

    // Find highest impact category
    const categoryImpact: Record<string, number> = {};
    for (const gap of gaps) {
      categoryImpact[gap.category] = (categoryImpact[gap.category] || 0) + gap.decisionImpact;
    }

    const highestImpactCategory = Object.entries(categoryImpact).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as InformationGapCategory | null;

    return {
      totalGaps: gaps.length,
      criticalGaps,
      highGaps,
      averageUncertainty,
      highestImpactCategory,
    };
  }
}

/**
 * Factory function for InformationGapDetector.
 */
export function createInformationGapDetector(
  config: ValueOfInformationEngineConfig
): InformationGapDetector {
  return new InformationGapDetector(config);
}
