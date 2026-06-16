import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createEncryptedStore,
  createInMemoryStore,
  createInitialGrowthProfile,
  createLocalStorageStore,
  isDemoOutcomeEncryptionAllowed,
  isLocalOutcomeBrowserPersistenceAllowed,
  type OutcomeRecordId,
  type StudentId,
  type StudentOutcomeRecord,
} from '../index';

describe('outcome storage security gates', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('blocks localStorage outcome persistence outside local/test mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const store = createLocalStorageStore('security-test:');

    await expect(store.save(createOutcomeRecord())).rejects.toThrow(/localStorage persistence is disabled/);
    expect(localStorage.length).toBe(0);
  });

  it('allows localStorage outcome persistence only when explicitly supplied in tests', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const store = createLocalStorageStore('security-test:', { allowPersistence: true });
    const record = createOutcomeRecord();

    await store.save(record);
    await expect(store.load(record.id)).resolves.toMatchObject({ id: record.id });
  });

  it('hard-disables demo XOR encryption outside local/test mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => createEncryptedStore(createInMemoryStore(), 'demo-key')).toThrow(/Demo XOR outcome encryption is disabled/);
  });

  it('keeps explicit security gates false for production-like environments', () => {
    expect(isLocalOutcomeBrowserPersistenceAllowed({ NODE_ENV: 'production' })).toBe(false);
    expect(isDemoOutcomeEncryptionAllowed({ NODE_ENV: 'production' })).toBe(false);
  });
});

function createOutcomeRecord(): StudentOutcomeRecord {
  const studentId = 'student-security-1' as StudentId;
  const now = Date.now();
  const baseline: StudentOutcomeRecord['baseline'] = {
    timestamp: now,
    belief: createStudentBelief(studentId, now),
    dimensions: new Map([
      ['analytical', { dimension: 'analytical', score: 70, confidence: 90, signalCount: 1 }],
      ['creative', { dimension: 'creative', score: 60, confidence: 90, signalCount: 1 }],
    ]),
    recommendations: [],
    confidence: 65,
    clarity: 60,
    wellbeing: 70,
  };

  return {
    id: 'outcome-security-1' as OutcomeRecordId,
    studentId,
    createdAt: now,
    updatedAt: now,
    status: 'ACTIVE',
    baseline,
    outcomes: {
      careerDecisions: [],
      education: [],
      colleges: [],
      skills: [],
      internships: [],
      jobs: [],
      explorations: [],
    },
    psychological: {
      confidence: {
        baseline: 65,
        measurements: [],
        trend: 'STABLE',
        growthRate: 0,
        keyDrivers: [],
        inhibitors: [],
      },
      clarity: {
        baseline: 60,
        measurements: [],
        trend: 'STABLE',
        growthRate: 0,
        decisionClarity: 60,
        pathClarity: 60,
      },
      wellbeing: {
        baseline: 70,
        measurements: [],
        trend: 'STABLE',
        stressEvents: [],
        supportSystemEffectiveness: 70,
      },
    },
    growth: {
      profile: createInitialGrowthProfile(studentId),
      snapshots: [],
    },
    timeline: [],
    predictions: [],
    comparisons: [],
    recommendationAccuracy: [],
    qualityAssessments: [],
    metadata: {
      dataQuality: 100,
      completeness: 100,
      lastMeasurement: now,
      version: 1,
    },
  };
}

function createStudentBelief(studentId: StudentId, timestamp: number): StudentOutcomeRecord['baseline']['belief'] {
  return {
    id: 'belief-security-1',
    studentId,
    version: 3,
    timestamp,
    motivations: [],
    strengths: [],
    values: [],
    personalityTraits: [],
    lifestylePreferences: [],
    constraints: [],
    familyReality: {},
    economicReality: {},
    educationalReality: {},
    decisionState: {},
    overallConfidence: 0.8,
    isValidated: true,
    metadata: {
      assessmentQuestionCount: 0,
      inferenceStepCount: 0,
      contributingEngines: [],
      assessmentDuration: 0,
    },
  } as unknown as StudentOutcomeRecord['baseline']['belief'];
}
