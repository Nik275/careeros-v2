import { CAREER_FIT_ROUTE_SHADOW_PATH } from '../../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowSyntheticPayloads';
import { handleSecuredRouteShadowPost } from '../route-shadow-security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  return handleSecuredRouteShadowPost(request, 'career-fit', CAREER_FIT_ROUTE_SHADOW_PATH);
}
