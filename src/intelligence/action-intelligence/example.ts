/**
 * Action Intelligence Engine - Usage Example
 *
 * This file demonstrates how to use the Action Intelligence Engine
 * to generate personalized career action plans.
 */

import {
  createActionIntelligenceEngine,
  ActionIntelligenceEngine,
  ActionIntelligenceInput,
  ActionOutput,
  TimeHorizon,
  ActionPriority,
  ActionType,
} from './index';

import type {
  StudentBelief,
  CareerPath,
  CareerRecommendation,
  DecisionAnalysis,
  MarketInsight,
} from '../types';

/**
 * Example 1: Basic Usage - Software Engineer Career Path
 */
export function example1_BasicUsage(): void {
  console.log('=== Example 1: Basic Usage ===\n');

  // Create engine with default configuration
  const engine = createActionIntelligenceEngine();

  // Prepare input data
  const input: ActionIntelligenceInput = createSampleInput();

  // Generate action plan
  const output = engine.generate(input);

  // Display results
  displayResults(output);
}

/**
 * Example 2: Custom Configuration
 */
export function example2_CustomConfig(): void {
  console.log('=== Example 2: Custom Configuration ===\n');

  // Create engine with custom configuration
  const engine = createActionIntelligenceEngine({
    generateExplanations: true,
    includeContingencyPlans: true,
    maxActionsPerHorizon: 15,
    explanationDetailLevel: 'detailed',
    defaultTimeHorizon: TimeHorizon.NEXT_1_YEAR,
  });

  const input = createSampleInput();
  const output = engine.generate(input);

  console.log('Configuration:');
  console.log('- Max actions per horizon: 15');
  console.log('- Detailed explanations: enabled');
  console.log('- Contingency plans: included\n');

  displayResults(output);
}

/**
 * Example 3: Working with Top Priority Actions
 */
