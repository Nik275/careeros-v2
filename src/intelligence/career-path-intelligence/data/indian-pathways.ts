/**
 * India-Specific Career Pathways Data
 * 
 * Comprehensive pathway definitions for Indian career routes including:
 * - JEE → Engineering (IIT, NIT, State, Private)
 * - NEET → Medical (MBBS, BDS, BAMS, BHMS)
 * - UPSC → Civil Services (IAS, IPS, IFS, IRS)
 * - CA/CS/CMA → Professional Courses
 * - Banking/SSC → Government Jobs
 * - State PSC → State Government Jobs
 * - Family Business Integration
 * - Startup/Entrepreneurial Paths
 * 
 * @module intelligence/career-path-intelligence
 */

import {
  PathTemplate,
  PathType,
  PathDifficulty,
  PathRisk,
  MilestoneTemplate,
} from '../types';

// =============================================================================
// JEE PATHWAYS
// =============================================================================

export const IITPathway: PathTemplate = {
  name: 'IIT Route',
  type: PathType.DIRECT,
  milestones: [
    {
      name: 'JEE Main Qualification',
      description: 'Qualify for JEE Advanced through JEE Main',
      duration: 12,
      skills: ['Physics', 'Chemistry', 'Mathematics', 'Problem Solving', 'Time Management'],
      credentials: ['JEE Main Qualifying Rank'],
    },
    {
      name: 'JEE Advanced',
      description: 'Crack JEE Advanced for IIT admission',
      duration: 2,
      skills: ['Advanced Problem Solving', 'Exam Strategy', 'Stress Management'],
      credentials: ['JEE Advanced Rank'],
    },
    {
      name: 'IIT Admission',
      description: 'Secure admission to IIT based on rank',
      duration: 1,
      skills: ['Counseling Navigation', 'Branch Selection'],
      credentials: ['IIT Admission'],
    },
    {
      name: 'B.Tech at IIT',
      description: 'Complete 4-year engineering degree',
      duration: 48,
      skills: ['Engineering Fundamentals', 'Technical Skills', 'Project Management', 'Teamwork'],
      credentials: ['B.Tech Degree'],
    },
    {
      name: 'Placement/ Higher Studies',
      description: 'Campus placement or GATE/MS preparation',
      duration: 6,
      skills: ['Interview Skills', 'Technical Depth', 'Communication'],
      credentials: ['Job Offer / GATE Rank'],
    },
  ],
  difficulty: PathDifficulty.EXTREME,
  risk: PathRisk.VERY_HIGH,
  costMultiplier: 1.2,
  durationMultiplier: 1.0,
};

export const NITPathway: PathTemplate = {
  name: 'NIT Route',
  type: PathType.DIRECT,
  milestones: [
    {
      name: 'JEE Main Preparation',
      description: 'Prepare for JEE Main for NIT admission',
      duration: 12,
      skills: ['Physics', 'Chemistry', 'Mathematics'],
      credentials: ['JEE Main Rank'],
    },
    {
      name: 'NIT Admission',
      description: 'Secure admission to NIT through JOSAA counseling',
      duration: 2,
      skills: ['Counseling', 'Branch Selection'],
      credentials: ['NIT Admission'],
    },
    {
      name: 'B.Tech at NIT',
      description: 'Complete engineering degree at NIT',
      duration: 48,
      skills: ['Engineering', 'Technical Skills'],
      credentials: ['B.Tech Degree'],
    },
    {
      name: 'Placement',
      description: 'Campus recruitment',
      duration: 6,
      skills: ['Placement Preparation'],
      credentials: ['Job Offer'],
    },
  ],
  difficulty: PathDifficulty.VERY_HARD,
  risk: PathRisk.HIGH,
  costMultiplier: 1.0,
  durationMultiplier: 1.0,
};

