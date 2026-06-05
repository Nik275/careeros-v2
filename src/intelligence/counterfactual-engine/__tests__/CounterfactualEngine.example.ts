/**
 * CareerOS Counterfactual Engine - Usage Examples
 *
 * Demonstrates how to use the Counterfactual Engine to compare career futures.
 *
 * @example
 * ```typescript
 * // Compare Medicine vs Software Engineering
 * const comparison = compareMedicineVsSoftwareEngineering();
 * console.log(comparison.summary.headline);
 *
 * // Compare any two careers
 * const customComparison = compareCareersBySlug(
 *   'software-engineer',
 *   'product-manager'
 * );
 * ```
 */

import {
  // Pre-built comparisons
  compareMedicineVsSoftwareEngineering,
  compareAIEngineerVsDataScientist,
  compareEngineerVsProductManager,
  compareBankingVsEngineering,
  compareCivilServicesVsCorporate,
  compareCAVsEngineering,
  compareLawVsEngineering,
  compareDesignVsEngineering,
  compareResearchVsIndustry,
  compareConsultingVsEngineering,

  // Generic comparison functions
  compareCareersBySlug,
  compareAnyCareers,
  compareAgainstAlternatives,
  getAllComparisonScenarios,
  getComparisonsByCategory,

  // Engine and adapters
  CounterfactualEngine,
  createCounterfactualEngine,
  adaptCareerToPathData,
  createCareerComparisonPair,
} from '@/intelligence';

import {
  SOFTWARE_ENGINEER,
  DOCTOR,
  AI_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  INVESTMENT_BANKER,
  IAS_OFFICER,
  CHARTERED_ACCOUNTANT,
  CORPORATE_LAWYER,
  UX_DESIGNER,
  RESEARCH_SCIENTIST,
  MANAGEMENT_CONSULTANT,
  getEliteCareerBySlug,
} from '@/data';

// ============================================================================
// EXAMPLE 1: Classic Medicine vs Software Engineering Dilemma
// ============================================================================

export function example1_ClassicDilemma() {
  console.log('=== Example 1: Medicine vs Software Engineering ===\n');

  // This is the most common career dilemma in India
  const comparison = compareMedicineVsSoftwareEngineering();

  // Print summary
  console.log('SUMMARY:');
  console.log(comparison.summary.headline);
  console.log('\nKey Takeaways:');
  comparison.summary.takeaways.forEach(t => console.log(`  • ${t}`));

  // Print opportunity analysis
  console.log('\nOPPORTUNITIES:');
  console.log(`Gained: ${comparison.opportunities.gained.length} unique opportunities`);
  console.log(`Lost: ${comparison.opportunities.lost.length} unique opportunities`);
  console.log(`Net opportunity cost: ${comparison.opportunities.opportunityCost.netOpportunityCost}`);

  // Print income comparison
  console.log('\nINCOME COMPARISON:');
  console.log(`Starting: ${comparison.income.startingIncome.higher} pays more`);
  console.log(`Peak: ${comparison.income.peakIncome.higher} pays more`);
  console.log(`Difference: ${comparison.income.averageIncome.percentageDifference.toFixed(1)}%`);

  // Print optionality comparison
  console.log('\nOPTIONALITY:');
  console.log(`${comparison.optionality.maintainsMoreOptions} maintains more future options`);

  // Print regret analysis
  console.log('\nREGRET ANALYSIS:');
  console.log(`${comparison.regret.minimizesRegret} minimizes long-term regret`);

  // Print decision framework
  console.log('\nDECISION FRAMEWORK:');
  console.log('Choose Medicine if:');
  comparison.explanation.decisionFramework.choosePrimaryIf.forEach(s => console.log(`  • ${s}`));
  console.log('\nChoose Software Engineering if:');
  comparison.explanation.decisionFramework.chooseAlternativeIf.forEach(s => console.log(`  • ${s}`));

  return comparison;
}

// ============================================================================
// EXAMPLE 2: Tech Career Path Comparison
// ============================================================================

export function example2_TechCareerPaths() {
  console.log('\n=== Example 2: AI Engineer vs Data Scientist ===\n');

  const comparison = compareAIEngineerVsDataScientist();

  console.log('SUMMARY:');
  console.log(comparison.summary.headline);

  console.log('\nSKILLS DIFFERENCE:');
  console.log('AI Engineer unique skills:');
  comparison.differences.skills.primaryUniqueSkills.forEach(s => console.log(`  • ${s}`));
  console.log('\nData Scientist unique skills:');
  comparison.differences.skills.alternativeUniqueSkills.forEach(s => console.log(`  • ${s}`));

  console.log('\nTRANSFERABILITY:');
  console.log(`${comparison.differences.skills.transferability.moreTransferable} has more transferable skills`);

  return comparison;
}

// ============================================================================
// EXAMPLE 3: Engineer vs Product Manager (IC vs Management)
// ============================================================================

