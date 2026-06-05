/**
 * Career Path Intelligence Engine - Complete Example
 * 
 * This example demonstrates the full capabilities of the Career Path Intelligence Engine:
 * - Path Discovery (direct, indirect, non-traditional routes)
 * - Path Validation (feasibility checking)
 * - Milestone Planning (critical path analysis)
 * - Alternative Path Generation (Plan B/C/D)
 * - Failure Recovery Planning
 * - Path Comparison (multi-dimensional)
 * - Path Explanations (human-readable narratives)
 * 
 * Target: Product Manager via multiple pathways
 * Student Profile: 12th pass, moderate budget, moderate risk tolerance
 * 
 * @module intelligence/career-path-intelligence
 */

import {
  createCareerPathIntelligenceEngine,
  CareerPathIntelligenceInput,
  PathType,
} from '../index';

// =============================================================================
// EXAMPLE STUDENT PROFILE
// =============================================================================

const exampleStudentProfile: CareerPathIntelligenceInput['studentProfile'] = {
  id: 'student-demo-001',
  currentEducationLevel: 'SCHOOL_12',
  currentRole: undefined,
  currentIndustry: undefined,
  yearsOfExperience: 0,
  
  // Skills and credentials
  skills: ['Problem Solving', 'Communication', 'Basic Programming', 'Leadership'],
  credentials: ['Class 12 - Science Stream', 'CBSE Board'],
  certifications: [],
  
  // Financial constraints
  financialConstraints: {
    maxInvestment: 2500000, // 25 Lakhs
    monthlyBudget: 40000,
    canTakeLoan: true,
  },
  
  // Time constraints
  timeConstraints: {
    maxDuration: 84, // 7 years
    hoursPerWeek: 50,
    canRelocate: true,
  },
  
  // Location constraints
  locationConstraints: {
    preferredLocations: ['Bangalore', 'Hyderabad', 'Pune'],
    forbiddenLocations: [],
    remotePreference: 'OPEN',
  },
  
  // Preferences
  riskTolerance: 'MODERATE',
  preferredPathTypes: [PathType.DIRECT, PathType.CORPORATE],
  careerGoals: ['Product Manager', 'Tech Lead', 'Entrepreneur'],
  
  // Family context
  familyContext: {
    dependents: 0,
    pressureSources: ['PARENT_EXPECTATION'],
  },
};

// =============================================================================
// EXAMPLE INPUT
// =============================================================================

const exampleInput: CareerPathIntelligenceInput = {
  studentProfile: exampleStudentProfile,
  targetCareer: 'Product Manager',
  targetIndustry: 'Technology',
  constraints: {
    maxPaths: 8,
    maxDuration: 84,
    maxCost: 3000000,
  },
  preferences: {
    prioritizeSpeed: false,
    prioritizeOptionality: true,
    prioritizeSecurity: true,
    prioritizeCost: false,
  },
  timestamp: Date.now(),
};

// =============================================================================
// MAIN ANALYSIS
// =============================================================================