export const StateEngineeringPathway: PathTemplate = {
  name: 'State Engineering College',
  type: PathType.INDIRECT,
  milestones: [
    {
      name: 'State CET Preparation',
      description: 'Prepare for state-level engineering entrance',
      duration: 6,
      skills: ['PCM Fundamentals'],
      credentials: ['State CET Rank'],
    },
    {
      name: 'State College Admission',
      description: 'Secure admission in state government college',
      duration: 2,
      skills: ['Counseling'],
      credentials: ['State College Admission'],
    },
    {
      name: 'B.Tech at State College',
      description: 'Complete engineering degree',
      duration: 48,
      skills: ['Engineering Skills'],
      credentials: ['B.Tech Degree'],
    },
    {
      name: 'Off-Campus Placement',
      description: 'Find job through off-campus or higher studies',
      duration: 12,
      skills: ['Self-Placement', ' GATE Preparation'],
      credentials: ['Job Offer / GATE Rank'],
    },
  ],
  difficulty: PathDifficulty.MODERATE,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.6,
  durationMultiplier: 1.0,
};

// =============================================================================
// MEDICAL PATHWAYS
// =============================================================================

export const MBBSGovernmentPathway: PathTemplate = {
  name: 'MBBS Government College',
  type: PathType.DIRECT,
  milestones: [
    {
      name: 'NEET Preparation',
      description: 'Intensive preparation for NEET UG',
      duration: 12,
      skills: ['Biology', 'Physics', 'Chemistry', 'Memory Skills', 'Analytical Thinking'],
      credentials: ['NEET Qualification'],
    },
    {
      name: 'NEET Examination',
      description: 'Clear NEET with top rank for government seat',
      duration: 1,
      skills: ['Exam Strategy', 'Time Management'],
      credentials: ['NEET Rank < 10000'],
    },
    {
      name: 'Government MBBS Admission',
      description: 'Secure government medical college seat',
      duration: 3,
      skills: ['Counseling Navigation'],
      credentials: ['MBBS Seat'],
    },
    {
      name: 'MBBS Degree',
      description: 'Complete 5.5 year medical degree',
      duration: 66,
      skills: ['Medical Knowledge', 'Clinical Skills', 'Patient Care', 'Diagnosis'],
      credentials: ['MBBS Degree'],
    },
    {
      name: 'Internship',
      description: '1-year compulsory rotating internship',
      duration: 12,
      skills: ['Clinical Practice', 'Emergency Care'],
      credentials: ['Internship Completion'],
    },
    {
      name: 'NEET PG / Practice',
      description: 'Specialize or start practice',
      duration: 12,
      skills: ['Specialization Knowledge'],
      credentials: ['MD/MS Seat or Medical License'],
    },
  ],
  difficulty: PathDifficulty.EXTREME,
  risk: PathRisk.VERY_HIGH,
  costMultiplier: 0.3,
  durationMultiplier: 1.5,
};

export const MBBSPrivatePathway: PathTemplate = {
  name: 'MBBS Private College',
  type: PathType.DIRECT,
  milestones: [
    {
      name: 'NEET Qualification',
      description: 'Qualify NEET for private college admission',
      duration: 12,
      skills: ['Biology', 'Physics', 'Chemistry'],
      credentials: ['NEET Qualifying Marks'],
    },
    {
      name: 'Private MBBS Admission',
      description: 'Secure seat in private/deemed university',
      duration: 3,
      skills: ['Financial Planning', 'College Selection'],
      credentials: ['MBBS Seat'],
    },
    {
      name: 'MBBS Degree',
      description: 'Complete medical degree',
      duration: 66,
      skills: ['Medical Knowledge', 'Clinical Skills'],
      credentials: ['MBBS Degree'],
    },
    {
      name: 'Internship and Beyond',
      description: 'Complete internship and plan next steps',
      duration: 24,
      skills: ['Clinical Practice'],
      credentials: ['Medical License'],
    },
  ],
  difficulty: PathDifficulty.HARD,
  risk: PathRisk.HIGH,
  costMultiplier: 3.0,
  durationMultiplier: 1.5,
};

