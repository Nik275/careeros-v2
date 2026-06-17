import type { AssessmentPsychologyData } from './assessmentQuestions';

export interface ResultAssessmentData {
  psychology: AssessmentPsychologyData;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  salaryRange: string;
  fitScore: number;
  whyFits: string;
  answerPattern: string;
  tradeoff: string;
  nextStep: string;
  avoidIf: string;
  indiaContext: string;
  matchedSignals: string[];
}

export type ResultConfidenceLabel = 'Initial Clarity' | 'Strong Clarity' | 'Needs More Exploration';

export interface CareerResultIntelligence {
  archetype: {
    name: string;
    description: string;
    match: number;
  };
  confidence: {
    label: ResultConfidenceLabel;
    score: number;
    rationale: string;
  };
  summary: {
    decisionPattern: string;
    strongestSignals: string;
    hiddenTension: string;
    whatNotIgnore: string;
  };
  paths: {
    naturalFit: CareerRecommendation;
    longTermOutcome: CareerRecommendation;
    balanced: CareerRecommendation;
  };
  recommendations: CareerRecommendation[];
  nextSevenDayAction: string;
  testBeforeChoosing: string;
  comebackPrompt: string;
}

interface CareerCandidate {
  id: string;
  title: string;
  salaryRange: string;
  indiaContext: string;
  weights: Record<string, number>;
  outcomeScore: number;
  stabilityScore: number;
  autonomyScore: number;
  whyFits: string;
  tradeoff: string;
  nextStep: string;
  avoidIf: string;
}

const SIGNAL_LABELS: Record<string, string> = {
  creativity: 'creation',
  impact: 'impact',
  mastery: 'mastery',
  independence: 'autonomy',
  security: 'security',
  recognition: 'recognition',
  analytical: 'analytical problem-solving',
  creative: 'creative thinking',
  social: 'people connection',
  practical: 'hands-on execution',
  organizing: 'planning',
  leading: 'leadership',
  structured: 'structured work',
  flexible: 'adaptive work',
  collaborative: 'collaboration',
  independent: 'deep independent work',
  worklife: 'work-life balance',
  growth: 'growth',
  purpose: 'purpose',
  financial: 'financial upside',
  stability: 'job stability',
  office: 'office environment',
  remote: 'remote flexibility',
  field: 'field activity',
  hybrid: 'hybrid variety',
  earning_now: 'immediate earning urgency',
  earning_6_months: 'near-term earning need',
  earning_1_2_years: '1-2 year earning runway',
  explore_longer: 'longer exploration runway',
  family_very_strong: 'strong family expectation',
  family_somewhat: 'family expectation to negotiate',
  family_little: 'low family pressure',
  self_directed: 'independent decision ownership',
  risk_stable: 'low-risk preference',
  risk_balanced: 'managed risk tolerance',
  risk_high_growth: 'high-growth risk tolerance',
  risk_founder: 'founder-style risk tolerance',
  academic_strong: 'strong academics',
  academic_steady: 'steady academics',
  academic_inconsistent: 'inconsistent academics',
  academic_practical: 'practical learning bias',
  learning_daily: 'daily learning discipline',
  learning_weekly: 'weekly deep-work discipline',
  learning_deadline: 'deadline-driven learning',
  learning_needs_structure: 'needs learning structure',
  social_high_collab: 'high collaboration energy',
  social_small_team: 'small-team energy',
  social_one_on_one: 'one-on-one influence',
  social_solo: 'solo focus energy',
  ambiguity_curious: 'curiosity under ambiguity',
  ambiguity_milestones: 'milestone-based ambiguity tolerance',
  ambiguity_anxious: 'ambiguity anxiety',
  ambiguity_avoid: 'low ambiguity tolerance',
  location_relocate: 'relocation flexibility',
  location_hybrid_nearby: 'nearby hybrid constraint',
  location_remote: 'remote-first preference',
  location_family_close: 'family-proximity constraint',
  proof_shipped: 'shipped proof',
  proof_internship: 'work exposure proof',
  proof_coursework: 'coursework proof',
  proof_starting: 'early proof stage',
  regret_low_income: 'income regret fear',
  regret_wasting_years: 'wasted-years regret fear',
  regret_wrong_fit: 'wrong-fit regret fear',
  regret_disappoint_family: 'family-disappointment regret fear',
  regret_missed_potential: 'missed-potential regret fear',
};

