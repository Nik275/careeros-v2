import type { Question } from './QuestionCard';

export interface AssessmentPsychologyData {
  motivations: string[];
  strengths: string[];
  personalityTraits: string[];
  values: string[];
  lifestylePreferences: string[];
  financialPressure: string[];
  familyExpectations: string[];
  riskTolerance: string[];
  academicConfidence: string[];
  learningDiscipline: string[];
  socialEnergy: string[];
  ambiguityTolerance: string[];
  locationFlexibility: string[];
  skillReadiness: string[];
  decisionTension: string[];
}

export type AssessmentQuestionId = keyof AssessmentPsychologyData;

export interface AssessmentQuestion extends Omit<Question, 'id'> {
  id: AssessmentQuestionId;
}

export function createEmptyAssessmentPsychologyData(): AssessmentPsychologyData {
  return {
    motivations: [],
    strengths: [],
    personalityTraits: [],
    values: [],
    lifestylePreferences: [],
    financialPressure: [],
    familyExpectations: [],
    riskTolerance: [],
    academicConfidence: [],
    learningDiscipline: [],
    socialEnergy: [],
    ambiguityTolerance: [],
    locationFlexibility: [],
    skillReadiness: [],
    decisionTension: [],
  };
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'motivations',
    category: 'Motivation',
    question: 'What drives you most?',
    subtext: 'Choose the pulls that feel real, not just impressive',
    allowMultiple: true,
    options: [
      { id: 'creativity', label: 'Creating something new', description: 'Building, designing, or making things that did not exist before' },
      { id: 'impact', label: 'Making a difference', description: 'Helping people, solving problems, or improving lives' },
      { id: 'mastery', label: 'Becoming excellent', description: 'Deep expertise, continuous learning, and skill development' },
      { id: 'independence', label: 'Freedom & autonomy', description: 'Controlling your time, decisions, and work environment' },
      { id: 'security', label: 'Stability & security', description: 'Predictable income, clear path, and reduced uncertainty' },
    ],
  },
  {
    id: 'strengths',
    category: 'Natural Strengths',
    question: 'What comes naturally to you?',
    subtext: 'What do others often ask for your help with?',
    allowMultiple: true,
    options: [
      { id: 'analytical', label: 'Analyzing problems', description: 'Breaking down complexity and finding logical answers' },
      { id: 'creative', label: 'Creative thinking', description: 'Generating ideas, seeing patterns, and reframing problems' },
      { id: 'social', label: 'Connecting with people', description: 'Understanding others, building trust, and communicating' },
      { id: 'practical', label: 'Hands-on execution', description: 'Building, fixing, or making tangible progress' },
      { id: 'organizing', label: 'Organizing & planning', description: 'Structuring details, timelines, and moving parts' },
    ],
  },
  {
    id: 'personalityTraits',
    category: 'Work Style',
    question: 'How do you prefer to work?',
    subtext: 'Pick the rhythm that feels sustainable',
    allowMultiple: false,
    options: [
      { id: 'structured', label: 'Structured & planned', description: 'Clear goals, defined processes, and predictable routines' },
      { id: 'flexible', label: 'Flexible & adaptive', description: 'Variety, changing situations, and fast context shifts' },
      { id: 'collaborative', label: 'Collaborative & team-based', description: 'Working closely with others and sharing ideas' },
      { id: 'independent', label: 'Independent & focused', description: 'Deep solo work, fewer interruptions, and self-direction' },
    ],
  },
  {
    id: 'values',
    category: 'Values',
    question: 'What can you not compromise on?',
    subtext: 'Choose the values that should shape your path',
    allowMultiple: true,
    options: [
      { id: 'worklife', label: 'Work-life balance', description: 'Time for family, health, hobbies, and personal life' },
      { id: 'growth', label: 'Continuous growth', description: 'Always learning, evolving, and being challenged' },
      { id: 'purpose', label: 'Purpose & meaning', description: 'Work that aligns with your values and helps others' },
      { id: 'financial', label: 'Financial progress', description: 'Strong earning potential and long-term security' },
      { id: 'stability', label: 'Job security', description: 'A path that feels dependable and respected' },
    ],
  },
  {
    id: 'lifestylePreferences',
    category: 'Lifestyle Fit',
    question: 'What does your ideal workday look like?',
    subtext: 'Imagine a normal day five years from now',
    allowMultiple: false,
    options: [
      { id: 'office', label: 'Office & team environment', description: 'Professional setting, colleagues, and clear routines' },
      { id: 'remote', label: 'Remote & flexible', description: 'Work from anywhere with control over your schedule' },
      { id: 'field', label: 'On-site & active', description: 'Meeting people, moving around, and being in the world' },
      { id: 'hybrid', label: 'A mix of everything', description: 'Some office, some remote, some variety' },
    ],
  },
  {
    id: 'financialPressure',
    category: 'Earning Urgency',
    question: 'How soon do you need your path to start earning?',
    subtext: 'Use the closest range, not exact money details',
    allowMultiple: false,
    options: [
      { id: 'earning_now', label: 'Immediately', description: 'I need a path that can create income quickly' },
      { id: 'earning_6_months', label: 'Within 6 months', description: 'I can build briefly, but earning cannot wait long' },
      { id: 'earning_1_2_years', label: 'Within 1-2 years', description: 'I can invest time if the path is credible' },
      { id: 'explore_longer', label: 'I can explore longer', description: 'I have room to test and build before earning' },
    ],
  },
  {
    id: 'familyExpectations',
    category: 'Family Context',
    question: 'How much does family expectation affect your choice?',
    subtext: 'This helps us avoid advice that ignores your reality',
    allowMultiple: false,
    options: [
      { id: 'family_very_strong', label: 'Very strongly', description: 'Family approval and stability matter a lot' },
      { id: 'family_somewhat', label: 'Somewhat', description: 'Their views matter, but I can negotiate' },
      { id: 'family_little', label: 'Very little', description: 'I listen, but it does not decide the path' },
      { id: 'self_directed', label: 'I decide independently', description: 'I am comfortable owning the decision' },
    ],
  },
  {
    id: 'riskTolerance',
    category: 'Risk Tolerance',
    question: 'Which path feels most acceptable?',
    subtext: 'Be honest about the risk you can actually carry',
    allowMultiple: false,
    options: [
      { id: 'risk_stable', label: 'Stable path, slower upside', description: 'Lower risk matters more than fast growth' },
      { id: 'risk_balanced', label: 'Balanced path', description: 'Some risk is fine if it is manageable' },
      { id: 'risk_high_growth', label: 'High-growth path', description: 'I can handle uncertainty for bigger upside' },
      { id: 'risk_founder', label: 'Independent/founder-style path', description: 'I want ownership even if income is uneven early' },
    ],
  },
  {
    id: 'academicConfidence',
    category: 'Academic Confidence',
    question: 'How do you feel about your current academics?',
    subtext: 'No marks needed; only your confidence level',
    allowMultiple: false,
    options: [
      { id: 'academic_strong', label: 'Strong and consistent', description: 'Exams and structured study are a real strength' },
      { id: 'academic_steady', label: 'Steady, can improve', description: 'I can do well with the right plan' },
      { id: 'academic_inconsistent', label: 'Inconsistent', description: 'My performance depends heavily on interest and structure' },
      { id: 'academic_practical', label: 'More practical than marks-based', description: 'I learn better by doing than by exam pressure' },
    ],
  },
  {
    id: 'learningDiscipline',
    category: 'Learning Discipline',
    question: 'What learning routine can you realistically sustain?',
    subtext: 'Pick what you would actually do for three months',
    allowMultiple: false,
    options: [
      { id: 'learning_daily', label: 'Daily practice', description: 'Small consistent practice most days' },
      { id: 'learning_weekly', label: 'Weekly deep work', description: 'Focused longer sessions a few times a week' },
      { id: 'learning_deadline', label: 'Deadline-driven', description: 'I move fastest when there is an external deadline' },
      { id: 'learning_needs_structure', label: 'I need structure', description: 'Coaching, peers, or a clear plan keeps me on track' },
    ],
  },
  {
    id: 'socialEnergy',
    category: 'Social Energy',
    question: 'What people rhythm gives you energy?',
    subtext: 'This shapes team, client, and solo-work fit',
    allowMultiple: false,
    options: [
      { id: 'social_high_collab', label: 'High collaboration', description: 'Lots of discussion, energy, and team momentum' },
      { id: 'social_small_team', label: 'Small trusted team', description: 'A few strong people working closely together' },
      { id: 'social_one_on_one', label: 'One-on-one influence', description: 'Mentoring, selling, advising, or listening deeply' },
      { id: 'social_solo', label: 'Mostly solo', description: 'People are fine, but deep focus comes first' },
    ],
  },
  {
    id: 'ambiguityTolerance',
    category: 'Ambiguity',
    question: 'When the path is unclear, what happens to you?',
    subtext: 'This helps separate exploration from stress',
    allowMultiple: false,
    options: [
      { id: 'ambiguity_curious', label: 'I get curious', description: 'Unclear problems make me want to investigate' },
      { id: 'ambiguity_milestones', label: 'I need milestones', description: 'I can explore if there are checkpoints' },
      { id: 'ambiguity_anxious', label: 'I get anxious', description: 'Too many unknowns make it hard to move' },
      { id: 'ambiguity_avoid', label: 'I avoid unclear paths', description: 'I prefer proven routes and visible outcomes' },
    ],
  },
  {
    id: 'locationFlexibility',
    category: 'Location Fit',
    question: 'How flexible can you be about location or remote work?',
    subtext: 'Use the realistic answer for the next few years',
    allowMultiple: false,
    options: [
      { id: 'location_relocate', label: 'I can relocate for opportunity', description: 'Metro or campus moves are possible' },
      { id: 'location_hybrid_nearby', label: 'Hybrid near home', description: 'Some travel is okay, but I need a base nearby' },
      { id: 'location_remote', label: 'Remote-first preferred', description: 'I want location flexibility as part of the plan' },
      { id: 'location_family_close', label: 'I need to stay close to family', description: 'Distance or relocation is difficult right now' },
    ],
  },
  {
    id: 'skillReadiness',
    category: 'Current Proof',
    question: 'What proof do you already have?',
    subtext: 'Pick the strongest evidence you can show today',
    allowMultiple: false,
    options: [
      { id: 'proof_shipped', label: 'Projects or portfolio', description: 'I have visible work I can show' },
      { id: 'proof_internship', label: 'Internship or role exposure', description: 'I have seen a real work environment' },
      { id: 'proof_coursework', label: 'Courses or certificates', description: 'I have learned, but need stronger proof' },
      { id: 'proof_starting', label: 'Just starting', description: 'I need a path that builds proof from zero' },
    ],
  },
  {
    id: 'decisionTension',
    category: 'Decision Tension',
    question: 'Which regret are you most trying to avoid?',
    subtext: 'This reveals what your decision must protect',
    allowMultiple: false,
    options: [
      { id: 'regret_low_income', label: 'Not earning enough', description: 'I do not want a path with weak income growth' },
      { id: 'regret_wasting_years', label: 'Wasting years', description: 'I fear investing time in the wrong route' },
      { id: 'regret_wrong_fit', label: 'Choosing the wrong fit', description: 'I want work that feels sustainable day to day' },
      { id: 'regret_disappoint_family', label: 'Disappointing family', description: 'I want a path I can explain with confidence' },
      { id: 'regret_missed_potential', label: 'Missing my potential', description: 'I do not want to play too small' },
    ],
  },
];