export const BDSPathway: PathTemplate = {
  name: 'BDS Route',
  type: PathType.INDIRECT,
  milestones: [
    {
      name: 'NEET Preparation',
      description: 'Prepare for NEET for dental admission',
      duration: 12,
      skills: ['Biology', 'Physics', 'Chemistry'],
      credentials: ['NEET Qualification'],
    },
    {
      name: 'BDS Admission',
      description: 'Secure dental college seat',
      duration: 3,
      skills: ['College Selection'],
      credentials: ['BDS Seat'],
    },
    {
      name: 'BDS Degree',
      description: 'Complete 5-year dental degree',
      duration: 60,
      skills: ['Dental Science', 'Clinical Dentistry'],
      credentials: ['BDS Degree'],
    },
    {
      name: 'Internship and MDS/Practice',
      description: 'Complete internship, pursue MDS or practice',
      duration: 18,
      skills: ['Dental Practice'],
      credentials: ['Dental License / MDS'],
    },
  ],
  difficulty: PathDifficulty.HARD,
  risk: PathRisk.MODERATE,
  costMultiplier: 1.5,
  durationMultiplier: 1.3,
};

// =============================================================================
// CIVIL SERVICES PATHWAYS
// =============================================================================

export const UPSCPathway: PathTemplate = {
  name: 'UPSC Civil Services',
  type: PathType.ACADEMIC,
  milestones: [
    {
      name: 'Foundation Preparation',
      description: 'Build base through NCERTs and current affairs',
      duration: 12,
      skills: ['General Knowledge', 'Current Affairs', 'Reading Comprehension', 'Writing'],
      credentials: [],
    },
    {
      name: 'Prelims Preparation',
      description: 'Intensive preparation for Preliminary examination',
      duration: 12,
      skills: ['GS Paper I', 'CSAT', 'Elimination Techniques'],
      credentials: [],
    },
    {
      name: 'UPSC Prelims',
      description: 'Clear preliminary examination',
      duration: 1,
      skills: ['Exam Temperament'],
      credentials: ['Prelims Qualification'],
    },
    {
      name: 'Mains Preparation',
      description: 'Prepare 4 GS papers, Essay, and 2 Optional papers',
      duration: 6,
      skills: ['Answer Writing', 'Essay Writing', 'Optional Subject Mastery'],
      credentials: [],
    },
    {
      name: 'UPSC Mains',
      description: 'Clear main written examination',
      duration: 1,
      skills: ['Writing Under Pressure'],
      credentials: ['Mains Qualification'],
    },
    {
      name: 'Interview Preparation',
      description: 'Prepare for Personality Test',
      duration: 2,
      skills: ['Communication', 'Current Affairs', 'Decision Making'],
      credentials: [],
    },
    {
      name: 'UPSC Interview',
      description: 'Clear final interview round',
      duration: 1,
      skills: ['Interview Skills'],
      credentials: ['Final Selection'],
    },
    {
      name: 'Training at LBSNAA',
      description: 'Foundation training at Mussoorie',
      duration: 15,
      skills: ['Administration', 'Leadership', 'Policy'],
      credentials: ['IAS/IPS/IFS/IRS'],
    },
  ],
  difficulty: PathDifficulty.EXTREME,
  risk: PathRisk.VERY_HIGH,
  costMultiplier: 0.8,
  durationMultiplier: 2.0,
};

export const StatePSCPathway: PathTemplate = {
  name: 'State Civil Services',
  type: PathType.GOVERNMENT,
  milestones: [
    {
      name: 'State PSC Preparation',
      description: 'Prepare for state-specific examination',
      duration: 12,
      skills: ['State History', 'Geography', 'Current Affairs', 'State Language'],
      credentials: [],
    },
    {
      name: 'Preliminary Exam',
      description: 'Clear state PSC prelims',
      duration: 1,
      skills: ['Objective Test Skills'],
      credentials: ['Prelims Clear'],
    },
    {
      name: 'Mains Examination',
      description: 'Clear main written exam',
      duration: 3,
      skills: ['Descriptive Writing', 'State-specific Knowledge'],
      credentials: ['Mains Clear'],
    },
    {
      name: 'Interview and Selection',
      description: 'Clear interview and get selected',
      duration: 3,
      skills: ['Interview Skills'],
      credentials: ['State Service Selection'],
    },
    {
      name: 'Training',
      description: 'Complete state administrative training',
      duration: 12,
      skills: ['Administration', 'State Governance'],
      credentials: ['SDM / State Officer'],
    },
  ],
  difficulty: PathDifficulty.VERY_HARD,
  risk: PathRisk.HIGH,
  costMultiplier: 0.5,
  durationMultiplier: 1.5,
};

