/**
 * CareerOS Career Relationship Network V1
 *
 * Comprehensive relationship network for the 25 Elite Careers.
 * Defines realistic career paths with relationship strength scores.
 *
 * Relationship Types:
 * - adjacent: Similar careers with transferable skills (strength: 7-9)
 * - specialization: Deeper focus within same domain (strength: 8-10)
 * - progression: Career advancement/upward mobility (strength: 7-9)
 * - alternative: Related but different path (strength: 5-7)
 * - pivot: Career change requiring significant reskilling (strength: 4-6)
 *
 * Strength Score Scale:
 * - 10: Very Strong (direct path, minimal friction)
 * - 8-9: Strong (common transition, natural fit)
 * - 6-7: Moderate (some barrier, achievable with effort)
 * - 4-5: Weak (significant reskilling required)
 * - 1-3: Very Weak (major career change)
 *
 * @version 1.0.0
 */

import type { CareerRelationship } from '../ontology/career-relationships';

// ============================================================================
// RELATIONSHIP DEFINITIONS
// ============================================================================

/**
 * Career relationship with strength scores and metadata
 */
export interface CareerRelationshipV1 {
  /** Source career slug */
  from: string;

  /** Target career slug */
  to: string;

  /** Relationship type */
  type: 'adjacent' | 'specialization' | 'progression' | 'alternative' | 'pivot';

  /** Relationship strength (1-10) */
  strength: number;

  /** Confidence in this relationship (0-1) */
  confidence: number;

  /** Description of the relationship */
  description: string;

  /** Typical years of experience needed for transition */
  experienceRequired: number;

  /** Key skills that transfer */
  transferableSkills: string[];

  /** Skills that need to be developed */
  skillsToDevelop: string[];

  /** Common transition path */
  typicalPath: string;
}

// ============================================================================
// SOFTWARE ENGINEER RELATIONSHIPS
// ============================================================================

const SOFTWARE_ENGINEER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent careers
  {
    from: 'software-engineer',
    to: 'ai-engineer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.95,
    description: 'Natural progression into AI/ML with additional ML/Deep Learning skills',
    experienceRequired: 2,
    transferableSkills: ['Programming', 'System Design', 'Data Structures', 'Algorithms', 'Python'],
    skillsToDevelop: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow/PyTorch'],
    typicalPath: 'Software Engineer → ML Engineer → AI Engineer',
  },
  {
    from: 'software-engineer',
    to: 'data-scientist',
    type: 'adjacent',
    strength: 8,
    confidence: 0.90,
    description: 'Strong overlap in data manipulation and analysis skills',
    experienceRequired: 2,
    transferableSkills: ['Python', 'SQL', 'Data Processing', 'Problem Solving'],
    skillsToDevelop: ['Statistics', 'Machine Learning', 'Data Visualization', 'Domain Expertise'],
    typicalPath: 'Software Engineer → Data Engineer → Data Scientist',
  },
  {
    from: 'software-engineer',
    to: 'cybersecurity-engineer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.88,
    description: 'Security-focused engineers often transition from general software engineering',
    experienceRequired: 2,
    transferableSkills: ['System Architecture', 'Networking', 'Code Review', 'Risk Analysis'],
    skillsToDevelop: ['Security Protocols', 'Penetration Testing', 'Compliance', 'Threat Modeling'],
    typicalPath: 'Software Engineer → Security-focused Developer → Cybersecurity Engineer',
  },
  {
    from: 'software-engineer',
    to: 'machine-learning-engineer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'ML Engineering is a natural specialization for software engineers',
    experienceRequired: 1,
    transferableSkills: ['Software Development', 'System Design', 'Python', 'Cloud Platforms'],
    skillsToDevelop: ['MLOps', 'Model Deployment', 'Feature Engineering', 'ML Infrastructure'],
    typicalPath: 'Software Engineer → ML Engineer',
  },

  // Specializations
  {
    from: 'software-engineer',
    to: 'product-manager',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'Technical PMs often come from engineering backgrounds',
    experienceRequired: 3,
    transferableSkills: ['Technical Knowledge', 'Problem Solving', 'Communication', 'Stakeholder Management'],
    skillsToDevelop: ['Product Strategy', 'User Research', 'Business Acumen', 'Roadmap Planning'],
    typicalPath: 'Software Engineer → Senior Engineer → Engineering Lead → Product Manager',
  },

  // Progression
  {
    from: 'software-engineer',
    to: 'founder',
    type: 'progression',
    strength: 7,
    confidence: 0.80,
    description: 'Many successful founders have engineering backgrounds',
    experienceRequired: 4,
    transferableSkills: ['Technical Execution', 'Problem Solving', 'System Building', 'Team Collaboration'],
    skillsToDevelop: ['Business Strategy', 'Fundraising', 'Marketing', 'Sales', 'Leadership'],
    typicalPath: 'Software Engineer → Senior Engineer → Engineering Manager → Founder',
  },

  // Alternative paths
  {
    from: 'software-engineer',
    to: 'business-analyst',
    type: 'alternative',
    strength: 6,
    confidence: 0.75,
    description: 'Technical BAs often have engineering backgrounds',
    experienceRequired: 2,
    transferableSkills: ['Analytical Thinking', 'Documentation', 'Process Analysis', 'Technical Communication'],
    skillsToDevelop: ['Business Process Modeling', 'Requirements Gathering', 'Domain Knowledge', 'Stakeholder Management'],
    typicalPath: 'Software Engineer → Technical Analyst → Business Analyst',
  },
  {
    from: 'software-engineer',
    to: 'ux-designer',
    type: 'alternative',
    strength: 5,
    confidence: 0.70,
    description: 'Frontend engineers sometimes transition to UX design',
    experienceRequired: 2,
    transferableSkills: ['User Interface Knowledge', 'Technical Constraints', 'Prototyping Tools'],
    skillsToDevelop: ['User Research', 'Design Thinking', 'Visual Design', 'Usability Testing', 'Psychology'],
    typicalPath: 'Frontend Engineer → UX Engineer → UX Designer',
  },

  // Pivot paths
  {
    from: 'software-engineer',
    to: 'investment-banker',
    type: 'pivot',
    strength: 4,
    confidence: 0.60,
    description: 'Rare but possible through MBA and finance training',
    experienceRequired: 5,
    transferableSkills: ['Analytical Skills', 'Excel/Modeling', 'Attention to Detail', 'Work Ethic'],
    skillsToDevelop: ['Financial Modeling', 'Valuation', 'Accounting', 'Deal Structuring', 'Client Relations'],
    typicalPath: 'Software Engineer → MBA → Investment Banking Associate',
  },
  {
    from: 'software-engineer',
    to: 'management-consultant',
    type: 'pivot',
    strength: 5,
    confidence: 0.65,
    description: 'Tech consultants often have engineering backgrounds',
    experienceRequired: 3,
    transferableSkills: ['Problem Solving', 'Structured Thinking', 'Presentation Skills', 'Technology Knowledge'],
    skillsToDevelop: ['Business Strategy', 'Industry Knowledge', 'Case Frameworks', 'Client Management'],
    typicalPath: 'Software Engineer → Tech Consultant → Management Consultant',
  },
];

// ============================================================================
// AI ENGINEER RELATIONSHIPS
// ============================================================================

const AI_ENGINEER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'ai-engineer',
    to: 'machine-learning-engineer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.95,
    description: 'Highly overlapping roles with similar skill requirements',
    experienceRequired: 0,
    transferableSkills: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow/PyTorch', 'Model Architecture'],
    skillsToDevelop: ['MLOps', 'Production Systems', 'Scalability'],
    typicalPath: 'AI Engineer ↔ ML Engineer (interchangeable)',
  },
  {
    from: 'ai-engineer',
    to: 'data-scientist',
    type: 'adjacent',
    strength: 8,
    confidence: 0.88,
    description: 'AI engineers often work closely with data scientists',
    experienceRequired: 1,
    transferableSkills: ['Statistics', 'Machine Learning', 'Python', 'Data Analysis'],
    skillsToDevelop: ['Business Acumen', 'Experiment Design', 'Domain Expertise', 'Data Storytelling'],
    typicalPath: 'AI Engineer → Senior AI Engineer → Data Science Lead',
  },
  {
    from: 'ai-engineer',
    to: 'research-scientist',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'AI engineers often transition to research roles in industry or academia',
    experienceRequired: 3,
    transferableSkills: ['Deep Learning', 'Research Methodology', 'Paper Reading', 'Experimentation'],
    skillsToDevelop: ['Academic Writing', 'Grant Writing', 'Teaching', 'Theoretical Foundations'],
    typicalPath: 'AI Engineer → Research Engineer → Research Scientist',
  },

  // Specialization
  {
    from: 'ai-engineer',
    to: 'software-engineer',
    type: 'specialization',
    strength: 7,
    confidence: 0.82,
    description: 'Can move to broader software engineering but may be overqualified',
    experienceRequired: 0,
    transferableSkills: ['Programming', 'System Design', 'Software Architecture'],
    skillsToDevelop: ['Full-stack Development', 'Web Technologies', 'Mobile Development'],
    typicalPath: 'AI Engineer → Senior Software Engineer (rare)',
  },

  // Progression
  {
    from: 'ai-engineer',
    to: 'founder',
    type: 'progression',
    strength: 7,
    confidence: 0.78,
    description: 'AI expertise is highly valuable for tech startups',
    experienceRequired: 4,
    transferableSkills: ['Technical Depth', 'Innovation', 'Problem Solving', 'Cutting-edge Knowledge'],
    skillsToDevelop: ['Business Strategy', 'Product-Market Fit', 'Fundraising', 'Team Building'],
    typicalPath: 'AI Engineer → AI Lead → AI Startup Founder',
  },

  // Alternative
  {
    from: 'ai-engineer',
    to: 'product-manager',
    type: 'alternative',
    strength: 6,
    confidence: 0.72,
    description: 'AI PMs need deep technical understanding',
    experienceRequired: 3,
    transferableSkills: ['AI/ML Knowledge', 'Technical Communication', 'Problem Solving'],
    skillsToDevelop: ['Product Strategy', 'User Experience', 'Business Metrics', 'Roadmap Planning'],
    typicalPath: 'AI Engineer → AI Product Manager → Product Manager',
  },

  // Pivot
  {
    from: 'ai-engineer',
    to: 'biotechnologist',
    type: 'pivot',
    strength: 3,
    confidence: 0.45,
    description: 'Computational biology intersection but requires biology background',
    experienceRequired: 4,
    transferableSkills: ['Data Analysis', 'Programming', 'Research Methods', 'Pattern Recognition'],
    skillsToDevelop: ['Biology', 'Genomics', 'Bioinformatics', 'Lab Techniques', 'Domain Knowledge'],
    typicalPath: 'AI Engineer → Computational Biologist → Biotechnologist (rare)',
  },
];

// ============================================================================
// DATA SCIENTIST RELATIONSHIPS
// ============================================================================

const DATA_SCIENTIST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'data-scientist',
    to: 'machine-learning-engineer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'Natural transition from research to production ML',
    experienceRequired: 1,
    transferableSkills: ['Machine Learning', 'Python', 'Statistics', 'Feature Engineering', 'Modeling'],
    skillsToDevelop: ['MLOps', 'Production Deployment', 'System Design', 'Scalability'],
    typicalPath: 'Data Scientist → ML Engineer',
  },
  {
    from: 'data-scientist',
    to: 'ai-engineer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.88,
    description: 'Deep learning specialization from data science',
    experienceRequired: 2,
    transferableSkills: ['Machine Learning', 'Python', 'Data Analysis', 'Modeling'],
    skillsToDevelop: ['Deep Learning', 'Neural Networks', 'AI Architecture', 'Large-scale Systems'],
    typicalPath: 'Data Scientist → ML Engineer → AI Engineer',
  },
  {
    from: 'data-scientist',
    to: 'business-analyst',
    type: 'adjacent',
    strength: 7,
    confidence: 0.82,
    description: 'Data scientists often work closely with business analysts',
    experienceRequired: 1,
    transferableSkills: ['Data Analysis', 'SQL', 'Visualization', 'Business Communication'],
    skillsToDevelop: ['Business Process Analysis', 'Requirements Gathering', 'Stakeholder Management'],
    typicalPath: 'Data Scientist → Analytics Manager → Business Analyst Lead',
  },

  // Specialization
  {
    from: 'data-scientist',
    to: 'research-scientist',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'Academic research path from industry data science',
    experienceRequired: 3,
    transferableSkills: ['Research Methods', 'Statistics', 'Experimentation', 'Paper Writing'],
    skillsToDevelop: ['Academic Publishing', 'Grant Writing', 'Teaching', 'Theoretical Depth'],
    typicalPath: 'Data Scientist → Senior Data Scientist → Research Scientist',
  },

  // Progression
  {
    from: 'data-scientist',
    to: 'product-manager',
    type: 'progression',
    strength: 7,
    confidence: 0.78,
    description: 'Data PMs benefit from analytics backgrounds',
    experienceRequired: 3,
    transferableSkills: ['Data-Driven Decision Making', 'A/B Testing', 'Metrics', 'User Insights'],
    skillsToDevelop: ['Product Strategy', 'Roadmap Planning', 'Stakeholder Management', 'Design Thinking'],
    typicalPath: 'Data Scientist → Data Product Manager → Product Manager',
  },

  // Alternative
  {
    from: 'data-scientist',
    to: 'financial-analyst',
    type: 'alternative',
    strength: 6,
    confidence: 0.70,
    description: 'Quantitative finance values data science skills',
    experienceRequired: 2,
    transferableSkills: ['Statistics', 'Modeling', 'Python/R', 'Data Analysis', 'Predictive Modeling'],
    skillsToDevelop: ['Financial Markets', 'Valuation', 'Accounting', 'Risk Management'],
    typicalPath: 'Data Scientist → Quantitative Analyst → Financial Analyst',
  },

  // Pivot
  {
    from: 'data-scientist',
    to: 'psychologist',
    type: 'pivot',
    strength: 3,
    confidence: 0.40,
    description: 'Data analysis in psychology research but requires psychology credentials',
    experienceRequired: 5,
    transferableSkills: ['Statistics', 'Research Methods', 'Data Analysis', 'R Programming'],
    skillsToDevelop: ['Psychology Theory', 'Clinical Skills', 'Counseling', 'Human Behavior'],
    typicalPath: 'Data Scientist → Research Assistant → Psychology PhD → Psychologist (very rare)',
  },
];

