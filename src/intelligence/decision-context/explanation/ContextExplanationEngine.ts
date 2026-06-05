/**
 * Context Explanation Engine
 * 
 * Generates human-readable explanations for detected contexts.
 * Creates narratives that explain why contexts were detected and
 * what they mean for the student's career decisions.
 * 
 * @module intelligence/decision-context/explanation
 */

import {
  DecisionContextType,
  ContextCategory,
  DetectedContext,
  ContextAnalysis,
  ContextNarrative,
  ContextConflict,
  ContextPriority,
  ContextEvidence,
  EvidenceType,
  getContextTypeLabel,
  getContextTypeDescription,
  CONTEXT_TYPE_CATEGORIES,
} from '../types';

/**
 * Configuration for explanation generation.
 */
export interface ExplanationConfig {
  /** Verbosity level of explanations */
  verbosity: 'minimal' | 'standard' | 'detailed';
  
  /** Whether to include evidence details */
  includeEvidence: boolean;
  
  /** Whether to include uncertainty explanations */
  includeUncertainty: boolean;
  
  /** Tone of explanations */
  tone: 'professional' | 'friendly' | 'academic';
  
  /** Maximum length of explanations */
  maxLength: number;
}

/**
 * Default explanation configuration.
 */
export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  verbosity: 'standard',
  includeEvidence: true,
  includeUncertainty: true,
  tone: 'professional',
  maxLength: 500,
};

/**
 * Templates for generating explanations by context type.
 */
const CONTEXT_EXPLANATION_TEMPLATES: Record<
  DecisionContextType,
  {
    primary: string;
    secondary: string;
    evidenceTypes: Record<string, string>;
  }
