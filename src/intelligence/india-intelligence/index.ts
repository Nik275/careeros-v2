/**
 * India Intelligence Layer
 *
 * A comprehensive engine for modeling Indian career reality including:
 * - Competitive exam pathways (JEE, NEET, UPSC, CA/CS/CMA)
 * - Family business dynamics and succession planning
 * - Regional constraints (Tier 1/2/3/Rural realities)
 * - Economic constraints (strata-specific affordability)
 * - India-specific motivations (prestige, stability, family duty)
 * - Dream vs Practical tradeoff analysis
 * - Context-aware explanations
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createIndiaIntelligenceEngine } from '@/intelligence/india-intelligence';
 *
 * const engine = createIndiaIntelligenceEngine();
 *
 * const analysis = engine.analyze({
 *   profile: {
 *     id: 'student-123',
 *     currentLocation: 'TIER_2_CITY',
 *     homeState: 'Karnataka',
 *     motherTongue: 'Kannada',
 *     languagesKnown: ['Kannada', 'English', 'Hindi'],
 *     familyIncome: 'MIDDLE_CLASS',
 *     familyBusinessInvolvement: 'NO_BUSINESS',
 *     parentOccupations: { father: 'Government Employee', mother: 'Teacher' },
 *     familyDependents: 1,
 *     currentEducationLevel: 'SCHOOL_12',
 *     board: 'CBSE',
 *     academicPerformance: { class10Percentage: 92, class12Percentage: 88 },
 *     examAttempts: [{ examType: 'JEE', year: 2024, rank: 25000, qualified: true }],
 *     canRelocate: true,
 *     relocationConstraints: [],
 *     financialConstraints: {
 *       maxEducationBudget: 2000000,
 *       canTakeEducationLoan: true,
 *       loanTolerance: 'MEDIUM',
 *     },
 *     familyExpectations: ['Secure government job', 'Good marriage prospects'],
 *     familyPressureSources: ['PARENT_EXPECTATION'],
 *     pressureIntensity: 'MODERATE',
 *   },
 *   statedPreferences: {
 *     preferredCareers: ['Software Engineer', 'Data Scientist', 'UPSC'],
 *     rejectedCareers: ['Teaching', 'Banking'],
 *     preferredLocations: ['Bangalore', 'Hyderabad', 'Pune'],
 *     willingToTakeGapYear: false,
 *     willingToStudyAbroad: false,
 *     willingToJoinFamilyBusiness: false,
 *     preferredMotivations: ['WEALTH_CREATION', 'PRESTIGE_SEEKING'],
 *   },
 *   selfAssessment: {
 *     riskTolerance: 'MEDIUM',
 *     preferredWorkEnvironment: 'CORPORATE',
 *     importanceOfPrestige: 4,
 *     importanceOfStability: 3,
 *     importanceOfIncome: 5,
 *     importanceOfLocation: 3,
 *   },
 *   timestamp: Date.now(),
 * });
 *
 * // Access results
 * console.log(analysis.integratedRecommendations[0].path);
 * console.log(analysis.explanation.summary);
 * console.log(analysis.realityCheck.dreamCareerFeasibility);
 * ```
 *
 * ## Architecture
 *
 * The India Intelligence Layer consists of coordinated engines:
 *
 * ### Exam Pathway Engines
 * - **JEEEngine**: Engineering entrance (IIT/NIT/State/Private pathways)
 * - **NEETEngine**: Medical entrance (MBBS/BDS/AYUSH/Abroad options)
 * - **UPSCEngine**: Civil services (IAS/IPS/IRS with backup planning)
 * - **CAEngine**: Professional courses (CA/CS/CMA with articleship)
 *
 * ### Constraint Engines
 * - **FamilyBusinessEngine**: Succession, pressure, integration options
 * - **RegionalConstraintEngine**: Mobility, language, opportunity landscape
 * - **EconomicConstraintEngine**: Affordability, ROI, loan strategy
 *
 * ### Analysis Engines
 * - **IndiaMotivationModel**: Detects 12 India-specific motivations
 * - **IndiaExplanationEngine**: Context-aware narrative generation
 * - **IndiaTradeoffEngine**: Dream vs Practical decision modeling
 *
 * ### Main Orchestrator
 * - **IndiaIntelligenceEngine**: Coordinates all sub-engines
 *
 * ## Key Concepts
 *
 * ### Economic Strata
 * - BPL: Below Poverty Line (< 2.5L annual)
 * - Low Income: 2.5L - 5L
 * - Lower Middle: 5L - 10L
 * - Middle Class: 10L - 25L
 * - Upper Middle: 25L - 50L
 * - Affluent: 50L - 1Cr
 * - Wealthy: > 1Cr
 *
 * ### Regional Tiers
 * - Tier 1 Metro: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad
 * - Tier 2 City: Pune, Ahmedabad, Jaipur, Lucknow, Kochi, etc.
 * - Tier 3 Town: District towns
 * - Rural: Villages and rural areas
 *
 * ### Motivations
 * - Stability Seeking: Government job preference
 * - Prestige Seeking: Status and recognition
 * - Family Responsibility: Supporting dependents
 * - Social Mobility: Upward class movement
 * - Public Service: Serving society
 * - Wealth Creation: Financial success
 * - Entrepreneurship: Own business
 * - Family Legacy: Continuing tradition
 *
 * @module intelligence/india-intelligence
 */

// Main engine
export {
  IndiaIntelligenceEngine,
  createIndiaIntelligenceEngine,
  IndiaIntelligenceEngineConfig,
} from './IndiaIntelligenceEngine';

// Exam pathway engines
export {
  JEEEngine,
  createJEEEngine,
  JEEEngineConfig,
} from './engines/JEEEngine';

export {
  NEETEngine,
  createNEETEngine,
  NEETEngineConfig,
} from './engines/NEETEngine';

export {
  UPSCEngine,
  createUPSCConfig,
  UPSCEngineConfig,
} from './engines/UPSCEngine';

export {
  CAEngine,
  createCAEngine,
  CAEngineConfig,
} from './engines/CAEngine';

// Constraint engines
export {
  FamilyBusinessEngine,
  createFamilyBusinessEngine,
  FamilyBusinessEngineConfig,
} from './engines/FamilyBusinessEngine';

export {
  RegionalConstraintEngine,
  createRegionalConstraintEngine,
  RegionalConstraintEngineConfig,
} from './engines/RegionalConstraintEngine';

export {
  EconomicConstraintEngine,
  createEconomicConstraintEngine,
  EconomicConstraintEngineConfig,
} from './engines/EconomicConstraintEngine';

// Analysis engines
export {
  IndiaMotivationModel,
  createIndiaMotivationModel,
  IndiaMotivationModelConfig,
} from './IndiaMotivationModel';

export {
  IndiaExplanationEngine,
  createIndiaExplanationEngine,
  IndiaExplanationEngineConfig,
} from './IndiaExplanationEngine';

export {
  IndiaTradeoffEngine,
  createIndiaTradeoffEngine,
  IndiaTradeoffEngineConfig,
} from './IndiaTradeoffEngine';

// All types
export * from './types';