// ============================================================================
// PRODUCT MANAGER RELATIONSHIPS
// ============================================================================

const PRODUCT_MANAGER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'product-manager',
    to: 'business-analyst',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'BAs often transition to PM roles and vice versa',
    experienceRequired: 1,
    transferableSkills: ['Requirements Gathering', 'Stakeholder Management', 'Documentation', 'Process Analysis'],
    skillsToDevelop: ['Product Strategy', 'Vision Setting', 'Roadmap Planning', 'User Research'],
    typicalPath: 'Business Analyst → Associate PM → Product Manager',
  },
  {
    from: 'product-manager',
    to: 'ux-designer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.87,
    description: 'Strong collaboration leads to role transitions',
    experienceRequired: 2,
    transferableSkills: ['User Empathy', 'Design Thinking', 'Prototyping', 'User Research'],
    skillsToDevelop: ['Visual Design', 'Interaction Design', 'Design Tools', 'Usability Testing'],
    typicalPath: 'Product Manager → Product Designer → UX Designer',
  },
  {
    from: 'product-manager',
    to: 'product-designer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'Product design is a natural adjacent role for PMs',
    experienceRequired: 1,
    transferableSkills: ['Product Thinking', 'User Research', 'Prototyping', 'Cross-functional Collaboration'],
    skillsToDevelop: ['Visual Design', 'Design Systems', 'Interaction Design', 'Creative Tools'],
    typicalPath: 'Product Manager → Product Designer',
  },

  // Specialization
  {
    from: 'product-manager',
    to: 'software-engineer',
    type: 'specialization',
    type: 'specialization',
    strength: 6,
    confidence: 0.68,
    description: 'Technical PMs can move to engineering but rare',
    experienceRequired: 3,
    transferableSkills: ['Technical Knowledge', 'System Understanding', 'Problem Solving'],
    skillsToDevelop: ['Coding', 'System Architecture', 'Development Practices', 'Technical Depth'],
    typicalPath: 'Product Manager → Technical Program Manager → Engineering (rare)',
  },

  // Progression
  {
    from: 'product-manager',
    to: 'founder',
    type: 'progression',
    strength: 9,
    confidence: 0.88,
    description: 'PM skills are directly applicable to founding startups',
    experienceRequired: 4,
    transferableSkills: ['Product Strategy', 'User Research', 'Roadmap Execution', 'Cross-functional Leadership'],
    skillsToDevelop: ['Fundraising', 'Vision Setting', 'Company Building', 'Culture Creation'],
    typicalPath: 'Product Manager → Senior PM → Group PM → Founder',
  },
  {
    from: 'product-manager',
    to: 'entrepreneur',
    type: 'progression',
    strength: 9,
    confidence: 0.90,
    description: 'PMs have the perfect skill set for entrepreneurship',
    experienceRequired: 3,
    transferableSkills: ['Product-Market Fit', 'Customer Development', 'Iteration', 'Execution'],
    skillsToDevelop: ['Fundraising', 'Sales', 'Marketing', 'Finance', 'Leadership'],
    typicalPath: 'Product Manager → Entrepreneur',
  },

  // Alternative
  {
    from: 'product-manager',
    to: 'management-consultant',
    type: 'alternative',
    strength: 7,
    confidence: 0.75,
    description: 'Strategic thinking translates well to consulting',
    experienceRequired: 3,
    transferableSkills: ['Problem Solving', 'Stakeholder Management', 'Presentation', 'Business Analysis'],
    skillsToDevelop: ['Case Frameworks', 'Industry Expertise', 'Client Management', 'Structured Thinking'],
    typicalPath: 'Product Manager → Strategy Consultant → Management Consultant',
  },
  {
    from: 'product-manager',
    to: 'operations-manager',
    type: 'alternative',
    strength: 6,
    confidence: 0.70,
    description: 'Operational product management leads to operations roles',
    experienceRequired: 3,
    transferableSkills: ['Process Optimization', 'Cross-functional Coordination', 'Metrics', 'Execution'],
    skillsToDevelop: ['Supply Chain', 'Process Design', 'Operational Excellence', 'Resource Planning'],
    typicalPath: 'Product Manager → Operations PM → Operations Manager',
  },

  // Pivot
  {
    from: 'product-manager',
    to: 'investment-banker',
    type: 'pivot',
    strength: 4,
    confidence: 0.55,
    description: 'Requires MBA and significant finance training',
    experienceRequired: 5,
    transferableSkills: ['Business Analysis', 'Financial Modeling', 'Presentation', 'Deal Negotiation'],
    skillsToDevelop: ['Valuation', 'Accounting', 'Financial Markets', 'Client Relations', 'Modeling'],
    typicalPath: 'Product Manager → MBA → Investment Banking',
  },
  {
    from: 'product-manager',
    to: 'venture-capitalist',
    type: 'pivot',
    strength: 6,
    confidence: 0.68,
    description: 'Product experience valuable for evaluating startups',
    experienceRequired: 4,
    transferableSkills: ['Product Evaluation', 'Market Analysis', 'Startup Knowledge', 'Due Diligence'],
    skillsToDevelop: ['Portfolio Management', 'Deal Sourcing', 'Term Sheets', 'Board Governance'],
    typicalPath: 'Product Manager → Founder/Operator → Venture Capitalist',
  },
];

// ============================================================================
// CYBERSECURITY ENGINEER RELATIONSHIPS
// ============================================================================

const CYBERSECURITY_ENGINEER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'cybersecurity-engineer',
    to: 'software-engineer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Security engineers often come from software engineering',
    experienceRequired: 0,
    transferableSkills: ['Programming', 'System Architecture', 'Code Review', 'Network Knowledge'],
    skillsToDevelop: ['Application Development', 'Feature Development', 'Product Engineering'],
    typicalPath: 'Cybersecurity Engineer → Security-focused Developer → Software Engineer',
  },

  // Specialization
  {
    from: 'cybersecurity-engineer',
    to: 'corporate-lawyer',
    type: 'specialization',
    strength: 5,
    confidence: 0.60,
    description: 'Cybersecurity law specialization requires legal education',
    experienceRequired: 5,
    transferableSkills: ['Compliance Knowledge', 'Risk Assessment', 'Technical Understanding', 'Policy Development'],
    skillsToDevelop: ['Legal Education', 'Contract Law', 'Regulatory Frameworks', 'Litigation'],
    typicalPath: 'Cybersecurity Engineer → Compliance Officer → Cybersecurity Lawyer (rare)',
  },

  // Progression
  {
    from: 'cybersecurity-engineer',
    to: 'founder',
    type: 'progression',
    strength: 6,
    confidence: 0.70,
    description: 'Security startups founded by security engineers',
    experienceRequired: 5,
    transferableSkills: ['Security Expertise', 'Risk Management', 'Technical Depth', 'Compliance Knowledge'],
    skillsToDevelop: ['Business Development', 'Sales', 'Marketing', 'Fundraising', 'Leadership'],
    typicalPath: 'Cybersecurity Engineer → Security Architect → CISO → Security Founder',
  },

  // Alternative
  {
    from: 'cybersecurity-engineer',
    to: 'ips-officer',
    type: 'alternative',
    strength: 4,
    confidence: 0.50,
    description: 'Cybercrime investigation in police services',
    experienceRequired: 5,
    transferableSkills: ['Technical Investigation', 'Digital Forensics', 'Cybercrime Knowledge'],
    skillsToDevelop: ['Police Training', 'Law Enforcement', 'Physical Fitness', 'Administrative Skills'],
    typicalPath: 'Cybersecurity Engineer → Cybercrime Consultant → IPS (very rare)',
  },
];

// ============================================================================
// MANAGEMENT CONSULTANT RELATIONSHIPS
// ============================================================================

const MANAGEMENT_CONSULTANT_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'management-consultant',
    to: 'business-analyst',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'BAs often join consulting firms and vice versa',
    experienceRequired: 1,
    transferableSkills: ['Analysis', 'Documentation', 'Stakeholder Management', 'Process Mapping'],
    skillsToDevelop: ['Case Frameworks', 'C-suite Communication', 'Strategy Formulation'],
    typicalPath: 'Business Analyst → Consultant → Management Consultant',
  },
  {
    from: 'management-consultant',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 8,
    confidence: 0.82,
    description: 'Common transition between top consulting and banking',
    experienceRequired: 2,
    transferableSkills: ['Financial Modeling', 'Excel', 'Presentation', 'Deal Analysis', 'Work Ethic'],
    skillsToDevelop: ['Valuation', 'Capital Markets', 'Transaction Execution', 'Client Relations'],
    typicalPath: 'Management Consultant → Investment Banking Associate',
  },
  {
    from: 'management-consultant',
    to: 'product-manager',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Consultants often move to tech PM roles',
    experienceRequired: 2,
    transferableSkills: ['Problem Solving', 'Stakeholder Management', 'Strategy', 'Communication'],
    skillsToDevelop: ['Product Execution', 'Technical Understanding', 'User Research', 'Agile'],
    typicalPath: 'Management Consultant → Associate PM → Product Manager',
  },

  // Specialization
  {
    from: 'management-consultant',
    to: 'operations-manager',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'Operations consulting directly leads to operations roles',
    experienceRequired: 2,
    transferableSkills: ['Process Optimization', 'Efficiency Analysis', 'Change Management', 'Metrics'],
    skillsToDevelop: ['Line Management', 'P&L Responsibility', 'Team Leadership', 'Execution'],
    typicalPath: 'Management Consultant → Operations Consultant → Operations Manager',
  },

  // Progression
  {
    from: 'management-consultant',
    to: 'founder',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'Consulting skills valuable for startup strategy',
    experienceRequired: 4,
    transferableSkills: ['Strategy', 'Market Analysis', 'Problem Solving', 'Network', 'Presentation'],
    skillsToDevelop: ['Execution', 'Technical Skills', 'Product Building', 'Fundraising', 'Leadership'],
    typicalPath: 'Management Consultant → Strategy Lead → Founder',
  },
  {
    from: 'management-consultant',
    to: 'entrepreneur',
    type: 'progression',
    strength: 7,
    confidence: 0.78,
    description: 'Consultants often start businesses in areas they advised',
    experienceRequired: 3,
    transferableSkills: ['Business Strategy', 'Market Entry', 'Financial Modeling', 'Network'],
    skillsToDevelop: ['Execution', 'Product Development', 'Sales', 'Operations', 'Team Building'],
    typicalPath: 'Management Consultant → Industry Expert → Entrepreneur',
  },
  {
    from: 'management-consultant',
    to: 'c-suite',
    type: 'progression',
    strength: 8,
    confidence: 0.80,
    description: 'Consultants often exit to client companies as executives',
    experienceRequired: 5,
    transferableSkills: ['Strategic Thinking', 'C-suite Exposure', 'Industry Knowledge', 'Leadership'],
    skillsToDevelop: ['P&L Management', 'Team Leadership', 'Operational Execution', 'Board Management'],
    typicalPath: 'Management Consultant → Engagement Manager → Partner → Industry Executive',
  },

  // Alternative
  {
    from: 'management-consultant',
    to: 'chartered-accountant',
    type: 'alternative',
    strength: 5,
    confidence: 0.60,
    description: 'Requires CA qualification but analytical skills transfer',
    experienceRequired: 4,
    transferableSkills: ['Financial Analysis', 'Excel', 'Attention to Detail', 'Client Management'],
    skillsToDevelop: ['Accounting Standards', 'Audit', 'Taxation', 'CA Certification'],
    typicalPath: 'Management Consultant → Finance Consultant → CA (rare)',
  },
  {
    from: 'management-consultant',
    to: 'corporate-lawyer',
    type: 'alternative',
    strength: 5,
    confidence: 0.58,
    description: 'Strategy consulting to corporate law requires legal education',
    experienceRequired: 5,
    transferableSkills: ['Business Understanding', 'Deal Analysis', 'Client Relations', 'Research'],
    skillsToDevelop: ['Legal Education', 'Contract Law', 'Regulatory Knowledge', 'Litigation'],
    typicalPath: 'Management Consultant → MBA/JD → Corporate Lawyer (rare)',
  },

  // Pivot
  {
    from: 'management-consultant',
    to: 'ias-officer',
    type: 'pivot',
    strength: 4,
    confidence: 0.50,
    description: 'Some consultants join civil services for public impact',
    experienceRequired: 3,
    transferableSkills: ['Policy Analysis', 'Stakeholder Management', 'Administration', 'Leadership'],
    skillsToDevelop: ['Public Administration', 'Indian Polity', 'Governance', 'UPSC Preparation'],
    typicalPath: 'Management Consultant → UPSC Preparation → IAS (rare)',
  },
];

// ============================================================================
// BUSINESS ANALYST RELATIONSHIPS
// ============================================================================