const CAREER_CANDIDATES: CareerCandidate[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    salaryRange: '₹6-14 LPA early-career; ₹14-32 LPA with 3-5 years in strong product teams',
    indiaContext: 'Strong India demand across SaaS, fintech, GCCs, and remote engineering teams.',
    weights: { analytical: 18, practical: 16, mastery: 14, growth: 11, financial: 10, independent: 8, structured: 5, remote: 6 },
    outcomeScore: 90,
    stabilityScore: 72,
    autonomyScore: 70,
    whyFits: 'Your analytical and hands-on signals point toward building real systems, not only discussing ideas.',
    tradeoff: 'Requires consistent skill compounding; weak portfolios or shallow coding practice get filtered quickly.',
    nextStep: 'Build one deployable project with auth, data, and a clean README in the next 7 days.',
    avoidIf: 'Avoid this if you dislike long periods of debugging or independent technical practice.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    salaryRange: '₹4.5-9 LPA early-career; ₹10-20 LPA with analytics depth and domain ownership',
    indiaContext: 'Realistic entry path in Indian startups, services firms, analytics teams, and GCCs.',
    weights: { analytical: 18, organizing: 12, structured: 12, security: 8, stability: 8, office: 5, financial: 5 },
    outcomeScore: 74,
    stabilityScore: 78,
    autonomyScore: 48,
    whyFits: 'Your pattern favors clarity, structure, and evidence-based decisions, which suits analytics work.',
    tradeoff: 'Can become dashboard-only work unless you learn business context and storytelling.',
    nextStep: 'Analyze one public Indian dataset and write a one-page business insight memo.',
    avoidIf: 'Avoid this if you want constant creative freedom or hate repetitive data cleanup.',
  },
  {
    id: 'product-designer',
    title: 'Product Designer',
    salaryRange: '₹5-12 LPA early-career; ₹12-28 LPA with portfolio proof and 3-5 years',
    indiaContext: 'Strong in SaaS, fintech, consumer apps, and design-forward startups; portfolio matters more than degree alone.',
    weights: { creativity: 15, creative: 17, analytical: 8, impact: 9, independence: 7, flexible: 8, worklife: 5, remote: 6 },
    outcomeScore: 79,
    stabilityScore: 58,
    autonomyScore: 78,
    whyFits: 'You show a creation plus problem-solving pattern, which points to solving human problems through product experiences.',
    tradeoff: 'Requires portfolio proof, critique tolerance, and user research; visual taste alone is not enough.',
    nextStep: 'Create two product redesign case studies with problem, research, decisions, and before/after screens.',
    avoidIf: 'Avoid this if ambiguous feedback or user interviews drain you.',
  },
  {
    id: 'ux-researcher',
    title: 'UX Researcher',
    salaryRange: '₹5-11 LPA early-career; ₹12-24 LPA with mixed-method research experience',
    indiaContext: 'Niche but valuable in mature product teams, fintech, edtech, and enterprise SaaS.',
    weights: { social: 14, analytical: 12, impact: 13, purpose: 10, collaborative: 10, organizing: 8, worklife: 5 },
    outcomeScore: 70,
    stabilityScore: 55,
    autonomyScore: 56,
    whyFits: 'Your people-understanding and analytical signals fit roles that uncover why users behave the way they do.',
    tradeoff: 'Pure research roles are fewer than design or analytics roles in India, so you may need a hybrid UX/product skill set.',
    nextStep: 'Run five synthetic user interviews and convert findings into a research report.',
    avoidIf: 'Avoid this if you dislike listening patiently or turning messy qualitative data into clear evidence.',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    salaryRange: '₹10-22 LPA after credible internships or adjacent experience; ₹22-45 LPA at 3-5 years in strong teams',
    indiaContext: 'High ceiling in India, but early entry is competitive and usually needs product, tech, design, or business proof.',
    weights: { leading: 15, analytical: 12, collaborative: 12, financial: 8, growth: 10, recognition: 8, flexible: 8, impact: 8 },
    outcomeScore: 88,
    stabilityScore: 62,
    autonomyScore: 64,
    whyFits: 'Your leadership, collaboration, and analytical signals fit work that coordinates teams around product decisions.',
    tradeoff: 'This is not an entry shortcut; you need proof of judgment, execution, and user understanding.',
    nextStep: 'Write a one-page product teardown with user problem, metrics, tradeoffs, and an improvement plan.',
    avoidIf: 'Avoid this if you want clear instructions and dislike negotiating tradeoffs with multiple stakeholders.',
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    salaryRange: '₹5-10 LPA early-career; ₹12-30 LPA with cloud/security depth and certifications',
    indiaContext: 'Growing India demand across fintech, enterprise, compliance-heavy firms, and managed security providers.',
    weights: { analytical: 16, structured: 12, security: 14, stability: 10, mastery: 10, organizing: 8, office: 4 },
    outcomeScore: 82,
    stabilityScore: 82,
    autonomyScore: 48,
    whyFits: 'Your security, structure, and problem-solving signals fit defensive technical work with clear stakes.',
    tradeoff: 'Can involve alert fatigue, compliance pressure, and odd-hour incident response.',
    nextStep: 'Complete one beginner SOC lab and document the attack, detection, and response steps.',
    avoidIf: 'Avoid this if high-stakes monitoring or strict process work makes you restless.',
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud/DevOps Engineer',
    salaryRange: '₹7-16 LPA early-career; ₹18-38 LPA with production cloud ownership',
    indiaContext: 'Strong upside in SaaS, platform teams, GCCs, and remote infrastructure roles.',
    weights: { practical: 16, analytical: 14, structured: 10, mastery: 12, financial: 9, stability: 6, growth: 8 },
    outcomeScore: 87,
    stabilityScore: 76,
    autonomyScore: 60,
    whyFits: 'Your hands-on and systems signals fit reliability work where practical execution matters daily.',
    tradeoff: 'On-call expectations and production incidents can be stressful.',
    nextStep: 'Deploy a small app with CI, environment variables, logging, and rollback notes.',
    avoidIf: 'Avoid this if infrastructure details and failure debugging feel tedious.',
  },
  {
    id: 'ai-automation-builder',
    title: 'AI Automation Builder',
    salaryRange: '₹6-15 LPA early-career; high upside in metro/startup/remote roles with strong shipped proof',
    indiaContext: 'Emerging India path across small businesses, startups, operations teams, and creator-led services.',
    weights: { creativity: 13, practical: 16, analytical: 12, independence: 14, growth: 10, flexible: 9, remote: 10, financial: 8 },
    outcomeScore: 85,
    stabilityScore: 48,
    autonomyScore: 90,
    whyFits: 'Your builder-autonomy pattern fits creating useful automations where speed and practical outcomes matter.',
    tradeoff: 'The market is noisy; you need proof of business value, not just tool familiarity.',
    nextStep: 'Build one automation for a real workflow using synthetic data and record the before/after time saved.',
    avoidIf: 'Avoid this if uncertainty, self-selling, or fast tool changes make you anxious.',
  },
  {
    id: 'digital-marketer',
    title: 'Digital Marketer',
    salaryRange: '₹3.5-8 LPA early-career; ₹10-22 LPA with performance ownership and strong metrics',
    indiaContext: 'Broad India demand across D2C, education, local services, SaaS, and creator businesses.',
    weights: { creative: 12, social: 10, recognition: 9, flexible: 10, financial: 8, growth: 8, field: 4, collaborative: 6 },
    outcomeScore: 68,
    stabilityScore: 48,
    autonomyScore: 70,
    whyFits: 'Your communication, creativity, and growth signals can convert into measurable audience and revenue work.',
    tradeoff: 'Low-quality roles exist; you need metrics, experiments, and channel depth to avoid commodity work.',
    nextStep: 'Run a 7-day content or ad-copy experiment and track one clear metric.',
    avoidIf: 'Avoid this if public feedback, iteration, or numbers-driven creative work feels uncomfortable.',
  },
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    salaryRange: '₹5-10 LPA early-career; ₹12-24 LPA with domain and stakeholder ownership',
    indiaContext: 'Common bridge role in IT services, consulting delivery, BFSI, SaaS, and enterprise teams.',
    weights: { analytical: 12, organizing: 12, collaborative: 10, structured: 9, office: 6, security: 6, growth: 6 },
    outcomeScore: 72,
    stabilityScore: 72,
    autonomyScore: 48,
    whyFits: 'Your planning and problem-framing signals fit translating business needs into executable systems work.',
    tradeoff: 'Can become documentation-heavy unless you build domain depth and product judgment.',
    nextStep: 'Map one app feature into user stories, edge cases, and acceptance criteria.',
    avoidIf: 'Avoid this if meetings, ambiguity, and stakeholder follow-up frustrate you.',
  },
  {
    id: 'founder-freelancer',
    title: 'Founder / Freelancer Path',
    salaryRange: '₹0-8 LPA equivalent early; high upside only after validated demand and repeatable acquisition',
    indiaContext: 'Viable in India with low-cost distribution, services, products, or creator-led niches, but income is uneven early.',
    weights: { independence: 18, creativity: 14, leading: 10, financial: 10, flexible: 11, remote: 9, recognition: 7, practical: 8 },
    outcomeScore: 82,
    stabilityScore: 24,
    autonomyScore: 98,
    whyFits: 'Your autonomy and creation signals point toward paths where you own the problem, offer, and execution.',
    tradeoff: 'Income instability is real; this is risky without a monetizable skill stack and distribution channel.',
    nextStep: 'Validate one paid problem with five target users before building anything.',
    avoidIf: 'Avoid this as a primary path if financial stability is non-negotiable right now.',
  },
  {
    id: 'government-exam-path',
    title: 'Government Exam Path',
    salaryRange: '₹5-12 LPA equivalent with allowances after selection; upside is stability more than rapid income growth',
    indiaContext: 'India-specific path for stability, status, public service, and family-aligned predictability.',
    weights: { security: 18, stability: 18, structured: 14, recognition: 8, purpose: 8, organizing: 8, office: 6, worklife: 5 },
    outcomeScore: 64,
    stabilityScore: 96,
    autonomyScore: 26,
    whyFits: 'Your stability and structure signals support a disciplined exam path with predictable long-term benefits.',
    tradeoff: 'Opportunity cost is high; years of prep can close private-sector momentum if not time-boxed.',
    nextStep: 'Choose one exam track and set a 90-day diagnostic score target before committing years.',
    avoidIf: 'Avoid this if autonomy, fast growth, or creative work are central to your motivation.',
  },
  {
    id: 'teaching-mentoring',
    title: 'Teaching / Mentoring Path',
    salaryRange: '₹3.5-8 LPA early-career; ₹10-25 LPA with niche expertise, edtech, or creator-led courses',
    indiaContext: 'Strong India relevance across schools, coaching, edtech, tutoring, and skill-based mentoring.',
    weights: { impact: 16, social: 16, purpose: 14, mastery: 10, collaborative: 8, worklife: 8, stability: 5, field: 5 },
    outcomeScore: 62,
    stabilityScore: 60,
    autonomyScore: 58,
    whyFits: 'Your impact and people signals fit helping others learn, gain confidence, and make better decisions.',
    tradeoff: 'Income ceiling varies sharply unless you specialize, build reputation, or use scalable channels.',
    nextStep: 'Teach one 45-minute session to a peer and collect feedback on clarity and energy.',
    avoidIf: 'Avoid this if repeating concepts patiently drains you.',
  },
  {
    id: 'design-content',
    title: 'Design / Content Path',
    salaryRange: '₹3.5-8 LPA early-career; ₹10-24 LPA with niche portfolio, brand outcomes, or independent clients',
    indiaContext: 'Works in agencies, startups, creator businesses, D2C brands, and freelance markets.',
    weights: { creativity: 18, creative: 16, recognition: 9, independence: 8, flexible: 9, remote: 8, purpose: 5 },
    outcomeScore: 60,
    stabilityScore: 38,
    autonomyScore: 82,
    whyFits: 'Your creative expression signals fit output-driven work where taste and consistency compound.',
    tradeoff: 'The market rewards visible proof; generic portfolios are easy to ignore.',
    nextStep: 'Publish seven pieces or one mini brand system in seven days and review what gets traction.',
    avoidIf: 'Avoid this as a primary path if you need predictable income immediately.',
  },
  {
    id: 'sales-business-development',
    title: 'Sales / Business Development',
    salaryRange: '₹4-9 LPA early-career; ₹12-30 LPA with strong incentives and enterprise selling',
    indiaContext: 'India-relevant in SaaS, edtech, real estate, BFSI, B2B services, and startup growth teams.',
    weights: { social: 16, leading: 12, recognition: 11, financial: 12, field: 10, collaborative: 8, flexible: 6 },
    outcomeScore: 70,
    stabilityScore: 44,
    autonomyScore: 62,
    whyFits: 'Your people, recognition, and financial signals can translate into persuasion and relationship-led growth.',
    tradeoff: 'Rejection and targets are unavoidable; income can depend heavily on performance.',
    nextStep: 'Practice ten discovery calls with a synthetic product and write the objections you hear.',
    avoidIf: 'Avoid this if rejection, targets, or frequent follow-up feels emotionally costly.',
  },
  {
    id: 'finance-accounting',
    title: 'Finance / Accounting Path',
    salaryRange: '₹4-9 LPA early-career; ₹10-22 LPA with CA/CFA/domain depth and corporate finance exposure',
    indiaContext: 'Stable India path across accounting firms, BFSI, corporate finance, tax, and compliance.',
    weights: { analytical: 12, structured: 14, organizing: 12, security: 10, stability: 12, financial: 8, office: 6 },
    outcomeScore: 72,
    stabilityScore: 84,
    autonomyScore: 34,
    whyFits: 'Your structure and analytical signals support detail-heavy financial decision work.',
    tradeoff: 'Credential pathways can be long and exam-heavy; routine compliance work may feel narrow.',
    nextStep: 'Complete a basic financial statement analysis and test whether the detail work energizes you.',
    avoidIf: 'Avoid this if repeated precision work or formal credential tracks feel suffocating.',
  },
  {
    id: 'healthcare-tech-ops',
    title: 'Healthcare-Adjacent Tech / Operations',
    salaryRange: '₹4.5-10 LPA early-career; ₹12-25 LPA with healthtech domain and operations ownership',
    indiaContext: 'Growing in Indian healthtech, hospitals, insurance, diagnostics, and care-delivery operations.',
    weights: { impact: 15, analytical: 10, organizing: 10, purpose: 14, structured: 8, collaborative: 8, stability: 7 },
    outcomeScore: 68,
    stabilityScore: 70,
    autonomyScore: 44,
    whyFits: 'Your purpose and structured problem-solving signals fit work where operational precision affects human outcomes.',
    tradeoff: 'Healthcare domains can be slow, regulated, and emotionally demanding.',
    nextStep: 'Map one patient or clinic workflow and identify three operational bottlenecks.',
    avoidIf: 'Avoid this if healthcare complexity or slow institutional change frustrates you.',
  },
  {
    id: 'legal-tech-business-ops',
    title: 'Legal-Tech / Business Operations',
    salaryRange: '₹4.5-10 LPA early-career; ₹12-24 LPA with compliance, contracts, and process ownership',
    indiaContext: 'Relevant in Indian startups, SaaS, fintech, compliance teams, and operations-heavy businesses.',
    weights: { structured: 13, organizing: 14, analytical: 10, security: 10, stability: 8, collaborative: 7, office: 5 },
    outcomeScore: 66,
    stabilityScore: 76,
    autonomyScore: 40,
    whyFits: 'Your planning and structure signals fit roles that reduce business risk through clear process and documentation.',
    tradeoff: 'Can be document-heavy and slower-moving than product or growth roles.',
    nextStep: 'Review one sample contract or policy and summarize risks, owners, and next actions.',
    avoidIf: 'Avoid this if careful reading and process discipline feel draining.',
  },
];