export function example3_EngineerVsPM() {
  console.log('\n=== Example 3: Software Engineer vs Product Manager ===\n');

  const comparison = compareEngineerVsProductManager();

  console.log('SUMMARY:');
  console.log(comparison.summary.headline);

  console.log('\nLIFESTYLE DIFFERENCES:');
  console.log(`Work-life balance: ${comparison.differences.lifestyle.workLifeBalance.better}`);
  console.log(`Stress level: ${comparison.differences.lifestyle.stressLevel.better} (lower stress)`);
  console.log(`Schedule flexibility: ${comparison.differences.lifestyle.scheduleFlexibility.better}`);

  console.log('\nSATISFACTION BY DIMENSION:');
  comparison.satisfaction.byDimension.forEach(d => {
    console.log(`  ${d.dimension}: ${d.better} (${d.difference > 0 ? '+' : ''}${d.difference})`);
  });

  return comparison;
}

// ============================================================================
// EXAMPLE 4: Custom Career Comparison
// ============================================================================

export function example4_CustomComparison() {
  console.log('\n=== Example 4: Custom Comparison (Any Two Careers) ===\n');

  // Compare any two careers by slug
  const comparison = compareCareersBySlug('software-engineer', 'investment-banker');

  if (comparison) {
    console.log('SUMMARY:');
    console.log(comparison.summary.headline);

    console.log('\nRISK COMPARISON:');
    console.log(`Overall risk: ${comparison.risk.riskierPath} is riskier`);
    comparison.risk.byCategory.forEach(r => {
      console.log(`  ${r.category}: ${r.riskier} (${r.difference > 0 ? '+' : ''}${r.difference})`);
    });
  }

  return comparison;
}

// ============================================================================
// EXAMPLE 5: Compare Against Multiple Alternatives
// ============================================================================

export function example5_MultipleAlternatives() {
  console.log('\n=== Example 5: Compare Against Multiple Alternatives ===\n');

  const primary = SOFTWARE_ENGINEER;
  const alternatives = [DATA_SCIENTIST, PRODUCT_MANAGER, AI_ENGINEER];

  const comparisons = compareAgainstAlternatives(primary, alternatives);

  console.log(`Comparing ${primary.name} against ${alternatives.length} alternatives:\n`);

  comparisons.forEach((comparison, index) => {
    console.log(`${index + 1}. vs ${comparison.alternativePath.pathName}:`);
    console.log(`   Recommendation: ${comparison.summary.recommendation}`);
    console.log(`   Confidence: ${comparison.summary.confidence}%`);
    console.log(`   Key differentiator: ${comparison.summary.keyDifferentiator}`);
    console.log();
  });

  return comparisons;
}

// ============================================================================
// EXAMPLE 6: Explore All Available Comparisons
// ============================================================================

export function example6_ExploreComparisons() {
  console.log('\n=== Example 6: Explore All Available Comparisons ===\n');

  const allScenarios = getAllComparisonScenarios();

  console.log(`Available comparison scenarios: ${allScenarios.length}\n`);

  allScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log();
  });

  // Get comparisons by category
  const techComparisons = getComparisonsByCategory('tech');
  console.log(`\nTech comparisons: ${techComparisons.length}`);
  techComparisons.forEach(c => console.log(`  • ${c.name}`));

  return allScenarios;
}

// ============================================================================
// EXAMPLE 7: Using the Engine Directly with Custom Config
// ============================================================================

export function example7_CustomConfig() {
  console.log('\n=== Example 7: Custom Engine Configuration ===\n');

  // Create engine with custom weights
  const engine = createCounterfactualEngine({
    incomeWeight: 0.4,      // Prioritize income
    optionalityWeight: 0.2,
    satisfactionWeight: 0.2,
    regretWeight: 0.2,
    discountRate: 0.05,   // Higher discount rate (value present more)
  });

  // Create path data from careers
  const { primary, alternative } = createCareerComparisonPair(
    CHARTERED_ACCOUNTANT,
    SOFTWARE_ENGINEER
  );

  // Run comparison
  const comparison = engine.compare({
    primary,
    alternative,
    depth: 'comprehensive',
    timeHorizon: 25,
  });

  console.log('Custom weighted comparison (income prioritized):');
  console.log(comparison.summary.headline);
  console.log(`\nRecommendation: ${comparison.summary.recommendation}`);
  console.log(`Confidence: ${comparison.summary.confidence}%`);

  return comparison;
}

// ============================================================================
// EXAMPLE 8: Deep Dive into Specific Comparison
// ============================================================================

