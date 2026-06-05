/**
 * Outcome Evidence Engine - Explanations
 * 
 * Human-readable explanation generation for outcome evidence.
 * 
 * Design Principle: Every piece of evidence must be explainable
 * with clear reasoning from source data to conclusion.
 */

import type {
  OutcomeEvidence,
  OutcomeEvidenceType,
  EffectDirection,
  EvidenceQuality,
  StatisticalSignificance,
  EvidenceDerivationExplanation,
  DerivationStep,
  OutcomeGroupComparison,
  MetricComparison,
} from './types.js';

// ============================================================================
// MAIN EXPLANATION GENERATION
// ============================================================================

/**
 * Generate detailed explanation for outcome evidence.
 */
export function generateEvidenceExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  // Main finding
  parts.push(generateMainFinding(evidence));
  
  // Statistical basis
  parts.push(generateStatisticalExplanation(evidence));
  
  // Quality assessment
  parts.push(generateQualityExplanation(evidence));
  
  // Applicability
  parts.push(generateApplicabilityExplanation(evidence));
  
  // Limitations
  parts.push(generateLimitationsExplanation(evidence));
  
  return parts.join('\n\n');
}

/**
 * Generate main finding description.
 */
function generateMainFinding(evidence: OutcomeEvidence): string {
  const pathName = evidence.paths.primary;
  const comparisonPath = evidence.paths.comparison;
  
  let finding = '';
  
  switch (evidence.type) {
    case 'path_comparison':
      if (comparisonPath) {
        const advantage = evidence.outcome.direction === 'positive' 
          ? 'outperforms' 
          : 'underperforms';
        finding = `Students who chose ${pathName} ${advantage} those who chose ${comparisonPath}`;
        if (evidence.outcome.measuredDifference) {
          finding += ` by ${Math.abs(evidence.outcome.measuredDifference).toFixed(2)} ${evidence.outcome.unit || 'points'}`;
        }
        finding += ` in ${evidence.outcome.metric}.`;
      }
      break;
      
    case 'trait_predictor':
      finding = `Students with ${formatTraits(evidence.profile.traits)} who chose ${pathName}`;
      finding += ` tend to report ${evidence.outcome.direction === 'positive' ? 'higher' : 'lower'} ${evidence.outcome.metric}.`;
      break;
      
    case 'satisfaction_driver':
      finding = `For students choosing ${pathName}, having ${formatTraits(evidence.profile.traits)}`;
      finding += ` is associated with ${evidence.outcome.direction === 'positive' ? 'increased' : 'decreased'} satisfaction.`;
      break;
      
    case 'regret_pattern':
      finding = `Students with ${formatTraits(evidence.profile.traits)} who chose ${pathName}`;
      finding += ` show ${evidence.outcome.direction === 'positive' ? 'higher' : 'lower'} rates of decision regret.`;
      break;
      
    case 'success_factor':
      finding = `${formatTraits(evidence.profile.traits)} is a factor in successful outcomes for ${pathName}.`;
      break;
      
    default:
      finding = evidence.description;
  }
  
  return `**Finding:** ${finding}`;
}

/**
 * Generate statistical explanation.
 */
function generateStatisticalExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  parts.push(`**Statistical Basis:**`);
  parts.push(`- Sample size: ${evidence.statistics.sampleSize} students`);
  
  if (evidence.statistics.comparisonSampleSize) {
    parts.push(`- Comparison group: ${evidence.statistics.comparisonSampleSize} students`);
  }
  
  parts.push(`- Statistical significance: ${formatSignificance(evidence.statistics.significance)}`);
  parts.push(`- Confidence: ${(evidence.statistics.confidence * 100).toFixed(0)}%`);
  
  if (evidence.statistics.effectSize) {
    const effectDescription = evidence.statistics.effectSize > 0.8 ? 'large' :
                              evidence.statistics.effectSize > 0.5 ? 'moderate' :
                              evidence.statistics.effectSize > 0.2 ? 'small' : 'negligible';
    parts.push(`- Effect size: ${effectDescription} (${evidence.statistics.effectSize.toFixed(2)})`);
  }
  
  if (evidence.statistics.confidenceInterval) {
    parts.push(`- 95% confidence interval: [${evidence.statistics.confidenceInterval.lower.toFixed(2)}, ${evidence.statistics.confidenceInterval.upper.toFixed(2)}]`);
  }
  
  return parts.join('\n');
}