// =============================================================================
// PROFESSIONAL COURSES PATHWAYS
// =============================================================================

export const CAPathway: PathTemplate = {
  name: 'Chartered Accountancy',
  type: PathType.ACADEMIC,
  milestones: [
    {
      name: 'CA Foundation',
      description: 'Clear CA Foundation after 12th',
      duration: 6,
      skills: ['Accounting', 'Law', 'Maths', 'Economics'],
      credentials: ['CA Foundation Clear'],
    },
    {
      name: 'CA Intermediate Group I',
      description: 'Clear first group of Intermediate',
      duration: 8,
      skills: ['Accounting', 'Corporate Law', 'Cost Accounting', 'Taxation'],
      credentials: ['CA Inter Group I'],
    },
    {
      name: 'CA Intermediate Group II',
      description: 'Clear second group of Intermediate',
      duration: 8,
      skills: ['Advanced Accounting', 'Auditing', 'IT', 'SM'],
      credentials: ['CA Intermediate Complete'],
    },
    {
      name: 'Articleship',
      description: '3-year practical training under practicing CA',
      duration: 36,
      skills: ['Audit', 'Taxation', 'Accounting', 'Client Management'],
      credentials: ['Articleship Registration'],
    },
    {
      name: 'CA Final Group I',
      description: 'Clear first group of Final',
      duration: 8,
      skills: ['Financial Reporting', 'Strategic Financial Management'],
      credentials: ['CA Final Group I'],
    },
    {
      name: 'CA Final Group II',
      description: 'Clear second group of Final',
      duration: 8,
      skills: ['Advanced Auditing', 'Law', 'Direct Tax', 'Indirect Tax'],
      credentials: ['CA Final Complete'],
    },
    {
      name: 'Membership',
      description: 'Become member of ICAI',
      duration: 3,
      skills: ['Professional Practice'],
      credentials: ['Chartered Accountant'],
    },
  ],
  difficulty: PathDifficulty.EXTREME,
  risk: PathRisk.HIGH,
  costMultiplier: 0.4,
  durationMultiplier: 2.0,
};

export const CSPathway: PathTemplate = {
  name: 'Company Secretary',
  type: PathType.ACADEMIC,
  milestones: [
    {
      name: 'CSEET',
      description: 'Company Secretary Executive Entrance Test',
      duration: 4,
      skills: ['Business Communication', 'Legal Aptitude', 'Economics'],
      credentials: ['CSEET Clear'],
    },
    {
      name: 'CS Executive',
      description: 'Complete CS Executive program',
      duration: 12,
      skills: ['Company Law', 'Securities Law', 'Corporate Governance'],
      credentials: ['CS Executive'],
    },
    {
      name: 'SIP and Training',
      description: 'Student Induction Program and training',
      duration: 12,
      skills: ['Corporate Secretarial Practice'],
      credentials: [],
    },
    {
      name: 'CS Professional',
      description: 'Complete CS Professional program',
      duration: 12,
      skills: ['Advanced Corporate Law', 'Banking Law', 'Capital Markets'],
      credentials: ['CS Professional'],
    },
    {
      name: 'Membership',
      description: 'Associate Member of ICSI',
      duration: 3,
      skills: ['Corporate Compliance'],
      credentials: ['Company Secretary'],
    },
  ],
  difficulty: PathDifficulty.VERY_HARD,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.3,
  durationMultiplier: 1.5,
};

// =============================================================================
// GOVERNMENT JOB PATHWAYS
// =============================================================================

