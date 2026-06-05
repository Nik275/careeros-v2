/**
 * CareerOS Data Module
 *
 * Elite career profiles and reference data.
 */

export {
  // Technology
  SOFTWARE_ENGINEER,
  AI_ENGINEER,
  ML_ENGINEER,
  DATA_SCIENTIST,
  PRODUCT_MANAGER,
  CYBERSECURITY_ENGINEER,

  // Business
  MANAGEMENT_CONSULTANT,
  BUSINESS_ANALYST,
  OPERATIONS_MANAGER,
  ENTREPRENEUR,

  // Finance
  INVESTMENT_BANKER,
  FINANCIAL_ANALYST,
  CHARTERED_ACCOUNTANT,
  CFA_PROFESSIONAL,

  // Government
  IAS_OFFICER,
  IPS_OFFICER,
  IRS_OFFICER,

  // Healthcare
  DOCTOR,
  SURGEON,
  PSYCHOLOGIST,

  // Law
  CORPORATE_LAWYER,
  LITIGATION_LAWYER,
  JUDGE,

  // Design
  UX_DESIGNER,
  PRODUCT_DESIGNER,

  // Science
  RESEARCH_SCIENTIST,
  BIOTECHNOLOGIST,

  // Collections
  ELITE_CAREERS,
  ELITE_CAREERS_BY_CATEGORY,

  // Utilities
  getEliteCareerBySlug,
  getEliteCareersByCategory,
  validateEliteCareers,
  getEliteCareerStats,
} from './elite-career-set-v1';

// Career Relationship Network
export {
  // Types
  type CareerRelationshipV1,
  type KnowledgeGraphEdge,

  // Relationship Data
  ALL_CAREER_RELATIONSHIPS,

  // Query Functions
  getRelationshipsForCareer,
  getOutgoingRelationships,
  getIncomingRelationships,
  getRelationshipsByType,
  getStrongRelationships,

  // Analysis Functions
  getCareerRelationshipStats,
  getCareerNetworkMetrics,

  // Export
  exportForKnowledgeGraph,
} from './career-relationship-network-v1';