export function example8_DeepDive() {
  console.log('\n=== Example 8: Deep Dive Analysis ===\n');

  const comparison = compareConsultingVsEngineering();

  console.log('EXECUTIVE SUMMARY:');
  console.log(comparison.explanation.executiveSummary);

  console.log('\n\nDETAILED NARRATIVE:');
  console.log(comparison.explanation.narrative);

  console.log('\n\nKEY TRADE-OFFS:');
  comparison.explanation.keyTradeOffs.forEach((trade, index) => {
    console.log(`\n${index + 1}. ${trade.gain} vs ${trade.giveUp}`);
    console.log(`   Reversible: ${trade.isReversible ? 'Yes' : 'No'}`);
    console.log(`   Importance: ${trade.importance}/100`);
  });

  console.log('\n\nQUESTIONS TO CONSIDER:');
  comparison.explanation.questionsToConsider.forEach((q, index) => {
    console.log(`${index + 1}. ${q}`);
  });

  return comparison;
}

// ============================================================================
// EXAMPLE 9: Timeline and Milestone Comparison
// ============================================================================

export function example9_TimelineAnalysis() {
  console.log('\n=== Example 9: Timeline and Milestone Analysis ===\n');

  const comparison = compareMedicineVsSoftwareEngineering();

  console.log('MILESTONE COMPARISON:');
  comparison.timeline.milestones.forEach(m => {
    const diff = m.difference > 0 ? `+${m.difference} years` : `${m.difference} years`;
    console.log(`  ${m.name}: ${m.first} first (${diff})`);
  });

  console.log('\nEDUCATION TIMELINE:');
  console.log(`  Duration: ${comparison.timeline.educationTimeline.duration.primary} vs ${comparison.timeline.educationTimeline.duration.alternative} years`);

  console.log('\nCAREER TIMELINE:');
  console.log(`  Entry: ${comparison.timeline.careerTimeline.entryYear.primary} vs ${comparison.timeline.careerTimeline.entryYear.alternative}`);
  console.log(`  First promotion: ${comparison.timeline.careerTimeline.firstPromotion.faster}`);
  console.log(`  Senior level: ${comparison.timeline.careerTimeline.seniorLevel.faster}`);
  console.log(`  Leadership: ${comparison.timeline.careerTimeline.leadership.faster}`);

  console.log('\nTIME TO FINANCIAL INDEPENDENCE:');
  console.log(`  ${comparison.timeline.timeToFinancialIndependence.faster} is faster by ${Math.abs(comparison.timeline.timeToFinancialIndependence.difference)} years`);

  return comparison;
}

// ============================================================================
// EXAMPLE 10: Income Trajectory Visualization Data
// ============================================================================

export function example10_IncomeTrajectory() {
  console.log('\n=== Example 10: Income Trajectory Data ===\n');

  const comparison = compareBankingVsEngineering();

  console.log('INCOME TRAJECTORY (Year by Year):');
  console.log('Year | Banking     | Engineering | Difference');
  console.log('-----|-------------|-------------|------------');

  comparison.income.trajectory.byYear.slice(0, 15).forEach(y => {
    const diff = y.difference >= 0 ? `+${y.difference.toLocaleString()}` : y.difference.toLocaleString();
    console.log(
      `${y.year.toString().padStart(4)} | ` +
      `₹${(y.primary / 100000).toFixed(1)}L`.padStart(11) + ' | ' +
      `₹${(y.alternative / 100000).toFixed(1)}L`.padStart(11) + ' | ' +
      `₹${(y.difference / 100000).toFixed(1)}L`.padStart(10)
    );
  });

  if (comparison.income.trajectory.crossoverPoint) {
    console.log(`\nCROSSOVER POINT: Year ${comparison.income.trajectory.crossoverPoint.year}`);
    console.log(`Income at crossover: ₹${(comparison.income.trajectory.crossoverPoint.income / 100000).toFixed(1)}L`);
  }

  console.log('\nCUMULATIVE EARNINGS:');
  console.log(`5 years:  ₹${(comparison.income.cumulativeEarnings.fiveYear.primary / 100000).toFixed(1)}L vs ₹${(comparison.income.cumulativeEarnings.fiveYear.alternative / 100000).toFixed(1)}L`);
  console.log(`10 years: ₹${(comparison.income.cumulativeEarnings.tenYear.primary / 100000).toFixed(1)}L vs ₹${(comparison.income.cumulativeEarnings.tenYear.alternative / 100000).toFixed(1)}L`);
  console.log(`20 years: ₹${(comparison.income.cumulativeEarnings.twentyYear.primary / 100000).toFixed(1)}L vs ₹${(comparison.income.cumulativeEarnings.twentyYear.alternative / 100000).toFixed(1)}L`);

  return comparison;
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     CareerOS Counterfactual Engine - Usage Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  example1_ClassicDilemma();
  example2_TechCareerPaths();
  example3_EngineerVsPM();
  example4_CustomComparison();
  example5_MultipleAlternatives();
  example6_ExploreComparisons();
  example7_CustomConfig();
  example8_DeepDive();
  example9_TimelineAnalysis();
  example10_IncomeTrajectory();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   All Examples Complete!                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
