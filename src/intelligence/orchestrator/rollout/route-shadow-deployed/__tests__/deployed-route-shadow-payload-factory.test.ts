import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowApproval } from '../DeployedRouteShadowApprovalFactory';
import { createSyntheticAssessmentDeployedRequest, createSyntheticCareerFitDeployedRequest } from '../DeployedRouteShadowPayloadFactory';

describe('DeployedRouteShadowPayloadFactory', () => {
  it('creates synthetic deployed payloads without raw student data', () => {
    const approval = createDeployedRouteShadowApproval({
      approvedBy: 'phase-6-3-test',
      environment: 'staging',
      baseUrl: 'https://preview-careeros-staging.vercel.app',
      allowedHosts: ['preview-careeros-staging.vercel.app'],
      allowedRoutes: ['/api/internal/constitutional-shadow/assessment', '/api/internal/constitutional-shadow/career-fit'],
      allowedFlows: ['assessment', 'career-fit'],
      maxRequests: 2,
      reason: 'Payload factory test.',
      productionSafetyAcknowledgement: 'Production output remains authoritative.',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
    const assessment = createSyntheticAssessmentDeployedRequest({ approval });
    const careerFit = createSyntheticCareerFitDeployedRequest({ approval });

    expect(JSON.stringify(assessment)).toContain('"routeShadowDeployedPilot":true');
    expect(JSON.stringify(careerFit)).toContain('"synthetic":true');
    expect(JSON.stringify(assessment)).not.toMatch(/"(rawStudentData|realStudentData)"\s*:\s*true|studentEmail|ssn/i);
  });
});