export function example3_TopPriorityActions(): void {
  console.log('=== Example 3: Top Priority Actions ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();
  const output = engine.generate(input);

  console.log('Your Top 5 Priority Actions:\n');

  output.topActions.forEach((action, index) => {
    console.log(`${index + 1}. ${action.title}`);
    console.log(`   Priority: ${action.priority}`);
    console.log(`   Time: ${action.estimatedDuration} hours`);
    console.log(`   Type: ${action.type}`);
    console.log(`   Time Horizon: ${action.timeHorizon}`);

    if (action.priorityScore) {
      console.log(`   Score: ${(action.priorityScore.overall * 100).toFixed(1)}%`);
    }

    console.log('');
  });
}

/**
 * Example 4: Skill Gap Analysis
 */
export function example4_SkillGapAnalysis(): void {
  console.log('=== Example 4: Skill Gap Analysis ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();
  const output = engine.generate(input);

  console.log(`Target: ${output.skillGapAnalysis.targetId}\n`);

  console.log('Critical Skill Gaps:');
  output.skillGapAnalysis.criticalGaps.forEach(gap => {
    console.log(`- ${gap.skillName}`);
    console.log(`  Current: ${(gap.currentLevel * 100).toFixed(0)}%`);
    console.log(`  Required: ${(gap.requiredLevel * 100).toFixed(0)}%`);
    console.log(`  Gap: ${(gap.gapSize * 100).toFixed(0)}%`);
    console.log(`  Time needed: ${gap.timeToAcquire} hours\n`);
  });

  console.log(`\nTotal time to close gaps: ${output.skillGapAnalysis.totalTimeToClose} hours`);
}

/**
 * Example 5: Weekly Plan
 */
export function example5_WeeklyPlan(): void {
  console.log('=== Example 5: This Week\'s Plan ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();
  const output = engine.generate(input);

  const weeklyPlan = output.weeklyPlan;

  console.log(`Week ${weeklyPlan.weekNumber}: ${weeklyPlan.focus}\n`);

  console.log('Goals:');
  weeklyPlan.goals.forEach(goal => console.log(`- ${goal}`));

  console.log('\nTime Budget:');
  console.log(`- Total: ${weeklyPlan.timeBudget.totalHours} hours`);
  console.log(`- Study: ${weeklyPlan.timeBudget.studyHours} hours`);
  console.log(`- Practice: ${weeklyPlan.timeBudget.practiceHours} hours`);
  console.log(`- Networking: ${weeklyPlan.timeBudget.networkingHours} hours`);

  console.log('\nActions:');
  weeklyPlan.actions.forEach(action => {
    console.log(`\n[${action.priority}] ${action.title}`);
    console.log(`  ${action.description.slice(0, 100)}...`);
    console.log(`  Duration: ${action.estimatedDuration} hours`);
  });
}

/**
 * Example 6: Opportunities
 */
export function example6_Opportunities(): void {
  console.log('=== Example 6: Recommended Opportunities ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();
  const output = engine.generate(input);

  output.opportunities.forEach(bundle => {
    console.log(`\n${bundle.category}:`);
    console.log(`${bundle.description}\n`);

    bundle.opportunities.slice(0, 3).forEach(opp => {
      console.log(`  - ${opp.name}`);
      console.log(`    Provider: ${opp.provider}`);
      console.log(`    Cost: ${opp.cost?.amount || 0} ${opp.cost?.currency || 'INR'}`);
      console.log(`    Fit Score: ${(opp.fitScore * 100).toFixed(0)}%`);
      console.log('');
    });
  });
}

/**
 * Example 7: Action Explanations
 */
export function example7_Explanations(): void {
  console.log('=== Example 7: Action Explanations ===\n');

  const engine = createActionIntelligenceEngine({
    generateExplanations: true,
    explanationDetailLevel: 'detailed',
  });

  const input = createSampleInput();
  const output = engine.generate(input);

  console.log('Why These Actions Matter:\n');

  output.explanations.slice(0, 3).forEach((explanation, index) => {
    const action = output.allActions.find(a => a.id === explanation.actionId);
    if (!action) return;

    console.log(`${index + 1}. ${action.title}\n`);
    console.log(`   Why this matters: ${explanation.whyThisMatter}`);
    console.log(`   How it fits: ${explanation.howItFits}`);
    console.log(`   Expected outcome: ${explanation.expectedOutcome}`);

    if (explanation.roi) {
      console.log(`   Career impact: ${explanation.roi.careerTrajectory}`);
    }

    console.log('');
  });
}

/**
 * Example 8: Full Summary
 */
export function example8_FullSummary(): void {
  console.log('=== Example 8: Complete Summary ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();
  const output = engine.generate(input);

  console.log(output.summary);
}

/**
 * Example 9: Working with Sub-Engines Directly
 */
export function example9_SubEngines(): void {
  console.log('=== Example 9: Using Sub-Engines Directly ===\n');

  const engine = createActionIntelligenceEngine();
  const input = createSampleInput();

  // You can access sub-engines if needed for fine-grained control
  // This is useful for testing or custom workflows

  console.log('Sub-engines available:');
  console.log('- ActionGenerator: Creates specific actions');
  console.log('- PriorityEngine: Ranks and prioritizes actions');
  console.log('- SkillGapEngine: Analyzes skill gaps');
  console.log('- OpportunityEngine: Recommends opportunities');
  console.log('- ExecutionPlanner: Creates schedules');
  console.log('- ActionExplanationEngine: Generates explanations\n');

  const output = engine.generate(input);
  console.log('Full output generated using all sub-engines.\n');
  console.log(`Total actions: ${output.allActions.length}`);
  console.log(`Critical actions: ${output.prioritizedActions.critical.length}`);
  console.log(`High priority: ${output.prioritizedActions.high.length}`);
  console.log(`Milestones: ${output.milestones.length}`);
  console.log(`Opportunity bundles: ${output.opportunities.length}`);
}

/**
 * Example 10: Configuration Updates
 */
export function example10_Configuration(): void {
  console.log('=== Example 10: Runtime Configuration ===\n');

  const engine = createActionIntelligenceEngine();

  // Update main config
  engine.updateConfig({
    maxActionsPerHorizon: 20,
    explanationDetailLevel: 'brief',
  });

  // Update sub-engine configs
  engine.updateSubEngineConfigs({
    priority: {
      impactWeight: 0.3,
      urgencyWeight: 0.3,
      difficultyWeight: 0.1,
    },
    skillGap: {
      hoursPerSkillLevel: 60,
    },
  });

  console.log('Configuration updated:');
  console.log('- Max actions per horizon: 20');
  console.log('- Priority weights adjusted for impact/urgency');
  console.log('- Skill learning time: 60 hours per level\n');

  const input = createSampleInput();
  const output = engine.generate(input);

  console.log(`Generated ${output.allActions.length} actions with updated config`);
}

// ============ Helper Functions ============

/**
 * Create sample input data
 */
function createSampleInput(): ActionIntelligenceInput {
  const studentBelief: StudentBelief = {
    id: 'student_001',
    type: 'STUDENT',
    timestamp: Date.now(),
    confidence: 0.9,

    // Personal info
    personal: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      age: 22,
    },

    // Academic info
    academic: {
      institution: 'Delhi Technological University',
      program: 'B.Tech Computer Science',
      yearOfStudy: 'Final Year',
      graduationYear: 2025,
      gpa: 8.2,
      courses: [
        'Data Structures',
        'Algorithms',
        'Database Systems',
        'Web Development',
        'Machine Learning',
      ],
    },

    // Skills
    strengths: [
      {
        id: 'strength_001',
        name: 'Programming',
        type: 'SKILL',
        category: 'TECHNICAL',
        level: 0.7,
        evidence: [{ explanation: 'Built multiple projects' }],
      },
      {
        id: 'strength_002',
        name: 'Problem Solving',
        type: 'SKILL',
        category: 'COGNITIVE',
        level: 0.75,
        evidence: [{ explanation: 'Good at competitive programming' }],
      },
    ],

    // Interests
    interests: [
      {
        id: 'interest_001',
        domain: 'Software Development',
        strength: 0.9,
      },
      {
        id: 'interest_002',
        domain: 'AI/ML',
        strength: 0.7,
      },
    ],

    // Current state
    currentContext: {
      currentRole: 'Final Year Student',
      currentSkills: ['JavaScript', 'Python', 'React', 'Node.js'],
      availableHoursPerWeek: 15,
      constraints: {
        canRelocate: true,
        preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
      },
    },
  };

  return {
    studentBelief,
    targetCareer: 'Software Engineer',

    // Constraints
    constraints: {
      financial: {
        budget: 50000,
        monthlyLimit: 5000,
        currency: 'INR',
      },
      temporal: {
        maxHoursPerWeek: 15,
        preferredStudyTimes: ['evening', 'weekend'],
      },
      location: {
        canRelocate: true,
        preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
      },
    },

    // Current context
    currentContext: {
      currentRole: 'Final Year Student',
      currentSkills: ['JavaScript', 'Python', 'React', 'Node.js'],
      availableHoursPerWeek: 15,
      constraints: {
        canRelocate: true,
        preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
      },
    },
  };
}

/**
 * Display comprehensive results
 */
function displayResults(output: ActionOutput): void {
  console.log('=== ACTION INTELLIGENCE OUTPUT ===\n');

  console.log(`Target Career: ${output.targetCareer}`);
  console.log(`Estimated Completion: ${output.estimatedCompletionTime}`);
  console.log(`Generated: ${new Date(output.generatedAt).toLocaleString()}\n`);

  console.log('--- PRIORITY BREAKDOWN ---');
  console.log(`Critical: ${output.prioritizedActions.critical.length}`);
  console.log(`High: ${output.prioritizedActions.high.length}`);
  console.log(`Medium: ${output.prioritizedActions.medium.length}`);
  console.log(`Low: ${output.prioritizedActions.low.length}\n`);

  console.log('--- TOP ACTIONS ---');
  output.topActions.slice(0, 5).forEach((action, i) => {
    console.log(`${i + 1}. [${action.priority}] ${action.title}`);
    console.log(`   ${action.description.slice(0, 80)}...`);
  });
  console.log('');

  console.log('--- MILESTONES ---');
  output.milestones.forEach(m => {
    console.log(`- ${m.name} (${m.timeHorizon})`);
    console.log(`  Target: ${new Date(m.targetDate).toLocaleDateString()}`);
  });
  console.log('');

  console.log('--- OPPORTUNITIES ---');
  output.opportunities.forEach(bundle => {
    console.log(`- ${bundle.category}: ${bundle.opportunities.length} options`);
  });
  console.log('');

  console.log('--- THIS WEEK ---');
  if (output.weeklyPlan) {
    console.log(`Focus: ${output.weeklyPlan.focus}`);
    console.log(`Actions: ${output.weeklyPlan.actions.length}`);
    console.log(`Time Budget: ${output.weeklyPlan.timeBudget.totalHours} hours\n`);
  }

  console.log('--- NEXT REVIEW ---');
  console.log(`Review Date: ${new Date(output.nextReviewDate).toLocaleDateString()}\n`);
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Action Intelligence Engine - Usage Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════\n');

  example1_BasicUsage();
  console.log('\n' + '='.repeat(60) + '\n');

  example2_CustomConfig();
  console.log('\n' + '='.repeat(60) + '\n');

  example3_TopPriorityActions();
  console.log('\n' + '='.repeat(60) + '\n');

  example4_SkillGapAnalysis();
  console.log('\n' + '='.repeat(60) + '\n');

  example5_WeeklyPlan();
  console.log('\n' + '='.repeat(60) + '\n');

  example6_Opportunities();
  console.log('\n' + '='.repeat(60) + '\n');

  example7_Explanations();
  console.log('\n' + '='.repeat(60) + '\n');

  example8_FullSummary();
  console.log('\n' + '='.repeat(60) + '\n');

  example9_SubEngines();
  console.log('\n' + '='.repeat(60) + '\n');

  example10_Configuration();

  console.log('\n' + '='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

// Uncomment to run examples:
// runAllExamples();