export const BankingPathway: PathTemplate = {
  name: 'Banking (PO/Clerk)',
  type: PathType.GOVERNMENT,
  milestones: [
    {
      name: 'Banking Exam Preparation',
      description: 'Prepare for IBPS/SBI examinations',
      duration: 6,
      skills: ['Quantitative Aptitude', 'Reasoning', 'English', 'Banking Awareness'],
      credentials: [],
    },
    {
      name: 'Preliminary Exam',
      description: 'Clear Prelims (Phase I)',
      duration: 1,
      skills: ['Speed Math', 'Logical Reasoning'],
      credentials: ['Prelims Clear'],
    },
    {
      name: 'Mains Examination',
      description: 'Clear Mains (Phase II)',
      duration: 1,
      skills: ['Data Interpretation', 'General Awareness', 'Banking Knowledge'],
      credentials: ['Mains Clear'],
    },
    {
      name: 'Interview',
      description: 'Clear interview round',
      duration: 1,
      skills: ['Communication', 'Banking Knowledge'],
      credentials: ['Interview Clear'],
    },
    {
      name: 'Probation',
      description: '2-year probation period as PO',
      duration: 24,
      skills: ['Banking Operations', 'Credit', 'Customer Service'],
      credentials: ['Probation Complete'],
    },
  ],
  difficulty: PathDifficulty.HARD,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.2,
  durationMultiplier: 1.0,
};

export const SSCPathway: PathTemplate = {
  name: 'SSC CGL',
  type: PathType.GOVERNMENT,
  milestones: [
    {
      name: 'SSC CGL Preparation',
      description: 'Prepare for SSC Combined Graduate Level',
      duration: 8,
      skills: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
      credentials: [],
    },
    {
      name: 'Tier I Examination',
      description: 'Clear computer-based preliminary exam',
      duration: 1,
      skills: ['Speed', 'Accuracy'],
      credentials: ['Tier I Clear'],
    },
    {
      name: 'Tier II Examination',
      description: 'Clear main examination',
      duration: 1,
      skills: ['Advanced Quant', 'English Comprehension'],
      credentials: ['Tier II Clear'],
    },
    {
      name: 'Tier III & IV',
      description: 'Descriptive paper and skill test',
      duration: 2,
      skills: ['Writing', 'Computer Skills'],
      credentials: ['Final Selection'],
    },
    {
      name: 'Posting',
      description: 'Join as Assistant/Inspector in central government',
      duration: 1,
      skills: ['Administrative Work'],
      credentials: ['Government Post'],
    },
  ],
  difficulty: PathDifficulty.HARD,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.1,
  durationMultiplier: 1.0,
};

export const RailwaysPathway: PathTemplate = {
  name: 'Indian Railways',
  type: PathType.GOVERNMENT,
  milestones: [
    {
      name: 'RRB Preparation',
      description: 'Prepare for Railway Recruitment Board exams',
      duration: 6,
      skills: ['Mathematics', 'General Intelligence', 'General Science', 'General Awareness'],
      credentials: [],
    },
    {
      name: 'CBT Stage 1',
      description: 'Clear first computer-based test',
      duration: 1,
      skills: ['Basic Skills'],
      credentials: ['Stage 1 Clear'],
    },
    {
      name: 'CBT Stage 2',
      description: 'Clear second computer-based test',
      duration: 1,
      skills: ['Technical Knowledge'],
      credentials: ['Stage 2 Clear'],
    },
    {
      name: 'Skill Test/Interview',
      description: 'Complete technical skill test or interview',
      duration: 1,
      skills: ['Technical Skills'],
      credentials: ['Selection'],
    },
    {
      name: 'Training',
      description: 'Complete railway training',
      duration: 6,
      skills: ['Railway Operations'],
      credentials: ['Railway Job'],
    },
  ],
  difficulty: PathDifficulty.MODERATE,
  risk: PathRisk.LOW,
  costMultiplier: 0.1,
  durationMultiplier: 0.8,
};

// =============================================================================
// ALTERNATIVE PATHWAYS
// =============================================================================