const BUSINESS_ANALYST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'business-analyst',
    to: 'product-manager',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Most common transition path for BAs',
    experienceRequired: 2,
    transferableSkills: ['Requirements Gathering', 'Process Analysis', 'Stakeholder Management', 'Documentation'],
    skillsToDevelop: ['Product Strategy', 'Vision Setting', 'Roadmap Planning', 'User Research'],
    typicalPath: 'Business Analyst → Associate PM → Product Manager',
  },
  {
    from: 'business-analyst',
    to: 'data-scientist',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Analytics-focused BAs can transition to data science',
    experienceRequired: 2,
    transferableSkills: ['Data Analysis', 'SQL', 'Excel', 'Reporting', 'Business Understanding'],
    skillsToDevelop: ['Python/R', 'Machine Learning', 'Statistics', 'Predictive Modeling'],
    typicalPath: 'Business Analyst → Data Analyst → Data Scientist',
  },
  {
    from: 'business-analyst',
    to: 'management-consultant',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'BAs often join consulting firms for broader exposure',
    experienceRequired: 3,
    transferableSkills: ['Analysis', 'Documentation', 'Process Mapping', 'Stakeholder Management'],
    skillsToDevelop: ['Strategy Frameworks', 'C-suite Communication', 'Industry Expertise'],
    typicalPath: 'Business Analyst → Consultant → Management Consultant',
  },

  // Specialization
  {
    from: 'business-analyst',
    to: 'operations-manager',
    type: 'specialization',
    strength: 8,
    confidence: 0.82,
    description: 'Operations BAs naturally become operations managers',
    experienceRequired: 3,
    transferableSkills: ['Process Analysis', 'Efficiency Optimization', 'Metrics', 'Documentation'],
    skillsToDevelop: ['Team Leadership', 'P&L Management', 'Resource Planning', 'Operational Execution'],
    typicalPath: 'Business Analyst → Senior BA → Operations Manager',
  },
  {
    from: 'business-analyst',
    to: 'financial-analyst',
    type: 'specialization',
    strength: 7,
    confidence: 0.78,
    description: 'Finance-focused BAs can become financial analysts',
    experienceRequired: 2,
    transferableSkills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Reporting'],
    skillsToDevelop: ['Accounting', 'Valuation', 'Financial Markets', 'Investment Analysis'],
    typicalPath: 'Business Analyst → Financial BA → Financial Analyst',
  },

  // Progression
  {
    from: 'business-analyst',
    to: 'project-manager',
    type: 'progression',
    strength: 8,
    confidence: 0.85,
    description: 'Natural progression to project management',
    experienceRequired: 3,
    transferableSkills: ['Requirements Management', 'Stakeholder Communication', 'Documentation', 'Process Knowledge'],
    skillsToDevelop: ['Project Planning', 'Resource Management', 'Risk Management', 'PMP Certification'],
    typicalPath: 'Business Analyst → Senior BA → Project Manager',
  },

  // Alternative
  {
    from: 'business-analyst',
    to: 'software-engineer',
    type: 'alternative',
    strength: 5,
    confidence: 0.62,
    description: 'Technical BAs sometimes move to engineering',
    experienceRequired: 3,
    transferableSkills: ['Technical Knowledge', 'System Understanding', 'Requirements Analysis'],
    skillsToDevelop: ['Programming', 'Development Practices', 'System Architecture', 'Coding'],
    typicalPath: 'Technical Business Analyst → Developer → Software Engineer (rare)',
  },

  // Pivot
  {
    from: 'business-analyst',
    to: 'chartered-accountant',
    type: 'pivot',
    strength: 5,
    confidence: 0.58,
    description: 'Requires CA qualification but analytical skills help',
    experienceRequired: 4,
    transferableSkills: ['Financial Analysis', 'Excel', 'Attention to Detail', 'Process Understanding'],
    skillsToDevelop: ['Accounting Standards', 'Audit', 'Taxation', 'CA Certification'],
    typicalPath: 'Business Analyst → Finance BA → CA Student → Chartered Accountant',
  },
];

// ============================================================================
// OPERATIONS MANAGER RELATIONSHIPS
// ============================================================================

const OPERATIONS_MANAGER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'operations-manager',
    to: 'business-analyst',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Operations knowledge valuable for business analysis',
    experienceRequired: 1,
    transferableSkills: ['Process Analysis', 'Efficiency Optimization', 'Metrics', 'Problem Solving'],
    skillsToDevelop: ['Documentation', 'Requirements Gathering', 'Stakeholder Management', 'Data Analysis'],
    typicalPath: 'Operations Manager → Operations Analyst → Business Analyst',
  },
  {
    from: 'operations-manager',
    to: 'management-consultant',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Operations expertise valuable for operations consulting',
    experienceRequired: 3,
    transferableSkills: ['Process Optimization', 'Change Management', 'Metrics', 'Team Leadership'],
    skillsToDevelop: ['Case Frameworks', 'Strategy', 'C-suite Communication', 'Industry Breadth'],
    typicalPath: 'Operations Manager → Operations Consultant → Management Consultant',
  },

  // Specialization
  {
    from: 'operations-manager',
    to: 'product-manager',
    type: 'specialization',
    strength: 6,
    confidence: 0.70,
    description: 'Operations PMs come from operations backgrounds',
    experienceRequired: 3,
    transferableSkills: ['Process Optimization', 'Cross-functional Coordination', 'Execution', 'Metrics'],
    skillsToDevelop: ['Product Strategy', 'User Research', 'Roadmap Planning', 'Market Analysis'],
    typicalPath: 'Operations Manager → Operations PM → Product Manager',
  },

  // Progression
  {
    from: 'operations-manager',
    to: 'general-manager',
    type: 'progression',
    strength: 9,
    confidence: 0.90,
    description: 'Natural progression to general management',
    experienceRequired: 5,
    transferableSkills: ['P&L Management', 'Team Leadership', 'Process Optimization', 'Cross-functional Management'],
    skillsToDevelop: ['Strategic Planning', 'Business Development', 'Board Management', 'Vision Setting'],
    typicalPath: 'Operations Manager → Senior Operations Manager → General Manager',
  },
  {
    from: 'operations-manager',
    to: 'founder',
    type: 'progression',
    strength: 6,
    confidence: 0.68,
    description: 'Operations expertise valuable for operational startups',
    experienceRequired: 5,
    transferableSkills: ['Execution', 'Process Building', 'Team Management', 'Efficiency'],
    skillsToDevelop: ['Product Development', 'Fundraising', 'Sales', 'Marketing', 'Vision'],
    typicalPath: 'Operations Manager → COO → Founder',
  },

  // Alternative
  {
    from: 'operations-manager',
    to: 'supply-chain-manager',
    type: 'alternative',
    strength: 8,
    confidence: 0.85,
    description: 'Supply chain is a specialization of operations',
    experienceRequired: 2,
    transferableSkills: ['Logistics', 'Process Optimization', 'Vendor Management', 'Inventory Management'],
    skillsToDevelop: ['Global Supply Chain', 'Procurement Strategy', 'Distribution Networks', 'SCM Tools'],
    typicalPath: 'Operations Manager → Supply Chain Lead → Supply Chain Manager',
  },

  // Pivot
  {
    from: 'operations-manager',
    to: 'ias-officer',
    type: 'pivot',
    strength: 3,
    confidence: 0.45,
    description: 'Administrative experience helps but requires UPSC',
    experienceRequired: 3,
    transferableSkills: ['Administration', 'Process Management', 'Team Leadership', 'Public Service'],
    skillsToDevelop: ['Public Policy', 'Governance', 'Indian Polity', 'UPSC Preparation'],
    typicalPath: 'Operations Manager → UPSC Preparation → IAS (rare)',
  },
];

// ============================================================================
// ENTREPRENEUR RELATIONSHIPS
// ============================================================================

const ENTREPRENEUR_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'entrepreneur',
    to: 'founder',
    type: 'adjacent',
    strength: 10,
    confidence: 0.98,
    description: 'Entrepreneur and founder are essentially synonymous',
    experienceRequired: 0,
    transferableSkills: ['Vision', 'Execution', 'Fundraising', 'Leadership', 'Risk Taking'],
    skillsToDevelop: [],
    typicalPath: 'Entrepreneur = Founder',
  },
  {
    from: 'entrepreneur',
    to: 'product-manager',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Failed founders often become great PMs',
    experienceRequired: 0,
    transferableSkills: ['Product-Market Fit', 'Customer Development', 'Iteration', 'Execution'],
    skillsToDevelop: ['Corporate Navigation', 'Stakeholder Management', 'Process Adherence'],
    typicalPath: 'Entrepreneur → Product Manager',
  },
  {
    from: 'entrepreneur',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 5,
    confidence: 0.60,
    description: 'Some entrepreneurs join banking for stability',
    experienceRequired: 3,
    transferableSkills: ['Financial Modeling', 'Deal Making', 'Network', 'Business Acumen'],
    skillsToDevelop: ['Banking Culture', 'Hierarchical Structure', 'Client Service', 'Financial Analysis'],
    typicalPath: 'Entrepreneur → MBA → Investment Banking (rare)',
  },

  // Progression
  {
    from: 'entrepreneur',
    to: 'venture-capitalist',
    type: 'progression',
    strength: 8,
    confidence: 0.82,
    description: 'Successful entrepreneurs often become VCs',
    experienceRequired: 5,
    transferableSkills: ['Startup Experience', 'Founder Empathy', 'Deal Evaluation', 'Network'],
    skillsToDevelop: ['Portfolio Management', 'LP Relations', 'Due Diligence', 'Board Governance'],
    typicalPath: 'Entrepreneur → Angel Investor → Venture Capitalist',
  },
  {
    from: 'entrepreneur',
    to: 'angel-investor',
    type: 'progression',
    strength: 9,
    confidence: 0.88,
    description: 'Natural progression for successful entrepreneurs',
    experienceRequired: 3,
    transferableSkills: ['Startup Knowledge', 'Founder Empathy', 'Deal Flow', 'Mentorship'],
    skillsToDevelop: ['Portfolio Strategy', 'Investment Thesis', 'Due Diligence', 'Term Sheets'],
    typicalPath: 'Entrepreneur → Angel Investor',
  },

  // Alternative
  {
    from: 'entrepreneur',
    to: 'management-consultant',
    type: 'alternative',
    strength: 5,
    confidence: 0.58,
    description: 'Some entrepreneurs join consulting for stability',
    experienceRequired: 2,
    transferableSkills: ['Problem Solving', 'Strategy', 'Execution', 'Leadership'],
    skillsToDevelop: ['Case Frameworks', 'Corporate Structure', 'Client Service', 'Hierarchical Navigation'],
    typicalPath: 'Entrepreneur → Industry Expert Consultant → Management Consultant',
  },

  // Pivot
  {
    from: 'entrepreneur',
    to: 'corporate-executive',
    type: 'pivot',
    strength: 6,
    confidence: 0.68,
    description: 'Some entrepreneurs join large companies as executives',
    experienceRequired: 4,
    transferableSkills: ['Leadership', 'P&L Management', 'Strategy', 'Execution'],
    skillsToDevelop: ['Corporate Politics', 'Process Adherence', 'Bureaucracy Navigation', 'Stakeholder Management'],
    typicalPath: 'Entrepreneur → Startup Executive → Corporate Executive',
  },
];

// ============================================================================
// INVESTMENT BANKER RELATIONSHIPS
// ============================================================================

const INVESTMENT_BANKER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'investment-banker',
    to: 'private-equity',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'Very common transition from banking to PE',
    experienceRequired: 2,
    transferableSkills: ['Financial Modeling', 'Valuation', 'Deal Execution', 'Due Diligence', 'Excel'],
    skillsToDevelop: ['Portfolio Management', 'Operational Value Creation', 'Long-term Thinking'],
    typicalPath: 'Investment Banker → Private Equity Associate',
  },
  {
    from: 'investment-banker',
    to: 'hedge-fund',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Some bankers move to hedge funds for investing',
    experienceRequired: 3,
    transferableSkills: ['Financial Analysis', 'Modeling', 'Market Knowledge', 'Research'],
    skillsToDevelop: ['Public Markets', 'Trading', 'Portfolio Management', 'Risk Management'],
    typicalPath: 'Investment Banker → Hedge Fund Analyst',
  },
  {
    from: 'investment-banker',
    to: 'venture-capital',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Tech bankers sometimes move to VC',
    experienceRequired: 3,
    transferableSkills: ['Deal Analysis', 'Financial Modeling', 'Network', 'Due Diligence'],
    skillsToDevelop: ['Startup Evaluation', 'Technology Understanding', 'Portfolio Support', 'Founder Relations'],
    typicalPath: 'Investment Banker (TMT) → Venture Capital Associate',
  },
  {
    from: 'investment-banker',
    to: 'management-consultant',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Some movement between top consulting and banking',
    experienceRequired: 2,
    transferableSkills: ['Excel', 'PowerPoint', 'Analysis', 'Work Ethic', 'Client Management'],
    skillsToDevelop: ['Strategy Frameworks', 'Operational Analysis', 'Implementation'],
    typicalPath: 'Investment Banker → Strategy Consultant (rare)',
  },
  {
    from: 'investment-banker',
    to: 'corporate-development',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Corporate development is in-house M&A',
    experienceRequired: 3,
    transferableSkills: ['M&A', 'Valuation', 'Deal Execution', 'Financial Modeling', 'Negotiation'],
    skillsToDevelop: ['Corporate Strategy', 'Integration', 'Internal Politics', 'Long-term Planning'],
    typicalPath: 'Investment Banker → Corporate Development Manager',
  },

  // Specialization
  {
    from: 'investment-banker',
    to: 'cfo',
    type: 'specialization',
    strength: 8,
    confidence: 0.82,
    description: 'Bankers often exit to CFO roles',
    experienceRequired: 5,
    transferableSkills: ['Financial Modeling', 'Capital Markets', 'Deal Making', 'Investor Relations'],
    skillsToDevelop: ['Accounting', 'Operations', 'Team Management', 'Board Relations'],
    typicalPath: 'Investment Banker → Corporate Development → CFO',
  },

  // Progression
  {
    from: 'investment-banker',
    to: 'founder',
    type: 'progression',
    strength: 6,
    confidence: 0.68,
    description: 'Some bankers start their own firms or businesses',
    experienceRequired: 5,
    transferableSkills: ['Financial Acumen', 'Deal Making', 'Network', 'Work Ethic'],
    skillsToDevelop: ['Product Development', 'Operations', 'Technology', 'Customer Development'],
    typicalPath: 'Investment Banker → Financial Services Founder',
  },

  // Alternative
  {
    from: 'investment-banker',
    to: 'chartered-accountant',
    type: 'alternative',
    strength: 4,
    confidence: 0.52,
    description: 'Requires CA qualification but finance knowledge helps',
    experienceRequired: 4,
    transferableSkills: ['Financial Analysis', 'Accounting', 'Excel', 'Attention to Detail'],
    skillsToDevelop: ['Audit', 'Taxation', 'CA Certification', 'Compliance'],
    typicalPath: 'Investment Banker → CA (very rare)',
  },
  {
    from: 'investment-banker',
    to: 'cfa-professional',
    type: 'alternative',
    strength: 7,
    confidence: 0.75,
    description: 'Many bankers pursue CFA for credibility',
    experienceRequired: 2,
    transferableSkills: ['Financial Analysis', 'Valuation', 'Ethics', 'Markets'],
    skillsToDevelop: ['CFA Curriculum', 'Portfolio Management', 'Asset Allocation'],
    typicalPath: 'Investment Banker → CFA Charterholder',
  },

  // Pivot
  {
    from: 'investment-banker',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 5,
    confidence: 0.60,
    description: 'Some bankers leave to start businesses',
    experienceRequired: 4,
    transferableSkills: ['Financial Acumen', 'Deal Making', 'Network', 'Work Ethic'],
    skillsToDevelop: ['Product Development', 'Operations', 'Technology', 'Customer Development', 'Leadership'],
    typicalPath: 'Investment Banker → MBA → Entrepreneur',
  },
];

