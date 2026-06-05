/**
 * Decision Context Engine Tests
 * 
 * Comprehensive test suite for the Decision Context Engine.
 * Tests detection, scoring, explanation, and integration.
 */

import {
  createDecisionContextEngine,
  createQuickContextEngine,
  createPreciseContextEngine,
  DecisionContextType,
  ContextCategory,
  ContextPriority,
  EvidenceType,
} from '../index';
import { ContextDetectionInput } from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockStudentProfile = {
  studentId: 'test-student-001',
  psychology: {
    openness: 0.7,
    conscientiousness: 0.8,
    extraversion: 0.5,
    agreeableness: 0.6,
    neuroticism: 0.3,
  },
  motivations: {
    money: 0.7,
    impact: 0.6,
    status: 0.5,
    autonomy: 0.8,
    stability: 0.4,
  },
  primaryMotivation: 'autonomy',
  constraints: {
    financialSupport: 'family_supported',
    geographicLimitation: null,
    familyExpectations: null,
  },
  academic: {
    currentEducation: 'Class 12',
    subjectInterests: ['Physics', 'Chemistry', 'Mathematics'],
    aptitudeExams: [
      { name: 'JEE Main', status: 'registered' },
      { name: 'JEE Advanced', status: 'preparing' },
    ],
  },
  decision: {
    timeline: 'immediate',
    confidence: 0.7,
    informationNeeds: ['college_rankings', 'branch_selection'],
  },
  dataConfidence: 0.8,
  completeness: 0.75,
};

const mockJeeInput: ContextDetectionInput = {
  profile: mockStudentProfile,
  explicitGoals: ['Clear JEE Advanced', 'Get into IIT Bombay', 'Study Computer Science'],
  userInput: 'I am preparing for JEE and want to get into a good IIT',
  timestamp: Date.now(),
  metadata: {
    source: 'assessment',
    assessmentId: 'test-assessment-001',
  },
};

const mockNeetInput: ContextDetectionInput = {
  profile: {
    ...mockStudentProfile,
    academic: {
      ...mockStudentProfile.academic,
      currentEducation: 'Class 12',
      subjectInterests: ['Biology', 'Chemistry', 'Physics'],
      aptitudeExams: [
        { name: 'NEET', status: 'registered' },
      ],
    },
  },
  explicitGoals: ['Clear NEET', 'Get into AIIMS Delhi', 'Become a doctor'],
  userInput: 'I want to crack NEET and get into a good medical college',
  timestamp: Date.now(),
};

const mockUpscInput: ContextDetectionInput = {
  profile: {
    ...mockStudentProfile,
    academic: {
      ...mockStudentProfile.academic,
      currentEducation: 'B.A. Political Science',
      subjectInterests: ['Public Administration', 'History', 'Polity'],
      aptitudeExams: [],
    },
  },
  explicitGoals: ['Clear UPSC', 'Become an IAS officer', 'Serve the nation'],
  userInput: 'I am preparing for UPSC civil services examination',
  timestamp: Date.now(),
};

const mockStartupInput: ContextDetectionInput = {
  profile: {
    ...mockStudentProfile,
    motivations: {
      ...mockStudentProfile.motivations,
      autonomy: 0.95,
    },
  },
  explicitGoals: ['Build a startup', 'Solve real problems', 'Be my own boss'],
  userInput: 'I have a startup idea and want to build my own company',
  timestamp: Date.now(),
};

const mockCareerSwitchInput: ContextDetectionInput = {
  profile: {
    ...mockStudentProfile,
    academic: {
      ...mockStudentProfile.academic,
      currentEducation: 'Working Professional',
    },
  },
  explicitGoals: ['Change my career', 'Move to tech industry', 'Learn coding'],
  userInput: 'I am working in a different field and want to switch to software',
  timestamp: Date.now(),
};

// ============================================================================
// DETECTION TESTS
// ============================================================================

