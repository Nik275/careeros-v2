/**
 * India Opportunity Graph - Node Types
 * 
 * Phase 8.8: CareerOS India Opportunity Graph
 * 
 * Defines all node types, edge types, and related structures for modeling
 * the complete landscape of education and career pathways in India.
 * 
 * Core Philosophy:
 * Students do not choose careers directly. Students choose pathways.
 * CareerOS must understand pathways, transitions, pivots, dead ends,
 * optionality, opportunity expansion, and opportunity collapse.
 * 
 * @module opportunity-node-types
 * @version 1.0.0
 */

// ============================================================================
// NODE TYPE ENUMS
// ============================================================================

export type OpportunityNodeType = 
  | 'SCHOOL_STREAM'
  | 'DEGREE'
  | 'EXAM'
  | 'COLLEGE_TYPE'
  | 'SKILL'
  | 'CAREER'
  | 'INDUSTRY'
  | 'ROLE'
  | 'CERTIFICATION'
  | 'ENTREPRENEURSHIP'
  | 'ALTERNATIVE_PATH';

export type EdgeType =
  | 'LEADS_TO'
  | 'ENABLES'
  | 'REQUIRES'
  | 'COMMON_TRANSITION'
  | 'RARE_TRANSITION'
  | 'PIVOT_PATH'
  | 'SPECIALIZATION'
  | 'UPSKILL_PATH'
  | 'CAREER_EVOLUTION';

export type SchoolStream = 
  | 'PCM'
  | 'PCB'
  | 'COMMERCE'
  | 'ARTS'
  | 'GENERAL'
  | 'VOCATIONAL';

export type CollegeTier = 
  | 'TIER_1'
  | 'TIER_2'
  | 'TIER_3'
  | 'INTERNATIONAL'
  | 'ONLINE';

export type ExamType =
  | 'JEE_MAIN'
  | 'JEE_ADVANCED'
  | 'NEET'
  | 'CAT'
  | 'CLAT'
  | 'UPSC'
  | 'CA_FOUNDATION'
  | 'CA_INTERMEDIATE'
  | 'CA_FINAL'
  | 'CS'
  | 'CMA'
  | 'GATE'
  | 'CUET'
  | 'NID'
  | 'NIFT'
  | 'CEED'
  | 'NMAT'
  | 'XAT'
  | 'MAT'
  | 'GMAT'
  | 'GRE'
  | 'IELTS'
  | 'TOEFL';

export type DegreeType =
  | 'BTECH'
  | 'BE'
  | 'MBBS'
  | 'BDS'
  | 'BAMS'
  | 'BPHARM'
  | 'BSC'
  | 'BCA'
  | 'BBA'
  | 'BCOM'
  | 'BA'
  | 'BFA'
  | 'BDes'
  | 'LLB'
  | 'BARCH'
  | 'MTECH'
  | 'MS'
  | 'MD'
  | 'MBA'
  | 'MCA'
  | 'MCOM'
  | 'MA'
  | 'MDes'
  | 'LLM'
  | 'PHD';

export type CareerType =
  | 'SOFTWARE_ENGINEERING'
  | 'DATA_SCIENCE'
  | 'AI_ML'
  | 'PRODUCT_MANAGEMENT'
  | 'MANAGEMENT_CONSULTING'
  | 'INVESTMENT_BANKING'
  | 'CORPORATE_FINANCE'
  | 'CA_PRACTICE'
  | 'CS_PRACTICE'
  | 'MEDICAL_PRACTICE'
  | 'LEGAL_PRACTICE'
  | 'CIVIL_SERVICES'
  | 'DEFENSE'
  | 'RESEARCH'
  | 'ACADEMIA'
  | 'DESIGN'
  | 'MARKETING'
  | 'SALES'
  | 'HR'
  | 'OPERATIONS'
  | 'SUPPLY_CHAIN'
  | 'ENTREPRENEURSHIP'
  | 'CONTENT_CREATION'
  | 'FREELANCING';

export type IndustryType =
  | 'IT_SOFTWARE'
  | 'IT_SERVICES'
  | 'FINANCIAL_SERVICES'
  | 'CONSULTING'
  | 'HEALTHCARE'
  | 'PHARMA'
  | 'EDUCATION'
  | 'E_COMMERCE'
  | 'FINTECH'
  | 'STARTUP_ECOSYSTEM'
  | 'MANUFACTURING'
  | 'AUTOMOTIVE'
  | 'AEROSPACE'
  | 'ENERGY'
  | 'MEDIA_ENTERTAINMENT'
  | 'REAL_ESTATE'
  | 'LEGAL_SERVICES'
  | 'GOVERNMENT'
  | 'NGO'
  | 'RESEARCH_INSTITUTIONS';