const CONTEXT_SIGNAL_WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  earning_now: {
    'sales-business-development': 16,
    'digital-marketer': 12,
    'business-analyst': 10,
    'data-analyst': 8,
    'finance-accounting': 8,
    'ai-automation-builder': 6,
    'founder-freelancer': -16,
    'government-exam-path': -12,
    'product-manager': -8,
  },
  earning_6_months: {
    'sales-business-development': 12,
    'digital-marketer': 10,
    'business-analyst': 9,
    'data-analyst': 8,
    'software-engineer': 5,
    'founder-freelancer': -8,
    'government-exam-path': -8,
  },
  earning_1_2_years: {
    'software-engineer': 9,
    'cloud-devops-engineer': 8,
    'cybersecurity-analyst': 7,
    'product-designer': 6,
    'data-analyst': 6,
    'government-exam-path': 3,
  },
  explore_longer: {
    'product-manager': 8,
    'software-engineer': 7,
    'government-exam-path': 7,
    'cybersecurity-analyst': 6,
    'founder-freelancer': 5,
  },
  family_very_strong: {
    'government-exam-path': 18,
    'finance-accounting': 13,
    'cybersecurity-analyst': 12,
    'software-engineer': 8,
    'business-analyst': 8,
    'founder-freelancer': -14,
    'design-content': -8,
  },
  family_somewhat: {
    'software-engineer': 6,
    'business-analyst': 6,
    'finance-accounting': 5,
    'product-manager': 4,
  },
  family_little: {
    'ai-automation-builder': 5,
    'product-designer': 5,
    'digital-marketer': 5,
    'design-content': 4,
  },
  self_directed: {
    'founder-freelancer': 10,
    'ai-automation-builder': 8,
    'product-designer': 6,
    'software-engineer': 5,
  },
  risk_stable: {
    'government-exam-path': 18,
    'finance-accounting': 14,
    'cybersecurity-analyst': 12,
    'data-analyst': 10,
    'business-analyst': 10,
    'founder-freelancer': -18,
    'design-content': -8,
  },
  risk_balanced: {
    'software-engineer': 8,
    'product-manager': 7,
    'business-analyst': 7,
    'product-designer': 6,
    'healthcare-tech-ops': 5,
  },
  risk_high_growth: {
    'software-engineer': 9,
    'product-manager': 9,
    'ai-automation-builder': 9,
    'cloud-devops-engineer': 8,
    'sales-business-development': 7,
    'government-exam-path': -10,
  },
  risk_founder: {
    'founder-freelancer': 20,
    'ai-automation-builder': 14,
    'design-content': 10,
    'digital-marketer': 8,
    'sales-business-development': 7,
    'government-exam-path': -16,
  },
  academic_strong: {
    'software-engineer': 8,
    'finance-accounting': 8,
    'government-exam-path': 8,
    'cybersecurity-analyst': 7,
    'product-manager': 5,
  },
  academic_steady: {
    'business-analyst': 6,
    'data-analyst': 6,
    'software-engineer': 5,
    'healthcare-tech-ops': 5,
  },
  academic_inconsistent: {
    'government-exam-path': -10,
    'finance-accounting': -6,
    'digital-marketer': 7,
    'design-content': 7,
    'sales-business-development': 6,
    'ai-automation-builder': 6,
  },
  academic_practical: {
    'ai-automation-builder': 10,
    'cloud-devops-engineer': 9,
    'sales-business-development': 8,
    'product-designer': 8,
    'software-engineer': 6,
  },
  learning_daily: {
    'software-engineer': 8,
    'cybersecurity-analyst': 8,
    'cloud-devops-engineer': 8,
    'finance-accounting': 6,
    'government-exam-path': 6,
  },
  learning_weekly: {
    'product-designer': 6,
    'data-analyst': 6,
    'business-analyst': 6,
    'teaching-mentoring': 5,
  },
  learning_deadline: {
    'digital-marketer': 7,
    'sales-business-development': 7,
    'product-manager': 6,
    'business-analyst': 5,
  },
  learning_needs_structure: {
    'government-exam-path': 8,
    'finance-accounting': 7,
    'cybersecurity-analyst': 6,
    'data-analyst': 5,
  },
  social_high_collab: {
    'product-manager': 9,
    'sales-business-development': 9,
    'teaching-mentoring': 8,
    'business-analyst': 7,
    'ux-researcher': 7,
  },
  social_small_team: {
    'software-engineer': 6,
    'product-designer': 6,
    'business-analyst': 5,
    'healthcare-tech-ops': 5,
  },
  social_one_on_one: {
    'sales-business-development': 10,
    'teaching-mentoring': 9,
    'ux-researcher': 8,
    'digital-marketer': 5,
  },
  social_solo: {
    'software-engineer': 8,
    'cybersecurity-analyst': 7,
    'data-analyst': 6,
    'finance-accounting': 5,
  },
  ambiguity_curious: {
    'product-manager': 8,
    'ai-automation-builder': 8,
    'founder-freelancer': 7,
    'ux-researcher': 6,
  },
  ambiguity_milestones: {
    'software-engineer': 6,
    'product-designer': 6,
    'business-analyst': 6,
    'data-analyst': 5,
  },
  ambiguity_anxious: {
    'government-exam-path': 10,
    'finance-accounting': 8,
    'cybersecurity-analyst': 7,
    'founder-freelancer': -12,
    'ai-automation-builder': -6,
  },
  ambiguity_avoid: {
    'government-exam-path': 13,
    'finance-accounting': 10,
    'data-analyst': 8,
    'business-analyst': 8,
    'founder-freelancer': -14,
  },
  location_relocate: {
    'software-engineer': 7,
    'product-manager': 7,
    'cloud-devops-engineer': 6,
    'finance-accounting': 5,
  },
  location_hybrid_nearby: {
    'business-analyst': 6,
    'data-analyst': 6,
    'finance-accounting': 5,
    'healthcare-tech-ops': 5,
  },
  location_remote: {
    'software-engineer': 8,
    'ai-automation-builder': 8,
    'product-designer': 7,
    'design-content': 7,
    'digital-marketer': 5,
  },
  location_family_close: {
    'government-exam-path': 9,
    'finance-accounting': 8,
    'teaching-mentoring': 7,
    'business-analyst': 6,
    'software-engineer': -4,
  },
  proof_shipped: {
    'software-engineer': 9,
    'product-designer': 9,
    'ai-automation-builder': 9,
    'design-content': 8,
  },
  proof_internship: {
    'product-manager': 8,
    'business-analyst': 8,
    'finance-accounting': 7,
    'healthcare-tech-ops': 6,
  },
  proof_coursework: {
    'data-analyst': 6,
    'cybersecurity-analyst': 6,
    'finance-accounting': 5,
    'software-engineer': 4,
  },
  proof_starting: {
    'digital-marketer': 6,
    'teaching-mentoring': 5,
    'business-analyst': 4,
    'product-manager': -7,
    'cloud-devops-engineer': -5,
  },
  regret_low_income: {
    'software-engineer': 9,
    'cloud-devops-engineer': 9,
    'product-manager': 8,
    'sales-business-development': 8,
    'finance-accounting': 6,
    'teaching-mentoring': -4,
  },
  regret_wasting_years: {
    'business-analyst': 8,
    'data-analyst': 7,
    'digital-marketer': 7,
    'sales-business-development': 7,
    'government-exam-path': -12,
  },
  regret_wrong_fit: {
    'ux-researcher': 7,
    'product-designer': 6,
    'teaching-mentoring': 6,
    'business-analyst': 5,
  },
  regret_disappoint_family: {
    'government-exam-path': 10,
    'finance-accounting': 8,
    'software-engineer': 7,
    'cybersecurity-analyst': 7,
    'founder-freelancer': -8,
  },
  regret_missed_potential: {
    'software-engineer': 8,
    'product-manager': 8,
    'ai-automation-builder': 8,
    'founder-freelancer': 7,
    'cloud-devops-engineer': 7,
  },
};