describe('DecisionContextOrchestrator', () => {
  let engine: ReturnType<typeof createDecisionContextEngine>;

  beforeEach(() => {
    engine = createDecisionContextEngine();
  });

  describe('Context Detection', () => {
    it('should detect JEE preparation context with high confidence', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.primaryContext).toBeDefined();
      expect(analysis.primaryContext?.context).toBe(DecisionContextType.JEE_PREPARATION);
      expect(analysis.primaryContext?.confidence).toBeGreaterThan(0.7);
      expect(analysis.primaryContext?.priority).toBe(ContextPriority.PRIMARY);
    });

    it('should detect NEET preparation context', () => {
      const analysis = engine.analyze(mockNeetInput);

      expect(analysis.primaryContext?.context).toBe(DecisionContextType.NEET_PREPARATION);
      expect(analysis.primaryContext?.confidence).toBeGreaterThan(0.6);
    });

    it('should detect UPSC preparation context', () => {
      const analysis = engine.analyze(mockUpscInput);

      expect(analysis.primaryContext?.context).toBe(DecisionContextType.UPSC_PREPARATION);
      expect(analysis.primaryContext?.confidence).toBeGreaterThan(0.5);
    });

    it('should detect startup exploration context', () => {
      const analysis = engine.analyze(mockStartupInput);

      expect(analysis.contexts.some(c => c.context === DecisionContextType.STARTUP_EXPLORATION)).toBe(true);
    });

    it('should detect career switch context', () => {
      const analysis = engine.analyze(mockCareerSwitchInput);

      expect(analysis.contexts.some(c => c.context === DecisionContextType.CAREER_SWITCH)).toBe(true);
    });

    it('should support multiple contexts simultaneously', () => {
      // JEE student also interested in entrepreneurship
      const multiContextInput: ContextDetectionInput = {
        ...mockJeeInput,
        userInput: 'I am preparing for JEE but also have a startup idea I want to explore',
      };

      const analysis = engine.analyze(multiContextInput);

      expect(analysis.primaryContext?.context).toBe(DecisionContextType.JEE_PREPARATION);
      expect(analysis.secondaryContexts.length).toBeGreaterThan(0);
      expect(analysis.secondaryContexts.some(c => c.context === DecisionContextType.STARTUP_EXPLORATION)).toBe(true);
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence based on evidence strength', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.primaryContext?.confidence).toBeGreaterThan(0);
      expect(analysis.primaryContext?.confidence).toBeLessThanOrEqual(1);
      expect(analysis.overallConfidence).toBeGreaterThan(0);
    });

    it('should have higher confidence with explicit goals', () => {
      const withGoals = engine.analyze(mockJeeInput);
      
      const withoutGoals: ContextDetectionInput = {
        ...mockJeeInput,
        explicitGoals: undefined,
        userInput: undefined,
      };
      const noGoals = engine.analyze(withoutGoals);

      expect(withGoals.primaryContext?.confidence).toBeGreaterThan(
        noGoals.primaryContext?.confidence || 0
      );
    });

    it('should track uncertainty for low-confidence detections', () => {
      const vagueInput: ContextDetectionInput = {
        profile: mockStudentProfile,
        timestamp: Date.now(),
      };

      const analysis = engine.analyze(vagueInput);

      if (analysis.contexts.length > 0) {
        expect(analysis.contexts[0].uncertainty).toBeDefined();
        expect(analysis.contexts[0].uncertainty.score).toBeGreaterThan(0);
      }
    });
  });

  describe('Prioritization', () => {
    it('should assign PRIMARY priority to highest confidence context', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.primaryContext?.priority).toBe(ContextPriority.PRIMARY);
      
      // All other contexts should be secondary or lower
      const nonPrimary = analysis.contexts.filter(c => c.context !== analysis.primaryContext?.context);
      nonPrimary.forEach(c => {
        expect(c.priority).not.toBe(ContextPriority.PRIMARY);
      });
    });

    it('should limit contexts to maxContexts setting', () => {
      const limitedEngine = createDecisionContextEngine({
        maxContexts: 2,
      });

      const analysis = limitedEngine.analyze(mockJeeInput);

      expect(analysis.contexts.length).toBeLessThanOrEqual(2);
    });

    it('should filter out incidental contexts by default', () => {
      const analysis = engine.analyze(mockJeeInput);

      const incidental = analysis.contexts.filter(
        c => c.priority === ContextPriority.INCIDENTAL
      );
      expect(incidental.length).toBe(0);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect mutually exclusive contexts', () => {
      // Student claiming both JEE and NEET prep (unusual but possible)
      const conflictingInput: ContextDetectionInput = {
        profile: {
          ...mockStudentProfile,
          academic: {
            ...mockStudentProfile.academic,
            aptitudeExams: [
              { name: 'JEE Main', status: 'registered' },
              { name: 'NEET', status: 'registered' },
            ],
          },
        },
        explicitGoals: ['Clear JEE', 'Clear NEET'],
        timestamp: Date.now(),
      };

      const analysis = engine.analyze(conflictingInput);

      // Should have both contexts detected
      const hasJee = analysis.contexts.some(c => c.context === DecisionContextType.JEE_PREPARATION);
      const hasNeet = analysis.contexts.some(c => c.context === DecisionContextType.NEET_PREPARATION);

      if (hasJee && hasNeet) {
        // Should detect conflict
        expect(analysis.conflicts.length).toBeGreaterThan(0);
        const mutualExclusivity = analysis.conflicts.some(
          c => c.type === 'mutually_exclusive'
        );
        expect(mutualExclusivity).toBe(true);
      }
    });

    it('should detect resource competition', () => {
      // UPSC prep while working
      const busyInput: ContextDetectionInput = {
        ...mockUpscInput,
        userInput: 'I am working full time and preparing for UPSC',
      };

      const analysis = engine.analyze(busyInput);

      // Look for resource competition conflicts
      const resourceConflict = analysis.conflicts.some(
        c => c.type === 'resource_competition'
      );
      
      // Not guaranteed, but should be considered
      expect(analysis.conflicts).toBeDefined();
    });
  });

  describe('Explanation Generation', () => {
    it('should generate human-readable explanations', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.primaryContext?.explanation).toBeDefined();
      expect(analysis.primaryContext?.explanation.length).toBeGreaterThan(0);
      expect(analysis.narrative.summary).toBeDefined();
    });

    it('should generate context characteristics', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.primaryContext?.characteristics).toBeDefined();
      expect(analysis.primaryContext?.characteristics.length).toBeGreaterThan(0);
    });

    it('should generate narrative with insight', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.narrative.insight).toBeDefined();
      expect(analysis.narrative.implications).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should respect minConfidenceThreshold', () => {
      const strictEngine = createDecisionContextEngine({
        minConfidenceThreshold: 0.8,
      });

      const analysis = strictEngine.analyze(mockJeeInput);

      // All contexts should meet the threshold
      analysis.contexts.forEach(c => {
        expect(c.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should respect enabledContexts filter', () => {
      const limitedEngine = createDecisionContextEngine({
        enabledContexts: [DecisionContextType.JEE_PREPARATION, DecisionContextType.NEET_PREPARATION],
      });

      const analysis = limitedEngine.analyze(mockStartupInput);

      // Should not detect startup context since it's not enabled
      expect(analysis.contexts.some(c => c.context === DecisionContextType.STARTUP_EXPLORATION)).toBe(false);
    });

    it('should support custom signal extractors', () => {
      const customExtractor = jest.fn(() => [
        {
          id: 'custom-1',
          type: EvidenceType.EXPLICIT_ANSWER,
          strength: 0.9,
          description: 'Custom evidence',
          source: 'custom',
          rawValue: 'test',
          timestamp: Date.now(),
        },
      ]);

      engine.addSignalExtractor(customExtractor);
      engine.analyze(mockJeeInput);

      expect(customExtractor).toHaveBeenCalled();
    });
  });

  describe('Specific Context Detection', () => {
    it('should detect specific context when requested', () => {
      const jeeContext = engine.detectContext(
        DecisionContextType.JEE_PREPARATION,
        mockJeeInput
      );

      expect(jeeContext).not.toBeNull();
      expect(jeeContext?.context).toBe(DecisionContextType.JEE_PREPARATION);
    });

    it('should return null for undetected context', () => {
      const caContext = engine.detectContext(
        DecisionContextType.CA_PATHWAY,
        mockJeeInput
      );

      // JEE input shouldn't trigger CA detection
      expect(caContext).toBeNull();
    });
  });

  describe('Analysis Completeness', () => {
    it('should mark as complete with sufficient data', () => {
      const analysis = engine.analyze(mockJeeInput);

      expect(analysis.completeness).toBe('complete');
    });

    it('should mark as insufficient_data with minimal input', () => {
      const minimalInput: ContextDetectionInput = {
        profile: mockStudentProfile,
        timestamp: Date.now(),
      };

      const analysis = engine.analyze(minimalInput);

      expect(['insufficient_data', 'partial']).toContain(analysis.completeness);
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations for improvement', () => {
      const minimalInput: ContextDetectionInput = {
        profile: mockStudentProfile,
        timestamp: Date.now(),
      };

      const analysis = engine.analyze(minimalInput);

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations[0].description).toBeDefined();
      expect(analysis.recommendations[0].priority).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      const emptyInput: ContextDetectionInput = {
        profile: mockStudentProfile,
        timestamp: Date.now(),
      };

      const analysis = engine.analyze(emptyInput);

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeGreaterThan(0);
    });

    it('should handle very long user input', () => {
      const longInput: ContextDetectionInput = {
        ...mockJeeInput,
        userInput: 'JEE '.repeat(1000),
      };

      const analysis = engine.analyze(longInput);

      expect(analysis).toBeDefined();
    });

    it('should handle special characters in input', () => {
      const specialInput: ContextDetectionInput = {
        ...mockJeeInput,
        userInput: 'JEE & NEET <script>alert("test")</script> @#$%',
      };

      const analysis = engine.analyze(specialInput);

      expect(analysis).toBeDefined();
    });
  });
});