> = {
  [DecisionContextType.JEE_PREPARATION]: {
    primary: `You are currently in a **JEE Preparation** context. Your profile shows strong focus on engineering entrance exams and technical education pathways. This means your career decisions should prioritize IITs, NITs, and other premier engineering institutions.`,
    secondary: `You are also preparing for **JEE** alongside your other priorities. This engineering entrance focus provides additional options in the technical education space.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated engineering entrance exam preparation',
      [EvidenceType.EDUCATION_DATA]: 'academic profile aligned with engineering focus',
      [EvidenceType.TEMPORAL_INFERENCE]: 'education timing typical for JEE preparation',
    },
  },
  [DecisionContextType.NEET_PREPARATION]: {
    primary: `You are currently in a **NEET Preparation** context. Your focus is on medical entrance examinations and healthcare career pathways. This context means prioritizing MBBS, BDS, and other medical program admissions.`,
    secondary: `You are also preparing for **NEET** alongside other goals. This medical focus opens healthcare career pathways.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated medical entrance exam preparation',
      [EvidenceType.EDUCATION_DATA]: 'academic profile shows healthcare interests',
    },
  },
  [DecisionContextType.UPSC_PREPARATION]: {
    primary: `You are currently in a **UPSC Preparation** context. Your focus is on civil services and public administration careers. This long-term preparation pathway typically requires 1-3 years of dedicated study after graduation.`,
    secondary: `You are also exploring **UPSC/civil services** as a career option alongside other paths.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated UPSC or civil services preparation',
      [EvidenceType.TEMPORAL_INFERENCE]: 'education level aligns with typical UPSC preparation timing',
    },
  },
  [DecisionContextType.STATE_PSC_PREPARATION]: {
    primary: `You are currently preparing for **State PSC examinations**. Your focus is on state-level administrative services within your region.`,
    secondary: `You are also considering **State PSC** examinations as an additional pathway.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned State PSC preparation',
    },
  },
  [DecisionContextType.CA_PATHWAY]: {
    primary: `You are currently pursuing the **Chartered Accountancy (CA)** pathway through ICAI. This professional qualification involves Foundation, Intermediate, and Final levels plus articleship training.`,
    secondary: `You are also on the **CA pathway** alongside your other pursuits.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated CA preparation or registration',
      [EvidenceType.EDUCATION_DATA]: 'commerce/finance background aligned with CA pathway',
    },
  },
  [DecisionContextType.CS_PATHWAY]: {
    primary: `You are currently pursuing the **Company Secretary (CS)** qualification through ICSI. This focuses on corporate governance, compliance, and company law.`,
    secondary: `You are also on the **CS pathway** as a secondary focus.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated CS preparation',
    },
  },
  [DecisionContextType.CMA_PATHWAY]: {
    primary: `You are currently pursuing the **Cost & Management Accountancy (CMA)** through ICMAI. This focuses on cost accounting and management accounting.`,
    secondary: `You are also on the **CMA pathway** alongside other goals.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly stated CMA preparation',
    },
  },
  [DecisionContextType.COLLEGE_SELECTION]: {
    primary: `You are currently in the **College Selection** phase. You are actively evaluating and choosing between higher education institutions. Decisions made now will shape your academic environment and network for the next 3-4 years.`,
    secondary: `You are also in a **college selection** process alongside other priorities.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned college selection or admissions',
      [EvidenceType.TEMPORAL_INFERENCE]: 'education level indicates college selection timing',
    },
  },
  [DecisionContextType.SCHOOL_SELECTION]: {
    primary: `You are currently in the **School Selection** phase. You are evaluating different schools or educational boards for your continued education.`,
    secondary: `You are also considering **school selection** options.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned school selection',
    },
  },
  [DecisionContextType.COURSE_SELECTION]: {
    primary: `You are currently in **Course Selection** mode. You are deciding between specific academic programs, majors, or specializations.`,
    secondary: `You are also navigating **course selection** decisions.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned course or major selection',
    },
  },
  [DecisionContextType.CAREER_EXPLORATION]: {
    primary: `You are currently in **Career Exploration** mode. You are discovering and evaluating different career paths without a fixed commitment. This is a valuable phase for gathering information and understanding your options.`,
    secondary: `You are also in **career exploration** phase alongside more specific goals.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'expressed uncertainty or desire to explore options',
      [EvidenceType.PATTERN_MATCH]: 'diverse interests suggest exploration phase',
    },
  },
  [DecisionContextType.EARLY_CAREER]: {
    primary: `You are currently in **Early Career** stage (0-3 years experience). You are building foundational skills, establishing professional identity, and navigating your first workplace experiences.`,
    secondary: `You are also in **early career** stage while managing other priorities.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned being in early career',
    },
  },
  [DecisionContextType.MID_CAREER]: {
    primary: `You are currently in **Mid Career** stage (5+ years experience). You have established expertise and are likely focusing on growth, leadership, or specialization decisions.`,
    secondary: `You are also in **mid career** with established experience.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned mid-career experience level',
    },
  },
  [DecisionContextType.CAREER_SWITCH]: {
    primary: `You are currently in a **Career Switch** context. You are actively considering or pursuing a change in your career direction. This transition phase requires careful planning and skill transfer assessment.`,
    secondary: `You are also considering a **career switch** alongside your current path.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned career change intent',
    },
  },
  [DecisionContextType.INDUSTRY_TRANSITION]: {
    primary: `You are currently in an **Industry Transition** context. You are moving from one industry sector to another, requiring adaptation to new domain knowledge and professional networks.`,
    secondary: `You are also considering an **industry transition** as an option.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned industry change',
    },
  },
  [DecisionContextType.STARTUP_EXPLORATION]: {
    primary: `You are currently in **Startup Exploration** mode. You are investigating entrepreneurship opportunities and evaluating whether to build your own venture.`,
    secondary: `You are also **exploring startups/entrepreneurship** alongside other paths.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned startup or business ideas',
      [EvidenceType.IMPLICIT_SIGNAL]: 'motivational profile suggests entrepreneurial interest',
    },
  },
  [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: {
    primary: `You are currently **Building a Business/Startup**. You are actively developing a venture, product, or service. This involves significant commitment and multi-faceted responsibilities.`,
    secondary: `You are also **actively building a business** alongside other pursuits.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned running or building a business',
    },
  },
  [DecisionContextType.FAMILY_BUSINESS]: {
    primary: `You are currently in a **Family Business** context. You are involved in or preparing to join your family's business enterprise. This brings unique dynamics of legacy, succession, and family expectations.`,
    secondary: `You also have **family business** considerations as part of your context.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned family business involvement',
      [EvidenceType.EDUCATION_DATA]: 'profile indicates family business expectations',
    },
  },
  [DecisionContextType.REGIONAL_CONSTRAINT]: {
    primary: `You are operating under **Regional Constraints**. Your career decisions are influenced by geographic limitations or location requirements.`,
    secondary: `You also have **regional constraints** affecting your options.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned geographic limitations',
      [EvidenceType.EDUCATION_DATA]: 'profile indicates geographic constraints',
    },
  },
  [DecisionContextType.FINANCIAL_CONSTRAINT]: {
    primary: `You are operating under **Financial Constraints**. Budget considerations and financial resources are significant factors in your career decisions. ROI and affordability are important decision criteria.`,
    secondary: `You also have **financial constraints** to consider in your planning.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned financial or budget constraints',
      [EvidenceType.EDUCATION_DATA]: 'profile indicates financial limitations',
    },
  },
  [DecisionContextType.TIME_CONSTRAINT]: {
    primary: `You are operating under **Time Constraints**. Limited availability requires efficient pathways and flexible options that accommodate your schedule.`,
    secondary: `You also have **time constraints** affecting your available options.`,
    evidenceTypes: {
      [EvidenceType.EXPLICIT_ANSWER]: 'explicitly mentioned time or schedule limitations',
    },
  },
};

/**
 * Characteristics descriptions by context type.
 */
const CONTEXT_CHARACTERISTICS: Record<DecisionContextType, string[]> = {
  [DecisionContextType.JEE_PREPARATION]: [
    'Exam-focused decision making',
    'Rank and cutoff driven',
    'Engineering-oriented pathway',
    'Time-intensive preparation',
    'Competitive entrance focus',
  ],
  [DecisionContextType.NEET_PREPARATION]: [
    'Medical career focus',
    'Long education pathway',
    'High stakes entrance exam',
    'Service-oriented motivation',
    'Specialization potential',
  ],
  [DecisionContextType.UPSC_PREPARATION]: [
    'Long-term commitment (1-3 years)',
    'Public service motivation',
    'General studies focus',
    'Administrative career goal',
    'Prestige and stability seeking',
  ],
  [DecisionContextType.STATE_PSC_PREPARATION]: [
    'Regional focus',
    'State-level opportunities',
    'Administrative career',
    'Local language advantage',
    'Regional network building',
  ],
  [DecisionContextType.CA_PATHWAY]: [
    'Professional qualification focus',
    'Structured multi-level pathway',
    'Articleship requirement',
    'Finance and accounting focus',
    'Industry-recognized credential',
  ],
  [DecisionContextType.CS_PATHWAY]: [
    'Corporate governance focus',
    'Compliance specialization',
    'Company law expertise',
    'Board-level opportunities',
    'Regulatory knowledge',
  ],
  [DecisionContextType.CMA_PATHWAY]: [
    'Cost management focus',
    'Manufacturing industry fit',
    'Financial analysis skills',
    'Strategic decision support',
    'Professional qualification',
  ],
  [DecisionContextType.COLLEGE_SELECTION]: [
    'Multi-criteria evaluation',
    'Location considerations',
    'Reputation and ranking focus',
    'Infrastructure assessment',
    'Peer network formation',
  ],
  [DecisionContextType.SCHOOL_SELECTION]: [
    'Foundation building phase',
    'Board curriculum choice',
    'Long-term impact decision',
    'Parental involvement high',
    'Peer environment crucial',
  ],
  [DecisionContextType.COURSE_SELECTION]: [
    'Specialization decision',
    'Career pathway alignment',
    'Interest-capability match',
    'Market demand consideration',
    'Future flexibility impact',
  ],
  [DecisionContextType.CAREER_EXPLORATION]: [
    'Information gathering phase',
    'Open to multiple paths',
    'Self-discovery focus',
    'Low commitment level',
    'Broad evaluation criteria',
  ],
  [DecisionContextType.EARLY_CAREER]: [
    'Skill building focus',
    'Professional identity forming',
    'Learning mindset',
    'Network establishment',
    'Foundation setting phase',
  ],
  [DecisionContextType.MID_CAREER]: [
    'Expertise leverage',
    'Growth acceleration',
    'Leadership transition',
    'Specialization decision',
    'Value maximization focus',
  ],
  [DecisionContextType.CAREER_SWITCH]: [
    'Transition risk assessment',
    'Skill transfer planning',
    'Network rebuilding',
    'Financial bridge planning',
    'Identity recalibration',
  ],
  [DecisionContextType.INDUSTRY_TRANSITION]: [
    'Domain knowledge gap',
    'Network rebuilding required',
    'Transferable skills focus',
    'Entry-level positioning',
    'Learning curve expectation',
  ],
  [DecisionContextType.STARTUP_EXPLORATION]: [
    'Idea validation focus',
    'Risk tolerance assessment',
    'Market opportunity search',
    'Co-founder considerations',
    'Funding exploration',
  ],
  [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: [
    'Execution mode',
    'Multi-role responsibility',
    'Resource constraints',
    'Rapid learning required',
    'High commitment level',
  ],
  [DecisionContextType.FAMILY_BUSINESS]: [
    'Legacy considerations',
    'Family dynamics involved',
    'Succession planning',
    'Multi-generational view',
    'Emotional attachment',
  ],
  [DecisionContextType.REGIONAL_CONSTRAINT]: [
    'Limited geography options',
    'Local market knowledge',
    'Regional network dependency',
    'Infrastructure limitations',
    'Cultural familiarity',
  ],
  [DecisionContextType.FINANCIAL_CONSTRAINT]: [
    'ROI sensitivity high',
    'Cost-benefit analysis',
    'Resource optimization',
    'Funding source dependency',
    'Risk aversion elevated',
  ],
  [DecisionContextType.TIME_CONSTRAINT]: [
    'Efficiency prioritization',
    'Flexible options needed',
    'Part-time pathways',
    'Accelerated timelines',
    'Time-boxed decisions',
  ],
};

/**
 * Context Explanation Engine
 * 
 * Generates human-readable explanations for context detection results.
 */
export class ContextExplanationEngine {
  private config: ExplanationConfig;
  
  constructor(config: Partial<ExplanationConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }
  
  /**
   * Generate explanation for a single detected context.
   */
  explain(context: DetectedContext, allContexts: DetectedContext[]): string {
    const template = CONTEXT_EXPLANATION_TEMPLATES[context.context];
    
    if (!template) {
      return `Context detected: ${getContextTypeLabel(context.context)}`;
    }
    
    // Choose primary or secondary template based on priority
    let explanation = context.priority === ContextPriority.PRIMARY
      ? template.primary
      : template.secondary;
    
    // Add evidence details if enabled and verbosity allows
    if (this.config.includeEvidence && this.config.verbosity !== 'minimal') {
      const evidenceDetail = this.formatEvidenceSummary(context.evidence, template.evidenceTypes);
      if (evidenceDetail) {
        explanation += `\n\n${evidenceDetail}`;
      }
    }
    
    // Add confidence context
    if (this.config.verbosity === 'detailed') {
      explanation += `\n\nDetection confidence: ${(context.confidence * 100).toFixed(0)}%`;
    }
    
    // Add uncertainty note if significant
    if (this.config.includeUncertainty && context.uncertainty.score > 0.4) {
      explanation += `\n\nNote: ${context.uncertainty.explanation}`;
    }
    
    return this.truncateIfNeeded(explanation);
  }
  
  /**
   * Generate narrative summary for complete context analysis.
   */
  generateNarrative(analysis: ContextAnalysis): ContextNarrative {
    const contexts = analysis.contexts;
    
    if (contexts.length === 0) {
      return {
        summary: 'No specific context detected.',
        detailed: 'Insufficient data to determine your current decision context. Please provide more information about your current situation and goals.',
        insight: 'Context detection requires more assessment data or explicit goal statements.',
        implications: 'Career recommendations will be generic until your specific context is understood.',
      };
    }
    
    const primary = analysis.primaryContext;
    const secondary = analysis.secondaryContexts;
    
    // Generate summary
    const summary = this.generateSummary(primary, secondary);
    
    // Generate detailed narrative
    const detailed = this.generateDetailedNarrative(analysis);
    
    // Generate insight
    const insight = this.generateInsight(analysis);
    
    // Generate implications
    const implications = this.generateImplications(analysis);
    
    return {
      summary,
      detailed,
      insight,
      implications,
      contextInteraction: secondary.length > 0 
        ? this.generateContextInteraction(primary, secondary)
        : undefined,
    };
  }
  
  /**
   * Generate one-sentence summary.
   */
  private generateSummary(
    primary: DetectedContext | undefined,
    secondary: DetectedContext[]
  ): string {
    if (!primary) {
      return 'Multiple contexts detected without a clear primary focus.';
    }
    
    const primaryLabel = getContextTypeLabel(primary.context);
    
    if (secondary.length === 0) {
      return `You are currently in a ${primaryLabel} context.`;
    }
    
    const secondaryLabels = secondary.slice(0, 2).map(c => getContextTypeLabel(c.context));
    
    if (secondary.length === 1) {
      return `You are primarily in a ${primaryLabel} context, with ${secondaryLabels[0]} as a secondary consideration.`;
    }
    
    return `You are primarily in a ${primaryLabel} context, also considering ${secondaryLabels.join(' and ')}.`;
  }
  
  /**
   * Generate detailed narrative.
   */
  private generateDetailedNarrative(analysis: ContextAnalysis): string {
    const parts: string[] = [];
    
    // Add primary context description
    if (analysis.primaryContext) {
      const template = CONTEXT_EXPLANATION_TEMPLATES[analysis.primaryContext.context];
      if (template) {
        parts.push(template.primary);
      }
    }
    
    // Add secondary contexts
    if (analysis.secondaryContexts.length > 0) {
      parts.push('\nAdditionally:');
      for (const context of analysis.secondaryContexts.slice(0, 2)) {
        const template = CONTEXT_EXPLANATION_TEMPLATES[context.context];
        if (template) {
          parts.push(`• ${template.secondary}`);
        }
      }
    }
    
    // Add conflict information if present
    if (analysis.conflicts.length > 0) {
      parts.push('\n\nNote: Some tension exists between your contexts that may need resolution.');
    }
    
    return parts.join('\n');
  }
  
  /**
   * Generate key insight about context landscape.
   */
  private generateInsight(analysis: ContextAnalysis): string {
    const contexts = analysis.contexts;
    
    if (contexts.length === 1) {
      return `Your context is clear and focused. Recommendations can be highly specific to your ${getContextTypeLabel(contexts[0].context)} situation.`;
    }
    
    if (analysis.conflicts.length > 0) {
      return `You have multiple competing priorities. Focus on resolving conflicts between ${analysis.conflicts[0].contextIds.map(c => getContextTypeLabel(c)).join(' and ')} before making major decisions.`;
    }
    
    if (contexts.length >= 3) {
      return `You are exploring multiple pathways simultaneously. Consider whether this diversification is strategic or indicates uncertainty about priorities.`;
    }
    
    return `You have a primary focus with secondary interests. This multi-context approach can provide valuable optionality if managed well.`;
  }
  
  /**
   * Generate implications for career decisions.
   */
  private generateImplications(analysis: ContextAnalysis): string {
    if (!analysis.primaryContext) {
      return 'Without a clear primary context, career recommendations will focus on exploration and information gathering.';
    }
    
    const category = CONTEXT_TYPE_CATEGORIES[analysis.primaryContext.context];
    
    const implicationsByCategory: Record<ContextCategory, string> = {
      [ContextCategory.ENTRANCE_EXAM]: 
        'Your decisions should prioritize exam performance and admission outcomes. Short-term focus on preparation is appropriate.',
      [ContextCategory.PROFESSIONAL_QUALIFICATION]: 
        'Your pathway is structured and credential-focused. Follow the established progression while building complementary skills.',
      [ContextCategory.EDUCATION_SELECTION]: 
        'Your decisions should balance immediate constraints with long-term flexibility. Institution and environment quality matter significantly.',
      [ContextCategory.CAREER_PHASE]: 
        'Focus on building foundational capabilities and professional identity. Early choices have compounding effects over time.',
      [ContextCategory.CAREER_TRANSITION]: 
        'Manage transition risks carefully. Bridge strategies and skill transfer are critical success factors.',
      [ContextCategory.ENTREPRENEURIAL]: 
        'Your context requires high risk tolerance and resource management. Validation and iteration are more important than perfect planning.',
      [ContextCategory.FAMILY_CONTEXT]: 
        'Balance family expectations with personal aspirations. Communication and succession planning are key challenges.',
      [ContextCategory.CONSTRAINT_DRIVEN]: 
        'Work within constraints creatively. Focus on optimizing available options rather than lamenting limitations.',
    };
    
    return implicationsByCategory[category] || 'Your context shapes which career options are most viable and how you should evaluate them.';
  }
  
  /**
   * Generate explanation of how contexts interact.
   */
  private generateContextInteraction(
    primary: DetectedContext | undefined,
    secondary: DetectedContext[]
  ): string {
    if (!primary || secondary.length === 0) {
      return '';
    }
    
    const interactions: string[] = [];
    
    for (const sec of secondary) {
      if (this.areContextsComplementary(primary.context, sec.context)) {
        interactions.push(`${getContextTypeLabel(sec.context)} complements your primary context and may provide valuable optionality.`);
      } else if (this.areContextsCompeting(primary.context, sec.context)) {
        interactions.push(`${getContextTypeLabel(sec.context)} competes for resources with your primary context. Consider timing and prioritization.`);
      }
    }
    
    return interactions.join(' ');
  }
  
  /**
   * Generate characteristics for a context.
   */
  generateCharacteristics(context: DetectedContext): string[] {
    return CONTEXT_CHARACTERISTICS[context.context] || [
      'Context-specific characteristics not defined',
    ];
  }
  
  /**
   * Explain a conflict between contexts.
   */
  explainConflict(conflict: ContextConflict, contexts: DetectedContext[]): string {
    const contextLabels = conflict.contextIds.map(id => {
      const context = contexts.find(c => c.context === id);
      return context ? getContextTypeLabel(context.context) : id;
    });
    
    switch (conflict.type) {
      case 'mutually_exclusive':
        return `${contextLabels.join(' and ')} are typically mutually exclusive. You likely need to choose one as your primary focus.`;
      
      case 'resource_competition':
        return `${contextLabels.join(' and ')} both require significant time and energy. Consider whether you can sustain both simultaneously.`;
      
      case 'priority_dispute':
        return `Similar confidence levels for ${contextLabels.join(' and ')} suggest uncertainty about your primary focus. Additional clarity needed.`;
      
      case 'temporal_conflict':
        return `${contextLabels.join(' and ')} have conflicting timing requirements. You may need to sequence these rather than pursue them together.`;
      
      default:
        return conflict.description;
    }
  }
  
  /**
   * Format evidence summary for explanation.
   */
  private formatEvidenceSummary(
    evidence: ContextEvidence[],
    evidenceTypes: Record<string, string>
  ): string | null {
    if (evidence.length === 0) {
      return null;
    }
    
    const parts: string[] = ['This was detected because:'];
    
    // Group by evidence type
    const grouped = this.groupEvidenceByType(evidence);
    
    for (const [type, items] of grouped) {
      const description = evidenceTypes[type] || `${items.length} ${type.toLowerCase().replace('_', ' ')} signals`;
      parts.push(`• ${description}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * Group evidence by type.
   */
  private groupEvidenceByType(evidence: ContextEvidence[]): Map<EvidenceType, ContextEvidence[]> {
    const grouped = new Map<EvidenceType, ContextEvidence[]>();
    
    for (const item of evidence) {
      const existing = grouped.get(item.type) || [];
      existing.push(item);
      grouped.set(item.type, existing);
    }
    
    return grouped;
  }
  
  /**
   * Check if two contexts are complementary.
   */
  private areContextsComplementary(a: DecisionContextType, b: DecisionContextType): boolean {
    const complementaryPairs: [DecisionContextType, DecisionContextType][] = [
      [DecisionContextType.COLLEGE_SELECTION, DecisionContextType.CAREER_EXPLORATION],
      [DecisionContextType.STARTUP_EXPLORATION, DecisionContextType.EARLY_CAREER],
      [DecisionContextType.CAREER_EXPLORATION, DecisionContextType.EARLY_CAREER],
    ];
    
    return complementaryPairs.some(
      ([p1, p2]) => (p1 === a && p2 === b) || (p1 === b && p2 === a)
    );
  }
  
  /**
   * Check if two contexts are competing.
   */
  private areContextsCompeting(a: DecisionContextType, b: DecisionContextType): boolean {
    const competingPairs: [DecisionContextType, DecisionContextType][] = [
      [DecisionContextType.JEE_PREPARATION, DecisionContextType.STARTUP_EXPLORATION],
      [DecisionContextType.UPSC_PREPARATION, DecisionContextType.EARLY_CAREER],
      [DecisionContextType.CAREER_SWITCH, DecisionContextType.ENTREPRENEURSHIP_BUILDING],
    ];
    
    return competingPairs.some(
      ([p1, p2]) => (p1 === a && p2 === b) || (p1 === b && p2 === a)
    );
  }
  
  /**
   * Truncate explanation if too long.
   */
  private truncateIfNeeded(text: string): string {
    if (text.length <= this.config.maxLength) {
      return text;
    }
    
    return text.substring(0, this.config.maxLength - 3) + '...';
  }
  
  /**
   * Update configuration.
   */
  updateConfig(config: Partial<ExplanationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for creating explanation engine.
 */
export function createContextExplanationEngine(
  config?: Partial<ExplanationConfig>
): ContextExplanationEngine {
  return new ContextExplanationEngine(config);
}