function selectedSignals(data: ResultAssessmentData): string[] {
  return [
    ...data.psychology.motivations,
    ...data.psychology.strengths,
    ...data.psychology.personalityTraits,
    ...data.psychology.values,
    ...data.psychology.lifestylePreferences,
    ...data.psychology.financialPressure,
    ...data.psychology.familyExpectations,
    ...data.psychology.riskTolerance,
    ...data.psychology.academicConfidence,
    ...data.psychology.learningDiscipline,
    ...data.psychology.socialEnergy,
    ...data.psychology.ambiguityTolerance,
    ...data.psychology.locationFlexibility,
    ...data.psychology.skillReadiness,
    ...data.psychology.decisionTension,
  ];
}

function formatSignals(signals: string[]): string {
  const labels = signals.map((signal) => SIGNAL_LABELS[signal] ?? signal);
  if (labels.length === 0) return 'not enough signals yet';
  return labels.slice(0, 6).join(' + ');
}

function scoreCandidate(candidate: CareerCandidate, signals: Set<string>): { rawScore: number; matchedSignals: string[] } {
  let rawScore = 0;
  const matchedSignals: string[] = [];

  for (const signal of signals) {
    const directScore = candidate.weights[signal] ?? 0;
    const contextScore = CONTEXT_SIGNAL_WEIGHTS[signal]?.[candidate.id] ?? 0;
    const signalScore = directScore + contextScore;

    if (signalScore !== 0) {
      rawScore += signalScore;
      matchedSignals.push(signal);
    }
  }

  return { rawScore, matchedSignals };
}

