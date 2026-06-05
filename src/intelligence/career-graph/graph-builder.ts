/**
 * Career Graph Builder
 *
 * Constructs the career graph with nodes (subjects, degrees, careers, etc.)
 * and edges (opens, restricts, accelerates, etc.) representing relationships.
 */

import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  CareerNodeType,
  EdgeType,
  NodeId,
  EdgeId,
  Score,
  Probability,
  DEFAULT_CAREER_GRAPH_CONFIG,
} from './career-graph-types';

export interface GraphBuilderOptions {
  version?: string;
  enableCaching?: boolean;
}

export interface EdgeDefinition {
  from: NodeId;
  to: NodeId;
  type: EdgeType;
  probability?: Probability;
  effortScore?: Score;
  timeToTransition?: number;
  optionalityImpact?: number;
  reversibilityScore?: Score;
  conditions?: string[];
}

export interface NodeDefinition {
  id: NodeId;
  type: CareerNodeType;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  typicalDuration?: number;
  entryAge?: { min: number; max: number; typical: number };
  prerequisites?: NodeId[];
  requiredSkills?: string[];
  recommendedSkills?: string[];
  costRange?: { min: number; max: number; currency: string };
  earningPotential?: {
    entry: number;
    mid: number;
    senior: number;
    currency: string;
  };
  demandLevel?: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  growthOutlook?: 'strong-growth' | 'growth' | 'stable' | 'declining' | 'strong-decline';
}

/**
 * Predefined career pathways for Indian education system
 */