/**
 * Generate quality assessment explanation.
 */
function generateQualityExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  parts.push(`**Evidence Quality (${evidence.quality.toUpperCase()}):**`);
  parts.push(`- Sample size factor: ${(evidence.qualityFactors.sampleSize * 100).toFixed(0)}%`);
  parts.push(`- Methodology factor: ${(evidence.qualityFactors.methodology * 100).toFixed(0)}%`);
  parts.push(`- Data quality factor: ${(evidence.qualityFactors.dataQuality * 100).toFixed(0)}%`);
  parts.push(`- Consistency factor: ${(evidence.qualityFactors.consistency * 100).toFixed(0)}%`);
  
  const qualityDescriptions: Record<EvidenceQuality, string> = {
    high: 'This evidence is based on robust data with validated methodology.',
    medium: 'This evidence is based on adequate data with sound methodology.',
    low: 'This evidence should be interpreted cautiously due to limited data.',
    insufficient: 'This evidence is preliminary and requires more data for reliability.',
  };
  
  parts.push(`\n${qualityDescriptions[evidence.quality]}`);
  
  return parts.join('\n');
}

/**
 * Generate applicability explanation.
 */
function generateApplicabilityExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  parts.push(`**Applicability:**`);
  
  if (evidence.profile.traits.length > 0) {
    parts.push(`This evidence applies to students with the following characteristics:`);
    for (const trait of evidence.profile.traits) {
      const level = typeof trait.level === 'string' ? trait.level : `${trait.level.min}-${trait.level.max}`;
      parts.push(`- ${trait.trait} (${trait.category}): ${level}`);
    }
  } else {
    parts.push(`This evidence applies broadly across student profiles.`);
  }
  
  parts.push(`\nRelevant career path: ${evidence.paths.primary}`);
  if (evidence.paths.comparison) {
    parts.push(`Comparison path: ${evidence.paths.comparison}`);
  }
  
  return parts.join('\n');
}

/**
 * Generate limitations explanation.
 */
function generateLimitationsExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  parts.push(`**Limitations:**`);
  
  const limitations: string[] = [];
  
  if (evidence.statistics.sampleSize < 20) {
    limitations.push('Small sample size may limit generalizability');
  }
  
  if (evidence.statistics.significance === 'not_significant') {
    limitations.push('Results did not reach statistical significance');
  } else if (evidence.statistics.significance === 'marginally_significant') {
    limitations.push('Results are marginally significant and should be confirmed');
  }
  
  if (!evidence.isValidated) {
    limitations.push('This evidence has not been validated against independent data');
  }
  
  // Time range limitation
  const timeRange = evidence.sources.timeRange;
  const timeSpan = timeRange.end - timeRange.start;
  const months = Math.floor(timeSpan / (30 * 24 * 60 * 60 * 1000));
  if (months < 6) {
    limitations.push('Limited time range of source data');
  }
  
  if (limitations.length === 0) {
    limitations.push('Standard limitations apply: observational data, potential confounding factors');
  }
  
  for (const limitation of limitations) {
    parts.push(`- ${limitation}`);
  }
  
  return parts.join('\n');
}

// ============================================================================
// DERIVATION EXPLANATION
// ============================================================================

/**
 * Generate step-by-step derivation explanation.
 */
