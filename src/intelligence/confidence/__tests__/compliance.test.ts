/**
 * CareerOS Confidence Compliance Tests
 * 
 * Tests for constitutional compliance enforcement.
 * 
 * @module confidence/__tests__
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Constitutional Compliance', () => {
  const confidenceDir = path.join(__dirname, '..');

  describe('Confidence Authority Structure', () => {
    it('should have ConfidenceAuthority.ts', () => {
      const file = path.join(confidenceDir, 'ConfidenceAuthority.ts');
      expect(fs.existsSync(file)).toBe(true);
    });

    it('should have IConfidenceAuthority.ts', () => {
      const file = path.join(confidenceDir, 'IConfidenceAuthority.ts');
      expect(fs.existsSync(file)).toBe(true);
    });

    it('should have ConfidenceTypes.ts', () => {
      const file = path.join(confidenceDir, 'ConfidenceTypes.ts');
      expect(fs.existsSync(file)).toBe(true);
    });

    it('should have index.ts with exports', () => {
      const file = path.join(confidenceDir, 'index.ts');
      expect(fs.existsSync(file)).toBe(true);
      
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).toContain('export');
      expect(content).toContain('ConfidenceAuthority');
    });
  });

  describe('Unified Confidence Model', () => {
    it('should export Confidence type as number', () => {
      const typesFile = path.join(confidenceDir, 'ConfidenceTypes.ts');
      const content = fs.readFileSync(typesFile, 'utf-8');
      
      // Should have Confidence = number
      expect(content).toMatch(/type\s+Confidence\s*=\s*number/);
    });

    it('should have validation function', () => {
      const typesFile = path.join(confidenceDir, 'ConfidenceTypes.ts');
      const content = fs.readFileSync(typesFile, 'utf-8');
      
      expect(content).toContain('validateConfidence');
    });

    it('should have migration function for legacy values', () => {
      const typesFile = path.join(confidenceDir, 'ConfidenceTypes.ts');
      const content = fs.readFileSync(typesFile, 'utf-8');
      
      expect(content).toContain('migrateLegacyConfidence');
    });
  });

  describe('Core Components', () => {
    const components = [
      'ConfidenceCalculator',
      'ConfidenceAggregator',
      'ConfidenceCalibration',
      'ConfidenceHistory',
      'ConfidenceMonitoring',
    ];

    for (const component of components) {
      it(`should have ${component}.ts`, () => {
        const file = path.join(confidenceDir, `${component}.ts`);
        expect(fs.existsSync(file)).toBe(true);
      });
    }
  });

  describe('Domain Modules (Deprecated)', () => {
    const modules = [
      'CareerConfidenceModule',
      'ArchetypeConfidenceModule',
      'DecisionConfidenceModule',
      'MarketConfidenceModule',
    ];

    for (const module of modules) {
      it(`should have deprecated ${module}`, () => {
        const file = path.join(confidenceDir, 'modules', `${module}.ts`);
        expect(fs.existsSync(file)).toBe(true);
        
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).toContain('@deprecated');
      });
    }
  });

  describe('Compliance Checker', () => {
    it('should have compliance checker script', () => {
      const file = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'scripts',
        'constitutional',
        'check-confidence-compliance.ts'
      );
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