// ============================================================================
// BASE GRAPH TYPES
// ============================================================================

export interface OpportunityNode {
  id: string;
  type: OpportunityNodeType;
  name: string;
  description: string;
  tier?: CollegeTier;
  difficulty?: DifficultyLevel;
  duration?: number; // in years/months
  costRange?: CostRange;
  competitionLevel?: CompetitionLevel;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface OpportunityEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number; // 0-1 probability or strength
  description: string;
  requirements?: string[];
  timeEstimate?: number; // in months
  difficulty?: DifficultyLevel;
  metadata: Record<string, unknown>;
}

export interface OpportunityGraph {
  nodes: Map<string, OpportunityNode>;
  edges: Map<string, OpportunityEdge>;
  adjacencyList: Map<string, string[]>; // nodeId -> edgeIds
}

// ============================================================================
// DIFFICULTY & COST TYPES
// ============================================================================

export type DifficultyLevel = 
  | 'VERY_EASY'
  | 'EASY'
  | 'MODERATE'
  | 'DIFFICULT'
  | 'VERY_DIFFICULT';

export type CompetitionLevel =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH'
  | 'EXTREME';

export interface CostRange {
  min: number;
  max: number;
  currency: 'INR' | 'USD' | 'EUR';
  period: 'TOTAL' | 'PER_YEAR' | 'PER_SEMESTER';
}

// ============================================================================
// SCHOOL STREAM NODES
// ============================================================================

export interface SchoolStreamNode extends OpportunityNode {
  type: 'SCHOOL_STREAM';
  stream: SchoolStream;
  subjects: string[];
  eligibleExams: string[]; // exam node IDs
  eligibleDegrees: string[]; // degree node IDs
  typicalCareers: string[]; // career node IDs
  optionalityScore: number; // 0-1 future path count
}

// ============================================================================
// DEGREE NODES
// ============================================================================