export const PREDEFINED_PATHWAYS = {
  // Science Stream
  pcm: {
    name: 'Physics-Chemistry-Mathematics',
    nodes: [
      { id: 'pcm-12', type: 'subject-choice' as CareerNodeType, name: 'PCM (11-12)' },
      { id: 'jee', type: 'certification' as CareerNodeType, name: 'JEE' },
      { id: 'iit-cs', type: 'degree-choice' as CareerNodeType, name: 'IIT Computer Science' },
      { id: 'iit-ee', type: 'degree-choice' as CareerNodeType, name: 'IIT Electrical Engineering' },
      { id: 'nit', type: 'degree-choice' as CareerNodeType, name: 'NIT Engineering' },
      { id: 'private-eng', type: 'degree-choice' as CareerNodeType, name: 'Private Engineering College' },
      { id: 'swe', type: 'career' as CareerNodeType, name: 'Software Engineer' },
      { id: 'data-scientist', type: 'career' as CareerNodeType, name: 'Data Scientist' },
      { id: 'product-manager', type: 'career' as CareerNodeType, name: 'Product Manager' },
      { id: 'ai-engineer', type: 'career' as CareerNodeType, name: 'AI/ML Engineer' },
      { id: 'tech-lead', type: 'leadership-track' as CareerNodeType, name: 'Tech Lead' },
      { id: 'cto', type: 'leadership-track' as CareerNodeType, name: 'CTO' },
      { id: 'founder', type: 'entrepreneurship-path' as CareerNodeType, name: 'Tech Startup Founder' },
    ],
    edges: [
      { from: 'pcm-12', to: 'jee', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'jee', to: 'iit-cs', type: 'opens' as EdgeType, probability:0.1 },
      { from: 'jee', to: 'iit-ee', type: 'opens' as EdgeType, probability: 0.08 },
      { from: 'jee', to: 'nit', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'pcm-12', to: 'private-eng', type: 'opens' as EdgeType, probability: 0.9 },
      { from: 'iit-cs', to: 'swe', type: 'opens' as EdgeType, probability: 0.95 },
      { from: 'iit-cs', to: 'ai-engineer', type: 'opens' as EdgeType, probability: 0.7 },
      { from: 'iit-ee', to: 'swe', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'nit', to: 'swe', type: 'opens' as EdgeType, probability: 0.85 },
      { from: 'private-eng', to: 'swe', type: 'opens' as EdgeType, probability: 0.7 },
      { from: 'swe', to: 'data-scientist', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'swe', to: 'product-manager', type: 'opens' as EdgeType, probability: 0.25 },
      { from: 'swe', to: 'tech-lead', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'tech-lead', to: 'cto', type: 'opens' as EdgeType, probability: 0.2 },
      { from: 'swe', to: 'founder', type: 'opens' as EdgeType, probability: 0.1 },
    ],
  },

  pcb: {
    name: 'Physics-Chemistry-Biology',
    nodes: [
      { id: 'pcb-12', type: 'subject-choice' as CareerNodeType, name: 'PCB (11-12)' },
      { id: 'neet', type: 'certification' as CareerNodeType, name: 'NEET' },
      { id: 'mbbs', type: 'degree-choice' as CareerNodeType, name: 'MBBS' },
      { id: 'bds', type: 'degree-choice' as CareerNodeType, name: 'BDS' },
      { id: 'bams', type: 'degree-choice' as CareerNodeType, name: 'BAMS' },
      { id: 'bhms', type: 'degree-choice' as CareerNodeType, name: 'BHMS' },
      { id: 'bsc-nursing', type: 'degree-choice' as CareerNodeType, name: 'B.Sc Nursing' },
      { id: 'doctor', type: 'career' as CareerNodeType, name: 'Doctor' },
      { id: 'surgeon', type: 'specialization' as CareerNodeType, name: 'Surgeon' },
      { id: 'physician', type: 'specialization' as CareerNodeType, name: 'Physician' },
      { id: 'dentist', type: 'career' as CareerNodeType, name: 'Dentist' },
      { id: 'ayurvedic-doctor', type: 'career' as CareerNodeType, name: 'Ayurvedic Doctor' },
      { id: 'nurse', type: 'career' as CareerNodeType, name: 'Nurse' },
      { id: 'medical-researcher', type: 'career' as CareerNodeType, name: 'Medical Researcher' },
      { id: 'hospital-admin', type: 'leadership-track' as CareerNodeType, name: 'Hospital Administrator' },
    ],
    edges: [
      { from: 'pcb-12', to: 'neet', type: 'opens' as EdgeType, probability: 0.8 },
      { from: 'neet', to: 'mbbs', type: 'opens' as EdgeType, probability: 0.15 },
      { from: 'neet', to: 'bds', type: 'opens' as EdgeType, probability: 0.1 },
      { from: 'neet', to: 'bams', type: 'opens' as EdgeType, probability: 0.08 },
      { from: 'neet', to: 'bhms', type: 'opens' as EdgeType, probability: 0.05 },
      { from: 'pcb-12', to: 'bsc-nursing', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'mbbs', to: 'doctor', type: 'opens' as EdgeType, probability: 1.0 },
      { from: 'mbbs', to: 'surgeon', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'mbbs', to: 'physician', type: 'opens' as EdgeType, probability: 0.5 },
      { from: 'mbbs', to: 'medical-researcher', type: 'opens' as EdgeType, probability: 0.2 },
      { from: 'doctor', to: 'hospital-admin', type: 'opens' as EdgeType, probability: 0.15 },
      { from: 'bds', to: 'dentist', type: 'opens' as EdgeType, probability: 1.0 },
      { from: 'bams', to: 'ayurvedic-doctor', type: 'opens' as EdgeType, probability: 0.9 },
      { from: 'bsc-nursing', to: 'nurse', type: 'opens' as EdgeType, probability: 0.95 },
    ],
  },

  commerce: {
    name: 'Commerce',
    nodes: [
      { id: 'commerce-12', type: 'subject-choice' as CareerNodeType, name: 'Commerce (11-12)' },
      { id: 'cpt', type: 'certification' as CareerNodeType, name: 'CA-CPT' },
      { id: 'ca', type: 'certification' as CareerNodeType, name: 'Chartered Accountant' },
      { id: 'cs', type: 'certification' as CareerNodeType, name: 'Company Secretary' },
      { id: 'cma', type: 'certification' as CareerNodeType, name: 'CMA' },
      { id: 'bcom', type: 'degree-choice' as CareerNodeType, name: 'B.Com' },
      { id: 'bba', type: 'degree-choice' as CareerNodeType, name: 'BBA' },
      { id: 'mba-finance', type: 'degree-choice' as CareerNodeType, name: 'MBA Finance' },
      { id: 'accountant', type: 'career' as CareerNodeType, name: 'Accountant' },
      { id: 'auditor', type: 'career' as CareerNodeType, name: 'Auditor' },
      { id: 'financial-analyst', type: 'career' as CareerNodeType, name: 'Financial Analyst' },
      { id: 'investment-banker', type: 'career' as CareerNodeType, name: 'Investment Banker' },
      { id: 'cfo', type: 'leadership-track' as CareerNodeType, name: 'CFO' },
      { id: 'finance-consultant', type: 'career' as CareerNodeType, name: 'Finance Consultant' },
    ],
    edges: [
      { from: 'commerce-12', to: 'cpt', type: 'opens' as EdgeType, probability: 0.5 },
      { from: 'commerce-12', to: 'bcom', type: 'opens' as EdgeType, probability: 0.95 },
      { from: 'commerce-12', to: 'bba', type: 'opens' as EdgeType, probability: 0.7 },
      { from: 'cpt', to: 'ca', type: 'opens' as EdgeType, probability: 0.2 },
      { from: 'cpt', to: 'cs', type: 'opens' as EdgeType, probability: 0.15 },
      { from: 'cpt', to: 'cma', type: 'opens' as EdgeType, probability: 0.25 },
      { from: 'bcom', to: 'ca', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'bcom', to: 'cs', type: 'opens' as EdgeType, probability: 0.2 },
      { from: 'bcom', to: 'mba-finance', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'bba', to: 'mba-finance', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'ca', to: 'accountant', type: 'opens' as EdgeType, probability: 0.9 },
      { from: 'ca', to: 'auditor', type: 'opens' as EdgeType, probability: 0.7 },
      { from: 'ca', to: 'financial-analyst', type: 'opens' as EdgeType, probability: 0.5 },
      { from: 'mba-finance', to: 'investment-banker', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'mba-finance', to: 'financial-analyst', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'financial-analyst', to: 'cfo', type: 'opens' as EdgeType, probability: 0.25 },
      { from: 'ca', to: 'finance-consultant', type: 'opens' as EdgeType, probability: 0.4 },
    ],
  },

  arts: {
    name: 'Arts/Humanities',
    nodes: [
      { id: 'arts-12', type: 'subject-choice' as CareerNodeType, name: 'Arts (11-12)' },
      { id: 'ba', type: 'degree-choice' as CareerNodeType, name: 'Bachelor of Arts' },
      { id: 'ba-history', type: 'degree-choice' as CareerNodeType, name: 'BA History' },
      { id: 'ba-pol-science', type: 'degree-choice' as CareerNodeType, name: 'BA Political Science' },
      { id: 'ba-psychology', type: 'degree-choice' as CareerNodeType, name: 'BA Psychology' },
      { id: 'ba-sociology', type: 'degree-choice' as CareerNodeType, name: 'BA Sociology' },
      { id: 'upsc', type: 'certification' as CareerNodeType, name: 'UPSC Civil Services' },
      { id: 'ssc', type: 'certification' as CareerNodeType, name: 'SSC' },
      { id: 'state-psc', type: 'certification' as CareerNodeType, name: 'State PSC' },
      { id: 'ias', type: 'career' as CareerNodeType, name: 'IAS Officer' },
      { id: 'ips', type: 'career' as CareerNodeType, name: 'IPS Officer' },
      { id: 'ifs', type: 'career' as CareerNodeType, name: 'IFS Officer' },
      { id: 'teacher', type: 'career' as CareerNodeType, name: 'Teacher' },
      { id: 'professor', type: 'career' as CareerNodeType, name: 'Professor' },
      { id: 'journalist', type: 'career' as CareerNodeType, name: 'Journalist' },
      { id: 'social-worker', type: 'career' as CareerNodeType, name: 'Social Worker' },
      { id: 'lawyer', type: 'career' as CareerNodeType, name: 'Lawyer' },
      { id: 'llb', type: 'degree-choice' as CareerNodeType, name: 'LLB' },
    ],
    edges: [
      { from: 'arts-12', to: 'ba', type: 'opens' as EdgeType, probability: 0.95 },
      { from: 'ba', to: 'ba-history', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'ba', to: 'ba-pol-science', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'ba', to: 'ba-psychology', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'ba', to: 'ba-sociology', type: 'opens' as EdgeType, probability: 0.25 },
      { from: 'arts-12', to: 'upsc', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'ba', to: 'upsc', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'arts-12', to: 'ssc', type: 'opens' as EdgeType, probability: 0.5 },
      { from: 'arts-12', to: 'state-psc', type: 'opens' as EdgeType, probability: 0.4 },
      { from: 'upsc', to: 'ias', type: 'opens' as EdgeType, probability: 0.08 },
      { from: 'upsc', to: 'ips', type: 'opens' as EdgeType, probability: 0.05 },
      { from: 'upsc', to: 'ifs', type: 'opens' as EdgeType, probability: 0.03 },
      { from: 'ba', to: 'teacher', type: 'opens' as EdgeType, probability: 0.5 },
      { from: 'ba-history', to: 'professor', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'ba', to: 'journalist', type: 'opens' as EdgeType, probability: 0.2 },
      { from: 'ba', to: 'social-worker', type: 'opens' as EdgeType, probability: 0.3 },
      { from: 'arts-12', to: 'llb', type: 'opens' as EdgeType, probability: 0.6 },
      { from: 'llb', to: 'lawyer', type: 'opens' as EdgeType, probability: 0.85 },
    ],
  },
};

