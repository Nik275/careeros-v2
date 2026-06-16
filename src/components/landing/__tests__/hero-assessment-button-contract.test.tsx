import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  HERO_ASSESSMENT_ROUTE,
  HeroAssessmentButton,
} from '@/components/landing/HeroAssessmentButton';

describe('HeroAssessmentButton contract', () => {
  it('imports the named component successfully', () => {
    expect(typeof HeroAssessmentButton).toBe('function');
  });

  it('renders a visible call-to-action', () => {
    const html = renderToStaticMarkup(<HeroAssessmentButton />);

    expect(html).toContain('START CAREER CLARITY');
    expect(html).toContain('Start CareerOS assessment');
  });

  it('links to the canonical assessment route', () => {
    const html = renderToStaticMarkup(<HeroAssessmentButton />);

    expect(HERO_ASSESSMENT_ROUTE).toBe('/assessment');
    expect(html).toContain('href="/assessment"');
  });

  it('does not expose live routing, raw capture, or output replacement controls', async () => {
    const componentModule = await import('@/components/landing/HeroAssessmentButton');
    const exportedNames = Object.keys(componentModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });

  it('allows the landing page module to import successfully', async () => {
    const landingPageModule = await import('@/app/page');

    expect(typeof landingPageModule.default).toBe('function');
  });
});
