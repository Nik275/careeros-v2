/**
 * CareerOS Decision Boundary Engine
 * 
 * Detects students near major decision boundaries.
 * These students provide the highest learning value because:
 * - They challenge our classification systems
 * - They reveal ambiguity in career categories
 * - They help us understand transition pathways
 * - They expose edge cases in our models
 * 
 * Example Boundaries:
 * - Design vs Engineering
 * - Medicine vs Biotechnology
 * - Government vs Startup
 * - Research vs Industry
 * - Technical vs Management
 */

import {
  DecisionBoundary,
  CareerCategory,
  BoundaryCharacteristics,
  BoundaryHistoricalData,
  BoundaryProximity,
  BoundaryStudent,
  BoundaryApproachStrategy,
  LearningValueScore,
  StudentProfile,
  DecisionBoundaryEngineConfig,
  ActiveLearningMetrics,
  UncertaintyProfile,
} from './active-learning-types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_DECISION_BOUNDARY_CONFIG: DecisionBoundaryEngineConfig = {
  boundaryDetectionThreshold: 0.4,
  minimumHistoricalData: 20,
  ambiguityThreshold: 0.35,
  maxBoundariesPerStudent: 3,
};

// ============================================================================
// PREDEFINED DECISION BOUNDARIES
// ============================================================================