// ============================================================================
// FINANCIAL ANALYST RELATIONSHIPS
// ============================================================================

const FINANCIAL_ANALYST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'financial-analyst',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 8,
    confidence: 0.82,
    description: 'Common path from corporate finance to banking',
    experienceRequired: 2,
    transferableSkills: ['Financial Modeling', 'Excel', 'Accounting', 'Analysis', 'Valuation'],
    skillsToDevelop: ['Deal Execution', 'Client Management', 'Pitch Books', 'Intense Work Ethic'],
    typicalPath: 'Financial Analyst → Investment Banking Associate',
  },
  {
    from: 'financial-analyst',
    to: 'cfa-professional',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'CFA is natural progression for financial analysts',
    experienceRequired: 2,
    transferableSkills: ['Financial Analysis', 'Valuation', 'Accounting', 'Ethics', 'Economics'],
    skillsToDevelop: ['CFA Certification', 'Portfolio Management', 'Asset Allocation'],
    typicalPath: 'Financial Analyst → CFA Level I/II/III → CFA Charterholder',
  },
  {
    from: 'financial-analyst',
    to: 'chartered-accountant',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'CA is common for financial analysts in India',
    experienceRequired: 3,
    transferableSkills: ['Accounting', 'Financial Analysis', 'Excel', 'Attention to Detail'],
    skillsToDevelop: ['Audit', 'Taxation', 'CA Certification', 'Regulatory Knowledge'],
    typicalPath: 'Financial Analyst → CA Student → Chartered Accountant',
  },

  // Specialization
  {
    from: 'financial-analyst',
    to: 'cfo',
    type: 'specialization',
    strength: 8,
    confidence: 0.82,
    description: 'Natural progression to CFO over time',
    experienceRequired: 10,
    transferableSkills: ['Financial Modeling', 'Analysis', 'Reporting', 'Forecasting', 'Budgeting'],
    skillsToDevelop: ['Strategic Planning', 'Leadership', 'Board Relations', 'Investor Relations', 'Operations'],
    typicalPath: 'Financial Analyst → Senior Analyst → Finance Manager → CFO',
  },

  // Progression
  {
    from: 'financial-analyst',
    to: 'portfolio-manager',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'Equity analysts can become portfolio managers',
    experienceRequired: 5,
    transferableSkills: ['Financial Analysis', 'Valuation', 'Sector Knowledge', 'Modeling'],
    skillsToDevelop: ['Portfolio Construction', 'Asset Allocation', 'Risk Management', 'Client Relations'],
    typicalPath: 'Financial Analyst → Equity Research → Portfolio Manager',
  },

  // Alternative
  {
    from: 'financial-analyst',
    to: 'business-analyst',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Financial BAs often have analyst backgrounds',
    experienceRequired: 2,
    transferableSkills: ['Analysis', 'Excel', 'Modeling', 'Process Understanding'],
    skillsToDevelop: ['Requirements Gathering', 'Process Mapping', 'Stakeholder Management'],
    typicalPath: 'Financial Analyst → Financial BA → Business Analyst',
  },
  {
    from: 'financial-analyst',
    to: 'data-scientist',
    type: 'alternative',
    strength: 5,
    confidence: 0.60,
    description: 'Quantitative finance overlaps with data science',
    experienceRequired: 3,
    transferableSkills: ['Quantitative Analysis', 'Excel', 'Statistics', 'Modeling'],
    skillsToDevelop: ['Python/R', 'Machine Learning', 'Big Data', 'Programming'],
    typicalPath: 'Financial Analyst → Quant Analyst → Data Scientist',
  },

  // Pivot
  {
    from: 'financial-analyst',
    to: 'software-engineer',
    type: 'pivot',
    strength: 3,
    confidence: 0.42,
    description: 'Fintech developers sometimes come from finance',
    experienceRequired: 4,
    transferableSkills: ['Financial Domain Knowledge', 'Excel', 'Logic', 'Analysis'],
    skillsToDevelop: ['Programming', 'Development', 'System Design', 'Coding'],
    typicalPath: 'Financial Analyst → Fintech BA → Software Engineer (rare)',
  },
];

// ============================================================================
// CHARTERED ACCOUNTANT RELATIONSHIPS
// ============================================================================

const CHARTERED_ACCOUNTANT_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'chartered-accountant',
    to: 'financial-analyst',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'CAs often move to financial analysis roles',
    experienceRequired: 1,
    transferableSkills: ['Accounting', 'Financial Analysis', 'Excel', 'Auditing', 'Compliance'],
    skillsToDevelop: ['Modeling', 'Valuation', 'Forecasting', 'Investment Analysis'],
    typicalPath: 'Chartered Accountant → Financial Analyst',
  },
  {
    from: 'chartered-accountant',
    to: 'cfa-professional',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'CA+CFA combination is common in India',
    experienceRequired: 2,
    transferableSkills: ['Accounting', 'Financial Analysis', 'Ethics', 'Economics'],
    skillsToDevelop: ['Portfolio Management', 'Asset Allocation', 'Investment Analysis'],
    typicalPath: 'Chartered Accountant → CFA → CA+CFA Professional',
  },
  {
    from: 'chartered-accountant',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'CAs sometimes move to investment banking',
    experienceRequired: 2,
    transferableSkills: ['Accounting', 'Financial Analysis', 'Excel', 'Attention to Detail'],
    skillsToDevelop: ['Valuation', 'Deal Execution', 'Modeling', 'Client Management'],
    typicalPath: 'Chartered Accountant → MBA → Investment Banking',
  },

  // Specialization
  {
    from: 'chartered-accountant',
    to: 'cfo',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Natural path from CA to CFO',
    experienceRequired: 8,
    transferableSkills: ['Accounting', 'Financial Reporting', 'Compliance', 'Audit', 'Taxation'],
    skillsToDevelop: ['Strategic Planning', 'Leadership', 'Investor Relations', 'Board Management'],
    typicalPath: 'Chartered Accountant → Finance Manager → Director Finance → CFO',
  },

  // Progression
  {
    from: 'chartered-accountant',
    to: 'entrepreneur',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'CAs often start their own practice or businesses',
    experienceRequired: 5,
    transferableSkills: ['Financial Acumen', 'Compliance', 'Taxation', 'Business Understanding'],
    skillsToDevelop: ['Sales', 'Marketing', 'Operations', 'Product Development', 'Leadership'],
    typicalPath: 'Chartered Accountant → CA Practice → Entrepreneur',
  },
  {
    from: 'chartered-accountant',
    to: 'founder',
    type: 'progression',
    strength: 6,
    confidence: 0.70,
    description: 'CAs found fintech and financial services startups',
    experienceRequired: 6,
    transferableSkills: ['Financial Expertise', 'Compliance', 'Business Structure', 'Tax Optimization'],
    skillsToDevelop: ['Technology', 'Product Development', 'Fundraising', 'Customer Development'],
    typicalPath: 'Chartered Accountant → Finance Consultant → Fintech Founder',
  },

  // Alternative
  {
    from: 'chartered-accountant',
    to: 'irs-officer',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Tax expertise relevant for IRS',
    experienceRequired: 2,
    transferableSkills: ['Taxation', 'Accounting', 'Compliance', 'Audit'],
    skillsToDevelop: ['Public Administration', 'Governance', 'UPSC Preparation', 'Policy'],
    typicalPath: 'Chartered Accountant → UPSC → IRS Officer',
  },
  {
    from: 'chartered-accountant',
    to: 'corporate-lawyer',
    type: 'alternative',
    strength: 5,
    confidence: 0.60,
    description: 'CA+Law combination for tax and corporate law',
    experienceRequired: 4,
    transferableSkills: ['Taxation', 'Compliance', 'Corporate Structure', 'Contract Understanding'],
    skillsToDevelop: ['Legal Education', 'Litigation', 'Corporate Law', 'Legal Drafting'],
    typicalPath: 'Chartered Accountant → LLB → Corporate Lawyer (Tax/Compliance focus)',
  },

  // Pivot
  {
    from: 'chartered-accountant',
    to: 'management-consultant',
    type: 'pivot',
    strength: 5,
    confidence: 0.62,
    description: 'Requires MBA but analytical skills transfer',
    experienceRequired: 3,
    transferableSkills: ['Analysis', 'Excel', 'Business Understanding', 'Client Management'],
    skillsToDevelop: ['Strategy', 'Case Frameworks', 'Industry Expertise', 'C-suite Communication'],
    typicalPath: 'Chartered Accountant → MBA → Management Consultant',
  },
];

// ============================================================================
// CFA PROFESSIONAL RELATIONSHIPS
// ============================================================================

const CFA_PROFESSIONAL_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'cfa-professional',
    to: 'financial-analyst',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'CFA charterholders often work as financial analysts',
    experienceRequired: 0,
    transferableSkills: ['Financial Analysis', 'Valuation', 'Portfolio Management', 'Ethics', 'Economics'],
    skillsToDevelop: ['Industry Specialization', 'Company Research', 'Modeling'],
    typicalPath: 'CFA Professional → Senior Financial Analyst',
  },
  {
    from: 'cfa-professional',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'CFA valuable for equity research and banking',
    experienceRequired: 2,
    transferableSkills: ['Valuation', 'Financial Modeling', 'Analysis', 'Ethics'],
    skillsToDevelop: ['Deal Execution', 'Client Management', 'Pitch Books', 'M&A'],
    typicalPath: 'CFA Professional → Equity Research → Investment Banking',
  },
  {
    from: 'cfa-professional',
    to: 'portfolio-manager',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'CFA is standard for portfolio managers',
    experienceRequired: 3,
    transferableSkills: ['Portfolio Management', 'Asset Allocation', 'Risk Management', 'Valuation'],
    skillsToDevelop: ['Client Relations', 'Team Leadership', 'Business Development'],
    typicalPath: 'CFA Professional → Assistant PM → Portfolio Manager',
  },

  // Specialization
  {
    from: 'cfa-professional',
    to: 'chartered-accountant',
    type: 'specialization',
    strength: 6,
    confidence: 0.68,
    description: 'CA+CFA combination for comprehensive finance expertise',
    experienceRequired: 4,
    transferableSkills: ['Financial Analysis', 'Accounting', 'Ethics', 'Valuation'],
    skillsToDevelop: ['Audit', 'Taxation', 'CA Certification', 'Compliance'],
    typicalPath: 'CFA Professional → CA Course → Chartered Accountant',
  },

  // Progression
  {
    from: 'cfa-professional',
    to: 'cfo',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'CFA charterholders can become CFOs with experience',
    experienceRequired: 10,
    transferableSkills: ['Financial Strategy', 'Investor Relations', 'Valuation', 'Capital Markets'],
    skillsToDevelop: ['Accounting', 'Operations', 'Leadership', 'Board Management'],
    typicalPath: 'CFA Professional → Finance Manager → Director → CFO',
  },

  // Alternative
  {
    from: 'cfa-professional',
    to: 'private-equity',
    type: 'alternative',
    strength: 8,
    confidence: 0.85,
    description: 'CFA valuable for PE investing',
    experienceRequired: 3,
    transferableSkills: ['Valuation', 'Financial Modeling', 'Due Diligence', 'Analysis'],
    skillsToDevelop: ['Deal Sourcing', 'Portfolio Management', 'Operational Value Creation'],
    typicalPath: 'CFA Professional → PE Associate',
  },
  {
    from: 'cfa-professional',
    to: 'venture-capital',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'CFA less common in VC but valuable for fintech',
    experienceRequired: 4,
    transferableSkills: ['Valuation', 'Financial Analysis', 'Due Diligence'],
    skillsToDevelop: ['Startup Evaluation', 'Technology Understanding', 'Portfolio Support'],
    typicalPath: 'CFA Professional → VC Associate (fintech focus)',
  },

  // Pivot
  {
    from: 'cfa-professional',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 5,
    confidence: 0.60,
    description: 'Some CFAs start fintech or investment businesses',
    experienceRequired: 5,
    transferableSkills: ['Financial Acumen', 'Valuation', 'Market Knowledge', 'Network'],
    skillsToDevelop: ['Product Development', 'Technology', 'Sales', 'Operations', 'Leadership'],
    typicalPath: 'CFA Professional → Finance Consultant → Fintech Founder',
  },
];