export class GraphBuilder {
  private graph: CareerGraph;
  private options: GraphBuilderOptions;

  constructor(options: GraphBuilderOptions = {}) {
    this.options = {
      version: '1.0.0',
      enableCaching: true,
      ...options,
    };

    this.graph = this.initializeGraph();
  }

  /**
   * Initialize empty graph
   */
  private initializeGraph(): CareerGraph {
    const now = Date.now();
    return {
      id: `career-graph-${now}`,
      version: this.options.version || '1.0.0',
      createdAt: now,
      updatedAt: now,
      nodes: new Map(),
      edges: new Map(),
      edgesFrom: new Map(),
      edgesTo: new Map(),
    };
  }

  /**
   * Build complete career graph with predefined pathways
   */
  buildPredefinedGraph(): CareerGraph {
    this.graph = this.initializeGraph();

    // Add all predefined pathways
    Object.values(PREDEFINED_PATHWAYS).forEach(pathway => {
      this.addPathway(pathway);
    });

    // Add cross-pathway connections
    this.addCrossPathwayConnections();

    this.graph.updatedAt = Date.now();
    return this.graph;
  }

  /**
   * Add a pathway to the graph
   */
  private addPathway(pathway: {
    name: string;
    nodes: Array<{ id: NodeId; type: CareerNodeType; name: string }>;
    edges: Array<{ from: NodeId; to: NodeId; type: EdgeType; probability?: number }>;
  }): void {
    // Add nodes
    pathway.nodes.forEach(nodeDef => {
      if (!this.graph.nodes.has(nodeDef.id)) {
        const node: CareerNode = {
          id: nodeDef.id,
          type: nodeDef.type,
          name: nodeDef.name,
          description: this.generateDescription(nodeDef),
          category: pathway.name,
          tags: [pathway.name.toLowerCase().replace(/\s+/g, '-')],
          typicalDuration: this.estimateDuration(nodeDef.type),
          entryAge: this.estimateEntryAge(nodeDef.type),
          prerequisites: [],
          requiredSkills: [],
          recommendedSkills: [],
          costRange: this.estimateCost(nodeDef.type),
          earningPotential: this.estimateEarnings(nodeDef.type),
          demandLevel: 'medium',
          growthOutlook: 'stable',
          metadata: {},
        };
        this.addNode(node);
      }
    });

    // Add edges
    pathway.edges.forEach(edgeDef => {
      const edge: CareerEdge = {
        id: `edge-${edgeDef.from}-${edgeDef.to}`,
        from: edgeDef.from,
        to: edgeDef.to,
        type: edgeDef.type,
        probability: edgeDef.probability || 0.5,
        effortScore: this.estimateEffort(edgeDef.type),
        timeToTransition: this.estimateTransitionTime(edgeDef.type),
        optionalityImpact: this.calculateOptionalityImpact(edgeDef.type),
        reversibilityScore: this.estimateReversibility(edgeDef.type),
        conditions: [],
        metadata: {},
      };
      this.addEdge(edge);
    });
  }