function contextualSalaryRange(baseSalaryRange: string, signals: Set<string>): string {
  if (signals.has('earning_now')) {
    return `${baseSalaryRange}; prioritize paid entry roles, internships, or client work before unpaid exploration`;
  }

  if (signals.has('earning_6_months')) {
    return `${baseSalaryRange}; validate a paid route within one semester`;
  }

  if (signals.has('explore_longer')) {
    return `${baseSalaryRange}; longer skill-building runway is acceptable if proof keeps improving`;
  }

  return baseSalaryRange;
}

function contextualTradeoff(baseTradeoff: string, signals: Set<string>): string {
  const notes: string[] = [];

  if (signals.has('earning_now')) {
    notes.push('Because earning urgency is high, avoid paths that require long unpaid preparation before first income.');
  }

  if (signals.has('family_very_strong') || signals.has('regret_disappoint_family')) {
    notes.push('Family expectations are a real constraint, so the path needs a clear explanation, visible milestones, and credible stability proof.');
  }

  if (signals.has('risk_stable') || signals.has('ambiguity_anxious') || signals.has('ambiguity_avoid')) {
    notes.push('Your risk pattern favors staged choices with fallback options, not open-ended leaps.');
  }

  if (signals.has('academic_inconsistent')) {
    notes.push('Inconsistent academics mean portfolio, project, or work proof must compensate for marks-based filtering.');
  }

  return notes.length > 0 ? `${baseTradeoff} ${notes.join(' ')}` : baseTradeoff;
}