export const DiplomaEngineeringPathway: PathTemplate = {
  name: 'Diploma + Lateral Entry',
  type: PathType.INDIRECT,
  milestones: [
    {
      name: 'Polytechnic Diploma',
      description: 'Complete 3-year diploma after 10th',
      duration: 36,
      skills: ['Technical Skills', 'Practical Engineering'],
      credentials: ['Diploma Certificate'],
    },
    {
      name: 'Lateral Entry B.Tech',
      description: 'Direct admission to 2nd year B.Tech',
      duration: 36,
      skills: ['Engineering Theory', 'Advanced Technical Skills'],
      credentials: ['B.Tech Degree'],
    },
    {
      name: 'Job/ Higher Studies',
      description: 'Enter workforce or pursue M.Tech',
      duration: 6,
      skills: ['Professional Skills'],
      credentials: ['Job / GATE Rank'],
    },
  ],
  difficulty: PathDifficulty.MODERATE,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.5,
  durationMultiplier: 1.0,
};

export const DistanceEducationPathway: PathTemplate = {
  name: 'Distance Education + Skills',
  type: PathType.NON_TRADITIONAL,
  milestones: [
    {
      name: 'Distance Graduation',
      description: 'Complete degree through distance mode',
      duration: 36,
      skills: ['Self-Learning', 'Time Management'],
      credentials: ['Graduation Degree'],
    },
    {
      name: 'Skill Certification',
      description: 'Acquire professional certifications',
      duration: 12,
      skills: ['Job-specific Skills'],
      credentials: ['Certifications'],
    },
    {
      name: 'Job Entry',
      description: 'Enter workforce based on skills',
      duration: 6,
      skills: ['Professional Experience'],
      credentials: ['Job Experience'],
    },
  ],
  difficulty: PathDifficulty.EASY,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.2,
  durationMultiplier: 0.8,
};

// =============================================================================
// ENTREPRENEURIAL PATHWAYS
// =============================================================================

export const StartupPathway: PathTemplate = {
  name: 'Startup Founder',
  type: PathType.ENTREPRENEURIAL,
  milestones: [
    {
      name: 'Skill Development',
      description: 'Build core skills and domain expertise',
      duration: 24,
      skills: ['Technical Skills', 'Domain Knowledge', 'Self-Learning'],
      credentials: [],
    },
    {
      name: 'Idea Validation',
      description: 'Validate startup idea with market research',
      duration: 6,
      skills: ['Market Research', 'Customer Discovery', 'Problem Analysis'],
      credentials: ['Validated Idea'],
    },
    {
      name: 'MVP Development',
      description: 'Build minimum viable product',
      duration: 6,
      skills: ['Product Development', 'Rapid Prototyping'],
      credentials: ['MVP Launch'],
    },
    {
      name: 'Initial Traction',
      description: 'Acquire first customers/users',
      duration: 12,
      skills: ['Sales', 'Marketing', 'Customer Acquisition'],
      credentials: ['First Revenue'],
    },
    {
      name: 'Seed Funding',
      description: 'Raise initial funding or bootstrap',
      duration: 12,
      skills: ['Fundraising', 'Pitching', 'Networking'],
      credentials: ['Seed Investment'],
    },
    {
      name: 'Growth Phase',
      description: 'Scale the business',
      duration: 24,
      skills: ['Scaling', 'Team Building', 'Operations'],
      credentials: ['Growing Business'],
    },
  ],
  difficulty: PathDifficulty.EXTREME,
  risk: PathRisk.VERY_HIGH,
  costMultiplier: 0.5,
  durationMultiplier: 1.5,
};

export const FamilyBusinessPathway: PathTemplate = {
  name: 'Family Business',
  type: PathType.NON_TRADITIONAL,
  milestones: [
    {
      name: 'Education',
      description: 'Complete relevant education',
      duration: 36,
      skills: ['Business Basics', 'Domain Knowledge'],
      credentials: ['Degree/Diploma'],
    },
    {
      name: 'Business Exposure',
      description: 'Work in family business in various roles',
      duration: 24,
      skills: ['Operations', 'Sales', 'Finance', 'Management'],
      credentials: ['Business Experience'],
    },
    {
      name: 'Modernization',
      description: 'Bring new ideas and technology to business',
      duration: 24,
      skills: ['Digital Transformation', 'Modern Management'],
      credentials: [],
    },
    {
      name: 'Leadership Role',
      description: 'Take charge of business operations',
      duration: 24,
      skills: ['Leadership', 'Strategy', 'Growth'],
      credentials: ['Business Leadership'],
    },
  ],
  difficulty: PathDifficulty.MODERATE,
  risk: PathRisk.MODERATE,
  costMultiplier: 0.5,
  durationMultiplier: 0.9,
};