  /**
   * Add cross-pathway connections
   */
  private addCrossPathwayConnections(): void {
    // PCM to Commerce (via MBA)
    this.addEdge({
      id: 'edge-swe-mba',
      from: 'swe',
      to: 'mba-finance',
      type: 'opens',
      probability: 0.15,
      effortScore: 80,
      timeToTransition: 24,
      optionalityImpact: 0.2,
      reversibilityScore: 60,
      conditions: ['work-experience-required'],
      metadata: {},
    });

    // PCM to Arts (via UPSC)
    this.addEdge({
      id: 'edge-swe-upsc',
      from: 'swe',
      to: 'upsc',
      type: 'opens',
      probability: 0.05,
      effortScore: 90,
      timeToTransition: 12,
      optionalityImpact: 0.1,
      reversibilityScore: 40,
      conditions: ['age-limit', 'attempts-limit'],
      metadata: {},
    });

    // Commerce to PCM (rare, but possible via career change)
    this.addEdge({
      id: 'edge-ca-swe',
      from: 'ca',
      to: 'swe',
      type: 'opens',
      probability: 0.05,
      effortScore: 95,
      timeToTransition: 24,
      optionalityImpact: 0.3,
      reversibilityScore: 50,
      conditions: ['skill-transition-required'],
      metadata: {},
    });

    // Arts to Commerce
    this.addEdge({
      id: 'edge-ba-mba',
      from: 'ba',
      to: 'mba-finance',
      type: 'opens',
      probability: 0.3,
      effortScore: 75,
      timeToTransition: 24,
      optionalityImpact: 0.3,
      reversibilityScore: 65,
      conditions: ['entrance-exam-required'],
      metadata: {},
    });

    // PCB to Commerce (via Hospital Admin)
    this.addEdge({
      id: 'edge-doctor-hospital-admin',
      from: 'doctor',
      to: 'hospital-admin',
      type: 'opens',
      probability: 0.3,
      effortScore: 60,
      timeToTransition: 12,
      optionalityImpact: 0.2,
      reversibilityScore: 70,
      conditions: ['experience-required'],
      metadata: {},
    });
  }