function contextualNextStep(baseNextStep: string, signals: Set<string>): string {
  if (signals.has('earning_now')) {
    return `${baseNextStep} Also identify one paid internship, freelance, or junior-role route you could apply to this week.`;
  }

  if (signals.has('family_very_strong') || signals.has('regret_disappoint_family')) {
    return `${baseNextStep} Prepare a family-facing explanation with expected timeline, costs, earning path, and backup option.`;
  }

  if (signals.has('risk_founder') || signals.has('risk_high_growth')) {
    return `${baseNextStep} Define a small reversible experiment so ambition is tested without overcommitting too early.`;
  }

  if (signals.has('proof_starting')) {
    return `${baseNextStep} Keep the first proof small enough to finish in 7 days, because completion matters more than complexity.`;
  }

  return baseNextStep;
}

function contextualAvoidIf(baseAvoidIf: string, signals: Set<string>): string {
  const warnings: string[] = [];

  if (signals.has('earning_now')) {
    warnings.push('avoid long zero-income ramps unless there is a concrete support plan');
  }

  if (signals.has('risk_stable')) {
    warnings.push('avoid this as a primary bet if the first year is highly uncertain');
  }

  if (signals.has('location_family_close')) {
    warnings.push('avoid paths that require relocation before family constraints are resolved');
  }

  if (signals.has('learning_needs_structure')) {
    warnings.push('avoid self-learning paths without coaching, peers, or weekly accountability');
  }

  return warnings.length > 0 ? `${baseAvoidIf} Also ${warnings.join('; ')}.` : baseAvoidIf;
}

function buildRecommendation(
  candidate: CareerCandidate,
  fitScore: number,
  matchedSignals: string[],
  signals: Set<string>,
): CareerRecommendation {
  const labels = matchedSignals.map((signal) => SIGNAL_LABELS[signal] ?? signal);

  return {
    id: candidate.id,
    title: candidate.title,
    salaryRange: contextualSalaryRange(candidate.salaryRange, signals),
    fitScore,
    whyFits: candidate.whyFits,
    answerPattern: `Triggered by ${labels.length > 0 ? labels.join(' + ') : 'your current assessment pattern'} in the assessment.`,
    tradeoff: contextualTradeoff(candidate.tradeoff, signals),
    nextStep: contextualNextStep(candidate.nextStep, signals),
    avoidIf: contextualAvoidIf(candidate.avoidIf, signals),
    indiaContext: candidate.indiaContext,
    matchedSignals: labels,
  };
}

function hasAny(signals: Set<string>, values: string[]): boolean {
  return values.some((value) => signals.has(value));
}