export const PREDEFINED_BOUNDARIES: DecisionBoundary[] = [
  {
    id: 'design-vs-engineering',
    name: 'Design vs Engineering',
    description: 'Students who could thrive in either design-focused or engineering-focused roles',
    categoryA: {
      id: 'design',
      name: 'Design',
      traits: ['creative', 'visual', 'user-focused', 'iterative'],
      skills: ['ui_design', 'ux_research', 'visual_design', 'prototyping'],
      values: ['creativity', 'user_impact', 'aesthetics', 'craftsmanship'],
      workStyles: ['collaborative', 'feedback-driven', 'iterative'],
    },
    categoryB: {
      id: 'engineering',
      name: 'Engineering',
      traits: ['analytical', 'systematic', 'problem-solving', 'technical'],
      skills: ['programming', 'system_design', 'algorithms', 'architecture'],
      values: ['efficiency', 'scalability', 'reliability', 'innovation'],
      workStyles: ['independent', 'deep-work', 'structured'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.45,
      distinctionClarity: 0.6,
      transitionDifficulty: 0.5,
      commonConfusionPatterns: [
        'frontend_development',
        'product_design',
        'creative_technology',
        'design_systems',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.25,
      satisfactionDifferential: 0.15,
      outcomeVariance: 0.3,
    },
  },
  {
    id: 'medicine-vs-biotech',
    name: 'Medicine vs Biotechnology',
    description: 'Students choosing between clinical practice and biotech research/industry',
    categoryA: {
      id: 'medicine',
      name: 'Clinical Medicine',
      traits: ['patient-focused', 'diagnostic', 'empathetic', 'clinical'],
      skills: ['patient_care', 'diagnosis', 'medical_knowledge', 'communication'],
      values: ['patient_welfare', 'healing', 'service', 'expertise'],
      workStyles: ['high-pressure', 'structured', 'regulated', 'team-based'],
    },
    categoryB: {
      id: 'biotech',
      name: 'Biotechnology',
      traits: ['research-oriented', 'innovation-focused', 'technical', 'analytical'],
      skills: ['research_methods', 'lab_techniques', 'data_analysis', 'regulatory'],
      values: ['innovation', 'discovery', 'impact_at_scale', 'intellectual_challenge'],
      workStyles: ['research-driven', 'project-based', 'collaborative', 'iterative'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.35,
      distinctionClarity: 0.7,
      transitionDifficulty: 0.7,
      commonConfusionPatterns: [
        'medical_research',
        'clinical_trials',
        'healthcare_innovation',
        'precision_medicine',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.2,
      satisfactionDifferential: 0.2,
      outcomeVariance: 0.25,
    },
  },
  {
    id: 'government-vs-startup',
    name: 'Government vs Startup',
    description: 'Students choosing between public sector stability and startup dynamism',
    categoryA: {
      id: 'government',
      name: 'Government & Public Sector',
      traits: ['public-service', 'policy-oriented', 'stable', 'bureaucratic'],
      skills: ['policy_analysis', 'stakeholder_management', 'regulatory', 'public_communication'],
      values: ['public_good', 'stability', 'security', 'service'],
      workStyles: ['structured', 'hierarchical', 'process-driven', 'steady-paced'],
    },
    categoryB: {
      id: 'startup',
      name: 'Startup & Entrepreneurship',
      traits: ['risk-taking', 'fast-paced', 'adaptable', 'ownership'],
      skills: ['product_development', 'fundraising', 'growth_hacking', 'pivoting'],
      values: ['innovation', 'ownership', 'wealth_creation', 'impact'],
      workStyles: ['fast-paced', 'autonomous', 'ambiguous', 'high-intensity'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.25,
      distinctionClarity: 0.8,
      transitionDifficulty: 0.8,
      commonConfusionPatterns: [
        'public_private_partnership',
        'govtech',
        'social_enterprise',
        'policy_entrepreneurship',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.15,
      satisfactionDifferential: 0.3,
      outcomeVariance: 0.4,
    },
  },
  {
    id: 'research-vs-industry',
    name: 'Research vs Industry',
    description: 'Students choosing between academic research and industry application',
    categoryA: {
      id: 'research',
      name: 'Academic Research',
      traits: ['curiosity-driven', 'theoretical', 'deep-specialist', 'academic'],
      skills: ['research_methodology', 'publication', 'grant_writing', 'peer_review'],
      values: ['knowledge_creation', 'intellectual_freedom', 'discovery', 'teaching'],
      workStyles: ['self-directed', 'long-term', 'independent', 'depth-focused'],
    },
    categoryB: {
      id: 'industry',
      name: 'Industry Application',
      traits: ['practical', 'results-driven', 'business-aware', 'applied'],
      skills: ['product_development', 'business_strategy', 'execution', 'stakeholder_management'],
      values: ['practical_impact', 'financial_reward', 'market_success', 'team_achievement'],
      workStyles: ['deadline-driven', 'collaborative', 'results-oriented', 'fast-paced'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.4,
      distinctionClarity: 0.65,
      transitionDifficulty: 0.6,
      commonConfusionPatterns: [
        'industrial_research',
        'research_productization',
        'applied_research',
        'corporate_rd',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.22,
      satisfactionDifferential: 0.18,
      outcomeVariance: 0.28,
    },
  },
  {
    id: 'technical-vs-management',
    name: 'Technical vs Management Track',
    description: 'Students choosing between individual contributor and management paths',
    categoryA: {
      id: 'technical',
      name: 'Technical Individual Contributor',
      traits: ['hands-on', 'technical-expert', 'specialist', 'craft-focused'],
      skills: ['deep_technical_skills', 'architecture', 'coding', 'problem_solving'],
      values: ['technical_excellence', 'craftsmanship', 'deep_work', 'expertise'],
      workStyles: ['focused', 'individual', 'deep-work', 'technical'],
    },
    categoryB: {
      id: 'management',
      name: 'Management & Leadership',
      traits: ['people-focused', 'strategic', 'organizational', 'coaching'],
      skills: ['team_leadership', 'strategy', 'communication', 'conflict_resolution'],
      values: ['team_success', 'organizational_impact', 'people_development', 'vision'],
      workStyles: ['meeting-heavy', 'collaborative', 'strategic', 'people-focused'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.5,
      distinctionClarity: 0.55,
      transitionDifficulty: 0.4,
      commonConfusionPatterns: [
        'tech_lead',
        'engineering_manager',
        'principal_engineer',
        'architect',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.3,
      satisfactionDifferential: 0.12,
      outcomeVariance: 0.35,
    },
  },
  {
    id: 'creative-vs-analytical',
    name: 'Creative vs Analytical',
    description: 'Students balancing creative expression with analytical rigor',
    categoryA: {
      id: 'creative',
      name: 'Creative Fields',
      traits: ['artistic', 'expressive', 'intuitive', 'visual'],
      skills: ['creative_thinking', 'visual_expression', 'storytelling', 'ideation'],
      values: ['self_expression', 'originality', 'aesthetics', 'emotional_impact'],
      workStyles: ['inspirational', 'iterative', 'experimental', 'subjective'],
    },
    categoryB: {
      id: 'analytical',
      name: 'Analytical Fields',
      traits: ['logical', 'data-driven', 'systematic', 'objective'],
      skills: ['data_analysis', 'logical_reasoning', 'quantitative', 'research'],
      values: ['accuracy', 'objectivity', 'evidence', 'rationality'],
      workStyles: ['methodical', 'evidence-based', 'structured', 'objective'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.55,
      distinctionClarity: 0.5,
      transitionDifficulty: 0.45,
      commonConfusionPatterns: [
        'data_visualization',
        'creative_analytics',
        'design_research',
        'content_strategy',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.28,
      satisfactionDifferential: 0.1,
      outcomeVariance: 0.32,
    },
  },
  {
    id: 'local-vs-global',
    name: 'Local Impact vs Global Reach',
    description: 'Students choosing between local community impact and global opportunities',
    categoryA: {
      id: 'local',
      name: 'Local & Community Focus',
      traits: ['community-rooted', 'culturally-embedded', 'relationship-based', 'local'],
      skills: ['community_engagement', 'local_networks', 'cultural_knowledge', 'grassroots'],
      values: ['community_welfare', 'local_identity', 'relationships', 'cultural_preservation'],
      workStyles: ['place-based', 'relationship-driven', 'community-centered', 'local'],
    },
    categoryB: {
      id: 'global',
      name: 'Global & International',
      traits: ['globally-minded', 'cross-cultural', 'mobile', 'international'],
      skills: ['cross_cultural_communication', 'global_networks', 'languages', 'adaptability'],
      values: ['global_impact', 'diversity', 'mobility', 'international_experience'],
      workStyles: ['remote-friendly', 'travel-heavy', 'cross-cultural', 'global'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.3,
      distinctionClarity: 0.75,
      transitionDifficulty: 0.65,
      commonConfusionPatterns: [
        'glocal_roles',
        'regional_leadership',
        'diaspora_communities',
        'international_development',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.18,
      satisfactionDifferential: 0.22,
      outcomeVariance: 0.27,
    },
  },
  {
    id: 'specialist-vs-generalist',
    name: 'Specialist vs Generalist',
    description: 'Students choosing between deep specialization and broad versatility',
    categoryA: {
      id: 'specialist',
      name: 'Deep Specialist',
      traits: ['focused', 'expert', 'deep-diver', 'niche'],
      skills: ['deep_expertise', 'specialized_knowledge', 'technical_mastery', 'research'],
      values: ['excellence', 'mastery', 'depth', 'expert_recognition'],
      workStyles: ['focused', 'independent', 'deep-work', 'specialized'],
    },
    categoryB: {
      id: 'generalist',
      name: 'Broad Generalist',
      traits: ['versatile', 'adaptable', 'connector', 'multi-skilled'],
      skills: ['breadth_of_knowledge', 'cross_functional', 'adaptability', 'integration'],
      values: ['versatility', 'breadth', 'cross_pollination', 'adaptability'],
      workStyles: ['variety-seeking', 'cross-functional', 'context-switching', 'broad'],
    },
    boundaryCharacteristics: {
      overlapScore: 0.4,
      distinctionClarity: 0.6,
      transitionDifficulty: 0.5,
      commonConfusionPatterns: [
        't_shaped_skills',
        'hybrid_roles',
        'full_stack',
        'generalizing_specialist',
      ],
    },
    historicalData: {
      totalStudentsAtBoundary: 0,
      misclassificationRate: 0.24,
      satisfactionDifferential: 0.14,
      outcomeVariance: 0.3,
    },
  },
];

// ============================================================================
// BOUNDARY PROXIMITY CALCULATION
// ============================================================================

interface StudentFeatureVector {
  traits: Record<string, number>;
  skills: Record<string, number>;
  values: Record<string, number>;
  workStyles: Record<string, number>;
}

/**
 * Extract feature vector from student profile
 */
function extractStudentFeatures(studentProfile: StudentProfile): StudentFeatureVector {
  const traits: Record<string, number> = {};
  const skills: Record<string, number> = {};
  const values: Record<string, number> = {};
  const workStyles: Record<string, number> = {};
  
  // Extract traits from profile
  if (studentProfile.traits) {
    studentProfile.traits.forEach(trait => {
      traits[trait.toLowerCase()] = 1;
    });
  }
  
  // Extract skills from profile
  if (studentProfile.skills) {
    studentProfile.skills.forEach(skill => {
      skills[skill.toLowerCase()] = 1;
    });
  }
  
  // Extract values from profile
  if (studentProfile.values) {
    studentProfile.values.forEach(value => {
      values[value.toLowerCase()] = 1;
    });
  }
  
  // Extract work style preferences
  if (studentProfile.workPreferences) {
    studentProfile.workPreferences.forEach(pref => {
      workStyles[pref.toLowerCase()] = 1;
    });
  }
  
  return { traits, skills, values, workStyles };
}

/**
 * Calculate cosine similarity between two feature vectors
 */
function calculateCosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate distance to a career category
 */
function calculateCategoryDistance(
  studentFeatures: StudentFeatureVector,
  category: CareerCategory
): number {
  // Create category feature vectors
  const categoryTraits: Record<string, number> = {};
  const categorySkills: Record<string, number> = {};
  const categoryValues: Record<string, number> = {};
  const categoryWorkStyles: Record<string, number> = {};
  
  category.traits.forEach(t => categoryTraits[t.toLowerCase()] = 1);
  category.skills.forEach(s => categorySkills[s.toLowerCase()] = 1);
  category.values.forEach(v => categoryValues[v.toLowerCase()] = 1);
  category.workStyles.forEach(w => categoryWorkStyles[w.toLowerCase()] = 1);
  
  // Calculate similarities for each dimension
  const traitSimilarity = calculateCosineSimilarity(studentFeatures.traits, categoryTraits);
  const skillSimilarity = calculateCosineSimilarity(studentFeatures.skills, categorySkills);
  const valueSimilarity = calculateCosineSimilarity(studentFeatures.values, categoryValues);
  const workStyleSimilarity = calculateCosineSimilarity(studentFeatures.workStyles, categoryWorkStyles);
  
  // Weighted average (skills and values matter most)
  const weightedSimilarity = 
    traitSimilarity * 0.2 +
    skillSimilarity * 0.35 +
    valueSimilarity * 0.3 +
    workStyleSimilarity * 0.15;
  
  // Convert similarity to distance (1 - similarity)
  return 1 - weightedSimilarity;
}

/**
 * Calculate proximity to a decision boundary
 */
export function calculateBoundaryProximity(
  studentProfile: StudentProfile,
  boundary: DecisionBoundary,
  config: DecisionBoundaryEngineConfig = DEFAULT_DECISION_BOUNDARY_CONFIG
): BoundaryProximity {
  const studentFeatures = extractStudentFeatures(studentProfile);
  
  // Calculate distances to both categories
  const distanceToA = calculateCategoryDistance(studentFeatures, boundary.categoryA);
  const distanceToB = calculateCategoryDistance(studentFeatures, boundary.categoryB);
  
  // Proximity score is based on:
  // 1. Being close to both categories (small distances)
  // 2. Similar distance to both (ambiguity)
  
  const avgDistance = (distanceToA + distanceToB) / 2;
  const distanceDifference = Math.abs(distanceToA - distanceToB);
  
  // High proximity when:
  // - Average distance is moderate (not too far from either)
  // - Distance difference is small (ambiguous which category fits better)
  
  const proximityFromAvg = 1 - Math.abs(avgDistance - 0.5) * 2; // Peak at 0.5
  const proximityFromDifference = 1 - distanceDifference; // Higher when similar distances
  
  const proximityScore = proximityFromAvg * 0.4 + proximityFromDifference * 0.6;
  
  // Identify ambiguity factors
  const ambiguityFactors = identifyAmbiguityFactors(
    studentFeatures,
    boundary,
    distanceToA,
    distanceToB
  );
  
  // Generate clarification recommendations
  const recommendedClarification = generateClarificationRecommendations(
    boundary,
    distanceToA,
    distanceToB,
    ambiguityFactors
  );
  
  return {
    studentId: studentProfile.id,
    boundaryId: boundary.id,
    proximityScore: Math.max(0, Math.min(proximityScore, 1)),
    distanceToCategoryA: distanceToA,
    distanceToCategoryB: distanceToB,
    ambiguityFactors,
    recommendedClarification,
  };
}

/**
 * Identify factors causing ambiguity at the boundary
 */
function identifyAmbiguityFactors(
  studentFeatures: StudentFeatureVector,
  boundary: DecisionBoundary,
  distanceToA: number,
  distanceToB: number
): string[] {
  const factors: string[] = [];
  
  // Check for overlapping skills
  const overlappingSkills = boundary.categoryA.skills.filter(skill =>
    boundary.categoryB.skills.includes(skill)
  );
  const studentOverlappingSkills = overlappingSkills.filter(skill =>
    studentFeatures.skills[skill.toLowerCase()]
  );
  if (studentOverlappingSkills.length > 0) {
    factors.push(`Shared skills: ${studentOverlappingSkills.join(', ')}`);
  }
  
  // Check for mixed traits
  const categoryATraits = new Set(boundary.categoryA.traits.map(t => t.toLowerCase()));
  const categoryBTraits = new Set(boundary.categoryB.traits.map(t => t.toLowerCase()));
  
  const hasCategoryATraits = Object.keys(studentFeatures.traits).some(t =>
    categoryATraits.has(t)
  );
  const hasCategoryBTraits = Object.keys(studentFeatures.traits).some(t =>
    categoryBTraits.has(t)
  );
  
  if (hasCategoryATraits && hasCategoryBTraits) {
    factors.push('Mixed traits from both categories');
  }
  
  // Check for value conflicts
  const categoryAValues = new Set(boundary.categoryA.values.map(v => v.toLowerCase()));
  const categoryBValues = new Set(boundary.categoryB.values.map(v => v.toLowerCase()));
  
  const hasCategoryAValues = Object.keys(studentFeatures.values).some(v =>
    categoryAValues.has(v)
  );
  const hasCategoryBValues = Object.keys(studentFeatures.values).some(v =>
    categoryBValues.has(v)
  );
  
  if (hasCategoryAValues && hasCategoryBValues) {
    factors.push('Values aligned with both categories');
  }
  
  // Check if distances are very similar
  if (Math.abs(distanceToA - distanceToB) < 0.1) {
    factors.push('Nearly equal fit for both categories');
  }
  
  // Check for common confusion patterns
  const confusionPatterns = boundary.boundaryCharacteristics.commonConfusionPatterns;
  const matchingPatterns = confusionPatterns.filter(pattern => {
    const patternLower = pattern.toLowerCase();
    return Object.keys(studentFeatures.skills).some(s =>
      patternLower.includes(s) || s.includes(patternLower)
    );
  });
  
  if (matchingPatterns.length > 0) {
    factors.push(`Matches confusion patterns: ${matchingPatterns.join(', ')}`);
  }
  
  return factors;
}

/**
 * Generate recommendations for clarifying boundary ambiguity
 */
function generateClarificationRecommendations(
  boundary: DecisionBoundary,
  distanceToA: number,
  distanceToB: number,
  ambiguityFactors: string[]
): string[] {
  const recommendations: string[] = [];
  
  // Recommend based on which category is closer
  const closerCategory = distanceToA < distanceToB ? boundary.categoryA : boundary.categoryB;
  const fartherCategory = distanceToA < distanceToB ? boundary.categoryB : boundary.categoryA;
  
  recommendations.push(`Explore ${closerCategory.name} through informational interviews`);
  recommendations.push(`Shadow professionals in ${fartherCategory.name} to compare`);
  
  // Add specific recommendations based on boundary type
  switch (boundary.id) {
    case 'design-vs-engineering':
      recommendations.push('Complete a design sprint and a coding challenge to compare');
      recommendations.push('Analyze whether you prefer user problems or technical problems');
      break;
    case 'medicine-vs-biotech':
      recommendations.push('Volunteer in clinical settings and research labs');
      recommendations.push('Reflect on patient interaction vs research independence preference');
      break;
    case 'government-vs-startup':
      recommendations.push('Intern in both public sector and startup environments');
      recommendations.push('Assess your risk tolerance and pace preference');
      break;
    case 'research-vs-industry':
      recommendations.push('Conduct a small research project and build a prototype');
      recommendations.push('Evaluate your preference for discovery vs delivery');
      break;
    case 'technical-vs-management':
      recommendations.push('Lead a small project team while maintaining technical work');
      recommendations.push('Reflect on what energizes you: coding or team success');
      break;
    case 'creative-vs-analytical':
      recommendations.push('Create a portfolio piece using both creative and analytical skills');
      recommendations.push('Identify which type of work puts you in flow state');
      break;
    case 'local-vs-global':
      recommendations.push('Work on both local community project and remote global project');
      recommendations.push('Assess your attachment to place vs desire for mobility');
      break;
    case 'specialist-vs-generalist':
      recommendations.push('Try deep-diving into one skill and then context-switching across many');
      recommendations.push('Evaluate whether you prefer mastery or variety');
      break;
  }
  
  // Add recommendations based on ambiguity factors
  if (ambiguityFactors.some(f => f.includes('skills'))) {
    recommendations.push('Take skills assessment to identify true strengths');
  }
  
  if (ambiguityFactors.some(f => f.includes('values'))) {
    recommendations.push('Complete values clarification exercise');
  }
  
  return recommendations;
}

// ============================================================================
// BOUNDARY STUDENT DETECTION
// ============================================================================

/**
 * Detect all boundary proximities for a student
 */
export function detectBoundaryStudents(
  studentProfile: StudentProfile,
  boundaries: DecisionBoundary[] = PREDEFINED_BOUNDARIES,
  config: DecisionBoundaryEngineConfig = DEFAULT_DECISION_BOUNDARY_CONFIG
): BoundaryProximity[] {
  const proximities: BoundaryProximity[] = [];
  
  for (const boundary of boundaries) {
    const proximity = calculateBoundaryProximity(studentProfile, boundary, config);
    
    // Only include if above threshold
    if (proximity.proximityScore >= config.boundaryDetectionThreshold) {
      proximities.push(proximity);
    }
  }
  
  // Sort by proximity score descending
  proximities.sort((a, b) => b.proximityScore - a.proximityScore);
  
  // Limit to max boundaries per student
  return proximities.slice(0, config.maxBoundariesPerStudent);
}

/**
 * Generate approach strategy for boundary student
 */
export function generateBoundaryApproachStrategy(
  boundaryProximity: BoundaryProximity,
  uncertaintyProfile?: UncertaintyProfile
): BoundaryApproachStrategy {
  const { proximityScore, distanceToCategoryA, distanceToCategoryB } = boundaryProximity;
  
  // Determine strategy type based on proximity and uncertainty
  let strategyType: BoundaryApproachStrategy['strategyType'];
  
  if (proximityScore > 0.8) {
    // Very close to boundary - needs clarification
    strategyType = 'clarification';
  } else if (proximityScore > 0.6) {
    // Moderately close - needs exploration
    strategyType = 'exploration';
  } else if (uncertaintyProfile?.compositeUncertainty.value && uncertaintyProfile.compositeUncertainty.value > 0.6) {
    // High uncertainty - needs experimentation
    strategyType = 'experimentation';
  } else {
    // Default to mentorship
    strategyType = 'mentorship';
  }
  
  // Generate steps based on strategy type
  const steps: string[] = [];
  const timeline: string = '';
  
  switch (strategyType) {
    case 'clarification':
      steps.push('Conduct structured interviews with professionals in both categories');
      steps.push('Complete comparative skill assessments');
      steps.push('Analyze past experiences for pattern identification');
      steps.push('Facilitate values clarification workshop');
      break;
    case 'exploration':
      steps.push('Design 2-week exploration sprint in each category');
      steps.push('Arrange job shadowing opportunities');
      steps.push('Create portfolio projects in both areas');
      steps.push('Facilitate networking in both communities');
      break;
    case 'experimentation':
      steps.push('Design 3-month trial experience in primary category');
      steps.push('Set up A/B testing of different approaches');
      steps.push('Create feedback loops for rapid iteration');
      steps.push('Establish clear decision criteria and timeline');
      break;
    case 'mentorship':
      steps.push('Match with mentors from both categories');
      steps.push('Facilitate peer connections with similar boundary students');
      steps.push('Create mastermind group for boundary exploration');
      steps.push('Schedule regular check-ins with career coach');
      break;
  }
  
  // Calculate expected resolution probability
  const baseResolution = 0.6;
  const proximityBonus = proximityScore * 0.2;
  const uncertaintyPenalty = uncertaintyProfile 
    ? uncertaintyProfile.compositeUncertainty.value * 0.1 
    : 0;
  const expectedResolution = Math.min(baseResolution + proximityBonus - uncertaintyPenalty, 0.95);
  
  return {
    strategyType,
    steps,
    expectedResolution,
    timeline: generateTimeline(strategyType),
  };
}

/**
 * Generate timeline for boundary approach
 */
function generateTimeline(strategyType: BoundaryApproachStrategy['strategyType']): string {
  switch (strategyType) {
    case 'clarification':
      return '2-4 weeks';
    case 'exploration':
      return '1-2 months';
    case 'experimentation':
      return '3-6 months';
    case 'mentorship':
      return '6-12 months';
    default:
      return '1-3 months';
  }
}

/**
 * Create complete boundary student profile
 */
export function createBoundaryStudentProfile(
  studentProfile: StudentProfile,
  learningValue: LearningValueScore,
  uncertaintyProfile?: UncertaintyProfile,
  boundaries: DecisionBoundary[] = PREDEFINED_BOUNDARIES,
  config: DecisionBoundaryEngineConfig = DEFAULT_DECISION_BOUNDARY_CONFIG
): BoundaryStudent | null {
  // Detect boundary proximities
  const proximities = detectBoundaryStudents(studentProfile, boundaries, config);
  
  if (proximities.length === 0) {
    return null;
  }
  
  // Get primary boundary (highest proximity)
  const primaryProximity = proximities[0];
  const primaryBoundary = boundaries.find(b => b.id === primaryProximity.boundaryId)!;
  
  // Generate approach strategy
  const recommendedApproach = generateBoundaryApproachStrategy(
    primaryProximity,
    uncertaintyProfile
  );
  
  return {
    studentId: studentProfile.id,
    profile: studentProfile,
    boundaries: proximities,
    primaryBoundary,
    learningValue,
    recommendedApproach,
  };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchBoundaryDetectionResult {
  boundaryStudents: BoundaryStudent[];
  totalStudentsAnalyzed: number;
  boundaryDetectionRate: number;
  boundaryDistribution: Record<string, number>;
  averageProximityScore: number;
  processingTime: number;
}

/**
 * Process boundary detection for multiple students
 */
export async function detectBoundaryStudentsBatch(
  studentProfiles: StudentProfile[],
  learningValues: Map<string, LearningValueScore>,
  uncertaintyProfiles: Map<string, UncertaintyProfile>,
  boundaries: DecisionBoundary[] = PREDEFINED_BOUNDARIES,
  config: DecisionBoundaryEngineConfig = DEFAULT_DECISION_BOUNDARY_CONFIG
): Promise<BatchBoundaryDetectionResult> {
  const startTime = Date.now();
  
  const boundaryStudents: BoundaryStudent[] = [];
  const boundaryDistribution: Record<string, number> = {};
  
  // Initialize distribution counters
  boundaries.forEach(b => boundaryDistribution[b.id] = 0);
  
  let totalProximityScore = 0;
  let proximityCount = 0;
  
  for (const studentProfile of studentProfiles) {
    const learningValue = learningValues.get(studentProfile.id);
    const uncertaintyProfile = uncertaintyProfiles.get(studentProfile.id);
    
    if (!learningValue) continue;
    
    const boundaryStudent = createBoundaryStudentProfile(
      studentProfile,
      learningValue,
      uncertaintyProfile,
      boundaries,
      config
    );
    
    if (boundaryStudent) {
      boundaryStudents.push(boundaryStudent);
      
      // Update distribution
      boundaryStudent.boundaries.forEach(b => {
        boundaryDistribution[b.boundaryId] = (boundaryDistribution[b.boundaryId] || 0) + 1;
      });
      
      // Update proximity scores
      boundaryStudent.boundaries.forEach(b => {
        totalProximityScore += b.proximityScore;
        proximityCount++;
      });
    }
  }
  
  const boundaryDetectionRate = studentProfiles.length > 0
    ? boundaryStudents.length / studentProfiles.length
    : 0;
  
  return {
    boundaryStudents,
    totalStudentsAnalyzed: studentProfiles.length,
    boundaryDetectionRate,
    boundaryDistribution,
    averageProximityScore: proximityCount > 0 ? totalProximityScore / proximityCount : 0,
    processingTime: Date.now() - startTime,
  };
}

// ============================================================================
// DECISION BOUNDARY ENGINE CLASS
// ============================================================================

export class DecisionBoundaryEngine {
  private config: DecisionBoundaryEngineConfig;
  private boundaries: DecisionBoundary[];
  private boundaryStudentHistory: Map<string, BoundaryStudent[]>;
  private metrics: ActiveLearningMetrics;
  
  constructor(
    config: Partial<DecisionBoundaryEngineConfig> = {},
    customBoundaries: DecisionBoundary[] = []
  ) {
    this.config = { ...DEFAULT_DECISION_BOUNDARY_CONFIG, ...config };
    this.boundaries = customBoundaries.length > 0 ? customBoundaries : PREDEFINED_BOUNDARIES;
    this.boundaryStudentHistory = new Map();
    this.metrics = {
      totalStudentsProcessed: 0,
      averageLearningValue: 0,
      highValueStudentPercentage: 0,
      boundaryDetectionRate: 0,
      evidenceGapClosureRate: 0,
      modelImprovementRate: 0,
      informationGainPerStudent: 0,
    };
  }
  
  /**
   * Detect boundaries for a single student
   */
  detectBoundaries(
    studentProfile: StudentProfile,
    learningValue: LearningValueScore,
    uncertaintyProfile?: UncertaintyProfile
  ): BoundaryStudent | null {
    const boundaryStudent = createBoundaryStudentProfile(
      studentProfile,
      learningValue,
      uncertaintyProfile,
      this.boundaries,
      this.config
    );
    
    if (boundaryStudent) {
      // Store in history
      if (!this.boundaryStudentHistory.has(studentProfile.id)) {
        this.boundaryStudentHistory.set(studentProfile.id, []);
      }
      this.boundaryStudentHistory.get(studentProfile.id)!.push(boundaryStudent);
      
      // Update metrics
      this.metrics.totalStudentsProcessed++;
      this.updateMetrics();
    }
    
    return boundaryStudent;
  }
  
  /**
   * Detect boundaries for multiple students
   */
  async detectBatch(
    studentProfiles: StudentProfile[],
    learningValues: Map<string, LearningValueScore>,
    uncertaintyProfiles: Map<string, UncertaintyProfile>
  ): Promise<BatchBoundaryDetectionResult> {
    const result = await detectBoundaryStudentsBatch(
      studentProfiles,
      learningValues,
      uncertaintyProfiles,
      this.boundaries,
      this.config
    );
    
    // Update metrics
    this.metrics.totalStudentsProcessed += studentProfiles.length;
    this.metrics.boundaryDetectionRate = result.boundaryDetectionRate;
    
    return result;
  }
  
  /**
   * Update engine metrics
   */
  private updateMetrics(): void {
    const allBoundaryStudents: BoundaryStudent[] = [];
    for (const students of this.boundaryStudentHistory.values()) {
      if (students.length > 0) {
        allBoundaryStudents.push(students[students.length - 1]);
      }
    }
    
    if (allBoundaryStudents.length === 0) return;
    
    this.metrics.boundaryDetectionRate = 
      allBoundaryStudents.length / this.metrics.totalStudentsProcessed;
    
    this.metrics.averageLearningValue = allBoundaryStudents.reduce(
      (sum, s) => sum + s.learningValue.totalScore,
      0
    ) / allBoundaryStudents.length;
  }
  
  /**
   * Get all boundary students
   */
  getBoundaryStudents(minProximityScore: number = 0): BoundaryStudent[] {
    const students: BoundaryStudent[] = [];
    
    for (const [_, history] of this.boundaryStudentHistory.entries()) {
      const latest = history[history.length - 1];
      if (latest && latest.boundaries.some(b => b.proximityScore >= minProximityScore)) {
        students.push(latest);
      }
    }
    
    return students;
  }
  
  /**
   * Get students at a specific boundary
   */
  getStudentsAtBoundary(boundaryId: string, minProximityScore: number = 0.5): BoundaryStudent[] {
    return this.getBoundaryStudents(minProximityScore).filter(s =>
      s.boundaries.some(b => b.boundaryId === boundaryId && b.proximityScore >= minProximityScore)
    );
  }
  
  /**
   * Get boundary statistics
   */
  getBoundaryStatistics(): {
    totalBoundaryStudents: number;
    boundaryDistribution: Record<string, number>;
    averageProximityByBoundary: Record<string, number>;
    mostCommonBoundaries: string[];
  } {
    const boundaryDistribution: Record<string, number> = {};
    const proximitySums: Record<string, number> = {};
    const proximityCounts: Record<string, number> = {};
    
    for (const [_, history] of this.boundaryStudentHistory.entries()) {
      const latest = history[history.length - 1];
      if (!latest) continue;
      
      for (const boundary of latest.boundaries) {
        boundaryDistribution[boundary.boundaryId] = (boundaryDistribution[boundary.boundaryId] || 0) + 1;
        proximitySums[boundary.boundaryId] = (proximitySums[boundary.boundaryId] || 0) + boundary.proximityScore;
        proximityCounts[boundary.boundaryId] = (proximityCounts[boundary.boundaryId] || 0) + 1;
      }
    }
    
    const averageProximityByBoundary: Record<string, number> = {};
    for (const boundaryId of Object.keys(proximitySums)) {
      averageProximityByBoundary[boundaryId] = 
        proximitySums[boundaryId] / (proximityCounts[boundaryId] || 1);
    }
    
    // Sort boundaries by frequency
    const sortedBoundaries = Object.entries(boundaryDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
    
    return {
      totalBoundaryStudents: this.boundaryStudentHistory.size,
      boundaryDistribution,
      averageProximityByBoundary,
      mostCommonBoundaries: sortedBoundaries.slice(0, 5),
    };
  }
  
  /**
   * Add custom boundary
   */
  addBoundary(boundary: DecisionBoundary): void {
    this.boundaries.push(boundary);
  }
  
  /**
   * Remove boundary
   */
  removeBoundary(boundaryId: string): void {
    this.boundaries = this.boundaries.filter(b => b.id !== boundaryId);
  }
  
  /**
   * Get all boundaries
   */
  getBoundaries(): DecisionBoundary[] {
    return [...this.boundaries];
  }
  
  /**
   * Get engine metrics
   */
  getMetrics(): ActiveLearningMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<DecisionBoundaryEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current configuration
   */
  getConfig(): DecisionBoundaryEngineConfig {
    return { ...this.config };
  }
  
  /**
   * Clear all history
   */
  clearHistory(): void {
    this.boundaryStudentHistory.clear();
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const decisionBoundaryEngine = new DecisionBoundaryEngine();