export function runCompleteExample() {
  console.log('='.repeat(80));
  console.log('CAREER PATH INTELLIGENCE ENGINE - COMPLETE EXAMPLE');
  console.log('='.repeat(80));
  console.log();
  
  // Initialize the engine
  const engine = createCareerPathIntelligenceEngine({
    engine: {
      maxPathsToDiscover: 10,
      minPathConfidence: 0.3,
      includeNonTraditionalPaths: true,
      includeEntrepreneurialPaths: true,
      considerIndianExams: true,
      considerFamilyBusiness: true,
      generatePlanB: true,
      generatePlanC: true,
      generatePlanD: true,
      generateRecoveryPlans: true,
    },
  });
  
  console.log('Engine initialized successfully');
  console.log();
  
  // Run comprehensive analysis
  console.log('Running comprehensive career path analysis...');
  console.log('-'.repeat(80));
  
  const analysis = engine.analyze(exampleInput);
  
  // =============================================================================
  // DISPLAY RESULTS
  // =============================================================================
  
  // 1. Overview
  console.log('\n📊 ANALYSIS OVERVIEW');
  console.log('-'.repeat(80));
  console.log(`Analysis ID: ${analysis.id}`);
  console.log(`Timestamp: ${new Date(analysis.timestamp).toLocaleString()}`);
  console.log(`Target Career: ${analysis.targetCareer}`);
  console.log(`Engine Version: ${analysis.engineVersion}`);
  console.log();
  
  // 2. Discovered Paths
  console.log('\n🛤️  DISCOVERED PATHS');
  console.log('-'.repeat(80));
  console.log(`Discovery Method: ${analysis.discoveredPaths.discoveryMethod}`);
  console.log(`Total Paths Found: ${analysis.discoveredPaths.paths.length}`);
  console.log(`Path Coverage:`);
  console.log(`  - Direct Paths: ${analysis.discoveredPaths.coverage.direct}`);
  console.log(`  - Indirect Paths: ${analysis.discoveredPaths.coverage.indirect}`);
  console.log(`  - Non-Traditional Paths: ${analysis.discoveredPaths.coverage.nonTraditional}`);
  console.log();
  
  // 3. Validated Paths
  console.log('\n✅ VALIDATED PATHS');
  console.log('-'.repeat(80));
  console.log(`Valid Paths: ${analysis.validatedPaths.length}`);
  console.log(`Invalid Paths: ${analysis.invalidPaths.length}`);
  console.log();
  
  analysis.validatedPaths.forEach((path, index) => {
    console.log(`\n  Path ${index + 1}: ${path.name}`);
    console.log(`  Type: ${path.type}`);
    console.log(`  Difficulty: ${path.difficulty}`);
    console.log(`  Risk: ${path.riskLevel}`);
    console.log(`  Duration: ${path.duration} months (${(path.duration / 12).toFixed(1)} years)`);
    console.log(`  Cost: ₹${(path.totalCost / 100000).toFixed(1)} Lakhs`);
    console.log(`  Confidence: ${(path.confidence * 100).toFixed(0)}%`);
    console.log(`  Optionality Score: ${(path.optionalityScore * 100).toFixed(0)}%`);
    console.log(`  Milestones: ${path.milestones.length}`);
  });
  
  // 4. Primary Path
  console.log('\n\n🎯 PRIMARY RECOMMENDED PATH');
  console.log('-'.repeat(80));
  console.log(`Path: ${analysis.primaryPath.name}`);
  console.log(`Description: ${analysis.primaryPath.description}`);
  console.log(`Duration: ${analysis.primaryPath.duration} months`);
  console.log(`Investment: ₹${(analysis.primaryPath.totalCost / 100000).toFixed(1)} Lakhs`);
  console.log(`Expected Starting Salary: ₹${(analysis.primaryPath.expectedStartingSalary / 100000).toFixed(1)} Lakhs`);
  console.log(`Expected 5-Year Salary: ₹${(analysis.primaryPath.expectedSalaryAt5Years / 100000).toFixed(1)} Lakhs`);
  console.log(`ROI: ${(analysis.primaryPath.roi * 100).toFixed(0)}%`);
  console.log();
  
  // 5. Milestone Plan
  console.log('\n📋 MILESTONE PLAN FOR PRIMARY PATH');
  console.log('-'.repeat(80));
  console.log(`Total Duration (with buffer): ${analysis.milestonePlan.totalDuration} months`);
  console.log(`Buffer Time: ${analysis.milestonePlan.bufferTime} months`);
  console.log(`Critical Milestones: ${analysis.milestonePlan.criticalPath.length}`);
  console.log(`Parallel Tracks: ${analysis.milestonePlan.parallelTracks.length}`);
  console.log();
  
  analysis.milestonePlan.milestones.forEach((milestone, index) => {
    const isCritical = analysis.milestonePlan.criticalPath.includes(milestone.id);
    console.log(`  ${index + 1}. ${milestone.name} ${isCritical ? '⭐' : ''}`);
    console.log(`     Duration: ${milestone.expectedDuration} months`);
    console.log(`     Description: ${milestone.description}`);
    if (milestone.skillsAcquired.length > 0) {
      console.log(`     Skills: ${milestone.skillsAcquired.slice(0, 3).join(', ')}${milestone.skillsAcquired.length > 3 ? '...' : ''}`);
    }
    if (milestone.failureProbability > 0.3) {
      console.log(`     ⚠️  Failure Risk: ${(milestone.failureProbability * 100).toFixed(0)}%`);
    }
    console.log();
  });
  
  // 6. Alternative Paths (Plan B, C, D)
  console.log('\n🔄 ALTERNATIVE PATHS');
  console.log('-'.repeat(80));
  console.log(`Primary Path ID: ${analysis.alternativePaths.primaryPathId}`);
  console.log();
  
  console.log('Plan A (Primary):');
  console.log(`  ${analysis.alternativePaths.planA.name}`);
  console.log(`  Confidence: ${(analysis.alternativePaths.planA.confidence * 100).toFixed(0)}%`);
  console.log();
  
  console.log('Plan B (Safer Alternative):');
  console.log(`  ${analysis.alternativePaths.planB.name}`);
  console.log(`  Type: ${analysis.alternativePaths.planB.type}`);
  console.log(`  Risk: ${analysis.alternativePaths.planB.riskLevel}`);
  console.log(`  Confidence: ${(analysis.alternativePaths.planB.confidence * 100).toFixed(0)}%`);
  console.log();
  
  console.log('Plan C (Different Approach):');
  console.log(`  ${analysis.alternativePaths.planC.name}`);
  console.log(`  Type: ${analysis.alternativePaths.planC.type}`);
  console.log(`  Risk: ${analysis.alternativePaths.planC.riskLevel}`);
  console.log(`  Confidence: ${(analysis.alternativePaths.planC.confidence * 100).toFixed(0)}%`);
  console.log();
  
  if (analysis.alternativePaths.planD) {
    console.log('Plan D (Safety Net):');
    console.log(`  ${analysis.alternativePaths.planD.name}`);
    console.log(`  Type: ${analysis.alternativePaths.planD.type}`);
    console.log(`  Risk: ${analysis.alternativePaths.planD.riskLevel}`);
    console.log();
  }
  
  // Switching Points
  console.log('\n🔄 SWITCHING POINTS (where you can pivot between paths):');
  analysis.alternativePaths.switchingPoints.forEach((point, index) => {
    console.log(`  ${index + 1}. At milestone: ${point.milestoneName}`);
    console.log(`     Criteria: ${point.criteria}`);
    console.log(`     Recommendation: ${point.recommendation}`);
    console.log();
  });
  
  // 7. Recovery Plans
  console.log('\n🆘 FAILURE RECOVERY PLANS');
  console.log('-'.repeat(80));
  const recoveryPlans = Object.entries(analysis.recoveryPlans);
  console.log(`Total Recovery Plans: ${recoveryPlans.length}`);
  console.log();
  
  recoveryPlans.forEach(([milestoneId, plan]) => {
    console.log(`Milestone: ${plan.failedMilestoneName}`);
    console.log(`Failure Reason: ${plan.failureReason}`);
    console.log(`Recommended Recovery: ${plan.recommendedOption?.name || 'N/A'}`);
    if (plan.recommendedOption) {
      console.log(`Recovery Strategy: ${plan.recommendedOption.strategy}`);
      console.log(`Additional Cost: ₹${(plan.recommendedOption.cost / 1000).toFixed(0)}K`);
      console.log(`Additional Time: ${plan.recommendedOption.time} months`);
      console.log(`Success Probability: ${(plan.recommendedOption.successProbability * 100).toFixed(0)}%`);
    }
    console.log(`Impact on Path: +${plan.impactOnPath.additionalTime} months, -${(plan.impactOnPath.confidenceImpact * 100).toFixed(0)}% confidence`);
    console.log();
  });
  
  // 8. Path Comparison
  console.log('\n📊 PATH COMPARISON');
  console.log('-'.repeat(80));
  
  console.log('\nDifficulty Comparison:');
  console.log(`  Best (Easiest): ${analysis.pathComparison.difficulty.bestPathId}`);
  console.log(`  Worst (Hardest): ${analysis.pathComparison.difficulty.worstPathId}`);
  console.log(`  ${analysis.pathComparison.difficulty.explanation}`);
  
  console.log('\nRisk Comparison:');
  console.log(`  Lowest Risk: ${analysis.pathComparison.risk.bestPathId}`);
  console.log(`  Highest Risk: ${analysis.pathComparison.risk.worstPathId}`);
  console.log(`  ${analysis.pathComparison.risk.explanation}`);
  
  console.log('\nCost Comparison:');
  console.log(`  Most Affordable: ${analysis.pathComparison.cost.bestPathId}`);
  console.log(`  Most Expensive: ${analysis.pathComparison.cost.worstPathId}`);
  console.log(`  ${analysis.pathComparison.cost.explanation}`);
  
  console.log('\nDuration Comparison:');
  console.log(`  Fastest: ${analysis.pathComparison.duration.bestPathId}`);
  console.log(`  Slowest: ${analysis.pathComparison.duration.worstPathId}`);
  console.log(`  ${analysis.pathComparison.duration.explanation}`);
  
  console.log('\nOptionality Comparison:');
  console.log(`  Most Flexible: ${analysis.pathComparison.optionality.bestPathId}`);
  console.log(`  Most Rigid: ${analysis.pathComparison.optionality.worstPathId}`);
  console.log(`  ${analysis.pathComparison.optionality.explanation}`);
  
  console.log('\nUtility (ROI) Comparison:');
  console.log(`  Best Value: ${analysis.pathComparison.utility.bestPathId}`);
  console.log(`  ${analysis.pathComparison.utility.explanation}`);
  
  // 9. Tradeoff Analysis
  console.log('\n⚖️  TRADEOFF ANALYSIS');
  console.log('-'.repeat(80));
  analysis.pathComparison.tradeoffs.forEach((tradeoff, index) => {
    console.log(`\n${index + 1}. ${tradeoff.dimension} Tradeoff:`);
    console.log(`   Between: ${tradeoff.between.join(' vs ')}`);
    console.log(`   ${tradeoff.tradeoffDescription}`);
  });
  
  // 10. Fit Scores
  console.log('\n🎯 FIT SCORES FOR YOUR PROFILE');
  console.log('-'.repeat(80));
  Object.entries(analysis.pathComparison.fitScores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pathId, score], index) => {
      const path = analysis.validatedPaths.find(p => p.pathId === pathId);
      console.log(`  ${index + 1}. ${path?.name || pathId}: ${(score * 100).toFixed(0)}% match`);
    });
  
  // 11. Explanations
  console.log('\n📝 PATH EXPLANATIONS');
  console.log('-'.repeat(80));
  
  Object.entries(analysis.explanations).forEach(([pathId, explanation]) => {
    console.log(`\n${explanation.pathName}:`);
    console.log(`\nOverview:`);
    console.log(`  ${explanation.overview}`);
    console.log(`\nJourney Description:`);
    console.log(`  ${explanation.journeyDescription}`);
    console.log(`\nFit for You:`);
    console.log(`  ${explanation.fitExplanation}`);
    if (explanation.comparisonToDirectPath) {
      console.log(`\nComparison to Direct Path:`);
      console.log(`  ${explanation.comparisonToDirectPath}`);
    }
  });
  
  // 12. Recommendations
  console.log('\n🏆 FINAL RECOMMENDATIONS');
  console.log('-'.repeat(80));
  console.log(`Recommended Path: ${analysis.pathComparison.recommendedPathId}`);
  console.log('\nRecommendation Rationale:');
  analysis.pathComparison.recommendationRationale.forEach((rationale, index) => {
    console.log(`  ${index + 1}. ${rationale}`);
  });
  
  console.log('\nRanked Path Recommendations:');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`\n  ${rec.rank}. ${rec.pathName} (${rec.category})`);
    console.log(`     Confidence: ${(rec.confidence * 100).toFixed(0)}%`);
    console.log(`     Fit Score: ${(rec.fitScore * 100).toFixed(0)}%`);
    if (rec.rationale.length > 0) {
      console.log(`     Why: ${rec.rationale.join(', ')}`);
    }
    if (rec.warnings.length > 0) {
      console.log(`     ⚠️  Warnings: ${rec.warnings.join(', ')}`);
    }
    if (rec.nextSteps.length > 0) {
      console.log(`     Next Steps:`);
      rec.nextSteps.forEach((step, i) => console.log(`       ${i + 1}. ${step}`));
    }
  });
  
  // 13. Optionality Analysis
  console.log('\n🔄 OPTIONALITY ANALYSIS');
  console.log('-'.repeat(80));
  console.log(`Overall Optionality: ${(analysis.optionalityAnalysis.overallOptionality * 100).toFixed(0)}%`);
  console.log('\nRecommendations:');
  analysis.optionalityAnalysis.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  // =============================================================================
  // QUICK ANALYSIS EXAMPLE
  // =============================================================================
  
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('QUICK ANALYSIS EXAMPLE');
  console.log('='.repeat(80));
  
  const quickResult = engine.quickAnalyze(exampleInput);
  console.log('\nQuick Analysis Results:');
  console.log(`Target Career: ${quickResult.targetCareer}`);
  console.log(`Valid Paths Found: ${quickResult.pathCount}`);
  console.log(`Top Path: ${quickResult.topPath}`);
  console.log(`Difficulty: ${quickResult.difficulty}`);
  console.log(`Duration: ${quickResult.duration} months`);
  console.log(`Estimated Cost: ₹${(quickResult.estimatedCost / 100000).toFixed(1)} Lakhs`);
  console.log(`Alternatives Available: ${quickResult.alternativesAvailable ? 'Yes' : 'No'}`);
  
  console.log('\n');
  console.log('='.repeat(80));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(80));
  
  return analysis;
}

// Run the example if this file is executed directly
if (require.main === module) {
  runCompleteExample();
}

export default runCompleteExample;
