/**
 * Signal Extractors for Context Detection
 * 
 * Each extractor finds evidence for a specific DecisionContextType from
 * various input sources: assessment responses, profile data, goals, and user input.
 * 
 * The design is extensible - new context types can be added by creating
 * new extractor functions without modifying existing code.
 * 
 * @module intelligence/decision-context/detection
 */

import {
  DecisionContextType,
  ContextEvidence,
  EvidenceType,
  EvidenceStrength,
  ContextDetectionInput,
} from '../types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique evidence ID.
 */
function generateEvidenceId(type: string, source: string): string {
  return `${type}_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create evidence from a signal.
 */
function createEvidence(
  type: EvidenceType,
  strength: number,
  description: string,
  source: string,
  rawValue: unknown
): ContextEvidence {
  return {
    id: generateEvidenceId(type, source),
    type,
    strength: Math.max(0, Math.min(1, strength)),
    description,
    source,
    rawValue,
    timestamp: Date.now(),
  };
}

/**
 * Extract text content for pattern matching.
 */
function extractSearchableText(input: ContextDetectionInput): string {
  const parts: string[] = [];
  
  // Add assessment responses
  if (input.assessmentResponses) {
    for (const response of input.assessmentResponses) {
      if (typeof response.value === 'string') {
        parts.push(response.value.toLowerCase());
      }
    }
  }
  
  // Add explicit goals
  if (input.explicitGoals) {
    parts.push(...input.explicitGoals.map(g => g.toLowerCase()));
  }
  
  // Add user input
  if (input.userInput) {
    parts.push(input.userInput.toLowerCase());
  }
  
  // Add profile education info
  const academic = input.profile.academic;
  if (academic.currentEducation) {
    parts.push(academic.currentEducation.toLowerCase());
  }
  if (academic.aptitudeExams) {
    parts.push(...academic.aptitudeExams.map(e => e.name.toLowerCase()));
  }
  
  return parts.join(' ');
}

/**
 * Check if text contains any of the keywords.
 */
function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(kw => lowerText.includes(kw.toLowerCase()));
}

/**
 * Calculate match strength based on keyword density.
 */
function calculateKeywordStrength(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matches = 0;
  
  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const count = (lowerText.match(regex) || []).length;
    matches += Math.min(count, 3); // Cap at 3 matches per keyword
  }
  
  // Normalize to 0-1 range
  return Math.min(matches / Math.max(keywords.length * 0.5, 3), 1);
}

// ============================================================================
// ENTRANCE EXAM EXTRACTORS
// ============================================================================

/**
 * Extract JEE preparation signals.
 */
export function extractJeeSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const jeeKeywords = [
    'jee', 'joint entrance', 'iit', 'nit', 'engineering entrance',
    'jee main', 'jee advanced', 'bitsat', 'viteee', 'srmjeee',
    'iit jee', 'iit preparation', 'engineering college',
    'pcm', 'physics chemistry maths', 'maths olympiad'
  ];
  
  // Check for explicit mentions
  if (containsKeywords(text, jeeKeywords)) {
    const strength = calculateKeywordStrength(text, jeeKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.MODERATE),
      'Explicit mention of JEE or engineering entrance exams',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check profile for engineering focus
  const academic = input.profile.academic;
  if (academic.subjectInterests?.includes('Engineering') ||
      academic.subjectInterests?.includes('Technology')) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.MODERATE,
      'Profile shows interest in Engineering/Technology subjects',
      'profile_subject_interests',
      academic.subjectInterests
    ));
  }
  
  // Check for aptitude exams
  const jeeExam = academic.aptitudeExams?.find(
    e => e.name.toLowerCase().includes('jee') ||
         e.name.toLowerCase().includes('bitsat')
  );
  if (jeeExam) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.STRONG,
      `Registered for ${jeeExam.name}`,
      'profile_aptitude_exams',
      jeeExam
    ));
  }
  
  // Check education level (Class 11-12 is typical JEE prep time)
  if (academic.currentEducation?.toLowerCase().includes('12') ||
      academic.currentEducation?.toLowerCase().includes('secondar')) {
    evidence.push(createEvidence(
      EvidenceType.TEMPORAL_INFERENCE,
      EvidenceStrength.WEAK,
      'Education level aligns with typical JEE preparation period',
      'profile_education_level',
      academic.currentEducation
    ));
  }
  
  return evidence;
}

/**
 * Extract NEET preparation signals.
 */
export function extractNeetSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const neetKeywords = [
    'neet', 'medical entrance', 'mbbs', 'bds', 'aiims', 'jipmer',
    'medical college', 'doctor', 'physician', 'medical preparation',
    'biology', 'zoology', 'botany', 'medical exam'
  ];
  
  if (containsKeywords(text, neetKeywords)) {
    const strength = calculateKeywordStrength(text, neetKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.MODERATE),
      'Explicit mention of NEET or medical entrance exams',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check profile
  const academic = input.profile.academic;
  if (academic.subjectInterests?.includes('Medicine') ||
      academic.subjectInterests?.includes('Biology') ||
      academic.subjectInterests?.includes('Healthcare')) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.MODERATE,
      'Profile shows interest in Medicine/Healthcare subjects',
      'profile_subject_interests',
      academic.subjectInterests
    ));
  }
  
  // Check for NEET registration
  const neetExam = academic.aptitudeExams?.find(
    e => e.name.toLowerCase().includes('neet') ||
         e.name.toLowerCase().includes('aiims')
  );
  if (neetExam) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.STRONG,
      `Registered for ${neetExam.name}`,
      'profile_aptitude_exams',
      neetExam
    ));
  }
  
  return evidence;
}

/**
 * Extract UPSC preparation signals.
 */
export function extractUpscSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const upscKeywords = [
    'upsc', 'civil services', 'ias', 'ips', 'ifs', 'pcs',
    'public service commission', 'civil service exam', 'gs paper',
    'prelims', 'mains', 'interview board', 'lukmaan', 'vajiram',
    'chanakya', 'drishti', 'insight', 'forum ias'
  ];
  
  if (containsKeywords(text, upscKeywords)) {
    const strength = calculateKeywordStrength(text, upscKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.MODERATE),
      'Explicit mention of UPSC or civil services',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check for graduation+ (UPSC typically after graduation)
  const academic = input.profile.academic;
  if (academic.currentEducation?.toLowerCase().includes('graduation') ||
      academic.currentEducation?.toLowerCase().includes('bachelor') ||
      academic.currentEducation?.toLowerCase().includes('b.a') ||
      academic.currentEducation?.toLowerCase().includes('b.sc') ||
      academic.currentEducation?.toLowerCase().includes('b.com') ||
      academic.currentEducation?.toLowerCase().includes('b.tech')) {
    evidence.push(createEvidence(
      EvidenceType.TEMPORAL_INFERENCE,
      EvidenceStrength.MODERATE,
      'Education level aligns with typical UPSC preparation timing',
      'profile_education_level',
      academic.currentEducation
    ));
  }
  
  return evidence;
}

/**
 * Extract State PSC signals.
 */
export function extractStatePscSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const statePscKeywords = [
    'state psc', 'state public service', 'mpsc', 'bpsc', 'uppsc',
    'rpsc', 'kpsc', 'tnpsc', 'appsc', 'gpsc', 'mppsc', 'state civil service'
  ];
  
  if (containsKeywords(text, statePscKeywords)) {
    const strength = calculateKeywordStrength(text, statePscKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.MODERATE),
      'Explicit mention of State PSC examinations',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// PROFESSIONAL QUALIFICATION EXTRACTORS
// ============================================================================

/**
 * Extract CA pathway signals.
 */
export function extractCaSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const caKeywords = [
    'ca', 'chartered accountant', 'icai', 'ca foundation', 'ca intermediate',
    'ca final', 'articleship', 'audit', 'taxation', 'accounting professional',
    'cost accounting', 'financial accounting'
  ];
  
  if (containsKeywords(text, caKeywords)) {
    const strength = calculateKeywordStrength(text, caKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of Chartered Accountancy pathway',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check profile for commerce background
  const academic = input.profile.academic;
  if (academic.subjectInterests?.includes('Commerce') ||
      academic.subjectInterests?.includes('Accounting') ||
      academic.subjectInterests?.includes('Finance')) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.MODERATE,
      'Profile shows interest in Commerce/Finance subjects',
      'profile_subject_interests',
      academic.subjectInterests
    ));
  }
  
  return evidence;
}

/**
 * Extract CS pathway signals.
 */
export function extractCsSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const csKeywords = [
    'cs', 'company secretary', 'icsi', 'corporate law', 'compliance',
    'secretarial practice', 'company law', 'board governance'
  ];
  
  if (containsKeywords(text, csKeywords)) {
    const strength = calculateKeywordStrength(text, csKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of Company Secretary pathway',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

/**
 * Extract CMA pathway signals.
 */
export function extractCmaSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const cmaKeywords = [
    'cma', 'cost management accountant', 'icmai', 'cost accountant',
    'management accounting', 'cost accounting india'
  ];
  
  if (containsKeywords(text, cmaKeywords)) {
    const strength = calculateKeywordStrength(text, cmaKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of Cost & Management Accountancy pathway',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// EDUCATION SELECTION EXTRACTORS
// ============================================================================

/**
 * Extract college selection signals.
 */
export function extractCollegeSelectionSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const collegeKeywords = [
    'college selection', 'choosing college', 'college admissions', 'which college',
    'best college', 'college ranking', 'campus selection', 'college comparison',
    'iit vs nit', 'college decision', 'admission process'
  ];
  
  if (containsKeywords(text, collegeKeywords)) {
    const strength = calculateKeywordStrength(text, collegeKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of college selection process',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check education timing
  const academic = input.profile.academic;
  if (academic.currentEducation?.toLowerCase().includes('12') ||
      academic.currentEducation?.toLowerCase().includes('senior secondary')) {
    evidence.push(createEvidence(
      EvidenceType.TEMPORAL_INFERENCE,
      EvidenceStrength.MODERATE,
      'Currently in Class 12, typical college selection period',
      'profile_education_level',
      academic.currentEducation
    ));
  }
  
  return evidence;
}

/**
 * Extract school selection signals.
 */
export function extractSchoolSelectionSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const schoolKeywords = [
    'school selection', 'choosing school', 'which school', 'best school',
    'school admissions', 'cbse vs icse', 'state board', 'school change'
  ];
  
  if (containsKeywords(text, schoolKeywords)) {
    const strength = calculateKeywordStrength(text, schoolKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of school selection',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

/**
 * Extract course selection signals.
 */
export function extractCourseSelectionSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const courseKeywords = [
    'course selection', 'which course', 'choosing major', 'degree selection',
    'b.tech vs b.sc', 'ba vs bcom', 'which branch', 'specialization'
  ];
  
  if (containsKeywords(text, courseKeywords)) {
    const strength = calculateKeywordStrength(text, courseKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of course selection',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// CAREER PHASE EXTRACTORS
// ============================================================================

/**
 * Extract career exploration signals.
 */
export function extractCareerExplorationSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const explorationKeywords = [
    'exploring careers', 'career options', 'what should i do', 'confused about career',
    'many interests', 'don\'t know what to choose', 'career guidance', 'career counseling',
    'too many options', 'undecided', 'figuring out', 'discovering'
  ];
  
  if (containsKeywords(text, explorationKeywords)) {
    const strength = calculateKeywordStrength(text, explorationKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of career exploration or indecision',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check for diverse interests (no clear singular focus)
  const academic = input.profile.academic;
  if (academic.subjectInterests && academic.subjectInterests.length > 3) {
    evidence.push(createEvidence(
      EvidenceType.PATTERN_MATCH,
      EvidenceStrength.MODERATE,
      'Multiple diverse subject interests suggest exploration phase',
      'profile_subject_interests',
      academic.subjectInterests
    ));
  }
  
  return evidence;
}

/**
 * Extract early career signals.
 */
export function extractEarlyCareerSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const earlyCareerKeywords = [
    'first job', 'starting career', 'fresh graduate', 'recent graduate',
    'entry level', '0-2 years experience', 'new professional', 'campus placement',
    'just started working', 'first company'
  ];
  
  if (containsKeywords(text, earlyCareerKeywords)) {
    const strength = calculateKeywordStrength(text, earlyCareerKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of being in early career stage',
      'assessment_goals_input',
      text
    ));
  }
  
  // Note: Experience data would be checked here if available in profile
  
  return evidence;
}

/**
 * Extract mid career signals.
 */
export function extractMidCareerSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const midCareerKeywords = [
    '5+ years experience', 'mid level', 'senior professional', 'experienced',
    'career growth', 'promotion', 'management track', 'team lead'
  ];
  
  if (containsKeywords(text, midCareerKeywords)) {
    const strength = calculateKeywordStrength(text, midCareerKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of mid-career stage',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// CAREER TRANSITION EXTRACTORS
// ============================================================================

/**
 * Extract career switch signals.
 */
export function extractCareerSwitchSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const switchKeywords = [
    'career change', 'switching careers', 'new career', 'different field',
    'leaving current job', 'pivot', 'career transition', 'retrain',
    'reskill', 'domain change', 'industry change', 'not happy with current'
  ];
  
  if (containsKeywords(text, switchKeywords)) {
    const strength = calculateKeywordStrength(text, switchKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of career switching intent',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

/**
 * Extract industry transition signals.
 */
export function extractIndustryTransitionSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const transitionKeywords = [
    'industry change', 'changing industry', 'it to finance', 'tech to healthcare',
    'manufacturing to software', 'industry switch', 'new sector'
  ];
  
  if (containsKeywords(text, transitionKeywords)) {
    const strength = calculateKeywordStrength(text, transitionKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of industry transition',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// ENTREPRENEURIAL EXTRACTORS
// ============================================================================

/**
 * Extract startup exploration signals.
 */
export function extractStartupExplorationSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const startupKeywords = [
    'startup idea', 'want to start', 'entrepreneurship', 'business idea',
    'startup ecosystem', 'founder', 'co-founder', 'venture', 'pitch deck',
    'funding', 'angel investor', 'product idea', 'solving problem',
    'side project', 'weekend project'
  ];
  
  if (containsKeywords(text, startupKeywords)) {
    const strength = calculateKeywordStrength(text, startupKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of startup or entrepreneurship interest',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check for entrepreneurial motivation
  const motivations = input.profile.motivations;
  if (motivations?.autonomy > 0.7) {
    evidence.push(createEvidence(
      EvidenceType.IMPLICIT_SIGNAL,
      EvidenceStrength.MODERATE,
      'High autonomy motivation suggests entrepreneurial inclination',
      'profile_motivations',
      motivations
    ));
  }
  
  return evidence;
}

/**
 * Extract entrepreneurship building signals.
 */
export function extractEntrepreneurshipBuildingSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const buildingKeywords = [
    'building startup', 'running business', 'my company', 'my startup',
    'founded', 'incorporated', 'registered company', 'revenue',
    'customers', 'product launched', 'mvp built', 'hiring team'
  ];
  
  if (containsKeywords(text, buildingKeywords)) {
    const strength = calculateKeywordStrength(text, buildingKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of actively building/running a business',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// FAMILY CONTEXT EXTRACTORS
// ============================================================================

/**
 * Extract family business signals.
 */
export function extractFamilyBusinessSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const familyBusinessKeywords = [
    'family business', 'family company', 'joining business', 'taking over',
    'father\'s business', 'family firm', 'generational business', 'legacy',
    'succession', 'family enterprise'
  ];
  
  if (containsKeywords(text, familyBusinessKeywords)) {
    const strength = calculateKeywordStrength(text, familyBusinessKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of family business involvement',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check constraints
  const constraints = input.profile.constraints;
  if (constraints?.familyExpectations === 'family_business') {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.STRONG,
      'Profile indicates family business expectations',
      'profile_family_constraints',
      constraints.familyExpectations
    ));
  }
  
  return evidence;
}

// ============================================================================
// CONSTRAINT-DRIVEN EXTRACTORS
// ============================================================================

/**
 * Extract regional constraint signals.
 */
export function extractRegionalConstraintSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const regionalKeywords = [
    'can\'t leave', 'staying in', 'restricted to', 'hometown only',
    'regional college', 'local opportunities', 'can\'t relocate', 'family nearby',
    'tier 2 city', 'tier 3 city', 'small town', 'rural area'
  ];
  
  if (containsKeywords(text, regionalKeywords)) {
    const strength = calculateKeywordStrength(text, regionalKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of geographic or regional constraints',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check profile constraints
  const constraints = input.profile.constraints;
  if (constraints?.geographicLimitation) {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.STRONG,
      'Profile indicates geographic limitations',
      'profile_geographic_constraints',
      constraints.geographicLimitation
    ));
  }
  
  return evidence;
}

/**
 * Extract financial constraint signals.
 */
export function extractFinancialConstraintSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const financialKeywords = [
    'can\'t afford', 'financial constraints', 'budget', 'scholarship needed',
    'education loan', 'family income', 'limited resources', 'cost sensitive',
    'affordable', 'roi important', 'return on investment'
  ];
  
  if (containsKeywords(text, financialKeywords)) {
    const strength = calculateKeywordStrength(text, financialKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of financial constraints or budget considerations',
      'assessment_goals_input',
      text
    ));
  }
  
  // Check profile constraints
  const constraints = input.profile.constraints;
  if (constraints?.financialSupport === 'scholarship_required' ||
      constraints?.financialSupport === 'loan_dependent') {
    evidence.push(createEvidence(
      EvidenceType.EDUCATION_DATA,
      EvidenceStrength.STRONG,
      'Profile indicates financial limitations',
      'profile_financial_constraints',
      constraints.financialSupport
    ));
  }
  
  return evidence;
}

/**
 * Extract time constraint signals.
 */
export function extractTimeConstraintSignals(input: ContextDetectionInput): ContextEvidence[] {
  const evidence: ContextEvidence[] = [];
  const text = extractSearchableText(input);
  
  const timeKeywords = [
    'no time', 'time constraint', 'working full time', 'can\'t study full time',
    'evenings only', 'weekends only', 'limited time', 'time poor',
    'busy schedule', 'part time study', 'distance learning'
  ];
  
  if (containsKeywords(text, timeKeywords)) {
    const strength = calculateKeywordStrength(text, timeKeywords);
    evidence.push(createEvidence(
      EvidenceType.EXPLICIT_ANSWER,
      Math.max(strength, EvidenceStrength.STRONG),
      'Explicit mention of time constraints',
      'assessment_goals_input',
      text
    ));
  }
  
  return evidence;
}

// ============================================================================
// EXTRACTOR REGISTRY
// ============================================================================

/**
 * Maps each context type to its signal extractor function.
 * 
 * This registry enables the detection engine to route to the appropriate
 * extractor for each context type. New context types can be added here
 * without modifying the core detection logic.
 */
export const CONTEXT_EXTRACTORS: Record<
  DecisionContextType,
  (input: ContextDetectionInput) => ContextEvidence[]
> = {
  [DecisionContextType.JEE_PREPARATION]: extractJeeSignals,
  [DecisionContextType.NEET_PREPARATION]: extractNeetSignals,
  [DecisionContextType.UPSC_PREPARATION]: extractUpscSignals,
  [DecisionContextType.STATE_PSC_PREPARATION]: extractStatePscSignals,
  [DecisionContextType.CA_PATHWAY]: extractCaSignals,
  [DecisionContextType.CS_PATHWAY]: extractCsSignals,
  [DecisionContextType.CMA_PATHWAY]: extractCmaSignals,
  [DecisionContextType.COLLEGE_SELECTION]: extractCollegeSelectionSignals,
  [DecisionContextType.SCHOOL_SELECTION]: extractSchoolSelectionSignals,
  [DecisionContextType.COURSE_SELECTION]: extractCourseSelectionSignals,
  [DecisionContextType.CAREER_EXPLORATION]: extractCareerExplorationSignals,
  [DecisionContextType.EARLY_CAREER]: extractEarlyCareerSignals,
  [DecisionContextType.MID_CAREER]: extractMidCareerSignals,
  [DecisionContextType.CAREER_SWITCH]: extractCareerSwitchSignals,
  [DecisionContextType.INDUSTRY_TRANSITION]: extractIndustryTransitionSignals,
  [DecisionContextType.STARTUP_EXPLORATION]: extractStartupExplorationSignals,
  [DecisionContextType.ENTREPRENEURSHIP_BUILDING]: extractEntrepreneurshipBuildingSignals,
  [DecisionContextType.FAMILY_BUSINESS]: extractFamilyBusinessSignals,
  [DecisionContextType.REGIONAL_CONSTRAINT]: extractRegionalConstraintSignals,
  [DecisionContextType.FINANCIAL_CONSTRAINT]: extractFinancialConstraintSignals,
  [DecisionContextType.TIME_CONSTRAINT]: extractTimeConstraintSignals,
};

/**
 * Get the extractor function for a specific context type.
 */
export function getExtractorForContext(
  contextType: DecisionContextType
): (input: ContextDetectionInput) => ContextEvidence[] {
  return CONTEXT_EXTRACTORS[contextType] || (() => []);
}

/**
 * Extract signals for all enabled contexts.
 */
export function extractAllSignals(
  input: ContextDetectionInput,
  enabledContexts: DecisionContextType[]
): Map<DecisionContextType, ContextEvidence[]> {
  const signals = new Map<DecisionContextType, ContextEvidence[]>();
  
  for (const contextType of enabledContexts) {
    const extractor = getExtractorForContext(contextType);
    const evidence = extractor(input);
    
    if (evidence.length > 0) {
      signals.set(contextType, evidence);
    }
  }
  
  return signals;
}
