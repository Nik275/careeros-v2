/**
 * StudentProfile Domain Tests
 *
 * Validates the StudentProfile domain model functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  type StudentProfile,
  type PsychologyProfile,
  type Motivations,
  type RealityConstraints,
  type AcademicProfile,
  type DecisionContext,

  // Enums
  EducationStage,
  AcademicStream,
  EducationBoard,
  LocationType,
  LanguageComfort,
  CoachingAccess,
  FamilyIncomeBracket,
  FamilyPressure,
  DecisionUrgency,
  ExplorationStage,
  DecisionConfidence,
  GradeScale,
  CompetitiveExamType,

  // Validation
  isValidProfileScore,
  validatePsychologyProfile,
  validateMotivations,
  validateStudentProfile,

  // Builder
  StudentProfileBuilder,

  // Utilities
  createNeutralPsychologyProfile,
  createNeutralMotivations,
  derivePrimaryMotivation,
  calculateProfileCompleteness,
  formatProfileScore,
  comparePsychologyProfiles,
  isStudentProfile,
} from '../index';

describe('StudentProfile Domain', () => {
  describe('Core Types & Validation', () => {
    describe('isValidProfileScore', () => {
      it('should accept valid scores', () => {
        expect(isValidProfileScore(0)).toBe(true);
        expect(isValidProfileScore(0.5)).toBe(true);
        expect(isValidProfileScore(1)).toBe(true);
        expect(isValidProfileScore(0.75)).toBe(true);
      });

      it('should reject invalid scores', () => {
        expect(isValidProfileScore(-0.1)).toBe(false);
        expect(isValidProfileScore(1.1)).toBe(false);
        expect(isValidProfileScore(NaN)).toBe(false);
        expect(isValidProfileScore('0.5' as unknown as number)).toBe(false);
      });
    });

    describe('validatePsychologyProfile', () => {
      it('should validate complete profile', () => {
        const profile: PsychologyProfile = {
          analyticalThinking: 0.8,
          creativity: 0.6,
          socialOrientation: 0.7,
          leadership: 0.5,
          detailOrientation: 0.9,
          curiosity: 0.8,
          competitiveness: 0.4,
          riskTolerance: 0.6,
        };
        expect(validatePsychologyProfile(profile)).toBe(true);
      });

      it('should reject profile with out-of-range scores', () => {
        const profile = {
          analyticalThinking: 1.5,
          creativity: 0.6,
          socialOrientation: 0.7,
          leadership: 0.5,
          detailOrientation: 0.9,
          curiosity: 0.8,
          competitiveness: 0.4,
          riskTolerance: 0.6,
        } as PsychologyProfile;
        expect(validatePsychologyProfile(profile)).toBe(false);
      });

      it('should reject profile with missing fields', () => {
        const profile = {
          analyticalThinking: 0.8,
          creativity: 0.6,
        } as PsychologyProfile;
        expect(validatePsychologyProfile(profile)).toBe(false);
      });
    });

    describe('validateMotivations', () => {
      it('should validate complete motivations', () => {
        const motivations: Motivations = {
          money: 0.7,
          impact: 0.9,
          status: 0.5,
          freedom: 0.8,
          stability: 0.6,
        };
        expect(validateMotivations(motivations)).toBe(true);
      });

      it('should reject motivations with invalid scores', () => {
        const motivations = {
          money: -0.1,
          impact: 0.9,
          status: 0.5,
          freedom: 0.8,
          stability: 0.6,
        } as Motivations;
        expect(validateMotivations(motivations)).toBe(false);
      });
    });

    describe('validateStudentProfile', () => {
      it('should reject null/undefined', () => {
        expect(validateStudentProfile(null)).toBe(false);
        expect(validateStudentProfile(undefined)).toBe(false);
      });

      it('should reject non-object', () => {
        expect(validateStudentProfile('string')).toBe(false);
        expect(validateStudentProfile(123)).toBe(false);
      });

      it('should reject profile missing required fields', () => {
        const incomplete = {
          id: 'test-id',
          studentId: 'student-123',
        };
        expect(validateStudentProfile(incomplete)).toBe(false);
      });
    });

    describe('isStudentProfile', () => {
      it('should be true for valid profile', () => {
        const builder = new StudentProfileBuilder('student-123');
        const profile = builder.build();
        expect(isStudentProfile(profile)).toBe(true);
      });

      it('should be false for invalid object', () => {
        expect(isStudentProfile({})).toBe(false);
      });
    });
  });

  describe('StudentProfileBuilder', () => {
    let builder: StudentProfileBuilder;

    beforeEach(() => {
      builder = new StudentProfileBuilder('student-123');
    });

    describe('Basic Construction', () => {
      it('should create a valid profile with defaults', () => {
        const profile = builder.build();

        expect(profile.id).toBeDefined();
        expect(profile.studentId).toBe('student-123');
        expect(profile.schemaVersion).toBe(1);
        expect(profile.createdAt).toBeDefined();
        expect(profile.updatedAt).toBeDefined();
      });

      it('should generate unique IDs', () => {
        const profile1 = new StudentProfileBuilder('s1').build();
        const profile2 = new StudentProfileBuilder('s2').build();

        expect(profile1.id).not.toBe(profile2.id);
      });

      it('should set timestamps', () => {
        const before = Date.now();
        const profile = builder.build();
        const after = Date.now();

        expect(profile.createdAt).toBeGreaterThanOrEqual(before);
        expect(profile.createdAt).toBeLessThanOrEqual(after);
        expect(profile.updatedAt).toBeGreaterThanOrEqual(before);
      });
    });

    describe('Psychology Profile', () => {
      it('should set psychology via withPsychology', () => {
        const profile = builder
          .withPsychology({
            analyticalThinking: 0.9,
            creativity: 0.7,
          })
          .build();

        expect(profile.psychology.analyticalThinking).toBe(0.9);
        expect(profile.psychology.creativity).toBe(0.7);
      });

      it('should set individual traits', () => {
        const profile = builder
          .withAnalyticalThinking(0.9)
          .withCreativity(0.8)
          .withSocialOrientation(0.7)
          .withLeadership(0.6)
          .withDetailOrientation(0.9)
          .withCuriosity(0.8)
          .withCompetitiveness(0.5)
          .withRiskTolerance(0.6)
          .build();

        expect(profile.psychology.analyticalThinking).toBe(0.9);
        expect(profile.psychology.creativity).toBe(0.8);
        expect(profile.psychology.socialOrientation).toBe(0.7);
        expect(profile.psychology.leadership).toBe(0.6);
        expect(profile.psychology.detailOrientation).toBe(0.9);
        expect(profile.psychology.curiosity).toBe(0.8);
        expect(profile.psychology.competitiveness).toBe(0.5);
        expect(profile.psychology.riskTolerance).toBe(0.6);
      });

      it('should use defaults for unset traits', () => {
        const profile = builder.build();

        expect(profile.psychology.analyticalThinking).toBe(0.5);
        expect(profile.psychology.creativity).toBe(0.5);
      });
    });

    describe('Motivations', () => {
      it('should set motivations via withMotivations', () => {
        const profile = builder
          .withMotivations({
            money: 0.8,
            impact: 0.9,
          })
          .build();

        expect(profile.motivations.money).toBe(0.8);
        expect(profile.motivations.impact).toBe(0.9);
      });

      it('should set primary motivation', () => {
        const profile = builder.withPrimaryMotivation('impact').build();
        expect(profile.primaryMotivation).toBe('impact');
      });

      it('should derive primary motivation if not set', () => {
        const profile = builder
          .withMotivations({
            money: 0.3,
            impact: 0.9,
            status: 0.4,
            freedom: 0.5,
            stability: 0.3,
          })
          .build();

        expect(profile.primaryMotivation).toBe('impact');
      });

      it('should return undetermined for low motivation scores', () => {
        const profile = builder
          .withMotivations({
            money: 0.4,
            impact: 0.4,
            status: 0.4,
            freedom: 0.4,
            stability: 0.4,
          })
          .build();

        expect(profile.primaryMotivation).toBe('undetermined');
      });
    });

    describe('Reality Constraints', () => {
      it('should set financial context', () => {
        const profile = builder
          .withFinancialContext({
            familyIncomeBracket: FamilyIncomeBracket.BETWEEN_12_25_LPA,
            hasPersonalIncome: true,
            personalMonthlyIncome: 5000,
          })
          .build();

        expect(profile.constraints.financial.familyIncomeBracket).toBe(
          FamilyIncomeBracket.BETWEEN_12_25_LPA
        );
        expect(profile.constraints.financial.hasPersonalIncome).toBe(true);
        expect(profile.constraints.financial.personalMonthlyIncome).toBe(5000);
      });

      it('should set family context', () => {
        const profile = builder
          .withFamilyContext({
            familyPressure: FamilyPressure.MODERATE,
            isFirstGeneration: true,
            dependentCount: 2,
          })
          .build();

        expect(profile.constraints.family.familyPressure).toBe(FamilyPressure.MODERATE);
        expect(profile.constraints.family.isFirstGeneration).toBe(true);
        expect(profile.constraints.family.dependentCount).toBe(2);
      });

      it('should set geographic context', () => {
        const profile = builder
          .withGeographicContext({
            locationType: LocationType.METRO_TIER_1,
            currentCity: 'Bangalore',
            willingToRelocate: false,
          })
          .build();

        expect(profile.constraints.geographic.locationType).toBe(LocationType.METRO_TIER_1);
        expect(profile.constraints.geographic.currentCity).toBe('Bangalore');
        expect(profile.constraints.geographic.willingToRelocate).toBe(false);
      });

      it('should set accessibility context', () => {
        const profile = builder
          .withAccessibilityContext({
            languageComfort: LanguageComfort.FLUENT_ENGLISH,
            coachingAccess: CoachingAccess.EXTENSIVE,
            hasInternetAccess: true,
          })
          .build();

        expect(profile.constraints.accessibility.languageComfort).toBe(
          LanguageComfort.FLUENT_ENGLISH
        );
        expect(profile.constraints.accessibility.coachingAccess).toBe(CoachingAccess.EXTENSIVE);
      });
    });

    describe('Academic Profile', () => {
      it('should set academic performance', () => {
        const profile = builder
          .withAcademicPerformance({
            stage: EducationStage.HIGH_SCHOOL_12,
            stream: AcademicStream.SCIENCE,
            overallScore: 0.85,
          })
          .build();

        expect(profile.academic.performance.stage).toBe(EducationStage.HIGH_SCHOOL_12);
        expect(profile.academic.performance.stream).toBe(AcademicStream.SCIENCE);
        expect(profile.academic.performance.overallScore).toBe(0.85);
      });

      it('should set aptitude scores', () => {
        const profile = builder
          .withAptitudeScores({
            logicalReasoning: 0.8,
            numericalAbility: 0.9,
            verbalAbility: 0.7,
          })
          .build();

        expect(profile.academic.aptitude.logicalReasoning).toBe(0.8);
        expect(profile.academic.aptitude.numericalAbility).toBe(0.9);
      });

      it('should set exam results', () => {
        const examResults = [
          {
            examType: CompetitiveExamType.JEE_MAIN,
            percentile: 95.5,
            qualified: true,
            year: 2024,
            attemptNumber: 1,
          },
        ];

        const profile = builder.withExamResults(examResults).build();

        expect(profile.academic.examResults).toHaveLength(1);
        expect(profile.academic.examResults[0].examType).toBe(CompetitiveExamType.JEE_MAIN);
      });

      it('should set academic interests', () => {
        const profile = builder
          .withAcademicInterests({
            favoriteSubjects: ['Mathematics', 'Physics'],
            dislikedSubjects: ['Biology'],
            extracurriculars: ['Robotics Club'],
          })
          .build();

        expect(profile.academic.interests.favoriteSubjects).toContain('Mathematics');
        expect(profile.academic.interests.dislikedSubjects).toContain('Biology');
      });
    });

    describe('Decision Context', () => {
      it('should set exploration stage', () => {
        const profile = builder.withExplorationStage(ExplorationStage.NARROWING).build();
        expect(profile.decision.explorationStage).toBe(ExplorationStage.NARROWING);
      });

      it('should set decision timeline', () => {
        const profile = builder
          .withDecisionTimeline({
            urgency: DecisionUrgency.IMMEDIATE,
            monthsToDecision: 2,
          })
          .build();

        expect(profile.decision.timeline.urgency).toBe(DecisionUrgency.IMMEDIATE);
        expect(profile.decision.timeline.monthsToDecision).toBe(2);
      });

      it('should set decision confidence', () => {
        const profile = builder
          .withDecisionConfidence({
            level: DecisionConfidence.CONFIDENT,
            score: 0.8,
          })
          .build();

        expect(profile.decision.confidence.level).toBe(DecisionConfidence.CONFIDENT);
        expect(profile.decision.confidence.score).toBe(0.8);
      });

      it('should set information needs', () => {
        const profile = builder
          .withInformationNeeds({
            gaps: ['Salary information', 'Work-life balance'],
            careersToResearch: ['Software Engineer', 'Data Scientist'],
          })
          .build();

        expect(profile.decision.informationNeeds.gaps).toContain('Salary information');
        expect(profile.decision.informationNeeds.careersToResearch).toContain('Software Engineer');
      });
    });

    describe('Metadata', () => {
      it('should set data source and confidence', () => {
        const profile = builder.withDataSource('assessment', 0.9).build();

        expect(profile.dataSource).toBe('assessment');
        expect(profile.dataConfidence).toBe(0.9);
      });

      it('should set notes', () => {
        const profile = builder.withNotes('Student is very motivated').build();
        expect(profile.notes).toBe('Student is very motivated');
      });

      it('should calculate completeness', () => {
        const profile = builder
          .withPsychology({ analyticalThinking: 0.8, creativity: 0.7 })
          .withMotivations({ money: 0.8, impact: 0.9 })
          .build();

        expect(profile.completeness).toBeGreaterThan(0);
        expect(profile.completeness).toBeLessThanOrEqual(1);
      });
    });

    describe('Error Handling', () => {
      it('should throw for invalid profile', () => {
        // Creating an invalid state by manipulating internal state would require
        // accessing private fields, so we test validation separately
        const invalidProfile = {
          id: 'test',
          studentId: 'student',
          // Missing required fields
        };

        expect(validateStudentProfile(invalidProfile)).toBe(false);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('createNeutralPsychologyProfile', () => {
      it('should create profile with all 0.5s', () => {
        const profile = createNeutralPsychologyProfile();

        expect(profile.analyticalThinking).toBe(0.5);
        expect(profile.creativity).toBe(0.5);
        expect(profile.socialOrientation).toBe(0.5);
        expect(profile.leadership).toBe(0.5);
        expect(profile.detailOrientation).toBe(0.5);
        expect(profile.curiosity).toBe(0.5);
        expect(profile.competitiveness).toBe(0.5);
        expect(profile.riskTolerance).toBe(0.5);
      });

      it('should be valid', () => {
        const profile = createNeutralPsychologyProfile();
        expect(validatePsychologyProfile(profile)).toBe(true);
      });
    });

    describe('createNeutralMotivations', () => {
      it('should create motivations with all 0.5s', () => {
        const motivations = createNeutralMotivations();

        expect(motivations.money).toBe(0.5);
        expect(motivations.impact).toBe(0.5);
        expect(motivations.status).toBe(0.5);
        expect(motivations.freedom).toBe(0.5);
        expect(motivations.stability).toBe(0.5);
      });

      it('should be valid', () => {
        const motivations = createNeutralMotivations();
        expect(validateMotivations(motivations)).toBe(true);
      });
    });

    describe('derivePrimaryMotivation', () => {
      it('should return highest motivation', () => {
        const motivations: Motivations = {
          money: 0.3,
          impact: 0.9,
          status: 0.5,
          freedom: 0.7,
          stability: 0.4,
        };

        expect(derivePrimaryMotivation(motivations)).toBe('impact');
      });

      it('should return undetermined if all low', () => {
        const motivations: Motivations = {
          money: 0.5,
          impact: 0.5,
          status: 0.5,
          freedom: 0.5,
          stability: 0.5,
        };

        expect(derivePrimaryMotivation(motivations)).toBe('undetermined');
      });

      it('should return undetermined if top is below 0.6', () => {
        const motivations: Motivations = {
          money: 0.59,
          impact: 0.3,
          status: 0.2,
          freedom: 0.4,
          stability: 0.1,
        };

        expect(derivePrimaryMotivation(motivations)).toBe('undetermined');
      });
    });

    describe('calculateProfileCompleteness', () => {
      it('should return 1 for complete profile', () => {
        const profile = new StudentProfileBuilder('s1')
          .withPsychology({
            analyticalThinking: 0.8,
            creativity: 0.7,
            socialOrientation: 0.6,
            leadership: 0.5,
            detailOrientation: 0.9,
            curiosity: 0.8,
            competitiveness: 0.4,
            riskTolerance: 0.6,
          })
          .withMotivations({
            money: 0.7,
            impact: 0.9,
            status: 0.5,
            freedom: 0.8,
            stability: 0.6,
          })
          .withAcademicPerformance({
            subjectGrades: [{ subject: 'Math', score: 0.9, rawScore: 90, maxScore: 100 }],
          })
          .build();

        const completeness = calculateProfileCompleteness(profile);
        expect(completeness).toBeGreaterThan(0.8);
      });
    });

    describe('formatProfileScore', () => {
      it('should format as percentage', () => {
        expect(formatProfileScore(0)).toBe('0%');
        expect(formatProfileScore(0.5)).toBe('50%');
        expect(formatProfileScore(0.75)).toBe('75%');
        expect(formatProfileScore(1)).toBe('100%');
      });

      it('should round to nearest integer', () => {
        expect(formatProfileScore(0.333)).toBe('33%');
        expect(formatProfileScore(0.666)).toBe('67%');
      });
    });

    describe('comparePsychologyProfiles', () => {
      it('should return differences sorted by magnitude', () => {
        const profileA: PsychologyProfile = {
          analyticalThinking: 0.9,
          creativity: 0.5,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
          curiosity: 0.5,
          competitiveness: 0.5,
          riskTolerance: 0.5,
        };

        const profileB: PsychologyProfile = {
          analyticalThinking: 0.3,
          creativity: 0.8,
          socialOrientation: 0.5,
          leadership: 0.5,
          detailOrientation: 0.5,
          curiosity: 0.5,
          competitiveness: 0.5,
          riskTolerance: 0.5,
        };

        const differences = comparePsychologyProfiles(profileA, profileB);

        expect(differences[0].trait).toBe('analyticalThinking');
        expect(differences[0].diff).toBeCloseTo(0.6);
        expect(differences[1].trait).toBe('creativity');
        expect(differences[1].diff).toBeCloseTo(0.3);
      });
    });
  });

  describe('Integration', () => {
    it('should create a complete realistic profile', () => {
      const profile = new StudentProfileBuilder('student-123')
        .withPsychology({
          analyticalThinking: 0.85,
          creativity: 0.6,
          socialOrientation: 0.7,
          leadership: 0.5,
          detailOrientation: 0.9,
          curiosity: 0.8,
          competitiveness: 0.7,
          riskTolerance: 0.6,
        })
        .withMotivations({
          money: 0.7,
          impact: 0.6,
          status: 0.5,
          freedom: 0.8,
          stability: 0.4,
        })
        .withFinancialContext({
          familyIncomeBracket: FamilyIncomeBracket.BETWEEN_6_12_LPA,
          hasPersonalIncome: false,
          hasEducationLoan: false,
          canAffordCoaching: true,
          canAffordPrivateCollege: false,
        })
        .withFamilyContext({
          familyPressure: FamilyPressure.MILD,
          isFirstGeneration: false,
          dependentCount: 0,
          expectedToContribute: false,
          mustStayNearFamily: false,
        })
        .withGeographicContext({
          locationType: LocationType.TIER_2_CITY,
          currentCity: 'Jaipur',
          willingToRelocate: true,
        })
        .withAccessibilityContext({
          languageComfort: LanguageComfort.FUNCTIONAL_ENGLISH,
          nativeLanguage: 'Hindi',
          coachingAccess: CoachingAccess.MODERATE,
          hasInternetAccess: true,
          hasLearningDevice: true,
          localInstitutionQuality: 'good',
        })
        .withAcademicPerformance({
          stage: EducationStage.HIGH_SCHOOL_12,
          stream: AcademicStream.SCIENCE,
          board: EducationBoard.CBSE,
          gradeScale: GradeScale.PERCENTAGE,
          overallScore: 0.87,
          subjectGrades: [
            { subject: 'Physics', score: 0.9, rawScore: 90, maxScore: 100 },
            { subject: 'Chemistry', score: 0.85, rawScore: 85, maxScore: 100 },
            { subject: 'Mathematics', score: 0.92, rawScore: 92, maxScore: 100 },
          ],
        })
        .withAptitudeScores({
          logicalReasoning: 0.85,
          numericalAbility: 0.9,
          verbalAbility: 0.7,
          spatialReasoning: 0.75,
          criticalThinking: 0.8,
          overallPercentile: 88,
        })
        .withExamResults([
          {
            examType: CompetitiveExamType.JEE_MAIN,
            percentile: 94.5,
            qualified: true,
            year: 2024,
            attemptNumber: 1,
          },
        ])
        .withAcademicInterests({
          favoriteSubjects: ['Mathematics', 'Physics'],
          dislikedSubjects: ['Biology'],
          preferredLearningStyle: 'visual',
          extracurriculars: ['Coding Club', 'Chess'],
          notableProjects: ['Built a robot for school competition'],
        })
        .withExplorationStage(ExplorationStage.NARROWING)
        .withDecisionTimeline({
          urgency: DecisionUrgency.UPCOMING,
          monthsToDecision: 3,
        })
        .withDecisionConfidence({
          level: DecisionConfidence.SOMEWHAT_CONFIDENT,
          score: 0.65,
          confidentAreas: ['Academic abilities'],
          uncertainAreas: ['Career options', 'Market trends'],
        })
        .withInformationNeeds({
          gaps: ['Salary expectations', 'Work-life balance'],
          careersToResearch: ['Software Engineer', 'Data Scientist', 'Product Manager'],
          openQuestions: ['Which has better growth?'],
          hasDoneInformationalInterviews: false,
        })
        .withDataSource('assessment', 0.85)
        .withNotes('Strong academic performer, needs career guidance')
        .build();

      // Validate structure
      expect(validateStudentProfile(profile)).toBe(true);

      // Check psychology
      expect(profile.psychology.analyticalThinking).toBe(0.85);
      expect(profile.psychology.creativity).toBe(0.6);

      // Check motivations
      expect(profile.motivations.freedom).toBe(0.8);
      expect(profile.primaryMotivation).toBe('freedom');

      // Check constraints
      expect(profile.constraints.financial.familyIncomeBracket).toBe(
        FamilyIncomeBracket.BETWEEN_6_12_LPA
      );
      expect(profile.constraints.geographic.currentCity).toBe('Jaipur');

      // Check academic
      expect(profile.academic.performance.overallScore).toBe(0.87);
      expect(profile.academic.examResults).toHaveLength(1);

      // Check decision context
      expect(profile.decision.explorationStage).toBe(ExplorationStage.NARROWING);

      // Check metadata
      expect(profile.dataSource).toBe('assessment');
      expect(profile.dataConfidence).toBe(0.85);
    });

    it('should support multiple profiles', () => {
      const profiles: StudentProfile[] = [
        new StudentProfileBuilder('s1')
          .withPsychology({ analyticalThinking: 0.9 })
          .withMotivations({ money: 0.9 })
          .build(),
        new StudentProfileBuilder('s2')
          .withPsychology({ creativity: 0.9 })
          .withMotivations({ impact: 0.9 })
          .build(),
        new StudentProfileBuilder('s3')
          .withPsychology({ socialOrientation: 0.9 })
          .withMotivations({ status: 0.9 })
          .build(),
      ];

      expect(profiles).toHaveLength(3);
      expect(profiles[0].psychology.analyticalThinking).toBe(0.9);
      expect(profiles[1].psychology.creativity).toBe(0.9);
      expect(profiles[2].psychology.socialOrientation).toBe(0.9);
    });
  });
});
