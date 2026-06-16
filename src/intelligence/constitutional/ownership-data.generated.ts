/**
 * @fileoverview Generated constitutional ownership registry data.
 *
 * Source: docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md
 * Generated for Phase 4.0 foundation implementation.
 * Do not edit manually; regenerate from the constitutional ownership map.
 */

import type { OwnershipRecord } from './ConstitutionalTypes';

export const GENERATED_OWNERSHIP_SOURCE = {
  "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
  "sourceWave": "Wave 3.3",
  "totalRecords": 444,
  "authorityCounts": {
    "OptionGeneratorAuthority": 339,
    "OutcomeTrackerAuthority": 55,
    "StudentUnderstandingAuthority": 50
  }
} as const;

export const CONSTITUTIONAL_OWNERSHIP_RECORDS: readonly OwnershipRecord[] = [
  {
    "modulePath": "src/career-fit/career-fit-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-fit",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "CareerFitEngine"
    ],
    "functionNames": [
      "createCareerFitEngine",
      "calculateFit",
      "calculateFits",
      "compareFits",
      "queryFits",
      "getBestFits",
      "getConcerningFits",
      "getDimensionScores",
      "meetsCriteria",
      "getSummary",
      "getRecommendations",
      "clearCache"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts",
      "career-fit/fit-calculator.ts",
      "career-fit/fit-breakdown-engine.ts",
      "career-fit/fit-confidence-engine.ts",
      "career-fit/fit-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-fit/fit-breakdown-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-fit",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "FitBreakdownEngine"
    ],
    "functionNames": [
      "createFitBreakdownEngine",
      "analyzeFitResult",
      "identifyStrengths",
      "identifyConcerns",
      "getStrongestDimension",
      "getWeakestDimension",
      "countCriticalConcerns",
      "countMajorStrengths"
    ],
    "dependencies": [
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "career-fit/career-fit-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-fit/fit-calculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-fit",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "FitCalculator"
    ],
    "functionNames": [
      "createFitCalculator",
      "calculateFit",
      "calculateBreakdown",
      "calculateCognitiveFit",
      "calculateMotivationFit",
      "calculateLifestyleFit",
      "calculateRiskFit",
      "calculateWorkEnvironmentFit",
      "calculateValuesFit",
      "calculateDimensionFit",
      "calculateRiskAlignment",
      "calculateOverallScore"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "career-fit/career-fit-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-fit/fit-confidence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-fit",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "FitConfidenceEngine"
    ],
    "functionNames": [
      "createFitConfidenceEngine",
      "calculateConfidence",
      "calculateProfileConfidence",
      "calculateCareerConfidence",
      "calculateEvidenceConfidence",
      "calculateCalculationConfidence",
      "calculateVariance",
      "meetsConfidenceThreshold",
      "getConfidenceInterpretation",
      "identifyConfidenceIssues",
      "recommendConfidenceImprovements"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts",
      "intelligence/confidence/index.ts"
    ],
    "consumers": [
      "career-fit/career-fit-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-fit/fit-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-fit",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "FitExplanationEngine"
    ],
    "functionNames": [
      "createFitExplanationEngine",
      "generateExplanations",
      "generateStrongFitReasons",
      "generateWeakFitReasons",
      "generateAlignments",
      "generateConflicts",
      "generateSummary",
      "generateBriefDescription",
      "generateRecommendations"
    ],
    "dependencies": [
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "career-fit/career-fit-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-intelligence/career-analyzer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerAnalyzer"
    ],
    "functionNames": [
      "createCareerAnalyzer",
      "analyzeCareer",
      "extractPrimaryProfile",
      "determineEnvironmentType",
      "assessRiskLevel",
      "assessRewardLevel",
      "identifySecondaryCharacteristics",
      "assessDifficulty",
      "assessMarketOutlook",
      "compareCareers",
      "getDimensionScore",
      "getComplexityScore"
    ],
    "dependencies": [
      "'MODERATE' \\"
    ],
    "consumers": [
      "'HIGH'",
      "string[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-intelligence/career-evidence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerEvidenceEngine"
    ],
    "functionNames": [
      "createCareerEvidenceEngine",
      "checkDimension",
      "createScoredDimension",
      "addEvidence",
      "calculateConfidence",
      "recalculateScore",
      "estimateScoreFromDescription",
      "buildCareerEvidence",
      "calculateOverallConfidence",
      "calculateEvidenceQuality",
      "calculateDataFreshness",
      "validateEvidence"
    ],
    "dependencies": [
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "career-intelligence/career-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-intelligence/career-insights-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerInsightsEngine"
    ],
    "functionNames": [
      "createCareerInsightsEngine",
      "generateInsights",
      "generateWhoThrives",
      "generateThrivesExplanation",
      "generateWhoStruggles",
      "generateStrugglesExplanation",
      "identifyMisconceptions",
      "identifyTradeoffs",
      "identifyOpportunities",
      "identifySuccessFactors",
      "identifyWarningSigns",
      "getDominantCognitive"
    ],
    "dependencies": [
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "career-intelligence/career-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-intelligence/career-intelligence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerIntelligenceEngine"
    ],
    "functionNames": [
      "createCareerIntelligenceEngine",
      "registerCareer",
      "getCareer",
      "getCareers",
      "queryCareers",
      "analyzeCareer",
      "compareCareers",
      "getAttractivenessScores",
      "getComplexityScores",
      "getCareersByCategory",
      "getCareersByIndustry",
      "getAllCareerIds"
    ],
    "dependencies": [
      "undefined",
      "CareerIntelligence[]",
      "CareerIntelligenceResult",
      "ReturnType<CareerAnalyzer['analyzeCareer']> \\"
    ],
    "consumers": [
      "null"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/career-journey-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "CareerJourneyEngine"
    ],
    "functionNames": [
      "createCareerJourneyEngine",
      "createJourney",
      "getJourney",
      "updateJourney",
      "deleteJourney",
      "addCareerPosition",
      "addEducationMilestone",
      "addDecision",
      "addTurningPoint",
      "addTransition",
      "addFailure",
      "addSuccess"
    ],
    "dependencies": [
      "null>",
      "Promise<boolean>",
      "Promise<JourneyAnalysisResult>",
      "Promise<SimilarJourneyResult[]>"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "intelligence/confidence/index.ts",
      "career-journeys/journey-analyzer.ts",
      "career-journeys/turning-point-engine.ts",
      "career-journeys/career-transition-engine.ts",
      "career-journeys/journey-insights-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/career-transition-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "CareerTransitionEngine"
    ],
    "functionNames": [
      "analyzeTransitions",
      "analyzeTransition",
      "compareTransitions",
      "predictDifficulty",
      "recommendStrategy",
      "identifyTransferableSkills",
      "analyzeTransitionTiming",
      "findSimilarTransitions",
      "extractTransitions",
      "classifyTransition",
      "inferLevel",
      "assessDifficulty"
    ],
    "dependencies": [
      "career-journeys/career-journey-types.ts"
    ],
    "consumers": [
      "career-journeys/career-journey-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/journey-analyzer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "JourneyAnalyzer"
    ],
    "functionNames": [
      "compareJourneys",
      "analyzeTrajectory",
      "detectPatterns",
      "analyzeDecisionPatterns",
      "calculateTimeToMilestones",
      "analyzeSkillAcquisition",
      "compareStartingPoints",
      "compareCareerPaths",
      "compareDecisions",
      "compareOutcomes",
      "compareTimelines",
      "compareChallenges"
    ],
    "dependencies": [
      "career-journeys/career-journey-types.ts"
    ],
    "consumers": [
      "career-journeys/career-journey-engine.ts",
      "career-journeys/journey-insights-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/journey-insights-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "JourneyInsightsEngine"
    ],
    "functionNames": [
      "generateInsights",
      "generateComparativeInsights",
      "generateContextualInsights",
      "categorizeInsights",
      "validateInsights",
      "identifyBiggestLesson",
      "identifyMostValuableDecision",
      "identifyLargestMistake",
      "identifyUnexpectedOutcome",
      "analyzeRegrets",
      "identifyPatterns",
      "generateAdvice"
    ],
    "dependencies": [
      "career-journeys/career-journey-types.ts",
      "career-journeys/journey-analyzer.ts"
    ],
    "consumers": [
      "career-journeys/career-journey-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/similarity/journey-matcher.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "JourneyMatcher"
    ],
    "functionNames": [
      "findMatches",
      "findBestMatch",
      "findMatchesAboveThreshold",
      "findDiverseMatches",
      "assessMatchQuality",
      "reRankResults",
      "removeRedundantMatches",
      "getMatchStatistics",
      "getCandidates",
      "filterCandidates",
      "filter",
      "calculateSimilarities"
    ],
    "dependencies": [
      "null>",
      "MatchQuality",
      "JourneySimilarityResult[]",
      "Promise<MatchCandidate[]>",
      "MatchCandidate[]"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "career-journeys/similarity/journey-similarity-types.ts",
      "career-journeys/similarity/similarity-calculator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/similarity/journey-similarity-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "JourneySimilarityEngine"
    ],
    "functionNames": [
      "createJourneySimilarityEngine",
      "findSimilarJourneys",
      "findMostSimilarJourney",
      "calculateSimilarity",
      "calculateSimilarities",
      "explainSimilarity",
      "explainSimilarities",
      "compareJourneys",
      "generateAnalysis",
      "generateSummaryReport",
      "updateWeights",
      "validateQuery"
    ],
    "dependencies": [
      "null>",
      "CalculateSimilarityOutput",
      "BatchSimilarityOutput",
      "SimilarityExplanation"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "career-journeys/similarity/journey-similarity-types.ts",
      "career-journeys/similarity/similarity-calculator.ts",
      "career-journeys/similarity/journey-matcher.ts",
      "career-journeys/similarity/similarity-explanation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/similarity/similarity-calculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "SimilarityCalculator"
    ],
    "functionNames": [
      "updateWeights",
      "calculateAllDimensions",
      "calculateDimension",
      "calculateOverallScore",
      "cosineSimilarity",
      "jaccardSimilarity",
      "stringSimilarity",
      "cityTierSimilarity",
      "educationSimilarity",
      "constraintSimilarity",
      "archetypeSimilarity",
      "motivationSimilarity"
    ],
    "dependencies": [
      "null",
      "SimilarityScore",
      "FeatureVector",
      "DistanceResult[]"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "career-journeys/similarity/journey-similarity-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/similarity/similarity-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "SimilarityExplanationEngine"
    ],
    "functionNames": [
      "generateExplanation",
      "generateExplanations",
      "generateComparisonExplanation",
      "generateSummary",
      "generateDimensionExplanation",
      "registerTemplate",
      "getTemplateExplanation",
      "generateRelevanceExplanation",
      "generateSimilarityExplanation",
      "generateDifferenceExplanation",
      "generateRecommendationExplanation",
      "generateNarrative"
    ],
    "dependencies": [
      "null",
      "string[]"
    ],
    "consumers": [
      "career-journeys/similarity/journey-similarity-types.ts",
      "career-journeys/career-journey-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-journeys/turning-point-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-journeys",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "TurningPointEngine"
    ],
    "functionNames": [
      "analyzeTurningPoints",
      "analyzeTurningPoint",
      "compareTurningPoints",
      "identifyMostImpactful",
      "analyzeCounterfactual",
      "predictTurningPoints",
      "assessReadiness",
      "detectTurningPointPatterns",
      "calculateNetImpact",
      "identifyCausalFactors",
      "analyzeEffects",
      "isImmediateEffect"
    ],
    "dependencies": [
      "career-journeys/career-journey-types.ts"
    ],
    "consumers": [
      "career-journeys/career-journey-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/burnout-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "BurnoutEngine"
    ],
    "functionNames": [
      "createBurnoutEngine",
      "generateProfile",
      "getTemplate",
      "calculateBaseRisk",
      "getRiskLevel",
      "generateStressSources",
      "calculateStressFrequency",
      "calculateRecoveryPotential",
      "generatePreventionFactors",
      "min",
      "generateIndustryPatterns",
      "calculatePersonalRisk"
    ],
    "dependencies": [
      "'MODERATE' \\"
    ],
    "consumers": [
      "'HIGH' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/career-reality-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CareerRealityEngine"
    ],
    "functionNames": [
      "createCareerRealityEngine",
      "generateProfile",
      "generateDailyLife",
      "generateWorkEnvironment",
      "generateBurnoutProfile",
      "generateCultureProfile",
      "generateSatisfactionProfile",
      "generateRealityGap",
      "generateExplanations",
      "generateMetadata",
      "generateProfileId",
      "calculateScores"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts",
      "career-reality/engines/daily-life-engine.ts",
      "career-reality/engines/work-environment-engine.ts",
      "career-reality/engines/burnout-engine.ts",
      "career-reality/engines/culture-engine.ts",
      "career-reality/engines/company-stage-engine.ts",
      "career-reality/engines/satisfaction-engine.ts",
      "career-reality/engines/reality-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/company-stage-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CompanyStageEngine"
    ],
    "functionNames": [
      "createCompanyStageEngine",
      "getStageCharacteristics",
      "getStageDifferences",
      "getCareerKey",
      "calculateMagnitude",
      "generateStageSatisfaction",
      "generateStageDrivers",
      "generateStageFrustrations",
      "generateStageRewards",
      "generateStageExitPatterns",
      "generateTrajectoryDescription",
      "generateInflectionPoints"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts",
      "career-reality/engines/daily-life-engine.ts",
      "career-reality/engines/work-environment-engine.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/culture-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CultureEngine"
    ],
    "functionNames": [
      "createCultureEngine",
      "generateProfile",
      "getTemplate",
      "generateCulturalDimensions",
      "generateValuesAlignment",
      "generateSocialDynamics",
      "generatePersonalityFit",
      "calculateArchetypeFit",
      "generateFitReason",
      "generateSuccessFactors",
      "generateChallenges",
      "calculateCognitiveFit"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/daily-life-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "DailyLifeEngine"
    ],
    "functionNames": [
      "createDailyLifeEngine",
      "generateProfile",
      "getTemplate",
      "applyModifiers",
      "mergeWeights",
      "generateTimeBlockBreakdown",
      "generateWeekPattern",
      "calculateWeekendFrequency",
      "calculateEveningFrequency",
      "calculateEarlyMorningFrequency",
      "calculatePredictability",
      "generateMonthPattern"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts",
      "career-reality/engines/company-stage-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/reality-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RealityExplanationEngine"
    ],
    "functionNames": [
      "createRealityExplanationEngine",
      "generateExplanations",
      "generateRealityGapAnalysis",
      "generateRealityFactors",
      "getTemplate",
      "calculateOverallGap",
      "generateExpectations",
      "generateSpecificGaps",
      "generateBridgingAdvice",
      "generateTheRealDeal",
      "generateDayInTheLife",
      "generateHourlyBreakdown"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/satisfaction-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "SatisfactionEngine"
    ],
    "functionNames": [
      "createSatisfactionEngine",
      "generateProfile",
      "getTemplate",
      "adjustSatisfactionForContext",
      "generateDrivers",
      "calculateDriverSatisfaction",
      "generateFrustrations",
      "generateMitigationStrategies",
      "generateRewards",
      "generateExitPatterns",
      "getTypicalExitStage",
      "getExitDestinations"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-reality/engines/work-environment-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-reality",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "WorkEnvironmentEngine"
    ],
    "functionNames": [
      "createWorkEnvironmentEngine",
      "generateProfile",
      "getTemplate",
      "applyModifiers",
      "clamp",
      "generateAutonomyProfile",
      "generateStructureProfile",
      "generateBureaucracyProfile",
      "generateOwnershipProfile",
      "generateCompetitionProfile",
      "generatePoliticsProfile",
      "generateFlexibilityProfile"
    ],
    "dependencies": [
      "career-reality/types/career-reality-types.ts"
    ],
    "consumers": [
      "career-reality/engines/career-reality-engine.ts",
      "career-reality/engines/company-stage-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-taxonomy/career-graph-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-taxonomy",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerGraphEngine"
    ],
    "functionNames": [
      "createCareerGraphEngine",
      "dfs",
      "addNode",
      "addNodes",
      "getNode",
      "removeNode",
      "addEdge",
      "getEdgesFrom",
      "getEdgesTo",
      "getAllEdgesForNode",
      "getNeighbors",
      "getNeighborsByType"
    ],
    "dependencies": [
      "undefined",
      "boolean",
      "CareerRelationship"
    ],
    "consumers": [
      "career-taxonomy/career-taxonomy-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-taxonomy/career-relationship-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-taxonomy",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerRelationshipEngine"
    ],
    "functionNames": [
      "createCareerRelationshipEngine",
      "createRelationship",
      "createSimilarRelationship",
      "createAdjacentRelationship",
      "createTransitionRelationship",
      "createSpecializationRelationship",
      "createGeneralizationRelationship",
      "createFoundationRelationship",
      "createAlternativeRelationship",
      "getRelationship",
      "queryRelationships",
      "getRelationshipsFrom"
    ],
    "dependencies": [
      "undefined",
      "CareerRelationship[]",
      "CareerNodeId[]",
      "boolean"
    ],
    "consumers": [
      "career-taxonomy/career-taxonomy-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-taxonomy/career-similarity-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-taxonomy",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "CareerSimilarityEngine"
    ],
    "functionNames": [
      "createCareerSimilarityEngine",
      "calculateSimilarity",
      "calculateSimilarityDimensions",
      "calculateSkillSimilarity",
      "calculateCognitiveSimilarity",
      "calculateLifestyleSimilarity",
      "calculateMotivationSimilarity",
      "calculateWorkEnvironmentSimilarity",
      "scoreSimilarity",
      "identifyMatchingFactors",
      "identifyDifferentiatingFactors",
      "scoresMatch"
    ],
    "dependencies": [
      "career-taxonomy/career-taxonomy-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "career-taxonomy/career-taxonomy-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-taxonomy/career-taxonomy-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-taxonomy",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerTaxonomyEngine"
    ],
    "functionNames": [
      "createCareerTaxonomyEngine",
      "registerCareer",
      "getCareer",
      "getCareerIntelligence",
      "queryCareers",
      "createRelationship",
      "calculateSimilarity",
      "findSimilarCareers",
      "createTransition",
      "findPath",
      "findAllPaths",
      "getNeighbors"
    ],
    "dependencies": [
      "undefined",
      "CareerIntelligence \\"
    ],
    "consumers": [
      "undefined",
      "CareerNode[]",
      "void"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/career-taxonomy/career-transition-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "career-taxonomy",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerTransitionEngine"
    ],
    "functionNames": [
      "createCareerTransitionEngine",
      "createTransition",
      "determineTransitionType",
      "calculateTransitionDifficulty",
      "generateTransitionSteps",
      "identifyPrerequisites",
      "estimateTransitionTime",
      "estimateSuccessRate",
      "calculateTransitionConfidence",
      "isSpecialization",
      "isGeneralization",
      "isAlternativePath"
    ],
    "dependencies": [
      "career-taxonomy/career-taxonomy-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "career-taxonomy/career-taxonomy-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/decision-intelligence/decision-analyzer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "decision-intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionAnalyzer"
    ],
    "functionNames": [
      "createDecisionAnalyzer",
      "analyzeDecision",
      "evaluateDecisionQuality",
      "calculateLifestyleQuality",
      "calculateFuturePotential",
      "calculateFlexibility",
      "identifyAdvantages",
      "mapCategoryToAdvantage",
      "identifyDisadvantages",
      "mapCategoryToDisadvantage",
      "analyzeRisks",
      "calculateAutomationImpact"
    ],
    "dependencies": [
      "'confidence' \\"
    ],
    "consumers": [
      "'analyzedAt'>",
      "DecisionQuality",
      "number",
      "Advantage[]",
      "Advantage['category']"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/decision-intelligence/decision-comparison-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "decision-intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionComparisonEngine"
    ],
    "functionNames": [
      "createDecisionComparisonEngine",
      "compareDecisions",
      "compareDimensions",
      "compareSingleDimension",
      "extractDimensionScore",
      "calculateRiskScore",
      "calculateOpportunityScore",
      "findBestOption",
      "calculateVariance",
      "calculateDimensionSignificance",
      "generateRankings",
      "identifyRelativeStrengths"
    ],
    "dependencies": [
      "decision-intelligence/decision-types.ts",
      "intelligence/decision/index.ts"
    ],
    "consumers": [
      "decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/decision-intelligence/decision-confidence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "decision-intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionConfidenceEngine"
    ],
    "functionNames": [
      "createDecisionConfidenceEngine",
      "calculateDecisionConfidence",
      "calculateProfileCertainty",
      "calculateCareerCertainty",
      "calculateEvidenceCertainty",
      "calculateRecommendationCertainty",
      "scoreToConfidenceLevel",
      "calculateAssessmentCompleteness",
      "calculateAggregateConfidence",
      "calculateDimensionCoverage",
      "calculateConfidenceConsistency",
      "fitLevelToScore"
    ],
    "dependencies": [
      "decision-intelligence/decision-types.ts",
      "career-fit/career-fit-types.ts",
      "profile/profile-types.ts",
      "career-intelligence/career-types.ts",
      "intelligence/confidence/index.ts"
    ],
    "consumers": [
      "decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/decision-intelligence/decision-intelligence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "decision-intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionIntelligenceEngine"
    ],
    "functionNames": [
      "createDecisionIntelligenceEngine",
      "analyzeDecision",
      "compareDecisions",
      "analyzeConfidence",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "decision-intelligence/decision-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts",
      "profile/profile-types.ts",
      "decision-intelligence/decision-analyzer.ts",
      "decision-intelligence/decision-confidence-engine.ts",
      "decision-intelligence/decision-comparison-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/future-simulation/future-simulation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "future-simulation",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "FutureSimulationEngine"
    ],
    "functionNames": [
      "createFutureSimulationEngine",
      "simulateFuture",
      "generateUncertaintyModel",
      "calculateOverallConfidence",
      "generateExplanation",
      "compareSimulations",
      "getTrajectoryAnalysis",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "future-simulation/future-simulation-types.ts",
      "career-intelligence/career-types.ts",
      "future-simulation/trajectory-engine.ts",
      "future-simulation/outcome-engine.ts",
      "future-simulation/scenario-generator.ts",
      "future-simulation/simulation-explainer.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/future-simulation/outcome-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "future-simulation",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "OutcomeEngine"
    ],
    "functionNames": [
      "createOutcomeEngine",
      "generateOutcomes",
      "generateAdvantages",
      "generateRisks",
      "generateOpportunities",
      "generateConstraints",
      "estimateFounderFit",
      "getScenarioLikelihood",
      "getTimeframe",
      "identifyKeyDrivers"
    ],
    "dependencies": [
      "future-simulation/future-simulation-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "future-simulation/future-simulation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/future-simulation/scenario-generator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "future-simulation",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "ScenarioGenerator"
    ],
    "functionNames": [
      "createScenarioGenerator",
      "widenRange",
      "generateScenarioSet",
      "generateScenario",
      "generateScenarioDescription",
      "generateDimensions",
      "createDimensionEstimate",
      "generateAssumptions",
      "calculateScenarioLikelihood",
      "generateComparison",
      "adjustForUncertainty",
      "widenRanges"
    ],
    "dependencies": [
      "future-simulation/future-simulation-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "future-simulation/future-simulation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/future-simulation/simulation-explainer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "future-simulation",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "SimulationExplainer"
    ],
    "functionNames": [
      "createSimulationExplainer",
      "generateExplanation",
      "generateSummary",
      "explainScenarioDifferences",
      "identifyChangingAssumptions",
      "identifyKeyFactors",
      "push",
      "generateMonitoringGuidance",
      "explainScenario",
      "explainUncertainty",
      "generateComparativeAnalysis"
    ],
    "dependencies": [
      "future-simulation/future-simulation-types.ts"
    ],
    "consumers": [
      "future-simulation/future-simulation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/future-simulation/trajectory-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "future-simulation",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "TrajectoryEngine"
    ],
    "functionNames": [
      "createTrajectoryEngine",
      "generateTrajectory",
      "generateProgressionPath",
      "generateRequirements",
      "calculateStepProbability",
      "generateAlternativePaths",
      "calculateAlternativeLikelihood",
      "determineEndState",
      "determineScope",
      "determineIncomeBand",
      "estimateSatisfaction",
      "identifyTransitions"
    ],
    "dependencies": [
      "future-simulation/future-simulation-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "future-simulation/future-simulation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/ActionIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ActionIntelligenceEngine"
    ],
    "functionNames": [
      "createActionIntelligenceEngine",
      "generate",
      "generateActions",
      "prioritizeActions",
      "analyzeSkillGaps",
      "createSkillDevelopmentPlan",
      "generateOpportunities",
      "createExecutionPlan",
      "generateExplanations",
      "createMilestones",
      "createSummary",
      "filterByTimeHorizon"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/action-intelligence/engines/ActionGenerator.ts",
      "intelligence/action-intelligence/engines/PriorityEngine.ts",
      "intelligence/action-intelligence/engines/SkillGapEngine.ts",
      "intelligence/action-intelligence/engines/OpportunityEngine.ts",
      "intelligence/action-intelligence/engines/ExecutionPlanner.ts",
      "intelligence/action-intelligence/engines/ActionExplanationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/ActionExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ActionExplanationEngine"
    ],
    "functionNames": [
      "createExplanationEngine",
      "explain",
      "summarize",
      "explainWhy",
      "explainHowItFits",
      "explainExpectedOutcome",
      "calculateROI",
      "getShortTermImpact",
      "getMediumTermImpact",
      "getLongTermImpact",
      "getShortTermTimeframe",
      "getMediumTermTimeframe"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/ActionGenerator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ActionGenerator"
    ],
    "functionNames": [
      "createActionGenerator",
      "generate",
      "generateImmediateActions",
      "generateShortTermActions",
      "generateMediumTermActions",
      "generateLongTermActions",
      "generateExtendedActions",
      "generateActionId",
      "limitActions",
      "updateConfig",
      "getConfig"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/ExecutionPlanner.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ExecutionPlanner"
    ],
    "functionNames": [
      "createExecutionPlanner",
      "createPlan",
      "createWeeklyPlans",
      "selectActionsForWeek",
      "sortActionsByPriority",
      "determineWeekFocus",
      "generateWeeklyGoals",
      "calculateTimeBudget",
      "createMonthlyPlans",
      "getMonthName",
      "determineMonthTheme",
      "generateMonthDescription"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/OpportunityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "OpportunityEngine"
    ],
    "functionNames": [
      "createOpportunityEngine",
      "generate",
      "generateCourses",
      "generateProjects",
      "generateCompetitions",
      "generateInternships",
      "generateMentorships",
      "generateCommunities",
      "generateEvents",
      "generateCertifications",
      "filterAndRankOpportunities",
      "generateOpportunityId"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/PriorityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "PriorityEngine"
    ],
    "functionNames": [
      "createPriorityEngine",
      "visit",
      "prioritize",
      "calculatePriorityScore",
      "calculateImpactScore",
      "calculateUrgencyScore",
      "calculateDifficultyScore",
      "calculateReturnScore",
      "calculateRiskScore",
      "calculateConstraintAlignment",
      "calculateStrategicImportance",
      "assignPriorityLevel"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/action-intelligence/engines/SkillGapEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "SkillGapEngine"
    ],
    "functionNames": [
      "createSkillGapEngine",
      "analyze",
      "createDevelopmentPlan",
      "extractCurrentSkills",
      "defineRequiredSkills",
      "getGenericSkills",
      "calculateGaps",
      "estimateLearningTime",
      "estimateResources",
      "generateLearningPath",
      "getLearningStepTitle",
      "getLearningStepDescription"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/action-intelligence/ActionIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/adaptive-mentor-foundation/AdaptiveMentorFoundation.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "AdaptiveMentorFoundation"
    ],
    "functionNames": [
      "createAdaptiveMentorFoundation",
      "quickMentorAnalysis",
      "generateSatisfactionGapWarning",
      "getConfig",
      "updateConfig",
      "analyze",
      "quickAnalyze",
      "getContext",
      "getContrasts",
      "getConcerningContrasts",
      "getConsiderations",
      "getPriorities"
    ],
    "dependencies": [
      "undefined"
    ],
    "consumers": [
      "../types/index.js",
      "../longitudinal-intelligence-engine/types.js",
      "../value-evolution-engine/types.js",
      "../identity-development-engine/types.js",
      "../personal-growth-engine/types.js",
      "./types.js",
      "./analysis.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-criticality/criticality-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CriticalityEngine"
    ],
    "functionNames": [
      "createCriticalityEngine",
      "analyzeCriticality",
      "compareCriticality",
      "quickCriticalityCheck",
      "calculateCriticalityScore",
      "scoreToBand",
      "generateCriticalityReason",
      "calculateFutureImpact",
      "calculateOptionalityLoss",
      "calculateDecisionWeight",
      "generateComparisonRecommendation",
      "generateWarning"
    ],
    "dependencies": [
      "intelligence/career-criticality/criticality-types.ts",
      "intelligence/career-criticality/path-dependency-engine.ts",
      "intelligence/career-criticality/option-closure-engine.ts",
      "intelligence/career-criticality/future-flexibility-engine.ts"
    ],
    "consumers": [
      "intelligence/career-criticality/criticality-report-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-criticality/criticality-report-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CriticalityReportEngine"
    ],
    "functionNames": [
      "createCriticalityReportEngine",
      "generateCriticalityReport",
      "generateQuickReport",
      "generateReport",
      "generateSummary",
      "generateStudentExplanation",
      "generateMentorTalkingPoints",
      "generateRecommendations",
      "identifyRiskFactors",
      "generateMitigationStrategies"
    ],
    "dependencies": [
      "intelligence/career-criticality/criticality-types.ts",
      "intelligence/career-criticality/criticality-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-criticality/future-flexibility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "FutureFlexibilityEngine"
    ],
    "functionNames": [
      "createFutureFlexibilityEngine",
      "analyzeFutureFlexibility",
      "findProfile",
      "adjustProfile",
      "adjustCapacity",
      "adjustDecisionWindow",
      "enhanceStrategies",
      "calculateFlexibility",
      "getSpecializationPenalty",
      "scoreToCapacity",
      "calculateNextDecisionWindow",
      "generateDefaultStrategies"
    ],
    "dependencies": [
      "undefined",
      "'HIGH' \\"
    ],
    "consumers": [
      "'MODERATE' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-criticality/option-closure-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "OptionClosureEngine"
    ],
    "functionNames": [
      "createOptionClosureEngine",
      "analyzeOptionClosure",
      "calculateDoors",
      "getSpecializationFactor",
      "getTypeFactor",
      "calculatePivotDifficulty",
      "increaseDifficulty",
      "calculateFutureRestriction",
      "identifyLostOpportunities",
      "identifyGainedOpportunities",
      "getReversibility",
      "estimateRecoveryTime"
    ],
    "dependencies": [
      "'MODERATE' \\"
    ],
    "consumers": [
      "'HARD' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-criticality/path-dependency-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathDependencyEngine"
    ],
    "functionNames": [
      "createPathDependencyEngine",
      "analyzePathDependency",
      "findProfile",
      "calculatePathDependency",
      "getSpecializationMultiplier",
      "getDurationMultiplier",
      "scoreToConstraintLevel",
      "scoreToReversibility",
      "generateEvidence",
      "estimateConstraintDuration",
      "suggestAlternativePaths",
      "quickPathDependencyCheck"
    ],
    "dependencies": [
      "undefined",
      "number",
      "'MINIMAL' \\"
    ],
    "consumers": [
      "'MODERATE' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-expansion-engine/CareerExpansionEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CareerExpansionEngineV1"
    ],
    "functionNames": [
      "findSimilarCareers",
      "calculateCareerSimilarity",
      "calculateCategoryMatch",
      "calculateIndustrySimilarity",
      "detectIndustry",
      "areIndustriesRelated",
      "calculateDomainSkillsOverlap",
      "calculateEducationSimilarity",
      "calculateWorkStyleSimilarity",
      "inferWorkStyle",
      "calculateSimilarityConfidence",
      "generateSimilarityExplanation"
    ],
    "dependencies": [
      "../../domains/career/Career.js",
      "../skill-taxonomy/SkillTaxonomyV1.js",
      "../career-graph-v2/CareerGraphV2.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph-v2/CareerGraphV2.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerGraphV2"
    ],
    "functionNames": [
      "calculateTransitionQuality",
      "calculateTransitionDifficulty",
      "calculateSkillTransferability",
      "calculateOptionalityGain",
      "calculateFutureStrength",
      "calculateTransitionProbability",
      "calculateTransitionCost",
      "calculateTransitionTime",
      "createTransitionEdge",
      "createTransitionEdgeWithQuality",
      "createAdjacentTransition",
      "createProgressionTransition"
    ],
    "dependencies": [
      "../../domains/career/Career.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/career-cascade-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerCascadeEngine"
    ],
    "functionNames": [
      "generateCascade",
      "buildCascadeStages",
      "getOutgoingEdges",
      "extractDecisions",
      "generateDecisionDescription",
      "calculateFinalOutcomes",
      "buildPathToStage",
      "calculatePathProbability",
      "findEdge",
      "estimateWorkLifeBalance",
      "calculateGrowthPotential",
      "compareCascades"
    ],
    "dependencies": [
      "intelligence/career-graph/career-graph-types.ts",
      "intelligence/career-graph/optionality-engine.ts"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/career-graph-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerGraphEngine"
    ],
    "functionNames": [
      "generateReport",
      "analyzeDecision",
      "generateOptionalityRanking",
      "generateRiskRanking",
      "generateReversibilityRanking",
      "generateFutureOpportunityRanking",
      "generateRecommendedPaths",
      "getRelevantNodes",
      "generateSimulations",
      "generateCascades",
      "generateInsights",
      "generateWarnings"
    ],
    "dependencies": [
      "intelligence/career-graph/career-graph-types.ts",
      "intelligence/career-graph/graph-builder.ts",
      "intelligence/career-graph/path-simulator.ts",
      "intelligence/career-graph/opportunity-engine.ts",
      "intelligence/career-graph/optionality-engine.ts",
      "intelligence/career-graph/irreversibility-engine.ts",
      "intelligence/career-graph/career-cascade-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/graph-builder.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "GraphBuilder"
    ],
    "functionNames": [
      "initializeGraph",
      "buildPredefinedGraph",
      "addPathway",
      "addCrossPathwayConnections",
      "addNode",
      "addEdge",
      "getGraph",
      "getNodesByType",
      "getEdgesFrom",
      "getEdgesTo",
      "getReachableNodes",
      "generateDescription"
    ],
    "dependencies": [
      "intelligence/career-graph/career-graph-types.ts"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/irreversibility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "IrreversibilityEngine"
    ],
    "functionNames": [
      "calculateIrreversibility",
      "analyzeReversibilityFactors",
      "calculateCredentialSpecificity",
      "calculateReentryBarriers",
      "calculateSkillDecayRisk",
      "calculateFinancialCostScore",
      "calculateTimeInvestmentScore",
      "calculateCredentialLockInScore",
      "calculateEntranceBarriersScore",
      "calculateSkillAtrophyScore",
      "calculateReversibilityProbabilities",
      "identifyIrreversibilityFactors"
    ],
    "dependencies": [
      "intelligence/career-graph/career-graph-types.ts"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/opportunity-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "OpportunityEngine"
    ],
    "functionNames": [
      "calculateOpportunities",
      "findOpportunities",
      "isCareerNode",
      "createOpportunity",
      "getTimeframeMonths",
      "getReachableWithinTime",
      "getOutgoingEdges",
      "calculateQualityScore",
      "calculateAccessibility",
      "calculateLikelihood",
      "calculateGrowthPotential",
      "estimateSatisfaction"
    ],
    "dependencies": [
      "intelligence/career-graph/career-graph-types.ts"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/optionality-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionalityEngine"
    ],
    "functionNames": [
      "calculateOptionality",
      "analyzeOptionality",
      "getReachableNodes",
      "getOutgoingEdges",
      "findEdge",
      "calculateTimeBasedOptionality",
      "isCareerNode",
      "identifyContributingFactors",
      "identifyLimitingFactors",
      "calculatePercentile",
      "quickScoreEstimate",
      "compareOptionality"
    ],
    "dependencies": [
      "undefined",
      "boolean"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-graph/path-simulator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathSimulator"
    ],
    "functionNames": [
      "getNodeAtYear",
      "simulate",
      "simulateLikelyPaths",
      "runSingleSimulation",
      "getOutgoingEdges",
      "selectNextEdge",
      "calculatePeriodEarnings",
      "assessRiskForEdge",
      "assessOverallRisk",
      "calculateOptionalityAtNode",
      "getReachableNodes",
      "identifyRisks"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "intelligence/career-graph/career-graph-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "CareerPathIntelligenceEngine"
    ],
    "functionNames": [
      "createCareerPathIntelligenceEngine",
      "analyze",
      "quickAnalyze",
      "getPathRecommendations",
      "getMilestonePlan",
      "getRecoveryPlan",
      "comparePaths",
      "explainPath",
      "selectPrimaryPath",
      "map",
      "generateRecommendations",
      "generateNextSteps"
    ],
    "dependencies": [
      "intelligence/career-path-intelligence/engines/PathDiscoveryEngine.ts",
      "intelligence/career-path-intelligence/engines/PathValidationEngine.ts",
      "intelligence/career-path-intelligence/engines/MilestoneEngine.ts",
      "intelligence/career-path-intelligence/engines/AlternativePathEngine.ts",
      "intelligence/career-path-intelligence/engines/FailureRecoveryEngine.ts",
      "intelligence/career-path-intelligence/engines/PathComparisonEngine.ts",
      "intelligence/career-path-intelligence/engines/PathExplanationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/AlternativePathEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "AlternativePathEngine"
    ],
    "functionNames": [
      "createAlternativePathEngine",
      "generateAlternatives",
      "findPlanB",
      "findPlanC",
      "findPlanD",
      "identifySwitchingPoints",
      "determineSwitchingCriteria",
      "generateSwitchingRecommendation",
      "isEasierThan",
      "isViableAlternative",
      "getDifficultyScore",
      "getRiskScore"
    ],
    "dependencies": [
      "null",
      "SwitchingPoint[]",
      "string",
      "boolean"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/FailureRecoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "FailureRecoveryEngine"
    ],
    "functionNames": [
      "createFailureRecoveryEngine",
      "generateRecoveryPlan",
      "generateAllRecoveryPlans",
      "generateRecoveryOptions",
      "canRetry",
      "createRetryOption",
      "createPivotOptions",
      "createBranchOptions",
      "canBypass",
      "createBypassOption",
      "createParallelOption",
      "inferFailureReason"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/MilestoneEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "MilestoneEngine"
    ],
    "functionNames": [
      "createMilestoneEngine",
      "createMilestonePlan",
      "buildDependencyGraph",
      "calculateCriticalPath",
      "identifyParallelTracks",
      "optimizeSequence",
      "getCurrentMilestone",
      "isOnCriticalPath",
      "calculateProgress",
      "getMilestonesByStatus",
      "getUpcomingMilestones",
      "getMilestoneDependencies"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/PathComparisonEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathComparisonEngine"
    ],
    "functionNames": [
      "createPathComparisonEngine",
      "compare",
      "compareDifficulty",
      "compareRisk",
      "compareCost",
      "compareDuration",
      "compareOptionality",
      "compareUtility",
      "compareMilestones",
      "compareOutcomes",
      "analyzeTradeoffs",
      "calculateFitScores"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/PathDiscoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathDiscoveryEngine"
    ],
    "functionNames": [
      "createPathDiscoveryEngine",
      "discover",
      "buildPathFromTemplate",
      "buildMilestone",
      "inferPrerequisites",
      "inferResources",
      "inferOutcomes",
      "inferValidationCriteria",
      "inferSuccessMetrics",
      "estimateMilestoneCost",
      "calculatePathConfidence",
      "estimateTemplateCost"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/PathExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathExplanationEngine"
    ],
    "functionNames": [
      "getRiskScore",
      "createPathExplanationEngine",
      "generateExplanation",
      "generateOverview",
      "generateJourneyDescription",
      "generateMilestoneNarrative",
      "generateAlternativeNarrative",
      "generateRiskNarrative",
      "generateComparisonToDirect",
      "generateComparisonToEasiest",
      "generateComparisonToFastest",
      "generateFitExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-path-intelligence/engines/PathValidationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathValidationEngine"
    ],
    "functionNames": [
      "createPathValidationEngine",
      "validate",
      "validateMultiple",
      "validatePrerequisites",
      "checkPrerequisiteSatisfaction",
      "validateFinancialConstraints",
      "validateTimeConstraints",
      "validateLocationConstraints",
      "validateContextCompatibility",
      "validateResourceAvailability",
      "checkResourceAvailability",
      "estimateWeeklyHours"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/career-path-intelligence/CareerPathIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/career-transition-graph/CareerTransitionGraphV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerTransitionGraphV1"
    ],
    "functionNames": [
      "createCareerTransitionGraph",
      "findCareerTransitionPath",
      "getReachableCareersFrom",
      "dfs",
      "addNode",
      "removeNode",
      "getNode",
      "hasNode",
      "getAllNodes",
      "getNodesByCategory",
      "addEdge",
      "removeEdge"
    ],
    "dependencies": [
      "null",
      "ReachableCareer[]",
      "void",
      "boolean",
      "CareerNode \\"
    ],
    "consumers": [
      "undefined"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence-aware-recommendation/ConfidenceAwareRecommendationEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "ConfidenceAwareRecommendationEngineV1"
    ],
    "functionNames": [
      "calculateUtilityBounds",
      "classifyRecommendationStrength",
      "calculateDecisionRisk",
      "generateRecommendationExplanation",
      "generateSummary",
      "generateReasoning",
      "generateConfidenceExplanation",
      "generateRiskExplanation",
      "generateDownsideScenario",
      "generateUpsideScenario",
      "generateNextSteps",
      "buildConfidenceAwareRecommendation"
    ],
    "dependencies": [
      "../uncertainty-engine/UncertaintyEngineV1.js",
      "../confidence-propagation-engine/ConfidencePropagationEngineV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence-propagation-engine/ConfidencePropagationEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidencePropagationEngineV1"
    ],
    "functionNames": [
      "aggregateConfidence",
      "propagateConfidence",
      "buildPropagationGraph",
      "explainConfidence",
      "calculateFinalDecisionConfidence",
      "extractMatchingConfidence",
      "extractOptionalityConfidence",
      "extractCriticalityConfidence",
      "extractPathExplorerConfidence",
      "extractCoalitionConfidence",
      "extractRegretConfidence",
      "extractDecisionOptimizationConfidence"
    ],
    "dependencies": [
      "../uncertainty-engine/UncertaintyEngineV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceAggregator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceAggregator"
    ],
    "functionNames": [
      "getConfidenceAggregator",
      "resetConfidenceAggregator",
      "aggregate",
      "weightedAverage",
      "minimum",
      "maximum",
      "bayesian",
      "consensus",
      "combineCalibrationStatus",
      "generateLineageId"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts"
    ],
    "consumers": [
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceAuthority.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceAuthority"
    ],
    "functionNames": [
      "getConfidenceAuthority",
      "resetConfidenceAuthority",
      "calculateConfidence",
      "calculateConfidenceBatch",
      "calculateUncertainty",
      "calculateReliability",
      "addCalibrationObservation",
      "getCalibrationProfile",
      "calibrateConfidence",
      "isCalibrated",
      "explainConfidence",
      "getConfidenceFactors"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceCalculator.ts",
      "intelligence/confidence/ConfidenceAggregator.ts",
      "intelligence/confidence/ConfidenceCalibration.ts",
      "intelligence/confidence/ConfidenceHistory.ts",
      "intelligence/confidence/ConfidenceMonitoring.ts",
      "intelligence/confidence/ConfidenceEvents.ts",
      "intelligence/confidence/IConfidenceAuthority.ts"
    ],
    "consumers": [
      "intelligence/confidence/modules/ArchetypeConfidenceModule.ts",
      "intelligence/confidence/modules/CareerConfidenceModule.ts",
      "intelligence/confidence/modules/DecisionConfidenceModule.ts",
      "intelligence/confidence/modules/MarketConfidenceModule.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceCalculator"
    ],
    "functionNames": [
      "getConfidenceCalculator",
      "resetConfidenceCalculator",
      "calculate",
      "calculateFromRequest",
      "validateInput",
      "calculateFactors",
      "computeWeightedConfidence",
      "getWeights",
      "buildFactorScoresFromEvidence",
      "generateFactorExplanation",
      "createDefaultCalibration",
      "createFallbackConfidence"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts"
    ],
    "consumers": [
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceCalibration.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceCalibration"
    ],
    "functionNames": [
      "getConfidenceCalibration",
      "resetConfidenceCalibration",
      "addObservation",
      "getProfile",
      "calibrateConfidence",
      "isCalibrated",
      "calibrate",
      "calculateBins",
      "calculateCalibrationError",
      "calculateReliabilityScore",
      "determineStatus",
      "calculateAdjustment"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts"
    ],
    "consumers": [
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceMonitoring.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceMonitor"
    ],
    "functionNames": [
      "getConfidenceMonitor",
      "resetConfidenceMonitor",
      "recordCalculation",
      "recordError",
      "detectDrift",
      "getMetrics",
      "getAllSystemHealth",
      "getSystemHealth",
      "reset",
      "updateSystemHealth",
      "identifyAffectedBins",
      "generateRecommendation"
    ],
    "dependencies": [
      "undefined"
    ],
    "consumers": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceEvents.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/ConfidenceTypes.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceError",
      "ConfidenceValidationError",
      "ConfidenceCalculationError",
      "CalibrationError"
    ],
    "functionNames": [
      "validateConfidence",
      "migrateLegacyConfidence",
      "getReliabilityBand",
      "createDefaultBounds"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/confidence/ConfidenceAggregator.ts",
      "intelligence/confidence/ConfidenceAuthority.ts",
      "intelligence/confidence/ConfidenceCalculator.ts",
      "intelligence/confidence/ConfidenceCalibration.ts",
      "intelligence/confidence/ConfidenceEvents.ts",
      "intelligence/confidence/ConfidenceHistory.ts",
      "intelligence/confidence/ConfidenceMonitoring.ts",
      "intelligence/confidence/IConfidenceAuthority.ts",
      "intelligence/confidence/modules/ArchetypeConfidenceModule.ts",
      "intelligence/confidence/modules/CareerConfidenceModule.ts",
      "intelligence/confidence/modules/DecisionConfidenceModule.ts",
      "intelligence/confidence/modules/MarketConfidenceModule.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/modules/ArchetypeConfidenceModule.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ArchetypeConfidenceModule"
    ],
    "functionNames": [
      "getArchetypeConfidenceModule",
      "resetArchetypeConfidenceModule",
      "calculateConfidence",
      "calculateArchetypeConfidence"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/modules/CareerConfidenceModule.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CareerConfidenceModule"
    ],
    "functionNames": [
      "getCareerConfidenceModule",
      "resetCareerConfidenceModule",
      "calculateConfidence",
      "calculateInterestAlignment",
      "calculateSkillMatch",
      "calculateValueFit",
      "calculateMatchScore"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/modules/DecisionConfidenceModule.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "DecisionConfidenceModule"
    ],
    "functionNames": [
      "getDecisionConfidenceModule",
      "resetDecisionConfidenceModule",
      "calculateConfidence",
      "calculateDecisionConfidence"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/confidence/modules/MarketConfidenceModule.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "MarketConfidenceModule"
    ],
    "functionNames": [
      "getMarketConfidenceModule",
      "resetMarketConfidenceModule",
      "calculateConfidence",
      "calculateTrendConfidence",
      "calculateSignalQuality"
    ],
    "dependencies": [
      "intelligence/confidence/ConfidenceTypes.ts",
      "intelligence/confidence/ConfidenceAuthority.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/consistency-engine/ConsistencyEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConsistencyEngine"
    ],
    "functionNames": [
      "createConsistencyEngine",
      "validateConsistency",
      "isConsistent",
      "trendToDirection",
      "trendToNumeric",
      "configure",
      "validate",
      "getCriticalViolations",
      "getPathAgreements",
      "detectContradictions",
      "checkMatchingCoalitionContradiction",
      "checkOptionalityCriticalityContradiction"
    ],
    "dependencies": [
      "intelligence/consistency-engine/utils.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/consistency-engine/utils.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [],
    "functionNames": [
      "validateInput",
      "calculateValueDistance",
      "detectDirectionalConflict",
      "normalizeScore",
      "weightedAverage",
      "calculateStdDev",
      "inRange",
      "clamp",
      "formatConfidence",
      "approximatelyEqual",
      "getSeverityColor",
      "getConsistencyColor"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/consistency-engine/ConsistencyEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/counterfactual-engine/CareerAdapter.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [],
    "functionNames": [
      "adaptCareerToPathData",
      "determinePathType",
      "generateOptionalityAnalysis",
      "generateCriticalityAnalysis",
      "coachingLevelToScore",
      "generateOpportunitiesFromCareer",
      "generateAdjacentCareers",
      "calculateSkillCategories",
      "generateOptionalityExplanation",
      "generateCriticalityExplanation",
      "adaptCareersForComparison",
      "createCareerComparisonPair"
    ],
    "dependencies": [
      "'high-growth' \\"
    ],
    "consumers": [
      "'high-optionality' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/counterfactual-engine/ComparisonFactories.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [],
    "functionNames": [
      "compareMedicineVsSoftwareEngineering",
      "compareAIEngineerVsDataScientist",
      "compareEngineerVsProductManager",
      "compareBankingVsEngineering",
      "compareCivilServicesVsCorporate",
      "compareCAVsEngineering",
      "compareLawVsEngineering",
      "compareDesignVsEngineering",
      "compareResearchVsIndustry",
      "compareConsultingVsEngineering",
      "compareCareersBySlug",
      "compareAnyCareers"
    ],
    "dependencies": [
      "null",
      "CounterfactualComparison[]",
      "Array<"
    ],
    "consumers": [
      "data/index.ts",
      "ontology/career-ontology/index.ts",
      "intelligence/counterfactual-engine/CounterfactualEngine.ts",
      "intelligence/counterfactual-engine/CareerAdapter.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/counterfactual-engine/CounterfactualEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CounterfactualEngine"
    ],
    "functionNames": [
      "generateComparisonId",
      "percentageDifference",
      "determineBetter",
      "formatINR",
      "createCounterfactualEngine",
      "comparePaths",
      "compare",
      "calculateDifferences",
      "analyzeOpportunities",
      "compareOptionality",
      "compareRegret",
      "compareIncome"
    ],
    "dependencies": [
      "'alternative' \\"
    ],
    "consumers": [
      "'similar'",
      "CounterfactualEngine",
      "CounterfactualComparison",
      "PathDifferences"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/criticality-engine/CriticalityEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CriticalityEngineV1"
    ],
    "functionNames": [
      "calculateCriticality",
      "compareCriticality",
      "calculateBatchCriticality",
      "calculateBatch",
      "getFlexibilityRanking",
      "findSimilarCriticality",
      "calculateReachableCareerCount",
      "calculateBranchingFactor",
      "calculateReversibility",
      "calculateTransferability",
      "calculateTimeToFlexibility",
      "calculateOptionalityPreservation"
    ],
    "dependencies": [
      "intelligence/career-transition-graph/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-coalition-v3/DecisionCoalitionEngineV3.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionCoalitionEngineV3"
    ],
    "functionNames": [
      "analyzeDecisionCoalition",
      "analyze",
      "analyzePath",
      "evaluateStudentInterests",
      "evaluateStudentValues",
      "evaluateFamilyExpectations",
      "evaluateEconomicReality",
      "evaluateEducationalReality",
      "evaluateGeographicReality",
      "evaluateFutureOpportunity",
      "calculateAggregateScores",
      "analyzeDynamics"
    ],
    "dependencies": [
      "../student-model",
      "intelligence/path-explorer/index.ts",
      "intelligence/optionality-engine/index.ts",
      "intelligence/criticality-engine/index.ts",
      "intelligence/career-transition-graph/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-coalition/DecisionCoalitionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionCoalitionEngine"
    ],
    "functionNames": [
      "createDecisionCoalitionEngine",
      "formDecisionCoalition",
      "createEmptyCoalitionAssessment",
      "defaultFactor",
      "formCoalition",
      "explainFactor",
      "explainAllFactors",
      "generateParentReport",
      "getDebugLog",
      "initializePressures",
      "processResponse",
      "finalizePressures"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/student-model/StudentModelEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-context/DecisionContextOrchestrator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionContextOrchestrator"
    ],
    "functionNames": [
      "createDecisionContextEngine",
      "createQuickContextEngine",
      "createPreciseContextEngine",
      "analyze",
      "detectContext",
      "extractSignals",
      "scoreContexts",
      "generateExplanations",
      "buildAnalysis",
      "determineCompleteness",
      "generateRecommendations",
      "getCategory"
    ],
    "dependencies": [
      "null",
      "Map<DecisionContextType",
      "ContextEvidence[]>",
      "DetectedContext[]",
      "'complete' \\"
    ],
    "consumers": [
      "'partial' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-context/detection/signalExtractors.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [],
    "functionNames": [
      "generateEvidenceId",
      "createEvidence",
      "extractSearchableText",
      "containsKeywords",
      "calculateKeywordStrength",
      "extractJeeSignals",
      "extractNeetSignals",
      "extractUpscSignals",
      "extractStatePscSignals",
      "extractCaSignals",
      "extractCsSignals",
      "extractCmaSignals"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/decision-context/DecisionContextOrchestrator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-context/explanation/ContextExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "ContextExplanationEngine"
    ],
    "functionNames": [
      "createContextExplanationEngine",
      "explain",
      "generateNarrative",
      "generateSummary",
      "generateDetailedNarrative",
      "generateInsight",
      "generateImplications",
      "generateContextInteraction",
      "generateCharacteristics",
      "explainConflict",
      "formatEvidenceSummary",
      "groupEvidenceByType"
    ],
    "dependencies": [
      "null",
      "Map<EvidenceType",
      "ContextEvidence[]>"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-context/scoring/ContextScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "ContextScoringEngine"
    ],
    "functionNames": [
      "createContextScoringEngine",
      "calculateConfidence",
      "calculateUncertainty",
      "calculatePotentialImprovement",
      "generateUncertaintyExplanation",
      "createMaxUncertainty",
      "prioritize",
      "detectConflicts",
      "calculateOverallConfidence",
      "updateConfig",
      "getConfig"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/decision-context/DecisionContextOrchestrator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/decision-intelligence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionIntelligenceEngine"
    ],
    "functionNames": [
      "createDecisionIntelligenceEngine",
      "analyzeDecision",
      "generateDecisionReport",
      "quickDecisionCheck",
      "isDecisionReady",
      "analyze",
      "generateReport",
      "quickCheck",
      "generatePathRecommendations",
      "findBalancedOption",
      "calculateBalancedScore",
      "findBestLongTerm"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts",
      "intelligence/decision-intelligence/decision-model.ts",
      "intelligence/decision-intelligence/tradeoff-engine.ts",
      "intelligence/decision-intelligence/regret-engine.ts",
      "intelligence/decision-intelligence/optionality-engine.ts",
      "intelligence/decision-intelligence/reversibility-engine.ts",
      "intelligence/decision-intelligence/risk-engine.ts",
      "intelligence/decision-intelligence/scenario-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/decision-model.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [],
    "functionNames": [
      "calculateWeightedScore",
      "normalizeScore",
      "calculateCompositeScore",
      "createDecisionMatrix",
      "calculateWSMScores",
      "calculateIdealSolution",
      "calculateExpectedUtility",
      "calculateRiskAdjustedUtility",
      "getPathTypeWeight",
      "calculateAggregateProjectionScore",
      "calculateOverallRisk",
      "identifyHighestRisk"
    ],
    "dependencies": [
      "null",
      "DecisionId",
      "string"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionIntelligenceEngineV1"
    ],
    "functionNames": [
      "generateDecisionId",
      "clamp",
      "normalizeScore",
      "getTierFromScore",
      "getUrgencyFromCriticality",
      "generateDecision",
      "generate",
      "calculatePathScores",
      "calculateSinglePathScore",
      "calculatePsychologicalFit",
      "calculateOptionality",
      "calculateCriticality"
    ],
    "dependencies": [
      "../student-model",
      "intelligence/path-explorer/index.ts",
      "intelligence/regret-functional/index.ts",
      "intelligence/decision-coalition-v3/index.ts",
      "intelligence/career-transition-graph/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/optionality-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "OptionalityEngine"
    ],
    "functionNames": [
      "createOptionalityEngine",
      "analyzeQuickOptionality",
      "calculateOptionalityFromComponents",
      "analyzeOptionality",
      "identifyFutureOptions",
      "getBaseFutureOptions",
      "getPivotOptions",
      "getAdvancementOptions",
      "assessPivotDifficulty",
      "getTypicalPivotPaths",
      "assessExplorationCapacity",
      "calculateAdaptabilityScore"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "RegretEngine"
    ],
    "functionNames": [
      "createRegretEngine",
      "analyzeQuickRegret",
      "calculateCategoryRegretRisk",
      "calculateRegretProfile",
      "calculateRegretRisk",
      "calculateCategoryRisk",
      "calculateOverallRegretRisk",
      "identifyStrongestCategory",
      "generateCategoryExplanations",
      "generateMitigationStrategies",
      "generateExplanation",
      "generateHorizonExplanation"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts",
      "intelligence/decision-intelligence/decision-model.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/reversibility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "ReversibilityEngine"
    ],
    "functionNames": [
      "createReversibilityEngine",
      "analyzeQuickReversibility",
      "estimateSwitchingCost",
      "assessReversibility",
      "calculateSwitchingCost",
      "calculateFinancialCost",
      "calculateTimeCost",
      "calculateSocialCost",
      "calculateIdentityCost",
      "calculateOpportunityCost",
      "checkValueAlignment",
      "estimateTimeToReverse"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/risk-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "RiskEngine"
    ],
    "functionNames": [
      "createRiskEngine",
      "analyzeQuickRisk",
      "calculateRiskProfile",
      "assessRiskCategory",
      "calculateProbability",
      "calculateFinancialProbability",
      "calculateIdentityProbability",
      "calculateCareerProbability",
      "calculateLifestyleProbability",
      "calculateBurnoutProbability",
      "calculateOpportunityCostProbability",
      "calculateMarketProbability"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/scenario-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "ScenarioEngine"
    ],
    "functionNames": [
      "createScenarioEngine",
      "generateQuickScenario",
      "generateScenarios",
      "generateOptimisticScenario",
      "generateRealisticScenario",
      "generatePessimisticScenario",
      "calculateIncomeProjection",
      "calculateFulfillmentProjection",
      "calculateRelevanceProjection",
      "calculateOptionalityProjection",
      "calculateLifestyleProjection",
      "calculateGrowthProjection"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts",
      "intelligence/decision-intelligence/decision-model.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-intelligence/tradeoff-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "TradeoffEngine"
    ],
    "functionNames": [
      "createTradeoffEngine",
      "analyzeQuickTradeoff",
      "detectTradeoffType",
      "analyzeTradeoffs",
      "gatherEvidence",
      "calculateIntensity",
      "createTradeoff",
      "parseDimension",
      "generateTradeoffExplanation",
      "suggestResolution",
      "assessStudentAwareness",
      "generateResolutionSuggestions"
    ],
    "dependencies": [
      "intelligence/decision-intelligence/decision-types.ts",
      "intelligence/decision-intelligence/decision-model.ts"
    ],
    "consumers": [
      "intelligence/decision-intelligence/decision-intelligence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-optimization-engine/DecisionOptimizationEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionOptimizationEngineV1"
    ],
    "functionNames": [
      "calculateExpectedUtility",
      "calculateCategoryScore",
      "calculateParetoFrontier",
      "dominates",
      "getDimensionScore",
      "analyzeTradeoffs",
      "generateFrontierDescription",
      "generateDecisionExplanation",
      "findBestByAttribute",
      "findBestByCoalition",
      "findBestByRegret",
      "findBestByOptionality"
    ],
    "dependencies": [
      "../maut-foundation/MAUTFoundationV1.js",
      "../path-explorer/CareerPathExplorerV1.js",
      "../decision-coalition-v3/DecisionCoalitionEngineV3.js",
      "../regret-functional/RegretFunctionalV2.js",
      "../optionality-engine/OptionalityEngineV1.js",
      "../criticality-engine/CriticalityEngineV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-tree-engine/DecisionBranchAnalyzer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionBranchAnalyzer"
    ],
    "functionNames": [
      "createDecisionBranchAnalyzer",
      "traverse",
      "analyze",
      "analyzeBranches",
      "analyzeBranch",
      "analyzeBranchRisk",
      "analyzeBranchUpside",
      "analyzeBranchOptionality",
      "generateBranchRecommendation",
      "identifyCriticalPoints",
      "calculateDecisionImpact",
      "extractConsequences"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/decision-tree-engine/DecisionTreeEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-tree-engine/DecisionExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionExplanationEngine"
    ],
    "functionNames": [
      "createDecisionExplanationEngine",
      "explain",
      "generateSummary",
      "generateDetailedExplanation",
      "generateRecommendationReasoning",
      "generateComparisons",
      "generateComparisonReasoning",
      "generateCriticalPointsExplanation",
      "generateCriticalPointReasoning",
      "generateBranchExplanations",
      "describeBranchAttractiveness",
      "describeBranchRisks"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/decision-tree-engine/DecisionTreeEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-tree-engine/DecisionPathEvaluator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionPathEvaluator"
    ],
    "functionNames": [
      "createDecisionPathEvaluator",
      "traverse",
      "evaluate",
      "evaluatePath",
      "determinePathType",
      "evaluateUtility",
      "evaluateRegret",
      "evaluateOptionality",
      "evaluateRisk",
      "evaluateMarket",
      "calculateCompositeScore",
      "extractPaths"
    ],
    "dependencies": [
      "intelligence/decision-optimization-engine/index.ts"
    ],
    "consumers": [
      "intelligence/decision-tree-engine/DecisionTreeEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-tree-engine/DecisionTreeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionTreeEngine"
    ],
    "functionNames": [
      "createDecisionTreeEngine",
      "analyzeDecisionTree",
      "analyze",
      "quickAnalyze",
      "getTopRecommendations",
      "generatePathComparisons",
      "generateWarnings",
      "calculateAverageUtility",
      "calculateUtilityVariance",
      "updateConfig",
      "getConfig"
    ],
    "dependencies": [
      "intelligence/decision-tree-engine/DecisionTreeGenerator.ts",
      "intelligence/decision-tree-engine/DecisionPathEvaluator.ts",
      "intelligence/decision-tree-engine/DecisionBranchAnalyzer.ts",
      "intelligence/decision-tree-engine/DecisionExplanationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision-tree-engine/DecisionTreeGenerator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionTreeGenerator"
    ],
    "functionNames": [
      "createDecisionTreeGenerator",
      "traverse",
      "generate",
      "createRootNode",
      "generateInitialDecisionBranches",
      "generateScenarioBranches",
      "generateTransitionBranches",
      "groupScenariosByPath",
      "estimateScenarioProbability",
      "findTargetNode",
      "extractAllPaths",
      "calculateMaxDepth"
    ],
    "dependencies": [
      "intelligence/path-explorer/index.ts",
      "intelligence/future-scenario/index.ts"
    ],
    "consumers": [
      "intelligence/decision-tree-engine/DecisionTreeEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/coalition/CoalitionModule.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "CoalitionModule"
    ],
    "functionNames": [
      "createCoalitionModule",
      "evaluateMembers",
      "evaluateMember",
      "evaluateStudentInterests",
      "evaluateStudentValues",
      "evaluateFamilyExpectations",
      "evaluateEconomicReality",
      "evaluateEducationalReality",
      "evaluateGeographicReality",
      "evaluateFutureOpportunity",
      "calculateAggregateScores",
      "analyzeDynamics"
    ],
    "dependencies": [
      "../ConfidenceTypes"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionAudit.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionAuditor"
    ],
    "functionNames": [
      "createDecisionAuditor",
      "createAudit",
      "addStep",
      "finalize",
      "hashInput",
      "generateTraceId"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionAuthority.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionAuthority"
    ],
    "functionNames": [
      "createDecisionAuthority",
      "appeal",
      "getDecisionHistory",
      "getConfig",
      "updateConfig",
      "getMetrics",
      "resetMetrics",
      "healthCheck",
      "dispose",
      "analyzeMetaDecision",
      "analyzeDecisionReadiness",
      "analyzeDecisionQuality"
    ],
    "dependencies": [
      "intelligence/decision/IDecisionAuthority.ts",
      "intelligence/decision/DecisionRanker.ts",
      "intelligence/decision/DecisionComparator.ts",
      "intelligence/decision/DecisionArbitrator.ts",
      "intelligence/decision/DecisionSelector.ts",
      "intelligence/decision/DecisionExplainer.ts",
      "intelligence/decision/DecisionHistory.ts",
      "intelligence/decision/DecisionEvents.ts",
      "intelligence/decision/DecisionAudit.ts",
      "intelligence/decision/DecisionTypes.ts",
      "intelligence/decision/meta/MetaDecisionAuthority.ts",
      "intelligence/decision/coalition/CoalitionModule.ts"
    ],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionEvents.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionEvents"
    ],
    "functionNames": [
      "createDecisionEvents",
      "emitDecisionLifecycleEvents",
      "on",
      "emit",
      "emitDecisionEvent",
      "getHistory",
      "clear",
      "generateTraceId"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionExplainer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionExplainer"
    ],
    "functionNames": [
      "createDecisionExplainer",
      "formatStrategy",
      "getVersion"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionHistory.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "InMemoryDecisionHistory"
    ],
    "functionNames": [
      "createDecisionHistory",
      "getStudentHistory",
      "exists",
      "getCount",
      "clear",
      "extractStudentId"
    ],
    "dependencies": [
      "undefined"
    ],
    "consumers": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionRanker.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionRanker"
    ],
    "functionNames": [
      "createDecisionRanker",
      "dominates",
      "roundScore",
      "getVersion"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/DecisionSelector.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionSelector"
    ],
    "functionNames": [
      "createDecisionSelector",
      "getVersion"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/IDecisionAuthority.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [],
    "functionNames": [
      "getDecisionAuthorityCapabilities",
      "isDecisionAuthority",
      "isBatchDecisionAuthority",
      "appeal"
    ],
    "dependencies": [
      "intelligence/decision/DecisionTypes.ts",
      "intelligence/decision/meta/MetaDecisionAuthority.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts",
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/decision/meta/MetaDecisionAuthority.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "MetaDecisionAuthority"
    ],
    "functionNames": [
      "createMetaDecisionAuthority",
      "analyze",
      "analyzeReadiness",
      "analyzeQuality",
      "analyzeTiming",
      "analyzeCommitment",
      "analyzeFragility",
      "analyzeRobustness",
      "evaluateStudentUnderstanding",
      "evaluateInformationCompleteness",
      "calculateReadinessScore",
      "determineDecisionState"
    ],
    "dependencies": [
      "../ConfidenceTypes",
      "intelligence/decision/DecisionTypes.ts"
    ],
    "consumers": [
      "intelligence/decision/DecisionAuthority.ts",
      "intelligence/decision/IDecisionAuthority.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/explainability-engine/ExplainabilityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ExplainabilityEngine"
    ],
    "functionNames": [
      "explainCareerMatch",
      "explainMultipleMatches",
      "generateExplanation",
      "generateSummary",
      "generateWhyThisCareer",
      "generatePsychologyExplanation",
      "getAllTraitComparisons",
      "generateStrengthExplanation",
      "generateGrowthExplanation",
      "generateCoreAlignment",
      "generateFrictionPoints",
      "generatePsychologyAssessment"
    ],
    "dependencies": [
      "domains/career/Career.ts",
      "domains/student/StudentProfile.ts",
      "intelligence/matching-engine/MatchingEngineV1.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/DimensionScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "DimensionScoringEngineV2"
    ],
    "functionNames": [
      "createDimensionScoringEngineV2",
      "scoreAllDimensions",
      "scoreDimension",
      "extractDimensionEvidence",
      "extractFromTextPatterns",
      "findPatternMatches",
      "extractContext",
      "getTextSources",
      "extractFromPortfolio",
      "extractProjectEvidence",
      "extractFromPsychology",
      "extractFromExplicitStatements"
    ],
    "dependencies": [
      "intelligence/founder-intelligence-v2/signals.ts"
    ],
    "consumers": [
      "intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FalsePositiveProtectionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FalsePositiveProtectionEngineV2"
    ],
    "functionNames": [
      "createFalsePositiveProtectionEngineV2",
      "analyze",
      "detectProfile",
      "detectFromTextPatterns",
      "detectFromPortfolio",
      "detectFromDimensionPatterns",
      "getCounterEvidence",
      "calculateDifferentialScore",
      "calculateConfidence",
      "calculateConsistency",
      "getTextSources",
      "calculateFalsePositiveRisk"
    ],
    "dependencies": [
      "null",
      "FounderEvidenceV2[]",
      "number",
      "boolean"
    ],
    "consumers": [
      "intelligence/founder-intelligence-v2/signals.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderClassificationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderClassificationEngineV2"
    ],
    "functionNames": [
      "createFounderClassificationEngineV2",
      "classify",
      "calculateAllTypeFits",
      "calculateTypeFit",
      "calculateTextEvidenceScore",
      "generateTypeExplanation",
      "identifyHybridTypes",
      "getAmbiguityReason",
      "generateClassificationExplanation",
      "getTextSources",
      "findBestCoFounderMatch",
      "isComplementary"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderExplanationEngineV2"
    ],
    "functionNames": [
      "createFounderExplanationEngineV2",
      "generateNarrative",
      "generateSummary",
      "generatePotentialDescription",
      "generateTypeDescription",
      "generateReadinessExplanation",
      "generateKeyInsight",
      "generateFalsePositiveWarning",
      "generateComparativeAssessment",
      "generateStrengthsParagraph",
      "generateDevelopmentParagraph",
      "getReadinessDescription"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderIntelligenceEngineV2"
    ],
    "functionNames": [
      "createFounderIntelligenceEngineV2",
      "analyze",
      "quickAnalyze",
      "generateRecommendations",
      "getSkillBuildingAction",
      "calculateReadinessConfidence",
      "countTextSources",
      "generateAnalysisId",
      "updateConfig",
      "getConfig"
    ],
    "dependencies": [
      "intelligence/founder-intelligence-v2/DimensionScoringEngine.ts",
      "intelligence/founder-intelligence-v2/FalsePositiveProtectionEngine.ts",
      "intelligence/founder-intelligence-v2/FounderClassificationEngine.ts",
      "intelligence/founder-intelligence-v2/FounderMarketFitEngine.ts",
      "intelligence/founder-intelligence-v2/FounderRiskProfileEngine.ts",
      "intelligence/founder-intelligence-v2/FounderExplanationEngine.ts",
      "intelligence/founder-intelligence-v2/FounderRoadmapEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderMarketFitEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderMarketFitEngineV2"
    ],
    "functionNames": [
      "createFounderMarketFitEngineV2",
      "assess",
      "assessSectorMatches",
      "generateSectorReasoning",
      "assessStageMatches",
      "assessCoFounderNeeds",
      "assessTiming",
      "calculateAlignmentScore",
      "calculateConfidence",
      "getSectorsForType",
      "canHandleStage",
      "updateConfig"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderRiskProfileEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderRiskProfileEngineV2"
    ],
    "functionNames": [
      "createFounderRiskProfileEngineV2",
      "assess",
      "assessFinancialRisk",
      "assessCommitmentRisk",
      "assessCoFounderRisk",
      "assessSkillGapRisk",
      "assessExecutionRisk",
      "assessWellnessRisk",
      "assessMisclassificationRisk",
      "calculateOverallRisk",
      "determineRiskLevel",
      "getRiskLevel"
    ],
    "dependencies": [
      "'MEDIUM' \\"
    ],
    "consumers": [
      "'HIGH' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence-v2/FounderRoadmapEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FounderRoadmapEngineV2"
    ],
    "functionNames": [
      "createFounderRoadmapEngineV2",
      "generateRoadmap",
      "determineTargetReadiness",
      "calculateTimeline",
      "generateMilestones",
      "getMilestoneDescription",
      "getMilestoneAchievements",
      "getMilestoneSkills",
      "getMilestoneSuccessCriteria",
      "generateImmediateActions",
      "generateSkillPriorities",
      "generateExperienceGoals"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/founder-intelligence-v2/FounderIntelligenceEngineV2.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence/protection/FalsePositiveProtectionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FalsePositiveProtectionEngine"
    ],
    "functionNames": [
      "createFalsePositiveProtectionEngine",
      "analyze",
      "detectProfile",
      "checkDifferentialIndicators",
      "checkPortfolioForNonFounderSignals",
      "checkDimensionPatterns",
      "isWantrepreneurPattern",
      "calculateDetectionConfidence",
      "getTextSources",
      "textMatches",
      "calculateFalsePositiveRisk",
      "shouldBlockFounderClassification"
    ],
    "dependencies": [
      "null",
      "number",
      "FounderEvidence[]",
      "boolean"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/founder-intelligence/scoring/DimensionScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "DimensionScoringEngine"
    ],
    "functionNames": [
      "createDimensionScoringEngine",
      "scoreAllDimensions",
      "scoreDimension",
      "extractDimensionEvidence",
      "extractFromText",
      "calculateMatchStrength",
      "extractFromPortfolio",
      "extractFromPsychology",
      "extractFromExplicitStatements",
      "calculateScoreFromEvidence",
      "generateDimensionExplanation",
      "generateEvidenceId"
    ],
    "dependencies": [],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/future-explorer/FutureExplorerV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "FutureExplorerV1"
    ],
    "functionNames": [
      "createFutureExplorer",
      "exploreFutures",
      "quickPathComparison",
      "compareScenariosAcrossFutures",
      "explore",
      "buildFutureContexts",
      "calculateAttractivenessScore",
      "extractCharacteristics",
      "compareFutures",
      "generateTradeoffs",
      "comparePaths",
      "compareScenarios"
    ],
    "dependencies": [
      "../future-scenario/FutureScenarioGeneratorV1.js",
      "../path-explorer/CareerPathExplorerV1.js",
      "../optionality-engine/OptionalityEngineV1.js",
      "../criticality-engine/CriticalityEngineV1.js",
      "../regret-functional/RegretFunctionalV2.js",
      "../counterfactual-engine/CounterfactualEngine.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/future-scenario/FutureScenarioGeneratorV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "FutureScenarioGeneratorV1"
    ],
    "functionNames": [
      "generateId",
      "calculateSeniority",
      "calculateIncome",
      "calculateFlexibility",
      "determineAssumptions",
      "generateRiskFactors",
      "generateMilestones",
      "createFutureScenarioGenerator",
      "generateFutureScenarios",
      "generateScenarios",
      "generateSingleScenario",
      "generateCareerStates"
    ],
    "dependencies": [
      "../types/index.js",
      "../optionality-engine/OptionalityEngineV1.js",
      "../criticality-engine/CriticalityEngineV1.js",
      "../decision-coalition-v3/DecisionCoalitionEngineV3.js",
      "../../knowledge-graph/KnowledgeGraphCore.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/CAEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "CAEngine"
    ],
    "functionNames": [
      "createCAEngine",
      "analyze",
      "determineCurrentProgress",
      "buildPathway",
      "calculateQualificationYear",
      "analyzeArticleship",
      "generateCareerOptions",
      "calculateTimeline",
      "analyzeFinancials",
      "estimateAge",
      "generateRecommendations",
      "updateConfig"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/EconomicConstraintEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "EconomicConstraintEngine"
    ],
    "functionNames": [
      "createEconomicConstraintEngine",
      "analyze",
      "buildAffordabilityProfile",
      "calculateLoanCapacity",
      "estimateFamilyContribution",
      "identifyConstraints",
      "identifyOpportunities",
      "buildTimeline",
      "estimateAge",
      "generateRecommendations",
      "updateConfig"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/FamilyBusinessEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "FamilyBusinessEngine"
    ],
    "functionNames": [
      "createFamilyBusinessEngine",
      "analyze",
      "analyzeBusinessProfile",
      "analyzeSuccession",
      "generatePreparationRequirements",
      "identifySuccessionChallenges",
      "identifySuccessionOpportunities",
      "generateIntegrationOptions",
      "analyzeIndependentPath",
      "assessRelationsImpact",
      "assessPressure",
      "generateRecommendations"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/JEEEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "JEEEngine"
    ],
    "functionNames": [
      "createJEEEngine",
      "analyze",
      "extractJEEAttempts",
      "getBestJEERank",
      "getJEEMainRank",
      "getJEEAdvancedRank",
      "generateCollegesForRank",
      "generateIITOptions",
      "generateNITOptions",
      "generateIIITOptions",
      "generateBITSOptions",
      "generateStateCollegeOptions"
    ],
    "dependencies": [
      "undefined",
      "JEEOutcome[]",
      "JEEOutcome"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/NEETEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "NEETEngine"
    ],
    "functionNames": [
      "createNEETEngine",
      "analyze",
      "calculatePercentile",
      "extractNEETAttempts",
      "getBestNEETRank",
      "getBestNEETScore",
      "generateEligibleSeats",
      "generateGovernmentMBBS",
      "generateGovernmentBDS",
      "generateGovernmentAYUSH",
      "generatePrivateMBBS",
      "generateAbroadOptions"
    ],
    "dependencies": [
      "undefined",
      "number"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/RegionalConstraintEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "RegionalConstraintEngine"
    ],
    "functionNames": [
      "createRegionalConstraintEngine",
      "analyze",
      "buildMobilityProfile",
      "estimateDistanceConstraint",
      "identifyLanguageConstraints",
      "identifyCulturalConstraints",
      "estimateRelocationCost",
      "canAffordRelocation",
      "identifyConstraintFactors",
      "analyzeOpportunityLandscape",
      "getHomeRegionOpportunities",
      "getHomeRegionLimitations"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/engines/UPSCEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "UPSCEngine"
    ],
    "functionNames": [
      "createUPSCConfig",
      "analyze",
      "estimateBirthYear",
      "checkEligibility",
      "extractUPSCAttempts",
      "assessReadiness",
      "generateAttemptStrategy",
      "calculatePreparationTime",
      "estimateCoachingCost",
      "generateServicePreferences",
      "generateBackupPlans",
      "assessRisks"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/IndiaExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "IndiaExplanationEngine"
    ],
    "functionNames": [
      "createIndiaExplanationEngine",
      "generate",
      "generateSummary",
      "generateContextParagraph",
      "generateConstraintImpact",
      "generateFamilyContext",
      "generateEconomicReality",
      "generateRegionalConsiderations",
      "generateMotivationAlignment",
      "generatePracticalAdvice",
      "getMotivationLabel",
      "updateConfig"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/IndiaIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "IndiaIntelligenceEngine"
    ],
    "functionNames": [
      "createIndiaIntelligenceEngine",
      "analyze",
      "quickAnalyze",
      "shouldRunJEE",
      "shouldRunNEET",
      "shouldRunUPSC",
      "shouldRunCA",
      "generateIntegratedRecommendations",
      "estimateTimeline",
      "generateNextSteps",
      "generateRealityCheck",
      "generateAnalysisId"
    ],
    "dependencies": [
      "intelligence/india-intelligence/engines/JEEEngine.ts",
      "intelligence/india-intelligence/engines/NEETEngine.ts",
      "intelligence/india-intelligence/engines/UPSCEngine.ts",
      "intelligence/india-intelligence/engines/CAEngine.ts",
      "intelligence/india-intelligence/engines/FamilyBusinessEngine.ts",
      "intelligence/india-intelligence/engines/RegionalConstraintEngine.ts",
      "intelligence/india-intelligence/engines/EconomicConstraintEngine.ts",
      "intelligence/india-intelligence/IndiaMotivationModel.ts",
      "intelligence/india-intelligence/IndiaExplanationEngine.ts",
      "intelligence/india-intelligence/IndiaTradeoffEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/IndiaMotivationModel.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "IndiaMotivationModel"
    ],
    "functionNames": [
      "createIndiaMotivationModel",
      "analyze",
      "detectStabilitySeeking",
      "detectPrestigeSeeking",
      "detectFamilyResponsibility",
      "detectSocialMobility",
      "detectPublicService",
      "detectWealthCreation",
      "detectEntrepreneurship",
      "detectFamilyLegacy",
      "detectGeographicalMobility",
      "detectStudyAbroad"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/india-intelligence/IndiaTradeoffEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "IndiaTradeoffEngine"
    ],
    "functionNames": [
      "createIndiaTradeoffEngine",
      "analyze",
      "analyzeJEEDropYearTradeoff",
      "analyzeUPSCCorporateTradeoff",
      "analyzeMedicalEngineeringTradeoff",
      "analyzeCollegeTierTradeoff",
      "analyzeFamilyBusinessTradeoff",
      "analyzeLocationTradeoff",
      "buildTradeoffAnalysis",
      "buildComparison",
      "buildDecisionFramework",
      "generateRecommendation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/india-intelligence/IndiaIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/information-value-engine/InformationValueEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "InformationValueEngineV1"
    ],
    "functionNames": [
      "identifyUncertaintyFactors",
      "assessStudentProfileUncertainty",
      "calculatePsychCompleteness",
      "identifyPsychGaps",
      "calculateRealityCompleteness",
      "identifyRealityGaps",
      "assessCareerKnowledgeUncertainty",
      "assessFitUncertainty",
      "assessOutcomeUncertainty",
      "identifyMissingEvidence",
      "generateEvidenceRecommendations",
      "identifyWeakAssumptions"
    ],
    "dependencies": [
      "../types/index.js",
      "../uncertainty-engine/index.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/longitudinal-intelligence-engine/analysis.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [],
    "functionNames": [
      "generateTimeline",
      "calculateTimelineSummary",
      "detectTransitions",
      "identifyMilestones",
      "analyzeDecisionPatterns",
      "generateInsights",
      "generatePredictions"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/longitudinal-intelligence-engine/LongitudinalIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "LongitudinalIntelligenceEngine"
    ],
    "functionNames": [
      "createLongitudinalIntelligenceEngine",
      "quickLongitudinalAnalysis",
      "getEventTypeLabel",
      "getEventTypes",
      "getConfig",
      "updateConfig",
      "analyze",
      "quickAnalyze",
      "addEvent",
      "getTimeline",
      "getEventsInRange",
      "getTransitions"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js",
      "./analysis.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/DecisionNarrativeGenerator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DecisionNarrativeGenerator"
    ],
    "functionNames": [
      "createDecisionNarrativeGenerator",
      "quickGenerateDecisionNarrative",
      "generateNarrative",
      "generateSummary",
      "generatePrimaryReasoning",
      "generateMarketContext",
      "generateConfidenceStatement",
      "generateCaveats",
      "getTopFactor",
      "generateComparisonNarrative",
      "generateDecisionSummary"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/MarketAdjustmentCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketAdjustmentCalculator"
    ],
    "functionNames": [
      "createMarketAdjustmentCalculator",
      "quickCalculateAdjustment",
      "calculateAdjustment",
      "extractFactors",
      "extractDemandFactor",
      "extractSalaryGrowthFactor",
      "extractCompetitionFactor",
      "extractAutomationRiskFactor",
      "extractIndustryOutlookFactor",
      "extractRegionalOpportunityFactor",
      "calculateDemandAdjustment",
      "calculateSalaryGrowthAdjustment"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/MarketAwareDecisionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketAwareDecisionEngine"
    ],
    "functionNames": [
      "createMarketAwareDecisionEngine",
      "quickProcess",
      "processRecommendations",
      "processSingleRecommendation",
      "applyOutcomeSignal",
      "calculateMarketInfluence",
      "validateDecisionQualityPreservation",
      "getEngines",
      "getConfig",
      "updateConfig",
      "getStabilityEngine",
      "clearCache"
    ],
    "dependencies": [
      "null",
      "number",
      "MarketAwareDecisionResult['marketInfluence']",
      "boolean"
    ],
    "consumers": [
      "./types.js",
      "./MarketAdjustmentCalculator.js",
      "./MarketOverrideProtection.js",
      "./MarketRiskAdjustment.js",
      "./MarketOpportunityBoost.js",
      "./RecommendationStabilityEngine.js",
      "./DecisionNarrativeGenerator.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/MarketOpportunityBoost.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketOpportunityBoostEngine"
    ],
    "functionNames": [
      "createMarketOpportunityBoostEngine",
      "quickCalculateBoost",
      "calculateBoost",
      "qualifiesForBoost",
      "identifyOpportunityFactors",
      "scaleBoostByFit",
      "generateExplanation",
      "calculateBatch",
      "getBoostSummary"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/MarketOverrideProtection.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketOverrideProtection"
    ],
    "functionNames": [
      "createMarketOverrideProtection",
      "quickEvaluateProtection",
      "quickDetectTrendChasing",
      "evaluateProtection",
      "detectTrendChasing",
      "checkMarketInfluenceLimit",
      "validateDecisionQuality",
      "calculateProtectionConfidence",
      "getProtectionSummary"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/MarketRiskAdjustment.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketRiskAdjustmentEngine"
    ],
    "functionNames": [
      "createMarketRiskAdjustmentEngine",
      "quickCalculateRiskAdjustment",
      "calculateRiskAdjustment",
      "calculateAdjustment",
      "getRiskAdjustmentAmount",
      "applyHighFitProtection",
      "generateExplanation",
      "calculateBatch",
      "getRiskSummary"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-aware-decision/RecommendationStabilityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "RecommendationStabilityEngine"
    ],
    "functionNames": [
      "createRecommendationStabilityEngine",
      "assessStability",
      "recordUpdate",
      "getStabilityRecord",
      "isEmergencyChange",
      "calculateVariance",
      "detectTrend",
      "calculateStability",
      "getDecisionStability",
      "getStatistics",
      "clear",
      "clearDecision"
    ],
    "dependencies": [
      "undefined",
      "boolean",
      "number"
    ],
    "consumers": [
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-learning/TrendHistoryRepository.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "TrendHistoryRepository"
    ],
    "functionNames": [
      "createTrendHistoryRepository",
      "avg",
      "storeSnapshot",
      "storeSnapshots",
      "getTrendHistory",
      "getSnapshots",
      "getLatestSnapshot",
      "getTrackedEntities",
      "getEntitiesByType",
      "clearEntity",
      "clear",
      "getStats"
    ],
    "dependencies": [
      "undefined",
      "MarketSnapshot[]",
      "MarketSnapshot \\"
    ],
    "consumers": [
      "undefined",
      "Array<"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/EmergingCareerDetector.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "EmergingCareerDetector"
    ],
    "functionNames": [
      "createEmergingCareerDetector",
      "quickDetectEmerging",
      "detectEmerging",
      "detectEmergingBatch",
      "calculateGrowthRate",
      "calculateAcceleration",
      "calculateGrowthRateForWindow",
      "calculateConsistency",
      "calculateEmergenceScore",
      "determineTrajectory",
      "generateIndicators",
      "calculateConfidence"
    ],
    "dependencies": [
      "null",
      "EmergingCareer[]",
      "number",
      "'accelerating' \\"
    ],
    "consumers": [
      "'steady' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/MarketIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketIntelligenceEngine"
    ],
    "functionNames": [
      "createMarketIntelligenceEngine",
      "quickAnalyze",
      "quickCompare",
      "analyzeCareer",
      "analyzeSkill",
      "analyzeIndustry",
      "analyzeRegion",
      "analyze",
      "detectTrends",
      "calculateOpportunity",
      "detectRisks",
      "calculateMomentum"
    ],
    "dependencies": [
      "./types.js",
      "./TrendDetectionEngine.js",
      "./OpportunityScoringEngine.js",
      "./MarketRiskEngine.js",
      "./MarketMomentumEngine.js",
      "./EmergingCareerDetector.js",
      "./MarketNarrativeEngine.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/MarketMomentumEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketMomentumEngine"
    ],
    "functionNames": [
      "createMarketMomentumEngine",
      "quickCalculateMomentum",
      "calculateMomentum",
      "calculateMultiMetricMomentum",
      "calculateRateOfChange",
      "calculateAcceleration",
      "calculateRateForWindow",
      "determineDirection",
      "calculatePersistence",
      "calculateVolatility",
      "calculateConfidence",
      "getMomentumInterpretation"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "MarketMomentum>",
      "number",
      "'up' \\"
    ],
    "consumers": [
      "'down' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/MarketNarrativeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketNarrativeEngine"
    ],
    "functionNames": [
      "createMarketNarrativeEngine",
      "quickGenerateNarrative",
      "generateNarrative",
      "generateSummary",
      "generateKeyPoints",
      "generateSupportingEvidence",
      "generateRecommendations",
      "calculateNarrativeConfidence",
      "generateComparisonNarrative"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/MarketRiskEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketRiskEngine"
    ],
    "functionNames": [
      "createMarketRiskEngine",
      "quickAssessRisk",
      "detectRisks",
      "checkOversaturation",
      "checkDecliningDemand",
      "checkHighCompetition",
      "checkAutomationExposure",
      "checkIndustryWeakness",
      "checkSalaryStagnation",
      "checkSkillObsolescence",
      "checkRegionalDecline",
      "scoreToLevel"
    ],
    "dependencies": [
      "null",
      "RiskLevel"
    ],
    "consumers": [
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/OpportunityScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "OpportunityScoringEngine"
    ],
    "functionNames": [
      "createOpportunityScoringEngine",
      "quickCalculateOpportunity",
      "calculateOpportunity",
      "calculateDemandScore",
      "calculateCompetitionScore",
      "calculateSalaryGrowthScore",
      "calculateFutureOutlookScore",
      "calculateAutomationRiskScore",
      "calculateConfidence",
      "generateDrivers",
      "generateRisks",
      "getScoreInterpretation"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market-signal-intelligence/TrendDetectionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "TrendDetectionEngine"
    ],
    "functionNames": [
      "createTrendDetectionEngine",
      "quickDetectTrend",
      "detectTrend",
      "detectTrends",
      "calculateTrend",
      "linearRegressionTrend",
      "movingAverageTrend",
      "momentumBasedTrend",
      "calculateMomentum",
      "generateExplanation",
      "detectDirection"
    ],
    "dependencies": [
      "null",
      "MarketTrend[]",
      "number",
      "string[]",
      "'up' \\"
    ],
    "consumers": [
      "'down' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/CareerMarketProfileEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "CareerMarketProfileEngine"
    ],
    "functionNames": [
      "createCareerMarketProfileEngine",
      "generateProfile",
      "updateProfile",
      "calculateDemandScore",
      "calculateSalaryScore",
      "calculateGrowthScore",
      "calculateScarcityScore",
      "calculateAutomationRiskScore",
      "calculateResilienceScore",
      "calculateDemandComponents",
      "calculateSalaryComponents",
      "calculateGrowthComponents"
    ],
    "dependencies": [
      "null>",
      "number",
      "CareerMarketProfile['components']['demand']",
      "CareerMarketProfile['components']['salary']",
      "CareerMarketProfile['components']['growth']"
    ],
    "consumers": [
      "intelligence/market/models/CareerMarketProfile.ts",
      "intelligence/market/models/MarketTrend.ts",
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/models/MarketSnapshot.ts",
      "intelligence/market/repositories/CareerMarketRepository.ts",
      "intelligence/market/MarketConfidenceEngine.ts",
      "intelligence/market/constants/MarketWeights.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/constants/MarketWeights.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [],
    "functionNames": [
      "calculateWeightedScore",
      "getSignalFreshnessWeight",
      "getSourceReliabilityWeight",
      "getConfidenceLevelLabel",
      "normalizeScore"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/market/CareerMarketProfileEngine.ts",
      "intelligence/market/EmergingCareerEngine.ts",
      "intelligence/market/MarketConfidenceEngine.ts",
      "intelligence/market/MarketIntelligenceEngine.ts",
      "intelligence/market/MarketSignalEngine.ts",
      "intelligence/market/MarketTrendEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/CareerDiscoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "CareerDiscoveryEngine"
    ],
    "functionNames": [
      "createCareerDiscoveryEngine",
      "discover",
      "addSignal",
      "getCareer",
      "getAllCareers",
      "getPendingReview",
      "approveCareer",
      "rejectCareer",
      "assignReviewer",
      "getStatistics",
      "findSimilarCareers",
      "getCareerById"
    ],
    "dependencies": [
      "null",
      "EmergingCareer[]",
      "DiscoveryQueueEntry[]",
      "boolean",
      "DiscoveryAnalysis"
    ],
    "consumers": [
      "intelligence/market/discovery/models/DiscoverySignal.ts",
      "intelligence/market/discovery/models/EmergingCareer.ts",
      "intelligence/market/discovery/EmergingCareerEngine.ts",
      "intelligence/market/discovery/DiscoveryConfidenceEngine.ts",
      "intelligence/market/discovery/models/DiscoveryAnalysis.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/DecliningCareerEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DecliningCareerEngine"
    ],
    "functionNames": [
      "createDecliningCareerEngine",
      "processSignals",
      "analyzeCareerSignals",
      "addSignal",
      "getCareer",
      "getAllCareers",
      "getCareersByStage",
      "getHighPriority",
      "getAlerts",
      "getAlternativePaths",
      "updateReviewStatus",
      "explainDecline"
    ],
    "dependencies": [
      "null",
      "void",
      "DecliningCareer \\"
    ],
    "consumers": [
      "null",
      "DecliningCareer[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/DecliningSkillEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DecliningSkillEngine"
    ],
    "functionNames": [
      "createDecliningSkillEngine",
      "processSignals",
      "analyzeSkillDecline",
      "addSignal",
      "getSkill",
      "getAllSkills",
      "getSkillsByStage",
      "getHighPriority",
      "getReplacements",
      "groupSignalsBySkill",
      "createOrUpdateSkill",
      "updateSkillFromSignals"
    ],
    "dependencies": [
      "null",
      "void",
      "DecliningSkill \\"
    ],
    "consumers": [
      "null",
      "DecliningSkill[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/DiscoveryConfidenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DiscoveryConfidenceEngine"
    ],
    "functionNames": [
      "createDiscoveryConfidenceEngine",
      "calculateConfidenceFactors",
      "calculateConfidence",
      "calculateSourceCountFactor",
      "calculateSourceQualityFactor",
      "calculateSignalConsistencyFactor",
      "calculateTrendPersistenceFactor",
      "calculateEvidenceDiversityFactor",
      "assessConfidenceLevel",
      "compareConfidence",
      "generateComparisonReason",
      "identifyConfidenceGaps"
    ],
    "dependencies": [
      "intelligence/market/discovery/models/DiscoverySignal.ts",
      "intelligence/market/discovery/models/DiscoveryAnalysis.ts"
    ],
    "consumers": [
      "intelligence/market/discovery/CareerDiscoveryEngine.ts",
      "intelligence/market/discovery/DecliningCareerEngine.ts",
      "intelligence/market/discovery/EmergingCareerEngine.ts",
      "intelligence/market/discovery/EmergingIndustryEngine.ts",
      "intelligence/market/discovery/EmergingSkillEngine.ts",
      "intelligence/market/discovery/IndustryDiscoveryEngine.ts",
      "intelligence/market/discovery/SkillDiscoveryEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/DiscoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DiscoveryEngine"
    ],
    "functionNames": [
      "createDiscoveryEngine",
      "discover",
      "addSignal",
      "processBuffer",
      "getAllDiscoveries",
      "getPendingReview",
      "approveDiscovery",
      "rejectDiscovery",
      "getStatistics",
      "getTopOpportunities",
      "getDeclineAlerts",
      "search"
    ],
    "dependencies": [
      "intelligence/market/discovery/models/DiscoverySignal.ts",
      "intelligence/market/discovery/models/EmergingCareer.ts",
      "intelligence/market/discovery/models/EmergingSkill.ts",
      "intelligence/market/discovery/models/EmergingIndustry.ts",
      "intelligence/market/discovery/models/DecliningCareer.ts",
      "./models/DecliningSkill",
      "intelligence/market/discovery/models/DiscoveryAnalysis.ts",
      "intelligence/market/discovery/CareerDiscoveryEngine.ts",
      "intelligence/market/discovery/SkillDiscoveryEngine.ts",
      "intelligence/market/discovery/IndustryDiscoveryEngine.ts",
      "intelligence/market/discovery/DecliningCareerEngine.ts",
      "intelligence/market/discovery/DecliningSkillEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/EmergingCareerEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "EmergingCareerEngine"
    ],
    "functionNames": [
      "createEmergingCareerEngine",
      "processSignals",
      "analyzeCareerSignals",
      "addSignal",
      "getCareer",
      "getAllCareers",
      "getCareersByStage",
      "getHighConfidenceCareers",
      "rankByGrowthPotential",
      "findSimilarCareers",
      "updateReviewStatus",
      "groupSignalsByCareer"
    ],
    "dependencies": [
      "null",
      "void",
      "EmergingCareer \\"
    ],
    "consumers": [
      "null",
      "EmergingCareer[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/EmergingIndustryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "EmergingIndustryEngine"
    ],
    "functionNames": [
      "createEmergingIndustryEngine",
      "processSignals",
      "analyzeIndustrySignals",
      "addSignal",
      "getIndustry",
      "getAllIndustries",
      "getIndustriesByStage",
      "getIndustriesByCategory",
      "getHighConfidenceIndustries",
      "rankByOpportunity",
      "getIndustriesByRiskLevel",
      "findRelatedIndustries"
    ],
    "dependencies": [
      "null",
      "void",
      "EmergingIndustry \\"
    ],
    "consumers": [
      "null",
      "EmergingIndustry[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/EmergingSkillEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "EmergingSkillEngine"
    ],
    "functionNames": [
      "createEmergingSkillEngine",
      "processSignals",
      "analyzeSkillSignals",
      "addSignal",
      "getSkill",
      "getAllSkills",
      "getSkillsByStage",
      "getSkillsByCategory",
      "getHighConfidenceSkills",
      "rankByRelevance",
      "getSkillsByTrajectory",
      "findRelatedSkills"
    ],
    "dependencies": [
      "null",
      "void",
      "EmergingSkill \\"
    ],
    "consumers": [
      "null",
      "EmergingSkill[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/IndustryDiscoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "IndustryDiscoveryEngine"
    ],
    "functionNames": [
      "createIndustryDiscoveryEngine",
      "discover",
      "addSignal",
      "getIndustry",
      "getAllIndustries",
      "getPendingReview",
      "getTopOpportunities",
      "getByRiskLevel",
      "approveIndustry",
      "rejectIndustry",
      "assignReviewer",
      "getStatistics"
    ],
    "dependencies": [
      "null",
      "EmergingIndustry[]",
      "IndustryQueueEntry[]",
      "boolean",
      "DiscoveryAnalysis"
    ],
    "consumers": [
      "intelligence/market/discovery/models/DiscoverySignal.ts",
      "intelligence/market/discovery/models/EmergingIndustry.ts",
      "intelligence/market/discovery/EmergingIndustryEngine.ts",
      "intelligence/market/discovery/DiscoveryConfidenceEngine.ts",
      "intelligence/market/discovery/models/DiscoveryAnalysis.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/discovery/SkillDiscoveryEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SkillDiscoveryEngine"
    ],
    "functionNames": [
      "createSkillDiscoveryEngine",
      "discover",
      "addSignal",
      "getSkill",
      "getAllSkills",
      "getPendingReview",
      "getAcceleratingSkills",
      "getSkillsByCategory",
      "approveSkill",
      "rejectSkill",
      "assignReviewer",
      "getStatistics"
    ],
    "dependencies": [
      "null",
      "EmergingSkill[]",
      "SkillQueueEntry[]",
      "boolean",
      "DiscoveryAnalysis"
    ],
    "consumers": [
      "intelligence/market/discovery/models/DiscoverySignal.ts",
      "intelligence/market/discovery/models/EmergingSkill.ts",
      "intelligence/market/discovery/EmergingSkillEngine.ts",
      "intelligence/market/discovery/DiscoveryConfidenceEngine.ts",
      "intelligence/market/discovery/models/DiscoveryAnalysis.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/EmergingCareerEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "EmergingCareerEngine"
    ],
    "functionNames": [
      "createEmergingCareerEngine",
      "detectEmergingCareers",
      "analyzeCareerTitle",
      "identifyCandidates",
      "analyzeCandidate",
      "calculateGrowthMetrics",
      "gatherEvidence",
      "classifyEvidenceType",
      "calculateEmergenceConfidence",
      "determineStage",
      "calculateVelocityScore",
      "identifyRelatedCareers"
    ],
    "dependencies": [
      "null>",
      "EmergingCandidate[]",
      "EmergingCareerEvidence[]",
      "string"
    ],
    "consumers": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/models/EmergingCareer.ts",
      "intelligence/market/repositories/MarketRepository.ts",
      "intelligence/market/MarketConfidenceEngine.ts",
      "intelligence/market/constants/MarketWeights.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/CareerForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "CareerForecastEngine"
    ],
    "functionNames": [
      "createCareerForecastEngine",
      "generateForecast",
      "getForecast",
      "compareCareers",
      "identifyPatterns",
      "generateLowConfidenceForecast",
      "getLatestValue",
      "analyzeTrend",
      "getHorizonYears",
      "projectValue",
      "adjustForAutomation",
      "calculateVolatility"
    ],
    "dependencies": [
      "null",
      "Array<",
      "number",
      "Date"
    ],
    "consumers": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/forecasting/models/ForecastScenario.ts",
      "intelligence/market/forecasting/models/ForecastConfidence.ts",
      "intelligence/market/forecasting/models/ForecastEvidence.ts",
      "intelligence/market/forecasting/ScenarioGenerator.ts",
      "intelligence/market/forecasting/ConfidenceForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/ConfidenceForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ConfidenceForecastEngine"
    ],
    "functionNames": [
      "createConfidenceForecastEngine",
      "calculateConfidence",
      "calculateFactors",
      "assessDataQuality",
      "assessHistoricalConsistency",
      "assessTrendPersistence",
      "assessSignalStrength",
      "analyzeTrend",
      "calculateEvidenceConfidence",
      "estimateConfidenceDecay",
      "compareConfidence"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/ForecastConfidence.ts",
      "intelligence/market/forecasting/models/ForecastEvidence.ts"
    ],
    "consumers": [
      "intelligence/market/forecasting/CareerForecastEngine.ts",
      "intelligence/market/forecasting/IndustryForecastEngine.ts",
      "intelligence/market/forecasting/RegionForecastEngine.ts",
      "intelligence/market/forecasting/SkillForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/ForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ForecastEngine"
    ],
    "functionNames": [
      "createForecastEngine",
      "forecastCareer",
      "forecastSkill",
      "forecastIndustry",
      "forecastRegion",
      "generateBatchForecasts",
      "compareForecasts",
      "validateForecast",
      "getCalibrationMetrics",
      "getAccuracyStats",
      "getCachedForecast",
      "invalidateCache"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/forecasting/CareerForecastEngine.ts",
      "intelligence/market/forecasting/SkillForecastEngine.ts",
      "intelligence/market/forecasting/IndustryForecastEngine.ts",
      "intelligence/market/forecasting/RegionForecastEngine.ts",
      "intelligence/market/forecasting/ForecastValidationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/ForecastValidationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ForecastValidationEngine"
    ],
    "functionNames": [
      "createForecastValidationEngine",
      "getValue",
      "validateForecast",
      "calculateCalibration",
      "detectDrift",
      "getValidationHistory",
      "getAccuracyStats",
      "calculateDistance",
      "checkWithinRange",
      "getConfidenceLevel",
      "generateValidationNotes",
      "generateRecommendations"
    ],
    "dependencies": [
      "null",
      "ForecastDrift \\"
    ],
    "consumers": [
      "null",
      "ValidationResult[]",
      "number"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/IndustryForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "IndustryForecastEngine"
    ],
    "functionNames": [
      "createIndustryForecastEngine",
      "generateForecast",
      "compareIndustries",
      "identifyCycles",
      "generateLowConfidenceForecast",
      "getLatestValue",
      "analyzeTrend",
      "getHorizonYears",
      "projectValue",
      "calculateInvestmentScore",
      "adjustForExternalFactors",
      "determineExpansionMagnitude"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/forecasting/models/ForecastScenario.ts",
      "intelligence/market/forecasting/models/ForecastConfidence.ts",
      "intelligence/market/forecasting/models/ForecastEvidence.ts",
      "intelligence/market/forecasting/ScenarioGenerator.ts",
      "intelligence/market/forecasting/ConfidenceForecastEngine.ts"
    ],
    "consumers": [
      "intelligence/market/forecasting/ForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/RegionForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "RegionForecastEngine"
    ],
    "functionNames": [
      "createRegionForecastEngine",
      "generateForecast",
      "compareRegions",
      "identifyRemoteFriendly",
      "generateLowConfidenceForecast",
      "getLatestValue",
      "analyzeTrend",
      "getHorizonYears",
      "projectValue",
      "adjustForExternalFactors",
      "determineGrowthOutlook",
      "calculateCostBenefit"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/forecasting/models/ForecastScenario.ts",
      "intelligence/market/forecasting/models/ForecastConfidence.ts",
      "intelligence/market/forecasting/models/ForecastEvidence.ts",
      "intelligence/market/forecasting/ScenarioGenerator.ts",
      "intelligence/market/forecasting/ConfidenceForecastEngine.ts"
    ],
    "consumers": [
      "intelligence/market/forecasting/ForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/ScenarioGenerator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ScenarioGenerator"
    ],
    "functionNames": [
      "createScenarioGenerator",
      "getBaseValue",
      "getValue",
      "generateScenarios",
      "generateBaseline",
      "generateOptimistic",
      "generatePessimistic",
      "generateSingle",
      "adjustProbabilities",
      "generateRanges",
      "createContext"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/ForecastScenario.ts",
      "intelligence/market/forecasting/models/ForecastRange.ts"
    ],
    "consumers": [
      "intelligence/market/forecasting/CareerForecastEngine.ts",
      "intelligence/market/forecasting/IndustryForecastEngine.ts",
      "intelligence/market/forecasting/RegionForecastEngine.ts",
      "intelligence/market/forecasting/SkillForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/forecasting/SkillForecastEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SkillForecastEngine"
    ],
    "functionNames": [
      "createSkillForecastEngine",
      "generateForecast",
      "compareSkills",
      "identifyClusters",
      "generateLowConfidenceForecast",
      "getLatestValue",
      "analyzeTrend",
      "getHorizonYears",
      "projectValue",
      "calculateScarcity",
      "projectScarcity",
      "adjustForObsolescence"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/forecasting/models/ForecastScenario.ts",
      "intelligence/market/forecasting/models/ForecastConfidence.ts",
      "intelligence/market/forecasting/models/ForecastEvidence.ts",
      "intelligence/market/forecasting/ScenarioGenerator.ts",
      "intelligence/market/forecasting/ConfidenceForecastEngine.ts"
    ],
    "consumers": [
      "intelligence/market/forecasting/ForecastEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/integration/MarketAdjustmentEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketAdjustmentEngine"
    ],
    "functionNames": [
      "createMarketAdjustmentEngine",
      "calculateAdjustments",
      "applyToAnalysis",
      "calculateBatchAdjustments",
      "getAdjustmentSummary",
      "calculateTrendAdjustment",
      "calculateVolatilityAdjustment",
      "extractVolatility",
      "extractTrendDirection",
      "extractTrendStrength",
      "updateRiskFlags"
    ],
    "dependencies": [
      "intelligence/market/forecasting/models/Forecast.ts",
      "intelligence/market/integration/models/MarketAwareCareerAnalysis.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/integration/MarketNarrativeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketNarrativeEngine"
    ],
    "functionNames": [
      "createMarketNarrativeEngine",
      "generateNarrative",
      "generateComparisonNarrative",
      "generateMarketContext",
      "generateFitPriority",
      "generateConfidenceExplanation",
      "generateRiskConsiderations",
      "generateSummary",
      "generatePrimaryRecommendation",
      "getPrimaryDriver",
      "generateComparisonOverview",
      "generateComparisonSummary"
    ],
    "dependencies": [
      "intelligence/market/integration/models/MarketAwareCareerAnalysis.ts",
      "intelligence/market/forecasting/models/Forecast.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/integration/MarketOpportunityBoost.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketOpportunityBoost"
    ],
    "functionNames": [
      "createMarketOpportunityBoost",
      "applyBoost",
      "evaluateBoost",
      "applyBatchBoosts",
      "getBoostStatistics",
      "findAlignmentOpportunities",
      "generateNoBoostExplanation"
    ],
    "dependencies": [
      "intelligence/market/integration/models/MarketAwareCareerAnalysis.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/integration/MarketRecommendationAudit.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketRecommendationAudit"
    ],
    "functionNames": [
      "createMarketRecommendationAudit",
      "audit",
      "auditBatch",
      "validateWeights",
      "generateReport",
      "needsManualReview",
      "calculateAuditScore",
      "determineSeverity",
      "calculateAuditConfidence",
      "generateRecommendations",
      "generateSystemRecommendations"
    ],
    "dependencies": [
      "intelligence/market/integration/models/MarketAwareCareerAnalysis.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/integration/MarketRiskAdjustment.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketRiskAdjustment"
    ],
    "functionNames": [
      "createMarketRiskAdjustment",
      "assessRisk",
      "applyAdjustment",
      "assessBatchRisks",
      "findAtRiskOpportunities",
      "getRiskStatistics",
      "generateMitigationStrategies",
      "calculateRiskLevel",
      "identifyRiskFactors",
      "generateExplanation",
      "generateGuidance"
    ],
    "dependencies": [
      "intelligence/market/integration/models/MarketAwareCareerAnalysis.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/interfaces/MarketProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [],
    "functionNames": [
      "validateConfig",
      "healthCheck",
      "getCapabilities",
      "getStatistics",
      "getReliabilityReport"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [
      "intelligence/market/MarketIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/MarketConfidenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketConfidenceEngine"
    ],
    "functionNames": [
      "createMarketConfidenceEngine",
      "calculateConfidence",
      "calculateTrendConfidence",
      "calculateProfileConfidence",
      "calculateSnapshotConfidence",
      "validateConfidence",
      "getMinimumConfidence",
      "calculateSignalQualityScore",
      "calculateSignalQuantityScore",
      "calculateSourceDiversity",
      "calculateSourceDiversityFromSummary",
      "calculateDataFreshness"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/models/MarketTrend.ts",
      "intelligence/market/models/CareerMarketProfile.ts",
      "intelligence/market/models/MarketSnapshot.ts",
      "intelligence/market/constants/MarketWeights.ts"
    ],
    "consumers": [
      "intelligence/market/CareerMarketProfileEngine.ts",
      "intelligence/market/EmergingCareerEngine.ts",
      "intelligence/market/MarketIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/MarketIntelligenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketIntelligenceEngine"
    ],
    "functionNames": [
      "createMarketIntelligenceEngine",
      "getIntelligence",
      "getIntelligenceForCareers",
      "getMarketProfile",
      "getMarketTrend",
      "getTrendAnalysis",
      "getMarketSnapshot",
      "getComparativeIntelligence",
      "getMarketOutlookSummary",
      "getEmergingCareers",
      "getTopCareersByMetric",
      "getPositiveOutlookCareers"
    ],
    "dependencies": [
      "null>",
      "Promise<MarketTrend \\"
    ],
    "consumers": [
      "null>",
      "Promise<CareerTrendAnalysis \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/MarketSignalEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketSignalEngine"
    ],
    "functionNames": [
      "createMarketSignalEngine",
      "processSignals",
      "processSignal",
      "validateSignal",
      "normalizeSignal",
      "calculateNormalizedStrength",
      "calculateSignalWeight",
      "aggregateSignals",
      "detectOutliers",
      "getPendingSignals",
      "cleanOldSignals"
    ],
    "dependencies": [
      "null>",
      "SignalValidationResult",
      "NormalizedMarketSignal",
      "number"
    ],
    "consumers": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/repositories/MarketRepository.ts",
      "intelligence/market/constants/MarketWeights.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/MarketTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketTrendEngine"
    ],
    "functionNames": [
      "createMarketTrendEngine",
      "analyzeTrend",
      "analyzeCareerTrends",
      "detectTrendChanges",
      "mapSignalToTrendType",
      "calculateDirection",
      "calculateMomentum",
      "calculateStrength",
      "calculateRateOfChange",
      "calculateConfidence",
      "calculateLinearRegression",
      "calculateGrowthRate"
    ],
    "dependencies": [
      "null>",
      "Promise<CareerTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "Promise<TrendChangeDetection>",
      "MarketTrendType",
      "MarketTrendDirection"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/AutomationRiskEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "AutomationRiskEngine"
    ],
    "functionNames": [
      "createAutomationRiskEngine",
      "calculateScore",
      "calculateMetrics",
      "scoreRoutineTasks",
      "scoreAISubstitution",
      "scoreCognitiveTasks",
      "scoreHumanImmunity",
      "applyAdjustments",
      "calculateConfidence",
      "getRiskLevel",
      "getTimelineRisk"
    ],
    "dependencies": [
      "'moderate' \\"
    ],
    "consumers": [
      "'high' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/CareerMarketProfileEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "CareerMarketProfileEngine"
    ],
    "functionNames": [
      "createCareerMarketProfileEngine",
      "generateProfile",
      "generateOpportunityAnalysis",
      "compareProfiles",
      "getScoreBreakdown",
      "validateInput",
      "generateProfileId",
      "calculateOverallConfidence",
      "calculateDataFreshness",
      "calculateGeographicPresence",
      "getTopRegions",
      "determineOutlook"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/profile/models/CareerMarketProfile.ts",
      "intelligence/market/profile/models/OpportunityAnalysis.ts",
      "intelligence/market/profile/models/MarketScoreBreakdown.ts",
      "intelligence/market/profile/DemandScoringEngine.ts",
      "intelligence/market/profile/SalaryScoringEngine.ts",
      "intelligence/market/profile/GrowthScoringEngine.ts",
      "intelligence/market/profile/ScarcityScoringEngine.ts",
      "intelligence/market/profile/AutomationRiskEngine.ts",
      "intelligence/market/profile/FutureResilienceEngine.ts",
      "intelligence/market/profile/OpportunityScoringEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/DemandScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "DemandScoringEngine"
    ],
    "functionNames": [
      "createDemandScoringEngine",
      "calculateScore",
      "Number",
      "calculateMetrics",
      "scoreJobPostings",
      "scoreHiringVelocity",
      "scoreCompetition",
      "scoreGeographicSpread",
      "applyAdjustments",
      "calculateConfidence",
      "calculateConcentration",
      "buildEvidence"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/profile/models/MarketScoreBreakdown.ts",
      "intelligence/market/profile/models/CareerMarketProfile.ts"
    ],
    "consumers": [
      "intelligence/market/profile/CareerMarketProfileEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/FutureResilienceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "FutureResilienceEngine"
    ],
    "functionNames": [
      "createFutureResilienceEngine",
      "calculateScore",
      "calculateMetrics",
      "scoreAdaptability",
      "scoreIndustryResilience",
      "scoreHumanDependency",
      "scoreAIResistance",
      "applyAdjustments",
      "calculateConfidence",
      "getResilienceLevel",
      "getLongevityProjection"
    ],
    "dependencies": [
      "'vulnerable' \\"
    ],
    "consumers": [
      "'stable' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/GrowthScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "GrowthScoringEngine"
    ],
    "functionNames": [
      "createGrowthScoringEngine",
      "calculateScore",
      "calculateMetrics",
      "scoreHiringGrowth",
      "scoreIndustryGrowth",
      "scoreInvestment",
      "scoreStartupActivity",
      "applyAdjustments",
      "calculateConfidence"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/profile/models/MarketScoreBreakdown.ts"
    ],
    "consumers": [
      "intelligence/market/profile/CareerMarketProfileEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/OpportunityScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "OpportunityScoringEngine"
    ],
    "functionNames": [
      "createOpportunityScoringEngine",
      "calculateScore",
      "generateAnalysis",
      "calculateRiskFactor",
      "assessMarketTiming",
      "identifyStrengths",
      "identifyWeaknesses",
      "identifyOpportunities",
      "identifyRisks",
      "analyzeMarketTiming",
      "projectTrajectory",
      "assessCompetitiveLandscape"
    ],
    "dependencies": [
      "intelligence/market/profile/models/MarketScoreBreakdown.ts",
      "intelligence/market/profile/models/CareerMarketProfile.ts",
      "intelligence/market/profile/models/OpportunityAnalysis.ts"
    ],
    "consumers": [
      "intelligence/market/profile/CareerMarketProfileEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/SalaryScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SalaryScoringEngine"
    ],
    "functionNames": [
      "createSalaryScoringEngine",
      "calculateScore",
      "calculateMetrics",
      "scoreGrowth",
      "scoreLevel",
      "scoreRegionalVariation",
      "scoreProgression",
      "applyAdjustments",
      "calculateConfidence",
      "calculateVariation"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/profile/models/MarketScoreBreakdown.ts"
    ],
    "consumers": [
      "intelligence/market/profile/CareerMarketProfileEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/profile/ScarcityScoringEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ScarcityScoringEngine"
    ],
    "functionNames": [
      "createScarcityScoringEngine",
      "calculateScore",
      "calculateMetrics",
      "scoreAvailability",
      "scoreSkillGap",
      "scorePipeline",
      "scoreDifficulty",
      "applyAdjustments",
      "calculateConfidence"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/profile/models/MarketScoreBreakdown.ts"
    ],
    "consumers": [
      "intelligence/market/profile/CareerMarketProfileEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/adapters/SignalAdapter.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SignalAdapter"
    ],
    "functionNames": [
      "createSignalAdapter",
      "adapt",
      "adaptSingle",
      "adaptBatch",
      "validateExtractedSignal",
      "mapCareer",
      "calculateConfidence",
      "normalizeGeography",
      "normalizeStrength",
      "mapSourceToEnum",
      "generateSignalId"
    ],
    "dependencies": [
      "null",
      "ValidationResult",
      "CareerMapping",
      "number"
    ],
    "consumers": [
      "intelligence/market/models/MarketSignal.ts",
      "intelligence/market/providers/reliability/SourceReliabilityEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Global/ILOProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "ILOProvider"
    ],
    "functionNames": [
      "createILOProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Global/WEFProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "WEFProvider"
    ],
    "functionNames": [
      "createWEFProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Government/AICTEProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "AICTEProvider"
    ],
    "functionNames": [
      "createAICTEProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Government/MinistryLaborProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MinistryLaborProvider"
    ],
    "functionNames": [
      "createMinistryLaborProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "getCurrentQuarter",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Government/NCSProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "NCSProvider"
    ],
    "functionNames": [
      "createNCSProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Government/NSDCProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "NSDCProvider"
    ],
    "functionNames": [
      "createNSDCProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Government/UGCProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "UGCProvider"
    ],
    "functionNames": [
      "createUGCProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Industry/NasscomProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "NasscomProvider"
    ],
    "functionNames": [
      "createNasscomProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "getCurrentQuarter",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/Industry/StartupIndiaProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "StartupIndiaProvider"
    ],
    "functionNames": [
      "createStartupIndiaProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/JobMarket/FounditProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "FounditProvider"
    ],
    "functionNames": [
      "createFounditProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/JobMarket/IndeedProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "IndeedProvider"
    ],
    "functionNames": [
      "createIndeedProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/JobMarket/LinkedInProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "LinkedInProvider"
    ],
    "functionNames": [
      "createLinkedInProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/JobMarket/NaukriProvider.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "NaukriProvider"
    ],
    "functionNames": [
      "createNaukriProvider",
      "initialize",
      "fetch",
      "extractSignals",
      "checkHealth",
      "getCapabilities",
      "dispose",
      "updateHealthOnSuccess",
      "updateHealthOnFailure"
    ],
    "dependencies": [
      "intelligence/market/models/MarketSignal.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/providers/reliability/SourceReliabilityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SourceReliabilityEngine"
    ],
    "functionNames": [
      "createSourceReliabilityEngine",
      "getReliability",
      "getSignalTypeReliability",
      "updateReliability",
      "adjustReliability",
      "resetReliability",
      "getReliabilityHistory",
      "getReliabilityTrend",
      "getAllReliabilityScores",
      "getSourcesByMinReliability",
      "getReliabilityReport",
      "getCategoryReliability"
    ],
    "dependencies": [
      "'stable' \\"
    ],
    "consumers": [
      "'declining'",
      "Map<string",
      "number>",
      "string[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/repositories/CareerMarketRepository.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [],
    "functionNames": [
      "getScoreHistory",
      "getSimilarProfiles",
      "getMarketStatistics",
      "getScoreDistribution",
      "getOverallTrends",
      "findProfilesWithSignificantChanges",
      "validateAllProfiles",
      "healthCheck"
    ],
    "dependencies": [
      "intelligence/market/models/CareerMarketProfile.ts"
    ],
    "consumers": [
      "intelligence/market/CareerMarketProfileEngine.ts",
      "intelligence/market/MarketIntelligenceEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/AccelerationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "AccelerationEngine"
    ],
    "functionNames": [
      "createAccelerationEngine",
      "calculateAcceleration",
      "calculateEntityAcceleration",
      "calculateWindowMomentum",
      "normalizeAcceleration",
      "determineLevel",
      "determineDirection",
      "calculateConfidence",
      "detectAccelerationChanges",
      "classifySignificance",
      "compareAcceleration",
      "interpretAcceleration"
    ],
    "dependencies": [
      "null",
      "number",
      "AccelerationResult['level']",
      "AccelerationResult['direction']",
      "Array<"
    ],
    "consumers": [
      "intelligence/market/trends/models/TrendSnapshot.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/CareerTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "CareerTrendEngine"
    ],
    "functionNames": [
      "createCareerTrendEngine",
      "analyzeCareer",
      "analyzeCareers",
      "compareCareers",
      "rankCareers",
      "identifyRisingCareers",
      "identifyDecliningCareers",
      "trackCareerFromProfiles",
      "analyzeMetric",
      "classifyTrend",
      "calculateCompositeScores",
      "determineOverallTrend"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "CareerTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "CareerTrendComparison \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/IndustryTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "IndustryTrendEngine"
    ],
    "functionNames": [
      "createIndustryTrendEngine",
      "analyzeIndustry",
      "analyzeIndustries",
      "compareIndustries",
      "rankIndustries",
      "identifyThrivingIndustries",
      "identifyDistressedIndustries",
      "analyzeMetric",
      "calculateScores",
      "determineOverallTrend",
      "assessHealth",
      "generateInsights"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "IndustryTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "IndustryComparison \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/MarketTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketTrendEngine"
    ],
    "functionNames": [
      "createMarketTrendEngine",
      "avg",
      "addSnapshot",
      "addSnapshots",
      "getSnapshots",
      "analyzeTrend",
      "analyzeTrends",
      "getMarketSummary",
      "compareTrends",
      "getTrendHistory",
      "storeTrendHistory",
      "getEntityIds"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "UnifiedTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "MarketTrendSummary"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/MomentumEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MomentumEngine"
    ],
    "functionNames": [
      "createMomentumEngine",
      "calculateMomentum",
      "calculateFromAvailable",
      "calculateEntityMomentum",
      "calculateMomentumTrend",
      "compareMomentum",
      "rankByMomentum",
      "calculateConsistency",
      "calculateRecentMomentum",
      "calculateSustainedMomentum",
      "determineTrajectory",
      "findPeakMomentum"
    ],
    "dependencies": [
      "null",
      "MomentumTrend \\"
    ],
    "consumers": [
      "null",
      "Array<",
      "number",
      "EnhancedMomentum['trajectory']"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/RegionTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "RegionTrendEngine"
    ],
    "functionNames": [
      "createRegionTrendEngine",
      "analyzeRegion",
      "analyzeRegions",
      "compareRegions",
      "rankRegions",
      "identifyAttractiveRegions",
      "identifyEmergingRegions",
      "analyzeMetric",
      "calculateScores",
      "determineOverallTrend",
      "assessAttractiveness",
      "generateInsights"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "RegionTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "RegionComparison \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/SkillTrendEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SkillTrendEngine"
    ],
    "functionNames": [
      "createSkillTrendEngine",
      "analyzeSkill",
      "analyzeSkills",
      "compareSkills",
      "identifyEmergingSkills",
      "identifyDecliningSkills",
      "rankByDemand",
      "createEmergingAnalysis",
      "analyzeDemand",
      "analyzeScarcity",
      "assessFutureRelevance",
      "calculateFutureRelevanceScore"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "SkillTrendAnalysis \\"
    ],
    "consumers": [
      "null>",
      "SkillTrendComparison \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/TrendDetectionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "TrendDetectionEngine"
    ],
    "functionNames": [
      "createTrendDetectionEngine",
      "detectTrend",
      "detectEntityTrend",
      "detectTrends",
      "createEmergingResult",
      "calculateVolatility",
      "calculateStrength",
      "determineDirection",
      "calculateConfidence",
      "generateExplanation",
      "detectTrendChanges",
      "classifySignificance"
    ],
    "dependencies": [
      "null",
      "Map<string",
      "TrendDetectionResult \\"
    ],
    "consumers": [
      "null>",
      "number",
      "'up' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/market/trends/TrendPersistenceEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "TrendPersistenceEngine"
    ],
    "functionNames": [
      "createTrendPersistenceEngine",
      "calculatePersistence",
      "calculateEntityPersistence",
      "createTemporaryResult",
      "calculateConsistency",
      "calculateBaseScore",
      "identifySupportingFactors",
      "identifyUnderminingFactors",
      "determineLevel",
      "calculateConfidence",
      "comparePersistence",
      "assessDurabilityOverTime"
    ],
    "dependencies": [
      "null",
      "number",
      "string[]",
      "PersistenceResult['level']",
      "Array<"
    ],
    "consumers": [
      "intelligence/market/trends/models/TrendSnapshot.ts",
      "intelligence/market/trends/models/TrendClassification.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/matching-engine/MatchingEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [],
    "functionNames": [
      "calculatePsychologicalFit",
      "calculateWorkStyleFit",
      "calculateMotivationFit",
      "calculateConstraintFit",
      "matchCareer",
      "matchAllCareers",
      "generateReasoning",
      "generateInsights",
      "generatePsychSummary",
      "generateWorkStyleSummary",
      "generateMotivationSummary",
      "generateConstraintSummary"
    ],
    "dependencies": [
      "domains/career/Career.ts",
      "domains/student/StudentProfile.ts"
    ],
    "consumers": [
      "intelligence/explainability-engine/ExplainabilityEngine.ts",
      "intelligence/optionality-engine/OptionalityEngineV1.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/maut-foundation/MAUTFoundationV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "MAUTFoundationV1"
    ],
    "functionNames": [
      "validateUtilityProfile",
      "normalizeUtilityWeights",
      "checkUtilityConsistency",
      "calculateUtilityScore",
      "generateUtilityExplanation",
      "compareUtilityScores",
      "generateAdvantageDescription",
      "identifyKeyDifferentiators",
      "createDefaultUtilityProfile",
      "createUtilityProfile",
      "createCareerPathUtilityData",
      "createMAUTFoundation"
    ],
    "dependencies": [
      "../../domains/career/Career.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/mentor/MentorEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "MentorEngine"
    ],
    "functionNames": [
      "createMentorEngine",
      "getMentorGuidance",
      "processInteraction",
      "initializeContext",
      "analyzeInput",
      "determineResponseStrategy",
      "generateResponse",
      "generateEmotionalAcknowledgment",
      "generateMainContent",
      "generateExplorationContent",
      "generateGuidanceContent",
      "generateEncouragementContent"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/student-model/StudentBelief.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/CommitmentReadinessEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "CommitmentReadinessEngine"
    ],
    "functionNames": [
      "createCommitmentReadinessEngine",
      "analyze",
      "calculateReadinessScore",
      "isCommitmentAppropriate",
      "calculateConfidence",
      "getSupportingFactors",
      "getOpposingFactors",
      "assessRisks",
      "getPrerequisites",
      "generateExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/DecisionFragilityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionFragilityEngine"
    ],
    "functionNames": [
      "createDecisionFragilityEngine",
      "analyze",
      "calculateInformationSensitivity",
      "calculateValueSensitivity",
      "calculateMarketSensitivity",
      "calculateFragilityScore",
      "determineFragilityLevel",
      "identifyKeyUncertainties",
      "generateExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/DecisionQualityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionQualityEngine"
    ],
    "functionNames": [
      "createDecisionQualityEngine",
      "analyze",
      "evaluateInformationQuality",
      "evaluateReasoningQuality",
      "evaluateEvidenceQuality",
      "evaluateBiasInfluence",
      "analyzeInformationQuality",
      "analyzeReasoningQuality",
      "analyzeEvidenceQuality",
      "calculateOverallQuality",
      "determineQualityLevel",
      "generateExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/DecisionReadinessEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionReadinessEngine"
    ],
    "functionNames": [
      "createDecisionReadinessEngine",
      "analyze",
      "evaluateStudentUnderstanding",
      "evaluateIdentityStability",
      "evaluateValueStability",
      "evaluateUtilityConfidence",
      "evaluateInformationCompleteness",
      "evaluateMarketConfidence",
      "evaluateFutureSimulationConfidence",
      "calculateReadinessScore",
      "determineDecisionState",
      "calculateConfidence"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/DecisionRobustnessEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionRobustnessEngine"
    ],
    "functionNames": [
      "createDecisionRobustnessEngine",
      "analyze",
      "generateScenarios",
      "analyzeScenarios",
      "scenarioHolds",
      "calculateScenarioConfidence",
      "calculateCrossScenarioStability",
      "runStressTests",
      "calculateRobustnessScore",
      "determineRobustnessLevel",
      "generateExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/DecisionTimingEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "DecisionTimingEngine"
    ],
    "functionNames": [
      "createDecisionTimingEngine",
      "analyze",
      "calculateUrgency",
      "calculateDelayCost",
      "calculateDecideNowCost",
      "determineRecommendation",
      "calculateConfidence",
      "getSupportingFactors",
      "calculateTimeline",
      "generateExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/MetaDecisionEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "MetaDecisionEngine"
    ],
    "functionNames": [
      "createMetaDecisionEngine",
      "analyzeDecisionQuality",
      "analyze",
      "analyzeLegacy",
      "determineRecommendedAction",
      "generateSteps",
      "calculateOverallConfidence",
      "shouldDecideNow",
      "shouldDelay",
      "shouldGatherInformation",
      "shouldExploreAlternatives",
      "isCommitmentAppropriate"
    ],
    "dependencies": [
      "intelligence/meta-decision-engine/DecisionReadinessEngine.ts",
      "intelligence/meta-decision-engine/DecisionQualityEngine.ts",
      "intelligence/meta-decision-engine/DecisionTimingEngine.ts",
      "intelligence/meta-decision-engine/CommitmentReadinessEngine.ts",
      "intelligence/meta-decision-engine/DecisionFragilityEngine.ts",
      "intelligence/meta-decision-engine/DecisionRobustnessEngine.ts",
      "intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts",
      "intelligence/decision/IDecisionAuthority.ts",
      "intelligence/decision/DecisionAuthority.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/meta-decision-engine/MetaDecisionNarrativeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Decision intelligence, comparison, ranking, arbitration, selection, or decision support over options.",
    "classNames": [
      "MetaDecisionNarrativeEngine"
    ],
    "functionNames": [
      "createMetaDecisionNarrativeEngine",
      "generateNarrative",
      "generateSummary",
      "generateQualityExplanation",
      "generateReadinessExplanation",
      "generateRecommendationExplanation",
      "generateStateNarrative",
      "generateQualityNarrative",
      "generateTimingNarrative"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/meta-decision-engine/MetaDecisionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/opportunity-graph/education-graph.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [],
    "functionNames": [
      "createSchoolStreamNodes",
      "createExamNodes",
      "createCollegeTypeNodes",
      "createDegreeNodes",
      "createEducationEdges",
      "buildEducationGraph",
      "getEducationStats"
    ],
    "dependencies": [
      "intelligence/opportunity-graph/opportunity-node-types.ts",
      "intelligence/opportunity-graph/graph-builder.ts"
    ],
    "consumers": [
      "intelligence/opportunity-graph/opportunity-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/opportunity-graph/graph-builder.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "GraphBuilder"
    ],
    "functionNames": [
      "createGraphBuilder",
      "mergeGraphs",
      "dfs",
      "buildGraph",
      "addNode",
      "addNodes",
      "addEdge",
      "addEdges",
      "getNode",
      "getEdgesFrom",
      "getEdgesTo",
      "getEdgesBetween"
    ],
    "dependencies": [
      "undefined",
      "OpportunityEdge[]",
      "OpportunityNode[]"
    ],
    "consumers": [
      "intelligence/opportunity-graph/opportunity-node-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/opportunity-graph/opportunity-graph-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "OpportunityGraphEngine"
    ],
    "functionNames": [
      "createOpportunityGraphEngine",
      "queryOpportunityGraph",
      "simulateDecision",
      "analyzeOptionality",
      "analyzeCriticality",
      "query",
      "getMentorExplanation",
      "getNode",
      "getConnectedNodes",
      "getStats",
      "compareDifficulty",
      "difficultyToScore"
    ],
    "dependencies": [
      "intelligence/opportunity-graph/opportunity-node-types.ts",
      "intelligence/opportunity-graph/graph-builder.ts",
      "intelligence/opportunity-graph/pathway-engine.ts",
      "intelligence/opportunity-graph/transition-engine.ts",
      "intelligence/opportunity-graph/education-graph.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/opportunity-graph/pathway-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathwayEngine"
    ],
    "functionNames": [
      "createPathwayEngine",
      "generatePathway",
      "findAllPathways",
      "findShortestPath",
      "dfs",
      "generateAllPathways",
      "findPathsByOptionality",
      "analyzeOptionality",
      "findPivotOpportunities",
      "getDuration",
      "getRequirements",
      "getAlternatives"
    ],
    "dependencies": [
      "null",
      "OptionalityAnalysis",
      "string[]"
    ],
    "consumers": [
      "intelligence/opportunity-graph/opportunity-node-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/opportunity-graph/transition-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "TransitionEngine"
    ],
    "functionNames": [
      "createTransitionEngine",
      "analyzeTransition",
      "findPossibleTransitions",
      "findPivotOpportunities",
      "getTransitionDifficulty",
      "calculateTransitionDifficulty",
      "calculateTransitionProbability",
      "identifyRequiredSkills",
      "identifySkillsToAcquire",
      "estimateTransitionTime",
      "estimateTransitionCost",
      "identifyChallenges"
    ],
    "dependencies": [
      "intelligence/opportunity-graph/opportunity-node-types.ts"
    ],
    "consumers": [
      "intelligence/opportunity-graph/opportunity-graph-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/optionality-engine/OptionalityEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionalityEngineV1"
    ],
    "functionNames": [
      "calculateOptionality",
      "calculateBatchOptionality",
      "compareCareerOptionality",
      "calculateBatch",
      "compareOptionality",
      "calculateCareerFlexibility",
      "calculateTransferableSkills",
      "calculatePivotPotential",
      "calculateEntrepreneurshipPotential",
      "calculateFutureCareerOptions",
      "calculateAdjacentCareers",
      "identifySkillCategories"
    ],
    "dependencies": [
      "domains/career/Career.ts",
      "intelligence/matching-engine/MatchingEngineV1.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/pareto-frontier-engine/ParetoFrontierEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ParetoFrontierEngineV1"
    ],
    "functionNames": [
      "isDominated",
      "computeParetoFrontier",
      "analyzeTradeoffs",
      "generateTradeoffSummary",
      "generatePreferenceReasons",
      "generateFrontierDescription",
      "classifyLifeStrategy",
      "generateFrontierExplanations",
      "generateFrontierGuidance",
      "analyzeParetoFrontier",
      "createParetoFrontierEngine",
      "analyze"
    ],
    "dependencies": [
      "../maut-foundation/MAUTFoundationV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/path-cascade/CareerGraph.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "CareerGraph"
    ],
    "functionNames": [
      "createIndiaCareerGraph",
      "dfs",
      "addNode",
      "addEdge",
      "getNode",
      "getEdge",
      "getOutgoingEdges",
      "getAllNodes",
      "getAllEdges",
      "findAllPaths",
      "calculateCriticality",
      "calculateOptionality"
    ],
    "dependencies": [
      "undefined",
      "CareerEdge \\"
    ],
    "consumers": [
      "undefined",
      "CareerEdge[]",
      "CareerNode[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/path-cascade/PathCascadeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathCascadeEngine"
    ],
    "functionNames": [
      "createPathCascadeEngine",
      "analyzeCareerPaths",
      "analyzePaths",
      "generateExplanations",
      "explainCriticality",
      "explainOptionality",
      "comparePaths",
      "getDebugLog",
      "getUniqueNodes",
      "generateSummary",
      "calculateStatistics",
      "debug"
    ],
    "dependencies": [
      "intelligence/path-cascade/CareerGraph.ts",
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/recommendation-engine/RecommendationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/path-explorer/CareerPathExplorerV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "CareerPathExplorerV1"
    ],
    "functionNames": [
      "exploreCareerPaths",
      "exploreSinglePath",
      "explorePaths",
      "comparePaths",
      "generatePrimaryPath",
      "generateHighGrowthPath",
      "generateHighOptionalityPath",
      "generateLowRiskPath",
      "generateBalancedPath",
      "enrichPath",
      "calculatePathMetrics",
      "calculatePathScores"
    ],
    "dependencies": [
      "null",
      "PathComparison",
      "ExploredCareerPath",
      "PathMetrics",
      "PathScores"
    ],
    "consumers": [
      "intelligence/career-transition-graph/index.ts",
      "intelligence/criticality-engine/index.ts",
      "intelligence/optionality-engine/index.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/CommitmentCostEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CommitmentCostEngine"
    ],
    "functionNames": [
      "createCommitmentCostEngine",
      "calculate",
      "calculateYearsInvested",
      "calculateMoneyInvested",
      "calculateSpecializationIntensity",
      "calculateSwitchingDifficulty",
      "calculateLockInEffects",
      "calculateTotalCost",
      "determineCommitmentLevel",
      "generateExplanation"
    ],
    "dependencies": [
      "intelligence/criticality-engine/index.ts",
      "intelligence/optionality-engine/index.ts"
    ],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/FlexibilityCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "FlexibilityCalculator"
    ],
    "functionNames": [
      "createFlexibilityCalculator",
      "calculate",
      "calculatePivotingEase",
      "calculateTransferableSkills",
      "calculateCareerMobility",
      "calculateTimeToFlexibility",
      "calculateTotalFlexibility",
      "generateExplanation",
      "inferDomain"
    ],
    "dependencies": [
      "intelligence/optionality-engine/index.ts",
      "intelligence/career-graph-v2/index.ts"
    ],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/FutureOpportunityCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "FutureOpportunityCalculator"
    ],
    "functionNames": [
      "createFutureOpportunityCalculator",
      "calculate",
      "calculateFuturePathways",
      "calculateEmergingOpportunities",
      "calculateMarketAdaptability",
      "calculateTechnologyExposure",
      "calculateTotalOpportunity",
      "estimateAutomationResilience",
      "estimateOutsourcingResilience",
      "calculateCrossIndustryPortability",
      "generateExplanation"
    ],
    "dependencies": [
      "intelligence/future-explorer/index.ts",
      "intelligence/career-graph-v2/index.ts"
    ],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/OptionNarrativeEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionNarrativeEngine"
    ],
    "functionNames": [
      "createOptionNarrativeEngine",
      "generate",
      "generateSummary",
      "generateOptionValueExplanation",
      "generateCommitmentCostExplanation",
      "generateTradeOffExplanation",
      "generateRecommendationExplanation",
      "getOptionValueRating",
      "getCommitmentLevel"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/OptionValueCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionValueCalculator"
    ],
    "functionNames": [
      "createOptionValueCalculator",
      "calculate",
      "calculateReachableFutures",
      "calculateFutureQuality",
      "calculateUtilityPotential",
      "calculateMarketOpportunities",
      "calculateTotalValue",
      "generateExplanation",
      "estimateUtilityPotential",
      "inferIndustry",
      "identifyEmergingFields"
    ],
    "dependencies": [
      "intelligence/career-graph-v2/index.ts",
      "intelligence/future-explorer/index.ts"
    ],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/RealOptionsEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RealOptionsEngine"
    ],
    "functionNames": [
      "createRealOptionsEngine",
      "analyzeCareerOptions",
      "compareCareerOptions",
      "analyze",
      "compare",
      "calculateCareerOption",
      "calculateComponents",
      "generateRecommendations",
      "calculateConfidence",
      "analyzeTradeOffs",
      "generateOverallRecommendation",
      "generateComparisonExplanation"
    ],
    "dependencies": [
      "intelligence/real-options-engine/OptionValueCalculator.ts",
      "intelligence/real-options-engine/FlexibilityCalculator.ts",
      "intelligence/real-options-engine/ReversibilityCalculator.ts",
      "intelligence/real-options-engine/FutureOpportunityCalculator.ts",
      "intelligence/real-options-engine/CommitmentCostEngine.ts",
      "intelligence/real-options-engine/OptionNarrativeEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/real-options-engine/ReversibilityCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ReversibilityCalculator"
    ],
    "functionNames": [
      "createReversibilityCalculator",
      "calculate",
      "calculateTimeCost",
      "calculateEducationLockIn",
      "calculateCredentialLockIn",
      "calculateSunkCost",
      "calculateSwitchingDifficulty",
      "calculateTotalReversibility",
      "generateExplanation"
    ],
    "dependencies": [
      "intelligence/criticality-engine/index.ts",
      "intelligence/career-graph-v2/index.ts"
    ],
    "consumers": [
      "intelligence/real-options-engine/RealOptionsEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-engine/RecommendationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationEngine"
    ],
    "functionNames": [
      "createRecommendationEngine",
      "generateRecommendations",
      "scorePaths",
      "calculateBaseScore",
      "filterPaths",
      "createRecommendation",
      "generateReasoning",
      "generateConcerns",
      "generateNextSteps",
      "generateSummary",
      "calculatePathConfidence",
      "calculateBaseConfidence"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/path-cascade/CareerGraph.ts",
      "intelligence/student-model/StudentBelief.ts",
      "intelligence/path-cascade/PathCascadeEngine.ts",
      "intelligence/regret-engine/RegretEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-feedback-loop/measurements.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [],
    "functionNames": [
      "measurePathChoiceAccuracy",
      "measureSatisfactionAccuracy",
      "extractPredictedSatisfaction",
      "extractActualSatisfaction",
      "measureUtilityAccuracy",
      "calculateActualUtility",
      "measureRegretAccuracy",
      "extractPredictedRegret",
      "extractActualRegret",
      "measureConfidenceCalibration",
      "calculateCalibrationMetrics",
      "calculateTypeAccuracyMetrics"
    ],
    "dependencies": [
      "undefined",
      "number",
      "ConfidenceCalibration",
      "CalibrationMetrics",
      "TypeAccuracyMetrics"
    ],
    "consumers": [
      "../types/index.js",
      "../outcome-tracking-engine/OutcomeTrackingEngineV1.js",
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-feedback-loop/RecommendationFeedbackEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationFeedbackEngine"
    ],
    "functionNames": [
      "createRecommendationFeedbackEngine",
      "quickAnalyze",
      "calculateSimpleAccuracy",
      "getConfig",
      "updateConfig",
      "analyze",
      "analyzeSingle",
      "getAggregateMetrics",
      "matchRecommendationsToOutcomes",
      "createPair",
      "analyzePairs",
      "analyzePair"
    ],
    "dependencies": [
      "../types/index.js",
      "../outcome-tracking-engine/OutcomeTrackingEngineV1.js",
      "./types.js",
      "./measurements.js",
      "./signals.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-feedback-loop/signals.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [],
    "functionNames": [
      "generateLearningSignals",
      "detectSystematicBias",
      "detectConfidenceIssues",
      "detectSegmentIssues",
      "detectPathMisalignment",
      "detectUtilityErrorPattern",
      "detectRegretErrorPattern",
      "generateImprovementSignals",
      "generatePathRankingSignal",
      "generateConfidenceScoringSignal",
      "generateUtilityPredictionSignal",
      "generateRegretPredictionSignal"
    ],
    "dependencies": [
      "null",
      "RecommendationImprovementSignal[]",
      "RecommendationImprovementSignal \\"
    ],
    "consumers": [
      "null",
      "number"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/career-weight-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "CareerWeightEngine"
    ],
    "functionNames": [
      "calculateWeight",
      "calculateBatchWeights",
      "compareCareers",
      "calculateOpportunityWeight",
      "calculateOptionalityWeight",
      "calculateIrreversibilityWeight",
      "calculateDemandWeight",
      "calculateGraphWeight",
      "assessDataQuality",
      "assessMarketRecency",
      "calculateBalance",
      "getReversibilityLabel"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/confidence-fusion-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "ConfidenceFusionEngine"
    ],
    "functionNames": [
      "calculateConfidence",
      "calculateBatchConfidence",
      "assessCalibration",
      "calculateEvidenceQuality",
      "calculateEngineAgreement",
      "calculateHistoricalValidation",
      "calculateUncertainty",
      "calibrateConfidence",
      "identifyUncertaintySources",
      "getConfidenceLevel",
      "getAgreementLevel",
      "getConfig"
    ],
    "dependencies": [
      "'medium' \\"
    ],
    "consumers": [
      "'low'"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/contradiction-weight-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "ContradictionWeightEngine"
    ],
    "functionNames": [
      "calculateWeight",
      "resolveContradictions",
      "checkCompatibility",
      "detectValueConflicts",
      "detectGoalConflicts",
      "detectIdentityConflicts",
      "calculateFamilyPressure",
      "calculateAdjustmentFactor",
      "calculateConflictPenalty",
      "getSeverityAdjustment",
      "resolveValueConflict",
      "resolveGoalConflict"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/fusion-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "FusionExplanationEngine"
    ],
    "functionNames": [
      "generateExplanation",
      "generateComparisonExplanation",
      "generateShortExplanation",
      "generateSummary",
      "generateDetailedExplanation",
      "generateKeyPoints",
      "generatePsychologyExplanation",
      "generateCareerExplanation",
      "generateMentorExplanation",
      "generateLearningExplanation",
      "generateRiskExplanation",
      "generateOpportunityCostExplanation"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/learning-weight-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "LearningWeightEngine"
    ],
    "functionNames": [
      "calculateWeight",
      "calculateBatchWeights",
      "getEvidenceInsights",
      "calculatePopulationWeight",
      "calculateSuccessWeight",
      "calculateFailureWeight",
      "calculateEffectivenessWeight",
      "assessSampleSize",
      "assessOutcomeRecency",
      "assessSignificance",
      "calculateConfidenceFromSample",
      "generateReasoning"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/mentor-weight-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "MentorWeightEngine"
    ],
    "functionNames": [
      "calculateWeight",
      "calculateBatchWeights",
      "extractInsights",
      "calculatePatternWeight",
      "calculateMistakesWeight",
      "calculateThemesWeight",
      "calculateDecisionQuality",
      "assessPatternConfidence",
      "assessThemeConsistency",
      "generateReasoning",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/psychology-weight-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "PsychologyWeightEngine"
    ],
    "functionNames": [
      "calculateWeight",
      "calculateBatchWeights",
      "compareCareers",
      "calculateInterestWeight",
      "calculateStrengthWeight",
      "calculateMotivationWeight",
      "calculateValueWeight",
      "calculatePersonalityWeight",
      "calculateEmotionalWeight",
      "assessDataQuality",
      "assessRecency",
      "assessCompleteness"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/recommendation-fusion-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationFusionEngine"
    ],
    "functionNames": [
      "generateReport",
      "explainRecommendation",
      "compareRecommendations",
      "explainExclusion",
      "getConfig",
      "updateConfig",
      "calculateWeights",
      "processContradictions",
      "fuseRecommendations",
      "calculateConfidences",
      "rankRecommendations",
      "generateExplanations"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts",
      "intelligence/recommendation-fusion/psychology-weight-engine.ts",
      "intelligence/recommendation-fusion/career-weight-engine.ts",
      "intelligence/recommendation-fusion/mentor-weight-engine.ts",
      "intelligence/recommendation-fusion/learning-weight-engine.ts",
      "intelligence/recommendation-fusion/contradiction-weight-engine.ts",
      "intelligence/recommendation-fusion/confidence-fusion-engine.ts",
      "intelligence/recommendation-fusion/recommendation-ranking-engine.ts",
      "intelligence/recommendation-fusion/fusion-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-fusion/recommendation-ranking-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationRankingEngine"
    ],
    "functionNames": [
      "rankRecommendations",
      "reRankWithFeedback",
      "getRankingHistory",
      "calculateFinalScore",
      "calculateRiskPenalty",
      "applyDiversity",
      "buildFusedRecommendation",
      "getEngineContribution",
      "extractKeyFactors",
      "generateExplanation",
      "calculateQuality",
      "calculateStability"
    ],
    "dependencies": [
      "intelligence/recommendation-fusion/fusion-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-fusion/recommendation-fusion-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/confidence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "ConfidenceEngine"
    ],
    "functionNames": [
      "createConfidenceEngine",
      "calculateQuickConfidence",
      "analyzeConfidenceComponents",
      "isConfidenceActionable",
      "calculateConfidence",
      "calculateComponents",
      "calculateRecommendationConsistency",
      "calculateProfileCoherence",
      "calculateContradictionSeverity",
      "calculateCompleteness",
      "calculateUncertaintyLevel",
      "calculateConsensusStrength"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/perturbation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "SeededRandom",
      "PerturbationEngine"
    ],
    "functionNames": [
      "createPerturbationEngine",
      "perturbDimensionScore",
      "next",
      "nextGaussian",
      "nextInRange",
      "generatePerturbations",
      "generateSinglePerturbation",
      "calculateDimensionUncertainties",
      "calculateRanks",
      "correctRankOrder",
      "isCognitiveDimension",
      "isMotivationDimension"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/recommendation-consensus-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationConsensusEngine"
    ],
    "functionNames": [
      "createConsensusEngine",
      "calculateQuickConsensus",
      "analyzeConsensusStability",
      "calculateConsensus",
      "aggregateCareerStats",
      "calculateFrequencies",
      "calculateRankDistributions",
      "buildTopRecommendationsByRank",
      "calculateEntropy",
      "calculateRankEntropy",
      "normalizeEntropy",
      "calculateGini"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/recommendation-stability-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationStabilityEngine"
    ],
    "functionNames": [
      "createRecommendationStabilityEngine",
      "analyzeStability",
      "isRecommendationStable",
      "analyze",
      "generateAllRecommendations",
      "createEmptyRecommendationSet",
      "generateAnalysisId",
      "createMentorContext",
      "generateStabilityMention",
      "generateConfidenceMention",
      "generateUncertaintyMention",
      "generateSuggestedAdaptations"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "recommendation/recommendation-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts",
      "intelligence/recommendation-stability/perturbation-engine.ts",
      "intelligence/recommendation-stability/recommendation-consensus-engine.ts",
      "intelligence/recommendation-stability/confidence-engine.ts",
      "intelligence/recommendation-stability/stability-engine.ts",
      "intelligence/recommendation-stability/volatility-engine.ts",
      "intelligence/recommendation-stability/sensitivity-analysis-engine.ts",
      "intelligence/recommendation-stability/uncertainty-engine.ts",
      "intelligence/recommendation-stability/student-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/sensitivity-analysis-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "SensitivityAnalysisEngine"
    ],
    "functionNames": [
      "createSensitivityAnalysisEngine",
      "analyzeQuickSensitivity",
      "isProfileHighlySensitive",
      "analyzeSensitivity",
      "extractCareerPositions",
      "calculateCorrelations",
      "calculateFeatureImportance",
      "calculateInfluenceDirection",
      "calculateInfluenceStability",
      "calculateSensitivityWeights",
      "calculatePearsonCorrelation",
      "calculateDimensionImpacts"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "recommendation/recommendation-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/stability-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "StabilityEngine"
    ],
    "functionNames": [
      "createStabilityEngine",
      "measureQuickStability",
      "calculateStabilityMetrics",
      "measureStability",
      "calculateCompositeStabilityScore",
      "classifyStabilityBand",
      "generateStabilityForecast",
      "calculatePercentileRank",
      "generateExplanation",
      "compareStability",
      "isStabilitySufficient",
      "calculateStabilityTrend"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/student-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "StudentExplanationEngine"
    ],
    "functionNames": [
      "createStudentExplanationEngine",
      "generateQuickExplanation",
      "generateStabilitySummary",
      "generateExplanation",
      "generateStabilityExplanation",
      "generateConfidenceExplanation",
      "generateUncertaintyExplanation",
      "generateVolatilityExplanation",
      "generateConsensusExplanation",
      "generateIntegratedNarrative",
      "generateKeyTakeaways",
      "determineTone"
    ],
    "dependencies": [
      "'CAUTIOUS' \\"
    ],
    "consumers": [
      "'ENCOURAGING' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/uncertainty-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "UncertaintyEngine"
    ],
    "functionNames": [
      "createUncertaintyEngine",
      "calculateQuickUncertainty",
      "getTopUncertaintySources",
      "calculateUncertainty",
      "calculateContributions",
      "calculateSparseDataContribution",
      "calculateContradictionContribution",
      "calculateWeakSignalsContribution",
      "calculateCompetitionContribution",
      "calculateAmbiguityContribution",
      "calculateLowConsensusContribution",
      "calculateMeasurementContribution"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/recommendation-stability/volatility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "VolatilityEngine"
    ],
    "functionNames": [
      "createVolatilityEngine",
      "measureQuickVolatility",
      "isVolatilityAcceptable",
      "measureVolatility",
      "aggregateCareerData",
      "calculateVolatilityMetrics",
      "calculateRankVolatility",
      "calculateScoreVolatility",
      "calculateCareerVolatility",
      "calculateRecommendationDrift",
      "calculateCompositeVolatility",
      "identifyUnstableClusters"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "intelligence/recommendation-stability/recommendation-stability-types.ts"
    ],
    "consumers": [
      "intelligence/recommendation-stability/recommendation-stability-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-engine/RegretEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretEngine"
    ],
    "functionNames": [
      "createRegretEngine",
      "analyzePath",
      "analyzeMissedOpportunities",
      "analyzeValueConflicts",
      "analyzeUnrealizedPotential",
      "analyzeLifestyleMismatch",
      "analyzeStagnationRisk",
      "analyzeFinancialRegrets",
      "generateMitigations",
      "compareToAlternatives",
      "calculateOverallRegretRisk",
      "calculateRiskByCategory"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/student-model/StudentBelief.ts"
    ],
    "consumers": [
      "intelligence/recommendation-engine/RecommendationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-functional/RegretFunctionalV2.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretFunctionalV2"
    ],
    "functionNames": [
      "analyzeRegret",
      "analyze",
      "analyzePathRegret",
      "calculateActionRegret",
      "calculateInactionRegret",
      "calculateOptionalityLossRegret",
      "calculateIdentityRegret",
      "calculateEconomicRegret",
      "calculateCoalitionRegret",
      "calculatePathInterestMatch",
      "calculatePathValueAlignment",
      "calculateProfileFit"
    ],
    "dependencies": [
      "../student-model",
      "intelligence/path-explorer/index.ts",
      "intelligence/decision-coalition-v3/index.ts",
      "intelligence/criticality-engine/index.ts",
      "intelligence/optionality-engine/index.ts",
      "intelligence/career-transition-graph/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/approval-driven-regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ApprovalDrivenRegretEngine"
    ],
    "functionNames": [
      "createApprovalDrivenRegretEngine",
      "analyzeApprovalDrivenRegret",
      "identifyApprovalSources",
      "matchApprovalPattern",
      "assessFamilyExpectationInfluence",
      "assessSocialPressureInfluence",
      "assessApprovalInfluence",
      "isHighPrestigePath",
      "calculateExternalInfluenceScore",
      "calculateAuthenticityGap",
      "determineSeverity",
      "generateEvidence"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/exploration-regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ExplorationRegretEngine"
    ],
    "functionNames": [
      "createExplorationRegretEngine",
      "analyzeExplorationRegret",
      "identifyUnexploredPaths",
      "inferPathTypes",
      "calculateInterestAlignment",
      "getPathTypeDescription",
      "calculateExplorationGap",
      "findStrongestSuppressedInterest",
      "determineSeverity",
      "generateEvidence",
      "generateExplanation",
      "generatePreventionStrategies"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/fear-driven-regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "FearDrivenRegretEngine"
    ],
    "functionNames": [
      "createFearDrivenRegretEngine",
      "analyzeFearDrivenRegret",
      "identifyFearFactors",
      "matchFearPattern",
      "assessFearIntensity",
      "assessDecisionImpact",
      "calculateFearInfluenceScore",
      "determineSeverity",
      "generateEvidence",
      "generateExplanation",
      "generateMitigationStrategies",
      "quickFearCheck"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/identity-regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "IdentityRegretEngine"
    ],
    "functionNames": [
      "createIdentityRegretEngine",
      "analyzeIdentityRegret",
      "assessIdentityExpressions",
      "calculateExpression",
      "calculateRequiredExpression",
      "identifySuppressedIdentities",
      "calculateIdentityAlignment",
      "determineSeverity",
      "generateEvidence",
      "generateExplanation",
      "generateRecoveryPath",
      "quickIdentityCheck"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/opportunity-regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OpportunityRegretEngine"
    ],
    "functionNames": [
      "createOpportunityRegretEngine",
      "analyzeOpportunityRegret",
      "identifyOpportunitiesForegone",
      "calculateAlternativeValue",
      "classifyOpportunityType",
      "assessRecoverability",
      "determineTimeWindow",
      "matchesInterestPattern",
      "opportunityAddressed",
      "calculateInterestAlignment",
      "calculateOpportunityCostScore",
      "determineSeverity"
    ],
    "dependencies": [
      "'MODERATE' \\"
    ],
    "consumers": [
      "'DIFFICULT' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/regret-forecast-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "RegretForecastEngine"
    ],
    "functionNames": [
      "createRegretForecastEngine",
      "generateRegretForecast",
      "generateForecast",
      "forecastForHorizon",
      "calculateCategoryScores",
      "getHorizonMultiplier",
      "calculateCategoryScore",
      "calculatePurposeScore",
      "calculateGrowthScore",
      "findDominantCategory",
      "calculateRegretProbability",
      "calculateRegretSeverity"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/regret-prediction-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretPredictionEngine"
    ],
    "functionNames": [
      "createRegretPredictionEngine",
      "predictRegret",
      "compareRegretOptions",
      "quickRegretCheck",
      "generateRegretAssessments",
      "calculateOverallRegretRisk",
      "calculateOverallRegretProbability",
      "findHighestRiskRegret",
      "calculateConfidence",
      "generateExplanation",
      "generateOptionInsight",
      "generateComparisonRecommendation"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts",
      "intelligence/regret-prediction/exploration-regret-engine.ts",
      "intelligence/regret-prediction/identity-regret-engine.ts",
      "intelligence/regret-prediction/opportunity-regret-engine.ts",
      "intelligence/regret-prediction/fear-driven-regret-engine.ts",
      "intelligence/regret-prediction/approval-driven-regret-engine.ts",
      "intelligence/regret-prediction/regret-forecast-engine.ts"
    ],
    "consumers": [
      "intelligence/regret-prediction/regret-report-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/regret-prediction/regret-report-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretReportEngine"
    ],
    "functionNames": [
      "createRegretReportEngine",
      "generateRegretReport",
      "generateQuickRegretReport",
      "generateReport",
      "generateSummary",
      "generateInsights",
      "generateStudentReflection",
      "generateMentorFraming",
      "generateMentorReflection",
      "generatePreventionStrategies",
      "generateExplorationOpportunities",
      "generateAuthenticityRecommendations"
    ],
    "dependencies": [
      "intelligence/regret-prediction/regret-types.ts",
      "intelligence/regret-prediction/regret-prediction-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/similarity-engine/CareerSimilarityEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career fit, matching, or career similarity scoring.",
    "classNames": [
      "CareerSimilarityEngine"
    ],
    "functionNames": [
      "createSimilarityEngine",
      "quickSimilarity",
      "validateWeights",
      "calculateSimilarity",
      "calculateSkillOverlap",
      "calculatePsychologyOverlap",
      "calculateWorkStyleOverlap",
      "calculateEducationOverlap",
      "calculateIndustryOverlap",
      "getRelatedCategories",
      "generateExplanation",
      "calculateConfidence"
    ],
    "dependencies": [
      "domains/career/Career.ts",
      "ontology/career-ontology/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/skill-taxonomy/SkillTaxonomyV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "SkillTaxonomyV1"
    ],
    "functionNames": [
      "getCareerSkillProfile",
      "calculateSkillOverlap",
      "calculateSkillGap",
      "calculateSkillTransferability",
      "calculateSkillSimilarity",
      "findAdjacentSkills",
      "findEmergingSkills",
      "generateSkillGapReport",
      "generateTransferabilityExplanation",
      "proficiencyToScore",
      "compareProficiency",
      "meetsProficiencyRequirement"
    ],
    "dependencies": [
      "null",
      "SkillGap[]",
      "TransferabilityAnalysis",
      "number",
      "Array<",
      "SkillGapReport"
    ],
    "consumers": [
      "../../domains/career/Career.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/skill-transition-engine/SkillTransitionEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "SkillTransitionEngineV1"
    ],
    "functionNames": [
      "analyzeCareerTransition",
      "identifyTransferableSkills",
      "identifyMissingSkills",
      "buildLearningPath",
      "calculateCriticalPath",
      "buildLearningPhases",
      "calculateTransitionDifficulty",
      "calculateTransitionProbability",
      "calculateCategoryOverlap",
      "calculateTransitionQualityScore",
      "scoreToRating",
      "generateTransitionExplanation"
    ],
    "dependencies": [
      "../../domains/career/Career.js",
      "../skill-taxonomy/SkillTaxonomyV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/uncertainty-engine/UncertaintyEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "UncertaintyEngineV1"
    ],
    "functionNames": [
      "confidenceToLevel",
      "getConfidenceDescription",
      "calculateStudentProfileConfidence",
      "calculateCareerDataConfidence",
      "calculateGraphQualityConfidence",
      "calculateSimulationConfidence",
      "generateUncertaintyProfile",
      "generateUncertaintyExplanation",
      "createUncertaintyEngine",
      "calculateStudentConfidence",
      "calculateCareerConfidence",
      "calculateGraphConfidence"
    ],
    "dependencies": [
      "../types/index.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/utility-discovery-engine/UtilityDiscoveryEngineV1.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "UtilityDiscoveryEngineV1"
    ],
    "functionNames": [
      "analyzeTradeoffChoices",
      "generateTradeoffScenarios",
      "detectValueConflicts",
      "generateConflictExplanations",
      "generateConflictRecommendation",
      "calculateWeightConfidences",
      "trackUtilityEvolution",
      "generateWeightExplanations",
      "generateEvidenceDescription",
      "discoverUtilityProfile",
      "createUtilityDiscoveryEngine",
      "discoverProfile"
    ],
    "dependencies": [
      "../types/index.js",
      "../maut-foundation/MAUTFoundationV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/confidence-calibration-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "ConfidenceCalibrationEngine"
    ],
    "functionNames": [
      "addDataPoint",
      "addDataPoints",
      "generateReport",
      "checkCalibration",
      "calculateECE",
      "calculateBrierScore",
      "getStatistics",
      "clearData",
      "getConfig",
      "updateConfig",
      "binPredictions",
      "analyzeCalibration"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/counterfactual-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "CounterfactualEngine"
    ],
    "functionNames": [
      "getConfig",
      "updateConfig",
      "generateCounterfactualValues",
      "determineMagnitudeByChange",
      "determineMagnitude",
      "generateReasoning",
      "calculateSensitivityScore",
      "calculateSensitivityRanking",
      "calculateRobustness",
      "determineDecisionBoundaries",
      "estimateThreshold",
      "setNestedValue"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/intelligence-validation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "IntelligenceValidationEngine"
    ],
    "functionNames": [
      "validate",
      "quickValidate",
      "validateBatch",
      "getValidationHistory",
      "getStatistics",
      "getConfig",
      "updateConfig",
      "getEngines",
      "runCalibration",
      "runUncertainty",
      "runAudit",
      "generateSummary"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts",
      "intelligence/validation/confidence-calibration-engine.ts",
      "intelligence/validation/recommendation-stability-engine.ts",
      "intelligence/validation/recommendation-consistency-engine.ts",
      "intelligence/validation/uncertainty-engine.ts",
      "intelligence/validation/counterfactual-engine.ts",
      "intelligence/validation/recommendation-audit-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/recommendation-audit-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationAuditEngine"
    ],
    "functionNames": [
      "auditRecommendation",
      "auditRecommendations",
      "quickAudit",
      "compareAudits",
      "getConfig",
      "updateConfig",
      "auditEvidence",
      "isVerifiable",
      "auditEngines",
      "auditConfidenceBasis",
      "auditOpportunityCosts",
      "auditUncertainties"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/recommendation-consistency-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationConsistencyEngine"
    ],
    "functionNames": [
      "checkConsistency",
      "generateAssessmentPaths",
      "calculateConsistencyScore",
      "getConsistencyRating",
      "getConfig",
      "updateConfig",
      "generateEmptyReport",
      "comparePathways",
      "calculateComponentConsistency",
      "analyzeConvergence",
      "calculateOverallConsistency",
      "calculateCorrelation"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/recommendation-stability-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationStabilityEngine"
    ],
    "functionNames": [
      "calcStats",
      "checkStability",
      "generatePerturbations",
      "calculateDriftScore",
      "getStabilityRating",
      "getConfig",
      "updateConfig",
      "calculateDrift",
      "isAcceptableDrift",
      "getTopRecommendation",
      "calculateOverallStability",
      "calculateDriftMetrics"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/validation/uncertainty-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option generation, scoring, validation, comparison, simulation, explanation, or guidance.",
    "classNames": [
      "UncertaintyEngine"
    ],
    "functionNames": [
      "assessUncertainty",
      "createEmptyAssessment",
      "shouldAdmitUncertainty",
      "calculateUncertaintyScore",
      "generateExplanation",
      "getConfig",
      "updateConfig",
      "detectUncertaintySources",
      "identifyEvidenceGaps",
      "calculateConfidenceBounds",
      "determineSystemResponse",
      "calculateOverallUncertainty"
    ],
    "dependencies": [
      "intelligence/validation/validation-types.ts"
    ],
    "consumers": [
      "intelligence/validation/intelligence-validation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/ExperimentRecommender.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ExperimentRecommender"
    ],
    "functionNames": [
      "createExperimentRecommender",
      "recommend",
      "shouldRecommendCodingProject",
      "shouldRecommendProductProject",
      "shouldRecommendResearchProject",
      "shouldRecommendShadowing",
      "shouldRecommendInternship",
      "shouldRecommendVolunteering",
      "shouldRecommendFreelance",
      "shouldRecommendStartupChallenge",
      "createCodingProjectRecommendation",
      "createProductProjectRecommendation"
    ],
    "dependencies": [
      "'high' \\"
    ],
    "consumers": [
      "'medium' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/InformationGapDetector.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "InformationGapDetector"
    ],
    "functionNames": [
      "createInformationGapDetector",
      "detect",
      "detectInterestGaps",
      "detectAptitudeGaps",
      "detectValueGaps",
      "detectSkillGaps",
      "detectIdentityGaps",
      "detectMarketGaps",
      "detectConstraintsGaps",
      "groupByCategory",
      "calculateStatistics"
    ],
    "dependencies": [
      "intelligence/types/index.ts",
      "intelligence/uncertainty-engine/index.ts"
    ],
    "consumers": [
      "intelligence/value-of-information-engine/ValueOfInformationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/InformationPrioritizer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "InformationPrioritizer"
    ],
    "functionNames": [
      "createInformationPrioritizer",
      "prioritize",
      "generateOpportunities",
      "generateCategoryOpportunities",
      "generateInterestOpportunities",
      "generateAptitudeOpportunities",
      "generateValuesOpportunities",
      "generateSkillsOpportunities",
      "generateMarketOpportunities",
      "generateIdentityOpportunities",
      "generateConstraintsOpportunities",
      "generateOutcomesOpportunities"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/value-of-information-engine/ValueOfInformationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/ValueOfInformationCalculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ValueOfInformationCalculator"
    ],
    "functionNames": [
      "createValueOfInformationCalculator",
      "calculate",
      "calculateForGap",
      "calculateConfidenceImprovement",
      "calculateUtilityImprovement",
      "calculateDecisionImprovement",
      "calculateProbabilityOfChange",
      "calculateVOPI",
      "calculateVOSI",
      "estimateInformationCost",
      "calculateOpportunityEVI",
      "calculateSequenceValue"
    ],
    "dependencies": [
      "intelligence/uncertainty-engine/index.ts",
      "intelligence/decision-optimization-engine/index.ts"
    ],
    "consumers": [
      "intelligence/value-of-information-engine/ValueOfInformationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/ValueOfInformationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "ValueOfInformationEngine"
    ],
    "functionNames": [
      "createValueOfInformationEngine",
      "analyzeValueOfInformation",
      "analyze",
      "quickAnalyze",
      "getTopRecommendations",
      "calculateExpectedImprovements",
      "buildActionPlan",
      "calculateValueVsNoInformation",
      "generateId",
      "updateConfig",
      "getConfig"
    ],
    "dependencies": [
      "intelligence/value-of-information-engine/InformationGapDetector.ts",
      "intelligence/value-of-information-engine/ValueOfInformationCalculator.ts",
      "intelligence/value-of-information-engine/InformationPrioritizer.ts",
      "intelligence/value-of-information-engine/ExperimentRecommender.ts",
      "intelligence/value-of-information-engine/VoIExplanationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-of-information-engine/VoIExplanationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "VoIExplanationEngine"
    ],
    "functionNames": [
      "createVoIExplanationEngine",
      "explain",
      "generateSummary",
      "generateDetailedExplanation",
      "explainDecisionContext",
      "explainGapAnalysis",
      "explainRecommendedApproach",
      "explainExperimentAdvantage",
      "explainAlternativeConsiderations",
      "generateValueJustification",
      "generateComparisons",
      "generateComparisonReasoning"
    ],
    "dependencies": [
      "intelligence/decision-optimization-engine/index.ts"
    ],
    "consumers": [
      "intelligence/value-of-information-engine/ValueOfInformationEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/knowledge-graph/KnowledgeGraphExplorer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "knowledge-graph",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "KnowledgeGraphExplorer"
    ],
    "functionNames": [
      "createKnowledgeGraphExplorer",
      "parseQuery",
      "extractCareerNames",
      "detectIntent",
      "extractParameters",
      "executeQuery",
      "findReachableCareers",
      "findSimilarCareers",
      "findConnections",
      "findPathways",
      "findNeighbors",
      "findRequiredSkills"
    ],
    "dependencies": [
      "knowledge-graph/KnowledgeGraphCore.ts",
      "ontology/career-ontology/index.ts",
      "domains/career/Career.ts",
      "intelligence/similarity-engine/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/FreshnessEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "FreshnessEngine"
    ],
    "functionNames": [
      "createFreshnessEngine",
      "quickFreshnessCheck",
      "createFreshnessPolicy",
      "calculateFreshness",
      "calculateFreshnessScore",
      "determineStatus",
      "getPolicy",
      "setPolicy",
      "getDefaultPolicy",
      "getAllPolicies",
      "isExpired",
      "isStale"
    ],
    "dependencies": [
      "'stale' \\"
    ],
    "consumers": [
      "'expired'",
      "void"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/MarketIngestionPipeline.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketIngestionPipeline"
    ],
    "functionNames": [
      "createMarketIngestionPipeline",
      "quickProcess",
      "createRawMarketSignal",
      "processSignal",
      "processBatch",
      "processSubBatch",
      "validate",
      "normalize",
      "aggregate",
      "storeRawSignal",
      "storeNormalizedSignal",
      "storeAggregatedSignal"
    ],
    "dependencies": [
      "./types.js",
      "./SignalValidationEngine.js",
      "./SignalNormalizationEngine.js",
      "./SignalAggregationEngine.js",
      "./SourceTrustEngine.js",
      "./FreshnessEngine.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/SignalAggregationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SignalAggregationEngine"
    ],
    "functionNames": [
      "createSignalAggregationEngine",
      "quickAggregate",
      "weightedMean",
      "aggregate",
      "aggregateMultiple",
      "aggregateAll",
      "aggregateBatch",
      "filterSignals",
      "groupByEntityAndType",
      "removeOutliers",
      "calculateAggregation",
      "confidenceWeightedMean"
    ],
    "dependencies": [
      "null",
      "Map<NormalizedSignalType",
      "AggregatedMarketSignal>",
      "Map<string",
      "AggregatedMarketSignal>",
      "NormalizedMarketSignal[]",
      "Map<string",
      "NormalizedMarketSignal[]>"
    ],
    "consumers": [
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/SignalNormalizationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SignalNormalizationEngine"
    ],
    "functionNames": [
      "createSignalNormalizationEngine",
      "quickNormalize",
      "getSupportedSignalTypes",
      "addNormalizationRule",
      "normalize",
      "normalizeBatch",
      "normalizeEntityType",
      "normalizeSignalType",
      "normalizeEntityId",
      "convertToNumber",
      "normalizeValue",
      "calculateConfidence"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/SignalValidationEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SignalValidationEngine"
    ],
    "functionNames": [
      "createSignalValidationEngine",
      "quickValidate",
      "getValidEntityTypes",
      "getValidSignalTypes",
      "validate",
      "validateBatch",
      "checkMissingValues",
      "checkInvalidValues",
      "checkDuplicate",
      "checkOutdated",
      "checkEntityType",
      "checkMetricType"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/market-data-ingestion/SourceTrustEngine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "market-data-ingestion",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "SourceTrustEngine"
    ],
    "functionNames": [
      "createSourceTrustEngine",
      "calculateQuickTrustScore",
      "initializeSource",
      "getTrustMetrics",
      "updateTrustScore",
      "getAllTrustMetrics",
      "recordAccuracy",
      "calculateCurrentAccuracy",
      "getAccuracyHistory",
      "trackSignal",
      "calculateConsistency",
      "detectAnomalies"
    ],
    "dependencies": [
      "undefined",
      "SourceTrustMetrics[]",
      "SourceAccuracyRecord"
    ],
    "consumers": [
      "./types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/mentor-intelligence/decision-outcome-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "mentor-intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "DecisionOutcomeEngine"
    ],
    "functionNames": [
      "analyzeDecisions",
      "analyzeDecisionType",
      "compareDecisionOutcomes",
      "generateCounterfactual",
      "identifySuccessfulDecisionPatterns",
      "predictOutcomes",
      "analyzeDecision",
      "classifyDecisionType",
      "buildDecisionContext",
      "analyzeShortTermOutcome",
      "analyzeMediumTermOutcome",
      "analyzeLongTermOutcome"
    ],
    "dependencies": [
      "null",
      "DecisionType",
      "DecisionContext",
      "OutcomeSnapshot"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "mentor-intelligence/mentor-intelligence-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/mentor-intelligence/lesson-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "mentor-intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "LessonEngine"
    ],
    "functionNames": [
      "extractLessons",
      "generateContextualLessons",
      "findContrarianLessons",
      "compareLessonsAcrossGroups",
      "validateLesson",
      "extractFromLesson",
      "extractFromSuccess",
      "extractFromFailure",
      "extractFromRegret",
      "consolidateLessons",
      "mergeLessonGroup",
      "sortLessonsByValue"
    ],
    "dependencies": [
      "null",
      "ExtractedLesson",
      "Record<LessonCategory",
      "ExtractedLesson[]>",
      "LessonCategory",
      "LessonType"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "mentor-intelligence/mentor-intelligence-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/mentor-intelligence/mentor-intelligence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "mentor-intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "MentorIntelligenceEngine"
    ],
    "functionNames": [
      "createMentorIntelligenceEngine",
      "extractIntelligence",
      "extractStageSpecificIntelligence",
      "answerQuestions",
      "generateAdvice",
      "compareGroups",
      "explainInsight",
      "extractPatterns",
      "extractLessons",
      "analyzeMistakes",
      "analyzeDecisions",
      "synthesizeKeyInsights"
    ],
    "dependencies": [
      "career-journeys/career-journey-types.ts",
      "career-journeys/similarity/journey-similarity-types.ts",
      "mentor-intelligence/mentor-intelligence-types.ts",
      "mentor-intelligence/pattern-extraction-engine.ts",
      "mentor-intelligence/lesson-engine.ts",
      "mentor-intelligence/mistake-engine.ts",
      "mentor-intelligence/decision-outcome-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/mentor-intelligence/mistake-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "mentor-intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "MistakeEngine"
    ],
    "functionNames": [
      "analyzeMistakes",
      "identifyRelevantMistakes",
      "compareMistakesAcrossGroups",
      "calculateRecoverability",
      "generateEarlyWarningSystem",
      "analyzeFailure",
      "analyzeRegret",
      "analyzeBadDecision",
      "consolidateMistakes",
      "mergeMistakeGroup",
      "identifyMostCommon",
      "identifyMostCostly"
    ],
    "dependencies": [
      "null",
      "MistakeAnalysis[]",
      "MistakeAnalysis",
      "Record<MistakeCategory",
      "MistakeAnalysis[]>",
      "MistakeCategory",
      "MistakeCost"
    ],
    "consumers": [
      "career-journeys/career-journey-types.ts",
      "mentor-intelligence/mentor-intelligence-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/mentor-intelligence/pattern-extraction-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "mentor-intelligence",
    "purpose": "Mentor-derived guidance, lessons, mistakes, or pattern extraction for options.",
    "classNames": [
      "PatternExtractionEngine"
    ],
    "functionNames": [
      "extractPatterns",
      "extractSuccessPatterns",
      "extractFailurePatterns",
      "extractPatternsByCategory",
      "findCooccurringPatterns",
      "comparePatternPrevalence",
      "validatePattern",
      "extractSuccessCandidate",
      "extractTurningPointSuccessCandidate",
      "extractDecisionSuccessCandidate",
      "extractFailureCandidate",
      "extractRegretCandidate"
    ],
    "dependencies": [
      "FailurePattern[]",
      "Array<",
      "PatternCandidate \\"
    ],
    "consumers": [
      "null",
      "PatternCandidate[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/career-evidence/CareerEvidenceSystem.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "ontology",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerEvidenceSystem"
    ],
    "functionNames": [
      "generateEvidenceId",
      "generateCollectionId",
      "createEvidence",
      "createEvidenceCollection",
      "calculateAggregateConfidence",
      "validateEvidence",
      "evidenceSourceToString",
      "addEvidence",
      "getEvidence",
      "getEvidenceForCareer",
      "getEvidenceForAttribute",
      "queryEvidence"
    ],
    "dependencies": [
      "ontology/career-ontology/index.ts"
    ],
    "consumers": [
      "ontology/career-relationships/CareerRelationshipTaxonomy.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/career-ontology/CareerOntologyV2.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "ontology",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "CareerOntologyV2"
    ],
    "functionNames": [
      "createCareerSlug",
      "generateCareerId",
      "validateCareer",
      "normalizeCareerData",
      "createCareer",
      "addCareer",
      "getCareer",
      "getCareerBySlug",
      "getAllCareers",
      "getCareersByCategory",
      "getCategories",
      "filterCareers"
    ],
    "dependencies": [
      "undefined",
      "Career[]"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/career-relationships/CareerRelationshipTaxonomy.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "ontology",
    "purpose": "Career knowledge, evidence, taxonomy, graph, or ontology used by option generation.",
    "classNames": [
      "RelationshipBuilder"
    ],
    "functionNames": [
      "strengthToScore",
      "scoreToStrength",
      "isCareerToCareerRelationship",
      "isCareerToSkillRelationship",
      "isCareerToDegreeRelationship",
      "isCareerToExamRelationship",
      "isCareerToIndustryRelationship",
      "isCareerToCertificationRelationship",
      "isCareerToRoleRelationship",
      "validateRelationship",
      "filterRelationshipsByStrength",
      "getRelationshipsBySource"
    ],
    "dependencies": [
      "ontology/career-evidence/CareerEvidenceSystem.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/indian-market-intelligence/calculators.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "ontology",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [],
    "functionNames": [
      "getSourceQualityWeight",
      "calculateMarketConfidence",
      "calculateSignalTypeConfidence",
      "calculateDataQualityMetrics",
      "calculateMarketFreshness",
      "calculateSignalTypeFreshness",
      "needsRefresh",
      "getRefreshPriority",
      "aggregateSignals",
      "aggregateSignalsByType",
      "detectSignalTrend",
      "detectSignalAnomalies"
    ],
    "dependencies": [
      "'high' \\"
    ],
    "consumers": [
      "'medium' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/indian-market-intelligence/repositories.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "ontology",
    "purpose": "Market intelligence, market signal ingestion, forecasting, scoring, or adjustment for options.",
    "classNames": [
      "MarketSignalRepository",
      "MarketProfileRepository",
      "MarketIntelligenceRepository"
    ],
    "functionNames": [
      "createMarketIntelligenceRepository",
      "createMarketSignal",
      "storeSignal",
      "storeSignals",
      "getSignal",
      "getSignalsByEntity",
      "getSignalsByType",
      "getSignalsInRange",
      "getLatestSignal",
      "getSignalHistory",
      "deleteSignalsBefore",
      "getSignalCount"
    ],
    "dependencies": [
      "undefined",
      "MarketSignal[]",
      "number"
    ],
    "consumers": [
      "./types.js",
      "./calculators.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/optionality-intelligence/future-options-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "optionality-intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "FutureOptionsEngine"
    ],
    "functionNames": [
      "createFutureOptionsEngine",
      "generateFutureOptions",
      "generatePrimaryPaths",
      "generateAlternativePaths",
      "generateExpansionPaths",
      "generateBackupPaths",
      "calculatePathDiversity",
      "estimateTransitionTime",
      "deriveRequiredSkills",
      "derivePossessedSkills",
      "estimateIndustryCount",
      "inferSeniorityLevel"
    ],
    "dependencies": [
      "optionality-intelligence/optionality-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "optionality-intelligence/optionality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/optionality-intelligence/optionality-calculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "optionality-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionalityCalculator"
    ],
    "functionNames": [
      "createOptionalityCalculator",
      "calculateOptionalityBreakdown",
      "calculateOverallOptionality",
      "calculateCareerFlexibility",
      "calculatePivotPotential",
      "calculateTransferableSkills",
      "calculateIndustryMobility",
      "calculateGeographicMobility",
      "calculateEntrepreneurialPotential",
      "calculateTransferableSkillsAssessment",
      "calculateGeographicMobilityDetailed",
      "calculateEntrepreneurialPotentialDetailed"
    ],
    "dependencies": [
      "optionality-intelligence/optionality-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "optionality-intelligence/optionality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/optionality-intelligence/optionality-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "optionality-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionalityIntelligenceEngine"
    ],
    "functionNames": [
      "createOptionalityIntelligenceEngine",
      "analyzeOptionality",
      "compareOptionalities",
      "generateRankings",
      "compareDimensions",
      "getFutureOptions",
      "getPathFlexibility",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "optionality-intelligence/optionality-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts",
      "optionality-intelligence/optionality-calculator.ts",
      "optionality-intelligence/path-flexibility-engine.ts",
      "optionality-intelligence/future-options-engine.ts",
      "optionality-intelligence/optionality-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/optionality-intelligence/optionality-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "optionality-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "OptionalityExplanationEngine"
    ],
    "functionNames": [
      "createOptionalityExplanationEngine",
      "generateExplanation",
      "generateSummary",
      "identifyOptionsOpen",
      "identifyOptionsHarder",
      "identifyOptionsEasier",
      "generateInsights",
      "generateRecommendations",
      "getSortedDimensions",
      "formatDimensionName"
    ],
    "dependencies": [
      "optionality-intelligence/optionality-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "optionality-intelligence/optionality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/optionality-intelligence/path-flexibility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "optionality-intelligence",
    "purpose": "Career pathway, journey, roadmap, milestone, transition, or route generation.",
    "classNames": [
      "PathFlexibilityEngine"
    ],
    "functionNames": [
      "createPathFlexibilityEngine",
      "calculateCareerFlexibility",
      "calculatePivotPotential",
      "estimateAccessibleCareers",
      "calculateLevelFlexibility",
      "identifyFlexibilityFactors",
      "generatePivotTargets",
      "identifyPivotBarriers",
      "isTechnicalRole"
    ],
    "dependencies": [
      "optionality-intelligence/optionality-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "optionality-intelligence/optionality-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/recommendation/career-recommendation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "recommendation",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "CareerRecommendationEngine"
    ],
    "functionNames": [
      "createCareerRecommendationEngine",
      "registerCareer",
      "registerCareers",
      "generateRecommendations",
      "filterValidFits",
      "enrichRecommendations",
      "addAlternativesAndRelated",
      "findAlternatives",
      "findRelatedCareers",
      "generateAlternativeReason",
      "identifyKeyDifferences",
      "generateWhenToConsider"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts",
      "recommendation/recommendation-types.ts",
      "recommendation/recommendation-ranker.ts",
      "recommendation/recommendation-explainer.ts",
      "recommendation/recommendation-confidence-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/recommendation/recommendation-confidence-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "recommendation",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationConfidenceEngine"
    ],
    "functionNames": [
      "createRecommendationConfidenceEngine",
      "calculateConfidence",
      "calculateRecommendationConfidence",
      "calculateEvidenceConfidence",
      "calculateProfileConfidence",
      "calculateCareerConfidence",
      "calculateVariance",
      "meetsConfidenceThreshold",
      "getConfidenceInterpretation",
      "identifyConfidenceIssues",
      "recommendConfidenceImprovements",
      "getAverageConfidence"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "career-intelligence/career-types.ts",
      "types/student-life-profile.ts",
      "intelligence/confidence/index.ts"
    ],
    "consumers": [
      "recommendation/career-recommendation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/recommendation/recommendation-explainer.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "recommendation",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationExplainer"
    ],
    "functionNames": [
      "createRecommendationExplainer",
      "explainRecommendation",
      "generateWhyRecommended",
      "generateWhyNotHigher",
      "generateWhyNotLower",
      "generateMajorAdvantages",
      "generateMajorConcerns",
      "generateUniqueSellingPoints",
      "generateFitSummary",
      "generateOutlookSummary",
      "getWeakestDimension",
      "generateBriefSummary"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "recommendation/career-recommendation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/recommendation/recommendation-ranker.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "recommendation",
    "purpose": "Recommendation generation, ranking, fusion, confidence, audit, stability, or explanation.",
    "classNames": [
      "RecommendationRanker"
    ],
    "functionNames": [
      "createRecommendationRanker",
      "rankCareers",
      "createRecommendation",
      "calculateMarketOpportunityScore",
      "determineRecommendationType",
      "assignRanksAndTypes",
      "applyCriteria",
      "getTopRecommendations",
      "getAlternativeRecommendations",
      "getStretchRecommendations",
      "filterRecommendations",
      "compareRecommendations"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "recommendation/career-recommendation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/regret-intelligence/regret-calculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "regret-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretCalculator"
    ],
    "functionNames": [
      "createRegretCalculator",
      "calculateRegretBreakdown",
      "calculateOverallRegretRisk",
      "calculateIdentityRegret",
      "calculateLifestyleRegret",
      "calculateFinancialRegret",
      "calculateOpportunityRegret",
      "calculateGrowthRegret",
      "calculateValuesRegret"
    ],
    "dependencies": [
      "regret-intelligence/regret-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts",
      "@/types/student-profile",
      "optionality-intelligence/optionality-types.ts"
    ],
    "consumers": [
      "regret-intelligence/regret-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/regret-intelligence/regret-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "regret-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretIntelligenceEngine"
    ],
    "functionNames": [
      "createRegretIntelligenceEngine",
      "analyzeRegret",
      "generateMitigationStrategies",
      "getPrimaryRegretFactors",
      "compareRegretRisks",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "regret-intelligence/regret-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts",
      "@/types/student-profile",
      "optionality-intelligence/optionality-types.ts",
      "regret-intelligence/regret-calculator.ts",
      "regret-intelligence/regret-scenario-engine.ts",
      "regret-intelligence/regret-factor-engine.ts",
      "regret-intelligence/regret-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/regret-intelligence/regret-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "regret-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretExplanationEngine"
    ],
    "functionNames": [
      "createRegretExplanationEngine",
      "generateExplanation",
      "generateSummary",
      "identifyWhyRiskExists",
      "identifyWhyRiskIsLow",
      "identifyKeyFactors",
      "push",
      "identifyWarningSigns",
      "generateMitigationExplanation"
    ],
    "dependencies": [
      "regret-intelligence/regret-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "consumers": [
      "regret-intelligence/regret-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/regret-intelligence/regret-factor-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "regret-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "RegretFactorEngine"
    ],
    "functionNames": [
      "createRegretFactorEngine",
      "identifyRegretFactors",
      "extractIdentityFactors",
      "extractLifestyleFactors",
      "extractFinancialFactors",
      "extractOpportunityFactors",
      "extractGrowthFactors",
      "extractValuesFactors",
      "extractFitFactors",
      "calculatePrimaryThreshold",
      "getPrimaryFactors",
      "getSecondaryFactors"
    ],
    "dependencies": [
      "'priority'>>",
      "number"
    ],
    "consumers": [
      "regret-intelligence/regret-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/regret-intelligence/regret-scenario-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "regret-intelligence",
    "purpose": "Future scenario, trajectory, or simulation generation.",
    "classNames": [
      "RegretScenarioEngine"
    ],
    "functionNames": [
      "createRegretScenarioEngine",
      "generateScenarios",
      "generateBestCase",
      "generateExpectedCase",
      "generateWorstCase",
      "getDimensionImplications"
    ],
    "dependencies": [
      "regret-intelligence/regret-types.ts",
      "career-intelligence/career-types.ts",
      "career-fit/career-fit-types.ts"
    ],
    "consumers": [
      "regret-intelligence/regret-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/utility-intelligence/utility-breakdown-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "utility-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "UtilityBreakdownEngine"
    ],
    "functionNames": [
      "createUtilityBreakdownEngine",
      "generateAdvantages",
      "generateRisks",
      "analyzeComponents",
      "identifyStrongestDimension",
      "identifyWeakestDimension",
      "calculateConfidence"
    ],
    "dependencies": [
      "utility-intelligence/utility-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts",
      "profile/profile-types.ts"
    ],
    "consumers": [
      "utility-intelligence/utility-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/utility-intelligence/utility-calculator.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "utility-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "UtilityCalculator"
    ],
    "functionNames": [
      "createUtilityCalculator",
      "calculateUtilityBreakdown",
      "calculateOverallUtility",
      "calculateFulfillmentUtility",
      "calculateStrengthAlignment",
      "calculateInterestAlignment",
      "calculateMotivationAlignment",
      "calculateLifestyleUtility",
      "calculateFinancialUtility",
      "calculateGrowthUtility",
      "calculateFreedomUtility",
      "calculateMeaningUtility"
    ],
    "dependencies": [
      "utility-intelligence/utility-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts",
      "profile/profile-types.ts"
    ],
    "consumers": [
      "utility-intelligence/utility-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/utility-intelligence/utility-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "utility-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "UtilityIntelligenceEngine"
    ],
    "functionNames": [
      "createUtilityIntelligenceEngine",
      "analyzeUtility",
      "analyzeMultipleUtilities",
      "getDimensionBreakdown",
      "analyzeComponents",
      "identifyStrongestDimension",
      "identifyWeakestDimension",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "utility-intelligence/utility-types.ts",
      "career-fit/career-fit-types.ts",
      "career-intelligence/career-types.ts",
      "profile/profile-types.ts",
      "utility-intelligence/utility-calculator.ts",
      "utility-intelligence/utility-breakdown-engine.ts",
      "utility-intelligence/utility-explanation-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/utility-intelligence/utility-explanation-engine.ts",
    "owner": "OptionGeneratorAuthority",
    "capability": "GENERATE",
    "domain": "utility-intelligence",
    "purpose": "Option trade-off intelligence: utility, optionality, regret, reality, counterfactual, MAUT, Pareto, or value of information.",
    "classNames": [
      "UtilityExplanationEngine"
    ],
    "functionNames": [
      "createUtilityExplanationEngine",
      "generateExplanation",
      "explainWhyHigh",
      "explainWhyLow",
      "identifyTopContributors",
      "identifyTopReductions",
      "generateSummary",
      "generateRecommendations",
      "describePattern",
      "getStrongDimensions",
      "getWeakDimensions",
      "formatDimensionList"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "utility-intelligence/utility-types.ts",
      "career-intelligence/career-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/active-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "ActiveLearningEngine"
    ],
    "functionNames": [
      "generateQueryId",
      "analyzeStudent",
      "generateLearningQuery",
      "sendQuery",
      "processResponse",
      "generateReport",
      "getRecommendations",
      "processBatch",
      "getNextQueryBatch",
      "getPendingQueriesForStudent",
      "getAllPendingQueries",
      "getSentQueries"
    ],
    "dependencies": [
      "null",
      "void",
      "ActiveLearningReport",
      "string[]",
      "LearningQuery[]"
    ],
    "consumers": [
      "../outcome-tracking/outcome-types.js",
      "./active-learning-types.js",
      "./uncertainty-engine.js",
      "./learning-value-engine.js",
      "./decision-boundary-engine.js",
      "./outcome-priority-engine.js",
      "./evidence-gap-engine.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/decision-boundary-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "DecisionBoundaryEngine"
    ],
    "functionNames": [
      "extractStudentFeatures",
      "calculateCosineSimilarity",
      "calculateCategoryDistance",
      "calculateBoundaryProximity",
      "identifyAmbiguityFactors",
      "generateClarificationRecommendations",
      "detectBoundaryStudents",
      "generateBoundaryApproachStrategy",
      "generateTimeline",
      "createBoundaryStudentProfile",
      "detectBoundaryStudentsBatch",
      "detectBoundaries"
    ],
    "dependencies": [
      "intelligence/active-learning/active-learning-types.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/evidence-gap-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "EvidenceGapEngine"
    ],
    "functionNames": [
      "generateGapId",
      "initializePredefinedGaps",
      "identifyGaps",
      "getCriticalGaps",
      "updateGapCoverage",
      "addSampleToGap",
      "getStudentGaps",
      "getRecommendedSamplingTargets",
      "getGapsByType",
      "getGap",
      "getStats",
      "generateAnalysis"
    ],
    "dependencies": [
      "undefined",
      "EvidenceGapAnalysis",
      "boolean"
    ],
    "consumers": [
      "../outcome-tracking/outcome-types.js",
      "./active-learning-types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/learning-value-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "LearningValueEngine"
    ],
    "functionNames": [
      "calculateUncertaintyComponent",
      "calculateVolatilityComponent",
      "calculateRarityComponent",
      "getPathwayFrequency",
      "calculateContradictionComponent",
      "detectSkillInterestContradiction",
      "detectValueBehaviorContradiction",
      "detectExpectationRealityContradiction",
      "calculateNoveltyComponent",
      "calculateCareerCombinationNovelty",
      "calculateBackgroundNovelty",
      "calculateOutcomeNovelty"
    ],
    "dependencies": [
      "intelligence/active-learning/active-learning-types.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/outcome-priority-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "OutcomePriorityEngine"
    ],
    "functionNames": [
      "generatePriorityId",
      "calculatePriority",
      "updatePriority",
      "getHighPriorityOutcomes",
      "getPendingFollowUps",
      "scheduleFollowUp",
      "getPriority",
      "getStudentPriorities",
      "getCurrentPriority",
      "escalatePriority",
      "deescalatePriority",
      "getStats"
    ],
    "dependencies": [
      "undefined",
      "boolean"
    ],
    "consumers": [
      "../outcome-tracking/outcome-types.js",
      "./active-learning-types.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/active-learning/uncertainty-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "UncertaintyEngine"
    ],
    "functionNames": [
      "calculateEntropy",
      "calculateVariance",
      "calculateConfidenceIntervalUncertainty",
      "calculatePredictionVariance",
      "valueToUncertaintyLevel",
      "combineUncertaintyScores",
      "calculateEpistemicUncertainty",
      "calculateAleatoricUncertainty",
      "calculateModelUncertainty",
      "calculateOptionAmbiguity",
      "calculateDecisionOutcomeUncertainty",
      "calculatePreferenceUncertainty"
    ],
    "dependencies": [
      "intelligence/active-learning/active-learning-types.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "CalibrationEngine"
    ],
    "functionNames": [
      "registerSystemsForReporting",
      "createDefaultProfile",
      "recordRecommendationAcceptance",
      "recordRecommendationAction",
      "recordRecommendationOutcome",
      "adjustRecommendationConfidence",
      "recordDecisionOutcome",
      "assessDecisionQuality",
      "recordRegretSignal",
      "adjustRegretRisk",
      "recordImpact",
      "adjustCriticality"
    ],
    "dependencies": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/confidence-calibration-engine.ts",
      "intelligence/calibration/recommendation-calibration-engine.ts",
      "intelligence/calibration/decision-calibration-engine.ts",
      "intelligence/calibration/regret-calibration-engine.ts",
      "intelligence/calibration/criticality-calibration-engine.ts",
      "intelligence/calibration/reliability-engine.ts",
      "intelligence/calibration/calibration-report-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/calibration-report-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "CalibrationReportEngine"
    ],
    "functionNames": [
      "registerSystem",
      "updateSystemProfile",
      "generateReport",
      "generateSummary",
      "generateSystemCalibrations",
      "calculateChangeFromLastPeriod",
      "analyzeDrift",
      "calculateLearningProgress",
      "generateRecommendations",
      "getMostReliableSystems",
      "getLeastReliableSystems",
      "getOverconfidenceAreas"
    ],
    "dependencies": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/reliability-engine.ts"
    ],
    "consumers": [
      "intelligence/calibration/calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/confidence-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "ConfidenceCalibrationEngine"
    ],
    "functionNames": [
      "addObservation",
      "addObservations",
      "calibrate",
      "calculateBinCalibrations",
      "calculateCalibrationError",
      "calculateMaximumCalibrationError",
      "calculateBrierScore",
      "calculateReliabilityScore",
      "determineCalibrationStatus",
      "calculateTrend",
      "scoreToBand",
      "createInsufficientDataProfile"
    ],
    "dependencies": [
      "intelligence/calibration/calibration-types.ts"
    ],
    "consumers": [
      "intelligence/calibration/calibration-engine.ts",
      "intelligence/calibration/criticality-calibration-engine.ts",
      "intelligence/calibration/decision-calibration-engine.ts",
      "intelligence/calibration/recommendation-calibration-engine.ts",
      "intelligence/calibration/regret-calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/criticality-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "CriticalityCalibrationEngine"
    ],
    "functionNames": [
      "recordPrediction",
      "recordImpact",
      "createCalibrationObservation",
      "getProfile",
      "calculateImpactMetrics",
      "predictShortTermImpact",
      "predictLongTermImpact",
      "adjustCriticality",
      "calculateExpectedImpact",
      "getLevelCalibration",
      "getFactorCalibration",
      "analyzeAccuracyByLevel"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/confidence-calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/decision-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "DecisionCalibrationEngine"
    ],
    "functionNames": [
      "recordDecision",
      "recordOutcome",
      "createObservation",
      "getProfile",
      "calculateQualityMetrics",
      "assessDecisionQuality",
      "calculateExpectedQuality",
      "calculateRegretRisk",
      "getTypeCalibration",
      "getComplexityCalibration",
      "analyzeConfidenceQualityCorrelation",
      "identifyOverconfidencePatterns"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/confidence-calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/recommendation-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "RecommendationCalibrationEngine"
    ],
    "functionNames": [
      "recordRecommendation",
      "recordAcceptance",
      "recordAction",
      "recordOutcome",
      "finalizeOutcome",
      "createObservation",
      "getProfile",
      "calculateSuccessMetrics",
      "getTypeCalibration",
      "getCategoryCalibration",
      "adjustConfidence",
      "isWellCalibrated"
    ],
    "dependencies": [
      "null",
      "boolean"
    ],
    "consumers": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/confidence-calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/regret-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "RegretCalibrationEngine"
    ],
    "functionNames": [
      "recordPrediction",
      "recordRegretSignal",
      "createObservation",
      "severityToQuality",
      "getProfile",
      "calculatePredictionMetrics",
      "adjustRegretRisk",
      "getTypeCalibration",
      "getSeverityCalibration",
      "analyzeRegretPatterns",
      "severityToNumeric",
      "getEarlyWarningIndicators"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "intelligence/calibration/calibration-types.ts",
      "intelligence/calibration/confidence-calibration-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/calibration/reliability-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Calibration of predictions, decisions, recommendations, regret, criticality, or confidence.",
    "classNames": [
      "ReliabilityEngine"
    ],
    "functionNames": [
      "calculateReliability",
      "assessReliabilityFactors",
      "calculateWeightedScore",
      "scoreToBand",
      "calculateAssessmentConfidence",
      "generateRecommendations",
      "assessConfidenceTrustworthiness",
      "compareReliability",
      "detectReliabilityDrift",
      "getTrustLevelDescription",
      "getBandDescription",
      "cacheProfile"
    ],
    "dependencies": [
      "intelligence/calibration/calibration-types.ts"
    ],
    "consumers": [
      "intelligence/calibration/calibration-engine.ts",
      "intelligence/calibration/calibration-report-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/learning-loop/confidence-adjustment-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "ConfidenceAdjustmentEngine"
    ],
    "functionNames": [
      "initializeDefaultRules",
      "addRule",
      "removeRule",
      "setRuleActive",
      "calculateAdjustment",
      "findApplicableRules",
      "isRuleApplicable",
      "checkOutcomeCondition",
      "checkPatternCondition",
      "checkPopulationCondition",
      "applyRule",
      "calculateEvidenceValue"
    ],
    "dependencies": [
      "intelligence/learning-loop/learning-loop-types.ts"
    ],
    "consumers": [
      "intelligence/learning-loop/learning-loop-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/learning-loop/learning-loop-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "LearningLoopEngine"
    ],
    "functionNames": [
      "trackOutcome",
      "recordDecision",
      "recordShortTermOutcome",
      "recordCompleteOutcome",
      "recordRecommendation",
      "getRecommendationProfile",
      "getSuccessfulRecommendations",
      "getFailingRecommendations",
      "calculateAdjustedConfidence",
      "batchAdjustConfidence",
      "addPopulationData",
      "getPopulationInsights"
    ],
    "dependencies": [
      "null",
      "Array<",
      "LearningLoopReport",
      "RecommendationAdjustment[]"
    ],
    "consumers": [
      "intelligence/learning-loop/learning-loop-types.ts",
      "intelligence/learning-loop/outcome-feedback-engine.ts",
      "intelligence/learning-loop/recommendation-learning-engine.ts",
      "intelligence/learning-loop/confidence-adjustment-engine.ts",
      "intelligence/learning-loop/population-learning-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/learning-loop/outcome-feedback-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "OutcomeFeedbackEngine"
    ],
    "functionNames": [
      "trackOutcome",
      "recordDecision",
      "recordShortTermOutcome",
      "recordMediumTermOutcome",
      "recordLongTermOutcome",
      "recordCompleteOutcome",
      "scheduleCheckIns",
      "handleCheckIn",
      "estimateMissingMetrics",
      "clearTimers",
      "generateFeedback",
      "calculateSuccessLevel"
    ],
    "dependencies": [
      "null",
      "SuccessLevel",
      "ConfidenceImpact",
      "RecommendationImpact"
    ],
    "consumers": [
      "intelligence/learning-loop/learning-loop-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/learning-loop/population-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "PopulationLearningEngine"
    ],
    "functionNames": [
      "addDataPoint",
      "addDataPoints",
      "generateInsights",
      "detectSuccessPaths",
      "detectFailurePaths",
      "detectUnexpectedOutcomes",
      "detectHiddenOpportunities",
      "detectProfileSpecificPatterns",
      "calculateAggregateMetrics",
      "calculateTimeToSuccess",
      "extractProfileTraits",
      "extractRegretTypes"
    ],
    "dependencies": [
      "intelligence/learning-loop/learning-loop-types.ts"
    ],
    "consumers": [
      "intelligence/learning-loop/learning-loop-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/learning-loop/recommendation-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "RecommendationLearningEngine"
    ],
    "functionNames": [
      "recordRecommendation",
      "recordOutcome",
      "initializeProfile",
      "updateProfileFromOutcome",
      "updatePerformanceMetrics",
      "getRecentOutcomes",
      "calculateConsistency",
      "calculateTrend",
      "updateProfileEffectiveness",
      "updateRegretPatterns",
      "updateConfidenceGrowth",
      "addLearningHistoryEntry"
    ],
    "dependencies": [
      "'stable' \\"
    ],
    "consumers": [
      "'declining'",
      "RecommendationLearningProfile \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-evidence-engine/analysis.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome tracking, feedback processing, learning, calibration, or performance evaluation.",
    "classNames": [],
    "functionNames": [
      "calculateMean",
      "calculateStdDev",
      "calculateMedian",
      "calculateCohensD",
      "welchTTest",
      "approximatePValue",
      "determineSignificance",
      "determineDirection",
      "calculateConfidenceInterval",
      "extractOutcomeValues",
      "getSatisfactionScore",
      "getSuccessIndicator"
    ],
    "dependencies": [
      "undefined",
      "boolean \\"
    ],
    "consumers": [
      "undefined"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-evidence-engine/explanations.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome tracking, feedback processing, learning, calibration, or performance evaluation.",
    "classNames": [],
    "functionNames": [
      "generateEvidenceExplanation",
      "generateMainFinding",
      "generateStatisticalExplanation",
      "generateQualityExplanation",
      "generateApplicabilityExplanation",
      "generateLimitationsExplanation",
      "generateDerivationExplanation",
      "generateNarrative",
      "formatTraits",
      "formatSignificance",
      "formatEffectDirection",
      "calculateVariance"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-evidence-engine/OutcomeEvidenceEngine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome tracking, feedback processing, learning, calibration, or performance evaluation.",
    "classNames": [
      "OutcomeEvidenceEngine"
    ],
    "functionNames": [
      "createOutcomeEvidenceEngine",
      "generateQuickEvidence",
      "batchComparePaths",
      "getConfig",
      "updateConfig",
      "generateEvidence",
      "generatePathComparison",
      "generateTraitPredictor",
      "queryEvidence",
      "explainEvidence",
      "explainDerivation",
      "summarizeEvidence"
    ],
    "dependencies": [
      "null",
      "OutcomeEvidence[]",
      "OutcomeEvidenceEngineConfig",
      "void",
      "GenerateEvidenceOutput"
    ],
    "consumers": [
      "../outcome-tracking-engine/OutcomeTrackingEngineV1.js",
      "../types/index.js",
      "./types.js",
      "./analysis.js",
      "./explanations.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/confidence-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "CalibrationBins",
      "ECECalculator",
      "BiasDetector",
      "TrendAnalyzer",
      "ConfidenceCalibrationEngine"
    ],
    "functionNames": [
      "createConfidenceCalibrationEngine",
      "createCalibrationEntry",
      "initializeBins",
      "getBin",
      "addEntry",
      "calculateActualRates",
      "calculateGaps",
      "getBins",
      "getBinById",
      "getTotalEntries",
      "clear",
      "calculate"
    ],
    "dependencies": [
      "./learning-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/decision-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "DecisionQualityAssessor",
      "RegretAnalyzer",
      "OpportunityAnalyzer",
      "PatternAnalyzer",
      "DecisionLearningEngine"
    ],
    "functionNames": [
      "createDecisionLearningEngine",
      "createDecisionLearningEntry",
      "assess",
      "calculateScore",
      "analyze",
      "identifyRegretCauses",
      "isPreventable",
      "calculateRegretRate",
      "calculateAverageIntensity",
      "calculatePreventableRate",
      "identifyTopCauses",
      "calculateMissedRate"
    ],
    "dependencies": [
      "./learning-types.js",
      "../outcome-tracking/outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/feedback-ingestion-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "FeedbackValidator",
      "SignalExtractor",
      "InsightExtractor",
      "FeedbackIngestionEngine"
    ],
    "functionNames": [
      "createFeedbackIngestionEngine",
      "createRawFeedback",
      "outcomeEventToFeedback",
      "validate",
      "calculateQuality",
      "extract",
      "extractRecommendationSignals",
      "extractDecisionSignals",
      "extractGrowthSignals",
      "extractOutcomeSignals",
      "extractConfidenceSignals",
      "extractGenericSignals"
    ],
    "dependencies": [
      "./learning-types.js",
      "../outcome-tracking/outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/learning-report-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "LearningVelocityCalculator",
      "KnowledgeGrowthCalculator",
      "AccuracyImprovementCalculator",
      "PredictorPerformanceTracker",
      "InsightGenerator",
      "LearningReportEngine"
    ],
    "functionNames": [
      "createLearningReportEngine",
      "calculate",
      "calculateAccuracy",
      "record",
      "getStrongest",
      "getWeakest",
      "getImproving",
      "getDeclining",
      "getAll",
      "clear",
      "generate",
      "generatePatternInsight"
    ],
    "dependencies": [
      "./learning-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/learning-signal-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "SignalProcessor",
      "SignalGenerator",
      "LearningApplier",
      "LearningSignalEngine"
    ],
    "functionNames": [
      "createLearningSignalEngine",
      "process",
      "processBatch",
      "prioritize",
      "generate",
      "enhanceSignal",
      "calculateLearningPotential",
      "generateAggregate",
      "groupByEngine",
      "createAggregateSignal",
      "apply",
      "calculatePositiveAdjustment"
    ],
    "dependencies": [
      "./learning-types.js",
      "../outcome-tracking/outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/outcome-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "OutcomeLearningEngine"
    ],
    "functionNames": [
      "createOutcomeLearningEngine",
      "getConfig",
      "updateConfig",
      "ingestFeedback",
      "ingestFeedbackBatch",
      "ingestOutcomeEvent",
      "learnFromOutcomes",
      "calibrateConfidence",
      "updateWeights",
      "generateLearningReport",
      "generateRecommendationReport",
      "generateDecisionReport"
    ],
    "dependencies": [
      "./learning-types.js",
      "../outcome-tracking/outcome-types.js",
      "./feedback-ingestion-engine.js",
      "./recommendation-learning-engine.js",
      "./decision-learning-engine.js",
      "./confidence-calibration-engine.js",
      "./outcome-weight-engine.js",
      "./learning-signal-engine.js",
      "./learning-report-engine.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/outcome-weight-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "CorrelationCalculator",
      "WeightUpdater",
      "PredictivePowerCalculator",
      "StabilityCalculator",
      "OutcomeWeightEngine"
    ],
    "functionNames": [
      "createOutcomeWeightEngine",
      "calculatePearson",
      "calculateSuccessCorrelation",
      "calculateSatisfactionCorrelation",
      "updateWeight",
      "calculateConfidence",
      "calculate",
      "determineTrend",
      "initializeWeights",
      "updateWeights",
      "recalculateImportance",
      "getCurrentModel"
    ],
    "dependencies": [
      "'STABLE' \\"
    ],
    "consumers": [
      "'DECREASING'",
      "void",
      "OutcomeWeightModel"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-learning/recommendation-learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Learning loop or active learning behavior from feedback, uncertainty, or outcomes.",
    "classNames": [
      "AccuracyCalculator",
      "UtilityCalculator",
      "StabilityCalculator",
      "ImpactCalculator",
      "InsightGenerator",
      "RecommendationLearningEngine"
    ],
    "functionNames": [
      "createRecommendationLearningEngine",
      "createRecommendationLearningEntry",
      "calculateOverall",
      "calculateByCareer",
      "calculateBySegment",
      "calculateTrend",
      "calculateChosenRate",
      "calculateSatisfactionRate",
      "calculateSuccessRate",
      "calculateStability",
      "calculateVolatility",
      "calculatePositiveImpact"
    ],
    "dependencies": [
      "'STABLE' \\"
    ],
    "consumers": [
      "'DECLINING'",
      "string[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-modeling/OutcomeModelingEngine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome tracking, feedback processing, learning, calibration, or performance evaluation.",
    "classNames": [
      "OutcomeModelingEngine"
    ],
    "functionNames": [
      "calculateRange",
      "createConfidenceInterval",
      "calculateIncomeVolatility",
      "calculateOptionalityVolatility",
      "generateIncomeFactors",
      "generateOptionalityFactors",
      "generateRegretFactors",
      "generateCoalitionStabilityFactors",
      "generateSatisfactionFactors",
      "createOutcomeModelingEngine",
      "modelOutcomes",
      "modelIncomeRanges"
    ],
    "dependencies": [
      "../future-scenario/FutureScenarioGeneratorV1.js",
      "../types/index.js",
      "../decision-coalition-v3/DecisionCoalitionEngineV3.js",
      "../criticality-engine/CriticalityEngineV1.js",
      "../optionality-engine/OptionalityEngineV1.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking-engine/OutcomeTrackingEngineV1.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "OutcomeTrackingEngineV1"
    ],
    "functionNames": [
      "createOutcomeRecord",
      "generateOutcomeRecordId",
      "hashStudentId",
      "createOutcomeSnapshot",
      "generateSnapshotId",
      "calculateCompleteness",
      "calculateDataQuality",
      "recordAction",
      "generateActionId",
      "aggregateOutcomes",
      "calculateMedian",
      "createOutcomeTrackingEngine"
    ],
    "dependencies": [
      "../types/index.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-comparison-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "ComparisonEngine"
    ],
    "functionNames": [
      "createComparisonEngine",
      "comparePrediction",
      "calculateAccuracy",
      "assessRecommendation",
      "comparePredictionToReality",
      "calculateAccuracyMetrics",
      "assessRecommendationAccuracy",
      "analyzePredictionErrors",
      "analyzeBias",
      "analyzeCalibration",
      "compareRecommendationsToOutcomes",
      "compareAcrossTimepoints"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-event-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "OutcomeEventEngine",
      "BatchedEventEmitter",
      "EventReplay"
    ],
    "functionNames": [
      "generateEventId",
      "generateTraceId",
      "createOutcomeRecordedEvent",
      "createGrowthMeasuredEvent",
      "createPredictionMadeEvent",
      "createPredictionValidatedEvent",
      "createComparisonGeneratedEvent",
      "createQualityAssessedEvent",
      "createSignalGeneratedEvent",
      "createTimelineUpdatedEvent",
      "createOutcomeEventEngine",
      "createBatchedEmitter"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-quality-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "QualityEngine"
    ],
    "functionNames": [
      "createQualityEngine",
      "assessQuality",
      "classify",
      "assessOutcomeQuality",
      "classifyOutcome",
      "calculateHolisticScore",
      "assessQualityFactors",
      "detectPatterns",
      "generateLongTermProjection",
      "generateHolisticAssessment",
      "assessCareerSuccess",
      "assessEducationSuccess"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-store.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "InMemoryOutcomeStore",
      "LocalStorageOutcomeStore",
      "CachedOutcomeStore",
      "ValidatedOutcomeStore",
      "EncryptedOutcomeStore"
    ],
    "functionNames": [
      "createInMemoryStore",
      "createLocalStorageStore",
      "createCachedStore",
      "createValidatedStore",
      "createEncryptedStore",
      "createDefaultStore",
      "migrateStore",
      "exportStore",
      "importStore",
      "save",
      "load",
      "loadByStudent"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-timeline-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "TimelineEngine"
    ],
    "functionNames": [
      "createTimelineEngine",
      "buildTimeline",
      "generateTimelineSummary",
      "generateMentorNarrative",
      "addEvent",
      "getEventsByType",
      "getEventsByTimeRange",
      "buildSegments",
      "extractMilestones",
      "generateSummary",
      "compareTimelines",
      "filterTimeline"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-tracker.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "OutcomeTracker"
    ],
    "functionNames": [
      "generateRecordId",
      "generateTimelineEntryId",
      "generateGrowthSnapshotId",
      "createOutcomeTracker",
      "startTracking",
      "recordCareerDecisionOutcome",
      "recordEducationOutcome",
      "recordSkillOutcome",
      "recordInternshipOutcome",
      "recordJobOutcome",
      "recordExplorationOutcome",
      "measureGrowth"
    ],
    "dependencies": [
      "./outcome-types.js",
      "../types/index.js",
      "../../assessment/assessment-types.js",
      "../../recommendation/recommendation-types.js",
      "./outcome-event-engine.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/outcome-tracking-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "LearningSignalEngine",
      "AnalyticsEngine",
      "OutcomeTrackingEngine"
    ],
    "functionNames": [
      "createOutcomeTrackingEngine",
      "generateSignal",
      "processSignal",
      "getPendingSignals",
      "getSignalsByEngine",
      "storeSignal",
      "generatePredictionSignal",
      "generateOutcomeSignal",
      "generateGrowthSignal",
      "aggregateOutcomes",
      "calculateAnalytics",
      "initializeTracking"
    ],
    "dependencies": [
      "null",
      "void",
      "LearningSignal[]",
      "Promise<OutcomeAggregation>",
      "Promise<OutcomeAnalytics>"
    ],
    "consumers": [
      "./outcome-types.js",
      "../types/index.js",
      "../../assessment/assessment-types.js",
      "../../recommendation/recommendation-types.js",
      "./outcome-event-engine.js",
      "./outcome-store.js",
      "./outcome-tracker.js",
      "./outcome-timeline-engine.js",
      "./outcome-comparison-engine.js",
      "./outcome-quality-engine.js",
      "./student-growth-engine.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/outcome-tracking/student-growth-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "intelligence",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "StudentGrowthEngine"
    ],
    "functionNames": [
      "createStudentGrowthEngine",
      "createInitialGrowthProfile",
      "generateGrowthReport",
      "calculateGrowth",
      "createSnapshot",
      "updateProfile",
      "identifyGrowthPatterns",
      "analyzeTrajectory",
      "detectPattern",
      "generateReport",
      "compareToPeers",
      "generateInsights"
    ],
    "dependencies": [
      "./outcome-types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/outcome-ontology/builders.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "ontology",
    "purpose": "Outcome dimension/metric/scoring behavior for learning and evaluation.",
    "classNames": [
      "MetricMeasurementBuilder",
      "OutcomeAssessmentBuilder",
      "BatchMeasurementBuilder"
    ],
    "functionNames": [
      "createMeasurement",
      "createAssessment",
      "createMeasurementsFromRecord",
      "forMetric",
      "forMetricId",
      "withRawValue",
      "withNormalizedScore",
      "atHorizon",
      "withConfidence",
      "fromSource",
      "withNotes",
      "measuredAt"
    ],
    "dependencies": [
      "ontology/outcome-ontology/OutcomeMetric.ts",
      "ontology/outcome-ontology/OutcomeDimension.ts",
      "ontology/outcome-ontology/OutcomeScoringFramework.ts",
      "ontology/outcome-ontology/validators.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/outcome-ontology/OutcomeDimension.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "ontology",
    "purpose": "Outcome dimension/metric/scoring behavior for learning and evaluation.",
    "classNames": [],
    "functionNames": [
      "calculateDimensionScore",
      "createEmptyDimensionScore",
      "calculateMedian",
      "clampScore",
      "scoreToBand",
      "getDimensionByCategory",
      "getAllDimensions"
    ],
    "dependencies": [
      "ontology/outcome-ontology/OutcomeMetric.ts"
    ],
    "consumers": [
      "ontology/outcome-ontology/builders.ts",
      "ontology/outcome-ontology/OutcomeScoringFramework.ts",
      "ontology/outcome-ontology/validators.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/outcome-ontology/OutcomeScoringFramework.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "ontology",
    "purpose": "Outcome dimension/metric/scoring behavior for learning and evaluation.",
    "classNames": [
      "OutcomeScoringFramework"
    ],
    "functionNames": [
      "scoreToBand",
      "normalizeValue",
      "createMetricMeasurement",
      "createScoringFramework",
      "getConfiguration",
      "updateConfiguration",
      "calculateAssessment",
      "calculateAllDimensionScores",
      "calculateOverallScore",
      "getDimensionWeights",
      "calculateConfidence",
      "performAnalysis"
    ],
    "dependencies": [
      "ontology/outcome-ontology/OutcomeMetric.ts",
      "ontology/outcome-ontology/OutcomeDimension.ts"
    ],
    "consumers": [
      "ontology/outcome-ontology/builders.ts",
      "ontology/outcome-ontology/validators.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/ontology/outcome-ontology/validators.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "ontology",
    "purpose": "Outcome dimension/metric/scoring behavior for learning and evaluation.",
    "classNames": [],
    "functionNames": [
      "isValidOutcomeScore",
      "isValidOutcomeWeight",
      "isValidOutcomeId",
      "isValidTimeHorizon",
      "isValidConfidenceLevel",
      "isValidOutcomeCategory",
      "isValidMetricType",
      "isValidOptimizationDirection",
      "isValidAggregationMethod",
      "isValidScoreBand",
      "validateOutcomeMetric",
      "validateOutcomeDimension"
    ],
    "dependencies": [
      "ontology/outcome-ontology/OutcomeMetric.ts",
      "ontology/outcome-ontology/OutcomeDimension.ts",
      "ontology/outcome-ontology/OutcomeScoringFramework.ts"
    ],
    "consumers": [
      "ontology/outcome-ontology/builders.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/action-tracker.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "ActionTracker"
    ],
    "functionNames": [
      "track",
      "getEvent",
      "getEventsForStudent",
      "getEventsForDecisionEvent",
      "getEventsByProgressStatus",
      "getEventsByStage",
      "getAllMilestones",
      "getStatistics",
      "getActionCompletionStats",
      "generateEventId"
    ],
    "dependencies": [
      "null>",
      "Promise<ActionEvent[]>",
      "Promise<Milestone[]>",
      "Promise<",
      "TrackingEventId"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/cohort-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "CohortEngineImpl"
    ],
    "functionNames": [
      "createCohort",
      "generateMembershipRules",
      "findCohortsForStudent",
      "analyzeCohort",
      "getCohort",
      "updateCohortMembership",
      "compareCohorts",
      "getStudentCohortInsights",
      "initializePredefinedCohorts",
      "calculateCohortMatch",
      "generateDimensionBreakdowns",
      "generateTrendAnalysis"
    ],
    "dependencies": [
      "null>",
      "Promise<Cohort>"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts",
      "outcome-tracking/types/cohort-engine-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/confidence-calibration-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "ConfidenceCalibrationEngineImpl"
    ],
    "functionNames": [
      "analyzeCalibration",
      "generateReport",
      "applyAdjustments",
      "getCalibrationStatus",
      "predictConfidence",
      "updateWithOutcome",
      "getAllDimensions",
      "getCalibrationData",
      "calculateDimensionMetrics",
      "calculateOverallMetrics",
      "analyzeBias",
      "analyzeReliability"
    ],
    "dependencies": [
      "outcome-tracking/types/outcome-tracking-types.ts",
      "outcome-tracking/types/confidence-calibration-types.ts"
    ],
    "consumers": [
      "outcome-tracking/engines/outcome-tracking-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/decision-tracker.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "DecisionTracker"
    ],
    "functionNames": [
      "track",
      "getEvent",
      "getEventsForStudent",
      "getEventsForRecommendationEvent",
      "getEventsByConfidenceRange",
      "getAcceptedRecommendations",
      "getRejectedRecommendations",
      "getStatistics",
      "calculateAverageDecisionTimeframe",
      "generateEventId"
    ],
    "dependencies": [
      "null>",
      "Promise<DecisionEvent[]>",
      "Promise<",
      "string",
      "TrackingEventId"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/feedback-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "FeedbackEngine"
    ],
    "functionNames": [
      "analyzeDecision",
      "analyzeOutcome",
      "getAnalysis",
      "getAnalysesForEvent",
      "getStatistics",
      "extractDecisionFindings",
      "extractOutcomeFindings",
      "generateDecisionRecommendations",
      "generateOutcomeRecommendations",
      "analyzeDecisionSentiment",
      "analyzeOutcomeSentiment"
    ],
    "dependencies": [
      "null>",
      "Promise<FeedbackAnalysis[]>",
      "Promise<",
      "FeedbackFinding[]",
      "FeedbackRecommendation[]"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/learning-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "LearningEngineImpl"
    ],
    "functionNames": [
      "getConfidenceValue",
      "learnPatterns",
      "generateInsights",
      "validatePatterns",
      "getActivePatterns",
      "applyPatterns",
      "updateWithNewRecord",
      "filterRecords",
      "filter",
      "discoverPatterns",
      "discoverPatternsOfType",
      "discoverArchetypePatterns"
    ],
    "dependencies": [
      "outcome-tracking/types/outcome-tracking-types.ts",
      "outcome-tracking/types/learning-engine-types.ts",
      "outcome-tracking/types/cohort-engine-types.ts"
    ],
    "consumers": [
      "outcome-tracking/engines/outcome-tracking-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/outcome-tracker.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "OutcomeTracker"
    ],
    "functionNames": [
      "calculateAverage",
      "getScore",
      "track",
      "getEvent",
      "getEventsForStudent",
      "getEventsForActionEvent",
      "getEventsByAchievement",
      "getEventsBySatisfactionRange",
      "getEventsByRegretRange",
      "getStatistics",
      "getDimensionStatistics",
      "getOutcomeDistribution"
    ],
    "dependencies": [
      "null>",
      "Promise<OutcomeEvent[]>",
      "Promise<",
      "Promise<Array<"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/outcome-tracking-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "OutcomeTrackingEngine"
    ],
    "functionNames": [
      "trackRecommendation",
      "trackDecision",
      "trackAction",
      "trackOutcome",
      "getOutcomeRecord",
      "getStudentOutcomes",
      "getRecommendationOutcomes",
      "learnPatterns",
      "generateInsights",
      "generateCalibrationReport",
      "getCalibrationStatus",
      "generateQualityReport"
    ],
    "dependencies": [
      "null>",
      "Promise<OutcomeRecord[]>",
      "Promise<PatternLearningResult>",
      "Promise<InsightGenerationResult>",
      "Promise<CalibrationReport>"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts",
      "recommendation/recommendation-types.ts",
      "outcome-tracking/types/learning-engine-types.ts",
      "outcome-tracking/types/confidence-calibration-types.ts",
      "outcome-tracking/types/recommendation-quality-types.ts",
      "outcome-tracking/types/cohort-engine-types.ts",
      "outcome-tracking/types/privacy-aggregation-types.ts",
      "outcome-tracking/engines/recommendation-tracker.ts",
      "outcome-tracking/engines/decision-tracker.ts",
      "outcome-tracking/engines/action-tracker.ts",
      "outcome-tracking/engines/outcome-tracker.ts",
      "outcome-tracking/engines/feedback-engine.ts",
      "outcome-tracking/engines/learning-engine.ts",
      "outcome-tracking/engines/confidence-calibration-engine.ts",
      "outcome-tracking/engines/recommendation-quality-engine.ts",
      "outcome-tracking/engines/cohort-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/privacy-aggregation-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "PrivacyAggregationEngineImpl"
    ],
    "functionNames": [
      "aggregateData",
      "executeQuery",
      "analyzeCohort",
      "compareCohorts",
      "generateInsights",
      "validatePrivacyCompliance",
      "applyDifferentialPrivacy",
      "validateRequestPrivacy",
      "retrieveRawData",
      "aggregateDimension",
      "calculateAggregateMetrics",
      "calculateBinEdges"
    ],
    "dependencies": [
      "outcome-tracking/types/cohort-engine-types.ts",
      "outcome-tracking/types/privacy-aggregation-types.ts"
    ],
    "consumers": [
      "outcome-tracking/engines/outcome-tracking-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/recommendation-quality-engine.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "RecommendationQualityEngineImpl"
    ],
    "functionNames": [
      "calculateAccuracy",
      "analyzeQuality",
      "generateReport",
      "getQualityByType",
      "trackTrends",
      "identifyIssues",
      "findOpportunities",
      "updateWithOutcome",
      "calculateOverallAccuracy",
      "classifyAccuracy",
      "calculateSimulationAccuracy",
      "filterAccuracyRecords"
    ],
    "dependencies": [
      "recommendation/recommendation-types.ts",
      "outcome-tracking/types/outcome-tracking-types.ts",
      "outcome-tracking/types/recommendation-quality-types.ts"
    ],
    "consumers": [
      "outcome-tracking/engines/outcome-tracking-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/outcome-tracking/engines/recommendation-tracker.ts",
    "owner": "OutcomeTrackerAuthority",
    "capability": "LEARN",
    "domain": "outcome-tracking",
    "purpose": "Outcome event tracking, event chaining, cohorting, privacy aggregation, quality, or learning.",
    "classNames": [
      "RecommendationTracker"
    ],
    "functionNames": [
      "track",
      "getEvent",
      "getEventsForStudent",
      "getEventsForRecommendation",
      "getEventsInRange",
      "getStatistics",
      "generateEventId"
    ],
    "dependencies": [
      "null>",
      "Promise<RecommendationEvent[]>",
      "Promise<",
      "TrackingEventId"
    ],
    "consumers": [
      "outcome-tracking/types/outcome-tracking-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-calculator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "ArchetypeCalculator"
    ],
    "functionNames": [
      "createSignalCollection",
      "mergeSignalCollections",
      "filterSignalsBySource",
      "createArchetypeCalculator",
      "calculateScores",
      "calculateSingleScore",
      "calculateConfidence",
      "determinePrimarySecondary",
      "calculateOverallConfidence",
      "determineReliability",
      "validateScores",
      "getConfig"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-types.ts"
    ],
    "consumers": [
      "archetype/archetype-detection-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-confidence-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "ArchetypeConfidenceEngine"
    ],
    "functionNames": [
      "createArchetypeConfidenceEngine",
      "quickConfidenceCheck",
      "calculateConfidence",
      "createFallbackConfidence",
      "analyzeStability",
      "trackEvidence",
      "analyzeSeparation",
      "analyzeConsistency",
      "analyzeCoverage",
      "analyzeCompleteness",
      "validateConfidence",
      "generateRecommendations"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-types.ts",
      "archetype/confidence-types.ts",
      "./confidence-calculator",
      "archetype/stability-engine.ts",
      "archetype/evidence-engine.ts",
      "intelligence/confidence/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-detection-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "ArchetypeDetectionEngine"
    ],
    "functionNames": [
      "createArchetypeDetectionEngine",
      "detectArchetypes",
      "ensureAllArchetypes",
      "getArchetypeScore",
      "getArchetypeSignals",
      "getTopArchetypes",
      "compareProfiles",
      "getConfig",
      "updateConfig"
    ],
    "dependencies": [
      "undefined",
      "ArchetypeSignalCollection \\"
    ],
    "consumers": [
      "undefined",
      "import('@/types/archetype-profile').ArchetypeScore[]"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-explanation-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "ArchetypeExplanationEngine"
    ],
    "functionNames": [
      "createArchetypeExplanationEngine",
      "generateQuickExplanation",
      "generateExplanation",
      "generateConfidenceExplanation",
      "generateConfidenceSummary",
      "identifyHighConfidenceReasons",
      "identifyLowConfidenceReasons",
      "generateEvidenceSummary",
      "generateImprovementRecommendations",
      "explainArchetype",
      "compareArchetypes"
    ],
    "dependencies": [
      "undefined",
      "ExplanationResult",
      "ConfidenceExplanation",
      "string",
      "string[]"
    ],
    "consumers": [
      "types/archetype-profile.ts",
      "archetype/archetype-types.ts",
      "archetype/confidence-types.ts",
      "archetype/archetype-explanation-types.ts",
      "archetype/archetype-strength-engine.ts",
      "archetype/archetype-risk-engine.ts",
      "archetype/archetype-narrative-engine.ts",
      "archetype/archetype-insights-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-insights-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "InsightsEngine"
    ],
    "functionNames": [
      "createInsightsEngine",
      "generateEnvironmentAnalysis",
      "generateCombinedEnvironmentAnalysis",
      "generateCareerImplications",
      "generateCombinedCareerImplications",
      "generateActionableInsights"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-explanation-types.ts"
    ],
    "consumers": [
      "archetype/archetype-explanation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-mapper.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "ArchetypeMapper"
    ],
    "functionNames": [
      "createArchetypeMapper",
      "mapToSignals",
      "mapExplicitPreferences",
      "inferArchetypeFromText",
      "groupSignalsByArchetype",
      "createSignalCollection",
      "applyModifiers"
    ],
    "dependencies": [
      "undefined",
      "ArchetypeSignalCollection"
    ],
    "consumers": [
      "types/archetype-profile.ts",
      "archetype/archetype-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-narrative-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "NarrativeEngine"
    ],
    "functionNames": [
      "createNarrativeEngine",
      "generateSingleArchetypeExplanation",
      "generateMixedArchetypeExplanation",
      "generateIntegratedDescription",
      "generateGenericCombination",
      "generateSummary",
      "getTemplate",
      "compareNarratives"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-explanation-types.ts"
    ],
    "consumers": [
      "archetype/archetype-explanation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-risk-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "RiskEngine"
    ],
    "functionNames": [
      "createRiskEngine",
      "generateRisks",
      "generateCombinedRisks",
      "identifyMitigatedRisks",
      "mergeAndFilter",
      "getTopRisks",
      "compareRisks"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-explanation-types.ts"
    ],
    "consumers": [
      "archetype/archetype-explanation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/archetype-strength-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "StrengthEngine"
    ],
    "functionNames": [
      "createStrengthEngine",
      "generateStrengths",
      "generateCombinedStrengths",
      "getTopStrengths",
      "compareStrengths"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-explanation-types.ts"
    ],
    "consumers": [
      "archetype/archetype-explanation-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/evidence-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "EvidenceEngine"
    ],
    "functionNames": [
      "createEvidenceEngine",
      "calculateEvidenceScore",
      "signalsToEvidence",
      "createCollections",
      "createCollection",
      "groupByArchetype",
      "countByQuality",
      "countBySource",
      "calculateWeightedScore",
      "calculateDiversityScore",
      "calculateStrengthScore",
      "calculateOverallScore"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/archetype-types.ts",
      "archetype/confidence-types.ts"
    ],
    "consumers": [
      "archetype/archetype-confidence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/archetype/stability-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "archetype",
    "purpose": "Archetype inference, scoring, evidence, stability, insight, or explanation behavior.",
    "classNames": [
      "StabilityEngine"
    ],
    "functionNames": [
      "createStabilityEngine",
      "quickStabilityCheck",
      "analyzeStability",
      "calculateSensitivity",
      "identifyRobustnessIndicators",
      "identifyVulnerabilities",
      "findConflictingSignals",
      "calculateConfidenceInterval",
      "identifyChangeScenarios",
      "analyzeSeparation",
      "analyzeConsistency",
      "groupSignalsBySource"
    ],
    "dependencies": [
      "types/archetype-profile.ts",
      "archetype/confidence-types.ts"
    ],
    "consumers": [
      "archetype/archetype-confidence-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/assessment-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "AssessmentEngine"
    ],
    "functionNames": [
      "createAssessmentEngine",
      "getScore",
      "processResponses",
      "extractSignals",
      "calculateDimensionScores",
      "calculateAssessmentConfidence",
      "generateStudentProfile",
      "identifyTopStrengths",
      "identifySupportingStrengths",
      "identifyDevelopmentAreas"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "types/student-life-profile.ts",
      "assessment/signal-extractor.ts",
      "assessment/dimension-scorer.ts",
      "assessment/confidence-calculator.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/confidence-calculator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "ConfidenceCalculator"
    ],
    "functionNames": [
      "createConfidenceCalculator",
      "calculateConfidence",
      "calculateConsistencyScore",
      "calculateQuestionCountScore",
      "calculateVarianceScore",
      "calculateCoverageScore",
      "groupByCategory",
      "determineConfidenceLevel",
      "meetsThreshold"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "intelligence/confidence/index.ts"
    ],
    "consumers": [
      "assessment/assessment-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/dimension-scorer.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "DimensionScorer"
    ],
    "functionNames": [
      "createDimensionScorer",
      "calculateDimensionScores",
      "calculateSingleDimension",
      "groupSignalsByDimension",
      "calculateWeightedAverage",
      "calculateDimensionConfidence",
      "calculateConsistency",
      "getDimensionScore"
    ],
    "dependencies": [
      "assessment/assessment-types.ts"
    ],
    "consumers": [
      "assessment/assessment-engine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/questions/question-generator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "QuestionGenerator"
    ],
    "functionNames": [
      "createQuestionGenerator",
      "generateQuestions",
      "validateGeneratedQuestions",
      "buildPrompt",
      "estimateBehavioralScore",
      "estimateClarityScore",
      "estimateSpecificityScore",
      "calculateSimilarity"
    ],
    "dependencies": [
      "assessment/assessment-types.ts",
      "assessment/questions/question-categories.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/questions/question-selection-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "QuestionSelectionEngine"
    ],
    "functionNames": [
      "createQuestionSelectionEngine",
      "selectQuestions",
      "selectQuestionsWithConfig",
      "selectByCategoryMinimum",
      "selectByDimensionCoverage",
      "selectFillQuestions",
      "selectBestQuestions",
      "getDifficultyMultiplier",
      "optimizeOrdering",
      "buildResult",
      "estimateDifficulty",
      "generateQuickAssessment"
    ],
    "dependencies": [
      "assessment/questions/question-bank.ts",
      "assessment/questions/question-categories.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/questions/question-validator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "QuestionValidator"
    ],
    "functionNames": [
      "createQuestionValidator",
      "validateBank",
      "validateQuestion",
      "checkWeakWording",
      "checkLeadingWording",
      "checkSignalValue",
      "findDuplicates",
      "checkCategoryBalance",
      "checkDimensionCoverage",
      "determineSeverity",
      "calculateSummary",
      "calculateCategoryDistribution"
    ],
    "dependencies": [
      "'warning' \\"
    ],
    "consumers": [
      "'error'",
      "BankValidationResult['summary']"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/signal-extractor.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "SignalExtractor"
    ],
    "functionNames": [
      "createSignalExtractor",
      "extractSignals",
      "extractSignal",
      "extractLikertSignal",
      "extractMultipleChoiceSignal",
      "extractRankingSignal",
      "extractForcedChoiceSignal",
      "extractScaleSignal"
    ],
    "dependencies": [
      "null"
    ],
    "consumers": [
      "assessment/assessment-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/validation/assessment-validator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "AssessmentValidator"
    ],
    "functionNames": [
      "createAssessmentValidator",
      "validate",
      "buildDimensionScores",
      "identifyIssues",
      "generateRecommendations",
      "generateRetestRecommendation",
      "determineValidity",
      "quickValidate",
      "getSummary"
    ],
    "dependencies": [
      "assessment/validation/validation-types.ts",
      "assessment/validation/consistency-engine.ts",
      "assessment/validation/response-pattern-detector.ts",
      "assessment/validation/reliability-engine.ts",
      "assessment/validation/quality-score-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/validation/consistency-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "ConsistencyEngine"
    ],
    "functionNames": [
      "createConsistencyEngine",
      "analyzeConsistency",
      "detectContradictions",
      "isContradictory",
      "calculateContradictionImpact",
      "aggregateDimensionScores",
      "calculateConsistencyScore",
      "hasContradictions",
      "getContradictionsForDimension"
    ],
    "dependencies": [
      "assessment/validation/validation-types.ts"
    ],
    "consumers": [
      "assessment/validation/assessment-validator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/validation/quality-score-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "QualityScoreEngine"
    ],
    "functionNames": [
      "createQualityScoreEngine",
      "calculateQuality",
      "calculateCompletionRate",
      "calculateConsistency",
      "calculateCoverage",
      "calculateSignalStrength",
      "calculateResponseQuality",
      "calculateVariance",
      "getQualityLevel",
      "meetsThreshold",
      "getQualityDescription",
      "identifyQualityIssues"
    ],
    "dependencies": [
      "'MEDIUM' \\"
    ],
    "consumers": [
      "'HIGH'",
      "boolean",
      "string"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/validation/reliability-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "ReliabilityEngine"
    ],
    "functionNames": [
      "createReliabilityEngine",
      "calculateReliability",
      "calculateInternalConsistency",
      "calculateDimensionConfidence",
      "estimateStability",
      "calculateCoverageConfidence",
      "calculateProfileConfidence",
      "averageDimensionConfidence",
      "calculateVariance",
      "getReliabilityLevel",
      "meetsThreshold",
      "identifyWeakDimensions"
    ],
    "dependencies": [
      "'MEDIUM' \\"
    ],
    "consumers": [
      "'HIGH'",
      "boolean"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/assessment/validation/response-pattern-detector.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "assessment",
    "purpose": "Assessment or validation behavior that transforms responses/questions into student understanding.",
    "classNames": [
      "ResponsePatternDetector"
    ],
    "functionNames": [
      "createResponsePatternDetector",
      "analyzePatterns",
      "detectStraightLining",
      "detectRandomResponding",
      "detectSpeeding",
      "detectAnswerFatigue",
      "detectExtremeResponding",
      "detectMidpointResponding",
      "detectPatternRepetition",
      "analyzeDistribution",
      "calculateVariance",
      "calculatePatternScore"
    ],
    "dependencies": [
      "null",
      "ResponseDistribution",
      "number"
    ],
    "consumers": [
      "assessment/validation/validation-types.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/adaptive-mentor-foundation/analysis.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [],
    "functionNames": [
      "buildMentorContext",
      "buildCurrentStateSnapshot",
      "buildHistoricalPatterns",
      "detectContrasts",
      "buildActiveConsiderations",
      "buildGuidancePriorities",
      "generateInsights",
      "generateGrowthObservations",
      "generateDecisionWarnings"
    ],
    "dependencies": [
      "../types/index.js",
      "../longitudinal-intelligence-engine/types.js",
      "../value-evolution-engine/types.js",
      "../identity-development-engine/types.js",
      "../personal-growth-engine/types.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "BayesianBeliefEngine"
    ],
    "functionNames": [
      "createBayesianBeliefEngine",
      "updateStudentBeliefs",
      "processEvidenceEvent",
      "updateBeliefs",
      "processEvidence",
      "getBeliefHistory",
      "getConfidence",
      "checkContradictions",
      "generateNarrative",
      "getAttentionNeeded",
      "formatBeliefName",
      "generateUpdateId"
    ],
    "dependencies": [
      "null",
      "string",
      "BeliefUpdateId"
    ],
    "consumers": [
      "intelligence/bayesian-belief-engine/EvidenceWeightEngine.ts",
      "intelligence/bayesian-belief-engine/PosteriorCalculator.ts",
      "intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts",
      "intelligence/bayesian-belief-engine/ContradictionDetector.ts",
      "intelligence/bayesian-belief-engine/BeliefNarrativeEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "BeliefConfidenceEngine"
    ],
    "functionNames": [
      "createBeliefConfidenceEngine",
      "calculateConfidence",
      "calculateConfidences",
      "applyDecay",
      "calculateGrowthRate",
      "calculateDecayRate",
      "calculateStability",
      "getConfidenceLevel",
      "predictConfidence",
      "identifyAttentionNeeded",
      "generateInsight"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/BeliefNarrativeEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "BeliefNarrativeEngine"
    ],
    "functionNames": [
      "createBeliefNarrativeEngine",
      "generateNarrative",
      "generateSummary",
      "generateKeyChanges",
      "generateConfidenceInsights",
      "generateContradictionWarnings",
      "generateRecommendations",
      "generateBeliefNarrative",
      "generateComparisonNarrative"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/ContradictionDetector.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "ContradictionDetector"
    ],
    "functionNames": [
      "createContradictionDetector",
      "detectContradictions",
      "checkActionInconsistency",
      "checkStatementInconsistency",
      "checkTemporalInconsistency",
      "checkBehavioralInconsistency",
      "calculateContradictionScore",
      "generateSummary",
      "generateContradictionId"
    ],
    "dependencies": [
      "null",
      "number",
      "string"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/EvidenceWeightEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "EvidenceWeightEngine"
    ],
    "functionNames": [
      "createEvidenceWeightEngine",
      "calculateWeight",
      "calculateWeights",
      "getBaseWeight",
      "getSourceReliability",
      "calculateDurationMultiplier",
      "calculateConsistencyMultiplier",
      "calculateValidationMultiplier",
      "computeFinalWeight",
      "generateExplanation",
      "compareWeights",
      "getWeightCategory"
    ],
    "dependencies": [
      "'low' \\"
    ],
    "consumers": [
      "'moderate' \\"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/bayesian-belief-engine/PosteriorCalculator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student knowledge creation or refinement.",
    "classNames": [
      "PosteriorCalculator"
    ],
    "functionNames": [
      "createPosteriorCalculator",
      "calculatePosterior",
      "calculateLikelihood",
      "calculateEvidenceProbability",
      "updateConfidence",
      "calculateInitialBelief",
      "batchUpdate",
      "applyUpdate",
      "generateExplanation",
      "generateUpdateId",
      "generateBeliefId"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/identity-development-engine/detection.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [],
    "functionNames": [
      "extractSignalsFromBelief",
      "findArchetypesForStrength",
      "findArchetypesForValue",
      "findArchetypesForMotivation",
      "findArchetypesForTrait",
      "calculateArchetypeScores",
      "getSourceWeight",
      "getTypeWeight",
      "calculateIdentityConfidence",
      "generateConfidenceExplanation",
      "determineIdentityStatus",
      "detectConflicts"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/identity-development-engine/IdentityDevelopmentEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "IdentityDevelopmentEngine"
    ],
    "functionNames": [
      "createIdentityDevelopmentEngine",
      "quickIdentityAnalysis",
      "getArchetypeDefinition",
      "getArchetypeDisplayName",
      "getConfig",
      "updateConfig",
      "getArchetypeDefinitions",
      "analyze",
      "quickAnalyze",
      "getProfile",
      "getAllProfiles",
      "clearProfile"
    ],
    "dependencies": [
      "undefined",
      "string",
      "IdentityDevelopmentConfig",
      "void"
    ],
    "consumers": [
      "../types/index.js",
      "./types.js",
      "./detection.js"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/personal-growth-engine/analysis.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [],
    "functionNames": [
      "assessCurrentState",
      "assessDimension",
      "assessSkillGrowth",
      "assessConfidenceGrowth",
      "assessLeadershipGrowth",
      "assessCommunicationGrowth",
      "assessDecisionQualityGrowth",
      "calculateGrowthRate",
      "analyzeGaps",
      "calculateGap",
      "generateTrajectory",
      "generateDimensionTrajectory"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/personal-growth-engine/PersonalGrowthEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "PersonalGrowthEngine"
    ],
    "functionNames": [
      "createPersonalGrowthEngine",
      "quickGrowthAnalysis",
      "getDimensionDisplayName",
      "getGrowthDimensions",
      "getConfig",
      "updateConfig",
      "analyze",
      "quickAnalyze",
      "getCurrentState",
      "getPotential",
      "getGapAnalysis",
      "getTrajectory"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js",
      "./analysis.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/prospect-theory-engine/BiasDetectors.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "BiasDetector",
      "LossAversionDetector",
      "SocialConformityDetector",
      "StatusBiasDetector",
      "AuthorityInfluenceDetector",
      "RiskPerceptionEngine",
      "OptimismBiasDetector",
      "SunkCostDetector"
    ],
    "functionNames": [
      "createLossAversionDetector",
      "createSocialConformityDetector",
      "createStatusBiasDetector",
      "createAuthorityInfluenceDetector",
      "createRiskPerceptionEngine",
      "createOptimismBiasDetector",
      "createSunkCostDetector",
      "createSignal",
      "getBiasType",
      "detect",
      "analyzeRiskPerception",
      "detectSignals"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/prospect-theory-engine/ProspectTheoryEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/prospect-theory-engine/BiasExplanationEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "BiasExplanationEngine"
    ],
    "functionNames": [
      "createBiasExplanationEngine",
      "generateNarrative",
      "generateOverview",
      "generateBiasExplanations",
      "generateImpactExplanations",
      "generateRecommendations",
      "explainBiasImpact",
      "explainBias",
      "getBiasDisplayName",
      "describeDirection",
      "getBiasRecommendations",
      "generateProfileExplanation"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/prospect-theory-engine/ProspectTheoryEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/prospect-theory-engine/BiasImpactAnalysis.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "BiasImpactAnalysis"
    ],
    "functionNames": [
      "createBiasImpactAnalysis",
      "calculateImpacts",
      "calculateDistortion",
      "getBiasDistortion",
      "groupSignalsByType",
      "calculateBiasImpact",
      "describeManifestation",
      "identifyAffectedAspects",
      "determineDirection",
      "getSeverity",
      "calculateOverallDistortion",
      "getDistortionLevel"
    ],
    "dependencies": [],
    "consumers": [
      "intelligence/prospect-theory-engine/ProspectTheoryEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/prospect-theory-engine/ProspectTheoryEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "ProspectTheoryEngine"
    ],
    "functionNames": [
      "createProspectTheoryEngine",
      "analyzeBiases",
      "generateDistortionReport",
      "calculateScore",
      "analyze",
      "detectSignals",
      "buildProfile",
      "calculateDistortion",
      "explainBias",
      "analyzeRiskPerception",
      "getBiasSeverity",
      "getDistortionLevel"
    ],
    "dependencies": [
      "intelligence/prospect-theory-engine/BiasDetectors.ts",
      "intelligence/prospect-theory-engine/BiasImpactAnalysis.ts",
      "intelligence/prospect-theory-engine/BiasExplanationEngine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/similar-student-engine/calculators.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student similarity or peer-profile understanding.",
    "classNames": [],
    "functionNames": [
      "euclideanDistance",
      "distanceToSimilarity",
      "weightedAverage",
      "normalize",
      "calculatePsychologicalSimilarity",
      "comparePersonalityTraits",
      "compareMotivations",
      "compareStrengths",
      "compareValues",
      "calculateEconomicSimilarity",
      "compareIncomeBrackets",
      "calculateEducationalSimilarity"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/similar-student-engine/explanations.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student similarity or peer-profile understanding.",
    "classNames": [],
    "functionNames": [
      "generateExplanation",
      "generateSummary",
      "extractKeySimilarities",
      "extractKeyDifferences",
      "formatSimilarity",
      "formatDifference",
      "generateComparisonValue",
      "generateSuggestedInsights",
      "findStrongestDimension",
      "findWeakestDimension",
      "getTopMotivation",
      "generateSimpleExplanation"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/similar-student-engine/SimilarStudentEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student similarity or peer-profile understanding.",
    "classNames": [
      "SimilarStudentEngine"
    ],
    "functionNames": [
      "createSimilarStudentEngine",
      "quickSimilarity",
      "findSimilarStudentsQuick",
      "getConfig",
      "updateConfig",
      "findSimilarStudents",
      "analyzeSimilarity",
      "batchCompare",
      "findPeersForOutcomeLearning",
      "calculateSimilarityMatrix",
      "calculateSimilarityMatch",
      "adjustWeightsForPriority"
    ],
    "dependencies": [
      "../types/index.js",
      "./calculators.js",
      "./explanations.js",
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/student-model/StudentBelief.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student belief/model construction.",
    "classNames": [
      "StudentBeliefBuilder",
      "StudentBeliefQuery"
    ],
    "functionNames": [
      "createStudentBeliefFromAssessment",
      "queryStudentBelief",
      "addAssessmentAnswers",
      "addMotivation",
      "addStrength",
      "addValue",
      "addPersonalityTrait",
      "addLifestylePreference",
      "addConstraint",
      "markEngineContribution",
      "build",
      "processAnswer"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/mentor/MentorEngine.ts",
      "intelligence/recommendation-engine/RecommendationEngine.ts",
      "intelligence/regret-engine/RegretEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/student-model/StudentBeliefV3.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student belief/model construction.",
    "classNames": [
      "StudentBeliefV3Builder",
      "StudentBeliefV3Query"
    ],
    "functionNames": [
      "migrateV2ToV3",
      "inferFamilyRealityFromV2",
      "inferEconomicRealityFromV2",
      "inferEducationalRealityFromV2",
      "inferDecisionStateFromV2",
      "createStudentBeliefV3",
      "queryStudentBeliefV3",
      "isStudentBeliefV3",
      "addFamilyReality",
      "addEconomicReality",
      "addEducationalReality",
      "addDecisionState"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/student-model/StudentModelEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student belief/model construction.",
    "classNames": [
      "StudentModelEngine"
    ],
    "functionNames": [
      "createStudentModelEngine",
      "convertAssessmentToBelief",
      "createEmptyAssessment",
      "createMockResponse",
      "convertAssessment",
      "updateBelief",
      "getDebugLog",
      "initializeTraits",
      "processResponse",
      "calculateTimeConfidence",
      "finalizeTraits",
      "calculateOverallConfidence"
    ],
    "dependencies": [
      "intelligence/types/index.ts"
    ],
    "consumers": [
      "intelligence/decision-coalition/DecisionCoalitionEngine.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-evolution-engine/detection.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [],
    "functionNames": [
      "detectEvolutionPattern",
      "determinePattern",
      "countDirectionChanges",
      "calculateVariance",
      "calculateEvolutionConfidence",
      "createEmptyEvolution",
      "generateEvolutionExplanation",
      "detectValueShifts",
      "determineShiftSignificance",
      "inferShiftCauses",
      "generateShiftExplanation",
      "detectValueDrift"
    ],
    "dependencies": [
      "./types.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/intelligence/value-evolution-engine/ValueEvolutionEngine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "intelligence",
    "purpose": "Student values, identity, growth, risk, or bias understanding.",
    "classNames": [
      "ValueEvolutionEngine"
    ],
    "functionNames": [
      "createValueEvolutionEngine",
      "quickValueAnalysis",
      "createValueSnapshot",
      "getConfig",
      "updateConfig",
      "addSnapshot",
      "addSnapshots",
      "getHistory",
      "getSnapshots",
      "getLatestSnapshot",
      "getSnapshotsInRange",
      "clearHistory"
    ],
    "dependencies": [
      "../types/index.js",
      "./types.js",
      "./detection.js"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/profile/profile-generator.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "profile",
    "purpose": "Profile interpretation, synthesis, generation, or insight behavior.",
    "classNames": [
      "ProfileGenerator"
    ],
    "functionNames": [
      "createProfileGenerator",
      "generateProfile",
      "generateCompleteProfile",
      "buildConfidenceProfile",
      "getDimensionScore",
      "getDimensionConfidence"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "profile/profile-types.ts",
      "profile/profile-synthesizer.ts",
      "profile/profile-interpreter.ts",
      "profile/profile-insights-engine.ts"
    ],
    "consumers": [],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/profile/profile-insights-engine.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "profile",
    "purpose": "Profile interpretation, synthesis, generation, or insight behavior.",
    "classNames": [
      "ProfileInsightsEngine"
    ],
    "functionNames": [
      "createProfileInsightsEngine",
      "generateInsights",
      "identifyKeyAdvantages",
      "identifyGrowthAreas",
      "identifyIdealConditions",
      "identifyRiskFactors",
      "identifyDecisionStyle",
      "identifyLearningStyle",
      "buildConfidence"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "profile/profile-types.ts"
    ],
    "consumers": [
      "profile/profile-generator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/profile/profile-interpreter.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "profile",
    "purpose": "Profile interpretation, synthesis, generation, or insight behavior.",
    "classNames": [
      "ProfileInterpreter"
    ],
    "functionNames": [
      "createProfileInterpreter",
      "getScore",
      "generateInterpretation",
      "interpretCognitiveStyle",
      "interpretMotivation",
      "interpretWorkStyle",
      "interpretRiskProfile",
      "interpretValues",
      "identifyDetailedStrengths",
      "identifyDetailedWeaknesses",
      "determineArchetype",
      "confidenceToLevel"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "profile/profile-types.ts"
    ],
    "consumers": [
      "profile/profile-generator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  },
  {
    "modulePath": "src/profile/profile-synthesizer.ts",
    "owner": "StudentUnderstandingAuthority",
    "capability": "UNDERSTAND",
    "domain": "profile",
    "purpose": "Profile interpretation, synthesis, generation, or insight behavior.",
    "classNames": [
      "ProfileSynthesizer"
    ],
    "functionNames": [
      "createProfileSynthesizer",
      "getScore",
      "synthesizeCognitiveProfile",
      "synthesizeMotivationProfile",
      "synthesizeLifestyleProfile",
      "synthesizeRiskProfile",
      "synthesizeWorkEnvironmentProfile",
      "synthesizeValuesProfile",
      "identifyStrengths",
      "identifyWeaknesses",
      "synthesizeConstraints",
      "getDimensionScore"
    ],
    "dependencies": [
      "types/student-life-profile.ts",
      "profile/profile-types.ts"
    ],
    "consumers": [
      "profile/profile-generator.ts"
    ],
    "metadata": {
      "sourceDocument": "docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md",
      "sourceWave": "Wave 3.3",
      "status": "legacy-shadow"
    }
  }
] as const;