function buildArchetype(signals: Set<string>, top: CareerRecommendation): CareerResultIntelligence['archetype'] {
  if (hasAny(signals, ['independence', 'creativity', 'practical', 'remote'])) {
    return {
      name: 'The Independent Builder',
      description: 'You are pulled toward creation and ownership, but your best path still needs a monetizable skill stack and market proof.',
      match: Math.min(96, Math.max(86, top.fitScore)),
    };
  }

  if (hasAny(signals, ['security', 'stability', 'structured'])) {
    return {
      name: 'The Structured Stabilizer',
      description: 'You make better decisions when the path has clear rules, credible upside, and lower downside risk.',
      match: Math.min(95, Math.max(84, top.fitScore)),
    };
  }

  if (hasAny(signals, ['impact', 'social', 'purpose', 'collaborative'])) {
    return {
      name: 'The People-Impact Strategist',
      description: 'You are motivated by usefulness to people, but you need a path where that care converts into a durable skill and income model.',
      match: Math.min(94, Math.max(84, top.fitScore)),
    };
  }

  return {
    name: 'The Adaptive Career Strategist',
    description: 'Your answers show a broad pattern. CareerOS is prioritizing paths with enough skill proof, market demand, and reversibility.',
    match: Math.min(92, Math.max(80, top.fitScore)),
  };
}

function buildSummary(data: ResultAssessmentData, top: CareerRecommendation): CareerResultIntelligence['summary'] {
  const signals = new Set(selectedSignals(data));
  const strongestSignals = formatSignals(selectedSignals(data));

  let decisionPattern = 'Your decision pattern is balanced: you are weighing fit, practical upside, and day-to-day work style rather than chasing one label.';
  if (hasAny(signals, ['creativity', 'independence', 'practical'])) {
    decisionPattern = 'Your decision pattern is a builder pattern: you want to create, own outcomes, and see visible proof of progress.';
  } else if (hasAny(signals, ['security', 'stability', 'structured'])) {
    decisionPattern = 'Your decision pattern is a stability-first pattern: you prefer clear rules, predictable progress, and paths with lower downside.';
  } else if (hasAny(signals, ['impact', 'social', 'purpose'])) {
    decisionPattern = 'Your decision pattern is an impact pattern: you care about helping people, but the path still needs market value and skill depth.';
  }

  if (signals.has('earning_now') || signals.has('earning_6_months')) {
    decisionPattern = `${decisionPattern} Your earning timeline is near-term, so the recommendation weights paid proof and faster employability more heavily.`;
  } else if (signals.has('explore_longer')) {
    decisionPattern = `${decisionPattern} You also have room to explore longer, so the recommendation can include higher-upside skill compounding.`;
  }

  let hiddenTension = 'Your hidden tension is optionality versus commitment: you need to test before locking into a path.';
  if (signals.has('independence') && (signals.has('security') || signals.has('stability'))) {
    hiddenTension = 'Your hidden tension is autonomy versus stability. Pure freedom paths may excite you, but income volatility could create stress.';
  } else if ((signals.has('creativity') || signals.has('creative')) && signals.has('structured')) {
    hiddenTension = 'Your hidden tension is creativity versus structure. You need room to create, but not chaos every day.';
  } else if (signals.has('financial') && signals.has('worklife')) {
    hiddenTension = 'Your hidden tension is income upside versus work-life boundaries. High-ceiling paths may ask for intensity before they give freedom.';
  }

  if (signals.has('family_very_strong') || signals.has('regret_disappoint_family')) {
    hiddenTension = `${hiddenTension} Family expectations add another layer: your path must be explainable, not just personally exciting.`;
  } else if (signals.has('risk_founder') && (signals.has('earning_now') || signals.has('ambiguity_anxious'))) {
    hiddenTension = `${hiddenTension} Founder-style ambition is present, but your pressure signals say it should be tested as a side experiment first.`;
  }

  return {
    decisionPattern,
    strongestSignals,
    hiddenTension,
    whatNotIgnore: `Do not ignore proof. For ${top.title}, the Indian market will reward visible projects, internships, credentials, or outcomes more than interest alone. Your financial, family, risk, academic, and location signals should shape the first test, not just the career title.`,
  };
}

function calculateSignalCoverage(data: ResultAssessmentData): number {
  const signalGroups = Object.values(data.psychology);
  const answeredGroups = signalGroups.filter((values) => values.length > 0).length;
  return answeredGroups / signalGroups.length;
}

function calculateContradictionCount(signals: Set<string>): number {
  const contradictions = [
    signals.has('earning_now') && (signals.has('risk_founder') || signals.has('explore_longer')),
    signals.has('risk_high_growth') && (signals.has('ambiguity_anxious') || signals.has('ambiguity_avoid')),
    signals.has('independence') && (signals.has('family_very_strong') || signals.has('regret_disappoint_family')),
    signals.has('security') && (signals.has('risk_founder') || signals.has('risk_high_growth')),
    signals.has('location_remote') && signals.has('location_family_close'),
    signals.has('academic_inconsistent') && signals.has('academic_strong'),
  ];

  return contradictions.filter(Boolean).length;
}

function buildConfidence(
  data: ResultAssessmentData,
  scoredCandidates: Array<{ rawScore: number }>,
): CareerResultIntelligence['confidence'] {
  const signals = new Set(selectedSignals(data));
  const coverage = calculateSignalCoverage(data);
  const topScore = scoredCandidates[0]?.rawScore ?? 0;
  const secondScore = scoredCandidates[1]?.rawScore ?? 0;
  const separation = topScore > 0 ? Math.min(1, Math.max(0, (topScore - secondScore) / topScore)) : 0;
  const contradictionPenalty = calculateContradictionCount(signals) * 9;
  const score = Math.max(30, Math.min(95, Math.round(coverage * 48 + separation * 38 + Math.min(14, signals.size) - contradictionPenalty)));

  if (coverage < 0.86 || score < 58) {
    return {
      label: 'Needs More Exploration',
      score,
      rationale: 'Your answers give useful direction, but the signal pattern still has gaps or competing pressures. Treat this as a test plan, not a final verdict.',
    };
  }

  if (score >= 74) {
    return {
      label: 'Strong Clarity',
      score,
      rationale: 'Your signals are broad enough and consistent enough to support a confident first path recommendation.',
    };
  }

  return {
    label: 'Initial Clarity',
    score,
    rationale: 'Your answers show a usable direction, but the next 7-day test should confirm whether the path feels real in practice.',
  };
}