// ============================================================================
// IAS OFFICER RELATIONSHIPS
// ============================================================================

const IAS_OFFICER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'ias-officer',
    to: 'ips-officer',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Both are All India Services with similar selection process',
    experienceRequired: 0,
    transferableSkills: ['UPSC Preparation', 'Administration', 'Public Service', 'Leadership'],
    skillsToDevelop: ['Law Enforcement', 'Police Administration', 'Criminal Justice'],
    typicalPath: 'IAS Officer ↔ IPS Officer (different service, same exam)',
  },
  {
    from: 'ias-officer',
    to: 'irs-officer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.82,
    description: 'Both are civil services with administrative focus',
    experienceRequired: 0,
    transferableSkills: ['UPSC Preparation', 'Administration', 'Public Policy', 'Governance'],
    skillsToDevelop: ['Taxation', 'Revenue Administration', 'Financial Management'],
    typicalPath: 'IAS Officer ↔ IRS Officer (different service, same exam)',
  },

  // Specialization
  {
    from: 'ias-officer',
    to: 'public-policy-expert',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'IAS officers often become policy experts',
    experienceRequired: 10,
    transferableSkills: ['Policy Formulation', 'Implementation', 'Government Relations', 'Public Administration'],
    skillsToDevelop: ['Academic Research', 'Think Tank Experience', 'International Relations'],
    typicalPath: 'IAS Officer → Policy Department → Public Policy Expert',
  },

  // Progression
  {
    from: 'ias-officer',
    to: 'private-sector-cxo',
    type: 'progression',
    strength: 6,
    confidence: 0.68,
    description: 'Some IAS officers join private sector after retirement',
    experienceRequired: 20,
    transferableSkills: ['Administration', 'Leadership', 'Policy Knowledge', 'Network'],
    skillsToDevelop: ['Corporate Strategy', 'P&L Management', 'Shareholder Relations', 'Market Competition'],
    typicalPath: 'IAS Officer → Secretary → Post-retirement Corporate Role',
  },

  // Alternative
  {
    from: 'ias-officer',
    to: 'management-consultant',
    type: 'alternative',
    strength: 4,
    confidence: 0.55,
    description: 'Rare but some officers join consulting post-retirement',
    experienceRequired: 15,
    transferableSkills: ['Problem Solving', 'Stakeholder Management', 'Policy Analysis', 'Leadership'],
    skillsToDevelop: ['Corporate Strategy', 'Private Sector Dynamics', 'Client Management', 'Fees/Billing'],
    typicalPath: 'IAS Officer → Post-retirement → Public Sector Consultant',
  },
  {
    from: 'ias-officer',
    to: 'politics',
    type: 'alternative',
    strength: 5,
    confidence: 0.60,
    description: 'Some IAS officers enter politics after resignation/retirement',
    experienceRequired: 15,
    transferableSkills: ['Public Service', 'Administration', 'Policy Knowledge', 'Network', 'Leadership'],
    skillsToDevelop: ['Electoral Politics', 'Party Dynamics', 'Campaigning', 'Public Speaking'],
    typicalPath: 'IAS Officer → Resignation → Political Party → Election',
  },

  // Pivot
  {
    from: 'ias-officer',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 3,
    confidence: 0.45,
    description: 'Very rare for serving officers; some post-retirement',
    experienceRequired: 20,
    transferableSkills: ['Leadership', 'Network', 'Policy Knowledge', 'Administration'],
    skillsToDevelop: ['Business Strategy', 'Product Development', 'Fundraising', 'Sales', 'Technology'],
    typicalPath: 'IAS Officer → Post-retirement → Advisor → Entrepreneur (very rare)',
  },
];

// ============================================================================
// IPS OFFICER RELATIONSHIPS
// ============================================================================

const IPS_OFFICER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'ips-officer',
    to: 'ias-officer',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Both are All India Services',
    experienceRequired: 0,
    transferableSkills: ['UPSC Preparation', 'Administration', 'Leadership', 'Public Service'],
    skillsToDevelop: ['General Administration', 'Policy Formulation', 'Development Work'],
    typicalPath: 'IPS Officer ↔ IAS Officer (different service, same exam)',
  },
  {
    from: 'ips-officer',
    to: 'irs-officer',
    type: 'adjacent',
    strength: 6,
    confidence: 0.68,
    description: 'Both are civil services',
    experienceRequired: 0,
    transferableSkills: ['UPSC Preparation', 'Government Service', 'Administration'],
    skillsToDevelop: ['Taxation', 'Revenue Administration'],
    typicalPath: 'IPS Officer ↔ IRS Officer (different service, same exam)',
  },

  // Specialization
  {
    from: 'ips-officer',
    to: 'security-consultant',
    type: 'specialization',
    strength: 7,
    confidence: 0.75,
    description: 'Post-retirement security consulting is common',
    experienceRequired: 15,
    transferableSkills: ['Security Management', 'Crisis Management', 'Intelligence', 'Leadership'],
    skillsToDevelop: ['Corporate Security', 'Private Sector Dynamics', 'Consulting', 'Client Management'],
    typicalPath: 'IPS Officer → Senior Position → Post-retirement Security Consultant',
  },

  // Progression
  {
    from: 'ips-officer',
    to: 'intelligence-agencies',
    type: 'progression',
    strength: 8,
    confidence: 0.82,
    description: 'IPS officers often join intelligence agencies',
    experienceRequired: 10,
    transferableSkills: ['Investigation', 'Intelligence', 'Security', 'Crisis Management'],
    skillsToDevelop: ['National Security', 'Intelligence Analysis', 'Counter-terrorism', 'International Relations'],
    typicalPath: 'IPS Officer → Intelligence Bureau/RAW → Senior Intelligence Officer',
  },

  // Alternative
  {
    from: 'ips-officer',
    to: 'politics',
    type: 'alternative',
    strength: 6,
    confidence: 0.65,
    description: 'Some IPS officers enter politics',
    experienceRequired: 15,
    transferableSkills: ['Public Service', 'Leadership', 'Crisis Management', 'Network'],
    skillsToDevelop: ['Electoral Politics', 'Party Dynamics', 'Campaigning', 'Policy Articulation'],
    typicalPath: 'IPS Officer → Resignation/Retirement → Political Party → Election',
  },

  // Pivot
  {
    from: 'ips-officer',
    to: 'cybersecurity-engineer',
    type: 'pivot',
    strength: 3,
    confidence: 0.42,
    description: 'Cybercrime investigation background can help',
    experienceRequired: 10,
    transferableSkills: ['Cybercrime Investigation', 'Digital Forensics', 'Security Mindset'],
    skillsToDevelop: ['Programming', 'Security Engineering', 'Cloud Security', 'DevSecOps'],
    typicalPath: 'IPS Officer (Cybercrime) → Post-retirement → Cybersecurity Consultant (rare)',
  },
];

// ============================================================================
// IRS OFFICER RELATIONSHIPS
// ============================================================================

const IRS_OFFICER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'irs-officer',
    to: 'ias-officer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.82,
    description: 'Both are civil services with administrative focus',
    experienceRequired: 0,
    transferableSkills: ['UPSC Preparation', 'Administration', 'Public Policy', 'Governance'],
    skillsToDevelop: ['General Administration', 'Development', 'District Management'],
    typicalPath: 'IRS Officer ↔ IAS Officer (different service, same exam)',
  },
  {
    from: 'irs-officer',
    to: 'chartered-accountant',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Tax expertise overlaps with CA knowledge',
    experienceRequired: 0,
    transferableSkills: ['Taxation', 'Accounting', 'Compliance', 'Audit', 'Financial Analysis'],
    skillsToDevelop: ['Private Sector Accounting', 'Client Management', 'Business Advisory'],
    typicalPath: 'IRS Officer → Post-retirement → Tax Consultant (similar to CA practice)',
  },

  // Specialization
  {
    from: 'irs-officer',
    to: 'tax-consultant',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Post-retirement tax consulting is very common',
    experienceRequired: 15,
    transferableSkills: ['Taxation', 'Tax Policy', 'Compliance', 'Audit', 'Investigation'],
    skillsToDevelop: ['Private Sector Practice', 'Client Relations', 'Business Development'],
    typicalPath: 'IRS Officer → Senior Position → Post-retirement Tax Consultant',
  },

  // Progression
  {
    from: 'irs-officer',
    to: 'private-sector-cfo',
    type: 'progression',
    strength: 5,
    confidence: 0.58,
    description: 'Some IRS officers join as tax heads/CFOs post-retirement',
    experienceRequired: 20,
    transferableSkills: ['Taxation', 'Compliance', 'Financial Management', 'Audit', 'Policy Knowledge'],
    skillsToDevelop: ['Corporate Strategy', 'P&L Management', 'Investor Relations', 'Operations'],
    typicalPath: 'IRS Officer → Chief Commissioner → Post-retirement → Corporate Tax Head',
  },

  // Alternative
  {
    from: 'irs-officer',
    to: 'corporate-lawyer',
    type: 'alternative',
    strength: 5,
    confidence: 0.60,
    description: 'Tax law expertise can lead to corporate law',
    experienceRequired: 10,
    transferableSkills: ['Tax Law', 'Compliance', 'Regulatory Knowledge', 'Interpretation'],
    skillsToDevelop: ['Legal Education', 'Corporate Law', 'Litigation', 'Contract Drafting'],
    typicalPath: 'IRS Officer → LLB (evening) → Post-retirement → Tax Lawyer',
  },

  // Pivot
  {
    from: 'irs-officer',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 3,
    confidence: 0.45,
    description: 'Very rare for serving officers',
    experienceRequired: 20,
    transferableSkills: ['Tax Knowledge', 'Compliance', 'Network', 'Administration'],
    skillsToDevelop: ['Business Strategy', 'Product Development', 'Fundraising', 'Sales', 'Technology'],
    typicalPath: 'IRS Officer → Post-retirement → Tax Advisory Firm → Entrepreneur (rare)',
  },
];

// ============================================================================
// DOCTOR RELATIONSHIPS
// ============================================================================

const DOCTOR_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'doctor',
    to: 'surgeon',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'Surgery is a specialization of medicine',
    experienceRequired: 3,
    transferableSkills: ['Medical Knowledge', 'Patient Care', 'Diagnosis', 'Clinical Skills'],
    skillsToDevelop: ['Surgical Techniques', 'Operating Room Protocols', 'Surgical Specialization'],
    typicalPath: 'Doctor (MBBS) → MS (Surgery) → Surgeon',
  },
  {
    from: 'doctor',
    to: 'psychiatrist',
    type: 'adjacent',
    strength: 8,
    confidence: 0.88,
    description: 'Psychiatry is a medical specialization',
    experienceRequired: 3,
    transferableSkills: ['Medical Foundation', 'Patient Interaction', 'Diagnosis', 'Treatment Planning'],
    skillsToDevelop: ['Psychology', 'Psychotherapy', 'Psychopharmacology', 'Mental Health'],
    typicalPath: 'Doctor (MBBS) → MD (Psychiatry) → Psychiatrist',
  },
  {
    from: 'doctor',
    to: 'medical-researcher',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Clinical research is common for doctors',
    experienceRequired: 2,
    transferableSkills: ['Medical Knowledge', 'Scientific Method', 'Patient Data', 'Clinical Understanding'],
    skillsToDevelop: ['Research Methodology', 'Biostatistics', 'Grant Writing', 'Academic Publishing'],
    typicalPath: 'Doctor → Junior Resident → Research Fellow → Medical Researcher',
  },

  // Specialization
  {
    from: 'doctor',
    to: 'radiologist',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Radiology is a popular medical specialization',
    experienceRequired: 3,
    transferableSkills: ['Medical Knowledge', 'Anatomy', 'Diagnosis', 'Technology Comfort'],
    skillsToDevelop: ['Imaging Interpretation', 'Radiation Safety', 'Interventional Techniques'],
    typicalPath: 'Doctor (MBBS) → MD (Radiology) → Radiologist',
  },

  // Progression
  {
    from: 'doctor',
    to: 'hospital-administrator',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'Senior doctors often become hospital administrators',
    experienceRequired: 10,
    transferableSkills: ['Clinical Knowledge', 'Patient Care', 'Medical Protocols', 'Leadership'],
    skillsToDevelop: ['Hospital Management', 'Operations', 'Finance', 'HR Management', 'Strategy'],
    typicalPath: 'Doctor → Senior Doctor → Department Head → Hospital Administrator',
  },

  // Alternative
  {
    from: 'doctor',
    to: 'public-health-expert',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Public health is a related field',
    experienceRequired: 3,
    transferableSkills: ['Medical Knowledge', 'Epidemiology', 'Community Health', 'Prevention'],
    skillsToDevelop: ['Health Policy', 'Biostatistics', 'Program Management', 'Global Health'],
    typicalPath: 'Doctor → MPH → Public Health Expert',
  },
  {
    from: 'doctor',
    to: 'biotechnologist',
    type: 'alternative',
    strength: 4,
    confidence: 0.52,
    description: 'Requires additional biotechnology training',
    experienceRequired: 4,
    transferableSkills: ['Medical Science', 'Research', 'Biology', 'Laboratory Skills'],
    skillsToDevelop: ['Biotechnology', 'Genetic Engineering', 'Bioinformatics', 'Industry R&D'],
    typicalPath: 'Doctor → Biotech Certification → Biotech R&D (rare)',
  },

  // Pivot
  {
    from: 'doctor',
    to: 'founder',
    type: 'pivot',
    strength: 5,
    confidence: 0.60,
    description: 'Doctors often start healthcare startups',
    experienceRequired: 5,
    transferableSkills: ['Medical Expertise', 'Patient Understanding', 'Network', 'Clinical Knowledge'],
    skillsToDevelop: ['Business Strategy', 'Technology', 'Fundraising', 'Product Development', 'Marketing'],
    typicalPath: 'Doctor → Healthcare Consultant → Healthcare Founder',
  },
];