// =============================================================================
// PATHWAY COLLECTIONS BY CAREER
// =============================================================================

export const PathwaysByTarget: Record<string, PathTemplate[]> = {
  'Software Engineer': [
    IITPathway,
    NITPathway,
    StateEngineeringPathway,
    DiplomaEngineeringPathway,
  ],
  'Product Manager': [
    IITPathway,
    NITPathway,
    {
      ...StartupPathway,
      name: 'Startup to PM Route',
      milestones: StartupPathway.milestones.slice(0, 4).concat([
        {
          name: 'Product Role Transition',
          description: 'Transition from founder to PM role',
          duration: 12,
          skills: ['Product Management', 'Enterprise Experience'],
          credentials: ['PM Role'],
        },
      ]),
    },
  ],
  'Doctor': [
    MBBSGovernmentPathway,
    MBBSPrivatePathway,
    BDSPathway,
  ],
  'Civil Servant': [
    UPSCPathway,
    StatePSCPathway,
  ],
  'Chartered Accountant': [
    CAPathway,
  ],
  'Bank Manager': [
    BankingPathway,
    {
      ...CAPathway,
      name: 'CA to Banking Route',
    },
  ],
  'Government Officer': [
    UPSCPathway,
    StatePSCPathway,
    BankingPathway,
    SSCPathway,
    RailwaysPathway,
  ],
  'Entrepreneur': [
    StartupPathway,
    FamilyBusinessPathway,
  ],
};

// =============================================================================
// RECOVERY PATHS FOR COMMON FAILURES
// =============================================================================

export const JEERecoveryPaths = [
  {
    from: 'JEE Advanced',
    options: [
      { name: 'NIT via JEE Main', path: 'NIT Route' },
      { name: 'State Engineering', path: 'State Engineering College' },
      { name: 'Private Engineering', path: 'Private Engineering College' },
      { name: 'Diploma Route', path: 'Diploma + Lateral Entry' },
    ],
  },
];

export const NEETRecoveryPaths = [
  {
    from: 'NEET Government Seat',
    options: [
      { name: 'Private MBBS', path: 'MBBS Private College' },
      { name: 'BDS', path: 'BDS Route' },
      { name: 'BAMS/BHMS', path: 'Alternative Medicine' },
      { name: 'Allied Health', path: 'Allied Health Sciences' },
    ],
  },
];

export const UPSCRecoveryPaths = [
  {
    from: 'UPSC Final Selection',
    options: [
      { name: 'State PSC', path: 'State Civil Services' },
      { name: 'Banking', path: 'Banking (PO/Clerk)' },
      { name: 'SSC CGL', path: 'SSC CGL' },
      { name: 'Corporate with UPSC skills', path: 'Content/Teaching' },
    ],
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getPathwaysForTarget(target: string): PathTemplate[] {
  return PathwaysByTarget[target] || [];
}

export function getAllPathwayNames(): string[] {
  return Object.values(PathwaysByTarget).flat().map(p => p.name);
}

export function getRecoveryOptions(failurePoint: string, examType: string): string[] {
  const recoveryMap: Record<string, string[]> = {
    'JEE': ['NIT Route', 'State Engineering College', 'Private Engineering', 'Diploma Route'],
    'NEET': ['Private MBBS', 'BDS', 'BAMS', 'Allied Health'],
    'UPSC': ['State PSC', 'Banking', 'SSC CGL', 'Corporate'],
    'CA': ['CS', 'CMA', 'Accounting Career', 'Finance Job'],
    'Banking': ['SSC', 'Railways', 'State Govt Jobs'],
  };
  return recoveryMap[examType] || ['Alternative Career Path'];
}