export interface DegreeNode extends OpportunityNode {
  type: 'DEGREE';
  degreeType: DegreeType;
  duration: number; // in years
  streamRequirement?: SchoolStream[];
  entranceExams: string[]; // exam node IDs
  collegeTypes: string[]; // college type node IDs
  skillsDeveloped: string[]; // skill node IDs
  careerOutcomes: string[]; // career node IDs
  furtherEducation: string[]; // degree node IDs
  optionalityScore: number;
  lockInLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// EXAM NODES
// ============================================================================

export interface ExamNode extends OpportunityNode {
  type: 'EXAM';
  examType: ExamType;
  frequency: 'ANNUAL' | 'SEMESTER' | 'MULTIPLE';
  eligibilityCriteria: string[];
  syllabus: string[];
  difficulty: DifficultyLevel;
  competitionLevel: CompetitionLevel;
  successRate?: number; // percentage
  opensDoorsTo: string[]; // node IDs this exam enables
  alternativeExams: string[]; // similar exam node IDs
}

// ============================================================================
// COLLEGE TYPE NODES
// ============================================================================

export interface CollegeTypeNode extends OpportunityNode {
  type: 'COLLEGE_TYPE';
  tier: CollegeTier;
  reputationScore: number; // 0-1
  placementRate?: number; // percentage
  averagePackage?: number; // in LPA
  researchOutput?: number; // 0-1
  alumniNetworkStrength: number; // 0-1
  degreesOffered: string[]; // degree node IDs
  entranceExamsAccepted: string[]; // exam node IDs
  locationTypes: ('METRO' | 'TIER_2' | 'TIER_3' | 'RURAL')[];
}

// ============================================================================
// SKILL NODES
// ============================================================================

export interface SkillNode extends OpportunityNode {
  type: 'SKILL';
  category: 'TECHNICAL' | 'SOFT' | 'DOMAIN' | 'TOOL' | 'LANGUAGE';
  difficulty: DifficultyLevel;
  timeToAcquire: number; // in months
  acquisitionMethods: ('FORMAL_EDUCATION' | 'SELF_STUDY' | 'ONLINE_COURSE' | 'CERTIFICATION' | 'EXPERIENCE')[];
  relatedSkills: string[]; // skill node IDs
  requiredFor: string[]; // career/role node IDs
  enhances: string[]; // skill node IDs
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  futureRelevance: 'DECLINING' | 'STABLE' | 'GROWING' | 'EMERGING';
}

// ============================================================================
// CAREER NODES
// ============================================================================

export interface CareerNode extends OpportunityNode {
  type: 'CAREER';
  careerType: CareerType;
  entryRequirements: string[]; // degree/skill/cert node IDs
  progressionPath: string[]; // career node IDs
  relatedCareers: string[]; // career node IDs
  industries: string[]; // industry node IDs
  roles: string[]; // role node IDs
  averageStartingSalary: number; // in LPA
 salaryGrowthPotential: number; // multiplier over 10 years
 jobSecurity: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
 workLifeBalance: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
 entrepreneurshipPotential: number; // 0-1
 remoteWorkPotential: number; // 0-1
 futureOutlook: 'DECLINING' | 'STABLE' | 'GROWING' | 'BOOMING';
}

// ============================================================================
// INDUSTRY NODES
// ============================================================================

export interface IndustryNode extends OpportunityNode {
  type: 'INDUSTRY';
  industryType: IndustryType;
  growthRate: number; // annual percentage
  marketSize: number; // in USD billions
  keyPlayers: string[];
  emergingTrends: string[];
  requiredSkills: string[]; // skill node IDs
  careerPaths: string[]; // career node IDs
  startupEcosystem: 'WEAK' | 'MODERATE' | 'STRONG' | 'VIBRANT';
  governmentSupport: 'LOW' | 'MODERATE' | 'HIGH';
  futureOutlook: 'DECLINING' | 'STABLE' | 'GROWING' | 'TRANSFORMING';
}

// ============================================================================
// ROLE NODES
// ============================================================================

export interface RoleNode extends OpportunityNode {
  type: 'ROLE';
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEADERSHIP';
  responsibilities: string[];
  requiredSkills: string[]; // skill node IDs
  preferredDegrees: string[]; // degree node IDs
  careerPath: string; // career node ID
  industries: string[]; // industry node IDs
  averageSalary: number; // in LPA
 nextRoles: string[]; // role node IDs
  alternativeTitles: string[];
}

// ============================================================================
// CERTIFICATION NODES
// ============================================================================

export interface CertificationNode extends OpportunityNode {
  type: 'CERTIFICATION';
  issuingBody: string;
  validityPeriod?: number; // in years, undefined if lifetime
  difficulty: DifficultyLevel;
  cost: CostRange;
  preparationTime: number; // in months
  skillsValidated: string[]; // skill node IDs
  enhancesCareers: string[]; // career node IDs
  requiredFor: string[]; // role/node IDs
  industryRecognition: 'LOW' | 'MODERATE' | 'HIGH' | 'PREMIUM';
}

// ============================================================================
// ENTREPRENEURSHIP NODES
// ============================================================================

export interface EntrepreneurshipNode extends OpportunityNode {
  type: 'ENTREPRENEURSHIP';
  startupType: 'TECH' | 'SERVICES' | 'PRODUCT' | 'SOCIAL' | 'FRANCHISE';
  capitalRequired: CostRange;
  skillsRequired: string[]; // skill node IDs
  industryFocus: string[]; // industry node IDs
  successRate: number; // percentage
  averageTimeline: number; // months to profitability
  supportEcosystem: string[]; // incubators, accelerators
  fundingAvailability: 'SCARCE' | 'MODERATE' | 'ABUNDANT';
}

// ============================================================================
// ALTERNATIVE PATH NODES
// ============================================================================

export interface AlternativePathNode extends OpportunityNode {
  type: 'ALTERNATIVE_PATH';
  pathType: 'GAP_YEAR' | 'FREELANCING' | 'BOOTCAMP' | 'SELF_STUDY' | 'ONLINE_DEGREE' | 'DIPLOMA';
  duration: number; // in months
  cost: CostRange;
  skillsGained: string[]; // skill node IDs
  leadsTo: string[]; // node IDs this can lead to
  recognitionLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

// ============================================================================
// PATHWAY ANALYSIS TYPES
// ============================================================================

export interface PathwayStep {
  nodeId: string;
  nodeType: OpportunityNodeType;
  name: string;
  description: string;
  duration?: number;
  difficulty?: DifficultyLevel;
  requirements: string[];
  alternatives: string[]; // alternative node IDs
  optionalityAtThisStep: number; // 0-1
}

export interface PathwayAnalysis {
  id: string;
  startNode: string;
  endNode?: string;
  steps: PathwayStep[];
  totalDuration: number; // in years
  totalCost: CostRange;
  difficulty: DifficultyLevel;
  optionalityScore: number; // 0-1
  futurePathCount: number;
  pivotOpportunities: number;
  alternativeRoutes: string[]; // alternative pathway IDs
  riskFactors: string[];
  recommendation: string;
}

// ============================================================================
// TRANSITION ANALYSIS TYPES
// ============================================================================

export interface TransitionAnalysis {
  id: string;
  fromNode: string;
  toNode: string;
  type: EdgeType;
  difficulty: DifficultyLevel;
  probability: number; // 0-1
  requiredSkills: string[]; // skill node IDs
  skillsToAcquire: string[]; // skills not currently held
  timeEstimate: number; // in months
  costEstimate?: CostRange;
  successStories: string[]; // examples of people who made this transition
  challenges: string[];
  mitigationStrategies: string[];
  recommendedPath: string[]; // node IDs for optimal transition path
}

// ============================================================================
// OPTIONALITY ANALYSIS TYPES
// ============================================================================

export interface OptionalityAnalysis {
  nodeId: string;
  futurePathCount: number;
  directTransitions: number;
  indirectTransitions: number;
  pivotOpportunities: string[]; // node IDs
  alternativeRoutes: string[]; // pathway IDs
  pathFlexibility: number; // 0-1
  futureOpportunityBreadth: number; // 0-1
  lockInLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reversibility: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE';
}

// ============================================================================
// CRITICALITY ANALYSIS TYPES
// ============================================================================

export interface CriticalityAnalysis {
  nodeId: string;
  pathLockIn: boolean;
  careerLockIn: boolean;
  educationLockIn: boolean;
  opportunityClosure: string[]; // node IDs that become inaccessible
  futureRestrictions: string[];
  irreversibilityScore: number; // 0-1
  criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warningSigns: string[];
  mitigationOptions: string[];
}

// ============================================================================
// DECISION SIMULATION TYPES
// ============================================================================

export interface DecisionSimulationInput {
  currentNode: string;
  candidateNodes: string[];
  studentProfile: {
    interests: string[];
    strengths: string[];
    constraints: string[];
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    timeHorizon: number; // years
  };
}

export interface PathSimulation {
  pathId: string;
  chosenNode: string;
  pathway: PathwayAnalysis;
  optionality: OptionalityAnalysis;
  criticality: CriticalityAnalysis;
  futureOpportunities: string[]; // node IDs
  opportunitiesLost: string[]; // node IDs
  regretRisks: string[];
  recommendation: string;
}

export interface DecisionSimulationResult {
  id: string;
  simulations: PathSimulation[];
  comparison: {
    highestOptionality: string; // path ID
    lowestRisk: string; // path ID
    bestAlignment: string; // path ID
  };
  recommendation: string;
  mentorFraming: string;
}

// ============================================================================
// GRAPH QUERY TYPES
// ============================================================================

export interface GraphQuery {
  startNode?: string;
  endNode?: string;
  nodeTypes?: OpportunityNodeType[];
  edgeTypes?: EdgeType[];
  maxDepth?: number;
  minOptionality?: number;
  maxDifficulty?: DifficultyLevel;
}

export interface GraphQueryResult {
  paths: PathwayAnalysis[];
  nodes: OpportunityNode[];
  edges: OpportunityEdge[];
  metadata: {
    totalPaths: number;
    averageOptionality: number;
    averageDifficulty: number;
  };
}

// ============================================================================
// MENTOR INTEGRATION TYPES
// ============================================================================

export interface MentorExplanation {
  pathwaySummary: string;
  optionalityExplanation: string;
  criticalityExplanation: string;
  transitionAdvice: string;
  naturalLanguage: string;
  keyInsights: string[];
  questionsToConsider: string[];
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

export interface IGraphBuilder {
  buildGraph(): OpportunityGraph;
  addNode(node: OpportunityNode): void;
  addEdge(edge: OpportunityEdge): void;
  getNode(id: string): OpportunityNode | undefined;
  getEdgesFrom(nodeId: string): OpportunityEdge[];
  getEdgesTo(nodeId: string): OpportunityEdge[];
}

export interface IPathwayEngine {
  generatePathway(startNode: string, endNode?: string): PathwayAnalysis;
  generateAllPathways(startNode: string, maxDepth?: number): PathwayAnalysis[];
  findShortestPath(startNode: string, endNode: string): PathwayAnalysis | null;
  findPathsByOptionality(startNode: string, minOptionality: number): PathwayAnalysis[];
}

export interface ITransitionEngine {
  analyzeTransition(fromNode: string, toNode: string): TransitionAnalysis;
  findPossibleTransitions(nodeId: string): TransitionAnalysis[];
  findPivotOpportunities(nodeId: string): string[];
  getTransitionDifficulty(fromNode: string, toNode: string): DifficultyLevel;
}

export interface IOpportunityGraphEngine {
  query(query: GraphQuery): GraphQueryResult;
  simulateDecision(input: DecisionSimulationInput): DecisionSimulationResult;
  analyzeOptionality(nodeId: string): OptionalityAnalysis;
  analyzeCriticality(nodeId: string): CriticalityAnalysis;
  getMentorExplanation(pathwayId: string): MentorExplanation;
  getNode(id: string): OpportunityNode | undefined;
  getConnectedNodes(nodeId: string): OpportunityNode[];
}