export function generateDerivationExplanation(
  comparison: OutcomeGroupComparison,
  evidenceType: OutcomeEvidenceType
): EvidenceDerivationExplanation {
  const steps: DerivationStep[] = [];
  
  // Step 1: Data selection
  steps.push({
    step: 1,
    description: 'Select outcome records matching criteria',
    input: `All outcome records for path "${comparison.pathId}"`,
    operation: 'Filter by student profile traits',
    output: `Group A: ${comparison.groupA.size} records, Group B: ${comparison.groupB.size} records`,
    reasoning: 'Compare outcomes between different student profiles on the same path',
  });
  
  // Step 2: Extract metrics
  steps.push({
    step: 2,
    description: 'Extract outcome metrics',
    input: 'Raw outcome snapshots and final outcomes',
    operation: 'Aggregate metric values per group',
    output: `Metrics extracted: ${Array.from(comparison.metrics.keys()).join(', ')}`,
    reasoning: 'Quantify outcomes for statistical comparison',
  });
  
  // Step 3: Calculate statistics
  let stepNum = 3;
  for (const [metric, metricComparison] of comparison.metrics) {
    steps.push({
      step: stepNum++,
      description: `Statistical analysis: ${metric}`,
      input: `Group A: ${metricComparison.groupA.mean.toFixed(2)} ± ${metricComparison.groupA.stdDev.toFixed(2)}, Group B: ${metricComparison.groupB.mean.toFixed(2)} ± ${metricComparison.groupB.stdDev.toFixed(2)}`,
      operation: `${metricComparison.statisticalTest.testName} (p = ${metricComparison.statisticalTest.pValue.toFixed(4)})`,
      output: `${formatSignificance(metricComparison.statisticalTest.significance)}, effect size = ${metricComparison.difference.effectSize.toFixed(2)}`,
      reasoning: 'Determine if observed difference is statistically significant',
    });
  }
  
  // Step 4: Calculate confidence
  steps.push({
    step: stepNum,
    description: 'Calculate confidence score',
    input: `Sample sizes: ${comparison.groupA.size}, ${comparison.groupB.size}`,
    operation: 'Weighted combination of sample size and significance',
    output: `Confidence: ${(comparison.summary.confidence * 100).toFixed(0)}%`,
    reasoning: 'Reflect reliability based on data quantity and statistical strength',
  });
  
  // Data summary
  const allRecords = [...comparison.groupA.records, ...comparison.groupB.records];
  const metricValues: number[] = [];
  for (const metricComparison of comparison.metrics.values()) {
    metricValues.push(metricComparison.groupA.mean, metricComparison.groupB.mean);
  }
  
  // Generate narrative
  const narrative = generateNarrative(comparison, evidenceType);
  
  return {
    steps,
    dataSummary: {
      totalRecords: allRecords.length,
      matchingRecords: allRecords.length,
      averageOutcome: metricValues.length > 0 ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length : 0,
      variance: calculateVariance(metricValues),
    },
    methodology: {
      comparisonType: evidenceType,
      statisticalTest: "Welch's t-test",
      assumptions: [
        'Independent samples',
        'Approximately normal distribution',
        'Continuous outcome variable',
      ],
      limitations: [
        'Observational data - causation not established',
        'Potential confounding variables',
        'Sample may not represent all students',
      ],
    },
    narrative,
  };
}

/**
 * Generate narrative summary.
 */