function chooseLongTermPath(recommendations: CareerRecommendation[], scored: Array<{ candidate: CareerCandidate; recommendation: CareerRecommendation }>): CareerRecommendation {
  const sorted = [...scored].sort((a, b) => {
    const aScore = a.recommendation.fitScore * 0.55 + a.candidate.outcomeScore * 0.45;
    const bScore = b.recommendation.fitScore * 0.55 + b.candidate.outcomeScore * 0.45;
    return bScore - aScore;
  });

  return sorted[0]?.recommendation ?? recommendations[0];
}

function chooseBalancedPath(
  recommendations: CareerRecommendation[],
  scored: Array<{ candidate: CareerCandidate; recommendation: CareerRecommendation }>,
  signals: Set<string>,
): CareerRecommendation {
  const stabilityNeed = hasAny(signals, ['security', 'stability', 'structured', 'worklife']) ? 1 : 0.5;
  const autonomyNeed = hasAny(signals, ['independence', 'remote', 'flexible', 'creativity']) ? 1 : 0.5;

  const sorted = [...scored].sort((a, b) => {
    const aScore =
      a.recommendation.fitScore * 0.5 +
      a.candidate.stabilityScore * 0.25 * stabilityNeed +
      a.candidate.autonomyScore * 0.25 * autonomyNeed +
      a.candidate.outcomeScore * 0.2;
    const bScore =
      b.recommendation.fitScore * 0.5 +
      b.candidate.stabilityScore * 0.25 * stabilityNeed +
      b.candidate.autonomyScore * 0.25 * autonomyNeed +
      b.candidate.outcomeScore * 0.2;
    return bScore - aScore;
  });

  return sorted[0]?.recommendation ?? recommendations[0];
}

function buildNextSevenDayAction(balanced: CareerRecommendation, signals: Set<string>): string {
  if (signals.has('earning_now') || signals.has('earning_6_months')) {
    return `Spend 7 days testing ${balanced.title}: complete the next step, then apply to or identify three paid entry routes so earning pressure is handled honestly.`;
  }

  if (signals.has('family_very_strong') || signals.has('regret_disappoint_family')) {
    return `Spend 7 days testing ${balanced.title}: complete the next step, then write a family-facing explanation with timeline, cost, income path, and backup option.`;
  }

  if (signals.has('risk_founder') || signals.has('risk_high_growth')) {
    return `Spend 7 days testing ${balanced.title}: complete the next step as a reversible experiment and measure whether the work creates energy, proof, or demand.`;
  }

  if (signals.has('academic_inconsistent') || signals.has('academic_practical')) {
    return `Spend 7 days testing ${balanced.title}: create one visible proof artifact, because practical evidence will matter more than interest alone.`;
  }

  return `Spend 7 days testing ${balanced.title}: complete the next step, save evidence, and notice whether the work gives energy or only sounds impressive.`;
}

function buildTestBeforeChoosing(balanced: CareerRecommendation, signals: Set<string>): string {
  if (signals.has('ambiguity_anxious') || signals.has('ambiguity_avoid') || signals.has('risk_stable')) {
    return `Before choosing ${balanced.title}, test the riskiest assumption with a clear fallback: ${balanced.tradeoff}`;
  }

  if (signals.has('location_family_close')) {
    return `Before choosing ${balanced.title}, verify whether the path works near home, hybrid, or remote before assuming relocation is possible.`;
  }

  return `Before choosing ${balanced.title}, test the hardest part: ${balanced.tradeoff}`;
}

export function generateCareerResultIntelligence(data: ResultAssessmentData): CareerResultIntelligence {
  const selected = selectedSignals(data);
  const signalSet = new Set(selected);

  const scoredCandidates = CAREER_CANDIDATES.map((candidate) => {
    const score = scoreCandidate(candidate, signalSet);
    return { candidate, ...score };
  }).sort((a, b) => {
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    return b.candidate.outcomeScore - a.candidate.outcomeScore;
  });

  const bestRawScore = Math.max(1, scoredCandidates[0]?.rawScore ?? 1);
  const recommendationPool = scoredCandidates
    .filter((item) => item.rawScore > 0)
    .slice(0, 6);
  const effectivePool = recommendationPool.length >= 3 ? recommendationPool : scoredCandidates.slice(0, 6);

  const scoredRecommendations = effectivePool.map((item, index) => {
    const normalizedScore = 58 + (item.rawScore / bestRawScore) * 34 - index;
    const fitScore = Math.max(62, Math.min(97, Math.round(normalizedScore)));
    const recommendation = buildRecommendation(item.candidate, fitScore, item.matchedSignals, signalSet);
    return { candidate: item.candidate, recommendation };
  });

  const recommendations = scoredRecommendations.slice(0, 3).map((item) => item.recommendation);
  const naturalFit = recommendations[0];
  const longTermOutcome = chooseLongTermPath(recommendations, scoredRecommendations);
  const balanced = chooseBalancedPath(recommendations, scoredRecommendations, signalSet);
  const archetype = buildArchetype(signalSet, naturalFit);
  const confidence = buildConfidence(data, scoredCandidates);
  const summary = buildSummary(data, naturalFit);

  return {
    archetype,
    confidence,
    summary,
    paths: {
      naturalFit,
      longTermOutcome,
      balanced,
    },
    recommendations,
    nextSevenDayAction: buildNextSevenDayAction(balanced, signalSet),
    testBeforeChoosing: buildTestBeforeChoosing(balanced, signalSet),
    comebackPrompt: 'Come back after the 7-day test and update your answers with what felt energizing, boring, stressful, or surprisingly natural.',
  };
}