// ============================================================================
// SURGEON RELATIONSHIPS
// ============================================================================

const SURGEON_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'surgeon',
    to: 'doctor',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Surgeons are specialized doctors',
    experienceRequired: 0,
    transferableSkills: ['Medical Knowledge', 'Patient Care', 'Clinical Skills', 'Diagnosis'],
    skillsToDevelop: ['General Medicine', 'Non-surgical Treatment', 'Primary Care'],
    typicalPath: 'Surgeon → General Practice (rare, usually other direction)',
  },
  {
    from: 'surgeon',
    to: 'surgical-oncologist',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'Surgical oncology is a super-specialization',
    experienceRequired: 3,
    transferableSkills: ['Surgical Skills', 'Oncology Knowledge', 'Patient Management', 'Operating Room'],
    skillsToDevelop: ['Cancer Surgery', 'Oncology Protocols', 'Multidisciplinary Care'],
    typicalPath: 'Surgeon → MCh (Surgical Oncology) → Surgical Oncologist',
  },

  // Specialization
  {
    from: 'surgeon',
    to: 'orthopedic-surgeon',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Orthopedics is a surgical super-specialization',
    experienceRequired: 3,
    transferableSkills: ['Surgical Skills', 'Anatomy', 'Patient Care', 'Operating Room'],
    skillsToDevelop: ['Orthopedic Techniques', 'Joint Replacement', 'Sports Medicine', 'Trauma'],
    typicalPath: 'Surgeon → MCh (Orthopedics) → Orthopedic Surgeon',
  },
  {
    from: 'surgeon',
    to: 'cardiac-surgeon',
    type: 'specialization',
    strength: 10,
    confidence: 0.95,
    description: 'Cardiac surgery is a highly specialized field',
    experienceRequired: 5,
    transferableSkills: ['Surgical Precision', 'Critical Care', 'Anatomy', 'Operating Room'],
    skillsToDevelop: ['Cardiac Anatomy', 'Bypass Techniques', 'Transplant', 'Cardiac Physiology'],
    typicalPath: 'Surgeon → MCh (Cardiac Surgery) → Cardiac Surgeon',
  },

  // Progression
  {
    from: 'surgeon',
    to: 'hospital-founder',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'Surgeons often start their own hospitals/clinics',
    experienceRequired: 15,
    transferableSkills: ['Medical Expertise', 'Patient Network', 'Reputation', 'Surgical Skills'],
    skillsToDevelop: ['Hospital Management', 'Business Operations', 'Finance', 'Marketing'],
    typicalPath: 'Surgeon → Senior Surgeon → Hospital Founder/Director',
  },

  // Alternative
  {
    from: 'surgeon',
    to: 'medical-researcher',
    type: 'alternative',
    strength: 6,
    confidence: 0.65,
    description: 'Academic surgeons combine practice with research',
    experienceRequired: 5,
    transferableSkills: ['Medical Knowledge', 'Clinical Data', 'Research Mindset', 'Academic Environment'],
    skillsToDevelop: ['Research Methodology', 'Grant Writing', 'Publishing', 'Clinical Trials'],
    typicalPath: 'Surgeon → Academic Surgeon → Medical Researcher',
  },

  // Pivot
  {
    from: 'surgeon',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 4,
    confidence: 0.55,
    description: 'Outside healthcare, rare transition',
    experienceRequired: 10,
    transferableSkills: ['Decision Making', 'Crisis Management', 'Precision', 'Leadership'],
    skillsToDevelop: ['Business Strategy', 'Product Development', 'Technology', 'Marketing'],
    typicalPath: 'Surgeon → Healthcare Entrepreneur (medtech focus)',
  },
];

// ============================================================================
// PSYCHOLOGIST RELATIONSHIPS
// ============================================================================

const PSYCHOLOGIST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'psychologist',
    to: 'psychiatrist',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Related mental health professions with different approaches',
    experienceRequired: 5,
    transferableSkills: ['Mental Health Knowledge', 'Patient Interaction', 'Therapy Skills', 'Assessment'],
    skillsToDevelop: ['Medical Degree', 'Pharmacology', 'Medical Diagnosis', 'Prescription'],
    typicalPath: 'Psychologist → MBBS → MD Psychiatry → Psychiatrist (very long)',
  },
  {
    from: 'psychologist',
    to: 'counselor',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'Counseling is a subset of psychology practice',
    experienceRequired: 0,
    transferableSkills: ['Therapy', 'Active Listening', 'Assessment', 'Mental Health'],
    skillsToDevelop: ['Specific Counseling Techniques', 'Career Counseling', 'School Counseling'],
    typicalPath: 'Psychologist → Licensed Counselor',
  },
  {
    from: 'psychologist',
    to: 'user-researcher',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'UX research uses psychological methods',
    experienceRequired: 1,
    transferableSkills: ['Research Methods', 'Human Behavior', 'Interviewing', 'Data Analysis', 'Empathy'],
    skillsToDevelop: ['UX Methods', 'Product Understanding', 'Design Thinking', 'Prototyping'],
    typicalPath: 'Psychologist → UX Researcher → User Researcher',
  },

  // Specialization
  {
    from: 'psychologist',
    to: 'clinical-psychologist',
    type: 'specialization',
    strength: 9,
    confidence: 0.92,
    description: 'Clinical psychology is a core specialization',
    experienceRequired: 2,
    transferableSkills: ['Psychology Foundation', 'Assessment', 'Therapy', 'Research'],
    skillsToDevelop: ['Clinical Diagnosis', 'Psychopathology', 'Clinical Interventions', 'Licensing'],
    typicalPath: 'Psychologist → M.Phil Clinical Psychology → Clinical Psychologist',
  },
  {
    from: 'psychologist',
    to: 'organizational-psychologist',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'I/O psychology applies psychology to workplaces',
    experienceRequired: 2,
    transferableSkills: ['Psychology', 'Research', 'Assessment', 'Human Behavior'],
    skillsToDevelop: ['Organizational Behavior', 'HR Practices', 'Leadership Development', 'Team Dynamics'],
    typicalPath: 'Psychologist → M.A. I/O Psychology → Organizational Psychologist',
  },

  // Progression
  {
    from: 'psychologist',
    to: 'hr-consultant',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'I/O psychologists often become HR consultants',
    experienceRequired: 3,
    transferableSkills: ['Human Behavior', 'Assessment', 'Organizational Dynamics', 'Interviewing'],
    skillsToDevelop: ['HR Strategy', 'Talent Management', 'Compensation', 'Labor Laws'],
    typicalPath: 'Psychologist → HR Business Partner → HR Consultant',
  },

  // Alternative
  {
    from: 'psychologist',
    to: 'school-counselor',
    type: 'alternative',
    strength: 8,
    confidence: 0.85,
    description: 'School counseling is a common psychology career',
    experienceRequired: 1,
    transferableSkills: ['Counseling', 'Child/Adolescent Psychology', 'Assessment', 'Intervention'],
    skillsToDevelop: ['School Systems', 'Academic Counseling', 'Career Guidance', 'Parent Engagement'],
    typicalPath: 'Psychologist → School Counselor',
  },

  // Pivot
  {
    from: 'psychologist',
    to: 'data-scientist',
    type: 'pivot',
    strength: 4,
    confidence: 0.50,
    description: 'Psychometrics and research methods can transfer',
    experienceRequired: 3,
    transferableSkills: ['Statistics', 'Research Methods', 'Data Analysis', 'R/SPSS', 'Experimental Design'],
    skillsToDevelop: ['Python', 'Machine Learning', 'Big Data', 'Business Acumen'],
    typicalPath: 'Psychologist → Quantitative Researcher → Data Scientist (rare)',
  },
];

// ============================================================================
// CORPORATE LAWYER RELATIONSHIPS
// ============================================================================

const CORPORATE_LAWYER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'corporate-lawyer',
    to: 'litigation-lawyer',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Some movement between corporate and litigation',
    experienceRequired: 2,
    transferableSkills: ['Legal Knowledge', 'Research', 'Drafting', 'Client Management'],
    skillsToDevelop: ['Court Procedures', 'Oral Arguments', 'Trial Practice', 'Evidence Law'],
    typicalPath: 'Corporate Lawyer → Litigation Associate → Litigation Lawyer',
  },
  {
    from: 'corporate-lawyer',
    to: 'compliance-officer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Compliance roles natural for corporate lawyers',
    experienceRequired: 2,
    transferableSkills: ['Regulatory Knowledge', 'Contract Review', 'Risk Assessment', 'Policy Drafting'],
    skillsToDevelop: ['Internal Controls', 'Audit', 'Ethics Programs', 'Training'],
    typicalPath: 'Corporate Lawyer → Compliance Manager → Compliance Officer',
  },
  {
    from: 'corporate-lawyer',
    to: 'investment-banker',
    type: 'adjacent',
    strength: 6,
    confidence: 0.68,
    description: 'M&A lawyers sometimes move to banking',
    experienceRequired: 3,
    transferableSkills: ['Deal Knowledge', 'Financial Documents', 'Due Diligence', 'Negotiation'],
    skillsToDevelop: ['Financial Modeling', 'Valuation', 'Markets', 'Sales'],
    typicalPath: 'Corporate Lawyer (M&A) → Investment Banking Associate',
  },

  // Specialization
  {
    from: 'corporate-lawyer',
    to: 'general-counsel',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Natural progression to in-house counsel',
    experienceRequired: 8,
    transferableSkills: ['Corporate Law', 'Contract Negotiation', 'Risk Management', 'Business Understanding'],
    skillsToDevelop: ['Leadership', 'Board Relations', 'Strategic Thinking', 'Management'],
    typicalPath: 'Corporate Lawyer → Senior Associate → General Counsel',
  },

  // Progression
  {
    from: 'corporate-lawyer',
    to: 'private-equity',
    type: 'progression',
    strength: 6,
    confidence: 0.68,
    description: 'Lawyers sometimes move to PE as legal counsel or investors',
    experienceRequired: 5,
    transferableSkills: ['Deal Experience', 'Due Diligence', 'Contract Negotiation', 'Business Understanding'],
    skillsToDevelop: ['Investment Analysis', 'Portfolio Management', 'Value Creation'],
    typicalPath: 'Corporate Lawyer → PE Legal → PE Associate',
  },

  // Alternative
  {
    from: 'corporate-lawyer',
    to: 'judge',
    type: 'alternative',
    strength: 5,
    confidence: 0.58,
    description: 'Requires judicial service exam',
    experienceRequired: 10,
    transferableSkills: ['Legal Knowledge', 'Judgment', 'Impartiality', 'Analysis'],
    skillsToDevelop: ['Judicial Temperament', 'Court Management', 'Administrative Skills'],
    typicalPath: 'Corporate Lawyer → Judicial Services Exam → Judge (rare from corporate)',
  },
  {
    from: 'corporate-lawyer',
    to: 'chartered-accountant',
    type: 'alternative',
    strength: 5,
    confidence: 0.55,
    description: 'CA+Law combination for tax/corporate advisory',
    experienceRequired: 4,
    transferableSkills: ['Corporate Law', 'Contract', 'Compliance', 'Business Understanding'],
    skillsToDevelop: ['Accounting', 'Audit', 'Taxation', 'CA Certification'],
    typicalPath: 'Corporate Lawyer → CA Course → Chartered Accountant (rare)',
  },

  // Pivot
  {
    from: 'corporate-lawyer',
    to: 'entrepreneur',
    type: 'pivot',
    strength: 5,
    confidence: 0.62,
    description: 'Some lawyers start legal tech or service businesses',
    experienceRequired: 5,
    transferableSkills: ['Legal Expertise', 'Contract Knowledge', 'Network', 'Negotiation'],
    skillsToDevelop: ['Technology', 'Product Development', 'Sales', 'Marketing', 'Operations'],
    typicalPath: 'Corporate Lawyer → Legal Consultant → Legal Tech Founder',
  },
];

// ============================================================================
// LITIGATION LAWYER RELATIONSHIPS
// ============================================================================

