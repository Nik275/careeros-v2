export interface AssessmentPsychologyData {
  motivations: string[];
  strengths: string[];
  personalityTraits: string[];
  values: string[];
  lifestylePreferences: string[];
}

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

export interface CareerResultIntelligence {
  archetype: {
    name: string;
    description: string;
    match: number;
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

function selectedSignals(data: ResultAssessmentData): string[] {
  return [
    ...data.psychology.motivations,
    ...data.psychology.strengths,
    ...data.psychology.personalityTraits,
    ...data.psychology.values,
    ...data.psychology.lifestylePreferences,
  ];
}

function formatSignals(signals: string[]): string {
  const labels = signals.map((signal) => SIGNAL_LABELS[signal] ?? signal);
  if (labels.length === 0) return 'not enough signals yet';
  return labels.slice(0, 6).join(' + ');
}

function scoreCandidate(candidate: CareerCandidate, signals: Set<string>): { rawScore: number; matchedSignals: string[] } {
  const matchedSignals = Object.keys(candidate.weights).filter((signal) => signals.has(signal));
  const rawScore = matchedSignals.reduce((score, signal) => score + candidate.weights[signal], 0);
  return { rawScore, matchedSignals };
}

function buildRecommendation(
  candidate: CareerCandidate,
  fitScore: number,
  matchedSignals: string[],
): CareerRecommendation {
  const labels = matchedSignals.map((signal) => SIGNAL_LABELS[signal] ?? signal);

  return {
    id: candidate.id,
    title: candidate.title,
    salaryRange: candidate.salaryRange,
    fitScore,
    whyFits: candidate.whyFits,
    answerPattern: `Triggered by ${labels.length > 0 ? labels.join(' + ') : 'your current assessment pattern'} in the assessment.`,
    tradeoff: candidate.tradeoff,
    nextStep: candidate.nextStep,
    avoidIf: candidate.avoidIf,
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

  let hiddenTension = 'Your hidden tension is optionality versus commitment: you need to test before locking into a path.';
  if (signals.has('independence') && (signals.has('security') || signals.has('stability'))) {
    hiddenTension = 'Your hidden tension is autonomy versus stability. Pure freedom paths may excite you, but income volatility could create stress.';
  } else if ((signals.has('creativity') || signals.has('creative')) && signals.has('structured')) {
    hiddenTension = 'Your hidden tension is creativity versus structure. You need room to create, but not chaos every day.';
  } else if (signals.has('financial') && signals.has('worklife')) {
    hiddenTension = 'Your hidden tension is income upside versus work-life boundaries. High-ceiling paths may ask for intensity before they give freedom.';
  }

  return {
    decisionPattern,
    strongestSignals,
    hiddenTension,
    whatNotIgnore: `Do not ignore proof. For ${top.title}, the Indian market will reward visible projects, internships, credentials, or outcomes more than interest alone.`,
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
    const recommendation = buildRecommendation(item.candidate, fitScore, item.matchedSignals);
    return { candidate: item.candidate, recommendation };
  });

  const recommendations = scoredRecommendations.slice(0, 3).map((item) => item.recommendation);
  const naturalFit = recommendations[0];
  const longTermOutcome = chooseLongTermPath(recommendations, scoredRecommendations);
  const balanced = chooseBalancedPath(recommendations, scoredRecommendations, signalSet);
  const archetype = buildArchetype(signalSet, naturalFit);
  const summary = buildSummary(data, naturalFit);

  return {
    archetype,
    summary,
    paths: {
      naturalFit,
      longTermOutcome,
      balanced,
    },
    recommendations,
    nextSevenDayAction: `Spend 7 days testing ${balanced.title}: complete the next step, save evidence, and notice whether the work gives energy or only sounds impressive.`,
    testBeforeChoosing: `Before choosing ${balanced.title}, test the hardest part: ${balanced.tradeoff}`,
    comebackPrompt: 'Come back after the 7-day test and update your answers with what felt energizing, boring, stressful, or surprisingly natural.',
  };
}
