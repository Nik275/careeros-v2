/**
 * Career Path Intelligence - Data Module
 * 
 * Indian-specific pathway definitions and recovery options.
 * 
 * @module intelligence/career-path-intelligence/data
 */

export {
  // JEE Pathways
  IITPathway,
  NITPathway,
  StateEngineeringPathway,
  
  // Medical Pathways
  MBBSGovernmentPathway,
  MBBSPrivatePathway,
  BDSPathway,
  
  // Civil Services Pathways
  UPSCPathway,
  StatePSCPathway,
  
  // Professional Courses
  CAPathway,
  CSPathway,
  
  // Government Jobs
  BankingPathway,
  SSCPathway,
  RailwaysPathway,
  
  // Alternative Pathways
  DiplomaEngineeringPathway,
  DistanceEducationPathway,
  
  // Entrepreneurial Pathways
  StartupPathway,
  FamilyBusinessPathway,
  
  // Pathway Collections
  PathwaysByTarget,
  
  // Recovery Paths
  JEERecoveryPaths,
  NEETRecoveryPaths,
  UPSCRecoveryPaths,
  
  // Utility Functions
  getPathwaysForTarget,
  getAllPathwayNames,
  getRecoveryOptions,
} from './indian-pathways';