const LITIGATION_LAWYER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'litigation-lawyer',
    to: 'corporate-lawyer',
    type: 'adjacent',
    strength: 7,
    confidence: 0.75,
    description: 'Some movement between litigation and corporate',
    experienceRequired: 2,
    transferableSkills: ['Legal Knowledge', 'Research', 'Drafting', 'Client Relations'],
    skillsToDevelop: ['Transactional Law', 'Contract Drafting', 'Corporate Structure', 'Deal Management'],
    typicalPath: 'Litigation Lawyer → Corporate Associate → Corporate Lawyer',
  },
  {
    from: 'litigation-lawyer',
    to: 'judge',
    type: 'adjacent',
    strength: 8,
    confidence: 0.82,
    description: 'Litigation experience valuable for judiciary',
    experienceRequired: 10,
    transferableSkills: ['Court Experience', 'Legal Knowledge', 'Judgment', 'Impartiality'],
    skillsToDevelop: ['Judicial Temperament', 'Administrative Skills', 'Court Management'],
    typicalPath: 'Litigation Lawyer → Judicial Services Exam → Judge',
  },

  // Specialization
  {
    from: 'litigation-lawyer',
    to: 'senior-advocate',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Senior advocate designation is career peak for litigators',
    experienceRequired: 15,
    transferableSkills: ['Court Craft', 'Argumentation', 'Legal Knowledge', 'Reputation'],
    skillsToDevelop: ['Senior Advocate Designation', 'Mentoring', 'Complex Cases'],
    typicalPath: 'Litigation Lawyer → Advocate → Senior Advocate (designation)',
  },

  // Progression
  {
    from: 'litigation-lawyer',
    to: 'politics',
    type: 'progression',
    strength: 6,
    confidence: 0.65,
    description: 'Many politicians have litigation backgrounds',
    experienceRequired: 10,
    transferableSkills: ['Public Speaking', 'Argumentation', 'Network', 'Legal Knowledge', 'Reputation'],
    skillsToDevelop: ['Electoral Politics', 'Party Dynamics', 'Campaigning', 'Public Policy'],
    typicalPath: 'Litigation Lawyer → Political Party → Election → Politics',
  },

  // Alternative
  {
    from: 'litigation-lawyer',
    to: 'arbitration-lawyer',
    type: 'alternative',
    strength: 8,
    confidence: 0.85,
    description: 'Arbitration is alternative dispute resolution',
    experienceRequired: 5,
    transferableSkills: ['Dispute Resolution', 'Argumentation', 'Legal Strategy', 'Negotiation'],
    skillsToDevelop: ['Arbitration Procedures', 'International Arbitration', 'Arbitral Institutions'],
    typicalPath: 'Litigation Lawyer → Arbitration Counsel → Arbitration Lawyer',
  },
  {
    from: 'litigation-lawyer',
    to: 'legal-academia',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Teaching law is common for senior litigators',
    experienceRequired: 8,
    transferableSkills: ['Legal Knowledge', 'Court Experience', 'Research', 'Mentoring'],
    skillsToDevelop: ['Academic Research', 'Teaching', 'Publishing', 'Curriculum Design'],
    typicalPath: 'Litigation Lawyer → Visiting Faculty → Law Professor',
  },

  // Pivot
  {
    from: 'litigation-lawyer',
    to: 'ias-officer',
    type: 'pivot',
    strength: 3,
    confidence: 0.42,
    description: 'Very rare transition',
    experienceRequired: 3,
    transferableSkills: ['Public Service', 'Legal Knowledge', 'Administration', 'Leadership'],
    skillsToDevelop: ['Public Administration', 'Governance', 'UPSC Preparation', 'Generalist Skills'],
    typicalPath: 'Litigation Lawyer → UPSC → IAS (very rare)',
  },
];

// ============================================================================
// JUDGE RELATIONSHIPS
// ============================================================================

const JUDGE_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'judge',
    to: 'litigation-lawyer',
    type: 'adjacent',
    strength: 6,
    confidence: 0.65,
    description: 'Post-retirement some judges return to practice (limited)',
    experienceRequired: 0,
    transferableSkills: ['Legal Knowledge', 'Judgment', 'Court Experience', 'Impartiality'],
    skillsToDevelop: ['Advocacy', 'Client Relations', 'Business Development'],
    typicalPath: 'Judge → Post-retirement → Senior Counsel (rare)',
  },

  // Specialization
  {
    from: 'judge',
    to: 'tribunal-member',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Post-retirement tribunal appointments are common',
    experienceRequired: 0,
    transferableSkills: ['Adjudication', 'Legal Knowledge', 'Administrative Skills', 'Impartiality'],
    skillsToDevelop: ['Tribunal Procedures', 'Specialized Domain Knowledge'],
    typicalPath: 'Judge → Post-retirement → Tribunal Member',
  },

  // Progression
  {
    from: 'judge',
    to: 'law-commission',
    type: 'progression',
    strength: 8,
    confidence: 0.85,
    description: 'Senior judges often join Law Commission',
    experienceRequired: 20,
    transferableSkills: ['Legal Expertise', 'Judicial Experience', 'Policy Understanding', 'Reform Ideas'],
    skillsToDevelop: ['Academic Research', 'Policy Formulation', 'Legislative Drafting'],
    typicalPath: 'Judge → High Court → Supreme Court → Law Commission',
  },
  {
    from: 'judge',
    to: 'arbitrator',
    type: 'progression',
    strength: 9,
    confidence: 0.92,
    description: 'Post-retirement arbitration is very common',
    experienceRequired: 0,
    transferableSkills: ['Adjudication', 'Impartiality', 'Legal Knowledge', 'Case Management'],
    skillsToDevelop: ['Arbitration Procedures', 'International Rules', 'Party Relations'],
    typicalPath: 'Judge → Post-retirement → Arbitrator',
  },

  // Alternative
  {
    from: 'judge',
    to: 'legal-academia',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Some judges teach post-retirement',
    experienceRequired: 0,
    transferableSkills: ['Legal Knowledge', 'Judicial Experience', 'Research', 'Mentoring'],
    skillsToDevelop: ['Academic Research', 'Teaching Methods', 'Publishing'],
    typicalPath: 'Judge → Post-retirement → Visiting Professor',
  },

  // Pivot
  {
    from: 'judge',
    to: 'politics',
    type: 'pivot',
    strength: 2,
    confidence: 0.35,
    description: 'Very rare and generally not encouraged',
    experienceRequired: 0,
    transferableSkills: ['Leadership', 'Public Service', 'Legal Knowledge'],
    skillsToDevelop: ['Electoral Politics', 'Party Dynamics', 'Campaigning'],
    typicalPath: 'Judge → Retirement → Politics (very rare)',
  },
];

// ============================================================================
// UX DESIGNER RELATIONSHIPS
// ============================================================================

const UX_DESIGNER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'ux-designer',
    to: 'product-designer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'Product design encompasses UX with broader scope',
    experienceRequired: 1,
    transferableSkills: ['User Research', 'Wireframing', 'Prototyping', 'Design Thinking', 'Figma'],
    skillsToDevelop: ['Visual Design', 'UI Design', 'Design Systems', 'End-to-end Ownership'],
    typicalPath: 'UX Designer → Product Designer',
  },
  {
    from: 'ux-designer',
    to: 'product-manager',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'UX designers often become PMs',
    experienceRequired: 3,
    transferableSkills: ['User Empathy', 'Research', 'Problem Solving', 'Cross-functional Collaboration'],
    skillsToDevelop: ['Business Strategy', 'Roadmap Planning', 'Metrics', 'Stakeholder Management'],
    typicalPath: 'UX Designer → Design Lead → Product Manager',
  },
  {
    from: 'ux-designer',
    to: 'ui-designer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'UI is a visual specialization of UX',
    experienceRequired: 1,
    transferableSkills: ['Design Tools', 'Visual Sense', 'Prototyping', 'User Understanding'],
    skillsToDevelop: ['Visual Design', 'Typography', 'Color Theory', 'Graphic Design'],
    typicalPath: 'UX Designer → UI/UX Designer → UI Designer',
  },

  // Specialization
  {
    from: 'ux-designer',
    to: 'ux-researcher',
    type: 'specialization',
    strength: 9,
    confidence: 0.90,
    description: 'Research specialization within UX',
    experienceRequired: 2,
    transferableSkills: ['User Research', 'Interviewing', 'Data Analysis', 'Synthesis'],
    skillsToDevelop: ['Advanced Research Methods', 'Quantitative Research', 'Statistical Analysis'],
    typicalPath: 'UX Designer → Senior UX Designer → UX Researcher',
  },

  // Progression
  {
    from: 'ux-designer',
    to: 'founder',
    type: 'progression',
    strength: 6,
    confidence: 0.68,
    description: 'Designers often start design agencies or product companies',
    experienceRequired: 5,
    transferableSkills: ['User Understanding', 'Product Sense', 'Design Execution', 'Problem Solving'],
    skillsToDevelop: ['Business Strategy', 'Fundraising', 'Sales', 'Marketing', 'Leadership'],
    typicalPath: 'UX Designer → Design Lead → Design Agency Founder',
  },

  // Alternative
  {
    from: 'ux-designer',
    to: 'software-engineer',
    type: 'alternative',
    strength: 4,
    confidence: 0.52,
    description: 'UX engineers bridge design and development',
    experienceRequired: 3,
    transferableSkills: ['Design Tools', 'Prototyping', 'Technical Understanding', 'System Thinking'],
    skillsToDevelop: ['Programming', 'Frontend Development', 'React/Angular', 'Git'],
    typicalPath: 'UX Designer → UX Engineer → Frontend Developer (rare)',
  },

  // Pivot
  {
    from: 'ux-designer',
    to: 'psychologist',
    type: 'pivot',
    strength: 3,
    confidence: 0.45,
    description: 'UX uses psychology but requires credentials for practice',
    experienceRequired: 5,
    transferableSkills: ['Human Behavior', 'Research Methods', 'Empathy', 'Cognitive Psychology'],
    skillsToDevelop: ['Clinical Skills', 'Psychology Degree', 'Licensing', 'Therapy Techniques'],
    typicalPath: 'UX Designer → Psychology Degree → Psychologist (very rare)',
  },
];

// ============================================================================
// PRODUCT DESIGNER RELATIONSHIPS
// ============================================================================

const PRODUCT_DESIGNER_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'product-designer',
    to: 'ux-designer',
    type: 'adjacent',
    strength: 9,
    confidence: 0.92,
    description: 'UX is core to product design',
    experienceRequired: 0,
    transferableSkills: ['User Research', 'Design Thinking', 'Prototyping', 'Figma', 'User Empathy'],
    skillsToDevelop: ['Specialized UX Methods', 'Research Focus', 'Information Architecture'],
    typicalPath: 'Product Designer → UX Designer (rare, usually other direction)',
  },
  {
    from: 'product-designer',
    to: 'product-manager',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Product designers often become PMs',
    experienceRequired: 3,
    transferableSkills: ['Product Thinking', 'User Understanding', 'Cross-functional Collaboration', 'Execution'],
    skillsToDevelop: ['Business Strategy', 'Roadmap Planning', 'Metrics', 'Stakeholder Management'],
    typicalPath: 'Product Designer → Design Lead → Product Manager',
  },
  {
    from: 'product-designer',
    to: 'ui-designer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'UI is part of product design',
    experienceRequired: 0,
    transferableSkills: ['Visual Design', 'Design Tools', 'Component Libraries', 'Aesthetics'],
    skillsToDevelop: ['Pure Visual Focus', 'Graphic Design', 'Brand Design'],
    typicalPath: 'Product Designer → UI Designer (specialization)',
  },

  // Specialization
  {
    from: 'product-designer',
    to: 'design-lead',
    type: 'specialization',
    strength: 8,
    confidence: 0.85,
    description: 'Leadership track for designers',
    experienceRequired: 5,
    transferableSkills: ['Design Expertise', 'Mentoring', 'Cross-functional Work', 'Systems Thinking'],
    skillsToDevelop: ['Team Management', 'Design Operations', 'Strategy', 'Leadership'],
    typicalPath: 'Product Designer → Senior Designer → Design Lead',
  },

  // Progression
  {
    from: 'product-designer',
    to: 'founder',
    type: 'progression',
    strength: 7,
    confidence: 0.75,
    description: 'Designers often start agencies or product companies',
    experienceRequired: 5,
    transferableSkills: ['Product Sense', 'Design Execution', 'User Understanding', 'Problem Solving'],
    skillsToDevelop: ['Business Strategy', 'Fundraising', 'Sales', 'Marketing', 'Leadership'],
    typicalPath: 'Product Designer → Design Lead → Design Agency Founder',
  },
  {
    from: 'product-designer',
    to: 'design-director',
    type: 'progression',
    strength: 8,
    confidence: 0.85,
    description: 'Executive design track',
    experienceRequired: 8,
    transferableSkills: ['Design Excellence', 'Leadership', 'Strategy', 'Cross-functional Influence'],
    skillsToDevelop: ['Executive Communication', 'Design Strategy', 'Org Building', 'Business Acumen'],
    typicalPath: 'Product Designer → Design Lead → Design Director → VP Design',
  },

  // Alternative
  {
    from: 'product-designer',
    to: 'entrepreneur',
    type: 'alternative',
    strength: 7,
    confidence: 0.75,
    description: 'Designers often start businesses',
    experienceRequired: 4,
    transferableSkills: ['Product Sense', 'User Understanding', 'Execution', 'Problem Solving'],
    skillsToDevelop: ['Business Model', 'Fundraising', 'Operations', 'Sales', 'Marketing'],
    typicalPath: 'Product Designer → Design Consultant → Entrepreneur',
  },

  // Pivot
  {
    from: 'product-designer',
    to: 'software-engineer',
    type: 'pivot',
    strength: 4,
    confidence: 0.52,
    description: 'UX engineers bridge design and code',
    experienceRequired: 3,
    transferableSkills: ['Design Tools', 'System Thinking', 'Technical Understanding', 'Prototyping'],
    skillsToDevelop: ['Programming', 'Development', 'System Architecture', 'Backend'],
    typicalPath: 'Product Designer → Design Engineer → Software Engineer (rare)',
  },
];

// ============================================================================
// RESEARCH SCIENTIST RELATIONSHIPS
// ============================================================================