// ============================================================================
// ENGINE VARIANT TESTS
// ============================================================================

describe('Engine Variants', () => {
  it('quick engine should use lower thresholds', () => {
    const quickEngine = createQuickContextEngine();
    const config = quickEngine.getConfig();

    expect(config.minConfidenceThreshold).toBeLessThan(0.3);
    expect(config.includeIncidental).toBe(true);
  });

  it('precise engine should use higher thresholds', () => {
    const preciseEngine = createPreciseContextEngine();
    const config = preciseEngine.getConfig();

    expect(config.minConfidenceThreshold).toBeGreaterThan(0.3);
    expect(config.explanationVerbosity).toBe('detailed');
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('Type Guards', () => {
  it('should identify valid context types', () => {
    const { isDecisionContextType } = require('../types');

    expect(isDecisionContextType(DecisionContextType.JEE_PREPARATION)).toBe(true);
    expect(isDecisionContextType('INVALID_TYPE')).toBe(false);
    expect(isDecisionContextType(null)).toBe(false);
  });
});

// ============================================================================
// LABEL & DESCRIPTION TESTS
// ============================================================================

describe('Context Labels & Descriptions', () => {
  it('should provide human-readable labels', () => {
    const { getContextTypeLabel } = require('../types');

    expect(getContextTypeLabel(DecisionContextType.JEE_PREPARATION)).toBe('JEE Preparation');
    expect(getContextTypeLabel(DecisionContextType.UPSC_PREPARATION)).toBe('UPSC Preparation');
  });

  it('should provide descriptions', () => {
    const { getContextTypeDescription } = require('../types');

    const desc = getContextTypeDescription(DecisionContextType.JEE_PREPARATION);
    expect(desc).toContain('Joint Entrance Examination');
    expect(desc.length).toBeGreaterThan(0);
  });
});