  /**
   * Add a node to the graph
   */
  addNode(node: CareerNode): void {
    this.graph.nodes.set(node.id, node);
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: CareerEdge): void {
    this.graph.edges.set(edge.id, edge);

    // Update indices
    const fromEdges = this.graph.edgesFrom.get(edge.from) || [];
    fromEdges.push(edge.id);
    this.graph.edgesFrom.set(edge.from, fromEdges);

    const toEdges = this.graph.edgesTo.get(edge.to) || [];
    toEdges.push(edge.id);
    this.graph.edgesTo.set(edge.to, toEdges);
  }

  /**
   * Get the built graph
   */
  getGraph(): CareerGraph {
    return this.graph;
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: CareerNodeType): CareerNode[] {
    return Array.from(this.graph.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get edges from a node
   */
  getEdgesFrom(nodeId: NodeId): CareerEdge[] {
    const edgeIds = this.graph.edgesFrom.get(nodeId) || [];
    return edgeIds.map(id => this.graph.edges.get(id)!).filter(Boolean);
  }

  /**
   * Get edges to a node
   */
  getEdgesTo(nodeId: NodeId): CareerEdge[] {
    const edgeIds = this.graph.edgesTo.get(nodeId) || [];
    return edgeIds.map(id => this.graph.edges.get(id)!).filter(Boolean);
  }

  /**
   * Get reachable nodes from a starting node
   */
  getReachableNodes(startNodeId: NodeId, maxDepth: number = 5): Map<NodeId, number> {
    const reachable = new Map<NodeId, number>();
    const visited = new Set<NodeId>();
    const queue: Array<{ nodeId: NodeId; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);

      if (nodeId !== startNodeId) {
        reachable.set(nodeId, depth);
      }

      const edges = this.getEdgesFrom(nodeId);
      for (const edge of edges) {
        if (!visited.has(edge.to)) {
          queue.push({ nodeId: edge.to, depth: depth + 1 });
        }
      }
    }

    return reachable;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateDescription(nodeDef: { type: CareerNodeType; name: string }): string {
    const descriptions: Record<CareerNodeType, string> = {
      'subject-choice': `Study ${nodeDef.name} in high school`,
      'degree-choice': `Pursue ${nodeDef.name} degree`,
      'certification': `Obtain ${nodeDef.name} certification`,
      'skill': `Develop ${nodeDef.name} skills`,
      'career': `Work as ${nodeDef.name}`,
      'industry': `Work in ${nodeDef.name} industry`,
      'leadership-track': `Progress to ${nodeDef.name} leadership role`,
      'entrepreneurship-path': `Build ${nodeDef.name}`,
      'role': `Work in ${nodeDef.name} role`,
      'company-type': `Work at ${nodeDef.name}`,
      'location': `Work in ${nodeDef.name}`,
      'specialization': `Specialize in ${nodeDef.name}`,
    };
    return descriptions[nodeDef.type] || nodeDef.name;
  }

  private estimateDuration(type: CareerNodeType): number {
    const durations: Record<CareerNodeType, number> = {
      'subject-choice': 24,
      'degree-choice': 48,
      'certification': 12,
      'skill': 6,
      'career': 60,
      'industry': 60,
      'leadership-track': 36,
      'entrepreneurship-path': 36,
      'role': 48,
      'company-type': 48,
      'location': 48,
      'specialization': 36,
    };
    return durations[type] || 24;
  }

  private estimateEntryAge(type: CareerNodeType): { min: number; max: number; typical: number } {
    const ages: Record<CareerNodeType, { min: number; max: number; typical: number }> = {
      'subject-choice': { min: 15, max: 17, typical: 16 },
      'degree-choice': { min: 17, max: 22, typical: 18 },
      'certification': { min: 18, max: 35, typical: 22 },
      'skill': { min: 16, max: 50, typical: 22 },
      'career': { min: 20, max: 60, typical: 22 },
      'industry': { min: 20, max: 60, typical: 22 },
      'leadership-track': { min: 28, max: 55, typical: 35 },
      'entrepreneurship-path': { min: 22, max: 50, typical: 28 },
      'role': { min: 20, max: 60, typical: 24 },
      'company-type': { min: 20, max: 60, typical: 22 },
      'location': { min: 18, max: 60, typical: 22 },
      'specialization': { min: 25, max: 50, typical: 30 },
    };
    return ages[type] || { min: 18, max: 60, typical: 22 };
  }

  private estimateCost(type: CareerNodeType): { min: number; max: number; currency: string } {
    const costs: Record<CareerNodeType, { min: number; max: number; currency: string }> = {
      'subject-choice': { min: 50000, max: 300000, currency: 'INR' },
      'degree-choice': { min: 200000, max: 2000000, currency: 'INR' },
      'certification': { min: 50000, max: 500000, currency: 'INR' },
      'skill': { min: 10000, max: 100000, currency: 'INR' },
      'career': { min: 0, max: 0, currency: 'INR' },
      'industry': { min: 0, max: 0, currency: 'INR' },
      'leadership-track': { min: 0, max: 500000, currency: 'INR' },
      'entrepreneurship-path': { min: 100000, max: 10000000, currency: 'INR' },
      'role': { min: 0, max: 0, currency: 'INR' },
      'company-type': { min: 0, max: 0, currency: 'INR' },
      'location': { min: 50000, max: 500000, currency: 'INR' },
      'specialization': { min: 100000, max: 1000000, currency: 'INR' },
    };
    return costs[type] || { min: 0, max: 0, currency: 'INR' };
  }

  private estimateEarnings(type: CareerNodeType): { entry: number; mid: number; senior: number; currency: string } {
    const earnings: Record<CareerNodeType, { entry: number; mid: number; senior: number; currency: string }> = {
      'subject-choice': { entry: 0, mid: 0, senior: 0, currency: 'INR' },
      'degree-choice': { entry: 0, mid: 0, senior: 0, currency: 'INR' },
      'certification': { entry: 0, mid: 0, senior: 0, currency: 'INR' },
      'skill': { entry: 0, mid: 0, senior: 0, currency: 'INR' },
      'career': { entry: 500000, mid: 1500000, senior: 5000000, currency: 'INR' },
      'industry': { entry: 400000, mid: 1200000, senior: 4000000, currency: 'INR' },
      'leadership-track': { entry: 2000000, mid: 5000000, senior: 15000000, currency: 'INR' },
      'entrepreneurship-path': { entry: 0, mid: 1000000, senior: 10000000, currency: 'INR' },
      'role': { entry: 400000, mid: 1200000, senior: 4000000, currency: 'INR' },
      'company-type': { entry: 300000, mid: 1000000, senior: 3500000, currency: 'INR' },
      'location': { entry: 300000, mid: 800000, senior: 2500000, currency: 'INR' },
      'specialization': { entry: 1000000, mid: 3000000, senior: 10000000, currency: 'INR' },
    };
    return earnings[type] || { entry: 300000, mid: 800000, senior: 2500000, currency: 'INR' };
  }

  private estimateEffort(edgeType: EdgeType): Score {
    const efforts: Record<EdgeType, Score> = {
      'opens': 60,
      'restricts': 30,
      'accelerates': 40,
      'delays': 20,
      'blocks': 10,
      'strengthens': 50,
      'requires': 70,
      'enables': 40,
    };
    return efforts[edgeType];
  }

  private estimateTransitionTime(edgeType: EdgeType): number {
    const times: Record<EdgeType, number> = {
      'opens': 12,
      'restricts': 6,
      'accelerates': 3,
      'delays': 24,
      'blocks': 0,
      'strengthens': 6,
      'requires': 24,
      'enables': 6,
    };
    return times[edgeType];
  }

  private calculateOptionalityImpact(edgeType: EdgeType): number {
    const impacts: Record<EdgeType, number> = {
      'opens': 0.3,
      'restricts': -0.3,
      'accelerates': 0.1,
      'delays': -0.1,
      'blocks': -0.5,
      'strengthens': 0.2,
      'requires': 0,
      'enables': 0.2,
    };
    return impacts[edgeType];
  }

  private estimateReversibility(edgeType: EdgeType): Score {
    const reversibility: Record<EdgeType, Score> = {
      'opens': 60,
      'restricts': 40,
      'accelerates': 50,
      'delays': 30,
      'blocks': 20,
      'strengthens': 55,
      'requires': 35,
      'enables': 50,
    };
    return reversibility[edgeType];
  }

  /**
   * Get graph statistics
   */
  getStatistics(): {
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<CareerNodeType, number>;
    edgesByType: Record<EdgeType, number>;
  } {
    const nodesByType: Partial<Record<CareerNodeType, number>> = {};
    const edgesByType: Partial<Record<EdgeType, number>> = {};

    for (const node of Array.from(this.graph.nodes.values())) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    for (const edge of Array.from(this.graph.edges.values())) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }

    return {
      totalNodes: this.graph.nodes.size,
      totalEdges: this.graph.edges.size,
      nodesByType: nodesByType as Record<CareerNodeType, number>,
      edgesByType: edgesByType as Record<EdgeType, number>,
    };
  }

  /**
   * Export graph data
   */
  exportGraph(): {
    nodes: CareerNode[];
    edges: CareerEdge[];
  } {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values()),
    };
  }

  /**
   * Reset graph
   */
  reset(): void {
    this.graph = this.initializeGraph();
  }
}