const RESEARCH_SCIENTIST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'research-scientist',
    to: 'ai-engineer',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'AI research to engineering is common',
    experienceRequired: 1,
    transferableSkills: ['Deep Learning', 'Research', 'Experimentation', 'Python', 'TensorFlow/PyTorch'],
    skillsToDevelop: ['Production Systems', 'Scalability', 'MLOps', 'Engineering Practices'],
    typicalPath: 'Research Scientist → Research Engineer → AI Engineer',
  },
  {
    from: 'research-scientist',
    to: 'data-scientist',
    type: 'adjacent',
    strength: 7,
    confidence: 0.78,
    description: 'Research skills apply to data science',
    experienceRequired: 1,
    transferableSkills: ['Statistics', 'Research Methods', 'Python/R', 'Experimentation'],
    skillsToDevelop: ['Business Acumen', 'Applied Analytics', 'Production Systems'],
    typicalPath: 'Research Scientist → Applied Scientist → Data Scientist',
  },
  {
    from: 'research-scientist',
    to: 'professor',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'Academic research to professorship is natural',
    experienceRequired: 3,
    transferableSkills: ['Research', 'Publishing', 'Teaching', 'Grant Writing', 'Mentoring'],
    skillsToDevelop: ['Curriculum Design', 'Department Service', 'Academic Administration'],
    typicalPath: 'Research Scientist → Postdoc → Assistant Professor → Professor',
  },

  // Specialization
  {
    from: 'research-scientist',
    to: 'biotechnologist',
    type: 'specialization',
    strength: 6,
    confidence: 0.68,
    description: 'Biotech research specialization',
    experienceRequired: 2,
    transferableSkills: ['Research Methods', 'Lab Skills', 'Data Analysis', 'Scientific Writing'],
    skillsToDevelop: ['Biology', 'Genomics', 'Bioinformatics', 'Biotech Industry'],
    typicalPath: 'Research Scientist (Biology) → Biotechnologist',
  },

  // Progression
  {
    from: 'research-scientist',
    to: 'founder',
    type: 'progression',
    strength: 5,
    confidence: 0.58,
    description: 'Some researchers commercialize their work',
    experienceRequired: 5,
    transferableSkills: ['Technical Depth', 'Innovation', 'Problem Solving', 'Intellectual Property'],
    skillsToDevelop: ['Business Strategy', 'Fundraising', 'Product Development', 'Sales', 'Leadership'],
    typicalPath: 'Research Scientist → Tech Transfer → Deep Tech Founder',
  },

  // Alternative
  {
    from: 'research-scientist',
    to: 'industry-rd',
    type: 'alternative',
    strength: 8,
    confidence: 0.85,
    description: 'Industry R&D is applied research',
    experienceRequired: 2,
    transferableSkills: ['Research', 'Problem Solving', 'Technical Depth', 'Innovation'],
    skillsToDevelop: ['Product Focus', 'Business Constraints', 'Timeline Pressure', 'Cross-functional'],
    typicalPath: 'Research Scientist → Industry Researcher → R&D Lead',
  },

  // Pivot
  {
    from: 'research-scientist',
    to: 'software-engineer',
    type: 'pivot',
    strength: 4,
    confidence: 0.52,
    description: 'Research engineering is different from software engineering',
    experienceRequired: 2,
    transferableSkills: ['Programming', 'System Design', 'Problem Solving'],
    skillsToDevelop: ['Production Code', 'Software Architecture', 'DevOps', 'Product Engineering'],
    typicalPath: 'Research Scientist → Research Engineer → Software Engineer (rare)',
  },
];

// ============================================================================
// BIOTECHNOLOGIST RELATIONSHIPS
// ============================================================================

const BIOTECHNOLOGIST_RELATIONSHIPS: CareerRelationshipV1[] = [
  // Adjacent
  {
    from: 'biotechnologist',
    to: 'research-scientist',
    type: 'adjacent',
    strength: 8,
    confidence: 0.85,
    description: 'Biotech to academic research is common',
    experienceRequired: 2,
    transferableSkills: ['Lab Skills', 'Research Methods', 'Biology', 'Data Analysis', 'Publishing'],
    skillsToDevelop: ['Academic Focus', 'Grant Writing', 'Teaching', 'Theoretical Depth'],
    typicalPath: 'Biotechnologist → Research Associate → Research Scientist',
  },
  {
    from: 'biotechnologist',
    to: 'pharma-rd',
    type: 'adjacent',
    strength: 9,
    confidence: 0.90,
    description: 'Pharma R&D is core biotech industry',
    experienceRequired: 1,
    transferableSkills: ['Lab Skills', 'Drug Development', 'Research', 'GMP', 'Regulatory'],
    skillsToDevelop: ['Clinical Trials', 'Regulatory Affairs', 'Drug Discovery', 'Industry Practices'],
    typicalPath: 'Biotechnologist → Pharma Researcher → R&D Scientist',
  },

  // Specialization
  {
    from: 'biotechnologist',
    to: 'bioinformatician',
    type: 'specialization',
    strength: 7,
    confidence: 0.78,
    description: 'Computational biology specialization',
    experienceRequired: 2,
    transferableSkills: ['Biology', 'Data Analysis', 'Research', 'Genomics'],
    skillsToDevelop: ['Programming', 'Python/R', 'Bioinformatics Tools', 'Data Science', 'Statistics'],
    typicalPath: 'Biotechnologist → Bioinformatics Course → Bioinformatician',
  },

  // Progression
  {
    from: 'biotechnologist',
    to: 'biotech-founder',
    type: 'progression',
    strength: 5,
    confidence: 0.60,
    description: 'Some biotechnologists start biotech companies',
    experienceRequired: 8,
    transferableSkills: ['Technical Expertise', 'Industry Knowledge', 'Research', 'Innovation'],
    skillsToDevelop: ['Business Strategy', 'Fundraising', 'Regulatory', 'Clinical Development', 'Leadership'],
    typicalPath: 'Biotechnologist → Senior Scientist → Biotech Founder',
  },

  // Alternative
  {
    from: 'biotechnologist',
    to: 'clinical-research-associate',
    type: 'alternative',
    strength: 7,
    confidence: 0.75,
    description: 'Clinical research is adjacent to biotech',
    experienceRequired: 2,
    transferableSkills: ['Research', 'Regulatory', 'Documentation', 'Scientific Method'],
    skillsToDevelop: ['Clinical Trials', 'Patient Management', 'Site Coordination', 'GCP'],
    typicalPath: 'Biotechnologist → CRA → Clinical Research Manager',
  },
  {
    from: 'biotechnologist',
    to: 'regulatory-affairs',
    type: 'alternative',
    strength: 6,
    confidence: 0.68,
    description: 'Regulatory affairs for biotech products',
    experienceRequired: 3,
    transferableSkills: ['Regulatory Knowledge', 'Documentation', 'Scientific Understanding', 'Compliance'],
    skillsToDevelop: ['Regulatory Strategy', 'Submissions', 'FDA/EMA', 'Quality Assurance'],
    typicalPath: 'Biotechnologist → Regulatory Associate → Regulatory Affairs Manager',
  },

  // Pivot
  {
    from: 'biotechnologist',
    to: 'data-scientist',
    type: 'pivot',
    strength: 4,
    confidence: 0.52,
    description: 'Bioinformatics can lead to data science',
    experienceRequired: 3,
    transferableSkills: ['Data Analysis', 'Statistics', 'Programming', 'Research'],
    skillsToDevelop: ['Machine Learning', 'Business Acumen', 'Production Systems', 'Big Data'],
    typicalPath: 'Biotechnologist → Bioinformatician → Data Scientist (rare)',
  },
];

// ============================================================================
// ALL RELATIONSHIPS
// ============================================================================

export const ALL_CAREER_RELATIONSHIPS: CareerRelationshipV1[] = [
  ...SOFTWARE_ENGINEER_RELATIONSHIPS,
  ...AI_ENGINEER_RELATIONSHIPS,
  ...DATA_SCIENTIST_RELATIONSHIPS,
  ...PRODUCT_MANAGER_RELATIONSHIPS,
  ...CYBERSECURITY_ENGINEER_RELATIONSHIPS,
  ...MANAGEMENT_CONSULTANT_RELATIONSHIPS,
  ...BUSINESS_ANALYST_RELATIONSHIPS,
  ...OPERATIONS_MANAGER_RELATIONSHIPS,
  ...ENTREPRENEUR_RELATIONSHIPS,
  ...INVESTMENT_BANKER_RELATIONSHIPS,
  ...FINANCIAL_ANALYST_RELATIONSHIPS,
  ...CHARTERED_ACCOUNTANT_RELATIONSHIPS,
  ...CFA_PROFESSIONAL_RELATIONSHIPS,
  ...IAS_OFFICER_RELATIONSHIPS,
  ...IPS_OFFICER_RELATIONSHIPS,
  ...IRS_OFFICER_RELATIONSHIPS,
  ...DOCTOR_RELATIONSHIPS,
  ...SURGEON_RELATIONSHIPS,
  ...PSYCHOLOGIST_RELATIONSHIPS,
  ...CORPORATE_LAWYER_RELATIONSHIPS,
  ...LITIGATION_LAWYER_RELATIONSHIPS,
  ...JUDGE_RELATIONSHIPS,
  ...UX_DESIGNER_RELATIONSHIPS,
  ...PRODUCT_DESIGNER_RELATIONSHIPS,
  ...RESEARCH_SCIENTIST_RELATIONSHIPS,
  ...BIOTECHNOLOGIST_RELATIONSHIPS,
];

// ============================================================================
// RELATIONSHIP STATISTICS
// ============================================================================

export function getCareerRelationshipStats(): {
  totalRelationships: number;
  byType: Record<string, number>;
  byStrength: Record<string, number>;
  averageStrength: number;
  averageConfidence: number;
} {
  const byType: Record<string, number> = {};
  const byStrength: Record<string, number> = {};

  let totalStrength = 0;
  let totalConfidence = 0;

  for (const rel of ALL_CAREER_RELATIONSHIPS) {
    byType[rel.type] = (byType[rel.type] || 0) + 1;

    const strengthRange = rel.strength >= 9 ? '9-10' : rel.strength >= 7 ? '7-8' : rel.strength >= 5 ? '5-6' : '1-4';
    byStrength[strengthRange] = (byStrength[strengthRange] || 0) + 1;

    totalStrength += rel.strength;
    totalConfidence += rel.confidence;
  }

  return {
    totalRelationships: ALL_CAREER_RELATIONSHIPS.length,
    byType,
    byStrength,
    averageStrength: totalStrength / ALL_CAREER_RELATIONSHIPS.length,
    averageConfidence: totalConfidence / ALL_CAREER_RELATIONSHIPS.length,
  };
}

// ============================================================================
// RELATIONSHIP QUERIES
// ============================================================================

export function getRelationshipsForCareer(
  careerSlug: string,
  type?: 'adjacent' | 'specialization' | 'progression' | 'alternative' | 'pivot'
): CareerRelationshipV1[] {
  let relationships = ALL_CAREER_RELATIONSHIPS.filter(
    r => r.from === careerSlug || r.to === careerSlug
  );

  if (type) {
    relationships = relationships.filter(r => r.type === type);
  }

  return relationships.sort((a, b) => b.strength - a.strength);
}

export function getOutgoingRelationships(
  careerSlug: string,
  type?: 'adjacent' | 'specialization' | 'progression' | 'alternative' | 'pivot'
): CareerRelationshipV1[] {
  let relationships = ALL_CAREER_RELATIONSHIPS.filter(r => r.from === careerSlug);

  if (type) {
    relationships = relationships.filter(r => r.type === type);
  }

  return relationships.sort((a, b) => b.strength - a.strength);
}

export function getIncomingRelationships(
  careerSlug: string,
  type?: 'adjacent' | 'specialization' | 'progression' | 'alternative' | 'pivot'
): CareerRelationshipV1[] {
  let relationships = ALL_CAREER_RELATIONSHIPS.filter(r => r.to === careerSlug);

  if (type) {
    relationships = relationships.filter(r => r.type === type);
  }

  return relationships.sort((a, b) => b.strength - a.strength);
}

export function getRelationshipsByType(
  type: 'adjacent' | 'specialization' | 'progression' | 'alternative' | 'pivot'
): CareerRelationshipV1[] {
  return ALL_CAREER_RELATIONSHIPS
    .filter(r => r.type === type)
    .sort((a, b) => b.strength - a.strength);
}

export function getStrongRelationships(minStrength: number = 8): CareerRelationshipV1[] {
  return ALL_CAREER_RELATIONSHIPS
    .filter(r => r.strength >= minStrength)
    .sort((a, b) => b.strength - a.strength);
}

// ============================================================================
// NETWORK ANALYSIS
// ============================================================================

export function getCareerNetworkMetrics(): {
  mostConnectedCareers: { slug: string; connectionCount: number }[];
  strongestRelationships: CareerRelationshipV1[];
  relationshipTypeDistribution: Record<string, number>;
  averageConnectionsPerCareer: number;
} {
  const connectionCounts = new Map<string, number>();

  for (const rel of ALL_CAREER_RELATIONSHIPS) {
    connectionCounts.set(rel.from, (connectionCounts.get(rel.from) || 0) + 1);
    connectionCounts.set(rel.to, (connectionCounts.get(rel.to) || 0) + 1);
  }

  const mostConnectedCareers = Array.from(connectionCounts.entries())
    .map(([slug, count]) => ({ slug, connectionCount: count }))
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, 10);

  const strongestRelationships = [...ALL_CAREER_RELATIONSHIPS]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 10);

  const relationshipTypeDistribution: Record<string, number> = {};
  for (const rel of ALL_CAREER_RELATIONSHIPS) {
    relationshipTypeDistribution[rel.type] = (relationshipTypeDistribution[rel.type] || 0) + 1;
  }

  const totalConnections = Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0);
  const uniqueCareers = connectionCounts.size;

  return {
    mostConnectedCareers,
    strongestRelationships,
    relationshipTypeDistribution,
    averageConnectionsPerCareer: totalConnections / uniqueCareers,
  };
}

// ============================================================================
// EXPORT FOR KNOWLEDGE GRAPH
// ============================================================================

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: string;
  strength: number;
  confidence: number;
  metadata: {
    description: string;
    experienceRequired: number;
    transferableSkills: string[];
    skillsToDevelop: string[];
    typicalPath: string;
  };
}

export function exportForKnowledgeGraph(): KnowledgeGraphEdge[] {
  return ALL_CAREER_RELATIONSHIPS.map(rel => ({
    source: rel.from,
    target: rel.to,
    relationship: rel.type,
    strength: rel.strength,
    confidence: rel.confidence,
    metadata: {
      description: rel.description,
      experienceRequired: rel.experienceRequired,
      transferableSkills: rel.transferableSkills,
      skillsToDevelop: rel.skillsToDevelop,
      typicalPath: rel.typicalPath,
    },
  }));
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  relationships: ALL_CAREER_RELATIONSHIPS,
  stats: getCareerRelationshipStats(),
  metrics: getCareerNetworkMetrics(),
  forKnowledgeGraph: exportForKnowledgeGraph(),
};