function generateNarrative(
  comparison: OutcomeGroupComparison,
  evidenceType: OutcomeEvidenceType
): string {
  const groupAName = comparison.groupA.name;
  const groupBName = comparison.groupB.name;
  const pathName = comparison.pathId;
  
  let narrative = '';
  
  if (evidenceType === 'path_comparison') {
    const superior = comparison.summary.superiorGroup;
    const groupName = superior === 'A' ? groupAName : superior === 'B' ? groupBName : 'neither group';
    
    narrative = `Analysis of ${comparison.groupA.size + comparison.groupB.size} students who chose ${pathName} `;
    narrative += `compared outcomes between ${groupAName} and ${groupBName}. `;
    
    if (superior !== 'NEITHER') {
      narrative += `${groupName} showed superior outcomes with `;
      narrative += `${(comparison.summary.confidence * 100).toFixed(0)}% confidence. `;
    } else {
      narrative += `No significant difference was found between groups. `;
    }
    
    narrative += `This evidence is based on statistical comparison with `;
    narrative += `${comparison.metrics.size} outcome metrics analyzed.`;
  } else {
    narrative = `Analysis of student outcomes on ${pathName} comparing `;
    narrative += `${groupAName} (n=${comparison.groupA.size}) with ${groupBName} (n=${comparison.groupB.size}). `;
    narrative += `Results show ${comparison.summary.superiorGroup !== 'NEITHER' ? 'significant' : 'no significant'} `;
    narrative += `differences with ${(comparison.summary.confidence * 100).toFixed(0)}% confidence.`;
  }
  
  return narrative;
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format trait filters for display.
 */
function formatTraits(traits: { category: string; trait: string; level: unknown }[]): string {
  if (traits.length === 0) return 'no specific traits';
  if (traits.length === 1) {
    const level = typeof traits[0].level === 'string' ? traits[0].level : 'specific';
    return `${level} ${traits[0].trait}`;
  }
  if (traits.length === 2) {
    return `${traits[0].trait} and ${traits[1].trait}`;
  }
  return traits.slice(0, -1).map(t => t.trait).join(', ') + ' and ' + traits[traits.length - 1].trait;
}

/**
 * Format statistical significance for display.
 */
function formatSignificance(significance: StatisticalSignificance): string {
  const descriptions: Record<StatisticalSignificance, string> = {
    highly_significant: 'highly significant (p < 0.01)',
    significant: 'significant (p < 0.05)',
    marginally_significant: 'marginally significant (p < 0.10)',
    not_significant: 'not significant (p ≥ 0.10)',
  };
  return descriptions[significance];
}

/**
 * Format effect direction.
 */
export function formatEffectDirection(direction: EffectDirection): string {
  const descriptions: Record<EffectDirection, string> = {
    positive: 'positive effect',
    negative: 'negative effect',
    neutral: 'no significant effect',
    mixed: 'mixed effects depending on context',
  };
  return descriptions[direction];
}

/**
 * Calculate variance.
 */
function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

// ============================================================================
// SIMPLE EXPLANATIONS
// ============================================================================

/**
 * Generate one-sentence summary of evidence.
 */
export function generateOneSentenceSummary(evidence: OutcomeEvidence): string {
  const quality = evidence.quality === 'high' ? 'Strong' : 
                  evidence.quality === 'medium' ? 'Moderate' : 'Limited';
  
  const metric = evidence.outcome.metric;
  const direction = evidence.outcome.direction === 'positive' ? 'higher' : 'lower';
  const path = evidence.paths.primary;
  
  if (evidence.paths.comparison) {
    return `${quality} evidence that ${path} leads to ${direction} ${metric} compared to ${evidence.paths.comparison} for students with ${formatTraits(evidence.profile.traits)}.`;
  }
  
  return `${quality} evidence that students with ${formatTraits(evidence.profile.traits)} achieve ${direction} ${metric} on ${path}.`;
}

/**
 * Generate explanation for specific audience.
 */
export function generateAudienceExplanation(
  evidence: OutcomeEvidence,
  audience: 'student' | 'counselor' | 'researcher'
): string {
  switch (audience) {
    case 'student':
      return generateStudentExplanation(evidence);
    case 'counselor':
      return generateCounselorExplanation(evidence);
    case 'researcher':
      return generateEvidenceExplanation(evidence);
    default:
      return generateEvidenceExplanation(evidence);
  }
}

/**
 * Generate student-friendly explanation.
 */
function generateStudentExplanation(evidence: OutcomeEvidence): string {
  const pathName = evidence.paths.primary;
  const traits = formatTraits(evidence.profile.traits);
  
  let explanation = '';
  
  if (evidence.outcome.direction === 'positive') {
    explanation = `Students like you (with ${traits}) who chose ${pathName} reported `;
    explanation += `${evidence.outcome.metric} that was `;
    if (evidence.outcome.measuredDifference) {
      explanation += `${Math.abs(evidence.outcome.measuredDifference).toFixed(1)} points `;
    }
    explanation += `higher than similar students who chose other paths. `;
  } else {
    explanation = `Students like you who chose ${pathName} didn't see as much `;
    explanation += `${evidence.outcome.metric} as those who chose other paths. `;
  }
  
  explanation += `This is based on data from ${evidence.statistics.sampleSize} students.`;
  
  if (evidence.quality === 'low' || evidence.quality === 'insufficient') {
    explanation += ` Note: This is preliminary evidence and may not apply to everyone.`;
  }
  
  return explanation;
}

/**
 * Generate counselor-focused explanation.
 */
function generateCounselorExplanation(evidence: OutcomeEvidence): string {
  const parts: string[] = [];
  
  parts.push(`**Recommendation Evidence:**`);
  parts.push(generateMainFinding(evidence));
  parts.push('');
  parts.push(generateStatisticalExplanation(evidence));
  parts.push('');
  parts.push(`**When to Apply:**`);
  parts.push(`Use this evidence when advising students with ${formatTraits(evidence.profile.traits)} `);
  parts.push(`who are considering ${evidence.paths.primary}.`);
  
  if (evidence.quality !== 'high') {
    parts.push('');
    parts.push(`**Caution:** ${evidence.quality === 'medium' ? 'Moderate' : 'Low'} quality evidence - `);
    parts.push('consider as one factor among many.');
  }
  
  return parts.join('\n');
}
